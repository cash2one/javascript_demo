var __$$customerVersion = 1;

var customer = {
    code: getUrlParam('code'),
    name: getUrlParam('name'),
    cusid: getUrlParam('cusid'),
    from: getUrlParam('from'),
    areaIdNameMap:{},
    idSet: [1],
    draftId: null,
    recordData: {},
    areaVal: null,
    isFinish: false,
    typingTimer:0,
    doneTypingInterval: 2000,
    mobileDuplicated:false,
    setMobileCheck: function () {
        var input = $("input[name=mobile]");
        // var input = $("input[name=mobile]");

        //on keyup, start the countdown
        input.on('keyup', function () {
            clearTimeout(customer.typingTimer);
            customer.typingTimer = setTimeout(customer.doneTyping, customer.doneTypingInterval);
        });

        //on keydown, clear the countdown
        input.on('keydown', function () {
            clearTimeout(customer.typingTimer);
        });
    },
    doneTyping: function () {
        OMS_COM.ajaxPost({
            api: 'checkMobile',
            data: {
                mobile:$.trim($("input[name=mobile]").val()),
                // shopId:$.trim($("select[name=shopId]").val())
            },
            success: function (data) {
                var res = JSON.parse(data);
                if(parseInt(res.code) === 0) {
                    if(res.data == false&&customer.code=='new'){
                        customer.mobileDuplicated = true;
                        dd.device.notification.toast({
                            icon: 'error',
                            text: '该门店已经存在此手机号',
                            duration: 1,
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        })
                    }else{
                        customer.mobileDuplicated = false;
                    }
                }
            },
            error: function () {

            },
            always: function () {

            }
        });
    },
    submitData: function() {
        var cusname = $.trim($("input[name=name]").val());
        var mobile = $.trim($("input[name=mobile]").val());
        var weixinId = $.trim($("input[name=weixinId]").val());
        var sex = $.trim($("select[name=sex]").val());
        // var cityId = $.trim($("select[name=cityId]").val());
        // var shopId = $.trim($("select[name=shopId]").val());
        var activeArea = $.trim($("select[name=activeAreaId]").val());
        // var birthday = $.trim($("input[name=birthday]").val());
        var requirmentId = $.trim($("select[name=requirmentId]").val());
        var sourceId = $.trim($("select[name=sourceId]").val());
        var hasExperience = $.trim($("select[name=hasExperience]").val());
        // var moneyForecast = $.trim($("input[name=moneyForecast]").val());
        if(OMS_COM.checkEmptyField(cusname, '请填写客户名称')===false) return;
        if(OMS_COM.checkEmptyField(mobile, '请填写手机')===false) return;
       // if(OMS_COM.checkEmptyField(weixinId, '请填写微信')===false) return;
        if(OMS_COM.checkEmptyField(sex, '请选择性别')===false) return;
        // if(OMS_COM.checkEmptyField(cityId, '请选择客户所在城市')===false) return;
        // if(OMS_COM.checkEmptyField(shopId, '请选择客户所在门店')===false) return;
        if(OMS_COM.checkEmptyField(activeArea, '请选择活动区域')===false) return;
        if(OMS_COM.checkEmptyField(hasExperience, '请填写有无健身史')===false) return;
        //if(OMS_COM.checkEmptyField(birthday, '请填写生日')===false) return;
        if(OMS_COM.checkEmptyField(requirmentId, '请选择健身需求')===false) return;
        if(OMS_COM.checkEmptyField(sourceId, '请选择客户来源')===false) return;
        //if(OMS_COM.checkEmptyField(moneyForecast, '请填写预计金额')===false) return;
        if (cusname.length < 2) {
            dd.device.notification.toast({
                icon: 'error',
                text: '客户名称须大于等于2个字符',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }
        if(customer.mobileDuplicated){
            dd.device.notification.toast({
                icon: 'error',
                text: '该门店已经存在此手机号',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }
        if(OMS_COM.checkNumField(mobile, '手机号必须为数字')===false) return;
        //if(OMS_COM.checkFloatField(moneyForecast, '金额必须为数字')===false) return;
        var contact_count = $('#contact_count').val();
        // var contactors = new Array();
        // var contactsValid = true;
        // _(customer.idSet).forEach(function(value) {
        //     var temp_name = $.trim($("#name_" + value).val());
        //     var temp_phone = $.trim($("#phone_" + value).val());
        //     var temp_position = $.trim($("#position_" + value).val());
        //     //if(OMS_COM.checkEmptyField(temp_name, '请填写联系人')===false) {contactsValid=false;return;}
        //     //if(OMS_COM.checkEmptyField(temp_phone, '请填写移动电话')===false) {contactsValid=false;return;}
        //     //if(OMS_COM.checkEmptyField(temp_position, '请选择关系')===false) {contactsValid=false;return;}
        //     //if(OMS_COM.checkNumField(temp_phone, '电话必须为数字！')===false) {contactsValid=false;return;}
        //     var contact_item = {
        //         "name": temp_name,
        //         "phone": temp_phone,
        //         "relation": temp_position
        //     };
        //     contactors.push(contact_item);
        // });
        // if(contactsValid === false) return false;
        var post_data = {
            "omsuid": JSON.parse(getCookie("omsUser")).id,
            "token": JSON.parse(getCookie("omsUser")).token,
            "userId": JSON.parse(getCookie("omsUser")).id,
            "name": cusname,
            "mobile": mobile,
            "weixinId": weixinId,
            "sex": sex,
            // "cityId": cityId,
            // "shopId": shopId,
            "activeArea": customer.areaIdNameMap[activeArea],
            // "birthday": birthday,
            "requirmentId": requirmentId,
            "sourceId": sourceId,
            "hasExperience": hasExperience,
            // "moneyForecast": moneyForecast,
            // "contacter": JSON.stringify(contactors)
        };

        if (customer.code == 'edit') {
            post_data.id = customer.cusid;
        }

        if (!customer.isAddCustomer) {
            dd.device.notification.showPreloader({
                text: '使劲提交中...'
            });
            customer.isAddCustomer = true;
            OMS_COM.ajaxPost({
                api: "personalCustomerAdd",
                data: post_data,
                success: function (data) {
                    customer.isFinish = true;
                    customer.isAddCustomer = false;
                    var response = JSON.parse(data);
                    if (response.code == 0) {
                        if (customer.code == 'edit') {
                            history.go(-1);
                        }else {
                            cusAddCompleteWidget.init({}, function (obj) {
                                customer.initApi();
                            });
                        }
                    }
                },
                error: function () {
                    customer.isAddCustomer = false;
                },
                always: function () {
                    dd.device.notification.hidePreloader();
                }
            });
        } else {
            dd.device.notification.toast({
                text: '使劲提交中...'
            });
        }
    },

    addContact: function() {
        var num_regex = new RegExp(/^(?=.*\d)[\d]+$/);
        // var contact_count = $('#contact_count').val();
        var contact_count = _.last(customer.idSet);
        var name_1 = $("#name_" + contact_count).val();
        var phone_1 = $("#phone_" + contact_count).val();
        var position_1 = $("#position_" + contact_count).val();
        if (name_1 == '' || phone_1 == '' || position_1 == '') {
            dd.device.notification.toast({
                icon: 'error',
                text: '联系人、电话、关系为必填项，请填写！',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
            return;
        }

        if (phone_1.length > 0) {
            if (!num_regex.test(phone_1)) {
                dd.device.notification.toast({
                    icon: 'error',
                    text: '移动电话必须为数字！',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                })
                return false;
            }
        }

        var contact_name = parseInt(contact_count) + parseInt(1);

        if (customer.idSet.length == 1) {
            $("#addcontactpersonmore").css({
                "position": "absolute",
                "bottom": 0,
                "right": 0
            });
            // $("#addcontactpersonmore").css("bottom",0);
        }
        var relations = localStorage.getItem('gold_contract_relation');
        relations = JSON.parse(relations);
        var relation_result = '';
        _.forEach(Object.keys(relations), function(val){
            relation_result += "<option value='"+val+"'>"+relations[val]+"</option>";
        });

        $("#qfcontact" + contact_count).after('<div id="qfcontact' + contact_name + '"><div class="ui-form-item-blank" style="background-color: #f5f5f6; width: 100%"></div>' + '<div class="ui-form ui-form-gap form-group" >' + '<div class="ui-form-item ui-form-item-l  ui-border-b"><label>联系人姓名</label><input type="text" name="name_' + contact_name + '" id="name_' + contact_name + '" placeholder="请输入"></div>' + '<div class="ui-form-item ui-form-item-l  ui-border-b"><label>联系人电话</label><input type="tel" name="phone_' + contact_name + '" id="phone_' + contact_name + '" placeholder="请输入"></div>' + '<div class="ui-form-item ui-form-item-l  ui-border-b"><label>联系人关系</label><div class="ui-select"><select name="position_' + contact_name + '" id="position_' + contact_name + '"><option value="">请选择</option>'+ relation_result +'</select><i class="ui-icon-list_arrow_right"></i></div></div>' + '<div><ul class="ui-list ui-list-text ui-list-cover ui-row-flex form-group">' + '<li class="ui-col ui-col ui-flex" id="delete_' + contact_name + '"  onclick="customer.delete_contacts(' + contact_name + ')"><i id="_add_relation_" class="ui-icon-list_delete" style="font-size: 15px;color: #ec564d"></i><div class="add-content">删除</div></li>'
            // +'<li class="ui-col ui-col ui-flex ui-flex-pack-end addcontactpersonmore" id="addcontactpersonmore">'
            // +'<i id="_add_relation_" class="ui-icon-add_relation" style="font-size: 14px;color: #ec564d"></i><div class="add-content">添加联系人</div></li></div>'
            + '</div></div>');
        customer.idSet.push(contact_name);

        // $("#contact_count").val(contact_name);
    },

    delete_contacts: function(id) {
        $("#qfcontact" + id).remove();
        _.pull(customer.idSet, id);
        if (customer.idSet.length == 1) {
            $("#addcontactpersonmore").removeAttr("style");
        }
    },
    initCus: function() {
        if (customer.code == 'edit') {
            customer.getEditData();
        }
    },

    getEditData: function() {
        OMS_COM.ajaxPost({
            api: 'getCustomerDetail',
            data:{
                id:customer.cusid
            },
            success: function (data) {
                var res = JSON.parse(data);
                if(parseInt(res.code)===0){
                    customer.renderEditData(res.data);
                }
            },
            error: function () {
                
            },
            always: function () {
                
            }
        });
    },

    renderEditData: function(info) {
        $("input[name=name]").val(info.name);
        $("input[name=mobile]").val(info.mobile);
        $("input[name=weixinId]").val(info.weixinId);
        $("select[name=sex]").val(info.sex);
        // $("select[name=cityId]").val(info.cityId);
        // $("select[name=shopId]").val(info.shopId);
        // $("input[name=birthday]").val(info.birthday);
        $("select[name=requirmentId]").val(info.requirmentId);
        $("select[name=sourceId]").val(info.sourceId);
        $("select[name=hasExperience]").val(info.hasExperience);
        customer.areaVal = info.activeAreaId;
    },

    renderEditContacts: function(index, data) {
        var relations = localStorage.getItem('gold_contract_relation');
        relations = JSON.parse(relations);
        var relation_result = '';
        var selected = '';
        _.forEach(Object.keys(relations), function(val){
            selected = '';
            if(data.relation == val)
                selected = 'selected';
            relation_result += "<option value='"+val+"' "+selected+">"+relations[val]+"</option>";
        });
        var list = '<div class="ui-form ui-form-gap form-group" id="qfcontact'+index+'">\
            <div class="ui-form-item ui-form-item-l  ui-border-b">\
            <label>\
            联系人姓名\
            </label>\
            <input type="text" name="name_'+index+'" id="name_'+index+'" placeholder="请输入">\
            </div>\
            <div class="ui-form-item ui-form-item-l  ui-border-b">\
            <label>\
            联系人电话\
            </label>\
            <input type="tel" name="phone_'+index+'" id="phone_'+index+'" placeholder="请输入">\
            </div>\
            <div class="ui-form-item ui-form-item-l  ui-border-b">\
            <label>\
            联系人关系\
            </label>\
            <div class="ui-select">\
            <select name="position_'+index+'" id="position_'+index+'" >\
            <option value="" default>请选择</option>' +
            relation_result +
        '</select>\
        <i class="ui-icon-list_arrow_right"></i>\
            </div>\
            </div>\
            </div>';
        return list;
    },
    initLeft: function() {
        dd.ready(function() {
            if (dd.ios) {
                dd.biz.navigation.setLeft({
                    show: true,
                    control: true,
                    showIcon: true,
                    text: '',
                    onSuccess: function(result) {
                        history.back();
                    },
                    onFail: function(err) {}
                });
            } else {
                $(document).off('backbutton');
                $(document).on('backbutton', function(e) {
                    history.back();
                    e.preventDefault();
                });
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
                customer.submitData();
            },
            onFail: function(err) {}
        });
    },
    initApi: function() {
        OMS_COM.ajaxPost({
            api: 'getCustomerConfig',
            data: { },
            success: function(data) {
                var res = JSON.parse(data);
                if (parseInt(res.code) === 0) {
                    localStorage.setItem('gold_contract_relation', JSON.stringify(res.data.relation));
                    OMS_COM.fillSelect(res.data.relation, "#position_1");
                    OMS_COM.fillSelect(res.data.requirment, "#requirmentId");
                    OMS_COM.fillSelect(res.data.source, "#sourceId");
                    OMS_COM.fillSelect(res.data.gender, "#sex");
                    // OMS_COM.fillSelect(res.data.city, "#cityId");
                    OMS_COM.ajaxPost({
                       api:'getArea',
                        data:{},
                        success: function (data) {
                            var res = JSON.parse(data);
                            if(parseInt(res.code)===0){
                                _.forEach(res.data, function(val){
                                    $("#activeArea").append("<option value='"+val.id+"'>"+val.area+"</option>");
                                    customer.areaIdNameMap[val.id] = val.area;
                                });
                                if(customer.areaVal!=null)
                                    $("select[name=activeAreaId]").val(customer.areaVal);
                            }
                        },
                        error: function () {

                        },
                        always: function () {

                        }
                    });

                    // var defaultCityId = parseInt(JSON.parse(getCookie('omsUser')).cityId);
                    // console.log('----omsuser---'+JSON.parse(getCookie('omsUser')));
                    // console.log('----defaultCityId---'+defaultCityId);
                    // if(defaultCityId>0)//设置城市..店默认选中.
                    // {
                    //     $("#cityId option[value='"+defaultCityId+"']").attr("selected", "selected");
                    //     var defaultShopId = parseInt(JSON.parse(getCookie('omsUser')).shopId);
                    //     console.log('----defaultShopId---'+defaultShopId);
                    //     OMS_COM.ajaxPost({
                    //         api: 'getShop',
                    //         data:{
                    //             cityId:defaultCityId
                    //         },
                    //         success: function (data) {
                    //             var res = JSON.parse(data);
                    //             if(parseInt(res.code) === 0) {
                    //                 $("#shopId").find('option').remove();
                    //                 $("#shopId").append("<option value=''>请选择</option>")
                    //                 $.each(res.data, function (i, val) {
                    //                     $("#shopId").append("<option value='"+val.id+"'>"+val.name+"</option>");
                    //                 })
                    //                 $("#shopToShow").show();
                    //                 if(defaultShopId>0)
                    //                 {
                    //                     $("#shopId option[value='"+defaultShopId+"']").attr("selected", "selected");
                    //                 }
                    //             }
                    //         },
                    //         error: function () {
                    //
                    //         },
                    //         always: function () {
                    //
                    //         }
                    //     });
                    //
                    //
                    // }
                    // $("#cityId").change(function(){
                    //     var cityId = $(this).val();
                    //     if(cityId == ''){
                    //         $("#shopToShow").hide();
                    //     }else{
                    //         OMS_COM.ajaxPost({
                    //             api: 'getShop',
                    //             data:{
                    //                 cityId:cityId
                    //             },
                    //             success: function (data) {
                    //                 var res = JSON.parse(data);
                    //                 if(parseInt(res.code) === 0) {
                    //                     $("#shopId").find('option').remove();
                    //                     $("#shopId").append("<option value=''>请选择</option>")
                    //                     $.each(res.data, function (i, val) {
                    //                         $("#shopId").append("<option value='"+val.id+"'>"+val.name+"</option>");
                    //                     })
                    //                     $("#shopToShow").show();
                    //                 }
                    //             },
                    //             error: function () {
                    //
                    //             },
                    //             always: function () {
                    //
                    //             }
                    //         });
                    //     }
                    // });
                    // $("#shopId").change(function () {
                    //     console.log('in shopId change');
                    //     customer.doneTyping();
                    // })
                } else {
                    // DDCtrl.showAlert("接口提交失败，请联系技术支持！");
                }
            },
            error: function(err) {
                console.log(err);
            },
            always: function() {

            }
        });
        var texta = customer.code == 'new' ? '录入个人客户信息' : '编辑个人客户信息';
        dd.ready(function() {
            dd.biz.navigation.setTitle({
                title: texta,
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
            customer.initLeft();
            customer.initRight();
        });
        customer.setMobileCheck();
    },


    init: function() {
        customer.initApi();
        customer.initCus();

        $("#addcontactpersonmore").click(function() {
            customer.addContact();
        });

        $("div[data-role='datepicker']").tap(function() {
            var t = $(this);
            DDCtrl.setDatePicker(new Date().Format("yyyy-MM-dd"), function(d) {
                $("input[name=" + t.data("target") + "]").data("value", d).val(d);
            });
        });
    }
};

$.fn.customer = function(settings) {
    $.extend(customer, settings || {});
};
$.fn.ready(function() {
    customer.init();
});
