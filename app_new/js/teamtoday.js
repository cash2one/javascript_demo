$(function(){
    FastClick.attach(document.body);

    var OMS={
    	user:{},
    	postData:{},
      leaderInfo:{},
        initAction:getUrlParam('action'),
    	loginApi:oms_config.apiUrl+oms_apiList.login,

        setNav:function(level){
            var html = "";
            if(level < 3){
                html += '<li data-id="1" class="ui-col ui-col-25"><p><i class="ui-icon ui-icon-toolbar_area"></i></p><span>大区</span></li>';
                html += '<li data-id="2" class="ui-col ui-col-25"><p><i class="ui-icon ui-icon-toolbar_city"></i></p><span>城市</span></li>';
                html += '<li data-id="3" class="ui-col ui-col-25"><p><i class="ui-icon ui-icon-toolbar_warzone"></i></p><span>战区</span></li>';
                html += '<li data-id="4" class="ui-col ui-col-25"><p><i class="ui-icon ui-icon-toolbar_remind"></i></p><span>提醒</span></li>';
                $(".team-sub-nav").show();
                $("#toolBar").append(html);
            }else if(level ==3){
                html += '<li data-id="2" class="ui-col ui-col-33"><p><i class="ui-icon ui-icon-toolbar_city"></i></p><span>城市</span></li>';
                html += '<li data-id="3" class="ui-col ui-col-33"><p><i class="ui-icon ui-icon-toolbar_warzone"></i></p><span>战区</span></li>';
                html += '<li data-id="4" class="ui-col ui-col-33"><p><i class="ui-icon ui-icon-toolbar_remind"></i></p><span>提醒</span></li>';
                $(".team-sub-nav").show();
                $("#toolBar").append(html);
                if(!dd.ios){
                    $(".team-sub-nav").css("border-top","1px solid #d9dce9");
                }else{
                    $(".pop-container li").addClass("iosBorder");
                }

            }else{
                $("#section").html("没有权限");
            }
            if(!dd.ios){
                $(".team-sub-nav").css("border-top","1px solid #d9dce9");
            }else{
                $(".pop-container li").addClass("iosBorder");
            }
        },
        setTable:function(data){
            var tableColumn="";
            var lefttable="";
            var head = "";
            var total_payment = 0;
            var total_predict = 0;
            $(data.table).each(function(i){
                var trClass='odd';
                if(i%2==0){
                    trClass='even';
                }
                var dept=this.vwar_name;
                var payment = this.return_today;
                var predict = this.forecast_today;
                var month = this.return_month;
                var custom, levelType = this.level;
                total_predict += parseFloat(this.forecast_today);
                total_payment += parseFloat(this.return_today);
                if(this.isClick==1){
                    dept='<a data-id="'+this.vwar_id+'" data-level="'+this.level+'" data-issub="1">'+dept+'</a>';
                }
                if(this.level ==5){
                    dept = '<a href="profile.html?id='+this.vwar_id+'&do=0">'+dept+'</a>';
                }
                if(this.isClick==1 || this.level==5){
                    if(payment>0){
                        payment = '<a href="teamCusList.html?s='+this.level+'&id='+this.vwar_id+'&t=15">'+parseFloat(this.return_today)+'</a>';
                    }
                    if(predict>0){
                        predict = '<a href="teamCusList.html?s='+this.level+'&id='+this.vwar_id+'&t=14">'+parseFloat(this.forecast_today)+'</a>';
                    }
                    if(month>0){
                        month = '<a href="teamCusList.html?s='+this.level+'&id='+this.vwar_id+'&t=1">'+parseFloat(this.return_month)+'</a>'
                    }
                }


                lefttable += '<tr><td style="max-width:100px;" ><span class="ui-nowrap tdspan" style="margin-right:0;">'+dept+'</span></td></tr>';

                tableColumn +='<tr class="'+trClass+'" >\
                                                <td style="max-width:100px;min-width:100px;"><span class="ui-nowrap ui-whitespace tdspan">'+dept+'</span></td>';
                if(this.level < 5){
                      $("#leader_title").show();
                      tableColumn += '<td class="text-center">'+(OMS.leaderInfo[this.vwar_id]?OMS.leaderInfo[this.vwar_id]:'--')+'</td>'
                }else{
                    $("#leader_title").hide();
                }
                tableColumn +=  '<td class="text-center">'+payment+'</td>\
                                <td class="text-center">'+predict+'</td>\
                                <td class="text-center">'+month+'</td>';
                $(this.project_val).each(function(){
                    custom = parseFloat(this.val);
                    if (levelType == 5){
                        custom='/';
                    }
                    tableColumn += '<td class="text-center">'+custom+'</td>';
                });
                tableColumn += '</tr>';

            });
            $(data.project_list).each(function(){
                head += '<th id="'+this.id+'">'+this.title+'</th>';
            })
            $("#headertable tr").append(head);
            $("#lefttable tbody").html(lefttable);
            $("#bodytable tbody").html(tableColumn);
            this.scrollTable();
            this.setChart(total_payment, total_predict);
        },
        setChart:function(pay, predict){
            $('#ave_files_container').highcharts({
                chart: {
                    type: 'bar',
                },
                title: {
                    text: ''
                },
                subtitle: {
                    text: ''
                },
                tooltip: {
                    enabled:false
                },
                xAxis: {
                    categories: ['已确认回款', '预测回款'],
                    gridLineWidth:0,
                    labels:{
                        style:{
                            fontSize:'14px',
                            color:"#666666"
                        }

                    },
                    title: {
                        text: null
                    },
                    tickLength:0 ,
                    tickPixelInterval:90
                },
                yAxis: {
                    title: {
                        text: null
                    },
                    labels:{
                        enabled: false,
                        gridLineWidth:0
                    },
                    gridLineColor:"#d9dcea"

                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    },
                    series: {
                        pointPadding: 0,
                        groupPadding:0,
                        borderWidth: 0,
                        shadow:false,
                        pointWidth: 20
                    }
                },
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                series: [{
                    name: '',
                    data: [pay, predict] ,
                    color: '#f37778' ,
                    dataLabels: {
                        align: 'left',
                        enabled: true,
                        inside:false,
                        color:"#666",
                        fontSize:"12px",
                        marginLeft:"8px"
                    },
                    marker:{
                        width:40,
                    }
                }]
            });
        },
        checkMore:function(obj){
            //var action = ($("#toolBar>li.atcive").index()+1);
            var level = $(obj).attr("data-level");
            var orgid = $(obj).attr("data-id");
            var issub = $(obj).attr("data-issub");
            window.location.href = OMS.setUrl($("#toolBar .active").data("id"), level, orgid, issub);
            //OMS.getColumnData(0, level, orgid, issub);
        },
        popRemind: function(){
            $(".pop-box").show();
            $(".pop-bg").bind("click", function(){$(".pop-box").hide();});
            $(".pop-container li").bind("click", function(){
                var url = "teamRemind.html?type="+$(this).index();
                openLink(url);
            })
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
        toolbarSwitch: function(){
            var index = $(this).index();
            var level, orgid, issub, action;
            var a = $(this).find("span").text();
            if(index<$("#toolBar>li").length-1){
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
                window.location.href = OMS.setUrl(action);
                // OMS.getColumnData(action);
            }else{
                OMS.popRemind();
            }
        },
        toggle:function(){
            $('.chart-panel').slideToggle(
            'fast',function(){
                if($("#chart-container").css('display')=='none'){
                    $("#lefttable").offset({ top: -1*this.scrollTop + 77 });
                }else{
                    //$("#lefttable").offset({ top: -1*this.scrollTop + 289 });
                }

            });

        },
        setUrl:function(action,level,orgid,issub){
            var urlOld = window.location.href.split("?")[0];
            var urlNew = urlOld+"?action="+action+"&level="+level+"&orgid="+orgid+"&issub="+issub;
            return urlNew;
        },
        getlevel:function(){
            OMS.postData.omsuid = OMS.user.id;
            OMS.postData.token = OMS.user.token;
            $.ajax({
                type:"post",
                url:oms_config.apiUrl+"apiForecast/getUserLevel",
                async:true,
                data:OMS.postData,
                dataType:'json',
                success:function(rs){
                    console.log(JSON.stringify(rs));
                    if(rs.res==1){
                        var action = parseInt(getUrlParam("action"));
                        //console.log(rs.data.return_all +":"+rs.data.forecast_all);
                        OMS.setNav(rs.data);
                        $("#toolBar li").bind("click", OMS.toolbarSwitch);
                        if(rs.data == 3){
                            //$("#toolBar>li").eq(OMS.initAction).click();
                            $("#toolBar>li").removeClass("active");
                            $("#toolBar>li").eq(action==0?0:(action-2)).addClass("active");
                        }else if(rs.data < 3){
                            $("#toolBar>li").removeClass("active");
                            $("#toolBar>li").eq(action==0?0:(action-1)).addClass("active");
                        }
                        OMS.getInitData();
                    }
                },
                error:function(e){
                    console.log(JSON.stringify(e));
                }
            });
        },
        getInitData:function(){
            var a = getUrlParam("action") || 0;
            var l = getUrlParam("level")=="undefined" ? "" : getUrlParam("level");
            var o = getUrlParam("orgid")=="undefined" ? "" : getUrlParam("orgid");
            var s = getUrlParam("issub")=="undefined" ? "" : getUrlParam("issub");
            if( l ){
                OMS.getColumnData(0, l, o, s);
            }else{
                OMS.getColumnData(a);
            }

        },
        getColumnData:function (action, level, orgid, issub){
            //之前的信息置空
            var loading = '<div class="ui-loading-wrap text-center"><p>图表加载中</p><i class="ui-loading"></i></div>';
            $("#ave_files_container").empty().append(loading);
            $("#lefttable tbody").empty();
            $("#bodytable tbody").empty();


            OMS.postData.omsuid = OMS.user.id;
            OMS.postData.token = OMS.user.token;
            OMS.postData.action = action;
            OMS.postData.level=level?level:"";
            OMS.postData.orgid=orgid?orgid:"";
            OMS.postData.issub=issub?issub:"";
            $.ajax({
                type:"post",
                url:oms_config.apiUrl+"apiForecast/returnMoneyToday",
                async:true,
                data:OMS.postData,
                dataType:'json',
                success:function(rs){
                    console.log(JSON.stringify(rs));
                    if(rs.res==1){

                        //console.log(rs.data.return_all +":"+rs.data.forecast_all);
                        //OMS.setChart(parseFloat(rs.data.return_all), parseFloat(rs.data.forecast_all));
                        OMS.setTable(rs.data);
                        $("#lefttable tbody a").bind('click', function(){
                            OMS.checkMore(this);
                        });
                        $(".toggle-btn").bind('click', function(){
                            OMS.toggle();
                        });
                    }
                },
                error:function(e){
                    console.log(JSON.stringify(e));
                }
            });
        },
		initData:function(){
            this.getlevel();
			//this.getColumnData(this.initAction, "", "", "");
		},
    getLeadersInfo:function(){
  			$.ajax({
  					type:"post",
  					url:oms_config.apiUrl+oms_apiList.getLeadersInfo,
  					async:true,
  					dataType:'json',
  					data:{omsuid:OMS.user.id,token:OMS.user.token},
  					success:function(rs){
  							if(rs.res == 1){
  									OMS.leaderInfo = rs.data;
  									// console.log(team.leaderInfo);
  							}
  					},
  					error:function(e){
  							console.log(JSON.stringify(e));
  					}
  			});
  	},
        init:function(){
            dd.ready(function() {
                //DDCtrl.setRightBtn(" ", function() {}, false);
                dd.biz.navigation.setLeft({
                    control: true,
                    show:  true,
                    text: "返回",
                    onSuccess: function(result) {
                        history.back(-1);
                    },
                    onFail: function(err) {}
                });
            });
            //this.setNav();
            //$("#toolBar li").bind("click", this.toolbarSwitch);
            this.getLeadersInfo();
            this.initData();
        }
	}




	//免登验证
    $.fn.OMS = function(settings) { $.extend(OMS, settings || {}); };
    $.fn.ready(function() {
        var omsUser = getCookie('omsUser');
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
