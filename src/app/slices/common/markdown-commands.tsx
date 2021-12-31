import { IconButton } from "@rmwc/icon-button";
import { MarkdownUtil } from "react-mde";
import type { Command, TextApi, TextState } from "react-mde";
import { markdownIcons } from "./markdown-constants";

// define the custom command handlers
const customPrefix = (
  initialState: TextState,
  api: TextApi,
  prefix: string
) => {
  // Adjust the selection to encompass the whole word if the caret is inside one
  const newSelectionRange = MarkdownUtil.selectWord({
    selection: initialState.selection,
    text: initialState.text,
  });

  const state1 = api.setSelectionRange(newSelectionRange);
  // Add the prefix to the selection
  const state2 = api.replaceSelection(`${prefix}${state1.selectedText}`);
  // Adjust the selection to not contain the prefix
  api.setSelectionRange({
    end: state2.selection.end,
    start: state2.selection.end,
  });
};

// define the custom command handlers
const customSuffix = (
  initialState: TextState,
  api: TextApi,
  suffix: string
) => {
  // Adjust the selection to encompass the whole word if the caret is inside one
  const newSelectionRange = MarkdownUtil.selectWord({
    selection: initialState.selection,
    text: initialState.text,
  });

  const state1 = api.setSelectionRange(newSelectionRange);
  // Add the prefix to the selection
  const state2 = api.replaceSelection(`${state1.selectedText}${suffix}`);
  // Adjust the selection to not contain the prefix
  api.setSelectionRange({
    end: state2.selection.end,
    start: state2.selection.end,
  });
};

export const headerOneCommand: Command = {
  execute: ({ initialState, textApi }) => {
    customPrefix(initialState, textApi, "# ");
  },
  icon: Object.assign(
    () => (
      <IconButton
        aria-label="Add header one"
        icon={markdownIcons.h1}
        role="img"
        tag="div"
      />
    ),
    {
      displayName: "H1Icon",
    }
  ),
};

export const headerTwoCommand: Command = {
  execute: ({ initialState, textApi }) => {
    customPrefix(initialState, textApi, "## ");
  },
  icon: Object.assign(
    () => (
      <IconButton
        aria-label="Add header two"
        icon={markdownIcons.h2}
        role="img"
        tag="div"
      />
    ),
    {
      displayName: "H2Icon",
    }
  ),
};

export const headerThreeCommand: Command = {
  execute: ({ initialState, textApi }) => {
    customPrefix(initialState, textApi, "### ");
  },
  icon: Object.assign(
    () => (
      <IconButton
        aria-label="Add header three"
        icon={markdownIcons.h3}
        role="img"
        tag="div"
      />
    ),
    {
      displayName: "H3Icon",
    }
  ),
};

export const headerFourCommand: Command = {
  execute: ({ initialState, textApi }) => {
    customPrefix(initialState, textApi, "#### ");
  },
  icon: Object.assign(
    () => (
      <IconButton
        aria-label="Add header four"
        icon={markdownIcons.h4}
        role="img"
        tag="div"
      />
    ),
    {
      displayName: "H4Icon",
    }
  ),
};

export const headerFiveCommand: Command = {
  execute: ({ initialState, textApi }) => {
    customPrefix(initialState, textApi, "##### ");
  },
  icon: Object.assign(
    () => (
      <IconButton
        aria-label="Add header five"
        icon={markdownIcons.h5}
        role="img"
        tag="div"
      />
    ),
    {
      displayName: "H5Icon",
    }
  ),
};

export const headerSixCommand: Command = {
  execute: ({ initialState, textApi }) => {
    customPrefix(initialState, textApi, "###### ");
  },
  icon: Object.assign(
    () => (
      <IconButton
        aria-label="Add header six"
        icon={markdownIcons.h6}
        role="img"
        tag="div"
      />
    ),
    {
      displayName: "H6Icon",
    }
  ),
};

export const insertTableCommand: Command = {
  execute: ({ initialState, textApi }) => {
    customSuffix(
      initialState,
      textApi,
      `| a | b  |  c |  d  |\n| - | :- | -: | :-: |\n|  |  |  |  |`
    );
  },
  icon: Object.assign(
    () => (
      <IconButton
        aria-label="Insert table"
        icon={markdownIcons["insert-table"]}
        role="img"
        tag="div"
      />
    ),
    {
      displayName: "InsertTableIcon",
    }
  ),
};

export const insertTableColumnAfter: Command = {
  execute: ({ initialState, textApi }) => {
    const splitText = initialState.selectedText.split("\n");
    const splitLines = splitText.map((line) =>
      line.split("|").map((cell) => cell.trim())
    );
    const tableRows = splitText.map(
      (line, index) =>
        line.charAt(0) === "|" ||
        (index > 0 && splitText[index - 1].charAt(0) === "|")
    );
    const alignmentRows = splitText.map(
      (line, index) =>
        tableRows[index] &&
        !/(?![:\- \|])./g.test(line) &&
        /([:\-])/g.test(line)
    );
    const adjustedLines = splitLines.map((line, index) =>
      tableRows[index] ? line.slice(1, line.length - 1) : line
    );
    const rowNumber = Math.max(
      ...adjustedLines
        .filter((value, index) => tableRows[index])
        .map((arr) => arr.length)
    );
    const newLines = splitLines
      .map((array, index) =>
        tableRows[index]
          ? `| ${new Array(rowNumber + 1)
              .fill("")
              .map((item, itemIndex) =>
                splitLines[index][itemIndex + 1]
                  ? splitLines[index][itemIndex + 1]
                  : alignmentRows[index]
                  ? "-"
                  : ""
              )
              .join(" | ")} |`
          : `| ${array.join(" | ")} |`
      )
      .join("\n");
    // Adjust the selection to encompass the whole word if the caret is inside one
    const newSelectionRange = MarkdownUtil.selectWord({
      selection: initialState.selection,
      text: initialState.text,
    });

    textApi.setSelectionRange(newSelectionRange);
    // Add the prefix to the selection
    const state2 = textApi.replaceSelection(newLines);
    // Adjust the selection to not contain the prefix
    textApi.setSelectionRange({
      end: state2.selection.end,
      start: state2.selection.end,
    });
  },
  icon: Object.assign(
    () => (
      <IconButton
        aria-label="Insert column after"
        icon={markdownIcons["column-after"]}
        role="img"
        tag="div"
      />
    ),
    {
      displayName: "ColumnAfterIcon",
    }
  ),
};
