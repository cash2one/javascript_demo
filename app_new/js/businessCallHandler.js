var __$$businessCallHandlerVersion = 1;

var businessCallHandler = {
    name: getUrlParam('name') || '', //被叫者姓名
    info: getUrlParam('info') || '', //客户名称或下属部门
    type: getUrlParam('type') || '', //呼叫类型 1：下属 0：客户联系人
    tel: getUrlParam('tel') || '', //被叫者号码
    contactid: getUrlParam('contactid') || '', //被叫者id
    cusid: getUrlParam('cusid') || '', //客户id
    callFlag: false,
    callSid: getUrlParam('id') || '', //单人通话ID。
    jumpType: getUrlParam('jumpType') || '',
    calling: function(tel, id, cusid, type) {
        var callingApi = oms_config.apiUrl + oms_apiList.calling;
        // $("#call_status").text('请接听手机来电……');
        $.ajax({
            url: callingApi,
            type: 'POST',
            dataType: '',
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'called': tel,
                'cusid': cusid,
                'contactorid': id,
                'type': type
            },
            cache: false,
            success: function(data) {
                businessCallHandler.callFlag = true;
                var response = JSON.parse(data);
                if (response.res === 1) {
                    $("#call_status").text('请接听手机来电……');
                    businessCallHandler.callFlag = true;
                    businessCallHandler.callSid = response.callSid;
                    window.setInterval(function() {
                        businessCallHandler.callFinish();
                    }, 2000);
                } else {
                    $("#call_status").text(response.msg);
                }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        })
    },

    //事件控制
    callingEventListener: function() {
        $("#cancelCall").click(function() {
            if (!businessCallHandler.callFlag) {
                if(businessCallHandler.jumpType == 'detail'){
                    history.go(-2);
                }else {
                    history.go(-1);
                }

            } else {
                businessCallHandler.cancelCall();
            }
        });

        $("#hidden_page").click(function(){
            if(businessCallHandler.jumpType == 'detail'){
                history.go(-2);
            }else {
                history.go(-1);
            }
        });
    },

    //取消通话
    cancelCall: function() {
        var CallCancelApi = oms_config.apiUrl + oms_apiList.CallCancel;

        $.ajax({
            url: CallCancelApi,
            type: 'POST',
            dataType: '',
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'callSid': businessCallHandler.callSid,
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                if (response.res === 1) {
                    if(businessCallHandler.jumpType == 'detail'){
                        history.go(-2);
                    }else {
                        history.go(-1);
                    }
                } else {
                    $("#call_status").text(response.msg);
                }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        })
    },
    //通话是否结束
    callFinish: function() {
        var callFinishApi = oms_config.apiUrl + oms_apiList.callFinish;

        $.ajax({
            url: callFinishApi,
            type: 'POST',
            dataType: '',
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'callSid': businessCallHandler.callSid,
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                if (response.res === 1) {
                    if(response.isFinish === 0){
                        $("#call_status").text('通话结束……');
                        if(businessCallHandler.jumpType == 'detail'){
                            history.go(-2);
                        }else {
                            history.go(-1);
                        }
                    }
                }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        })
    },

    getCallStatus:function(){
        var getCallStatusApi = oms_config.apiUrl + oms_apiList.getCallStatus;
        $.ajax({
            url: getCallStatusApi,
            type: 'POST',
            dataType: '',
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'id': businessCallHandler.callSid,
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                if (response.res === 1) {


                    businessCallHandler.info = response.data.info;
                    businessCallHandler.type = response.data.type;
                    if(response.data.call_type == 0){
                        businessCallHandler.tel = response.data.calling;
                        businessCallHandler.contactid = response.data.uid;
                        businessCallHandler.name = response.data.name;
                    }else {
                        businessCallHandler.tel = response.data.called;
                        businessCallHandler.contactid = response.data.contactorid;
                        businessCallHandler.name = response.data.name;
                    }

                    businessCallHandler.cusid = response.data.cusid;

                    businessCallHandler.callSid = response.data.callsid;
                    //已挂断
                    if(response.data.call_status === '0'){
                        businessCallHandler.initRenderCalling();
                        businessCallHandler.calling(businessCallHandler.tel, businessCallHandler.contactid, businessCallHandler.cusid, businessCallHandler.type);
                    }else {//未挂断
                        businessCallHandler.initReRenderCalling();
                        businessCallHandler.callFlag = true;
                        window.setInterval(function() {
                            businessCallHandler.callFinish();
                        }, 2000);
                    }

                }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        })
    },
    //渲染初始呼叫页面
    initRenderCalling: function() {
        $("#info_name").text(businessCallHandler.name);
        $("#info_dept").text(businessCallHandler.info);
        $("#call_status").text('拨号中……');
        businessCallHandler.callingEventListener();
    },

    initReRenderCalling: function() {
        $("#info_name").text(businessCallHandler.name);
        $("#info_dept").text(businessCallHandler.info);
        $("#call_status").text('请接听手机来电……');
        businessCallHandler.callingEventListener();
    },

    initApi: function() {
        dd.ready(function() {
            dd.biz.navigation.setTitle({
                title: "",
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
                        if(businessCallHandler.jumpType == 'detail'){
                            history.go(-2);
                        }else {
                            history.go(-1);
                        }
                    },
                    onFail: function(err) {}
                });
            } else {
                $(document).off('backbutton');
                $(document).on('backbutton', function(e) {
                    if(businessCallHandler.jumpType == 'detail'){
                        history.go(-2);
                    }else {
                        history.go(-1);
                    }
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

    init: function(data, callback) {
        businessCallHandler.initApi();
        if(businessCallHandler.callSid != ''){
            businessCallHandler.getCallStatus();
        }else{
            businessCallHandler.initRenderCalling();
            businessCallHandler.calling(this.tel, this.contactid, this.cusid, this.type);
        }

    }
}

$.fn.businessCallHandler = function(settings) {
    $.extend(businessCallHandler, settings || {});
};
$.fn.ready(function() {
    businessCallHandler.init();
});
