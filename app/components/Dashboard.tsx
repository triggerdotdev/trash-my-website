/* eslint-disable @next/next/no-img-element */
"use client";

import { voices } from "@/app/constants";
import { Voice } from "@/app/types";
import { cn, copyToClipboard, validateUrl } from "@/app/utils";
import { CheckIcon, Cross1Icon, Share2Icon } from "@radix-ui/react-icons";
import { useEventRunStatuses } from "@trigger.dev/react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { callTrigger } from "../actions";
import { Button } from "./Button";
import Input from "./Input";
import { Slider } from "./Slider";
import { Spinner } from "./Spinner";

type Props = {
  existingResult?: {
    url?: string;
    voice?: Voice;
    remixedImageUrl?: string;
  };
  defaultUrl?: string;
};

function Dashboard({ existingResult, defaultUrl }: Props) {
  const [progress, setProgress] = useState(0);
  const [pageUrl, setPageUrl] = useState(existingResult?.url || "");
  const [eventId, setEventId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(
    existingResult?.voice || "pirate"
  );

  const { statuses, run } = useEventRunStatuses(eventId);

  const validUrl = validateUrl(pageUrl);

  const screenshotUrl = statuses?.find(({ key }) => key == "screenshot")?.data
    ?.url as string | undefined;

  // Allow screenshot URL to be passed from search params
  const remixedUrl = useMemo<string | undefined>(() => {
    if (run?.status === "SUCCESS") {
      return run?.output?.remixedUrl;
    }

    if (!loading && existingResult?.remixedImageUrl) {
      setProgress(1);
      return existingResult.remixedImageUrl;
    }
  }, [
    existingResult?.remixedImageUrl,
    loading,
    run?.output?.remixedUrl,
    run?.status,
  ]);

  const submit = useCallback(async () => {
    if (!validUrl) return;

    setEventId("");
    setLoading(true);
    setSubmitted(true);

    const res = await callTrigger({
      url: validUrl,
      voice: selectedVoice,
      id: uuid(),
    });

    setEventId(res.id);
  }, [validUrl, selectedVoice]);

  const messages =
    statuses?.flatMap((status) => ({
      key: status.key,
      label: status.label,
      state: status.state,
    })) ?? [];

  const copyLink = useCallback(() => {
    copyToClipboard(
      `${window.location.origin}/${encodeURIComponent(
        pageUrl
      )}/${selectedVoice}`
    );

    toast.success("Link copied to clipboard");
  }, [pageUrl, selectedVoice]);

  const runInProgress = run?.status !== "SUCCESS" && run?.status !== "FAILURE";
  const error =
    run?.status === "FAILURE"
      ? "message" in run?.output
        ? run.output.message
        : JSON.stringify(run.output)
      : undefined;

  useEffect(() => {
    switch (run?.status) {
      case "FAILURE":
        setProgress(1);
        setLoading(false);
        break;
      case "SUCCESS":
        setProgress(1);
        setLoading(false);
        break;
      case "STARTED":
        setProgress(0);
        setLoading(true);
        break;
    }
  }, [run?.status]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="w-full max-w-7xl h-full flex flex-col grow px-4 lg:p-12 pb-20 lg:pb-24 pt-16 lg:pt-24 space-y-6"
    >
      <div className="flex items-end justify-between w-full flex-wrap lg:flex-nowrap gap-4">
        <Input
          label="Enter a website URL"
          className={cn("w-full", { "!ring-green-400/60": validUrl })}
          value={pageUrl}
          setValue={setPageUrl}
          initialValue={pageUrl}
          clearable
        />
        <div className="flex flex-col justify-end sm:space-y-2 overflow-x-auto -ml-[15px] sm:ml-0 sm:pl-0 pl-[14px] sm:min-w-fit min-w-[calc(100%_+_30px)]">
          <div className="text-dimmed text-sm hidden sm:block">
            How do you want to trash it?
          </div>
          <div className="flex items-end relative divide-midnight-650 divide-x">
            {Object.entries(voices).map(([key, item]) => (
              <button
                key={key}
                onClick={() => setSelectedVoice(key as Voice)}
                className={cn(
                  "whitespace-nowrap text-dimmed text-sm h-8 sm:h-10 px-4 first:rounded-l-md last:rounded-r-md",
                  key == selectedVoice
                    ? "bg-midnight-700"
                    : "bg-midnight-800 hover:bg-midnight-750"
                )}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <Button
          disabled={!validUrl || loading}
          type="submit"
          className="w-full md:w-auto"
        >
          Generate
        </Button>
      </div>
      <div
        className={cn(
          "w-full grow h-full relative flex flex-col rounded-lg",
          submitted ? "border border-midnight-800" : "border-dashed-wide"
        )}
      >
        {messages.length > 0 && runInProgress ? (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center p-4">
            <div className="border-midnight-800/80 border z-50 flex items-start gap-3 p-6 flex-col justify-start shadow-xl w-96 bg-black/80 rounded-lg backdrop-blur-sm">
              {messages.map(({ key, state, label }) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    "flex items-center gap-2",
                    state == "failure"
                      ? "text-red-500"
                      : state == "success"
                      ? "text-green-500"
                      : "text-dimmed"
                  )}
                >
                  {state == "failure" ? (
                    <Cross1Icon className="w-5 h-5" />
                  ) : state == "success" ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <Spinner className="w-5 h-5" />
                  )}
                  <span>{label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        ) : null}

        {messages.length === 0 && !remixedUrl && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center p-6">
            <div className="border-slate-800 border z-50 flex items-start gap-3 p-6 flex-col justify-start shadow-xl w-96 bg-slate-900 rounded-lg backdrop-blur-sm">
              <p className="text-slate-200">
                Enter a website URL and click generate.{" "}
                <span className="text-slate-400">Lazy? Try one of these:</span>
              </p>
              <ul className="text-slate-200 list-none flex flex-col gap-2">
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedVoice("pirate");
                      setPageUrl("supabase.com");
                    }}
                    className="text-indigo-500 hover:text-indigo-400 transition"
                  >
                    🏴‍☠️ supabase.com as a pirate
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedVoice("boomer");
                      setPageUrl("cal.com");
                    }}
                    className="text-indigo-500 hover:text-indigo-400 transition"
                  >
                    👴 cal.com as a boomer
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedVoice("cuss");
                      setPageUrl("linear.app");
                    }}
                    className="text-indigo-500 hover:text-indigo-400 transition"
                  >
                    🤬 linear.app with bad language
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center p-4">
            <div className="border-midnight-800/80 border z-50 flex items-start gap-3 p-6 flex-col justify-start shadow-xl w-96 bg-midnight-950/90 rounded-lg text-rose-500">
              {error}
            </div>
          </div>
        )}

        <div
          className={cn(
            "h-10 rounded-t-lg w-full flex items-center justify-center sm:justify-between px-4",
            submitted
              ? "border-b-2 border-midnight-800 bg-midnight-800"
              : "border-dashed-wide py-0.5"
          )}
        >
          <div className="sm:flex items-center gap-1.5 hidden">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5 rounded-full",
                    submitted ? "bg-midnight-700" : "border-dashed-wide"
                  )}
                />
              ))}
          </div>
          <Slider
            leftLabel="Before"
            rightLabel="After"
            value={[progress]}
            disabled={!remixedUrl}
            className={cn("w-48 sm:w-64 sm:mr-4 text-sm sm:text-base", {
              "opacity-0": !submitted || !remixedUrl,
            })}
            onValueChange={(value) => setProgress(value[0] || 0)}
          />
          <div />
        </div>
        <div className="relative grow rounded-b-xl max-h-full mb-0.5 overflow-x-hidden overflow-y-scroll">
          {screenshotUrl ? (
            <img
              src={screenshotUrl}
              className="transition-opacity absolute px-0.5"
              style={{ opacity: 1 - progress }}
              alt="Website screenshot"
            />
          ) : null}
          {remixedUrl ? (
            <img
              src={remixedUrl}
              className="transition-opacity absolute px-0.5"
              style={{ opacity: progress }}
              alt="New website screenshot"
            />
          ) : null}
        </div>
        {remixedUrl ? (
          <div className="p-0 sm:p-2 bg-slate-900 rounded-lg fixed z-10 sm:bottom-[5.2rem] lg:bottom-[6.2rem] bottom-16 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-fit">
            <Button
              size="lg"
              className="w-full"
              variant="default"
              disabled={!remixedUrl}
              onClick={copyLink}
              type="button"
            >
              <span>Share</span>
              <Share2Icon className="w-5 h-5 ml-2" />
            </Button>
          </div>
        ) : null}
      </div>
    </form>
  );
}

export default Dashboard;
