var __$$dingListVersion = 1;

var dingList = {
	cusid: getUrlParam('cusid'),
	cusname: getUrlParam('cusname'),
	pageSize: 20,
	lastSize: 0,
	page: 1,
	initApi : function(){
		var self = this;
		dd.ready(function(){
			dd.biz.navigation.setTitle({
				title: self.cusname,
				onSuccess : function(result) {},
				onFail : function(err) {}
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
                	if(self.setFirstFlag())
                	{
                		history.back(-1);
                	}	
                    else
                    {
                    	dd.device.notification.alert({
						    message: "更多>点评记录 查看你的所有Boss点评",
						    title: "",
						    buttonName: "知道了",
						    onSuccess : function() {
						    	history.back(-1);
						    },
						    onFail : function(err) {}
						});
                    }	
                    e.preventDefault();
                });
            }
			dd.biz.navigation.setRight({
				show: false,
				control: false,
				text: '',
				onSuccess : function(result) {
					// console.log(reallocateWidget.selectedSubordinate);
				},
				onFail : function(err) {}
			});
		});
	},
	setFirstFlag: function(){
		// window.localStorage.clear();
		var firstFlag = localStorage.getItem('oms_ding_flag');
		console.log(firstFlag);
		if(firstFlag === null)
		{
			localStorage.setItem('oms_ding_flag',1);
			return false;
		}else{
			return true;
		}
	},	
	getData:function(){
		var self = this;
		var getCommentsApi = oms_config.apiUrl+oms_apiList.getComments;
		$.ajax({
			type:'POST',
			url: getCommentsApi,
			data:{"omsuid":JSON.parse(getCookie("omsUser")).id,
	 				"token":JSON.parse(getCookie("omsUser")).token,
	 				"cusid":self.cusid,
	 				"currpage":dingList.page,
	 			},
	 		cache:false,
			success:function(data){
				
				var response = JSON.parse(data);
				if(response.res == 1)
				{
					self.lastSize = response.data.length;
					if(self.lastSize < self.pageSize){
						$("#pullUp").hide();
					}
					else
						$("#pullUp").show();

					self.renderList(response.data);

					if(self.myScroll){
                        self.myScroll.refresh();
                    }else if(self.lastSize < self.pageSize){
                        console.log("pageSize 少的情况 ");
                        self.myScroll = new myIScroll("wrapper", self.refreshData);
                    }else{
                        console.log("有下一页的情况 ");
                        self.myScroll = new myIScroll("wrapper", self.refreshData, self.getMoreData);
                    }

				}
			}
		});

	 },

	refreshData : function(){
		if(dingList.myScroll) 
            $("#wrapper").find("#pullUp").hide();
        dingList.page = 1;
        dingList.getData();
	},

	getMoreData : function(){
	    console.log(dingList.lastSize+' and '+dingList.pageSize);
	    if(dingList.lastSize < dingList.pageSize){
	        // $("#wrapper").find("#pullDown").hide();
	        return;
	    }
	    dingList.page++;
	    dingList.getData();
	},

	renderList : function(data){
		if(data.length > 0)
		{
			var list="";
			for(var i in data){
				list += this.renderListEach(data[i]);
			}
			if(dingList.page == 1)
			{
				$("#dingList").html(list);
			}	
			else{
				$("#dingList").append(list);
			}
			
		}else{
			$("#dingList").html('<div style="padding-left:15px; font-size:12px; color:#666" class="nosearchRes">没有找到相关BOSS点评！</div>')
		}	
	},
		
	renderListEach : function(obj){
		var list = '<div class="content-block">'
				 +	'<div class="content-title ui-border-b">'
				 +		'<div class="title-name">'+obj.comment_user+'</div>'
				 +		'<span class="title-time">'+obj.time+'</span></div>'
				 +	'<div class="content-body"><div class="content">'+obj.comment+'</div></div></div>';
		return list;
	},
	init: function(){
		this.initApi();
		this.getData();
		// console.log("1111");
	}
}

$.fn.dingList = function(settings){ $.extend(dingList, settings || {});};
$.fn.ready(function(){  dingList.init(); });