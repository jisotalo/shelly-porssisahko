let C_HIST=24,C_ERRC=3,C_ERRD=120,C_DEF={mode:0,m0:{cmd:0},m1:{lim:0},m2:{per:24,cnt:0,lim:-999,sq:0,m:999},vat:24,day:0,night:0,bk:0,err:0,out:0,fh:0,inv:0},c={s:{v:"2.5.0",st:0,cmd:0,chkTs:0,errCnt:0,errTs:0,upTs:0,timeOK:0,configOK:0,fCmdTs:0,p:{ts:0,now:0,low:0,high:0,avg:0}},p:[],h:[],c:C_DEF},l=!1,i=!1;function o(t,e){e-=t;return 0<=e&&e<3600}function a(t){return Math.floor((t?t.getTime():Date.now())/1e3)}function n(t,e,s){let n=t.toString();for(;n.length<e;)n=s?s+n:" "+n;return n}function f(t){return t.getDate()}function g(t,e){var s=new Date;console.log(s.toISOString().substring(11)+": "+(e?e+" - ":""),t)}function m(){var t=new Date;c.s.timeOK=2e3<t.getFullYear()?1:0,!c.s.upTs&&c.s.timeOK&&(c.s.upTs=a(t))}function u(t){Shelly.call("KVS.Get",{key:"porssi-config"},function(e,t,s,n){c.c=e?e.value:{};{e=function(t){c.s.configOK=t?1:0,c.s.chkTs=0,n&&(l=!1,b())};let t=0;if(C_DEF){for(var r in C_DEF)if(void 0===c.c[r])c.c[r]=C_DEF[r],t++;else if("object"==typeof C_DEF[r])for(var i in C_DEF[r])void 0===c.c[r][i]&&(c.c[r][i]=C_DEF[r][i],t++);C_DEF=null,0<t?Shelly.call("KVS.Set",{key:"porssi-config",value:c.c},function(t,e,s,n){n&&n(0===e)},e):e&&e(!0)}else e&&e(!0)}},t)}function b(){var t,e;if(!l)if(l=!0,m(),c.s.configOK)if(function(){let t=new Date,e=!1;e=c.s.timeOK&&(0===c.s.p.ts||f(new Date(1e3*c.s.p.ts))!==f(t)),c.s.errCnt>=C_ERRC&&a(t)-c.s.errTs<C_ERRD?(C_ERRD,a(t),c.s.errTs,e=!1):c.s.errCnt>=C_ERRC&&(c.s.errCnt=0);return e}()){let e=new Date;try{let t=e.getFullYear()+"-"+n(e.getMonth()+1,2,"0")+"-"+n(f(e),2,"0")+"T00:00:00%2b03:00";var s=t.replace("T00:00:00","T23:59:59");let l={url:"https://dashboard.elering.ee/api/nps/price/csv?fields=fi&start="+t+"&end="+s,timeout:5,ssl_ca:"*"};e=null,t=null,Shelly.call("HTTP.GET",l,function(e,t,s){l=null;try{if(0!==t||null==e||200!==e.code||!e.body_b64)throw new Error("conn.err ("+s+") "+JSON.stringify(e));{e.headers=null,s=e.message=null,c.p=[],c.s.p.high=-999,c.s.p.low=999,e.body_b64=atob(e.body_b64),e.body_b64=e.body_b64.substring(e.body_b64.indexOf("\n")+1);let t=0;for(;0<=t;){e.body_b64=e.body_b64.substring(t);var n=[t=0,0];if(0===(t=e.body_b64.indexOf('"',t)+1))break;n[0]=Number(e.body_b64.substring(t,e.body_b64.indexOf('"',t))),t=e.body_b64.indexOf('"',t)+2,t=e.body_b64.indexOf(';"',t)+2,n[1]=Number(e.body_b64.substring(t,e.body_b64.indexOf('"',t)).replace(",",".")),n[1]=n[1]/10*(100+(0<n[1]?c.c.vat:0))/100;var r=new Date(1e3*n[0]).getHours();n[1]+=7<=r&&r<22?c.c.day:c.c.night,c.p.push(n),c.s.p.avg+=n[1],n[1]>c.s.p.high&&(c.s.p.high=n[1]),n[1]<c.s.p.low&&(c.s.p.low=n[1]),t=e.body_b64.indexOf("\n",t)}e=null,c.s.p.avg=0<c.p.length?c.s.p.avg/c.p.length:0;var i=new Date,o=new Date(1e3*c.p[0][0]);if(f(o)!==f(i))throw new Error("date err "+i.toString()+" - "+o.toString());c.s.p.ts=a(i),c.s.p.now=y()}}catch(t){c.s.errCnt+=1,c.s.errTs=a(),c.s.p.ts=0,c.p=[],g(t)}p()})}catch(t){g(t),p()}}else t=new Date,(e=new Date(1e3*c.s.chkTs)).getHours()!==t.getHours()||e.getFullYear()!==t.getFullYear()||0<c.s.fCmdTs&&c.s.fCmdTs-a(t)<0?p():l=!1;else u(!0)}function p(){var t,e,s,n,r=new Date;i=!1;try{c.s.timeOK&&0<c.s.p.ts&&f(new Date(1e3*c.s.p.ts))===f(r)?(c.s.p.now=y(),0===c.c.mode?(i=1===c.c.m0.cmd,c.s.st=1):1===c.c.mode?(i=c.s.p.now<=c.c.m1.lim,c.s.st=i?2:3):2===c.c.mode&&(i=function(){if(0!=c.c.m2.cn){var n=[];for(d=0;d<24;d+=c.c.m2.per){var r=[];for(ind=d;ind<d+c.c.m2.per;ind++)r.push(ind);if(c.c.m2.sq){let e=999,s=0;for(A=0;A<=r.length-c.c.m2.cnt;A++){let t=0;for(h=A;h<A+c.c.m2.cnt;h++)t+=c.p[r[h]][1];t/c.c.m2.cnt<e&&(e=t/c.c.m2.cnt,s=A)}for(A=s;A<s+c.c.m2.cnt;A++)n.push(r[A])}else{for(A=1;A<r.length;A++){var t=r[A];for(h=A-1;0<=h&&c.p[t][1]<c.p[r[h]][1];h--)r[h+1]=r[h];r[h+1]=t}for(A=0;A<c.c.m2.cnt;A++)n.push(r[A])}}var s=a();let e=!1;for(let t=0;t<n.length;t++)if(o(c.p[n[t]][0],s)){e=!0;break}return d=null,A=null,h=null,e}}(),c.s.st=i?5:4,!i&&c.s.p.now<=c.c.m2.lim&&(i=!0,c.s.st=6),i)&&c.s.p.now>c.c.m2.m&&(i=!1,c.s.st=11)):c.s.timeOK?(c.s.st=7,t=1<<r.getHours(),(c.c.bk&t)==t&&(i=!0)):(i=1===c.c.err,c.s.st=8),c.s.timeOK&&(0<c.c.fh&&(e=1<<r.getHours(),(c.c.fh&e)==e)&&(i=!0,c.s.st=10),0<c.s.fCmdTs)&&(0<c.s.fCmdTs-a(r)?(i=!0,c.s.st=9):c.s.fCmdTs=0),c.c.inv&&(i=!i),s=function(t){t&&(c.s.chkTs=a()),l=!1},n="{id:"+c.c.out+",on:"+(i?"true":"false")+"}",Shelly.call("Switch.Set",n,function(t,e,s,n){if(0===e){for(c.s.cmd=i?1:0;c.h.length>=C_HIST;)c.h.splice(0,1);c.h.push([a(),i?1:0]),n&&n(!0)}else n&&n(!1)},s)}catch(t){g(t),l=!1}}let d=0,A=0,h=0;function y(){var e=a();for(let t=0;t<c.p.length;t++)if(o(c.p[t][0],e))return c.p[t][1];throw new Error("no price")}g("shelly-porssisahko v."+c.s.v),g("URL: http://"+(Shelly.getComponentStatus("wifi").sta_ip??"192.168.33.1")+"/script/"+Shelly.getCurrentScriptId()),HTTPServer.registerEndpoint("",function(s,n){try{if(l)return s=null,n.code=503,void n.send();var r=function(t){var e={},s=t.split("&");for(let t=0;t<s.length;t++){var n=s[t].split("=");e[n[0]]=n[1]}return e}(s.query);s=null;let t="application/json",e=(n.code=200,!0);var i="text/html",o="text/javascript";"s"===r.r?(m(),n.body=JSON.stringify(c),e=!1):"r"===r.r?(u(c.s.configOK=!1),c.s.p.ts=0,n.code=204,e=!1):"f"===r.r&&r.ts?(c.s.fCmdTs=Number(r.ts),c.s.chkTs=0,n.code=204,e=!1):r.r?"s.js"===r.r?(n.body=atob("H4sIAAAAAAAACo1W4W7bNhB+FYXrAhJmCKft/thjjLbJ1nVJO9RegSEIFkaiI8Y06Ygnt4art8mb5MV2lBRHCZx0f2yL/O7uu7vvTrYakr8/H0tCOH6N4/d1kCAPMp+Wc+1AXJe6WI211Sn4ggLjh29/l5TJg3XFx5M3k6N/x5PP8pT8eXuzcs4E0HB7c3vjCI9Hwfj8SpUBn94bBypR1uqkUFfKbY5W1jw60SbJlV2a+cKoBN1Ze3uTRMSVmgVvrdog/yesjqqMU8kikquBe3cxv6hiXpYBSgct24RGBmjprxRHuxm6NzrzISgWfd7eYDQwVt3BawjadFF/qdnM790hfg6JCmAeXgCUSR32QS3myN7MTUPvjJ98OuzU+HFBIwp/f4gZu7YccwXRrTOA5gEUaLn0Jkv6/N3bsTw943NddxCb7RfaTdSFVGHl0gT7vm6QO1LC7i4h8fv7dwqSgLrYi74wNONfjcv8V2F9qrBmTuQq5BKGS1UkSl4HSn4iPWBDtbtLlUhznc50Jnf6jBMiZQNI9yJEGOd08X5ycry7q74qA8nCL0qLlA9XTs1NeqhAUegRkcPcYqKtXcX1Utl3Hitg0ME4LcwCJuoySNpy8856lTWJ1XJtU6XbuItQXgQojLvcfo1n+tunacyL9fYZht8+H2+spUQAlkhMfXGk0hxLdwBCZdnREtHHcT6QLyVprtylJhw6zEBgPy81CJOxijGOTmOIPzLEoDsayxvqTEOs4eaabSHR4LBVRvaH5tfWTFjtLiEfml6PtUen5qxpwkR/g1GsKt12wwZTDZhO5y4UKROQa0enpUtjsWiG3WLr+CkAjejj+4Kt6wgF5lcx3nG2UAXm8tFnWhR67pf6XW5s1gkX8Vu00TYYuIo9hmK1Pjz6Uis27rMeGRUS9YI+F1almtYyRhlhgzZHd9IijNUK1rJRInaiUR/f2WdDLfxsRLHsqiNaqUVM9ikxIpYNHpuQo6LwRfQOqLck2g8S0tMCvkGFoouaYevUO1xhWugIxoOq4i2fNmMMGieqTTryNi3vplGKDc2UGmTN1ha3PEhXWjssNJSFS172X+NoG9FMNI4pSD1qzI24wlVC2eDusekkKqlF87WfDXb6PMVmDTaHyH7zEAXD68SgqtqIDxNSPRKT7hqwxu/+Fr/nL9aqGiQv1l18lVA8fsCxYudN2JhqdV/MrRRap+jkw/jTR9GMv5muYrHZ+UM2e/tdHk+YdENXHAcW9/BhXL4442gJommgjlPhx822YSj8bIxjD/QlJ33CKvFiTWvoCeopp3HdPAs/79Xo3zDsP1oVlLWRJyZueZwLVEmUyj6LiwiR731ZhGc5YG9I4/XEuBL0D9BUjTYGY41Fzp43GJBopEdEbKJYa8Kzlq82lp3Cbkvx/hab0iOosftyRCjXjJcL7JQ+9n7ReT3UL6WwMA5XQ4AVymRpgrkw1sBKkvq31WR4N2zwaElstg3u/iHEXdG8eKFeEINf+q/iq1RENeG0NXdRKiy+kx+8LHDUnl4D/N6ymuL/GWtXP2CemyzT+Dcn6LoGvgR6nz/f169xtQxxZ44Kff0BPWV6iQsAa32Pomz4H0CijZAoCgAA"),t=o):"s.css"===r.r?(n.body=atob("H4sIAAAAAAAACo1VS2/jNhD+K8QGBZJsJEvJOnUktGhPCxRF0Ut7KXqgyKHEmiIFkvJjA//3Dqmns1m0F1ucF795fMPN/T25J64Bpc5JZ6xz0tFmb0gQ37I78kuPIiKd8VQZkpDG+67YbP4ZJamQaBiEDqW19E1fpcy0s8HmG7F/lQy0g4J8/u0P8rMQYA35DBosVeT3vlKSTSbk8JRm5H6DTq+kMqfEyS9S1wV+Ww42QVFJLnji5wdC0YYZZWxBboCJTOSTLjhTtq+t6TVH7SN7gm1WEiU1JA3IuvEFydNP0JZEGO3DNQgvS19miaCtVOeC/AmWU01L0tJTcpTcNwX59GKD3XjKs+y7oLa11BiD0N6bknSU84h8253QpIu4b7z0ChDd6tIRxuCPCXpv2ugVHZjpztf2WboL9lTJWicOlCiIUHBKQPOSeDj5JKoKYkOaIUgq1AljcOk6Rc+DeZR7WjlUdMZJL01wAUW9PEB5Xb6cVuyFzS5FUYEwFh6mIxUebGyG9qCxtB8+lMt1aKNg5TxbK6A2dNY3kzZkqgzFCArEgN27NXRt9BwqUbQCtdZWyrD9my4/pt9vQ73mfmRY8ec81nAcKjtaYqOcUZJjws80221Lwnrrwnh1RmJmdr55TBTvvpqBpZCYqFG9R6xfEqk5nNAEu2O6BVDIENGskOVxqq4qL4Qo5xmfpth0lEl/js6xQgVrgO2Bf7wqy38HGvIvvgoTI3x8k+l8a75K6nFwNd26DbWVOIrhN/HQoswDxlF9qx16CxsZEj6is+t0nMFY4QQOeJubGj1VN32MpVmYO5xH/EiJcB6b5y3VrqMW48wdnhKfBnkUI+5JdWxk6NY0EZTLHlFsQ1epli0d2hqw5i4OGLVEaiF1dLuQn/ZwFpa24MiQUJgI/ItokCxIaYs70sPt03PGob5Dn8tAjZQx4nkhpHU+YY1UHIlV1RPrj2PSlVFY1QNYLxlVE8kxhW+TFXmftCY0UUVm4Zbg0gIbyW6OEXkLXNLb9Xrb4bq6C+AjvBbRvcOyq8m/rGzXmbxOe22c9rDVluLHCZ43+7D4sqtgdh0sPgmLb458rRSmPjT+f2Q8DOFbwx+5PJDXZYGXS2uWG12Y/rg+1kOlaBeetenr66IsmN/Bu34iBh6xUPTVCsc3cVo7Qq7XDUaPExtxQaDL0dIuGh7zXbay3I1PT9r6PJvTHCs46bAa+VivyO9gbrfroswYW7XIx65OqurhxiWs5e9P7gX50vX+L3/u4Ieqx27rv9++hHlg9eVfkoq6D6gIAAA="),t="text/css"):"status"===r.r?(n.body=atob("H4sIAAAAAAAACqVSS07DMBC9iuUVLJo2CyQWqSV2CCEVCS4wsVPi1LFDZtqS++QMXCAXw/k0VZrSDYvxYt6bN++NHBHEJmHSAOKa50xKLiIqfamheQwfV2KTZrBHZitqAa3WuJC5Eq+ggABsEATDUM/cYWIZJkZTMvKRTsLivanTXfNjWaotwUTVuuMljVFT26b2z8hSUInJQqSqKgo9EnKnkpHxoQ2MiLZbJ6JlF1tESh9O2bfmm/nyo/FCOsMnIMkWC1lePsyAnMKVb8biran1wdtsY1kglgFznbloGfuVfsrb6fdOLsyJxZ9cPOkdzJrP7YVm3c0g28nETlV9tuIcrN92LYG5kaDXTTWSKzX8w/YfBlvlS49npx3liq+egbLUBYky+XrBO+4l/I8C2mOQIb+PlgP8CzzDzy3QAgAA"),t=i):"status.js"===r.r?(n.body=atob("H4sIAAAAAAAACoVW/27qNhR+leDboXgJKbCrSW1i0HZ/qFN71asVaZMQGm5iSC7BzrUNHYL810fpm/BiO04IEAabSiG2z4/vfP5y7HXKtDUgbTeE/4y0/SWVFiNUrXhoY9Jba7laJxN7KZLIajcIUZpqhs1Uo3zUsRQvFmcv1icphbQRF1ZENUW4iCVLD5cR6Sk3ge/Q1aQdSC/zUsanOnYFsb8rG71TrXAeIewlnDN5N/jyQJgHM330dfu6fX142L6iW/T18bcn5NbslV6lYClSISuPqWSMg7Vk0d54LiJWi/7l8eOnv54Gvw8Tz6yNKkMuXmp2us8ALMx6WnxO/maR3cUOssLr2R8x5NgnULrmZt8QAniU7j8NfhmUmcxw5EmWpTRkNvpBIXci5Jzqj8DRIJkz2xBpBnaH/fQj8yYf5tFAYbfRwfj2JA527ATyLfvIsmfbt+0b1yzhjGMDCleoIro6qWZ8z9QsoXIpbq2rtamNLqdHteVlacGz7N3RdJnwyiytUXBkdk/TlB3s4mQa/9twfERVwieihmr8GH+jC2VpKmeJ0kzrBQQruTnHSxjPgBYI3bLGjt0OTFqt+iiGkFRbMS0iIOdyBGMPnBoPEGjCtPhGCz9Kued5BwKXdaD327cV5yXG1R7jpf1bZCVMs0GFm9q+gZNt7w2xN2UlQNw653xYxtcwff1z23y67/GeYdRBkCHbviVLowIMnCyZVIkAapi3dIcj7MP72gU5lkpvNjUG2LZ59+Fd9HXQfe9rx6x2vYxJvDZvLiXDkV+ZMaJ9FminMvGZ42DqZQsV26wIX6yo73hdmt/c3LgcYlcBFDyrgNDdS98qzEOufQWB1hWSQzoF6ZSztzLpACF0jSEdstFo2Bn5+rpaDqAkGyDuJyC1wvkhGodovB5NlOBNNJyzVLEzIDrgViEunApiFDFOhZkmrNXx2wHRzabBpgywoESpdyhbLQwDpzMiZs7fPasjdG1IcxlbDuRC+EHDdBOj2s0mhOe6gO7EQiqQyHon2qwmWoT83R4AMY2OX9/8QysGEexqnBdU65EbkZoo58M2qGkH+0hQ8Ns2rXez6RzNzg0bZtTx0mS+2RxLUAC+MF1ETNkaH5l2vRPDo5UiCChtEjc7QaAxIebHL7pgoYAGw67uEbXXKcyqg7BN9bw8l1IyDjTspTk7CLpaR0cskgvs9tFEcN16YdDf9O2zSCPftNr8as376JmGs6kUCx7dvmOR+SsXUW/spsQ2H8fkjKwwpUoRNEk06tV6XGTafB5c66g3xo6xhXVT/pmuWzdiffRnka2cdxD8yh7yz6nBIWk+2EkJjv2zlRrNSS8GEcSeElLbNnOB7p6G7W8xowHXHOHxTjfNZgaKhDGsmMVKhXFyciaCEI32zAZwS0wscCn1FhMUGMRuTOz4/3iqKZIXaM4Qx4G4PtqdK5npjHBIAUnVjEjUJb5OcTskzrNDfXmeh1SHpvOtQ8GVgOsHKy4/0AqhJZAexGEndV+44qBBklKLJRYcQZFQiv7H5aa8zuij28xukO2fyoN1NzBF5LkPR4f74denqlnn/wAqqsxI9AkAAA=="),t=o):"config"===r.r?(n.body=atob("H4sIAAAAAAAACp1U7W6bMBR9FQtpavuDJqFRW03EEj9ahaSBaqGd9tMxbnEwNsUmXfd7j5Jn6AvwYjPhI4GtrToJhLi+x+f6nnNth3QDMENSTgyFwcqAP26u3OVVYA/0CrQVWjHSJCQAY0PHMv2GdfB5dDmEfrRGuVQoRXoB2pIwghWg4SQRIYH2oAo0yF26UmiDACu2kSpedyjK03wHEvoj6S8ysVrEvNgWW64I5YQDsWM7wKiXlExwRHC8Ej/LHSjftNClpoiLVw6cm/suzwa1POBLm05ppkSCYpmr8n94YVrWV7BHheilReFB/D2y9y1M1GgILcscXhwiOH2MVA9Td7fivEdZkuv+5ZzTkrQEreJ2eVpslX4oQx+fnGQZ9L2Bf33doG9RHAtzh4wlabZ/iLQsO3Gh3bVAeYbSB/Pi99L1pzPnbvkfXnivxmRo4iSEoK7z/TKmrhc435yZ86kippQrlKE16iqejExGk74U7/LPnPnS98BUu8ddLJwABHee535uPJw14mvtKNGfDstMic4WqaKCgw1iua5rDK1xNzSy4Mjqhi7hZTdwDs+7gTHs7XIGz3pM0GpHE0SNX4KcK5qU85YV2177LBPzvZNbyC3RqXFcbGllsLeVt0z51PraoRyBtGRi+h4AZk+viqaGadkavWr0QjeUJjQqlX4LlXyssXFwPok2pCp6lSvV9ilAjBHOEaxF/7dRAt9duJ7nB39lKdxw7G+JDk05jyLDpOY7mFgJ7VX2AVpwzCiOJ0fPlIfi+VSkhB8bA+PkqNpuGRHGXpriJc5oqmBGnmby2NBtMbHgD/TxdC2NE22HavkPMP/LnhcGAAA="),t=i):"config.js"===r.r?(n.body=atob("H4sIAAAAAAAACoVV3XLaOBR+FdB2qFSMYtydXmAUZnfTmc42aWZK2undIswxaPBfbJmWYf02eZO8WI8sTOyEaW8M53xH0vn5PukQge4Voj/2dzLvgZDFPgkoE5cHne8PKqS7VK16bl+IQksNg0G/GAzqv+xgVmjr54F/X1DyR5yugDCukgTyD3c31+Lm9ur9f/O7zzyWGaXgSNx6MU0zrdKkt5NRCYK8OsiKXL46QDW9sMjlgjnt/Wyg5sa0QFrqlh8t61bJDt3BBoItrBBAe0aOJpkQYqN2sr0YLeteyX3LjZZ1J2q9acfXtm/6JgUhfpjm1BggXB+m3p8+DIdMDsViqpKs1D29z7DGOodl+oP01EqQb6ZYUzIlZAiMZ3I11zLX1HOIS1jVW9h2LredZkqeQxbJAP6KIkq+EYcsybFR4eY3kSFh51O1B9VpNH2jmi+3g/F0CkwI83M843lQuGkH2ZQhzzsTQPvMBGJ3FMSrTmDscnSdix2PIhW3WTDm6DiC3iiDvA16HB0nMEh0F0THCSzuuxl4vLg/l4A3irubPB3+LDOvzgz15FZVIHWwoaiTIE2KNALTChwAsKrygTLnn7/nPCsLE2K3K+TOkF2uVu93kOhrVWjAgVISRCrYEqfWJg7v8gA8y8HEXEEoy0hT5hu5GkHKRpCOFhj6qYyXYA71Za0eoekLYTFHGgU1UEtaBkEJiZfamo0nLoKonWZZS1RmGcqnQVq6MkitnwbriMugyy2S84moEkn2a7YOBrReZT7/13Q8w9Y6CHcyHxuE/cB5iJecPVZm6SjOsrUJqXl46miHpqYUS8UT3mHqEUc2ihupNzxWCW1WOE8rWvRlxyXFvTjH3yYnr5OTdyanNvqE1fd/IOR3qXRvDfpKakm/fL4evr7Is+Di49c5n4OebWEvSJbmRaFGyOtQrcnAsv/18N/57Sde6FwlaxXuqWTM91xXiIAHyLZZa9P5kMxyYZqhN5BQQ2kZAd5/5E5GEeA1pnXZx7vNvEwV1mildApbfFX5BiY9c42yBavY5Lk/4PqHrrGTDI8nHEOQHTyGopBrI8iGM2ke/F6C9fNon8ssT+PMpF0mWsWPD48P+ePDBK/apIwifDTxwcS03Sl+Tkpks3riYZQiy6+MVpP0O2UXY3g7fOe+gTfvXIazhJezsG0LB7oQhtyOrajuMdgek9uPfby4WjViGxg2qPoJIyr4DOkHAAA="),t=o):n.code=404:(n.body=atob("H4sIAAAAAAAACo1SzY7TMBB+FeMDakWTihvajb1CsAf2xAFxRa49bWbr2sYzaVUh3oZn2Bfoi+E02Z8srODieOYbf983k2leuWj5mKDlnddNfwpvwkZB0M0O2AjbmkzAquN19U43jOxBfz7dZSKk0692e7prlkN2eBDMDtQe4ZBiZmFjYAis5AEdt8rBHi1U52CBARmNr8gaD+qt1I3DvbDeECmOaQjRqb9rFvChghKG8SGl4nwC2piO+nV/XoqbrlCITxTZ+ChmjRFthrVqmRNdLJe3OCD1GgWbvCl9f1uVeWz1E6RZGj0fJR6FRttmRc9i3WBIHYt+yiobh3EYkTm3ZlYVseGOyqDBbqHYHb73BKRF480KvFjHPKm/F6jOsP6C3jTL4T51UI0/4TyM6pFCv9zEP00XyjVuXjY5xR9Mvi+r1G3L8b9OB56p0+EkmzGxLgXE4uP1V3XA4OKh9tEaxhjqmHGDocZgfeeAZrJHfBuJ5fzSAwunyvJ3u6K3sBkMw7WHPlKgtKsnqRnMFyYlCO5Di94NFavojvWTbF+U4fsN9fCPvcmC1JRFDqaLPtWUrSq2r+BCXmUl30CdIXljYSb7xuVCyonmjOY/F5b+oPQYtoWwIIXAK0l89EAtAMu+vD4veC8kqS6xPMsN1wl9SYz2i836lmTZ8XHGvwHYLtlMJgQAAA=="),t=i),n.headers=[["Content-Type",t]],e&&n.headers.push(["Content-Encoding","gzip"])}catch(t){g(t),n.code=500}n.send()}),Timer.set(1e4,!0,b),b();