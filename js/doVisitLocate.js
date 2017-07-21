;(function($) {
    "use strict";

    var maplet,
        $mapDiv,
        geoLocation,
        nearPois,
        selectPoi,
        selectPoi$html;
    var poiPinMarker;
    var customer, visitresult;
    var timer;

    /**
     * [reqLocation description]
     */
    function reqLocation(succCallback, failCallback) {
        timer = setTimeout(function () {
            selectPoi = -1;
            doVisitLocate.checkin();
            $('#map-poi-loading p').show().text('定位失败...');
        }, 20000);
        Utils.Map.geoLocation(maplet, succCallback, failCallback);
    }

    /**
     * [onLocateSucc description]
     */
    function onLocateSucc(data) {
        clearTimeout(timer);
        console.log('location: ', data);
        geoLocation = data;
        // drawPositionArea
        Utils.Map.setPositionAreaLayer(maplet, data);
        maplet.setCenter(data.position);
        maplet.setFitView();
        // map custom control
        Utils.Map.addZoomControl(maplet);
        Utils.Map.addToControl(maplet).setCenter(geoLocation.position);
        // getAndRenderNearPois
        searchRenderMapNearPois(1); // first page
    }

    /**
     * [onLocateFail description]
     */
    function onLocateFail() {
        clearTimeout(timer);
        selectPoi = -1;
        doVisitLocate.checkin();
        $('#map-poi-loading p').show().text('定位失败...');
    }

    /**
     * [renderMapNearPois description]
     */
    function searchRenderMapNearPois(page) {
        $('.map-poi-container-wrap').show();
        var $poiContainer = $('#map-poi-container');
        var $poiLoading = $('#map-poi-loading');
        var $poiLoadingMore = $('#map-poi-loading-more');
        if (page == '1') {
            nearPois = [];
            $poiContainer.empty();
            $poiLoadingMore.hide();
            $poiLoading.show();
            $poiLoading.find('p').text('周边位置加载中...');
        } else {
            $poiLoadingMore.show();
            $poiLoadingMore.addClass('waiting');
        }
        var radius = (geoLocation.accuracy<300 ? 300 : geoLocation.accuracy);
        Utils.Map.searchNearBy(maplet, geoLocation.position, radius, '', {'pageIndex': page}, function(poilist) {
            $poiLoadingMore.removeClass('waiting');
            $poiLoadingMore.hide();
            if (poilist) {
                $poiLoading.hide();
                var showPois = [];
                $.each(poilist['pois'], function(i, poi) {
                    poi['distance'] = poi['distance']+'米';
                    poi['idx'] = nearPois.length;
                    showPois.push(poi);
                    nearPois[poi['idx']] = poi;
                });
                var tmplist = $.tpl($('#tpl-map-pois').html(), {'list': showPois});
                if (page == 1) {
                    $poiContainer.append($(tmplist));
                    $poiContainer.find('li').first().trigger('tap');
                } else {
                    $poiContainer.find('ul').append($(tmplist).children());
                }
                // update next-page
                var totalPage = Math.ceil(poilist['count'] / poilist['pageSize']);
                if (page >= totalPage) {
                    $poiLoadingMore.data('next-page', '0');
                } else {
                    $poiLoadingMore.data('next-page', page+1);
                }
            }
        }, function() {
            if (!nearPois || !nearPois.length) {
                selectPoi = -1;
                $poiLoading.find('p').text('周边位置加载失败...');
            }
        });
    }

    /**
     * [loadMorePoisHandler description]
     */
    function loadMorePoisHandler() {
        var $poiLoadingMore = $('#map-poi-loading-more');
        var $poiContainer = $('#map-poi-container');
        if ($(this).scrollTop() + $(this).height() >= $poiContainer.height()-1/*adjustment*/) {
            if (!$poiLoadingMore.hasClass('waiting')) {
                var nextPage = parseInt($poiLoadingMore.data('next-page'), 10);
                if (nextPage > 1) {
                    searchRenderMapNearPois(nextPage);
                }
            }
        }
    }

    /**
     * [clickNearPoisHandler description]
     */
    function clickNearPoisHandler() {
        var $me = $(this),
            $that = selectPoi$html,
            _index = $me.data('poi-idx');
        if (nearPois[_index]) {
            if ($that) {
                $that.removeClass('active');
                $that.find('.ui-poi-dist').text($that.data('poi-dist'));
            }
            var poi = nearPois[_index];
            selectPoi = poi;
            selectPoi$html = $me;
            $me.addClass('active');
            $me.find('.ui-poi-dist').html('<i class="ui-icon-ok"></i>');
            poiPinMarker = Utils.Map.setPositionPin(maplet, poi.location, poiPinMarker);
            maplet.setFitView();
        }
    }

    var doVisitLocate = {
        user: null,
        cusid: null,
        // fvid: null,   //被陪访记录的id
        poi: null,
        isTrain: false,
        isSubvisit: false,

        _submiting: false,

        //提交验证及数据
        createRecord: function(onsuccess, onerror) {
            var submiturl, data = {
                omsuid: this.user.id,
                token: this.user.token,
                cusid: this.cusid
            };
            if (this.isTrain) {
                submiturl = oms_config.apiUrl+oms_apiList.startTrain;
            } else {
                submiturl = oms_config.apiUrl+oms_apiList.visitrecordpost;
                data['subvisit'] = '0';
                // data['fvid'] = '0';
                // Leader角色并且设置了陪访标识才可执行陪访
                if (this.isSubvisit && (this.user.role==1||this.user.role==4||this.user.role==5)) {
                    data['subvisit'] = '1';
                }
            }
            if((doVisitLocate.user.role == 1)||(doVisitLocate.user.role == 3)){
                //判断是新签还是续签
                data['is_renew'] = '0';    //新签
            }else if((doVisitLocate.user.role == 2)||(doVisitLocate.user.role == 4)){
                data['is_renew'] = '1';    //续签
            }
            if (typeof this.poi == 'string') {
                // 手动填写的定位地址
                data['start_lon_gcj02'] = 0.0;
                data['start_lat_gcj02'] = 0.0;
                data['start_address'] = '定位失败:#'+this.poi+'#';
            } else {
                data['start_lon_gcj02'] = this.poi.location.lng;
                data['start_lat_gcj02'] = this.poi.location.lat;
                data['start_address'] = this.poi.formataddress+','+this.poi.name;
            }
            return $.ajax({
                type: 'POST',
                url: submiturl,
                data: data,
                cache: false,
                dataType: 'json',
                success: onsuccess,
                error: onerror
            });
        },

        //点击确定后
        checkin: function() {
            if (!selectPoi) {
                dd.device.notification.alert({
                    message: '正在定位中，请稍等片刻'
                });
                return;
            }
            if (this._submiting) {
                dd.device.notification.toast({text: '使劲提交中...'});
                return;
            }
            var self = this;
            if (selectPoi == -1) {
                dd.device.notification.prompt({
                    message: "定位失败，请输入当前位置：",
                    title: "提示",
                    buttonLabels: ['确定', '取消'],
                    onSuccess : function(result) {
                        if (result.buttonIndex === 0) {
                            self.poi = $.trim(result.value);
                            _submit();
                        }
                    }
                });
            } else {
                this.poi = selectPoi;
                _submit();
            }
            function _submit() {
                dd.device.notification.showPreloader({text: '使劲提交中...'});
                self._submiting = true;
                self.createRecord().always(function(resp) {
                    dd.device.notification.hidePreloader();
                    if (resp.res === 1) {
                        var data = resp.data;
                        var directurl = 'doVisitClose.html';
                        if (self.isTrain) {
                            directurl = directurl+'?trainId='+data.id+'&train=1';
                        } else {
                            directurl = directurl+'?visitId='+data.id;
                        }
                        return replaceLink(directurl);
                    }
                    else if (resp.res === 2) {
                        var data = resp.data;
                        if (data.type == 'train') {
                            replaceLink('doVisitClose.html?trainId=' + data.id + '&train=1');
                        }
                        else {
                            replaceLink('doVisitClose.html?visitId=' + data.id);
                        }
                        return;
                    }
                    dd.device.notification.toast({text: resp.msg || '网络请求错误', icon: 'error'});
                    self._submiting = false;
                });
            }
        },

        //渲染地图
        renderMap: function() {
            // get map div
            $mapDiv = $('#map-container');
            // update map container width, height
            var mw = $('body').width(), mh = mw*2/3;
            $mapDiv
                .width(mw)
                .height(mh);
            // update map poi container height
            $('.map-poi-container-wrap').height($(window).height() - mh);
            // resize handler
            $(window).on('resize', function() {
                mw = $('body').width(), mh = mw*2/3;
                $mapDiv
                    .width(mw)
                    .height(mh);
                $('.map-poi-container-wrap').height($(window).height() - mh);
            });
            // init, locate
            maplet = Utils.Map.create('map-container', { zoom: 13 });
            AMap.event.addListener(maplet,'complete',function() {
                $('.map-loading-cover').remove();
                $('.map-container-wrap').show();
                // locate
                $('.map-poi-container-wrap').show();
                $('#map-poi-loading p').show().text('定位中...');
                $('#map-poi-loading-more').hide();
                geoLocation = undefined;
                nearPois = undefined;
                selectPoi = undefined;
                reqLocation(onLocateSucc, onLocateFail);
            });
            // choice poi
            $('#map-poi-container').on('tap', 'li', clickNearPoisHandler);
            // load more pois
            $('.map-poi-container-wrap').on('scroll', loadMorePoisHandler);
        },

        //初始化导航条
        initNav: function() {
            var self = this;
            dd.ready(function() {
                dd.biz.navigation.setTitle({
                    title: '定位中',
                    onSuccess : function(result) {},
                    onFail : function(err) {}
                });
                if(dd.ios){
                    dd.biz.navigation.setLeft({
                        show: true,
                        control: false,
                        showIcon: true,
                        text: '',
                        onSuccess : function(result){
                            history.back();
                        },
                        onFail : function(err) {}
                    });
                }else{
                    $(document).off('backbutton');
                    $(document).on('backbutton', function(event) {
                        event.preventDefault();
                        history.back();
                    });
                }
                //FIXME: ios问题，延迟处理下
                setTimeout(function() {
                    dd.biz.navigation.setRight({
                        show: true,
                        control: true,
                        text: '确定',
                        onSuccess: function(result){
                            self.checkin();
                        }
                    });
                }, 1000);
            });
        },

        checkState: function(next){
            // if(this.isTrain){
            //     this.checkTrainState(next);
            // }else{
            //     this.checkVisitState(next);
            // }
            //顺序检查 拜访，培训状态，和提交的逻辑保持一致
            var self = this;
            self.checkVisitState(function(){
                self.checkTrainState(next);
            });
        },

        checkVisitState: function(next){
            var uid = this.user.id;
            var url = oms_config.apiUrl + oms_apiList.checkState;
            $.ajax({
                url: url,
                type: 'post',
                data: {
                    uid: uid
                },
                dataType: 'json',
                cache: false,
                success: function(result){
                    // var result = response ? JSON.parse(response):null;
                    if(result && result['data'] && result['data']['id']){
                        replaceLink('doVisitClose.html?visitId=' + result.data.id);
                    }else{
                        typeof next == 'function' && next();
                    }
                },
                error: function(e){
                    typeof next == 'function' && next();
                }
            });
        },

        checkTrainState: function(next){
            var uid = this.user.id;
            var url = oms_config.apiUrl + oms_apiList.checkTrainState;
            $.ajax({
                url: url,
                type: 'post',
                data: {
                    uid: uid
                },
                dataType: 'json',
                cache: false,
                success: function(result){
                    // var result = response ? JSON.parse(response):null;
                    if(result && result['data'] && result['data']['id']){
                        replaceLink('doVisitClose.html?trainId=' + result.data.id + '&train=1');
                    }else{
                        typeof next == 'function' && next();
                    }
                },
                error: function(error){
                    typeof next == 'function' && next();
                }
            });
        },

        //初始化doVisitLocate参数
        ready: function(user) {
            this.user = user;
            var cusid = getUrlParam('cusId');
            if ($.trim(cusid) == '') {
                dd.device.notification.toast({text: '参数无效', icon: 'error'});
                return history.back();
            }
            this.cusid = cusid;
            // this.fvid = getUrlParam('vid')||'';
            if (getUrlParam('train') == '1') {
                this.isTrain = true;
            }
            if (getUrlParam('subvisit') == '1') {
                this.isSubvisit = true;
            }
            this.initNav();
            this.checkState(function() {
                doVisitLocate.renderMap();
            });
        }
    };

    dd.ready(function(){
        var omsUserJson = getCookie('omsUser'), omsUser;
        if (omsUserJson) {
            omsUser = JSON.parse(omsUserJson);
            if (omsUser) {
                //初始化
                doVisitLocate.ready(omsUser);
            }
        }
        if (!omsUser) {
            dd.ready(function() {
                dd.device.notification.alert({
                    message: '请重新登录',
                    onSuccess: function() {
                        dd.biz.navigation.close();
                    }
                });
            });
        }
    });

})(window.Zepto);
