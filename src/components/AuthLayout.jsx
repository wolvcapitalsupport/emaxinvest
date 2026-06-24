import React from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 gold-gradient rounded-xl flex items-center justify-center">
              <span className="text-sm font-bold text-black">E</span>
            </div>
            <span className="text-2xl font-display font-bold gold-text">EMAX</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl border border-border p-8 card-glow">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link to="/" className="hover:text-primary transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}