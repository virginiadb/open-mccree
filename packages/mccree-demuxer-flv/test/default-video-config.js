'use strict';
const chai = require('chai');
const videoConfig = require('../src/default-video-config.js').default;
const expect = chai.expect;
describe('test', function(){
  it('test', function(){
    expect(videoConfig).to.be.a('object');
    expect(videoConfig.avcc).to.be.null;
    expect(videoConfig.chromaFormat).to.be.equal(420);
    expect(videoConfig.codec).to.be.equal('avc1.640020');
    expect(videoConfig.codecHeight).to.be.equal(720);
    expect(videoConfig.codecWidth).to.be.equal(1280);
    expect(videoConfig.duration).to.be.equal(0);
    expect(videoConfig.frameRate).to.be.a('object');
    expect(videoConfig.id).to.be.equal(1);
    expect(videoConfig.level).to.be.equal("3.2");
    expect(videoConfig.presentHeight).to.be.equal(720);
    expect(videoConfig.presentWidth).to.be.equal(1280);
    expect(videoConfig.profile).to.be.equal("High");
    expect(videoConfig.refSampleDuration).to.be.equal(40);
    expect(videoConfig.sarRatio).to.be.a('object');
    expect(videoConfig.timescale).to.be.equal(1000);
    expect(videoConfig.type).to.be.equal("video");
  });
});