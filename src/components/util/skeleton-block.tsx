import type { TypographyT } from "@rmwc/typography";
import BEMHelper from "@s/common/bem-helper";
import "./skeleton-block.scss";

export type SkeletonBlockProps<Tag extends keyof JSX.IntrinsicElements = "div"> = Omit<
  JSX.IntrinsicElements[Tag],
  "children"
> & {
  width?: number | string;
  height?: number | string;
  afterHeight?: number | string;
  typography?: TypographyT;
  content?: string;
  colour?: string;
  double?: boolean;
  constrain?: boolean;
  tag?: Tag;
};

const bemClasses = new BEMHelper("skeleton-block");

export const SkeletonBlock = <HTMLTag extends keyof JSX.IntrinsicElements = "div">({
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
  tag: Tag = "div" as HTMLTag,
  ...props
}: SkeletonBlockProps<HTMLTag>) => (
  // @ts-expect-error pain
  <Tag
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
      [`--content`]: content && `"${content}"`,
      [`--after-height`]: afterHeight,
      [`--color`]: colour,
    }}
  >
    {content && <span className={bemClasses("content")}>{content}</span>}
  </Tag>
);

export const SkeletonIcon = (props: Omit<SkeletonBlockProps, "height" | "tag" | "width">) => (
  <SkeletonBlock height={24} width={24} {...props} />
);
