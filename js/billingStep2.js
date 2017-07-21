$(function() {
    var billData = {
            cid: OMS_BILL.getQueryStringByName("cid") || "",
            bid: OMS_BILL.getQueryStringByName("bid") || "",
            do: OMS_BILL.getQueryStringByName("do") || 0,
            uid: JSON.parse(OMS_BILL.getCookie("omsUser")).id || 0
        },
        billCtrl = {
            ajaxflag: false,
            closeExpand: function() {
                DDCtrl.setTitle("填报预测");
                DDCtrl.setRightBtn("确定", billCtrl.submitForm);
                DDCtrl.setIOSLeftBtn("返回", billCtrl.cancle);
                $("#b-expand,#b-expand .active").removeClass("active");
                setTimeout(function() {
                    $("#b-expand .b-group").remove();
                }, 200);
            },
            submitDone: function() {},
            submitForm: function() {
                if (billCtrl.ajaxflag) {
                    return;
                }
                $("textarea,input").blur();

                if ($("input[name=textinput-pay]").val() !== "" && $("input[name=datepicker-paytime]").val() !== ""&& $("#textarea-commnets").val() !== "") {

                } else {
                    DDCtrl.showAlert("信息未填写完整，请检查!");
                    return false;
                }

                if (!OMS_BILL.inputTest("price", $("input[name=textinput-pay]").val())) {
                    DDCtrl.showAlert("预计回款金额必须为数字!");
                    return false;
                }
                
                billCtrl.ajaxflag = true;

                OMS_BILL.ajaxPost({
                    api: 'dobillingpredict',
                    data: {
                        do: billData.do,
                        bid: billData.bid,
                        pay: $("input[name=textinput-pay]").val(),
                        date: $("input[name=datepicker-paytime]").val(),
                        comments: $("#textarea-commnets").val() || "",
                        uid: billData.uid
                    },
                    success: function(data) {
                        billCtrl.ajaxflag = false;
                        if (parseInt(data.state) === 0) {
                            DDCtrl.showAlert("提交成功，即将返回客户详情", function() {
                                window.location.href = oms_config.baseUrl + "customerInfo.html?code=" + billData.cid + "&from=lidan&bid=" + billData.bid;
                            });
                        } else {
                            DDCtrl.showAlert("接口提交失败，请联系技术支持！");
                        }
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
            openExpand: function(data) {
                /* 设置导航 */
                OMS_BILL.setURLQuery({ "state": "gohistory" });

                DDCtrl.setTitle("预测历史");
                DDCtrl.setRightBtn(" ", function() {}, false);
                DDCtrl.setIOSLeftBtn("返回", billCtrl.cancle);

                /* 渲染数据列表 */
                OMS_BILL.renderTemplate("#tpl-step2-history", data, [{ name: 'priceFormat', func: OMS_BILL.priceFormat }]);


                /* 显示历史弹层 */
                $("#b-expand").addClass("active");

                new fz.Scroll('.ui-scroller', { scrollY: true });
            },
            routeControl: function(o) {
                /*
                    o.new 新状态
                    o.old 旧状态
                */
                if (o.new == "" && o.old == "basic") {
                    window.history.back(-1);
                } else if (o.new == "basic" && o.old == "gohistory") {
                    billCtrl.closeExpand();
                } else {}
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

                /* 初始化数据注入 */
                $("input[name=textinput-cuname]").val(data.cusName);

                $("div[data-role='datepicker']").tap(function() {
                    var t = $(this);
                    DDCtrl.setDatePicker(new Date().Format("yyyy-MM-dd"), function(d) {
                        $("input[name=" + t.data("target") + "]").data("value", d).val(d);
                    });
                });

                /* 按钮事件绑定 */
                $("#gohistory").tap(function() {
                    DDCtrl.showLoading();
                    OMS_BILL.ajaxPost({
                        api: 'getpredicthistory',
                        data: {
                            do: billData.do,
                            bid: billData.bid
                        },
                        success: function(data) {
                            DDCtrl.hideLoading();
                            if (data.error || false) {
                                DDCtrl.showAlert("暂无预测历史数据");
                            } else {
                                billCtrl.openExpand(data);
                            }
                        },
                        error: function() {
                            DDCtrl.hideLoading();
                        }
                    });
                });
            }
        };

    dd.ready(function() {
        DDCtrl.setTitle("填报预测");
        DDCtrl.setRightBtn("确定", billCtrl.submitForm);
        DDCtrl.setIOSLeftBtn("返回", billCtrl.cancle);
    });
    OMS_BILL.ajaxPost({
        api: 'getbillinginfo',
        data: {
            do: billData.do,
            bid: billData.bid
        },
        success: function(data) {
            $.extend(billData, data.res[0]);
            billCtrl.init(billData);
        }
    });
});
