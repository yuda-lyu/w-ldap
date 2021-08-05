/*!
 * w-ldap v1.0.3
 * (c) 2018-2021 yuda-lyu(semisphere)
 * Released under the MIT License.
 */
!function(t,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r(require("path"),require("fs"),require("process"),require("crypto"),require("child_process")):"function"==typeof define&&define.amd?define(["path","fs","process","crypto","child_process"],r):(t="undefined"!=typeof globalThis?globalThis:t||self)["w-ldap"]=r(t.path,t.fs,t.process,t.require$$0,t.child_process)}(this,(function(t,r,e,n,o){"use strict";function i(t){return t&&"object"==typeof t&&"default"in t?t:{default:t}}var a=i(t),u=i(r),c=i(e),f=i(n),s=i(o);function l(t,r,e,n,o,i,a){try{var u=t[i](a),c=u.value}catch(t){return void e(t)}u.done?r(c):Promise.resolve(c).then(n,o)}function p(t){return function(){var r=this,e=arguments;return new Promise((function(n,o){var i=t.apply(r,e);function a(t){l(i,n,o,a,u,"next",t)}function u(t){l(i,n,o,a,u,"throw",t)}a(void 0)}))}}function h(t){return(h="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}var v="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function y(t){var r={exports:{}};return t(r,r.exports),r.exports}var d=y((function(t){var r=function(t){var r,e=Object.prototype,n=e.hasOwnProperty,o="function"==typeof Symbol?Symbol:{},i=o.iterator||"@@iterator",a=o.asyncIterator||"@@asyncIterator",u=o.toStringTag||"@@toStringTag";function c(t,r,e,n){var o=r&&r.prototype instanceof d?r:d,i=Object.create(o.prototype),a=new P(n||[]);return i._invoke=function(t,r,e){var n=s;return function(o,i){if(n===p)throw new Error("Generator is already running");if(n===v){if("throw"===o)throw i;return k()}for(e.method=o,e.arg=i;;){var a=e.delegate;if(a){var u=S(a,e);if(u){if(u===y)continue;return u}}if("next"===e.method)e.sent=e._sent=e.arg;else if("throw"===e.method){if(n===s)throw n=v,e.arg;e.dispatchException(e.arg)}else"return"===e.method&&e.abrupt("return",e.arg);n=p;var c=f(t,r,e);if("normal"===c.type){if(n=e.done?v:l,c.arg===y)continue;return{value:c.arg,done:e.done}}"throw"===c.type&&(n=v,e.method="throw",e.arg=c.arg)}}}(t,e,a),i}function f(t,r,e){try{return{type:"normal",arg:t.call(r,e)}}catch(t){return{type:"throw",arg:t}}}t.wrap=c;var s="suspendedStart",l="suspendedYield",p="executing",v="completed",y={};function d(){}function g(){}function b(){}var _={};_[i]=function(){return this};var m=Object.getPrototypeOf,w=m&&m(m(E([])));w&&w!==e&&n.call(w,i)&&(_=w);var j=b.prototype=d.prototype=Object.create(_);function O(t){["next","throw","return"].forEach((function(r){t[r]=function(t){return this._invoke(r,t)}}))}function x(t,r){function e(o,i,a,u){var c=f(t[o],t,i);if("throw"!==c.type){var s=c.arg,l=s.value;return l&&"object"===h(l)&&n.call(l,"__await")?r.resolve(l.__await).then((function(t){e("next",t,a,u)}),(function(t){e("throw",t,a,u)})):r.resolve(l).then((function(t){s.value=t,a(s)}),(function(t){return e("throw",t,a,u)}))}u(c.arg)}var o;this._invoke=function(t,n){function i(){return new r((function(r,o){e(t,n,r,o)}))}return o=o?o.then(i,i):i()}}function S(t,e){var n=t.iterator[e.method];if(n===r){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=r,S(t,e),"throw"===e.method))return y;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return y}var o=f(n,t.iterator,e.arg);if("throw"===o.type)return e.method="throw",e.arg=o.arg,e.delegate=null,y;var i=o.arg;return i?i.done?(e[t.resultName]=i.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=r),e.delegate=null,y):i:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,y)}function A(t){var r={tryLoc:t[0]};1 in t&&(r.catchLoc=t[1]),2 in t&&(r.finallyLoc=t[2],r.afterLoc=t[3]),this.tryEntries.push(r)}function L(t){var r=t.completion||{};r.type="normal",delete r.arg,t.completion=r}function P(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(A,this),this.reset(!0)}function E(t){if(t){var e=t[i];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var o=-1,a=function e(){for(;++o<t.length;)if(n.call(t,o))return e.value=t[o],e.done=!1,e;return e.value=r,e.done=!0,e};return a.next=a}}return{next:k}}function k(){return{value:r,done:!0}}return g.prototype=j.constructor=b,b.constructor=g,b[u]=g.displayName="GeneratorFunction",t.isGeneratorFunction=function(t){var r="function"==typeof t&&t.constructor;return!!r&&(r===g||"GeneratorFunction"===(r.displayName||r.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,b):(t.__proto__=b,u in t||(t[u]="GeneratorFunction")),t.prototype=Object.create(j),t},t.awrap=function(t){return{__await:t}},O(x.prototype),x.prototype[a]=function(){return this},t.AsyncIterator=x,t.async=function(r,e,n,o,i){void 0===i&&(i=Promise);var a=new x(c(r,e,n,o),i);return t.isGeneratorFunction(e)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},O(j),j[u]="Generator",j[i]=function(){return this},j.toString=function(){return"[object Generator]"},t.keys=function(t){var r=[];for(var e in t)r.push(e);return r.reverse(),function e(){for(;r.length;){var n=r.pop();if(n in t)return e.value=n,e.done=!1,e}return e.done=!0,e}},t.values=E,P.prototype={constructor:P,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(L),!t)for(var e in this)"t"===e.charAt(0)&&n.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=r)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function o(n,o){return u.type="throw",u.arg=t,e.next=n,o&&(e.method="next",e.arg=r),!!o}for(var i=this.tryEntries.length-1;i>=0;--i){var a=this.tryEntries[i],u=a.completion;if("root"===a.tryLoc)return o("end");if(a.tryLoc<=this.prev){var c=n.call(a,"catchLoc"),f=n.call(a,"finallyLoc");if(c&&f){if(this.prev<a.catchLoc)return o(a.catchLoc,!0);if(this.prev<a.finallyLoc)return o(a.finallyLoc)}else if(c){if(this.prev<a.catchLoc)return o(a.catchLoc,!0)}else{if(!f)throw new Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return o(a.finallyLoc)}}}},abrupt:function(t,r){for(var e=this.tryEntries.length-1;e>=0;--e){var o=this.tryEntries[e];if(o.tryLoc<=this.prev&&n.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=r&&r<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=r,i?(this.method="next",this.next=i.finallyLoc,y):this.complete(a)},complete:function(t,r){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&r&&(this.next=r),y},finish:function(t){for(var r=this.tryEntries.length-1;r>=0;--r){var e=this.tryEntries[r];if(e.finallyLoc===t)return this.complete(e.completion,e.afterLoc),L(e),y}},catch:function(t){for(var r=this.tryEntries.length-1;r>=0;--r){var e=this.tryEntries[r];if(e.tryLoc===t){var n=e.completion;if("throw"===n.type){var o=n.arg;L(e)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:E(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=r),y}},t}(t.exports);try{regeneratorRuntime=r}catch(t){Function("r","regeneratorRuntime = r")(r)}})),g=Array.isArray,b="object"==h(v)&&v&&v.Object===Object&&v,_="object"==("undefined"==typeof self?"undefined":h(self))&&self&&self.Object===Object&&self,m=b||_||Function("return this")(),w=m.Symbol,j=Object.prototype,O=j.hasOwnProperty,x=j.toString,S=w?w.toStringTag:void 0;var A=function(t){var r=O.call(t,S),e=t[S];try{t[S]=void 0;var n=!0}catch(t){}var o=x.call(t);return n&&(r?t[S]=e:delete t[S]),o},L=Object.prototype.toString;var P=function(t){return L.call(t)},E=w?w.toStringTag:void 0;var k=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":E&&E in Object(t)?A(t):P(t)};var z=function(t){return null!=t&&"object"==h(t)};var B=function(t){return"symbol"==h(t)||z(t)&&"[object Symbol]"==k(t)},N=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,F=/^\w*$/;var I=function(t,r){if(g(t))return!1;var e=h(t);return!("number"!=e&&"symbol"!=e&&"boolean"!=e&&null!=t&&!B(t))||(F.test(t)||!N.test(t)||null!=r&&t in Object(r))};var T=function(t){var r=h(t);return null!=t&&("object"==r||"function"==r)};var C,M=function(t){if(!T(t))return!1;var r=k(t);return"[object Function]"==r||"[object GeneratorFunction]"==r||"[object AsyncFunction]"==r||"[object Proxy]"==r},U=m["__core-js_shared__"],$=(C=/[^.]+$/.exec(U&&U.keys&&U.keys.IE_PROTO||""))?"Symbol(src)_1."+C:"";var D=function(t){return!!$&&$ in t},R=Function.prototype.toString;var G=function(t){if(null!=t){try{return R.call(t)}catch(t){}try{return t+""}catch(t){}}return""},q=/^\[object .+?Constructor\]$/,H=Function.prototype,V=Object.prototype,W=H.toString,J=V.hasOwnProperty,Y=RegExp("^"+W.call(J).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");var K=function(t){return!(!T(t)||D(t))&&(M(t)?Y:q).test(G(t))};var Q=function(t,r){return null==t?void 0:t[r]};var X=function(t,r){var e=Q(t,r);return K(e)?e:void 0},Z=X(Object,"create");var tt=function(){this.__data__=Z?Z(null):{},this.size=0};var rt=function(t){var r=this.has(t)&&delete this.__data__[t];return this.size-=r?1:0,r},et=Object.prototype.hasOwnProperty;var nt=function(t){var r=this.__data__;if(Z){var e=r[t];return"__lodash_hash_undefined__"===e?void 0:e}return et.call(r,t)?r[t]:void 0},ot=Object.prototype.hasOwnProperty;var it=function(t){var r=this.__data__;return Z?void 0!==r[t]:ot.call(r,t)};var at=function(t,r){var e=this.__data__;return this.size+=this.has(t)?0:1,e[t]=Z&&void 0===r?"__lodash_hash_undefined__":r,this};function ut(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}ut.prototype.clear=tt,ut.prototype.delete=rt,ut.prototype.get=nt,ut.prototype.has=it,ut.prototype.set=at;var ct=ut;var ft=function(){this.__data__=[],this.size=0};var st=function(t,r){return t===r||t!=t&&r!=r};var lt=function(t,r){for(var e=t.length;e--;)if(st(t[e][0],r))return e;return-1},pt=Array.prototype.splice;var ht=function(t){var r=this.__data__,e=lt(r,t);return!(e<0)&&(e==r.length-1?r.pop():pt.call(r,e,1),--this.size,!0)};var vt=function(t){var r=this.__data__,e=lt(r,t);return e<0?void 0:r[e][1]};var yt=function(t){return lt(this.__data__,t)>-1};var dt=function(t,r){var e=this.__data__,n=lt(e,t);return n<0?(++this.size,e.push([t,r])):e[n][1]=r,this};function gt(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}gt.prototype.clear=ft,gt.prototype.delete=ht,gt.prototype.get=vt,gt.prototype.has=yt,gt.prototype.set=dt;var bt=gt,_t=X(m,"Map");var mt=function(){this.size=0,this.__data__={hash:new ct,map:new(_t||bt),string:new ct}};var wt=function(t){var r=h(t);return"string"==r||"number"==r||"symbol"==r||"boolean"==r?"__proto__"!==t:null===t};var jt=function(t,r){var e=t.__data__;return wt(r)?e["string"==typeof r?"string":"hash"]:e.map};var Ot=function(t){var r=jt(this,t).delete(t);return this.size-=r?1:0,r};var xt=function(t){return jt(this,t).get(t)};var St=function(t){return jt(this,t).has(t)};var At=function(t,r){var e=jt(this,t),n=e.size;return e.set(t,r),this.size+=e.size==n?0:1,this};function Lt(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}Lt.prototype.clear=mt,Lt.prototype.delete=Ot,Lt.prototype.get=xt,Lt.prototype.has=St,Lt.prototype.set=At;var Pt=Lt;function Et(t,r){if("function"!=typeof t||null!=r&&"function"!=typeof r)throw new TypeError("Expected a function");var e=function e(){var n=arguments,o=r?r.apply(this,n):n[0],i=e.cache;if(i.has(o))return i.get(o);var a=t.apply(this,n);return e.cache=i.set(o,a)||i,a};return e.cache=new(Et.Cache||Pt),e}Et.Cache=Pt;var kt=Et;var zt=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,Bt=/\\(\\)?/g,Nt=function(t){var r=kt(t,(function(t){return 500===e.size&&e.clear(),t})),e=r.cache;return r}((function(t){var r=[];return 46===t.charCodeAt(0)&&r.push(""),t.replace(zt,(function(t,e,n,o){r.push(n?o.replace(Bt,"$1"):e||t)})),r}));var Ft=function(t,r){for(var e=-1,n=null==t?0:t.length,o=Array(n);++e<n;)o[e]=r(t[e],e,t);return o},It=w?w.prototype:void 0,Tt=It?It.toString:void 0;var Ct=function t(r){if("string"==typeof r)return r;if(g(r))return Ft(r,t)+"";if(B(r))return Tt?Tt.call(r):"";var e=r+"";return"0"==e&&1/r==-Infinity?"-0":e};var Mt=function(t){return null==t?"":Ct(t)};var Ut=function(t,r){return g(t)?t:I(t,r)?[t]:Nt(Mt(t))};var $t=function(t){if("string"==typeof t||B(t))return t;var r=t+"";return"0"==r&&1/t==-Infinity?"-0":r};var Dt=function(t,r){for(var e=0,n=(r=Ut(r,t)).length;null!=t&&e<n;)t=t[$t(r[e++])];return e&&e==n?t:void 0};var Rt=function(t,r,e){var n=null==t?void 0:Dt(t,r);return void 0===n?e:n},Gt=/\s/;var qt=function(t){for(var r=t.length;r--&&Gt.test(t.charAt(r)););return r},Ht=/^\s+/;var Vt=function(t){return t?t.slice(0,qt(t)+1).replace(Ht,""):t},Wt=/^[-+]0x[0-9a-f]+$/i,Jt=/^0b[01]+$/i,Yt=/^0o[0-7]+$/i,Kt=parseInt;var Qt=function(t){if("number"==typeof t)return t;if(B(t))return NaN;if(T(t)){var r="function"==typeof t.valueOf?t.valueOf():t;t=T(r)?r+"":r}if("string"!=typeof t)return 0===t?t:+t;t=Vt(t);var e=Jt.test(t);return e||Yt.test(t)?Kt(t.slice(2),e?2:8):Wt.test(t)?NaN:+t},Xt=1/0;var Zt=function(t){return t?(t=Qt(t))===Xt||t===-1/0?17976931348623157e292*(t<0?-1:1):t==t?t:0:0===t?t:0};var tr=function(t){var r=Zt(t),e=r%1;return r==r?e?r-e:r:0};var rr=function(t){return"number"==typeof t&&t==tr(t)};function er(t){return"[object String]"===Object.prototype.toString.call(t)}function nr(t){return!(!er(t)||""===t)}function or(t){var r=!1;return nr(t)?r=!isNaN(Number(t)):function(t){return"[object Number]"===Object.prototype.toString.call(t)}(t)&&(r=!0),r}function ir(t){return or(t)?Zt(t):0}var ar=m.isFinite,ur=Math.min;var cr=function(t){var r=Math[t];return function(t,e){if(t=Qt(t),(e=null==e?0:ur(tr(e),292))&&ar(t)){var n=(Mt(t)+"e").split("e"),o=r(n[0]+"e"+(+n[1]+e));return+((n=(Mt(o)+"e").split("e"))[0]+"e"+(+n[1]-e))}return r(t)}}("round");function fr(t){if(!or(t))return 0;t=ir(t);var r=cr(t);return"0"===String(r)?0:r}function sr(t){return!!function(t){return!!or(t)&&(t=ir(t),rr(t))}(t)&&fr(t)>0}var lr="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),pr=lr.length;function hr(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:32,r=[];t=sr(t)?fr(t):32;for(var e=0;e<t;e++)r[e]=lr[0|Math.random()*pr];var n=r.join("");return n}var vr=y((function(t,r){var e;t.exports=e=e||function(t,r){var e;if("undefined"!=typeof window&&window.crypto&&(e=window.crypto),!e&&"undefined"!=typeof window&&window.msCrypto&&(e=window.msCrypto),!e&&void 0!==v&&v.crypto&&(e=v.crypto),!e)try{e=f.default}catch(t){}var n=function(){if(e){if("function"==typeof e.getRandomValues)try{return e.getRandomValues(new Uint32Array(1))[0]}catch(t){}if("function"==typeof e.randomBytes)try{return e.randomBytes(4).readInt32LE()}catch(t){}}throw new Error("Native crypto module could not be used to get secure random number.")},o=Object.create||function(){function t(){}return function(r){var e;return t.prototype=r,e=new t,t.prototype=null,e}}(),i={},a=i.lib={},u=a.Base={extend:function(t){var r=o(this);return t&&r.mixIn(t),r.hasOwnProperty("init")&&this.init!==r.init||(r.init=function(){r.$super.init.apply(this,arguments)}),r.init.prototype=r,r.$super=this,r},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var r in t)t.hasOwnProperty(r)&&(this[r]=t[r]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}},c=a.WordArray=u.extend({init:function(t,e){t=this.words=t||[],this.sigBytes=e!=r?e:4*t.length},toString:function(t){return(t||l).stringify(this)},concat:function(t){var r=this.words,e=t.words,n=this.sigBytes,o=t.sigBytes;if(this.clamp(),n%4)for(var i=0;i<o;i++){var a=e[i>>>2]>>>24-i%4*8&255;r[n+i>>>2]|=a<<24-(n+i)%4*8}else for(i=0;i<o;i+=4)r[n+i>>>2]=e[i>>>2];return this.sigBytes+=o,this},clamp:function(){var r=this.words,e=this.sigBytes;r[e>>>2]&=4294967295<<32-e%4*8,r.length=t.ceil(e/4)},clone:function(){var t=u.clone.call(this);return t.words=this.words.slice(0),t},random:function(t){for(var r=[],e=0;e<t;e+=4)r.push(n());return new c.init(r,t)}}),s=i.enc={},l=s.Hex={stringify:function(t){for(var r=t.words,e=t.sigBytes,n=[],o=0;o<e;o++){var i=r[o>>>2]>>>24-o%4*8&255;n.push((i>>>4).toString(16)),n.push((15&i).toString(16))}return n.join("")},parse:function(t){for(var r=t.length,e=[],n=0;n<r;n+=2)e[n>>>3]|=parseInt(t.substr(n,2),16)<<24-n%8*4;return new c.init(e,r/2)}},p=s.Latin1={stringify:function(t){for(var r=t.words,e=t.sigBytes,n=[],o=0;o<e;o++){var i=r[o>>>2]>>>24-o%4*8&255;n.push(String.fromCharCode(i))}return n.join("")},parse:function(t){for(var r=t.length,e=[],n=0;n<r;n++)e[n>>>2]|=(255&t.charCodeAt(n))<<24-n%4*8;return new c.init(e,r)}},h=s.Utf8={stringify:function(t){try{return decodeURIComponent(escape(p.stringify(t)))}catch(t){throw new Error("Malformed UTF-8 data")}},parse:function(t){return p.parse(unescape(encodeURIComponent(t)))}},y=a.BufferedBlockAlgorithm=u.extend({reset:function(){this._data=new c.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=h.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(r){var e,n=this._data,o=n.words,i=n.sigBytes,a=this.blockSize,u=i/(4*a),f=(u=r?t.ceil(u):t.max((0|u)-this._minBufferSize,0))*a,s=t.min(4*f,i);if(f){for(var l=0;l<f;l+=a)this._doProcessBlock(o,l);e=o.splice(0,f),n.sigBytes-=s}return new c.init(e,s)},clone:function(){var t=u.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0});a.Hasher=y.extend({cfg:u.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){y.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){return t&&this._append(t),this._doFinalize()},blockSize:16,_createHelper:function(t){return function(r,e){return new t.init(e).finalize(r)}},_createHmacHelper:function(t){return function(r,e){return new d.HMAC.init(t,e).finalize(r)}}});var d=i.algo={};return i}(Math)})),yr=y((function(t,r){t.exports=vr.enc.Utf8})),dr=y((function(t,r){var e;t.exports=(e=vr,function(){var t=e,r=t.lib.WordArray;function n(t,e,n){for(var o=[],i=0,a=0;a<e;a++)if(a%4){var u=n[t.charCodeAt(a-1)]<<a%4*2|n[t.charCodeAt(a)]>>>6-a%4*2;o[i>>>2]|=u<<24-i%4*8,i++}return r.create(o,i)}t.enc.Base64={stringify:function(t){var r=t.words,e=t.sigBytes,n=this._map;t.clamp();for(var o=[],i=0;i<e;i+=3)for(var a=(r[i>>>2]>>>24-i%4*8&255)<<16|(r[i+1>>>2]>>>24-(i+1)%4*8&255)<<8|r[i+2>>>2]>>>24-(i+2)%4*8&255,u=0;u<4&&i+.75*u<e;u++)o.push(n.charAt(a>>>6*(3-u)&63));var c=n.charAt(64);if(c)for(;o.length%4;)o.push(c);return o.join("")},parse:function(t){var r=t.length,e=this._map,o=this._reverseMap;if(!o){o=this._reverseMap=[];for(var i=0;i<e.length;i++)o[e.charCodeAt(i)]=i}var a=e.charAt(64);if(a){var u=t.indexOf(a);-1!==u&&(r=u)}return n(t,r,o)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}}(),e.enc.Base64)}));function gr(t){if(!nr(t))return"";var r=yr.parse(t);return dr.stringify(r)}function br(t){return nr(t)?dr.parse(t).toString(yr):""}function _r(t){if(!nr(t))return{};var r={};try{r=JSON.parse(t)}catch(t){r={}}return r}var mr=function(t,r){for(var e=-1,n=null==t?0:t.length,o=0,i=[];++e<n;){var a=t[e];r(a,e,t)&&(i[o++]=a)}return i};var wr=function(t){return function(r,e,n){for(var o=-1,i=Object(r),a=n(r),u=a.length;u--;){var c=a[t?u:++o];if(!1===e(i[c],c,i))break}return r}}();var jr=function(t,r){for(var e=-1,n=Array(t);++e<t;)n[e]=r(e);return n};var Or=function(t){return z(t)&&"[object Arguments]"==k(t)},xr=Object.prototype,Sr=xr.hasOwnProperty,Ar=xr.propertyIsEnumerable,Lr=Or(function(){return arguments}())?Or:function(t){return z(t)&&Sr.call(t,"callee")&&!Ar.call(t,"callee")};var Pr=function(){return!1},Er=y((function(t,r){var e=r&&!r.nodeType&&r,n=e&&t&&!t.nodeType&&t,o=n&&n.exports===e?m.Buffer:void 0,i=(o?o.isBuffer:void 0)||Pr;t.exports=i})),kr=/^(?:0|[1-9]\d*)$/;var zr=function(t,r){var e=h(t);return!!(r=null==r?9007199254740991:r)&&("number"==e||"symbol"!=e&&kr.test(t))&&t>-1&&t%1==0&&t<r};var Br=function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=9007199254740991},Nr={};Nr["[object Float32Array]"]=Nr["[object Float64Array]"]=Nr["[object Int8Array]"]=Nr["[object Int16Array]"]=Nr["[object Int32Array]"]=Nr["[object Uint8Array]"]=Nr["[object Uint8ClampedArray]"]=Nr["[object Uint16Array]"]=Nr["[object Uint32Array]"]=!0,Nr["[object Arguments]"]=Nr["[object Array]"]=Nr["[object ArrayBuffer]"]=Nr["[object Boolean]"]=Nr["[object DataView]"]=Nr["[object Date]"]=Nr["[object Error]"]=Nr["[object Function]"]=Nr["[object Map]"]=Nr["[object Number]"]=Nr["[object Object]"]=Nr["[object RegExp]"]=Nr["[object Set]"]=Nr["[object String]"]=Nr["[object WeakMap]"]=!1;var Fr=function(t){return z(t)&&Br(t.length)&&!!Nr[k(t)]};var Ir=function(t){return function(r){return t(r)}},Tr=y((function(t,r){var e=r&&!r.nodeType&&r,n=e&&t&&!t.nodeType&&t,o=n&&n.exports===e&&b.process,i=function(){try{var t=n&&n.require&&n.require("util").types;return t||o&&o.binding&&o.binding("util")}catch(t){}}();t.exports=i})),Cr=Tr&&Tr.isTypedArray,Mr=Cr?Ir(Cr):Fr,Ur=Object.prototype.hasOwnProperty;var $r=function(t,r){var e=g(t),n=!e&&Lr(t),o=!e&&!n&&Er(t),i=!e&&!n&&!o&&Mr(t),a=e||n||o||i,u=a?jr(t.length,String):[],c=u.length;for(var f in t)!r&&!Ur.call(t,f)||a&&("length"==f||o&&("offset"==f||"parent"==f)||i&&("buffer"==f||"byteLength"==f||"byteOffset"==f)||zr(f,c))||u.push(f);return u},Dr=Object.prototype;var Rr=function(t){var r=t&&t.constructor;return t===("function"==typeof r&&r.prototype||Dr)};var Gr=function(t,r){return function(e){return t(r(e))}}(Object.keys,Object),qr=Object.prototype.hasOwnProperty;var Hr=function(t){if(!Rr(t))return Gr(t);var r=[];for(var e in Object(t))qr.call(t,e)&&"constructor"!=e&&r.push(e);return r};var Vr=function(t){return null!=t&&Br(t.length)&&!M(t)};var Wr=function(t){return Vr(t)?$r(t):Hr(t)};var Jr=function(t,r){return function(e,n){if(null==e)return e;if(!Vr(e))return t(e,n);for(var o=e.length,i=r?o:-1,a=Object(e);(r?i--:++i<o)&&!1!==n(a[i],i,a););return e}}((function(t,r){return t&&wr(t,r,Wr)}));var Yr=function(t,r){var e=[];return Jr(t,(function(t,n,o){r(t,n,o)&&e.push(t)})),e};var Kr=function(){this.__data__=new bt,this.size=0};var Qr=function(t){var r=this.__data__,e=r.delete(t);return this.size=r.size,e};var Xr=function(t){return this.__data__.get(t)};var Zr=function(t){return this.__data__.has(t)};var te=function(t,r){var e=this.__data__;if(e instanceof bt){var n=e.__data__;if(!_t||n.length<199)return n.push([t,r]),this.size=++e.size,this;e=this.__data__=new Pt(n)}return e.set(t,r),this.size=e.size,this};function re(t){var r=this.__data__=new bt(t);this.size=r.size}re.prototype.clear=Kr,re.prototype.delete=Qr,re.prototype.get=Xr,re.prototype.has=Zr,re.prototype.set=te;var ee=re;var ne=function(t){return this.__data__.set(t,"__lodash_hash_undefined__"),this};var oe=function(t){return this.__data__.has(t)};function ie(t){var r=-1,e=null==t?0:t.length;for(this.__data__=new Pt;++r<e;)this.add(t[r])}ie.prototype.add=ie.prototype.push=ne,ie.prototype.has=oe;var ae=ie;var ue=function(t,r){for(var e=-1,n=null==t?0:t.length;++e<n;)if(r(t[e],e,t))return!0;return!1};var ce=function(t,r){return t.has(r)};var fe=function(t,r,e,n,o,i){var a=1&e,u=t.length,c=r.length;if(u!=c&&!(a&&c>u))return!1;var f=i.get(t),s=i.get(r);if(f&&s)return f==r&&s==t;var l=-1,p=!0,h=2&e?new ae:void 0;for(i.set(t,r),i.set(r,t);++l<u;){var v=t[l],y=r[l];if(n)var d=a?n(y,v,l,r,t,i):n(v,y,l,t,r,i);if(void 0!==d){if(d)continue;p=!1;break}if(h){if(!ue(r,(function(t,r){if(!ce(h,r)&&(v===t||o(v,t,e,n,i)))return h.push(r)}))){p=!1;break}}else if(v!==y&&!o(v,y,e,n,i)){p=!1;break}}return i.delete(t),i.delete(r),p},se=m.Uint8Array;var le=function(t){var r=-1,e=Array(t.size);return t.forEach((function(t,n){e[++r]=[n,t]})),e};var pe=function(t){var r=-1,e=Array(t.size);return t.forEach((function(t){e[++r]=t})),e},he=w?w.prototype:void 0,ve=he?he.valueOf:void 0;var ye=function(t,r,e,n,o,i,a){switch(e){case"[object DataView]":if(t.byteLength!=r.byteLength||t.byteOffset!=r.byteOffset)return!1;t=t.buffer,r=r.buffer;case"[object ArrayBuffer]":return!(t.byteLength!=r.byteLength||!i(new se(t),new se(r)));case"[object Boolean]":case"[object Date]":case"[object Number]":return st(+t,+r);case"[object Error]":return t.name==r.name&&t.message==r.message;case"[object RegExp]":case"[object String]":return t==r+"";case"[object Map]":var u=le;case"[object Set]":var c=1&n;if(u||(u=pe),t.size!=r.size&&!c)return!1;var f=a.get(t);if(f)return f==r;n|=2,a.set(t,r);var s=fe(u(t),u(r),n,o,i,a);return a.delete(t),s;case"[object Symbol]":if(ve)return ve.call(t)==ve.call(r)}return!1};var de=function(t,r){for(var e=-1,n=r.length,o=t.length;++e<n;)t[o+e]=r[e];return t};var ge=function(t,r,e){var n=r(t);return g(t)?n:de(n,e(t))};var be=function(){return[]},_e=Object.prototype.propertyIsEnumerable,me=Object.getOwnPropertySymbols,we=me?function(t){return null==t?[]:(t=Object(t),mr(me(t),(function(r){return _e.call(t,r)})))}:be;var je=function(t){return ge(t,Wr,we)},Oe=Object.prototype.hasOwnProperty;var xe=function(t,r,e,n,o,i){var a=1&e,u=je(t),c=u.length;if(c!=je(r).length&&!a)return!1;for(var f=c;f--;){var s=u[f];if(!(a?s in r:Oe.call(r,s)))return!1}var l=i.get(t),p=i.get(r);if(l&&p)return l==r&&p==t;var h=!0;i.set(t,r),i.set(r,t);for(var v=a;++f<c;){var y=t[s=u[f]],d=r[s];if(n)var g=a?n(d,y,s,r,t,i):n(y,d,s,t,r,i);if(!(void 0===g?y===d||o(y,d,e,n,i):g)){h=!1;break}v||(v="constructor"==s)}if(h&&!v){var b=t.constructor,_=r.constructor;b==_||!("constructor"in t)||!("constructor"in r)||"function"==typeof b&&b instanceof b&&"function"==typeof _&&_ instanceof _||(h=!1)}return i.delete(t),i.delete(r),h},Se=X(m,"DataView"),Ae=X(m,"Promise"),Le=X(m,"Set"),Pe=X(m,"WeakMap"),Ee="[object Map]",ke="[object Promise]",ze="[object Set]",Be="[object WeakMap]",Ne="[object DataView]",Fe=G(Se),Ie=G(_t),Te=G(Ae),Ce=G(Le),Me=G(Pe),Ue=k;(Se&&Ue(new Se(new ArrayBuffer(1)))!=Ne||_t&&Ue(new _t)!=Ee||Ae&&Ue(Ae.resolve())!=ke||Le&&Ue(new Le)!=ze||Pe&&Ue(new Pe)!=Be)&&(Ue=function(t){var r=k(t),e="[object Object]"==r?t.constructor:void 0,n=e?G(e):"";if(n)switch(n){case Fe:return Ne;case Ie:return Ee;case Te:return ke;case Ce:return ze;case Me:return Be}return r});var $e=Ue,De="[object Arguments]",Re="[object Array]",Ge="[object Object]",qe=Object.prototype.hasOwnProperty;var He=function(t,r,e,n,o,i){var a=g(t),u=g(r),c=a?Re:$e(t),f=u?Re:$e(r),s=(c=c==De?Ge:c)==Ge,l=(f=f==De?Ge:f)==Ge,p=c==f;if(p&&Er(t)){if(!Er(r))return!1;a=!0,s=!1}if(p&&!s)return i||(i=new ee),a||Mr(t)?fe(t,r,e,n,o,i):ye(t,r,c,e,n,o,i);if(!(1&e)){var h=s&&qe.call(t,"__wrapped__"),v=l&&qe.call(r,"__wrapped__");if(h||v){var y=h?t.value():t,d=v?r.value():r;return i||(i=new ee),o(y,d,e,n,i)}}return!!p&&(i||(i=new ee),xe(t,r,e,n,o,i))};var Ve=function t(r,e,n,o,i){return r===e||(null==r||null==e||!z(r)&&!z(e)?r!=r&&e!=e:He(r,e,n,o,t,i))};var We=function(t,r,e,n){var o=e.length,i=o,a=!n;if(null==t)return!i;for(t=Object(t);o--;){var u=e[o];if(a&&u[2]?u[1]!==t[u[0]]:!(u[0]in t))return!1}for(;++o<i;){var c=(u=e[o])[0],f=t[c],s=u[1];if(a&&u[2]){if(void 0===f&&!(c in t))return!1}else{var l=new ee;if(n)var p=n(f,s,c,t,r,l);if(!(void 0===p?Ve(s,f,3,n,l):p))return!1}}return!0};var Je=function(t){return t==t&&!T(t)};var Ye=function(t){for(var r=Wr(t),e=r.length;e--;){var n=r[e],o=t[n];r[e]=[n,o,Je(o)]}return r};var Ke=function(t,r){return function(e){return null!=e&&(e[t]===r&&(void 0!==r||t in Object(e)))}};var Qe=function(t){var r=Ye(t);return 1==r.length&&r[0][2]?Ke(r[0][0],r[0][1]):function(e){return e===t||We(e,t,r)}};var Xe=function(t,r){return null!=t&&r in Object(t)};var Ze=function(t,r,e){for(var n=-1,o=(r=Ut(r,t)).length,i=!1;++n<o;){var a=$t(r[n]);if(!(i=null!=t&&e(t,a)))break;t=t[a]}return i||++n!=o?i:!!(o=null==t?0:t.length)&&Br(o)&&zr(a,o)&&(g(t)||Lr(t))};var tn=function(t,r){return null!=t&&Ze(t,r,Xe)};var rn=function(t,r){return I(t)&&Je(r)?Ke($t(t),r):function(e){var n=Rt(e,t);return void 0===n&&n===r?tn(e,t):Ve(r,n,3)}};var en=function(t){return t};var nn=function(t){return function(r){return null==r?void 0:r[t]}};var on=function(t){return function(r){return Dt(r,t)}};var an=function(t){return I(t)?nn($t(t)):on(t)};var un=function(t){return"function"==typeof t?t:null==t?en:"object"==h(t)?g(t)?rn(t[0],t[1]):Qe(t):an(t)};var cn=function(t,r){return(g(t)?mr:Yr)(t,un(r))};var fn=function(t,r){var e=-1,n=Vr(t)?Array(t.length):[];return Jr(t,(function(t,o,i){n[++e]=r(t,o,i)})),n};var sn=function(t,r){return(g(t)?Ft:fn)(t,un(r))},ln=Array.prototype.join;var pn=function(t,r){return null==t?"":ln.call(t,r)};function hn(t){return"[object Array]"===Object.prototype.toString.call(t)}function vn(t,r){return new Promise((function(e,n){hn(r)||(r=[r]);var o=s.default.spawnSync(t,r),i=cn(o.output,(function(t){return null!==t}));i=sn(i,(function(t){return function(t){try{return t.toString("utf8")}catch(t){}return""}(t)}));var a=pn(i,""),u=Rt(o,"error.message");u?n(u):e(a)}))}function yn(t){return!!u.default.existsSync(t)&&(!u.default.lstatSync(t).isDirectory()&&!u.default.lstatSync(t).isSymbolicLink())}var dn=function(t,r){return Ve(t,r)};function gn(t){return"[object Object]"===Object.prototype.toString.call(t)}function bn(t){return!!function(t){return"[object Undefined]"===Object.prototype.toString.call(t)}(t)||(!!function(t){return"[object Null]"===Object.prototype.toString.call(t)}(t)||(!!function(t){if(gn(t)){for(var r in t)return!1;return!0}return!1}(t)||(!!function(t){return!(!er(t)||""!==t)}(t)||!!function(t){return!!hn(t)&&0===t.length}(t))))}function _n(t,r){function e(t){return hn(t)?t:[t]}if(bn(t))return!1;if(0===(t=e(t)).length)return!1;if(bn(t))return!1;if(0===(r=e(r)).length)return!1;for(var n=0;n<t.length;n++)for(var o=0;o<r.length;o++)if(dn(t[n],r[o]))return!0;return!1}function mn(t){if(gn(t)){for(var r in t)return!0;return!1}return!1}var wn=a.default.resolve();function jn(){return"win32"===c.default.platform}function On(){var t="connLDAP.net".concat("4.8",".exe"),r="".concat(wn,"/src/"),e="".concat(wn,"/node_modules/w-ldap/src/");return yn("".concat(r).concat(t))?r:yn("".concat(e).concat(t))?e:{error:"can not find executable file for connLDAP"}}function xn(t,r){var e="connLDAP.net".concat(r,".exe");return"".concat(t).concat(e)}function Sn(t){return t.replace(String.fromCharCode("65279"),"")}function An(){return(An=p(d.mark((function t(){var r,e,n,o,i,a,c,f,s,l,p,h,v,y=arguments;return d.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(r=y.length>0&&void 0!==y[0]?y[0]:{},e=y.length>1&&void 0!==y[1]?y[1]:{},jn()){t.next=4;break}return t.abrupt("return",Promise.reject("operating system is not windows"));case 4:if(mn(r)){t.next=6;break}return t.abrupt("return",Promise.reject("invalid input"));case 6:if("logIn"===(n=Rt(r,"mode"))||"listUsers"===n){t.next=9;break}return t.abrupt("return",Promise.reject("input.mode needs to be 'logIn or 'listUsers"));case 9:if(nr(Rt(r,"account"))){t.next=11;break}return t.abrupt("return",Promise.reject("invalid input.account"));case 11:if(nr(Rt(r,"password"))){t.next=13;break}return t.abrupt("return",Promise.reject("invalid input.password"));case 13:if(nr(Rt(r,"ldappath"))){t.next=15;break}return t.abrupt("return",Promise.reject("invalid input.ldappath"));case 15:if(nr(o=Rt(e,"ver",null))||(o="4.8"),_n(o,["4.5","4.6","4.7.2","4.8"])){t.next=19;break}return t.abrupt("return",Promise.reject("opt.ver needs to be one of 4.5, 4.6, 4.7.2 or 4.8"));case 19:if(i=On(),!Rt(i,"error")){t.next=22;break}return t.abrupt("return",Promise.reject(i.error));case 22:return a=xn(i,o),c="_".concat(hr()),r["__System:OutputFilename"]=c,f=JSON.stringify(r),s=gr(f),t.next=29,vn(a,s).catch((function(t){console.log("WLdap execScript catch",t)}));case 29:if(l="".concat(i).concat(c),p=Sn(p=u.default.readFileSync(l,"utf8")),h=br(p),v=_r(h),u.default.unlinkSync(l),!Rt(v,"error")){t.next=37;break}return t.abrupt("return",Promise.reject(v.error));case 37:return t.abrupt("return",Rt(v,"success")||v);case 38:case"end":return t.stop()}}),t)})))).apply(this,arguments)}return function(){return An.apply(this,arguments)}}));
//# sourceMappingURL=w-ldap.umd.js.map
