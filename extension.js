"use strict";var Ta=Object.create;var hs=Object.defineProperty;var Da=Object.getOwnPropertyDescriptor;var Ua=Object.getOwnPropertyNames;var Ba=Object.getPrototypeOf,Aa=Object.prototype.hasOwnProperty;var Y=(i,e)=>()=>(e||i((e={exports:{}}).exports,e),e.exports),La=(i,e)=>{for(var t in e)hs(i,t,{get:e[t],enumerable:!0})},Wr=(i,e,t,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Ua(e))!Aa.call(i,r)&&r!==t&&hs(i,r,{get:()=>e[r],enumerable:!(s=Da(e,r))||s.enumerable});return i};var y=(i,e,t)=>(t=i!=null?Ta(Ba(i)):{},Wr(e||!i||!i.__esModule?hs(t,"default",{value:i,enumerable:!0}):t,i)),Oa=i=>Wr(hs({},"__esModule",{value:!0}),i);var be=Y(($h,ko)=>{"use strict";var xo=["nodebuffer","arraybuffer","fragments"],So=typeof Blob<"u";So&&xo.push("blob");ko.exports={BINARY_TYPES:xo,CLOSE_TIMEOUT:3e4,EMPTY_BUFFER:Buffer.alloc(0),GUID:"258EAFA5-E914-47DA-95CA-C5AB0DC85B11",hasBlob:So,kForOnEventAttribute:Symbol("kIsForOnEventAttribute"),kListener:Symbol("kListener"),kStatusCode:Symbol("status-code"),kWebSocket:Symbol("websocket"),NOOP:()=>{}}});var ts=Y((Hh,Vs)=>{"use strict";var{EMPTY_BUFFER:Hl}=be(),wr=Buffer[Symbol.species];function Vl(i,e){if(i.length===0)return Hl;if(i.length===1)return i[0];let t=Buffer.allocUnsafe(e),s=0;for(let r=0;r<i.length;r++){let n=i[r];t.set(n,s),s+=n.length}return s<e?new wr(t.buffer,t.byteOffset,s):t}function Co(i,e,t,s,r){for(let n=0;n<r;n++)t[s+n]=i[n]^e[n&3]}function _o(i,e){for(let t=0;t<i.length;t++)i[t]^=e[t&3]}function Wl(i){return i.length===i.buffer.byteLength?i.buffer:i.buffer.slice(i.byteOffset,i.byteOffset+i.length)}function yr(i){if(yr.readOnly=!0,Buffer.isBuffer(i))return i;let e;return i instanceof ArrayBuffer?e=new wr(i):ArrayBuffer.isView(i)?e=new wr(i.buffer,i.byteOffset,i.byteLength):(e=Buffer.from(i),yr.readOnly=!1),e}Vs.exports={concat:Vl,mask:Co,toArrayBuffer:Wl,toBuffer:yr,unmask:_o};if(!process.env.WS_NO_BUFFER_UTIL)try{let i=require("bufferutil");Vs.exports.mask=function(e,t,s,r,n){n<48?Co(e,t,s,r,n):i.mask(e,t,s,r,n)},Vs.exports.unmask=function(e,t){e.length<32?_o(e,t):i.unmask(e,t)}}catch{}});var Io=Y((Vh,Eo)=>{"use strict";var Po=Symbol("kDone"),br=Symbol("kRun"),xr=class{constructor(e){this[Po]=()=>{this.pending--,this[br]()},this.concurrency=e||1/0,this.jobs=[],this.pending=0}add(e){this.jobs.push(e),this[br]()}[br](){if(this.pending!==this.concurrency&&this.jobs.length){let e=this.jobs.shift();this.pending++,e(this[Po])}}};Eo.exports=xr});var is=Y((Wh,Uo)=>{"use strict";var ss=require("zlib"),Mo=ts(),jl=Io(),{kStatusCode:To}=be(),zl=Buffer[Symbol.species],ql=Buffer.from([0,0,255,255]),js=Symbol("permessage-deflate"),xe=Symbol("total-length"),Ct=Symbol("callback"),Ne=Symbol("buffers"),_t=Symbol("error"),Ws,Sr=class{constructor(e,t,s){if(this._maxPayload=s|0,this._options=e||{},this._threshold=this._options.threshold!==void 0?this._options.threshold:1024,this._isServer=!!t,this._deflate=null,this._inflate=null,this.params=null,!Ws){let r=this._options.concurrencyLimit!==void 0?this._options.concurrencyLimit:10;Ws=new jl(r)}}static get extensionName(){return"permessage-deflate"}offer(){let e={};return this._options.serverNoContextTakeover&&(e.server_no_context_takeover=!0),this._options.clientNoContextTakeover&&(e.client_no_context_takeover=!0),this._options.serverMaxWindowBits&&(e.server_max_window_bits=this._options.serverMaxWindowBits),this._options.clientMaxWindowBits?e.client_max_window_bits=this._options.clientMaxWindowBits:this._options.clientMaxWindowBits==null&&(e.client_max_window_bits=!0),e}accept(e){return e=this.normalizeParams(e),this.params=this._isServer?this.acceptAsServer(e):this.acceptAsClient(e),this.params}cleanup(){if(this._inflate&&(this._inflate.close(),this._inflate=null),this._deflate){let e=this._deflate[Ct];this._deflate.close(),this._deflate=null,e&&e(new Error("The deflate stream was closed while data was being processed"))}}acceptAsServer(e){let t=this._options,s=e.find(r=>!(t.serverNoContextTakeover===!1&&r.server_no_context_takeover||r.server_max_window_bits&&(t.serverMaxWindowBits===!1||typeof t.serverMaxWindowBits=="number"&&t.serverMaxWindowBits>r.server_max_window_bits)||typeof t.clientMaxWindowBits=="number"&&!r.client_max_window_bits));if(!s)throw new Error("None of the extension offers can be accepted");return t.serverNoContextTakeover&&(s.server_no_context_takeover=!0),t.clientNoContextTakeover&&(s.client_no_context_takeover=!0),typeof t.serverMaxWindowBits=="number"&&(s.server_max_window_bits=t.serverMaxWindowBits),typeof t.clientMaxWindowBits=="number"?s.client_max_window_bits=t.clientMaxWindowBits:(s.client_max_window_bits===!0||t.clientMaxWindowBits===!1)&&delete s.client_max_window_bits,s}acceptAsClient(e){let t=e[0];if(this._options.clientNoContextTakeover===!1&&t.client_no_context_takeover)throw new Error('Unexpected parameter "client_no_context_takeover"');if(!t.client_max_window_bits)typeof this._options.clientMaxWindowBits=="number"&&(t.client_max_window_bits=this._options.clientMaxWindowBits);else if(this._options.clientMaxWindowBits===!1||typeof this._options.clientMaxWindowBits=="number"&&t.client_max_window_bits>this._options.clientMaxWindowBits)throw new Error('Unexpected or invalid parameter "client_max_window_bits"');return t}normalizeParams(e){return e.forEach(t=>{Object.keys(t).forEach(s=>{let r=t[s];if(r.length>1)throw new Error(`Parameter "${s}" must have only a single value`);if(r=r[0],s==="client_max_window_bits"){if(r!==!0){let n=+r;if(!Number.isInteger(n)||n<8||n>15)throw new TypeError(`Invalid value for parameter "${s}": ${r}`);r=n}else if(!this._isServer)throw new TypeError(`Invalid value for parameter "${s}": ${r}`)}else if(s==="server_max_window_bits"){let n=+r;if(!Number.isInteger(n)||n<8||n>15)throw new TypeError(`Invalid value for parameter "${s}": ${r}`);r=n}else if(s==="client_no_context_takeover"||s==="server_no_context_takeover"){if(r!==!0)throw new TypeError(`Invalid value for parameter "${s}": ${r}`)}else throw new Error(`Unknown parameter "${s}"`);t[s]=r})}),e}decompress(e,t,s){Ws.add(r=>{this._decompress(e,t,(n,o)=>{r(),s(n,o)})})}compress(e,t,s){Ws.add(r=>{this._compress(e,t,(n,o)=>{r(),s(n,o)})})}_decompress(e,t,s){let r=this._isServer?"client":"server";if(!this._inflate){let n=`${r}_max_window_bits`,o=typeof this.params[n]!="number"?ss.Z_DEFAULT_WINDOWBITS:this.params[n];this._inflate=ss.createInflateRaw({...this._options.zlibInflateOptions,windowBits:o}),this._inflate[js]=this,this._inflate[xe]=0,this._inflate[Ne]=[],this._inflate.on("error",Yl),this._inflate.on("data",Do)}this._inflate[Ct]=s,this._inflate.write(e),t&&this._inflate.write(ql),this._inflate.flush(()=>{let n=this._inflate[_t];if(n){this._inflate.close(),this._inflate=null,s(n);return}let o=Mo.concat(this._inflate[Ne],this._inflate[xe]);this._inflate._readableState.endEmitted?(this._inflate.close(),this._inflate=null):(this._inflate[xe]=0,this._inflate[Ne]=[],t&&this.params[`${r}_no_context_takeover`]&&this._inflate.reset()),s(null,o)})}_compress(e,t,s){let r=this._isServer?"server":"client";if(!this._deflate){let n=`${r}_max_window_bits`,o=typeof this.params[n]!="number"?ss.Z_DEFAULT_WINDOWBITS:this.params[n];this._deflate=ss.createDeflateRaw({...this._options.zlibDeflateOptions,windowBits:o}),this._deflate[xe]=0,this._deflate[Ne]=[],this._deflate.on("data",Gl)}this._deflate[Ct]=s,this._deflate.write(e),this._deflate.flush(ss.Z_SYNC_FLUSH,()=>{if(!this._deflate)return;let n=Mo.concat(this._deflate[Ne],this._deflate[xe]);t&&(n=new zl(n.buffer,n.byteOffset,n.length-4)),this._deflate[Ct]=null,this._deflate[xe]=0,this._deflate[Ne]=[],t&&this.params[`${r}_no_context_takeover`]&&this._deflate.reset(),s(null,n)})}};Uo.exports=Sr;function Gl(i){this[Ne].push(i),this[xe]+=i.length}function Do(i){if(this[xe]+=i.length,this[js]._maxPayload<1||this[xe]<=this[js]._maxPayload){this[Ne].push(i);return}this[_t]=new RangeError("Max payload size exceeded"),this[_t].code="WS_ERR_UNSUPPORTED_MESSAGE_LENGTH",this[_t][To]=1009,this.removeListener("data",Do),this.reset()}function Yl(i){if(this[js]._inflate=null,this[_t]){this[Ct](this[_t]);return}i[To]=1007,this[Ct](i)}});var Pt=Y((jh,zs)=>{"use strict";var{isUtf8:Bo}=require("buffer"),{hasBlob:Jl}=be(),Xl=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1,0,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0];function Kl(i){return i>=1e3&&i<=1014&&i!==1004&&i!==1005&&i!==1006||i>=3e3&&i<=4999}function kr(i){let e=i.length,t=0;for(;t<e;)if(!(i[t]&128))t++;else if((i[t]&224)===192){if(t+1===e||(i[t+1]&192)!==128||(i[t]&254)===192)return!1;t+=2}else if((i[t]&240)===224){if(t+2>=e||(i[t+1]&192)!==128||(i[t+2]&192)!==128||i[t]===224&&(i[t+1]&224)===128||i[t]===237&&(i[t+1]&224)===160)return!1;t+=3}else if((i[t]&248)===240){if(t+3>=e||(i[t+1]&192)!==128||(i[t+2]&192)!==128||(i[t+3]&192)!==128||i[t]===240&&(i[t+1]&240)===128||i[t]===244&&i[t+1]>143||i[t]>244)return!1;t+=4}else return!1;return!0}function Zl(i){return Jl&&typeof i=="object"&&typeof i.arrayBuffer=="function"&&typeof i.type=="string"&&typeof i.stream=="function"&&(i[Symbol.toStringTag]==="Blob"||i[Symbol.toStringTag]==="File")}zs.exports={isBlob:Zl,isValidStatusCode:Kl,isValidUTF8:kr,tokenChars:Xl};if(Bo)zs.exports.isValidUTF8=function(i){return i.length<24?kr(i):Bo(i)};else if(!process.env.WS_NO_UTF_8_VALIDATE)try{let i=require("utf-8-validate");zs.exports.isValidUTF8=function(e){return e.length<32?kr(e):i(e)}}catch{}});var Ir=Y((zh,$o)=>{"use strict";var{Writable:Ql}=require("stream"),Ao=is(),{BINARY_TYPES:ed,EMPTY_BUFFER:Lo,kStatusCode:td,kWebSocket:sd}=be(),{concat:Cr,toArrayBuffer:id,unmask:rd}=ts(),{isValidStatusCode:nd,isValidUTF8:Oo}=Pt(),qs=Buffer[Symbol.species],ee=0,No=1,Ro=2,Fo=3,_r=4,Pr=5,Gs=6,Er=class extends Ql{constructor(e={}){super(),this._allowSynchronousEvents=e.allowSynchronousEvents!==void 0?e.allowSynchronousEvents:!0,this._binaryType=e.binaryType||ed[0],this._extensions=e.extensions||{},this._isServer=!!e.isServer,this._maxPayload=e.maxPayload|0,this._skipUTF8Validation=!!e.skipUTF8Validation,this[sd]=void 0,this._bufferedBytes=0,this._buffers=[],this._compressed=!1,this._payloadLength=0,this._mask=void 0,this._fragmented=0,this._masked=!1,this._fin=!1,this._opcode=0,this._totalPayloadLength=0,this._messageLength=0,this._fragments=[],this._errored=!1,this._loop=!1,this._state=ee}_write(e,t,s){if(this._opcode===8&&this._state==ee)return s();this._bufferedBytes+=e.length,this._buffers.push(e),this.startLoop(s)}consume(e){if(this._bufferedBytes-=e,e===this._buffers[0].length)return this._buffers.shift();if(e<this._buffers[0].length){let s=this._buffers[0];return this._buffers[0]=new qs(s.buffer,s.byteOffset+e,s.length-e),new qs(s.buffer,s.byteOffset,e)}let t=Buffer.allocUnsafe(e);do{let s=this._buffers[0],r=t.length-e;e>=s.length?t.set(this._buffers.shift(),r):(t.set(new Uint8Array(s.buffer,s.byteOffset,e),r),this._buffers[0]=new qs(s.buffer,s.byteOffset+e,s.length-e)),e-=s.length}while(e>0);return t}startLoop(e){this._loop=!0;do switch(this._state){case ee:this.getInfo(e);break;case No:this.getPayloadLength16(e);break;case Ro:this.getPayloadLength64(e);break;case Fo:this.getMask();break;case _r:this.getData(e);break;case Pr:case Gs:this._loop=!1;return}while(this._loop);this._errored||e()}getInfo(e){if(this._bufferedBytes<2){this._loop=!1;return}let t=this.consume(2);if(t[0]&48){let r=this.createError(RangeError,"RSV2 and RSV3 must be clear",!0,1002,"WS_ERR_UNEXPECTED_RSV_2_3");e(r);return}let s=(t[0]&64)===64;if(s&&!this._extensions[Ao.extensionName]){let r=this.createError(RangeError,"RSV1 must be clear",!0,1002,"WS_ERR_UNEXPECTED_RSV_1");e(r);return}if(this._fin=(t[0]&128)===128,this._opcode=t[0]&15,this._payloadLength=t[1]&127,this._opcode===0){if(s){let r=this.createError(RangeError,"RSV1 must be clear",!0,1002,"WS_ERR_UNEXPECTED_RSV_1");e(r);return}if(!this._fragmented){let r=this.createError(RangeError,"invalid opcode 0",!0,1002,"WS_ERR_INVALID_OPCODE");e(r);return}this._opcode=this._fragmented}else if(this._opcode===1||this._opcode===2){if(this._fragmented){let r=this.createError(RangeError,`invalid opcode ${this._opcode}`,!0,1002,"WS_ERR_INVALID_OPCODE");e(r);return}this._compressed=s}else if(this._opcode>7&&this._opcode<11){if(!this._fin){let r=this.createError(RangeError,"FIN must be set",!0,1002,"WS_ERR_EXPECTED_FIN");e(r);return}if(s){let r=this.createError(RangeError,"RSV1 must be clear",!0,1002,"WS_ERR_UNEXPECTED_RSV_1");e(r);return}if(this._payloadLength>125||this._opcode===8&&this._payloadLength===1){let r=this.createError(RangeError,`invalid payload length ${this._payloadLength}`,!0,1002,"WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");e(r);return}}else{let r=this.createError(RangeError,`invalid opcode ${this._opcode}`,!0,1002,"WS_ERR_INVALID_OPCODE");e(r);return}if(!this._fin&&!this._fragmented&&(this._fragmented=this._opcode),this._masked=(t[1]&128)===128,this._isServer){if(!this._masked){let r=this.createError(RangeError,"MASK must be set",!0,1002,"WS_ERR_EXPECTED_MASK");e(r);return}}else if(this._masked){let r=this.createError(RangeError,"MASK must be clear",!0,1002,"WS_ERR_UNEXPECTED_MASK");e(r);return}this._payloadLength===126?this._state=No:this._payloadLength===127?this._state=Ro:this.haveLength(e)}getPayloadLength16(e){if(this._bufferedBytes<2){this._loop=!1;return}this._payloadLength=this.consume(2).readUInt16BE(0),this.haveLength(e)}getPayloadLength64(e){if(this._bufferedBytes<8){this._loop=!1;return}let t=this.consume(8),s=t.readUInt32BE(0);if(s>Math.pow(2,21)-1){let r=this.createError(RangeError,"Unsupported WebSocket frame: payload length > 2^53 - 1",!1,1009,"WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH");e(r);return}this._payloadLength=s*Math.pow(2,32)+t.readUInt32BE(4),this.haveLength(e)}haveLength(e){if(this._payloadLength&&this._opcode<8&&(this._totalPayloadLength+=this._payloadLength,this._totalPayloadLength>this._maxPayload&&this._maxPayload>0)){let t=this.createError(RangeError,"Max payload size exceeded",!1,1009,"WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");e(t);return}this._masked?this._state=Fo:this._state=_r}getMask(){if(this._bufferedBytes<4){this._loop=!1;return}this._mask=this.consume(4),this._state=_r}getData(e){let t=Lo;if(this._payloadLength){if(this._bufferedBytes<this._payloadLength){this._loop=!1;return}t=this.consume(this._payloadLength),this._masked&&this._mask[0]|this._mask[1]|this._mask[2]|this._mask[3]&&rd(t,this._mask)}if(this._opcode>7){this.controlMessage(t,e);return}if(this._compressed){this._state=Pr,this.decompress(t,e);return}t.length&&(this._messageLength=this._totalPayloadLength,this._fragments.push(t)),this.dataMessage(e)}decompress(e,t){this._extensions[Ao.extensionName].decompress(e,this._fin,(r,n)=>{if(r)return t(r);if(n.length){if(this._messageLength+=n.length,this._messageLength>this._maxPayload&&this._maxPayload>0){let o=this.createError(RangeError,"Max payload size exceeded",!1,1009,"WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");t(o);return}this._fragments.push(n)}this.dataMessage(t),this._state===ee&&this.startLoop(t)})}dataMessage(e){if(!this._fin){this._state=ee;return}let t=this._messageLength,s=this._fragments;if(this._totalPayloadLength=0,this._messageLength=0,this._fragmented=0,this._fragments=[],this._opcode===2){let r;this._binaryType==="nodebuffer"?r=Cr(s,t):this._binaryType==="arraybuffer"?r=id(Cr(s,t)):this._binaryType==="blob"?r=new Blob(s):r=s,this._allowSynchronousEvents?(this.emit("message",r,!0),this._state=ee):(this._state=Gs,setImmediate(()=>{this.emit("message",r,!0),this._state=ee,this.startLoop(e)}))}else{let r=Cr(s,t);if(!this._skipUTF8Validation&&!Oo(r)){let n=this.createError(Error,"invalid UTF-8 sequence",!0,1007,"WS_ERR_INVALID_UTF8");e(n);return}this._state===Pr||this._allowSynchronousEvents?(this.emit("message",r,!1),this._state=ee):(this._state=Gs,setImmediate(()=>{this.emit("message",r,!1),this._state=ee,this.startLoop(e)}))}}controlMessage(e,t){if(this._opcode===8){if(e.length===0)this._loop=!1,this.emit("conclude",1005,Lo),this.end();else{let s=e.readUInt16BE(0);if(!nd(s)){let n=this.createError(RangeError,`invalid status code ${s}`,!0,1002,"WS_ERR_INVALID_CLOSE_CODE");t(n);return}let r=new qs(e.buffer,e.byteOffset+2,e.length-2);if(!this._skipUTF8Validation&&!Oo(r)){let n=this.createError(Error,"invalid UTF-8 sequence",!0,1007,"WS_ERR_INVALID_UTF8");t(n);return}this._loop=!1,this.emit("conclude",s,r),this.end()}this._state=ee;return}this._allowSynchronousEvents?(this.emit(this._opcode===9?"ping":"pong",e),this._state=ee):(this._state=Gs,setImmediate(()=>{this.emit(this._opcode===9?"ping":"pong",e),this._state=ee,this.startLoop(t)}))}createError(e,t,s,r,n){this._loop=!1,this._errored=!0;let o=new e(s?`Invalid WebSocket frame: ${t}`:t);return Error.captureStackTrace(o,this.createError),o.code=n,o[td]=r,o}};$o.exports=Er});var Dr=Y((Gh,Wo)=>{"use strict";var{Duplex:qh}=require("stream"),{randomFillSync:od}=require("crypto"),Ho=is(),{EMPTY_BUFFER:ad,kWebSocket:cd,NOOP:ld}=be(),{isBlob:Et,isValidStatusCode:dd}=Pt(),{mask:Vo,toBuffer:tt}=ts(),te=Symbol("kByteLength"),hd=Buffer.alloc(4),Ys=8*1024,st,It=Ys,oe=0,pd=1,ud=2,Mr=class i{constructor(e,t,s){this._extensions=t||{},s&&(this._generateMask=s,this._maskBuffer=Buffer.alloc(4)),this._socket=e,this._firstFragment=!0,this._compress=!1,this._bufferedBytes=0,this._queue=[],this._state=oe,this.onerror=ld,this[cd]=void 0}static frame(e,t){let s,r=!1,n=2,o=!1;t.mask&&(s=t.maskBuffer||hd,t.generateMask?t.generateMask(s):(It===Ys&&(st===void 0&&(st=Buffer.alloc(Ys)),od(st,0,Ys),It=0),s[0]=st[It++],s[1]=st[It++],s[2]=st[It++],s[3]=st[It++]),o=(s[0]|s[1]|s[2]|s[3])===0,n=6);let a;typeof e=="string"?(!t.mask||o)&&t[te]!==void 0?a=t[te]:(e=Buffer.from(e),a=e.length):(a=e.length,r=t.mask&&t.readOnly&&!o);let c=a;a>=65536?(n+=8,c=127):a>125&&(n+=2,c=126);let l=Buffer.allocUnsafe(r?a+n:n);return l[0]=t.fin?t.opcode|128:t.opcode,t.rsv1&&(l[0]|=64),l[1]=c,c===126?l.writeUInt16BE(a,2):c===127&&(l[2]=l[3]=0,l.writeUIntBE(a,4,6)),t.mask?(l[1]|=128,l[n-4]=s[0],l[n-3]=s[1],l[n-2]=s[2],l[n-1]=s[3],o?[l,e]:r?(Vo(e,s,l,n,a),[l]):(Vo(e,s,e,0,a),[l,e])):[l,e]}close(e,t,s,r){let n;if(e===void 0)n=ad;else{if(typeof e!="number"||!dd(e))throw new TypeError("First argument must be a valid error code number");if(t===void 0||!t.length)n=Buffer.allocUnsafe(2),n.writeUInt16BE(e,0);else{let a=Buffer.byteLength(t);if(a>123)throw new RangeError("The message must not be greater than 123 bytes");n=Buffer.allocUnsafe(2+a),n.writeUInt16BE(e,0),typeof t=="string"?n.write(t,2):n.set(t,2)}}let o={[te]:n.length,fin:!0,generateMask:this._generateMask,mask:s,maskBuffer:this._maskBuffer,opcode:8,readOnly:!1,rsv1:!1};this._state!==oe?this.enqueue([this.dispatch,n,!1,o,r]):this.sendFrame(i.frame(n,o),r)}ping(e,t,s){let r,n;if(typeof e=="string"?(r=Buffer.byteLength(e),n=!1):Et(e)?(r=e.size,n=!1):(e=tt(e),r=e.length,n=tt.readOnly),r>125)throw new RangeError("The data size must not be greater than 125 bytes");let o={[te]:r,fin:!0,generateMask:this._generateMask,mask:t,maskBuffer:this._maskBuffer,opcode:9,readOnly:n,rsv1:!1};Et(e)?this._state!==oe?this.enqueue([this.getBlobData,e,!1,o,s]):this.getBlobData(e,!1,o,s):this._state!==oe?this.enqueue([this.dispatch,e,!1,o,s]):this.sendFrame(i.frame(e,o),s)}pong(e,t,s){let r,n;if(typeof e=="string"?(r=Buffer.byteLength(e),n=!1):Et(e)?(r=e.size,n=!1):(e=tt(e),r=e.length,n=tt.readOnly),r>125)throw new RangeError("The data size must not be greater than 125 bytes");let o={[te]:r,fin:!0,generateMask:this._generateMask,mask:t,maskBuffer:this._maskBuffer,opcode:10,readOnly:n,rsv1:!1};Et(e)?this._state!==oe?this.enqueue([this.getBlobData,e,!1,o,s]):this.getBlobData(e,!1,o,s):this._state!==oe?this.enqueue([this.dispatch,e,!1,o,s]):this.sendFrame(i.frame(e,o),s)}send(e,t,s){let r=this._extensions[Ho.extensionName],n=t.binary?2:1,o=t.compress,a,c;typeof e=="string"?(a=Buffer.byteLength(e),c=!1):Et(e)?(a=e.size,c=!1):(e=tt(e),a=e.length,c=tt.readOnly),this._firstFragment?(this._firstFragment=!1,o&&r&&r.params[r._isServer?"server_no_context_takeover":"client_no_context_takeover"]&&(o=a>=r._threshold),this._compress=o):(o=!1,n=0),t.fin&&(this._firstFragment=!0);let l={[te]:a,fin:t.fin,generateMask:this._generateMask,mask:t.mask,maskBuffer:this._maskBuffer,opcode:n,readOnly:c,rsv1:o};Et(e)?this._state!==oe?this.enqueue([this.getBlobData,e,this._compress,l,s]):this.getBlobData(e,this._compress,l,s):this._state!==oe?this.enqueue([this.dispatch,e,this._compress,l,s]):this.dispatch(e,this._compress,l,s)}getBlobData(e,t,s,r){this._bufferedBytes+=s[te],this._state=ud,e.arrayBuffer().then(n=>{if(this._socket.destroyed){let a=new Error("The socket was closed while the blob was being read");process.nextTick(Tr,this,a,r);return}this._bufferedBytes-=s[te];let o=tt(n);t?this.dispatch(o,t,s,r):(this._state=oe,this.sendFrame(i.frame(o,s),r),this.dequeue())}).catch(n=>{process.nextTick(fd,this,n,r)})}dispatch(e,t,s,r){if(!t){this.sendFrame(i.frame(e,s),r);return}let n=this._extensions[Ho.extensionName];this._bufferedBytes+=s[te],this._state=pd,n.compress(e,s.fin,(o,a)=>{if(this._socket.destroyed){let c=new Error("The socket was closed while data was being compressed");Tr(this,c,r);return}this._bufferedBytes-=s[te],this._state=oe,s.readOnly=!1,this.sendFrame(i.frame(a,s),r),this.dequeue()})}dequeue(){for(;this._state===oe&&this._queue.length;){let e=this._queue.shift();this._bufferedBytes-=e[3][te],Reflect.apply(e[0],this,e.slice(1))}}enqueue(e){this._bufferedBytes+=e[3][te],this._queue.push(e)}sendFrame(e,t){e.length===2?(this._socket.cork(),this._socket.write(e[0]),this._socket.write(e[1],t),this._socket.uncork()):this._socket.write(e[0],t)}};Wo.exports=Mr;function Tr(i,e,t){typeof t=="function"&&t(e);for(let s=0;s<i._queue.length;s++){let r=i._queue[s],n=r[r.length-1];typeof n=="function"&&n(e)}}function fd(i,e,t){Tr(i,e,t),i.onerror(e)}});var Zo=Y((Yh,Ko)=>{"use strict";var{kForOnEventAttribute:rs,kListener:Ur}=be(),jo=Symbol("kCode"),zo=Symbol("kData"),qo=Symbol("kError"),Go=Symbol("kMessage"),Yo=Symbol("kReason"),Mt=Symbol("kTarget"),Jo=Symbol("kType"),Xo=Symbol("kWasClean"),Se=class{constructor(e){this[Mt]=null,this[Jo]=e}get target(){return this[Mt]}get type(){return this[Jo]}};Object.defineProperty(Se.prototype,"target",{enumerable:!0});Object.defineProperty(Se.prototype,"type",{enumerable:!0});var it=class extends Se{constructor(e,t={}){super(e),this[jo]=t.code===void 0?0:t.code,this[Yo]=t.reason===void 0?"":t.reason,this[Xo]=t.wasClean===void 0?!1:t.wasClean}get code(){return this[jo]}get reason(){return this[Yo]}get wasClean(){return this[Xo]}};Object.defineProperty(it.prototype,"code",{enumerable:!0});Object.defineProperty(it.prototype,"reason",{enumerable:!0});Object.defineProperty(it.prototype,"wasClean",{enumerable:!0});var Tt=class extends Se{constructor(e,t={}){super(e),this[qo]=t.error===void 0?null:t.error,this[Go]=t.message===void 0?"":t.message}get error(){return this[qo]}get message(){return this[Go]}};Object.defineProperty(Tt.prototype,"error",{enumerable:!0});Object.defineProperty(Tt.prototype,"message",{enumerable:!0});var ns=class extends Se{constructor(e,t={}){super(e),this[zo]=t.data===void 0?null:t.data}get data(){return this[zo]}};Object.defineProperty(ns.prototype,"data",{enumerable:!0});var gd={addEventListener(i,e,t={}){for(let r of this.listeners(i))if(!t[rs]&&r[Ur]===e&&!r[rs])return;let s;if(i==="message")s=function(n,o){let a=new ns("message",{data:o?n:n.toString()});a[Mt]=this,Js(e,this,a)};else if(i==="close")s=function(n,o){let a=new it("close",{code:n,reason:o.toString(),wasClean:this._closeFrameReceived&&this._closeFrameSent});a[Mt]=this,Js(e,this,a)};else if(i==="error")s=function(n){let o=new Tt("error",{error:n,message:n.message});o[Mt]=this,Js(e,this,o)};else if(i==="open")s=function(){let n=new Se("open");n[Mt]=this,Js(e,this,n)};else return;s[rs]=!!t[rs],s[Ur]=e,t.once?this.once(i,s):this.on(i,s)},removeEventListener(i,e){for(let t of this.listeners(i))if(t[Ur]===e&&!t[rs]){this.removeListener(i,t);break}}};Ko.exports={CloseEvent:it,ErrorEvent:Tt,Event:Se,EventTarget:gd,MessageEvent:ns};function Js(i,e,t){typeof i=="object"&&i.handleEvent?i.handleEvent.call(i,t):i.call(e,t)}});var Br=Y((Jh,Qo)=>{"use strict";var{tokenChars:os}=Pt();function ue(i,e,t){i[e]===void 0?i[e]=[t]:i[e].push(t)}function md(i){let e=Object.create(null),t=Object.create(null),s=!1,r=!1,n=!1,o,a,c=-1,l=-1,d=-1,h=0;for(;h<i.length;h++)if(l=i.charCodeAt(h),o===void 0)if(d===-1&&os[l]===1)c===-1&&(c=h);else if(h!==0&&(l===32||l===9))d===-1&&c!==-1&&(d=h);else if(l===59||l===44){if(c===-1)throw new SyntaxError(`Unexpected character at index ${h}`);d===-1&&(d=h);let u=i.slice(c,d);l===44?(ue(e,u,t),t=Object.create(null)):o=u,c=d=-1}else throw new SyntaxError(`Unexpected character at index ${h}`);else if(a===void 0)if(d===-1&&os[l]===1)c===-1&&(c=h);else if(l===32||l===9)d===-1&&c!==-1&&(d=h);else if(l===59||l===44){if(c===-1)throw new SyntaxError(`Unexpected character at index ${h}`);d===-1&&(d=h),ue(t,i.slice(c,d),!0),l===44&&(ue(e,o,t),t=Object.create(null),o=void 0),c=d=-1}else if(l===61&&c!==-1&&d===-1)a=i.slice(c,h),c=d=-1;else throw new SyntaxError(`Unexpected character at index ${h}`);else if(r){if(os[l]!==1)throw new SyntaxError(`Unexpected character at index ${h}`);c===-1?c=h:s||(s=!0),r=!1}else if(n)if(os[l]===1)c===-1&&(c=h);else if(l===34&&c!==-1)n=!1,d=h;else if(l===92)r=!0;else throw new SyntaxError(`Unexpected character at index ${h}`);else if(l===34&&i.charCodeAt(h-1)===61)n=!0;else if(d===-1&&os[l]===1)c===-1&&(c=h);else if(c!==-1&&(l===32||l===9))d===-1&&(d=h);else if(l===59||l===44){if(c===-1)throw new SyntaxError(`Unexpected character at index ${h}`);d===-1&&(d=h);let u=i.slice(c,d);s&&(u=u.replace(/\\/g,""),s=!1),ue(t,a,u),l===44&&(ue(e,o,t),t=Object.create(null),o=void 0),a=void 0,c=d=-1}else throw new SyntaxError(`Unexpected character at index ${h}`);if(c===-1||n||l===32||l===9)throw new SyntaxError("Unexpected end of input");d===-1&&(d=h);let p=i.slice(c,d);return o===void 0?ue(e,p,t):(a===void 0?ue(t,p,!0):s?ue(t,a,p.replace(/\\/g,"")):ue(t,a,p),ue(e,o,t)),e}function vd(i){return Object.keys(i).map(e=>{let t=i[e];return Array.isArray(t)||(t=[t]),t.map(s=>[e].concat(Object.keys(s).map(r=>{let n=s[r];return Array.isArray(n)||(n=[n]),n.map(o=>o===!0?r:`${r}=${o}`).join("; ")})).join("; ")).join(", ")}).join(", ")}Qo.exports={format:vd,parse:md}});var Qs=Y((Zh,ha)=>{"use strict";var wd=require("events"),yd=require("https"),bd=require("http"),sa=require("net"),xd=require("tls"),{randomBytes:Sd,createHash:kd}=require("crypto"),{Duplex:Xh,Readable:Kh}=require("stream"),{URL:Ar}=require("url"),Re=is(),Cd=Ir(),_d=Dr(),{isBlob:Pd}=Pt(),{BINARY_TYPES:ea,CLOSE_TIMEOUT:Ed,EMPTY_BUFFER:Xs,GUID:Id,kForOnEventAttribute:Lr,kListener:Md,kStatusCode:Td,kWebSocket:H,NOOP:ia}=be(),{EventTarget:{addEventListener:Dd,removeEventListener:Ud}}=Zo(),{format:Bd,parse:Ad}=Br(),{toBuffer:Ld}=ts(),ra=Symbol("kAborted"),Or=[8,13],ke=["CONNECTING","OPEN","CLOSING","CLOSED"],Od=/^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/,I=class i extends wd{constructor(e,t,s){super(),this._binaryType=ea[0],this._closeCode=1006,this._closeFrameReceived=!1,this._closeFrameSent=!1,this._closeMessage=Xs,this._closeTimer=null,this._errorEmitted=!1,this._extensions={},this._paused=!1,this._protocol="",this._readyState=i.CONNECTING,this._receiver=null,this._sender=null,this._socket=null,e!==null?(this._bufferedAmount=0,this._isServer=!1,this._redirects=0,t===void 0?t=[]:Array.isArray(t)||(typeof t=="object"&&t!==null?(s=t,t=[]):t=[t]),na(this,e,t,s)):(this._autoPong=s.autoPong,this._closeTimeout=s.closeTimeout,this._isServer=!0)}get binaryType(){return this._binaryType}set binaryType(e){ea.includes(e)&&(this._binaryType=e,this._receiver&&(this._receiver._binaryType=e))}get bufferedAmount(){return this._socket?this._socket._writableState.length+this._sender._bufferedBytes:this._bufferedAmount}get extensions(){return Object.keys(this._extensions).join()}get isPaused(){return this._paused}get onclose(){return null}get onerror(){return null}get onopen(){return null}get onmessage(){return null}get protocol(){return this._protocol}get readyState(){return this._readyState}get url(){return this._url}setSocket(e,t,s){let r=new Cd({allowSynchronousEvents:s.allowSynchronousEvents,binaryType:this.binaryType,extensions:this._extensions,isServer:this._isServer,maxPayload:s.maxPayload,skipUTF8Validation:s.skipUTF8Validation}),n=new _d(e,this._extensions,s.generateMask);this._receiver=r,this._sender=n,this._socket=e,r[H]=this,n[H]=this,e[H]=this,r.on("conclude",Fd),r.on("drain",$d),r.on("error",Hd),r.on("message",Vd),r.on("ping",Wd),r.on("pong",jd),n.onerror=zd,e.setTimeout&&e.setTimeout(0),e.setNoDelay&&e.setNoDelay(),t.length>0&&e.unshift(t),e.on("close",ca),e.on("data",Zs),e.on("end",la),e.on("error",da),this._readyState=i.OPEN,this.emit("open")}emitClose(){if(!this._socket){this._readyState=i.CLOSED,this.emit("close",this._closeCode,this._closeMessage);return}this._extensions[Re.extensionName]&&this._extensions[Re.extensionName].cleanup(),this._receiver.removeAllListeners(),this._readyState=i.CLOSED,this.emit("close",this._closeCode,this._closeMessage)}close(e,t){if(this.readyState!==i.CLOSED){if(this.readyState===i.CONNECTING){X(this,this._req,"WebSocket was closed before the connection was established");return}if(this.readyState===i.CLOSING){this._closeFrameSent&&(this._closeFrameReceived||this._receiver._writableState.errorEmitted)&&this._socket.end();return}this._readyState=i.CLOSING,this._sender.close(e,t,!this._isServer,s=>{s||(this._closeFrameSent=!0,(this._closeFrameReceived||this._receiver._writableState.errorEmitted)&&this._socket.end())}),aa(this)}}pause(){this.readyState===i.CONNECTING||this.readyState===i.CLOSED||(this._paused=!0,this._socket.pause())}ping(e,t,s){if(this.readyState===i.CONNECTING)throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");if(typeof e=="function"?(s=e,e=t=void 0):typeof t=="function"&&(s=t,t=void 0),typeof e=="number"&&(e=e.toString()),this.readyState!==i.OPEN){Nr(this,e,s);return}t===void 0&&(t=!this._isServer),this._sender.ping(e||Xs,t,s)}pong(e,t,s){if(this.readyState===i.CONNECTING)throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");if(typeof e=="function"?(s=e,e=t=void 0):typeof t=="function"&&(s=t,t=void 0),typeof e=="number"&&(e=e.toString()),this.readyState!==i.OPEN){Nr(this,e,s);return}t===void 0&&(t=!this._isServer),this._sender.pong(e||Xs,t,s)}resume(){this.readyState===i.CONNECTING||this.readyState===i.CLOSED||(this._paused=!1,this._receiver._writableState.needDrain||this._socket.resume())}send(e,t,s){if(this.readyState===i.CONNECTING)throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");if(typeof t=="function"&&(s=t,t={}),typeof e=="number"&&(e=e.toString()),this.readyState!==i.OPEN){Nr(this,e,s);return}let r={binary:typeof e!="string",mask:!this._isServer,compress:!0,fin:!0,...t};this._extensions[Re.extensionName]||(r.compress=!1),this._sender.send(e||Xs,r,s)}terminate(){if(this.readyState!==i.CLOSED){if(this.readyState===i.CONNECTING){X(this,this._req,"WebSocket was closed before the connection was established");return}this._socket&&(this._readyState=i.CLOSING,this._socket.destroy())}}};Object.defineProperty(I,"CONNECTING",{enumerable:!0,value:ke.indexOf("CONNECTING")});Object.defineProperty(I.prototype,"CONNECTING",{enumerable:!0,value:ke.indexOf("CONNECTING")});Object.defineProperty(I,"OPEN",{enumerable:!0,value:ke.indexOf("OPEN")});Object.defineProperty(I.prototype,"OPEN",{enumerable:!0,value:ke.indexOf("OPEN")});Object.defineProperty(I,"CLOSING",{enumerable:!0,value:ke.indexOf("CLOSING")});Object.defineProperty(I.prototype,"CLOSING",{enumerable:!0,value:ke.indexOf("CLOSING")});Object.defineProperty(I,"CLOSED",{enumerable:!0,value:ke.indexOf("CLOSED")});Object.defineProperty(I.prototype,"CLOSED",{enumerable:!0,value:ke.indexOf("CLOSED")});["binaryType","bufferedAmount","extensions","isPaused","protocol","readyState","url"].forEach(i=>{Object.defineProperty(I.prototype,i,{enumerable:!0})});["open","error","close","message"].forEach(i=>{Object.defineProperty(I.prototype,`on${i}`,{enumerable:!0,get(){for(let e of this.listeners(i))if(e[Lr])return e[Md];return null},set(e){for(let t of this.listeners(i))if(t[Lr]){this.removeListener(i,t);break}typeof e=="function"&&this.addEventListener(i,e,{[Lr]:!0})}})});I.prototype.addEventListener=Dd;I.prototype.removeEventListener=Ud;ha.exports=I;function na(i,e,t,s){let r={allowSynchronousEvents:!0,autoPong:!0,closeTimeout:Ed,protocolVersion:Or[1],maxPayload:104857600,skipUTF8Validation:!1,perMessageDeflate:!0,followRedirects:!1,maxRedirects:10,...s,socketPath:void 0,hostname:void 0,protocol:void 0,timeout:void 0,method:"GET",host:void 0,path:void 0,port:void 0};if(i._autoPong=r.autoPong,i._closeTimeout=r.closeTimeout,!Or.includes(r.protocolVersion))throw new RangeError(`Unsupported protocol version: ${r.protocolVersion} (supported versions: ${Or.join(", ")})`);let n;if(e instanceof Ar)n=e;else try{n=new Ar(e)}catch{throw new SyntaxError(`Invalid URL: ${e}`)}n.protocol==="http:"?n.protocol="ws:":n.protocol==="https:"&&(n.protocol="wss:"),i._url=n.href;let o=n.protocol==="wss:",a=n.protocol==="ws+unix:",c;if(n.protocol!=="ws:"&&!o&&!a?c=`The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`:a&&!n.pathname?c="The URL's pathname is empty":n.hash&&(c="The URL contains a fragment identifier"),c){let g=new SyntaxError(c);if(i._redirects===0)throw g;Ks(i,g);return}let l=o?443:80,d=Sd(16).toString("base64"),h=o?yd.request:bd.request,p=new Set,u;if(r.createConnection=r.createConnection||(o?Rd:Nd),r.defaultPort=r.defaultPort||l,r.port=n.port||l,r.host=n.hostname.startsWith("[")?n.hostname.slice(1,-1):n.hostname,r.headers={...r.headers,"Sec-WebSocket-Version":r.protocolVersion,"Sec-WebSocket-Key":d,Connection:"Upgrade",Upgrade:"websocket"},r.path=n.pathname+n.search,r.timeout=r.handshakeTimeout,r.perMessageDeflate&&(u=new Re(r.perMessageDeflate!==!0?r.perMessageDeflate:{},!1,r.maxPayload),r.headers["Sec-WebSocket-Extensions"]=Bd({[Re.extensionName]:u.offer()})),t.length){for(let g of t){if(typeof g!="string"||!Od.test(g)||p.has(g))throw new SyntaxError("An invalid or duplicated subprotocol was specified");p.add(g)}r.headers["Sec-WebSocket-Protocol"]=t.join(",")}if(r.origin&&(r.protocolVersion<13?r.headers["Sec-WebSocket-Origin"]=r.origin:r.headers.Origin=r.origin),(n.username||n.password)&&(r.auth=`${n.username}:${n.password}`),a){let g=r.path.split(":");r.socketPath=g[0],r.path=g[1]}let f;if(r.followRedirects){if(i._redirects===0){i._originalIpc=a,i._originalSecure=o,i._originalHostOrSocketPath=a?r.socketPath:n.host;let g=s&&s.headers;if(s={...s,headers:{}},g)for(let[E,Me]of Object.entries(g))s.headers[E.toLowerCase()]=Me}else if(i.listenerCount("redirect")===0){let g=a?i._originalIpc?r.socketPath===i._originalHostOrSocketPath:!1:i._originalIpc?!1:n.host===i._originalHostOrSocketPath;(!g||i._originalSecure&&!o)&&(delete r.headers.authorization,delete r.headers.cookie,g||delete r.headers.host,r.auth=void 0)}r.auth&&!s.headers.authorization&&(s.headers.authorization="Basic "+Buffer.from(r.auth).toString("base64")),f=i._req=h(r),i._redirects&&i.emit("redirect",i.url,f)}else f=i._req=h(r);r.timeout&&f.on("timeout",()=>{X(i,f,"Opening handshake has timed out")}),f.on("error",g=>{f===null||f[ra]||(f=i._req=null,Ks(i,g))}),f.on("response",g=>{let E=g.headers.location,Me=g.statusCode;if(E&&r.followRedirects&&Me>=300&&Me<400){if(++i._redirects>r.maxRedirects){X(i,f,"Maximum redirects exceeded");return}f.abort();let Ve;try{Ve=new Ar(E,e)}catch{let at=new SyntaxError(`Invalid URL: ${E}`);Ks(i,at);return}na(i,Ve,t,s)}else i.emit("unexpected-response",f,g)||X(i,f,`Unexpected server response: ${g.statusCode}`)}),f.on("upgrade",(g,E,Me)=>{if(i.emit("upgrade",g),i.readyState!==I.CONNECTING)return;f=i._req=null;let Ve=g.headers.upgrade;if(Ve===void 0||Ve.toLowerCase()!=="websocket"){X(i,E,"Invalid Upgrade header");return}let $r=kd("sha1").update(d+Id).digest("base64");if(g.headers["sec-websocket-accept"]!==$r){X(i,E,"Invalid Sec-WebSocket-Accept header");return}let at=g.headers["sec-websocket-protocol"],Ut;if(at!==void 0?p.size?p.has(at)||(Ut="Server sent an invalid subprotocol"):Ut="Server sent a subprotocol but none was requested":p.size&&(Ut="Server sent no subprotocol"),Ut){X(i,E,Ut);return}at&&(i._protocol=at);let Hr=g.headers["sec-websocket-extensions"];if(Hr!==void 0){if(!u){X(i,E,"Server sent a Sec-WebSocket-Extensions header but no extension was requested");return}let Si;try{Si=Ad(Hr)}catch{X(i,E,"Invalid Sec-WebSocket-Extensions header");return}let Vr=Object.keys(Si);if(Vr.length!==1||Vr[0]!==Re.extensionName){X(i,E,"Server indicated an extension that was not requested");return}try{u.accept(Si[Re.extensionName])}catch{X(i,E,"Invalid Sec-WebSocket-Extensions header");return}i._extensions[Re.extensionName]=u}i.setSocket(E,Me,{allowSynchronousEvents:r.allowSynchronousEvents,generateMask:r.generateMask,maxPayload:r.maxPayload,skipUTF8Validation:r.skipUTF8Validation})}),r.finishRequest?r.finishRequest(f,i):f.end()}function Ks(i,e){i._readyState=I.CLOSING,i._errorEmitted=!0,i.emit("error",e),i.emitClose()}function Nd(i){return i.path=i.socketPath,sa.connect(i)}function Rd(i){return i.path=void 0,!i.servername&&i.servername!==""&&(i.servername=sa.isIP(i.host)?"":i.host),xd.connect(i)}function X(i,e,t){i._readyState=I.CLOSING;let s=new Error(t);Error.captureStackTrace(s,X),e.setHeader?(e[ra]=!0,e.abort(),e.socket&&!e.socket.destroyed&&e.socket.destroy(),process.nextTick(Ks,i,s)):(e.destroy(s),e.once("error",i.emit.bind(i,"error")),e.once("close",i.emitClose.bind(i)))}function Nr(i,e,t){if(e){let s=Pd(e)?e.size:Ld(e).length;i._socket?i._sender._bufferedBytes+=s:i._bufferedAmount+=s}if(t){let s=new Error(`WebSocket is not open: readyState ${i.readyState} (${ke[i.readyState]})`);process.nextTick(t,s)}}function Fd(i,e){let t=this[H];t._closeFrameReceived=!0,t._closeMessage=e,t._closeCode=i,t._socket[H]!==void 0&&(t._socket.removeListener("data",Zs),process.nextTick(oa,t._socket),i===1005?t.close():t.close(i,e))}function $d(){let i=this[H];i.isPaused||i._socket.resume()}function Hd(i){let e=this[H];e._socket[H]!==void 0&&(e._socket.removeListener("data",Zs),process.nextTick(oa,e._socket),e.close(i[Td])),e._errorEmitted||(e._errorEmitted=!0,e.emit("error",i))}function ta(){this[H].emitClose()}function Vd(i,e){this[H].emit("message",i,e)}function Wd(i){let e=this[H];e._autoPong&&e.pong(i,!this._isServer,ia),e.emit("ping",i)}function jd(i){this[H].emit("pong",i)}function oa(i){i.resume()}function zd(i){let e=this[H];e.readyState!==I.CLOSED&&(e.readyState===I.OPEN&&(e._readyState=I.CLOSING,aa(e)),this._socket.end(),e._errorEmitted||(e._errorEmitted=!0,e.emit("error",i)))}function aa(i){i._closeTimer=setTimeout(i._socket.destroy.bind(i._socket),i._closeTimeout)}function ca(){let i=this[H];if(this.removeListener("close",ca),this.removeListener("data",Zs),this.removeListener("end",la),i._readyState=I.CLOSING,!this._readableState.endEmitted&&!i._closeFrameReceived&&!i._receiver._writableState.errorEmitted&&this._readableState.length!==0){let e=this.read(this._readableState.length);i._receiver.write(e)}i._receiver.end(),this[H]=void 0,clearTimeout(i._closeTimer),i._receiver._writableState.finished||i._receiver._writableState.errorEmitted?i.emitClose():(i._receiver.on("error",ta),i._receiver.on("finish",ta))}function Zs(i){this[H]._receiver.write(i)||this.pause()}function la(){let i=this[H];i._readyState=I.CLOSING,i._receiver.end(),this.end()}function da(){let i=this[H];this.removeListener("error",da),this.on("error",ia),i&&(i._readyState=I.CLOSING,this.destroy())}});var ga=Y((ep,fa)=>{"use strict";var Qh=Qs(),{Duplex:qd}=require("stream");function pa(i){i.emit("close")}function Gd(){!this.destroyed&&this._writableState.finished&&this.destroy()}function ua(i){this.removeListener("error",ua),this.destroy(),this.listenerCount("error")===0&&this.emit("error",i)}function Yd(i,e){let t=!0,s=new qd({...e,autoDestroy:!1,emitClose:!1,objectMode:!1,writableObjectMode:!1});return i.on("message",function(n,o){let a=!o&&s._readableState.objectMode?n.toString():n;s.push(a)||i.pause()}),i.once("error",function(n){s.destroyed||(t=!1,s.destroy(n))}),i.once("close",function(){s.destroyed||s.push(null)}),s._destroy=function(r,n){if(i.readyState===i.CLOSED){n(r),process.nextTick(pa,s);return}let o=!1;i.once("error",function(c){o=!0,n(c)}),i.once("close",function(){o||n(r),process.nextTick(pa,s)}),t&&i.terminate()},s._final=function(r){if(i.readyState===i.CONNECTING){i.once("open",function(){s._final(r)});return}i._socket!==null&&(i._socket._writableState.finished?(r(),s._readableState.endEmitted&&s.destroy()):(i._socket.once("finish",function(){r()}),i.close()))},s._read=function(){i.isPaused&&i.resume()},s._write=function(r,n,o){if(i.readyState===i.CONNECTING){i.once("open",function(){s._write(r,n,o)});return}i.send(r,o)},s.on("end",Gd),s.on("error",ua),s}fa.exports=Yd});var va=Y((tp,ma)=>{"use strict";var{tokenChars:Jd}=Pt();function Xd(i){let e=new Set,t=-1,s=-1,r=0;for(r;r<i.length;r++){let o=i.charCodeAt(r);if(s===-1&&Jd[o]===1)t===-1&&(t=r);else if(r!==0&&(o===32||o===9))s===-1&&t!==-1&&(s=r);else if(o===44){if(t===-1)throw new SyntaxError(`Unexpected character at index ${r}`);s===-1&&(s=r);let a=i.slice(t,s);if(e.has(a))throw new SyntaxError(`The "${a}" subprotocol is duplicated`);e.add(a),t=s=-1}else throw new SyntaxError(`Unexpected character at index ${r}`)}if(t===-1||s!==-1)throw new SyntaxError("Unexpected end of input");let n=i.slice(t,r);if(e.has(n))throw new SyntaxError(`The "${n}" subprotocol is duplicated`);return e.add(n),e}ma.exports={parse:Xd}});var Ca=Y((ip,ka)=>{"use strict";var Kd=require("events"),ei=require("http"),{Duplex:sp}=require("stream"),{createHash:Zd}=require("crypto"),wa=Br(),rt=is(),Qd=va(),eh=Qs(),{CLOSE_TIMEOUT:th,GUID:sh,kWebSocket:ih}=be(),rh=/^[+/0-9A-Za-z]{22}==$/,ya=0,ba=1,Sa=2,Rr=class extends Kd{constructor(e,t){if(super(),e={allowSynchronousEvents:!0,autoPong:!0,maxPayload:100*1024*1024,skipUTF8Validation:!1,perMessageDeflate:!1,handleProtocols:null,clientTracking:!0,closeTimeout:th,verifyClient:null,noServer:!1,backlog:null,server:null,host:null,path:null,port:null,WebSocket:eh,...e},e.port==null&&!e.server&&!e.noServer||e.port!=null&&(e.server||e.noServer)||e.server&&e.noServer)throw new TypeError('One and only one of the "port", "server", or "noServer" options must be specified');if(e.port!=null?(this._server=ei.createServer((s,r)=>{let n=ei.STATUS_CODES[426];r.writeHead(426,{"Content-Length":n.length,"Content-Type":"text/plain"}),r.end(n)}),this._server.listen(e.port,e.host,e.backlog,t)):e.server&&(this._server=e.server),this._server){let s=this.emit.bind(this,"connection");this._removeListeners=nh(this._server,{listening:this.emit.bind(this,"listening"),error:this.emit.bind(this,"error"),upgrade:(r,n,o)=>{this.handleUpgrade(r,n,o,s)}})}e.perMessageDeflate===!0&&(e.perMessageDeflate={}),e.clientTracking&&(this.clients=new Set,this._shouldEmitClose=!1),this.options=e,this._state=ya}address(){if(this.options.noServer)throw new Error('The server is operating in "noServer" mode');return this._server?this._server.address():null}close(e){if(this._state===Sa){e&&this.once("close",()=>{e(new Error("The server is not running"))}),process.nextTick(as,this);return}if(e&&this.once("close",e),this._state!==ba)if(this._state=ba,this.options.noServer||this.options.server)this._server&&(this._removeListeners(),this._removeListeners=this._server=null),this.clients?this.clients.size?this._shouldEmitClose=!0:process.nextTick(as,this):process.nextTick(as,this);else{let t=this._server;this._removeListeners(),this._removeListeners=this._server=null,t.close(()=>{as(this)})}}shouldHandle(e){if(this.options.path){let t=e.url.indexOf("?");if((t!==-1?e.url.slice(0,t):e.url)!==this.options.path)return!1}return!0}handleUpgrade(e,t,s,r){t.on("error",xa);let n=e.headers["sec-websocket-key"],o=e.headers.upgrade,a=+e.headers["sec-websocket-version"];if(e.method!=="GET"){nt(this,e,t,405,"Invalid HTTP method");return}if(o===void 0||o.toLowerCase()!=="websocket"){nt(this,e,t,400,"Invalid Upgrade header");return}if(n===void 0||!rh.test(n)){nt(this,e,t,400,"Missing or invalid Sec-WebSocket-Key header");return}if(a!==13&&a!==8){nt(this,e,t,400,"Missing or invalid Sec-WebSocket-Version header",{"Sec-WebSocket-Version":"13, 8"});return}if(!this.shouldHandle(e)){cs(t,400);return}let c=e.headers["sec-websocket-protocol"],l=new Set;if(c!==void 0)try{l=Qd.parse(c)}catch{nt(this,e,t,400,"Invalid Sec-WebSocket-Protocol header");return}let d=e.headers["sec-websocket-extensions"],h={};if(this.options.perMessageDeflate&&d!==void 0){let p=new rt(this.options.perMessageDeflate,!0,this.options.maxPayload);try{let u=wa.parse(d);u[rt.extensionName]&&(p.accept(u[rt.extensionName]),h[rt.extensionName]=p)}catch{nt(this,e,t,400,"Invalid or unacceptable Sec-WebSocket-Extensions header");return}}if(this.options.verifyClient){let p={origin:e.headers[`${a===8?"sec-websocket-origin":"origin"}`],secure:!!(e.socket.authorized||e.socket.encrypted),req:e};if(this.options.verifyClient.length===2){this.options.verifyClient(p,(u,f,g,E)=>{if(!u)return cs(t,f||401,g,E);this.completeUpgrade(h,n,l,e,t,s,r)});return}if(!this.options.verifyClient(p))return cs(t,401)}this.completeUpgrade(h,n,l,e,t,s,r)}completeUpgrade(e,t,s,r,n,o,a){if(!n.readable||!n.writable)return n.destroy();if(n[ih])throw new Error("server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration");if(this._state>ya)return cs(n,503);let l=["HTTP/1.1 101 Switching Protocols","Upgrade: websocket","Connection: Upgrade",`Sec-WebSocket-Accept: ${Zd("sha1").update(t+sh).digest("base64")}`],d=new this.options.WebSocket(null,void 0,this.options);if(s.size){let h=this.options.handleProtocols?this.options.handleProtocols(s,r):s.values().next().value;h&&(l.push(`Sec-WebSocket-Protocol: ${h}`),d._protocol=h)}if(e[rt.extensionName]){let h=e[rt.extensionName].params,p=wa.format({[rt.extensionName]:[h]});l.push(`Sec-WebSocket-Extensions: ${p}`),d._extensions=e}this.emit("headers",l,r),n.write(l.concat(`\r
`).join(`\r
`)),n.removeListener("error",xa),d.setSocket(n,o,{allowSynchronousEvents:this.options.allowSynchronousEvents,maxPayload:this.options.maxPayload,skipUTF8Validation:this.options.skipUTF8Validation}),this.clients&&(this.clients.add(d),d.on("close",()=>{this.clients.delete(d),this._shouldEmitClose&&!this.clients.size&&process.nextTick(as,this)})),a(d,r)}};ka.exports=Rr;function nh(i,e){for(let t of Object.keys(e))i.on(t,e[t]);return function(){for(let s of Object.keys(e))i.removeListener(s,e[s])}}function as(i){i._state=Sa,i.emit("close")}function xa(){this.destroy()}function cs(i,e,t,s){t=t||ei.STATUS_CODES[e],s={Connection:"close","Content-Type":"text/html","Content-Length":Buffer.byteLength(t),...s},i.once("finish",i.destroy),i.end(`HTTP/1.1 ${e} ${ei.STATUS_CODES[e]}\r
`+Object.keys(s).map(r=>`${r}: ${s[r]}`).join(`\r
`)+`\r
\r
`+t)}function nt(i,e,t,s,r,n){if(i.listenerCount("wsClientError")){let o=new Error(r);Error.captureStackTrace(o,nt),i.emit("wsClientError",o,t,e)}else cs(t,s,r,n)}});var fh={};La(fh,{activate:()=>dh,deactivate:()=>uh});module.exports=Oa(fh);var m=y(require("vscode"));var K=y(require("vscode"));var J=()=>new Map,ps=i=>{let e=J();return i.forEach((t,s)=>{e.set(s,t)}),e},ce=(i,e,t)=>{let s=i.get(e);return s===void 0&&i.set(e,s=t()),s};var jr=(i,e)=>{for(let[t,s]of i)if(e(s,t))return!0;return!1};var We=()=>new Set;var us=i=>i[i.length-1];var qr=(i,e)=>{for(let t=0;t<e.length;t++)i.push(e[t])},ge=Array.from;var _i=Array.isArray;var fs=class{constructor(){this._observers=J()}on(e,t){return ce(this._observers,e,We).add(t),t}once(e,t){let s=(...r)=>{this.off(e,s),t(...r)};this.on(e,s)}off(e,t){let s=this._observers.get(e);s!==void 0&&(s.delete(t),s.size===0&&this._observers.delete(e))}emit(e,t){return ge((this._observers.get(e)||J()).values()).forEach(s=>s(...t))}destroy(){this._observers=J()}};var Z=Math.floor;var ct=Math.abs;var gs=(i,e)=>i<e?i:e,me=(i,e)=>i>e?i:e,vh=Number.isNaN;var ms=i=>i!==0?i<0:1/i<0;var Ei=Number.MAX_SAFE_INTEGER,wh=Number.MIN_SAFE_INTEGER,yh=1<<31;var Gr=Number.isInteger||(i=>typeof i=="number"&&isFinite(i)&&Z(i)===i),bh=Number.isNaN,xh=Number.parseInt;var Na=String.fromCharCode,Sh=String.fromCodePoint,kh=Na(65535),Ra=i=>i.toLowerCase(),Fa=/^\s*/g,$a=i=>i.replace(Fa,""),Ha=/([A-Z])/g,Ii=(i,e)=>$a(i.replace(Ha,t=>`${e}${Ra(t)}`));var Va=i=>{let e=unescape(encodeURIComponent(i)),t=e.length,s=new Uint8Array(t);for(let r=0;r<t;r++)s[r]=e.codePointAt(r);return s},dt=typeof TextEncoder<"u"?new TextEncoder:null,Wa=i=>dt.encode(i),Jr=dt?Wa:Va;var lt=typeof TextDecoder>"u"?null:new TextDecoder("utf-8",{fatal:!0,ignoreBOM:!0});lt&&lt.decode(new Uint8Array).length===1&&(lt=null);var je=class{constructor(){this.cpos=0,this.cbuf=new Uint8Array(100),this.bufs=[]}},At=()=>new je;var ja=i=>{let e=i.cpos;for(let t=0;t<i.bufs.length;t++)e+=i.bufs[t].length;return e};var ie=i=>{let e=new Uint8Array(ja(i)),t=0;for(let s=0;s<i.bufs.length;s++){let r=i.bufs[s];e.set(r,t),t+=r.length}return e.set(new Uint8Array(i.cbuf.buffer,0,i.cpos),t),e},za=(i,e)=>{let t=i.cbuf.length;t-i.cpos<e&&(i.bufs.push(new Uint8Array(i.cbuf.buffer,0,i.cpos)),i.cbuf=new Uint8Array(me(t,e)*2),i.cpos=0)},R=(i,e)=>{let t=i.cbuf.length;i.cpos===t&&(i.bufs.push(i.cbuf),i.cbuf=new Uint8Array(t*2),i.cpos=0),i.cbuf[i.cpos++]=e};var ys=R;var x=(i,e)=>{for(;e>127;)R(i,128|127&e),e=Z(e/128);R(i,127&e)},bs=(i,e)=>{let t=ms(e);for(t&&(e=-e),R(i,(e>63?128:0)|(t?64:0)|63&e),e=Z(e/64);e>0;)R(i,(e>127?128:0)|127&e),e=Z(e/128)},Ti=new Uint8Array(3e4),qa=Ti.length/3,Ga=(i,e)=>{if(e.length<qa){let t=dt.encodeInto(e,Ti).written||0;x(i,t);for(let s=0;s<t;s++)R(i,Ti[s])}else W(i,Jr(e))},Ya=(i,e)=>{let t=unescape(encodeURIComponent(e)),s=t.length;x(i,s);for(let r=0;r<s;r++)R(i,t.codePointAt(r))},ze=dt&&dt.encodeInto?Ga:Ya;var Lt=(i,e)=>{let t=i.cbuf.length,s=i.cpos,r=gs(t-s,e.length),n=e.length-r;i.cbuf.set(e.subarray(0,r),s),i.cpos+=r,n>0&&(i.bufs.push(i.cbuf),i.cbuf=new Uint8Array(me(t*2,n)),i.cbuf.set(e.subarray(r)),i.cpos=n)},W=(i,e)=>{x(i,e.byteLength),Lt(i,e)},Di=(i,e)=>{za(i,e);let t=new DataView(i.cbuf.buffer,i.cpos,e);return i.cpos+=e,t},Ja=(i,e)=>Di(i,4).setFloat32(0,e,!1),Xa=(i,e)=>Di(i,8).setFloat64(0,e,!1),Ka=(i,e)=>Di(i,8).setBigInt64(0,e,!1);var Kr=new DataView(new ArrayBuffer(4)),Za=i=>(Kr.setFloat32(0,i),Kr.getFloat32(0)===i),pt=(i,e)=>{switch(typeof e){case"string":R(i,119),ze(i,e);break;case"number":Gr(e)&&ct(e)<=2147483647?(R(i,125),bs(i,e)):Za(e)?(R(i,124),Ja(i,e)):(R(i,123),Xa(i,e));break;case"bigint":R(i,122),Ka(i,e);break;case"object":if(e===null)R(i,126);else if(_i(e)){R(i,117),x(i,e.length);for(let t=0;t<e.length;t++)pt(i,e[t])}else if(e instanceof Uint8Array)R(i,116),W(i,e);else{R(i,118);let t=Object.keys(e);x(i,t.length);for(let s=0;s<t.length;s++){let r=t[s];ze(i,r),pt(i,e[r])}}break;case"boolean":R(i,e?120:121);break;default:R(i,127)}},Bt=class extends je{constructor(e){super(),this.w=e,this.s=null,this.count=0}write(e){this.s===e?this.count++:(this.count>0&&x(this,this.count-1),this.count=1,this.w(this,e),this.s=e)}};var Zr=i=>{i.count>0&&(bs(i.encoder,i.count===1?i.s:-i.s),i.count>1&&x(i.encoder,i.count-2))},qe=class{constructor(){this.encoder=new je,this.s=0,this.count=0}write(e){this.s===e?this.count++:(Zr(this),this.count=1,this.s=e)}toUint8Array(){return Zr(this),ie(this.encoder)}};var Qr=i=>{if(i.count>0){let e=i.diff*2+(i.count===1?0:1);bs(i.encoder,e),i.count>1&&x(i.encoder,i.count-2)}},ut=class{constructor(){this.encoder=new je,this.s=0,this.count=0,this.diff=0}write(e){this.diff===e-this.s?(this.s=e,this.count++):(Qr(this),this.count=1,this.diff=e-this.s,this.s=e)}toUint8Array(){return Qr(this),ie(this.encoder)}},ws=class{constructor(){this.sarr=[],this.s="",this.lensE=new qe}write(e){this.s+=e,this.s.length>19&&(this.sarr.push(this.s),this.s=""),this.lensE.write(e.length)}toUint8Array(){let e=new je;return this.sarr.push(this.s),this.s="",ze(e,this.sarr.join("")),Lt(e,this.lensE.toUint8Array()),ie(e)}};var le=i=>new Error(i),re=()=>{throw le("Method unimplemented")},ne=()=>{throw le("Unexpected case")};var tn=le("Unexpected end of array"),sn=le("Integer out of Range"),ft=class{constructor(e){this.arr=e,this.pos=0}},Xe=i=>new ft(i),rn=i=>i.pos!==i.arr.length;var ec=(i,e)=>{let t=new Uint8Array(i.arr.buffer,i.pos+i.arr.byteOffset,e);return i.pos+=e,t},j=i=>ec(i,v(i));var Ge=i=>i.arr[i.pos++];var v=i=>{let e=0,t=1,s=i.arr.length;for(;i.pos<s;){let r=i.arr[i.pos++];if(e=e+(r&127)*t,t*=128,r<128)return e;if(e>Ei)throw sn}throw tn},Ss=i=>{let e=i.arr[i.pos++],t=e&63,s=64,r=(e&64)>0?-1:1;if(!(e&128))return r*t;let n=i.arr.length;for(;i.pos<n;){if(e=i.arr[i.pos++],t=t+(e&127)*s,s*=128,e<128)return r*t;if(t>Ei)throw sn}throw tn};var tc=i=>{let e=v(i);if(e===0)return"";{let t=String.fromCodePoint(Ge(i));if(--e<100)for(;e--;)t+=String.fromCodePoint(Ge(i));else for(;e>0;){let s=e<1e4?e:1e4,r=i.arr.subarray(i.pos,i.pos+s);i.pos+=s,t+=String.fromCodePoint.apply(null,r),e-=s}return decodeURIComponent(escape(t))}},sc=i=>lt.decode(j(i)),Ye=lt?sc:tc;var Ui=(i,e)=>{let t=new DataView(i.arr.buffer,i.arr.byteOffset+i.pos,e);return i.pos+=e,t},ic=i=>Ui(i,4).getFloat32(0,!1),rc=i=>Ui(i,8).getFloat64(0,!1),nc=i=>Ui(i,8).getBigInt64(0,!1);var oc=[i=>{},i=>null,Ss,ic,rc,nc,i=>!1,i=>!0,Ye,i=>{let e=v(i),t={};for(let s=0;s<e;s++){let r=Ye(i);t[r]=gt(i)}return t},i=>{let e=v(i),t=[];for(let s=0;s<e;s++)t.push(gt(i));return t},j],gt=i=>oc[127-Ge(i)](i),Ot=class extends ft{constructor(e,t){super(e),this.reader=t,this.s=null,this.count=0}read(){return this.count===0&&(this.s=this.reader(this),rn(this)?this.count=v(this)+1:this.count=-1),this.count--,this.s}};var Je=class extends ft{constructor(e){super(e),this.s=0,this.count=0}read(){if(this.count===0){this.s=Ss(this);let e=ms(this.s);this.count=1,e&&(this.s=-this.s,this.count=v(this)+2)}return this.count--,this.s}};var mt=class extends ft{constructor(e){super(e),this.s=0,this.count=0,this.diff=0}read(){if(this.count===0){let e=Ss(this),t=e&1;this.diff=Z(e/2),this.count=1,t&&(this.count=v(this)+2)}return this.s+=this.diff,this.count--,this.s}},xs=class{constructor(e){this.decoder=new Je(e),this.str=Ye(this.decoder),this.spos=0}read(){let e=this.spos+this.decoder.read(),t=this.str.slice(this.spos,e);return this.spos=e,t}};var ks=require("node:crypto"),Ph=ks.webcrypto.subtle,nn=ks.webcrypto.getRandomValues.bind(ks.webcrypto);var Bi=()=>nn(new Uint32Array(1))[0];var cc="10000000-1000-4000-8000"+-1e11,on=()=>cc.replace(/[018]/g,i=>(i^Bi()&15>>i/4).toString(16));var an=Date.now;var Ai=i=>new Promise(i);var Mh=Promise.all.bind(Promise);var Li=i=>i===void 0?null:i;var Oi=class{constructor(){this.map=new Map}setItem(e,t){this.map.set(e,t)}getItem(e){return this.map.get(e)}},cn=new Oi,uc=!0;try{typeof localStorage<"u"&&localStorage&&(cn=localStorage,uc=!1)}catch{}var ln=cn;var gc=Symbol("Equality"),dn=(i,e)=>i===e||!!i?.[gc]?.(e)||!1;var pn=Object.assign,vc=Object.keys;var un=(i,e)=>{for(let t in i)e(i[t],t)};var hn=i=>vc(i).length;var fn=i=>{for(let e in i)return!1;return!0},wc=(i,e)=>{for(let t in i)if(!e(i[t],t))return!1;return!0},yc=(i,e)=>Object.prototype.hasOwnProperty.call(i,e),gn=(i,e)=>i===e||hn(i)===hn(e)&&wc(i,(t,s)=>(t!==void 0||yc(e,s))&&dn(e[s],t)),bc=Object.freeze,Ni=i=>{for(let e in i){let t=i[e];(typeof t=="object"||typeof t=="function")&&Ni(i[e])}return bc(i)};var Nt=(i,e,t=0)=>{try{for(;t<i.length;t++)i[t](...e)}finally{t<i.length&&Nt(i,e,t+1)}};var mn=i=>i;var vn=(i,e)=>e.includes(i);var Rt=typeof process<"u"&&process.release&&/node|io\.js/.test(process.release.name)&&Object.prototype.toString.call(typeof process<"u"?process:0)==="[object process]";var Th=typeof navigator<"u"?/Mac/.test(navigator.platform):!1,de,Sc=[],kc=()=>{if(de===void 0)if(Rt){de=J();let i=process.argv,e=null;for(let t=0;t<i.length;t++){let s=i[t];s[0]==="-"?(e!==null&&de.set(e,""),e=s):e!==null?(de.set(e,s),e=null):Sc.push(s)}e!==null&&de.set(e,"")}else typeof location=="object"?(de=J(),(location.search||"?").slice(1).split("&").forEach(i=>{if(i.length!==0){let[e,t]=i.split("=");de.set(`--${Ii(e,"-")}`,t),de.set(`-${Ii(e,"-")}`,t)}})):de=J();return de},Ri=i=>kc().has(i);var Ft=i=>Rt?Li(process.env[i.toUpperCase().replaceAll("-","_")]):Li(ln.getItem(i));var yn=i=>Ri("--"+i)||Ft(i)!==null,Dh=yn("production"),Cc=Rt&&vn(process.env.FORCE_COLOR,["true","1","2"]),bn=Cc||!Ri("--no-colors")&&!yn("no-color")&&(!Rt||process.stdout.isTTY)&&(!Rt||Ri("--color")||Ft("COLORTERM")!==null||(Ft("TERM")||"").includes("color"));var _c=i=>new Uint8Array(i);var Sn=i=>{let e=_c(i.byteLength);return e.set(i),e};var he=Symbol;var $t=he(),Ht=he(),Fi=he(),$i=he(),Hi=he(),Vt=he(),Vi=he(),Wt=he(),Wi=he(),kn=i=>{i.length===1&&i[0]?.constructor===Function&&(i=i[0]());let e=[],t=[],s=0;for(;s<i.length;s++){let r=i[s];if(r===void 0)break;if(r.constructor===String||r.constructor===Number)e.push(r);else if(r.constructor===Object)break}for(s>0&&t.push(e.join(""));s<i.length;s++){let r=i[s];r instanceof Symbol||t.push(r)}return t};var Uh=an();var Mc={[$t]:"\x1B[1m",[Ht]:"\x1B[2m",[Fi]:"\x1B[34m",[Hi]:"\x1B[32m",[$i]:"\x1B[37m",[Vt]:"\x1B[31m",[Vi]:"\x1B[35m",[Wt]:"\x1B[38;5;208m",[Wi]:"\x1B[0m"},Tc=i=>{i.length===1&&i[0]?.constructor===Function&&(i=i[0]());let e=[],t=[],s=0;for(;s<i.length;s++){let r=i[s],n=Mc[r];if(n!==void 0)e.push(n);else{if(r===void 0)break;if(r.constructor===String||r.constructor===Number)e.push(r);else break}}for(s>0&&(e.push("\x1B[0m"),t.push(e.join("")));s<i.length;s++){let r=i[s];r instanceof Symbol||t.push(r)}return t},Cn=bn?Tc:kn,_n=(...i)=>{console.log(...Cn(i))},Pn=(...i)=>{console.warn(...Cn(i))};var En=i=>({[Symbol.iterator](){return this},next:i}),In=(i,e)=>En(()=>{let t;do t=i.next();while(!t.done&&!e(t.value));return t}),Cs=(i,e)=>En(()=>{let{done:t,value:s}=i.next();return{done:t,value:t?void 0:e(s)}});var wt=class{constructor(e,t){this.clock=e,this.len=t}},Ke=class{constructor(){this.clients=new Map}},Vn=(i,e,t)=>e.clients.forEach((s,r)=>{let n=i.doc.store.clients.get(r);if(n!=null){let o=n[n.length-1],a=o.id.clock+o.length;for(let c=0,l=s[c];c<s.length&&l.clock<a;l=s[++c])Kn(i,n,l.clock,l.len,t)}}),Lc=(i,e)=>{let t=0,s=i.length-1;for(;t<=s;){let r=Z((t+s)/2),n=i[r],o=n.clock;if(o<=e){if(e<o+n.len)return r;t=r+1}else s=r-1}return null},Wn=(i,e)=>{let t=i.clients.get(e.client);return t!==void 0&&Lc(t,e.clock)!==null},lr=i=>{i.clients.forEach(e=>{e.sort((r,n)=>r.clock-n.clock);let t,s;for(t=1,s=1;t<e.length;t++){let r=e[s-1],n=e[t];r.clock+r.len>=n.clock?e[s-1]=new wt(r.clock,me(r.len,n.clock+n.len-r.clock)):(s<t&&(e[s]=n),s++)}e.length=s})},Oc=i=>{let e=new Ke;for(let t=0;t<i.length;t++)i[t].clients.forEach((s,r)=>{if(!e.clients.has(r)){let n=s.slice();for(let o=t+1;o<i.length;o++)qr(n,i[o].clients.get(r)||[]);e.clients.set(r,n)}});return lr(e),e},Ts=(i,e,t,s)=>{ce(i.clients,e,()=>[]).push(new wt(t,s))},jn=()=>new Ke,Nc=i=>{let e=jn();return i.clients.forEach((t,s)=>{let r=[];for(let n=0;n<t.length;n++){let o=t[n];if(o.deleted){let a=o.id.clock,c=o.length;if(n+1<t.length)for(let l=t[n+1];n+1<t.length&&l.deleted;l=t[++n+1])c+=l.length;r.push(new wt(a,c))}}r.length>0&&e.clients.set(s,r)}),e},St=(i,e)=>{x(i.restEncoder,e.clients.size),ge(e.clients.entries()).sort((t,s)=>s[0]-t[0]).forEach(([t,s])=>{i.resetDsCurVal(),x(i.restEncoder,t);let r=s.length;x(i.restEncoder,r);for(let n=0;n<r;n++){let o=s[n];i.writeDsClock(o.clock),i.writeDsLen(o.len)}})},dr=i=>{let e=new Ke,t=v(i.restDecoder);for(let s=0;s<t;s++){i.resetDsCurVal();let r=v(i.restDecoder),n=v(i.restDecoder);if(n>0){let o=ce(e.clients,r,()=>[]);for(let a=0;a<n;a++)o.push(new wt(i.readDsClock(),i.readDsLen()))}}return e},Dn=(i,e,t)=>{let s=new Ke,r=v(i.restDecoder);for(let n=0;n<r;n++){i.resetDsCurVal();let o=v(i.restDecoder),a=v(i.restDecoder),c=t.clients.get(o)||[],l=F(t,o);for(let d=0;d<a;d++){let h=i.readDsClock(),p=h+i.readDsLen();if(h<l){l<p&&Ts(s,o,l,p-l);let u=pe(c,h),f=c[u];for(!f.deleted&&f.id.clock<h&&(c.splice(u+1,0,Fs(e,f,h-f.id.clock)),u++);u<c.length&&(f=c[u++],f.id.clock<p);)f.deleted||(p<f.id.clock+f.length&&c.splice(u,0,Fs(e,f,p-f.id.clock)),f.delete(e))}else Ts(s,o,h,p-h)}}if(s.clients.size>0){let n=new ve;return x(n.restEncoder,0),St(n,s),n.toUint8Array()}return null};var zn=Bi,Ae=class i extends fs{constructor({guid:e=on(),collectionid:t=null,gc:s=!0,gcFilter:r=()=>!0,meta:n=null,autoLoad:o=!1,shouldLoad:a=!0}={}){super(),this.gc=s,this.gcFilter=r,this.clientID=zn(),this.guid=e,this.collectionid=t,this.share=new Map,this.store=new Bs,this._transaction=null,this._transactionCleanups=[],this.subdocs=new Set,this._item=null,this.shouldLoad=a,this.autoLoad=o,this.meta=n,this.isLoaded=!1,this.isSynced=!1,this.isDestroyed=!1,this.whenLoaded=Ai(l=>{this.on("load",()=>{this.isLoaded=!0,l(this)})});let c=()=>Ai(l=>{let d=h=>{(h===void 0||h===!0)&&(this.off("sync",d),l())};this.on("sync",d)});this.on("sync",l=>{l===!1&&this.isSynced&&(this.whenSynced=c()),this.isSynced=l===void 0||l===!0,this.isSynced&&!this.isLoaded&&this.emit("load",[this])}),this.whenSynced=c()}load(){let e=this._item;e!==null&&!this.shouldLoad&&P(e.parent.doc,t=>{t.subdocsLoaded.add(this)},null,!0),this.shouldLoad=!0}getSubdocs(){return this.subdocs}getSubdocGuids(){return new Set(ge(this.subdocs).map(e=>e.guid))}transact(e,t=null){return P(this,e,t)}get(e,t=L){let s=ce(this.share,e,()=>{let n=new t;return n._integrate(this,null),n}),r=s.constructor;if(t!==L&&r!==t)if(r===L){let n=new t;n._map=s._map,s._map.forEach(o=>{for(;o!==null;o=o.left)o.parent=n}),n._start=s._start;for(let o=n._start;o!==null;o=o.right)o.parent=n;return n._length=s._length,this.share.set(e,n),n._integrate(this,null),n}else throw new Error(`Type with the name ${e} has already been defined with a different constructor`);return s}getArray(e=""){return this.get(e,Ns)}getText(e=""){return this.get(e,Qe)}getMap(e=""){return this.get(e,Jt)}getXmlElement(e=""){return this.get(e,Kt)}getXmlFragment(e=""){return this.get(e,bt)}toJSON(){let e={};return this.share.forEach((t,s)=>{e[s]=t.toJSON()}),e}destroy(){this.isDestroyed=!0,ge(this.subdocs).forEach(t=>t.destroy());let e=this._item;if(e!==null){this._item=null;let t=e.content;t.doc=new i({guid:this.guid,...t.opts,shouldLoad:!1}),t.doc._item=e,P(e.parent.doc,s=>{let r=t.doc;e.deleted||s.subdocsAdded.add(r),s.subdocsRemoved.add(this)},null,!0)}this.emit("destroyed",[!0]),this.emit("destroy",[this]),super.destroy()}},Ds=class{constructor(e){this.restDecoder=e}resetDsCurVal(){}readDsClock(){return v(this.restDecoder)}readDsLen(){return v(this.restDecoder)}},Us=class extends Ds{readLeftID(){return b(v(this.restDecoder),v(this.restDecoder))}readRightID(){return b(v(this.restDecoder),v(this.restDecoder))}readClient(){return v(this.restDecoder)}readInfo(){return Ge(this.restDecoder)}readString(){return Ye(this.restDecoder)}readParentInfo(){return v(this.restDecoder)===1}readTypeRef(){return v(this.restDecoder)}readLen(){return v(this.restDecoder)}readAny(){return gt(this.restDecoder)}readBuf(){return Sn(j(this.restDecoder))}readJSON(){return JSON.parse(Ye(this.restDecoder))}readKey(){return Ye(this.restDecoder)}},qi=class{constructor(e){this.dsCurrVal=0,this.restDecoder=e}resetDsCurVal(){this.dsCurrVal=0}readDsClock(){return this.dsCurrVal+=v(this.restDecoder),this.dsCurrVal}readDsLen(){let e=v(this.restDecoder)+1;return this.dsCurrVal+=e,e}},Le=class extends qi{constructor(e){super(e),this.keys=[],v(e),this.keyClockDecoder=new mt(j(e)),this.clientDecoder=new Je(j(e)),this.leftClockDecoder=new mt(j(e)),this.rightClockDecoder=new mt(j(e)),this.infoDecoder=new Ot(j(e),Ge),this.stringDecoder=new xs(j(e)),this.parentInfoDecoder=new Ot(j(e),Ge),this.typeRefDecoder=new Je(j(e)),this.lenDecoder=new Je(j(e))}readLeftID(){return new Be(this.clientDecoder.read(),this.leftClockDecoder.read())}readRightID(){return new Be(this.clientDecoder.read(),this.rightClockDecoder.read())}readClient(){return this.clientDecoder.read()}readInfo(){return this.infoDecoder.read()}readString(){return this.stringDecoder.read()}readParentInfo(){return this.parentInfoDecoder.read()===1}readTypeRef(){return this.typeRefDecoder.read()}readLen(){return this.lenDecoder.read()}readAny(){return gt(this.restDecoder)}readBuf(){return j(this.restDecoder)}readJSON(){return gt(this.restDecoder)}readKey(){let e=this.keyClockDecoder.read();if(e<this.keys.length)return this.keys[e];{let t=this.stringDecoder.read();return this.keys.push(t),t}}},Gi=class{constructor(){this.restEncoder=At()}toUint8Array(){return ie(this.restEncoder)}resetDsCurVal(){}writeDsClock(e){x(this.restEncoder,e)}writeDsLen(e){x(this.restEncoder,e)}},Ze=class extends Gi{writeLeftID(e){x(this.restEncoder,e.client),x(this.restEncoder,e.clock)}writeRightID(e){x(this.restEncoder,e.client),x(this.restEncoder,e.clock)}writeClient(e){x(this.restEncoder,e)}writeInfo(e){ys(this.restEncoder,e)}writeString(e){ze(this.restEncoder,e)}writeParentInfo(e){x(this.restEncoder,e?1:0)}writeTypeRef(e){x(this.restEncoder,e)}writeLen(e){x(this.restEncoder,e)}writeAny(e){pt(this.restEncoder,e)}writeBuf(e){W(this.restEncoder,e)}writeJSON(e){ze(this.restEncoder,JSON.stringify(e))}writeKey(e){ze(this.restEncoder,e)}},Yi=class{constructor(){this.restEncoder=At(),this.dsCurrVal=0}toUint8Array(){return ie(this.restEncoder)}resetDsCurVal(){this.dsCurrVal=0}writeDsClock(e){let t=e-this.dsCurrVal;this.dsCurrVal=e,x(this.restEncoder,t)}writeDsLen(e){e===0&&ne(),x(this.restEncoder,e-1),this.dsCurrVal+=e}},ve=class extends Yi{constructor(){super(),this.keyMap=new Map,this.keyClock=0,this.keyClockEncoder=new ut,this.clientEncoder=new qe,this.leftClockEncoder=new ut,this.rightClockEncoder=new ut,this.infoEncoder=new Bt(ys),this.stringEncoder=new ws,this.parentInfoEncoder=new Bt(ys),this.typeRefEncoder=new qe,this.lenEncoder=new qe}toUint8Array(){let e=At();return x(e,0),W(e,this.keyClockEncoder.toUint8Array()),W(e,this.clientEncoder.toUint8Array()),W(e,this.leftClockEncoder.toUint8Array()),W(e,this.rightClockEncoder.toUint8Array()),W(e,ie(this.infoEncoder)),W(e,this.stringEncoder.toUint8Array()),W(e,ie(this.parentInfoEncoder)),W(e,this.typeRefEncoder.toUint8Array()),W(e,this.lenEncoder.toUint8Array()),Lt(e,ie(this.restEncoder)),ie(e)}writeLeftID(e){this.clientEncoder.write(e.client),this.leftClockEncoder.write(e.clock)}writeRightID(e){this.clientEncoder.write(e.client),this.rightClockEncoder.write(e.clock)}writeClient(e){this.clientEncoder.write(e)}writeInfo(e){this.infoEncoder.write(e)}writeString(e){this.stringEncoder.write(e)}writeParentInfo(e){this.parentInfoEncoder.write(e?1:0)}writeTypeRef(e){this.typeRefEncoder.write(e)}writeLen(e){this.lenEncoder.write(e)}writeAny(e){pt(this.restEncoder,e)}writeBuf(e){W(this.restEncoder,e)}writeJSON(e){pt(this.restEncoder,e)}writeKey(e){let t=this.keyMap.get(e);t===void 0?(this.keyClockEncoder.write(this.keyClock++),this.stringEncoder.write(e)):this.keyClockEncoder.write(t)}},Rc=(i,e,t,s)=>{s=me(s,e[0].id.clock);let r=pe(e,s);x(i.restEncoder,e.length-r),i.writeClient(t),x(i.restEncoder,s);let n=e[r];n.write(i,s-n.id.clock);for(let o=r+1;o<e.length;o++)e[o].write(i,0)},hr=(i,e,t)=>{let s=new Map;t.forEach((r,n)=>{F(e,n)>r&&s.set(n,r)}),ur(e).forEach((r,n)=>{t.has(n)||s.set(n,0)}),x(i.restEncoder,s.size),ge(s.entries()).sort((r,n)=>n[0]-r[0]).forEach(([r,n])=>{Rc(i,e.clients.get(r),r,n)})},Fc=(i,e)=>{let t=J(),s=v(i.restDecoder);for(let r=0;r<s;r++){let n=v(i.restDecoder),o=new Array(n),a=i.readClient(),c=v(i.restDecoder);t.set(a,{i:0,refs:o});for(let l=0;l<n;l++){let d=i.readInfo();switch(31&d){case 0:{let h=i.readLen();o[l]=new z(b(a,c),h),c+=h;break}case 10:{let h=v(i.restDecoder);o[l]=new q(b(a,c),h),c+=h;break}default:{let h=(d&192)===0,p=new $(b(a,c),null,(d&128)===128?i.readLeftID():null,null,(d&64)===64?i.readRightID():null,h?i.readParentInfo()?e.get(i.readString()):i.readLeftID():null,h&&(d&32)===32?i.readString():null,vo(i,d));o[l]=p,c+=p.length}}}}return t},$c=(i,e,t)=>{let s=[],r=ge(t.keys()).sort((u,f)=>u-f);if(r.length===0)return null;let n=()=>{if(r.length===0)return null;let u=t.get(r[r.length-1]);for(;u.refs.length===u.i;)if(r.pop(),r.length>0)u=t.get(r[r.length-1]);else return null;return u},o=n();if(o===null)return null;let a=new Bs,c=new Map,l=(u,f)=>{let g=c.get(u);(g==null||g>f)&&c.set(u,f)},d=o.refs[o.i++],h=new Map,p=()=>{for(let u of s){let f=u.id.client,g=t.get(f);g?(g.i--,a.clients.set(f,g.refs.slice(g.i)),t.delete(f),g.i=0,g.refs=[]):a.clients.set(f,[u]),r=r.filter(E=>E!==f)}s.length=0};for(;;){if(d.constructor!==q){let f=ce(h,d.id.client,()=>F(e,d.id.client))-d.id.clock;if(f<0)s.push(d),l(d.id.client,d.id.clock-1),p();else{let g=d.getMissing(i,e);if(g!==null){s.push(d);let E=t.get(g)||{refs:[],i:0};if(E.refs.length===E.i)l(g,F(e,g)),p();else{d=E.refs[E.i++];continue}}else(f===0||f<d.length)&&(d.integrate(i,f),h.set(d.id.client,d.id.clock+d.length))}}if(s.length>0)d=s.pop();else if(o!==null&&o.i<o.refs.length)d=o.refs[o.i++];else{if(o=n(),o===null)break;d=o.refs[o.i++]}}if(a.clients.size>0){let u=new ve;return hr(u,a,new Map),x(u.restEncoder,0),{missing:c,update:u.toUint8Array()}}return null},Hc=(i,e)=>hr(i,e.doc.store,e.beforeState),Vc=(i,e,t,s=new Le(i))=>P(e,r=>{r.local=!1;let n=!1,o=r.doc,a=o.store,c=Fc(s,o),l=$c(r,a,c),d=a.pendingStructs;if(d){for(let[p,u]of d.missing)if(u<F(a,p)){n=!0;break}if(l){for(let[p,u]of l.missing){let f=d.missing.get(p);(f==null||f>u)&&d.missing.set(p,u)}d.update=As([d.update,l.update])}}else a.pendingStructs=l;let h=Dn(s,r,a);if(a.pendingDs){let p=new Le(Xe(a.pendingDs));v(p.restDecoder);let u=Dn(p,r,a);h&&u?a.pendingDs=As([h,u]):a.pendingDs=h||u}else a.pendingDs=h;if(n){let p=a.pendingStructs.update;a.pendingStructs=null,qn(r.doc,p)}},t,!1);var qn=(i,e,t,s=Le)=>{let r=Xe(e);Vc(r,i,t,new s(r))},pr=(i,e,t)=>qn(i,e,t,Us),Wc=(i,e,t=new Map)=>{hr(i,e.store,t),St(i,Nc(e.store))},jc=(i,e=new Uint8Array([0]),t=new ve)=>{let s=Yn(e);Wc(t,i,s);let r=[t.toUint8Array()];if(i.store.pendingDs&&r.push(i.store.pendingDs),i.store.pendingStructs&&r.push(tl(i.store.pendingStructs.update,e)),r.length>1){if(t.constructor===Ze)return Qc(r.map((n,o)=>o===0?n:il(n)));if(t.constructor===ve)return As(r)}return r[0]},Gn=(i,e)=>jc(i,e,new Ze),zc=i=>{let e=new Map,t=v(i.restDecoder);for(let s=0;s<t;s++){let r=v(i.restDecoder),n=v(i.restDecoder);e.set(r,n)}return e},Yn=i=>zc(new Ds(Xe(i)));var Ji=class{constructor(){this.l=[]}},Un=()=>new Ji,Bn=(i,e)=>i.l.push(e),An=(i,e)=>{let t=i.l,s=t.length;i.l=t.filter(r=>e!==r),s===i.l.length&&console.error("[yjs] Tried to remove event handler that doesn't exist.")},Jn=(i,e,t)=>Nt(i.l,[e,t]),Be=class{constructor(e,t){this.client=e,this.clock=t}},_s=(i,e)=>i===e||i!==null&&e!==null&&i.client===e.client&&i.clock===e.clock,b=(i,e)=>new Be(i,e);var qc=i=>{for(let[e,t]of i.doc.share.entries())if(t===i)return e;throw ne()};var Xi=class{constructor(e,t){this.ds=e,this.sv=t}};var Gc=(i,e)=>new Xi(i,e),Fh=Gc(jn(),new Map);var vt=(i,e)=>e===void 0?!i.deleted:e.sv.has(i.id.client)&&(e.sv.get(i.id.client)||0)>i.id.clock&&!Wn(e.ds,i.id),Ki=(i,e)=>{let t=ce(i.meta,Ki,We),s=i.doc.store;t.has(e)||(e.sv.forEach((r,n)=>{r<F(s,n)&&Oe(i,b(n,r))}),Vn(i,e.ds,r=>{}),t.add(e))};var Bs=class{constructor(){this.clients=new Map,this.pendingStructs=null,this.pendingDs=null}},ur=i=>{let e=new Map;return i.clients.forEach((t,s)=>{let r=t[t.length-1];e.set(s,r.id.clock+r.length)}),e},F=(i,e)=>{let t=i.clients.get(e);if(t===void 0)return 0;let s=t[t.length-1];return s.id.clock+s.length},Xn=(i,e)=>{let t=i.clients.get(e.id.client);if(t===void 0)t=[],i.clients.set(e.id.client,t);else{let s=t[t.length-1];if(s.id.clock+s.length!==e.id.clock)throw ne()}t.push(e)},pe=(i,e)=>{let t=0,s=i.length-1,r=i[s],n=r.id.clock;if(n===e)return s;let o=Z(e/(n+r.length-1)*s);for(;t<=s;){if(r=i[o],n=r.id.clock,n<=e){if(e<n+r.length)return o;t=o+1}else s=o-1;o=Z((t+s)/2)}throw ne()},Yc=(i,e)=>{let t=i.clients.get(e.client);return t[pe(t,e.clock)]},ji=Yc,Zi=(i,e,t)=>{let s=pe(e,t),r=e[s];return r.id.clock<t&&r instanceof $?(e.splice(s+1,0,Fs(i,r,t-r.id.clock)),s+1):s},Oe=(i,e)=>{let t=i.doc.store.clients.get(e.client);return t[Zi(i,t,e.clock)]},Ln=(i,e,t)=>{let s=e.clients.get(t.client),r=pe(s,t.clock),n=s[r];return t.clock!==n.id.clock+n.length-1&&n.constructor!==z&&s.splice(r+1,0,Fs(i,n,t.clock-n.id.clock+1)),n},Jc=(i,e,t)=>{let s=i.clients.get(e.id.client);s[pe(s,e.id.clock)]=t},Kn=(i,e,t,s,r)=>{if(s===0)return;let n=t+s,o=Zi(i,e,t),a;do a=e[o++],n<a.id.clock+a.length&&Zi(i,e,n),r(a);while(o<e.length&&e[o].id.clock<n)},Qi=class{constructor(e,t,s){this.doc=e,this.deleteSet=new Ke,this.beforeState=ur(e.store),this.afterState=new Map,this.changed=new Map,this.changedParentTypes=new Map,this._mergeStructs=[],this.origin=t,this.meta=new Map,this.local=s,this.subdocsAdded=new Set,this.subdocsRemoved=new Set,this.subdocsLoaded=new Set,this._needFormattingCleanup=!1}},On=(i,e)=>e.deleteSet.clients.size===0&&!jr(e.afterState,(t,s)=>e.beforeState.get(s)!==t)?!1:(lr(e.deleteSet),Hc(i,e),St(i,e.deleteSet),!0),Nn=(i,e,t)=>{let s=e._item;(s===null||s.id.clock<(i.beforeState.get(s.id.client)||0)&&!s.deleted)&&ce(i.changed,e,We).add(t)},Is=(i,e)=>{let t=i[e],s=i[e-1],r=e;for(;r>0;t=s,s=i[--r-1]){if(s.deleted===t.deleted&&s.constructor===t.constructor&&s.mergeWith(t)){t instanceof $&&t.parentSub!==null&&t.parent._map.get(t.parentSub)===t&&t.parent._map.set(t.parentSub,s);continue}break}let n=e-r;return n&&i.splice(e+1-n,n),n},Xc=(i,e,t)=>{for(let[s,r]of i.clients.entries()){let n=e.clients.get(s);for(let o=r.length-1;o>=0;o--){let a=r[o],c=a.clock+a.len;for(let l=pe(n,a.clock),d=n[l];l<n.length&&d.id.clock<c;d=n[++l]){let h=n[l];if(a.clock+a.len<=h.id.clock)break;h instanceof $&&h.deleted&&!h.keep&&t(h)&&h.gc(e,!1)}}}},Kc=(i,e)=>{i.clients.forEach((t,s)=>{let r=e.clients.get(s);for(let n=t.length-1;n>=0;n--){let o=t[n],a=gs(r.length-1,1+pe(r,o.clock+o.len-1));for(let c=a,l=r[c];c>0&&l.id.clock>=o.clock;l=r[c])c-=1+Is(r,c)}})};var Zn=(i,e)=>{if(e<i.length){let t=i[e],s=t.doc,r=s.store,n=t.deleteSet,o=t._mergeStructs;try{lr(n),t.afterState=ur(t.doc.store),s.emit("beforeObserverCalls",[t,s]);let a=[];t.changed.forEach((c,l)=>a.push(()=>{(l._item===null||!l._item.deleted)&&l._callObserver(t,c)})),a.push(()=>{t.changedParentTypes.forEach((c,l)=>{l._dEH.l.length>0&&(l._item===null||!l._item.deleted)&&(c=c.filter(d=>d.target._item===null||!d.target._item.deleted),c.forEach(d=>{d.currentTarget=l,d._path=null}),c.sort((d,h)=>d.path.length-h.path.length),a.push(()=>{Jn(l._dEH,c,t)}))}),a.push(()=>s.emit("afterTransaction",[t,s])),a.push(()=>{t._needFormattingCleanup&&fl(t)})}),Nt(a,[])}finally{s.gc&&Xc(n,r,s.gcFilter),Kc(n,r),t.afterState.forEach((d,h)=>{let p=t.beforeState.get(h)||0;if(p!==d){let u=r.clients.get(h),f=me(pe(u,p),1);for(let g=u.length-1;g>=f;)g-=1+Is(u,g)}});for(let d=o.length-1;d>=0;d--){let{client:h,clock:p}=o[d].id,u=r.clients.get(h),f=pe(u,p);f+1<u.length&&Is(u,f+1)>1||f>0&&Is(u,f)}if(!t.local&&t.afterState.get(s.clientID)!==t.beforeState.get(s.clientID)&&(_n(Wt,$t,"[yjs] ",Ht,Vt,"Changed the client-id because another client seems to be using it."),s.clientID=zn()),s.emit("afterTransactionCleanup",[t,s]),s._observers.has("update")){let d=new Ze;On(d,t)&&s.emit("update",[d.toUint8Array(),t.origin,s,t])}if(s._observers.has("updateV2")){let d=new ve;On(d,t)&&s.emit("updateV2",[d.toUint8Array(),t.origin,s,t])}let{subdocsAdded:a,subdocsLoaded:c,subdocsRemoved:l}=t;(a.size>0||l.size>0||c.size>0)&&(a.forEach(d=>{d.clientID=s.clientID,d.collectionid==null&&(d.collectionid=s.collectionid),s.subdocs.add(d)}),l.forEach(d=>s.subdocs.delete(d)),s.emit("subdocs",[{loaded:c,added:a,removed:l},s,t]),l.forEach(d=>d.destroy())),i.length<=e+1?(s._transactionCleanups=[],s.emit("afterAllTransactions",[s,i])):Zn(i,e+1)}}},P=(i,e,t=null,s=!0)=>{let r=i._transactionCleanups,n=!1,o=null;i._transaction===null&&(n=!0,i._transaction=new Qi(i,t,s),r.push(i._transaction),r.length===1&&i.emit("beforeAllTransactions",[i]),i.emit("beforeTransaction",[i._transaction,i]));try{o=e(i._transaction)}finally{if(n){let a=i._transaction===r[0];i._transaction=null,a&&Zn(r,0)}}return o};function*Zc(i){let e=v(i.restDecoder);for(let t=0;t<e;t++){let s=v(i.restDecoder),r=i.readClient(),n=v(i.restDecoder);for(let o=0;o<s;o++){let a=i.readInfo();if(a===10){let c=v(i.restDecoder);yield new q(b(r,n),c),n+=c}else if(31&a){let c=(a&192)===0,l=new $(b(r,n),null,(a&128)===128?i.readLeftID():null,null,(a&64)===64?i.readRightID():null,c?i.readParentInfo()?i.readString():i.readLeftID():null,c&&(a&32)===32?i.readString():null,vo(i,a));yield l,n+=l.length}else{let c=i.readLen();yield new z(b(r,n),c),n+=c}}}}var zt=class{constructor(e,t){this.gen=Zc(e),this.curr=null,this.done=!1,this.filterSkips=t,this.next()}next(){do this.curr=this.gen.next().value||null;while(this.filterSkips&&this.curr!==null&&this.curr.constructor===q);return this.curr}};var qt=class{constructor(e){this.currClient=0,this.startClock=0,this.written=0,this.encoder=e,this.clientStructs=[]}},Qc=i=>As(i,Us,Ze);var el=(i,e)=>{if(i.constructor===z){let{client:t,clock:s}=i.id;return new z(b(t,s+e),i.length-e)}else if(i.constructor===q){let{client:t,clock:s}=i.id;return new q(b(t,s+e),i.length-e)}else{let t=i,{client:s,clock:r}=t.id;return new $(b(s,r+e),null,b(s,r+e-1),null,t.rightOrigin,t.parent,t.parentSub,t.content.splice(e))}},As=(i,e=Le,t=ve)=>{if(i.length===1)return i[0];let s=i.map(d=>new e(Xe(d))),r=s.map(d=>new zt(d,!0)),n=null,o=new t,a=new qt(o);for(;r=r.filter(p=>p.curr!==null),r.sort((p,u)=>{if(p.curr.id.client===u.curr.id.client){let f=p.curr.id.clock-u.curr.id.clock;return f===0?p.curr.constructor===u.curr.constructor?0:p.curr.constructor===q?1:-1:f}else return u.curr.id.client-p.curr.id.client}),r.length!==0;){let d=r[0],h=d.curr.id.client;if(n!==null){let p=d.curr,u=!1;for(;p!==null&&p.id.clock+p.length<=n.struct.id.clock+n.struct.length&&p.id.client>=n.struct.id.client;)p=d.next(),u=!0;if(p===null||p.id.client!==h||u&&p.id.clock>n.struct.id.clock+n.struct.length)continue;if(h!==n.struct.id.client)De(a,n.struct,n.offset),n={struct:p,offset:0},d.next();else if(n.struct.id.clock+n.struct.length<p.id.clock)if(n.struct.constructor===q)n.struct.length=p.id.clock+p.length-n.struct.id.clock;else{De(a,n.struct,n.offset);let f=p.id.clock-n.struct.id.clock-n.struct.length;n={struct:new q(b(h,n.struct.id.clock+n.struct.length),f),offset:0}}else{let f=n.struct.id.clock+n.struct.length-p.id.clock;f>0&&(n.struct.constructor===q?n.struct.length-=f:p=el(p,f)),n.struct.mergeWith(p)||(De(a,n.struct,n.offset),n={struct:p,offset:0},d.next())}}else n={struct:d.curr,offset:0},d.next();for(let p=d.curr;p!==null&&p.id.client===h&&p.id.clock===n.struct.id.clock+n.struct.length&&p.constructor!==q;p=d.next())De(a,n.struct,n.offset),n={struct:p,offset:0}}n!==null&&(De(a,n.struct,n.offset),n=null),fr(a);let c=s.map(d=>dr(d)),l=Oc(c);return St(o,l),o.toUint8Array()},tl=(i,e,t=Le,s=ve)=>{let r=Yn(e),n=new s,o=new qt(n),a=new t(Xe(i)),c=new zt(a,!1);for(;c.curr;){let d=c.curr,h=d.id.client,p=r.get(h)||0;if(c.curr.constructor===q){c.next();continue}if(d.id.clock+d.length>p)for(De(o,d,me(p-d.id.clock,0)),c.next();c.curr&&c.curr.id.client===h;)De(o,c.curr,0),c.next();else for(;c.curr&&c.curr.id.client===h&&c.curr.id.clock+c.curr.length<=p;)c.next()}fr(o);let l=dr(a);return St(n,l),n.toUint8Array()};var Qn=i=>{i.written>0&&(i.clientStructs.push({written:i.written,restEncoder:ie(i.encoder.restEncoder)}),i.encoder.restEncoder=At(),i.written=0)},De=(i,e,t)=>{i.written>0&&i.currClient!==e.id.client&&Qn(i),i.written===0&&(i.currClient=e.id.client,i.encoder.writeClient(e.id.client),x(i.encoder.restEncoder,e.id.clock+t)),e.write(i.encoder,t),i.written++},fr=i=>{Qn(i);let e=i.encoder.restEncoder;x(e,i.clientStructs.length);for(let t=0;t<i.clientStructs.length;t++){let s=i.clientStructs[t];x(e,s.written),Lt(e,s.restEncoder)}},sl=(i,e,t,s)=>{let r=new t(Xe(i)),n=new zt(r,!1),o=new s,a=new qt(o);for(let l=n.curr;l!==null;l=n.next())De(a,e(l),0);fr(a);let c=dr(r);return St(o,c),o.toUint8Array()};var il=i=>sl(i,mn,Le,Ze),Rn="You must not compute changes after the event-handler fired.",yt=class{constructor(e,t){this.target=e,this.currentTarget=e,this.transaction=t,this._changes=null,this._keys=null,this._delta=null,this._path=null}get path(){return this._path||(this._path=rl(this.currentTarget,this.target))}deletes(e){return Wn(this.transaction.deleteSet,e.id)}get keys(){if(this._keys===null){if(this.transaction.doc._transactionCleanups.length===0)throw le(Rn);let e=new Map,t=this.target;this.transaction.changed.get(t).forEach(r=>{if(r!==null){let n=t._map.get(r),o,a;if(this.adds(n)){let c=n.left;for(;c!==null&&this.adds(c);)c=c.left;if(this.deletes(n))if(c!==null&&this.deletes(c))o="delete",a=us(c.content.getContent());else return;else c!==null&&this.deletes(c)?(o="update",a=us(c.content.getContent())):(o="add",a=void 0)}else if(this.deletes(n))o="delete",a=us(n.content.getContent());else return;e.set(r,{action:o,oldValue:a})}}),this._keys=e}return this._keys}get delta(){return this.changes.delta}adds(e){return e.id.clock>=(this.transaction.beforeState.get(e.id.client)||0)}get changes(){let e=this._changes;if(e===null){if(this.transaction.doc._transactionCleanups.length===0)throw le(Rn);let t=this.target,s=We(),r=We(),n=[];if(e={added:s,deleted:r,delta:n,keys:this.keys},this.transaction.changed.get(t).has(null)){let a=null,c=()=>{a&&n.push(a)};for(let l=t._start;l!==null;l=l.right)l.deleted?this.deletes(l)&&!this.adds(l)&&((a===null||a.delete===void 0)&&(c(),a={delete:0}),a.delete+=l.length,r.add(l)):this.adds(l)?((a===null||a.insert===void 0)&&(c(),a={insert:[]}),a.insert=a.insert.concat(l.content.getContent()),s.add(l)):((a===null||a.retain===void 0)&&(c(),a={retain:0}),a.retain+=l.length);a!==null&&a.retain===void 0&&c()}this._changes=e}return e}},rl=(i,e)=>{let t=[];for(;e._item!==null&&e!==i;){if(e._item.parentSub!==null)t.unshift(e._item.parentSub);else{let s=0,r=e._item.parent._start;for(;r!==e._item&&r!==null;)!r.deleted&&r.countable&&(s+=r.length),r=r.right;t.unshift(s)}e=e._item.parent}return t},V=()=>{Pn("Invalid access: Add Yjs type to a document before reading data.")},eo=80,gr=0,er=class{constructor(e,t){e.marker=!0,this.p=e,this.index=t,this.timestamp=gr++}},nl=i=>{i.timestamp=gr++},to=(i,e,t)=>{i.p.marker=!1,i.p=e,e.marker=!0,i.index=t,i.timestamp=gr++},ol=(i,e,t)=>{if(i.length>=eo){let s=i.reduce((r,n)=>r.timestamp<n.timestamp?r:n);return to(s,e,t),s}else{let s=new er(e,t);return i.push(s),s}},$s=(i,e)=>{if(i._start===null||e===0||i._searchMarker===null)return null;let t=i._searchMarker.length===0?null:i._searchMarker.reduce((n,o)=>ct(e-n.index)<ct(e-o.index)?n:o),s=i._start,r=0;for(t!==null&&(s=t.p,r=t.index,nl(t));s.right!==null&&r<e;){if(!s.deleted&&s.countable){if(e<r+s.length)break;r+=s.length}s=s.right}for(;s.left!==null&&r>e;)s=s.left,!s.deleted&&s.countable&&(r-=s.length);for(;s.left!==null&&s.left.id.client===s.id.client&&s.left.id.clock+s.left.length===s.id.clock;)s=s.left,!s.deleted&&s.countable&&(r-=s.length);return t!==null&&ct(t.index-r)<s.parent.length/eo?(to(t,s,r),t):ol(i._searchMarker,s,r)},Gt=(i,e,t)=>{for(let s=i.length-1;s>=0;s--){let r=i[s];if(t>0){let n=r.p;for(n.marker=!1;n&&(n.deleted||!n.countable);)n=n.left,n&&!n.deleted&&n.countable&&(r.index-=n.length);if(n===null||n.marker===!0){i.splice(s,1);continue}r.p=n,n.marker=!0}(e<r.index||t>0&&e===r.index)&&(r.index=me(e,r.index+t))}};var Hs=(i,e,t)=>{let s=i,r=e.changedParentTypes;for(;ce(r,i,()=>[]).push(t),i._item!==null;)i=i._item.parent;Jn(s._eH,t,e)},L=class{constructor(){this._item=null,this._map=new Map,this._start=null,this.doc=null,this._length=0,this._eH=Un(),this._dEH=Un(),this._searchMarker=null}get parent(){return this._item?this._item.parent:null}_integrate(e,t){this.doc=e,this._item=t}_copy(){throw re()}clone(){throw re()}_write(e){}get _first(){let e=this._start;for(;e!==null&&e.deleted;)e=e.right;return e}_callObserver(e,t){!e.local&&this._searchMarker&&(this._searchMarker.length=0)}observe(e){Bn(this._eH,e)}observeDeep(e){Bn(this._dEH,e)}unobserve(e){An(this._eH,e)}unobserveDeep(e){An(this._dEH,e)}toJSON(){}},so=(i,e,t)=>{i.doc??V(),e<0&&(e=i._length+e),t<0&&(t=i._length+t);let s=t-e,r=[],n=i._start;for(;n!==null&&s>0;){if(n.countable&&!n.deleted){let o=n.content.getContent();if(o.length<=e)e-=o.length;else{for(let a=e;a<o.length&&s>0;a++)r.push(o[a]),s--;e=0}}n=n.right}return r},io=i=>{i.doc??V();let e=[],t=i._start;for(;t!==null;){if(t.countable&&!t.deleted){let s=t.content.getContent();for(let r=0;r<s.length;r++)e.push(s[r])}t=t.right}return e};var Yt=(i,e)=>{let t=0,s=i._start;for(i.doc??V();s!==null;){if(s.countable&&!s.deleted){let r=s.content.getContent();for(let n=0;n<r.length;n++)e(r[n],t++,i)}s=s.right}},ro=(i,e)=>{let t=[];return Yt(i,(s,r)=>{t.push(e(s,r,i))}),t},al=i=>{let e=i._start,t=null,s=0;return{[Symbol.iterator](){return this},next:()=>{if(t===null){for(;e!==null&&e.deleted;)e=e.right;if(e===null)return{done:!0,value:void 0};t=e.content.getContent(),s=0,e=e.right}let r=t[s++];return t.length<=s&&(t=null),{done:!1,value:r}}}},no=(i,e)=>{i.doc??V();let t=$s(i,e),s=i._start;for(t!==null&&(s=t.p,e-=t.index);s!==null;s=s.right)if(!s.deleted&&s.countable){if(e<s.length)return s.content.getContent()[e];e-=s.length}},Ls=(i,e,t,s)=>{let r=t,n=i.doc,o=n.clientID,a=n.store,c=t===null?e._start:t.right,l=[],d=()=>{l.length>0&&(r=new $(b(o,F(a,o)),r,r&&r.lastId,c,c&&c.id,e,null,new xt(l)),r.integrate(i,0),l=[])};s.forEach(h=>{if(h===null)l.push(h);else switch(h.constructor){case Number:case Object:case Boolean:case Array:case String:l.push(h);break;default:switch(d(),h.constructor){case Uint8Array:case ArrayBuffer:r=new $(b(o,F(a,o)),r,r&&r.lastId,c,c&&c.id,e,null,new Qt(new Uint8Array(h))),r.integrate(i,0);break;case Ae:r=new $(b(o,F(a,o)),r,r&&r.lastId,c,c&&c.id,e,null,new es(h)),r.integrate(i,0);break;default:if(h instanceof L)r=new $(b(o,F(a,o)),r,r&&r.lastId,c,c&&c.id,e,null,new ye(h)),r.integrate(i,0);else throw new Error("Unexpected content type in insert operation")}}}),d()},oo=()=>le("Length exceeded!"),ao=(i,e,t,s)=>{if(t>e._length)throw oo();if(t===0)return e._searchMarker&&Gt(e._searchMarker,t,s.length),Ls(i,e,null,s);let r=t,n=$s(e,t),o=e._start;for(n!==null&&(o=n.p,t-=n.index,t===0&&(o=o.prev,t+=o&&o.countable&&!o.deleted?o.length:0));o!==null;o=o.right)if(!o.deleted&&o.countable){if(t<=o.length){t<o.length&&Oe(i,b(o.id.client,o.id.clock+t));break}t-=o.length}return e._searchMarker&&Gt(e._searchMarker,r,s.length),Ls(i,e,o,s)},cl=(i,e,t)=>{let r=(e._searchMarker||[]).reduce((n,o)=>o.index>n.index?o:n,{index:0,p:e._start}).p;if(r)for(;r.right;)r=r.right;return Ls(i,e,r,t)},co=(i,e,t,s)=>{if(s===0)return;let r=t,n=s,o=$s(e,t),a=e._start;for(o!==null&&(a=o.p,t-=o.index);a!==null&&t>0;a=a.right)!a.deleted&&a.countable&&(t<a.length&&Oe(i,b(a.id.client,a.id.clock+t)),t-=a.length);for(;s>0&&a!==null;)a.deleted||(s<a.length&&Oe(i,b(a.id.client,a.id.clock+s)),a.delete(i),s-=a.length),a=a.right;if(s>0)throw oo();e._searchMarker&&Gt(e._searchMarker,r,-n+s)},Os=(i,e,t)=>{let s=e._map.get(t);s!==void 0&&s.delete(i)},mr=(i,e,t,s)=>{let r=e._map.get(t)||null,n=i.doc,o=n.clientID,a;if(s==null)a=new xt([s]);else switch(s.constructor){case Number:case Object:case Boolean:case Array:case String:case Date:case BigInt:a=new xt([s]);break;case Uint8Array:a=new Qt(s);break;case Ae:a=new es(s);break;default:if(s instanceof L)a=new ye(s);else throw new Error("Unexpected content type")}new $(b(o,F(n.store,o)),r,r&&r.lastId,null,null,e,t,a).integrate(i,0)},vr=(i,e)=>{i.doc??V();let t=i._map.get(e);return t!==void 0&&!t.deleted?t.content.getContent()[t.length-1]:void 0},lo=i=>{let e={};return i.doc??V(),i._map.forEach((t,s)=>{t.deleted||(e[s]=t.content.getContent()[t.length-1])}),e},ho=(i,e)=>{i.doc??V();let t=i._map.get(e);return t!==void 0&&!t.deleted};var ll=(i,e)=>{let t={};return i._map.forEach((s,r)=>{let n=s;for(;n!==null&&(!e.sv.has(n.id.client)||n.id.clock>=(e.sv.get(n.id.client)||0));)n=n.left;n!==null&&vt(n,e)&&(t[r]=n.content.getContent()[n.length-1])}),t},Ps=i=>(i.doc??V(),In(i._map.entries(),e=>!e[1].deleted)),tr=class extends yt{},Ns=class i extends L{constructor(){super(),this._prelimContent=[],this._searchMarker=[]}static from(e){let t=new i;return t.push(e),t}_integrate(e,t){super._integrate(e,t),this.insert(0,this._prelimContent),this._prelimContent=null}_copy(){return new i}clone(){let e=new i;return e.insert(0,this.toArray().map(t=>t instanceof L?t.clone():t)),e}get length(){return this.doc??V(),this._length}_callObserver(e,t){super._callObserver(e,t),Hs(this,e,new tr(this,e))}insert(e,t){this.doc!==null?P(this.doc,s=>{ao(s,this,e,t)}):this._prelimContent.splice(e,0,...t)}push(e){this.doc!==null?P(this.doc,t=>{cl(t,this,e)}):this._prelimContent.push(...e)}unshift(e){this.insert(0,e)}delete(e,t=1){this.doc!==null?P(this.doc,s=>{co(s,this,e,t)}):this._prelimContent.splice(e,t)}get(e){return no(this,e)}toArray(){return io(this)}slice(e=0,t=this.length){return so(this,e,t)}toJSON(){return this.map(e=>e instanceof L?e.toJSON():e)}map(e){return ro(this,e)}forEach(e){Yt(this,e)}[Symbol.iterator](){return al(this)}_write(e){e.writeTypeRef(Dl)}},dl=i=>new Ns,sr=class extends yt{constructor(e,t,s){super(e,t),this.keysChanged=s}},Jt=class i extends L{constructor(e){super(),this._prelimContent=null,e===void 0?this._prelimContent=new Map:this._prelimContent=new Map(e)}_integrate(e,t){super._integrate(e,t),this._prelimContent.forEach((s,r)=>{this.set(r,s)}),this._prelimContent=null}_copy(){return new i}clone(){let e=new i;return this.forEach((t,s)=>{e.set(s,t instanceof L?t.clone():t)}),e}_callObserver(e,t){Hs(this,e,new sr(this,e,t))}toJSON(){this.doc??V();let e={};return this._map.forEach((t,s)=>{if(!t.deleted){let r=t.content.getContent()[t.length-1];e[s]=r instanceof L?r.toJSON():r}}),e}get size(){return[...Ps(this)].length}keys(){return Cs(Ps(this),e=>e[0])}values(){return Cs(Ps(this),e=>e[1].content.getContent()[e[1].length-1])}entries(){return Cs(Ps(this),e=>[e[0],e[1].content.getContent()[e[1].length-1]])}forEach(e){this.doc??V(),this._map.forEach((t,s)=>{t.deleted||e(t.content.getContent()[t.length-1],s,this)})}[Symbol.iterator](){return this.entries()}delete(e){this.doc!==null?P(this.doc,t=>{Os(t,this,e)}):this._prelimContent.delete(e)}set(e,t){return this.doc!==null?P(this.doc,s=>{mr(s,this,e,t)}):this._prelimContent.set(e,t),t}get(e){return vr(this,e)}has(e){return ho(this,e)}clear(){this.doc!==null?P(this.doc,e=>{this.forEach(function(t,s,r){Os(e,r,s)})}):this._prelimContent.clear()}_write(e){e.writeTypeRef(Ul)}},hl=i=>new Jt,Ue=(i,e)=>i===e||typeof i=="object"&&typeof e=="object"&&i&&e&&gn(i,e),Xt=class{constructor(e,t,s,r){this.left=e,this.right=t,this.index=s,this.currentAttributes=r}forward(){switch(this.right===null&&ne(),this.right.content.constructor){case O:this.right.deleted||kt(this.currentAttributes,this.right.content);break;default:this.right.deleted||(this.index+=this.right.length);break}this.left=this.right,this.right=this.right.right}},Fn=(i,e,t)=>{for(;e.right!==null&&t>0;){switch(e.right.content.constructor){case O:e.right.deleted||kt(e.currentAttributes,e.right.content);break;default:e.right.deleted||(t<e.right.length&&Oe(i,b(e.right.id.client,e.right.id.clock+t)),e.index+=e.right.length,t-=e.right.length);break}e.left=e.right,e.right=e.right.right}return e},Es=(i,e,t,s)=>{let r=new Map,n=s?$s(e,t):null;if(n){let o=new Xt(n.p.left,n.p,n.index,r);return Fn(i,o,t-n.index)}else{let o=new Xt(null,e._start,0,r);return Fn(i,o,t)}},po=(i,e,t,s)=>{for(;t.right!==null&&(t.right.deleted===!0||t.right.content.constructor===O&&Ue(s.get(t.right.content.key),t.right.content.value));)t.right.deleted||s.delete(t.right.content.key),t.forward();let r=i.doc,n=r.clientID;s.forEach((o,a)=>{let c=t.left,l=t.right,d=new $(b(n,F(r.store,n)),c,c&&c.lastId,l,l&&l.id,e,null,new O(a,o));d.integrate(i,0),t.right=d,t.forward()})},kt=(i,e)=>{let{key:t,value:s}=e;s===null?i.delete(t):i.set(t,s)},uo=(i,e)=>{for(;i.right!==null;){if(!(i.right.deleted||i.right.content.constructor===O&&Ue(e[i.right.content.key]??null,i.right.content.value)))break;i.forward()}},fo=(i,e,t,s)=>{let r=i.doc,n=r.clientID,o=new Map;for(let a in s){let c=s[a],l=t.currentAttributes.get(a)??null;if(!Ue(l,c)){o.set(a,l);let{left:d,right:h}=t;t.right=new $(b(n,F(r.store,n)),d,d&&d.lastId,h,h&&h.id,e,null,new O(a,c)),t.right.integrate(i,0),t.forward()}}return o},zi=(i,e,t,s,r)=>{t.currentAttributes.forEach((p,u)=>{r[u]===void 0&&(r[u]=null)});let n=i.doc,o=n.clientID;uo(t,r);let a=fo(i,e,t,r),c=s.constructor===String?new we(s):s instanceof L?new ye(s):new et(s),{left:l,right:d,index:h}=t;e._searchMarker&&Gt(e._searchMarker,t.index,c.getLength()),d=new $(b(o,F(n.store,o)),l,l&&l.lastId,d,d&&d.id,e,null,c),d.integrate(i,0),t.right=d,t.index=h,t.forward(),po(i,e,t,a)},$n=(i,e,t,s,r)=>{let n=i.doc,o=n.clientID;uo(t,r);let a=fo(i,e,t,r);e:for(;t.right!==null&&(s>0||a.size>0&&(t.right.deleted||t.right.content.constructor===O));){if(!t.right.deleted)switch(t.right.content.constructor){case O:{let{key:c,value:l}=t.right.content,d=r[c];if(d!==void 0){if(Ue(d,l))a.delete(c);else{if(s===0)break e;a.set(c,l)}t.right.delete(i)}else t.currentAttributes.set(c,l);break}default:s<t.right.length&&Oe(i,b(t.right.id.client,t.right.id.clock+s)),s-=t.right.length;break}t.forward()}if(s>0){let c="";for(;s>0;s--)c+=`
`;t.right=new $(b(o,F(n.store,o)),t.left,t.left&&t.left.lastId,t.right,t.right&&t.right.id,e,null,new we(c)),t.right.integrate(i,0),t.forward()}po(i,e,t,a)},go=(i,e,t,s,r)=>{let n=e,o=J();for(;n&&(!n.countable||n.deleted);){if(!n.deleted&&n.content.constructor===O){let l=n.content;o.set(l.key,l)}n=n.right}let a=0,c=!1;for(;e!==n;){if(t===e&&(c=!0),!e.deleted){let l=e.content;switch(l.constructor){case O:{let{key:d,value:h}=l,p=s.get(d)??null;(o.get(d)!==l||p===h)&&(e.delete(i),a++,!c&&(r.get(d)??null)===h&&p!==h&&(p===null?r.delete(d):r.set(d,p))),!c&&!e.deleted&&kt(r,l);break}}}e=e.right}return a},pl=(i,e)=>{for(;e&&e.right&&(e.right.deleted||!e.right.countable);)e=e.right;let t=new Set;for(;e&&(e.deleted||!e.countable);){if(!e.deleted&&e.content.constructor===O){let s=e.content.key;t.has(s)?e.delete(i):t.add(s)}e=e.left}},ul=i=>{let e=0;return P(i.doc,t=>{let s=i._start,r=i._start,n=J(),o=ps(n);for(;r;){if(r.deleted===!1)switch(r.content.constructor){case O:kt(o,r.content);break;default:e+=go(t,s,r,n,o),n=ps(o),s=r;break}r=r.right}}),e},fl=i=>{let e=new Set,t=i.doc;for(let[s,r]of i.afterState.entries()){let n=i.beforeState.get(s)||0;r!==n&&Kn(i,t.store.clients.get(s),n,r,o=>{!o.deleted&&o.content.constructor===O&&o.constructor!==z&&e.add(o.parent)})}P(t,s=>{Vn(i,i.deleteSet,r=>{if(r instanceof z||!r.parent._hasFormatting||e.has(r.parent))return;let n=r.parent;r.content.constructor===O?e.add(n):pl(s,r)});for(let r of e)ul(r)})},Hn=(i,e,t)=>{let s=t,r=ps(e.currentAttributes),n=e.right;for(;t>0&&e.right!==null;){if(e.right.deleted===!1)switch(e.right.content.constructor){case ye:case et:case we:t<e.right.length&&Oe(i,b(e.right.id.client,e.right.id.clock+t)),t-=e.right.length,e.right.delete(i);break}e.forward()}n&&go(i,n,e.right,r,e.currentAttributes);let o=(e.left||e.right).parent;return o._searchMarker&&Gt(o._searchMarker,e.index,-s+t),e},ir=class extends yt{constructor(e,t,s){super(e,t),this.childListChanged=!1,this.keysChanged=new Set,s.forEach(r=>{r===null?this.childListChanged=!0:this.keysChanged.add(r)})}get changes(){if(this._changes===null){let e={keys:this.keys,delta:this.delta,added:new Set,deleted:new Set};this._changes=e}return this._changes}get delta(){if(this._delta===null){let e=this.target.doc,t=[];P(e,s=>{let r=new Map,n=new Map,o=this.target._start,a=null,c={},l="",d=0,h=0,p=()=>{if(a!==null){let u=null;switch(a){case"delete":h>0&&(u={delete:h}),h=0;break;case"insert":(typeof l=="object"||l.length>0)&&(u={insert:l},r.size>0&&(u.attributes={},r.forEach((f,g)=>{f!==null&&(u.attributes[g]=f)}))),l="";break;case"retain":d>0&&(u={retain:d},fn(c)||(u.attributes=pn({},c))),d=0;break}u&&t.push(u),a=null}};for(;o!==null;){switch(o.content.constructor){case ye:case et:this.adds(o)?this.deletes(o)||(p(),a="insert",l=o.content.getContent()[0],p()):this.deletes(o)?(a!=="delete"&&(p(),a="delete"),h+=1):o.deleted||(a!=="retain"&&(p(),a="retain"),d+=1);break;case we:this.adds(o)?this.deletes(o)||(a!=="insert"&&(p(),a="insert"),l+=o.content.str):this.deletes(o)?(a!=="delete"&&(p(),a="delete"),h+=o.length):o.deleted||(a!=="retain"&&(p(),a="retain"),d+=o.length);break;case O:{let{key:u,value:f}=o.content;if(this.adds(o)){if(!this.deletes(o)){let g=r.get(u)??null;Ue(g,f)?f!==null&&o.delete(s):(a==="retain"&&p(),Ue(f,n.get(u)??null)?delete c[u]:c[u]=f)}}else if(this.deletes(o)){n.set(u,f);let g=r.get(u)??null;Ue(g,f)||(a==="retain"&&p(),c[u]=g)}else if(!o.deleted){n.set(u,f);let g=c[u];g!==void 0&&(Ue(g,f)?g!==null&&o.delete(s):(a==="retain"&&p(),f===null?delete c[u]:c[u]=f))}o.deleted||(a==="insert"&&p(),kt(r,o.content));break}}o=o.right}for(p();t.length>0;){let u=t[t.length-1];if(u.retain!==void 0&&u.attributes===void 0)t.pop();else break}}),this._delta=t}return this._delta}},Qe=class i extends L{constructor(e){super(),this._pending=e!==void 0?[()=>this.insert(0,e)]:[],this._searchMarker=[],this._hasFormatting=!1}get length(){return this.doc??V(),this._length}_integrate(e,t){super._integrate(e,t);try{this._pending.forEach(s=>s())}catch(s){console.error(s)}this._pending=null}_copy(){return new i}clone(){let e=new i;return e.applyDelta(this.toDelta()),e}_callObserver(e,t){super._callObserver(e,t);let s=new ir(this,e,t);Hs(this,e,s),!e.local&&this._hasFormatting&&(e._needFormattingCleanup=!0)}toString(){this.doc??V();let e="",t=this._start;for(;t!==null;)!t.deleted&&t.countable&&t.content.constructor===we&&(e+=t.content.str),t=t.right;return e}toJSON(){return this.toString()}applyDelta(e,{sanitize:t=!0}={}){this.doc!==null?P(this.doc,s=>{let r=new Xt(null,this._start,0,new Map);for(let n=0;n<e.length;n++){let o=e[n];if(o.insert!==void 0){let a=!t&&typeof o.insert=="string"&&n===e.length-1&&r.right===null&&o.insert.slice(-1)===`
`?o.insert.slice(0,-1):o.insert;(typeof a!="string"||a.length>0)&&zi(s,this,r,a,o.attributes||{})}else o.retain!==void 0?$n(s,this,r,o.retain,o.attributes||{}):o.delete!==void 0&&Hn(s,r,o.delete)}}):this._pending.push(()=>this.applyDelta(e))}toDelta(e,t,s){this.doc??V();let r=[],n=new Map,o=this.doc,a="",c=this._start;function l(){if(a.length>0){let h={},p=!1;n.forEach((f,g)=>{p=!0,h[g]=f});let u={insert:a};p&&(u.attributes=h),r.push(u),a=""}}let d=()=>{for(;c!==null;){if(vt(c,e)||t!==void 0&&vt(c,t))switch(c.content.constructor){case we:{let h=n.get("ychange");e!==void 0&&!vt(c,e)?(h===void 0||h.user!==c.id.client||h.type!=="removed")&&(l(),n.set("ychange",s?s("removed",c.id):{type:"removed"})):t!==void 0&&!vt(c,t)?(h===void 0||h.user!==c.id.client||h.type!=="added")&&(l(),n.set("ychange",s?s("added",c.id):{type:"added"})):h!==void 0&&(l(),n.delete("ychange")),a+=c.content.str;break}case ye:case et:{l();let h={insert:c.content.getContent()[0]};if(n.size>0){let p={};h.attributes=p,n.forEach((u,f)=>{p[f]=u})}r.push(h);break}case O:vt(c,e)&&(l(),kt(n,c.content));break}c=c.right}l()};return e||t?P(o,h=>{e&&Ki(h,e),t&&Ki(h,t),d()},"cleanup"):d(),r}insert(e,t,s){if(t.length<=0)return;let r=this.doc;r!==null?P(r,n=>{let o=Es(n,this,e,!s);s||(s={},o.currentAttributes.forEach((a,c)=>{s[c]=a})),zi(n,this,o,t,s)}):this._pending.push(()=>this.insert(e,t,s))}insertEmbed(e,t,s){let r=this.doc;r!==null?P(r,n=>{let o=Es(n,this,e,!s);zi(n,this,o,t,s||{})}):this._pending.push(()=>this.insertEmbed(e,t,s||{}))}delete(e,t){if(t===0)return;let s=this.doc;s!==null?P(s,r=>{Hn(r,Es(r,this,e,!0),t)}):this._pending.push(()=>this.delete(e,t))}format(e,t,s){if(t===0)return;let r=this.doc;r!==null?P(r,n=>{let o=Es(n,this,e,!1);o.right!==null&&$n(n,this,o,t,s)}):this._pending.push(()=>this.format(e,t,s))}removeAttribute(e){this.doc!==null?P(this.doc,t=>{Os(t,this,e)}):this._pending.push(()=>this.removeAttribute(e))}setAttribute(e,t){this.doc!==null?P(this.doc,s=>{mr(s,this,e,t)}):this._pending.push(()=>this.setAttribute(e,t))}getAttribute(e){return vr(this,e)}getAttributes(){return lo(this)}_write(e){e.writeTypeRef(Bl)}},gl=i=>new Qe,jt=class{constructor(e,t=()=>!0){this._filter=t,this._root=e,this._currentNode=e._start,this._firstCall=!0,e.doc??V()}[Symbol.iterator](){return this}next(){let e=this._currentNode,t=e&&e.content&&e.content.type;if(e!==null&&(!this._firstCall||e.deleted||!this._filter(t)))do if(t=e.content.type,!e.deleted&&(t.constructor===Kt||t.constructor===bt)&&t._start!==null)e=t._start;else for(;e!==null;){let s=e.next;if(s!==null){e=s;break}else e.parent===this._root?e=null:e=e.parent._item}while(e!==null&&(e.deleted||!this._filter(e.content.type)));return this._firstCall=!1,e===null?{value:void 0,done:!0}:(this._currentNode=e,{value:e.content.type,done:!1})}},bt=class i extends L{constructor(){super(),this._prelimContent=[]}get firstChild(){let e=this._first;return e?e.content.getContent()[0]:null}_integrate(e,t){super._integrate(e,t),this.insert(0,this._prelimContent),this._prelimContent=null}_copy(){return new i}clone(){let e=new i;return e.insert(0,this.toArray().map(t=>t instanceof L?t.clone():t)),e}get length(){return this.doc??V(),this._prelimContent===null?this._length:this._prelimContent.length}createTreeWalker(e){return new jt(this,e)}querySelector(e){e=e.toUpperCase();let s=new jt(this,r=>r.nodeName&&r.nodeName.toUpperCase()===e).next();return s.done?null:s.value}querySelectorAll(e){return e=e.toUpperCase(),ge(new jt(this,t=>t.nodeName&&t.nodeName.toUpperCase()===e))}_callObserver(e,t){Hs(this,e,new rr(this,t,e))}toString(){return ro(this,e=>e.toString()).join("")}toJSON(){return this.toString()}toDOM(e=document,t={},s){let r=e.createDocumentFragment();return s!==void 0&&s._createAssociation(r,this),Yt(this,n=>{r.insertBefore(n.toDOM(e,t,s),null)}),r}insert(e,t){this.doc!==null?P(this.doc,s=>{ao(s,this,e,t)}):this._prelimContent.splice(e,0,...t)}insertAfter(e,t){if(this.doc!==null)P(this.doc,s=>{let r=e&&e instanceof L?e._item:e;Ls(s,this,r,t)});else{let s=this._prelimContent,r=e===null?0:s.findIndex(n=>n===e)+1;if(r===0&&e!==null)throw le("Reference item not found");s.splice(r,0,...t)}}delete(e,t=1){this.doc!==null?P(this.doc,s=>{co(s,this,e,t)}):this._prelimContent.splice(e,t)}toArray(){return io(this)}push(e){this.insert(this.length,e)}unshift(e){this.insert(0,e)}get(e){return no(this,e)}slice(e=0,t=this.length){return so(this,e,t)}forEach(e){Yt(this,e)}_write(e){e.writeTypeRef(Ll)}},ml=i=>new bt,Kt=class i extends bt{constructor(e="UNDEFINED"){super(),this.nodeName=e,this._prelimAttrs=new Map}get nextSibling(){let e=this._item?this._item.next:null;return e?e.content.type:null}get prevSibling(){let e=this._item?this._item.prev:null;return e?e.content.type:null}_integrate(e,t){super._integrate(e,t),this._prelimAttrs.forEach((s,r)=>{this.setAttribute(r,s)}),this._prelimAttrs=null}_copy(){return new i(this.nodeName)}clone(){let e=new i(this.nodeName),t=this.getAttributes();return un(t,(s,r)=>{e.setAttribute(r,s)}),e.insert(0,this.toArray().map(s=>s instanceof L?s.clone():s)),e}toString(){let e=this.getAttributes(),t=[],s=[];for(let a in e)s.push(a);s.sort();let r=s.length;for(let a=0;a<r;a++){let c=s[a];t.push(c+'="'+e[c]+'"')}let n=this.nodeName.toLocaleLowerCase(),o=t.length>0?" "+t.join(" "):"";return`<${n}${o}>${super.toString()}</${n}>`}removeAttribute(e){this.doc!==null?P(this.doc,t=>{Os(t,this,e)}):this._prelimAttrs.delete(e)}setAttribute(e,t){this.doc!==null?P(this.doc,s=>{mr(s,this,e,t)}):this._prelimAttrs.set(e,t)}getAttribute(e){return vr(this,e)}hasAttribute(e){return ho(this,e)}getAttributes(e){return e?ll(this,e):lo(this)}toDOM(e=document,t={},s){let r=e.createElement(this.nodeName),n=this.getAttributes();for(let o in n){let a=n[o];typeof a=="string"&&r.setAttribute(o,a)}return Yt(this,o=>{r.appendChild(o.toDOM(e,t,s))}),s!==void 0&&s._createAssociation(r,this),r}_write(e){e.writeTypeRef(Al),e.writeKey(this.nodeName)}},vl=i=>new Kt(i.readKey()),rr=class extends yt{constructor(e,t,s){super(e,s),this.childListChanged=!1,this.attributesChanged=new Set,t.forEach(r=>{r===null?this.childListChanged=!0:this.attributesChanged.add(r)})}},nr=class i extends Jt{constructor(e){super(),this.hookName=e}_copy(){return new i(this.hookName)}clone(){let e=new i(this.hookName);return this.forEach((t,s)=>{e.set(s,t)}),e}toDOM(e=document,t={},s){let r=t[this.hookName],n;return r!==void 0?n=r.createDom(this):n=document.createElement(this.hookName),n.setAttribute("data-yjs-hook",this.hookName),s!==void 0&&s._createAssociation(n,this),n}_write(e){e.writeTypeRef(Ol),e.writeKey(this.hookName)}},wl=i=>new nr(i.readKey()),or=class i extends Qe{get nextSibling(){let e=this._item?this._item.next:null;return e?e.content.type:null}get prevSibling(){let e=this._item?this._item.prev:null;return e?e.content.type:null}_copy(){return new i}clone(){let e=new i;return e.applyDelta(this.toDelta()),e}toDOM(e=document,t,s){let r=e.createTextNode(this.toString());return s!==void 0&&s._createAssociation(r,this),r}toString(){return this.toDelta().map(e=>{let t=[];for(let r in e.attributes){let n=[];for(let o in e.attributes[r])n.push({key:o,value:e.attributes[r][o]});n.sort((o,a)=>o.key<a.key?-1:1),t.push({nodeName:r,attrs:n})}t.sort((r,n)=>r.nodeName<n.nodeName?-1:1);let s="";for(let r=0;r<t.length;r++){let n=t[r];s+=`<${n.nodeName}`;for(let o=0;o<n.attrs.length;o++){let a=n.attrs[o];s+=` ${a.key}="${a.value}"`}s+=">"}s+=e.insert;for(let r=t.length-1;r>=0;r--)s+=`</${t[r].nodeName}>`;return s}).join("")}toJSON(){return this.toString()}_write(e){e.writeTypeRef(Nl)}},yl=i=>new or,Zt=class{constructor(e,t){this.id=e,this.length=t}get deleted(){throw re()}mergeWith(e){return!1}write(e,t,s){throw re()}integrate(e,t){throw re()}},bl=0,z=class extends Zt{get deleted(){return!0}delete(){}mergeWith(e){return this.constructor!==e.constructor?!1:(this.length+=e.length,!0)}integrate(e,t){t>0&&(this.id.clock+=t,this.length-=t),Xn(e.doc.store,this)}write(e,t){e.writeInfo(bl),e.writeLen(this.length-t)}getMissing(e,t){return null}},Qt=class i{constructor(e){this.content=e}getLength(){return 1}getContent(){return[this.content]}isCountable(){return!0}copy(){return new i(this.content)}splice(e){throw re()}mergeWith(e){return!1}integrate(e,t){}delete(e){}gc(e){}write(e,t){e.writeBuf(this.content)}getRef(){return 3}},xl=i=>new Qt(i.readBuf()),Rs=class i{constructor(e){this.len=e}getLength(){return this.len}getContent(){return[]}isCountable(){return!1}copy(){return new i(this.len)}splice(e){let t=new i(this.len-e);return this.len=e,t}mergeWith(e){return this.len+=e.len,!0}integrate(e,t){Ts(e.deleteSet,t.id.client,t.id.clock,this.len),t.markDeleted()}delete(e){}gc(e){}write(e,t){e.writeLen(this.len-t)}getRef(){return 1}},Sl=i=>new Rs(i.readLen()),mo=(i,e)=>new Ae({guid:i,...e,shouldLoad:e.shouldLoad||e.autoLoad||!1}),es=class i{constructor(e){e._item&&console.error("This document was already integrated as a sub-document. You should create a second instance instead with the same guid."),this.doc=e;let t={};this.opts=t,e.gc||(t.gc=!1),e.autoLoad&&(t.autoLoad=!0),e.meta!==null&&(t.meta=e.meta)}getLength(){return 1}getContent(){return[this.doc]}isCountable(){return!0}copy(){return new i(mo(this.doc.guid,this.opts))}splice(e){throw re()}mergeWith(e){return!1}integrate(e,t){this.doc._item=t,e.subdocsAdded.add(this.doc),this.doc.shouldLoad&&e.subdocsLoaded.add(this.doc)}delete(e){e.subdocsAdded.has(this.doc)?e.subdocsAdded.delete(this.doc):e.subdocsRemoved.add(this.doc)}gc(e){}write(e,t){e.writeString(this.doc.guid),e.writeAny(this.opts)}getRef(){return 9}},kl=i=>new es(mo(i.readString(),i.readAny())),et=class i{constructor(e){this.embed=e}getLength(){return 1}getContent(){return[this.embed]}isCountable(){return!0}copy(){return new i(this.embed)}splice(e){throw re()}mergeWith(e){return!1}integrate(e,t){}delete(e){}gc(e){}write(e,t){e.writeJSON(this.embed)}getRef(){return 5}},Cl=i=>new et(i.readJSON()),O=class i{constructor(e,t){this.key=e,this.value=t}getLength(){return 1}getContent(){return[]}isCountable(){return!1}copy(){return new i(this.key,this.value)}splice(e){throw re()}mergeWith(e){return!1}integrate(e,t){let s=t.parent;s._searchMarker=null,s._hasFormatting=!0}delete(e){}gc(e){}write(e,t){e.writeKey(this.key),e.writeJSON(this.value)}getRef(){return 6}},_l=i=>new O(i.readKey(),i.readJSON()),ar=class i{constructor(e){this.arr=e}getLength(){return this.arr.length}getContent(){return this.arr}isCountable(){return!0}copy(){return new i(this.arr)}splice(e){let t=new i(this.arr.slice(e));return this.arr=this.arr.slice(0,e),t}mergeWith(e){return this.arr=this.arr.concat(e.arr),!0}integrate(e,t){}delete(e){}gc(e){}write(e,t){let s=this.arr.length;e.writeLen(s-t);for(let r=t;r<s;r++){let n=this.arr[r];e.writeString(n===void 0?"undefined":JSON.stringify(n))}}getRef(){return 2}},Pl=i=>{let e=i.readLen(),t=[];for(let s=0;s<e;s++){let r=i.readString();r==="undefined"?t.push(void 0):t.push(JSON.parse(r))}return new ar(t)},El=Ft("node_env")==="development",xt=class i{constructor(e){this.arr=e,El&&Ni(e)}getLength(){return this.arr.length}getContent(){return this.arr}isCountable(){return!0}copy(){return new i(this.arr)}splice(e){let t=new i(this.arr.slice(e));return this.arr=this.arr.slice(0,e),t}mergeWith(e){return this.arr=this.arr.concat(e.arr),!0}integrate(e,t){}delete(e){}gc(e){}write(e,t){let s=this.arr.length;e.writeLen(s-t);for(let r=t;r<s;r++){let n=this.arr[r];e.writeAny(n)}}getRef(){return 8}},Il=i=>{let e=i.readLen(),t=[];for(let s=0;s<e;s++)t.push(i.readAny());return new xt(t)},we=class i{constructor(e){this.str=e}getLength(){return this.str.length}getContent(){return this.str.split("")}isCountable(){return!0}copy(){return new i(this.str)}splice(e){let t=new i(this.str.slice(e));this.str=this.str.slice(0,e);let s=this.str.charCodeAt(e-1);return s>=55296&&s<=56319&&(this.str=this.str.slice(0,e-1)+"\uFFFD",t.str="\uFFFD"+t.str.slice(1)),t}mergeWith(e){return this.str+=e.str,!0}integrate(e,t){}delete(e){}gc(e){}write(e,t){e.writeString(t===0?this.str:this.str.slice(t))}getRef(){return 4}},Ml=i=>new we(i.readString()),Tl=[dl,hl,gl,vl,ml,wl,yl],Dl=0,Ul=1,Bl=2,Al=3,Ll=4,Ol=5,Nl=6,ye=class i{constructor(e){this.type=e}getLength(){return 1}getContent(){return[this.type]}isCountable(){return!0}copy(){return new i(this.type._copy())}splice(e){throw re()}mergeWith(e){return!1}integrate(e,t){this.type._integrate(e.doc,t)}delete(e){let t=this.type._start;for(;t!==null;)t.deleted?t.id.clock<(e.beforeState.get(t.id.client)||0)&&e._mergeStructs.push(t):t.delete(e),t=t.right;this.type._map.forEach(s=>{s.deleted?s.id.clock<(e.beforeState.get(s.id.client)||0)&&e._mergeStructs.push(s):s.delete(e)}),e.changed.delete(this.type)}gc(e){let t=this.type._start;for(;t!==null;)t.gc(e,!0),t=t.right;this.type._start=null,this.type._map.forEach(s=>{for(;s!==null;)s.gc(e,!0),s=s.left}),this.type._map=new Map}write(e,t){this.type._write(e)}getRef(){return 7}},Rl=i=>new ye(Tl[i.readTypeRef()](i));var Fs=(i,e,t)=>{let{client:s,clock:r}=e.id,n=new $(b(s,r+t),e,b(s,r+t-1),e.right,e.rightOrigin,e.parent,e.parentSub,e.content.splice(t));return e.deleted&&n.markDeleted(),e.keep&&(n.keep=!0),e.redone!==null&&(n.redone=b(e.redone.client,e.redone.clock+t)),e.right=n,n.right!==null&&(n.right.left=n),i._mergeStructs.push(n),n.parentSub!==null&&n.right===null&&n.parent._map.set(n.parentSub,n),e.length=t,n};var $=class i extends Zt{constructor(e,t,s,r,n,o,a,c){super(e,c.getLength()),this.origin=s,this.left=t,this.right=r,this.rightOrigin=n,this.parent=o,this.parentSub=a,this.redone=null,this.content=c,this.info=this.content.isCountable()?2:0}set marker(e){(this.info&8)>0!==e&&(this.info^=8)}get marker(){return(this.info&8)>0}get keep(){return(this.info&1)>0}set keep(e){this.keep!==e&&(this.info^=1)}get countable(){return(this.info&2)>0}get deleted(){return(this.info&4)>0}set deleted(e){this.deleted!==e&&(this.info^=4)}markDeleted(){this.info|=4}getMissing(e,t){if(this.origin&&this.origin.client!==this.id.client&&this.origin.clock>=F(t,this.origin.client))return this.origin.client;if(this.rightOrigin&&this.rightOrigin.client!==this.id.client&&this.rightOrigin.clock>=F(t,this.rightOrigin.client))return this.rightOrigin.client;if(this.parent&&this.parent.constructor===Be&&this.id.client!==this.parent.client&&this.parent.clock>=F(t,this.parent.client))return this.parent.client;if(this.origin&&(this.left=Ln(e,t,this.origin),this.origin=this.left.lastId),this.rightOrigin&&(this.right=Oe(e,this.rightOrigin),this.rightOrigin=this.right.id),this.left&&this.left.constructor===z||this.right&&this.right.constructor===z)this.parent=null;else if(!this.parent)this.left&&this.left.constructor===i?(this.parent=this.left.parent,this.parentSub=this.left.parentSub):this.right&&this.right.constructor===i&&(this.parent=this.right.parent,this.parentSub=this.right.parentSub);else if(this.parent.constructor===Be){let s=ji(t,this.parent);s.constructor===z?this.parent=null:this.parent=s.content.type}return null}integrate(e,t){if(t>0&&(this.id.clock+=t,this.left=Ln(e,e.doc.store,b(this.id.client,this.id.clock-1)),this.origin=this.left.lastId,this.content=this.content.splice(t),this.length-=t),this.parent){if(!this.left&&(!this.right||this.right.left!==null)||this.left&&this.left.right!==this.right){let s=this.left,r;if(s!==null)r=s.right;else if(this.parentSub!==null)for(r=this.parent._map.get(this.parentSub)||null;r!==null&&r.left!==null;)r=r.left;else r=this.parent._start;let n=new Set,o=new Set;for(;r!==null&&r!==this.right;){if(o.add(r),n.add(r),_s(this.origin,r.origin)){if(r.id.client<this.id.client)s=r,n.clear();else if(_s(this.rightOrigin,r.rightOrigin))break}else if(r.origin!==null&&o.has(ji(e.doc.store,r.origin)))n.has(ji(e.doc.store,r.origin))||(s=r,n.clear());else break;r=r.right}this.left=s}if(this.left!==null){let s=this.left.right;this.right=s,this.left.right=this}else{let s;if(this.parentSub!==null)for(s=this.parent._map.get(this.parentSub)||null;s!==null&&s.left!==null;)s=s.left;else s=this.parent._start,this.parent._start=this;this.right=s}this.right!==null?this.right.left=this:this.parentSub!==null&&(this.parent._map.set(this.parentSub,this),this.left!==null&&this.left.delete(e)),this.parentSub===null&&this.countable&&!this.deleted&&(this.parent._length+=this.length),Xn(e.doc.store,this),this.content.integrate(e,this),Nn(e,this.parent,this.parentSub),(this.parent._item!==null&&this.parent._item.deleted||this.parentSub!==null&&this.right!==null)&&this.delete(e)}else new z(this.id,this.length).integrate(e,0)}get next(){let e=this.right;for(;e!==null&&e.deleted;)e=e.right;return e}get prev(){let e=this.left;for(;e!==null&&e.deleted;)e=e.left;return e}get lastId(){return this.length===1?this.id:b(this.id.client,this.id.clock+this.length-1)}mergeWith(e){if(this.constructor===e.constructor&&_s(e.origin,this.lastId)&&this.right===e&&_s(this.rightOrigin,e.rightOrigin)&&this.id.client===e.id.client&&this.id.clock+this.length===e.id.clock&&this.deleted===e.deleted&&this.redone===null&&e.redone===null&&this.content.constructor===e.content.constructor&&this.content.mergeWith(e.content)){let t=this.parent._searchMarker;return t&&t.forEach(s=>{s.p===e&&(s.p=this,!this.deleted&&this.countable&&(s.index-=this.length))}),e.keep&&(this.keep=!0),this.right=e.right,this.right!==null&&(this.right.left=this),this.length+=e.length,!0}return!1}delete(e){if(!this.deleted){let t=this.parent;this.countable&&this.parentSub===null&&(t._length-=this.length),this.markDeleted(),Ts(e.deleteSet,this.id.client,this.id.clock,this.length),Nn(e,t,this.parentSub),this.content.delete(e)}}gc(e,t){if(!this.deleted)throw ne();this.content.gc(e),t?Jc(e,this,new z(this.id,this.length)):this.content=new Rs(this.length)}write(e,t){let s=t>0?b(this.id.client,this.id.clock+t-1):this.origin,r=this.rightOrigin,n=this.parentSub,o=this.content.getRef()&31|(s===null?0:128)|(r===null?0:64)|(n===null?0:32);if(e.writeInfo(o),s!==null&&e.writeLeftID(s),r!==null&&e.writeRightID(r),s===null&&r===null){let a=this.parent;if(a._item!==void 0){let c=a._item;if(c===null){let l=qc(a);e.writeParentInfo(!0),e.writeString(l)}else e.writeParentInfo(!1),e.writeLeftID(c.id)}else a.constructor===String?(e.writeParentInfo(!0),e.writeString(a)):a.constructor===Be?(e.writeParentInfo(!1),e.writeLeftID(a)):ne();n!==null&&e.writeString(n)}this.content.write(e,t)}},vo=(i,e)=>Fl[e&31](i),Fl=[()=>{ne()},Sl,Pl,xl,Ml,Cl,_l,Rl,Il,kl,()=>{ne()}],$l=10,q=class extends Zt{get deleted(){return!0}delete(){}mergeWith(e){return this.constructor!==e.constructor?!1:(this.length+=e.length,!0)}integrate(e,t){ne()}write(e,t){e.writeInfo($l),x(e.restEncoder,this.length-t)}getMissing(e,t){return null}},wo=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:{},yo="__ $YJS$ __";wo[yo]===!0&&console.error("Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438");wo[yo]=!0;var oh=y(ga(),1),ah=y(Ir(),1),ch=y(Dr(),1),Fe=y(Qs(),1),Fr=y(Ca(),1);var _a=y(require("http"));var ae=y(require("crypto")),Dt=class{constructor(e){this.context=e;this.algorithm="aes-256-gcm";this.keyLength=32;this.ivLength=16;this.tagLength=16}deriveKey(e,t){return ae.scryptSync(t||e,e,this.keyLength)}encrypt(e,t){let s=ae.randomBytes(this.ivLength),r=ae.createCipheriv(this.algorithm,t,s),n=r.update(e,"utf8","hex");n+=r.final("hex");let o=r.getAuthTag();return{encrypted:n,iv:s.toString("hex"),tag:o.toString("hex")}}decrypt(e,t,s,r){let n=ae.createDecipheriv(this.algorithm,t,Buffer.from(s,"hex"));n.setAuthTag(Buffer.from(r,"hex"));let o=n.update(e,"hex","utf8");return o+=n.final("utf8"),o}generateSecureId(){return ae.randomBytes(16).toString("hex")}hash(e){return ae.createHash("sha256").update(e).digest("hex")}};var ti=class{constructor(e){this.context=e;this.sessionId=null;this.isHost=!1;this.peers=new Map;this.server=null;this.wss=null;this.clientSocket=null;this.messageHandlers=new Map;this.sessionPassword=null;this.onMessageEmitter=new K.EventEmitter;this.onMessage=this.onMessageEmitter.event;this.onPeerConnectEmitter=new K.EventEmitter;this.onPeerConnect=this.onPeerConnectEmitter.event;this.onPeerDisconnectEmitter=new K.EventEmitter;this.onPeerDisconnect=this.onPeerDisconnectEmitter.event;this.relaySocket=null;this.heartbeatInterval=null;this.ydoc=new Ae,this.encryptionManager=new Dt(e),this.config=K.workspace.getConfiguration("letscode"),this.setupYjsHandlers()}setupYjsHandlers(){this.ydoc.on("update",e=>{this.broadcastMessage({type:"ydoc-update",data:Buffer.from(e).toString("base64"),sender:this.getMyPeerId(),timestamp:Date.now()})})}async createSession(e){this.isHost=!0,this.sessionPassword=e||null,this.sessionId=this.generateSessionId();let t=this.config.get("defaultPort")||42069;return this.server=_a.createServer(),this.wss=new Fr.default({server:this.server}),this.wss.on("connection",(s,r)=>{this.handleNewConnection(s,r)}),await new Promise((s,r)=>{this.server.listen(t,"0.0.0.0",()=>{s()}),this.server.on("error",r)}),this.startHeartbeat(),K.window.showInformationMessage(`Session created: ${this.sessionId}
Port: ${t}`,"Copy ID").then(s=>{s==="Copy ID"&&K.env.clipboard.writeText(this.sessionId)}),this.sessionId}async joinSession(e,t,s,r){this.isHost=!1,this.sessionId=e,this.sessionPassword=r||null;let n=`ws://${t}:${s}`;return new Promise((o,a)=>{try{this.clientSocket=new Fe.default(n),this.clientSocket.on("open",()=>{this.sendMessage(this.clientSocket,{type:"auth",data:{sessionId:e,password:this.sessionPassword,peerId:this.getMyPeerId(),peerName:this.config.get("username")||"Anonymous"},sender:this.getMyPeerId(),timestamp:Date.now()}),o()}),this.clientSocket.on("message",c=>{this.handleMessage(c.toString())}),this.clientSocket.on("error",c=>{K.window.showErrorMessage(`Connection error: ${c.message}`),a(c)}),this.clientSocket.on("close",()=>{this.handleDisconnection()}),this.startHeartbeat()}catch(c){a(c)}})}handleNewConnection(e,t){let s=null;e.on("message",r=>{try{let n=JSON.parse(r.toString());if(n.type==="auth"){let{sessionId:o,password:a,peerId:c,peerName:l}=n.data;if(o!==this.sessionId){e.close(1008,"Invalid session ID");return}if(this.sessionPassword&&a!==this.sessionPassword){e.close(1008,"Invalid password");return}if(s=c,!s){e.close(1008,"Invalid peer ID");return}let d={id:s,name:l,socket:e};this.peers.set(s,d),this.onPeerConnectEmitter.fire(d),this.sendMessage(e,{type:"ydoc-state",data:Buffer.from(Gn(this.ydoc)).toString("base64"),sender:this.getMyPeerId(),timestamp:Date.now()}),K.window.showInformationMessage(`Peer connected: ${l}`)}else this.handleMessage(r.toString())}catch(n){console.error("Error handling message:",n)}}),e.on("close",()=>{s&&this.peers.has(s)&&(this.peers.delete(s),this.onPeerDisconnectEmitter.fire(s))}),e.on("error",r=>{console.error("Socket error:",r)})}handleMessage(e){try{let t=JSON.parse(e);if(this.config.get("enableEncryption"),t.type==="ydoc-update"&&t.sender!==this.getMyPeerId()){let r=Buffer.from(t.data,"base64");pr(this.ydoc,new Uint8Array(r))}if(t.type==="ydoc-state"){let r=Buffer.from(t.data,"base64");pr(this.ydoc,new Uint8Array(r))}let s=this.messageHandlers.get(t.type);s&&s.forEach(r=>r(t)),this.onMessageEmitter.fire(t)}catch(t){console.error("Error parsing message:",t)}}handleDisconnection(){K.window.showWarningMessage("Disconnected from session"),this.sessionId=null,this.peers.clear(),this.heartbeatInterval&&(clearInterval(this.heartbeatInterval),this.heartbeatInterval=null)}broadcastMessage(e){let t=JSON.stringify(e);this.isHost?this.peers.forEach(s=>{s.socket&&s.socket.readyState===Fe.default.OPEN&&s.socket.send(t)}):this.clientSocket&&this.clientSocket.readyState===Fe.default.OPEN&&this.clientSocket.send(t)}sendToPeer(e,t){let s=this.peers.get(e);return s&&s.socket&&s.socket.readyState===Fe.default.OPEN?(s.socket.send(JSON.stringify(t)),!0):!this.isHost&&this.clientSocket?.readyState===Fe.default.OPEN?(this.clientSocket.send(JSON.stringify(t)),!0):!1}sendMessage(e,t){e.readyState===Fe.default.OPEN&&e.send(JSON.stringify(t))}registerMessageHandler(e,t){this.messageHandlers.has(e)||this.messageHandlers.set(e,[]),this.messageHandlers.get(e).push(t)}unregisterMessageHandler(e,t){let s=this.messageHandlers.get(e);if(s){let r=s.indexOf(t);r>-1&&s.splice(r,1)}}async leaveSession(){this.heartbeatInterval&&(clearInterval(this.heartbeatInterval),this.heartbeatInterval=null),this.isHost&&this.server?(this.peers.forEach(e=>{e.socket&&e.socket.close()}),this.wss?.close(),this.server.close()):this.clientSocket&&this.clientSocket.close(),this.relaySocket&&this.relaySocket.close(),this.sessionId=null,this.peers.clear(),this.isHost=!1,this.wss=null,this.server=null,this.clientSocket=null,this.relaySocket=null,this.ydoc.destroy(),this.ydoc=new Ae,this.setupYjsHandlers()}getSessionId(){return this.sessionId}isInSession(){return this.sessionId!==null}isSessionHost(){return this.isHost}getPeers(){return Array.from(this.peers.values())}getMyPeerId(){let e=this.context.globalState.get("peerId");if(e)return e;let t=`peer-${Math.random().toString(36).substr(2,9)}`;return this.context.globalState.update("peerId",t),t}getYDoc(){return this.ydoc}setPassword(e){this.sessionPassword=e||null,this.broadcastMessage({type:"password-changed",data:{hasPassword:!!e},sender:this.getMyPeerId(),timestamp:Date.now()})}generateSessionId(){let e="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",t="LETS-";for(let s=0;s<4;s++)t+=e.charAt(Math.floor(Math.random()*e.length));t+="-";for(let s=0;s<4;s++)t+=e.charAt(Math.floor(Math.random()*e.length));return t}startHeartbeat(){this.heartbeatInterval&&clearInterval(this.heartbeatInterval),this.heartbeatInterval=setInterval(()=>{this.broadcastMessage({type:"ping",data:{},sender:this.getMyPeerId(),timestamp:Date.now()})},3e4)}getConnectionInfo(){if(!this.isHost||!this.server)return null;let e=this.server.address();return e?{ip:this.getLocalIp(),port:e.port}:null}getLocalIp(){let e=require("os").networkInterfaces();for(let t of Object.keys(e))for(let s of e[t])if(s.family==="IPv4"&&!s.internal)return s.address;return"127.0.0.1"}dispose(){this.leaveSession(),this.onMessageEmitter.dispose(),this.onPeerConnectEmitter.dispose(),this.onPeerDisconnectEmitter.dispose()}};var C=y(require("vscode")),si=class{constructor(e,t,s){this.context=e;this.p2pProvider=t;this.chatManager=s;this.sessionHistory=[];this.p2pProvider.onPeerConnect(()=>this.updateWebview()),this.p2pProvider.onPeerDisconnect(()=>this.updateWebview()),this.loadSessionHistory(),this.p2pProvider.onPeerConnect(()=>{this.sessionStartTime||(this.sessionStartTime=Date.now())})}static{this.viewType="letscode.sidebarView"}resolveWebviewView(e,t,s){this._view=e,e.webview.options={enableScripts:!0,localResourceRoots:[this.context.extensionUri]},e.webview.html=this.getHtmlForWebview(e.webview),e.webview.onDidReceiveMessage(async r=>{switch(r.command){case"createSession":await C.commands.executeCommand("letscode.createSession");break;case"joinSession":await C.commands.executeCommand("letscode.joinSession");break;case"leaveSession":await C.commands.executeCommand("letscode.leaveSession");break;case"copySessionId":await C.commands.executeCommand("letscode.copySessionId");break;case"sendMessage":await C.commands.executeCommand("letscode.sendChatMessage");break;case"openChat":await C.commands.executeCommand("letscode.openChat");break;case"openTaskBoard":await C.commands.executeCommand("letscode.openTaskBoard");break;case"openDashboard":await C.commands.executeCommand("letscode.openDashboard");break;case"syncFiles":await C.commands.executeCommand("letscode.syncFiles");break;case"openWhiteboard":await C.commands.executeCommand("letscode.openWhiteboard");break;case"shareTerminal":await C.commands.executeCommand("letscode.shareTerminal");break;case"shareCurrentFile":{let n=C.window.activeTextEditor;n?await C.commands.executeCommand("letscode.shareFile",n.document.uri):C.window.showWarningMessage("No file is currently open")}break;case"shareAllOpenFiles":{let n=C.window.tabGroups.all.flatMap(o=>o.tabs).filter(o=>o.input instanceof C.TabInputText).map(o=>o.input.uri);if(n.length>0){for(let o of n)await C.commands.executeCommand("letscode.shareFile",o);C.window.showInformationMessage(`Shared ${n.length} files`)}else C.window.showWarningMessage("No files are currently open")}break;case"shareSpecificFile":{let n=C.Uri.file(r.filePath);await C.commands.executeCommand("letscode.shareFile",n)}break;case"shareCodeSnippet":await this.chatManager.sendMessage(`\`\`\`
${r.code}
\`\`\``,"text"),C.window.showInformationMessage("Code snippet shared!");break;case"shareConnectionInfo":{let n=this.p2pProvider.getSessionId(),o=this.p2pProvider.getConnectionInfo(),a=`Join my Let's Code session!

Session ID: ${n}
IP: ${o?.ip||"N/A"}
Port: ${o?.port||"N/A"}

Install Let's Code extension and click "Join Session"`;await C.env.clipboard.writeText(a),C.window.showInformationMessage("Connection details copied! Share with your team.")}break;case"requestActiveFiles":{let n=C.window.tabGroups.all.flatMap(o=>o.tabs).filter(o=>o.input instanceof C.TabInputText).map(o=>{let a=o.input;return{name:a.uri.path.split("/").pop()||"unknown",path:a.uri.fsPath}});e.webview.postMessage({type:"activeFiles",files:n})}break}})}updateWebview(){this._view&&(this._view.webview.html=this.getHtmlForWebview(this._view.webview))}getHtmlForWebview(e){let t=this.p2pProvider.getSessionId(),s=this.p2pProvider.isSessionHost(),r=this.p2pProvider.getPeers(),n=this.p2pProvider.getConnectionInfo(),o=this.sessionHistory.slice(-5).reverse();return`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Let's Code</title>
    <style>
        :root {
            --primary: #f02882;
            --primary-hover: #d01a6e;
            --bg-primary: #4a4547;
            --bg-secondary: #424242;
            --bg-tertiary: #3a3537;
            --text-primary: #ffffff;
            --text-secondary: #949494;
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 16px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h1 {
            font-size: 18px;
            font-weight: 600;
            background: linear-gradient(135deg, #f02882, #d01a6e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 4px;
        }

        .header p {
            font-size: 12px;
            color: var(--text-secondary);
        }

        .status {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 16px;
            border: 1px solid rgba(255,255,255,0.05);
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${t?"#10b981":"#949494"};
            animation: ${t?"pulse 2s infinite":"none"};
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .status-text {
            font-size: 13px;
            font-weight: 500;
            color: #ffffff;
        }

        .session-id {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: var(--text-secondary);
            background: var(--bg-tertiary);
            padding: 4px 8px;
            border-radius: 6px;
            display: inline-block;
        }

        .connection-card {
            background: linear-gradient(135deg, rgba(240, 40, 130, 0.15), rgba(66, 66, 66, 0.8));
            border: 2px solid #f02882;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            box-shadow: 0 4px 20px rgba(240, 40, 130, 0.2);
        }

        .connection-card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            font-size: 13px;
            font-weight: 600;
            color: #f02882;
            text-shadow: 0 0 10px rgba(240, 40, 130, 0.3);
        }

        .connection-card-header .live-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--success);
            animation: pulse 2s infinite;
        }

        .connection-id-box {
            background: #424242;
            border: 2px solid #f02882;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: 600;
            color: #ffffff;
            word-break: break-all;
            text-align: center;
            letter-spacing: 0.5px;
            box-shadow: 0 0 15px rgba(240, 40, 130, 0.15);
        }

        .connection-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 12px;
        }

        .connection-detail-item {
            background: #424242;
            padding: 8px 10px;
            border-radius: 6px;
            font-size: 11px;
            border: 1px solid #949494;
        }

        .connection-detail-label {
            color: #949494;
            font-size: 10px;
            margin-bottom: 2px;
        }

        .connection-detail-value {
            color: #ffffff;
            font-weight: 500;
        }

        .connection-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }

        .btn-copy {
            background: #424242;
            color: #ffffff;
            border: 1px solid #949494;
        }

        .btn-copy:hover {
            background: #f02882;
            border-color: #f02882;
        }

        .btn-share {
            background: linear-gradient(135deg, #f02882, #d01a6e);
            color: white;
            font-weight: 600;
        }

        .btn-share:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(240, 40, 130, 0.4);
        }

        .btn-small {
            padding: 8px 12px;
            font-size: 12px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
        }

        .btn {
            width: 100%;
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #f02882, #d01a6e);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(240, 40, 130, 0.4);
        }

        .btn-secondary {
            background: #424242;
            color: #ffffff;
            border: 1px solid #949494;
        }

        .btn-secondary:hover {
            background: #f02882;
            border-color: #f02882;
        }

        .btn-danger {
            background: rgba(240, 40, 130, 0.2);
            color: #f02882;
            border: 1px solid rgba(240, 40, 130, 0.5);
        }

        .btn-danger:hover {
            background: #f02882;
            color: white;
        }

        .section {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid rgba(255,255,255,0.05);
        }

        .section-title {
            font-size: 11px;
            font-weight: 600;
            color: #f02882;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .peers-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .peer-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            background: #424242;
            border-radius: 6px;
            font-size: 12px;
            border: 1px solid #949494;
        }

        .peer-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #f02882, #d01a6e);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 600;
            color: white;
        }

        .peer-status {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #f02882;
            margin-left: auto;
            box-shadow: 0 0 8px rgba(240, 40, 130, 0.6);
        }

        .history-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .history-item {
            background: #424242;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 6px;
            font-size: 12px;
            border: 1px solid #949494;
        }

        .history-item:hover {
            border-color: #f02882;
        }

        .history-id {
            font-family: monospace;
            color: #f02882;
            font-size: 11px;
            margin-bottom: 4px;
            font-weight: 600;
        }

        .history-meta {
            color: #949494;
            font-size: 10px;
        }

        .files-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
            max-height: 150px;
            overflow-y: auto;
        }

        .file-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            background: #424242;
            border-radius: 6px;
            font-size: 12px;
            margin-bottom: 4px;
            border: 1px solid #949494;
        }

        .file-item:hover {
            border-color: #f02882;
        }

        .file-icon {
            font-size: 14px;
        }

        .file-name {
            flex: 1;
            color: #ffffff;
        }

        .file-share-btn {
            background: linear-gradient(135deg, #f02882, #d01a6e);
            color: white;
            border: none;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .file-share-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(240, 40, 130, 0.4);
        }

        .code-input {
            width: 100%;
            min-height: 80px;
            padding: 10px;
            background: #424242;
            border: 1px solid #949494;
            border-radius: 8px;
            color: #ffffff;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        }

        .code-input:focus {
            border-color: #f02882;
            outline: none;
            box-shadow: 0 0 8px rgba(240, 40, 130, 0.3);
        }

        .connection-info {
            font-size: 11px;
            color: #949494;
            margin-top: 8px;
        }

        .icon::before {
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>\u{1F680} Let's Code</h1>
        <p>P2P Collaborative Coding</p>
    </div>

    ${t?`
    
    <!-- Connection Card - Prominent Display -->
    <div class="connection-card">
        <div class="connection-card-header">
            <div class="live-indicator"></div>
            <span>${s?"\u{1F525} Hosting Session":"\u{1F517} Connected to Session"}</span>
        </div>
        
        <div class="connection-id-box" id="sessionIdBox">
            ${t}
        </div>
        
        <div class="connection-details">
            <div class="connection-detail-item">
                <div class="connection-detail-label">IP Address</div>
                <div class="connection-detail-value">${n?n.ip:"Detecting..."}</div>
            </div>
            <div class="connection-detail-item">
                <div class="connection-detail-label">Port</div>
                <div class="connection-detail-value">${n?n.port:"---"}</div>
            </div>
            <div class="connection-detail-item">
                <div class="connection-detail-label">Peers</div>
                <div class="connection-detail-value">${r.length} online</div>
            </div>
            <div class="connection-detail-item">
                <div class="connection-detail-label">Your Node</div>
                <div class="connection-detail-value">${this.p2pProvider.getMyNodeId().substr(0,8)}</div>
            </div>
        </div>
        
        <div class="connection-actions">
            <button class="btn-small btn-copy" onclick="copySessionId()" title="Copy Session ID to clipboard">
                \uFFFD Copy ID
            </button>
            <button class="btn-small btn-share" onclick="shareConnectionInfo()" title="Share connection details">
                \uFFFD Share
            </button>
        </div>
    </div>
    
    <button class="btn btn-secondary" onclick="shareCurrentFile()">
        \u{1F4C4} Share Current File
    </button>
    <button class="btn btn-secondary" onclick="shareAllOpenFiles()">
        \uFFFD Share All Open Files
    </button>
    <button class="btn btn-secondary" onclick="syncFiles()">
        \uFFFD\uFFFD Sync Files
    </button>
    <button class="btn btn-secondary" onclick="openChat()">
        \u{1F4AC} Open Chat
    </button>
    <button class="btn btn-secondary" onclick="openTaskBoard()">
        \u{1F4CB} Task Board
    </button>
    <button class="btn btn-secondary" onclick="openDashboard()">
        \u{1F4CA} Dashboard
    </button>
    <button class="btn btn-secondary" onclick="openWhiteboard()">
        \u{1F3A8} Whiteboard
    </button>
    <button class="btn btn-secondary" onclick="shareTerminal()">
        \u{1F4BB} Share Terminal
    </button>
    <button class="btn btn-danger" onclick="leaveSession()">
        \u274C Leave Session
    </button>

    <div class="section">
        <div class="section-title">Session History (${this.sessionHistory.length} sessions)</div>
        <div class="history-list">
            ${o.length===0?'<div style="color: var(--text-secondary); font-size: 12px; text-align: center;">No previous sessions</div>':""}
            ${o.map(a=>`
                <div class="history-item">
                    <div class="history-id">${a.sessionId.substr(0,12)}...</div>
                    <div class="history-meta">${new Date(a.timestamp).toLocaleDateString()} \u2022 ${a.peers.length} peers \u2022 ${Math.round(a.duration/6e4)}m</div>
                </div>
            `).join("")}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Active Files to Share</div>
        <div class="files-list" id="activeFilesList">
            <div style="color: var(--text-secondary); font-size: 12px; text-align: center;">Loading files...</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Code Snippet</div>
        <textarea id="codeSnippet" class="code-input" placeholder="Paste or type code to share..."></textarea>
        <button class="btn btn-secondary" style="margin-top: 8px;" onclick="shareCodeSnippet()">
            \u{1F4E4} Share Code
        </button>
    </div>

    <div class="section">
        <div class="section-title">Connected Peers (${r.length})</div>
        <div class="peers-list">
            ${r.length===0?'<div style="color: var(--text-secondary); font-size: 12px; text-align: center;">No peers connected</div>':""}
            ${r.map(a=>`
                <div class="peer-item">
                    <div class="peer-avatar">${(a.name||a.id).charAt(0).toUpperCase()}</div>
                    <span class="peer-name">${a.name||a.id}</span>
                    <div class="peer-status"></div>
                </div>
            `).join("")}
        </div>
    </div>
    `:`
    <div class="status" style="margin-bottom: 16px;">
        <div class="status-indicator">
            <div class="status-dot" style="background: var(--text-secondary); animation: none;"></div>
            <span class="status-text">Not Connected</span>
        </div>
    </div>
    
    <button class="btn btn-primary" onclick="createSession()">
        \u26A1 Create New Session
    </button>
    <button class="btn btn-secondary" onclick="joinSession()">
        \u{1F517} Join Existing Session
    </button>
    `}

    <script>
        const vscode = acquireVsCodeApi();

        function createSession() {
            vscode.postMessage({ command: 'createSession' });
        }

        function joinSession() {
            vscode.postMessage({ command: 'joinSession' });
        }

        function leaveSession() {
            vscode.postMessage({ command: 'leaveSession' });
        }

        function copySessionId() {
            vscode.postMessage({ command: 'copySessionId' });
        }

        function shareConnectionInfo() {
            vscode.postMessage({ command: 'shareConnectionInfo' });
        }

        function sendMessage() {
            vscode.postMessage({ command: 'sendMessage' });
        }

        function openChat() {
            vscode.postMessage({ command: 'openChat' });
        }

        function openTaskBoard() {
            vscode.postMessage({ command: 'openTaskBoard' });
        }

        function openDashboard() {
            vscode.postMessage({ command: 'openDashboard' });
        }

        function syncFiles() {
            vscode.postMessage({ command: 'syncFiles' });
        }

        function shareCurrentFile() {
            vscode.postMessage({ command: 'shareCurrentFile' });
        }

        function shareAllOpenFiles() {
            vscode.postMessage({ command: 'shareAllOpenFiles' });
        }

        function shareCodeSnippet() {
            const code = document.getElementById('codeSnippet').value;
            if (code.trim()) {
                vscode.postMessage({ command: 'shareCodeSnippet', code: code });
                document.getElementById('codeSnippet').value = '';
            }
        }

        // Update active files list
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'activeFiles') {
                const container = document.getElementById('activeFilesList');
                if (message.files.length === 0) {
                    container.innerHTML = '<div style="color: var(--text-secondary); font-size: 12px; text-align: center;">No files open</div>';
                } else {
                    var html = '';
                    for (var i = 0; i < message.files.length; i++) {
                        var f = message.files[i];
                        html += '<div class="file-item">' +
                            '<span class="file-icon">\u{1F4C4}</span>' +
                            '<span class="file-name">' + f.name + '</span>' +
                            '<button class="file-share-btn" onclick="shareSpecificFile('' + f.path + '')">Share</button>' +
                        '</div>';
                    }
                    container.innerHTML = html;
                }
            }
        });

        function shareSpecificFile(filePath) {
            vscode.postMessage({ command: 'shareSpecificFile', filePath: filePath });
        }

        // Request active files on load
        vscode.postMessage({ command: 'requestActiveFiles' });

        function openWhiteboard() {
            vscode.postMessage({ command: 'openWhiteboard' });
        }

        function shareTerminal() {
            vscode.postMessage({ command: 'shareTerminal' });
        }
    </script>
</body>
</html>`}loadSessionHistory(){try{let e=this.context.globalState.get("sessionHistory",[]);this.sessionHistory=e}catch(e){console.error("Failed to load session history:",e)}}saveSessionHistory(){try{this.context.globalState.update("sessionHistory",this.sessionHistory)}catch(e){console.error("Failed to save session history:",e)}}addToHistory(e,t){if(!this.sessionStartTime)return;let s=Date.now()-this.sessionStartTime,r={sessionId:e,timestamp:Date.now(),peers:t,filesSynced:0,duration:s};this.sessionHistory.push(r),this.sessionHistory.length>20&&(this.sessionHistory=this.sessionHistory.slice(-20)),this.saveSessionHistory()}dispose(){let e=this.p2pProvider.getSessionId();e&&this.sessionStartTime&&this.addToHistory(e,this.p2pProvider.getPeers().map(t=>t.id))}};var Ce=y(require("vscode"));var ii=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.ytextMap=new Map;this.editHistory=new Map;this.showHistory=!1;this.localUpdate=!1;this.decorationType=Ce.window.createTextEditorDecorationType({backgroundColor:"rgba(99, 102, 241, 0.2)",borderRadius:"2px"}),this.p2pProvider.registerMessageHandler("document-change",s=>{this.handleRemoteChange(s)}),this.p2pProvider.registerMessageHandler("ydoc-update",()=>{this.applyYjsUpdates()})}handleLocalChange(e){if(this.localUpdate)return;let t=e.document.uri.toString(),s=this.getOrCreateYText(t);e.contentChanges.forEach(r=>{let n=r.rangeOffset,o=r.rangeLength;o>0&&s.delete(n,o),r.text&&s.insert(n,r.text)}),this.trackEdit(t,e),this.p2pProvider.broadcastMessage({type:"document-change",data:{uri:t,changes:e.contentChanges.map(r=>({range:r.range,text:r.text,rangeOffset:r.rangeOffset,rangeLength:r.rangeLength}))},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}handleRemoteChange(e){let{uri:t,changes:s}=e.data,r=Ce.window.visibleTextEditors.find(n=>n.document.uri.toString()===t);r&&(this.localUpdate=!0,r.edit(n=>{s.forEach(o=>{let a=new Ce.Range(o.range.start.line,o.range.start.character,o.range.end.line,o.range.end.character);n.replace(a,o.text)})}).then(()=>{this.localUpdate=!1,this.showEditDecorations(r,s,e.sender)}))}syncDocument(e){if(!this.p2pProvider.isInSession())return;let t=e.uri.toString(),s=this.getOrCreateYText(t);this.p2pProvider.broadcastMessage({type:"request-document",data:{uri:t},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}getOrCreateYText(e){if(!this.ytextMap.has(e)){let t=new Qe;this.ytextMap.set(e,t),this.p2pProvider.getYDoc().getMap("documents").set(e,t)}return this.ytextMap.get(e)}applyYjsUpdates(){}trackEdit(e,t){this.editHistory.has(e)||this.editHistory.set(e,[]);let s=this.editHistory.get(e);s.push({timestamp:Date.now(),changes:t.contentChanges,peerId:this.p2pProvider.getMyPeerId()}),s.length>100&&s.shift()}toggleEditHistory(){this.showHistory=!this.showHistory,this.showHistory?Ce.window.showInformationMessage("Edit history enabled"):(Ce.window.showInformationMessage("Edit history disabled"),Ce.window.visibleTextEditors.forEach(e=>{e.setDecorations(this.decorationType,[])}))}showEditDecorations(e,t,s){if(!this.showHistory)return;let r=t.map(n=>({range:new Ce.Range(n.range.start.line,n.range.start.character,n.range.end.line,n.range.end.character),hoverMessage:`Edited by ${s}`}));e.setDecorations(this.decorationType,r),setTimeout(()=>{e.setDecorations(this.decorationType,[])},3e3)}getEditHistory(e){return this.editHistory.get(e)||[]}dispose(){this.decorationType.dispose()}};var $e=y(require("vscode")),ri=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.messages=[];this.onMessageReceived=new $e.EventEmitter;this.onMessage=this.onMessageReceived.event;this.maxMessages=100;this.p2pProvider.registerMessageHandler("chat",s=>{this.handleIncomingMessage(s)}),this.p2pProvider.registerMessageHandler("system",s=>{this.handleSystemMessage(s)}),this.p2pProvider.onPeerConnect(s=>{this.addSystemMessage(`${s.name} joined the session`)}),this.p2pProvider.onPeerDisconnect(s=>{let o=this.p2pProvider.getPeers().find(a=>a.id===s)?.name||"Unknown";this.addSystemMessage(`${o} left the session`)})}sendMessage(e,t="text"){let r=$e.workspace.getConfiguration("letscode").get("username")||"Anonymous",n={id:this.generateId(),text:e,sender:this.p2pProvider.getMyPeerId(),senderName:r,timestamp:Date.now(),type:t};this.messages.push(n),this.trimMessages(),this.p2pProvider.broadcastMessage({type:"chat",data:n,sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),this.onMessageReceived.fire(n)}sendFileMessage(e,t){this.p2pProvider.broadcastMessage({type:"file-share",data:{fileName:e,fileData:t},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),this.sendMessage(`Shared file: ${e}`,"file")}handleIncomingMessage(e){let t=e.data;t.senderName=t.senderName||`Peer ${t.sender.substr(0,6)}`,this.messages.push(t),this.trimMessages(),this.onMessageReceived.fire(t),t.type==="text"&&$e.window.showInformationMessage(`${t.senderName}: ${t.text.substring(0,50)}${t.text.length>50?"...":""}`,"Reply").then(s=>{s==="Reply"&&$e.commands.executeCommand("letscode.sendChatMessage")})}handleSystemMessage(e){let t={id:this.generateId(),text:e.data.text,sender:"system",senderName:"System",timestamp:Date.now(),type:"system"};this.messages.push(t),this.onMessageReceived.fire(t)}addSystemMessage(e){let t={id:this.generateId(),text:e,sender:"system",senderName:"System",timestamp:Date.now(),type:"system"};this.messages.push(t),this.trimMessages(),this.onMessageReceived.fire(t),this.p2pProvider.broadcastMessage({type:"system",data:{text:e},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}getMessages(){return[...this.messages]}clearHistory(){this.messages=[]}trimMessages(){this.messages.length>this.maxMessages&&(this.messages=this.messages.slice(-this.maxMessages))}generateId(){return`msg-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}dispose(){this.onMessageReceived.dispose()}};var D=y(require("vscode")),ni=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.cursors=new Map;this.decorationTypes=new Map;this.followingPeerId=null;this.onCursorUpdate=new D.EventEmitter;this.updateThrottle=new Map;this.THROTTLE_MS=50;this.cursorColors=["#ef4444","#f97316","#f59e0b","#84cc16","#10b981","#06b6d4","#3b82f6","#6366f1","#8b5cf6","#ec4899"];this.p2pProvider.registerMessageHandler("cursor-update",s=>{this.handleRemoteCursorUpdate(s)}),setInterval(()=>{this.p2pProvider.isInSession()&&this.broadcastCursorPosition()},100)}updateCursorPosition(e){if(!this.p2pProvider.isInSession())return;let t=Date.now(),s=this.updateThrottle.get("local")||0;if(t-s<this.THROTTLE_MS)return;this.updateThrottle.set("local",t);let r=e.textEditor,n=e.selections[0].active,o=e.selections[0].isEmpty?null:e.selections[0];this.p2pProvider.broadcastMessage({type:"cursor-update",data:{uri:r.document.uri.toString(),position:{line:n.line,character:n.character},selection:o?{start:{line:o.start.line,character:o.start.character},end:{line:o.end.line,character:o.end.character}}:null},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}handleRemoteCursorUpdate(e){let{uri:t,position:s,selection:r}=e.data,n=e.sender,a=this.p2pProvider.getPeers().find(l=>l.id===n),c={peerId:n,peerName:a?.name||`Peer ${n.substr(0,6)}`,uri:t,position:new D.Position(s.line,s.character),selection:r?new D.Range(r.start.line,r.start.character,r.end.line,r.end.character):null,color:this.getPeerColor(n)};this.cursors.set(n,c),this.onCursorUpdate.fire(c),this.updateCursorDecorations(c),this.followingPeerId===n&&this.jumpToCursor(c)}updateCursorDecorations(e){let t=D.window.visibleTextEditors.find(o=>o.document.uri.toString()===e.uri);if(!t)return;if(!this.decorationTypes.has(e.peerId)){let o=D.window.createTextEditorDecorationType({backgroundColor:`${e.color}40`,border:`2px solid ${e.color}`,overviewRulerColor:e.color,overviewRulerLane:D.OverviewRulerLane.Right});this.decorationTypes.set(e.peerId,o)}let s=this.decorationTypes.get(e.peerId),r=[],n=new D.Range(e.position,e.position.translate(0,1));r.push({range:n,hoverMessage:`${e.peerName}'s cursor`}),e.selection&&r.push({range:e.selection,hoverMessage:`${e.peerName}'s selection`}),t.setDecorations(s,r)}jumpToCursor(e){D.workspace.openTextDocument(D.Uri.parse(e.uri)).then(t=>D.window.showTextDocument(t)).then(t=>{t.revealRange(new D.Range(e.position,e.position),D.TextEditorRevealType.InCenter)})}startFollowing(e){this.followingPeerId=e;let s=this.p2pProvider.getPeers().find(n=>n.id===e);D.window.showInformationMessage(`Now following ${s?.name||e}`);let r=this.cursors.get(e);r&&this.jumpToCursor(r)}stopFollowing(){if(this.followingPeerId){let t=this.p2pProvider.getPeers().find(s=>s.id===this.followingPeerId);D.window.showInformationMessage(`Stopped following ${t?.name||this.followingPeerId}`)}this.followingPeerId=null}broadcastCursorPosition(){let e=D.window.activeTextEditor;if(!e)return;let t=e.selection.active,s=e.selection.isEmpty?null:{start:{line:e.selection.start.line,character:e.selection.start.character},end:{line:e.selection.end.line,character:e.selection.end.character}};this.p2pProvider.broadcastMessage({type:"cursor-update",data:{uri:e.document.uri.toString(),position:{line:t.line,character:t.character},selection:s},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}getPeerColor(e){let t=0;for(let r=0;r<e.length;r++)t=e.charCodeAt(r)+((t<<5)-t);let s=Math.abs(t)%this.cursorColors.length;return this.cursorColors[s]}getCursors(){return Array.from(this.cursors.values())}dispose(){this.onCursorUpdate.dispose(),this.decorationTypes.forEach(e=>e.dispose())}};var B=y(require("vscode")),oi=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.isSharing=!1;this.sharedTerminal=null;this.commandHistory=[];this.pendingCommands=new Map;this.autoExecuteCommands=!1;this.broadcastMode=!1;this.outputChannel=B.window.createOutputChannel("Let's Code - Shared Terminal"),this.statusBarItem=B.window.createStatusBarItem(B.StatusBarAlignment.Right,97),this.statusBarItem.text="$(terminal) Terminal",this.statusBarItem.tooltip="Terminal Sharing",this.statusBarItem.command="letscode.toggleTerminalBroadcast",this.statusBarItem.show(),t.subscriptions.push(this.statusBarItem),this.p2pProvider.registerMessageHandler("terminal-output",s=>{this.handleTerminalOutput(s)}),this.p2pProvider.registerMessageHandler("terminal-command",s=>{this.handleTerminalCommand(s)}),this.p2pProvider.registerMessageHandler("execute-command",s=>{this.handleExecuteCommand(s)}),this.p2pProvider.registerMessageHandler("command-status",s=>{this.handleCommandStatus(s)}),B.window.onDidOpenTerminal(s=>{this.isSharing&&this.p2pProvider.isInSession()&&this.p2pProvider.broadcastMessage({type:"system",data:{text:`Terminal opened: ${s.name}`},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})})}startSharing(){B.window.showInformationMessage("Terminal sharing enabled"),this.outputChannel.show(!0),this.outputChannel.appendLine("=== Terminal Sharing Started ==="),this.outputChannel.appendLine(`All terminal output will be shared with peers.
`),this.p2pProvider.broadcastMessage({type:"terminal-sharing-started",data:{},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}stopSharing(){B.window.showInformationMessage("Terminal sharing disabled"),this.outputChannel.appendLine(`
=== Terminal Sharing Stopped ===`),this.p2pProvider.broadcastMessage({type:"terminal-sharing-stopped",data:{},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}shareOutput(e){!this.isSharing||!this.p2pProvider.isInSession()||(this.p2pProvider.broadcastMessage({type:"terminal-output",data:{output:e},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),this.outputChannel.append(e))}shareCommand(e){!this.isSharing||!this.p2pProvider.isInSession()||(this.p2pProvider.broadcastMessage({type:"terminal-command",data:{command:e},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),this.outputChannel.appendLine(`$ ${e}`))}handleTerminalOutput(e){let{output:t}=e.data,n=this.p2pProvider.getPeers().find(o=>o.id===e.sender)?.name||`Peer ${e.sender.substr(0,6)}`;this.outputChannel.appendLine(`[${n}] Output:`),this.outputChannel.appendLine(t),this.outputChannel.appendLine(""),this.outputChannel}async handleTerminalCommand(e){let{command:t}=e.data,n=this.p2pProvider.getPeers().find(o=>o.id===e.sender)?.name||`Peer ${e.sender.substr(0,6)}`;if(this.outputChannel.appendLine(`[${n}] $ ${t}`),this.autoExecuteCommands)await this.executeCommand(t,e.sender);else{let o=await B.window.showInformationMessage(`${n} wants to run: "${t}"`,"Execute Now","Execute on All","Dismiss");o==="Execute Now"?await this.executeCommand(t,e.sender):o==="Execute on All"&&await this.broadcastAndExecute(t)}}async handleExecuteCommand(e){let{commandId:t,command:s,sender:r}=e.data,n=await B.window.showWarningMessage(`Peer wants to execute: "${s}" on your device`,"Allow","Allow Always","Deny");if(n==="Allow"||n==="Allow Always"){n==="Allow Always"&&(this.autoExecuteCommands=!0);let o={commandId:t,command:s,sender:r,timestamp:Date.now(),status:"executing",executedOn:[this.p2pProvider.getMyPeerId()]};try{let a=B.window.activeTerminal||B.window.createTerminal("Shared Command");a.show(),a.sendText(s),o.status="completed",o.output=`Command executed: ${s}`,this.outputChannel.appendLine(`[Me] Executed: ${s}`),this.p2pProvider.sendToPeer(r,{type:"command-status",data:{commandId:t,status:"completed",peerId:this.p2pProvider.getMyPeerId()},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}catch(a){o.status="failed",o.error=String(a),this.p2pProvider.sendToPeer(r,{type:"command-status",data:{commandId:t,status:"failed",error:String(a),peerId:this.p2pProvider.getMyPeerId()},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}this.commandHistory.push(o)}else this.p2pProvider.sendToPeer(r,{type:"command-status",data:{commandId:t,status:"failed",error:"User denied execution",peerId:this.p2pProvider.getMyPeerId()},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}handleCommandStatus(e){let{commandId:t,status:s,error:r,peerId:n}=e.data,c=this.p2pProvider.getPeers().find(d=>d.id===n)?.name||`Peer ${n.substr(0,6)}`,l=this.pendingCommands.get(t);if(l){l.executedOn.push(n),s==="completed"?this.outputChannel.appendLine(`[${c}] \u2713 Executed successfully`):this.outputChannel.appendLine(`[${c}] \u2717 Failed: ${r||"Unknown error"}`);let d=this.p2pProvider.getPeers().length+1;l.executedOn.length>=d&&(l.status="completed",this.pendingCommands.delete(t),B.window.showInformationMessage(`Command executed on ${l.executedOn.length} devices`,"View Output").then(h=>{h==="View Output"&&this.outputChannel.show()}))}}async executeCommand(e,t){let s=B.window.activeTerminal||B.window.createTerminal("Shared");s.show(),s.sendText(e),this.outputChannel.appendLine(`[Me] $ ${e}`)}async broadcastAndExecute(e){if(!this.p2pProvider.isInSession()){B.window.showWarningMessage("Not in a collaboration session");return}let t=`cmd_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,s={commandId:t,command:e,sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now(),status:"pending",executedOn:[]};this.pendingCommands.set(t,s),this.commandHistory.push(s),await this.executeCommand(e),s.executedOn.push(this.p2pProvider.getMyPeerId()),this.p2pProvider.broadcastMessage({type:"execute-command",data:{commandId:t,command:e,sender:this.p2pProvider.getMyPeerId()},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),this.outputChannel.appendLine(`Broadcasting command to all peers: ${e}`),B.window.withProgress({location:B.ProgressLocation.Notification,title:`Executing "${e}" on all devices...`,cancellable:!1},async r=>{let n=this.p2pProvider.getPeers().length+1,o=setInterval(()=>{let a=s.executedOn.length;r.report({increment:100/n,message:`${a}/${n} devices`}),a>=n&&clearInterval(o)},500);await new Promise(a=>setTimeout(a,3e4)),clearInterval(o)})}toggleSharing(){this.isSharing=!this.isSharing,this.isSharing?this.startSharing():this.stopSharing(),this.updateStatusBar()}toggleBroadcastMode(){this.broadcastMode=!this.broadcastMode,B.window.showInformationMessage(`Broadcast mode ${this.broadcastMode?"enabled":"disabled"}. Commands will ${this.broadcastMode?"now":"not"} be sent to all peers.`),this.updateStatusBar()}updateStatusBar(){this.isSharing&&this.broadcastMode?(this.statusBarItem.text="$(terminal) Terminal: ON + Broadcast",this.statusBarItem.backgroundColor=new B.ThemeColor("statusBarItem.prominentBackground")):this.isSharing?(this.statusBarItem.text="$(terminal) Terminal: ON",this.statusBarItem.backgroundColor=void 0):(this.statusBarItem.text="$(terminal) Terminal: OFF",this.statusBarItem.backgroundColor=void 0)}isCurrentlySharing(){return this.isSharing}getCommandHistory(){return this.commandHistory}dispose(){this.outputChannel.dispose(),this.statusBarItem.dispose()}};var _e=y(require("vscode")),ai=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.tasks=new Map;this.onTasksChanged=new _e.EventEmitter;this.ytasks=this.p2pProvider.getYDoc().getMap("tasks"),this.ytasks.observe(()=>{this.syncFromYjs()}),this.p2pProvider.registerMessageHandler("task-update",s=>{this.handleTaskUpdate(s)}),this.p2pProvider.registerMessageHandler("task-delete",s=>{this.handleTaskDelete(s)})}show(){if(this.panel){this.panel.reveal(_e.ViewColumn.Beside);return}this.panel=_e.window.createWebviewPanel("letscodeTaskBoard","Task Board",_e.ViewColumn.Beside,{enableScripts:!0,retainContextWhenHidden:!0}),this.panel.webview.html=this.getHtmlForWebview(),this.panel.webview.onDidReceiveMessage(e=>{switch(e.command){case"addTask":this.addTask(e.data);break;case"updateTask":this.updateTask(e.data);break;case"deleteTask":this.deleteTask(e.data.id);break;case"moveTask":this.moveTask(e.data.id,e.data.status);break;case"getTasks":this.sendTasksToWebview();break}}),this.panel.onDidDispose(()=>{this.panel=void 0})}addTask(e){let s=_e.workspace.getConfiguration("letscode").get("username")||"Anonymous",r={id:`task-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,title:e.title||"Untitled Task",description:e.description||"",status:e.status||"todo",priority:e.priority||"medium",assignee:e.assignee||s,createdBy:s,createdAt:Date.now(),updatedAt:Date.now()};this.tasks.set(r.id,r),this.ytasks.set(r.id,JSON.parse(JSON.stringify(r))),this.broadcastTaskUpdate(r),this.sendTasksToWebview()}updateTask(e){let t=this.tasks.get(e.id);if(!t)return;let s={...t,...e,updatedAt:Date.now()};this.tasks.set(s.id,s),this.ytasks.set(s.id,JSON.parse(JSON.stringify(s))),this.broadcastTaskUpdate(s),this.sendTasksToWebview()}deleteTask(e){this.tasks.delete(e),this.ytasks.delete(e),this.p2pProvider.broadcastMessage({type:"task-delete",data:{id:e},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),this.sendTasksToWebview()}moveTask(e,t){let s=this.tasks.get(e);s&&(s.status=t,s.updatedAt=Date.now(),this.tasks.set(e,s),this.ytasks.set(e,JSON.parse(JSON.stringify(s))),this.broadcastTaskUpdate(s),this.sendTasksToWebview())}broadcastTaskUpdate(e){this.p2pProvider.broadcastMessage({type:"task-update",data:e,sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}handleTaskUpdate(e){let t=e.data;this.tasks.set(t.id,t),this.sendTasksToWebview()}handleTaskDelete(e){let{id:t}=e.data;this.tasks.delete(t),this.sendTasksToWebview()}syncFromYjs(){this.ytasks.forEach((e,t)=>{this.tasks.set(t,e)}),this.sendTasksToWebview()}sendTasksToWebview(){this.panel&&this.panel.webview.postMessage({command:"updateTasks",data:Array.from(this.tasks.values())})}getTasks(){return Array.from(this.tasks.values())}getHtmlForWebview(){return`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Board</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            padding: 20px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        h1 { font-size: 20px; font-weight: 600; }
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
        }
        .board {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
        }
        .column {
            background: #1e293b;
            border-radius: 12px;
            padding: 12px;
        }
        .column-header {
            font-size: 14px;
            font-weight: 600;
            padding: 8px;
            margin-bottom: 12px;
            border-radius: 6px;
            text-align: center;
        }
        .todo .column-header { background: rgba(148, 163, 184, 0.2); color: #94a3b8; }
        .in-progress .column-header { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
        .done .column-header { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .task-card {
            background: #334155;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            cursor: grab;
            transition: transform 0.2s;
        }
        .task-card:hover { transform: translateY(-2px); }
        .task-title { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
        .task-meta {
            display: flex;
            gap: 8px;
            font-size: 11px;
            color: #94a3b8;
        }
        .priority-high { color: #ef4444; }
        .priority-medium { color: #f59e0b; }
        .priority-low { color: #10b981; }
        .assignee { display: flex; align-items: center; gap: 4px; }
        .modal {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8);
            justify-content: center;
            align-items: center;
            z-index: 100;
        }
        .modal.show { display: flex; }
        .modal-content {
            background: #1e293b;
            padding: 20px;
            border-radius: 12px;
            width: 400px;
        }
        .form-group { margin-bottom: 16px; }
        label { display: block; font-size: 12px; margin-bottom: 6px; color: #94a3b8; }
        input, textarea, select {
            width: 100%;
            padding: 10px;
            border: 1px solid #334155;
            border-radius: 6px;
            background: #0f172a;
            color: #f8fafc;
            font-size: 13px;
        }
        textarea { height: 80px; resize: vertical; }
        .modal-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
        .btn-secondary {
            background: #334155;
            color: #f8fafc;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>\u{1F4CB} Task Board</h1>
        <button class="btn" onclick="showAddModal()">+ Add Task</button>
    </div>

    <div class="board">
        <div class="column todo">
            <div class="column-header">To Do</div>
            <div id="todo-tasks"></div>
        </div>
        <div class="column in-progress">
            <div class="column-header">In Progress</div>
            <div id="inprogress-tasks"></div>
        </div>
        <div class="column done">
            <div class="column-header">Done</div>
            <div id="done-tasks"></div>
        </div>
    </div>

    <div class="modal" id="addModal">
        <div class="modal-content">
            <h2 style="margin-bottom: 16px;">Add New Task</h2>
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="taskTitle" placeholder="Enter task title">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="taskDesc" placeholder="Enter description"></textarea>
            </div>
            <div class="form-group">
                <label>Priority</label>
                <select id="taskPriority">
                    <option value="low">Low</option>
                    <option value="medium" selected>Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="hideModal()">Cancel</button>
                <button class="btn" onclick="addTask()">Add Task</button>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentTasks = [];

        // Request tasks on load
        vscode.postMessage({ command: 'getTasks' });

        // Listen for messages
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'updateTasks') {
                currentTasks = message.data;
                renderTasks();
            }
        });

        function renderTasks() {
            const todoContainer = document.getElementById('todo-tasks');
            const inprogressContainer = document.getElementById('inprogress-tasks');
            const doneContainer = document.getElementById('done-tasks');

            todoContainer.innerHTML = '';
            inprogressContainer.innerHTML = '';
            doneContainer.innerHTML = '';

            currentTasks.forEach(task => {
                const card = createTaskCard(task);
                if (task.status === 'todo') todoContainer.appendChild(card);
                else if (task.status === 'in-progress') inprogressContainer.appendChild(card);
                else if (task.status === 'done') doneContainer.appendChild(card);
            });
        }

        function createTaskCard(task) {
            const div = document.createElement('div');
            div.className = 'task-card';
            div.draggable = true;
            div.innerHTML = \`
                <div class="task-title">\${task.title}</div>
                <div class="task-meta">
                    <span class="priority-\${task.priority}">\${task.priority.toUpperCase()}</span>
                    <span>\u2022</span>
                    <span class="assignee">\u{1F464} \${task.assignee}</span>
                </div>
            \`;
            
            div.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('taskId', task.id);
            });

            div.addEventListener('dblclick', () => {
                if (confirm('Delete this task?')) {
                    vscode.postMessage({ command: 'deleteTask', data: { id: task.id } });
                }
            });

            return div;
        }

        // Drag and drop
        document.querySelectorAll('.column').forEach(column => {
            column.addEventListener('dragover', (e) => e.preventDefault());
            column.addEventListener('drop', (e) => {
                const taskId = e.dataTransfer.getData('taskId');
                const status = column.classList.contains('todo') ? 'todo' : 
                              column.classList.contains('in-progress') ? 'in-progress' : 'done';
                vscode.postMessage({ command: 'moveTask', data: { id: taskId, status } });
            });
        });

        function showAddModal() {
            document.getElementById('addModal').classList.add('show');
        }

        function hideModal() {
            document.getElementById('addModal').classList.remove('show');
        }

        function addTask() {
            const title = document.getElementById('taskTitle').value;
            const description = document.getElementById('taskDesc').value;
            const priority = document.getElementById('taskPriority').value;

            if (title) {
                vscode.postMessage({
                    command: 'addTask',
                    data: { title, description, priority, status: 'todo' }
                });
                hideModal();
                document.getElementById('taskTitle').value = '';
                document.getElementById('taskDesc').value = '';
            }
        }
    </script>
</body>
</html>`}dispose(){this.panel?.dispose(),this.onTasksChanged.dispose()}};var S=y(require("vscode")),ci=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.comments=new Map;this.onCommentsChanged=new S.EventEmitter;this.decorationType=S.window.createTextEditorDecorationType({gutterIconPath:this.context.asAbsolutePath("media/comment-icon.svg"),overviewRulerColor:"#6366f1",overviewRulerLane:S.OverviewRulerLane.Left}),this.resolvedDecorationType=S.window.createTextEditorDecorationType({gutterIconPath:this.context.asAbsolutePath("media/comment-resolved-icon.svg"),overviewRulerColor:"#10b981",overviewRulerLane:S.OverviewRulerLane.Left}),this.p2pProvider.registerMessageHandler("review-comment",s=>{this.handleRemoteComment(s)}),this.p2pProvider.registerMessageHandler("review-comment-reply",s=>{this.handleRemoteReply(s)}),this.p2pProvider.registerMessageHandler("review-comment-resolve",s=>{this.handleRemoteResolve(s)}),S.window.onDidChangeActiveTextEditor(()=>{this.updateDecorations()})}addComment(e,t,s){let n=S.workspace.getConfiguration("letscode").get("username")||"Anonymous",o={id:`comment-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,uri:e.toString(),line:t.start.line,text:s,author:this.p2pProvider.getMyPeerId(),authorName:n,timestamp:Date.now(),resolved:!1,replies:[]};this.comments.set(o.id,o),this.broadcastComment(o),this.updateDecorations(),this.showCommentThread(o),S.window.showInformationMessage("Review comment added")}replyToComment(e,t){let s=this.comments.get(e);if(!s)return;let n=S.workspace.getConfiguration("letscode").get("username")||"Anonymous",o={id:`reply-${Date.now()}`,text:t,author:this.p2pProvider.getMyPeerId(),authorName:n,timestamp:Date.now()};s.replies.push(o),this.comments.set(e,s),this.p2pProvider.broadcastMessage({type:"review-comment-reply",data:{commentId:e,reply:o},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),this.showCommentThread(s)}resolveComment(e){let t=this.comments.get(e);t&&(t.resolved=!0,this.comments.set(e,t),this.p2pProvider.broadcastMessage({type:"review-comment-resolve",data:{commentId:e},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),this.updateDecorations(),S.window.showInformationMessage("Comment resolved"))}broadcastComment(e){this.p2pProvider.broadcastMessage({type:"review-comment",data:e,sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}handleRemoteComment(e){let t=e.data;this.comments.set(t.id,t),this.updateDecorations();let r=this.p2pProvider.getPeers().find(n=>n.id===e.sender);S.window.showInformationMessage(`New review comment from ${r?.name||"a peer"}`)}handleRemoteReply(e){let{commentId:t,reply:s}=e.data,r=this.comments.get(t);if(r){r.replies.push(s),this.comments.set(t,r);let o=this.p2pProvider.getPeers().find(a=>a.id===e.sender);S.window.showInformationMessage(`New reply from ${o?.name||"a peer"} on your comment`)}}handleRemoteResolve(e){let{commentId:t}=e.data,s=this.comments.get(t);s&&(s.resolved=!0,this.comments.set(t,s),this.updateDecorations())}updateDecorations(){let e=S.window.activeTextEditor;if(!e)return;let t=e.document.uri.toString(),s=Array.from(this.comments.values()).filter(o=>o.uri===t),r=[],n=[];s.forEach(o=>{let a={range:new S.Range(o.line,0,o.line,0),hoverMessage:this.formatHoverMessage(o)};o.resolved?n.push(a):r.push(a)}),e.setDecorations(this.decorationType,r),e.setDecorations(this.resolvedDecorationType,n)}formatHoverMessage(e){let t=[`**${e.authorName}** \u2022 ${new Date(e.timestamp).toLocaleString()}`,"",e.text,""];e.replies.length>0&&(t.push("**Replies:**"),e.replies.forEach(r=>{t.push(`\u2022 ${r.authorName}: ${r.text}`)})),e.resolved&&t.push("","*\u2713 Resolved*");let s=new S.MarkdownString(t.join(`
`));return s.isTrusted=!0,s}async showCommentThread(e){let t=S.Uri.parse(e.uri),s=await S.workspace.openTextDocument(t),r=await S.window.showTextDocument(s),n=new S.Position(e.line,0);r.revealRange(new S.Range(n,n),S.TextEditorRevealType.InCenter);let o=["Reply","Resolve"],a=await S.window.showInformationMessage(`${e.authorName}: ${e.text.substring(0,100)}${e.text.length>100?"...":""}`,...o);if(a==="Reply"){let c=await S.window.showInputBox({prompt:"Enter your reply"});c&&this.replyToComment(e.id,c)}else a==="Resolve"&&this.resolveComment(e.id)}getComments(e){let t=Array.from(this.comments.values());return e?t.filter(s=>s.uri===e.toString()):t}getUnresolvedCount(){return Array.from(this.comments.values()).filter(e=>!e.resolved).length}dispose(){this.decorationType.dispose(),this.resolvedDecorationType.dispose(),this.onCommentsChanged.dispose()}};var ot=y(require("vscode")),li=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.strokes=[];this.onStrokesChanged=new ot.EventEmitter;this.p2pProvider.registerMessageHandler("whiteboard-stroke",s=>{this.handleRemoteStroke(s)}),this.p2pProvider.registerMessageHandler("whiteboard-clear",s=>{this.handleRemoteClear(s)})}show(){if(this.panel){this.panel.reveal(ot.ViewColumn.Beside);return}this.panel=ot.window.createWebviewPanel("letscodeWhiteboard","Shared Whiteboard",ot.ViewColumn.Beside,{enableScripts:!0,retainContextWhenHidden:!0}),this.panel.webview.html=this.getHtmlForWebview(),this.panel.webview.onDidReceiveMessage(e=>{switch(e.command){case"addStroke":this.addStroke(e.data);break;case"clear":this.clear();break;case"getStrokes":this.sendStrokesToWebview();break}}),this.panel.onDidDispose(()=>{this.panel=void 0}),this.sendStrokesToWebview()}addStroke(e){this.strokes.push(e),this.onStrokesChanged.fire(this.strokes),this.p2pProvider.broadcastMessage({type:"whiteboard-stroke",data:e,sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}clear(){this.strokes=[],this.onStrokesChanged.fire(this.strokes),this.p2pProvider.broadcastMessage({type:"whiteboard-clear",data:{},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),this.sendStrokesToWebview()}handleRemoteStroke(e){let t=e.data;this.strokes.push(t),this.panel&&this.panel.webview.postMessage({command:"addStroke",data:t})}handleRemoteClear(e){this.strokes=[],this.panel&&this.panel.webview.postMessage({command:"clear"})}sendStrokesToWebview(){this.panel&&this.panel.webview.postMessage({command:"loadStrokes",data:this.strokes})}getHtmlForWebview(){return`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shared Whiteboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .toolbar {
            display: flex;
            gap: 8px;
            padding: 12px;
            background: #1e293b;
            border-bottom: 1px solid #334155;
            align-items: center;
        }
        .tool-btn {
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 6px;
            background: #334155;
            color: #f8fafc;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s;
        }
        .tool-btn:hover { background: #475569; }
        .tool-btn.active { background: #6366f1; }
        .tool-btn.clear { background: #ef4444; }
        .color-picker {
            display: flex;
            gap: 4px;
            margin-left: auto;
        }
        .color-btn {
            width: 24px;
            height: 24px;
            border: 2px solid transparent;
            border-radius: 50%;
            cursor: pointer;
        }
        .color-btn.active { border-color: #f8fafc; }
        .canvas-container {
            flex: 1;
            position: relative;
            background-image: 
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 20px 20px;
        }
        #canvas {
            position: absolute;
            top: 0; left: 0;
            cursor: crosshair;
        }
        .size-slider {
            width: 80px;
            margin-left: 12px;
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <button class="tool-btn active" data-tool="pen" title="Pen">\u270F\uFE0F</button>
        <button class="tool-btn" data-tool="eraser" title="Eraser">\u{1F9F9}</button>
        <button class="tool-btn" data-tool="line" title="Line">\u{1F4CF}</button>
        <button class="tool-btn" data-tool="rect" title="Rectangle">\u2B1C</button>
        <button class="tool-btn" data-tool="circle" title="Circle">\u2B55</button>
        <input type="range" class="size-slider" min="1" max="20" value="3" title="Stroke Width">
        <div class="color-picker">
            <div class="color-btn active" data-color="#ffffff" style="background: #ffffff;"></div>
            <div class="color-btn" data-color="#ef4444" style="background: #ef4444;"></div>
            <div class="color-btn" data-color="#10b981" style="background: #10b981;"></div>
            <div class="color-btn" data-color="#3b82f6" style="background: #3b82f6;"></div>
            <div class="color-btn" data-color="#f59e0b" style="background: #f59e0b;"></div>
            <div class="color-btn" data-color="#8b5cf6" style="background: #8b5cf6;"></div>
            <div class="color-btn" data-color="#ec4899" style="background: #ec4899;"></div>
        </div>
        <button class="tool-btn clear" onclick="clearCanvas()">\u{1F5D1}\uFE0F</button>
    </div>
    <div class="canvas-container">
        <canvas id="canvas"></canvas>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        let currentTool = 'pen';
        let currentColor = '#ffffff';
        let currentWidth = 3;
        let isDrawing = false;
        let startPoint = null;
        let currentStroke = null;
        let allStrokes = [];

        // Set canvas size
        function resizeCanvas() {
            const container = document.querySelector('.canvas-container');
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            redrawCanvas();
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Tool selection
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTool = btn.dataset.tool;
            });
        });

        // Color selection
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentColor = btn.dataset.color;
            });
        });

        // Size slider
        document.querySelector('.size-slider').addEventListener('input', (e) => {
            currentWidth = parseInt(e.target.value);
        });

        // Drawing events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            startDrawing({ offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top });
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            draw({ offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top });
        });
        canvas.addEventListener('touchend', stopDrawing);

        function startDrawing(e) {
            isDrawing = true;
            startPoint = { x: e.offsetX, y: e.offsetY };
            
            currentStroke = {
                id: \`stroke-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
                points: [{ x: e.offsetX, y: e.offsetY }],
                color: currentColor,
                width: currentWidth,
                tool: currentTool
            };
        }

        function draw(e) {
            if (!isDrawing) return;

            const point = { x: e.offsetX, y: e.offsetY };

            if (currentTool === 'pen' || currentTool === 'eraser') {
                currentStroke.points.push(point);
                
                ctx.beginPath();
                ctx.moveTo(currentStroke.points[currentStroke.points.length - 2].x, 
                          currentStroke.points[currentStroke.points.length - 2].y);
                ctx.lineTo(point.x, point.y);
                ctx.strokeStyle = currentTool === 'eraser' ? '#0f172a' : currentColor;
                ctx.lineWidth = currentWidth;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
            } else if (currentTool === 'line' || currentTool === 'rect' || currentTool === 'circle') {
                redrawCanvas();
                
                ctx.beginPath();
                ctx.strokeStyle = currentColor;
                ctx.lineWidth = currentWidth;

                if (currentTool === 'line') {
                    ctx.moveTo(startPoint.x, startPoint.y);
                    ctx.lineTo(point.x, point.y);
                } else if (currentTool === 'rect') {
                    ctx.rect(startPoint.x, startPoint.y, point.x - startPoint.x, point.y - startPoint.y);
                } else if (currentTool === 'circle') {
                    const radius = Math.sqrt(Math.pow(point.x - startPoint.x, 2) + Math.pow(point.y - startPoint.y, 2));
                    ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
                }
                
                ctx.stroke();
            }
        }

        function stopDrawing(e) {
            if (!isDrawing) return;
            isDrawing = false;

            if (e && (currentTool === 'line' || currentTool === 'rect' || currentTool === 'circle')) {
                const point = { x: e.offsetX, y: e.offsetY };
                currentStroke.points.push(startPoint, point);
            }

            if (currentStroke && currentStroke.points.length > 1) {
                allStrokes.push(currentStroke);
                vscode.postMessage({ command: 'addStroke', data: currentStroke });
            }

            currentStroke = null;
        }

        function redrawCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            allStrokes.forEach(stroke => {
                ctx.beginPath();
                ctx.strokeStyle = stroke.tool === 'eraser' ? '#0f172a' : stroke.color;
                ctx.lineWidth = stroke.width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
                    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                    for (let i = 1; i < stroke.points.length; i++) {
                        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
                    }
                } else if (stroke.tool === 'line' && stroke.points.length >= 2) {
                    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                    ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
                } else if (stroke.tool === 'rect' && stroke.points.length >= 2) {
                    ctx.rect(stroke.points[0].x, stroke.points[0].y, 
                            stroke.points[1].x - stroke.points[0].x, 
                            stroke.points[1].y - stroke.points[0].y);
                } else if (stroke.tool === 'circle' && stroke.points.length >= 2) {
                    const radius = Math.sqrt(Math.pow(stroke.points[1].x - stroke.points[0].x, 2) + 
                                              Math.pow(stroke.points[1].y - stroke.points[0].y, 2));
                    ctx.arc(stroke.points[0].x, stroke.points[0].y, radius, 0, Math.PI * 2);
                }
                
                ctx.stroke();
            });
        }

        function clearCanvas() {
            allStrokes = [];
            redrawCanvas();
            vscode.postMessage({ command: 'clear' });
        }

        // Listen for remote strokes
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'addStroke') {
                allStrokes.push(message.data);
                redrawCanvas();
            } else if (message.command === 'clear') {
                allStrokes = [];
                redrawCanvas();
            } else if (message.command === 'loadStrokes') {
                allStrokes = message.data;
                redrawCanvas();
            }
        });

        // Request existing strokes
        vscode.postMessage({ command: 'getStrokes' });
    </script>
</body>
</html>`}dispose(){this.panel?.dispose(),this.onStrokesChanged.dispose()}};var ls=y(require("vscode")),di=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.activity={edits:0,chatMessages:0,filesShared:0,timeSpent:0,startTime:Date.now(),copilotEdits:0};this.peerActivities=new Map;this.p2pProvider.onMessage(()=>{this.activity.chatMessages++,this.updateDashboard()}),this.updateInterval=setInterval(()=>{this.activity.timeSpent=Date.now()-this.activity.startTime,this.updateDashboard()},5e3)}show(){if(this.panel){this.panel.reveal(ls.ViewColumn.Beside);return}this.panel=ls.window.createWebviewPanel("letscodeDashboard","Activity Dashboard",ls.ViewColumn.Beside,{enableScripts:!0,retainContextWhenHidden:!0}),this.updateDashboard(),this.panel.onDidDispose(()=>{this.panel=void 0})}updateDashboard(){this.panel&&(this.panel.webview.html=this.getHtmlForWebview(),this.panel.webview.postMessage({command:"updateData",data:{activity:this.activity,peers:Array.from(this.peerActivities.values()),sessionId:this.p2pProvider.getSessionId(),isHost:this.p2pProvider.isSessionHost(),connectedPeers:this.p2pProvider.getPeers().length}}))}trackEdit(){this.activity.edits++,this.updateDashboard()}trackFileShare(){this.activity.filesShared++,this.updateDashboard()}trackCopilotEdit(){this.activity.copilotEdits++,this.updateDashboard()}updatePeerActivity(e,t,s){let r=this.peerActivities.get(e)||{peerId:e,peerName:t,edits:0,filesModified:[],lastActive:Date.now()};r.edits++,r.filesModified.includes(s)||r.filesModified.push(s),r.lastActive=Date.now(),this.peerActivities.set(e,r),this.updateDashboard()}getHtmlForWebview(){return`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activity Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            padding: 24px;
        }
        .header {
            margin-bottom: 24px;
        }
        h1 {
            font-size: 24px;
            font-weight: 600;
            background: linear-gradient(135deg, #6366f1, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
        }
        .subtitle { color: #94a3b8; font-size: 14px; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        .stat-card {
            background: #1e293b;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #6366f1;
            margin-bottom: 4px;
        }
        .stat-label {
            font-size: 13px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .section {
            background: #1e293b;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .section-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .peer-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: #334155;
            border-radius: 8px;
            margin-bottom: 8px;
        }
        .peer-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6366f1, #ec4899);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 16px;
        }
        .peer-info { flex: 1; }
        .peer-name { font-weight: 500; font-size: 14px; }
        .peer-stats { font-size: 12px; color: #94a3b8; }
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 500;
            text-transform: uppercase;
        }
        .status-host { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
        .status-peer { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .progress-bar {
            height: 8px;
            background: #334155;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            border-radius: 4px;
            transition: width 0.3s;
        }
        .time-display {
            font-family: 'Courier New', monospace;
            font-size: 28px;
            color: #f8fafc;
            text-align: center;
            margin: 16px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>\u{1F4CA} Activity Dashboard</h1>
        <p class="subtitle">Real-time collaboration metrics</p>
    </div>

    <div class="time-display" id="timer">00:00:00</div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value" id="totalEdits">0</div>
            <div class="stat-label">Total Edits</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="chatMessages">0</div>
            <div class="stat-label">Chat Messages</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="filesShared">0</div>
            <div class="stat-label">Files Shared</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" id="copilotEdits">0</div>
            <div class="stat-label">AI Suggestions</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">
            \u{1F465} Team Activity
            <span id="peerCount" style="margin-left: auto; font-size: 12px; color: #94a3b8;">0 connected</span>
        </div>
        <div id="peerList"></div>
    </div>

    <div class="section">
        <div class="section-title">\u{1F4C8} Session Progress</div>
        <div class="progress-bar">
            <div class="progress-fill" id="progressFill" style="width: 0%"></div>
        </div>
        <p style="margin-top: 8px; font-size: 12px; color: #94a3b8; text-align: center;">
            Based on edit activity and file modifications
        </p>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function formatTime(ms) {
            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / 60000) % 60);
            const hours = Math.floor(ms / 3600000);
            return \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
        }

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'updateData') {
                const { activity, peers, sessionId, isHost, connectedPeers } = message.data;

                document.getElementById('totalEdits').textContent = activity.edits;
                document.getElementById('chatMessages').textContent = activity.chatMessages;
                document.getElementById('filesShared').textContent = activity.filesShared;
                document.getElementById('copilotEdits').textContent = activity.copilotEdits;
                document.getElementById('timer').textContent = formatTime(activity.timeSpent);
                document.getElementById('peerCount').textContent = \`\${connectedPeers} connected\`;

                const peerList = document.getElementById('peerList');
                peerList.innerHTML = peers.map(peer => \`
                    <div class="peer-item">
                        <div class="peer-avatar">\${(peer.peerName || peer.peerId).charAt(0).toUpperCase()}</div>
                        <div class="peer-info">
                            <div class="peer-name">\${peer.peerName || peer.peerId}</div>
                            <div class="peer-stats">\${peer.edits} edits \u2022 \${peer.filesModified.length} files</div>
                        </div>
                        <div class="status-badge \${peer.peerId === 'self' ? 'status-host' : 'status-peer'}">
                            \${peer.peerId === 'self' ? 'You' : 'Active'}
                        </div>
                    </div>
                \`).join('');

                // Calculate progress based on activity
                const progress = Math.min(100, (activity.edits + activity.filesShared * 5) / 2);
                document.getElementById('progressFill').style.width = \`\${progress}%\`;
            }
        });

        // Update timer every second
        setInterval(() => {
            const timerEl = document.getElementById('timer');
            const parts = timerEl.textContent.split(':');
            let [hours, minutes, seconds] = parts.map(Number);
            seconds++;
            if (seconds >= 60) { seconds = 0; minutes++; }
            if (minutes >= 60) { minutes = 0; hours++; }
            timerEl.textContent = \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
        }, 1000);
    </script>
</body>
</html>`}dispose(){this.panel?.dispose(),this.updateInterval&&clearInterval(this.updateInterval)}};var k=y(require("vscode")),He=y(require("fs")),Pa=y(require("path")),hi=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.syncedFiles=new Map;this.fileVersions=new Map;this.MAX_FILE_SIZE=5*1024*1024;this.syncHistory=[];this.outputChannel=k.window.createOutputChannel("Let's Code - File Sync"),this.statusBarItem=k.window.createStatusBarItem(k.StatusBarAlignment.Right,100),this.statusBarItem.text="$(sync) Files",this.statusBarItem.tooltip="File Sync Status",this.statusBarItem.command="letscode.showSyncStatus",this.statusBarItem.show(),t.subscriptions.push(this.statusBarItem),this.p2pProvider.registerMessageHandler("file-sync",s=>{this.handleRemoteFileSync(s)}),this.p2pProvider.registerMessageHandler("file-request",s=>{this.handleFileRequest(s)}),this.p2pProvider.registerMessageHandler("file-share",s=>{this.handleFileShare(s)}),k.workspace.onDidSaveTextDocument(s=>{k.workspace.getConfiguration("letscode").get("autoSyncOnSave")&&this.p2pProvider.isInSession()&&this.syncFile(s.uri)}),this.updateStatusBar()}updateStatusBar(){let e=this.syncedFiles.size;this.statusBarItem.text=`$(sync) Files: ${e}`}async syncAllFiles(){if(!k.workspace.workspaceFolders)return;if(!this.p2pProvider.isInSession()){k.window.showWarningMessage("Not in a collaboration session");return}let s=(await k.workspace.findFiles("**/*.{ts,js,json,md,html,css,py,java,c,cpp,go,rs}","**/node_modules/**")).slice(0,50),r=s.length;if(r===0){k.window.showInformationMessage("No files to sync");return}await k.window.withProgress({location:k.ProgressLocation.Notification,title:`Syncing ${r} files...`,cancellable:!1},async n=>{let o=0;for(let a of s)try{await this.syncFile(a),o++,n.report({increment:100/r,message:`${o}/${r} files`})}catch(c){console.error(`Failed to sync ${a.fsPath}:`,c)}return o}),k.window.showInformationMessage(`Synced ${this.syncedFiles.size} files with peers`)}async syncFile(e){if(this.p2pProvider.isInSession())try{if((await He.promises.stat(e.fsPath)).size>this.MAX_FILE_SIZE){console.log(`File ${e.fsPath} too large, skipping`);return}let s=await He.promises.readFile(e.fsPath,"utf-8"),r=this.computeChecksum(s),o=(this.fileVersions.get(e.toString())||0)+1;this.fileVersions.set(e.toString(),o);let a={uri:e.toString(),content:s,version:o,checksum:r};this.syncedFiles.set(e.toString(),a),this.p2pProvider.broadcastMessage({type:"file-sync",data:a,sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}catch(t){console.error("Error syncing file:",t)}}async shareFile(e){if(!this.p2pProvider.isInSession()){k.window.showWarningMessage("Not in a collaboration session");return}try{if((await He.promises.stat(e.fsPath)).size>this.MAX_FILE_SIZE){k.window.showWarningMessage("File too large (max 5MB)");return}let s=await He.promises.readFile(e.fsPath,"base64"),r=Pa.basename(e.fsPath);this.p2pProvider.broadcastMessage({type:"file-share",data:{fileName:r,content:s,uri:e.toString()},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),k.window.showInformationMessage(`Shared ${r} with peers`)}catch(t){k.window.showErrorMessage(`Failed to share file: ${t}`)}}async handleRemoteFileSync(e){let t=e.data,s=this.fileVersions.get(t.uri)||0;if(t.version<=s)return;if(this.computeChecksum(t.content)!==t.checksum){console.error("Checksum mismatch for",t.uri);return}this.fileVersions.set(t.uri,t.version),this.syncedFiles.set(t.uri,t);try{let n=k.Uri.parse(t.uri);if(He.existsSync(n.fsPath)){let o=await k.workspace.openTextDocument(n);if(!o.isDirty){await He.promises.writeFile(n.fsPath,t.content,"utf-8");let a=k.window.visibleTextEditors.find(c=>c.document.uri.toString()===t.uri);if(a){let c=a.selection.active;await k.window.showTextDocument(o),a.selection=new k.Selection(c,c)}}}}catch(n){console.error("Error applying file sync:",n)}}async handleFileRequest(e){let{uri:t}=e.data,s=this.syncedFiles.get(t);s&&this.p2pProvider.broadcastMessage({type:"file-sync",data:s,sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}computeChecksum(e){let t=0;for(let s=0;s<e.length;s++){let r=e.charCodeAt(s);t=(t<<5)-t+r,t=t&t}return t.toString(16)}async handleFileShare(e){let{fileName:t,content:s,uri:r}=e.data,a=this.p2pProvider.getPeers().find(c=>c.id===e.sender)?.name||`Peer ${e.sender.substr(0,6)}`;this.outputChannel.appendLine(`[${new Date(e.timestamp).toLocaleTimeString()}] ${a} shared: ${t}`),k.window.showInformationMessage(`${a} shared file: ${t}`,"Save As...").then(c=>{c==="Save As..."&&k.window.showSaveDialog({defaultUri:k.Uri.file(t),saveLabel:"Save Shared File"}).then(l=>{if(l){let d=Buffer.from(s,"base64");k.workspace.fs.writeFile(l,d).then(()=>{k.window.showInformationMessage(`Saved ${t}`)})}})})}getSyncedFiles(){return Array.from(this.syncedFiles.keys())}getSyncHistory(){return this.syncHistory.slice(-20)}dispose(){this.statusBarItem.dispose(),this.outputChannel.dispose()}};var fe=y(require("vscode")),Ea=y(require("child_process")),Ia=y(require("util")),pi=Ia.promisify(Ea.exec),ui=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.enabled=!0;this.currentStatus=null;this.statusBarItem=fe.window.createStatusBarItem(fe.StatusBarAlignment.Left,100),this.statusBarItem.command="letscode.toggleGitSync",this.updateStatusBar(),this.p2pProvider.registerMessageHandler("git-status",s=>{this.handleRemoteGitStatus(s)}),setInterval(()=>{this.enabled&&this.p2pProvider.isInSession()&&this.syncGitStatus()},1e4),this.context.subscriptions.push(fe.workspace.onDidSaveTextDocument(()=>{this.enabled&&this.p2pProvider.isInSession()&&this.syncGitStatus()}))}toggle(){this.enabled=!this.enabled,this.enabled?(fe.window.showInformationMessage("Git sync enabled"),this.syncGitStatus()):fe.window.showInformationMessage("Git sync disabled"),this.updateStatusBar()}async syncGitStatus(){if(this.p2pProvider.isInSession())try{let e=fe.workspace.workspaceFolders?.[0];if(!e)return;let t=await this.getGitStatus(e.uri.fsPath);this.currentStatus=t,this.p2pProvider.broadcastMessage({type:"git-status",data:t,sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),this.updateStatusBar()}catch{}}async getGitStatus(e){let{stdout:t}=await pi("git rev-parse --abbrev-ref HEAD",{cwd:e}),s=t.trim(),r=0,n=0;try{let{stdout:p}=await pi("git rev-parse --abbrev-ref --symbolic-full-name @{u}",{cwd:e}),u=p.trim(),{stdout:f}=await pi(`git rev-list --left-right --count ${s}...${u}`,{cwd:e}),g=f.trim().split("	");r=parseInt(g[0])||0,n=parseInt(g[1])||0}catch{}let{stdout:o}=await pi("git status --porcelain",{cwd:e}),a=o.trim().split(`
`).filter(p=>p),c=[],l=[],d=[],h=[];return a.forEach(p=>{let u=p.substring(0,2),f=p.substring(3).trim();u.includes("M")&&c.push(f),u.includes("A")&&l.push(f),u.includes("D")&&d.push(f),u.includes("??")&&h.push(f)}),{branch:s,ahead:r,behind:n,modified:c,added:l,deleted:d,untracked:h}}handleRemoteGitStatus(e){let t=e.data,r=this.p2pProvider.getPeers().find(n=>n.id===e.sender);this.currentStatus&&this.currentStatus.branch!==t.branch&&fe.window.showWarningMessage(`${r?.name||"Peer"} is on branch "${t.branch}" while you're on "${this.currentStatus.branch}"`)}updateStatusBar(){if(!this.enabled)this.statusBarItem.text="$(git-branch) Git Sync: Off",this.statusBarItem.tooltip="Git synchronization is disabled";else if(this.currentStatus){let e=this.currentStatus,t=e.ahead>0||e.behind>0?`\u2191${e.ahead}\u2193${e.behind}`:"\u2713",s=e.modified.length>0?"*":"";this.statusBarItem.text=`$(git-branch) ${e.branch} ${t}${s}`,this.statusBarItem.tooltip=[`Branch: ${e.branch}`,`Ahead: ${e.ahead}, Behind: ${e.behind}`,`Modified: ${e.modified.length}`,`Added: ${e.added.length}`,`Deleted: ${e.deleted.length}`,"","Click to toggle sync"].join(`
`)}else this.statusBarItem.text="$(git-branch) Git Sync: On",this.statusBarItem.tooltip="Git synchronization is enabled";this.statusBarItem.show()}getCurrentStatus(){return this.currentStatus}isEnabled(){return this.enabled}dispose(){this.statusBarItem.dispose()}};var se=y(require("vscode")),fi=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.enabled=!0;this.edits=[];this.recentEditTimes=[];this.RAPID_EDIT_THRESHOLD=500;this.LARGE_INSERT_THRESHOLD=50;this.onCopilotDetected=new se.EventEmitter;let s=se.workspace.getConfiguration("letscode");this.enabled=s.get("trackCopilotEdits")??!0,se.workspace.onDidChangeTextDocument(r=>{this.enabled&&this.p2pProvider.isInSession()&&this.analyzeEdit(r)})}toggle(){this.enabled=!this.enabled,se.workspace.getConfiguration("letscode").update("trackCopilotEdits",this.enabled,!0),se.window.showInformationMessage(`Copilot tracking ${this.enabled?"enabled":"disabled"}`)}analyzeEdit(e){let t=Date.now();this.recentEditTimes.push(t),this.recentEditTimes=this.recentEditTimes.filter(c=>t-c<5e3);let s=this.recentEditTimes.length>=3&&this.recentEditTimes[this.recentEditTimes.length-1]-this.recentEditTimes[this.recentEditTimes.length-3]<1e3,r=0,n=!1;e.contentChanges.forEach(c=>{if(c.text){let l=c.text.split(`
`).length;r+=l,l>this.LARGE_INSERT_THRESHOLD&&(n=!0)}});let o=s&&r>10||n,a={timestamp:t,fileUri:e.document.uri.toString(),lineCount:r,detected:o};this.edits.push(a),o&&(this.onCopilotDetected.fire(a),this.notifyCopilotEdit(e.document,r)),this.p2pProvider.broadcastMessage({type:"edit-track",data:{fileUri:e.document.uri.toString(),lineCount:r,isCopilotEdit:o},sender:this.p2pProvider.getMyPeerId(),timestamp:t})}notifyCopilotEdit(e,t){let r=se.workspace.getConfiguration("letscode").get("username")||"Anonymous";Math.random()<.3&&se.window.showInformationMessage(`${r} added ${t} lines (AI-assisted)`,"View Stats").then(n=>{n==="View Stats"&&se.commands.executeCommand("letscode.openDashboard")})}getStats(){let e=this.edits.length,t=this.edits.filter(r=>r.detected).length,s=this.edits.filter(r=>r.detected).reduce((r,n)=>r+n.lineCount,0);return{totalEdits:e,copilotEdits:t,copilotPercentage:e>0?Math.round(t/e*100):0,linesByCopilot:s}}getEdits(){return[...this.edits]}isEnabled(){return this.enabled}dispose(){this.onCopilotDetected.dispose()}};var Pe=y(require("vscode")),gi=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.SESSION_KEY="letscode.savedSession";Pe.workspace.getConfiguration("letscode").get("autoSaveSession")&&this.startAutoSave(),this.p2pProvider.onPeerConnect(()=>{this.saveSession()})}startAutoSave(){this.autoSaveInterval&&clearInterval(this.autoSaveInterval),this.autoSaveInterval=setInterval(()=>{this.p2pProvider.isInSession()&&this.saveSession()},6e4)}saveSession(){if(!this.p2pProvider.isInSession())return;let e=this.p2pProvider.getConnectionInfo(),t=Pe.workspace.workspaceFolders?.[0],s={sessionId:this.p2pProvider.getSessionId(),isHost:this.p2pProvider.isSessionHost(),hostIp:e?.ip,port:e?.port||42069,savedAt:Date.now(),projectPath:t?.uri.fsPath||""};this.context.globalState.update(this.SESSION_KEY,s)}async restoreSession(){let e=this.context.globalState.get(this.SESSION_KEY);if(!e){Pe.window.showInformationMessage("No saved session found");return}if(!(!(Date.now()-e.savedAt<24*60*60*1e3)&&await Pe.window.showWarningMessage("Saved session is older than 24 hours. Restore anyway?","Yes","No")!=="Yes"))try{e.isHost?await this.p2pProvider.createSession():e.hostIp&&await this.p2pProvider.joinSession(e.sessionId,e.hostIp,e.port,e.password),Pe.window.showInformationMessage("Session restored successfully")}catch(s){Pe.window.showErrorMessage(`Failed to restore session: ${s}`)}}async restoreSessionIfNeeded(){let e=this.context.globalState.get(this.SESSION_KEY);if(!e)return;Date.now()-e.savedAt<60*60*1e3&&await Pe.window.showInformationMessage(`Restore previous session "${e.sessionId}"?`,"Yes","No")==="Yes"&&await this.restoreSession()}clearSavedSession(){this.context.globalState.update(this.SESSION_KEY,void 0)}getSavedSession(){return this.context.globalState.get(this.SESSION_KEY)}dispose(){this.autoSaveInterval&&clearInterval(this.autoSaveInterval)}};var _=y(require("vscode")),mi=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.updates=[];this.onUpdateReceived=new _.EventEmitter;this.onUpdate=this.onUpdateReceived.event;this.maxUpdates=50;this.p2pProvider.registerMessageHandler("project-update",s=>{this.handleProjectUpdate(s)}),this.p2pProvider.registerMessageHandler("file-change",s=>{this.handleFileChange(s)}),this.p2pProvider.onPeerConnect(s=>{this.sendProjectState(s.id)})}sendUpdate(e,t,s){let n=_.workspace.getConfiguration("letscode").get("username")||"Anonymous",o={id:this.generateId(),type:e,description:t,filePath:s,timestamp:Date.now(),sender:this.p2pProvider.getMyPeerId(),senderName:n};this.updates.push(o),this.trimUpdates(),this.p2pProvider.broadcastMessage({type:"project-update",data:o,sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),this.onUpdateReceived.fire(o)}notifyFileChange(e,t){if(!_.workspace.workspaceFolders)return;let r=_.workspace.asRelativePath(e);this.sendUpdate("file",`File ${t}: ${r}`,r)}notifyDependencyChange(e){e&&this.sendUpdate("dependency","Dependencies updated - run npm install")}notifyConfigChange(e){this.sendUpdate("config",`Configuration changed: ${e}`)}async shareProjectStructure(){if(!_.workspace.workspaceFolders){_.window.showWarningMessage("No workspace open");return}let t=await _.workspace.findFiles("**/*.{ts,js,json,md,html,css,py,java,c,cpp,go,rs,vue,jsx,tsx}","{**/node_modules/**,**/.git/**,**/dist/**,**/build/**,**/.vscode/**}"),s=t.slice(0,100).map(r=>({path:_.workspace.asRelativePath(r),size:0}));this.p2pProvider.broadcastMessage({type:"project-structure",data:{fileCount:t.length,structure:s.slice(0,20),timestamp:Date.now()},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),_.window.showInformationMessage(`Shared project structure (${t.length} files)`)}sendProjectState(e){let t={updates:this.updates.slice(-10),timestamp:Date.now()};this.p2pProvider.sendToPeer(e,{type:"project-state",data:t,sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}handleProjectUpdate(e){let t=e.data;switch(t.senderName||(t.senderName=`Peer ${t.sender.substr(0,6)}`),this.updates.push(t),this.trimUpdates(),this.onUpdateReceived.fire(t),t.type){case"file":_.window.showInformationMessage(`\u{1F4C1} ${t.senderName}: ${t.description}`,"View File").then(s=>{s==="View File"&&t.filePath&&this.openFile(t.filePath)});break;case"dependency":_.window.showWarningMessage(`\u{1F4E6} ${t.senderName}: ${t.description}`,"Install").then(s=>{s==="Install"&&_.commands.executeCommand("letscode.syncFiles")});break;default:_.window.showInformationMessage(`\u{1F504} ${t.senderName}: ${t.description}`)}}handleFileChange(e){let{filePath:t,changeType:s,content:r}=e.data;s==="modified"&&r&&this.applyRemoteFileChange(t,r)}async applyRemoteFileChange(e,t){try{let s=_.Uri.file(e),r=await _.workspace.openTextDocument(s);if(!r.isDirty){let n=new _.WorkspaceEdit,o=new _.Range(r.positionAt(0),r.positionAt(r.getText().length));n.replace(s,o,t),await _.workspace.applyEdit(n)}}catch(s){console.error("Error applying remote file change:",s)}}async openFile(e){try{let t=_.workspace.workspaceFolders;if(!t)return;let s=_.Uri.joinPath(t[0].uri,e);await _.window.showTextDocument(s)}catch(t){console.error("Error opening file:",t)}}getUpdates(){return[...this.updates]}clearUpdates(){this.updates=[]}trimUpdates(){this.updates.length>this.maxUpdates&&(this.updates=this.updates.slice(-this.maxUpdates))}generateId(){return`update-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}dispose(){this.onUpdateReceived.dispose()}};var Ee=y(require("vscode")),vi=class i{constructor(e,t,s){this.context=e;this.p2pProvider=t;this.chatManager=s;this.disposables=[];this.chatManager.onMessage(r=>{this.postMessageToWebview({type:"newMessage",message:r})}),this.p2pProvider.onPeerConnect(()=>this.updatePeerList()),this.p2pProvider.onPeerDisconnect(()=>this.updatePeerList())}static{this.viewType="letscode.chatView"}show(){this._panel?this._panel.reveal(Ee.ViewColumn.Beside):this.createPanel()}createPanel(){this._panel=Ee.window.createWebviewPanel(i.viewType,"Let's Code - Team Chat",Ee.ViewColumn.Beside,{enableScripts:!0,retainContextWhenHidden:!0,localResourceRoots:[this.context.extensionUri]}),this._panel.webview.html=this.getHtmlForWebview(this._panel.webview),this._panel.onDidDispose(()=>{this._panel=void 0},null,this.disposables),this._panel.webview.onDidReceiveMessage(async e=>{switch(e.command){case"sendMessage":this.chatManager.sendMessage(e.text,"text");break;case"sendFile":let t=await Ee.window.showOpenDialog({canSelectFiles:!0,canSelectFolders:!1,canSelectMany:!1});if(t&&t[0]){let s=await Ee.workspace.fs.readFile(t[0]),r=Buffer.from(s).toString("base64");this.chatManager.sendFileMessage(t[0].fsPath.split(/[\\/]/).pop()||"file",r)}break;case"requestHistory":this.sendMessageHistory();break;case"requestPeers":this.updatePeerList();break;case"clearChat":this.chatManager.clearHistory(),this.sendMessageHistory();break}},void 0,this.disposables),this.sendMessageHistory(),this.updatePeerList(),this.updateConnectionStatus()}sendMessageHistory(){let e=this.chatManager.getMessages();this.postMessageToWebview({type:"messageHistory",messages:e})}updatePeerList(){let e=this.p2pProvider.getPeers(),t=this.p2pProvider.getMyPeerId(),r=Ee.workspace.getConfiguration("letscode").get("username")||"Me";this.postMessageToWebview({type:"peerList",peers:[{id:t,name:r,isMe:!0},...e.map(n=>({id:n.id,name:n.name||`Peer ${n.id.substr(0,6)}`,isMe:!1}))]})}updateConnectionStatus(){let e=this.p2pProvider.getSessionId(),t=this.p2pProvider.isSessionHost();this.postMessageToWebview({type:"connectionStatus",connected:!!e,sessionId:e||null,isHost:t})}postMessageToWebview(e){this._panel&&this._panel.webview.postMessage(e)}dispose(){this.disposables.forEach(e=>e.dispose()),this._panel&&this._panel.dispose()}getHtmlForWebview(e){let t=this.p2pProvider.getSessionId(),s=this.chatManager.getMessages(),r=this.p2pProvider.getPeers();return`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Let's Code - Chat</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-tertiary: #334155;
            --bg-hover: #475569;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent: #6366f1;
            --accent-hover: #4f46e5;
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
            --border: rgba(255, 255, 255, 0.1);
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .header {
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border);
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .header-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .connection-badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .connection-badge.connected {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success);
        }

        .connection-badge.disconnected {
            background: rgba(239, 68, 68, 0.2);
            color: var(--error);
        }

        .header-actions {
            display: flex;
            gap: 8px;
        }

        .icon-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 6px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .icon-btn:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }

        .peer-list {
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border);
            padding: 8px 16px;
            display: flex;
            gap: 8px;
            overflow-x: auto;
            scrollbar-width: none;
        }

        .peer-list::-webkit-scrollbar {
            display: none;
        }

        .peer-chip {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            background: var(--bg-tertiary);
            border-radius: 20px;
            font-size: 12px;
            white-space: nowrap;
        }

        .peer-chip.me {
            background: var(--accent);
            color: white;
        }

        .peer-avatar {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--accent);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 600;
        }

        .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .message {
            max-width: 85%;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .message-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
        }

        .message-sender {
            font-size: 12px;
            font-weight: 600;
            color: var(--accent);
        }

        .message-time {
            font-size: 11px;
            color: var(--text-secondary);
        }

        .message-bubble {
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.5;
            word-wrap: break-word;
        }

        .message.me .message-bubble {
            background: var(--accent);
            color: white;
            border-bottom-right-radius: 4px;
        }

        .message.other .message-bubble {
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border-bottom-left-radius: 4px;
        }

        .message.system {
            align-self: center;
            max-width: 100%;
        }

        .message.system .message-bubble {
            background: transparent;
            color: var(--text-secondary);
            font-size: 12px;
            font-style: italic;
            text-align: center;
        }

        .message.file .message-bubble {
            background: var(--bg-tertiary);
            border: 1px solid var(--accent);
        }

        .file-message {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .file-icon {
            font-size: 20px;
        }

        .input-container {
            background: var(--bg-secondary);
            border-top: 1px solid var(--border);
            padding: 12px 16px;
            display: flex;
            gap: 8px;
            align-items: flex-end;
        }

        .message-input {
            flex: 1;
            background: var(--bg-tertiary);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 10px 16px;
            color: var(--text-primary);
            font-size: 14px;
            outline: none;
            resize: none;
            min-height: 40px;
            max-height: 120px;
            font-family: inherit;
        }

        .message-input:focus {
            border-color: var(--accent);
        }

        .message-input::placeholder {
            color: var(--text-secondary);
        }

        .send-btn, .attach-btn {
            background: var(--accent);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            flex-shrink: 0;
        }

        .send-btn:hover {
            background: var(--accent-hover);
            transform: scale(1.05);
        }

        .send-btn:disabled {
            background: var(--bg-tertiary);
            cursor: not-allowed;
            transform: none;
        }

        .attach-btn {
            background: var(--bg-tertiary);
        }

        .attach-btn:hover {
            background: var(--bg-hover);
        }

        .empty-state {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            text-align: center;
            padding: 32px;
        }

        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }

        .empty-state-text {
            font-size: 14px;
        }

        .typing-indicator {
            padding: 8px 16px;
            font-size: 12px;
            color: var(--text-secondary);
            font-style: italic;
            height: 24px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <span class="header-title">\u{1F4AC} Team Chat</span>
            <span id="connectionBadge" class="connection-badge disconnected">Offline</span>
        </div>
        <div class="header-actions">
            <button class="icon-btn" id="clearBtn" title="Clear chat">\u{1F5D1}\uFE0F</button>
            <button class="icon-btn" id="refreshBtn" title="Refresh">\u{1F504}</button>
        </div>
    </div>

    <div class="peer-list" id="peerList">
        <div class="peer-chip me">
            <span class="peer-avatar">\u{1F464}</span>
            <span>Me</span>
        </div>
    </div>

    <div class="messages-container" id="messagesContainer">
        <div class="empty-state" id="emptyState">
            <div class="empty-state-icon">\u{1F4AC}</div>
            <div class="empty-state-text">No messages yet.<br>Start the conversation!</div>
        </div>
    </div>

    <div class="typing-indicator" id="typingIndicator"></div>

    <div class="input-container">
        <button class="attach-btn" id="attachBtn" title="Share file">\u{1F4CE}</button>
        <textarea 
            class="message-input" 
            id="messageInput" 
            placeholder="Type a message..."
            rows="1"
        ></textarea>
        <button class="send-btn" id="sendBtn">\u27A4</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const messagesContainer = document.getElementById('messagesContainer');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const attachBtn = document.getElementById('attachBtn');
        const peerList = document.getElementById('peerList');
        const connectionBadge = document.getElementById('connectionBadge');
        const emptyState = document.getElementById('emptyState');
        const typingIndicator = document.getElementById('typingIndicator');
        const clearBtn = document.getElementById('clearBtn');
        const refreshBtn = document.getElementById('refreshBtn');

        let messages = [];
        let currentUserId = '';

        // Request initial data
        vscode.postMessage({ command: 'requestHistory' });
        vscode.postMessage({ command: 'requestPeers' });

        // Auto-resize textarea
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        // Send message on Enter (Shift+Enter for new line)
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        sendBtn.addEventListener('click', sendMessage);

        attachBtn.addEventListener('click', () => {
            vscode.postMessage({ command: 'sendFile' });
        });

        clearBtn.addEventListener('click', () => {
            if (confirm('Clear all chat history?')) {
                vscode.postMessage({ command: 'clearChat' });
            }
        });

        refreshBtn.addEventListener('click', () => {
            vscode.postMessage({ command: 'requestHistory' });
            vscode.postMessage({ command: 'requestPeers' });
        });

        function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;

            vscode.postMessage({
                command: 'sendMessage',
                text: text
            });

            messageInput.value = '';
            messageInput.style.height = 'auto';
        }

        function formatTime(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        function renderMessage(msg) {
            const messageEl = document.createElement('div');
            messageEl.className = 'message';
            
            if (msg.type === 'system') {
                messageEl.classList.add('system');
                messageEl.innerHTML = '<div class="message-bubble">' + msg.text + '</div>';
            } else {
                const isMe = msg.sender === currentUserId || msg.sender === 'system' && msg.senderName === 'Me';
                messageEl.classList.add(isMe ? 'me' : 'other');
                if (msg.type === 'file') {
                    messageEl.classList.add('file');
                }

                var bubbleContent = msg.type === 'file' 
                    ? '<div class="file-message">\u{1F4C4} <span>' + msg.text + '</span></div>'
                    : msg.text;
                messageEl.innerHTML = '<div class="message-header"><span class="message-sender">' + msg.senderName + '</span><span class="message-time">' + formatTime(msg.timestamp) + '</span></div><div class="message-bubble">' + bubbleContent + '</div>';
            }

            return messageEl;
        }

        function renderMessages() {
            if (messages.length === 0) {
                emptyState.style.display = 'flex';
                messagesContainer.innerHTML = '';
                messagesContainer.appendChild(emptyState);
                return;
            }

            emptyState.style.display = 'none';
            messagesContainer.innerHTML = '';
            
            messages.forEach(msg => {
                messagesContainer.appendChild(renderMessage(msg));
            });

            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function updatePeerList(peers) {
            const me = peers.find(p => p.isMe);
            if (me) currentUserId = me.id;

            peerList.innerHTML = peers.map(peer => 
                '<div class="peer-chip ' + (peer.isMe ? 'me' : '') + '">' +
                    '<span class="peer-avatar">' + (peer.isMe ? '\u{1F464}' : '\u{1F465}') + '</span>' +
                    '<span>' + peer.name + '</span>' +
                '</div>'
            ).join('');
        }

        function updateConnectionStatus(status) {
            if (status.connected) {
                connectionBadge.textContent = status.isHost ? 'Host' : 'Connected';
                connectionBadge.className = 'connection-badge connected';
                sendBtn.disabled = false;
            } else {
                connectionBadge.textContent = 'Offline';
                connectionBadge.className = 'connection-badge disconnected';
                sendBtn.disabled = true;
            }
        }

        // Handle messages from extension
        window.addEventListener('message', (event) => {
            const message = event.data;

            switch (message.type) {
                case 'messageHistory':
                    messages = message.messages || [];
                    renderMessages();
                    break;
                case 'newMessage':
                    messages.push(message.message);
                    if (messages.length > 100) messages.shift();
                    renderMessages();
                    break;
                case 'peerList':
                    updatePeerList(message.peers);
                    break;
                case 'connectionStatus':
                    updateConnectionStatus(message);
                    break;
            }
        });
    </script>
</body>
</html>`}};var w=y(require("vscode")),N=y(require("fs")),A=y(require("path")),wi=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.autoSyncEnabled=!0;this.syncQueue=new Set;this.isProcessingQueue=!1;this.MAX_FILE_SIZE=5*1024*1024;this.BATCH_SIZE=10;this.outputChannel=w.window.createOutputChannel("Let's Code - Auto Sync"),this.statusBarItem=w.window.createStatusBarItem(w.StatusBarAlignment.Left,100),this.statusBarItem.text="$(sync-ignored) Auto Sync",this.statusBarItem.tooltip="Auto Sync: Disabled (No session)",this.statusBarItem.command="letscode.toggleAutoSync",this.statusBarItem.show(),t.subscriptions.push(this.statusBarItem),this.setupMessageHandlers(),this.setupWatchers(),this.updateStatusBar(),this.p2pProvider.onPeerConnect(()=>this.updateStatusBar()),this.p2pProvider.onPeerDisconnect(()=>this.updateStatusBar())}setupMessageHandlers(){this.p2pProvider.registerMessageHandler("folder-created",async e=>{await this.handleRemoteFolderCreated(e)}),this.p2pProvider.registerMessageHandler("file-created",async e=>{await this.handleRemoteFileCreated(e)}),this.p2pProvider.registerMessageHandler("project-sync-request",async e=>{await this.handleProjectSyncRequest(e)}),this.p2pProvider.registerMessageHandler("project-sync-response",async e=>{await this.handleProjectSyncResponse(e)}),this.p2pProvider.registerMessageHandler("batch-file-sync",async e=>{await this.handleBatchFileSync(e)})}setupWatchers(){w.workspace.workspaceFolders&&(this.fileWatcher=w.workspace.createFileSystemWatcher("**/*",!1,!1,!1),this.fileWatcher.onDidCreate(async t=>{this.autoSyncEnabled&&this.p2pProvider.isInSession()&&await this.handleLocalFileCreated(t)}),this.fileWatcher.onDidChange(async t=>{this.autoSyncEnabled&&this.p2pProvider.isInSession()&&this.queueFileForSync(t.fsPath)}),this.fileWatcher.onDidDelete(t=>{this.autoSyncEnabled&&this.p2pProvider.isInSession()&&this.broadcastFileDeleted(t)}),this.folderWatcher=w.workspace.createFileSystemWatcher("**/",!1,!1,!1),this.folderWatcher.onDidCreate(async t=>{this.autoSyncEnabled&&this.p2pProvider.isInSession()&&await this.handleLocalFolderCreated(t)}),this.context.subscriptions.push(this.fileWatcher,this.folderWatcher))}queueFileForSync(e){this.syncQueue.add(e),this.processSyncQueue()}async processSyncQueue(){if(this.isProcessingQueue||this.syncQueue.size===0)return;this.isProcessingQueue=!0;let e=Array.from(this.syncQueue).slice(0,this.BATCH_SIZE);this.syncQueue.clear();for(let t of e)try{await this.syncFile(w.Uri.file(t))}catch(s){console.error(`Failed to sync ${t}:`,s)}this.isProcessingQueue=!1,this.syncQueue.size>0&&setTimeout(()=>this.processSyncQueue(),100)}async handleLocalFileCreated(e){let t=await N.promises.stat(e.fsPath).catch(()=>null);if(!t||t.isDirectory())return;let s=await N.promises.readFile(e.fsPath),r=this.getRelativePath(e.fsPath);if(s.length>this.MAX_FILE_SIZE){this.outputChannel.appendLine(`Skipping large file: ${r}`);return}this.p2pProvider.broadcastMessage({type:"file-created",data:{path:r,content:s.toString("base64"),size:s.length,modified:t.mtime.getTime()},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),this.outputChannel.appendLine(`Created and synced: ${r}`),this.updateStatusBar()}async handleLocalFolderCreated(e){let t=await N.promises.stat(e.fsPath).catch(()=>null);if(!t||!t.isDirectory())return;let s=this.getRelativePath(e.fsPath);this.p2pProvider.broadcastMessage({type:"folder-created",data:{path:s},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),this.outputChannel.appendLine(`Folder created and synced: ${s}`),await this.syncFolderContents(e.fsPath)}async syncFolderContents(e){let t=await this.getFolderFiles(e);for(let s of t.slice(0,50))try{await this.handleLocalFileCreated(w.Uri.file(s))}catch(r){console.error(`Failed to sync file in folder: ${s}`,r)}}async getFolderFiles(e){let t=[],s=await N.promises.readdir(e,{withFileTypes:!0});for(let r of s){let n=A.join(e,r.name);if(r.isFile())t.push(n);else if(r.isDirectory()&&!r.name.startsWith(".")&&r.name!=="node_modules"){let o=await this.getFolderFiles(n);t.push(...o)}}return t}async handleRemoteFolderCreated(e){let{path:t}=e.data,s=w.workspace.workspaceFolders;if(!s)return;let r=A.join(s[0].uri.fsPath,t);try{await N.promises.mkdir(r,{recursive:!0}),this.outputChannel.appendLine(`Created folder from peer: ${t}`),w.window.showInformationMessage(`Peer created folder: ${A.basename(t)}`,"Open").then(n=>{n==="Open"&&w.commands.executeCommand("revealInExplorer",w.Uri.file(r))})}catch(n){console.error("Failed to create folder:",n)}}async handleRemoteFileCreated(e){let{path:t,content:s,modified:r}=e.data,n=w.workspace.workspaceFolders;if(!n)return;let o=A.join(n[0].uri.fsPath,t);try{await N.promises.mkdir(A.dirname(o),{recursive:!0});let a=Buffer.from(s,"base64");await N.promises.writeFile(o,a);let c=new Date(r);await N.promises.utimes(o,c,c),this.outputChannel.appendLine(`Created file from peer: ${t}`);let l=A.extname(t).toLowerCase();[".ts",".js",".json",".md",".html",".css"].includes(l)&&w.window.showInformationMessage(`New file from peer: ${A.basename(t)}`,"Open").then(d=>{d==="Open"&&w.workspace.openTextDocument(o).then(h=>{w.window.showTextDocument(h)})})}catch(a){console.error("Failed to create file:",a)}}async handleProjectSyncRequest(e){let t=w.workspace.workspaceFolders;if(!t)return;let s=t[0].uri.fsPath,r=await this.getProjectStructure(s);this.p2pProvider.sendToPeer(e.sender,{type:"project-sync-response",data:{structure:r,requester:e.sender},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}async handleProjectSyncResponse(e){let{structure:t}=e.data,s=w.workspace.workspaceFolders;if(!s)return;let r=s[0].uri.fsPath;await w.window.withProgress({location:w.ProgressLocation.Notification,title:`Importing project structure (${t.files.length} files)...`,cancellable:!0},async(n,o)=>{let a=0,c=t.folders.length+t.files.length;for(let l of t.folders){if(o.isCancellationRequested)break;let d=A.join(r,l);await N.promises.mkdir(d,{recursive:!0}),a++,n.report({increment:100/c})}for(let l of t.files){if(o.isCancellationRequested)break;if(l.content){let d=A.join(r,l.path);await N.promises.mkdir(A.dirname(d),{recursive:!0});let h=Buffer.from(l.content,"base64");h.length<=this.MAX_FILE_SIZE&&await N.promises.writeFile(d,h)}a++,n.report({increment:100/c,message:`${a}/${c}`})}return a}),w.window.showInformationMessage("Project imported successfully!","Open Folder").then(n=>{n==="Open Folder"&&w.commands.executeCommand("revealInExplorer",s[0].uri)})}async handleBatchFileSync(e){let{files:t}=e.data,s=w.workspace.workspaceFolders;if(!s)return;let r=s[0].uri.fsPath;for(let n of t)try{let o=A.join(r,n.path);await N.promises.mkdir(A.dirname(o),{recursive:!0});let a=Buffer.from(n.content,"base64");a.length<=this.MAX_FILE_SIZE&&await N.promises.writeFile(o,a)}catch(o){console.error(`Failed to sync file: ${n.path}`,o)}this.outputChannel.appendLine(`Batch synced ${t.length} files`)}async getProjectStructure(e){let t=[],s=[],r=async(n,o="")=>{let a=await N.promises.readdir(n,{withFileTypes:!0});for(let c of a){let l=A.join(o,c.name),d=A.join(n,c.name);if(c.isDirectory())!c.name.startsWith(".")&&c.name!=="node_modules"&&c.name!=="dist"&&(t.push(l),await r(d,l));else if(c.isFile()){let h=await N.promises.stat(d);if(h.size<=this.MAX_FILE_SIZE){let p=await N.promises.readFile(d);s.push({path:l,content:p.toString("base64"),size:h.size,modified:h.mtime.getTime()})}}}};return await r(e),{rootPath:e,folders:t,files:s}}async requestProjectSyncFromPeer(e){if(!this.p2pProvider.isInSession()){w.window.showWarningMessage("Not in a collaboration session");return}this.p2pProvider.sendToPeer(e,{type:"project-sync-request",data:{},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),w.window.showInformationMessage("Requesting project sync from peer...")}async shareEntireProject(){let e=w.workspace.workspaceFolders;if(!e){w.window.showWarningMessage("No workspace open");return}if(!this.p2pProvider.isInSession()){w.window.showWarningMessage("Not in a collaboration session");return}let t=e[0].uri.fsPath,s=await this.getProjectStructure(t),r=20;for(let n=0;n<s.files.length;n+=r){let o=s.files.slice(n,n+r);this.p2pProvider.broadcastMessage({type:"batch-file-sync",data:{files:o,totalBatches:Math.ceil(s.files.length/r),currentBatch:Math.floor(n/r)+1},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}w.window.showInformationMessage(`Shared project with ${s.files.length} files to all peers`)}async syncFile(e){let t=await N.promises.stat(e.fsPath).catch(()=>null);if(!t||t.isDirectory())return;let s=await N.promises.readFile(e.fsPath),r=this.getRelativePath(e.fsPath);s.length>this.MAX_FILE_SIZE||this.p2pProvider.broadcastMessage({type:"file-sync",data:{path:r,content:s.toString("base64"),modified:t.mtime.getTime()},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}broadcastFileDeleted(e){let t=this.getRelativePath(e.fsPath);this.p2pProvider.broadcastMessage({type:"file-deleted",data:{path:t},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),this.outputChannel.appendLine(`Deleted: ${t}`)}getRelativePath(e){let t=w.workspace.workspaceFolders;if(!t)return e;let s=t[0].uri.fsPath;return A.relative(s,e)}toggleAutoSync(){this.autoSyncEnabled=!this.autoSyncEnabled,this.updateStatusBar(),w.window.showInformationMessage(`Auto sync ${this.autoSyncEnabled?"enabled":"disabled"}`)}updateStatusBar(){if(!this.p2pProvider.isInSession()){this.statusBarItem.text="$(sync-ignored) Auto Sync",this.statusBarItem.tooltip="Auto Sync: No active session";return}this.autoSyncEnabled?(this.statusBarItem.text="$(sync) Auto Sync ON",this.statusBarItem.tooltip="Auto Sync: Enabled (Click to disable)"):(this.statusBarItem.text="$(sync-ignored) Auto Sync OFF",this.statusBarItem.tooltip="Auto Sync: Disabled (Click to enable)")}dispose(){this.statusBarItem.dispose(),this.outputChannel.dispose(),this.fileWatcher?.dispose(),this.folderWatcher?.dispose()}};var M=y(require("vscode")),Ie=y(require("fs")),G=y(require("path")),yi=y(require("crypto")),bi=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.fileHistories=new Map;this.commits=[];this.outputChannel=M.window.createOutputChannel("Let's Code - File History"),this.statusBarItem=M.window.createStatusBarItem(M.StatusBarAlignment.Right,99),this.statusBarItem.text="$(history) History",this.statusBarItem.tooltip="File History & Commits",this.statusBarItem.command="letscode.showFileHistory",this.statusBarItem.show(),t.subscriptions.push(this.statusBarItem),this.historyDir=G.join(t.globalStorageUri.fsPath,"history"),Ie.mkdirSync(this.historyDir,{recursive:!0}),this.setupMessageHandlers(),this.setupAutoCommit(),this.loadPersistedHistory()}setupMessageHandlers(){this.p2pProvider.registerMessageHandler("file-version",async e=>{await this.handleRemoteFileVersion(e)}),this.p2pProvider.registerMessageHandler("commit",async e=>{await this.handleRemoteCommit(e)}),this.p2pProvider.registerMessageHandler("history-request",async e=>{await this.handleHistoryRequest(e)}),this.p2pProvider.registerMessageHandler("history-response",async e=>{await this.handleHistoryResponse(e)})}setupAutoCommit(){this.autoCommitInterval=setInterval(()=>{this.createAutoCommit()},5*60*1e3),M.workspace.onDidSaveTextDocument(e=>{this.p2pProvider.isInSession()&&this.createVersion(e.uri.fsPath,e.getText(),"Auto-save")})}async createVersion(e,t,s){let r=this.getRelativePath(e),n=Date.now(),o=this.generateVersionId(e,t,n),a=this.calculateChecksum(t),c=this.fileHistories.get(r);c||(c={filePath:r,currentVersion:0,versions:[],created:n,lastModified:n},this.fileHistories.set(r,c));let l=c.versions[c.versions.length-1],d=l?this.calculateChanges(l.content,t):void 0,h={versionId:o,timestamp:n,author:this.p2pProvider.getMyPeerId(),authorName:this.getMyName(),content:Buffer.from(t).toString("base64"),size:t.length,checksum:a,message:s,changes:d};return c.versions.push(h),c.currentVersion=c.versions.length,c.lastModified=n,await this.persistHistory(r,c),this.p2pProvider.isInSession()&&this.p2pProvider.broadcastMessage({type:"file-version",data:{filePath:r,version:{...h,content:h.content.substring(0,1e4)}},sender:this.p2pProvider.getMyPeerId(),timestamp:n}),this.outputChannel.appendLine(`Created version ${c.currentVersion} for ${r}`),this.updateStatusBar(),h}async createCommit(e,t){let s=Date.now(),r=this.generateCommitId(e,s),n=[];if(t&&t.length>0)for(let a of t){let c=this.getRelativePath(a),l=this.fileHistories.get(c);if(l&&l.versions.length>0){let d=l.versions[l.versions.length-1];n.push({path:c,action:l.versions.length===1?"created":"modified",versionId:d.versionId})}}else{let a=s-3e5;for(let[c,l]of this.fileHistories){let d=l.versions.filter(h=>h.timestamp>a);if(d.length>0){let h=d[d.length-1];n.push({path:c,action:"modified",versionId:h.versionId})}}}let o={commitId:r,timestamp:s,author:this.p2pProvider.getMyPeerId(),authorName:this.getMyName(),message:e,files:n};return this.commits.push(o),this.commits.sort((a,c)=>c.timestamp-a.timestamp),await this.persistCommit(o),this.p2pProvider.isInSession()&&this.p2pProvider.broadcastMessage({type:"commit",data:{commit:o},sender:this.p2pProvider.getMyPeerId(),timestamp:s}),M.window.showInformationMessage(`Created commit: ${e} (${n.length} files)`),this.outputChannel.appendLine(`Created commit ${r}: ${e}`),this.updateStatusBar(),o}async createAutoCommit(){if(!this.p2pProvider.isInSession()||this.commits.filter(s=>s.timestamp>Date.now()-5*60*1e3).length>0)return;let t=[];for(let[s,r]of this.fileHistories)r.lastModified>Date.now()-5*60*1e3&&t.push(s);t.length>0&&await this.createCommit(`Auto-commit: ${t.length} files modified`,t)}async restoreVersion(e,t){let s=this.getRelativePath(e),r=this.fileHistories.get(s);if(!r){M.window.showErrorMessage("No history found for this file");return}let n=r.versions.find(c=>c.versionId===t);if(!n){M.window.showErrorMessage("Version not found");return}let o=Buffer.from(n.content,"base64").toString();if(await M.window.showWarningMessage(`Restore ${s} to version from ${new Date(n.timestamp).toLocaleString()}?`,"Yes","No")==="Yes"){let c=M.workspace.workspaceFolders;if(c){let l=G.join(c[0].uri.fsPath,s);await Ie.promises.writeFile(l,o,"utf8"),M.window.showInformationMessage(`Restored ${s} to version ${t.substr(0,8)}`),this.outputChannel.appendLine(`Restored ${s} to version ${t}`)}}}async showVersionDiff(e,t,s){let r=this.getRelativePath(e),n=this.fileHistories.get(r);if(!n)return;let o=n.versions.find(p=>p.versionId===t),a=n.versions.find(p=>p.versionId===s);if(!o||!a){M.window.showErrorMessage("One or both versions not found");return}let c=Buffer.from(o.content,"base64").toString(),l=Buffer.from(a.content,"base64").toString(),d=await M.workspace.openTextDocument({language:G.extname(e).replace(".",""),content:c}),h=await M.workspace.openTextDocument({language:G.extname(e).replace(".",""),content:l});await M.commands.executeCommand("vscode.diff",d.uri,h.uri,`${G.basename(e)}: ${o.versionId.substr(0,8)} \u2194 ${a.versionId.substr(0,8)}`)}async requestHistoryFromPeer(e){this.p2pProvider.sendToPeer(e,{type:"history-request",data:{requester:this.p2pProvider.getMyPeerId()},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),M.window.showInformationMessage("Requesting file history from peer...")}getFileHistory(e){let t=this.getRelativePath(e);return this.fileHistories.get(t)}getAllHistory(){return Array.from(this.fileHistories.values()).sort((e,t)=>t.lastModified-e.lastModified)}getCommits(){return this.commits}async handleRemoteFileVersion(e){let{filePath:t,version:s}=e.data,r=this.fileHistories.get(t);r||(r={filePath:t,currentVersion:0,versions:[],created:s.timestamp,lastModified:s.timestamp},this.fileHistories.set(t,r)),r.versions.some(n=>n.versionId===s.versionId)||(r.versions.push(s),r.currentVersion=r.versions.length,r.lastModified=s.timestamp,await this.persistHistory(t,r),this.outputChannel.appendLine(`Received version for ${t} from peer`),this.updateStatusBar())}async handleRemoteCommit(e){let{commit:t}=e.data;this.commits.some(s=>s.commitId===t.commitId)||(this.commits.push(t),this.commits.sort((s,r)=>r.timestamp-s.timestamp),await this.persistCommit(t),M.window.showInformationMessage(`New commit from ${t.authorName}: ${t.message}`,"View").then(s=>{s==="View"&&M.commands.executeCommand("letscode.showCommits")}),this.updateStatusBar())}async handleHistoryRequest(e){let t=Array.from(this.fileHistories.entries()).map(([s,r])=>({filePath:s,history:{...r,versions:r.versions.slice(-10)}}));this.p2pProvider.sendToPeer(e.sender,{type:"history-response",data:{histories:t},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()})}async handleHistoryResponse(e){let{histories:t}=e.data,s=0;for(let{filePath:r,history:n}of t)this.fileHistories.get(r)||(this.fileHistories.set(r,n),await this.persistHistory(r,n),s++);M.window.showInformationMessage(`Imported history for ${s} files from peer`),this.updateStatusBar()}async persistHistory(e,t){let s=e.replace(/[^a-zA-Z0-9]/g,"_"),r=G.join(this.historyDir,`${s}.json`);try{await Ie.promises.writeFile(r,JSON.stringify(t,null,2),"utf8")}catch(n){console.error("Failed to persist history:",n)}}async persistCommit(e){let t=G.join(this.historyDir,`commit_${e.commitId}.json`);try{await Ie.promises.writeFile(t,JSON.stringify(e,null,2),"utf8")}catch(s){console.error("Failed to persist commit:",s)}}async loadPersistedHistory(){try{let e=await Ie.promises.readdir(this.historyDir);for(let t of e)if(t.startsWith("commit_")){let s=await Ie.promises.readFile(G.join(this.historyDir,t),"utf8"),r=JSON.parse(s);this.commits.push(r)}else if(t.endsWith(".json")){let s=await Ie.promises.readFile(G.join(this.historyDir,t),"utf8"),r=JSON.parse(s);this.fileHistories.set(r.filePath,r)}this.commits.sort((t,s)=>s.timestamp-t.timestamp),this.updateStatusBar(),this.outputChannel.appendLine(`Loaded history for ${this.fileHistories.size} files, ${this.commits.length} commits`)}catch(e){console.error("Failed to load persisted history:",e)}}generateVersionId(e,t,s){return yi.createHash("sha256").update(`${e}:${t}:${s}`).digest("hex")}generateCommitId(e,t){return yi.createHash("sha256").update(`${e}:${t}:${this.p2pProvider.getMyPeerId()}`).digest("hex").substr(0,16)}calculateChecksum(e){return yi.createHash("md5").update(e).digest("hex")}calculateChanges(e,t){let s=e.split(`
`),r=t.split(`
`),n=0,o=0,a=0,c=Math.max(s.length,r.length);for(let l=0;l<c;l++)l>=s.length?n++:l>=r.length?o++:s[l]!==r[l]&&a++;return{added:n,removed:o,modified:a}}getRelativePath(e){let t=M.workspace.workspaceFolders;if(!t)return e;let s=t[0].uri.fsPath;return G.relative(s,e)}getMyName(){return M.workspace.getConfiguration("letscode").get("username")||"Anonymous"}updateStatusBar(){let e=this.fileHistories.size,t=this.commits.length;this.statusBarItem.text=`$(history) ${e} files, ${t} commits`}dispose(){this.statusBarItem.dispose(),this.outputChannel.dispose(),this.autoCommitInterval&&clearInterval(this.autoCommitInterval)}};var T=y(require("vscode")),xi=class{constructor(e,t){this.p2pProvider=e;this.context=t;this.myExtensions=new Map;this.peerExtensions=new Map;this.recommendations=[];this._onRecommendationsUpdated=new T.EventEmitter;this.onRecommendationsUpdated=this._onRecommendationsUpdated.event;this.outputChannel=T.window.createOutputChannel("Let's Code - Extensions"),this.statusBarItem=T.window.createStatusBarItem(T.StatusBarAlignment.Right,98),this.statusBarItem.text="$(extensions) Extensions",this.statusBarItem.tooltip="Extension Recommendations",this.statusBarItem.command="letscode.showExtensionRecommendations",this.statusBarItem.show(),t.subscriptions.push(this.statusBarItem),this.setupMessageHandlers(),this.scanMyExtensions(),setInterval(()=>this.scanMyExtensions(),6e4),this.p2pProvider.onPeerConnect(()=>{this.shareMyExtensions(),this.analyzeRecommendations()})}setupMessageHandlers(){this.p2pProvider.registerMessageHandler("extensions-list",async e=>{await this.handlePeerExtensions(e)}),this.p2pProvider.registerMessageHandler("extension-recommend",async e=>{await this.handleExtensionRecommendation(e)})}async scanMyExtensions(){let e=T.extensions.all;this.myExtensions.clear();for(let t of e){if(t.id.startsWith("vscode.")||t.id.startsWith("ms-vscode."))continue;let s={id:t.id,name:t.packageJSON.displayName||t.packageJSON.name,publisher:t.packageJSON.publisher,version:t.packageJSON.version,description:t.packageJSON.description,category:this.categorizeExtension(t.packageJSON.keywords,t.packageJSON.categories),installed:!0,peersUsing:[],peerCount:0,priority:"medium"};this.myExtensions.set(t.id,s)}this.outputChannel.appendLine(`Scanned ${this.myExtensions.size} extensions`),this.updateStatusBar(),this.p2pProvider.isInSession()&&this.shareMyExtensions()}shareMyExtensions(){if(!this.p2pProvider.isInSession())return;let e=Array.from(this.myExtensions.values()).map(t=>({id:t.id,name:t.name,publisher:t.publisher,version:t.version,category:t.category}));this.p2pProvider.broadcastMessage({type:"extensions-list",data:{extensions:e},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),this.outputChannel.appendLine(`Shared ${e.length} extensions with peers`)}async handlePeerExtensions(e){let{extensions:t}=e.data,s=e.sender;this.peerExtensions.has(s)||this.peerExtensions.set(s,new Map);let r=this.peerExtensions.get(s);r.clear();for(let n of t){let o={...n,installed:this.myExtensions.has(n.id),peersUsing:[s],peerCount:1,priority:"medium"};r.set(n.id,o)}this.outputChannel.appendLine(`Received ${t.length} extensions from peer ${s.substr(0,8)}`),this.analyzeRecommendations()}async handleExtensionRecommendation(e){let{extensionId:t,extensionName:s,peerId:r}=e.data;if(!this.myExtensions.has(t)){let n=await T.window.showInformationMessage(`Peer recommends installing: ${s}`,"Install Now","View Details","Dismiss");n==="Install Now"?await this.installExtension(t):n==="View Details"&&T.commands.executeCommand("extension.open",t)}}analyzeRecommendations(){let e=new Map;for(let[s,r]of this.peerExtensions)for(let[n,o]of r)this.myExtensions.has(n)||(e.has(n)||e.set(n,{info:o,peers:new Set}),e.get(n).peers.add(s));this.recommendations=[];for(let[s,{info:r,peers:n}]of e){let o=n.size,a=this.p2pProvider.getPeers().length,c=a>0?o/a*100:0,l="low";c>=70?l="high":c>=40&&(l="medium"),["Development","Language Support","Intellisense","Linter"].includes(r.category||"")&&(l=l==="low"?"medium":"high"),this.recommendations.push({...r,peersUsing:Array.from(n),peerCount:o,priority:l})}this.recommendations.sort((s,r)=>{let n={high:3,medium:2,low:1};return n[s.priority]!==n[r.priority]?n[r.priority]-n[s.priority]:r.peerCount-s.peerCount}),this._onRecommendationsUpdated.fire(this.recommendations),this.updateStatusBar();let t=this.recommendations.filter(s=>s.priority==="high"&&s.peerCount>1);t.length>0&&T.window.showInformationMessage(`${t.length} extensions recommended by your team`,"View Recommendations").then(s=>{s==="View Recommendations"&&T.commands.executeCommand("letscode.showExtensionRecommendations")})}async installExtension(e){try{await T.commands.executeCommand("workbench.extensions.installExtension",e),T.window.showInformationMessage(`Installing ${e}...`),setTimeout(()=>this.scanMyExtensions(),5e3)}catch{T.window.showErrorMessage(`Failed to install ${e}`)}}async recommendExtensionToPeers(e){let t=this.myExtensions.get(e);if(!t){T.window.showErrorMessage("Extension not found in your installed list");return}this.p2pProvider.broadcastMessage({type:"extension-recommend",data:{extensionId:e,extensionName:t.name,description:t.description,peerId:this.p2pProvider.getMyPeerId()},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),T.window.showInformationMessage(`Recommended ${t.name} to all peers`)}async syncExtensionSettings(e){let s=T.workspace.getConfiguration().get(e);s&&(this.p2pProvider.broadcastMessage({type:"extension-settings",data:{extensionId:e,settings:s},sender:this.p2pProvider.getMyPeerId(),timestamp:Date.now()}),T.window.showInformationMessage(`Shared ${e} settings with peers`))}getRecommendations(){return this.recommendations}getMyExtensions(){return Array.from(this.myExtensions.values())}getPeerExtensions(e){let t=this.peerExtensions.get(e);return t?Array.from(t.values()):[]}getCommonExtensions(){let e=new Map;for(let[t,s]of this.peerExtensions)for(let[r,n]of s)if(this.myExtensions.has(r)){e.has(r)||e.set(r,{...n,peersUsing:[],peerCount:0});let o=e.get(r);o.peersUsing.push(t),o.peerCount++}return Array.from(e.values()).sort((t,s)=>s.peerCount-t.peerCount)}categorizeExtension(e,t){let s=[...e||[],...t||[]].map(r=>r.toLowerCase());return s.some(r=>r.includes("language")||r.includes("programming"))?"Language Support":s.some(r=>r.includes("debug")||r.includes("test"))?"Debugging & Testing":s.some(r=>r.includes("git")||r.includes("source control"))?"Source Control":s.some(r=>r.includes("theme")||r.includes("icon"))?"Themes & Icons":s.some(r=>r.includes("snippet")||r.includes("template"))?"Snippets & Templates":s.some(r=>r.includes("format")||r.includes("lint"))?"Formatting & Linting":s.some(r=>r.includes("database")||r.includes("sql"))?"Database":s.some(r=>r.includes("cloud")||r.includes("deploy"))?"Cloud & DevOps":"Development"}updateStatusBar(){let e=this.recommendations.filter(t=>t.priority==="high").length;e>0?(this.statusBarItem.text=`$(extensions) ${e} recommended`,this.statusBarItem.backgroundColor=new T.ThemeColor("statusBarItem.warningBackground")):(this.statusBarItem.text="$(extensions) Extensions",this.statusBarItem.backgroundColor=void 0)}dispose(){this.statusBarItem.dispose(),this.outputChannel.dispose(),this._onRecommendationsUpdated.dispose()}};var U,ds;function dh(i){console.log("Let's Code extension is now active"),U=new ti(i);let e=new ri(U,i);ds=new si(i,U,e);let t=new ii(U,i),s=new ni(U,i),r=new oi(U,i),n=new ai(U,i),o=new ci(U,i),a=new li(U,i),c=new di(U,i),l=new hi(U,i),d=new ui(U,i),h=new fi(U,i),p=new gi(U,i),u=new Dt(i),f=new mi(U,i),g=new vi(i,U,e),E=new wi(U,i),Me=new bi(U,i),Ve=new xi(U,i);i.subscriptions.push(m.window.registerWebviewViewProvider("letscode.sidebarView",ds,{webviewOptions:{retainContextWhenHidden:!0}})),hh(i,{p2pProvider:U,sidebarProvider:ds,documentSync:t,chatManager:e,cursorTracker:s,terminalSharing:r,taskBoardProvider:n,codeReviewProvider:o,whiteboardProvider:a,dashboardProvider:c,fileSyncManager:l,gitSyncManager:d,copilotTracker:h,sessionPersistence:p,encryptionManager:u,projectUpdateManager:f,chatProvider:g,autoSyncManager:E,fileHistoryManager:Me,extensionRecommendationProvider:Ve}),ph(i,U,t,s),p.restoreSessionIfNeeded()}function hh(i,e){Object.entries({"letscode.createSession":async()=>{let s=await m.window.showInputBox({prompt:"Set session password (optional)",password:!0,placeHolder:"Leave empty for no password"});await e.p2pProvider.createSession(s),e.sidebarProvider.updateWebview(),m.window.showInformationMessage("Session created! Share your Project ID with teammates.")},"letscode.joinSession":async()=>{let s=await m.window.showInputBox({prompt:"Enter Project ID",placeHolder:"e.g., LETS-X8B2-9A1F",validateInput:a=>!a||a.length<8?"Please enter a valid Project ID":null});if(!s)return;let r=await m.window.showInputBox({prompt:"Enter Host IP Address",placeHolder:"e.g., 192.168.1.100",validateInput:a=>!a||!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(a)?"Please enter a valid IP address":null});if(!r)return;let n=await m.window.showInputBox({prompt:"Enter Port",placeHolder:"42069",value:"42069"}),o=await m.window.showInputBox({prompt:"Enter session password (if required)",password:!0,placeHolder:"Leave empty if no password"});await e.p2pProvider.joinSession(s,r,parseInt(n||"42069"),o),e.sidebarProvider.updateWebview(),m.window.showInformationMessage("Connected to session!")},"letscode.leaveSession":async()=>{await e.p2pProvider.leaveSession(),e.sidebarProvider.updateWebview(),m.window.showInformationMessage("Left the session.")},"letscode.copySessionId":()=>{let s=e.p2pProvider.getSessionId();s&&(m.env.clipboard.writeText(s),m.window.showInformationMessage("Project ID copied to clipboard!"))},"letscode.toggleEditHistory":()=>{e.documentSync.toggleEditHistory()},"letscode.sendChatMessage":async()=>{let s=await m.window.showInputBox({prompt:"Enter message",placeHolder:"Type your message..."});s&&e.chatManager.sendMessage(s)},"letscode.syncFiles":async()=>{await e.fileSyncManager.syncAllFiles(),m.window.showInformationMessage("Files synced with peers!")},"letscode.setPassword":async()=>{let s=await m.window.showInputBox({prompt:"Set new session password",password:!0,placeHolder:"Leave empty to remove password"});e.p2pProvider.setPassword(s)},"letscode.followPeer":async()=>{let s=e.p2pProvider.getPeers();if(s.length===0){m.window.showWarningMessage("No peers connected");return}let r=await m.window.showQuickPick(s.map(n=>({label:n.name||n.id,id:n.id})),{placeHolder:"Select peer to follow"});r&&e.cursorTracker.startFollowing(r.id)},"letscode.stopFollowing":()=>{e.cursorTracker.stopFollowing()},"letscode.openDashboard":()=>{e.dashboardProvider.show()},"letscode.openTaskBoard":()=>{e.taskBoardProvider.show()},"letscode.addReviewComment":async()=>{let s=m.window.activeTextEditor;if(!s)return;let r=s.selection,n=await m.window.showInputBox({prompt:"Enter review comment"});n&&e.codeReviewProvider.addComment(s.document.uri,r,n)},"letscode.shareTerminal":()=>{e.terminalSharing.toggleSharing()},"letscode.openWhiteboard":()=>{e.whiteboardProvider.show()},"letscode.openChat":()=>{e.chatProvider.show()},"letscode.shareFile":async()=>{let s=await m.window.showOpenDialog({canSelectFiles:!0,canSelectFolders:!1,canSelectMany:!1});s&&s[0]&&await e.fileSyncManager.shareFile(s[0])},"letscode.toggleGitSync":()=>{e.gitSyncManager.toggle()},"letscode.openWebDashboard":()=>{let s=e.p2pProvider.getSessionId();s&&m.env.openExternal(m.Uri.parse(`http://localhost:3000/dashboard/${s}`))},"letscode.saveSession":()=>{e.sessionPersistence.saveSession(),m.window.showInformationMessage("Session saved!")},"letscode.restoreSession":()=>{e.sessionPersistence.restoreSession()},"letscode.toggleCopilotTracking":()=>{e.copilotTracker.toggle()},"letscode.shareBreakpoints":()=>{let s=m.debug.activeDebugSession;s&&e.p2pProvider.broadcastMessage({type:"breakpoint",data:{sessionName:s.name},sender:e.p2pProvider.getMyPeerId(),timestamp:Date.now()})},"letscode.sendGroupMessage":async()=>{let s=await m.window.showInputBox({prompt:"Send message to all peers",placeHolder:"Type your group message..."});s&&(e.chatManager.sendMessage(s,"text"),m.window.showInformationMessage("Message sent to group!"))},"letscode.showChatHistory":()=>{let s=e.chatManager.getMessages();if(s.length===0){m.window.showInformationMessage("No messages yet");return}let r=s.slice(-10).map(n=>`${n.senderName}: ${n.text.substring(0,40)}${n.text.length>40?"...":""}`);m.window.showQuickPick(r,{placeHolder:"Recent messages (select to reply)",canPickMany:!1}).then(n=>{n&&m.commands.executeCommand("letscode.sendGroupMessage")})},"letscode.shareProjectStructure":()=>{e.projectUpdateManager.shareProjectStructure()},"letscode.notifyFileChange":async()=>{let s=await m.window.showInputBox({prompt:"File path (relative to workspace)",placeHolder:"src/components/App.tsx"});s&&e.projectUpdateManager.notifyFileChange(m.Uri.file(s),"modified")},"letscode.showProjectUpdates":()=>{let s=e.projectUpdateManager.getUpdates();if(s.length===0){m.window.showInformationMessage("No project updates yet");return}let r=s.slice(-10).map(n=>`${n.senderName} - ${n.description}`);m.window.showQuickPick(r,{placeHolder:"Recent project updates"})},"letscode.shareMultipleFiles":async()=>{let s=await m.window.showOpenDialog({canSelectFiles:!0,canSelectFolders:!1,canSelectMany:!0,openLabel:"Share Files with Peers"});if(s&&s.length>0){for(let r of s)await e.fileSyncManager.shareFile(r);m.window.showInformationMessage(`Shared ${s.length} file(s) with peers`)}},"letscode.requestFileFromPeer":async()=>{let s=e.p2pProvider.getPeers();if(s.length===0){m.window.showWarningMessage("No peers connected");return}let r=await m.window.showQuickPick(s.map(n=>({label:n.name||n.id,id:n.id})),{placeHolder:"Select peer to request file from"});if(r){let n=await m.window.showInputBox({prompt:"Enter file path to request",placeHolder:"e.g., src/utils/helpers.ts"});n&&(e.p2pProvider.sendToPeer(r.id,{type:"file-request",data:{filePath:n},sender:e.p2pProvider.getMyPeerId(),timestamp:Date.now()}),m.window.showInformationMessage(`File request sent to ${r.label}`))}},"letscode.showSessionInfo":()=>{let s=e.p2pProvider.getSessionId(),r=e.p2pProvider.getPeers(),n=e.p2pProvider.getConnectionInfo();if(!s){m.window.showWarningMessage("Not in a session");return}let o=[`Session ID: ${s}`,`Role: ${e.p2pProvider.isSessionHost()?"Host":"Client"}`,`Connected Peers: ${r.length}`,r.length>0?`Peers: ${r.map(a=>a.name||a.id.substr(0,6)).join(", ")}`:"",n?`Host IP: ${n.ip}:${n.port}`:""].filter(Boolean);m.window.showInformationMessage(o.join(" | "))},"letscode.copyConnectionDetails":()=>{let s=e.p2pProvider.getSessionId(),r=e.p2pProvider.getConnectionInfo();if(!s){m.window.showWarningMessage("Not in a session");return}let n=r?`Project ID: ${s}
Host IP: ${r.ip}
Port: ${r.port}`:`Project ID: ${s}`;m.env.clipboard.writeText(n),m.window.showInformationMessage("Connection details copied to clipboard!")},"letscode.toggleAutoSync":()=>{e.autoSyncManager.toggleAutoSync()},"letscode.shareEntireProject":()=>{e.autoSyncManager.shareEntireProject()},"letscode.requestProjectSync":async()=>{let s=e.p2pProvider.getPeers();if(s.length===0){m.window.showWarningMessage("No peers connected");return}let r=await m.window.showQuickPick(s.map(n=>({label:n.name||n.id,id:n.id})),{placeHolder:"Select peer to sync project from"});r&&e.autoSyncManager.requestProjectSyncFromPeer(r.id)},"letscode.toggleTerminalBroadcast":()=>{e.terminalSharing.toggleBroadcastMode()},"letscode.broadcastCommand":async()=>{let s=await m.window.showInputBox({prompt:"Enter command to execute on all devices",placeHolder:"e.g., npm install"});s&&await e.terminalSharing.broadcastAndExecute(s)},"letscode.createCommit":async()=>{let s=await m.window.showInputBox({prompt:"Enter commit message",placeHolder:"e.g., Fixed login bug"});s&&await e.fileHistoryManager.createCommit(s)},"letscode.showFileHistory":async()=>{let s=m.window.activeTextEditor;if(!s){m.window.showWarningMessage("No file open");return}let r=e.fileHistoryManager.getFileHistory(s.document.uri.fsPath);if(!r||r.versions.length===0){m.window.showInformationMessage("No history for this file");return}let n=r.versions.map(a=>({label:`Version ${r.versions.indexOf(a)+1}`,description:`${a.authorName} - ${new Date(a.timestamp).toLocaleString()}`,detail:a.message||"No message",versionId:a.versionId})),o=await m.window.showQuickPick(n,{placeHolder:"Select version to restore"});o&&await e.fileHistoryManager.restoreVersion(s.document.uri.fsPath,o.versionId)},"letscode.showCommits":()=>{let s=e.fileHistoryManager.getCommits();if(s.length===0){m.window.showInformationMessage("No commits yet");return}let r=m.window.createOutputChannel("Let's Code - Commits");s.forEach(n=>{r.appendLine(`[${new Date(n.timestamp).toLocaleString()}] ${n.authorName}: ${n.message} (${n.files.length} files)`)}),r.show(),m.window.showInformationMessage(`Showing ${s.length} commits in output channel`)},"letscode.showExtensionRecommendations":async()=>{let s=e.extensionRecommendationProvider.getRecommendations();if(s.length===0){m.window.showInformationMessage("No extension recommendations from peers");return}let r=s.filter(o=>o.priority==="high").map(o=>({label:o.name,description:`${o.publisher} - Used by ${o.peerCount} peers`,detail:o.description?.substring(0,100)||"",extensionId:o.id})),n=await m.window.showQuickPick(r,{placeHolder:"Select extension to install"});n&&await e.extensionRecommendationProvider.installExtension(n.extensionId)},"letscode.recommendExtension":async()=>{let r=e.extensionRecommendationProvider.getMyExtensions().map(o=>({label:o.name,description:o.publisher,detail:o.description?.substring(0,100)||"",extensionId:o.id})),n=await m.window.showQuickPick(r,{placeHolder:"Select extension to recommend to peers"});n&&await e.extensionRecommendationProvider.recommendExtensionToPeers(n.extensionId)}}).forEach(([s,r])=>{i.subscriptions.push(m.commands.registerCommand(s,r))})}function ph(i,e,t,s){i.subscriptions.push(m.workspace.onDidChangeTextDocument(r=>{e.isInSession()&&t.handleLocalChange(r)})),i.subscriptions.push(m.window.onDidChangeTextEditorSelection(r=>{e.isInSession()&&s.updateCursorPosition(r)})),i.subscriptions.push(m.window.onDidChangeActiveTextEditor(r=>{r&&e.isInSession()&&t.syncDocument(r.document)}))}function uh(){U&&U.dispose(),ds&&ds.dispose()}0&&(module.exports={activate,deactivate});
