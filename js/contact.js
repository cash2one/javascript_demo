Zepto(function($) {
    var basic_v = "0.2.6";
    var DDCtrl = {
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
                        callback() || false;
                    },
                    onFail: function(err) {}
                });
            },
            showToast: function(msg, callback) {
                dd.device.notification.toast({
                    icon: '',
                    text: msg,
                    delay: 0,
                    onSuccess: function(result) {
                        //callback() || false;
                    },
                    onFail: function(err) {}
                })
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
        OMS_TOOLS = {
            openLink: function(href, singleopenWindowFlag) {
                //var dd_nav_bgcolor = window.location.href.indexOf('dd_nav_bgcolor') > -1 ? this.getQueryStringByName('dd_nav_bgcolor') : 'FF7BD4E4';
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
            sendQuest: function(config) {
                var flag = true,
                    suffix = config.suffix || "",
                    apiUrl = oms_config.apiUrl + oms_apiList[config.api] + suffix,
                    sendData = config.data || {};

                sendData.token = OMS_SYS.user.token;
                sendData.omsuid = OMS_SYS.user.id;


                dd.ready(function() {
                    if (flag) {
                        DDCtrl.showLoading();
                    }
                });

                $.ajax({
                    url: apiUrl,
                    type: config.type,
                    data: sendData,
                    cache: false,
                    success: function(response) {
                        flag = false;
                        dd.ready(function() {
                            DDCtrl.hideLoading();
                        });
                        if (response) {
                            var result = { res: [] };
                            try {
                                if (typeof response === "object") {
                                    result = response;
                                } else {
                                    result = JSON.parse(response);
                                }
                            } catch (e) {
                                console.log(e);
                                DDCtrl.showAlert("请求回调后出错，请联系管理员!");
                            }
                            config.callback(result);
                        } else {
                            console.log("服务异常");
                            DDCtrl.showAlert("数据拉取异常，请联系管理员。");
                        }
                    },
                    error: function() {
                        flag = false;
                        dd.ready(function() {
                            DDCtrl.hideLoading();
                        });
                        DDCtrl.showAlert("网络异常!");
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
            }
        },
        OMS_SYS = {
            role: null,
            roleMap: {
                '1': 1, //新签leader
                '2': 2, //续签业务员
                '3': 3, //新签业务员
                '4': 4, //续签leader
                '5': 5,
                '6': 6,
                '7': 7,
                '8': 8
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
            init: function() {
                $.fn.OMS_SYS = function(settings) { $.extend(OMS_SYS, settings || {}); };
                $.fn.ready(function() {
                    var omsUser = OMS_TOOLS.getCookie('omsUser');
                    if (omsUser) omsUser = JSON.parse(omsUser);
                    if (omsUser.res === 1) {
                        if (omsUser.role === -1) {
                            dd.device.notification.alert({
                                message: omsUser.msg,
                                title: "提示",
                                buttonName: "确定",
                                onSuccess: function() {
                                    dd.biz.navigation.close({
                                        onSuccess: function(result) {},
                                        onFail: function(err) {}
                                    });
                                },
                                onFail: function(err) {}
                            });
                        } else {
                            OMS_SYS.user = omsUser;
                            OMS_Module.init();
                        }
                    } else {
                        dd.device.notification.alert({
                            message: "登录失败",
                            title: "提示",
                            buttonName: "离开",
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
                Date.prototype.Format = function(fmt) {
                    var o = {
                        "M+": this.getMonth() + 1,
                        "d+": this.getDate(),
                        "h+": this.getHours(),
                        "m+": this.getMinutes(),
                        "s+": this.getSeconds(),
                        "q+": Math.floor((this.getMonth() + 3) / 3),
                        "S": this.getMilliseconds()
                    };
                    if (/(y+)/.test(fmt))
                        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                    for (var k in o)
                        if (new RegExp("(" + k + ")").test(fmt))
                            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                    return fmt;
                };
                FastClick.attach(document.body);
            }
        },
        OMS_Module = {
            win: {
                height: $(window).height()
            },
            mainScroll: {
                control: null,
                height: 0,
                free: true,
                totalPage: 0,
                nextPage: 1,
                selector: "#mainScroller",
                hash: [],
                hashpage: 0,
                hasname: [],
                ribbon: document.getElementById("ribbonvalue")
            },
            resScroll: {
                control: null,
                height: 0,
                free: true,
                totalPage: 0,
                nextPage: 1,
                selector: "#resScroller",
                doEmpty: false
            },
            updateScroller: function(s) {
                var self = OMS_Module;

                self[s].control.refresh();
                self[s].height = self.win.height - $(self[s].selector + ">ul").height();
                self[s].free = true;
            },
            updateRibbons: function(s) {
                var self = OMS_Module;
                var sum = 0;
                self[s].hash = [];
                self[s].hashname = [];
                $(self[s].selector + " ul>li.section").each(function(index, ele) {
                    self[s].hashname.push($(ele).data("group"));
                    self[s].hash.push(0 - sum);
                    sum += $(ele).height();
                });
            },
            checkRole: function(s) {
                return (OMS_SYS.roleMap[s] === 1 || OMS_SYS.roleMap[s] === 2 || OMS_SYS.roleMap[s] === 3 || OMS_SYS.roleMap[s] === 4) ? true : false;
            },
            getContactsByPage: function(page, size) {
                OMS_Module.mainScroll.free = false;
                var config = {},
                    self = this;
                config.api = "getContacts";
                config.suffix = "/" + OMS_SYS.user.id;
                config.type = "post";
                config.data = {
                    role: OMS_SYS.user.role,
                    page: page,
                    size: size || 30
                };
                config.callback = this.renderContactsList;
                OMS_TOOLS.sendQuest(config);
            },
            getContactsByName: function(page, size, keywords) {
                OMS_Module.resScroll.free = false;
                var config = {},
                    self = this;
                config.api = "getContactByName";
                config.suffix = "/" + OMS_SYS.user.id;
                config.type = "post";
                config.data = {
                    role: OMS_SYS.user.role,
                    page: page - 1,
                    size: size || 30,
                    keyword: keywords
                };
                config.callback = this.renderSearchList;
                OMS_TOOLS.sendQuest(config);
            },
            renderSections: function(groupid) {
                var self = OMS_Module;
                var tplHTML = '<li class="section" data-group="' + self.formatGroupId(groupid) + '" >' +
                    '<header>' + self.formatGroupId(groupid) + '</header>' +
                    '<ul class="section-content">' +
                    '</ul>' +
                    '</li>';
                return $(tplHTML);
            },
            renderItems: function(data) {
                var tplHTML = '<li class="ui-border-t item" data-cusid="<%=cusid%>">' +
                    '<div class="ui-row-flex">' +
                    '<div class="ui-col col1 ui-flex ui-flex-ver ui-flex-align-start ui-flex-pack-center" data-cusid="<%=cusid%>">' +
                    '<p class="title"><%=linkman%></p>' +
                    '<p class="intro"><%=cusname%><span>|</span><%=position%></p>' +
                    '</div>' +
                    '<div class="ui-col col2 ui-flex ui-flex-align-center ui-flex-pack-center">' +
                    '<i class="ui-icon-phone-2" data-nickname="<%=linkman%>" data-phone="<%=telephone%>" onclick="businessCall.phoneCall(\'<%=id%>\',\'<%=telephone%>\',\'<%=linkman%>\',\'<%=cusname%>\',\'<%=cusid%>\',1,event)"></i>' +
                    '</div>' +
                    '</div>' +
                    '</li>',
                    _g = [];
                for (var i in data) {
                    _g.push($.tpl(tplHTML, data[i]));
                }
                return _g;
            },
            renderContactsList: function(res) {
                // console.log(res);
                var self = OMS_Module;
                $("#cList .tips").removeClass("activated");

                if (res.errno !== 0) {
                    $("#cList .tips").addClass("activated").text("返回数据错误:" + res.errmsg);
                    return;
                }
                if (res.data.total === 0) {
                    $("#cList .tips").addClass("activated").text("您当前还没有联系人");
                }

                var g_res = res.data.customer || {};
                var g_idx = Object.keys(g_res);

                if (g_idx.length > 0) {
                    self.mainScroll.totalPage = res.data.pagecount || 0;

                    for (var i in g_idx) {
                        var n = g_idx[i];
                        n = self.formatGroupId(n);
                        if (self.checkSectionExist(n)) {
                            //插入到已存在的section
                            var list = self.getGroups();
                            var $html = $(self.renderItems(g_res[self.returnFormatGroupId(n)]));

                            list.find("ul.section-content").append($html);

                        } else {
                            //创建新的section
                            var group = self.renderSections(n);

                            //插入到新创建的section中
                            group.each(function(index, ele) {
                                var m = $(ele).data("group");
                                var _g = g_res[self.returnFormatGroupId(m)];
                                var ls = self.renderItems(_g);
                                $(ele).find("ul.section-content").append(ls.join(""));
                            });

                            //将sections追加到页面dom中
                            $("#mainScroller>ul").append(group);

                        }
                    }


                    $("#cList").find("div.col1").tap(function() {
                        console.log("tap");
                        var t = $(this);
                        if (t.hasClass("activated")) {
                            return;
                        }
                        t.addClass("activated");
                        OMS_TOOLS.openLink(oms_config.baseUrl + "customerInfo.html?code=" + $(this).data("cusid") + "&from=private&jumpType=close", true);
                        setTimeout(function() {
                            t.removeClass("activated");
                        }, 1000);
                    });
                    // $("#cList").find("i.ui-icon-phone-2").tap(function() {
                    //     console.log("tap");
                    //     var t = $(this);
                    //     if (t.hasClass("activated")) {
                    //         return;
                    //     }
                    //     t.addClass("activated");
                    //     // OMS_Module.phoneCall($(this).data("nickname"), $(this).data("phone"));
                    //     setTimeout(function() {
                    //         t.removeClass("activated");
                    //     }, 1000);
                    // });

                    self.updateScroller("mainScroll");

                    self.updateRibbons("mainScroll");


                } else { //安全性复查
                    //DDCtrl.showToast("没有更多了~");
                }

            },
            renderSearchList: function(res) {
                // console.log(res);

                var self = OMS_Module;

                self.resScroll.totalPage = res.data.pagecount || 0;
                $("#sList .tips").removeClass("activated");
                if (parseInt(self.resScroll.totalPage) === 0) {
                    $("#sList .tips").addClass("activated").text("未查到您搜索的联系人");
                }

                if (self.resScroll.doEmpty) {
                    $("#resScroller>ul").empty();
                }

                var ls = self.renderItems(res.data.list),
                    tank = $("#sList");
                tank.addClass("activated");
                tank.find("ul").append(ls.join(""));

                self.updateScroller("resScroll");

                $("#sList").find("div.col1").tap(function() {
                    console.log("tap");
                    var t = $(this);
                    if (t.hasClass("activated")) {
                        return;
                    }
                    t.addClass("activated");
                    OMS_TOOLS.openLink(oms_config.baseUrl + "customerInfo.html?code=" + $(this).data("cusid") + "&from=private&jumpType=close", true);
                    setTimeout(function() {
                        t.removeClass("activated");
                    }, 1000);
                });
                // $("#sList").find("i.ui-icon-phone-2").tap(function() {
                //     console.log("tap");
                //     var t = $(this);
                //     if (t.hasClass("activated")) {
                //         return;
                //     }
                //     t.addClass("activated");
                //     // OMS_Module.phoneCall($(this).data("nickname"), $(this).data("phone"));
                //     setTimeout(function() {
                //         t.removeClass("activated");
                //     }, 1000);
                // });

            },
            formatGroupId: function(groupid) {
                return groupid === 'empty' ? '*' : groupid;
            },
            returnFormatGroupId: function(groupid) {
                return groupid === '*' ? 'empty' : groupid;
            },
            getGroups: function(s) {
                return $("#mainScroller>ul>li[data-group='" + s + "']");
            },
            checkSectionExist: function(s) {
                return this.getGroups(s).length > 0 ? true : false;
            },
            scrollHandler: function() {
                var n = this.y >> 0;
                if (n < OMS_Module.mainScroll.height && OMS_Module.mainScroll.free) {
                    OMS_Module.mainScroll.nextPage += 1;
                    if (OMS_Module.mainScroll.nextPage > OMS_Module.mainScroll.totalPage) {
                        OMS_Module.mainScroll.free = false;
                    } else {
                        OMS_Module.getContactsByPage(OMS_Module.mainScroll.nextPage);
                    }
                }
                if (n > 0) {
                    return;
                }
                if (this.directionY === 1 && n <= OMS_Module.mainScroll.hash[OMS_Module.mainScroll.hashpage]) {
                    OMS_Module.mainScroll.hashpage += 1;
                    OMS_Module.mainScroll.ribbon.value = OMS_Module.mainScroll.hashname[OMS_Module.mainScroll.hashpage-1];
                }
                else if (this.directionY === -1 && n > OMS_Module.mainScroll.hash[OMS_Module.mainScroll.hashpage - 1]) {
                    OMS_Module.mainScroll.hashpage -= 1;
                    OMS_Module.mainScroll.ribbon.value = OMS_Module.mainScroll.hashname[OMS_Module.mainScroll.hashpage-1];
                }
            },
            scrollHandler2: function() {
                if (this.y < OMS_Module.resScroll.height && OMS_Module.resScroll.free) {
                    OMS_Module.resScroll.nextPage += 1;
                    if (OMS_Module.resScroll.nextPage > OMS_Module.resScroll.totalPage) {
                        OMS_Module.resScroll.free = false;
                        return;
                    }
                    if ($("#inputSearch").val() !== "") {
                        OMS_Module.resScroll.doEmpty = false;
                        OMS_Module.getContactsByName(OMS_Module.resScroll.nextPage, 30, $("#inputSearch").val());
                    }
                }
            },
            // phoneCall: function(uname, tel) {
            //     if (dd.ios) {
            //         window.location.href = "tel:" + tel;
            //     } else {
            //         dd.device.notification.confirm({
            //             message: uname,
            //             title: "立即呼叫",
            //             buttonLabels: ['取消', '确定'],
            //             onSuccess: function(result) {
            //                 if (result.buttonIndex == 1) {
            //                     window.location.href = "tel:" + tel;
            //                 }
            //             },
            //             onFail: function(err) {}
            //         });
            //     }
            // },
            messageSend: function(uname, sms) {
                if (dd.ios) {
                    window.location.href = "sms:" + sms;
                } else {
                    window.location.href = "sms:" + sms;
                    // dd.device.notification.confirm({
                    //     message: uname,
                    //     title: "立即发送短信",
                    //     buttonLabels: ['取消', '确定'],
                    //     onSuccess : function(result) {
                    //         if(result.buttonIndex == 1){
                    //             window.location.href = "sms:" + sms;
                    //         }
                    //     },
                    //     onFail : function(err) {}
                    // });
                }
            },
            init: function() {
                document.addEventListener('touchmove', function(e) { e.preventDefault(); }, false);

                dd.ready(function() {
                    DDCtrl.setRightBtn(" ", function() {}, false);
                    DDCtrl.setIOSLeftBtn("返回", function() {
                        window.history.back();
                    });
                    //omsapp-android-setLeft-visible:true
                    if (dd.android) {
                        dd.biz.navigation.setLeft({
                            visible: true,
                            control: false,
                            text: ''
                        });
                    }
                });
                var self = this;
                if (!self.checkRole(OMS_SYS.user.role)) {
                    DDCtrl.showAlert("您的权限不正确，只有业务员可以访问此功能。");
                    return;
                }
                $.extend(oms_apiList, {
                    "getContacts": "contacts_api/index",
                    "getContactByName": "contacts_api/search"
                });
                $('#navBar .ui-searchbar').click(function(e) {
                    setTimeout(function() {
                        $('#navBar .ui-searchbar-input input').focus();
                    }, 100);
                    $('#navBar .ui-searchbar-wrap').addClass("focus");
                    $("#sList").addClass("activated");
                    $("#cList").removeClass("activated");
                });
                $('#navBar .ui-searchbar-cancel').click(function(e) {
                    $('#navBar .ui-searchbar-input input').blur();
                    $('#navBar .ui-searchbar-wrap').removeClass("focus");
                    $("#sList").removeClass("activated");
                    $("#cList").addClass("activated");

                });
                $('#navBar .ui-icon-close').tap(function() {
                    $("#inputSearch").val("");
                    $("#resScroller>ul").empty();
                    self.resScroll.control.refresh();
                });

                $("#inputSearch").keydown(function(e) {
                    if (String(e.keyCode) === "13") {
                        if ($("#inputSearch").val() !== "") {
                            $('#navBar .ui-searchbar-input input').blur();
                            self.resScroll.doEmpty = true;
                            self.getContactsByName(1, 30, $(this).val());
                        }
                        e.preventDefault();
                    }
                });

                self.mainScroll.control = new IScroll('#mainScroller', {
                    probeType: 3,
                    mouseWheel: false,
                    scrollbars: false,
                    preventDefault: false,
                    click: true,
                    tap: true
                });
                self.mainScroll.control.on('scroll', self.scrollHandler);

                self.resScroll.control = new IScroll('#resScroller', {
                    probeType: 3,
                    mouseWheel: false,
                    scrollbars: false,
                    preventDefault: false,
                    click: true,
                    tap: true
                });
                self.resScroll.control.on('scroll', self.scrollHandler2);

                self.getContactsByPage(1);
            }
        };

    OMS_SYS.init();
});
