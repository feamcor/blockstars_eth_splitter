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
              <strong>WITHDRAW</strong>
            </button>
          )}
          {this.props.isPaused && (
            <button
              type="button"
              className={buttonClass}
              onClick={this.handleOnClick}
              disabled
            >
              <strong>WITHDRAW</strong>
            </button>
          )}
        </div>
        <span className="card-body">
          The contract will transfer to the account, the balance accumulated
          from previous <strong>split</strong> function execution. No withdraw
          on behalf of another account is allowed.
        </span>
        <span className="card-footer font-weight-bold text-uppercase">
          {this.props.getTxStatus(this.state.txStackId)}
        </span>
      </div>
    );
  }
}

export default Withdraw;
