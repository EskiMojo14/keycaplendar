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

export const SegmentedButton = ({
  className,
  toggle,
  ...props
}: SegmentedButtonProps) => (
  <div
    {...props}
    className={bemClasses({
      extra: className,
      modifiers: { toggle: !!toggle },
    })}
  />
);

type SegmentedButtonSegmentProps = ButtonHTMLProps &
  ButtonProps & {
    selected?: boolean;
  };

export const SegmentedButtonSegment = ({
  className,
  icon,
  label,
  selected = false,
  ...props
}: SegmentedButtonSegmentProps) => (
  <Button
    {...props}
    {...{ icon, label }}
    className={bemClasses(
      "segment",
      { "only-icon": !!icon && !label, selected },
      className
    )}
    outlined
  />
);
