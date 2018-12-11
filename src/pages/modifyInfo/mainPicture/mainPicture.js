import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { IsEmpty } from '../../../public/utils/utils.js'

import './mainPicture.scss'

class MainPicture extends Component {
  constructor () {
    super(...arguments)
    this.state = {
      mainPic: [], //主图
      detailPic: [], //详情图
      isEdit: true, //是否编辑
      picOrder: [], //图片顺序
    };
    this.imgOrder = 1;  //序号
  }
  
  componentWillMount () {
    
  } // onLoad

  componentDidMount () { } // onReady

  componentDidShow () { 
    
  } // onShow

  componentWillReceiveProps (nextProps) {
    const { itemDetail } = nextProps;
    if (itemDetail == this.props.itemDetail) { return };
    let mainPic = [];
    let detailPic = [];
    if (IsEmpty(itemDetail.res.show_mainimg)) {
      let pic_path = JSON.parse(itemDetail.res.pic_path);
      for( let i=0; i< pic_path.length; i++) {
        let picObj = {};
        picObj.id = i;
        picObj.url = pic_path[i];
        picObj.show = '1';
        mainPic.push(picObj);
      }
    } else {
      mainPic = JSON.parse(itemDetail.res.show_mainimg);
    };
    if (IsEmpty(itemDetail.res.show_desimg)) {
      let description = itemDetail.res.description;
      for( let i=0; i< description.length - 1; i++) {
        let desObj = {};
        desObj.id = i;
        desObj.url = description[i];
        desObj.show = '1';
        detailPic.push(desObj);
      }
    } else {
      detailPic = JSON.parse(itemDetail.res.show_desimg );
    };
    this.setState({
      mainPic: mainPic,
      detailPic: detailPic
    })
  }

  componentDidHide () { 
   
  } // onHide

  //编辑图片
  editImg () {
    let { picOrder, mainPic } = this.state;
    for (let i=0; i< mainPic.length; i++) {
      picOrder[i] = '';
    }
    this.setState({
      isEdit: false,
      picOrder: picOrder
    })
  }

  //完成编辑
  finishEdit () {
    const { picOrder } = this.state;
    let { mainPic } = this.state;
    let count = 0;
    let newPic = [];
    for (let i=0 ; i< picOrder.length; i++) {
      if (IsEmpty(picOrder[i])) {
        count++;
      } else {
        newPic[picOrder[i]-1] = {};
        newPic[picOrder[i]-1].id = picOrder[i]-1;
        newPic[picOrder[i]-1].url = mainPic[i].url;
        newPic[picOrder[i]-1].show = '1';
      }
    };
    let newLen = newPic.length;
    if (count == picOrder.length) {
      newPic = mainPic;
    } else {
      for (let i=0; i< picOrder.length; i++) {
        if (IsEmpty(picOrder[i])) {
          newPic.push(mainPic[i]);
        }
      };
      for (let i=0; i< newPic.length; i++) {
        if (i > newLen - 1 ) {
          newPic[i].id = i;
          newPic[i].show = '0';
        }
      }
      this.props.ongetParams({ show_mainimg: newPic });
    };
    this.setState({
      isEdit: true,
      mainPic: newPic
    })
    this.imgOrder = 1;
  }

  //选择顺序
  selectOrder (index,e) {
    let { picOrder } = this.state;
    e.stopPropagation();
    if (picOrder[index] == '') {
      picOrder[index] = this.imgOrder;
      this.imgOrder = Number(this.imgOrder) + 1;
    } else {
      for (let i=0; i< picOrder.length; i++) {
        if (picOrder[index] < Number(picOrder[i]) && i!=index) {
          picOrder[i] = picOrder[i] - 1;
        }
      }
      this.imgOrder = this.imgOrder - 1;
      picOrder[index] = '';
    };
    console.log(picOrder);
    this.setState({
      picOrder: picOrder
    })
  }
  //预览图片
  previewImg (index, id) {
    const { mainPic, detailPic } = this.state;
    let urls = [];
    if (id == 1) {
      urls = ['https://cbu01.alicdn.com/' + mainPic[index].url];
    } else {
      urls = [detailPic[index].url];
    };
    Taro.previewImage({
      urls: urls
    })
  }

  //控制详情图片显示与隐藏
  showPic (index, id) {
    let { detailPic } = this.state;
    if (id == 1) {
      detailPic[index].show = '1';
    } else {
      detailPic[index].show = '0';
    };
    this.props.ongetParams({ show_desimg: detailPic });
    this.setState({
      detailPic: detailPic
    })
  }

  //上移
  moveUp (index) {
    let { detailPic } = this.state;
    detailPic[index] = detailPic.splice(index - 1, 1, detailPic[index])[0];
    detailPic[index].id = detailPic[index].id + 1;
    detailPic[index - 1].id = detailPic[index - 1].id - 1;
    this.props.ongetParams({ show_desimg: detailPic });
    this.setState({
      detailPic: detailPic
    })
  }

  //下移
  moveDown (index) {
    let { detailPic } = this.state;
    detailPic[index] = detailPic.splice(index*1 + 1, 1, detailPic[index])[0];
    detailPic[index].id = detailPic[index].id - 1;
    detailPic[index*1 + 1].id = detailPic[index*1 + 1].id + 1;
    this.props.ongetParams({ show_desimg: detailPic });
    this.setState({
      detailPic: detailPic
    })
  }

  render () {
    const { mainPic, isEdit, picOrder, detailPic } = this.state;
    let imgEdit = null;
    if (isEdit) {
      imgEdit = <View onClick={this.editImg.bind(this)} className='main-editTxt'>编辑</View>
    } else {
      imgEdit = <View onClick={this.finishEdit.bind(this)} className='main-editTxt'>完成</View>
    }
    return (
      <View className='main-container'>
        <View className='main-mainPic'>
          <View className='main-mainTxt'>商品主图</View>
          {imgEdit}
          <View className='main-mainImg'>
          {
            isEdit ? mainPic.map((eachPic,index) => {
              return (<View className='main-imgContain' key={index} onClick={this.previewImg.bind(this,index,1)}>
                  <Image className='main-eachImage' src={'https://cbu01.alicdn.com/' + eachPic.url} lazyLoad/>
                  {
                    eachPic.show == '1' ? null : <View className='main-mainMask'></View>
                  }
              </View>)
            }) : mainPic.map((eachPic,index) => {
              return (<View className='main-imgContain' key={index} onClick={this.previewImg.bind(this,index,1)}>
                  <Image className='main-eachImage' src={'https://cbu01.alicdn.com/' + eachPic.url} lazyLoad/>
                  <View class='main-selectContain' onClick={this.selectOrder.bind(this,index)}>
                    <View className={picOrder[index] == '' ? 'main-notSelect': 'main-selected'}>{picOrder[index]}</View>
                  </View>
              </View>)
            })
          }
          </View>
          <View className='main-prompt'>进入编辑状态，根据选取顺序进行排序，未选取的则被隐藏</View>
        </View>
        <View className='main-detailPic'>
          <View className='main-mainTxt'>商品详情</View>
          <View className='main-detailImg'>
          {
            detailPic.map((eachPic,index) => {
              return (<View className='main-desImg' key={index}>
                  <Image className='main-desImage' src={eachPic.url} lazyLoad mode='aspectFit' onClick={this.previewImg.bind(this,index,0)}/>
                  {
                    eachPic.show == '1' ? null : <View className='main-desMask' onClick={this.previewImg.bind(this,index,0)}></View>
                  }
                  <View className='main-moveBtn'>
                  {
                    eachPic.id == '0' ? null : <View className='main-upBtn' onClick={this.moveUp.bind(this,index)}>
                      <Image src='https://q.aiyongbao.com/wechat/images/move-upward.png' className='main-moveUpward'/>
                      <View>上移</View>
                    </View>
                  }
                  {
                    eachPic.id == detailPic.length - 1 ? null : <View className='main-upBtn' onClick={this.moveDown.bind(this,index)}>
                      <Image src='https://q.aiyongbao.com/wechat/images/move-down.png' className='main-moveUpward'/>
                      <View>下移</View>
                    </View>
                  }
                  {
                    eachPic.show == '1' ? <View className='main-showBtn' onClick={this.showPic.bind(this,index,0)}>
                      <Image src='https://q.aiyongbao.com/wechat/images/hide-image.png' className='main-moveHide'/>
                      <View>隐藏</View>
                    </View> : <View className='main-showBtn' onClick={this.showPic.bind(this,index,1)}>
                      <Image src='https://q.aiyongbao.com/wechat/images/display-image.png' className='main-moveShow'/>
                      <View>恢复</View>
                    </View>
                  }
                  </View>
              </View>)
            })
          }
          </View>
          <View className='main-notImage'></View>
        </View>
      </View>
    )
  }
}

export default MainPicture
