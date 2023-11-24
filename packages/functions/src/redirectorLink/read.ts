import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { LinkRedirectorDynamoDBAdapter } from "@CustomLinkRedirector/core/src/adapters/linkRedirectorDynamoDB";
import { readPathSchema } from "@CustomLinkRedirector/core/src/schemas/redirectorLinks";
import { ILinkRedirectorAdapter } from "@CustomLinkRedirector/core/entities/linkRedirector";
import { badRequest, failure, success } from "@CustomLinkRedirector/core/src/responses/common";

export interface Dependencies {
  linkRedirectorAdapter: ILinkRedirectorAdapter;
}

export const dependencies = {
  init: async (): Promise<Dependencies> => ({
    linkRedirectorAdapter: new LinkRedirectorDynamoDBAdapter()
  })
}

export async function handler(_evt: APIGatewayProxyEventV2WithJWTAuthorizer) {
  return await dependencies.init().then(async ({linkRedirectorAdapter}: Dependencies) => {
    try {
      const {value, error} = readPathSchema.validate(_evt.pathParameters)
      if (error) {
        return badRequest(_evt, error)
      }
      const ownerId = process.env.ownerId || ""
      const originalUrl = `${process.env.domainName}/${value.code}`
      const linkRedirector = await linkRedirectorAdapter.getLinkRedirector(ownerId, originalUrl)
      return success(_evt, {
        message: "Link Redirector successfully read",
        linkRedirector
      })
    } catch (error) {
      console.error(error)
      return failure(_evt, error)
    }
  })
}