$(function(){
	var daily = {
		user : {},
		postData : {},
		allData : {},//一个用户可能会有多个账户
		len : 0, //当前用户有几个账户
		closeType: getUrlParam('closeType') || '',
		init : function(){
			//参数初始化
			this.initParams();

			//页面标签初始化
            this.initBar();

            //获取日报的基础数据
            this.getData();
		},
		initParams : function(){
			var omsUser = getCookie('omsUser');
			this.user = JSON.parse(omsUser);
		},
		initBar: function(){
			ddbanner.changeBannerTitle("写日报");
			var self = this;
			ddbanner.changeBannerRight("提交",true,function(){
                self.submit();
            });
            // ddbanner.changeBannerLeft('dailyReport.html');
            ddbanner.changeBannerLeft('');
		},
		getData : function(){
			var apiUrl = oms_config.apiUrl + oms_apiList.getBaseInfo;
			var send = {};
			send.omsuid = this.user.id;
			send.token = this.user.token;

			var self = this;

			$.post(apiUrl,send,function(response){
				console.log('日报的基础信息数据');
				console.log(response);
				var result = JSON.parse(response);
				console.log(result);
				if(result.res === 1){
					self.allData = result.data;
					console.log("所有的用户数据");
					console.log(self.allData);
					var i=0;
					for(var x in self.allData){
						i++;
						if(i == 1){
							self.postData = self.allData[x];
							self.postData.userid = x;
						}
					}
					self.len = i;
					self.postData.omsuid = self.user.id;
					self.postData.token = self.user.token;
					self.generatorHtml();
					if((self.len > 0 && self.user.role == 5)||self.len > 1){
						self.multAccount();
					}
				}else{
					self.tostTip(result.msg);
				}
			});
		},
		multAccount : function(){
			var self = daily;
			$("#curVwar").html(self.postData.configname);
            $("#curName").html(self.postData.realname);
			$(".multi_account").show();
			$(".multi_account").click(function(){
                var dia2=$(".ui-dialog").dialog("show");
                    dia2.on("dialog:action",function(e){
                        console.log(e.index)
                    });
            });

			//生成弹层的用户信息
			var html = "";
			var i = 0;
			for(var x in self.allData){
				var obj = self.allData[x];
				i++;
				if(i == self.len) var b = '';
				else var b = 'ui-border-b';
				html += '<p class="accountItem '+b+'" data-uid="'+obj.id+'" ><span>'+obj.configname+'</span> <span>'+obj.realname+'</span></p>';
			}
			$("#ui-dialog-cnt").html(html);
			$(".accountItem").click(function(){
               var uid = $(this).data('uid');
               var vwar = name = '';
               for(var x in self.allData){
               		if(x == uid){
               			var obj = self.allData[x];
               			vwar = obj.configname;
               			name = obj.realname;
               			self.postData = obj;
               			self.postData.userid = obj.id;
               			self.postData.omsuid = self.user.id;
						self.postData.token = self.user.token;
               			console.log("当前的使用的用户账户");
               			console.log(self.postData);
               			self.generatorHtml();
               		}
               }
               $("#curVwar").html(vwar);
               $("#curName").html(name);

               $(".ui-dialog").dialog("hide");
            });

		},
		tostTip : function(Msg){
			dd.ready(function(){
				dd.device.notification.toast({
				    icon: '',
				    text: Msg,
				    onSuccess : function(result) {},
				    onFail : function(err) {}
				});
			});
		},
		generatorHtml : function(){
			var self  = daily;
			var obj = self.postData;
			var html = '<ul class="ui-row ui-border-b">';
			html += '<li class="ui-col ui-col-50">本月目标<span class="dailyNum">'+obj.month_target+'</span></li>';
			html += '<li class="ui-col ui-col-50">本月回款<span class="dailyNum">'+obj.month_return+'</span></li>';
			html += '<li class="ui-col ui-col-50">本周预测<span class="dailyNum">'+obj.week_forecast+'</span></li>';
			html += '<li class="ui-col ui-col-50">本周回款<span class="dailyNum">'+obj.week_return+'</span></li>';
			html += '<li class="ui-col ui-col-50">今日预测<span class="dailyNum">'+obj.today_forcast+'</span></li>';
			html += '</ul>';
			$("#dataContainer").html(html);
		},
		submit: function(){
			var today_summary = $.trim($("#today_summary").val());
			if(today_summary == ''){
				this.tostTip('请输入今日纪要');
				return false;
			}

			var today_return = parseInt($("#today_return").val());
			if(isNaN(today_return)) today_return = 0;
			this.postData.today_summary = today_summary;
			this.postData.today_return = today_return;

			var apiUrl = oms_config.apiUrl + oms_apiList.addDayReport;
			var self = this;

			dd.device.notification.showPreloader({
                text: '使劲提交中...'
            });

			$.post(apiUrl,this.postData,function(response){
				console.log('日报提交的返回数据');
				console.log(response);
				var result = JSON.parse(response);
				console.log(result);
				if(result.res === 1){
					self.tostTip('提交成功');
					if(self.closeType == 'close'){
						history.back(-1);
					}else {
						openLink('dailyReport.html');
					}
				}else{
					self.tostTip(result.msg);
				}
			}).always(function() {
                dd.device.notification.hidePreloader();
            });

		}
	}
	daily.init();
});
function ValidateNumber(e)
{
    var newValue = /^\d+/.exec(e.value);
    // if (newValue != null && newValue != 0 && newValue != '0') {
    if (newValue != null) {
        e.value = newValue;
    }
    else {
        e.value = "";
    }
    return false;
}
