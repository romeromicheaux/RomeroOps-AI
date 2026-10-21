const { App } = require("@slack/bolt");

const {
  BedrockRuntimeClient,
  ConverseCommand
} = require("@aws-sdk/client-bedrock-runtime");

const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require("@aws-sdk/client-secrets-manager");

const REGION = "us-east-2";
const SECRET_NAME = "RomeroOps-AI/slack";

const bedrock = new BedrockRuntimeClient({
  region: REGION
});

const secretsManager = new SecretsManagerClient({
  region: REGION
});

async function getSlackCredentials() {
  console.log("🔐 Retrieving Slack credentials from AWS Secrets Manager...");

  const response = await secretsManager.send(
    new GetSecretValueCommand({
      SecretId: SECRET_NAME
    })
  );

  if (!response.SecretString) {
    throw new Error("Slack secret did not contain a SecretString.");
  }

  const credentials = JSON.parse(response.SecretString);

  if (!credentials.SLACK_BOT_TOKEN || !credentials.SLACK_APP_TOKEN) {
    throw new Error("Required Slack credentials are missing from Secrets Manager.");
  }

  console.log("✅ Slack credentials retrieved successfully.");

  return credentials;
}

async function startRomeroOps() {
  try {
    const slackCredentials = await getSlackCredentials();

    const app = new App({
      token: slackCredentials.SLACK_BOT_TOKEN,
      appToken: slackCredentials.SLACK_APP_TOKEN,
      socketMode: true
    });

    app.command("/compliment", async ({ command, ack, respond }) => {
      await ack();

      try {
        const response = await bedrock.send(
          new ConverseCommand({
            modelId: "zai.glm-4.7-flash",
            messages: [
              {
                role: "user",
                content: [
                  {
                    text:
                      command.text ||
                      "Give me a short motivational compliment."
                  }
                ]
              }
            ]
          })
        );

        const aiReply = response.output.message.content[0].text;

        await respond({
          response_type: "in_channel",
          text: `🤖 ${aiReply}`
        });
      } catch (error) {
        console.error("❌ Bedrock/command error:", error);

        await respond({
          response_type: "ephemeral",
          text: "RomeroOps received the command, but an error occurred while generating the response."
        });
      }
    });
        // RomeroOps-AI Historical Incident Investigator
    app.command("/investigate", async ({ command, ack, respond }) => {
      await ack();

      try {
        const query = command.text?.trim();

        if (!query) {
          await respond({
            response_type: "ephemeral",
            text: "Enter an incident description. Example: /investigate Crew Scheduling API timeout"
          });
          return;
        }

        const apiResponse = await fetch(
          "https://udqhpclpea.execute-api.us-east-1.amazonaws.com/prod/investigate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ query }),
            signal: AbortSignal.timeout(20000)
          }
        );

        if (!apiResponse.ok) {
          throw new Error(`RAG API returned HTTP ${apiResponse.status}`);
        }

        const results = await apiResponse.json();

        const incidents = Array.isArray(results.incidents)
          ? results.incidents
          : [];

        const report = [
          "🔎 *RomeroOps-AI Incident Investigation*",
          `*Query:* ${query}`,
          `*Historical matches:* ${results.matches ?? incidents.length}`,
          ""
        ];

        incidents.slice(0, 5).forEach((incident, index) => {
          const score = Number(incident.score);
          const relevance = Number.isFinite(score)
            ? `${(score * 100).toFixed(1)}%`
            : "Not available";

          const analysis = String(incident.text || "")
            .replace(/^\],\s*/, "")
            .slice(0, 450);

          report.push(
            `*Match ${index + 1}* — Relevance: ${relevance}`,
            analysis || "No incident details available.",
            ""
          );
        });

        await respond({
          response_type: "ephemeral",
          text: report.join("\n").slice(0, 3500)
        });

      } catch (error) {
        console.error("RAG investigation error:", error);

        await respond({
          response_type: "ephemeral",
          text: "RomeroOps-AI could not complete the investigation."
        });
      }
    });
    await app.start();

    console.log(
      "⚡ RomeroOps-AI is connected to Slack and ready for Bedrock!"
    );
  } catch (error) {
    console.error("❌ RomeroOps-AI startup failed:", error);
    process.exit(1);
  }
}

startRomeroOps();
