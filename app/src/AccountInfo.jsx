import React, { PureComponent } from "react";

class AccountInfo extends PureComponent {
  render() {
    return (
      <div className="card shadow text-white bg-primary">
        <h5 className="card-header">
          <strong>ACCOUNT</strong> <small>{this.props.account}</small>
        </h5>
        <div className="card-body">
          <p className="card-text">
            <strong>Balance on blockchain: Ξ </strong>
            {this.props.balanceAccount}
          </p>
          <p className="card-text">
            <strong>Is a Pauser? </strong>
            <span className="card-text">
              {this.props.isPauser === true && " YES "}
              {this.props.isPauser === false && " NO "}
            </span>
          </p>
          <p className="card-text">
            <strong>Balance on Splitter: Ξ </strong>
            {this.props.balanceSplitter}
          </p>
        </div>
      </div>
    );
  }
}

export default AccountInfo;
