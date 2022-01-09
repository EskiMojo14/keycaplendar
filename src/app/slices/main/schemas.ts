import { z } from "zod";
import { invalidDate } from "@s/util/functions";
import { allowEmpty, schemaForType, zodDate } from "@s/util/schemas";
import type { SetType, VendorType } from "./types";

export const VendorSchema = schemaForType<VendorType>()(
  z.object({
    endDate: z.string().optional(),
    id: z.string(),
    name: z.string().min(1),
    region: z.string().min(1),
    storeLink: allowEmpty(z.string().url()),
  })
);

export const SetSchema = schemaForType<SetType>()(
  z.object({
    alias: z.string().min(1),
    colorway: z.string().min(1),
    designer: z.string().min(1).array(),
    details: z.string().url(),
    gbEnd: allowEmpty(zodDate()),
    gbLaunch: z.union([zodDate(), zodDate({ month: true })]),
    gbMonth: z.boolean(),
    icDate: zodDate({ required: true }),
    id: z.string().min(1),
    image: z.string().url(),
    notes: z.string(),
    profile: z.string().min(1),
    sales: z.object({
      img: allowEmpty(z.string().url()),
      thirdParty: z.boolean(),
    }),
    shipped: z.boolean(),
    vendors: VendorSchema.array(),
  })
);

const gbPick = SetSchema.pick({ gbLaunch: true, gbMonth: true });

export const gbMonthCheck = <Schema extends typeof gbPick>(schema: Schema) =>
  schema.superRefine(({ gbLaunch, gbMonth }, ctx) => {
    if (gbLaunch) {
      const result = invalidDate(gbLaunch, {
        allowQuarter: true,
        month: gbMonth,
      });
      if (result) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid date: ${gbLaunch}, ${result}`,
          path: ["gbLaunch"],
        });
      }
    }
  });
