$(function() {
    var version = "1.2";
    var billData = {
            cid: OMS_BILL.getQueryStringByName("cid") || "",
            bid: OMS_BILL.getQueryStringByName("bid") || "",
            do: OMS_BILL.getQueryStringByName("do") || 0,
            user: null,
            hisData: {}
        },
        billCtrl = {
            ajaxflag: false,
            closeExpand: function() {
                DDCtrl.setTitle("回款申报");
                DDCtrl.setRightBtn("确定", billCtrl.submitForm);
                DDCtrl.setIOSLeftBtn("返回", billCtrl.cancle);
                $("#b-expand,#b-expand .active").removeClass("active");
                setTimeout(function() {
                    $("#b-expand .b-group").remove();
                }, 200);
            },
            closeSelector: function() {
                OMS_BILL.setURLQuery({ "state": "basic" });
                DDCtrl.setTitle("回款申报");
                DDCtrl.setRightBtn("确定", billCtrl.submitForm);
                DDCtrl.setIOSLeftBtn("返回", billCtrl.cancle);
                $("#step3-selector,#step3-selector .active").removeClass("active");
            },
            submitDone: function() {},
            submitForm: function() {
                if (billCtrl.ajaxflag) {
                    return;
                }
                $("textarea,input").blur();

                if (!$("input[name='radiogroup-contract']").hasClass('nocontracts')) {
                    if ($("input[name=radiogroup-contract]").val() === "") {
                        DDCtrl.showAlert("合同未选择，请检查!");
                        return;
                    }
                }
                if ($("input[name=datepicker-date]").val() !== "" && $("input[name=textinput-accid]").val() !== "" && $("input[name=textinput-accname]").val() !== "" && Number($("input[name=textinput-total]").val()) > 0) {

                } else {
                    DDCtrl.showAlert("信息未填写完整，请检查!");
                    return false;
                }

                var _s = "";
                $("input[type=tel]").each(function(i, o) {
                    if (!OMS_BILL.inputTest("price", $(o).val())) {
                        _s += ($(o).parent().find("label").text() + " ");
                    }
                });
                if (_s !== "") {
                    DDCtrl.showAlert(_s + "必须为数字!");
                    return false;
                }

                billCtrl.ajaxflag = true;
                OMS_BILL.ajaxPost({
                    api: 'dobillingpayrequest',
                    data: {
                        do: billData.do,
                        bid: billData.bid,
                        contract: $("input[name=radiogroup-contract]").data("value") || "",
                        pay1: $("input[name=textinput-pay1]").val(),
                        pay2: $("input[name=textinput-pay2]").val(),
                        pay3: $("input[name=textinput-pay3]").val(),
                        total: $("input[name=textinput-total]").val(),
                        comments: $("#textarea-comments").val() || " ",
                        accname: $("input[name=textinput-accname]").val(),
                        accid: $("input[name=textinput-accid]").val(),
                        date: $("input[name=datepicker-date]").data("value"),
                        picurl: $("input[name=photopicker-pic]").data("value"),
                        uid: billData.user.id
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
                history.back(-1);
            },
            openExpand: function(data) {
                /* 设置导航 */
                OMS_BILL.setURLQuery({ "state": "gohistory" });
                DDCtrl.setTitle("申报历史");
                DDCtrl.setRightBtn(" ", function() {}, false);
                DDCtrl.setIOSLeftBtn("返回", billCtrl.cancle);

                OMS_BILL.renderTemplate("#tpl-step3-history", data, [{ name: 'priceFormat', func: OMS_BILL.priceFormat }]);


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
                } else if (o.new == "basic" && o.old == "goselector") {
                    billCtrl.closeSelector();
                } else {}
            },
            //MODIFY by lipengfei at 2016/6/25
            uploadQuestionImage: function(e) {
                e.preventDefault();
                // if (!e.target.files) {
                //     return;
                // }

                var $question_item = $("div[data-role='photopicker']");
                if ($question_item.length == 0) {
                    return;
                }

                if ($question_item.hasClass("isloading")) {
                    DDCtrl.showToast("当前上传未结束，请稍后再试!");
                    return;
                }

                if ($question_item.find('img').length >= 5) {
                    DDCtrl.showToast("最多上传5张图片");
                    return;
                }

                // var $file_input = $question_item.find('[type="file"]');
                // if ($file_input.length == 0 || $file_input.val() == '') {
                //     return;
                // }

                function succ(result) {
                    var data = result.data;
                    if (result.res === 1 && data.imgurl) {
                        $question_item.find("#imageUploadGroup").remove();
                        $question_item.append($('<div id="imageUploadGroup"></div>'));
                        $question_item.removeClass("isloading");
                        $question_item.find("input[type=file]").data("value", data.imgurl);

                        $question_item.find("#imageUploadGroup").append($('<img src="' + data.imgurl + '">'));
                    } else {
                        return fail(result.msg);
                    }
                }

                function fail(msg) {
                    $question_item.removeClass("isloading");
                    if (msg == 'ERROR_USER_CANCELLED') {
                        return;
                    }
                    DDCtrl.showToast(msg || "网络错误，上传失败");
                }

                //根据app不同，区分 inputfile 和 jsapi 上传
                if (dd.isDingTalk) {
                    if (e.target.files && e.target.files[0]) {
                        billCtrl._postFileUseInputfile(e.target.files[0], succ, fail);
                    }
                } else {
                    var apiparams = {
                        posturl: oms_config.apiUrl + oms_apiList.uploadImg,
                        name: 'files',
                        params: {
                            omsuid: billData.user.id,
                            token: billData.user.token
                        }
                    };
                    billCtrl._postFileUseJsapi(apiparams, succ, fail);
                }
            },
            //ADD by lipengfei at 2016/6/25
            _postFileUseJsapi: function(params, onsuccess, onfail) {
                var p = $.extend({}, params, {
                    onSuccess: onsuccess,
                    onFail: onfail
                });
                dd.biz.util.uploadImage(p);
            },
            _postFileUseInputfile: function(_file, onsuccess, onfail) {
                var fd = new FormData();
                fd.append('omsuid', billData.user.id);
                fd.append('token', billData.user.token);
                fd.append('files', _file);
                $.ajax({
                    type: 'POST',
                    url: oms_config.apiUrl+oms_apiList.uploadImg,
                    data: fd,
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                    success: onsuccess,
                    error: onfail
                });
            },
            //ADD-END
            getSumResult: function(v1, v2, v3, v4) {
                return (Number(v1) + Number(v2) + Number(v3)).toFixed(2);
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

                if (!data.hasAuto || data.hasAuto == "0") {

                } else {
                    DDCtrl.showAlert("该客户有一笔自动确认的回款，请点击以下历史按钮查看该记录");
                }

                /*  初始化合同列表，如果有数据就打开禁用开关 */
                if (data.contracts || false) {
                    $("div[data-role='radiogroup']").removeClass("disabled");
                    OMS_BILL.renderTemplate("#tpl-radiogroup-contract", { contracts: data.contracts.split(',') });
                } else {
                    $("div[data-role='radiogroup'] input").addClass("nocontracts").attr("placeholder", "无合同数据");
                }


                $("div[data-role='radiogroup']").tap(function() {
                    if ($(this).hasClass("disabled")) {
                        //DDCtrl.showAlert("暂无合同数据");
                        return;
                    }

                    OMS_BILL.setURLQuery({ "state": "goselector" });
                    DDCtrl.setTitle("选择合同");
                    DDCtrl.setRightBtn(" ", function() {}, false);
                    DDCtrl.setIOSLeftBtn("返回", billCtrl.cancle);
                    $("#step3-selector ul[data-bind='" + $(this).data("target") + "']").addClass("active");
                    $("#step3-selector").addClass("active");
                });

                $("div[data-role='datepicker']").tap(function() {
                    var t = $(this);
                    DDCtrl.setDatePicker(new Date().Format("yyyy-MM-dd"), function(d) {
                        $("input[name=" + t.data("target") + "]").data("value", d).val(d);
                    });
                });

                //MODIFY by lipengfei at 2016/6/25
                //根据app, 调整文件上传触发事件
                if (dd.isDingTalk) {
                    $("input[name='photopicker-pic']").change(function(e) {
                        billCtrl.uploadQuestionImage(e);
                    });
                } else {
                    $("a.photopicker-pic-btn").click(function(e){
                        billCtrl.uploadQuestionImage(e);
                    });
                }
                //MODIFY-END

                $("input.calnums").each(function(index, ele) {
                    ele.addEventListener("input", function(e) {
                        var v1 = $("input[name='textinput-pay1']").val() || 0,
                            v2 = $("input[name='textinput-pay2']").val() || 0,
                            v3 = $("input[name='textinput-pay3']").val() || 0;
                        $("input[name='textinput-total']").val(billCtrl.getSumResult(v1, v2, v3));
                    });
                });

                $("#step3-selector .b-selector").each(function(index, item) {
                    var target = $(item).data("bind");
                    $(this).children("li").tap(function() {
                        $(this).addClass("active");
                        $("input[name=" + target + "]").data("value", $(this).data("value")).val($(this).data("label"));
                        setTimeout(function() {
                            billCtrl.closeSelector();
                        }, 200);
                    });
                });

                $("#gohistory").tap(function() {
                    billCtrl.openExpand(billData.hisData);
                });

                OMS_BILL.ajaxPost({
                    api: 'getrequesthistory',
                    data: {
                        do: billData.do,
                        bid: billData.bid
                    },
                    success: function(data) {
                        if (data.error || false) {} else {
                            billData.hisData = data;
                            $("#gohistory").removeClass("dsn");
                        }
                    },
                    error: function() {}
                });
            }
        };

    dd.ready(function() {
        DDCtrl.setTitle("回款申报");
        DDCtrl.setRightBtn("确定", billCtrl.submitForm);
        DDCtrl.setIOSLeftBtn("返回", billCtrl.cancle);
        var loginApi = oms_config.apiUrl + oms_apiList.login;
        new Login(oms_config.corpId, oms_config.baseUrl, loginApi, function() {
            var omsUserJson = OMS_BILL.getCookie('omsUser'),
                omsUser;
            if (omsUserJson) {
                omsUser = JSON.parse(omsUserJson);
                billData.user = omsUser;
                if (omsUser) {
                    OMS_BILL.ajaxPost({
                        api: 'getbillinginfo',
                        data: {
                            do: billData.do,
                            bid: billData.bid,
                            type: "contract",
                            uid: billData.user.id
                        },
                        success: function(data) {
                            $.extend(billData, data.res[0]);
                            billCtrl.init(billData);
                        }
                    });
                }
            }
            if (!omsUser) {
                dd.device.notification.alert({
                    message: '请重新登录',
                    onSuccess: function() {
                        dd.biz.navigation.close();
                    }
                });
            }
        });
    });

});
