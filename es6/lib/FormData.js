import { mkdirSync, existsSync, createWriteStream, unlink } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import * as formidable from 'formidable';
import guuid from './Guuid';
export function multipart(tempDir = './temp') {
    if (!existsSync(tempDir))
        mkdirSync(tempDir);
    return function (req, res, next) {
        if (req._body)
            return next();
        if (req.method != 'POST')
            return next();
        var contentType = req.headers['content-type'] || '';
        if (!contentType.includes('multipart/form-data'))
            return next();
        var form = new formidable.IncomingForm();
        form.uploadDir = tempDir;
        form.multiples = true;
        var toDelete = [];
        onFinished(res, function () {
            toDelete.forEach(path => {
                unlink(path, () => { });
            });
        });
        form.parse(req, function (err, fields, files) {
            if (err)
                return next(err);
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
export function binary(tempDir = './temp') {
    if (!existsSync(tempDir))
        mkdirSync(tempDir);
    return function (req, res, next) {
        if (req.method == 'GET' || req._body || !req.readable || !req.headers['content-length'] || req.headers['content-length'] == 0)
            return next();
        var binaryData = {
            length: req.headers['content-length'],
            type: req.headers['content-type'] || 'binary',
            path: join(tempDir, generateName())
        };
        var ws = createWriteStream(binaryData.path, { encoding: 'binary' });
        req.pipe(ws);
        onFinished(res, function () {
            unlink(binaryData.path, () => { });
        });
        var error = false;
        req.on('end', function () {
            if (error)
                return;
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
    return 'Binary_' + createHash('md5').update(guuid()).digest('hex');
}
function onFinished(res, cb) {
    var finished = false;
    var end = res.end;
    res.end = function (...args) {
        end.call(res, ...args);
        !finished && cb();
        finished = true;
    };
    res.req.on('close', function () {
        !finished && cb();
        finished = true;
    });
}
