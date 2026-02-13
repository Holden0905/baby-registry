"use client";

import Image from "next/image";
import Link from "next/link";

export function AppNav() {
  return (
    <nav className="border-b border-slate-200 bg-slate-800 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white hover:text-slate-200 transition-colors"
        >
          <Image
            src="/stepan-logo.png"
            alt="Stepan"
            width={36}
            height={36}
            className="rounded shrink-0"
          />
          Compliance Registry
        </Link>
        <div className="flex gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-200 hover:text-white transition-colors"
          >
            Sites
          </Link>
          <Link
            href="/equipment"
            className="text-sm font-medium text-slate-200 hover:text-white transition-colors"
          >
            Equipment
          </Link>
          <Link
            href="/tasks"
            className="text-sm font-medium text-slate-200 hover:text-white transition-colors"
          >
            Tasks
          </Link>
          <Link
            href="/users"
            className="text-sm font-medium text-slate-200 hover:text-white transition-colors"
          >
            Users
          </Link>
        </div>
      </div>
    </nav>
  );
}
