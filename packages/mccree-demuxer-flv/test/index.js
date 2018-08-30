'use strict';
const chai = require('chai');
const demux = require('../src/index.js').default;
const expect = chai.expect;
const reader = require('read-file');
//de
function strToHexCharCode(str) {
　　if(str === "")
　　　　return "";
　　var hexCharCode = [];
　　hexCharCode.push("0x"); 
　　for(var i = 0; i < str.length; i++) {
　　　　hexCharCode.push((str.charCodeAt(i)).toString(16));
　　}
　　return hexCharCode.join("");
}

let Mccree = {
  observer: {
    trigger:  function(e, m, d) {
      tri = m;
      triMes = d;
    },
    on:  function(signal, func) {
      func();
    },
    off:  function() {}
  },
  events:{
    events: {},
    errorTypes: {},
    errorDetails: {},
    logMsgs: {}
  },
  logger: {
    debug: function(t,m) { logMsg = m; },
    log:function(t,m) { logMsg = m; },
    error: function(t,m) { logMsg = m; },
    info: function(t,m) { logMsg = m; },
    warn: function(t,m) { logMsg = m; }
  },
  loaderBuffer: new ArrayBuffer(10),
  getMediaElement: function(){}
};
Mccree.loaderBuffer.shift = function(num){
  if(!num){
    num = 1;
  }
  let arr = new ArrayBuffer(num);
  for(var j = 0;j < num;j++) {
    arr[j] = Mccree.loaderBuffer[j];
  }
  Mccree.loaderBuffer = Mccree.loaderBuffer.slice(num);
  return arr;
};
reader('/home/daibing/devspace/open-mccree/packages/mccree-demuxer-flv/test/test.flv', function(err, buffer) {
  if(!err) {
    for(var i = 0;i< buffer.length;i++) {
      Mccree.loaderBuffer[i] = buffer[i];
    }
  } else {
    Mccree.loaderBuffer[0] = err;
  }
});
let MesNum = 0;
let tri;
let logMsg = '';
let funArr = [];
let triMes = '';
let opened = false;
let config = {
  rollback: function(){}
};

describe('constructor check', function(){
  it('constructor is a class', function(){
    expect(demux).to.be.a('function');
    expect(demux.prototype).to.be.a('Object');
  })
});

describe('construction', function(){
  let demuxer = new demux(config);
  it('construction check', function(){
    expect(demuxer.TAG).to.be.equal('mccree-demuxer-flv:index');
    expect(demuxer.type).to.be.equal('demuxer');
    expect(demuxer._isFlv).to.be.equal(false);
    expect(demuxer._firstFragLoaded).to.be.equal(false);
    expect(demuxer._hasScript).to.be.equal(false);
    expect(demuxer._hasAudioSequence).to.be.equal(false);
    expect(demuxer._hasVideoSequence).to.be.equal(false);
    expect(demuxer._tracknum).to.be.equal(0);
    expect(demuxer._config).to.be.a('object');
  })
});

let demuxer = new demux(config);
describe('init', function(){  
  it('1', function(done){
    setTimeout(function(){
      demuxer.init(Mccree);
      done();
    }, 1500);
  });
});



