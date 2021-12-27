import LuxonUtils from "@date-io/luxon";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { RMWCProvider } from "@rmwc/provider";
import type { DateTime } from "luxon";
import { Provider } from "react-redux";
import store from "~/app/store";
import { ThemeProvider } from "@c/util/theme-provider";
import App from "./app";

class LocalizedUtils extends LuxonUtils {
  getDatePickerHeaderText(date: DateTime) {
    return date.toLocaleString({ weekday: "short", month: "short", day: "numeric" });
  }
}

export const Root = () => {
  return (
    <Provider store={store}>
      <MuiPickersUtilsProvider utils={LocalizedUtils}>
        <ThemeProvider>
          <RMWCProvider tooltip={{ enterDelay: 500, align: "bottom" }}>
            <App />
          </RMWCProvider>
        </ThemeProvider>
      </MuiPickersUtilsProvider>
    </Provider>
  );
};
