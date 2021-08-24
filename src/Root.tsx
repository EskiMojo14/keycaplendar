import React from "react";
import { Provider } from "react-redux";
import { RMWCProvider } from "@rmwc/provider";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import LuxonUtils from "@date-io/luxon";
import App from "./App";
import store from "~/app/store";
import { ThemeProvider } from "@c/util/ThemeProvider";

export const Root = () => {
  return (
    <Provider store={store}>
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <ThemeProvider>
          <RMWCProvider tooltip={{ enterDelay: 500, align: "bottom" }}>
            <App />
          </RMWCProvider>
        </ThemeProvider>
      </MuiPickersUtilsProvider>
    </Provider>
  );
};
