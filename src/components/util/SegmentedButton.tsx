import React from "react";
import BEMHelper from "../../util/bemHelper";
import { HTMLProps } from "../../util/types";
import { Button, ButtonProps } from "@rmwc/button";
import "./SegmentedButton.scss";

const bemClasses = new BEMHelper("segmented-button");

type SegmentedButtonProps = HTMLProps & {
  toggle?: boolean;
};

export const SegmentedButton = (props: SegmentedButtonProps) => {
  const { toggle, ...filteredProps } = props;
  return (
    <div {...filteredProps} className={bemClasses({ modifiers: { toggle: !!toggle }, extra: props.className })}>
      {props.children}
    </div>
  );
};

type SegmentedButtonSegmentProps = HTMLProps &
  ButtonProps & {
    selected?: boolean;
  };

export const SegmentedButtonSegment = (props: SegmentedButtonSegmentProps) => {
  const selected = props.selected ? props.selected : false;
  return (
    <Button
      {...props}
      outlined
      className={bemClasses(
        "segment",
        { "only-icon": !!props.icon && !props.label, selected: selected },
        props.className
      )}
    />
  );
};
