$(function(){
	FastClick.attach(document.body);

	var OMS = {
		isNew: 0,
		role: null,
		user:{},
		page: 0,
		pageType:"",
		zeroText:"",
		init_page:function(){
			this.page = getUrlParam("page");
			if(this.page == 0){
				var index = getUrlParam("pageType"), title, value;

		        if(index == 'day'){
		            title = "申报明日回款预测";
		            value = "提交日预测";
		            this.pageType = 'day';
		            this.zeroText = "若明日预测0元，可直接提交日预测";
		        }else if(index == 'week'){
		            title = "申报下周回款预测";
		            value = "提交周预测";
		            this.pageType = 'week';
		            this.zeroText = "若下周预测0元，可直接提交周预测";
		        }else{
		            title = "申报下月回款预测";
		            value = "提交月预测";
		            this.pageType = 'month';
		            this.zeroText = "若下月预测0元，可直接提交月预测";
		        }
		        console.log(this.pageType);
		        $("title").text(title);
		        $("#submitPredict").val(value);
			}else{

			}
				
		},
		setListTpl:function(result){
			var html = '';
			if(result.res === 1){
				$(result.data.list).each(function(){
					html += '<li data-id="'+this.id+'" data-cusid="'+this.cusid+'"><div class="predict-detail"><ul>';
                    html += '<li class="company"><span>公司名称</span><span>'+this.cusname+'</span></li>';
                    html += '<li><span>跟进人</span><span>'+this.pre_cogs+'</span></li>';    
                 	html += '<li><span>预测金额</span><span>'+this.money+'元</span></li></ul></div></li>';
				});
			}
			if(html){
				$(".predict-list").append(html);
				if(!dd.ios){
					$(".predict-list>li").addClass("android");
				}
				$(".predict-zero").hide();
				// 列表绑定跳转事件
				$(".predict-list>li").bind("tap", function(){
		            openLink("billingPredictDetail.html?page=2&id="+$(this).attr("data-id"));
		        });
			}else{
				$(".predict-list").hide();
				//$(".predict-zero").show();
				$(".predict-zero").text(OMS.zeroText).show();
				//console.log("123"+OMS.zeroText);
				//console.log("123"+$(".predict-zero").text());
				//$(".predict-zero").text();
			}

	        $("#totalCount").text(result.data.total+"元");

	        $("#submitPredict").bind("tap",function(){
	        	OMS.savePredict();
	        })

		},
		setDetailTpl:function(result){
			if(result.res==1){
				$("#data").attr("data-id",result.data.id);
				$("#dataArea li").eq(0).find("span").eq(1).text(result.data.cusname);
				$("#dataArea li").eq(1).find("span").eq(1).text(result.data.pre_cogs);
				$("#dataArea li").eq(2).find("span").eq(1).text(result.data.money);
				$("#dataArea li").eq(3).find("span").eq(1).text(result.data.return_time.split(" ")[0]);
				$("#dataArea li").eq(4).find("span").eq(1).text(result.data.create_time.split(" ")[0]);
				$("#followStatus li span").eq(1).text(result.data.follow_status);
				if(!dd.ios){
					$("#dataArea li").addClass("android");
				}

			}

				
		},
		setdeleteNav:function(){
			dd.ready(function() {
				dd.biz.navigation.setRight({
				    show: false,//控制按钮显示， true 显示， false 隐藏， 默认true
				    control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
				    text: '删除',//控制显示文本，空字符串表示显示默认文本
				    onSuccess : function(result) {
				        //如果control为true，则onSuccess将在发生按钮点击事件被回调
				        /*
				        {}
				        */
				        this.deleteConfirm();
				    },
				    onFail : function(err) {}
				});
			});
		},
		setDataTpl:function(result){
			if(result.res == 1){
				var name = OMS.user.realname;
				var html = '', html1='', html2='';

				// 固定
				$(result.data.form.fixed).each(function(i){
					html += '<li data-id='+this.id+'><span>'+this.title+'</span>';
					html += '<span><input type="number" placeholder="请输入水单金额" value="'+this.value;
					if(i == 0 || i == 2){
						html += '" readonly="readonly';
					}

					html += '"></span>';
					html += '<span>元</span></li>';
				});
				$("#dataFixed").empty().append(html);

				// 自定义
				$(result.data.form.custom).each(function(){
					html1 += '<li data-id='+this.id+'><span>'+this.title+'</span>';
					html1 += '<span><input type="number" placeholder="请输入水单金额" value="'+this.value+'"></span>';
					html1 += '</li>';
				});
				$("#dataCustom").empty().append(html1);

				if(!dd.ios){
					$("#dataFixed li").addClass("android");
					$("#dataCustom li").addClass("android");
				}
				//console.log(result.data.vwar.list);
				// 战区列表
				if(result.data.vwar.list.length >=1){
					$(result.data.vwar.list).each(function(){
						if(this.id == result.data.vwar.selected){
							$("#dataOwner span").eq(0).text(this.name);
							$("#dataOwner").attr("data-id", result.data.vwar.selected);
							$("#dataOwner span").eq(1).text(name);
							//console.log(this.id);
						}
						html2 += '<li data-id="'+this.id+'"><span>'+this.name+'</span> <span>'+name+'</span></li>';
					});
					if(result.data.vwar.list.length ==1){
						$("#dataOwner i").remove();
					}
				}
					
				$(".pop-container ul").empty().append(html2);
				if(dd.ios){
					$(".pop-container ul li").addClass("iosBorder");
				}

				// 提交数据
				/*$("#saveData").bind('tap',function(){
					OMS.saveSubmitData();
				});*/

				// 选择战区
				if(result.data.vwar.list.length>1){
					$("#dataOwner").bind("tap",function(){
						$(".pop-box").show();
					})
				};

				// 点击背景关闭
				$(".pop-bg").bind("tap",function(){
					$(".pop-box").hide();
				})
				// 战区列表点击事件
				$(".pop-container li").bind("tap",function(){
					$(".pop-box").hide();
					$("#dataOwner").attr("data-id", $(this).attr("data-id"));
					$("#dataOwner li span").eq(0).text($(this).find("span").eq(0).text());
					OMS.getSubmitData($(this).attr("data-id"));
				});
			}
		},
		deleteConfirm:function(){
			dd.device.notification.confirm({
			    message: "确定要删除此项预测？",
			    title: "",
			    buttonLabels: ['取消', '确定'],
			    onSuccess : function(result) {
			        //onSuccess将在点击button之后回调
			        /*
			        {
			            buttonIndex: 0 //被点击按钮的索引值，Number类型，从0开始
			        }
			        */
			        if(result.buttonIndex === 1){
			        	OMS.deletePredict();
			        }else{

			        }
			        
			    },
			    onFail : function(err) {
			    	
			    }
			});
		},
		goBack:function(result,msg){
			if(result.res == 1){
				OMS.toastMsg(msg);
				setTimeout("history.go(-1);", 2000);
				
			}
		},
		getListData:function(){
			var config = {};
			config.api = "getPredictList";
			config.type = "post";
			config.data = {type:this.pageType};

			config.callback = this.setListTpl;
			sendQuest(config);
		},
		savePredict:function(){
			var config = {};
			var ids = [];
			config.api = "sendPaymentRecord";
			config.type = "post";
			config.data = {type : this.pageType};
			for(i=0; i<$(".predict-list>li").length; i++){
				ids.push($(".predict-list>li").eq(i).attr('data-id'));
			}
			config.data.ids = ids.join(',');
			config.callback = OMS.goBack;
			sendQuest(config);
		},
		saveSubmitData:function(){
			var config = {};
			var form_data = {};
			config.api = "saveSubmitData";
			config.type = "post";
			var id, value, vwarid;
			for(i=0; i<$(".data-list>li").length; i++){
				id = $(".data-list>li").eq(i).attr('data-id');
				value = $(".data-list>li").eq(i).find("input").val();
				if(value){
					form_data[id] = value;
				}else{
					OMS.toastMsg("请完整填写预测内容");
					return;
				}
				
			}
			if($("#dataOwner").attr("data-id")){
				vwarid=$("#dataOwner").attr("data-id");
			}else{
				OMS.toastMsg("未选择战区");
				return;
			}
			
			config.data = {form_data : form_data, vwarid:vwarid};
			config.callback = OMS.goBack;
			sendQuest(config);
		},
		toastMsg: function(msg){
			dd.device.notification.toast({
			    icon: '', //icon样式，有success和error，默认为空 0.0.2
			    text: msg, //提示信息
			    duration: "2s", //显示持续时间，单位秒，默认按系统规范[android只有两种(<=2s >2s)]
			    delay: 0, //延迟显示，单位秒，默认0
			    onSuccess : function(result) {
			        /*{}*/
			    },
			    onFail : function(err) {}
			})
		},
		getDetailData:function(){
			var config = {};
			config.api = "getPredictDetail";
			config.type = "post";
			config.data = {id:getUrlParam("id")};
			config.callback = this.setDetailTpl;
			sendQuest(config);

		},
		deletePredict:function(){
			var config = {};
			config.api = "deletePaymentRecord";
			config.type = "post";
			config.data = {id: getUrlParam("id")};

			config.callback = this.deleteSuccess;
			sendQuest(config);
		},
		deleteSuccess: function(){
			OMS.toastMsg("删除成功");
			setTimeout("history.go(-1);", 2000);
		},
		getSubmitData:function(id){
			var config = {};
			config.api = "getSubmitData";
			config.type = "post";
			config.data = {vwarid: id};

			config.callback = this.setDataTpl;
			sendQuest(config);
		},
		initData:function(){
			var self = this;
			if(this.page == 0){
				this.getListData();
			}else if(this.page == 2){
				dd.ready(function() {
	                // 添加 删除 按钮
	                dd.biz.navigation.setRight({
	                    show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
	                    control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
	                    text: '删除',//控制显示文本，空字符串表示显示默认文本
	                    onSuccess : function(result) {
	                        self.deleteConfirm();
	                    },
	                    onFail : function(err) {}
	                });
	            });
				this.getDetailData();
			}else{
				dd.ready(function() {
	                // 添加 提交 按钮
	                dd.biz.navigation.setRight({
	                    show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
	                    control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
	                    text: '提交',//控制显示文本，空字符串表示显示默认文本
	                    onSuccess : function(result) {
	                        self.saveSubmitData();
	                    },
	                    onFail : function(err) {}
	                });
	            });

				this.getSubmitData();
			}
		},
		init:function(){
			dd.ready(function() {
                //DDCtrl.setRightBtn(" ", function() {}, false);
                DDCtrl.setIOSLeftBtn("返回", function() { history.back(-1) });
            });
			this.init_page();
			this.initData();
		}
	}


	// 发起请求
	var sendQuest = function(config) {
        var apiUrl = oms_config.apiUrl + oms_apiList[config.api];
        var sendData = config.data || {};
        sendData.token = OMS.user.token;
        sendData.omsuid = OMS.user.id;
        $("#loadingPanel").addClass("show");
        $.ajax({
            url: apiUrl + "/?_ts=" + new Date().getTime(),
            type: config.type,
            data: sendData,
            success: function(response) {
                $("#loadingPanel").removeClass("show");
                if (response) {
                    var result = { res: [] };
                    try {
                        result = JSON.parse(response);
                    } catch (e) {
                        console.log(e);
                        DDCtrl.showAlert("请求回调后出错，请联系管理员!");
                    }
                    config.callback(result,"操作成功");
                } else {
                    console.log("服务异常");
                    DDCtrl.showAlert("数据拉取异常，请联系管理员。");
                }
            },
            error: function() {
                $("#loadingPanel").removeClass("show");
                DDCtrl.showAlert("网络异常!");
            }
        });
    };

	//免登验证
    $.fn.OMS = function(settings) { $.extend(OMS, settings || {}); };
    $.fn.ready(function() {
        var omsUser = OMS_BILL.getCookie('omsUser');
        if (omsUser) omsUser = JSON.parse(omsUser);

        if (omsUser.res === 1) {
            if (omsUser.role === -1) {
                dd.device.notification.alert({
                    message: omsUser.msg,
                    title: "提示",
                    buttonName: "确定",
                    onSuccess: function() {
                        dd.biz.navigation.close({
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    },
                    onFail: function(err) {}
                });
            } else {
                OMS.user = omsUser;
                OMS.init();
            }
        } else {
            dd.device.notification.alert({
                message: "登录失败",
                title: "提示",
                buttonName: "离开",
                onSuccess: function() {
                    dd.biz.navigation.close({
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                },
                onFail: function(err) {}
            });
        }
    });
})