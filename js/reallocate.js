var __$$reallocateWidgetVersion = 1;


var reallocateWidget = {
    // filterObj : {type : 'customerH5',
				//  deviceId : deviceId,
    // 			 pageSize : 20,
				//  pageNo : 1,
    // 			 orderType : 'visit_time',
    // 			 customerLevel : '',
				//  employeeCodes : '',
				//  customerName : '',
				//  poiDatas : ''},
	// lastSize  : 20,	

	renderAreaList : function(data){
		$("#loading").hide();
		$(".noMore").remove();
		// console.log(data.length);
		$("#reallocateWidget_result").show();
		if(data.length > 0){
			var list = "";
			for(var i in data){
				list += reallocateWidget.renderLi(data[i]);
			}
			// if(areaWidget.filterObj.pageNo == 1){
			// 	$("#areaWidget_result").html(list);
			// }else{
			// 	$("#areaWidget_result").append(list);
			// }
			$("#reallocateWidget_result").append(list);
			reallocateWidget.areaSearchListener();
		}else{
			$("#reallocateWidget_result").html('<div class="nosearchRes">没有找到下属信息！</div>');
		}

		
		if(reallocateWidget.selectedSubordinate != 0)
		{
			$('[data-index = "'+reallocateWidget.selectedSubordinate+'"]').find('.ui-poi-dist').html('<i class="ui-icon-list_cerrect"></i>');
		}	
		reallocateWidget.reallocateWidgetListener();	

	},

	renderLi : function(obj){

		// var data = JSON.parse(obj);
		// console.log(typeof(obj));
		var list = '<li class="ui-border-b contact-reallocate-list-li" data-index="'+obj.id+'" data-name="'+obj.realname+'">'
				 + '<div class="ui-list-info">'
				 + '<h4 class="ui-nowrap">'+obj.realname+'</h4>'
				 +'</div><div class="ui-poi-dist"></div>'
				 + '</li>';
		return list;
	},

	reallocateWidgetListener : function(){
		var self = this;
		$('#reallocateWidget_text').on('input onpaste',function() {
			// areaWidget.searchCus();
			var searchText = $.trim($('#reallocateWidget_text').val());
			// if(searchText != '')
			reallocateWidget.searchCusData(searchText);
		});
		$('.ui-searchbar').on('tap',function(event){
			$('.ui-searchbar-wrap').addClass('focus');
			$('.ui-searchbar-input input').focus();
			stopEventBubble(event);
		});
		$('#reallocateWidget_cancel_btn').click(function(){
			$('.ui-searchbar-wrap').removeClass('focus');
			self.searchCusData('');
            event.stopPropagation();
			// areaWidget.close();
		});

		// $("#newSearch").tap(function(event){	 
		// 	var searchText = $('#reallocateWidget_text').val();
		// 	reallocateWidget.searchCusData(searchText);
		// 	$(this).hide();	
		// 	$("#reallocateWidget_result").show();
		// 	stopEventBubble(event);
		// 	return;
		// });
	
		// $('#SearchWidget_div_text form').on('submit',function() {
		// 	$("#newSearch").trigger('tap');	
		// 	$('#reallocateWidget_text').blur();
		// 	return false;
		// });	
	},
	
	searchCus : function(){
		// $("#newSearch").show();
		$("#reallocateWidget_result").hide();
		var searchText = $('#reallocateWidget_text').val();
		$("#newSearchContent").html(searchText);
		if(searchText == ''){
			$("#newSearch").hide();	
			$("#reallocateWidget_result").show();
			var searchText = $('#reallocateWidget_text').val();
			reallocateWidget.searchCusData(searchText);			
		}
	},

	close : function(){
		$("#reallocateWidget_div_text").remove();
		$("#reallocateWidget_result").remove();
		$("#newSearch").remove();
		$("#main-body").show();
	},

	areaSearchListener : function(){
		$("#reallocateWidget_result li").click(function(event){
			var id = $(this).data('index');
			reallocateWidget.selectedSubordinate = id;
			$(this).siblings('.contact-reallocate-list-li').find('.ui-icon-list_cerrect').remove();
			$(this).find('.ui-poi-dist').html('<i class="ui-icon-list_cerrect"></i>');

			stopEventBubble(event);
		});
	},


	searchCusData : function(name){
		var htmlTpl = "",
			self = this;
		var data = self.allSubordinate;
		console.log(data);

		for(var i in data){
			console.log(data[i]);
			if(name=='' || JSON.stringify(data[i]).indexOf(name) > -1)
				htmlTpl +=self.renderLi(data[i]);
		}
		console.log(htmlTpl);
		$("#reallocateWidget_result").html(htmlTpl);
		reallocateWidget.areaSearchListener();
	
	},

	getSubordinate : function(){
		var getSubordinateApi = oms_config.apiUrl+oms_apiList.getSubordinate;
		$.ajax({
			type:'POST',
			url: getSubordinateApi,
			data:{'omsuid':JSON.parse(getCookie('omsUser')).id,'token':JSON.parse(getCookie('omsUser')).token},
			cache:false,
			success:function(data){
				var response = reallocateWidget.allSubordinate = JSON.parse(data).data;
				console.log(response);
				reallocateWidget.renderAreaList(response);
			},
			error:function(xhr,type){
				console('ajax error!');
			}
		});
		// var data = [{"id":"2946","username":"fengcaimeng"},{"id":"2947","username":"testhaha"},{"id":"2967","username":"xiaozhi"},{"id":"2969","username":"lulu"}];
		// reallocateWidget.allSubordinate = data;
		// reallocateWidget.renderAreaList(data);
	},
	
	initHtml : function(){
		var self = this;

		var initHtml = "<div id='reallocateWidget_div_text' class='ui-searchbar-wrap ui-border-b'>";
			initHtml += "   <div class='ui-searchbar'>";
			initHtml += "       <i class='ui-icon-index_search' style='font-size:11px; line-height:1;'></i>";
			initHtml += "       <div class='ui-searchbar-text'>搜索</div>";
			initHtml += "       <div class='ui-searchbar-input'>";
			initHtml += "           <input id='reallocateWidget_text' type='text' placeholder='搜索' autofocus autocapitalize='off'>";
			initHtml += "       </div>";
			initHtml += "   </div>";
			initHtml += "   <button id='reallocateWidget_cancel_btn' class='ui-searchbar-cancel'>取消</button>";
			initHtml += "</div>";	
			initHtml += "<div id='newSearch' style='display:none'>";
			initHtml += "    <ul class='ui-list ui-list-link ui-border-b'>";
			initHtml += "       <li class='ui-border-b'>";
			initHtml += "          <div><i class='ui-icon-search'></i></div>";
			initHtml += "          <div class='ui-list-info'>";
			initHtml += "             <h4 class='ui-nowrap'>搜索“<span id='newSearchContent'></span>”</h4>";
			initHtml += "          </div>";
			initHtml += "      </li>";
			initHtml += "	</ul>";
			initHtml += "</div>";			
			initHtml += "<div class='map-poi-container-wrap'><div class='map-poi-container form-group'><ul class='ui-list ui-list-text ui-list-active ui-border-b' id='reallocateWidget_result'>";
			initHtml += "</ul></div></div>";
		$(document.body).append(initHtml);
		$('#SearchWidget_text').addClass('focus');
		$('#SearchWidget_text').focus();
	},

	submitData : function(){
		var renewAssignApi = oms_config.apiUrl+oms_apiList.renewAssign;
		$.ajax({
			type:'POST',
			url: renewAssignApi,
			data:{omsuid:JSON.parse(getCookie('omsUser')).id,
			token:JSON.parse(getCookie('omsUser')).token,cusid:cusInfo.code,uid:reallocateWidget.selectedSubordinate},
			cache:false,
			success:function(data){

				var response = JSON.parse(data);
				if(response.res == 1)
				{
					location.reload();
				}
				else
				{
					dd.device.notification.toast({
						icon: 'error',
						text: '分配人员失败，请重试！', 
						duration: 1, 
						onSuccess : function(result) {},
						onFail : function(err) {}
					});
				}
			}
		})
	},
	initApi : function(){
		dd.ready(function(){
			dd.biz.navigation.setTitle({
				title: '分配续签人员',
				onSuccess : function(result) {},
				onFail : function(err) {}
			});
			
			dd.biz.navigation.setRight({
				show: true,
				control: true,
				text: '确定',
				onSuccess : function(result) {

					reallocateWidget.submitData();
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
                        reallocateWidget.close();
                        cusInfo.initApi(); 
                    },
                    onFail : function(err) {}
                });
            }else{
                $(document).off('backbutton');  
                $(document).on('backbutton', function(e) {
                    reallocateWidget.close();
                    cusInfo.initApi();
                    e.preventDefault();
                });                 
            }   
            
			// areaWidget.initLeft();		
		});
	},

    init : function(renew,callback) {
		$("#main-body").hide();
		reallocateWidget.selectedSubordinate = renew;	
		reallocateWidget.initApi();
		reallocateWidget.initHtml();
		reallocateWidget.getSubordinate();

		
		// $(window).off('scroll').on("scroll",function(){
		// 	if($(window).scrollTop()+$(window).height()>=$(document).height()){
		// 		areaWidget.ajaxLoadPage();
		// 	}
		// });
    }
};

// $.fn.areaWidget = function(settings){ $.extend(areaWidget, settings || {});};
// $.fn.ready(function(){  areaWidget.init(); });
