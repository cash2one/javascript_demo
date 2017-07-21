$(function(){
    FastClick.attach(document.body);
    //顶部导航
    var OMS = {
        user: {},
		    type : getUrlParam('type') || '',
        orgid : getUrlParam('orgid') || '',
        level : getUrlParam('level') || '',
        issub : getUrlParam('issub') || '',
        cusid : getUrlParam('cusid') || '',
        is_group : getUrlParam('is_group') || '',
        init: function(){
            //页面标签初始化
            this.initTitleBar();
            this.initLeftBar();



            this.getData();
        },

        getData: function(){
            $("#msg").html("正在加载中...")
            $("#msg").show();
      			var data = {orgid:OMS.orgid,level:OMS.level,issub:OMS.issub,cusid:OMS.cusid,is_group:OMS.is_group,omsuid:OMS.user.id,token:OMS.user.token};
      			$.ajax({
        				type:"post",
        				url:oms_config.apiUrl+oms_apiList.lidanRateList+"?_t="+ (new Date().getTime()),
        				async:true,
        				data:data,
        				dataType:'json',
        				success:function(rs){
          					OMS.renderCusList(rs.data);
        				},
        				error:function(e){}
      			});
        },

        getSubData: function(orgid,level,issub,cusid,is_group, code){
            // $("#msg").html("正在加载中...")
            // $("#msg").show();
            var htmlTpl = "<li id='cusClass-msg' class='ui-border-t'>正在加载中...</li>";
            $("#custList-" + code).html(htmlTpl);
      			var data = {orgid:orgid,level:level,issub:issub,cusid:cusid,is_group:is_group,omsuid:OMS.user.id,token:OMS.user.token};
      			$.ajax({
        				type:"post",
        				url:oms_config.apiUrl+oms_apiList.lidanRateList+"?_t="+ (new Date().getTime()),
        				async:true,
        				data:data,
        				dataType:'json',
        				success:function(rs){
          					OMS.renderCusSubList(rs.data, code);
        				},
        				error:function(e){}
      			});
        },
        defaultValue: function(data) {
            if(!data)
                return '暂无';
            return data;
        },
        renderCusList: function(data){
            $("#listNav").show();
			      $("#msg").hide();
            var htmlTpl ;
            if(OMS.is_group == 0){
                if(OMS.type == 'cus_day'){
                    $("#title").html('今日理单客户：<b>' + data.count + '</b>个');
                }
                if(OMS.type == 'cus_none_month'){
                    $("#title").html('本月未理单客户：<b>' + data.count + '</b>个');
                }
                htmlTpl = OMS.renderCusListLi(data.lists);
            }

            if(OMS.is_group == 1){
                htmlTpl = OMS.renderCusListGroupLi(data);
            }
            $("#cuslist").append(htmlTpl);

            OMS.foldEvent();

        },

        renderCusListLi: function(data){
            var htmlTpl = '';
            var nowTime = new Date().getTime();
            for(var i = 0, len = data.length; i < len; i++){
                htmlTpl += '<li data-code="' + data[i].id + '" class="ui-border-t none_group">';
                htmlTpl += '<div class="ui-list-info">';
                htmlTpl += '<h4 class="ui-nowrap itemtoggle">' + data[i].cusname+'</h4>';
                htmlTpl += '<p class="itemtoggle">';
                htmlTpl += '<span>' + (data[i].follow_type?data[i].follow_type:'无') +'&nbsp;</span>|';
                htmlTpl += '<span>&nbsp;' + (data[i].mylevel=='无'?'未评':data[i].mylevel) +'级&nbsp;</span>|';
				        htmlTpl += '<span>&nbsp;' + (data[i].mglevel=='无'?'未评':data[i].mglevel) + '级&nbsp;</span>';
                htmlTpl += '</p>';
                htmlTpl += '<p class="itemtoggle">'+data[i].city+'-'+data[i].area+'-'+data[i].vwar+'-'+data[i].owner+'</p>';
                if(OMS.type== 'cus_day'){
                    htmlTpl += '<p class="itemtoggle">理单人员：'+data[i].lidan_user.realname+'-'+data[i].lidan_user.position+'</p>';
                    htmlTpl += '<p class="itemtoggle">理单时间：'+data[i].create_time+'</p>';
                    htmlTpl += '<p class="itemtoggle">跟进建议：'+OMS.defaultValue(data[i].follow_remark)+'</p>';
                }
                if(OMS.type == 'cus_none_month'){
                    htmlTpl += '<p class="itemtoggle">加入理单时间：'+data[i].create_time+'</p>';
                }

                htmlTpl +='</div>';

                htmlTpl += '</li>';
            }
            return htmlTpl;
        },
        renderCusListGroupLi: function(data){
            var htmlTpl = '';
            var nowTime = new Date().getTime();
            var total_num = 0;
            _.forEach(data,function(v,k){
                total_num = parseInt(v.total) + parseInt(total_num);
                htmlTpl += '<li class="ui-border-t classify is_group" data-id="'+v.cusid+'"  data-code="'+k+'" data-status="none">'+
                            '<div class="ui-list-info">'+
                            '<h4 class="ui-nowrap itemtoggle">'+v.name+
                            '<span class="group_count">' + v.total+'个' + '</span>' +
                            '<i class="ui-icon-list_arrow_down more_list"></i>'+'</h4></div>'+
                            '<ul class="ui-border-t" id="custList-'+k+'"></ul>'+'</li>';
            });

            if(OMS.type == 'cus_month'){
                $("#title").html('本月已理单客户：<b>' + total_num + '</b>个');
            }
            if(OMS.type == 'cus_all'){
                $("#title").html('理单列表客户总数：<b>' + total_num + '</b>个');
            }
            return htmlTpl;
        },
        renderCusSubList: function(lists, code){
            var data = lists.lists;
            var htmlTpl = '';

            for(var i = 0, len = data.length; i < len; i++){
                // console.log(obj);
                htmlTpl += '<li data-code="' + data[i].id + '" class="ui-border-t sub_group">';
                htmlTpl += '<div class="ui-list-info sub-list-info">';
                htmlTpl += '<h4 class="ui-nowrap sub-h4 itemtoggle">' + data[i].cusname+'</h4>';
                htmlTpl += '<p class="itemtoggle">';
                htmlTpl += '<span>&nbsp;' + (data[i].mylevel=='无'?'未评':data[i].mylevel) +'级&nbsp;</span>|';
                htmlTpl += '<span>&nbsp;' + (data[i].mglevel=='无'?'未评':data[i].mglevel) + '级&nbsp;</span>';
                htmlTpl += '</p>';
                htmlTpl += '<p class="itemtoggle">'+data[i].city+'-'+data[i].area+'-'+data[i].vwar+'-'+data[i].owner+'</p>';
                htmlTpl +='</div>';
                htmlTpl += '</li>';
            }
            $("#custList-" + code).html(htmlTpl);
            $(".sub_group").bind('click', function(){
                openCustomerInfo($(this).data("code"));
            });
        },
        foldEvent: function(){
            $(".none_group").off('click').on('click', function(){
                if(!$(this).hasClass("noMore")){
                    openCustomerInfo($(this).data("code"));
                }
            });

            $(".is_group").off('click').on('click',function(){
                $(this).siblings('li').removeClass('clicked');
                var cusid = $(this).data('id');
                var code = $(this).data('code');

                if(!$(this).hasClass('clicked')){
                    $(this).addClass("clicked");
                    if($(this).data('status') == 'none'){
                        $(this).data('status','requested')
                        OMS.getSubData(OMS.orgid,OMS.level, OMS.issub, cusid, 0, code);
                    }
                    // if(!$("#cusList-" + code).hasClass('requested')){
                    //     $("#cusList-" + code).addClass('requested');
                    //     OMS.getSubData(OMS.orgid,OMS.level, OMS.issub, cusid, 0, code);
                    // }

                }else{
                    $(this).removeClass("clicked");
                }
            })
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
                            dd.biz.navigation.close({
                                onSuccess: function(result) {},
                                onFail: function(err) {}
                            });
                        },
                        onFail : function(err) {}
                    });
                }else{
                    $(document).off('backbutton');
                    $(document).on('backbutton', function(e) {
                        dd.biz.navigation.close({
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
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
