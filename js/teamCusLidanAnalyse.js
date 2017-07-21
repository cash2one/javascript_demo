$(function(){
    FastClick.attach(document.body);
	var follObj =  {
		'-1': '未理单',
		'0': '待理单',
		'1': '已签已回',
		'6': '已签未回',
		'2': '重点跟进',
		'3': '能签能回',
		'4': '冲击客户',
		'5': '已死客户',
		'7': '资料量',
		'8': '电话量',
		'9': '拜访量',
		'10': 'A级客户',
		'11': 'B级客户',
		'12': 'C级客户',
		'13': 'D级客户',
    '14': '预测回款',
    '15': '今日回款',
    '16': '资料量'
	};
    //顶部导航
    var OMS = {
        user: {},
		    type : getUrlParam('type'),
        orgid: getUrlParam('orgid'),
        level: getUrlParam('level'),
        user_id: getUrlParam('user_id'),
        range: getUrlParam('range'),
        level_id: getUrlParam('level_id'),
        configId: getUrlParam('configId'),
        jumpType: getUrlParam('jumpType'),
        init: function(){
            //页面标签初始化
            this.initTitleBar();
            this.initLeftBar();
            this.getData();
            window.openCusDetail = this.openCusDetail;
        },
        openCusDetail: function(user_id,level,range){
          var urlOld = window.location.href.split("?")[0];
          var urlNew = urlOld+"?type=clients"+"&range="+range+"&level="+level+"&user_id="+user_id+"&jumpType=back";
          window.location.href = urlNew;
        },
        getData: function(){
            $("#msg").html("正在加载中...")
            $("#msg").show();
            var self = this;
            var data = {omsuid:OMS.user.id,token:OMS.user.token};
            var apiUrl;
            if(self.type === 'clients'){
              data.orgid = self.orgid;
              data.level_id = self.level;
              data.range = self.range;
              if(self.level == 5){
                data.user_id = self.orgid;
              }
              if(self.user_id){
                  data.user_id = self.user_id;
              }
              apiUrl = oms_config.apiUrl+oms_apiList.getLidanRangeCustomerList;
            }else{
              data.level_id = self.level_id;
              data.range = self.range;
              data.configId = self.configId;
              apiUrl = oms_config.apiUrl+oms_apiList.getStaffList;
            }
      			$.ajax({
        				type:"post",
        				url:apiUrl,
        				async:true,
        				data:data,
        				dataType:'json',
        				success:function(rs){
        					console.log(rs);
                  if(self.type === 'clients'){
                    var rowData;
                    if(self.user_id){
                        rowData = rs.data.list;
                    }else{
                      rowData = rs.data;
                    }
                    OMS.renderCusList(rowData);
          					$("#title").html('客户数量：'+rowData.length+'个');
                  }else{
                    OMS.renderStaff(rs.data.list);
                    $("#title").html('人员数量：'+rs.data.list.length+'个');
                  }
        				},
        				error:function(e){}
      			});
        },
        test: function(){
          console.log('aaa');
        },

        renderStaff: function(data){
          $('#biao').show();
          $('#msg').hide();
          var self = this;
          var tableColumn="";
          var lefttable='';
          var head = "";
          $(data).each(function(i){
            var trClass='odd';
            if(i%2==0){
                trClass='even';
            }
            var name = this.name;
            var dept = this.dept;
            var customer = this.customer;
            var level = this.level;
            if(customer > 0){
                console.log(this.id);
                console.log(this.level_id);
                customer = '<a style="color: #00a5e0" onclick="openCusDetail(\''+this.id+'\',\''+this.level_id+'\',\''+self.range+'\')">'+customer+'</a>';
                // customer = '<a onclick="OMS.test()">'+customer+'</a>';

            }
            lefttable += '<tr><td style="max-width:100px;" ><span class="ui-nowrap tdspan" style="margin-right:0;">'+name+'</span></td></tr>';
            tableColumn +='<tr class="'+trClass+'" >\
                                            <td style="max-width:100px;min-width:100px;"><span class="ui-nowrap ui-whitespace tdspan">'+name+'</span></td>\
                                            <td class="text-center">'+dept+'</td>\
                                            <td class="text-center">'+level+'</td>\
                                            <td class="text-center">'+customer+'</td>\</tr>';
          });
          $("#headertable tr").append(head);
          $("#lefttable tbody").html(lefttable);
          $("#bodytable tbody").html(tableColumn);
          this.scrollTable();
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
        renderCusList: function(data){
            $("#listNav").show();
			      $("#msg").hide();
            var htmlTpl ;

            htmlTpl = OMS.renderCusListLi(data);

            $("#cuslist").append(htmlTpl);

            $("#cuslist li").off('click').on('click', function(){
                if(!$(this).hasClass("noMore")){
                    openCustomerInfo($(this).data("code"));
                }
            });

        },

        renderCusListLi: function(data){
            var htmlTpl = '';
            var nowTime = new Date().getTime();
            for(var i = 0, len = data.length; i < len; i++){
                htmlTpl += '<li data-code="' + data[i].cusid + '" class="ui-border-t">';
                htmlTpl += '<div class="ui-list-info">';
                htmlTpl += '<h4 class="ui-nowrap itemtoggle">' + data[i].cusname +'<span class="visiting">' + data[i].money+'元 </span>' +
                '</h4>';
                htmlTpl += '<p class="itemtoggle">';
				        htmlTpl += '<span>&nbsp;' + data[i].lidan +'&nbsp;</span>|';
                htmlTpl += '<span>&nbsp;' + (data[i].mylevel=='无'?'未评':data[i].mylevel) +'级&nbsp;</span>|';
				        htmlTpl += '<span>&nbsp;' + (data[i].managelevel=='无'?'未评':data[i].managelevel) + '级&nbsp;</span>';
                htmlTpl += '</p>';

                htmlTpl += '<p class="itemtoggle">'+data[i].config+'</p>';
                htmlTpl +='</div>';

                htmlTpl += '</li>';
            }
            return htmlTpl;
        },

        renderCusPredictListLi: function(data){
            var htmlTpl = '';
            var nowTime = new Date().getTime();
            for(var i = 0, len = data.length; i < len; i++){
                htmlTpl += '<li data-code="' + data[i].cusid + '" class="ui-border-t">';
                htmlTpl += '<div class="ui-list-info">';
                htmlTpl += '<h4 class="ui-nowrap itemtoggle">' + data[i].cusname +
                    '<span class="visiting">' + data[i].money+'元</span>' +
                '</h4>';
                htmlTpl += '<p class="itemtoggle">'+data[i].realname+'</p>';
                htmlTpl +='</div>';

                htmlTpl += '</li>';
            }
            return htmlTpl;
        },

        initTitleBar: function(){
            ddbanner.changeBannerTitle("客户列表");
        },
        initLeftBar: function(){
            dd.ready(function(){
                if(dd.ios){
                    dd.biz.navigation.setLeft({
                        show: true,
                        control: true,
                        showIcon: true,
                        text: '',
                        onSuccess : function(result) {
                            if(OMS.jumpType === 'back'){
                              history.back(-1);
                            }else{
                              dd.biz.navigation.close({
                                  onSuccess: function(result) {},
                                  onFail: function(err) {}
                              });
                            }
                        },
                        onFail : function(err) {}
                    });
                }else{
                    $(document).off('backbutton');
                    $(document).on('backbutton', function(e) {
                        if(OMS.jumpType === 'back'){
                          history.back(-1);
                        }else{
                          dd.biz.navigation.close({
                              onSuccess: function(result) {},
                              onFail: function(err) {}
                          });
                        }
                        e.preventDefault();
                    });
                }
            });
        }
    };


    var openCustomerInfo = function(code){
        openLink(oms_config.baseUrl + "customerInfo.html?code=" + code + "&from=private&jumpType=close", true);
    };

    //免登验证
    $.fn.OMS = function(settings){ $.extend(OMS, settings || {});};
    $.fn.ready(function() {
      var loginApi = oms_config.apiUrl+oms_apiList.login;
      var omsUser = getCookie('omsUser');
      if(omsUser){
          OMS.user = JSON.parse(omsUser);
          OMS.init();
      }
    });
});
