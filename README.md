# RomeroOps-AI

RomeroOps-AI is a Slack-based AI operations assistant built with Node.js and Amazon Bedrock. It allows a user to submit a prompt through a Slack slash command and receive an AI-generated response directly inside Slack.

## How It Works

1. A user submits a request in Slack using the `/compliment` slash command.
2. RomeroOps-AI receives the request through the Slack application.
3. The Node.js application sends the prompt to Amazon Bedrock.
4. Amazon Bedrock generates an AI response.
5. RomeroOps-AI returns the response directly to the Slack channel.

**Workflow:** Slack → RomeroOps-AI → Amazon Bedrock → Slack

## Technology Stack

- Node.js
- Slack API / Slack Bot
- Amazon Bedrock
- AWS SDK for JavaScript
- Environment variables for credential protection

## Security

Sensitive credentials and configuration values are stored locally in a `.env` file and are excluded from this public repository. The `node_modules` directory is also excluded.

## Project Purpose

This project demonstrates an AI-powered operations workflow integrating Slack with Amazon Bedrock. It showcases cloud AI integration, API-based application development, secure credential handling, and human interaction with an AI assistant.

## Status

Functional prototype. The Slack-to-Amazon-Bedrock-to-Slack workflow has been tested successfully.
