# Splitter

- Course: [B9lab](https://b9lab.com) [Blockstars Certified Ethereum Developer Course](https://blockstars.b9lab.com)
- Cohort: 2019 BLOCKSTARS-ETH-1
- Module: 5
- Author: Fábio Corrêa ([feamcor](https://github.com/feamcor))

## INTRODUCTION

**Splitter** is a decentralized utility smart contract and dapp that receive, split and assign funds to any two recipient accounts. Later on, recipient accounts can withdraw their accumulated balances.

**Splitter** smart contract is written in [Solidity](https://solidity.readthedocs.io/en/latest) for the [Ethereum](https://www.ethereum.org) [blockchain](https://en.wikipedia.org/wiki/Blockchain) using the [Truffle](https://truffleframework.com) framework.

**Splitter** dapp is a [single-page application](https://en.wikipedia.org/wiki/Single-page_application) written in [React.js](https://reactjs.org) and relying on a light-client (wallet), like [MetaMask](https://metamask.io), to sign account transactions.

### FUNCTIONS

**Splitter** exposes the following functions:

- `split` - divides, equally, between two recipient accounts, all the **ether** transferred by sender. In case the transferred amount is uneven, the exceeding **1 wei** is given to 1st recipient account. Sender pays the **gas** for calling this function. Input parameters:

  - `first` - address of the 1st recipient account
  - `second` - address of the 2nd recipient account

- `withdraw` - transfer to sender its balance accumulated by previouses executions of `split`. Sender pays the **gas** for calling this function.

### EVENTS

**Splitter** also emit the following events:

- `FundsSplitted` - funds were received, divided and credited to recipient accounts. Output parameters:

  - `from` - address of the account which sent funds to recipients
  - `value` - total amout of funds sent by `from`
  - `first` - address of 1st recipient account
  - `value1st` - amount credited to `first`
  - `second` - address of 2nd recipient account
  - `value2nd` - amount credited to `second`

- `FundsWithdrew` - funds were transferred to recipient account. Output parameters:
  - `by` - address of account who requested withdraw
  - `balance` - outstanding balance of the requestor

### SAFETY

**Splitter** inherits from [Open Zeppelin's Pausable](https://docs.openzeppelin.org/docs/lifecycle_pausable) contract and, as such, exposes functions and emit events related to the implementation of a [circuit breaker](https://consensys.github.io/smart-contract-best-practices/software_engineering/#circuit-breakers-pause-contract-functionality) behavior. The account who deployed the contract is the initial `Pauser` who can **pause/unpause** the contract when needed.

### ESCROW

**Splitter** does not hold any funds **BUT** those received during `split` function execution, and that should be `withdraw` in a timely manner by their rightful recipient accounts. If a recipient doesn't withdraw its balance, such funds will be held by the contract but out of reach of anyone else to recover it (including the contract deployer). There is no concept of contract owner.

Fallback behavior is disabled, not allowing **Splitter** to receive funds from regular fund transfers or erroneous transactions (e.g. calling non-existent functions).

## INSTALLATION

- TO-DO

## LIVE APP ON <ROPSTEN/RINKEBY>

- TO-DO
