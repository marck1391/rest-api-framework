import getParamNames from './GetParamNames';
function modifyArgs(params, { req, res }) {
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
    params.forEach((param, i) => {
        if (objects.hasOwnProperty(param.type)) {
            args.push(objects[param.type]);
        }
        else if (customTypes.hasOwnProperty(param.type)) {
            args.push(customTypes[param.type][param.name]);
        }
        else if (paramValues.indexOf(param.type) > -1) {
            var val = req.params[param.name] ||
                req.body[param.name] ||
                req.query[param.name] ||
                req.headers[param.name];
            if (param.type == 'Number' && !isNaN(val)) {
                return args.push(parseInt(val));
            }
            else if (param.type == 'Array' && Array.isArray(val)) {
                return args.push(val);
            }
            else if (param.type == 'Boolean' && (val == 'false' || val == 'true')) {
                return args.push(val == 'false' ? false : val == 'true' ? true : val);
            }
            else if (param.type == 'Object') {
                return args.push(val);
            }
            else if (param.type.toLowerCase() != typeof val) {
                //TODO: HTTP Error Code: 412 Precondition Failed
                throw Error(`Param '${param.name}' is not of type ${param.type}`);
            }
            args.push(val);
        }
        else {
            args.push(undefined);
        }
    });
    return args;
}
export function RouteInjector(target, key) {
    var params = getParamNames(target[key]);
    var types = Reflect.getMetadata('design:paramtypes', target, key);
    var customtypes = Reflect.getMetadata('argtypes', target, key);
    params = types.map((type, i) => {
        var ct = {};
        if (customtypes) {
            ct = customtypes.filter(ct => ct.arg == i).pop() || {};
        }
        return { name: params[i], type: ct.type || type.name };
    });
    return function (req, res, next) {
        var newArgs = modifyArgs(params, { req, res });
        var result = target.constructor.prototype[key].apply(this, newArgs);
        //TODO: Async function Observable
        if (res._header)
            return;
        if (result !== undefined) {
            if (result instanceof Promise) {
                result.then(r => {
                    if (res._header)
                        return;
                    if (typeof r == 'boolean')
                        r = { success: r };
                    res.send(r || {}); //TODO: contenttype on router decorator
                }).catch(next);
            }
            else {
                if (typeof result == 'boolean')
                    result = { success: result };
                res.send(result || {});
            }
        }
    };
}
export function ClassInjector(target) {
    var types = Reflect.getOwnMetadata('design:paramtypes', target);
    //if(!types) throw new Error('Undeclared constructor')
    var args = [];
    (types || []).forEach(type => {
        var instance = Reflect.getOwnMetadata('instance', type);
        if (instance) {
            args.push(instance);
        }
        else {
            args.push(null);
        }
    });
    return args;
}
