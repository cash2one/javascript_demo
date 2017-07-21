var __$$vipPayVersion = 1;

var vipPay = {
    _token: getUrlParam('_token') || '',
    _c: getUrlParam('_c') || '',
    timer: '',
    length: '',
    _f: getUrlParam('_f') || '',
    _u: getUrlParam('_u') || '',
    errorDisplay: function(data){
        // alert('1');
        $('#error_area').text(data);
        $('#error_info').dialog('show');
    },
    checkCustomer:function(){
        var checkSingleCustomerStatusApi = oms_config.apiUrl + oms_apiList.checkSingleCustomerStatus;
        $.ajax({
            type: 'POST',
            url: checkSingleCustomerStatusApi,
            data: {
                'customerid': vipPay._u,
                'contentid': vipPay._c
            },
            cache: false,
            success: function(data){
                var response = JSON.parse(data);
                if(response.res == 5){
                    vipPay.initHtml(response.data);
                    $('#step_4').show();
                    $('#vip-share-block').hide();
                    vipPay.errorDisplay('十分抱歉，服务开通失败，请联系客服人员解决：400-8313-070');
                    vipPay.customerid  = response.data.customerid;
                    vipPay.entname = response.data.entname;
                    vipPay.openmonths = response.data.openmonths;
                    $('#step-4-info').append('<div class="vip-sp4-ast3">企业：'+response.data.entname+'</div><div class="vip-sp4-ast4">开通时长： '+response.data.openmonths+'个月</div>');
                }
                if(response.res == 6){
                    vipPay.initHtml(response.data);
                    $('#step_4').show();
                    $('#vip-share-block').hide();
                    vipPay.customerid  = response.data.customerid;
                    vipPay.entname = response.data.entname;
                    vipPay.openmonths = response.data.openmonths;
                    $('#step-4-info').append('<div class="vip-sp4-ast3">企业：'+response.data.entname+'</div><div class="vip-sp4-ast4">开通时长： '+response.data.openmonths+'个月</div>');
                }
                if(response.res == 7){
                    vipPay.initHtml(response.data);
                    $('#step_4').show();
                    $('#vip-share-block').hide();
                    vipPay.errorDisplay('您的企业已购买过正式服务，请勿重复购买，祝您使用愉快！');
                    vipPay.customerid  = response.data.customerid;
                    vipPay.entname = response.data.entname;
                    vipPay.openmonths = response.data.openmonths;
                    $('#step-4-info').append('<div class="vip-sp4-ast3">企业：'+response.data.entname+'</div>');
                }
                // else {
                //     vipPay.errorDisplay(response.msg);
                // }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        });
    },
    getShareContent: function(){
        if(vipPay._f == 'pay'){
            vipPay.checkCustomer();
        }else {
            var getShareContentApi = oms_config.apiUrl + oms_apiList.getShareContent;
            $.ajax({
                type: 'POST',
                url: getShareContentApi,
                data: {
                    'token': vipPay._token,
                    'contentid': vipPay._c
                },
                cache: false,
                success: function(data){
                    var response = JSON.parse(data);
                    if(response.res == 1){
                        vipPay.initHtml(response.data);
                        $('#step_1').show();
                    }
                    if(response.res == 0) {
                        vipPay.errorDisplay(response.msg);
                    }
                },
                error: function(xhr, type) {
                    console.log('ajax error!');
                }
            });
        }

    },
    initHtml: function(data) {
        $('#vip-share-block').show();
        $("#vip_pay_content").prepend('<h4 class="vip-pay-content-title">来自'+data.username+'的分享</h4><div class="vip-pay-content-main"><span class="vip-quote">“</span>'+data.content+'<span class="vip-quote">”</span></div>');
        vipPay.qrMainEventListener();
    },


    qrMainEventListener: function() {
        $('#next').click(function(){
            vipPay.submitPhone();
        });

        $('#step2_finish').click(function(){
            console.log(111);
            vipPay.saveCustomrInfo();
        });
    },

    submitPhone: function(){
        var addPhoneCustomerApi = oms_config.apiUrl + oms_apiList.addPhoneCustomer;
        var phone_number = $.trim($("#phone").val());
        var autoCode = $.trim($("#authCode").val());
        vipPay.checkPhoneValid(phone_number);
        if (!vipPay.isPhoneSubmitted) {
            vipPay.isPhoneSubmitted = true;
            $.ajax({
                type: 'POST',
                url: addPhoneCustomerApi,
                data: {
                    'phone': phone_number,
                    'code': autoCode,
                    'contentid': vipPay._c
                },
                cache: false,
                success: function(data){
                    vipPay.isPhoneSubmitted = false;
                    var response = JSON.parse(data);
                    if(response.res == 1 || response.res == 2){
                        $('#step_1').hide();
                        $('#step_2').show();
                        vipPay.customerid = response.data.customerid;
                        vipPay.mtime = response.data.mtime;
                    }
                    if(response.res == 3){
                        $('#step_1').hide();
                        $('.step_3a').show();
                        vipPay.renderPayment(response.data);
                        vipPay.customerid  = response.data.customerid;
                        vipPay.entCode = response.data.userentCode;
                        vipPay.priceInfo = response.data.priceInfo;
                        vipPay.mtime = response.data.mtime;

                    }
                    if(response.res == 4){
                        $('#step_1').hide();
                        $('.step_3a').show();
                        vipPay.renderPayment(response.data);
                        vipPay.customerid  = response.data.customerid;
                        vipPay.entCode = response.data.userentCode;
                        vipPay.priceInfo = response.data.priceInfo;
                        vipPay.mtime = response.data.mtime;
                    }
                    if(response.res == 5){
                        $('#step_1').hide();
                        $('#step_4').show();
                        $('#vip-share-block').hide();
                        vipPay.errorDisplay('十分抱歉，服务开通失败，请联系客服人员解决：400-8313-070');
                        vipPay.customerid  = response.data.customerid;
                        vipPay.entname = response.data.entname;
                        vipPay.openmonths = response.data.openmonths;
                        $('#step-4-info').append('<div class="vip-sp4-ast3">企业：'+response.data.entname+'</div><div class="vip-sp4-ast4">开通时长： '+response.data.openmonths+'个月</div>')
                    }
                    if(response.res == 6){
                        $('#step_1').hide();
                        $('#step_4').show();
                        $('#vip-share-block').hide();
                        vipPay.customerid  = response.data.customerid;
                        vipPay.entname = response.data.entname;
                        vipPay.openmonths = response.data.openmonths;
                        $('#step-4-info').append('<div class="vip-sp4-ast3">企业：'+response.data.entname+'</div><div class="vip-sp4-ast4">开通时长： '+response.data.openmonths+'个月</div>')
                    }
                    if(response.res == 7){
                        // var tempUrl = window.location.href;
                        window.location.href = 'vip_payment.html?_token='+vipPay._token+'&_c='+response.data._c+'&_f='+response.data._f+'&_u='+response.data._u;
                    }
                    if(response.res == 0){
                        vipPay.isPhoneSubmitted = false;
                        vipPay.errorDisplay(response.msg);
                    }
                },
                error: function(xhr, type) {
                    console.log('ajax error!');
                    vipPay.isPhoneSubmitted = false;
                }
            }).always(function() {
                dd.device.notification.hidePreloader();
            });
        } else {
            // dd.device.notification.toast({
            //     text: '使劲提交中...'
            // });
        }
    },

    saveCustomrInfo: function(){
        var cusname = $.trim($("#cusname").val());
        var entname = $.trim($("#entname").val());
        var email = $.trim($("#email").val());
        var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //邮箱格式验证
        if (cusname == "") {
            vipPay.errorDisplay('请输入姓名');
            return false;
        }
        if (entname == "") {
            vipPay.errorDisplay('请输入企业名称');
            return false;
        }
        if (email != "") {
            if(!emailRegex.test(email)){
                vipPay.errorDisplay('邮箱格式不正确');
                return false;
            }
        }

        var saveCustomrInfoApi = oms_config.apiUrl + oms_apiList.saveCustomrInfo;
        if (!vipPay.isCustomerSubmitted) {
            // console.log(vipPay.isCustomerSubmitted);
            // dd.device.notification.showPreloader({
            //     text: '使劲提交中...'
            // });
            vipPay.isCustomerSubmitted = true;
            $.ajax({
                type: 'POST',
                url: saveCustomrInfoApi,
                data: {
                    'cusname': cusname,
                    'entname': entname,
                    'email': email,
                    'cusid': vipPay.customerid,
                    'mtime': vipPay.mtime,
                    '_c':vipPay._c
                },
                cache: false,
                success: function(data){
                    vipPay.isPhoneSubmitted = false;
                    var response = JSON.parse(data);
                    if(response.res == 1 || response.res == 3){
                        $('#step_2').hide();
                        $('.step_3a').show();
                        vipPay.renderPayment(response.data);
                        vipPay.customerid  = response.data.customerid;
                        vipPay.entCode = response.data.userentcode;
                        vipPay.priceinfo = response.data.priceinfo;
                        vipPay.mtime = response.data.mtime;
                    }

                    if(response.res == 4){
                        $('#step_2').hide();
                        $('.step_3a').show();
                        vipPay.renderPayment(response.data);
                        vipPay.customerid  = response.data.customerid;
                        vipPay.entCode = response.data.userentcode;
                        vipPay.priceInfo = response.data.priceInfo;
                        vipPay.mtime = response.data.mtime;
                    }
                    if(response.res == 5){
                        $('#step_2').hide();
                        $('#step_4').show();
                        $('#vip-share-block').hide();
                        vipPay.errorDisplay('十分抱歉，服务开通失败，请联系客服人员解决：400-8313-070');
                        vipPay.customerid  = response.data.customerid;
                        vipPay.entname = response.data.entname;
                        vipPay.openmonths = response.data.openmonths;
                        $('#step-4-info').append('<div class="vip-sp4-ast3">企业：'+response.data.entname+'</div><div class="vip-sp4-ast4">开通时长： '+response.data.openmonths+'个月</div>')
                    }
                    if(response.res == 6){
                        $('#step_2').hide();
                        $('#step_4').show();
                        $('#vip-share-block').hide();
                        vipPay.customerid  = response.data.customerid;
                        vipPay.entname = response.data.entname;
                        vipPay.openmonths = response.data.openmonths;
                        $('#step-4-info').append('<div class="vip-sp4-ast3">企业：'+response.data.entname+'</div><div class="vip-sp4-ast4">开通时长： '+response.data.openmonths+'个月</div>')
                    }

                    if(response.res == 7){
                        window.location.href = 'vip_payment.html?_token='+vipPay._token+'&_c='+response.data._c+'&_f='+response.data._f+'&_u='+response.data._u;
                        // var tempUrl = window.location.href;
                        // window.location.href = tempUrl+'&_f='+response.data._f+'&_u='+response.data._u;
                    }
                    if(response.res == 0){
                        vipPay.isCustomerSubmitted = false;
                        vipPay.errorDisplay(response.msg);
                    }
                },
                error: function(xhr, type) {
                    console.log('ajax error!');
                    vipPay.isPhoneSubmitted = false;
                }
            }).always(function() {
                dd.device.notification.hidePreloader();
            });
        } else {
            // dd.device.notification.toast({
            //     text: '使劲提交中...'
            // });
        }
    },

    renderPayment : function(data){
        // $('#vip-share-block').addClass('nonMargin');
        $('#vip_entCode').text('企业代码：'+data.userentcode);
        var htmlTpl = '';
        _(data.priceinfo).forEach(function(val){
          htmlTpl += '<div class="vip-set-block">'+
                      '<div class="vip-set-block-content">'+
                      '<a href="javascript:;" onclick="vipPay.addOrder('+val.months+')" class="vip-set-btn">'+
                      '<div class="vip-set-btn-line-1">￥'+val.now_price+' | '+val.months+'个月</div>'+
                      '<div class="vip-set-btn-line-2">立省￥'+val.dis_price+'</div>'+
                      '</a></div></div>'
        });

        $('#vip_set').append(htmlTpl);

    },
    is_weixin:function(){
    	var ua = navigator.userAgent.toLowerCase();
    	if(ua.match(/MicroMessenger/i)=="micromessenger") {
    		return true;
     	} else {
    		return false;
    	}
    },
    addOrder: function(data){
        var addOrderApi = oms_config.apiUrl + oms_apiList.addOrder;
        var browser;
        if (!vipPay.isOrderSubmitted) {
            // dd.device.notification.showPreloader({
            //     text: '使劲提交中...'
            // });
            vipPay.isOrderSubmitted = true;
            if(vipPay.is_weixin()){
                browser = 1;
            }else {
                browser = 0;
            }
            $.ajax({
                type: 'POST',
                url: addOrderApi,
                data: {
                    'cusid': vipPay.customerid,
                    'months': data,
                    'uAgent': browser,
                    '_c':vipPay._c,
                    'mtime':vipPay.mtime
                },
                cache: false,
                success: function(data){
                    vipPay.isOrderSubmitted = false;

                    $('#payment_form').append(data);
                    $('#payment_form').show();
                    // var response = JSON.parse(data);
                    // if(response.res == 1){
                    //     $('#step_2').hide();
                    //     $('.step_3a').show();
                    //     vipPay.renderPayment(response.data);
                    //     vipPay.entCode = response.data.entCode;
                    //     vipPay.priceinfo = response.data.priceinfo;
                    // }else{
                    //     dd.device.notification.toast({
                    //         icon: 'error',
                    //         text: response.msg,
                    //         duration: 1,
                    //         onSuccess: function(result) {},
                    //         onFail: function(err) {}
                    //     });
                    // }
                },
                error: function(xhr, type) {
                    console.log('ajax error!');
                    vipPay.isPhoneSubmitted = false;
                }
            }).always(function() {
                dd.device.notification.hidePreloader();
            });
        } else {
            // dd.device.notification.toast({
            //     text: '使劲提交中...'
            // });
        }
    },

    checkPhoneValid: function(data){
        var num_regex = new RegExp(/^(?=.*\d)[\d]+$/);
        if (data == "") {
            // vipPay.phoneValid = false;
            vipPay.errorDisplay('请填写手机号');
            // dd.device.notification.toast({
            //     icon: 'error',
            //     text: '请填写手机号',
            //     duration: 1,
            //     onSuccess: function(result) {},
            //     onFail: function(err) {}
            // });

            return false;
        }
        if (!num_regex.test(data)) {
            vipPay.errorDisplay('手机号必须为数字！');
            return false;
        }
    },
    getAuthCode: function() {
        var temp_phone = $.trim($("#phone").val());
        vipPay.checkPhoneValid(temp_phone);
        vipPay.sendAuthCode(temp_phone);

    },

    resetControlBtn: function(flag){
        if(flag){
            $('#sendAuth').removeAttr('disabled');
            $('#sendAuth').addClass('auth-before');
            $('#sendAuth').removeClass('auth-after');
        }else {
            $('#sendAuth').attr("disabled", true);
            $('#sendAuth').removeClass('auth-before');
            $('#sendAuth').addClass('auth-after');
        }

    },

    onTimer: function(){
        $('#sendAuth').text(vipPay.length+'秒重新获取');
        vipPay.length--;
        if (vipPay.length < 0) {
            console.log('stop');
            clearTimeout(vipPay.timer);
            $('#sendAuth').text('获取验证码');
            vipPay.resetControlBtn(true);
        } else {
            vipPay.timer = setTimeout(vipPay.onTimer, 1000);
        }
    },
    sendAuthCode: function(phone) {
        vipPay.resetControlBtn(false);
        var sendCodeByPhoneApi = oms_config.apiUrl + oms_apiList.sendCodeByPhone;
        $.ajax({
            type: 'POST',
            url: sendCodeByPhoneApi,
            data: {
                'phone': phone,
            },
            cache: false,
            success: function(data){
                vipPay.length = 60;
                vipPay.onTimer();
                var response = JSON.parse(data);
                if (response.res != 1) {
                    vipPay.errorDisplay(response.msg);
                    vipPay.length = -1;
                    vipPay.onTimer();
                }else {
                    vipPay.customerid = response.data.customerid;
                    vipPay.mtime = response.data.mtime;
                }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        });
    },

    initApi: function() {
        dd.ready(function() {
            dd.biz.navigation.setTitle({
                title: "优惠购买",
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
            if (dd.ios) {
                dd.biz.navigation.setLeft({
                    show: true,
                    control: true,
                    showIcon: true,
                    text: '',
                    onSuccess: function(result) {
                        history.back(-1);
                    },
                    onFail: function(err) {}
                });
            } else {
                //omsapp-android-setLeft:visible:true
                dd.biz.navigation.setLeft({
                    visible: true,
                    control: false,
                    text: ''
                });
                $(document).off('backbutton');
                $(document).on('backbutton', function(e) {
                    history.back(-1);
                    e.preventDefault();
                });
            }
            dd.biz.navigation.setRight({
                show: false,
                control: false,
                showIcon: false,
                text: '',
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
        });
    },

    init: function() {
        this.initApi();
        this.getShareContent();
    }
};

$.fn.vipPay = function(settings) {
    $.extend(vipPay, settings || {});
};

$.fn.ready(function() {
    vipPay.init();
});
