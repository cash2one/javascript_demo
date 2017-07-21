$(function() {
    FastClick.attach(document.body);
    var version_control = "0.1.5";
    var OMS = {
        isNew: 0,
        role: null,
        user: {},
        pageSize: 20,
        lastSize: 0,
        page: 1,
        _tempData: [],
        presets: {
            seq: {
                "follow": "自动排序-跟进状态",
                "join": "加入时间",
                "score": "智能推荐排序"
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
        stackState: {
            triggerFun: 0,
            section: 0,
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

            $("#filter-panel section.sift li.scroll-sift2").click(function() {
                new fz.Scroll('.sift2.ui-scroller-v', { scrollY: true });
            });
            $("#filter-panel section.sift li.scroll-sift5").click(function() {
                new fz.Scroll('.sift5.ui-scroller-v', { scrollY: true });
            });
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
                if(OMS.myScroll){
                    OMS.myScroll.destroy();
                    OMS.myScroll = null;
                    $("#wrapper").find("#pullDown").remove();
                    $("#wrapper").find("#pullUp").remove();
                }
                OMS.page = 1;
                self.getListData();
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
            $(selectors).off("click").on("click", function(e) {
                console.log(" 按了一下 ");
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

                OMS.page = 1;
                // console.log("确定开始搜索时的配置项：");
                // console.log(self.config);

                self.getListData();
                self.closeFilterPanel();
            });
        },
        initTabsPanel: function() {
            if (this.config.seq !== "follow") {
                return;
            }
            // $("section[data-role=tabs-panel]").unbind('click');
            // $("section[data-role=tabs-panel]").click(function(e) {
            $("section[data-role=tabs-panel]").on('tap', function(e) {
                e.preventDefault();
                if (e.target.className.indexOf("item") >= 0) {
                    return;
                }
                var t = $(this);
                if (t.hasClass("active")) {
                    t.removeClass("active");
                } else {
                    $("section[data-role=tabs-panel]").removeClass("active");
                    $(this).addClass("active");
                    $("#wrapper").find("#pullUp").hide();
                    $("#wrapper").find("#pullDown").hide();

                }
                if(OMS.myScroll){
                    OMS.myScroll.refresh();
                }else{
                  OMS.myScroll = new myIScroll("wrapper");
                }
                e.stopPropagation();
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
                new fz.Scroll('#b-filter', { scrollY: false, scrollX: true });
            } else {
                $("#b-filter").removeClass("activated");
                $("section#list,#bar-total").removeClass("posdown");
            }


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
                new fz.Scroll('#searchList', { scrollY: true });
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
                new fz.Scroll('#searchBillList', { scrollY: true });
            }, 200);
        },
        refreshListRender: function(dt) {
            if(OMS.config.seq == "follow"){
                $("#cuslist>section").remove();
            }else{
                if(OMS.page == 1){
                    $("#cuslist>section").remove();
                }
            }

            //data 重排序
            var data,
                _temp = dt.res || [];
            if(OMS.config.seq == "score" || OMS.config.seq == "join"){
                if(_temp[0] && _temp[0].list !== null){
                    OMS.lastSize = _temp[0].list.length;
                }else{
                    OMS.lastSize = 0;
                }

            }
            if (Object.getOwnPropertyNames(_temp).length > 7) {
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

            if(OMS.config.seq == "score" || OMS.config.seq == "join"){
                if(OMS.page > 1){
                    $('#cus-render-list').append(OMS.renderCusList(_temp));

                }else{
                    OMS_BILL.renderTemplate("#tpl-cuslist", data, [{ name: 'priceFormat', func: OMS_BILL.priceFormat }, { name: 'getFollowType', func: OMS_BILL.getFollowType }]);
                }
            }else{
                OMS_BILL.renderTemplate("#tpl-cuslist", data, [{ name: 'priceFormat', func: OMS_BILL.priceFormat }, { name: 'getFollowType', func: OMS_BILL.getFollowType }]);
            }

            if(OMS.config.seq == "score"){
                //modify: 暂时隐藏
                $('.score-trend').hide();
                // $('.score-trend').show();
            }else {
                $('.score-trend').hide();
            }
            if (OMS.config.seq == "follow") {
                $("#cuslist").removeClass("join").addClass("follow");
            } else {
                $("#cuslist").removeClass("follow").addClass("join");
                $("#cuslist section").addClass("active");
            }
            var tt = 0,
                nn = 0;

            if (OMS.config.seq == 'follow'){
                $.each(data.res, function(index, item) {
                    var m = 0,
                        n = 0;
                    $.each(item.list, function(idx, ele) {
                        m += parseInt(ele.price);
                        n++;
                        if (OMS.config.seq != 'follow'){
                            if(ele.followtype != '0' && ele.followtype != '1'){
                                nn = nn + parseInt(ele.price);
                            }
                        }
                    });
                    var t = $("#cuslist section[data-role=tabs-panel]").eq(index);
                    t.find("span[data-role=paid]").text(OMS_BILL.priceFormat(m));
                    t.find("span[data-role=count]").text(n);
                    tt += m;
                    if (OMS.config.seq == 'follow'){
                      if (item.name !== "已签已回" && item.name !== "待理单") {
                          nn += m;
                      }
                    }
                });
                $("#totalcount").text(OMS_BILL.priceFormat(tt));
                $("#totalsiftcount").text(OMS_BILL.priceFormat(nn));
            }else{
              $("#totalcount").text(OMS_BILL.priceFormat(dt.res.sum.price_sum));
              $("#totalsiftcount").text(OMS_BILL.priceFormat(dt.res.sum.price_loudou_sum));
            }
            $("#bar-total").css("opacity", 1);

            $("#cuslist li").unbind('tap');
            $("#cuslist li").on('tap',function(e) {
                console.log('clickHref');
                OMS.stackState.triggerFun = 0;
                OMS.stackState.section = $("#cuslist section.active").index() - 1;
                OMS.stackState.cid = $(this).data("cid");
                OMS_BILL.openLink(oms_config.baseUrl + "customerInfo.html?code=" + $(this).data("cid") + "&from=lidan&bid=" + $(this).data("bid") + "&jumpType=close", true);

            });
            OMS.initTabsPanel();

            if(OMS.config.seq == "score" || OMS.config.seq == "join"){
                if(OMS.lastSize < OMS.pageSize){
                    $("#wrapper").find("#pullUp").remove();
                }
                if(OMS.myScroll){
                  OMS.myScroll.refresh();
                }
                else if(OMS.lastSize < OMS.pageSize){
                    OMS.myScroll = new myIScroll("wrapper", OMS.refreshData);
                }
                else{
                  OMS.myScroll = new myIScroll("wrapper", OMS.refreshData, OMS.getMoreData);
                }
            }

            // if(OMS.config.seq == "join"){
            //     $("#wrapper").find("#pullUp").hide();
            //     $("#wrapper").find("#pullDown").hide();
            //     if(OMS.myScroll){
            //         OMS.myScroll.refresh();
            //     }else{
            //         OMS.myScroll = new myIScroll("wrapper");
            //     }
            // }

            // stackState:{
            //     triggerFun: 0, // 0：触发主列表，1：触发搜索
            //     section:0,   // 当主列表排序（config.seq）为 follow时，第几个section
            //     cid:0        // 当前点击的cid
            // },
            //$("#cuslist section").eq(OMS.stackState.section).addClass("active");
        },

        renderCusList: function(data){
            var htmlTpl = '';
            console.log('aaa');
            if(data[0] && +data[0].list.length > 0){
                $.each(data[0].list, function(idx, ele){
                    htmlTpl += '<li class="item ui-border-b" data-cid="'+ele.cid+'" data-bid="'+ele.bid+'">';
                    htmlTpl += '<h3 class="title">'
                    htmlTpl += '<span>'+ele.customer+'</span>';
                    if(ele.attention_rate == 1){
                        htmlTpl += '<em class="billing_attention">关注</em>';
                    }
                    if(ele.score_trend == 1){
                        htmlTpl += '<span class="predict_increase score-trend"></span>';
                    }
                    if(ele.score_trend == -1){
                        htmlTpl += '<span class="predict_decrease score-trend"></span>';
                    }
                    htmlTpl += '<div class="price">'+OMS_BILL.priceFormat(ele.price)+'</div>';
                    htmlTpl += '<div class="folltype">'+OMS_BILL.getFollowType(ele.followtype)+'</div>';
                    htmlTpl += '</h3>';
                    htmlTpl += '<p class="para ui-txt-info">';
                    htmlTpl += ele.level1+'级|'+ele.level2+'级';
                    htmlTpl += '<span style="padding-left: 10px">加入时间：'+(ele.create_time?ele.create_time:'暂无')+'</span>'
                    htmlTpl += '</p>'
                    htmlTpl += '<p class="para ui-txt-info">'
                    htmlTpl += ele.structure+'-'+ele.follower;
                    htmlTpl += '</p>'
                    htmlTpl += '</li>'
                })
            }
            return htmlTpl;
        },
        refreshData: function(){
          if(OMS.myScroll){
              $("#wrapper").find("#pullUp").hide();
          }
          OMS.page = 1;
          OMS.getListData();
        },

        getMoreData: function(){
            if(OMS.lastSize < OMS.pageSize)
              return;
            OMS.page++;
      		  OMS.getListData();
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
            if(OMS.config.seq == 'score' || OMS.config.seq == "join"){
                config.data.pager = OMS.page;
            }else{
                OMS.page = 1;
                OMS._tempData = [];
            }

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
            //sendQuest(config);
            var apiUrl = oms_config.apiUrl + oms_apiList[config.api];
            var sendData = config.data || {};
            sendData.token = OMS.user.token;
            sendData.omsuid = OMS.user.id;
            //sendData.do = OMS.isNew;
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
        },
        popRemind:function(res){
            var html = '';
            html += '<div class="pop-box"><div class="pop-container"><ul>';
            $(res.data).each(function(){
                html += '<li data-type="'+this.key+'" data-status="'+this.isSubmit;
                if(dd.ios){
                    html+='" class="iosBorder';
                }
                html += '">'+this.name;
                if(this.isSubmit){
                    html += '<i class="ui-icon-success-block"></i>';
                }
                html += '</li>';
                console.log(html);
            });
            html += '</ul></div><div class="pop-bg"></div></div>';
            $("body").append(html);
            $(".pop-container").css("margin-top", "-"+res.data.length*24+"px");

            $(".pop-box").show();
            $(".pop-bg").bind("click", function(){$(".pop-box").remove();});
            $(".pop-container li").bind("click", function(){
                var url;
                if($(this).attr("data-status") === '0'){
                    if($(this).attr("data-type") !== "review"){
                        url = "billingPaymentPredict.html?page=0&pageType="+$(this).attr("data-type");
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
                //DDCtrl.setRightBtn(" ", function() {}, false);
                DDCtrl.setIOSLeftBtn("返回", function() { history.back(-1) });
                //omsapp-android-setLeft-visible:true
                if (dd.android) {
                    dd.biz.navigation.setLeft({
                        visible: true,
                        control: false,
                        text: ''
                    });
                }

                if(OMS.user.role == 1 || OMS.user.role == 4){
                    // 添加 预测 按钮
                    dd.biz.navigation.setRight({
                        show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
                        control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
                        text: '预测',//控制显示文本，空字符串表示显示默认文本
                        onSuccess : function(result) {
                            self.getFloatList();
                        },
                        onFail : function(err) {}
                    });
                }


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
                        if(OMS.config.seq == 'follow'){
                            self.getListData();
                        }
                    }
                }, false);
                OMS_BILL.setURLQuery({ "state": "basic" });



            });

            /* 角色判断 */
            this.isNew = OMS_BILL.checkRole(this.user.role);
            if (this.isNew === -1) {
                DDCtrl.showAlert("您未获得此权限！");
                window.history.back(-1);
            }

            this.initTabPanel(["ul.tbp-1", "ul.tbp-2"]);
            this.initSeq();
            this.initSifter();
            this.initFilter();
            this.initSearchPanel();
            this.initSiftDate();
            this.initSiftPerson(); //读取本地存储的人员搜索历史记录

            console.log("init finished");


            //判断是否首次进入理单列表（这里首次的定义是，用户打开OMS应用->点击理单列表图标，即为首次）
            //首次 history.length == 2 ，大于2则不为首次，非首次则加载本地搜索配置项设置缓存
            // if (window.history.length > 2) {
            //     var _cfg = window.localStorage.BillingCfg || "{}";
            //     this.updateConfig(JSON.parse(_cfg));
            //     this.setSiftersUI(); //预配置筛选器的UI
            // }
            self.getListData();

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
