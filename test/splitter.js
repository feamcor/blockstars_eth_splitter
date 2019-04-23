const truffleAssert = require("truffle-assertions");
const { eventEmitted, reverts } = truffleAssert;
const { toBN, toWei } = web3.utils;
const { getBalance } = web3.eth;
const Splitter = artifacts.require("Splitter");

contract("Splitter", async accounts => {
  const BN_0 = toBN("0");
  const BN_1GW = toBN(toWei("1", "gwei"));
  const BN_HGW = toBN(toWei("0.5", "gwei"));
  const ZEROx0 = "0x0000000000000000000000000000000000000000";

  const [ALICE, BOB, CAROL, SOMEONE] = accounts;

  const SPLITTER = await Splitter.deployed();

  describe("Function: constructor", async () => {
    it("should have deployer as pauser", async () => {
      const isPauser = await SPLITTER.isPauser(ALICE, { from: ALICE });
      assert.isTrue(isPauser, "deployer is not pauser");
    });

    it("should have initial balance of zero", async () => {
      const balance = toBN(await getBalance(SPLITTER.address));
      assert(balance.eq(BN_0), "contract balance is not zero");
    });
  });

  describe("Function: fallback", async () => {
    it("should revert on fallback", async () => {
      await reverts(SPLITTER.sendTransaction({ from: ALICE, value: BN_1GW }));
    });
  });

  describe("Function: split", async () => {
    it("should revert when split transfer value is zero", async () => {
      await reverts(
        SPLITTER.split(BOB, CAROL, { from: ALICE, value: BN_0 }),
        "no funds provided"
      );
    });

    it("should revert when any recipient is empty", async () => {
      await reverts(
        SPLITTER.split(BOB, ZEROx0, { from: ALICE, value: BN_1GW }),
        "recipients cannot be empty"
      );
      await reverts(
        SPLITTER.split(ZEROx0, CAROL, { from: ALICE, value: BN_1GW }),
        "recipients cannot be empty"
      );
      await reverts(
        SPLITTER.split(ZEROx0, ZEROx0, { from: ALICE, value: BN_1GW }),
        "recipients cannot be empty"
      );
    });

    it("should revert when recipient is duplicated", async () => {
      await reverts(
        SPLITTER.split(BOB, BOB, { from: ALICE, value: BN_1GW }),
        "recipients must be different"
      );
    });

    it("should revert when sender is a recipient", async () => {
      await reverts(
        SPLITTER.split(BOB, ALICE, { from: ALICE, value: BN_1GW }),
        "sender cannot be recipient"
      );
      await reverts(
        SPLITTER.split(ALICE, CAROL, { from: ALICE, value: BN_1GW }),
        "sender cannot be recipient"
      );
    });

    it("should split transferred funds", async () => {
      const balance0a = toBN(await getBalance(SPLITTER.address));
      const balance1a = await SPLITTER.balances(BOB, { from: ALICE });
      const balance2a = await SPLITTER.balances(CAROL, { from: ALICE });

      const result = await SPLITTER.split(BOB, CAROL, {
        from: ALICE,
        value: BN_1GW
      });
      await eventEmitted(result, "FundsSplitted", log => {
        return (
          log.from === ALICE &&
          log.first === BOB &&
          log.second === CAROL &&
          log.value1st.eq(BN_HGW) &&
          log.value2nd.eq(BN_HGW)
        );
      });

      const balance0b = toBN(await getBalance(SPLITTER.address));
      const balance1b = await SPLITTER.balances(BOB, { from: ALICE });
      const balance2b = await SPLITTER.balances(CAROL, { from: ALICE });

      assert(balance0b.sub(balance0a).eq(BN_1GW), "contract balance mismatch");
      assert(
        balance1b.sub(balance1a).eq(BN_HGW),
        "1st recipient balance mismatch"
      );
      assert(
        balance2b.sub(balance2a).eq(BN_HGW),
        "2nd recipient balance mismatch"
      );
    });

    it("should split transferred funds and remainder goes to 1st recipient", async () => {
      const value = toBN("333");
      const value1 = toBN("167");
      const value2 = toBN("166");

      const balance0a = toBN(await getBalance(SPLITTER.address));
      const balance1a = await SPLITTER.balances(BOB, { from: ALICE });
      const balance2a = await SPLITTER.balances(CAROL, { from: ALICE });

      const result = await SPLITTER.split(BOB, CAROL, {
        from: ALICE,
        value: value
      });
      await eventEmitted(result, "FundsSplitted", log => {
        return (
          log.from === ALICE &&
          log.first === BOB &&
          log.second === CAROL &&
          log.value1st.eq(value1) &&
          log.value2nd.eq(value2)
        );
      });

      const balance0b = toBN(await getBalance(SPLITTER.address));
      const balance1b = await SPLITTER.balances(BOB, { from: ALICE });
      const balance2b = await SPLITTER.balances(CAROL, { from: ALICE });

      assert(balance0b.sub(balance0a).eq(value), "contract balance mismatch");
      assert(
        balance1b.sub(balance1a).eq(value1),
        "1st recipient balance mismatch"
      );
      assert(
        balance2b.sub(balance2a).eq(value2),
        "2nd recipient balance mismatch"
      );
    });
  });

  describe("Function: withdraw", async () => {
    it("should allow recipients to withdraw", async () => {
      const split1 = await SPLITTER.balances(BOB, { from: ALICE });
      const split2 = await SPLITTER.balances(CAROL, { from: ALICE });

      const balance1a = toBN(await getBalance(BOB));
      const result1b = await SPLITTER.withdraw({ from: BOB });
      await eventEmitted(result1b, "FundsWithdrew", log => {
        return log.by === BOB && log.balance.eq(split1);
      });

      const balance1b = toBN(await getBalance(BOB));
      const gasUsed1b = toBN(result1b.receipt.gasUsed);
      const transact1b = await web3.eth.getTransaction(result1b.tx);
      const gasPrice1b = toBN(transact1b.gasPrice);

      assert(
        balance1b
          .add(gasUsed1b.mul(gasPrice1b))
          .sub(balance1a)
          .eq(split1),
        "contract balance mismatch 1"
      );

      const balance2a = toBN(await getBalance(CAROL));
      const result2b = await SPLITTER.withdraw({ from: CAROL });
      await eventEmitted(result2b, "FundsWithdrew", log => {
        return log.by === CAROL && log.balance.eq(split2);
      });

      const balance2b = toBN(await getBalance(CAROL));
      const gasUsed2b = toBN(result2b.receipt.gasUsed);
      const transact2b = await web3.eth.getTransaction(result2b.tx);
      const gasPrice2b = toBN(transact2b.gasPrice);
      assert(
        balance2b
          .add(gasUsed2b.mul(gasPrice2b))
          .sub(balance2a)
          .eq(split2),
        "contract balance mismatch 2"
      );
    });

    it("should revert when recipient balance is zero", async () => {
      await reverts(SPLITTER.withdraw({ from: BOB }), "balance is zero");
    });

    it("should revert when non-recipient withdraw", async () => {
      await reverts(SPLITTER.withdraw({ from: SOMEONE }), "balance is zero");
    });
  });
});
