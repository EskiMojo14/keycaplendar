import type { UnsubscribeListener } from "@reduxjs/toolkit";
import type { AppStartListening } from "@mw/listener";

export const combineListeners =
  (
    mapListeners: (startListening: AppStartListening) => UnsubscribeListener[]
  ) =>
  (startListening: AppStartListening): UnsubscribeListener => {
    const subscriptions = mapListeners(startListening);
    return (...args) =>
      subscriptions.map((subscription) => subscription(...args));
  };
