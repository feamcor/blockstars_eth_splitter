const truffleAssert = require("truffle-assertions");
const { createTransactionResult, eventEmitted, reverts } = truffleAssert;
const { toBN, toWei } = web3.utils;
const Splitter = artifacts.require("Splitter");

contract("Splitter", async accounts => {
  const alice = accounts[0];
  const bob = accounts[1];
  const carol = accounts[2];
  const someone = accounts[3];
  let splitter = null;

  beforeEach("spawn new instance of contract", async () => {
    splitter = await Splitter.new({ from: alice });
  });

  it("constructor should enroll 1st member", async () => {
    const result = await createTransactionResult(
      splitter,
      splitter.transactionHash
    );
    await eventEmitted(result, "MemberEnrolled", log => {
      return log.by === alice && log.member === alice;
    });
    const length = await splitter.getMembersLength();
    const details = await splitter.getMemberDetailsByIndex(0);
    assert.strictEqual(length.toString(10), "1", "members array length not 1");
    assert.strictEqual(details["0"], alice, "1st member mismatch");
    assert.strictEqual(
      details["1"].toString(10),
      "0",
      "1st member balance not zero"
    );
  });

  it("should enroll 2nd member", async () => {
    const result = await splitter.enroll(bob, { from: alice });
    await eventEmitted(result, "MemberEnrolled", log => {
      return log.by === alice && log.member === bob;
    });
    const length = await splitter.getMembersLength();
    const details = await splitter.getMemberDetailsByIndex(1);
    assert.strictEqual(length.toString(10), "2", "members array length not 2");
    assert.strictEqual(details["0"], bob, "2nd member mismatch");
    assert.strictEqual(
      details["1"].toString(10),
      "0",
      "2nd member balance not zero"
    );
  });

  it("should enroll 3rd member", async () => {
    await splitter.enroll(bob, { from: alice });
    const result = await splitter.enroll(carol, { from: bob });
    await eventEmitted(result, "MemberEnrolled", log => {
      return log.by === bob && log.member === carol;
    });
    const length = await splitter.getMembersLength();
    const details = await splitter.getMemberDetailsByIndex(2);
    assert.strictEqual(length.toString(10), "3", "members array length not 3");
    assert.strictEqual(details["0"], carol, "3rd member mismatch");
    assert.strictEqual(
      details["1"].toString(10),
      "0",
      "3rd member balance not zero"
    );
  });

  it("should not allow to enroll 4th member", async () => {
    await splitter.enroll(bob, { from: alice });
    await splitter.enroll(carol, { from: bob });
    await reverts(
      splitter.enroll(someone, { from: carol }),
      "no more members accepted"
    );
  });

  it("should not allow to enroll existing member", async () => {
    await reverts(
      splitter.enroll(alice, { from: alice }),
      "member already enrolled"
    );
  });

  it("should not allow non-member to enroll someone", async () => {
    await reverts(
      splitter.enroll(someone, { from: carol }),
      "not allowed to enroll"
    );
  });

  it("should not allow to enroll member with invalid address", async () => {
    await reverts(
      splitter.enroll("0x0000000000000000000000000000000000000000", {
        from: alice
      }),
      "member not valid"
    );
  });

  it("group of 1 should deposit and add leftover", async () => {
    const value = toBN(toWei("1", "ether"));
    const leftover = toBN(toWei("1", "ether"));
    const result = await splitter.deposit({ from: alice, value: value });
    await eventEmitted(result, "FundsDeposited", log => {
      return log.by === alice && log.amount.eq(value);
    });
    await eventEmitted(result, "FundsSplitted", log => {
      return log.to === alice && log.amount.eq(leftover);
    });
  });

  it("group of 2 should deposit and add amount", async () => {
    await splitter.enroll(bob, { from: alice });
    const value = toBN(toWei("1", "ether"));
    const amount = toBN(toWei("1", "ether"));
    const result = await splitter.deposit({ from: alice, value: value });
    await eventEmitted(result, "FundsDeposited", log => {
      return log.by === alice && log.amount.eq(value);
    });
    await eventEmitted(result, "FundsSplitted", log => {
      return log.to === bob && log.amount.eq(amount);
    });
  });

  it("group of 3 should deposit and split amount", async () => {
    await splitter.enroll(bob, { from: alice });
    await splitter.enroll(carol, { from: bob });
    const value = toBN(toWei("1", "ether"));
    const amount = toBN(toWei("0.5", "ether"));
    const result = await splitter.deposit({ from: alice, value: value });
    await eventEmitted(result, "FundsDeposited", log => {
      return log.by === alice && log.amount.eq(value);
    });
    await eventEmitted(result, "FundsSplitted", log => {
      return log.to === bob && log.amount.eq(amount);
    });
    await eventEmitted(result, "FundsSplitted", log => {
      return log.to === carol && log.amount.eq(amount);
    });
  });

  it("group of 3 should deposit and split amount and leftover", async () => {
    await splitter.enroll(bob, { from: alice });
    await splitter.enroll(carol, { from: bob });
    const value = toBN("333");
    const amount = toBN("166");
    const leftover = toBN("1");
    const result = await splitter.deposit({ from: alice, value: value });
    await eventEmitted(result, "FundsDeposited", log => {
      return log.by === alice && log.amount.eq(value);
    });
    await eventEmitted(result, "FundsSplitted", log => {
      return log.to === alice && log.amount.eq(leftover);
    });
    await eventEmitted(result, "FundsSplitted", log => {
      return log.to === bob && log.amount.eq(amount);
    });
    await eventEmitted(result, "FundsSplitted", log => {
      return log.to === carol && log.amount.eq(amount);
    });
  });

  it("should not allow non-member to deposit", async () => {
    const value = toBN(toWei("1", "ether"));
    await reverts(
      splitter.deposit({ from: someone, value: value }),
      "member not enrolled"
    );
  });

  it("should not allow deposit of no funds", async () => {
    const value = toBN("0");
    await reverts(
      splitter.deposit({ from: alice, value: value }),
      "no funds provided"
    );
  });

  it("should not allow deposit of small funds", async () => {
    await splitter.enroll(bob, { from: alice });
    await splitter.enroll(carol, { from: bob });
    const value = toBN("1");
    await reverts(
      splitter.deposit({ from: alice, value: value }),
      "deposit amount too smal"
    );
  });
});
