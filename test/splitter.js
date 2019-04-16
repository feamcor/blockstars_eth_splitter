const truffleAssert = require("truffle-assertions");
const { createTransactionResult, eventEmitted, reverts } = truffleAssert;
const { toBN, toWei } = web3.utils;
const { getBalance } = web3.eth;
const Splitter = artifacts.require("Splitter");

contract("Splitter", async accounts => {
  const BN_0 = toBN("0");
  const BN_1GW = toBN(toWei("1", "gwei"));
  const BN_HGW = toBN(toWei("0.5", "gwei"));

  const [ALICE, BOB, CAROL, SOMEONE] = accounts;

  let splitter = null;

  describe("check general test cases", async () => {
    it("should set recipients", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
      const result = await createTransactionResult(
        splitter,
        splitter.transactionHash
      );
      await eventEmitted(result, "RecipientSet", log => {
        return log.by === ALICE && log.recipient === BOB;
      });
      await eventEmitted(result, "RecipientSet", log => {
        return log.by === ALICE && log.recipient === CAROL;
      });
      let balance = await getBalance(splitter.address);
      balance = toBN(balance);
      assert(balance.eq(BN_0), "contract balance is not zero");
    });

    it("should revert when recipient is empty", async () => {
      await reverts(
        Splitter.new(BOB, "0x0000000000000000000000000000000000000000", {
          from: ALICE
        }),
        "recipients cannot be empty"
      );
    });

    it("should revert when recipient is duplicated", async () => {
      await reverts(
        Splitter.new(BOB, BOB, { from: ALICE }),
        "recipients must be different"
      );
    });

    it("should revert when owner is a recipient", async () => {
      await reverts(
        Splitter.new(BOB, ALICE, { from: ALICE }),
        "owner cannot be recipient"
      );
    });

    it("should revert when recipient is a contract", async () => {
      const address = (await Splitter.deployed()).address;
      await reverts(
        Splitter.new(address, CAROL, { from: ALICE }),
        "recipient cannot be a contract"
      );
    });

    it("should revert when non-owner perform a deposit", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
      await reverts(splitter.deposit({ from: SOMEONE, value: BN_1GW }));
    });

    it("should deposit and split funds", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
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
      balance = await splitter.balance1();
      assert(balance.eq(BN_HGW), "member 0 balance mismatch");
      balance = await splitter.balance2();
      assert(balance.eq(BN_HGW), "member 1 balance mismatch");
    });

    it("should deposit, split funds and give remainder to 1st recipient", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
      const value = toBN("333");
      const amount1 = toBN("167");
      const amount2 = toBN("166");
      const result = await splitter.deposit({ from: ALICE, value: value });
      await eventEmitted(result, "FundsDeposited", log => {
        return log.by === ALICE && log.amount.eq(value);
      });
      await eventEmitted(result, "FundsSplitted", log => {
        return log.by === ALICE && log.to === BOB && log.amount.eq(amount1);
      });
      await eventEmitted(result, "FundsSplitted", log => {
        return log.by === ALICE && log.to === CAROL && log.amount.eq(amount2);
      });
      let balance = await getBalance(splitter.address);
      balance = toBN(balance);
      assert(balance.eq(value), "contract balance mismatch");
      balance = await splitter.balance1();
      assert(balance.eq(amount1), "member 0 balance mismatch");
      balance = await splitter.balance2();
      assert(balance.eq(amount2), "member 1 balance mismatch");
    });

    it("should revert when deposit value is zero", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
      await reverts(
        splitter.deposit({ from: ALICE, value: BN_0 }),
        "no funds provided"
      );
    });

    it("should increase contract balance upon deposit", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
      let bal0 = toBN(await getBalance(splitter.address));
      await splitter.deposit({ from: ALICE, value: BN_1GW });
      let bal1 = toBN(await getBalance(splitter.address));
      assert(bal1.sub(bal0).eq(BN_1GW), "contract balance mismatch 1");
      const amount = toBN("123456789");
      await splitter.deposit({ from: ALICE, value: amount });
      let bal2 = toBN(await getBalance(splitter.address));
      assert(bal2.sub(bal1).eq(amount), "contract balance mismatch 2");
    });

    it("should allow recipients to withdraw", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
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

    it("should revert when recipient balance is zero", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
      await reverts(splitter.withdraw({ from: BOB }), "balance is zero");
    });

    it("should revert when non-recipient withdraw", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
      await reverts(splitter.withdraw({ from: SOMEONE }), "not a recipient");
    });
  });
});
