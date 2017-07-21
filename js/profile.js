$(function() {
    FastClick.attach(document.body);
    var version_control = "0.8";
    var OMS = {
        id: getUrlParam('id'),
        do: getUrlParam('do') || 0,
        jumpType: getUrlParam('jumpType') || '',
        realname: '',
        telephone: '',
        isNew: 0,
        role: null,
        user: {},
        presets: {
            seq: {
                "follow": "自动排序-跟进状态",
                "join": "加入时间"
            },
            follow_rec: {
                'k0': '待理单',
                'k1': '已签已回',
                'k6': '已签未回',
                'k2': '重点跟进',
                'k3': '能签能回',
                'k4': '冲击客户',
                'k7': '推进中',
                'k5': '已死客户'
            },
            contact_state: {
                '0': '联系中',
                '1': '绕到负责人',
                '2': '约到负责人',
                '3': '已经使用',
                '4': '未联系',
                '5': '联系负责人中'
            },
            follow_time: {
                'week': '本周',
                'month': '本月',
                'range': '自定义时间区间'
            },
            grade_staff: {
                'a': 'a',
                'b': 'b',
                'c': 'c',
                'd': 'd'
            },
            grade_manager: {
                'A': 'A',
                'B': 'B',
                'C': 'C',
                'D': 'D'
            }
        },
        config: {
            seq: "follow",
            sift: {
                "follower": [],
                "follow_time": "",
                "contact_state": [],
                "grade_staff": [],
                "grade_manager": [],
                "follow_rec": []
            },
            recent_contact: []
        },
        scrollers: {
            scperson: null
        },

        initTabPanel: function(doms) {
            var _doms = doms || [],
                A = "activated";
            for (var i in _doms) {
                $(doms[i]).children("li[data-target]").tap(function() {
                    var _t = $("section[data-role=panel]." + $(this).data("target"));

                    if ($(this).hasClass(A) && $(this).data("fold") == 'allow') {
                        $(this).removeClass(A)
                        _t.removeClass(A);
                        $("#listNav").removeClass(A);
                        if ($(this).data("target") === "sift") {
                            setTimeout(function() {
                                OMS.scrollers.scperson = new fz.Scroll('#siftListPerson', {
                                    scrollY: true
                                });
                            }, 200);
                        }
                        return;
                    }

                    $(this).addClass(A).siblings().removeClass(A);

                    _t.siblings().removeClass(A);
                    _t.addClass(A + " disabled");
                    $("#listNav").addClass(A);

                    //延时用于防止触摸菜单按钮时，误触弹出的下拉panel里靠近顶部的按钮等
                    setTimeout(function() {
                        _t.removeClass("disabled");
                    }, 300);

                });
            }
            // document.querySelector("#listNav").addEventListener("click", function(e) {
            //     if (e.target.id === "listNav") {
            //         OMS.closeFilterPanel();
            //     }
            // }, true);

            $("#filter-panel section.sift li.scroll-sift2").click(function() {
                new fz.Scroll('.sift2.ui-scroller-v', {
                    scrollY: true
                });
            });
            $("#filter-panel section.sift li.scroll-sift5").click(function() {
                new fz.Scroll('.sift5.ui-scroller-v', {
                    scrollY: true
                });
            });
        },

        initSifter: function() {
            // OMS_BILL.renderTemplate("#tpl-contact-state", OMS.presets);
            // OMS_BILL.renderTemplate("#tpl-grade-mgr", OMS.presets);
            // OMS_BILL.renderTemplate("#tpl-grade-staff", OMS.presets);
            // OMS_BILL.renderTemplate("#tpl-follow-rec", OMS.presets, [{ name: 'removePrefix', func: OMS_Controller['removePrefix'] }]);
            // OMS_BILL.renderTemplate("#tpl-follow-time", OMS.presets);
            // OMS_BILL.renderTemplate("#tpl-filter-repeater", OMS.config);
            // this.initSifterEvent("section.sift section .ui-list li");
        },
        initSifterEvent: function(selectors) {
            $(selectors).off("click").on("click", function(e) {
                var t = $(this),
                    ipt = t.find("input"),
                    cls = t.data("sort") + t.data("value");

                if (ipt.attr("type") !== "radio") {
                    ipt.prop("checked", !ipt.prop("checked"));
                } else {
                    ipt.prop("checked", true);
                }

                if (t.hasClass("clear-all")) {
                    $("section." + t.data("sort") + " ul>li input").not("[name=" + t.data("sort") + "-clear]").prop("checked", false);
                    OMS.refreshFilterLabel({
                        target: t.data("sort"),
                        flag: 1
                    });
                    $("#datepicker-group").removeClass("activated");
                } else {
                    if (t.data("sort") === "sift6") {
                        OMS.refreshFilterLabel({
                            target: t.data("sort"),
                            flag: 1
                        });
                    }
                    if (t.data("value") === "range") {
                        OMS.checkSiftDate();
                        $("#datepicker-group").addClass("activated");
                    } else {
                        $("#datepicker-group").removeClass("activated");
                        OMS.refreshFilterLabel({
                            target: cls,
                            flag: ipt.prop("checked") ? 0 : 1,
                            res: {
                                className: cls,
                                label: t.data("label"),
                                key: t.data("key")
                            }
                        })
                    }
                    $("section." + t.data("sort") + " ul>li input[name=" + t.data("sort") + "-clear]").prop("checked", false);

                }
            });
        },
        // initFilter: function() {
        //     var self = this;
        //     $("#btnResetFilter").click(function(e) {
        //         $("section.sift .sub-panel input[type=checkbox],section.sift input[type=radio]").prop("checked", false);
        //         $("section.sift .sub-panel input[name*=clear]").prop("checked", true)
        //         $("section.sift .sub-panel input[type=text]").val("");
        //         $("#b-filter ul li").remove();
        //         $("#b-filter").removeClass("activated");
        //         $("section#list,#bar-total").removeClass("posdown");
        //         self.config.sift = {
        //             "follower": [],
        //             "follow_time": "",
        //             "contact_state": [],
        //             "grade_staff": [],
        //             "grade_manager": [],
        //             "follow_rec": []
        //         };
        //         e.stopPropagation();
        //         e.preventDefault();
        //         return false;
        //     });
        //     $("#btnConfirmFilter").tap(function() {
        //         var s = "",
        //             date_flag = $("section.sift6").find("input[type=radio]:checked").data("value");
        //         if (date_flag == "range") {
        //             s = $("#datepicker-group input[name=start-time]").val() + "," + $("#datepicker-group input[name=end-time]").val();
        //         } else if (String(date_flag) === "-1") {
        //             s = "";
        //         } else {
        //             s = date_flag;
        //         }
        //         self.updateConfig({
        //             "sift": {
        //                 "follower": OMS_Controller.valPeopelToSingleCheckbox($("section.sift1").find("input:checked")),
        //                 "follow_time": s,
        //                 "contact_state": OMS_Controller.valItemCheckbox($("section.sift2").find("input:checked")),
        //                 "grade_staff": OMS_Controller.valItemCheckbox($("section.sift3").find("input:checked")),
        //                 "grade_manager": OMS_Controller.valItemCheckbox($("section.sift4").find("input:checked")),
        //                 "follow_rec": OMS_Controller.valItemCheckbox($("section.sift5").find("input:checked"))
        //             }
        //         });

        //         console.log("确定开始搜索时的配置项：");
        //         console.log(OMS.config);

        //         self.getListData();
        //         self.closeFilterPanel();
        //     });
        // },
        initTabsPanel: function() {
            if (this.config.seq !== "follow") {
                return;
            }
            $("section[data-role=tabs-panel]").tap(function() {
                var t = $(this);
                if (t.hasClass("active")) {
                    t.removeClass("active");
                } else {
                    $("section[data-role=tabs-panel]").removeClass("active");
                    $(this).addClass("active");
                }
            });
            $("#btnTabSearch").tap(function() {
                $("#searchBill").addClass("activated");
                OMS_BILL.setURLQuery({
                    "state": "searchTool"
                });

                dd.ready(function() {
                    DDCtrl.setTitle("搜索");
                    DDCtrl.setRightBtn(" ", function() {}, false);
                    DDCtrl.setIOSLeftBtn("返回", function() {
                        if (OMS.jumpType == "close")
                            dd.biz.navigation.close({
                                onSuccess: function(result) {},
                                onFail: function(err) {}
                            });
                        else
                            history.back(-1);
                    });
                });
            })
        },
        // initSearchPanel: function() {
        //     var self = this;
        //     $("#btnSearchEmployee").tap(function(e) {
        //         $("#searchEmp").addClass("activated");
        //         OMS_BILL.setURLQuery({ "state": "searchTool" });

        //         dd.ready(function() {
        //             DDCtrl.setTitle("查找跟进人");
        //             DDCtrl.setRightBtn(" ", function() {}, false);
        //             DDCtrl.setIOSLeftBtn("返回", function() {
        //                 history.back(-1);
        //             });
        //         });
        //         e.preventDefault();
        //     });

        //     $('.ui-searchbar').click(function(e) {
        //         var t = $(this).parent().parent();
        //         t.find('.ui-searchbar-wrap').addClass('focus');
        //         t.find('.ui-searchbar-input input').focus();
        //     });
        //     $('.ui-searchbar-cancel').click(function(e) {
        //         var t = $(this).parent().parent();
        //         t.find('.ui-searchbar-wrap').removeClass('focus');
        //         e.preventDefault();
        //     });
        //     $('.ui-searchbar i.ui-icon-close').tap(function() {
        //         $(this).parent().find("input").val("");
        //     });
        //     $('#form-search-person').submit(function(e) {
        //         e.preventDefault(e);
        //         $(this).find('.ui-searchbar-wrap').removeClass('focus');
        //         self.getSearchPersonData($(this).find("input").val());
        //     });

        //     $('#form-search-bill').submit(function(e) {
        //         e.preventDefault(e);
        //         $(this).find('.ui-searchbar-wrap').removeClass('focus');
        //         self.getSearchBillData($(this).find("input").val());

        //     });
        //     $('#choosePerson').tap(function() {
        //         var t = $('#searchList');
        //         OMS.config.recent_contact = OMS_Controller.valPeopelCheckbox(t.find("input:checked"));

        //         OMS.refreshSiftPerson(true);

        //         OMS.updateRencentContact();

        //         history.back(-1);
        //         $("#searchList>ul>li").remove();
        //         $('#form-search-person').find("input").val("");
        //     });
        // },
        // initSiftDate: function() {
        //     $("#datepicker-group input").tap(function() {
        //         var t = $(this);
        //         DDCtrl.setDatePicker(new Date().Format("yyyy-MM-dd"), function(d) {
        //             t.val(d);
        //             t.addClass("inited");
        //             $("section.sift6 li[data-value='range'] input[name=follow-time]").prop("checked", true);
        //             OMS.checkSiftDate();
        //         });
        //     });
        // },
        checkSiftDate: function() {
            var d1 = $("#datepicker-group input[name='start-time']");
            var d2 = $("#datepicker-group input[name='end-time']");
            if (d1.hasClass('inited') && d2.hasClass('inited')) {
                if (new Date(d1.val()).getTime() > new Date(d2.val()).getTime()) {
                    d2.removeClass("inited").val("");
                    OMS.refreshFilterLabel({
                        flag: 1,
                        target: "sift6"
                    });
                    DDCtrl.showAlert("结束日期不能大于起始日期！");
                } else {
                    OMS.refreshFilterLabel({
                        flag: 0,
                        target: "sift6range",
                        res: {
                            className: "sift6range",
                            label: "下次拜访时间",
                            key: d1.val() + "至" + d2.val()
                        }
                    });
                    /*
                        cfg.flag 0:添加 1: 删除
                        cfg.target 目标className
                        cfg.res  { className: sort与value 拼接的类名，label: 筛选类型名称 ， key: 筛选项的名称}
                    */
                }
            } else {
                OMS.refreshFilterLabel({
                    flag: 1,
                    target: "sift6"
                });
            }
        },
        // initSiftPerson: function() {
        //     var r = window.localStorage.filterBillingStaff;
        //     if (r) {
        //         this.config.recent_contact = JSON.parse(r);
        //         this.refreshSiftPerson(false);
        //     }
        // },
        setSiftersUI: function() {
            var c = this.config,
                a = "activated",
                seq = $("section.seq>ul>li"),
                sift6 = $("section.sift6"),
                dp = $("#datepicker-group input"),
                nav = $("#listNav>ul>li[data-target=seq] span"),
                arrs = [];
            if (c.seq === "follow") {
                seq.eq(0).addClass(a);
                nav.text("跟进状态");
            } else {
                seq.eq(1).addClass(a);
                nav.text("加入时间");
            }

            if (c.sift["follow_time"] !== "") {
                switch (c.sift["follow_time"]) {
                    case "week":
                        sift6.find("li[data-value=week]").prop("checked", true);
                        break;
                    case "month":
                        sift6.find("li[data-value=month]").prop("checked", true);
                        break;
                    default:
                        sift6.find("li[data-value=range]").prop("checked", true);
                        var g = c.sift["follow_time"] || ["开始时间", "结束时间"];
                        dp.eq(0).val(g[0]);
                        dp.eq(1).val(g[1]);

                }
            }
            arr = c.sift["contact_state"];
            if (arr.length !== 0) {
                arr = c.sift["contact_state"];
                for (var key in arr) {

                }
            }
            arr = c.sift["grade_staff"];
            if (arr.length !== 0) {

            }
            arr = c.sift["grade_manager"];
            if (arr.length !== 0) {

            }
            arr = c.sift["follow_rec"];
            if (arr.length !== 0) {

            }
            var s = c.sift["follow_rec"];
            if (arr.length !== 0) {

            }

        },


        refreshListRender: function(dt) {
            $("#cuslist>section").remove();

            //data 重排序
            var data,
                _temp = dt.res || [];



            if (Object.getOwnPropertyNames(_temp).length > 6) {
                data = {
                    res: {
                        0: dt.res[0],
                        1: dt.res[1],
                        2: dt.res[6],
                        3: dt.res[2],
                        4: dt.res[3],
                        5: dt.res[4],
                        6: dt.res[7],
                        7: dt.res[5]
                    }
                };
            } else {
                data = dt;
            }


            OMS_BILL.renderTemplate("#tpl-cuslist", data, [{
                name: 'priceFormat',
                func: OMS_BILL.priceFormat
            }, {
                name: 'getFollowType',
                func: OMS_BILL.getFollowType
            }]);
            if (OMS.config.seq == "follow") {
                $("#cuslist").removeClass("join").addClass("follow");
            } else {
                $("#cuslist").removeClass("follow").addClass("join");
                $("#cuslist section").addClass("active");
            }
            var tt = 0,
                nn = 0;
            $.each(data.res, function(index, item) {
                var m = 0,
                    n = 0;
                $.each(item.list, function(idx, ele) {
                    m += parseInt(ele.price);
                    n++;
                });
                var t = $("#cuslist section[data-role=tabs-panel]").eq(index);
                t.find("span[data-role=paid]").text(OMS_BILL.priceFormat(m));
                t.find("span[data-role=count]").text(n);
                tt += m;
                if (item.name !== "已签已回" && item.name !== "待理单") {
                    nn += m;
                }
            });
            $("#totalcount").text(OMS_BILL.priceFormat(tt));
            $("#totalsiftcount").text(OMS_BILL.priceFormat(nn));
            $("#bar-total").css("opacity", 1);


            $("#cuslist li").tap(function() {
                OMS_BILL.openLink(oms_config.baseUrl + "customerInfo.html?code=" + $(this).data("cid") + "&from=lidan&bid=" + $(this).data("bid"), false);
            });
            OMS.initTabsPanel();
        },
        getSearchPersonData: function(name) {
            var config = {};
            config.api = 'getstafflist';
            config.type = 'post';
            config.data = {
                name: name
            };
            config.callback = this.refreshSearchPersonRender;
            sendQuest(config);
        },
        getSearchBillData: function(name) {
            var config = {};
            config.api = 'getlist';
            config.type = 'post';
            config.data = {
                cusName: name,
                seqType: "join",
                siftType: "",
                siftRef: ""
            };
            config.callback = this.refreshSearchBillRender;
            sendQuest(config);
        },
        getListData: function() {
            var config = {};
            config.api = 'getlist';
            config.type = 'post';

            var o = this.config.sift;
            var ref = {};

            ref.follow_time = o.follow_time;
            ref.follower = o.follower.join(',');
            ref.grade_manager = o.grade_manager.join(',');
            ref.grade_staff = o.grade_staff.join(',');
            ref.follow_rec = o.follow_rec.join(',');
            ref.contact_state = o.contact_state.join(',');

            config.data = {
                seqType: this.config.seq,
                siftType: "follower,follow_time,contact_state,grade_staff,grade_manager,follow_rec",
                siftRef: JSON.stringify(ref)
            };
            config.callback = this.refreshListRender;
            sendQuest(config);
        },
        routeControl: function(o) {
            /*
                o.new 新状态
                o.old 旧状态
            */
            if (o.new == "" && o.old == "basic") {
                if (OMS.jumpType == "close")
                    dd.biz.navigation.close({
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                else
                    window.history.back(-1);
            } else if (o.new == "basic" && o.old == "searchTool") {
                $("#searchBill").removeClass("activated");
                $("#searchEmp").removeClass("activated");
                DDCtrl.setTitle("理单列表");
                DDCtrl.setRightBtn(" ", function() {}, false);
                DDCtrl.setIOSLeftBtn("返回", function() {
                    if (OMS.jumpType == "close")
                        dd.biz.navigation.close({
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    else
                        history.back(-1);
                });
            } else {}
        },
        renderHeader: function(data) {
            $("#region").append(data.path);
            $("#title_stuff").append(data.stuff);
            $("#title_tel").append(data.tel);
            $("#title_visit").append(data.visit);
        },
        phoneCall: function(name,contactid,tel,contactType,info,cusid, evt) {
            if (dd.ios) {
                if ($.trim(tel).length == 0) {
                    dd.device.notification.toast({
                        icon: 'error',
                        text: '手机号码为空！',
                        duration: 1,
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                } else {
                    businessCall.phoneCall(contactid, tel, name, info, cusid, contactType, evt);
                    // window.location.href = "tel:" + tel;
                }

            } else {
                if ($.trim(tel).length === 0) {
                    dd.device.notification.toast({
                        icon: 'error',
                        text: '手机号码为空！',
                        duration: 1,
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                } else {
                    businessCall.phoneCall(contactid, tel, name, info, cusid, contactType, evt);
                    // dd.device.notification.confirm({
                    //     message: uname,
                    //     title: "立即呼叫",
                    //     buttonLabels: ['取消', '确定'],
                    //     onSuccess: function(result) {
                    //         if (result.buttonIndex == 1) {
                    //             window.location.href = "tel:" + tel;
                    //         }
                    //     },
                    //     onFail: function(err) {}
                    // });
                }

                stopEventBubble(evt);
            }
        },
        smsCall: function(uname, tel, evt) {
            if (dd.ios) {
                if ($.trim(tel).length == 0) {
                    dd.device.notification.toast({
                        icon: 'error',
                        text: '手机号码为空！',
                        duration: 1,
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                } else {
                    window.location.href = "sms:" + tel;
                }
            } else {
                if ($.trim(tel).length == 0) {
                    dd.device.notification.toast({
                        icon: 'error',
                        text: '手机号码为空！',
                        duration: 1,
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                } else {
                    window.location.href = "sms:" + tel;
                }
                stopEventBubble(evt);
            }
        },
        getUserInfo: function() {
            var getUserInfoApi = oms_config.apiUrl + oms_apiList.getUserInfo;
            $.ajax({
                type: 'POST',
                url: getUserInfoApi,
                data: {
                    'omsuid': JSON.parse(getCookie('omsUser')).id,
                    'token': JSON.parse(getCookie('omsUser')).token,
                    'uid': OMS.id
                },
                cache: false,
                success: function(data) {
                    var response = JSON.parse(data);
                    if (response.res === 1) {
                        OMS.realname = response.data.realname;
                        OMS.telephone = response.data.telephone;
                        OMS.contactid = response.data.id;
                        OMS.info = response.data.path;
                        if(response.data.do == 0)
                        {
                          OMS.do = 0;
                        }else {
                          OMS.do = 2;
                        }

                        if ($.trim(response.data.telephone).length === 0) {
                            $('.getCall').css("color", "#666");
                        }
                        if (dd.ios) {
                            if ($.trim(response.data.telephone).length === 0) {
                                $('.getSMS').css("color", "#666");
                            }
                        }
                        console.log(OMS.telephone);
                        dd.ready(function() {
                            DDCtrl.setTitle(OMS.realname);
                            DDCtrl.setRightBtn(" ", function() {}, false);
                            DDCtrl.setIOSLeftBtn("返回", function() {
                                if (OMS.jumpType == "close")
                                    dd.biz.navigation.close({
                                        onSuccess: function(result) {},
                                        onFail: function(err) {}
                                    });
                                else
                                    history.back(-1);
                            });
                        });
                        // OMS_BILL.setURLQuery({ "state": "basic" });
                        OMS.renderHeader(response.data);

                        OMS.getListData();
                    } else {
                        dd.device.notification.toast({
                            icon: 'error',
                            text: response.msg,
                            duration: 1,
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    }

                }
            })
        },
        init: function() {
            var self = this;
            dd.ready(function() {
                if (dd.ios) {
                    $("#android-tag").remove();
                    $("#ios-tag").show();
                } else {
                    $("#ios-tag").remove();
                    $("#android-tag").show();
                }
            });
            /* 全局事件绑定 */

            window.onhashchange = function(e) {
                self.routeControl({
                    new: OMS_BILL.getURLQuery(e.newURL, "state"),
                    old: OMS_BILL.getURLQuery(e.oldURL, "state")
                });
                e.preventDefault();
            };

            this.getUserInfo();


            /* 角色判断 */
            this.isNew = OMS_BILL.checkRole(this.user.role);
            if (this.isNew === -1) {
                DDCtrl.showAlert("您未获得此权限！");
                if (OMS.jumpType == "close")
                    dd.biz.navigation.close({
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                else
                    window.history.back(-1);
            }

            this.initTabPanel(["ul.tbp-1", "ul.tbp-2"]);

            // this.initSeq();
            // this.initSifter();
            // this.initFilter();
            // this.initSearchPanel();
            // this.initSiftDate();
            // this.initSiftPerson(); //读取本地存储的人员搜索历史记录

            console.log("init finished");

            //判断是否首次进入理单列表（这里首次的定义是，用户打开OMS应用->点击理单列表图标，即为首次）
            //首次 history.length == 2 ，大于2则不为首次，非首次则加载本地搜索配置项设置缓存
            // if (window.history.length > 2) {
            //     var _cfg = window.localStorage.BillingCfg || "{}";
            //     this.updateConfig(JSON.parse(_cfg));
            //     this.setSiftersUI(); //预配置筛选器的UI
            // }
            //name='+name+'&contactid='+id+'&tel='+tel+'&type='+contactType+'&info='+info+'&cusid='+cusid;
            $(".getCall").click(function() {
                OMS.phoneCall(OMS.realname,OMS.contactid,OMS.telephone,'1',OMS.info, '0', event);
            });
            $(".getSMS").click(function() {
                OMS.smsCall(OMS.telephone, OMS.telephone, event);
            });


        }
    };
    var OMS_Controller = {
        removePrefix: function(s) {
            return s.replace("k", "");
        },
        valPeopelCheckbox: function(arr) {
            var a = [];
            $.each(arr, function(i, d) {
                a.push({
                    id: $(d).data("id"),
                    name: $(d).data("name")
                });
            });
            return a;
        },
        valPeopelToSingleCheckbox: function(arr) {
            var a = [];
            $.each(arr, function(i, d) {
                a.push($(d).data("id"));
            });
            return a;
        },
        valItemCheckbox: function(arr) {
            var a = [];
            $.each(arr, function(i, d) {
                if (String($(d).data("value")) !== "-1")
                    a.push($(d).data("value"));
            });
            return a;
        }
    };
    var sendQuest = function(config) {
        var flag = true;
        // dd.ready(function() {
        //     if (flag) {
        //         DDCtrl.showLoading();
        //     }
        // });
        var apiUrl = oms_config.apiUrl + oms_apiList[config.api];
        var sendData = config.data || {};
        sendData.token = OMS.user.token;
        sendData.uid = OMS.user.id;
        sendData.do = OMS.do;
        $.ajax({
            url: apiUrl + "/?_ts=" + new Date().getTime(),
            type: config.type,
            // data: config.isString?JSON.stringify(sendData):sendData,
            data: sendData,
            success: function(response) {
                flag = false;
                // dd.ready(function() {
                //     DDCtrl.hideLoading();
                // });
                if (response) {
                    var result = {
                        res: []
                    };
                    try {
                        result = JSON.parse(response);
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
                // dd.ready(function() {
                //     DDCtrl.hideLoading();
                // });
                DDCtrl.showAlert("网络异常!");
            }
        });
    };
    //免登验证
    $.fn.OMS = function(settings) {
        $.extend(OMS, settings || {});
    };
    $.fn.ready(function() {
        var omsUser = OMS_BILL.getCookie('omsUser');
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
                OMS.user = omsUser;
                OMS.user.id = OMS.id;
                OMS.init();
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

});
