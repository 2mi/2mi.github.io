// pages/central/index.js

import Certificate, { cert_flags } from '../../utils/certificate';
var util = require('../../utils/util');

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var issueCert = new Certificate();
    var cert = new Certificate();
    var keyPair = util.generateKeyPair( Uint8Array.from(util.randomBytes(32)) );
    issueCert.publicKey.set(keyPair.public);
    issueCert.privateKey.set(keyPair.private);
    issueCert.authorize(issueCert);
    var keyPair = util.generateKeyPair( Uint8Array.from(util.randomBytes(32)) );
    cert.publicKey.set(keyPair.public);
    cert.privateKey.set(keyPair.private);    
    cert.setDate(new Date('2021/1/1'));
    cert.vaildity.count.set(Uint8Array.of(3));
    cert.constrain.set(Uint8Array.of(0));
    cert.authorize(issueCert);
    try {
      wx.clearStorageSync();
      wx.setStorageSync('RootCertificate', Array.from(issueCert.serialize()));
      wx.setStorageSync('MyCertificate', Array.from(cert.serialize()));
      console.log(Certificate.length);
      for (let name of wx.getStorageInfoSync().keys) {
        if ( name.indexOf("Certificate") != -1 ) {
          var crt = Certificate.unserialize(Uint8Array.from(wx.getStorageSync(name)));
          console.log( name, crt );
        }
      }
    } catch (e) {
      console.log(e);
    }     
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

    /*
    var array = new Uint8Array(32);
    window.crypto.getRandomValues(array);   
  
    crypto.subtle.importKey(
        "raw", 
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 
        { 
          name: "HMAC",
          hash: { name: "SHA-1" } 
        },
        false,
        ["sign"]
      ).then(function(hmacKey){
        console.log( crypto.subtle.sign(
            "HMAC", 
            hmacKey,
            new Uint8Array([172, 190, 141, 85, 37, 235, 251, 224, 156, 100, 28, 2, 173, 154, 100, 170, 173, 138, 231, 223, 226, 191, 247, 159, 112, 250, 143, 25, 162, 2, 23, 157])
          ) );
      });
    */ 