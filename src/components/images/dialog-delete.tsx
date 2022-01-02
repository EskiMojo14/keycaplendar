import { useState } from "react";
import type { ChangeEvent } from "react";
import { Checkbox } from "@rmwc/checkbox";
import { Chip, ChipSet } from "@rmwc/chip";
import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from "@rmwc/dialog";
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

export const DialogDelete = ({
  close,
  folders,
  images,
  open,
  toggleImageChecked,
}: DialogDeleteProps) => {
  const dispatch = useAppDispatch();
  const [deleteAllVersions, setDeleteAllVersions] = useState(false);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDeleteAllVersions(e.target.checked);
  };
  const createArray = (allVersions = deleteAllVersions) => {
    if (allVersions) {
      const array = images
        .map((image) => folders.map((folder) => `${folder}/${image.name}`))
        .flat(1);
      return array;
    } else {
      const array = images.map((image) => image.fullPath);
      return array;
    }
  };
  const deleteImages = () => {
    const array = createArray();
    dispatch(setLoading(true));
    batchStorageDelete(array)
      .then(() => {
        queue.notify({ title: "Successfully deleted files." });
        close();
        listAll();
      })
      .catch((error) => {
        queue.notify({ title: `Failed to delete files: ${error}` });
        console.log(error);
        dispatch(setLoading(false));
      });
  };
  return (
    <Dialog className="delete-image-dialog" onClose={close} open={open}>
      <DialogTitle>{pluralise`Delete ${[images.length, "image"]}`}</DialogTitle>
      <DialogContent>
        {pluralise`The following ${[images.length, "image"]} will be deleted:`}
        <div className="chips-container">
          <ChipSet>
            {images.map((image) => (
              <Chip
                key={image.fullPath}
                disabled
                label={image.name}
                onTrailingIconInteraction={() => toggleImageChecked(image)}
                trailingIcon="close"
              />
            ))}
          </ChipSet>
        </div>
        {`Are you sure you want to delete ${
          images.length > 1 ? "these" : "this"
        }?`}{" "}
        This cannot be undone.
      </DialogContent>
      <DialogActions>
        <div className="checkbox-container">
          <Checkbox
            checked={deleteAllVersions}
            label="Delete all versions"
            onChange={handleChange}
          />
        </div>
        <DialogButton action="close" label="Close" onClick={close} />
        <DialogButton
          className="delete"
          label="Delete"
          onClick={deleteImages}
        />
      </DialogActions>
    </Dialog>
  );
};
