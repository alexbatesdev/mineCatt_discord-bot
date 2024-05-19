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
    const command = `sudo docker-compose -f /home/ec2-user/minecraft/docker-compose.yml up -d`;
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
        // Start the EC2 instance
        await ec2.startInstances({ InstanceIds: [INSTANCE_ID] }).promise();
        console.log(`Started instance: ${INSTANCE_ID}`);
    } catch (error) {
        console.error(`Error starting instance: ${error.message}`);
        const response = {
            statusCode: 500,
            body: JSON.stringify(error.message),
        };
        return response;
    }

    try {

        // Wait for the instance to start
        await ec2.waitFor('instanceRunning', { InstanceIds: [INSTANCE_ID] }).promise();
        console.log(`Instance ${INSTANCE_ID} is running`);
    } catch (error) {
        // Stop the EC2 instance
        fetch("https://dts45otpkwa5mer2ahsbvgnnj40rgvwc.lambda-url.us-west-2.on.aws/")
        console.error(`Error waiting for instance to start: ${error.message}`);
        const response = {
            statusCode: 500,
            body: JSON.stringify(error.message),
        };
        return response;
    }

    try {
        // Mount the volume
        await mountVolume();
        console.log(`Mounted volume on instance ${INSTANCE_ID}`);
    } catch (error) {
        // Stop the EC2 instance
        fetch("https://dts45otpkwa5mer2ahsbvgnnj40rgvwc.lambda-url.us-west-2.on.aws/")
        console.error(`Error mounting volume: ${error.message}`);
        const response = {
            statusCode: 500,
            body: JSON.stringify(error.message),
        };
        return response;
    }

    try {
        // Start the Docker container
        await startDockerContainer();
        console.log(`Started Docker container on instance ${INSTANCE_ID}`);
    } catch (error) {
        // Stop the EC2 instance
        fetch("https://dts45otpkwa5mer2ahsbvgnnj40rgvwc.lambda-url.us-west-2.on.aws/")
        console.error(`Error starting Docker container: ${error.message}`);
        const response = {
            statusCode: 500,
            body: JSON.stringify(error.message),
        };
        return response;
    }

    try {
        // Create an Elastic IP
        const allocation = await ec2.allocateAddress({ Domain: 'vpc' }).promise();
        const allocationId = allocation.AllocationId;
        const publicIp = allocation.PublicIp;
        console.log(`Created Elastic IP: ${publicIp} with Allocation ID: ${allocationId}`);

        // Get the network interface ID
        const describeInstancesResponse = await ec2.describeInstances({ InstanceIds: [INSTANCE_ID] }).promise();
        const networkInterfaceId = describeInstancesResponse.Reservations[0].Instances[0].NetworkInterfaces[0].NetworkInterfaceId;

        // Associate the Elastic IP with the instance
        await ec2.associateAddress({ AllocationId: allocationId, NetworkInterfaceId: networkInterfaceId }).promise();
        console.log(`Associated Elastic IP ${publicIp} with instance ${INSTANCE_ID}`);
    } catch (error) {
        // Stop the EC2 instance
        fetch("https://dts45otpkwa5mer2ahsbvgnnj40rgvwc.lambda-url.us-west-2.on.aws/")
        console.error(`Error associating Elastic IP: ${error.message}`);
        const response = {
            statusCode: 500,
            body: JSON.stringify(error.message),
        };
        return response;
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            instance_id: INSTANCE_ID,
            public_ip: publicIp
        }),
    };
    return response;
};
// This code was written by an AI assistant.