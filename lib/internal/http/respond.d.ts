import Context from "./context";
export interface ISuccessResponse {
    code: number;
    data: any;
}
export interface IErrorResponse {
    code: number;
    error: string | undefined;
}
declare const Respond: {
    paginatedOK: (context: Context, data: any) => void;
    OK: (context: Context, data?: any) => ISuccessResponse;
    Created: (context: Context, data?: any) => ISuccessResponse;
    Accepted: (context: Context, data?: any) => ISuccessResponse;
    NonAuthoritativeInformation: (context: Context, data?: any) => ISuccessResponse;
    NoContent: (context: Context, data?: any) => ISuccessResponse;
    ResetContent: (context: Context, data?: any) => ISuccessResponse;
    PartialContent: (context: Context, data?: any) => ISuccessResponse;
    MultiStatus: (context: Context, data?: any) => ISuccessResponse;
    AlreadyReported: (context: Context, data?: any) => ISuccessResponse;
    IMUsed: (context: Context, data?: any) => ISuccessResponse;
    MultipleChoices: (context: Context, data?: any) => ISuccessResponse;
    MovedPermanently: (context: Context, data?: any) => ISuccessResponse;
    Found: (context: Context, data?: any) => ISuccessResponse;
    SeeOther: (context: Context, data?: any) => ISuccessResponse;
    NotModified: (context: Context, data?: any) => ISuccessResponse;
    UseProxy: (context: Context, data?: any) => ISuccessResponse;
    SwitchProxy: (context: Context, data?: any) => ISuccessResponse;
    TemporaryRedirect: (context: Context, data?: any) => ISuccessResponse;
    PermanentRedirect: (context: Context, data?: any) => ISuccessResponse;
    BadRequest: (context: Context, error?: any) => IErrorResponse;
    Unauthorized: (context: Context, error?: any) => IErrorResponse;
    PaymentRequired: (context: Context, error?: any) => IErrorResponse;
    Forbidden: (context: Context, error?: any) => IErrorResponse;
    NotFound: (context: Context, error?: any) => IErrorResponse;
    MethodNotAllowed: (context: Context, error?: any) => IErrorResponse;
    NotAcceptable: (context: Context, error?: any) => IErrorResponse;
    ProxyAuthenticationRequired: (context: Context, error?: any) => IErrorResponse;
    RequestTimeout: (context: Context, error?: any) => IErrorResponse;
    Conflict: (context: Context, error?: any) => IErrorResponse;
    Gone: (context: Context, error?: any) => IErrorResponse;
    LengthRequired: (context: Context, error?: any) => IErrorResponse;
    PreconditionFailed: (context: Context, error?: any) => IErrorResponse;
    PayloadTooLarge: (context: Context, error?: any) => IErrorResponse;
    URITooLong: (context: Context, error?: any) => IErrorResponse;
    UnsupportedMediaType: (context: Context, error?: any) => IErrorResponse;
    RangeNotSatisfiable: (context: Context, error?: any) => IErrorResponse;
    ExpectationFailed: (context: Context, error?: any) => IErrorResponse;
    ImATeapot: (context: Context, error?: any) => IErrorResponse;
    MisdirectedRequest: (context: Context, error?: any) => IErrorResponse;
    UnprocessableEntity: (context: Context, error?: any) => IErrorResponse;
    Locked: (context: Context, error?: any) => IErrorResponse;
    FailedDependency: (context: Context, error?: any) => IErrorResponse;
    TooEarly: (context: Context, error?: any) => IErrorResponse;
    UpgradeRequired: (context: Context, error?: any) => IErrorResponse;
    PreconditionRequired: (context: Context, error?: any) => IErrorResponse;
    TooManyRequests: (context: Context, error?: any) => IErrorResponse;
    RequestHeaderFieldsTooLarge: (context: Context, error?: any) => IErrorResponse;
    UnavailableForLegalReasons: (context: Context, error?: any) => IErrorResponse;
    InternalServerError: (context: Context, error?: any) => IErrorResponse;
    NotImplemented: (context: Context, error?: any) => IErrorResponse;
    BadGateway: (context: Context, error?: any) => IErrorResponse;
    ServiceUnavailable: (context: Context, error?: any) => IErrorResponse;
    GatewayTimeout: (context: Context, error?: any) => IErrorResponse;
    HTTPVersionNotSupported: (context: Context, error?: any) => IErrorResponse;
    VariantAlsoNegotiates: (context: Context, error?: any) => IErrorResponse;
    InsufficientStorage: (context: Context, error?: any) => IErrorResponse;
    LoopDetected: (context: Context, error?: any) => IErrorResponse;
    NotExtended: (context: Context, error?: any) => IErrorResponse;
    NetworkAuthenticationRequired: (context: Context, error?: any) => IErrorResponse;
};
export default Respond;
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
