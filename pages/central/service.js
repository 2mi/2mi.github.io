import Certificate, { cert_flags } from '../../utils/certificate'
var config = require('config')
var util = require('../../utils/util')

var data = {
  certKey: ''
}

function initializeConnection(deviceId)
{
  wx.notifyBLECharacteristicValueChange({
    characteristicId: config.characteristics.mac.uuid,
    deviceId: deviceId,
    serviceId: config.service.uuid,
    state: true,
    success: (res) => {
      wx.onBLECharacteristicValueChange((res) => onBluetoothAdapterStateChange(res))
      selectCertificate()
    }
  })      
}

function releaseConnection(){
  wx.offBLECharacteristicValueChange()
  data = {}
}

function selectCertificate()
{
  var certList = wx.getStorageInfoSync().keys.filter(k => (k.indexOf('Certificate') != -1))
  wx.showActionSheet({
    itemList: certList,
    success: (res) => {
      data.certKey = certList[res.tapIndex]
      wx.showLoading({
        title: '验证中',
      })
      readBLECharacteristicValue(config.characteristics.nonce)
    }
  })
}

function onBluetoothAdapterStateChange(res)
{
  switch(res.characteristicId)
  {
    case config.characteristics.mac.uuid:
      data.readMacCallback && data.readMacCallback(res.value)
      break    
    case config.characteristics.state.uuid:
      data.readMacCallback = (mac) => {
        var state = new Uint8Array(res.value)
        wx.hideLoading()
        if(util.hmac(state) != mac){
          console.error("消息验证失败", state)
          return
        }
        data.state = state
        if(state == config.state.connected){
          wx.showToast({
            title: '[+] 验证通过'
          })
        } else if(state == config.state.succeed){
          wx.showToast({
            title: '[+] 操作完成'
          })
        } else if(state == config.state.unsuccessful){
          wx.showToast({
            title: '[!] 操作失败'
          })
        } else if(state == config.state.succeed){
          wx.showLoading({
            title: '等待操作完成'
          })
        }
      }
      readBLECharacteristicValue(config.characteristic.mac)
      break
    case config.characteristic.parameter.uuid:
      wx.setStorageSync(deviceId, Array.from(new Uint8Array(res.value)))
      break
    case config.characteristics.nonce.uuid:
      var PSK = new Uint8Array(32)
      try {
        PSK = wx.getStorageSync(deviceId)
      } catch(e) { }
      var cert = Certificate.unserialize(wx.getStorageSync(data.certKey))
      var keyPair = util.generateKeyPair(Uint8Array.from(util.randomBytes(32)))
      var nonce = res.value
      data.sharedKey = util.hmac([], util.sharedKey(keyPair.private, util.sharedKey(nonce, PSK)))
      writeBLECharacteristicValue(config.characteristics.parameter, cert.serialize(cert_flags.nonePrivKey).buffer)
      writeBLECharacteristicValue(config.characteristics.nonce, Uint8Array.from(util.randomBytes(32)).buffer)
      writeBLECharacteristicValue(config.characteristics.secure_key, keyPair.public.buffer)
      writeBLECharacteristicValue(config.characteristics.signature, util.sign(cert.privateKey, util.XorVector(nonce, keyPair.public)))
      writeBLECharacteristicValue(config.characteristics.mac, Uint8Array.of().buffer)
      readBLECharacteristicValue(config.characteristic.state)
      break
  }
}

module.exports = {
  connect: initializeConnection,
  disconnect: releaseConnection
}