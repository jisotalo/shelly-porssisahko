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
let C_HIST=24,C_ERRC=3,C_ERRD=120,C_DEF={mode:0,m0:{cmd:0},m1:{lim:0},m2:{per:24,cnt:0,lim:-999,sq:0,m:999,ps:0,pe:23,ps2:0,pe2:23,cnt2:0},vat:24,day:0,night:0,bk:0,err:0,outs:[0],fh:0,fhCmd:0,inv:0,min:60,oc:0},_={s:{v:"2.13.0",dn:"",st:0,str:"",cmd:-1,chkTs:0,errCnt:0,errTs:0,upTs:0,timeOK:0,configOK:0,fCmdTs:0,fCmd:0,tz:"+02:00",tzh:0,p:[{ts:0,now:0,low:0,high:0,avg:0},{ts:0,now:0,low:0,high:0,avg:0}]},p:[[],[]],h:[],c:C_DEF},m=!1,r=!1;function c(e,t){t-=e;return 0<=t&&t<3600}function i(e,t,s){return Math.min(s,Math.max(e,t))}function l(e){return Math.floor((e?e.getTime():Date.now())/1e3)}function o(e,t,s){let o=e.toString();for(;o.length<t;)o=s?s+o:" "+o;return o}function n(e){return e.getDate()}function a(e){let t=e.toString(),s=0;"+0000"==(t=t.substring(3+t.indexOf("GMT")))?(t="Z",s=0):(s=+t.substring(0,3),t=t.substring(0,3)+":"+t.substring(3)),t!=_.s.tz&&(_.s.p[0].ts=0),_.s.tz=t,_.s.tzh=s}function u(e){console.log((new Date).toString().substring(16,24)+":",e)}function h(){for(;0<C_HIST&&_.h.length>=C_HIST;)_.h.splice(0,1);_.h.push([l(),r?1:0,_.s.st])}function p(){var e=new Date;_.s.timeOK=2e3<e.getFullYear()?1:0,_.s.dn=Shelly.getComponentConfig("sys").device.name,!_.s.upTs&&_.s.timeOK&&(_.s.upTs=l(e))}function d(e){Shelly.call("KVS.Get",{key:"porssi-config"},function(t,e,s,o){_.c=t?t.value:{},"function"==typeof USER_CONFIG&&(_.c=USER_CONFIG(_.c,_,!0));{t=function(e){_.s.configOK=e?1:0,_.s.chkTs=0,o&&(m=!1,Timer.set(1e3,!1,A))};let e=0;if(C_DEF){for(var n in null==_.c.fhCmd&&null!=_.c.fh&&(_.c.fhCmd=_.c.fh),C_DEF)if(void 0===_.c[n])_.c[n]=C_DEF[n],e++;else if("object"==typeof C_DEF[n])for(var r in C_DEF[n])void 0===_.c[n][r]&&(_.c[n][r]=C_DEF[n][r],e++);void 0!==_.c.out&&(_.c.outs=[_.c.out],_.c.out=void 0),C_DEF=null,0<e?Shelly.call("KVS.Set",{key:"porssi-config",value:_.c},function(e,t,s,o){0!==t&&u("chkConfig() - virhe:"+t+" - "+s),o&&o(0===t)},t):t&&t(!0)}else t&&t(!0)}},e)}function A(){try{m||(m=!0,p(),_.s.configOK?e(0)?t(0):!function(){if(0==_.s.chkTs)return 1;var e=new Date,t=new Date(1e3*_.s.chkTs);return t.getHours()!=e.getHours()||t.getFullYear()!=e.getFullYear()||0<_.s.fCmdTs&&_.s.fCmdTs-l(e)<0||0==_.s.fCmdTs&&_.c.min<60&&e.getMinutes()>=_.c.min&&_.s.cmd+_.c.inv==1}()?e(1)?t(1):m=!1:f():d(!0))}catch(e){u("loop() - virhe:"+e),m=!1}}function e(e){var t=new Date;let s=!1;return s=1==e?_.s.timeOK&&0===_.s.p[1].ts&&15<=t.getHours():((e=n(new Date(1e3*_.s.p[0].ts))!==n(t))&&(_.s.p[1].ts=0,_.p[1]=[]),_.s.timeOK&&(0==_.s.p[0].ts||e)),_.s.errCnt>=C_ERRC&&l(t)-_.s.errTs<C_ERRD?s=!1:_.s.errCnt>=C_ERRC&&(_.s.errCnt=0),s}function t(i){try{let r=new Date;a(r);var t=1==i?new Date(864e5+new Date(r.getFullYear(),r.getMonth(),r.getDate()).getTime()):r;let e=t.getFullYear()+"-"+o(1+t.getMonth(),2,"0")+"-"+o(n(t),2,"0")+"T00:00:00"+_.s.tz.replace("+","%2b");var s=e.replace("T00:00:00","T23:59:59");let c={url:"https://dashboard.elering.ee/api/nps/price/csv?fields=fi&start="+e+"&end="+s,timeout:5,ssl_ca:"*"};r=null,e=null,Shelly.call("HTTP.GET",c,function(t,e,s){c=null;try{if(0!==e||null==t||200!==t.code||!t.body_b64)throw Error("virhe: "+e+"("+s+") - "+JSON.stringify(t));{t.headers=null,s=t.message=null,_.p[i]=[],_.s.p[i].avg=0,_.s.p[i].high=-999,_.s.p[i].low=999,t.body_b64=atob(t.body_b64),t.body_b64=t.body_b64.substring(1+t.body_b64.indexOf("\n"));let e=0;for(;0<=e;){t.body_b64=t.body_b64.substring(e);var o=[e=0,0];if(0===(e=1+t.body_b64.indexOf('"',e)))break;o[0]=+t.body_b64.substring(e,t.body_b64.indexOf('"',e)),e=2+t.body_b64.indexOf('"',e),e=2+t.body_b64.indexOf(';"',e),o[1]=+(""+t.body_b64.substring(e,t.body_b64.indexOf('"',e)).replace(",",".")),o[1]=o[1]/10*(100+(0<o[1]?_.c.vat:0))/100;var n=new Date(1e3*o[0]).getHours();o[1]+=7<=n&&n<22?_.c.day:_.c.night,_.p[i].push(o),_.s.p[i].avg+=o[1],o[1]>_.s.p[i].high&&(_.s.p[i].high=o[1]),o[1]<_.s.p[i].low&&(_.s.p[i].low=o[1]),e=t.body_b64.indexOf("\n",e)}if(t=null,_.s.p[i].avg=0<_.p[i].length?_.s.p[i].avg/_.p[i].length:0,_.s.p[i].ts=l(r),1==i&&_.p[i].length<23)throw Error("huomisen hintoja ei saatu")}}catch(e){u("getPrices() - virhe:"+e),_.s.errCnt+=1,_.s.errTs=l(),_.s.p[i].ts=0,_.p[i]=[]}1==i?m=!1:Timer.set(1e3,!1,f)})}catch(e){u("getPrices() - virhe:"+e),_.s.p[i].ts=0,_.p[i]=[],1==i?m=!1:Timer.set(1e3,!1,f)}}function f(){try{"function"==typeof USER_CONFIG&&(_.c=USER_CONFIG(_.c,_,!1)),r=!1;var e,t,s=new Date;function o(e){if(null==e)m=!1;else if(r!=e&&(_.s.st=12),r=e,_.c.inv&&(r=!r),1==_.c.oc&&_.s.cmd==r)u("logic(): lähtö on jo oikeassa tilassa"),h(),_.s.cmd=r?1:0,_.s.chkTs=l(),m=!1;else{let t=0,s=0;for(let e=0;e<_.c.outs.length;e++)!function(n,e){var t="{id:"+n+",on:"+(r?"true":"false")+"}";Shelly.call("Switch.Set",t,function(e,t,s,o){0!=t&&u("setRelay() - ohjaus #"+n+" epäonnistui: "+t+" - "+s),o(0==t)},e)}(_.c.outs[e],function(e){t++,e&&s++,t==_.c.outs.length&&(s==t&&(h(),_.s.cmd=r?1:0,_.s.chkTs=l()),m=!1)})}}a(s),!function(){if(_.s.timeOK&&0!=_.s.p[0].ts){var t=l();for(let e=0;e<_.p[0].length;e++)if(c(_.p[0][e][0],t))return _.s.p[0].now=_.p[0][e][1];return _.p[0].length<24&&(_.s.p[0].ts=0),_.s.p[0].now=0}_.s.p[0].now=0}(),0===_.c.mode?(r=1===_.c.m0.cmd,_.s.st=1):_.s.timeOK&&0<_.s.p[0].ts&&n(new Date(1e3*_.s.p[0].ts))===n(s)?1===_.c.mode?(r=_.s.p[0].now<=("avg"==_.c.m1.lim?_.s.p[0].avg:_.c.m1.lim),_.s.st=r?2:3):2===_.c.mode&&(r=function(){_.c.m2.ps=i(0,_.c.m2.ps,23),_.c.m2.pe=i(_.c.m2.ps,_.c.m2.pe,24),_.c.m2.ps2=i(0,_.c.m2.ps2,23),_.c.m2.pe2=i(_.c.m2.ps2,_.c.m2.pe2,24),_.c.m2.cnt=i(0,_.c.m2.cnt,0<_.c.m2.per?_.c.m2.per:_.c.m2.pe-_.c.m2.ps),_.c.m2.cnt2=i(0,_.c.m2.cnt2,_.c.m2.pe2-_.c.m2.ps2);var o=[];for(y=_.c.m2.per<0?1:_.c.m2.per,v=0;v<_.p[0].length;v+=y)if(!((C=-2==_.c.m2.per&&1<=v?_.c.m2.cnt2:_.c.m2.cnt)<=0)){var n=[];for(T=v,w=v+_.c.m2.per,_.c.m2.per<0&&0==v?(T=_.c.m2.ps,w=_.c.m2.pe):-2==_.c.m2.per&&1==v&&(T=_.c.m2.ps2,w=_.c.m2.pe2),b=T;b<w&&!(b>_.p[0].length-1);b++)n.push(b);if(_.c.m2.sq){let t=999,s=0;for(b=0;b<=n.length-C;b++){let e=0;for(g=b;g<b+C;g++)e+=_.p[0][n[g]][1];e/C<t&&(t=e/C,s=b)}for(b=s;b<s+C;b++)o.push(n[b])}else{for(b=0,g=1;g<n.length;g++){var e=n[g];for(b=g-1;0<=b&&_.p[0][e][1]<_.p[0][n[b]][1];b--)n[b+1]=n[b];n[b+1]=e}for(b=0;b<C;b++)o.push(n[b])}if(-1==_.c.m2.per||-2==_.c.m2.per&&1<=v)break}let t=l(),s=!1;for(let e=0;e<o.length;e++)if(c(_.p[0][o[e]][0],t)){s=!0;break}return s}(),_.s.st=r?5:4,!r&&_.s.p[0].now<=("avg"==_.c.m2.lim?_.s.p[0].avg:_.c.m2.lim)&&(r=!0,_.s.st=6),r)&&_.s.p[0].now>("avg"==_.c.m2.m?_.s.p[0].avg:_.c.m2.m)&&(r=!1,_.s.st=11):_.s.timeOK?(_.s.st=7,e=1<<s.getHours(),(_.c.bk&e)==e&&(r=!0)):(r=1===_.c.err,_.s.st=8),_.s.timeOK&&0<_.c.fh&&(t=1<<s.getHours(),(_.c.fh&t)==t)&&(r=(_.c.fhCmd&t)==t,_.s.st=10),r&&_.s.timeOK&&s.getMinutes()>=_.c.min&&(_.s.st=13,r=!1),_.s.timeOK&&0<_.s.fCmdTs&&(0<_.s.fCmdTs-l(s)?(r=1==_.s.fCmd,_.s.st=9):_.s.fCmdTs=0),"function"==typeof USER_OVERRIDE?USER_OVERRIDE(r,_,o):o(r)}catch(e){u("logic() - virhe:"+JSON.stringify(e)),m=!1}}let v=0,b=0,g=0,y=0,C=0,T=0,w=0;u("shelly-porssisahko v."+_.s.v),u("URL: http://"+(Shelly.getComponentStatus("wifi").sta_ip??"192.168.33.1")+"/script/"+Shelly.getCurrentScriptId()),HTTPServer.registerEndpoint("",function(s,o){try{if(m)return s=null,o.code=503,void o.send();var n=function(e){var t={},s=e.split("&");for(let e=0;e<s.length;e++){var o=s[e].split("=");t[o[0]]=o[1]}return t}(s.query);s=null;let e="application/json",t=(o.code=200,!0);var r="text/html",c="text/javascript";"s"===n.r?(p(),o.body=JSON.stringify(_),t=!1):"r"===n.r?(d(_.s.configOK=!1),_.s.p[0].ts=0,_.s.p[1].ts=0,o.code=204,t=!1):"f"===n.r&&n.ts?(_.s.fCmdTs=+(""+n.ts),_.s.fCmd=+(""+n.c),_.s.chkTs=0,o.code=204,t=!1):n.r?"s.js"===n.r?(o.body=atob("H4sIAAAAAAAACo1W4W7bNhB+FYXrAhJmCKft/thTjbbJ1nVJM9RegaEoFkaiI9o06ZAnt4art8mb5MV2lGRHCdx2f+KY/O7uu7vvjjYKkr/fn6WEcPwYx8+bkEL6IndZuVAWxE2p/HqsjMrAeQqMn7z6PaUsfbGp+HjycnL673jyPv1I/ry7XVurAyi4u727tYTHo6BdMZNlwG9vtAWZSGNU4uVM2t3R2uhHJ0onhTQrvVhqmaA7Y+5uk4iYyXlwxsgd8n/C6qhSW5ksI7kaeLSN+UH6RVkGKC20bBMaGaClm0mOdnN0r1XuQpAs+ry7xWigjdzCawjadFF/yfncHW0RP4dEBtAPLwDKpA77oBYLZK8XeksvFhYw3gyLmoS518sdTUTPtZ85DSBjspMSO2CT5nahbVmChmQeHSiANfnEzy9OOg173J0YEv9/G8tn29ouJESOVgOaB5Cg0pXTedLnr1+N04+f+ELVckDluKWyE3mVyrC2WYIi2jTIgzSFw0NC4ufXrxRSAvLqKPrC0Ix/1jZ3n4VxmcTMrChkKFIYrqRPZHoTKPmJ9IAN5eEhlSIrVDZXeXrQZ5yQNG0A2VGECG2t8m8m52eHh/KzxNSXblkapHyytnKhsxMJkkKPiAIWBhNt7SquVtK8dlgBjQ7GWazxRF6HlLbcnDVO5k1itfbbVOk+7iKUVwG8ttf0uLcXgGfqy8U0ZsYYht8/bC+NoUQAlkhMnT+VWYGlewFC5vnpCtFncdiQLyVZIe21Ihw6zEBgP68VCJ2zijGOTmOIP3LEoDsayxvqTEOs4e6a7SHR4LBVOu0P9a+tmTDKXkMx1L0ea48+6k9NEybqC4xiVem+GzaYKsB0OnfBZ0xAoSydljaLpaI5dott4l8BaEQf33u2qSN4zK9ivONsKT3m8s7lSni1cCv1utAm74SL+D3aaBsMXMYeg19vTk4/1IqNy7FHRj5FvaDPpZGZorWMUUbYoN3RVlrY2FrBKm2UiJ1o1McPjtlQCTcfUSy77Ig2VSIm+y0xIpYNHpuQU++dj94B9ZZE+0FCekrAF6hQclEzbJM5i/tQCRXBeFBVvOXTZoxB40S1SUfeuuXdNEqyoZ5SjazZxuCTAaktjRl6BaW3ydP+cxxtLZqJxjGFVI0acy1muEooG2y/Np1EJbVovnHzwUGfZ9iswe4Q2e++RMHwOjGoqjbiw4Rkj8Skuwas8Xu8x+/lk42sBsmTTRdfJRSPH3Cs2GUTNqZa3RdzL4XWKTp5O754J5rx19N1LDa7fMjm6LjL4xsm3dAVx4HFPXwSly/OOFqCaBqo4lS4cbNtGAo/H+PYA33KSZ+wSjzZUEJ6uIdqg3NUVYHV3wO8bBC/YcB/lPSUtTEnOu53nAjURxTJMYsrCJFvXOnDd6NjV0gbF58iUD9AUznaGYwVljf/vsGARCM1ImIXxRgdvmv5bGfZKem+FO9vsR09guq6L0eEcsV4ucQeqTPnlp2HoX6OwlJbXAoB1iiQlQ76ShsN65TU/xtFhtsxg0frYbdncOsPIW6J5smFejUMfuk/i4+oiDrCOWvuokhYfI0fPBPY5m8vAH5vWU3xZ5Ex6x8wL3SeK/w5ElRdA1cCvc+fH6vnuFSGuC1HXt28RU+5WuHoY63vUZQN/wMZPoY6bwoAAA=="),e=c):"s.css"===n.r?(o.body=atob("H4sIAAAAAAAACo1VS2/jNhD+K8QGBZKsJUvJeutIaNCeFiiKopf2UvRAUUOLNUUKJOXHLvzfd0g9TDsO2ostDmeG33zzWj4+kkdiG5DymHTaWCssbbaaePE9eyC/9igiwmpHpSYJaZzriuXy31GScoGKXmhRuhGu6auU6XZWWL7j+zfBQFkoyJff/yS/cA5Gky+gwFBJ/ugrKdikQnbPaUYel2j0jVT6kFjxVahNgd+mBpOgqCQnPNXHBaGow7TUpiB3wHjG8+nOG1O23Rjdqxpvn9gzrLKSSKEgaUBsGleQPP0EbUm4Vs4/g/Cy9GWWcNoKeSzIX2BqqmhJWnpI9qJ2TUE+vRivN57yLPvBX5uNUOiD0N7pknS0rgPyVXdAlS7gvnPCSUB00aMjjMEeA3ROt8EqGDDdHS/1s3Tt9akUG5VYkLwgXMIhAVWXxMHBJeGqIMaH6Z2kXB7QRy1sJ+lxUA9yRyuLF522wgntTUBSJ3ZQXtKX04q9sNmkKCrg2sBiOlLuwIRkKAcKqf3woTw/hzoSIuNZWwI1PrOumW59pFJT9CCBD9idxWeaGL7SanaXSFqBjG8rqdn2KtNP6Y8rz9mckwxZf/KSsazMqIepslqKGkP+TLP1qiSsN9YXWKcFxmbmd8dQ8eWLKjhTiaFq2TtE+jURqoYDqmB+dHeG42NELBGuHOuKXJHPOS/nMp8KWXeUCXcM1oGkgjXAtlB/vGDlvx0NBNzwE1x8vIp1fjaPwnoaTHUXp2FjBJaj/00ctChzgH5k3yqL1tyELvEfwdh2KtRh4DiBHb5mp0RP/KZPoenO3Tuc5wDCeUyfM1TZjhr0M+d4inwq5lGMuKerfSN8vqaaoLXoEcXK55Uq0dIhsR5rbkOBUUOE4kIFsxP5eQtHbmgLlgwB+ZrAv4AGGwbb2uCcdHD//DmrYfOANqehPVLGXp2fXK/OvLq64MJYl7BGyBrLv9osRjXborf4dpoN+5GWSkvkfQfGCUblNAowyPdbGqdD0mqfZhn6D2dJLQywcSTofYithVrQ+3gIrnGoPfjwArI2xr8g7/XlRbecbtleRTfOxbFX/FQ8Jy6U7bwZhsGZRW7fchXb5tjtlURShqL5H1wMBXyt+FqL3Qx0BDBCOL9ofeeE0RMXpKSdX4vT11t6zphv4I1XzNCDzKcjWgG4U6ehxUU8rNB7qPaAC3yr7Q3tguI+X2eR5npy3ro8O+djYHBca56NfOQrzAavblYxKWENZuOYaeXqOrPTK9WC3NmEte8U9gkbruvd3+7YwU9VjylX/1yv09yPhdO5Yb7dWPFjdMOqjnQD4ROvzx7TbTpt3yJ8v5nfLojvVHl/tmcJAAA="),e="text/css"):"status"===n.r?(o.body=atob("H4sIAAAAAAAACpWSS07DMBCGr2JlBYumyQKJhesDoEos6AUmtqu49SPEE0rukzNwgVwMN682EKAsnMXMN5//sUIRMi0J1+D9JjKE84hRLMMRQ/GUPibsOT9A5Ymt8dxQYuNX3Ai2BQEIYOM4HoZ68uilJV5qhXLiPY5i9tI2+bH9sCRXFmFmte7EZiqPdV0UagKME3IitqAQZbjLKnNBhJ2AndIw1ZXdO0bX3caMCvU2rr3X7ySc4M5W3Olo1kR+7qXElA/fGgbTJBSzcSOCbWPbJnzoOgtXBTrE6F64S1CoZDHAtWrnUFZYGfhF1o+Fqd56Je2ppfj6hvh55Yy0Fn5Kn/4j/R+u9GvmS/IOWLD3hOelKpCV8vXJ30VBEf4swMrHBx/d0/XQ/gQ7pTjs2AIAAA=="),e=r):"status.js"===n.r?(o.body=atob("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"),e=c):"history"===n.r?(o.body=atob("H4sIAAAAAAAACmWOuw7CMAxFfyXKBEOI2NNIrCwMfEFeUBejQGwQ/XtMeQipg23pnCvbLsNdJQxEnT7gQ0mZc40mVdTe/UlOL7cWyCFikdGk8k+reNR+A6cwg7t+CDea4X1B4OLstCfWPCrIHZkeiL3Q9xErH3w7pQYX9q1ct7TQEpiytY2rgfTS2Y9/AkYQ4FXSAAAA"),e=r):"history.js"===n.r?(o.body=atob("H4sIAAAAAAAACnVR204cMQz9lWAoSrrDdKFvzGYRtEh9AFXqzttqBdGMl5kqTLa2Aa1G+Rv+hB9rshShPiDlZh+fY8cePYpCO60eHSmxjrdDo42dj0LbsV/rx9C3arpnLYsTNNm19/qUjsKTuiQKpGEIqnXiwPzT2YVUKVjKzqZdciDRWgpK2rScro4kHaaYzjLocbiT7vAQU55kJySD4x/WsM9HXc8CpuyHAelHfX1lAap1SpozkQprlShmzBZbmAnNoWCr85rY25m0qvGOE7TuBeYHY6LeO6n7e9QDPqnvqVB9jF8/56qMibMv0s5vzWTHZNl6tNAEH+j0YKTl8eoM7ghxgFMgbCFmxVf3z+63e2C1eXl+efYeU8CbJ/QM/+kmzqI+ry9vFvWvJS1PVquzknDjXYMalP7EyrH0BgqAt4ImkO70teqDpkwsR3xvXoyxcdJ0WszYhIGDxxJ3oxJTfNRXibESbYpvF4ty88CZHP8C4awwCiACAAA="),e=c):"config"===n.r?(o.body=atob("H4sIAAAAAAAACp1VS27bMBC9CiGgSLJQbLNpGwQyAS1a2PnYRe2k6JKmmIgWRaoi5dRd9yg+Qy+gi5XUzxHzQwrYsDUzb+ZxOG8URGwDCMdKjT1NwMpDPy4/Txefl8HAeFCg8YrTNiAFhHjGlptv1BjvR6dDNI/XuFAaZ9g4UKAop0QDFo1TGVEUDGpDi6zCtcYbrAEvd3FU/tUVjomsqGCy0Aoo9puOTzrQZR0pgKyKOYUkQYHMNJMCbDAv6HiIQiYw0DhPmGFGlcL9gBG6wUyAtCi0Lir3UzQLlTJhQpjD0FhrghAB87+FXJS7cic0ZYL2iNY4vc3omMSUJCv5y2ZhYtNVW5jzJfZ84eVNv5btU1vrXRfOWK5lihNVVNSGn3wIz8AeFeFthyKD5Hsc7K861aMhgtAffnqIEOwu1g6mmYK65g3OTbuULoSo+mFBq6RzT8qdNh/G8esnp3mOQMDxinJwK/PqeT4bzL98CQaVtcv6FSeJ9KuMiaL1NURUY8ZVexr+wYxCkaY436JZudsaFoOMMS61vdTG0YyyqX0btwOtUmBbYWZ6UHnNb5N6b+kLxIZblVyUfxbT+eQ8vF78h1Je6kw69Eka9ZrTmJz+vExwMp0tw2/hefgmehMmjGLwGjvTPvI5S93ReLH+eXixmM/AxEzz9OoqXILl9Ww2fdtaCddYrM2ES3erQD+juSN4eILgSexoHKIRdGyn6NSxfEQfHcsJcjO9R+8dC0RuZn+EjCDtg+0iOByBivyREwX7UbCOwkfd/gGByrBoGhEjzBK8KXecgcOEy6MzE2fctl/t/EOf1AvL5MW9nu1v0LRMtRd4NhwCH/Sd9IGzld6yEJqldqXl5e5RPiL2yyLus4GP6QD4BCH4IiPYp/Qof4/eE/kNQdhjWO8TaqKTpNyxdps8J0Toq5/dGqreJpktxs07C/iOSOoyDcxopRVJg74yLWApi+2VP4dKXxeW9+CACm9oTXpl3mDdeC0x51QIjBqlPa3O5Xx6NZ3N5stHUZq0Nfavil4Zu0BlTmhT78F6Nktzlb+CloJwRpLxwT0Tkbw/lhkVh97AOzqo03mLmHK+FSA257Dd8tqDKJKzTKOc/jxXh55pkU+kuGV3x2vlWe3U7n+0zowI0AgAAA=="),e=r):"config.js"===n.r?(o.body=atob("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"),e=c):o.code=404:(o.body=atob("H4sIAAAAAAAACqVTS27bMBC9CstFYaOWjO6KRGRQtAHarLooui1ocmxNTJMqZ2TDKHqbniEXyMVKfeJEaYIG6GakmTd8781IrF65aPnYQM07r6suCm/CRkHQ1Q7YCFubRMCq5XXxTleM7EF/ub1JREi3v+vt7U21HKrDgWB2oPYIhyYmFjYGhsBKHtBxrRzs0ULRJwsMyGh8QdZ4UG+lrhzuhfWGSHFshhSdelozg6cOajCMB6nJziegjc1Rv+7iubhqM4X4TJGNj2JWGVEnWKuauaGz5fIaB6Rco2CTNnnu76u8j61+gFRLo+ejxL3QaNus6FGuKwxNy6LbskrGYRxWZPrRzKogNtxSXjTYLWS7w/OOgLSovFmBF+uYJv13AkUP66/oTbUc3qcOivEj9Mso7in080P803SNxDEdn3f5qOFk81NfxxdbHXn+x2vmXOPmeatT/OT0ff7t220OL7U68EydDpFswoZ1biAWHy+/qQMGFw+lj9YwxlDmjWwwlBisbx3QTHaIryOxnJ97YOFUvqjtLustbALDcOmhyxQo7cpJaQbzhWkaCO5Djd4NHavojuWDateU4McVdfDPvUmC1JRFDqazPpWUrMq2L+BMXiQl30CZoPHGwkx2g8uFlBPNGc1/LSz9RekxbDNhRjKBV5L46IFqAJZde9lfxk5IUplz2csNrxP6XBjtZ5vlNcl8H8cd/wFnTmKS0gQAAA=="),e=r),o.headers=[["Content-Type",e]],t&&o.headers.push(["Content-Encoding","gzip"])}catch(e){u("http - virhe:"+e),o.code=500}o.send()}),Timer.set(1e4,!0,A),A();

/**
 * Tämä esimerkki hyödyntää Open-Meteo-palvelun sääennustetta halvimpien tuntien määrän valintaan
 * Mitä kylmempi lämpötila, sitä useampi halvempi tunti ohjataan ja samalla myös ohjausminuuttien määrää kasvatetaan.
 * 
 * Muokkaa alle sijaintisi koordinaatit - esimerkkinä Tampere
 * Löydät koordinaatit esim. https://www.openstreetmap.org/ - klikkaa hiiren oikealla ja valitse "näytä osoite"
 * 
 * Sen jälkeen muokkaa alempaa toimintalogiikka haluamaksesi
 */
let LATITUDE = "61.4991";
let LONGITUDE = "23.7871";

/**
 * Alkuperäiset asetukset
 */
let originalConfig = {
  hours: 0,
  minutes: 60
};

/**
 * Päivä, jonka lämpötilat on haettu
 */
let activeDay = -1;

/**
 * Päivän matalin ja korkein lämpötila
 */
let tempData = {
  min: null,
  max: null
};

/**
 * Käytetään USER_CONFIG hyödyksi ja tallennetaan alkuperäiset asetukset
 */
function USER_CONFIG(config, state, initialized) {
  //Tallenentaan alkuperäiset asetukset muistiin
  if (initialized) {
    //Suoritetaan lämpötilalogiikka
    activeDay = -1;

    originalConfig.hours = config.m2.cnt;
    originalConfig.minutes = config.min;

    console.log("Alkuperäiset asetukset:", originalConfig);
  }

  return config;
}

/**
 * Kun logiikka on suoritettu, katsotaan onko lämpötilan vaikutus jo tarkistettu tälle päivää
 * Jos ei ole, haetaan lämpötilat ja muutetaan tuntimääriä
 */
function USER_OVERRIDE(cmd, state, callback) {
  //Käytetää lähtökohtaisesti alkuperäisiin asetuksiin tallennettua tuntimäärää ja ohjausminuutteja
  //Näin ollen jos tallentaa asetukset käyttöliittymältä, tulee ne myös tähän käyttöön
  let hours = originalConfig.hours;
  let minutes = originalConfig.minutes;

  try {
    if (activeDay == new Date().getDate()) {
      console.log("Lämpötilat haettu jo tälle päivälle -> ei muutoksia:", tempData);
      callback(cmd);
      return;
    }

    let req = {
      url: "https://api.open-meteo.com/v1/forecast?latitude=" + LATITUDE + "&longitude=" + LONGITUDE + "&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1",
      timeout: 5,
      ssl_ca: "*"
    };

    console.log("Haetaan lämpötilatietoja:", req.url);
    
    Shelly.call("HTTP.GET", req, function (res, err, msg) {
      try {
        req = null;

        if (err === 0 && res != null && res.code === 200 && res.body) {
          let data = JSON.parse(res.body);
          res.body = null;

          //Tarkistetaan, onko vastaus validi
          if (data.daily.temperature_2m_min != undefined && data.daily.temperature_2m_max != undefined) {
            //Nyt meillä on alhaisin ja korkein lämpötila tälle päivälle
            tempData.min = data.daily.temperature_2m_min[0];
            tempData.max = data.daily.temperature_2m_max[0];

            console.log("Lämpötilat:", tempData);

            //------------------------------
            // Toimintalogiikka
            // muokkaa haluamaksesi
            //------------------------------

            //Muutetaan päivän alhaisimman lämpötilan perusteella lämmitystuntien määrää ja minuutteja
            if (tempData.min <= -15) {
              //Vuorokauden aikana alimmillaan alle -15 °C
              hours = 8;
              minutes = 60;

            } else if (tempData.min <= -10) {
              //Vuorokauden aikana alimmillaan -15...-10 °C
              hours = 7;
              minutes = 45;

            } else if (tempData.min <= -5) {
              //Vuorokauden aikana alimmillaan -10...-5 °C
              hours = 6;
              minutes = 45;

            } else {
              //Ei tehdä mitään --> käytetään käyttöliittymän asetuksia
            } 


            

            //------------------------------
            // Toimintalogiikka päättyy
            //------------------------------
            state.s.str = "Kylmintä tänään: " + tempData.min.toFixed(1) + "°C -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";
            console.log("Kylmintä tänään:", tempData.min.toFixed(1), "°C -> asetettu halvimpien tuntien määräksi ", hours, "h ja ohjausminuuteiksi", minutes, "min");


            //Tänään ei enää tarvitse hakea
            activeDay = new Date().getDate();
            
          } else {
            throw new Error("Virheellinen lämpötiladata");
          }
        } else {
          throw new Error("Lämpötilojen haku epäonnistui:" + msg);
        }

      } catch (err) {
        state.s.str = "Virhe lämpötilaohjauksessa:" + err;
        console.log("Virhe lämpötiloja käsitellessä:", err);
      }

      //Asetetaan arvot asetuksiin
      //HUOM: Jos käytät "oma valinta (2 jaksoa)", 2. jakson tunnit voit asettaa muuttujaan "state.c.m2.cnt2"
      state.c.m2.cnt = hours;
      state.c.min = minutes;

      //Pyydetään suorittamaan logiikka uusiksi
      callback(null);
      return;
    });

  } catch (err) {
    state.s.str = "Virhe lämpötilaohjauksessa:" + err;
    console.log("Virhe tapahtui USER_CONFIG-funktiossa. Virhe:", err);

    state.c.m2.cnt = hours;
    state.c.min = minutes;

    callback(cmd);
  }
}