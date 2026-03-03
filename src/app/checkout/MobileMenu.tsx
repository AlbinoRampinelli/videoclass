"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botão Hambúrguer */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-5 left-5 z-50 bg-[#81FE88] text-black p-3 rounded-full"
      >
        ☰
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <button
            onClick={() => setOpen(false)}
            className="text-white text-xl mb-8"
          >
            ✕
          </button>

          <nav className="flex flex-col gap-6 text-white font-bold uppercase">
            <Link href="/vitrine" onClick={() => setOpen(false)}>
              Vitrine
            </Link>
            <Link href="/checkout" onClick={() => setOpen(false)}>
              Checkout
            </Link>
            <Link href="/" onClick={() => setOpen(false)}>
              Home
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}