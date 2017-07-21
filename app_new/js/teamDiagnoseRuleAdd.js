$(function(){
        FastClick.attach(document.body);
        var diagRule = {
            deleteConfirm: function(callback){
                dd.device.notification.confirm({
                    message: "确定要删除此项配置？",
                    title: "提示",
                    buttonLabels: ['取消', '确定'],
                    onSuccess : function(result) {
                        if(result.buttonIndex === 1){
                            callback && callback();
                        }else{
                        }  
                    },
                    onFail : function(err) {
                    }
                });
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
            validators: {
                '#res': '请输入诊断结果',
                '#sug': '请输入工作建议',
                '.light-num': function(value){
                    if(!value || (value && /^[0-9]*$/.test(value))){
                        return true;
                    }
                    return '灯的数量请输入整数';
                },
                '.light-num.min': function(){
                    if(parseInt($('#yMin').val()) + parseInt($('#gMin').val()) + parseInt($('#rMin').val()) > 7){
                        return '警示灯总量不能超过7。';    
                    }
                    return true;
                },
                '.light-num.max': function(value){
                    var rMin = $('#rMin').val(),
                        rMax = $('#rMax').val(),
                        yMin = $('#yMin').val(),
                        yMax = $('#yMax').val(),
                        gMin = $('#gMin').val(),
                        gMax = $('#gMax').val();
                    if(rMax >= rMin && yMax >= yMin && gMax >= gMin){
                        return true;
                    }
                    if((rMin && !rMax) || (yMin && !yMax) || (gMin && !gMax)){
                        return '请输入灯的最大数量';
                    }
                    return '灯的最大数量需大于最小数量';
                }

            },
            validate: function() {
                var scope = diagRule, valid = true, errormsg;
                $.each(diagRule.validators, function(selector, func) {
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
                if(diagRule.validate()){
                    dd.device.notification.showPreloader({text: '使劲提交中...'});

                    var dt = {
                        omsuid: JSON.parse(getCookie('omsUser')).id,
                        token: JSON.parse(getCookie('omsUser')).token,
                        red_min: $('#rMin').val(),
                        red_max: $('#rMax').val(),
                        yellow_min: $('#yMin').val(),
                        yellow_max: $('#yMax').val(),
                        green_min: $('#gMin').val(),
                        green_max: $('#gMax').val(),
                        diag_result: $('#res').val(),
                        diag_sugg: $('#sug').val()
                    },
                        apiUrl = oms_config.apiUrl + oms_apiList.saveRuleConf;
                    if(diagRule.ID) {
                        dt.id = diagRule.ID;
                    }
                    var detailObj = $('#ruleCtn .ui-select-group'),
                        detailArr = [];
                    detailObj.forEach(function(obj, index){
                        var lightStr = $(obj).find('.light').attr('data-id'),
                            classStr = $(obj).find('.type-class').attr('data-id'),
                            workStr = $(obj).find('.type-work').attr('data-id');
                        var item = {
                            light: +(lightStr.substr(lightStr.length - 1, 1)),
                            class: +(classStr.substr(classStr.length - 1, 1)),
                            work_type: +(workStr.substr(workStr.length - 1, 1))
                        };
                        detailArr.push(item);
                    });
                    detailArr.length && (dt.detail = detailArr);
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
                    var delFn = function(){
                        if(!location.search){
                            // replaceLink('teamDiagnoseConfig.html');
                            history.back(-1);
                            return;
                        }
                        var apiUrl = oms_config.apiUrl + oms_apiList.delRuleConf;
                        $.ajax({
                            url: apiUrl,
                            data: {
                                id: diagRule.ID,
                                omsuid: JSON.parse(getCookie('omsUser')).id,
                                token: JSON.parse(getCookie('omsUser')).token
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
                    };
                    diagRule.deleteConfirm(delFn);
                });
                $('#save').on('click', function(){
                    diagRule.saveData();
                });

                $('#ruleCtn').on('click', '.ui-select-group', function(){
                    var $this = $(this),
                        $clsEl = $this.find('.type-class'),
                        $workEl = $this.find('.type-work'),
                        $lightEl = $this.find('.light');
                    var tpSelect = new IosSelect(3, 
                        [
                            [
                                {id: '1', value: '工作量'},
                                {id: '2', value: '业绩'},
                                {id: '3', value: '其他'}
                            ], 
                            [ 
                                {id: '21', value: '资料量', parentId: '1'},
                                {id: '22', value: '绕KP量', parentId: '1'},
                                {id: '23', value: '电话量', parentId: '1'},
                                {id: '24', value: '拜访量', parentId: '1'},
                                {id: '25', value: '理单完成率', parentId: '1'},
                                {id: '26', value: '成单量', parentId: '2'},
                                {id: '27', value: '私海客户', parentId: '3'}
                            ],
                            [
                                {id: '31', value: '红灯'},
                                {id: '32', value:'黄灯'}, 
                                {id: '33',value:'绿灯'}
                            ]
                        ],
                        {
                            title: '复选条件',
                            relation: [1, 0],
                            oneLevelId: $clsEl.data('id').toString(),
                            twoLevelId: $workEl.data('id').toString(),
                            threeLevelId: $lightEl.data('id').toString(),
                            itemHeight: 35,
                            callback: function(opt1, opt2, opt3){
                                $clsEl.html(opt1.value);
                                $clsEl.attr('data-id', opt1.id);
                                $workEl.html(opt2.value);
                                $workEl.attr('data-id', opt2.id);
                                $lightEl.html(opt3.value);
                                $lightEl.attr('data-id', opt3.id);
                            }
                        });
                });

                // $('#ruleCtn').on('change', '.type-class', function(){
                //     var value = $(this).val();
                //     $(this).parents('.ui-select-group').find('.type-work').html(diagRule.optionObj[+value - 1]);
                // })
                
                $('#addCheckRule').on('click', function(){
                    var tmp = $('#ruleTmp').html();
                    $(tmp).insertBefore($(this));
                });
                $('#ruleCtn').on('click', '.rule-delete', function(){
                    var $this = $(this);
                    var delFn = function(){
                        $this.parent().remove();
                    };
                    diagRule.deleteConfirm(delFn);
                });
            },
            restoreData: function(data){
                $('#rMin').val(data.red_min);
                $('#rMax').val(data.red_max);
                $('#yMin').val(data.yellow_min);
                $('#yMax').val(data.yellow_max);
                $('#gMin').val(data.green_min);
                $('#gMax').val(data.green_max);
                $('#res').val(data.diag_result);
                $('#sug').val(data.diag_sugg);

                if(data.detail && data.detail.length){
                    data.detail.forEach(function(item){
                        var $tmp = $($('#ruleTmp').html()),
                            $classEl = $tmp.find('.type-class'),
                            $lightEl = $tmp.find('.light'),
                            $workEl = $tmp.find('.type-work');
                        $classEl.html(['工作量', '业绩', '其他'][item.class - 1]);
                        $classEl.attr('data-id', item.class);
                        $lightEl.html(['红灯', '黄灯', '绿灯'][item.light - 1]);
                        $lightEl.attr('data-id', item.light);
                        $workEl.html(['资料量', '绕KP量', '电话量', '拜访量', '理单完成率', '成单量', '私海客户'][item.work_type - 1]);
                        $workEl.attr('data-id', item.work_type);
                        $tmp.insertBefore($('#addCheckRule'));
                    });
                }
            },
            fetchConfigData: function(){
                OMS_Diagnose.showLoading();
                var apiUrl = oms_config.apiUrl + oms_apiList.getSpecRuleConf,
                    reqData = {
                        id: diagRule.ID,
                        omsuid: JSON.parse(getCookie('omsUser')).id,
                        token: JSON.parse(getCookie('omsUser')).token
                    };

                $.ajax({
                    url: apiUrl,
                    data: reqData,
                    type: 'post',
                    data: reqData,
                    complete: function(){
                        OMS_Diagnose.hideLoading();
                    },
                    success: function(resp){
                        var result = JSON.parse(resp);
                        if(result.res == 1){
                            diagRule.restoreData(result.data);
                        } else {
                            OMS_Diagnose.showAlert('数据拉取异常，请联系管理员。');
                        }
                    }
                });
            },
            initSelect: function(){
                var ctn = $('#ruleCtn');
                

            }

        };
        dd.ready(function(){
            ddbanner.changeBannerTitle('智能诊断配置');
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
            diagRule.bindEvent();
            if(location.search){
                diagRule.ID = OMS_Diagnose.getURLParameter('id');
                diagRule.fetchConfigData();
            }
            diagRule.initSelect();
        });
    })