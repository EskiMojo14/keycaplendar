import { HTMLAttributes } from "react";
import BEMHelper from "@s/common/bemHelper";
import { Button, ButtonHTMLProps, ButtonProps } from "@rmwc/button";
import "./SegmentedButton.scss";

const bemClasses = new BEMHelper("segmented-button");

type DivProps = HTMLAttributes<HTMLDivElement>;

type SegmentedButtonProps = DivProps & {
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

type SegmentedButtonSegmentProps = ButtonProps &
  ButtonHTMLProps & {
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
