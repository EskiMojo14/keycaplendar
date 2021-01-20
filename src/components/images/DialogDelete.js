import React, { useState } from "react";
import { Checkbox } from "@rmwc/checkbox";
import { ChipSet, Chip } from "@rmwc/chip";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
import "./DialogDelete.scss";

export const DialogDelete = (props) => {
  const [deleteAllVersions, setDeleteAllVersions] = useState(false);
  const handleChange = (e) => {
    setDeleteAllVersions(e.target.checked);
  };
  const createArray = (allVersions = deleteAllVersions) => {
    if (allVersions) {
      const array = props.images.map((image) => props.folders.map((folder) => `${folder}/${image.name}`)).flat(1);
      return array;
    } else {
      const array = props.images.map((image) => image.fullPath);
      return array;
    }
  };
  return (
    <Dialog open={props.open} onClose={props.close} className="delete-image-dialog">
      <DialogTitle>Delete image{props.images.length > 1 ? "s" : null}</DialogTitle>
      <DialogContent>
        The following images will be deleted:
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
        Are you sure you want to delete these?
      </DialogContent>
      <DialogActions>
        <div className="checkbox-container">
          <Checkbox label="Delete all versions" checked={deleteAllVersions} onChange={handleChange} />
        </div>
        <DialogButton label="Close" onClick={props.close} action="close" />
        <DialogButton label="Delete" className="delete" action="accept" />
      </DialogActions>
    </Dialog>
  );
};
