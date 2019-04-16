pragma solidity 0.5.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Splitter.sol";


contract Actor {
    function newSplitter(address _r1, address _r2) public returns(Splitter) {
        return new Splitter(_r1, _r2);
    }

    function deposit(Splitter _splitter, uint _amount) public {
        require(address(_splitter) != address(0x0), "splitter is undefined");
        require(_amount != uint(0), "deposit amount is zero");
        _splitter.deposit();
    }

    function withdraw(Splitter _splitter) public {
        require(address(_splitter) != address(0x0), "splitter is undefined");
        _splitter.withdraw();
    }
}

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
