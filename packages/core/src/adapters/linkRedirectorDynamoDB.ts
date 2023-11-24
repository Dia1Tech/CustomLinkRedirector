import { Table as _Table } from "sst/node/table";
import { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { ILinkRedirectorAdapter, LinkRedirector, LinkRedirectorsList } from "../entities/linkRedirector";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const Table: any = _Table;

export class LinkRedirectorDynamoDBAdapter implements ILinkRedirectorAdapter {
    private dynamoDBClient: DynamoDBClient;

    constructor(dynamoDBClient: DynamoDBClient = new DynamoDBClient()){
        this.dynamoDBClient = dynamoDBClient
    }

    async createLinkRedirector(linkRedirector: LinkRedirector): Promise<LinkRedirector> {
        const command = new PutItemCommand({
            TableName: Table.LinkRedirector.tableName,
            Item: marshall(linkRedirector)
        });
        await this.dynamoDBClient.send(command);
        return linkRedirector;
    }

    async getLinkRedirector(ownerId: string, originalUrl: string): Promise<LinkRedirector> {
        const command = new GetItemCommand({
            TableName: Table.LinkRedirector.tableName,
            Key: {
                ownerId: { S: ownerId },
                originalUrl: { S: originalUrl }
            }
        });

        const response = await this.dynamoDBClient.send(command);
        return response.Item ? unmarshall(response.Item as any) as LinkRedirector : {} as LinkRedirector;
    }

    async updateLinkRedirector(linkRedirector: Partial<LinkRedirector>): Promise<LinkRedirector> {
        let _linkRediretor: any = {...linkRedirector}
        delete _linkRediretor["ownerId"]
        delete _linkRediretor["originalUrl"]
        for (let entry of Object.entries(_linkRediretor)) {
            if (entry[1] === undefined) {
                delete _linkRediretor[entry[0]]
            }
        }
        const updateExpression = Object.keys(_linkRediretor)
            .map(key => `${key} = :${key}`)
            .join(', ');
        const expressionAttributeValues: any = Object.fromEntries(
            Object.entries(_linkRediretor).map(([key, value]) => [`:${key}`, value])
        );
        
        const command = new UpdateItemCommand({
            TableName: Table.LinkRedirector.tableName,
            Key: {
                ownerId: { S: linkRedirector.ownerId || "" },
                originalUrl: { S: linkRedirector.originalUrl || "" }
            },
            UpdateExpression: `set ${updateExpression}`,
            ExpressionAttributeValues:  marshall(expressionAttributeValues),
            ReturnValues: "ALL_NEW"
        });
        const response = await this.dynamoDBClient.send(command);
        return unmarshall(response.Attributes as any) as LinkRedirector;
    }

    async deleteLinkRedirector(ownerId: string, originalUrl: string): Promise<void> {
        const command = new DeleteItemCommand({
            TableName: Table.LinkRedirector.tableName,
            Key: {
                ownerId: { S: ownerId },
                originalUrl: { S: originalUrl }
            }
        });

        await this.dynamoDBClient.send(command);
    }

    async listLinkRedirectors(ownerId: string, limit: number, lastEvaluatedKey: any): Promise<LinkRedirectorsList> {
        const command = new QueryCommand({
            TableName: Table.LinkRedirector.tableName,
            Limit: limit,
            ExpressionAttributeValues: {
                ":ownerId": { "S": ownerId }
            },
            KeyConditionExpression: "ownerId = :ownerId",
            ScanIndexForward: true,
            ExclusiveStartKey: lastEvaluatedKey
        });
        const response = await this.dynamoDBClient.send(command);
        return {
            linkRedirectors: response.Items?.map(item => (unmarshall(item))) as LinkRedirector[],
            lastEvaluatedKey: response.LastEvaluatedKey
        };
    }
}