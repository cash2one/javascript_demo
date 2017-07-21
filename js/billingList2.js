$(function() {
    FastClick.attach(document.body);
    var version_control = "0.0.7";
    var OMS = {
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
        pagination: {
            interval: 8
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
        stackState: {
            triggerFun: 0,
            section: -1,
            cid: 0
        },
        updateConfig: function(data) {
            $.extend(this.config, data);
            //window.localStorage.BillingCfg = JSON.stringify(this.config);
        },
        updateRencentContact: function() {
            window.localStorage.filterBillingStaff = JSON.stringify(OMS.config.recent_contact);
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
                                OMS.scrollers.scperson = new fz.Scroll('#siftListPerson', { scrollY: true });
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
        },
        initSeq: function() {
            var self = this;
            $("#listNav section.seq li").tap(function() {
                var A = "activated";
                $(this).addClass(A).siblings().removeClass(A);
                var li = $("#listNav li[data-target=seq]");
                li.children("span").text($(this).children('p').data("label"));
                li.removeClass(A);
                $("#listNav section.seq").removeClass(A);
                self.closeFilterPanel();
                self.updateConfig({ "seq": $(this).data("value") });
                self.getListData(1, OMS.pagination.interval);
            });
        },
        initSifter: function() {
            OMS_BILL.renderTemplate("#tpl-contact-state", OMS.presets);
            OMS_BILL.renderTemplate("#tpl-grade-mgr", OMS.presets);
            OMS_BILL.renderTemplate("#tpl-grade-staff", OMS.presets);
            OMS_BILL.renderTemplate("#tpl-follow-rec", OMS.presets, [{ name: 'removePrefix', func: OMS_Controller['removePrefix'] }]);
            OMS_BILL.renderTemplate("#tpl-follow-time", OMS.presets);
            OMS_BILL.renderTemplate("#tpl-filter-repeater", OMS.config);
            this.initSifterEvent("section.sift section .ui-list li");
        },
        initSifterEvent: function(selectors) {
            $(selectors).tap(function(e) {
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
                    setTimeout(function() {
                        OMS.refreshFilterLabel({
                            target: t.data("sort"),
                            flag: 1
                        });
                    }, 500);
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
        initFilter: function() {
            var self = this;
            $("#btnResetFilter").click(function(e) {
                $("section.sift .sub-panel input[type=checkbox],section.sift input[type=radio]").prop("checked", false);
                $("section.sift .sub-panel input[name*=clear]").prop("checked", true)
                $("section.sift .sub-panel input[type=text]").val("");
                $("#b-filter ul li").remove();
                $("#b-filter").removeClass("activated");
                $("section#list,#bar-total").removeClass("posdown");
                self.config.sift = {
                    "follower": [],
                    "follow_time": "",
                    "contact_state": [],
                    "grade_staff": [],
                    "grade_manager": [],
                    "follow_rec": []
                };
                e.stopPropagation();
                e.preventDefault();
                return false;
            });
            $("#btnConfirmFilter").tap(function() {
                var s = "",
                    date_flag = $("section.sift6").find("input[type=radio]:checked").data("value");
                if (date_flag == "range") {
                    var d1 = $("#datepicker-group input[name=start-time]").val(),
                        d2 = $("#datepicker-group input[name=end-time]").val();
                    if (d1 !== "" && d2 !== "") {
                        s = d1 + "," + d2;
                    } else {
                        s = "";
                        $("section.sift6").find("input[type=radio]:checked").prop("checked", false);
                        $("section.sift6").find("input[name='sift6-clear']").prop("checked", true);
                    }

                } else if (String(date_flag) === "-1") {
                    s = "";
                } else {
                    s = date_flag;
                }
                self.updateConfig({
                    "sift": {
                        "follower": OMS_Controller.valPeopelToSingleCheckbox($("section.sift1").find("input:checked")),
                        "follow_time": s,
                        "contact_state": OMS_Controller.valItemCheckbox($("section.sift2").find("input:checked")),
                        "grade_staff": OMS_Controller.valItemCheckbox($("section.sift3").find("input:checked")),
                        "grade_manager": OMS_Controller.valItemCheckbox($("section.sift4").find("input:checked")),
                        "follow_rec": OMS_Controller.valItemCheckbox($("section.sift5").find("input:checked"))
                    }
                });

                // console.log("确定开始搜索时的配置项：");
                // console.log(self.config);

                self.getListData(1, OMS.pagination.interval);
                self.closeFilterPanel();
            });
        },
        scrollBillingHandler: function() {
            var n = this.y >> 0;
            if (this.maxScrollY + 20 >= n && this.scrollable) {
                this.scrollable = false;
                OMS.getListPageData(this);
            }
        },
        initTabsPanel: function() {
            if (this.config.seq !== "follow") {
                $("#wrapperSection").addClass("opened");

                var isc = new IScroll("#wrapperSection", {
                    probeType: 3,
                    mouseWheel: false,
                    scrollbars: false,
                    preventDefault: false,
                    click: true,
                    tap: true
                });
                isc.on('scroll', OMS.scrollBillingHandler);
                isc.scrollable = true;
                isc.page = 1;
                isc.size = OMS.pagination.interval;
                isc.total = parseInt($("#wrapperSection").data("total"));
                setTimeout(function() {
                    isc.refresh();
                }, 0);
                return;
            }
            $("section[data-role=tabs-panel]").each(function(idx, ele) {
                var t = $(ele);
                t.children("h2").click(function(e) {
                    if (t.hasClass("active")) {
                        t.addClass("animated zoomOutDown");
                        setTimeout(function() {
                            t.removeClass("zoomOutDown animated active opened posdown");
                        }, 600);

                    } else {
                        var temp = "";
                        if ($("#b-filter").hasClass("activated")) {
                            temp = "posdown";
                        }
                        t.addClass("active opened animated zoomInUp" + " " + temp);
                        setTimeout(function() {
                            t.removeClass("animated zoomInUp");
                        }, 600);

                        if (!t.hasClass("inited")) {
                            t.addClass("inited");
                            var isc = new IScroll("#wrapperSection" + t.data("followtype"), {
                                probeType: 3,
                                mouseWheel: false,
                                scrollbars: false,
                                preventDefault: false,
                                click: true,
                                tap: true
                            });
                            isc.on('scroll', OMS.scrollBillingHandler);
                            isc.scrollable = true;
                            isc.page = 1;
                            isc.size = OMS.pagination.interval;
                            isc.total = parseInt(t.find("div.list-wrapper").data("total"));
                            setTimeout(function() {
                                isc.refresh();
                            }, 0);
                        }
                    }
                });
            });

            $("#btnTabSearch").click(function(e) {

                dd.ready(function() {
                    DDCtrl.setRightBtn(" ", function() {}, false);
                    DDCtrl.setIOSLeftBtn("返回", function() {
                        window.history.back();
                    });
                });

                var t = $("#searchBill");
                t.addClass("activated");
                t.find('.ui-searchbar-input input').focus();
            })
        },
        initSearchPanel: function() {
            var self = this;
            $("#btnSearchEmployee").tap(function(e) {
                $("#searchEmp").addClass("activated");
                OMS_BILL.setURLQuery({ "state": "searchTool" });

                dd.ready(function() {
                    DDCtrl.setRightBtn(" ", function() {}, false);
                    DDCtrl.setIOSLeftBtn("返回", function() {
                        history.back(-1);
                    });
                });

                var t = $("#searchEmp");
                t.find('.ui-searchbar-input input').focus();

                e.preventDefault();
            });


            $('#searchEmp .ui-searchbar-cancel').click(function(e) {
                window.history.back(-1);
                e.preventDefault();
            });
            $('#searchBill .ui-searchbar-cancel').click(function(e) {
                $("#searchBill").removeClass("activated");
                e.preventDefault();
            });

            $('.ui-searchbar i.ui-icon-close').tap(function() {
                $(this).parent().find("input").val("");
            });

            $('#form-search-person').submit(function(e) {
                e.preventDefault(e);
                $("#searchEmp").find('.ui-searchbar-input input').blur();
                self.getSearchPersonData($(this).find("input").val());
            });

            $('#form-search-bill').submit(function(e) {
                e.preventDefault(e);
                $("#searchBill").find('.ui-searchbar-input input').blur();
                self.getSearchBillData($(this).find("input").val());

            });
            $(".ui-searchbar-input").keydown(function(e) {
                if (String(e.keyCode) === "13") {
                    $(this).closest("form").trigger("submit");
                    e.preventDefault();
                }
            });
            $('#choosePerson').tap(function() {
                var t = $('#searchList');
                OMS.config.recent_contact = OMS_Controller.valPeopelCheckbox(t.find("input:checked"));

                OMS.refreshSiftPerson(true);

                OMS.updateRencentContact();

                history.back(-1);
                $("#searchList>ul>li").remove();
                $('#form-search-person').find("input").val("");
            });
        },
        initSiftDate: function() {
            $("#datepicker-group input").tap(function() {
                var t = $(this);
                DDCtrl.setDatePicker(new Date().Format("yyyy-MM-dd"), function(d) {
                    t.val(d);
                    t.addClass("inited");
                    $("section.sift6 li[data-value='range'] input[name=follow-time]").prop("checked", true);
                    OMS.checkSiftDate();
                });
            });
        },
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
                        flag: 1,
                        target: "sift6"
                    });
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
        initSiftPerson: function() {
            var r = window.localStorage.filterBillingStaff;
            if (r) {
                this.config.recent_contact = JSON.parse(r);
                this.refreshSiftPerson(false);
            }
        },
        setSiftersUI: function() {
            var c = this.config,
                a = "activated",
                seq = $("section.seq>ul>li"),
                sift6 = $("section.sift6"),
                dp = $("#datepicker-group input"),
                nav = $("#listNav>ul>li[data-target=seq] span"),
                arr = [];
            if (c.seq === "follow") {
                seq.eq(0).addClass(a);
                nav.text("跟进状态");
            } else {
                seq.eq(1).addClass(a);
                nav.text("加入时间");
            }

            if (c.sift["follow_time"] !== "") {
                sift6.find("li.clear-all input").prop("checked", false);
                switch (c.sift["follow_time"]) {
                    case "week":
                        sift6.find("li[data-value=week] input").prop("checked", true);
                        break;
                    case "month":
                        sift6.find("li[data-value=month] input").prop("checked", true);
                        break;
                    default:
                        sift6.find("li[data-value=range]").prop("checked", true);
                        var g = c.sift["follow_time"] || ["", ""];
                        dp.eq(0).val(g[0]);
                        dp.eq(1).val(g[1]);

                }
                OMS.checkSiftDate();
            }
            arr = c.sift["contact_state"];
            if (arr.length !== 0) {
                $("section.sift2>ul>li.clear-all input").prop("checked", false);
                for (var key in arr) {
                    var $t = $("section.sift2>ul>li[data-value='" + arr[key] + "']"),
                        cls = $t.data("sort") + $t.data("value");
                    $t.find("input").prop("checked", true);
                    OMS.refreshFilterLabel({
                        flag: 0,
                        target: cls,
                        res: {
                            className: cls,
                            label: $t.data("label"),
                            key: $t.data("key")
                        }
                    });
                }
            }
            arr = c.sift["grade_staff"];
            if (arr.length !== 0) {
                $("section.sift3>ul>li.clear-all input").prop("checked", false);
                for (var key in arr) {
                    var $t = $("section.sift3>ul>li[data-value='" + arr[key] + "']"),
                        cls = $t.data("sort") + $t.data("value");
                    $t.find("input").prop("checked", true);
                    OMS.refreshFilterLabel({
                        flag: 0,
                        target: cls,
                        res: {
                            className: cls,
                            label: $t.data("label"),
                            key: $t.data("key")
                        }
                    });
                }
            }
            arr = c.sift["grade_manager"];
            if (arr.length !== 0) {
                $("section.sift4>ul>li.clear-all input").prop("checked", false);
                for (var key in arr) {
                    var $t = $("section.sift4>ul>li[data-value='" + arr[key] + "']"),
                        cls = $t.data("sort") + $t.data("value");
                    $t.find("input").prop("checked", true);
                    OMS.refreshFilterLabel({
                        flag: 0,
                        target: cls,
                        res: {
                            className: cls,
                            label: $t.data("label"),
                            key: $t.data("key")
                        }
                    });
                }

            }
            arr = c.sift["follow_rec"];
            if (arr.length !== 0) {
                $("section.sift5>ul>li.clear-all input").prop("checked", false);
                for (var key in arr) {
                    var $t = $("section.sift5>ul>li[data-value='" + arr[key] + "']"),
                        cls = $t.data("sort") + $t.data("value");
                    $t.find("input").prop("checked", true);
                    OMS.refreshFilterLabel({
                        flag: 0,
                        target: cls,
                        res: {
                            className: cls,
                            label: $t.data("label"),
                            key: $t.data("key")
                        }
                    });
                }
            }

            // var s = c.sift["follow_rec"];
            // if(arr.length !== 0){

            //     for(var key in arr){
            //         $("section.sift5>ul>li[data-value='"+arr[key]+"'] input").prop("checked",true);
            //     }
            // }

        },
        refreshFilterLabel: function(cfg) {
            /*
                cfg.flag 0:添加 1: 删除
                cfg.target 目标className
                cfg.res  { className: sort与value 拼接的类名，label: 筛选类型名称 ， key: 筛选项的名称}
            */

            if (cfg.flag === 0) {
                OMS_BILL.renderTemplate("#tpl-filter-repeater", { data: [cfg.res] });
            } else {
                $("#b-filter ul li[class*=" + cfg.target + "]").remove();
            }

            if ($("#b-filter ul li").length > 0) {
                $("#b-filter").addClass("activated");
                $("section#list,#bar-total").addClass("posdown");
                var d = 0,
                    ul = $("#b-filter>ul");
                $("#b-filter>ul li").each(function(index, item) {
                    d += $(item).width();
                    d += 12;
                });
                ul.width(d);
                var scrlb = new fz.Scroll('#b-filter', { scrollY: false, scrollX: true });
            } else {
                $("#b-filter").removeClass("activated");
                $("section#list,#bar-total").removeClass("posdown");
            }


        },
        refreshSummary: function(data) {
            var mm = 0,
                tt = 0;
            $.each(data.retData, function(index, item) {
                var t = $("#cuslist section.followtype" + item.followtype);
                t.find("span[data-role=paid]").text(OMS_BILL.priceFormat(item.cost));
                t.find("span[data-role=count]").text(item.amount);
                if (String(item.followtype) !== "0" && String(item.followtype) !== "1") {
                    mm += parseInt(item.cost);
                }
                tt += parseInt(item.cost);
            });
            $("#totalcount").text(OMS_BILL.priceFormat(tt));
            $("#totalsiftcount").text(OMS_BILL.priceFormat(mm));
            $("#bar-total").css("opacity", 1);
        },
        refreshSiftPerson: function(flag) {
            /* flag 0:选中, 1:不选 初始化列表数据的checkbox */
            //$("#siftListPerson>ul>li").remove();
            var $html = OMS_BILL.renderTemplate("#tpl-sift-person", { res: OMS.config.recent_contact });
            $html.find("input").prop("checked", flag || false);
            OMS.initSifterEvent("#siftListPerson .ui-list li");
            if (flag || false) {
                if (OMS.config.recent_contact.length > 0) {
                    $.each(OMS.config.recent_contact, function(index, item) {
                        OMS.refreshFilterLabel({
                            flag: 0,
                            target: "person" + item.id,
                            res: {
                                className: "person" + item.id,
                                label: "跟进人",
                                key: item.name
                            }
                        });
                    });
                }
            }
            setTimeout(function() {
                OMS.scrollers.scperson = new fz.Scroll('#siftListPerson', { scrollY: true });
            }, 300);
        },
        closeFilterPanel: function() {
            $("#listNav,#listNav>ul.b-bar>li.activated,#filter-panel>section[data-role=panel]").removeClass("activated");
        },
        refreshSearchPersonRender: function(data) {
            var res = data.res || [];
            $("#searchEmp .search-tip").hide();
            $("#searchList>ul>li").remove();
            if (res.length === 0) {
                $("#searchEmp .search-tip").text("未找到您查询的跟进人").show();
                return;
            }
            var html = OMS_BILL.renderTemplate("#tpl-search-person", data);
            $(html).click(function() {
                var t = $(this).find("input");
                t.prop('checked', !t.prop('checked'));
            });
            setTimeout(function() {
                var scrSearch = new fz.Scroll('#searchList', { scrollY: true });
            }, 200);
        },
        refreshSearchBillRender: function(data) {
            var res = data.res || [];
            $("#searchBill .search-tip").hide();
            $("#searchBillList>ul section").remove();
            if (res.length === 0) {
                $("#searchBill .search-tip").text("未找到您查询的客户").show();
                return;
            }
            OMS_BILL.renderTemplate("#tpl-search-bill", data);
            $("#searchBillList .cuslist li").click(function(e) {

                OMS.stackState.triggerFun = 1;
                OMS.stackState.cid = $(this).data("cid");

                OMS_BILL.openLink(oms_config.baseUrl + "customerInfo.html?code=" + $(this).data("cid") + "&from=lidan&bid=" + $(this).data("bid") + "&jumpType=close", true);

            });
            setTimeout(function() {
                var scrBill = new fz.Scroll('#searchBillList', { scrollY: true });
            }, 200);
        },
        refreshListRender: function(dt) {
            $("#cuslist>section").remove();

            //data 重排序 
            var data,
                _temp = dt.res || [];



            if (Object.getOwnPropertyNames(_temp).length > 6) {
                data = {
                    res: {
                        0: $.extend(dt.res[0], { followtype: 0 }),
                        1: $.extend(dt.res[1], { followtype: 1 }),
                        2: $.extend(dt.res[6], { followtype: 6 }),
                        3: $.extend(dt.res[2], { followtype: 2 }),
                        4: $.extend(dt.res[3], { followtype: 3 }),
                        5: $.extend(dt.res[4], { followtype: 4 }),
                        6: $.extend(dt.res[5], { followtype: 5 })
                    }
                };
            } else {
                data = dt;
            }


            var html = OMS_BILL.renderTemplate("#tpl-cuslist", data, [{ name: 'priceFormat', func: OMS_BILL.priceFormat }, { name: 'getFollowType', func: OMS_BILL.getFollowType }]);
            if (OMS.config.seq == "follow") {
                $("#cuslist").removeClass("join").addClass("follow");
            } else {
                $("#cuslist").removeClass("follow").addClass("join");
                $("#cuslist section").addClass("active");
            }

            $(html).find("li.item").click(function(e) {

                if ($(this).hasClass("triggered")) {
                    setTimeout(function() {
                        $(this).removeClass("triggered");
                    }, 500);
                } else {
                    $(this).addClass("triggered");
                    OMS.stackState.triggerFun = 0;
                    OMS.stackState.section = $("#cuslist section.active").index() - 1;
                    OMS.stackState.cid = $(this).data("cid");
                    OMS_BILL.openLink(oms_config.baseUrl + "customerInfo.html?code=" + $(this).data("cid") + "&from=lidan&bid=" + $(this).data("bid") + "&jumpType=close", true);
                }

            });
            OMS.initTabsPanel();


            OMS.getSummaryData();

            // stackState:{
            //     triggerFun: 0, // 0：触发主列表，1：触发搜索
            //     section:0,   // 当主列表排序（config.seq）为 follow时，第几个section
            //     cid:0        // 当前点击的cid
            // },
            var classtemp = "active";
            if (OMS.config.seq == "follow" && OMS.stackState.section !== -1) {
                $("#cuslist section").eq(OMS.stackState.section).children("h2").trigger("click");
            }
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
        getSummaryData: function() {
            var config = {};
            config.api = 'getsummary';
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
            config.callback = this.refreshSummary;
            sendQuest(config);
        },
        getListPageData: function(self) {
            if (self.page === self.total) {
                return;
            }
            self.page += 1;
            var list = $("#" + self.wrapper.id);

            // console.log("请求发送前:");
            // console.log(list);

            var config = {};
            config.api = 'getlist2';
            config.type = 'post';

            var o = this.config.sift;
            var ref = {};

            ref.follow_time = o.follow_time;
            ref.follower = o.follower.join(',');
            ref.grade_manager = o.grade_manager.join(',');
            ref.grade_staff = o.grade_staff.join(',');
            ref.follow_rec = list.data("followtype");
            ref.contact_state = o.contact_state.join(',');

            config.data = {
                seqType: this.config.seq,
                siftType: "follower,follow_time,contact_state,grade_staff,grade_manager,follow_rec",
                siftRef: JSON.stringify(ref),
                page: self.page || 1,
                size: self.size || 8
            };
            config.callback = function(data) {
                self.scrollable = true;
                OMS.refreshListPageRender(data, self);
            };
            sendQuest(config);
        },
        refreshListPageRender: function(data, self) {
            var list = $("#" + self.wrapper.id);

            var tpl = '<li class="item ui-border-b" data-cid="${item.cid}" data-bid="${item.bid}">' + '<h3 class="title">' + '<span>${item.customer}</span>' + '<div class="price">${item.price|priceFormat}</div>' + '<div class="folltype">${item.followtype|getFollowType}</div>' + '</h3>' + '<p class="para ui-txt-info">' + '${item.level1}级&nbsp;|&nbsp;${item.level2}级' + '</p>' + '<p class="para ui-txt-info">' + '${item.structure}-${item.follower}' + '</p>' + '</li>';

            var compiled_tpl = juicer(tpl);
            // juicer.register(ele.name, ele.func);
            var u = list.children("ul");
            $.each(data.res[list.data('followtype') || 0].list, function(idx, ele) {
                var $this = $(compiled_tpl.render({ item: ele }));
                u.append($this);
                $this.on("click", function() {
                    if ($(this).hasClass("triggered")) {
                        setTimeout(function() {
                            $(this).removeClass("triggered");
                        }, 500);
                    } else {
                        $(this).addClass("triggered");
                        OMS_BILL.openLink(oms_config.baseUrl + "customerInfo.html?code=" + $(this).data("cid") + "&from=lidan&bid=" + $(this).data("bid") + "&jumpType=close", true);
                    }

                });
            });

            setTimeout(function() {
                self.refresh();
            }, 50);
        },
        getListData: function(page, size) {
            var config = {};
            config.api = 'getlist2';
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
                siftRef: JSON.stringify(ref),
                page: page || 1,
                size: size || 5
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
                window.history.back(-1);
            } else if (o.new == "basic" && o.old == "searchTool") {
                $("#searchBill").removeClass("activated");
                $("#searchEmp").removeClass("activated");
                DDCtrl.setTitle("理单列表");
                DDCtrl.setRightBtn(" ", function() {}, false);
                DDCtrl.setIOSLeftBtn("返回", function() { history.back(-1) });
            } else {}
        },
        getFloatList:function(){
            var config = {};
            config.api = 'getPredictMenuList';
            config.type = 'post';


            config.data = {};
            config.callback = this.popRemind;
            sendQuest(config);
        }
        popRemind:function(res){
            var html = '';
            popFloatList();
            $(res.data).each(function(){
                html += '<li data-type="'+this.key+'" data-status="'+this.isSubmit+'">'+this.name+'</li>';
            });
            $(".pop-container ul").append(html);
            $(".pop-box").show();
            $(".pop-bg").bind("click", function(){$(".pop-box").hide();});
            $(".pop-container li").bind("click", function(){
                var url;
                if($(this).attr("data-status") === '0'){
                    if($(this).attr("data-type")){
                        url = "billingPaymentPridict.html?page=0&pageType="+$(this).attr("data-type");
                    }else{
                        url = "billingDataSubmit.html?page=1";
                    }
                    openLink(url); 
                }else{
                    return;
                }
                                       
            });
        },
        init: function() {
            var self = this;

            /* 全局事件绑定 */

            window.onhashchange = function(e) {
                self.routeControl({
                    new: OMS_BILL.getURLQuery(e.newURL, "state"),
                    old: OMS_BILL.getURLQuery(e.oldURL, "state")
                });
                e.preventDefault();
            };


            dd.ready(function() {
                DDCtrl.setTitle("理单列表");
                DDCtrl.setRightBtn(" ", function() {}, false);
                DDCtrl.setIOSLeftBtn("返回", function() { history.back(-1) });

                document.addEventListener('resume', function(e) {
                    e.preventDefault();
                    // stackState:{
                    //     triggerFun: 0, // 0：触发主列表，1：触发搜索
                    //     section:0,   // 当主列表排序（config.seq）为 follow时，第几个section
                    //     cid:0        // 当前点击的cid
                    // },
                    var ss = self.stackState;
                    if (ss.triggerFun === 1) {
                        self.getSearchBillData();
                    } else {
                        self.getListData(1, OMS.pagination.interval);
                    }

                }, false);
                OMS_BILL.setURLQuery({ "state": "basic" });

                // 添加 预测 按钮
                dd.biz.navigation.setRight({
                    show: false,//控制按钮显示， true 显示， false 隐藏， 默认true
                    control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
                    text: '预测',//控制显示文本，空字符串表示显示默认文本
                    onSuccess : function(result) {
                        popRemind();
                    },
                    onFail : function(err) {}
                });
            });

            /* 角色判断 */
            this.isNew = OMS_BILL.checkRole(this.user.role);
            if (this.isNew === -1) {
                DDCtrl.showAlert("您未获得此权限！", function() {
                    window.history.back(-1);
                });
            }

            this.initTabPanel(["ul.tbp-1", "ul.tbp-2"]);

            this.initSeq();
            this.initSifter();
            this.initFilter();
            this.initSearchPanel();
            this.initSiftDate();
            this.initSiftPerson(); //读取本地存储的人员搜索历史记录

            var scr1 = new fz.Scroll('.sift5.ui-scroller-v', { scrollY: true });
            var scr2 = new fz.Scroll('.sift2.ui-scroller-v', { scrollY: true });

            console.log("init finished");

            self.getListData(1, OMS.pagination.interval);

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
        var apiUrl = oms_config.apiUrl + oms_apiList[config.api];
        var sendData = config.data || {};
        sendData.token = OMS.user.token;
        sendData.uid = OMS.user.id;
        sendData.do = OMS.isNew;
        $("#loadingPanel").addClass("show");
        $.ajax({
            url: apiUrl + "/?_ts=" + new Date().getTime(),
            type: config.type,
            data: sendData,
            success: function(response) {
                $("#loadingPanel").removeClass("show");
                if (response) {
                    var result = { res: [] };
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
                $("#loadingPanel").removeClass("show");
                DDCtrl.showAlert("网络异常!");
            }
        });
    };
    //OMS.init();
    //免登验证
    $.fn.OMS = function(settings) { $.extend(OMS, settings || {}); };
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
