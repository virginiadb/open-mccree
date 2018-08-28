'use strict';
const chai = require('chai');
const moz = require('../src/index.js').default;
const expect = chai.expect;
describe('module dependency', function(){
  let MesNum = 0;
  let logMsg = '';
  let funArr = [];
  let triMes = '';
  let opened = false;
  let config = {};
  let Mccree = {
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
  
  describe('isSupported', function(){
    it('isSupported', function(){
      expect(moz.isSupported()).to.be.equal(true);
    });
  });

  describe('constructor check', function(){
    it('constructor is a class', function(){
      expect(moz).to.be.a('function');
      expect(moz.prototype).to.be.a('Object');
    })
  });

  describe('module construction', function(){
    it('with config', function() {
      let mozp = new moz(config);
    });
    it('without config', function() {
      try {
        let mozp = new moz();
      } catch (e) {
        expect(e.message).not.to.be.null;
      }
    });
  });

  let mozp2p = new moz(config);
  describe('module init', function(){
    it('init without Mccree', function(){
      try {
        mozp2p.init();
      } catch(e) {
        expect(mozp2p.mccree).to.be.undefined;
      }
    });
    it('init with Mccree', function(){
      mozp2p.init(Mccree);
      expect(mozp2p).to.be.a('Object');
      expect(mozp2p.controller).to.be.a('Object');
    });
  });
  
  describe('load', function(){
    it('load test', function(){
      mozp2p.load('https://www.baidu.com/', 'opt');
    });
  });
  
  describe('unload', function(){
    it('unload test', function(){
      mozp2p.unload();
    });
  });
  
  describe('loadPartail', function(){      
    describe('delay', function(){
      it('delay', function(done){
        setTimeout(function(){
          done()
        }, 1500);
      });
    });
    
    describe('404', function(){
      it('loadPartail with 404 resource', function(done){
        mozp2p.loadPartail('https://pl21.live.panda.tv/live_panda/025cecef3445e0ce71810901e16c8ff8.flv?sign=8e43c8ff6bb43129b6af5e7ad2984974&ts=5b84faff&rid=3026648&add_index_info=1', 'range', 'opts');
        expect(mozp2p.xhr).to.be.a('XMLHttpRequest');
        setTimeout(function(){
          expect(mozp2p.xhr.status).to.be.equal(404);
          mozp2p.xhr.onprogress = null;
          mozp2p.xhr.onreadystatechange = null;
          done();
        },1500);
      });
      
      describe('delay', function(){
        it('delay', function(done){
          setTimeout(function(){
            done()
          }, 1500);
        });
      });
    });
    
    describe('200', function(){
      it('loadPartail with 200 resource', function(done){
        mozp2p.loadPartail('https://s.h2.pdim.gs/static/686fb8fbbbd6adba/ruc_v2.1.6.css', 'range', 'opts');
        expect(mozp2p.xhr).to.be.a('XMLHttpRequest');
        setTimeout(function(){
          expect(mozp2p.xhr.status).to.be.equal(200);
          mozp2p.xhr.onprogress = null;
          mozp2p.xhr.onreadystatechange = null;
          done();
        },1500);
      });
      
      describe('delay', function(){
        it('delay', function(done){
          setTimeout(function(){
            done()
          }, 1500);
        });
      });
    });
    
    describe('without mccree', function(){
      it('loadPartail without mccree', function(){
        mozp2p.mccree = null;
        mozp2p.loadPartail('https://www.baidu.com/', 'range', 'opts');
        expect(logMsg).to.be.equal('Live is not init yet');
      });
    });
  });
});