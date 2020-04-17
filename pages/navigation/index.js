// pages/peripheral/index.js

import Certificate, { cert_flags } from '../../utils/certificate';



Page({
  /**
   * 页面的初始数据
   */
  data: {
    certs: []
  },  
  bindViewTap: function () {
    if(this.data.certs.length){
      wx.switchTab({url: '../central/index'})
      return
    }
    wx.showModal({
      content: '[?] 是否先添加授权',
      success: (res) => res.confirm ? wx.switchTab({url: '../peripheral/index'}) : wx.switchTab({url: '../central/index'})
    })
  },
  showCertificateInfo: function () {
    wx.showActionSheet({
      itemList: this.data.certs,
      success (res) {
        var crt = Certificate.unserialize(Uint8Array.from(wx.getStorageSync(this.data.certs[res.tapIndex])));
        var date = crt.getDate();
        wx.showToast({
          title: '{0}到期, 可用{1}次, 可下授权{2}级'.format('{0}-{1}-{2}'.format(date.getFullYear(), date.getMonth() + 1, date.getDate()), crt.vaildity.count, crt.constrain),
          icon: 'none',
          duration: 3000
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '选择你的操作' 
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({certs: wx.getStorageInfoSync().keys.filter(k => (k.indexOf('Certificate') != -1))})
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})