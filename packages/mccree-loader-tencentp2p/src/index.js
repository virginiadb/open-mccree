import LoaderController from 'mccree-controller-loader';

/**
 * Tencent X-P2P loader.
 * Have the same interface as other loader.
 */
class QVBP2PLoader {
  /**
   * Make sure your browser supports this loader before instantiating it
   * e.g. QVBP2PLoader.isSupported();
   *
   * @returns {boolean}
   */
  static isSupported() {
    let ql = window.qvbp2p;
    if (ql) {
      return ql.supportLoader;
    } else {
      if (window.QVBP2P) {
        return window.QVBP2P.isSupported();
      }
      return false;
    }
  }

  /**
   * Constructor
   *
   * @constructs
   * @param {Object} config - please note that we need a 'rollback' configuration in your 'config' param
   * @param {Function} config.rollback - This method is called when our SDK meets an error.
   */
  constructor(config) {
    this.TAG = 'Mccree-loader-tencentp2p';
    this.type = 'loader';
    this.config = config || {};
    this._initQVBP2P();
  }

  /**
   * Init X-P2P
   * @private
   */
  _initQVBP2P() {
    if (!window.qvbp2p) {
      window.qvbp2p = new window.QVBP2P();
      window.qvbp2p.rollback = this.config.rollback;
      if (this.player) {
        window.qvbp2p.player = this.player;
      }
    }
  }

  /**
   * This function is called when loader intializing, must bind(this).
   *
   * @param {Object} mccree - the mccree core.
   */
  init(mccree) {
    if(!mccree) {
      return
    }
    this.player = mccree;
    window.qvbp2p.player = mccree;
    this.controller = new LoaderController(this);
    this.controller.init.call(this, mccree);
  }

  /**
   * Load source through x-p2p sdk
   *
   * @param {String} source - stream url
   * @param opt - load options
   */
  load(source, opt) {
    if (!window.qvbp2p) {
      this._initQVBP2P.call(this);
    }
    if (!this._onConnected) {
      this.controller.onConnected.call(this, {msg: ''}); // TODO
      this._onConnected = true;
    }
    window.qvbp2p.loadSource({videoId: this.config.videoId, src: source});
    this._cleanLoaderBuffer();
    this.loadPartail(source, {
      start: -1,
      end: -1
    }, opt);
  }

  /**
   * Check and bind
   *
   * @param source
   * @param range
   * @param opts
   */
  loadPartail(source, range, opts) { // partial
    if (!this.mccree) {
      this.logger.warn(this.TAG, 'Live is not init yet');
      return;
    }
    this._bindInterface();
  }

  /**
   * Register callback to x-p2p sdk
   *
   * @private
   */
  _bindInterface() {
    let ql = window.qvbp2p,
      QL = window.QVBP2P;
    if (ql && QL) {
      ql.listen(QL.ComEvents.STATE_CHANGE, this._onStateChange.bind(this));
    } else {
      this.observer.trigger('error', this.errorTypes.OtherError, 'No qvbp2p module found'); // TODO
    }
  }

  /**
   * Receive data from x-p2p sdk
   *
   * @param {String} event - Event registered to SDK for this function
   * @param {Object} data - Data that sent from SDK
   * @private
   */
  _onStateChange(event, data) {
    let CODE = window.QVBP2P.ComCodes;
    let code = data.code;
    switch (code) {
      case CODE.RECEIVE_BUFFER:
        this._receiveBuffer(data);
        break;
      case CODE.HTTP_STATUS_CODE_INVALID:
        break;
      case CODE.BUFFER_EOF:
        break;
      default:
        break;
    }
  }

  /**
   * Receive media data
   *
   * @param {Object} data - object contains media data
   * @param {ArrayBuffer} data.payload - media data
   * @private
   */
  _receiveBuffer(data) {
    if (data.payload instanceof ArrayBuffer) {
      this.mccree.loaderBuffer.push(new Uint8Array(data.payload));
      this.observer.trigger(this.events.FRAG_LOADED, data.payload.byteLength);
    } else {
      let errInfo = {
        code: -1,
        msg: `Mccree-loader-tencentp2p receive buffer is not instanceof ArrayBuffer`
      };
      this.observer.trigger('error', this.errorTypes.NETWORK_ERROR, errInfo.msg);
    }
  }

  /**
   * Unload this loader. Release the x-p2p SDK instance.
   *
   * @returns {Promise}
   */
  unload() {
    let that = this;
    return new Promise((resolve, reject) => {
      that._cleanLoaderBuffer.call(that);
      if (window.qvbp2p) {
        window.qvbp2p.destroy();
        window.qvbp2p = null;
        let errInfo = {
          code: -1,
          msg: `Mccree-loader-tencentp2p is destroyed`
        };
        that.observer.trigger('error', that.errorTypes.NETWORK_ERROR, errInfo.msg);
      }
      resolve();
    });
  }

  /**
   * Clear loader buffer
   *
   * @private
   */
  _cleanLoaderBuffer() {
    this.mccree.loaderBuffer.clear();
  }
}
window.QVBP2PLoader = QVBP2PLoader;
export default QVBP2PLoader;