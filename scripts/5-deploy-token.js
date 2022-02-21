import sdk from "./1-initialize-sdk.js"

// to deploy the new token contract we need our good old friend, the app module
const app = sdk.getAppModule("0xF909b3Fbd77DcFAFbA308274dD7024a41dEC2475");

(async () => {
    try{
        // Deploy a standard ERC-20 token
        const tokenModule = await app.deployTokenModule({
            name: "AdvancedDAO governance token",
            symbol: "MAGICIAN"
        });

        console.log("✅ Successfully deployed token module, address: ", tokenModule.address); 
        // 0xe0cf25B6E3e29c0426381007240950d6843226a1

    }catch(error){
        console.log("Failed to deploy the token module :(", error);
    }
    
})()

