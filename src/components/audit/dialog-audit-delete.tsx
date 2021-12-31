import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from "@rmwc/dialog";
import type { ActionType } from "@s/audit/types";

type DialogAuditDeleteProps = {
  close: () => void;
  deleteAction: ActionType;
  deleteActionFn: (action: ActionType) => void;
  open: boolean;
};

export const DialogAuditDelete = ({
  close,
  deleteAction,
  deleteActionFn,
  open,
}: DialogAuditDeleteProps) => (
  <Dialog open={open}>
    <DialogTitle>Delete Action</DialogTitle>
    <DialogContent>
      Are you sure you want to delete the changelog entry with the ID{" "}
      {deleteAction.changelogId}?
    </DialogContent>
    <DialogActions>
      <DialogButton action="close" onClick={close} isDefaultAction>
        Cancel
      </DialogButton>
      <DialogButton
        action="accept"
        className="delete"
        onClick={() => {
          deleteActionFn(deleteAction);
        }}
      >
        Delete
      </DialogButton>
    </DialogActions>
  </Dialog>
);
