const { assert } = require("chai");
const web3 = require("web3");
const WattCarbon = artifacts.require("WattCarbon");

contract("WattCarbon", (accounts) => {
  it("deployer is admin and minter", async function () {
    const instance = await WattCarbon.deployed();

    // check if address is minter
    const isMinter = await instance.hasRole(
      await instance.MINTER_ROLE(),
      accounts[0]
    );

    // check if address is admin
    const isAdmin = await instance.hasRole(
      await instance.DEFAULT_ADMIN_ROLE(),
      accounts[0]
    );

    assert.isTrue(isMinter);
    assert.isTrue(isAdmin);
  });

  it("deployer can mint 10 WC", async function () {
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

  it("add new minter and mint 10 WC", async function () {
    const instance = await WattCarbon.deployed();

    // add new minter
    await instance.addMinter(accounts[2]);

    // new minter mints 10 WC to self
    await instance.mint(accounts[2], web3.utils.toWei("10", "ether"), {
      from: accounts[2],
    });

    // get balance
    const amount = await instance.balanceOf(accounts[2]);

    // balance should be 10 WattCarbon
    assert.equal(web3.utils.fromWei(amount, "ether"), 10);
  });

  it("remove minter", async function () {
    const instance = await WattCarbon.deployed();

    // add account as minter
    await instance.addMinter(accounts[4]);
    let isMinter = await instance.hasRole(
      await instance.MINTER_ROLE(),
      accounts[4]
    );
    assert.isTrue(isMinter);

    // remove account as minter
    await instance.removeMinter(accounts[4]);
    isMinter = await instance.hasRole(
      await instance.MINTER_ROLE(),
      accounts[4]
    );
    assert.isFalse(isMinter);
  });

  it("remove admin", async function () {
    const instance = await WattCarbon.deployed();

    // add account as minter
    await instance.addAdmin(accounts[5]);
    let isAdmin = await instance.hasRole(
      await instance.DEFAULT_ADMIN_ROLE(),
      accounts[5]
    );
    assert.isTrue(isAdmin);

    // remove account as minter
    await instance.removeAdmin(accounts[5]);
    isAdmin = await instance.hasRole(
      await instance.DEFAULT_ADMIN_ROLE(),
      accounts[5]
    );
    assert.isFalse(isAdmin);
  });

  it("able to transfer WattCarbon", async function () {
    const instance = await WattCarbon.deployed();

    // transfer 10 WC to new account
    await instance.transfer(accounts[3], web3.utils.toWei("10", "ether"), {
      from: accounts[2],
    });

    // get balance
    const amount = await instance.balanceOf(accounts[3]);

    // balance should be 10 WattCarbon
    assert.equal(web3.utils.fromWei(amount, "ether"), 10);
  });

  it("burn WattCarbon and check burn amount", async function () {
    const instance = await WattCarbon.deployed();

    // accounts[3] should have 10 WC from previous test
    // burn WattCarbons
    await instance.burnToken(web3.utils.toWei("10", "ether"), {
      from: accounts[3],
    });

    // check new balance
    const amount = await instance.balanceOf(accounts[3]);

    // check burn amount
    const burnAmount = await instance.burnAmounts(accounts[3]);

    assert.equal(web3.utils.fromWei(amount, "ether"), 0);
    assert.equal(web3.utils.fromWei(burnAmount, "ether"), 10);
  });
});
