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

export const SegmentedButton = ({ toggle, className, ...filteredProps }: SegmentedButtonProps) => (
  <div {...filteredProps} className={bemClasses({ modifiers: { toggle: !!toggle }, extra: className })} />
);

type SegmentedButtonSegmentProps = ButtonHTMLProps &
  ButtonProps & {
    selected?: boolean;
  };

export const SegmentedButtonSegment = ({
  selected = false,
  icon,
  label,
  className,
  ...props
}: SegmentedButtonSegmentProps) => (
  <Button
    {...props}
    {...{ icon, label }}
    outlined
    className={bemClasses("segment", { "only-icon": !!icon && !label, selected }, className)}
  />
);
