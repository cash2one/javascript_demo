var __$$omsSaleVersion = 1;

var omsSale = {
    userInfo: JSON.parse(getCookie('omsUser')),

    saleEventListener: function () {
        $("#sale_tool").click(function () {
            openLink('vipService.html');
        });
        $('#change_postion').click(function () {
            omsSale.listPositions(omsSale.updatePosition);
        });
        $('#change_account').click(function () {
            omsSale.changeAccountCallback();
        });
        $("#log_out").click(function () {
            dd.device.notification.confirm({
                message: "确定退出登陆吗？",
                title: "提示",
                buttonLabels: ["取消", "退出"],
                onSuccess: function (result) {
                    if (result.buttonIndex === 1) {
                        loginOut(); //defined in config.js file
                    }
                },
                onFail: function () {
                    omsSale._isNotificationFront = false;
                }
            });
        });
    },
    diagEventBind: function(){
        //智能诊断配置 用户权限配置
        if('13000000001|18510453616|13331135913|18811430499|18911390111|'.indexOf(this.userInfo.telephone) >= 0){
            $('#diagConfig').css('display', '');
            $('#diagConfig').on('click', function(){
                openLink('teamDiagnoseConfig.html');
            });
        }
    },
    initApi: function () {
        dd.ready(function () {
            dd.biz.navigation.setTitle({
                title: omsSale.userInfo.realname,
                onSuccess: function (result) {
                },
                onFail: function (err) {
                }
            });
            //omsapp-android-setLeft:visible:true
            dd.biz.navigation.setLeft({
                visible: true,
                control: false,
                text: ''
            });
            if (dd.ios) {
                dd.biz.navigation.setLeft({
                    show: true,
                    control: true,
                    text: '返回',
                    onSuccess: function (result) {
                        window.history.back();
                    }
                });
            }
            dd.biz.navigation.setRight({
                show: false,
                control: false,
                showIcon: false,
                text: '',
                onSuccess: function (result) {
                },
                onFail: function (err) {
                }
            });
        });

        // if (omsSale.userInfo.role == 5 && omsSale.userInfo.isCityLeader != 1) {
        //     $('#sale_tool').show();
        // }
        // if (omsSale.userInfo.role != 2 && omsSale.userInfo.role != 3) { //1：新签leader; 2：续签业务员; 3：新签业务员; 4：续签leader
        //     var url = oms_config.apiUrl + oms_apiList.listPositions;
        //     omsSale.getAjaxData(url, {}, function (ret) {
        //         console.log(ret);
        //         omsSale.positionList = ret;
        //         ret.length > 1 && $('#change_postion').show();
        //     });
        //     var item = omsSale.userInfo;
        //     $('#current_position').text((item.area ? item.area + ' ' : '') + item.position);
        // }
        // omsSale.getCorpList(function (corps) {
        //     if (corps && corps.length > 1) { // >1 for production
        //         $('#change_account').show();
        //     }
        // });
        //
        // var draftData = draftWork.list() || [];
        // if (draftData && draftData.length > 0) {
        //     $('#draft_num').text(draftData.length);
        // }
        // $("#draft_work").on("click", function (e) {
        //     if (draftData && draftData.length > 0) {
        //         openLink("draft.html");
        //         return false;
        //     } else {
        //         dd.device.notification.toast({
        //             icon: 'error',
        //             text: '暂无草稿数据',
        //             //duration: 1,
        //             onSuccess: function (result) {
        //             },
        //             onFail: function (err) {
        //             }
        //         });
        //     }
        // });
    },
    getAjaxData: function (url, data, callback, onfail ) {
        var omsUser = omsSale.userInfo;
        var param = {
            'omsuid': omsUser.id,
            'token': omsUser.token
        };
        param = $.extend(true, param, data);

        $.ajax({
            type: 'POST',
            url: url,
            data: param,
            cache: false,
            dataType: 'json'
        }).always(function (result) {
            if (result && result.res === 1) {
                return callback(result.data || result);
            }
            if (typeof onfail == 'function') {
                onfail.call(null, 'error');
            } else {
                dd.device.notification.toast({text: '网络请求失败', icon: 'error'});
            }
        });
    },
    getCorpList: function (callback) {
        var corpdefer = $.Deferred();
        dd.util.localStorage.getItem({
            name: 'crm.corp.data',
            onSuccess: function (result) {
                try{
                    omsSale.corps = JSON.parse(result.value);
                    return corpdefer.resolve();
                }catch (e){
                    return corpdefer.reject();
                }
            },
            onFail: function () {
                dd.device.notification.hidePreloader();
                return corpdefer.reject();
            }
        });
        $.when(corpdefer).then(function () {
            if(omsSale.corps){
                typeof callback == 'function' && callback.call(null, omsSale.corps.corps);
            }
        });
    },
    sendLoginMessage: function (token) {
        //use iframe to send login message for new corp
        var iframeId = 'ifr-change-login';
        //data to be sent to login
        var data = {
            cid: omsSale.corpinfo.id,
            entcode: omsSale.corpinfo.entcode,
            tel: omsSale.userInfo.telephone,
            token: token,
            loginurl: omsSale.corpinfo.loginurl,
            step: 2
        };
        //define the listener to listen message from iframe
        var onchangemessage = function (e) {
            var data = JSON.parse(e.data);
            dd.device.notification.hidePreloader();

            if (data.step == 2) { //
                omsSale.saveAuthData(data.data, omsSale.corpinfo.id, function() {
                    omsSale.goOtherCorp(data.msg);
                });
            }
            window.removeEventListener('message', onchangemessage);
        };
        window.addEventListener('message', onchangemessage);
        var frame = document.getElementById(iframeId).contentWindow;
        frame.postMessage(JSON.stringify(data), '*');
    },
    changeAccountCallback: function () {
        var corps = $.extend(true, [], omsSale.corps.corps), sources = [];
        var sources = [];
        $.each(corps, function (i, obj) {
            sources.push({
                key: obj.name,
                value: obj.corpid
            });
        });
        dd.biz.util.chosen({
            source: sources,
            onSuccess: function (result) {
                var corpid = result.value, corpinfo;
                var url = oms_config.apiUrl + oms_apiList.getCrmToken;
                $.each(corps, function (i, obj) {
                    if (obj.corpid == corpid) {
                        corpinfo = $.extend(true, {}, obj);
                        return false;
                    }
                });
                omsSale.corpinfo = corpinfo; //save selected corpInfo
                omsSale.getAjaxData(url, {'corpid': corpid}, function (ret) {
                    var token = ret.token;
                    if (!token) {
                        dd.device.notification.toast({text: '网络请求失败', icon: 'error'});
                    }

                    dd.device.notification.showPreloader({text: '跳转中'});
                    //call sendLoginMessage using new token
                    omsSale.sendLoginMessage(token);
                });
            }
        });
    },
    saveAuthData: function (userdata, corpcid, onsuccess) {
        var allsaved = [], corpdata;
        corpdata = $.extend(true, {}, omsSale.corps, {current_corpid: corpcid});
        //保存企业信息
        var corpdefer = $.Deferred();
        dd.util.localStorage.setItem({
            name: 'crm.corp.data',
            value: JSON.stringify(corpdata),
            onSuccess: function() {
                corpdefer.resolve();
            }
        });
        allsaved.push(corpdefer);
        //保存登录用户信息
        var userdefer = $.Deferred();
        dd.util.localStorage.setItem({
            name: 'crm.user.data',
            value: JSON.stringify(userdata),
            onSuccess: function() {
                userdefer.resolve();
            }
        });
        allsaved.push(userdefer);
        $.when.apply($, allsaved).then(onsuccess);
    },
    goOtherCorp: function (err) {
        if (err) {
            dd.device.notification.toast({text: err, icon: 'error'});
        } else {
            var querystr = '&_from=crmlogin&r='+Math.random();
            window.location.href = (omsSale.corpinfo.indexurl + querystr).replace(/[\?&]/, '?');
        }
    },
    listPositions: function (callback, err) {
        if (omsSale.positionList && omsSale.positionList.length > 1) {
            var list = [];
            $.each(omsSale.positionList, function (i, item) {
                var keyName = ((item.vwar || item.area) ? (item.vwar || item.area ) + ' ' : '') + item.position;
                list.push({
                    key: keyName,
                    value: item.uid
                });
            });
            dd.biz.util.chosen({
                source: list,
                onSuccess: function (ret) {
                    var uid = ret.value;
                    if (uid) {
                        typeof callback == 'function' && callback.call(null, uid);
                    } else {
                        typeof err == 'function' && err.call(null, 'cancel');
                    }
                },
                onFail: function (err) {
                    typeof err == 'function' && err.call(null, 'cancel');
                }
            });
        }
    },
    updatePosition: function (uid) {
        var url = oms_config.apiUrl + oms_apiList.switchAccount;
        omsSale.getAjaxData(url, {uid: uid}, function (ret) {
            //reset cookie
            delCookie('omsUser');
            setCookie('omsUser', JSON.stringify(ret));

            //reset local storage
            dd.util.localStorage.setItem({
                name: 'crm.user.data',
                value: JSON.stringify(ret),
                onSuccess: function () {
                    var _from = getCookie('_from'), querystr = '&r='+Math.random();
                    if (_from) {
                        querystr = '&_from='+_from+querystr;
                    }
                    window.location.href = ('index.html' + querystr).replace(/[\?&]/, '?');
                }
            })
        });
    },

    init: function () {
        if(omsSale.userInfo){
            this.initApi();
            this.saleEventListener();
            this.diagEventBind();
            $('body').append('<iframe id="ifr-change-login" src="'+oms_config.loginChangeUrl+'" style="display: none;"></iframe>');
        }else{
            dd.device.notification.toast({
                text: '用户登录已过期,请重新登录',
                icon: 'error',
                onSuccess: function () {
                    loginOut();
                }
            });
        }
    }
};

$.fn.omsSale = function(settings) {
    $.extend(omsSale, settings || {});
};

dd.ready(function() {
    omsSale.init();
});
