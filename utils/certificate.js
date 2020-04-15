export default class Certificate {
  constructor() {
    this.publicKey = new Uint8Array(32);
    this.vaildity = {
      time: Uint32Array.of( ~0 ),
      count: Uint8Array.of( ~0 )
    };
    this.constrain = Uint8Array.of( ~0 );
    this.signature = new Uint8Array(64);
    this.issueCert = null;
  }
  serialize(isSigning = true, binary = new Uint8Array(255)) {
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
    if ( isSigning ) {
      binary.set(this.signature, begin);
      begin += this.signature.length;
    }
    if ( this.issueCert )
      len = this.issueCert.serialize(isSigning, binary.subarray(begin, binary.length)).length;
    return binary.subarray(0, begin + len);
  }
  static unserialize(binary) {
    var cert = new Certificate();
    var begin = 0, end = 0;
    end += cert.publicKey.length;
    cert.publicKey.set(binary.subarray(begin, end));
    begin = end; end += Uint32Array.BYTES_PER_ELEMENT; 
    var time = binary.subarray(begin, end);
    cert.vaildity.time.set(new Uint32Array(time.buffer, time.byteOffset, Uint8Array.BYTES_PER_ELEMENT));
    begin = end; end += cert.vaildity.count.length;
    cert.vaildity.count.set(binary.subarray(begin, end));
    begin = end; end += cert.constrain.length;
    cert.constrain.set(binary.subarray(begin, end));
    begin = end; end += cert.signature.length;
    cert.signature.set(binary.subarray(begin, end));
    if ( end != binary.length ) {
      var issueCert = new Certificate();
      begin = end; end = binary.length;
      issueCert.unserialize(binary.subarray(begin, end));
      cert.issueCert = issueCert;
    }
    return cert;
  }
}