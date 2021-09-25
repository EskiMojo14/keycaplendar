import { FunctionComponent } from "react";
import { TypographyT, Typography } from "@rmwc/typography";

export const componentBuilder = (name: string, Component: FunctionComponent) =>
  Object.assign(
    (props: Record<string, any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { node, ordered, level, inline, isHeader, ...allProps } = props;
      return <Component {...allProps} />;
    },
    { displayName: "Custom " + name }
  );

export const typographyBuilder = (tag: string, typography: TypographyT) => {
  const component = (props: Record<string, any>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { node, ordered, level, inline, children, ...allProps } = props;
    return (
      <Typography use={typography} tag={tag} {...allProps}>
        {children}
      </Typography>
    );
  };
  component.displayName = "Custom " + tag;
  return component;
};
