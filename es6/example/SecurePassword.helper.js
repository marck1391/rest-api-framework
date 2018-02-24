import { createCipher, createDecipher, randomBytes } from 'crypto';
function salt(length) {
    return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}
export function hash(password, secret, saltlength = 10) {
    var hash = createCipher('aes192', secret);
    var d = hash.update(password + salt(saltlength), 'utf8', 'hex');
    return d + hash.final('hex');
}
export function compare(password, hash, secret, saltlength = 10) {
    var dec = createDecipher('aes192', secret);
    var d = dec.update(hash, 'hex', 'utf8');
    var final = d + dec.final('utf8');
    return password === final.slice(0, final.length - saltlength);
}
