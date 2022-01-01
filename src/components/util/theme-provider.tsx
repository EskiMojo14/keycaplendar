import { createContext } from "react";
import type { ReactNode } from "react";
import {
  alpha,
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@material-ui/core/styles";
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
          action: {
            active: currentThemeMap.onSurface,
            disabled: alpha(currentThemeMap.onSurface, 0.3),
            disabledBackground: alpha(currentThemeMap.onSurface, 0.12),
            hover: alpha(currentThemeMap.onSurface, 0.08),
            selected: alpha(currentThemeMap.onSurface, 0.16),
          },
          background: {
            default: currentThemeMap.background,
            paper: currentThemeMap.surface,
          },
          divider: alpha(currentThemeMap.onSurface, 0.12),
          error: {
            contrastText: currentThemeMap.onError,
            main: currentThemeMap.error,
          },
          primary: {
            contrastText: currentThemeMap.onPrimary,
            dark: currentThemeMap.primaryDark,
            light: currentThemeMap.primaryLight,
            main: currentThemeMap.primary,
          },
          secondary: {
            contrastText: currentThemeMap.onSecondary,
            dark: currentThemeMap.secondaryDark,
            light: currentThemeMap.secondaryLight,
            main: currentThemeMap.secondary,
          },
          text: {
            disabled: alpha(
              currentThemeMap.onSurface,
              getTextOpacity("disabled")
            ),
            primary: alpha(currentThemeMap.onSurface, getTextOpacity("high")),
            secondary: alpha(
              currentThemeMap.onSurface,
              getTextOpacity("medium")
            ),
          },
          type: currentThemeMap.dark ? "dark" : "light",
        },
      })
    : createTheme();
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

export const NivoThemeContext = createContext<Theme>({});

const theme = {
  axis: {
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
    ticks: {
      line: {
        stroke: "var(--theme-divider)",
      },
      text: {
        fill: "var(--theme-text-medium)",
      },
    },
  },
  background: "transparent",
  crosshair: {
    line: {
      stroke: "var(--theme-text-medium)",
      strokeOpacity: 1,
    },
  },
  fontFamily: "inherit",
  grid: {
    line: {
      stroke: "var(--theme-divider)",
    },
  },
  textColor: "var(--theme-text-high)",
  tooltip: {
    chip: {
      borderRadius: "50%",
    },
    container: {
      backgroundColor: "var(--theme-text-high)",
      borderRadius: 4,
      boxShadow: "none",
      color: "var(--theme-surface)",
      fontFamily: "inherit",
      textTransform: "capitalize",
    },
  },
};

export const NivoThemeProvider = ({ children }: { children: ReactNode }) => (
  <NivoThemeContext.Provider value={theme}>
    {children}
  </NivoThemeContext.Provider>
);
