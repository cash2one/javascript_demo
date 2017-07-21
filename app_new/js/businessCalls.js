$(function(){
    FastClick.attach(document.body);
    // 界面调用
    var OMS = {
        init: function () {
            this.initParams();
            this.render();
        },
        initParams: function () {
            this.Home = new Home();
            this.page = ['BUSCALLS', 'TELCONFER', 'SELECT'];
            // this.index = 0;
            // var page = getUrlParam("page") || '';
            // if (this.page.indexOf(page) > -1)
            //     this.index = this.page.indexOf(page);

            this.isAutoSkip = false;
            var href = window.location.href;
            if (href.indexOf("businessCalls") > -1)
                this.isAutoSkip = true;
        },
        render: function () {
            if (this.isAutoSkip)
                BUSCALLS.init();
            else
                window.openSelect = SELECT.init;
        }
    };
    // 商务电话
    var BUSCALLS = {
        init: function (){
            OMS.Home.getUserStatus();
            this.setNativeBar();
            this.render();
        },
        getCheckCalls: function (res) {
            if (res && res.is_on === 1) {
                BUSCALLS.showPhone(res.data);
            }
        },
        showPhone: function(data) {
            var htmlTpl = "<div id='dailing' style='position: fixed; width: 52px; height: 52px; left: 15px; bottom: 65px; z-index: 9999; border-radius: 100%; background-image: url(./img/dailing.png); background-repeat: no-repeat; background-position: center; background-size: 52px auto;'></div>";

            $("body").append(htmlTpl);
            $("#dailing").on("click", function() {
                if (+data.list_type === 1)
                    openLink("businessCallMeeting.html?id=" + data.confid);
                else
                    openLink("businessCallSingle.html?id=" + data.id);
            });
        },
        isLeader: function () {
            return +OMS.user.role === 5 && +OMS.user.isCityLeader !== 1;
        },
        render: function () {
            var isLeader = this.isLeader();
            var htmlTpl = "<div id='businessCalls'>";
            htmlTpl +=
            "<header>" +
                "<div class='title ui-border-t'>通话记录</div>" +
            "</header>";
            htmlTpl +=
            "<section id='busBody'>" +
                "<div class='scroller'>" +
                    "<ul class='ui-list ui-list-text' id='callLog'></ul>" +
                "</div>" +
            "</section>";
            htmlTpl += "<footer>";
            htmlTpl += "<ul class='ui-row ui-border-t'>";
            htmlTpl +=
            "<li class='ui-col" + (isLeader ? " ui-col-50 ui-border-r" : "") + "' data-action='telCall'>"+
                "<i class='ui-icon-meeting_call'></i>" +
                "<span>发起电话</span>" +
            "</li>";
            if (isLeader)
                htmlTpl +=
                "<li class='ui-col ui-col-50' data-action='telConfer'>" +
                    "<i class='ui-icon-meeting_conferencecall'></i>" +
                    "<span>电话会议</span>" +
                "</li>";
            htmlTpl += "</ul>";
            htmlTpl += "</footer>";
            htmlTpl += "</div>";
            $("body").append(htmlTpl);
            this.initEvent();
            this.refresh();
        },
        initEvent: function () {
            $("#businessCalls [data-action='telCall']").on("click", function(e) {
                SELECT.init(0);
            });
            $("#businessCalls [data-action='telConfer']").on("click", function(e) {
                TELCONFER.init();
            });
        },
        initFilterObj: function () {
            this.destroy();
            this.callLog = [];
            this.lastSize = 0;
            this.pageSize = 20;

            this.filterObj = {};
            this.filterObj.page = 1;
            this.filterObj.uid = OMS.user.id;
            this.filterObj.pagesize = this.pageSize;
        },
        refresh: function () {
            this.initFilterObj();

            var htmlTpl = "<li id='err-msg'>正在加载中...</li>";
            $("#err-msg").remove();
            $(".no-data-buscalls").remove();
            $("#callLog").html(htmlTpl);
            $("#businessCalls .scroller").show();
            $("#businessCalls .title").hide();

            OMS.Home.getCallLog();
        },
        getMore: function () {
            if (BUSCALLS.lastSize < BUSCALLS.pageSize) return;
            OMS.Home.getCallLog();
        },
        renderList: function (data) {
            BUSCALLS.filterObj.page++;
            BUSCALLS.lastSize = data.length;
            if (BUSCALLS.callLog && BUSCALLS.callLog.length)
                BUSCALLS.callLog.concat(data);
            else
                BUSCALLS.callLog = data;

            if (!BUSCALLS.callLog.length) {
                $("#businessCalls .scroller").hide();
                var htmlTpl =
                    "<div class='no-data-buscalls'>" +
                        "<p>商务电话记录将会显示在这里</p>" +
                    "</div>";
                $("#businessCalls #busBody").append(htmlTpl);
                // $("#err-msg").html("您还没有通话记录");
            }
            else {
                $("#businessCalls .title").show();
                $("#err-msg").remove();
                if (!data.length) {
                    $("#callLog").append('<li class="noMore ui-border-t" style="text-align:center;"><div style="width:100%; font-size: 14px; color: #999;"><p>无更多通话记录</p></div></li>');
                }
                var htmlTpl = BUSCALLS.renderListLi(data);
                $("#businessCalls #callLog").append(htmlTpl);

                BUSCALLS.renderScroll();
                BUSCALLS.bindEvent();
            }
        },
        renderListLi: function (data) {
            var htmlTpl = "";
            var list = this.formatData(data);
            for (var i = 0; i < this.lastSize; i++) {
                htmlTpl +=
                "<li class='ui-border-t' data-type='" + list[i].list_type + "' data-id='" + list[i].listId + "'>" +
                    "<div class='log-cell'>" +
                        "<div class='log-cell-info" + (!list[i].desc?" is-flex": "") + "'>" +
                            "<p class='log-cell-subject'>" + list[i].title + "</p>" +
                            "<p class='log-cell-desc'>" + list[i].desc + "</p>" +
                        "</div>" +
                        "<div class='log-cell-tel" + (list[i].listSts?" no-flex":"") + "'>" +
                            "<p class='log-cell-time'>" + list[i].time + "</p>" +
                            "<p class='log-cell-status'>" + list[i].listSts + "</p>" +
                        "</div>" +
                        "<i class='ui-icon-meeting_detail'></i>" +
                    "</div>" +
                "</li>";
            }
            return htmlTpl;
        },
        formatData: function (data) {
            var temp = [];
            for (var i = 0, len = data.length; i < len; i++) {
                var obj = {};
                obj.list_type = data[i].list_type;
                obj.time = this.getTime(data[i].ctime);
                if (+obj.list_type === 1) {
                    obj.listId = data[i].confid;
                    obj.title = data[i].subject;
                    obj.listSts = "";
                    var str = "";
                    for(var j = 0, size = data[i].participates.length; j < size; j++) {
                        var tempObj = data[i].participates[j];
                        if (j - 4 < 0) {
                            str += str ? "," + tempObj.realname : tempObj.realname;
                        }
                        else if (j === 4) {
                            str += "等" + size + "人";
                        }
                        // if (tempObj.uid == OMS.user.id && tempObj.call_status == "1")
                        if (tempObj.call_status == "1")
                            obj.listSts = "会议中";
                    }
                    obj.desc = str;
                }
                else {
                    obj.listId = data[i].id;
                    obj.title = data[i].contactor;
                    if (data[i].usertype == "0")
                        obj.desc = data[i].cusname;
                    else
                        obj.desc = data[i].dept == "未知部门" ? "" : data[i].dept;

                    obj.listSts = data[i].call_status == "1" ? "通话中" : "";
                }
                temp.push(obj);
            }
            return temp;
        },
        getTime: function (stamp){
            var now   = new Date();
            var nowDate = now.getFullYear() + "/" + (now.getMonth() + 1) + "/" + now.getDate();

            var currentDate = new Date(stamp.replace(/-/g, '/'));
            var timeStamp = currentDate.getTime();

            var weekDay = now.getDay();
            if (weekDay === 0) weekDay = 7;
            var todayTime = new Date(nowDate).getTime();
            var lastDayTime = todayTime - 86400000;
            var weekDayTime = todayTime - (weekDay - 1) * 86400000;


            var str = "";
            if (todayTime < timeStamp) {
                var hour = currentDate.getHours();
                var minute = currentDate.getMinutes();
                str = (hour < 10 ? "0" + hour : hour) + ":" + (minute < 10 ? "0" + minute : minute);
                // str = hour + ":" + minute;
            }
            else if (lastDayTime < timeStamp) {
                str = "昨天";
            }
            else if (weekDayTime < timeStamp) {
                var arr = ["一", "二", "三", "四", "五", "六", "日"];
                str = "星期" + arr[weekDay - 1];
            }
            else {
                var month = currentDate.getMonth() + 1;
                var days = currentDate.getDate();
                str = month + "月" + days + "日";
            }
            return str;
        },
        renderScroll: function () {
            if (this.myScroll) {
                if(this.lastSize < this.pageSize)
                    $("#busBody #pullUp").hide();
                this.myScroll.refresh();
            }
            else if (this.lastSize < this.pageSize)
                this.myScroll = new myIScroll("busBody");
            else
                this.myScroll = new myIScroll("busBody", null, this.getMore);
        },
        destroy: function () {
            if (this.myScroll) {
                if (this.myScroll.destroy) {
                    this.myScroll.scrollToElement($("#businessCalls .scroller")[0], 0);
                    this.myScroll.destroy();
                }
                this.myScroll = null;

                $("#busBody").find("#pullDown").remove();
                $("#busBody").find("#pullUp").remove();
            }
        },
        bindEvent: function () {
            bindEvent($("#callLog li"), function(e){
                var data = $(this).data();

                if ($(e.target).hasClass("ui-icon-meeting_detail")) {
                    openLink("businessDetail.html?id=" + data.id + "&type=" + data.type);
                }
                else {
                    if (data.type === 1)
                        openLink("businessCallMeeting.html?id=" + data.id);
                    else
                        openLink("businessCallSingle.html?id=" + data.id);
                }
            });
        },
        setNativeBar: function () {
            this.initTitleBar();
            this.initLeftBar();
        },
        initTitleBar: function () {
            dd.ready(function(){
                dd.biz.navigation.setTitle({
                    title: "商务电话",
                    onSuccess : function(result) {},
                    onFail : function(err) {}
                });
            });
        },
        initLeftBar: function () {
            dd.ready(function(){
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
                    //omsapp-android-setLeft-visible:true
                    dd.biz.navigation.setLeft({
                        visible: true,
                        control: false,
                        text: ''
                    });
                    $(document).off('backbutton');
                    $(document).on('backbutton', function(e) {
                        history.back(-1);
                        e.preventDefault();
                    });
                }
            });
        }
    };
    // 选择人员
    var SELECT = {
        init: function (fromIndex, data, callback) {
            SELECT.initParams(fromIndex, data, callback);
            SELECT.setNativeBar();
            SELECT.render();
        },
        initParams: function (fromIndex, data, callback) {
            this.pageType = fromIndex; //0 不可选 1或以上 可选
            this.fromPage = OMS.page[fromIndex] || "SELECT"; // 来源页面
            this.type = 1; //页面类型：1 选择员工（下属） 0 选择客户联系人
            this.skipPage = true;

            this.participates = [];
            if (this.fromPage == "TELCONFER") {
                var telConferData = this.oldparticipates = TELCONFER.filterObj.participates;
                for(var i = 0, len = telConferData.length; i < len; i++) {
                    var temp = deepCopy(telConferData[i]);
                    this.participates.push(temp);
                }
            }
            else if (this.fromPage == "SELECT") {
                var telConferData = this.oldparticipates = data;
                for(var i = 0, len = telConferData.length; i < len; i++) {
                    var temp = deepCopy(telConferData[i]);
                    this.participates.push(temp);
                }
                this.callBack = callback;
            }
            this.MAXMEMBERS = 8;
            this.isAdd = true;
            if (this.participates.length - this.MAXMEMBERS > 0)
                this.isAdd = false;

            this.filterObj = {};
            this.filterObj.page = 1;

            this.pageSize = 30;
            this.lastSize = 0;
            this.myScroll = null;
            window.openSearch = this.openSearch;
        },
        render: function () {
            var partLen = this.participates.length - 1;
            var htmlTpl = "<div id='selMember'>";
            htmlTpl +=
                "<header>" +
                    "<div class='ui-searchbar-wrap ui-border-b' id='searchwrap'>" +
                        "<div class='ui-searchbar'>" +
                            "<i class='ui-icon-public_search'></i>" +
                            "<div class='ui-searchbar-text'>搜索</div>" +
                            "<div class='ui-searchbar-input'>" +
                                "<form action='javascript:void(0)' onsubmit='openSearch();'>" +
                                    "<input value='' type='search' placeholder='搜索' autocapitalize='off'>" +
                                "</form>" +
                            "</div>" +
                            "<i class='ui-icon-close'></i>" +
                        "</div>" +
                        "<button class='ui-searchbar-cancel'>取消</button>" +
                    "</div>";
                    // 企业通讯录 和 客户联系人 互相切换
            if (+OMS.user.role !== 5)
                htmlTpl +=
                    "<div class='roleSwitch ui-border-b'>" +
                        "<div>客户联系人</div>" +
                        "<i class='ui-icon-list_arrow_right'></i>" +
                    "</div>";
            htmlTpl += "</header>";
            htmlTpl +=
                "<section id='wrapper'>" +
                    "<div class='scroller'>" +
                        "<ul class='ui-list ui-list-text' id='salerList'></ul>" +
                    "</div>" +
                "</section>";

            if (this.pageType) {
                htmlTpl += "<footer class='ui-border-t'>";
                if (partLen > 0) {
                    htmlTpl += "<div class='selectedUser'><div style='width:" + partLen * 80 + "px'>";
                    for (var i = 0, len = this.participates.length; i < len; i++) {
                        if (+this.participates[i].type === 0) continue;
                        htmlTpl += this.renderMemberLi(this.participates[i]);
                    }
                    htmlTpl +="</div></div>";
                    htmlTpl += "<div class='submitBtn clickable'>确定(" + partLen + ")</div>";
                }
                else {
                    htmlTpl +=
                        "<div class='selectedUser'><div>" +
                            "<em>请选择员工</em>" +
                        "</div></div>" +
                        "<div class='submitBtn'>确定(0)</div>";
                }
                htmlTpl += "</footer>";
            }
            if (this.fromPage == "TELCONFER")
                $("#telConfer").hide();
            else if (this.fromPage == "BUSCALLS")
                $("#businessCalls").hide();

            htmlTpl += "</div>";
            $("body").append(htmlTpl);

            if (this.pageType)
                $("#selMember #wrapper").addClass("wrapperBtm");
            if (OMS.user.role === 5)
                $("#selMember #wrapper").addClass("isLeader");

            this.initEvent();
            this.refreshSearch();
        },
        initEvent: function () {
            var self = this;
            $("#searchwrap .ui-searchbar-cancel").on("click", function (event) {
                $(".ui-searchbar-wrap").removeClass("focus");
                $(".ui-searchbar-input input").val("");
                setTimeout(function () {
                    if (self.type === 0)
                        self.refreshContacts();
                    else
                        self.refreshSearch();
                }, 300);
                event.stopPropagation();
            });
            $("#searchwrap .ui-icon-close").on("click", function (event) {
                $(".ui-searchbar-input input").val("");
                $(".ui-searchbar-input input").focus();
                event.stopPropagation();
            });
            $("#searchwrap .ui-searchbar").on("click", function (event) {
                $(".ui-searchbar-wrap").addClass("focus");
                $(".ui-searchbar-input input").focus();
                event.stopPropagation();
            });
            $("#selMember .roleSwitch").on("click", function (event) {
                if (self.type === 1) {
                    if (self.pageType)
                        $(this).find("div").html("企业通讯录");
                    else {
                        $(this).remove();
                        self.updateTitleBar();
                        self.skipPage = false;
                        $("#selMember #wrapper").addClass("isLeader");
                    }
                    self.type = 0;
                    if (OMS.Home.isAjax) {
                        OMS.Home.isAjax.abort && OMS.Home.isAjax.abort();
                        OMS.Home.isgetMember = false;
                    }
                    self.refreshContacts();
                }
                else if (self.type === 0) {
                    $(this).find("div").html("客户联系人");

                    self.type = 1;
                    if (OMS.Home.isAjax) {
                        OMS.Home.isAjax.abort && OMS.Home.isAjax.abort();
                        OMS.Home.isgetMember = false;
                    }
                    self.refreshSearch();
                }
                event.stopPropagation();
            });
            $("#selMember footer").on("click", function (e) {
                if ($(e.target).hasClass("submitBtn") && $(e.target).hasClass("clickable")) {
                    var temp = [];
                    if (self.fromPage == "TELCONFER") {
                        var partLen = self.participates.length,
                            htmlTpl = "";
                        TELCONFER.filterObj.participates = [];
                        for (var i = 0; i < partLen; i++) {
                            TELCONFER.filterObj.participates.push(self.participates[i]);
                            if (!self.participates[i].type) continue;
                            htmlTpl += TELCONFER.renderPersonLi(self.participates[i]);
                        }
                        $("#telConfer #addMember").siblings("li").remove();
                        $("#telConfer #addMember").before(htmlTpl);

                        if (partLen) {
                            $("#telConfer #immediate").addClass("clickable");
                            if (self.MAXMEMBERS - partLen > 0)
                                $("#telConfer #addMember").show();
                            else
                                $("#telConfer #addMember").hide();
                        }
                        else {
                            $("#telConfer #addMember").show();
                            $("#telConfer #immediate").removeClass("clickable");
                        }
                    }
                    else if (self.fromPage == "SELECT") {
                        var partLen = self.participates.length;
                        for (var i = 0; i < partLen; i++) {
                            if (self.codeInSelected(self.participates[i], self.oldparticipates))
                                continue;
                            else
                                temp.push(self.participates[i]);
                        }
                    }
                    self.goBack(temp);
                }
                else if ($(e.target).hasClass("member-delete")) {
                    var data = $(e.target).parent().data();
                    var telConferData = self.participates, index = null;
                    for(var i = 0, len = telConferData.length; i < len; i++) {
                        if (+telConferData[i].uid === +data.uid && telConferData[i].type == data.type) {
                            index = i;
                            break;
                        }
                    }
                    if (index !== null) self.participates.splice(index, 1);
                    var partLen = self.participates.length - 1;
                    if (data.type == self.type)
                        $("#salerList [data-uid='" + data.uid + "']").find(".filterli").removeClass("activeli");

                    if (!partLen) {
                        $("#selMember .selectedUser").html("<div><em>请选择员工</em></div>");
                        $("#selMember .submitBtn").html("确定(0)");
                        $("#selMember .submitBtn").removeClass("clickable");
                    }
                    else
                        $("#selMember .submitBtn").html("确定(" + partLen + ")");

                    self.isAdd = true;
                    $(e.target).parent().remove();
                    self.setFooterwidth();
                }
            });
            $("#selMember .scroller").on("touchstart", function(e) {
                $(".ui-searchbar-input input").blur();
            });
            window.addEventListener("resize", function() {
                if (self.myScroll) self.myScroll.refresh();
            }, false);
        },
        openSearch: function () {
            var value = $.trim($(".ui-searchbar-input input").val());
            $(".ui-searchbar-input input").blur();
            setTimeout(function () {
                if (SELECT.type === 0)
                    SELECT.refreshContacts(value);
                else
                    SELECT.refreshSearch(value);
            }, 300);
            event.stopPropagation();
        },
        refreshSearch: function (value) {
            this.initFilterObj(value);
            OMS.Home.getSubordinate();
        },
        getMoreSearch: function () {
            if(SELECT.lastSize < SELECT.pageSize) return;
            OMS.Home.getSubordinate();
        },
        refreshContacts: function (value) {
            this.destroy();
            // 1，界面初始化
            var htmlTpl = "<li id='err-msg'>正在加载中...</li>";
            $("#err-msg").remove();
            $("#salerList").html(htmlTpl);
            // 2，初始化参数
            this.lastSize = 0;
            this.salerList = {};
            this.sendObj = {};
            this.sendObj.role = OMS.user.role;
            this.sendObj.size = this.pageSize;
            // 3，发起请求
            if (value) {
                this.sendObj.page = 0;
                this.sendObj.keyword = value;
                OMS.Home.getContactByName();
            }
            else {
                this.sendObj.page = 1;
                OMS.Home.getContacts();
            }
        },
        getMoreContacts: function () {
            if (SELECT.lastSize < SELECT.pageSize) return;
            if (SELECT.sendObj.keyword)
                OMS.Home.getContactByName();
            else
                OMS.Home.getContacts();
        },
        renderContacts: function (data) {
            SELECT.sendObj.page++;
            if (data && data.customer && !$.isEmptyObject(data.customer)) {
                $("#err-msg").remove();
                SELECT.renderConClass(data.customer);
            }
            else if (data && data.list && data.list.length) {
                $("#err-msg").remove();
                SELECT.renderConList(data.list);
            }
            else if ($.isEmptyObject(SELECT.salerList)) {
                if (SELECT.sendObj.keyword)
                    $("#err-msg").html("未找到相关客户联系人");
                else
                    $("#err-msg").html("您还没有客户联系人");
            }
            else {
                SELECT.lastSize = 0;
                $("#salerList").append('<li class="noMore ui-border-t" style="text-align:center; padding: 10px 0; background-color: #fff;"><div style="width:100%; font-size: 14px; color: #999;"><p>无更多企业通讯录人员</p></div></li>');
                SELECT.renderScroll();
            }
        },
        renderConClass: function (list) {
            var htmlTpl = "",
                Groups = Object.keys(list) || [],
                temp = [];
            for (var i = 0, len = Groups.length; i < len; i++) {
                var code = Groups[i];
                if (!this.salerList[code] && list[code].length) {
                    this.salerList[code] = list[code];
                    htmlTpl +=
                    '<li>' +
                        '<div class="user-group ui-border-b" data-code="' + code + '">' + (code=="empty"?"*":code) + '</div>' +
                        '<ul class="user-group-cell ui-border-b"></ul>' +
                    '</li>';
                }
                else
                    this.salerList[code].concat(list[code]);
                temp = temp.concat(list[code]);
            }
            $("#salerList").append(htmlTpl);
            this.renderConListLi(temp);

            this.renderScroll();
            temp.length && this.bindEvent();
        },
        renderConListLi: function (salerList) {
            var self = this;
            this.lastSize = salerList.length;
            for(var i = 0; i < this.lastSize; i++) {
                if (salerList[i].py)
                    salerList[i].let = salerList[i].py.substr(0, 1).toUpperCase();
                else if (salerList[i].pinyin)
                    salerList[i].let = salerList[i].pinyin.substr(0, 1).toUpperCase();
                else
                    salerList[i].let = "empty";

                var htmlTpl = "<li class='ui-border-t user-group-cell-member' data-code='" + salerList[i].let + "' data-uid='" + salerList[i].id + "'>";
                if (self.pageType) {
                    var data = {};
                    data.uid = salerList[i].id;
                    data.type = self.type;

                    if (self.fromPage == "SELECT" && self.codeInSelected(data, this.oldparticipates)) {
                        htmlTpl += "<div class='filterli activeli unClickable'></div>";
                    }
                    else if (self.codeInSelected(data, this.participates)) {
                        htmlTpl += "<div class='filterli activeli'></div>";
                    }
                    else if ($.trim(salerList[i].telephone).length) {
                        htmlTpl += "<div class='filterli'></div>";
                    }
                }
                htmlTpl +=
                    "<div class='itemSaler'>" +
                        "<p class='itemName'>" + salerList[i].linkman + "</p>" +
                        "<p class='itemToggle'>";
                if (salerList[i].cusname)
                    htmlTpl += "<span>" + salerList[i].cusname + " | </span>";

                htmlTpl += "<span>" + (salerList[i].position || "暂无职务")+ "</span>" +
                        "</p>" +
                    "</div>";
                if ($.trim(salerList[i].telephone).length && !self.pageType)
                    htmlTpl += "<div class='itemSalerBtn'><i class='ui-icon-phone-2'></i></div>";

                htmlTpl += "</li>";
                $("[data-code='" + salerList[i].let + "']").siblings("ul").append(htmlTpl);
            }
        },
        renderConList: function (salerList) {
            var self = this;
            this.lastSize = salerList.length;
            if ($.isEmptyObject(SELECT.salerList)) SELECT.salerList.search = [];

            for(var i = 0; i < this.lastSize; i++) {
                salerList[i].let = "search";
                SELECT.salerList.search.push(salerList[i]);

                var htmlTpl = "<li class='contacts-cell user-group-cell-member ui-border-b' data-code='" + salerList[i].let + "' data-uid='" + salerList[i].id + "'>";
                if (self.pageType) {
                    var data = {};
                    data.uid = salerList[i].id;
                    data.type = self.type;
                    if (self.fromPage == "SELECT" && self.codeInSelected(data, this.oldparticipates)) {
                        htmlTpl += "<div class='filterli activeli unClickable'></div>";
                    }
                    else if (self.codeInSelected(data, this.participates)) {
                        htmlTpl += "<div class='filterli activeli'></div>";
                    }
                    else if ($.trim(salerList[i].telephone).length) {
                        htmlTpl += "<div class='filterli'></div>";
                    }
                }
                htmlTpl +=
                    "<div class='itemSaler'>" +
                        "<p class='itemName'>" + salerList[i].linkman + "</p>" +
                        "<p class='itemToggle'>";
                if (salerList[i].cusname)
                    htmlTpl += "<span>" + salerList[i].cusname + " | </span>";

                htmlTpl += "<span>" + (salerList[i].position || "暂无职务")+ "</span>" +
                        "</p>" +
                    "</div>";
                if ($.trim(salerList[i].telephone).length && !self.pageType)
                    htmlTpl += "<div class='itemSalerBtn'><i class='ui-icon-phone-2'></i></div>";

                htmlTpl += "</li>";
                $("#salerList").append(htmlTpl);
            }
            this.renderScroll();
            this.bindEvent();
        },
        renderSearch: function (data) {
            SELECT.filterObj.page++;
            if (data && data.position)
                OMS.user.position = data.position;
            if (data && data.list && !$.isEmptyObject(data.list)) {
                $("#err-msg").remove();
                SELECT.renderClassList(data.list);
            }
            else if ($.isEmptyObject(SELECT.salerList)) {
                if (SELECT.filterObj.keyword)
                    $("#err-msg").html("未找到相关企业通讯录人员");
                else
                    $("#err-msg").html("您还没有企业通讯录");
            }
            else {
                SELECT.lastSize = 0;
                $("#salerList").append('<li class="noMore ui-border-t" style="text-align:center; padding: 10px 0; background-color: #fff;"><div style="width:100%; font-size: 14px; color: #999;"><p>无更多企业通讯录人员</p></div></li>');
                SELECT.renderScroll();
            }
        },
        renderClassList: function (list) {
            var htmlTpl = "",
                Groups =  Object.keys(list) || [],
                temp = [];
            for(var i = 0, len = Groups.length; i < len; i++) {
                var code = Groups[i];
                if (!this.salerList[code] && list[code].length) {
                    this.salerList[code] = list[code];
                    htmlTpl +=
                    '<li>' +
                        '<div class="user-group ui-border-b" data-code="' + code + '">' + code + '</div>' +
                        '<ul class="user-group-cell ui-border-b"></ul>' +
                    '</li>';
                }
                else
                    this.salerList[code].concat(list[code]);
                temp = temp.concat(list[code]);
            }
            $("#salerList").append(htmlTpl);
            this.renderListLi(temp);
            this.renderScroll();
            temp.length && this.bindEvent();
        },
        renderListLi: function (salerList) {
            var self = this;
            this.lastSize = salerList.length;
            for(var i = 0; i < this.lastSize; i++) {
                var htmlTpl = "<li class='ui-border-t user-group-cell-member' data-code='" + salerList[i].let + "' data-uid='" + salerList[i].id + "'>";
                if (self.pageType) {
                    var data = {};
                    data.uid = salerList[i].id;
                    data.type = self.type;
                    if (self.fromPage == "SELECT" && self.codeInSelected(data, this.oldparticipates)) {
                        htmlTpl += "<div class='filterli activeli unClickable'></div>";
                    }
                    else if (self.codeInSelected(data, this.participates)) {
                        htmlTpl += "<div class='filterli activeli'></div>";
                    }
                    else if ($.trim(salerList[i].telephone).length) {
                        htmlTpl += "<div class='filterli'></div>";
                    }
                }
                htmlTpl +=
                    "<div class='itemSaler'>" +
                        "<p class='itemName'>" + salerList[i].realname + "</p>" +
                        "<p class='itemToggle'>" + (salerList[i].position_path || "暂无职务") + "</p>" +
                    "</div>";

                //控制是否显示电话
                if ($.trim(salerList[i].telephone).length && !self.pageType && !(!salerList[i].issub && salerList[i].position == "57" && OMS.user.position != '57'))
                    htmlTpl += "<div class='itemSalerBtn'><i class='ui-icon-phone-2'></i></div>";

                htmlTpl += "</li>";
                $("[data-code='" + salerList[i].let + "']").siblings("ul").append(htmlTpl);
            }
        },
        codeInSelected: function (data, telConferData) {
            var status = false;
            for (var i = 0, len = telConferData.length; i < len; i++) {
                if (telConferData[i].uid == data.uid && telConferData[i].type == data.type) {
                    status = true;
                    break;
                }
            }
            return status;
        },
        renderMemberLi: function (data) {
            var htmlTpl = "<p data-uid='" + data.uid + "' data-type='" + this.type + "'>";
            htmlTpl += "<span>" + data.name + "</span>";
            if (!(this.fromPage == "SELECT" && this.codeInSelected(data, this.oldparticipates)))
                htmlTpl += "<i class='member-delete'>━</i>";
            htmlTpl += "</p>";
            return htmlTpl;
        },
        renderScroll: function () {
            if (this.myScroll) {
                if(this.lastSize < this.pageSize)
                    $("#selMember #pullUp").hide();
                this.myScroll.refresh();
            }
            else if (this.lastSize < this.pageSize)
                this.myScroll = new myIScroll("wrapper");
            else {
                if (this.type === 0)
                    this.myScroll = new myIScroll("wrapper", null, this.getMoreContacts);
                else
                    this.myScroll = new myIScroll("wrapper", null, this.getMoreSearch);
            }
        },
        bindEvent: function () {
            var self = this;
            if (!self.pageType) {
                // bindEvent($("#selMember .itemSalerBtn"), function (e) {
                //     var data = $(this).parent().data();
                //     if (!data || $.isEmptyObject(data)) return ;
                //     // 弹出电话拨打界面
                //     CALLPHONE.init(data);
                // });
                bindEvent($("#selMember .user-group-cell-member"), function(e){
                    var data = $(this).data();
                    if (!data || $.isEmptyObject(data)) return ;
                    if ($(this).find(".itemSalerBtn").length) {
                        CALLPHONE.init(data);
                    }
                });
            }
            else {
                bindEvent($("#selMember .user-group-cell-member"), function (e) {
                    var data = $(this).data();
                    if (!$(this).find(".filterli").hasClass("unClickable")) {
                        if ($(this).find(".filterli").hasClass("activeli")) {
                            var telConferData = self.participates, index = null;
                            for(var i = 0, len = telConferData.length; i < len; i++) {
                                if (+telConferData[i].uid === +data.uid && telConferData[i].type == self.type) {
                                    index = i;
                                    break;
                                }
                            }
                            if (index !== null) self.participates.splice(index, 1);
                            var partLen = self.participates.length - 1; //去除发起人
                            if (!partLen) {
                                $("#selMember .selectedUser").html("<div><em>请选择员工</em></div>");
                                $("#selMember .submitBtn").html("确定(0)");
                                $("#selMember .submitBtn").removeClass("clickable");
                            }
                            else
                                $("#selMember .submitBtn").html("确定(" + partLen + ")");

                            self.isAdd = true;
                            $("#selMember .selectedUser [data-uid='" + data.uid + "'][data-type='" + self.type + "']").remove();
                            self.setFooterwidth();
                            $(this).find(".filterli").removeClass("activeli");
                        }
                        else {
                            if (!self.isAdd) {
                                OMS.Home.error("参会人员不得超过8人");
                                return ;
                            }
                            var goalArr = self.salerList[data.code], temp = {};
                            for(var i = 0, len = goalArr.length; i < len; i++) {
                                if (+goalArr[i].id === +data.uid) {
                                    temp.type = self.type;
                                    temp.uid = goalArr[i].id;
                                    temp.tel = goalArr[i].telephone;
                                    if (temp.type === 1)
                                        temp.name = goalArr[i].realname;
                                    else if (temp.type === 0)
                                        temp.name = goalArr[i].linkman;
                                }
                            }
                            self.participates.push(temp);

                            var partLen = self.participates.length - 1,
                                htmlTpl = self.renderMemberLi(temp);
                            if (partLen - 1 > 0) {
                                $("#selMember .selectedUser>div").append(htmlTpl);
                                if (partLen === self.MAXMEMBERS)
                                    self.isAdd = false;
                            }
                            else {
                                $("#selMember .selectedUser>div").html(htmlTpl);
                            }
                            self.setFooterwidth();
                            $("#selMember .submitBtn").html("确定(" + partLen + ")");
                            $("#selMember .submitBtn").addClass("clickable");
                            $(this).find(".filterli").addClass("activeli");
                        }
                    }
                });
            }
        },
        setFooterwidth: function () {
            var cellArr = $("#selMember .selectedUser>div").find("p"),
                width = 0,
                minWidth = $("#selMember .selectedUser").width() - 15;
            $.each(cellArr, function(k, el) {
                width += $(el).width();
            });
            if (width < minWidth)
                width = minWidth;
            $("#selMember .selectedUser>div").css({'width': width + 'px'});
            $("#selMember .selectedUser").scrollLeft(width);
        },
        initFilterObj: function (value) {
            this.destroy();
            this.filterObj.page = 1;
            this.filterObj.keyword = value || '';
            this.salerList = {};
            this.lastSize = 0;

            var htmlTpl = "<li id='err-msg'>正在加载中...</li>";
            $("#err-msg").remove();
            $("#salerList").html(htmlTpl);
        },
        destroy: function () {
            if (this.myScroll) {
                if (this.myScroll.destroy) {
                    this.myScroll.scrollToElement($("#selMember .scroller")[0], 0);
                    this.myScroll.destroy();
                }
                this.myScroll = null;

                $("#wrapper").find("#pullDown").remove();
                $("#wrapper").find("#pullUp").remove();
            }
        },
        setNativeBar: function () {
            this.initTitleBar();
            this.initLeftBar();
        },
        initTitleBar: function () {
            dd.ready(function(){
                dd.biz.navigation.setTitle({
                    title: "选择人员",
                    onSuccess : function(result) {},
                    onFail : function(err) {}
                });
            });
        },
        updateTitleBar: function () {
            dd.ready(function(){
                dd.biz.navigation.setTitle({
                    title: "客户联系人",
                    onSuccess : function(result) {},
                    onFail : function(err) {}
                });
            });
        },
        initLeftBar: function () {
            var self = this;
            dd.ready(function(){
                if(dd.ios){
                    dd.biz.navigation.setLeft({
                        show: true,
                        control: true,
                        showIcon: true,
                        text: '',
                        onSuccess : function(result) {
                            self.goBack();
                        },
                        onFail : function(err) {}
                    });
                }else{
                    $(document).off('backbutton');
                    $(document).on('backbutton', function(e) {
                        self.goBack();
                        e.preventDefault();
                    });
                }
            });
        },
        goBack: function (data) {
            if (!this.skipPage) {
                $("#selMember").remove();
                $("#callPhone").remove();
                this.type = 1;
                this.skipPage = true;
                if (OMS.Home.isAjax) {
                    OMS.Home.isAjax.abort && OMS.Home.isAjax.abort();
                    OMS.Home.isgetMember = false;
                }
                this.initTitleBar();
                this.render();
            }
            else if (this.fromPage == "SELECT") {
                var sendObj = {};
                sendObj.data = data || [];
                sendObj.callback = function () {
                    $("#selMember").remove();
                    $("#callPhone").remove();
                };
                this.callBack(sendObj);
            }
            else if (this.fromPage == "TELCONFER") {
                $("#selMember").remove();
                $("#callPhone").remove();
                $("#telConfer").show();
                TELCONFER.setNativeBar();
            }
            else if (this.fromPage == "BUSCALLS") {
                $("#selMember").remove();
                $("#callPhone").remove();
                $("#businessCalls").show();
                BUSCALLS.setNativeBar();
                BUSCALLS.refresh();
            }
        }
    };
    // 电话会议
    var TELCONFER = {
        init: function () {
            this.initParams();
            this.setNativeBar();
            this.render();
        },
        initParams: function (data) {
            // TODO 其他页面跳转至该页的情况待完善
            this.fromPage = "BUSCALLS";

            this.filterObj = {};
            this.filterObj.isRecord = 0;
            this.filterObj.subject = OMS.user.realname + "的电话会议";
            var temp = {
                type: 0,
                name: OMS.user.realname,
                uid: OMS.user.id,
                tel: OMS.user.telephone
            }
            this.filterObj.participates = []; //传递参数
            this.filterObj.participates.push(temp);
        },
        render: function (data) {
            var participates = this.filterObj.participates;
            var partLen = participates.length - 1;
            var htmlTpl = "<div id='telConfer'>";
            htmlTpl +=
            "<header>" +
                "<label for='subject'>会议主题</label>" +
                "<input id='subject' type='text' maxLength='10' value='" + this.filterObj.subject + "' />" +
            "</header>";

            htmlTpl += "<section>";
            htmlTpl += "<div class='memberTitle'>参会人员</div>";
            htmlTpl += "<ul id='memberList'>";
            for (var i = 0, len = participates.length; i < len; i++) {
                if (!participates[i].type) continue;
                htmlTpl += this.renderPersonLi(participates[i]);
            }
            htmlTpl +=
                "<li id='addMember' class='ui-border-t'>" +
                    "<i class='ui-icon-meeting_add'></i>" +
                    "<p>添加人员</p>" +
                "</li>";
            htmlTpl += "</ul>";
            htmlTpl += "</section>";

            htmlTpl +=
                "<footer class='ui-border-t'>" +
                    "<div class='telConferFooter'>" +
                        "<p id='telRecord' class='unselect'>" +
                            "<i class='ui-icon-meeting_commit_unselect'></i>" +
                            "<span>录音</span>" +
                        "</p>" +
                        "<p id='immediate'" + (partLen?" class='clickable'":"") + ">立即发起</p>" +
                    "</div>" +
                "</footer>";

            htmlTpl += "</div>";
            $("body").append(htmlTpl);
            if (this.fromPage == "BUSCALLS")
                $("#businessCalls").hide();
            TELCONFER.initEvent();
        },
        renderPersonLi: function (data) {
            var htmlTpl =
                "<li class='ui-border-t memberCell'>" +
                    "<i class='ui-icon-list_delete' data-uid='" + data.uid + "'  data-type='" + data.type + "'></i>" +
                    "<p class='memberName'>" + data.name + "</p>" +
                    // "<p class='memberPhone'>" + data.tel + "</p>" +
                "</li>";

            return htmlTpl;
        },
        updateInputValue: function (el) {
            var arr = [],
                maxSize = 20,
                value = el.value,
                newArr;

            for (var i = 0; i < value.length; i++) {
                var c = value.charAt(i);
                if (/^[\u0000-\u00FF]$/.test(c)) {
                    arr.push(c);
                } else {
                    arr.push(c, '');
                }
            }
            if(arr.length > maxSize){
                if( !/^[\u0000-\u00FF]$/.test(arr[maxSize - 1]) && arr[maxSize - 1])
                    newArr = arr.slice(0, maxSize - 1);
                else
                    newArr = arr.slice(0, maxSize);
                el.value = newArr.join("");
            }
            this.filterObj.subject = el.value;
        },
        initEvent: function () {
            var self = this;
            $("#subject").on("input", function() {
                self.updateInputValue($(this)[0]);
            });
            $("#telConfer #memberList").on("click", function(e) {
                if ($(e.target).hasClass("ui-icon-list_delete")) {
                    var data = $(e.target).data();
                    var participates = self.filterObj.participates, index = null;
                    for(var i = 0, len = participates.length; i < len; i++) {
                        if (+participates[i].uid === +data.uid && participates[i].type == data.type) {
                            index = i;
                            break;
                        }
                    }
                    if(index !== null) self.filterObj.participates.splice(index, 1);
                    var partLen = self.filterObj.participates.length - 1;
                    if(!partLen)
                        $("#telConfer #immediate").removeClass("clickable");
                    $(e.target).parent().remove();

                    $("#telConfer #addMember").show();
                }
                else if ($(e.target).parent().attr("id") == "addMember"){
                    SELECT.init(1);
                }
            });
            $("#telRecord").on("click", function (e) {
                if ($(this).hasClass("unselect")) {
                    self.filterObj.isRecord = 1;
                    $(this).find(".ui-icon-meeting_commit_unselect").attr("class", "ui-icon-meeting_commit_select");
                    $(this).removeClass("unselect");
                }
                else {
                    self.filterObj.isRecord = 0;
                    $(this).find(".ui-icon-meeting_commit_select").attr("class", "ui-icon-meeting_commit_unselect");
                    $(this).addClass("unselect");
                }
            });
            $("#immediate").on("click", function (e) {
                if ($(this).hasClass("clickable")) {
                    var str = "";
                    $.each(self.filterObj, function(key, value) {
                        if($.isArray(value)) value = JSON.stringify(value);
                        str += !str ? key + "=" + value : "&" + key + "=" + value;
                    });
                    openLink("businessCallMeeting.html?" + str);
                }
            });
        },
        setNativeBar: function () {
            this.initTitleBar();
            this.initLeftBar();
        },
        initTitleBar: function () {
            dd.ready(function(){
                dd.biz.navigation.setTitle({
                    title: "发起电话会议",
                    onSuccess : function(result) {},
                    onFail : function(err) {}
                });
            });
        },
        initLeftBar: function () {
            var self = this;
            dd.ready(function(){
                if(dd.ios){
                    dd.biz.navigation.setLeft({
                        show: true,
                        control: true,
                        showIcon: true,
                        text: '',
                        onSuccess : function(result) {
                            self.goBack();
                        },
                        onFail : function(err) {}
                    });
                }else{
                    $(document).off('backbutton');
                    $(document).on('backbutton', function(e) {
                        self.goBack();
                        e.preventDefault();
                    });
                }
            });
        },
        goBack: function () {
            if (this.fromPage == "BUSCALLS") {
                $("#telConfer").remove();
                $("#businessCalls").show();
                BUSCALLS.setNativeBar();
                BUSCALLS.refresh();
            }
            else
                history.back(-1);
        }
    };
    // callPhone for SELECT
    var CALLPHONE = {
        init: function (data) {
            var salerList = SELECT.salerList[data.code];
                this.phoneData = {};
                this.saler = {};
            for(var i = 0, len = salerList.length; i < len; i++) {
                if (+salerList[i].id === +data.uid) {
                    this.saler = salerList[i];
                    this.phoneData.type = SELECT.type;
                    this.phoneData.tel = salerList[i].telephone;
                    this.phoneData.contactid = salerList[i].id;

                    if (this.phoneData.type === 1) {
                        this.phoneData.name = salerList[i].realname;
                        this.phoneData.info = salerList[i].position_path;
                    }
                    else if (this.phoneData.type === 0) {
                        this.phoneData.cusid = salerList[i].cusid;
                        this.phoneData.name = salerList[i].linkman;
                        this.phoneData.info = salerList[i].cusname + '-' + salerList[i].position;
                    }
                }
            }

            if ($.isEmptyObject(this.saler)) return;
            this.render();
        },
        render: function () {
            var htmlTpl =
            "<div id='callPhone'>" +
                "<div id='callPhoneModal'>" +
                    "<div data-action='commerTel'>商务电话(企业付费)</div>";
            if (this.saler.issub || SELECT.type === 0)
                htmlTpl += "<div data-action='bringTel' class='ui-border-t'>自带电话(自费)</div>";
            htmlTpl += "</div>";
            $("body").append(htmlTpl);
            this.initEvent();
        },
        initEvent: function () {
            var self = this;
            bindEvent($("#callPhone"), function (e) {
                var action = $(e.target).data('action');
                if (action == "commerTel") {
                    var str = '';
                    $.each(self.phoneData, function(t, v) {
                        if (!str)
                            str += t + "=" + v;
                        else
                            str += "&" + t + "=" + v;
                    });
                    openLink("businessCallSingle.html?" + str);
                }
                else if (action == "bringTel") {
                    window.location.href = "tel: " + self.phoneData.tel;
                }
                self.destroy();
            });
        },
        destroy: function () {
            this.phoneData = null;
            $("#callPhone").remove();
        }
    };
    // evt bind function
    var bindEvent = function (el, fn) {
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
    var deepCopy = function(obj){
        var temp = {};
        for(var key in obj){
            temp[key] = obj[key];
        }
        return temp;
    };
    //ajax function
    var Home = function() {};
    Home.prototype = {
        constructor: Home,
        sendQuest: function (config) {
            var apiUrl = oms_config.apiUrl + config.apiUrl;
            var sendData = config.data || {},
                self = this;
            if (!config.noCheck) {
                sendData.omsuid = OMS.user.id;
                sendData.token = OMS.user.token;
            }
            this.isAjax = $.ajax({
                url: apiUrl,
                type: config.type || 'get', //默认get
                data: sendData,
                cache: false,
                success: function(response){
                    if (response) {
                        var result = {};
                        try {
                            if (typeof response === "object") {
                                result = response;
                            } else {
                                result = JSON.parse(response);
                            }
                        }
                        catch (e) {
                            self.error("服务异常");
                        }

                        if (result.res === 1 || result.errno === 0)
                            config.callback && config.callback(result.data);
                        else if (result.msg || result.errmsg)
                            self.error(result.msg || result.errmsg);
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
                api: "getMember",
                apiUrl: "apiUser/getSubordinateByKeyword/",
                type: "post"
            };
            config.data = SELECT.filterObj;
            config.callback = SELECT.renderSearch;

            if(!this.isgetMember) {
                this.isgetMember = true;
                this.sendQuest(config);
            }
        },
        getContacts: function () {
            var config = {
                api: "getMember",
                apiUrl: "contacts_api/index/" + OMS.user.id,
                type: "post"
            };
            config.data = SELECT.sendObj;
            config.callback = SELECT.renderContacts;
            if(!this.isgetMember) {
                this.isgetMember = true;
                this.sendQuest(config);
            }
        },
        getContactByName: function () {
            var config = {
                api: "getMember",
                apiUrl: "contacts_api/search/" + OMS.user.id,
                type: "post"
            };
            config.data = SELECT.sendObj;
            config.callback = SELECT.renderContacts;
            if(!this.isgetMember) {
                this.isgetMember = true;
                this.sendQuest(config);
            }
        },
        getCallLog: function () {
            var config = {
                api: "getList",
                apiUrl: "apiMeeting/getList/",
                type: "post"
            };
            config.noCheck = true;
            config.data = BUSCALLS.filterObj;
            config.callback = BUSCALLS.renderList;
            if(!this.isgetList) {
                this.isgetList = true;
                this.sendQuest(config);
            }
        },
        getUserStatus: function () {
            var sendData = {};
            sendData.uid = OMS.user.id;
            $.ajax({
                url: oms_config.apiUrl + "apiMeeting/getUserStatus/",
                type: "post",
                data: sendData,
                cache: false,
                success: function(response){
                    if (response) {
                        var result = {};
                        try {
                            if (typeof response === "object") {
                                result = response;
                            } else {
                                result = JSON.parse(response);
                            }
                        }
                        catch (e) {
                            console.log("服务异常", response);
                        }

                        if (result.res === 1)
                            BUSCALLS.getCheckCalls(result);
                        else if (result.msg)
                            console.log(result.msg);
                    }
                    else
                        console.log("服务异常", response);
                },
                error: function(xhr, errorType, error){
                    if(errorType == "abort") return;
                    console.log("网络异常", error);
                }
            });
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
                if($("#err-msg").length)
                    $("#err-msg").html(msg);
                else
                    dd.ready(function() {
                        dd.device.notification.toast({
                            icon: '',
                            text: msg,
                            onSuccess : function(result) {},
                            onFail : function(err) {}
                        });
                    });
            }
        }
    };
    //login Verify
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
