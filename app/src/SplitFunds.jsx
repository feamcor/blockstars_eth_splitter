import React, { Component } from "react";
import { toast } from "react-toastify";

class SplitFunds extends Component {
  state = { txStackId: null, txStatus: null, amount: "" };

  toastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  };

  handleOnClick = event => {
    if (this.state.amount === "" || this.state.amount === "0") {
      toast.error("ERROR: amount cannot be empty or zero!", this.toastOptions);
    } else if (!this.props.isAddress(this.props.first)) {
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
        this.props.second,
        {
          value: this.props.toWei(this.state.amount, "ether")
        }
      );
      this.setState({ txStackId, txStatus: null, amount: "" });
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
        const message = `SPLIT FUNDS: ${txStatus}`;
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
            SPLIT FUNDS
          </button>
        </div>
        <span className="card-body">
          <p>
            Transfer, to Splitter, the amount entered below and divide it
            between the recipient accounts entered above. Recipient accounts can
            withdraw their funds later on.
          </p>
          <p>
            In case of an uneven amount, exceeding <code>1 wei</code> will be
            given to 1st recipient account (it would be expensive to refund it
            or set as balance on Splitter for current account).
          </p>
          <p>
            Current account must have enough balance on blockchain to cover the
            splitted amount, plus the cost of executing this transaction (gas).
            Otherwise, it will be reverted.
          </p>
        </span>
        <div className="card-footer">
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text" id="labelAmount">
                Ξ
              </span>
            </div>
            <input
              type="number"
              key="amount"
              name="amount"
              value={this.state.amount}
              min="0"
              step="0.01"
              max={this.props.balance}
              onChange={this.handleOnChange}
              className="form-control"
              placeholder="Amount, in ether, to be splitted between recipients"
              aria-label="amount"
              aria-describedby="labelAmount"
              required
            />
          </div>
        </div>
      </div>
    );
  }
}

export default SplitFunds;
