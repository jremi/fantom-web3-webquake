const hre = require('hardhat');
const contractArgs = require('./arguments');

async function main() {
  const BettingContract = await hre.ethers.getContractFactory('BettingContract');
  const bettingContract = await BettingContract.deploy(...contractArgs)
  
  await bettingContract.deployed();
  console.log('BettingContract deployed to:', bettingContract.address);
  
  await bettingContract.deployTransaction.wait(5);

  await hre.run(`verify:verify`, {
    address: bettingContract.address,
    constructorArguments: contractArgs
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
