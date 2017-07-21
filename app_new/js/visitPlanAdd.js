/**
 * Created by yuxunbin on 2016/5/2.
 */
var __$$VisitPlanAddVersion = 1;

function getQueryString(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var result = window.location.search.substr(1).match(reg);
    if (result) {
        return decodeURIComponent(result[2]);
    }
}

var visitPlanAdd = {
    user: null,
    visitId : null,   //拜访id
    code : null,   //客户id
    cusname : null,   //客户名称
    reportPic : '',
    problemStyleArray : [],
    problemPictureArray : [],
    problemContentArray : [],
    draftId : '',    //保存草稿id
    changed: false,
    subvisit : '0',   //是否陪访

    initRight : function(){
        var self = this;
        dd.biz.navigation.setRight({
            show: true,
            control: true,
            showIcon: true,
            text: '确定',
            onSuccess : function(result) {
                self.postData();
            },
            onFail : function(err) {}
        });
    },

    restoreDraftState: function(draftObj) {
        visitPlanAdd.draftId = draftObj._oid;
        function transToMap(serArray) {
            var serMap = {};
            serArray.forEach(function(pair) {
                var name = pair.name;
                if (name.substr(-2) == '[]') {
                    serMap[name] = serMap[name] || [];
                    serMap[name].push(pair.value);
                } else {
                    serMap[name] = pair.value;
                }
            });
            return serMap;
        }
        var $form = $('#myform'), serializeMap = transToMap(draftObj.record || []);
        var directNames = [
            'cusidName',
            'cuscodeName',
            'fieldPeopleNumberName',
            'carNumberName',
            'mylevelName',
            'nextVisitTimeName',
            'nextVisitPlaceName',
            'recordName',
            'record1_4Name',
            'cusid2Name',
            'cuscode2Name',
            'fieldPeopleNumber2Name',
            'carNumber2Name',
            // 'report_images',
            // 'report_urls',
            'record2Name',
            'subvisit_cusidName',
            'subvisit_cuscodeName'
        ];
        directNames.forEach(function(name) {
            if (serializeMap[name]) {
                $form.find('[name="'+name+'"]').val(serializeMap[name]);
            }
        });

        //如果存在实施报告数据
        if (serializeMap['report_urls']) {
            var imageUrlArray = serializeMap['report_urls'].split(",");
            //将url转换成图片
            var $question_item = $("#doReportHiddenInput").closest('.list-item');
            imageUrlArray.forEach(function(imageUrlItem){
                visitPlanAdd.appendQuestionImage($question_item, imageUrlItem ,1);
            });

        }

        // trigger changed
        // $('#cusid').trigger('change', [true]);
        // $('#fieldPeopleNumber').trigger('change', [true]);
        // $('#carNumber').trigger('change', [true]);
        // $('#mylevel').trigger('change', [true]);
        // $('#record').trigger('change', [true]);
        // $('#record1_4').trigger('change', [true]);
        // $('#cusid2').trigger('change', [true]);
        // $('#fieldPeopleNumber2').trigger('change', [true]);
        // $('#carNumber2').trigger('change', [true]);
        // $('#report_images').trigger('change', [true]);
        // $('#record2').trigger('change', [true]);
        // $('.problemStyleSelect').trigger('change', [true]);
        // $('.problemPictureStyle').trigger('change', [true]);
        // $('.problemContent').trigger('change', [true]);

        var questioncates = serializeMap['question_cate[]'] || [],
            questionimages = serializeMap['question_images[]'] || [],
            questionurls = serializeMap['question_urls[]'] || [],
            questionconts = serializeMap['question_content[]'] || [];
        var questionitems = [], scope = visitPlanAdd;

        if (questioncates.length == questionurls.length && questioncates.length == questionconts.length) {
            for (var i = 0; i < questioncates.length; i++) {
                questionitems.push({
                    'cate': questioncates[i],
                    'image' : questionimages[i],
                    'urls': questionurls[i],
                    'content': questionconts[i]
                });
            }
        }

        questionitems.forEach(function(item,key) {
            var $question_item = scope.addQuestion();
            console.log(questionitems.length);
            // var $question_item = (key == questionitems.length-1)?scope.addQuestion('add'):scope.addQuestion('del');
            if ($question_item) {
                $question_item.find('[name="question_cate[]"]').val(item.cate);
                $question_item.find('[name="question_images[]"]').val(item.image);
                if (item.urls && item.urls.length) {
                    var urls = item.urls.split(',');
                    urls.forEach(function(url) {
                        url && scope.appendQuestionImage($question_item, url);
                    });
                }
                $question_item.find('[name="question_content[]"]').val(item.content);
            }
        });
    },

    addQuestion : function(){
        var uiForm = $("#addProblemDescribeFrame").closest('.ui-form');
        uiForm.hide();   //添加问题描述隐藏
        $("#problemList").show();   //将问题添加栏显示

        // if(flag == 'add'){
        //     var $problemListHtml = visitPlanAdd.appendHtmlTo("problemList");
        //     $problemListHtml.find('.ui-icon-add').closest(".ui-form-item").html('<i class="ui-icon-delete problemDeleteItem"></i>');
        //     return $problemListHtml;
        // }
        // return visitPlanAdd.appendHtmlTo("problemList");

        var $problemListHtml = visitPlanAdd.appendHtmlTo("problemList");
        $(".problemAddItem").hide();
        $(".problemAddItem").eq($(".problemDeleteItem").length - 1).show();

        return $problemListHtml;
    },

    checkDraftStatus : function() {
        var scope = visitPlanAdd, draftId = visitPlanAdd.draftId, draftObj;
        if (draftId) {
            draftObj = draftWork.get(draftId);
            if (typeof draftObj == 'object') {
                this.restoreDraftState(draftObj);
            }
        }
        var $forminputs = $('#myform').find('input,select,textarea');
        function onceChange() {
            scope.changed = true;
            scope.draftPollingor = window.setInterval(scope.saveDraftState, 1000);
            document.addEventListener('pause', function(e) {
                e.preventDefault();
                scope.saveDraftState();
            }, false);
            $forminputs.off('change', onceChange);
        }
        $forminputs.on('change', onceChange);

    },

    saveDraftState : function(){
        var scope = visitPlanAdd;
        var draftId = draftWork.set(scope.draftId, {
            type: (visitPlanAdd.subvisit == '0')?'visitRecord':'subVisitRecord',
            title: scope.cusname || '待补充',
            cusid: scope.code,
            cusname: scope.cusname,
            rid: scope.visitId,
            record: $('#myform').serializeArray()
        });
        if (typeof draftId == 'number') {
            scope.draftId = draftId;
        }
    },

    initTitle : function(text){
//        var text = "新增拜访";
        var self = this;
        function goback() {
            self.changed && self.saveDraftState();
            setTimeout(function() {
                window.history.back();
            });
        }
        dd.ready(function(){
            dd.biz.navigation.setTitle({
                title: text,
                onSuccess : function(result) {},
                onFail : function(err) {}
            });
            if(dd.ios){
                dd.biz.navigation.setLeft({
                    show: true,
                    control: false,
                    text: '',
                    onSuccess : goback,
                    onFail : function(err) {}
                });
            }else{
                $(document).off('backbutton');
                $(document).on('backbutton', function(event) {
                    event.preventDefault();
                    goback();
                });
            }
            self.initRight();
        });
    },
    $loading_img: null,

    //MODIFY by lipengfei at 2016/6/25
    //修改图片上传，适配 omsapp 和 dingtalk
    uploadQuestionImage: function(e,self,src) {
        e.preventDefault();
        e.stopPropagation();
        //if (typeof FormData != 'function') {
        //    this.toast('暂不支持此型号手机上传拍照╮(╯▽╰)╭');
        //    return;
        //}
        if (this.$loading_img) {
            return;
        }
        var scope = visitPlanAdd, $question_item = $(self).closest('.list-item');
        if ($question_item.length == 0) {
            return;
        }
        if ($question_item.find('img').length >= 5) {
            scope.toast('最多上传5张图片');
            return;
        }
        // var $file_input = $question_item.find('[type="file"]');
        // if ($file_input.length == 0 || $file_input.val() == '') {
        //     return;
        // }
        function succ(result) {
            var data = result.data;
            if (result.res === 1 && data.imgurl) {
                scope.$loading_img.remove();
                scope.$loading_img = null;
                scope.appendQuestionImage($question_item, data.imgurl, src);
            } else {
                return fail(result.msg);
            }
            // var imagefile = imageurl.substr(imageurl.lastIndexOf('/')+1);
            // var ossimage = scope.ossImageUrl(imageurl),
            //     thumbnail = scope.thumbnail(ossimage),
            //     previewurl = scope.previewurl(ossimage);
            // scope.$loading_img.html('<i class="ui-tag-toremove img-del-btn" onclick="visitPlanAdd.removeQuestionImage(event,this)"></i>\
            //                              <img src="'+thumbnail+'" data-ori-src="'+previewurl+'" data-file="'+imagefile+'" alt="X" onclick="visitPlanAdd.previewQuestionImage(event,this)">');
            // scope.$loading_img = null;
            // var $images_input = $question_item.find('[name="question_images[]"');
            // if ($images_input.val() == '') {
            //     $images_input.val(imagefile);
            // } else {
            //     var files = $images_input.val().split(',');
            //     files.push(imagefile);
            //     $images_input.val(files.join(','));
            // }
        }
        function fail(msg) {
            scope.$loading_img.remove();
            scope.$loading_img = null;
            if (msg == 'ERROR_USER_CANCELLED') {
                return;
            }
            scope.toast(msg || '网络请求失败');
        }

        //根据app不同，区分 inputfile 和 jsapi 上传
        var loadingli = '<li class="ui-form-camera-item">\
                                <div class="ui-loading" style="margin-top:30px;margin-left:30px;"></div>\
                             </li>';
        scope.$loading_img = $(loadingli);
        if (dd.isDingTalk) {
            if (event.target.files && event.target.files[0]) {
                $question_item.find('.ui-form-camera-list').show().append(scope.$loading_img);
                scope._postFileUseInputfile(event.target.files[0], succ, fail);
            }
        } else {
            $question_item.find('.ui-form-camera-list').show().append(scope.$loading_img);
            var apiparams = {
                posturl: oms_config.apiUrl+oms_apiList.uploadImg,
                name: 'files',
                params: {
                    omsuid: scope.user.id,
                    token: scope.user.token
                }
            };
            scope._postFileUseJsapi(apiparams, succ, fail);
        }
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
        fd.append('omsuid', this.user.id);
        fd.append('token', this.user.token);
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

    appendQuestionImage: function($question_item, imageurl,src) {
        var scope = visitPlanAdd;
        var imagefile = imageurl.substr(imageurl.lastIndexOf('/')+1),
            ossimage = scope.ossImageUrl(imageurl),
            thumbnail = scope.thumbnail(ossimage),
            previewurl = scope.previewurl(ossimage);
        // var html = '<li class="ui-form-camera-item">\
        //                 <i class="ui-tag-toremove img-del-btn" onclick="visitPlanAdd.removeQuestionImage(event,this)"></i>\
        //                 <img src="'+thumbnail+'" data-ori-src="'+previewurl+'" data-file="'+imagefile+'" alt="X" onclick="visitPlanAdd.previewQuestionImage(event,this)">\
        //             </li>';
        var html = '';
        if(src == 1)
        {
            html = '<li class="ui-form-camera-item">\
                    <i class="ui-tag-toremove img-del-btn" onclick="visitPlanAdd.removeQuestionImage(event,this,1)"></i>\
                    <img src="'+thumbnail+'" data-ori-src="'+previewurl+'" data-file="'+imagefile+'" alt="X" onclick="visitPlanAdd.previewQuestionImage(event,this)">\
                </li>';
        }else{
            html = '<li class="ui-form-camera-item">\
                    <i class="ui-tag-toremove img-del-btn" onclick="visitPlanAdd.removeQuestionImage(event,this)"></i>\
                    <img src="'+thumbnail+'" data-ori-src="'+previewurl+'" data-file="'+imagefile+'" alt="X" onclick="visitPlanAdd.previewQuestionImage(event,this)">\
                </li>';
        }
        $question_item.find('.ui-form-camera-list').show().append(html);
        if(src == 1){
            var $images_input = $question_item.find('[name="report_images"]'),
                $urls_input = $question_item.find('[name="report_urls"]');
            if ($images_input.val() == '') {
                $images_input.val(imagefile);
                $urls_input.val(imageurl);
            } else {
                var files = $images_input.val().split(',');
                files.push(imagefile);
                $images_input.val(files.join(','));
                var urls = $urls_input.val().split(',');
                urls.push(imageurl);
                $urls_input.val(urls.join(','));
            }
        }else{
            var $images_input = $question_item.find('[name="question_images[]"]'),
                $urls_input = $question_item.find('[name="question_urls[]"]');
            if ($images_input.val() == '') {
                $images_input.val(imagefile);
                $urls_input.val(imageurl);
            } else {
                var files = $images_input.val().split(',');
                files.push(imagefile);
                $images_input.val(files.join(','));
                var urls = $urls_input.val().split(',');
                urls.push(imageurl);
                $urls_input.val(urls.join(','));
            }
        }

    },

    previewQuestionImage: function(e,self) {
        var $image = $(self), images = [];
        $image.closest('.ui-form-camera-list').find('img').each(function() {
            images.push($(this).data('ori-src'));
        });
        if (images.length) {
            dd.biz.util.previewImage({
                urls: images,
                current: $image.data('ori-src')
            });
        }
        e.preventDefault();
        e.stopPropagation();
    },

    removeQuestionImage: function(e,self,src) {
        var scope = visitPlanAdd, $image = $(self).siblings('img'), $question_item = $image.closest('.list-item');
        function rm_imagefile() {
            var filename = $image.data('file');
            if (filename) {
                // var $images_input = $question_item.find('[name="question_images[]"');
                var $images_input = (src==1)?$question_item.find('[name="report_images"]'):$question_item.find('[name="question_images[]"]');
                var files = $images_input.val().split(',');
                var file_pos = files.indexOf(filename);
                if (file_pos > -1) {
                    files.splice(file_pos, 1);
                }
                $images_input.val(files.join(','));
                // var $urls_input = $question_item.find('[name="question_urls[]"]');
                var $urls_input = (src==1)?$question_item.find('[name="report_urls"]'):$question_item.find('[name="question_urls[]"]');
                var urls = $urls_input.val().split(',');
                var url_pos = -1;
                for (var i = 0; i < urls.length; i++) {
                    if (urls[i].lastIndexOf(filename) > 0) {
                        url_pos = i;
                        break;
                    }
                }
                if (url_pos > -1) {
                    urls.splice(url_pos, 1);
                }
                $urls_input.val(urls.join(','));
            }
            $image.closest('.ui-form-camera-item').remove();
        }
        dd.device.notification.confirm({
            message: '确定要移除图片么？',
            title: '提示',
            buttonLabels: ['确定', '取消'],
            onSuccess: function(result) {
                if (result.buttonIndex === 0) {
                    rm_imagefile();
                    if ($question_item.find('.ui-form-camera-list').children().length==0) {
                        $question_item.find('.ui-form-camera-list').hide();
                    }
                }
            }
        });
        e.preventDefault();
        e.stopPropagation();
    },

    ossImageUrl: function(url) {
        return url.replace('oss-cn-', 'img-cn-');
    },

    thumbnail: function(url) {
        return url + '@100w_100h_1e_1c_70q_1l_1sh.jpg';
    },

    previewurl: function(url) {
        return url + '@_70q.jpg';
    },

    toast : function(text){
        dd.device.notification.toast({
            icon: '', //icon样式，有success和error，默认为空 0.0.2
            text: text, //提示信息
            duration: 1, //显示持续时间，单位秒，默认按系统规范[android只有两种(<=2s >2s)]
            delay: 0, //延迟显示，单位秒，默认0
            onSuccess : function(result) {
                /*{}*/
            },
            onFail : function(err) {}
        })
    },

    postData : function(){
        var self = this;
        var visitUpdateInfoApi=oms_config.apiUrl+oms_apiList.visitUpdateInfo+'?rand='+Math.random();

        if(this.subvisit == '1'){
            //陪访
            if($("#subvisit_cuscode").val() == ''){
                visitPlanAdd.toast('请选择拜访对象');
                return ;
            }
            if($("#record1_4").val() == ''){
                visitPlanAdd.toast('请输入陪访纪要');
                return ;
            }

            //leader
            dd.device.notification.showPreloader({text: '使劲提交中...'});
            if(!visitPlanAdd.isVisitUpdate) {
                visitPlanAdd.isVisitUpdate = true;
                var data={
                    'omsuid':visitPlanAdd.user.id,
                    'token':visitPlanAdd.user.token,
                    'vid':visitPlanAdd.visitId,
                    'phonebook_id' : $("#subvisit_cuscode").val(),
                    'content' : $("#record1_4").val()
                };
                $.ajax({
                    type: 'POST',
                    url: visitUpdateInfoApi,
                    data: data,
                    cache: false,
                    dataType: 'json',
                    success: function(resp){
                        visitPlanAdd.isVisitUpdate = false;
                        dd.device.notification.hidePreloader();
                        if(resp.res===1){
                            visitPlanAdd.toast('已提交');
                            //如果存在草稿，则删除草稿
                            if(self.draftId){
                                draftWork.remove(self.draftId);
                                self.draftId = null;
                            }
                            setTimeout(function() {
                                history.back(-1);
                            }, 1);
                        }else{
                            visitPlanAdd.toast(resp.msg || '网络请求错误', 'error');
                        }
                    },
                    error: function(){
                        visitPlanAdd.isVisitUpdate = false;
                        dd.device.notification.hidePreloader();
                        visitPlanAdd.toast('网络请求错误', 'error');
                    }
                });
            }
        }else{
            //拜访
            if(this.user.role == '2' || this.user.role == '4' || (this.user.role == '5' && (JSON.parse(getCookie('omsUser')).isCityLeader == 1))){
                //续签业务员
                if($("#cuscode2").val() == ''){
                    visitPlanAdd.toast('请选择拜访对象');
                    return ;
                }
                if($("#fieldPeopleNumber2").val() == ''){
                    visitPlanAdd.toast('请输入外勤人数');
                    return ;
                }
                if($("#carNumber2").val() == ''){
                    $("#carNumber2").val(0);
                }
                if($("#record2").val() == ''){
                    visitPlanAdd.toast('请输入拜访纪要');
                    return ;
                }

                console.log($('.problemStyleSelect').length);
                var problemItemLength = $('.problemStyleSelect').length,data={};
                if(problemItemLength == 0){
                    //没有添加问题描述
                    data = {
                        'omsuid':visitPlanAdd.user.id,
                        'token':visitPlanAdd.user.token,
                        'vid': visitPlanAdd.visitId,
                        'phonebook_id' : $("#cuscode2").val(),
                        'legworknumber' : $("#fieldPeopleNumber2").val(),
                        'carnumber' : $("#carNumber2").val(),
                        'img' : $("#doReportHiddenInput").val(),
                        'content' : $("#record2").val()
                    };
                }else{
                    //提交了问题描述
                    if($('.problemStyleSelect').eq(problemItemLength-1).val() == '请选择'){
                        this.toast("提交之前，请选择问题类型");
                        return ;
                    }
                    // if($('.problemPictureStyle').eq(problemItemLength-1).val() == ''){
                    //     this.toast("提交之前，请拍摄问题图片");
                    //     return ;
                    // }
                    if($('.problemContent').eq(problemItemLength-1).val() == ''){
                        this.toast("提交之前，请输入问题内容");
                        return ;
                    }
                    for(var i = 0; i < problemItemLength; i++){
                        this.problemStyleArray.push($('.problemStyleSelect').eq(i).val());
                    }
                    for(var i = 0; i < problemItemLength; i++){
                        this.problemPictureArray.push($('.problemPictureStyle').eq(i).val());
                    }
                    for(var i = 0; i < problemItemLength; i++){
                        this.problemContentArray.push($('.problemContent').eq(i).val());
                    }
                    data = {
                        'omsuid':visitPlanAdd.user.id,
                        'token':visitPlanAdd.user.token,
                        'vid': visitPlanAdd.visitId,
                        'phonebook_id' : $("#cuscode2").val(),
                        'legworknumber' : $("#fieldPeopleNumber2").val(),
                        'carnumber' : $("#carNumber2").val(),
                        'img' : $("#doReportHiddenInput").val(),
                        'content' : $("#record2").val(),
                        'problemStyleArray' : JSON.stringify(visitPlanAdd.problemStyleArray),
                        'problemPictureArray' : JSON.stringify(visitPlanAdd.problemPictureArray),
                        'problemContentArray' : JSON.stringify(visitPlanAdd.problemContentArray)
                    };
                }

                //续签业务员
                dd.device.notification.showPreloader({text: '使劲提交中...'});
                if(!visitPlanAdd.isVisitUpdate) {
                    visitPlanAdd.isVisitUpdate = true;
                    $.ajax({
                        type: 'POST',
                        url: visitUpdateInfoApi,
                        data: data,
                        cache: false,
                        dataType: 'json',
                        success: function(resp){
                            visitPlanAdd.isVisitUpdate = false;
                            dd.device.notification.hidePreloader();
                            if(resp.res===1){
                                visitPlanAdd.toast('已提交');
                                //如果存在草稿，则删除草稿
                                if(self.draftId){
                                    draftWork.remove(self.draftId);
                                    self.draftId = null;
                                }
                                setTimeout(function() {
                                    history.back(-1);
                                }, 1);
                            }else{
                                visitPlanAdd.toast(resp.msg || '网络请求错误', 'error');
                            }
                        },
                        error: function(){
                            visitPlanAdd.isVisitUpdate = false;
                            dd.device.notification.hidePreloader();
                            visitPlanAdd.toast('网络请求错误', 'error');
                        }
                    });
                }
            }else if(this.user.role == '3' || this.user.role == '1'){
                //新签业务员
                if($("#cuscode").val() == ''){
                    visitPlanAdd.toast('请选择拜访对象');
                    return ;
                }
                if($("#fieldPeopleNumber").val() == ''){
                    visitPlanAdd.toast('请输入外勤人数');
                    return ;
                }
                if($("#carNumber").val() == ''){
                    $("#carNumber").val(0);
                }
                if($("#mylevel").val() == '请选择'){
                    visitPlanAdd.toast('请选择个人评级');
                    return ;
                }
                if($("#record").val() == ''){
                    visitPlanAdd.toast('请输入拜访纪要');
                    return ;
                }
                //新签业务员
                dd.device.notification.showPreloader({text: '使劲提交中...'});
                if(!visitPlanAdd.isVisitUpdate){
                    visitPlanAdd.isVisitUpdate = true;
                    var data={
                        'omsuid':visitPlanAdd.user.id,
                        'token':visitPlanAdd.user.token,
                        'vid': visitPlanAdd.visitId,
                        'phonebook_id' : $("#cuscode").val(),
                        'legworknumber' : $("#fieldPeopleNumber").val(),  //外勤人数
                        'carnumber' : $("#carNumber").val(),
                        'mylevel' : ($("#mylevel").val() == '请选择')?'':$("#mylevel").val().substr(0,1),  //个人评级
                        'content' : $("#record").val(),
                        'next_time' : $(".nextVisitTime").val(),
                        'next_address' : $("#nextVisitPlace").val()
                    };
                    $.ajax({
                        type: 'POST',
                        url: visitUpdateInfoApi,
                        data: data,
                        cache: false,
                        dataType: 'json',
                        success: function(resp){
                            visitPlanAdd.isVisitUpdate = false;
                            dd.device.notification.hidePreloader();
                            if(resp.res===1){
                                visitPlanAdd.toast('已提交');
                                //如果存在草稿，则删除草稿
                                if(self.draftId){
                                    draftWork.remove(self.draftId);
                                    self.draftId = null;
                                }
                                setTimeout(function() {
                                    history.back(-1);
                                }, 1);
                            }else{
                                visitPlanAdd.toast(resp.msg || '网络请求错误', 'error');
                            }
                        },
                        error: function(){
                            visitPlanAdd.isVisitUpdate = false;
                            dd.device.notification.hidePreloader();
                            visitPlanAdd.toast('网络请求错误', 'error');
                        }
                    });
                }
            }

        }

    },

    initEvents : function(){
        var self = this;
        //新增问题
        $('.ui-form-item').on('click','.problemAddItem',function(e){
            console.log($(this).closest('.ui-form').find('.problemStyleSelect').val());
            console.log($(this).closest('.ui-form').find('.problemPictureStyle').val());
            console.log($(this).closest('.ui-form').find('.problemContent').val());
            if($(this).closest('.ui-form').find('.problemStyleSelect').val() == '请选择'){
                self.toast("新增问题之前，请选择问题类型");
                return ;
            }
            // if($(this).closest('.ui-form').find('.problemPictureStyle').val() == ''){
            //     self.toast("新增问题之前，请拍摄问题图片");
            //     return ;
            // }
            if($(this).closest('.ui-form').find('.problemContent').val() == ''){
                self.toast("新增问题之前，请输入问题内容");
                return ;
            }
            self.appendHtmlTo("problemList");
            $(".problemAddItem").hide();
            $(".problemAddItem").eq($(".problemDeleteItem").length - 1).show();
            // $(this).closest('.ui-form-item').html('<i class="ui-icon-delete problemDeleteItem"></i>');
            e.stopPropagation();
        });
        //删除问题
        $('.ui-form-item').on('click','.problemDeleteItem',function(e){
            $(this).closest('.ui-form').remove();
            $(".problemAddItem").hide();
            $(".problemAddItem").eq($(".problemDeleteItem").length - 1).show();
            //如果问题全部删除了，则将“添加问题描述”部分显示出来
            if($(".problemDeleteItem").length == 0){
                $("#addProblemDescribeFrame").closest('.ui-form').show();
                $("#problemList").hide();
            }
            e.stopPropagation();
        });

        //草稿所触发的事件
        // $("input[type='text']").on('change',function(e){
        //     if(visitPlanAdd.draftId){
        //         visitPlanAdd.saveDraftState();
        //     }
        // });
        // $("input[type='hidden']").on('change',function(e){
        //     if(visitPlanAdd.draftId){
        //         visitPlanAdd.saveDraftState();
        //     }
        // });
        $("select").on('change',function(e){
            if(visitPlanAdd.draftId){
                visitPlanAdd.saveDraftState();
            }
        });
        $("textarea").on('change',function(e){
            if(visitPlanAdd.draftId){
                visitPlanAdd.saveDraftState();
            }
        });
        $("#nextVisitTime").on("click",function(e){
            var n = moment().format('YYYY-MM-DD HH:mm');
            dd.biz.util.datetimepicker({
                format: 'yyyy-MM-dd HH:mm',
                value: n,
                onSuccess: function(result) {
                    if (result.value < n) {
                        $(".nextVisitTime").val(n);
                        dd.device.notification.toast({
                            icon: '',
                            text: '时间不能小于现在',
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    } else {
                        $(".nextVisitTime").val(result.value);
                    }
                },
                onFail: function() {}
            });
        });

        //ADD by lipengfei at 2016/6/25
        //根据app, 调整[实施报告]文件上传触发事件
        if (dd.isDingTalk) {
            $('#doReport_ci').get(0).onclick = null;
        } else {
            $('#doReport').get(0).onchange = null;
        }
        //ADD-END
    },

    initPageShow : function(){
        //隐藏所有页面代码
        $("#role1_4").hide();
        $("#role2").hide();
        $("#role3").hide();

        console.log(this.visitId);

        if(this.subvisit == '1'){
            //陪访
            this.initTitle('记录陪访');
            $("#role1_4").show();
            $("#role2").hide();
            $("#role3").hide();
            $("#subvisit_cusids").click(function(){
                cusWidget.init('','',visitPlanAdd.code,function(obj){
                    if (obj) {
                        console.log(obj);
                        $("#subvisit_cusid").val(obj.name);
                        $("#subvisit_cuscode").val(obj.code);
                    }
                    visitPlanAdd.initTitle('记录陪访');
                });
            });
        }else{
            //拜访
            if(this.user.role == '2' || this.user.role == '4' || (this.user.role == '5' && (JSON.parse(getCookie('omsUser')).isCityLeader == 1))){
                //续签业务员
                visitPlanAdd.initTitle('记录拜访');
                $("#role1_4").hide();
                $("#role2").show();
                $("#role3").hide();

                $("#cusids2").click(function(){
                    cusWidget.init('','',visitPlanAdd.code,function(obj){
                        console.log(obj);
                        if (obj) {
                            $("#cusid2").val(obj.name);
                            $("#cuscode2").val(obj.code);
                        }
                        visitPlanAdd.initTitle('记录拜访');
                    });
                });

                var self = this;
                $("#addProblemDescribeFrame").click(function(){
                    var uiForm = $(this).closest('.ui-form');
                    uiForm.hide();   //添加问题描述隐藏
                    $("#problemList").show();   //将问题添加栏显示
                    self.appendHtmlTo("problemList");
                    $(".problemAddItem").hide();
                    $(".problemAddItem").eq($(".problemDeleteItem").length - 1).show();
                });
            }else if(this.user.role == '3' || this.user.role == '1'){
                //新签业务员
                visitPlanAdd.initTitle('记录拜访');
                $("#role1_4").hide();
                $("#role2").hide();
                $("#role3").show();

                $("#cusids").click(function(){
                    cusWidget.init('','',visitPlanAdd.code,function(obj){
                        if (obj) {
                            console.log(obj);
                            $("#cusid").val(obj.name);
                            $("#cuscode").val(obj.code);
                        }
                        visitPlanAdd.initTitle('记录拜访');
                    });
                });
            }
        }
    },

    appendHtmlTo : function(id){
        var html1 = '<div class="ui-form ui-form-gap ui-form-auto" style="margin-top: 10px;"><div class="ui-form-item ui-form-item-icon ui-form-item-input-l ui-border-b">';
        var html2 = '<label>问题类型</label><div class="ui-select"><select class="problemStyleSelect" name="question_cate[]"><option>请选择</option><option>服务</option><option>产品类型</option></select></div></div>';
        var html3 = '<div class="ui-form-item ui-form-item-icon ui-form-item-input-l ui-border-b list-item" style="padding-bottom: 0;"><label>问题图片</label><input type="hidden" name="question_images[]" class="problemPictureStyle"><input type="hidden" name="question_urls[]">';
        var html4 = '<input type="text" class="problemPictureStyle" placeholder="请上传（非必选,最多5张）" readonly style="width: 60%;padding: 0;"><i class="ui-icon ui-icon-thumb btn-camera-add" onclick="visitPlanAdd.uploadQuestionImage(event,this);">';
        var html5 = '<input type="file" name="files" accept="image/*" style="position:absolute;right:0;top:0;opacity:0;width: 100px;height: 100%;padding: 0;" onchange="visitPlanAdd.uploadQuestionImage(event,this);"></i><ul class="ui-form-camera-list ui-whitespace ui-border-b clearfix" style="padding: 0;"></ul>';
        var html6 = '</div><div class="ui-form-item ui-form-item-textarea ui-border-b"><textarea novalidate="" class="problemContent" rows="6" placeholder="问题内容（请输入）" style="width: 100%;" name="question_content[]"></textarea></div>';
        // var html7 = '<div class="ui-form-item ui-form-item-icon ui-form-item-input-l"><label>添加问题</label><i class="ui-icon-add problemAddItem"></i></div></div>';
        var html7 = '<div class="ui-form-item ui-form-item-icon ui-form-item-input-l" style="padding-bottom:0;padding-top:0;line-height: 48px;"><span class="problemDeleteItem"><i class="ui-icon-list_delete"></i><span>删除</span></span><span class="problemAddItem" style="display:none;"><i class="ui-icon-list_creat"></i><span>添加问题</span></span></div></div>';
        var html8 = '<script>visitPlanAdd.initEvents();</script>';
        var picHtml = html1+html2+html3+html4+html5+html6+html7+html8;
        var $picHtml = $(picHtml);
        //ADD by lipengfei at 2016/6/25
        //根据app, 调整[问题图片]文件上传触发事件
        if (dd.isDingTalk) {
            $picHtml.find('.btn-camera-add').get(0).onclick = null;
        } else {
            $picHtml.find('input[type="file"]').get(0).onchange = null;
        }
        //ADD-END

        $("#"+id).append($picHtml);
        return $picHtml;
    },

    //初始化visitPlanAdd参数
    ready: function(user) {
        this.user = user;
        console.log(this.user);
        var cusid = getQueryString('cusid');
        if ($.trim(cusid) == '') {
            dd.device.notification.toast({text: '参数无效', icon: 'error'});
            return history.back(-1);
        }
        this.code = cusid;   //客户id
        var visitid = getQueryString('visitId');
        if ($.trim(visitid) == '') {
            dd.device.notification.toast({text: '参数无效', icon: 'error'});
            return history.back(-1);
        }
        this.visitId = visitid;    //拜访id
        var subvisit = getQueryString('subvisit');
        if ($.trim(subvisit) == '') {
            dd.device.notification.toast({text: '参数无效', icon: 'error'});
            return history.back(-1);
        }
        this.subvisit = subvisit;    //是否陪访
        var draftId = getQueryString('draftId');
        if(draftId){
            this.draftId = draftId;
        }
        this.initPageShow();
        this.initEvents();
        // draft
        this.checkDraftStatus();
        //修改草稿后trigger events
        // $("body").click(function(e){
        //     if(visitPlanAdd.draftId){
        //         visitPlanAdd.saveDraftState();
        //     }
        // });
        // first trigger events
        // $('input[type="text"]').change();
        // $('input[type="hidden"]').change();
        // $("#customer").on('input propertychange', function(event) {
        //         var key = $(this).val();
        //         photo.getCustomers(key,0,'_cus_'+Math.random());
        //         event.stopPropagation();
        //     });
        $('select').change();
        $('textarea').change();
        //获取cusname和结束地址
        var getVisitInfoApi = oms_config.apiUrl+oms_apiList.getVisitInfo+'?rand='+Math.random();
        $.post(getVisitInfoApi,{
            'omsuid':visitPlanAdd.user.id,
            'token':visitPlanAdd.user.token,
            'id':visitPlanAdd.visitId,
            'type': 1
        },function(result){
            var resultObj = JSON.parse(result);
            visitPlanAdd.cusname = resultObj.data.cusname;
            $(".cusname").text(resultObj.data.cusname);
            $(".visitCloseAddress").text(resultObj.data.end_address);
            if(visitPlanAdd.subvisit == '1'){
                $(".follow-up").text(resultObj.data.salesman);
            }
        });
    },

    init :function() {
        var omsUserJson = getCookie('omsUser'), omsUser;
        if (omsUserJson) {
            omsUser = JSON.parse(omsUserJson);
            if (omsUser) {
                //初始化
                visitPlanAdd.ready(omsUser);
            }
        }
        if (!omsUser) {
            dd.ready(function() {
                dd.device.notification.alert({
                    message: '请重新登录',
                    onSuccess: function() {
                        dd.biz.navigation.close();
                    }
                });
            });
        }
    }
};

$.fn.visitPlanAdd = function(settings){ $.extend(visitPlanAdd, settings || {});};
$.fn.ready(function(){  visitPlanAdd.init(); });
