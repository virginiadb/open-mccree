'use strict';

import Mccree from 'mccree-core';
import FetchLoader from 'mccree-loader-fetch';
import MozLoader from 'mccree-loader-moz-xhr';
import Browser from 'mccree-helper-browser';
import Demux from 'mccree-demuxer-flv';
import HEVCRemux from 'mccree-remuxer-hevc';
import H264Remux from 'mccree-remuxer-mp4live';
import H264MSEController from 'mccree-plugin-mse';
import HEVCMSEController from 'mccree-plugin-mse-hevc';
import XYVPLoader from 'mccree-loader-xyp2p';
import QVBP2PLoader from 'mccree-loader-tencentp2p';

export class PandaMccreeLive extends Mccree {
  constructor(modules, config) {
    let browser = Browser.uaMatch(navigator.userAgent);
    let loader = null;
    let usep2p = false;
    if (config.usep2p == 'xy' && XYVPLoader.isSupported()) {
      loader = new XYVPLoader();
      usep2p = 'xy';
    } else if (config.usep2p == 'tencent' && QVBP2PLoader.isSupported()) {
      loader = new QVBP2PLoader({
        videoId: config.videoId
      });
      usep2p = 'tencent';
    } else if (browser.mozilla) {
      loader = new MozLoader();
    } else {
      loader = new FetchLoader();
    }
    let demuxer = new Demux();
    let remuxer = null;
    if(config.useHEVC) {
      remuxer = new HEVCRemux();
    }else{
      remuxer = new H264Remux();
    }

    config = config || {};
    if (!config.autoReload) {
      config.autoReload = 6e3;
    }
    config.loaderBufferLimit = config.loaderBufferLimit || 5e7;
    let logger = null;
    if (modules.logger) {
      logger = modules.logger;
    }

    super({
      logger: logger,
      loader: loader,
      demux: demuxer,
      remux: remuxer
    }, config);
	  this.TAG = 'panda-mccree-live';
    this.logger.debug(this.TAG, `Live initialization,use P2P:${usep2p}`);
    this.remux.remux();
    this.canvas = document.getElementById(this.config.canvasid);
    let that = this;
    this.observer.on('METADATA_CHANGED', function() {
      if (!that.reloading) {
        that.reload.call(that);
      }
    });
    this.initStatistic();
    this.version = '1.1.1-0';
	  this.logger.info(this.TAG, `Current version: ${this.version}`);
    if(this.config.useHEVC){
      this.mseController = new HEVCMSEController();
    }else{
      this.mseController = new H264MSEController();
    }
    this.mseController.init(this);
    this.on = this.observer.on;
  }

  // 抹平flvjs接口，并不能用
  isSupport() {
    return true;
  }

  checkState() {
    if (this.reloading) {
      return;
    }
    this.mseController.checkState();
  }

  clearBuffer() {
    this.mseController.clearBuffer();
  }

  load(url) {
    this.logger.info(this.TAG, `loadurl ${url}`);
    this.originUrl = url;
    this.loader.load(url);
  }

  play() {
    this.mediaElement.play();
  }

  destroy() {
    let that = this;
    this.logger.debug(that.TAG, this.logMsgs.LIVE_DESTORYING);
    this.off();
    let promise = new Promise((resolve, reject) => {
      clearInterval(that.statisticTimmer);
      that.statisticTimmer = null;
      that.unload().then(res => {
        if (!this.mediaSource || !this.asourceBuffer || !this.vsourceBuffer) {
          resolve('already destroyed');
          return;
        }
        that.mseController.destroy();
        that.detachMedia();
        this.media = null;
        that.cdnip = null;
        that.loader = null;
        that.remux = null;
        that.demux = null;
        that.logger.debug(that.TAG, this.logMsgs.LIVE_DESTORYED);
        resolve('destroyed');
      }).catch(err => {
        resolve('destroyed');
      });
    });
    return promise;
  }

  pause() {
    this.mseController.pause();
  }

  reload() {
    let tempurl = this.originUrl;
    let tempelem = this.getMediaElement();
    let that = this;
    that.reloading = true;
    return new Promise((resolve, reject) => {
      that.loader.unload().then(res => {
        that.mseController.detachMediaElement();
        that.media.tracks = {};
        that.remuxBuffer = {
          audio: [],
          video: []
        };
        that.loaderBuffer.clear();
        that.demux.reset();
        that.remux.destroy();
        that.mseController.removeSourceBuffer();
        that.mseController.attachMediaElement(tempelem);
        that.loader.load(tempurl);
        that.reloading = false;
        resolve();
      }).catch(err => {
        that.reloading = false;
        resolve();
      });
    });

  }

  getMediaElement() {
    return this.mseController.mediaElement;
  }

  initStatistic() {
    this.loadbytes = 0;
    this.droppedFrames = 0;
    this.decodedFrames = 0;
    let that = this;
    this.observer.on(this.events.events.FRAG_LOADED, function(bytes) {
      that.loadbytes += bytes;
    });

    this.observer.on('MEDIA_SEGMENT_REMUXED', function(num) {
      if (num) {
        that.decodedFrames += num;
      }
    });
    this.observer.on('FRAME_DROPPED', function(num) {
      if (num) {
        that.droppedFrames += num;
      }
    });
    this.statisticTimmer = setInterval(this._onStatistic.bind(this), 1e3);
  }

  _onStatistic() {
    try {
      if (this.statisticTimmer) {
        this.observer.trigger('statistics_info', {
          droppedFrames: this.droppedFrames,
          decodedFrames: this.decodedFrames + this.droppedFrames,
          speed: Math.floor(this.loadbytes / 1e3)
        });
        this.loadbytes = 0;
      }
    } catch (e) {
      
    }
  }

  attachMediaElement(mediaElement) {
    if (!mediaElement) {
      return;
    }
    this.mseController.attachMediaElement(mediaElement);
  }

  recordStartTime() {
    if (!this.startTime) {
      this.startTime = new Date().getTime();
    }
  }

  detachMediaElement() {
    this.mseController.detachMediaElement();
  }
}

export default PandaMccreeLive;