/**
 * by hecom at 2016/4/29
 */
(function(exports) {
  'use strict';

  function httpfailError(onerror) {
    if (typeof onerror != 'function') {
      onerror = function(){};
    }
    return function(xhr, errorType, error) {
      onerror(xhr, errorType, error);
      var errorinfo = xhr.status+'|'+errorType+'|'+error;
      dd.device.notification.toast({
        icon: 'error',
        text: '网络请求失败:'+errorinfo,
        duration: 5
      });
    }
  }

  var config = oms_config, headers;

  var globalSearchStore = {

    HISTORY_KEY: 'global.search.keywords',

    CUSTOMER_TYPE_CONFIG: [
      {
        name: '公海',
        value: '1',
        pullable: true
      },
      {
        name: '私海',
        value: '2',
        pullable: false
      },
      {
        name: '开放池',
        value: '3',
        pullable: true
      },
      {
        name: '待定池',
        value: '4',
        pullable: false
      }
    ],

    POSITION_CONFIG: [
      {
        title: '业务员',
        value: '61'
      },
      {
        title: '部门经理',
        value: '60'
      },
      {
        title: '战区经理',
        value: '59'
      },
      {
        title: '城市经理',
        value: '68'
      },
      {
        title: '大区总监',
        value: '3'
      },
      {
        title: '销售总监',
        value: '57'
      },
      {
        title: '政委',
        value: '185'
      },
      {
        title: '开户专员',
        value: '90'
      },
      {
        title: '人事管理',
        value: '77'
      }
    ],

    setToken: function(uid, token) {
      headers = {
        omsuid: uid,
        token: token
      }
    },

    pullCustomer: function(params, onsuccess, onerror) {
      var data = $.extend({}, headers, params);
      return $.ajax({
        type: 'POST',
        url: config.apiUrl + oms_apiList.pullCustomer,
        data: data,
        cache: false,
        dataType: 'json',
        success: onsuccess,
        error: httpfailError(onerror)
      });
    },

    search: function(params, onsuccess, onerror) {
      var data = $.extend({}, headers, params);
      return $.ajax({
        type: 'POST',
        url: config.apiUrl + oms_apiList.search,
        // url: 'mock/globalSearch.json',
        data: data,
        cache: false,
        dataType: 'json',
        success: onsuccess,
        error: httpfailError(onerror)
      });
    },

    keywords: function() {
      var keywords = [], str = localStorage.getItem(this.HISTORY_KEY);
      console.log(str);
      try {
        keywords = JSON.parse(str);
        if (!$.isArray(keywords)) {
          keywords = [];
          throw new Error('invalid type, should be [Array]');
        }
      } catch(e) {
        console.log(e);
        localStorage.removeItem(this.HISTORY_KEY);
      }
      return keywords;
    },

    setKeywords: function(words) {
      words = $.isArray(words) ? words : [];
      if (words.length) {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(words));
      }
    }
  };

  var uniqArray = function(array) {
    var newArray = [], tmpObj = {}, value;
    if (array && array.length) {
      for (var i = 0, l = array.length; i < l; i++) {
        value = array[i];
        if (typeof value == 'string' || typeof value == 'number') {
          if (!(value in tmpObj)) {
            tmpObj[value] = true;
            newArray.push(value);
          }
        } else {
          newArray.push(value);
        }
      }
    }
    return newArray;
  };

  exports.globalSearchPage = new Vue({

    data: {
      user: null,
      insearch: false,
      searchbar: {
        opened: false,
        keyword: '',
        placeholder: '搜索客户名称、客户联系人'
      },
      showTip: false,
      searchUser: false,
      data: {
        loading: false,
        history: [],
        customers: [],
        contactors: [],
        users: []
      },
      visibles: [] // visible panels
    },

    watch: {

      'insearch': function() {
        this.updateVisibles();
      },
    },

    methods: {

      ready: function(user) {
        this.user = user;
        globalSearchStore.setToken(this.user.id, this.user.token);
        this.data.history = globalSearchStore.keywords();
        this.showTip = false;
        var flag = window.localStorage.getItem('global.search.first');
        if (!flag || flag == 'true') {
          this.showTip = true;
        }
        window.localStorage.setItem('global.search.first', 'false');
        // Leader级别可以检索下属
        if (this.user.role == '1' || this.user.role == '4' || this.user.role == '5') {
          this.searchUser = true;
          this.searchbar.placeholder = '搜索客户名称、客户联系人、业务员';
        }
        this.initNav();
        this.$nextTick(function() {
          this.updateVisibles();
          if (this.showTip == true || this.data.history.length == 0) {
            // this.searchbar.opened = true;
            this.activeSearch();
            setTimeout(function() {
              $('.ui-searchbar input').blur().focus();
            }, 500);
          }
        });
      },

      initNav: function() {
        var self = this;
        ddbanner.changeBannerTitle('检索');
        // ddbanner.resetBannerLeft(); //not work
        ddbanner.changeBannerLeft();
        //omsapp-android-setLeft-visible:true
        if (dd.android) {
          dd.biz.navigation.setLeft({
            visible: true,
            control: false,
            text: ''
          });
        }
        ddbanner.changeBannerRight('检索', false);
      },

      search: function(keyword) {
        var self = this;
        if (keyword && keyword.length) {
          self.insearch = null;
          return globalSearchStore.search({keyword: keyword}, function(resp) {
            var data = resp.data;
            if (resp.res === 1) {
              // user.areaid update
              self.user.areaid = data.isarea;
              // END
              var customers = [];
              $.each(data.customers, function(i, item) {
                customers.push(item);
              });
              if (customers.length > 3) {
                customers.folded = true;
                customers.limit = 3;
              } else {
                customers.folded = false;
                customers.limit = customers.length;
              }
              self.data.customers = customers;
              var contactors = [];
              $.each(data.contactors, function(i, item) {
                contactors.push(item);
              });
              if (contactors.length > 2) {
                contactors.folded = true;
                contactors.limit = 2;
              } else {
                contactors.folded = false;
                contactors.limit = contactors.length;
              }
              self.data.contactors = contactors;
              if (self.searchUser) {
                var users = [];
                $.each(data.users, function(i, item) {
                  users.push(item);
                });
                users.folded = false;
                users.limit = users.length;
                self.data.users = users;
              }
            }
            self.insearch = true;
          });
        }
      },

      more: function(type, keyword, list) {
        var self = this, params;
        list.page = list.page || 1;
        list.page++; // more from newPageNum
        params = {
          type: type,
          keyword: keyword,
          page: list.page
        };
        list.loading = true;
        return globalSearchStore.search(params, function(resp) {
          var data = resp.data, mergeingList;
          if (resp.res === 1) {
            mergeingList = type == 'customer' ? data.customers : data.contactors;
            $.each(mergeingList || [], function(i, item) {
              list.push(item);
            });
            list.loading = false;
            if (mergeingList.length < 10) {
              list.gameover = true;
            }
            list.limit = list.length;
          }
        });
      },

      showMore: function(type, list, panel) {
        list.folded = false;
        list.limit = list.length;
        list.$set(list.length-1, $.extend({}, list[list.length-1])); // copy last item, for focus $digest
        var self = this;
        var $panel = $(panel), $container = $panel.find('.ui-panel-body'), $ul = $panel.find('.ui-list');
        if ($panel.length) {
          this.$nextTick(function(e, force/*force loadMore*/) {
            $container.height($(window).height() - 85);
            $container
              .off('scroll')
              .on('scroll', function() {
                if (list.loading || list.gameover)
                  return;
                if ($container.scrollTop()+$container.height() >= $ul.height()-1 || force) {
                  var $loadingm = $('<div class="ui-loading-wrap"><p>加载中...</p><i class="ui-loading"></i></div>').appendTo($container);
                  self.more(type, self.searchbar.keyword, list).always(function() {
                    if (list.gameover) {
                      $loadingm.empty().html('<p><small>无更多相关信息</small></p>');
                    } else {
                      $loadingm.remove();
                    }
                  });
                }
              });
            if ($ul.height() < $container.height()) {
              $container.trigger('scroll', [true]);
            }
          });
          if (type == 'customer') {
            this.visibles.$remove('contactorsPanel');
            this.visibles.$remove('usersPanel');
          } else {
            this.visibles.$remove('customersPanel');
            this.visibles.$remove('usersPanel');
          }
        }
      },

      pull: function(customer) {
        dd.device.notification.confirm({
          message: "确认将此客户拉入私海？",
          title: "提示",
          buttonLabels: ["确定", "取消"],
          onSuccess: function(result) {
            if (result.buttonIndex===0) {
              dd.device.notification.showPreloader({text: '使劲拉入中...'});
              globalSearchStore.pullCustomer({cusid: customer.id}, function(result) {
                dd.device.notification.hidePreloader();
                if (result.res === 1) {
                  dd.device.notification.alert({
                    message: "期待你再多一次成单，加油！",
                    title: "拉入成功",
                    buttonName: "好的",
                    onSuccess: function() {
                      openLink(oms_config.baseUrl+'customerInfo.html?code='+customer.id+'&from=private&jumpType=close', true);
                    }
                  });
                } else {
                  dd.device.notification.toast({text: result.msg || '网络请求失败', icon: 'error', duration: 2});
                }
              });
            }
          }
        });
      },

      open: function(customer) {
        var frommap = {
          '1': 'public',  //公海
          '2': 'private', //私海
          '3': 'public',  //开放池
          //'4': 'public'  //待定-XXXX
        };
        if (customer && customer.detailPriv === 1) {
          // 待定客户，暂不处理
          if (customer.type != '4') {
            var fromArg = '&from='+frommap[customer.type] || 'public';
            var leaderPrivArg = '';
            if (customer.type == '2'
                && (customer.ownerid == this.user.id || customer.renew_ownerid == this.user.id)) {
              leaderPrivArg = '&leaderPriv=1';
            }
            openLink(oms_config.baseUrl+'customerInfo.html?code='+customer.id+fromArg+leaderPrivArg+'&jumpType=close', true);
          }
        }
      },

      openProfile: function(user) {
        if (user.id) {
          var _do = '0';
          if (user.path.indexOf('续签')) {
            _do = '1';
          }
          openLink(oms_config.baseUrl+'profile.html?id='+user.id+'&do='+_do+'&jumpType=close', true);
        }
      },

      newCustomerBy: function() {
        var name = $.trim(this.searchbar.keyword);
        if (name.length) {
          openLink('customerAdd.html?code=new&name='+name);
        }
      },

      pullAble: function(customer) {
        var type = String(customer.type), typeObj;
        // 非新签业务员不能操作客户
        if (this.user.role !== 3) {
          return false;
        }
        // 业务员、客户相同区域
        if (this.user.areaid != customer.isarea) {
          return false;
        }
        globalSearchStore.CUSTOMER_TYPE_CONFIG.forEach(function(obj) {
          if (obj.value == type) {
            return typeObj = obj;
          }
        });
        return typeObj && typeObj.pullable;
      },

      activeSearch: function(input) {
        input = $.trim(input);
        if (!this.searchbar.opened) {
          this.searchbar.opened = true;
          if (!input) {
            this.$nextTick(function() {
              $('.ui-searchbar input').focus();
            });
          }
        }
        if (input.length) {
          this.searchbar.keyword = input;
          this.redoSearch();
        }
      },

      redoSearch: function(event) {
        var keyword = $.trim(this.searchbar.keyword);
        if (keyword.length) {
          this.search(keyword);
        } else {
          this.insearch = false;
        }
        this.recordKeyword(keyword);
        $('.ui-searchbar-wrap input').blur();
        event && event.preventDefault();
        return false;
      },

      recordKeyword: function(input) {
        input = $.trim(input);
        if (input.length) {
          this.data.history.unshift(input);
          this.data.history = uniqArray(this.data.history).slice(0, 5);
          globalSearchStore.setKeywords(this.data.history);
        }
      },

      updateVisibles: function() {
        this.visibles = [];
        if (this.insearch) {
          if (this.data.customers && this.data.customers.length) {
            this.visibles.push('customersPanel');
          }
          if (this.data.contactors && this.data.contactors.length) {
            this.visibles.push('contactorsPanel');
          }
          if (this.data.users && this.data.users.length) {
            this.visibles.push('usersPanel');
          }
          if (this.visibles.length === 0) {
            if (this.user.role===3) {
              this.visibles.push('maycreatePanel');
            } else {
              this.visibles.push('noresultPanel');
            }
          }
        } else {
          if (this.insearch === null) {
            this.visibles = ['loadingPanel'];
          } else {
            if (this.data.history && this.data.history.length) {
              this.visibles.push('historyPanel');
            }
          }
        }
      }
    },

    filters: {

      typeStringify: function(type) {
        type = String(type);
        var typeObj;
        globalSearchStore.CUSTOMER_TYPE_CONFIG.forEach(function(obj) {
          if (obj.value == type) {
            return typeObj = obj;
          }
        });
        return typeObj && typeObj.name || '待定';
      },

      positionStringify: function(position) {
        var title = '';
        globalSearchStore.POSITION_CONFIG.forEach(function(obj) {
          if (obj.value == position) {
            return title = obj.title;
          }
        });
        return title;
      },

      lastFollowState: function(info) {
        if (typeof info == 'object' && info.cusid) {
          var year = new Date().getFullYear()+'';
          var lastTime = moment(info.last_time, 'YYYY-MM-DD HH:mm:ss');
          var tip = '';
          if (year == lastTime.format('YYYY')) {
            tip += lastTime.format('MM月DD日');
          } else {
            tip += lastTime.format('YYYY年MM月DD日');
          }
          tip += info.realname;
          if (info.type == '1') {
            tip += '添加电话记录';
          } else if (info.type == '2') {
            tip += '添加拜访记录';
          }
          return tip;
        }
        return '无跟进记录';
      }
    }
  });
})(window);

$(function() {
  'use strict';

  var loginApi = oms_config.apiUrl + oms_apiList.login;
  new Login(oms_config.corpId, oms_config.baseUrl, loginApi, function() {
    var omsUserJson = getCookie('omsUser'), omsUser;
    if (omsUserJson) {
      omsUser = JSON.parse(omsUserJson);
      if (omsUser) {
        var page = window.globalSearchPage;
        page.ready(omsUser);
        page.$mount(document.body);
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
