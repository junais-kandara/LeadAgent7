'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('junais.kandara@leadagent7.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Smooth redirect to app home screen
    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white selection:bg-[#541C64] selection:text-white">
      {/* Left Banner: Deep Plum / Purple with LeadAgent7 Branding and Slogan */}
      <div className="relative w-full md:w-1/2 min-h-[340px] md:min-h-screen bg-gradient-to-br from-[#381144] via-[#4D165E] to-[#2B0A35] flex flex-col justify-between p-8 md:p-16 overflow-hidden text-white shadow-2xl">
        {/* Subtle celestial smoke/cloud texture overlays */}
        <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-400 via-transparent to-transparent"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-900/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-indigo-900/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Top-Left: Clean LeadAgent7 Brand Logo (Replaces old zaintech logo) */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm font-sans">
              Lead<span className="font-light tracking-wider">Agent</span><span className="text-cyan-400 font-black">7</span>
            </span>
          </Link>
          <div className="text-[11px] uppercase tracking-widest text-purple-200/70 font-semibold mt-1">
            Enterprise Intelligence & CRM
          </div>
        </div>
      </div>

      {/* Right Side: Clean White Sign-in Interface */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-16 bg-white min-h-[500px]">
        <div className="w-full max-w-sm flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field with Light Blue-Gray Background as seen in photo */}
            <div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full px-3 py-2 text-sm text-slate-800 bg-[#EAF2F9] border border-[#CCDCEB] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#541C64] focus:border-[#541C64] transition-colors"
              />
            </div>

            {/* Password Field with Light Blue-Gray Background as seen in photo */}
            <div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="w-full px-3 py-2 text-sm text-slate-800 bg-[#EAF2F9] border border-[#CCDCEB] rounded-sm focus:outline-none focus:ring-1 focus:ring-[#541C64] focus:border-[#541C64] transition-colors"
              />
            </div>

            {/* Sign in Button in Deep Royal Plum (#541C64) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#541C64] hover:bg-[#431451] active:bg-[#340E3F] text-white font-medium text-sm rounded-sm shadow-sm transition-all duration-150 flex items-center justify-center cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Signing in...</span>
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            {/* Links below: Forgot password? and Sign up */}
            <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => alert('Password reset link sent to your email.')}
                className="hover:text-slate-800 hover:underline transition-colors"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => alert('Registration requested. Contact your LeadAgent7 administrator for workspace invite.')}
                className="hover:text-slate-800 hover:underline transition-colors font-medium"
              >
                Sign up
              </button>
            </div>
          </form>

          {/* Quick Demo Hint */}
          <div className="mt-8 text-center">
            <span className="text-[11px] text-slate-400">
              Demo workspace access configured • Click Sign in to enter
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
