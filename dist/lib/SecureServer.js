'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HttpSecureServer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _https = require('https');

var https = _interopRequireWildcard(_https);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HttpSecureServer = exports.HttpSecureServer = function () {
    function HttpSecureServer(app, _ref) {
        var port = _ref.port,
            host = _ref.host,
            options = _ref.options;

        _classCallCheck(this, HttpSecureServer);

        this.app = app;
        this.port = port || 443;
        this.host = host || '0.0.0.0';
        this.options = options;
        this.createServer();
    }

    _createClass(HttpSecureServer, [{
        key: 'createServer',
        value: function createServer() {
            var options = this.options;
            /*var options = {
              key: fs.readFileSync('./sslcert/cert.key'),
              cert: fs.readFileSync('./sslcert/cert.crt')
            }*/
            if (!options.key || !options.cert) {
                throw new Error('No credentials set for secure server');
            }
            this.server = https.createServer(options, this.app.express);
        }
    }, {
        key: 'listen',
        value: function listen() {
            var server = this.server.listen(this.port, this.host, function () {
                console.log('Server listening on https://%s:%d', server.address().address, server.address().port);
            });
        }
    }]);

    return HttpSecureServer;
}();