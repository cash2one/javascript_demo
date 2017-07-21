$(function(){
	FastClick.attach(document.body);
	var lists = {
		user:{},
		filterObj: {},
		init: function () {
			this.initParams();
			this.initBar();
			this.renderSort();
			search.init();
			this.initEvent();
			this.getData();
		},
		initParams: function () {
			var omsUser = getCookie('omsUser');
			this.user = JSON.parse(omsUser);

			this.filterObj.keyword = '';
			this.filterObj.page = 1;
			this.filterObj.sorttype = 0;
			this.filterObj.userid = this.user.id;

			this.pageSize = 20;
			this.lastSize = 0;

			this.sortList = {
				0: "加入时间",
				// 1: "员工人数"
			}
		},
		initBar: function () {
			ddbanner.changeBannerTitle("红圈通VIP客户");
			ddbanner.changeBannerLeft('');
			if (dd.android) {
			    dd.biz.navigation.setLeft({
			        visible: true,
			        control: false,
			        text: ''
			    });
			}
		},
		initEvent: function(){
		    var self = this;
		    $(".backtotop").on("click", function(){
		        $(".backtotop").hide();
		        self.myScroll && self.myScroll.scrollToElement($("#top")[0]);
		    })
		    $(".scroller").on("touchend", function(){
		        if(self.myScroll){
		            var scrollTop = 0;
		            var getScrollY = setInterval(function(){
		                if(!self.myScroll) $(".backtotop").hide();
		                if(!self.myScroll || scrollTop == self.myScroll.y) {
		                    if(scrollTop > -100)
		                        $(".backtotop").hide();
		                    clearInterval(getScrollY);
		                }
		                else {
		                    scrollTop = self.myScroll.y;
		                    if(scrollTop > -100)
		                        $(".backtotop").hide();
		                    else
		                        $(".backtotop").show();
		                }
		            }, 500);
		        }
		        else if($(this)[0].scrollTop < 100)
		            $(".backtotop").hide();
		    });
		},
		getData: function () {
			$("#msg").html("正在加载中...")
			$("#msg").show();
			lists.detroyScroll();
			lists.refreshData();
		},
		refreshData: function(){
		    var sendObj = {};
		    if(lists.myScroll)
		        $("#wrapper").find("#pullUp").hide();

		    sendObj.callback = lists.renderCusList;
		    lists.filterObj.page = 1;
		    sendObj.data = lists.filterObj;

		    lists.data = [];
		    $("#cuslist").html('');
		    $(".backtotop").hide();

		    getCustomers(sendObj);
		},
		getMoreData: function(){
		    if(lists.lastSize < lists.pageSize)
		        return;
		    var sendObj = {};
		    lists.filterObj.page++;
		    sendObj.data = lists.filterObj;
		    sendObj.callback = lists.renderCusList;

		    getCustomers(sendObj);
		},
		sendAjax: function(sendObj){
		    this.clearAjax();
		    this.ajaxControl =
		        setTimeout(function(){
		            getCustomers(sendObj);
		        }, 300);
		},
		clearAjax: function(){
		    if(this.ajaxControl) clearTimeout(this.ajaxControl);
		    if(this.ajax && this.ajax.abort) this.ajax.abort();
		},
		detroyScroll: function() {
		    if (lists.myScroll) {
		        lists.myScroll.destroy();
		        lists.myScroll = null;
		        $("#wrapper").find("#pullDown").remove();
		        $("#wrapper").find("#pullUp").remove();
		    }
		},
		renderCusList: function(data){
		    if(lists.data && lists.data.length > 0)
		        lists.data = lists.data.concat(data);
		    else
		        lists.data = data;

		    $("#listNav").show();
		    $("#msg").hide();
		    $("#v-container-empty").hide();
		    if (!lists.data || !lists.data.length) {
		        $("#msg").html("没有找到相关客户");
		        $("#msg").show();
		    }
		    else {
		        var htmlTpl = lists.renderCusListLi(data);
		        $("#cuslist").append(htmlTpl);

		        lists.lastSize = data.length;
		        if(data.length < lists.pageSize){
		            $("#pullUp").hide();
		            if(lists.filterObj.page > 1)
		                $("#cuslist").append('<li class="noMore ui-border-t" style="text-align:center;"><div style="width:100%; font-size: 14px; color: #999;"><p>无更多客户信息</p></div></li>');
		        }
		        else
		            $("#pullUp").show();

		        if(lists.myScroll)
		            lists.myScroll.refresh();
		        else if(data.length < lists.pageSize)
		            lists.myScroll = new myIScroll("wrapper", lists.refreshData);
		        else
		            lists.myScroll = new myIScroll("wrapper", lists.refreshData, lists.getMoreData);

		        lists.bindEvent();
		    }
		},
		bindEvent: function () {
			$('.message-icon').click(function () {
				toMessage($(this).data("groupid"), lists.user.telephone);
				stopEventBubble(event);
			});
			$("#cuslist li").click(function () {
			    if (!$(this).hasClass("noMore")) {
			        openDetailLink($(this).data("code"));
			    }
			});
		},
		renderCusListLi: function (data) {
			var telephone = this.user.telephone;
			console.log('telephone' + telephone);
		    var htmlTpl = '';
		    for(var i = 0, len = data.length; i < len; i++){
		        htmlTpl += '<li data-code="' + data[i].id + '" class="ui-border-t">';
		        htmlTpl += '<div class="ui-list-info">';
		        htmlTpl += '<h4 class="ui-nowrap itemtoggle">' + data[i].entname + '</h4>';
		        htmlTpl += '<p class="itemtoggle">';

		        htmlTpl += '<span>开通' + data[i].openeddays + '天&nbsp;</span>|';
		        // htmlTpl += '<span>&nbsp;员工' + data[i].ptotalcount + '人&nbsp;</span>|';
		        htmlTpl += '<span>&nbsp;' + data[i].username + '跟进&nbsp;</span>';
		        htmlTpl += '</p>';

		        htmlTpl += '<span class="message-icon" data-groupid="' + data[i].entgroupid + '"><i class="ui-icon-vip_customer_communicate"></i></span>';
		        // htmlTpl += '<span class="data-icon"><i class="ui-icon-vip_customer_data"></i></span>';

		        htmlTpl +='</div>';
		        htmlTpl += '</li>';
		    }
		    return htmlTpl;
		},
		renderSort: function () {
		    var htmlTpl = '',
		        defaultCode = this.filterObj.sorttype,
		        self = this;

		    htmlTpl = '<li class="ui-border-t activeTab" data-code="' + defaultCode + '">'+
		        '<p class="sort_order">' +
		            '<span>自动排序－加入时间</span>' +
		        '</p>' +
		    '</li>';
		    for(var code in self.sortList){
		        if( code == defaultCode)
		            continue;
		        htmlTpl += '<li class="ui-border-t" data-code="' + code + '">' +
		            '<p class="sort_order">' +
		                '<span>' + self.sortList[code] + '</span>' +
		            '</p>' +
		        '</li>';
		    }
		    $("#select-sort ul").html(htmlTpl);

		    function initSortEvent() {
		        //绑定导航栏事件
		        $("#sort-tap").click(function(){
		            $(this).siblings('.activeTab').removeClass('activeTab');
		            $(this).toggleClass('activeTab');

		            if(document.getElementById("select-sort").style.display == 'none'){
		                $('.select-date').hide();
		                $('#select-sort').show();
		                $("#top").show();
		            }else{
		                $('.select-date').hide();
		            }
		            stopEventBubble(event);
		        });
		        $("#select-sort").click(function(){
		            $(this).hide();
		            $("#sort-tap").toggleClass('activeTab');
		            stopEventBubble(event);
		        });
		        //绑定排序列表事件
		        $("#select-sort li").click(function(event){
		            lists.filterObj.sorttype = $(this).data('code');
		            lists.filterObj.page = 1;
		            self.getData(); //刷新列表
		            $(this).siblings('li').removeClass("activeTab");
		            $(this).toggleClass("activeTab");
		            $('.select-date').hide();
		            $("#sort-tap").toggleClass('activeTab');
		            $("#sort-tap span").html(self.sortList[self.filterObj.sorttype]);
		            stopEventBubble(event);
		        });
		    }
		    initSortEvent();
		},
	};

	var search = {
		init: function () {
			this.initEvent();
			this.initParams();
		},
		initParams: function () {
			window.openSearch = this.openSearch;
			this.myScroll = null;
			this.searchData = [];
			this.history = [];
		},
		initEvent: function () {
			var self = this;
			$("#seac-tap").click(function(){
			    self.renderCustomer();
			});
		},
		renderCustomer: function () {
			var htmlTpl = '<section class="ui-container" id="allSelectCus">' +
			'<div class="ui-searchbar-wrap" id="searchwrap">' +
			    '<div class="ui-searchbar">' +
			        // '<div class="ui-search-icon"></div>' +
			        '<div class="ui-icon-public_search"></div>' +
			        '<div class="ui-searchbar-text">搜索客户名称</div>' +
			        '<div class="ui-searchbar-input">' +
			            '<form action="javascript:void(0)" onsubmit="openSearch();">' +
			                '<input value="" type="search" placeholder="搜索客户名称" autocapitalize="off">' +
			            '</form>' +
			        '</div>' +
			        '<i class="ui-icon-close"></i>' +
			    '</div>' +
			    '<button class="ui-searchbar-cancel">取消</button>' +
			'</div>';
			htmlTpl += '<div class="ui-search-container"' + (this.history.length?'':' style="background-color: #f5f5f6"') + '>';
			//搜索提示窗
			htmlTpl += '<div class="ui-loading-wrap" id="search-msg">正在加载中...</div>';

			//搜索引导框
			if (!this.history.length)
			    htmlTpl +=
			    '<div id="search-hint">' +
			        '<p class="search-hint-content">点击键盘上的“搜索”按钮<br/>进行搜索</p>' +
			    '</div>';

			//搜索结果
			htmlTpl += '<div id="search-wrapper" style="display: none">';
			htmlTpl += '<section class="scroller">';
			htmlTpl += '<ul class="ui-list ui-list-text ui-border-b" id="search-list"></ul>';
			htmlTpl += '</section>';
			htmlTpl += '</div>';

			//历史记录
			// htmlTpl += '<div id="search-history"' + (this.history.length?'':' style="display: none"') + '>';
			// htmlTpl += '<div id="search-history-title" class="ui-border-b">搜索历史</div>';
			// htmlTpl += '<div id="history-wrapper"><section class="scroller">';
			// htmlTpl += '<ul class="ui-list ui-list-text ui-border-b" id="history-list">';
			// htmlTpl += this.renderHistory();
			// htmlTpl +='</ul></section></div></div>';

			htmlTpl += '</div>';
			htmlTpl += '</section>';

			$("body").append(htmlTpl);
			this.searchWrapListener();
			// this.historyWrapListener();
			$("#allSelectCus").siblings(['#top','#listNav']).hide();
			$('#allSelectCus .ui-searchbar-wrap').addClass('focus');
			$('#allSelectCus input').focus();
		},
		openSearch: function () {
			var val = $.trim($('#allSelectCus input').val());
			if(val) {
			    // search.updateHistory(val);
			    $("#search-hint").hide();
			    search.refreshSearch(val);
			}
			else {
			    $("#search-msg").hide();
			    $("#search-wrapper").hide();
			    if (search.history.length)
			        $("#search-history").show();
			}
			$('#allSelectCus input').blur();
		},
		searchWrapListener: function () {
		    var self = this;

		    $('#allSelectCus .ui-searchbar').on('click',function(event){
		        $('#allSelectCus .ui-searchbar-wrap').addClass('focus');
		        $('#allSelectCus input').focus();
		        event.stopPropagation();
		    });

		    $('#allSelectCus .ui-searchbar-cancel').on('click',function(event){
		        $("#allSelectCus").siblings(['#top','#listNav']).show();
		        $("#allSelectCus").remove();
		        event.stopPropagation();
		    });
		    $("#allSelectCus .ui-icon-close").on('click', function(){
		        $('#allSelectCus input').val('');
		        $("#search-wrapper").hide();
		        $("#search-msg").hide();
		        if (self.history.length)
		            $("#search-history").show();
		        self.clearAjax();

		        $('#allSelectCus input').focus();
		        event.stopPropagation();
		    });
		    $(".ui-search-container").on("touchstart", function(){
		        $('#allSelectCus input').blur();
		    });
		},
		destroy: function(){
		    search.searchType = false;
		    this.searchData = [];
		    $("#search-list").html('');

		    if(search.myScroll) {
		        search.myScroll.destroy();
		        search.myScroll = null;
		        $("#search-wrapper #pullDown").remove();
		        $("#search-wrapper #pullUp").remove();
		    }
		},
		refreshSearch: function(cusName){
		    this.destroy();
		    $("#search-history").hide();
		    $("#search-wrapper").show();
		    $("#search-msg").html("正在加载中...");
		    $("#search-msg").show();

		    var sendObj = {};
		    sendObj.callback = this.renderSearch;
		    sendObj.data = this.initFilter(cusName);
		    sendObj.isSearch = true;
		    search.sendAjax(sendObj);
		},
		initFilter: function (cusName) {
		    this.filterObj = {};
		    // this.filterObj.cusName = ;
		    this.filterObj.keyword = cusName;
		    this.filterObj.page = 1;
		    this.filterObj.sorttype = 0;
		    this.filterObj.userid = lists.user.id;

		    this.pageSize = lists.pageSize;
		    this.lastSize = 0;
		    return this.filterObj;
		},
		renderSearch: function (data) {
		    if(!$("#search-list")) return;
		    if(search.searchType)
		        search.searchData = search.searchData.concat(data);
		    else{
		        $("#search-list").html('');
		        search.searchData = data;
		    }
		    var htmlTpl = lists.renderCusListLi(data);
		    $("#search-list").append(htmlTpl);

		    search.lastSize = data.length || 0;
		    if(!search.searchData || search.searchData.length === 0 ){
		        $("#search-msg").html("未找到您查询的客户");
		        $("#search-msg").show();
		    }
		    else {
		        $("#search-msg").hide();
		        if(data.length < search.pageSize){
		            $("#search-wrapper #pullUp").hide();
		            if(search.filterObj.page > 1)
		                $("#search-list").append('<li class="noMore ui-border-t" style="text-align:center;"><div style="width:100%; font-size: 14px; color: #999;"><p>无更多客户信息</p></div></li>');
		        }
		        else
		            $("#search-wrapper #pullUp").show();

		        if(search.myScroll)
		            search.myScroll.refresh();
		        else if(search.lastSize < search.pageSize)
		            search.myScroll = new myIScroll("search-wrapper");
		        else
		            search.myScroll = new myIScroll("search-wrapper", null, search.getMoreSearch);

		        _bindEvent($("#search-list li"), function(){
		            if(!$(this).hasClass("noMore")){
		                openDetailLink($(this).data("code"));
		            }
		            stopEventBubble(event);
		        });
		    }
		},
		getMoreSearch: function(){
		    // 获取更多搜索结果
		    search.searchType = true;
		    if(search.lastSize < search.pageSize)
		        return;
		    var sendObj = {};
		    search.filterObj.page++;
		    sendObj.data = search.filterObj;
		    sendObj.callback = search.renderSearch;
		    sendObj.isSearch = true;
		    sendObj.error = errorTip;
		    sendObj.type = 'post';
		    search.sendAjax(sendObj);
		},
		sendAjax: function(sendObj){
		    this.clearAjax();
		    this.ajaxControl =
		        setTimeout(function(){
		            getCustomers(sendObj);
		        }, 300);
		},
		clearAjax: function(){
		    if(this.ajaxControl) clearTimeout(this.ajaxControl);
		    if(this.ajax && this.ajax.abort) this.ajax.abort();
		}
	};
	var getCustomers = function(config){
	    var apiUrl = oms_config.apiUrl + oms_apiList.getVipCustomerList;
	    var sendData = config.data || {};
	    sendData.omsuid = lists.user.id;
	    sendData.token = lists.user.token;
	    var request = $.ajax({
	        url: apiUrl,
	        type: 'post',
	        data: sendData,
	        cache: false,
	        success: function(response){
	            if(response){
	                var result = JSON.parse(response);
	                console.log(result);
	                if(result.res === 1)
	                    config.callback && config.callback(result.data.customerlist);
	                else if(result.msg)
	                    errorToast(result.msg);
	            }
	            else
	                errorToast("服务异常");
	        },
	        error: function(xhr, errorType, error){
	            if(errorType == "abort") return;
	            var msg = "网络请求失败";
	            if(config.error)
	                errorTip(msg);
	            else
	                errorToast(msg);
	        }
	    });
	    if(config.isSearch)
	        search.ajax = request;
	    else if(config.isLoadCus)
	        lists.ajax = request;
	};
	var errorTip = function (msg) {
		if($("#msg").css("display") == "block")
		    $("#msg").html(msg);
	};
	var errorToast = function (msg) {
		if(msg.indexOf("登录已过期") > -1){
		    dd.ready(function() {
		        dd.device.notification.alert({
		            message: msg,
		            title: "提示",
		            buttonName: "确定",
		            onSuccess : function() {
		                dd.biz.navigation.close({
		                    onSuccess : function(result) {},
		                    onFail : function(err) {}
		                });
		            },
		            onFail : function(err) {}
		        });
		    });
		}
		else {
		    dd.ready(function() {
		        dd.device.notification.toast({
		            icon: '',
		            text: msg,
		            onSuccess : function(result) {},
		            onFail : function(err) {}
		        });
		    });
		}
	};
	var openDetailLink = function (code) {
		console.log("code = " + code);
		openLink(oms_config.baseUrl + "vipCustomerDetail.html?code=" + code);
	};
	var _bindEvent = function(el, fn){
	    var startX = 0, startY = 0, endX = 0, endY = 0;
	    function startHandle(e){
	        e.preventDefault();
	        startX = e.changedTouches[0].clientX;
	        startY = e.changedTouches[0].clientY;
	    }
	    function moveHandle(e){
	        e.preventDefault();
	    }
	    function endHandle(e) {
	        e.preventDefault();
	        endX = e.changedTouches[0].clientX;
	        endY = e.changedTouches[0].clientY;

	        if (Math.abs(endX - startX) < 5 && Math.abs(endY - startY) < 5) {
	            typeof fn === "function" && fn.call(this, e);
	        }
	    }
	    el.off("touchstart");
	    el.off("touchend");
	    el.on("touchstart", startHandle);
	    el.on("touchend", endHandle);
	};

	var toMessage = function (entgroupid, telephone) {
		console.log('entgroupid = ' + entgroupid);
		if (navigator.userAgent.match(/android/i)) {
		     // 通过iframe的方式试图打开APP，如果能正常打开，会直接切换到APP，并自动阻止a标签的默认行为
		     // 否则打开a标签的href链接
		     console.log("安卓");
		     var isInstalled;
		     //下面是安卓端APP接口调用的地址，自己根据情况去修改
		     var querystr = 'groupId=' + entgroupid + '&telephone=' + telephone;
		     var ifrSrc = 'redcirclemanagement://com.hecom.management.android/customergroup?'+querystr;
		     var ifr = document.createElement('iframe');
		     ifr.src = ifrSrc;
		     ifr.style.display = 'none';
		     // ifr.style.display = 'none';
		     ifr.onload = function() {
			     isInstalled = true;
			     //  alert('已安装');
			     //  window.location.href="RedCircleManagement://";
			     // document.getElementById('openApp0').click();
		 	 };
		     ifr.onerror = function() {
		         isInstalled = false;
		         // alert('未安装');
		     }
		     document.body.appendChild(ifr);
		     setTimeout(function() {
		         document.body.removeChild(ifr);
		     },2000);
		}
		if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
			var querystr = 'groupId=' + entgroupid + '&telephone=' + telephone;
			window.location.href = 'redcirclemanagement://startAGroupChat?'+querystr;
		}
	}

	lists.init();
});
