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
let C_COUNT=3,C_HIST=24,C_ERRC=3,C_ERRD=120,C_DEF_I={en:0,mode:0,m0:{c:0},m1:{l:0},m2:{p:24,c:0,l:-999,s:0,m:999,ps:0,pe:23,ps2:0,pe2:23,c2:0},b:0,e:0,o:[0],f:0,fc:0,in:0,m:60,oc:0},C_DEF_C={g:"fi",vat:25.5,day:0,night:0},C_DEF_S={chkTs:0,st:0,str:"",cmd:-1,timeOK:0,configOK:0,fCmdTs:0,fCmd:0},_={s:{v:"3.0.0-dev1",dn:"",configOK:0,errCnt:0,errTs:0,upTs:0,tz:"+02:00",tzh:0,p:[{ts:0,now:0,low:0,high:0,avg:0},{ts:0,now:0,low:0,high:0,avg:0}]},si:[],p:[[],[]],h:[[],[],[]],c:{c:C_DEF_C,i:[]}},loopRunning=!1,cmd=[!1,!1,!1];function getKvsKey(t){let e="porssi-config-";return e+=t<0?"common":t+1}function isCurrentHour(t,e){e-=t;return 0<=e&&e<3600}function limit(t,e,n){return Math.min(n,Math.max(t,e))}function epoch(t){return Math.floor((t?t.getTime():Date.now())/1e3)}function padStart(t,e,n){let s=t.toString();for(;s.length<e;)s=n?n+s:" "+s;return s}function getDate(t){return t.getDate()}function updateTz(t){let e=t.toString(),n=0;"+0000"==(e=e.substring(3+e.indexOf("GMT")))?(e="Z",n=0):(n=+e.substring(0,3),e=e.substring(0,3)+":"+e.substring(3)),e!=_.s.tz&&(_.s.p[0].ts=0),_.s.tz=e,_.s.tzh=n}function log(t){console.log((new Date).toString().substring(16,24)+":",t)}function addHistory(){for(;0<C_HIST&&_.h.length>=C_HIST;)_.h.splice(0,1);_.h.push([epoch(),cmd?1:0,_.s.st])}function updateState(){var t=new Date;_.s.timeOK=2e3<t.getFullYear()?1:0,_.s.dn=Shelly.getComponentConfig("sys").device.name,!_.s.upTs&&_.s.timeOK&&(_.s.upTs=epoch(t))}function getConfig(l,t){var e=getKvsKey(l);Shelly.call("KVS.Get",{key:e},function(e,t,n,s){l<0?_.c.c=e?JSON.parse(e.value):{}:_.c.i[l]=e?JSON.parse(e.value):{};{e=l;var o=function(t){l<0?_.s.configOK=t?1:0:(_.si[l].configOK=t?1:0,_.si[l].chkTs=0),s&&(loopRunning=!1,Timer.set(1e3,!1,loop))};let t=0;if(C_DEF_C||C_DEF_I){var i,r=e<0?C_DEF_C:C_DEF_I,c=e<0?_.c.c:_.c.i[e];for(i in r)if(void 0===c[i])c[i]=r[i],t++;else if("object"==typeof r[i])for(var p in r[i])void 0===c[i][p]&&(c[i][p]=r[i][p],t++);e>=C_COUNT-1&&(log("default config deleted"),C_DEF_C=null,C_DEF_I=null),0<t?(e=getKvsKey(e),Shelly.call("KVS.Set",{key:e,value:JSON.stringify(c)},function(t,e,n,s){0!==e&&log("chkConfig() - error:"+e+" - "+n),s&&s(0===e)},o)):o&&o(!0)}else o&&o(!0)}},t)}function loop(){if(!loopRunning)if(loopRunning=!0,updateState(),_.s.configOK)if(pricesNeeded(0))getPrices(0);else if(pricesNeeded(1))getPrices(1);else{for(let t=0;t<C_COUNT;t++){if(!_.si[t].configOK)return void getConfig(t,!0);if(function(t){var e=_.si[t],t=_.c.i[t];if(1!=t.en)return;if(0==e.chkTs)return 1;var n=new Date,s=new Date(1e3*e.chkTs);return s.getHours()!=n.getHours()||s.getFullYear()!=n.getFullYear()||0<e.fCmdTs&&e.fCmdTs-epoch(n)<0||0==e.fCmdTs&&t.min<60&&n.getMinutes()>=t.min&&e.cmd+t.inv==1}(t)){var i=t;try{console.log("logic",i),cmd[i]=!1;var e,n,r=new Date;updateTz(r),!function(){if(_.s.timeOK&&0!=_.s.p[0].ts){var e=epoch();for(let t=0;t<_.p[0].length;t++)if(isCurrentHour(_.p[0][t][0],e))return _.s.p[0].now=_.p[0][t][1];return _.p[0].length<24&&(_.s.p[0].ts=0),_.s.p[0].now=0}_.s.p[0].now=0}();let s=_.si[i],o=_.c.i[i];function c(t){if(null==t)loopRunning=!1;else if(cmd[i]!=t&&(s.st=12),cmd[i]=t,o.inv&&(cmd[i]=!cmd[i]),1==o.oc&&s.cmd==cmd[i])log("logic(): lähtö on jo oikeassa tilassa"),addHistory(),s.cmd=cmd[i]?1:0,s.chkTs=epoch(),loopRunning=!1;else{let e=0,n=0;for(let t=0;t<o.o.length;t++)!function(o,t){var e="{id:"+o+",on:"+(cmd?"true":"false")+"}";Shelly.call("Switch.Set",e,function(t,e,n,s){0!=e&&log("setRelay() - output #"+o+" failed: "+e+" - "+n),s(0==e)},t)}(o.o[t],function(t){e++,t&&n++,e==o.o.length&&(n==e&&(addHistory(),s.cmd=cmd[i]?1:0,s.chkTs=epoch()),loopRunning=!1)})}}log("running logic instance "+i),0===o.mode?(cmd[i]=1===o.m0.cmd,s.st=1):_.s.timeOK&&0<_.s.p[0].ts&&getDate(new Date(1e3*_.s.p[0].ts))===getDate(r)?1===o.mode?(cmd[i]=_.s.p[0].now<=("avg"==o.m1.lim?_.s.p[0].avg:o.m1.lim),s.st=cmd[i]?2:3):2===o.mode&&(cmd[i]=function(t){_.s.i[t];var e=_.c.i[t],s=(e.m2.ps=limit(0,e.m2.ps,23),e.m2.pe=limit(e.m2.ps,e.m2.pe,24),e.m2.ps2=limit(0,e.m2.ps2,23),e.m2.pe2=limit(e.m2.ps2,e.m2.pe2,24),e.m2.c=limit(0,e.m2.c,0<e.m2.per?e.m2.per:e.m2.pe-e.m2.ps),e.m2.c2=limit(0,e.m2.c2,e.m2.pe2-e.m2.ps2),[]);for(_inc=e.m2.p<0?1:e.m2.p,_i=0;_i<_.p[0].length;_i+=_inc)if(!((_cnt=-2==e.m2.p&&1<=_i?e.m2.c2:e.m2.c)<=0)){var o=[];for(_start=_i,_end=_i+e.m2.p,e.m2.p<0&&0==_i?(_start=e.m2.ps,_end=e.m2.pe):-2==e.m2.p&&1==_i&&(_start=e.m2.ps2,_end=e.m2.pe2),_j=_start;_j<_end&&!(_j>_.p[0].length-1);_j++)o.push(_j);if(e.m2.s){let e=999,n=0;for(_j=0;_j<=o.length-_cnt;_j++){let t=0;for(_k=_j;_k<_j+_cnt;_k++)t+=_.p[0][o[_k]][1];t/_cnt<e&&(e=t/_cnt,n=_j)}for(_j=n;_j<n+_cnt;_j++)s.push(o[_j])}else{for(_j=0,_k=1;_k<o.length;_k++){var n=o[_k];for(_j=_k-1;0<=_j&&_.p[0][n][1]<_.p[0][o[_j]][1];_j--)o[_j+1]=o[_j];o[_j+1]=n}for(_j=0;_j<_cnt;_j++)s.push(o[_j])}if(-1==e.m2.p||-2==e.m2.p&&1<=_i)break}let i=epoch(),r=!1;for(let t=0;t<s.length;t++)if(isCurrentHour(_.p[0][s[t]][0],i)){r=!0;break}return r}(i),s.st=cmd[i]?5:4,!cmd[i]&&_.s.p[0].now<=("avg"==o.m2.lim?_.s.p[0].avg:o.m2.lim)&&(cmd[i]=!0,s.st=6),cmd[i])&&_.s.p[0].now>("avg"==o.m2.m?_.s.p[0].avg:o.m2.m)&&(cmd[i]=!1,s.st=11):_.s.timeOK?(s.st=7,e=1<<r.getHours(),(o.bk&e)==e&&(cmd[i]=!0)):(cmd[i]=1===o.err,s.st=8),_.s.timeOK&&0<o.fh&&(n=1<<r.getHours(),(o.fh&n)==n)&&(cmd[i]=(o.fhCmd&n)==n,s.st=10),cmd[i]&&_.s.timeOK&&r.getMinutes()>=o.min&&(s.st=13,cmd[i]=!1),_.s.timeOK&&0<s.fCmdTs&&(0<s.fCmdTs-epoch(r)?(cmd[i]=1==s.fCmd,s.st=9):s.fCmdTs=0),"function"==typeof USER_OVERRIDE?USER_OVERRIDE(cmd[i],_,c):c(cmd[i])}catch(t){log("logic() - error:"+JSON.stringify(t)),loopRunning=!1}return}}loopRunning=!1}else getConfig(-1,!0)}function pricesNeeded(t){var e=new Date;let n=!1;return n=1==t?_.s.timeOK&&0===_.s.p[1].ts&&15<=e.getHours():((t=getDate(new Date(1e3*_.s.p[0].ts))!==getDate(e))&&(_.s.p[1].ts=0,_.p[1]=[]),_.s.timeOK&&(0==_.s.p[0].ts||t)),_.s.errCnt>=C_ERRC&&epoch(e)-_.s.errTs<C_ERRD?n=!1:_.s.errCnt>=C_ERRC&&(_.s.errCnt=0),n}function getPrices(c){try{let i=new Date;updateTz(i);var e=1==c?new Date(864e5+new Date(i.getFullYear(),i.getMonth(),i.getDate()).getTime()):i;let t=e.getFullYear()+"-"+padStart(1+e.getMonth(),2,"0")+"-"+padStart(getDate(e),2,"0")+"T00:00:00"+_.s.tz.replace("+","%2b");var n=t.replace("T00:00:00","T23:59:59");let r={url:"https://dashboard.elering.ee/api/nps/price/csv?fields="+_.c.c.g+"&start="+t+"&end="+n,timeout:5,ssl_ca:"*"};i=null,t=null,Shelly.call("HTTP.GET",r,function(e,t,n){r=null;try{if(0!==t||null==e||200!==e.code||!e.body_b64)throw Error("error: "+t+"("+n+") - "+JSON.stringify(e));{e.headers=null,n=e.message=null,_.p[c]=[],_.s.p[c].avg=0,_.s.p[c].high=-999,_.s.p[c].low=999,e.body_b64=atob(e.body_b64),e.body_b64=e.body_b64.substring(1+e.body_b64.indexOf("\n"));let t=0;for(;0<=t;){e.body_b64=e.body_b64.substring(t);var s=[t=0,0];if(0===(t=1+e.body_b64.indexOf('"',t)))break;s[0]=+e.body_b64.substring(t,e.body_b64.indexOf('"',t)),t=2+e.body_b64.indexOf('"',t),t=2+e.body_b64.indexOf(';"',t),s[1]=+(""+e.body_b64.substring(t,e.body_b64.indexOf('"',t)).replace(",",".")),s[1]=s[1]/10*(100+(0<s[1]?_.c.c.vat:0))/100;var o=new Date(1e3*s[0]).getHours();s[1]+=7<=o&&o<22?_.c.c.day:_.c.c.night,_.p[c].push(s),_.s.p[c].avg+=s[1],s[1]>_.s.p[c].high&&(_.s.p[c].high=s[1]),s[1]<_.s.p[c].low&&(_.s.p[c].low=s[1]),t=e.body_b64.indexOf("\n",t)}if(e=null,_.s.p[c].avg=0<_.p[c].length?_.s.p[c].avg/_.p[c].length:0,_.s.p[c].ts=epoch(i),1==c&&_.p[c].length<23)throw Error("huomisen hintoja ei saatu")}}catch(t){log("getPrices() - error:"+t),_.s.errCnt+=1,_.s.errTs=epoch(),_.s.p[c].ts=0,_.p[c]=[]}loopRunning=!1})}catch(t){log("getPrices() - error:"+t),_.s.p[c].ts=0,_.p[c]=[],1==c?loopRunning=!1:loopRunning=!1}}let _i=0,_j=0,_k=0,_inc=0,_cnt=0,_start=0,_end=0;log("shelly-porssisahko v."+_.s.v),log("URL: http://"+(Shelly.getComponentStatus("wifi").sta_ip??"192.168.33.1")+"/script/"+Shelly.getCurrentScriptId());for(let t=0;t<C_COUNT;t++)_.si.push(Object.assign({},C_DEF_S)),_.c.i.push(Object.assign({},C_DEF_I));C_DEF_S=null,HTTPServer.registerEndpoint("",function(n,s){try{if(loopRunning)return n=null,s.code=503,s.headers=[["Access-Control-Allow-Origin","*"]],void s.send();var o=function(t){var e={},n=t.split("&");for(let t=0;t<n.length;t++){var s=n[t].split("=");e[s[0]]=s[1]}return e}(n.query);n=null;let t="application/json",e=(s.code=200,!0);var i,r="text/html",c="text/javascript";"s"===o.r?(updateState(),s.body=JSON.stringify(_),e=!1):"c"===o.r?(updateState(),0<=(i=parseInt(o.i))&&i<C_COUNT?s.body=JSON.stringify(_.c.i[i]):s.body=JSON.stringify(_.c.c),e=!1):"r"===o.r?(getConfig(_.s.configOK=!1),_.s.p[0].ts=0,_.s.p[1].ts=0,s.code=204,e=!1):"f"===o.r&&o.ts?(_.s.fCmdTs=+(""+o.ts),_.s.fCmd=+(""+o.c),_.s.chkTs=0,s.code=204,e=!1):o.r?"s.js"===o.r?(s.body=atob("H4sIAAAAAAAACo1V/24bNwx+lYuWGRKsCE7b/WPvEnRNtq5L26F2CwxFsDB3tC1blhyJ58Zw7238Jn6xQXdnxwncdv/4h/iR/Eh+ogxS8vHDVcqY/Pjhqh+/70JK6VnusmKGltRdgX7ZR4MZOc9JyIvf/ki5SM9WpewPXg4u/+0PPqSf2V+b9dJaHQhps96sLZPxKGg3nkARmGSvtSVIwBhMPEzA7o6WRj85QZ2MwSz0bK4hoc3amM06iYgJTIMzBnbI/wmrsoK2kMwjuQp4ss35CfysKAIVlhq2CY8MtCU3AZmAnkJCGnMXAogYc7OmzZq0gS28gqB+hPobplN3skX8HBIIpB8biIqkSvuoFzOYBj3TW3qxsUSb9WSztkmYej3f0VwaPdV+4jQRxGIHhbXaJrV1pm1RkKZkGgMg0ZJdy7fvL/YG9nQ6MSWT7E1sn216OwOKHK0mdi0DAWG6cDpPOvLVb/3087WcYSUHxqSbox3AbQphabOE0rNVjTxKU2q1GIvfX79yShnB7UmMVQQm5Bdtc/dFGZcBaWfVGMI4pd4CfALpXeDsJ9Ym0YNWi4PKxphNMU+POkIylqY1IDuJEKWtRf968Paq1YIvoCmZu3lhgPBiaWGmswsg4NRmakwzw+TWr5S4APPKWQJt0fez2OMBjELKG27OGgd5XVil/aZUfoi7CsVtIK/tiJ+2DwK0zfH+/TBWJoQo5eHL9tIYzhQFJtTQ+UvIxpzSM1KQ55cLtHQVL5tFz1k2BjtCJmmPGSkCP0JSOhelEBINxhR/5unZaug8j+0NVaUh9nBnFgdI1DgmpE47Pf1r46YM2hGNe7rdFs3RZ31dD2GA93Qeu8oPWUR3iJSN923BZ0LRGC0fFjaLreI5EIhV/FSE98Sf2r1YVRm8KEUp5F6wOXi09M7lqDzO3AJfjbXJ99JF/AFtNAMmCXHG5Jeri8tPlWLjcmyzc5+yNimPcwMZ8krGTDImHo620mJCVArGtFbiCKlWnzw6FT1UbnrO7wKHPdGmqGKx3xIjByG6T13YpffOx+ik7SiJ/t2EtVHRPZUZxCaTWGXOBmdQYQRzEmUpGz5NxSAx3qim6MhbN7zrQYHo6SHXyk3FyiAllNrCmJ5HKrxNnnVeHKWpVvWNbrU4pXheu2s1Cc5y0d3+rScp5BYtV27aPerIzOXY3R3SPe3+RMHIqjAqyybj44KgzWLR+w6ijnt6IO7N8QrKbnK82seXCT9ePeZYips6bSy1fGjmQQpNUH68etN//07V118Pl7HZ4uYxm5PTfR7fcNlPXcqh8zOIA8P4Nt8cr0jVA8R4K1y/3jZCzSHvE3jizyTrMFGq4xVnrM1P25XDW2dpzIU4ALypEb8XxvyD4Llocg503O8kIT3qRJGciriCRkivXeHDd7O3WZc1ebUtCH+A5nC+c+hj5mz+fYcui054ztQuizE6fNfz+c5zr6WHSnywchJtlrD2QzsiVKKQxTwHwivn5nsPQ/Uchbm2TKhAS4NqoYO+1UbTMmXVb4Ost71m9GQ97PZMYKJHcUvUTy5Vq6H7S+d5fERV1FGrxWtbFImIr/GjZ4IL8e0FIB88y6G2YMzyB8zHOs/RMhmw6oEriD/UL0/xhSjL3sXlp3OPd28CZzku1CQw0X1AcdH7Dxk+hjpvCgAA"),t=c):"s.css"===o.r?(s.body=atob("H4sIAAAAAAAACo1VTW/jNhD9K4MNFsh6LVlK1tuEQoP2tEBRFL20l6IHihpZrCmSIEexvIb/e0Hqw4qToL0YFjkzfPPmzcxmtYIV+AaVOibWOO+l583eQDi+FZ/gl857CdIb4spAAg2RZZvNP+NJWktYxUPPNpudpKYrU2Ha2WDzTuxfpUDtkcG33/6An+sanYFvqNFxBb93pZJiMoHn+zSD1QZWcILS9ImX36XeMSiNq9AlpekLOENpquMaOJxAGGUcgxsUdVbn011w5mK/c6bTFYObO3GP26wAJTUmDcpdQwzy9Au2BdRGU3gGGWTp43xS81aqI4M/0VVc8wJa3icHWVHD4MujC3bjV55lH8O120nNIAPekSnA8qqKyLe2hzyzEfcNSVIIp+WjI4zBPykNkWmjV3QQxh5f2mfpQ7DnSu504lHVDGqFfYK6KoCwpyReMXAhzRAkrVUPJ6ikt4ofB/N4Trz0cAJrvCRpggsqTvIZi5f05bwUj2J2YazE2jhcT5+8JnSxGJpQE4MPH4rLc8RLhQvn2Vohd6Gy1Ey3IVNlODFQWA/Yya8hbZbwtdFzuETxEtXytlRG7K8qfZf+sA2czTXJIE/vwskoKzfa2R68UbKCm/wrzx62BYjO+SAwa6QmdPO7Y6pweqmCC5W89EZ1hAV8T6SusGeQF0DGXuCEHBlkC1y5wxauyK/ruphlPgnZWC4kHaN3JImJBsUeq88vWPnvQAMBb8SJIT5f5To/my/SuhtcjV2WYedkVcTfhLC1ihMmwqiu1Z5BXrvYJeFPdPZWRx1GjhN8Rk1+KvTEb3oXm+7SvcP3nED8HstHjmtvuUNNc42nzCcxj8dk7HR1aGSo16QJXsnOM9iGunItWz4UNmDNfRQYdyB1LXV0O8NPezzWjrfoYUgoaAJOA5rauJaBM8QJb++/ZhXuPsEZzkN7pEI8UZhcT+SeqGK1dJ4S0UhVrSEtd+vRzLdAbnk7zYbDSEtpVFXAMzqSgqtpFJCx77d0rfqkNaHMKvYf9kklHYpxJJhDzK3FSvLb5RB8yGz/KaQXkbVL/Gt4ry9fdMv5Ld+r7Ma5OPZKmIqXwkXZzpthGJzZIuxrrpa+ue2hVFzsB9H8Dy4GAV8bPlXyeQY6AhghXF70oXPi6FkKUnEb1uL07zU9F8xv4F2umKEHRSjHYgUInIdWLZfD6mMxqD3iwtBqB8dtNDzkD9nC8mEK3lKeXeoxMDiutcBGPvIVZ0Mwd9slKXENZuOYadX2urLTK+Uabnwi2neEfQapbUd/0dHij2VHZPTf1+s0D2PhfGmY0xsrfsxuWNUL20j4xOt9wPQ2nb5rW+7CZn69IP4FVHl/tmcJAAA="),t="text/css"):"status"===o.r?(s.body=atob("H4sIAAAAAAAACpWQy23DMAyGVxF8ag+240OBHhQNUATooVmAlhRYqUS5Jp3HPp6hC3ixIrHjJG36uvL/+OEnJUPprdAeiOZJEFonSnKjJJtxuC0eZ+q5WkNLAvd8CJyZU6qDUQswwACYZdm4NJCvZFGQ9Y7txBOfxOql76rX/h1F5ZDhyopxq65UxPt9XbsJCNHYiViAY7YWBbpwRgxOwNJ5mOYOV1HJ/HixksZtTmev/E6s/C4NsUx19MlVyPqQFSI0D1+CwMUsUbI8XSS477Dv+g5lXiqZG7dRcvjwsUHtZjcLXKqWkW3LbYAfZMMa69F6IR2oW/X9H+pXbQwWEb5rX/yj/S+u4nPnc/MjcMM+EKQbV7Nq7NsT3SUMZUoM3FK2puRe5mP8ATulOOzYAgAA"),t=r):"status.js"===o.r?(s.body=atob("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"),t=c):"history"===o.r?(s.body=atob("H4sIAAAAAAAACmWNOw7CMBBEr2K5gsJY9JuVaGkoOIF/IRuMDN5NlNweEQWElGaK90YzEGlUITvmRrd5Um2ezKN4E0rWCH9SwscdNYI4nxOCVASJP638TeOJ7m4DL13vBt7ga8okCeyy40ucFcWGTUcsCHY9sZHGb3Ko9BSs6XXmnRbnl26p86FnvQe7+jdGEOBV0gAAAA=="),t=r):"history.js"===o.r?(s.body=atob("H4sIAAAAAAAACnVRzW7bMAx+FYXLCmlxXXe9xZaL/RTYYUOBxTfDWBWbrjWoVkaxLQLDb9M36YsVSrANPRTggfxIfiQ/Tg5ZoM7yB0Niq03Yj61UupyY9pPt5YO3ncgWWgc2jCpCi6PLA/lHcUXkScLoRWfYgDrw8LE6t73kdNCcDmnwxFJyQkqXVGfNKddZo5KsiEmH4y0PJye40LG4zpqYnP4ECe/C6WADg0rtOCJ9q3581wB570nGSSR8Lzgd1BSjoKFgKiEJWkZb6ZuCO9E6E4KG3jKUy6n3dGe4sncoR3wUXw2jPMeLD3ErpebijLvyRq0OnYH3DjW03nlaLyeqz5tLuCXEEdZA2MEcGY/w9fDb3Aexe356fnIOYf0P8TbAK95yOW2qT9XVr031s6b6Y9NcpoQ7Z1qUIOT7IExgqyAB+LvQCoqzeFr+higrHWb8L948z63hdpCsptaPwTtM8fAqVslbuvI851upki+fN+nuPgxyq+YXPIfIryACAAA="),t=c):"config"===o.r?(s.body=atob("H4sIAAAAAAAACp1V227bRhD9lQWBIvYDQ2njJoZBLcCHBJIvUlEpLvo4Wq7DFffCcIdy1ed+Cr+hP8AfK3iTTNqxkT5yZs7M2Zk5wzCWe8IVODfzkJOtx/68/bxYf96EQSz3LETYKtEHaMK5x0LMWYhxZ3ycXk7YKtlB4RAyCDFmoRNKcCQynmkbCxYGraFHNuGIsAckqiqTuPoXG5w0WdHAbIGOOPm3mF0cQbdtpCG2KTYqZDkLbYbSGrIHVYjZhEXSAEHIU+kQhHMwDJiye5CG6KJALBr3SzQLp6UpCpQjhlqaliBlREvTQ26qsioNCmnEgGiLw0MmZjwRPN3av+os0uyP1dZVmaT1+6Lb+2Gtuk99rV+O4VLmaDWkrmioTT75lF6REyqGwxHFg/SPJDyNWuN0wij1J5+eIoz8luAI021BW/Mecl0UDgtjmn7UoG16dM+rEqsSpYK3Xy7ynJFQwVYo8mDz5nu1DFZfvoRBYz1m/Q3S1PpNxtSJdgyxQJDK9a9Rv7LQFVpDfmDLqjxgVQaZlMpiPdTO0a2yjGcPSb/QTpO6FR4Lg8bLwqBLfbIMBVKH1yq5qf5ZL1bz6+jr+n8o5bXO6InPdTxoTmca9ed1gvPFchP9Hl1HP0VvLg1CDjsYbfvUV1KPV+PV+tfRzXq1JPPo9n5xdxdtyObrcrn4ubMS7cDsIHV2fFWon4l8JHh6wehFMtI4ZVM6sl2yy5HlI/s4slywcaYP7MPIQtk4sz9lVkP9UXeRnE1JQ/58FEWHUbSNgvPj/SGhy8B0jUgYyBT2VakkOUuVPb8Kg9pd96vff+rz9mBpIDDo2WmC1M9cP8CryYT4ZOgUT5y99DaFQanrk5ZX5bN83JyORTJkQ5/TIfQFQvRVRnRI6Vn+Ab0X8nODdMCwvScir8o0rUrZX5MfCZH67vvxDDV/k6wuplRVEn8kkrZMB1NS9yLp0HeQOqllUo/8Ryj9trC8Jw90sBct6W2BeFyvDSgljAHWKe1ldW5Wi7vFcrnaPItC3tc4/SoGZeoDanMuunpPzrNj4TZ/A20NV5Kns3eP0sT28b3NhDnzAu/8XZvOWydCqYMhCahGIF7/EMdzmSHLxfdrd+YhbH1uzYP89n7nvFo7rfs/tM6MCNAIAAA="),t=r):"config.js"===o.r?(s.body=atob("H4sIAAAAAAAACo1X65LaNhR+Fa+aIVIwXuNk8gOQmTaXaZtbJ5tmMtPplLP28aJgy15JkDDEb5M3yYt1JBuwF5r0D0jnrqNP34FdjsbL+cXYTzjyeEgJGSLzNQce79IyWRcoTXC7RrW9whwTU6qf85ySoIhGCWFBVqpnkCwp8hgDbbY5BqnQVQ5bnlBgs3BODFznOFLlJzIhspRImP+jwNH/iDwanwtd+4pT9IHxeDEzaTwTslobz2wr5ERBKkriSSiQk3s7rIm3gXztNlCTeHZp0ngx3YDyMg56KxPKeLwzarsTGd2UIvXCC861AYODwUU+GLgl21mPopEHyfRWU/JTUaZIWCCkRPXru1cv+as3T5/9c/XubVBARQ8llpURpeyXYSubXTaaeMH8brzGsAjstlGUa6M7CrsNPpZCUuKT1lfIDWFBssRkhSkvAiE3c9JuyYSQxmoDphNnA6YRp7DtiFPYNmIpbpZde7efWjQBJ2SalYraDfJwirPo0RSHQwZDvpjlcI25l5WKkw/uDvp35Mq6Lj8TT6QHi3u7BpdBBemVAWVo5JOQsHp26cLF3qLp+vWq13MIFFY5JOig9YH45JowV6ThZGZUbCHybi2NcFdvd2+ePz+sR0fp62Z5aVT8H4cz9nBtyO/U67TKFjNEP2T1cTMad3djZ6zi9mDZsncwc3KwjLDzdTV9cdXsEUCL4Ho1GM9myDi3X/4ekN958ou/3LuxF/L34s7z3AfGFg4cWM0oyexBaBFky26yuZM8KdKecDwJJ6Mxax+PkF2sC9lCPekCPWmEqFQP3KjUGXAX4Sgp0p5hEQZJkZ6zHY9yUXQLGAe5KFplNKpQdZVRUKE6KBNp+spEmoNS3/YriAJ9e66AaFT0gxyT36ks6ld2ZAILwKY4fQLDzknO2J/CthM/Opcg+l6Gcx74HY9Emuikg5Gv6b7VzM/5RVjXCRiLP7ZLSqnLHO3Nl4oiq+tpRpn/5JeroFrrJc3a4Bo29ryQps82KM1LoQ1KVJQkuUhWxHeM7yGPdxhUCq3NU8xgnRvKpujGim8Yj1+BWVpQUuM3S/jsng+b2klhZwHsZ4Fv7FQlsLkhnN9qiu3B5k40SWhHxqbgaJ07aZ/xmQ+O2fkJ5Qe6yoVxZO8mC/I4ocisg5Abfsr/9qX5YPl9n6hD/NYtdRP2LvdbjeP4va43AKz2esVt4GzJww4TQfPWu4y0O6WkwYC6APbji6OFaTNTb/WeeDLHPJPWYdEmno7GF7xw7tnSJXPu/j5t+/2lsDFrsBjhp7TR9qQQ8tD8IwO53id7xZGDWOuBtPX1H4dO5niFn6WdfSJHKNx0yMZKHbwPFfSIptUn0nT0Ha5p9fqWn+OafdooaJM6gmkkh0KiXiHanatTiz6mih4eyuVIW/uubQe30aNDxOgkZHQ2ZnQMGvWiRmfCWnLotyQ607P2jho2Dmf7Xs/3i0m7GLV5u8G7vtGhxr1l1CBVc/gEwng3aJ6CAfrn25fD+5eqSi5fvL8KrtDMV7jlpCqV1mKUlDITN2TQkNz94e9Xb14H2ighb0S2pZZKojDkXAdJmeK8E/RqSOaKW1iYJUr72neQozKUvIM8RynRmPUFcRw5rlnQkuTBbPFeqCVOPPuY2ILVbHJXrgPz2TjdgWDbDK0JGWJQoNZwY6m25dasVMmPydX9nLbtQh94pcqiMpT8AatVOSqXH2G90ii9FWpTemYtDQoJc4+GHvcqVGtPbldbIVEywqZynecXHAYDijycUeDurwswNq9AafxNGnqawADIVem5XNqrvn399jXP0aNj5m1AeFUptEdDNic+GRPGJqEv9Gt4TZF9+ULhzhUv7u3shdRzxbOB0fzeLpzB3E2ELC9LRZ/aESDLT5RdjvHh8HH4AB48DtkkrAcJX9i/WU1jo/AR59BcNXnz4oJMjq0GexuMsZrd+flxptFLkDdIfOSxphgYUDdo2pfA6n8BPm8T/OkNAAA="),t=c):s.code=404:(s.body=atob("H4sIAAAAAAAACqVTS27bMBC9CstFIaGWjO6KWGRQNAbarLoosi1ocmxNTJMqZ2TDKHqbniEXyMUKfeJESY0G6GbImTd8780Iqt64aPnYQM07r6suCm/CRkHQ1Q7YCFubRMCq5XXxQVeM7EF/vb9LREj3v+vt/V01H6rDg2B2oPYIhyYmFjYGhsBKHtBxrRzs0ULRJzMMyGh8QdZ4UO+lrhzuhfWGSHFshhSd+rumw/2pgxoM40Nqgp6CNjZH/baLC3HdEqH4QpGNjyKrjKgTrFXN3NDFfH6LA1KuUbBJG2D1feVN2OonSDU3Oh8lHoVG22ZFz3JdYWhaFt2WVTIO47Ai049mVgWx4ZaErcFuwanxfCAgLSpvVuDFOqZJ/4NA0cP6G3pTzYf71EExfoR+GcUjhT4/xD9N10gc0/G8y2cNJ5uf+zq+2urI8z9ebQxr3Jy3OsVPTj8ScLsl4NdaHXimTodINmHD2sZALK6WN+qAwcVD6aM1jDGUMeEGQ4nB+tYBZbJDfB2JZb7wwMIpF227g8Azm8AwLD10mQKlXTkpZZDPTNNAcJ9q9G7oWEV3LJ9Uu6YEP66pg3/uTRKkpixyMC3zBZWUrLpa3lzChbxMSr6DMkHjjYVMdoPLmZQTzYzyXzNLLyg9hq3MF5aoTOCVJD56oBqAZdde9j9jJySptESylxuuE3pLNNrPJJW3JPNqPu74D2dOYpLSBAAA"),t=r),s.headers=[["Content-Type",t]],s.headers.push(["Access-Control-Allow-Origin","*"]),e&&s.headers.push(["Content-Encoding","gzip"])}catch(t){log("http - error:"+t),s.code=500}s.send()}),Timer.set(5e3,!0,loop),loop();

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
          //Ei tehdä mitään --> käytetään käyttöliittymän asetuksia
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