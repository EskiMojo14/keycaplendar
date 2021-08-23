import React from "react";
import { Provider } from "react-redux";
import { RMWCProvider } from "@rmwc/provider";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import LuxonUtils from "@date-io/luxon";
import App from "./App";
import store from "~/app/store";

export const Root = () => {
  return (
    <Provider store={store}>
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <RMWCProvider tooltip={{ enterDelay: 500, align: "bottom" }}>
          <App />
        </RMWCProvider>
      </MuiPickersUtilsProvider>
    </Provider>
  );
};
