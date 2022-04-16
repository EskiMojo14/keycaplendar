import { createSnackbarQueue } from "@rmwc/snackbar";

export const snackbarQueue = createSnackbarQueue();

export const { notify } = snackbarQueue;
