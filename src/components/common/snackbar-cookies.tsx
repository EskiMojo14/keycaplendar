import { Snackbar, SnackbarAction } from "@rmwc/snackbar";

type SnackbarCookiesProps = {
  accept: () => void;
  clear: () => void;
  open: boolean;
};

export const SnackbarCookies = ({ accept, open }: SnackbarCookiesProps) => (
  <Snackbar
    action={[<SnackbarAction key="accept" label="Accept" onClick={accept} />]}
    message="By using this site, you consent to use of cookies to store preferences."
    onClose={accept}
    open={open}
    timeout={200000}
  />
);

export default SnackbarCookies;
