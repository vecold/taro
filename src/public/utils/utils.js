import {domain} from "../../env/domain.js";
import Taro from "@tarojs/taro";
function api({host=domain.zhost,url,params={},method='POST',callback=undefined}){
    let datatype = method == 'GET' ? 'application/json' : 'application/x-www-form-urlencoded';
    const rd_session = Taro.getStorageSync('rd_session');
    params.rd_session = rd_session;
    Taro.request({
        url:host+url,
        method:method,
        data:params,
        header:{
            'content-type':datatype
        },
        success:(rsp)=>{
            console.log(rsp)
            if(rsp.data.code&&rsp.data.code!=200){
                Taro.showToast({title:rsp.data.value,icon:'none'});
            }else{
                callback(rsp);
            }
        },
        fail:(error)=>{
            console.error(error);
        }
    });
}

function IsEmpty(key) {
    if (typeof (key) === 'string') {
        key = key.replace(/(^\s*)|(\s*$)/g, '');
        if (key == '' || key == null || key == 'null' || key == undefined || key == 'undefined') {
        return true
        } else {
        return false
        }
    } else if (typeof (key) === 'undefined') {
        return true;
    } else if (typeof (key) == 'object') {
        for (let i in key) {
        return false;
        }
        return true;
    } else if (typeof (key) == 'boolean') {
        return false;
    }
};
module.exports.api = api;
module.exports.IsEmpty = IsEmpty;