import React from "react";
import { Provider } from "react-redux";
import { RMWCProvider } from "@rmwc/provider";
import App from "./App";
import store from "~/app/store";

export const Root = () => {
  return (
    <Provider store={store}>
      <RMWCProvider tooltip={{ enterDelay: 500, align: "bottom" }}>
        <App />
      </RMWCProvider>
    </Provider>
  );
};
