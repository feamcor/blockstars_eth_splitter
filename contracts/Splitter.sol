pragma solidity 0.5.2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

/// @title Split deposited funds among recipient accounts.
/// @author Fábio Corrêa <feamcor@gmail.com>
/// @notice B9lab Blockstars Certified Ethereum Developer Course
/// @notice Module 5 project: Splitter
contract Splitter is Ownable, Pausable {
  using SafeMath for uint;
  address public recipient1;
  address public recipient2;
  uint public balance1;
  uint public balance2;

  event RecipientsSet(address indexed by, address indexed recipient1, address indexed recipient2);
  event FundsSplitted(address indexed by, uint deposit, uint amount1, uint amount2);
  event FundsWithdrew(address indexed by, uint amount);

  /// @notice Initialize contract and accounts that will receive the splitted funds.
  /// @param _recipient1 address of first recipient account
  /// @param _recipient2 address of second recipient account
  /// @dev Emits `OwnershipTransferred` and `RecipientsSet` events.
  constructor(address _recipient1, address _recipient2) public {
    require(_recipient1 != address(0x0) && _recipient2 != address(0x0), "recipients cannot be empty");
    require(_recipient1 != _recipient2, "recipients must be different");
    require(_recipient1 != msg.sender && _recipient2 != msg.sender, "owner cannot be recipient");
    recipient1 = _recipient1;
    recipient2 = _recipient2;
    emit RecipientsSet(msg.sender, _recipient1, _recipient2);
  }

  /// @notice Split funds transferred among the recipient accounts.
  /// @notice Any remainder resulting from split will be added to 1st recipient. 
  /// @dev Emits `FundsSplitted` event.
  function split() external payable whenNotPaused onlyOwner {
    require(msg.value != uint(0), "no funds provided");
    uint _split2 = msg.value.div(2);
    uint _split1 = _split2.add(msg.value.mod(2));
    balance2 = balance2.add(_split2);
    balance1 = balance1.add(_split1);
    emit FundsSplitted(msg.sender, msg.value, _split1, _split2);
  }

  /// @notice Withdraw accumulated balance.
  /// @dev Emits `FundsWithdrew` event.
  function withdraw() external whenNotPaused {
    uint _balance;
    if(msg.sender == recipient1) {
      _balance = balance1;
      balance1 = uint(0);
    } else if(msg.sender == recipient2) {
      _balance = balance2;
      balance2 = uint(0);
    } else {
      revert("not a recipient");
    } 
    require(_balance != uint(0), "balance is zero");
    msg.sender.transfer(_balance);
    emit FundsWithdrew(msg.sender, _balance);
  }
}
