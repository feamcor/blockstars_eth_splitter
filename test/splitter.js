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

  describe("Function: constructor", async () => {
    it("should set recipients", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
      const result = await createTransactionResult(
        splitter,
        splitter.transactionHash
      );
      await eventEmitted(result, "RecipientsSet", log => {
        return (
          log.by === ALICE && log.recipient1 === BOB && log.recipient2 === CAROL
        );
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
  });

  describe("Function: fallback", async () => {
    it("should revert on fallback", async () => {
      const splitter = await Splitter.deployed();
      await reverts(splitter.sendTransaction({ from: ALICE, value: BN_1GW }));
    });
  });

  describe("Function: split", async () => {
    it("should revert when non-owner perform a split", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
      await reverts(splitter.split({ from: SOMEONE, value: BN_1GW }));
    });

    it("should split transferred funds", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
      const result = await splitter.split({ from: ALICE, value: BN_1GW });
      await eventEmitted(result, "FundsSplitted", log => {
        return (
          log.by === ALICE &&
          log.deposit.eq(BN_1GW) &&
          log.amount1.eq(BN_HGW) &&
          log.amount2.eq(BN_HGW)
        );
      });
      let balance = toBN(await getBalance(splitter.address));
      assert(balance.eq(BN_1GW), "contract balance mismatch");
      balance = await splitter.balance1();
      assert(balance.eq(BN_HGW), "member 0 balance mismatch");
      balance = await splitter.balance2();
      assert(balance.eq(BN_HGW), "member 1 balance mismatch");
    });

    it("should split transferred funds and give remainder to 1st recipient", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
      const value = toBN("333");
      const amount1 = toBN("167");
      const amount2 = toBN("166");
      const result = await splitter.split({ from: ALICE, value: value });
      await eventEmitted(result, "FundsSplitted", log => {
        return (
          log.by === ALICE &&
          log.deposit.eq(value) &&
          log.amount1.eq(amount1) &&
          log.amount2.eq(amount2)
        );
      });
      let balance = toBN(await getBalance(splitter.address));
      assert(balance.eq(value), "contract balance mismatch");
      balance = await splitter.balance1();
      assert(balance.eq(amount1), "member 0 balance mismatch");
      balance = await splitter.balance2();
      assert(balance.eq(amount2), "member 1 balance mismatch");
    });

    it("should revert when split transfer value is zero", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
      await reverts(
        splitter.split({ from: ALICE, value: BN_0 }),
        "no funds provided"
      );
    });

    it("should increase contract balance upon split", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
      let bal0 = toBN(await getBalance(splitter.address));
      await splitter.split({ from: ALICE, value: BN_1GW });
      let bal1 = toBN(await getBalance(splitter.address));
      assert(bal1.sub(bal0).eq(BN_1GW), "contract balance mismatch 1");
      const amount = toBN("123456789");
      await splitter.split({ from: ALICE, value: amount });
      let bal2 = toBN(await getBalance(splitter.address));
      assert(bal2.sub(bal1).eq(amount), "contract balance mismatch 2");
    });
  });

  describe("Function: withdraw", async () => {
    it("should allow recipients to withdraw", async () => {
      const splitter = await Splitter.new(BOB, CAROL, { from: ALICE });
      await splitter.split({ from: ALICE, value: BN_1GW });

      const balance1a = toBN(await getBalance(BOB));
      const balance2a = toBN(await getBalance(CAROL));

      const result1 = await splitter.withdraw({ from: BOB });
      await eventEmitted(result1, "FundsWithdrew", log => {
        return log.by === BOB && log.amount.eq(BN_HGW);
      });

      const balance1b = toBN(await getBalance(BOB));
      const gasUsed1 = toBN(result1.receipt.gasUsed);
      const transaction1 = await web3.eth.getTransaction(result1.tx);
      const gasPrice1 = toBN(transaction1.gasPrice);

      assert(
        gasUsed1
          .mul(gasPrice1)
          .add(balance1b)
          .sub(balance1a)
          .eq(BN_HGW),
        "contract balance mismatch 1"
      );

      const result2 = await splitter.withdraw({ from: CAROL });
      await eventEmitted(result2, "FundsWithdrew", log => {
        return log.by === CAROL && log.amount.eq(BN_HGW);
      });

      const balance2b = toBN(await getBalance(CAROL));
      const gasUsed2 = toBN(result2.receipt.gasUsed);
      const transaction2 = await web3.eth.getTransaction(result2.tx);
      const gasPrice2 = toBN(transaction2.gasPrice);

      assert(
        gasUsed2
          .mul(gasPrice2)
          .add(balance2b)
          .sub(balance2a)
          .eq(BN_HGW),
        "contract balance mismatch 2"
      );
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
