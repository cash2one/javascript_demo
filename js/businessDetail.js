var __$$businessDetailVersion = 1;

var businessDetail = {
    id: getUrlParam('id') || '',  //商务电话id
    type: getUrlParam('type') || '',  //0：单人电话 1：会议
    detailData: {},
    role: JSON.parse(getCookie('omsUser')).role,
    getDetail: function() {
        if(this.type == 0)
        {
            var getCallDetailApi = oms_config.apiUrl + oms_apiList.getCallDetail;
            $.ajax({
                url: getCallDetailApi,
                type: 'POST',
                dataType: '',
                data: {
                    'omsuid': JSON.parse(getCookie('omsUser')).id,
                    'token': JSON.parse(getCookie('omsUser')).token,
                    'id': businessDetail.id
                },
                cache: false,
                success: function(data) {
                    var response = JSON.parse(data);
                    if (response.res === 1) {
                        if(businessDetail.type == 0 && response.data.usertype == 0)
                        {
                            //单人通话对客户
                            businessDetail.isHaveCustomerPriv(response.data);
                        }else {
                            businessDetail.renderElement(response.data);
                        }
                    } else {
                        dd.device.notification.toast({
                            icon: 'warning',
                            text: response.msg,
                            duration: 1,
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                        return;
                    }
                },
                error: function(xhr, type) {
                    console.log('ajax error!');
                }
            })
        }else{
            var getConfDetailApi = oms_config.apiUrl + oms_apiList.getConfDetail;
            $.ajax({
                url: getConfDetailApi,
                type: 'POST',
                dataType: '',
                data: {
                    'uid': JSON.parse(getCookie('omsUser')).id,
                    'token': JSON.parse(getCookie('omsUser')).token,
                    'confid': businessDetail.id
                },
                cache: false,
                success: function(data) {
                    var response = JSON.parse(data);
                    if (response.res === 1) {
                        businessDetail.renderElement(response.data);
                    } else {
                        dd.device.notification.toast({
                            icon: 'warning',
                            text: response.msg,
                            duration: 1,
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                        return;
                    }
                },
                error: function(xhr, type) {
                    console.log('ajax error!');
                }
            })
        }
    },
    isHaveCustomerPriv: function(obj){
        console.log(111);
        var isHaveCustomerPrivApi = oms_config.apiUrl + oms_apiList.isHaveCustomerPriv;
        $.ajax({
            url: isHaveCustomerPrivApi,
            type: 'POST',
            dataType: '',
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'cusid': obj.cusid,
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                if (response.res === 1) {
                    businessDetail.status = response.data.status;
                    businessDetail.isReNew = response.data.isReNew;
                    businessDetail.renderElement(obj);
                } else {
                    dd.device.notification.toast({
                        icon: 'warning',
                        text: response.msg,
                        duration: 1,
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                    return;
                }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        });
    },
    //渲染详情页面
    renderElement: function(data) {
        //单人通话
        if(businessDetail.type == 0)
        {
            //单人通话对客户
            if(data.usertype == 0){
                businessDetail.renderSingleToCus(data);
            }
            //单人通话对业务员
            if(data.usertype == 1){
                businessDetail.renderSingleToStaff(data);
            }
        }else {//会议
            businessDetail.renderMeeting(data);
        }

    },
    renderSingleToCus: function(data){
        var sec_num = parseInt(data.duration, 10);
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
        var timeTag = (hours ? hours+"小时" : "")+(minutes ? minutes+"分" : "")+(seconds ? seconds+"秒" : "");

        $("#detail_header").append('<div class="dh-first">'+data.contactor+'</div><div class="dh-second">'+data.cusname+'</div><i class="ui-icon-list_arrow_right detail-arrow" id="showDetail"></i>');
        $('#showDetail').data('group',data);
        $("#detail_body").append('<div class="db-basic ui-border-t">'+
                                    '<div class="db-basic-info">'+
                                    '<span class="dbi-1">'+data.create_time+'</span>'+
                                    '<span class="dbi-2">呼出</span>'+
                                    '<span class="dbi-3">'+timeTag+'</span></div>'+
                                    '</div><div class="db-record"><div id="jquery_jplayer_1" class="jp-jplayer"></div>'+
                                    '<div style="position:relative;background-color:#fff;padding-bottom:0.75rem">'+
                                    '<div id="jp_container_1" class="jp-audio" role="application" aria-label="media player">'+
                                    '<div class="jp-type-single">'+
                                    '<div class="jp-gui jp-interface">'+
                                    '<div class="jp-controls">'+
                                    '<button class="jp-play" role="button" tabindex="0">play</button>'+
                                    '</div>'+
                                    '<div class="jp-progress">'+
                                    '<div class="jp-seek-bar">'+
                                    '<div class="jp-play-bar"></div>'+
                                    '</div>'+
                                    '</div>'+
                                    '<div class="jp-time-holder">'+
                                    '<div class="jp-current-time" role="timer" aria-label="time">&nbsp;</div>'+
                                    '<div class="jp-duration" role="timer" aria-label="duration">&nbsp;</div>'+
                                    '</div>'+
                                    '</div>'+
                                    '</div>'+
                                    '</div>'+
                                    '</div></div>');

        if(data.content == null && businessDetail.status == 1){
            $("#footer_tag").append('<div class="detail-footer df-sm"><div id="phoneRecord"><div class="df-div-sm"><i class="ui-icon-list_edit footer-icon-sm"></i><span class="footer-main">添加通话记录</span></div>'+
                                  '<div class="footer-note">为本次通话补充文字记录</div></div></div>');
                                  $('#phoneRecord').data('group',data);
        }
        businessDetail.renderPlayer(data.recordurl);
        businessDetail.eventListener();
    },
    renderSingleToStaff: function(data){
        var sec_num = parseInt(data.duration, 10);
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
        var timeTag = (hours ? hours+"小时" : "")+(minutes ? minutes+"分" : "")+(seconds ? seconds+"秒" : "");

        var call_type = '';
        if(data.call_type == 1){
            call_type = '呼出';
        }
        else {
            call_type = '呼入';
        }
        $("#detail_header").append('<div class="dh-first">'+data.contactor+'</div><div class="dh-second">'+data.dept+'</div>');
        $("#detail_body").append('<div class="db-basic ui-border-t">'+
                                    '<div class="db-basic-info">'+
                                    '<span class="dbi-1">'+data.create_time+'</span>'+
                                    '<span class="dbi-2">'+call_type+'</span>'+
                                    '<span class="dbi-3">'+timeTag+'</span></div>'+
                                    '</div><div class="db-record"></div>');
        if(data.call_type == 0){
            $("#footer_tag").append('<div class="detail-footer df-lg" onclick="businessDetail.phoneCall(\''+data.calling+'\',\''+data.uid+'\',\''+data.contactor+'\',\''+data.dept+'\',\''+data.cusid+'\',\''+data.usertype+'\')"><i class="ui-icon-phone footer-icon-lg"></i><span class="footer-main">商务电话</span></div>')
        }else{
            $("#footer_tag").append('<div class="detail-footer df-lg" onclick="businessDetail.phoneCall(\''+data.called+'\',\''+data.contactorid+'\',\''+data.contactor+'\',\''+data.dept+'\',\''+data.cusid+'\',\''+data.usertype+'\')"><i class="ui-icon-phone footer-icon-lg"></i><span class="footer-main">商务电话</span></div>')
        }
    },

    phoneCall:function(tel, id, name, info, cusid, contactType){
        openLink('businessCallSingle.html?name='+name+'&contactid='+id+'&tel='+tel+'&type='+contactType+'&info='+info+'&cusid='+cusid+'&jumpType=detail');
    },
    renderMeeting: function(data){
        businessDetail.participates = data.participates;
        businessDetail.subject = data.subject;
        var timeTag = '';
        var sec_num = parseInt(data.recordduration, 10);
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
        if(sec_num == 0){
            timeTag = '0秒';
        }else {
            timeTag = (hours ? hours+"小时" : "")+(minutes ? minutes+"分" : "")+(seconds ? seconds+"秒" : "");
        }
        // if(data.recordduration < 60){
        //     timeTag = data.recordduration+'秒';
        // }else{
        //     timeTag = data.recordduration/60+'分钟';
        // }

        var sponsor = '';
        _(data.participates).forEach(function(value){
            if(value.type == 0){
                sponsor = value.name;
            }
        })
        $("#detail_header").append('<div class="dh-first">'+sponsor+'</div><div class="dh-second">'+data.dept+'</div>');
        $("#detail_body").append('<div class="db-meeting-basic ui-border-t" id="basic_info">'+
                                  '<div class="db-basic-info">'+
                                  '<div class="dbi-meeting"><span class="dbim-title">会议主题</span><span class="dbim-body">'+data.subject+'</span></div>'+
                                  '<div class="dbi-meeting"><span class="dbim-title">会议时间</span><span class="dbim-body">'+data.ctime+'</span></div>'+
                                  '<div class="dbi-meeting"><span class="dbim-title">会议时长</span><span class="dbim-body">'+timeTag+'</span></div>'+
                                  '</div>'+
                                  '</div>');
        if(data.recordurl != null){
            $("#basic_info").append('<div id="jquery_jplayer_1" class="jp-jplayer"></div><div style="position:relative;background-color:#fff;padding-bottom:0.75rem">'+
                                      '<div id="jp_container_1" class="jp-audio" role="application" aria-label="media player">'+
                                      '<div class="jp-type-single">'+
                                      '<div class="jp-gui jp-interface">'+
                                      '<div class="jp-controls">'+
                                      '<button class="jp-play" role="button" tabindex="0">play</button>'+
                                      '</div>'+
                                      '<div class="jp-progress">'+
                                      '<div class="jp-seek-bar">'+
                                      '<div class="jp-play-bar"></div>'+
                                      '</div>'+
                                      '</div>'+
                                      '<div class="jp-time-holder">'+
                                      '<div class="jp-current-time" role="timer" aria-label="time">&nbsp;</div>'+
                                      '<div class="jp-duration" role="timer" aria-label="duration">&nbsp;</div>'+
                                      '</div>'+
                                      '</div>'+
                                      '</div>'+
                                      '</div>'+
                                      '</div>');
                                      businessDetail.renderPlayer(data.recordurl);
        }
        var customer = [];
        var staff = [];
        _(data.participates).forEach(function(value){
            if(value.type == 1)
            {
                staff.push(value);
            }else {
                customer.push(value);
            }
        });
        businessDetail.renderStaffList(staff);
        businessDetail.renderCusList(customer);


        $("#footer_tag").after('<div class="detail-footer df-meeting ui-border-t"><div class="footer-btn" onclick="businessDetail.callAgain()"><button class="ui-btn footer-main-btn">再次发起</button></div></div>')
    },
    renderStaffList:function(data){
        if(data.length > 0)
        {
            var htmlTpl = '<div class="detail-list"><div class="dl-title">企业人员</div><div class="dl-main"><ul class="dl-main-list">';
            _(data).forEach(function(value){
                htmlTpl += '  <li class="dl-main-list-li ui-border-b"><span class="list-li-1">'+value.name+'</span><span class="list-li-2">'+value.tel+'</span></li>';
            })

            htmlTpl += '</ul></div></div>';
            $("#detail_body").after(htmlTpl);
        }

    },
    renderCusList:function(data){
        if(data.length > 0)
        {
            var htmlTpl = '<div class="detail-list"><div class="dl-title">客户联系人</div><div class="dl-main"><ul class="dl-main-list">';
            _(data).forEach(function(value){
                htmlTpl += '  <li class="dl-main-list-li ui-border-b"><span class="list-li-1">'+value.name+'</span><span class="list-li-2">'+value.tel+'</span></li>';
            })

            htmlTpl += '</ul></div></div>';
            $("#detail_body").after(htmlTpl);
        }

    },
    renderPlayer: function(data){
        $("#jquery_jplayer_1").jPlayer({
            ready: function () {
                $(this).jPlayer("setMedia", {
                    wav: data
                });
            },
            cssSelectorAncestor: "#jp_container_1",
            swfPath: "/js/lib",
            supplied: "wav",
            useStateClassSkin: true,
            autoBlur: false,
            smoothPlayBar: false,
            keyEnabled: true,
            remainingDuration: true,
            toggleDuration: true,
        });
    },

    callAgain: function(){
        openLink('businessCallMeeting.html?subject='+businessDetail.subject+'&participates='+JSON.stringify(businessDetail.participates)+'&isRecord=1&jumpType=detail')
    },

    initBanner: function() {
        dd.ready(function() {
            dd.biz.navigation.setTitle({
                title: "商务电话",
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
                $(document).off('backbutton');
                $(document).on('backbutton', function(e) {
                    history.back(-1);
                    e.preventDefault();
                });
            }
        });
    },
    eventListener: function(){
        $('#phoneRecord').click(function(){
            var data = $(this).data('group');
            if(businessDetail.isReNew == 1){
                var checkRenewConfigApi = oms_config.apiUrl + oms_apiList.checkRenewConfig;
                var phoneSetting = 0;
                $.ajax({
                    type: 'POST',
                    url: checkRenewConfigApi,
                    // data:{bid:'11'},
                    data: {
                        cusid: data.cusid
                    },
                    cache: false,
                    success: function(res) {
                        var response = JSON.parse(res);
                        phoneSetting = response.data;
                        if (phoneSetting == 0) {
                            dd.device.notification.alert({
                                message: "您还未进行初始化配置，要先在电脑上进行初始化配置哦！",
                                title: "提示", //可传空
                                buttonName: "知道了",
                                onSuccess: function() {},
                                onFail: function(err) {}
                            });
                            return;
                        }else{
                            openLink('phoneRecord.html?code=' + data.cusid + '&cusname=' + data.cusname + '&from=private&recordid=' + data.id);
                        }
                    }
                });
            }else {
                openLink('phoneRecord.html?code=' + data.cusid + '&cusname=' + data.cusname + '&from=private&recordid=' + data.id);
            }



        });
        $('#showDetail').click(function(){
            var data = $(this).data('group');
            if(businessDetail.role == 2 || businessDetail.role == 3){
                openLink('customerInfo.html?code=' + data.cusid + '&cusname=' + data.cusname + '&from=private');
            }else{
                if(businessDetail.status == 1){
                    openLink('customerInfo.html?code=' + data.cusid + '&cusname=' + data.cusname + '&from=private&leaderPriv=1');
                }else {
                    openLink('customerInfo.html?code=' + data.cusid + '&cusname=' + data.cusname + '&from=private&leaderPriv=0');
                }
            }
        });
    },
    init: function(data, callback) {
        businessDetail.initBanner();
        businessDetail.getDetail();

    }
}

$.fn.businessCallHandler = function(settings) {
    $.extend(businessDetail, settings || {});
};
$.fn.ready(function() {
    businessDetail.init();
});
