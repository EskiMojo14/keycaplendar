import { createFillFunc } from "@s/util/functions";
import { blankImage } from "./constants";

/**
 * Fills in partial image object with defaults.
 * @param partial
 * @returns Full image object type.
 */

export const partialImage = createFillFunc(blankImage);
