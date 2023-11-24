import { EventDynamoDBAdapter } from "../adapters/events";

export const eventsAdapter = new EventDynamoDBAdapter();

export function success(evt: any, body: any, headers: any = {}, isBase64Encoded: boolean = false) {
  return buildResponse(evt, 200, body, headers, isBase64Encoded);
}

export function failure(evt: any, body: any, headers: any = {}, isBase64Encoded: boolean = false) {
  return buildResponse(evt, 500, {
    message: body.message,
    ...body
  }, headers, isBase64Encoded);
}

export function badRequest(evt: any, body: any, headers: any = {}, isBase64Encoded: boolean = false) {
  return buildResponse(evt, 400, {
    message: body.message,
    ...body
  }, headers, isBase64Encoded);
}

export function accessDenied(evt: any, body: any, headers: any = {}, isBase64Encoded: boolean = false) {
  return buildResponse(evt, 401, {
    message: body.message,
    ...body
  }, headers, isBase64Encoded);
}

export function conflict(evt: any, body: any, headers: any = {}, isBase64Encoded: boolean = false) {
  return buildResponse(evt, 409, {
    message: body.message,
    ...body
  }, headers, isBase64Encoded);
}
export function successList(evt: any, items: any, count: any, scannedCount: any, headers: any = {}, isBase64Encoded: boolean = false) {
  return buildResponse(evt, 200, {items, count, scannedCount}, headers, isBase64Encoded);
}

export function notFound(evt: any, body: any, headers: any = {}, isBase64Encoded: boolean = false) {
  return buildResponse(evt, 404, {
    message: body.message,
    ...body
  }, headers, isBase64Encoded);
}

export function redirect(evt: any, body: any, headers: any = {"content-type": "text/html; charset=utf-8"}, isBase64Encoded: boolean = false) {
  return buildResponse(evt, 301, {
    message: body.message,
    ...body
  }, {...headers, location: body.redirectUrl}, isBase64Encoded);
}

function buildResponse(evt: any, statusCode: number, body: any, headers: any, isBase64Encoded: boolean) {
  const response = {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      ...headers
    },
    body: JSON.stringify(body),
    isBase64Encoded
  }
  eventsAdapter.registerAPIEvent({evt, statusCode, response})
  return response;
}