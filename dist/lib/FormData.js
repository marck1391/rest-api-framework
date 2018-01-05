'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.multipart = multipart;
exports.binary = binary;

var _fs = require('fs');

var _path = require('path');

var _crypto = require('crypto');

var _formidable = require('formidable');

var formidable = _interopRequireWildcard(_formidable);

var _Guuid = require('./Guuid');

var _Guuid2 = _interopRequireDefault(_Guuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function multipart() {
    var tempDir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : './temp';

    if (!(0, _fs.existsSync)(tempDir)) (0, _fs.mkdirSync)(tempDir);
    return function (req, res, next) {
        if (req._body) return next();
        if (req.method != 'POST') return next();
        var contentType = req.headers['content-type'] || '';
        if (!contentType.includes('multipart/form-data')) return next();
        var form = new formidable.IncomingForm();
        form.uploadDir = tempDir;
        form.multiples = true;
        var toDelete = [];
        onFinished(res, function () {
            toDelete.forEach(function (path) {
                (0, _fs.unlink)(path, function () {});
            });
        });
        form.parse(req, function (err, fields, files) {
            if (err) return next(err);
            req._body = true;
            req.body = fields;
            req.files = files;
            for (var i in files) {
                toDelete.push(files[i].path);
            }
            next();
        });
    };
}
function binary() {
    var tempDir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : './temp';

    if (!(0, _fs.existsSync)(tempDir)) (0, _fs.mkdirSync)(tempDir);
    return function (req, res, next) {
        if (req.method == 'GET' || req._body || !req.readable || !req.headers['content-length'] || req.headers['content-length'] == 0) return next();
        var binaryData = {
            length: req.headers['content-length'],
            type: req.headers['content-type'] || 'binary',
            path: (0, _path.join)(tempDir, generateName())
        };
        var ws = (0, _fs.createWriteStream)(binaryData.path, { encoding: 'binary' });
        req.pipe(ws);
        onFinished(res, function () {
            (0, _fs.unlink)(binaryData.path, function () {});
        });
        var error = false;
        req.on('end', function () {
            if (error) return;
            req._body = true;
            req.file = {
                size: binaryData.length,
                path: binaryData.path,
                type: binaryData.type,
                ctime: new Date()
            };
            next();
        }).on('error', function (err) {
            error = true;
            next(err);
        });
    };
}
function generateName() {
    return 'Binary_' + (0, _crypto.createHash)('md5').update((0, _Guuid2.default)()).digest('hex');
}
function onFinished(res, cb) {
    var finished = false;
    var end = res.end;
    res.end = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        end.call.apply(end, [res].concat(args));
        !finished && cb();
        finished = true;
    };
    res.req.on('close', function () {
        !finished && cb();
        finished = true;
    });
}