var todo = {
	user: {},
	icon: ['toolbar_arrangelist','tab_visit','list_phone','toolbar_train','list_assign'],
	//按月获取待办事项
	getMonthAct : function(){
		var role = this.user.role;
		var data = {year:hcalendar.useYear,mons:hcalendar.useMons,date:hcalendar.useDate,token:this.user.token,omsuid:this.user.id,role:this.user.role};

			$.post(oms_config.apiUrl + "apiTodo/index", data, function (res) {
				for (var i in res.data) {
					$("#cdate" + i).append('<span class="calendarPoint" style="color:#999;">' + res.data[i] + '项</span>');
				}
				var sHtml = todo.renderList(res.list);
				$("#todoList").html(sHtml);
				$("#todoTips").html(res.tips);
				todo.DetailChangeEvent();

			}, 'json');

	},

	//按天获取待办列表
	getDayActList : function(){
		var role = this.user.role;
		if (isNaN(hcalendar.useDate)){
				hcalendar.useDate = new Date().getDate();
		}else{
				hcalendar.useDate = hcalendar.useDate;
		}

		var data = {year:hcalendar.useYear,mons:hcalendar.useMons,date:hcalendar.useDate,token:this.user.token,omsuid:this.user.id,role:this.user.role};

			$.post(oms_config.apiUrl + "apiTodo/lists", data, function (res) {
				console.log(res);
				var sHtml = todo.renderList(res.list);
				$("#todoList").html(sHtml);
				$("#todoTips").html(res.tips);
				todo.DetailChangeEvent();
			}, 'json');

	},


	//渲染列表
	renderList : function(list,datel){
		var sHtml = "";
		var pheight = $(window).height();
		var nodate = pheight -110;
		var listN = $(window).height()-125;
		var role = this.user.role;
		var self = this;
		datel = new Date(datel).Format("yyyy-MM-dd");
		console.log(list);

		if(list== 0 || list==null){
			$(".ui-list").css("overflow","hidden");
			$("#todoList").css("height",nodate);
			sHtml +='<div class="no_p" >'
				  +'<img src="./img/no_plan.png" />'
				  +'</div>';
			$(".lay_swi").css("display","block");
		}
		else {
			if ($("#ui3").css("display") == "none") {
				$("#todoList").css("overflow-y", "scroll");
				$("#detail_mes").css("overflow", "scroll");
				$("#todoList").css("height", listN + "px");
				$(".lay_swi").css("display", "none");
			}
			else {
				$("#todoList").css("overflow-y", "scroll");
				$("#detail_mes").css("overflow", "scroll");
				$("#todoList").css("height", '241px');
				$(".lay_swi").css("display", "none");
			}

			for (var i in list) {
				// var link_cus = '<a href="customerInfo.html?code=' + list[i].code + '&from=private&jumpType=close"' +
				// 	' >' +list[i].name  + '</a>';
				var link_cus = '<a onclick="todo.openCustomerInfo(\''+list[i].code+'\')">' +list[i].name  + '</a>';
				sHtml += '<li class="ui-border-b" >'
					+ '<div style="height:47px;">'
					+ '<span class="miss_list">'
					+ '<span class="mis_font">' + list[i].time + '</span>'
					+ '<span class="mis_color" style="margin-left:12px;">' + link_cus + '</span>'
					if(list[i].type == "拜访") {
						sHtml +='<i class="ui-icon-localicon" style="width:' +
							' 15px;height:15px;font-size:15px;margin-top:-9px;margin-left:53px;"></i><span' +
							' class="mis_color" style="display:' +
							' block;margin-left:' +
						' 72px;margin-top: -5px;">' + list[i].address + '</span>'
					}
					sHtml += '</span>'
					+ '<span class="list_icon" data-ld="' + list[i].ldid + '" data-type="' + list[i].type + '" data-img="' + todo.icon[list[i].t] + '" data-id="' + list[i].code + '">'

					+ '<i class="ui-icon-' + todo.icon[list[i].t] + '" style="float: right;font-size: 22px;margin-right: 4%;margin-top: -11px;color: #ec564d;"></i>'
					+ '</span>'
					+ '</div>'
					+ '</li>';
			}
			//todo.ScrollList(list.length);
		  }

		todo.ScrollList(list.length);
		return sHtml;
	},
	openCustomerInfo: function(code){
		openLink(oms_config.baseUrl + "customerInfo.html?code=" + code + "&from=private&jumpType=close", true);
	},
	ScrollList : function(list_len) {
		if(list_len < 5) {
			$(".lay_swi").swipe({
				swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
					if (direction == 'up') {
						var uilid = $("#ulid").val();
						$(".ui-calendar-row").each(function () {
							var tid = $(this).attr("id");
							if (tid && tid != uilid) {
								$(this).hide('fast');
							}
						});
					} else if (direction == 'down') {
						$(".ui-calendar-row").each(function () {
							$(this).show('fast');
						});
					}
				},
				threshold: 0
			});
		}
	},

	DetailChangeEvent : function(){
		$(".list_icon").tap(function(){
			$(".lay_swi").css("display","none");
			$("#contact").css("display","block");
			$("#bcolor").addClass("bcolor");
			var code = $(this).data('id');
			//var data = {"code":code};
			var type = $(this).data('type');

			var data = {code:code,token:todo.user.token,omsuid:todo.user.id,role:todo.user.role};
			if (type=="电话记录"){
			$.post(oms_config.apiUrl+"apiTodo/phonebook",data,function(res){
				$(".dtitle").empty();
				$(".dtitle").text("客户联系人");
				var dHtml = "";
				for (var i in res) {
					dHtml += '<li class="ui-border-t">'
						+ '<div class="ui-list-info">'
						+ '<h4 class="ui-nowrap">'+res[i].linkman+'</h4>'
						+ ' <p class="ui-nowrap">'+res[i].position+'｜'+res[i].telephone+'</p>'
						+ '</div>'
						+ '<div class="ui-list-img" onclick="phone_call('+res[i].telephone+')">'
						+ '<span style="-webkit-border-radius:' +
						' 0px;background-image:url(./img/info_call_phone.png);background-size:93%;height: 35px;width: 20px;margin-top: 19px;margin-left: 59px;"></span>'
						+ '</div>'
						+ '</li>';
				}
				$("#detail_mes").html(dHtml);

			},'json');}
			else if (type=="拜访"){
				$("#contact").remove();
				openLink('doVisitLocate.html?role='+todo.user.role+"&cusId="+code);
			}
			else if(type =="理单"){
				$("#contact").remove();
				var ldid = $(this).data('ld');
				if(todo.user.role == 1){
					openLink('billingStep1.html?bid='+ldid+'&cid='+code+"&do=0");
				}else if (todo.user.role == 4)
				{
					openLink('billing2Step1.html?bid='+ldid+'&cid='+code+"&do=1");
				}
			}
			else if(type=="培训"){
				$("#contact").remove();
				openLink('doVisitLocate.html?cusId='+code+'&train=1');
			}
			else if(type=="分配"){
				$("#contact").remove();
					$("#hccalendarwrap").css("display","none");
					reallocateWidget.init(0, function (obj) {
						//	cusInfo.initApi();
						$(".ui-form").show();
						//})
					});
				//})
			}
		});
	},

	MonthChangeEvent : function(){
		var title = hcalendar.useYear+'年'+(hcalendar.useMons)+'月';
		ddbanner.changeBannerTitle(title);
		todo.getMonthAct();
	},

	init : function(){
		$('#contactCancel').tap(function(){
			$('#contact').hide();
			$("#bcolor").removeClass("bcolor");
		});

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

		var role = this.user.role;
		if (role==2 || role ==3) {
			ddbanner.changeBannerRight("新增", true, function () {
				openLink('planAdd.html?hacctime='+hcalendar.useYear+"-"+hcalendar.useMons+"-"+hcalendar.useDate+" "+hcalendar.usehourms);
			});
		}

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
		var listN = $(window).height()-75;
		$("#todoList").css("height",listN+'px');
		if(tid&&tid!=uilid){
			$(this).hide('fast');
		}
	});

});
function phone_call(tid){
	window.location.href = "tel:" + tid;
}
