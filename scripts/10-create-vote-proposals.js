import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// This is our governance contract.
const voteModule = sdk.getVoteModule("0x36725a7E69e266d898879ef9bfDd355207E7e7D5");
// This is our ERC-20 contract.
const tokenModule = sdk.getTokenModule("0xe0cf25B6E3e29c0426381007240950d6843226a1");

// Proposal to mint 300 000 new token into the treasury
(async () => {

    try{
        const amount = 300_000;

        await voteModule.propose(
            `Should the DAO mint an additional ${amount} token into the treasury?`,
            [
                {
                    // Our nativeToken is ETH. nativeTokenValue is the amount of ETH we want
                    // to send in this proposal. In this case, we're sending 0 ETH.
                    // We're just minting new tokens to the treasury. So, set to 0.
                    nativeTokenValue: 0,
                    transactionData: tokenModule.contract.interface.encodeFunctionData(
                        // We're doing a mint! And, we're minting to the voteModule, which is
                        // acting as our treasury.
                        "mint",
                        [
                        voteModule.address,
                        ethers.utils.parseUnits(amount.toString(), 18),
                        ]
                    ),
                    // Our token module that actually executes the mint.
                    toAddress: tokenModule.address,
                }
            ]
        )
        console.log("✅ Successfully created proposal to mint tokens");

    }catch(error){
         console.error("failed to create first proposal", error);
        process.exit(1);
    }
   
})();

// Proposal to to transfer ourselves 8 749 tokens because we're awesome
(async () => {
    try{
        const amount = 8_749;

        await voteModule.propose(
            `Should the DAO transfer ${amount} token from treasury to the address ${process.env.WALLET_ADDRESS} for being awesome?`,
            [
                {
                    nativeTokenValue: 0,
                    transactionData: tokenModule.contract.interface.encodeFunctionData(
                        "transfer",
                        [
                            process.env.WALLET_ADDRESS,
                            ethers.utils.parseUnits(amount.toString(), 18)
                        ]
                    ),
                    toAddress: tokenModule.address
                }
            ]
        );
        console.log(
            "✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!"
        );

    }catch(error){
        console.error("failed to create second proposal", error);
    }
})();

