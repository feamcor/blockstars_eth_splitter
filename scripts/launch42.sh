#!/bin/bash
#geth --datadir ~/.ethereum_net42 --networkid 42

# this is better when you want to control mining manually via console
geth --datadir ~/.ethereum_net42 --networkid 42 --rpc --rpcport 8545 --rpcaddr 0.0.0.0 --rpccorsdomain "*" --rpcapi "eth,net,web3" --gcmode archive

# this is better for development testing where mining start/stop automatically
#geth --datadir ~/.ethereum_net42 --networkid 42 --rpc --rpcport 8545 --rpcaddr 0.0.0.0 --rpccorsdomain "*" --rpcapi "eth,net,web3" --gcmode archive js conditional_mining.js
