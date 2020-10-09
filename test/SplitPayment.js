const SplitPayment = artifacts.require("SplitPayment");

contract("SplitPayment", (accounts) => {
  let splitPayment = null;
  before(async () => {
    splitPayment = await SplitPayment.deployed();
  });

  it("should split payment", async () => {
    const recipients = [accounts[1], accounts[2], accounts[3]];
    const amounts = [40, 20, 30];
    const initialBalances = await Promise.all(
      recipients.map((recipient) => {
        return web3.eth.getBalance(recipient);
      })
    );
    await splitPayment.send(recipients, amounts, {
      from: accounts[0],
      value: 90,
    });

    const finalBalances = await Promise.all(
      recipients.map((recipient) => {
        return web3.eth.getBalance(recipient);
      })
    );
    recipients.forEach((_item, i) => {
      const finalBalance = web3.utils.toBN(finalBalances[i]);
      const initialBalance = web3.utils.toBN(initialBalances[i]);
      assert(finalBalance.sub(initialBalance).toNumber() == amounts[i]);
    });
  });
  it("should NOT split payment if array mismatch", async () => {
    const recipients = [accounts[1], accounts[2], accounts[3]];
    const amounts = [40, 30];
    try {
      const initialBalances = await Promise.all(
        recipients.map((recipient) => {
          return web3.eth.getBalance(recipient);
        })
      );
      await splitPayment.send(recipients, accounts, {
        from: accounts[0],
        value: 90,
      });
      const finalBalances = await Promise.all(
        recipients.map((recipient) => {
          return web3.eth.getBalance(recipient);
        })
      );
      recipients.forEach((_item, i) => {
        const finalBalance = web3.utils.toBN(finalBalances[i]);
        const initialBalance = web3.utils.toBN(initialBalances[i]);
        assert(finalBalance.sub(initialBalance).toNumber() == amounts[i]);
      });
    } catch (e) {
      assert(e.message.includes("to must be same length as amount"));
      return;
    }
    assert(false);
  });

  it("should NOT split payment is caller is not owner", async () => {
    const recipients = [accounts[1], accounts[2], accounts[3]];
    try {
      await splitPayment.send(recipients, accounts, {
        from: accounts[5],
        value: 90,
      });
    } catch (e) {
      assert(
        e.message.includes("user not authorized to perform this transaction")
      );
      return;
    }
    assert(false);
  });
});
