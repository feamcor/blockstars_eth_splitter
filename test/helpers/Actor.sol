pragma solidity 0.5.8;

import "../../contracts/Splitter.sol";

contract Actor {

    event FundsReceived(address from, uint value);

    function() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }
 
    function split(Splitter _splitter, uint _value, address _first, address _second) public {
        require(address(_splitter) != address(0x0), "splitter is empty");
        require(_value != uint(0), "value to split is zero");
        require(_first != address(0x0), "1st recipient is empty");
        require(_second != address(0x0), "2nd recipient is empty");
        _splitter.split.value(_value)(_first, _second);
    }

    function withdraw(Splitter _splitter) public {
        require(address(_splitter) != address(0x0), "splitter is empty");
        _splitter.withdraw();
    }
}
