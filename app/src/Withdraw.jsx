import React, { Component } from "react";
import { toast } from "react-toastify";

class Withdraw extends Component {
  state = { txStackId: null, txStatus: null };

  handleOnClick = event => {
    const txStackId = this.props.withdraw.cacheSend();
    this.setState({ txStackId, txStatus: null });
  };

  componentDidUpdate(prevProps) {
    if (this.props.isPaused !== prevProps.isPaused) {
      this.setState({ txStackId: null, txStatus: null });
    } else {
      const txStatus = this.props.getTxStatus(this.state.txStackId);
      if (txStatus !== this.state.txStatus) {
        this.setState({ txStatus });
        const message = `WITHDRAW... ${txStatus}`;
        toast.info(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
    }
  }

  render() {
    const buttonClass = this.props.isPaused
      ? "btn btn-light btn-block"
      : "btn btn-info btn-block";
    const enabled = !this.props.isPaused && this.props.balance !== "0";
    return (
      <div className="card shadow bg-light text-center">
        <div className="card-header">
          {enabled && (
            <button
              type="button"
              className={buttonClass}
              onClick={this.handleOnClick}
            >
              <strong>WITHDRAW BALANCE</strong>
            </button>
          )}
          {!enabled && (
            <button
              type="button"
              className={buttonClass}
              onClick={this.handleOnClick}
              disabled
            >
              <strong>WITHDRAW BALANCE</strong>
            </button>
          )}
        </div>
        <span className="card-body">
          <p>
            Transfer, to the account <code>{this.props.account}</code>, a
            balance of <code>{this.props.balance}</code> ETH accumulated from
            previous <strong>split</strong> function execution.
          </p>
          <p>No withdraw on behalf of another account is allowed.</p>
        </span>
      </div>
    );
  }
}

export default Withdraw;
