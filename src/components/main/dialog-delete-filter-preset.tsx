import type { MouseEvent } from "react";
import { Dialog, DialogActions, DialogButton, DialogContent, DialogTitle } from "@rmwc/dialog";
import { deleteGlobalPreset, deletePreset } from "@s/main/functions";
import type { PresetType } from "@s/main/types";

type DialogDeleteFilterPresetProps = {
  close: () => void;
  open: boolean;
  preset: PresetType;
};

export const DialogDeleteFilterPreset = ({ close, open, preset }: DialogDeleteFilterPresetProps) => {
  const deleteFn = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (preset.global) {
      deleteGlobalPreset(preset);
    } else {
      deletePreset(preset);
    }
    close();
  };
  return (
    <Dialog open={open}>
      <DialogTitle>Delete {`"${preset.name}"`}</DialogTitle>
      <DialogContent>
        Are you sure you want to delete the{preset.global ? ` global` : ""} filter preset {`"${preset.name}"`}?
      </DialogContent>
      <DialogActions>
        <DialogButton action="close" onClick={close} isDefaultAction>
          Cancel
        </DialogButton>
        <DialogButton action="accept" className="delete" onClick={deleteFn}>
          Delete
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};

export default DialogDeleteFilterPreset;
