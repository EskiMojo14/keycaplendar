import { createContext } from "react";
import type { ReactNode } from "react";
import { alpha, createTheme, ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import type { Theme } from "@nivo/core";
import { useAppSelector } from "~/app/hooks";
import { selectTheme } from "@s/common";
import { blankTheme } from "@s/common/constants";
import { getTextOpacity } from "@s/common/functions";
import { camelise, hasKey } from "@s/util/functions";
import themeVariables from "~/theme-variables.json";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const currentTheme = useAppSelector(selectTheme);
  const camelisedKey = camelise(currentTheme, "-");
  const currentThemeMap = hasKey(themeVariables.themesMap, camelisedKey)
    ? themeVariables.themesMap[camelisedKey]
    : blankTheme;
  const theme = currentThemeMap.primary
    ? createTheme({
        palette: {
          type: currentThemeMap.dark ? "dark" : "light",
          primary: {
            light: currentThemeMap.primaryLight,
            main: currentThemeMap.primary,
            dark: currentThemeMap.primaryDark,
            contrastText: currentThemeMap.onPrimary,
          },
          secondary: {
            light: currentThemeMap.secondaryLight,
            main: currentThemeMap.secondary,
            dark: currentThemeMap.secondaryDark,
            contrastText: currentThemeMap.onSecondary,
          },
          error: { main: currentThemeMap.error, contrastText: currentThemeMap.onError },
          text: {
            primary: alpha(currentThemeMap.onSurface, getTextOpacity("high")),
            secondary: alpha(currentThemeMap.onSurface, getTextOpacity("medium")),
            disabled: alpha(currentThemeMap.onSurface, getTextOpacity("disabled")),
          },
          action: {
            active: currentThemeMap.onSurface,
            hover: alpha(currentThemeMap.onSurface, 0.08),
            selected: alpha(currentThemeMap.onSurface, 0.16),
            disabled: alpha(currentThemeMap.onSurface, 0.3),
            disabledBackground: alpha(currentThemeMap.onSurface, 0.12),
          },
          background: { paper: currentThemeMap.surface, default: currentThemeMap.background },
          divider: alpha(currentThemeMap.onSurface, 0.12),
        },
      })
    : createTheme();
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

export const NivoThemeContext = createContext<Theme>({});

const theme = {
  background: "transparent",
  textColor: "var(--theme-text-high)",
  fontFamily: "inherit",
  axis: {
    ticks: {
      line: {
        stroke: "var(--theme-divider)",
      },
      text: {
        fill: "var(--theme-text-medium)",
      },
    },
    domain: {
      line: {
        stroke: "var(--theme-divider)",
      },
    },
    legend: {
      text: {
        fontSize: 13,
        textRendering: "optimizeLegibility",
      },
    },
  },
  grid: {
    line: {
      stroke: "var(--theme-divider)",
    },
  },
  crosshair: {
    line: {
      stroke: "var(--theme-text-medium)",
      strokeOpacity: 1,
    },
  },
  tooltip: {
    container: {
      fontFamily: "inherit",
      textTransform: "capitalize",
      backgroundColor: "var(--theme-text-high)",
      color: "var(--theme-surface)",
      boxShadow: "none",
      borderRadius: 4,
    },
    chip: {
      borderRadius: "50%",
    },
  },
};

export const NivoThemeProvider = ({ children }: { children: ReactNode }) => (
  <NivoThemeContext.Provider value={theme}>{children}</NivoThemeContext.Provider>
);
