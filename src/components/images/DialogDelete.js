import React, { useState } from "react";
import { batchStorageDelete } from "../../util/functions";
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
  const deleteImages = () => {
    const array = createArray();
    props.setLoading(true);
    batchStorageDelete(array)
      .then(() => {
        props.snackbarQueue.notify({ title: "Successfully deleted files." });
        props.close();
        props.listAll();
      })
      .catch((error) => {
        props.snackbarQueue.notify({ title: "Failed to delete files: " + error });
        console.log(error);
        props.setLoading(false);
      });
  };
  return (
    <Dialog open={props.open} onClose={props.close} className="delete-image-dialog">
      <DialogTitle>{`Delete image${props.images.length > 1 ? "s" : ""}`}</DialogTitle>
      <DialogContent>
        {`The following image${props.images.length > 1 ? "s" : ""} will be deleted:`}
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
        {`Are you sure you want to delete ${props.images.length > 1 ? "these" : "this"}?`} This cannot be undone.
      </DialogContent>
      <DialogActions>
        <div className="checkbox-container">
          <Checkbox label="Delete all versions" checked={deleteAllVersions} onChange={handleChange} />
        </div>
        <DialogButton label="Close" onClick={props.close} action="close" />
        <DialogButton label="Delete" onClick={deleteImages} className="delete" />
      </DialogActions>
    </Dialog>
  );
};
