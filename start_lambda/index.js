// This code was written by an AI assistant.
const AWS = require('aws-sdk');
const ec2 = new AWS.EC2();
const ssm = new AWS.SSM();

const INSTANCE_ID = 'i-0d134a3a688749e6c';

async function getInstanceIp(instanceId) {
    const params = {
        InstanceIds: [instanceId],
    };

    const response = await ec2.describeInstances(params).promise();
    const ip = response.Reservations[0].Instances[0].PublicIpAddress;
    return ip;
}

function returnError(statusCode, message) {
    console.error(`Error: ${message}`);
    const response = {
        statusCode: statusCode,
        body: JSON.stringify(message),
    };
    return response;
}

exports.handler = async (event) => {
    try {
        // Check the current state of the instance
        const describeInstancesResponse = await ec2.describeInstances({ InstanceIds: [INSTANCE_ID] }).promise();
        const instanceState = describeInstancesResponse.Reservations[0].Instances[0].State.Name;

        if (instanceState === 'running') {
            console.log(`Instance ${INSTANCE_ID} is already running`);
            let publicIp;
            try {
                publicIp = await getInstanceIp(INSTANCE_ID);
            } catch (error) {
                return returnError(500, error.message);
            }

            return {
                statusCode: 200,
                body: JSON.stringify({
                    public_ip: publicIp,
                    message: `Instance ${INSTANCE_ID} is already running`
                }),
            };
        }
    } catch (error) {
        return returnError(500, error.message);
    }


    try {
        // Start the EC2 instance
        await ec2.startInstances({ InstanceIds: [INSTANCE_ID] }).promise();
        console.log(`Started instance: ${INSTANCE_ID}`);

        // Wait for the instance to start
        await ec2.waitFor('instanceRunning', { InstanceIds: [INSTANCE_ID] }).promise();
        console.log(`Instance ${INSTANCE_ID} is running`);
    } catch (error) {
        return returnError(500, error.message);
    }


    // This is here because javscript doesn't have poggers scope like python
    let publicIp;
    try {
        publicIp = await getInstanceIp(INSTANCE_ID);
    } catch (error) {
        return returnError(500, error.message);
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
