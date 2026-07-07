import { createClient } from '@supabase/supabase-js';

// Initialize Supabase using client environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const throwIfError = (error) => {
  if (error) {
    throw error;
  }
};

const ORDER_FALLBACK_COLUMNS = ['created_date', 'created_at', 'inserted_at', 'createdon'];

const isMissingColumnError = (error) => {
  const message = `${error?.message || ''}`.toLowerCase();
  return message.includes('column') && message.includes('does not exist');
};

const runOrderedQuery = async ({ buildQuery, order, limit }) => {
  const explicitColumn = order ? order.replace(/^-/, '') : null;
  const ascending = !(order && order.startsWith('-'));
  const orderedColumns = explicitColumn
    ? [explicitColumn, ...ORDER_FALLBACK_COLUMNS.filter((col) => col !== explicitColumn)]
    : ORDER_FALLBACK_COLUMNS;

  let lastMissingColumnError = null;

  for (const column of orderedColumns) {
    let query = buildQuery();
    query = query.order(column, { ascending });
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (!error) {
      return data || [];
    }

    if (isMissingColumnError(error)) {
      lastMissingColumnError = error;
      continue;
    }

    throw error;
  }

  if (lastMissingColumnError) {
    throw lastMissingColumnError;
  }

  let fallbackQuery = buildQuery();
  if (limit) {
    fallbackQuery = fallbackQuery.limit(limit);
  }
  const { data, error } = await fallbackQuery;
  throwIfError(error);
  return data || [];
};

const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') {
    return 'user';
  }
  const normalized = role.toLowerCase().trim();
  if (normalized.includes('admin')) {
    return 'admin';
  }
  return normalized;
};

export const isAdminUser = (user) => {
  if (!user) {
    return false;
  }

  const roleCandidates = [
    user.role,
    user.user_role,
    user.account_role,
    user.app_metadata?.role,
    user.app_metadata?.user_role,
    user.app_metadata?.account_role,
    user.user_metadata?.role,
    user.user_metadata?.user_role,
    user.user_metadata?.account_role,
    user.raw_app_meta_data?.role,
    user.raw_app_meta_data?.user_role,
    user.raw_user_meta_data?.role,
    user.raw_user_meta_data?.user_role,
  ].filter(Boolean);

  const hasAdminRole = roleCandidates.some((candidate) => normalizeRole(candidate) === 'admin');
  if (hasAdminRole) {
    return true;
  }

  return !!(
    user.is_admin ||
    user.app_metadata?.is_admin ||
    user.user_metadata?.is_admin ||
    user.raw_app_meta_data?.is_admin ||
    user.raw_user_meta_data?.is_admin
  );
};

export const normalizeAuthUser = (user) => {
  if (!user) {
    return null;
  }

  const resolvedRole =
    user.role ||
    user.user_role ||
    user.account_role ||
    user.app_metadata?.role ||
    user.app_metadata?.user_role ||
    user.app_metadata?.account_role ||
    user.user_metadata?.role ||
    user.user_metadata?.user_role ||
    user.user_metadata?.account_role ||
    user.raw_app_meta_data?.role ||
    user.raw_app_meta_data?.user_role ||
    user.raw_user_meta_data?.role ||
    user.raw_user_meta_data?.user_role ||
    (user.app_metadata?.is_admin ? 'admin' : null) ||
    (user.user_metadata?.is_admin ? 'admin' : null);

  return {
    ...user,
    role: normalizeRole(resolvedRole),
  };
};

export const base44 = {
  auth: {
    me: async () => {
      const { data, error } = await supabase.auth.getUser();
      throwIfError(error);

      const normalizedUser = normalizeAuthUser(data?.user || null);
      if (!normalizedUser) {
        return null;
      }

      if (normalizedUser.role !== 'admin') {
        const { data: profiles, error: profileError } = await supabase
          .from('UserProfile')
          .select('*')
          .eq('user_id', normalizedUser.id)
          .limit(1);

        if (!profileError && profiles?.[0]?.role) {
          return {
            ...normalizedUser,
            role: normalizeRole(profiles[0].role),
          };
        }
      }

      return normalizedUser;
    },

    loginViaEmailPassword: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      throwIfError(error);
      return data;
    },

    loginWithProvider: async (provider, redirectTo) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });
      throwIfError(error);
      return data;
    },

    register: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      throwIfError(error);
      return data;
    },

    logout: async (redirectUrl) => {
      const { error } = await supabase.auth.signOut();
      throwIfError(error);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },

    resetPasswordRequest: async (email, redirectTo) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      throwIfError(error);
      return data;
    },

    resetPassword: async (token, newPassword) => {
      const { data, error } = await supabase.auth.verifyOtp({
        type: 'recovery',
        token,
        password: newPassword,
      });
      throwIfError(error);
      return data;
    },
  },
  entities: {
    UserProfile: {
      filter: async (match) => {
        const { data, error } = await supabase.from('UserProfile').select('*').match(match);
        throwIfError(error);
        return data || [];
      },
      list: async (order, limit) => {
        return runOrderedQuery({
          buildQuery: () => supabase.from('UserProfile').select('*'),
          order,
          limit,
        });
      },
      create: async (payload) => {
        const { data, error } = await supabase.from('UserProfile').insert([payload]).select();
        throwIfError(error);
        return data?.[0];
      },
      update: async (id, payload) => {
        const { data, error } = await supabase.from('UserProfile').update(payload).eq('id', id).select();
        throwIfError(error);
        return data?.[0];
      },
    },
    Investment: {
      filter: async (match) => {
        const { data, error } = await supabase.from('Investment').select('*').match(match);
        throwIfError(error);
        return data || [];
      },
      list: async (order, limit) => {
        return runOrderedQuery({
          buildQuery: () => supabase.from('Investment').select('*'),
          order,
          limit,
        });
      },
      create: async (payload) => {
        const { data, error } = await supabase.from('Investment').insert([payload]).select();
        throwIfError(error);
        return data?.[0];
      },
      update: async (id, payload) => {
        const { data, error } = await supabase.from('Investment').update(payload).eq('id', id).select();
        throwIfError(error);
        return data?.[0];
      },
    },
    Transaction: {
      filter: async (match, order, limit) => {
        return runOrderedQuery({
          buildQuery: () => supabase.from('Transaction').select('*').match(match),
          order,
          limit,
        });
      },
      create: async (payload) => {
        const { data, error } = await supabase.from('Transaction').insert([payload]).select();
        throwIfError(error);
        return data?.[0];
      },
    },
    WithdrawalRequest: {
      filter: async (match, order, limit) => {
        return runOrderedQuery({
          buildQuery: () => supabase.from('WithdrawalRequest').select('*').match(match),
          order,
          limit,
        });
      },
      list: async (order, limit) => {
        return runOrderedQuery({
          buildQuery: () => supabase.from('WithdrawalRequest').select('*'),
          order,
          limit,
        });
      },
      create: async (payload) => {
        const { data, error } = await supabase.from('WithdrawalRequest').insert([payload]).select();
        throwIfError(error);
        return data?.[0];
      },
      update: async (id, payload) => {
        const { data, error } = await supabase.from('WithdrawalRequest').update(payload).eq('id', id).select();
        throwIfError(error);
        return data?.[0];
      },
    },
    PaymentSettings: {
      list: async () => {
        const { data, error } = await supabase.from('PaymentSettings').select('*');
        throwIfError(error);
        return data || [];
      },
      update: async (id, payload) => {
        const { data, error } = await supabase.from('PaymentSettings').update(payload).eq('id', id).select();
        throwIfError(error);
        return data?.[0];
      },
    },
    integrations: {
      Core: {
        UploadFile: async ({ file }) => {
          return { file_url: 'https://placehold.co' };
        },
      },
    },
  },
};
