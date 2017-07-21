$(function() {
    var version_control = "0.8";
    var billData = {
            cid: OMS_BILL.getQueryStringByName("cid") || "",
            bid: OMS_BILL.getQueryStringByName("bid") || "",
            do: OMS_BILL.getQueryStringByName("do") || 0,
            uid: JSON.parse(OMS_BILL.getCookie("omsUser")).id
        },
        billCtrl = {
            ajaxflag: false,
            closeExpand: function() {
                DDCtrl.setTitle("开始理单");
                DDCtrl.setRightBtn("确定", billCtrl.submitForm);
                DDCtrl.setIOSLeftBtn("返回", billCtrl.cancle);
                $("#b-expand,#b-expand .active").removeClass("active");
            },
            nextbill: function() {
                OMS_BILL.ajaxPost({
                    api: 'getlist',
                    data: {
                        do: OMS.isNew,
                        seqType: "join",
                        siftType: "follow_rec",
                        siftRef: '{"follow_rec":"0"}',
                        uid: billData.uid

                    },
                    success: function(data) {
                        if (data.res.length === 0) {
                            DDCtrl.showAlert("没有更多待理单，请返回继续其他操作");
                            return;
                        }
                        var res = data.res[0].list[0];
                        $.extend(billData, res);
                        billCtrl.loadBillingData();
                    },
                    error: function(err) {
                        DDCtrl.showAlert("获取列表数据失败，请返回理单列表页尝试");
                        console.log(err);
                    }
                });
            },
            loadBillingData: function() {
                OMS_BILL.ajaxPost({
                    api: 'getbillinginfo',
                    data: {
                        do: OMS.isNew,
                        bid: billData.bid
                    },
                    success: function(data) {
                        $.extend(billData, data.res[0]);
                        billCtrl.reInit(billData);
                    }
                });
            },
            submitDone: function() {
                var t = $("#step1-done");
                t.find("h2").text($("input[name=textinput-cuname]").val());
                t.find("h5").text($("input[name=radiogroup-tracestate]").val());
                t.addClass("active");

                DDCtrl.setTitle("理单完成");
                DDCtrl.setRightBtn("再理一单", billCtrl.nextbill);
                DDCtrl.setIOSLeftBtn("完成", billCtrl.cancle);
            },
            submitForm: function() {
                $("textarea,input").blur();

                if (billCtrl.ajaxflag) {
                    return;
                }
                
                if ($("#commnets1").val() !== "" &&$("#commnets2").val() !== "" &&$("#commnets3").val() !== "" && $("input[name=radiogroup-grademgr]").data("value") !== undefined && $("input[name=radiogroup-tracestate]").data("value") !== undefined) {

                } else {
                    DDCtrl.showAlert("信息未填写完整，请检查!");
                    return false;
                }
                if($("input[name=radiogroup-tracestate]").data("value")=="0"){
                    DDCtrl.showAlert("别忘了修改理单状态哦~");
                    return false;
                }

                var comments = "1、" + $("#comments1").val() + "<br>2、" + $("#comments2").val() + "<br>3、" + $("#comments3").val(); 
                    if($.trim(comments).length < 62){
                        DDCtrl.showAlert("所有建议不能少于50字!");
                        return false;					
                }

                billCtrl.ajaxflag = true;

                OMS_BILL.ajaxPost({
                    api: 'dobillingstart',
                    data: {
                        do: OMS.isNew,
                        bid: billData.bid,
                        grade: $("input[name=radiogroup-grademgr]").data("value"),
                        followtype: $("input[name=radiogroup-tracestate]").data("value"),
                        followtime: $("input[name=datepicker-paytime]").data("value"),
                        comments: comments, //$("#textarea-commnets").val() || "",
                        uid: billData.uid
                    },
                    success: function(data) {
                        console.log(data);
                        if (parseInt(data.state) === 0) {
                            billCtrl.submitDone();
                        }
                        billCtrl.ajaxflag = false;
                    },
                    error: function(err) {
                        billCtrl.ajaxflag = false;
                        alert('提交出错');
                        console.log(err);
                    }
                });
            },
            cancle: function() {
                window.history.back(-1);
            },
            routeControl: function(o) {
                /*
                    o.new 新状态
                    o.old 旧状态
                */
                if (o.new == "" && o.old == "basic") {
                    window.history.back(-1);
                } else if (o.new == "basic" && o.old == "goselector") {
                    billCtrl.closeExpand();
                } else {}
            },
            reInit: function(data) {
                dd.ready(function() {
                    DDCtrl.setTitle("开始理单");
                    DDCtrl.setRightBtn("确定", billCtrl.submitForm);
                    DDCtrl.setIOSLeftBtn("取消", billCtrl.cancle);
                });
                billCtrl.ajaxflag = false;
                /* TextInput组件初始化数据注入 */
                $("input[name=textinput-cuname]").val(data.cusName);
                $("input[name=textinput-curlevel]").val(data.level);
                $("input[name=textinput-deadline]").val(data.endDate);
                $("input[name=textinput-counter]").val(data.countDown);
                $("input[name=radiogroup-tracestate]").val(CONSTANT_BILL.FOLLOW_TYPE[data.followtype]).data("value", data.followtype);
                $("#textarea-commnets").val("").attr("placeholder", "请填写跟进建议");
                $("#dp-paytime").show(0);
                $("#step1-done").removeClass("active");
            },
            init: function(data) {
                var self = this;
                /* 全局事件绑定 */
                OMS_BILL.setURLQuery({ "state": "basic" });
                window.onhashchange = function(e) {
                    self.routeControl({
                        new: OMS_BILL.getURLQuery(e.newURL, "state"),
                        old: OMS_BILL.getURLQuery(e.oldURL, "state")
                    });
                    e.preventDefault();
                };

                dd.ready(function() {
                    DDCtrl.setTitle("开始理单");
                    DDCtrl.setRightBtn("确定", billCtrl.submitForm);
                    DDCtrl.setIOSLeftBtn("取消", billCtrl.cancle);
                });

                /* TextInput组件初始化数据注入 */
                $("input[name=textinput-cuname]").val(data.cusName);
                $("input[name=textinput-curlevel]").val(data.level);
                $("input[name=textinput-deadline]").val(data.endDate);
                $("input[name=textinput-counter]").val(data.countDown);
                $("input[name=radiogroup-tracestate]").val(CONSTANT_BILL.FOLLOW_TYPE[data.followtype]).data("value", data.followtype);

                /* RadioButtonGroup 组件初始数据导入 */
                OMS_BILL.renderTemplate("#tpl-radiogroup-grademgr", CONSTANT_BILL);
                OMS_BILL.renderTemplate("#tpl-radiogroup-tracestate", CONSTANT_BILL);

                /* 交互事件注册 */
                /* RadioButtonGroup 组件选项触发 */
                $("div[data-role='radiogroup']").tap(function() {
                    OMS_BILL.setURLQuery({ "state": "goselector" });
                    DDCtrl.setTitle("请选择");
                    DDCtrl.setRightBtn(" ", function() {}, false);
                    DDCtrl.setIOSLeftBtn("返回", billCtrl.cancle);
                    $("#b-expand ul[data-bind='" + $(this).data("target") + "']").addClass("active");
                    $("#b-expand").addClass("active");
                });

                $("div[data-role='datepicker']").tap(function() {
                    var t = $(this);
                    DDCtrl.setDatePicker(new Date().Format("yyyy-MM-dd"), function(d) {
                        $("input[name=" + t.data("target") + "]").data("value", d).val(d);
                    });
                });

                $("#b-expand .b-selector").each(function(index, item) {
                    var target = $(item).data("bind");
                    $(this).children("li").tap(function() {
                        $(this).addClass("active");
                        $("input[name=" + target + "]").data("value", $(this).data("value")).val($(this).data("label"));
                        if ($(this).data("value") == "5") {
                            $("#textarea-commnets").attr("placeholder", "请填写不续费原因");
                            $("#dp-paytime").hide(0);
                        } else {
                            $("#textarea-commnets").attr("placeholder", "请填写跟进建议");
                            $("#dp-paytime").show(0);
                        }

                        setTimeout(function() {
                            billCtrl.cancle();
                        }, 200);
                    });
                });

                /* 完成“开始理单”后 绑定下一步操作 */
                $("button[data-op=step1done]").tap(function() {
                    var s = $(this).data("target") === "predict" ? "billingStep2.html" : "billingStep3.html";
                    window.location.href = DDCtrl.navWithColor(s + "?do=1&cid=" + billData.cid + "&bid=" + billData.bid, "FF42AAB3");
                });
            }
        },
        OMS = {
            isNew:0,
            user:{},
            init: function() {
                this.isNew = OMS_BILL.checkRole(this.user.role);
                OMS_BILL.ajaxPost({
                    api: 'getbillinginfo',
                    data: {
                        do: OMS.isNew,
                        bid: billData.bid
                    },
                    success: function(data) {
                        $.extend(billData, data.res[0]);
                        billCtrl.init(billData);
                    }
                });
            }
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
