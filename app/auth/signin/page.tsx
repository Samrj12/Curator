"use client";

import React from "react";
import Image from "next/image";
import SignInButton from "@/components/SignInButton";
import { Sparkles } from "lucide-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] overflow-hidden relative flex flex-col items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-[var(--color-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Header Section */}

        {/* Card Container */}
        <div className="bg-white/80 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl shadow-2xl p-8 mb-8">
          <div className="space-y-6">
            {/* Features List */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl blur-xl opacity-40" />
                  <div className="relative bg-white p-3 rounded-2xl">
                    <Image
                      src="/logo.png"
                      width={56}
                      height={56}
                      alt="Curate Logo"
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                </div>
              </div>

              <h1 className="text-4xl font-medium mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-purple-500 to-secondary fill-none">
                  Curate
                </span>
              </h1>

              <p className="text-[var(--color-text-secondary)] text-lg">
                Craft your perfect resume in minutes
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-[var(--color-text-muted)]">
                  Get started
                </span>
              </div>
            </div>
            <SignInButton />
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <span className="text-sm text-[var(--color-text-secondary)]">{text}</span>
    </div>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white/60 backdrop-blur-md border border-[var(--color-border)] rounded-lg py-3 px-2">
      <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
        {number}
      </div>
      <div className="text-xs text-[var(--color-text-muted)] mt-1">{label}</div>
    </div>
  );
}

export default SignInPage;
