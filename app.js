require("dotenv").config();

const { App } = require("@slack/bolt");
const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");

const bedrock = new BedrockRuntimeClient({
  region: "us-east-2"
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/compliment", async ({ command, ack, respond }) => {
  await ack();

  const response = await bedrock.send(
    new ConverseCommand({
      modelId: "zai.glm-4.7-flash",
      messages: [
        {
          role: "user",
          content: [
            {
              text: command.text || "Give me a short motivational compliment."
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
});

(async () => {
  await app.start();
  console.log("⚡ RomeroOps-AI is connected to Slack and ready for Bedrock!");
})();