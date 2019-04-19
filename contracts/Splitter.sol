pragma solidity 0.5.2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

/// @title Split deposited funds among recipient accounts.
/// @author Fábio Corrêa <feamcor@gmail.com>
/// @notice B9lab Blockstars Certified Ethereum Developer Course
/// @notice Module 5 project: Splitter
contract Splitter is Pausable {
    using SafeMath for uint;
    mapping(address => uint) public balances;

    event FundsSplitted(
        address indexed from, 
        uint value,
        address indexed first, 
        uint value1st,
        address indexed second, 
        uint value2nd);
    event FundsWithdrew(address indexed by, uint balance);

    /// @notice Split funds transferred among recipient accounts.
    /// @notice Any remainder resulting from split will be added to 1st recipient. 
    /// @param _first address of first recipient account
    /// @param _second address of second recipient account
    /// @dev Emits `FundsSplitted` event.
    function split(address _first, address _second) 
        external 
        payable 
        whenNotPaused 
    {
        require(msg.value != uint(0), "no funds provided");
        require(_first != address(0x0) && _second != address(0x0), "recipients cannot be empty");
        require(_first != _second, "recipients must be different");
        require(_first != msg.sender && _second != msg.sender, "sender cannot be recipient");
        uint _value2nd = msg.value.div(2);
        uint _value1st = _value2nd.add(msg.value.mod(2));
        balances[_second] = balances[_second].add(_value2nd);
        balances[_first] = balances[_first].add(_value1st);
        emit FundsSplitted(msg.sender, msg.value, _first, _value1st, _second, _value2nd);
    }

    /// @notice Withdraw recipient accumulated balance.
    /// @dev Emits `FundsWithdrew` event.
    function withdraw() external whenNotPaused {
        uint _balance = balances[msg.sender];
        require(_balance != 0, "balance is zero");
        balances[msg.sender] = uint(0);
        msg.sender.transfer(_balance);
        emit FundsWithdrew(msg.sender, _balance);
    }
}
