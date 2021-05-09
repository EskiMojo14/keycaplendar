/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import ReactMarkdown, { ReactMarkdownOptions } from "react-markdown";
import { Typography, TypographyT } from "@rmwc/typography";
import "./ReactMarkdown.scss";

const typographyBuilder = (tag: string, typography: TypographyT) => {
  const component = (props: Record<string, any>) => {
    const { node, ordered, children, ...allProps } = props;
    return (
      <Typography use={typography} tag={tag} {...allProps}>
        {children}
      </Typography>
    );
  };
  component.displayName = "Custom " + tag;
  return component;
};

const components = {
  h1: typographyBuilder("h1", "headline5"),
  h2: typographyBuilder("h2", "headline6"),
  h3: typographyBuilder("h3", "subtitle2"),
  p: typographyBuilder("p", "body2"),
  li: typographyBuilder("li", "body2"),
};

type CustomReactMarkdownProps = ReactMarkdownOptions;

export const CustomReactMarkdown = (props: CustomReactMarkdownProps) => {
  return (
    <ReactMarkdown components={components} className="markdown">
      {props.children}
    </ReactMarkdown>
  );
};
