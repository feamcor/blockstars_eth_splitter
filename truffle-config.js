require("dotenv").config();

/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like truffle-hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura API
 * keys are available for free at: infura.io/register
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const HDWalletProvider = require("truffle-hdwallet-provider");
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const mnemonic = process.env.MNEMONIC;

module.exports = {
  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    // development == ganache-cli
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },

    // ganache-cli
    ganachecli: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },

    // ganache-gui
    ganachegui: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },

    // geth on private local testnet
    net42: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "42",
      gas: 8000000
    },

    ropsten: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `ropsten.infura.io/v3/${infuraProjectId}`,
          0,
          4
        ),
      network_id: 3,
      skipDryRun: true
    },

    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `rinkeby.infura.io/v3/${infuraProjectId}`,
          0,
          4
        ),
      network_id: 4,
      skipDryRun: true
    }
    // Another network with more advanced options...
    // advanced: {
    // port: 8777,             // Custom port
    // network_id: 1342,       // Custom network
    // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
    // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
    // from: <address>,        // Account to send txs from (default: accounts[0])
    // websockets: true        // Enable EventEmitter interface for web3 (default: false)
    // },
    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    // ropsten: {
    // provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/${infuraKey}`),
    // network_id: 3,       // Ropsten's id
    // gas: 5500000,        // Ropsten has a lower block limit than mainnet
    // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    // },
    // Useful for private networks
    // private: {
    // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
    // network_id: 2111,   // This network is yours, in the cloud.
    // production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },

  mocha: {
    enableTimeouts: true, // might have to disable for public/private nets
    timeout: 30000
  },

  compilers: {
    solc: {
      version: "0.5.8",
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: false,
          runs: 200
        }
        //  evmVersion: "byzantium"
        // }
      }
    }
  }
};
