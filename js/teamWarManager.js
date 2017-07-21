var warManager = {
		user: {},
		user: JSON.parse(getCookie('omsUser')),
		postData: {},
		order: '',
		ordertype: '',
		type: getUrlParam('type'),

		initEvent: function(){
			var self = this;
			if(self.type==='war'){
					$('.war_rate_chart').show();
					$('#war_ladder_chart').hide();
					$('#war_ladder_toggle>button:first-child').attr('disabled','disabled');
			}else{
					$('.war_rate_chart').hide();
					$('#war_ladder_chart').show();
					$('#war_ladder_toggle>button:nth-child(2)').attr('disabled','disabled');
			}
			$('#war_ladder_toggle').on('click', 'button', function(){
	      var $this = $(this), type = $this.data('chart-type');
	      $this.siblings().attr('disabled', null);
	      $this.attr('disabled', 'disabled');
	      if(type=='war_rate'){
	        self.type = 'war';
	        window.location.href = self.setUrl('war');
	      }else{
	        self.type = 'ladder';
	        window.location.href = self.setUrl('ladder');
	      }
	    });

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

		setUrl:function(type){
	    var urlOld = window.location.href.split("?")[0];
			var urlNew = urlOld+"?type="+type;
	    return urlNew;
	  },

		getData:function (){
				$('#biao_data').hide();
				$("#biao_msg").show();
				var self = this;
				var apiUrl;
				//之前的信息置空
				self.postData.omsuid = self.user.id;
				self.postData.token = self.user.token;
				if(self.type==='war'){
					apiUrl = oms_config.apiUrl+oms_apiList.warManagerList;
					if(self.order){
							self.postData.order = self.order;
					}
					if(self.ordertype || self.ordertype === 0 ){
						self.postData.ordertype = self.ordertype;
					}
				}else{
					apiUrl = oms_config.apiUrl+oms_apiList.warGetLidanList;
				}


				$.ajax({
						type:"post",
						url:apiUrl,
						async:true,
						data:self.postData,
						dataType:'json',
						success:function(rs){
								$('#biao_msg').hide();
								if(rs.res==1){
										if(self.type==='war'){
											self.setTabContent(rs.data);
										}else{
											self.setLadderTable(rs.data);
										}
								}
						},
						error:function(e){
								console.log(JSON.stringify(e));
						}
				});
		},

		setTabContent: function(data){
				$('#manager-target').html('目标回款：'+data.target);
				$('#standard-leader').html(data.leaderpass+'个');
				$('#unstandard-leader').html(data.leaderfail+'个');
				$('#leader-rate').html(data.percent+'%');
				this.setTable(data);
		},
		setLadderTable: function(data){
			$('#biao_data').show();
			$('#war_tr').hide();
			$('#ladder_tr').show();
			$("#leader_title").show();
			var self = this;
	    var tableColumn="";
	    var lefttable='<tr><td style="max-width:100px;" class="fix-column"><span class="ui-nowrap tdspan">汇总</span></td></tr>';
	    var head = "";
	    var chartData = [];
	    var count1_total = 0, count2_total = 0, count3_total = 0, count4_total = 0, count5_total = 0, count6_total = 0, count7_total = 0;
			var list1_total = 0, list2_total = 0, list3_total = 0, list4_total = 0, list5_total = 0, list6_total = 0, list7_total = 0;
			var total_target = 0, total_assess = 0;
			if(data.length > 0){
	        if(data[0].level <=4){
	            self.level_mark = true;
	        }
	    }
	    $(data).each(function(i){
	        var trClass='odd';
	        if(i%2==0){
	            trClass='even';
	        }
	        var name=this.name;
	        var count1 = this.lidanData.count[1];
					var count2 = this.lidanData.count[2];
					var count3 = this.lidanData.count[3];
					var count4 = this.lidanData.count[4];
					var count5 = this.lidanData.count[5];
					var count6 = this.lidanData.count[6];
					var count7 = this.lidanData.count[7];
					count1_total = count1_total+count1;
					count2_total = count2_total+count2;
					count3_total = count3_total+count3;
					count4_total = count4_total+count4;
					count5_total = count5_total+count5;
					count6_total = count6_total+count6;
					count7_total = count7_total+count7;

					var list1 = this.lidanData.lists[1];
					var list2 = this.lidanData.lists[2];
					var list3 = this.lidanData.lists[3];
					var list4 = this.lidanData.lists[4];
					var list5 = this.lidanData.lists[5];
					var list6 = this.lidanData.lists[6];
					var list7 = this.lidanData.lists[7];
					list1_total = list1_total+list1;
					list2_total = list2_total+list2;
					list3_total = list3_total+list3;
					list4_total = list4_total+list4;
					list5_total = list5_total+list5;
					list6_total = list6_total+list6;
					list7_total = list7_total+list7;

					var row1 = list1+' / '+count1;
					var row2 = list2+' / '+count2;
					var row3 = list3+' / '+count3;
					var row4 = list4+' / '+count4;
					var row5 = list5+' / '+count5;
					var row6 = list6+' / '+count6;
					var row7 = list7+' / '+count7;
					total_target = total_target + parseInt(this.target?this.target:0);
					total_assess = total_assess + parseInt(this.assess?this.assess:0);
	        if(this.isclick){
						//已签已回
						row1 = '<a href="teamCusList.html?s=4&id=' + this.id + '&t=1&leader='+this.leader+'">'+row1+'</a>';
						//重点跟进
						row2 = '<a href="teamCusList.html?s=4&id=' + this.id + '&t=2&leader='+this.leader+'">'+row2+'</a>';
						//能签能回
						row3 = '<a href="teamCusList.html?s=4&id=' + this.id + '&t=3&leader='+this.leader+'">'+row3+'</a>';
						//冲击客户
						row4 = '<a href="teamCusList.html?s=4&id=' + this.id + '&t=4&leader='+this.leader+'">'+row4+'</a>';
						//已死客户
						row5 = '<a href="teamCusList.html?s=4&id=' + this.id + '&t=5&leader='+this.leader+'">'+row5+'</a>';
						//已签未回
						row6 = '<a href="teamCusList.html?s=4&id=' + this.id + '&t=6&leader='+this.leader+'">'+row6+'</a>';
						//推进中
						row7 = '<a href="teamCusList.html?s=4&id=' + this.id + '&t=17&leader='+this.leader+'">'+row7+'</a>';
	        }

	        lefttable += '<tr><td style="max-width:100px;" ><span class="ui-nowrap tdspan" style="margin-right:0;">'+name+'</span></td></tr>';
	        tableColumn +='<tr class="'+trClass+'" >\
	                                        <td style="max-width:100px;min-width:100px;"><span class="ui-nowrap ui-whitespace tdspan">'+name+'</span></td>\
	                                        <td class="text-center" style="max-width:100px;">'+(team.leaderInfo[this.id]?team.leaderInfo[this.id]:'--')+'</td>\
	                                        <td class="text-center">'+row1+'</td>\
	                                        <td class="text-center">'+row6+'</td>\
	                                        <td class="text-center">'+row2+'</td>\
	                                        <td class="text-center">'+row3+'</td>\
	                                        <td class="text-center">'+row4+'</td>\
	                                        <td class="text-center">'+row7+'</td>\
	                                        <td class="text-center">'+row5+'</td></tr>';


	    });
	    tableColumn = '<tr class="odd" >\
	                                    <td style="max-width:100px;min-width:100px;"><span class="ui-nowrap ui-whitespace tdspan"></span></td>\
	                                    <td class="text-center" style="max-width:100px;"> -- </td>\
	                                    <td class="text-center">'+list1_total+'/'+count1_total+'</td>\
	                                    <td class="text-center">'+list6_total+'/'+count6_total+'</td>\
	                                    <td class="text-center">'+list2_total+'/'+count2_total+'</td>\
	                                    <td class="text-center">'+list3_total+'/'+count3_total+'</td>\
	                                    <td class="text-center">'+list4_total+'/'+count4_total+'</td>\
	                                    <td class="text-center">'+list7_total+'/'+count7_total+'</td>\
	                                    <td class="text-center">'+list5_total+'/'+count5_total+'</td></tr>'+tableColumn;
			var totalChart_data = [list1_total, list6_total, list2_total, list3_total, list4_total, list7_total,list5_total]
			$("#headertable tr").append(head);
	    $("#lefttable tbody").html(lefttable);
	    $("#bodytable tbody").html(tableColumn);
			this.scrollTable();
			this.setLadderChart(totalChart_data, total_target, total_assess, '', 'money');
		},
		setLadderChart: function(vals,sumtargetmoney,sumassessmoney,title,leix){
			var colors = ['#50A5CF','#50A5CF','#FB9128','#FB9128','#FB9128','#FB9128','#EA5751'],
					categories = ['已签已回','已签未回','重点跟进','能签能回','冲击客户','推进中','已死客户'],
					titlename = title+'销售阶梯图';
			var valstotal = 0, valseries = [], val, boxseries = [], boxpx = 0, boxpy = 0;
			for(var i=0;i<vals.length;i++){
					val = +vals[i];
					valstotal += val;
					valseries.push({
							name: categories[i],
							y: val,
							color: colors[i]
					});
					if(i==0){
							boxpx = 0.5;
							boxpy = val;
					}else{
							boxpx += 1;
							boxpy += val;
					}
					boxseries.push([
							[-1,boxpy],
							[boxpx,boxpy]
					]);
					boxseries.push([
							[boxpx,boxpy],
							[boxpx,0]
					]);
			}
			var seriesOptions = [];
			seriesOptions.push(
					{
							name: titlename,
							color: Highcharts.getOptions().colors[3],
							pointPadding: 0,
							type: 'waterfall',
							data: valseries,
							dataLabels: {
									enabled: true,
									style: {
											color: '#FFFFFF',
											fontWeight: 'bold',
											textShadow: '0px 0px 3px black'
									}
							},
							zIndex: 99
					}
			);
			if(sumtargetmoney){
					seriesOptions.push({
							type: 'line',
							name: '本月目标值',
							dashStyle: 'dash',
							color: '#3cb67f',
							//visible : false,
							data: [
									[-1, +sumtargetmoney],
									[5.5, +sumtargetmoney]
							],
							marker: {
									enabled: false
							},
							enableMouseTracking: false
					});
			}
			if(sumassessmoney){
					seriesOptions.push({
							type: 'line',
							name: '本月考核值',
							dashStyle: 'dash',
							color: '#ea5751',
							//visible : false,
							data: [
									[-1, sumassessmoney],
									[5.5, sumassessmoney]
							],
							marker: {
									enabled: false
							},
							enableMouseTracking: false
					});
			}
			for(var i=1;i<boxseries.length;i++){//[0]不需要处理dashbox
					var lines = boxseries[i], lgroup = ~~(i/2);
					if(lgroup==1 || lgroup==5){//选择性展示 topLine
							seriesOptions.push({
									type: 'line',
									name: null,
									dashStyle: 'dash',
									lineWidth: 1,
									color: '#ccccca',
									showInLegend: false,
									data: lines,
									dataLabels: {
											align: 'right',
											enabled: (lines[0][1] == lines[1][1])//point.y 相同时显示 dataLabel
									},
									marker: {
											enabled: false
									},
									enableMouseTracking: false,
									zIndex: 1
							});
					}
			}
			$('#war_ladder_chart').highcharts({
					chart: {
							zoomType: 'xy',
							width: swidth,
							height: 210,
					},
					title: {
							text: null
					},
					xAxis: {
							type: 'category',
							tickInterval: 0,
							min: 0,
							max: 6
					},
					yAxis: [{
							title: {
									text: ''
							},
							min: 0,
							ceiling: valstotal,
							gridLineWidth: 0
					}, {
							title: {
									text: '',
									style: {
											color: '#4572A7'
									}
							},
							labels: {
									format: '{value} mm',
									style: {
											color: '#4572A7'
									}
							},
							opposite: true
					}],
					legend: {
							enabled: true
					},
					tooltip: {
							formatter: function() {
									if(leix=='customers'){
											return this.key+':<b>'+this.y+'个</b>';
									}else{
											return this.key+':<b>¥'+this.y+'元</b>';
									}
							}
					},
					plotOptions: {
							series: {
									groupPadding: 0,
									pointPadding: 0
							},
							line: {
									dataLabels: {
											enabled: true
									},
									enableMouseTracking: false
							},
							waterfall: {
									borderWidth: 0
							}
					},
					credits: {
							enabled: false
					},
					exporting: {
							enabled: false
					},
					series: seriesOptions
			});

		},
		setTable: function(data){
					$('#biao_data').show();
					$('#war_tr').show();
					$('#ladder_tr').hide();
					var tableColumn="";
					var lefttable='';
					var head = "";
					var tableData = data.list;
					$(tableData).each(function(i){
							var trClass='odd';
							if(i%2==0){
									trClass='even';
							}
							var war=this.war;
							var leader = this.leader;
							var return_money = this.return;
							var file = this.file;
							var call = this.call;
							var visit = this.visit;
							var helpvisit = this.helpvisit;
							var sihai = this.sihai;
							lefttable += '<tr><td style="max-width:100px;" ><span class="ui-nowrap tdspan" style="margin-right:0;">'+war+'</span></td></tr>';
							tableColumn +='<tr class="'+trClass+'" >\
														<td style="max-width:100px;min-width:100px;"><span class="ui-nowrap ui-whitespace tdspan">'+war+'</span></td>\
														<td class="text-center" style="max-width:100px; min-width: 100px">'+leader+'</td>\
														<td class="text-center" style="min-width:80px;">'+return_money+'</td>\
														<td class="text-center" style="min-width:80px;">'+sihai+'</td>\
														<td class="text-center" style="min-width:80px;">'+file+'</td>\
														<td class="text-center" style="min-width:80px;">'+call+'</td>\
														<td class="text-center" style="min-width:80px;">'+visit+'</td>\
														<td class="text-center" style="min-width:80px;">'+helpvisit+'</td></tr>';
					});

					$("#headertable tr").append(head);
					$("#lefttable tbody").html(lefttable);
					$("#bodytable tbody").html(tableColumn);
					this.scrollTable();
		},
		sortEvent:function(){
				var self = this;
				$(".sort-class").click(function(event) {
						var sort = $(this).data('sort');
						var id = $(this).data('id');
						var sort_method;
						if(sort == 'none' || sort == 'asc'){
							sort_method = '0';
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
							sort_method = '1';
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
						self.order = sort_method;
						self.ordertype = id;
						self.getData();
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

		init : function(){
			//绑定初始化事件
			// this.getLeadersInfo();
			this.initEvent();
			this.sortEvent();
			this.getData();
			dd.ready(function () {
				dd.biz.navigation.setTitle({
						title: '新一团战报',
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
	$.fn.warManager = function(settings){ $.extend(warManager, settings || {});};

	$.fn.ready(function() {
			var loginApi = oms_config.apiUrl+oms_apiList.login;
			new Login(oms_config.corpId,oms_config.baseUrl,loginApi,function(){
					var omsUser = getCookie('omsUser');
					if(omsUser){
							warManager.user = JSON.parse(omsUser);
							warManager.init();
					}
			});
	});
