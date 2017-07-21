/**
 * by hecom at 2016/5/6
 */
$(function() {
    'use strict';

    function errorToast(msg, icon, dur) {
        dd.device.notification.toast({
            icon: icon,
            text: msg,
            duration: dur || 1
        });
    }

    function formatHour(d) {
        var fdate = new Date(d),
            hour = fdate.getHours(),
            mite = fdate.getMinutes();
        return (hour<10?('0'+hour):hour)+':'+(mite<10?('0'+mite):mite);
    }

    var page = {
        user: null,
        train: null,

        loadTrain: function() {
            var rId = getUrlParam('rId');
            if (!$.trim(rId).length) {
               errorToast('参数错误');
               window.history.back();
            }
            var params = {
                omsuid: this.user.id,
                token: this.user.token,
                tid: rId
            }
            var self = this;
            $.ajax({
                type: 'POST',
                url: oms_config.apiUrl + oms_apiList.getTrainData,
                // url: 'mock/trainDescribe.json',
                data: params,
                cache: false,
                dataType: 'json'
            }).always(function(resp) {
                if ('res' in resp) {
                    if (resp.res === 1) {
                        self.train = resp.data;
                        return self.render();
                    }
                }
                errorToast('未找到详情');
                window.history.back();
            });
        },

        ossImageUrl: function(url) {
            return url.replace('oss-cn-', 'img-cn-');
        },

        thumbnail: function(url) {
            return url + '@100w_100h_1e_1c_70q_1l_1sh.jpg';
        },

        previewurl: function(url) {
            return url + '@_70q.jpg';
        },

        render: function() {
            // model-bind
            var self = this, $models = $('[data-model]');
            function pick_as_string(obj, prop) {
                var value = obj[prop],
                    value_str;
                if (value) {
                    if ($.isArray(value)) {
                        value_str = value.join('、');
                    } else {
                        value_str = String(value);
                    }
                } else {
                    value_str = '';
                }
                return value_str;
            }
            $models.each(function() {
                var is_input = this.tagName == 'INPUT' || this.tagName == 'TEXTAREA';
                var prop = $(this).data('model'),
                    value_str = pick_as_string(self.train.info, prop);
                if (is_input) {
                    $(this).val(value_str);
                } else {
                    $(this).text(value_str);
                }
            });
            this.fixRender();
            if (this.train.question && this.train.question.length) {
                this.renderQues();
            }
        },

        fixRender: function() {
            function datetime_str(dt) {
                return formatStamp(dt.getTime(), 1)+' '+formatHour(dt);
            }
            // createtime
            $('[data-model="create_time"]').text(datetime_str(new Date(this.train.info.ctime*1000)));
            // visittime
            var start_date = new Date(this.train.info.actual_visit_time*1000),
                end_date = new Date(this.train.info.finish_time*1000),
                live_times = ~~((start_date.getTime()-end_date.getTime())/1000);
            var $visit_time = $('[data-model="visit_time"]');
            if (isNaN(start_date.valueOf()) || isNaN(end_date.valueOf())) {
                $visit_time.val('Invalid Date');
            } else {
                if (start_date.getDay() != end_date.getDay() || live_times>86400) {
                    $visit_time.val(datetime_str(start_date));
                    var $visit_time_line = $visit_time.closest('.ui-form-item'),
                        $after_time_line = $visit_time_line.clone();
                    $visit_time_line.find('label').text('开始时间');
                    $after_time_line.find('label').text('结束时间');
                    $after_time_line.find('[data-model="visit_time"]').val(datetime_str(end_date));
                    $visit_time.closest('.ui-form-item').after($after_time_line);
                } else {
                    $visit_time.val(datetime_str(start_date)+'-'+formatHour(end_date));
                }
            }
            function remove_modelitem(selector) {
                $(selector).closest('.ui-form-item').first().remove();
            }
            // boss_reason
            if (this.train.info.boss_reason == '') {
                remove_modelitem('[data-model="boss_reason"]');
            }
            // state
            if (this.train.info.state=='1') {
                $('[data-model="state"]').val('有');
                remove_modelitem('[data-model="no_need_reason"]');
            } else {
                $('[data-model="state"]').val('无');
                remove_modelitem('[data-model="need_content"]');
            }
            // is_renew
            if (this.train.info.is_renew=='1') {
                $('[data-model="is_renew"]').val('有');
                remove_modelitem('[data-model="no_renew_reason"]');
            } else {
                $('[data-model="is_renew"]').val('无');
            }
        },

        renderQues: function() {
            var scope = this;
            var $wraper = $('#traind_que_wraper'), $list = $wraper.find('.list');
            var _tpl = $('#train-que-repeator').html();
            var _compiled_tpl = juicer(_tpl);
            juicer.register('thumbnail', this.thumbnail);
            juicer.register('previewurl', this.previewurl);
            // tpl
            $.each(this.train.question, function(i, que) {
                if (!que.cate) {
                    que.cate = '未选择';
                }
                $.each(que.images, function(j, img) {
                    que.images[j] = scope.ossImageUrl(img);
                });
                $list.append(_compiled_tpl.render(que));
            });
            $wraper.show();
            // preview
            $wraper.on('tap', 'img', function() {
                var $image = $(this), images = [];
                $image.closest('.ui-form-camera').find('img').each(function() {
                    images.push(this.getAttribute('ori-src'));
                });
                if (images.length) {
                    dd.biz.util.previewImage({
                        urls: images,
                        current: $image.attr('ori-src')
                    });
                }
            });
        },

        init: function(user) {
            this.user = user;
            ddbanner.changeBannerTitle('培训详情');
            ddbanner.changeBannerLeft();
            ddbanner.changeBannerRight('', false);
            this.loadTrain();
        }
    }

    dd.ready(function() {
        var loginApi = oms_config.apiUrl + oms_apiList.login;
        new Login(oms_config.corpId, oms_config.baseUrl, loginApi, function() {
            var omsUserJson = getCookie('omsUser'),
                omsUser;
            if (omsUserJson) {
                omsUser = JSON.parse(omsUserJson);
                if (omsUser) {
                    page.init(omsUser);
                }
            }
            if (!omsUser) {
                dd.device.notification.alert({
                    message: '请重新登录',
                    onSuccess: function() {
                        dd.biz.navigation.close();
                    }
                });
            }
        });
    });
});
