import React, { PureComponent } from "react";

class AccountInfo extends PureComponent {
  render() {
    return (
      <div className="card shadow text-white bg-primary">
        <h5 className="card-header">
          <strong>ACCOUNT</strong> {this.props.account}
        </h5>
        <div className="card-body">
          <p className="card-text">
            <strong>Balance (ETH): </strong>
            {this.props.balance}
          </p>
          <p className="card-text">
            <strong>Is a Pauser? </strong>
            <span className="card-text">
              {this.props.isPauser === true && " YES "}
              {this.props.isPauser === false && " NO "}
            </span>
          </p>
        </div>
      </div>
    );
  }
}

export default AccountInfo;
