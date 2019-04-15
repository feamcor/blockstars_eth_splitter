pragma solidity 0.5.2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/// @title Split deposited funds among recipient accounts.
/// @author Fábio Corrêa <feamcor@gmail.com>
/// @notice B9lab Blockstars Certified Ethereum Developer Course
/// @notice Module 5 project: Splitter
contract Splitter is Ownable {
  using SafeMath for uint;
  address public recipient1;
  address public recipient2;
  uint public balance1;
  uint public balance2;

  event RecipientSet(address indexed by, address indexed recipient);
  event FundsDeposited(address indexed by, uint amount);
  event FundsSplitted(address indexed by, address indexed to, uint amount);
  event FundsWithdrew(address indexed by, uint amount);

  /// @notice Initialize contract and members that will receive the splitted funds.
  /// @param _recipient1 address of first recipient account
  /// @param _recipient2 address of second recipient account
  /// @dev Emits `OwnershipTransferred` and `RecipientSet` events.
  constructor(address _recipient1, address _recipient2) public {
    require(_recipient1 != _recipient2, "recipients must be different");
    require(_recipient1 != msg.sender && _recipient2 != msg.sender, "owner cannot be recipient");
    recipient1 = _recipient1;
    recipient2 = _recipient2;
    emit RecipientSet(msg.sender, _recipient1);
    emit RecipientSet(msg.sender, _recipient2);
  }

  /// @notice Deposit and split funds among the recipient accounts.
  /// @notice Any remainder resulting from split will be added to 1st recipient. 
  /// @dev Emits `FundsDeposited` and `FundsSplitted` events.
  function deposit() external payable onlyOwner {
    require(msg.value != uint(0), "no funds provided");
    uint _split2 = msg.value.div(2);
    uint _split1 = _split2.add(msg.value.mod(2));
    balance2 = balance2.add(_split2);
    balance1 = balance1.add(_split1);
    emit FundsDeposited(msg.sender, msg.value);
    emit FundsSplitted(msg.sender, recipient2, _split2);
    emit FundsSplitted(msg.sender, recipient1, _split1);
  }

  /// @notice Withdraw accumulated balance.
  /// @dev Emits `FundsWithdrew` event.
  function withdraw() external {
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
