'use strict';
const chai = require('chai');
const demux = require('../src/index.js').default;
const expect = chai.expect;
const reader = require('read-file');
//de
let flvData;
reader('/devspace/open-mccree/packages/mccree-demuxer-flv/test/test.flv', function(err, buffer) {
  if(!err) {
    flvData = buffer;
  } else {
    flvData = err;
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
let Mccree = {
  observer: {
    trigger:  function(e, m, d) {
      tri = m;
      triMes = d;
    },
    on:  function() {},
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
  loaderBuffer: new ArrayBuffer(),
  getMediaElement: function(){}
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
  demuxer.init(Mccree);
  it('init test', function(){
    expect(flvData).to.be.equal('1');
  });
});

