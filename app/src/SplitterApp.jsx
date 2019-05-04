import React, { Component } from "react";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import NavBar from "./NavBar";
import AccountInfo from "./Account";
import Withdraw from "./Withdraw";
import SplitFunds from "./SplitFunds";
import SplitBalance from "./SplitBalance";

class SplitterApp extends Component {
  state = {
    isTrackingEvents: false,
    contractDidChange: false,
    k_isPauser: null,
    k_balances: null,
    k_paused: null,
    firstRecipient: "",
    secondRecipient: ""
  };

  f_isPauser = account => {
    const { methods } = this.props.drizzle.contracts.Splitter;
    const dataKey = methods.isPauser.cacheCall(account);
    this.setState({ k_isPauser: dataKey });
  };

  f_balances = account => {
    const { methods } = this.props.drizzle.contracts.Splitter;
    const dataKey = methods.balances.cacheCall(account);
    this.setState({ k_balances: dataKey });
  };

  f_paused = () => {
    const { methods } = this.props.drizzle.contracts.Splitter;
    const dataKey = methods.paused.cacheCall();
    this.setState({ k_paused: dataKey });
  };

  handleOnChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleOnEventEmitted = event => {
    console.log(event);
  };

  getTxStatus = txStackId => {
    if (txStackId === null) return null;
    const { transactions, transactionStack } = this.props.drizzleState;
    const txHash = transactionStack[txStackId];
    if (!txHash || !transactions[txHash]) return null;
    return transactions[txHash].status;
  };

  fromWeiToEther = amount => {
    const wei =
      amount === null || amount === undefined
        ? "0"
        : typeof amount === "number" || typeof amount === "object"
        ? amount.toString()
        : amount;
    return this.props.drizzle.web3.utils.fromWei(wei, "ether");
  };

  componentDidMount() {
    const account = this.props.drizzleState.accounts[0];
    const { events } = this.props.drizzle.contracts.Splitter;
    const { Splitter } = this.props.drizzle.options.events;
    this.unsubscribe = this.props.drizzle.store.subscribe(() => {
      if (this.props.drizzleState.drizzleStatus.initialized) {
        if (!this.state.isTrackingEvents) {
          for (const eventName of Splitter) {
            events[eventName]().on("data", event => {
              this.handleOnEventEmitted(event);
            });
          }
        }
        this.setState({ isTrackingEvents: true });
      }
    });
    this.f_isPauser(account);
    this.f_balances(account);
    this.f_paused();
  }

  componentDidUpdate(prevProps) {
    const account = this.props.drizzleState.accounts[0];
    const contractDidChange = this.state.contractDidChange;
    if (account !== prevProps.drizzleState.accounts[0]) {
      this.f_isPauser(account);
      this.f_balances(account);
    }
    if (contractDidChange === true) {
      this.f_paused();
      this.setState({ contractDidChange: false });
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { address } = this.props.drizzle.contracts.Splitter;

    const account = this.props.drizzleState.accounts[0];
    const accountBalance = this.props.drizzleState.accountBalances[account];

    const { methods } = this.props.drizzle.contracts.Splitter;
    const results = this.props.drizzleState.contracts.Splitter;

    const r_isPauser = results.isPauser[this.state.k_isPauser];
    const r_balances = results.balances[this.state.k_balances];
    const r_paused = results.paused[this.state.k_paused];

    if (
      r_isPauser === null ||
      r_isPauser === undefined ||
      r_balances === null ||
      r_balances === undefined ||
      r_paused === null ||
      r_paused === undefined
    ) {
      return (
        <React.Fragment>
          <NavBar
            address={"0x0000000000000000000000000000000000000000"}
            isPaused={false}
          />
        </React.Fragment>
      );
    }

    const accountIsPauser = r_isPauser.value;
    const accountBalanceOnSplitter = r_balances.value;
    const splitterIsPaused = r_paused.value;

    const noBalance = accountBalance === "0";
    const noBalanceOnSplitter = accountBalanceOnSplitter === "0";
    const noBalanceAtAll = noBalance && noBalanceOnSplitter;

    return (
      <React.Fragment>
        <ToastContainer />
        <NavBar address={address} isPaused={splitterIsPaused} />
        <div className="container">
          <div className="row justify-content-md-center mt-3">
            <div className="col-8">
              <AccountInfo
                pause={methods.pause}
                unpause={methods.unpause}
                account={account}
                balanceAccount={this.fromWeiToEther(accountBalance)}
                balanceSplitter={this.fromWeiToEther(accountBalanceOnSplitter)}
                isPauser={accountIsPauser}
                isPaused={splitterIsPaused}
                getTxStatus={this.getTxStatus}
              />
            </div>
          </div>

          {!splitterIsPaused && !noBalanceOnSplitter && (
            <div className="row justify-content-md-center mt-3">
              <div className="col-8">
                <Withdraw
                  balance={this.fromWeiToEther(accountBalanceOnSplitter)}
                  withdraw={methods.withdraw}
                  isPaused={splitterIsPaused}
                  getTxStatus={this.getTxStatus}
                />
              </div>
            </div>
          )}

          {!splitterIsPaused && !noBalanceAtAll && (
            <div className="row justify-content-md-center mt-3">
              <div className="col-8 bg-danger">
                <div className="input-group mt-3 mb-1">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="labelFirst">
                      #1
                    </span>
                  </div>
                  <input
                    type="text"
                    key="firstRecipient"
                    name="firstRecipient"
                    value={this.state.firstRecipient}
                    onChange={this.handleOnChange}
                    className="form-control"
                    placeholder="Address of 1st Recipient Account, with 0x prefix"
                    aria-label="firstRecipient"
                    aria-describedby="labelFirst"
                    maxLength="42"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {!splitterIsPaused && !noBalanceAtAll && (
            <div className="row justify-content-md-center">
              <div className="col-8 bg-danger">
                <div className="input-group mt-1 mb-3">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="labelSecond">
                      #2
                    </span>
                  </div>
                  <input
                    type="text"
                    key="secondRecipient"
                    name="secondRecipient"
                    value={this.state.secondRecipient}
                    onChange={this.handleOnChange}
                    className="form-control"
                    placeholder="Address of 2nd Recipient Account, with 0x prefix"
                    aria-label="secondRecipient"
                    aria-describedby="labelSecond"
                    maxLength="42"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="row justify-content-md-center mt-3">
            {!splitterIsPaused && !noBalance && (
              <div className="col-6">
                <SplitFunds
                  split={methods.split}
                  getTxStatus={this.getTxStatus}
                  toWei={this.props.drizzle.web3.utils.toWei}
                  isAddress={this.props.drizzle.web3.utils.isAddress}
                  isPaused={splitterIsPaused}
                  balance={this.fromWeiToEther(accountBalance)}
                  first={this.state.firstRecipient}
                  second={this.state.secondRecipient}
                />
              </div>
            )}

            {!splitterIsPaused && !noBalanceOnSplitter && (
              <div className="col-6">
                <SplitBalance
                  split={methods.splitBalance}
                  getTxStatus={this.getTxStatus}
                  isAddress={this.props.drizzle.web3.utils.isAddress}
                  isPaused={splitterIsPaused}
                  first={this.state.firstRecipient}
                  second={this.state.secondRecipient}
                />
              </div>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default SplitterApp;
