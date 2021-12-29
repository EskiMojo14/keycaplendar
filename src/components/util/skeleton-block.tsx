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
};

const bemClasses = new BEMHelper("skeleton-block");

export const SkeletonBlock = ({
  height,
  width,
  typography,
  content,
  afterHeight,
  className = "",
  style = {},
  ...props
}: SkeletonBlockProps) => (
  <div
    {...props}
    className={bemClasses({
      modifiers: {
        typography: !!typography,
      },
      extra: { [className]: !!className, [`mdc-typography--${typography}`]: !!typography },
    })}
    style={{ ...style, height, width, [`--content`]: `"${content}"`, [`--after-height`]: afterHeight }}
  >
    {content && <span className={bemClasses("content")}>{content}</span>}
  </div>
);
