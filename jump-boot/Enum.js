/**
 * Author      : Jefri Herdi Triyanto
 * Description : menyimpan konstanta default yang akan digunakan oleh semua lapisan code
 */

const Methods = {
    ALL: '*',
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
    OPTIONS: 'OPTIONS',
    HEAD: 'HEAD',
};

const MethodAvailable = [
    'AllMapping',
    'GetMapping',
    'PostMapping',
    'PutMapping',
    'DeleteMapping',
    'PatchMapping',
    'OptionsMapping',
    'HeadMapping',
];

const StatusCode = {
    INFO: {
        // 1xx Information Responses
        CONTINUE: 100,
        SWITCHING_PROTOCOLS: 101,
        PROCESSING: 102,
        EARLY_HINTS: 103,
    },
    SUCCESS: {
        // 2xx Successful Responses
        OK: 200,
        CREATED: 201,
        ACCEPTED: 202,
        NON_AUTHORITATIVE_INFORMATION: 203,
        NO_CONTENT: 204,
        RESET_CONTENT: 205,
        PARTIAL_CONTENT: 206,
        MULTI_STATUS: 207,
        ALREADY_REPORTED: 208,
        THIS_IS_FINE: 218, // Apache Web Server
        IM_USED: 226,
    },
    REDIRECT: {
        // 3xx Redirection Messages
        MULTIPLE_CHOICES: 300,
        MOVED_PERMANENTLY: 301,
        FOUND: 302,
        SEE_OTHER: 303,
        NOT_MODIFIED: 304,
        USE_PROXY: 305,
        SWITCH_PROXY: 306,
        TEMPORARY_REDIRECT: 307,
        PERMANENT_REDIRECT: 308,
    },
    CLIENT: {
        // 4xx Client Error Responses
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        PAYMENT_REQUIRED: 402,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        METHOD_NOT_ALLOWED: 405,
        NOT_ACCEPTABLE: 406,
        PROXY_AUTHENTICATION_REQUIRED: 407,
        REQUEST_TIMEOUT: 408,
        CONFLICT: 409,
        GONE: 410,
        LENGTH_REQUIRED: 411,
        PRECONDITION_FAILED: 412,
        PAYLOAD_TOO_LARGE: 413,
        URI_TOO_LONG: 414,
        UNSUPPORTED_MEDIA_TYPE: 415,
        RANGE_NOT_SATISFIABLE: 416,
        EXPECTATION_FAILED: 417,
        IM_A_TEAPOT: 418,
        PAGE_EXPIRED: 419, // Laravel Framework
        METHOD_FAILURE: 420, // Spring Framework
        MISDIRECTED_REQUEST: 421,
        UNPROCESSABLE_ENTITY: 422,
        LOCKED: 423,
        FAILED_DEPENDENCY: 424,
        TOO_EARLY: 425,
        UPGRADE_REQUIRED: 426,
        PRECONDITION_REQUIRED: 428,
        TOO_MANY_REQUEST: 429,
        // eslint-disable-next-line id-length
        REQUEST_HEADERS_FIELDS_TOO_LARGE_SHOPIFY: 430, // Shopify
        REQUEST_HEADERS_FIELDS_TOO_LARGE: 431,
        LOGIN_TIME_OUT: 440, // IIS
        NO_RESPONSE: 449, // NGINX
        RETRY_WITH: 449, // IIS
        // eslint-disable-next-line id-length
        BLOCKED_BY_WINDOWS_PARENTAL_CONTROLS: 450, // Microsoft
        UNAVAILABLE_FOR_LEGAL_REASONS: 451,
        CLIENT_CLOSED_CONNECTION: 460, // AWS ELB
        REQUEST_HEADER_TOO_LARGE: 494, // NGINX
        SSL_CERTIFICATE_ERROR: 495, // NGINX
        SSL_CERTIFICATE_REQUIRED: 496, // NGINX
        HTTP_REQUEST_SENT_TO_HTTPS_PORT: 497, // NGINX
        CLIENT_CLOSED_REQUEST: 499, // NGINX
    },
    SERVER: {
        // 5xx Server Error responses
        INTERNAL_SERVER_ERROR: 500,
        NOT_IMPLEMENTED: 501,
        BAD_GATEWAY: 502,
        SERVICE_UNAVAILABLE: 503,
        GATEWAY_TIMEOUT: 504,
        HTTP_VERSION_NOT_SUPPORTED: 505,
        VARIANT_ALSO_NEGOTIATES: 506,
        INSUFFICIENT_STORAGE: 507,
        LOOP_DETECTED: 508,
        BANDWIDTH_LIMIT_EXCEEDED: 509, // Apache Web Server
        NOT_EXTENDED: 510,
        NETWORK_AUTHENTICATION_REQUIRED: 511,
        // eslint-disable-next-line id-length
        WEB_SERVER_RETURNED_AN_UNKNOWN_ERROR: 520, // Cloudflare
        WEB_SERVER_IS_DOWN: 521, // Cloudflare
        CONNECTION_TIME_OUT: 522, // Cloudflare
        ORIGIN_IS_UNREACHABLE: 523, // Cloudflare
        A_TIMEOUT_OCCURRED: 524, // Cloudflare
        SSL_HANDSHAKE_FAILED: 525, // Cloudflare
        INVALID_SSL_CERTIFICATE: 526, // Cloudflare
        RAILGUN_ERROR: 527, // Cloudflare
        UNAUTHORIZED: 561, // AWS ELB
    },
};

const HeadersMetaDefaultConstant = {
    //
    HEADER_HOST: 'host',
    HEADER_POWERED_BY: 'x-powered-by',
    HEADER_FORWARD_FOR: 'x-forwarded-for',
    HEADER_USER_AGENT: 'user-agent',
    HEADER_CONTENT_TYPE: 'content-type',
    HEADER_CONTENT_LENGTH: 'content-length',
    // eslint-disable-next-line id-length
    HEADER_ACCESS_CONTROL_ALLOW_CREDENTIALS: 'access-control-allow-credentials',
};

const SocketEvents = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    INIT: 'init',
    USER_ACTION: 'user_action',
    REQUEST_MESSAGE: 'request_message',
    TYPING: 'typing',
    MESSAGE: 'message',
};

// ========================================================== //

module.exports = {
    Methods,
    MethodAvailable,
    StatusCode,
    HeadersMetaDefaultConstant,
    SocketEvents,
};
