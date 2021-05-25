import React from "react";
import { TypographyT, Typography } from "@rmwc/typography";
import { Command, MarkdownUtil, TextApi, TextState } from "react-mde";
import { IconButton } from "@rmwc/icon-button";
import { markdownIcons } from "./markdownConstants";

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

// define the custom command handlers
function customPrefix(initialState: TextState, api: TextApi, prefix: string) {
  // Adjust the selection to encompass the whole word if the caret is inside one
  const newSelectionRange = MarkdownUtil.selectWord({
    text: initialState.text,
    selection: initialState.selection,
  });

  const state1 = api.setSelectionRange(newSelectionRange);
  // Add the prefix to the selection
  const state2 = api.replaceSelection(`${prefix}${state1.selectedText}`);
  // Adjust the selection to not contain the prefix
  api.setSelectionRange({
    start: state2.selection.end,
    end: state2.selection.end,
  });
}

export const headerOneCommand: Command = {
  icon: Object.assign(() => <IconButton tag="div" icon={markdownIcons.h1} role="img" aria-label="Add header one" />, {
    displayName: "H1Icon",
  }),
  execute: ({ initialState, textApi }) => {
    customPrefix(initialState, textApi, "# ");
  },
};

export const headerTwoCommand: Command = {
  icon: Object.assign(() => <IconButton tag="div" icon={markdownIcons.h2} role="img" aria-label="Add header two" />, {
    displayName: "H2Icon",
  }),
  execute: ({ initialState, textApi }) => {
    customPrefix(initialState, textApi, "## ");
  },
};

export const headerThreeCommand: Command = {
  icon: Object.assign(() => <IconButton tag="div" icon={markdownIcons.h3} role="img" aria-label="Add header three" />, {
    displayName: "H3Icon",
  }),
  execute: ({ initialState, textApi }) => {
    customPrefix(initialState, textApi, "### ");
  },
};

export const headerFourCommand: Command = {
  icon: Object.assign(() => <IconButton tag="div" icon={markdownIcons.h4} role="img" aria-label="Add header four" />, {
    displayName: "H4Icon",
  }),
  execute: ({ initialState, textApi }) => {
    customPrefix(initialState, textApi, "#### ");
  },
};

export const headerFiveCommand: Command = {
  icon: Object.assign(() => <IconButton tag="div" icon={markdownIcons.h5} role="img" aria-label="Add header five" />, {
    displayName: "H5Icon",
  }),
  execute: ({ initialState, textApi }) => {
    customPrefix(initialState, textApi, "##### ");
  },
};

export const headerSixCommand: Command = {
  icon: Object.assign(() => <IconButton tag="div" icon={markdownIcons.h6} role="img" aria-label="Add header six" />, {
    displayName: "H6Icon",
  }),
  execute: ({ initialState, textApi }) => {
    customPrefix(initialState, textApi, "###### ");
  },
};
