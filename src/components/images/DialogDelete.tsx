import React, { useState } from "react";
import { useAppDispatch } from "~/app/hooks";
import { queue } from "~/app/snackbarQueue";
import { batchStorageDelete } from "@s/common/functions";
import { setLoading } from "@s/images/imagesSlice";
import { listAll } from "@s/images/functions";
import { ImageType } from "@s/images/types";
import { Checkbox } from "@rmwc/checkbox";
import { ChipSet, Chip } from "@rmwc/chip";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
import "./DialogDelete.scss";

type DialogDeleteProps = {
  close: () => void;
  folders: string[];
  images: ImageType[];
  open: boolean;
  toggleImageChecked: (image: ImageType) => void;
};

export const DialogDelete = (props: DialogDeleteProps) => {
  const dispatch = useAppDispatch();
  const [deleteAllVersions, setDeleteAllVersions] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    dispatch(setLoading(true));
    batchStorageDelete(array)
      .then(() => {
        queue.notify({ title: "Successfully deleted files." });
        props.close();
        listAll();
      })
      .catch((error) => {
        queue.notify({ title: "Failed to delete files: " + error });
        console.log(error);
        dispatch(setLoading(false));
      });
  };
  return (
    <Dialog open={props.open} onClose={props.close} className="delete-image-dialog">
      <DialogTitle>{`Delete image${props.images.length === 1 ? "" : "s"}`}</DialogTitle>
      <DialogContent>
        {`The following image${props.images.length === 1 ? "" : "s"} will be deleted:`}
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
