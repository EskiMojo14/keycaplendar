import type { TypographyT } from "@rmwc/typography";
import BEMHelper from "@s/common/bem-helper";
import "./skeleton-block.scss";

export type SkeletonBlockProps<
  Tag extends keyof JSX.IntrinsicElements = "div"
> = Omit<JSX.IntrinsicElements[Tag], "children"> & {
  width?: number | string;
  height?: number | string;
  typography?: TypographyT;
  content?: string;
  colour?: string;
  double?: boolean;
  constrain?: boolean;
  tag?: Tag;
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
  style = {},
  tag: Tag = "div" as HTMLTag,
  typography,
  width,
  ...props
}: SkeletonBlockProps<HTMLTag>) => (
  // @ts-expect-error pain
  <Tag
    {...props}
    className={bemClasses({
      modifiers: {
        typography: !!typography || !!content,
        constrain: !!constrain,
      },
      extra: {
        [className]: !!className,
        [`mdc-typography--${typography}`]: !!typography,
      },
    })}
    style={{
      ...style,
      height,
      width,
      [`--content`]: content && `"${content}"`,
      [`--color`]: colour,
    }}
  >
    {content && <span className={bemClasses("content")}>{content}</span>}
  </Tag>
);

export const SkeletonIcon = ({
  className,
  ...props
}: Omit<SkeletonBlockProps, "height" | "tag" | "width">) => (
  <SkeletonBlock
    className={bemClasses({ modifiers: "icon", extra: className })}
    height={24}
    width={24}
    {...props}
  />
);
