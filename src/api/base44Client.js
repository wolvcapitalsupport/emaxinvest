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

export const base44 = {
  auth: {
    me: async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      throwIfError(error);
      return session?.user || null;
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
        let query = supabase.from('UserProfile').select('*');
        if (limit) query = query.limit(limit);
        const { data, error } = await query;
        throwIfError(error);
        return data || [];
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
        let query = supabase.from('Investment').select('*');
        if (limit) query = query.limit(limit);
        const { data, error } = await query;
        throwIfError(error);
        return data || [];
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
        let query = supabase.from('Transaction').select('*').match(match);
        if (order) {
          const isDesc = order.startsWith('-');
          query = query.order(order.replace(/^-/, ''), { ascending: !isDesc });
        }
        if (limit) query = query.limit(limit);
        const { data, error } = await query;
        throwIfError(error);
        return data || [];
      },
      create: async (payload) => {
        const { data, error } = await supabase.from('Transaction').insert([payload]).select();
        throwIfError(error);
        return data?.[0];
      },
    },
    WithdrawalRequest: {
      filter: async (match, order, limit) => {
        let query = supabase.from('WithdrawalRequest').select('*').match(match);
        if (order) {
          const isDesc = order.startsWith('-');
          query = query.order(order.replace(/^-/, ''), { ascending: !isDesc });
        }
        if (limit) query = query.limit(limit);
        const { data, error } = await query;
        throwIfError(error);
        return data || [];
      },
      list: async (order, limit) => {
        let query = supabase.from('WithdrawalRequest').select('*');
        if (order) {
          const isDesc = order.startsWith('-');
          query = query.order(order.replace(/^-/, ''), { ascending: !isDesc });
        }
        if (limit) query = query.limit(limit);
        const { data, error } = await query;
        throwIfError(error);
        return data || [];
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
