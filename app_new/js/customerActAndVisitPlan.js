/**
 * Created by yuxunbin on 2016/4/28.
 */

$(document).ready(function(){

//    listenTab();
//    $("#list").tap(function(){
//        listenTab();
//    });
    getCustomerActData();
    getVisitPlanData();

});

function listenTab(){
    if($("#hecom-tab .current").attr('id') == 'tab2'){
        getCustomerActData();
    }else if($("#hecom-tab .current").attr('id') == 'tab3'){
        getVisitPlanData();
    }
}

function typeSelectFun(){
//    console.log($('#typeSelect').val());
    if($('#typeSelect').val() == "拜访"){
        $('#typeSelect').val("拜访");
        $(".customerActVisitFrame").show();
        $(".customerActSubVisitFrame").hide();
        $(".customerActCallFrame").hide();
        $(".customerActTrainFrame").hide();
    }else if($('#typeSelect').val() == "陪访"){
        $('#typeSelect').val("陪访");
        $(".customerActVisitFrame").hide();
        $(".customerActSubVisitFrame").show();
        $(".customerActCallFrame").hide();
        $(".customerActTrainFrame").hide();
    }else if($('#typeSelect').val() == "电话记录"){
        $('#typeSelect').val("电话记录");
        $(".customerActVisitFrame").hide();
        $(".customerActSubVisitFrame").hide();
        $(".customerActCallFrame").show();
        $(".customerActTrainFrame").hide();
    }else if($('#typeSelect').val() == "培训"){
        $('#typeSelect').val("培训");
        $(".customerActVisitFrame").hide();
        $(".customerActSubVisitFrame").hide();
        $(".customerActCallFrame").hide();
        $(".customerActTrainFrame").show();
    }else if($('#typeSelect').val() == "全部工作"){
        $('#typeSelect').val("全部工作");
        $(".customerActVisitFrame").show();
        $(".customerActSubVisitFrame").show();
        $(".customerActCallFrame").show();
        $(".customerActTrainFrame").show();
    }
}

function goToVisit(type,cusId,rid){
    if(type === 'baifang' || type === 'subvisit'){
        openLink('visitDescribe.html?cusId='+cusId+'&rId='+rid);
    }else if(type === 'phoneRecord'){
        openLink('phoneRecordDescribe.html?cusId='+cusId+'&rId='+rid);
    }else if(type === 'train'){
        openLink('trainDescribe.html?cusId='+cusId+'&rId='+rid);
    }
}

function checkTrue(value){
    if(!value){
        return '';
    }
    return value;
}

function assessAdd(type, id, method, init){
  var userInfo = JSON.parse(getCookie('omsUser'));
  var tag;
  if(type==1){
      tag = '理单';
  }else{
      tag = '拜访';
  }
  var init_status;
  //check status
  var assessAddApi = oms_config.apiUrl+oms_apiList.assessAdd+'?rand='+Math.random();
  $.ajax({
      type: 'POST',
      url: assessAddApi,
      data: {
          'omsuid': JSON.parse(getCookie('omsUser')).id,
          'token': JSON.parse(getCookie('omsUser')).token,
          'cusid': cusInfo.code,
          'details_id': id,
          'details': method,
          'type': type,
          'is_check': 1
      },
      cache: false,
      success: function(data) {
          var response = JSON.parse(data);
          if (response.res == '-1') {
            if(type==2){
                init_status = $('#visitComment_'+id).data('status');
            }else{
                init_status = $('#lidanComment_'+id).data('status');
            }

            if(method != init_status){
              if(init_status == -1){
                  postCommentApi(type, id, method, init, 0);
              }else{
                  dd.device.notification.confirm({
                      message: "确定要改变"+tag+"评价么？",
                      title: "提示",
                      buttonLabels: ['否', '是'],
                      onSuccess: function(result) {
                          if (result.buttonIndex === 1) {
                              postCommentApi(type, id, method, init, 0);
                          } else {
                              return false;
                          }
                      },
                      onFail: function(err) {}
                  });
              }
            }
          } else {
              dd.device.notification.toast({
                  icon: 'error',
                  text: response.msg,
                  duration: 1,
                  onSuccess: function(result) {},
                  onFail: function(err) {}
              });
          }
      }
  });

  // if(type==2){
  //     init_status = $('#visitComment_'+id).data('status');
  // }else{
  //     init_status = $('#lidanComment_'+id).data('status');
  // }
  //
  // if(method != init_status){
  //   if(init_status == -1){
  //       postCommentApi(type, id, method, init, 1);
  //   }else{
  //       dd.device.notification.confirm({
  //           message: "确定要改变"+tag+"评价么？",
  //           title: "提示",
  //           buttonLabels: ['否', '是'],
  //           onSuccess: function(result) {
  //               if (result.buttonIndex === 1) {
  //                   postCommentApi(type, id, method, init);
  //               } else {
  //                   return false;
  //               }
  //           },
  //           onFail: function(err) {}
  //       });
  //   }
  // }

}

function postCommentApi(type, id, method, init, is_check){
  var assessAddApi = oms_config.apiUrl+oms_apiList.assessAdd+'?rand='+Math.random();
  $.ajax({
      type: 'POST',
      url: assessAddApi,
      data: {
          'omsuid': JSON.parse(getCookie('omsUser')).id,
          'token': JSON.parse(getCookie('omsUser')).token,
          'cusid': cusInfo.code,
          'details_id': id,
          'details': method,
          'type': type,
          'is_check': is_check
      },
      cache: false,
      success: function(data) {
          var response = JSON.parse(data);
          if (response.res == 1) {
            dd.device.notification.toast({
                icon: 'success',
                text: '评价成功！',
                duration: 1,
                onSuccess: function(result) {
                    if(type == 1){
                      $('#lidanComment_'+id).attr('data-status', method);
                      if(method == 0){
                          $('#lidanCommentYes_'+id).removeClass('noComment');
                          $('#lidanCommentNo_'+id).removeClass('noComment');
                          $('#lidanCommentYes_'+id).addClass('noComment');
                          $('#lidanCommentYesIcon_'+id).removeClass('noComment');
                          $('#lidanCommentNoIcon_'+id).removeClass('noComment');
                          $('#lidanCommentYesIcon_'+id).addClass('noComment');
                      }
                      if(method == 1){
                          $('#lidanCommentYes_'+id).removeClass('noComment');
                          $('#lidanCommentNo_'+id).removeClass('noComment');
                          $('#lidanCommentNo_'+id).addClass('noComment');
                          $('#lidanCommentYesIcon_'+id).removeClass('noComment');
                          $('#lidanCommentNoIcon_'+id).removeClass('noComment');
                          $('#lidanCommentNoIcon_'+id).addClass('noComment');
                      }
                    }
                    if(type == 2){
                      $('#visitComment_'+id).attr('data-status', method);
                      console.log('aaa');
                      if(method == 0){
                          $('#visitCommentYes_'+id).removeClass('noComment');
                          $('#visitCommentNo_'+id).removeClass('noComment');
                          $('#visitCommentYes_'+id).addClass('noComment');
                          $('#visitCommentYesIcon_'+id).removeClass('noComment');
                          $('#visitCommentNoIcon_'+id).removeClass('noComment');
                          $('#visitCommentYesIcon_'+id).addClass('noComment');
                      }
                      if(method == 1){
                          $('#visitCommentYes_'+id).removeClass('noComment');
                          $('#visitCommentNo_'+id).removeClass('noComment');
                          $('#visitCommentNo_'+id).addClass('noComment');
                          $('#visitCommentYesIcon_'+id).removeClass('noComment');
                          $('#visitCommentNoIcon_'+id).removeClass('noComment');
                          $('#visitCommentNoIcon_'+id).addClass('noComment');
                      }
                    }
                    // history.go(0);
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
      }
  });
}
function getCustomerActData(){
    var key_set = {};
    var getWorkStateListApi=oms_config.apiUrl+oms_apiList.getWorkStateList+'?rand='+Math.random();
    //cusInfo.role为1和3是新签，2和4是续签
    var signType = '1';
    if((cusInfo.role == 1)||(cusInfo.role == 3)){
        signType = '1';
    }else if((cusInfo.role == 2)||(cusInfo.role == 4)){
        signType = '0';
    }
    if(signType == '1'){
        //新签
        $('#trainSelectId').remove();   //删除培训选项
        $.post(getWorkStateListApi,
            {
                'cusid' : cusInfo.code,
                'signType':1
            },
            function (result) {
                if(!result.data){
                    $("#customerActPic").show();
                    $("#customerActSelect").hide();
                    $("#customerActContent").hide();
                    var divHeight = ($(window).height() - 155 - 1)+'px';
                    $("#customerActPic").css('text-align','center').css('height',divHeight);
                    $('#customerActPic #customerActPicId').before('<img src="./img/lidanIcon.png" style="margin-top: 20%;width: 60px;">');
                    return ;
                }
                var html = '';
                $.each(result.data,function(key,value){
                    if(value['type'] == 'visit'){
                        // if(value['peifang'])
                        // {
                        //     var html1 = '<div class="customerActVisitFrame" onclick="goToVisit(\'baifang\''+','+value['cusid']+','+value['id']+');"><div class="customerActFrameLine1"><span class="customerActVisit">拜访</span><span class="customerActSubordinate">';
                        //     var html2 = '</span><span class="customerActLeader">';
                        //     var html3 = '</span><span class="customerActVisitStartTime">';
                        //     var html4 = '</span></div><div class="customerActContent"><div class="customerActFrameLine2">';
                        //     var html5 = '</div><div class="customerActFrameLine3">';
                        //     var html6 = '</div></div></div>';

                        //     html += html1 + checkTrue(value['operator']) + html2 + checkTrue(value['peifang_name']) + html3 + checkTrue(value['create_time']) + html4 + checkTrue(value['content']) + html5 + checkTrue(value['peifang']) + html6;
                        // }else{
                        var visitCommentYes = '';
                        var visitCommentNo = '';
                        if(value.assess == '-1'){
                            visitCommentYes = 'noComment';
                            visitCommentNo = 'noComment';
                        }
                        if(value.assess == '0'){
                            visitCommentYes = 'noComment';
                        }
                        if(value.assess == '1'){
                            visitCommentNo = 'noComment';
                        }
                        var html_comment = '<div style="overflow:hidden; height:30px; line-height:30px; font-size:13px;color:#333; padding-top:10px" data-status="'+value.assess+'" id="visitComment_'+value.id+'">'+
                                          '<div style="width:50%; float:left;"  id="visitCommentYes_'+value.id+'" class="visitCommentYes '+visitCommentYes+'" onclick="assessAdd(\'2\', '+value.id+', \'1\','+value.assess+')">'+
                                          '<i class="ui-icon-appraisal_good '+visitCommentYes+'" id="visitCommentYesIcon_'+value.id+'" style="font-size: 18px;float: left;padding-right: 15px;height: 30px;line-height: 30px;color:#333"></i>拜访认真</div>'+
                                          '<div style="width:50%; float:left;" id="visitCommentNo_'+value.id+'" class="visitCommentNo '+visitCommentNo+'" onclick="assessAdd(\'2\', '+value.id+', \'0\','+value.assess+')">'+
                                          '<i class="ui-icon-appraisal_bad '+visitCommentNo+'" id="visitCommentNoIcon_'+value.id+'" style="font-size: 18px;float: left;padding-right: 15px;height: 30px;line-height: 30px;color:#333"></i>拜访不认真</div></div>';
                        var html1 = '<div class="customerActVisitFrame"><div onclick="goToVisit(\'baifang\''+','+value['cusid']+','+value['id']+');"><div class="customerActFrameLine1"><span class="customerActVisit">拜访</span><span class="customerActSubordinate">';
                        var html2 = '</span><span class="customerActVisitStartTime">';
                        var html3 = '</span></div><div class="customerActContent ui-border-b" style="padding-bottom:11px;"><span>';
                        var html4 = '</span></div></div>';
                        var html6 = '</div>'
                        html += html1 + checkTrue(value['operator']) + html2 + checkTrue(value['create_time']) + html3 + checkTrue(value['content']) + html4 + html_comment + html6;
                        // }
                    }else if (value['type'] == 'subvisit'){
                        var html1 = '<div class="customerActSubVisitFrame" onclick="goToVisit(\'subvisit\''+','+value['cusid']+','+value['id']+');"><div class="customerActFrameLine1"><span class="customerActSubVisit">陪访</span><span class="customerActSubordinate">';
                        var html2 = '</span><span class="customerActVisitStartTime">';
                        var html3 = '</span></div><div class="customerActContent"><span>';
                        var html4 = '</span></div></div>';

                        html += html1 + checkTrue(value['operator']) + html2 + checkTrue(value['create_time']) + html3 + checkTrue(value['content']) + html4;
                    }else if(value['type'] == 'call'){
                        // ADD_START: recordurl
                        if (value['recordurl']) {
                            var html1 = '';
                            key_set[key] = value['recordurl'];
                            if(value['content']==null || value['content'] == ''){
                                var html1 = '<div class="customerActCallFrame"><div class="customerActFrameLine1"><span class="customerActPhoneRecords">电话录音</span><span class="customerActSubordinate">';
                            }else {
                                var html1 = '<div class="customerActCallFrame"><div class="customerActFrameLine1"  onclick="goToVisit(\'phoneRecord\''+','+value['cusid']+','+value['id']+');"><span class="customerActPhoneRecords">电话录音</span><span class="customerActSubordinate">';
                            }
                            var html2 = '</span><span class="customerActVisitStartTime">';
                            var html3 = '</span></div><div class="customerActContent"><span>';
                            var html4 = '</span></div></div>';

                            var audioHtml ='<div id="jquery_jplayer_'+key+'" class="jp-jplayer"></div><div style="position:relative;background-color:#fff;padding-bottom:0.75rem">'+
                                            '<div id="jp_container_'+key+'" class="jp-audio" role="application" aria-label="media player">'+
                                            '<div class="jp-type-single">'+
                                            '<div class="jp-gui jp-interface">'+
                                            '<div class="jp-controls">'+
                                            '<button class="jp-play" role="button" tabindex="0">play</button>'+
                                            '</div>'+
                                            '<div class="jp-progress" style="width:10.25rem">'+
                                            '<div class="jp-seek-bar">'+
                                            '<div class="jp-play-bar"></div>'+
                                            '</div>'+
                                            '</div>'+
                                            '<div class="jp-time-holder" style="width:10.25rem">'+
                                            '<div class="jp-current-time" role="timer" aria-label="time">&nbsp;</div>'+
                                            '<div class="jp-duration" role="timer" aria-label="duration">&nbsp;</div></div></div>'+
                                            '</div></div></div>';

                            html += html1 + checkTrue(value['operator']) + html2 + checkTrue(value['create_time']) + html3 + audioHtml + checkTrue(value['content']) + html4;
                            return ;
                        }
                        // ADD_END: recordurl
                        var html1 = '<div class="customerActCallFrame" onclick="goToVisit(\'phoneRecord\''+','+value['cusid']+','+value['id']+');"><div class="customerActFrameLine1"><span class="customerActPhoneRecords">电话记录</span><span class="customerActSubordinate">';
                        var html2 = '</span><span class="customerActVisitStartTime">';
                        var html3 = '</span></div><div class="customerActContent"><span>';
                        var html4 = '</span></div></div>';

                        html += html1 + checkTrue(value['operator']) + html2 + checkTrue(value['create_time']) + html3 + checkTrue(value['content']) +html4;
                    }
                });

                $("#customerActContent").html(html);
                renderAudio(key_set);
            }, 'json');
    }else if(signType == '0'){
        //续签
        $.post(getWorkStateListApi,
            {
                'cusid' : cusInfo.code,
                'signType':0
            },
            function (result) {
                if(!result.data){
                    $("#customerActPic").show();
                    $("#customerActSelect").hide();
                    $("#customerActContent").hide();
                    var divHeight = ($(window).height() - 155 - 1)+'px';
                    $("#customerActPic").css('text-align','center').css('height',divHeight);
                    $('#customerActPic #customerActPicId').before('<img src="./img/lidanIcon.png" style="margin-top: 20%;width: 60px;">');
                    return ;
                }
                var html = '';
                $.each(result.data,function(key,value){
                    if(value['type'] == 'visit'){
                        // if(value['peifang'])
                        // {
                        //     var html1 = '<div class="customerActVisitFrame" onclick="goToVisit(\'baifang\''+','+value['cusid']+','+value['id']+');"><div class="customerActFrameLine1"><span class="customerActVisit">拜访</span><span class="customerActSubordinate">';
                        //     var html2 = '</span><span class="customerActLeader">';
                        //     var html3 = '</span><span class="customerActVisitStartTime">';
                        //     var html4 = '</span></div><div class="customerActContent"><div class="customerActFrameLine2">';
                        //     var html5 = '</div><div class="customerActFrameLine3">';
                        //     var html6 = '</div></div></div>';

                        //     html += html1 + checkTrue(value['operator']) + html2 + checkTrue(value['peifang_name']) + html3 + checkTrue(value['create_time']) + html4 + checkTrue(value['content']) + html5 + checkTrue(value['peifang']) + html6;
                        // }else{
                        var visitCommentYes = '';
                        var visitCommentNo = '';
                        if(value.assess == '-1'){
                            visitCommentYes = 'noComment';
                            visitCommentNo = 'noComment';
                        }
                        if(value.assess == '0'){
                            visitCommentYes = 'noComment';
                        }
                        if(value.assess == '1'){
                            visitCommentNo = 'noComment';
                        }
                        var html_comment = '<div style="overflow:hidden; height:30px; line-height:30px; font-size:13px;color:#333; padding-top:10px" data-status="'+value.assess+'" id="visitComment_'+value.id+'">'+
                                          '<div style="width:50%; float:left;"  id="visitCommentYes_'+value.id+'" class="visitCommentYes '+visitCommentYes+'" onclick="assessAdd(\'2\', '+value.id+', \'1\','+value.assess+')">'+
                                          '<i class="ui-icon-appraisal_good '+visitCommentYes+'" id="visitCommentYesIcon_'+value.id+'" style="font-size: 18px;float: left;padding-right: 15px;height: 30px;line-height: 30px;color:#333"></i>拜访认真</div>'+
                                          '<div style="width:50%; float:left;" id="visitCommentNo_'+value.id+'" class="visitCommentNo '+visitCommentNo+'" onclick="assessAdd(\'2\', '+value.id+', \'0\','+value.assess+')">'+
                                          '<i class="ui-icon-appraisal_bad '+visitCommentNo+'" id="visitCommentNoIcon_'+value.id+'" style="font-size: 18px;float: left;padding-right: 15px;height: 30px;line-height: 30px;color:#333"></i>拜访不认真</div></div>';

                            var html1 = '<div class="customerActVisitFrame" onclick="goToVisit(\'baifang\''+','+value['cusid']+','+value['id']+');"><div class="customerActFrameLine1"><span class="customerActVisit">拜访</span><span class="customerActSubordinate">';
                            var html2 = '</span><span class="customerActVisitStartTime">';
                            var html3 = '</span></div><div class="customerActContent"><span>';
                            var html4 = '</span></div>';
                            var html6 = '</div>'

                            html += html1 + checkTrue(value['operator']) + html2 + checkTrue(value['create_time']) + html3 + checkTrue(value['content']) + html4 + html_comment + html6;
                        // }
                    }else if (value['type'] == 'subvisit'){
                        var html1 = '<div class="customerActSubVisitFrame" onclick="goToVisit(\'subvisit\''+','+value['cusid']+','+value['id']+');"><div class="customerActFrameLine1"><span class="customerActVisit">陪访</span><span class="customerActSubordinate">';
                        var html2 = '</span><span class="customerActVisitStartTime">';
                        var html3 = '</span></div><div class="customerActContent"><span>';
                        var html4 = '</span></div></div>';

                        html += html1 + checkTrue(value['operator']) + html2 + checkTrue(value['create_time']) + html3 + checkTrue(value['content']) + html4;
                    }else if(value['type'] == 'call'){
                        // ADD_START: recordurl
                        if (value['recordurl']) {
                            var html1 = '';
                            key_set[key] = value['recordurl'];
                            if(value['content']==null || value['content'] == ''){
                                var html1 = '<div class="customerActCallFrame"><div class="customerActFrameLine1"><span class="customerActPhoneRecords">电话录音</span><span class="customerActSubordinate">';
                            }else {
                                var html1 = '<div class="customerActCallFrame"><div class="customerActFrameLine1" onclick="goToVisit(\'phoneRecord\''+','+value['cusid']+','+value['id']+');"><span class="customerActPhoneRecords">电话录音</span><span class="customerActSubordinate">';
                            }
                            var html2 = '</span><span class="customerActVisitStartTime">';
                            var html3 = '</span></div><div class="customerActContent"><span>';
                            var html4 = '</span></div></div>';

                            var audioHtml ='<div id="jquery_jplayer_'+key+'" class="jp-jplayer"></div><div style="position:relative;background-color:#fff;padding-bottom:0.75rem">'+
                                            '<div id="jp_container_'+key+'" class="jp-audio" role="application" aria-label="media player">'+
                                            '<div class="jp-type-single">'+
                                            '<div class="jp-gui jp-interface">'+
                                            '<div class="jp-controls">'+
                                            '<button class="jp-play" role="button" tabindex="0">play</button>'+
                                            '</div>'+
                                            '<div class="jp-progress" style="width:10.25rem">'+
                                            '<div class="jp-seek-bar">'+
                                            '<div class="jp-play-bar"></div>'+
                                            '</div>'+
                                            '</div>'+
                                            '<div class="jp-time-holder" style="width:10.25rem">'+
                                            '<div class="jp-current-time" role="timer" aria-label="time">&nbsp;</div>'+
                                            '<div class="jp-duration" role="timer" aria-label="duration">&nbsp;</div></div></div>'+
                                            '</div></div></div>';

                            html += html1 + checkTrue(value['operator']) + html2 + checkTrue(value['create_time']) + html3 + audioHtml +checkTrue(value['content'])+ html4;
                            return ;
                        }
                        // ADD_END: recordurl
                        var html1 = '<div class="customerActCallFrame" onclick="goToVisit(\'phoneRecord\''+','+value['cusid']+','+value['id']+');"><div class="customerActFrameLine1"><span class="customerActPhoneRecords">电话记录</span><span class="customerActSubordinate">';
                        var html2 = '</span><span class="customerActVisitStartTime">';
                        var html3 = '</span></div><div class="customerActContent"><span>';
                        var html4 = '</span></div></div>';

                        html += html1 + checkTrue(value['operator']) + html2 + checkTrue(value['create_time']) + html3 + checkTrue(value['content']) +html4;
                    }else if(value['type'] == 'train'){
                        var html1 = '<div class="customerActTrainFrame" onclick="goToVisit(\'train\''+','+value['cusid']+','+value['id']+');"><div class="customerActFrameLine1"><span class="customerActTraining">培训</span><span class="customerActSubordinate">';
                        var html2 = '</span><span class="customerActVisitStartTime">';
                        var html3 = '</span></div><div class="customerActContent"><span>';
                        var html4 = '</span></div></div>';

                        html += html1 + checkTrue(value['operator']) + html2 + checkTrue(value['ctime']) + html3 + checkTrue(value['remark']) +html4;
                    }

                });

                $("#customerActContent").html(html);
                renderAudio(key_set);
            }, 'json');
    }

}

function renderAudio(key_set){
    $.each(key_set,function(key,value){
        $("#jquery_jplayer_"+key).jPlayer({
            ready: function () {
                $(this).jPlayer("setMedia", {
                    wav: value
                });
            },
            cssSelectorAncestor: "#jp_container_"+key,
            swfPath: "/js/lib",
            supplied: "wav",
            useStateClassSkin: true,
            autoBlur: false,
            smoothPlayBar: false,
            keyEnabled: true,
            remainingDuration: true,
            toggleDuration: true,
        });
    })

}
function getVisitPlanData(){
    //cusInfo.role为1和3是新签，2和4是续签
    //只有leader才能理单
//    if(cusInfo.role == 2 || cusInfo.role == 3){
//        var lidanDivHeight = ($(window).height() - 155 - 1)+'px';
//        $("#lidanPic").show();
//        $("#lidanPic").css('text-align','center').css('height',lidanDivHeight);
//        $('#lidanPic #lidanPicId').before('<img src="./img/lidanIcon.png" style="margin-top: 20%;width: 60px;">');
//        $("#lidanPicId").text("每一次理单");
//        $("#lidanPicIdSec").text("都离成功更近一步");
//        return ;
//    }
    var signType = 0;
    if(cusInfo.role == 1 || cusInfo.role == 3){
        signType = 0;
    }else if(cusInfo.role == 2 || cusInfo.role == 4){
        signType = 1;
    }
    var getVisitPlanListApi=oms_config.apiUrl+'billing/lidanRecord'+'?rand='+Math.random();
    $.post(getVisitPlanListApi,
        {
            'cusid' : cusInfo.code,
            'do': signType   //0代表新签，1代表续签
        },
        function (result) {
            if(!result.res){
                //如果没有理单记录
                var lidanDivHeight = ($(window).height() - 155 - 1)+'px';
                $("#lidanPic").show();
                $("#lidanPic").css('text-align','center').css('height',lidanDivHeight);
                $('#lidanPic #lidanPicId').before('<img src="./img/lidanIcon.png" style="margin-top: 20%;width: 60px;">');
                $("#lidanPicId").text("每一次理单");
                $("#lidanPicIdSec").text("都离成功更近一步");
                return ;
            }
            var html = '';
            $.each(result.res,function(key,value){
                var lidanCommentYes = '';
                var lidanCommentNo = '';
                if(value.assess == '-1'){
                    lidanCommentYes = 'noComment';
                    lidanCommentNo = 'noComment';
                }
                if(value.assess == '0'){
                    lidanCommentYes = 'noComment';
                }
                if(value.assess == '1'){
                    lidanCommentNo = 'noComment';
                }

                var html_comment = '<div style="overflow:hidden; height:30px; line-height:30px; font-size:13px;color:#333" data-status="'+value.assess+'" id="lidanComment_'+value.id+'">'+
                                    '<div style="width:50%; float:left;" id="lidanCommentYes_'+value.id+'" class="lidanCommentYes '+lidanCommentYes+' " onclick="assessAdd(\'1\', '+value['id']+', \'1\')">'+
                                    '<i class="ui-icon-appraisal_good '+lidanCommentYes+'" id="lidanCommentYesIcon_'+value.id+'" style="font-size: 18px;float: left;padding-right: 15px;height: 30px;line-height: 30px;color:#333"></i>理单认真</div>'+
                                    '<div style="width:50%; float:left;" id="lidanCommentNo_'+value.id+'" class="lidanCommentNo '+lidanCommentNo+'" onclick="assessAdd(\'1\', '+value.id+', \'0\')">'+
                                    '<i class="ui-icon-appraisal_bad '+lidanCommentNo+'" id="lidanCommentNoIcon_'+value.id+'" style="font-size: 18px;float: left;padding-right: 15px;height: 30px;line-height: 30px; color:#333"></i>理单不认真</div></div>';

                if(value['follow_remark'] != '')
                {
                    var html1 = '<li><div class="visitPlanFrame"><div class="ui-border-b"><span style="color: #333;font-size:15px;">';
                    var html2 = '</span><span style="margin-left: 5px;font-size:13px;color:#666;">';
                    var html3 = '</span><span style="float: right;font-size:10px;color:#666;">';
                    var html4 = '</span></div><div class="ui-border-b" style="font-size:13px;color:#666;"><div><span>经理评级:</span><span>';
                    var html5 = '</span></div><div><span>跟进状态:</span><span>';
                    var html6 = '</span></div></div><div class="ui-border-b"><span style="display: inline-block;background: #ec564d;width: 60px;height: 20px;border-radius: 6px;text-align: center;color: #fff;font-size: 12px;line-height:20px;margin-right:5px;">指导建议</span><span style="color:#666;font-size:13px;">';
                    var html7 = '</span></div>';
                    var html9 = '</div></li>';
                    html += html1 + value['operator'] + html2 + value['position'] + html3 + value['create_time'] + html4 + value['level'] + html5 + value['follow_type'] + html6 + value['follow_remark'] + html7 + html_comment + html9;
                }else{
                    var html1 = '<li><div class="visitPlanFrame"><div class="ui-border-b"><span style="color: #333;font-size:15px;">';
                    var html2 = '</span><span style="margin-left: 5px;font-size:13px;color:#666;">';
                    var html3 = '</span><span style="float: right;font-size:10px;color:#666;">';
                    var html4 = '</span></div><div class="ui-border-b" style="font-size:13px;color:#666;"><div><span>经理评级:</span><span>';
                    var html5 = '</span></div><div><span>跟进状态:</span><span>';
                    var html6 = '</span></div></div>';
                    var html8 = '</div></li>';
                    html += html1 + value['operator'] + html2 + value['position'] + html3 + value['create_time'] + html4 + value['level'] + html5 + value['follow_type'] + html6 + html_comment + html8;
                }
            });
            $("#visitPlanUL").html(html);

        }, 'json');
}
