/**
 * Author      : Jefri Herdi Triyanto
 * Description : untuk security
 */

const jwt = require('jsonwebtoken');
const { StatusCode } = require('./Enum');
const { log } = require('./Styles');

const tokenList = {}; // save all token register

const JwtValidate = (req, res, next) => {
    const authentication =
        req.headers.authentication !== undefined && String(req.headers.authentication).startsWith('Bearer ') ?
            String(req.headers.authentication).split(' ')[1] :
            false;
    const authorization =
        req.headers.authorization !== undefined && String(req.headers.authorization).startsWith('Bearer ') ?
            String(req.headers.authorization).split(' ')[1] :
            false;
    // console.log({ headers: req.headers, authentication, authorization }); // debug
    // eslint-disable-next-line max-len
    const token =
        authentication ||
        authorization ||
        req.headers['x-access-token'] ||
        req.body.token ||
        req.query.token;
    // decode token
    if (token) {
        // verifies secret and checks exp
        return jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
            if (err) {
                // eslint-disable-next-line max-len
                return res
                    .status(StatusCode.CLIENT.UNAUTHORIZED)
                    .json({ message: 'Unauthorized access.' });
            }
            req.jwt_decoded = decoded;
            return next();
        });
    }
    // if there is no token
    // return an error
    return res.status(StatusCode.CLIENT.FORBIDDEN).send({
        message: 'No token provided.',
    });
};

/**
 * create JWT and get token with refreshToken
 * @param {*} value any value to encrypt data
 * @param {number} expired_token how long you can use it
 * @param {number} expired_refresh_token how long you can use it
 * @returns {string}
 */
function createTokenLogin(value, expired_token, expired_refresh_token, notSaved = false) {
    if (!process.env.JWT_TOKEN) {
        log.warning('SYSTEM', 'please add "JWT_TOKEN" in .env');
        process.exit(1);
    }
    if (!process.env.JWT_REFRESH_TOKEN) {
        log.warning('SYSTEM', 'please add "JWT_REFRESH_TOKEN" in .env');
        process.exit(1);
    }
    const token = jwt.sign(value, process.env.JWT_TOKEN, {
        expiresIn: expired_token,
    });
    const refreshToken = jwt.sign(value, process.env.JWT_REFRESH_TOKEN, {
        expiresIn: expired_refresh_token,
    });
    const response = {
        value,
        token,
        refreshToken,
    };
    if (!notSaved) {
        tokenList[refreshToken] = response; // add new
    }
    return response;
}

/**
 * update JWT with refreshToken
 * @param {*} value any value to encrypt data
 * @param {number} expired how long you can use it
 * @returns {string}
 */
function updateToken(refreshToken, expired) {
    if (!process.env.JWT_TOKEN) {
        log.warning('SYSTEM', 'please add "JWT_TOKEN" in .env');
        process.exit(1);
    }
    if (refreshToken in tokenList) {
        const token = jwt.sign(tokenList[refreshToken].value, process.env.JWT_TOKEN, {
            expiresIn: expired,
        });
        tokenList[refreshToken].token = token; // refresh
        return token;
    }
    return false;
}

/**
 * auto generate JWT single token
 * @param {*} value any value to encrypt data
 * @param {number} expired how long you can use it
 * @returns {string}
 */
function generateSingleTokenJwt(value, expired) {
    if (!process.env.JWT_TOKEN) {
        log.warning('SYSTEM', 'please add "JWT_TOKEN" in .env');
        process.exit(1);
    }
    return jwt.sign(value, process.env.JWT_TOKEN, { expiresIn: expired });
}

module.exports = {
    JwtValidate,
    management: {
        // to Controller
        // JWT Management
        createTokenLogin,
        updateToken,
        generateSingleTokenJwt,

        // value
        valueOneDay: 24 * 60 * 60, // 86400
        valueOneHour: 60 * 60, // 3600
        valueOneMinute: 60,
        tokenList,
    },
};
