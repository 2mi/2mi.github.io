var axlsign = require('../utils/util');

export const cert_flags = { noneSign: 1, nonePrivKey: 2, make: 3 };

export default class Certificate {
  constructor() {   
    this.privateKey = new Uint8Array(32);
    this.publicKey = new Uint8Array(32);
    this.vaildity = {
      time: Uint32Array.of( ~0 ),
      count: Uint8Array.of( ~0 )
    };
    this.constrain = Uint8Array.of( -1 );
    this.signature = new Uint8Array(64);
    this.issueCert = null;
  }
  getDate(){
    return new Date(Date.parse('2020/1/1') + this.vaildity.time * 1000);
  }
  setDate(date = Date()){
    this.vaildity.time.set(Uint32Array.of((date.getTime() - Date.parse('2020/1/1')) / 1000));
  }
  authorize(issueCert){
    this.signature.set(axlsign.sign(issueCert.privateKey, this.serialize(cert_flags.make)));
    if ( issueCert != this )
      this.issueCert = issueCert;
  }
  serialize(flag = 0, binary = new Uint8Array(512)) {
    var begin = 0, len = 0;
    binary.set(this.publicKey, begin);
    begin += this.publicKey.length;
    var time = new Uint8Array(this.vaildity.time.buffer, this.vaildity.time.byteOffset, this.vaildity.time.byteLength);    
    binary.set(time, begin);
    begin += time.length;
    binary.set(this.vaildity.count, begin);
    begin += this.vaildity.count.length;
    binary.set(this.constrain, begin);
    begin += this.constrain.length;
    if ( !(flag & cert_flags.noneSign) ) {
      binary.set(this.signature, begin);
      begin += this.signature.length;
    }
    if ( !(flag & cert_flags.nonePrivKey) ) {
      binary.set(this.privateKey, begin);
      begin += this.privateKey.length;
    }
    if ( this.issueCert )
      len = this.issueCert.serialize(flag, binary.subarray(begin, binary.length)).length;
    return binary.subarray(0, begin + len);
  }
  static unserialize(binary, cert = new Certificate()) {
    var begin = 0, end = 0;
    end += cert.publicKey.length;
    cert.publicKey.set(binary.subarray(begin, end));
    begin = end; end += Uint32Array.BYTES_PER_ELEMENT; 
    var time = binary.slice(begin, end);
    cert.vaildity.time.set(new Uint32Array(time.buffer, time.byteOffset, Uint8Array.BYTES_PER_ELEMENT));
    begin = end; end += cert.vaildity.count.length;
    cert.vaildity.count.set(binary.subarray(begin, end));
    begin = end; end += cert.constrain.length;
    cert.constrain.set(binary.subarray(begin, end));
    begin = end; end += cert.signature.length;
    cert.signature.set(binary.subarray(begin, end));
    begin = end; end += cert.privateKey.length;
    cert.privateKey.set(binary.subarray(begin, end));
    if ( end != binary.length ) {
      begin = end; end = binary.length;
      cert.issueCert = Certificate.unserialize(binary.subarray(begin, end));
    }
    return cert;
  }
}