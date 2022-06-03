import type { EntityId } from "@reduxjs/toolkit";
import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from "@rmwc/dialog";
import { selectSetByIdLocal, useGetAllKeysetsQuery } from "@s/main";
import "./dialog-sales.scss";

type DialogSalesProps = {
  close: () => void;
  open: boolean;
  set: EntityId;
};

export const DialogSales = ({ close, open, set: setId }: DialogSalesProps) => {
  const { set } = useGetAllKeysetsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      set: data && selectSetByIdLocal(data, setId),
    }),
  });
  return (
    <Dialog className="sales-dialog" onClose={close} open={open}>
      <DialogTitle>{`Sales - ${set?.profile ?? ""} ${
        set?.colorway ?? ""
      }`}</DialogTitle>
      <DialogContent>
        <div className="sales-image">
          <img alt="Sales graph" src={set?.sales?.img ?? ""} />
        </div>
        {!set?.sales?.thirdParty && "Created by dvorcol."}
      </DialogContent>
      <DialogActions>
        <DialogButton
          href={set?.sales?.img ?? ""}
          label="Open original"
          rel="noopener noreferrer"
          tag="a"
          target="_blank"
        />
        <DialogButton label="Close" onClick={close} />
      </DialogActions>
    </Dialog>
  );
};

export default DialogSales;
