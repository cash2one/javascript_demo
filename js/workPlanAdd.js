
var plan = {
	user: {},
	cuse: [],
	source: [], //[{key: '电话沟通',value: '2'},{key: '客户拜访',value: '1'}]

	getCustomers : function(cusid){//获取客户列表
		// var data = {token:this.user.token,omsuid:this.user.id,role:this.user.role};
		// $.post(oms_config.apiUrl+"apiTodo/usercus",data,function(res){
		// 	plan.lastcount = res.length;
		// 	plan.cuse = res;
		// 	if(cusid != undefined){
		// 		for(var i in res){
		// 			if(res[i].id == cusid){
		// 				$(".customer").val(res[i].value);
		// 				$("#code").val(cusid);
		// 			}
		// 		}
		// 	}else{
		// 		plan.renderCusList(res,'');
		// 	}
		// },'json');
		return;
	},

	renderCusList : function(data,key){
		$(".paisheng").remove();
		var seHtml = '';
		if (data.length == 0){
			$("#filterbody").css("height","400px");
			seHtml	+='<div class="no_p" style="height:165%;">'
					+'<img src="./img/img_crab1.png" />'
					+'<p class="sword">恭喜你,成为螃蟹第一个试吃者</p>'
					+'<div><p class="add_cus"><a href="customerAdd.html?code=new" style="color:#ec564d;">立即添加</a></p></div>'
					+'</div>';
			$("#searchwrap").show();
			$("#filterbody").append(seHtml);
		}
		else {
			$("#filterbody").css("height","auto");
			$(".no_p").css("height","auto");
			var lis = '<ul class="ui-list ui-list-text paisheng">'
				//+ '<li class="filterli"><h5 class="ui-nowrap selall">' + '</h5></li>';
			for (var i in data) {
				if (data[i].value.indexOf(key) > -1) {
					lis += '<li class="filterli"><h5 class="ui-nowrap" style="width:100%;" data-code="' + data[i].id + '">' + data[i].value + '</h5></li>';
				}
			}

			$("#filterbody").before(lis	+'</ul>');
			$("#filterbody").hide();
			$("#searchwrap").show();
			plan.addEventListener();
		}
	},
	
	addEventListener : function(){//增加监听事件
		$(".paisheng h5").on('click',function(){
			var name = $(this).html();
			var code = $(this).data('code');
			$("#code").val(code);
			$(".customer").val(name);
			$(".fliterbox").hide();
			$(".ui-container").show();
			$(".add_but").show();

			dd.biz.navigation.setRight({
				show: true,
				control: true,
				showIcon: true,
				text: '完成',
				onSuccess: function (result) {
					plan.savePlan();
				},
				onFail: function (err) {
				}
			});
			ddbanner.changeBannerTitle('新增计划');

			if($(this).hasClass('selall')){
				if($(this).hasClass('activeli')){
					$(".paisheng .activeli").removeClass('activeli');
				}else{
					$(".paisheng .filterli h5").addClass('activeli');
				}
			}else{
				if($(this).hasClass('activeli')){
					$(this).removeClass('activeli');
				}else{
					$(this).addClass('activeli');
					if($(this).data('leaf') == '0'){
						var code = $(this).data('id');
						//plan.renderSubList(code,this);
					}
				}
			}
		});

		$(".rightmain").off('scroll').on('scroll',function(){
			if(plan.stage == 3   && plan.lastcount == 20){
				var n = $(this).scrollTop()+$(window).height() - $(".paisheng").height();
				if(n > 40){
					plan.page += 1;
					//plan.getCusList('');
				}
			}
		});
	},

	savePlan : function(){
		var cus_name = $(".customer").val();
		if(cus_name == ""){
			alert("客户名称不能为空");
			return false;
		}
		var work_type = $("#work_type").val();
		if(work_type == ''){
			dd.device.notification.toast({
				icon: '',
				text: "请填写工作类型",
				duration: 1,
				onSuccess : function(result) {},
				onFail : function(err) {}
			});
			return false;
		}
		var startTime = $("#startTime").val();
		if(startTime == ''){
			dd.device.notification.toast({
				icon: '',
				text: "请填写开始时间",
				duration: 1,
				onSuccess : function(result) {},
				onFail : function(err) {}
			});
			return false;
		}
		var endTime = $("#endTime").val();
		if(endTime == ''){
			dd.device.notification.toast({
				icon: '',
				text: "请填写结束时间",
				duration: 1,
				onSuccess : function(result) {},
				onFail : function(err) {}
			});
			return false;
		}
		var data = $("#form-plan").serializeArray();
		var form_data = OMS_COM.convertFormArrayToObject(data);
			// data.push({"name":"token","value":this.user.token});
			// data.push({"name":"omsuid","value":this.user.id});
			// data.push({"name":"role","value":this.user.role});
			// console.log(form_data);
		if(plan.submiting){
			dd.device.notification.toast({text: '使劲提交中...'});
			return;
		}
		dd.device.notification.showPreloader({text: '使劲提交中...'});
		plan.submiting = true;
		OMS_COM.ajaxPost({
			api: 'addWorkPlan',
			data: form_data,
			success: function(data){
				dd.device.notification.alert({
					message: "提交计划成功！",
					title: "",//可传空
					buttonName: "返回",
					onSuccess : function() {
						window.history.back();
					},
					onFail : function(err) {}
				});
			},
			error: function () {

			},
			always: function () {
				dd.device.notification.hidePreloader();
				plan.submitting = true;
			}
		});
	},

	init: function () {
		var cusid = getUrlParam('cusid');
		plan.getCustomers(cusid);
		ddbanner.changeBannerTitle('新增计划');
		
		$("._date_start").on('click',function(){
			 var _timestamp = (new Date()).getTime();
			 var setedTime = $(this).val();
			 var today = getToday(1)+" "+ hcalendar.usehourms;
			console.log('in startdate');
			console.log(today);
			var endTime = $("#endTime").val();

			 dd.biz.util.datetimepicker({
				 format: 'yyyy-MM-dd HH:mm',
				 value: setedTime,
				 onSuccess: function (result) {
				 	console.log(result.value);
					if(result.value < today){
						dd.device.notification.toast({
							icon: '',
							text: "计划开始时间不能小于今天",
							duration: 1,
							onSuccess : function(result) {},
							onFail : function(err) {}
						});
						return false;						
					}
					 if(result.value > endTime && endTime != ''){
						 dd.device.notification.toast({
							 icon: '',
							 text: "计划开始时间不能大于截止时间",
							 duration: 1,
							 onSuccess : function(result) {},
							 onFail : function(err) {}
						 });
						 return false;
					 }
					$("#startTime").val(result.value);
				},
				onFail :function() {}
		 	})
		 });

		$("._date_end").on('click',function(){
			var _timestamp = (new Date()).getTime();
			var setedTime = $(this).val();
			var today = getToday(1)+" "+ hcalendar.usehourms;
			console.log('in enddate');
			console.log(today);
			var startTime = $("#startTime").val();

			dd.biz.util.datetimepicker({
				format: 'yyyy-MM-dd HH:mm',
				value: setedTime,
				onSuccess: function (result) {
					console.log(result.value);
					if(result.value < today){
						dd.device.notification.toast({
							icon: '',
							text: "计划结束时间不能小于今天",
							duration: 1,
							onSuccess : function(result) {},
							onFail : function(err) {}
						});
						return false;
					}
					if(result.value < startTime && startTime != ''){
						dd.device.notification.toast({
							icon: '',
							text: "计划结束时间不能小于开始时间",
							duration: 1,
							onSuccess : function(result) {},
							onFail : function(err) {}
						});
						return false;
					}
					$("#endTime").val(result.value);
				},
				onFail :function() {}
			})
		});

		var _self = this;
		OMS_COM.ajaxPost({
			api: 'getWorkPlanConfig',
			data: {},
			success: function (data) {
				var res = JSON.parse(data);
				if(parseInt(res.code) === 0) {
					var workPlans = res.data.workPlans;

					_.forEach(Object.keys(workPlans), function(val){
						_self.source.push({key: workPlans[val],value: val})
					});
				}
			},
			error: function () {
				console.log('getWorkPlanConfig error');
			},
			always: function () {
				
			}
		});

		$(".work_style").on('click',function(){
			// var source = plan.user.role==3?[{key: '电话沟通',value: '2'},{key: '客户拜访',value: '1'}]:[{key: '电话沟通',value: '2'},{key: '客户拜访',value: '1'},{key: '客户培训',value: '3'}]
			dd.biz.util.chosen({
				source:_self.source,
				onSuccess : function(res) {
					$(".work_style").val(res.key);
					$("#type").val(res.value);
					// console.log(res);
					// if (res.key =="客户拜访"){
					// 	$("label#ytime").text('约见时间');
					// 	$("#newadd").css("display","block");
					// }
					// else if(res.key =="电话沟通"){
					// 	$("label#ytime").text('开始时间');
					// 	$("#newadd").css("display","none");
					// }
				},
				onFail : function() {}
			});
		});


		$(".cus").on('click',function(){
			 $("body").css("overflow","hidden");
			 $(".fliterbox").show();
			 $(".ui-container").hide();
			 $(".add_but").hide();
			 dd.biz.navigation.setRight({
				 show: false,
				 control: true,
				 showIcon: true,
				 text: '完成'
			 });
			 ddbanner.changeBannerTitle('选择客户');
			 plan.getCustomers();
		 });
		
		$("#searchwrap input").on('input propertychange onpaste blur', function() {
			var key = $.trim($(this).val());
			plan.renderCusList(plan.cuse,key);

		});

		$(".ui-icon-close").tap(function(){
			$('.ui-searchbar-input input').val('');
			plan.renderCusList(plan.cuse,'');
		});

		$('.ui-searchbar').on('tap',function(event){
			$('.ui-searchbar-wrap').addClass('focus');
			$('.ui-searchbar-input input').focus();
			event.stopPropagation();
		});

		$('.ui-searchbar-cancel').on('tap',function(event){
			$('.ui-searchbar-wrap').removeClass('focus');
			plan.renderCusList(plan.cuse,'');
			event.stopPropagation();
		});


		dd.ready(function () {
			dd.biz.navigation.setRight({
				show: true,
				control: true,
				showIcon: true,
				text: '完成',
				onSuccess: function (result) {
					plan.savePlan();
				},
				onFail: function (err) {}
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
		});
	}
}

$.fn.plan = function(settings){ $.extend(plan, settings || {});};
$.fn.ready(function() {
    var loginApi = oms_config.apiUrl+oms_apiList.login;
    new Login(oms_config.corpId,oms_config.baseUrl,loginApi,function(){
        var omsUser = getCookie('omsUser');
        // console.log(omsUser);
        if(omsUser){
            plan.user = JSON.parse(omsUser);
			plan.init();
        }
    });
});
