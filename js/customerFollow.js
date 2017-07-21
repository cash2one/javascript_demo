/**
 * by hecom at 2016/4/29
 */

// 体成分添加开始
(function(exports) {
  'use strict';

  exports.bodyAnalysesFormPage = Vue.extend({

    // data
    data: function() {
      return {
        changed: false,
        submiting: false,
        status: getUrlParam('status'),
        dict: {},
        code: getUrlParam('code'),
        user: null,
        customer: null,
        contract: {
          images: []
        }
      }
    },
    // methods
    methods: {
      ready: function(user) {
        this.user = user;
        var self = this;
        this.initNav();
        this.$nextTick(function() {
          $.when(self.initDict(), self.initCustomer()).always(function() {
          });
        });
      },

      initNav: function() {
        var self = this;
        ddbanner.changeBannerTitle('体成份分析');
        function goback() {
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
      },

      initCustomer: function() {
        var self = this, cusid = getUrlParam('code');
        OMS_COM.ajaxPost({
          api: 'getCustomerDetail',
          data: {id:cusid},
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code)===0){
              self.contract.code = res.data.id;
              self.contract.cusname = res.data.name;
            }
          },
          error: function () {

          },
          always: function () {

          }
        });
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
          'contract.images': '请上传图片',
          'contract.coachId': '请选择私教'
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
        return true;
      },

      submit: function() {
        var self = this;
        if (this.submiting)
          return this.errorToast('使劲提交中...');
        if (this.validate()) {
          dd.device.notification.showPreloader({text: '使劲提交中...'});
          this.submiting = true;
          this.saveContract();
        }
      },

      saveContract: function() {
        var self = this;
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

        OMS_COM.ajaxPost({
          api: "addBodyAnalyses",
          data:{
            imageIds:formdata.imgs.join(','),
            bodyAnalyses:JSON.stringify({
              "customerId":self.code,
              "userId":formdata.coachId,
              "remark":formdata.remark
            })
          },
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code)===0){
              self.errorToast('已提交', 'success', 5);
              history.go(-1);
            }
          },
          error: function () {
            self.errorToast(result.msg || '网络请求失败', 'error', 5);
          },
          always: function () {
            dd.device.notification.hidePreloader();
            self.submiting = false;
          }
        });
      },

      chosenCustomer: function() {
        if (this.customer)
          return;
        var self = this;
        coachSelWidget.active('normal', {omsuid: this.user.id, token: this.user.token}, function(obj) {
          self.initNav();
          if (obj && obj.id) {
            self.contract.coachId = obj.id;
            self.contract.realname = obj.realname;
          }
        });
      },

      uploadImage: function(event) {
        event.preventDefault();
        var self = this, newimage = {};
        $.each(this.contract.images, function(i, item) {
          if (item.uploading)
            self.contract.images.$remove(item);
        });
        if (this.contract.images.length >= 9) {
          this.errorToast('最多上传9张图片');
          return;
        }
        function onsuccess(result) {
          if (result.code == 0) {
            var data = result.data;
            if (data.imgurl) {
              newimage.imgurl = data.imgurl;
              newimage.imgfile = newimage.imgurl.substr(newimage.imgurl.lastIndexOf('/')+1);
              newimage.uploading = false;
            }
            self.contract.images.$set(self.contract.images.length-1, $.extend({}, newimage)); // FIXME: lastcopy, focus _digest
          } else {
            onfail(result.msg);
          }
        }
        function onfail(error) {
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
          var timestamp = Math.floor(Date.now() / 1000);
          var sendData = {};
          sendData['action'] = oms_apiList['uploadImg2'];
          sendData['version'] = 1;
          sendData['timestamp'] = timestamp;
          sendData['sign'] = md5(oms_apiList['uploadImg2'] + sendData['version'] + timestamp + oms_config.privateKey);
          sendData['omsuid'] = this.user.id;
          sendData['token'] = this.user.token;
          var apiparams = {
            posturl: oms_config.apiUrl2,
            name: 'files',
            params: sendData
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
        fd.append('action', oms_apiList['uploadImg']);
        $.ajax({
          type: 'POST',
          url: oms_config.apiUrl2,
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
          message: '确定要移除图片么？',
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
          return url;
          // return url + '@_70q.jpg';
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
      }
    },

    // filters
    filters: {
      thumb: function(url) {
        // 100x100 自动裁剪 开启锐化
        // return url + '@100w_100h_1e_1c_70q_1l_1sh.jpg';
        // return 'http://placeholder.qiniudn.com/190x284';
        return url + oms_config.thumbnailUrl;
      },
      ossImage: function(url) {
        // 质量70 webp格式
        // return url + '@_70q.jpg';
        return url;
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
})(window);
// 体成分添加结束


// 跟进记录详情开始
(function(exports) {
  'use strict';

  exports.customerRecordInfoPage = Vue.extend({

    // data
    data: function() {
      return {
        changed: false,
        submiting: false,
        status: getUrlParam('status'),
        followId: getUrlParam('followId'),
        follow:{
          typeName:'',
          inviteTypeMap:{},
          inviteTypeId:0,
          followChanelMap:{},
          followChanelId:0,
          reservationTime:'',
          remark:'',
          keypoint:'',
          followTime:'',
          talkResult:'',
          reason:'',
          images:[]
        },
        user: null
      }
    },

    // watch
    watch: {
    },

    // methods
    methods: {

      ready: function(user) {
        this.user = user;
        var self = this;
        this.initNav();
        this.$nextTick(function() {
          $.when(self.initDict(), self.initCustomer()).always(function() {
          });
        });
      },
      getFollowDetail: function () {
        var self = this;
        var isRenew = 0;
        if (self.status == 2)
          isRenew = 1;
        if(isRenew == 0){
          self.follow.typeName = '邀约到店';
        } else {
          self.follow.typeName = '客户维护';
        }
        OMS_COM.ajaxPost({
          api: 'getFollowDetail',
          data:{
            followId: self.followId,
            isRenew: isRenew
          },
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code) === 0) {
              self.follow.inviteTypeId = res.data.inviteTypeId;
              self.follow.followChanelId = res.data.followChanelId;
              self.follow.reason = res.data.reason;
              self.follow.keypoint = res.data.keypoint;
              self.follow.followTime = res.data.followTime.substr(0,16);
              self.follow.images = [];
              var images = res.data.imageIds.split(',');
              $.each(images, function (i, image) {
                self.follow.images.push({
                      imgurl: oms_config.oss_baseUrl+image});
              });
              self.follow.reservationTime = res.data.reservationTime.substr(0,16);
              if(res.data.reason==''){
                self.follow.talkResult = "来";
              }else{
                self.follow.talkResult = "不来";
              }
            }
          },
          error: function () {

          },
          always: function () {

          }
        });
      },
      initNav: function() {
        ddbanner.changeBannerTitle('跟进记录');
        function goback() {
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
        ddbanner.changeBannerRight('', true, function() {
        });
      },

      initDict: function() {
        var self = this;
        OMS_COM.ajaxPost({
          api: 'getCustomerFollowConfig',
          data:{},
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code) === 0) {
              self.follow.inviteTypeMap = res.data.inviteType;
              self.follow.followChanelMap = res.data.followChanel;
            }
          },
          error: function () {

          },
          always: function () {
            self.getFollowDetail();
          }
        });
      },

      initCustomer: function() {
        var self = this, cusid = getUrlParam('code');
        OMS_COM.ajaxPost({
          api: 'getCustomerDetail',
          data: {id:cusid},
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code)===0){
              self.follow.code = res.data.id;
              self.follow.cusname = res.data.name;
              self.follow.status = res.data.status;
            }
          },
          error: function () {

          },
          always: function () {

          }
        });
      },

      errorToast: function(msg, icon, dur) {
        dd.device.notification.toast({
          icon: icon,
          text: msg,
          duration: dur || 1
        })
      },

      previewImages: function(image) {
        var urls = [];
        // ossImager = this.filter('ossImage');
        function ossImager(url) {
          return url;
          // return url + '@_70q.jpg';
        }
        $.each(this.follow.images, function(i, obj) {
          urls.push(ossImager(obj.imgurl));
        });
        if (urls.length && image) {
          dd.biz.util.previewImage({
            urls: urls,
            current: ossImager(image.imgurl)
          });
        }
      }
    },

    // filters
    filters: {
      thumb: function(url) {
        // 100x100 自动裁剪 开启锐化
        // return url + '@100w_100h_1e_1c_70q_1l_1sh.jpg';
        // return 'http://placeholder.qiniudn.com/190x284';
        return url + oms_config.thumbnailUrl;
      },
      ossImage: function(url) {
        // 质量70 webp格式
        // return url + '@_70q.jpg';
        return url;
      },
      getDate: function(str) {
        return str.substr(0, 16);
      }
    }
  });
})(window);
// 跟进记录详情结束


// 私教跟踪记录添加开始
(function(exports) {
  'use strict';

  exports.coachRecordFormPage = Vue.extend({

    // data
    data: function() {
      return {
        changed: false,
        submiting: false,
        status: getUrlParam('status'),
        dict: {},
        user: null,
        customer: null,
        contract: {
          images: [],
          services: []
        }
      }
    },

    // watch
    watch: {
    },

    // methods
    methods: {

      ready: function(user) {
        this.user = user;
        var self = this;
        this.initNav();
        this.$nextTick(function() {
          $.when(self.initDict(), self.initCustomer()).always(function() {
          });
        });
      },

      initNav: function() {
        var self = this;
        ddbanner.changeBannerTitle('私教跟踪记录');
        function goback() {
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
            sources.push({key: val, value: i});
          });
          return sources;
        }
        OMS_COM.ajaxPost({
          api: 'getCustomerFollowConfig',
          data:{},
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code) === 0) {
              self.dict.privateTeachFollowStatus = ddsource(res.data.privateTeachFollowStatus);
            }
          },
          error: function () {

          },
          always: function () {

          }
        });
      },

      initCustomer: function() {
        var self = this, cusid = getUrlParam('code');
        OMS_COM.ajaxPost({
          api: 'getCustomerDetail',
          data: {id:cusid},
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code)===0){
              self.contract.code = res.data.id;
              self.contract.cusname = res.data.name;
            }
          },
          error: function () {

          },
          always: function () {

          }
        });
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
          'contract.images': '请上传图片',
          'contract.privateTeachFollowStatusId': '请选择跟进阶段'
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
        return true;
      },

      submit: function() {
        var self = this;
        if (this.submiting)
          return this.errorToast('使劲提交中...');
        if (this.validate()) {
          dd.device.notification.showPreloader({text: '使劲提交中...'});
          this.submiting = true;
          this.saveContract();
        }
      },

      saveContract: function() {
        var self = this;
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
        var imageIds = formdata.imgs.join(",");
        var bodyAnalyses = {};
        bodyAnalyses.customerId = formdata.code;
        bodyAnalyses.userId = JSON.parse(getCookie('omsUser')).id;
        bodyAnalyses.privateTeachFollowStatusId = formdata.privateTeachFollowStatusId;
        bodyAnalyses.remark = formdata.remark;
        OMS_COM.ajaxPost({
          api: 'addCoachRecord',
          data:{
            imageIds: imageIds,
            bodyAnalyses: JSON.stringify(bodyAnalyses)
          },
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code)===0){
              self.errorToast('已提交', 'success', 5);
              history.go(-3);//直接返回到客户列表
            }
          },
          error: function () {
            self.errorToast(result.msg || '网络请求失败', 'error', 5);
          },
          always: function () {
            dd.device.notification.hidePreloader();
            self.submiting = false;
          }
        });
      },

      uploadImage: function(event) {
        event.preventDefault();
        var self = this, uploading = false, newimage = {};
        $.each(this.contract.images, function(i, item) {
          if (item.uploading)
            self.contract.images.$remove(item);
        });
        if (this.contract.images.length >= 9) {
          this.errorToast('最多上传9张图片');
          return;
        }
        function onsuccess(result) {
          if (result.code == 0) {
            var data = result.data;
            if (data.imgurl) {
              newimage.imgurl = data.imgurl;
              newimage.imgfile = newimage.imgurl.substr(newimage.imgurl.lastIndexOf('/')+1);
              newimage.uploading = false;
            }
            self.contract.images.$set(self.contract.images.length-1, $.extend({}, newimage)); // FIXME: lastcopy, focus _digest
          } else {
            onfail(result.msg);
          }
        }
        function onfail(error) {
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
          var timestamp = Math.floor(Date.now() / 1000);
          var sendData = {};
          sendData['action'] = oms_apiList['uploadImg2'];
          sendData['version'] = 1;
          sendData['timestamp'] = timestamp;
          sendData['sign'] = md5(oms_apiList['uploadImg2'] + sendData['version'] + timestamp + oms_config.privateKey);
          sendData['omsuid'] = this.user.id;
          sendData['token'] = this.user.token;
          var apiparams = {
            posturl: oms_config.apiUrl2,
            name: 'files',
            params: sendData
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
        fd.append('action', oms_apiList['uploadImg']);
        $.ajax({
          type: 'POST',
          url: oms_config.apiUrl2,
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
          message: '确定要移除图片么？',
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
      }
    },

    // filters
    filters: {
      thumb: function(url) {
        // 100x100 自动裁剪 开启锐化
        // return url + '@100w_100h_1e_1c_70q_1l_1sh.jpg';
        // return 'http://placeholder.qiniudn.com/190x284';
        return url + oms_config.thumbnailUrl;
      },
      ossImage: function(url) {
        // 质量70 webp格式
        // return url + '@_70q.jpg';
        return url;
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
})(window);
// 私教跟踪记录添加结束


// 私教跟踪记录列表开始
(function(exports) {
  'use strict';

  exports.coachRecordListPage = Vue.extend({

    // data
    data: function() {
      return {
        changed: false,
        submiting: false,
        status: getUrlParam('status'),
        dict: {
        },
        user: null,
        customer: null,
        contract: {
          images: [],
          services: [],
          records: []
        }
      }
    },

    // watch
    watch: {
    },

    // methods
    methods: {

      ready: function(user) {
        this.user = user;
        var self = this;
        this.initNav();
        this.$nextTick(function() {
          $.when(self.initDict(), self.initCustomer()).always(function() {
          });
        });
      },

      initNav: function() {
        var self = this;
        ddbanner.changeBannerTitle('私教跟踪记录');
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
        ddbanner.changeBannerRight('新增', true, function() {
          // self.submit();
          var code = getUrlParam('code');
          var status = getUrlParam('status');
          openLink("coachRecordAdd.html?code="+code+"&status="+status);
          // 私教跟踪记录 新增
        });
      },

      initDict: function() {
        var self = this;
      },

      initCustomer: function() {
        var self = this, cusid = getUrlParam('code');
        OMS_COM.ajaxPost({
          api: 'getCustomerDetail',
          data: {id:cusid},
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code)===0){
              self.contract.code = res.data.id;
              self.contract.cusname = res.data.name;
            }
          },
          error: function () {

          },
          always: function () {

          }
        });
        OMS_COM.ajaxPost({
          api: 'getCoachRecords',
          data:{customerId: cusid},
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code) === 0) {
              var newRecord = {};
              $.each(res.data, function (i, val) {
                newRecord.cTime = val.cTime;
                newRecord.realname = val.realname;
                newRecord.remark = val.remark;
                newRecord.privateTeachType = val.privateTeachType;
                newRecord.imageIds = val.imageIds.split(",");
                $.each(newRecord.imageIds, function (i, val) {
                  newRecord.imageIds[i] = oms_config.oss_baseUrl + val;
                });
                self.contract.records.$set(i, $.extend({}, newRecord));
              });
            }
          },
          error: function () {
            
          },
          always: function () {
            
          }
        });
      },

      previewImages: function(image, index) {
        var urls = [];
        // ossImager = this.filter('ossImage');
        function ossImager(url) {
          return url;
          // return url + '@_70q.jpg';
        }
        $.each(this.contract.records[index].imageIds, function(i, obj) {
          urls.push(ossImager(obj));
        });
        if (urls.length && image) {
          dd.biz.util.previewImage({
            urls: urls,
            current: ossImager(image)
          });
        }
      }
    },

    // filters
    filters: {
      thumb: function(url) {
        // 100x100 自动裁剪 开启锐化
        // return url + '@100w_100h_1e_1c_70q_1l_1sh.jpg';
        // return 'http://placeholder.qiniudn.com/190x284';
        return url + oms_config.thumbnailUrl;
      },
      ossImage: function(url) {
        // 质量70 webp格式
        // return url + '@_70q.jpg';
        return url;
      }
    },

    ready: function() {
    }
  });
})(window);
// 私教跟踪记录列表结束


// 跟踪记录开始
(function(exports) {
  'use strict';

  exports.customerFollowFormPage = Vue.extend({

    // data
    data: function() {
      return {
        changed: false,
        submiting: false,
        status: getUrlParam('status'),
        showReason: 0,
        dict: {
          inviteType: [],
          followChannel: [],
          talkResult: [{
            key: "来",
            value: "1"
          },{
            key: "不来",
            value: "0"
          }],
          new_product_versions: [],
          service_types: []
        },
        user: null,
        customer: null,
        contract: {
          images: [],
          services: [],
          follow_time: ''
        },
        blankContracts: null,

        draftId: null,
        draftPoller: null
      }
    },

    computed: {
      showReason: function () {
        return this.status==1 && this.contract.talkResult==0;
      }
    },
    // methods
    methods: {

      ready: function(user) {
        this.user = user;
        var self = this;
        this.initNav();
        this.$nextTick(function() {
          $.when(self.initDict(), self.initCustomer()).always(function() {
            var ti = new Date().Format("yyyy-MM-dd hh:mm");
            self.contract.follow_time = ti;
          });
        });
      },

      initNav: function() {
        var self = this;
        ddbanner.changeBannerTitle('跟踪记录');
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
            sources.push({key: val, value: i});
          });
          return sources;
        }
        OMS_COM.ajaxPost({
          api: 'getCustomerFollowConfig',
          data:{},
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code) === 0) {
              self.dict.inviteType = ddsource(res.data.inviteType);
              self.dict.followChannel = ddsource(res.data.followChanel);
              self.dict.renewType = ddsource(res.data.renewType);
              self.dict.renewIntent = ddsource(res.data.renewIntent);
            }
          },
          error: function () {

          },
          always: function () {

          }
        });
      },

      initCustomer: function() {
        var self = this, cusid = getUrlParam('code');
        OMS_COM.ajaxPost({
          api: 'getCustomerDetail',
          data: {id:cusid},
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code)===0){
              self.contract.code = res.data.id;
              self.contract.cusname = res.data.name;
            }
          },
          error: function () {

          },
          always: function () {

          }
        });
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
        var validators = '';
        if(self.status == 1) {
          validators = {
            'contract.inviteType': '请填写邀约主题',
            'contract.followChannel': '请填写跟进方式',
            'contract.follow_time': '请填写跟进时间',
            'contract.keypoint': '请填写沟通重点',
            'contract.talkResult': '请填写沟通结果',
            'contract.reservationTime': '请填写预约时间',
            'contract.forecastMoney': '请填写预测金额'
          };
          if(self.showReason==1){
            validators['contract.reason'] = '请填写不来原因';
          }else{
            validators['contract.followers'] = '请填写随行人数';
          }
          // validators['contract.images'] = '请上传图片';
        }else{
          validators = {
            'contract.renewIntent': '请填写续约意向',
            'contract.followChannel': '请填写跟进方式',
            'contract.follow_time': '请填写跟进时间',
            'contract.keypoint': '请填写沟通重点',
            'contract.renewType': '请填写续卡类型',
            'contract.renewNum': '请填写续私教课数量',
            'contract.renewTime': '请填写续约时间',
            'contract.renewMoney': '请填写续约金额',
            // 'contract.images': '请上传图片'
          };
        }
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
        return this.validateService();
      },

      submit: function() {
        var self = this;
        if (this.submiting)
          return this.errorToast('使劲提交中...');
        if (this.validate()) {
          dd.device.notification.showPreloader({text: '使劲提交中...'});
          this.submiting = true;
          this.saveContract();
        }
      },

      saveContract: function() {
        var self = this;
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
          if(obj.imgfile!=undefined&&obj.imgfile!=''&&obj.imgfile!=null)
            formdata.imgs.push(obj.imgfile);
        });
        delete formdata.images;
        var customerFollow = {
          userId: this.user.id,
          customerId: formdata.code,
          realname: formdata.cusname,
          followChanelId: formdata.followChannel,
          followTime: formdata.follow_time,
          followers: formdata.followers,
          forecastMoney: formdata.forecastMoney,
          inviteTypeId: formdata.inviteType,
          keypoint: formdata.keypoint,
          reason: formdata.reason,
          remark: formdata.remark,
          reservationTime: formdata.reservationTime,
          status: formdata.talkResult,
          renewIntent: formdata.renewIntent,
          renewNum: formdata.renewNum,
          renewType: formdata.renewType,
          renewTime: formdata.renewTime,
          renewMoney: formdata.renewMoney,
        };
        var isRenew = 0; // 潜在客户
        if(this.status == 2){
          isRenew = 1; // 签约客户
        }
        var imageIds = formdata.imgs.join(",");
        var data = {
          imageIds: imageIds,
          customerFollow: JSON.stringify(customerFollow),
          isRenew: isRenew
        };
        OMS_COM.ajaxPost({
          api: 'addCustomerFollow',
          data: data,
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code) === 0) {
              self.errorToast('已提交', 'success', 5);
              history.back(-1);
              // replaceLink('customerDetail.html?code='+self.contract.code+'&status='+self.status);
            } else {
              self.errorToast(result.msg || '网络请求失败', 'error', 5);
            }
          },
          error: function () {
            self.errorToast(result.msg || '网络请求失败', 'error', 5);
          },
          always: function () {
            dd.device.notification.hidePreloader();
            self.submiting = false;
          }
        });
      },

      uploadImage: function(event) {
        event.preventDefault();
        var self = this, uploading = false, newimage = {};
        $.each(this.contract.images, function(i, item) {
          if (item.uploading)
            self.contract.images.$remove(item);
        });
        if (this.contract.images.length >= 9) {
          this.errorToast('最多上传9张图片');
          return;
        }
        function onsuccess(result) {
          if (result.code == 0) {
            var data = result.data;
            if (data.imgurl) {
              newimage.imgurl = data.imgurl;
              newimage.imgfile = newimage.imgurl.substr(newimage.imgurl.lastIndexOf('/')+1);
              newimage.uploading = false;
            }
            self.contract.images.$set(self.contract.images.length-1, $.extend({}, newimage)); // FIXME: lastcopy, focus _digest
          } else {
            onfail(result.msg);
          }
        }
        function onfail(error) {
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
          var timestamp = Math.floor(Date.now() / 1000);
          var sendData = {};
          sendData['action'] = oms_apiList['uploadImg2'];
          sendData['version'] = 1;
          sendData['timestamp'] = timestamp;
          sendData['sign'] = md5(oms_apiList['uploadImg2'] + sendData['version'] + timestamp + oms_config.privateKey);
          // sendData['omsuid'] = JSON.parse(getCookie("omsUser")).id;
          // sendData['token'] = JSON.parse(getCookie("omsUser")).token;
          sendData['omsuid'] = this.user.id;
          sendData['token'] = this.user.token;
          var apiparams = {
            posturl: oms_config.apiUrl2,
            name: 'files',
            params: sendData
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
        fd.append('action', oms_apiList['uploadImg']);
        $.ajax({
          type: 'POST',
          url: oms_config.apiUrl2,
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
          message: '确定要移除图片么？',
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
          return url;
          // return url + '@_70q.jpg';
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
        console.log(defaultValue);
        dd.biz.util.datetimepicker({
          format: 'yyyy-MM-dd HH:mm',
          value:  defaultValue,
          onSuccess: function(result) {
            if (result.value) {
              self.$set(valueKeypath, result.value);
            }
          }
        });
      },

      validateService: function(service) {
        return true;
      }
    },

    // filters
    filters: {
      thumb: function(url) {
        // 100x100 自动裁剪 开启锐化
        // return url + '@100w_100h_1e_1c_70q_1l_1sh.jpg';
        // return 'http://placeholder.qiniudn.com/190x284';
        return url + oms_config.thumbnailUrl;
      },
      ossImage: function(url) {
        // 质量70 webp格式
        // return url + '@_70q.jpg';
        return url;
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
})(window);
// 跟踪记录结束


// 添加健康问卷开始
(function(exports) {
  'use strict';

  exports.healthSurveyFormPage = Vue.extend({

    // data
    data: function() {
      return {
        changed: false,
        submiting: false,
        status: getUrlParam('status'),
        mode: getUrlParam('mode'),
        code: getUrlParam('code'),
        dict: {
          questions: []
        },
        user: null,
        customer: null,
        contract: {
          images: [],
          questionSelected: [],
          services: []
        },
        blankContracts: null,

        draftId: null,
        draftPoller: null
      }
    },

    // methods
    methods: {

      ready: function(user) {
        this.user = user;
        var self = this;
        this.initNav();
        this.$nextTick(function() {
          $.when(self.initDict(), self.initCustomer()).always(function() {

          });
        });
      },

      initNav: function() {
        var self = this;
        ddbanner.changeBannerTitle('健康问卷');
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
        console.log('in initDict');
        console.log(this.contract.images);
        var self = this,newQuestion={};
        function ddsource(values) {
          var sources = [];
          $.each(Object.keys(values), function(i, val) {
            sources.push({key: values[val], value: val});
          });
          return sources;
        }
        OMS_COM.ajaxPost({
          api: 'getHealthSurveyQuestion',
          data:{},
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code) === 0) {
              $.each(res.data, function(i, val) {
                newQuestion.id = val.id;
                newQuestion.titlewb = val.title;
                newQuestion.options = ddsource(JSON.parse(val.options));
                self.dict.questions.$set(i, $.extend({}, newQuestion));
              });
            }
          },
          error: function () {

          },
          always: function () {
            if(self.mode=='edit'){
                OMS_COM.ajaxPost({
                  api: 'getHealthSurveyDetail',
                  data:{
                    customerId: self.code
                  },
                  success: function (data) {
                    var res = JSON.parse(data);
                    if(parseInt(res.code)===0){
                      $.each(res.data,function (ans_i, ans_val) {
                        $.each(self.dict.questions, function (ques_i, ques_val) {
                          if(ques_val.id == ans_val.questionId){
                            $.each(ques_val['options'],function(i, val){
                              if(val.value == ans_val.answer){
                                self.contract.questionSelected.$set(ques_i, $.extend({}, val));
                              }
                            });
                            return;
                          }
                        })
                        if(ans_val.questionId==-1){
                          $.each(ans_val.answer.split(','),function (i, val) {
                            var image = {};
                            image.imgurl = oms_config.oss_baseUrl + val;
                            image.imgfile = val;
                            self.contract.images.push(image);
                          })
                        }
                        if(ans_val.questionId==-2){
                          self.contract.remark = ans_val.answer;
                        }
                      })
                    }
                  },
                  error: function () {

                  },
                  always: function () {

                  }
                });
            }
          }
        })
      },

      initCustomer: function() {
        var self = this, cusid = getUrlParam('code');
        OMS_COM.ajaxPost({
          api: 'getCustomerDetail',
          data: {id:cusid},
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code)===0){
              self.contract.code = res.data.id;
              self.contract.cusname = res.data.name;
            }
          },
          error: function () {

          },
          always: function () {

          }
        });
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
          'contract.images': '请上传图片'
        };
        //不需要验证问题是否答完
        // var allAnswerFilled = true;
        // var max = self.contract.questionSelected.length - 1;
        // $.each(self.contract.questionSelected, function (i,val) {
        //   if(val == '' && i != max){
        //     allAnswerFilled = false;
        //     return false;
        //   }
        // })
        // if(allAnswerFilled === false){
        //   this.errorToast('问题没有回答完。');
        //   return false;
        // }
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
        return this.validateService();
      },

      submit: function() {
        var self = this;
        if (this.submiting)
          return this.errorToast('使劲提交中...');
        if (this.validate()) {
          dd.device.notification.showPreloader({text: '使劲提交中...'});
          this.submiting = true;
          this.saveContract();
        }
      },

      saveContract: function() {
        var self = this;
        var formdata = JSON.parse(JSON.stringify(this.$data.contract));
        // remove $$str
        for (var key in formdata) {
          if (key.substr(-5) == '$$str') {
            delete formdata[key];
          }
        }
        // images
        formdata.imgs = [];
        console.log(formdata.images);
        $.each(formdata.images, function(i, obj) {
          if(obj.imgfile!=''&&obj.imgfile!=undefined)
            formdata.imgs.push(obj.imgfile);
        });
        delete formdata.images;

        var customerAnswers = [];
        $.each(self.dict.questions, function(i, val){
          if(formdata.questionSelected[i]==null)
            formdata.questionSelected[i]='';
            customerAnswers.push({
              customerId:formdata.code,
              questionId:val.id,
              answer:formdata.questionSelected[i].value
            });
        });
        customerAnswers.push({
          customerId:formdata.code,
          questionId:-1,// 图片当作回答上传，问题id是-1
          answer:formdata.imgs.join(',')
        });
        customerAnswers.push({
          customerId:formdata.code,
          questionId:-2,// 备注当作回答上传，问题id是-2
          answer:formdata.remark
        });
        var api = 'addHealthSurvey';
        var go = -1;
        if(self.mode=='edit'){
          api = 'updateHealthSurvey';
          go = -2;
        }
        OMS_COM.ajaxPost({
          api: api,
          data: {customerAnswers:JSON.stringify(customerAnswers)},
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code) === 0) {
              self.errorToast('已提交', 'success', 5);
              history.go(go);
            }
          },
          error: function () {
            self.errorToast(result.msg || '网络请求失败', 'error', 5);
          },
          always: function () {
            dd.device.notification.hidePreloader();
            self.submiting = false;
          }
        });
      },

      uploadImage: function(event) {
        event.preventDefault();
        var self = this, uploading = false, newimage = {};
        $.each(this.contract.images, function(i, item) {
          if (item.uploading)
            self.contract.images.$remove(item);
        });
        if (this.contract.images.length >= 9) {
          this.errorToast('最多上传9张图片');
          return;
        }
        function onsuccess(result) {
          if (result.code == 0) {
            var data = result.data;
            if (data.imgurl) {
              newimage.imgurl = data.imgurl;
              newimage.imgfile = newimage.imgurl.substr(newimage.imgurl.lastIndexOf('/')+1);
              newimage.uploading = false;
            }
            self.contract.images.$set(self.contract.images.length-1, $.extend({}, newimage)); // FIXME: lastcopy, focus _digest
          } else {
            onfail(result.msg);
            newimage.uploading = false;
          }
        }
        function onfail(error) {
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
          var timestamp = Math.floor(Date.now() / 1000);
          var sendData = {};
          sendData['action'] = oms_apiList['uploadImg2'];
          sendData['version'] = 1;
          sendData['timestamp'] = timestamp;
          sendData['sign'] = md5(oms_apiList['uploadImg2'] + sendData['version'] + timestamp + oms_config.privateKey);
          // sendData['omsuid'] = JSON.parse(getCookie("omsUser")).id;
          // sendData['token'] = JSON.parse(getCookie("omsUser")).token;
          sendData['omsuid'] = this.user.id;
          sendData['token'] = this.user.token;
          var apiparams = {
            posturl: oms_config.apiUrl2,
            name: 'files',
            params: sendData
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
        fd.append('action', oms_apiList['uploadImg']);
        $.ajax({
          type: 'POST',
          url: oms_config.apiUrl2,
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
          message: '确定要移除图片么？',
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
          return url;
          // return url + '@_70q.jpg';
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

      ddchosen: function(sourceKey, index) {
        var self = this, sources = this.dict[sourceKey][index]['options'];
        if (sources && sources.length) {
          dd.biz.util.chosen({
            source: sources,
            onSuccess: function(result) {
              self.contract.questionSelected.$set(index, $.extend({}, result));
            }
          });
        } else {
          dd.device.notification.toast({icon: 'error', text: '暂无数据选项'});
        }
      },

      validateService: function(service) {
        return true;
      }
    },

    // filters
    filters: {
      thumb: function(url) {
        // 100x100 自动裁剪 开启锐化
        // return url + '@100w_100h_1e_1c_70q_1l_1sh.jpg';
        // return 'http://placeholder.qiniudn.com/190x284';
        return url + oms_config.thumbnailUrl;
      },
      ossImage: function(url) {
        // 质量70 webp格式
        // return url + '@_70q.jpg';
        return url;
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
})(window);
// 添加健康问卷结束

// 健康问卷详细开始
(function(exports) {
  'use strict';

  exports.healthSurveyDetailPage = Vue.extend({

    // data
    data: function() {
      return {
        changed: false,
        submiting: false,
        status: getUrlParam('status'),
        code: getUrlParam('code'),
        dict: {
          questions: []
        },
        user: null,
        customer: null,
        contract: {
          images: [],
          questionSelected: [],
          services: []
        },
        blankContracts: null,

        draftId: null,
        draftPoller: null
      }
    },

    // methods
    methods: {

      ready: function(user) {
        this.user = user;
        var self = this;
        this.initNav();
        this.$nextTick(function() {
          $.when(self.initDict(), self.initCustomer()).always(function() {

          });
        });
      },

      initNav: function() {
        var self = this;
        ddbanner.changeBannerTitle('健康问卷');
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
        ddbanner.changeBannerRight('编辑', true, function() {
          // self.submit();
          openLink("healthSurvey.html?code="+self.code+"&status="+self.status+"&mode=edit");
        });
      },

      initDict: function() {
        var self = this,newQuestion={}, cusid = getUrlParam('code');
        function ddsource(values) {
          var sources = [];
          $.each(Object.keys(values), function(i, val) {
            sources.push({key: values[val], value: val});
          });
          return sources;
        }
        OMS_COM.ajaxPost({
          api: 'getHealthSurveyQuestion',
          data:{},
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code) === 0) {
              $.each(res.data, function(i, val) {
                newQuestion.id = val.id;
                newQuestion.titlewb = val.title;
                newQuestion.options = ddsource(JSON.parse(val.options));
                self.dict.questions.$set(i, $.extend({}, newQuestion));
              });
            }
          },
          error: function () {

          },
          always: function () {
            OMS_COM.ajaxPost({
              api: 'getHealthSurveyDetail',
              data:{
                customerId: cusid
              },
              success: function (data) {
                var res = JSON.parse(data);
                if(parseInt(res.code)===0){
                  $.each(res.data,function (ans_i, ans_val) {
                    $.each(self.dict.questions, function (ques_i, ques_val) {
                      if(ques_val.id == ans_val.questionId){
                        $.each(ques_val['options'],function(i, val){
                          if(val.value == ans_val.answer){
                            self.contract.questionSelected.$set(ques_i, $.extend({}, val));
                          }
                        });
                        return;
                      }
                    })
                    if(ans_val.questionId==-1){
                      $.each(ans_val.answer.split(','),function (i, val) {
                        var image = {};
                        image.imgurl = oms_config.oss_baseUrl + val;
                        self.contract.images.push(image);
                      })
                    }
                    if(ans_val.questionId==-2){
                      self.contract.remark = ans_val.answer;
                    }
                  })
                }
              },
              error: function () {
                
              },
              always: function () {
                
              }
            });
          }
        })
      },

      initCustomer: function() {
        var self = this, cusid = getUrlParam('code');
        OMS_COM.ajaxPost({
          api: 'getCustomerDetail',
          data: {id:cusid},
          success: function (data) {
            var res = JSON.parse(data);
            if(parseInt(res.code)===0){
              self.contract.code = res.data.id;
              self.contract.cusname = res.data.name;
            }
          },
          error: function () {

          },
          always: function () {

          }
        });
      },

      previewImages: function(image) {
        var urls = [];
        // ossImager = this.filter('ossImage');
        function ossImager(url) {
          return url;
          // return url + '@_70q.jpg';
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
      }
    },

    // filters
    filters: {
      thumb: function(url) {
        // 100x100 自动裁剪 开启锐化
        // return url + '@100w_100h_1e_1c_70q_1l_1sh.jpg';
        // return 'http://placeholder.qiniudn.com/190x284';
        return url + oms_config.thumbnailUrl;
      },
      ossImage: function(url) {
        // 质量70 webp格式
        // return url + '@_70q.jpg';
        return url;
      }
    },

    ready: function() {

    }
  });
})(window);
// 健康问卷详细结束

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
        name: 'bodyAnalysesAdd.html',
        controller: 'bodyAnalysesFormPage'
      },{
        name: 'customerFollowAdd.html',
        controller: 'customerFollowFormPage'
      },{
        name: 'healthSurvey.html',
        controller: 'healthSurveyFormPage'
      },{
        name: 'healthSurveyDetail.html',
        controller: 'healthSurveyDetailPage'
      },{
        name: 'coachRecordAdd.html',
        controller: 'coachRecordFormPage'
      },{
        name: 'coachRecordList.html',
        controller: 'coachRecordListPage'
      },{
        name: 'customerRecordInfo.html',
        controller: 'customerRecordInfoPage'
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
