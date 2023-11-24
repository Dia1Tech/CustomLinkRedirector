import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { LinkRedirectorDynamoDBAdapter } from "@CustomLinkRedirector/core/src/adapters/linkRedirectorDynamoDB";
import { redirectPathSchema } from "@CustomLinkRedirector/core/src/schemas/useCases";
import { ILinkRedirectorAdapter } from "@CustomLinkRedirector/core/entities/linkRedirector";
import { failure, redirect } from "@CustomLinkRedirector/core/src/responses/common";

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
      const {value, error} = redirectPathSchema.validate(_evt.pathParameters)
      if (error) {
        return redirect(_evt, {
          message: "Error",
          redirectUrl: process.env.blankLink
        })
      }
      const ownerId = process.env.ownerId || ""
      const originalUrl = `${process.env.domainName}/${value.code}`
      const linkRedirector = await linkRedirectorAdapter.getLinkRedirector(ownerId, originalUrl)
      const redirectUrl = linkRedirector&&linkRedirector.isActive ? linkRedirector.redirectUrl : undefined
      return redirect(_evt, {
        message: redirectUrl ? "Successfully" : "Not found",
        redirectUrl: redirectUrl || process.env.notFoundLink
      })
    } catch (error) {
      console.error(error)
      return failure(_evt, error)
    }
  })
}