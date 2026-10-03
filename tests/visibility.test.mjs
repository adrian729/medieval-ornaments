import test from 'node:test';
import assert from 'node:assert/strict';
import { observeNearViewport } from '../lib/visibility.js';

test('visibility shares one observer, loads once, and releases targets', () => {
  const instances=[];
  class Observer {
    constructor(callback, options) { this.callback=callback;this.options=options;this.targets=new Set();instances.push(this); }
    observe(element) { this.targets.add(element); }
    unobserve(element) { this.targets.delete(element); }
    disconnect() { this.disconnected=true; }
  }
  const ownerDocument={defaultView:{IntersectionObserver:Observer}};
  const a={ownerDocument},b={ownerDocument};let calls=0;
  const cancelA=observeNearViewport(a,()=>calls++),cancelB=observeNearViewport(b,()=>calls++);
  assert.equal(instances.length,1);assert.equal(instances[0].options.rootMargin,'200px');
  instances[0].callback([{target:a,isIntersecting:false}]);assert.equal(calls,0);
  instances[0].callback([{target:a,isIntersecting:true},{target:a,isIntersecting:true}]);assert.equal(calls,1);
  cancelA();cancelB();cancelB();assert.equal(instances[0].targets.size,0);assert.equal(instances[0].disconnected,true);
  observeNearViewport(a,()=>calls++);assert.equal(instances.length,2);
  instances[1].callback([{target:a,isIntersecting:true}]);assert.equal(calls,2);assert.equal(instances[1].disconnected,true);
});

test('visibility loads immediately without an observer or browsing context', () => {
  let calls=0;
  observeNearViewport({ownerDocument:{defaultView:null}},()=>calls++)();
  observeNearViewport({ownerDocument:{defaultView:{}}},()=>calls++)();
  assert.equal(calls,2);
});
