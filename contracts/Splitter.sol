pragma solidity 0.5.8;

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
        address indexed first,
        address indexed second,
        uint value1st,
        uint value2nd
    );
    event BalanceSplitted(
        address indexed from,
        address indexed first,
        address indexed second,
        uint value
    );
    event BalanceWithdrew(address indexed by, uint balance);

    modifier validRecipients(address _first, address _second) {
        require(_first != address(0x0) && _second != address(0x0), "recipients cannot be empty");
        require(_first != _second, "recipients must be different");
        require(_first != msg.sender && _second != msg.sender, "sender cannot be recipient");
        _;
    }

    /// @notice Split funds transferred by sender between recipient accounts.
    /// @notice Any remainder resulting from split will be added to 1st recipient.
    /// @param _first address of first recipient account
    /// @param _second address of second recipient account
    /// @dev Emits `FundsSplitted` event.
    function split(address _first, address _second)
        external
        payable
        whenNotPaused
        validRecipients(_first, _second)
    {
        require(msg.value != uint(0), "value is zero");
        uint _value2nd = msg.value.div(2);
        uint _value1st = _value2nd.add(msg.value.mod(2));
        emit FundsSplitted(msg.sender, _first, _second, _value1st, _value2nd);
        balances[_second] = balances[_second].add(_value2nd);
        balances[_first] = balances[_first].add(_value1st);
    }

    /// @notice Split sender's balance between recipient accounts.
    /// @notice Any remainder resulting from split will be kept on sender's balance.
    /// @param _first address of first recipient account
    /// @param _second address of second recipient account
    /// @dev Emits `BalanceSplitted` event.
    function splitBalance(address _first, address _second)
        external
        whenNotPaused
        validRecipients(_first, _second)
    {
        uint _balance = balances[msg.sender];
        require(_balance != uint(0), "balance is zero");
        uint _value = _balance.div(2);
        emit BalanceSplitted(msg.sender, _first, _second, _value);
        balances[msg.sender] = _balance.mod(2);
        balances[_second] = balances[_second].add(_value);
        balances[_first] = balances[_first].add(_value);
    }

    /// @notice Withdraw recipient accumulated balance.
    /// @dev Emits `BalanceWithdrew` event.
    function withdraw() external whenNotPaused {
        uint _balance = balances[msg.sender];
        require(_balance != uint(0), "balance is zero");
        emit BalanceWithdrew(msg.sender, _balance);
        balances[msg.sender] = uint(0);
        msg.sender.transfer(_balance);
    }
}
