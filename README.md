# Splitter

- Course: [B9lab](https://b9lab.com) [Blockstars Certified Ethereum Developer Course](https://blockstars.b9lab.com)
- Cohort: 2019 BLOCKSTARS-ETH-1
- Module: 5
- Author: Fábio Corrêa ([feamcor](https://github.com/feamcor))

## INTRODUCTION

**Splitter** is a decentralized utility smart contract and dapp that receive, split and assign funds to any two recipient accounts. Later on, recipient accounts can withdraw their accumulated balances.

**Splitter** smart contract is written in [Solidity](https://solidity.readthedocs.io/en/latest) for the [Ethereum](https://www.ethereum.org) [blockchain](https://en.wikipedia.org/wiki/Blockchain) using the [Truffle](https://truffleframework.com) framework.

**Splitter** dapp is a [single-page application](https://en.wikipedia.org/wiki/Single-page_application) written in [React.js](https://reactjs.org) and relying on a light-client (wallet), like [MetaMask](https://metamask.io), to sign account transactions.

## FUNCTIONS

**Splitter** exposes the following functions:

- `split` - divides, between two recipient accounts, the **ether** transferred by sender on the transaction (i.e. `msg.value`). In case the transferred amount is uneven, the exceeding **1 wei** is given to 1st recipient account. Sender pays the **gas** for calling this function. Input parameters:

  - `first` - address of the 1st recipient account
  - `second` - address of the 2nd recipient account

- `splitBalance` - divides, between two recipient accounts, the **balance** of the sender held by the contract. In case the balance is uneven, the exceeding **1 wei** is left with the sender. Sender pays the **gas** for calling this function. Input parameters:

  - `first` - address of the 1st recipient account
  - `second` - address of the 2nd recipient account

- `withdraw` - transfer to sender its balance accumulated from previouses executions of `split` and `splitBalance`. Sender pays the **gas** for calling this function.

## EVENTS

**Splitter** also emit the following events:

- `FundsSplitted` - funds were received, divided and credited to recipient accounts. Output parameters:

  - `from` - address of the account which sent funds to recipients
  - `first` - address of 1st recipient account
  - `second` - address of 2nd recipient account
  - `value1st` - amount credited to `first`
  - `value2nd` - amount credited to `second`

- `BalanceSplitted` - balance was divided and credited to recipient accounts. Output parameters:

  - `from` - address of the account which sent balance to recipients
  - `first` - address of 1st recipient account
  - `second` - address of 2nd recipient account
  - `value` - amount credited to recipient accounts

- `BalanceWithdrew` - funds were transferred to recipient account. Output parameters:
  - `by` - address of account who requested withdraw
  - `balance` - outstanding balance of the requestor

## SAFETY

**Splitter** inherits from [Open Zeppelin's Pausable](https://docs.openzeppelin.org/docs/lifecycle_pausable) contract and, as such, exposes functions and emit events related to the implementation of a [circuit breaker](https://consensys.github.io/smart-contract-best-practices/software_engineering/#circuit-breakers-pause-contract-functionality) behavior. The account who deployed the contract is the initial `Pauser` who can **pause/unpause** the contract when needed.

## ESCROW

**Splitter** does not hold any funds **BUT** those received during `split` function execution, and that should be `withdraw` in a timely manner by their rightful recipient accounts. If a recipient doesn't withdraw its balance, such funds will be held by the contract but out of reach of anyone else to recover it (including the contract deployer). There is no concept of contract owner.

Fallback behavior is disabled, not allowing **Splitter** to receive funds from regular fund transfers or erroneous transactions (e.g. calling non-existent functions).

## INSTALLATION

The source code of **Splitter** can be found at [GitHub](https://github.com/feamcor/blockstars_eth_splitter).

1. The following instructions assume that you are using a \*nix-like OS (e.g. Linux, macOS etc.) from its command-line and that [Git](https://git-scm.com/) is already installed.

2. Download and install the latest Node.js release for your OS according to the instructions found at https://nodejs.org.

   - Avoid installing Node.js with `sudo` in order to avoid priviledge issues later on when installing packages and dependencies.
   - On macOS, preferrably install it using the Homebrew package manager found on https://brew.sh.

3. Go to a directory of your preference in your computer (e.g. `~/Desktop`).

4. Download or clone **Splitter** repo to your computer.

```bash
$ git clone https://github.com/feamcor/blockstars_eth_splitter.git
```

5. Go to the new directory.

```bash
$ cd blockstars_eth_splitter
```

6. The structure of directories will be as below.

```
.
├── app
│   ├── public
│   └── src
│       └── contracts -> ../../build/contracts
├── contracts
├── migrations
├── scripts
└── test
    └── helpers
```

7.  The `truffle-config.js` is configured for the following networks:

    - `development` and `ganachecli` using port 8545
    - `ganachegui` using port 7545
    - `ropsten` and `rinkeby` using Infura API. For such networks, you need to sign up and create a project on Infura in order to get its Project ID. Also, you need to create a `.env` file with the following entries:
      - `INFURA_PROJECT_ID="<your infura project id>"`
      - `MNEMONIC="<your wallet seed words>"`

8.  Install the project dependencies (e.g. truffle, ganache-cli, etc.).

```bash
$ npm install
```

9. Compile **Splitter** and its companion smart contracts.

```bash
$ npx truffle compile
```

10. You should see similar output as below.

```
Compiling your contracts...
===========================
> Compiling ./contracts/Migrations.sol
> Compiling ./contracts/Splitter.sol
> Compiling openzeppelin-solidity/contracts/access/Roles.sol
> Compiling openzeppelin-solidity/contracts/access/roles/PauserRole.sol
> Compiling openzeppelin-solidity/contracts/lifecycle/Pausable.sol
> Compiling openzeppelin-solidity/contracts/math/SafeMath.sol
> Artifacts written to /Users/feamcor/Documents/Repositories/blockstars_eth_splitter/build/contracts
> Compiled successfully using:
   - solc: 0.5.8+commit.23d335f2.Emscripten.clang
```

11. Open another terminal window, go to the same directory `blockstars_eth_splitter` and run Ganache CLI.

```bash
$ npx ganache-cli
```

12. You should see similar output as below.

```
Ganache CLI v6.4.3 (ganache-core: 2.5.5)

Available Accounts
==================
(0) 0xce1f8ca86aa922c93f4b6d82776152197cad2e87 (~100 ETH)
(1) 0x3405838da07ec055fa2b0b3552a764503826c1d3 (~100 ETH)
(2) 0x105f5e2e9f778ad73555a220ec52557c192b05db (~100 ETH)
(3) 0x08cadbe9298eda485770733b29431062513178fc (~100 ETH)
(4) 0x7ec4993432903205474e6804e55d05dda552e34c (~100 ETH)
(5) 0xa7f53f84b772d517af4c98fa8ca10dfec5c02026 (~100 ETH)
(6) 0x508688b55e567c36de9bf881f60df1108ffb0f64 (~100 ETH)
(7) 0x511957f2544b84c9bc09b2f6d14e0b7c932f31b0 (~100 ETH)
(8) 0x2c34f8ad86c7a910fd386c947b0c72a8aed4a97e (~100 ETH)
(9) 0x36b70534d0f3ab7c87c54d917e6cae6b8389c3c0 (~100 ETH)

Private Keys
==================
(0) 0xd2d02a9b0869622e53783a1e37428aa9c4b3bf008925de2ffa07446afd1bc681
(1) 0x37034d1773add474602bef7b12edd683341c728c32544d4b1b28a6b1a697b721
(2) 0xd8eb286bb5d3c3cd859ea76ee91bebd9fdc28e67fb6758e245c124710a427676
(3) 0x6d7bc75fce3283b9544f625349f2171dc5c30eaa59c5c044ca6aee90d10e6f8e
(4) 0x67841b242797916395f758428132103ffc7cd63853e40e9862d14db295abe432
(5) 0x25866c04b05569b84916bccd92609c400118a8a90aba27ee3a955e8840aba871
(6) 0xd4b1fa2a8509a3a056debd9b71965e17dff60a4c39c88c1ed6889dc658b7d673
(7) 0xa55715c8ef3b7710b928eeefa05077968c9d63fbec393169d161903f101fa3e8
(8) 0x891cd6255dd1ba440c73085e4947ac54b535b69ddb039becd36ae563be530e2f
(9) 0xb760bb6d188765185ec80c0638367c544215ca9af3fc02e591ee9e64f9a84bf8

HD Wallet
==================
Mnemonic:      wealth remove team hammer stamp shove blossom truth quantum library sugar glove
Base HD Path:  m/44'/60'/0'/0/{account_index}

Gas Price
==================
20000000000

Gas Limit
==================
6721975

Listening on 127.0.0.1:8545
```

13. Keep the current terminal window open and switch back to the first terminal window.
14. Migrate (deploy) **Splitter** to Ganache.

```bash
$ npx truffle migrate
```

15. You should see similar output as below.

```
Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.


Starting migrations...
======================
> Network name:    'development'
> Network id:      1557014636463
> Block gas limit: 0x6691b7


1_initial_migration.js
======================

   Deploying 'Migrations'
   ----------------------
   > transaction hash:    0xc71725a607ac200f5684c288b3c5457dc30ba1945ab27ed242454e05e0061a6b
   > Blocks: 0            Seconds: 0
   > contract address:    0x09c64bfA52726A900387acb7007780bE3977C1fB
   > block number:        1
   > block timestamp:     1557014696
   > account:             0xCe1F8ca86Aa922C93F4B6d82776152197CaD2E87
   > balance:             99.99453676
   > gas used:            273162
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.00546324 ETH


   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.00546324 ETH


2_deploy_contracts.js
=====================

   Deploying 'Splitter'
   --------------------
   > transaction hash:    0x939772260166e63a0fc1f855e1db087a54943fa5d6b2a930e75f5fcd10c2d9b9
   > Blocks: 0            Seconds: 0
   > contract address:    0x0A538fF26DB5e177Fa49B1EbF26d21CE05c900Bc
   > block number:        3
   > block timestamp:     1557014696
   > account:             0xCe1F8ca86Aa922C93F4B6d82776152197CaD2E87
   > balance:             99.96456572
   > gas used:            1456524
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.02913048 ETH


   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.02913048 ETH


Summary
=======
> Total deployments:   2
> Final cost:          0.03459372 ETH
```

16. Run the test script.

```bash
$ npx truffle test
```

17. You should see similar output as below.

```
Using network 'development'.


Compiling your contracts...
===========================
> Compiling ./test/TestSplitter.sol
> Compiling ./test/helpers/Actor.sol
> Artifacts written to /var/folders/70/018k677x11q6x923vdv0kvwm0000gn/T/test-11944-3716-ufj4cw.u8nmj
> Compiled successfully using:
   - solc: 0.5.8+commit.23d335f2.Emscripten.clang



  TestSplitter
    ✓ testDeployed (80ms)
    ✓ testContractAccounts (208ms)

  Function: constructor
    ✓ should have deployer as pauser
    ✓ should have initial balance of zero

  Function: fallback
    ✓ should revert on fallback (51ms)

  Function: split
    ✓ should revert when split transfer value is zero (63ms)
    ✓ should revert when any recipient is empty (196ms)
    ✓ should revert when recipient is duplicated (43ms)
    ✓ should revert when sender is a recipient (103ms)
    ✓ should split transferred funds (104ms)
    ✓ should split transferred funds and remainder goes to 1st recipient (107ms)

  Function: splitBalance
    ✓ should revert when split balance is zero
    ✓ should revert when any recipient is empty (119ms)
    ✓ should revert when recipient is duplicated (49ms)
    ✓ should revert when sender is a recipient (75ms)
    ✓ should split balance (120ms)
    ✓ should split balance and remainder stay with sender (129ms)

  Function: withdraw
    ✓ should allow recipients to withdraw (171ms)
    ✓ should revert when recipient balance is zero
    ✓ should revert when non-recipient withdraw (65ms)


  20 passing (10s)
  ```

18. **Congratulations!** You have the **Splitter** smart contract running on your machine. This is a typical set-up for development and testing.

## DAPP INSTALLATION (development)

19. Continuing from the previous section, keep your terminal windows opened and Ganache running.
20. For running the DApp you will need MetaMask to be installed.

   - It works with Chrome and Firefox.
   - Follow the instructions found at https://metamask.io to install the plugin.
   - Configure MetaMask by importing the seed phrase (mnemonic) generated by Ganache on step 16.

21. Go to the `app` directory.

```bash
$ cd app
```

22. Install the project dependencies.

```bash
$ npm install
```

23. Run the DApp using the development server provided by React.

```bash
$ npm start
```

24. You should see similar output as below. Also, your default browser should open on the URL listed below.

```
Compiled successfully!

You can now view splitter-app in the browser.

  Local:            http://localhost:3000/
  On Your Network:  http://10.0.1.15:3000/

Note that the development build is not optimized.
To create a production build, use npm run build.
```

25. After you import a few of the Ganache accounts to MetaMask, the latter should ask for authorization to connect the DApp to your account. Press `connect` to proceed.
   ![MetaMask connect dapp to account](screenshot_1.png)

26. The **Splitter** DApp is loaded and ready to be used. You certainly will see different screen than the example below which shows an account which current state all it to perform all operations: pause/unpause, split funds, split balance and withdraw. 

   ![Splitter DApp](screenshot_2.png)

27. **Congratulations!** Now you can use the **Splitter** DApp to split funds between two recipient accounts. You should have at least 3 accounts in MetaMask in order to play with the different roles that an account assume: pauser, funds donor and funds recipient. Enjoy!

## DAPP INSTALLATION (production)

28. The steps above enabled the development build of the DApp.
29. For production environments, you should use a production build where the app is packaged and optimized.
30. To generate the production build, run the command below.

```bash
$ npm run build
```

31. You should see similar output as below.

```
> splitter-app@0.1.0 build /Users/feamcor/Documents/Repositories/blockstars_eth_splitter/app
> react-scripts build

Creating an optimized production build...
Compiled successfully.

File sizes after gzip:

  374.7 KB  build/static/js/2.24d0748d.chunk.js
  23.9 KB   build/static/css/2.4915e3e5.chunk.css
  20.13 KB  build/static/js/main.6464b07a.chunk.js
  786 B     build/static/js/runtime~main.ccec420f.js

The project was built assuming it is hosted at ./.
You can control this with the homepage field in your package.json.

The build folder is ready to be deployed.

Find out more about deployment here:

  https://bit.ly/CRA-deploy
```

32. For running the production build, first you need to install a static server. Below is just one option, choose whatever is best to your environment or of your choice.

```bash
$ npm install serve --save
```

33. And then you can run the static server using your production build.

```bash
$ npx serve -s build
```

34. You should see similar output as below.

```
   ┌───────────────────────────────────────────────┐
   │                                               │
   │   Serving!                                    │
   │                                               │
   │   - Local:            http://localhost:5000   │
   │   - On Your Network:  http://10.0.1.15:5000   │
   │                                               │
   │   Copied local address to clipboard!          │
   │                                               │
   └───────────────────────────────────────────────┘
```

35. To interrupt the server, press `ctrl-c`
36. **Congratulations!** Now you can use the production build of the **Splitter** DApp. Enjoy!

## DAPP ON TESTNET

**Splitter** is deployed on [GitHub Pages](https://pages.github.com/) so you can [try it](https://feamcor.github.io/blockstars_eth_splitter/) on Ropsten and Rinkeby.

### Ropsten
You can check [Etherscan](https://ropsten.etherscan.io/) for the [transaction](https://ropsten.etherscan.io/tx/0x046ada724dc3a73b492ea77ab78025f357bf59bc0743c53b85de9e3b7695af06) and the [contract](https://ropsten.etherscan.io/address/0x0A1C199134DBdcDCA6e610977CE8ebC728A24cEF) deployed on Ropsten. 

```
$ npx truffle migrate --network ropsten

   Deploying 'Splitter'
   --------------------
   > transaction hash:    0x046ada724dc3a73b492ea77ab78025f357bf59bc0743c53b85de9e3b7695af06
   > Blocks: 2            Seconds: 28
   > contract address:    0x0A1C199134DBdcDCA6e610977CE8ebC728A24cEF
   > block number:        5536000
   > block timestamp:     1557020227
   > account:             0xF1BD9268d37D9dbc748b8D0a8556F72d1b331E02
   > balance:             2.9575377922
   > gas used:            1456524
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.02913048 ETH


   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.02913048 ETH
```

### Rinkeby
You can check [Etherscan](https://rinkeby.etherscan.io/) for the [transaction](https://rinkeby.etherscan.io/tx/0x2d3f5f9df95ea8bcb6d89ad77a752f9a9ab674735209676dba35f1480f82a861) and the [contract](https://rinkeby.etherscan.io/address/0x8211AcE10D119D748Fae8F3b9857Adba7FE72542) deployed on Rinkeby. 

```
$ npx truffle migrate --network rinkeby

   Deploying 'Splitter'
   --------------------
   > transaction hash:    0x2d3f5f9df95ea8bcb6d89ad77a752f9a9ab674735209676dba35f1480f82a861
   > Blocks: 0            Seconds: 8
   > contract address:    0x8211AcE10D119D748Fae8F3b9857Adba7FE72542
   > block number:        4326061
   > block timestamp:     1557020370
   > account:             0xF1BD9268d37D9dbc748b8D0a8556F72d1b331E02
   > balance:             0.953358784
   > gas used:            1456524
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.02913048 ETH


   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.02913048 ETH
```

## ROADMAP
  - [ ] Enable toast messages for events generated by Splitter. So far they are going to `console.log` only.
