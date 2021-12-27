import { useState } from "react";
import type { ChangeEvent } from "react";
import { Checkbox } from "@rmwc/checkbox";
import { Chip, ChipSet } from "@rmwc/chip";
import { Dialog, DialogActions, DialogButton, DialogContent, DialogTitle } from "@rmwc/dialog";
import { useAppDispatch } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { setLoading } from "@s/images";
import { listAll } from "@s/images/functions";
import type { ImageType } from "@s/images/types";
import { batchStorageDelete, pluralise } from "@s/util/functions";
import "./dialog-delete.scss";

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
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      <DialogTitle>{pluralise`Delete ${[props.images.length, "image"]}`}</DialogTitle>
      <DialogContent>
        {pluralise`The following ${[props.images.length, "image"]} will be deleted:`}
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
