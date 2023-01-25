//  Module:     index
//  Project:    sq-lib
//  Author:     soviet
//  E-mail:     soviet@s0viet.ru
//  Web:        https://s0viet.ru/

if("undefined"===typeof Global){const c=require("module"),a=new Proxy(c.prototype,{has:(c,a)=>a in c,get:(c,a)=>c[a],set:(a,b,c)=>global[b]=a[b]=c});a.Global=global.Global=a}function a(a){let b=a.match(/^\@([\w-]+)/)[0],c=Global.require.aliases[b];return a.replace(b,c)}function b(c,a){Global.require.aliases["@"+c]=a}function c(b){delete Global.require.aliases[b]}if("undefined"===typeof Global.require.aliases){let d=Global.require;Global.require=function(b){return b.startsWith("@")&&(b=a(b)),d.call(this,b)},Global.require.aliases={}}const d=require("path");b(d.basename(__dirname),d.resolve(__dirname, 'src')),module.exports=require("./src/index.js");