'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Request = exports.Response = exports.Files = exports.Session = exports.Body = exports.Query = exports.Params = exports.Headers = undefined;

var _http = require('http');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//export class Response{[prop: string]:any}
//export class Request{[prop: string]:any}
var Headers = exports.Headers = function Headers() {
  _classCallCheck(this, Headers);
};

var Params = exports.Params = function Params() {
  _classCallCheck(this, Params);
};

var Query = exports.Query = function Query() {
  _classCallCheck(this, Query);
};

var Body = exports.Body = function Body() {
  _classCallCheck(this, Body);
};

var Session = exports.Session = function Session() {
  _classCallCheck(this, Session);
};

var Files = exports.Files = function Files() {
  _classCallCheck(this, Files);
};

var Response = exports.Response = function (_ServerResponse) {
  _inherits(Response, _ServerResponse);

  function Response() {
    _classCallCheck(this, Response);

    return _possibleConstructorReturn(this, (Response.__proto__ || Object.getPrototypeOf(Response)).apply(this, arguments));
  }

  return Response;
}(_http.ServerResponse);

var Request = exports.Request = function (_IncomingMessage) {
  _inherits(Request, _IncomingMessage);

  function Request() {
    _classCallCheck(this, Request);

    return _possibleConstructorReturn(this, (Request.__proto__ || Object.getPrototypeOf(Request)).apply(this, arguments));
  }

  return Request;
}(_http.IncomingMessage);