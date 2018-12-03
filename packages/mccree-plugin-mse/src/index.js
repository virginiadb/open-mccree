class MSEController {
  constructor() {
    this.TAG = 'Mccree-plugin-mse';
    this.type = 'plugin';
    this.mediaSource = new window.MediaSource();
    this.mediaElement = null;
    this.seekables = [];
    this.mccree = null;
    this.observer = null;
    this.config = null;
    this._initAppanded = false;
    this.mediaElement = null;
    this.lastSeek = -1;
    this.startTime = undefined;
    this._lastClearTime = 0;
  }

  init(mccree) {
    this.mccree = mccree;
    this.observer = mccree.observer;
    this.config = mccree.config;
    this.logger = mccree.logger;
    this.observer.on('MEDIA_SEGMENT_REMUXED', this._onMediaSegment.bind(this));
  }

  play() {
    this.mediaElement.play();
  }

  checkState() {
    if (this.config.autoReload > 15e3
      && this.mediaElement
      && this.mediaElement.readyState < 3
      && (new Date().getTime()) - this.startTime - (this.mediaElement.currentTime * 1e3) > this.config.autoReload) {
      let that = this;
      this.mccree.reload().then(() => {
        that.startTime = undefined;
      });
    }
    
    if (this.seekables[this.seekables.length - 1] > this.lastSeek
      && this.mediaElement
      && this.mediaElement.readyState === 2
      && this.seekables.length > 1
    ) {
      this.mediaElement.currentTime = this.seekables[this.seekables.length - 1] / 1e3;
      this.lastSeek = this.seekables[this.seekables.length - 1];
    }

    if (this.seekables[this.seekables.length - 1] > this.lastSeek
      && this.mediaElement
      && this.mediaElement.readyState === 1
      && this.mediaElement.currentTime > 0
      && this.seekables.length > 1
    ) {
      this.mediaElement.currentTime = this.seekables[this.seekables.length - 1] / 1e3;
      this.lastSeek = this.seekables[this.seekables.length - 1];
    }

    if (this.seekables[this.seekables.length - 1] > this.lastSeek
      && this.mediaElement
      && this.seekables.length > 1
      && this.mediaElement.readyState < 3
      && this.mediaElement.currentTime < ((this.seekables[this.seekables.length - 1] / 1e3) - 10)
    ) {
      this.mediaElement.currentTime = this.seekables[this.seekables.length - 1] / 1e3;
      this.lastSeek = this.seekables[this.seekables.length - 1];
      this.logger.debug(this.TAG, 'Chase frame to ' + (this.seekables[this.seekables.length - 1] / 1e3));
    }

    this._onMediaSegment();
  }

  clearBuffer() {
    if (!this.mediaElement) {
      return;
    }
    if ((new Date().getTime() - this.startTime - this._lastClearTime) / 1000 < 30) {
      return;
    }

    // 降低消耗，一分钟取一次差不多了。
    let playTime = this.mediaElement.currentTime;

    // 降低消耗，一分钟清一次差不多了。
    if (playTime - this._lastClearTime < 30) {
      return;
    }

    if (this.asourceBuffer && this.vsourceBuffer && !this.vsourceBuffer.updating && !this.asourceBuffer.updating) {
      this.vsourceBuffer.remove(this._lastClearTime, playTime - 10);
      this.asourceBuffer.remove(this._lastClearTime, playTime - 10);
      this._lastClearTime = playTime - 10;
      this.logger.debug(this.TAG, this.logMsgs.CACHE_CLEAR);
      while (this.seekables && this.seekables.length > 0 && this.seekables[0] / 1e3 < playTime - 10) {
        this.seekables.shift();
      }
    }
  }

  attachMediaElement(mediaElement) {
    this.mediaElement = mediaElement;
    this.mediaElement.loop = true;
    this.mediaSourceObjectURL = window.URL.createObjectURL(this.mediaSource);
    this.mediaElement.src = this.mediaSourceObjectURL;
    this.mediaElement.onerror = this.onError.bind(this);
    this.mediaElement.oncanplay = this.recordStartTime.bind(this);
    this.mediaElement.onstalled = this.checkState.bind(this);
  }

  detachMediaElement() {
    if (this.mediaElement) {
      this.mediaElement.onerror = null;
      this.mediaElement.oncanplay = null;
      this.mediaElement.onstalled = null;
    }
  }
  
  _onMediaSegment() {
    // currently the player will play when 500ms data is ready in the buffer.
    if (!this._initAppanded && this.mccree.remuxBuffer.lastDts > 500) {
      this._onInitSegment.call(this);
    }

    this.clearBuffer.call(this);

    if (this.mccree.remuxBuffer.video.length < 1 || this.mccree.remuxBuffer.audio.length < 1) {
      return;
    }

    if (this.asourceBuffer && this.vsourceBuffer && !this.vsourceBuffer.updating && !this.asourceBuffer.updating) {
      try {
        if (!this.mediaElement.error && this.mccree.remuxBuffer.lastDts > 500) {
          let vdata = this.mccree.remuxBuffer.video.shift();
          let adata = this.mccree.remuxBuffer.audio.shift();
          this.vsourceBuffer.appendBuffer(vdata.data);
          this.asourceBuffer.appendBuffer(adata.data);
          if (!this.seekables) {
            this.seekables = [];
          }
          if (vdata.seekable && vdata.timestamp > 0) {
            this.seekables.push(vdata.timestamp);
          }
          this.checkState.bind(this);
        } else if (this.mediaElement.error) {
          this.observer.trigger('error', this.events.errorTypes.MEDIA_ERROR, "MediaMSEError", {
            code: 11
          });
        }
      } catch (e) {
        if (e.code) {
          this.observer.trigger('error', this.events.errorTypes.MEDIA_ERROR, "MediaMSEError", {
            code: 11
          });
        }
        this.logger.error(this.TAG, 'Cache error of ' + e.code);
      }
    }
  }

  _onInitSegment() {
    this.seekables = [];
    if (this.mediaSource.readyState !== 'open') {
      this.mediaSource.addEventListener('sourceopen', this._appendInitSegment.bind(this));
    } else {
      this._appendInitSegment();
    }
  }

  _appendInitSegment() {
    let data = this.mccree.initSegment;
    if (this._initAppanded || !data) {
      return;
    }
    this._initAppanded = true;
    this.asourceBuffer = this.mediaSource.addSourceBuffer('audio/mp4;codecs=' + this.mccree.media.tracks.audioTrack.meta.codec);
    this.asourceBuffer.appendBuffer(data.audio);
    this.vsourceBuffer = this.mediaSource.addSourceBuffer('video/mp4;codecs=' + this.mccree.media.tracks.videoTrack.meta.codec);
    this.vsourceBuffer.appendBuffer(data.video);

    this._onMediaSegment();
    this.asourceBuffer.addEventListener('error', this.onError.bind(this));
    this.vsourceBuffer.addEventListener('error', this.onError.bind(this));
    this.mediaSource.addEventListener('error', this.onError.bind(this));
    this.vsourceBuffer.addEventListener('updateend', this.checkState.bind(this));
    try {
      if (this.media && this.media.mediaInfo && this.media.mediaInfo.cdn_ip) {
        this.mccree.cdnip = this.media.mediaInfo.cdn_ip;
      } else if (!this.url) {
        this.mccree.cdnip = '0.0.0.0';
      } else {
        let cdnip = this.url.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/);
        this.mccree.cdnip = cdnip && cdnip[0];
      }

      let audiocodec = '';
      let videocodec = '';
      if (!this.mccree.media) {
        audiocodec = 'Mccree uninitailized';
      } else if (!this.mccree.media.tracks.audioTrack) {
        audiocodec = 'ATNF';
      } else if (!this.mccree.media.tracks.audioTrack.meta) {
        audiocodec = 'AMNF';
      } else {
        audiocodec = this.mccree.media.tracks.audioTrack.meta.codec;
      }

      if (!this.mccree.media) {
        videocodec = '';
      } else if (!this.mccree.media.tracks.videoTrack) {
        videocodec = 'VTNF';
      } else if (!this.mccree.media.tracks.videoTrack.meta) {
        videocodec = 'VMNF';
      } else {
        videocodec = this.mccree.media.tracks.videoTrack.meta.codec;
      }

      let info = {
        mimeType: 'flv;codecs="' + audiocodec + ',' + videocodec + '"',
        metadata: {
          encoder: this.mccree.media ? this.mccree.media.mediaInfo.encoder : 'UNKNOWN'
        },
        audioChannelCount: this.mccree.media ? this.mccree.media.mediaInfo.audiochannels : 0,
        audioDataRate: this.mccree.media ? this.mccree.media.mediaInfo.audiodatarate : 0,
        audioSampleRate: this.mccree.media ? this.mccree.media.mediaInfo.audiosamplerate : 0,
        fps: this.mccree.media ? this.mccree.media.tracks.videoTrack.meta.frameRate.fps : 0,
        videoDataRate: this.mccree.media ? this.mccree.media.mediaInfo.videodatarate : 0,
        height: this.mccree.media ? this.mccree.media.mediaInfo.height : 0,
        width: this.mccree.media ? this.mccree.media.mediaInfo.width : 0,
        cdnip: this.mccree.media ? this.mccree.media.mediaInfo.cdn_ip : this.mccree.cdnip
      };
      this.observer.trigger('media_info', info);
    } catch (e) {
      this.logger.error(this.TAG, 'Cache error of ' + e.code);
    }
  }
  
  pause() {
    this.mediaElement.pause();
  }

  destroy() {
    this.removeSourceBuffer();
    this.detachMediaElement();
    this.asourceBuffer = null;
    this.vsourceBuffer = null;
    this.mediaSource = null;
    this._lastClearTime = 0;
    this.seekables = [];
  }

  removeSourceBuffer () {
    this._initAppanded = false;
    this.mediaElement.pause();
    URL.revokeObjectURL(this.mediaElement.src);
    this.asourceBuffer && this.asourceBuffer.removeEventListener('error', this.onError.bind(this));
    this.vsourceBuffer && this.vsourceBuffer.removeEventListener('error', this.onError.bind(this));
    this.vsourceBuffer && this.vsourceBuffer.removeEventListener('updateend', this.checkState.bind(this));
    if (this.mediaSource && this.mediaSource.sourceBuffers.length > 1) {
      this.mediaSource.removeSourceBuffer(this.asourceBuffer);
      this.mediaSource.removeSourceBuffer(this.vsourceBuffer);
    }
  }

  onError(error) {
    if (this.mediaElement && this.mediaElement.error && !this.reloading) {
      this.observer.trigger('error', this.events.errorTypes.MEDIA_ERROR, "MediaMSEError", {
        code: 11
      });
    } else {
      this.observer.trigger('error', this.events.errorTypes.OtherError, this.events.errorDetails.UNKNOWN);
    }
  }

  recordStartTime() {
    if (!this.startTime) {
      this.startTime = new Date().getTime();
    }
  }
}

export default MSEController;