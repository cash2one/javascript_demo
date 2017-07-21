/**
 * by hecom at 2016/5/4
 */
$(function() {
    'use strict';

    var page = {
        user: null,
        visitrecordId: 0,
        cusid: 0,
        cusname: '',
        draftOid: null,

        submiting: false,
        changed: false,
        $loading_img: null,

        validators: {
            '#training_target': '请选择培训对象',
            '#boss_reason': function(input) {
                if (input != '' && input != '0') {
                    return true;
                }
                var targets = $('#training_target').val();
                if (targets.indexOf('3') > -1) {
                    return true;
                }
                return '请选择老板缺席原因';
            },
            '#content_items': '请选择培训内容',
            '#is_need': function(input) {
                var is_need = $('#is_need').attr('checked');
                if (is_need) {
                    if (page.isValueEmpty($('#is_need_content').val())) {
                        return '请填写需求描述';
                    }
                } else {
                    if (page.isValueEmpty($('#is_need_no').val())) {
                        return '请选择无需求原因';
                    }
                }
                return true;
            },
            '#is_renew': function(input) {
                var is_renew = $('#is_renew').attr('checked');
                if (!is_renew) {
                    if (page.isValueEmpty($('#is_renew_no').val())) {
                        return '请选择不续签原因';
                    }
                }
                return true;
            },
            '#remark': '请填写培训备注',
            '#question_div': function() {
                var $question_items = $('#question_div').find('.list').children();
                var result = true;
                $question_items.each(function() {
                    if (page.isQuestionInvalid($(this))) {
                        result = '请填写问题描述';
                        return false;
                    }
                });
                return result;
            }
        },

        isValueEmpty: function(input) {
            if (typeof input == 'string') {
                return $.trim(input) == '';
            }
            if($.isArray(input)) {
                return input.length == 0;
            }
            if (typeof input == 'object') {
                var objemp = true;
                for (var key in input) {
                    objemp = false;
                    break;
                }
                return objemp;
            }
            return !input;
        },

        errorToast: function(msg, icon, dur) {
            dd.device.notification.toast({
                icon: icon,
                text: msg,
                duration: dur || 1
            });
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

        validate: function() {
            var scope = page, valid = true, errormsg;
            $.each(this.validators, function(selector, func) {
                var $field = $(selector), input = $field.val();
                if ($field.length) {
                    if (typeof func == 'function') {
                        var result = func(input);
                        if (result === true) {
                            return valid;
                        }
                        valid = false, errormsg = result;
                    } else {
                        if (scope.isValueEmpty(input)) {
                            valid = false, errormsg = func;
                        }
                    }
                }
                return valid;
            });
            if (!valid) {
                this.errorToast(errormsg || '请填写');
            }
            return valid;
        },

        submit: function() {
            var scope = this;
            if (this.validate()) {
                if (this.submiting) {
                    dd.device.notification.toast({text: '使劲提交中...'});
                    return;
                }
                dd.device.notification.showPreloader({
                    text: '使劲提交中...'
                });
                this.submiting = true;
                this.saveTrainRecord().always(function(result) {
                    dd.device.notification.hidePreloader();
                    if ('res' in result) {
                        if (result.res === 1) {
                            scope.errorToast('已提交', 'success');
                            draftWork.remove(scope.draftOid);
                            setTimeout(function() {
                                window.history.back();
                            });
                        } else {
                            scope.errorToast(result.msg || '网络请求失败', 'error');
                        }
                    } else {
                        scope.errorToast('网络请求失败', 'error');
                    }
                    scope.submiting = false;
                });
            }
        },

        saveTrainRecord: function() {
            var formdata = $('#myform').serializeArray();
            if (!$('#is_need').attr('checked')) {
                formdata.push({name: 'is_need_add[status]', value: '0'});
            }
            if (!$('#is_renew').attr('checked')) {
                formdata.push({name: 'is_renew', value: '0'});
            }
            formdata.push({name: 'omsuid', value: this.user.id});
            formdata.push({name: 'token', value: this.user.token});
            return $.ajax({
                type: 'POST',
                url: oms_config.apiUrl + oms_apiList.submitTrainReport,
                data: formdata,
                cache: false,
                dataType: 'json'
            });
        },

        saveDraftState: function() {
            var scope = page;
            var draftId = draftWork.set(scope.draftOid, {
                type: 'trainRecord',
                title: scope.cusname || '待补充',
                cusid: scope.cusid,
                cusname: scope.cusname,
                rid: scope.visitrecordId,
                record: $('#myform').serializeArray()
            });
            if (typeof draftId == 'number') {
                scope.draftOid = draftId;
            }
        },

        restoreDraftState: function(draftObj) {
            this.draftOid = draftObj._oid;
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
                'training_object[boss_reason]',
                'is_need_add[status]',
                'is_need_add[need_content]',
                'is_renew',
                'remark',
            ];
            directNames.forEach(function(name) {
                if (serializeMap[name]) {
                    $form.find('[name="'+name+'"]').val(serializeMap[name]);
                }
            });
            // checkbox
            $form.find('[name="is_need_add[status]"]').prop('checked', typeof serializeMap['is_need_add[status]'] == 'string');
            $form.find('[name="is_renew"]').prop('checked', typeof serializeMap['is_renew'] == 'string');
            var multipleSelNames = [
                'training_object[obj][]',
                'training_content[]',
                'is_need_add[no_need_reason][]',
                'no_renew_reason[]',
            ];
            multipleSelNames.forEach(function(name) {
                var $sel = $form.find('[name="'+name+'"]');
                var values = serializeMap[name] || [];
                $sel.children().each(function() {
                    if (values.indexOf($(this).val()) > -1) {
                        $(this).prop('selected', true);
                    }
                });
            });
            // trigger changed
            $('#training_target').trigger('change', [true]);
            $('#is_need').trigger('click', [true]);
            $('#is_renew').trigger('click', [true]);
            var questioncates = serializeMap['question_cate[]'] || [],
                questionurls = serializeMap['question_urls[]'] || [],
                questionconts = serializeMap['question_content[]'] || [];
            var questionitems = [], scope = page;
            if (questioncates.length == questionurls.length && questioncates.length == questionconts.length) {
                for (var i = 0; i < questioncates.length; i++) {
                    questionitems.push({
                        'cate': questioncates[i],
                        'urls': questionurls[i],
                        'content': questionconts[i]
                    });
                }
            }
            questionitems.forEach(function(item) {
                var $question_item = scope.addQuestion();
                if ($question_item) {
                    $question_item.find('[name="question_cate[]"]').val(item.cate);
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

        checkVisitRecord: function() {
            var vid = getUrlParam('vid');
            if (!vid) {
                this.errorToast('参数错误', 'error');
                window.history.back();
            }
            this.visitrecordId = vid;
            var data = {
                'omsuid': this.user.id,
                'token': this.user.token,
                'id': vid,
                'type': 2
            };
            var scope = page;
            $.ajax({
                type: 'POST',
                url: oms_config.apiUrl + oms_apiList.getVisitInfo,
                data: data,
                cache: false,
                dataType: 'json'
            }).always(function(response) {
                var data = response.data;
                if (response.res === 1) {
                    scope.cusid = data.cusid;
                    scope.cusname = data.cusname;
                    $('#myform').find('[name="cusname"]').val(scope.cusname);
                    $('#end_address').text(data.end_address);
                } else {
                    scope.errorToast('参数错误', 'error');
                    window.history.back();
                }
            });
            $('#myform').find('[name="vid"]').val(this.visitrecordId);
        },

        checkDraftStatus: function() {
            var scope = page, draftId = getUrlParam('draftId'), draftObj;
            if (draftId) {
                draftObj = draftWork.get(draftId);
                if (typeof draftObj == 'object') {
                    this.restoreDraftState(draftObj);
                }
            }
            var $form = $('#myform'), $forminputs = $form.find('input,select,textarea');
            function onceChange() {
                scope.changed = true;
                scope.draftPollingor = window.setInterval(scope.saveDraftState, 3000);
                document.addEventListener('pause', function(e) {
                    e.preventDefault();
                    scope.saveDraftState();
                }, false);
                $form.off('change', onceChange);
                $forminputs.off('change', onceChange);
            }
            $form.on('change', onceChange);
            $forminputs.on('change', onceChange);
        },

        isQuestionInvalid: function($item) {
            // var cate = $item.find('[name="question_cate[]"]').val(),
                // images = $item.find('[name="question_images[]"]').val(),
            var content = $item.find('[name="question_content[]"]').val();
            if ($.trim(content) == '') {
                return true;
            }
            return false;
        },

        addQuestion: function() {
            $('#myform').trigger('change');
            var scope = page;
            var $list = $('#question_div .list'), $last_item = $list.children().last();
            if ($last_item.length) {
                if (scope.isQuestionInvalid($last_item)) {
                    scope.errorToast('请填写问题描述');
                    return;
                }
            }
            $list.find('.add-btn').hide();
            $('#question_div .first_div').hide();
            $('#question_div .more_div').show();
            var $new_item = $($('#question_item_tpl').html());
            $new_item.find('[type="file"]').attr('id', '_file_'+Math.random());
            // if ($last_item.length) {
            //     var deli = '<i class="ui-icon-delete del-btn" style="background-color:#fff;top:1px;"></i>';
            //     $new_item.find('.ui-form-item').first().append(deli);
            // }
            return $new_item.appendTo($list);
        },

        delQuestion: function() {
            $('#myform').trigger('change');
            var scope = page, $item = $(this).closest('.list-item');
            function del_item() {
                var $list = $('#question_div .list');
                $list.find('.add-btn').hide();
                $item.remove();
                $list.find('.add-btn').last().show();
                if ($list.children().length == 0) {
                    $('#question_div .more_div').hide();
                    $('#question_div .first_div').show();
                }
            }
            if ($item.length) {
                var cate = $item.find('[name="question_cate[]"]').val(),
                    images = $item.find('[name="question_images[]"]').val(),
                    content = $item.find('[name="question_content[]"]').val();
                if ((cate == '0' || cate == '') && images == '' && content == '') {
                    del_item();
                } else {
                    dd.device.notification.confirm({
                        message: '确定要移除么？',
                        title: '提示',
                        buttonLabels: ['确定', '取消'],
                        onSuccess: function(result) {
                            if (result.buttonIndex === 0) {
                                del_item();
                            }
                        }
                    });
                }
            }
        },

        uploadQuestionImage: function(e) {
            e.preventDefault();
            //if (typeof FormData != 'function') {
            //    this.errorToast('暂不支持此型号手机上传拍照╮(╯▽╰)╭');
            //    return;
            //}
            if (this.$loading_img) {
                return;
            }
            var scope = page, $question_item = $(this).closest('.list-item');
            if ($question_item.length == 0) {
                return;
            }
            if ($question_item.find('img').length >= 5) {
                scope.errorToast('最多上传5张图片');
                return;
            }
            function succ(result) {
                var data = result.data;
                if (result.res === 1 && data.imgurl) {
                    scope.$loading_img.remove();
                    scope.$loading_img = null;
                    scope.appendQuestionImage($question_item, data.imgurl);
                } else {
                    return fail(result.msg);
                }
            }
            function fail(error) {
                scope.$loading_img.remove();
                scope.$loading_img = null;
                if (error == 'ERROR_USER_CANCELLED') {
                    return;
                }
                scope.errorToast(error || '网络请求失败');
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

        appendQuestionImage: function($question_item, imageurl) {
            var scope = page;
            var imagefile = imageurl.substr(imageurl.lastIndexOf('/')+1),
                ossimage = scope.ossImageUrl(imageurl),
                thumbnail = scope.thumbnail(ossimage),
                previewurl = scope.previewurl(ossimage);
            var html = '<li class="ui-form-camera-item">\
                            <i class="ui-tag-toremove img-del-btn"></i>\
                            <img src="'+thumbnail+'" data-ori-src="'+previewurl+'" data-file="'+imagefile+'" alt="X">\
                        </li>';
            $question_item.find('.ui-form-camera-list').show().append(html);
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
        },

        previewQuestionImage: function() {
            var $image = $(this), images = [];
            $image.closest('.ui-form-camera-list').find('img').each(function() {
                images.push($(this).data('ori-src'));
            });
            if (images.length) {
                dd.biz.util.previewImage({
                    urls: images,
                    current: $image.data('ori-src')
                });
            }
        },

        removeQuestionImage: function() {
            $('#myform').trigger('change');
            var scope = page, $image = $(this).siblings('img'), $question_item = $image.closest('.list-item');
            function rm_imagefile() {
                var filename = $image.data('file');
                if (filename) {
                    var $images_input = $question_item.find('[name="question_images[]"]');
                    var files = $images_input.val().split(',');
                    var file_pos = files.indexOf(filename);
                    if (file_pos > -1) {
                        files.splice(file_pos, 1);
                    }
                    $images_input.val(files.join(','));
                    var $urls_input = $question_item.find('[name="question_urls[]"]');
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
        },

        initEvents: function() {
            // 缺席原因
            $('#training_target').on('change', function(e, _noreset) {
                var $boss_reason_div = $('#boss_reason').closest('div.ui-form-item');
                if ($(this).val().indexOf('3') > -1) {
                    $boss_reason_div.hide();
                } else {
                    $boss_reason_div.show();
                }
                if (!_noreset) {
                    $('#boss_reason').val('0');
                }
            });
            // 增值需求
            $('#is_need').on('click', function(e, _noreset) {
                var $no_div = $('#is_need_no').closest('div.ui-form-item');
                var $content = $('#is_need_content').closest('div.ui-form-item');
                if (this.checked) {
                    $no_div.hide(), $content.show();
                } else {
                    $no_div.show(), $content.hide();
                }
                if (!_noreset) {
                    $('#is_need_no').val('');
                    $('#is_need_content').val('');
                }
            });
            // 续签可能
            $('#is_renew').on('click', function(e, _noreset) {
                var $no_div = $('#is_renew_no').closest('div.ui-form-item');
                if (this.checked) {
                    $no_div.hide();
                } else {
                    $no_div.show();
                }
                if (!_noreset) {
                    $('#is_renew_no').val('');
                }
            });
            // 新增问题选项
            $('#question_div .first-add-btn').on('click', this.addQuestion);
            $('#question_div .list').on('click', '.add-btn', this.addQuestion);
            $('#question_div .list').on('click', '.del-btn', this.delQuestion);
            //根据app, 调整文件上传触发事件
            if (dd.isDingTalk) {
                $('#question_div .list').on('change', '[type="file"]', this.uploadQuestionImage);
            } else {
                $('#question_div .list').on('click', '.img-add-btn', this.uploadQuestionImage);
            }
            $('#question_div .list').on('click', 'img', this.previewQuestionImage);
            $('#question_div .list').on('click', '.img-del-btn', this.removeQuestionImage);
        },

        initNav: function() {
            var scope = this;
            function goback() {
                scope.changed && scope.saveDraftState();
                setTimeout(function() {
                    window.history.back();
                });
            }
            ddbanner.changeBannerTitle('记录培训');
            if (dd.ios) {
                dd.biz.navigation.setLeft({
                    control: true,
                    onSuccess: goback
                });
            } else {
                document.addEventListener('backbutton', function(e) {
                    e.preventDefault();
                    goback();
                });
            }
            ddbanner.changeBannerRight('确定', true, function() {
              scope.submit();
            });
        },

        init: function(user) {
            this.user = user;
            this.initNav();
            this.initEvents();
            // first trigger events
            $('#training_target').change();
            $('#is_need').click();
            $('#is_renew').click();
            // visitrecord
            this.checkVisitRecord();
            // draft
            this.checkDraftStatus();
        }
    };

    // INPUT 诡异的键盘弹出
    var _$lastInput;
    $(document).on('touchstart focusin', function(e) {
        var $target = $(e.target);
        if ($target.is('input,select,textarea,video')) {
            if (_$lastInput && _$lastInput[0] !== $target[0]) {
                _$lastInput.blur();
            }
            _$lastInput = $target;
        } else {
            if (_$lastInput) {
                _$lastInput.blur();
                _$lastInput = undefined;
            }
        }
    });
    $(document).on('focusout', function(e) {
        _$lastInput = undefined;
    });

    FastClick.attach(document.body);

    dd.ready(function() {
        var loginApi = oms_config.apiUrl + oms_apiList.login;
        new Login(oms_config.corpId, oms_config.baseUrl, loginApi, function() {
            var omsUserJson = getCookie('omsUser'),
                omsUser;
            if (omsUserJson) {
                omsUser = JSON.parse(omsUserJson);
                if (omsUser) {
                    page.init(omsUser);
                }
            }
            if (!omsUser) {
                dd.device.notification.alert({
                    message: '请重新登录',
                    onSuccess: function() {
                        dd.biz.navigation.close();
                    }
                });
            }
        });
    });
});
