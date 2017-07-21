$(function(){
    var daily = {
        user: {},
        postData: {},
        init: function(){
            //参数初始化
            this.initParams();
            
            //页面标签初始化
            this.initBar();

            //header的展示
            this.displayHeader();

            //获取日报的基础数据
            this.getData();
        },
        initParams: function(){
            var omsUser = getCookie('omsUser');
            // console.log("当前登录的用户信息");
            // console.log(omsUser);
            this.user = JSON.parse(omsUser);
            // console.log(this.user);

            var vwar = parseInt(getUrlParam('vwar'));
            var from = getUrlParam('from');
            
            this.postData.vwar = isNaN(vwar)?0:vwar; //对应的战区id
            this.postData.page = 1;
            this.postData.omsuid = this.user.id;
            this.postData.token = this.user.token;

            this.pageSize = 20;
            this.lastSize = 0;
            // this.from = from;

            //控制是否可以需要点击
            this.isLink = 1 ;
            // if(vwar > 0 || this.user.role == 1 || this.user.role == 4){
            if(vwar > 0){
                this.isLink = 0;
            }
        },
        initBar: function(){
            ddbanner.changeBannerTitle("日报");
            var apiUrl = oms_config.apiUrl + oms_apiList.getIsAddReport;
            var self = daily;
            var obj = {};
            obj.omsuid = self.postData.omsuid;
            obj.token = self.postData.token;
            $.post(apiUrl,obj,function(response){
                // console.log('获取是否有写日报权限的接口');
                // console.log(response);
                var result = JSON.parse(response);
                // console.log(result);
                if(result.res === 1){
                    self.isWrite = result.data.isAddReport;
                    if(self.isWrite){
                        setTimeout(function(){
                            ddbanner.changeBannerRight("写日报",true,function(){
                                openLink('dailyWrite.html');
                            });
                        },500);
                    }else{
                        ddbanner.changeBannerRight("",false);
                    }

                }else{
                    // alert(result.msg);
                    self.tostTip(result.msg);
                }
            });
            ddbanner.changeBannerLeft('');
            //omsapp-android-setLeft-visible:true
            if (dd.android) {
                dd.biz.navigation.setLeft({
                    visible: true,
                    control: false,
                    text: ''
                });
            }
            // if(this.postData.vwar > 0) ddbanner.changeBannerLeft('dailyReport.html');
            // else ddbanner.changeBannerLeft('index.html');
        },
        displayHeader: function(){
            // if(this.user.role !=5 || this.postData.vwar > 0){
            if(this.postData.vwar > 0){
                $("#wrapper").css("top",'10px');
                return;
            } 
            var html = '<span class="report-header-title">查看日报汇总</span>';
            html += '<i class="ui-icon-list_arrow_right"></i>';
            html += '<span class="report-header-type">按组织架构</span>';  

            $("#reportHeader").html(html);
            $("#reportHeader").show();
            $("#reportHeader").click(function(){
                openLink('dailySummary.html');
            });
        },
        tostTip: function(Msg){
            dd.ready(function(){
                dd.device.notification.toast({
                    icon: '',
                    text: Msg,
                    onSuccess : function(result) {},
                    onFail : function(err) {}
                });
            });
        },
        getData: function(){
            var apiUrl = oms_config.apiUrl + oms_apiList.getDayReport;
            var self = daily;
            // console.log("提交的post数据");
            // console.log(self.postData);
            // var self = this;
            $.post(apiUrl, self.postData, function (response) {
                // console.log('日报的列表数据');
                // console.log(response);
                var result = JSON.parse(response);
                // console.log(result);
                if(result.res === 1){
                    self.lastSize = result.data.list.length;
                    // console.log("lenght = "+self.lastSize);
                    // console.log(self.postData);
                    if(self.postData.page == 1 && self.lastSize == 0){
                        // console.log("show it !");
                        $("#empty").css('display','block');
                        return false;
                    }
                    if(self.lastSize < self.pageSize){
                        $("#pullUp").hide();
                    }
                    else
                        $("#pullUp").show();

                    self.generatorHtml(result.data.list,self);
                    if(self.myScroll){
                        self.myScroll.refresh();
                    }else if(self.lastSize < self.pageSize){
                        // console.log("pageSize 少的情况 ");
                        self.myScroll = new myIScroll("wrapper", self.refreshData);
                    }else{
                        // console.log("有下一页的情况 ");
                        self.myScroll = new myIScroll("wrapper", self.refreshData, self.getMoreData);
                    }
                }else{
                    // alert(result.msg);
                    self.tostTip(result.msg);
                }
            });
        },
        refreshData: function(){
            if(daily.myScroll) 
                $("#wrapper").find("#pullUp").hide();
            daily.postData.page = 1;
            daily.getData();
        },
        getMoreData: function(){
            // console.log(daily.lastSize+' and '+daily.pageSize);
            if(daily.lastSize < daily.pageSize){
                console.log("return false!");
                $("#wrapper").find("#pullDown").hide();
                return;
            }
            daily.postData.page++;
            daily.getData();
        },
        generatorHtml: function(lists,self){
            var html = '';
            $.each(lists,function(index,item){
                html += self.dailyItemHtml(item,self.isLink);
            });
            if(self.postData.page == 1){
                $("#reportList").html(html);
            }else{
                $("#reportList").append(html);
            }
            if(self.isLink) self._bindAction();
        },
        _bindAction: function(){
            $(".report-list-cell").click(function(){
                var id = $(this).data("vwar");
                openLink('dailyReport.html?vwar='+id);
            });
        },
        dailyItemHtml: function(item,isLink){
            var html = '<li class="report-list-cell" data-vwar = "'+item.c_vwar+'">';

            html += '<div class="report-list-cell-time"> <span>'+item.c_time_format+'</span> </div>'

            html += '<div class="report-list-cell-body">';
            html += '<div class="report-list-cell-title ui-border-b"> <span>'+item.c_vwarname+'</span> <span>'+item.c_userrealname+'</span>';
            if(isLink) html += '<i class="ui-icon-list_arrow_right"></i>';
            html += '</div>';
            html += '<div class="report-list-cell-content ui-border-b"><ul>';
            html += '<li> <span>本月目标</span> <span>'+item.di_monthaim+'</span> </li>';
            html += '<li> <span>本月达成</span> <span>'+item.di_monthreturn+'</span> </li>';
            html += '<li> <span>本周预测</span> <span>'+item.di_weekforecast+'</span> </li>';
            html += '<li> <span>本周回款</span> <span>'+item.di_weekreturn+'</span> </li>';
            html += '<li> <span>今日预测</span> <span>'+item.di_todayforecast+'</span> </li>';
            html += '<li> <span>今日达成</span> <span>'+item.di_todayreach+'</span> </li>';
            html += '</ul></div>';

            html += '<div class="report-list-cell-plan">';
            html += item.di_todaysummary;
            html += '</div>';
            
            html += '</div>';

            html += '</li>'
            return html;
        }
    }
    daily.init();
});