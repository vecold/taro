import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Textarea, Input } from '@tarojs/components'
import { api, IsEmpty } from '../../../public/utils/utils.js'

import './basicInfo.scss'

class BasicInfo extends Component {
  constructor () {
    super(...arguments)
    this.state = {
      itemTitle: '', //商品标题
      originalPrice: 0, //商品价格
      showStatus: 0, //商品状态
      listPrice: 0, //售价
    };
    this.titleInput = this.titleInput.bind(this);
    this.priceInput = this.priceInput.bind(this);
    this.soldOut = this.soldOut.bind(this);
    this.shelfItem = this.shelfItem.bind(this);
  }
  
  componentWillMount () {
    
  } // onLoad

  componentWillReceiveProps (nextProps) {
    const { itemDetail } = nextProps;
    if (itemDetail == this.props.itemDetail) { return };
    let { listPrice } = this.state;
    if (!IsEmpty(itemDetail)) {
      if (!IsEmpty(itemDetail.res.min_list_price)) {
        let min_list_price = Number(itemDetail.res.min_list_price).toFixed(2);
        let max_list_price = Number(itemDetail.res.max_list_price).toFixed(2);
        if (min_list_price > max_list_price) {
          listPrice = max_list_price + '~' + min_list_price;
        } else if (min_list_price == max_list_price) {
          listPrice = max_list_price;
        } else {
          listPrice = min_list_price + '~' + max_list_price;
        }
      } else {
        listPrice = itemDetail.res.list_price;
      }
      this.setState({
        itemTitle: itemDetail.res.name,
        showStatus: itemDetail.relation.is_push,
        originalPrice: itemDetail.res.tag_price,
        listPrice: listPrice
      })
    }
  }
  
  componentDidMount () { 
    
  } // onReady

  componentDidShow () { 
    
  } // onShow

  componentDidHide () { 
   
  } // onHide
  
  //标题修改
  titleInput (e) {
    this.props.ongetParams({ name: e.detail.value });
    this.setState({
      itemTitle: e.detail.value
    })
  }
   
  //价格修改
  priceInput (e) {
    let value = e.detail.value;
    let originalPrice = value.replace(/^\D*([0-9]\d*\.?\d{0,2})?.*$/, '$1');
    const { listPrice } = this.state;
    let valuationPrice = listPrice;
    if (valuationPrice.indexOf('~') != -1) {
      valuationPrice = valuationPrice.split('~')[1];
    };
    if ( Number(originalPrice) < Number(valuationPrice) ) {
      const { itemDetail } = this.props;
      Taro.showToast({
        title: '划线价不能低于售价',
        icon: 'none',
        duration: 2000
      });
      this.props.ongetParams({ tag_price: itemDetail.res.tag_price });
    } else {
      this.props.ongetParams({ tag_price: originalPrice });
      this.setState({
        originalPrice: originalPrice
      });
    };
    return {
      value: value.replace(/^\D*([0-9]\d*\.?\d{0,2})?.*$/, '$1')
    };
  }

  //下架商品
  soldOut () {
    const self = this;
    const { itemDetail } = self.props;
    Taro.showModal({
      title: '提示',
      content: '下架后商品及分享的信息会立即失效',
      confirmText: '确定下架',
      cancelText: '我再想想',
      success (res) {
        if (res.confirm) {
          api({
            url: '/wx/modifyItem',
            params: {
              num_iid: itemDetail.res.num_iid,
              push: '0'
            },
            callback: () => {
              self.setState({
                showStatus: '0'
              })
            }
          })
        }
      }
    })
  }

  //上架商品
  shelfItem () {
    const self = this;
    const { itemDetail } = self.props;
    Taro.showModal({
      title: '提示',
      content: '上架时请注意库存是否不足',
      confirmText: '确定上架',
      cancelText: '我再想想',
      success (res) {
        if (res.confirm) {
          api({
            url: '/wx/modifyItem',
            params: {
              num_iid: itemDetail.res.num_iid,
              push: '1'
            },
            callback: () => {
              self.setState({
                showStatus: '1'
              })
            }
          })
        }
      }
    })
  }

  render () {
    const { itemTitle, originalPrice, showStatus, listPrice } = this.state;
    const { itemDetail } = this.props;
    let itemStatus = null;
    if (showStatus == 1) {
      itemStatus = (<View className='basic-statusDisplay'>
      <Text className='basic-shelf'>上架中</Text>
      <Button className='basic-soldOut' onClick={this.soldOut}>下架商品</Button>
    </View>)
    } else {
      itemStatus = (<View className='basic-statusDisplay'>
      <Text className='basic-outItem'>下架中</Text>
      <Button className='basic-shelfItem' onClick={this.shelfItem}>上架商品</Button>
    </View>)
    }; 
    return (
      <View className='basic-container'>
        <View className='basic-modifyTitle'>
          <View className='basic-itemTitle'>商品标题</View>
          <Textarea class="basic-titleInput" maxlength='30' value={itemTitle} onInput={this.titleInput} selectable></Textarea>
        </View>
        <View className='basic-modifyStatus'>
          <View className='basic-itemStatus'>商品状态</View>
          {itemStatus}
        </View>
        <View className='basic-modifyPrice'>
          <View className='basic-itemPrice'>商品价格</View>
          <View className='basic-priceDisplay'>
            <View>进货价:<Text className='basic-showPrice'>{itemDetail.res.purchase_price}元</Text></View>
            <View className='basic-saleTxt'>售价:<Text className='basic-salePrice'>{listPrice}</Text>元</View>
            <View  className='basic-markPrice'>
              <Text>划线价:</Text>
              <Input class="basic-originalPrice" value={originalPrice} type='digit' onInput={this.priceInput} />
              <Text>元</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default BasicInfo
