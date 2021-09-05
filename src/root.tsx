import React from "react";
import { Provider } from "react-redux";
import { RMWCProvider } from "@rmwc/provider";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import LuxonUtils from "@date-io/luxon";
import { DateTime } from "luxon";
import App from "./app";
import store from "~/app/store";
import { NivoThemeProvider, ThemeProvider } from "@c/util/theme-provider";

class LocalizedUtils extends LuxonUtils {
  getDatePickerHeaderText(date: DateTime) {
    return date.toLocaleString({ weekday: "short", month: "short", day: "numeric" });
  }
}

export const Root = () => (
  <Provider store={store}>
    <MuiPickersUtilsProvider utils={LocalizedUtils}>
      <ThemeProvider>
        <NivoThemeProvider>
          <RMWCProvider tooltip={{ enterDelay: 500, align: "bottom" }}>
            <App />
          </RMWCProvider>
        </NivoThemeProvider>
      </ThemeProvider>
    </MuiPickersUtilsProvider>
  </Provider>
);
