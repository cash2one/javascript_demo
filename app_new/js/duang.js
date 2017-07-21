/**
 * by hecom at 2016/6/24
 */
$(function() {

    var page = {
        _user: null,
        _params: {},

        /**
         * 兼容之前格式, users 数据格式
         *  users
         *  [
         *      id1@realname1,
         *      id2@realname2,
         *  ]
         */
        users: [],
        text: '',
        text_header: '',
        text_tip: '点击输入文字...',
        category: '_default_',
        receivers: [], //选中接收者

        _submiting: false,

        toastTip: function(msg, icon, dur) {
            dd.device.notification.toast({
                icon: icon,
                text: msg,
                duration: dur || 1
            });
        },

        setByParams: function(params) {
            var self = this;
            self._params = params || self._params;
            if (params.users) {
                var tmpmap = {};
                $.each(params.users, function(i, uid) {
                    //WARNING: uid=idX@realnameX
                    var _complexUid = uid.split('@');
                    _complexUid[1] = _complexUid.slice(1).join('@');
                    if (!_complexUid[0] || tmpmap[uid]) {
                        return;
                    }
                    self.users.push(uid);
                    //默认选中全部可选人员
                    self.receivers.push({
                        id: _complexUid[0],
                        realname: _complexUid[1] || '-未知-',
                    });
                    tmpmap[uid] = true;
                });
            }
            self.text = $.trim(params.text);
            self.text_header = $.trim(params.text_header);
            self.text_tip = params.text_tip || self.text_tip;
            self.category = params.category || self.category;
        },

        loadUsers: function() {
            var self = this;
            if (self.users.length) {
                return self.getUsers().always(function(result) {
                    if ('res' in result && result.res === 1) {
                        self.receivers = [];
                        $.each(result.data, function(i, u) {
                            self.receivers.push($.extend({}, u));
                        });
                        self.renderReceiver();
                    } else {
                        self.toastTip('接收人信息获取失败', 'error');
                    }
                });
            }
            return $.Deferred().reject();
        },

        initPicker: function(result) {
            if ('res' in result && result.res === 1) {
                var all = [];
                $.each(result.data, function(i, u) {
                    all.push($.extend({}, {checked: true}, u)); //默认选中人员
                });
                receiverPicker.init(all);
            } else {
                receiverPicker.init(false);
            }
        },

        updateReceivers: function(selobjs) {
            if (!$.isArray(selobjs)) {
                return;
            }
            var sels = [];
            $.each(selobjs, function(i, obj) {
                sels.push($.extend({}, obj));
            });
            this.receivers = sels;
            this.renderReceiver();
        },

        sendDuang: function() {
            if (this._submiting) {
                return;
            }
            if (this.receivers.length==0) {
                return this.toastTip('请至少选择一个接收人');
            }
            if ($.trim(this.text.length)==0) {
                return this.toastTip('请填写必达文字');
            }
            this._submiting = true;
            dd.device.notification.showPreloader({
                text: '发送中...'
            });
            var self = this;
            var promise = self.beforeDuang();
            promise.fail(function(err) {
                dd.device.notification.hidePreloader();
                self.toastTip(err, 'error');
                self._submiting = false;
            });
            promise.done(function() {
                self.postDuang().always(function(result) {
                    dd.device.notification.hidePreloader();
                    if ('res' in result && result.res === 1) {
                        self.toastTip('已发送');
                        dd.biz.navigation.close();
                    } else {
                        self.toastTip(result.msg || '网络请求失败', 'error');
                    }
                    self._submiting = false;
                });
            });
        },

        getUsers: function() {
            // var formdata = 'token='+this._user.token+'&uids='+this.users.join(',');
            // return $.ajax({
            //     type: 'GET',
            //     url: oms_config.apiUrl + oms_apiList.getUsersByIds,
            //     data: formdata,
            //     cache: false,
            //     dataType: 'json'
            // });
            var users = [], _complexUid;
            for (var i = 0; i < this.users.length; i++) {
                _complexUid = this.users[i].split('@');
                _complexUid[1] = _complexUid.slice(1).join('@');
                users.push({
                    id: _complexUid[0],
                    realname: _complexUid[1] || '-未知-'
                });
            }
            var result = {
                res: 1,
                msg: 'success',
                data: users
            };
            return $.when(result);
        },

        beforeDuang: function() {
            var dfd = $.Deferred();
            if (this.text == '') {
                dfd.reject('请填写必达文字');
            }
            switch (this.category) {
                case 'boss':
                    this.postComment().always(function(result) {
                        if ('res' in result && result.res === 1) {
                            dfd.resolve();
                        } else {
                            dfd.reject(result.msg || '保存点评内容失败，请稍后重试');
                        }
                    });
                    break;
                default:
                    dfd.resolve();
            }
            return dfd.promise();
        },

        postDuang: function() {
            var ids = [];
            for (var i = 0; i < this.receivers.length; i++) {
                ids.push(this.receivers[i]['id']);
            }
            var formdata = {
                omsuid: this._user.id,
                token: this._user.token,
                uids: ids.join(','),
                content: this.text_header ? (this.text_header + this.text) : this.text
            };
            return $.ajax({
                type: 'POST',
                url: oms_config.apiUrl + oms_apiList.sendDuangComment,
                data: formdata,
                cache: false,
                dataType: 'json'
            });
        },

        postComment: function() {
            var formdata = {
                omsuid: this._user.id,
                token: this._user.token,
                cusid: this._params.cusid,
                comment: this.text,
                comment_header: this.text_header,
            };
            return $.ajax({
                type: 'POST',
                url: oms_config.apiUrl + oms_apiList.postComment,
                data: formdata,
                cache: false,
                dataType: 'json'
            });
        },

        render: function() {
            this.renderReceiver();
            $('#post-text').val(this.text);
            $('#post-text').attr('placeholder', this.text_tip);
        },

        renderReceiver: function() {
            var $list = $('#receiver-list');
            $list.empty();
            $.each(this.receivers, function(i, obj) {
                if (i >= 5) { //最多展示5个
                    return false;
                }
                // ios 3个中文字符及以上不能对齐到一整行，强制只展示组多两个字符
                $list.append('<li class="ui-avatar-tiled"><span>'+obj.realname.substr(0, 2)+'</span></li>');
            });
            $('#receiver-total').text(this.receivers.length+'人');
        },

        initEvents: function() {
            var self = this;
            $('.setting-receiver').on('click', function() {
                receiverPicker.open(function(selobjs) {
                    self.initBar(); //关闭浮层后，需要重置导航栏动作
                    self.updateReceivers(selobjs);
                });
            });
            $('#post-text').on('change input keyup', function() {
                self.text = $.trim($(this).val());
                $(this).height(Math.max(this.scrollHeight, this.clientHeight));
            });
            $('#voiceinput-btn').on('click', function() {
                hq.biz.util.voiceInput({
                    text: self.text,
                    onSuccess: function(result){
                        if (result.data) {
                            self.text = result.data;
                            $('#post-text').val(self.text);
                        }
                    }
                });
            });
        },

        initBar: function() {
            var self = this;
            ddbanner.changeBannerTitle('发送必达');
            function tipOnclose(e) {
                e && e.preventDefault();
                dd.device.notification.confirm({
                    message: '要放弃发送必达消息么？',
                    title: '提示',
                    buttonLabels: ['取消', '放弃'],
                    onSuccess: function(result) {
                        if (result.buttonIndex == 1) {
                            dd.biz.navigation.close();
                        }
                    }
                });
            }
            if (dd.ios) {
                dd.biz.navigation.setLeft({
                    control: true,
                    text: '返回',
                    onSuccess: function() {
                        tipOnclose();
                    }
                });
            } else {
                $(document).off('backbutton');
                $(document).on('backbutton', tipOnclose);
            }
            ddbanner.changeBannerRight('发送', true, function() {
                self.sendDuang();
            });
        },

        init: function(user, params) {
            this._user = user;
            this.initBar();
            this.initEvents();

            //根据参数设置变量
            this.setByParams(params);
            if (this.receivers.length==0) {
                this.toastTip('参数错误', 'error');
                return dd.biz.navigation.close();
            }

            //从服务器加载接收者数据，并初始化选择列表数据
            var self = this;
            this.loadUsers().always(function(result) {
                self.initPicker(result);
            });

            return this.render();
        }
    };

    var receiverPicker = {
        _placeholdhtml: '<li>\
                            <div class="ui-placehold-wrap">\
                                <div class="ui-placehold">__TEXT__</div>\
                            </div>\
                         </li>',

        users: null,
        loadfail: false,

        _callback: undefined,

        init: function(users) {
            if (users === false) {
                loadfail = true;
            } else if ($.isArray(users)) {
                this.users = users;
            } else {
                this.users = [];
            }
            this.bind();
            this.render();
        },

        open: function(cb) {
            if ($.isFunction(cb)) {
                this._callback = cb;
            }
            $('#receiver-picker').addClass('show');
            this.initNav();
        },

        close: function(canceled) {
            var self = this, selobjs;
            if (canceled) {
                selobjs = false;
            } else {
                selobjs = [];
                var $lisels = $('#receiver-choosen-list').children('li.sel');
                $lisels.each(function() {
                    var uid = $(this).data('uid');
                    for (var i = 0; i < self.users.length; i++) {
                        if (self.users[i]['id'] == uid) {
                            selobjs.push($.extend({}, self.users[i]));
                            break;
                        }
                    }
                });
            }
            $('#receiver-picker').removeClass('show');
            return setTimeout(function() {
                if ($.isFunction(self._callback)) {
                    self._callback.call(null, selobjs);
                }
                self._callback = undefined;
            });
        },

        initNav: function() {
            var self = this;
            ddbanner.changeBannerTitle('接收人');
            if (dd.ios) {
                dd.biz.navigation.setLeft({
                    control: true,
                    text: '返回',
                    onSuccess: function() {
                        self.close(true);
                    }
                });
            } else {
                function cancel(e) {
                    $(document).off('backbutton', cancel);
                    e.preventDefault();
                    self.close(true);
                }
                $(document).off('backbutton');
                $(document).on('backbutton', cancel);
            }
            this._initRight();
        },

        _initRight: function() {
            var self = this,
                selsize = $('#receiver-choosen-list').children('li.sel').length,
                btntext = '确定('+selsize+')';
            ddbanner.changeBannerRight(btntext, true, function() {
                var nowsize = $('#receiver-choosen-list').children('li.sel').length;
                if (nowsize==0) {
                    dd.device.notification.toast({text: '请至少选择一个接收者'});
                    return;
                }
                self.close();
            });
        },

        bind: function() {
            var self = this,
                $checkall = $('#choosen-all-line').find('input'), $ul = $('#receiver-choosen-list');
            // //阻止 checkbox 的默认切换选中行为，不知道有效么
            // $ul.on('click', '[type="checkbox"]', function(e) {
            //     event.preventDefault();
            // });
            $ul.on('click', 'li', function(e) {
                var $li = $(this), $lisels = $ul.children('li.sel');
                if ($li.hasClass('sel')) {
                    // if ($lisels.length==1) {
                    //     dd.device.notification.toast({text: '请至少选择一个接收者'});
                    // }
                    $li.removeClass('sel').find('input').prop('checked', false);
                    $checkall.prop('checked', false);
                } else {
                    $li.addClass('sel').find('input').prop('checked', true);
                    if ($lisels.length+1 >= $ul.children().length) {
                        $checkall.prop('checked', true);
                    }
                }
                self._initRight();
            });
            $('#choosen-all-line').on('click', function(e) {
                var tostatus = $checkall.prop('checked'); //需要变更到的状态
                if (!$(e.target).is('input')) {
                    tostatus = !$checkall.prop('checked'); //点击了 P 标签，修改状态
                }
                $checkall.prop('checked', tostatus);
                $ul.children().each(function() {
                    if (tostatus) {
                        $(this).addClass('sel').find('input').prop('checked', true);
                    } else {
                        $(this).removeClass('sel').find('input').prop('checked', false);
                    }
                });
                self._initRight();
            });
        },

        render: function() {
            var $list = $('#receiver-choosen-list'), tpl = $('#receiver-choosen-item-tpl').html();
            $list.empty();
            if (this.loadfail==true) {
                $list.append(this._placeholdhtml.replace('__TEXT__', '加载失败...'));
            } else {
                if (this.users==null) {
                    $list.append(this._placeholdhtml.replace('__TEXT__', '加载中...'));
                } else {
                    $.each(this.users, function(i, u) {
                        var li = tpl.replace('__id__', u.id).replace('__realname__', u.realname);
                        $list.append(li);
                    });
                    $('#choosen-all-line').find('input').prop('checked', true);
                }
            }
        }
    };

    dd.ready(function() {
        FastClick.attach(document.body);

        var userstr = getCookie('omsUser'), user;
        if (userstr) {
            try {
                user = JSON.parse(userstr);
            } catch(e) {}
        }
        if (user) {
            var params, jsonstr = getUrlParam('jsonstr');
            try {
                params = JSON.parse(jsonstr);
            } catch(e) {}
            if (params) {
                return page.init(user, params);
            }
        }
        dd.device.notification.toast({text: '参数错误', icon: 'error'});
        dd.biz.navigation.close();
    });
});
