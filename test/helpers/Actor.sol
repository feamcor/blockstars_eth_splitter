pragma solidity 0.5.2;

import "../../contracts/Splitter.sol";

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
