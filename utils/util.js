if (typeof _util_class == 'undefined')
{
  var axlsign = require('axlsign');
  var crypto = require('Crypto').Crypto;    
  require('SHA1');
  require('HMAC');

  var internalHmac = function() {
    var IV = new Uint8Array(20);
    function CalcHash(message, key = []){
      key.length && IV.set(crypto.SHA1(key, {asBytes: true}));
      if(message.length){
        IV.set(crypto.HMAC(crypto.SHA1, Array.from(IV), Array.from(IV), {asBytes: true}));
        XorVector(IV, crypto.SHA1(message, {asBytes: true}));
      }
      return IV;
    }
    return CalcHash;
  };

  module.exports = {
    XorVector:  function(vec1, vec2) {
      for (var i = 0; i < vec1.length ; ++i) {
        vec1[i] ^= vec2[i];
      }
      return vec1
    },
    generateKeyPair: axlsign.generateKeyPair,
    sign: axlsign.sign,
    sharedKey: axlsign.sharedKey,
    randomBytes: crypto.util.randomBytes,
    hmac: internalHmac()
  };

  String.prototype.format = function () {
    const e = arguments;
    return !!this && this.replace(/\{(\d+)\}/g, function (t, r) {
      return e[r] ? e[r] : t;
    });
  };
}
var _util_class = true;

