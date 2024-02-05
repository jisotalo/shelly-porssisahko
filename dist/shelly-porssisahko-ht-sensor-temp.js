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
let C_HIST=24,C_ERRC=3,C_ERRD=120,C_DEF={mode:0,m0:{cmd:0},m1:{lim:0},m2:{per:24,cnt:0,lim:-999,sq:0,m:999},vat:24,day:0,night:0,bk:0,err:0,outs:[0],fh:0,fhCmd:0,inv:0,min:60,oc:0},_={s:{v:"2.11.2",dn:"",st:0,str:"",cmd:-1,chkTs:0,errCnt:0,errTs:0,upTs:0,timeOK:0,configOK:0,fCmdTs:0,fCmd:0,tz:"+02:00",tzh:0,p:[{ts:0,now:0,low:0,high:0,avg:0},{ts:0,now:0,low:0,high:0,avg:0}]},p:[[],[]],h:[],c:C_DEF},l=!1,r=!1;function i(t,s){s-=t;return 0<=s&&s<3600}function a(t){return Math.floor((t?t.getTime():Date.now())/1e3)}function n(t,s,e){let n=t.toString();for(;n.length<s;)n=e?e+n:" "+n;return n}function o(t){return t.getDate()}function u(t){let s=t.toString(),e=0;"+0000"==(s=s.substring(3+s.indexOf("GMT")))?(s="Z",e=0):(e=+s.substring(0,3),s=s.substring(0,3)+":"+s.substring(3)),s!=_.s.tz&&(_.s.p[0].ts=0),_.s.tz=s,_.s.tzh=e}function f(t){console.log((new Date).toString().substring(16,24)+":",t)}function c(){for(;_.h.length>=C_HIST;)_.h.splice(0,1);_.h.push([a(),r?1:0,_.s.st])}function d(){var t=new Date;_.s.timeOK=2e3<t.getFullYear()?1:0,_.s.dn=Shelly.getComponentConfig("sys").device.name,!_.s.upTs&&_.s.timeOK&&(_.s.upTs=a(t))}function p(t){Shelly.call("KVS.Get",{key:"porssi-config"},function(s,t,e,n){_.c=s?s.value:{},"function"==typeof USER_CONFIG&&(_.c=USER_CONFIG(_.c,_,!0));{s=function(t){_.s.configOK=t?1:0,_.s.chkTs=0,n&&(l=!1,Timer.set(1e3,!1,m))};let t=0;if(C_DEF){for(var o in null==_.c.fhCmd&&null!=_.c.fh&&(_.c.fhCmd=_.c.fh),C_DEF)if(void 0===_.c[o])_.c[o]=C_DEF[o],t++;else if("object"==typeof C_DEF[o])for(var r in C_DEF[o])void 0===_.c[o][r]&&(_.c[o][r]=C_DEF[o][r],t++);void 0!==_.c.out&&(_.c.outs=[_.c.out],_.c.out=void 0),C_DEF=null,0<t?Shelly.call("KVS.Set",{key:"porssi-config",value:_.c},function(t,s,e,n){0!==s&&f("chkConfig() - virhe:"+s+" - "+e),n&&n(0===s)},s):s&&s(!0)}else s&&s(!0)}},t)}function m(){try{l||(l=!0,d(),_.s.configOK?t(0)?s(0):!function(){if(0==_.s.chkTs)return 1;var t=new Date,s=new Date(1e3*_.s.chkTs);return s.getHours()!=t.getHours()||s.getFullYear()!=t.getFullYear()||0<_.s.fCmdTs&&_.s.fCmdTs-a(t)<0||0==_.s.fCmdTs&&_.c.min<60&&t.getMinutes()>=_.c.min&&_.s.cmd+_.c.inv==1}()?t(1)?s(1):l=!1:g():p(!0))}catch(t){f("loop() - virhe:"+t),l=!1}}function t(t){var s=new Date;let e=!1;if(1==t)e=_.s.timeOK&&0===_.s.p[1].ts&&s.getHours()>=13+_.s.tzh;else{let t=o(new Date(1e3*_.s.p[0].ts))!==o(s);t&&0<_.s.p[1].ts&&o(new Date(1e3*_.s.p[1].ts))!==o(s)&&(_.p[0]=_.p[1],_.s.p[0]=Object.assign({},_.s.p[1]),_.s.p[0].ts=a(),_.s.p[1].ts=0,_.p[1]=[],t=!1),e=_.s.timeOK&&(0==_.s.p[0].ts||t)}return _.s.errCnt>=C_ERRC&&a(s)-_.s.errTs<C_ERRD?e=!1:_.s.errCnt>=C_ERRC&&(_.s.errCnt=0),e}function s(c){try{let r=new Date;u(r);var s=1==c?new Date(864e5+new Date(r.getFullYear(),r.getMonth(),r.getDate()).getTime()):r;let t=s.getFullYear()+"-"+n(1+s.getMonth(),2,"0")+"-"+n(o(s),2,"0")+"T00:00:00"+_.s.tz.replace("+","%2b");var e=t.replace("T00:00:00","T23:59:59");let i={url:"https://dashboard.elering.ee/api/nps/price/csv?fields=fi&start="+t+"&end="+e,timeout:5,ssl_ca:"*"};r=null,t=null,Shelly.call("HTTP.GET",i,function(s,t,e){i=null;try{if(0!==t||null==s||200!==s.code||!s.body_b64)throw Error("virhe: "+t+"("+e+") - "+JSON.stringify(s));{s.headers=null,e=s.message=null,_.p[c]=[],_.s.p[c].avg=0,_.s.p[c].high=-999,_.s.p[c].low=999,s.body_b64=atob(s.body_b64),s.body_b64=s.body_b64.substring(1+s.body_b64.indexOf("\n"));let t=0;for(;0<=t;){s.body_b64=s.body_b64.substring(t);var n=[t=0,0];if(0===(t=1+s.body_b64.indexOf('"',t)))break;n[0]=+s.body_b64.substring(t,s.body_b64.indexOf('"',t)),t=2+s.body_b64.indexOf('"',t),t=2+s.body_b64.indexOf(';"',t),n[1]=+(""+s.body_b64.substring(t,s.body_b64.indexOf('"',t)).replace(",",".")),n[1]=n[1]/10*(100+(0<n[1]?_.c.vat:0))/100;var o=new Date(1e3*n[0]).getHours();n[1]+=7<=o&&o<22?_.c.day:_.c.night,_.p[c].push(n),_.s.p[c].avg+=n[1],n[1]>_.s.p[c].high&&(_.s.p[c].high=n[1]),n[1]<_.s.p[c].low&&(_.s.p[c].low=n[1]),t=s.body_b64.indexOf("\n",t)}if(s=null,_.s.p[c].avg=0<_.p[c].length?_.s.p[c].avg/_.p[c].length:0,_.s.p[c].ts=a(r),1==c&&_.p[c].length<23)throw Error("huomisen hintoja ei saatu")}}catch(t){f("getPrices() - virhe:"+t),_.s.errCnt+=1,_.s.errTs=a(),_.s.p[c].ts=0,_.p[c]=[]}1==c?l=!1:Timer.set(1e3,!1,g)})}catch(t){f("getPrices() - virhe:"+t),_.s.p[c].ts=0,_.p[c]=[],1==c?l=!1:Timer.set(1e3,!1,g)}}function g(){try{"function"==typeof USER_CONFIG&&(_.c=USER_CONFIG(_.c,_,!1)),r=!1;var t,s,e=new Date;function n(t){r!=t&&(_.s.st=12),r=t,_.c.inv&&(r=!r),1==_.c.oc&&_.s.cmd==r&&(f("logic(): lähtö on jo oikeassa tilassa"),c(),_.s.cmd=r?1:0,_.s.chkTs=a(),l=!1);let s=0,e=0;for(let t=0;t<_.c.outs.length;t++)!function(o,t){var s="{id:"+o+",on:"+(r?"true":"false")+"}";Shelly.call("Switch.Set",s,function(t,s,e,n){0!=s&&f("setRelay() - ohjaus #"+o+" epäonnistui: "+s+" - "+e),n(0==s)},t)}(_.c.outs[t],function(t){s++,t&&e++,s==_.c.outs.length&&(e==s&&(c(),_.s.cmd=r?1:0,_.s.chkTs=a()),l=!1)})}u(e),!function(){if(_.s.timeOK&&0!=_.s.p[0].ts){var s=a();for(let t=0;t<_.p[0].length;t++)if(i(_.p[0][t][0],s))return _.s.p[0].now=_.p[0][t][1];return _.p[0].length<24&&(_.s.p[0].ts=0),_.s.p[0].now=0}_.s.p[0].now=0}(),0===_.c.mode?(r=1===_.c.m0.cmd,_.s.st=1):_.s.timeOK&&0<_.s.p[0].ts&&o(new Date(1e3*_.s.p[0].ts))===o(e)?1===_.c.mode?(r=_.s.p[0].now<=("avg"==_.c.m1.lim?_.s.p[0].avg:_.c.m1.lim),_.s.st=r?2:3):2===_.c.mode&&(r=function(){if(0!=_.c.m2.cn){_.c.m2.cnt=Math.min(_.c.m2.cnt,_.c.m2.per);var n=[];for(h=0;h<_.p[0].length;h+=_.c.m2.per){var o=[];for(ind=h;ind<h+_.c.m2.per&&!(ind>_.p[0].length-1);ind++)o.push(ind);if(_.c.m2.sq){let s=999,e=0;for(A=0;A<=o.length-_.c.m2.cnt;A++){let t=0;for(b=A;b<A+_.c.m2.cnt;b++)t+=_.p[0][o[b]][1];t/_.c.m2.cnt<s&&(s=t/_.c.m2.cnt,e=A)}for(A=e;A<e+_.c.m2.cnt;A++)n.push(o[A])}else{for(A=1;A<o.length;A++){var t=o[A];for(b=A-1;0<=b&&_.p[0][t][1]<_.p[0][o[b]][1];b--)o[b+1]=o[b];o[b+1]=t}for(A=0;A<_.c.m2.cnt;A++)n.push(o[A])}}var e=a();let s=!1;for(let t=0;t<n.length;t++)if(i(_.p[0][n[t]][0],e)){s=!0;break}return h=null,A=null,b=null,s}}(),_.s.st=r?5:4,!r&&_.s.p[0].now<=("avg"==_.c.m2.lim?_.s.p[0].avg:_.c.m2.lim)&&(r=!0,_.s.st=6),r)&&_.s.p[0].now>("avg"==_.c.m2.m?_.s.p[0].avg:_.c.m2.m)&&(r=!1,_.s.st=11):_.s.timeOK?(_.s.st=7,t=1<<e.getHours(),(_.c.bk&t)==t&&(r=!0)):(r=1===_.c.err,_.s.st=8),_.s.timeOK&&0<_.c.fh&&(s=1<<e.getHours(),(_.c.fh&s)==s)&&(r=(_.c.fhCmd&s)==s,_.s.st=10),r&&_.s.timeOK&&e.getMinutes()>=_.c.min&&(_.s.st=13,r=!1),_.s.timeOK&&0<_.s.fCmdTs&&(0<_.s.fCmdTs-a(e)?(r=1==_.s.fCmd,_.s.st=9):_.s.fCmdTs=0),"function"==typeof USER_OVERRIDE?USER_OVERRIDE(r,_,n):n(r)}catch(t){f("logic() - virhe:"+t),l=!1}}let h=0,A=0,b=0;f("shelly-porssisahko v."+_.s.v),f("URL: http://"+(Shelly.getComponentStatus("wifi").sta_ip??"192.168.33.1")+"/script/"+Shelly.getCurrentScriptId()),HTTPServer.registerEndpoint("",function(e,n){try{if(l)return e=null,n.code=503,void n.send();var o=function(t){var s={},e=t.split("&");for(let t=0;t<e.length;t++){var n=e[t].split("=");s[n[0]]=n[1]}return s}(e.query);e=null;let t="application/json",s=(n.code=200,!0);var r="text/html",i="text/javascript";"s"===o.r?(d(),n.body=JSON.stringify(_),s=!1):"r"===o.r?(p(_.s.configOK=!1),_.s.p[0].ts=0,_.s.p[1].ts=0,n.code=204,s=!1):"f"===o.r&&o.ts?(_.s.fCmdTs=+(""+o.ts),_.s.fCmd=+(""+o.c),_.s.chkTs=0,n.code=204,s=!1):o.r?"s.js"===o.r?(n.body=atob("H4sIAAAAAAAACo1W4W7bNhB+FYXrAhJmCKft/thTjbbJ1nVJM9RegaEoFkaiI9o06ZAnt4art8mb5MV2lGRHCdx2f+KY/O7uu7vvjjYKkr/fn6WEcPwYx8+bkEL6IndZuVAWxE2p/HqsjMrAeQqMn7z6PaUsfbGp+HjycnL673jyPv1I/ry7XVurAyi4u727tYTHo6BdMZNlwG9vtAWZSGNU4uVM2t3R2uhHJ0onhTQrvVhqmaA7Y+5uk4iYyXlwxsgd8n/C6qhSW5ksI7kaeLSN+UH6RVkGKC20bBMaGaClm0mOdnN0r1XuQpAs+ry7xWigjdzCawjadFF/yfncHW0RP4dEBtAPLwDKpA77oBYLZK8XeksvFhYw3gyLmoS518sdTUTPtZ85DSBjspMSO2CT5nahbVmChmQeHSiANfnEzy9OOg173J0YEv9/G8tn29ouJESOVgOaB5Cg0pXTedLnr1+N04+f+ELVckDluKWyE3mVyrC2WYIi2jTIgzSFw0NC4ufXrxRSAvLqKPrC0Ix/1jZ3n4VxmcTMrChkKFIYrqRPZHoTKPmJ9IAN5eEhlSIrVDZXeXrQZ5yQNG0A2VGECG2t8m8m52eHh/KzxNSXblkapHyytnKhsxMJkkKPiAIWBhNt7SquVtK8dlgBjQ7GWazxRF6HlLbcnDVO5k1itfbbVOk+7iKUVwG8ttf0uLcXgGfqy8U0ZsYYht8/bC+NoUQAlkhMnT+VWYGlewFC5vnpCtFncdiQLyVZIe21Ihw6zEBgP68VCJ2zijGOTmOIP3LEoDsayxvqTEOs4e6a7SHR4LBVOu0P9a+tmTDKXkMx1L0ea48+6k9NEybqC4xiVem+GzaYKsB0OnfBZ0xAoSydljaLpaI5dott4l8BaEQf33u2qSN4zK9ivONsKT3m8s7lSni1cCv1utAm74SL+D3aaBsMXMYeg19vTk4/1IqNy7FHRj5FvaDPpZGZorWMUUbYoN3RVlrY2FrBKm2UiJ1o1McPjtlQCTcfUSy77Ig2VSIm+y0xIpYNHpuQU++dj94B9ZZE+0FCekrAF6hQclEzbJM5i/tQCRXBeFBVvOXTZoxB40S1SUfeuuXdNEqyoZ5SjazZxuCTAaktjRl6BaW3ydP+cxxtLZqJxjGFVI0acy1muEooG2y/Np1EJbVovnHzwUGfZ9iswe4Q2e++RMHwOjGoqjbiw4Rkj8Skuwas8Xu8x+/lk42sBsmTTRdfJRSPH3Cs2GUTNqZa3RdzL4XWKTp5O754J5rx19N1LDa7fMjm6LjL4xsm3dAVx4HFPXwSly/OOFqCaBqo4lS4cbNtGAo/H+PYA33KSZ+wSjzZUEJ6uIdqg3NUVYHV3wO8bBC/YcB/lPSUtTEnOu53nAjURxTJMYsrCJFvXOnDd6NjV0gbF58iUD9AUznaGYwVljf/vsGARCM1ImIXxRgdvmv5bGfZKem+FO9vsR09guq6L0eEcsV4ucQeqTPnlp2HoX6OwlJbXAoB1iiQlQ76ShsN65TU/xtFhtsxg0frYbdncOsPIW6J5smFejUMfuk/i4+oiDrCOWvuokhYfI0fPBPY5m8vAH5vWU3xZ5Ex6x8wL3SeK/w5ElRdA1cCvc+fH6vnuFSGuC1HXt28RU+5WuHoY63vUZQN/wMZPoY6bwoAAA=="),t=i):"s.css"===o.r?(n.body=atob("H4sIAAAAAAAACo1VS2/jNhD+K8QGBZJsJEvOeutIaNCeFiiKopf2UvRAkUOLNUUKJOXHLvzfd0g9LDsO2ostDmeG33zzWjw+kkfialDqmLTGOicdrbeGBPE9eyC/digi0hlPlSEJqb1vi8Xi30GSComKQehQupG+7qqUmWZSWLzj+zfJQDsoyJff/yS/CAHWkC+gwVJF/ugqJdmoQnbPaUYeF2j0jVTmkDj5VepNgd+Wg01QVJITnvjxiVDUYUYZW5A7YCIT+XgXjCnbbqzpNMfbJXuGVVYSJTUkNchN7QuSp5+gKYkw2odnEF6WvkwSQRupjgX5CyynmpakoYdkL7mvC/LpxQa94ZRn2Q/h2m6kRh+Edt6UpKWcR+Sr9oAqbcR956VXgOhmjw4wensM0HvTRKtowEx7vNTP0nXQp0pudOJAiYIIBYcENC+Jh4NP4lVBbAgzOEmFOqAPLl2r6LFXj3JPK4cXrXHSSxNMQFEvd1Be0pfTir2wyaQoKhDGwtN4pMKDjcnQHjRS++FDeX4OdRTMjCdtBdSGzPp6vA2RKkPRgwLRY/duDl0bPblKFK1AzW8rZdj2KsvL9MdV4GvKR4aML4NkKCk76GGanFGSY7ifabZelYR11oXiao3EuOz07hAmvnxRAWcaMUyjOo9IvyZSczigCubGtGc4IT7EMsOVY02RK+KFEOVU4mMRm5Yy6Y/ROhJUsBrYFvjHC1b+21FPwA0/0cXHq1inZ/NZWMve1LTzNGysxFIMv4mHBmUe0I/qGu3QWtjYIeEjGrtWxxqMHCeww9fcmOiR33QZG+7cuf15CiCeh/R5S7VrqUU/U47HyMdCHsSIe7za1zLka6wJymWHKFYhr1TLhvaJDVhzFwuMWiK1kDqancjPWzgKSxtwpA8o1AT+RTTYLNjSFmekh/vnzxmHzQPanPrWSBl79WFqvXr76nkhpHU+YbVUHDus2jwNaq5Bb/PbcS7sB1oqo5D3HVgvGVXjGMAg329nnAxJY0KaVew9nCNcWmDDODD7GFsDXNL7+QBc40B7COFFZM0c/42GvGiT0y2jq7CGYTg0SRiF54zFep3WQT8ts5nbtyTNbXNs80ohG321/A8S+sq9VnzlcjcBHQAMEM4vutAycebMK1HRNuzC8estPWfMN/DO90rffCzkYTb3cZGO00rI+ZRC77HMIy4IPba3tI2K+3ydzTTXw75KG59n53z0DI53yEY+8BWHQlC3qzkpcfdlw3xp1Oo6s2MI1RO5cwlr3qnoE3Za2/m//bGFn6oOU67/ud6heZgHp3OnfLux14fo+v08042Ej7w+B0y36XRdg/DDOn67Gb4D6/NsSlwJAAA="),t="text/css"):"status"===o.r?(n.body=atob("H4sIAAAAAAAACpWSS07DMBCGr2JlBYumyQKJhesDoEos6AUmtqu49SPEE0rukzNwgVwMN682EKAsnMXMN5//sUIRMi0J1+D9JjKE84hRLMMRQ/GUPibsOT9A5Ymt8dxQYuNX3Ai2BQEIYOM4HoZ68uilJV5qhXLiPY5i9tI2+bH9sCRXFmFmte7EZiqPdV0UagKME3IitqAQZbjLKnNBhJ2AndIw1ZXdO0bX3caMCvU2rr3X7ySc4M5W3Olo1kR+7qXElA/fGgbTJBSzcSOCbWPbJnzoOgtXBTrE6F64S1CoZDHAtWrnUFZYGfhF1o+Fqd56Je2ppfj6hvh55Yy0Fn5Kn/4j/R+u9GvmS/IOWLD3hOelKpCV8vXJ30VBEf4swMrHBx/d0/XQ/gQ7pTjs2AIAAA=="),t=r):"status.js"===o.r?(n.body=atob("H4sIAAAAAAAACoVW627bNhT+v6eQ2cwlJ1mR3GJDItFGb0OGtmixGNiPwFgYiYlYy5Qq0k4D2//6KHmGvoBfbIe6Wc6cNBebPDyXj4fnfOQq5dqa0AvP8aZOQge+I+nzUBejUMdWlKUqZ5KiF2j0TlhLwdPtvaUFjzOlWHis4xF8FKPnwZIVlqZM3ckIEzpa6eJuJa7xMhOx5fUoVZppToyoVw11UmS31ruiyAqMZGbFTDNEAoMmrbSdnKauciL4jEr/nHph6uZuyuWNThxNcZxFizmX2tVCp5xeHq1yN5Zj82Eja2ChU4Q2n7c/CqWE2t4ns+2PS+erwuiZGkTzGBFXSMmLs8nHDzR3QTJGn7fft98/fNh+B9vPn/46R/v6St+l3IW8ZEVjcVNwLkG74HGrPM9ivuf946e37/49n/x9EblmbdooxvIBiFiu1ygUJt1Mcc21XoTHYtR6ltntngWH3eYX3tSFBVdnf4pvPMZDAtuPjmf/JCYDjanSe5b4hFIIqPT4fPJqUqEz06lb8DxlEcfoV4Wc66yYM/0WDmQi5hxLfmuZCfb5i99y9/rNPJ4o4vR8Qk4f+CE2jiDecowsPNveb++l5kJySQwo4iDUK8MX/T4+iNCmKLyCQoR/ZJeapNmKkNfZ3mbg6L0QDiSZTdQYfUq+sIWyNCtmQpU5tJBdbeTQJkorwI8mjQFj0spKJ5q5ros2UEyXNjYhymRrCHIG0Zm28u29WAoT5O6JIB+ZTtw5+4ZbB44Z+WZETGjwprMvzEpYGd0EbXe73N/q++39nZTVxu6so9XTJ7TIzd425RGUZtAIYIRxq0jcG15BJoNDxrtlcgzi49898zd8Sdp6Qz6CCGUmzDkTyNaSF0pkkLTcXTpYO9ywguli1aGXlClFkbaubtDoPVczwYplVtHKw+Uzli6FPLz2nqUpbxYrPiq4XhTS8ijV5rCULU+VffmLVf8YBO3ETOPR0Uq7bHnT6aFN1UKl2wPK6V7D/UQ5ETfJz7RL6Jcb4ijaNEQuvL2z13X9tKWRC/+Agg8KuHBEk3NNn1sHk/5KzNgj+YZ6fGSp6q5Oth1GL6YBcLtnOjq/KMqqNmQ/BIqpGI9AlWLD7sDiATc8btQqKg+4bbSGbs4LUgKOjcPGQlMe6JDbjUq/38N6tOdh4JNA2zaJ3XyhEqyJQVPqq69kVTk5OTmBu81r3SoYq5DGjYtSPZI6UOBo1UDdgVAAQtmtlgkHuCsYF/GFnk4h7wE/bjRCDcQG2FsBRFdks3MowaHcd8gq/MYb2fBU8QM4fDBrQJdGdVsZo1KNUz3wAy+kvN+v4SmDLWyx8hrrYEBgYvtTamRBPVYdjB4EexzhBrI8AZc9ujv39RqaDs4oAeE+xZxli0IBiazq7EM+elh0i5cET1dJvdesyTrco3O6R1mZaY6gwo69tvr6ffj2zH29XvsdaWbSQjGCxkel1HdTMR/XmwHpaSMj6/WwY8gAdpQuYq4wJwf8DN2HXkDywMcBo/8HH9bBoZqvk74fhkCk1HxBcRkR3L9dKTHNcUAXUrGvToLybi5LtKeJw0dUdToMq11LmnOSxBHdm/kS6MQqH0MUHa3mneN95NRLCMUYXWdSD2450KE+vcrSOCjfaEcrOUZXLJrdFNlCxqfPeGx+q0XUJdSSUhs+uhYajZoLsLyi5uYlsnnIwg0PZ+WF+zPObll7jPrPvg3/8F9WOA7oVYxdFTxOHql3x7TIrkE29d20E+z1gC03JFDYaxkebgC4ErDfCoDxofUipiPDdKsokyqDRykv39LQQ9D/dATKunsxIBQ88vBFE5Eyi4v2Xf/Ek7d65PL26VoPy0dpPa6evvXEgG+GojP2O+LduHrV1RPzFtxsAo2J8+b1ecPrm/8AUpoQxrAMAAA="),t=i):"history"===o.r?(n.body=atob("H4sIAAAAAAAACmWOuw7CMAxFfyXKBEOI2NNIrCwMfEFeUBejQGwQ/XtMeQipg23pnCvbLsNdJQxEnT7gQ0mZc40mVdTe/UlOL7cWyCFikdGk8k+reNR+A6cwg7t+CDea4X1B4OLstCfWPCrIHZkeiL3Q9xErH3w7pQYX9q1ct7TQEpiytY2rgfTS2Y9/AkYQ4FXSAAAA"),t=r):"history.js"===o.r?(n.body=atob("H4sIAAAAAAAACnVR204cMQz9lWAoSrrDdKFvzGYRtEh9AFXqzttqBdGMl5kqTLa2Aa1G+Rv+hB9rshShPiDlZh+fY8cePYpCO60eHSmxjrdDo42dj0LbsV/rx9C3arpnLYsTNNm19/qUjsKTuiQKpGEIqnXiwPzT2YVUKVjKzqZdciDRWgpK2rScro4kHaaYzjLocbiT7vAQU55kJySD4x/WsM9HXc8CpuyHAelHfX1lAap1SpozkQprlShmzBZbmAnNoWCr85rY25m0qvGOE7TuBeYHY6LeO6n7e9QDPqnvqVB9jF8/56qMibMv0s5vzWTHZNl6tNAEH+j0YKTl8eoM7ghxgFMgbCFmxVf3z+63e2C1eXl+efYeU8CbJ/QM/+kmzqI+ry9vFvWvJS1PVquzknDjXYMalP7EyrH0BgqAt4ImkO70teqDpkwsR3xvXoyxcdJ0WszYhIGDxxJ3oxJTfNRXibESbYpvF4ty88CZHP8C4awwCiACAAA="),t=i):"config"===o.r?(n.body=atob("H4sIAAAAAAAACp1U207jMBD9FSvSCngIaUMX0Cq1lAdQW2iKtoHVPrqOIW4cO8ROofu8n9Jv2B/Ij61zLclyESsVtczM8ZnLmXECugGYISnHhsJgZcCf1xfT5YXvWNoDHYVWjDQBMcDY0LZU/wW18Wl4PoCLcI0yqVCCtAM6kjCCFaDBOBYBgY5VGRpkGa4U2iAFWL4Lg/yPKnGUJ1kJE5mSQNJfZDxqQddVJAeiJOsRCQwdkSgqONgglpHxALqUI6BQGlGdGZESdQOG8A5RDuIsUyor3a+lmcmYch1Cexlqa5WgDYH+3UCu8l2+44pQTjqJVji1TcgYhwRHK/FcvEL5pmVb6vqioj73+q7LVfSp4frShlOaKhGjSGZlaoMz07a/gT0qQNsWha3oR+jsRx2r4QDatjk4e4ng9CFUPUytgorzDqW6XVJlnJf9KECrqHVP8p3SH8rQx5WTNIXAYWhFGLgXafn/wrMWl5eOVVrbV29QFAmzfDGSpBpDQBSiTDbVsK9aClkco3QLvXy31VlYCaVMqGKotaOWsua+DxtByxgUrdCatkqv/q6f3lu6C1KEF1tylf9eTheTmXu7/I9Nea8z8cDEcdBpTm3q9ef9BCdTz3e/uzP3U+lNKNcbg9aop/ahyWjcl8a7/DP3arnwwESreTqfuz7wbz1v+rmz4q4RX2uFi/5Vsc2EpL2Ft0fQHvVW3IZDu2s6h+ddwyk87RpGsPfKCTzpMUG7vRUgbHTqZ1zRuNj/NN/12mebmO83q4XcEB0aRfmONsJ+SxO2KR/bjSgPW1IwMX0+gdmbV0VTw/TYmnnV6LluKI1pWEz6LVT88YyNF/VJtCFV0it9TNs++YgxwjmC9dBfF4q/mM6nnrfw/4lSuOHYX60OTbHLIsWk5ntxKfT+rtIP0IJjRnE0PniiPBBPxyIh/NCwjKOD6jljGRLGthyEuo6iW0ZTiMQpTRRMyeNMHhq6RSYW/J4+HK+lcaSlUbn/AiT/QhZbBwAA"),t=r):"config.js"===o.r?(n.body=atob("H4sIAAAAAAAACoVW727bNhB/FZkLXLKWFdkr+sEybWxNim1tk6HOigLDMDMyHbOWKEU6uzUUvU3fpC+2IyXLUpNtX2zdH94d7+73k4pIghPz3igIE52DE3EqXWB8tpzCajZVOt2BA4dUcpKJlUqIo0WMwlkhS+LsRbSzApRkNj3HE8tgLzJHcpEfdEgxTgHZoVBruk/UyvF7nOcgQPb7vbjft4+sMCfCSu+FwX1OyQ9xspKEeUprmf1y8+4tf3d9cfn34ua9F4uUNiUmKahEd8swlU3PK8tsydx2vMox9IxYGZId5C2DEb1PidKUuKQ+q/QePcKNDLdyhT4oz0ktkgkhlddeQCsOSpV6JQ4tNUqVWqu7TdvfyoGZBXBCgnWSUSNI7gdyOn4RyMGAwYAvOwOxNdwmX4ijVpx8tCOZTSNxKyMHIzSqs4ISMpDMS8VqASIDOnaJTxi2yTrPnGXV9dttp+fgZTKNRCh/iiJKPmJHbgmzRQpOppDNzIrc7DQoO3ojXb9+3TwPT9qr6vEcz/zL5YS5XB3yP+q1VlvMQLo+K0/CcNSWRtY5m9UXW286FxOPLrbGiz1ZV9UXW81xA2jo3W77o+lUMs7Nn3tcyGKVhLtYavDudzI7LGQkQ0gyk2X5p8WNGchfS+ZhrksRbqjkM9kElvU6cGAlo1gTXgSTrTftZHOreRWvOsrRxJ9gB2rwKN3edaXrVQ/bix5WSpllneVG+Ynljv1hGK86jrHvoeop39EwUnG7gJGHito4HqYyaxvHHioaY6iha0RFY8zvuxWMvfz+qQLGw7gb5JT8u8rGtjKkP78sQwFmIKwwRJhE0rQCN0KysgwkZe6rnxdeusuNSxUuF3vDKWK1utzjzN+qHCRuGCVhpMItcS0F4jbNCumlmTQ+F3ItdhFQFhhWNLwnGt6rwI/ug2r7g4oWUUHE/o5wjkllXfvcqiZAWzoWCMtr3Gq7lMdcYamNP+I8L08jBZbtLLViOsCQ5gDyHH9MgGbV0IgEd0zUYj5zDDnuaGmRn7FYkjvaOgxorLdbbgKvNwi/ExRFtextSBaPMdnvUxvA/DxYXNjuRab+GnlrC71JfWBZJw6Gox6P7HFMbH7scfeYtv5/iEzMUpid4I9xU/cEkdY0/wRB2/vwaDiBkNUn3gnYYOu/UN+tHvHl87IOZ+dQIY0/CcRjZgsxHrbgZ7QWW01JHejVdoQXb7IeT7inEy08svpIfs+fAuSxkvGpknG7kkaHGjucnIvPQoFzJ+FCgKB/vH87eHaepeH5mw8LbyFhvpUHTtIky3M1RFCu1R3pV9B9NvhtcX3l5ZApfafWByoYC8a+j18XXoh7P28FXQzIPOPm4rCR2ix4ISKJLxVyI6JI4ksBYNfDMs1XUIn3qXigcVt+UNlGThyzP2yJzDz5Xp978AWsreGQOkPtgqvqxTLPxZ1hk5o+cMfD/+cP+wllP6lc4GmWxCmG/V1st8kw2XwSu20utbOVOSQO4JtYKi3mDvUd7uAgd44+bA9KS82w6XoXRT0OuOz4hptS4JZogLF5KrJc/qqBPk4AQuht4thcuZN++/rtKzbNoSOGX13KSROVYzo2RwIZEcZwB1R+Ja6wBw8PmKI74uVZYQZS4jzWfWSjs8Kfwtzu3zpKEPMXhgp18pmy85H8cfDSfw7PX/oYteyHfDkwW2sbO/Zf4FuyGjW5ftND8m9aDWYajOGgyn8ANg4bvN0KAAA="),t=i):n.code=404:(n.body=atob("H4sIAAAAAAAACqVTS27bMBC9CstFYaOWjO6KRGRQtAHarLooui1ocmxNTJMqZ2TDKHqbniEXyMVKfeJEaYIG6GakmTd8781IrF65aPnYQM07r6suCm/CRkHQ1Q7YCFubRMCq5XXxTleM7EF/ub1JREi3v+vt7U21HKrDgWB2oPYIhyYmFjYGhsBKHtBxrRzs0ULRJwsMyGh8QdZ4UG+lrhzuhfWGSHFshhSdelozg6cOajCMB6nJziegjc1Rv+7iubhqM4X4TJGNj2JWGVEnWKuauaGz5fIaB6Rco2CTNnnu76u8j61+gFRLo+ejxL3QaNus6FGuKwxNy6LbskrGYRxWZPrRzKogNtxSXjTYLWS7w/OOgLSovFmBF+uYJv13AkUP66/oTbUc3qcOivEj9Mso7in080P803SNxDEdn3f5qOFk81NfxxdbHXn+x2vmXOPmeatT/OT0ff7t220OL7U68EydDpFswoZ1biAWHy+/qQMGFw+lj9YwxlDmjWwwlBisbx3QTHaIryOxnJ97YOFUvqjtLustbALDcOmhyxQo7cpJaQbzhWkaCO5Djd4NHavojuWDateU4McVdfDPvUmC1JRFDqazPpWUrMq2L+BMXiQl30CZoPHGwkx2g8uFlBPNGc1/LSz9RekxbDNhRjKBV5L46IFqAJZde9lfxk5IUplz2csNrxP6XBjtZ5vlNcl8H8cd/wFnTmKS0gQAAA=="),t=r),n.headers=[["Content-Type",t]],s&&n.headers.push(["Content-Encoding","gzip"])}catch(t){f("http - virhe:"+t),n.code=500}n.send()}),Timer.set(1e4,!0,m),m();

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