const truffleAssert = require("truffle-assertions");
const {createTransactionResult, eventEmitted, reverts} = truffleAssert;
const Splitter = artifacts.require("Splitter");

contract('Splitter', async (accounts) => {
  const alice = accounts[0];
  const bob = accounts[1];
  const carol = accounts[2];
  const someone = accounts[3];

  it("constructor should enroll 1st member", async () => {
    const splitter = await Splitter.new({from: alice});
    const result = await createTransactionResult(splitter, splitter.transactionHash);
    await eventEmitted(result, "MemberEnrolled", (log) => {
      return log.by === alice && log.member === alice;
    });
    const length = await splitter.getMembersLength();
    const details = await splitter.getMemberDetailsByIndex(0);
    assert.strictEqual(length.toString(10), "1", "members array length not 1");
    assert.strictEqual(details["0"], alice, "1st member mismatch");
    assert.strictEqual(details["1"].toString(10), "0", "1st member balance not zero");
  });

  it("should enroll 2nd member", async () => {
    const splitter = await Splitter.new({from: alice});
    const result = await splitter.enroll(bob, {from: alice});
    await eventEmitted(result, "MemberEnrolled", (log) => {
      return log.by === alice && log.member === bob; 
    });
    const length = await splitter.getMembersLength();
    const details = await splitter.getMemberDetailsByIndex(1);
    assert.strictEqual(length.toString(10), "2", "members array length not 2");
    assert.strictEqual(details["0"], bob, "2nd member mismatch");
    assert.strictEqual(details["1"].toString(10), "0", "2nd member balance not zero");
  });

  it("should enroll 3rd member", async () => {
    const splitter = await Splitter.new({from: alice});
    await splitter.enroll(bob, {from: alice});
    const result = await splitter.enroll(carol, {from: bob});
    await eventEmitted(result, "MemberEnrolled", (log) => {
      return log.by === bob && log.member === carol; 
    });
    const length = await splitter.getMembersLength();
    const details = await splitter.getMemberDetailsByIndex(2);
    assert.strictEqual(length.toString(10), "3", "members array length not 3");
    assert.strictEqual(details["0"], carol, "3rd member mismatch");
    assert.strictEqual(details["1"].toString(10), "0", "3rd member balance not zero");
  });

  it("should not allow to enroll 4th member", async () => {
    const splitter = await Splitter.new({from: alice});
    await splitter.enroll(bob, {from: alice});
    await splitter.enroll(carol, {from: bob});
    await reverts(splitter.enroll(someone, {from: carol}), "no more members accepted");
  });

  it("should not allow to enroll existing member", async () => {
    const splitter = await Splitter.new({from: alice});
    await reverts(splitter.enroll(alice, {from: alice}), "member already enrolled");
  });

  it("should not allow non-member to enroll someone", async () => {
    const splitter = await Splitter.new({from: alice});
    await reverts(splitter.enroll(someone, {from: carol}), "not allowed to enroll");
  });

  it("should not allow to enroll member with invalid address", async () => {
    const splitter = await Splitter.new({from: alice});
    await reverts(splitter.enroll("0x0000000000000000000000000000000000000000", {from: alice}), "member not valid");
  });
});
