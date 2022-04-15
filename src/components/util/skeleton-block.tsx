import type { TypographyT } from "@rmwc/typography";
import { nanoid } from "nanoid";
import BEMHelper from "@s/common/bem-helper";
import { randomInt } from "@s/util/functions";
import "./skeleton-block.scss";

export type SkeletonBlockProps<
  Tag extends keyof JSX.IntrinsicElements = "div"
> = Omit<JSX.IntrinsicElements[Tag], "children"> & {
  colour?: string;
  constrain?: boolean;
  content?: string;
  height?: number | string;
  maxContentLength?: number;
  minContentLength?: number;
  tag?: Tag;
  typography?: TypographyT;
  width?: number | string;
};

const bemClasses = new BEMHelper("skeleton-block");

export const SkeletonBlock = <
  HTMLTag extends keyof JSX.IntrinsicElements = "div"
>({
  className = "",
  colour,
  constrain,
  content,
  height,
  maxContentLength,
  minContentLength,
  style = {},
  tag: Tag = "div" as HTMLTag,
  typography,
  width,
  ...props
}: SkeletonBlockProps<HTMLTag>) => {
  const finalContent =
    content ??
    (maxContentLength || minContentLength
      ? nanoid(randomInt(minContentLength, maxContentLength))
      : undefined);
  return (
    // @ts-expect-error pain
    <Tag
      {...props}
      className={bemClasses({
        extra: {
          [className]: !!className,
          [`mdc-typography--${typography}`]: !!typography,
        },
        modifiers: {
          constrain: !!constrain,
          typography: !!typography || !!finalContent,
        },
      })}
      style={{
        ...style,
        [`--color`]: colour,
        [`--content`]: finalContent && `"${finalContent}"`,
        height,
        width,
      }}
    >
      {finalContent && (
        <span className={bemClasses("content")}>{finalContent}</span>
      )}
    </Tag>
  );
};

export const SkeletonIcon = ({
  className,
  ...props
}: Omit<SkeletonBlockProps, "height" | "tag" | "width">) => (
  <SkeletonBlock
    className={bemClasses({ extra: className, modifiers: "icon" })}
    height={24}
    width={24}
    {...props}
  />
);
