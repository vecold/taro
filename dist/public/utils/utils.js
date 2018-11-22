"use strict";

var _domain = require("../../env/domain.js");

var _index = require("../../npm/@tarojs/taro-weapp/index.js");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function api(_ref) {
  var _ref$host = _ref.host,
      host = _ref$host === undefined ? _domain.domain.devhost : _ref$host,
      url = _ref.url,
      _ref$params = _ref.params,
      params = _ref$params === undefined ? {} : _ref$params,
      _ref$method = _ref.method,
      method = _ref$method === undefined ? 'GET' : _ref$method,
      _ref$callback = _ref.callback,
      callback = _ref$callback === undefined ? undefined : _ref$callback;

  _index2.default.request({
    url: host + url,
    method: method,
    data: params,
    success: function success(rsp) {
      callback(rsp);
    },
    fail: function fail(error) {
      console.error(error);
    }
  });
}
module.exports.api = api;