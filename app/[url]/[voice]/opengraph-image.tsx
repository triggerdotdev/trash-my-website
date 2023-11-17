import { ImageResponse } from "next/og";
import { validateUrl } from "@/app/utils";
import { voices } from "@/app/constants";
import { Voice } from "@/app/types";
import { imageUrlFromConfig } from "@/app/imageUrlFromConfig";

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
  const { url, voice } = params;

  const imageUrl = imageUrlFromConfig(url, voice);

  const poppinsMedium = await fetch(
    new URL("/public/Poppins-Medium.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const poppinsSemibold = await fetch(
    new URL("/public/Poppins-SemiBold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          background: "black",
          height: "100%",
          width: "100%",
          justifyContent: "flex-start",
          overflowY: "hidden",
          padding: "2rem",
          paddingBottom: 0,
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            color: "white",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "2rem",
              fontWeight: 600,
            }}
          >
            Trash your site with AI
          </span>
          <span
            style={{
              fontWeight: 500,
              color: "#94A3B8",
            }}
          >
            Try it at trashmysite.ai
          </span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          style={{
            borderRadius: "1rem",
          }}
          src={imageUrl}
          alt="Screenshot of website"
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Poppins",
          data: poppinsMedium,
          weight: 500,
        },
        {
          name: "Poppins",
          data: poppinsSemibold,
          style: "normal",
          weight: 600,
        },
      ],
    }
  );
}
