/**
 * Author      : Jefri Herdi Triyanto
 * Description : fungsional untuk kebutuhan enkripsi
 */

const crypto = require('crypto');

const encryption = {

    /**
   * Base64 encode
   * @param {string} string
   * @returns
   */
    base64encode: (string) => {
        return Buffer.from(string).toString('base64');
    },

    /**
   * Base64 decode
   * @param {string} string
   * @returns
   */
    base64decode: (string) => {
        return Buffer.from(string, 'base64').toString('ascii');
    },

    /**
   * AES256 encode
   * @param {string} password_encrypt
   * @param {string} value
   * @returns
   */
    AES256_encode: (password_encrypt, value) => {
        const cipher = crypto.createCipher('aes256', password_encrypt);
        return cipher.update(value, 'utf8', 'hex') + cipher.final('hex');
    },

    /**
   * AES256 decode
   * @param {string} password_encrypt
   * @param {string} encrypted
   * @returns
   */
    AES256_decode: (password_encrypt, encrypted) => {
        const decipher = crypto.createDecipher('aes256', password_encrypt);
        return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    },

    /**
   * RSA PKCS1 OAEP encode
   * @param {string} publicKey
   * @param {string} string
   * @returns
   */
    RSA_PKCS1_OAEP_encode: (publicKey, string) => {
        return crypto
            .publicEncrypt(
                { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
                Buffer.from(string, 'utf8')
            )
            .toString('base64');
    },

    /**
   * RSA PKCS1 OAEP decode
   * @param {string} publicKey
   * @param {string} encrypted_string
   * @returns
   */
    RSA_PKCS1_OAEP_decode: (publicKey, encrypted_string) => {
        return crypto
            .privateDecrypt(
                { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
                Buffer.from(encrypted_string, 'base64')
            )
            .toString('utf8');
    },

    /**
   * get random hex with length
   * @param {number} length
   * @returns
   */
    randomHEX: (length) => {
        return crypto.randomBytes(parseInt(length, 10)).toString('hex');
    },
};

module.exports = encryption;
