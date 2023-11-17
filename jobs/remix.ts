import { client, openai } from "@/trigger";
import { eventTrigger } from "@trigger.dev/sdk";
import { load } from "cheerio";
import { z } from "zod";

const MAX_HEADING_LENGTH = 200;
const MAX_HEADING_COUNT = 50;

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
      voice: z
        .object({
          slug: z.string(),
          prompt: z.string(),
        })
        .optional(),
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

    await io.runTask("check-url-exists", async () => {
      try {
        const res = await fetch(url, { method: "HEAD" });

        if (!res.ok) {
          throw new Error("We can't trash this site… it doesn't exist!");
        }
      } catch (e) {
        await io.logger.error("error", { e });
        throw new Error("We can't trash this site… it doesn't exist!");
      }
    });

    // Fetch initial screenshot in parallel with other tasks
    const originalImageUrl = await io.runTask(
      "initial-screenshot",
      async () => {
        const res = await fetch(workerUrl, {
          method: "POST",
          body: JSON.stringify({ url }),
        });

        if (!res.ok) throw new Error(res.statusText);

        return res.text();
      }
    );

    await initialScreenshotStatus.update("screenshotted", {
      label: "Grabbed website",
      state: "success",
      data: {
        url: originalImageUrl,
      },
    });

    const fetchHeadingsStatus = await io.createStatus("headings", {
      label: "Extracting text",
      state: "loading",
    });

    // Fetch and clean headings
    const page = await fetch(url);
    const data = await page.text();

    const queryFunction = load(data, {}, false);
    const headingElements = queryFunction("h1, h2, h3, h4, h5, h6, p");
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

    await fetchHeadingsStatus.update("headings-fetched", {
      label: "Extracted text",
      state: "success",
    });

    const style = voice?.prompt;

    const prefix = `You're a copywriting pro. You'll remix the following landing page headings ${
      style ? "in the style of " + style : "to be more useful"
    }! Keep headings roughly the same length. Keep headings in the same order. Return the new copy directly, without formatting nor prose. Don't prefix the headings with numbers or bullets. Just the headings, one per line.`;
    const prompt = `${prefix.trim()}\n\n${headings.join("\n")}`;

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

    await io.logger.info("newHeadings", { headings, newHeadings });

    await aiStatus.update("new-headings-complete", {
      label: "Trashed text",
      state: "success",
    });

    const finalScreenshotStatus = await io.createStatus("remix", {
      label: "Preparing trashed site",
      state: "loading",
    });

    const fileUrl = await io.runTask("new-screenshot", async () => {
      const res = await fetch(workerUrl, {
        method: "POST",
        body: JSON.stringify({
          url,
          newHeadings,
          voice: voice?.slug,
        }),
      });

      if (!res.ok) throw new Error(res.statusText);
      return res.text();
    });

    await finalScreenshotStatus.update("remixed", {
      label: "Trashing complete",
      state: "success",
      data: {
        url: fileUrl,
      },
    });

    return { remixedUrl: fileUrl };
  },
});
