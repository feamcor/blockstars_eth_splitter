const truffleAssert = require("truffle-assertions");
const { createTransactionResult, eventEmitted, reverts } = truffleAssert;
const { toBN, toWei } = web3.utils;
const Splitter = artifacts.require("Splitter");

contract("Splitter", async accounts => {
  const BN_0 = toBN("0");
  const BN_1 = toBN("1");
  const BN_2 = toBN("2");
  const BN_3 = toBN("3");
  const BN_1ETH = toBN(toWei("1", "ether"));

  const ALICE = accounts[0];
  const BOB = accounts[1];
  const CAROL = accounts[2];
  const SOMEONE = accounts[3];

  let splitter = null;

  beforeEach("spawn new instance of contract", async () => {
    splitter = await Splitter.new({ from: ALICE });
  });

  it("constructor should enroll 1st member", async () => {
    const result = await createTransactionResult(
      splitter,
      splitter.transactionHash
    );
    await eventEmitted(result, "MemberEnrolled", log => {
      return log.by === ALICE && log.member === ALICE;
    });
    const length = await splitter.getMembersLength();
    const details = await splitter.getMemberDetailsByIndex(0);
    assert(length.eq(BN_1), "members array length not 1");
    assert.strictEqual(details.member, ALICE, "1st member mismatch");
    assert(details.balance.eq(BN_0), "1st member balance not zero");
  });

  it("should enroll 2nd member", async () => {
    const result = await splitter.enroll(BOB, { from: ALICE });
    await eventEmitted(result, "MemberEnrolled", log => {
      return log.by === ALICE && log.member === BOB;
    });
    const length = await splitter.getMembersLength();
    const details = await splitter.getMemberDetailsByIndex(1);
    assert(length.eq(BN_2), "members array length not 2");
    assert.strictEqual(details.member, BOB, "2nd member mismatch");
    assert(details.balance.eq(BN_0), "2nd member balance not zero");
  });

  it("should enroll 3rd member", async () => {
    await splitter.enroll(BOB, { from: ALICE });
    const result = await splitter.enroll(CAROL, { from: BOB });
    await eventEmitted(result, "MemberEnrolled", log => {
      return log.by === BOB && log.member === CAROL;
    });
    const length = await splitter.getMembersLength();
    const details = await splitter.getMemberDetailsByIndex(2);
    assert(length.eq(BN_3), "members array length not 3");
    assert.strictEqual(details.member, CAROL, "3rd member mismatch");
    assert(details.balance.eq(BN_0), "3rd member balance not zero");
  });

  it("should not allow to enroll 4th member", async () => {
    await splitter.enroll(BOB, { from: ALICE });
    await splitter.enroll(CAROL, { from: BOB });
    await reverts(
      splitter.enroll(SOMEONE, { from: CAROL }),
      "no more members accepted"
    );
  });

  it("should not allow to enroll existing member", async () => {
    await reverts(
      splitter.enroll(ALICE, { from: ALICE }),
      "member already enrolled"
    );
  });

  it("should not allow non-member to enroll someone else", async () => {
    await reverts(
      splitter.enroll(SOMEONE, { from: CAROL }),
      "not allowed to enroll"
    );
  });

  it("should not allow to enroll member with invalid address", async () => {
    await reverts(
      splitter.enroll("0x0000000000000000000000000000000000000000", {
        from: ALICE
      }),
      "member not valid"
    );
  });

  it("group of 1 should deposit and add leftover", async () => {
    const result = await splitter.deposit({ from: ALICE, value: BN_1ETH });
    await eventEmitted(result, "FundsDeposited", log => {
      return log.by === ALICE && log.amount.eq(BN_1ETH);
    });
    await eventEmitted(result, "FundsSplitted", log => {
      return log.to === ALICE && log.amount.eq(BN_1ETH);
    });
  });

  it("group of 2 should deposit and add amount", async () => {
    await splitter.enroll(BOB, { from: ALICE });
    const result = await splitter.deposit({ from: ALICE, value: BN_1ETH });
    await eventEmitted(result, "FundsDeposited", log => {
      return log.by === ALICE && log.amount.eq(BN_1ETH);
    });
    await eventEmitted(result, "FundsSplitted", log => {
      return log.to === BOB && log.amount.eq(BN_1ETH);
    });
  });

  it("group of 3 should deposit and split amount", async () => {
    await splitter.enroll(BOB, { from: ALICE });
    await splitter.enroll(CAROL, { from: BOB });
    const amount = toBN(toWei("0.5", "ether"));
    const result = await splitter.deposit({ from: ALICE, value: BN_1ETH });
    await eventEmitted(result, "FundsDeposited", log => {
      return log.by === ALICE && log.amount.eq(BN_1ETH);
    });
    await eventEmitted(result, "FundsSplitted", log => {
      return log.to === BOB && log.amount.eq(amount);
    });
    await eventEmitted(result, "FundsSplitted", log => {
      return log.to === CAROL && log.amount.eq(amount);
    });
  });

  it("group of 3 should deposit and split amount and leftover", async () => {
    await splitter.enroll(BOB, { from: ALICE });
    await splitter.enroll(CAROL, { from: BOB });
    const value = toBN("333");
    const amount = toBN("166");
    const leftover = toBN("1");
    const result = await splitter.deposit({ from: ALICE, value: value });
    await eventEmitted(result, "FundsDeposited", log => {
      return log.by === ALICE && log.amount.eq(value);
    });
    await eventEmitted(result, "FundsSplitted", log => {
      return log.to === ALICE && log.amount.eq(leftover);
    });
    await eventEmitted(result, "FundsSplitted", log => {
      return log.to === BOB && log.amount.eq(amount);
    });
    await eventEmitted(result, "FundsSplitted", log => {
      return log.to === CAROL && log.amount.eq(amount);
    });
  });

  it("should not allow non-member to deposit", async () => {
    await reverts(
      splitter.deposit({ from: SOMEONE, value: BN_1ETH }),
      "member not enrolled"
    );
  });

  it("should not allow deposit of no funds", async () => {
    await reverts(
      splitter.deposit({ from: ALICE, value: BN_0 }),
      "no funds provided"
    );
  });

  it("should not allow deposit of small funds", async () => {
    await splitter.enroll(BOB, { from: ALICE });
    await splitter.enroll(CAROL, { from: BOB });
    await reverts(
      splitter.deposit({ from: ALICE, value: BN_1 }),
      "deposit amount too smal"
    );
  });
});
