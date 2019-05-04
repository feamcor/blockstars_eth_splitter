import React, { Component } from "react";
import { toast } from "react-toastify";

class SplitFunds extends Component {
  state = { txStackId: null, txStatus: null, amount: "0" };

  handleOnClick = event => {
    const txStackId = this.props.split.cacheSend(
      this.props.first,
      this.props.second,
      {
        value: this.props.toWei(this.state.amount, "ether")
      }
    );
    this.setState({ txStackId, txStatus: null, amount: "0" });
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
        const message = `SPLIT ... ${txStatus}`;
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
      <div className="card shadow bg-secondary text-center text-white">
        <div className="card-header">
          <button
            type="button"
            className="btn btn-dark btn-block"
            onClick={this.handleOnClick}
          >
            <strong>SPLIT FUNDS</strong>
          </button>
        </div>
        <span className="card-body">
          <p>
            Transfer to Splitter the amount entered below and then divide it,
            equally, between 1st and 2nd recipient accounts entered above.
            Recipient accounts can later on withdraw the funds.
          </p>
          <p>
            In case of an uneven amount, exceeding <strong>1 wei</strong> will
            be given to 1st recipient account.
          </p>
          <p>
            Your account must have enough funds to cover the amount requested to
            split, plus the cost of executing the transaction (gas). Otherwise,
            transaction will be rejected.
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
