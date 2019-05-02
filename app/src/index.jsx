import "bootstrap";
import "bootstrap/dist/css/bootstrap.css";

import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import App from "./App";

import { Drizzle, generateStore } from "drizzle";
import { DrizzleContext } from "drizzle-react";
import Splitter from "./contracts/Splitter.json";

const options = {
  web3: {
    block: false,
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:9545" // Truffle Develop
    }
  },
  contracts: [Splitter],
  events: {
    Splitter: [
      "FundsSplitted",
      "BalanceSplitted",
      "BalanceWithdrew",
      // inherited from Pausable
      "Paused",
      "Unpaused",
      // inherited from PauserRole
      "PauserAdded",
      "PauserRemoved"
    ]
  },
  polls: {
    accounts: 1500
  }
};

const drizzleStore = generateStore(options);
const drizzle = new Drizzle(options, drizzleStore);

ReactDOM.render(
  <DrizzleContext.Provider drizzle={drizzle}>
    <App />
  </DrizzleContext.Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
