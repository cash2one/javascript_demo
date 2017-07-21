/**
 * by hecom@2016/6/15
 */
$(function() {

    var page = {
        loginType: 'user',

        model: {
            username: '',
            password: '',
            mobile: '',
            vercode: ''
        },

        mobileValid: false,
        inputValid: false,
        submiting: false,

        waitingRoller: null,

        validators: {
            username: function(value) {
                return value && $.trim(value).length >=3;
            },
            password: function(value) {
                return !!value;
            },
            mobile: function(value) {
                return value && value.length == 11 && /^1\d{10}$/.test(value);
            },
            vercode: function(value) {
                return value && /^\d{4}$/g.test(value);
            }
        },

        toastTip: function(msg, icon, dur) {
            dd.device.notification.toast({
                icon: icon,
                text: msg,
                duration: dur || 1
            });
        },

        forcode: function() {
            var self = this, $sendbtn = $('#codesend-btn');
            if (!this.mobileValid || this.waitingRoller) {
                return false;
            }
            $sendbtn.prop('disabled', true);
            this.waitingRoller = {
                handler: window.setInterval(function() {
                    self.rollerCheck();
                }, 1000),
                endtime: parseInt(Date.now()/1000)+60 // 1分钟
            };
            this.sendcode().always(function(result) {
                if ('res' in result && result.res === 1) {
                    // 验证码发送成功
                    return self.toastTip('验证码已发送，请注意查收');
                }
                self.toastTip(result.msg || '网络请求失败', 'error');
            });
            return false;
        },

        rollerCheck: function(reset) {
            var $sendbtn = $('#codesend-btn'),
                roller = this.waitingRoller,
                endtime = roller.endtime,
                nowtime = parseInt(Date.now()/1000);
            if (reset || endtime <= nowtime) {
                window.clearInterval(roller.handler);
                this.waitingRoller = null;
                $sendbtn.text('获取验证码');
                this.checkInput();
            } else {
                $sendbtn.prop('disabled', true);
                $sendbtn.text((endtime-nowtime)+'s后重新获取');
            }
        },

        submit: function() {
            var self = this, $loginbtn, logindfd;
            if (!this.inputValid || this.submiting) {
                return false;
            }
            dd.device.notification.showPreloader({
                text: '登录中...'
            });
            this.submiting = true;
            if ('user' == this.loginType) {
                $loginbtn = $('#userlogin-btn').addClass('active');
                logindfd = this.loginByUser();
            } else {
                $loginbtn = $('#mobilelogin-btn').addClass('active');
                logindfd = this.loginByMobile();
            }
            logindfd.always(function(result) {
                dd.device.notification.hidePreloader();
                if ('res' in result) {
                    if (result.res === 1) {
                        self.initAuthData(result, function() {
                            window.location.href = 'index.html';
                        });
                    } else {
                        self.toastTip(result.msg || '网络请求失败', 'error');
                    }
                } else {
                    self.toastTip('网络请求失败', 'error');
                }
                self.submiting = false;
                $loginbtn.removeClass('active');
            });
            return false;
        },

        attemptTokenLogin: function() {
            var self = this, userToken;
            // var userToken = window.localStorage.getItem('hecom.token_user');
            dd.util.localStorage.getItem({
                name: 'hecom.token_user',
                onSuccess: function(result) {
                    if (result.value) {
                        userToken = result.value;
                        tryAutologin();
                    } else {
                        failAutologin();
                    }
                },
                onFail: function() {
                    failAutologin();
                }
            });
            function tryAutologin() {
                dd.device.notification.showPreloader({
                    text: '登录中...'
                });
                var logindfd = self.loginByToken(userToken);
                logindfd.always(function(result) {
                    dd.device.notification.hidePreloader();
                    if ('res' in result && result.res === 1) {
                        self.initAuthData(result, function() {
                            window.location.href = 'index.html';
                        });
                    } else {
                        failAutologin();
                        self.toastTip('请使用帐号重新登陆', 'error');
                    }
                });
            }
            function failAutologin() {
                $('.ui-container').show();
            }
        },

        sendcode: function() {
            var formdata = 'tel='+this.model.mobile;
            return $.ajax({
                type: 'POST',
                url: oms_config.apiUrl + oms_apiList.sendcodeForLogin,
                data: formdata,
                cache: false,
                dataType: 'json'
            });
        },

        loginByUser: function() {
            var formdata = 'type=1&username='+this.model.username+'&password='+this.model.password;
            return $.ajax({
                type: 'POST',
                url: oms_config.apiUrl + oms_apiList.omslogin,
                data: formdata,
                cache: false,
                dataType: 'json'
            });
        },

        loginByMobile: function() {
            var formdata = 'type=2&tel='+this.model.mobile+'&code='+this.model.vercode;
            return $.ajax({
                type: 'POST',
                url: oms_config.apiUrl + oms_apiList.omslogin,
                data: formdata,
                cache: false,
                dataType: 'json'
            });
        },

        loginByToken: function(userToken) {
            var formdata = 'type=3&user_token='+userToken;
            return $.ajax({
                type: 'POST',
                url: oms_config.apiUrl + oms_apiList.omslogin,
                data: formdata,
                cache: false,
                dataType: 'json'
            })
        },

        initAuthData: function(data, onsuccess) {
            var old_data = getCookie('omsUser');
            if (old_data && old_data.token) {
                if (old_data.id != data.id) {
                    delCookie('omsUser');
                    window.localStorage.clear();
                }
            }
            setCookie('omsUser', JSON.stringify(data));

            var okcount = 0;
            function maysuccess() {
                okcount++;
                if (okcount >= 3) {
                    (typeof onsuccess == 'function') && onsuccess();
                }
            }
            //FIXME: 增加失败处理
            setTimeout(function() {
                okcount = 10;
                maysuccess();
            }, 1000);
            //使用jsapi接口替换
            // window.localStorage.setItem('hecom.token_user', data.token_user);
            // window.localStorage.setItem('hecom.token_user_at', new Date().getTime());
            dd.util.localStorage.setItem({
                name: 'hecom.token_user',
                value: data.token_user,
                onSuccess: function() {
                    maysuccess();
                }
            });
            dd.util.localStorage.setItem({
                name: 'hecom.token_user_at',
                value: new Date().getTime(),
                onSuccess: function() {
                    maysuccess();
                }
            });
            //增加GrowningIO登录监控
            dd.biz.monitor.online({
                params: {
                    account: data.username,
                    ent_code: 'oms', //fixed
                    user_name: data.realname,
                    ent_name: '直销部OMS' //fixed
                },
                onSuccess: function() {
                    maysuccess();
                }
            });
        },

        checkInput: function() {
            if (this.loginType == 'user') {
                this.inputValid = this._checkUserInput();
            } else if (this.loginType == 'mobile') {
                this.inputValid = this._checkMobileInput();
            } else {
                this.inputValid = false;
            }
            this.inputValid = true;
        },

        _checkUserInput: function() {
            var valid = this.validators.username(this.model.username) && this.validators.password(this.model.password);
            $('#userlogin-btn').prop('disabled', !valid);
            return valid;
        },

        _checkMobileInput: function() {
            var valid = true;
            if (!this.validators.mobile(this.model.mobile)) {
                valid = false;
                this.mobileValid = false;
                $('#codesend-btn').prop('disabled', true);
            } else {
                valid = true;
                this.mobileValid = true;
                if (!this.waitingRoller) {
                    $('#codesend-btn').prop('disabled', false);
                }
            }
            if (!this.validators.vercode(this.model.vercode)) {
                valid = false;
            }
            $('#mobilelogin-btn').prop('disabled', !valid);
            return valid;
        },

        initBar: function() {
            ddbanner.changeBannerTitle('登录');
            //登录页面返回，直接关闭页面
            dd.biz.navigation.setLeft({
                visible: false,
                show: false,
                control: false,
                text: '',
                onSuccess: function() {
                    dd.biz.navigation.close();
                }
            });
            document.addEventListener('backbutton', function(event) {
                event.preventDefault();
                hq.biz.navigation.close();
            });
            ddbanner.changeBannerRight('', false);
        },

        bindEvents: function() {
            var self = this;
            $('.form-switch [data-formsel]').on('click', function() {
                var $targetform = $($(this).data('formsel'));
                if ($targetform.length) {
                    $('form').hide();
                    $targetform.find('input').each(function() {
                        this.value = '';
                        $(this).trigger('change');
                    });
                    $targetform.show();
                    self.loginType = $targetform.data('type');
                    self.checkInput();
                }
                return false;
            });
            $('form input[data-model]').on('keyup change', function() {
                var name = $(this).data('model');
                if (name) {
                    self.model[name] = $(this).val();
                    self.checkInput();
                }
            });
            $('form').on('submit', this.submit.bind(this));
            $('#codesend-btn').on('click', this.forcode.bind(this));
        },

        initialize: function() {
            this.initBar();
            this.bindEvents();
            // first fire input check
            this.checkInput();
            // 尝试使用 token 登陆，如果无法登陆，则转换到输入框登陆
            this.attemptTokenLogin();
        }
    };

    FastClick.attach(document.body);

    dd.ready(function() {
        page.initialize();
    });
});
