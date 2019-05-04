import React, { Component } from "react";
import { toast } from "react-toastify";

class SplitBalance extends Component {
  state = { txStackId: null, txStatus: null };

  toastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  };

  handleOnClick = event => {
    if (!this.props.isAddress(this.props.first)) {
      toast.error(
        "ERROR: 1st recipient address is invalid!",
        this.toastOptions
      );
    } else if (!this.props.isAddress(this.props.second)) {
      toast.error(
        "ERROR: 2nd recipient address is invalid!",
        this.toastOptions
      );
    } else {
      const txStackId = this.props.split.cacheSend(
        this.props.first,
        this.props.second
      );
      this.setState({ txStackId, txStatus: null });
    }
  };

  handleOnChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  componentDidUpdate(prevProps) {
    if (this.props.isPaused !== prevProps.isPaused) {
      this.setState({ txStackId: null, txStatus: null });
    } else {
      const txStatus = this.props.getTxStatus(this.state.txStackId);
      if (txStatus !== this.state.txStatus) {
        this.setState({ txStatus });
        const message = `SPLIT BALANCE: ${txStatus}`;
        if (txStatus === "pending") {
          toast.warning(message, this.toastOptions);
        } else if (txStatus === "success") {
          toast.success(message, this.toastOptions);
        } else {
          toast.error(message, this.toastOptions);
        }
      }
    }
  }

  render() {
    return (
      <div className="card shadow bg-dark text-center text-white">
        <div className="card-header">
          <button
            type="button"
            className="btn btn-danger btn-block"
            onClick={this.handleOnClick}
          >
            SPLIT BALANCE
          </button>
        </div>
        <span className="card-body">
          <p>
            Split current account's Splitter balance between recipient accounts
            entered above. Recipient accounts can withdraw their funds later on.
          </p>
          <p>
            In case of an uneven amount, exceeding <code>1 wei</code> will
            remain on current account balance.
          </p>
          <p>
            Current account must have enough balance on blockchain to cover the
            cost of executing this transaction (gas). Otherwise, it will be
            reverted.
          </p>
        </span>
      </div>
    );
  }
}

export default SplitBalance;
