import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { default as axios } from "axios";
import { default as cron } from 'node-cron';

const cronSchedule = process.env.CRON_SCHEDULE;
if (!cronSchedule) {
    console.error("Missing CRON_SCHEDULE")
    
    process.exit(1);
}

console.log(`Running wakentip according to cron schedule '${cronSchedule}'`);

cron.schedule(cronSchedule, () => {
    runTip().catch(err => {
        console.error(err)
    });
})


async function runTip() {
    const dryRun = process.env.DRY_RUN === "true";
    
    const neynarAPIKey = process.env.NEYNAR_API_KEY;
    if (!neynarAPIKey) {
        console.error("Missing NEYNAR_API_KEY")
    
        process.exit(1);    
    }
    
    const neynarSignerUUID = process.env.NEYNAR_SIGNER_UUID;
    if (!neynarSignerUUID) {
        console.error("Missing NEYNAR_SIGNER_UUID")
    
        process.exit(1);
    }
    
    const tipperFID = process.env.TIPPER_FID;
    if (!tipperFID) {
        console.error("Missing TIPPER_FID")
    
        process.exit(1);
    }
    
    const tipRecipientFID = process.env.RECIPIENT_FID;
    if (!tipRecipientFID) {
        console.error("Missing RECIPIENT_FID")
    
        process.exit(1);
    }
    
    console.log(`Retrieving tip allowance for Farcaster ID: ${tipperFID}`);
    
    const tipAllowances = await axios.get("https://api.degen.tips/airdrop2/allowances?fid=" + tipperFID)
    if (!tipAllowances.data || !tipAllowances.data.length) {
        if (dryRun) {
            console.log("No tip allowance found; however, dry run is enabled, so the process will continue");
        } else {
            console.log("No tip allowance found");
    
            process.exit(0);
        }
    };
    
    const remainingAllowance = parseInt(tipAllowances.data[0].remaining_tip_allowance);
    if (!remainingAllowance) {
        if (dryRun) {
            console.log("Allowance found, but user has no remaining allowance; however, dry run is enabled, so the process will continue");
        } else {
            console.log("Allowance found, but user has no remaining allowance");
        
            process.exit(0);
        }
    }
    
    console.log(`Tipper has a remaining allowance of ${remainingAllowance}`);
    
    const config = new Configuration({
      apiKey: neynarAPIKey,
    });
    
    const client = new NeynarAPIClient(config);
    
    const recipientCasts = await client.fetchCastsForUser({
        fid: tipRecipientFID,
        limit: 1,
    })
    
    if (!recipientCasts || !recipientCasts.casts || !recipientCasts.casts.length) {
        console.log("Recipient has no casts")
    
        process.exit(0);
    }
    
    const recipientCastHash = recipientCasts.casts[0].hash;
    const postText = `${remainingAllowance} \$DEGEN`;
    const nonce = (new Date()).getTime();
    
    if (dryRun) {
        console.log("Dry run is enabled, so no post will be made. If dry run was NOT enabled, the following would have been posted:");
        console.log(` - Parent cast hash: '${recipientCastHash}'`);
        console.log(` - Text: '${postText}'`);
        console.log(` - Nonce: '${nonce}'`);
    } else {
        console.log(`Posting tip beneath cast ${recipientCastHash}`);
    
        await client.publishCast({
            signerUuid: neynarSignerUUID,
            text: postText,
            parent: recipientCastHash,
            idem: nonce,
        })
    }
}