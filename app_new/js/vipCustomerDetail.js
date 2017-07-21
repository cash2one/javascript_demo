$(function () {
	var detail = {
        vipCustomer: null,
		user: {},
		postData: {},
		init: function () {
			this.initParams();
			this.initBar();
			this.bindEvent();
			this.getData();
		},
		initParams: function () {
			var omsUser = getCookie('omsUser');
			this.user = JSON.parse(omsUser);

			var cusid = getUrlParam('code');
			this.postData.cusid = cusid;
			this.postData.omsuid = this.user.id;
			this.postData.token = this.user.token;
		},
		initBar: function () {
			ddbanner.changeBannerTitle("客户详情");
			ddbanner.changeBannerLeft('');
			if (dd.android) {
                dd.biz.navigation.setLeft({
                    visible: true,
                    control: false,
                    text: ''
                });
            }
		},
		getData: function () {
			var apiUrl = oms_config.apiUrl + oms_apiList.getVipCustomerInfo;
			var self = this;
			$.post(apiUrl, self.postData, function (response) {
			    var result = JSON.parse(response);
			    console.log(result);
			    if(result.res === 1){
                    self.vipCustomer = result.data;
			        self.generatorHtml(result.data, self);
			    }else{
			        self.toastTip(result.msg);
			    }
			});
		},
		toastTip: function (Msg) {
		    dd.ready(function(){
		        dd.device.notification.toast({
		            icon: '',
		            text: Msg,
		            onSuccess : function(result) {},
		            onFail : function(err) {}
		        });
		    });
		},

		bindEvent: function () {
			var self = this;
			$("#to-message").click(function () {
				self.toMessage();
			});
		},
		toMessage: function () {
			if (navigator.userAgent.match(/android/i)) {
			     // 通过iframe的方式试图打开APP，如果能正常打开，会直接切换到APP，并自动阻止a标签的默认行为
			     // 否则打开a标签的href链接
			     console.log("安卓");
			     var isInstalled;
			     //下面是安卓端APP接口调用的地址，自己根据情况去修改
			     var querystr = 'groupId='+this.vipCustomer.entgroupid+'&telephone='+this.user.telephone;
			     var ifrSrc = 'redcirclemanagement://com.hecom.management.android/customergroup?'+querystr;
			     var ifr = document.createElement('iframe');
			     ifr.src = ifrSrc;
			     ifr.style.display = 'none';
			     // ifr.style.display = 'none';
			     ifr.onload = function() {
				     isInstalled = true;
				     //  alert('已安装');
				     //  window.location.href="RedCircleManagement://";
				     // document.getElementById('openApp0').click();
			 	 };
			     ifr.onerror = function() {
			         isInstalled = false;
			         // alert('未安装');
			     }
			     document.body.appendChild(ifr);
			     setTimeout(function() {
			         document.body.removeChild(ifr);
			     },2000);
			}
			if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
				var querystr = 'groupId='+this.vipCustomer.entgroupid+'&telephone='+this.user.telephone;
				window.location.href = 'redcirclemanagement://startAGroupChat?'+querystr;
			}
		},
		generatorHtml: function (data, self) {
			$("#coName").html(data.entname);
			$("#namePos").html(data.realname);
			$("#intoTime").html(data.ctime_format);
			$("#tel").html(data.phone);
			$("#name").html(data.entname);
			$("#entCode").html(data.entcode);
			$("#days").html(data.leftopendays + '天 / ' + data.totalopendays + '天');
			var sms = '<a href="sms:' + data.phone + '"><i class="ui-icon-message" ></i></a>';
			var tel = '<a href="tel:' + data.phone + '"><i class="ui-icon-list_phone" ></i></a>';
			$("#mail-icon").html(sms);
			$("#tel-icon").html(tel);
		}
	};
	function toMessage() {
		if (navigator.userAgent.match(/android/i)) {
			console.log("android 系统");
		     // 通过iframe的方式试图打开APP，如果能正常打开，会直接切换到APP，并自动阻止a标签的默认行为
		     // 否则打开a标签的href链接
		     var isInstalled;
		     //下面是安卓端APP接口调用的地址，自己根据情况去修改
		     var ifrSrc = 'RedCircleManagement://';
		     var ifr = document.createElement('iframe');
		     ifr.src = ifrSrc;
		     ifr.style.display = 'none';
		     ifr.onload = function() {
			     // alert('Is installed.');
			     isInstalled = true;
			     alert(isInstalled);
			     document.getElementById('openApp0').click();
		 	 };
		     ifr.onerror = function() {
		         // alert('May be not installed.');
		         isInstalled = false;
		         alert(isInstalled);
		     };
		     document.body.appendChild(ifr);
		     setTimeout(function() {
		         document.body.removeChild(ifr);
		     },1000);
		}
	}
	detail.init();
});
