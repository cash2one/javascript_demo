$(function(){
    FastClick.attach(document.body);

    var OMS = {
        role: null,
        init: function(){
            this.home = new home();
            //1.Verify the validity of the phone
            if (OMS.user.isAlert && +OMS.user.isAlert === 1)
                this.toAccount();
            else
                this.toHome();
        },
        toAccount: function () {
            this.initTitleBar('帐户安全');
            this.initLeftBar();
            $('.page-parttern').hide();
            var telPhone = /^1\d{10}$/.test(OMS.user.telephone) ? OMS.user.telephone : '';
            var htmlTpl = '<div class="account">' +
                '<div class="title">绑定手机</div>' +
                '<div class="verPhone">' +
                    '<input type="tel" name="tel" placeholder="请输入手机号码" value="' + telPhone + '" />' +
                '</div>' +
                '<div class="verCode">' +
                    '<input type="tel" name="code" placeholder="请输入验证码" value="" />' +
                    '<span class="getverCode ' + (telPhone?'codeMessage':'') + '">获取验证码</span>' +
                '</div>' +
                '<div class="updateTel">提交</div>' +
            '</div>';
            $('body').append(htmlTpl);
            this.bindAcount();
        },
        bindAcount: function() {
            var self = this;
            touchSlide($('.getverCode'), null, null, function() {
                $('input').blur();
                if(!$(this).hasClass('codeMessage')) return;

                var tel = $.trim($('[name="tel"]').val());
                if (self.verTelPhone(tel) && !self.isCounting)
                    self.home.getverCode(tel);
            });
            touchSlide($('.updateTel'), null, null, function() {
                $('input').blur();
                if(!$(this).hasClass('codeMessage')) return;

                var tel = $.trim($('[name="tel"]').val()),
                    code = $.trim($('[name="code"]').val());
                if (self.verTelPhone(tel) && self.verCode(code))
                    self.home.updateTel(tel, code);
            });
            $('[name="tel"]').on('input', function() {
                self.updateBtnStatus();
            });
            $('[name="code"]').on('input', function() {
                self.updateBtnStatus();
            });
        },
        updateBtnStatus: function() {
            var tel = $.trim($('[name="tel"]').val()),
                code = $.trim($('[name="code"]').val());
            if (/^1\d{10}$/.test(tel)) {
                $('.getverCode').addClass('codeMessage');
                if(code && code.length > 0)
                    $('.updateTel').addClass('codeMessage');
                else
                    $('.updateTel').removeClass('codeMessage');
            }
            else {
                $('.getverCode').removeClass('codeMessage');
                $('.updateTel').removeClass('codeMessage');
            }
        },
        verTelPhone: function(tel) {
            var reg = /^1\d{10}$/;
            if (!tel || !tel.length ) {
                this.home.error('请输入手机号码');
                return false;
            }
            else if (!reg.test(tel)) {
                this.home.error('请输入有效的手机号码');
                return false;
            }
            return true;
        },
        verCode: function (code) {
            if (!code || !code.length ) {
                this.home.error('请输入验证码');
                return false;
            }
            return true;
        },
        countDown: function () {
            var startTime = 60;
            OMS.isCounting = true;
            //显示倒计时
            $('.getverCode').html('60s');
            var countTime = setInterval(function(){
                if(startTime > 1){
                    startTime--;
                    $('.getverCode').html(startTime + 's');
                }
                else{
                    clearInterval(countTime);
                    OMS.isCounting = false;
                    $('.getverCode').html('获取验证码');
                }
            }, 1000);
        },
        toHome: function () {
            this.initTitleBar();
            this.initLeftBar();
            this.initRightBar();
            this.initResumeEvent();
            $('.page-parttern').show();
            //Verify the version
            // this.verUpdate();
            //update localStorage
            this.initEnv();
            //update user role
            this.role = this.user.role;
            // OMS.render();
            // OMS.render();
            this.home.checkState();
        },
        initLogo:function(){
            var hl = $(window).height()-$(".logo-part").offset().top;
            var h = $(".logo-part").height();
            if(hl-h>20){
                $(".logo-part").css("margin-top", (hl-h)+"px");
            }
        },
        verUpdate: function () {
            //add by lipengfei at 2016/9/28
            //dist version check, --暂时先增加到这里
            var distverreg = /\/dist\/([\.\d]+)\//, // match /dist/1.0.1/
                url = window.location.href,
                currver = url.match(distverreg) ? url.match(distverreg)[1] : null,
                nextver;
            if (!currver) return;
            $.ajax({
                url: oms_config.versionUrl,
                cache: false
            }).then(function(text, status, xhr) {
                nextver = $.trim(xhr.responseText);
                if (nextver.length && /^[\.\d]+$/.test(nextver) && currver != nextver) {
                    //distrewrite
                    url = url.replace(/([\?&])r=[^&]+/, '')
                             .concat('&r='+Math.random())
                             .replace(/[\?&]/, '?'); //replace random number;
                    url = url.replace(distverreg, '/dist/'+nextver+'/'); //replace dist/version
                    window.location.replace(url);
                }
            });
            //add end

            //暂时不跳出弹窗
            return;
            delCookie('firstEnter');
            delCookie('firstEnter_v2');
            delCookie('firstEnter_v3');
            delCookie('firstEnter_v4');
            delCookie('firstEnter_v5');
            delCookie('firstEnter_v6');
			//setCookie('firstEnter_v7',1);
            if (!getCookie('firstEnter_v7')) {
                var htmlTpl =
                 '<div class="ui-dialog" style="display: block">' +
                	'<div class="ui-dialog-cnt">' +
                		'<header class="ui-dialog-hd ui-border-b">' +
                			'<i class="ui-dialog-close" data-role="button"></i>' +
                		'</header>' +
                		'<div class="ui-dialog-bd">' +
                            '<h4>' +
                                '<p>本次更新<span> v5.1.5</span></p>' +
                            '</h4>' +
                            '<ul>' +
                                '<li>' +
                                    '<span>1.分析界面增加理单率报表（战区Leader及以上可见）。</span>' +
                                '</li>' +
                                '<li>' +
                                    '<span>2.分析界面增加陪访量报表（战区Leader及以上可见）。</span>' +
                                '</li>' +
                                '<li>' +
                                    '<span>3.分析界面增加灭零率报表（战区Leader及以上可见）。</span>' +
                                '</li>' +
                                //'<li>' +
                                  //  '<span>3.电话记录增加会议邀请。</span>' +
                                //'</li>' +
                                //'<li>' +
                                 //   '<span>4.［PC端］对模糊搜索进行了优化。</span>' +
                                //'</li>' +
                                //'<li>' +
                                  //  '<span>5.［PC端］同步增加了私海客户标星置顶功能。</span>' +
                                //'</li>' +
                            '</ul>' +
                            '<div class="dialog-more-info">更多内容，请查看微信公众号“超越客户预期”</div>' +
                		'</div>' +
                	'</div>' +
                '</div>';
                $("body").append(htmlTpl);
                $(".ui-dialog-close").on("touchend",function(e){
                    $('.ui-dialog').remove();
                    setCookie('firstEnter_v7', 1);
                });
                $(".ui-dialog").on("touchstart", function(e){
                    e.preventDefault();
                });
            }else if(!getCookie('firstEnter_v61') && false){
                var htmlTpl =
                 '<div class="ui-dialog pop" style="display: block">' +
                    '<div class="pop-container">' +
                        '<div class="pop-div">' +
                            '<img src="img/frontPagePop.png" width="100%">' +
                            '<p class="pop-text">7月12日内部首发，敬请关注微信公众号<br>超越客户预期获取下载方式</p>' +
                            '<div class="pop-close"></div>'+
                        '</div>'+
                    '</div>' +
                    '<div class="pop-bg"></div>'+
                '</div>';
                $("body").append(htmlTpl);
                $(".pop-container").css("margin-top", "-"+parseInt(($(window).width()*740*0.9)/580)/2+"px");
                $(".pop-close").on("touchend",function(e){
                    $('.ui-dialog').remove();
                    setCookie('firstEnter_v61', 1);
                });
                $(".ui-dialog").on("touchstart", function(e){
                    e.preventDefault();
                });
            }
            else {
                $('.ui-dialog').remove();
            }
        },
        initEnv: function () {
            var key = "hecom.omsuid",
                uid = +localStorage.getItem(key);
            if(uid !== +this.user.id) localStorage.clear();
            localStorage.setItem(key, this.user.id);
        },
        checkState: function(response){
            if(!response || response.res === 0 || isNullObject(response.data))
                OMS.home.checkTrainState();
            else
                openLink('doVisitClose.html?visitId=' + response.data.id);
        },
        checkTrainState: function(response){
            if(!response || response.res === 0 || isNullObject(response.data))
                OMS.render();
            else
                openLink('doVisitClose.html?trainId=' + response.data.id + '&train=1');
        },
        render: function(){
            this.renderPage();
            //挂起轮询
            this.renderPoll();
        },
        renderPage: function(){
            this.renderUpper();
            this.renderMiddle();
            this.renderLower();
            this.initLogo();
        },
        renderUpper: function(){
            OMS.setUpperHtml();
            OMS.getUpperData();
        },
        setUpperHtml: function(){
            OMS.slideSize = 5;
            OMS.slideFlag = true;

            $(".upper-part-swipe li").addClass("trans");
            $(".upper-part-swipe").on('webkitTransitionEnd', function(){
                OMS.slideFlag = true;
                if($(".active").index() === 1){
                    $(".upper-part-swipe").removeClass("trans");
                    $(".upper-part-swipe>li").removeClass("trans");
                    $(".upper-part-swipe>li").eq(5).addClass("left");
                    $(".upper-part-swipe>li").eq(6).addClass("active");
                    $(".upper-part-swipe>li").eq(7).addClass("right");
                    $(".upper-part-swipe").css("-webkit-transform","translateX(-82.56rem)");
                    $(".upper-part-swipe>li").eq(0).removeClass("left");
                    $(".upper-part-swipe>li").eq(1).removeClass("active");
                    $(".upper-part-swipe>li").eq(2).removeClass("right");
                }else if($(".active").index() === 7){
                    $(".upper-part-swipe").removeClass("trans");
                    $(".upper-part-swipe>li").removeClass("trans");
                    $(".upper-part-swipe>li").eq(1).addClass("left");
                    $(".upper-part-swipe>li").eq(2).addClass("active");
                    $(".upper-part-swipe>li").eq(3).addClass("right");
                    $(".upper-part-swipe").css("-webkit-transform","translateX(-27.52rem)");
                    $(".upper-part-swipe>li").eq(6).removeClass("left");
                    $(".upper-part-swipe>li").eq(7).removeClass("active");
                    $(".upper-part-swipe>li").eq(8).removeClass("right");
                }
            });
            touchSlide($('.upper-part-swipe'),
                function(e){ upperSwipe("right"); },
                function(e){ upperSwipe("left"); }
            );
        },
        getUpperData: function(){
            OMS.home.getHomePageData();
        },
        renderPoll: function() {
            var refreshTime = 900000, self = this;
            var poll = setInterval(function(){
                self.getUpperData();
            },refreshTime);
        },
        isLeader: function() {
            return true;
            var leader = [7];
            if(leader.indexOf(OMS.role) > -1)
                return true;
            return false;
        },
        renderPerformance: function(resData){
            var initData = {
                isLeader: OMS.isLeader(),
                complete: 0,
                target: 0,
                salesComplete: 0,
                salesTarget: 0,
                privateTeachComplete: 0,
                privateTeachTarget: 0
            };
            var data = {};
            if(resData&&resData != undefined)
                data = OMS.performance = resData;
            else
                data = OMS.performance || {};

            data=$.extend(initData,data);

            var tpl=$('#slide-latest-perfomance').html();
            var result=juicer(tpl,data); //将数据传入此模板
            $('.latest-perfomance div').html(result);

            var className = $(".active .slide").attr("class").split("slide ")[1];
            $(".isSlided").addClass(className);

            if(data.isLeader) {
                $('.latest-perfomance').attr('data-src', 'teamMonthTarget.html');
            }
        },
        autoSlide: function(isStop) {
            var slideTime = 3000;
            if(this.isSliding) clearInterval(this.isSliding);
            if(!isStop) {
                this.isSliding = setInterval(function(){
                    upperSwipe("right");
                }, slideTime);
            }
        },
        renderPerformanceCompare: function(resData){
            var initData = {
                isLeader: OMS.isLeader(),
                last_month: 0,
                this_month: 0,
                best_month: 0
            };
            var data = {};
            if(resData&&resData != undefined)
                data = OMS.performanceCompare = resData;
            else
                data = OMS.performanceCompare || {};

            data=$.extend(initData,data);

            var tpl=$('#slide-compare-perfomance').html();
            var result=juicer(tpl,data); //将数据传入此模板
            $('.compare-perfomance div').html(result);

            if (data.isLeader) {
                $('.compare-perfomance').attr('data-src', 'teamSalesComparsion.html');
            }
        },
        renderTodayWork: function(resData){
            var initData = {
                isLeader: OMS.isLeader(),
                potential: 0,
                fromOuter: 0,
                introduce: 0,
                fieldOpen: 0,
                visit: 0,
                invite: 0,
                member: 0
            };
            var data = {};
            if(resData) {
                resData.fieldOpen = resData.open;
                data = OMS.todayWork = resData;
            }
            else
                data = OMS.todayWork || {};
            data=$.extend(initData,data);

            var tpl=$('#slide-work-quality').html();
            var result=juicer(tpl,data); //将数据传入此模板
            $('.work-quality div').html(result);

            if (data.isLeader){
                $('.work-quality').attr("data-src","salesReport.html");
            }
            // OMS.autoSlide();
        },
        renderDiagRes: function(resData){
            var data = {};
            if(resData)
                data = OMS.diagRes = resData;
            else
                data = OMS.diagRes || {};
            var lights = {
                green: 0,
                yellow: 0,
                red: 0,
            }, fields = ['file_light','visit_light','call_light','kp_light','lidan_light','order_light','sihai_light'];
            $.each(fields,function(f,v){
                if(data[f]==3)
                    lights.green++;
                else if(data[f]==2)
                    lights.yellow++;
                else if(data[f]==1)
                    lights.red++;
            });

            var htmlTpl =
                '<div class="title">智能工作诊断</div>' +
                '<ul class="content">' +
                    '<li>' +
                        '<p><span>' + (lights.green || 0) + '</span></p>' +
                        '<p><span class="circle c-green"></span>绿灯</p>' +
                    '</li>' +
                    '<li>' +
                        '<p><span>' + (lights.yellow || 0) + '</span></p>' +
                        '<p><span class="circle c-yellow"></span>黄灯</p>' +
                    '</li>' +
                    '<li>' +
                        '<p><span>' + (lights.red || 0)+ '</span></p>' +
                        '<p><span class="circle c-red"></span>红灯</p>' +
                    '</li>' +
                '</ul>';
            $('.diag-res div').html(htmlTpl);
            $('.diag-res').attr("data-src","teamDiagnose.html");
            OMS.autoSlide();
        },
        renderSaleFunnel: function(resData) {
            var initData = {
                isLeader: OMS.isLeader(),
                yqkh: 0,
                djkh: 0,
                zdkh: 0,
                yxkh: 0,
                khzy: 0
            };
            var data = {};
            if(resData&&resData != undefined)
                data = OMS.saleFunnel = resData;
            else
                data = OMS.saleFunnel || {};

            data=$.extend(initData,data);

            var tpl = $('#slide-sale-funnel').html();
            var result = juicer(tpl, data); //将数据传入此模板
            $('.sale-funnel div').html(result);

            if (data.isLeader) {
                $('.sale-funnel').attr("data-src", 'teamLoudou.html');
            }
        },
        renderPrivateDaily: function(resData) {
            var initData = {
                isLeader: OMS.isLeader(),
                appoint: 0,
                course: 0,
                pos: 0,
                w1: 0,
                w2: 0,
                rx: 0
            };
            var data = {};
            if(resData&&resData != undefined)
                data = OMS.privateDaily = resData;
            else
                data = OMS.privateDaily || {};

            data=$.extend(initData,data);

            var tpl = $('#slide-private-daily').html();
            var result = juicer(tpl, data); //将数据传入此模板
            $('.private-daily div').html(result);
            if (data.isLeader) {
                $('.private-daily').attr("data-src", 'privateReport.html');
            }
        },
        renderPayMents: function (resData) {
            var data = {};
            if(resData)
                data = OMS.payMents = resData;
            else
                data = OMS.payMents || {};
            var htmlTpl =
                '<div class="title">今日回款</div>' +
                '<ul class="content">' +
                    '<li>' +
                        '<p>' + ((data[1] || 0)/10000).toFixed(1) + '</p>' +
                        '<p>预测回款(万)</p>' +
                    '</li>' +
                    '<li>' +
                        '<p>' + ((data[2] || 0)/10000).toFixed(1) + '</p>' +
                        '<p>已确认回款(万)</p>' +
                    '</li>' +
                '</ul>';

            $('.today-payments').html(htmlTpl);
            if (OMS.isLeader())
                touchSlide($('.today-payments li'), null, null, function(){
                });
        },
        map: {
            middle: {
                // 1: ["下属客户", "私海", "公海", "开放池"], //新签leader(战区经理) 开放私海，公海，开发池
                // 2: ["我的新签", "我的续签"], //6.3 续签业务员 我的客户－> 我的新签，我的续签
                // 3: ["私海", "公海", "开放池"], //新签业务员
                // 4: ["续签客户", "新签客户", "我的续签", "我的新签"], //续签leader(战区经理)
                // 5: ["下属客户"], //(城市经理，以及其他角色) 城市经理开放私海，公海，开发池
                3: ["潜在客户", "公有客户", "企业客户","签约客户"], //业务员角色
                4: ["签约客户", "企业客户"], //私教角色
                5: ["潜在客户", "签约客户", "公有客户", "企业客户"], //业务员&私教角色
                7: ["下属客户", "潜在客户", "签约客户", "公有客户", "企业客户"], //leader角色
            },
            lower: {
                3: ["预约列表", "战报", "工作计划", "检索"],
                4: ["预约列表", "战报", "工作计划", "检索"],
                5: ["预约列表", "战报", "工作计划", "检索"],
                7: ["预约列表", "战报", "工作计划", "检索", "客户业绩分析", "私教课数分析", "卡种类分析"]
                // 1: ["理单", "实时动态", "分析", "检索", "客户联系人", "日报"],
                // 2: ["检索", "新增", "待办", "合同", "客户联系人", "公告榜"],
                // 3: ["检索", "新增", "待办", "合同", "客户联系人", "公告榜"],
                // 4: ["理单", "实时动态", "分析", "检索", "客户联系人", "日报"],
                // 5: ["理单", "实时动态", "分析", "检索", "日报", "下属"],
                // 1: ["理单", "实时动态", "分析", "检索", "商务电话", "日报"],
                // 2: ["检索", "新增", "待办", "合同", "商务电话", "公告榜"],
                // 3: ["检索", "新增", "待办", "合同", "商务电话", "公告榜"],
                // // 4: ["理单", "实时动态", "分析", "检索", "商务电话", "日报"],
                // 4: ["理单", "实时动态", "分析", "检索", "商务电话", "日报"],
                // 5: ["理单", "实时动态", "分析", "检索", "日报", "商务电话"],
            }
        },
        router: {
            //黄金时代
            "下属客户": "allCustomerList.html?type=3",
            "潜在客户": "allCustomerList.html?type=1",
            "签约客户": "allCustomerList.html?type=2",
            "公有客户": "allCustomerList.html?type=4",
            "企业客户": "allCompanyList.html",
            "预约列表": "reservation.html",
            "战报": "dailyReport.html",
            "工作计划": "workPlan.html",
            "检索": "search.html",
            "客户业绩分析": "performanceAnalyse.html",
            "私教课数分析": "privateClassAnalyse.html",
            "卡种类分析": "analyseCardType.html",
            // //新签
            // "私海": "privateSea.html?title=私海",
            // "下属客户": "privateSea.html?title=下属客户&isSub=1",
            // "公海": "publicSea.html",
            // "开放池": "openPool.html",
            // //续签
            // "续签客户": "renewal.html?title=续签客户&isSub=1",
            // "我的续签": "renewal.html?title=我的续签",
            // "新签客户": "privateSea.html?title=新签客户&isSub=1",
            // "我的新签": "privateSea.html?title=我的新签",
            // //tab
            // "分析": "team.html",
            // "检索": "search.html",
            // // "新增": "newadd.html",
            // "新增": "allCustomerList.html?type=3",
            // "待办": "toDo.html",
            // "实时动态": "toDoDynamic.html",
            // "合同": "contract.html",
            // "客户联系人": "contacts.html",
            // "商务电话": "businessCalls.html",
            // "下属": "underling.html",
            // "理单": "billings.html",
            // "公告榜": "announcement.html",
            // "日报": "dailyReport.html"
        },
        routerIcons: {
            "下属客户": "ui-icon-underling_customer_2",
            "潜在客户": "ui-icon-private_sea_2",
            "签约客户": "ui-icon-open_pool_2",
            "公有客户": "ui-icon-public_sea_2",
            "企业客户": "ui-icon-index_dynamic",
            "预约列表": "ui-icon-index_calendar",
            "战报": "ui-icon-index_daily",
            "工作计划": "ui-icon-index_list",
            "检索": "ui-icon-index_search",
            "客户业绩分析": "ui-icon-index_analysis",
            "私教课数分析": "ui-icon-index_analysis",
            "卡种类分析": "ui-icon-index_analysis",
        },
        renderMiddle: function(){
            var htmlTpl = '',
                self = this;
            var data = self.map.middle[self.role] || [];
            var className = "ui-col-" + Math.round(100/data.length);
            for(var i = 0, len = data.length; i < len; i++) {
                var name = data[i],
                    href = self.router[name];
                var icon = self.routerIcons[name];
                if(len>1){
                    htmlTpl +=
                        '<li class="ui-col ' + className + '">' +
                            '<div data-href="' + href + '">' +
                                '<i class="' + icon + '"></i>' +
                                '<span>' + name + '</span>' +
                            '</div>' +
                        '</li>';
                }else if(len === 1){
                    if(name == '下属客户'){
                        icon= icon.replace('_2','_3');
                    }
                    htmlTpl +=
                        '<li class="ui-col ' + className + ' oneIcon">' +
                            '<div data-href="' + href + '">' +
                                '<i class="' + icon + '"></i>' +
                                '<span class="desc">' + name + '</span>' +
                                '<span class="number"><i class="ui-icon ui-icon-index_arrow_right"></i></span>'+
                            '</div>' +
                        '</li>';
                    $(".middle-part").addClass("middle-part-one");
                }
            }
            $(".middle-part .ui-row").html(htmlTpl);

            $(".middle-part .ui-row div").on("click",function(){
                var href = $(this).data("href");
                if(!href) return;
                openLink(href);
            });
        },
        renderLower: function(){
            var htmlTpl = '', self = this;
            var data = this.map.lower[self.role];
            for(var i = 0, len = data.length; i < len; i++) {
                var routerUrl = self.router[data[i]];
                var routerIcon = self.routerIcons[data[i]];
                htmlTpl += '<li class="ui-col ui-col-33" data-href="' + routerUrl + '">';
                htmlTpl += '<div>'; //class="' + ((i+1)%3 !== 0?'ui-border-r':'') + '"
                htmlTpl += '<div class="ui-part-cell">';
                htmlTpl += '<p><i class="'+routerIcon+'"></i></p>';
                htmlTpl += '<span>' + data[i] + '</span></div></div></li>';
            }
            $(".lower-part ul").html(htmlTpl);
            $(".lower-part li").on("click",function(){
                var href = $(this).data("href");
                if(href)
                    openLink(href);
            });
            if(!dd.ios){
                $(".lower-part li").addClass("andriod");
            }
        },
        initTitleBar: function(title){
            ddbanner.changeBannerTitle(title || '首页');
            ddbanner.changeBannerRight(this.user.realname, false);
        },
        initLeftBar: function(){
            dd.ready(function(){
                if(dd.ios){
                    dd.biz.navigation.setLeft({
                        visible: false, //omsapp参数，表示不展示左侧导航栏目
                        show: true,
                        control: true,
                        showIcon: true,
                        text: '',
                        onSuccess : function(result) {
                            dd.biz.navigation.close({
                                onSuccess : function(result) { },
                                onFail : function(err) {}
                            });
                        },
                        onFail : function(err) {}
                    });
                }else{
                    //omsapp-android-setLeft-visible:false
                    dd.biz.navigation.setLeft({
                        visible: false,
                        control: false,
                        text: ''
                    });
                    $(document).off('backbutton');
                    $(document).on('backbutton', function(e) {
                        e.preventDefault();
                        dd.biz.navigation.close({
                            onSuccess : function(result) { },
                            onFail : function(err) {}
                        });
                    });
                }
            });
        },
        initRightBar: function() {
            dd.ready(function(){
                dd.biz.navigation.setRight({
                    control: true,
                    text: OMS.user.realname,
                    onSuccess: function() {
                        return openLink('oms_sale.html');
                    }
                });
            });
        },
        _setNotificationFront: function(isfront) {
            OMS._isNotificationFront = !!isfront;
        },
        initResumeEvent: function() {
            //弹窗是否调起状态
            OMS._isNotificationFront = false;
            $(document).on('resume', function() {
                if (!OMS._isNotificationFront) {
                    window.location.reload();
                }
                OMS._isNotificationFront = false;
            });
        },
        waitForWebfonts: function(fonts, callback) {
            var loadedFonts = 0;
            for(var i = 0, l = fonts.length; i < l; ++i) {
                (function(font) {
                    var node = document.createElement('span');
                    // Characters that vary significantly among different fonts
                    node.innerHTML = 'giItT1WQy@!-/#';
                    // Visible - so we can measure it - but not on the screen
                    node.style.position      = 'absolute';
                    node.style.left          = '-10000px';
                    node.style.top           = '-10000px';
                    // Large font size makes even subtle changes obvious
                    node.style.fontSize      = '300px';
                    // Reset any font properties
                    node.style.fontFamily    = 'sans-serif';
                    node.style.fontVariant   = 'normal';
                    node.style.fontStyle     = 'normal';
                    node.style.fontWeight    = 'normal';
                    node.style.letterSpacing = '0';
                    document.body.appendChild(node);

                    // Remember width with no applied web font
                    var width = node.offsetWidth;

                    node.style.fontFamily = font;

                    var interval;
                    function checkFont() {
                        // Compare current width with original width
                        if(node && node.offsetWidth != width) {
                            ++loadedFonts;
                            node.parentNode.removeChild(node);
                            node = null;
                        }

                        // If all fonts have been loaded
                        if(loadedFonts >= fonts.length) {
                            if(interval) {
                                clearInterval(interval);
                            }
                            if(loadedFonts == fonts.length) {
                                callback();
                                return true;
                            }
                        }
                    };

                    if(!checkFont()) {
                        interval = setInterval(checkFont, 50);
                    }
                })(fonts[i]);
            }
        }
    };

    var home = function(){};

    home.prototype.getHomePageData = function () {
        OMS_COM.ajaxPost({
            api: 'getHomePageData',
            data: {
                userId: JSON.parse(getCookie("omsUser")).id
            },
            success: function (data) {
                var res = JSON.parse(data);
                OMS.renderPerformance(res.data.target);
                OMS.renderPerformanceCompare(res.data.compare);
                OMS.renderSaleFunnel(res.data.loudou);
                OMS.renderTodayWork(res.data.daily);
                OMS.renderPrivateDaily(res.data.privaTeach);
            },
            error: function () {

            },
            always: function () {

            }
        });
    };
    home.prototype.checkState = function(){
        var apiUrl = oms_config.apiUrl + oms_apiList.checkState;
        $.ajax({
            url: apiUrl,
            type: 'post',
            data: {
                uid: OMS.user.id
            },
            cache: false,
            success: function(response){
                var result = response ? JSON.parse(response):'';
                OMS.checkState(result);
            },
            error: function(){
                OMS.checkState();
            }
        });
    };
    home.prototype.checkTrainState = function(){
        var apiUrl = oms_config.apiUrl + oms_apiList.checkTrainState;
        $.ajax({
            url: apiUrl,
            type: 'post',
            data: {
                uid: OMS.user.id
            },
            cache: false,
            success: function(response){
                var result = response ? JSON.parse(response):'';
                OMS.checkTrainState(result);
            },
            error: function(){
                OMS.checkTrainState();
            }
        });
    };
    home.prototype.error = function(msg){
        if(msg.indexOf("登录已过期") > -1){
            OMS.isAlert = true;//禁掉首页的登录过期弹出。
            if(!OMS.isAlert) {
                OMS.isAlert = true;
                dd.ready(function() {
                    dd.device.notification.alert({
                        message: msg,
                        title: "提示",
                        buttonName: "确定",
                        onSuccess : function() {
                            OMS.isAlert = false;
                            loginOut();
                            // dd.biz.navigation.close();
                        },
                        onFail : function(err) {
                            OMS.isAlert = false;
                            loginOut();
                        }
                    });
                });
            }
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
    var isNullObject = function(data) {
        var isHasObj = true;
        if (typeof data === "object" && !(data instanceof Array)) {
            for (var i in data) {
                isHasObj = false;
                break;
            }
        }
        return isHasObj;
    }
    var touchSlide = function(el, lfn, rfn, cfn){
        var startX = 0, startY = 0, endX = 0, endY = 0, startTime=new Date();
        function startHandle(e){
            e.preventDefault();

            if($(this).hasClass('upper-part-swipe')){
                if(!OMS.slideFlag){
                    return;
                }
                OMS.autoSlide(true);
            }


            startX = e.changedTouches[0].clientX;
            startY = e.changedTouches[0].clientY;
        }
        function moveHandle(e){
            e.preventDefault();
            var w = document.documentElement.clientWidth;
            if($(this).hasClass("upper-part-swipe")){
                if(!OMS.slideFlag){
                    return;
                }
                var active = $(".active");
                var left = active.prev()||null;
                var right = active.next()||null;
                var touch = e.touches[0],
                    x = touch.pageX - startX,
                    d = (x*16)/w,
                    index = active.index(),
                    transX = -index*13.76;

                $(".upper-part-swipe").removeClass("trans");
                //$(".upper-part-swipe li").removeClass("trans");
                //计算位移距离，ul设置translatex值
                $(".upper-part-swipe").css("-webkit-transform", "translateX("+(transX+d)+"rem)");

                //计算放大缩小概率
                //var activeScale = (1-Math.abs(d)/87)>=0.83 ? (1-Math.abs(d)/87) : 0.83;
                //var leftScale = (0.83+d/87)<=1 ? (0.83+d/87) : 1;
                //var rightScale = (0.83-d/87)<=1 ? (0.83-d/87) : 1;
                //active.css("－webkit-transform","scale3d("+activeScale+","+activeScale+", 1)");
                //left.css("－webkit-transform","scale3d("+leftScale+","+leftScale+",1)");
                //right.css("－webkit-transform","scale3d("+rightScale+","+rightScale+",1)");

            }
        }
        function endHandle(e) {
            e.preventDefault();
            if($(this).hasClass('upper-part-swipe')){
                if(!OMS.slideFlag){
                    return;
                }
                OMS.autoSlide();

            }
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            if (Math.abs(endX - startX) < 15 && Math.abs(endY - startY) < 15) {
                if($(this).hasClass('upper-part-swipe')){

                    var targetLi = $(e.target).parents(".slide").parent("li");
                    var link;

                    targetLi.tap(function(){
                        link = targetLi.attr("data-src");
                        if(link){
                            openLink(link);
                        }

                    });
                }else{
                    typeof cfn === 'function' && cfn.call(this, e);
                }
            }
            else if(endX - startX > 15 && Math.abs(endY - startY) < 150){
                typeof rfn === 'function' && rfn.call(this, e);
            }
            else if(endX - startX < -15 && Math.abs(endY - startY) < 150){
                typeof lfn === 'function' && lfn.call(this, e);
            }
        }

        el.off('touchstart', startHandle);
        el.off("touchmove", moveHandle);
        el.off('touchcancel touchend', endHandle);
        el.on('touchstart', startHandle);
        el.on("touchmove", moveHandle);
        el.on('touchcancel touchend', endHandle);
    };

    function prevCard(){
        var active = $(".upper-part-swipe .active");
        var left = active.prev()||null;
        var right = active.next();
        var box = $(".upper-part-swipe");
        var index = active.index();

        $(".upper-part-swipe").addClass("trans");
        $(".upper-part-swipe>li").addClass("trans");
        if(index!==0){
            //box.css("margin-left","0rem");
            left.removeClass("left").addClass("active");
            active.removeClass("active").addClass("right");
            right.removeClass("right");
            left.prev().addClass("left");
            box.css("-webkit-transform","translateX(-"+(index-1)*13.76+"rem)");

        }

    }
    function nextCard(){
        var maxSize = OMS.slideSize;
        var active = $(".upper-part-swipe .active");
        var left = active.prev();
        var right = active.next()||null;
        var box = $(".upper-part-swipe");
        var index = active.index();
        $(".upper-part-swipe").addClass("trans");
        $(".upper-part-swipe>li").addClass("trans");
        if(index<maxSize*2-1){
            left.removeClass("left");
            active.removeClass("active").addClass("left");
            right.removeClass("right").addClass("active");
            right.next().addClass("right");
            box.css("-webkit-transform","translateX(-"+(index+1)*13.76+"rem)");
        }

    }
    var offsetX = 0;
    var upperSwipe = function(type){
        var maxSize = OMS.slideSize,
            index = 0,
            rest = Math.abs(offsetX) % maxSize;

        if(OMS.slideFlag){
            OMS.slideFlag = false;
            if(type == "left" && rest === 0){
                prevCard();
            }
            else if( type == "right" && rest === 0){
                nextCard();
            }
            var className = $(".active .slide").attr("class").split("slide ")[1];
            $(".upper-part #slide-icon span").removeAttr("class");
            $(".upper-part #slide-icon span").eq(($(".active").index()+2)%maxSize).addClass("isSlided").addClass(className);

        }else{
            return;
        }
    }


    //登陆验证
    $.fn.OMS = function(settings){ $.extend(OMS, settings || {});};
    dd.ready(function() {
        //modify by lipengfei at 2016/7/24
        function checkOmsUser() {
            var omsUser = getCookie('omsUser');
            if(omsUser){
                try{
                    omsUser = JSON.parse(omsUser);
                }catch(e){}
            }

                if(omsUser && omsUser.res === 1){
                if(omsUser.role === -1) {
                    dd.device.notification.alert({
                        message: omsUser.msg,
                        title: "提示",
                        buttonName: "确定",
                        onSuccess: function() {
                            loginOut();
                        },
                        onFail: function(err) {
                            loginOut();
                        }
                    });
                }
                else {
                    OMS.user = omsUser;
                    OMS.init();
                    //设置此次登录cookie标志
                    setCookie('_logined','1',true);
                }
            }
            else {
                //修改调试信息, by lipengfei at 2017/2/24
                function _errorAlert(error) {
                    var message = '登录失败('+(error || 'unknow')+')';
                    dd.device.notification.alert({
                        message: message,
                        title: "提示",
                        buttonName: "确定",
                        onSuccess: function() {
                            loginOut();
                        },
                        onFail: function(err) {
                            dd.device.notification.alert({message: message+'(F)'});
                            loginOut();
                        }
                    });
                }

                //依次检查 nativeStorage, cookie 取值
                dd.util.localStorage.getItem({
                    name: 'crm.user.data',
                    onSuccess: function(result) {
                        var _error;
                        if (!result || !result.value) {
                            _error = '本地缓存失效,empty';
                        } else {
                            try {
                                JSON.parse(result.value);
                                var _cookieval = getCookie('omsUser');
                                if (!_cookieval || !_cookieval.length || _cookieval.length < 10) {
                                    _error = 'cookie失效';
                                }
                            } catch(e) {
                                _error = '本地缓存失效,invalid';
                            }
                        }
                        return _errorAlert(_error);
                    },
                    onFail: function() {
                        return _errorAlert('本地缓存失效,jsapi');
                    }
                });
            }
        }

        //增加crmlogin跳转初始化 by lipengfei at 2016/7/24
        //fix _loginfrom=crmlogin, 目前所有的系统都需要统一登录 by lipengfei at 2017/2/24
        var _loginfrom = getUrlParam('_from');
        _loginfrom = 'crmlogin';

        if(_loginfrom == 'crmlogin'){
            var userdata, failtip = '本地缓存失效，请重新登录';
            setCookie('_from', 'crmlogin');
            dd.util.localStorage.getItem({
                name: 'crm.user.data',
                onSuccess: function(result) {
                    try{
                        userdata = JSON.parse(result.value);
                    }catch(e){}
                    if(userdata && userdata.username){
                        setCookie('omsUser',JSON.stringify(userdata));
                    }else{
                        dd.device.notification.toast({text: failtip});
                    }
                    return checkOmsUser();
                },
                onFail: function() {
                    dd.device.notification.toast({text: failtip});
                    return checkOmsUser();
                }
            });
        }else{
            //修改设置 _from cookie， by lipengfei at 2016/8/30
            //历史原因，默认设置 _from = 'omsmobile';
            _loginfrom = _loginfrom || 'omsmobile';
            setCookie('_from', _loginfrom);
            var loginApi=oms_config.apiUrl + oms_apiList.login;
            new Login(oms_config.corpId,oms_config.baseUrl,loginApi,checkOmsUser);
        }
    });
});
