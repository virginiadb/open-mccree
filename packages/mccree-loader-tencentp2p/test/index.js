'use strict';
const chai = require('chai');
const txp2p = require('../src/index.js').default;
const expect = chai.expect;
describe('module dependency', function(){
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
    loaderBuffer: {
      push: function(data) {},
      clear: function() {}
    },
    getMediaElement: function(){}
  };
  window.QVBP2P = function(){
    return function(){
      this.isSupported = function(){return true};
      this.loadSource = function(obj){};
      this.destroy = function(){};
      this.loadSource = function(obj){};
      this.listen = function(opt, fun){
        fun('event', {code:'1'});
        fun('event', {code:'2'});
        fun('event', {code:'3'});
        fun('event', {code:'4'});
        fun('event', {code:'5'});
      };
    };
  }();
  window.qvbp2p = {
    supportLoader: true,
    destroy: function(){}
  }

  describe('isSupported', function(){
    it('qvbp2p Supported', function(){
      expect(txp2p.isSupported()).to.be.equal(true);
    });
    
    it('QVBP2P Supported', function(){
      window.qvbp2p = null;
      window.QVBP2P = {
        isSupported: function(){return true}
      };
      expect(txp2p.isSupported()).to.be.equal(true);
    });
    
    it('not Supported', function(){
      window.qvbp2p = null;
      window.QVBP2P = null;
      expect(txp2p.isSupported()).to.be.equal(false);
    });
  });

  describe('constructor check', function(){
    it('constructor is a class', function(){
      expect(txp2p).to.be.a('function');
      expect(txp2p.prototype).to.be.a('Object');
    })
  });

  describe('module construction', function(){
    it('with config', function() {
      window.QVBP2P = function(){
        return function(){
          this.isSupported = function(){return true};
          this.loadSource = function(obj){};
        }
      }();
      let tx = new txp2p(config);
    });
    it('without config', function() {
      window.QVBP2P = function(){
        return function(){
          this.isSupported = function(){return true};
          this.loadSource = function(obj){};
        }
      }();
      let tx = new txp2p();
    });
    it('without qvbp2p', function() {
      window.QVBP2P = function(){
        return function(){
          this.isSupported = function(){return true};
          this.loadSource = function(obj){};
        }
      }();
      window.qvbp2p = null;
      let tx = new txp2p(config);
    });
  });

  let tx = new txp2p(config);
  describe('module init', function(){
    it('init without Mccree', function(){
      tx.init(); 
    });
    it('init with Mccree', function(){
      window.qvbp2p = {};
      tx.init(Mccree);
      expect(tx).to.be.a('Object');
      expect(tx.controller).to.be.a('Object');
      expect(window.qvbp2p.player).to.be.a('Object');
    });
  });
  
  tx.init(Mccree);
  describe('load', function(){
    it('init', function(){
      window.QVBP2P = function(){
        return function(){
          this.isSupported = function(){return true};
          this.loadSource = function(obj){};
          this.destroy = function(){};
          this.loadSource = function(obj){};
          this.listen = function(opt, fun){
            fun('event', {code:'2'});
            fun('event', {code:'3'});
            fun('event', {code:'4'});
            fun('event', {code:'5'});
          };
        };
      }();
      window.QVBP2P.ComEvents = {
        STATE_CHANGE: '1',
      };
      window.QVBP2P.ComCodes = {
        RECEIVE_BUFFER: '2',
        HTTP_STATUS_CODE_INVALID: '3',
        BUFFER_EOF: '4'
      };
      window.qvbp2p = null;
      tx._onConnected = false;
      tx.load('source', {});
    });
  });
  
  describe('loadPartail without mccree', function(){
    it('loadPartail without mccree',function(){
      tx.mccree = null;
      tx.loadPartail();
      expect(logMsg).to.be.equal('Live is not init yet');
    });
  });
  
  describe('bindInterface without qvbp2p either QVBP2P', function(){
    it('bindInterface without qvbp2p either QVBP2P', function(){
      window.QVBP2P = null;
      tx._bindInterface();
      expect(triMes).to.be.equal('No qvbp2p module found');
    });
  });
  
  describe('unload', function(){
    it('unload', function(){
      tx.mccree = {
        observer: {
          trigger:  function(e, m, d) {
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
        loaderBuffer: {
          push: function(data) {},
          clear: function() {}
        },
        getMediaElement: function(){}
      };
      window.qvbp2p.destroy = function(){};
      tx.unload.call(tx);
      expect(triMes).to.be.equal('Mccree-loader-tencentp2p is destroyed');
    });
  });
  
  describe('initQVBP2P with player', function(){
    it('initQVBP2P with player', function(){
      window.QVBP2P = function(){
        return function(){
          this.isSupported = function(){return true};
          this.loadSource = function(obj){};
          this.destroy = function(){};
        }
      }();
      tx.player = Mccree;
      tx._initQVBP2P.call(tx);
      expect(window.qvbp2p.player).to.be.a('object')
    });
  });
  
  describe('receive right data', function(){
    it('receive right data', function(){
      let payload = new ArrayBuffer(2);
      let data = {
        payload: payload
      };
      tx._receiveBuffer(data);
      expect(tri).to.be.equal(2);
    });
  });
});