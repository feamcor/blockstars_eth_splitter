pragma solidity 0.5.2;

import "../../contracts/Splitter.sol";

contract Actor {
    event SplitterInstantiated(address indexed by, address splitter, address indexed recipient1, address indexed recipient2);
    event SplitFired(address indexed by, uint amount);
    event WithdrawFired(address indexed by);

    function() external payable {}

    function newSplitter(address _r1, address _r2) public returns(Splitter) {
        Splitter _splitter = new Splitter(_r1, _r2);
        emit SplitterInstantiated(address(this), address(_splitter), _r1, _r2);
        return _splitter;
    }

    function split(Splitter _splitter, uint _amount) public {
        require(address(_splitter) != address(0x0), "splitter is undefined");
        require(_amount != uint(0), "deposit amount is zero");
        _splitter.split.value(_amount)();
        emit SplitFired(address(this), _amount);
    }

    function withdraw(Splitter _splitter) public {
        require(address(_splitter) != address(0x0), "splitter is undefined");
        _splitter.withdraw();
        emit WithdrawFired(address(this));
    }
}
