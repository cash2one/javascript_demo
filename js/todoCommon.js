var base_url = baseUrl;  
var BASEURL = baseUrl;
var APIURL  = apiUrl;
function showEleByWebkitBox(id){
    $("#"+id).css('display','-webkit-box');
}
function GetQueryString(name){
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}
function GetQueryString2(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  decodeURIComponent(r[2]); return null;
}
function mkTodayTimestamp(){
    var d = new Date();
    var y=d.getFullYear();
    var m=d.getMonth()+1;
    var t=d.getDate();
    return mktime(0,0,0,m,t,y);
}
function mktime() {
  var d = new Date(),
    r = arguments,
    i = 0,
    e = ['Hours', 'Minutes', 'Seconds', 'Month', 'Date', 'FullYear'];

  for (i = 0; i < e.length; i++) {
    if (typeof r[i] === 'undefined') {
      r[i] = d['get' + e[i]]();
      // +1 to fix JS months.
      r[i] += (i === 3);
    } else {
      r[i] = parseInt(r[i], 10);
      if (isNaN(r[i])) {
        return false;
      }
    }
  }
  // Map years 0-69 to 2000-2069 and years 70-100 to 1970-2000.
  r[5] += (r[5] >= 0 ? (r[5] <= 69 ? 2e3 : (r[5] <= 100 ? 1900 : 0)) : 0);

  // Set year, month (-1 to fix JS months), and date.
  // !This must come before the call to setHours!
  d.setFullYear(r[5], r[3] - 1, r[4]);

  // Set hours, minutes, and seconds.
  d.setHours(r[0], r[1], r[2]);

  // Divide milliseconds by 1000 to return seconds and drop decimal.
  // Add 1 second if negative or it'll be off from PHP by 1 second.
  return (d.getTime() / 1e3 >> 0) - (d.getTime() < 0);
}
function getCookie(name){
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}
function setCookie(name,value){
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}
function delCookie(name){
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
    document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}

function alertMessage(title,message,button){
    dd.ready(function(){
        dd.device.notification.alert({
            message: message,
            title: title,
            buttonName: button,
            onSuccess : function(result) {
            },
            onFail : function(err) {}
        });
    });
}

function setPageDate(){
    var tm = GetQueryString('pagedate');
    if(!tm){
        tm=mkTodayTimestamp()*1000;
    }
    return tm;
}
function toastTip(msg){
    dd.ready(function(){
        dd.device.notification.toast({
            text: msg, //提示信息
            duration:"1s",
            onSuccess : function(result) {
                /*{}*/
            },
            onFail : function(err) {}
        });
    });
}