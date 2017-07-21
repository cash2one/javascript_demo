var accompany = {
	user: {},
	dateyc: '',
	icon: ['toolbar_arrangelist','tab_visit','list_phone','toolbar_train','list_assign'],
	user: JSON.parse(getCookie('omsUser')),
	postData: {},
	sort: '',
	// next: getUrlParam('next'),
	//按月获取待办事项
	getMonthAct : function(){
		this.initData();
		// this.getData();
		// var a = accompany.action || 0;
		// var l = getUrlParam("action")=="undefined" ? "" : getUrlParam("action");
		// var o = getUrlParam("orgid")=="undefined" ? "" : getUrlParam("orgid");
		// if( l ){
		// 		accompany.getColumnData(0, l, o);
		// }else{
		// 		accompany.getColumnData(a);
		// }
	},

	//获取日期
	getDayFormat : function(){
		var role = this.user.role;
		if (isNaN(hcalendar.useDate)){
				hcalendar.useDate = new Date().getDate();
		}else{
				hcalendar.useDate = hcalendar.useDate;
		}
		//如果获取的月份和日期是一位数,就加一个0
		if(String(hcalendar.useMons).length == 1) {
			var daymons = "0" + hcalendar.useMons;
		}else {
			var daymons = hcalendar.useMons;
		}
		if(String(hcalendar.useDate).length == 1) {
			var daydate = "0" + hcalendar.useDate;
		}else {
			var daydate = hcalendar.useDate;
		}
		var data1 = hcalendar.useYear+"-"+daymons+"-"+daydate;
		var datasli = data1.replace(/-/gm,'');   //去掉日期中间的-符号
		return datasli;
	},

	MonthChangeEvent : function(){
		var title = hcalendar.useYear+'年'+(hcalendar.useMons)+'月';
		accompany.changeDateTitile(title);
		// ddbanner.changeBannerTitle(title);
		accompany.getMonthAct();
	},

	changeDateTitile: function(title){
		$("#hccalendarwrap_header").html(title);
	},

	setNav: function(level){
		var html = "";
		if(level === 3){
				html += '<li data-id="2" class="ui-col ui-col-50"><p><i class="ui-icon ui-icon-toolbar_city"></i></p><span>城市</span></li>';
				html += '<li data-id="3" class="ui-col ui-col-50"><p><i class="ui-icon ui-icon-toolbar_warzone"></i></p><span>战区</span></li>';
				$(".team-sub-nav").show();
				$("#toolBar").append(html);
		}
		if(level < 3){
			  html += '<li data-id="1" class="ui-col ui-col-33"><p><i class="ui-icon ui-icon-toolbar_area"></i></p><span>大区</span></li>';
				html += '<li data-id="2" class="ui-col ui-col-33"><p><i class="ui-icon ui-icon-toolbar_city"></i></p><span>城市</span></li>';
				html += '<li data-id="3" class="ui-col ui-col-33"><p><i class="ui-icon ui-icon-toolbar_warzone"></i></p><span>战区</span></li>';
				$(".team-sub-nav").show();
				$("#toolBar").append(html);
		}
		if(!dd.ios){
				$(".team-sub-nav").css("border-top","1px solid #d9dce9");
		}else{
				$(".pop-container li").addClass("iosBorder");
		}
	},

	toolbarSwitch: function(){
			var index = $(this).index();
			var level, orgid, issub, action;
			var a = $(this).find("span").text();

			if(index<$("#toolBar>li").length){
					$("#toolBar>li").removeClass("active");
					$(this).addClass("active");
					switch(a){
							case "大区":
									action = 1;
									break;
							case "城市":
									action = 2;
									break;
							case "战区":
									action = 3;
									break;
					}
					// accompany.next = 0;
					window.location.href = accompany.setUrl(action, parseInt(action)+1);
					// OMS.getColumnData(action);
			}
	},

	initEvent: function(){
		var self = this;
		$(".scroller").on("touchend", function(){
			if(self.myScroll){
				var scrollTop = 0;
				var getScrollY = setInterval(function(){
					if(!self.myScroll || scrollTop == self.myScroll.y) {
						clearInterval(getScrollY);
					}
					else {
						scrollTop = self.myScroll.y+47;
					}
				}, 1);
			}
		});
	},

	setUrl:function(action,level,orgid){
			var urlOld = window.location.href.split("?")[0];
			var urlNew = urlOld+"?action="+action+"&level="+level+"&orgid="+orgid;


			return urlNew;
	},

	getlevel:function(){
			if(this.user.role == 5){
				if(this.user.isCityLeader == 1){
						accompany.action = 3;
				}else{
						accompany.action = 2;
				}
			}
			if(this.user.role == 4 || this.user.role == 1){
					accompany.action = 4;
			}
			var action = parseInt(getUrlParam("action"));
			accompany.level = accompany.action;
			accompany.setNav(accompany.action);
			$("#toolBar li").bind("click", accompany.toolbarSwitch);
			if(accompany.action == 3){
					$("#toolBar>li").removeClass("active");
					$("#toolBar>li").eq(action==0?0:(action-2)).addClass("active");
			}else if(accompany.action < 3){
					$("#toolBar>li").removeClass("active");
					$("#toolBar>li").eq(action==0?0:(action-1)).addClass("active");
			}
			accompany.getInitData();
	},

	getInitData:function(){
			var a = accompany.action || 0;
			var l = parseInt(getUrlParam('level')) || accompany.action;
			var o = getUrlParam("orgid")=="undefined" ? "" : getUrlParam("orgid");
			// var s = getUrlParam("issub")=="undefined" ? "" : getUrlParam("issub");
			if( l ){
					accompany.getColumnData(a, l, o);
			}else{
					accompany.getColumnData(a);
			}
	},

	getColumnData:function (action, level, orgid){
			$('#biao_data').hide();
			$("#msg").show();
			var dtime = this.getDayFormat();
			//之前的信息置空
			accompany.postData.omsuid = accompany.user.id;
			accompany.postData.token = accompany.user.token;
			accompany.postData.date = accompany.dateyc;
			if(level){
				if(level != 0){
						accompany.postData.level = level;
				}
				else {
						accompany.postData.level = '';
				}
			}
			// accompany.postData.level=(level||level!=0)?level:"";
			// if(orgid){
			// 		accompany.postData.orgid=orgid;
			// }
			accompany.postData.orgid=orgid?orgid:"";
			accompany.postData.date = dtime;
			if(accompany.sort){
				accompany.postData.order = accompany.sort;
			}
			$.ajax({
					type:"post",
					url:oms_config.apiUrl+oms_apiList.getPeifangNumByDpt,
					async:true,
					data:accompany.postData,
					dataType:'json',
					success:function(rs){
							$('#msg').hide();
							if(rs.res==1){
									accompany.setTable(rs.data, dtime, level);
									$("#lefttable tbody a").bind('click', function(){
											accompany.checkMore(this);
									});
							}
					},
					error:function(e){
							console.log(JSON.stringify(e));
					}
			});
			// OMS.postData.issub=issub?issub:"";

	},

	checkMore:function(obj){
			//var action = ($("#toolBar>li.atcive").index()+1);
			var level = $(obj).attr("data-level");
			var orgid = $(obj).attr("data-id");
			var issub = $(obj).attr("data-issub");
			window.location.href = accompany.setUrl($("#toolBar .active").data("id"), level, orgid);
			//OMS.getColumnData(0, level, orgid, issub);
	},

	setTable: function(data, dtime, level){
				$('#biao_data').show();
				var tableColumn="";
				var lefttable="";
				var head = "";
				if(data.length > 0){
						level = data[0]['level'];
				}
				if(level == 2){
					$("#headertable_header").append('<th  style="max-width:100px;"  class="table-title">部门</th>'+
																					'<th class="table-title-icon" >大区Leader</th>'+
																					'<th class="table-title-icon sort-class" style="min-width:100px;" data-sort="none" data-id="day">今日陪访量<i class="ui-icon-paixu"></i></th>'+
																					'<th class="table-title-icon sort-class" style="min-width:100px;" data-sort="none" data-id="month">本月陪访量<i class="ui-icon-paixu"></i></th>'+
																					'<th class="table-title-icon sort-class" style="min-width:120px;" data-sort="none" data-id="cday">大区日总陪访量<i class="ui-icon-paixu"></i></th>'+
																					'<th class="table-title-icon sort-class" style="min-width:120px;" data-sort="none" data-id="cmonth">大区月总陪访量<i class="ui-icon-paixu"></i></th>'
																				);
				}
				if(level == 3){
					$("#headertable_header").append('<th  style="max-width:100px;"  class="table-title">部门</th>'+
																					'<th class="table-title-icon" >城市Leader</th>'+
																					'<th class="table-title-icon sort-class" style="min-width:100px;" data-sort="none" data-id="day">今日陪访量<i class="ui-icon-paixu"></i></th>'+
																					'<th class="table-title-icon sort-class" style="min-width:100px;" data-sort="none" data-id="month">本月陪访量<i class="ui-icon-paixu"></i></th>'+
																					'<th class="table-title-icon sort-class" style="min-width:120px;" data-sort="none" data-id="cday">城市日总陪访量<i class="ui-icon-paixu"></i></th>'+
																					'<th class="table-title-icon sort-class" style="min-width:120px;" data-sort="none" data-id="cmonth">城市月总陪访量<i class="ui-icon-paixu"></i></th>'
																				);
				}

				if(level == 4){
					$("#headertable_header").append('<th  style="max-width:100px;"  class="table-title">部门</th>'+
																					'<th class="table-title-icon" style="min-width:100px;">战区Leader</th>'+
																					'<th class="table-title-icon sort-class" style="min-width:100px;" data-sort="none" data-id="day">今日陪访量<i class="ui-icon-paixu"></i></th>'+
																					'<th class="table-title-icon sort-class" style="min-width:100px;" data-sort="none" data-id="month">本月陪访量<i class="ui-icon-paixu"></i></th>'
																				);
				}
				$(data).each(function(i){
						var trClass='odd';
						if(i%2==0){
								trClass='even';
						}
						var a = accompany.level || '';
						var name=this.orgname;
						var leadername = this.leadername;
						var day_num = this.day_num;
						var month_num = this.month_num;
						if(accompany.action == 2 || accompany.action == 3){
								var cday_num = this.cday_num;
								var cmonth_num = this.cmonth_num;
						}

						if(this.isclick==1 && this.level!=4){
								name='<a data-id="'+this.orgid+'" data-level="'+(parseInt(this.level))+'">'+name+'</a>';
						}
						// name='<a data-id="'+this.orgid+'" data-level="'+a+'">'+name+'</a>';
						if(this.isclick==1){
								if(day_num>0){
										day_num = '<a onclick="accompany.openDetail('+this.leaderid+',\''+this.leadername+'\',\'day\','+dtime+',1)">'+day_num+'</a>';
								}
								if(month_num>0){
										month_num = '<a onclick="accompany.openDetail('+this.leaderid+',\''+this.leadername+'\',\'month\','+dtime+',1)">'+month_num+'</a>';
								}
								if(level == 2 || level == 3){
										if(cday_num>0){
												cday_num = '<a onclick="accompany.openDetail('+this.orgid+',\''+this.leadername+'\',\'day\','+dtime+',2,'+parseInt(this.level)+',\''+this.orgname+'\')">'+cday_num+'</a>';
										}
										if(cmonth_num>0){
												cmonth_num = '<a onclick="accompany.openDetail('+this.orgid+',\''+this.leadername+'\',\'month\','+dtime+',2,'+parseInt(this.level)+',\''+this.orgname+'\')">'+cmonth_num+'</a>';
										}
								}

						}
						lefttable += '<tr><td style="max-width:100px;" ><span class="ui-nowrap tdspan" style="margin-right:0;">'+name+'</span></td></tr>';
						if(level == 2 || level == 3){
							tableColumn +='<tr class="'+trClass+'" >\
																							<td style="max-width:100px;min-width:100px;"><span class="ui-nowrap ui-whitespace tdspan">'+name+'</span></td>\
																							<td class="text-center">'+leadername+'</td>\
																							<td class="text-center" style="min-width:100px;">'+day_num+'</td>\
																							<td class="text-center" style="min-width:100px;">'+month_num+'</td>\
																							<td class="text-center" style="min-width:120px;">'+cday_num+'</td>\
																							<td class="text-center" style="min-width:120px;">'+cmonth_num+'</td>';
						}
						if(level == 4){
							tableColumn +='<tr class="'+trClass+'" >\
																							<td style="max-width:100px;min-width:100px;"><span class="ui-nowrap ui-whitespace tdspan">'+name+'</span></td>\
																							<td style="max-width:100px;min-width:100px;" class="text-center">'+leadername+'</td>\
																							<td class="text-center" style="min-width:100px;">'+day_num+'</td>\
																							<td class="text-center" style="min-width:100px;">'+month_num+'</td>';
						}

						tableColumn += '</tr>';

				});
				// $(data.project_list).each(function(){
				// 		head += '<th id="'+this.id+'">'+this.title+'</th>';
				// })
				$("#headertable tr").append(head);
				$("#lefttable tbody").html(lefttable);
				$("#bodytable tbody").html(tableColumn);
				this.sortEvent();
				this.scrollTable();
				// this.setChart(total_payment, total_predict);
	},

	openDetail: function(id,leadername,type,date,cate,level, orgname){
			// console.log(id);
			// openLink(oms_config.baseUrl + "customerInfo.html?code=" + code + "&from=private&jumpType=close", true);
			leadername = encodeURI(leadername);
			orgname = encodeURI(orgname);
			if(cate == 1){
					openLink(oms_config.baseUrl + 'teamAccoVisitDetail.html?uid='+id+'&type='+type+'&name='+leadername+'&date='+date,true);
			}
			if(cate == 2){
					openLink(oms_config.baseUrl + 'teamAccoVisitDetail.html?orgid='+id+'&type='+type+'&name='+leadername+'&date='+date+'&level='+level+'&orgname='+orgname,true)
			}

	},
	sortEvent:function(){
			$(".sort-class").unbind('click');
			$(".sort-class").click(function(event) {
					var a = accompany.action || 0;
					var l = parseInt(getUrlParam('level')) || accompany.action;
					var o = getUrlParam("orgid")=="undefined" ? "" : getUrlParam("orgid");
					// var s = getUrlParam("issub")=="undefined" ? "" : getUrlParam("issub");

					var sort = $(this).data('sort');
					var id = $(this).data('id');
					var sort_method;
					if(sort == 'none' || sort == 'asc'){
						sort_method = 'desc';
						$(this).attr('data-sort','desc');
						if($(this).find("i").hasClass('ui-icon-paixu')){
								$(this).find("i").removeClass('ui-icon-paixu');
								$(this).find("i").addClass('ui-icon-index_data_down');
						}
						if($(this).find("i").hasClass('ui-icon-index_data_up')){
								$(this).find("i").removeClass('ui-icon-index_data_up');
								$(this).find("i").addClass('ui-icon-index_data_down');
						}
					}
					if(sort == 'desc'){
						sort_method = 'asc';
						$(this).attr('data-sort','asc');
						if($(this).find("i").hasClass('ui-icon-index_data_down')){
								$(this).find("i").removeClass('ui-icon-index_data_down');
								$(this).find("i").addClass('ui-icon-index_data_up');
						}
					}


					$(this).siblings('.sort-class').children('i').removeClass('.ui-icon-index_data_down');
					$(this).siblings('.sort-class').children('i').removeClass('.ui-icon-index_data_up');
					$(this).siblings('.sort-class').children('i').removeClass('.ui-icon-paixu');
					$(this).siblings('.sort-class').children('i').addClass('ui-icon-paixu');
					$(this).siblings('.sort-class').attr('data-sort','none');
					accompany.sort = id+'_'+sort_method;

					if( l ){
							accompany.getColumnData(a, l, o);
					}else{
							accompany.getColumnData(a);
					}
					event.stopPropagation();
			});
	},
	scrollTable:function(){
			this.setTableBody();
			$('#lefttable').show();
			$(window).resize(this.setTableBody);
			$(".table-body").scroll(function (){
					$("#headertable").offset({ left: -1*this.scrollLeft });
					if($("#chart-container").css('display')=='none'){
									$("#lefttable").offset({ top: -1*this.scrollTop + 77 });
							}else{
									//$("#lefttable").offset({ top: -1*this.scrollTop + 289 });
						}
			});

			$(window).scroll(function (){
					if($("#chart-container").css('display')=='none'){
									$("#lefttable").offset({ top: -1*this.scrollTop + 77 });
							}else{
									//$("#lefttable").offset({ top: -1*this.scrollTop + 289 });
						}
			});
	},
	setTableBody: function(){
			var heightTable = $(window).height() - $('#selects_wrap').height() - $('#footer-bar').height();
			var heightHead = 36;
			//$("#bodytable-wrap").height( $(window).height() - 96);
	},

	initData:function(){
			this.action = getUrlParam('action');
			this.level = getUrlParam('level');
			this.getlevel();
	},
	init : function(){
		//参数初始化

		this.initParams();
		// this.initData();
		// this.renderToolBar();
		//绑定初始化事件
		this.initEvent();

		dd.ready(function () {
			dd.biz.navigation.setTitle({
					title: '陪访量',
					onSuccess: function(result) {},
					onFail: function(err) {}
			});

			if (dd.ios) {

				dd.biz.navigation.setLeft({
					show: true,
					control: true,
					showIcon: true,
					text: '',
					onSuccess: function (result) {
						history.back(-1);
					},
					onFail: function (err) {
					}
				});
			} else {
				//omsapp-android-setLeft-visible:true
				dd.biz.navigation.setLeft({
					visible: true,
					control: true,
					showIcon: true,
					text: ''
				});
				$(document).off('backbutton');
				$(document).on('backbutton', function (e) {
					history.back(-1);
					e.preventDefault();
				});
			}
		})

		Date.prototype.Format = function(fmt) { //author: meizz
			var o = {
				"M+": this.getMonth() + 1, //月份
				"d+": this.getDate(), //日
				"h+": this.getHours(), //小时
				"m+": this.getMinutes(), //分
				"s+": this.getSeconds(), //秒
				"q+": Math.floor((this.getMonth() + 3) / 3), //季度
				"S": this.getMilliseconds() //毫秒
			};
			if (/(y+)/.test(fmt))
				fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
			for (var k in o)
				if (new RegExp("(" + k + ")").test(fmt))
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			return fmt;
		}

		hcalendar.setCalendar();
		accompany.MonthChangeEvent();
	},
	initParams: function(){

		this.filterObj = {};
		this.filterObj.page_num = 1; //起始页码
		this.filterObj.page_size = 30;
		this.lastSize = 0;
		this.page_size = 30;
	}
};
$.fn.accompany = function(settings){ $.extend(accompany, settings || {});};

$.fn.ready(function() {
    var loginApi = oms_config.apiUrl+oms_apiList.login;
    new Login(oms_config.corpId,oms_config.baseUrl,loginApi,function(){
        var omsUser = getCookie('omsUser');
        if(omsUser){
            accompany.user = JSON.parse(omsUser);
						accompany.init();
        }
    });
	//默认周日历
	var uilid=$("#ulid").val();
	$(".ui-calendar-row").each(function(){
		var tid=$(this).attr("id");
		$("#listC").css("top","15%");
		if(tid&&tid!=uilid){
			$(this).hide('fast');
		}
	});

});
