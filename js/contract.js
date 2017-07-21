/**
 * by hecom at 2016/4/29
 */
(function(exports) {
  'use strict';

  var config = oms_config, headers;

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

  exports.contractStore = {

    perPage: 10,

    setToken: function(uid, token) {
      headers = {
        omsuid: uid,
        token: token
      }
    },

    ossImageUrl: function(url) {
      return url.replace('oss-cn-', 'img-cn-');
    },

    basedata: function(onsuccess, onerror) {
      var data = $.extend({}, headers);
      return $.ajax({
        type: 'POST',
        url: config.apiUrl + oms_apiList.getContractBasedata,
        // url: 'mock/contractBasedata.json',
        data: data,
        cache: false,
        dataType: 'json',
        success: onsuccess,
        error: httpfailError(onerror)
      });
    },

    add: function(params, onsuccess, onerror) {
      var data = $.extend({}, headers, params);
      return $.ajax({
        type: 'POST',
        url: config.apiUrl + oms_apiList.addContract,
        data: data,
        cache: false,
        dataType: 'json',
        success: onsuccess,
        error: httpfailError(onerror)
      });
    },

    list: function(params, onsuccess, onerror) {
      var data = $.extend({}, headers, params);
      return $.ajax({
        type: 'POST',
        url: config.apiUrl + oms_apiList.getContractList,
        // url: 'mock/contracts.json',
        data: data,
        cache: false,
        dataType: 'json',
        success: onsuccess,
        error: httpfailError(onerror)
      });
    },

    get: function(params, onsuccess, onerror) {
      var data = $.extend({}, headers, params);
      return $.ajax({
        type: 'POST',
        url: config.apiUrl + oms_apiList.getContractDetail,
        // url: 'mock/contractDetail.json',
        data: data,
        cache: false,
        dataType: 'json',
        success: onsuccess,
        error: httpfailError(onerror)
      });
    },

    getBlankContracts: function(onsuccess, onerror) {
      var data = $.extend({}, headers);
      return $.ajax({
        type: 'POST',
        url: config.apiUrl + oms_apiList.getContractBasedata,
        // url: 'mock/blankContracts.json',
        data: data,
        cache: false,
        dataType: 'json',
        success: onsuccess,
        error: httpfailError(onerror)
      });
    },

    getCustomerInfo: function(params, onsuccess, onerror) {
      var data = $.extend({}, headers, params);
      return $.ajax({
        type: 'POST',
        url: config.apiUrl + oms_apiList.getCustomerInfo,
        data: data,
        cache: false,
        dataType: 'json',
        success: onsuccess,
        error: httpfailError(onerror)
      })
    }
  };
})(window);

(function(exports, contractStore) {
  'use strict';

  exports.contractListPage = Vue.extend({

    // data
    data: function() {
      return {
        user: null,

        header: true,
        tab: 'unreturned', // 'unreturned', 'returned', ''
        searchbar: {
          opened: false,
          keyword: ''
        },
        cusid: null,
        contracts: null
      }
    },

    // computed properties
    // http://vuejs.org/guide/computed.html
    computed: {
      filter: function() {
        var filter = {};
        if (this.tab) {
          filter.type = this.tab;
        }
        if (this.cusid) {
          filter.cusid = this.cusid;
        }
        if (this.searchbar.keyword) {
          filter.keyword = this.searchbar.keyword;
        }
        return filter;
      }
    },

    // watch
    watch: {

      tab: function(val) {
        if (val) {
          this.contracts = null;
          this.load();
          $('.list-wrapper').children('.ui-loading-wrap').remove();
        }
      }
    },

    // methods
    methods: {

      ready: function(user) {
        this.user = user;
        contractStore.setToken(this.user.id, this.user.token);
        if (window.location.search.indexOf('cusid=') > -1) {
          this.cusid = String(getUrlParam('cusid'));
          this.tab = null;
          this.header = false;
        }
        var self = this;
        this.$nextTick(function() {
          self.load();
        });
        this.initNav();
      },

      initNav: function() {
        var self = this;
        ddbanner.changeBannerTitle('合同');
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
        ddbanner.changeBannerRight('新增', true, function() {
          self.toNew();
        });
      },

      load: function() {
        var self = this;
        var page = this.contracts && this.contracts.page || 1;
        var params = $.extend({}, this.filter, {
          page: page,
          pageSize: contractStore.perPage
        });
        var contracts = this.contracts || [];
        contracts.loading = true;
        return contractStore.list(params, function(resp) {
          var data = resp.data;
          if (resp.res === 1) {
            if (page === 1) {
              $.extend(contracts, {
                total_item: data.total_item,
                total_htmoney: parseInt(data.total_htmoney, 10),
                total_returnmoney: parseInt(data.total_returnmoney, 10)
              });
            }
            contracts.page = page;
            $.each(data.list, function(i, item) {
              contracts.push(item);
            });
            contracts.loading = false;
            if (data.list.length < contractStore.perPage) {
              contracts.gameover = true;
            }
            self.contracts = contracts;
            if (self.contracts.length) {
              contracts.$set(contracts.length-1, $.extend({}, contracts[contracts.length-1])); // last copy, focus digest
            }
          } else {
            dd.device.notification.toast({text: res.msg || '网络请求失败'});
          }
        });
      },

      pullUp: function() {
        var $container = $('.list-wrapper'), $ul = $container.find('.ui-list');
        if ($container.length && this.contracts) {
          if (this.contracts.loading || this.contracts.gameover)
            return;
          if ($container.scrollTop()+$container.height() >= $ul.height()+35) {
            var $loadingm = $('<div class="ui-loading-wrap"><p>加载中...</p><i class="ui-loading"></i></div>').appendTo($container);
            var self = this;
            this.contracts.page++;
            this.load().always(function() {
              if (self.contracts.gameover) {
                $loadingm.empty().html('<p>无更多合同信息</p>');
              } else {
                $loadingm.remove();
              }
            });
          }
        }
      },

      toNew: function() {
        var link = 'contractAdd.html';
        if (self.cusid) {
          link = link+'?cusid='+self.cusid;
        }
        contractStore.getBlankContracts(function(resp) {
          var data = resp.data;
          if (data.contract_nos && data.contract_nos.length) {
            openLink(link);
          } else {
            dd.device.notification.alert({
              title: '无可用合同',
              message: "请在OMS网站申请“空白合同”",
              buttonName: "确定"
            });
          }
        });
      },

      toDetail: function(contract) {
        if (contract && contract.id) {
          openLink('contractInfo.html?conid='+contract.id);
        }
      },

      search: function(event) {
        event.preventDefault();
        this.searchbar.keyword = $.trim(this.searchbar.keyword);
        if (this.searchbar.keyword.length == 0) {
          this.searchbar.opened = false;
        }
        $('.list-wrapper >.ui-loading-wrap').remove();
        this.contracts = null;
        this.load();
        return false;
      },

      activeSearch: function() {
        if (this.searchbar.opened) {
          return;
        }
        this.searchbar.opened = true;
        this.searchbar.keyword = '';
        this.$nextTick(function() {
          $('.ui-searchbar input').focus();
        });
      }
    },

    // filters
    filters: {
      auditStringify: function(flg) {
        flg = String(flg);
        if (flg == '1') {
          return '已审核';
        } else if (flg == '2') {
          return '已驳回';
        } else {
          return '未审核';
        }
      }
    },

    attached: function() {
      $('.ui-container .list-wrapper').height($(window).height() - 80);
    }
  });
})(window, window.contractStore);

(function(exports, contractStore) {
  'use strict';

  exports.contractInfoPage = Vue.extend({

    // data
    data: function() {
      return {
        user: null,

        title: '---',
        htmoney: 0,
        contract: null,

        tabScroller: null
      }
    },

    // methods
    methods: {

      ready: function(user) {
        this.user = user;
        contractStore.setToken(this.user.id, this.user.token);
        var self = this;
        this.$nextTick(function() {
          self.load(getUrlParam('conid'));
        });
        this.initNav();
      },

      initNav: function() {
        var self = this;
        ddbanner.changeBannerTitle('合同详情');
        // ddbanner.resetBannerLeft(); //not work
        ddbanner.changeBannerLeft();
        ddbanner.changeBannerRight('确定', false);
      },

      load: function(id) {
        id = $.trim(String(id));
        if (!id.length)
          return;
        var self = this;
        return contractStore.get({conid: id}, function(resp) {
          var data = resp.data;
          if (resp.res === 1) {
            self.contract = $.extend({}, data);
            self.title = data.contractname;
            self.htmoney = parseInt(data.htmoney, 10);
            if (self.contract.is_standard == '1') {
              self.contract.standard_str = '标准合同';
            } else {
              self.contract.standard_str = '非标准化合同';
            }
            var imageurls = [];
            $.each(self.contract.imageurls, function(i, url) {
              imageurls.push(contractStore.ossImageUrl(url));
            })
            self.contract.imageurls = imageurls;
            self.$nextTick(function() {
              this.tabScroller && this.tabScroller.refresh();
            });
          } else {
            dd.device.notification.toast({text: res.msg || '网络请求失败'});
          }
        });
      },

      preview: function(url) {
        var urls = [];
        // ossImager = this.filter('ossImage');
        function ossImager(url) {
          return url + '@_70q.jpg';
        }
        for (var i = 0; i < this.contract.imageurls.length; i++) {
          urls.push(ossImager(this.contract.imageurls[i]));
        }
        dd.biz.util.previewImage({
          urls: urls,
          current: ossImager(url)
        });
      }
    },

    // filters
    filters: {
      thumb: function(url) {
        // 100x100 自动裁剪 开启锐化
        return url + '@100w_100h_1e_1c_70q_1l_1sh.jpg';
        // return 'http://placeholder.qiniudn.com/100x100';
      },
      ossImage: function(url) {
        // 质量70 webp格式
        return url + '@_70q.jpg';
      },
      auditStringify: function(flg) {
        flg = String(flg);
        if (flg == '1') {
          return '已审核';
        } else if (flg == '2') {
          return '已驳回';
        } else {
          return '未审核';
        }
      }
    },

    attached: function() {
      this.tabScroller = new fz.Scroll('.ui-tab', {
        role: 'tab',
        autoplay: false,
        bounce: false,
      });
    },

    beforeDestroy: function() {
      this.tabScroller && this.tabScroller.destroy();
    }
  });
})(window, window.contractStore);

(function(exports) {
  'use strict';

  var _basePrice = {
    '3.0行业版': 900,
    '3.0标准版': 900,
    '3.0基础版': 900,
    '红圈钉钉': 5900,
    '红圈钉钉高级版': 19800,
    '红圈营销4.0': 19800,
    '红圈营销4.3.0': 35400,
    '大型客户': 50000
    // '红圈管理': 0,
    // '红圈营销': 0,
    // '红圈分析': 0
  };

  var _valuationRule = {
    '手持服务': __hqyxMobileRule,
    '车载服务': __hqyxCarGPSRule,
    '__default__': __baseRule,
  };

  function _lowestYearsFromMonths(months) {
    return Math.ceil(months/12);
  }

  function _multiAmountor(num, price) {
    var num = parseInt(num, 10), price = parseInt(price, 10);
    if (!isNaN(num) && !isNaN(price)) {
      return num*price;
    }
    return 0;
  }

  function _yearlyAmountor(num, price, year) {
    return function(num, price) {
      return _multiAmountor(year, price);
    }
  }

  function _isYearlyPayProduct(prod) {
    return $.inArray(prod, ['红圈钉钉', '红圈钉钉高级版', '红圈营销4.0', '红圈营销4.3.0', '大型客户'])>-1;
  }

  function _ruleConfigGenerator(number, numberFix, price, priceFix, amountor, amountFix) {
    var config = {
      number: number,
      number$$fixed: numberFix,
      price: price,
      price$$fixed: priceFix,
      amount: void 0,
      amount$$fixed: amountFix
    }
    if (typeof amountor == 'function') {
      config.amountor = amountor;
    } else if (typeof amountor == 'number') {
      config.amount = amountor;
    } else {
      throw new Error('valuation rule: need amountor.');
    }
    return config;
  }

  function __baseRule() {
    return _ruleConfigGenerator(null, false, null, false, _multiAmountor, true);
  }

  function __yearlyRule(prod, type, months) {
    if (_isYearlyPayProduct(prod)) {
      var price = _basePrice[prod], months = parseInt(months, 10);
      if (isNaN(months)) {
        months = 1;
      }
      if (price) {
        var amountor = _yearlyAmountor(1, price, _lowestYearsFromMonths(months));
        return _ruleConfigGenerator(1, true, price, true, amountor, true);
      }
    }
    return __baseRule();
  }

  // function __hqddRule(prod, type, months) {
  //   if (!_isProductInDD(prod))
  //     return __baseRule();
  //   var price = _basePrice[prod], months = parseInt(months, 10);
  //   if (isNaN(months)) {
  //     months = 1;
  //   }
  //   if (price) {
  //     var onePrice = price*_lowestYearsFromMonths(months);
  //     return _ruleConfigGenerator(1, true, onePrice, true, onePrice, true);
  //   } else {
  //     return __baseRule();
  //   }
  // }

  function __hqyxMobileRule(prod, type, months) {
    console.log('PPP', prod, type, months);
    if (_isYearlyPayProduct(prod)) {
      return __yearlyRule(prod, type, months);
    }
    var price = _basePrice[prod], months = parseInt(months, 10);
    console.log('+++', months);
    if (isNaN(months)) {
      months = 1;
    }
    if (price) {
      console.log('===', price, months, _lowestYearsFromMonths(months));
      return _ruleConfigGenerator(null, false, price*_lowestYearsFromMonths(months), true, _multiAmountor, true);
    }
    return __baseRule();
  }

  function __hqyxCarGPSRule(prod, type, months) {
    if (_isYearlyPayProduct(prod)) {
      return __yearlyRule(prod, type, months);
    }
    var months = parseInt(months, 10);
    if (isNaN(months)) {
      months = 1;
    }
    var years = _lowestYearsFromMonths(months);
    if (type < '2') {
      return _ruleConfigGenerator(null, false, 240+460*years, true, _multiAmountor, true);
    } else {
      return _ruleConfigGenerator(null, false, 460*years, true, _multiAmountor, true);
    }
  }

  exports.contractServiceValuation = {
    buildRuler: function(name) {
      return _valuationRule[name] || _valuationRule['__default__'];
    }
  }
})(window);

(function(exports, contractStore, contractServiceValuation) {
  'use strict';

  exports.contractFormPage = Vue.extend({

    // data
    data: function() {
      return {
        changed: false,
        submiting: false,
        dict: {
          trades: [{
            key: "食品",
            value: "1"
          }, {
            key: "农牧农业",
            value: "2"
          }, {
            key: "医药医疗",
            value: "3"
          }, {
            key: "汽配汽用",
            value: "4"
          }, {
            key: "服装服饰",
            value: "5"
          }, {
            key: "家装建材",
            value: "6"
          }, {
            key: "家电数码",
            value: "7"
          }, {
            key: "家居家纺",
            value: "8"
          }, {
            key: "美妆日化",
            value: "9"
          }, {
            key: "商务服务",
            value: "10"
          }, {
            key: "日用百货",
            value: "11"
          }, {
            key: "水暖电工",
            value: "12"
          }, {
            key: "童装母婴",
            value: "13"
          }, {
            key: "五金工具",
            value: "14"
          }, {
            key: "化工能源",
            value: "15"
          }, {
            key: "电子仪表",
            value: "16"
          }, {
            key: "包装印刷",
            value: "17"
          }, {
            key: "安防照明",
            value: "18"
          }, {
            key: "纺织皮革",
            value: "19"
          }, {
            key: "橡胶塑料",
            value: "20"
          }, {
            key: "酒店用品",
            value: "21"
          }, {
            key: "机械工业",
            value: "22"
          }, {
            key: "冶金钢材",
            value: "23"
          }, {
            key: "其它",
            value: "24"
          }],
          contract_propertys: [{
            key: "直销",
            value: "直销"
          }],
          contract_types: [{
            key: "续签",
            value: "0"
          },{
            key: "新签",
            value: "1"
          },{
            key: "续费",
            value: "2"
          }],
          new_product_versions: [],
          service_types: []
        },
        user: null,
        customer: null,
        contract: {
          images: [],
          services: []
        },
        blankContracts: null,

        draftId: null,
        draftPoller: null
      }
    },

    // watch
    watch: {
      'contract.cusname': function() {
        // if (!this.contract.new_contract_cusname) {
        this.contract.new_contract_cusname = this.contract.cusname;
        // }
      },
      'contract.period': function() {
        this.calcProductEnddate();
        this.changeServiceRelation();
      },
      'contract.giftperiod': function() {
        this.calcProductEnddate();
      },
      'contract.begindate': function() {
        this.calcProductEnddate();
      },
      'contract.new_product_version': function() {
        this.changeServiceRelation();
      },
      'contract.type': function() {
        this.changeServiceRelation();
      }
    },

    // methods
    methods: {

      ready: function(user) {
        this.user = user;
        contractStore.setToken(this.user.id, this.user.token);
        var self = this;
        this.initNav();
        this.$nextTick(function() {
          $.when(self.initDict(), self.initCustomer()).always(function() {
            self.setDefaults();
            self.restoreDraft();
          });
        });
      },

      initNav: function() {
        var self = this;
        ddbanner.changeBannerTitle('新增合同');
        // ddbanner.resetBannerLeft(); //not work
        // ddbanner.changeBannerLeft();
        function goback() {
            self.changed && self.saveDraft();
            setTimeout(function() {
                window.history.back();
            });
        }
        if (dd.ios) {
          dd.biz.navigation.setLeft({
            control: true,
            onSuccess: goback
          });
        } else {
          $(document).off('backbutton');
          $(document).on('backbutton', function(event) {
            event.preventDefault();
            goback();
          });
        }
        ddbanner.changeBannerRight('确定', true, function() {
          self.submit();
        });
      },

      initDict: function() {
        var self = this;
        function ddsource(values) {
          var sources = [];
          $.each(values, function(i, val) {
            sources.push({key: val, value: val});
          });
          return sources;
        }
        return contractStore.basedata(function(resp) {
          var data = resp.data;
          if (resp.res === 1) {
            // self.dict.contract_propertys = ddsource(data.contract_propertys);
            self.dict.new_product_versions = ddsource(data.new_product_versions);
            self.dict.service_types = data.service_type;
          }
        });
      },

      initCustomer: function() {
        var self = this, cusid = getUrlParam('cusid');
        return contractStore.getCustomerInfo({cusid: cusid}, function(resp) {
          var data = resp.data;
          if (resp.res === 1) {
            self.customer = data.info;
            self.contract.cusid = self.customer.id;
            self.contract.cusname = self.customer.cusname;
            $.each(self.dict.trades, function(i, obj) {
              if (data.info.trade == obj.value) {
                self.customer.trade = obj.value;
                self.customer.trade$$str = obj.key;
                return false;
              }
            });
          }
        });
      },

      draftPolling: function() {
        var self = this;
        this.draftPoller = window.setInterval(function() {
          self.saveDraft();
        }, 3000);
        document.addEventListener('pause', function(e) {
          e.preventDefault();
          self.saveDraft();
        });
      },

      fetchBlanks: function() {
        var self = this;
        return contractStore.getBlankContracts(function(resp) {
          var data = resp.data;
          if (resp.res === 1) {
            self.blankContracts = data.contract_nos || [];
          }
        });
      },

      setDefaults: function() {
        this.contract.standard = '1'; // mustbe standard
        this.contract.new_contract_property = '直销';
        if (this.user.role == '2' /*续签*/) {
          this.contract.type = "0";
          this.contract.type$$str = '续签';
        } else if (this.user.role == '3' /*新签*/) {
          this.contract.type = "1";
          this.contract.type$$str = '新签';
          // 合同类型固定为新签
          this.dict.contract_types = [{
            key: "新签",
            value: "1"
          }];
        }
        this.contract.sign_date = moment().format('YYYY-MM-DD');
        this.contract.begindate = moment().format('YYYY-MM-DD');

        this.contract.services.push({}); //push default one service
      },

      restoreDraft: function() {
        var self = this;
        var draftId = getUrlParam('draftId'), draftObj;
        if (draftId) {
          draftObj = draftWork.get(draftId);
          if (draftObj) {
            self.draftId = draftObj._oid;
            self.contract = $.extend(true, {}, draftObj.record);
            self.$nextTick(function() {
              // 服务类型数据，特殊处理下
              $.each(self.contract.services, function($index, service) {
                $.extend(service, draftObj.record.services[$index]);
                self.buildServiceRule(service, $index);
                self.applyServiceRule(service, $index);
              });
              // 重新验证合同编号
              self.fetchBlanks().always(function() {
                var found = false;
                if (self.blankContracts) {
                  $.each(self.blankContracts, function(i, obj) {
                    if (obj.contract_no == self.contract.contractno) {
                      found = true;
                    }
                  });
                }
                if (!found) {
                  self.contract.contractno = '';
                }
              });
              self.changed = true;
              self.draftPolling();
            });
          }
        }
        if (!draftObj) {
          // draft polling start
          self.$nextTick(function() {
            var unwatch = self.$watch('contract', function() {
              self.changed = true;
              self.draftPolling();
              unwatch();
            }, {deep: true});
          });
        }
      },

      errorToast: function(msg, icon, dur) {
        dd.device.notification.toast({
          icon: icon,
          text: msg,
          duration: dur || 1
        })
      },

      isValueEmpty: function(input) {
        if (typeof input == 'string') {
          return $.trim(input) == '';
        }
        if ($.isArray(input)) {
          return input.length == 0;
        }
        if (typeof input == 'object') {
          var objemp = true;
          for (var key in input) {
            objemp = false;
            break;
          }
          return objemp;
        }
        return !input;
      },

      validate: function() {
        var self = this;
        var validators = {
          'contract.cusid': '请选择录入合同的客户',
          'contract.trade': '请选择行业',
          'contract.linkman': '请填写客户联系人',
          'contract.telephone': '请填写联系电话',
          'contract.new_contract_cusname': '请填写合同名称',
          'contract.contractno': '请选择合同编号，没有则先去OMS网站申请空白合同',
          'contract.new_contract_property': '请选择合同性质',
          'contract.type': '请选择合同类型',
          'contract.sign_date': '请选择签订日期',
          'contract.images': '请上传合同扫描图片',
          'contract.new_product_version': '请选择产品版本',
          'contract.period': function() {
            var period = parseInt(self.contract.period, 10);
            if (isNaN(period) || period == 0) {
              return '请填写购买期限';
            }
            if (period%12 != 0) {
              return '购买期限需是12的倍数';
            }
            return true;
          },
          'contract.giftperiod': function() {
            var giftperiod = parseInt(self.contract.giftperiod, 10);
            if (isNaN(giftperiod) || giftperiod == 0) {
              return true;
            }
            var period = parseInt(self.contract.period, 10);
            if (giftperiod > period/4) {
              return '赠送月数过多';
            }
            return true;
          },
          'contract.begindate': '请选择服务开始日期',
          'contract.enddate': '请选择服务结束日期'
        };
        for (var key in validators) {
          var value = this.$get(key), message = validators[key];
          if (typeof message == 'function') {
            message = message();
            if (message !== true) {
              this.errorToast(message || '验证失败');
              return false;
            }
          } else {
            if (this.isValueEmpty(value)) {
              this.errorToast(message);
              return false;
            }
          }
        }
        if (!this.contract.services.length) {
          this.errorToast('请选择设备或服务类型');
        }
        return this.validateService();
      },

      submit: function() {
        var self = this;
        if (this.submiting)
          return this.errorToast('使劲提交中...');
        if (this.validate()) {
          dd.device.notification.showPreloader({text: '使劲提交中...'});
          this.submiting = true;
          this.saveContract().always(function(result) {
            dd.device.notification.hidePreloader();
            if ('res' in result) {
              if (result.res === 1) {
                draftWork.remove(self.draftId);
                self.errorToast('已提交', 'success', 5);
                replaceLink('contractInfo.html?conid='+result.data.id);
              } else {
                self.errorToast(result.msg || '网络请求失败', 'error', 5);
              }
            } else {
              self.errorToast('网络请求失败', 'error', 5);
            }
            self.submiting = false;
          });
        }
      },

      saveDraft: function() {
        var shadowObj = JSON.parse(JSON.stringify(this.$get('contract')));
        // // FIXME: 服务类型数据目前不好处理
        // shadowObj.services = [{}];
        var draftObj = {
          type: 'contract',
          title: this.contract.cusname || '待补充',
          cusid: this.contract.cusid,
          cusname: this.contract.cusname,
          rid: 0,
          record: shadowObj
        };
        var draftId = draftWork.set(this.draftId, draftObj);
        if (typeof draftId == 'number') {
          this.draftId = draftId;
        }
      },

      saveContract: function() {
        var formdata = JSON.parse(JSON.stringify(this.$data.contract));
        // remove $$str
        for (var key in formdata) {
          if (key.substr(-5) == '$$str') {
            delete formdata[key];
          }
        }
        // images
        formdata.imgs = [];
        $.each(formdata.images, function(i, obj) {
          formdata.imgs.push(obj.imgfile);
        });
        delete formdata.images;
        // services=>con
        var services = formdata.services;
        formdata.con = {};
        $.each(services, function(i, service) {
          var keypre = service.type+'_'+service.id;
          formdata.con[keypre+'_number'] = service.number;
          formdata.con[keypre+'_price' ] = service.price;
          formdata.con[keypre+'_amount'] = service.amount;
        });
        delete formdata.services;
        // owner
        formdata.owner = this.user.realname;
        formdata.ownerid = this.user.id;

        return contractStore.add(formdata);
      },

      chosenCustomer: function() {
        if (this.customer)
          return;
        var self = this;
        cusSelWidget.active('normal', {omsuid: this.user.id, token: this.user.token}, function(obj) {
          self.initNav();
          if (obj && obj.id) {
            self.contract.cusid = obj.id;
            self.contract.cusname = obj.cusname;
            self.contract.trade = obj.trade;
            self.dict.trades && $.each(self.dict.trades, function(i, item) {
              if (item.value == obj.trade) {
                self.contract.trade$$str = item.key;
                return false;
              }
            });
          }
        });
      },

      chosenLinkman: function() {
        if (!this.contract.cusid)
          return dd.device.notification.toast({text: '请先选择客户', duration: 1});
        var self = this;
        cusWidget.init(null, null, this.contract.cusid, function(obj) {
          self.initNav();
          if (obj && obj.code) {
            self.contract.linkman = obj.name;
            self.contract.telephone = obj.telephone;
          }
        });
      },

      applyContractNO: function() {
        var self = this;
        if (this.blankContracts) {
          select();
        } else {
          this.fetchBlanks().always(function() {
            self.blankContracts = self.blankContracts || [];
            select();
          });
        }

        function select() {
          var sources = [];
          $.each(self.blankContracts, function(i, obj) {
            sources.push({
              key: obj.contract_no + ", 领取于 " + obj.grant_time,
              value: obj.contract_no
            });
          });
          if (!sources.length) {
            return dd.device.notification.toast({text: '尚无空白合同，请在oms网站申请', duration: 1});
          }
          dd.biz.util.chosen({
            source: sources,
            onSuccess: function(result) {
              self.contract.contractno = result.value;
            }
          });
        }
      },

      uploadImage: function(event) {
        event.preventDefault();
        //if (typeof FormData != 'function') {
        //  this.errorToast('暂不支持此型号手机上传拍照╮(╯▽╰)╭');
        //  return;
        //}
        var self = this, uploading = false, newimage = {};
        $.each(this.contract.images, function(i, item) {
          if (item.uploading)
            uploading = true;
        });
        if (uploading) {
          return;
        }
        if (this.contract.images.length >= 9) {
          this.errorToast('最多上传9张图片');
          return;
        }
        function onsuccess(result) {
          var data = result.data;
          if (result.res === 1) {
            if (data.imgurl) {
              newimage.imgurl = contractStore.ossImageUrl(data.imgurl);
              newimage.imgfile = newimage.imgurl.substr(newimage.imgurl.lastIndexOf('/')+1);
              newimage.uploading = false;
            }
            self.contract.images.$set(self.contract.images.length-1, $.extend({}, newimage)); // FIXME: lastcopy, focus _digest
          } else {
            onfail(result.msg);
          }
        }
        function onfail(error) {
          console.log('in onfail');
          console.log(error);
          self.contract.images.$remove(newimage);
          if (error == 'ERROR_USER_CANCELLED') {
            return;
          }
          self.errorToast(error || '网络请求失败');
        }

        //根据app不同，区分 inputfile 和 jsapi 上传
        if (dd.isDingTalk) {
          if (event.target.files && event.target.files[0]) {
            newimage.uploading = true;
            this.contract.images.push(newimage);
            this._postFileUseInputfile(event.target.files[0], onsuccess, onfail);
          }
        } else {
          newimage.uploading = true;
          this.contract.images.push(newimage);
          var apiparams = {
            posturl: oms_config.apiUrl+oms_apiList.uploadImg,
            name: 'files',
            params: {
              omsuid: this.user.id,
              token: this.user.token
            }
          };
          this._postFileUseJsapi(apiparams, onsuccess, onfail);
        }
      },

      _postFileUseJsapi: function(params, onsuccess, onfail) {
        var p = $.extend({}, params, {
          onSuccess: onsuccess,
          onFail: onfail
        });
        dd.biz.util.uploadImage(p);
      },

      _postFileUseInputfile: function(_file, onsuccess, onfail) {
        var fd = new FormData();
        fd.append('omsuid', this.user.id);
        fd.append('token', this.user.token);
        fd.append('files', _file);
        $.ajax({
          type: 'POST',
          url: oms_config.apiUrl+oms_apiList.uploadImg,
          data: fd,
          processData: false,
          contentType: false,
          dataType: 'json',
          success: onsuccess,
          error: onfail
        });
      },

      removeImage: function(image) {
        var self = this;
        dd.device.notification.confirm({
          message: '确定要移除合同图片么？',
          title: '提示',
          buttonLabels: ['确定', '取消'],
          onSuccess: function(result) {
            if (result.buttonIndex === 0) {
              self.contract.images.$remove(image);
            }
          }
        });
      },

      previewImages: function(image) {
        var urls = [];
        // ossImager = this.filter('ossImage');
        function ossImager(url) {
          return url + '@_70q.jpg';
        }
        $.each(this.contract.images, function(i, obj) {
          urls.push(ossImager(obj.imgurl));
        });
        if (urls.length && image) {
          dd.biz.util.previewImage({
            urls: urls,
            current: ossImager(image.imgurl)
          });
        }
      },

      tipNonstandard: function() {
        var tip = "非标准化合同\n仅可在OMS网站录入";
        dd.device.notification.alert({
          title: '提示',
          message: tip,
          buttonName: '确定'
        })
      },

      ddchosen: function(sourceKey, valueKeypath, keyKeypath) {
        var self = this, sources = this.dict[sourceKey];
        if (sources && sources.length) {
          dd.biz.util.chosen({
            source: sources,
            onSuccess: function(result) {
              self.$set(valueKeypath, result.value);
              if (keyKeypath) {
                self.$set(keyKeypath, result.key);
              }
            }
          });
        } else {
          dd.device.notification.toast({icon: 'error', text: '暂无数据选项'});
        }
      },

      dddatepicker: function(valueKeypath) {
        var self = this, defaultValue = this.$get(valueKeypath);
        dd.biz.util.datepicker({
          format: 'yyyy-MM-dd',
          value: defaultValue,
          onSuccess: function(result) {
            if (result.value) {
              self.$set(valueKeypath, result.value);
            }
          }
        });
      },

      besureNumber0: function($event) {
        var input = $event.target;
        if (input.tagName == 'INPUT') {
          var num = parseInt(input.value.replace(/\D/g, ''), 10);
          input.value = isNaN(num)?'':String(num);
        }
      },

      periodValid: function() {
        var period = parseInt(this.contract.period, 10);
        if (!isNaN(period)) {
          if (period%12 !== 0) {
            return this.errorToast('购买期限需是12的倍数');
          }
          return true;
        }
      },

      giftPeriodValid: function() {
        var giftperiod = parseInt(this.contract.giftperiod, 10);
        var period = parseInt(this.contract.period, 10);
        if (!isNaN(giftperiod) && !isNaN(period)) {
          if (giftperiod > period/4) {
            return this.errorToast('赠送月数过多');
          }
          return true;
        }
      },

      calcProductEnddate: function() {
        var beginMom = moment(this.contract.begindate);
        var months = parseInt(this.contract.period, 10) + parseInt(this.contract.giftperiod, 10);
        if (this.contract.begindate && beginMom.isValid() && !isNaN(months)) {
          beginMom.add(months, 'months').subtract(1, 'days');
          if (beginMom.isValid()) {
            this.contract.enddate = beginMom.format('YYYY-MM-DD');
          }
        }
      },

      addNewService: function() {
        if (this.contract.services.length == 0) {
          return this.contract.services.push({});
        }
        var last = this.contract.services[this.contract.services.length-1];
        if (this.validateService(last)) {
          this.contract.services.push({});
        }
      },

      deleteService: function(service) {
        var self = this;
        if (service.id == '') {
          return self.contract.services.$remove(service);
        }
        dd.device.notification.confirm({
          message: '确定要删除么？',
          title: '提示',
          buttonLabels: ['确定', '取消'],
          onSuccess: function(result) {
            if (result.buttonIndex === 0) {
              self.contract.services.$remove(service);
              self.calcContractMoney();
            }
          }
        });
      },

      validateService: function(service) {
        var services = this.contract.services;
        if (service) {
          services = [service];
        }
        for (var i = 0; i < services.length; i++) {
          service = services[i];
          if (!service.id) {
            this.errorToast('请选择设备或服务类型');
            return false;
          }
          if (!service.amount) {
            this.errorToast('请填写设备或服务明细');
            return false;
          }
        }
        return true;
      },

      disabledTypeIds: function() {
        var ids = [];
        $.each(this.contract.services, function(i, service) {
          ids.push(service.id);
        });
        return ids;
      },

      chosenServiceType: function(service, $index) {
        var self = this, sources = [], disabledIds = this.disabledTypeIds();
        $.each(this.dict.service_types, function(i, obj) {
          if (disabledIds.indexOf(obj.id) === -1) {
            sources.push({
              key: obj.name,
              value: obj.id
            });
          }
        });
        dd.biz.util.chosen({
          source: sources,
          onSuccess: function(result) {
            result.value && $.each(self.dict.service_types, function(i, obj) {
              if (result.value == obj.id) {
                self.$nextTick(function() {
                  self.applyServiceType(service, $index, obj);
                });
                return false;
              }
            });
          }
        });
      },

      applyServiceType: function(service, $index, type) {
        if (type && service.name && service.name == type.name)
          return;
        if (type)
          $.extend(service, type);
        // clear input
        // $.extend(service, {
        //   number: '',
        //   price: '',
        //   amount: ''
        // });
        this.buildServiceRule(service, $index);
        this.applyServiceRule(service, $index);
      },

      buildServiceRule: function(service, $index) {
        var calcRuler;
        calcRuler    = contractServiceValuation.buildRuler(service.name);
        service.rule = calcRuler(this.contract.new_product_version, this.contract.type, this.contract.period);
        console.log('!!!', service.rule, this.contract.period, service.rule.price);
      },

      applyServiceRule: function(service, $index) {
        if (!service.rule)
          return;
        if (service.rule.number) {
          service.number = service.rule.number;
        }
        service.number$$fixed = service.rule.number$$fixed;
        if (service.rule.price) {
          service.price = service.rule.price;
        }
        service.price$$fixed = service.rule.price$$fixed;
        if (service.rule.amount) {
          service.amount = service.rule.amount;
        } else if (service.rule.amountor) {
          var amount = service.rule.amountor(service.number, service.price);
          if (amount) {
            service.amount = amount;
          }
        }
        service.amount$$fixed = service.rule.amount$$fixed;
        this.calcContractMoney();
      },

      calcContractMoney: function() {
        var serTotal = 0, devTotal = 0;
        $.each(this.contract.services, function(i, item) {
          if (!item.type) {
            return;
          }
          var amount = parseInt(item.amount, 10);
          if (!isNaN(amount)) {
            if (item.type == 'service') {
              serTotal += amount;
            } else if (item.type == 'device') {
              devTotal += amount;
            }
          }
        });
        this.contract.htmoney = serTotal+devTotal;
        this.contract.sermoney = serTotal;
        this.contract.devmoney = devTotal;
      },

      changeServiceRelation: function() {
        var self = this;
        $.each(this.contract.services, function(i, service) {
          self.applyServiceType(service, i);
        });
      }
    },

    // filters
    filters: {
      thumb: function(url) {
        // 100x100 自动裁剪 开启锐化
        return url + '@100w_100h_1e_1c_70q_1l_1sh.jpg';
        // return 'http://placeholder.qiniudn.com/190x284';
      },
      ossImage: function(url) {
        // 质量70 webp格式
        return url + '@_70q.jpg';
      }
    },

    ready: function() {
      //根据app, 调整文件上传触发事件
      //默认禁用文件上传，如果dingtalk则打开文件上传
      if (dd.isDingTalk) {
        $('#_file_input').on('change', this.uploadImage.bind(this));
      } else {
        $('#_file_btn').on('click', this.uploadImage.bind(this));
      }
    }
  });
})(window, window.contractStore, window.contractServiceValuation);

dd.ready(function() {
  'use strict';

  // try {
  //   FastClick.attach(document.getElementById('main-body'));
  // } catch(e) {}

  // INPUT 诡异的键盘弹出
  var _$lastInput;
  $(document).on('touchstart focusin', function(e) {
    var $target = $(e.target);
    if ($target.is('input,select,textarea,video')) {
      if (_$lastInput && _$lastInput[0] !== $target[0]) {
        _$lastInput.blur();
      }
      _$lastInput = $target;
    } else {
      if (_$lastInput) {
        _$lastInput.blur();
        _$lastInput = undefined;
      }
    }
  });
  $(document).on('focusout', function(e) {
      _$lastInput = undefined;
  });

  function route() {
    var config = [{
        name: 'contract.html',
        controller: 'contractListPage'
      }, {
        name: 'contractAdd.html',
        controller: 'contractFormPage'
      }, {
        name: 'contractInfo.html',
        controller: 'contractInfoPage'
      }
    ];
    var page = null;
    $.each(config, function(i, obj) {
      if (window.location.pathname.indexOf(obj.name) > 0) {
        page = new window[obj.controller];
        return false;
      }
    });
    if (page) {
      return page;
    } else {
      dd.ready(function() {
        dd.biz.navigation.close();
      });
    }
  }

  var loginApi = oms_config.apiUrl + oms_apiList.login;
  new Login(oms_config.corpId, oms_config.baseUrl, loginApi, function() {
    var omsUserJson = getCookie('omsUser'), omsUser;
    if (omsUserJson) {
      omsUser = JSON.parse(omsUserJson);
      if (omsUser) {
        var page = route();
        window.page = page;
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
