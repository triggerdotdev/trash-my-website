import { Voice } from "./types";
import { validateUrl } from "./utils";

export function imageUrlFromConfig(
  url: string,
  voice: Voice
): string | undefined {
  const parsedUrl = validateUrl(url);
  if (parsedUrl) {
    const siteName = new URL(parsedUrl)
      .toString()
      .replace(/https:\/\//g, "")
      .replace(/\.|\//g, "");
    const fileName = `${siteName}-${voice}.jpeg`;
    const fileUrl = `${process.env.NEXT_PUBLIC_BUCKET_URL}/${fileName}`;
    return fileUrl;
  }
}
