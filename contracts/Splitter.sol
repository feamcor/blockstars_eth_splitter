pragma solidity 0.5.2;

/// @title Split deposited funds among members of a group
/// @author Fábio Corrêa <feamcor@gmail.com>
/// @notice B9lab Blockstars Certified Ethereum Developer Course
/// @notice Module 5 project: Splitter
contract Splitter {
  uint constant private MAX_MEMBERS = uint(3);
  address[] private members;
  mapping(address => bool) private enrolled;
  mapping(address => uint) private balances;

  event MemberEnrolled(address indexed by, address indexed member);
  event FundsDeposited(address indexed by, uint amount);
  event FundsSplitted(address indexed to, uint amount);
  event FundsWithdrew(address indexed by, uint amount);

  /// @notice Initialize contract by adding deployer as first member of the group.
  /// @dev Emits `MemberEnrolled` event.
  constructor() public {
    members.push(msg.sender);
    enrolled[msg.sender] = true;
    emit MemberEnrolled(msg.sender, msg.sender);
  }

  /// @notice Add new member to group.
  /// @param _member address of the new member.
  /// @dev Emits `MemberEnrolled` event.
  function enroll(address _member) external {
    require(enrolled[msg.sender], "not allowed to enroll members");
    require(_member != address(0x0), "member not valid");
    require(members.length < MAX_MEMBERS, "no more members accepted");
    require(!enrolled[_member], "member already enrolled");
    members.push(_member);
    enrolled[_member] = true;
    emit MemberEnrolled(msg.sender, _member);
  }

  /// @notice Deposit and split funds to members of the group, but the depositer.
  /// @dev Emits `FundsDeposited` (once) and `FundsSplitted` (per member) events.
  function deposit() external payable {
    require(enrolled[msg.sender], "member not enrolled");
    require(msg.value != uint(0), "no funds provided");
    require(msg.value >= members.length - 1, "deposit amount too small");
    emit FundsDeposited(msg.sender, msg.value);
    uint _amount = uint(0);
    uint _leftover = msg.value;
    if(members.length > 1) {
      _amount = msg.value / (members.length - 1);
      _leftover = msg.value % (members.length - 1); 
    }
    if(_leftover > 0) {
      balances[msg.sender] += _leftover;
      emit FundsSplitted(msg.sender, _leftover);
    }
    for(uint i = uint(0); i < members.length; i++) {
      if(members[i] != msg.sender) {
        balances[members[i]] += _amount;
        emit FundsSplitted(members[i], _amount);
      }
    }
  }

  /// @notice Withdraw splitted funds from previous deposits.
  /// @dev Emits `FundsWithdrew` event.
  function withdraw() external payable {
    require(balances[msg.sender] != uint(0), "not enrolled or no balance");
    uint _amount = balances[msg.sender];
    balances[msg.sender] = 0;
    msg.sender.transfer(_amount);
    emit FundsWithdrew(msg.sender, _amount);
  }

  /// @notice Return number of members enrolled in the group.
  /// @return number of members enrolled.
  function getMembersLength() public view returns (uint length) {
    return members.length;
  }

  /// @notice Return member details based on its order of enrollment.
  /// @param _index position of member (starting from zero) on list of members
  /// @return address and balance of member or zeros if out of range
  function getMemberDetailsByIndex(uint _index) public view returns (address member, uint balance) {
    if(_index < members.length) {
      return (members[_index], balances[members[_index]]);
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
