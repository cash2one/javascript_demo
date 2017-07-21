/**
理单 全局变量申明

LEVEL_MANAGER   经理评级
LEVEL_EMPLOYEE  员工评级
FOLLOW_TYPE     跟进类型
CONTACT_STATUS  联系情况
NEXT_VISIT      下次拜访时间
*/

// var oms_config = {
//         'baseUrl': 'http://ptest.hecom.cn/omsmobile/app/',
//         'apiUrl': 'http://ptest.hecom.cn/oms4/',
//         'corpId': 'ding2f10fa61cf6ffbea',
//     },
var basic_v = "0.1.1";
$.extend(oms_apiList, {
    "login": "apiCustomer/ddlogin",
    "getlist": "billing/getList",
    "getcusinfo": "billing/getCusInfo",
    "getbillinginfo": "billing/getBillingInfo",
    "dobillingstart": "billing/doBillingStart",
    "dobillingpredict": "billing/doBillingPredict",
    "dobillingpayrequest": "billing/doBillingPayRequest",
    "getpredicthistory": "billing/getPredictHistory",
    "getrequesthistory": "billing/getRequestHistory",
    "getSubordinate": "apiCustomer/getSubordinate",
    "ismanagerorstaff": "billing/isManagerOrStaff",
    "getstafflist": "billing/getStaffList",
    "getsummary":"billing/getSummary",
    "getlist2":"billing/getList2"
});
var CONSTANT_BILL = {
        "GRADE_MANAGER": {
            "A": {
                "label": "A级",
                "desc": "有钱有意向"
            },
            "B": {
                "label": "B级",
                "desc": "有钱没意向"
            },
            "C": {
                "label": "C级",
                "desc": "没钱有意向"
            },
            "D": {
                "label": "D级",
                "desc": "没钱没意向"
            }
        },
        "GRADE_EMPLOYEE": {
            "0": "初始",
            "1": "a",
            "2": "b",
            "3": "c",
            "4": "d",
            "5": "e"
        },
        "FOLLOW_TYPE": {
            "0": "待理单",
            "1": "已签已回",
            "6": "已签未回",
            "2": "重点跟进",
            "3": "能签能回",
            "4": "冲击客户",
            "7": "推进中",
            "5": "已死客户"

        },
        "FOLLOW_TYPE2": {
            "6": "已签未回",
            "2": "重点跟进",
            "3": "能签能回",
            "4": "冲击客户",
            "7": "推进中",
            "5": "已死客户"
        },
        "CONTACT_STATUS": {
            "0": "新录入",
            "1": "未绕到负责人",
            "2": "绕到负责人",
            "3": "约到负责人",
            "4": "拜访客户",
            "5": "理单客户",
            "6": "预测客户",
            "7": "申请合同",
            "8": "签单客户",
            "9": "完成客户"
        },
        "NEXT_VISIT": {
            "0": "不限",
            "1": "本周",
            "2": "本月",
            "3": "自定义时间区间"
        }
    },
    DDCtrl = {
        navWithColor: function(url, color) {
            return url;
        },
        closeWindow: function() {
            dd.biz.navigation.close({
                onSuccess: function(result) {

                },
                onFail: function(err) {}
            })
        },
        showLoading: function() {
            dd.device.notification.showPreloader({
                text: "努力加载中..",
                showIcon: true,
                onSuccess: function(result) {

                },
                onFail: function(err) {}
            })
        },
        hideLoading: function() {
            dd.device.notification.hidePreloader({
                onSuccess: function(result) {

                },
                onFail: function(err) {}
            })
        },
        showAlert: function(msg, callback) {
            dd.device.notification.alert({
                message: msg,
                title: "", //可传空
                buttonName: "确认",
                onSuccess: function() {
                    if(callback){
                        callback();
                    }
                },
                onFail: function(err) {}
            });
        },
        showToast: function(msg) {
            dd.device.notification.toast({
                icon: '',
                text: msg,
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
        },
        setTitle: function(s) {
            dd.biz.navigation.setTitle({
                title: s,
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
        },
        setIOSLeftBtn: function(s, callback, show) {
            dd.biz.navigation.setLeft({
                control: true,
                show: show === undefined ? true : show,
                text: s || "NULL",
                onSuccess: function(result) {
                    callback();
                },
                onFail: function(err) {}
            });
        },
        setRightBtn: function(s, callback, show) {
            dd.biz.navigation.setRight({
                control: true,
                show: show === undefined ? true : show,
                text: s || "NULL",
                onSuccess: function(result) {
                    callback();
                },
                onFail: function(err) {}
            });
        },
        setDatePicker: function(def, callback) {
            dd.biz.util.datepicker({
                format: 'yyyy-MM-dd',
                value: def,
                onSuccess: function(result) {
                    callback(result.value)
                },
                onFail: function() {}
            });
        },
        setPhotoPicker: function(callback) {
            dd.biz.util.uploadImageFromCamera({
                compression: true,
                onSuccess: function(result) {
                    callback(result[0]);
                },
                onFail: function() {}
            });
        }
    },
    OMS_BILL = {
        isNew: 0,
        roleMap: {
            '1': 1, //新签leader
            '2': 2, //续签业务员
            '3': 3, //新签业务员
            '4': 4, //续签leader
            '5': 5, //续签leader
        },
        role: null,
        getCookie: function(name) {
            var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if (arr = document.cookie.match(reg))
                return unescape(arr[2]);
            else
                return null;
        },
        setCookie: function(name, value) {
            var Days = 30;
            var exp = new Date();
            exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
            document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
        },
        checkRole: function(userrole) {
            var keyList = Object.keys(this.roleMap),
                flag = -1;
            for (var i = 0, len = keyList.length; i < len; i++) {
                if (keyList[i].indexOf(userrole) > -1) {
                    this.role = this.roleMap[keyList[i]];
                }
            }
            if (this.role == 1 || this.role == 3) {
                flag = 0;
            } else if (this.role == 2 || this.role == 4) {
                flag = 1;
            } else if (this.role == 5) {
                flag = 2;
            } else {
                flag = -1;
            }
            return flag;
        },
        checkLogin: function(callback) {
            var loginApi = oms_config.apiUrl + oms_apiList.login;
            new Login(oms_config.corpId, oms_config.baseUrl, loginApi, function() {
                var omsUser = getCookie('omsUser');
                if (omsUser) {
                    callback(JSON.parse(omsUser));
                } else {
                    dd.device.notification.alert({
                        message: "请重新登录",
                        title: "温馨提示",
                        buttonName: "去登录",
                        onSuccess: function() {
                            dd.biz.navigation.close({
                                onSuccess: function(result) {},
                                onFail: function(err) {}
                            });
                        },
                        onFail: function(err) {}
                    });
                }
            });
        },
        ajaxPost: function(config) {
            var apiUrl = oms_config.apiUrl + oms_apiList[config.api];
            var sendData = config.data || {};

            $.ajax({
                url: apiUrl,
                type: config.type || 'POST',
                data: sendData,
                cache: false,
                success: function(res) {
                    var result = JSON.parse(res);
                    config.success(result);
                },
                error: function() {
                    dd.device.notification.toast({
                        icon: '',
                        text: "发生错误，请稍后重试",
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                }
            });
        },
        getQueryStringByName: function(name) {

            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));

            if (result == null || result.length < 1) {

                return "";

            }

            return result[1];

        },
        openLink: function(href, singleopenWindowFlag) {
            var dd_nav_bgcolor = window.location.href.indexOf('dd_nav_bgcolor') > -1 ? this.getQueryStringByName('dd_nav_bgcolor') : 'FF7BD4E4';
            //href += (href.indexOf('?') > -1) ? "&dd_nav_bgcolor=" + dd_nav_bgcolor : "?dd_nav_bgcolor=" + dd_nav_bgcolor;

            if (false || singleopenWindowFlag) {
                dd.biz.util.openLink({
                    url: href,
                    onSuccess: function() {},
                    onFail: function(err) {}
                });
            } else {
                window.location.href = href;
            }
        },
        setURLQuery: function(obj) {
            var n = window.location.hash,
                r = [];
            for (var m in obj) {
                if (!!obj[m] && obj[m] !== "") {
                    r.push(m + "=" + obj[m]);
                }
            }
            window.location.hash = r.join("&");
        },
        getURLQuery: function(url, name) {
            var _url = url;
            var r = new RegExp("(\\?|#|&)" + name + "=([^&#\\?]*)(&|#|$|\\?)");
            var m = _url.match(r);
            if ((!m || m === "")) {
                m = top.location.href.match(r)
            }
            return (!m ? "" : m[2])
        },
        priceFormat: function(data) {
            var n = parseInt(data || 0),
                s = n.toString(),
                g = [];
            while (s.length > 3) {
                g.push(',' + s.slice(s.length - 3, s.length));
                if (s.length > 3) {
                    s = s.slice(0, s.length - 3);
                }
            }
            g.reverse();
            return s + g.join('') + '元';
        },
        getFollowType: function(data) {
            return CONSTANT_BILL.FOLLOW_TYPE[data];
        },
        inputTest: function(type, val) {
            var reg;
            switch (type) {
                case 'price':
                    reg = new RegExp("^(0|[1-9][0-9]{0,9})(\.[0-9]{1,2})?$");
                    break;
                default:
                    ;
            }
            return reg.test(val);
        },
        renderTemplate: function(domid, data, reg) {
            var _tpl = document.querySelector(domid).innerHTML,
                _reg = reg || [],
                _html = " ";
            if (_reg.length > 0) {
                _reg.forEach(function(ele, idx, arr) {
                    juicer.register(ele.name, ele.func);
                });
            }
            _html = $(juicer(_tpl, data));
            $(domid).after(_html);
            return _html;
        },
        init: function() {
            //日期格式化
            Date.prototype.Format = function(fmt) { //author: meizz
                var o = {
                    "M+": this.getMonth() + 1, //月份
                    "d+": this.getDate(), //日
                    "h+": this.getHours(), //小时
                    "m+": this.getMinutes(), //分
                    "s+": this.getSeconds(), //秒
                    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                    "S": this.getMilliseconds() //毫秒
                };
                if (/(y+)/.test(fmt))
                    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o)
                    if (new RegExp("(" + k + ")").test(fmt))
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
            }
        }
    }
OMS_BILL.init();
