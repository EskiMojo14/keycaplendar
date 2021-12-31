import { Snackbar, SnackbarAction } from "@rmwc/snackbar";

type SnackbarCookiesProps = {
  open: boolean;
  accept: () => void;
  clear: () => void;
};

export const SnackbarCookies = ({ open, accept }: SnackbarCookiesProps) => (
  <Snackbar
    open={open}
    onClose={accept}
    message="By using this site, you consent to use of cookies to store preferences."
    action={[<SnackbarAction key="accept" label="Accept" onClick={accept} />]}
    timeout={200000}
  />
);

export default SnackbarCookies;
