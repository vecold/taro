import Taro, { Component, Config } from '@tarojs/taro'
import { View,ScrollView } from '@tarojs/components'
import { AtTabs,AtTabsPane } from 'taro-ui';
import { getShops } from  '../../biz/adminItem.js';
import TaroList from '../../components/TaroList';
import './adminItem.scss'

export default class Index extends Component {
  constructor () {
    super(...arguments)
    this.state = {
      current: 0,
      height:700,
      shopInfo:{},
      shop_id:'',
    }
    this.shop_id = '';
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
    console.log(this.$router.params) // 输出 { id: 2, type: 'test' }
    this.state.shop_id = this.$router.params.shop_id;
    this.shop_id = this.$router.params.shop_id;
    Taro.getSystemInfo({success:(rsp)=>{
      this.setState({height:rsp.screenHeight});
    }})
  }

  onShareAppMessage(e){
    console.log(e)
    let self = this;
    let data = e.target.dataset;
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
         self.setState({shopInfo:rsp.data.res[0]});
      }
    });
    //获取店铺信息
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }
  h1=()=>{
    let ref = Taro.createSelectorQuery().in(this.$scope);
    ref.select("#Atpans").boundingClientRect(rect=>{console.log(rect)}).exec();
  }
  render () {
    const tabList = [{ title: '上架中',type:'push' }, { title: '缺货中',type:'lost' }, { title: '下架中',type:'defe' }];
    const {current,height} = this.state;
    let max_height = height - 110;
    return (
      <View style={{height:'100%',backgroundColor:"#f5f5f5"}}>
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
