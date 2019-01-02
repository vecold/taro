import Taro, { Component } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import { AtTabs, AtTabsPane } from 'taro-ui'
import BasicInfo from './basicInfo/basicInfo.js'
import SalesSpecification from './salesSpecification/salesSpecification.js'
import MainPicture from './mainPicture/mainPicture.js'
import { IsEmpty } from '../../public/utils/utils.js'
import { getDetail } from  '../../biz/modifyInfo.js';

import './modifyInfo.scss'

class ModifyInfo extends Component {
  constructor () {
    super(...arguments)
    this.state = {
      current: 0, //tab改变
      itemDetail: '', //商品详情
      itemId: '', //商品id
    };
    this.isClick = 0;
    this.getParams = this.getParams.bind(this);
    this.subParams ={
      name: '',
      tag_price: '',
      list_price: '',
      inventory: '',
      skus: '',
      show_mainimg: '',
      show_desimg: ''
    }
  }
  
  config = {
    navigationBarTitleText: '商品管理',
    navigationBarBackgroundColor: '#10AEFF',
    navigationBarTextStyle: 'white'
  } // 小程序页面配置
  componentWillMount () {
    this.setState({
      itemId: this.$router.params.id
    })
  } // onLoad, options通过this.$router.params访问

  componentDidMount () { 
    getDetail({
      id: this.state.itemId,
      callback: (res) => {
        this.setState({
          itemDetail: res.data
        })
      }
    })
  } // onReady

  componentDidShow () { 
    
  } // onShow

  componentDidHide () { 
    
  } // onHide

  // 改变Tab
  handleClick (value) {
    this.setState({
      current: value
    })
  }
  
  //获取子组件改变的值
  getParams ({name, tag_price, skus, show_mainimg, show_desimg}) {
    for (let key in arguments[0]) {
      if (!IsEmpty(arguments[0][key])) {
        this.subParams[key] = arguments[0][key];
      } 
    };
  }

  //保存商品信息
  saveInfo () {
    let self = this;
    let date = new Date();
    if ((date.getTime()/1000 - self.isClick) < 3) { return }; //三秒内再次点击无效
    self.isClick = date.getTime()/1000;
    const { itemDetail } = self.state;
    let newParams = JSON.parse(JSON.stringify(self.subParams));
    let titleParams = newParams.name;
    if (!IsEmpty(newParams.skus)) {
      for (let i=0; i< newParams.skus.length; i++) {
        titleParams = titleParams + newParams.skus[i].sku_title;
      }
    };
    api({
      url: '/wx/msgJude',
      params: {
        content: titleParams
      },
      callback: (res) => {
        if (res.code == 1006) {
          Taro.showToast({
            title: "商品标题或者销售规格标题不合法",
            icon: "none",
            mask: true,
            duration: 2000
          });
        } else {
          Taro.showModal({
            title: '提示',
            content: '保存后新的信息将会覆盖原有信息',
            confirmText: '确定保存',
            success (res) {
              if (res.confirm) {
                Taro.showLoading();
                if (IsEmpty(itemDetail.sku) && newParams.skus[0]) {
                  newParams.inventory = newParams.skus[0].sku_inventory;
                  newParams.list_price = newParams.skus[0].sku_list_price;
                };
                let skuParam = '';
                for (let key in newParams) {
                  if (key != 'skus') {
                    if (!IsEmpty(itemDetail.res[key])) {
                      if (newParams[key] == itemDetail.res[key]) {
                        newParams[key] = '';
                      }
                    }
                  } else {
                    if (IsEmpty(itemDetail.sku)) {
                      newParams.skus = '';
                    } else {
                      if (!IsEmpty(newParams.skus)) {
                        skuParam = newParams.skus;
                        for (let i=0; i< skuParam.length; i++) {
                          for (let j=0; j< itemDetail.sku.length; j++) {
                            if (skuParam[i].sku_id == itemDetail.sku[j].sku_product_id) {
                              if (skuParam[i].sku_title == itemDetail.sku[j].prop_name) {
                                skuParam[i].sku_title = '';
                              };
                              if (skuParam[i].sku_list_price == itemDetail.sku[j].list_price) {
                                skuParam[i].sku_list_price = '';
                              };
                              if (skuParam[i].sku_inventory == itemDetail.sku[j].defect_num) {
                                skuParam[i].sku_inventory = '';
                              };
                            }
                          }
                          if (skuParam[i].sku_title === '' && skuParam[i].sku_list_price === '' && skuParam[i].sku_inventory === '') {
                            skuParam.splice(i, 1);
                            i--;
                          }
                        };
                      };
                    }
                  }
                };
                let params = {
                  num_iid: itemDetail.res.num_iid,
                  title: newParams.name,
                  tag_price: newParams.tag_price,
                  list_price: newParams.list_price,
                  inventory: newParams.inventory
                }
                if (!IsEmpty(skuParam)) {
                  params.skus = JSON.stringify(skuParam);
                };
                if (!IsEmpty(newParams.show_mainimg)) {
                  params.show_mainimg = JSON.stringify(newParams.show_mainimg);
                };
                if (!IsEmpty(newParams.show_desimg)) {
                  params.show_desimg = JSON.stringify(newParams.show_desimg);
                };
                console.log(params);
                api({
                  url: '/wx/modifyItem',
                  params: params,
                  callback: (res) => {
                    console.log(res);
                    api({
                      url: '/wx/itemDetail',
                      params: {
                        num_iid: itemDetail.res.id
                      },
                      callback: (res) => {
                        self.setState({
                          itemDetail: res.data
                        })
                      }
                    });
                    Taro.hideLoading();
                    Taro.showToast({
                      title: "保存成功",
                      icon: "none",
                      mask: true,
                      duration: 2000
                    });
                  }
                })
              }
            }
          })
        }
      }
    });
  }

  render () {
    const tabList = [{ title: '基本信息' }, { title: '销售规格' }, { title: '主图详情' }];
    const { itemDetail, current } = this.state;
    return (
      <View className='info-container'>
        <AtTabs current={current} tabList={tabList} onClick={this.handleClick.bind(this)} swipeable={false}>
          <AtTabsPane current={current} index={0}>
            <BasicInfo itemDetail={itemDetail} ongetParams={this.getParams}/>
          </AtTabsPane>
          <AtTabsPane current={current} index={1}>
            <SalesSpecification itemDetail={itemDetail} current={current} ongetParams={this.getParams}/>
          </AtTabsPane>
          <AtTabsPane current={current} index={2}>
            <MainPicture itemDetail={itemDetail} ongetParams={this.getParams}/>
          </AtTabsPane>
        </AtTabs>
        <Button className='info-saveBtn' onClick={this.saveInfo.bind(this)}>保存商品信息</Button>
      </View>
    )
  }
}

export default ModifyInfo
