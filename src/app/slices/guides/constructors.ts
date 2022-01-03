import { blankGuide } from "@s/guides/constants";
import { createFillFunc } from "@s/util/functions";

/**
 * Fills in partial guide entry with defaults.
 * @param partial
 * @returns Full guide entry type.
 */

export const partialGuide = createFillFunc(blankGuide);
