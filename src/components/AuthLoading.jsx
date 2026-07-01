import React from 'react';

export default function AuthLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
    </div>
  );
}
