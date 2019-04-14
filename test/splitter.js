const truffleAssert = require("truffle-assertions");
const { createTransactionResult, eventEmitted, reverts } = truffleAssert;
const { toBN, toWei } = web3.utils;
const { getBalance } = web3.eth;
const Splitter = artifacts.require("Splitter");

contract("Splitter", async accounts => {
  const BN_0 = toBN("0");
  const BN_1 = toBN("1");
  const BN_2 = toBN("2");
  const BN_1GW = toBN(toWei("1", "gwei"));
  const BN_HGW = toBN(toWei("0.5", "gwei"));

  const [ALICE, BOB, CAROL, SOMEONE] = accounts;

  let splitter = null;

  describe("check revert on constructor", async () => {
    it("should not allow quantity zero", async () => {
      await reverts(
        Splitter.new(BN_0, { from: ALICE }),
        "quantity cannot be zero"
      );
    });

    it("should not allow quantity too large", async () => {
      await reverts(
        Splitter.new(toBN("11"), { from: ALICE }),
        "quantity too large"
      );
    });
  });

  describe("check general test cases", async () => {
    beforeEach("deploy new instance of contract", async () => {
      splitter = await Splitter.new(BN_2, { from: ALICE });
    });

    it("should initialize contract", async () => {
      const result = await createTransactionResult(
        splitter,
        splitter.transactionHash
      );
      await eventEmitted(result, "Initialized", log => {
        return log.by === ALICE && log.quantity.eq(BN_2);
      });
      let balance = await getBalance(splitter.address);
      balance = toBN(balance);
      assert(balance.eq(BN_0), "contract balance is not zero");
    });

    it("owner should enroll 1st member", async () => {
      const result = await splitter.enroll(BOB, { from: ALICE });
      await eventEmitted(result, "MemberEnrolled", log => {
        return log.by === ALICE && log.member === BOB;
      });
      const length = await splitter.getMembersLength();
      const details = await splitter.getMemberDetailsByIndex(BN_0);
      assert(length.eq(BN_1), "members length not 1");
      assert.strictEqual(details.member, BOB, "1st member mismatch");
      assert(details.balance.eq(BN_0), "1st member balance not zero");
    });

    it("owner should enroll 2nd member", async () => {
      await splitter.enroll(BOB, { from: ALICE });
      const result = await splitter.enroll(CAROL, { from: ALICE });
      await eventEmitted(result, "MemberEnrolled", log => {
        return log.by === ALICE && log.member === CAROL;
      });
      const length = await splitter.getMembersLength();
      const details = await splitter.getMemberDetailsByIndex(BN_1);
      assert(length.eq(BN_2), "members length not 2");
      assert.strictEqual(details.member, CAROL, "2nd member mismatch");
      assert(details.balance.eq(BN_0), "2nd member balance not zero");
    });

    it("owner should not be allowed to enroll 3rd member", async () => {
      await splitter.enroll(BOB, { from: ALICE });
      await splitter.enroll(CAROL, { from: ALICE });
      await reverts(
        splitter.enroll(SOMEONE, { from: ALICE }),
        "all members enrolled"
      );
    });

    it("owner should not be allowed to enroll existing member", async () => {
      await splitter.enroll(BOB, { from: ALICE });
      await reverts(
        splitter.enroll(BOB, { from: ALICE }),
        "member already enrolled"
      );
    });

    it("non-owner should not be allowed to enroll member", async () => {
      await reverts(splitter.enroll(BOB, { from: SOMEONE }), "not owner");
    });

    it("non-owner should not be allowed to deposit", async () => {
      await reverts(
        splitter.deposit({ from: SOMEONE, value: BN_1GW }),
        "not owner"
      );
    });

    it("owner should not be allowed to deposit while enrollment is not completed", async () => {
      await splitter.enroll(BOB, { from: ALICE });
      await reverts(
        splitter.deposit({ from: ALICE, value: BN_1GW }),
        "not all members enrolled"
      );
    });

    it("owner should deposit and split funds", async () => {
      await splitter.enroll(BOB, { from: ALICE });
      await splitter.enroll(CAROL, { from: ALICE });
      const result = await splitter.deposit({ from: ALICE, value: BN_1GW });
      await eventEmitted(result, "FundsDeposited", log => {
        return log.by === ALICE && log.amount.eq(BN_1GW);
      });
      await eventEmitted(result, "FundsSplitted", log => {
        return log.by === ALICE && log.to === BOB && log.amount.eq(BN_HGW);
      });
      await eventEmitted(result, "FundsSplitted", log => {
        return log.by === ALICE && log.to === CAROL && log.amount.eq(BN_HGW);
      });
      let balance = await getBalance(splitter.address);
      balance = toBN(balance);
      assert(balance.eq(BN_1GW), "contract balance mismatch");
      balance = await splitter.getMemberBalance(BOB);
      assert(balance.eq(BN_HGW), "member 0 balance mismatch");
      balance = await splitter.getMemberBalance(CAROL);
      assert(balance.eq(BN_HGW), "member 1 balance mismatch");
    });

    it("should keep split remainder", async () => {
      await splitter.enroll(BOB, { from: ALICE });
      await splitter.enroll(CAROL, { from: ALICE });
      const value = toBN("333");
      const amount = toBN("166");
      const result = await splitter.deposit({ from: ALICE, value: value });
      await eventEmitted(result, "FundsDeposited", log => {
        return log.by === ALICE && log.amount.eq(value);
      });
      await eventEmitted(result, "FundsSplitted", log => {
        return log.by === ALICE && log.to === BOB && log.amount.eq(amount);
      });
      await eventEmitted(result, "FundsSplitted", log => {
        return log.by === ALICE && log.to === CAROL && log.amount.eq(amount);
      });
      let balance = await getBalance(splitter.address);
      balance = toBN(balance);
      assert(balance.eq(value), "contract balance mismatch");
      balance = await splitter.getMemberBalance(BOB);
      assert(balance.eq(amount), "member 0 balance mismatch");
      balance = await splitter.getMemberBalance(CAROL);
      assert(balance.eq(amount), "member 1 balance mismatch");
    });

    it("should not allow deposit of no funds", async () => {
      await reverts(
        splitter.deposit({ from: ALICE, value: BN_0 }),
        "no funds provided"
      );
    });

    it("should increase contract balance", async () => {
      await splitter.enroll(BOB, { from: ALICE });
      await splitter.enroll(CAROL, { from: ALICE });
      let bal0 = await getBalance(splitter.address);
      bal0 = toBN(bal0);
      await splitter.deposit({ from: ALICE, value: BN_1GW });
      let bal1 = await getBalance(splitter.address);
      bal1 = toBN(bal1);
      assert(bal1.sub(bal0).eq(BN_1GW), "contract balance mismatch 1");
      const amount = toBN("123456789");
      await splitter.deposit({ from: ALICE, value: amount });
      let bal2 = await getBalance(splitter.address);
      bal2 = toBN(bal2);
      assert(bal2.sub(bal1).eq(amount), "contract balance mismatch 2");
    });

    it("should allow members to withdraw", async () => {
      await splitter.enroll(BOB, { from: ALICE });
      await splitter.enroll(CAROL, { from: ALICE });
      await splitter.deposit({ from: ALICE, value: BN_1GW });
      const res0 = await splitter.withdraw({ from: BOB });
      await eventEmitted(res0, "FundsWithdrew", log => {
        return log.by === BOB && log.amount.eq(BN_HGW);
      });
      const res1 = await splitter.withdraw({ from: CAROL });
      await eventEmitted(res1, "FundsWithdrew", log => {
        return log.by === CAROL && log.amount.eq(BN_HGW);
      });
    });

    it("should not allow member to withdraw when balance is zero", async () => {
      await splitter.enroll(BOB, { from: ALICE });
      await reverts(
        splitter.withdraw({ from: BOB }),
        "no balance or not enrolled"
      );
    });

    it("should not allow non-member to withdraw", async () => {
      await reverts(
        splitter.withdraw({ from: BOB }),
        "no balance or not enrolled"
      );
    });

    it("should get quantity of members defined on constructor", async () => {
      const quantity = await splitter.quantity({ from: ALICE });
      assert(quantity.eq(BN_2), "members quantity mismatch");
    });

    it("should get current members length", async () => {
      let length = await splitter.getMembersLength({ from: ALICE });
      assert(length.eq(BN_0), "members length 0 mismatch");
      await splitter.enroll(BOB, { from: ALICE });
      length = await splitter.getMembersLength({ from: BOB });
      assert(length.eq(BN_1), "members length 1 mismatch");
      await splitter.enroll(CAROL, { from: ALICE });
      length = await splitter.getMembersLength({ from: SOMEONE });
      assert(length.eq(BN_2), "members length 2 mismatch");
    });

    it("should get existing member details", async () => {
      await splitter.enroll(BOB, { from: ALICE });
      let details = await splitter.getMemberDetailsByIndex(BN_0, {
        from: SOMEONE
      });
      assert.strictEqual(details.member, BOB, "member 0 address mismatch");
      assert(details.balance.eq(BN_0), "member 0 balance mismatch");
      await splitter.enroll(CAROL, { from: ALICE });
      await splitter.deposit({ from: ALICE, value: BN_1GW });
      details = await splitter.getMemberDetailsByIndex(BN_1, {
        from: SOMEONE
      });
      assert.strictEqual(details.member, CAROL, "member 1 address mismatch");
      assert(details.balance.eq(BN_HGW), "member 1 balance mismatch");
    });

    it("should get non-existing member details", async () => {
      let details = await splitter.getMemberDetailsByIndex(BN_0, {
        from: SOMEONE
      });
      assert(details.member, "non-member 0 address mismatch");
      assert(details.balance.eq(BN_0), "member 0 balance mismatch");
      details = await splitter.getMemberDetailsByIndex(BN_1, {
        from: SOMEONE
      });
      assert(details.member, "non-member 1 address mismatch");
      assert(details.balance.eq(BN_0), "member 1 balance mismatch");
    });

    it("should get existing member balance", async () => {
      await splitter.enroll(BOB, { from: ALICE });
      let balance = await splitter.getMemberBalance(BOB, { from: SOMEONE });
      assert(balance.eq(BN_0), "member 0 balance mismatch");
      await splitter.enroll(CAROL, { from: ALICE });
      await splitter.deposit({ from: ALICE, value: BN_1GW });
      balance = await splitter.getMemberBalance(CAROL, { from: SOMEONE });
      assert(balance.eq(BN_HGW), "member 1 balance mismatch");
    });

    it("should get non-existing member balance", async () => {
      await splitter.enroll(BOB, { from: ALICE });
      await splitter.enroll(CAROL, { from: ALICE });
      await splitter.deposit({ from: ALICE, value: BN_1GW });
      const balance = await splitter.getMemberBalance(ALICE, { from: BOB });
      assert(balance.eq(BN_0), "non-member balance mismatch");
    });
  });
});
