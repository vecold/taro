"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _domain = require("../../env/domain.js");

var _index = require("../../npm/@tarojs/taro-weapp/index.js");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @author lzy
 * taro 公用类方法
 */
//api请求 host 域名 url 方法 params 参数 method 请求方式 callback 回调函数
function api(_ref) {
  var _ref$host = _ref.host,
      host = _ref$host === undefined ? _domain.domain.zhost : _ref$host,
      url = _ref.url,
      _ref$params = _ref.params,
      params = _ref$params === undefined ? {} : _ref$params,
      _ref$method = _ref.method,
      method = _ref$method === undefined ? 'POST' : _ref$method,
      _ref$callback = _ref.callback,
      callback = _ref$callback === undefined ? undefined : _ref$callback;

  var datatype = method == 'GET' ? 'application/json' : 'application/x-www-form-urlencoded';
  var rd_session = _index2.default.getStorageSync('rd_session');
  // params.rd_session = rd_session;
  params.rd_session = 'EKAs5NlS_Hs6UXbg0mXWtA  ';
  _index2.default.request({
    url: host + url,
    method: method,
    data: params,
    header: {
      'content-type': datatype
    },
    success: function success(rsp) {
      console.log(rsp);
      if (rsp.data.code && rsp.data.code != 200) {
        _index2.default.showToast({ title: rsp.data.value, icon: 'none' });
      } else {
        callback(rsp);
      }
    },
    fail: function fail(error) {
      console.error(error);
    }
  });
}

function IsEmpty(key) {
  if (typeof key === 'string') {
    key = key.replace(/(^\s*)|(\s*$)/g, '');
    if (key == '' || key == null || key == 'null' || key == undefined || key == 'undefined') {
      return true;
    } else {
      return false;
    }
  } else if (typeof key === 'undefined') {
    return true;
  } else if ((typeof key === "undefined" ? "undefined" : _typeof(key)) == 'object') {
    for (var i in key) {
      return false;
    }
    return true;
  } else if (typeof key == 'boolean') {
    return false;
  }
};
module.exports.api = api;
module.exports.IsEmpty = IsEmpty;