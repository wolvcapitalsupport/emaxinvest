import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageSquare, Clock, ChevronRight, Zap, Send } from "lucide-react";

const NavLinks = () => (
  <div className="flex items-center gap-6">
    <div className="hidden md:flex items-center gap-1">
      <Link to="/about" className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-2 font-body">About</Link>
      <Link to="/how-it-works" className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-2 font-body">How It Works</Link>
      <Link to="/faq" className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-2 font-body">FAQ</Link>
      <Link to="/contact" className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-2 font-body">Contact</Link>
    </div>
    <div className="flex items-center gap-3">
      <Link to="/login" className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-4 py-2 font-body">Sign In</Link>
      <Link to="/register" className="text-sm font-semibold px-5 py-2.5 rounded-lg text-slate-900 transition-all hover:opacity-90 hover:scale-105 active:scale-95 font-body" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)" }}>Get Started</Link>
    </div>
  </div>
);

const Footer = () => (
  <footer className="py-10 px-4 sm:px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(147, 197, 253, 0.15)", border: "1px solid rgba(147, 197, 253, 0.3)" }}>
            <span className="text-xs font-bold text-blue-200">E</span>
          </div>
          <span className="font-bold text-white font-body">EMAX</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/about" className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-body">About</Link>
          <Link to="/how-it-works" className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-body">How It Works</Link>
          <Link to="/faq" className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-body">FAQ</Link>
          <Link to="/contact" className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-body">Contact</Link>
        </div>
      </div>
      <p className="text-xs text-slate-600 font-body text-center sm:text-left">© 2024 EMAX Investment Platform. All rights reserved.</p>
    </div>
  </footer>
);

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    setSent(true);
  };

  return (
    <div className="min-h-screen text-foreground" style={{ background: "hsl(230, 25%, 4%)" }}>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md" style={{ background: "rgba(8, 9, 14, 0.85)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(147, 197, 253, 0.15)", border: "1px solid rgba(147, 197, 253, 0.3)" }}>
              <span className="text-sm font-bold text-blue-200">E</span>
            </div>
            <span className="text-xl font-bold tracking-wide text-white font-body">EMAX</span>
          </Link>
          <NavLinks />
        </div>
      </nav>

      <section className="pt-36 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(147, 197, 253, 0.05) 0%, transparent 70%)" }} />
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full mb-8 font-body" style={{ background: "rgba(147, 197, 253, 0.08)", border: "1px solid rgba(147, 197, 253, 0.18)", color: "#93C5FD" }}>
            <Zap size={11} /> Get In Touch
          </div>
          <h1 className="text-5xl sm:text-6xl font-display font-bold leading-tight mb-6 text-white">
            Contact<br /><span style={{ color: "#93C5FD" }}>Our Team</span>
          </h1>
          <p className="text-base text-slate-400 leading-relaxed font-body">
            Have a question or need support? We're here to help. Send us a message and we'll get back to you within 24 hours.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            {[
              { icon: Mail, title: "Email Us", desc: "support@emaxinvest.com", sub: "We reply within 24 hours" },
              { icon: MessageSquare, title: "Live Chat", desc: "Available on dashboard", sub: "For registered investors" },
              { icon: Clock, title: "Support Hours", desc: "Mon – Fri, 9am – 6pm UTC", sub: "Weekend support available" },
            ].map(item => (
              <div key={item.title} className="flex gap-4 p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(147, 197, 253, 0.1)", border: "1px solid rgba(147, 197, 253, 0.2)" }}>
                  <item.icon size={16} style={{ color: "#93C5FD" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white font-body">{item.title}</p>
                  <p className="text-sm text-slate-300 font-body">{item.desc}</p>
                  <p className="text-xs text-slate-500 font-body mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 p-7 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(147, 197, 253, 0.1)", border: "1px solid rgba(147, 197, 253, 0.25)" }}>
                  <Send size={22} style={{ color: "#93C5FD" }} />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">Message Sent</h3>
                <p className="text-sm text-slate-400 font-body">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-display font-bold text-white mb-5">Send a Message</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-body block mb-1.5">Full Name</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Smith" className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 outline-none font-body" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-body block mb-1.5">Email Address</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 outline-none font-body" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-body block mb-1.5">Subject</label>
                  <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 outline-none font-body" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-body block mb-1.5">Message</label>
                  <textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Write your message here..." className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 outline-none resize-none font-body" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
                <button onClick={handleSubmit} className="w-full py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-all font-body flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}>
                  Send Message <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
