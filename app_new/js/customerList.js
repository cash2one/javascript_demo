var __$$customerListVersion = 1;


var customer = {
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
	inFilered : 0,

	renderCusList : function(data){
		$("#loading").hide();
		$(".noMore").remove();
		if(data.length < customer.filterObj.pageSize){
			$(".pullUp").hide();
		}else{
			$(".pullUp").show();
		}
		if(FT.ftCookieVal=="visitcustomer"){
			GuideTips.clearCookie("Hecom_Submit_Visit_Finish");
			GuideTips.setPosDiv({'id':0,'isdel':1,'itemnum':21,'hint':'定期拜访可以促进客户关系，带来更多订单，点击开始执行拜访吧'});
		}		
		if(customer.filterObj.customerName > ''){
			if(data.length > 0){
				var list = "";
				for(var i in data){
					list += customer.renderLi(data[i]);
				}
				$("#SearchWidget_result").html(list);
				customer.customerSearchListener();
			}else{
				$("#SearchWidget_result").html('<div class="nosearchRes">没有找到相关客户</div>');
			}
		}else{
			if(data.length > 0){
				var list = "";
				for(var i in data){
					list += customer.renderLi(data[i]);
				}
				if(customer.filterObj.pageNo == 1){
					$("#cuslist").html(list);
				}else{
					$("#cuslist").append(list);
				}
				if(data.length < customer.filterObj.pageSize && customer.filterObj.pageNo > 1){
					$("#cuslist").append('<li class="noMore" style="text-align:center;"><div style="width:100%;"><p>无更多客户信息</p></div></li>');
				}			
				customer.customerTapListener();
			}else{
				$(window).off('scroll');
				if(customer.filterObj.pageNo == 1){
					if(customer.filterObj.customerLevel == '' && customer.filterObj.employeeCodes == ''){
						$('#cuslist').html('');
						$("#listNav").hide();
						$("#v-container-empty").show();
						$(".pullUp").hide();
					}else{
						$('#cuslist').html('<li class="noMore" style="text-align:center;"><div style="width:100%;"><p>没有找到相关客户</p></div></li>');
						$("#v-container-empty").hide();
						$("#listNav").show();
						$(".pullUp").hide();
					}
				}else{
					$(".pullUp").hide();
					$("#cuslist").append('<li class="noMore" style="text-align:center;"><div style="width:100%;"><p>无更多客户信息</p></div></li>');
				}
			}
		}
	},

	renderLi : function(obj){
		var list = '<li class="ui-border-b" data-code="'+obj.code+'">'
				+ '<div class="ui-list-info">'
				+ '<h1 style="color:#222222; font-size:16px;">'+obj.name+'</h1>'
				+ '<p style="margin-top:4px;">'
				+ '<span style="font-size:14px;color:#858e99;">';
				if(customer.filterObj.orderType == 'visit_time'){
					var visitarr = obj.visit_time_name.split(',');
					list += obj.visit_time_name == '0' ? '无拜访记录' :formatTimeRule(visitarr[0]) + visitarr[1] + '拜访了客户';
				}else if(customer.filterObj.orderType == 'createon'){
					list += formatTimeRule(obj.createon) + '创建';
				}else{
					if(obj.coordinate == '' || obj.coordinate == null || obj.coordinate == 'undefined'){
						list += '未标注位置';
					}else if(obj.visit_distance_position < 1000){
						list += obj.visit_distance_position + 'm';
					}else{
						list += Math.round(obj.visit_distance_position/1000*10)/10+'km';
					}
				}
				list += '</span></p></div>';
				if(obj.is_top){
					list += '<div class="marktop"></div>';
				}
				list += '</li>';
		return list;
	},

	customerTapListener : function(){
		$("#cuslist li").click(function(){
			if(!$(this).hasClass('noMore')){							
				openLink(siteUrl+"customerInfo.html?code=" + $(this).data('code') + '&_t=' + new Date().getTime());
			}
		});
	},

	customerSearchListener : function(){
		$("#SearchWidget_result li").click(function(){
			openLink(siteUrl+"customerInfo.html?code=" + $(this).data('code') + '&_t=' + new Date().getTime());
		});
	},

	locateAndGetList : function(){
		dd.device.geolocation.get({
			targetAccuracy : 500,
			onSuccess : function(res) {
				console.log(res)
				if(dd.ios){
					customer.filterObj.poiDatas = res.longitude + ',' + res.latitude;
					customer.getCusData();
				}else{
					var lnglat = Utils.coordTransform.gcj02towgs84(res.longitude,res.latitude);
					customer.filterObj.poiDatas = lnglat[0] + ',' + lnglat[1];
					customer.getCusData();
				}
			},
			onFail : function(err) {}
		});
	},

	ajaxLoadPage : function(){
		if(customer.lastSize == 20){
			customer.filterObj.pageNo += 1;
			customer.getCusData();
		}
	},

	filterCusData : function(levels, users){
		if(customer.inFilered == 1){
			customer.filterObj.pageNo = 1;
		}
		customer.filterObj.customerLevel = levels;
		customer.filterObj.employeeCodes = users;
		customer.inFilered = 0;
		customer.getCusData();
	},

	searchCusData : function(cusname){
		customer.filterObj.customerName = cusname;
		customer.filterObj.customerLevel = '';
		customer.filterObj.employeeCodes = '';	
		customer.getCusData();
	},

	refreshCusData : function(){
		customer.filterObj.pageNo = 1;
		customer.getCusData();
		$("#listNav").show();
		dd.ui.pullToRefresh.stop();
	},

	getCusData : function(){
        var storeObj = new Store(Store.authUrl(apiUrl),deviceId);
		console.log(customer.filterObj)
		storeObj.getCusList(customer.filterObj,function(response){
			var res = JSON.parse(response);
			customer.lastSize = res.data.length;
			console.log(res.data.length);
			customer.renderCusList(res.data);
		});
	},

	initLeft : function(){

		dd.ready(function(){
			if(dd.ios){
				dd.biz.navigation.setLeft({
					show: true,
					control: true,
					showIcon: true,
					text: '',
					onSuccess : function(result) {
						dd.biz.navigation.close({
							onSuccess : function(result) { },
							onFail : function(err) {}
						});
					},
					onFail : function(err) {}
				});
			}else{
				$(document).off('backbutton');					
				$(document).on('backbutton', function(e) {
					dd.biz.navigation.close({
						onSuccess : function(result) { },
						onFail : function(err) {}
					});												 
					e.preventDefault();
				});	
			}			
		});
	},
	
	initApi : function(){

		dd.ready(function(){
			dd.biz.navigation.setTitle({
				title: '客户',
				onSuccess : function(result) {},
				onFail : function(err) {}
			});

			dd.biz.navigation.setRight({
				show: true,
				control: true,
				showIcon: true,
				text: '新增',
				onSuccess : function(result) {
					openLink('customerAdd.html');
				},
				onFail : function(err) {}
			});		
		});
	},

	initPullApi : function(){
//		dd.ready(function(){
//			dd.ui.pullToRefresh.enable({
//				onSuccess: function() {
//					$("#listNav").hide();
//					customer.refreshCusData();
//				},
//				onFail: function() {
//				}
//			});
//		});
	},


    init : function() {
		var corpId = getUrlParam('corpId');
//		alert(window.history.length);
//		if(window.history.length == 2){
//			//customer.initLeft();
//		}
//		renderFoot(1);
        addFootEventListener();
		new Login(corpId,baseUrl,apiUrl,function(){
			if(deviceId == ''){
			var uDB = new Database('user');
				uDB.get('deviceId',function(record){
					deviceId = record['deviceId'];
					customer.filterObj.deviceId = deviceId;								 
					customer.initApi();
					customer.initPullApi();
					customer.getCusData();
				});
			}else{
				customer.filterObj.deviceId = deviceId;								 
				customer.initApi();
				customer.initPullApi();
				customer.getCusData();
			}
		});

		$("#seac-tap").click(function(){
			$(".activeTab").toggleClass('activeTab');
			$(".select-date").hide();
			$("#listNav").hide();
			searchWidget = new SearchWidget('search-tab',function(cusname){
				customer.searchCusData(cusname);
			});
			searchWidget.open();
		});

		$("#sort-tap").click(function(){
			$(".activeTab").toggleClass('activeTab');
			$(this).addClass('activeTab');
			
			if(document.getElementById('select-sort').style.display == 'none'){
				$('.select-date').hide();
				$('#select-sort').show();
				if(customer.filterObj.customerLevel == '' && customer.filterObj.employeeCodes == ''){
					$("#top").css("padding-top","45px");
					$("#FilterUl").hide();					
				}else{
					$("#top").css("padding-top","111px");	
				}					

				$("#top").show();				
			}else{
				$('.select-date').hide();
			}
		});

		$("#select-sort li").click(function(event){
			customer.filterObj.orderType = $(this).data('code');
			var name = $(this).find("span").html();
			$("#sort-tap span").html(name);
			$('.select-date').hide();
			customer.filterObj.pageNo = 1;
			if(customer.filterObj.orderType == 'visit_distance'){
				customer.locateAndGetList();
			}else{
				customer.getCusData();
			}
			stopEventBubble(event);
		});

		$("#filt-tap").click(function(){
			$(".activeTab").toggleClass('activeTab');
			$(this).addClass('activeTab');

			if(document.getElementById('select-filt').style.display == 'none'){
				$('.select-date').hide();
				$('#select-filt').show();
				filter.init(function(users,level){
					customer.inFilered = 1;
					customer.filterCusData(level,users);
					customer.initPullApi();
				});			
			}else{
				if(customer.filterObj.customerLevel == '' && customer.filterObj.employeeCodes == ''){
					$("#top").css("padding-top","45px");
					$("#FilterUl").hide();					
				}else{
					$("#top").css("padding-top","111px");	
				}				
				$('.select-date').hide();
				$("#top").show();				
			}
		});
		
		$("#select-filt").click(function(event){
			$(this).hide();	
			if(customer.filterObj.customerLevel == '' && customer.filterObj.employeeCodes == ''){
				$("#top").css("padding-top","45px");
				$("#FilterUl").hide();					
			}else{
				$("#top").css("padding-top","111px");	
			}
			$("#top").show();
			stopEventBubble(event);
		});

		
		$("#select-sort").click(function(){
			$(this).hide();		
		});
		
		
//		$(window).off('scroll').on("scroll",function(){
//			if($(window).scrollTop()+$(window).height()>=$(document).height()){
//				customer.ajaxLoadPage();
//			}
//		});

		window.onscroll = function () {
			if (document.documentElement.scrollTop + document.body.scrollTop > 0) {
				$(".backtotop").show();
			}else {
				$(".backtotop").hide();
			}
		}
    }
};

$.fn.customer = function(settings){ $.extend(customer, settings || {});};