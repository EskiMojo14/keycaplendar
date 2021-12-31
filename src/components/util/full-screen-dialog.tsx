import { useEffect, useState } from "react";
import type { HTMLAttributes } from "react";
import { TopAppBar, TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import BEMHelper from "@s/common/bem-helper";
import "./full-screen-dialog.scss";

const bemClasses = new BEMHelper("full-screen-dialog");

type FullScreenDialogProps = HTMLAttributes<HTMLDivElement> & {
  onClose: () => void;
  open: boolean;
};

export const FullScreenDialog = ({
  children,
  className,
  onClose,
  open: propsOpen,
  ...filteredProps
}: FullScreenDialogProps) => {
  const [open, setOpen] = useState(!!propsOpen);
  const [opening, setOpening] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [closing, setClosing] = useState(false);
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
      onClose?.();
      setOpen(false);
      setClosing(false);
    }, 400);
  };
  useEffect(() => {
    if (propsOpen) {
      openDialog();
    } else {
      closeDialog();
    }
  }, [propsOpen]);
  return (
    <>
      <div
        {...filteredProps}
        className={bemClasses({
          modifiers: {
            open,
            opening,
            closing,
            animate,
          },
          extra: className,
        })}
      >
        {children}
      </div>
      <div className="full-screen-dialog-scrim"></div>
    </>
  );
};

export const FullScreenDialogAppBar = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <>
    <TopAppBar
      {...props}
      className={bemClasses({ element: "app-bar", extra: className })}
    />
    <TopAppBarFixedAdjust />
  </>
);

export const FullScreenDialogContent = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    className={bemClasses({ element: "content", extra: className })}
  />
);
