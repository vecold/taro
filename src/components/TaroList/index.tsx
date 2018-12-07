import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text,ScrollView,Input,Button } from '@tarojs/components'
import { IsEmpty } from '../../public/utils/utils.js';
import { getAdimList } from '../../biz/adminItem.js';
import ItemCard from '../ItemCard'
import './index.scss'

export default class TaroList extends Component {
    constructor () {
        super(...arguments)
        this.state = {
          current: 0,
          height:700,
          datalist:[],
          page:0,
          keyword:'',
          lowerWord:'加载更多',
          loading:false,
        }
      }
    /**
     * 指定config的类型声明为: Taro.Config
     *
     * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
     * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
     * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
     */
    config: Config = {
      
    }
  
    componentDidMount () { 
        const { current,index } = this.props;
        console.log(index)
        if(index==1){
            // wx.reportAnalytics('productmanage_nostock_show', {
            //     dobean: 0,
            //   });
        }else if(index==2){
            // wx.reportAnalytics('productmanage_off_show', {
            //     dobean: 0,
            //   });
        }
    }

    componentWillReceiveProps(nextProps){
        const { current,index } = nextProps;
        if(current==index&&IsEmpty(this.state.datalist)){
            this.getList(0);
        }
    }

    onScrollToLower=()=>{
        this.state.page++;
        this.getList(this.state.page);
    }

    refreshPage=()=>{
        this.setState({loading:true});
        this.state.page = 0;
        this.getList(this.state.page);
    }
    /**
     * 
     */
    getList=(page,key='default')=>{
        // if(IsEmpty(key)){
        //     return;
        // }
        const { type,shopId } = this.props;
        const { keyword,lowerWord } = this.state;
        if(lowerWord=='没有更多商品了～'&&page!=0){
            return;
        }
        if(key=='search'){
            // wx.reportAnalytics('productmanage_search_click', {
            //     dobean: 0,
            //   });
        }
        let self = this;
        let newlowerWord = lowerWord;
        Taro.showLoading({title:'加载中'});
        getAdimList({
            page:page,
            type:type,
            shopId:shopId,
            keyword:keyword,
            callback:(rsp)=>{
                Taro.hideLoading();
                if(page==0){
                    newlowerWord = '加载更多';
                    self.state.datalist = rsp.data;
                }else{
                    self.state.datalist = self.state.datalist.concat(rsp.data);
                }
                if(IsEmpty(rsp.data)||rsp.data.length<20){
                    newlowerWord = '没有更多商品了～';
                }
                self.setState({datalist:self.state.datalist,lowerWord:newlowerWord,loading:false});
            }
        });

    }

    changeKeyword=(v)=>{
        let value = v.detail.value;
        this.setState({keyword:value});
    }

    render () {
      const { name,max_height,type } = this.props;
      const { keyword,datalist,lowerWord,loading } = this.state;
      return (
        <ScrollView 
            scrollY
            scrollWithAnimation
            scrollTop={0}
            lowerThreshold={20}
            onScrollToLower={this.onScrollToLower.bind(this)}
            style={{...styles.parentView,height:max_height+'px'}}
        >
            <View className='shadow' style={styles.searchView}>
                <Input 
                    value={keyword}
                    onInput={this.changeKeyword} 
                    maxLength={20} 
                    style={styles.input} 
                    placeholder='输入商品关键词搜索'
                />
                <Button 
                    hoverClass='sell-searchItem_hover' 
                    className='sell-searchItem'
                    onClick={this.getList.bind(this,0,'search')}
                >搜索</Button>
                <Button 
                    hoverClass='sell-searchItem_hover' 
                    className='sell-searchItem'
                    onClick={this.refreshPage.bind(this)}
                    loading	={loading}
                    disabled={loading}
                >刷新</Button>
            </View>
            {datalist.map((item,key)=>{
                return (
                    <ItemCard
                        data={item}
                        key={key}
                        type={type}
                    />
                );
            })}
            <View style={{...styles.textView,marginTop:'24rpx'}}><Text style={styles.text}>{lowerWord}</Text></View>
            <View style={styles.textView}>
                <Text style={{...styles.text,color:'transparent'}}>偷鸡被发现</Text>
            </View>
        </ScrollView>
      )
    }
  }

  const styles={
    body:{
        display:'flex',

    },
    parentView:{
      display:'flex',
      flex:1,
      padding: '18rpx',
      justifyContent:'center',
      alignItems: 'center',
    },
    text:{
        fontSize:24,
        color:'#666',
    },
    textView:{
        display:'flex',
        justifyContent:'center',
        alignItems: 'center',
    },
    bottomView:{
        
    },
    inputView:{
        width:'547rpx',
        height:'57rpx'
    },
    searchView:{
        width:'690rpx',
        height:'80rpx',
        borderRadius: '6rpx',
        backgroundColor:'#fff',
        display:'flex',
        alignItems: 'center',
        paddingLeft: '19rpx',
        paddingRight: '19rpx',
    },
    input:{
        flex:1,
        height:'57rpx',
        backgroundColor:'#FAFAFA',
        borderRadius: '6rpx',
        paddingLeft: '18rpx',
    },
  }
  