import {
	ITriggerFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	NodeOperationError,
} from 'n8n-workflow';

import redis from 'redis';

export class RedisTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Redis Trigger',
		name: 'redisTrigger',
		icon: 'file:redis.svg',
		group: ['trigger'],
		version: 1,
		description: 'Subscribe to redis channel',
		defaults: {
			name: 'Redis Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'redis',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Channels',
				name: 'channels',
				type: 'string',
				default: '',
				required: true,
				description: `Channels to subscribe to, multiple channels be defined with comma. Wildcard character(*) is supported`,
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'JSON Parse Body',
						name: 'jsonParseBody',
						type: 'boolean',
						default: false,
						description: 'Try to parse the message to an object',
					},
					{
						displayName: 'Only Message',
						name: 'onlyMessage',
						type: 'boolean',
						default: false,
						description: 'Returns only the message property',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {

		const credentials = await this.getCredentials('redis');

		const redisOptions: redis.ClientOpts = {
			host: credentials.host as string,
			port: credentials.port as number,
			db: credentials.database as number,
		};

		if (credentials.password) {
			redisOptions.password = credentials.password as string;
		}

		const channels = (this.getNodeParameter('channels') as string).split(',');

		const options = this.getNodeParameter('options') as IDataObject;

		if (!channels) {
			throw new NodeOperationError(this.getNode(), 'Channels are mandatory!');
		}

		const client = redis.createClient(redisOptions);

		const self = this;

		async function manualTriggerFunction() {
			await new Promise((resolve, reject) => {
				client.on('connect', () => {
					for (const channel of channels) {
						client.psubscribe(channel);
					}
					client.on('pmessage', (pattern: string, channel: string, message: string) => {
						if (options.jsonParseBody) {
							try {
								message = JSON.parse(message);
							} catch (error) { }
						}

						if (options.onlyMessage) {
							self.emit([self.helpers.returnJsonArray({message})]);
							resolve(true);
							return;
						}

						self.emit([self.helpers.returnJsonArray({channel, message})]);
						resolve(true);
					});
				});

				client.on('error', (error) => {
					reject(error);
				});
			});
		}

		if (this.getMode() === 'trigger') {
			await manualTriggerFunction();
		}

		async function closeFunction() {
			client.quit();
		}

		return {
			closeFunction,
			manualTriggerFunction,
		};
	}
}
