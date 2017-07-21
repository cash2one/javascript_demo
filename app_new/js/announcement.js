$(function() {
    dd.ready(function(){
        dd.biz.navigation.setTitle({
            title: "公告榜",
            onSuccess : function(result) {},
            onFail : function() {}
        });
        if(dd.ios){
            dd.biz.navigation.setLeft({
                show: true,
                control: true,
                showIcon: true,
                text: '',
                onSuccess : function(result) {
                    // dd.biz.navigation.close({
                    //     onSuccess : function(result) { },
                    //     onFail : function(err) {}
                    // });
                    history.back(-1);
                },
                onFail : function(err) {}
            });
        }else{
            //omsapp-android-setLeft-visible:true
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
            control: false,
            text: ''
        });
    });
})
