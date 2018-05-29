'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.environment = exports.Delete = exports.Put = exports.Get = exports.Post = undefined;
exports.Controller = Controller;
exports.Service = Service;

require('reflect-metadata');

var _express = require('express');

var _Injector = require('./Injector');

var _path = require('path');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function Controller() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return function (constructor) {
        var _class = Reflect.getMetadata('instance', constructor);
        if (!_class) {
            var args = (0, _Injector.ClassInjector)(constructor);
            _class = new (Function.prototype.bind.apply(constructor, [null].concat(_toConsumableArray(args))))();
            Reflect.defineMetadata('instance', _class, constructor);
        }
        var _router = (0, _express.Router)(config);
        Reflect.defineMetadata('router', _router, constructor);
        var methods = Reflect.getMetadata('methods', constructor);
        methods.forEach(function (_ref) {
            var route = _ref.route,
                type = _ref.type,
                fn = _ref.fn,
                middlewares = _ref.middlewares;

            var args = [route];
            if (middlewares.length > 0) {
                args = [route].concat(_toConsumableArray(middlewares));
            }
            args.push(fn.bind(_class));
            _router[type.toLowerCase()].apply(_router, _toConsumableArray(args));
        });
        if (_class.error) {
            /*_router.use(function(req, res, next){
                res.send('Error 404')
            })*/
            _router.use(function (err, req, res, next) {
                res.status(err.status || err.code || 400).send(_class.error(err));
            });
        }
    };
}
function decorate() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        middlewares = _ref2.middlewares;

    return RouteDecorator(this.type, path, middlewares);
}
var Post = exports.Post = decorate.bind({ type: 'POST' });
var Get = exports.Get = decorate.bind({ type: 'GET' });
var Put = exports.Put = decorate.bind({ type: 'PUT' });
var Delete = exports.Delete = decorate.bind({ type: 'DELETE' });
function RouteDecorator(type, path) {
    var middlewares = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    return function (target, key, descriptor) {
        var methods = Reflect.getMetadata('methods', target.constructor);
        if (!methods) {
            methods = [];
            Reflect.defineMetadata('methods', methods, target.constructor);
        }
        methods.push({
            route: (path || key).replace(/^\/?(.*)/, '/$1'),
            type: type,
            fn: (0, _Injector.RouteInjector)(target, key),
            middlewares: middlewares
        });
    };
}
function Service(constructor) {
    var _class = Reflect.getMetadata('instance', constructor);
    if (!_class) {
        var args = (0, _Injector.ClassInjector)(constructor);
        var _class = new (Function.prototype.bind.apply(constructor, [null].concat(_toConsumableArray(args))))();
        Reflect.defineMetadata('instance', _class, constructor);
    }
}
var env = process.env.NODE_ENV || '';
var envFile = (0, _path.join)(process.cwd(), './environments/environment.json');
if (env.toLowerCase().includes('production')) {
    envFile = (0, _path.join)(process.cwd(), './environments/environment.prod.json');
}
var environment = exports.environment = require(envFile);