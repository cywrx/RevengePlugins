(function(v,m,p){"use strict";const a=m.findByProps("show","openLazy");let s;var h={onLoad:()=>{s=p.instead("show",a,(args,orig)=>{const[o]=args;const i=o?.onConfirm&&(o?.title?.toLowerCase().includes("delete")||o?.content?.toLowerCase().includes("delete"));return i?o.onConfirm():orig.apply(a,args)})},onUnload:()=>s?.()};return v.default=h,v})({},vendetta.metro,vendetta.patcher);

