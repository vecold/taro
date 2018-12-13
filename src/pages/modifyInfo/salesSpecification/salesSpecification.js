import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Input } from '@tarojs/components'
import { IsEmpty, api } from '../../../public/utils/utils.js'

import './salesSpecification.scss'

class SalesSpecification extends Component {
  constructor () {
    super(...arguments)
    this.state = {
      numberInput: '', //批量修改的数值
      skuDetail: '', //商品sku详情
      containHeight: 0, //容器高度
      updataStock: 0, //是否弹窗更新库存
    };
    this.numberInput = this.numberInput.bind(this);
    this.fillPrice = this.fillPrice.bind(this);
    this.fillStock = this.fillStock.bind(this);
  }
  
  componentWillMount () {
    const res = Taro.getSystemInfoSync();
    this.setState({
      containHeight: 520/603*res.windowHeight //按机型屏幕高度适配
    }) 
  } // onLoad
  
  componentDidMount () {
    
  } // onReady

  componentWillReceiveProps (nextProps) {
    const { itemDetail } = nextProps;
    let self = this;
    if (itemDetail == self.props.itemDetail) {
      let { skuDetail, updataStock } = self.state;
      if (updataStock == 1) { return }; //是否检测过货源
      let is_stock = 0;
      let is_model = 0;
      let originDetail = {};
      if (nextProps.current == 1) {
        for (let i=0; i< skuDetail.length; i++) {
          if (skuDetail[i].sku_inventory == 0) {
            is_stock = 1;
            break;
          }
        };
        self.setState({
          updataStock: 1
        })
        if (is_stock == 1) { //检测是否显示同步货源的弹窗
          api({
            url: '/wx/getOrigin',
            params: {
              num_iid: itemDetail.res.num_iid,
            },
            callback: (res) => {
              originDetail = res.data;
              if(!IsEmpty(originDetail)) {
                if (IsEmpty(originDetail.skus)) {
                  if (originDetail.num != 0) {
                    is_model = 1;
                  }
                } else {
                  for (let i=0; i<skuDetail.length; i++) {
                    if (skuDetail[i].sku_inventory == 0) {
                      for (let j=0; j<originDetail.skus.length; j++) {
                        if (skuDetail[i].sku_id == originDetail.skus[j].skuId) {
                          if (originDetail.skus[j].amountOnSale != 0) {
                            is_model = 1;
                            break;
                          }
                        }
                      }
                    }
                    if (is_model == 1) {
                      break;
                    }
                  }
                };
                if (is_model == 1) {
                  Taro.showModal({
                    title: '提示',
                    content: '检测到货源库存正常，是否同步库存',
                    confirmText: '确定同步',
                    success (res) {
                      if (res.confirm) {
                        if (IsEmpty(originDetail.skus)) {
                          skuDetail[0].sku_inventory = originDetail.num;
                        } else {
                          for (let i=0; i< skuDetail.length; i++) {
                            for (let j=0; j< originDetail.skus.length; j++) {
                              if (skuDetail[i].sku_id == originDetail.skus[j].skuId) {
                                skuDetail[i].sku_inventory = originDetail.skus[j].amountOnSale;
                              }
                            }
                          }
                        };
                        self.props.ongetParams({ skus: skuDetail });
                        self.setState({
                          skuDetail: skuDetail
                        });
                        Taro.showToast({
                          title: "同步库存成功",
                          icon: "none",
                          mask: true,
                          duration: 2000
                        });
                      }
                    }
                  })
                }
              }
            }
          });
        }
      }
    } else {
      let { skuDetail } = self.state;
      if (!IsEmpty(itemDetail)) {
        if (IsEmpty(itemDetail.sku)) {
          skuDetail = [{}];
          skuDetail[0].sku_title = '默认规格';
          skuDetail[0].sku_list_price = itemDetail.res.list_price;
          skuDetail[0].sku_inventory = itemDetail.res.num;
        } else {
          if (IsEmpty(skuDetail)) {
            skuDetail = [];
            for (let i = 0; i< itemDetail.sku.length; i++) {
              let skuObj = {};
              skuObj.sku_title = itemDetail.sku[i].prop_name;
              skuObj.sku_list_price = itemDetail.sku[i].list_price;
              skuObj.sku_inventory = itemDetail.sku[i].defect_num;
              skuObj.sku_id = itemDetail.sku[i].sku_product_id;
              skuDetail.push(skuObj)
            };
          } else { //解决sku排序错乱
            console.log(skuDetail);
            for (let i = 0; i< skuDetail.length; i++) {
              for (let j = 0; j< itemDetail.sku.length; j++) {
                if (skuDetail[i].sku_id == itemDetail.sku[j].sku_product_id) {
                  skuDetail[i].sku_title = itemDetail.sku[j].prop_name;
                  skuDetail[i].sku_list_price = itemDetail.sku[j].list_price;
                  skuDetail[i].sku_inventory = itemDetail.sku[j].defect_num;
                }
              }
            }
          }
        };
      };
      self.setState({
        skuDetail: skuDetail
      })
    }
  }

  //批量修改
  numberInput (e) {
    let value = e.detail.value;
    let numberInput = value.replace(/^\D*([0-9]\d*\.?\d{0,2})?.*$/, '$1');
    this.setState({
      numberInput: numberInput
    });
    return {
      value: value.replace(/^\D*([0-9]\d*\.?\d{0,2})?.*$/, '$1')
    };
  }

  //批量修改价格
  fillPrice () {
    let { skuDetail, numberInput } = this.state;
    if (numberInput === '') {
      Taro.showToast({
        title: "批量修改价格不能为空",
        icon: "none",
        mask: true,
        duration: 2000
      });
    } else {
      for (let i=0; i< skuDetail.length; i++) {
        skuDetail[i].sku_list_price = Number(numberInput).toFixed(2);
      };
      this.props.ongetParams({ skus: skuDetail });
      this.setState({
        skuDetail: skuDetail
      })
    };
  }

  //批量修改库存
  fillStock () {
    let { skuDetail, numberInput } = this.state;
    if (numberInput === '') {
      Taro.showToast({
        title: "批量修改库存不能为空",
        icon: "none",
        mask: true,
        duration: 2000
      });
    } else {
      if (String(numberInput).indexOf('.') != -1) {
        Taro.showToast({
          title: "库存不能有小数",
          icon: "none",
          mask: true,
          duration: 2000
        });
      } else {
        for (let i=0; i< skuDetail.length; i++) {
          skuDetail[i].sku_inventory = parseInt(numberInput);
        };
        this.props.ongetParams({ skus: skuDetail });
        this.setState({
          skuDetail: skuDetail
        })
      };
    }
  }

  //单个sku标题改变
  skuTitle (index,e) {
    let { skuDetail } = this.state;
    if (e.detail.value === '') {
      Taro.showToast({
        title: "销售规格不能为空",
        icon: "none",
        mask: true,
        duration: 2000
      });
      skuDetail[index].sku_title = '';
    } else {
      skuDetail[index].sku_title = e.detail.value;
    };
    this.props.ongetParams({ skus: skuDetail });
    this.setState({
      skuDetail: skuDetail
    })
  }

  //单个sku价格改变
  priceInput (index,e) {
    let value = e.detail.value;
    let { skuDetail } = this.state;
    if (e.detail.value === '') {
      Taro.showToast({
        title: "价格不能为空",
        icon: "none",
        mask: true,
        duration: 2000
      });
      skuDetail[index].sku_list_price = '';
    } else {
      let skuPrice = value.replace(/^\D*([0-9]\d*\.?\d{0,2})?.*$/, '$1');
      skuDetail[index].sku_list_price = skuPrice;
    }
    this.props.ongetParams({ skus: skuDetail });
    this.setState({
      skuDetail: skuDetail
    });
    return {
      value: value.replace(/^\D*([0-9]\d*\.?\d{0,2})?.*$/, '$1')
    };
  }

  //单个sku库存改变
  stockInput (index,e) {
    let { skuDetail } = this.state;
    if (e.detail.value === '') {
      Taro.showToast({
        title: "库存不能为空",
        icon: "none",
        mask: true,
        duration: 2000
      });
      skuDetail[index].sku_inventory = '';
    } else {
      skuDetail[index].sku_inventory = e.detail.value;
    }
    this.props.ongetParams({ skus: skuDetail });
    this.setState({
      skuDetail: skuDetail
    });
  }

  render () {
    const { skuDetail, containHeight } = this.state;
    return (
      <View className='sales-container' style={{height: containHeight + 'px'}}>
        <View className='sales-batchEdit'>
          <View className='sales-batchTitle'>批量修改</View>
          <View className='sales-editNumber'>
            <Input className='sales-numberInput' placeholder='输入数值' type='digit' onInput={this.numberInput}/>
            <Button className='sales-fillPrice' onClick={this.fillPrice}>填充价格</Button>
            <Button className='sales-fillStock' onClick={this.fillStock}>填充库存</Button>
          </View>
        </View>
          <View className='sales-skuInfo'>
            <View className='sales-fillSpace'></View>
            <View className='sales-skuContainer'>
              <View className='sales-salesTxt'>销售规格</View>
              <View className='sales-dividingLine'></View>
              {
                skuDetail.map((eachInfo,index) => {
                  return (
                    <View className='sales-skuDisplay' key={index}>
                    {
                      eachInfo.sku_title == '默认规格' ? <View className='sales-titleTxt'>{eachInfo.sku_title}</View> : <Input className='sales-titleInput' value={eachInfo.sku_title} maxlength='30' onInput={this.skuTitle.bind(this,index)} />
                    }
                      <View className='sales-priStock'>
                        <View className='sales-saleNumber'>
                          <Text>售价:</Text>
                          <Input className='sales-priceInput' value={eachInfo.sku_list_price} type='digit' onInput={this.priceInput.bind(this,index)}/>
                          <Text>元</Text>
                        </View>
                        <View className='sales-saleNumber'>
                          <Text>库存:</Text>
                          <Input className='sales-stockInput' value={eachInfo.sku_inventory} type='number' onInput={this.stockInput.bind(this,index)}/>
                        </View>
                      </View>
                    </View>)
                }) 
              }
            </View>
          </View>
          <View className='sales-fillFooter'></View>
      </View>
    )
  }
}

export default SalesSpecification
