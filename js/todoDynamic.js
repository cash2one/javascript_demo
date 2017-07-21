var todo = {
	user: {},
	dateyc: '',
	icon: ['toolbar_arrangelist','tab_visit','list_phone','toolbar_train','list_assign'],
	//按月获取待办事项
	getMonthAct : function(){
		this.getData();
	},

	//按天获取待办列表
	getDayActList : function(){
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
		var dtime = hcalendar.useYear+"-"+daymons+"-"+daydate;

		var todaynow = getToday(1);
		var dataf = {day:datasli,token:this.user.token,omsuid:this.user.id,role:this.user.role};
		todo.dateyc = dtime+" 00:00:00";


		if(data1 == todaynow){  //如果是今天
			this.getData(todo.dateyc);
		}
		else if (data1 > todaynow){
			this.getData(todo.dateyc);
		}
		else {
			$.post(oms_config.apiUrl + "apiTeam/getDynamicDataByDay", dataf, function (res) {
				console.log(res);
				var sHtml = todo.renderList(res.data, data1);
				$("#todoList").html(sHtml);
				$("#todoTips").html('');
			}, 'json');
		}
	},

	//渲染列表
	renderList : function(list,datel){
		if (todo.dateyc == undefined)
			todo.dateyc  = getToday(1)+" 00:00:00";
		var sHtml = "";
		var money = "";
		var pheight = $(window).height();
		var nodate = pheight -110;
		var uptime = $("#todoList li:last-child li:first-child").html();
		if (datel == undefined)
			datel = getToday(1);
		else
			datel = new Date(datel).Format("yyyy-MM-dd");
		console.log(list);
		var todate = getToday(1);
		var dtime = getToday(1)+" 00:00:00";


			//$("#todoList").css("height",nodate);
			if (list == null){
				sHtml += '<p style="text-align: center;margin-top:30%;">暂无今日没有数据!</p>';
			}
			 else if (datel < todate) {  //如果是历史日期
				todo.myScroll = null;
				$("#ycmoney").css("display", "none");
				$(".today-data").css("display", "none");
				$(".money_data").css("display", "none");
				$(".yuce").css("display", "none");
				$("#wrapper").find("#pullDown").remove();
				$("#wrapper").find("#pullUp").remove();
				$(".scroller").css("transform","none");
				$("#todoList").removeClass("ui-border-b");
				if ($("#ui6").css("display") == "block")
					$("#listC").css("top","72%");
				else if ($("#ui3").css("display") == "block" && $("#ui2").css("display") == "block")
					$("#listC").css("top","50%");
				else
					$("#listC").css("top","15%");
				sHtml += '<div class="demo_line_05">累计回款</div>'
					+ '<p class="p_style_his">'+list.money+'<font size="2">元</font></p>'
					+ '<div class="demo_line_05">累计工作量</div>'
					+ '<p class="ui-border-b p_style_his">'+list.work_num+'<font size="2">个</font></p>'
					+ '<ul class="ui-tiled" style="line-height: 40px;">'
					+ '<li class="history_type_sty" ><div>资料录入</div></li>'
					+ '<li class="history_type_sty"><div>电话记录</div></li>'
					+ '<li class="history_type_sty"><div>拜访工作</div></li>'
					+ '</ul>'
					+ '<ul class="ui-tiled" style="line-height: 1;">'
					+ '<li><div class="p_style_his_type">'+list.cus_num+'</div></li>'
					+ '<li><div class="p_style_his_type">'+list.call_num+'</div></li>'
					+ '<li><div class="p_style_his_type">'+list.visit_num+'</div></li>'
					+ '</ul>';
			}
			else if (todo.dateyc > dtime){
				$("#ycmoney").css("display", "block");
				$(".yuce").css("display", "block");
				$(".money_data").css("display", "none");
				if ($("#ui6").css("display") == "block")
					$("#listC").css("top","72%");
				else if ($("#ui3").css("display") == "block" && $("#ui2").css("display") == "block")
					$("#listC").css("top","68%");
				else
					$("#listC").css("top","34%");
				for (var i in list.forcast_info) {
					sHtml += '<li class="ui-border-tb today-data">'
						+ '<ul class="ui-row" style="width:100%;">'
						+ '<li class="ui-col ui-col-80 " style="width:77%;"'
						+ '><p class="yuce_cus">' + list.forcast_info[i].cusname+ '</p><p' +
						' class="yuce_own" style="margin-top:10px;">'+list.forcast_info[i].owner_info+'</p></li>'
						+ '<li class="ui-col ui-col-20 "' + ' style="">'
					    + '<p class="yuce_own">'+'&yen'+list.forcast_info[i].money+'</p>'
						+'</li>'
						+ '</ul>'
						+ '</li>';
				}
			}
			else{
				$("#ycmoney").css("display", "none");
				$(".yuce").css("display", "none");
				$(".today-data").css("display", "block");
				$(".money_data").css("display", "inline-flex");

				if ($("#hccalendar ul").eq(6).css("display") == "block")
					$("#listC").css("top","72%");
				else if ($("#ui3").css("display") == "block" && $("#ui2").css("display") == "block")
					$("#listC").css("top","63%");
				else
					$("#listC").css("top","28%");
				 for (var i in list.action_list) {

					 if (list.action_list[i].time === uptime){
						 for(var j in list.action_list[i].data) {
							 if(list.action_list[i].data[j].act_name == '回款')
								 money = '  &yen'+ list.action_list[i].data[j].money+"元";
							 else
								 money = '';
							 var link = '<a href="profile.html?id=' + list.action_list[i].data[j].id + '&do=0"' +
								 ' >' + "["+list.action_list[i].data[j].realname+"]" + '</a>&nbsp;&nbsp;';
							 var link_cus = '<a class="open-link" href="customerInfo.html?code=' + list.action_list[i].data[j].cusid + '&from=private&jumpType=close"' +
								 ' >' +list.action_list[i].data[j].cusname + '</a>';
							 sHtml += '<span '+(list.action_list[i].data[j].act_name == '回款' ? '  class="today-style" ' : "class='other-style' ") +'>'+list.action_list[i].data[j].act_name+'</span>'
								 + '<span'+ (list.action_list[i].data[j].act_name == '回款' ? '  style="color:#ec564d;font-size:12px;"' : "  style='font-size:12px;color:#333333;'")+'>'+link+link_cus +money+'<br/></span>'

						 }
					 }
					 else {
						 sHtml += '<><li class="today-data" style="padding:0px;">'
							 + '<ul class="ui-row  ui-border-b" style="width:100%;">'
							 + '<li class="ui-col ui-col-20" style="padding:16px 2px;width:11%;' + ' 0;color:#666666;font-size:12px;" '
							 + '>' + list.action_list[i].time + '</li>'
							 + '<li class="ui-col ui-col-80 "' + ' style="padding:13px' +
							 ' 0;width:89%;">'
						 for (var j in list.action_list[i].data) {
							 if(list.action_list[i].data[j].act_name == '回款')
								 money = '  &yen'+ list.action_list[i].data[j].money+"元";
							 else
							 	money = '';
							 var link = '<a href="profile.html?id=' + list.action_list[i].data[j].id + '&do=0"' +
								 ' >' + "["+list.action_list[i].data[j].realname+"]" + '</a>&nbsp;&nbsp;';
							 var link_cus = '<a class="open-link" href="customerInfo.html?code=' + list.action_list[i].data[j].cusid + '&from=private&jumpType=close"' +
								 ' >' +list.action_list[i].data[j].cusname + '</a>';
							// sHtml += '<p' + (list.action_list[i].data[j].act_name == '回款' ? '  style="color:#ec564d;"' : "") + '>[' + list.action_list[i].data[j].act_name + '］' + list.action_list[i].data[j].cusname +money+'</p>'
								sHtml += '<span '+(list.action_list[i].data[j].act_name == '回款' ? '  class="today-style" ' : "class='other-style'") +'>'+list.action_list[i].data[j].act_name+'</span>'
							 		  + '<span'+ (list.action_list[i].data[j].act_name == '回款' ? '  style="color:#ec564d;font-size:12px;"' : "  style='font-size:12px;color:#333333;'")+'>'+link+link_cus+money+'<br/></span>'
						 }
						 sHtml += '</li>'
							 + '</ul>'
							 + '</li>';
					 }
				 }
			 }
		return sHtml;
	},
	MonthChangeEvent : function(){
		var title = hcalendar.useYear+'年'+(hcalendar.useMons)+'月';
		ddbanner.changeBannerTitle(title);	
		todo.getMonthAct();
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
	getData: function(dtime){
		//$("#msg").html("正在加载中...");
		$("#msg").show();
		if(todo.myScroll){
			todo.myScroll.destroy();
			todo.myScroll = null;
			$("#wrapper").find("#pullDown").remove();
			$("#wrapper").find("#pullUp").remove();
		}
		if (dtime == undefined )
			todo.refreshData();
		else
			todo.refreshData(dtime);
	},

	refreshData: function(dtime){
		var sendObj = {};
		if(todo.myScroll)
			$("#wrapper").find("#pullUp").hide();

		todo.filterObj.page_num = 1;
		if (dtime != undefined )
		todo.filterObj.day = dtime;
		sendObj.data = todo.filterObj;
		sendObj.callback = todo.renderCusList;

		todo.data = [];
		$("#todoList").html("");

		new home().getCustomers(sendObj);
	},
	getMoreData: function(){
		if(todo.lastSize < todo.page_size)
			return;
		var sendObj = {};
		todo.filterObj.page_num++;
		sendObj.data = todo.filterObj;

		sendObj.callback = todo.renderCusList;
		new home().getCustomers(sendObj);
	},

	renderCusList: function(data){
		var dtime = getToday(1)+" 00:00:00";
		var data_len = 0;
		var arr=new Array();
		if(data== null){
			$("#msg").show();
		}
		else {
			$("#msg").hide();
			var htmlTpl = todo.renderList(data);
			arr = htmlTpl.split('<>');
			for(var i=0;i<arr.length;i++){
				if (arr[i].indexOf("today-data") < 0)
					$("#todoList li:last-child li:last-child").append(arr[i]);
				else
					$("#todoList").append(arr[i]);

			}
			//openLink 打开客户详情页面
			$('#todoList').find('a.open-link').on('click', function(e) {
				//FIXME: 不清楚这里为什么触发了两次，异常的一次是由iscroll引起的，hack下
				if (e._fake) {
					return false;
				}
				var href = $(this).attr('href');
				openLink(oms_config.baseUrl + href, true);
				return false;
			});

			if (todo.dateyc > dtime) {
				$("#ycmoney").html(data.forcast_return+'<font size="2">元</font>');
			}
			else {
				$("#count_mon").html(data.total_return+"<font size='2'>元</font>");
				$("#yj_mon").html(data.forcast_return+"<font size='2'>元</font>");
			}
			if(todo.dateyc == "" || todo.dateyc == dtime) {
				if(data.action_list) {
					for (var i in data.action_list) {
						data_len += data.action_list[i].data.length;
					}
					todo.lastSize = data_len;
				}
				else{
					todo.lastSize = 0;
				}
			}
			else
				todo.lastSize = data.forcast_info?(data.forcast_info).length:0;

			if(todo.lastSize < todo.page_size){
				$("#pullUp").hide();
				if(todo.filterObj.page_num > 1)
					$("#todoList").append('<li class="noMore ui-border-t" style="text-align:center;"><div style="width:100%;"><p>无更多信息</p></div></li>');
			}
			else
				$("#pullUp").show();

			if(todo.myScroll)
				todo.myScroll.refresh();
			else if(todo.lastSize < todo.page_size)
				todo.myScroll = new myIScroll("wrapper", todo.refreshData);
			else
				todo.myScroll = new myIScroll("wrapper", todo.refreshData, todo.getMoreData);

		}

	},

	init : function(){
		$('#contactCancel').tap(function(){
			$('#contact').hide();
			$("#bcolor").removeClass("bcolor");
		});

		//参数初始化
		this.initParams();

		//绑定初始化事件
		this.initEvent();

		dd.ready(function () {
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
					control: false,
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
		todo.MonthChangeEvent();
	},
	initParams: function(){

		this.filterObj = {};
		this.filterObj.page_num = 1; //起始页码
		this.filterObj.page_size = 30;
		this.lastSize = 0;
		this.page_size = 30;
	}
};
$.fn.todo = function(settings){ $.extend(todo, settings || {});};

$.fn.ready(function() {
    var loginApi = oms_config.apiUrl+oms_apiList.login;
    new Login(oms_config.corpId,oms_config.baseUrl,loginApi,function(){
        var omsUser = getCookie('omsUser');
        console.log(omsUser);
        if(omsUser){
            todo.user = JSON.parse(omsUser);
			todo.init();
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

var home = function(){};
home.prototype.getCustomers = function(obj){
	var config = {};
	config.api = 'getRealtimeAction';
	config.type = 'post';
	config.data = obj.data;
	config.callback = obj.callback;

	config.error = function(msg){
		if($("#msg").css("display") == "block")
			$("#msg").html(msg);
	};
	sendQuest(config);
};

var sendQuest = function(config){
	var apiUrl = oms_config.apiUrl + oms_apiList[config.api];
	var sendData = config.data || {};
	sendData.omsuid = todo.user.id;
	sendData.token = todo.user.token;
	console.log(sendData);
	var request = $.ajax({
		url: apiUrl,
		type: config.type,
		data: sendData,
		cache: false,
		success: function(response){
			if(response){
				var result = JSON.parse(response);
				if(result.res === 1)
					config.callback && config.callback(result.data);
				else if(result.msg)
					new home().error(result.msg);
			}
			else {
				new home().error("服务异常");
			}
		},
		error: function(xhr, errorType, error){
			if(errorType == "abort") return;
			var msg = "网络请求失败";
			if(config.error)
				config.error(msg);
			else
				new home().error(msg);
		}
	});
	if(config.isSearch)
		search.ajax = request;
};



