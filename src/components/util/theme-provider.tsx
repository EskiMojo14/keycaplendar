import React, { useState, useEffect, createContext } from "react";
import { alpha, createTheme, ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import { Theme } from "@nivo/core";
import { useAppSelector } from "~/app/hooks";
import { selectCurrentThemeMap } from "@s/common";
import { blankTheme } from "@s/common/constants";
import { getTextOpacity } from "@s/common/functions";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const currentThemeMap = useAppSelector(selectCurrentThemeMap) || blankTheme;
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

export const NivoThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const currentThemeMap = useAppSelector(selectCurrentThemeMap) || blankTheme;
  const [theme, setTheme] = useState<Theme>({});
  useEffect(() => {
    setTheme({
      background: "transparent",
      textColor: currentThemeMap.textHigh,
      fontFamily: "inherit",
      axis: {
        ticks: {
          line: {
            stroke: currentThemeMap.divider,
          },
          text: {
            fill: currentThemeMap.textMedium,
          },
        },
        domain: {
          line: {
            stroke: currentThemeMap.divider,
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
          stroke: currentThemeMap.divider,
        },
      },
      crosshair: {
        line: {
          stroke: currentThemeMap.textMedium,
          strokeOpacity: 1,
        },
      },
      tooltip: {
        container: {
          fontFamily: "inherit",
          textTransform: "capitalize",
          backgroundColor: currentThemeMap.textHigh,
          color: currentThemeMap.surface,
          //boxShadow: "none",
          borderRadius: 4,
        },
        chip: {
          borderRadius: "50%",
        },
      },
    });
  }, [currentThemeMap]);
  return <NivoThemeContext.Provider value={theme}>{children}</NivoThemeContext.Provider>;
};
