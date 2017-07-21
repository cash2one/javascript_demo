$(function(){
	FastClick.attach(document.body);
	var follObj =  {
		'-1': '未理单',
		'0': '待理单',
		'1': '已签已回',
		'6': '已签未回',
		'2': '重点跟进',
		'3': '能签能回',
		'4': '冲击客户',
		'17': '推进中',
		'5': '已死客户',
		'7': '资料量',
		'8': '电话量',
		'9': '拜访量',
		'10': 'A级客户',
		'11': 'B级客户',
		'12': 'C级客户',
		'13': 'D级客户',
		'14': '预测回款',
		'15': '今日回款',
		'16': '资料量'
	};
    //顶部导航
    var OMS = {
        user: {},
				type : 0,
				flag: getUrlParam('flag') || '',
        init: function(){
            //页面标签初始化
            this.initTitleBar();
            this.initLeftBar();

			var level = getUrlParam('s');
			var orgid = getUrlParam('id');
			var month = getUrlParam('month');
			var leader = getUrlParam('leader') || '';

			OMS.type  = getUrlParam('t');
            this.getData(level,orgid,month,OMS.type, leader);
        },

        getData: function(level,orgid,month,type, leader){
            $("#msg").html("正在加载中...")
            $("#msg").show();
			var data = {level:level,orgid:orgid,month:month,type:type,omsuid:OMS.user.id,token:OMS.user.token};
			if(leader){
					data.leader = leader;
			}
			$.ajax({
				type:"post",
				url:oms_config.apiUrl+"apiTeamcus/getLidanCusList?_t="+ (new Date().getTime()),
				async:true,
				data:data,
				dataType:'json',
				success:function(rs){
					OMS.renderCusList(rs.data.lists);
					if(type < 7 || type == 17){
						$("#title").html(follObj[type]+':'+rs.data.money+'元/'+rs.data.count+'个');
					}else if(type < 9){
						$("#title").html(follObj[type]);
					}else if(type==15||type==14){
                        $("#title").html(follObj[type]+':'+rs.data.money+'元/'+rs.data.count+'个');
                    }else{
						$("#title").html(follObj[type]+':'+rs.data.count+'个');
					}
					if(type==8&&OMS.flag=='avgs'){
						$("#title").html(follObj[type]+':'+rs.data.count+'个');
					}
				},
				error:function(e){}
			});
        },

        renderCusList: function(data){
            $("#listNav").show();
			$("#msg").hide();
            var htmlTpl ;
            if(OMS.type!=14){
                htmlTpl = OMS.renderCusListLi(data);
            }else{
                htmlTpl = OMS.renderCusPredictListLi(data);
            }
            $("#cuslist").append(htmlTpl);

            $("#cuslist li").off('click').on('click', function(){
                if(!$(this).hasClass("noMore")){
                    openCustomerInfo($(this).data("code"));
                }
            });

        },

				defaultData: function(data){
						if(data == null || data ==''){
							return '暂无';
						}else{
							return data;
						}
				},
        renderCusListLi: function(data){
            var htmlTpl = '';
            var nowTime = new Date().getTime();
            for(var i = 0, len = data.length; i < len; i++){
                htmlTpl += '<li data-code="' + data[i].id + '" class="ui-border-t">';
                htmlTpl += '<div class="ui-list-info">';
                htmlTpl += '<h4 class="ui-nowrap itemtoggle">' + data[i].cusname +
                    '<span class="visiting">' + ((OMS.type < 7|| OMS.type == 15) ? data[i].money+'元' : '') + '</span>' +
                '</h4>';
                htmlTpl += '<p class="itemtoggle">';
								var typetxt = OMS.type < 7 ? follObj[OMS.type] : (data[i].follow_type < 0 ? '暂无状态' : (follObj[data[i].follow_type] || '暂无状态'));
                htmlTpl += '<span>' + typetxt + '&nbsp;</span>|';
                htmlTpl += '<span>&nbsp;' + (data[i].mylevel=='无'?'未评':data[i].mylevel) +'级&nbsp;</span>|';
				htmlTpl += '<span>&nbsp;' + (data[i].mglevel=='无'?'未评':data[i].mglevel) + '级&nbsp;</span>';
                htmlTpl += '</p>';

                htmlTpl += '<p class="itemtoggle">'+OMS.defaultData(data[i].city)+'-'+OMS.defaultData(data[i].area)+'-'+OMS.defaultData(data[i].vwar)+'-'+OMS.defaultData(data[i].owner)+'</p>';
                htmlTpl +='</div>';

                htmlTpl += '</li>';
            }
            return htmlTpl;
        },

        renderCusPredictListLi: function(data){
            var htmlTpl = '';
            var nowTime = new Date().getTime();
            for(var i = 0, len = data.length; i < len; i++){
                htmlTpl += '<li data-code="' + data[i].cusid + '" class="ui-border-t">';
                htmlTpl += '<div class="ui-list-info">';
                htmlTpl += '<h4 class="ui-nowrap itemtoggle">' + data[i].cusname +
                    '<span class="visiting">' + data[i].money+'元</span>' +
                '</h4>';
                htmlTpl += '<p class="itemtoggle">'+data[i].realname+'</p>';
                htmlTpl +='</div>';

                htmlTpl += '</li>';
            }
            return htmlTpl;
        },

        initTitleBar: function(){
            ddbanner.changeBannerTitle("客户列表");
        },
        initLeftBar: function(){
            dd.ready(function(){
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
    };


    var openCustomerInfo = function(code){
        openLink(oms_config.baseUrl + "customerInfo.html?code=" + code + "&from=private&jumpType=close", true);
    };

    //免登验证
    $.fn.OMS = function(settings){ $.extend(OMS, settings || {});};
    $.fn.ready(function() {
        var loginApi=oms_config.apiUrl + oms_apiList.login;
        new Login(oms_config.corpId,oms_config.baseUrl,loginApi,function(){
            var omsUser = getCookie('omsUser');
            if(omsUser) omsUser = JSON.parse(omsUser);

            if(omsUser && omsUser.res === 1){
                if(omsUser.role === -1) {
                    dd.device.notification.alert({
                        message: omsUser.msg,
                        title: "提示",
                        buttonName: "确定",
                        onSuccess : function() {
                            dd.biz.navigation.close({
                                onSuccess : function(result) {},
                                onFail : function(err) {}
                            });
                        },
                        onFail : function(err) {}
                    });
                }
                else {
                    OMS.user = omsUser;
                    OMS.init();
                }
            }
            else {
                dd.device.notification.alert({
                    message: "登录失败",
                    title: "提示",
                    buttonName: "离开",
                    onSuccess : function() {
                        dd.biz.navigation.close({
                            onSuccess : function(result) {},
                            onFail : function(err) {}
                        });
                    },
                    onFail : function(err) {}
                });
            }
        });
    });
});
