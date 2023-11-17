import { ImageResponse } from "next/og";
import { validateUrl } from "@/app/utils";
import { voices } from "@/app/constants";
import { Voice } from "@/app/types";
import { imageUrlFromConfig } from "@/app/imageUrlFromConfig";
import { LogoFlat } from "@/app/components/Logo";

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
          gap: "1rem",
        }}
      >
        <div
          style={{
            fontSize: "3rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "white",
          }}
        >
          <div>Try it at </div>
          <LogoFlat style={{ fontSize: "3rem", padding: 0, margin: 0 }} />
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
          data: poppinsSemibold,
          style: "normal",
          weight: 600,
        },
      ],
    }
  );
}
