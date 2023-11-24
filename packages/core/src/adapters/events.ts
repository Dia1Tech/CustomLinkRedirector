import { Keccak } from 'sha3';
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { IEventAdapter, Event } from "../entities/event";
import { Table } from '../infrastructure/dynamoDBTable';
import { v4 as uuidv4 } from 'uuid';
import { marshall } from '@aws-sdk/util-dynamodb';

export class EventDynamoDBAdapter implements IEventAdapter {
    private dynamoDBClient: DynamoDBClient;
    private shasum: Keccak;

    constructor(dynamoDBClient: DynamoDBClient = new DynamoDBClient(), shasum: Keccak = new Keccak(256)){
        this.dynamoDBClient = dynamoDBClient
        this.shasum = shasum
    }

    async registerAPIEvent({evt, statusCode, response}: Event){
        this.shasum.update(evt.routeKey)
        const putParams: any = {
            TableName: Table.Events.tableName,
            Item: marshall({
                eventHash: `${this.shasum.digest('hex')}`,
                eventId: uuidv4(),
                createdAt: Date.now(),
                evt,
                statusCode,
                response
            })
        }
        const command = new PutItemCommand(putParams);
        await this.dynamoDBClient.send(command);
    }
}