import { APIGatewayProxyEventV2WithLambdaAuthorizer } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const authHeader = event.headers.authorization;

  let username, password;
  if (authHeader) {
    const base64Info = authHeader.split(" ")[1];
    const userInfo = Buffer.from(base64Info, "base64").toString();
    [username, password] = userInfo.split(":");
  }
  const isAuthorized = username === process.env.username && password === process.env.password
  return {
    isAuthorized,
    context: {
      username,
    },
  };
};