import { useState, useEffect, HTMLAttributes } from "react";
import BEMHelper from "@s/common/bem-helper";
import { TopAppBar, TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import "./full-screen-dialog.scss";

const bemClasses = new BEMHelper("full-screen-dialog");

type DivProps = HTMLAttributes<HTMLDivElement>;

type FullScreenDialogProps = DivProps & {
  open: boolean;
  onClose: () => void;
};

export const FullScreenDialog = (props: FullScreenDialogProps) => {
  const [open, setOpen] = useState(!!props.open);
  const [opening, setOpening] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (props.open) {
      openDialog();
    } else {
      closeDialog();
    }
  }, [props.open]);
  const openDialog = () => {
    setOpen(true);
    setAnimate(true);
    setTimeout(() => {
      setOpening(true);
    }, 1);
    setTimeout(() => {
      setAnimate(false);
      setOpening(false);
    }, 450);
  };
  const closeDialog = () => {
    setClosing(true);
    setTimeout(() => {
      if (props.onClose) {
        props.onClose();
      }
      setOpen(false);
      setClosing(false);
    }, 400);
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { open: propsOpen, onClose, ...filteredProps } = props;
  return (
    <>
      <div
        {...filteredProps}
        className={bemClasses({
          modifiers: {
            open: open,
            opening: opening,
            closing: closing,
            animate: animate,
          },
          extra: props.className,
        })}
      >
        {props.children}
      </div>
      <div className="full-screen-dialog-scrim"></div>
    </>
  );
};

export const FullScreenDialogAppBar = (props: DivProps) => {
  return (
    <>
      <TopAppBar {...props} className={bemClasses({ element: "app-bar", extra: props.className })}>
        {props.children}
      </TopAppBar>
      <TopAppBarFixedAdjust />
    </>
  );
};

export const FullScreenDialogContent = (props: DivProps) => {
  return (
    <div {...props} className={bemClasses({ element: "content", extra: props.className })}>
      {props.children}
    </div>
  );
};
