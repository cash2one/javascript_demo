var __$$toPublicVersion = 1;

var toPublic = {
	code: getUrlParam('code'),
	jumpType: getUrlParam('jumpType') || '',

	initTitle : function(){
		// var texta = customer.code == 'new' ? '新增客户' : '编辑客户';
		// var texta = '更多';
		dd.ready(function(){
	        if(dd.ios){
				dd.biz.navigation.setLeft({
					show: true,
					control: false,
					showIcon: true,
					text: '',
					onSuccess : function(result) {
			 			history.back(-1);
					},
					onFail : function(err) {}
				});
			}
			else{
			 	$(document).off('backbutton');
			 	$(document).on('backbutton', function(e) {
		 			history.back(-1);
			 		e.preventDefault();
			 	});
			}

			dd.biz.navigation.setRight({
		        show: true,
		        control: true,
		        showIcon: true,
		        text: '扔掉',
		        onSuccess : function(result) {
		            console.log("click");
		            toPublic.postData();
		        },
		        onFail : function(err) {}
		    });
	    });
	},

	postData : function(){
		var throwCustomerApi = oms_config.apiUrl+oms_apiList.throwCustomer;
		$.ajax({
			type:'POST',
			url: throwCustomerApi,
			data:{'omsuid':JSON.parse(getCookie('omsUser')).id,'token':JSON.parse(getCookie('omsUser')).token,'cusid':toPublic.code,'throw_reason':toPublic.selectedReason},
			cache:false,
			success:function(data){
				var response = JSON.parse(data);
				// console.log(response);
				if(response.res == 1)
				{
					dd.device.notification.toast({
					    icon: 'success',
					    text: '已扔回公海！',
					    duration: 1,
					    onSuccess : function(result) {
					    	// history.go(-2);
					    	if(toPublic.jumpType == 'close')
					 			dd.biz.navigation.close({
		                            onSuccess : function(result) { },
		                            onFail : function(err) {}
		                        });
					 		else
					 			history.go(-2);
					        // replaceLink('privateSea.html');
					    },
					    onFail : function(err) {}
					});
				}
				else
				{
					dd.device.notification.toast({
						icon: 'error',
						text: '扔回公海失败，请重试！', 
						duration: 1, 
						onSuccess : function(result) {},
						onFail : function(err) {}
					});
				}
			}
		});
	},
	initApi : function(){
		dd.ready(function(){
			dd.biz.navigation.setTitle({
				title: '扔掉原因',
				onSuccess : function(result) {},
				onFail : function(err) {}
			});
			toPublic.initTitle();
		});
	},

	init : function() {
		toPublic.initApi();
		// toPublic._handlSelect();

		toPublic.selectedReason = 1;
		$("#throwReason li").click(function(){
			var id = this.id;
			toPublic.selectedReason = id;
			$(this).siblings('.ui-border-t').find('.ui-icon-list_cerrect').remove();
			$(this).find('.ui-poi-dist').html('<i class="ui-icon-list_cerrect"></i>');
		
		});
	}
};

$.fn.toPublic = function(settings){ $.extend(toPublic, settings || {});};
$.fn.ready(function(){  toPublic.init(); });