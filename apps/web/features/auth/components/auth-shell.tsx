'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface AuthShellProps {
  title: string;
  description: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function AuthShell({
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-6">
      <div className="absolute left-0 top-0 h-full w-full opacity-30">
        <div className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-violet-500/20 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md"
      >
        <div className="auth-card rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mb-4 inline-block rounded-2xl bg-blue-500/10 p-1"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-xl shadow-lg shadow-blue-500/20">
                <Image
                  src="/assets/logo8.jpg"
                  alt="Rotta Logo"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
            <h1 className="mb-2 text-3xl font-bold text-white">{title}</h1>
            <p className="text-balance text-slate-400">{description}</p>
          </div>

          {children}

          {footer ? (
            <div className="mt-12 border-t border-white/5 pt-8 text-sm">{footer}</div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
