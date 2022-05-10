import type {
  ApiEndpointMutation,
  ApiEndpointQuery,
} from "@reduxjs/toolkit/dist/query/core/module";
import { notify } from "~/app/snackbar-queue";
import type { AppStartListening } from "@mw/listener";

export const createErrorMessagesListeners = <
  Endpoints extends Record<
    string,
    ApiEndpointMutation<any, any> | ApiEndpointQuery<any, any>
  >
>(
  endpoints: Endpoints,
  errorMessagesByEndpoint: Record<keyof Endpoints, string>,
  startListening: AppStartListening
) =>
  Object.entries(errorMessagesByEndpoint).map(([endpoint, errorMessage]) =>
    startListening({
      effect: ({ error }) => {
        if (error.name !== "ConditionError") {
          notify({ title: errorMessage });
        }
      },
      matcher: endpoints[endpoint].matchRejected,
    })
  );
