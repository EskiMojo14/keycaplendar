import type { Dictionary } from "@reduxjs/toolkit";
import { camelise, hasKey } from "@s/util/functions";
import themesMap from "~/_themes.module.scss";

export type ThemeMap = {
  background: string;
  dark: boolean;
  error: string;
  onError: string;
  onPrimary: string;
  onSecondary: string;
  onSurface: string;
  primary: string;
  secondary: string;
  surface: string;
};

export const blankTheme: ThemeMap = {
  background: "",
  dark: false,
  error: "",
  onError: "",
  onPrimary: "",
  onSecondary: "",
  onSurface: "",
  primary: "",
  secondary: "",
  surface: "",
};

export const interpolatedThemeMap = Object.entries(themesMap).reduce<
  Dictionary<ThemeMap>
>((prev, [key, val]) => {
  const [theme, prop] = key.split("|");

  const copy = { ...prev };

  copy[theme] ??= blankTheme;

  const value = val === "true" || val === "false" ? val === "true" : val;
  const camelProp = camelise(prop, "-");
  if (hasKey(copy, theme) && hasKey(blankTheme, camelProp)) {
    copy[theme] = { ...copy[theme], [camelProp]: value } as ThemeMap;
  }
  return copy;
}, {});

export default interpolatedThemeMap;
