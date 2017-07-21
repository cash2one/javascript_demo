

function closeBack(singleopenWindowFlag){
    if(dd.compareVersion("2.5.0",dd.version) && openWindow && singleopenWindowFlag){
        dd.biz.navigation.close({
            onSuccess : function(result) {},
            onFail : function(err) {}
        });
    }else{
        window.history.back();
    }
}

//用户退出当前登录状态,重新登录
function loginOut(_from) {
    var userInfo = JSON.parse(getCookie('omsUser'));
    var loginFrom = _from || getCookie('_from');
    if(userInfo && userInfo.username){
        delCookie('omsUser');
        delCookie('_from');
        delCookie('_logined');
        localStorage.setItem('firstLogin_flg',0);
        //增加GrowningIO退出监控
        dd.biz.monitor.offline({
            params: {
                account: userInfo.username
            }
        });
    }
    dd.util.localStorage.clear({
        onSuccess: function () {
            if (dd.isDingTalk) {
                dd.biz.navigation.close();
            } else {
                var loginUrl = oms_config.loginUrl, querystr = '&r='+Math.random(); //转到公共登录页面
                if ('omsmobile' == loginFrom) {
                    loginUrl = oms_config.baseUrl + 'omslogin.html'; //特殊处理oms跳转
                }
                window.location.href = (loginUrl+querystr).replace(/[\?&]/, '?');
            }
        }
    });
}

function getUrlParam(param) {
    var url = window.location.href;
    var urlarr = url.split('#');
    url = urlarr['0'];
    var searchIndex = url.indexOf('?');
    var searchParams = url.slice(searchIndex + 1).split('&');
    for (var i = 0; i < searchParams.length; i++) {
        var items = searchParams[i].split('=');
        if (items[0].trim() == param) {
            return decodeURIComponent(items[1]).trim();
        }
    }
}

function getCookie(name){
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

function setCookie(name,value,sessioned){
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    if(sessioned){
        document.cookie = name + "=" + escape(value);
    }else{
        document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
    }
}

function delCookie(name){
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
    document.cookie= name + "=" + escape(cval) + ";expires="+exp.toGMTString();
}

function openLink(href,singleopenWindowFlag){
    var dd_nav_bgcolor = window.location.href.indexOf('dd_nav_bgcolor') > -1 ? getUrlParam('dd_nav_bgcolor') : '';
    // href += (href.indexOf('?') > -1) ? "&dd_nav_bgcolor="+dd_nav_bgcolor : "?dd_nav_bgcolor="+dd_nav_bgcolor;
    console.log(href);
    if(openWindow || singleopenWindowFlag){
        dd.biz.util.openLink({
            url: href,
            onSuccess : function() {},
            onFail : function(err) {}
        });
    }else{
        window.location.href = href;
    }
}

function replaceLink(href){
    var dd_nav_bgcolor = window.location.href.indexOf('dd_nav_bgcolor') > -1 ? getUrlParam('dd_nav_bgcolor') : '';
    // href += (href.indexOf('?') > -1) ? "&dd_nav_bgcolor="+dd_nav_bgcolor : "?dd_nav_bgcolor="+dd_nav_bgcolor;
     window.location.replace(href);
}

function renderFoot(t){
    var foot = '<footer id="cusFoot" class="ui-footer ui-footer-btn"><ul class="ui-tiled ui-border-t ui-hecom-ft">';
    for(var i in footers){
        foot += '<li data-href="'+footers[i].href+'">'
             + (i == t ? '<div class="ui-hecom-ftspan focused">' : '<div class="ui-hecom-ftspan">')
             + '<i class="ui-icon-'+footers[i].icon+'"><font><br>'+footers[i].name+'</font></i>'
             + '</div></li>';
    }
    $("body").append(foot);
    addFootEventListener()
}

function addFootEventListener(){
    $(".ui-hecom-ft li").on('click',function(){
//        $(this).children("div").addClass('focused');
        var href = $(this).data('href');
        openLink(href);
    });
}

/**
 * 根据规则格式化时间戳
 * 刚刚/n分钟前/15:20/昨天/星期几/15/11/15
 */
function formatTimeRule(timestamp)  {
    var nowTime    = new Date();
    var thatTime   = new Date(parseInt(timestamp/1000)*1000);
    var _timestamp = nowTime.getTime();
    var tdstamp    = getToday(0);
    var ytdstamp   = tdstamp - 86400000;
    var weekday    = nowTime.getDay();
    var wekstamp   = tdstamp - weekday * 86400000;
    var diffSec = _timestamp - timestamp;

    if(diffSec <= 60000){
        return '刚刚';
    }else if(diffSec <= 3600000){
        var n = parseInt(diffSec/60000);
        return n + '分钟前';
    }else if(timestamp > tdstamp){
        var hour     = thatTime.getHours();
        var minute   = thatTime.getMinutes();
        return (hour<10?('0'+hour):hour)+":"+(minute<10?('0'+minute):minute);
    }else if(timestamp > ytdstamp){
        return '昨天';
    }else if(timestamp > wekstamp){
        var wd = thatTime.getDay();
        var weekarr = ["日","一", "二", "三", "四", "五", "六"];
        return '星期'+weekarr[wd];
    }else{
        var year     = thatTime.getFullYear();
        var month    = thatTime.getMonth()+1;
        var date     = thatTime.getDate();
        return year+"/"+month+"/"+date;
    }
}

function getToday(flag)  {
    var now      = new Date();
    var year     = now.getFullYear();
    var month    = now.getMonth()+1;
    var date     = now.getDate();
    var str = year+"-"+(month<10?('0'+month):month)+"-"+(date<10?('0'+date):date);
    if(flag){
        return str;
    }else{
        var date = new Date(str);
        return date.getTime();
    }
}

function formatStamp(timestamp,flg)  {
    var now      = new Date(parseInt(timestamp/1000)*1000);
    var year     = now.getFullYear();
    var month    = now.getMonth()+1;
    var date     = now.getDate();
	if(flg){
		return year+"年"+(month<10?('0'+month):month)+"月"+(date<10?('0'+date):date)+'日';
	}else{
   		return year+"-"+(month<10?('0'+month):month)+"-"+(date<10?('0'+date):date);
	}
}

function formatStampTime(timestamp)  {
    var now      = new Date(parseInt(timestamp/1000)*1000);
    var hour     = now.getHours();
	var mite     = now.getMinutes();
    var month    = now.getMonth()+1;
    var date     = now.getDate();
	return (month<10?('0'+month):month)+"月"+(date<10?('0'+date):date)+'日 '+(hour<10?('0'+hour):hour)+':'+(mite<10?('0'+mite):mite);
}

function formatTimeW(timestamp){
	var thatTime = new Date(parseInt(timestamp/1000)*1000);
	var wd       = thatTime.getDay();
	var weekarr  = ["日","一", "二", "三", "四", "五", "六"];
	return '星期'+weekarr[wd];
}

function stopEventBubble(event){
    var e = event || window.event;
    if (e && e.stopPropagation){
        e.stopPropagation();
    }else{
        e.cancelBubble = true;
    }
}

function replaceImageUrl(url){
    var httpsosgps = 'http://images.sosgps.com.cn/';
    var httphecom = 'http://images.hecom.cn/';
    var httpshecom = 'https://images.hecom.cn/';
    var newUrl = url;
    if (url.indexOf(httpsosgps)!==-1){
        newUrl = url.replace(httpsosgps, httpshecom);
    }else if (url.indexOf(httphecom)!==-1){
        newUrl = url.replace(httphecom, httpshecom);
    }
    return newUrl;
}

function setNavTitle(title){
    dd.ready(function(){
        dd.biz.navigation.setTitle({
            title : title,
            onSuccess : function(result) {},
            onFail : function(err) {}
        });
    });
}

function titleHelp(helpUrl,page){
    var localStorageName = 'HecomBasicHelpId' + page;
    var url = helpUrl + "?" + page;
    dd.ready(function () {
        dd.device.base.getUUID({
            onSuccess: function (data) {
                var uuid = data.uuid;
                dd.util.localStorage.getItem({
                    name: localStorageName,
                    onSuccess: function (data) {
                        if (data.value === uuid) {
                            var iconIndex = 1;
                            setHelpIcon(iconIndex, url);
                        } else {
                            var iconIndex = 2;
                            dd.util.localStorage.setItem({
                                name: localStorageName,
                                value: uuid,
                                onSuccess: function (res) {
                                    setHelpIcon(iconIndex, url);
                                },
                                onFail: function (err) {
                                }
                            });
                        }
                    },
                    onFail: function (err) {
                    }
                });

            },
            onFail: function (err) {
            }
        });
    });
}

function setHelpIcon(iconIndex,url){
    dd.ready(function(){
        dd.biz.navigation.setIcon({
            iconIndex : iconIndex,
            showIcon : true,
            onSuccess : function(result) {
                openUrl(url);
            },
            onFail : function(err) {}
        });
    });
}

function hideHelpIcon(){
	dd.ready(function(){
		dd.biz.navigation.setIcon({
			iconIndex : 1,
			showIcon : false,
			onSuccess : function(result) {},
			onFail : function(err) {}
		});
	});
}

function openUrl(url){
    dd.ready(function(){
        dd.biz.util.openLink({
            url : url,
            enableShare : true ,
            onSuccess : function(result) {

            },
            onFail : function(err) {

            }
        });
    });
}

function formatHref(href){
    var pt = window.location.protocol;
    var ho = window.location.host;
    var domain = pt+ho;
//    var po = window.location.port;
//    var domain = pt+ho+":"+po;
//    if (po === ''){
//        domain = pt+ho;
//    }
    var fHref = href;
    if (href.indexOf('http') === -1){
        fHref = domain + href;
    }
    return fHref;
}

function backResume(callback){
    dd.ready(function(){
        document.addEventListener('resume', function(e) {
            callback();
            e.preventDefault();
        }, false);
    });
}

function firstShowModal(imgUrl,title,content,moreUrl){
    dd.ready(function(){
        if (dd.device.notification.modal){
            dd.device.notification.modal({
                image:imgUrl,
                banner:[imgUrl],
                title:title,
                content:content,
                buttonLabels:["开始使用","了解更多"],
                onSuccess : function(result) {
                    if (result.buttonIndex === 0 ){

                    }else if (result.buttonIndex === 1 ){
                        openLink(moreUrl,true);
                    }
                },
                onFail : function(err) {}
            });
        }
    });
}

function checkFirstShowModal(key,imgUrl,title,content,moreUrl){
    var localStorageName = 'HecomBasicFirstModal' + key;
    dd.ready(function () {
        dd.device.base.getUUID({
            onSuccess: function (data) {
                var uuid = data.uuid;
                dd.util.localStorage.getItem({
                    name: localStorageName,
                    onSuccess: function (data) {
                        if (data.value !== uuid) {
                            dd.util.localStorage.setItem({
                                name: localStorageName,
                                value: uuid,
                                onSuccess: function (res) {
                                    firstShowModal(imgUrl,title,content,moreUrl)
                                },
                                onFail: function (err) {
                                }
                            });
                        }
                    },
                    onFail: function (err) {
                    }
                });

            },
            onFail: function (err) {
            }
        });
    });
}

var formatDate = function(){
    var fn = function(){};
    fn.prototype.get = function(date, type) {
        //获取日期，本周，本月，本季，当年（type）
        if (!date) date = new Date();
        var now = date;
        if (typeof date !== 'object') {
            now = new Date(date); //时间戳转时间
        }
        var nowDayOfWeek = now.getDay(); //今天本周的第几天
        var nowDay = now.getDate(); //当前日
        var nowMonth = now.getMonth(); //当前月
        var nowYear = now.getYear(); //当前年
        nowYear += (nowYear < 2000) ? 1900 : 0;

        var lastMonthDate = new Date(); //上月日期
        lastMonthDate.setDate(1);
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
        var lastYear = lastMonthDate.getYear();
        var lastMonth = lastMonthDate.getMonth();

        var reDate = {};

        switch (type) {
            case "week":
                var weekStart = this.getWeekStartDate(nowYear, nowMonth, nowDay, nowDayOfWeek);
                var weekEnd = this.getWeekEndDate(nowYear, nowMonth, nowDay, nowDayOfWeek);
                reDate = {
                    startDate: weekStart,
                    endDate: weekEnd
                };
                break;
            case "month":
                var monthStart = this.getMonthStartDate(nowYear, nowMonth);
                var monthEnd = this.getMonthEndDate(nowYear, nowMonth);
                reDate = {
                    startDate: monthStart,
                    endDate: monthEnd
                };
                break;
            case "quarter":
                var quarterStart = this.getQurterStartDate(nowYear, nowMonth);
                var quarterEnd = this.getQurterStartDate(nowYear, nowMonth);
                reDate = {
                    startDate: quarterStart,
                    endDate: quarterEnd
                };
                break;
            default:
                break;
        }
        return reDate;
    };
    fn.prototype.formatDate = formatStamp;
    fn.prototype.getMonthDays = function(nowYear, myMonth) {
        //获取每月天数
        var monthStartDate = new Date(nowYear, myMonth, 1);
        var monthEndDate = new Date(nowYear, myMonth + 1, 1);
        var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
        return days;
    };
    fn.prototype.getQuarterStartMonth = function(nowMonth) {
        //获取本季度开端月份
        var quarterStartMonth = 0;
        if (nowMonth < 3) {
            quarterStartMonth = 0;
        }
        if (2 < nowMonth && nowMonth < 6) {
            quarterStartMonth = 3;
        }
        if (5 < nowMonth && nowMonth < 9) {
            quarterStartMonth = 6;
        }
        if (nowMonth > 8) {
            quarterStartMonth = 9;
        }
        return quarterStartMonth;
    };
    fn.prototype.getWeekStartDate = function(nowYear, nowMonth, nowDay, nowDayOfWeek) {
        //获得本周的开端日期
        if (nowDayOfWeek == 0)
            nowDayOfWeek = 6;
        else
            nowDayOfWeek = nowDayOfWeek - 1;
        var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
        return this.formatDate(weekStartDate);
    };
    fn.prototype.getWeekEndDate = function(nowYear, nowMonth, nowDay, nowDayOfWeek) {
        //获得本周的停止日期
        if (nowDayOfWeek == 0) nowDayOfWeek = 7;
        var weekEndDate = new Date(nowYear, nowMonth, nowDay + (7 - nowDayOfWeek));
        return this.formatDate(weekEndDate);
    };
    fn.prototype.getMonthStartDate = function(nowYear, nowMonth) {
        //获得本月的开端日期
        var monthStartDate = new Date(nowYear, nowMonth, 1);
        return this.formatDate(monthStartDate);
    };
    fn.prototype.getMonthEndDate = function(nowYear, nowMonth) {
        //获得本月的停止日期
        var monthEndDate = new Date(nowYear, nowMonth, this.getMonthDays(nowYear, nowMonth));
        return this.formatDate(monthEndDate);
    };
    fn.prototype.getLastMonthStartDate = function(nowYear, lastMonth) {
        //获得上月开端时候
        var lastMonthStartDate = new Date(nowYear, lastMonth, 1);
        return this.formatDate(lastMonthStartDate);
    };
    fn.prototype.getLastMonthEndDate = function(nowYear, lastMonth) {
        //获得上月停止时候
        var lastMonthEndDate = new Date(nowYear, lastMonth, this.getMonthDays(nowYear, lastMonth));
        return this.formatDate(lastMonthEndDate);
    };
    fn.prototype.getQurterStartDate = function(nowYear, nowMonth) {
        //获得本季度的开端日期
        var quarterStartDate = new Date(nowYear, this.getQuarterStartMonth(nowMonth), 1);
        return this.formatDate(quarterStartDate);
    };
    fn.prototype.getQuarterEndDate = function(nowYear, nowMonth) {
        //或的本季度的停止日期
        var quarterEndMonth = this.getQuarterStartMonth(nowMonth) + 2;
        var quarterStartDate = new Date(nowYear, quarterEndMonth, this.getMonthDays(nowYear, quarterEndMonth));
        return this.formatDate(quarterStartDate);
    }
    return new fn();
}();


//FIXME: 其他代码中还有引用此处全局变量，会有 Undefined 报错，暂时不删除
var deviceId = '';
var corpId = '';
var entCode = '';
var agentId = '';
var isAdmin = 0;
var isOwner = 0;
var baseData = null;
var server = window.location.href;
try{
    baseData = JSON.parse(getCookie('HecomDDSenior'));
}catch (e){
    console.log(e.message);
}
if (null!==baseData){
    if (baseData.deviceId!==undefined ){
        deviceId = baseData.deviceId;
    }
    if (baseData.corpId!==undefined ){
        corpId = baseData.corpId;
    }
    if (baseData.v40DingEmplInfo.entCode!==undefined ){
        entCode = baseData.v40DingEmplInfo.entCode;
    }
    if (baseData.agentIds.agent_id_hqyx!==undefined ){
        agentId = baseData.agentIds.agent_id_hqyx;
    }
    if (baseData.isAdmin!==undefined ){
        isAdmin = baseData.isAdmin;
    }
    if (baseData.isOwner!==undefined ){
        isOwner = baseData.isOwner;
    }
}


dd.ready(function(){
    dd.biz.navigation.setRight({
        show: false,
        control: false,
        showIcon: false,
        text: '',
        onSuccess : function(result) {},
        onFail : function(err) {}
    });
});

var openWindow = false;//是否压栈

//CORS
$.ajaxSetup && $.ajaxSetup({
    xhrFields: {
        withCredentials: true
    }
});
//$(document).on('ajaxBeforeSend', function(e, xhr, options){
//    xhr.withCredentials = true;
//    options.xhrFields = $.extend({}, options.xhrFields, {
//        withCredentials: true
//    });
//    // This gets fired for every Ajax request performed on the page.
//    // The xhr object and $.ajax() options are available for editing.
//    // Return false to cancel this request.
//});

// 用户数据埋点
var _vds = _vds || [];
window._vds = _vds;
(function(){
    _vds.push(['setAccountId', '8e9d847313d96594']);
    (function() {
        var vds = document.createElement('script');
        vds.type='text/javascript';
        vds.async = true;
        vds.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'dn-growing.qbox.me/vds.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(vds, s);
    })();
})();
