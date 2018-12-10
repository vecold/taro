import {api} from '../public/utils/utils';
/**
 * 获取列表
 * shopId 店铺id
 * type 商品状态（push 上架中 defe 下架中 lost 缺货中）
 */
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
//同步商品信息  is_pic是否同步图片 is_num是否同步库存 num_iid商品num_iid
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

//获取店铺信息
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