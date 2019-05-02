import React, { PureComponent } from "react";

class AccountBalance extends PureComponent {
  render() {
    return (
      <div className="card shadow text-white bg-dark">
        <h5 className="card-header">
          <strong>BALANCE HELD FOR ACCOUNT </strong>
          {this.props.account}
        </h5>
        <div className="card-body">
          <p className="card-text">
            <strong>Balance: </strong>
            {this.props.balance}
          </p>
        </div>
      </div>
    );
  }
}

export default AccountBalance;
