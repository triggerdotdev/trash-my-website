import Link from "next/link";
import React from "react";
import { Button } from "./Button";
import { ArrowRightIcon } from "@radix-ui/react-icons";

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-screen py-4 sm:border-t border-0 border bg-background border-slate-800">
      <div className="flex flex-col sm:flex-row gap-y-4 items-center sm:items-end lg:items-center justify-between h-full pl-4 pr-3 text-dimmed text-sm">
        <div className="flex-col w-full lg:flex-row sm:items-baseline gap-0 sm:gap-2 hidden sm:flex">
          <p className="text-xs sm:text-sm">
            This site is powered by{" "}
            <Link
              href="https://trigger.dev"
              target="_blank"
              className="hover:text-indigo-500 text-primary font-normal"
            >
              Trigger.dev
            </Link>
            , the open source background jobs framework.
          </p>
        </div>
        <Link
          href="https://trigger.dev/blog/trash-my-site-ai/"
          target="_blank"
          className="w-full sm:w-fit"
        >
          <Button
            variant="secondary"
            size="sm"
            className="group text-dimmed font-normal whitespace-nowrap w-full sm:w-fit"
          >
            Learn how it’s made
            <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
          </Button>
        </Link>
      </div>
    </footer>
  );
};
