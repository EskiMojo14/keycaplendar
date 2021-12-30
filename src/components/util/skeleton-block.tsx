import type { HTMLAttributes } from "react";
import type { TypographyT } from "@rmwc/typography";
import BEMHelper from "@s/common/bem-helper";
import "./skeleton-block.scss";

export type SkeletonBlockProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  width?: number | string;
  height?: number | string;
  afterHeight?: number | string;
  typography?: TypographyT;
  content?: string;
  colour?: string;
  double?: boolean;
  constrain?: boolean;
};

const bemClasses = new BEMHelper("skeleton-block");

export const SkeletonBlock = ({
  constrain,
  height,
  width,
  typography,
  content,
  afterHeight = constrain ? "1em" : undefined,
  className = "",
  style = {},
  colour,
  double,
  ...props
}: SkeletonBlockProps) => (
  <div
    {...props}
    className={bemClasses({
      modifiers: {
        typography: !!typography || !!content,
        double: !!double,
      },
      extra: { [className]: !!className, [`mdc-typography--${typography}`]: !!typography },
    })}
    style={{
      ...style,
      height,
      width,
      [`--content`]: `"${content}"`,
      [`--after-height`]: afterHeight,
      [`--color`]: colour,
    }}
  >
    {content && <span className={bemClasses("content")}>{content}</span>}
  </div>
);
