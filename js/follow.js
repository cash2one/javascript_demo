var follow = {
    selected : [],
	orgselected : [],
	searchName : '',
	minusStage : false,
	allArr : [],
	stage : 0,
	lastCount : 0,
	isAppend : 1,
		
	renderSelected : function(){
		var appendHtml = '<div id="follows_list">';
		for(var i in follow.selected){
			appendHtml += '<div data-code="'+follow.selected[i].emplCode+'" class="avatar-div"><span class="ui-avatar-tiled">';
			if(follow.selected[i].photo == null || follow.selected[i].photo == ''){
				appendHtml += '<span class="hecom-avatar-text"><span>'+follow.selected[i].emplName.substr(-2)+'</span></span>';
			}else{
				appendHtml += '<span class="hecom-avatar-img"><img src="'+follow.selected[i].photo+'" /></span>';
			}	
			appendHtml += '</span><span class="hecom-name">'+follow.selected[i].emplName.substr(-2)+'</span>'
			+ '<img src="static/img/workorder_template_delete_press.png" style="display:none;" class="closebtn" /></div>';
		}

		if(isOwner == '1'){
			appendHtml += '<div class="btn-avatar" id="add-follow"><span class="ui-avatar-tiled">'
				  + '<span class="hecom-avatar-img"><img src="static/img/add-btn.png"></span>'
				  + '</span><span class="hecom-name">&nbsp;</span></div>'
				  + '<div id="minus-follow" class="btn-avatar"><span class="ui-avatar-tiled">'
				  + '<span class="hecom-avatar-img"><img src="static/img/minus-btn.png"></span>'
				  + '</span><span class="hecom-name">&nbsp;</span></div>';	
		}
		$("body").append(appendHtml);
		follow.selectedEventListener();
	},
	
	selectedEventListener : function(event){
		$("#add-follow").on('click',function(){
			follow.minusStage = 0;								 
			$("#follows_list").remove();	
			follow.stage = 1;
			follow.renderAllUsers(follow.allArr);	
			stopEventBubble(event);
		});
		$("#minus-follow").on('click',function(event){
			$(".closebtn").toggle();								   
			follow.minusStage = !follow.minusStage;	
			stopEventBubble(event);
		});	
		$(".avatar-div").on('click',function(event){
			if(follow.minusStage){
				if($("#follows_list .avatar-div").length < 2){
					dd.device.notification.alert({message: "最少需要一个跟进人",title: "",	buttonName: "确定",
						onSuccess : function() {},
						onFail : function(err) {}
					});
					return;
				}else{
					$(this).remove();
					var code = $(this).data('code');
					$("[data-code='"+code+"']").remove();
					var temp = [];
					for(var i in follow.selected){
						if(follow.selected[i].emplCode != code){
							temp.push(follow.selected[i]);	
						}
					}
					
					follow.selected = temp;
					cusInfo.follows = follow.selected;
					store.unbindCusFollow(cusInfo.code,code,function(res){
						console.log(res);												   
					});
				}
			}
			stopEventBubble(event);
		});		
	},

	renderAllUsers : function(arr){
		var sHtml = '<section class="ui-container" id="allSelectUser">'
        + '<div class="ui-searchbar-wrap" id="searchwrap">'
        + '<div class="ui-searchbar ui-border-radius">'
        + '<i class="ui-icon-search"></i><div class="ui-searchbar-text">搜索</div>'
        + '<div class="ui-searchbar-input"><input value="" type="text" placeholder="搜索" autocapitalize="off"></div>'
        + '<i class="ui-icon-close"></i></div><button class="ui-searchbar-cancel">取消</button></div>'
		+ '<ul class="ui-list ui-border-tb" id="all-list">';
		var lastId = 0;
		for(var i in arr.data){
			sHtml += follow.renderUserLi(arr.data[i]);
			lastId = arr.data[i].id;
		}
		sHtml += '</ul><footer><ul class="ui-list ui-list-pure ui-border-t footscroll"><li class="ui-border-t" id="photoes">';
/*		for(var j in follow.selected){
			sHtml += follow.renderUserLiPhoto(follow.selected[j]);			
		}*/		
		
		sHtml += '</li></ul>';
		sHtml += '<div class="footbtn"><span id="cfm-btn">确认('+follow.selected.length+')</span></div></footer></section>';
		
		$("body").append(sHtml);
		$("#all-list").attr('data-id',lastId);
		follow.setNewWdith();
		follow.allUserEventListener();		
	},

	renderUsersAll : function(arr){
		var sHtml = '';
		var lastId = 0;
		for(var i in arr.data){
			sHtml += follow.renderUserLi(arr.data[i]);
			lastId = arr.data[i].id;
		}
		
		if(follow.isAppend == 1){
			$("#all-list").html(sHtml);
		}else{
			$("#all-list").append(sHtml);
		}
		
		$("#all-list").attr('data-id',lastId);
		follow.setNewWdith();
		follow.allUserEventListener();		
	},	

	renderUserLi : function(obj){
		if(follow.objInSelected(obj)){
			return '';
		}else{		
			var newobj = {"emplCode":obj.emplCode,"emplName":obj.emplName,"photo":obj.photo};	
			var liHtml = '<li class="ui-border-t" data-str=\''+JSON.stringify(newobj)+'\'><div class="ui-avatar-s filterli';
			liHtml += follow.objInSelected(obj) ? ' activeli">' : '">';
			if(obj.photo == null || obj.photo == ''){
				liHtml += '<span class="hecom-avatar-text"><span>'+obj.emplName.substr(-2)+'</span></span>';
			}else{
				liHtml += '<span class="hecom-avatar-img"><img src="'+obj.photo+'" /></span>';
			}		
			liHtml += '</div><div class="ui-list-info"><h4 class="ui-nowrap">'+obj.emplName+'</h4>'
					+ '<p class="ui-nowrap">'+(obj.orgName == '' ||obj.orgName == null ? '&nbsp;' : obj.orgName)+'</p></div></li>';
			return liHtml;
		}
	},

	renderUserLiPhoto : function(obj){
		var sHtml = '<span data-diff="'+obj.emplCode+'" class="ui-avatar-tiled">';
		if(obj.photo == null || obj.photo == ''){
			sHtml += '<i>'+obj.emplName.substr(-2)+'</i></span>';
		}else{
			sHtml += '<img src="'+obj.photo+'" /></span>';
		}	
		return sHtml;	
	},
	
	setNewWdith : function(){
		var numberC = $("#allSelectUser .activeli").length
		var liWidth = 125 + 35 * numberC;
		$("#photoes").css('width',liWidth+'px');
		$("#cfm-btn").html("确认("+numberC+")");
	},
	
	allUserEventListener : function(){
		$("#all-list li").on('click',function(event){
			var obj = $(this).data('str');
			if($(this).find('.filterli').hasClass('activeli')){
				$("[data-diff='"+obj.emplCode+"']").remove();
			}else{
				$("#photoes").append(follow.renderUserLiPhoto(obj));
			}	
			$(this).find('.filterli').toggleClass('activeli');
			follow.setNewWdith();
			stopEventBubble(event);
		});
		$("#cfm-btn").on('click',function(event){
			var objs = $("#allSelectUser .activeli");
			var numberC = objs.length;
			if(numberC < 1){
				dd.device.notification.alert({message: "最少需要一个跟进人",title: "",	buttonName: "确定",
					onSuccess : function() {},
					onFail : function(err) {}
				});
				return;
			}else{	
				var seled = [];
				objs.each(function(){
					var obj = $(this).parent().data('str');			   
					seled.push(obj);
				});
				follow.resetSelected(seled);	
			}
			stopEventBubble(event);
		});

		$('.ui-searchbar').on('tap',function(event){
			$('.ui-searchbar-wrap').addClass('focus');
			$('.ui-searchbar-input input').focus();
			event.stopPropagation();
		});
		$('.ui-searchbar-cancel').on('tap',function(event){
			$('.ui-searchbar-wrap').removeClass('focus');
			$("#allSelectUser").remove();
			follow.isAppend = 0;
			follow.renderAllUsers(follow.allArr);
			event.stopPropagation();
		});	
		$("#allSelectUser .ui-icon-close").tap(function(){
			$('.ui-searchbar-input input').val('');
			$("#allSelectUser").remove();
			follow.isAppend = 0;
			follow.renderAllUsers(follow.allArr);
		});			

		$('#allSelectUser input').on('keyup onpaste',function() {
			var key = $.trim($(this).val());
			var filterObj = {type: 'dingSyncAuthEmpl',entCode: entCode,deviceId: deviceId,searchType: 2,searchName:key};
			follow.isAppend = 1;
			store.getSubEmpl(filterObj,function(res){								
				var allArr = JSON.parse(res);
				follow.lastCount = allArr.data.length;
				follow.renderUsersAll(allArr);	
			});
		});		
	},

	getAllUsers : function(nextId,name){
		var filterObj = {type: 'dingSyncAuthEmpl',entCode: entCode,deviceId: deviceId,searchType: 2,pageSize:50,nextId:nextId};
		if(name){
			filterObj.searchName = name;
		}
		store.getSubEmpl(filterObj,function(res){								
			follow.allArr = JSON.parse(res);	
			follow.lastCount = follow.allArr.data.length;
		});
	}, 
	
	resetSelected : function(seled){
		var added = [];
		var minus = [];
		for(var i in seled){
			if(!follow.objInObjs(seled[i],follow.selected)){
				added.push(seled[i].emplCode);
			}			
		}

//		for(var i in follow.selected){
//			if(!follow.objInObjs(follow.selected[i],seled)){
//				minus.push(follow.selected[i].emplCode);
//			}			
//		}
		follow.stage = 0;
		if(added.length == 0){
			$("#allSelectUser").remove();	
			follow.callback();
			$("#main-body").show();	
			$("#main-foot").show();
		}else{
			var dfdSync = $.Deferred();
			if(added.length >0){
				store.bindCusFollow(cusInfo.code,added.toString(),function(res){
					console.log(res);
					dfdSync.resolve();
				});	
			}
//			if(minus.length >0){
//				store.unbindCusFollow(cusInfo.code,minus.toString(),function(res){
//					console.log(res);
//					dfdSync.resolve();
//				});			
//			}
			dfdSync.done(function(){
				$("#allSelectUser").remove();	
				follow.callback();
				
				$("#main-body").show();	
				$("#main-foot").show();							  
			});				
		}
		
	},
	
	renderMore : function(){
		if(follow.lastCount >= 50){
			var nextId = $("all-list").data('id');
	
			var filterObj = {type: 'dingSyncAuthEmpl',entCode: entCode,deviceId: deviceId,searchType: 2,pageSize:50,nextId:nextId};
			store.getSubEmpl(filterObj,function(res){								
				var allArr = JSON.parse(res);
				follow.lastCount = allArr.data.length;
				follow.renderUsersAll(allArr);
			});
		}
	},
	
	objDelSelected : function(obj){
		var temp = [];
		for(var i in follow.selected){
			if(follow.selected[i].emplCode != obj.emplCode){
				temp.push(follow.selected[i]);	
			}
		}
		follow.selected = temp;
	},

	objInSelected : function(obj){
		return follow.objInObjs(obj,follow.selected);
	},

	objInObjs : function(obj,objs){
		for(var i in objs){
			if(obj.emplCode == objs[i].emplCode){
				return true;
			}
		}
	},
	
	initApi : function(){

		dd.biz.navigation.setTitle({
			title: '跟进人',
			onSuccess : function(result) {},
			onFail : function(err) {}
		});	
	
		dd.biz.navigation.setRight({
			show: false,
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
					follow.followBack();
				},
				onFail : function(err) {}
			});
		}else{
			$(document).off('backbutton');					
			$(document).on('backbutton', function(e) {
				follow.followBack();											 
				e.preventDefault();
			});				
		}
	},
	
	followBack : function(){
		if(follow.stage == 0){
			$("#follows_list").remove();	
			$("#main-body").show();	
			$("#main-foot").show();		
			cusInfo.initApi();	
			cusInfo.initLeft();
		}else{
			$("#allSelectUser").remove();
			follow.stage = 0;
			follow.renderSelected();
		}
	},
	
    init : function(data,callback) {
		follow.initApi();
		follow.callback = callback;
		follow.selected = data;
		follow.orgselected = data;
		follow.renderSelected();
		follow.getAllUsers();	
    }
};

$.fn.follow = function(settings){ $.extend(follow, settings || {});};

