$(function(){
    FastClick.attach(document.body);
    //顶部导航
    var OMS = {
        user: {},
        levelName:{},
        init: function(){
            //参数初始化
            this.initParams();

            //页面标签初始化
            this.initTitleBar();
            this.initLeftBar();

            //初始化排序列表
            this.renderSort();

            //初始化筛选列表
            filter.init();

            //初始化搜索页面
            search.init();

            //绑定初始化事件
            this.initEvent();

            //获取刷新的列表数据
            this.getData();
        },
        initParams: function(){
            /****初始化列表新增****/
            this.newCustomer = [];
            this.customerKey = "oms_company_new";
            try {
                var temp_cus = localStorage.getItem(this.customerKey);
                if(temp_cus)
                    this.newCustomer = JSON.parse(temp_cus) || [];
            }
            catch(e) {
                console.log(e);
            }
            /****初始化接口参数 START****/
            this.filterObj = {};

            this.filterObj.user = [];
            this.filterObj.level = [];
            this.filterObj.page = 1;
            this.filterObj.type = +getUrlParam("type") || 1; //1:潜在客户，2：签约客户，3：下属客户, 4: 公有客户
            // this.filterObj.isNew = 1; //新签标志
            // this.filterObj.type = 2; //私海
            this.filterObj.order = 'create';
            /****初始化接口参数 END****/

            /****初始化排序列表 start****/
            this.sortList = {
                'dynamic': '最新动态',
                'safedays': '保护期',
                'notFollowing': '长期未跟进',
                'create': '最新创建',
                // 'level': '个人评级',
                // 'user': '跟进人',
                // 'type': '客户状态'
                // 1: "下次联系日期",
                // 2: "保护期",
                // //以下三个分组
                // 6: "经理评级",
                // 7: "个人评级",
                // 8: "跟进状态",
                // //新增 [成单指数]
                // 10: "智能推荐排序"
            };
            /****初始化排序列表 end****/

            // this.user.role 1 是新签leader, 2 是续签业务员, 3 是新签业务员, 4 是续签leader, 5 是城市经理及以上级别
            // this.isSpecRole = +this.user.role === 5 ? true : false;
            // this.isLeader = (+this.user.role === 2 || +this.user.role === 3) ? false : true;

            this.classify = ['level', 'user', 'type'];
            this.pageSize = 20;
            this.lastSize = 0;

            //初始化，清空storage
            var keyList = ["oms.deliver.id", "oms.stick.id", "oms.unstick.id"];
            $.each(keyList, function(key, item){
                localStorage.removeItem(item);
            });
            dd.ready(function() {
                document.addEventListener("resume", function (e) {
                    e.preventDefault();
                    $.each(keyList, function(k, item){
                        var key = item;
                        var id = localStorage.getItem(key);
                        var htmlList = $("[data-code='" + id + "']");
                        localStorage.removeItem(key);
                        if (id) {
                            if (key == "oms.deliver.id") {
                                htmlList.remove();
                                if(OMS.myScroll && OMS.myScroll.refresh)
                                    OMS.myScroll.refresh();
                                if(search.myScroll && search.myScroll.refresh)
                                    search.myScroll.refresh();
                            }
                            else {
                                $.each(htmlList, function(k, html) {
                                    var parent = $(html).parent();
                                    $(html).remove();
                                    if (key == "oms.stick.id") {
                                        parent.prepend(html);
                                        $(html).find("h4").append("<em class=\"toTop\">置顶</em>");
                                    }
                                    else {
                                        parent.append(html);
                                        $(html).find("em").remove();
                                    }
                                });
                            }
                        }
                    });
                }, false);
            });
        },
        updateNewCus: function(){
            if(OMS.newCustomer.length > 0)
                localStorage.setItem(OMS.customerKey, JSON.stringify(OMS.newCustomer));
            else
                localStorage.removeItem(OMS.customerKey);
        },
        refreshData: function(){
            var sendObj = {};
            if(OMS.myScroll)
                $("#wrapper").find("#pullUp").hide();
            // console.log('in refreshData');
            // console.log(OMS.classify);
            // console.log(OMS.filterObj.order);
            // if(OMS.classify.indexOf(OMS.filterObj.order) > -1){
            //     delete OMS.filterObj.page;
            //     sendObj.callback = OMS.renderClassify;
            //     OMS.detroyScroll();
            // }
            // else{
            //     OMS.filterObj.page = 1;
            //     sendObj.success = OMS.renderCusList;
            // }
            OMS.filterObj.page = 1;
            sendObj.success = OMS.renderCusList;
            sendObj.data = OMS.filterObj;

            OMS.data = [];
            $("#cuslist").html('');
            $(".backtotop").hide();

            new home().getCustomers(sendObj);
        },
        getData: function(){
            $("#msg").html("正在加载中...")
            $("#msg").show();
            OMS.detroyScroll();
            OMS.refreshData();
        },
        getMoreData: function(){
            if(OMS.lastSize < OMS.pageSize)
                return;
            var sendObj = {};
            OMS.filterObj.page++;
            sendObj.data = OMS.filterObj;
            sendObj.success = OMS.renderCusList;

            new home().getCustomers(sendObj);
        },
        sendAjax: function(sendObj){
            this.clearAjax();
            this.ajaxControl =
                setTimeout(function(){
                    new home().getCustomers(sendObj);
                }, 300);
        },
        clearAjax: function(){
            if(this.ajaxControl) clearTimeout(this.ajaxControl);
            if(this.ajax && this.ajax.abort) this.ajax.abort();
        },
        renderCusList: function(data){
            var res = JSON.parse(data);
            if(parseInt(res.code) === 0) {
                data = res.data.list;
            } else {
                return;
            }
            if(OMS.classify.indexOf(OMS.filterObj.order) > -1)
                return;
            //新签 业务员
            if(OMS.data && OMS.data.length > 0)
                OMS.data = OMS.data.concat(data);
            else
                OMS.data = data;

            $("#listNav").show();
            $("#msg").hide();
            $("#v-container-empty").hide();
            console.log(OMS.data);
            if(!OMS.data || !OMS.data.length){
                if(!filter.countSize()){
                    if (OMS.filterObj.type==3||OMS.filterObj.type==2) {
                        $("#msg").html("暂无客户");
                        $("#msg").show();
                    }
                    else {
                        $("#listNav").hide();
                        $("#v-container-empty").show();
                    }
                }
                else {
                    $("#msg").html("没有找到相关客户");
                    $("#msg").show();
                }
            }
            else{
                var htmlTpl = OMS.renderCusListLi(data);
                $("#cuslist").append(htmlTpl);

                OMS.lastSize = data.length;
                if(data.length < OMS.pageSize){
                    $("#pullUp").hide();
                    if(filter.countSize() || OMS.filterObj.page > 1)
                        $("#cuslist").append('<li class="noMore ui-border-t" style="text-align:center;"><div style="width:100%; font-size: 14px; color: #999;"><p>无更多客户信息</p></div></li>');
                }
                else
                    $("#pullUp").show();

                if(OMS.myScroll)
                    OMS.myScroll.refresh();
                else if(data.length < OMS.pageSize)
                    OMS.myScroll = new myIScroll("wrapper", OMS.refreshData);
                else
                    OMS.myScroll = new myIScroll("wrapper", OMS.refreshData, OMS.getMoreData);

                _bindEvent($("#cuslist li"), function(){
                    if(!$(this).hasClass("noMore")){
                        openCustomerInfo($(this).data("code"));
                    }
                });
            }
        },
        renderCusListLi: function(data){
            console.log('----');
            console.log(data);
            console.log('----');
            var htmlTpl = '',
                follObj = filter.follObj,
                nowTime = getGMTDate();
            for(var i = 0, len = data.length; i < len; i++){
                htmlTpl += '<li data-code="' + data[i].id + '" class="ui-border-t">';
                htmlTpl += '<div class="ui-list-info">';
                htmlTpl += '<h4 class="ui-nowrap itemtoggle" style="overflow: auto;white-space: normal;text-overflow: initial;">' + data[i].name + (data[i].is_on_top === 100?"<em class=\"toTop\">置顶</em>":"");
                // if(this.filterObj.order == 10){
                //     if(data[i].score_trend == 1){
                //         htmlTpl+= '<span style="display:none" class=\"predict_increase\"></span>';
                //     }
                //     else{
                //         htmlTpl+= '<span style="display:none" class=\"predict_decrease\"></span>';
                //     }
                // }
                // htmlTpl += '<span class="visiting">' + data[i].lastFollow + '天</span>' +
                '</h4>';
                htmlTpl += '<p class="itemtoggle">';

                // if (data[i].lastFollow > -1)
                //     htmlTpl += '<span>跟进' + data[i].lastFollow + '天&nbsp;</span>|';

                // htmlTpl += '<span>' + (data[i].follow_type < 0 ? '暂无状态' : (follObj[data[i].follow_type] || '暂无状态')) + '&nbsp;</span>|';
                // htmlTpl += '<span>&nbsp;' + (data[i].managerlevel=='无'?'-':data[i].managerlevel) + '级&nbsp;</span>|';
                // htmlTpl += '<span>&nbsp;' + (data[i].mylevel=='无'?'-':data[i].mylevel) +'级&nbsp;</span>';
                // htmlTpl += '</p>';

                // htmlTpl += '<span>' + data[i].mobile  + '&nbsp;</span>|';
                htmlTpl += '<span>&nbsp;' + filter.levelObj[data[i].level] + '&nbsp;</span>|';
                htmlTpl += '<span>&nbsp;' + data[i].realname +'&nbsp;</span>';
                htmlTpl += '<span style="float:right;">&nbsp;' + data[i].cTime +'&nbsp;</span>';
                htmlTpl += '</p>';
                // if(OMS.filterObj.isSub === 0) {
                //     if(data[i].next_time && Date.parse(data[i].next_time.replace(/-/g, '/')) > nowTime)
                //         htmlTpl += '<p class="itemtoggle">下次拜访于' + data[i].next_time + '</p>';
                //     else
                //         htmlTpl += '<p class="itemtoggle">无后续计划</p>';
                // }
                // else {
                //     if(data[i].path)
                //         htmlTpl += '<p class="itemtoggle">' + data[i].path + '</p>';
                //     else
                //         htmlTpl += '<p class="itemtoggle">暂无跟进人</p>';
                // }
                htmlTpl +='</div>';

                var index = OMS.newCustomer.indexOf(parseInt(data[i].id));
                if(index > -1){
                    htmlTpl += '<div class="newMark"></div>';
                    OMS.newCustomer.splice(index, 1);
                }
                htmlTpl += '</li>';
            }
            OMS.updateNewCus();
            return htmlTpl;
        },
        renderClassify: function(data){
            var htmlTpl = "", htmlArr = {}, classObj = {};

            $("#listNav").show();
            $("#msg").hide();
            $("#v-container-empty").hide();
            if((!data || !data.length)){
                if(!filter.countSize()){
                    if (OMS.filterObj.type==3) {
                        $("#msg").html("暂无潜在客户");
                        $("#msg").show();
                    }
                    else {
                        $("#listNav").hide();
                        $("#v-container-empty").show();
                    }
                }
                else {
                    $("#msg").html("没有找到相关客户");
                    $("#msg").show();
                }
            }
            else{
                if(OMS.filterObj.order === 'level') {
                    classObj = deepCopy(filter.levelObj);
                }
                else if(OMS.filterObj.order === 'user') {
                    classObj = deepCopy(filter.personObj);
                }
                else if(OMS.filterObj.order === 'type') {
                    classObj = deepCopy(filter.typeObj);
                }

                //数据格式化，针对后台数据比较混乱
                // var tempData = {};
                // for(var i = 0; i < data.length; i++) {
                //     var code = data[i].name;
                //     if(!classObj[code]){
                //         if(!tempData.name) {
                //             tempData.name = "无";
                //             tempData.total = parseInt(data[i].total);
                //         }
                //         else {
                //             tempData.total += parseInt(data[i].total);
                //         }
                //         data.splice(i, 1); //索引i变更
                //         i--; //重置索引起始位置
                //     }
                // }
                // if(tempData.name == "无") data.unshift(tempData);

                for(var i = 0, len = data.length; i < len; i++) {
                    var code = data[i].name;
                    htmlArr[code] = '<li data-code="' + code + '" data-size="' + data[i].total +'" class="classify">';
                    htmlArr[code] += '<div class="ui-border-t">';
                    if(OMS.filterObj.orderType === 8)
                        htmlArr[code] += '<span class="classify-name">' + (classObj[code] || '暂无状态') + '</span>';
                    else
                        htmlArr[code] += '<span class="classify-name">' + (classObj[code] ? classObj[code] + '级客户' : '无评级') + '</span>';

                    htmlArr[code] += '<span class="classify-stastics">' + data[i].total + '个</span>';
                    htmlArr[code] += '<i class="ui-icon-list_arrow_down"></i>';
                    htmlArr[code] += '</div>';

                    htmlArr[code] += '<ul id="custList-' + code  + '" class="ui-border-t"></ul>';
                    htmlArr[code] += '</li>';

                    //个人评级，经理评级 无
                    if(code == "无" && OMS.filterObj.orderType !== 8)
                        htmlTpl += htmlArr[code];
                }
                if(htmlTpl == '' && OMS.filterObj.orderType !== 8){
                    htmlTpl += '<li data-code="无" data-size="' + 0 + '" class="ui-border-t classify">';
                    htmlTpl += '<div>';
                    htmlTpl += '<span class="classify-name">无评级</span>';
                    htmlTpl += '<span class="classify-stastics">0个</span>';
                    htmlTpl += '<i class="ui-icon-list_arrow_down"></i>';
                    htmlTpl += '</div></li>';
                }
                for(var code in classObj) {
                    if(htmlArr[code])
                        htmlTpl += htmlArr[code];
                    else {
                        htmlTpl += '<li data-code="' + code + '" data-size="' + 0 + '" class="ui-border-t classify">';
                        htmlTpl += '<div>';
                        if(OMS.filterObj.orderType === 8)
                            htmlTpl += '<span class="classify-name">' + classObj[code] + '</span>';
                        else
                            htmlTpl += '<span class="classify-name">' + classObj[code] + '级客户</span>';
                        htmlTpl += '<span class="classify-stastics">0个</span>';
                        htmlTpl += '<i class="ui-icon-list_arrow_down"></i>';
                        htmlTpl += '</div></li>';
                    }
                }
                $("#cuslist").html(htmlTpl);

                OMS.sortObj = {};
                for(var key in OMS.filterObj){
                    OMS.sortObj[key] = OMS.filterObj[key];
                }

                OMS.sortData = {};
                OMS.sortData.data = {};
                OMS.sortData.lastSize = 0;

                _bindEvent($("#cuslist li"), function(e){
                    if(!$(this).hasClass("noMore")){
                        var code = $(this).data("code");
                        var size = +$(this).data("size");
                        if(size === 0) return;
                        $(".backtotop").hide();
                        OMS.detroyScroll();

                        $(this).siblings('li').removeClass('clicked');
                        if(!$(this).hasClass("clicked")) {
                            $(this).addClass("clicked");
                            OMS.sortData.code = code;
                            OMS.sortData.pageSize = size;

                            if(OMS.filterObj.orderType === 6)
                                OMS.sortObj.managerlevel = [code];
                            else if(OMS.filterObj.orderType === 7)
                                OMS.sortObj.mylevel = [code];
                            else if(OMS.filterObj.orderType === 8)
                                OMS.sortObj.follStatus = [code];

                            OMS.refreshClassData();
                        }
                        else {
                            OMS.clearAjax();
                            $(this).removeClass("clicked");
                        }
                    }
                    stopEventBubble(event);
                });
            }
        },
        renderClassifyList: function(data){
            var code = OMS.sortData.code;
            var elKey = "#custList-" + code;

            if(OMS.sortData.data[code])
                OMS.sortData.data[code] = OMS.sortData.data[code].concat(data);
            else
                OMS.sortData.data[code] = data || [];

            $("#cusClass-msg").remove();
            var htmlTpl = OMS.renderCusListLi(data);
            $(elKey).append(htmlTpl);

            OMS.sortData.lastSize = data.length;
            if(OMS.myScroll) {
                if(data.length < OMS.pageSize)
                    $("#pullUp").hide();
                else
                    $("#pullUp").show();
                OMS.myScroll.refresh();
            }
            else if(data.length < OMS.pageSize)
                OMS.myScroll = new myIScroll("wrapper");
            else
                OMS.myScroll = new myIScroll("wrapper", null, OMS.getMoreClassData);

            _bindEvent($(elKey + " li"), function(){
                if(!$(this).hasClass("noMore")){
                    openCustomerInfo($(this).data("code"));
                }
                stopEventBubble(event);
            });
        },
        refreshClassData: function(){
            var code = OMS.sortData.code;
            if(OMS.sortData.data[code] && OMS.sortData.data[code].length) {
                var length = OMS.sortData.data[code].length;
                var lastSize = length % OMS.pageSize;
                OMS.sortObj.page = Math.ceil(length / OMS.pageSize);

                if(length < OMS.sortData.pageSize && lastSize === 0)
                    OMS.myScroll = new myIScroll("wrapper", null, OMS.getMoreClassData);
                else
                    OMS.myScroll = new myIScroll("wrapper");
                return;
            }
            else {
                OMS.sortData.lastSize = 0;
                OMS.sortObj.page = 1;
            }
            var htmlTpl = "<li id='cusClass-msg' class='ui-border-t'>正在加载中...</li>";
            $("#custList-" + code).html(htmlTpl);

            var sendObj = {};
            sendObj.data = OMS.sortObj;
            sendObj.callback = OMS.renderClassifyList;
            sendObj.isLoadCus = true;
            OMS.sendAjax(sendObj);
        },
        getMoreClassData: function(){
            if(OMS.sortData.lastSize < OMS.pageSize)
                return;
            var sendObj = {};
            OMS.sortObj.page++;
            sendObj.data = OMS.sortObj;
            sendObj.callback = OMS.renderClassifyList;

            new home().getCustomers(sendObj);
        },
        renderSort: function(){
            var htmlTpl = '',
                defaultCode = this.filterObj.order,
                self = this;

            htmlTpl = '<li class="ui-border-t activeTab" data-code="' + defaultCode + '">'+
                '<p class="sort_order">' +
                    '<span>自动排序－' + self.sortList[defaultCode] + '</span>' +
                '</p>' +
            '</li>';
            for(var code in self.sortList){
                if( code == defaultCode)
                    continue;
                if( this.classify.indexOf(code) > -1) {
                    continue;
                }
                if( this.filterObj.type == 4 && code == 'safedays') {
                    continue;
                }
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
                    OMS.filterObj.order = $(this).data('code');
                    self.getData(); //刷新列表
                    $(this).siblings('li').removeClass("activeTab");
                    $(this).toggleClass("activeTab");
                    $('.select-date').hide();
                    $("#sort-tap").toggleClass('activeTab');
                    $("#sort-tap span").html(self.sortList[self.filterObj.order]);
                    stopEventBubble(event);
                });
            }
            initSortEvent();
        },
        detroyScroll: function() {
            if (OMS.myScroll) {
                OMS.myScroll.destroy();
                OMS.myScroll = null;
                $("#wrapper").find("#pullDown").remove();
                $("#wrapper").find("#pullUp").remove();
            }
        },
        initTitleBar: function(){
            var title = getUrlParam("title") || "企业客户";
            // if(this.filterObj.type === 1) {
            //     title = "潜在客户";
            // }else if(this.filterObj.type === 2) {
            //     title = "签约客户";
            // }else if (this.filterObj.type === 3) {
            //     title = "下属客户";
            // }else if (this.filterObj.type === 4) {
            //     title = "公有客户";
            // }else {
            //     title = "企业客户";
            // }

                ddbanner.changeBannerTitle(title);
            if(this.filterObj.type === 1) {
                ddbanner.changeBannerRight("新增", true, function (result) {
                    openLink("businessCustomerAdd.html?code=new");
                });
            }
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
                            history.back(-1);
                        },
                        onFail : function(err) {}
                    });
                }else{
                    //app-setLeft-visible:true
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
        }
    };
    var filter = {
        init: function(){
            //初始化参数
            this.initParams();
            //初始化左侧列表
            this.initLeftFilter();
            //初始化右侧列表
            this.initRightFilter();
            //初始化事件，这里判断下OMS.filterObj是否变化，初步验证即可
            this.initEvent();
        },
        initParams: function(){
            // 筛选默认项
            // 初始化筛选数据对象
            this.key = 'filter_customer_private_staff';
            var staff = localStorage.getItem(this.key);
            this.ownerObj = staff ? (JSON.parse(staff) || []) : [];

            // 按角色分类筛选项目
            if(OMS.filterObj.type === 3) {
                this.parttern = "user";
                this.mapping = {
                    "user": "跟进人",
                    "type": "客户状态",
                    "level": "个人评级"
                };
            } else if(OMS.filterObj.type === 4) {
                this.parttern = "throwReason";
                this.mapping = {
                    "throwReason": "扔掉原因"
                };
            } else {
                this.parttern = "user";
                this.mapping = {
                    "user": "跟进人",
                    "level": "个人评级"
                };
            }

            this.typeObj =  {
                '1': '潜在客户',
                '2': '签约客户'
            };
            this.levelObj = {

            };
            this.userObj = {

            };
            var _self = this;
            OMS_COM.ajaxPost({
               api: 'getCustomerConfig',
                data: {},
                success: function (data) {
                    var res = JSON.parse(data);
                    if(parseInt(res.code)==0) {
                        _.forEach(Object.keys(res.data.companyLevel), function (val) {
                            _self.levelObj[val] = res.data.companyLevel[val];
                        });
                    }
                    console.log('in ajaxPost');
                    console.log(filter.levelObj);
                    filter.renderLevel();
                },
                error: function () {

                },
                always: function () {

                }
            });
            // this.linkStatusObj = {
            //     0: '未联系',
            //     53: '联系中',
            //     54: '绕到负责人',
            //     55: '约到负责人',
            //     56: '已经使用',
            //     220: '联系负责人中'
            // };
            // this.dateObj = {
            //     '0': '本周',
            //     '1': '本月',
            //     '2': '自定义时间区间'
            // };
        },
        initLeftFilter: function(){
            var el = $('#select-filt .ui-col-33 .ultwo'),
                htmlTpl = '',
                self = this;
            for(var code in self.mapping) {
                if(code == self.parttern)
                    htmlTpl+='<li data-code="' + code + '" class="mg0 tabed">';
                else
                    htmlTpl+='<li data-code="' + code + '" class="mg0">';
                htmlTpl += '<p>' + self.mapping[code] + '</p></li>';
            }
            el.html(htmlTpl);

            $("#select-filt .ui-col-33 li").on('click',function(event){
                $(".selshow").hide();
                $(this).siblings('li').removeClass('tabed');
                $(this).toggleClass('tabed');
                self.parttern = $(this).data('code');
                console.log("#in select-filt .ui-col-33 li");
                console.log("#" + self.parttern);
                $("#" + self.parttern).show();
                stopEventBubble(event);
            });
        },
        initRightFilter: function(){
            if(OMS.filterObj.type == 3) {
                this.renderUser();
                this.renderType();
                // this.renderLevel();
            } else {
                this.renderUser();
                // this.renderLevel();
            }
            // if(OMS.filterObj.isSub === 0){
            //     this.renderFoll();
            //     this.renderManager();
            //     this.renderPerson();
            //     this.renderDate();
            // }
            // else {
            //     if(!OMS.isSpecRole)
            //         this.renderOwner();
            //     this.renderDate();
            //     this.renderFoll();
            //     this.renderManager();
            //     this.renderPerson();
            //     this.renderLink();
            // }
        },
        initEvent: function(){
            var self = this;
            $("#filt-tap").click(function(){
                $(this).siblings('.activeTab').removeClass("activeTab");
                $(this).toggleClass("activeTab");

                if(document.getElementById('select-filt').style.display == 'none'){
                    $('.select-date').hide();
                    // if(OMS.filterObj.isSub === 1 && !OMS.isSpecRole && !self.allUser)
                    if(true)
                        self.getAllUser();
                    else
                        $('#select-filt').show();
                }else{
                    $('.select-date').hide();
                    $("#top").show();
                }
                stopEventBubble(event);
            });
            $("#select-filt").click(function(event){
                $(this).hide();
                $("#top").show();
                $("#filt-tap").toggleClass("activeTab");
                stopEventBubble(event);
            });
            //提交表单事件
            $("#cfmBtn").off('click');
            $("#cfmBtn").on('click',function(event){
                $('.select-date').hide();
                $("#top").show();
                $("#filt-tap").toggleClass("activeTab");
                self.initOmsTop();
                //筛选－>refresh
                OMS.getData();
                stopEventBubble(event);
            });
            //重置表单事件
            $("#resetBtn").on('click',function(event){
                //清空OMS.filterObj
                self.clearOMS();
                $("#FilterUl").html('');
                $(".activeli").removeClass('activeli');
                $(".activeli-radio").removeClass('activeli-radio');
                $("#selectDate").hide();
                self.initOmsTop();
                stopEventBubble(event);
            });
        },
        countSize: function(){
            var size = 0;
            for(var key in this.mapping) {
                var item = OMS.filterObj[key];
                if(item && item.length > 0) size++;
                // if(item){
                //     size += item.length * 95;
                // }
            }
            if(OMS.filterObj.nextStartTime || OMS.filterObj.nextEndTime) {
                size++;
                // if(OMS.filterObj.nextStartTime && OMS.filterObj.nextEndTime)
                //     size+=170;
                // else
                //     size+=120;
            }
            // return size ? size + 10 : 0;
            return size;
        },
        clearOMS: function(){
            for(var key in this.mapping) {
                if(OMS.filterObj[key]){
                    OMS.filterObj[key] = [];
                }
            }
            OMS.filterObj.nextStartTime = '';
            OMS.filterObj.nextEndTime = '';
        },
        codeInSelected : function(code, type){
            var selected = OMS.filterObj[type];
            for(var i in selected){
                if(code == selected[i]){
                    return true;
                }
            }
        },
        resetFilterSpan : function(obj, isdel){
            var key = "[data-" + obj.type + "='" + obj.code + "']";
            if(isdel){
                $(key).remove();
                this.initOmsTop();
            }else{
                var span = '<li data-' + obj.type + '="' + obj.code + '" class="ui-col col-span ' + obj.type + '">' + obj.name + '<br>' + this.mapping[obj.type] + '</li>';
                $("#FilterUl").append(span);
                this.renderOmsTop();
            }
        },
        renderOmsTop: function(){
            $("#select-filt").css("top","100px");
            $("#top").css("top","100px");
            filter.initFilterWidth();
            if(OMS.myScroll) OMS.myScroll.refresh();
        },
        initOmsTop: function(){
            if(!this.countSize()){
                $("#select-filt").css("top","40px");
                $("#top").css("top","40px");

                if(OMS.myScroll) OMS.myScroll.refresh();
            }
            filter.initFilterWidth();
        },
        initFilterWidth: function(){
            var filterli = $("#FilterUl").children(),
                filterWidth = 0;
            for(var i = 0, len = filterli.length; i < len; i++) {
                //margin
                if(i == 0)
                    filterWidth += 20;
                else
                    filterWidth += 10;
                if(i === (len - 1))
                    filterWidth += 10;

                filterWidth += filterli[i].offsetWidth + 1;
            }
            $("#FilterUl").css("width", filterWidth + "px");
            $("#FilterUl").parent().scrollLeft(filterWidth);
        },
        // renderOwner: function(){
        renderUser: function(){
            var htmlTpl = '',
                data = this.userObj,
                self = this;
            filter.littleCorrect();
            htmlTpl = '<ul class="ui-list ui-list-text ultwo selshow" id="user" style="display: ' + (self.parttern == 'user'?'block':'none') + '">';
            htmlTpl += '<li id="search_user" class="ui-border-t"><p>选择员工</p></li>';
            for(var i in data){
                htmlTpl += '<li data-name="'+ data[i].realname+'" data-id="'+data[i].id+'" class="ui-border-t">';
                if(OMS.filterObj.user && OMS.filterObj.user.indexOf(parseInt(data[i].id)) > -1){
                    htmlTpl += '<p class="filterli activeli">'+data[i].realname+'</p>';
                }else{
                    htmlTpl += '<p class="filterli">'+data[i].realname+'</p>';
                }
                htmlTpl += '</li>';
            }
            htmlTpl += '</ul>';
            $('#select-filt #user').remove();
            $('#select-filt .ui-col-67').append(htmlTpl);
            //绑定事件
            $('#user li').on('click',function(event){
                if($(this).attr('id') != 'search_user'){
                    var name = $(this).data('name');
                    var code = $(this).data('id');

                    if(self.codeInSelected(code, 'user')){
                        OMS.filterObj.user.splice(OMS.filterObj.user.indexOf(code), 1);
                        filter.resetFilterSpan({type:'user',name:name,code:code}, true);
                    }else{
                        console.log('in renderUser');
                        console.log(OMS.filterObj);
                        OMS.filterObj.user.push(code);
                        filter.resetFilterSpan({type:'user',name:name,code:code}, false);
                    }
                    $(this).find('.filterli').toggleClass('activeli');
                }
                else
                    self.renderAllUser();
                stopEventBubble(event);
            });
        },
        // renderFoll: function(){
        renderType: function(){
            var typeObj = this.typeObj,
                htmlTpl = '',
                self = this;
            console.log('in renderType');
            console.log(typeObj);
            htmlTpl = '<ul class="ui-list ui-list-text ultwo selshow" id="type" style="display: ' + (self.parttern == 'type'?'block':'none') +'">';
            htmlTpl += '<li id="sel_all_level" class="ui-border-t"><p class="filterli">不限</p></li>';
            for(var key in typeObj) {
                console.log(key);
                htmlTpl += '<li data-name="'+ typeObj[key] +'" data-id="'+ key +'" class="ui-border-t">';
                if(OMS.filterObj.typeObj && OMS.filterObj.typeObj.toString().indexOf(key) > -1){
                    htmlTpl += '<p class="filterli activeli">'+typeObj[key]+'</p>';
                }else{
                    htmlTpl += '<p class="filterli">'+typeObj[key]+'</p>';
                }
                htmlTpl += '</li>';
            }
            htmlTpl += '</ul>';
            $('#select-filt .ui-col-67').append(htmlTpl);
            //绑定事件
            $('#type li').on('click',function(event){
                if($(this).attr('id') == 'sel_all_level'){
                    if(!$(this).find('.filterli').hasClass('activeli')){
                        OMS.filterObj.type = 3;
                        $("#type .activeli").removeClass('activeli');
                        $(".type").remove();
                        self.initOmsTop();
                    }
                }
                else {
                    $("#sel_all_level .filterli").removeClass('activeli');
                    var name = $(this).data('name');
                    var code = $(this).data('id');
                    if(self.codeInSelected(code, 'type')){
                        OMS.filterObj.type.splice(OMS.filterObj.type.indexOf(code), 1);
                        self.resetFilterSpan({type:'type',name:name,code:code}, true);
                    }else{
                        OMS.filterObj.type = code;
                        self.resetFilterSpan({type:'type',name:name,code:code}, false);
                    }
                }
                $(this).find('.filterli').toggleClass('activeli');
                stopEventBubble(event);
            });
        },
        // renderManager: function(){
        renderLevel: function(){
            var levelObj = this.levelObj,
                htmlTpl = '',
                self = this;
            console.log('in renderLevel');
            console.log(levelObj);
            console.log(filter.levelObj);
            htmlTpl = '<ul class="ui-list ui-list-text ultwo selshow" id="level" style="display: ' + (self.parttern == 'level'?'block':'none') + '">';
            htmlTpl += '<li id="sel_all_level" class="ui-border-t"><p class="filterli">不限</p></li>';
            for(var key in levelObj) {
                htmlTpl += '<li data-name="'+ levelObj[key] +'" data-id="'+ key +'" class="ui-border-t">';
                if(OMS.filterObj.level && OMS.filterObj.level.toString().indexOf(key) > -1){
                    htmlTpl += '<p class="filterli activeli">'+levelObj[key]+'</p>';
                }else{
                    htmlTpl += '<p class="filterli">'+levelObj[key]+'</p>';
                }
                htmlTpl += '</li>';
            }
            htmlTpl += '</ul>';
            $('#select-filt .ui-col-67').append(htmlTpl);
            console.log('append finish.');
            //绑定事件
            $('#level li').on('click',function(event){
                if($(this).attr('id') == 'sel_all_level'){
                    if(!$(this).find('.filterli').hasClass('activeli')){
                        OMS.filterObj.level = [];
                        $("#level .activeli").removeClass('activeli');
                        $(".level").remove();
                        self.initOmsTop();
                    }
                }
                else {
                    $("#sel_all_level .filterli").removeClass('activeli');
                    var name = $(this).data('name');
                    var code = $(this).data('id');
                    filter.littleCorrect();
                    if(self.codeInSelected(code, 'level')){
                        OMS.filterObj.level.splice(OMS.filterObj.level.indexOf(code), 1);
                        self.resetFilterSpan({type:'level',name:name,code:code}, true);
                    }else{
                        OMS.filterObj.level.push(code);
                        self.resetFilterSpan({type:'level',name:name,code:code}, false);
                    }
                }
                $(this).find('.filterli').toggleClass('activeli');
                stopEventBubble(event);
            });
            console.log('event bind.');
        },
        renderPerson: function(){
            var personObj = this.personObj,
                htmlTpl = '',
                self = this;

            htmlTpl = '<ul class="ui-list ui-list-text ultwo selshow" id="mylevel" style="display: ' + (self.parttern == 'mylevel'?'block':'none') + '">';
            htmlTpl += '<li id="sel_all_level" class="ui-border-t"><p class="filterli">不限</p></li>';
            for(var key in personObj) {
                htmlTpl += '<li data-name="'+ personObj[key] +'" data-id="'+ key +'" class="ui-border-t">';
                if(OMS.filterObj.mylevel && OMS.filterObj.mylevel.toString().indexOf(key) > -1){
                    htmlTpl += '<p class="filterli activeli">'+personObj[key]+'</p>';
                }else{
                    htmlTpl += '<p class="filterli">'+personObj[key]+'</p>';
                }
                htmlTpl += '</li>';
            }
            htmlTpl += '</ul>';
            $('#select-filt .ui-col-67').append(htmlTpl);
            //绑定事件
            $('#mylevel li').on('click',function(event){
                if($(this).attr('id') == 'sel_all_level'){
                    if(!$(this).find('.filterli').hasClass('activeli')){
                        OMS.filterObj.mylevel = [];
                        $("#mylevel .activeli").removeClass('activeli');
                        $(".mylevel").remove();
                        self.initOmsTop();
                    }
                }
                else {
                    $("#sel_all_level .filterli").removeClass('activeli');
                    var name = $(this).data('name');
                    var code = $(this).data('id');
                    if(self.codeInSelected(code, 'mylevel')){
                        OMS.filterObj.mylevel.splice(OMS.filterObj.mylevel.indexOf(code), 1);
                        self.resetFilterSpan({type:'mylevel',name:name,code:code}, true);
                    }else{
                        OMS.filterObj.mylevel.push(code);
                        self.resetFilterSpan({type:'mylevel',name:name,code:code}, false);
                    }
                }
                $(this).find('.filterli').toggleClass('activeli');
                stopEventBubble(event);
            });
        },
        renderLink: function(){
            var linkStatusObj = this.linkStatusObj,
                htmlTpl = '',
                self = this;

            htmlTpl = '<ul class="ui-list ui-list-text ultwo selshow" id="linkstatus" style="display: ' + (self.parttern == 'linkstatus'?'block':'none') + '">';
            htmlTpl += '<li id="sel_all_level" class="ui-border-t"><p class="filterli">不限</p></li>';
            for(var key in linkStatusObj) {
                htmlTpl += '<li data-name="'+ linkStatusObj[key] +'" data-id="'+ key +'" class="ui-border-t">';
                if(OMS.filterObj.linkstatus && OMS.filterObj.linkstatus.toString().indexOf(key) > -1){
                    htmlTpl += '<p class="filterli activeli">'+linkStatusObj[key]+'</p>';
                }else{
                    htmlTpl += '<p class="filterli">'+linkStatusObj[key]+'</p>';
                }
                htmlTpl += '</li>';
            }
            htmlTpl += '</ul>';
            $('#select-filt .ui-col-67').append(htmlTpl);
            //绑定事件
            $('#linkstatus li').on('click',function(event){
                if($(this).attr('id') == 'sel_all_level'){
                    if(!$(this).find('.filterli').hasClass('activeli')){
                        OMS.filterObj.linkstatus = [];
                        $("#linkstatus .activeli").removeClass('activeli');
                        $(".linkstatus").remove();
                        self.initOmsTop();
                    }
                }
                else {
                    $("#sel_all_level .filterli").removeClass('activeli');
                    var name = $(this).data('name');
                    var code = $(this).data('id');
                    if(self.codeInSelected(code, 'linkstatus')){
                        OMS.filterObj.linkstatus.splice(OMS.filterObj.linkstatus.indexOf(code), 1);
                        self.resetFilterSpan({type:'linkstatus',name:name,code:code}, true);
                    }else{
                        OMS.filterObj.linkstatus.push(code);
                        self.resetFilterSpan({type:'linkstatus',name:name,code:code}, false);
                    }
                }
                $(this).find('.filterli').toggleClass('activeli');
                stopEventBubble(event);
            });
        },
        renderDate: function(){
            var dateObj = this.dateObj,
                htmlTpl = '',
                self = this;

            htmlTpl = '<ul class="ui-list ui-list-text ultwo selshow" id="linkdate" style="display: ' + (self.parttern == 'linkdate'?'block':'none') + '">';
            htmlTpl += '<li id="sel_all_level" class="ui-border-t"><p class="filterli">不限</p></li>';
            for(var code in dateObj) {
                htmlTpl += '<li data-name="'+ dateObj[code] +'" data-id="'+ code +'" class="ui-border-t">';
                htmlTpl += '<p class="filterli">'+dateObj[code]+'</p>';
                htmlTpl += '</li>';
            }
            htmlTpl += '<li id="nextStartTime" class="ui-form-item selectDate" style="display: none">开始时间</li>';
            htmlTpl += '<li id="nextEndTime" class="ui-form-item selectDate" style="display: none">结束时间</li>';

            htmlTpl += '</ul>';
            $('#select-filt .ui-col-67').append(htmlTpl);

            //绑定事件
            $('#linkdate li').on('click',function(event){
                if($(this).attr('id') == 'nextStartTime') {
                    var n =  moment().format('YYYY-MM-DD');
                    dd.biz.util.datepicker({
                        format: 'yyyy-MM-dd',
                        value: n,
                        onSuccess : function(result) {
                            var startTime = Date.parse(result.value.replace(/-/g, '/') + " 00:00:00");
                            if(result.value < n){
                                dd.device.notification.toast({
                                    icon: '',
                                    text: '到期结束时间不能小于今天',
                                    onSuccess : function(result) {},
                                    onFail : function(err) {}
                                });
                            }else{
                                OMS.filterObj.nextStartTime = startTime;
                                $('#nextStartTime').html(result.value);
                                var startDate = result.value;
                                var endDate = OMS.filterObj.nextEndTime?formatStamp(OMS.filterObj.nextEndTime):'';
                                var str = '';
                                if(startDate && !endDate)
                                    str = startDate + '之后';
                                else if(endDate && !startDate)
                                    str = endDate + '之前';
                                else if(startDate && endDate)
                                    str = startDate + '至' + endDate;

                                $(".linkdate").remove();
                                if(str)
                                    self.resetFilterSpan({type:'linkdate',name:str,code: '2'},false);
                                else
                                    self.resetFilterSpan({type:'linkdate',name:str,code: '2'},true);
                            }
                        },
                        onFail : function() {}
                    });
                }
                else if($(this).attr('id') == 'nextEndTime') {
                    var n =  moment().format('YYYY-MM-DD');
                    dd.biz.util.datepicker({
                        format: 'yyyy-MM-dd',
                        value: n,
                        onSuccess : function(result) {
                            var endTime = Date.parse(result.value.replace(/-/g, '/') + " 23:59:59");
                            if(result.value < n){
                                dd.device.notification.toast({
                                    icon: '',
                                    text: '到期结束时间不能小于今天',
                                    onSuccess : function(result) {},
                                    onFail : function(err) {}
                                });
                            }
                            else if(OMS.filterObj.nextStartTime && (endTime < OMS.filterObj.nextStartTime)) {
                                dd.device.notification.toast({
                                    icon: '',
                                    text: '结束时间不能小于开始时间',
                                    onSuccess : function(result) {},
                                    onFail : function(err) {}
                                });
                            }
                            else{
                                OMS.filterObj.nextEndTime = endTime;
                                $('#nextEndTime').html(result.value);
                                var endDate = result.value;
                                var startDate = OMS.filterObj.nextStartTime?formatStamp(OMS.filterObj.nextStartTime):'';
                                var str = '';
                                if(startDate && !endDate)
                                    str = startDate + '之后';
                                else if(endDate && !startDate)
                                    str = endDate + '之前';
                                else if(startDate && endDate)
                                    str = startDate + '至' + endDate;
                                $(".linkdate").remove();
                                if(str)
                                    self.resetFilterSpan({type:'linkdate',name:str,code: '2'},false);
                                else
                                    self.resetFilterSpan({type:'linkdate',name:str,code: '2'},true);
                            }
                        },
                        onFail : function() {}
                    });
                }
                else if($(this).attr('id') == 'sel_all_level') {
                    if(!$(this).find('.filterli').hasClass('activeli')){
                        $(this).siblings('li').find('.filterli').removeClass('activeli');
                        OMS.filterObj.nextStartTime = '';
                        OMS.filterObj.nextEndTime = '';
                        $('.linkdate').remove();
                        $('#linkdate .selectDate').hide();

                        self.initOmsTop();
                    }
                }
                else if($(this).find('.filterli').hasClass('activeli')) {
                    OMS.filterObj.nextStartTime = '';
                    OMS.filterObj.nextEndTime = '';
                    $('.linkdate').remove();
                    $('#linkdate .selectDate').hide();

                    self.initOmsTop();
                }
                else {
                    $(this).siblings('li').find('.filterli').removeClass('activeli');
                    var name = $(this).data('name');
                    var code = $(this).data('id');
                    $('.linkdate').remove();
                    if(code == '2'){
                        $('#nextStartTime').html('开始时间');
                        $('#nextEndTime').html('结束时间');
                        OMS.filterObj.nextStartTime = '';
                        OMS.filterObj.nextEndTime = '';
                        $('#linkdate .selectDate').show();
                        self.initOmsTop();
                    }
                    else {
                        $('#linkdate .selectDate').hide();
                        if(code == '0')
                            var reDate = formatDate.get('','week');
                        else
                            var reDate = formatDate.get('','month');

                        OMS.filterObj.nextStartTime = Date.parse(reDate.startDate.replace(/-/g, '/') + " 00:00:00");
                        OMS.filterObj.nextEndTime = Date.parse(reDate.endDate.replace(/-/g, '/') + " 23:59:59");
                        self.resetFilterSpan({type:'linkdate', name:name, code:code}, false);
                    }
                }
                $(this).find('.filterli').toggleClass('activeli');
                stopEventBubble(event);
            });
        },
        getAllUser: function(){
            // new home().getSubordinate(this.checkOwnerObj);
            // OMS.filterObj
            OMS_COM.ajaxPost({
                api: "getSubordinateUser",
                data: {realname:''},
                success: this.checkOwnerObj,
                error: function () {

                },
                always: function () {

                }
            });
        },
        checkOwnerObj: function(data){
            var res = JSON.parse(data);
            data = res.data;
            if(!filter.allUser) filter.allUser = data || [];
            var temp = {},
                ownerObj = filter.userObj,
                tempArr = [];
            for(var i in data ){
                temp[data[i].id] = true;
            }
            for(var j in ownerObj) {
                if(temp[ownerObj[j].id])
                    tempArr.push(ownerObj[j]);
            }
            filter.userObj = tempArr;
            localStorage.setItem(filter.key, JSON.stringify(filter.userObj));
            filter.renderUser();
            $('#select-filt').show();
        },
        renderAllUser: function(){
            var data = filter.allUser || [];
            filter.littleCorrect();
            var selectedSize = OMS.filterObj.user.length;
            var htmlTpl = '<section class="ui-container" id="allSelectUser">' +
            '<div class="ui-searchbar-wrap ui-border-b" id="searchwrap">' +
                '<div class="ui-searchbar">' +
                    '<i class="ui-icon-public_search"></i>' +
                    '<div class="ui-searchbar-text">搜索</div>' +
                    '<div class="ui-searchbar-input">' +
                        '<input value="" type="text" placeholder="搜索" autocapitalize="off">' +
                    '</div>' +
                    '<i class="ui-icon-close"></i>' +
                '</div>' +
                '<button class="ui-searchbar-cancel">取消</button>' +
            '</div>';

            htmlTpl += '<ul class="ui-list ui-border-b" id="all-list">';
            for(var i in data){
                htmlTpl += filter.renderUserLi(data[i]);
            }
            htmlTpl += '</ul><footer class="userFooter">';
            //增加底部按钮，和统计信息
            htmlTpl += '<div class="selectUserUl"><div style="width:' + selectedSize * 80 + 'px">';
            if(selectedSize !== 0){
                for(var i in data){
                    htmlTpl += filter.renderSelectUserLi(data[i]);
                }
            }
            else
                htmlTpl += '<em>请选择员工</em>'
            htmlTpl += '</div></div>';

            htmlTpl += '<div class="submitBtn"' + (!selectedSize?' style="background-color: #CCC"':'') + '>确定(' + selectedSize + ')</div>';
            htmlTpl += '</footer></section>';

            filter.setSearchApi();
            $("body").append(htmlTpl);

            filter.allUserEventListener();
            filter.searchWrapListener();
        },
        renderUserLi: function(obj){
            var htmlTpl = '<li class="ui-border-b" data-code="'+obj.id+'" data-name="'+obj.realname+'">';
            if(OMS.filterObj.user.indexOf(parseInt(obj.id)) > -1)
                htmlTpl += '<div class="filterli activeli"></div>';
            else
                htmlTpl += '<div class="filterli"></div>';

            htmlTpl += '<div class="ui-avatar-s">';
            // if(obj.photo == null || obj.photo == ''){
            htmlTpl += '<span class="hecom-avatar-text"><span>'+obj.realname.substr(-2)+'</span></span>';
            // }else{
            //     htmlTpl += '<span class="hecom-avatar-img"><img src="'+obj.photo+'" /></span>';
            // }
            htmlTpl += '</div>';

            htmlTpl += '<div class="ui-list-info">' +
                '<h4 class="ui-nowrap">' + obj.realname + '</h4>' +
                // '<p class="ui-nowrap">' + (!obj.orgName ? '&nbsp;' : obj.orgName) + '</p>' +
            '</div>';
            htmlTpl += '</li>';
            return htmlTpl;
        },
        renderSelectUserLi: function(obj){
            var htmlTpl = "";
            if(OMS.filterObj.user.indexOf(parseInt(obj.id)) > -1)
                htmlTpl += "<span data-code='" + obj.id + "'>" + obj.realname + "</span>";
            return htmlTpl;
        },
        allUserEventListener: function(){
            var self = this;
            // $("#all-list li").on('click',function(event){
            _bindEvent($("#all-list li"), function(event){
                var code = $(this).data('code');
                var name = $(this).data('name');
                filter.littleCorrect();
                if(self.codeInSelected(code, 'user')){
                    OMS.filterObj.user.splice(OMS.filterObj.user.indexOf(code), 1);
                    filter.resetFilterSpan({type:'user',name:name,code:code}, true);

                    $(".selectUserUl div").find("[data-code='"+code+"']").remove();
                    $(".selectUserUl div").css({'width': OMS.filterObj.user.length * 80 + 'px'});
                    if(OMS.filterObj.user.length == 0) $(".selectUserUl div").html("<em>请选择员工</em>");
                }else{
                    if(OMS.filterObj.user.length == 0) $(".selectUserUl div").html("");
                    OMS.filterObj.user.push(code);
                    filter.resetFilterSpan({type:'user',name:name,code:code}, false);
                    $(".selectUserUl div").append(self.renderSelectUserLi({realname:name, id:code}));
                    $(".selectUserUl div").css({'width': OMS.filterObj.user.length * 80 + 'px'});
                }
                self.updateOwnerObj(name, code);
                $("#user [data-id='"+code+"']").find('.filterli').toggleClass('activeli');

                $(this).find('.filterli').toggleClass('activeli');

                $("#allSelectUser .submitBtn").html("确定(" + OMS.filterObj.user.length + ")")

                if(OMS.filterObj.user.length === 0)
                    $("#allSelectUser .submitBtn").attr("style", "background-color: #CCC");
                else
                    $("#allSelectUser .submitBtn").attr("style", "");
                event.stopPropagation();
            });
        },
        updateOwnerObj: function(name, code){
            var owner = {},
                isExists = false,
                htmlTpl = '';
            owner.realname = name;
            owner.id = code;
            for(var i in this.ownerObj){
                if(this.ownerObj[i].id == code)
                    isExists = true;
            }
            if(!isExists){
                this.ownerObj.unshift(owner);
                htmlTpl = '<li data-name="'+ name +'" data-id="' + code + '" class="ui-border-t">';
                htmlTpl += '<p class="filterli">' + name + '</p>';
                htmlTpl += '</li>';
                $('#select-filt #user').find('#search_user').after(htmlTpl);
                localStorage.setItem(this.key, JSON.stringify(this.ownerObj.slice(0, 10)));
                //事件重绑
                $("#user li[data-id='" + code + "']").on('click',function(event){
                    if($(this).attr('id') != 'search_user'){
                        var name = $(this).data('name');
                        var code = $(this).data('id');

                        if(filter.codeInSelected(code, 'user')){
                            OMS.filterObj.user.splice(OMS.filterObj.user.indexOf(code), 1);
                            filter.resetFilterSpan({type:'user',name:name,code:code}, true);
                        }else{
                            OMS.filterObj.user.push(code);
                            filter.resetFilterSpan({type:'user',name:name,code:code}, false);
                        }
                        $(this).find('.filterli').toggleClass('activeli');
                    }
                    else
                        filter.renderAllUser();
                    stopEventBubble(event);
                });
            }
        },
        searchWrapListener: function(){
            var self = this;

            $('#allSelectUser .submitBtn').on('click', function(){
                $("#allSelectUser").remove();

                OMS.initTitleBar();
                OMS.initLeftBar();
            });

            $('#allSelectUser input').on('input onpaste',function() {
                var key = $.trim($(this).val());
                self.getListLi(key);
            });

            $('#allSelectUser .ui-searchbar').on('click',function(event){
                $('.ui-searchbar-wrap').addClass('focus');
                $('.ui-searchbar-input input').focus();
                event.stopPropagation();
            });

            $('.ui-searchbar-cancel').on('click',function(event){
                $('.ui-searchbar-wrap').removeClass('focus');
                $('.ui-searchbar-input input').val('');
                self.getListLi('');
                event.stopPropagation();
            });

            $(".ui-icon-close").on('click', function(){
                $('.ui-searchbar-input input').val('');
                self.getListLi('');
            });
        },
        getListLi: function(key){
            var htmlTpl = "",
                self = this;
            var data = self.allUser;
            for(var i in data){
                if(key=='' || JSON.stringify(data[i]).indexOf(key) > -1 )
                    htmlTpl += self.renderUserLi(data[i]);
            }
            $("#all-list").html(htmlTpl);
            this.allUserEventListener();
        },
        setSearchApi: function(){
            dd.ready(function(){
                dd.biz.navigation.setTitle({
                    title: '选择员工',
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
                            $("#allSelectUser").remove();
                            OMS.initTitleBar();
                            OMS.initLeftBar();
                        },
                        onFail : function(err) {}
                    });
                }else{
                    $(document).off('backbutton');
                    $(document).on('backbutton', function(e) {
                        $("#allSelectUser").remove();
                        OMS.initTitleBar();
                        OMS.initLeftBar();
                        e.preventDefault();
                    });
                }
            });
        },
        littleCorrect: function() {
            if (typeof OMS.filterObj.user == 'string') {
                OMS.filterObj.user = JSON.parse(OMS.filterObj.user);
            }
            if (typeof OMS.filterObj.level == 'string') {
                OMS.filterObj.level = JSON.parse(OMS.filterObj.level);
            }
        }
    };
    var search = {
        init: function(){
            this.initEvent();
            this.initParams();
        },
        initParams: function(){
            window.openSearch = this.openSearch;
            this.myScroll = null;
            this.searchData = [];
            this.key = "oms_private_search_history";
            var history = localStorage.getItem(this.key);
            this.history = history?JSON.parse(history):[];
        },
        initEvent: function(){
            var self = this;
            $("#seac-tap").click(function(){
                self.renderCustomer();
            });
        },
        renderCustomer: function(){
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
            htmlTpl += '<div id="search-history"' + (this.history.length?'':' style="display: none"') + '>';
            htmlTpl += '<div id="search-history-title" class="ui-border-b">搜索历史</div>';
            htmlTpl += '<div id="history-wrapper"><section class="scroller">';
            htmlTpl += '<ul class="ui-list ui-list-text ui-border-b" id="history-list">';
            htmlTpl += this.renderHistory();
            htmlTpl +='</ul></section></div></div>';

            htmlTpl += '</div>';
            htmlTpl += '</section>';

            $("body").append(htmlTpl);
            this.searchWrapListener();
            this.historyWrapListener();
            $("#allSelectCus").siblings(['#top','#listNav']).hide();
            $('#allSelectCus .ui-searchbar-wrap').addClass('focus');
            $('#allSelectCus input').focus();
        },
        renderHistory: function(){
            var htmlTpl = "", history = this.history;
            for(var i = 0, len = history.length; i < len; i++){
                htmlTpl += "<li class='ui-border-t'>" + history[i] + "</li>";
            }
            return htmlTpl;
        },
        updateHistory: function(val){
            if (this.history.indexOf(val) > -1) return;
            $("#search-hint").remove();
            $("#allSelectCus .ui-search-container").css("background-color", "");
            //更新缓存
            this.history.unshift(val);
            this.history = this.history.slice(0, 20);
            localStorage.setItem(this.key, JSON.stringify(this.history));
            //更新历史记录
            var htmlTpl = this.renderHistory();
            $("#history-list").html(htmlTpl);
            this.historyWrapListener();
        },
        historyWrapListener: function() {
            var self = this;
            //添加历史记录的搜索
            _bindEvent($("#search-history li"), function(e){
                var val = $.trim($(e.target).html());
                if(!val || e.target.nodeName !== "LI") return;
                $('#allSelectCus input').val(val);
                $('#allSelectCus .ui-searchbar-wrap').addClass('focus');
                self.refreshSearch(val);
            });
            if(search.hisScroll)
                search.hisScroll.refresh();
            else
                search.hisScroll = new myIScroll("history-wrapper");
        },
        openSearch: function() {
            var val = $.trim($('#allSelectCus input').val());
            if(val) {
                search.updateHistory(val);
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
        searchWrapListener: function(){
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

            // var sendObj = {};
            // sendObj.callback = this.renderSearch;
            // sendObj.data = this.initFilter(cusName);
            // sendObj.isSearch = true;
            // search.sendAjax(sendObj);
            this.initFilter(cusName);
            var sendObj = {};
            sendObj.type = OMS.filterObj.type;
            sendObj.name = cusName;
            OMS_COM.ajaxPost({
                api: "getCompanyList",
                data: sendObj,
                success: this.renderSearch,
                error: function () {

                },
                always: function () {

                }
            });
        },
        initFilter: function(cusName){
            this.filterObj = {};
            // this.filterObj.cusName = ;
            this.filterObj.customer_info = cusName;
            this.filterObj.page = 1;

            this.filterObj.isSub = OMS.filterObj.isSub;
            this.filterObj.isNew = OMS.filterObj.isNew;
            this.filterObj.type = OMS.filterObj.type;
            this.pageSize = OMS.pageSize;
            this.lastSize = 0;
            return this.filterObj;
        },
        renderSearch: function(data){
            var res = JSON.parse(data);
            if(parseInt(res.code) < 0) return;
            if(!$("#search-list")) return;
            console.log('in renderSearch');
            console.log(res);
            console.log(search);
            data = res.data.list;
            if(search.searchType)
                search.searchData = search.searchData.concat(data);
            else{
                $("#search-list").html('');
                search.searchData = data;
            }
            var htmlTpl = OMS.renderCusListLi(data);
            $("#search-list").append(htmlTpl);

            search.lastSize = data.length || 0;
            if(!search.searchData || search.searchData.length === 0 ){
                $("#search-msg").html("未找到您查询的客户");
                $("#search-msg").show();
            }
            else {
                $("#search-msg").hide();
                console.log(search.pageSize);
                console.log(data);
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
                        openCustomerInfo($(this).data("code"));
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
            search.sendAjax(sendObj);
        },
        sendAjax: function(sendObj){
            this.clearAjax();
            this.ajaxControl =
                setTimeout(function(){
                    new home().getCustomers(sendObj);
                }, 300);
        },
        clearAjax: function(){
            if(this.ajaxControl) clearTimeout(this.ajaxControl);
            if(this.ajax && this.ajax.abort) this.ajax.abort();
        }
    };
    var openCustomerInfo = function(code){
        //leader私海增加参数leaderPriv=1
        // if(OMS.filterObj.isSub === 0 && OMS.isLeader)
        //     openLink(oms_config.baseUrl + "customerInfo.html?code=" + code + "&from=private&jumpType=close&leaderPriv=1", true);
        // else
        //     openLink(oms_config.baseUrl + "customerInfo.html?code=" + code + "&from=private&jumpType=close", true);
        // openLink(oms_config.baseUrl + "customerDetail.html?code=" + code);
    };
    var getGMTDate = function() {
        var d = new Date(), utcOffset = 8;
        return d.getTime() + d.getTimezoneOffset() * 60000 + (3600000 * utcOffset);
    };
    var sendQuest = function(config){
        var apiUrl = oms_config.apiUrl + oms_apiList[config.api];
        var sendData = config.data || {};
        sendData.omsuid = OMS.user.id;
        sendData.token = OMS.user.token;
        var request = $.ajax({
            url: apiUrl,
            type: config.type,
            data: sendData,
            cache: false,
            success: function(response){
                if(response){
                    var result = JSON.parse(response);
                    if(result.res === 1)
                        config.callback && config.callback(result.data);
                    else if(result.msg)
                        new home().error(result.msg);
                }
                else
                    new home().error("服务异常");
            },
            error: function(xhr, errorType, error){
                if(errorType == "abort") return;
                var msg = "网络请求失败";
                if(config.error)
                    config.error(msg);
                else
                    new home().error(msg);
            }
        });
        if(config.isSearch)
            search.ajax = request;
        else if(config.isLoadCus)
            OMS.ajax = request;
    };
    var deepCopy = function(obj){
        var temp = {};
        for(var key in obj){
            temp[key] = obj[key];
        }
        return temp;
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
    var home = function(){};
    home.prototype.getCustomers = function(obj){
        // obj.data.user = JSON.stringify(obj.data.user);
        var form_data = obj.data;
        // form_data['user'] = JSON.stringify(form_data.user);
        // form_data['level'] = JSON.stringify(form_data.level);
        OMS_COM.ajaxPost({
            api: 'getCompanyList',
            data: form_data,
            success: obj.success,
            error: obj.error,
            always: obj.always
        });
        // var config = {};
        // config.api = 'getCustomers';
        // config.type = 'post';
        //
        // config.data = obj.data;
        // config.callback = obj.callback;
        // if(obj.isSearch)
        //     config.isSearch = true;
        // else if(obj.isLoadCus)
        //     config.isLoadCus = true;
        //
        // config.error = function(msg){
        //     if($("#msg").css("display") == "block")
        //         $("#msg").html(msg);
        // };
        // sendQuest(config);
    };
    home.prototype.getSubordinate = function(callback){
        var config = {};
        config.api = 'getSubordinate';
        config.type = 'post';
        config.callback = callback;
        sendQuest(config);
    };
    home.prototype.error = function(Msg){
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
    //免登验证
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
