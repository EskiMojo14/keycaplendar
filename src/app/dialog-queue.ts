import { createDialogQueue } from "@rmwc/dialog";

export const dialogQueue = createDialogQueue();

export const { alert, confirm, prompt } = dialogQueue;
