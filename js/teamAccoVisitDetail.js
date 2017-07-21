/**
* @Author: xuzhijun
* @Date:   2016-10-11 15:03:46
* @Last modified by:   xuzhijun
* @Last modified time: 2016-10-14 16:53:54
*/

(function () {
    var Page = function () {
        var fn = function () {};
        fn.prototype = {
            init: function (user) {
                this.initParams(user);
                this.initPage();
                this.getData();
            },
            initParams: function () {
                this.params = getQuestParams();
                this.apiConfig = {};
                this.apiConfig.type = 'POST';
                this.type;
                this.vwar;
                // 依据传递的参数判断接口类型
                if (Object.keys(this.params).indexOf('orgid') > -1)
                {
                    this.type = 1;
                    this.vwar = decodeURI(getUrlParam('orgname'));
                    this.apiConfig.api = 'apiPeifang/getPeifangRecordByOrgid';
                }
                else
                {
                    this.type = 0;
                    this.apiConfig.api = 'apiPeifang/getPeifangRecordByUid';
                }
                this.leaderName = decodeURI(getUrlParam('name'));
            },
            initPage: function () {
                this.initPageTitle();
                this.initPageHeader();
            },
            initPageTitle: function () {
                dd.ready(function () {
                    dd.biz.navigation.setTitle({
                        title: '陪访详情'
                    });
                    if (dd.ios) {
                        dd.biz.navigation.setLeft({
                            show: true,
                            control: true,
                            showIcon: true,
                            text: '返回',
                            onSuccess: function(result) {
                                dd.biz.navigation.close({
                                    onSuccess: function(result) {},
                                    onFail: function(err) {}
                                });
                            },
                            onFail: function(err) {}
                        });
                    } else {
                        dd.biz.navigation.setLeft({
                            visible: true,
                            control: false,
                            text: ''
                        });
                        $(document).off('backbutton');
                        $(document).on('backbutton', function(e) {
                            dd.biz.navigation.close({
                                onSuccess: function(result) {},
                                onFail: function(err) {}
                            });
                            e.preventDefault();
                        });
                    }
                });
            },
            initPageHeader: function () {
                var vwar_type;
                var htmlTpl = '';
                var self = this;
                if(self.type == 0){
                    if(self.params.type == 'day'){
                        vwar_type = '今日';
                    }
                    if(self.params.type == 'month'){
                        vwar_type = '本月';
                    }
                    var htmlTpl = '<p>(' + self.leaderName + ')' + vwar_type + '-陪访信息</p>';
                }
                if(self.type == 1){

                    if(self.params.type == 'day'){
                        if(self.params.level == 2)
                        {
                            vwar_type = ' 今日';
                        }
                        if(self.params.level == 3)
                        {
                            vwar_type = ' 今日';
                        }
                    }
                    if(self.params.type == 'month'){
                        if(self.params.level == 2)
                        {
                            vwar_type = ' 本月';
                        }
                        if(self.params.level == 3)
                        {
                            vwar_type = ' 本月';
                        }
                    }
                    var htmlTpl = '<p>' + self.vwar+ vwar_type + '-陪访信息</p>';
                }

                $('.header').html(htmlTpl);
            },
            render: function (result) {
                var self = this, responseCode = result.res;
                $('.loading').hide();
                $('.content').show();
                if (responseCode === 1) {
                    var data = result.data || [];
                    var htmlTpl = self.renderListLi(data);

                    if (!htmlTpl) {
                        $('.content').html('<p class="message">暂无数据</p>');
                    } else {
                        $('.content').html('<ul class="ui-list ui-list-text content-list"></ul>');
                        $('.content .content-list').html(htmlTpl);
                    }
                } else if (responseCode === -1) {
                    omsUser.loginOut();
                } else {
                    var htmlTpl = '<p class="error">' + result.msg + '</p>';
                    $('.content').html(htmlTpl);
                }

                $("#cuslist li").off('click').on('click', function(){
                    if(!$(this).hasClass("noMore")){
                        self.openCustomerInfo($(this).data("code"));
                    }
                });
            },
            defaultValue: function(data) {
                if(!data)
                    return '暂无';
                return data;
            },
            defaultPosition: function(data) {
                if(!data)
                    return '';
                return '-'+data;
            },
            openCustomerInfo: function(code){
                openLink(oms_config.baseUrl + "customerInfo.html?code=" + code + "&from=private&jumpType=close", true);
            },

            renderListLi: function (data) {
                var htmlTpl = '',
                    self = this;
                console.log(this.type);
                console.log(self.apiConfig);
                for (var i = 0, len = data.length; i < len; i++) {
                    htmlTpl += '<li data-code="' + data[i].cusid + '" class="ui-border-t"><div class="content-list-card" >';
                    if(self.type == 0){
                        htmlTpl += '<p>' + data[i].cusname + '</p>';
                    }
                    if(self.type == 1){
                        htmlTpl += '<p>' + data[i].cusname + '<span style="float:right">陪访人：' + self.defaultValue(data[i].leadername) + '</span></p>';
                    }
                    htmlTpl += '<p><label>跟进业务员: </label><span>' + self.defaultValue(data[i].userposition) + '-' + self.defaultValue(data[i].username) + '</span>';
                    htmlTpl += '<p><label>见面对象: </label><span>' + self.defaultValue(data[i].linkman) + self.defaultPosition(data[i].position) + '</span>';
                    htmlTpl += '<p><label>陪访时段: </label><span>' + data[i].start_time + '~' + data[i].end_time + '</span>';
                    htmlTpl += '<p><label>开始陪访地址: </label><span>' + data[i].start_address + '</span>';
                    htmlTpl += '<p><label>结束陪访地址: </label><span>' + data[i].end_address + '</span>';
                    htmlTpl += '<p><label>陪访纪要: </label><span>' + data[i].content + '</span>';
                    htmlTpl += '</div></li>';
                }
                return htmlTpl;
            },
            getData: function () {
                var config = {}, self = this;
                config.type = self.apiConfig.type;
                config.api = self.apiConfig.api;
                config.params = self.params;
                config.callback = function (result) {
                    self.render(result);
                };
                sendQuest(config);
            }
        };
        return new fn();
    }();

    var sendQuest = function (config) {
        var apiUrl = oms_config.apiUrl + config.api;
        if (!config.params) config.params = {};
        config.params.omsuid = omsUser.id;
        config.params.token = omsUser.token;
        var request = $.ajax({
            url: apiUrl,
            type: config.type || 'get',
            data: config.params,
            cache: false
            // contentType: 'application/x-www-form-urlencoded'
        });
        request.done(function (response) {
            var result = {};
            try {
                result = JSON.parse(response);
            } catch (e) {
                result = { res: 0, msg: '服务异常' };
            }
            config.callback && config.callback(result);
        });
        request.fail(function (xhr, errorType, error) {
            if (errorType == "abort") return;
            config.callback && config.callback({ res: 0, msg: '网络异常' });
        });
    };

    var omsUser = {
        init: function () {
            var loginApi = oms_config.apiUrl + oms_apiList.login, self = this;
            var omsUser = getCookie('omsUser');
            if (omsUser) omsUser = JSON.parse(omsUser);

            if (typeof omsUser === 'object' && omsUser.res === 1 && omsUser.role !== -1 ) {
                self.id = omsUser.id;
                self.token = omsUser.token;
                Page.init();
            } else {
                self.loginOut();
            }
            // new Login(oms_config.corpId, oms_config.baseUrl, loginApi, function () {
            //     var omsUser = getCookie('omsUser');
            //     if (omsUser) omsUser = JSON.parse(omsUser);
            //
            //     if (typeof omsUser === 'object' && omsUser.res === 1 && omsUser.role !== -1 ) {
            //         self.id = omsUser.id;
            //         self.token = omsUser.token;
            //         Page.init();
            //     } else {
            //         self.loginOut();
            //     }
            // });
        },
        loginOut: function () {
            dd.ready(function () {
                dd.device.notification.alert({
                    message: "登录已过期",
                    title: "提示",
                    buttonName: "离开",
                    onSuccess: function () {
                        window.loginOut();
                    },
                    onFail: function (err) {
                        window.loginOut();
                    }
                });
            });
        }
    };

    function getQuestParams() {
        var array = window.location.href.split('?'), temp = {};
        if (array.length - 1 > 0) {
            var paramArr = array[1].split('&');
            for (var i = 0, len = paramArr.length; i < len; i++){
                var item = paramArr[i].split('=');
                if(item[0] != 'orgname'){
                    temp[item[0]] = decodeURIComponent(item[1]).trim();
                }

            }
        }
        return temp;
    }
    omsUser.init();
}());
