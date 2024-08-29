import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre, { ethers } from "hardhat";
import { token } from "../typechain-types/@openzeppelin/contracts";
  
describe("Lock", function () {
  
  async function deployERC20Token() {

    // Contracts are deployed using the first signer/account by default
    const [owner] = await hre.ethers.getSigners();

    const deployToken = await hre.ethers.getContractFactory("Web3CXI");
    const token = await deployToken.deploy();

    return { token };

  }

  async function deploySaveERC20() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const { token } = await loadFixture(deployERC20Token);

    const saveToken = await hre.ethers.getContractFactory("SaveERC20");
    const saveERC20 = await saveToken.deploy(token);

    return { token, saveERC20, owner, otherAccount };
  }

  describe("Deployment", function () {

    it("It should check if owner is correct", async function () {
      // const [owner ] = await hre.ethers.getSigners();

      const { saveERC20, owner, otherAccount, token} = await loadFixture(deploySaveERC20);

      expect(await saveERC20.owner()).to.equal(owner);
    });

    it("It should check if contract address is correct", async function () {
      // const [owner ] = await hre.ethers.getSigners();

      const { saveERC20, token} = await loadFixture(deploySaveERC20);

      expect(await saveERC20.tokenAddress()).to.equal(token);
    });

  });


  describe("Deposit", function () {

    it("It should deposit successfuly", async function () {

      const { saveERC20, owner, otherAccount, token} = await loadFixture(deploySaveERC20);

      const transferAmount = ethers.parseUnits("100", 18);
      await token.transfer(otherAccount, transferAmount);

      expect(await token.balanceOf(otherAccount)).to.equal(transferAmount);

      await token.connect(otherAccount).approve(saveERC20, transferAmount)

      const otherAccountBalanceBefore = await token.balanceOf(otherAccount);
      
      const depositAmount = ethers.parseUnits("10", 18);
      await saveERC20.connect(otherAccount).deposit(depositAmount);

      expect(await token.balanceOf(otherAccount)).to.equal(otherAccountBalanceBefore - depositAmount);

      // expect( (await saveERC20.connect(otherAccount).myBalance()).to.equal(depositAmount));

      // expect((await saveERC20.getContractBalance()).to.equal(depositAmount));

    });
  });

});
