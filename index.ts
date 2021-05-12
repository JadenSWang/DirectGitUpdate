import * as express from "express"
import * as schedule from 'node-schedule'
import env from "./config"
import fetch from "node-fetch"

const app = express()

// if the rebuild request is negative, there is nothing queued up 
let previousRebuildRequest = -1

schedule.scheduleJob("*/4 * * * * *", async () => {
    if (previousRebuildRequest >= 0 && previousRebuildRequest + 5 * 1000 < Date.now()) {
        previousRebuildRequest = -1;
        fetch(env.webhook_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.github_token}`,
                "accept": "application/vnd.github.v3+json"
            },
            body: JSON.stringify({
                "ref": "refs/heads/master"
            })
        })
    }
})

app.post("/rebuild-webhook", async (_, res) => {
    previousRebuildRequest = Date.now()
    res.status(200).send("Rebuild request queued")
})

// listen to stripe changes
app.listen(env.port, () => {
    console.log("Program running on port", env.port)
})