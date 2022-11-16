import { isNativeError } from "node:util/types";
var Status;
(function (Status) {
    Status[Status["OK"] = 200] = "OK";
    Status[Status["Created"] = 201] = "Created";
    Status[Status["Accepted"] = 202] = "Accepted";
    Status[Status["NonAuthoritativeInformation"] = 203] = "NonAuthoritativeInformation";
    Status[Status["NoContent"] = 204] = "NoContent";
    Status[Status["ResetContent"] = 205] = "ResetContent";
    Status[Status["PartialContent"] = 206] = "PartialContent";
    Status[Status["MultiStatus"] = 207] = "MultiStatus";
    Status[Status["AlreadyReported"] = 208] = "AlreadyReported";
    Status[Status["IMUsed"] = 226] = "IMUsed";
    Status[Status["MultipleChoices"] = 300] = "MultipleChoices";
    Status[Status["MovedPermanently"] = 301] = "MovedPermanently";
    Status[Status["Found"] = 302] = "Found";
    Status[Status["SeeOther"] = 303] = "SeeOther";
    Status[Status["NotModified"] = 304] = "NotModified";
    Status[Status["UseProxy"] = 305] = "UseProxy";
    Status[Status["SwitchProxy"] = 306] = "SwitchProxy";
    Status[Status["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    Status[Status["PermanentRedirect"] = 308] = "PermanentRedirect";
    Status[Status["BadRequest"] = 400] = "BadRequest";
    Status[Status["Unauthorized"] = 401] = "Unauthorized";
    Status[Status["PaymentRequired"] = 402] = "PaymentRequired";
    Status[Status["Forbidden"] = 403] = "Forbidden";
    Status[Status["NotFound"] = 404] = "NotFound";
    Status[Status["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    Status[Status["NotAcceptable"] = 406] = "NotAcceptable";
    Status[Status["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    Status[Status["RequestTimeout"] = 408] = "RequestTimeout";
    Status[Status["Conflict"] = 409] = "Conflict";
    Status[Status["Gone"] = 410] = "Gone";
    Status[Status["LengthRequired"] = 411] = "LengthRequired";
    Status[Status["PreconditionFailed"] = 412] = "PreconditionFailed";
    Status[Status["PayloadTooLarge"] = 413] = "PayloadTooLarge";
    Status[Status["URITooLong"] = 414] = "URITooLong";
    Status[Status["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
    Status[Status["RangeNotSatisfiable"] = 416] = "RangeNotSatisfiable";
    Status[Status["ExpectationFailed"] = 417] = "ExpectationFailed";
    Status[Status["ImATeapot"] = 418] = "ImATeapot";
    Status[Status["MisdirectedRequest"] = 421] = "MisdirectedRequest";
    Status[Status["UnprocessableEntity"] = 422] = "UnprocessableEntity";
    Status[Status["Locked"] = 423] = "Locked";
    Status[Status["FailedDependency"] = 424] = "FailedDependency";
    Status[Status["TooEarly"] = 425] = "TooEarly";
    Status[Status["UpgradeRequired"] = 426] = "UpgradeRequired";
    Status[Status["PreconditionRequired"] = 428] = "PreconditionRequired";
    Status[Status["TooManyRequests"] = 429] = "TooManyRequests";
    Status[Status["RequestHeaderFieldsTooLarge"] = 431] = "RequestHeaderFieldsTooLarge";
    Status[Status["UnavailableForLegalReasons"] = 451] = "UnavailableForLegalReasons";
    Status[Status["InternalServerError"] = 500] = "InternalServerError";
    Status[Status["NotImplemented"] = 501] = "NotImplemented";
    Status[Status["BadGateway"] = 502] = "BadGateway";
    Status[Status["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    Status[Status["GatewayTimeout"] = 504] = "GatewayTimeout";
    Status[Status["HTTPVersionNotSupported"] = 505] = "HTTPVersionNotSupported";
    Status[Status["VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
    Status[Status["InsufficientStorage"] = 507] = "InsufficientStorage";
    Status[Status["LoopDetected"] = 508] = "LoopDetected";
    Status[Status["NotExtended"] = 510] = "NotExtended";
    Status[Status["NetworkAuthenticationRequired"] = 511] = "NetworkAuthenticationRequired";
})(Status || (Status = {}));
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
    return (context, data) => {
        context.res.status(status);
    };
}
function createResponder(status) {
    return (context, data) => {
        context.res.status(status);
        context.res.json({ code: status, data });
        return { code: status, data };
    };
}
function createErrorResponder(status) {
    return (context, error) => {
        context.res.status(status);
        if (error && isNativeError(error)) {
            error = error.message;
        }
        context.res.json({ code: status, error });
        return { code: status, error };
    };
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
//# sourceMappingURL=respond.js.map