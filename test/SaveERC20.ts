import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { expect } from "chai";
  import hre, { ethers } from "hardhat";
  
describe("SavingERC20TokenContract", function () {
  
  // Function to deploy the ERC20 token that will be used for deposits and withdrawals
  async function deployERC20Token() {

    // Contracts are deployed using the first signer/account by default

    // This line grabs the contract that we wish to deploy with the getContractFactory() function
    const deployToken = await hre.ethers.getContractFactory("Web3CXI");
    // This line actually deploys the token with the deploy() function
    const token = await deployToken.deploy();

    // Returns the deployed token
    return { token };

  }

  // This function deploys the saveERC20Token contract to the virtual network
  async function deploySaveERC20() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    // We are using loadFixture to grab a snapshot of the deployERC20Token() function returning the token 
    const { token } = await loadFixture(deployERC20Token);

    // We grab the contract that we wish to deploy with the getContractFactory() function
    const saveToken = await hre.ethers.getContractFactory("SaveERC20");
    // We are deploying the contract with the deploy() function with the token as a parameter because our contract requires a token contract in the constructor
    const saveERC20 = await saveToken.deploy(token);

    // here we are returning the deployed token, the saveERC20 contract, owner and otherAccount variables
    return { token, saveERC20, owner, otherAccount };
  }

  describe("Deployment", function () {

    // we want to make sure that it is the owner that depolyed the contract
    it("It should check if owner is correct", async function () {

      // destructuring the variables we are returning from our deploySaveERC20 function with the loadFixture
      const { saveERC20, owner } = await loadFixture(deploySaveERC20);

      // running the actual check for the owner() available from our contract as a publuc variable to be equal to the owner of the deploySaveERC20 deployment 
      expect(await saveERC20.owner()).to.equal(owner);
    });

    // We want to check that the deployed token address is equal to the parameter tokenaddress we are passing to our saveERC20 contract
    it("It should check if contract address is correct", async function () {

      // destructuring the variables we are returning from our deploySaveERC20 function with the loadFixture
      const { saveERC20, token } = await loadFixture(deploySaveERC20);

      // running the check
      expect(await saveERC20.tokenAddress()).to.equal(token);

    });

  });

  // /Simulating the deposit function
  // First we want to transfer the deployed tokens from the owner to another account to run the deposit, because the owner shouldnt be calling the deposit function.
  describe("Deposit", function () {

    it("It should deposit successfuly", async function () {

      // destructuring the variables we are returning from our deploySaveERC20 function with the loadFixture
      const { saveERC20, owner, otherAccount, token} = await loadFixture(deploySaveERC20);

      // declare transfer amount
      const transferAmount = ethers.parseUnits("100", 18);
      // simulating the actuial transfer. passing otherAccount which is made available to us by ether.getSigners() and the actual amount we want to deposit. These parameters are required by ERC20 token standard function
      await token.transfer(otherAccount, transferAmount);

      // running check to ensure that the balance of the otherAccount which was 0 b4 the transfer will be equal to the transferAmount 
      expect(await token.balanceOf(otherAccount)).to.equal(transferAmount);

      // NOW TO DEPOSIT WE NEED TO APPROVE THE CONTRACT TO MOVE THE MONEY ON THEACCOUNT'S BEHALF 

      // running the approve function with the connect method and passing the receiving contract and the amount to be deposited
      await token.connect(otherAccount).approve(saveERC20, transferAmount)

      // Here we are current balance of the depositor before the deposit function is called
      const otherAccountBalanceBefore = await token.balanceOf(otherAccount);
      
      // Declaring depositAmount in ^18 units with the parseUnits method. passing the value and how many decimal points
      const depositAmount = ethers.parseUnits("10", 18);
      // using connect to call the deposit function as the otherAccount because the owner of the contract is not allowed to call the deposit Function
      await saveERC20.connect(otherAccount).deposit(depositAmount);

      expect(await token.balanceOf(otherAccount)).to.equal(otherAccountBalanceBefore - depositAmount);

      expect(await saveERC20.connect(otherAccount).myBalance()).to.equal(depositAmount);

      expect(await saveERC20.getContractBalance()).to.equal(depositAmount);

    });

    it("Should emit an event after successful deposit", async function () {
      const { saveERC20, otherAccount, token } = await loadFixture(deploySaveERC20);

      const trfAmount = ethers.parseUnits("100", 18);
      await token.transfer(otherAccount, trfAmount);

      await token.connect(otherAccount).approve(saveERC20, trfAmount);

      const depositAmount = ethers.parseUnits("10", 18);

      await expect(saveERC20.connect(otherAccount).deposit(depositAmount))
        .to.emit(saveERC20, "DepositSuccessful")
        .withArgs(otherAccount.address, depositAmount);
    });

    it("Should revert on zero deposit", async function () {
      const { saveERC20, otherAccount, token } = await loadFixture(deploySaveERC20);

      const depositAmount = ethers.parseUnits("0", 18);

      await expect(
        saveERC20.connect(otherAccount).deposit(depositAmount)
      ).to.be.revertedWithCustomError(saveERC20, "ZeroValueNotAllowed");
    });

  });



  describe("Withdraw", function () {
    it("Should withdraw successfully", async function () {
      const { saveERC20, owner, otherAccount, token } = await loadFixture(deploySaveERC20);

      // Transfer ERC20 token from owner to otherAccount
      const trfAmount = ethers.parseUnits("100", 18);
      await token.transfer(otherAccount, trfAmount);
      expect(await token.balanceOf(otherAccount)).to.equal(trfAmount);

      // otherAccount approves contract address to spend some tokens
      await token.connect(otherAccount).approve(saveERC20, trfAmount);

      const otherAccountBalBefore = await token.balanceOf(otherAccount);

      // otherAccount deposits into SaveERC20 contract
      const depositAmount = ethers.parseUnits("10", 18);

      await saveERC20.connect(otherAccount).deposit(depositAmount);

      expect(await token.balanceOf(otherAccount)).to.equal(otherAccountBalBefore - depositAmount);

      expect(await saveERC20.connect(otherAccount).myBalance()).to.equal(depositAmount);
      expect(await saveERC20.getContractBalance()).to.equal(depositAmount);

      // otherAccount withdraw from contract
      const initBalBeforeWithdrawal = await token.balanceOf(otherAccount);
      const withdrawAmount = ethers.parseUnits("5", 18);

      await saveERC20.connect(otherAccount).withdraw(withdrawAmount);

      const balAfterWithdrawal = await token.balanceOf(otherAccount);

      expect(await saveERC20.getContractBalance()).to.equal(depositAmount - withdrawAmount);

      expect(await saveERC20.connect(otherAccount).myBalance()).to.equal(depositAmount - withdrawAmount);
      
      expect(await token.balanceOf(otherAccount)).to.equal(initBalBeforeWithdrawal + withdrawAmount);
    });
  });

});
