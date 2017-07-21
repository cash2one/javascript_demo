var __$$vipQrVersion = 1;

var vipQr = {
    userInfo : JSON.parse(getCookie('omsUser')),
    postDiscount: function(){
        var addShareContentApi = oms_config.apiUrl + oms_apiList.addShareContent;
        var content = $.trim($("#discount_content").val());
        if (content == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请输入分享文案',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }
        if (content.length > 90) {
            dd.device.notification.toast({
                icon: 'error',
                text: '分享文案字数超出上限',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }
        if (!vipQr.isSubmitted) {
            dd.device.notification.showPreloader({
                text: '使劲提交中...'
            });
            vipQr.isSubmitted = true;
            $.ajax({
                type: 'POST',
                url: addShareContentApi,
                data: {
                    'omsuid': vipQr.userInfo.id,
                    'token': vipQr.userInfo.token,
                    'userid': vipQr.userInfo.id,
                    'discount': $('#discount').val(),
                    'content': content
                },
                cache: false,
                success: function(data){
                    vipQr.isSubmitted = false;
                    var response = JSON.parse(data);
                    if(response.res == 1){
                        openLink('vipQrMain.html?uid='+response.data.contentid);
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
                    vipQr.isSubmitted = false;
                }
            }).always(function() {
                dd.device.notification.hidePreloader();
            });
        } else {
            dd.device.notification.toast({
                text: '使劲提交中...'
            });
        }

    },
    getRecent:function(){
        var getLastShareContentApi = oms_config.apiUrl + oms_apiList.getLastShareContent;
        $.ajax({
            type: 'POST',
            url: getLastShareContentApi,
            data: {
                'omsuid': vipQr.userInfo.id,
                'token': vipQr.userInfo.token,
                'userid': vipQr.userInfo.id
            },
            cache: false,
            success: function(data){
                var response = JSON.parse(data);
                if(response.res == 1){
                    var discount = response.data.discount;
                    var content = response.data.content;
                    vipQr.initHtml(discount,content);
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
    },
    renderCounts:function(){
        $('#vip-textarea-count').text($('#discount_content').val().length+' / 90');
        if($('#discount_content').val().length > 90){
            $('#vip-textarea-count').addClass('vipNonValid');
        }else {
            $('#vip-textarea-count').removeClass('vipNonValid');
        }
    },
    initHtml: function(data,content){
        var optionTpl = vipQr.initDiscount();
        $('#discount').append(optionTpl);
        if(data){
            $('#discount').val(data);
        }

        if(content.length > 0){
            $('#discount_content').val(content);
            $('#vip-textarea-count').text(content.length+' / 90');
        }else{
            var default_content = '您好，我是和创科技的'+vipQr.userInfo.realname+'，感谢您关注红圈通，这是我分享给您的企业服务购买链接，从这里购买可以享受'+data+'折优惠。后续我将继续为您持续服务，谢谢！';
            $('#discount_content').val(default_content);
            $('#vip-textarea-count').text(default_content.length+' / 90');
        }
        // $('#discount_content')[0].addEventListener('keyup',vipQr.renderCounts);
        // $('#discount_content')[0].addEventListener('keydown',vipQr.renderCounts);
        vipQr.discountEventListener();
    },
    initDiscount: function(){
        var htmltpl = '';
        for(i = 12; i < 20; i++){
            var number = (i*0.5).toFixed(1);
            htmltpl += '<option value="'+number+'">'+number+'</option>';
        }
        return htmltpl;
    },

    discountEventListener: function(){
        $('#discount_content').on('input onpaste',function(e){
            vipQr.renderCounts();
        })
        // $("#discount").change(function() {
        //     var value = this.value;
        //     var default_content = '您好，我是和创科技的'+vipQr.userInfo.realname+'，感谢您关注红圈管理，这是我分享给您的企业服务购买链接，从这里购买可以享受'+this.value+'折优惠。后续我将继续为您持续服务，谢谢！';
        //     $('#discount_content').val(default_content);
        // });
    },
    initApi: function() {
        dd.ready(function() {
            dd.biz.navigation.setTitle({
                title: "编辑分享文案",
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
                show: true,
                control: true,
                showIcon: true,
                text: '提交',
                onSuccess: function(result) {
                    vipQr.postDiscount();
                },
                onFail: function(err) {}
            });
        });
    },

    init: function() {
        this.initApi();
        this.getRecent();
    }
};

$.fn.vipQr = function(settings) {
    $.extend(vipQr, settings || {});
};

$.fn.ready(function() {
    vipQr.init();
});
