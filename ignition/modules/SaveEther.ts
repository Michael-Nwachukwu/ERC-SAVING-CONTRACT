import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SaveEtherModule = buildModule("SaveEtherModule", (m) => {
  
  const owner = "0xD559b7f7440f96184592F38b7955bb2d3EbfA5Ce";

  const saveEther = m.contract("SaveEther", [owner]);

  return { saveEther };
  
});

export default SaveEtherModule;
