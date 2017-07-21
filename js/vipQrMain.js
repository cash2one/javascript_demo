var __$$vipQrMainVersion = 1;

var vipQrMain = {
    userInfo : JSON.parse(getCookie('omsUser')),
    uid : getUrlParam('uid') || '',
    timer: null,
    opened:[],
    getQrData:function(){
        var getQrcodeApi = oms_config.apiUrl + oms_apiList.getQrcode;
        $.ajax({
            type: 'POST',
            url: getQrcodeApi,
            data: {
                'omsuid': vipQrMain.userInfo.id,
                'token': vipQrMain.userInfo.token,
                'userid': vipQrMain.userInfo.id,
                'contentid': vipQrMain.uid
            },
            cache: false,
            success: function(data){
                var response = JSON.parse(data);
                if(response.res == 1){
                    vipQrMain.imageUrl = response.data.imgurl;
                    vipQrMain.url = response.data.url;
                    vipQrMain.initHtml(response.data.imgurl);
                    // vipQrMain.timer = setTimeout(vipQrMain.checkCustomerStatus, 5000);
                    vipQrMain.timer = window.setInterval(function() {
                        vipQrMain.checkCustomerStatusByContentid();
                    }, 5000);
                }else{
                    dd.device.notification.toast({
                        icon: 'error',
                        text: response.msg,
                        duration: 1,
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                }

            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        });
        // vipQrMain.initHtml();
    },

    initHtml: function(data){
        //modifyby lipengfei
        //如果 img 路径是绝对路径，格式成 [//www.abc.com/a.jpg] 的方式，便于在 http 和 https 环境下能同时访问
        if(data.substr(0,4)=='http'){
            data = data.replace(/^http[s]?:/, '');
        }
        $("#qrCode").prepend('<img class="vip-qr-img" src="'+data+'"></img><div class="qr-describe">扫一扫，立享购买优惠和我的专属服务</div>');
        vipQrMain.qrMainEventListener();
        // $("#vip_pay_finish").dialog('show');
    },


    qrMainEventListener: function(){
        $('#save_qr').click(function(){
            dd.biz.util.saveImage({
                urls: [vipQrMain.imageUrl], //图片地址列表
                onSuccess : function(result) {
                    dd.device.notification.toast({
                        icon: 'success',
                        text: '二维码保存成功！',
                        duration: 1,
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                },
                onFail : function() {}
            })
        });

        $('#copy_qr').click(function(){
            dd.biz.clipboard.copy({
                text: vipQrMain.url, //需要拷贝的文本
                onSuccess : function(result) {
                    dd.device.notification.toast({
                        icon: 'success',
                        text: '已复制到剪切板！',
                        duration: 1,
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                },
                onFail : function() {}
            })
        });

        $('#manual_open').click(function(){
            $('#vip_pay_finish').dialog('hide');
            $('#vip_nonauto_pay').dialog('show');
            $('#manu-container-num').val('12');
        });

        $('#vip_pay_success').tap(function(event){
              // vipQrMain.opened = _.pullAt(vipQrMain.opened,0);
              vipQrMain.opened.splice(0,1);
              $("#vip_pay_finish").dialog("hide");
              if(vipQrMain.opened.length !=0){
                  var firstEnt = _.head(vipQrMain.opened);
                  $("#vip_pay_finish").dialog("show");
                  $('#vip_successfully').html('');
                  $('#vip_successfully').append('<div class="header2">企业：'+firstEnt.entname+'</div><div class="header3">开通时长：'+firstEnt.months+'个月</div>')

              }
        });

        $('#payment_btn').click(function(){
            vipQrMain.checkCustomerStatusByContentid();
        });

        $('#manu-container-minus').click(function(){
            var nums = $.trim($('#manu-container-num').val());
            if(nums > 1){
                $('#manu-container-num').val(parseInt(nums)-1);
            }
        });
        $('#manu-container-plus').click(function(){
            var nums = $.trim($('#manu-container-num').val());
            $('#manu-container-num').val(parseInt(nums)+1);

        });

        $('#nonautoOpen').tap(function(){
            vipQrMain.nonautoOpenEntcode();
        });
        $('#vip_pay_finish_close').click(function(){
            $('#vip_pay_finish').dialog('hide');
        });
        $('#vip_nonauto_pay_close').click(function(){
            $('#vip_nonauto_pay').dialog('hide');
        });
    },

    checkCustomerStatusByContentid: function(){
        var checkCustomerStatusByContentidApi = oms_config.apiUrl + oms_apiList.checkCustomerStatusByContentid;
        $.ajax({
            type: 'POST',
            url: checkCustomerStatusByContentidApi,
            data: {
                'omsuid': vipQrMain.userInfo.id,
                'token': vipQrMain.userInfo.token,
                'contentid': vipQrMain.uid
            },
            cache: false,
            success: function(data){
                var response = JSON.parse(data);
                if(response.res == 1){
                    if(vipQrMain.opened.length == 0){
                        vipQrMain.opened = vipQrMain.opened.concat(response.data.customerlist);
                        var firstEnt = _.head(vipQrMain.opened);
                        $('#vip_successfully').html('');
                        $('#vip_successfully').append('<div class="header2">企业：'+firstEnt.entname+'</div><div class="header3">开通时长：'+firstEnt.months+'个月</div>')
                        $("#vip_pay_finish").dialog("show");
                        $('#vip_nonauto_pay').dialog('hide');
                    }else {
                        vipQrMain.opened = vipQrMain.opened.concat(response.data.customerlist);
                    }

                    // vipQrMain.entname = response.data.entname;
                    // vipQrMain.openmonths = response.data.openmonths;
                }


            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        });
    },

    nonautoOpenEntcode: function(){
      // $("#vip_pay_finish").dialog("show");
      // $('#vip_nonauto_pay').dialog('hide');
        var entCode = $.trim($('#entCode').val());
        var duration = $.trim($('#manu-container-num').val());
        // var duration = $.trim(document.getElementById('manu-container-num').innerHTML);
        var payment = $.trim($('#payment_mount').val());
        var phone = $.trim($('#phone').val());
        var num_regex = new RegExp(/^(?=.*\d)[\d]+$/);
        if (entCode == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请输入企业代码',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
            return false;
        }
        if (payment == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请输入支付金额',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
            return false;
        }
        if(phone == ""){
            dd.device.notification.toast({
                icon: 'error',
                text: '请输入手机号码',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
            return false;
        }

        if (!num_regex.test(phone)){
            dd.device.notification.toast({
                icon: 'error',
                text: '手机号码必须为数字！',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
            return false;
        }

        // var response_data = [{'entname':'111111','months':'24'}];
        // if(vipQrMain.opened.length == 0){
        //     vipQrMain.opened = vipQrMain.opened.concat(response_data);
        //     var firstEnt = _.head(vipQrMain.opened);
        //     $('#vip_successfully').html('');
        //     $('#vip_successfully').append('<div class="header2">企业：'+firstEnt.entname+'</div><div class="header3">开通时长：'+firstEnt.months+'个月</div>')
        //     $("#vip_pay_finish").dialog("show");
        //     $('#vip_nonauto_pay').dialog('hide');
        // }else {
        //     vipQrMain.opened = vipQrMain.opened.concat(response.data.customerlist);
        // }
        // return;

        var nonautoOpenEntcodeApi = oms_config.apiUrl + oms_apiList.nonautoOpenEntcode;
        if (!vipQrMain.isAutoSubmitted) {
            dd.device.notification.showPreloader({
                text: '使劲提交中...'
            });
            vipQrMain.isAutoSubmitted = true;
            $.ajax({
                type: 'POST',
                url: nonautoOpenEntcodeApi,
                data: {
                    'omsuid': vipQrMain.userInfo.id,
                    'token': vipQrMain.userInfo.token,
                    'contentid': vipQrMain.uid,
                    'userid':vipQrMain.userInfo.id,
                    'userentcode':entCode,
                    'months': duration,
                    'payment': payment,
                    'phone': phone
                },
                cache: false,
                success: function(data){
                    vipQrMain.isAutoSubmitted = false;
                    var response = JSON.parse(data);
                    if(response.res == 1){
                        var response_data = [{'entname':response.data.entname,'months':response.data.openmonths}];
                        if(vipQrMain.opened.length == 0){
                            vipQrMain.opened = vipQrMain.opened.concat(response_data);
                            var firstEnt = _.head(vipQrMain.opened);
                            $('#vip_successfully').html('');
                            $('#vip_successfully').append('<div class="header2">企业：'+firstEnt.entname+'</div><div class="header3">开通时长：'+firstEnt.months+'个月</div>')
                            $("#vip_pay_finish").dialog("show");
                            $('#vip_nonauto_pay').dialog('hide');
                        }else {
                            vipQrMain.opened = vipQrMain.opened.concat(response_data);
                        }
                    }
                    else{
                        vipQrMain.isAutoSubmitted = false;
                        dd.device.notification.toast({
                            icon: 'error',
                            text: response.msg,
                            duration: 1,
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    }

                },
                error: function(xhr, type) {
                    console.log('ajax error!');
                    vipQrMain.isAutoSubmitted = false;
                }
            }).always(function() {
                dd.device.notification.hidePreloader();
            });
        }else {
            dd.device.notification.toast({
                text: '使劲提交中...'
            });
        }
    },

    initApi: function() {
        dd.ready(function() {
            dd.biz.navigation.setTitle({
                title: "生成优惠分享码",
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
        this.getQrData();
    }
};

$.fn.vipQrMain = function(settings) {
    $.extend(vipQrMain, settings || {});
};

$.fn.ready(function() {
    vipQrMain.init();
});
