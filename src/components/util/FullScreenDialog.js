import React from "react";
import BEMHelper from "../../util/bemHelper";
import "./FullScreenDialog.scss";

const bemClasses = new BEMHelper("full-screen-dialog");

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
    const { open, ...props } = this.props;
    return (
      <>
        <div
          {...props}
          className={bemClasses({
            modifiers: {
              open: this.state.open,
              opening: this.state.opening,
              closing: this.state.closing,
              animate: this.state.animate,
            },
            extra: this.props.className,
          })}
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
    <div {...props} className={bemClasses({ element: "content", extra: props.className })}>
      {props.children}
    </div>
  );
};
