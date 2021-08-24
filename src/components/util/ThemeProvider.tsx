import React from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import { useAppSelector } from "~/app/hooks";
import { selectCurrentThemeMap } from "@s/common";
import { blankTheme } from "@s/common/constants";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const currentThemeMap = useAppSelector(selectCurrentThemeMap) || blankTheme;
  const theme = currentThemeMap.primary
    ? createTheme({
        palette: {
          type: currentThemeMap.dark ? "dark" : "light",
          primary: { main: currentThemeMap.primary, contrastText: currentThemeMap.onPrimary },
          secondary: { main: currentThemeMap.secondary, contrastText: currentThemeMap.onSecondary },
          error: { main: currentThemeMap.error, contrastText: currentThemeMap.onError },
          background: { paper: currentThemeMap.surface, default: currentThemeMap.background },
        },
      })
    : createTheme();
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};
