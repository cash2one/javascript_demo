;(function($){
    var e = {
        nextAll: function(s) {
            var $els = $(), $el = this.next()
            while( $el.length ) {
                if(typeof s === 'undefined' || $el.is(s)) $els = $els.add($el)
                $el = $el.next()
            }
            return $els
        },
        prevAll: function(s) {
            var $els = $(), $el = this.prev()
            while( $el.length ) {
                if(typeof s === 'undefined' || $el.is(s)) $els = $els.add($el)
                $el = $el.prev()
            }
            return $els
        }
    };
    $.extend( $.fn, e );
})(Zepto);
$(function() {
    //页面对象
    var OMS = {
        init: function () {
            this.initNativeBar();
            this.initParams();
            this.initListener();

            this.refreshSearch();
        },
        initParams: function () {
            this.filterObj = {};
            this.filterObj.page = 1;

            this.pageSize = 30;
            this.lastSize = 0;

            this.pageStatus = 'salerList'; //salerList, orgList

            this.Util = new Util();
            this.Home = new Home();

            window.openSearch = this.openSearch;
        },
        openSearch: function() {
            var key = $.trim($('.ui-searchbar-input input').val());
            $('.ui-searchbar-input input').blur();
            setTimeout(function () {
                OMS.refreshSearch(key);
            }, 300);
            event.stopPropagation();
        },
        initListener: function () {
            var self = this;

            self.Util._bind($('#searchwrap .ui-searchbar-cancel'), function(event) {
                $('.ui-searchbar-wrap').removeClass('focus');
                $('.ui-searchbar-input input').val('');
                if (self.pageStatus == "salerList") {
                    setTimeout(function () {
                        self.refreshSearch();
                    }, 300);
                }
                else {
                    self.refreshOrgList();
                }
                event.stopPropagation();
            });

            $("#searchwrap .ui-icon-close").on("click", function() {
                $('.ui-searchbar-input input').val('');
                $('.ui-searchbar-input input').focus();
                event.stopPropagation();
            });

            $('#searchwrap .ui-searchbar').on("click", function(event) {
                $('.ui-searchbar-wrap').addClass('focus');
                $('.ui-searchbar-input input').focus();
                event.stopPropagation();
            });

            $('.scroller').on('touchstart', function(e) {
                $('#searchwrap input').blur();
            });

            window.addEventListener('resize', function() {
                if (self.myScroll) self.myScroll.refresh();
            }, false);

            //切换页面状态
            self.Util._bind($('.org-entrance'), function() {
                if ($('body').hasClass('org-page')) return;
                self.updatePageStatus();
            });
        },
        updatePageStatus: function () {
            var self = this;
            //初始化搜索栏
            $('.ui-searchbar-wrap').removeClass('focus');
            $('.ui-searchbar-input input').val('');
            $('#searchwrap input').blur();

            if (this.pageStatus == 'salerList') {
                this.pageStatus = 'orgList';
                $('.org-entrance').hide();
                $('body').addClass('org-page');
                self.refreshOrgList();
            }
            else {
                this.pageStatus = 'salerList';
                $('.org-entrance').show();
                $('body').removeClass('org-page');
                self.refreshSearch();
            }
        },
        refreshOrgList: function () {
            $("#salerList").hide();
            $("#orgList").show();
            OMS.destroyScroll();

            if (!OMS.orgList || OMS.Util.isNullObject(this.orgList)) {
                OMS.orgList = {};
                var htmlTpl = "<div id='err-msg'>正在加载中...</div>";
                var offsetHeight = $("#wrapper").height() - $("#org-banner").height();
                $("#err-msg").remove();
                $("#org-content").css("height", offsetHeight + "px");
                $("#org-content").html(htmlTpl);
                OMS.getOrgSubordinate();
            }
        },
        getOrgSubordinate: function (key, value) {
            OMS.sendData = {};
            OMS.sendData.key = key || 'rooter';
            OMS.sendData.value = value || '';
            if(!key) {
                if(OMS.orgList && OMS.orgList.rooter)
                    OMS.renderOrg(OMS.orgList.rooter);
                else
                    OMS.Home.getOrgSubordinate();
            }
            else {
                var sendData = {};
                sendData[key] = value;
                if(OMS.orgList && OMS.orgList[key] && OMS.orgList[key][value])
                    OMS.renderOrg(OMS.orgList[key][value]);
                else
                    OMS.Home.getOrgSubordinate(sendData);
            }
        },
        renderOrg: function (data) {
            // 1，标题渲染，初始化
            if (!$(".org-banner-title").length && data && data.banner) {
                var htmlTitle =
                    '<div class="org-banner-title" data-key="" data-value="">' + data.banner + '</div>';
                $("#org-banner").html(htmlTitle);
                $("#org-banner").show();
                OMS.bindOrgTitleEvt();
            }
            // 2，验证data.banner 和 data.orgs 和 data.salers是否存在
            if (!data || OMS.Util.isNullObject(data) || ((!data.orgs || !data.orgs.length) && (!data.salers || !data.salers.length))) {
                if (!$("#err-msg").length) {
                    var htmlTpl = "<div id='err-msg'>不存在组织架构!</div>";
                    $("#org-content").html(htmlTpl);
                }
                else
                    $("#err-msg").html("不存在组织架构!");

                return ;
            }
            $("#err-msg").remove();
            // 3，渲染data.orgs
            if (data.orgs && data.orgs.length)
                OMS.renderOrgList(data.orgs);

            // 4，渲染data.salers
            if (data.salers && data.salers.length)
                OMS.renderSalerList(data.salers);

            // 5，更新当前组织机构列表
            OMS.updateOrgList(data);

            // 6，绑定机构列表事件
            OMS.bindOrgContentEvt();
        },
        renderOrgList: function (data) {
            var htmlTpl = '<ul class="org-content-orglist ui-border-b">';
            for (var i = 0, len = data.length; i < len; i++) {
                htmlTpl += '<li class="ui-border-t">';
                htmlTpl += '<div class="itemOrgContent" data-key="' + data[i].key + '" data-value="' + data[i].value + '">' + data[i].name + '</div>';
                htmlTpl += '<div class="itemOrgBtn"><i class="ui-icon-list_arrow_right"></i></div>';
                htmlTpl += '</li>';
            }
            htmlTpl += '</ul>';

            $("#org-content").html(htmlTpl);
        },
        renderSalerList: function (data) {
            var htmlTpl = '<ul class="org-content-salerlist ui-border-tb">';
            for (var i = 0, len = data.length; i < len; i++) {
                htmlTpl += '<li class="ui-border-t">';
                htmlTpl +=
                    '<div class="itemSalerContent" data-isowner="' + data[i].isowner + '" data-code="' + data[i].id + '" data-isnew="' + data[i].isnew + '">' +
                        '<p class="itemName">' + data[i].realname + '</p>' +
                        '<p class="itemToggle">' + (data[i].position_name || "暂无职位") + '</p>' +
                    '</div>';
                if ($.trim(data[i].telephone).length) {
                    htmlTpl +=
                        '<div class="itemSalerBtn" data-phone="' + data[i].telephone  + '">' +
                            '<i class="ui-icon-phone-2"></i>' +
                        '</div>';
                }
                htmlTpl += '</li>';
            }
            htmlTpl += '</ul>';

            $("#org-content").append(htmlTpl);
        },
        updateOrgList: function (data) {
            var key = this.sendData.key;
            var value = this.sendData.value;
            if (!this.orgList[key]) {
                if (key == "rooter")
                    this.orgList.rooter = data;
                else {
                    this.orgList[key] = {};
                    this.orgList[key][value] = data;
                }
            }
            else if (!this.orgList[key][value])
                this.orgList[key][value] = data;
        },
        bindOrgTitleEvt: function () {
            OMS.Util._bind($("#org-banner"), function (e) {
                if ($(e.target).hasClass("clickable")) {
                    var key = $(e.target).data("key") || "",
                        value = $(e.target).data("value") || "";

                    $(e.target).removeClass("clickable");
                    $(e.target).nextAll().remove();

                    OMS.initOrgContent();
                    OMS.getOrgSubordinate(key, value);
                }
            });
        },
        bindOrgContentEvt: function () {
            // 打开组织机构事件（机构列表）
            OMS.Util._bind($("#orgList .itemOrgContent"), function() {
                var key = $(this).data("key") || "",
                    value = $(this).data("value") || "",
                    name = $.trim($(this).html());

                OMS.initOrgContent();
                var htmlTitle =
                    '<i class="ui-icon-list_arrow_right"></i><div class="org-banner-title" data-key="' + key + '" data-value="' + value + '">' + name + '</div>';
                $("#org-banner").find(".org-banner-title").addClass("clickable");
                $("#org-banner").append(htmlTitle);
                OMS.getOrgSubordinate(key, value);
            });

            // 打开下属详情事件（下属列表）, 这部分事件同搜索列表
            OMS.bindEvent("#orgList");

            //初始化orgContent，设置滚动
            var offsetHeight = $("#wrapper").height() - $("#org-banner").height();
            $("#org-content").css("height", offsetHeight + "px");
        },
        initOrgContent: function () {
            var htmlTpl = "<div id='err-msg'>正在加载中...</div>";
            $("#err-msg").remove();

            $("#org-content").html(htmlTpl);
        },
        refreshSearch: function (val) {
            OMS.initFilter(val);
            OMS.Home.getSubordinate();
        },
        getMoreSearch: function () {
            if(OMS.lastSize < OMS.pageSize) return;
            OMS.Home.getSubordinate();
        },
        initFilter: function (val) {
            this.destroyScroll();
            this.filterObj.page = 1;
            this.filterObj.keyword = val || '';
            this.salerList = {};

            $("#salerList").show();
            $("#orgList").hide();

            var htmlTpl = "<li id='err-msg'>正在加载中...</li>";
            $("#err-msg").remove();
            $("#salerList").html(htmlTpl);
        },
        destroyScroll: function () {
            if(this.myScroll && this.myScroll.destroy) {
                OMS.myScroll.scrollToElement($(".scroller")[0], 0);
                this.myScroll.destroy();
                this.myScroll = null;
                $("#wrapper").find("#pullDown").remove();
                $("#wrapper").find("#pullUp").remove();
            }
        },
        render: function (data) {
            OMS.filterObj.page++;
            //当下属为空时，data是一个空Array，不然是一个data.list的Object
            if (OMS.Util.isNullObject(OMS.salerList) && (!data || !data.list || (OMS.Util.isArray(data.list) && data.list.length === 0))) {
                $("#err-msg").html("未查询到相关业务员");
            }
            else {
                $("#err-msg").remove();
                OMS.renderListClass(data.list);
            }
        },
        renderListClass: function (list) {
            var htmlTpl = "",
                Groups =  Object.keys(list) || [],
                temp = [];
            // 布局list分组
            for(var i = 0, len = Groups.length; i < len; i++) {
                var code = Groups[i];
                if(!this.salerList[code] && list[code].length > 0) {
                    this.salerList[code] = list[code];
                    htmlTpl += '<li>' +
                        '<div class="user-group ui-border-b" data-code="' + code + '">' + code + '</div>' +
                        '<ul class="user-group-cell ui-border-b"></ul>' +
                    '</li>';
                }
                else
                    this.salerList[code].concat(list[code]);
                temp = temp.concat(list[code]);
            }
            $("#salerList").append(htmlTpl);
            if (temp.length > 0) {
                this.renderListLi(temp);
                this.renderScroll();
                this.bindEvent("#salerList");
            }
        },
        renderListLi: function (salerList) {
            var len = this.lastSize = salerList.length;
            for(var i = 0; i < len; i++) {
                var code = salerList[i].let;
                var htmlTpl = '<li class="ui-border-t">' +
                    '<div class="itemSalerContent" data-code="' + salerList[i].id + '" data-isnew="' + salerList[i].isnew + '">' +
                        '<p class="itemName">' + salerList[i].realname + '</p>' +
                        '<p class="itemToggle">' + (salerList[i].position_path || "暂无所属部门") + '</p>' +
                    '</div>';
                if ($.trim(salerList[i].telephone).length) {
                    htmlTpl +=
                        '<div class="itemSalerBtn" data-phone="' + salerList[i].telephone  + '">' +
                            '<i class="ui-icon-phone-2"></i>' +
                        '</div>';
                }
                htmlTpl += '</li>';
                $("[data-code='" + code + "']").siblings("ul").append(htmlTpl);
            }
        },
        renderScroll: function () {
            if(this.lastSize < this.pageSize)
                $("#pullUp").hide();

            if (this.myScroll)
                this.myScroll.refresh();
            else if (this.lastSize < this.pageSize)
                this.myScroll = new myIScroll("wrapper");
            else
                this.myScroll = new myIScroll("wrapper", null, this.getMoreSearch);
        },
        bindEvent: function (elStr) {
            var self = this;
            this.Util._bind($(elStr + " .itemSalerContent"), function() {
                var code = $(this).data("code"),
                    isnew = $(this).data("isnew"),
                    isowner = $(this).data("isowner");
                if (elStr == "#orgList" && !isowner) return;
                openLink(oms_config.baseUrl + "profile.html?id=" + code + "&do=" + isnew + "&jumpType=close", true);
            });
            this.Util._bind($(elStr + " .itemSalerBtn"), function(e) {
                var telphone = $.trim($(this).data("phone"));
                if(!telphone) {
                    dd.device.notification.toast({
                        icon: '',
                        text: "未找到该员工的联系电话",
                        onSuccess : function(result) {},
                        onFail : function(err) {}
                    });
                }
                window.location.href = "tel:" + telphone;
            });
        },
        initNativeBar: function () {
            this.initTitleBar();
            this.initLeftBar();
        },
        initTitleBar: function () {
            dd.ready(function(){
                dd.biz.navigation.setTitle({
                    title: '下属',
                    onSuccess : function(result) {},
                    onFail : function(err) {}
                });
            });
        },
        initLeftBar: function() {
            dd.ready(function(){
                if(dd.ios){
                    dd.biz.navigation.setLeft({
                        show: true,
                        control: true,
                        showIcon: true,
                        text: '',
                        onSuccess : function(result) {
                            if (OMS.pageStatus == "salerList")
                                history.back(-1);
                            else
                                OMS.updatePageStatus();
                        },
                        onFail : function(err) {}
                    });
                }else{
                    //omsapp-android-setLeft-visible:true
                    dd.biz.navigation.setLeft({
                        visible: true,
                        control: false,
                        text: ''
                    });
                    $(document).off('backbutton');
                    $(document).on('backbutton', function(e) {
                        if (OMS.pageStatus == "salerList")
                            history.back(-1);
                        else
                            OMS.updatePageStatus();
                        e.preventDefault();
                    });
                }
            });
        }
    };
    /***公共方法－Util 工具函数 Start***/
    var Util = function () {};
    Util.prototype = {
        // 保留构造函数的原型指针指向原型对象
        constructor: Util,
        isNullObject: function (data) {
            var isHasObj = true;
            if (typeof data === "object" && !(data instanceof Array)) {
                for (var i in data) {
                    isHasObj = false;
                    break;
                }
            }
            return isHasObj;
        },
        isArray: function (data) {
            return Object.prototype.toString.call(data) === "[object Array]";
        },
        _bind: function (el, fn) {
            var startX = 0, startY = 0, endX = 0, endY = 0;
            function startHandle(e){
                // e.preventDefault();
                startX = e.changedTouches[0].clientX;
                startY = e.changedTouches[0].clientY;
            }
            function moveHandle(e){
                // e.preventDefault();
            }
            function endHandle(e) {
                // e.preventDefault();
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
        }
    };
    /***接口调用－Home 接口函数 Start***/
    var Home = function () {};
    Home.prototype = {
        constructor: Home,
        sendQuest: function (config) {
            var apiUrl = oms_config.apiUrl + config.apiUrl;
            var sendData = config.data || {},
                self = this;
            sendData.omsuid = OMS.user.id;
            sendData.token = OMS.user.token;
            $.ajax({
                url: apiUrl,
                type: config.type || 'get', //默认get
                data: sendData,
                cache: false,
                success: function(response){
                    if(response){
                        var result = JSON.parse(response);
                        if(result.res === 1)
                            config.callback && config.callback(result.data);
                        else if(result.msg)
                            self.error(result.msg);
                    }
                    else
                        self.error("服务异常");
                },
                error: function(xhr, errorType, error){
                    if(errorType == "abort") return;
                    self.error("网络请求失败");
                }
            })
            .always(function () {
                self["is" + config.api] = false;
            });
        },
        getSubordinate: function () {
            var config = {
                api: 'getSubordinate',
                apiUrl: "apiUser/getSubordinate/", //获取数据的接口
                type: "post"
            };
            config.data = OMS.filterObj;
            config.callback = OMS.render;

            if(!this.isgetSubordinate) {
                this.isgetSubordinate = true;
                this.sendQuest(config);
            }
        },
        getOrgSubordinate: function (data) {
            var config = {
                api: 'getOrgSubordinate',
                apiUrl: "apiUser/getOrgSubordinate/", //获取数据的接口
                type: "post"
            };
            config.data = data || {};
            config.callback = OMS.renderOrg;
            if(!this.isgetOrgSubordinate) {
                this.isgetOrgSubordinate = true;
                this.sendQuest(config);
            }
        },
        error: function (msg) {
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
                if($("#err-msg").length === 0)
                    dd.ready(function() {
                        dd.device.notification.toast({
                            icon: '',
                            text: msg,
                            onSuccess : function(result) {},
                            onFail : function(err) {}
                        });
                    });
                else
                    $("#err-msg").html(msg);
            }
        }
    };
    //登陆验证
    $.fn.OMS = function(settings){ $.extend(OMS, settings || {});};
    $.fn.ready(function() {
        var loginApi=oms_config.apiUrl + oms_apiList.login;
        new Login(oms_config.corpId,oms_config.baseUrl,loginApi,function(){
            var omsUser = getCookie('omsUser');
            if(omsUser) omsUser = JSON.parse(omsUser);

            if(omsUser && omsUser.res === 1){
                if(omsUser.role === -1) {
                    dd.ready(function() {
                        dd.device.notification.alert({
                            message: omsUser.msg,
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
                    OMS.user = omsUser;
                    OMS.init();
                }
            }
            else {
                dd.ready(function() {
                    dd.device.notification.alert({
                        message: "登录失败",
                        title: "提示",
                        buttonName: "离开",
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
        });
    });
});
