
//dd.error(function(err){
//
//});

function Login(corpId,baseUrl,apiUrl,callback){
    this.corpId = corpId;
    this.baseUrl = baseUrl;
    this.apiUrl = apiUrl;
    this.loadingTimer = null;
    this.callback = callback;
    this.check();
}

Login.prototype.check = function(){
    // alert("history=" + history.length);
    // this.getCode();
    if (history.length > 1){
        //alert("callback");
        this.callback();
    }else{
        //alert("getcode");
        this.getCode();
    }
};

Login.prototype.getCode = function(){
    var self = this;
    dd.ready(function(){
        dd.runtime.permission.requestAuthCode({
            corpId: self.corpId,
            onSuccess: function(result) {
                //alert(result.code);
                self.getUser(result.code);
            },
            onFail: function(e){
                self.ddconfirm('获取授权码失败','请点击确定重试'+'['+JSON.stringify(e)+']',function(){
                    self.getCode();
                },function(){
                    self.ddclose();
                });
                // self.ddalert('您目前无权限查看该内容。',function(){
                //     self.ddclose();
                // });
            }
        });
    });
};

Login.prototype.getUser = function(code){
    var self = this;
    self.showLoading('登录中..');//+self.baseUrl + "init/login"
    $.ajax({
        type: "POST",
        url: self.apiUrl,
        data:{corpId: self.corpId,code:code},
        cache: false,
        success: function(response) {
            // console.log('返回的用户数据');
            // console.log(response);
//          alert(response);
            var json = null;
            try {
                json = JSON.parse(response);
            }catch(e){
                console.log(e.message);
            }
            // console.log(json);
            if (json!==null){
                console.log('json!');
                if (json.res === 1 ){
                    // self.initData(json.deviceId,json.authToken,json.v40DingEmplInfo);
                    self.initData(json);
                }else{
                    self.hideLoading(function() {
                        self.ddalert(json.msg,function(){
                            self.ddclose();
                        });
                    });
                }
            }else{
                self.hideLoading(function(){
                    self.ddalert('登录失败',function(){
                        self.ddclose();
                    });
                });
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            self.ddalert('网络异常',function(){
                self.ddclose();
            });
        }
    });
};

Login.prototype.setLoadingTimer = function(){
    var self = this;
    var ms = 20000;
    try{
        if (window.loadingLimit !== undefined ){
            ms = window.loadingLimit;
        }
    }catch (e){
        //
    }
    self.loadingTimer = window.setTimeout(function(){
        self.hideLoading(function(){
            dd.device.notification.confirm({
                message: "请重试",
                title: "加载超时",
                buttonLabels: [ '关闭','重试'],
                onSuccess : function(result) {
                    if(result.buttonIndex === 1){
                        window.localStorage.clear();
                        window.location.reload();
                    }else if(result.buttonIndex === 0){
                        self.ddclose();
                    }
                },
                onFail : function(err) {}
            });
        });
    },ms);
};

Login.prototype.initData = function(data){
    var self = this;
    self.setLoadingTimer();
    window.clearTimeout(self.loadingTimer);
    self.hideLoading(function(){
        setCookie('omsUser',JSON.stringify(data));
        self.callback();
    });
//    self.showLoading('更新中...');
    // self.setLoadingTimer();
    // init = new Init(Store.authUrl(self.apiUrl),deviceId,authToken,v40DingEmplInfo,function(){
    //     window.clearTimeout(self.loadingTimer);
    //     self.hideLoading(function(){
    //         self.callback();
    //     });
    // });
};

Login.prototype.ddclose = function(){
    dd.ready(function(){
        dd.biz.navigation.close({
            onSuccess : function(result) {},
            onFail : function(err) {}
        });
    });
};

Login.prototype.ddalert = function(msg,callback){
    dd.ready(function(){
        dd.device.notification.alert({
            message: msg,
            title: '',
            buttonName: '确定',
            onSuccess : function() {
                callback();
            },
            onFail : function(err) {}
        });
    });
};

Login.prototype.ddconfirm = function(title,msg,confirmCallback,cancelCallback){
    dd.ready(function(){
        dd.device.notification.confirm({
            title: title,
            message: msg,
            buttonLabels: ['确定', '取消'],
            onSuccess : function(result) {
                if (result.buttonIndex === 0){
                    confirmCallback();
                }else if (result.buttonIndex === 1){
                    cancelCallback();
                }
            },
            onFail : function(err) {}
        });
    });
};

Login.prototype.showLoading = function(text){
    dd.ready(function(){
        dd.device.notification.showPreloader({
            text: text,
            showIcon: true,
            onSuccess : function(result) {
            },
            onFail : function(err) {}
        })
    });
};

Login.prototype.hideLoading = function(callback){
    dd.device.notification.hidePreloader({
        onSuccess : function(result) {
            callback();
        },
        onFail : function(err) {}
    });
};

