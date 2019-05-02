import React, { Component } from "react";

class PauseUnpause extends Component {
  state = { txStackId: null };

  handleOnClick = event => {
    const txStackId = this.props.isPaused
      ? this.props.unpause.cacheSend()
      : this.props.pause.cacheSend();
    this.setState({ txStackId });
  };

  componentDidUpdate(prevProps) {
    if (this.props.isPaused !== prevProps.isPaused) {
      this.setState({ txStackId: null });
    }
  }

  render() {
    const buttonClass = this.props.isPaused
      ? "btn btn-success btn-block"
      : "btn btn-danger btn-block";
    const actionLabel = this.props.isPaused ? "UNPAUSE" : "PAUSE";
    return (
      <div className="card shadow bg-light text-center">
        <div className="card-header">
          {this.props.isPauser && (
            <button
              type="button"
              className={buttonClass}
              onClick={this.handleOnClick}
            >
              <strong>{actionLabel}</strong>
            </button>
          )}
          {!this.props.isPauser && (
            <button
              type="button"
              className={buttonClass}
              onClick={this.handleOnClick}
              disabled
            >
              <strong>{actionLabel}</strong>
            </button>
          )}
        </div>
        <span className="card-body">
          When paused, no <strong>split</strong> or <strong>withdraw</strong>{" "}
          functions are allowed. Only accounts with <strong>Pauser</strong> role
          can pause/unpause this contract.
        </span>
        <span className="card-footer font-weight-bold text-uppercase">
          {this.props.getTxStatus(this.state.txStackId)}
        </span>
      </div>
    );
  }
}

export default PauseUnpause;
