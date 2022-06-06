import { isAnyOf } from "@reduxjs/toolkit";
import type {
  ApiEndpointMutation,
  ApiEndpointQuery,
} from "@reduxjs/toolkit/dist/query/core/module";
import { notify } from "~/app/snackbar-queue";
import type { AppStartListening } from "@mw/listener";
import { objectKeys } from "@s/util/functions";

export const createErrorMessagesListener = <
  Endpoints extends Record<
    string,
    ApiEndpointMutation<any, any> | ApiEndpointQuery<any, any>
  >
>(
  endpoints: Endpoints,
  errorMessagesByEndpoint: Partial<Record<keyof Endpoints, string>>,
  startListening: AppStartListening
) => {
  const isRejectedEndpoint = isAnyOf(
    ...(objectKeys(errorMessagesByEndpoint).map(
      (key) => endpoints[key].matchRejected
    ) as [Endpoints[keyof Endpoints]["matchRejected"]])
  );
  return startListening({
    effect: ({
      error,
      meta: {
        arg: { endpointName },
      },
    }) => {
      console.error(error);
      notify({
        title: errorMessagesByEndpoint[endpointName] ?? "Unknown error",
      });
    },
    matcher: ((action) =>
      isRejectedEndpoint(action) &&
      !action.meta.condition) as Endpoints[keyof Endpoints]["matchRejected"],
  });
};
