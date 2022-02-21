import sdk from "./1-initialize-sdk.js"
import { ethers } from "ethers"
import { readFileSync } from "fs"


const app = sdk.getAppModule("0xF909b3Fbd77DcFAFbA308274dD7024a41dEC2475"); // App Adddress inserted here


(async () => {
    try{
        const bundleDropModule = await app.deployBundleDropModule({
            // The collection's name
            name: "Advanced DAO membership",
            // Description for the collection
            description: "A DAO for all advanced avid reader",
            // the image that will later appear on Opensea
            image: readFileSync("scripts/assets/advanced_mc.png"),
            // We need to pass in the address of the person who will be receiving the proceeds from sales of nfts in the module.
            // We're planning on not charging people for the drop, so we'll pass in the 0x0 address
            // you can set this to your own wallet address if you want to charge for the drop.
            primarySaleRecipientAddress: ethers.constants.AddressZero,
        });
        console.log(
            "✅ Successfully deployed bundleDrop module, address:",
            bundleDropModule.address, // 0x999B3db8a927C53D14141f611668FF452FBF9AcD
        );
        console.log(
        "✅ bundleDrop metadata:",
        await bundleDropModule.getMetadata(),
        );

    }catch(error){
        console.log("failed to deploy bundleDrop module", error);
    }
})()

