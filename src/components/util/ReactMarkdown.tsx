import React, { useState } from "react";
import classNames from "classnames";
import BEMHelper from "../../app/slices/common/bemHelper";
import { iconObject } from "../../app/slices/common/functions";
import { typographyBuilder } from "../../app/slices/common/markdownFunctions";
import ReactMarkdown, { ReactMarkdownOptions } from "react-markdown";
import ReactMde, { ChildProps, Classes, L18n, ReactMdeProps } from "react-mde";
import { IconButton } from "@rmwc/icon-button";
import { IconPropT } from "@rmwc/types";
import { SegmentedButton, SegmentedButtonSegment } from "./SegmentedButton";
import "./ReactMarkdown.scss";

const customComponents = {
  h1: typographyBuilder("h1", "headline5"),
  h2: typographyBuilder("h2", "headline6"),
  h3: typographyBuilder("h3", "overline"),
  h4: typographyBuilder("h4", "subtitle1"),
  h5: typographyBuilder("h4", "subtitle2"),
  h6: typographyBuilder("h5", "caption"),
  p: typographyBuilder("p", "body2"),
  li: typographyBuilder("li", "body2"),
  code: typographyBuilder("code", "body2"),
};

type CustomReactMarkdownProps = ReactMarkdownOptions;

export const CustomReactMarkdown = (props: CustomReactMarkdownProps) => {
  const { components, className, children, ...filteredProps } = props;
  return (
    <ReactMarkdown
      components={{ ...customComponents, ...components }}
      className={classNames("markdown", className)}
      {...filteredProps}
    >
      {children}
    </ReactMarkdown>
  );
};
const bemClasses = new BEMHelper("markdown-editor");

const icons: Record<string, IconPropT> = {
  header: "title",
  bold: "format_bold",
  italic: "format_italic",
  strikethrough: "strikethrough_s",
  link: "link",
  quote: "format_quote",
  code: "code",
  image: iconObject(
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M5 19h14V5H5v14zm4-5.86l2.14 2.58 3-3.87L18 17H6l3-3.86z" opacity=".3" />
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-4.86-7.14l-3 3.86L9 13.14 6 17h12z" />
    </svg>
  ),
  "unordered-list": "format_list_bulleted",
  "ordered-list": "format_list_numbered",
  "checked-list": "checklist",
};

type CustomReactMdeProps = Omit<ReactMdeProps, "generateMarkdownPreview" | "selectedTab" | "onTabChange"> & {
  required?: boolean;
};

export const CustomReactMde = (props: CustomReactMdeProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { toolbarCommands, l18n, classes, childProps, required, value, ...filteredProps } = props;
  const customToolbarCommands = toolbarCommands
    ? toolbarCommands
    : [
        ["bold", "italic"],
        ["link", "code"],
        ["unordered-list", "ordered-list"],
      ];
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
  const customTabButtons: L18n = {
    write: (
      <SegmentedButton toggle>
        <SegmentedButtonSegment
          label="Write"
          tag="div"
          selected={selectedTab === "write"}
          onClick={() => setSelectedTab("write")}
        />
        <SegmentedButtonSegment
          label="Preview"
          tag="div"
          selected={selectedTab === "preview"}
          onClick={() => setSelectedTab("preview")}
        />
      </SegmentedButton>
    ),
    preview: null,
    uploadingImage: "Uploading image...",
    pasteDropSelect: "Attach files by dragging & dropping, selecting or pasting them.",
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onTabChange = () => {};

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const customClasses: Classes = {
    reactMde: [bemClasses(), classes ? classes.reactMde : ""],
    toolbar: [bemClasses("toolbar"), classes ? classes.toolbar : ""],
    preview: [bemClasses("preview"), classes ? classes.preview : ""],
    textArea: [bemClasses("textarea", { hovered, focused, invalid }), classes ? classes.textArea : ""],
    suggestionsDropdown: [bemClasses("dropdown"), classes ? classes.suggestionsDropdown : ""],
  };

  const customChildProps: ChildProps = {
    ...childProps,
    textArea: {
      ...childProps?.textArea,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setFocused(true),
      onBlur: () => {
        setFocused(false);
        if (required) {
          setInvalid(value.length === 0);
        }
      },
      onInvalid: () => setInvalid(true),
      required: required,
    },
  };
  return (
    <ReactMde
      selectedTab={selectedTab}
      onTabChange={onTabChange}
      value={value}
      toolbarCommands={customToolbarCommands}
      l18n={customTabButtons}
      classes={customClasses}
      getIcon={(command) => <IconButton tag="div" icon={icons[command]} />}
      generateMarkdownPreview={(markdown) => Promise.resolve(<CustomReactMarkdown>{markdown}</CustomReactMarkdown>)}
      childProps={customChildProps}
      {...filteredProps}
    />
  );
};
