import type { UnsubscribeListener } from "@reduxjs/toolkit";
import type { AppStartListening } from "@mw/listener";

export const combineListeners =
  (
    ...setupListeners: ((
      startListening: AppStartListening
    ) => UnsubscribeListener)[]
  ) =>
  (startListening: AppStartListening): UnsubscribeListener => {
    const subscriptions = setupListeners.map((setup) => setup(startListening));
    return (...args) =>
      subscriptions.map((subscription) => subscription(...args));
  };
