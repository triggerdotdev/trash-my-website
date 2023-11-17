import { createAppRoute } from "@trigger.dev/nextjs";
import { client } from "@/trigger";

import "@/jobs";

export const maxDuration = 300;

//this route is used to send and receive data with Trigger.dev
export const { POST, dynamic } = createAppRoute(client);
