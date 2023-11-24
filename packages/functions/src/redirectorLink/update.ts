import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { LinkRedirectorDynamoDBAdapter } from "@CustomLinkRedirector/core/src/adapters/linkRedirectorDynamoDB";
import { updatePathSchema, updateSchema } from "@CustomLinkRedirector/core/src/schemas/redirectorLinks";
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
      const body = JSON.parse(_evt.body || "{}")
      const bodyValidation = updateSchema.validate(body)
      const pathValidation = updatePathSchema.validate(_evt.pathParameters)
      const error = bodyValidation.error || pathValidation.error;
      if (error) {
        return badRequest(_evt, error)
      }
      const linkRedirector: LinkRedirector = {
          ownerId: process.env.ownerId || "",
          originalUrl: `${process.env.domainName}/${pathValidation.value.code}`,
          redirectUrl: bodyValidation.value.redirectUrl,
          redirectType: 301,
          isActive: bodyValidation.value.isActive,
          updatedAt: Date.now()
      }
      await linkRedirectorAdapter.updateLinkRedirector(linkRedirector)
      return success(_evt, {
        message: "Link redirector successfully updated"
      })
    } catch (error) {
      console.error(error)
      return failure(_evt, error)
    }
  })
}