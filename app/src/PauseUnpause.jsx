import React, { Component } from "react";
import { toast } from "react-toastify";

class PauseUnpause extends Component {
  state = { txStackId: null, txStatus: null };

  handleOnClick = event => {
    const txStackId = this.props.isPaused
      ? this.props.unpause.cacheSend()
      : this.props.pause.cacheSend();
    this.setState({ txStackId, txStatus: null });
  };

  componentDidUpdate(prevProps) {
    if (this.props.isPaused !== prevProps.isPaused) {
      this.setState({ txStackId: null, txStatus: null });
    } else {
      const txStatus = this.props.getTxStatus(this.state.txStackId);
      if (txStatus !== this.state.txStatus) {
        this.setState({ txStatus });
        const message = this.props.isPaused
          ? `UNPAUSE... ${txStatus}`
          : `PAUSE... ${txStatus}`;
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
    const buttonClass = this.props.isPauser
      ? this.props.isPaused
        ? "btn btn-success btn-block"
        : "btn btn-danger btn-block"
      : "btn btn-light btn-block";
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
              <strong>{actionLabel} SPLITTER</strong>
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
          <p>
            When paused, <strong>split</strong> and <strong>withdraw</strong>{" "}
            functions are disabled.
          </p>
          <p>
            Only accounts with <strong>Pauser</strong> role (see{" "}
            <code>Is a Pauser?</code> above) can pause/unpause the contract.
          </p>
        </span>
      </div>
    );
  }
}

export default PauseUnpause;
