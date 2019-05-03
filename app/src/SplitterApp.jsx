import React, { Component } from "react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import NavBar from "./NavBar";
import AccountInfo from "./AccountInfo";
import AccountBalance from "./AccountBalance";
import PauseUnpause from "./PauseUnpause";
import Withdraw from "./Withdraw";

class SplitterApp extends Component {
  state = {
    isTrackingEvents: false,
    contractDidChange: false,
    k_isPauser: null,
    k_balances: null,
    k_paused: null
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
      return "Loading...";
    }

    const accountIsPauser = r_isPauser.value;
    const accountSplitBalance = r_balances.value;
    const contractIsPaused = r_paused.value;

    return (
      <React.Fragment>
        <ToastContainer />
        <NavBar address={address} isPaused={contractIsPaused} />
        <div className="container">
          <div className="row mt-3 justify-content-md-center">
            <div className="col">
              <AccountInfo
                account={account}
                balance={this.fromWeiToEther(accountBalance)}
                isPauser={accountIsPauser}
              />
            </div>
          </div>
          <div className="row mt-3 justify-content-md-center">
            <div className="col">
              <AccountBalance
                balance={this.fromWeiToEther(accountSplitBalance)}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-6">
              <PauseUnpause
                pause={methods.pause}
                unpause={methods.unpause}
                isPauser={accountIsPauser}
                isPaused={contractIsPaused}
                getTxStatus={this.getTxStatus}
              />
            </div>
            <div className="col-6">
              <Withdraw
                account={account}
                balance={this.fromWeiToEther(accountSplitBalance)}
                withdraw={methods.withdraw}
                isPaused={contractIsPaused}
                getTxStatus={this.getTxStatus}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default SplitterApp;
