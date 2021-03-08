import React from "react";
import PropTypes from "prop-types";
import { Snackbar, SnackbarAction } from "@rmwc/snackbar";

export const SnackbarCookies = (props) => {
  return (
    <Snackbar
      open={props.open}
      onClose={props.accept}
      message="By using this site, you consent to use of cookies to store preferences."
      action={[<SnackbarAction key="accept" label="Accept" onClick={props.accept} />]}
      timeout={200000}
    />
  );
};

export default SnackbarCookies;

SnackbarCookies.propTypes = {
  open: PropTypes.bool,
  accept: PropTypes.func,
};
