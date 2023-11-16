import puppeteer from "@cloudflare/puppeteer";

export interface Env {
  BUCKET: R2Bucket;
  BUCKET_URL: string;
  BROWSERLESS_KEY: string;
}

/**
 * Cloudflare Worker to screenshot a page and optionally update its headings
 */
const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const body: any = await request.json();

      const { url: pageUrl, newHeadings, voice, fullPage = false } = body;

      if (!pageUrl) return new Response("Please include a URL to visit");

      const url = new URL(pageUrl).toString();
      const siteName = url.replace(/https:\/\//g, "").replace(/\.|\//g, "");
      const fileName = `${siteName}-${voice || "index"}.jpeg`;
      const fileUrl = `${env.BUCKET_URL}/${fileName}`;

      console.log("fileUrl", fileUrl);

      const cachedFile = await env.BUCKET.get(fileName);
      console.log("cachedFile", cachedFile);
      if (cachedFile && !newHeadings) return new Response(fileUrl);

      const browserWSEndpoint = `wss://chrome.browserless.io?token=${env.BROWSERLESS_KEY}`;
      const browser = await puppeteer.connect({
        browserWSEndpoint,
      });

      const page = await browser.newPage();

      await page.setViewport({ width: 1280, height: 1920 });
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30 * 1000,
      });

      // Loop over and replace headings if applicable
      if (newHeadings) {
        const headings = await page.$$("h1, h2, h3, p");

        for (const newHeading of newHeadings) {
          if (newHeading.id < headings.length) {
            await page.evaluate(
              (el: any, value: string) => (el.textContent = value),
              headings[newHeading.id],
              newHeading.text
            );
          }
        }
      }

      // Take a screenshot
      const screenshotBuffer = await page.screenshot({
        fullPage: fullPage,
        captureBeyondViewport: fullPage,
        type: "jpeg",
      });

      console.log("screenshotBuffer", screenshotBuffer);
      const file = await env.BUCKET.put(fileName, screenshotBuffer);

      await browser.close();

      return new Response(fileUrl);
    } catch (error) {
      console.error("Failed to reach browser", error);
      return new Response("Failed to reach browser", { status: 500 });
    }
  },
};

export default worker;
