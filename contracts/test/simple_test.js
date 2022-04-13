const { assert } = require("chai");
const web3 = require("web3");
const WattCarbon = artifacts.require("WattCarbon");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("WattCarbon", (accounts) => {
  it("deployer is admin and minter", async function () {
    const instance = await WattCarbon.deployed();

    const isMinter = await instance.hasRole(
      await instance.MINTER_ROLE(),
      accounts[0]
    );

    const isAdmin = await instance.hasRole(
      await instance.DEFAULT_ADMIN_ROLE(),
      accounts[0]
    );

    assert.isTrue(isMinter);
    assert.isTrue(isAdmin);
  });

  it("admin can mint 10 WC", async function () {
    const instance = await WattCarbon.deployed();

    // mint 100 tokens to different address
    await instance.mint(accounts[1], web3.utils.toWei("10", "ether"), {
      from: accounts[0],
    });

    // get balance
    const amount = await instance.balanceOf(accounts[1]);

    // balance should be 10 WattCarbon
    assert.equal(web3.utils.fromWei(amount, "ether"), 10);
  });
});
