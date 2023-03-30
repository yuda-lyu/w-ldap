/*!
 * w-ldap v1.0.9
 * (c) 2018-2021 yuda-lyu(semisphere)
 * Released under the MIT License.
 */
!function(t,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r(require("path"),require("fs"),require("process"),require("child_process")):"function"==typeof define&&define.amd?define(["path","fs","process","child_process"],r):(t="undefined"!=typeof globalThis?globalThis:t||self)["w-ldap"]=r(t.path,t.fs,t.process,t.child_process)}(this,(function(t,r,e,n){"use strict";var o="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function i(t){if(t.__esModule)return t;var r=t.default;if("function"==typeof r){var e=function t(){if(this instanceof t){var e=[null];return e.push.apply(e,arguments),new(Function.bind.apply(r,e))}return r.apply(this,arguments)};e.prototype=r.prototype}else e={};return Object.defineProperty(e,"__esModule",{value:!0}),Object.keys(t).forEach((function(r){var n=Object.getOwnPropertyDescriptor(t,r);Object.defineProperty(e,r,n.get?n:{enumerable:!0,get:function(){return t[r]}})})),e}var u=Array.isArray,a="object"==typeof o&&o&&o.Object===Object&&o,c=a,f="object"==typeof self&&self&&self.Object===Object&&self,s=c||f||Function("return this")(),l=s.Symbol,p=l,v=Object.prototype,h=v.hasOwnProperty,y=v.toString,d=p?p.toStringTag:void 0;var b=function(t){var r=h.call(t,d),e=t[d];try{t[d]=void 0;var n=!0}catch(t){}var o=y.call(t);return n&&(r?t[d]=e:delete t[d]),o},g=Object.prototype.toString;var _=b,j=function(t){return g.call(t)},w=l?l.toStringTag:void 0;var m=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":w&&w in Object(t)?_(t):j(t)};var O=function(t){return null!=t&&"object"==typeof t},S=m,A=O;var x=function(t){return"symbol"==typeof t||A(t)&&"[object Symbol]"==S(t)},P=u,z=x,B=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,$=/^\w*$/;var k=function(t,r){if(P(t))return!1;var e=typeof t;return!("number"!=e&&"symbol"!=e&&"boolean"!=e&&null!=t&&!z(t))||($.test(t)||!B.test(t)||null!=r&&t in Object(r))};var C=function(t){var r=typeof t;return null!=t&&("object"==r||"function"==r)},I=m,M=C;var T,E=function(t){if(!M(t))return!1;var r=I(t);return"[object Function]"==r||"[object GeneratorFunction]"==r||"[object AsyncFunction]"==r||"[object Proxy]"==r},F=s["__core-js_shared__"],N=(T=/[^.]+$/.exec(F&&F.keys&&F.keys.IE_PROTO||""))?"Symbol(src)_1."+T:"";var U=function(t){return!!N&&N in t},D=Function.prototype.toString;var L=function(t){if(null!=t){try{return D.call(t)}catch(t){}try{return t+""}catch(t){}}return""},R=E,q=U,H=C,V=L,W=/^\[object .+?Constructor\]$/,J=Function.prototype,G=Object.prototype,K=J.toString,Q=G.hasOwnProperty,X=RegExp("^"+K.call(Q).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");var Y=function(t){return!(!H(t)||q(t))&&(R(t)?X:W).test(V(t))},Z=function(t,r){return null==t?void 0:t[r]};var tt=function(t,r){var e=Z(t,r);return Y(e)?e:void 0},rt=tt(Object,"create"),et=rt;var nt=function(){this.__data__=et?et(null):{},this.size=0};var ot=function(t){var r=this.has(t)&&delete this.__data__[t];return this.size-=r?1:0,r},it=rt,ut=Object.prototype.hasOwnProperty;var at=function(t){var r=this.__data__;if(it){var e=r[t];return"__lodash_hash_undefined__"===e?void 0:e}return ut.call(r,t)?r[t]:void 0},ct=rt,ft=Object.prototype.hasOwnProperty;var st=rt;var lt=nt,pt=ot,vt=at,ht=function(t){var r=this.__data__;return ct?void 0!==r[t]:ft.call(r,t)},yt=function(t,r){var e=this.__data__;return this.size+=this.has(t)?0:1,e[t]=st&&void 0===r?"__lodash_hash_undefined__":r,this};function dt(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}dt.prototype.clear=lt,dt.prototype.delete=pt,dt.prototype.get=vt,dt.prototype.has=ht,dt.prototype.set=yt;var bt=dt;var gt=function(){this.__data__=[],this.size=0};var _t=function(t,r){return t===r||t!=t&&r!=r},jt=_t;var wt=function(t,r){for(var e=t.length;e--;)if(jt(t[e][0],r))return e;return-1},mt=wt,Ot=Array.prototype.splice;var St=wt;var At=wt;var xt=wt;var Pt=gt,zt=function(t){var r=this.__data__,e=mt(r,t);return!(e<0)&&(e==r.length-1?r.pop():Ot.call(r,e,1),--this.size,!0)},Bt=function(t){var r=this.__data__,e=St(r,t);return e<0?void 0:r[e][1]},$t=function(t){return At(this.__data__,t)>-1},kt=function(t,r){var e=this.__data__,n=xt(e,t);return n<0?(++this.size,e.push([t,r])):e[n][1]=r,this};function Ct(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}Ct.prototype.clear=Pt,Ct.prototype.delete=zt,Ct.prototype.get=Bt,Ct.prototype.has=$t,Ct.prototype.set=kt;var It=Ct,Mt=tt(s,"Map"),Tt=bt,Et=It,Ft=Mt;var Nt=function(t){var r=typeof t;return"string"==r||"number"==r||"symbol"==r||"boolean"==r?"__proto__"!==t:null===t};var Ut=function(t,r){var e=t.__data__;return Nt(r)?e["string"==typeof r?"string":"hash"]:e.map},Dt=Ut;var Lt=Ut;var Rt=Ut;var qt=Ut;var Ht=function(){this.size=0,this.__data__={hash:new Tt,map:new(Ft||Et),string:new Tt}},Vt=function(t){var r=Dt(this,t).delete(t);return this.size-=r?1:0,r},Wt=function(t){return Lt(this,t).get(t)},Jt=function(t){return Rt(this,t).has(t)},Gt=function(t,r){var e=qt(this,t),n=e.size;return e.set(t,r),this.size+=e.size==n?0:1,this};function Kt(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}Kt.prototype.clear=Ht,Kt.prototype.delete=Vt,Kt.prototype.get=Wt,Kt.prototype.has=Jt,Kt.prototype.set=Gt;var Qt=Kt,Xt=Qt;function Yt(t,r){if("function"!=typeof t||null!=r&&"function"!=typeof r)throw new TypeError("Expected a function");var e=function(){var n=arguments,o=r?r.apply(this,n):n[0],i=e.cache;if(i.has(o))return i.get(o);var u=t.apply(this,n);return e.cache=i.set(o,u)||i,u};return e.cache=new(Yt.Cache||Xt),e}Yt.Cache=Xt;var Zt=Yt;var tr=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,rr=/\\(\\)?/g,er=function(t){var r=Zt(t,(function(t){return 500===e.size&&e.clear(),t})),e=r.cache;return r}((function(t){var r=[];return 46===t.charCodeAt(0)&&r.push(""),t.replace(tr,(function(t,e,n,o){r.push(n?o.replace(rr,"$1"):e||t)})),r}));var nr=function(t,r){for(var e=-1,n=null==t?0:t.length,o=Array(n);++e<n;)o[e]=r(t[e],e,t);return o},or=nr,ir=u,ur=x,ar=l?l.prototype:void 0,cr=ar?ar.toString:void 0;var fr=function t(r){if("string"==typeof r)return r;if(ir(r))return or(r,t)+"";if(ur(r))return cr?cr.call(r):"";var e=r+"";return"0"==e&&1/r==-Infinity?"-0":e},sr=fr;var lr=function(t){return null==t?"":sr(t)},pr=u,vr=k,hr=er,yr=lr;var dr=function(t,r){return pr(t)?t:vr(t,r)?[t]:hr(yr(t))},br=x;var gr=function(t){if("string"==typeof t||br(t))return t;var r=t+"";return"0"==r&&1/t==-Infinity?"-0":r},_r=dr,jr=gr;var wr=function(t,r){for(var e=0,n=(r=_r(r,t)).length;null!=t&&e<n;)t=t[jr(r[e++])];return e&&e==n?t:void 0},mr=wr;var Or=function(t,r,e){var n=null==t?void 0:mr(t,r);return void 0===n?e:n},Sr=/\s/;var Ar=function(t){for(var r=t.length;r--&&Sr.test(t.charAt(r)););return r},xr=/^\s+/;var Pr=function(t){return t?t.slice(0,Ar(t)+1).replace(xr,""):t},zr=C,Br=x,$r=/^[-+]0x[0-9a-f]+$/i,kr=/^0b[01]+$/i,Cr=/^0o[0-7]+$/i,Ir=parseInt;var Mr=function(t){if("number"==typeof t)return t;if(Br(t))return NaN;if(zr(t)){var r="function"==typeof t.valueOf?t.valueOf():t;t=zr(r)?r+"":r}if("string"!=typeof t)return 0===t?t:+t;t=Pr(t);var e=kr.test(t);return e||Cr.test(t)?Ir(t.slice(2),e?2:8):$r.test(t)?NaN:+t},Tr=Mr,Er=1/0;var Fr=function(t){return t?(t=Tr(t))===Er||t===-1/0?17976931348623157e292*(t<0?-1:1):t==t?t:0:0===t?t:0},Nr=Fr;var Ur=function(t){var r=Nr(t),e=r%1;return r==r?e?r-e:r:0},Dr=Ur;var Lr=function(t){return"number"==typeof t&&t==Dr(t)};function Rr(t){return"[object String]"===Object.prototype.toString.call(t)}function qr(t){return!(!Rr(t)||""===t)}function Hr(t){let r=!1;return qr(t)?r=!isNaN(Number(t)):function(t){return"[object Number]"===Object.prototype.toString.call(t)}(t)&&(r=!0),r}function Vr(t){if(!Hr(t))return 0;return Fr(t)}var Wr=Ur,Jr=Mr,Gr=lr,Kr=s.isFinite,Qr=Math.min;var Xr=function(t){var r=Math[t];return function(t,e){if(t=Jr(t),(e=null==e?0:Qr(Wr(e),292))&&Kr(t)){var n=(Gr(t)+"e").split("e"),o=r(n[0]+"e"+(+n[1]+e));return+((n=(Gr(o)+"e").split("e"))[0]+"e"+(+n[1]-e))}return r(t)}}("round");function Yr(t){if(!Hr(t))return 0;t=Vr(t);let r=Xr(t);return"0"===String(r)?0:r}function Zr(t){if(!function(t){return!!Hr(t)&&(t=Vr(t),Lr(t))}(t))return!1;return Yr(t)>0}let te="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),re=te.length;var ee={},ne={get exports(){return ee},set exports(t){ee=t}};var oe,ie={},ue={get exports(){return ie},set exports(t){ie=t}},ae=i(Object.freeze({__proto__:null,default:{}}));function ce(){return oe||(oe=1,function(t,r){var e;t.exports=(e=e||function(t,r){var e;if("undefined"!=typeof window&&window.crypto&&(e=window.crypto),"undefined"!=typeof self&&self.crypto&&(e=self.crypto),"undefined"!=typeof globalThis&&globalThis.crypto&&(e=globalThis.crypto),!e&&"undefined"!=typeof window&&window.msCrypto&&(e=window.msCrypto),!e&&void 0!==o&&o.crypto&&(e=o.crypto),!e)try{e=ae}catch(t){}var n=function(){if(e){if("function"==typeof e.getRandomValues)try{return e.getRandomValues(new Uint32Array(1))[0]}catch(t){}if("function"==typeof e.randomBytes)try{return e.randomBytes(4).readInt32LE()}catch(t){}}throw new Error("Native crypto module could not be used to get secure random number.")},i=Object.create||function(){function t(){}return function(r){var e;return t.prototype=r,e=new t,t.prototype=null,e}}(),u={},a=u.lib={},c=a.Base={extend:function(t){var r=i(this);return t&&r.mixIn(t),r.hasOwnProperty("init")&&this.init!==r.init||(r.init=function(){r.$super.init.apply(this,arguments)}),r.init.prototype=r,r.$super=this,r},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var r in t)t.hasOwnProperty(r)&&(this[r]=t[r]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}},f=a.WordArray=c.extend({init:function(t,e){t=this.words=t||[],this.sigBytes=e!=r?e:4*t.length},toString:function(t){return(t||l).stringify(this)},concat:function(t){var r=this.words,e=t.words,n=this.sigBytes,o=t.sigBytes;if(this.clamp(),n%4)for(var i=0;i<o;i++){var u=e[i>>>2]>>>24-i%4*8&255;r[n+i>>>2]|=u<<24-(n+i)%4*8}else for(var a=0;a<o;a+=4)r[n+a>>>2]=e[a>>>2];return this.sigBytes+=o,this},clamp:function(){var r=this.words,e=this.sigBytes;r[e>>>2]&=4294967295<<32-e%4*8,r.length=t.ceil(e/4)},clone:function(){var t=c.clone.call(this);return t.words=this.words.slice(0),t},random:function(t){for(var r=[],e=0;e<t;e+=4)r.push(n());return new f.init(r,t)}}),s=u.enc={},l=s.Hex={stringify:function(t){for(var r=t.words,e=t.sigBytes,n=[],o=0;o<e;o++){var i=r[o>>>2]>>>24-o%4*8&255;n.push((i>>>4).toString(16)),n.push((15&i).toString(16))}return n.join("")},parse:function(t){for(var r=t.length,e=[],n=0;n<r;n+=2)e[n>>>3]|=parseInt(t.substr(n,2),16)<<24-n%8*4;return new f.init(e,r/2)}},p=s.Latin1={stringify:function(t){for(var r=t.words,e=t.sigBytes,n=[],o=0;o<e;o++){var i=r[o>>>2]>>>24-o%4*8&255;n.push(String.fromCharCode(i))}return n.join("")},parse:function(t){for(var r=t.length,e=[],n=0;n<r;n++)e[n>>>2]|=(255&t.charCodeAt(n))<<24-n%4*8;return new f.init(e,r)}},v=s.Utf8={stringify:function(t){try{return decodeURIComponent(escape(p.stringify(t)))}catch(t){throw new Error("Malformed UTF-8 data")}},parse:function(t){return p.parse(unescape(encodeURIComponent(t)))}},h=a.BufferedBlockAlgorithm=c.extend({reset:function(){this._data=new f.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=v.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(r){var e,n=this._data,o=n.words,i=n.sigBytes,u=this.blockSize,a=i/(4*u),c=(a=r?t.ceil(a):t.max((0|a)-this._minBufferSize,0))*u,s=t.min(4*c,i);if(c){for(var l=0;l<c;l+=u)this._doProcessBlock(o,l);e=o.splice(0,c),n.sigBytes-=s}return new f.init(e,s)},clone:function(){var t=c.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0});a.Hasher=h.extend({cfg:c.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){h.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){return t&&this._append(t),this._doFinalize()},blockSize:16,_createHelper:function(t){return function(r,e){return new t.init(e).finalize(r)}},_createHmacHelper:function(t){return function(r,e){return new y.HMAC.init(t,e).finalize(r)}}});var y=u.algo={};return u}(Math),e)}(ue)),ie}!function(t,r){t.exports=ce().enc.Utf8}(ne);var fe=ee,se={};!function(t,r){var e;t.exports=(e=ce(),function(){var t=e,r=t.lib.WordArray;function n(t,e,n){for(var o=[],i=0,u=0;u<e;u++)if(u%4){var a=n[t.charCodeAt(u-1)]<<u%4*2|n[t.charCodeAt(u)]>>>6-u%4*2;o[i>>>2]|=a<<24-i%4*8,i++}return r.create(o,i)}t.enc.Base64={stringify:function(t){var r=t.words,e=t.sigBytes,n=this._map;t.clamp();for(var o=[],i=0;i<e;i+=3)for(var u=(r[i>>>2]>>>24-i%4*8&255)<<16|(r[i+1>>>2]>>>24-(i+1)%4*8&255)<<8|r[i+2>>>2]>>>24-(i+2)%4*8&255,a=0;a<4&&i+.75*a<e;a++)o.push(n.charAt(u>>>6*(3-a)&63));var c=n.charAt(64);if(c)for(;o.length%4;)o.push(c);return o.join("")},parse:function(t){var r=t.length,e=this._map,o=this._reverseMap;if(!o){o=this._reverseMap=[];for(var i=0;i<e.length;i++)o[e.charCodeAt(i)]=i}var u=e.charAt(64);if(u){var a=t.indexOf(u);-1!==a&&(r=a)}return n(t,r,o)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}}(),e.enc.Base64)}({get exports(){return se},set exports(t){se=t}});var le=se;var pe=function(t,r){for(var e=-1,n=null==t?0:t.length,o=0,i=[];++e<n;){var u=t[e];r(u,e,t)&&(i[o++]=u)}return i};var ve=function(t){return function(r,e,n){for(var o=-1,i=Object(r),u=n(r),a=u.length;a--;){var c=u[t?a:++o];if(!1===e(i[c],c,i))break}return r}}();var he=function(t,r){for(var e=-1,n=Array(t);++e<t;)n[e]=r(e);return n},ye=m,de=O;var be=function(t){return de(t)&&"[object Arguments]"==ye(t)},ge=O,_e=Object.prototype,je=_e.hasOwnProperty,we=_e.propertyIsEnumerable,me=be(function(){return arguments}())?be:function(t){return ge(t)&&je.call(t,"callee")&&!we.call(t,"callee")},Oe=me,Se={};var Ae=function(){return!1};!function(t,r){var e=s,n=Ae,o=r&&!r.nodeType&&r,i=o&&t&&!t.nodeType&&t,u=i&&i.exports===o?e.Buffer:void 0,a=(u?u.isBuffer:void 0)||n;t.exports=a}({get exports(){return Se},set exports(t){Se=t}},Se);var xe=/^(?:0|[1-9]\d*)$/;var Pe=function(t,r){var e=typeof t;return!!(r=null==r?9007199254740991:r)&&("number"==e||"symbol"!=e&&xe.test(t))&&t>-1&&t%1==0&&t<r};var ze=function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=9007199254740991},Be=m,$e=ze,ke=O,Ce={};Ce["[object Float32Array]"]=Ce["[object Float64Array]"]=Ce["[object Int8Array]"]=Ce["[object Int16Array]"]=Ce["[object Int32Array]"]=Ce["[object Uint8Array]"]=Ce["[object Uint8ClampedArray]"]=Ce["[object Uint16Array]"]=Ce["[object Uint32Array]"]=!0,Ce["[object Arguments]"]=Ce["[object Array]"]=Ce["[object ArrayBuffer]"]=Ce["[object Boolean]"]=Ce["[object DataView]"]=Ce["[object Date]"]=Ce["[object Error]"]=Ce["[object Function]"]=Ce["[object Map]"]=Ce["[object Number]"]=Ce["[object Object]"]=Ce["[object RegExp]"]=Ce["[object Set]"]=Ce["[object String]"]=Ce["[object WeakMap]"]=!1;var Ie=function(t){return ke(t)&&$e(t.length)&&!!Ce[Be(t)]};var Me=function(t){return function(r){return t(r)}},Te={};!function(t,r){var e=a,n=r&&!r.nodeType&&r,o=n&&t&&!t.nodeType&&t,i=o&&o.exports===n&&e.process,u=function(){try{var t=o&&o.require&&o.require("util").types;return t||i&&i.binding&&i.binding("util")}catch(t){}}();t.exports=u}({get exports(){return Te},set exports(t){Te=t}},Te);var Ee=Ie,Fe=Me,Ne=Te&&Te.isTypedArray,Ue=Ne?Fe(Ne):Ee,De=he,Le=Oe,Re=u,qe=Se,He=Pe,Ve=Ue,We=Object.prototype.hasOwnProperty;var Je=function(t,r){var e=Re(t),n=!e&&Le(t),o=!e&&!n&&qe(t),i=!e&&!n&&!o&&Ve(t),u=e||n||o||i,a=u?De(t.length,String):[],c=a.length;for(var f in t)!r&&!We.call(t,f)||u&&("length"==f||o&&("offset"==f||"parent"==f)||i&&("buffer"==f||"byteLength"==f||"byteOffset"==f)||He(f,c))||a.push(f);return a},Ge=Object.prototype;var Ke=function(t){var r=t&&t.constructor;return t===("function"==typeof r&&r.prototype||Ge)};var Qe=function(t,r){return function(e){return t(r(e))}}(Object.keys,Object),Xe=Ke,Ye=Qe,Ze=Object.prototype.hasOwnProperty;var tn=E,rn=ze;var en=function(t){return null!=t&&rn(t.length)&&!tn(t)},nn=Je,on=function(t){if(!Xe(t))return Ye(t);var r=[];for(var e in Object(t))Ze.call(t,e)&&"constructor"!=e&&r.push(e);return r},un=en;var an=function(t){return un(t)?nn(t):on(t)},cn=ve,fn=an;var sn=en;var ln=function(t,r){return function(e,n){if(null==e)return e;if(!sn(e))return t(e,n);for(var o=e.length,i=r?o:-1,u=Object(e);(r?i--:++i<o)&&!1!==n(u[i],i,u););return e}}((function(t,r){return t&&cn(t,r,fn)})),pn=ln;var vn=function(t,r){var e=[];return pn(t,(function(t,n,o){r(t,n,o)&&e.push(t)})),e},hn=It;var yn=It,dn=Mt,bn=Qt;var gn=It,_n=function(){this.__data__=new hn,this.size=0},jn=function(t){var r=this.__data__,e=r.delete(t);return this.size=r.size,e},wn=function(t){return this.__data__.get(t)},mn=function(t){return this.__data__.has(t)},On=function(t,r){var e=this.__data__;if(e instanceof yn){var n=e.__data__;if(!dn||n.length<199)return n.push([t,r]),this.size=++e.size,this;e=this.__data__=new bn(n)}return e.set(t,r),this.size=e.size,this};function Sn(t){var r=this.__data__=new gn(t);this.size=r.size}Sn.prototype.clear=_n,Sn.prototype.delete=jn,Sn.prototype.get=wn,Sn.prototype.has=mn,Sn.prototype.set=On;var An=Sn;var xn=Qt,Pn=function(t){return this.__data__.set(t,"__lodash_hash_undefined__"),this},zn=function(t){return this.__data__.has(t)};function Bn(t){var r=-1,e=null==t?0:t.length;for(this.__data__=new xn;++r<e;)this.add(t[r])}Bn.prototype.add=Bn.prototype.push=Pn,Bn.prototype.has=zn;var $n=Bn,kn=function(t,r){for(var e=-1,n=null==t?0:t.length;++e<n;)if(r(t[e],e,t))return!0;return!1},Cn=function(t,r){return t.has(r)};var In=function(t,r,e,n,o,i){var u=1&e,a=t.length,c=r.length;if(a!=c&&!(u&&c>a))return!1;var f=i.get(t),s=i.get(r);if(f&&s)return f==r&&s==t;var l=-1,p=!0,v=2&e?new $n:void 0;for(i.set(t,r),i.set(r,t);++l<a;){var h=t[l],y=r[l];if(n)var d=u?n(y,h,l,r,t,i):n(h,y,l,t,r,i);if(void 0!==d){if(d)continue;p=!1;break}if(v){if(!kn(r,(function(t,r){if(!Cn(v,r)&&(h===t||o(h,t,e,n,i)))return v.push(r)}))){p=!1;break}}else if(h!==y&&!o(h,y,e,n,i)){p=!1;break}}return i.delete(t),i.delete(r),p};var Mn=function(t){var r=-1,e=Array(t.size);return t.forEach((function(t,n){e[++r]=[n,t]})),e};var Tn=s.Uint8Array,En=_t,Fn=In,Nn=Mn,Un=function(t){var r=-1,e=Array(t.size);return t.forEach((function(t){e[++r]=t})),e},Dn=l?l.prototype:void 0,Ln=Dn?Dn.valueOf:void 0;var Rn=function(t,r,e,n,o,i,u){switch(e){case"[object DataView]":if(t.byteLength!=r.byteLength||t.byteOffset!=r.byteOffset)return!1;t=t.buffer,r=r.buffer;case"[object ArrayBuffer]":return!(t.byteLength!=r.byteLength||!i(new Tn(t),new Tn(r)));case"[object Boolean]":case"[object Date]":case"[object Number]":return En(+t,+r);case"[object Error]":return t.name==r.name&&t.message==r.message;case"[object RegExp]":case"[object String]":return t==r+"";case"[object Map]":var a=Nn;case"[object Set]":var c=1&n;if(a||(a=Un),t.size!=r.size&&!c)return!1;var f=u.get(t);if(f)return f==r;n|=2,u.set(t,r);var s=Fn(a(t),a(r),n,o,i,u);return u.delete(t),s;case"[object Symbol]":if(Ln)return Ln.call(t)==Ln.call(r)}return!1};var qn=function(t,r){for(var e=-1,n=r.length,o=t.length;++e<n;)t[o+e]=r[e];return t},Hn=u;var Vn=function(t,r,e){var n=r(t);return Hn(t)?n:qn(n,e(t))};var Wn=pe,Jn=function(){return[]},Gn=Object.prototype.propertyIsEnumerable,Kn=Object.getOwnPropertySymbols,Qn=Vn,Xn=Kn?function(t){return null==t?[]:(t=Object(t),Wn(Kn(t),(function(r){return Gn.call(t,r)})))}:Jn,Yn=an;var Zn=function(t){return Qn(t,Yn,Xn)},to=Object.prototype.hasOwnProperty;var ro=function(t,r,e,n,o,i){var u=1&e,a=Zn(t),c=a.length;if(c!=Zn(r).length&&!u)return!1;for(var f=c;f--;){var s=a[f];if(!(u?s in r:to.call(r,s)))return!1}var l=i.get(t),p=i.get(r);if(l&&p)return l==r&&p==t;var v=!0;i.set(t,r),i.set(r,t);for(var h=u;++f<c;){var y=t[s=a[f]],d=r[s];if(n)var b=u?n(d,y,s,r,t,i):n(y,d,s,t,r,i);if(!(void 0===b?y===d||o(y,d,e,n,i):b)){v=!1;break}h||(h="constructor"==s)}if(v&&!h){var g=t.constructor,_=r.constructor;g==_||!("constructor"in t)||!("constructor"in r)||"function"==typeof g&&g instanceof g&&"function"==typeof _&&_ instanceof _||(v=!1)}return i.delete(t),i.delete(r),v},eo=tt(s,"DataView"),no=Mt,oo=tt(s,"Promise"),io=tt(s,"Set"),uo=tt(s,"WeakMap"),ao=m,co=L,fo="[object Map]",so="[object Promise]",lo="[object Set]",po="[object WeakMap]",vo="[object DataView]",ho=co(eo),yo=co(no),bo=co(oo),go=co(io),_o=co(uo),jo=ao;(eo&&jo(new eo(new ArrayBuffer(1)))!=vo||no&&jo(new no)!=fo||oo&&jo(oo.resolve())!=so||io&&jo(new io)!=lo||uo&&jo(new uo)!=po)&&(jo=function(t){var r=ao(t),e="[object Object]"==r?t.constructor:void 0,n=e?co(e):"";if(n)switch(n){case ho:return vo;case yo:return fo;case bo:return so;case go:return lo;case _o:return po}return r});var wo=An,mo=In,Oo=Rn,So=ro,Ao=jo,xo=u,Po=Se,zo=Ue,Bo="[object Arguments]",$o="[object Array]",ko="[object Object]",Co=Object.prototype.hasOwnProperty;var Io=function(t,r,e,n,o,i){var u=xo(t),a=xo(r),c=u?$o:Ao(t),f=a?$o:Ao(r),s=(c=c==Bo?ko:c)==ko,l=(f=f==Bo?ko:f)==ko,p=c==f;if(p&&Po(t)){if(!Po(r))return!1;u=!0,s=!1}if(p&&!s)return i||(i=new wo),u||zo(t)?mo(t,r,e,n,o,i):Oo(t,r,c,e,n,o,i);if(!(1&e)){var v=s&&Co.call(t,"__wrapped__"),h=l&&Co.call(r,"__wrapped__");if(v||h){var y=v?t.value():t,d=h?r.value():r;return i||(i=new wo),o(y,d,e,n,i)}}return!!p&&(i||(i=new wo),So(t,r,e,n,o,i))},Mo=O;var To=function t(r,e,n,o,i){return r===e||(null==r||null==e||!Mo(r)&&!Mo(e)?r!=r&&e!=e:Io(r,e,n,o,t,i))},Eo=An,Fo=To;var No=C;var Uo=function(t){return t==t&&!No(t)},Do=Uo,Lo=an;var Ro=function(t,r){return function(e){return null!=e&&(e[t]===r&&(void 0!==r||t in Object(e)))}},qo=function(t,r,e,n){var o=e.length,i=o,u=!n;if(null==t)return!i;for(t=Object(t);o--;){var a=e[o];if(u&&a[2]?a[1]!==t[a[0]]:!(a[0]in t))return!1}for(;++o<i;){var c=(a=e[o])[0],f=t[c],s=a[1];if(u&&a[2]){if(void 0===f&&!(c in t))return!1}else{var l=new Eo;if(n)var p=n(f,s,c,t,r,l);if(!(void 0===p?Fo(s,f,3,n,l):p))return!1}}return!0},Ho=function(t){for(var r=Lo(t),e=r.length;e--;){var n=r[e],o=t[n];r[e]=[n,o,Do(o)]}return r},Vo=Ro;var Wo=dr,Jo=Oe,Go=u,Ko=Pe,Qo=ze,Xo=gr;var Yo=function(t,r,e){for(var n=-1,o=(r=Wo(r,t)).length,i=!1;++n<o;){var u=Xo(r[n]);if(!(i=null!=t&&e(t,u)))break;t=t[u]}return i||++n!=o?i:!!(o=null==t?0:t.length)&&Qo(o)&&Ko(u,o)&&(Go(t)||Jo(t))},Zo=function(t,r){return null!=t&&r in Object(t)},ti=Yo;var ri=function(t,r){return null!=t&&ti(t,r,Zo)},ei=To,ni=Or,oi=ri,ii=k,ui=Uo,ai=Ro,ci=gr;var fi=function(t,r){return ii(t)&&ui(r)?ai(ci(t),r):function(e){var n=ni(e,t);return void 0===n&&n===r?oi(e,t):ei(r,n,3)}};var si=wr;var li=function(t){return function(r){return si(r,t)}},pi=function(t){return function(r){return null==r?void 0:r[t]}},vi=li,hi=k,yi=gr;var di=function(t){return hi(t)?pi(yi(t)):vi(t)},bi=function(t){var r=Ho(t);return 1==r.length&&r[0][2]?Vo(r[0][0],r[0][1]):function(e){return e===t||qo(e,t,r)}},gi=fi,_i=function(t){return t},ji=u,wi=di;var mi=function(t){return"function"==typeof t?t:null==t?_i:"object"==typeof t?ji(t)?gi(t[0],t[1]):bi(t):wi(t)},Oi=pe,Si=vn,Ai=mi,xi=u;var Pi=function(t,r){return(xi(t)?Oi:Si)(t,Ai(r))},zi=ln,Bi=en;var $i=nr,ki=mi,Ci=function(t,r){var e=-1,n=Bi(t)?Array(t.length):[];return zi(t,(function(t,o,i){n[++e]=r(t,o,i)})),n},Ii=u;var Mi=function(t,r){return(Ii(t)?$i:Ci)(t,ki(r))},Ti=Array.prototype.join;var Ei=function(t,r){return null==t?"":Ti.call(t,r)};function Fi(t){return"[object Array]"===Object.prototype.toString.call(t)}function Ni(t){return!!r.existsSync(t)&&(!r.lstatSync(t).isDirectory()&&!r.lstatSync(t).isSymbolicLink())}var Ui=To;var Di=function(t,r){return Ui(t,r)};function Li(t){return"[object Object]"===Object.prototype.toString.call(t)}function Ri(t){return!!function(t){return"[object Undefined]"===Object.prototype.toString.call(t)}(t)||(!!function(t){return"[object Null]"===Object.prototype.toString.call(t)}(t)||(!!function(t){if(Li(t)){for(let r in t)return!1;return!0}return!1}(t)||(!!function(t){return!(!Rr(t)||""!==t)}(t)||!!function(t){return!!Fi(t)&&0===t.length}(t))))}let qi=t.resolve();return async function(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if("win32"!==e.platform)return Promise.reject("operating system is not windows");if(!function(t){if(Li(t)){for(let r in t)return!0;return!1}return!1}(t))return Promise.reject("invalid input");let i=Or(t,"mode");if("logIn"!==i&&"listUsers"!==i)return Promise.reject("input.mode needs to be 'logIn or 'listUsers");if(!qr(Or(t,"account")))return Promise.reject("invalid input.account");if(!qr(Or(t,"password")))return Promise.reject("invalid input.password");if(!qr(Or(t,"ldappath")))return Promise.reject("invalid input.ldappath");let u=Or(o,"ver",null);if(qr(u)||(u="4.8"),!function(t,r){function e(t){return Fi(t)?t:[t]}if(Ri(t))return!1;if(0===(t=e(t)).length)return!1;if(Ri(t))return!1;if(0===(r=e(r)).length)return!1;for(let e=0;e<t.length;e++)for(let n=0;n<r.length;n++)if(Di(t[e],r[n]))return!0;return!1}(u,["4.5","4.6","4.7.2","4.8"]))return Promise.reject("opt.ver needs to be one of 4.5, 4.6, 4.7.2 or 4.8");let a=function(){let t="connLDAP.net4.8.exe",r=`${qi}/src/`,e=`${qi}/node_modules/w-ldap/src/`;return Ni(`${r}${t}`)?r:Ni(`${e}${t}`)?e:{error:"can not find executable file for connLDAP"}}();if(Or(a,"error"))return Promise.reject(a.error);let c=function(t,r){return`${t}connLDAP.net${r}.exe`}(a,u),f=`_${function(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:32,r=[];t=Zr(t)?Yr(t):32;for(let e=0;e<t;e++)r[e]=te[0|Math.random()*re];return r.join("")}()}`;t["__System:OutputFilename"]=f;let s=function(t){if(!qr(t))return"";let r=fe.parse(t);return le.stringify(r)}(JSON.stringify(t));await function(t,r){return new Promise((function(e,o){Fi(r)||(r=[r]);let i=n.spawnSync(t,r),u=Pi(i.output,(t=>null!==t));u=Mi(u,(t=>function(t){try{return t.toString("utf8")}catch(t){}return""}(t)));let a=Ei(u,""),c=Or(i,"error.message");c?o(c):e(a)}))}(c,s).catch((t=>{console.log("WLdap execScript catch",t)}));let l=`${a}${f}`,p=r.readFileSync(l,"utf8");var v;p=p.replace(String.fromCharCode("65279"),"");let h=function(t){if(!qr(t))return{};let r={};try{r=JSON.parse(t)}catch(t){r={}}return r}(qr(v=p)?le.parse(v).toString(fe):"");return r.unlinkSync(l),Or(h,"error")?Promise.reject(h.error):Or(h,"success")||h}}));
//# sourceMappingURL=w-ldap.umd.js.map
