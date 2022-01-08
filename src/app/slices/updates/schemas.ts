import { z } from "zod";
import { invalidDate } from "@s/util/functions";
import { schemaForType } from "@s/util/schemas";
import type { UpdateEntryType } from "./types";

export const UpdateEntrySchema = schemaForType<UpdateEntryType>()(
  z.object({
    body: z.string().min(1),
    date: z.string().refine(
      (date) => !invalidDate(date, { required: true }),
      (date) => ({
        message: invalidDate(date, { required: true }) || "",
      })
    ),
    id: z.string().min(1),
    name: z.string().min(1),
    pinned: z.boolean(),
    title: z.string().min(1),
  })
);
