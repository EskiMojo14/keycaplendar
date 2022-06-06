import type {
  ApiEndpointMutation,
  ApiEndpointQuery,
} from "@reduxjs/toolkit/dist/query/core/module";
import { notify } from "~/app/snackbar-queue";
import type { AppStartListening } from "@mw/listener";

const errorMessagesByEndpoint: Record<string, string> = {};

export const addErrorMessages = <
  Endpoints extends Record<
    string,
    ApiEndpointMutation<any, any> | ApiEndpointQuery<any, any>
  >
>(
  newMessages: Partial<Record<keyof Endpoints, string>>
) => {
  Object.assign(errorMessagesByEndpoint, newMessages);
};

const isRejectedEndpoint: (
  reducerPath: string
) =>
  | ApiEndpointMutation<any, any>["matchRejected"]
  | ApiEndpointQuery<any, any>["matchRejected"] = (reducerPath: string) =>
  ((action: any) =>
    action?.type === `${reducerPath}/executeQuery/rejected`) as any;

export const createErrorMessagesListener = (
  reducerPath: string,
  startListening: AppStartListening
) => {
  const matchRejected = isRejectedEndpoint(reducerPath);
  return startListening({
    effect: ({
      meta: {
        arg: { endpointName },
      },
    }) => {
      notify({
        title: errorMessagesByEndpoint[endpointName],
      });
    },
    matcher: ((action) =>
      matchRejected(action) &&
      !action.meta.condition &&
      errorMessagesByEndpoint[
        action.meta.arg.endpointName
      ]) as typeof matchRejected,
  });
};
