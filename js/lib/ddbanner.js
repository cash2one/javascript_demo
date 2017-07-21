function hcddbanner(){

};
hcddbanner.prototype.resetBannerRight=function(){
    dd.ready(function(){
        dd.biz.navigation.setRight({
            show: false,
            control: false,
            text: '',
            onSuccess: function(){},
            onFail: function(){}
        })
    })
}
hcddbanner.prototype.changeBannerRight=function(str,isshow,onsuccess,onfail){
    if(!onsuccess) onsuccess=function(result) {};
    if(!onfail) onfail=function(err) {};
    if(!isshow) isshow=false;
    else isshow=true;
    dd.ready(function(){
        dd.biz.navigation.setRight({
            show: isshow,
            control: true,
            showIcon: false,
            text: str,
            onSuccess : onsuccess,
            onFail : onfail
        });
    });
};
hcddbanner.prototype.changeBannerLeft_old_notwork=function(str,onsuccess,onfail){
    if(!onsuccess) onsuccess=function(result) {};
    if(!onfail) onfail=function(err) {};
    if (navigator.userAgent.match(/Android/)){
        //alert("安卓设备");
        document.addEventListener("backbutton", onsuccess);//测试无效
    }else{
        dd.ready(function(){
            dd.biz.navigation.setLeft({
                show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
                control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
                showIcon: true,//是否显示icon，true 显示， false 不显示，默认true； 注：具体UI以客户端为准
                text: str,//控制显示文本，空字符串表示显示默认文本或icon
                onSuccess : onsuccess,
                onFail : onfail
            });
         });
    }
};
hcddbanner.prototype.resetBannerLeft=function(){
    dd.ready(function(){
        if(dd.ios){
            dd.biz.navigation.setLeft({
                show: false,
                control: false,
                text: '',
                onSuccess: function(){},
                onFail: function(){}
            });
        }
        $(document).off('backbutton');
    });
}
hcddbanner.prototype.changeBannerLeft=function(url){
    dd.ready(function(){
        if(dd.ios){
            dd.biz.navigation.setLeft({
                show: true,
                control: true,
                showIcon: true,
                text: '返回',
                onSuccess : function(result) {
                    if(url=='close'){
                        //alert("ios-关闭浏览器");
                        //window.close();
                        dd.biz.navigation.close({
                            onSuccess : function(result) {},
                            onFail : function() {}
                        });
                    }else if(url){
                        openLink(url);
                    }else{
                        history.back(-1);
                    }
                },
                onFail : function(err) {}
            });
        }
        $(document).off('backbutton');
        $(document).on('backbutton', function(event) {
            event.preventDefault();
            if(url=='close'){
                //alert("android-关闭浏览器");
                dd.biz.navigation.close({
                    onSuccess : function(result) {},
                    onFail : function() {}
                });
                //window.open("about:blank","_self").close();
            }else if(url){
                openLink(url);
            }else{
                history.back(-1);
            }
        });
    });
}
hcddbanner.prototype.changeBannerTitle=function(str,onsuccess,onfail){
    if(!onsuccess) onsuccess=function(result) {};
    if(!onfail) onfail=function(err) {};
    dd.ready(function(){
        dd.biz.navigation.setTitle({
            title: str,
            onSuccess : onsuccess,
            onFail : onfail
        });
    });
};
hcddbanner.prototype.getLocation=function(onsuccess,onfail){
    if(!onsuccess) onsuccess=function(result) {};
    if(!onfail) onfail=function(err) {};
    dd.ready(function(){
        dd.device.geolocation.get({
            onSuccess : onsuccess,
            onFail : onfail
        });
    });
};
hcddbanner.prototype.webViewBounce=function(){
    dd.ready(function(){
        dd.ui.webViewBounce.disable();
    });
};

ddbanner=new hcddbanner();