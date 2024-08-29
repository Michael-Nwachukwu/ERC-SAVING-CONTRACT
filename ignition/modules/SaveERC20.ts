import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SaveERC20Module = buildModule("SaveERC20Module", (m) => {
  
  const tokenAddress = "0x9f3eB17a20a4E57Ed126F34061b0E40dF3a4f5C2";

  const SaveERC20 = m.contract("SaveERC20", [tokenAddress]);

  return { SaveERC20 };
  
});

export default SaveERC20Module;