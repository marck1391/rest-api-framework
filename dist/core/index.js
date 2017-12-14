import 'reflect-metadata';
import { Router } from 'express';
import { RouteInjector, ClassInjector } from './Injector';
import { join } from 'path';
export function Controller(constructor) {
    var _class = Reflect.getMetadata('instance', constructor);
    if (!_class) {
        var args = ClassInjector(constructor);
        _class = new constructor(...args);
        Reflect.defineMetadata('instance', _class, constructor);
    }
    var _router = Router();
    Reflect.defineMetadata('router', _router, constructor);
    var methods = Reflect.getMetadata('methods', constructor);
    methods.forEach(({ route, type, fn, middlewares }) => {
        var args = [route];
        if (middlewares.length > 0) {
            args = [route, ...middlewares];
        }
        args.push(fn.bind(_class));
        _router[type.toLowerCase()](...args);
    });
    if (_class.error) {
        /*_router.use(function(req, res, next){
            //TODO: Default _app.error404
            res.send('Error 404')
        })*/
        _router.use(function (err, req, res, next) {
            res.send(_class.error(err));
        });
    }
}
export function Get(path = null, { middlewares } = {}) {
    return RouteDecorator('GET', path, middlewares);
}
export function Post(path = null, { middlewares } = {}) {
    return RouteDecorator('POST', path, middlewares);
}
function RouteDecorator(type, path, middlewares = []) {
    return function (target, key, descriptor) {
        var methods = Reflect.getMetadata('methods', target.constructor);
        if (!methods) {
            methods = [];
            Reflect.defineMetadata('methods', methods, target.constructor);
        }
        methods.push({
            route: (path || key).replace(/^\/?(.*)/, '/$1'),
            type: type,
            fn: RouteInjector(target, key),
            middlewares: middlewares
        });
    };
}
export function Service(constructor) {
    var _class = Reflect.getMetadata('instance', constructor);
    if (!_class) {
        var args = ClassInjector(constructor);
        var _class = new constructor(...args);
        Reflect.defineMetadata('instance', _class, constructor);
    }
}
var env = process.env.NODE_ENV || '';
var envFile = join(process.cwd(), './environments/environment.json');
if (env.toLowerCase().includes('production')) {
    envFile = join(process.cwd(), './environments/environment.prod.json');
}
export const environment = require(envFile);
//# sourceMappingURL=index.js.map