var __$$deliverVersion = 1;

var deliver = {
	cusid: getUrlParam('cusid'),
	cusname: getUrlParam('cusname'),
	isCityLeader: JSON.parse(getCookie('omsUser')).isCityLeader,
	subId: null,
	innerPage: 1,
	//初始化banner
	initApi : function(){
		var self = this;
		dd.ready(function(){
			dd.biz.navigation.setTitle({
				title: '',
				onSuccess : function(result) {},
				onFail : function(err) {}
			});

			if(dd.ios){
        dd.biz.navigation.setLeft({
          show: true,
          control: true,
          showIcon: true,
          text: '',
          onSuccess : function(result) {
              history.back(-1);
          },
          onFail : function(err) {}
        });
      }else{
        $(document).off('backbutton');
        $(document).on('backbutton', function(e) {
            history.back(-1);
            e.preventDefault();
        });
      }
			dd.biz.navigation.setRight({
				show: true,
				control: true,
				text: '确定',
				onSuccess : function(result) {
					if(deliver.subId === null)
					{
						dd.device.notification.alert({
								message: "请先选择转交业务员！",
								title: "提示",//可传空
								buttonName: "知道了",
								onSuccess : function() {
								},
								onFail : function(err) {}
						});
					}else{
						dd.device.notification.confirm({
							message: '是否将'+deliver.cusname+'转交给'+deliver.subName,
							title: '',
							buttonLabels: ['取消', '确定'],
							onSuccess : function(result) {
								if(result.buttonIndex == 1){
									deliver.reAssign();
								}
							},
							onFail : function(err) {}
						});
					}
				},
				onFail : function(err) {}
			});
		});
	},
	//转交
	reAssign: function(){
		var self = this;
		var reAssignApi = oms_config.apiUrl+oms_apiList.reAssign;
		$.ajax({
			type:'POST',
			url: reAssignApi,
			data:{'omsuid':JSON.parse(getCookie('omsUser')).id,'token':JSON.parse(getCookie('omsUser')).token,'cusid':deliver.cusid,'uid':deliver.subId},
			cache:false,
			success:function(data){
				var response = JSON.parse(data);
				if(response.res === 1)
				{
					//设置localStorage
					localStorage.setItem('oms.deliver.id',deliver.cusid);
					
					dd.device.notification.toast({
					    icon: '',
					    text: '已提交',
					    duration: 1,
					    onSuccess : function(result) {
								dd.biz.navigation.close({
									onSuccess : function(result) {},
									onFail : function(err) {}
								});
					    },
					    onFail : function(err) {}
					});
				}
				else{
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
				console.log('ajax error!');
			}
		});
	},
	//获取下属数据
	getData: function(){
		var self = this;
		var getSubUsersApi = oms_config.apiUrl+oms_apiList.getSubUsers;
		$.ajax({
			type:'POST',
			url: getSubUsersApi,
			data:{'omsuid':JSON.parse(getCookie('omsUser')).id,'token':JSON.parse(getCookie('omsUser')).token},
			cache:false,
			success:function(data){
				var response = JSON.parse(data);
				if(response.res === 1)
				{
					deliver.initHtml(response.data);
					if(deliver.isCityLeader === 1)
					{
						deliver.subData = response.data.list;
					}
					else{
						deliver.subData = response.data;
					}
					deliver.searchEventListener();
				}
			},
			error:function(xhr,type){
				console.log('ajax error!');
			}
		});
	},
	//初始化页面
	initHtml: function(data){
		//战区经理
		if(this.isCityLeader === 1)
		{
			var basicData = data.city;
			var subData = data.list;
			//渲染所处位置
			$("#dep_pos").html('<span>'+basicData.name+'</span>');
			//渲染部门
			deliver.renderDep(subData);
		}	//城市经理
		else{
			deliver.renderList(data);
		}

	},
	//渲染战区列表
	renderDep: function(data){
		if(data.length > 0)
		{
			var list = "";
			_(data).forEach(function(value){
				list+= deliver.renderDepList(value);
			});

			$("#cuslist").append(list);
		}
		else{
			$("#cuslist").html('<div style="padding-left:15px; font-size:12px; color:#666" class="nosearchRes">无相关下属信息！</div>');
		}
		deliver.deliverEventListener();
	},

	renderDepList: function(obj){
		var list = '<li class="classify" data-id='+JSON.stringify(obj)+'>'+
							'<div class="ui-border-t">'+
							'<span class="classify-name">'+obj.name+'</span>'+
							'<i class="ui-icon-list_arrow_right"></i>'+
							'</div>'+
							'</li>';
		return list;
	},
	//渲染HTML
	renderList: function(data){
		//战区经理
		if(this.isCityLeader === 1)
		{
			var basicData = data.city;
			var subData = data.list;
			//渲染所处位置
			$("#dep_pos").html('<span>'+basicData.name+'</span>');
			//渲染部门
		}	//城市经理
		else{
			deliver.renderSubList(data);
		}

	},
	//渲染部门员工
	initSubList: function(data){
		$('#cuslist').hide();
		$('#salesList').show();
		$('#sortedList').html('');
		dd.ready(function(){
			dd.biz.navigation.setTitle({
					title: '',
					onSuccess : function(result) {},
					onFail : function(err) {}
			});
			dd.biz.navigation.setRight({
					show: true,
					control: true,
					showIcon: true,
					text: '确定',
					onSuccess : function(result) {
						if(deliver.subId === null)
						{
							dd.device.notification.alert({
									message: "请先选择转交业务员！",
									title: "提示",//可传空
									buttonName: "知道了",
									onSuccess : function() {
									},
									onFail : function(err) {}
							});
						}else{
							dd.device.notification.confirm({
								message: '是否将'+deliver.cusname+'转交给'+deliver.subName,
								title: '',
								buttonLabels: ['取消', '确定'],
								onSuccess : function(result) {
									if(result.buttonIndex == 1){
										deliver.reAssign();
									}
								},
								onFail : function(err) {}
							});
						}

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
									$("#subList").remove();
									$("#afterpend").remove();
									deliver.initApi();
									$("#cuslist").show();
									$('#sortedList').html('');
							},
							onFail : function(err) {}
					});
			}else{
					$(document).off('backbutton');
					$(document).on('backbutton', function(e) {
							$("#subList").remove();
							$("#afterpend").remove();
							deliver.initApi();
							$("#cuslist").show();
							$('#sortedList').html('');
							e.preventDefault();
					});
			}
		});

		deliver.renderSubList(data);
	},

	renderSubList: function(data){
		var subData = null;
		//城市经理
		if(deliver.isCityLeader === 1)
		{
			$("#dep_pos").append('<span id="afterpend"> > '+data.name+'</span>');
			subData = data.subs;
		}//战区经理
		else{
			$("#dep_pos").remove();
			subData = data;
		}
		var htmlTpl = '<div class="map-poi-container-wrap" id="subList">'+
									'<div class="map-poi-container"><ul class="ui-list ui-list-text ui-list-active ui-border-b form-group" id="chooseMylevel_li">';
		var list = "";
		_(subData).forEach(function(value){
			list += '<li class="ui-border-t sub-li" data-name="'+value.realname+'" data-id="'+value.id+'"><h4 class="ui-nowrap">'+value.realname+'</h4><div class="ui-poi-dist"></div></li>';
		});

		htmlTpl += list+'</ul></div></div>';
		$("#salesList").append(htmlTpl);
		deliver.subChooseEventListener();
	},
	//选择员工事件
	subChooseEventListener: function(){
		$("#subList li").click(function(event){
			var id = $(this).data('id');
			var name = $(this).data('name');
			deliver.subId = id;
			deliver.subName = name;
			$(this).siblings('.ui-border-t').find('.ui-icon-list_cerrect').remove();
			$(this).find('.ui-poi-dist').html('<i class="ui-icon-list_cerrect"  style="font-size:20px;color:#ec564d;line-height:1"></i>');
		});
	},
	//选择点击事件
	deliverEventListener: function(){
		$("#cuslist li").click(function(event){
			deliver.innerPage = 2;
			var data = $(this).data('id');
			deliver.initSubList(data);
		});
	},
	//搜索事件
	searchEventListener: function(){
		var self = this;
		$('#search_text').on('input onpaste', function(e){
			var searchText = $.trim($('#search_text').val());
			self.searchData(searchText);
		});

		$('.ui-searchbar').on('tap',function(event){
			$('.ui-searchbar-wrap').addClass('focus');
			$('.ui-searchbar-input input').focus();
			stopEventBubble(event);
		});

		$('#search_cancel_btn').click(function(){
			$('.ui-searchbar-wrap').removeClass('focus');
			if(deliver.isCityLeader === 1)
			{
				if(deliver.innerPage === 1)
				{
					$('#cuslist').show();
					$('#sortedList').html('');
				}else{
					$('#salesList').show();
					$('#sortedList').html('');
				}
			}else {
				self.searchData('');
			}
			stopEventBubble(event);
		});

		$('#search_form').on('submit',function(event){
			event.preventDefault() ;
			var searchText = $.trim($('#search_text').val());
			if(searchText == '')
				return;
			else
			{
				$('.ui-searchbar-wrap').removeClass('focus');
				// self.searchData('');
				event.stopPropagation();
				self.searchData(searchText);
	    }
	  });
	},
	//搜索员工
	searchData: function(searchText){
		var htmlTpl = '<div class="map-poi-container-wrap" id="subList">'+
									'<div class="map-poi-container"><ul class="ui-list ui-list-text ui-list-active ui-border-b form-group" id="chooseMylevel_li">';
		var data = deliver.subData;
		if(deliver.isCityLeader === 1)
		{
			if(deliver.innerPage === 1)
			{
				$('#cuslist').hide();
			}
			else{
				$('#salesList').hide();
			}
			_(data).forEach(function(value){
				var subValue = value.subs;
				_(subValue).forEach(function(svalue){

					if(searchText === '' || JSON.stringify(svalue.realname).toLowerCase().indexOf(searchText.toLowerCase())>-1)
					{
						htmlTpl += deliver.renderSortedList(svalue);
					}
				})
			});

			htmlTpl += '</ul></div></div>';
			$('#sortedList').html(htmlTpl);

		}else {
			_(data).forEach(function(value){

				if(searchText === '' || JSON.stringify(value.realname).toLowerCase().indexOf(searchText.toLowerCase())>-1)
				{
					htmlTpl += deliver.renderSortedList(value);
				}
			});
			htmlTpl += '</ul></div></div>';
			$('#salesList').html(htmlTpl);
		}
		deliver.subChooseEventListener();
			// console.log(htmlTpl);
	},

	//渲染搜索结果
	renderSortedList: function(value){
		var list = '<li class="ui-border-t sub-li" data-name="'+value.realname+'" data-id="'+value.id+'"><h4 class="ui-nowrap">'+value.realname+'</h4><div class="ui-poi-dist"></div></li>';
		return list;
	},
	init: function(){
		this.initApi();
		this.getData();
	}
};

$.fn.deliver = function(settings){ $.extend(deliver, settings || {});};
$.fn.ready(function(){  deliver.init(); });
