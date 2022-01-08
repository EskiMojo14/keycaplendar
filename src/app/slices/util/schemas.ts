import { z } from "zod";
import { invalidDate } from "./functions";
import type { RemoveFirstFromTuple } from "./types";

export const schemaForType =
  <T>() =>
  <S extends z.ZodType<T>>(arg: S) =>
    arg;

/** Allow a string to either be empty or match provided schema */
export const allowEmpty = <
  Schema extends z.ZodEffects<z.ZodString> | z.ZodString
>(
  stringSchema: Schema
) => z.union([z.string().max(0), stringSchema]);

/** Use invalidDate function for checking string */
export const zodDate = (
  ...args: RemoveFirstFromTuple<Parameters<typeof invalidDate>>
) =>
  z.string().refine(
    (date) => !invalidDate(date, ...args),
    (date) => ({ message: invalidDate(date, ...args) || "" })
  );
