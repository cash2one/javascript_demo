$(function(){
    FastClick.attach(document.body);
    //顶部导航
    var OMS = {
        user: {},
        init: function(){
            $("#msg").show();
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

            this.filterObj.areaid = [];
            this.filterObj.trade = [];
            this.filterObj.throw_reason = [];
            this.filterObj.linkstatus = [];
            this.filterObj.managerlevel = [];
            this.filterObj.mylevel = [];
            this.filterObj.page = 1; //起始页码

            this.filterObj.type = 1; //公海
            this.filterObj.orderType = 10; //客户流入时间
            /****初始化接口参数 END****/

            /****初始化排序列表 start****/
            this.sortList = {
                3: "流入时间",
                10: "智能推荐排序"
            };
            /****初始化排序列表 end****/

            this.pageSize = 20;
            this.lastSize = 0;

            var keyList = ["oms.public.id", "oms.stick.id", "oms.unstick.id"];
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
                            if (key == "oms.public.id") {
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
            //ios无效
            // ddbanner.getLocation(function(result){
            //     if(result && result.city){
            //         filter.defCity = result.city;
            //     }
            // });
        },
        getData: function(){
            $("#msg").html("正在加载中...");
            $("#msg").show();
            if(OMS.myScroll){
                OMS.myScroll.destroy();
                OMS.myScroll = null;
                $("#wrapper").find("#pullDown").remove();
                $("#wrapper").find("#pullUp").remove();
            }
            OMS.refreshData();
        },
        refreshData: function(){
            var sendObj = {};
            if(OMS.myScroll)
                $("#wrapper").find("#pullUp").hide();

            OMS.filterObj.page = 1;
            sendObj.data = OMS.filterObj;
            sendObj.callback = OMS.renderCusList;

            OMS.data = [];
            $("#cuslist").html("");
            $(".backtotop").hide();

            new home().getCustomers(sendObj);
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
        renderCusList: function(data){
            if(OMS.data && OMS.data.length > 0)
                OMS.data = OMS.data.concat(data);
            else
                OMS.data = data;

            if(!OMS.data || OMS.data.length === 0){
                //验证筛选filterObj是否为空
                if(!filter.countSize())
                    $("#msg").html("暂无客户");
                else
                    $("#msg").html("没有找到相关客户");
                $("#msg").show();
            }
            else {
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
                linkStatusObj = filter.linkStatusObj,
                throwObj = filter.throwObj;

            for(var i = 0, len = data.length; i < len; i++){
                htmlTpl += '<li data-code="' + data[i].id + '" class="ui-border-t">';
                htmlTpl += '<div class="ui-list-info">';
                htmlTpl += '<h4 class="ui-nowrap itemtoggle">' + data[i].cusname;
                if(this.filterObj.orderType == 10){
                    if(data[i].score_trend == 1){
                        htmlTpl+= '<span style="display:none" class=\"predict_increase\"></span>';
                    }
                    else{
                        htmlTpl+= '<span style="display:none" class=\"predict_decrease\"></span>';
                    }
                }

                htmlTpl += '</h4><p class="itemtoggle">';
                htmlTpl += '<span>' + (linkStatusObj[data[i].linkcase] || '未联系') + '&nbsp;</span>|';
                htmlTpl += '<span>&nbsp;' + (data[i].managerlevel=='无'?'-':data[i].managerlevel) + '级&nbsp;</span>';
                htmlTpl += '</p>';
                htmlTpl += '<p class="itemtoggle">' + (throwObj[data[i].throw_reason]||'无原因') + '</p>';
                htmlTpl +='</div></li>';
            }
            return htmlTpl;
        },
        renderSort: function(){
            var htmlTpl = '',
                defaultCode = this.filterObj.orderType,
                self = this;

            htmlTpl = '<li class="ui-border-t activeTab" data-code="' + defaultCode + '">'+
                '<p class="sort_order">' +
                    '<span>自动排序－' + self.sortList[defaultCode] + '</span>' +
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
        initTitleBar: function(){
            ddbanner.changeBannerTitle('公海');
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
            this.parttern = "areaid";
            this.mapping = {
                "areaid": "所在地",
                "trade": "行业类型",
                "linkstatus": "联系情况",
                "throw_reason": "扔掉原因",
                "managerlevel": "经理评级",
                "mylevel": "个人评级"
            };
            //初始化所在地
            this.key = "filter_customer_area";
            // localStorage.removeItem(this.key);
            var area = localStorage.getItem(this.key);
            if(area)
                this.areaObj = JSON.parse(area) || [];
            else
                this.areaObj = [];
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
            this.linkStatusObj = {
                0: '未联系',
                53: '联系中',
                54: '绕到负责人',
                55: '约到负责人',
                56: '已经使用',
                220: '联系负责人中'
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
            this.throwObj = {
                '1': '客户不存在/名称错误',
                '2': '绕不到电话/联系不上',
                '3': '客户强烈不需要',
                '4': '已使用别家产品',
                '5': '已使用本公司产品'
            };
        },
        initEvent: function(){
            var self = this;
            $("#filt-tap").click(function(){
                $(this).siblings('.activeTab').removeClass('activeTab');
                $(this).toggleClass('activeTab');

                if(document.getElementById('select-filt').style.display == 'none'){
                    $('.select-date').hide();
                    if(!self.allArea)
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
                //筛选－>refresh
                OMS.getData();
                stopEventBubble(event);
            });
            //重置表单事件
            $("#resetBtn").on('click',function(event){
                self.clearOMS();
                $("#FilterUl").html('');
                $(".activeli").removeClass('activeli');
                $(".activeli-radio").removeClass('activeli-radio');
                $("#selectDate").hide();
                self.initOmsTop();
                stopEventBubble(event);
            });
        },
        initLeftFilter: function(){
            var el = $('#select-filt .ui-col-33 .ultwo'),
                htmlTpl = '',
                self = this;
            for(var code in self.mapping) {
                if( code == self.parttern)
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
                $("#" + self.parttern).show();
                stopEventBubble(event);
            });
        },
        initRightFilter: function(){
            this.renderArea();
            this.renderTrade();
            this.renderLink();
            this.renderThrow();
            this.renderManager();
            this.renderPerson();
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
        countSize: function(){
            var size = 0;
            for(var key in this.mapping) {
                var item = OMS.filterObj[key];
                if(item && item.length > 0) size++;
            }
            return size++;
        },
        clearOMS: function(){
            for(var key in this.mapping) {
                if(OMS.filterObj[key]){
                    OMS.filterObj[key] = [];
                }
            }
            OMS.filterObj.nextStartTime = '';
            OMS.filterObj.nextEndTime = '';
            // console.log(OMS.filterObj);
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
        renderManager: function(){
            var managerObj = this.managerObj,
                htmlTpl = '',
                self = this;

            htmlTpl = '<ul class="ui-list ui-list-text ultwo selshow" id="managerlevel" style="display: ' + (self.parttern == 'managerlevel'?'block':'none') + '">';
            htmlTpl +='<li id="sel_all_level" class="ui-border-t"><p class="filterli">不限</p></li>';
            for(var key in managerObj) {
                htmlTpl += '<li data-name="'+ managerObj[key] +'" data-id="'+ key +'" class="ui-border-t">';
                if(OMS.filterObj.managerlevel && OMS.filterObj.managerlevel.toString().indexOf(key) > -1){
                    htmlTpl += '<p class="filterli activeli">'+managerObj[key]+'</p></li>';
                }else{
                    htmlTpl += '<p class="filterli">'+managerObj[key]+'</p></li>';
                }
            }
            htmlTpl += '</ul>';
            $('#select-filt .ui-col-67').append(htmlTpl);
            //绑定事件
            $('#managerlevel li').on('click',function(event){
                if($(this).attr('id') == 'sel_all_level'){
                    if(!$(this).find('.filterli').hasClass('activeli')){
                        OMS.filterObj.managerlevel = [];
                        $("#managerlevel .activeli").removeClass('activeli');
                        $(".managerlevel").remove();
                        self.initOmsTop();
                    }
                }
                else {
                    $("#sel_all_level .filterli").removeClass('activeli');
                    var name = $(this).data('name');
                    var code = $(this).data('id');
                    if(self.codeInSelected(code, 'managerlevel')){
                        OMS.filterObj.managerlevel.splice(OMS.filterObj.managerlevel.indexOf(code), 1);
                        self.resetFilterSpan({type:'managerlevel',name:name,code:code}, true);
                    }else{
                        OMS.filterObj.managerlevel.push(code);
                        self.resetFilterSpan({type:'managerlevel',name:name,code:code}, false);
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
                    htmlTpl += '<p class="filterli activeli">'+linkStatusObj[key]+'</p></li>';
                }else{
                    htmlTpl += '<p class="filterli">'+linkStatusObj[key]+'</p></li>';
                }
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
        renderThrow: function(){
            var throwObj = this.throwObj,
                htmlTpl = '',
                self = this;

            htmlTpl = '<ul class="ui-list ui-list-text ultwo selshow" id="throw_reason" style="display: ' + (self.parttern == 'throw_reason'?'block':'none') + '"><li id="sel_all_level" class="ui-border-t"><p class="filterli">不限</p></li>';
            for(var key in throwObj) {
                htmlTpl += '<li data-name="'+ throwObj[key] +'" data-id="'+ key +'" class="ui-border-t">';
                if(OMS.filterObj.throw_reason && OMS.filterObj.throw_reason.toString().indexOf(key) > -1){
                    htmlTpl += '<p class="filterli activeli">'+throwObj[key]+'</p></li>';
                }else{
                    htmlTpl += '<p class="filterli">'+throwObj[key]+'</p></li>';
                }
            }
            htmlTpl += '</ul>';
            $('#select-filt .ui-col-67').append(htmlTpl);
            //绑定事件
            $('#throw_reason li').on('click',function(event){
                if($(this).attr('id') == 'sel_all_level'){
                    if(!$(this).find('.filterli').hasClass('activeli')){
                        OMS.filterObj.throw_reason = [];
                        $("#throw_reason .activeli").removeClass('activeli');
                        $(".throw_reason").remove();
                        self.initOmsTop();
                    }
                }
                else {
                    $("#sel_all_level .filterli").removeClass('activeli');
                    var name = $(this).data('name');
                    var code = $(this).data('id');
                    if(self.codeInSelected(code, 'throw_reason')){
                        OMS.filterObj.throw_reason.splice(OMS.filterObj.throw_reason.indexOf(code), 1);
                        self.resetFilterSpan({type:'throw_reason',name:name,code:code}, true);
                    }else{
                        OMS.filterObj.throw_reason.push(code);
                        self.resetFilterSpan({type:'throw_reason',name:name,code:code}, false);
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

            this.setSearchApi();
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
            this.searchWrapListener();
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
            // $("#all-list li").on('click', function(event){
            _bindEvent($("#all-list li"), function(event){
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
                filter.myScroll.scrollToElement($('#all-list').find(code)[0], 0);
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

                localStorage.setItem(this.key, JSON.stringify(this.areaObj.slice(0, 10)));
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
        searchWrapListener: function(){
            var self = this;
            $('#allSelectCity .submitBtn').on('click', function(){
                $("#allSelectCity").remove();
                $("#anchor_bar").remove();
                // $("#areaTop")
                OMS.initTitleBar();
                OMS.initLeftBar();
            });

            $('#allSelectCity input').on('input onpaste',function() {
                var key = $.trim($(this).val());
                self.getListLi(key);
            });

            $('#allSelectCity .ui-searchbar').on('click',function(event){
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

            $(".ui-icon-close").on('click',function(event){
                $('.ui-searchbar-input input').val('');
                self.getListLi('');
            });
        },
        getListLi: function(key){
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
            $("#all-list ul").html(htmlTpl);

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
        setSearchApi: function(){
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
        },
        getAllArea: function(){
            new home().getAreas(this.checkAreaObj);
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
            localStorage.setItem(filter.key, JSON.stringify(filter.areaObj));

            filter.renderArea();
            $('#select-filt').show();
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
            this.key = "oms_public_search_history";
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

            this.filterObj.type = OMS.filterObj.type;
            this.pageSize = 20;
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
                //恭喜你，做第一个吃螃蟹的人
                $("#search-msg").hide();
                var msgHtml = "<li class='isNullCustomer'><div class='ui-list-info'>" +
                        "<p>恭喜你，做第一个吃螃蟹的人</p>" +
                        "<div id='newAddCustomer'>立即添加</div>" +
                    "</div></li>";
                $("#search-list").append(msgHtml);
                _bindEvent($("#search-list #newAddCustomer"), function(){
                    openLink(oms_config.baseUrl + "customerAdd.html?code=new&name=" + search.filterObj.customer_info);
                });

                // $("#search-msg").html("未找到您查询的客户");
                // $("#search-msg").show();
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
                    if(!$(this).hasClass("noMore"))
                        openCustomerInfo($(this).data("code"));
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
        // openLink("customerInfo.html?code=" + code + "&from=public");
        openLink(oms_config.baseUrl + "customerInfo.html?code=" + code + "&from=public&jumpType=close", true);
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
                else {
                    new home().error("服务异常");
                }
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
        var config = {};
        config.api = 'getCustomers';
        config.type = 'post';

        config.data = obj.data;
        config.callback = obj.callback;
        if(obj.isSearch)
            config.isSearch = true;
        config.error = function(msg){
            if($("#msg").css("display") == "block")
                $("#msg").html(msg);
        };
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
