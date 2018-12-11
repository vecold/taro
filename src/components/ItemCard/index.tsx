import Taro, { Component, Config ,Events} from '@tarojs/taro'
import { View,Image,Text,Button,Radio } from '@tarojs/components'
import { IsEmpty } from '../../public/utils/utils.js';
import { syncItem } from '../../biz/adminItem.js'
import './index.scss'
const pic_url = "https://q.aiyongbao.com/wechat/images/";
const events = new Events();
/**
 * @author lzy
 * 商品卡片组件
 * 
 */
export default class ItemCard extends Component {
    constructor () {
        super(...arguments)
        this.state = {
          data:this.props.data, //商品信息
          version:false, //更多信息
          modalV:false, //同步modal
          is_pic:0, //是否跟新图片
          is_num:0, //是否更新库存
          height:700,
          width:750,
        }
      }
    config: Config = {
      
    }
    componentDidMount () { 
      Taro.getSystemInfo({success:(rsp)=>{
        this.setState({height:rsp.screenHeight});
      }})
    }

    componentWillReceiveProps(nextProps){
        if(!IsEmpty(nextProps.data)){
          this.setState({data:nextProps.data});
        }
    }
    syncItems=()=>{
      //同步商品 
       // wx.reportAnalytics('productmanage_sync_click', {
            //     dobean: 0,
            //   });
      let self = this;
      const { is_pic,is_num,data } = this.state;
      this.setState({modalV:false});
      if(is_pic==0&&is_num==0){
        return;
      }
     
      Taro.showLoading({
        title:'同步中',
        mask:true,
      });
      //修改当前data 
      syncItem({
        num_iid:data.num_iid,
        is_pic:is_pic?1:0,
        is_num:is_num?1:0,
        callback:(rsp)=>{
          Taro.hideLoading();
          Taro.showToast({title:'同步完成'})

          let newdata = JSON.parse(JSON.stringify(data));
          //更新主库
          if(IsEmpty(rsp.data.num)){
            newdata.num = 0;
          }else{
            newdata.num = rsp.data.num;
          }
          //sku库
          newdata.skus = [];
          if(!IsEmpty(rsp.data.skus)){
            for(let i in rsp.data.skus){
              newdata.skus.push({defect_num:rsp.data.skus[i].amountOnSale});
            }
          }
          self.setState({data:newdata});
        }
      });
    }
    
    showVer=()=>{
      //更多信息 
      // wx.reportAnalytics('productmanage_productcard_click', {
            //     dobean: 0,
            //   });
      this.setState({version:!this.state.version});
    }
    
    showModal=(id)=>{
      //展现modal 
      let self = this;
      Taro.getSystemInfo({success:(rsp)=>{
        console.log(rsp.platform,id);
        Taro.eventCenter.trigger('showModal',id);
        Taro.eventCenter.on(`sync${id}`,(arg)=>{
          Taro.eventCenter.off(`sync${id}`);
          self.state.is_pic = arg.is_pic;
          self.state.is_num = arg.is_num;
          self.syncItems();
        })
        
        // if(rsp.platform=='android'||rsp.platform=='devtools'){
        //   self.setState({modalV:!this.state.modalV});
        // }else{
        //   self.state.is_num = 1;
        //   self.syncItems();
        // }
      }})
    }
    
    gotoDetail=(id)=>{
      //查看商品
      // wx.reportAnalytics('productmanage_check_click', {
            //     dobean: 0,
            //   });
      Taro.navigateTo({
        url: '/pages/productDetails/productDetails?sence='+id
      })
    }
    
    modifyInfo=(id)=>{
      //修改商品
    // wx.reportAnalytics('productmanage_edit_click', {
            //     dobean: 0,
            //   });
      Taro.navigateTo({
        url: '/pages/modifyInfo/modifyInfo?id='+id
      })
    }
    
    

    render () {
      const { type } = this.props;
      const { data,version,modalV,is_pic,is_num } = this.state;
      let price = '';
      let defestr = '';
      if(!IsEmpty(data)){
        price = `${data.min_list_price}～${data.max_list_price}`;
        if(IsEmpty(data.min_list_price)){
          price = data.list_price;
        }else{
          if(data.min_list_price==data.max_list_price){
            price=data.min_list_price;
          }
        }
        let skus = data.skus;
        if(!IsEmpty(skus)){
          for(let i=0;i<skus.length;i++){
            if(skus[i].defect_num==0||IsEmpty(skus[i].defect_num)){
              defestr = '部分规格库存为0';
              break;
            }
          }
        }
        if(data.num==0){
          defestr = '该商品库存为0';
        }
      }
      return (
        <View style={styles.cardView} className='card_view'>
          <View style={{display:'flex',flex:1,flexDirection:'row',padding:'20rpx'}} onClick={this.showVer.bind(this)}>
            <Image src={data.image_path} style={styles.imageView}/>
            <View style={{display:'flex',flex:1,flexDirection:'column',marginLeft:'20rpx'}}>
              <Text style={{width:'500rpx'}} className='ecl_text'>{data.name}</Text>
              <View style={{display:'flex',flexDirection:'row',flex:1,alignItems:'center'}}>
                <Text className='main_text'>库存：{data.num}</Text>
                <Text style={{color:'red',fontSize:'20rpx',marginLeft:'24rpx'}}>{defestr}</Text>
              </View>
              <View style={{display:'flex',flexDirection:'row',flex:1,alignItems:'flex-end'}}>
                <Text className='main_text'>售价：</Text>
                <Text style={{color:'red'}}>{price}</Text>
                <Text className='main_text'>元</Text>
                <View style={{flex:1}}/>
                <Image style={{height:'18rpx',width:'24rpx'}} src={version?pic_url+'pullup.png':pic_url+'pulldown.png'}/>
              </View>
            </View>
          </View>
          {version?(<View style={styles.info_view}>
              <Button
                 hoverClass='sell-searchItem_hover' 
                 className='sell-searchItem'
                 onClick={this.gotoDetail.bind(this,data.id)}
              >查看商品</Button>
              <Button
                hoverClass='sell-searchItem_hover' 
                className='sell-searchItem'
                onClick={this.showModal.bind(this,data.id)}
              >同步信息</Button>
              <Button
                hoverClass='sell-searchItem_hover' 
                className='sell-searchItem'
                onClick={this.modifyInfo.bind(this,data.id)}
              >修改信息</Button>
              {type=='defe'?(null):(<Button dataId={data.id} dataTitle={data.name} dataPic={data.image_path} openType={'share'} className='sell-searchItem2'>分享</Button>)}
          </View>):(null)}
        </View>
      )
    }
  }

  const styles={
    cardView:{
      width:'726rpx',
      marginTop: '20rpx',
      display:'flex',
      flexDirection: 'column',
    },
    info_view:{
      borderTop:'1px solid #e5e5e5',
      height:'85rpx',
      display:'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: '18rpx',
    },
    imageView:{
      width:'150rpx',
      height:'150rpx',
      backgroundColor:'#fff'
    }
  }
  