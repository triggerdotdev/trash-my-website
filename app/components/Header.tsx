import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";
import { TriggerLogo } from "./TriggerLogo";

function Header() {
  return (
    <header className="w-screen h-20 border-b border-slate-800 fixed top-0 z-10 bg-midnight-900">
      <div className="flex items-center justify-between h-full px-12">
        <div className="flex items-baseline gap-2 text-midnight-400">
          <h1 className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            LandingPageCopyGenerator
          </h1>
          <div className="text-xs flex items-center gap-1">
            by
            <Link href="https://trigger.dev" target="_blank">
              <TriggerLogo className="h-4" />
            </Link>
          </div>
        </div>
        <Link
          href="https://github.com/rubriclab/trigger-ai-copy"
          target="_blank"
        >
          <GitHubLogoIcon className="w-6 h-6" />
        </Link>
      </div>
    </header>
  );
}

export default Header;
