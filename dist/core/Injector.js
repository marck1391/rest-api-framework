'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RouteInjector = RouteInjector;
exports.ClassInjector = ClassInjector;

var _GetParamNames = require('./GetParamNames');

var _GetParamNames2 = _interopRequireDefault(_GetParamNames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function modifyArgs(params, _ref) {
    var req = _ref.req,
        res = _ref.res;

    var args = [];
    //TODO: Map/Bind string
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
    var paramValues = ['Number', 'String'];
    params.forEach(function (param, i) {
        if (objects.hasOwnProperty(param.type)) {
            args.push(objects[param.type]);
        } else if (customTypes.hasOwnProperty(param.type)) {
            args.push(customTypes[param.type][param.name]);
        } else if (paramValues.indexOf(param.type) > -1) {
            var val = req.params[param.name] || req.body[param.name] || req.query[param.name] || req.headers[param.name];
            val = param.type == 'Number' ? parseInt(val) : val;
            args.push(val);
        } else {
            args.push(null);
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