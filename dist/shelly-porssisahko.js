let C_LOG=0,C_HIST=12,C_ERRC=3,C_ERRD=120,C_DEF={mode:0,m0:{cmd:0},m1:{lim:0},m2:{per:24,cnt:0,lim:-99},vat:24,day:0,night:0,backups:[],err:0,out:0},n=[],c={s:{v:"2.0.1",st:0,cmd:0,chkTs:0,errCnt:0,errTs:0,upTs:0,timeOK:0,configOK:0,p:{ts:0,now:0,low:0,high:0,avg:0}},p:[[0,0]],h:[],c:C_DEF},i=!1;function a(e,t){t-=e;return 0<=t&&t<3600}function b(e){return Math.floor((e?e.getTime():Date.now())/1e3)}function o(e,t,s){let n=e.toString();for(;n.length<t;)n=s?s+n:" "+n;return n}function u(e,t){var s=new Date;console.log(s.toISOString().substring(11)+": "+e+" - "+t),n.push([b(s),e+": "+t]),n.length>=C_LOG&&n.splice(0,1)}function l(){var e=new Date;c.s.timeOK=2e3<e.getFullYear()?1:0,!c.s.upTs&&c.s.timeOK&&(c.s.upTs=b(e))}function f(e){Shelly.call("KVS.Get",{key:"porssi-config"},function(t,e,s,n){c.c=t?t.value:{};{t=function(e){c.s.configOK=e?1:0,c.s.chkTs=0,n&&(i=!1,p())};let e=0;if(C_DEF){for(var o in C_DEF)if(void 0===c.c[o])c.c[o]=C_DEF[o],e++;else if("object"==typeof C_DEF[o])for(var r in C_DEF[o])void 0===c.c[o][r]&&(c.c[o][r]=C_DEF[o][r],e++);C_DEF=null,0<e?Shelly.call("KVS.Set",{key:"porssi-config",value:c.c},function(e,t,s,n){n&&n(0===t)},t):t&&t(!0)}else t&&t(!0)}},e)}function p(){var e;if(!i)if(i=!0,l(),c.s.configOK)if(function(){let e=new Date,t=!1;t=c.s.timeOK&&(0===c.s.p.ts||new Date(1e3*c.s.p.ts).getDate()!==e.getDate()),c.s.errCnt>=C_ERRC&&b(e)-c.s.errTs<C_ERRD?t=!1:c.s.errCnt>=C_ERRC&&(c.s.errCnt=0);return t}()){var n=!0;let e=new Date,t=e.getFullYear()+"-"+o(e.getMonth()+1,2,"0")+"-"+o(e.getDate(),2,"0")+"T00:00:00%2b03:00",s=t.replace("T00:00:00","T23:59:59"),l={url:"https://dashboard.elering.ee/api/nps/price/csv?fields=fi&start="+t+"&end="+s,timeout:8,ssl_ca:"*"};e=null,t=null,s=null,Shelly.call("HTTP.GET",l,function(t,e,s,n){l=null;try{if(0!==e||null==t||200!==t.code||!t.body_b64)throw new Error("virhe luettaessa hintoja: "+e+"("+s+") - "+JSON.stringify(t));{t.headers=null,s=t.message=null,c.p=[],c.s.p.high=-999,c.s.p.low=999,t.body_b64=atob(t.body_b64),t.body_b64=t.body_b64.substring(t.body_b64.indexOf("\n")+1);let e=0;for(;0<=e;){t.body_b64=t.body_b64.substring(e);var o=[e=0,0];if(0===(e=t.body_b64.indexOf('"',e)+1))break;o[0]=Number(t.body_b64.substring(e,t.body_b64.indexOf('"',e))),e=t.body_b64.indexOf('"',e)+2,e=t.body_b64.indexOf(';"',e)+2,o[1]=Number(t.body_b64.substring(e,t.body_b64.indexOf('"',e)).replace(",",".")),o[1]=o[1]/10*(100+(0<o[1]?c.c.vat:0))/100;var r=new Date(1e3*o[0]).getHours();o[1]+=7<=r&&r<22?c.c.day:c.c.night,c.p.push(o),c.s.p.avg+=o[1],o[1]>c.s.p.high&&(c.s.p.high=o[1]),o[1]<c.s.p.low&&(c.s.p.low=o[1]),e=t.body_b64.indexOf("\n",e)}t=null,c.s.p.avg=0<c.p.length?c.s.p.avg/c.p.length:0;var i=new Date,a=new Date(1e3*c.p[0][0]);if(a.getDate()!==i.getDate())throw new Error("virhe, hinnat eri päivältä - nyt:"+i.toString()+" - data:"+a.toString());c.s.p.ts=b(i),c.s.p.now=h()}}catch(e){c.s.errCnt+=1,c.s.errTs=0,c.s.p.ts=0,c.p=[],u(me,"virhe: "+JSON.stringify(e)),e.message.indexOf("virhe")}c.s.errCnt,C_ERRC,A(n)},n)}else n=new Date,(e=new Date(1e3*c.s.chkTs)).getHours()!==n.getHours()||e.getFullYear()!==n.getFullYear()?A(!0):i=!1;else f(!0)}let r=!1;function A(t){var o,e,s;try{var n=new Date;if(c.s.timeOK&&0<c.s.p.ts&&new Date(1e3*c.s.p.ts).getDate()===n.getDate())c.s.p.now=h(),0===c.c.mode?(r=1===c.c.m0.cmd,c.s.st=1):1===c.c.mode?(r=c.s.p.now<=c.c.m1.lim,c.s.st=r?2:3):2===c.c.mode&&(r=function(){var n=[];for(let s=0;s<24;s+=c.c.m2.per){var o=[];for(let e=s;e<s+c.c.m2.per;e++)o.push(e);let t=0;for(let e=1;e<o.length;e++){var r=o[e];for(t=e-1;0<=t&&c.p[r][1]<c.p[o[t]][1];t--)o[t+1]=o[t];o[t+1]=r}for(let e=0;e<c.c.m2.cnt;e++)n.push(o[e])}let t=b(),s=!1;for(let e=0;e<n.length;e++)if(a(c.p[n[e]][0],t)){s=!0;break}return s}(),c.s.st=r?5:4,!r)&&c.s.p.now<=c.c.m2.lim&&(r=!0,c.s.st=6);else if(c.s.timeOK){for(let e=0;e<c.c.backups.length;e++)if(c.c.backups[e]===n.getHours()){r=!0,c.s.st=7;break}}else r=1===c.c.err,c.s.st=8;o=r,e=function(e){e&&(c.s.chkTs=b()),t&&(i=!1)},s="{id:"+c.c.out+",on:"+(o?"true":"false")+"}",Shelly.call("Switch.Set",s,function(e,t,s,n){if(0===t){for(c.s.cmd=o?1:0;c.h.length>=C_HIST;)c.h.splice(0,1);c.h.push([b(),n.cmd?1:0]),n.cb&&n.cb(!0)}else n.cb&&n.cb(!1)},{cmd:o,cb:e})}catch(e){t&&(i=!1)}}function h(){var t=b();for(let e=0;e<c.p.length;e++)if(a(c.p[e][0],t))return c.p[e][1];throw new Error("price now not found")}u("main","shelly-porssisahko (v."+c.s.v+") started"),u("main","URL is: http://"+(Shelly.getComponentStatus("wifi")?Shelly.getComponentStatus("wifi").sta_ip:"192.168.33.1")+"/script/"+Shelly.getCurrentScriptId()),HTTPServer.registerEndpoint("",function(s,n){if(i)s=null,n.code=503;else{var o=function(e){var t={},s=e.split("&");for(let e=0;e<s.length;e++){var n=s[e].split("=");t[n[0]]=n[1]}return t}(s.query);s=null;let e="application/json",t=!(n.code=200);var s="text/html",r="text/javascript";"s"===o.r?(l(),o.k?n.body=JSON.stringify(c[o.k]):n.body=JSON.stringify(c)):"l"===o.r?n.body=JSON.stringify(u):"r"===o.r?(c.s.configOK=!1,f(),c.s.p.ts=0,n.body=JSON.stringify({ok:!0})):o.r&&"index.html"!==o.r?"s.js"===o.r?(n.body=atob("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"),e=r,t=!0):"s.css"===o.r?(n.body=atob("H4sIAAAAAAAACs1WS4/bNhD+K2yCArublZay4+1GBor2FKAoil7aOyUNLXYpUiDpV4L97x1SokQ53iTHXGyR8+DMfPN6uLsjd8S2IOU567WxVljWPmvir2/qW/LHHq+IsNoxqUlGWuf68uHhv/Em5wIZ/aXF251w7b7Ka91NDA+v6P5T1KAslOTjX/+Q3zkHo8lHUGCYJH/vKynqyEIO65ySuwcU+kwqfcqs+CTUrsRv04DJ8GpLXvDUnO8JQ55aS21K8hZqTnkRaV6Y1c87o/eqQeqqXsOGbokUCrIWxK51JSny99BtCdfK+WfQPJp/mG4464Q8l+RfMA1TbEs6dsqOonFtSTbUeL7xVFD6syebnVCog7C901vSs6YJlm/6E7L0we63TjgJaF3y6GjGII8OOqe7IBUEat2fl/w0f/L8TIqdyixIXhIu4ZSBarbEwcllgVQS4930SnIuT6ijEbaX7Dywh3vHKouEXlvhhPYiIJkTB9guw1ewqv5QTyJlWQHXBu7jkXEHJoChHCgM7Zs32/k55JGQCE/cEpjxyLo2Ur2nUjPUIIG7eJvZo3B1m7qgtJpUZpJVIF/xY5KopK6fLzJglf+y8bGM57U/TMBRhOaxCMG+Go0xJc0gS/NitcG0IFZL0SDXI6NPm+2UoJxzPOyN9adeC4yUQbx0j6L4b5iKxjMpUdtqY5cOlq0+hLgFmcxzhCxMRZF0ITpCgmKLbJ1DhZBouXcYqk+ZUA2ckGW0K4bHYxGsnEJTmC+iMvg3OhvrTfesFu78iovrxM4B4rJuoX6G5t0C12+/M3WHoXjot8AJSl4x6IswYKjp4xjs69YGQ99dxHvSs0riUHw1DohekuM7I7Ci/W/moMM7B6he7jtlURE3odH4j9AosGw8NunDCDVNoebiBM3cqYY+NSBND22Cc4za1OJWNOAdYjp0tJjlsRauddu5kvKQR2lzwm4fCgDdHi23vVAqJPjYCgdzBivHq9Gwxd2iY46FlcEB9dvYJ6IX+aLax2P0ivo+PPoVMOqZQSVTKsWcuyh/jF8kHVvh6yimHnq1t35YYL0xJTo2oJC4SwobGhIzRCguVBDHiHhaZrvQ0r7iT5GvTOpQPM8ercwP4tJvz3DmhnVgF8yfQzvyPc1bhzMFcTS4Sji4WT/SBna3KPtCXJO7e/9b7eIsPI4+V1piSmNjdKJmMmYXehAHX9ZpX5UyjBYck40wUI9TQh+DbR00gt0k8/39E87rW2+WH115h0+nhTmOkqShkp9Eh0uPYyoMrVks2D2fgv2L9A6LwRz3tHcl3SxRaUoujHVZ3QrZhCVpli2wMCuJpThg/h0hGPrJJeOvjThMhvpBGEx4CQWMGeT3rpAYGSZUjStJb2CycTbJE4fyTxNOst5vgvHrYot6maL0ygLiZp+v+JsuXUNLrT2KV/sOPsRFOhjx+YVXSh8NG/Lo+u5xLJ5oIv80Lnl55wo64zwgE2l8V/CKRiTQwWMYCuFUMVyaR7zzzmwWEESPOrm5zKFIqq4Xh6c4dbl0FmGc/Q9aO8NbEwwAAA=="),e="text/css",t=!0):"tab-status.html"===o.r?(n.body=atob("H4sIAAAAAAAACqVSS07DMBC9ipUVLJq0CyQWqSV2CCEVCS4wjvOZ1nFCZlrIfXIGLpCL4cSlpU3LhoUt2e/NmzfPjhmUSUVigGhZypgbt/T+HKhcfCzu54FcFWvYkrAtO1TGSsZUgxWolzRLSi2fQQMD2DAM42iAZBypMzWVe5kNpVZQapDTARw1iKfk174rNv2XFQVahn1vT68bTNKrFYL7zvad2w4FGtorbojbtq7xwCwrfUH5DQ0cKGizys03JidjjbufuDLzKdxyGmqWVCY4ATkRWb7I1FyUzd0EKnnhYnbBvvQd7pz1YWoLLNYgqtHnGGjkqpwz3/n0rVioPJAPuIHJ5eMQ4OR2tZcdZVSl21/Z0nE+3/LyIOaPQbx8gcRVg/AP91d8DsrnLo9eR8oubQgrO3XneZQ0WLNs0vcnugmckPuGwFsK1xTcum/s4W+lX9rnIgMAAA=="),e=s,t=!0):"tab-status.js"===o.r?(n.body=atob("H4sIAAAAAAAACoVV3Y7iNhR+lYx3hOImZICuekEwo7Y71ax2VrPaQW0lhIonMcRLsFPbMEWQu3kU3oQX63EyAUJhKwI49nfO+Xx+1ykzTkpa/gC+GWmFS6ocRqheicjFpL82arXmE3cpeey0rgjRhhqG7dZVuTSJki+OYC/OnVJSuUhIJ6aGIlzoUqWEz4gKtM/hN/IFcf/WLnqnm9E8RjjgQjB1P/j8QFgAO7foy+519/rwsHtFXfTl8eMT8mt4bVYpIGUqVSUxVYwJQCsW78FzGbOa9s+PH+7+ehp8HfLAno0qYKZ4xE54ZIGQL4GRv/F/WOx2sIec6Gb2R7LXrk1N4mnw86BUzoDfXnVMVzXY+BPTM07VUnad67U1Q5fTIzN5aaX3rPr3NF1yUcHSGpsj2CeapuyAS/g0+S9wXPHhYiLrhB6Tb3ShHUPVjGvDjFmApolUc2oGfM5cG9kPEEG3zX78AbydzAYag96mM/bcVs/aNPoWJaCSGiehhQbkXdZg8Rh3rQRkBmdGfqOFHKUiCAKEK65LpjSX4sR/u+1KiJLpas/Uqj9na5GVZN3Zm5jebUHIdfdAHExZSRM3zwkfjvENbN/81LJP5z3eOxm1EVjIdlu+3G13WwyeKZmDg1iw9IcjHEK5dAghZd5h4OzautNQb7rXeR9qzx51gowpvLZVI8lwFFYwRnTIetqrICHzPCyDbKETl+HQQgxoOsDbAJdBysTUJAW40EmJHLJSqyGs2Q5bPWIaDRVkQzoatkc9u5JDM7IvoWk2Mbx47RGxe+HbmuYHMy0wU3CKhCnMiJKTNYNzuHIK/aKM92YzgHXd6fdyoTS4dX1chboWbYSq2/maXLXDum1ly+LkkjGxt4DSnpNaNONha4T9iLT2UWg04L9lu8dm0z7aja0r4KUdpHy+2XSOjgRQi9JFzDT4vX5USXWslJ8Ql/WJ2Ues0XDNIcT2Lhr7455RTtHKCLpez49cQi646hZNpDDNFwY1brrPMo1DaHkov15DAT7TaDZVciHiZtEZu+9YbD8lBPXH2NKyj0fAdOxEKdWaoAk3qF+r+Ll/1cZ578bEIORZLJzbC55pQHVQdIv+LMyV+x6Cf9VH4cUIeyTJ07ccgRF09tY2k1SQQGCTQEtlXJf5BkaTgZA2WRHXDJILjmFtX6uESvhJj4Z0shlk88Q4cuKASJk14IaeJQqRcfX/uaeWV6awf8ZfBvx1i96aa2YbA7Rp8E21I7m+5KZT3h7ReXa4X57nETWRrf11JIWWMAtZMXptl/JRMYa7yGfYvzBl0e8fv97fQZ8a8JQ6jDvQhWOpNf3OnP3+ZEXo8ixFRyMT3HZyluehZf3rL09VQ8v/BU6UjSWUCAAA"),e=r,t=!0):"tab-config.html"===o.r?(n.body=atob("H4sIAAAAAAAACp1U0W6bMBT9FQtp0vbAADdqo4lY4qFVkrZEGrTTHo1xg4kxDJts6fM+hW/oD/BjcwJLA1EyZRJIcMw5Pr7nXtyYrQHhWMqJoQiIDPT94XYW3IaupVeQq3DEafdBpl9Lfcd/CdES/HTGtoEWSYorqTabomB6HbmSckoUYPGEmFkeU+RaLXRWQim8xoA3daKat50OE0XVyeT6QbJXOoEnNQLNXDVvAngPz0P6Gu/p4MNJAcZKlWd4JSu1FbBvTAi/gEOdGG/2OsRafUvc9wpmyrERhKZ90+cItkzUgNWV99BHtETPuMwqXclKCLZ10PIjTFZVIY8/nza10hfjON8lcHBotSnohCSUrKL8VytDS03nOKIcvORlByx8a3F351o7XMe0Cxy5/bbYHmzbG/fN72C2mM69p+A/+uO8u8w2SRb3DXbYRR6nMz/0vnpz7yKHUyYULnGKh32TOSZn2TC8sw7m3n2w8MFUd+Hs8dELQfjk+7PLJspLsUh1H+bH4wTNgmpSXiiWC7DGvNLORgiO+pADkQP70BiN+8A1uu4DIzRQuUJXg50Q3M8ySE7ZDyuhWNbUTV029VFJoUnE+zwkR23tMYFBsWVz/TMA5iCXlrjX0vH8Oxej50DiNW17MKqU2p8txJxToffunCiButAkKVmhUEl/zOVHQ+9ikly8sOXnVBqfdD3a5T8bwvbDTQUAAA=="),e=s,t=!0):"tab-config.js"===o.r?(n.body=atob("H4sIAAAAAAAACnWU/3LaOBDHX0XRZag1gAPM/YUxTNtk5n6k7U3g+s9NpyjyAiq27FprUobx2+RN8mK3MpjYd/Q/r767K+/qs3uIAZkNr4bBTuYMQmn3RnkinB4w3x/0ytulOmKDqzC0KBE6nSvb6VSf4nCMqAxfBd+tx39R/SSNgAtfGwP5b4sP9+GHT7d3X+eLBz+RmedBDyn5cpJmqFPDdjIuIOTXByz59PoA5eTmqEyXotfOeHQF35m1lBbYUMiqhZ1sCmTVQiT3DYGsWjB6vWnGVHbguoMh58EqzT1nQDgIYDL6NYBuV2A3XE60yQpy2mdUh9qA2j6mPzjTEVn9R6m2RWb7rjI+ncTyEWJGqf6vXR886A6Fj+kcc23WnvAzGc1R5uiNenzABbWmip+yZd3rU4pWu8+VQp6TUP0RRFQQ2TN+MvmY83N7B32VRC3XZODT0WXvYT/WSfM5hj4dnOVRP4O8KY98OmjIymBbpoOG/J/koyo58TkoSyVRbTziTqXGpnFVEb1KAp7o8Tv3PeY9EGUZuJP37+Z+VlgXUKe3cudAklF0twOD99oiUNs8rmKttrxXsU8vPD2An+XgfG5hJYsYPRG4cXDAYw18T4Xk+rFIHikFkENFZqi8C9iKHjo6X8UGuE4jQF+1BrtOI0ZftQa+TqsgfVVbDDv9BEj4z5fLALc56vMunDHodM7hdR8DWgfouh5eQmw2HA/oyiM74U/gqp0qaBq9alHl/vzITcOjBdbJg9BpeTTYOnm0bxlduIVipvV1Ajd5+sQMPLGKJ48vCoM6eXl+ec5fntmUyW/SfJNbm3IROPCqrSlD+SQ1sjXgrUTp/f1w331zk2fq5s/Pc38OONvCPuRZmlur+0TvSq9558j4m+4f808ffVsNvV7tPRQikL4tlAJrZ42UX+fvH37/a9Hlszx0jcANGM/BKmOgJcHfWsBia93CknEMtBAQiysu3PQMS3qB4/icA5YXA1hSIEqWvTzrnca9ZUCfqTE0K4UeM7esxFKUYnxKsqhCUSbagGk5++yzzjeAGqIUXSRVRZNT2AX8wCrJeaBPFVT+Y0YU+gkVL9dumEX5L34YfByjBgAA"),e=r,t=!0):n.code=404:(n.body=atob("H4sIAAAAAAAACo1TzW7bMAx+Fc2HIcFiB7sNraVi2HpYscMOw66DIjExE0XyRDpZMOxt+gx9gbzY5Mho4/5gvcgi+fHjR9Kq39hg+NBCw1un6v4UTvuVBK/qLbAWptGRgGXHy/KDqhnZgfp2vItESMfbZnO8q+fZmxO83oLcIezbEFmY4Bk8y2KPlhtpYYcGypMxQ4+M2pVktAP5vlC1xZ0wThNJDm020crna6bgPYJa9ENify1pq8YAE9qDetufl+KmSzTiCwXWLohJrUUTYSkb5pYu5vM15ki1RME6rlLvPxdpJht1FqnnWk2HEqNCLmiLfnXeyuDqhXmIz+NLht+svmqrWWsvaBOxZVgfb5/UGMajF/TIVjX6tmPRb1PGxBryKgxR2cNPk9SLklhzR2mvYDaQJpO/Dzwl7ZFNo0Tt9AKcWIY4yrvHncLqOzpdz/N9LKgcdn+af/lAoV7u6bU9JOYlrv6v+Qku6/yYfuhuk47XCs88Y+H5JNNvSiUAsfh8/UPu0duwr1wwmjH4KkRcoa/QG9dZoEnRR1wTiIvppQMWVqYn2G1TvZmJoBmuHfSWBKlsNXJNYDrTbQvefmrQ2YxYBHuozrw9KMKvG+rDf3Y6CpJjliKLTvWpomhkkn0FF8VVlMU7OC8woenfWZr943yHfpOyU6SK4GRBfHBADQAXPbw6vaeetaAq2cWJO19H9MkxaE2aqjUV6UkNA/0Hbu+nYZkEAAA="),e=s,t=!0),n.headers=[["Content-Type",e],["Access-Control-Allow-Origin","*"]],t&&n.headers.push(["Content-Encoding","gzip"])}n.send()}),Timer.set(1e4,!0,p),p();