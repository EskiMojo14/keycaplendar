import { createFillFunc } from "@s/util/functions";
import { blankUser } from "./constants";
/**
 * Fills in partial update entry with defaults.
 * @param partial
 * @returns Full update entry type.
 */
export const partialUser = createFillFunc(blankUser);
