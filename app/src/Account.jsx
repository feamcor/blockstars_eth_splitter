import React, { Component } from "react";
import { toast } from "react-toastify";

class Account extends Component {
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
          ? `UNPAUSE: ${txStatus}`
          : `PAUSE: ${txStatus}`;
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
    const buttonClass = this.props.isPauser
      ? this.props.isPaused
        ? "btn btn-success btn-block"
        : "btn btn-danger btn-block"
      : "btn btn-light btn-block";
    const actionLabel = this.props.isPaused ? "UNPAUSE" : "PAUSE";

    return (
      <div className="card shadow text-white bg-primary">
        <h5 className="card-header">ACCOUNT {this.props.account}</h5>
        <div className="card-body">
          <table className="table table-borderless table-hover text-white bg-primary">
            <tbody>
              <tr>
                <td>Balance on Blockchain</td>
                <td>Ξ {this.props.balanceAccount}</td>
              </tr>
              <tr>
                <td>Balance on Splitter</td>
                <td>Ξ {this.props.balanceSplitter}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {this.props.isPauser && (
          <div className="card-footer">
            <button
              type="button"
              className={buttonClass}
              onClick={this.handleOnClick}
            >
              <strong>{actionLabel} SPLITTER</strong>
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default Account;
