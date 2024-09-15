import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const amountADesired = ethers.parseUnits("2000", 6);
    const liquidity = ethers.parseUnits("200", 18);
    const amountBDesired = ethers.parseUnits("200", 18);
    const amountAMin = ethers.parseUnits("10", 6);
    const amountBMin = ethers.parseUnits("100", 18);
    const amountEthMin = ethers.parseEther("0.1");

    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const DAI_Contract = await ethers.getContractAt("IERC20", DAI, impersonatedSigner);
    const amountETHDesired = ethers.parseEther("1");
    
    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

    await USDC_Contract.approve(ROUTER, amountADesired);
    await DAI_Contract.approve(ROUTER, amountBDesired);

    const usdcBal = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBal = await DAI_Contract.balanceOf(impersonatedSigner.address);
    const ethBal = await ethers.provider.getBalance(impersonatedSigner.address);
    const deadline = Math.floor(Date.now() / 1000) + (60 * 10);

    console.log("usdc balance before swap/liquidity tx", Number(usdcBal));
    console.log("dai balance before swap/liquidity tx", Number(daiBal));
    console.log("eth balance before swap/liquidity tx", Number(ethBal));

    // await ROUTER.addLiquidity(
    //     USDC_Contract,
    //     DAI_Contract,
    //     amountADesired,
    //     amountBDesired,
    //     amountAMin,
    //     amountBMin,
    //     impersonatedSigner.address,
    //     deadline
    // );

    // await ROUTER.removeLiquidity(
    //     USDC_Contract,
    //     DAI_Contract,
    //     liquidity,
    //     amountAMin,
    //     amountBMin,
    //     impersonatedSigner.address,
    //     deadline
    // );

    await ROUTER.addLiquidityETH(
        USDC_Contract,
        amountADesired,
        amountAMin,
        amountEthMin,
        impersonatedSigner.address,
        deadline,
        { value: amountETHDesired }
    )

    const usdcBalAfter = await USDC_Contract.balanceOf(impersonatedSigner.address);
    const daiBalAfter = await DAI_Contract.balanceOf(impersonatedSigner.address);
    const ethBalAfter = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log("=========================================================");

    console.log("usdc balance after swap/liquidity tx", Number(usdcBalAfter));
    console.log("eth balance after swap/liquidity tx", Number(ethBalAfter));
    console.log("dai balance after swap/liquidity tx", Number(daiBalAfter));

    console.log("=========================================================");

    console.log("usdc swapped or liquidity added/removed",Number(usdcBal) - Number(usdcBalAfter));
    console.log("eth swapped or liquidity added/removed", Number(ethBal) - Number(ethBalAfter));
    console.log("dai swapped or liquidity added/removed", Number(daiBal) - Number(daiBalAfter));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
