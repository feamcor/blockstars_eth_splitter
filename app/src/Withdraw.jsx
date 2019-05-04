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
    return (
      <div className="card shadow bg-dark text-center text-white">
        <div className="card-header">
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={this.handleOnClick}
          >
            WITHDRAW BALANCE
          </button>
        </div>
        <span className="card-body">
          <p>
            Transfer, to the account above, a balance of{" "}
            <code>Ξ {this.props.balance}</code> received from previous{" "}
            <strong>split</strong> function execution.
          </p>
        </span>
      </div>
    );
  }
}

export default Withdraw;
