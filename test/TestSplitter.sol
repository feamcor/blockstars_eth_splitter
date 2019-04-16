pragma solidity 0.5.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Splitter.sol";
import "./helpers/Actor.sol";

contract TestSplitter {  
    uint public initialBalance = 1 ether;

    function testDeployed() public {
        Splitter _splitter = Splitter(DeployedAddresses.Splitter());
        Assert.balanceIsZero(address(_splitter), "initial balance is not zero");   
    }

    function testContractAccounts() public {
        Actor _alice = new Actor();
        Assert.balanceIsZero(address(_alice), "balance is not zero (alice)");
        Actor _bob = new Actor();
        Assert.balanceIsZero(address(_bob), "balance is not zero (bob)");
        Actor _carol = new Actor();
        Assert.balanceIsZero(address(_carol), "balance is not zero (carol)");
        Splitter _splitter = _alice.newSplitter(address(_bob), address(_carol));
        Assert.balanceIsZero(address(_splitter), "balance is not zero (splitter)");
        address(_alice).transfer(5 szabo);
        Assert.balanceEqual(address(_alice), 5 szabo, "transfer mismatch (alice)");
        address(_bob).transfer(1 szabo);
        Assert.balanceEqual(address(_bob), 1 szabo, "transfer mismatch (bob)");
        address(_carol).transfer(1 szabo);
        Assert.balanceEqual(address(_carol), 1 szabo, "transfer mismatch (carol)");
        _alice.deposit(_splitter, 2 szabo);
        Assert.balanceEqual(address(_splitter), 2 szabo, "deposit mismatch (splitter)");
        _bob.withdraw(_splitter);
        Assert.balanceEqual(address(_bob), 2 szabo, "withdraw mismatch (bob)");
        _carol.withdraw(_splitter);
        Assert.balanceEqual(address(_carol), 2 szabo, "withdraw mismatch (carol)");
    }
}
