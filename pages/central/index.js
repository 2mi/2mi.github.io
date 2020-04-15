const app = getApp()

function XorVector(vec1, vec2) {
  for (var i = 0; i < vec1.length ; ++i) {
    vec1[i] ^= vec2[i];
  }
}

import Certificate from '../../utils/certificate';
var service = require('config').service;
var axlsign = require('../../utils/axlsign');
var crypto = require('../../utils/Crypto').Crypto;  
var util = crypto.util;
require('../../utils/HMAC');
require('../../utils/SHA1');
var hmac = function() {
  var IV = new Uint8Array(20);
  function CalcHash(message, key = []){
    key.length && IV.set(crypto.SHA1(key, {asBytes: true}));
    IV.set(crypto.HMAC(crypto.SHA1, Array.from(IV), Array.from(IV), {asBytes: true}));
    XorVector(IV, crypto.SHA1(message, {asBytes: true}));
    return IV;
  }
  return CalcHash;
}();

Page({
  data: {
    devices: [],
    connected: false,
    chs: [],
  },

  onLoad: function(options) {    

  },

  openBluetoothAdapter() {
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              this.startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
  },
  getBluetoothAdapterState() {
    wx.getBluetoothAdapterState({
      success: (res) => {
        console.log('getBluetoothAdapterState', res)
        if (res.discovering) {
          this.onBluetoothDeviceFound()
        } else if (res.available) {
          this.startBluetoothDevicesDiscovery()
        }
      }
    })
  },
  startBluetoothDevicesDiscovery() {
    if (this._discoveryStarted) {
      return
    }
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      services: [service.uuid],
      allowDuplicatesKey: true,
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        this.onBluetoothDeviceFound()
      },
    })
  },
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery()
  },
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
        } else {
          data[`devices[${idx}]`] = device
        }
        this.setData(data)
      })
    })
  },
  createBLEConnection(e) {
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        this.setData({
          connected: true,
          name,
          deviceId,
        })
        this.getBLEDeviceServices(deviceId)
      }
    })
    this.stopBluetoothDevicesDiscovery()
  },
  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: this.data.deviceId
    })
    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
    })
  },
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
            return
          }
        }
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.write) {
            this.setData({
              canWrite: true
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid
            this.writeBLECharacteristicValue()
          }
          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
            })
          }
        }
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
    // 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
      const data = {}
      if (idx === -1) {
        data[`chs[${this.data.chs.length}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      } else {
        data[`chs[${idx}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      }
      // data[`chs[${this.data.chs.length}]`] = {
      //   uuid: characteristic.characteristicId,
      //   value: ab2hex(characteristic.value)
      // }
      this.setData(data)
    })
  },
  writeBLECharacteristicValue() {
    // 向蓝牙设备发送一个0x00的16进制数据
    let buffer = new ArrayBuffer(1)
    let dataView = new DataView(buffer)
    dataView.setUint8(0, Math.random() * 255 | 0)
    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._deviceId,
      characteristicId: this._characteristicId,
      value: buffer,
    })
  },
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  },
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