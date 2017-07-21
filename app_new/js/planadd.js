
var plan = {
	user: {},
	cuse: [],

	getCustomers : function(cusid){//获取客户列表
		var data = {token:this.user.token,omsuid:this.user.id,role:this.user.role};
		$.post(oms_config.apiUrl+"apiTodo/usercus",data,function(res){
			plan.lastcount = res.length;
			plan.cuse = res;
			if(cusid != undefined){
				for(var i in res){
					if(res[i].id == cusid){
						$(".customer").val(res[i].value);	
						$("#code").val(cusid);
					}	
				}
			}else{
				plan.renderCusList(res,'');	
			}
		},'json');	
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
					console.log('ok');
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
		var data = $("#form-plan").serializeArray();
			data.push({"name":"token","value":this.user.token});
			data.push({"name":"omsuid","value":this.user.id});
			data.push({"name":"role","value":this.user.role});
			console.log(data);
		if(plan.submiting){
			dd.device.notification.toast({text: '使劲提交中...'});
			return;
		}
		dd.device.notification.showPreloader({text: '使劲提交中...'});
		plan.submiting = true;
		$.post(oms_config.apiUrl+"apiTodo/saveplan",data,function(res){
			dd.device.notification.hidePreloader();
			if(res.data > 0){
				console.log("rr");
				dd.device.notification.alert({
					message: "提交待办成功！",
					title: "",//可传空
					buttonName: "返回",
					onSuccess : function() {
						window.history.back();
					},
					onFail : function(err) {}
				});				
				
			}else{
				
			}
			plan.submitting = true;
		},'json');
	},

	init: function () {
		var cusid = getUrlParam('cusid');
		plan.getCustomers(cusid);
		ddbanner.changeBannerTitle('新增计划');
		
		$("._date_").on('click',function(){
			 var _timestamp = (new Date()).getTime();
			 var setedTime = $(this).val();
			 var today = getToday(1)+" "+ hcalendar.usehourms;

			 dd.biz.util.datetimepicker({
				 format: 'yyyy-MM-dd HH:mm',
				 value: setedTime,
				 onSuccess: function (result) {
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
					$("#date_start").val(result.value);
				},
				onFail :function() {}
		 	})
		 });

		$(".work_style").on('click',function(){
			var source = plan.user.role==3?[{key: '电话沟通',value: '2'},{key: '客户拜访',value: '1'}]:[{key: '电话沟通',value: '2'},{key: '客户拜访',value: '1'},{key: '客户培训',value: '3'}]
			dd.biz.util.chosen({
				source:source,
				onSuccess : function(res) {
					$(".work_style").val(res.key);
					$("#work_type").val(res.value);
					console.log(res);
					if (res.key =="客户拜访"){
						$("label#ytime").text('约见时间');
						$("#newadd").css("display","block");
					}
					else if(res.key =="电话沟通"){
						$("label#ytime").text('开始时间');
						$("#newadd").css("display","none");
					}
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
        console.log(omsUser);
        if(omsUser){
            plan.user = JSON.parse(omsUser);
			plan.init();
        }
    });
});
