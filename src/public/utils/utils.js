import {domain} from "../../env/domain.js";
import Taro from "@tarojs/taro";
function api({host=domain.devhost,url,params={},method='GET',callback=undefined}){
    Taro.request({
        url:host+url,
        method:method,
        data:params,
        success:(rsp)=>{
            callback(rsp);
        },
        fail:(error)=>{
            console.error(error);
        }
    });
}
module.exports.api = api;