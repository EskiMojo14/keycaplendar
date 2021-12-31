import type { ReactNode } from "react";
import {
  alpha,
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@material-ui/core/styles";
import { useAppSelector } from "~/app/hooks";
import { selectCurrentThemeMap } from "@s/common";
import { blankTheme } from "@s/common/constants";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const currentThemeMap = useAppSelector(selectCurrentThemeMap) || blankTheme;
  const theme = currentThemeMap.primary
    ? createTheme({
        palette: {
          type: currentThemeMap.dark ? "dark" : "light",
          primary: {
            main: currentThemeMap.primary,
            contrastText: currentThemeMap.onPrimary,
          },
          secondary: {
            main: currentThemeMap.secondary,
            contrastText: currentThemeMap.onSecondary,
          },
          error: {
            main: currentThemeMap.error,
            contrastText: currentThemeMap.onError,
          },
          text: {
            primary: alpha(currentThemeMap.onSurface, 0.87),
            secondary: alpha(currentThemeMap.onSurface, 0.6),
            disabled: alpha(currentThemeMap.onSurface, 0.38),
          },
          action: {
            active: currentThemeMap.onSurface,
            hover: alpha(currentThemeMap.onSurface, 0.08),
            selected: alpha(currentThemeMap.onSurface, 0.16),
            disabled: alpha(currentThemeMap.onSurface, 0.3),
            disabledBackground: alpha(currentThemeMap.onSurface, 0.12),
          },
          background: {
            paper: currentThemeMap.surface,
            default: currentThemeMap.background,
          },
          divider: alpha(currentThemeMap.onSurface, 0.12),
        },
      })
    : createTheme();
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};
