import type { HTMLAttributes } from "react";
import { Button } from "@rmwc/button";
import type { ButtonHTMLProps, ButtonProps } from "@rmwc/button";
import BEMHelper from "@s/common/bem-helper";
import "./segmented-button.scss";

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

type SegmentedButtonSegmentProps = ButtonHTMLProps &
  ButtonProps & {
    selected?: boolean;
  };

export const SegmentedButtonSegment = (props: SegmentedButtonSegmentProps) => {
  const selected = props.selected ? props.selected : false;
  return (
    <Button
      {...props}
      outlined
      className={bemClasses("segment", { "only-icon": !!props.icon && !props.label, selected }, props.className)}
    />
  );
};
