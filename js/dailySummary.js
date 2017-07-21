$(function(){
	var daily = {
		user : {},
        postData : {},
        curAreaId : 0,
        curCityId : 0,
        init : function(){
            //参数初始化
            this.initParams();

            //页面标签初始化
            this.initBar();

            //获取日报的基础数据
            this.getData();

            //绑定事件
            var self = this;
            this._bindEvent(self);
        },
        initParams : function(){
            var omsUser = getCookie('omsUser');
            this.user = JSON.parse(omsUser);

            this.postData.omsuid = this.user.id;
            this.postData.token = this.user.token;
        },
        initBar: function(){
            ddbanner.changeBannerTitle("日报汇总");
            ddbanner.changeBannerRight("",false);
            // ddbanner.changeBannerLeft('dailyReport.html');
            ddbanner.changeBannerLeft('');
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
        getData : function(){
            var apiUrl = oms_config.apiUrl + oms_apiList.getAreaInfo;
            var self = this;
            $.post(apiUrl,this.postData,function(response){
                var result = JSON.parse(response);
                console.log(result);
                if(result.res === 1){
                    self.generatorHtml(result.data,self);
                }else{
                    self.tostTip(result.msg);
                }
            });
        },
        generatorHtml : function(data,self){
            console.log(data);
            var level = data.level;
            var items = data.list;
            var html = '';
            switch(level){
                case 3:
                    html = self.level3Html(items,self);
                    break;
                case 2:
                    html = self.level2Html(items,self,0);
                    break;
                case 1:
                default:
                    html = self.level1Html(items,self,0);
            }

            $("#wrapper").html(html);
            self._bindEvent(self);
        },
        level3Html : function(items,self){
            var html = '<ul class="ui-list ui-list-text summaryZero">';
            $.each(items,function(index,item){
                html += self.level3ItemHtml(item,self);
            });
            html +='</ul>';
            return html;
        },
        level3ItemHtml : function(item,self){
            var html = '<li class="ui-border-t summaryZero"> <div class="ui-list-info summaryZero">';
            html += '<h4 class="ui-nowrap summaryWord ui-border-b summaryAreaHead" data-id="'+item.id+'">'+item.name+'</h4>';
            html += '<i class="ui-icon-angle_down summaryIcon"></i>';
            html += self.level2Html(item.subs,self,item.id);
            html += '</div></li>'
            return html;
        },
        level2Html : function(items,self,id){
            if(id){
                var idstr = 'id = "area'+id+'"';
                var hide = 'suHide';
            } else {
                var idstr = '';
                var hide = '';
            }
            var html = ' <ul class="ui-list ui-list-text summaryZero cityarea '+hide+'" '+idstr+'>'
            $.each(items,function(index,item){
                html += self.level2ItemHtml(item,self);
            });
            html += '</ul>';
            return html;
        },
        level2ItemHtml : function(item,self){
            var html = '';
            html +='<li class="ui-border-t summaryZero"> <div class="ui-list-info summaryZero">'
            html += '<h4 class="ui-nowrap summaryCityHead" data-id="'+item.id+'">'+item.name+'</h4>';
            html += self.level1Html(item.subs,self,item.id);
            html += '</div></li>';
            return html;
        },
        level1Html : function(items,self,id){
            if(id){
                var idstr = 'id = "city'+id+'"';
                var hide = '';//不隐藏 ，直接 展示
            } else {
                var idstr = '';
                var hide = '';
            }
            var html = '<ul class="ui-list ui-list-text summaryZero summaryVwar vwararea '+hide+'" '+idstr+'>';
            $.each(items,function(index,item){
                html += self.level1ItemHtml(item);
            });
            html += '</ul>';
            return html;
        },
        level1ItemHtml : function(item){
            var html = '';
            if(item.lastinfo.length === 0){
                item.lastinfo = {
                    "da_vwar": "",
                    "da_username": "",
                    "da_reporttime_format": "未提交"
                };
            }
            html += '<li class="ui-border-b summaryVwarItem" data-id = "'+item.id+'"><div class="ui-list-info summaryZero">';
            html += '<h4 class="ui-nowrap summaryWord">'+item.name+'</h4><p>'+item.lastinfo.da_username+'</p><span class="summaryTimeIcon">'+item.lastinfo.da_reporttime_format+'</span>';
            html += '</div></li>'

            return html;
        },
        _bindEvent : function(self){
            $(".summaryAreaHead").click(function(){
                var id = $(this).data("id");
                console.log("id = "+id);
                var el = 'area'+id;
                console.log(el);
                console.log(id);
                if(self.curAreaId == id){
                    $("#"+el).toggle();
                }else{
                    $('.cityarea').hide();
                    // $('.vwararea').hide();
                    self.curAreaId = id;
                    $("#"+el).show();
                }
            });
            $(".summaryCityHead").click(function(){
                return false;//暂时不需要控制展开，关闭
                var id = $(this).data("id");
                console.log("id = "+id);
                var el = 'city'+id;
                console.log(el);
                console.log(id);
                if(self.curCityId == id){
                    $("#"+el).toggle();
                }else{
                    $('.vwararea').hide();
                    self.curCityId = id;
                    $("#"+el).show();
                }
            });
            $(".summaryVwarItem").click(function(){
                var id = $(this).data("id");
                // console.log("id = "+id);
                openLink('dailyReport.html?vwar='+id);
            });
        }
	}
	daily.init();
});
