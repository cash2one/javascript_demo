var __$$commentListVersion = 1;

var commentList = {
	cusid: getUrlParam('cusid'),
	cusname: getUrlParam('cusname'),
	type: getUrlParam('type'),
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
								history.back(-1);
            //     	if(self.setFirstFlag())
            //     	{
            //     		history.back(-1);
            //     	}
            //         else
            //         {
            //         	dd.device.notification.alert({
						//     message: "更多>点评记录 查看你的所有Boss点评",
						//     title: "",
						//     buttonName: "知道了",
						//     onSuccess : function() {
						//     	history.back(-1);
						//     },
						//     onFail : function(err) {}
						// });
            //         }
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
		var getCommentsApi = oms_config.apiUrl+oms_apiList.assessList;
		$.ajax({
			type:'POST',
			url: getCommentsApi,
			data:{"omsuid":JSON.parse(getCookie("omsUser")).id,
	 				"token":JSON.parse(getCookie("omsUser")).token,
	 				"cusid":self.cusid,
					"type":self.type,
	 			},
		 		cache:false,
				success:function(data){

					var response = JSON.parse(data);
					if(response.res == 1)
					{
						self.renderList(response.data);
					}
				}
		});

	 },

	refreshData : function(){
		if(commentList.myScroll)
            $("#wrapper").find("#pullUp").hide();
        commentList.page = 1;
        commentList.getData();
	},

	getMoreData : function(){
	    console.log(commentList.lastSize+' and '+commentList.pageSize);
	    if(commentList.lastSize < commentList.pageSize){
	        // $("#wrapper").find("#pullDown").hide();
	        return;
	    }
	    commentList.page++;
	    commentList.getData();
	},

	renderList : function(data){
		if(data.length > 0)
		{
			var list="";
			for(var i in data){
				list += this.renderListEach(data[i]);
			}
			if(commentList.page == 1)
			{
				$("#commentList").html(list);
			}
			else{
				$("#commentList").append(list);
			}

		}else{
			var temp_content = "";
			if(this.type == 1){
				 temp_content = "没有找到相关理单评价记录！";
			}else{
					temp_content = "没有找到相关拜访评价记录！";
			}
			$("#commentList").html('<div style="font-size:16px; color:#666; padding-top: 15px; text-align: center" class="nosearchRes">'+temp_content+'</div>')
		}
	},

	renderListEach : function(obj){
		var list = '<div class="content-block">'
				 +	'<div class="content-title ui-border-b">'
				 +		'<div class="title-name">'+obj.realname+'</div>'
				 +		'<span class="title-time">'+obj.c_time+'</span></div>'
				 +	'<div class="content-body"><div class="content">'+obj.content+'</div></div></div>';
		return list;
	},
	init: function(){
		this.initApi();
		this.getData();
		// console.log("1111");
	}
}

$.fn.commentList = function(settings){ $.extend(commentList, settings || {});};
$.fn.ready(function(){  commentList.init(); });
