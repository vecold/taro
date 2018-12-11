import Taro, { Component, Config } from '@tarojs/taro'
import { View,ScrollView,Text,Button,Radio } from '@tarojs/components';
import {AtModal,AtModalHeader,AtModalContent,AtModalAction,AtTabs,AtTabsPane} from 'taro-ui'
import { getShops } from  '../../biz/adminItem.js';
import TaroList from '../../components/TaroList';
import './adminItem.scss'
/**
 * taro 页面 
 * @author lzy
 * 商品管理列表页面 
 * */
export default class Index extends Component {
  constructor () {
    super(...arguments)
    this.state = {
      current: 0,
      height:700,
      shopInfo:{}, //店铺信息
      shop_id:'', //店铺id
      modalV:false,
      is_pic:0,
      is_num:0,
      currentId:''
    }
    this.shop_id = '';
    this.showModal = this.showModal.bind(this);
  }
  handleClick (value) {
    this.setState({
      current: value
    })
  }
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '商品管理',
    navigationBarBackgroundColor:"#10AEFF",
    navigationBarTextStyle:"white"
  }

  componentWillMount () { 
    let self = this;
    //wx.hideShareMenu();
    Taro.eventCenter.on('showModal',(arg)=>{
      console.log(arg);
      self.showModal(arg);
    });
    console.log(this.$router.params) // 输出 { id: 2, type: 'test' }
    this.state.shop_id = this.$router.params.shop_id;
    this.shop_id = this.$router.params.shop_id;
    // this.state.shop_id = '56182';
    // this.shop_id = '56182';
    Taro.getSystemInfo({success:(rsp)=>{
      this.setState({height:rsp.screenHeight});
    }})
  }

  onShareAppMessage(e){
    console.log(e)
    let self = this;
    let data = e.target.dataset;
    // wx.reportAnalytics('productmanage_share_click', {
            //     dobean: 0,
            //   });
    return {
      title: '【' + self.state.shopInfo.shop_name + '】 ' +data.title,
      path: '/pages/productDetails/productDetails?sence=' + data.id,
      imageUrl: data.pic
    }
  }

  componentDidMount () { 
    let self = this;
    getShops({
      shopid:self.shop_id,
      callback:(rsp)=>{
         self.setState({shopInfo:rsp.data});
      }
    });
    //获取店铺信息
  }

  showModal=(id)=>{
    this.setState({modalV:true,currentId:id});
  }

  hideModal=(type)=>{
    const { currentId,is_num,is_pic } = this.state;
    if(type==1){
      console.log('sync')
      Taro.eventCenter.trigger(`sync${currentId}`,{is_num:is_num,is_pic:is_pic});
    }
    this.setState({modalV:false,is_num:0,is_pic:0});
  }

  radioChange=(type)=>{
    //选择同步内容 
    if(type=='pic'){
      this.setState({is_pic:!this.state.is_pic});
    }else{
      this.setState({is_num:!this.state.is_num});
    }
  }

  h1=()=>{
    let ref = Taro.createSelectorQuery().in(this.$scope);
    ref.select("#Atpans").boundingClientRect(rect=>{console.log(rect)}).exec();
  }
  render () {
    const tabList = [{ title: '上架中',type:'push' }, { title: '缺货中',type:'lost' }, { title: '下架中',type:'defe' }];
    const {current,height,modalV,is_num,is_pic} = this.state;
    let max_height = height - 110;
    return (
      <View style={{height:'100%',backgroundColor:"#f5f5f5"}}>
        <AtModal isOpened={modalV}>
            <AtModalHeader>提示</AtModalHeader>
            <AtModalContent>
              <View style={{display:'flex',flex:1,flexDirection:'column'}}>
                <Text style={{color:'#888',fontSize:'30rpx',textAlign:'center'}}>请选取您要同步的商品信息</Text>
                <View style={{display:'flex',flexDirection:'row',paddingLeft:'30rpx',marginTop:'16rpx',alignItems:'center'}}>
                  <Radio 
                    color={'#F76260'}
                    onClick={this.radioChange.bind(this,'num')}
                    checked={is_num}
                  />
                  <Text style={{color:'#888'}}>商品库存</Text>
                </View>
                <View style={{display:'flex',flexDirection:'row',paddingLeft:'30rpx',marginTop:'16rpx',alignItems:'center'}}>
                  <Radio 
                    color={'#F76260'}
                    onClick={this.radioChange.bind(this,'pic')}
                    checked={is_pic}
                  />
                  <Text style={{color:'#888'}}>商品详情页</Text>
                </View>
              </View>
            </AtModalContent>
            <AtModalAction> 
              <Button onClick={this.hideModal.bind(this,0)}>取消</Button> 
              <Button onClick={this.hideModal.bind(this,1)} style={{color:'#02BB00'}}>确定同步</Button> </AtModalAction>
          </AtModal>
        <AtTabs  current={current} tabList={tabList} onClick={this.handleClick.bind(this)}>
        {tabList.map((item,index)=>{
          return (
            <AtTabsPane id='Atpans' current={current} index={index} key={index}>
              <TaroList shopId={this.shop_id} max_height={max_height} current={current} index={index} type={item.type} name={item.title}></TaroList>
            </AtTabsPane>
          );
        })}
      </AtTabs>
      </View>
    )
  }
}
