import { createDialogQueue } from "@rmwc/dialog";
import type { DialogQueueInput } from "@rmwc/dialog";
import classNames from "classnames";

export const dialogQueue = createDialogQueue();

export const { alert, confirm, prompt } = dialogQueue;

export const confirmDelete = (dialog: DialogQueueInput) =>
  confirm(
    Object.assign(dialog, {
      acceptLabel: dialog.acceptLabel ?? "Delete",
      className: classNames(dialog.className, "mdc-dialog--delete-confirm"),
    })
  );
