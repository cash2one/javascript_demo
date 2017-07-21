var __$$customerContactAddVersion = 1;

var customerContactAdd = {
	idSet:[1],
	renderCusContactAdd : function(){
		$("#loading").hide();
		$(".noMore").remove();
		$("#cusContactWidget_result").show();
	},

	close : function(block){
		$("#addcontactperson").remove();
		// $("#cusContactWidget_result").remove();
		// $("#newSearch").remove();
		$(block).show();
	},

	AddContactForm : function(){
		var num_regex = new RegExp(/^(?=.*\d)[\d]+$/);
        // var contact_count = $('#contact_count').val();
        var contact_count = _.last(customerContactAdd.idSet);
        var name_1 = $("#name_"+contact_count).val();
        var phone_1 = $("#phone_"+contact_count).val();
        var position_1 = $("#position_"+contact_count).val();

        if(name_1 == '' || phone_1 == '' || position_1 == ''){
        	dd.device.notification.toast({
				icon: 'error',
				text: '联系人、移动电话、职位为必填项，请填写！',
				duration: 1,
				onSuccess : function(result) {},
				onFail : function(err) {}
			});

            return;
        }
        if(phone_1.length > 0)
        {
        	if(!num_regex.test(phone_1)){
        		dd.device.notification.toast({
					icon: 'error',
					text: '移动电话必须为数字！',
					duration: 1,
					onSuccess : function(result) {},
					onFail : function(err) {}
				})
				return false;
        	}
        }

        if(customerContactAdd.idSet.length ==1)
        {
        	$("#addcontactpersonmore").css({"position":"absolute","bottom":0,"right":0});
        }

        var contact_name = parseInt(contact_count)+parseInt(1);
        $("#qfcontact"+contact_count).after('<div class="ui-form form-group" id="qfcontact'+contact_name+'"><div class="ui-form-item-blank" style="background-color: #f5f5f6; width: 100%"></div>'
        	+'<div class="ui-form-item ui-form-item-l  ui-border-b"><label>联系人</label><input type="text" name="name_'+contact_name+'" id="name_'+contact_name+'" placeholder="请输入"></div>'
        	+'<div class="ui-form-item ui-form-item-l  ui-border-b"><label>移动电话</label><input type="tel" name="phone_'+contact_name+'" id="phone_'+contact_name+'" placeholder="请输入"></div>'
        	+'<div class="ui-form-item ui-form-item-l  ui-border-b"><label>职位</label><div class="ui-select"><select name="position_'+contact_name+'" id="position_'+contact_name+'"><option value="">请选择</option><option value="总经理">总经理</option><option value="副总经理">副总经理</option><option value="法人代表">法人代表</option><option value="前台">前台</option><option value="销售总监">销售总监</option><option value="人事">人事</option><option value="市场">市场</option><option value="财务">财务</option><option value="其他">其他</option></select><i class="ui-icon-list_arrow_right"></i></div></div>'
        	+'<div class="ui-form-item ui-form-item-l  ui-border-b"><label>邮箱</label><input type="text" name="mail_'+contact_name+'" id="mail_'+contact_name+'" placeholder="请输入"></div>'
        	+'<div><ul class="ui-list ui-list-text ui-list-cover ui-row-flex form-group">'
        	+'<li class="ui-col ui-col ui-flex" id="delete_'+contact_name+'"  onclick="customerContactAdd.delete_contacts('+contact_name+')"><i id="_add_relation_" class="ui-icon-list_delete" style="font-size: 15px;color: #ec564d"></i><div class="add-content">删除</div></li>'
        	+'</div></div>');
        // $("#contact_count").val(contact_name);
        customerContactAdd.idSet.push(contact_name);
	},

	delete_contacts : function(id){
		$("#qfcontact"+id).remove();
		_.pull(customerContactAdd.idSet,id);
		if(customerContactAdd.idSet.length ==1)
		{
			$("#addcontactpersonmore").removeAttr("style");
		}
		console.log(customerContactAdd.idSet);
	},
	initHtml : function(){
		var self = this;

		var initHtml = '<div id="addcontactperson">';
		initHtml += '<form name="formdetail" id="formdetail" method="post" action="#" style="position:relative">';
		initHtml += '<div class="ui-form form-group" id="qfcontact1">';
		initHtml += '<div class="ui-form-item ui-form-item-l  ui-border-b">';
		initHtml += '<label>联系人</label>';
		initHtml += '<input type="text" name="name_1" id="name_1" placeholder="请输入"></div>';
		initHtml += '<div class="ui-form-item ui-form-item-l  ui-border-b">';
		initHtml += '<label>移动电话</label>';
		initHtml += '<input type="tel" name="phone_1" id="phone_1" placeholder="请输入"></div>';
		initHtml += '<div class="ui-form-item ui-form-item-l  ui-border-b">';
		initHtml += '<label>职位</label>';
		initHtml += '<div class="ui-select"><select name="position_1" id="position_1">';
		initHtml += '<option value="">请选择</option><option value="总经理">总经理</option><option value="副总经理">副总经理</option><option value="法人代表">法人代表</option><option value="前台">前台</option><option value="销售总监">销售总监</option><option value="人事">人事</option><option value="市场">市场</option><option value="财务">财务</option><option value="其他">其他</option>'
		initHtml += '</select><i class="ui-icon-list_arrow_right"></i></div></div>'
		initHtml += '<div class="ui-form-item ui-form-item-l  ui-border-b">'
		initHtml += '<label>邮箱</label>'
		initHtml += '<input type="text" name="mail_1" id="mail_1" placeholder="请输入"></div></div>'
		initHtml += '<div style="display:block;" id="addcontactpersonmore">'
		initHtml += '<ul class="ui-list ui-list-text ui-list-cover ui-row-flex form-group" style="padding-right:15px">'
		initHtml += '<li class="ui-col ui-col ui-flex ui-flex-pack-end">'
		initHtml += '<i id="_add_relation_" class="ui-icon-add_relation" style="font-size: 14px;color: #ec564d"></i><div class="add-content">添加联系人</div></li></ul></div>'
		initHtml += '</form></div>';

		// initHtml += '<input type="hidden" id="contact_count" value="1">';
		// initHtml += '<div style="display:block;" id="addcontactpersonmore">';
		// initHtml += '<ul class="ui-list ui-list-text ui-list-cover ui-border-b form-group">';
		// initHtml +=	'<li>';
		// initHtml += '<i id="_add_relation_" class="ui-icon-add_relation" style="font-size: 14px;color: #ec564d"></i>';
		// initHtml += '<div class="add-content">添加联系人</div></li></ul></div>';

		$(document.body).append(initHtml);
		$('#addcontactperson').addClass('focus');
		$('#addcontactperson').focus();

	},

	submitData : function(source,id){
		var num_regex = new RegExp(/^(?=.*\d)[\d]+$/);
	 	var contact_count = $('#contact_count').val();

	 	var contactors = new Array();
	 	var flag = true;
	 	_(customerContactAdd.idSet).forEach(function(value){
	 		var temp_name = $.trim($("#name_"+value).val());
	        var temp_phone = $.trim($("#phone_"+value).val());
	        var temp_mail = $.trim($("#mail_"+value).val());
	        var temp_position = $.trim($("#position_"+value).val());
	        if(temp_name == ""){
	        	flag = false;
				dd.device.notification.toast({
					icon: 'error',
					text: '请填写联系人',
					duration: 1,
					onSuccess : function(result) {},
					onFail : function(err) {}
				});
				return false;
		    }
		    if(temp_phone == ""){
		    	flag = false;
				dd.device.notification.toast({
					icon: 'error',
					text: '请填写移动电话',
					duration: 1,
					onSuccess : function(result) {},
					onFail : function(err) {}
				});
				return false;
		    }
			if(temp_phone.length > 0)
	        {
	        	if(!num_regex.test(temp_phone)){
	        		flag = false;
	        		dd.device.notification.toast({
						icon: 'error',
						text: '移动电话必须为数字！',
						duration: 1,
						onSuccess : function(result) {},
						onFail : function(err) {}
					})
					return false;
	        	}
	        }

		    if(temp_position == ""){
		    	flag = false;
				dd.device.notification.toast({
					icon: 'error',
					text: '请选择职位',
					duration: 1,
					onSuccess : function(result) {},
					onFail : function(err) {}
				});
				return false;
		    }
		  	var contact_item = {};
		  	contact_item = {"linkman":temp_name,"telephone":temp_phone,"position":temp_position,"email":temp_mail};
		  	contactors.push(contact_item);

	 	})
	 	if(!flag)
	 	{
	 		return;
	 	}
	 	// console.log("submit");
	 	// return;
	 	var post_data = {
	 		"omsuid":JSON.parse(getCookie("omsUser")).id,
	 		"token":JSON.parse(getCookie("omsUser")).token,
	 		"cusid": id,
	 		"contactors":contactors
	 	};

	 	var addCustomerApi = oms_config.apiUrl+oms_apiList.addContactors;
	 	if(!customerContactAdd.isAddCustomer) {
	 		customerContactAdd.isAddCustomer =  true;
	 		dd.device.notification.showPreloader({text: '使劲提交中...'});
		 	$.ajax({
				type:'POST',
				url: addCustomerApi,
				data:post_data,
				cache:false,
				success:function(data){
					customerContactAdd.isAddCustomer = false;
					var response  = JSON.parse(data);
					if(response.res == 1)
					{
						dd.device.notification.toast({
						    icon: '',
						    text: '已提交',
						    duration: 1,
						    onSuccess : function(result) {
						        customerContactAdd.submitSkip(source,id);
						    },
						    onFail : function(err) {}
						});
						// customerContactAdd.submitSkip(source,id);
						// console.log("11111");

					}

					if(response.res == 0)
					{
						dd.device.notification.toast({
							icon: 'error',
							text: response.msg,
							duration: 1,
							onSuccess : function(result) {},
							onFail : function(err) {}
						});
					}

				},
				error:function(xhr,type){
					console('ajax error!');
					customerContactAdd.isAddCustomer = false;
				}
			}).always(function(){
				dd.device.notification.hidePreloader();
			});
		}else{
			dd.device.notification.toast({text: '使劲提交中...'});
		}


	},
	initApi : function(source,block,id){

		dd.ready(function(){
			dd.biz.navigation.setTitle({
				title: "新增联系人",
				onSuccess : function(result) {},
				onFail : function(err) {}
			});
			dd.biz.navigation.setRight({
				show: true,
				control: true,
				showIcon: true,
				text: '确定',
				onSuccess : function(result) {
					customerContactAdd.submitData(source,id);
					// customerContactAdd.submitSkip(source,id);
				},
				onFail : function(err) {}
			});

			if(dd.ios){
                dd.biz.navigation.setLeft({
                    show: true,
                    control: true,
                    showIcon: true,
                    text: '',
                    onSuccess : function(result) {

                        if(source == "cusInfo")
						{
							customerContactAdd.close(block);
							cusInfo.initApi();
						}

						if(source == "contactList")
						{
							customerContactAdd.close(block);
							cusWidget.initApi('phoneRecord','addable',id);
							// $("#widgetContactList").remove();
							// customerContactAdd.close(block);
							// cusWidget.init('phoneRecord','addable',id,function(obj){
							// 	console.log(obj);
							// 	phoneRecord.initApi();
							// 	$("#link").val(obj.name);
							// 	$(".ui-form").show();
							// 	phoneRecord.linkman = obj.name+"|"+obj.telephone+"|"+obj.position;
							// });
						}
                    },
                    onFail : function(err) {}
                });
            }else{
                $(document).off('backbutton');
                $(document).on('backbutton', function(e) {

                	if(source == "cusInfo")
					{
						customerContactAdd.close(block);
						cusInfo.initApi();
					}

					if(source == "contactList")
					{
						customerContactAdd.close(block);
						cusWidget.initApi('phoneRecord','addable',id);
						// $("#main-body").show();
						// cusWidget.init('phoneRecord','addable',id,function(obj){
						// 	phoneRecord.initApi();
						// 	$("#link").val(obj.name);
						// 	$(".ui-form").show();
						// 	phoneRecord.linkman = obj.name+"|"+obj.telephone+"|"+obj.position;
						// });

						// $("#widgetContactList").remove();
						// customerContactAdd.close(block);
						// cusWidget.init('phoneRecord','addable',id,function(obj){
						// 	phoneRecord.initApi();
						// 	$("#link").val(obj.name);
						// 	$(".ui-form").show();
						// 	phoneRecord.linkman = obj.name+"|"+obj.telephone+"|"+obj.position;
						// });
					}

	                // $(document).off('backbutton');
                    // customer.initApi();
                    e.preventDefault();
                });
            }


		});
	},

	init : function(source,code,callback) {
		var block = null;
		if(source == "cusInfo")
		{
			block = "#main-body";

		}
		if(source == "contactList")
		{
			block = "#widgetContactList";
			// $("#cusWidget_div_text").hide();
		}

		$(block).hide();
		customerContactAdd.initApi(source,block,code);
		customerContactAdd.initHtml();
		$("#addcontactpersonmore").click(function(){
			customerContactAdd.AddContactForm();
		});

		// $(window).off('scroll').on("scroll",function(){
		// 	if($(window).scrollTop()+$(window).height()>=$(document).height()){
		// 		customerContactAdd.ajaxLoadPage();
		// 	}
		// });
    },

    submitSkip : function(source,id){
    	customerContactAdd.close();
    	if(source == "cusInfo")
		{
			// openLink('customerInfo.html?code='+id+'&from='+'private');
				window.location.reload();
		}

		if(source == "contactList")
		{
			$("#widgetContactList").remove();
			$("#main-body").show();
			cusWidget.init('phoneRecord','addable',id,function(obj){
				phoneRecord.initApi();
				if(phoneRecord.role == '1' || phoneRecord.role == '3')
				{
					$("#link").val(obj.name);
				}
				if(phoneRecord.role == '2' || phoneRecord.role == '4')
				{
					$("#link_resign").val(obj.name);
				}
				$(".ui-form").show();
				phoneRecord.linkman = obj.name+"|"+obj.telephone+"|"+obj.position;
			});
		}
    }


};

$.fn.customerContactAdd = function(settings){ $.extend(customerContactAdd, settings || {});};
