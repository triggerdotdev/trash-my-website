"use server";

import { client } from "@/trigger";
import { cookies } from "next/headers";
import { Voice } from "./types";
import { voices } from "./constants";

export async function callTrigger({
  id,
  url,
  voice,
}: {
  id: string;
  url: string;
  voice?: Voice;
}) {
  const _cookies = cookies();
  const res = await client.sendEvent({
    name: "remix.event",
    id,
    payload: {
      url,
      voice: voice ? { slug: voice, prompt: voices[voice].value } : undefined,
    },
  });

  return res;
}
