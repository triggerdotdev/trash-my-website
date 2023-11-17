import Link from "next/link";
import React from "react";
import { TriggerLogo } from "./TriggerLogo";
import { Logo } from "./Logo";

function Header() {
  return (
    <header className="w-screen h-14 border-b border-slate-800 backdrop-blur-sm fixed top-0 z-10 bg-midnight-900/50">
      <div className="flex items-center justify-between h-full px-3 text-midnight-400">
        <div className="flex items-baseline gap-2">
          <Link href="/">
            <Logo className="text-2xl" />
          </Link>
          <div className="text-xs flex items-center gap-1">
            by
            <Link href="https://trigger.dev" target="_blank">
              <TriggerLogo className="h-4 hover:text-[#E7FF52] transition" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
