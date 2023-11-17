import { voices } from "@/app/constants";

export type Heading = {
  id: number;
  text: string;
};

export type Voice = keyof typeof voices;
