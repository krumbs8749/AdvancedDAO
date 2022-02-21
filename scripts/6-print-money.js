import { ethers } from "ethers"
import sdk from "./1-initialize-sdk.js"

const tokenModule = sdk.getTokenModule("0xe0cf25B6E3e29c0426381007240950d6843226a1");

(async () => {
    try{
        // determine the total supply desired
        const amount = 1_000_000;
        // convert the value to have 18 decimals using util method from ethers
        const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
        // Interact with the deployed ERC-20 token contract and mint the tokens
        await tokenModule.mint(amountWith18Decimals);
        const totalSupply = await tokenModule.totalSupply();

        console.log(`✅ There are now ${totalSupply} $MAGICIAN in circulation`);
    }catch(error){
        console.log("Failed to print money", error)
    }
})();