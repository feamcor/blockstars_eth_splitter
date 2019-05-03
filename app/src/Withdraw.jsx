import React, { Component } from "react";

class Withdraw extends Component {
  state = { txStackId: null };

  handleOnClick = event => {
    const txStackId = this.props.withdraw.cacheSend();
    this.setState({ txStackId });
  };

  componentDidUpdate(prevProps) {
    if (this.props.isPaused !== prevProps.isPaused) {
      this.setState({ txStackId: null });
    }
  }

  render() {
    const buttonClass = this.props.isPaused
      ? "btn btn-light btn-block"
      : "btn btn-info btn-block";
    return (
      <div className="card shadow bg-light text-center">
        <div className="card-header">
          {!this.props.isPaused && (
            <button
              type="button"
              className={buttonClass}
              onClick={this.handleOnClick}
            >
              <strong>WITHDRAW BALANCE</strong>
            </button>
          )}
          {this.props.isPaused && (
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
            balance of <code>{this.props.balance}</code> accumulated from
            previous <strong>split</strong> function execution.
          </p>
          <p>No withdraw on behalf of another account is allowed.</p>
        </span>
        <span className="card-footer font-weight-bold text-uppercase">
          {this.props.getTxStatus(this.state.txStackId)}
        </span>
      </div>
    );
  }
}

export default Withdraw;
