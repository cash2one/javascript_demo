$(function(){
    FastClick.attach(document.body);
    //顶部导航
    var OMS = {
        user: {},
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
            /****初始化接口参数 START****/
            this.filterObj = {};

            this.filterObj.ownerid = [];
            this.filterObj.areaid = [];
            this.filterObj.follStatus = [];
            this.filterObj.renew_managerlevel = [];
            this.filterObj.renew_mylevel = [];
            this.filterObj.product_ver = [];
            this.filterObj.trade = [];
            this.filterObj.nextStartTime = '';
            this.filterObj.nextEndTime = '';
            this.filterObj.page = 1; //起始页码
            this.filterObj.isSub = +getUrlParam("isSub") || 0; //是否是下属的客户，默认为0（非下属）
            this.filterObj.isNew = 0; //续签标志
            this.filterObj.type = 2; //续签私海
            this.filterObj.orderType = this.filterObj.isSub === 0 ? 3 : 9;

            /****初始化接口参数 END****/
            /****初始化排序列表 start****/
            this.sortList = {
                4: "即将到期",
                5: "最近未跟进",
                //以下三个分组
                6: "经理评级",
                7: "个人评级",
                //新增 [成单指数]
                10: "智能推荐排序"
            };
            if(this.filterObj.isSub === 0)
                this.sortList[3] = "默认排序";
            else
                this.sortList[9] = "默认排序";

            /****初始化排序列表 end****/
            // this.user.role 2 是续签业务员, 4 是续签leader
            this.isLeader = +this.user.role === 2 ? false : true;

            this.classify = [6, 7, 8];
            this.pageSize = 20;
            this.lastSize = 0;

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
        refreshData: function(){
            var sendObj = {};
            if(OMS.myScroll)
                $("#wrapper").find("#pullUp").hide();
            if(OMS.classify.indexOf(OMS.filterObj.orderType) > -1){
                delete OMS.filterObj.page;
                sendObj.callback = OMS.renderClassify;
                OMS.detroyScroll();
            }
            else{
                OMS.filterObj.page = 1;
                sendObj.callback = OMS.renderCusList;
            }
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
            sendObj.callback = OMS.renderCusList;

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
            if(OMS.classify.indexOf(OMS.filterObj.orderType) > -1)
                return;
            //新签 业务员
            if(OMS.data && OMS.data.length > 0)
                OMS.data = OMS.data.concat(data);
            else
                OMS.data = data;

            if(!OMS.data || !OMS.data.length){
                if(!filter.countSize())
                    $("#msg").html("暂无续签客户");
                else
                    $("#msg").html("没有找到相关客户");
                $("#msg").show();
            }
            else{
                $("#msg").hide();
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
            var htmlTpl = '',
                follObj = filter.follObj;
                tradeObj = filter.tradeObj;
            for(var i = 0, len = data.length; i < len; i++) {
                htmlTpl += '<li data-code="' + data[i].id + '" class="ui-border-t">';
                htmlTpl += '<div class="ui-list-info">';
                htmlTpl += '<h4 class="ui-nowrap itemtoggle">' + data[i].cusname + (data[i].is_on_top === 100?"<em class=\"toTop\">置顶</em>":"") +
                    '<span class="visiting">' + (tradeObj[data[i].trade] || '无行业') + '</span>' +
                '</h4>';

                htmlTpl += '<p class="itemtoggle">';
                htmlTpl += '<span>' + (data[i].follow_type < 0 ? '暂无状态' : (follObj[data[i].follow_type] || '暂无状态')) + '&nbsp;</span>|';
                htmlTpl += '<span>&nbsp;' + (!data[i].renew_managerlevel?'-':data[i].renew_managerlevel) + '级&nbsp;</span>|';
                htmlTpl += '<span>&nbsp;' + (!data[i].renew_mylevel?'-':data[i].renew_mylevel) +'级&nbsp;</span>';
                htmlTpl += '</p>';

                htmlTpl += '<p class="itemtoggle">';
                if(!data[i].contractEnd || data[i].contractEnd.indexOf("0000-00-00") > -1)
                    htmlTpl += '<span>暂无合同&nbsp;</span>';
                else
                    htmlTpl += '<span>合同到期于' + data[i].contractEnd.split(' ')[0] + '&nbsp;</span>';
                if(data[i].follDays > -1)
                    htmlTpl += '|<span>&nbsp;' + data[i].follDays + '天未跟进</span>';
                htmlTpl += '</p>';

                if(OMS.filterObj.isSub === 1) {
                    if(data[i].path)
                        htmlTpl += '<p class="itemtoggle">' + data[i].path + '</p>';
                    else
                        htmlTpl += '<p class="itemtoggle">暂无跟进人</p>';
                }
                htmlTpl +='</div></li>';
            }
            return htmlTpl;
        },
        renderClassify: function(data){
            var htmlTpl = "", htmlArr = {}, classObj = {};

            if(!data || !data.length){
                if(!filter.countSize())
                    $("#msg").html("暂无续签客户");
                else
                    $("#msg").html("没有找到相关客户");
                $("#msg").show();
            }
            else {
                $("#msg").hide();
                if(OMS.filterObj.orderType === 6) {
                    classObj = deepCopy(filter.managerObj);
                }
                else if(OMS.filterObj.orderType === 7) {
                    classObj = deepCopy(filter.personObj);
                }

                var tempData = {};
                for(var i = 0; i < data.length; i++) {
                    var code = data[i].name;
                    if(!classObj[code]){
                        if(!tempData.name) {
                            tempData.name = "无";
                            tempData.total = parseInt(data[i].total);
                        }
                        else {
                            tempData.total += parseInt(data[i].total);
                        }
                        data.splice(i, 1);
                        i--;
                    }
                }
                if(tempData.name == "无") data.unshift(tempData);

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

                    // htmlArr[code] += '<div id="wrapper-"' + code + '><section class="scroller">';
                    htmlArr[code] += '<ul id="custList-' + code  + '" class="ui-border-t"></ul>';
                    // htmlArr[code] += '</section></div>';
                    htmlArr[code] += '</li>';

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

                //初始化数据对象
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
                                OMS.sortObj.renew_managerlevel = [code];
                            else if(OMS.filterObj.orderType === 7)
                                OMS.sortObj.renew_mylevel = [code];
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
                defaultCode = this.filterObj.orderType,
                self = this;

            htmlTpl = '<li class="ui-border-t activeTab" data-code="' + defaultCode + '">'+
                '<p class="sort_order">' +
                    '<span>' + self.sortList[defaultCode] + '</span>' +
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
                });
                $("#select-sort").click(function(){
                    $(this).hide();
                    $("#sort-tap").toggleClass('activeTab');
                });
                //绑定排序列表事件
                $("#select-sort li").click(function(event){
                    OMS.filterObj.orderType = $(this).data('code');
                    self.getData(); //刷新列表
                    $(this).siblings('li').removeClass("activeTab");
                    $(this).toggleClass("activeTab");
                    $('.select-date').hide();
                    $("#sort-tap").toggleClass('activeTab');
                    $("#sort-tap span").html(self.sortList[self.filterObj.orderType]);
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
            var title = getUrlParam("title") || "续签客户";
            ddbanner.changeBannerTitle(title);
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
            this.key = {};
            this.key.staff = 'filter_customer_renewal_staff';
            this.key.area = 'filter_customer_area';
            var staff = localStorage.getItem(this.key.staff),
                area = localStorage.getItem(this.key.area);

            this.ownerObj = staff ? (JSON.parse(staff) || []) : [];
            this.areaObj = area ? (JSON.parse(area) || []) : [];

            // 按角色分类筛选项目
            if(OMS.filterObj.isSub === 0){
                this.parttern = "renew_mylevel";
                this.mapping = {
                    "renew_mylevel": "个人评级",
                    "ownerid": "签单人员",
                    "follStatus": "跟进状态",
                    "trade": "客户行业",
                    "linkdate": "到期日期",
                    "product_ver": "产品类型"
                };
            }
            else {
                this.parttern = "areaid";
                this.mapping = {
                    "areaid": "区域",
                    "ownerid": "续签人员",
                    "follStatus": "跟进状态",
                    "renew_managerlevel": "经理评级",
                    "renew_mylevel": "个人评级",
                    "trade": "客户行业",
                    "linkdate": "到期日期",
                    "product_ver": "产品类型"
                };
            }

            this.follObj =  {
                '-1': '未理单',
                '0': '待理单',
                '1': '已签已回',
                '6': '已签未回',
                '2': '重点跟进',
                '3': '能签能回',
                '4': '冲击客户',
                '5': '已死客户'
            };
            this.managerObj = {
                'A': 'A',
                'B': 'B',
                'C': 'C',
                'D': 'D'
            };
            this.personObj = {
                'a': 'a',
                'b': 'b',
                'c': 'c',
                'd': 'd'
            };
            this.dateObj = {
                'startDate': '开始时间',
                'endDate': '结束时间',
            };
            this.tradeObj = {
                1: '食品',
                2: '农牧农业',
                3: '医药医疗',
                4: '汽配汽用',
                5: '服装服饰',
                6: '家装建材',
                7: '家电数码',
                8: '家居家纺',
                9: '美妆日化',
                10: '商务服务',
                11: '日用百货',
                12: '水暖电工',
                13: '童装母婴',
                14: '五金工具',
                15: '化工能源',
                16: '电子仪表',
                17: '包装印刷',
                18: '安防照明',
                19: '纺织皮革',
                20: '橡胶塑料',
                21: '酒店用品',
                22: '机械工业',
                23: '冶金钢材',
                24: '其它'
            };
            this.productObj = {
                1: '3.0行业版',
                2: '3.0标准版',
                3: '3.0基础版',
                4: '定制版',
                5: '大礼包',
                6: '红圈钉钉',
                7: '红圈钉钉高级版',
                8: '红圈营销4.0',
                9: '红圈营销4.3.0',
                10: '大型客户',
                11: '红圈管理',
                12: '红圈营销',
                13: '红圈分析',
            };
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
                $(this).siblings('li').removeClass('tabed');
                $(this).toggleClass('tabed');
                $(".selshow").hide();
                self.parttern = $(this).data('code');
                if(OMS.filterObj.isSub === 1 && self.parttern == "ownerid" && !filter.allUser)
                    self.getAllUser();
                else
                    $("#" + self.parttern).show();
                stopEventBubble(event);
            });
        },
        initRightFilter: function(){
            if(OMS.filterObj.isSub === 0){
                this.renderPerson();
                this.renderOwner();
                this.renderFoll();
                this.renderTrade();
                this.renderDate();
                this.renderProduct();
            } else {
                this.renderArea();
                this.renderOwner();
                this.renderFoll();
                this.renderManager();
                this.renderPerson();
                this.renderTrade();
                this.renderDate();
                this.renderProduct();
            }
        },
        initEvent: function(){
            var self = this;
            $("#filt-tap").click(function(){
                $(this).siblings('.activeTab').removeClass('activeTab');
                $(this).toggleClass('activeTab');

                if(document.getElementById('select-filt').style.display == 'none'){
                    $('.select-date').hide();
                    if(OMS.filterObj.isSub === 0 && !self.allUser)
                        self.getAllUser();
                    else if(!self.allArea)
                        self.getAllArea();
                    else
                        $('#select-filt').show();
                }else{
                    $('.select-date').hide();
                    $("#top").show();
                }
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
                // alert(JSON.stringify(OMS.filterObj));
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
            }
            if(OMS.filterObj.nextStartTime || OMS.filterObj.nextEndTime)
                size++;
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
            $("#select-filt").css("top","105px");
            $("#top").css("top","105px");
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
        renderArea: function(){
            var htmlTpl = '',
                data = this.areaObj,
                self = this;
            htmlTpl = '<ul class="ui-list ui-list-text ultwo selshow" id="areaid" style="display: ' + (self.parttern == 'areaid'?'block':'none') + '">';
            htmlTpl += '<li class="ui-border-t" id="search_city"><p>选择城市</p></li>';

            for(var i in data){
                htmlTpl += '<li data-name="'+ data[i].region_name +'" data-id="'+ data[i].region_id +'" class="ui-border-t">';
                if(OMS.filterObj.areaid && OMS.filterObj.areaid.indexOf(parseInt(data[i].region_id)) > -1)
                    htmlTpl += '<p class="filterli activeli">' + data[i].region_name;
                else
                    htmlTpl += '<p class="filterli">' + data[i].region_name;
                htmlTpl += (data[i].isPos?'\&nbsp;|\&nbsp;定位':'');
                htmlTpl += '</p></li>';
            }
            htmlTpl += '</ul>';
            $('#select-filt #areaid').remove();
            $('#select-filt .ui-col-67').append(htmlTpl);
            //绑定事件
            $('#areaid li').on('click',function(event){
                if($(this).attr('id') !== 'search_city'){
                    var name = $(this).data('name');
                    var code = $(this).data('id');

                    if(self.codeInSelected(code, 'areaid')){
                        OMS.filterObj.areaid.splice(OMS.filterObj.areaid.indexOf(code), 1);
                        filter.resetFilterSpan({type:'areaid',name:name,code:code}, true);
                    }else{
                        OMS.filterObj.areaid.push(code);
                        filter.resetFilterSpan({type:'areaid',name:name,code:code}, false);
                    }
                    $(this).find('.filterli').toggleClass('activeli');
                }
                else
                    self.renderAllArea();
                stopEventBubble(event);
            });
        },
        renderOwner: function(){
            var htmlTpl = '',
                data = this.ownerObj,
                self = this;

            htmlTpl = '<ul class="ui-list ui-list-text ultwo selshow" id="ownerid" style="display: ' + (self.parttern == 'ownerid'?'block':'none') + '">';
            htmlTpl += '<li id="search_user" class="ui-border-t"><p>选择员工</></li>';
            for(var i in data){
                htmlTpl += '<li data-name="'+ data[i].realname+'" data-id="'+data[i].id+'" class="ui-border-t">';
                if(OMS.filterObj.ownerid && OMS.filterObj.ownerid.indexOf(parseInt(data[i].id)) > -1){
                    htmlTpl += '<p class="filterli activeli">'+data[i].realname+'</p>';
                }else{
                    htmlTpl += '<p class="filterli">'+data[i].realname+'</p>';
                }
                htmlTpl += '</li>';
            }
            htmlTpl += '</ul>';
            $('#select-filt #ownerid').remove();
            $('#select-filt .ui-col-67').append(htmlTpl);
            //绑定事件
            $('#ownerid li').on('click',function(event){
                if($(this).attr('id') != 'search_user'){
                    var name = $(this).data('name');
                    var code = $(this).data('id');

                    if(self.codeInSelected(code, 'ownerid')){
                        OMS.filterObj.ownerid.splice(OMS.filterObj.ownerid.indexOf(code), 1);
                        filter.resetFilterSpan({type:'ownerid',name:name,code:code}, true);
                    }else{
                        OMS.filterObj.ownerid.push(code);
                        filter.resetFilterSpan({type:'ownerid',name:name,code:code}, false);
                    }
                    $(this).find('.filterli').toggleClass('activeli');
                }
                else
                    self.renderAllUser();
                stopEventBubble(event);
            });
        },
        renderFoll: function(){
            var follObj = this.follObj,
                htmlTpl = '',
                self = this;

            htmlTpl = '<ul class="ui-list ui-list-text ultwo selshow" id="follStatus" style="display: ' + (self.parttern == 'follStatus'?'block':'none') +'">';
            htmlTpl += '<li id="sel_all_level" class="ui-border-t"><p class="filterli">不限</p></li>';
            for(var key in follObj) {
                htmlTpl += '<li data-name="'+ follObj[key] +'" data-id="'+ key +'" class="ui-border-t">';
                if(OMS.filterObj.follStatus && OMS.filterObj.follStatus.toString().indexOf(key) > -1){
                    htmlTpl += '<p class="filterli activeli">'+follObj[key]+'</p>';
                }else{
                    htmlTpl += '<p class="filterli">'+follObj[key]+'</p>';
                }
                htmlTpl += '</li>';
            }
            htmlTpl += '</ul>';
            $('#select-filt .ui-col-67').append(htmlTpl);
            //绑定事件
            $('#follStatus li').on('click',function(event){
                if($(this).attr('id') == 'sel_all_level'){
                    if(!$(this).find('.filterli').hasClass('activeli')){
                        OMS.filterObj.follStatus = [];
                        $("#follStatus .activeli").removeClass('activeli');
                        $(".follStatus").remove();
                        self.initOmsTop();
                    }
                }
                else {
                    $("#sel_all_level .filterli").removeClass('activeli');
                    var name = $(this).data('name');
                    var code = $(this).data('id');
                    if(self.codeInSelected(code, 'follStatus')){
                        OMS.filterObj.follStatus.splice(OMS.filterObj.follStatus.indexOf(code), 1);
                        self.resetFilterSpan({type:'follStatus',name:name,code:code}, true);
                    }else{
                        OMS.filterObj.follStatus.push(code);
                        self.resetFilterSpan({type:'follStatus',name:name,code:code}, false);
                    }
                }
                $(this).find('.filterli').toggleClass('activeli');
                stopEventBubble(event);
            });
        },
        renderManager: function(){
            var managerObj = this.managerObj,
                htmlTpl = '',
                self = this;

            htmlTpl = '<ul class="ui-list ui-list-text ultwo selshow" id="renew_managerlevel" style="display: ' + (self.parttern == 'renew_managerlevel'?'block':'none') + '">';
            htmlTpl += '<li id="sel_all_level" class="ui-border-t"><p class="filterli">不限</p></li>';
            for(var key in managerObj) {
                htmlTpl += '<li data-name="'+ managerObj[key] +'" data-id="'+ key +'" class="ui-border-t">';
                if(OMS.filterObj.renew_managerlevel && OMS.filterObj.renew_managerlevel.toString().indexOf(key) > -1){
                    htmlTpl += '<p class="filterli activeli">'+managerObj[key]+'</p>';
                }else{
                    htmlTpl += '<p class="filterli">'+managerObj[key]+'</p>';
                }
                htmlTpl += '</li>';
            }
            htmlTpl += '</ul>';
            $('#select-filt .ui-col-67').append(htmlTpl);
            //绑定事件
            $('#renew_managerlevel li').on('click',function(event){
                if($(this).attr('id') == 'sel_all_level'){
                    if(!$(this).find('.filterli').hasClass('activeli')){
                        OMS.filterObj.renew_managerlevel = [];
                        $("#renew_managerlevel .activeli").removeClass('activeli');
                        $(".renew_managerlevel").remove();
                        self.initOmsTop();
                    }
                }
                else {
                    $("#sel_all_level .filterli").removeClass('activeli');
                    var name = $(this).data('name');
                    var code = $(this).data('id');
                    if(self.codeInSelected(code, 'renew_managerlevel')){
                        OMS.filterObj.renew_managerlevel.splice(OMS.filterObj.renew_managerlevel.indexOf(code), 1);
                        self.resetFilterSpan({type:'renew_managerlevel',name:name,code:code}, true);
                    }else{
                        OMS.filterObj.renew_managerlevel.push(code);
                        self.resetFilterSpan({type:'renew_managerlevel',name:name,code:code}, false);
                    }
                }
                $(this).find('.filterli').toggleClass('activeli');
                stopEventBubble(event);
            });
        },
        renderPerson: function(){
            var personObj = this.personObj,
                htmlTpl = '',
                self = this;

            htmlTpl = '<ul class="ui-list ui-list-text ultwo selshow" id="renew_mylevel" style="display: ' + (self.parttern == 'renew_mylevel'?'block':'none') + '">';
            htmlTpl += '<li id="sel_all_level" class="ui-border-t"><p class="filterli">不限</p></li>';
            for(var key in personObj) {
                htmlTpl += '<li data-name="'+ personObj[key] +'" data-id="'+ key +'" class="ui-border-t">';
                if(OMS.filterObj.renew_mylevel && OMS.filterObj.renew_mylevel.toString().indexOf(key) > -1){
                    htmlTpl += '<p class="filterli activeli">'+personObj[key]+'</p>';
                }else{
                    htmlTpl += '<p class="filterli">'+personObj[key]+'</p>';
                }
                htmlTpl += '</li>';
            }
            htmlTpl += '</ul>';
            $('#select-filt .ui-col-67').append(htmlTpl);
            //绑定事件
            $('#renew_mylevel li').on('click',function(event){
                if($(this).attr('id') == 'sel_all_level'){
                    if(!$(this).find('.filterli').hasClass('activeli')){
                        OMS.filterObj.renew_mylevel = [];
                        $("#renew_mylevel .activeli").removeClass('activeli');
                        $(".renew_mylevel").remove();
                        self.initOmsTop();
                    }
                }
                else {
                    $("#sel_all_level .filterli").removeClass('activeli');
                    var name = $(this).data('name');
                    var code = $(this).data('id');
                    if(self.codeInSelected(code, 'renew_mylevel')){
                        OMS.filterObj.renew_mylevel.splice(OMS.filterObj.renew_mylevel.indexOf(code), 1);
                        self.resetFilterSpan({type:'renew_mylevel',name:name,code:code}, true);
                    }else{
                        OMS.filterObj.renew_mylevel.push(code);
                        self.resetFilterSpan({type:'renew_mylevel',name:name,code:code}, false);
                    }
                }
                $(this).find('.filterli').toggleClass('activeli');
                stopEventBubble(event);
            });
        },
        renderTrade: function(){
            var tradeObj = this.tradeObj,
                htmlTpl = '',
                self = this;

            htmlTpl = '<ul class="ui-list ui-list-text ultwo selshow" id="trade" style="display: ' + (self.parttern == 'trade'?'block':'none') + '">';
            htmlTpl += '<li id="sel_all_level" class="ui-border-t"><p class="filterli">不限</p></li>';

            for(var key in tradeObj) {
                htmlTpl += '<li data-name="'+ tradeObj[key] +'" data-id="'+ key +'" class="ui-border-t">';
                if(OMS.filterObj.trade && OMS.filterObj.trade.toString().indexOf(key) > -1){
                    htmlTpl += '<p class="filterli activeli">'+tradeObj[key]+'</p></li>';
                }else{
                    htmlTpl += '<p class="filterli">'+tradeObj[key]+'</p></li>';
                }
            }
            htmlTpl += '</ul>';
            $('#select-filt .ui-col-67').append(htmlTpl);
            //绑定事件
            $('#trade li').on('click',function(event){
                if($(this).attr('id') == 'sel_all_level'){
                    if(!$(this).find('.filterli').hasClass('activeli')){
                        OMS.filterObj.trade = [];
                        $("#trade .activeli").removeClass('activeli');
                        $(".trade").remove();
                        self.initOmsTop();
                    }
                }
                else {
                    $("#sel_all_level .filterli").removeClass('activeli');
                    var name = $(this).data('name');
                    var code = $(this).data('id');
                    if(self.codeInSelected(code, 'trade')){
                        OMS.filterObj.trade.splice(OMS.filterObj.trade.indexOf(code), 1);
                        self.resetFilterSpan({type:'trade',name:name,code:code}, true);
                    }else{
                        OMS.filterObj.trade.push(code);
                        self.resetFilterSpan({type:'trade',name:name,code:code}, false);
                    }
                }
                $(this).find('.filterli').toggleClass('activeli');
                stopEventBubble(event);
            });
        },
        renderProduct: function () {
            var productObj = this.productObj,
                htmlTpl = '',
                self = this;

            htmlTpl = '<ul class="ui-list ui-list-text ultwo selshow" id="product_ver" style="display: ' + (self.parttern == 'product_ver'?'block':'none') + '">';
            htmlTpl += '<li id="sel_all_level" class="ui-border-t"><p class="filterli">不限</p></li>';

            for(var key in productObj) {
                htmlTpl += '<li data-name="'+ productObj[key] +'" data-id="'+ key +'" class="ui-border-t">';
                if(OMS.filterObj.product_ver && OMS.filterObj.product_ver.toString().indexOf(key) > -1){
                    htmlTpl += '<p class="filterli activeli">'+productObj[key]+'</p></li>';
                }else{
                    htmlTpl += '<p class="filterli">'+productObj[key]+'</p></li>';
                }
            }
            htmlTpl += '</ul>';
            $('#select-filt .ui-col-67').append(htmlTpl);
            //绑定事件
            $('#product_ver li').on('click',function(event){
                if($(this).attr('id') == 'sel_all_level'){
                    if(!$(this).find('.filterli').hasClass('activeli')){
                        OMS.filterObj.product_ver = [];
                        $("#product_ver .activeli").removeClass('activeli');
                        $(".product_ver").remove();
                        self.initOmsTop();
                    }
                }
                else {
                    $("#sel_all_level .filterli").removeClass('activeli');
                    var name = $(this).data('name');
                    var code = $(this).data('id');
                    if(self.codeInSelected(code, 'product_ver')){
                        OMS.filterObj.product_ver.splice(OMS.filterObj.product_ver.indexOf(code), 1);
                        self.resetFilterSpan({type:'product_ver',name:name,code:code}, true);
                    }else{
                        OMS.filterObj.product_ver.push(code);
                        self.resetFilterSpan({type:'product_ver',name:name,code:code}, false);
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
            // for(var code in dateObj) {
            //     htmlTpl += '<li data-name="'+ dateObj[code] +'" data-id="'+ code +'" class="ui-border-t">';
            //     htmlTpl += '<p class="filterli">'+dateObj[code]+'</p>';
            //     htmlTpl += '</li>';
            // }
            // htmlTpl += '<li id="nextStartTime" class="ui-form-item selectDate" style="display: none">开始时间</li>';
            // htmlTpl += '<li id="nextEndTime" class="ui-form-item selectDate" style="display: none">结束时间</li>';
            for(var code in dateObj) {
                htmlTpl += '<li data-name="'+ dateObj[code] +'" data-id="'+ code +'" class="ui-border-t">';
                htmlTpl += '<p style="padding-left:0">'+dateObj[code];
                htmlTpl += '<i id="' + code + '" class="ui-icon-list_calendar"></i>';
                htmlTpl += '</p></li>';
            }
            htmlTpl += '</ul>';
            $('#select-filt .ui-col-67').append(htmlTpl);

            //绑定事件
            $('#linkdate li').on('click',function(event){
                if($(this).data('id') == 'startDate') {
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
                                    self.resetFilterSpan({type:'linkdate',name:str,code:code},false);
                                else
                                    self.resetFilterSpan({type:'linkdate',name:str,code:code},true);
                            }
                        },
                        onFail : function() {}
                    });
                }
                else if($(this).data('id') == 'endDate') {
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
                                    self.resetFilterSpan({type:'linkdate',name:str,code:code},false);
                                else
                                    self.resetFilterSpan({type:'linkdate',name:str,code:code},true);
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
                $(this).find('.filterli').toggleClass('activeli');
                stopEventBubble(event);
            });
        },
        getAllUser: function(){
            // 续签leader 和业务员不一样的角色
            if(OMS.filterObj.isSub === 0)
                new home().getAssignUser(filter.checkOwnerObj);
            else
                new home().getSubordinate(filter.checkOwnerObj);
        },
        getAllArea: function(){
            new home().getAreas(this.checkAreaObj);
        },
        checkOwnerObj: function(data){
            // data = [
            //     {id: 1, realname: 'xuzhijun1'},
            //     {id: 2, realname: 'xuzhijun2'},
            // ];
            if(!filter.allUser) filter.allUser = data || [];
            var temp = {},
                ownerObj = filter.ownerObj,
                tempArr = [];
            for(var i in data ){
                temp[data[i].id] = true;
            }
            for(var j in ownerObj) {
                if(temp[ownerObj[j].id])
                    tempArr.push(ownerObj[j]);
            }
            filter.ownerObj = tempArr;
            localStorage.setItem(filter.key.staff, JSON.stringify(filter.ownerObj));
            filter.renderOwner();
            $('#select-filt').show();
            if(OMS.filterObj.isSub === 1)
                $('#ownerid').show();
        },
        checkAreaObj: function(data){
            if(!filter.allArea) filter.allArea = data || [];
            filter.getAreaGroup(filter.allArea);
            var temp = {},
                areaObj = filter.areaObj,
                tempArr = [];

            for(var i in data ){
                temp[data[i].region_id] = true;
            }
            for(var j in areaObj) {
                if(temp[areaObj[j].region_id])
                    tempArr.push(areaObj[j]);
            }
            filter.areaObj = tempArr;
            localStorage.setItem(filter.key.area, JSON.stringify(filter.areaObj));

            filter.renderArea();
            $('#select-filt').show();
        },
        renderAllUser: function(){
            var data = filter.allUser || [];
            var selectedSize = OMS.filterObj.ownerid.length;
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
            if(OMS.filterObj.ownerid.indexOf(parseInt(obj.id)) > -1)
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
            if(OMS.filterObj.ownerid.indexOf(parseInt(obj.id)) > -1)
                htmlTpl += "<span data-code='" + obj.id + "'>" + obj.realname + "</span>";
            return htmlTpl;
        },
        allUserEventListener: function(){
            var self = this;
            // $("#allSelectUser #all-list li").on('click',function(event){
            _bindEvent($("#allSelectUser #all-list li"), function(event){
                var code = $(this).data('code');
                var name = $(this).data('name');

                if(self.codeInSelected(code, 'ownerid')){
                    OMS.filterObj.ownerid.splice(OMS.filterObj.ownerid.indexOf(code), 1);
                    filter.resetFilterSpan({type:'ownerid',name:name,code:code}, true);

                    $(".selectUserUl div").find("[data-code='"+code+"']").remove();
                    $(".selectUserUl div").css({'width': OMS.filterObj.ownerid.length * 80 + 'px'});
                    if(OMS.filterObj.ownerid.length == 0) $(".selectUserUl div").html("<em>请选择员工</em>");
                }else{
                    if(OMS.filterObj.ownerid.length == 0) $(".selectUserUl div").html("");
                    OMS.filterObj.ownerid.push(code);
                    filter.resetFilterSpan({type:'ownerid',name:name,code:code}, false);
                    $(".selectUserUl div").append(self.renderSelectUserLi({realname:name, id:code}));
                    $(".selectUserUl div").css({'width': OMS.filterObj.ownerid.length * 80 + 'px'});
                }
                self.updateOwnerObj(name, code);
                $("#ownerid [data-id='"+code+"']").find('.filterli').toggleClass('activeli');

                $(this).find('.filterli').toggleClass('activeli');

                $("#allSelectUser .submitBtn").html("确定(" + OMS.filterObj.ownerid.length + ")")

                if(OMS.filterObj.ownerid.length === 0)
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
                $('#select-filt #ownerid').find('#search_user').after(htmlTpl);
                localStorage.setItem(this.key.staff, JSON.stringify(this.ownerObj.slice(0, 10)));
                //事件重绑
                $("#ownerid li[data-id='" + code + "']").on('click',function(event){
                    if($(this).attr('id') != 'search_user'){
                        var name = $(this).data('name');
                        var code = $(this).data('id');

                        if(filter.codeInSelected(code, 'ownerid')){
                            OMS.filterObj.ownerid.splice(OMS.filterObj.ownerid.indexOf(code), 1);
                            filter.resetFilterSpan({type:'ownerid',name:name,code:code}, true);
                        }else{
                            OMS.filterObj.ownerid.push(code);
                            filter.resetFilterSpan({type:'ownerid',name:name,code:code}, false);
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
                $('#allSelectUser .ui-searchbar-wrap').addClass('focus');
                $('#allSelectUser input').focus();
                event.stopPropagation();
            });

            $('#allSelectUser .ui-searchbar-cancel').on('click',function(event){
                $('#allSelectUser .ui-searchbar-wrap').removeClass('focus');
                $('#allSelectUser input').val('');
                self.getListLi('');
                event.stopPropagation();
            });

            $("#allSelectUser .ui-icon-close").on('click', function(){
                $('#allSelectUser input').val('');
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
            $("#allSelectUser #all-list").html(htmlTpl);
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
        getAreaGroup: function(data){
            var temp = [], tempObj = {};
            for(var i = 0, len = data.length; i < len; i++) {
                var code = data[i].py.charAt(0).toUpperCase();
                if(!tempObj[code]){
                    temp.push(code);
                    tempObj[code] = [];
                }
                tempObj[code].push(data[i]);
            }
            temp = temp.sort(function(a, b){
                return (a > b)?1 :((b > a)?-1:0);
            });
            filter.areaAnchor = temp;
            filter.areaGroup = tempObj;
        },
        renderAllArea: function(){
            var data = filter.allArea || [];
            filter.getAreaGroup(data);
            var selectedSize = OMS.filterObj.areaid.length;
            var htmlTpl = '<section class="ui-container" id="allSelectCity">'
            + '<div class="ui-searchbar-wrap ui-border-b" id="searchwrap">'
            + '<div class="ui-searchbar">'
            + '<i class="ui-icon-public_search"></i>'
            + '<div class="ui-searchbar-text">搜索</div>'
            + '<div class="ui-searchbar-input">'
            + '<input value="" type="text" placeholder="搜索" autocapitalize="off">'
            + '</div>'
            + '<i class="ui-icon-close"></i>'
            + '</div>'
            + '<button class="ui-searchbar-cancel">取消</button>'
            + '</div><div class="ui-scroller" id="all-list">'
            + '<ul class="ui-list ui-list-one ui-border-b">';

            //字母分组
            for(var i in filter.areaAnchor){
                htmlTpl += this.renderCityGroup(filter.areaAnchor[i]);
            }
            htmlTpl += '</ul></div><footer class="cityFooter">';
            //增加底部按钮，和统计信息
            htmlTpl += '<div class="selectCityUl"><div style="width:' + selectedSize * 80 + 'px">';
            if(selectedSize !== 0){
                for(var i in data){
                    htmlTpl += this.renderSelectCityLi(data[i]);
                }
            }
            else
                htmlTpl += '<em>请选择城市</em>'
            htmlTpl += '</div></div>';

            htmlTpl += '<div class="submitBtn"' + (!selectedSize?' style="background-color: #CCC"':'') + '>确定(' + selectedSize + ')</div>';
            htmlTpl += '</footer></section>';

            this.setAreaSearchApi();
            $("body").append(htmlTpl);
            filter.myScroll = new fz.Scroll('.ui-scroller', {
                scrollY: true,
                bounce: false
            });
            //右侧字母序列
            var anchorHtml = "<div id='anchor_bar' class='anchor_bar'><div class='letterContainer'><ul>";
            for(var i in filter.areaAnchor){
                anchorHtml += "<li data-code='#" + filter.areaAnchor[i] + "'>" + filter.areaAnchor[i] + "</li>";
            }
            anchorHtml += "</ul></div></div>";
            $("body").append(anchorHtml);

            this.allCityEventListener();
            this.searchAreaWrapListener();
        },
        renderCityGroup: function(code){
            var htmlTpl = "", group = filter.areaGroup[code];
            htmlTpl += "<div class='area-group ui-border-b' id='" + code + "'>" + code + "</div>";
            htmlTpl += "<ul>";
            for(var i in group) {
                htmlTpl += filter.renderCityLi(group[i]);
            }
            htmlTpl += "</ul>";

            return htmlTpl;
        },
        renderSelectCityLi: function(obj){
            var htmlTpl = "";
            if(OMS.filterObj.areaid.indexOf(parseInt(obj.region_id)) > -1)
                htmlTpl += "<span data-code='" + obj.region_id + "'>" + obj.region_name + "</span>";
            return htmlTpl;
        },
        renderCityLi: function(obj){
            var htmlTpl = '<li class="ui-border-b" data-code="' + obj.region_id + '" data-name="' + obj.region_name + '" data-py="' + obj.py + '">';
            htmlTpl += '<div class="ui-list-info">';
            htmlTpl += '<div class="filterli ';
            if(OMS.filterObj.areaid.indexOf(parseInt(obj.region_id)) > -1)
                htmlTpl += ' activeli';
            htmlTpl += '"></div><h4 class="ui-nowrap">'+obj.region_name+'</h4></div></li>';
            return htmlTpl;
        },
        allCityEventListener: function(){
            var self = this;
            // $("#allSelectCity #all-list li").on('click', function(event){
            _bindEvent($("#allSelectCity #all-list li"), function(event){
                var code = $(this).data('code');
                var name = $(this).data('name');
                var py = $(this).data('py');
                //数据双向绑定解除
                if(self.codeInSelected(code, 'areaid')){
                    OMS.filterObj.areaid.splice(OMS.filterObj.areaid.indexOf(code), 1);
                    filter.resetFilterSpan({type:'areaid',name:name,code:code}, true);

                    $(".selectCityUl div").find("[data-code='"+code+"']").remove();
                    $(".selectCityUl div").css({'width': OMS.filterObj.areaid.length * 80 + 'px'});

                    if(OMS.filterObj.areaid.length == 0) $(".selectCityUl div").html("<em>请选择城市</em>");
                }else{
                    if(OMS.filterObj.areaid.length == 0) $(".selectCityUl div").html("");
                    OMS.filterObj.areaid.push(code);
                    filter.resetFilterSpan({type:'areaid',name:name,code:code}, false);

                    $(".selectCityUl div").append(self.renderSelectCityLi({region_name:name, region_id:code, py: py}));
                    $(".selectCityUl div").css({'width': OMS.filterObj.areaid.length * 80 + 'px'});
                }
                self.updateAreaObj(name, code);
                $("#areaid [data-id='"+code+"']").find('.filterli').toggleClass('activeli');
                $(this).find('.filterli').toggleClass('activeli');

                $("#allSelectCity .submitBtn").html("确定(" + OMS.filterObj.areaid.length + ")")
                if(OMS.filterObj.areaid.length === 0)
                    $("#allSelectCity .submitBtn").attr("style", "background-color: #CCC");
                else
                    $("#allSelectCity .submitBtn").attr("style", "");
                event.stopPropagation();
            });
            $("#anchor_bar li").on('click', function(){
                var code = $(this).data('code');
                filter.myScroll.scrollToElement($('#allSelectCity #all-list').find(code)[0], 0);
            });
        },
        updateAreaObj: function(name, code){
            var area = {},
                isExists = false,
                htmlTpl = '';
            area.region_id = code;
            area.region_name = name;
            // area.region_py = py;
            for(var i in this.areaObj){
                if(this.areaObj[i].region_id == code)
                    isExists = true;
            }
            if(!isExists){
                this.areaObj.unshift(area);
                htmlTpl = '<li data-name="'+ name +'" data-id="' + code + '" class="ui-border-t">';
                htmlTpl += '<p class="filterli">' + name + '</p>';
                htmlTpl += '</li>';
                $('#select-filt #areaid').find('#search_city').after(htmlTpl);

                localStorage.setItem(this.key.area, JSON.stringify(this.areaObj.slice(0, 10)));
                //事件重绑
                $("#areaid li[data-id='" + code + "']").on('click',function(event){
                    if($(this).attr('id') != 'search_city'){
                        var name = $(this).data('name');
                        var code = $(this).data('id');
                        // alert(filter.codeInSelected(code, 'areaid'));
                        if(filter.codeInSelected(code, 'areaid')){
                            OMS.filterObj.areaid.splice(OMS.filterObj.areaid.indexOf(code), 1);
                            filter.resetFilterSpan({type:'areaid',name:name,code:code}, true);
                        }else{
                            OMS.filterObj.areaid.push(code);
                            filter.resetFilterSpan({type:'areaid',name:name,code:code}, false);
                        }
                        $(this).find('.filterli').toggleClass('activeli');
                    }
                    else
                        filter.renderAllArea();
                    stopEventBubble(event);
                });
            }
        },
        searchAreaWrapListener: function(){
            var self = this;
            $('#allSelectCity .submitBtn').on('click', function(){
                $("#allSelectCity").remove();
                $("#anchor_bar").remove();
                OMS.initTitleBar();
                OMS.initLeftBar();
            });

            $('#allSelectCity input').on('input onpaste',function() {
                var key = $.trim($(this).val());
                self.getAreaListLi(key);
            });

            $('#allSelectCity .ui-searchbar').on('click',function(event){
                $('#allSelectCity .ui-searchbar-wrap').addClass('focus');
                $('#allSelectCity input').focus();
                event.stopPropagation();
            });

            $('#allSelectCity .ui-searchbar-cancel').on('click',function(event){
                $('#allSelectCity .ui-searchbar-wrap').removeClass('focus');
                $('#allSelectCity input').val('');
                self.getAreaListLi('');
                event.stopPropagation();
            });

            $("#allSelectCity .ui-icon-close").on('click',function(event){
                $('#allSelectCity input').val('');
                self.getAreaListLi('');
            });
        },
        getAreaListLi: function(key){
            var htmlTpl = "", self = this, temp = [];
            var data = self.allArea;
            for(var i in data){
                if(key == '' || JSON.stringify(data[i]).indexOf(key) > -1)
                    temp.push(data[i]);
            }
            filter.getAreaGroup(temp);
            for(var i in filter.areaAnchor){
                htmlTpl += this.renderCityGroup(filter.areaAnchor[i]);
            }
            $("#allSelectCity #all-list ul").html(htmlTpl);

            var anchorHtml = "";
            for(var i in filter.areaAnchor){
                anchorHtml += "<li data-code='#" + filter.areaAnchor[i] + "'>" + filter.areaAnchor[i] + "</li>";
            }
            $("#anchor_bar ul").html(anchorHtml);
            filter.myScroll = new fz.Scroll('.ui-scroller', {
                scrollY: true,
                bounce: false
            });
            this.allCityEventListener();
        },
        setAreaSearchApi: function(){
            dd.ready(function(){
                dd.biz.navigation.setTitle({
                    title: '选择城市',
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
                            $("#allSelectCity").remove();
                            $("#anchor_bar").remove();
                            OMS.initTitleBar();
                            OMS.initLeftBar();
                        },
                        onFail : function(err) {}
                    });
                }else{
                    $(document).off('backbutton');
                    $(document).on('backbutton', function(e) {
                        $("#allSelectCity").remove();
                        $("#anchor_bar").remove();
                        OMS.initTitleBar();
                        OMS.initLeftBar();
                        e.preventDefault();
                    });
                }
            });
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
            this.key = "oms_renewal_search_history";
            var history = localStorage.getItem(this.key);
            this.history = history?JSON.parse(history):[];
        },
        initEvent: function(){
            var self = this;
            $("#seac-tap").click(function(){
                $('#select-filt').hide();
                $('#select-sort').hide();
                self.renderCustomer();
            });
        },
        renderCustomer: function(){
            var htmlTpl = '<section class="ui-container" id="allSelectCus">' +
            '<div class="ui-searchbar-wrap" id="searchwrap">' +
                '<div class="ui-searchbar">' +
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
            htmlTpl += '<ul class="ui-list ui-list-text ui-border-b ui-list-active" id="search-list"></ul>';
            htmlTpl += '</section>';
            htmlTpl += '</div>';

            //历史记录
            htmlTpl += '<div id="search-history"' + (this.history.length?'':' style="display: none"') + '>';
            htmlTpl += '<div id="search-history-title" class="ui-border-b">搜索历史</div>';
            htmlTpl += '<div id="history-wrapper"><section class="scroller">';
            htmlTpl += '<ul class="ui-list ui-list-text ui-border-b ui-list-active" id="history-list">';
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
        openSearch: function () {
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

            var sendObj = {};
            sendObj.callback = this.renderSearch;
            sendObj.data = this.initFilter(cusName);
            sendObj.isSearch = true;
            search.sendAjax(sendObj);
        },
        initFilter: function(cusName){
            this.filterObj = {};
            // this.filterObj.cusName = cusName;
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
            if(!$("#search-list")) return;
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
                // $("#search-list").append('<li class="noMore ui-border-t" style="text-align:center;"><div style="width:100%;"><p>未找到您查询的客户</p></div></li>');
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
        if(OMS.filterObj.isSub === 0 && OMS.isLeader)
            openLink(oms_config.baseUrl + "customerInfo.html?code=" + code + "&from=private&jumpType=close&leaderPriv=1", true);
        else
            openLink(oms_config.baseUrl + "customerInfo.html?code=" + code + "&from=private&jumpType=close", true);
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
    var sendQuest = function(config){
        var apiUrl = oms_config.apiUrl + oms_apiList[config.api];
        var sendData = config.data || {};
        sendData.omsuid = OMS.user.id;
        sendData.token = OMS.user.token;
        var request = $.ajax({
            url: apiUrl,
            type: config.type,
            // data: config.isString?JSON.stringify(sendData):sendData,
            data: sendData,
            cache: false,
            // contentType: "application/json",
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
    var home = function(){};
    home.prototype.getCustomers = function(obj){
        var config = {};
        config.api = 'getCustomers';
        config.type = 'post';

        config.data = obj.data;
        config.callback = obj.callback;
        if(obj.isSearch)
            config.isSearch = true;
        if(obj.isLoadCus)
            config.isLoadCus = true;
        config.error = function(msg){
            if($("#msg").css("display") == "block")
                $("#msg").html(msg);
        };
        sendQuest(config);
    };
    home.prototype.getSubordinate = function(callback){
        var config = {};
        config.api = 'getSubordinate';
        config.type = 'post';
        config.callback = callback;
        sendQuest(config);
    };
    home.prototype.getAssignUser = function(callback){
        var config = {};
        config.api = 'getAssignUser';
        config.type = 'post';
        config.callback = callback;
        sendQuest(config);
    };
    home.prototype.getAreas = function(callback){
        var config = {};
        config.api = 'getAreas';
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
