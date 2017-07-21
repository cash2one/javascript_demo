var __$$businessCallMeetingVersion = 1;

var businessCallMeeting = {
    subject: getUrlParam('subject') || '', //会议主题
    participates: getUrlParam('participates') || '', //参与人
    isRecord: getUrlParam('isRecord') || '', //是否录音
    callFlag: false,
    confid: getUrlParam('id') || '', //会议ID。
    isFinish: 1,  //0:未结束 1:已结束，
    jumpType:getUrlParam('jumpType') || '',
    startMeeting: function(participates) {
        var meetingApi = oms_config.apiUrl + oms_apiList.meeting;
        var data = _.cloneDeep(participates);
        _(data).forEach(function(value){
            delete(value['name']);
        });
        $.ajax({
            url: meetingApi,
            type: 'POST',
            dataType: '',
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'subject': businessCallMeeting.subject,
                'isRecord':  businessCallMeeting.isRecord,
                'participates': data
            },
            cache: false,
            success: function(data) {
                businessCallMeeting.callFlag = true;
                var response = JSON.parse(data);
                if (response.res === 1) {
                    businessCallMeeting.stopWatch('');
                    businessCallMeeting.callFlag = true;
                    businessCallMeeting.confid = response.data.confid;
                } else {
                    $("#call_status").text(response.msg);
                }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        })
    },

    stopWatch:function(data){
        var seconds,minutes,hours,t;
        if(data === ''){
            $("#info_duration").text('00:00:00');
            seconds=0;
            minutes=0;
            hours=0;
        }else{
            var sec_num = parseInt(data, 10);
            hours   = Math.floor(sec_num / 3600);
            minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            seconds = sec_num - (hours * 3600) - (minutes * 60);

            // console.log(hours);
            // if (hours   < 10) {hours   = "0"+hours;}
            // if (minutes < 10) {minutes = "0"+minutes;}
            // if (seconds < 10) {seconds = "0"+seconds;}
        }

        function add(){
            seconds++;
            if(seconds >=60){
                seconds = 0;
                minutes++;
                if(minutes >=60){
                    minutes =0;
                    hours++;
                }
            }
            $("#info_duration").text((hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds));
            // $("#info_duration").textContent = '发起会议中……';
            timer();
        }
        function timer() {
            t = setTimeout(add, 1000);
        }
        timer();

    },

    addParticipate:function(obj){
        if(obj.data.length > 0)
        {
            var uid='',type='', tel='';
            _(obj.data).forEach(function(value){
                uid += value['uid'] + '#';
                type += value['type'] + '#';
                tel += value['tel'] + '#'
            });

            var meetingInviteApi = oms_config.apiUrl + oms_apiList.meetingInvite;
            $.ajax({
                url: meetingInviteApi,
                type: 'POST',
                dataType: '',
                data: {
                    'omsuid': JSON.parse(getCookie('omsUser')).id,
                    'token': JSON.parse(getCookie('omsUser')).token,
                    'confid':businessCallMeeting.confid,
                    'uid': uid,
                    'type': type,
                    'tel': tel
                },
                cache: false,
                success: function(data) {
                    obj.callback();
                    $("#main-body").show();
                    businessCallMeeting.initApi();
                    businessCallMeeting.participates = _.concat(businessCallMeeting.participates,obj.data);
                    businessCallMeeting.initParticipate(obj.data);
                },
                error: function(xhr, type) {
                    console.log('ajax error!');
                }
            });
        }else{
            obj.callback();
            $("#main-body").show();
            businessCallMeeting.initApi();
        }
    },
    //事件控制
    callingEventListener: function() {
        // $("#cancelCall").click(function() {
        //     businessCallMeeting.endMeeting();
        // });
        $("#hidden_page").click(function(){
            if(businessCallMeeting.jumpType == 'detail'){
                history.go(-2);
            }else{
                history.go(-1);
            }
        });
        $("#addParticipate").click(function(){
            $("#main-body").hide();
            console.log(businessCallMeeting.participates);
            openSelect(2,businessCallMeeting.participates,businessCallMeeting.addParticipate);
        });

        $("#joinCall").click(function(){
            var data = $(this).data('group');
            businessCallMeeting.addInviteJoinConf(data);
        });
    },

    endMeeting: function(){
        var endMeetingApi = oms_config.apiUrl + oms_apiList.endMeeting;
        $.ajax({
            url: endMeetingApi,
            type: 'POST',
            dataType: '',
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'confid':businessCallMeeting.confid,
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                if (response.res === 1) {
                      $("#call_status").text('通话结束……');
                      if(businessCallMeeting.jumpType == 'detail'){
                          history.go(-2);
                      }else{
                          history.go(-1);
                      }

                }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        })

    },
    //重新加入会议
    addInviteJoinConf: function(data){
        var addInviteJoinConfApi = oms_config.apiUrl + oms_apiList.addInviteJoinConf;
        $.ajax({
            url: addInviteJoinConfApi,
            type: 'POST',
            dataType: '',
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'confid':businessCallMeeting.confid,
                'uid': JSON.parse(getCookie('omsUser')).id,
                'type': data.type,
                'tel': data.tel,
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                if (response.res === 1) {
                      $("#meeting_footer").html('');
                      if(businessCallMeeting.sponserFlag == 0){
                          history.go(-1);
                      }else{
                          businessCallMeeting.initRenderFooter();
                      }

                      // $("#call_status").text('通话结束……');
                      // history.go(-1);
                }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        })
    },
    //渲染初始呼叫页面
    initRenderCalling: function() {
        _(this.participates).forEach(function(value){
            if(value.type == 0){
                $("#info_name").text(value.name);
            }
        })

        // $("#info_name").text(this.participates[0]['name']);
        $("#info_topic").text(this.subject);
        $("#info_duration").text('发起会议中……');
        businessCallMeeting.initParticipate(this.participates);
        businessCallMeeting.callingEventListener();
    },
    initRenderFooter: function(){
        $("#meeting_footer").append('<div class="ui-btn-wrap"><button class="ui-btn ui-btn-danger" id="cancelCall" onclick="businessCallMeeting.endMeeting()">结束会议</button></div>'+
                                    '<div class="footer-content"><div>结束会议，将会立即结束所有通话</div></div>');
    },

    initReRenderFooter: function(data){
        $("#meeting_footer").append('<div class="ui-btn-wrap"><button class="ui-btn ui-btn-danger" id="joinCall">加入</button></div>'+
                                    '</div>');
        $("#joinCall").data('group',data);
    },

    initParticipate: function(data){
        // var tmpData = data;
        // _.pullAt(tmpData, [0]);
        var htmlTpl = '';
        _(data).forEach(function(value){
            if(value.type != 0){
                htmlTpl += '<li class="list-content">'+
                  '<div class="follow-avatar"><span class="avatar-content">'+value.name+'</span></div>'+
                  '</div>'+
                  '</li>'
            }
            // htmlTpl += '<li class="list-content">'+
            //   '<div class="follow-avatar"><span class="avatar-content">'+value.name+'</span></div>'+
            //   '</div>'+
            //   '</li>'
        });
        $('#call_participates').prepend(htmlTpl);

        if(businessCallMeeting.participates.length < 8){
            $("#addMore").show();
        }else{
            $("#addMore").hide();
        }

    },
    //渲染重新加入或发起会议
    initReRenderCalling: function() {
        _(this.participates).forEach(function(value){
            if(value.type == 0){
                $("#info_name").text(value.name);
            }
        })

        // $("#info_name").text(this.participates[0]['name']);
        $("#info_topic").text(this.subject);
        // $("#info_duration").text('发起会议中……');
        businessCallMeeting.initParticipate(this.participates);
        businessCallMeeting.stopWatch(businessCallMeeting.conflength);
        businessCallMeeting.callingEventListener();
    },
    getConfStatus: function(){
        var getConfStatusApi = oms_config.apiUrl + oms_apiList.getConfStatus;
        $.ajax({
            url: getConfStatusApi,
            type: 'POST',
            dataType: '',
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'confid': businessCallMeeting.confid,
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                if (response.res === 1) {
                    businessCallMeeting.participates = response.data.participates;
                    businessCallMeeting.subject = response.data.subject;
                    businessCallMeeting.isRecord = '1';
                    //如果会议只有2人
                    // if(businessCallMeeting.participates.length == 2){
                    //     _(businessCallMeeting.participates).forEach(function(value){
                    //         if(value.call_status === '0'){
                    //             businessCallMeeting.isFinish = 1;
                    //             return;
                    //         }
                    //     });
                    // }else{
                    //     _(response.data.participates).forEach(function(value){
                    //         if(value.call_status !== '0'){
                    //             businessCallMeeting.isFinish = 0;
                    //             return;
                    //         }
                    //     });
                    // }
                    _(response.data.participates).forEach(function(value){
                        if(value.call_status !== '0'){
                            businessCallMeeting.isFinish = 0;
                            return;
                        }
                    });

                    console.log(businessCallMeeting.isFinish);
                    //会议进行中
                    if(businessCallMeeting.isFinish == 0){
                        console.log('未结束');

                        var hangUp = 0;
                        var reJoin = {};
                        _(businessCallMeeting.participates).forEach(function(value){
                            if(value.uid == JSON.parse(getCookie('omsUser')).id){
                                reJoin = value;
                            }
                            if(value.uid == JSON.parse(getCookie('omsUser')).id && value.call_status  === '0'){
                                hangUp = 1;
                                businessCallMeeting.sponserFlag = 0;
                                return;
                            }
                        });

                        //已挂断
                        if(hangUp == 1){
                            businessCallMeeting.conflength = response.data.conflength;
                            businessCallMeeting.initReRenderFooter(reJoin);
                            businessCallMeeting.initReRenderCalling();
                        }else{//未挂断
                            businessCallMeeting.conflength = response.data.conflength;
                            businessCallMeeting.initRenderFooter();
                            businessCallMeeting.initReRenderCalling();
                        }

                        // businessCallMeeting.conflength = response.data.conflength;
                        // businessCallMeeting.initReRenderCalling();

                    }else {
                        businessCallMeeting.initRenderFooter();
                        businessCallMeeting.initRenderCalling();
                        businessCallMeeting.startMeeting(businessCallMeeting.participates);
                    }
                } else {
                    dd.device.notification.toast({
                        icon: 'error',
                        text: response.msg,
                        duration: 2,
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        })
    },


    initApi: function() {
        dd.ready(function() {
            dd.biz.navigation.setTitle({
                title: "电话会议",
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
                        if (businessCallMeeting.jumpType == "detail")
                            history.back(-2);
                        else
                            history.back(-1);
                    },
                    onFail: function(err) {}
                });
            } else {
                $(document).off('backbutton');
                $(document).on('backbutton', function(e) {
                    if (businessCallMeeting.jumpType == "detail")
                        history.back(-2);
                    else
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

    init: function(data) {
        businessCallMeeting.initApi();
        //重新进入或发起会议
        if(businessCallMeeting.confid !== ''){
            businessCallMeeting.getConfStatus();
        }else{//发起会议
            businessCallMeeting.participates = JSON.parse(businessCallMeeting.participates);
            businessCallMeeting.initRenderFooter();
            businessCallMeeting.initRenderCalling();
            businessCallMeeting.startMeeting(this.participates);
        }
        // businessCallMeeting.initRenderCalling();

        // businessCallMeeting.startMeeting(this.participates);
    }
}

$.fn.businessCallHandler = function(settings) {
    $.extend(businessCallMeeting, settings || {});
};
$.fn.ready(function() {
    businessCallMeeting.init();
});
