var __$$customerVersion = 1;

var customer = {
    code: getUrlParam('code'),
    name: getUrlParam('name'),
    cusid: getUrlParam('cusid'),
    from: getUrlParam('from'),
    idSet: [1],
    draftId: null,
    recordData: {},
    areaVal: null,
    isFinish: false,
    submitData: function() {

        var num_regex = new RegExp(/^(?=.*\d)[\d]+$/);
        var float_regex = new RegExp(/^\d+(?:\.\d+|)$/);
        var cusname = $.trim($("#cusname").val());
        var corp = $.trim($("#corp").val());
        var capital = $.trim($("#capital").val());
        var isarea = $.trim($("#isarea").val());
        var trade = $.trim($("#trade").val());
        var terminals = $.trim($("#terminals").val());
        var remark = $.trim($("#remark").val());
        var customer_source = $.trim($("#customer_source").val());
        // var isarea = "60117";
        if (cusname == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请填写客户名称',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }
        if (cusname.length < 3) {
            dd.device.notification.toast({
                icon: 'error',
                text: '客户名称须大于等于3个字符',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }
        if (corp == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请填写法人',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }
        if (capital == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请填写注册资本',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }

        if (!float_regex.test(capital)) {
            dd.device.notification.toast({
                icon: 'error',
                text: '注册资本必须为数字',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }

        if (isarea == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请选择区域',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }
        if (trade == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请选择行业',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }
        if (terminals != "") {
            if (!num_regex.test(terminals)) {
                dd.device.notification.toast({
                    icon: 'error',
                    text: '外勤人数必须为数字',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                })
                return false;
            }
        }


        var contact_count = $('#contact_count').val();
        var contactors = new Array();
        var flag = true;
        _(customer.idSet).forEach(function(value) {
            var temp_name = $.trim($("#name_" + value).val());
            var temp_phone = $.trim($("#phone_" + value).val());
            var temp_mail = $.trim($("#mail_" + value).val());
            var temp_position = $.trim($("#position_" + value).val());
            if (temp_name == "") {
                flag = false;
                dd.device.notification.toast({
                    icon: 'error',
                    text: '请填写联系人',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                });
                return false;
            }
            if (temp_phone == "") {
                flag = false;
                dd.device.notification.toast({
                    icon: 'error',
                    text: '请填写移动电话',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                });
                return false;
            }
            if (!num_regex.test(temp_phone)) {
                flag = false;
                dd.device.notification.toast({
                    icon: 'error',
                    text: '移动电话必须为数字！',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                })
                return false;
            }

            if (temp_position == "") {
                flag = false;
                dd.device.notification.toast({
                    icon: 'error',
                    text: '请选择职位',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                });
                return false;
            }
            var contact_item = {};
            contact_item = {
                "linkman": temp_name,
                "telephone": temp_phone,
                "position": temp_position,
                "email": temp_mail
            };
            contactors.push(contact_item);
        });
        if (!flag) {
            return;
        }

        var post_data = {
            "omsuid": JSON.parse(getCookie("omsUser")).id,
            "token": JSON.parse(getCookie("omsUser")).token,
            "customer": {
                "cusname": cusname,
                "corp": corp,
                "capital": capital,
                "trade": trade,
                "customer_source": customer_source,
                "terminals": terminals,
                "isarea": isarea,
                "remark": remark
            },
            "contactors": contactors
        };
        // return;
        var addCustomerApi = oms_config.apiUrl + oms_apiList.addCustomer;

        // console.log(customer.draftId);
        // draftWork.remove(customer.draftId);
        // return;
        if (!customer.isAddCustomer) {
            dd.device.notification.showPreloader({
                text: '使劲提交中...'
            });
            customer.isAddCustomer = true;
            $.ajax({
                type: 'POST',
                url: addCustomerApi,
                data: post_data,
                cache: false,
                success: function(data) {
                    customer.isFinish = true;
                    customer.isAddCustomer = false;
                    var response = JSON.parse(data);
                    if (response.res == 1) {
                        console.log(customer.draftId);
                        //清除草稿
                        draftWork.remove(customer.draftId);
                        //储存cusid;
                        var prev_oms_customer_new = localStorage.getItem('oms_customer_new');
                        if (prev_oms_customer_new === null) {
                            localStorage.setItem('oms_customer_new', JSON.stringify([response.data.cusid]));
                        } else {
                            prev_oms_customer_new = JSON.parse(prev_oms_customer_new);
                            prev_oms_customer_new.push(response.data.cusid);
                            localStorage.setItem('oms_customer_new', JSON.stringify(prev_oms_customer_new));
                        }
                        cusAddCompleteWidget.init(contactors, function(obj) {
                            customer.initApi();
                        });
                    }

                    if (response.res == 0) {
                        dd.device.notification.toast({
                            icon: 'error',
                            text: response.msg,
                            duration: 1,
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    }

                    if (response.res == 2) {
                        dd.device.notification.toast({
                            icon: 'error',
                            text: '该客户已存在，无需添加！',
                            duration: 1,
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    }

                },
                error: function(xhr, type) {
                    console.log('ajax error!');
                    customer.isAddCustomer = false;
                }
            }).always(function() {
                dd.device.notification.hidePreloader();
            });
        } else {
            dd.device.notification.toast({
                text: '使劲提交中...'
            });
        }
    },

    submitEditData: function() {
        // var cusname = $.trim($("#cusname").val());
        var num_regex = new RegExp(/^(?=.*\d)[\d]+$/);
        var float_regex = new RegExp(/^\d+(?:\.\d+|)$/);
        var corp = $.trim($("#corp").val());
        var capital = $.trim($("#capital").val());
        var isarea = $.trim($("#isarea").val());
        var trade = $.trim($("#trade").val());
        var terminals = $.trim($("#terminals").val());
        var remark = $.trim($("#remark").val());
        var customer_source = $.trim($("#customer_source").val());

        // var isarea = "60117";
        // if(cusname == ""){
        // 	dd.device.notification.toast({
        // 		icon: 'error',
        // 		text: '请填写客户名称',
        // 		duration: 1,
        // 		onSuccess : function(result) {},
        // 		onFail : function(err) {}
        // 	})
        // 	return false;
        //    }
        if (corp == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请填写法人',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }
        if (capital == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请填写注册资本',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }

        if (!float_regex.test(capital)) {
            dd.device.notification.toast({
                icon: 'error',
                text: '注册资本必须为数字！',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }

        if (isarea == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请选择区域',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }
        if (trade == "") {
            dd.device.notification.toast({
                icon: 'error',
                text: '请选择行业',
                duration: 1,
                onSuccess: function(result) {},
                onFail: function(err) {}
            })
            return false;
        }

        if (terminals != "") {
            if (!num_regex.test(terminals)) {
                dd.device.notification.toast({
                    icon: 'error',
                    text: '外勤人数必须为数字',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                })
                return false;
            }
        }

        var contact_count = $('#contact_count').val();
        var flag = true;
        var contactors = new Array();
        for (i = 1; i <= contact_count; i++) {
            var temp_name = $.trim($("#name_" + i).val());
            var temp_phone = $.trim($("#phone_" + i).val());
            var temp_mail = $.trim($("#mail_" + i).val());
            var temp_position = $.trim($("#position_" + i).val());
            var temp_id = $.trim($("#contactEditId_" + i).val());
            if (temp_name == "") {
                flag = false;
                dd.device.notification.toast({
                    icon: 'error',
                    text: '请填写联系人',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                });
                return false;
            }
            if (temp_phone == "") {
                flag = false;
                dd.device.notification.toast({
                    icon: 'error',
                    text: '请填写移动电话',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                });
                return false;
            }

            if (temp_phone.length > 0) {
                if (!num_regex.test(temp_phone)) {
                    flag = false;
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

            if (temp_position == "") {
                flag = false;
                dd.device.notification.toast({
                    icon: 'error',
                    text: '请选择职位',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                });
                return false;
            }
            var contact_item = {};
            contact_item = {
                "id": temp_id,
                "linkman": temp_name,
                "telephone": temp_phone,
                "position": temp_position,
                "email": temp_mail
            };
            contactors.push(contact_item);

        }
        if (!flag) {
            return;
        }
        var post_data = {
            "omsuid": JSON.parse(getCookie("omsUser")).id,
            "token": JSON.parse(getCookie("omsUser")).token,
            "customer": {
                "id": customer.cusid,
                "corp": corp,
                "capital": capital,
                "trade": trade,
                "customer_source": customer_source,
                "terminals": terminals,
                "isarea": isarea,
                "remark": remark
            },
            "contactors": contactors
        };
        var editCustomerApi = oms_config.apiUrl + oms_apiList.editCustomer;
        if (customer.isEditCustomer) {
            dd.device.notification.toast({
                text: '使劲提交中...'
            });
            return;
        }
        dd.device.notification.showPreloader({
            text: '使劲提交中...'
        });
        customer.isEditCustomer = true;
        $.ajax({
            type: 'POST',
            url: editCustomerApi,
            data: post_data,
            cache: false,
            success: function(data) {
                customer.isEditCustomer = true;

                var response = JSON.parse(data);
                if (response.res == 1) {
                    dd.device.notification.toast({
                        icon: 'success',
                        text: '已提交',
                        duration: 1,
                        onSuccess: function(result) {
                            history.back(-1);
                            // replaceLink('customerInfo.html?code='+customer.cusid+'&from='+customer.from);
                        },
                        onFail: function(err) {}
                    });
                    // cusAddCompleteWidget.init(contactors,function(obj){
                    //          	customer.initApi();
                    //      	});
                }

                if (response.res == 0) {
                    dd.device.notification.toast({
                        icon: 'error',
                        text: response.msg,
                        duration: 1,
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                }

                // if(response.res == 2)
                // {
                // 	dd.device.notification.toast({
                // 		icon: 'error',
                // 		text: '该客户已存在，无需添加！',
                // 		duration: 1,
                // 		onSuccess : function(result) {},
                // 		onFail : function(err) {}
                // 	});
                // }

            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        }).always(function() {
            dd.device.notification.hidePreloader();
        });
    },
    addContact: function() {
        var num_regex = new RegExp(/^(?=.*\d)[\d]+$/);
        // var contact_count = $('#contact_count').val();
        var contact_count = _.last(customer.idSet);
        var name_1 = $("#name_" + contact_count).val();
        var phone_1 = $("#phone_" + contact_count).val();
        var mail_1 = $("#mail_" + contact_count).val();
        var position_1 = $("#position_" + contact_count).val();
        if (name_1 == '' || phone_1 == '' || position_1 == '') {
            dd.device.notification.toast({
                icon: 'error',
                text: '联系人、移动电话、职位为必填项，请填写！',
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

        $("#qfcontact" + contact_count).after('<div id="qfcontact' + contact_name + '"><div class="ui-form-item-blank" style="background-color: #f5f5f6; width: 100%"></div>' + '<div class="ui-form ui-form-gap form-group" >' + '<div class="ui-form-item ui-form-item-l  ui-border-b"><label>联系人</label><input type="text" name="name_' + contact_name + '" id="name_' + contact_name + '" placeholder="请输入"></div>' + '<div class="ui-form-item ui-form-item-l  ui-border-b"><label>移动电话</label><input type="tel" name="phone_' + contact_name + '" id="phone_' + contact_name + '" placeholder="请输入"></div>' + '<div class="ui-form-item ui-form-item-l  ui-border-b"><label>职位</label><div class="ui-select"><select name="position_' + contact_name + '" id="position_' + contact_name + '"><option value="">请选择</option><option value="总经理">总经理</option><option value="副总经理">副总经理</option><option value="法人代表">法人代表</option><option value="前台">前台</option><option value="销售总监">销售总监</option><option value="人事">人事</option><option value="市场">市场</option><option value="财务">财务</option><option value="其他">其他</option></select><i class="ui-icon-list_arrow_right"></i></div></div>' + '<div class="ui-form-item ui-form-item-l  ui-border-b"><label>邮箱</label><input type="text" name="mail_' + contact_name + '" id="mail_' + contact_name + '" placeholder="请输入"></div>' + '<div><ul class="ui-list ui-list-text ui-list-cover ui-row-flex form-group">' + '<li class="ui-col ui-col ui-flex" id="delete_' + contact_name + '"  onclick="customer.delete_contacts(' + contact_name + ')"><i id="_add_relation_" class="ui-icon-list_delete" style="font-size: 15px;color: #ec564d"></i><div class="add-content">删除</div></li>'
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
        if (customer.code == 'new') {
            var cusname = $.trim(customer.name);
            if (typeof cusname == 'undefined')
                var cusname = '';
            $("#v-container2").prepend('<div class="ui-form-item ui-form-item-input-l ui-border-b"><label>客户名称</label><input type="text" novalidate="" placeholder="请输入客户名称" id="cusname" name="cusname" value="' + cusname + '"><button type="button" onclick="checkExist();" class="ui-btn-inline">查重</button></div>');
            if (!_.isEmpty(customer.recordData)) {
                customer.renderDraft();
            }

            $('#customer_form').data('serialize', $('#customer_form').serialize());
        }

        if (customer.code == 'edit') {
            customer.getEditData();
            $("#addcontactpersonmore").remove();
            var cusname = $.trim(customer.name);
            if (typeof cusname == 'undefined')
                var cusname = '';
            $("#v-container2").prepend('<div class="ui-form-item ui-form-item-input-l ui-border-b"><label>客户名称</label><input type="text" readonly value="' + cusname + '"></div>');
        }


    },

    getEditData: function() {
        var cusInfoApi = oms_config.apiUrl + oms_apiList.getCustomerInfo;
        $.ajax({
            type: 'POST',
            url: cusInfoApi,
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'cusid': customer.cusid
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                customer.renderEditData(response.data.info, response.data.contactors);
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        });
    },

    renderEditData: function(info, contacts) {
        $("#corp").val(info.corp);
        $("#isareas").val(info.region_name);
        $("#isarea").val(info.isarea);
        $("#capital").val(info.capital);
        $("#terminals").val(info.terminals);
        $("#trade").val(info.trade);
        $("#customer_source").val(info.customer_source);
        $("#remark").val(info.remark);
        $("#contact_count").val(contacts.length);

        //remove contacts from
        $("#qfcontact1").remove();

        //generate contacts form list
        var list = "";
        if (contacts.length > 0) {
            for (var i in contacts) {
                list += customer.renderEditContacts(parseInt(i) + 1, contacts[i]);
            }

            $("#formdetail").append(list);
        }

    },

    // renderEditEach : function(data){

    // },

    renderEditContacts: function(index, data) {
        var list = '<div class="ui-form ui-form-gap form-group" id="qfcontact' + index + '">' + '<input type="hidden" id="contactEditId_' + index + '" value="' + data.id + '">' + '<div class="ui-form-item ui-form-item-l  ui-border-b"><label>联系人</label>' + '<input type="text" name="name_' + index + '" id="name_' + index + '" placeholder="请输入" value="' + data.linkman + '"></div>' + '<div class="ui-form-item ui-form-item-l  ui-border-b"><label>移动电话</label>' + '<input type="tel" name="phone_' + index + '" id="phone_' + index + '" placeholder="请输入" value="' + data.telephone + '"></div>' + '<div class="ui-form-item ui-form-item-l  ui-border-b"><label>职位</label>' + '<div class="ui-select"><select name="position_' + index + '" id="position_' + index + '" value="' + data.position + '">' + '<option value="总经理">总经理</option><option value="副总经理">副总经理</option><option value="法人代表">法人代表</option><option value="前台">前台</option><option value="销售总监">销售总监</option><option value="人事">人事</option><option value="市场">市场</option><option value="财务">财务</option><option value="其他">其他</option>' + '</select><i class="ui-icon-list_arrow_right"></i></div></div>' + '<div class="ui-form-item ui-form-item-l  ui-border-b"><label>邮箱</label>' + '<input type="text" name="mail_' + index + '" id="mail_' + index + '" placeholder="请输入" value="' + data.email + '"></div></div>'
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
                        if(!customer.isFinish)
                        {
                          if (customer.code == 'new') {
                              if ($('#customer_form').serialize() != $('#customer_form').data('serialize')) {
                                  customer.draftRecord();
                              }
                          }
                        }
                        history.back(-1);
                    },
                    onFail: function(err) {}
                });
            } else {
                $(document).off('backbutton');
                $(document).on('backbutton', function(e) {
                    if(!customer.isFinish)
                    {
                      if (customer.code == 'new') {
                          if ($('#customer_form').serialize() != $('#customer_form').data('serialize')) {
                              customer.draftRecord();
                          }
                      }
                    }
                    history.back(-1);
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
                if (customer.code == 'new') {

                    customer.submitData();
                }
                if (customer.code == 'edit') {
                    customer.submitEditData();
                }

            },
            onFail: function(err) {}
        });
    },
    initApi: function() {
        customer.getLocalDraft();
        var texta = customer.code == 'new' ? '新增客户' : '编辑客户';
        dd.ready(function() {
            dd.biz.navigation.setTitle({
                title: texta,
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
            customer.initLeft();
            console.log('33');
            customer.initRight();
        });
    },


    init: function() {
        customer.initApi();
        customer.initCus();
        $("#isareas").click(function() {
            areaWidget.init(function(obj) {
                areaWidget.initApi();
                $(".ui-form").show();
                customer.areaVal = obj;
                $("#isareas").val(obj.name);
                $("#isarea").val(obj.code);
                customer.initApi();
            });
            // openLink(oms_config.baseUrl+'areas.html',true);
        });

        $("#pullConfirm").tap(function() {
            pullConfirm();
            // console.log('pull');
        });

        $("#addcontactpersonmore").click(function() {
            customer.addContact();
        });

        // window.onbeforeunload = function(){
        // 	// console.log('unload');
        //    	if($('#customer_form').serialize()!=$('#customer_form').data('serialize')){
        //       		customer.draftRecord();
        //       	}
        // }

    },

    renderDraft: function() {
        $("#cusname").val(customer.recordData.cusname);
        $("#corp").val(customer.recordData.corp);
        $("#capital").val(customer.recordData.capital);
        $("#isarea").val(customer.recordData.isarea);
        $("#isareas").val(customer.recordData.isareas);
        $("#trade").val(customer.recordData.trade);
        $("#customer_source").val(customer.recordData.customer_source);
        $("#terminals").val(customer.recordData.terminals);
        $("#remark").val(customer.recordData.remark);
        //render first contact
        $("#name_1").val(customer.recordData.contactors[0]['linkman']);
        $("#phone_1").val(customer.recordData.contactors[0]['telephone']);
        $("#position_1").val(customer.recordData.contactors[0]['position']);
        $("#mail_1").val(customer.recordData.contactors[0]['email']);
        if (customer.idSet.length > 1) {
            $("#addcontactpersonmore").css({
                "position": "absolute",
                "bottom": 0,
                "right": 0
            });
            _(customer.recordData.contactors).forEach(function(value, i) {
                if (i > 0) {
                    customer.renderDraftContact(value, i);
                }
            });
        }
    },

    renderDraftContact: function(data, index) {
        var count = parseInt(index) + 1;
        $("#qfcontact" + index).after('<div id="qfcontact' + count + '"><div class="ui-form-item-blank" style="background-color: #f5f5f6; width: 100%"></div>' + '<div class="ui-form ui-form-gap form-group" >' + '<div class="ui-form-item ui-form-item-l  ui-border-b"><label>联系人</label><input type="text" name="name_' + count + '" id="name_' + count + '" placeholder="请输入"></div>' + '<div class="ui-form-item ui-form-item-l  ui-border-b"><label>移动电话</label><input type="tel" name="phone_' + count + '" id="phone_' + count + '" placeholder="请输入"></div>' + '<div class="ui-form-item ui-form-item-l  ui-border-b"><label>职位</label><div class="ui-select"><select name="position_' + count + '" id="position_' + count + '"><option value="">请选择</option><option value="总经理">总经理</option><option value="副总经理">副总经理</option><option value="法人代表">法人代表</option><option value="前台">前台</option><option value="销售总监">销售总监</option><option value="人事">人事</option><option value="市场">市场</option><option value="财务">财务</option><option value="其他">其他</option></select><i class="ui-icon-list_arrow_right"></i></div></div>' + '<div class="ui-form-item ui-form-item-l  ui-border-b"><label>邮箱</label><input type="text" name="mail_' + count + '" id="mail_' + count + '" placeholder="请输入"></div>' + '<div><ul class="ui-list ui-list-text ui-list-cover ui-row-flex form-group">' + '<li class="ui-col ui-col ui-flex" id="delete_' + count + '"  onclick="customer.delete_contacts(' + count + ')"><i id="_add_relation_" class="ui-icon-list_delete" style="font-size: 15px;color: #ec564d"></i><div class="add-content">删除</div></li>' + '</div></div>');

        $("#name_" + count).val(data['linkman']);
        $("#phone_" + count).val(data['telephone']);
        $("#position_" + count).val(data['position']);
        $("#mail_" + count).val(data['email']);
    },

    getLocalDraft: function() {
        // window.localStorage.clear();
        console.log(localStorage);
        var draftId = getUrlParam('draftId'),
            draftObj;
        // var draftId = '2647215', draftObj;
        // console.log(draftId);
        if (draftId) {
            draftObj = draftWork.get(draftId);
            if (draftObj) {
                customer.cusname = draftObj.cusname;
                customer.code = draftObj.record.code;
                customer.draftId = draftObj._oid;
                customer.recordData = draftObj.record;
                customer.idSet = draftObj.record.idSet;
                console.log(customer.draftId);
                // customer.areaVal = draftObj.record.areaVal;
            }
        }
    },

    draftRecord: function() {
        var contactors = new Array();
        _(customer.idSet).forEach(function(value) {
            var temp_name = $.trim($("#name_" + value).val());
            var temp_phone = $.trim($("#phone_" + value).val());
            var temp_mail = $.trim($("#mail_" + value).val());
            var temp_position = $.trim($("#position_" + value).val());
            var contact_item = {};
            contact_item = {
                "linkman": temp_name,
                "telephone": temp_phone,
                "position": temp_position,
                "email": temp_mail
            };
            contactors.push(contact_item);
        });

        var draftData = {
            code: customer.code,
            cusname: $.trim($("#cusname").val()),
            corp: $.trim($("#corp").val()),
            capital: $.trim($("#capital").val()),
            isarea: $.trim($("#isarea").val()),
            isareas: $.trim($("#isareas").val()),
            trade: $.trim($("#trade").val()),
            customer_source: $.trim($("#customer_source").val()),
            terminals: $.trim($("#terminals").val()),
            remark: $.trim($("#remark").val()),
            idSet: customer.idSet,
            contactors: contactors
        }

        var draftObj = {
            type: 'customer',
            title: $.trim($("#cusname").val()) || '待补充',
            cusname: $.trim($("#cusname").val()),
            cusid: '',
            record: draftData
        }

        var draftId = draftWork.set(customer.draftId, draftObj);
    }

};

function checkExist() {
    var cusname = $('#cusname').val();
    if (cusname.length == 0) {
        dd.device.notification.toast({
            icon: 'error',
            text: '请输入客户名称',
            duration: 1,
            onSuccess: function(result) {},
            onFail: function(err) {}
        })
    } else {
        var getAreasApi = oms_config.apiUrl + oms_apiList.isCustomerExists;
        $.ajax({
            type: 'POST',
            url: getAreasApi,
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'cusname': cusname
            },
            cache: false,
            success: function(data) {
                if (JSON.parse(data).res == 1) {
                    if (JSON.parse(data).data.type == 2) {
                        dd.device.notification.toast({
                            icon: 'error',
                            text: '客户已存在于私海中！',
                            duration: 1,
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                        return false;
                    } else if (JSON.parse(data).data.type == 3) {
                        dd.device.notification.toast({
                            icon: 'error',
                            text: '客户不在当前城市，无法拉入或新增！',
                            duration: 1,
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                        return false;
                    }else {
                        customer.pullCusId = JSON.parse(data).data.cusid;
                        $('#toPrivate').dialog('show');
                    }

                } else {
                    dd.device.notification.toast({
                        icon: 'success',
                        text: '该客户可以录入噢~',
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
    }
}

function pullConfirm() {
    var pullCustomerApi = oms_config.apiUrl + oms_apiList.pullCustomer;
    $.ajax({
        type: 'POST',
        url: pullCustomerApi,
        data: {
            'omsuid': JSON.parse(getCookie('omsUser')).id,
            'token': JSON.parse(getCookie('omsUser')).token,
            'cusid': customer.pullCusId
        },
        cache: false,
        success: function(data) {
            if (JSON.parse(data).res == 1) {
                dd.device.notification.toast({
                    icon: 'success',
                    text: '已提交',
                    duration: 1,
                    onSuccess: function(result) {
                        // openLink('privateSea.html');
                        draftWork.remove(customer.draftId);
                        history.back(-1);
                    },
                    onFail: function(err) {}
                });


            } else {
                dd.device.notification.toast({
                    icon: 'error',
                    text: JSON.parse(data).msg,
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
}

function setArea() {
    var tempCookie = JSON.parse(getCookie('omsArea'));

    $("#isareas").val(tempCookie.name);
    $("#isarea").val(tempCookie.code);
}

$.fn.customer = function(settings) {
    $.extend(customer, settings || {});
};
$.fn.ready(function() {
    customer.init();
});
