import sdk from "./1-initialize-sdk.js"
import { readFileSync } from "fs"

const bundleDrop = sdk.getBundleDropModule("0x999B3db8a927C53D14141f611668FF452FBF9AcD");

(async () => {
    try{
        await bundleDrop.createBatch([
            {
                name: "Mana Core",
                description: "This NFT will give you access to AdvancedDAO",
                image: readFileSync("scripts/assets/mana_core.jpg")
            }
        ])

        console.log("✅ You've successfully created new NFT on the drop!")
    }catch(error){
        console.log("You've failed to create new NFT", error)
    }
})()