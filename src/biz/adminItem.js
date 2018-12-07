import {api} from '../public/utils/utils';
function getAdimList({page=0,type,shopId,keyword='',callback=undefined}){
    api({
        url:'/wx/adminItems',
        method:'POST',
        params:{
            type:type,
            shopId:shopId,
            keyword:keyword,
            page:page
        },
        callback:(res)=>{
            if(callback){
                callback(res)
            }
        }
    });
    
}
function syncItem({num_iid='',is_pic=0,is_num=0,callback=undefined}){
    api({
        url:'/wx/sync',
        method:'POST',
        params:{
            num_iid:num_iid,
            is_pic:is_pic,
            is_num:is_num
        },
        callback:(res)=>{
            if(callback){
                callback(res)
            }
        }
    });
}

function getShops({shopid='',callback=undefined}){
    api({
        url:'/wx/getShops',
        method:'POST',
        params:{
            shopid:shopid,
        },
        callback:(res)=>{
            if(callback){
                callback(res)
            }
        }
    });
}
module.exports.getAdimList = getAdimList;
module.exports.syncItem = syncItem;
module.exports.getShops = getShops;