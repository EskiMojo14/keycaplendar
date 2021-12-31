import { Dialog, DialogActions, DialogButton, DialogContent, DialogTitle } from "@rmwc/dialog";
import type { SetType } from "@s/main/types";
import "./dialog-sales.scss";

type DialogSalesProps = {
  close: () => void;
  open: boolean;
  set: SetType;
};

export const DialogSales = ({ close, open, set }: DialogSalesProps) => (
  <Dialog className="sales-dialog" open={open} onClose={close}>
    <DialogTitle>{`Sales - ${set.profile} ${set.colorway}`}</DialogTitle>
    <DialogContent>
      <div className="sales-image">
        <img alt="Sales graph" src={set.sales?.img ?? ""} />
      </div>
      {set.sales && !set.sales.thirdParty ? "Created by dvorcol." : null}
    </DialogContent>
    <DialogActions>
      <DialogButton
        label="Open original"
        tag="a"
        href={set.sales?.img ?? ""}
        target="_blank"
        rel="noopener noreferrer"
      />
      <DialogButton label="Close" onClick={close} />
    </DialogActions>
  </Dialog>
);

export default DialogSales;
