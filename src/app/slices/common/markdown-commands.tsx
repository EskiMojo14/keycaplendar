import { IconButton } from "@rmwc/icon-button";
import { Command, MarkdownUtil, TextApi, TextState } from "react-mde";
import { markdownIcons } from "./markdown-constants";

// define the custom command handlers
const customPrefix = (initialState: TextState, api: TextApi, prefix: string) => {
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
};

// define the custom command handlers
const customSuffix = (initialState: TextState, api: TextApi, suffix: string) => {
  // Adjust the selection to encompass the whole word if the caret is inside one
  const newSelectionRange = MarkdownUtil.selectWord({
    text: initialState.text,
    selection: initialState.selection,
  });

  const state1 = api.setSelectionRange(newSelectionRange);
  // Add the prefix to the selection
  const state2 = api.replaceSelection(`${state1.selectedText}${suffix}`);
  // Adjust the selection to not contain the prefix
  api.setSelectionRange({
    start: state2.selection.end,
    end: state2.selection.end,
  });
};

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

export const insertTableCommand: Command = {
  icon: Object.assign(
    () => <IconButton tag="div" icon={markdownIcons["insert-table"]} role="img" aria-label="Insert table" />,
    {
      displayName: "InsertTableIcon",
    }
  ),
  execute: ({ initialState, textApi }) => {
    customSuffix(initialState, textApi, `| a | b  |  c |  d  |\n| - | :- | -: | :-: |\n|  |  |  |  |`);
  },
};

export const insertTableColumnAfter: Command = {
  icon: Object.assign(
    () => <IconButton tag="div" icon={markdownIcons["column-after"]} role="img" aria-label="Insert column after" />,
    {
      displayName: "ColumnAfterIcon",
    }
  ),
  execute: ({ initialState, textApi }) => {
    const splitText = initialState.selectedText.split("\n");
    const splitLines = splitText.map((line) => line.split("|").map((cell) => cell.trim()));
    const tableRows = splitText.map(
      (line, index) => line.charAt(0) === "|" || (index > 0 && splitText[index - 1].charAt(0) === "|")
    );
    const alignmentRows = splitText.map(
      (line, index) => tableRows[index] && !/(?![:\- \|])./g.test(line) && /([:\-])/g.test(line)
    );
    const adjustedLines = splitLines.map((line, index) => (tableRows[index] ? line.slice(1, line.length - 1) : line));
    const rowNumber = Math.max(...adjustedLines.filter((value, index) => tableRows[index]).map((arr) => arr.length));
    const newLines = splitLines
      .map((array, index) =>
        tableRows[index]
          ? `| ${new Array(rowNumber + 1)
              .fill("")
              .map((item, itemIndex) =>
                splitLines[index][itemIndex + 1] ? splitLines[index][itemIndex + 1] : alignmentRows[index] ? "-" : ""
              )
              .join(" | ")} |`
          : `| ${array.join(" | ")} |`
      )
      .join("\n");
    // Adjust the selection to encompass the whole word if the caret is inside one
    const newSelectionRange = MarkdownUtil.selectWord({
      text: initialState.text,
      selection: initialState.selection,
    });

    textApi.setSelectionRange(newSelectionRange);
    // Add the prefix to the selection
    const state2 = textApi.replaceSelection(newLines);
    // Adjust the selection to not contain the prefix
    textApi.setSelectionRange({
      start: state2.selection.end,
      end: state2.selection.end,
    });
  },
};
