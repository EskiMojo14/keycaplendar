import React from "react";
import classNames from "classnames";
import "./FullScreenDialog.scss";

export class FullScreenDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opening: false,
      closing: false,
      animate: false,
      open: false,
    };
  }
  componentDidMount() {
    this.setState({ open: this.props.open });
  }
  componentDidUpdate(prevProps) {
    if (this.props.open !== prevProps.open) {
      if (this.props.open) {
        this.openDialog();
      } else {
        this.closeDialog();
      }
    }
  }
  openDialog = () => {
    this.setState({ open: true, animate: true });
    setTimeout(() => {
      this.setState({ opening: true });
    }, 1);
    setTimeout(() => {
      this.setState({ animate: false, opening: false });
    }, 450);
  };
  closeDialog = () => {
    this.setState({
      closing: true,
    });
    setTimeout(() => {
      if (this.props.onClose) {
        this.props.onClose();
      }
      this.setState({ open: false, closing: false });
    }, 400);
  };
  render() {
    return (
      <>
        <div
          {...this.props}
          className={classNames(
            "full-screen-dialog",
            {
              "full-screen-dialog--open": this.state.open,
              "full-screen-dialog--opening": this.state.opening,
              "full-screen-dialog--closing": this.state.closing,
              "full-screen-dialog--animate": this.state.animate,
            },
            this.props.className
          )}
        >
          {this.props.children}
        </div>
        <div className="full-screen-dialog-scrim"></div>
      </>
    );
  }
}

export const FullScreenDialogContent = (props) => {
  return (
    <div {...props} className={classNames("full-screen-dialog__content", props.className)}>
      {props.children}
    </div>
  );
};