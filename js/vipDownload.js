var __$$vipDownloadVersion = 1;

var vipDownload = {
    userInfo : JSON.parse(getCookie('omsUser')),
    initApi: function() {
        dd.ready(function() {
            dd.biz.navigation.setTitle({
                title: '推荐给朋友',
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

        $('#copy_qr').click(function(){
            dd.biz.clipboard.copy({
                text: 'http://app.hecom.cn/mm/', //需要拷贝的文本
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
    },


    init: function() {
        this.initApi();
    }
};

$.fn.vipDownload = function(settings) {
    $.extend(vipDownload, settings || {});
};

$.fn.ready(function() {
    vipDownload.init();
});
