import { SetType } from "@s/main/types";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
import "./dialog-sales.scss";

type DialogSalesProps = {
  close: () => void;
  open: boolean;
  set: SetType;
};

export const DialogSales = (props: DialogSalesProps) => (
  <Dialog className="sales-dialog" open={props.open} onClose={props.close}>
    <DialogTitle>{`Sales - ${props.set.profile} ${props.set.colorway}`}</DialogTitle>
    <DialogContent>
      <div className="sales-image">
        <img alt="Sales graph" src={props.set.sales ? props.set.sales.img : ""} />
      </div>
      {props.set.sales && !props.set.sales.thirdParty ? "Created by dvorcol." : null}
    </DialogContent>
    <DialogActions>
      <DialogButton
        label="Open original"
        tag="a"
        href={props.set.sales ? props.set.sales.img : ""}
        target="_blank"
        rel="noopener noreferrer"
      />
      <DialogButton label="Close" onClick={props.close} />
    </DialogActions>
  </Dialog>
);

export default DialogSales;
