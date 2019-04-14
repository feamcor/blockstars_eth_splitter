const truffleAssert = require("truffle-assertions");
const { createTransactionResult, eventEmitted, reverts } = truffleAssert;
const { toBN, toWei } = web3.utils;
const { getBalance } = web3.eth;
const Splitter = artifacts.require("Splitter");

contract("Splitter", async accounts => {
  const BN_0 = toBN("0");
  const BN_1 = toBN("1");
  const BN_2 = toBN("2");
  const BN_3 = toBN("3");
  const BN_1GW = toBN(toWei("1", "gwei"));

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
      const amount = toBN(toWei("0.5", "gwei"));
      const result = await splitter.deposit({ from: ALICE, value: BN_1GW });
      await eventEmitted(result, "FundsDeposited", log => {
        return log.by === ALICE && log.amount.eq(BN_1GW);
      });
      await eventEmitted(result, "FundsSplitted", log => {
        return log.by === ALICE && log.to === BOB && log.amount.eq(amount);
      });
      await eventEmitted(result, "FundsSplitted", log => {
        return log.by === ALICE && log.to === CAROL && log.amount.eq(amount);
      });
      let balance = await getBalance(splitter.address);
      balance = toBN(balance);
      assert(balance.eq(BN_1GW), "contract balance mismatch");
      balance = await splitter.getMemberBalance(BOB);
      assert(balance.eq(amount), "member 0 balance mismatch");
      balance = await splitter.getMemberBalance(CAROL);
      assert(balance.eq(amount), "member 1 balance mismatch");
    });

    it("owner should deposit and contract keeps remainder", async () => {
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

    it("deposits should increase contract balance", async () => {
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

    it("members should withdraw funds", async () => {
      await splitter.enroll(BOB, { from: ALICE });
      await splitter.enroll(CAROL, { from: ALICE });
      await splitter.deposit({ from: ALICE, value: BN_1GW });
      const amount = toBN(toWei("0.5", "gwei"));
      const res0 = await splitter.withdraw({ from: BOB });
      await eventEmitted(res0, "FundsWithdrew", log => {
        return log.by === BOB && log.amount.eq(amount);
      });
      const res1 = await splitter.withdraw({ from: CAROL });
      await eventEmitted(res1, "FundsWithdrew", log => {
        return log.by === CAROL && log.amount.eq(amount);
      });
    });
  });
});
