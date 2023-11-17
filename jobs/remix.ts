import { eventTrigger, isTriggerError } from "@trigger.dev/sdk";
import { client, openai } from "@/trigger";
import { z } from "zod";
import { load } from "cheerio";
import { voices } from "@/app/constants";
import { Voice } from "@/app/types";

const MAX_HEADING_LENGTH = 200;
const MAX_HEADING_COUNT = 20;

const workerUrl = process.env.WORKER_URL || "";

/**
 * Trigger.dev job to collect headings from a server-side rendered website
 */
client.defineJob({
  id: "remix",
  name: "Screenshot and remix a page's headings",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "remix.event",
    schema: z.object({
      url: z.string().url(),
      voice: z.string().optional(),
    }),
  }),
  integrations: {
    openai,
  },
  run: async (payload, io, _) => {
    const { url, voice } = payload;

    const initialScreenshotStatus = await io.createStatus("screenshot", {
      label: "Fetching website",
      state: "loading",
    });

    // Fetch initial screenshot in parallel with other tasks
    io.runTask("initial-screenshot", async () => {
      const res = await fetch(workerUrl, {
        method: "POST",
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error(res.statusText);

      const fileUrl = await res.text();

      initialScreenshotStatus.update("screenshotted", {
        label: "Grabbed website",
        state: "success",
        data: {
          url: fileUrl,
        },
      });
    });

    const fetchHeadingsStatus = await io.createStatus("headings", {
      label: "Extracting text",
      state: "loading",
    });

    // Fetch and clean headings
    const page = await fetch(url);
    const data = await page.text();

    const queryFunction = load(data, {}, false);
    const headingElements = queryFunction("h1, h2, h3, p");

    let headings: string[] = [];

    headingElements.each((_, element) => {
      const elementText = queryFunction(element)?.text?.();

      if (typeof elementText === "string" && elementText.trim() !== "") {
        headings.push(
          elementText
            .trim()
            .replace(/\s+/g, " ")
            .substring(0, MAX_HEADING_LENGTH)
        );
      }
    });

    headings = headings.slice(0, MAX_HEADING_COUNT);

    fetchHeadingsStatus.update("headings-fetched", {
      label: "Extracted text",
      state: "success",
    });

    const style = voices[voice as Voice].value;

    const prefix = `
You're a copywriting pro.
You'll remix the following landing page headings ${
      style ? "in the style of " + style : "to be more useful"
    }!
Keep headings roughly the same length.
Keep headings in the same order.
Return the new copy directly, without formatting nor prose.
      `;
    const prompt = `${prefix.trim()}\n\nHeadings:\n${headings.join("\n")}`;

    const aiStatus = await io.createStatus("new-headings", {
      label: "Trashing text",
      state: "loading",
    });

    // Call the OpenAI API to generate new headings
    const openaiResponse = await io.openai.chat.completions.create(
      "openai-completions-api",
      {
        model: "gpt-4-1106-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }
    );

    if (!openaiResponse?.choices?.length) {
      throw new Error("OpenAI failed to return a response");
    }

    const newHeadings = openaiResponse.choices[0].message?.content
      ?.split("\n")
      .map((text: string, index: number) => ({
        id: index,
        text,
      }));

    aiStatus.update("new-headings-complete", {
      label: "Trashed text",
      state: "success",
    });

    const finalScreenshotStatus = await io.createStatus("remix", {
      label: "Preparing trashed site",
      state: "loading",
    });

    await io.runTask("new-screenshot", async () => {
      const res = await fetch(workerUrl, {
        method: "POST",
        body: JSON.stringify({
          url,
          newHeadings,
          voice,
        }),
      });

      if (!res.ok) throw new Error(res.statusText);

      const fileUrl = await res.text();

      await finalScreenshotStatus.update("remixed", {
        label: "Trashing complete",
        state: "success",
        data: {
          url: fileUrl,
        },
      });
    });

    return;
  },
});
