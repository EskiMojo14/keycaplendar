import { MouseEvent } from "react";
import { Dialog, DialogActions, DialogButton, DialogContent, DialogTitle } from "@rmwc/dialog";
import { deleteGlobalPreset, deletePreset } from "@s/main/functions";
import { PresetType } from "@s/main/types";

type DialogDeleteFilterPresetProps = {
  close: () => void;
  open: boolean;
  preset: PresetType;
};

export const DialogDeleteFilterPreset = (props: DialogDeleteFilterPresetProps) => {
  const deleteFn = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (props.preset.global) {
      deleteGlobalPreset(props.preset);
    } else {
      deletePreset(props.preset);
    }
    props.close();
  };
  return (
    <Dialog open={props.open}>
      <DialogTitle>Delete {`"${props.preset.name}"`}</DialogTitle>
      <DialogContent>
        Are you sure you want to delete the{props.preset.global ? ` global` : null} filter preset{" "}
        {`"${props.preset.name}"`}?
      </DialogContent>
      <DialogActions>
        <DialogButton action="close" onClick={props.close} isDefaultAction>
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
