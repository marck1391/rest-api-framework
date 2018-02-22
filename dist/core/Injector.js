'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.RouteInjector = RouteInjector;
exports.ClassInjector = ClassInjector;

var _GetParamNames = require('./GetParamNames');

var _GetParamNames2 = _interopRequireDefault(_GetParamNames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function modifyArgs(params, _ref) {
    var req = _ref.req,
        res = _ref.res;

    var args = [];
    var objects = {
        'Request': req,
        'Response': res,
        'Headers': req.headers,
        'Params': req.params,
        'Query': req.query,
        'Body': req.body,
        'Session': req.session,
        'Files': req.files
    };
    var customTypes = {
        header: req.headers
    };
    var paramValues = ['Number', 'String', 'Object', 'Boolean', 'Array'];
    params.forEach(function (param, i) {
        if (objects.hasOwnProperty(param.type)) {
            args.push(objects[param.type]);
        } else if (customTypes.hasOwnProperty(param.type)) {
            args.push(customTypes[param.type][param.name]);
        } else if (paramValues.indexOf(param.type) > -1) {
            var val = req.params[param.name] || req.body[param.name] || req.query[param.name] || req.headers[param.name];
            if (param.type == 'Number' && !isNaN(val)) {
                return args.push(parseInt(val));
            } else if (param.type == 'Array' && Array.isArray(val)) {
                return args.push(val);
            } else if (param.type == 'Boolean' && (val == 'false' || val == 'true')) {
                return args.push(val == 'false' ? false : val == 'true' ? true : val);
            } else if (param.type == 'Object') {
                return args.push(val);
            } else if (param.type.toLowerCase() != (typeof val === 'undefined' ? 'undefined' : _typeof(val))) {
                //TODO: HTTP Error Code: 412 Precondition Failed
                throw Error('Param \'' + param.name + '\' is not of type ' + param.type);
            }
            args.push(val);
        } else {
            args.push(undefined);
        }
    });
    return args;
}
function RouteInjector(target, key) {
    var params = (0, _GetParamNames2.default)(target[key]);
    var types = Reflect.getMetadata('design:paramtypes', target, key);
    var customtypes = Reflect.getMetadata('argtypes', target, key);
    params = types.map(function (type, i) {
        var ct = {};
        if (customtypes) {
            ct = customtypes.filter(function (ct) {
                return ct.arg == i;
            }).pop() || {};
        }
        return { name: params[i], type: ct.type || type.name };
    });
    return function (req, res, next) {
        var newArgs = modifyArgs(params, { req: req, res: res });
        var result = target.constructor.prototype[key].apply(this, newArgs);
        //TODO: Async function Observable
        if (res._header) return;
        if (result !== undefined) {
            if (result instanceof Promise) {
                result.then(function (r) {
                    if (res._header) return;
                    if (typeof r == 'boolean') r = { success: r };
                    res.send(r || {}); //TODO: contenttype on router decorator
                }).catch(next);
            } else {
                if (typeof result == 'boolean') result = { success: result };
                res.send(result || {});
            }
        }
    };
}
function ClassInjector(target) {
    var types = Reflect.getOwnMetadata('design:paramtypes', target);
    //if(!types) throw new Error('Undeclared constructor')
    var args = [];
    (types || []).forEach(function (type) {
        var instance = Reflect.getOwnMetadata('instance', type);
        if (instance) {
            args.push(instance);
        } else {
            args.push(null);
        }
    });
    return args;
}