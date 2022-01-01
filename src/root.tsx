import LuxonUtils from "@date-io/luxon";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { RMWCProvider } from "@rmwc/provider";
import type { DateTime } from "luxon";
import { Provider } from "react-redux";
import store from "~/app/store";
import { NivoThemeProvider, ThemeProvider } from "@c/util/theme-provider";
import App from "./app";

class LocalizedUtils extends LuxonUtils {
  getDatePickerHeaderText(date: DateTime) {
    return date.toLocaleString({
      day: "numeric",
      month: "short",
      weekday: "short",
    });
  }
}

export const Root = () => (
  <Provider store={store}>
    <MuiPickersUtilsProvider utils={LocalizedUtils}>
      <ThemeProvider>
        <NivoThemeProvider>
          <RMWCProvider tooltip={{ align: "bottom", enterDelay: 500 }}>
            <App />
          </RMWCProvider>
        </NivoThemeProvider>
      </ThemeProvider>
    </MuiPickersUtilsProvider>
  </Provider>
);
