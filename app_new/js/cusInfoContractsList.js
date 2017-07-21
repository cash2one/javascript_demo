var __$$cusInfoContactWidgetVersion = 1;


var cusInfoContactWidget = {
    obj_data : getUrlParam('data'),
    phoneCall : function(uname,tel,evt){
		if(dd.ios){
			window.location.href = "tel:" + tel;
		}else{
			dd.device.notification.confirm({
				message: uname,
				title: "立即呼叫",
				buttonLabels: ['取消', '确定'],
				onSuccess : function(result) {
					if(result.buttonIndex == 1){
						window.location.href = "tel:" + tel;
					}
				},
				onFail : function(err) {}
			});
			stopEventBubble(evt);
		}
	},

	renderContactsList : function(data){
		// $("#loading").hide();
		// $(".noMore").remove();
		// console.log(data.length);
		$("#cusInfoContactWidget_result").show();
		// console.log();
		if(data.length > 0){
			var list = "";
			for(var i in data){
				list += cusInfoContactWidget.renderLi(data[i]);
			}
			// if(areaWidget.filterObj.pageNo == 1){
			// 	$("#areaWidget_result").html(list);
			// }else{
			// 	$("#areaWidget_result").append(list);
			// }
			$("#cusInfoContactWidget_result").append(list);
			cusInfoContactWidget.cusInfoContactWidgetSearchListener();
		}else{
			$("#cusInfoContactWidget_result").html('<div class="nosearchRes">没有找到联系人信息！</div>');
		}

	},

	renderLi : function(obj){

		var list = '<li class="ui-border-b">'
				 + '<div class="ui-list-info ui-border-t">'
				 + '<h4 class="ui-nowrap" style="color:#222;">'+obj.linkman+' | '+obj.position+'</h4>'
				 + '<span style="color:#858e99;font-size:14px;">'+obj.telephone+'</span></div>'
				 + '<div style="width:54px; height:44px; position:absolute;right:0px;" onclick="cusInfoContactWidget.phoneCall('+obj.telephone+','+obj.telephone+',event)"><img style="height:22px;right:20px;position:absolute;top:50%;" src="img/work_details_call_normal.png"></div>'
				 + '</li>';
		return list;
	},

	cusInfoContactWidgetListener : function(){
		var self = this;
		$('#cusInfoContactWidget_text').on('keyup input propertychange onpaste',function() {
			// areaWidget.searchCus();
			var searchText = $.trim($('#cusInfoContactWidget_text').val());
			console.log(searchText);
			// if(searchText != '')
			cusInfoContactWidget.searchCusData(searchText);
		});
		$('.ui-searchbar').on('tap',function(event){
			$('.ui-searchbar-wrap').addClass('focus');
			$('.ui-searchbar-input input').focus();
			stopEventBubble(event);
		});
		$('#cusInfoContactWidget_cancel_btn').click(function(){
			$('.ui-searchbar-wrap').removeClass('focus');
			self.searchCusData('');
            event.stopPropagation();
			// areaWidget.close();
		});

		$("#newSearch").tap(function(event){	 
			var searchText = $('#cusInfoContactWidget_text').val();
			cusInfoContactWidget.searchCusData(searchText);
			$(this).hide();	
			$("#cusInfoContactWidget_result").show();
			stopEventBubble(event);
			return;
		});
	
		$('#SearchWidget_div_text form').on('submit',function() {
			$("#newSearch").trigger('tap');	
			$('#cusInfoContactWidget_text').blur();
			return false;
		});	
	},
	
	searchCus : function(){
		// $("#newSearch").show();
		$("#cusInfoContactWidget_result").hide();
		var searchText = $('#cusInfoContactWidget_text').val();
		$("#newSearchContent").html(searchText);
		if(searchText == ''){
			$("#newSearch").hide();	
			$("#cusInfoContactWidget_result").show();
			var searchText = $('#cusInfoContactWidget_text').val();
			cusInfoContactWidget.searchCusData(searchText);			
		}
	},

	// close : function(){
	// 	$("#reallocateWidget_div_text").remove();
	// 	$("#reallocateWidget_result").remove();
	// 	$("#newSearch").remove();
	// 	$("#main-body").show();
	// },

	cusInfoContactWidgetSearchListener : function(){
		$("#cusInfoContactWidget_result li").click(function(event){
			// var id = $(this).data('id');
			// reallocateWidget.selectedSubordinate = id;
			// $(this).siblings('.ui-border-t').find('.ui-icon-ok').remove();
			// $(this).find('.ui-poi-dist').html('<i class="ui-icon-ok"></i>');

			stopEventBubble(event);
		});
	},


	searchCusData : function(name){
		var htmlTpl = "",
			self = this;
		var data = JSON.parse(cusInfoContactWidget.obj_data);
		console.log(data);

		for(var i in data){
			// console.log(data[i]);
			if(name=='' || JSON.stringify(data[i]).indexOf(name) > -1)
				htmlTpl +=self.renderLi(data[i]);
		}
		console.log(htmlTpl);
		$("#cusInfoContactWidget_result").html(htmlTpl);
		cusInfoContactWidget.cusInfoContactWidgetSearchListener();
	
	},

	initApi : function(data){
		dd.ready(function(){
			dd.biz.navigation.setTitle({
				title: '客户联系人',
				onSuccess : function(result) {},
				onFail : function(err) {}
			});
			
			dd.biz.navigation.setRight({
				show: false,
				control: false,
				text: '',
				onSuccess : function(result) {
					// console.log(reallocateWidget.selectedSubordinate);
				},
				onFail : function(err) {}
			});
			// cusInfoContactWidget.allContacts = data;
			cusInfoContactWidget.renderContactsList(data);
			// areaWidget.initLeft();		
		});
	},

    init : function() {
    	var data = JSON.parse(cusInfoContactWidget.obj_data);
    	// console.log(typeof(data));
    	cusInfoContactWidget.initApi(data);
    	cusInfoContactWidget.cusInfoContactWidgetListener();	
		// $("#main-body").hide();		
		// reallocateWidget.initApi();
		// reallocateWidget.initHtml();
		// reallocateWidget.getSubordinate();
		// if(renew != 0)
		// {
		// 	reallocateWidget.selectedSubordinate = renew;
		// 	$('[data-id = "'+renew+'"]').find('.ui-poi-dist').html('<i class="ui-icon-ok"></i>');
		// }	
		// reallocateWidget.reallocateWidgetListener();		
		

    }
};

$.fn.cusInfoContactWidget = function(settings){ $.extend(cusInfoContactWidget, settings || {});};
$.fn.ready(function(){  cusInfoContactWidget.init(); });