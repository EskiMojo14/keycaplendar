import { Snackbar, SnackbarAction } from "@rmwc/snackbar";

type SnackbarCookiesProps = {
  open: boolean;
  accept: () => void;
  clear: () => void;
};

export const SnackbarCookies = ({ open, accept }: SnackbarCookiesProps) => (
  <Snackbar
    action={[<SnackbarAction key="accept" label="Accept" onClick={accept} />]}
    message="By using this site, you consent to use of cookies to store preferences."
    onClose={accept}
    open={open}
    timeout={200000}
  />
);

export default SnackbarCookies;
