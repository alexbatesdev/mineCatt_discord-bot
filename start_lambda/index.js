// This code was written by an AI assistant.
const AWS = require('aws-sdk');
const ec2 = new AWS.EC2();
const ssm = new AWS.SSM();

const INSTANCE_ID = 'i-0d134a3a688749e6c';

async function mountVolume() {
    const command = `sudo mount /dev/xvdb /home/ec2-user/minecraft`;
    const params = {
        DocumentName: 'AWS-RunShellScript',
        InstanceIds: [INSTANCE_ID],
        Parameters: {
            commands: [command],
        },
    };
    console.log(params);
    const response = await ssm.sendCommand(params).promise();
    console.log(response);
    const commandId = response.Command.CommandId;

    // Wait for the command to complete
    const resultParams = {
        CommandId: commandId,
        InstanceId: INSTANCE_ID,
    };

    let commandStatus = 'InProgress';
    while (commandStatus === 'InProgress') {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
        const result = await ssm.getCommandInvocation(resultParams).promise();
        commandStatus = result.Status;
    }

    if (commandStatus !== 'Success') {
        throw new Error(`Failed to mount volume: ${commandStatus}`);
    }
}

async function startDockerContainer() {
    const command = `sudo docker-compose -f /home/ec2-user/minecraft/docker-compose.yaml up -d`;
    const params = {
        DocumentName: 'AWS-RunShellScript',
        InstanceIds: [INSTANCE_ID],
        Parameters: {
            commands: [command],
        },
    };

    const response = await ssm.sendCommand(params).promise();
    const commandId = response.Command.CommandId;

    // Wait for the command to complete
    const resultParams = {
        CommandId: commandId,
        InstanceId: INSTANCE_ID,
    };

    let commandStatus = 'InProgress';
    while (commandStatus === 'InProgress') {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
        const result = await ssm.getCommandInvocation(resultParams).promise();
        commandStatus = result.Status;
    }

    if (commandStatus !== 'Success') {
        throw new Error(`Failed to start Docker container: ${commandStatus}`);
    }
}

exports.handler = async (event) => {
    try {
        // Check the current state of the instance
        const describeInstancesResponse = await ec2.describeInstances({ InstanceIds: [INSTANCE_ID] }).promise();
        const instanceState = describeInstancesResponse.Reservations[0].Instances[0].State.Name;

        if (instanceState === 'running') {
            console.log(`Instance ${INSTANCE_ID} is already running`);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: `Instance ${INSTANCE_ID} is already running` }),
            };
        }
    } catch (error) {
        console.error(`Error checking instance state: ${error.message}`);
        return {
            statusCode: 500,
            body: JSON.stringify(error.message),
        };
    }

    try {
        // Start the EC2 instance
        await ec2.startInstances({ InstanceIds: [INSTANCE_ID] }).promise();
        console.log(`Started instance: ${INSTANCE_ID}`);

        // Wait for the instance to start
        await ec2.waitFor('instanceRunning', { InstanceIds: [INSTANCE_ID] }).promise();
        console.log(`Instance ${INSTANCE_ID} is running`);
    } catch (error) {
        console.error(`Error starting instance: ${error.message}`);
        const response = {
            statusCode: 500,
            body: JSON.stringify(error.message),
        };
        return response;
    }
    // This is here because javscript doesn't have poggers scope like python
    let publicIp = null;
    try {
        // Get the public IP address of the instance
        const describeInstancesResponse = await ec2.describeInstances({ InstanceIds: [INSTANCE_ID] }).promise();
        publicIp = describeInstancesResponse.Reservations[0].Instances[0].PublicIpAddress;
        console.log(`Public IP address: ${publicIp}`);
    } catch (error) {
        console.error(`Error retrieving public IP: ${error.message}`);
        const response = {
            statusCode: 500,
            body: JSON.stringify(error.message),
        };
        return response;
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            public_ip: publicIp,
            message: 'EC2 Instance setup complete. Minecraft container started.',
        }),
    };
    return response;
};
// This code was written by an AI assistant.
