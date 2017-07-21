var __$$PhoneRecordVersion = 1;
var phoneRecord = {
    code: getUrlParam('code'),
    cusname: getUrlParam('cusname'),
    linkman: '',
    from: getUrlParam('from'),
    role: JSON.parse(getCookie('omsUser')).role,
    do: getUrlParam('do') || 0,
    inFollowPage: 0,
    idset: [],
    recordid: getUrlParam('recordid') || '',  //录音id
    images: {
        '1': []
    },
    clickFlag: 1,
    _top: 0,
    _needMark: true,
    _markComponent: null,
    follows: [],
    lastCount: 0,
    draftId: null,
    recordData: {},
    isFinish: false,
    // from:'home',
    postData: function() {
        var num_regex = new RegExp(/^(?=.*\d)[\d]+$/);
        var linkstatus = $.trim($("#linkstatus").val());
        var linkman = phoneRecord.linkman;
        var cusname = phoneRecord.cusname;
        var cusid = phoneRecord.code;
        var legworknumber = $.trim($("#legworknumber_sign").val());
        var carnumber = $.trim($("#carnumber_sign").val());
        var next_time = $.trim($("#next_time_sign").val());
        var content = $.trim($("#content_sign").val());
        var see_time = $.trim($("#see_time").val());
        var see_addr = $.trim($("#see_addr").val());
        var meetingId = $.trim($("#meetingId").val());

        if (linkstatus == "") {
            console.log(meetingId);
            dd.device.notification.toast({
                icon: 'error',
                text: '请选择联系情况',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }
        if (linkman == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请选择联系人',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }

        if (legworknumber == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请输入外勤人数',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }

        if (!num_regex.test(legworknumber)) {
            dd.device.notification.toast({
                icon: 'error',
                text: '外勤人数必须为数字',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }

        if (carnumber == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请输入车辆数',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }

        if (!num_regex.test(carnumber)) {
            dd.device.notification.toast({
                icon: 'error',
                text: '车辆数必须为数字',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }

        //   if(next_time == ""){
        // dd.device.notification.toast({
        // 	icon: 'error',
        // 	text: '请选择下次联系时间',
        // 	duration: 1,
        // 	onSuccess : function(result) {},
        // 	onFail : function(err) {}
        // })
        // return false;
        //   }
        if (content == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请输入致电详情',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }

        // if(linkstatus == "约到负责人"){
        // 	if(see_time == ""){
        // 		dd.device.notification.toast({
        // 			icon: 'error',
        // 			text: '请选择约见时间',
        // 			duration: 1,
        // 			onSuccess : function(result) {},
        // 			onFail : function(err) {}
        // 		})
        // 		return false;
        //     }
        //     if(see_addr == ""){
        // 		dd.device.notification.toast({
        // 			icon: 'error',
        // 			text: '请输入约见地点',
        // 			duration: 1,
        // 			onSuccess : function(result) {},
        // 			onFail : function(err) {}
        // 		})
        // 		return false;
        //     }
        // }
        var post_data = {
            omsuid: JSON.parse(getCookie('omsUser')).id,
            token: JSON.parse(getCookie('omsUser')).token,
            recordId: phoneRecord.recordid,
            linkman: linkman,
            linkstatus: linkstatus,
            cusname: cusname,
            cusid: cusid,
            legworknumber: legworknumber,
            carnumber: carnumber,
            next_time: next_time,
            content: content,
            see_time: see_time,
            see_addr: see_addr,
            meetingId : meetingId
        };

        // phoneRecord.isCallRecord = true;
        var callrecordpostApi = oms_config.apiUrl + oms_apiList.callrecordpost;
        if (!phoneRecord.isCallRecord) {
            dd.device.notification.showPreloader({
                text: '使劲提交中...'
            });
            phoneRecord.isCallRecord = true;
            $.ajax({
                type: 'POST',
                url: callrecordpostApi,
                data: post_data,
                cache: false,
                success: function(data) {
                    phoneRecord.isCallRecord = false;
                    var response = JSON.parse(data);
                    if (response.res == 1) {
                        phoneRecord.isFinish = true;
                        draftWork.remove(phoneRecord.draftId);
                        dd.device.notification.toast({
                            icon: 'success',
                            text: '已提交',
                            duration: 1,
                            onSuccess: function(result) {
                                history.back(-1);

                                // replaceLink('customerInfo.html?code='+phoneRecord.code+'&from='+phoneRecord.from);
                            },
                            onFail: function(err) {}
                        });


                    } else {
                        dd.device.notification.toast({
                            icon: 'error',
                            text: response.msg,
                            duration: 1,
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    }
                },
                error: function() {
                    phoneRecord.isCallRecord = false;
                }
            }).always(function() {
                dd.device.notification.hidePreloader();
            });
        } else {
            dd.device.notification.toast({
                text: '使劲提交中...'
            });
        }

        // dd.device.notification.showPreloader({
        // 	text: "数据提交中..",
        // 	showIcon: true,
        // 	onSuccess : function(result) {},
        // 	onFail : function(err) {}
        // });
    },

    postDataResign: function() {
        var num_regex = new RegExp(/^(?=.*\d)[\d]+$/);
        var review_type = ($("#review_type")).val();
        var linkman = phoneRecord.linkman;
        var cusname = phoneRecord.cusname;
        var cusid = phoneRecord.code;
        var legworknumber = $.trim($("#legworknumber").val());
        var carnumber = $.trim($("#carnumber").val());
        var next_time = $.trim($("#next_time").val());
        var content = $.trim($("#content").val());

        if (review_type == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请选择回访类型',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }
        if (linkman == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请选择回访对象',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }
        if (legworknumber == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请输入外勤人数',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }
        if (!num_regex.test(legworknumber)) {
            dd.device.notification.toast({
                icon: 'error',
                text: '外勤人数必须为数字',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }

        if (carnumber == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请输入车辆数',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }

        if (!num_regex.test(carnumber)) {
            dd.device.notification.toast({
                icon: 'error',
                text: '车辆数必须为数字',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }

        //   if(next_time == ""){
        // dd.device.notification.toast({
        // 	icon: 'error',
        // 	text: '请选择下次回访时间',
        // 	duration: 1,
        // 	onSuccess : function(result) {},
        // 	onFail : function(err) {}
        // })
        // return false;
        //   }
        //  if(next_time !="")
        //  {
        //  	var today = new Date();
        //  	console.log(today.getTime());
        //  	console.log(new Date(next_time).getTime());
        //  	if(today.getTime() > new Date(next_time).getTime())
        //  	{
        //  		dd.device.notification.toast({
        // 	icon: 'error',
        // 	text: '下次回访时间不能小于当前时间！',
        // 	duration: 1,
        // 	onSuccess : function(result) {},
        // 	onFail : function(err) {}
        // })
        //  	}
        //  	return false;
        //  }
        if (content == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请输入致电详情',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }

        var question = new Array();
        var flag = true;
        _(phoneRecord.idset).forEach(function(value) {
            var questionTypeArray = ($("#problem_type_" + value)).val();
            var questionContentArray = $.trim($("#problem_content_" + value).val());
            if (questionTypeArray == "") {
                flag = false;
                dd.device.notification.toast({
                    icon: 'error',
                    text: '请选择问题类型',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                });
                return false;
            }

            if (questionContentArray == "") {
                flag = false;
                dd.device.notification.toast({
                    icon: 'error',
                    text: '请填写问题内容',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                });
                return false;
            }

            var imageSet = _.values(phoneRecord.images[value]);
            var quest_item = {};
            quest_item = {
                "questionTypeArray": questionTypeArray,
                "questionImgArray": imageSet,
                "questionContentArray": questionContentArray
            };
            question.push(quest_item);
        });
        if (!flag) {
            return;
        }
        var post_data = {
            omsuid: JSON.parse(getCookie('omsUser')).id,
            token: JSON.parse(getCookie('omsUser')).token,
            recordId: phoneRecord.recordid,
            linkman: linkman,
            review_type: review_type,
            cusname: cusname,
            cusid: cusid,
            legworknumber: legworknumber,
            carnumber: carnumber,
            next_time: next_time,
            content: content,
            question: question
        };

        var addcallApi = oms_config.apiUrl + oms_apiList.addcall;
        if (!phoneRecord.isAddCall) {
            phoneRecord.isAddCall = true;
            $.ajax({
                type: 'POST',
                url: addcallApi,
                data: post_data,
                cache: false,
                success: function(data) {
                    phoneRecord.isAddCall = false;
                    var response = JSON.parse(data);


                    if (response.res == 1) {
                        phoneRecord.isFinish = true;
                        draftWork.remove(phoneRecord.draftId);
                        dd.device.notification.toast({
                            icon: 'success',
                            text: '已提交',
                            duration: 1,
                            onSuccess: function(result) {
                                history.back(-1);

                                // replaceLink('customerInfo.html?code='+phoneRecord.code+'&from='+phoneRecord.from);
                            },
                            onFail: function(err) {}
                        });


                    } else {
                        dd.device.notification.toast({
                            icon: 'error',
                            text: response.msg,
                            duration: 1,
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    }
                },
                error: function() {
                    phoneRecord.isAddCall = false;
                }
            });
        }

    },
    initHomeCall: function(type) {
        //新签客户
        if (type === 1) {
            $("#home-content_sign").html('');
            $("#home-content_resign").html('');
            $("#home-content_sign").append('<div class="ui-form-item ui-form-item-input-l ui-border-b"> <label>客户</label><input type="text" id="cusname_home" name="cusname_home" placeholder="请选择" readonly=""><i class="ui-icon-list_arrow_right"></i></div>');
            phoneRecord.cusType = 'sign';
            phoneRecord.do = '0';
            $(".sign_type_flag").css("color", "#ec564d");
            $(".resign_type_flag").css("color", "#333");
            $("#select_type").show();
            // $(".sign_cusname").remove();
            $("#new-sign").show();
            $("#resign").hide();
            $(".detail-content").remove();
            if (!_.isEmpty(phoneRecord.recordData)) {
                $("#cusname_home").val(phoneRecord.cusname);
            }
            $('#call_form_sign').data('serialize', $('#call_form_sign').serialize());
        }
        //续签客户
        if (type === 2) {
            $("#home-content_resign").html('');
            $("#home-content_sign").html('');
            $("#home-content_resign").append('<div class="ui-form-item ui-form-item-input-l ui-border-b"> <label>客户</label><input type="text" id="cusname_home" name="cusname_home" placeholder="请选择" readonly=""><i class="ui-icon-list_arrow_right"></i></div>')
            phoneRecord.cusType = 'resign';
            phoneRecord.do = '1';
            $(".resign_type_flag").css("color", "#ec564d");
            $(".sign_type_flag").css("color", "#333");
            $("#select_type").show();
            // $(".sign_cusname").remove();
            $("#new-sign").hide();
            $("#resign").show();
            $(".detail-content").remove();
            if (!_.isEmpty(phoneRecord.recordData)) {
                $("#cusname_home").val(phoneRecord.cusname);
            }
            $('#call_form_resign').data('serialize', $('#call_form_resign').serialize());
        }
    },

    // switchFromListener: function(){
    //
    //
    // },

    getMeetingInfo : function(){
        var meetingInfoApi = "http://ptest.hecom.cn/oms4/apiMeeting/getMeetingName";
        var invert_html = '';
        $.ajax({
            type: 'POST',
            url: meetingInfoApi,
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'cusid': phoneRecord.code,
                'from': phoneRecord.from
            },
            cache: false,
            success: function(data) {
                console.log(data);
                var response = JSON.parse(data);
                console.log(response);
                invert_html += '<option value="">不参加会议</option>'
                        if(response.data.meetingNames.length > 0) {
                            for (var i in response.data.meetingNames) {
                                invert_html += '<option value="'+ response.data.meetingNames[i].id +'">'+response.data.meetingNames[i].name+'</option>';
                            }
                        }
                $("#meetingId").html(invert_html);

               /* if (response.data.meetingNames.length==0)
                    $("#meeting_con").html("暂无会议");
                else {
                    var formatDate = response.data.start_date.split('-')[0]+"年"+response.data.start_date.split('-')[1]+"月"+response.data.start_date.split('-')[2]+"日";
                    $("#meeting_con").html(formatDate + " 会议");
                }*/
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        });
    },



    getInfo: function(){
      var cusInfoApi = oms_config.apiUrl + oms_apiList.getCustomerInfo;
      $.ajax({
          type: 'POST',
          url: cusInfoApi,
          data: {
              'omsuid': JSON.parse(getCookie('omsUser')).id,
              'token': JSON.parse(getCookie('omsUser')).token,
              'cusid': phoneRecord.code,
              'from': phoneRecord.from
          },
          cache: false,
          success: function(data) {
              // $(".loading-content").show();
              console.log(data);
              var response = JSON.parse(data);
              if (response.res == 1) {
                  if (response.data.info.status < 8) {
                      phoneRecord.do = 0;
                  } else {
                      phoneRecord.do = 1;
                  }

                  phoneRecord.setContent();
                  phoneRecord.phoneRecordListener();
                } else {
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
    setContent: function() {
        phoneRecord.getLocalDraft();


        if (phoneRecord.from == 'new') {

            if (phoneRecord.role == '1' || phoneRecord.role == '3') {
                phoneRecord.cusType = 'sign';
                phoneRecord.do = 0;
                $("#new-sign").show();
                $("#resign").remove();
                $("#home-content_sign").append('<div class="ui-form-item ui-form-item-input-l ui-border-b"> <label>客户</label><input type="text" id="cusname_home" name="cusname_home" placeholder="请选择" readonly=""><i class="ui-icon-list_arrow_right"></i></div>');
                $(".detail-content").remove();
                if (!_.isEmpty(phoneRecord.recordData)) {
                    $("#cusname_home").val(phoneRecord.cusname);
                }
                $('#call_form_sign').data('serialize', $('#call_form_sign').serialize());

            }
            if (phoneRecord.role == '2' || phoneRecord.role == '4') {
                //默认续签表单
                // phoneRecord.cusType = 'resign';
                // $(".sign_type_flag").css("color","#ec564d");
                // $(".sign_cusname").remove();
                // $("#new-sign").hide();
                // $("#resign").show();
                // phoneRecord.switchFromListener();
                if (!_.isEmpty(phoneRecord.recordData)) {
                  if (phoneRecord.do == 0) {
                      phoneRecord.cusType = 'sign';
                      $("#new-sign").show();
                      $("#resign").remove();
                      $("#home-content_sign").append('<div class="ui-form-item ui-form-item-input-l ui-border-b"> <label>客户</label><input type="text" id="cusname_home" name="cusname_home" placeholder="请选择" readonly=""><i class="ui-icon-list_arrow_right"></i></div>');
                      $(".detail-content").remove();
                      if (!_.isEmpty(phoneRecord.recordData)) {
                          $("#cusname_home").val(phoneRecord.cusname);
                      }
                      $('#call_form_sign').data('serialize', $('#call_form_sign').serialize());
                  } else {
                      phoneRecord.cusType = 'resign';
                      $("#new-sign").remove();
                      $("#resign").show();
                      $("#home-content_resign").append('<div class="ui-form-item ui-form-item-input-l ui-border-b"> <label>客户</label><input type="text" id="cusname_home" name="cusname_home" placeholder="请选择" readonly=""><i class="ui-icon-list_arrow_right"></i></div>');
                      $(".detail-content").remove();
                      if (!_.isEmpty(phoneRecord.recordData)) {
                          $("#cusname_home").val(phoneRecord.cusname);
                      }
                      $('#call_form_resign').data('serialize', $('#call_form_resign').serialize());
                  }
                  // phoneRecord.cusType = 'resign';
                  // $("#new-sign").remove();
                  // $("#resign").show();
                }else {
                    phoneRecord.initHomeCall(2);
                }

            }

            // $(".detail-content").remove();
            // if (!_.isEmpty(phoneRecord.recordData)) {
            //     $("#cusname_home").val(phoneRecord.cusname);
            // }
            // $('#call_form').data('serialize', $('#call_form').serialize());
        } else {

            if (phoneRecord.role == '1' || phoneRecord.role == '3') {
                if (phoneRecord.do == 0) {
                    phoneRecord.cusType = 'sign';
                    $("#new-sign").show();
                    $("#resign").remove();
                } else {
                    phoneRecord.cusType = 'resign';
                    $("#new-sign").remove();
                    $("#resign").show();
                }
            }

            if (phoneRecord.role == '2' || phoneRecord.role == '4') {
                if (phoneRecord.do == 1) {
                    phoneRecord.cusType = 'resign';
                    $("#new-sign").remove();
                    $("#resign").show();
                } else {
                    phoneRecord.cusType = 'sign';
                    $("#new-sign").show();
                    $("#resign").remove();
                }

            }
            if (phoneRecord.role == '5') {
                //城市经理
                if (JSON.parse(getCookie('omsUser')).isCityLeader == 1) {
                    if (phoneRecord.do == 0) {
                        phoneRecord.cusType = 'sign';
                        $("#new-sign").show();
                        $("#resign").remove();
                    } else {
                        phoneRecord.cusType = 'resign';
                        $("#new-sign").remove();
                        $("#resign").show();
                    }
                }
            }
            phoneRecord.initData();
            $("#cusname").val(phoneRecord.cusname);
        }
        // if (phoneRecord.from == 'new') {
        //     $("#detail-content").remove();
        //     $("#home-content").append('<div class="ui-form-item ui-form-item-input-l ui-border-b"> <label>客户</label><input type="text" id="cusname_home" name="cusname_home" placeholder="请选择" readonly=""><i class="ui-icon-list_arrow_right"></i></div>')
        //     if (!_.isEmpty(phoneRecord.recordData)) {
        //         $("#cusname_home").val(phoneRecord.cusname);
        //     }
        //     $('#call_form').data('serialize', $('#call_form').serialize());
        //
        // } else {
        //   phoneRecord.initData();
        //   $("#cusname").val(phoneRecord.cusname);
        // }

        if (!_.isEmpty(phoneRecord.recordData)) {
            phoneRecord.renderContent();
        }


    },
    renderContent: function() {
        if (phoneRecord.cusType == 'sign') {
          console.log(phoneRecord.recordData.linkstatus);
            $("#linkstatus").val(phoneRecord.recordData.linkstatus);
            $("#link").val(_.split(phoneRecord.recordData.linkman, '|', 1));
            $("#legworknumber_sign").val(phoneRecord.recordData.legworknumber);
            $("#carnumber_sign").val(phoneRecord.recordData.carnumber);
            $("#next_time_sign").val(phoneRecord.recordData.next_time);
            $("#content_sign").val(phoneRecord.recordData.content);
            $("#see_time").val(phoneRecord.recordData.see_time);
            $("#see_addr").val(phoneRecord.recordData.see_addr);
            // if(phoneRecord.recordData.linkstatus == )
            if (phoneRecord.recordData.linkstatus == "约到负责人") {
                $("#meetTime").show();
                $("#meetPlace").show();
            } else {
                $("#meetTime").hide();
                $("#meetPlace").hide();
            }
        }
        if (phoneRecord.cusType == 'resign') {
            // $("#cusname").val(phoneRecord.cusname);
            $("#review_type").val(phoneRecord.recordData.review_type);
            $("#link_resign").val(_.split(phoneRecord.recordData.linkman, '|', 1));
            $("#legworknumber").val(phoneRecord.recordData.legworknumber);
            $("#carnumber").val(phoneRecord.recordData.carnumber);
            $("#next_time").val(phoneRecord.recordData.next_time);
            $("#content").val(phoneRecord.recordData.content);
            if (phoneRecord.recordData.question.length > 0) {
                $("#add_problem").hide();
                $("#add_problem_split").hide();
                $("#addMoreProblem").show();
                phoneRecord.problemListener();
                _(phoneRecord.recordData.question).forEach(function(value, i) {

                    phoneRecord.renderQuestion(value, i);
                });
            }
            // console.log(phoneRecord.idset);
        }
    },

    renderQuestion: function(data, i) {
        var count = parseInt(i) + 1;

        //MODIFY by lipengfei at 2016/6/25
        // var problem_type = data.questionTypeArray;
        // var problem_content = data.questionContentArray;
        $("#formPhone").append('<div id="problem_set_' + count + '"><div class="ui-form-item-blank ui-border-tb" style="background-color: #f5f5f6;"></div>' + '<div><div class="ui-form-item ui-form-item-input-l ui-border-b"><label>问题类型</label><div class="ui-select"><select id="problem_type_' + count + '" value="2"><option value="">请选择</option><option value="1">服务</option><option value="2">产品类型</option></select><i class="ui-icon-list_arrow_right"></i></div></div>' + '<div tabindex="-1" class="ui-form-camera"><div class="ui-form-item ui-border-b"><label>问题图片</label><div class="upload-area" id="_file_btn_' + count + '" onclick="phoneRecord.uploadImage(event,' + count + ')"><div style="padding-left:85.0156px;color:#aaaec3">请上传（非必选）</div><input id="_file_' + count + '" type="file"  accept="image/*" name="files" onchange="phoneRecord.uploadImage(event,' + count + ')"></div><i class="ui-icon-list_addimg"></i></div><ul class="ui-form-camera-list ui-whitespace ui-border-b clearfix" id="image_list_' + count + '"></ul></div>' + '<div class="ui-form-item ui-form-item-textarea ui-border-b" ><textarea novalidate="" rows="3" id="problem_content_' + count + '" placeholder="问题内容（请输入）"></textarea></div>' + '<div style="display:block;" ><ul class="ui-list ui-list-text ui-list-cover ui-row-flex form-group"><li class="ui-col ui-col ui-flex" id="problem_delete_' + count + '" onclick="phoneRecord.delete_problem(' + count + ')"><i id="_add_relation_" class="ui-icon-list_delete" style="font-size: 15px;color: #ec564d"></i><div class="add-content">删除</div></li></ul></div>' + '</div></div>');
        //根据app, 调整文件上传触发事件
        if (dd.isDingTalk) {
            $('#_file_btn_' + count).get(0).onclick = null;
        } else {
            $('#_file_' + count).get(0).onchange = null;
        }
        //MODIFY-END
        $("#problem_type_" + count).val(data.questionTypeArray);
        $("#problem_content_" + count).val(data.questionContentArray);
        //push idset
        phoneRecord.idset.push(count);
        var obj = {};
        obj[count] = data.questionImgArray;
        _.assignIn(phoneRecord.images, obj);
        phoneRecord.renderImageList(count);


    },

    initData: function() {

        var getLastDataforCallRecordApi = oms_config.apiUrl + oms_apiList.getLastDataforCallRecord;
        $.ajax({
            type: 'POST',
            url: getLastDataforCallRecordApi,
            data: {
                cusid: phoneRecord.code
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                if (response.res == 1) {
                    if (_.isEmpty(phoneRecord.recordData)) {
                        // console.log('initData');
                        if (phoneRecord.cusType == 'sign') {
                            $("#legworknumber_sign").val(response.data[0].legworknumber);
                            $("#carnumber_sign").val(response.data[0].carnumber);
                        }
                        if (phoneRecord.cusType == 'resign') {
                            $("#legworknumber").val(response.data[0].legworknumber);
                            $("#carnumber").val(response.data[0].carnumber);
                        }
                    }
                }
                if(phoneRecord.cusType == 'sign'){
                    $('#call_form_sign').data('serialize', $('#call_form_sign').serialize());
                }
                if(phoneRecord.cusType == 'resign'){
                    $('#call_form_resign').data('serialize', $('#call_form_resign').serialize());
                }

            }
        });
    },
    initRight: function() {
        dd.biz.navigation.setRight({
            show: true,
            control: true,
            showIcon: true,
            text: '确定',
            onSuccess: function(result) {
                if (phoneRecord.cusType == 'sign') {
                    phoneRecord.postData();
                }
                if (phoneRecord.cusType == 'resign') {
                    phoneRecord.postDataResign();
                }

            },
            onFail: function(err) {}
        });
    },

    initApi: function() {
        var text = "电话记录";
        dd.ready(function() {
            dd.biz.navigation.setTitle({
                title: text,
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
            phoneRecord.initRight();
            if (dd.ios) {
                dd.biz.navigation.setLeft({
                    show: true,
                    control: true,
                    showIcon: true,
                    text: '',
                    onSuccess: function(result) {
                        if (!phoneRecord.isFinish) {
                            if(phoneRecord.cusType == 'sign'){
                                if ($('#call_form_sign').serialize() != $('#call_form_sign').data('serialize')) {
                                    phoneRecord.draftRecord();
                                }
                            }
                            if(phoneRecord.cusType == 'resign'){
                                if ($('#call_form_resign').serialize() != $('#call_form_resign').data('serialize')) {
                                    phoneRecord.draftRecord();
                                }
                            }

                        }
                        history.back(-1);
                    },
                    onFail: function(err) {}
                });
            } else {
                //omsapp-android-setLeft-visible:true
                dd.biz.navigation.setLeft({
                    visible: true,
                    control: false,
                    text: ''
                });
                $(document).off('backbutton');
                $(document).on('backbutton', function(e) {
                    if (!phoneRecord.isFinish) {
                      if(phoneRecord.cusType == 'sign'){
                          if ($('#call_form_sign').serialize() != $('#call_form_sign').data('serialize')) {
                              phoneRecord.draftRecord();
                          }
                      }
                      if(phoneRecord.cusType == 'resign'){
                          if ($('#call_form_resign').serialize() != $('#call_form_resign').data('serialize')) {
                              phoneRecord.draftRecord();
                          }
                      }
                    }

                    history.back(-1);
                    e.preventDefault();
                });
            }
        });
    },

    phoneRecordListener: function() {
        $("#next_time").click(function() {
            var thiz = this;
            var n = moment().format('YYYY-MM-DD HH:mm');
            dd.biz.util.datetimepicker({
                format: 'yyyy-MM-dd HH:mm',
                value: n,
                onSuccess: function(result) {

                    if (result.value < n) {
                        $("#next_time").val(n);
                        dd.device.notification.toast({
                            icon: '',
                            text: '时间不能小于现在',
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    } else {
                        $(thiz).val(result.value);
                    }
                },
                onFail: function() {}
            });
        });

        $("#next_time_sign").click(function() {
            var thiz = this;
            var n = moment().format('YYYY-MM-DD HH:mm');
            dd.biz.util.datetimepicker({
                format: 'yyyy-MM-dd HH:mm',
                value: n,
                onSuccess: function(result) {

                    if (result.value < n) {
                        $("#next_time_sign").val(n);
                        dd.device.notification.toast({
                            icon: '',
                            text: '时间不能小于现在',
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    } else {
                        $(thiz).val(result.value);
                    }
                },
                onFail: function() {}
            });
        });

        $("#see_time").click(function() {
            var thiz = this;
            var n = moment().format('YYYY-MM-DD HH:mm');
            dd.biz.util.datetimepicker({
                format: 'yyyy-MM-dd HH:mm',
                value: n,
                onSuccess: function(result) {
                    if (result.value < n) {
                        $("#see_time").val(n);
                        dd.device.notification.toast({
                            icon: '',
                            text: '时间不能小于今天',
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    } else {
                        $(thiz).val(result.value);
                    }
                },
                onFail: function() {}
            });
        });

        $("#link").click(function() {
            console.log('choose1');
            if (phoneRecord.code == '' || typeof(phoneRecord.code) == 'undefined') {
                dd.device.notification.toast({
                    icon: 'error',
                    text: '请选择客户！',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                });

                return;
            }

            cusWidget.init('phoneRecord', 'addable', phoneRecord.code, function(obj) {
                // console.log('main'+ obj);
                phoneRecord.initApi();
                $("#new-sign").show();
                $("#link").val(obj.name);
                phoneRecord.linkman = obj.name + "|" + obj.telephone + "|" + obj.position;
                // console.log(phoneRecord.linkman);
            });
        });

        $("#link_resign").click(function() {
            console.log('choose');
            if (phoneRecord.code == '' || typeof(phoneRecord.code) == 'undefined') {
                dd.device.notification.toast({
                    icon: 'error',
                    text: '请选择客户！',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                });

                return;
            }
            cusWidget.init('phoneRecord', 'addable', phoneRecord.code, function(obj) {
                phoneRecord.initApi();
                $("#resign").show();
                $("#link_resign").val(obj.name);
                phoneRecord.linkman = obj.name + "|" + obj.telephone + "|" + obj.position;

            });

        });

        $("#linkstatus").change(function() {
            var type = this.value;
            if (type == "约到负责人") {
                $("#meetTime").show();
                $("#meetPlace").show();
            } else {
                $("#meetTime").hide();
                $("#meetPlace").hide();
            }
        });
        $("#add_problem").click(function() {
            $("#add_problem").hide();
            $("#add_problem_split").hide();
            phoneRecord.initProblemBlock();
            // $("#problem_set_1").show();
            $("#addMoreProblem").show();
            phoneRecord.problemListener();
            if (phoneRecord.idset.length == 0) {
                phoneRecord.idset.push(1);
                _.assign(phoneRecord.images, {
                    '1': []
                });
            }
        });

        phoneRecord.switchCusListener();
        $("#resign_type_flag").click(function() {
            phoneRecord.initHomeCall(2);
            phoneRecord.switchCusListener();
        });

        $("#sign_type_flag").click(function() {
            phoneRecord.initHomeCall(1);
            phoneRecord.switchCusListener();
        });
    },

    switchCusListener: function() {
        $("#cusname_home").click(function() {
            console.log("obj");
            cusSelWidget.active('normal', {
                omsuid: JSON.parse(getCookie("omsUser")).id,
                token: JSON.parse(getCookie("omsUser")).token
            }, function(obj) {
                phoneRecord.initApi();
                if (obj && obj.id) {
                    phoneRecord.cusname = obj.cusname;
                    phoneRecord.code = obj.id;
                    if (phoneRecord.role == '2' || phoneRecord.role == '4')
                    {
                        if (phoneRecord.cusType == 'sign' && obj.status > 7)
                        {
                            dd.device.notification.toast({
                                icon: 'success',
                                text: '您选择的客户为续签客户！',
                                duration: 1,
                                onSuccess: function(result) {

                                },
                                onFail: function(err) {}
                            });
                            phoneRecord.initHomeCall(2);
                            phoneRecord.switchCusListener();
                        }
                    }
                    // console.log(phoneRecord.cusname);
                    // if (phoneRecord.cusType == 'resign' && phoneRecord.from === 'new' && obj.status > 7) {
                    //     var checkRenewConfigApi = oms_config.apiUrl + oms_apiList.checkRenewConfig;
                    //     phoneRecord.phoneSetting = 0;
                    //     $.ajax({
                    //         type: 'POST',
                    //         url: checkRenewConfigApi,
                    //         // data:{bid:'11'},
                    //         data: {
                    //             cusid: phoneRecord.code
                    //         },
                    //         cache: false,
                    //         success: function(data) {
                    //             var response = JSON.parse(data);
                    //             phoneRecord.phoneSetting = response.data;
                    //             if (phoneRecord.phoneSetting == 0) {
                    //                 dd.device.notification.alert({
                    //                     message: "您还未进行初始化配置，要先在电脑上进行初始化配置哦！",
                    //                     title: "提示", //可传空
                    //                     buttonName: "知道了",
                    //                     onSuccess: function() {
                    //                         history.go(0);
                    //                     },
                    //                     onFail: function(err) {}
                    //                 });
                    //                 return;
                    //             }
                    //         }
                    //     });
                    // }

                    if (phoneRecord.role == '2' || phoneRecord.role == '4')
                    {
                        if(phoneRecord.cusType == 'resign' && obj.status < 8) {
                            dd.device.notification.toast({
            										icon: 'success',
            										text: '您选择的客户为新签客户！',
            										duration: 1,
            										onSuccess: function(result) {

                                },
            										onFail: function(err) {}
            								});
                            phoneRecord.initHomeCall(1);
                            phoneRecord.switchCusListener();
                        }
                    }
                    $("#cusname_home").val(obj.cusname);
                }
            });
        });
    },
    getPhoneRecordSetting: function(id) {
        var checkRenewConfigApi = oms_config.apiUrl + oms_apiList.checkRenewConfig;
        phoneRecord.phoneSetting = 0;
        $.ajax({
            type: 'POST',
            url: checkRenewConfigApi,
            // data:{bid:'11'},
            data: {
                cusid: id
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                phoneRecord.phoneSetting = response.data;
                // console.log(phoneRecord.phoneSetting);
            }
        });
    },


    problemListener: function() {
        $("#addMoreProblem").click(function() {
            phoneRecord.renderProblemBlock();
        });
    },
    renderProblemBlock: function() {

        // var pcount = $("#problem_count").val();
        var pcount = _.last(phoneRecord.idset);
        var problem_type_1 = ($("#problem_type_" + pcount)).val();
        var problem_content_1 = $.trim(($("#problem_content_" + pcount)).val());
        if (problem_type_1 == "" || problem_content_1 == "") {
            if (problem_type_1 == "") {
                dd.device.notification.toast({
                    icon: 'error',
                    text: '请选择问题类型',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                });
                return false;
            }

            if (problem_content_1 == "") {
                dd.device.notification.toast({
                    icon: 'error',
                    text: '请填写问题内容',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                });
                return false;
            }
        }
        var new_pcount = parseInt(pcount) + parseInt(1);

        //MODIFY by lipengfei at 2016/6/25
        $("#problem_set_" + pcount).after('<div id="problem_set_' + new_pcount + '"><div class="ui-form-item-blank ui-border-tb"  style="background-color: #f5f5f6;"></div><div>' + '<div class="ui-form-item ui-form-item-input-l ui-border-b"><label>问题类型</label>' + '<div class="ui-select"> <select id="problem_type_' + new_pcount + '" name="problem_type_' + new_pcount + '"><option value="">请选择</option><option value="1">服务</option><option value="2">产品类型</option></select>' + '<i class="ui-icon-list_arrow_right"></i></div></div>' + '<div tabindex="-1" class="ui-form-camera"><div class="ui-form-item ui-border-b"> <label>问题图片</label>' + '<div class="upload-area" id="_file_btn_' + new_pcount + '" onclick="phoneRecord.uploadImage(event,' + new_pcount + ');"><div style="padding-left:85.0156px;color:#aaaec3">请上传（非必选）</div><input id="_file_' + new_pcount + '" name="_file_' + new_pcount + '" type="file" accept="image/*" name="files" onchange="phoneRecord.uploadImage(event,' + new_pcount + ');"></div><i class="ui-icon-list_addimg"></i>' + '</div><ul class="ui-form-camera-list ui-whitespace ui-border-b clearfix" id="image_list_' + new_pcount + '" ></ul></div>' + '<div class="ui-form-item ui-form-item-textarea ui-border-b" ><textarea novalidate="" rows="3" id="problem_content_' + new_pcount + '" name="roblem_content_' + new_pcount + '" placeholder="问题内容（请输入）"></textarea></div>' + '<div style="display:block;"><ul class="ui-list ui-list-text ui-list-cover ui-row-flex form-group">' + '<li class="ui-col ui-col ui-flex" id="problem_delete_' + new_pcount + '" onclick="phoneRecord.delete_problem(' + new_pcount + ')"><i id="_add_relation_" class="ui-icon-list_delete" style="font-size: 15px;color: #ec564d"></i><div class="add-content">删除</div></li></ul></div>' + '</div>');
        //根据app, 调整文件上传触发事件
        if (dd.isDingTalk) {
            $('#_file_btn_' + new_pcount).get(0).onclick = null;
        } else {
            $('#_file_' + new_pcount).get(0).onchange = null;
        }
        //MODIFY-END

        phoneRecord.idset.push(new_pcount);
        var obj = {};
        obj[new_pcount] = [];
        _.assignIn(phoneRecord.images, obj);

        // $("#problem_count").val(new_pcount);
        // $("#problem_max_count").val(new_pcount);
        // $("#problem_delete_"+pcount).append('<div class="ui-form-item ui-form-item-input-l ui-border-b"><label  onclick="phoneRecord.delete_problem('+pcount+')">删除</label></div>');
    },

    delete_problem: function(id) {
        $("#problem_set_" + id).remove();
        _.pull(phoneRecord.idset, id);
        delete phoneRecord.images[id];
        if (phoneRecord.idset.length == 0) {
            // $("#problem_set_1").hide();
            $("#addMoreProblem").hide();
            $("#add_problem").show();
            $("#add_problem_split").show();
        }
    },

    initProblemBlock: function() {
        //MODIFY by lipengfei at 2016/6/25
        // console.log('initProblemBlock');
        $("#formPhone").prepend('<div id="problem_set_1"><div class="ui-form-item-blank ui-border-tb" style="background-color: #f5f5f6;"></div>' + '<div><div class="ui-form-item ui-form-item-input-l ui-border-b"><label>问题类型</label><div class="ui-select"><select id="problem_type_1" name="problem_type_1"><option value="">请选择</option><option value="1">服务</option><option value="2">产品类型</option></select><i class="ui-icon-list_arrow_right"></i></div></div>' + '<div tabindex="-1" class="ui-form-camera"><div class="ui-form-item ui-border-b"><label>问题图片</label><div class="upload-area" id="_file_btn_1" onclick="phoneRecord.uploadImage(event,1)"><div style="padding-left:85.0156px;color:#aaaec3">请上传（非必选）</div><input id="_file_1" name="_file_1" type="file"  accept="image/*" name="files" onchange="phoneRecord.uploadImage(event,1)"></div><i class="ui-icon-list_addimg"></i></div><ul class="ui-form-camera-list ui-whitespace ui-border-b clearfix" id="image_list_1"></ul></div>' + '<div class="ui-form-item ui-form-item-textarea ui-border-b" ><textarea novalidate="" rows="3" id="problem_content_1" name="problem_content_1" placeholder="问题内容（请输入）"></textarea></div>' + '<div style="display:block;" ><ul class="ui-list ui-list-text ui-list-cover ui-row-flex form-group"><li class="ui-col ui-col ui-flex" id="problem_delete_1" onclick="phoneRecord.delete_problem(1)"><i id="_add_relation_" class="ui-icon-list_delete" style="font-size: 15px;color: #ec564d"></i><div class="add-content">删除</div></li></ul></div>' + '</div></div>')
        //根据app, 调整文件上传触发事件
        if (dd.isDingTalk) {
            $('#_file_btn_1').get(0).onclick = null;
        } else {
            $('#_file_1').get(0).onchange = null;
        }
        //MODIFY-END
    },
    ossImageUrl: function(url) {
        return url.replace('oss-cn-', 'img-cn-');
    },

    uploadImage: function(e, index) {
        e.preventDefault();
        var imageSet = _.values(phoneRecord.images[index]);

        if (imageSet.length > 4) {
            dd.device.notification.toast({
                icon: 'error',
                text: '最多上传5张图片！',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
            return;
        }

        //MODIFY by lipengfei at 2016/6/25
        function onsuccess(res) {
            $("#loading-bar").remove();
            if (res.res === 1) {
                var data = res.data;
                var imgurl = phoneRecord.ossImageUrl(data.imgurl);

                phoneRecord.images[index].push(imgurl);
                phoneRecord.renderImageList(index);
            } else {
                dd.device.notification.toast({
                    icon: 'error',
                    text: res.msg,
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                });
            }
        }
        function onfail(error) {
            $("#loading-bar").remove();
            if (error == 'ERROR_USER_CANCELLED') {
                return;
            }
            dd.device.notification.toast({
                icon: 'error',
                text: error || '网络请求失败！',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
        }

        //根据app不同，区分 inputfile 和 jsapi 上传
        if (dd.isDingTalk) {
            if (e.target.files && e.target.files[0]) {
                $("#image_list_" + index).append('<li class="ui-form-camera-item" id="loading-bar"><div class="ui-loading" style="margin-top:30px;margin-left:30px;"></div></li>');
                phoneRecord._postFileUseInputfile(e.target.files[0], onsuccess, onfail);
            }
        } else {
            $("#image_list_" + index).append('<li class="ui-form-camera-item" id="loading-bar"><div class="ui-loading" style="margin-top:30px;margin-left:30px;"></div></li>');
            var apiparams = {
                posturl: oms_config.apiUrl+oms_apiList.uploadImg,
                name: 'files',
                params: {
                    omsuid: JSON.parse(getCookie("omsUser")).id,
                    token: JSON.parse(getCookie("omsUser")).token
                }
            };
            phoneRecord._postFileUseJsapi(apiparams, onsuccess, onfail);
        }
        //MODIFY-END
    },

    //ADD by lipengfei at 2016/6/25
    _postFileUseJsapi: function(params, onsuccess, onfail) {
        var p = $.extend({}, params, {
            onSuccess: onsuccess,
            onFail: onfail
        });
        dd.biz.util.uploadImage(p);
    },

    _postFileUseInputfile: function(_file, onsuccess, onfail) {
        var fd = new FormData();
        fd.append('omsuid', JSON.parse(getCookie("omsUser")).id);
        fd.append('token', JSON.parse(getCookie("omsUser")).token);
        fd.append('files', _file);
        $.ajax({
            type: 'POST',
            url: oms_config.apiUrl+oms_apiList.uploadImg,
            data: fd,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: onsuccess,
            error: onfail
        });
    },
    //ADD-END

    renderImageList: function(index) {

        var data = phoneRecord.images[index];
        var tmpTpl = '';
        _(data).forEach(function(value, i) {
            tmpTpl += '<li class="ui-form-camera-item"><i class="ui-tag-toremove" onclick="phoneRecord.removeImage(' + index + ',' + i + ')"></i><img src="' + value + '@100w_100h_1e_1c_70q_1l_1sh.jpg" onclick="phoneRecord.previewImages(' + index + ',' + i + ')"></li>';
        });
        $("#image_list_" + index).html(tmpTpl);
    },

    renderUploadBar: function(status) {
        if (status) {
            var htmlTpl = '<div class="ui-loading" style="margin-top:30px;margin-left:30px;"></div>'
        }
    },

    removeImage: function(index, pos) {
        var data = phoneRecord.images[index];
        _.pullAt(data, pos);
        phoneRecord.renderImageList(index);
        // console.log(phoneRecord.images);
    },
    previewImages: function(index, pos) {
        var urls = [];

        function ossImager(url) {
            return url + '@_70q.jpg';
        }

        $.each(phoneRecord.images[index], function(i, value) {
            urls.push(ossImager(value));
        });

        dd.biz.util.previewImage({
            urls: urls,
            current: ossImager(phoneRecord.images[index][pos])
        });
    },

    getLocalDraft: function() {
        // window.localStorage.clear();
        // console.log(localStorage);
        var draftId = getUrlParam('draftId'),
            draftObj;
        // var draftId = '1353168', draftObj;
        // console.log(draftId);
        if (draftId) {

            draftObj = draftWork.get(draftId);
            if (draftObj) {
                console.log(draftObj);
                if (draftObj.hasOwnProperty('cusname')) {
                    phoneRecord.cusname = draftObj.cusname;
                } else {
                    phoneRecord.cusname = '';
                }
                phoneRecord.linkman = draftObj.record.linkman;
                phoneRecord.from = draftObj.record.from;
                phoneRecord.code = draftObj.cusid;
                phoneRecord.draftId = draftObj._oid;
                phoneRecord.recordData = draftObj.record;
                phoneRecord.do = draftObj.record.do;
                phoneRecord.recordid = draftObj.record.recordid;
            }
        }
    },

    draftRecord: function() {
        console.log(phoneRecord.cusType);
        if (phoneRecord.cusType == 'sign') {
            var draftData = {
                recordid: phoneRecord.recordid,
                do: phoneRecord.do,
                from: phoneRecord.from,
                linkstatus: $.trim($("#linkstatus").val()),
                linkman: phoneRecord.linkman,
                legworknumber: $.trim($("#legworknumber_sign").val()),
                carnumber: $.trim($("#carnumber_sign").val()),
                next_time: $.trim($("#next_time_sign").val()),
                content: $.trim($("#content_sign").val()),
                see_time: $.trim($("#see_time").val()),
                see_addr: $.trim($("#see_addr").val())
            }

            var draftObj = {
                type: 'phoneRecord',
                title: phoneRecord.cusname || '待补充',
                cusname: phoneRecord.cusname,
                cusid: phoneRecord.code,
                record: draftData
            };

            var draftId = draftWork.set(phoneRecord.draftId, draftObj);

        }
        if (phoneRecord.cusType == 'resign') {
            //问题列表
            var question = new Array();
            _(phoneRecord.idset).forEach(function(value) {
                var questionTypeArray = ($("#problem_type_" + value)).val();
                var questionContentArray = $.trim($("#problem_content_" + value).val());
                var imageSet = _.values(phoneRecord.images[value]);
                var quest_item = {};
                quest_item = {
                    "questionTypeArray": questionTypeArray,
                    "questionImgArray": imageSet,
                    "questionContentArray": questionContentArray
                };
                question.push(quest_item);
            });
            var draftData = {
                recordid: phoneRecord.recordid,
                do: phoneRecord.do,
                from: phoneRecord.from,
                review_type: ($("#review_type")).val(),
                linkman: phoneRecord.linkman,
                legworknumber: $.trim($("#legworknumber").val()),
                carnumber: $.trim($("#carnumber").val()),
                next_time: $.trim($("#next_time").val()),
                content: $.trim($("#content").val()),
                question: question
            }
            var draftObj = {
                type: 'phoneRecord',
                title: phoneRecord.cusname || '待补充',
                cusname: phoneRecord.cusname,
                cusid: phoneRecord.code,
                record: draftData
            };
            var draftId = draftWork.set(phoneRecord.draftId, draftObj);

        }

    },

    init: function() {
        phoneRecord.initApi();
        phoneRecord.getMeetingInfo();
        if(phoneRecord.recordid != '')
        {
            phoneRecord.getInfo();
        }else{
            phoneRecord.setContent();
            phoneRecord.phoneRecordListener();
        }

    }
};

$.fn.phoneRecord = function(settings) {
    $.extend(phoneRecord, settings || {});
};
$.fn.ready(function() {
    phoneRecord.init();
});
