import { Snackbar, SnackbarAction } from "@rmwc/snackbar";

type SnackbarCookiesProps = {
  open: boolean;
  accept: () => void;
  clear: () => void;
};

export const SnackbarCookies = (props: SnackbarCookiesProps) => (
    <Snackbar
      open={props.open}
      onClose={props.accept}
      message="By using this site, you consent to use of cookies to store preferences."
      action={[<SnackbarAction key="accept" label="Accept" onClick={props.accept} />]}
      timeout={200000}
    />
  );

export default SnackbarCookies;
