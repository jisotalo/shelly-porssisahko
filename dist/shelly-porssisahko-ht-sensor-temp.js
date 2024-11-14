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
const CNST={INST_COUNT:"undefined"==typeof INSTANCE_COUNT?3:INSTANCE_COUNT,HIST_LEN:"undefined"==typeof HIST_LEN?24:HIST_LEN,ERR_LIMIT:3,ERR_DELAY:120,DEF_INST_ST:{chkTs:0,st:0,str:"",cmd:-1,configOK:0,fCmdTs:0,fCmd:0},DEF_CFG:{COM:{g:"fi",vat:25.5,day:0,night:0,names:[]},INST:{en:0,mode:0,m0:{c:0},m1:{l:0},m2:{p:24,c:0,l:-999,s:0,m:999,ps:0,pe:23,ps2:0,pe2:23,c2:0},b:0,e:0,o:[0],f:0,fc:0,i:0,m:60,oc:0}}};let _={s:{v:"3.0.0",dn:"",configOK:0,timeOK:0,errCnt:0,errTs:0,upTs:0,tz:"+02:00",tzh:0,enCnt:0,p:[{ts:0,now:0,low:0,high:0,avg:0},{ts:0,now:0,low:0,high:0,avg:0}]},si:[CNST.DEF_INST_ST],p:[[],[]],h:[],c:{c:CNST.DEF_CFG.COM,i:[CNST.DEF_CFG.INST]}},_i=0,_j=0,_k=0,_inc=0,_cnt=0,_start=0,_end=0,cmd=[],loopRunning=!1;function getKvsKey(t){let e="porssi";return e=0<=t?e+"-"+(t+1):e}function isCurrentHour(t,e){e-=t;return 0<=e&&e<3600}function limit(t,e,n){return Math.min(n,Math.max(t,e))}function epoch(t){return Math.floor((t?t.getTime():Date.now())/1e3)}function getDate(t){return t.getDate()}function updateTz(t){let e=t.toString(),n=0;"+0000"==(e=e.substring(3+e.indexOf("GMT")))?(e="Z",n=0):(n=+e.substring(0,3),e=e.substring(0,3)+":"+e.substring(3)),e!=_.s.tz&&(_.s.p[0].ts=0),_.s.tz=e,_.s.tzh=n}function log(t){console.log("shelly-porssisahko: "+t)}function addHistory(t){for(var e=0<_.s.enCnt?CNST.HIST_LEN/_.s.enCnt:CNST.HIST_LEN;0<CNST.HIST_LEN&&_.h[t].length>=e;)_.h[t].splice(0,1);_.h[t].push([epoch(),cmd[t]?1:0,_.si[t].st])}function reqLogic(){for(let t=0;t<CNST.INST_COUNT;t++)_.si[t].chkTs=0}function updateState(){var t=new Date;for(_.s.timeOK=2e3<t.getFullYear()?1:0,_.s.dn=Shelly.getComponentConfig("sys").device.name,_.s.enCnt=0,_i=0;_i<CNST.INST_COUNT;_i++)_.c.i[_i].en&&_.s.enCnt++;!_.s.upTs&&_.s.timeOK&&(_.s.upTs=epoch(t))}function getConfig(l){var t=getKvsKey(l);Shelly.call("KVS.Get",{key:t},function(e,t,n){l<0?_.c.c=e?JSON.parse(e.value):{}:_.c.i[l]=e?JSON.parse(e.value):{},"function"==typeof USER_CONFIG&&USER_CONFIG(l,!0);{e=l;var o=function(t){l<0?_.s.configOK=t?1:0:(log("config for #"+(l+1)+" read, enabled: "+_.c.i[l].en),_.si[l].configOK=t?1:0,_.si[l].chkTs=0),loopRunning=!1,Timer.set(500,!1,loop)};let t=0;if(CNST.DEF_CFG.COM||CNST.DEF_CFG.INST){var s,i=e<0?CNST.DEF_CFG.COM:CNST.DEF_CFG.INST,r=e<0?_.c.c:_.c.i[e];for(s in i)if(void 0===r[s])r[s]=i[s],t++;else if("object"==typeof i[s])for(var c in i[s])void 0===r[s][c]&&(r[s][c]=i[s][c],t++);e>=CNST.INST_COUNT-1&&(CNST.DEF_CFG.COM=null,CNST.DEF_CFG.INST=null),0<t?(e=getKvsKey(e),Shelly.call("KVS.Set",{key:e,value:JSON.stringify(r)},function(t,e,n,o){e&&log("failed to set config: "+e+" - "+n),o(0==e)},o)):o(!0)}else o(!0)}})}function loop(){try{if(!loopRunning)if(loopRunning=!0,updateState(),_.s.configOK)if(pricesNeeded(0))getPrices(0);else if(pricesNeeded(1))getPrices(1);else{for(let t=0;t<CNST.INST_COUNT;t++)if(!_.si[t].configOK)return void getConfig(t);for(let t=0;t<CNST.INST_COUNT;t++)if(function(t){var e=_.si[t],n=_.c.i[t];if(1!=n.en)return void(_.h[t]=[]);var t=new Date,o=new Date(1e3*e.chkTs);return 0==e.chkTs||o.getHours()!=t.getHours()||o.getFullYear()!=t.getFullYear()||0<e.fCmdTs&&e.fCmdTs-epoch(t)<0||0==e.fCmdTs&&n.m<60&&t.getMinutes()>=n.m&&e.cmd+n.i==1}(t))return void Timer.set(500,!1,logic,t);"function"==typeof USER_LOOP?USER_LOOP():loopRunning=!1}else getConfig(-1)}catch(t){log("error at main loop:"+t),loopRunning=!1}}function pricesNeeded(t){var e=new Date;let n=!1;return n=1==t?_.s.timeOK&&0===_.s.p[1].ts&&15<=e.getHours():((t=getDate(new Date(1e3*_.s.p[0].ts))!==getDate(e))&&(_.s.p[1].ts=0,_.p[1]=[]),_.s.timeOK&&(0==_.s.p[0].ts||t)),_.s.errCnt>=CNST.ERR_LIMIT&&epoch(e)-_.s.errTs<CNST.ERR_DELAY?n=!1:_.s.errCnt>=CNST.ERR_LIMIT&&(_.s.errCnt=0),n}function getPrices(c){try{log("fetching prices for day "+c);let i=new Date;updateTz(i);var e=1==c?new Date(864e5+new Date(i.getFullYear(),i.getMonth(),i.getDate()).getTime()):i;let t=e.getFullYear()+"-"+(e.getMonth()<9?"0"+(1+e.getMonth()):1+e.getMonth())+"-"+(getDate(e)<10?"0"+getDate(e):getDate(e))+"T00:00:00"+_.s.tz.replace("+","%2b");var n=t.replace("T00:00:00","T23:59:59");let r={url:"https://dashboard.elering.ee/api/nps/price/csv?fields="+_.c.c.g+"&start="+t+"&end="+n,timeout:5,ssl_ca:"*"};i=null,t=null,Shelly.call("HTTP.GET",r,function(e,t,n){r=null;try{if(0!==t||null==e||200!==e.code||!e.body_b64)throw Error(t+"("+n+") - "+JSON.stringify(e));{e.headers=null,n=e.message=null,_.p[c]=[],_.s.p[c].avg=0,_.s.p[c].high=-999,_.s.p[c].low=999,e.body_b64=atob(e.body_b64),e.body_b64=e.body_b64.substring(1+e.body_b64.indexOf("\n"));let t=0;for(;0<=t;){e.body_b64=e.body_b64.substring(t);var o=[t=0,0];if(0===(t=1+e.body_b64.indexOf('"',t)))break;o[0]=+e.body_b64.substring(t,e.body_b64.indexOf('"',t)),t=2+e.body_b64.indexOf('"',t),t=2+e.body_b64.indexOf(';"',t),o[1]=+(""+e.body_b64.substring(t,e.body_b64.indexOf('"',t)).replace(",",".")),o[1]=o[1]/10*(100+(0<o[1]?_.c.c.vat:0))/100;var s=new Date(1e3*o[0]).getHours();o[1]+=7<=s&&s<22?_.c.c.day:_.c.c.night,_.p[c].push(o),_.s.p[c].avg+=o[1],o[1]>_.s.p[c].high&&(_.s.p[c].high=o[1]),o[1]<_.s.p[c].low&&(_.s.p[c].low=o[1]),t=e.body_b64.indexOf("\n",t)}if(e=null,_.s.p[c].avg=0<_.p[c].length?_.s.p[c].avg/_.p[c].length:0,_.s.p[c].ts=epoch(i),_.p[c].length<23)throw Error("invalid data received")}}catch(t){log("error getting prices: "+t),_.s.errCnt+=1,_.s.errTs=epoch(),_.s.p[c].ts=0,_.p[c]=[]}0==c&&reqLogic(),loopRunning=!1,Timer.set(500,!1,loop)})}catch(t){log("error getting prices: "+t),_.s.errCnt+=1,_.s.errTs=epoch(),_.s.p[c].ts=0,_.p[c]=[],0==c&&reqLogic(),loopRunning=!1,Timer.set(500,!1,loop)}}function logic(i){try{"function"==typeof USER_CONFIG&&USER_CONFIG(i,!1),cmd[i]=!1;var t,e,n=new Date;updateTz(n),!function(){if(_.s.timeOK&&0!=_.s.p[0].ts){var e=epoch();for(let t=0;t<_.p[0].length;t++)if(isCurrentHour(_.p[0][t][0],e))return _.s.p[0].now=_.p[0][t][1];return _.p[0].length<24&&(_.s.p[0].ts=0),_.s.p[0].now=0}_.s.p[0].now=0}();let o=_.si[i],s=_.c.i[i];function r(t){if(null==t)loopRunning=!1;else if(cmd[i]!=t&&(o.st=12),cmd[i]=t,s.i&&(cmd[i]=!cmd[i]),log("logic for #"+(i+1)+" done, cmd: "+t+" -> output: "+cmd[i]),1==s.oc&&o.cmd==cmd[i])log("outputs already set for #"+(i+1)),addHistory(i),o.cmd=cmd[i]?1:0,o.chkTs=epoch(),loopRunning=!1;else{let e=0,n=0;for(let t=0;t<s.o.length;t++)!function(t,s,i){t="{id:"+s+",on:"+(cmd[t]?"true":"false")+"}",Shelly.call("Switch.Set",t,function(t,e,n,o){0!=e&&log("setting output "+s+" failed: "+e+" - "+n),i(0==e)},i)}(i,s.o[t],function(t){e++,t&&n++,e==s.o.length&&(n==e&&(addHistory(i),o.cmd=cmd[i]?1:0,o.chkTs=epoch(),Timer.set(500,!1,loop)),loopRunning=!1)})}}0===s.mode?(cmd[i]=1===s.m0.c,o.st=1):_.s.timeOK&&0<_.s.p[0].ts&&getDate(new Date(1e3*_.s.p[0].ts))===getDate(n)?1===s.mode?(cmd[i]=_.s.p[0].now<=("avg"==s.m1.l?_.s.p[0].avg:s.m1.l),o.st=cmd[i]?2:3):2===s.mode&&(cmd[i]=function(t){var e=_.c.i[t],n=(e.m2.ps=limit(0,e.m2.ps,23),e.m2.pe=limit(e.m2.ps,e.m2.pe,24),e.m2.ps2=limit(0,e.m2.ps2,23),e.m2.pe2=limit(e.m2.ps2,e.m2.pe2,24),e.m2.c=limit(0,e.m2.c,0<e.m2.p?e.m2.p:e.m2.pe-e.m2.ps),e.m2.c2=limit(0,e.m2.c2,e.m2.pe2-e.m2.ps2),[]);for(_inc=e.m2.p<0?1:e.m2.p,_i=0;_i<_.p[0].length;_i+=_inc)if(!((_cnt=-2==e.m2.p&&1<=_i?e.m2.c2:e.m2.c)<=0)){var o=[];for(_start=_i,_end=_i+e.m2.p,e.m2.p<0&&0==_i?(_start=e.m2.ps,_end=e.m2.pe):-2==e.m2.p&&1==_i&&(_start=e.m2.ps2,_end=e.m2.pe2),_j=_start;_j<_end&&!(_j>_.p[0].length-1);_j++)o.push(_j);if(e.m2.s){for(_avg=999,_startIndex=0,_j=0;_j<=o.length-_cnt;_j++){for(_sum=0,_k=_j;_k<_j+_cnt;_k++)_sum+=_.p[0][o[_k]][1];_sum/_cnt<_avg&&(_avg=_sum/_cnt,_startIndex=_j)}for(_j=_startIndex;_j<_startIndex+_cnt;_j++)n.push(o[_j])}else{for(_j=0,_k=1;_k<o.length;_k++){var s=o[_k];for(_j=_k-1;0<=_j&&_.p[0][s][1]<_.p[0][o[_j]][1];_j--)o[_j+1]=o[_j];o[_j+1]=s}for(_j=0;_j<_cnt;_j++)n.push(o[_j])}if(-1==e.m2.p||-2==e.m2.p&&1<=_i)break}let i=epoch(),r=!1;for(let t=0;t<n.length;t++)if(isCurrentHour(_.p[0][n[t]][0],i)){r=!0;break}return r}(i),o.st=cmd[i]?5:4,!cmd[i]&&_.s.p[0].now<=("avg"==s.m2.l?_.s.p[0].avg:s.m2.l)&&(cmd[i]=!0,o.st=6),cmd[i])&&_.s.p[0].now>("avg"==s.m2.m?_.s.p[0].avg:s.m2.m)&&(cmd[i]=!1,o.st=11):_.s.timeOK?(o.st=7,t=1<<n.getHours(),(s.b&t)==t&&(cmd[i]=!0)):(cmd[i]=1===s.e,o.st=8),_.s.timeOK&&0<s.f&&(e=1<<n.getHours(),(s.f&e)==e)&&(cmd[i]=(s.fc&e)==e,o.st=10),cmd[i]&&_.s.timeOK&&n.getMinutes()>=s.m&&(o.st=13,cmd[i]=!1),_.s.timeOK&&0<o.fCmdTs&&(0<o.fCmdTs-epoch(n)?(cmd[i]=1==o.fCmd,o.st=9):o.fCmdTs=0),"function"==typeof USER_OVERRIDE?USER_OVERRIDE(i,cmd[i],r):r(cmd[i])}catch(t){log("error running logic: "+JSON.stringify(t)),loopRunning=!1}}let _avg=999,_startIndex=0,_sum=0;log("v."+_.s.v),log("URL: http://"+(Shelly.getComponentStatus("wifi").sta_ip??"192.168.33.1")+"/script/"+Shelly.getCurrentScriptId()),_.c.i.pop(),_.si.pop();for(let t=0;t<CNST.INST_COUNT;t++)_.si.push(Object.assign({},CNST.DEF_INST_ST)),_.c.i.push(Object.assign({},CNST.DEF_CFG.INST)),_.c.c.names.push("-"),_.h.push([]),cmd.push(!1);CNST.DEF_INST_ST=null,HTTPServer.registerEndpoint("",function(n,o){try{if(loopRunning)return n=null,o.code=503,void o.send();var s=function(t){var e={},n=t.split("&");for(let t=0;t<n.length;t++){var o=n[t].split("=");e[o[0]]=o[1]}return e}(n.query),i=parseInt(s.i);n=null;let t="application/json",e=(o.code=200,!0);var r="text/html",c="text/javascript";if("s"===s.r)updateState(),0<=i&&i<CNST.INST_COUNT&&(o.body=JSON.stringify({s:_.s,si:_.si[i],c:_.c.c,ci:_.c.i[i],p:_.p})),e=!1;else if("c"===s.r)updateState(),0<=i&&i<CNST.INST_COUNT?o.body=JSON.stringify(_.c.i[i]):o.body=JSON.stringify(_.c.c),e=!1;else if("h"===s.r)0<=i&&i<CNST.INST_COUNT&&(o.body=JSON.stringify(_.h[i])),e=!1;else if("r"===s.r){if(0<=i&&i<CNST.INST_COUNT)log("config changed for #"+(i+1)),_.si[i].configOK=!1;else{log("config changed");for(let t=0;t<CNST.INST_COUNT;t++)_.si[t].configOK=!1}_.s.configOK=!1,reqLogic(),loopRunning||(loopRunning=!0,getConfig(i)),_.s.p[0].ts=0,_.s.p[1].ts=0,o.code=204,e=!1}else"f"===s.r&&s.ts?(0<=i&&i<CNST.INST_COUNT&&(_.si[i].fCmdTs=+(""+s.ts),_.si[i].fCmd=+(""+s.c),_.si[i].chkTs=0),o.code=204,e=!1):s.r?"s.js"===s.r?(o.body=atob("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"),t=c):"s.css"===s.r?(o.body=atob("H4sIAAAAAAAACo1WTW/jNhD9K4MNFsh6LVmK16lDoUF7WqBoi17aS9EDRY0s1hRJkONEXsP/vSD1YcVJsL0YJjnD+XjzHrVaLGABvkGljok1znvpebM3ELZvxSf45eC9BOkNcWUggYbIstXq32EnrSUs4qZnq9VOUnMoU2HayWD1zt2/SoHaI4Ovv/8JP9c1OgNfUaPjCv44lEqK0QSe1mkGixUs4ASl6RIvv0m9Y1AaV6FLStMVcIbSVMclcDiBMMo4Bjco6qzOx7PgzMV+58xBVwxu7sQaN1kBSmpMGpS7hhjk6RdsC6iNphAGGWTpw7RT81aqI4O/0FVc8wJa3iXPsqKGwZcHF+yGVZ5lH8Ox20nNIAN+IFOA5VUVM9/YDvLMxrxvSJJCOM2DDmn0/klpiEwbvaKDMPb40j5Lt8GeK7nTiUdVM6gVdgnqqgDCjpJ4xMCFMsMlaa06OEElvVX82JvHfeKlhxNY4yVJE1xQcZJPWLxsX85L8SAmF8ZKrI3D5bjkNaGLYGhCTQw+fCgu4YiXCmfOk7VC7gKy1IynoVJlODFQWPe5k19C2szT10ZP1yWKl6jmp6UyYn+F9F36wyb0bMIkgzy9CzvDWLnBznbgjZIV3OT3PNtuChAH58OAWSM1oZviDqXC6eUUXFrJS2/UgbCAb4nUFXYM8gLI2Es6oUYG2SyvPM7Vi97XdV1MUz7OsbFcSDpG59gjJhoUe6w+v2jK9y/q63/jnnjF56tSp7D5rKq73tXYOQo7J6si/iaErVWcMBFGHVrtGeS1iyQJf6Kzt3rWyPQuduFC0349pRrXA07kuPaWO9Q0gTnWOE7tsE3GjkfPjQzAjODzSh48g00AkGvZ8h7BkFXu4yRxB1LXUke3qUip45QNE3eGn/Z4rB1v0UNfUZgJOPVJ1sa1DJwhTni7vs8q3H2CM5x7eqRCPFJQrkdyj1SxWjpPiWikqpaQlrvlYOZbIDc/HbXheehWaVRVwBM6koKrUQrI2PcpXasuaU3AWUX+YZdU0qEYJME8x9parCS/nYvgNrPdJzi9rVH3AbK5GvWEHlQu0iDZ2m42O98ZltHyEZimpi/+dh3irxbwG99LvQNqENaugt4ZdgbIgMaOIoiLVR+jP2WQwwqS+GT0vW3nCCzhptw/vqcuLzj/pv8VRkPdA+ND3ZepjOyb3rde/rPZta8Rn/vmtoNScbHvGfE/EO3rvzZ8rOTTlOiQwJDCJaIPAhAFdM42xW143Md/r9tzyfmNfOcPZQ+yCJyZjY7ASXprOZfcj0VP5ZgXhpfh2XEbDZ/zbTaz3I6Xt5RnFzz6Dg6Pc+hGPvQrSlwwd5t5U+Jjng1q2arNNbJjlHIJNz4R7Tv0PIPU9kB/09Hij+WByOh/rj8K8kCg84X2pzc+VIbqRnpcJCLEnfq6Dkm93U9/aFvuAnlfv3P/AXPmnH4uCgAA"),t="text/css"):"status"===s.r?(o.body=atob("H4sIAAAAAAAACpWSS26DMBRFt2IxaiMBYVCpA8cLqCp10GzgYTvC4A/FjyTshzV0A2ys4mclbfqbeOB773n3WaYIuZaEa/B+FxnCecQoNoyiYM+gUJISiCtKaD1FQZTY+VjY1bLkTtnjlr1MJmI7DEZuRogABLBJkqzcyVl5aYmXWqEMfo9h9uvQF9XwbkmhLMIV1boTu0J57Lq6VsFgnJDBsVcagqLswTGaTjszKtRxXfygz+Sgz7Fxecydjq5E5KOWEdM8fBEMZtuI0XwtTHDo7dAPvaVpzmgq1JHR+Y2nBrXa3ixwido7lC22Bn6AzTHkC/UCOrtu1dd/qF+0zkhr4bv22T/a/8LKPneeT9/WbLOpoapcvHy8dLyb5k3JY9g+ZHijamSNfHvydxFCHnsEbH1S+uiepov8ARap9CvsAgAA"),t=r):"status.js"===s.r?(o.body=atob("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"),t=c):"history"===s.r?(o.body=atob("H4sIAAAAAAAACmWNOw7CMBBEr2K5gsJY9JuVaGkoOIF/IRuMDN5NlNweEQWElGaK90YzEGlUITvmRrd5Um2ezKN4E0rWCH9SwscdNYI4nxOCVASJP638TeOJ7m4DL13vBt7ga8okCeyy40ucFcWGTUcsCHY9sZHGb3Ko9BSs6XXmnRbnl26p86FnvQe7+jdGEOBV0gAAAA=="),t=r):"history.js"===s.r?(o.body=atob("H4sIAAAAAAAAClWS0WrbMBSGX0U9ZEOaHbdd2E0cOWxrYRctg8a7MmY9cY5jbaqVSSctwfXb9E36YsMOGynoRgfp+38+qbPEwuiiTCvXBhZrzTrr/gQJYdqYwKAS07bkv+W3NxoW7LMFb0TlbNhhq2fZtRHDMecN4uKcN9ninH0GffqIXlQaw6GtxIAc9l6fglP2h87Ukp+f2721WgdGJuWJ974Va6lSU0tgXE+PCQfQGis2j5TjWo1AilHjExoWW+IrZJQ/7m5WESy9bt4bDZFpA48cTNxvNaSdSaMx2SCjSiy1W25OEnuygYSp5aeL2ZnWmFRu86aRP7UBae28JOFqYZLgPEvJsVc688VFOeXiolTHmuFoDuKg5bAifT9atBiChtowZJOudv4BOTcPJFt6ElfIJC9p9oFGTj/KvVfReDPwwZKGylnn55OOistyCVtP1MIcPG2gH4jH8ffmF+6D2L2+vL5YSzD/P3EmwBtuNulW+ef8+ucqvyuo+FiWy8TTzmJFEoR8FwQGNgpigH+FIjg++KmZSIe+7yvkqpGsuuFjOUsJee+8ZBWfSuS+Tyup4q9fVsluHxpZqf4v8DUOEZQCAAA="),t=c):"config"===s.r?(o.body=atob("H4sIAAAAAAAACpVW207jSBD9lZZXq4EH5+JhZxByWvIDIwIhGW0Cq32s2A0u3N32uMths8/7Kf4GfsA/NvItiQ2BnZdE7rqdPlWnbDfADcNg4j882pL5EoyZkM9nEAAB6MFg4A4D3HB378cMbaWYBGgSCdsLHWtRm+toi3y2tmqfh1iTbfBfcTEeOELxv2eX0+XlinnLy9XdzfJy1SQnWEvRxivm+xZ3KeUuBfwWoPxzjZDCpxLCI3fjhDDWbAMyE5MH5MssVtg9FYLfYxp3D+WGz4A2CL1j4jMURBm4w7pOW77B9Dw+H/FlkYdR8aKZN7uvIKFOsgrRBoiVt5w4nP3eAl8iphQriExG5fPoq+04F2wfFcB2F+UPo7/CAxIVjUfccezR18MIjY8h9WJqAocVg/02lFmO9mJxde3dLdlvrklAV61F7g7LB/5hVw5puSnyLRUvxhR5xYqEtZAtObRNxMQPhR+t43/KIkJztpgPF9++ucPGs+Frjgq7tOqdbRE+QWYIkv4sqDgQvN+0yp0IyrbIIg+D4oW6meOMTM3j2S5oVntqFlfFeoVivzd1I+6hBkaQRmgIhDG9oRrze0DNVJYRZZX5LZiZUaizjLCHUKHeNVqhbkNuirzINQnUogP0CNuoN7tq95CqLDOUaV0VK+3raGe+KnIqckIJB2k/6GWaHmvmd4ii2K4yRUbUdwsEAUrTTrj8g7smUwrSLZ9XM5QPE0QZU8lUY2hmEIPJQ9hOolHVYFv7qR82qd/UQSMCflP8t5zWQ/9L8734v3Soke2r4BUj70C6ms5X3p/etfdLgK5QE6TwBL2JGdsSVX87HC9+7d0sF3N25c3up7e33oqt7ubz6ccb+RCK9wT6CSIT92Xp2IlIe4pxzrhzFvZE4vCx0zs75+e9ky/8S+/kjPczfeafeycO72e2xzxWUD6UFLKTMavAn/a8nK6XU3vB6U7ArN6ZNREhB4xgU+QS2Ukk49OLdotS2s66Y/u14hUw6HC2b59jJ6bt3sVoxGzWNYoDYyuzVaYJVbkT0mb7Hob4ev+yCLtonNdwmPMGIOddRE4X0qv8HXhv5Pc1OR2E9e4QaZFHUZFjuzmOCc6xzY/dyqnWcVIWk7LImd1TSF2mCZOoWoXsPjMigwrDsuXHotQ7qmrettbBBQ1sRA16nRHtxmsFUgqtgR98WL16ZfPVYno7nc8Xq1de5Lc19p8KnTLlsoxTXzT1Dlax4e46/SA61r5EP5p8ekYdxM+DOBH6xBpap5/qdNYyFFJuNQtBVgKx2ovUv8ZPMSGeih/X5sQiWNt+rB/wcfBkrFJBtfknlPcDlXcKAAA="),t=r):"config.js"===s.r?(o.body=atob("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"),t=c):o.code=404:(o.body=atob("H4sIAAAAAAAACqVTwW7bMAz9FU0DhgSL7fU2NJKKYS2w9bIdhl4LRWJiNorkiXSCYNjf7Bv6A/2xwXbS1e0KdNiFNvkeH58oW73yyfG+gZo3waguimDjSkM0agNshattJmDd8rJ4bxQjBzBf724zEdLdr3p9d6uqoTo0RLsBvUXYNSmzcCkyRNZyh55r7WGLDoo+mWFERhsKcjaAPpFGedwKFyyR5tQMKXr915kHjBqMhxZqolGVx+0x9oEggOOOipHYqNQwpii2NrSg35kv9Y1tSbw+UdXAfNDcNbnU7M2bLs7FZUuE4jMltiGJibKizrDUNXNDp1V1gwNSLlGwzStgfb0INq7NA0RV1kwfuzye2S7oUW4UxqZl0V2RztZjGvZr+73YRUFsuSXhanBr8PrwPAqQESrYBQSxTHnEPw4oeth8w2BVNbyPHRSHG+yXUfyReLLqfzBdI3HK++ddPiLc2/zU1/HFVg86/+PVpbjE1fNWx/i90w8E3K4J+KVWB52x0yGSy9iwcSkSi/OLK73D6NOuDMnZ7lsuU8YVxhKjC60HmsgOCXUiltN5ABZe++TaDUSeuQyW4SJAl2nQxpej0gSmM9s0EP3HGoMfGIvk9+WDakfK8P2SOvjH1mZBeqwiB9NyOqeSstPnF1dncCrPspZvoczQBOtgIruDy5mUo5kTmv6cOXoiGTCu5XTuiMoMQUvifQCqAVh29LL/GbtBkkpHJPtxw+tI3hEd7E8klTckp6o67Pg3taztjQ8FAAA="),t=r);o.headers=[["Content-Type",t]],e&&o.headers.push(["Content-Encoding","gzip"])}catch(t){log("server error: "+t),o.code=500}o.send()}),Timer.set(1e4,!0,loop),loop();
//end

/**
 * Tämä käyttäjäskripti hyödyntää Shelly H&T:n lähettämää lämpötilaa pörssisähköohjausten asetuksissa
 * Mitä kylmempi lämpötila, sitä useampi halvempi tunti ohjataan ja samalla myös ohjausminuuttien määrää kasvatetaan.
 * 
 * Tämä muuttaa ainoastaan #1 ohjauksen asetuksia, muihin ei kosketa.
 * 
 * Käyttöönotto:
 * -----
 * Lisää Shelly H&T-asetuksiin "actions -> sensor reports" -osoitteisiin osoite
 *    http://ip-osoite/script/1/update-temp
 * missä ip-osoite on tämän shellyn osoite. 
 * Muista myös ottaa "sensor reports" -ominaisuus käyttöön
 */

//Mitä ohjausta hienosäädetään (0 = ohjaus #1, 1 = ohjaus #2 jne.)
let INSTANCE = 0;

//Kuinka vanha lämpötilatieto sallitaan ohjauksessa (tunteina)
let TEMPERATURE_MAX_AGE_HOURS = 12;

//Viimeisin tiedossa oleva lämpötiladata
let data = null;

//Alkuperäiset muokkaamattomat asetukset
let originalConfig = {
  hours: 0,
  minutes: 60
};

function USER_CONFIG(inst, initialized) {
  //Jos kyseessä on jonkun muun asetukset niin ei tehdä mitään
  if (inst != INSTANCE) {
    return;
  }

  //Vähän apumuuttujia
  const state = _;
  const config = state.c.i[inst];

  //Jos asetuksia ei vielä ole, skipataan (uusi asennus)
  if (typeof config.m2 == "undefined") {
    console.log("Tallenna asetukset kerran käyttäjäskriptiä varten");
    return;
  }

  //Tallenentaan alkuperäiset asetukset muistiin
  if (initialized) {
    originalConfig.hours = config.m2.c;
    originalConfig.minutes = config.m;

    console.log("Alkuperäiset asetukset:", originalConfig);
  }

  //Käytetää lähtökohtaisesti alkuperäisiin asetuksiin tallennettua tuntimäärää ja ohjausminuutteja
  //Näin ollen jos tallentaa asetukset käyttöliittymältä, tulee ne myös tähän käyttöön
  let hours = originalConfig.hours;
  let minutes = originalConfig.minutes;

  try {

    if (data == null) {
      console.log("Lämpötilatietoa ei ole saatavilla");
      state.si[inst].str = "Lämpötila ei tiedossa -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";

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
        state.si[inst].str = "Lämpötila " + data.temp.toFixed(1) + "°C (" + age.toFixed(1) + "h sitten) -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";
        console.log("Lämpötila:", data.temp.toFixed(1), "°C -> asetettu halvimpien tuntien määräksi ", hours, "h ja ohjausminuuteiksi", minutes, "min");

      } else {
        console.log("Lämpötilatieto on liian vanha -> ei käytetä");
        state.si[inst].str = "Lämpötilatieto liian vanha (" + age.toFixed(1) + " h) -> halvat tunnit: " + hours + " h, ohjaus: " + minutes + " min";
      }
    }
  } catch (err) {
    state.si[inst].str = "Virhe lämpötilaohjauksessa:" + err;
    console.log("Virhe tapahtui USER_CONFIG-funktiossa:", err);
  }

  //Asetetaan arvot asetuksiin
  config.m2.c = hours;
  config.m = minutes;
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

      _.si[INSTANCE].chkTs = 0; //Requesting to run logic again

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