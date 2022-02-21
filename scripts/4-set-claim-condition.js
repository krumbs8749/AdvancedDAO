import sdk from "./1-initialize-sdk.js"

const bundleDrop = sdk.getBundleDropModule("0x999B3db8a927C53D14141f611668FF452FBF9AcD");

(async() => {
    try{
        const claimConditionFactory = await bundleDrop.getClaimConditionFactory();

        // specify conditions
        claimConditionFactory.newClaimPhase({
            startTime: new Date(),
            maxQuantity: 50_000,
            maxQuantityPerTransaction: 1, 
        });

        await bundleDrop.setClaimCondition(0, claimConditionFactory);
        console.log("✅ Successfully set claim condition on bundle drop:", bundleDrop.address);
    }catch(error){
        console.log("Failed to set claim conditons", error);
    }
})()


