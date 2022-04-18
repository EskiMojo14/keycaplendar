import type { ReactNode } from "react";
import {
  alpha,
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@material-ui/core/styles";
import { useAppSelector } from "@h";
import { selectCurrentThemeMap } from "@s/common";
import { blankTheme } from "@s/common/constants";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const currentThemeMap = useAppSelector(selectCurrentThemeMap) || blankTheme;
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
            main: currentThemeMap.primary,
          },
          secondary: {
            contrastText: currentThemeMap.onSecondary,
            main: currentThemeMap.secondary,
          },
          text: {
            disabled: alpha(currentThemeMap.onSurface, 0.38),
            primary: alpha(currentThemeMap.onSurface, 0.87),
            secondary: alpha(currentThemeMap.onSurface, 0.6),
          },
          type: currentThemeMap.dark ? "dark" : "light",
        },
      })
    : createTheme();
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};
