import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';


export class Note implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Note',
		name: 'note',
		icon: 'fa:sticky-note',
		group: ['input'],
		version: 1,
		description: 'Leave notes and organize your flow. Supports markdown.',
		defaults: {
			name: 'Note',
			color: '#FFD233',
		},
		inputs: [],
		outputs: [],
		properties: [
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				required: true,
				typeOptions: {
					rows: 4,
				},
				default: "## I'm a note \n**Double click** to edit me. [Guide](https://docs.n8n.io/getting-started/key-components/workflow-notes.html)",
				description: 'Content',
			},
			{
				displayName: 'Top',
				name: 'top',
				type: 'number',
				required: true,
				default: 80,
			},
			{
				displayName: 'Bottom',
				name: 'bottom',
				type: 'number',
				required: true,
				default: 80,
			},
			{
				displayName: 'Left',
				name: 'left',
				type: 'number',
				required: true,
				default: 120,
			},
			{
				displayName: 'Right',
				name: 'right',
				type: 'number',
				required: true,
				default: 120,
			},
		],
	};

	execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		return this.prepareOutputData(items);
	}
}
