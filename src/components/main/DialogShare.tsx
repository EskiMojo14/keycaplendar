import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectShareNameLoading, setShareNameLoading } from "../../app/slices/settings/settingsSlice";
import { selectShareName } from "../../app/slices/user/userSlice";
import { debouncedSyncShareName } from "../../app/slices/user/functions";
import { CircularProgress } from "@rmwc/circular-progress";
import { Dialog, DialogContent, DialogTitle } from "@rmwc/dialog";
import { Switch } from "@rmwc/switch";
import { TextField } from "@rmwc/textfield";
import "./DialogShare.scss";

type DialogShareProps = {
  open: boolean;
  close: () => void;
};

export const DialogShare = (props: DialogShareProps) => {
  const dispatch = useAppDispatch();

  const docShareName = useAppSelector(selectShareName);
  const shareNameLoading = useAppSelector(selectShareNameLoading);

  const [shareName, setShareName] = useState("");

  useEffect(() => {
    setShareName(docShareName);
  }, [docShareName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name === "shareName") {
      setShareName(value);
      dispatch(setShareNameLoading(true));
      debouncedSyncShareName(value);
    }
  };

  return (
    <Dialog open={props.open} onClose={props.close} className="share-dialog">
      <DialogTitle>Share</DialogTitle>
      <DialogContent>
        <div className="group">
          <div className="text-field-container">
            <TextField
              outlined
              id="shareName"
              name="shareName"
              label="Display name"
              value={shareName}
              className="name-field"
              onChange={handleChange}
              trailingIcon={shareNameLoading ? <CircularProgress size="medium" /> : undefined}
              helpText={{ persistent: true, validationMsg: false, children: "Displayed username to link viewers." }}
            />
          </div>
        </div>
        <div className="group">
          <div className="switch-container">
            <Switch label="Allow others to view" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
