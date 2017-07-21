var lidanAnalyse = {
  type: getUrlParam('type') || 'clients',
  user: JSON.parse(getCookie('omsUser')),
  postData: {},
  level_id: getUrlParam('level_id') || 0,
  configId: getUrlParam('configId') || 0,
  orgid: getUrlParam('orgid') || 0,
  level: getUrlParam('level') || 0,
  issub: getUrlParam('issub') || 0,
  level_mark: false,

  getData: function() {
    var self = this;
    var apiUrl;
    self.postData.omsuid = self.user.id;
    self.postData.token = self.user.token;
    if(self.type === 'clients'){
      self.postData.orgid = self.orgid;
      self.postData.level = self.level;
      self.postData.issub = self.issub;
      apiUrl = oms_config.apiUrl+oms_apiList.getLidanRangeByDpt;
    }else{
      self.postData.level_id = self.level_id;
      self.postData.configId = self.configId;
      apiUrl = oms_config.apiUrl+oms_apiList.getLidanRangeByLevelId;
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
          if(self.type === 'clients'){
            self.renderTable(rs.data);
            $("#lefttable tbody a").bind('click', function(){
              self.checkMore(this);
            });
          }else{
            self.renderLevelTable(rs.data.list);
          }
        }
      },
      error:function(e){
        console.log(JSON.stringify(e));
      }
    });
  },
  checkMore:function(obj){
      if(this.type === 'clients'){
        var level = $(obj).attr("data-level");
        var orgid = $(obj).attr("data-id");
        window.location.href = this.setUrl('clients',orgid, level, 1, 0, 0);
      }else{
        var level = $(obj).attr("data-level");
        var orgid = $(obj).attr("data-id");
        // window.location.href = this.setUrl($("#toolBar .active").data("id"), level, orgid);
      }
  },

  renderChart: function(data,total){
    var chartData = [];
    var self = this;
    if(self.type === 'clients'){
      $(data).each(function(i){
        var value = parseFloat(((this.value/total)*100).toFixed(2));
        if(this.name === 'range1'){
          chartData.push({name:'[0~9960]',color:'#e4527c', y: value});
        }
        if(this.name === 'range2'){
          chartData.push({name:'(9960~19920]',color:'#50a5cf', y: value});
        }
        if(this.name === 'range3'){
          chartData.push({name:'(19920~29880]',color:'#fb9128', y: value});
        }
        if(this.name === 'range4'){
          chartData.push({name:'(29980~39840]',color:'#ea5751', y: value});
        }
        if(this.name === 'range5'){
          chartData.push({name:'(39840~50000]',color:'#6acccb', y: value});
        }
        if(this.name === 'range6'){
          chartData.push({name:'(5万~10万]',color:'#3cb67f', y: value});
        }
        if(this.name === 'range7'){
          chartData.push({name:'10万以上',color:'#606060', y: value});
        }
      });
    }else{
      $(data).each(function(i){
        if(this.level == 'S0'){
          chartData.push({name:'S0',color:'#e4527c', y: parseFloat(((this.sum/data[0].sum)*100).toFixed(2))});
        }
        if(this.level == 'S1'){
          chartData.push({name:'S1',color:'#50a5cf', y: parseFloat(((this.sum/data[0].sum)*100).toFixed(2))});
        }
        if(this.level == 'S2'){
          chartData.push({name:'S2',color:'#fb9128', y: parseFloat(((this.sum/data[0].sum)*100).toFixed(2))});
        }
        if(this.level == 'S3'){
          chartData.push({name:'S3',color:'#ea5751', y: parseFloat(((this.sum/data[0].sum)*100).toFixed(2))});
        }
        if(this.level == 'P1'){
          chartData.push({name:'P1',color:'#6acccb', y: parseFloat(((this.sum/data[0].sum)*100).toFixed(2))});
        }
        if(this.level == 'M1'){
          chartData.push({name:'M1',color:'#3cb67f', y: parseFloat(((this.sum/data[0].sum)*100).toFixed(2))});
        }
        if(this.level == 'M2'){
          chartData.push({name:'M2',color:'#606060', y: parseFloat(((this.sum/data[0].sum)*100).toFixed(2))});
        }
        if(this.level == 'M3'){
          chartData.push({name:'M3',color:'#8085e9', y: parseFloat(((this.sum/data[0].sum)*100).toFixed(2))});
        }
        if(this.level == 'M4a'){
          chartData.push({name:'M4a',color:'#f15c80', y: parseFloat(((this.sum/data[0].sum)*100).toFixed(2))});
        }
        if(this.level == 'M4b'){
          chartData.push({name:'M4b',color:'#7cb5ec', y: parseFloat(((this.sum/data[0].sum)*100).toFixed(2))});
        }
      });
    }
    $('#lidanAnalyse').highcharts({
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
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        series: [{
            type: 'pie',
            name: self.type==='clients'?'客户数':'人员数',
            data: chartData
        }],
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        }
    });
  },

  renderTable: function(data){
    $("#biao_data").show();
    var self = this;
    var tableColumn="";
    var lefttable='<tr><td style="max-width:100px;" class="fix-column"><span class="ui-nowrap tdspan">汇总</span></td></tr>';
    var head = "";
    var chartData = [];
    var range1_total = 0, range2_total = 0, range3_total = 0, range4_total = 0, range5_total = 0, range6_total = 0, range7_total = 0, rangeAll_total = 0;
    var chart_total1 = 0, chart_total2 = 0, chart_total3 = 0, chart_total4 = 0, chart_total5 = 0, chart_total6 = 0, chart_total7 = 0, chart_total8 = 0;
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
        var range1 = this.range1;
        var range2 = this.range2;
        var range3 = this.range3;
        var range4 = this.range4;
        var range5 = this.range5;
        var range6 = this.range6;
        var range7 = this.range7;
        var range_total = range1 + range2 + range3 + range4 + range5 + range6 + range7;

        if(this.isClick){
            chart_total1 = range1+chart_total1;
            chart_total2 = range2+chart_total2;
            chart_total3 = range3+chart_total3;
            chart_total4 = range4+chart_total4;
            chart_total5 = range5+chart_total5;
            chart_total6 = range6+chart_total6;
            chart_total7 = range7+chart_total7;
            chart_total8 = range_total+chart_total8;
        }
        range1_total = range1 + range1_total;
        range2_total = range2 + range2_total;
        range3_total = range3 + range3_total;
        range4_total = range4 + range4_total;
        range5_total = range5 + range5_total;
        range6_total = range6 + range6_total;
        range7_total = range7 + range7_total;
        rangeAll_total = range_total + rangeAll_total;
        if(this.isClick && this.level < 5){
            name='<a data-id="'+this.id+'" data-level="'+(parseInt(this.level))+'">'+name+'</a>';
        }
        if (this.level == 5){
            name='<a href="profile.html?id='+this.id+'&do=0" >'+name+'</a>';
        }

        // name='<a data-id="'+this.orgid+'" data-level="'+a+'">'+name+'</a>';
        if(this.isClick || this.level == 5){
            if(range1>0){
                range1 = '<a onclick="lidanAnalyse.openDetail('+this.id+',\''+this.level+'\',\''+1+'\',\'clients\')">'+range1+'</a>';
            }
            if(range2>0){
                range2 = '<a onclick="lidanAnalyse.openDetail('+this.id+',\''+this.level+'\',\''+2+'\',\'clients\')")">'+range2+'</a>';
            }
            if(range3>0){
                range3 = '<a onclick="lidanAnalyse.openDetail('+this.id+',\''+this.level+'\',\''+3+'\',\'clients\')">'+range3+'</a>';
            }
            if(range4>0){
                range4 = '<a onclick="lidanAnalyse.openDetail('+this.id+',\''+this.level+'\',\''+4+'\',\'clients\')">'+range4+'</a>';
            }
            if(range5>0){
                range5 = '<a onclick="lidanAnalyse.openDetail('+this.id+',\''+this.level+'\',\''+5+'\',\'clients\')">'+range5+'</a>';
            }
            if(range6>0){
                range6 = '<a onclick="lidanAnalyse.openDetail('+this.id+',\''+this.level+'\',\''+6+'\',\'clients\')">'+range6+'</a>';
            }
            if(range7>0){
                range7 = '<a onclick="lidanAnalyse.openDetail('+this.id+',\''+this.level+'\',\''+7+'\',\'clients\')">'+range7+'</a>';
            }
        }
        var firstRow;
        if(this.level == 5){
            if(!this.hr_level_id || this.hr_level_id == -1){
              firstRow = '--';
            }else{
              firstRow = this.hr_level_id ;
            }
        }else{
            firstRow = (team.leaderInfo[this.id]?team.leaderInfo[this.id]:'--')
        }

        lefttable += '<tr><td style="max-width:100px;" ><span class="ui-nowrap tdspan" style="margin-right:0;">'+name+'</span></td></tr>';
        tableColumn +='<tr class="'+trClass+'" >\
                                        <td style="max-width:100px;min-width:100px;"><span class="ui-nowrap ui-whitespace tdspan">'+name+'</span></td>\
                                        <td class="text-center" style="max-width:100px;">'+firstRow+'</td>\
                                        <td class="text-center" style="min-width:100px;">'+range1+'</td>\
                                        <td class="text-center" style="min-width:100px;">'+range2+'</td>\
                                        <td class="text-center" style="min-width:100px;">'+range3+'</td>\
                                        <td class="text-center" style="min-width:100px;">'+range4+'</td>\
                                        <td class="text-center" style="min-width:100px;">'+range5+'</td>\
                                        <td class="text-center" style="min-width:100px;">'+range6+'</td>\
                                        <td class="text-center" style="min-width:100px;">'+range7+'</td>\
                                        <td class="text-center" style="min-width:100px;">'+range_total+'</td></tr>';


    });
    tableColumn = '<tr class="odd" >\
                                    <td style="max-width:100px;min-width:100px;"><span class="ui-nowrap ui-whitespace tdspan"></span></td>\
                                    <td class="text-center" style="max-width:100px;"> -- </td>\
                                    <td class="text-center" style="min-width:100px;">'+range1_total+'</td>\
                                    <td class="text-center" style="min-width:100px;">'+range2_total+'</td>\
                                    <td class="text-center" style="min-width:100px;">'+range3_total+'</td>\
                                    <td class="text-center" style="min-width:100px;">'+range4_total+'</td>\
                                    <td class="text-center" style="min-width:100px;">'+range5_total+'</td>\
                                    <td class="text-center" style="min-width:100px;">'+range6_total+'</td>\
                                    <td class="text-center" style="min-width:100px;">'+range7_total+'</td>\
                                    <td class="text-center" style="min-width:100px;">'+rangeAll_total+'</td></tr>'+tableColumn;

    if(self.level_mark){
      chartData.push({'name':'range1','value':chart_total1});
      chartData.push({'name':'range2','value':chart_total2});
      chartData.push({'name':'range3','value':chart_total3});
      chartData.push({'name':'range4','value':chart_total4});
      chartData.push({'name':'range5','value':chart_total5});
      chartData.push({'name':'range6','value':chart_total6});
      chartData.push({'name':'range7','value':chart_total7});
      self.renderChart(chartData, chart_total8);
    }else{
      chartData.push({'name':'range1','value':range1_total});
      chartData.push({'name':'range2','value':range2_total});
      chartData.push({'name':'range3','value':range3_total});
      chartData.push({'name':'range4','value':range4_total});
      chartData.push({'name':'range5','value':range5_total});
      chartData.push({'name':'range6','value':range6_total});
      chartData.push({'name':'range7','value':range7_total});
      self.renderChart(chartData, rangeAll_total);
    }
    // self.renderChart(chartData, rangeAll_total);

    $("#headertable tr").append(head);
    $("#lefttable tbody").html(lefttable);
    $("#bodytable tbody").html(tableColumn);
    this.scrollTable();
  },

  renderLevelTable: function(data){
    console.log(data);
    $("#biao_data").show();
    var self = this;
    var tableColumn="";
    var lefttable='';
    var head = "";
    var chartData = [];
    $(data).each(function(i){
        var trClass='odd';
        if(i%2==0){
            trClass='even';
        }
        var name=this.level;
        var range1 = this.range1 ? this.range1: 0;
        var range2 = this.range2 ? this.range2: 0;
        var range3 = this.range3 ? this.range3: 0;
        var range4 = this.range4 ? this.range4: 0;
        var range5 = this.range5 ? this.range5: 0;
        var range6 = this.range6 ? this.range6: 0;
        var range7 = this.range7 ? this.range7: 0;
        var sum = this.sum;

        if(name != '总计'){
          if(range1>0){
              range1 = '<a onclick="lidanAnalyse.openStaffDetail(\''+this.level_id+'\',\''+1+'\')">'+range1+'</a>';
          }
          if(range2>0){
              range2 = '<a onclick="lidanAnalyse.openStaffDetail(\''+this.level_id+'\',\''+2+'\')">'+range2+'</a>';
          }
          if(range3>0){
              range3 = '<a onclick="lidanAnalyse.openStaffDetail(\''+this.level_id+'\',\''+3+'\')">'+range3+'</a>';
          }
          if(range4>0){
              range4 = '<a onclick="lidanAnalyse.openStaffDetail(\''+this.level_id+'\',\''+4+'\')">'+range4+'</a>';
          }
          if(range5>0){
              range5 = '<a onclick="lidanAnalyse.openStaffDetail(\''+this.level_id+'\',\''+5+'\')">'+range5+'</a>';
          }
          if(range6>0){
              range6 = '<a onclick="lidanAnalyse.openStaffDetail(\''+this.level_id+'\',\''+6+'\')">'+range6+'</a>';
          }
          if(range7>0){
              range7 = '<a onclick="lidanAnalyse.openStaffDetail(\''+this.level_id+'\',\''+7+'\')">'+range7+'</a>';
          }
        }

        lefttable += '<tr><td style="max-width:100px;" ><span class="ui-nowrap tdspan" style="margin-right:0;">'+name+'</span></td></tr>';
        tableColumn +='<tr class="'+trClass+'" >\
                                        <td style="max-width:100px;min-width:100px;"><span class="ui-nowrap ui-whitespace tdspan">'+name+'</span></td>\
                                        <td class="text-center" style="min-width:100px;">'+range1+'</td>\
                                        <td class="text-center" style="min-width:100px;">'+range2+'</td>\
                                        <td class="text-center" style="min-width:100px;">'+range3+'</td>\
                                        <td class="text-center" style="min-width:100px;">'+range4+'</td>\
                                        <td class="text-center" style="min-width:100px;">'+range5+'</td>\
                                        <td class="text-center" style="min-width:100px;">'+range6+'</td>\
                                        <td class="text-center" style="min-width:100px;">'+range7+'</td>\
                                        <td class="text-center" style="min-width:100px;">'+sum+'</td></tr>';


    });
    self.renderChart(data, 0);

    $("#headertable tr").append(head);
    $("#lefttable tbody").html(lefttable);
    $("#bodytable tbody").html(tableColumn);
    this.scrollTable();
  },

  openDetail: function(orgid,level,range, type){
      openLink(oms_config.baseUrl + 'teamCusLidanAnalyse.html?orgid='+orgid+'&level='+level+'&range='+range+'&type='+type,true);
  },

  openStaffDetail: function(level_id, range){
    openLink(oms_config.baseUrl + 'teamCusLidanAnalyse.html?level_id='+level_id+'&configId='+this.configId+'&range='+range+'&type=levels',true);
  },
  setUrl:function(type, orgid, level, issub, level_id, configId){
    var urlOld = window.location.href.split("?")[0];
    var urlNew = urlOld+"?type="+type+"&orgid="+orgid+"&level="+level+"&issub="+issub+"&level_id="+level_id+"&configId="+orgid;
    // if(type === 'clients'){
    //   urlNew = urlNew+"&orgid="+orgid+"&level="+level+"&issub="+issub;
    // }else{
    //   urlNew = urlNew+"&level_id="+level_id+"&configId="+orgid;
    // }
    return urlNew;
  },

  initEvent: function(){
    var self = this;
    $('#lidanAnalyse_toggle').on('click', 'button', function(){
      var $this = $(this), type = $this.data('chart-type');
      $this.siblings().attr('disabled', null);
      $this.attr('disabled', 'disabled');
      if(type=='byClients'){
        self.type = 'clients';
        window.location.href = self.setUrl('clients', self.orgid, self.level, self.issub, self.level_id, self.configId);
      }else{
        self.type = 'levels';
        window.location.href = self.setUrl('levels', self.orgid, self.level, self.issub, self.level_id, self.configId);
      }
    });
  },

  initTitle: function(){
    var self = this;
    dd.ready(function () {
      dd.biz.navigation.setTitle({
        title: '理单结果分析',
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
  scrollTable:function(){
      this.setTableBody();
      $('#lefttable').show();
      $(window).resize(this.setTableBody);
      $(".table-body").scroll(function (){
        $("#headertable").offset({ left: -1*this.scrollLeft });
        if($("#chart-container").css('display')=='none'){
          $("#lefttable").offset({ top: -1*this.scrollTop + 77 });
        }
      });

      $(window).scroll(function (){
        if($("#chart-container").css('display')=='none'){
          $("#lefttable").offset({ top: -1*this.scrollTop + 77 });
        }
      });
  },
  setTableBody: function(){
      var heightTable = $(window).height() - $('#selects_wrap').height() - $('#footer-bar').height();
      var heightHead = 36;
  },
  initTab: function() {
    if(this.type === 'clients'){
      $('#lidanAnalyse_toggle>button:first-child').attr('disabled','disabled');
      $('.table-title').html('部门');
      $('#leader-title').show();
    }else{
      $('#lidanAnalyse_toggle>button:nth-child(2)').attr('disabled','disabled');
      $('.table-title').html('职级');
      $('#leader-title').hide();
    }
    if(this.level == 4){
        $('#leader-title').text('职级');
    }
  },

  init: function(){
    this.initTitle();
    this.initEvent();
    this.initTab();
    this.getData();
  },
}

$.fn.lidanAnalyse = function(settings){ $.extend(lidanAnalyse, settings || {});};

$.fn.ready(function() {
  var loginApi = oms_config.apiUrl+oms_apiList.login;
  var omsUser = getCookie('omsUser');
  if(omsUser){
      lidanAnalyse.user = JSON.parse(omsUser);
      lidanAnalyse.init();
  }
});
