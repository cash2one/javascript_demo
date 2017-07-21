	var diagnose = {
			user: {},
			user: JSON.parse(getCookie('omsUser')),
			postData: {},
			privilege: null,
			action: getUrlParam('action') || '',
			type: getUrlParam('type') || '',
			orgid: getUrlParam('orgid') || '',
			colors: ['#FF5D40','#FFC833','#31D696'],
			selectedDate: getUrlParam('d') || '',
			rangeConf: null,
			avgRangeConf: null,

			setUrl:function(action,type,orgid){
					var urlOld = window.location.href.split("?")[0];
					var urlNew = urlOld+"?action="+action+"&type="+type+"&orgid="+orgid+"&d="+diagnose.selectedDate;
					return urlNew;
			},
			getPercentPosition: function(v,k){
					var self = this;
					var transfered_val;
					_.forEach(self.avgRangeConf,function(val, key){
							if(val.work_type == k){
									if(v <= val.red){
											transfered_val = (((100*v)/(3*val.red)).toFixed(2));
									}
									if(v > val.red && v <= val.yellow){
											transfered_val = ((((100*(v-val.red))/(3*(val.yellow-val.red)))+(100/3)).toFixed(2));
									}
									if(v > val.yellow){
											var max = (val.yellow * 1.2).toFixed(2);
											if(v > max){
													max = (v*1.2).toFixed(2);
											}
											// if( v > max){
											// 		transfered_val = 100;
											// }else{
											//
											// }
											transfered_val = ((((100*(v-val.yellow))/(3*(max-val.yellow)))+(200/3)).toFixed(2));
									}
								}
					});
					return transfered_val;
			},
			getInitData:function(){
					var self = this;
					$.ajax({
							type:"post",
							url:oms_config.apiUrl+oms_apiList.getLightConf,
							async:true,
							data:{omsuid: self.user.id, token: self.user.token},
							dataType:'json',
							success:function(rs){
									if(rs.res==1){
											self.rangeConf = rs.data;
											self.getAvgRangeConf();
									}
							},
							error:function(e){
									console.log(JSON.stringify(e));
							}
					});

					// this.getData();
			},
			getAvgRangeConf: function(){
					var self = this;
					$.ajax({
							type:"post",
							url:oms_config.apiUrl+oms_apiList.getLightAvgConf,
							async:true,
							data:{omsuid: self.user.id, token: self.user.token},
							dataType:'json',
							success:function(rs){
									if(rs.res==1){
											self.avgRangeConf = rs.data;
											self.getData();
									}
							},
							error:function(e){
									console.log(JSON.stringify(e));
							}
					});
			},
			getData:function (){
					$('#biao_data').hide();
					$("#biao_msg").show();
					var self = this;
					var postData = {};
					if(self.action == 0){
							postData.entity_id = '';
							postData.entity_type = 'user';
					}else{
							postData.entity_type = self.type;
							postData.entity_id = self.orgid;
					}
					if(self.selectedDate){
							postData.date = self.selectedDate;
					}
					postData.omsuid = self.user.id;
					postData.token = self.user.token;

					$.ajax({
							type:"post",
							url:oms_config.apiUrl+oms_apiList.getDiagRes,
							async:true,
							data:postData,
							dataType:'json',
							success:function(rs){
									$('#biao_msg').hide();
									if(rs.res == 1){
											self.initFooter(rs.data.entity_info.entity_name);
											self.resetTitle(rs.data.entity_info.entity_name);
											self.setChart(rs.data);
									}
							},
							error:function(e){
									console.log(JSON.stringify(e));
							}
					});
			},

			setTips: function(data){
					$('.newsTipBlock').show();
					$('#cusInfo_newstips').html('<span class="cusInfo-newstips-info">当前数据更新于'+data.data_update_time+'，数据范围从'+data.data_span_time);
			},

			setChart: function(data){
					var self = this;
					var dataSet = [];
					self.setTips(data);
					var new_file_cnt = 0, new_kp_cnt = 0, new_call_cnt = 0, new_visit_cnt = 0, new_lidan_rate = 0;
					//资料量
					new_file_cnt = self.getPercentPosition(data.work_avg.file_cnt,1);
					dataSet.push({y:parseFloat(new_file_cnt), color: self.colors[parseInt(data.file_light)-1]});
					//绕KP
					new_kp_cnt = self.getPercentPosition(data.work_avg.kp_cnt,2);
					dataSet.push({y:parseFloat(new_kp_cnt), color: self.colors[parseInt(data.kp_light)-1]});
					//电话量
					new_call_cnt = self.getPercentPosition(data.work_avg.call_cnt,3);
					dataSet.push({y:parseFloat(new_call_cnt), color: self.colors[parseInt(data.call_light)-1]});
					//拜访量
					new_visit_cnt = self.getPercentPosition(data.work_avg.visit_cnt,4);
					dataSet.push({y:parseFloat(new_visit_cnt), color: self.colors[parseInt(data.visit_light)-1]});
					//理单率
					new_lidan_rate = self.getPercentPosition(data.work_avg.lidan_rate,5);
					// console.log(new_lidan_rate);
					dataSet.push({y:parseFloat(new_lidan_rate), color: self.colors[parseInt(data.lidan_light)-1]});
					console.log(dataSet);
					var categories = [{k:0,v:'资料量'}, {k:1, v:'绕KP量'}, {k:2, v:'电话量'}, {k:3, v:'拜访量'},{k:4, v:'理单率'}];
					$('#diagnoseChart').highcharts({
							chart: {
									polar: true,
									type: 'scatter',
									// width:swidth,
									height:244,
									marginTop: 40,
									backgroundColor: '#fdfdfd',
							},
							title: {
									text: null,
							},
							xAxis: {
			            categories: categories,
									gridLineColor: '#eee',
									labels: {
										style:{
												color:'#333',
												font: '12px',
												textAlign:'center'
										},

										useHTML: true,
										formatter: function(){
												var color = '';
												var newVal;
												var htmlTpl = '';
												var data_avg;
												var selfer = this;
												_.forEach(diagnose.rangeConf, function(val,k){
														selfer.value.k == 0 ? data_avg=data.work_avg.file_cnt : 0;
														selfer.value.k == 1 ? data_avg=data.work_avg.kp_cnt : 0;
														selfer.value.k == 2 ? data_avg=data.work_avg.call_cnt : 0;
														selfer.value.k == 3 ? data_avg=data.work_avg.visit_cnt : 0;
														selfer.value.k == 4 ? data_avg=data.work_avg.lidan_rate : 0;
														if(selfer.value.k < 4){
																if(val.work_type == (selfer.value.k+1)){
																		_.forEach(diagnose.avgRangeConf, function(val_avg,k){
																				if(val_avg.work_type == (selfer.value.k+1)){
																						htmlTpl = '<div class="tooltipBlock" id="tooltip_content'+selfer.value.k+'"><div class="tool-tip-line">均值：'+data_avg+'（本月在职天数/人数）</div>'+
																											'<div class="tool-tip-line"><span class="red-circle"></span><div class="tooltip-row">&nbsp; 0 ~ '+val_avg.red+'（天/人）</div><span>&nbsp;0 ~ '+val.red+'（月/人）</span></div>'+
																											'<div class="tool-tip-line"><span class="yellow-circle"></span><div class="tooltip-row">&nbsp;'+parseFloat(val_avg.red+0.1).toFixed(1)+' ~ '+val_avg.yellow+'（天/人）</div><span>&nbsp;'+(parseInt(val.red)+1)+' ~ '+val.yellow+'（月/人）</span></div>'+
																											'<div class="tool-tip-line"><span class="green-circle"></span><div class="tooltip-row">&nbsp; ≥ '+parseFloat(val_avg.yellow+0.1).toFixed(1)+'（天/人）</div><span>&nbsp;≥ '+(parseInt(val.yellow)+1)+'（月/人）</span></div>'+
																											'</div>';
																				}
																		})

																}
														}else{
																if(val.work_type == (selfer.value.k+1)){
																	htmlTpl = '<div class="tooltipBlock" id="tooltip_content'+selfer.value.k+'"><div class="tool-tip-line">均值：'+data_avg+'%</div>'+
																						'<div class="tool-tip-line"><span class="red-circle"></span><span>&nbsp; 0 ~ '+val.red+'%</span></div>'+
																						'<div class="tool-tip-line"><span class="yellow-circle"></span><span>&nbsp;'+(parseInt(val.red)+1)+'% ~ '+val.yellow+'%</span></div>'+
																						'<div class="tool-tip-line"><span class="green-circle"></span><span>&nbsp; ≥ '+(parseInt(val.yellow)+1)+'%</span></div>'+
																						'</div>';
																}
														}

												});

												$('#tooltip-section').append(htmlTpl);

												if(this.value.k == 0){
														newVal = data.file_cnt;
														color = self.colors[parseInt(data.file_light)-1];
												}
												if(this.value.k == 1){
														newVal = data.kp_cnt;
														color = self.colors[parseInt(data.kp_light)-1];
												}
												if(this.value.k == 2){
														newVal = data.call_cnt;
														color = self.colors[parseInt(data.call_light)-1];
												}
												if(this.value.k == 3){
														newVal = data.visit_cnt;
														color = self.colors[parseInt(data.visit_light)-1];
												}
												if(this.value.k == 4){
														newVal = data.lidan_rate;
														color = self.colors[parseInt(data.lidan_light)-1];
												}
												if(this.value.k < 4){
													return '<div class="hastip" data-tooltip-content="#tooltip_content'+this.value.k+'" data-index="'+this.value.k+'">'+'<span style="line-height: 1;font-weight:bold;font-size:24px;color:'+color+'">'+newVal+'</span><br/><span>'+this.value.v+'</span></div>';
												}
												return '<div class="hastip" data-tooltip-content="#tooltip_content'+this.value.k+'" data-index="'+this.value.k+'"><span style="line-height:1;font-weight:bold;font-size:24px;color:'+color+'">'+newVal+'%</span><br/><span>'+this.value.v+'</span></div>';

										}
									},

			            tickmarkPlacement: 'on',
			            lineWidth: 0
			        },
							yAxis: {
			            gridLineInterpolation: 'polygon',
			            lineWidth: 0,
			            min: 0,
									gridLineColor: '#eee',
									labels:{
											enabled: false,
									},
									tickPositioner: function(min, max){
			                return [0, 33.33, 66.66,100];
			            },
									plotBands: [{
					            innerRadius: 0,
					            from: 0,
					            to: 33.33,
					            color: "#f2f2f1"
					        },{
					            innerRadius: 0,
					            from: 33.34,
					            to: 66.66,
					            color: "#f9f8f8"
					        },{
					            innerRadius: 0,
					            from: 66.67,
					            to: 100,
					            color: "#fdfdfd"
					        }]

			        },

							plotOptions: {
									scatter: {
											marker:{
													radius: 3
											},
											allowPointSelect: false,
											enableMouseTracking: false,
											cursor: 'pointer',
											dataLabels: {
													enabled: false
											},
											showInLegend: true
									},
									series: {
			                animation: {
			                    duration: 2000
			                }
			            }
							},
							series: [{
									showInLegend: false,
									color: '#eee',
									name: '',
									data:dataSet,
									pointPlacement: 'on',
							}],
							exporting: {
									enabled: false
							},
							credits: {
									enabled: false
							}
					},function(chart){
							var len = chart.xAxis[0].ticks;
							$.each(chart.xAxis[0].ticks, function(i, tick){
									if(i>=0 && i<5){
											if(i == 0){
													tick.label.attr({y:tick.label.xy.y-10});
											}
											if(i == 1){
													tick.label.attr({y:tick.label.xy.y+5});
											}
											if(i == 2){
													tick.label.attr({y:tick.label.xy.y+10,x:tick.label.xy.x-20});
											}
											if(i == 3){
													tick.label.attr({y:tick.label.xy.y+10,x:tick.label.xy.x+20});
											}
											if(i == 4){
													tick.label.attr({y:tick.label.xy.y+5});
											}
									}
							});
					});

					self.renderToolTip(data);
					self.getTableData();
					self.setDiagnoseResult(data);
					$('#report_block').show();
					if(data.entity_info.daily_show == 1){
							self.setReport();
					}
					if(data.entity_info.comment_show == 1){
							self.setComment();
					}
			},
			renderToolTip: function(data){
					$('.hastip').tooltipster({
						theme: 'tooltipster-borderless',
				   delay: 100,
				   trigger: 'click',
					 contentCloning: true
					});
			},
			setDiagnoseResult: function(data){
					$('.diag_blck').show();
					var textWidth = document.getElementById("diag_result").offsetWidth;
					if(data.diag_result.length > 0){
							$('#diag_result').html(data.diag_result);
							var dataWidth = getTextWidth($("#diag_result").text(),$("#diag_result").css("font"));
							if(dataWidth > textWidth*2){
									$('#diag_result_more').show();
							}else{
									$('#diag_result_more').hide();
									document.getElementById('diag_result').style.cssText = 'padding-bottom:20px';
							}

					}else{
							$('#diag_result_block').hide();
					}

					if(data.diag_sugg.length > 0){
							$('#diag_sugg').html(data.diag_sugg);
							var dataWidth = getTextWidth($("#diag_sugg").text(),$("#diag_sugg").css("font"));
							if(dataWidth > textWidth*2){
									$('#diag_sugg_more').show();
							}else {
								document.getElementById('diag_sugg').style.cssText = 'padding-bottom:20px';
							}
							// $('#diag_sugg_more').show();
					}else{
							$('#diag_sugg_result').hide();
					}

					if(data.diag_result.length == 0 && data.diag_sugg.length == 0){
							$('#diag_blck').hide();
					}
			},

			diagnoseEventListener: function(){
					var self = this;
					$('#diag_result_more').click(function(){
							if($(this).data('type') == 'show'){
									$('#diag_result').addClass('diagnose-content-all');
									$('#diag_result').removeClass('diagnose-content');
									$('#diag_result_more_text').text('隐藏全部');
									$('#diag_result_more_icon').removeClass('ui-icon-list_arrow_down');
									$('#diag_result_more_icon').addClass('ui-icon-list_arrow_up');
									$(this).data('type','hide');
							}else{
									$('#diag_result').removeClass('diagnose-content-all');
									$('#diag_result').addClass('diagnose-content');
									$('#diag_result_more_text').text('显示全部');
									$('#diag_result_more_icon').addClass('ui-icon-list_arrow_down');
									$('#diag_result_more_icon').removeClass('ui-icon-list_arrow_up');
									$(this).data('type','show');
							}
					});
					$('#diag_sugg_more').click(function(){
							if($(this).data('type') == 'show'){
									$('#diag_sugg').addClass('diagnose-content-all');
									$('#diag_sugg').removeClass('diagnose-content');
									$('#diag_sugg_more_text').text('隐藏全部');
									$('#diag_sugg_more_icon').removeClass('ui-icon-list_arrow_down');
									$('#diag_sugg_more_icon').addClass('ui-icon-list_arrow_up');
									$(this).data('type','hide');
							}else{
									$('#report_con').removeClass('diagnose-content-all');
									$('#diag_sugg').addClass('diagnose-content');
									$('#diag_sugg_more_text').text('显示全部');
									$('#diag_sugg_more_icon').addClass('ui-icon-list_arrow_down');
									$('#diag_sugg_more_icon').removeClass('ui-icon-list_arrow_up');
									$(this).data('type','show');
							}
					});

					$('#comment_more').click(function(){
							if($(this).data('type') == 'show'){
									$('#comment_content').addClass('report-content-all');
									$('#comment_content').removeClass('report-content');
									$('#comment_more_text').text('隐藏全部');
									$('#comment_more_icon').removeClass('ui-icon-list_arrow_down');
									$('#comment_more_icon').addClass('ui-icon-list_arrow_up');
									$('.comment_more_content').show();
									$(this).data('type','hide');
							}else{
									$('#comment_content').removeClass('report-content-all');
									$('#comment_content').addClass('report-content');
									$('#comment_more_text').text('显示全部');
									$('#comment_more_icon').addClass('ui-icon-list_arrow_down');
									$('#comment_more_icon').removeClass('ui-icon-list_arrow_up');
									$('.comment_more_content').hide();
									$(this).data('type','show');
							}
					});
			},
			checkMore:function(obj){
					//var action = ($("#toolBar>li.atcive").index()+1);
					var type = $(obj).attr("data-type");
					var id = $(obj).attr("data-id");
					// var issub = $(obj).attr("data-issub");
					window.location.href = this.setUrl(1, type, id);
			},
			getTableData: function(){
					var self = this;
					var postData = {};
					if(self.action == 0){
							postData.entity_id = '';
							postData.entity_type = 'user';
					}else{
							postData.entity_type = self.type;
							postData.entity_id = self.orgid;
					}

					if(self.selectedDate){
							postData.date = self.selectedDate;
					}
					postData.omsuid = self.user.id;
					postData.token = self.user.token;
					$.ajax({
							type:"post",
							url:oms_config.apiUrl+oms_apiList.getDiagTable,
							async:true,
							data:postData,
							dataType:'json',
							success:function(rs){
									$('#biao_msg').hide();
									if(rs.res == 1){
											self.setTable(rs.data);
											$("#lefttable tbody a").bind('click', function(){
													self.checkMore(this);
											});
									}
							},
							error:function(e){
									console.log(JSON.stringify(e));
							}
					});
			},

			setTable: function(data){
						var self = this;
						$('#biao_data').show();
						$('#biao_msg').hide();

						var tableColumn="";
						var lefttable = "";
						// if(data[0].entity_type == 'org'){
						// 	lefttable='<tr><td style="max-width:100px;background-color: #fbfbfb; color: #999" class="fix-column"><span class="ui-nowrap tdspan">'+data[0].entity_name+'</span></td></tr>';
						// }
						var head = "";
						// console.log(tableData);
            var file_total = 0, kp_total = 0, call_total = 0,
								visit_total = 0, lidan_cnt_total = 0, wait_lidan_cnt_total = 0,
								order_total = 0, return_money_total = 0, sihai_total = 0;
						$(data).each(function(i){
								var trClass='odd';
								if(i%2==0){
										trClass='even';
								}
								var entity_name=this.entity_name;
								var file_cnt = this.file_cnt;
								var kp_cnt = this.kp_cnt;
								var call_cnt = this.call_cnt;
								var visit_cnt = this.visit_cnt;
								var lidan_rate = this.lidan_rate;
								var lidan_cnt = this.lidan_cnt;
								var wait_lidan_cnt = this.wait_lidan_cnt;
								var order_cnt = this.order_cnt;
								var return_money = this.return_money;
								var sihai_cnt = this.sihai_cnt;

								if(this.can_click != -1){
										entity_name='<a data-id="'+this.entity_id+'" data-type="'+this.entity_type+'">'+entity_name+'</a>';
										lefttable += '<tr><td style="max-width:100px;" ><span class="ui-nowrap tdspan" style="margin-right:0;">'+entity_name+'</span></td></tr>';
								}else {
										lefttable += '<tr><td style="max-width:100px;background-color: #fbfbfb; color: #999" ><span class="ui-nowrap tdspan" style="margin-right:0;">'+entity_name+'</span></td></tr>';
								}
								// if(this.entity_type == 'org' && i == 0){
								// 		entity_name='<a data-id="'+this.entity_id+'" data-type="'+this.entity_type+'">'+entity_name+'</a>';
								//
								// 		lefttable += '<tr><td style="max-width:100px;background-color: #fbfbfb; color: #999" ><span class="ui-nowrap tdspan" style="margin-right:0;">'+entity_name+'</span></td></tr>';
								//
								// }else {
								// 		entity_name='<a data-id="'+this.entity_id+'" data-type="'+this.entity_type+'">'+entity_name+'</a>';
								// 		lefttable += '<tr><td style="max-width:100px;" ><span class="ui-nowrap tdspan" style="margin-right:0;">'+entity_name+'</span></td></tr>';
								// }
								var light_type;

								tableColumn +='<tr class="'+trClass+'" >\
																								<td style="max-width:100px;min-width:100px;"><span class="ui-nowrap ui-whitespace tdspan">'+entity_name+'</span></td>\
																								<td class="text-center" style="min-width:86px; padding-right:14px;"><div style="position: relative">'+self.defaultValue(file_cnt)+'<span class="table-light '+self.lightColorSelector(this.file_light)+'"></span></div></td>\
																								<td class="text-center" style="min-width:86px; padding-right:14px;"><div style="position: relative">'+self.defaultValue(kp_cnt)+'<span class="table-light '+self.lightColorSelector(this.kp_light)+'"></span></div></td>\
																								<td class="text-center" style="min-width:86px; padding-right:14px;"><div style="position: relative">'+self.defaultValue(call_cnt)+'<span class="table-light '+self.lightColorSelector(this.call_light)+'"></span></div></td>\
																								<td class="text-center" style="min-width:86px; padding-right:14px;"><div style="position: relative">'+self.defaultValue(visit_cnt)+'<span class="table-light '+self.lightColorSelector(this.visit_light)+'"></span></div></td>\
																								<td class="text-center" style="min-width:86px; padding-right:14px;"><div style="position: relative">'+self.defaultValue(lidan_rate)+'%<span class="table-light '+self.lightColorSelector(this.lidan_light)+'"></span></div></td>\
																								<td class="text-center" style="min-width:86px; padding-right:14px;"><div style="position: relative">'+self.defaultValue(lidan_cnt)+'/'+self.defaultValue(wait_lidan_cnt)+'</div></td>\
																								<td class="text-center" style="min-width:86px; padding-right:14px;"><div style="position: relative">'+self.defaultValue(order_cnt)+'<span class="table-light '+self.lightColorSelector(this.order_light)+'"></span></div></td>\
																								<td class="text-center" style="min-width:86px; padding-right:14px;"><div style="position: relative">'+self.defaultValue(return_money)+'</td>\
																								<td class="text-center" style="min-width:86px; padding-right:14px;"><div style="position: relative">'+self.defaultValue(sihai_cnt)+'<span class="table-light '+self.lightColorSelector(this.sihai_light)+'"></span></div></td></tr>';


						});

						$("#headertable tr").append(head);
						$("#lefttable tbody").html(lefttable);
						$("#bodytable tbody").html(tableColumn);
						this.scrollTable();
						// this.setChart(cus_month_total, cus_none_month_total);
			},

			defaultValue: function(data){
					if(!data){
							return 0;
					}
					return data;
			},

			lightColorSelector: function(type){
					if(type == 1){
							return 'red-light';
					}else if(type == 2){
							return 'yellow-light';
					}else if(type == 3){
							return 'green-light';
					}else{
							return '';
					}
			},
			//渲染日报
			setReport: function(){
					var self = this;
					var postData = {};
					if(self.action == 0){
							postData.entity_id = '';
							postData.entity_type = 'user';
					}else{
							postData.entity_type = self.type;
							postData.entity_id = self.orgid;
					}
					postData.omsuid = self.user.id;
					postData.token = self.user.token;

					$.ajax({
							type:"post",
							url:oms_config.apiUrl+oms_apiList.getDayReports,
							async:true,
							data:postData,
							dataType:'json',
							success:function(rs){
									if(rs.res==1){
											$('#daily_report').show();
											$('#dailySummary').click(function(){
													openLink(oms_config.baseUrl + 'dailyReport.html');
											});
											if(_.isEmpty(rs.data)){
													$('#report_content').text('暂无日报！');
											}else{
													$('#report_name').text(rs.data.c_userrealname);
													$('#report_time').text(rs.data.c_time);
													$('#report_content').text(rs.data.di_todaysummary);
											}

									}
							},
							error:function(e){
									console.log(JSON.stringify(e));
							}
					});


					// var report_data = {report:'约见客户，全月拜访，日报数据数据数据数据数据诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果', time:'2016-10-16 23:27',name:'李伟'};

			},
			//渲染评论
			setComment: function(){
					var self = this;
					var postData = {};
					if(self.action == 0){
							postData.entity_id = '';
							postData.entity_type = 'user';
					}else{
							postData.entity_type = self.type;
							postData.entity_id = self.orgid;
					}
					postData.omsuid = self.user.id;
					postData.token = self.user.token;
					var htmlTpl = '';
					$.ajax({
							type:"post",
							url:oms_config.apiUrl+oms_apiList.getTodayComments,
							async:true,
							data:postData,
							dataType:'json',
							success:function(rs){
									if(rs.res==1){
											if(rs.data.length > 0){
													$('#comment_report').show();
													if(rs.data.length > 1){
															$('#comment_more').show();
													}
													_.forEach(rs.data,function(v,k){
															if(k == 0){
																	if(rs.data.length > 1){
																		htmlTpl += '<div><div class="ui-nowrap report-title"><span class="report-comment-span">点评</span>&nbsp;'+v.username+'</div>'+
																							'<div class="report-time">'+v.ctime+'</div>'+
																							'<div class="report-content" id="comment_content">'+ v.content +  '</div></div>';
																	}else{
																		htmlTpl += '<div style="padding-bottom: 20px;"><div class="ui-nowrap report-title"><span class="report-comment-span">点评</span>&nbsp;'+v.username+'</div>'+
																							'<div class="report-time">'+v.ctime+'</div>'+
																							'<div class="report-content" id="comment_content">'+ v.content +  '</div></div>'
																	}

															}else{
																htmlTpl += '<div class="ui-border-t comment_more_content" style="display:none; margin-top: 20px;"><div class="ui-nowrap report-title"><span class="report-comment-span">点评</span>&nbsp;'+v.username+'</div>'+
																					'<div class="report-time">'+v.ctime+'</div>'+

																					'<div class="report-content-all">'+ v.content +  '</div></div>'
															}
													})
													$('#comment_more').before(htmlTpl);
											}
									}
							},
							error:function(e){
									console.log(JSON.stringify(e));
							}
					});

					// $('#comment_report').show();
					// var comment_data = [{comment:'约见客户，全月拜访，日报数据数据数据数据数据诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果', time:'2016-10-16 23:27',name:'李伟1'},
					// 										{comment:'约见客户，全月拜访，日报数据数据数据数据数据诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果', time:'2016-10-16 23:27',name:'李伟2'},
					// 									{comment:'约见客户，全月拜访，日报数据数据数据数据数据诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果诊断结果', time:'2016-10-16 23:27',name:'李伟3'}]
					// var htmlTpl = '';


					// $('#comment_more').before(htmlTpl);

			},
			openDetail: function(orgid,level,cusid,is_group,type){
					openLink(oms_config.baseUrl + 'lidanRateList.html?orgid='+orgid+'&level='+level+'&cusid='+cusid+'&is_group='+is_group+'&type='+type,true);
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

			initPrivilege : function(){
					var title;
					if(this.user.role == 5){
							if(this.user.isCityLeader == 1){
									title = '-城市';
									this.privilege = 2;
							}else{
									title = '-全国';
									this.privilege = 1;
							}
					}else{
							if(this.user.role == 4 || this.user.role == 1){
									title = '-战区';
									this.privilege = 3;
							}else{
									title = '';
									this.privilege = 4;
							}
					}
					this.initTitle();
					this.initTab();
					// this.initFooter();
			},
			initTitle: function(){
					dd.ready(function () {
							dd.biz.navigation.setTitle({
									title: '工作诊断',
									onSuccess: function(result) {},
									onFail: function(err) {}
							});
					})
			},
			resetTitle: function(data){
					dd.ready(function () {
							dd.biz.navigation.setTitle({
									title: '工作诊断 - '+data,
									onSuccess: function(result) {},
									onFail: function(err) {}
							});
					})
			},
			initTab: function(){
				var self = this;
				dd.ready(function () {
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
				var defaultValue;
				if(diagnose.selectedDate){
						defaultValue = diagnose.selectedDate;
				}else{
						defaultValue = new Date().getFullYear() + '-' + (new Date().getMonth()+1) + '-' + (new Date().getDate());
				}
				dd.ready(function() {
	    	// 添加 切换 按钮
	        dd.biz.navigation.setRight({
	            show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
	            control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
	            text: '筛选时间',//控制显示文本，空字符串表示显示默认文本
	            onSuccess : function(result) {
	                dd.biz.util.datepicker({
										  format: 'yyyy-MM-dd',
										  value: defaultValue,
										  onSuccess: function(result) {
													console.log(result.value);
													self.selectedDate = result.value;
													self.getInitData();
										  }
									});
	            },
	            onFail : function(err) {}
	        });
	    });
			},
			initFooter: function(data){
				var self = this;
				if(this.privilege == 3){
						$("#main-foot").show();
						$("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="footItem" id="dailyReport"><div class="footer-font">&nbsp;写日报</div></li>'+ '</ul>');
						$('#dailyReport').click(function(){
								openLink(oms_config.baseUrl + 'dailyWrite.html?closeType=close');
						})
				}
				else if(this.privilege < 3){
						if(data == '全国')
						{
								$("#main-foot").hide();
						}else{
								$("#main-foot").show();
						}

						$("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#fff;">' + '<li class="footItem" id="writeComment"><div class="footer-font"><i class="ui-icon-list_edit"></i><span class="footItemText">点评</span></div></li>'+ '</ul>');
						$('#writeComment').click(function(){
								openLink(oms_config.baseUrl + 'diagnoseComment.html?type='+self.type+'&id='+self.orgid);
						})
				}else{
						$("#main-foot").hide();
				}
			},
			init : function(){
				this.initPrivilege();
				this.getInitData();
				this.diagnoseEventListener();
			},
		};

		$.fn.diagnose = function(settings){ $.extend(diagnose, settings || {});};
		$.fn.ready(function() {
		    var loginApi = oms_config.apiUrl+oms_apiList.login;
		    // new Login(oms_config.corpId,oms_config.baseUrl,loginApi,function(){
		    //
		    // });
				var omsUser = getCookie('omsUser');
				if(omsUser){
						diagnose.user = JSON.parse(omsUser);
						diagnose.init();
				}
		});

		function getTextWidth(text, font) {
		    var canvas = getTextWidth.canvas ||
		        (getTextWidth.canvas = document.createElement("canvas"));
		    var context = canvas.getContext("2d");
		    context.font = font;
		    var metrics = context.measureText(text);
		    return metrics.width;
		};
