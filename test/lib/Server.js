'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HttpServer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var http = _interopRequireWildcard(_http);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HttpServer = exports.HttpServer = function () {
    function HttpServer(app, _ref) {
        var port = _ref.port,
            host = _ref.host;

        _classCallCheck(this, HttpServer);

        this.app = app;
        this.port = port || 3000;
        this.host = host || '0.0.0.0';
        this.createServer();
    }

    _createClass(HttpServer, [{
        key: 'createServer',
        value: function createServer() {
            this.server = http.createServer(this.app.express);
        }
    }, {
        key: 'listen',
        value: function listen() {
            var server = this.server.listen(this.port, this.host, function () {
                console.log('Server listening on http://%s:%d', server.address().address, server.address().port);
            });
        }
    }]);

    return HttpServer;
}();
//# sourceMappingURL=Server.js.map