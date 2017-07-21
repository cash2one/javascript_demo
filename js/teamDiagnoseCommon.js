var OMS_Diagnose = {
    showAlert: function(msg, callback) {
        dd.device.notification.alert({
            message: msg,
            title: "提示", //可传空
            buttonName: "确认",
            onSuccess: function() {
                if(callback){
                    callback();
                }
            },
            onFail: function(err) {}
        });
    },
    showLoading: function () {
                dd.device.notification.showPreloader({
                    text: "努力加载中..",
                    showIcon: true,
                    onSuccess: function(result) {

                    },
                    onFail: function(err) {}
                })
    },
    hideLoading: function () {
        dd.device.notification.hidePreloader({
            onSuccess: function(result) {

            },
            onFail: function(err) {}
        })
    },
    getURLParameter: function(name){
        return (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [,null])[1];
    }

};