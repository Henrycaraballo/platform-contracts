import { expect } from "chai";
import { prettyPrintGasCost } from "./helpers/gasUtils";
import { deployAccessControl } from "./helpers/deployContracts";
import {
  basicTokenTests,
  standardTokenTests,
  erc677TokenTests,
  deployTestErc677Callback,
  erc223TokenTests,
  expectTransferEvent,
  ZERO_ADDRESS,
  testWithdrawal,
  deployTestErc223Callback,
} from "./helpers/tokenTestCases";
import { eventValue } from "./helpers/events";
import { etherToWei } from "./helpers/unitConverter";
import forceEther from "./helpers/forceEther";
import roles from "./helpers/roles";
import EvmError from "./helpers/EVMThrow";

const EtherToken = artifacts.require("EtherToken");

contract("EtherToken", ([broker, reclaimer, ...investors]) => {
  let etherToken;
  const RECLAIM_ETHER = "0x0";

  beforeEach(async () => {
    const rbap = await deployAccessControl([{ subject: reclaimer, role: roles.reclaimer }]);
    etherToken = await EtherToken.new(rbap.address);
  });

  describe("specific tests", () => {
    function expectDepositEvent(tx, owner, amount) {
      const event = eventValue(tx, "LogDeposit");
      expect(event).to.exist;
      expect(event.args.to).to.eq(owner);
      expect(event.args.amount).to.be.bignumber.eq(amount);
    }

    it("should deploy", async () => {
      await prettyPrintGasCost("EtherToken deploy", etherToken);
    });

    it("should deposit", async () => {
      const initialBalance = etherToWei(1.19827398791827);
      const tx = await etherToken.deposit({
        from: investors[0],
        value: initialBalance,
      });
      expectDepositEvent(tx, investors[0], initialBalance);
      expectTransferEvent(tx, ZERO_ADDRESS, investors[0], initialBalance);
      const totalSupply = await etherToken.totalSupply.call();
      expect(totalSupply).to.be.bignumber.eq(initialBalance);
      const balance = await etherToken.balanceOf(investors[0]);
      expect(balance).to.be.bignumber.eq(initialBalance);
    });

    it("should reject to reclaim ether", async () => {
      const amount = web3.toWei(1, "ether");
      await forceEther(etherToken.address, amount, reclaimer);
      await expect(etherToken.reclaim(RECLAIM_ETHER, { from: reclaimer })).to.be.rejectedWith(
        EvmError,
      );
    });

    it("should deposit and transfer");
    it("should deposit 0 wei and transfer");
    it("should deposit and transfer if initial balance 0");
    it("should deposit and transfer to itself");
    it("should reject to deposit and transfer more than balance");

    it("should withdraw and send");
    it("should withdraw and send with 0 wei payable");
    it("should withdraw and send with 0 initial balance");
    it("should reject withdraw and send over balance");
    it("should reject when withdraw amount less than payable");
  });

  describe("IBasicToken tests", () => {
    const initialBalance = etherToWei(1.19827398791827);
    const getToken = () => etherToken;

    beforeEach(async () => {
      await etherToken.deposit({
        from: investors[1],
        value: initialBalance,
      });
    });

    basicTokenTests(getToken, investors[1], investors[2], initialBalance);
  });

  describe("IERC20Allowance tests", () => {
    const initialBalance = etherToWei(1.0192);
    const getToken = () => etherToken;

    beforeEach(async () => {
      await etherToken.deposit({
        from: investors[1],
        value: initialBalance,
      });
    });

    standardTokenTests(getToken, investors[1], investors[2], broker, initialBalance);
  });

  describe("IERC677Token tests", () => {
    const initialBalance = etherToWei(8.91192);
    const getToken = () => etherToken;
    let erc667cb;
    const getTestErc667cb = () => erc667cb;

    beforeEach(async () => {
      await etherToken.deposit({
        from: investors[1],
        value: initialBalance,
      });
      erc667cb = await deployTestErc677Callback();
    });

    erc677TokenTests(getToken, getTestErc667cb, investors[1], initialBalance);
  });

  describe("IERC223Token tests", () => {
    const initialBalance = etherToWei(3.98172);
    const getToken = () => etherToken;
    let erc223cb;
    const getTestErc223cb = () => erc223cb;

    beforeEach(async () => {
      erc223cb = await deployTestErc223Callback(true);
      await etherToken.deposit({
        from: investors[1],
        value: initialBalance,
      });
    });

    erc223TokenTests(getToken, getTestErc223cb, investors[1], investors[2], initialBalance);
  });

  describe("withdrawal tests", () => {
    const initialBalance = etherToWei(7.189192);
    const getToken = () => etherToken;

    beforeEach(async () => {
      await etherToken.deposit({
        from: investors[1],
        value: initialBalance,
      });
    });

    testWithdrawal(getToken, investors[1], initialBalance);
  });
});
