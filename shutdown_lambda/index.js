// This code was written by an AI assistant.
const AWS = require('aws-sdk');

const ec2 = new AWS.EC2();
const ssm = new AWS.SSM();

const INSTANCE_ID = 'i-0d134a3a688749e6c';
const DOCKER_CONTAINER_NAME = 'minecraff';

async function stopDockerContainer(instanceId) {
    const command = `docker stop ${DOCKER_CONTAINER_NAME}`;
    const params = {
        DocumentName: 'AWS-RunShellScript',
        InstanceIds: [instanceId],
        Parameters: {
            commands: [command],
        },
    };

    const response = await ssm.sendCommand(params).promise();
    const commandId = response.Command.CommandId;

    // Wait for the command to complete
    const resultParams = {
        CommandId: commandId,
        InstanceId: instanceId,
    };

    let commandStatus = 'InProgress';
    while (commandStatus === 'InProgress') {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
        const result = await ssm.getCommandInvocation(resultParams).promise();
        commandStatus = result.Status;
    }

    if (commandStatus !== 'Success') {
        throw new Error(`Failed to stop Docker container: ${commandStatus}`);
    }
}

async function getElasticIpAllocationId(instanceId) {
    const params = {
        Filters: [
            {
                Name: 'instance-id',
                Values: [instanceId],
            },
        ],
    };

    const response = await ec2.describeAddresses(params).promise();
    if (response.Addresses.length === 0) {
        throw new Error(`No Elastic IP associated with instance: ${instanceId}`);
    }
    const allocationId = response.Addresses[0].AllocationId;
    return allocationId;
}

module.exports.handler = async (event) => {
    let errors = [];
    try {
        // Stop the Docker container
        await stopDockerContainer(INSTANCE_ID);
        console.log(`Stopped Docker container: ${DOCKER_CONTAINER_NAME}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        errors.push(error.message);

    }

    try {
        // Stop the EC2 instance
        await ec2.stopInstances({ InstanceIds: [INSTANCE_ID] }).promise();

        // Wait for the instance to stop
        await ec2.waitFor('instanceStopped', { InstanceIds: [INSTANCE_ID] }).promise();
        console.log(`Stopped instance: ${INSTANCE_ID}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        errors.push(error.message);
    }

    try {
        // Get the Elastic IP allocation ID dynamically
        const allocationId = await getElasticIpAllocationId(INSTANCE_ID);
        console.log(`Elastic IP allocation ID: ${allocationId}`);

        // Release the Elastic IP
        await ec2.releaseAddress({ AllocationId: allocationId }).promise();
        console.log(`Released Elastic IP: ${allocationId}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        errors.push(error.message);
    }

    if (errors.length > 0) {
        const response = {
            statusCode: 500,
            body: JSON.stringify(errors),
        };
        return response;
    }
    const response = {
        statusCode: 200,
        body: JSON.stringify({ "message": "Instance stopped and Elastic IP released" }),
    };
    return response;
};
// This code was written by an AI assistant.
