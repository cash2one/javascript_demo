$(function(){
        FastClick.attach(document.body);
        var diagRange = {
            optionObj: ['<option value="1">资料量</option><option value="2" class="opt1">绕KP量</option><option value="3" class="opt1">电话量</option><option value="4" class="opt1">拜访量</option><option value="5" class="opt1">理单完成率</option>', '<option value="6" class="opt2" style="display: none;">成单量</option>', '<option value="7" class="opt3" style="display: none;">私海客户</option>'], 
            deleteConfirm: function(){
                dd.device.notification.confirm({
                    message: "确定要删除此项配置？",
                    title: "提示",
                    buttonLabels: ['取消', '确定'],
                    onSuccess : function(result) {
                        if(result.buttonIndex === 1){
                            if(!location.search){
                                history.back(-1);
                                // replaceLink('teamDiagnoseConfig.html');
                                return;
                            }
                            var apiUrl = oms_config.apiUrl + oms_apiList.delRangeConf;
                            $.ajax({
                                url: apiUrl,
                                data: {
                                    class: OMS_Diagnose.getURLParameter('class'),
                                    work_type: OMS_Diagnose.getURLParameter('workType'),
                                    omsuid: JSON.parse(getCookie('omsUser')).id,
                                    token: JSON.parse(getCookie('omsUser')).token,
                                },
                                type: 'post',
                                success: function(resp){
                                    var result = JSON.parse(resp);
                                    if(result.res == 1){
                                        dd.device.notification.toast({
                                            icon: '',
                                            text: '已删除',
                                            duration: 1,
                                            onSuccess : function(result) {
                                                history.back(-1);
                                                // replaceLink('teamDiagnoseConfig.html');
                                            },
                                            onFail : function(err) {}
                                        });
                                    } else {
                                        dd.device.notification.toast({
                                            icon: 'error',
                                            text: result.msg,
                                            duration: 5
                                        });
                                    }
                                },
                                error: function(){
                                    OMS_Diagnose.showAlert('网络异常。');
                                }
                            });
                            
                        } else{
                        }
                    },
                    onFail : function(err) {
                        
                    }
                });
            },
            validators: {
                '#red': function(input){
                    var val = Number(input),
                        tp = $('#sType').val();
                    if(tp == '5'){
                        if(val == 0 ||(val && val < 100)){
                            return true;
                        }
                        return '红灯阀值请输入小于100的数字。'
                    } else {
                        if(val || val == 0){
                            return true;
                        } 
                        return '请输入红灯阀值';
                    }
                    
                },
                '#yellow': function(input){
                    var val = Number(input),
                        tp = $('#sType').val();
                    if(val <= +($('#red').val())){
                        return '黄灯阀值请大于红灯阀值';
                    }
                    if(tp == '5'){
                        if(val && val < 100){
                            return true;
                        }
                        return '黄灯阀值请输入小于100的数字';
                    }
                    else {
                        if(val){
                            return true;
                        }
                        return '请输入黄灯阀值';
                    }
                }
            },
            validate: function() {
                var scope = diagRange, valid = true, errormsg;
                $.each(diagRange.validators, function(selector, func) {
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
                    dd.device.notification.toast({
                        icon: '',
                        text: errormsg || '请填写',
                        duration: 1,
                        onSuccess : function(result) {
                            // history.back(-1);
                            // replaceLink('teamDiagnoseConfig.html');
                        },
                        onFail : function(err) {}
                    });
                }
                return valid;
            },
            saveData: function(){
                if(diagRange.validate()){
                    dd.device.notification.showPreloader({text: '使劲提交中...'});

                    var dt = {
                        omsuid: JSON.parse(getCookie('omsUser')).id,
                        token: JSON.parse(getCookie('omsUser')).token,
                        class: $('#fType').val(),
                        work_type: $('#sType').val(),
                        red: $('#red').val(),
                        yellow: $('#yellow').val()
                    },
                        apiUrl = oms_config.apiUrl + oms_apiList.saveRangeConf;  
                    
                    $.ajax({
                        type: 'post',
                        url: apiUrl,
                        data: dt,
                        success: function(resp){
                            var result = JSON.parse(resp);
                            if(result.res == 1){
                                dd.device.notification.toast({
                                    icon: '',
                                    text: '已提交',
                                    duration: 1,
                                    onSuccess : function(result) {
                                        history.back(-1);
                                        // replaceLink('teamDiagnoseConfig.html');
                                    },
                                    onFail : function(err) {}
                                });

                            } else {
                                dd.device.notification.toast({
                                    icon: 'error',
                                    text: result.msg,
                                    duration: 5
                                });
                            }
                        },
                        error: function(){
                            dd.device.notification.toast({
                              icon: 'error',
                              text: '网络请求失败',
                              duration: 5
                            });
                        }
                    }).always(function(){
                        dd.device.notification.hidePreloader();
                    });
                }
            },
            bindEvent: function(){
                $('#cancel').on('click', function(){
                    diagRange.deleteConfirm();
                });
                $('#save').on('click', function(){
                    var existArr = sessionStorage.getItem('RangeType'),
                        selType = $('#fType').val() + '_' + $('#sType').val();
                    if(existArr.indexOf(selType) > -1){
                        var cls = $('#fType option').not(function(){ return !this.selected }).html();
                        var workTp = $('#sType option').not(function(){ return !this.selected }).html();
                        dd.device.notification.confirm({
                            message: "您确定要覆盖" + cls + '-' + workTp + "的配置吗？",
                            title: "提示",
                            buttonLabels: ['取消', '确定'],
                            onSuccess : function(){
                                diagRange.saveData();
                            }
                        });
                    } else {
                        diagRange.saveData();
                    }
                    
                    
                });
                $('#fType').on('change', function(){
                    var value = $(this).val();
                    $('#sType').html(diagRange.optionObj[+value - 1]);
                });
                $('#sType').on('change', function(){
                    var value = $(this).val();
                     $('.item-desc').css('display', value == '5' ? '' : 'none');
                });
                $('.act-num').on('input propertychange', function(){
                    var $this = $(this),
                        id = $this.attr('id'),
                        val = $this.val();
                    $('#l' + id).html(+val + (id == 'yellow' ? 0 : 1));
                })
            },
            restoreData: function(data){
                $('#fType').val(data.class);
                $('#fType').change();
                $('#sType').val(data.work_type);
                $('#sType').change();
                $('#red').val(data.red);
                $('#lred').html(+data.red + 1);
                $('#yellow').val(data.yellow);
                $('#lyellow').html(+data.yellow);
            },
            fetchConfigData: function(){
                OMS_Diagnose.showLoading();
                var apiUrl = oms_config.apiUrl + oms_apiList.getSpecRangeConf,
                    reqData = {
                        omsuid: JSON.parse(getCookie('omsUser')).id,
                        token: JSON.parse(getCookie('omsUser')).token,
                        class: OMS_Diagnose.getURLParameter('class'),
                        work_type: OMS_Diagnose.getURLParameter('workType')
                    };
                $.ajax({
                    url: apiUrl,
                    data: reqData,
                    type: 'post',
                    complete: function(){
                        OMS_Diagnose.hideLoading();
                    },
                    success: function(resp){
                        console.log('success', resp)
                        var result = JSON.parse(resp);
                        if(result.res == 1){
                            diagRange.restoreData(result.data);
                        } else {
                            OMS_Diagnose.showAlert('数据拉取异常，请联系管理员。');
                        }
                    }
                })
            }

        };
        dd.ready(function(){
            ddbanner.changeBannerTitle('智能警示灯配置');
            dd.biz.navigation.setLeft({
                control: true,
                show:  true,
                text: "返回",
                onSuccess: function(result) {
                    history.back(-1);
                },
                onFail: function(err) {}
            });
        });
        $.fn.ready(function(){
            if(location.search){
                diagRange.fetchConfigData();
            }
            diagRange.bindEvent();
        });
    })