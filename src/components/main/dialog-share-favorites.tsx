import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { CircularProgress } from "@rmwc/circular-progress";
import { Dialog, DialogContent, DialogTitle } from "@rmwc/dialog";
import { IconButton } from "@rmwc/icon-button";
import { Switch } from "@rmwc/switch";
import { TextField } from "@rmwc/textfield";
import { Typography } from "@rmwc/typography";
import { nanoid } from "nanoid";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { selectShareNameLoading, setShareNameLoading } from "@s/settings";
import { selectFavoritesId, selectShareName, setFavoritesId } from "@s/user";
import {
  createDebouncedSyncFavoritesId,
  createDebouncedSyncShareName,
} from "@s/user/thunks";
import { clearSearchParams, createURL } from "@s/util/functions";
import "./dialog-share-favorites.scss";

type DialogShareFavoritesProps = {
  close: () => void;
  open: boolean;
};

export const DialogShareFavorites = ({
  close,
  open,
}: DialogShareFavoritesProps) => {
  const dispatch = useAppDispatch();
  const debouncedSyncShareName = useCallback(
    createDebouncedSyncShareName(dispatch),
    [dispatch]
  );
  const debouncedSyncFavoritesId = useCallback(
    createDebouncedSyncFavoritesId(dispatch),
    [dispatch]
  );

  const docShareName = useAppSelector(selectShareName);
  const shareNameLoading = useAppSelector(selectShareNameLoading);

  const [shareName, setShareName] = useState("");

  useEffect(() => {
    setShareName(docShareName);
  }, [docShareName]);

  const handleChange = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) => {
    if (name === "shareName") {
      setShareName(value);
      dispatch(setShareNameLoading(true));
      debouncedSyncShareName(value);
    }
  };

  const favoritesId = useAppSelector(selectFavoritesId);

  const shareable = !!favoritesId;

  const url = useMemo(
    () =>
      createURL({ pathname: "/favorites" }, (params) => {
        clearSearchParams(params);
        params.set("favoritesId", favoritesId);
      }),
    [favoritesId]
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url.href);
      queue.notify({ title: "Copied URL to clipboard." });
    } catch (error) {
      queue.notify({ title: `Error copying to clipboard ${error}` });
    }
  };

  const handleSwitchChange = ({
    target: { checked, name },
  }: ChangeEvent<HTMLInputElement>) => {
    if (name === "shareFavorites") {
      const newId = checked ? nanoid() : "";
      dispatch(setFavoritesId(newId));
      debouncedSyncFavoritesId(newId);
    }
  };

  return (
    <Dialog className="share-dialog" onClose={close} open={open}>
      <DialogTitle>Share favorites</DialogTitle>
      <DialogContent>
        <div className="group">
          <div className="text-field-container">
            <TextField
              className="name-field"
              helpText={{
                children: "Displayed username to link viewers.",
                persistent: true,
                validationMsg: false,
              }}
              label="Display name"
              name="shareName"
              onChange={handleChange}
              outlined
              trailingIcon={
                shareNameLoading ? (
                  <CircularProgress size="medium" />
                ) : undefined
              }
              value={shareName}
            />
          </div>
        </div>
        <div className="group">
          <div className="switch-container">
            <Switch
              checked={shareable}
              label="Allow others to view"
              name="shareFavorites"
              onChange={handleSwitchChange}
            />
          </div>
          {shareable && (
            <>
              <Typography use="caption">
                Note that switching this off and back on will generate a new ID,
                thus breaking any existing links.
              </Typography>
              <TextField
                className="display-link"
                helpText={{
                  children: "Anyone with the link can view.",
                  persistent: true,
                  validationMsg: false,
                }}
                outlined
                readOnly
                trailingIcon={
                  <IconButton icon="content_copy" onClick={copyLink} />
                }
                value={url.href}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
