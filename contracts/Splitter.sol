pragma solidity 0.5.2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/// @title Split deposited funds among members of a group
/// @author Fábio Corrêa <feamcor@gmail.com>
/// @notice B9lab Blockstars Certified Ethereum Developer Course
/// @notice Module 5 project: Splitter
contract Splitter is Ownable {
  using SafeMath for uint;
  uint public quantity;
  address[] private members;
  mapping(address => bool) private enrolled;
  mapping(address => uint) private balances;

  event Initialized(address indexed by, uint quantity);
  event MemberEnrolled(address indexed by, address indexed member);
  event FundsDeposited(address indexed by, uint amount);
  event FundsSplitted(address indexed by, address indexed to, uint amount);
  event FundsWithdrew(address indexed by, uint amount);

  /// @notice Initialize contract.
  /// @param _quantity number of members to be enrolled in the group
  /// @dev Emits `Initialized` event.
  constructor(uint _quantity) public {
    require(_quantity != uint(0), "quantity cannot be zero");
    require(_quantity <= uint(10), "quantity too large");
    quantity = _quantity;
    emit Initialized(msg.sender, quantity);
  }

  /// @notice Add member to group.
  /// @param _member address of the new member
  /// @dev Emits `MemberEnrolled` event.
  function enroll(address _member) external onlyOwner {
    require(members.length < quantity, "all members enrolled");
    require(!enrolled[_member], "member already enrolled");
    members.push(_member);
    enrolled[_member] = true;
    emit MemberEnrolled(msg.sender, _member);
  }

  /// @notice Deposit and split funds among the members of the group.
  /// @dev Emits `FundsDeposited` (once) and `FundsSplitted` (per member) events.
  function deposit() external payable onlyOwner {
    require(msg.value != uint(0), "no funds provided");
    require(members.length == quantity, "not all members enrolled");
    emit FundsDeposited(msg.sender, msg.value);
    uint _amount = msg.value.div(quantity);
    for(uint i = 0; i < quantity; i++) {
      address _member = members[i];
      balances[_member] = balances[_member].add(_amount);
      emit FundsSplitted(msg.sender, _member, _amount);
    }
  }

  /// @notice Withdraw splitted funds from previous deposits.
  /// @dev Emits `FundsWithdrew` event.
  function withdraw() external {
    require(balances[msg.sender] != uint(0), "no balance or not enrolled");
    uint _amount = balances[msg.sender];
    balances[msg.sender] = uint(0);
    msg.sender.transfer(_amount);
    emit FundsWithdrew(msg.sender, _amount);
  }

  /// @notice Return number of members enrolled, so far, in the group.
  /// @return number of members enrolled.
  function getMembersLength() public view returns (uint length) {
    return members.length;
  }

  /// @notice Return member details based on its order of enrollment.
  /// @param _index position of member (starting from zero) on list of members
  /// @return address and balance of member or zeros if out of range
  function getMemberDetailsByIndex(uint _index) public view returns (address member, uint balance) {
    if(_index < members.length) {
      address _member = members[_index];
      return (_member, balances[_member]);
    } else {
      return (address(0x0), uint(0));
    }
  }

  /// @notice Return member balance according to its address.
  /// @param _member address of member
  /// @return balance of member or zero if non-member
  function getMemberBalance(address _member) public view returns (uint balance) {
    return balances[_member];
  }
}
