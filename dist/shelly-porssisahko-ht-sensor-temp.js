/**
 * @license
 * 
 * shelly-porssisahko
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * 
 * License: GNU Affero General Public License v3.0 
 */
let C_HIST=24,C_ERRC=3,C_ERRD=120,C_DEF={mode:0,m0:{cmd:0},m1:{lim:0},m2:{per:24,cnt:0,lim:-999,sq:0,m:999,ps:0,pe:23,ps2:0,pe2:23,cnt2:0},vat:24,day:0,night:0,bk:0,err:0,outs:[0],fh:0,fhCmd:0,inv:0,min:60,oc:0},_={s:{v:"2.12.0",dn:"",st:0,str:"",cmd:-1,chkTs:0,errCnt:0,errTs:0,upTs:0,timeOK:0,configOK:0,fCmdTs:0,fCmd:0,tz:"+02:00",tzh:0,p:[{ts:0,now:0,low:0,high:0,avg:0},{ts:0,now:0,low:0,high:0,avg:0}]},p:[[],[]],h:[],c:C_DEF},l=!1,r=!1;function i(t,e){e-=t;return 0<=e&&e<3600}function a(t){return Math.floor((t?t.getTime():Date.now())/1e3)}function n(t,e,s){let n=t.toString();for(;n.length<e;)n=s?s+n:" "+n;return n}function o(t){return t.getDate()}function u(t){let e=t.toString(),s=0;"+0000"==(e=e.substring(3+e.indexOf("GMT")))?(e="Z",s=0):(s=+e.substring(0,3),e=e.substring(0,3)+":"+e.substring(3)),e!=_.s.tz&&(_.s.p[0].ts=0),_.s.tz=e,_.s.tzh=s}function h(t){console.log((new Date).toString().substring(16,24)+":",t)}function c(){for(;_.h.length>=C_HIST;)_.h.splice(0,1);_.h.push([a(),r?1:0,_.s.st])}function m(){var t=new Date;_.s.timeOK=2e3<t.getFullYear()?1:0,_.s.dn=Shelly.getComponentConfig("sys").device.name,!_.s.upTs&&_.s.timeOK&&(_.s.upTs=a(t))}function A(t){Shelly.call("KVS.Get",{key:"porssi-config"},function(e,t,s,n){_.c=e?e.value:{},"function"==typeof USER_CONFIG&&(_.c=USER_CONFIG(_.c,_,!0));{e=function(t){_.s.configOK=t?1:0,_.s.chkTs=0,n&&(l=!1,Timer.set(1e3,!1,f))};let t=0;if(C_DEF){for(var o in null==_.c.fhCmd&&null!=_.c.fh&&(_.c.fhCmd=_.c.fh),C_DEF)if(void 0===_.c[o])_.c[o]=C_DEF[o],t++;else if("object"==typeof C_DEF[o])for(var r in C_DEF[o])void 0===_.c[o][r]&&(_.c[o][r]=C_DEF[o][r],t++);void 0!==_.c.out&&(_.c.outs=[_.c.out],_.c.out=void 0),C_DEF=null,0<t?Shelly.call("KVS.Set",{key:"porssi-config",value:_.c},function(t,e,s,n){0!==e&&h("chkConfig() - virhe:"+e+" - "+s),n&&n(0===e)},e):e&&e(!0)}else e&&e(!0)}},t)}function f(){try{l||(l=!0,m(),_.s.configOK?t(0)?e(0):!function(){if(0==_.s.chkTs)return 1;var t=new Date,e=new Date(1e3*_.s.chkTs);return e.getHours()!=t.getHours()||e.getFullYear()!=t.getFullYear()||0<_.s.fCmdTs&&_.s.fCmdTs-a(t)<0||0==_.s.fCmdTs&&_.c.min<60&&t.getMinutes()>=_.c.min&&_.s.cmd+_.c.inv==1}()?t(1)?e(1):l=!1:b():A(!0))}catch(t){h("loop() - virhe:"+t),l=!1}}function t(t){var e=new Date;let s=!1;if(1==t)s=_.s.timeOK&&0===_.s.p[1].ts&&e.getHours()>=13+_.s.tzh;else{let t=o(new Date(1e3*_.s.p[0].ts))!==o(e);t&&0<_.s.p[1].ts&&o(new Date(1e3*_.s.p[1].ts))!==o(e)&&(_.p[0]=_.p[1],_.s.p[0]=Object.assign({},_.s.p[1]),_.s.p[0].ts=a(),_.s.p[1].ts=0,_.p[1]=[],t=!1),s=_.s.timeOK&&(0==_.s.p[0].ts||t)}return _.s.errCnt>=C_ERRC&&a(e)-_.s.errTs<C_ERRD?s=!1:_.s.errCnt>=C_ERRC&&(_.s.errCnt=0),s}function e(c){try{let r=new Date;u(r);var e=1==c?new Date(864e5+new Date(r.getFullYear(),r.getMonth(),r.getDate()).getTime()):r;let t=e.getFullYear()+"-"+n(1+e.getMonth(),2,"0")+"-"+n(o(e),2,"0")+"T00:00:00"+_.s.tz.replace("+","%2b");var s=t.replace("T00:00:00","T23:59:59");let i={url:"https://dashboard.elering.ee/api/nps/price/csv?fields=fi&start="+t+"&end="+s,timeout:5,ssl_ca:"*"};r=null,t=null,Shelly.call("HTTP.GET",i,function(e,t,s){i=null;try{if(0!==t||null==e||200!==e.code||!e.body_b64)throw Error("virhe: "+t+"("+s+") - "+JSON.stringify(e));{e.headers=null,s=e.message=null,_.p[c]=[],_.s.p[c].avg=0,_.s.p[c].high=-999,_.s.p[c].low=999,e.body_b64=atob(e.body_b64),e.body_b64=e.body_b64.substring(1+e.body_b64.indexOf("\n"));let t=0;for(;0<=t;){e.body_b64=e.body_b64.substring(t);var n=[t=0,0];if(0===(t=1+e.body_b64.indexOf('"',t)))break;n[0]=+e.body_b64.substring(t,e.body_b64.indexOf('"',t)),t=2+e.body_b64.indexOf('"',t),t=2+e.body_b64.indexOf(';"',t),n[1]=+(""+e.body_b64.substring(t,e.body_b64.indexOf('"',t)).replace(",",".")),n[1]=n[1]/10*(100+(0<n[1]?_.c.vat:0))/100;var o=new Date(1e3*n[0]).getHours();n[1]+=7<=o&&o<22?_.c.day:_.c.night,_.p[c].push(n),_.s.p[c].avg+=n[1],n[1]>_.s.p[c].high&&(_.s.p[c].high=n[1]),n[1]<_.s.p[c].low&&(_.s.p[c].low=n[1]),t=e.body_b64.indexOf("\n",t)}if(e=null,_.s.p[c].avg=0<_.p[c].length?_.s.p[c].avg/_.p[c].length:0,_.s.p[c].ts=a(r),1==c&&_.p[c].length<23)throw Error("huomisen hintoja ei saatu")}}catch(t){h("getPrices() - virhe:"+t),_.s.errCnt+=1,_.s.errTs=a(),_.s.p[c].ts=0,_.p[c]=[]}1==c?l=!1:Timer.set(1e3,!1,b)})}catch(t){h("getPrices() - virhe:"+t),_.s.p[c].ts=0,_.p[c]=[],1==c?l=!1:Timer.set(1e3,!1,b)}}function b(){try{"function"==typeof USER_CONFIG&&(_.c=USER_CONFIG(_.c,_,!1)),r=!1;var t,e,s=new Date;function n(t){r!=t&&(_.s.st=12),r=t,_.c.inv&&(r=!r),1==_.c.oc&&_.s.cmd==r&&(h("logic(): lähtö on jo oikeassa tilassa"),c(),_.s.cmd=r?1:0,_.s.chkTs=a(),l=!1);let e=0,s=0;for(let t=0;t<_.c.outs.length;t++)!function(o,t){var e="{id:"+o+",on:"+(r?"true":"false")+"}";Shelly.call("Switch.Set",e,function(t,e,s,n){0!=e&&h("setRelay() - ohjaus #"+o+" epäonnistui: "+e+" - "+s),n(0==e)},t)}(_.c.outs[t],function(t){e++,t&&s++,e==_.c.outs.length&&(s==e&&(c(),_.s.cmd=r?1:0,_.s.chkTs=a()),l=!1)})}u(s),!function(){if(_.s.timeOK&&0!=_.s.p[0].ts){var e=a();for(let t=0;t<_.p[0].length;t++)if(i(_.p[0][t][0],e))return _.s.p[0].now=_.p[0][t][1];return _.p[0].length<24&&(_.s.p[0].ts=0),_.s.p[0].now=0}_.s.p[0].now=0}(),0===_.c.mode?(r=1===_.c.m0.cmd,_.s.st=1):_.s.timeOK&&0<_.s.p[0].ts&&o(new Date(1e3*_.s.p[0].ts))===o(s)?1===_.c.mode?(r=_.s.p[0].now<=("avg"==_.c.m1.lim?_.s.p[0].avg:_.c.m1.lim),_.s.st=r?2:3):2===_.c.mode&&(r=function(){0<_.c.m2.per&&(_.c.m2.cnt=Math.min(_.c.m2.cnt,_.c.m2.per));var n=[];for(v=_.c.m2.per<0?1:_.c.m2.per,d=0;d<_.p[0].length;d+=v)if(!((T=-2==_.c.m2.per&&1<=d?_.c.m2.cnt2:_.c.m2.cnt)<=0)){var o=[];for(y=d,S=d+_.c.m2.per,_.c.m2.per<0&&0==d?(y=_.c.m2.ps,S=_.c.m2.pe):-2==_.c.m2.per&&1==d&&(y=_.c.m2.ps2,S=_.c.m2.pe2),g=y;g<S&&!(g>_.p[0].length-1);g++)o.push(g);if(_.c.m2.sq){let e=999,s=0;for(g=0;g<=o.length-T;g++){let t=0;for(p=g;p<g+T;p++)t+=_.p[0][o[p]][1];t/T<e&&(e=t/T,s=g)}for(g=s;g<s+T;g++)n.push(o[g])}else{for(g=0,p=1;p<o.length;p++){var t=o[p];for(g=p-1;0<=g&&_.p[0][t][1]<_.p[0][o[g]][1];g--)o[g+1]=o[g];o[g+1]=t}for(g=0;g<T;g++)n.push(o[g])}if(-1==_.c.m2.per||-2==_.c.m2.per&&1<=d)break}let e=a(),s=!1;for(let t=0;t<n.length;t++)if(i(_.p[0][n[t]][0],e)){s=!0;break}return s}(),_.s.st=r?5:4,!r&&_.s.p[0].now<=("avg"==_.c.m2.lim?_.s.p[0].avg:_.c.m2.lim)&&(r=!0,_.s.st=6),r)&&_.s.p[0].now>("avg"==_.c.m2.m?_.s.p[0].avg:_.c.m2.m)&&(r=!1,_.s.st=11):_.s.timeOK?(_.s.st=7,t=1<<s.getHours(),(_.c.bk&t)==t&&(r=!0)):(r=1===_.c.err,_.s.st=8),_.s.timeOK&&0<_.c.fh&&(e=1<<s.getHours(),(_.c.fh&e)==e)&&(r=(_.c.fhCmd&e)==e,_.s.st=10),r&&_.s.timeOK&&s.getMinutes()>=_.c.min&&(_.s.st=13,r=!1),_.s.timeOK&&0<_.s.fCmdTs&&(0<_.s.fCmdTs-a(s)?(r=1==_.s.fCmd,_.s.st=9):_.s.fCmdTs=0),"function"==typeof USER_OVERRIDE?USER_OVERRIDE(r,_,n):n(r)}catch(t){h("logic() - virhe:"+JSON.stringify(t)),l=!1}}let d=0,g=0,p=0,v=0,T=0,y=0,S=0;h("shelly-porssisahko v."+_.s.v),h("URL: http://"+(Shelly.getComponentStatus("wifi").sta_ip??"192.168.33.1")+"/script/"+Shelly.getCurrentScriptId()),HTTPServer.registerEndpoint("",function(s,n){try{if(l)return s=null,n.code=503,void n.send();var o=function(t){var e={},s=t.split("&");for(let t=0;t<s.length;t++){var n=s[t].split("=");e[n[0]]=n[1]}return e}(s.query);s=null;let t="application/json",e=(n.code=200,!0);var r="text/html",i="text/javascript";"s"===o.r?(m(),n.body=JSON.stringify(_),e=!1):"r"===o.r?(A(_.s.configOK=!1),_.s.p[0].ts=0,_.s.p[1].ts=0,n.code=204,e=!1):"f"===o.r&&o.ts?(_.s.fCmdTs=+(""+o.ts),_.s.fCmd=+(""+o.c),_.s.chkTs=0,n.code=204,e=!1):o.r?"s.js"===o.r?(n.body=atob("H4sIAAAAAAAACo1W4W7bNhB+FYXrAhJmCKft/thTjbbJ1nVJM9RegaEoFkaiI9o06ZAnt4art8mb5MV2lGRHCdx2f+KY/O7uu7vvjjYKkr/fn6WEcPwYx8+bkEL6IndZuVAWxE2p/HqsjMrAeQqMn7z6PaUsfbGp+HjycnL673jyPv1I/ry7XVurAyi4u727tYTHo6BdMZNlwG9vtAWZSGNU4uVM2t3R2uhHJ0onhTQrvVhqmaA7Y+5uk4iYyXlwxsgd8n/C6qhSW5ksI7kaeLSN+UH6RVkGKC20bBMaGaClm0mOdnN0r1XuQpAs+ry7xWigjdzCawjadFF/yfncHW0RP4dEBtAPLwDKpA77oBYLZK8XeksvFhYw3gyLmoS518sdTUTPtZ85DSBjspMSO2CT5nahbVmChmQeHSiANfnEzy9OOg173J0YEv9/G8tn29ouJESOVgOaB5Cg0pXTedLnr1+N04+f+ELVckDluKWyE3mVyrC2WYIi2jTIgzSFw0NC4ufXrxRSAvLqKPrC0Ix/1jZ3n4VxmcTMrChkKFIYrqRPZHoTKPmJ9IAN5eEhlSIrVDZXeXrQZ5yQNG0A2VGECG2t8m8m52eHh/KzxNSXblkapHyytnKhsxMJkkKPiAIWBhNt7SquVtK8dlgBjQ7GWazxRF6HlLbcnDVO5k1itfbbVOk+7iKUVwG8ttf0uLcXgGfqy8U0ZsYYht8/bC+NoUQAlkhMnT+VWYGlewFC5vnpCtFncdiQLyVZIe21Ihw6zEBgP68VCJ2zijGOTmOIP3LEoDsayxvqTEOs4e6a7SHR4LBVOu0P9a+tmTDKXkMx1L0ea48+6k9NEybqC4xiVem+GzaYKsB0OnfBZ0xAoSydljaLpaI5dott4l8BaEQf33u2qSN4zK9ivONsKT3m8s7lSni1cCv1utAm74SL+D3aaBsMXMYeg19vTk4/1IqNy7FHRj5FvaDPpZGZorWMUUbYoN3RVlrY2FrBKm2UiJ1o1McPjtlQCTcfUSy77Ig2VSIm+y0xIpYNHpuQU++dj94B9ZZE+0FCekrAF6hQclEzbJM5i/tQCRXBeFBVvOXTZoxB40S1SUfeuuXdNEqyoZ5SjazZxuCTAaktjRl6BaW3ydP+cxxtLZqJxjGFVI0acy1muEooG2y/Np1EJbVovnHzwUGfZ9iswe4Q2e++RMHwOjGoqjbiw4Rkj8Skuwas8Xu8x+/lk42sBsmTTRdfJRSPH3Cs2GUTNqZa3RdzL4XWKTp5O754J5rx19N1LDa7fMjm6LjL4xsm3dAVx4HFPXwSly/OOFqCaBqo4lS4cbNtGAo/H+PYA33KSZ+wSjzZUEJ6uIdqg3NUVYHV3wO8bBC/YcB/lPSUtTEnOu53nAjURxTJMYsrCJFvXOnDd6NjV0gbF58iUD9AUznaGYwVljf/vsGARCM1ImIXxRgdvmv5bGfZKem+FO9vsR09guq6L0eEcsV4ucQeqTPnlp2HoX6OwlJbXAoB1iiQlQ76ShsN65TU/xtFhtsxg0frYbdncOsPIW6J5smFejUMfuk/i4+oiDrCOWvuokhYfI0fPBPY5m8vAH5vWU3xZ5Ex6x8wL3SeK/w5ElRdA1cCvc+fH6vnuFSGuC1HXt28RU+5WuHoY63vUZQN/wMZPoY6bwoAAA=="),t=i):"s.css"===o.r?(n.body=atob("H4sIAAAAAAAACo1VS2/jNhD+K8QGBZKsJUvJeutIaNCeFiiKopf2UvRAUUOLNUUKJOXHLvzfd0g9TDsO2ostDmeG33zzWj4+kkdiG5DymHTaWCssbbaaePE9eyC/9igiwmpHpSYJaZzriuXy31GScoGKXmhRuhGu6auU6XZWWL7j+zfBQFkoyJff/yS/cA5Gky+gwFBJ/ugrKdikQnbPaUYel2j0jVT6kFjxVahNgd+mBpOgqCQnPNXHBaGow7TUpiB3wHjG8+nOG1O23Rjdqxpvn9gzrLKSSKEgaUBsGleQPP0EbUm4Vs4/g/Cy9GWWcNoKeSzIX2BqqmhJWnpI9qJ2TUE+vRivN57yLPvBX5uNUOiD0N7pknS0rgPyVXdAlS7gvnPCSUB00aMjjMEeA3ROt8EqGDDdHS/1s3Tt9akUG5VYkLwgXMIhAVWXxMHBJeGqIMaH6Z2kXB7QRy1sJ+lxUA9yRyuLF522wgntTUBSJ3ZQXtKX04q9sNmkKCrg2sBiOlLuwIRkKAcKqf3woTw/hzoSIuNZWwI1PrOumW59pFJT9CCBD9idxWeaGL7SanaXSFqBjG8rqdn2KtNP6Y8rz9mckwxZf/KSsazMqIepslqKGkP+TLP1qiSsN9YXWKcFxmbmd8dQ8eWLKjhTiaFq2TtE+jURqoYDqmB+dHeG42NELBGuHOuKXJHPOS/nMp8KWXeUCXcM1oGkgjXAtlB/vGDlvx0NBNzwE1x8vIp1fjaPwnoaTHUXp2FjBJaj/00ctChzgH5k3yqL1tyELvEfwdh2KtRh4DiBHb5mp0RP/KZPoenO3Tuc5wDCeUyfM1TZjhr0M+d4inwq5lGMuKerfSN8vqaaoLXoEcXK55Uq0dIhsR5rbkOBUUOE4kIFsxP5eQtHbmgLlgwB+ZrAv4AGGwbb2uCcdHD//DmrYfOANqehPVLGXp2fXK/OvLq64MJYl7BGyBrLv9osRjXborf4dpoN+5GWSkvkfQfGCUblNAowyPdbGqdD0mqfZhn6D2dJLQywcSTofYithVrQ+3gIrnGoPfjwArI2xr8g7/XlRbecbtleRTfOxbFX/FQ8Jy6U7bwZhsGZRW7fchXb5tjtlURShqL5H1wMBXyt+FqL3Qx0BDBCOL9ofeeE0RMXpKSdX4vT11t6zphv4I1XzNCDzKcjWgG4U6ehxUU8rNB7qPaAC3yr7Q3tguI+X2eR5npy3ro8O+djYHBca56NfOQrzAavblYxKWENZuOYaeXqOrPTK9WC3NmEte8U9gkbruvd3+7YwU9VjylX/1yv09yPhdO5Yb7dWPFjdMOqjnQD4ROvzx7TbTpt3yJ8v5nfLojvVHl/tmcJAAA="),t="text/css"):"status"===o.r?(n.body=atob("H4sIAAAAAAAACpWSS07DMBCGr2JlBYumyQKJhesDoEos6AUmtqu49SPEE0rukzNwgVwMN682EKAsnMXMN5//sUIRMi0J1+D9JjKE84hRLMMRQ/GUPibsOT9A5Ymt8dxQYuNX3Ai2BQEIYOM4HoZ68uilJV5qhXLiPY5i9tI2+bH9sCRXFmFmte7EZiqPdV0UagKME3IitqAQZbjLKnNBhJ2AndIw1ZXdO0bX3caMCvU2rr3X7ySc4M5W3Olo1kR+7qXElA/fGgbTJBSzcSOCbWPbJnzoOgtXBTrE6F64S1CoZDHAtWrnUFZYGfhF1o+Fqd56Je2ppfj6hvh55Yy0Fn5Kn/4j/R+u9GvmS/IOWLD3hOelKpCV8vXJ30VBEf4swMrHBx/d0/XQ/gQ7pTjs2AIAAA=="),t=r):"status.js"===o.r?(n.body=atob("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"),t=i):"history"===o.r?(n.body=atob("H4sIAAAAAAAACmWOuw7CMAxFfyXKBEOI2NNIrCwMfEFeUBejQGwQ/XtMeQipg23pnCvbLsNdJQxEnT7gQ0mZc40mVdTe/UlOL7cWyCFikdGk8k+reNR+A6cwg7t+CDea4X1B4OLstCfWPCrIHZkeiL3Q9xErH3w7pQYX9q1ct7TQEpiytY2rgfTS2Y9/AkYQ4FXSAAAA"),t=r):"history.js"===o.r?(n.body=atob("H4sIAAAAAAAACnVR204cMQz9lWAoSrrDdKFvzGYRtEh9AFXqzttqBdGMl5kqTLa2Aa1G+Rv+hB9rshShPiDlZh+fY8cePYpCO60eHSmxjrdDo42dj0LbsV/rx9C3arpnLYsTNNm19/qUjsKTuiQKpGEIqnXiwPzT2YVUKVjKzqZdciDRWgpK2rScro4kHaaYzjLocbiT7vAQU55kJySD4x/WsM9HXc8CpuyHAelHfX1lAap1SpozkQprlShmzBZbmAnNoWCr85rY25m0qvGOE7TuBeYHY6LeO6n7e9QDPqnvqVB9jF8/56qMibMv0s5vzWTHZNl6tNAEH+j0YKTl8eoM7ghxgFMgbCFmxVf3z+63e2C1eXl+efYeU8CbJ/QM/+kmzqI+ry9vFvWvJS1PVquzknDjXYMalP7EyrH0BgqAt4ImkO70teqDpkwsR3xvXoyxcdJ0WszYhIGDxxJ3oxJTfNRXibESbYpvF4ty88CZHP8C4awwCiACAAA="),t=i):"config"===o.r?(n.body=atob("H4sIAAAAAAAACp1VS27bMBC9CiGgSLJQbTNpGwQyAS0S2PnYRe2m6JKmmIoWRSoi5dRd9yg+Qy+gi5XUzxHzQwvYsDUzb+ZxOG8URGwDCMdKjT1NwMpD36/Pp4vzZTAwHhRovOK0DUgBIZ6x5eYbNcaH0ekQzeM1LpTGGTYOFCjKKdGAReNURhQFg9rQIqtwrfEGa8DLXRyVf3SFYyIrKpgstAKK/aLjkw50XUcKIKtiTiFJUCAzzaQAG8wLOh6ikAkMNM4TZphRpXA/YIRuMRMgLQqti8r9HM1CpUyYEOYwNNaaIETA/G8hV+Wu3AlNmaA9ojVObzM6JjElyUr+tFmY2HTVFuZ8iT1feH3br2X71NZ614UzlmuZ4kQVFbXhJx/CM7BHRXjbocgg+RYH+6tO9WiIIPSHnx4jBPsRawfTTEFd8xbnpl1KF0JU/bCgVdK5J+VOmw/j+O2T0zxHIOB4RTm4k3n1PJ8N5hcXwaCydlk/4ySRfpUxUbS+hohqzLhqT8M/mFEo0hTnWzQrd1vDYpAxxqW2l9o4mlE2te/idqBVCmwrzEwPKq/5bVLvLX2B2HCrkqvy92I6n1yGXxf/oZTXOpMOfZJGveY0Jqc/rxOcTGfL8Et4Gf4TvQkTRjF4jZ1pH/mcpe5ovFr/MrxazGdgYqZ5enMTLsHy62w2/be1Eq6xWJsJl+5WgX5Gc0fw8ATBk9jROEQj6NhO0alj+Yg+OpYT5GY6RseOBSI3sz9CRpD2wXYRHI5ARf7IiYL9KFhH4aNu/4BAZVg0jYgRZgnelDvOwGHC5dGZiTNu2692/qFP6oVl8uJez/Y3aFqmugv0Qd9DW08rumUhNEvtMsvL3ZNMROzXRNznAZ8SAfAZKvBlLvARmSeZe8SeyWyowR63eodQE50k5Y61G+Ql8UFf3XddqN4gmS3GzXsK+I4w6jINzOijFUaDvjGHZymL7TW/hErfFpP36IAKb2hNemXeWt1ILTHnVAiMGnU9r8jlfHoznc3myydRmrQ19q+HXhm7NGVOaFPv0Uo2i3KVv4GWgnBGkvHBAxORfHgvMyoOvYF3dFCn8xYx5XwrQGzOYbvltQdRJGeZRjm9v1SHnmmRT6S4Yz/er5Vn9VK7/wLOjWzGxAgAAA=="),t=r):"config.js"===o.r?(n.body=atob("H4sIAAAAAAAACo1X65LaNhR+FaPuECkYr3Ez+QEIps0mkzbJbidsM5npdIqwBSjYstcSJAzrt8mb5MV6JBuwgSb9s/jcj87lk3YXc+0o2uq5IeV01MEIdThxE8roaBel4TrhUnsPa55vJzzmoU7zX+IYIy8JuiEi3jzNX7JwicGWe0pvY+5FQmUx29IQMzL0x0izWcy7efoZ9ZFMJUfE/ZHj4H947vYuuS7cnGLuMkJH06GORkMhs7V29DbjFOUsEilyJEuAuNrxAjkbFq8twQo0Gl6DxXSwYbnDKVNbGWLws9P5difmeJOKyPFblCrNNG+3W6rdtp9kZyziku+FgweF0U9JGkE6npCS56/v372l7+5uXv4zuX/vJSzDhxTTTItUNtMwmQ2vS8loSty6v1Ix9gxZCtK1VjWBIb1PqZAYuaiyFXIDGuGShysegQ7QY1SRUDlUam2YrvkBqmRHbFtjA1WypVgs6/qWHphpYhShAXQPG4JTf8CHwbMB73QI69DpMGYzHjsgp+ij7UGzRzatWfoFOSI6aFztyrn0MhZNNMs1DlzkQ7eH19bdyJmWVZ+tGjVnXs5hYkJuR+sjVGSGiE1SUzTU+ciMyP1aamFbb6i7V68O390j97b8vAab/zicNoerXH4nXyvNTTId7vqkOBLdXp3qWeV8VB1svmwcTJ8dbA4Hu5hXWRebzX4CcOzNVu3ecMgJpebH3Q/kd1Z++pfdG9OQv6cn67l3zKtxoIwUBENOcBAINl/Wg40t50USNZi9vt+HClTLI2R91oWsRj2sD3pYMnmeN4Yb6AvDnfjdMIkaionvAeuSbq8bi6SeQM8DRiUMuhnP68LAA8ZBGErdFALjIFQPzQwCTz1cSiDoJk0nx+AnmQXNzNRJYqqW9GnONavg1Cyo2Z0KeVA/bHB22sBN8L4sxIW7xS+KkGkzK2QXplKlAOXQJRhWTopiwDFxX/w68bK1Miqlc8U2JmEWRS83MI5vhdIchh+jMBbhCrkWnWHQRzvuZTk3Ojd8ztaxxmRgANtAMttDsqvN5YbYZoEoBf+8ynlsWf0Q13hkwCy6UsttAi9xmQVYeoa8HtxMQlvMtQAP4UJwaQwAbek5DJuBByHA7D5QDX+NWWQvulMINhILtXtZA4eNdLaixvF8CSBwBARWrlwdGHbnyNBuY+vA/Hm02zkorzZQrfZ/bgGgXxlMq8CDbq9FY2sOgc0fa+7uw1a/j7HxWTDTfnq+vVVNYN8PxT8Cga19uBccoYBUFu+YXkLpv2DfLT/hCnxeubN9KPedXoSDfWS76FTXQMBw7SgfUmoAQCWHsa/JaxhQydUDvYQB+7Cw4GVQu/gl55BI0EhE1fNQJ2Ey3sjyVKqChnFwZt2Q81O52e3mKY8adk7g1fiZCe0suL5hmuE/37/tPLnOs/D6zYeJN+F6vOJbirI0V0p0AQrmYoHaJXo86fw+ubuFh14u5ELMt/DEI4PA9ylNvBBWcFxzOumgcU5ND/SSS7NrOxZzuGXRPYtjDrek1usWsuDTK6DaJfoc1KYfRL7kfceMMpnCVdU/5See/qKt7IBcVYRKBbbGS7hSbGEwrAItWLfwx6hl35T2jekymuVpkoHbP9hqlXbT5Se2XikunRVXOnU0PE24kGzsYN+hDszd2pHb1VZILglc+HIdxy3KYO/gyh9iRu37HSo3zliu+G9S4/MAmjG5Sh0bSznZt6/fvkLRHNwj8AwVTpYKBeHIGLCshwiBCRXqlt1CDR4fIUSzxdOrnWlIAf2YtwEYr3b+kI3tAs7jFODnxgCwTD9jct3jP3ee+0/Z0+c+eC3aIZ2a/zXKwgb+M3g2lK1Gd29acBseSs1MNwgh+zofVvBCoZdMLjhyodkJ5h68vSDTakZJ8S+W2+iT7gwAAA=="),t=i):n.code=404:(n.body=atob("H4sIAAAAAAAACqVTS27bMBC9CstFYaOWjO6KRGRQtAHarLooui1ocmxNTJMqZ2TDKHqbniEXyMVKfeJEaYIG6GakmTd8781IrF65aPnYQM07r6suCm/CRkHQ1Q7YCFubRMCq5XXxTleM7EF/ub1JREi3v+vt7U21HKrDgWB2oPYIhyYmFjYGhsBKHtBxrRzs0ULRJwsMyGh8QdZ4UG+lrhzuhfWGSHFshhSdelozg6cOajCMB6nJziegjc1Rv+7iubhqM4X4TJGNj2JWGVEnWKuauaGz5fIaB6Rco2CTNnnu76u8j61+gFRLo+ejxL3QaNus6FGuKwxNy6LbskrGYRxWZPrRzKogNtxSXjTYLWS7w/OOgLSovFmBF+uYJv13AkUP66/oTbUc3qcOivEj9Mso7in080P803SNxDEdn3f5qOFk81NfxxdbHXn+x2vmXOPmeatT/OT0ff7t220OL7U68EydDpFswoZ1biAWHy+/qQMGFw+lj9YwxlDmjWwwlBisbx3QTHaIryOxnJ97YOFUvqjtLustbALDcOmhyxQo7cpJaQbzhWkaCO5Djd4NHavojuWDateU4McVdfDPvUmC1JRFDqazPpWUrMq2L+BMXiQl30CZoPHGwkx2g8uFlBPNGc1/LSz9RekxbDNhRjKBV5L46IFqAJZde9lfxk5IUplz2csNrxP6XBjtZ5vlNcl8H8cd/wFnTmKS0gQAAA=="),t=r),n.headers=[["Content-Type",t]],e&&n.headers.push(["Content-Encoding","gzip"])}catch(t){h("http - virhe:"+t),n.code=500}n.send()}),Timer.set(1e4,!0,f),f();

/**
 * Tämä esimerkki hyödyntää Shelly H&T:n lähettämää lämpötilaa pörssisähköohjausten asetuksissa
 * Mitä kylmempi lämpötila, sitä useampi halvempi tunti ohjataan ja samalla myös ohjausminuuttien määrää kasvatetaan.
 * 
 * Käyttöönotto:
 * -----
 * Lisää Shelly H&T-asetuksiin "actions -> sensor reports" -osoitteisiin osoite
 *    http://ip-osoite/script/1/update-temp
 * missä ip-osoite on tämän shellyn osoite. 
 * Muista myös ottaa "sensor reports" -ominaisuus käyttöön
 */

//Kuinka vanha lämpötilatieto sallitaan ohjauksessa (tunteina)
let TEMPERATURE_MAX_AGE_HOURS = 12;

//Viimeisin tiedossa oleva lämpötiladata
let data = null;
//Alkuperäiset muokkaamattomat asetukset
let originalConfig = {
  hours: 0,
  minutes: 60
};

function USER_CONFIG(config, state, initialized) {
  //Tallenentaan alkuperäiset asetukset muistiin
  if (initialized) {
    originalConfig.hours = config.m2.cnt;
    originalConfig.minutes = config.min;

    console.log("Alkuperäiset asetukset:", originalConfig);
  }

  //Käytetää lähtökohtaisesti alkuperäisiin asetuksiin tallennettua tuntimäärää ja ohjausminuutteja
  //Näin ollen jos tallentaa asetukset käyttöliittymältä, tulee ne myös tähän käyttöön
  let hours = originalConfig.hours;
  let minutes = originalConfig.minutes;

  try {

    if (data == null) {
      console.log("Lämpötilatietoa ei ole saatavilla");
      state.s.str = "Lämpötila ei tiedossa -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";

    } else {
      let age = (Date.now() - data.ts) / 1000.0 / 60.0 / 60.0;
      console.log("Lämpötila on tiedossa (päivittynyt " + age.toFixed(2) + " h sitten):", data);

      if (age <= TEMPERATURE_MAX_AGE_HOURS * 60) {
        //------------------------------
        // Toimintalogiikka
        // muokkaa haluamaksesi
        //------------------------------

        //Muutetaan lämpötilan perusteella lämmitystuntien määrää ja minuutteja
        if (data.temp <= -15) {
          hours = 8;
          minutes = 60;

        } else if (data.temp <= -10) {
          hours = 7;
          minutes = 45;

        } else if (data.temp <= -5) {
          hours = 6;
          minutes = 45;
        } else {
          hours = 6;
          minutes = 45;
        }

        //------------------------------
        // Toimintalogiikka päättyy
        //------------------------------
        state.s.str = "Lämpötila " + data.temp.toFixed(1) + "°C (" + age.toFixed(1) + "h sitten) -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";
        console.log("Lämpötila:", data.temp.toFixed(1), "°C -> asetettu halvimpien tuntien määräksi ", hours, "h ja ohjausminuuteiksi", minutes, "min");

      } else {
        console.log("Lämpötilatieto on liian vanha -> ei käytetä");
        state.s.str = "Lämpötilatieto liian vanha (" + age.toFixed(1) + " h) -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";
      }
    }
  } catch (err) {
    state.s.str = "Virhe lämpötilaohjauksessa:" + err;
    console.log("Virhe tapahtui USER_CONFIG-funktiossa. Virhe:", err);
  }

  //Asetetaan arvot asetuksiin
  config.m2.cnt = hours;
  config.min = minutes;

  return config;
}

/**
 * Apufunktio, joka kerää parametrit osoitteesta
 */
function parseParams(params) {
  let res = {};
  let splitted = params.split("&");

  for (let i = 0; i < splitted.length; i++) {
    let pair = splitted[i].split("=");

    res[pair[0]] = pair[1];
  }

  return res;
}

/**
 * Takaisinkutsu, joka suoritetaan kun saadaan HTTP-pyyntö
 */
function onHttpRequest(request, response) {
  try {
    let params = parseParams(request.query);
    request = null;

    if (params.temp != undefined) {
      data = {
        temp: Number(params.temp),
        ts: Math.floor(Date.now())
      };

      console.log("Lämpötilatiedot päivitetty, pyydetään pörssisähkölogiikan ajoa. Data:", data);
      _.s.chkTs = 0;
      response.code = 200;

    } else {
      console.log("Lämpötilatiedojen päivitys epäonnistui, 'temp' puuttuu parametreista:", params);
      response.code = 400;
    }

    response.send();

  } catch (err) {
    console.log("Virhe:", err);
  }
}

//Rekisteröidään /script/x/update-temp -osoite
HTTPServer.registerEndpoint('update-temp', onHttpRequest);