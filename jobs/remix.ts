import { eventTrigger, isTriggerError } from "@trigger.dev/sdk";
import { client, openai } from "@/trigger";
import { z } from "zod";
import { load } from "cheerio";

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

    try {
      const initialScreenshotStatus = await io.createStatus("screenshot", {
        label: "Waiting for Cloudflare",
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
          label: "Initial screenshot",
          state: "success",
          data: {
            url: fileUrl,
          },
        });
      });

      const fetchHeadingsStatus = await io.createStatus("headings", {
        label: "Fetching headings with Trigger",
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
        label: "Fetched headings",
        state: "success",
      });

      const prefix = `
You're a copywriting pro.
You'll remix the following landing page headings ${
        voice ? "in the style of " + voice : "to be more useful"
      }!
Keep headings roughly the same length.
Keep headings in the same order.
Return the new copy directly, without formatting nor prose.
      `;
      const prompt = `${prefix.trim()}\n\nHeadings:\n${headings.join("\n")}`;

      const aiStatus = await io.createStatus("new-headings", {
        label: "Waiting for OpenAI",
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

      const finalScreenshotStatus = await io.createStatus("remix", {
        label: "Remixing page",
        state: "loading",
      });

      aiStatus.update("new-headings-complete", {
        label: "Generated new headings with OpenAI",
        state: "success",
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
          label: "New screenshot",
          state: "success",
          data: {
            url: fileUrl,
          },
        });
      });

      return;
    } catch (error: any) {
      if (isTriggerError(error)) throw error;
      io.logger.error("Failed to remix page", { error });

      throw new Error(error.message || "Failed to remix page");
    }
  },
});
