'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.App = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FormData = require('./FormData');

var _Guuid = require('../lib/Guuid');

var _Guuid2 = _interopRequireDefault(_Guuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var Session = require('express-session');
var helmet = require('helmet');
var logger = require('morgan');

var Router = express.Router;
//TODO: cors:{origin:... maxAge, credentials}
//'.8dKCWQ]4fs/Q!jCu)]Z+4PQ8asFS=t'

var App = exports.App = function () {
    function App(config) {
        _classCallCheck(this, App);

        this.config = config;
        this._routes = config.routes;
        this.express = express();
    }

    _createClass(App, [{
        key: 'init',
        value: function init() {
            var before = this.beforeMiddlewares;
            var after = this.afterMiddlewares;
            before && before(this.express);
            this.middlewares();
            after && after(this.express);
            this.routes();
            this.errorHandlers();
            return this.express;
        }
    }, {
        key: 'middlewares',
        value: function middlewares() {
            var app = this.express;
            var config = this.config;
            app.use(logger('dev'));
            app.use(helmet());
            if (config.cache === false) {
                app.use(helmet.noCache());
            }
            app.use(bodyParser.raw());
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({ extended: true }));
            app.use((0, _FormData.multipart)(config.tmpDir));
            app.use((0, _FormData.binary)(config.tmpDir));
            if (config.cookies) {
                app.use(cookieParser(config.secret));
            }
            if (config.useSessions) {
                var session = Session({
                    secret: this.config.secret,
                    cookie: { maxAge: 25200000 },
                    resave: false,
                    saveUninitialized: true,
                    //store: Session.MemoryStore,
                    name: 'sid',
                    genid: _Guuid2.default
                });
                app.use(session);
            }
            if (config.views) {
                app.set('views', config.views.path);
                app.set('view engine', config.viewEngine);
            }
            if (_typeof(config.static) == 'object' && !Array.isArray(config.static)) {
                if (config.static.route) {
                    app.use(config.static.route, express.static(config.static.path));
                } else {
                    app.use(express.static(config.static.path));
                }
            } else if (Array.isArray(config.static)) {
                config.static.forEach(function (content) {
                    app.use(content.route, express.static(content.path));
                });
            } else if (typeof config.static == 'string') {
                app.use(express.static(config.static));
            }
            if (config.cors) {
                this.cors();
            }
        }
    }, {
        key: 'cors',
        value: function cors() {
            var allow = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            var config = this.config;
            var allowedMethods = 'GET, POST, PUT, DELETE';
            this.express.use(function (req, res, next) {
                var reqOrigin = req.get('origin');
                //TODO: Default origin * > if req.get(origin)==undefined > *
                if (config.allowOrigin) {
                    var origin = config.allowOrigin;
                    if (origin == '*' && config.credentials) {
                        //No wildcard * allowed with credentials flag
                        origin = req.get('origin');
                    } else if (Array.isArray(origin)) {
                        origin = origin.some(function (allowed) {
                            return allowed == reqOrigin;
                        }) ? reqOrigin : false;
                    }
                    res.header('Access-Control-Allow-Origin', origin);
                }
                if (config.credentials) {
                    res.header('Access-Control-Allow-Credentials', 'true');
                }
                //res.header('Content-Security-Policy', "default-src 'self'")
                if (req.method == 'OPTIONS') {
                    //X-Requested-With when crossDomain: false (same origin)
                    //Allow Headers in controllers and application config
                    var defaults = ['X-Requested-With', 'Content-Type'];
                    res.header('Access-Control-Allow-Headers', [].concat(defaults, _toConsumableArray(config.allowHeaders)).join(','));
                    res.header('Access-Control-Allow-Methods', allowedMethods);
                    return res.send(allowedMethods);
                }
                next();
            });
        }
    }, {
        key: 'routes',
        value: function routes() {
            var app = this.express;
            var config = this.config;
            var _router = Router();
            this._routes.forEach(function (_ref) {
                var path = _ref.path,
                    controller = _ref.controller;

                var router = Reflect.getMetadata('router', controller);
                _router.use(path, router);
            });
            app.use(config.endpoint, _router);
        }
    }, {
        key: 'errorHandlers',
        value: function errorHandlers() {
            var app = this.express;
            var error404Handler = this.error404Handler;
            var errorHandler = this.errorHandler;
            app.use(function (req, res, next) {
                if (res._header) return;
                var result = error404Handler && error404Handler(req, res, next) || 'Not found';
                if (result) res.status(404).send(result);
            });
            app.use(function (err, req, res, next) {
                if (res._header) return;
                var result = errorHandler && errorHandler(err, req, res, next) || err;
                res.send(result);
            });
        }
    }]);

    return App;
}();