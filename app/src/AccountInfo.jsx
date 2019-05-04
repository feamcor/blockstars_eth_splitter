import React, { PureComponent } from "react";

class AccountInfo extends PureComponent {
  render() {
    return (
      <div className="card shadow text-white bg-primary">
        <h5 className="card-header">
          <strong>ACCOUNT</strong> <small>{this.props.account}</small>
        </h5>
        <div className="card-body">
          <table className="table table-borderless table-striped table-hover text-white bg-primary">
            <tbody>
              <tr>
                <td>Balance on Blockchain</td>
                <td>Ξ {this.props.balanceAccount}</td>
              </tr>
              <tr>
                <td>Is a Pauser?</td>
                <td>
                  {this.props.isPauser === true && " YES "}
                  {this.props.isPauser === false && " NO "}
                </td>
              </tr>
              <tr>
                <td>Balance on Splitter</td>
                <td>Ξ {this.props.balanceSplitter}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default AccountInfo;
