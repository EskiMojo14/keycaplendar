import React from "react";
import { Snackbar, SnackbarAction } from "@rmwc/snackbar";

export class SnackbarCookies extends React.Component {
  render() {
    return (
      <Snackbar
        open={this.props.open}
        onClose={this.props.accept}
        message="By using this site, you consent to use of cookies to store preferences."
        action={[<SnackbarAction label="Accept" onClick={this.props.accept} />]}
        timeout={200000}
      />
    );
  }
}

export default SnackbarCookies;
