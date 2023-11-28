import { Duration, RemovalPolicy } from "aws-cdk-lib/core";
import { StackContext, Api, Table, Function, Service } from "sst/constructs";

export function APP({ stack, app }: StackContext) {
  const eventsTable = new Table(stack, "Events", {
    fields: {
      eventHash: 'string',
      eventId: 'string',
      createdAt: 'number'
    },
    primaryIndex: { partitionKey: "eventHash", sortKey: "eventId" },
    cdk: {
      table: {
        removalPolicy: app.stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY
      }
    }
  });

  const urlsTable = new Table(stack, "LinkRedirector", {
    fields: {
      ownerId: 'string',
      originalUrl: 'string',
      createdAt: 'number'
    },
    primaryIndex: { partitionKey: "ownerId", sortKey: "originalUrl" },
    cdk: {
      table: {
        removalPolicy: app.stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY
      }
    }
  });

  const domainName = `sales.${process.env.HOSTED_ZONE}`;
  
  const api = new Api(stack, "api", {
    customDomain: {
      domainName,
      hostedZone: process.env.HOSTED_ZONE
    },
    authorizers: {
      basic: {
        type: "lambda",
        responseTypes: ["simple"],
        function: new Function(stack, "Authorizer", {
          handler: "packages/functions/src/auth/authorizer.handler",
          environment: {
            username: process.env.USERNAME || "",
            password: process.env.PASSWORD || ""
          }
        }),
      }
    },
    defaults: {
      function: {
        bind: [eventsTable, urlsTable],
        environment: {
          ownerId: process.env.OWNER_ID || "",
          domainName,
          notFoundLink: process.env.NOT_FOUND_LINK || "",
          blankLink: process.env.BLANK_LINK || ""
        }
      },
      authorizer: "basic",
    },
    routes: {
      "GET /redirectorlink/{code}": {
        function: {
          handler: "packages/functions/src/redirectorLink/read.handler",
        },
      },
      "GET /redirectorlinks": {
        function: {
          handler: "packages/functions/src/redirectorLink/list.handler",
        },
      },
      "POST /redirectorlink": {
        function: {
          handler: "packages/functions/src/redirectorLink/create.handler",
        },
      },
      "PUT /redirectorlink/{code}": {
        function: {
          handler: "packages/functions/src/redirectorLink/update.handler",
        },
      },
      "DELETE /redirectorlink/{code}": {
        function: {
          handler: "packages/functions/src/redirectorLink/delete.handler",
        },
      },
      "GET /{code}": {
        function: {
          handler: "packages/functions/src/useCases/redirect.handler",
        },
        authorizer: "none"
      },
    },
  });

  const docsService = new Service(stack, "DocService", {
    path: ".",
    file: "./services/Dockerfile",
    port: 80,
    cdk: {
      container: {
        healthCheck: {
          command: ["CMD-SHELL", "curl -f http://localhost || exit 1"],
          interval: Duration.minutes(1),
          retries: 2,
          startPeriod: Duration.minutes(1),
          timeout: Duration.seconds(30),
        },
      },
      applicationLoadBalancerTargetGroup: {
        healthCheck: {
          healthyHttpCodes: "200,301,302",
          path: "/",
        },
      }
    },
    customDomain: {
      domainName: `docs.${app.name}.${app.stage}.${process.env.HOSTED_ZONE}`,
      hostedZone: `${process.env.HOSTED_ZONE}`
    }
  });

  stack.addOutputs({
    eventsTableName: eventsTable.tableName,
    eventsTableArn: eventsTable.tableArn,
    linkRedirectorTableName: urlsTable.tableName,
    linkRedirectorTableArn: urlsTable.tableArn,
    ApiCustomDomain: api.customDomainUrl,
    DocUrl: docsService.customDomainUrl
  });
}
