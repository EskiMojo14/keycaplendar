import { z } from "zod";
import { visibilityVals } from "@s/guides/constants";
//import type { GuideEntryType } from "@s/guides/types";

export const GuideEntrySchema /*: z.ZodSchema<GuideEntryType>*/ = z.object({
  body: z.string().min(1),
  description: z.string().min(1),
  id: z.string().min(1),
  name: z.string().min(1),
  tags: z.string().min(1).array(),
  title: z.string().min(1),
  visibility: z.enum(visibilityVals),
});
