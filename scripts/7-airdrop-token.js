import { ethers } from "ethers"
import sdk from "./1-initialize-sdk.js"

const bundleDrop = sdk.getBundleDropModule("0x999B3db8a927C53D14141f611668FF452FBF9AcD");
const tokenModule = sdk.getTokenModule("0xe0cf25B6E3e29c0426381007240950d6843226a1");

(async () => {
    try{
        // Get all the wallet addresses that hold our membershib NFT
        const walletAddresses = await bundleDrop.getAllClaimerAddresses("0");
        // loop through all the address to return the random amount of token to be airdroped
        const airdropTargets = walletAddresses.map( elem => {
            // get a random number between 1000 and 10000
            const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
            console.log(`✅ ${randomAmount} $MAGICIAN will be airdropped to the address ${elem}`);

            // set up the target
            const airdropTarget = {
                address: elem,
                // the amount must have 18 decimal
                amount: ethers.utils.parseUnits(randomAmount.toString(), 18)
            };

            return airdropTarget;
        })

        // Call transferBatch on all of our airdrop targets
        console.log("Starting...");
        await tokenModule.transferBatch(airdropTargets);
        console.log("✅ Successfully airdropped tokens to all the holders of the NFT!");
    }catch(error){
        console.log("Failed to airdrop tokens ", error );
    }
})();