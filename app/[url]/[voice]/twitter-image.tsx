import OgImage from "./opengraph-image";

import { Voice } from "@/app/types";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  height: 630,
  width: 1200,
};

type Props = {
  params: {
    url: string;
    voice: Voice;
  };
};

export default async function Image({ params }: Props) {
  return OgImage({ params });
}
