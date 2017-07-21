var __$$customerSelVersion = 1;


var cusWidget = {
    filterObj : {type : 'customerH5',
				 deviceId : deviceId,
    			 pageSize : 20,
				 pageNo : 1,
    			 orderType : 'visit_time',
    			 customerLevel : '',
				 employeeCodes : '',
				 customerName : '',
				 poiDatas : ''},
	lastSize  : 20,

	renderCusList : function(data){
		$("#loading").hide();
		$(".noMore").remove();
		$("#cusWidget_result").show();

		if(data.length > 0){
			var list = "";
			for(var i in data){
				list += cusWidget.renderLi(data[i]);
			}
			if(cusWidget.filterObj.pageNo == 1){
				$("#cusWidget_result").html(list);
			}else{
				$("#cusWidget_result").append(list);
			}
			cusWidget.customerSearchListener();
		}else{
			$("#cusWidget_result").html('<div class="nosearchRes">没有找到相关客户</div>');
		}

	},

	renderLi : function(obj){
		// console.log(obj);
		var list = '<li class="ui-border-b contact-list-li" data-code="'+obj.id+'" data-name="'+obj.linkman+'" data-position="'+obj.position+'" data-telephone = "'+obj.telephone+'">'
				 + '<div class="ui-list-info">'
				 + '<div class="ui-nowrap li-basic-info">'+obj.linkman+'</div><div class="li-attach-info">'+obj.position+'</div></div>'
				 + '<div onclick="cusInfo.phoneCall(\''+obj.telephone+'\',\''+obj.telephone+'\',event)"><i class="ui-icon-list_phone" style="line-height:60px; font-size:24px;color:#ec564d;padding-right:15px"></i></div>'
				 + '</li>';
		return list;
	},

	cusWidgetListener : function(){
		var self = this;
		$('#cusWidget_text').on('input onpaste',function() {
			// cusWidget.searchCus();
			var searchText = $.trim($('#cusWidget_text').val());
			// if(searchText != '')
			cusWidget.searchCusData(searchText);
		});
		$('.ui-searchbar').on('tap',function(event){
			$('.ui-searchbar-wrap').addClass('focus');
			$('.ui-searchbar-input input').focus();
			stopEventBubble(event);
		});
		$('#cusWidget_cancel_btn').click(function(){
			// cusWidget.close();
			// $('.ui-searchbar-wrap').removeClass('focus');
			// self.searchCusData('');
   //          event.stopPropagation();
   			cusWidget.close();
   			phoneRecord.initApi();
			stopEventBubble(event);
		});

		$('#search_form').on('submit',function(event){
	        event.preventDefault() ;
	        var searchText = $.trim($('#cusWidget_text').val());
	        if(searchText == '')
	        	return;
	        else
	        {
	        	$('.ui-searchbar-wrap').removeClass('focus');
				self.searchCusData('');
	            event.stopPropagation();
				cusWidget.searchCusData(searchText);
	        }
	    });
		// $("#newSearch").tap(function(event){
		// 	var searchText = $('#cusWidget_text').val();
		// 	cusWidget.searchCusData(searchText);
		// 	$(this).hide();
		// 	stopEventBubble(event);
		// 	return;
		// });

		// $('#SearchWidget_div_text form').on('submit',function() {
		// 	$("#newSearch").trigger('tap');
		// 	$('#cusWidget_text').blur();
		// 	return false;
		// });
	},

	searchCus : function(){
		// $("#newSearch").show();
		$("#cusWidget_result").hide();
		var searchText = $('#cusWidget_text').val();
		$("#newSearchContent").html(searchText);
		if(searchText == ''){
			$("#newSearch").hide();
			$("#cusWidget_result").show();
			var searchText = $('#cusWidget_text').val();
			cusWidget.searchCusData(searchText);
		}
	},

	close : function(){

		$("#widgetContactList").remove();
		$("#main-body").show();
	},

	customerSearchListener : function(){
		$("#cusWidget_result li").click(function(event){
			var name = 	$(this).data('name');
			var code = 	$(this).data('code');
			var position = $(this).data('position');
			var telephone = $(this).data('telephone');
			cusWidget.callback({name:name,code:code,position:position,telephone:telephone});

			cusWidget.close();
			stopEventBubble(event);
		});
	},


	searchCusData : function(cusname){
		var htmlTpl = "",
			self = this;
		var data = self.allContacts;
		// console.log(data);

		for(var i in data){
			// console.log(JSON.stringify(data[i].linkman).search(new RegExp(cusname, "i")));
			// console.log(JSON.stringify(data[i].linkman).indexOf(cusname));
			// console.log(data[i]);
			// if(cusname=='' || JSON.stringify(data[i].linkman).search(new RegExp(cusname, "i")) > -1
				// || JSON.stringify(data[i].telephone).search(new RegExp(cusname, "i")) > -1)
			if(cusname=='' || JSON.stringify(data[i].linkman).toLowerCase().indexOf(cusname.toLowerCase()) > -1|| JSON.stringify(data[i].telephone).indexOf(cusname) > -1)
				htmlTpl +=self.renderLi(data[i]);
		}
		// console.log(htmlTpl);
		$("#cusWidget_result").html(htmlTpl);
		cusWidget.customerSearchListener();
	},

	getCusData : function(id){
		var getContactorsByCusidApi = oms_config.apiUrl+oms_apiList.getContactorsByCusid;
	 	$.ajax({
			type:'POST',
			url: getContactorsByCusidApi,
			data:{'omsuid':JSON.parse(getCookie('omsUser')).id,'token':JSON.parse(getCookie('omsUser')).token,'cusid':id},
			cache:false,
			success:function(data){
				var response   = JSON.parse(data);
				if(response.res == 1)
				{
					cusWidget.allContacts = response.data;
					cusWidget.renderCusList(response.data);
				}

				if(response.res == 0)
				{
					dd.device.notification.toast({
						icon: 'error',
						text: '获取客户联系人列表失败，请重试！',
						duration: 1,
						onSuccess : function(result) {},
						onFail : function(err) {}
					});
				}
			},
			error:function(xhr,type){
				console('ajax error!');
			}
		});

		// var res = JSON.parse(test_data);
		// var res = test_data;
		// cusWidget.allContacts = test_data.data;
		// cusWidget.lastSize = res.data.length;
		// cusWidget.renderCusList(res.data);

	},

	initHtml : function(){
		var self = this;

		var initHtml = "<div id='widgetContactList'><div id='cusWidget_div_text' class='ui-searchbar-wrap ui-border-b'>";
		initHtml += "   <div class='ui-searchbar'>";
		initHtml += "       <i class='ui-icon-index_search' style='font-size:11px; line-height:1;'></i>";
		initHtml += "       <div class='ui-searchbar-text'>搜索</div>";
		initHtml += "       <div class='ui-searchbar-input'>";
		initHtml += "           <form class='search_form' id='search_form'><input id='cusWidget_text' type='search' placeholder='搜索' autofocus autocapitalize='off'></form>";
		initHtml += "       </div>";
		initHtml += "   </div>";
		initHtml += "   <button id='cusWidget_cancel_btn' class='ui-searchbar-cancel'>取消</button>";
		initHtml += "</div>";
		initHtml += "<div id='newSearch' style='display:none'>";
		initHtml += "    <ul class='ui-list ui-list-link ui-border-b'>";
		initHtml += "       <li>";
		initHtml += "          <div><i class='ui-icon-search'></i></div>";
		initHtml += "          <div class='ui-list-info'>";
		initHtml += "             <h4 class='ui-nowrap'>搜索“<span id='newSearchContent' style='color:#e15151;'></span>”</h4>";
		initHtml += "          </div>";
		initHtml += "      </li>";
		initHtml += "	</ul>";
		initHtml += "</div>";
		initHtml += "<ul class='ui-list ui-list-function ui-border-b form-group'  id='cusWidget_result'>";
		initHtml += "</ul></div>";
		$(document.body).append(initHtml);
		$('#SearchWidget_text').addClass('focus');
		$('#SearchWidget_text').focus();
	},

	// initLeft : function(){

	// 	dd.ready(function(){
	// 		if(dd.ios){
	// 			dd.biz.navigation.setLeft({
	// 				show: true,
	// 				control: true,
	// 				showIcon: true,
	// 				text: '',
	// 				onSuccess : function(result) {
	// 					dd.biz.navigation.close({
	// 						onSuccess : function(result) { },
	// 						onFail : function(err) {}
	// 					});
	// 				},
	// 				onFail : function(err) {}
	// 			});
	// 		}else{
	// 			$(document).off('backbutton');
	// 			$(document).on('backbutton', function(e) {
	// 				dd.biz.navigation.close({
	// 					onSuccess : function(result) { },
	// 					onFail : function(err) {}
	// 				});
	// 				e.preventDefault();
	// 			});
	// 		}
	// 	});
	// },

	initApi : function(callFrom,type,id){
		var rightConf = null;
		if(type == 'addable')
		{
			rightConf = {show: true,
				control: true,
				showIcon: true,
				text: '新增联系人',
				onSuccess : function(result) {
					customerContactAdd.init('contactList',id,function(obj){
						cusWidget.initApi();
						$(".ui-form").show();
					});
				},
				onFail : function(err) {}
			};
		}
		else
		{
			rightConf = {
				show: false,
				control: false,
				showIcon: false,
				text: '',
				onSuccess : function(result) {
				},
				onFail : function(err) {}
			};
		}
		dd.ready(function(){
			dd.biz.navigation.setTitle({
				title: '客户联系人',
				onSuccess : function(result) {},
				onFail : function(err) {}
			});

			dd.biz.navigation.setRight(rightConf);
		});

		if(dd.ios){
            dd.biz.navigation.setLeft({
                show: true,
                control: true,
                showIcon: true,
                text: '',
                onSuccess : function(result) {
                    cusWidget.close();
                    if(callFrom == 'phoneRecord')
	                {
	                	phoneRecord.initApi();
	                }
	                else{
	                	cusWidget.callback();
	                }
                },
                onFail : function(err) {}
            });
        }else{
            $(document).off('backbutton');
            $(document).on('backbutton', function(e) {
                cusWidget.close();
                if(callFrom == 'phoneRecord')
                {
                	phoneRecord.initApi();
                }else{
                    cusWidget.callback();
                }

                e.preventDefault();
            });
        }

	},

    init : function(callFrom,source,id,callback) {

		cusWidget.callback = callback;
		$("#main-body").hide();
		cusWidget.initApi(callFrom,source,id);
		cusWidget.initHtml();
		cusWidget.getCusData(id);
		cusWidget.cusWidgetListener();

    }
};

$.fn.cusWidget = function(settings){ $.extend(cusWidget, settings || {});};
