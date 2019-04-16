pragma solidity 0.5.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Splitter.sol";
import "./helpers/Actor.sol";

contract TestSplitter {    
    function testDeployed() public {
        Splitter _splitter = Splitter(DeployedAddresses.Splitter());
        Assert.balanceIsZero(address(_splitter), "initial balance is not zero");   
    }

    function testContractAccounts() public {
        Actor _alice = new Actor();
        Actor _bob = new Actor();
        Actor _carol = new Actor();
        uint _deposit = 1_000_000 wei;
        Splitter _splitter = _alice.newSplitter(address(_bob), address(_carol));
        _alice.deposit(_splitter, _deposit);
        Assert.balanceEqual(address(_splitter), _deposit, "balance mismatch");
    }
}
