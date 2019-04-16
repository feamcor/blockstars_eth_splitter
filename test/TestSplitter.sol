pragma solidity 0.5.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Splitter.sol";

contract Recipient {
    address splitter;
    bytes withdraw;

    constructor(address _splitter, bytes memory _withdraw) public {
        splitter = _splitter;
        withdraw = _withdraw;
    }

    function callWithdraw() public {
        (bool success, bytes memory data) = address(splitter).delegatecall(withdraw);
    }
}

contract TestSplitter {
    function testDeployed() public {
        Splitter splitter = Splitter(DeployedAddresses.Splitter());
        Assert.balanceIsZero(address(splitter), "initial balance is not zero");   
    }
}
