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
const CNST={INST_COUNT:3,HIST_LEN:8,ERR_LIMIT:3,ERR_DELAY:120,DEF_INST_ST:{chkTs:0,st:0,str:"",cmd:-1,configOK:0,fCmdTs:0,fCmd:0},DEF_CFG:{COM:{g:"fi",vat:25.5,day:0,night:0,names:[]},INST:{en:0,mode:0,m0:{c:0},m1:{l:0},m2:{p:24,c:0,l:-999,s:0,m:999,ps:0,pe:23,ps2:0,pe2:23,c2:0},b:0,e:0,o:[0],f:0,fc:0,i:0,m:60,oc:0}}};let _={s:{v:"3.0.0-dev1",dn:"",configOK:0,timeOK:0,errCnt:0,errTs:0,upTs:0,tz:"+02:00",tzh:0,p:[{ts:0,now:0,low:0,high:0,avg:0},{ts:0,now:0,low:0,high:0,avg:0}]},si:[CNST.DEF_INST_ST],p:[[],[]],h:[],c:{c:CNST.DEF_CFG.COM,i:[CNST.DEF_CFG.INST]}},loopRunning=!1,cmd=[];function getKvsKey(t){let e="porssi-config-";return e+=t<0?"common":t+1}function isCurrentHour(t,e){e-=t;return 0<=e&&e<3600}function limit(t,e,n){return Math.min(n,Math.max(t,e))}function epoch(t){return Math.floor((t?t.getTime():Date.now())/1e3)}function padStart(t,e,n){let s=t.toString();for(;s.length<e;)s=n?n+s:" "+s;return s}function getDate(t){return t.getDate()}function updateTz(t){let e=t.toString(),n=0;"+0000"==(e=e.substring(3+e.indexOf("GMT")))?(e="Z",n=0):(n=+e.substring(0,3),e=e.substring(0,3)+":"+e.substring(3)),e!=_.s.tz&&(_.s.p[0].ts=0),_.s.tz=e,_.s.tzh=n}function log(t){console.log((new Date).toString().substring(16,24)+":",t)}function addHistory(t){for(;0<CNST.HIST_LEN&&_.h[t].length>=CNST.HIST_LEN;)_.h[t].splice(0,1);_.h[t].push([epoch(),cmd?1:0,_.si[t].st])}function updateState(){var t=new Date;_.s.timeOK=2e3<t.getFullYear()?1:0,_.s.dn=Shelly.getComponentConfig("sys").device.name,!_.s.upTs&&_.s.timeOK&&(_.s.upTs=epoch(t))}function getConfig(m,t){var e=getKvsKey(m);Shelly.call("KVS.Get",{key:e},function(e,t,n,s){m<0?_.c.c=e?JSON.parse(e.value):{}:_.c.i[m]=e?JSON.parse(e.value):{};{e=m;var o=function(t){m<0?_.s.configOK=t?1:0:(_.si[m].configOK=t?1:0,_.si[m].chkTs=0),s&&(loopRunning=!1,Timer.set(1e3,!1,loop))};let t=0;if(CNST.DEF_CFG.COM||CNST.DEF_CFG.INST){var i,r=e<0?CNST.DEF_CFG.COM:CNST.DEF_CFG.INST,c=e<0?_.c.c:_.c.i[e];for(i in r)if(void 0===c[i])c[i]=r[i],t++;else if("object"==typeof r[i])for(var l in r[i])void 0===c[i][l]&&(c[i][l]=r[i][l],t++);e>=CNST.INST_COUNT-1&&(log("default config deleted"),CNST.DEF_CFG.COM=null,CNST.DEF_CFG.INST=null),0<t?(e=getKvsKey(e),Shelly.call("KVS.Set",{key:e,value:JSON.stringify(c)},function(t,e,n,s){0!==e&&log("chkConfig() - error:"+e+" - "+n),s&&s(0===e)},o)):o&&o(!0)}else o&&o(!0)}},t)}function loop(){if(!loopRunning)if(loopRunning=!0,updateState(),_.s.configOK)if(pricesNeeded(0))getPrices(0);else if(pricesNeeded(1))getPrices(1);else{for(let t=0;t<CNST.INST_COUNT;t++){if(!_.si[t].configOK)return void getConfig(t,!0);if(function(t){var e=_.si[t],t=_.c.i[t];if(1!=t.en)return;if(0==e.chkTs)return 1;var n=new Date,s=new Date(1e3*e.chkTs);return s.getMinutes()!=n.getMinutes()||s.getFullYear()!=n.getFullYear()||0<e.fCmdTs&&e.fCmdTs-epoch(n)<0||0==e.fCmdTs&&t.m<60&&n.getMinutes()>=t.m&&e.cmd+t.i==1}(t))return void Timer.set(500,!1,logic,t)}loopRunning=!1}else getConfig(-1,!0)}function pricesNeeded(t){var e=new Date;let n=!1;return n=1==t?_.s.timeOK&&0===_.s.p[1].ts&&15<=e.getHours():((t=getDate(new Date(1e3*_.s.p[0].ts))!==getDate(e))&&(_.s.p[1].ts=0,_.p[1]=[]),_.s.timeOK&&(0==_.s.p[0].ts||t)),_.s.errCnt>=CNST.ERR_LIMIT&&epoch(e)-_.s.errTs<CNST.ERR_DELAY?n=!1:_.s.errCnt>=CNST.ERR_LIMIT&&(_.s.errCnt=0),n}function getPrices(c){try{let i=new Date;updateTz(i);var e=1==c?new Date(864e5+new Date(i.getFullYear(),i.getMonth(),i.getDate()).getTime()):i;let t=e.getFullYear()+"-"+padStart(1+e.getMonth(),2,"0")+"-"+padStart(getDate(e),2,"0")+"T00:00:00"+_.s.tz.replace("+","%2b");var n=t.replace("T00:00:00","T23:59:59");let r={url:"https://dashboard.elering.ee/api/nps/price/csv?fields="+_.c.c.g+"&start="+t+"&end="+n,timeout:5,ssl_ca:"*"};i=null,t=null,Shelly.call("HTTP.GET",r,function(e,t,n){r=null;try{if(0!==t||null==e||200!==e.code||!e.body_b64)throw Error("error: "+t+"("+n+") - "+JSON.stringify(e));{e.headers=null,n=e.message=null,_.p[c]=[],_.s.p[c].avg=0,_.s.p[c].high=-999,_.s.p[c].low=999,e.body_b64=atob(e.body_b64),e.body_b64=e.body_b64.substring(1+e.body_b64.indexOf("\n"));let t=0;for(;0<=t;){e.body_b64=e.body_b64.substring(t);var s=[t=0,0];if(0===(t=1+e.body_b64.indexOf('"',t)))break;s[0]=+e.body_b64.substring(t,e.body_b64.indexOf('"',t)),t=2+e.body_b64.indexOf('"',t),t=2+e.body_b64.indexOf(';"',t),s[1]=+(""+e.body_b64.substring(t,e.body_b64.indexOf('"',t)).replace(",",".")),s[1]=s[1]/10*(100+(0<s[1]?_.c.c.vat:0))/100;var o=new Date(1e3*s[0]).getHours();s[1]+=7<=o&&o<22?_.c.c.day:_.c.c.night,_.p[c].push(s),_.s.p[c].avg+=s[1],s[1]>_.s.p[c].high&&(_.s.p[c].high=s[1]),s[1]<_.s.p[c].low&&(_.s.p[c].low=s[1]),t=e.body_b64.indexOf("\n",t)}if(e=null,_.s.p[c].avg=0<_.p[c].length?_.s.p[c].avg/_.p[c].length:0,_.s.p[c].ts=epoch(i),1==c&&_.p[c].length<23)throw Error("huomisen hintoja ei saatu")}}catch(t){log("getPrices() - error:"+t),_.s.errCnt+=1,_.s.errTs=epoch(),_.s.p[c].ts=0,_.p[c]=[]}1==c?loopRunning=!1:Timer.set(500,!1,logic,0)})}catch(t){log("getPrices() - error:"+t),_.s.p[c].ts=0,_.p[c]=[],1==c?loopRunning=!1:Timer.set(500,!1,logic,0)}}function logic(i){try{console.log("logic",i),cmd[i]=!1;var t,e,n=new Date;updateTz(n),!function(){if(_.s.timeOK&&0!=_.s.p[0].ts){var e=epoch();for(let t=0;t<_.p[0].length;t++)if(isCurrentHour(_.p[0][t][0],e))return _.s.p[0].now=_.p[0][t][1];return _.p[0].length<24&&(_.s.p[0].ts=0),_.s.p[0].now=0}_.s.p[0].now=0}();let s=_.si[i],o=_.c.i[i];function r(t){if(null==t)loopRunning=!1;else if(cmd[i]!=t&&(s.st=12),cmd[i]=t,o.i&&(cmd[i]=!cmd[i]),1==o.oc&&s.cmd==cmd[i])log("logic(): lähtö on jo oikeassa tilassa"),addHistory(i),s.cmd=cmd[i]?1:0,s.chkTs=epoch(),loopRunning=!1;else{let e=0,n=0;for(let t=0;t<o.o.length;t++)!function(o,t){var e="{id:"+o+",on:"+(cmd?"true":"false")+"}";Shelly.call("Switch.Set",e,function(t,e,n,s){0!=e&&log("setRelay() - output #"+o+" failed: "+e+" - "+n),s(0==e)},t)}(o.o[t],function(t){e++,t&&n++,e==o.o.length&&(n==e&&(addHistory(i),s.cmd=cmd[i]?1:0,s.chkTs=epoch()),loopRunning=!1)})}}log("running logic instance "+i),0===o.mode?(cmd[i]=1===o.m0.c,s.st=1):_.s.timeOK&&0<_.s.p[0].ts&&getDate(new Date(1e3*_.s.p[0].ts))===getDate(n)?1===o.mode?(cmd[i]=_.s.p[0].now<=("avg"==o.m1.l?_.s.p[0].avg:o.m1.l),s.st=cmd[i]?2:3):2===o.mode&&(cmd[i]=function(t){var e=_.c.i[t],s=(e.m2.ps=limit(0,e.m2.ps,23),e.m2.pe=limit(e.m2.ps,e.m2.pe,24),e.m2.ps2=limit(0,e.m2.ps2,23),e.m2.pe2=limit(e.m2.ps2,e.m2.pe2,24),e.m2.c=limit(0,e.m2.c,0<e.m2.p?e.m2.p:e.m2.pe-e.m2.ps),e.m2.c2=limit(0,e.m2.c2,e.m2.pe2-e.m2.ps2),[]);for(_inc=e.m2.p<0?1:e.m2.p,_i=0;_i<_.p[0].length;_i+=_inc)if(!((_cnt=-2==e.m2.p&&1<=_i?e.m2.c2:e.m2.c)<=0)){var o=[];for(_start=_i,_end=_i+e.m2.p,e.m2.p<0&&0==_i?(_start=e.m2.ps,_end=e.m2.pe):-2==e.m2.p&&1==_i&&(_start=e.m2.ps2,_end=e.m2.pe2),_j=_start;_j<_end&&!(_j>_.p[0].length-1);_j++)o.push(_j);if(e.m2.s){let e=999,n=0;for(_j=0;_j<=o.length-_cnt;_j++){let t=0;for(_k=_j;_k<_j+_cnt;_k++)t+=_.p[0][o[_k]][1];t/_cnt<e&&(e=t/_cnt,n=_j)}for(_j=n;_j<n+_cnt;_j++)s.push(o[_j])}else{for(_j=0,_k=1;_k<o.length;_k++){var n=o[_k];for(_j=_k-1;0<=_j&&_.p[0][n][1]<_.p[0][o[_j]][1];_j--)o[_j+1]=o[_j];o[_j+1]=n}for(_j=0;_j<_cnt;_j++)s.push(o[_j])}if(-1==e.m2.p||-2==e.m2.p&&1<=_i)break}let i=epoch(),r=!1;for(let t=0;t<s.length;t++)if(isCurrentHour(_.p[0][s[t]][0],i)){r=!0;break}return r}(i),s.st=cmd[i]?5:4,!cmd[i]&&_.s.p[0].now<=("avg"==o.m2.l?_.s.p[0].avg:o.m2.l)&&(cmd[i]=!0,s.st=6),cmd[i])&&_.s.p[0].now>("avg"==o.m2.m?_.s.p[0].avg:o.m2.m)&&(cmd[i]=!1,s.st=11):_.s.timeOK?(s.st=7,t=1<<n.getHours(),(o.b&t)==t&&(cmd[i]=!0)):(cmd[i]=1===o.e,s.st=8),_.s.timeOK&&0<o.f&&(e=1<<n.getHours(),(o.f&e)==e)&&(cmd[i]=(o.fc&e)==e,s.st=10),cmd[i]&&_.s.timeOK&&n.getMinutes()>=o.m&&(s.st=13,cmd[i]=!1),_.s.timeOK&&0<s.fCmdTs&&(0<s.fCmdTs-epoch(n)?(cmd[i]=1==s.fCmd,s.st=9):s.fCmdTs=0),"function"==typeof USER_OVERRIDE?USER_OVERRIDE(cmd[i],_,r):r(cmd[i])}catch(t){log("logic() - error:"+JSON.stringify(t)),loopRunning=!1}}let _i=0,_j=0,_k=0,_inc=0,_cnt=0,_start=0,_end=0;log("shelly-porssisahko v."+_.s.v),log("URL: http://"+(Shelly.getComponentStatus("wifi").sta_ip??"192.168.33.1")+"/script/"+Shelly.getCurrentScriptId()),_.c.i.pop(),_.si.pop();for(let t=0;t<CNST.INST_COUNT;t++)_.si.push(Object.assign({},CNST.DEF_INST_ST)),_.c.i.push(Object.assign({},CNST.DEF_CFG.INST)),_.c.c.names.push("(tyhja)"),_.h.push([]),cmd.push(!1);CNST.DEF_INST_ST=null,HTTPServer.registerEndpoint("",function(n,s){try{if(loopRunning)return n=null,s.code=503,s.headers=[["Access-Control-Allow-Origin","*"]],void s.send();var o=function(t){var e={},n=t.split("&");for(let t=0;t<n.length;t++){var s=n[t].split("=");e[s[0]]=s[1]}return e}(n.query),i=parseInt(o.i);n=null;let t="application/json",e=(s.code=200,!0);var r,c="text/html",l="text/javascript";"s"===o.r?(updateState(),0<=(r=parseInt(o.i))&&r<CNST.INST_COUNT?s.body=JSON.stringify({s:_.s,si:_.si[r],c:_.c.c,ci:_.c.i[r],p:_.p}):s.body=JSON.stringify(_),e=!1):"c"===o.r?(updateState(),0<=i&&i<CNST.INST_COUNT?s.body=JSON.stringify(_.c.i[i]):s.body=JSON.stringify(_.c.c),e=!1):"h"===o.r?(0<=i&&i<CNST.INST_COUNT&&(s.body=JSON.stringify(_.h[i])),e=!1):"r"===o.r?(_.s.configOK=!1,_.si[i].configOK=!1,loopRunning||getConfig(i,loopRunning=!0),_.s.p[0].ts=0,_.s.p[1].ts=0,s.code=204,e=!1):"f"===o.r&&o.ts?(_.s.fCmdTs=+(""+o.ts),_.s.fCmd=+(""+o.c),_.s.chkTs=0,s.code=204,e=!1):o.r?"s.js"===o.r?(s.body=atob("H4sIAAAAAAAACo1W727bNhB/FYXLDBJiCGddv9hTgq3J1nXpOtRugaEIlqt0thnTpCOe3Bia3sZv4hcbKMmOkrnZvsQR+bu73/2nQYo+vL9KGJMf3l+Nwi+kpFc4hs/h484nlJxlLi0WaEndFZivR2gwJZdzEvLip18SLpKzspKj8Y/jy79G4/fJJ/bbdrO2VntC2m62G8tkOPLazW6h8Eyy19oSRGAMRjncgt0frY1+coI6moFZ6cVSQ0TbjTHbTRQQtzD3zhjYI/8nrLYK2kK0DORq4MnO5kfIF0XhqbDUso14YKAtuVuQEeg5RKQxc96DCDq3G9puSBvYwWsI6keoP2A+dyc7xLc+Ak/68QVREdVmH8ViAXOvF3pHLwSWaLu53W5s5Oe5Xu5pro2e6/zWaSIIzo4La7WNmtuFtkVBmqJ5UIBEa3Yt37676CTsaXaCSSbZmxA+28Z2ARQ4Wk3sWmrrKelLT0CYrJzOor589dMo+XQtF1hXBWPSOLcc6wXmiS2MkW6JNpQW+LVNI0rOykbwKEmo12Ms/P79N6eEEXw+CaoLz4T8om3mvijjUiDtrJqBnyXUKVUariCPILnznH3DYhJD6PU4qHSG6Ryz5KgvJGNJ0gDSkwBR2lrMX4/fXvV68AU0RUu3LAwQXqwtLHR6AQScYqZmtDBM7uRkscyA8Mq5JT/qi0riCswrZwm0xXyUhqSMYeoT3tJ21jjIGp/rZmmjwA+5pXzx2VOu7ZSfxgcB2mZ4/24SHBVCVPJwd/5oDGeKPBNq4vJLSGeckjNSkGWXK7R0FbrTYs5ZOgM7RSapw4wUQT5FUjoTlRASDQYTv2bJWTlxOQ/R9rWnPoR0fy0OkGhwTEid9If6h1ZMGbRTmg11HIv26JO+bnIyxns6D1Hlh27EYIKUzrp3Pk+FohlaPilsGkLFMyAQZfirCO+JP73PRVlbyEUlKiE7ypaQo6XfXYYqx4Vb4auZNlnHXMAfKJU2wSQh5JjydXlx+bEu5jBaY3aeJywmlePSQIq8rnAmGRMPR7tKY0LUBY1JU5hTpKYY5dGpGKJy83N+5zl0ajhBFZz9WjFyEGLwVIRd5rnLg3bSdhoF+UHEYlR0T1UKIcgkytRZ7wwqDGBOoqpky6f1GCSGBmudDrx1y7tJFIihnnCt3FyUBimiehYMc6Qit9F3/e+PkkSrptl7PU4JnjfiWt16Z7kY7D6bTAq5Q8vSzQdHfZm6DAf7Q7qn/UcoGFk7RlXVWnzsEMQsON0VEI3e0wN6b45LqAbRcdnFVxE/Lh9zrMRNYza4Wj0E8yCFVik/Lt+M3v2umvbXk3UItrh5zObktMvjKyJd05WcuHwBIWEYlvnNcUmqSSCGrnCjZtoItYRsRJAT/06yPhOVOi45YzE/jWuBt87SjAtxAHjTIH4ujPkTIeeitRkmfxI6IjnqhyI5FWEETZFeuyL3z1qP2YC1drUtCP8DzeF8LzDC1NnseYEBC0J4ztTeijHaPyv5Yi/ZCekhFx9uOYmYRSx+CEeASuwukXYZQnJWpgYhDyhXEN+vTiHrreWX2jKhPK0NqpX2+rM2mtYJq/83yIa79qMnY2M/f3xPJywOi1sMqZ4izfamZnbUZsItOzTHXXhr2M4+aUcddSbKzbvmMfLNcQnxaTWIbuLagkqVhQX6T3AtxOBl/0VY9CoUdK/XcgjVKuSuMYybctbs90HnTSrCC+PRQguD7euzSj7oribagjHr8vlgznSWoe0+XDzSLiUPSZMv8YWoqmE3ZM+v1vq5FIeG2i/XFZgCxb9eUI/9O+qLfz05hLy4/Hie490bz1mGK3XrmRh0QGL4D0+Ml8faCwAA"),t=l):"s.css"===o.r?(s.body=atob("H4sIAAAAAAAACo1VTW/jNhD9K4MNFsh6LVlK1tuEQoP2tEBRFL20l6IHihpZrCmSIEexvIb/e0Hqw4qToL0YFjkzfPPmzcxmtYIV+AaVOibWOO+l583eQDi+FZ/gl857CdIb4spAAg2RZZvNP+NJWktYxUPPNpudpKYrU2Ha2WDzTuxfpUDtkcG33/6An+sanYFvqNFxBb93pZJiMoHn+zSD1QZWcILS9ImX36XeMSiNq9AlpekLOENpquMaOJxAGGUcgxsUdVbn011w5mK/c6bTFYObO3GP26wAJTUmDcpdQwzy9Au2BdRGU3gGGWTp43xS81aqI4M/0VVc8wJa3icHWVHD4MujC3bjV55lH8O120nNIAPekSnA8qqKyLe2hzyzEfcNSVIIp+WjI4zBPykNkWmjV3QQxh5f2mfpQ7DnSu504lHVDGqFfYK6KoCwpyReMXAhzRAkrVUPJ6ikt4ofB/N4Trz0cAJrvCRpggsqTvIZi5f05bwUj2J2YazE2jhcT5+8JnSxGJpQE4MPH4rLc8RLhQvn2Vohd6Gy1Ey3IVNlODFQWA/Yya8hbZbwtdFzuETxEtXytlRG7K8qfZf+sA2czTXJIE/vwskoKzfa2R68UbKCm/wrzx62BYjO+SAwa6QmdPO7Y6pweqmCC5W89EZ1hAV8T6SusGeQF0DGXuCEHBlkC1y5wxauyK/ruphlPgnZWC4kHaN3JImJBsUeq88vWPnvQAMBb8SJIT5f5To/my/SuhtcjV2WYedkVcTfhLC1ihMmwqiu1Z5BXrvYJeFPdPZWRx1GjhN8Rk1+KvTEb3oXm+7SvcP3nED8HstHjmtvuUNNc42nzCcxj8dk7HR1aGSo16QJXsnOM9iGunItWz4UNmDNfRQYdyB1LXV0O8NPezzWjrfoYUgoaAJOA5rauJaBM8QJb++/ZhXuPsEZzkN7pEI8UZhcT+SeqGK1dJ4S0UhVrSEtd+vRzLdAbnk7zYbDSEtpVFXAMzqSgqtpFJCx77d0rfqkNaHMKvYf9kklHYpxJJhDzK3FSvLb5RB8yGz/KaQXkbVL/Gu4KfdP7/Xmi445v+V/leE4G8d+CZPxUrwo3Xk7DMMzW4R9zdfSN7c9lIqL/SCc/8HHIOJrw6dKPs9ARwAjhMuLPnRPHD9LUSpuw2qc/r2m54L5DbzLNTP0oQglWawBgfPgquVyYH0sBsVHXBja7eC4jYaH/CFbWD5MwVvKs0s9BgbH1RbYyEe+4nwI5m67JCWuwmwcNa3aXld2eqVcw41PRPuOuM8gte3oLzpa/LHsiIz++3ql5mE0nC9Nc3pjzY/ZDet6YRsJn3i9D5jeptN3bctd2M6vl8S/K9m5Q2sJAAA="),t="text/css"):"status"===o.r?(s.body=atob("H4sIAAAAAAAACpWQS07DMBRFt2JlBIMkzQCJgesFICQGdAMvtqs49SfkvbTNfrIGNpCNoeZHC+XT8T0+PjYnyK1m0gLiOnJMykhwqgUnJZ7BkGYlsFCU0CAnxYxaY6z8jEznDtnjSrwMEPMtLaB0J4kCAvBJkszegdyh9gy1NaQXHmm5+7Xvil3/7llhPMGF1YeDuFAhtW1VmQVwQemF2BgLy2L8NgieDm8WXJn9/PCtPbKtPcYu5LEMNroYSZ62jLn64dvgKFtFgudzMKO+833Xd56nueCpMnvBxz8eCiqzuhpwrtoE0g01Dn6RjcdITtYz6Uhdy7f/yC+a4LT38FN9dkP9H67sa/Nn+QBcsY8EytpUJGr99oR3EUEeIwE1mJQY3fN0mj8AnRW/d9oCAAA="),t=c):"status.js"===o.r?(s.body=atob("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"),t=l):"history"===o.r?(s.body=atob("H4sIAAAAAAAACmWNOw7CMBBEr2K5gsJY9JuVaGkoOIF/IRuMDN5NlNweEQWElGaK90YzEGlUITvmRrd5Um2ezKN4E0rWCH9SwscdNYI4nxOCVASJP638TeOJ7m4DL13vBt7ga8okCeyy40ucFcWGTUcsCHY9sZHGb3Ko9BSs6XXmnRbnl26p86FnvQe7+jdGEOBV0gAAAA=="),t=c):"history.js"===o.r?(s.body=atob("H4sIAAAAAAAACnVR0WrbQBD8lfPWFXeVojgNfbG9Mm0T6ENKIVafhGjW0jq6VtG5dxsbI/Q3+ZP8WJFDC30I7NOwMzsz27csirEoF3vyaoMUjl2lBLNe/LG3Wy1RpH8HDW/CWWODgElt17H/kn+9QYBkpJpk72ytZhPEICQcRSC0Oa07fwREqsTuOaeNGRUnpyUjjXcHde298xo6p2oSAnOyERKPdCAr6p7lioT099ubdQwrj01kEWLbBTELn7pfK0afjtT5h9nlBNGnlas5ivSLMUZOg/OitSTBYBaKWXkmxaw0yeuhFlvndVBuq9j0ox9CWIrPICHU48R4t5RaVS2FgLC1Atm03zr/QJLbB9YdH9QVCesLvnw3njRmWJ5Lnd2Z+MQMcmwZoXKt8/NpH4qLcgX3nrmDOXiuYRgVX+BvzU96DGr3/PT81LYM83+IswH+082m/Tr/mF//WOe3RSjel+Uq9bxrqWINSr8NioJYAwnAX0MxLM/HaItX6oiRhmGoSKpGi+kr1wXXcsqnt8nrLcowLDbaJJ8/rdPdY2j0xgx/AEdE6vhsAgAA"),t=l):"config"===o.r?(s.body=atob("H4sIAAAAAAAACpVWS27jSAy9SsGDQScL+aOkuwOPXIAXacSJYw/GTgazpKVKxKg+ahXlxL2eo+gMuYAuNpBk2ZbyMWZlFFkkn8j3WPYCXDNfgrWjDvls1bG0kWL0YDQ5Fn+J4aB7JtQfCpJH1M7KEBk1/Bq/8H+ml5PF5ZKNF5fLu5vF5dLrBbjmHsFKijqjYr7f4R4l3KOA3wIUP54VUvjEMBg9cs/EhEazNchUjB6QL1KjsGkVgt9jYppGueZToDVCy0x8ioIoBa9X1anLbzE9Dy76fJFnYZS/ajae3peQUMdpiWgNxIrvHrmc/V4DXyAmZBRENqXi3P/uuO6Q7aMC2Oyi/F70d+jt26po0Oeu6/S/H0ZofAypFVM1sFd2kHvNwRRZjk2HTDx0+/HLO9PaTYk5bH51Pb5bsN88G4MusPjIvV5x4FsIRenC/vDoyC0G8vkUAiAA3e1239xjFbAAbSxhM9RGi8+ocDiLmzzbUP5qbZ4djII2sRj5ofCjlXkpigjNmSdhJSR7MElxnM968x8/vF5p3JFshgqbI9U73zx8gtQSxG0eKhMI3iZMeZ0ICkrIPAuD/JWamU1Ktprh+S5oWt3UzJTFWoWM32J8n49RAyNIIrQEwtoWoQf8HlAzlaZEael+D2ZqFeo0JWwhVKh3JFOo65CbPMszTQK1aAD9oPeo17tq95CoNLWUal0WK/yraOe+yjPKM0IJx9OKJGnONEk+GOqfEEXGKTNGVlTfGAgClLZWmfzKPZsqBcmGz0pKZb0YURoqOrZ1bCmJweghrIlpVSmuzl55vW3qI1rkN/m/i0mlpqPL75Dx86OdUX3HV0GjOVtTqz+fA7yazJbjv8bX4/8F7wo1QQJP0KLSwJGo2ivr0/rX45vFfMauxtP7ye3teMmWd7PZ5PhLcYhm/AT6CSJr2pJ1nVgkLTW559w9D1sCcvnAbdku+EXL8o1/a1nOeTvTGT9rWVzezuwMuFFQHIouspMBK8Gftm65zVtudQtOd+Jm1XauGhFywAjWeSaRnUTSnA7rfU1JzX/X8attoIBBo2f7CbpObOsBDvt95rCmUxw4a+ktU02oin2RNBZ0FeLr/SMWNtG4b+Ew9x1A7qeI3CakN/kb8N7J72tyGwirfSKSPIuiPMN6m3wkRNexP3drqFzVcVFMyjxjTkskVZltmERVi2T39yeyqDAsRv5RlDourM7BB1pYiwr0KiXa0WsJUgqtoX7P96/1W40u55PbyWw2X765RX5daf9HplGsWKMm8cW26sGSttxbJUeijfYl+tHoyzPqwDx3TSz0SafXOf1SpessQiHlRrMQZCmTTv0h1k8wJp6In9f2pEOwcnyjH/Cx+2Q7hYIq93/IeaeW2goAAA=="),t=c):"config.js"===o.r?(s.body=atob("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"),t=l):s.code=404:(s.body=atob("H4sIAAAAAAAACqVU224TMRD9FWMklIjsLi0vqFm7QrQS9AUeUF+RY0+y0zj24plNFCH+hm/oD/TH0F4Sui2ViniZ3ZkzPud47N3yhYuW9zVUvPG6bKPwJqwUBF1ugI2wlUkErBpeZu90ycge9Je720SEdPerWt/dlkVf7RcEswG1RdjVMbGwMTAEVnKHjivlYIsWsi6ZYUBG4zOyxoM6kbp0uBXWGyLFse5TdOqvmgNGNYZhCdVBEO89KIdUe7M/w+AxQLbw0a51WTjcHmIXCDxYblkwEOsy1owxiK3xDag3+nN1YxoSL0/GwMkROB0Dp0fgbVn03PfkWhkb671+1ca5uGqIUHyiyMZHMSmNqBIsVcVc01lR3GCP5EsUbNIKWH1beBPW+h5SFkZPH+7rMECzoAe5LjHUDYv2vFUyDmN/WKYbsllkxIYbErYCuwanhueBgLQovVmAF8uYRv0HgayD9Vf0piz697GDbLgO3TCyPxSPDucfTFdIHNP+aZcPGo42P3Z1fLbVged/vNoYlrh62uoYPzp9T8DNmoCfa7XnGTvtI9mENWsbA7G4uLxWOwwu7nIfrWnvch4TrjDkGKxvHNBEtoivIrGczj2wcMpF22wg8MwmMAyXHtpMgdIuH5UmMJ2ZuobgPlToXd+xiG6f36u2TQm+X1EL/9iaJEiNWWRvWk7nlFOy6uLy+hzO5HlS8jXkCWpvLExku3E5k3KkOaHpz5mlR5Qew1pO55YoT+CV7H4cVAGwbNvz7mNshSTllkh2cv3riN4SDfYnkvIbktOyGGb8G+Xzs5JcBQAA"),t=c),s.headers=[["Content-Type",t]],s.headers.push(["Access-Control-Allow-Origin","*"]),e&&s.headers.push(["Content-Encoding","gzip"])}catch(t){log("http - error:"+t),s.code=500}s.send()}),Timer.set(1e4,!0,loop),loop();

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