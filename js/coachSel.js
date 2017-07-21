var __$$customerSelVersion = 1;

var coachSelWidget = {
    $el: $('div'),

    mode: 'normal',
    filter: {},
    list: null,
    item: null,
    callback: null,

    _defaultFilter: {
        token: '',
        omsuid: '',
        type: '2', //私海客户
        cusName: ''
    },

    keyword: function(input) {
        if (typeof input == 'string') {
            this.$el.find('.coachSelWidget_form input').val(input);
        }
        return $.trim(this.$el.find('.coachSelWidget_form input').val());
    },

    search: function() {
        var self = this, filter = $.extend({}, this.filter);
        filter.realname = this.keyword();
        if (this.list) {
            this.list.page++;
        } else {
            this.list = [];
            this.list.page = 1;
        }
        filter.page = this.list.page;
        this.list.loading = true;
        OMS_COM.ajaxPost({
            api: 'searchCoach',
            data: filter,
            success: function (data) {
                console.log(data);
                var res = JSON.parse(data);
                console.log(res);
                if(parseInt(res.code)===0){
                    self.renderResult(res.data);
                    console.log('after call renderResult');
                    self.list.loading = false;
                    if (data.length < 20) {
                        self.list.gameover = true;
                    }
                }else{
                    self.list.loading = false;
                    self.list.gameover = true;
                    dd.device.notification.toast({icon: 'error', text: msg||'获取客户列表失败', duration: 1});
                }
            },
            error: function () {
                self.list.loading = false;
                self.list.gameover = true;
                dd.device.notification.toast({icon: 'error', text: msg||'获取客户列表失败', duration: 1});
            },
            always: function () {
                self.$el.find('.coachSelWidget_loading').hide();
            }
        });
        console.log('in search');
        // return $.ajax({
        //     type: 'POST',
        //     url: oms_config.apiUrl+oms_apiList.getCustomers,
        //     data: filter,
        //     dataType: 'json',
        //     cache: false,
        //     success: function(resp, status, xhr) {
        //         var data = resp.data;
        //         if (resp.res === 1) {
        //             self.renderResult(data);
        //             self.list.loading = false;
        //             if (data.length < 20) {
        //                 self.list.gameover = true;
        //             }
        //         } else {
        //             onerror(xhr, resp.msg);
        //         }
        //     },
        //     error: onerror
        // });
        function onerror(xhr, msg) {
            self.list.loading = false;
            self.list.gameover = true;
            dd.device.notification.toast({icon: 'error', text: msg||'获取客户列表失败', duration: 1});
        }
    },

    resetResult: function() {
        this.list = null;
        this.$el.find('.coachSelWidget_result').empty();
        this.$el.find('.coachSelWidget_loading').hide();
        this.$el.find('.coachSelWidget_noresult').hide();
    },

    renderResult: function(data) {
        var self = this, html = '';
        $.each(data, function(i, item) {
            self.list.push(item);
            html += self.renderItem(item, self.list.length-1);
        });
        if (this.list && this.list.length) {
            this.$el.find('.coachSelWidget_result').append(html);
        } else {
            if (html) {
                this.$el.find('.coachSelWidget_result').html(html);
            } else {
                this.$el.find('.coachSelWidget_noresult').show();
            }
        }
    },

    renderItem: function(item, _idx) {
        console.log(item);
        console.log(_idx);
        console.log(item.id);
        var li = '<li class="ui-border-b" data-idx="'+_idx+'">'
               + '    <h1 class="ui-nowrap" style="color:#222222; font-size:16px;">'+item.realname+'</h1>'
               + '</li>';
        return li;
    },

    reset: function(mode, filter, callback) {
        if (typeof mode == 'function') {
            callback = mode;
            mode = 'normal';
            filter = {};
        }
        if (typeof callback != 'function') {
            callback = function(){};
        }
        $.extend(this, {
            mode: mode,
            filter: $.extend({}, coachSelWidget._defaultFilter, filter),
            callback: callback
        });
        this.list = null;
        this.item = null;
    },

    loading: function() {
        var self = this;
        this.resetResult();
        this.$el.find('.coachSelWidget_loading').show();
        console.log('in loading');
        // this.search().always(function() {
        //     self.$el.find('.coachSelWidget_loading').hide();
        // });
        this.search();
    },

    loadingMore: function() {
        if (!this.list)
            return;
        if (this.list.loading || this.list.gameover)
            return;
        var $loadingm = $('<li class="ui-border-b"><p style="text-align:center;"><i class="ui-loading"></i></p></li>');
        $loadingm.appendTo(this.$el.find('.coachSelWidget_result'));
        this.search().always(function() {
            $loadingm.remove();
        });
    },

    togglePanel: function(tosearch) {
        if (tosearch) {
            this.$el.find('.coachSelWidget_search').hide();
            this.$el.find('.coachSelWidget_result').show();
        } else {
            var input = this.keyword();
            this.$el.find('.coachSelWidget_result').hide();
            if (input.length) {
                this.$el.find('.coachSelWidget_search').show();
                this.$el.find('.coachSelWidget_searchTxt').text(input);
            } else {
                this.$el.find('.coachSelWidget_search').hide();
            }
            console.log('to here');
            this.$el.find('.coachSelWidget_noresult').hide();
        }
    },

    selectItem: function(event) {
        var $li = $(this), self = coachSelWidget;
        var $searchresult = self.$el.find('.coachSelWidget_result'),
            itemIdx = parseInt($li.data('idx'), 10);
        if (self.list && self.list[itemIdx]) {
            self.item = self.list[itemIdx];
        }
        var pre$liIdx = parseInt($searchresult.data('idx'), 10);
        if (pre$liIdx >= 0) {
            $searchresult.children().eq(pre$liIdx).removeClass('active');
        }
        $li.addClass('active');
        $searchresult.data('idx', $li.index());
        // close?
        if (self.mode == 'normal') {
            self.close();
        }
        return false;
    },

    bindEvents: function() {
        var self = this;
        // input
        var $searchform = this.$el.find('.coachSelWidget_form');
        function redosearch() {
            self.togglePanel(true);
            self.loading();
            if (!self.keyword().length) {
                $searchform.find('input').blur();
                $searchform.find('.coachSelWidget_input').removeClass('focus');
            }
        }
        $searchform.on('submit', function(e) {
            redosearch();
            return false;
        });
        $searchform.find('.coachSelWidget_input').on('tap', function() {
            $(this).addClass('focus');
            $searchform.find('input').focus();
            return false;
        });
        $searchform.find('.ui-icon-close').on('tap', function() {
            self.keyword('');
            $searchform.find('input').focus();
            return false;
        });
        $searchform.find('.ui-searchbar-cancel').on('tap', function() {
            self.close(false);
            return false;
        });
        // select
        this.$el.find('.coachSelWidget_result').on('click', 'li', this.selectItem);
        // scroll loadingMore
        $(window).off('scroll').on("scroll", function() {
            if ($(window).scrollTop()+$(window).height() >= $(document).height()) {
                self.loadingMore();
            }
        });
    },

    render: function(){
        var html = '';
        html += '<div id="coachSelWidget_wrapper">';
        html += '    <form class="coachSelWidget_form">';
        html += '        <div class="coachSelWidget_input ui-searchbar-wrap ui-border-b">';
        html += '           <div class="ui-searchbar ui-border-radius">';
        html += '               <i class="ui-icon-search"></i>';
        html += '               <div class="ui-searchbar-text">搜索</div>';
        html += '               <div class="ui-searchbar-input">';
        html += '                   <input type="search" placeholder="搜索" autocapitalize="off">';
        html += '               </div>';
        html += '               <i class="ui-icon-close"></i>';
        html += '           </div>';
        html += '           <button type="button" class="ui-searchbar-cancel">取消</button>';
        html += '        </div>';
        html += '    </form>';
        html += '    <div class="coachSelWidget_search" style="display:none">';
        html += '        <ul class="ui-list ui-list-link ui-border-tb">';
        html += '           <li class="ui-border-t">';
        html += '              <div><i class="ui-icon-search"></i></div>';
        html += '              <div class="ui-list-info">';
        html += '                 <h4 class="ui-nowrap">搜索“<span class="coachSelWidget_searchTxt" style="color:#e15151;"></span>”</h4>';
        html += '              </div>';
        html += '          </li>';
        html += '       </ul>';
        html += '    </div>';
        html += '    <div class="coachSelWidget_loading ui-center" style="display:none;">';
        html += '        <div class="ui-loading-wrap">';
        html += '            <i class="ui-loading"></i>';
        html += '        </div>';
        html += '    </div>';
        html += '    <div class="coachSelWidget_noresult ui-center" style="display:none;">';
        html += '        <p>没有找到相关客户</p>';
        html += '    </div>';
        html += '    <ul class="ui-list ui-list-text ui-list-one coachSelWidget_result"></ul>';
        html += '</div>';
        this.$el = $(html).appendTo(document.body);
    },

    initNav: function() {
        var self = this;
        dd.ready(function() {
            dd.biz.navigation.setTitle({title: '选择私教'});
            if (self.mode == 'normal') {
                dd.biz.navigation.setRight({
                    show: false,
                    control: false,
                    onSuccess: function() {}
                })
            } else {
                dd.biz.navigation.setRight({
                    show: true,
                    control: true,
                    text: '确定',
                    onSuccess: function() {
                        self.close();
                    }
                });
            }
            if (dd.ios) {
                dd.biz.navigation.setLeft({
                    show: true,
                    control: true,
                    onSuccess: function() {
                        self.close(false);
                    }
                });
            } else {
                $(document).off('backbutton');
                $(document).on('backbutton', function(event) {
                    event.preventDefault();
                    self.close(false);
                });
            }
        });
    },

    resetNav: function() {
        var self = this;
        dd.ready(function() {
            dd.biz.navigation.setTitle({title: ''});
            dd.biz.navigation.setRight({
                show: false,
                control: false
            });
            if (dd.ios) {
                dd.biz.navigation.setLeft({
                    show: false,
                    control: false
                });
            } else {
                $(document).off('backbutton');
            }
        });
    },

    destroy: function() {
        this.resetNav();
        $(window).off('scroll');
        this.$el.remove();
    },

    close: function(result) {
        this.destroy();
        $('#main-body').show();
        if (result === false) {
            this.callback();
        } else {
            this.callback(this.item);
        }
    },

    active: function(mode, filter, callback) {
        this.reset(mode, filter, callback);
        $('#main-body').hide();
        this.render();
        this.initNav();
        this.loading();
        this.bindEvents();
    }
};
