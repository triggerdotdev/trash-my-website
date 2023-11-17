import OgImage from "./opengraph-image";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  height: 630,
  width: 1200,
};

export default async function Image() {
  return OgImage();
}
