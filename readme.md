# MineCatt - Discord Bot

A discord bot that can be used to bring up and check the status of a Minecraft server.

Maybe expand in the future to be more infrastructure related.

# Run the server

```bash
node index.js
```

# Update Command Definitions

```bash
node deploy-commands.js
```

# Environment Variables

```bash
TOKEN=YOUR_DISCORD_BOT_TOKEN
GUILD_ID=YOUR_DISCORD_GUILD_ID
CLIENT_ID=YOUR_DISCORD_CLIENT_ID
```

## Related Lambdas

ShutDown
https://us-west-2.console.aws.amazon.com/lambda/home?region=us-west-2#/functions/shutDownMinecraft?newFunction=true&tab=code


CheckStatus
https://us-west-2.console.aws.amazon.com/lambda/home?region=us-west-2#/functions/isMinecraftUp?newFunction=true&tab=code


## Other Resources
EC2 Instance
https://us-west-2.console.aws.amazon.com/ec2/home?region=us-west-2#Instances:instanceState=running

Elasitc IP
https://us-west-2.console.aws.amazon.com/ec2/home?region=us-west-2#Addresses:

Cloudwatch Alarm
https://us-west-2.console.aws.amazon.com/cloudwatch/home?region=us-west-2#alarmsV2:alarm/NobodyOnline?~(alarmStateFilter~'ALARM)

- [ChatGPT Conversation about this](https://chatgpt.com/c/e9a70dd0-a3d1-411a-8543-c44beb8dcc6d) (Lots of branhing paths)

- [Discord Developer Portal](https://discord.com/developers/applications)
