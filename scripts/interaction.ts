import { ethers } from "hardhat";

async function main() {
    const web3CXITokenAddress = "0x9f3eB17a20a4E57Ed126F34061b0E40dF3a4f5C2";
    const web3CXI = await ethers.getContractAt("IERC20", web3CXITokenAddress);

    const saveERC20ContractAddress = "0x76b27dFb0408Baa19b3F41469b123c5bBfd56047";
    const saveERC20 = await ethers.getContractAt("ISaveERC20", saveERC20ContractAddress);

    // Approve savings contract to spend token
    const approvalAmount = ethers.parseUnits("1000", 18);

    const approveTx = await web3CXI.approve(saveERC20, approvalAmount);
    approveTx.wait();

    const contractBalanceBeforeDeposit = await saveERC20.getContractBalance();
    console.log("Contract balance before :::", contractBalanceBeforeDeposit);

    const depositAmount = ethers.parseUnits("150", 18);
    const depositTx = await saveERC20.deposit(depositAmount);

    console.log(depositTx);

    depositTx.wait();

    const contractBalanceAfterDeposit = await saveERC20.getContractBalance();

    console.log("Contract balance after :::", contractBalanceAfterDeposit);


    // Withdrawal Interaction
    const withdrawalAmount = ethers.parseUnits("50", 18);
    const withdrawTx = await saveERC20.withdraw(withdrawalAmount);
    
    console.log(withdrawTx);
    
    withdrawTx.wait();

    const contractBalanceAfterWithdrawal = await saveERC20.getContractBalance();
    console.log("Contract balance after withdrawal :::", contractBalanceAfterDeposit);
    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
