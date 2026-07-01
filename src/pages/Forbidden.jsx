import React from 'react';
import { Link } from 'react-router-dom';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center p-8 rounded-2xl bg-card border border-border">
        <h1 className="text-6xl font-light text-slate-300 mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-2">Unauthorized</h2>
        <p className="text-sm text-muted-foreground mb-4">You do not have permission to view this page.</p>
        <p className="text-sm text-muted-foreground mb-6">If you believe you should have access, request admin approval and we'll review your account.</p>

        <div className="flex items-center justify-center gap-3 flex-col sm:flex-row">
          <a
            href="mailto:support@emaxinvest.com?subject=Request%20Admin%20Access%20-%20EMAXINVEST&body=Hi%20team%2C%0A%0AI%20would%20like%20to%20request%20admin%20access%20for%20my%20account.%20Please%20advise%20the%20next%20steps.%0A%0AAccount%20email%3A%20%5Byour%20email%20here%5D%0A%0AThanks%2C"
            className="px-4 py-2 rounded-lg bg-gradient-to-br from-blue-400 to-sky-400 text-slate-900 font-semibold hover:opacity-95"
          >
            Request Access
          </a>

          <Link to="/" className="px-4 py-2 rounded-lg bg-secondary hover:opacity-90">Go Home</Link>
        </div>
      </div>
    </div>
  );
}
