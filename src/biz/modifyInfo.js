import { api } from '../public/utils/utils';
/**
 * 获取商品详情
 * num_iid 商品id
 */
function getDetail({ id, callback = undefined }){
  api({
    url: '/wx/itemDetail',
    method: 'POST',
    params: {
      num_iid: id
    },
    callback: (res) => {
			if(callback){
				callback(res)
			}
    }
  }) 
}

module.exports = {
    getDetail
}