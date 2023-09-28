"use client";

import React, { useEffect, useMemo, useState } from "react";
import Input from "./Input";
import { validateUrl } from "@/utils";
import { callTrigger } from "../actions";
import { Button } from "./Button";
import { useEventRunStatuses } from "@trigger.dev/react";
import Image from "next/image";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { Spinner } from "./Spinner";

function Dashboard() {
  const [pageUrl, setPageUrl] = useState("");
  const [eventId, setEventId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validUrl = useMemo(() => validateUrl(pageUrl), [pageUrl]);

  const submit = async () => {
    setLoading(true);
    setSubmitted(true);

    if (!validUrl) return;

    const res = await callTrigger(validUrl);

    setEventId(res.id);
  };

  const { statuses, fetchStatus } = useEventRunStatuses(eventId);

  useEffect(() => {
    if (fetchStatus === "success") {
      setLoading(false);
    }
  }, [fetchStatus]);

  return (
    <form action={submit} className="w-full grow p-12 pt-32 space-y-12">
      <div className="flex items-end justify-start mx-auto flex-wrap max-w-4xl gap-4">
        <Input
          label="Your landing page:"
          className={validUrl ? "!ring-green-400/60" : ""}
          placeholder="trigger.dev"
          onChange={setPageUrl}
          clearable
        />
        <Button disabled={!validUrl || loading} type="submit">
          Remix my headings
        </Button>
        <div className="w-96 h-28 text-dimmed">
          <div className="flex items-center gap-2">
            {submitted && !statuses ? (
              <Spinner className="w-5 h-5" />
            ) : (
              <CheckCircledIcon className="w-5 h-5 text-emerald-600" />
            )}
            <div>Starting up</div>
          </div>
          {statuses?.map((status) => (
            <div key={status.key} className="flex items-center gap-2">
              <CheckCircledIcon className="w-5 h-5 text-emerald-600" />
              <div>{status.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-12 w-full grow">
        <div className="space-y-4 flex flex-col items-end">
          <h2>Current site:</h2>
          {statuses?.some((s) => s.key === "screenshot") ? (
            <Image
              src={
                statuses?.find((s) => s.key === "screenshot")?.data
                  ?.url as string
              }
              width={500}
              height={600}
              className="!rounded-md"
              alt="Current website screenshot"
            />
          ) : (
            <div className="w-[500px] h-full bg-slate-750 animate-pulse rounded-md" />
          )}
        </div>
        <div className="space-y-4 flex flex-col items-start">
          <h2>Remixed:</h2>
          {statuses?.some((s) => s.key === "screenshot-modified") ? (
            <Image
              src={
                statuses?.find((s) => s.key === "screenshot-modified")?.data
                  ?.url as string
              }
              height={600}
              width={500}
              className="!rounded-md"
              alt="New website screenshot"
            />
          ) : (
            <div className="w-[500px] h-full bg-slate-750 animate-pulse rounded-md" />
          )}
        </div>
      </div>
    </form>
  );
}

export default Dashboard;
