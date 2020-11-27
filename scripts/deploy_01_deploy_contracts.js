const bre = require('@nomiclabs/buidler')
const { ethers, upgrades } = bre
const { getSavedContractAddresses, saveContractAddress } = require('./utils')

async function main() {
    await bre.run('compile')

    const BaseToken = await ethers.getContractFactory('BaseToken')
    const baseToken = await upgrades.deployProxy(BaseToken, [])
    await baseToken.deployed()
    console.log('BaseToken deployed to:', baseToken.address)
    saveContractAddress(bre.network.name, 'baseToken', baseToken.address)

    const BaseTokenMonetaryPolicy = await ethers.getContractFactory('BaseTokenMonetaryPolicy')
    const baseTokenMonetaryPolicy = await upgrades.deployProxy(BaseTokenMonetaryPolicy, [baseToken.address, '483703019126'])
    await baseTokenMonetaryPolicy.deployed()
    console.log('BaseTokenMonetaryPolicy deployed to:', baseTokenMonetaryPolicy.address)
    saveContractAddress(bre.network.name, 'baseTokenMonetaryPolicy', baseTokenMonetaryPolicy.address)

    const BaseTokenOrchestrator = await ethers.getContractFactory('BaseTokenOrchestrator')
    const baseTokenOrchestrator = await upgrades.deployProxy(BaseTokenOrchestrator, [baseTokenMonetaryPolicy.address])
    await baseTokenOrchestrator.deployed()
    console.log('BaseTokenOrchestrator deployed to:', baseTokenOrchestrator.address)
    saveContractAddress(bre.network.name, 'baseTokenOrchestrator', baseTokenOrchestrator.address)

    const Cascade = await ethers.getContractFactory('Cascade')
    const cascade = await upgrades.deployProxy(Cascade, [])
    await cascade.deployed()
    console.log('Cascade deployed to:', cascade.address)
    saveContractAddress(bre.network.name, 'cascade', cascade.address)

    await (await baseToken.setMonetaryPolicy(baseTokenMonetaryPolicy.address)).wait()
    console.log('BaseToken.setMonetaryPolicy(', baseTokenMonetaryPolicy.address, ') succeeded')
    await (await baseTokenMonetaryPolicy.setOrchestrator(baseTokenOrchestrator.address)).wait()
    console.log('BaseTokenMonetaryPolicy.setOrchestrator(', baseTokenOrchestrator.address, ') succeeded')

    // const externalContracts = {
    //     mainnet: {
    //         mcapOracle:  '0xEC8761a0A73c34329CA5B1D3Dc7eD07F30e836e2',
    //         priceOracle: '',
    //         lpToken:     '',
    //     },
    //     kovan: {
    //         mcapOracle:  '0xcD1AA31a9fDD89D21c0104DB6f6A46C8FE271D3b',
    //         priceOracle: '0x3C71Acc6F1ed1cF67b6a77345F8ee0467E94cD40',
    //         lpToken:     '0x141819E5aB1FA056fe5da5dE735Ba1E82D1A7d53',
    //     },
    // }

    const contracts = getSavedContractAddresses()[bre.network.name]

    await (await baseTokenMonetaryPolicy.setMcapOracle(contracts.mcapOracle)).wait()
    console.log('BaseTokenMonetaryPolicy.setMcapOracle(', contracts.mcapOracle, ') succeeded')
    await (await baseTokenMonetaryPolicy.setTokenPriceOracle(contracts.tokenPriceOracle)).wait()
    console.log('BaseTokenMonetaryPolicy.setTokenPriceOracle(', contracts.tokenPriceOracle, ') succeeded')
    await (await cascade.setLPToken(contracts.lpToken)).wait()
    console.log('Cascade.setLPToken(', contracts.lpToken, ') succeeded')
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
