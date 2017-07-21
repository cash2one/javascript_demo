var __$$vipServiceVersion = 1;

var vipService = {
    userInfo : JSON.parse(getCookie('omsUser')),
    saleEventListener: function(){
        $("#vip_download").click(function(){
            openLink('vipDownload.html');
        });
        $("#vip_qr").click(function(){
            openLink('vipQr.html');
        });
        $("#vip_customer").click(function(){
            openLink('vipCustomer.html');
        });
    },
    initApi: function() {
        dd.ready(function() {
            dd.biz.navigation.setTitle({
                title: "VIP客户优惠",
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
        this.saleEventListener();
    }
};

$.fn.vipService = function(settings) {
    $.extend(vipService, settings || {});
};

$.fn.ready(function() {
    vipService.init();
});
