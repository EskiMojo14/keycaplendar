import React from "react";
import { ChipSet, Chip } from "@rmwc/chip";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
import "./DialogDelete.scss";

export const DialogDelete = (props) => {
  return (
    <Dialog open={props.open} onClose={props.close} className="delete-image-dialog">
      <DialogTitle>Delete image{props.images.length > 1 ? "s" : null}</DialogTitle>
      <DialogContent>
        <div className="chips-container">
          <ChipSet>
            {props.images.map((image) => (
              <Chip
                key={image.fullPath}
                label={image.name}
                disabled
                trailingIcon="close"
                onTrailingIconInteraction={() => props.toggleImageChecked(image)}
              />
            ))}
          </ChipSet>
        </div>
      </DialogContent>
      <DialogActions>
        <DialogButton label="Close" onClick={props.close} action="close" />
        <DialogButton label="Delete" className="delete" action="accept" />
      </DialogActions>
    </Dialog>
  );
};
