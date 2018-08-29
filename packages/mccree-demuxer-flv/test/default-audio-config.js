'use strict';
const chai = require('chai');
const audioConfig = require('../src/default-audio-config.js').default;
const expect = chai.expect;
describe('test', function(){
  it('test', function(){
    expect(audioConfig).to.be.a('object');
    expect(audioConfig.audioSampleRate).to.be.equal(48000);
    expect(audioConfig.channelCount).to.be.equal(2);
    expect(audioConfig.codec).to.be.equal("mp4a.40.2");
    expect(audioConfig.config).to.be.a('array');
    expect(audioConfig.duration).to.be.equal(0);
    expect(audioConfig.id).to.be.equal(2);
    expect(audioConfig.refSampleDuration).to.be.equal(21);
    expect(audioConfig.sampleRateIndex).to.be.equal(3);
    expect(audioConfig.timescale).to.be.equal(1000);
    expect(audioConfig.type).to.be.equal("audio");
  });
});