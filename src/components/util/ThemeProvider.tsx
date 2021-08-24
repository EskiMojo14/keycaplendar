import React from "react";
import { createTheme, Theme, ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import { DeepPartial } from "@reduxjs/toolkit";
import { useAppSelector } from "~/app/hooks";
import { selectTheme, selectThemesMap } from "@s/common";
import { blankTheme } from "@s/common/constants";
import { hasKey } from "@s/common/functions";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const themeName = useAppSelector(selectTheme);
  const themesMap = useAppSelector(selectThemesMap);
  const currentThemeMap = hasKey(themesMap, themeName) ? themesMap[themeName] : blankTheme;
  const theme: DeepPartial<Theme> = hasKey(themesMap, themeName)
    ? createTheme({
        palette: {
          type: currentThemeMap.dark ? "dark" : "light",
          primary: { main: currentThemeMap.primary, contrastText: currentThemeMap.onPrimary },
          secondary: { main: currentThemeMap.secondary, contrastText: currentThemeMap.onSecondary },
          error: { main: currentThemeMap.error, contrastText: currentThemeMap.onError },
          background: { paper: currentThemeMap.surface, default: currentThemeMap.background },
        },
      })
    : {};
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};