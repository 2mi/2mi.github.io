const app = getApp()

var config = require('config')
var service = require('service')

Page({
  data: {
    devices: [],
    connected: false
  },
  onLoad: function(options) {
    wx.showLoading({
      title: '等待适配器...',
    })
    let notifyOnSuccess = () => {
      wx.hideLoading()
      this.startBluetoothDevicesDiscovery()
    }
    wx.openBluetoothAdapter({
      success: (res) => notifyOnSuccess(),
      fail: (res) => {
        res.errCode === 10001 ? wx.onBluetoothAdapterStateChange(function (state) {
          state.available && notifyOnSuccess()
        }) : (
          wx.hideLoading(),
          wx.showToast({
            title: '[!] 蓝牙无法使用',
            icon: 'none'
          })
        )
      }
    })
  },
  onShow: function() {    
    wx.getBluetoothAdapterState({
      success: (res) => {
        res.available && !res.discovering && this.startBluetoothDevicesDiscovery()
      }
    })
  },
  onHide: function() {
    this.stopBluetoothDevicesDiscovery()
  },
  onUnload: function() {
    this.stopBluetoothDevicesDiscovery()
    wx.offBluetoothAdapterStateChange()
    wx.closeBluetoothAdapter()
  },
  startBluetoothDevicesDiscovery() {
    if (this._discoveryStarted) {
      return
    }
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      services: [config.service.uuid],
      allowDuplicatesKey: true,
      success: (res) => {
        this.onBluetoothDeviceFound() 
        //this.updateBluetoothDevice()
      },
    })
  },
  stopBluetoothDevicesDiscovery() {
    if (this._discoveryStarted) {
      this._discoveryStarted = false
      wx.offBluetoothDeviceFound()
      wx.stopBluetoothDevicesDiscovery()
    }
  },
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(dev => {   
        var device = this.data.devices.find(d => (d.deviceId == dev.deviceId))
        device ? (device.RSSI = dev.RSSI) : this.data.devices.push(dev)
        this.setData(this.data)
      })
    })
  },
  createBLEConnection(e) {
    const ds = e.currentTarget.dataset
    const dev = this.data.devices[ds.index]
    wx.showLoading({
      title: '等待连接...',
      mask: true
    })
    wx.createBLEConnection({
      deviceId: dev.deviceId,
      success: (res) => {
        this.stopBluetoothDevicesDiscovery()
        wx.getBLEDeviceCharacteristics({
          deviceId: dev.deviceId,
          serviceId: dev.advertisServiceUUIDs[0],
          success: (res) => {    
            dev.primaryService = {
              characteristics: res.characteristics
            }
            this.data.devices = [dev]
            this.setData(this.data)
          },
          complete: (res) => {
            wx.hideLoading()
          }
        })
      },
      fail: (res) => {
        wx.showToast({
          title: '[!] 连接不成功',
          icon: 'none'
        })
      }
    })    
    wx.onBLEConnectionStateChange((res) => {
      (this.data.connected = res.connected) ? service.connect(res.deviceId) : service.disconnect(res.deviceId)
      this.setData(this.data)
    })
  },
  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: this.data.devices[0].deviceId,
      complete: (res) => {
        wx.offBLEConnectionStateChange()        
        this.startBluetoothDevicesDiscovery()
      }
    })
  },  
  readBLECharacteristicValue(character){
    wx.readBLECharacteristicValue({
      characteristicId: character.uuid,
      deviceId: this.data.devices[0].deviceId,
      serviceId: config.service.uuid
    })
  },
  writeBLECharacteristicValue(character, binary){
    wx.writeBLECharacteristicValue({
      characteristicId: character.uuid,
      deviceId: this.data.devices[0].deviceId,
      serviceId: config.service.uuid,
      value: binary
    })
  },
  updateBluetoothDevice() {        
    if (!this._discoveryStarted){
      return
    }
    var isUpdated = false
    this.data.devices.forEach((dev, index) => {
      wx.getBLEDeviceRSSI({
        deviceId: dev.deviceId,
        success: (rssi) => {
          rssi == -90 && (isUpdated = true) && this.devices.splice(index, 1)
        }
      })
    })
    if(isUpdated){
      this.setData(this.data)
    }
    setTimeout(this.updateBluetoothDevice, 10000)
  }
})

