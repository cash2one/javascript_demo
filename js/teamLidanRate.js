	var lidanRate = {
			user: {},
			user: JSON.parse(getCookie('omsUser')),
			postData: {},
			sort: '',
      order_by: '',


			setNav: function(level){
				var html = "";
				if(level === 2){
						html += '<li data-id="2" class="ui-col ui-col-50"><p><i class="ui-icon ui-icon-toolbar_city"></i></p><span>城市</span></li>';
						html += '<li data-id="3" class="ui-col ui-col-50"><p><i class="ui-icon ui-icon-toolbar_warzone"></i></p><span>战区</span></li>';
						$(".team-sub-nav").show();
						$("#toolBar").append(html);
				}
				if(level < 2){
					  html += '<li data-id="1" class="ui-col ui-col-33"><p><i class="ui-icon ui-icon-toolbar_area"></i></p><span>大区</span></li>';
						html += '<li data-id="2" class="ui-col ui-col-33"><p><i class="ui-icon ui-icon-toolbar_city"></i></p><span>城市</span></li>';
						html += '<li data-id="3" class="ui-col ui-col-33"><p><i class="ui-icon ui-icon-toolbar_warzone"></i></p><span>战区</span></li>';
						$(".team-sub-nav").show();
						$("#toolBar").append(html);
				}
				if(!dd.ios){
						$(".team-sub-nav").css("border-top","1px solid #d9dce9");
				}else{
						$(".pop-container li").addClass("iosBorder");
				}
			},

			toolbarSwitch: function(){
					var index = $(this).index();
					var level, orgid, issub, action;
					var a = $(this).find("span").text();

					if(index<$("#toolBar>li").length){
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
							// accompany.next = 0;
							window.location.href = lidanRate.setUrl(action);
							// OMS.getColumnData(action);
					}
			},

			initEvent: function(){
				var self = this;
				$(".scroller").on("touchend", function(){
					if(self.myScroll){
						var scrollTop = 0;
						var getScrollY = setInterval(function(){
							if(!self.myScroll || scrollTop == self.myScroll.y) {
								clearInterval(getScrollY);
							}
							else {
								scrollTop = self.myScroll.y+47;
							}
						}, 1);
					}
				});
			},

			setUrl:function(action,level,orgid){
					var urlOld = window.location.href.split("?")[0];
					var urlNew = urlOld+"?action="+action+"&level="+level+"&orgid="+orgid;
					return urlNew;
			},

			getlevel:function(){
					if(this.user.role == 5){
						if(this.user.isCityLeader == 1){
								lidanRate.action = 2;
						}else{
								lidanRate.action = 1;
						}
					}
					if(this.user.role == 4 || this.user.role == 1){
							lidanRate.action = 3;
					}
					var action = parseInt(getUrlParam("action"));
					lidanRate.level = lidanRate.action;
					lidanRate.setNav(lidanRate.action);
					$("#toolBar li").bind("click", lidanRate.toolbarSwitch);
					if(lidanRate.action > 1){
							$("#toolBar>li").removeClass("active");
							$("#toolBar>li").eq(action==0?0:(action-2)).addClass("active");
					}else if(lidanRate.action == 3){
							$("#toolBar>li").removeClass("active");
							$("#toolBar>li").eq(action==0?0:(action-1)).addClass("active");
					}
					lidanRate.getInitData();
			},
			// getLeadersInfo:function(){
			// 		$.ajax({
			// 				type:"post",
			// 				url:oms_config.apiUrl+oms_apiList.getLeadersInfo,
			// 				async:true,
			// 				dataType:'json',
			// 				data:{omsuid:lidanRate.user.id,token:lidanRate.user.token},
			// 				success:function(rs){
			// 						lidanRate.leaderInfo = rs.data;
			// 				},
			// 				error:function(e){
			// 						console.log(JSON.stringify(e));
			// 				}
			// 		});
			// },
			getInitData:function(){
					var a = getUrlParam('action') || '';
          // if(a === '0'){
          //     a = lidanRate.action;
          // }
					var l = parseInt(getUrlParam('level')) || '';
					var o = getUrlParam("orgid")=="undefined" ? "1" : getUrlParam("orgid");
					var s = getUrlParam("issub") || '';
          if(l < 4){
              s = 1;
          }
          if(l){
              a = '';
          }
					if( l ){
							lidanRate.getColumnData(a, s, l, o);
					}else{
							lidanRate.getColumnData(a, s);
					}
			},

			getColumnData:function (action, issub, level, orgid){
					$('#biao_data').hide();
					$("#biao_msg").show();
					//之前的信息置空
					lidanRate.postData.omsuid = lidanRate.user.id;
					lidanRate.postData.token = lidanRate.user.token;
          if(orgid){
              lidanRate.postData.orgid=orgid;
          }
          if(issub){
              lidanRate.postData.issub = issub;
          }
          if(action){
              lidanRate.postData.action = action;
          }
          if(level){
    				if(level != 0){
    						lidanRate.postData.level = level;
    				}
    				else {
    						lidanRate.postData.level = '';
    				}
    			}
					if(lidanRate.sort){
						lidanRate.postData.sort = lidanRate.sort;
					}
          if(lidanRate.order_by){
            lidanRate.postData.order_by = lidanRate.order_by;
          }
					$.ajax({
							type:"post",
							url:oms_config.apiUrl+oms_apiList.lidanRateTable,
							async:true,
							data:lidanRate.postData,
							dataType:'json',
							success:function(rs){
									$('#biao_msg').hide();
									if(rs.res==1){
                      lidanRate.setTable(rs.data, level);
											// accompany.setTable(rs.data, dtime, level);
											$("#lefttable tbody a").bind('click', function(){
													lidanRate.checkMore(this);
											});
									}
							},
							error:function(e){
									console.log(JSON.stringify(e));
							}
					});

					// lidanRate.setTable(data, level);
			},
			checkMore:function(obj){
					//var action = ($("#toolBar>li.atcive").index()+1);
					var level = $(obj).attr("data-level");
					var orgid = $(obj).attr("data-id");
					// var issub = $(obj).attr("data-issub");
					window.location.href = lidanRate.setUrl($("#toolBar .active").data("id"), level, orgid);
			},

			setTable: function(data, level){
						$('#biao_data').show();
						var tableColumn="";
						var lefttable='<tr><td style="max-width:100px;" class="fix-column"><span class="ui-nowrap tdspan">汇总</span></td></tr>';
						var head = "";
						var tableData = data.tableData;
						// console.log(tableData);
            var cus_day_total = 0, cus_month_total = 0, cus_none_month_total = 0, cus_all_total = 0, cus_day_leader_total = 0, cus_month_leader_total = 0;
						$(tableData).each(function(i){
								var trClass='odd';
								if(i%2==0){
										trClass='even';
								}
								var a = lidanRate.level || '';
								var name=this.name;
								var cus_day = this.cus_day.count;
								var cus_month = this.cus_month.count;
								var cus_none_month = this.cus_none_month.count;
								var cus_all = this.cus_all.count;
								var lidan_Rate = (this.lidan_rate*100).toFixed(2);
								var cus_day_leader = this.cus_day_leader.count;
								var cus_month_leader = this.cus_month_leader.count;

                cus_day_total = parseInt(cus_day) + cus_day_total;
                cus_month_total = parseInt(cus_month) + cus_month_total;
                cus_none_month_total = parseInt(cus_none_month) + cus_none_month_total;
                cus_all_total = parseInt(cus_all) + cus_all_total;
								cus_day_leader_total = parseInt(cus_day_leader) + cus_day_leader_total;
								cus_month_leader_total = parseInt(cus_month_leader) + cus_month_leader_total;

								if(this.isClick && this.level!=4){
										name='<a data-id="'+this.id+'" data-level="'+(parseInt(this.level))+'">'+name+'</a>';
								}
								// name='<a data-id="'+this.orgid+'" data-level="'+a+'">'+name+'</a>';
								if(this.isClick){
										if(cus_day>0){
												cus_day = '<a onclick="lidanRate.openDetail('+this.id+',\''+this.level+'\',\''+this.cus_day.cusid+'\',\'0\',\'cus_day\')">'+cus_day+'</a>';
										}
										if(cus_month>0){
												cus_month = '<a onclick="lidanRate.openDetail('+this.id+',\''+this.level+'\',\''+this.cus_month.cusid+'\',\'1\',\'cus_month\')">'+cus_month+'</a>';
										}
										if(cus_none_month>0){
												cus_none_month = '<a onclick="lidanRate.openDetail('+this.id+',\''+this.level+'\',\''+this.cus_none_month.cusid+'\',\'0\',\'cus_none_month\')">'+cus_none_month+'</a>';
										}
										if(cus_all>0){
												cus_all = '<a onclick="lidanRate.openDetail('+this.id+',\''+this.level+'\',\''+this.cus_all.cusid+'\',\'1\',\'cus_all\')">'+cus_all+'</a>';
										}
										if(cus_day_leader > 0){
												cus_day_leader = '<a onclick="lidanRate.openDetail('+this.id+',\''+this.level+'\',\''+this.cus_day_leader.cusid+'\',\'0\',\'cus_day\')">'+cus_day_leader+'</a>';
										}
										if(cus_month_leader>0){
												cus_month_leader = '<a onclick="lidanRate.openDetail('+this.id+',\''+this.level+'\',\''+this.cus_month_leader.cusid+'\',\'1\',\'cus_month\')">'+cus_month_leader+'</a>';
										}
								}

								lefttable += '<tr><td style="max-width:100px;" ><span class="ui-nowrap tdspan" style="margin-right:0;">'+name+'</span></td></tr>';
								tableColumn +='<tr class="'+trClass+'" >\
																								<td style="max-width:100px;min-width:100px;"><span class="ui-nowrap ui-whitespace tdspan">'+name+'</span></td>\
																								<td class="text-center" style="max-width:100px;">'+(team.leaderInfo[this.id]?team.leaderInfo[this.id]:'--')+'</td>\
																								<td class="text-center" style="min-width:110px;">'+cus_day+'</td>\
																								<td class="text-center" style="min-width:120px;">'+cus_day_leader+'</td>\
																								<td class="text-center" style="min-width:120px;">'+cus_month_leader+'</td>\
																								<td class="text-center" style="min-width:120px;">'+cus_month+'</td>\
																								<td class="text-center" style="min-width:120px;">'+cus_none_month+'</td>\
																								<td class="text-center" style="min-width:120px;">'+cus_all+'</td>\
																								<td class="text-center" style="min-width:80px;">'+lidan_Rate+'%</td></tr>';


						});
            tableColumn = '<tr class="odd" >\
                                            <td style="max-width:100px;min-width:100px;"><span class="ui-nowrap ui-whitespace tdspan"></span></td>\
																						<td class="text-center" style="max-width:100px;"> -- </td>\
                                            <td class="text-center" style="min-width:110px;">'+cus_day_total+'</td>\
																						<td class="text-center" style="min-width:120px;">'+cus_day_leader_total+'</td>\
																						<td class="text-center" style="min-width:120px;">'+cus_month_leader_total+'</td>\
                                            <td class="text-center" style="min-width:120px;">'+cus_month_total+'</td>\
                                            <td class="text-center" style="min-width:120px;">'+cus_none_month_total+'</td>\
                                            <td class="text-center" style="min-width:120px;">'+cus_all_total+'</td>\
                                            <td class="text-center" style="min-width:80px;">'+((cus_all_total == 0)?0: ((cus_month_total/cus_all_total)*100).toFixed(2))+'%</td></tr>'+tableColumn;
						$("#headertable tr").append(head);
						$("#lefttable tbody").html(lefttable);
						$("#bodytable tbody").html(tableColumn);
						this.scrollTable();
						this.setChart(cus_month_total, cus_none_month_total);
			},

			setChart: function(data1, data2){
					$('#lidanRate').highcharts({
							chart: {
									width:swidth,
									height:210,
							},
							title: {
									text: '',
							},
							plotOptions: {
									pie: {
											allowPointSelect: true,
											cursor: 'pointer',
											dataLabels: {
													enabled: false
											},
											showInLegend: true
									}
							},
							series: [{
									type: 'pie',
                  name: '客户数',
									data: [
											{
													name:'本月已理单客户数',
													y:data1,
													color:'#fb9128'
											},
											{
													name:'本月未理单客户数',
													y:data2,
													color:'#6acccb'
											}
									]
							}],
							exporting: {
									enabled: false
							},
							credits: {
									enabled: false
							}
					});
			},

			openDetail: function(orgid,level,cusid,is_group,type){
					openLink(oms_config.baseUrl + 'lidanRateList.html?orgid='+orgid+'&level='+level+'&cusid='+cusid+'&is_group='+is_group+'&type='+type,true);
			},
      sortEvent:function(){
    			$(".sort-class").click(function(event) {
    					// var a = lidanRate.action || 0;
    					// var l = parseInt(getUrlParam('level')) || lidanRate.action;
    					// var o = getUrlParam("orgid")=="undefined" ? "" : getUrlParam("orgid");
    					// var s = getUrlParam("issub")=="undefined" ? "" : getUrlParam("issub");
              var a = getUrlParam('action') || '';
              // if(a === '0'){
              //     a = lidanRate.action;
              // }
    					var l = parseInt(getUrlParam('level')) || '';
    					var o = getUrlParam("orgid")=="undefined" ? "1" : getUrlParam("orgid");
    					var s = getUrlParam("issub") || '';
              if(l < 4){
                  s = 1;
              }
              if(l){
                  a = '';
              }

    					var sort = $(this).data('sort');
    					var id = $(this).data('id');
    					var sort_method;
    					if(sort == 'none' || sort == 'asc'){
    						sort_method = 'desc';
    						$(this).data('sort','desc');
    						if($(this).find("i").hasClass('ui-icon-paixu')){
    								$(this).find("i").removeClass('ui-icon-paixu');
    								$(this).find("i").addClass('ui-icon-index_data_down');
    						}
    						if($(this).find("i").hasClass('ui-icon-index_data_up')){
    								$(this).find("i").removeClass('ui-icon-index_data_up');
    								$(this).find("i").addClass('ui-icon-index_data_down');
    						}
    					}
    					if(sort == 'desc'){
    						sort_method = 'asc';
    						$(this).data('sort','asc');
    						if($(this).find("i").hasClass('ui-icon-index_data_down')){
    								$(this).find("i").removeClass('ui-icon-index_data_down');
    								$(this).find("i").addClass('ui-icon-index_data_up');
    						}
    					}


    					$(this).siblings('.sort-class').children('i').removeClass('.ui-icon-index_data_down');
    					$(this).siblings('.sort-class').children('i').removeClass('.ui-icon-index_data_up');
    					$(this).siblings('.sort-class').children('i').removeClass('.ui-icon-paixu');
    					$(this).siblings('.sort-class').children('i').addClass('ui-icon-paixu');
    					$(this).siblings('.sort-class').data('sort','none');
    					lidanRate.sort = sort_method;
              lidanRate.order_by = id;

              if( l ){
    							lidanRate.getColumnData(a, s, l, o);
    					}else{
    							lidanRate.getColumnData(a, s);
    					}
    					event.stopPropagation();
    			});
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

			initData:function(){
					this.action = getUrlParam('action');
					this.level = getUrlParam('level');
					this.getlevel();
			},
			init : function(){
				//绑定初始化事件
				// this.getLeadersInfo();
				this.initEvent();
        this.sortEvent();
				this.initData();
				dd.ready(function () {
					dd.biz.navigation.setTitle({
							title: '理单率',
							onSuccess: function(result) {},
							onFail: function(err) {}
					});

					if (dd.ios) {

						dd.biz.navigation.setLeft({
							show: true,
							control: true,
							showIcon: true,
							text: '',
							onSuccess: function (result) {
								history.back(-1);
							},
							onFail: function (err) {
							}
						});
					} else {
						//omsapp-android-setLeft-visible:true
						dd.biz.navigation.setLeft({
							visible: true,
							control: true,
							showIcon: true,
							text: ''
						});
						$(document).off('backbutton');
						$(document).on('backbutton', function (e) {
							history.back(-1);
							e.preventDefault();
						});
					}
				})


			},

		};
		$.fn.lidanRate = function(settings){ $.extend(lidanRate, settings || {});};

		$.fn.ready(function() {
		    var loginApi = oms_config.apiUrl+oms_apiList.login;
		    new Login(oms_config.corpId,oms_config.baseUrl,loginApi,function(){
		        var omsUser = getCookie('omsUser');
		        if(omsUser){
		            lidanRate.user = JSON.parse(omsUser);
								lidanRate.init();
		        }
		    });
		});
