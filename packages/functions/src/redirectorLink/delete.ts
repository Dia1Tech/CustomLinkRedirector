import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { LinkRedirectorDynamoDBAdapter } from "@CustomLinkRedirector/core/src/adapters/linkRedirectorDynamoDB";
import { deletePathSchema } from "@CustomLinkRedirector/core/src/schemas/redirectorLinks";
import { ILinkRedirectorAdapter, LinkRedirector } from "@CustomLinkRedirector/core/entities/linkRedirector";
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
      const {value, error} = deletePathSchema.validate(_evt.pathParameters)
      if (error) {
        return badRequest(_evt, error)
      }
      const ownerId = process.env.ownerId || ""
      const originalUrl = `${process.env.domainName}/${value.code}`
      await linkRedirectorAdapter.deleteLinkRedirector(ownerId, originalUrl)
      return success(_evt, {
        message: "Link Redirector successfully deleted"
      })
    } catch (error) {
      console.error(error)
      return failure(_evt, error)
    }
  })
}