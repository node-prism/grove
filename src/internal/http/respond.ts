import { isNativeError } from "node:util/types";
import Context from "./context";

export interface ISuccessResponse {
  code: number;
  data: any;
}

export interface IErrorResponse {
  code: number;
  error: string | undefined;
}

interface IPaginatedResponse extends ISuccessResponse {
  page: number;
  total_pages: number;
  total_items: number;
}

enum Status {
  OK = 200,
  Created = 201,
  Accepted = 202,
  NonAuthoritativeInformation = 203,
  NoContent = 204,
  ResetContent = 205,
  PartialContent = 206,
  MultiStatus = 207,
  AlreadyReported = 208,
  IMUsed = 226,

  MultipleChoices = 300,
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,
  UseProxy = 305,
  SwitchProxy = 306,
  TemporaryRedirect = 307,
  PermanentRedirect = 308,

  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  ProxyAuthenticationRequired = 407,
  RequestTimeout = 408,
  Conflict = 409,
  Gone = 410,
  LengthRequired = 411,
  PreconditionFailed = 412,
  PayloadTooLarge = 413,
  URITooLong = 414,
  UnsupportedMediaType = 415,
  RangeNotSatisfiable = 416,
  ExpectationFailed = 417,
  ImATeapot = 418,
  MisdirectedRequest = 421,
  UnprocessableEntity = 422,
  Locked = 423,
  FailedDependency = 424,
  TooEarly = 425,
  UpgradeRequired = 426,
  PreconditionRequired = 428,
  TooManyRequests = 429,
  RequestHeaderFieldsTooLarge = 431,
  UnavailableForLegalReasons = 451,

  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
  HTTPVersionNotSupported = 505,
  VariantAlsoNegotiates = 506,
  InsufficientStorage = 507,
  LoopDetected = 508,
  NotExtended = 510,
  NetworkAuthenticationRequired = 511,
}

const Respond = {
  paginatedOK: createPaginatedResponder(),

  OK: createResponder(Status.OK),
  Created: createResponder(Status.Created),
  Accepted: createResponder(Status.Accepted),
  NonAuthoritativeInformation: createResponder(Status.NonAuthoritativeInformation),
  NoContent: createResponder(Status.NoContent),
  ResetContent: createResponder(Status.ResetContent),
  PartialContent: createResponder(Status.PartialContent),
  MultiStatus: createResponder(Status.MultiStatus),
  AlreadyReported: createResponder(Status.AlreadyReported),
  IMUsed: createResponder(Status.IMUsed),

  MultipleChoices: createResponder(Status.MultipleChoices),
  MovedPermanently: createResponder(Status.MovedPermanently),
  Found: createResponder(Status.Found),
  SeeOther: createResponder(Status.SeeOther),
  NotModified: createResponder(Status.NotModified),
  UseProxy: createResponder(Status.UseProxy),
  SwitchProxy: createResponder(Status.SwitchProxy),
  TemporaryRedirect: createResponder(Status.TemporaryRedirect),
  PermanentRedirect: createResponder(Status.PermanentRedirect),

  BadRequest: createErrorResponder(Status.BadRequest),
  Unauthorized: createErrorResponder(Status.Unauthorized),
  PaymentRequired: createErrorResponder(Status.PaymentRequired),
  Forbidden: createErrorResponder(Status.Forbidden),
  NotFound: createErrorResponder(Status.NotFound),
  MethodNotAllowed: createErrorResponder(Status.MethodNotAllowed),
  NotAcceptable: createErrorResponder(Status.NotAcceptable),
  ProxyAuthenticationRequired: createErrorResponder(Status.ProxyAuthenticationRequired),
  RequestTimeout: createErrorResponder(Status.RequestTimeout),
  Conflict: createErrorResponder(Status.Conflict),
  Gone: createErrorResponder(Status.Gone),
  LengthRequired: createErrorResponder(Status.LengthRequired),
  PreconditionFailed: createErrorResponder(Status.PreconditionFailed),
  PayloadTooLarge: createErrorResponder(Status.PayloadTooLarge),
  URITooLong: createErrorResponder(Status.URITooLong),
  UnsupportedMediaType: createErrorResponder(Status.UnsupportedMediaType),
  RangeNotSatisfiable: createErrorResponder(Status.RangeNotSatisfiable),
  ExpectationFailed: createErrorResponder(Status.ExpectationFailed),
  ImATeapot: createErrorResponder(Status.ImATeapot),
  MisdirectedRequest: createErrorResponder(Status.MisdirectedRequest),
  UnprocessableEntity: createErrorResponder(Status.UnprocessableEntity),
  Locked: createErrorResponder(Status.Locked),
  FailedDependency: createErrorResponder(Status.FailedDependency),
  TooEarly: createErrorResponder(Status.TooEarly),
  UpgradeRequired: createErrorResponder(Status.UpgradeRequired),
  PreconditionRequired: createErrorResponder(Status.PreconditionRequired),
  TooManyRequests: createErrorResponder(Status.TooManyRequests),
  RequestHeaderFieldsTooLarge: createErrorResponder(Status.RequestHeaderFieldsTooLarge),
  UnavailableForLegalReasons: createErrorResponder(Status.UnavailableForLegalReasons),

  InternalServerError: createErrorResponder(Status.InternalServerError),
  NotImplemented: createErrorResponder(Status.NotImplemented),
  BadGateway: createErrorResponder(Status.BadGateway),
  ServiceUnavailable: createErrorResponder(Status.ServiceUnavailable),
  GatewayTimeout: createErrorResponder(Status.GatewayTimeout),
  HTTPVersionNotSupported: createErrorResponder(Status.HTTPVersionNotSupported),
  VariantAlsoNegotiates: createErrorResponder(Status.VariantAlsoNegotiates),
  InsufficientStorage: createErrorResponder(Status.InsufficientStorage),
  LoopDetected: createErrorResponder(Status.LoopDetected),
  NotExtended: createErrorResponder(Status.NotExtended),
  NetworkAuthenticationRequired: createErrorResponder(Status.NetworkAuthenticationRequired),
};

export default Respond;

// function generateResponses() {
//   Object.keys(Status)
//     .filter(str => Status[str] >= 200 && Status[str] < 300)
//     .map(str => respond[str] = createSuccessResponder(Status[str]));
//
//   Object.keys(Status)
//     .filter(str => Status[str] >= 400 && Status[str] < 500)
//     .map(str => respond[str] = createErrorResponder(Status[str]));
// }

function createPaginatedResponder() {
  const status = 200;
  return (context: Context, data: any) => {
    context.res.status(status);
  }
}

function createResponder(status: Status) {
  return (context: Context, data?: any): ISuccessResponse => {
    context.res.status(status);

    context.res.json({ code: status, data });

    return { code: status, data };
  }
}

function createErrorResponder(status: Status) {
  return (context: Context, error?: any): IErrorResponse => {
    context.res.status(status);

    if (error && isNativeError(error)) {
      error = error.message;
    }

    context.res.json({ code: status, error });

    return { code: status, error };
  }
}

/**
 * a `respond` must be returned from a handler. the object returned
 * by, e.g., `respond.OK` is sent via context. if it's not returned,
 * there's nothing to respond with.
 *
 * usage:
 *
 * async handler(c: Context, @from.path("id") id: number) {
 *   try {
 *     const thing = await service.GetThingById(id);
 *     return respond.OK(c, thing);
 *   } catch (e) {
 *     return respond.InternalServerError(c, e);
 *   }
 *   
 * }
 */

