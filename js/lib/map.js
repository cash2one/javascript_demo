// global
window.Utils = window.Utils || {};

// map
;(function(root, $, AMap) {
    'use strict';

    root.Map = root.Map || {};

    // 创建地图，返回地图对象
    root.Map.create = function(mapDiv, opts) {
        opts = opts || {};
        opts['resizeEnable'] = true;
        return new AMap.Map(mapDiv, opts);
    };

    // 定位范围浮层元素
    var POSITION_AREA_LAYER = [];

    // 根据定位点和定位精度，添加定位范围浮层
    root.Map.setPositionAreaLayer = function(map, data) {
        for (var i in POSITION_AREA_LAYER) {
            POSITION_AREA_LAYER[i].setMap(null);
        }
        POSITION_AREA_LAYER =  [];
        var circle = new AMap.Circle({
            center: data.position,
            radius: data.accuracy,
            strokeColor: "#79C5F9", //线颜色
            strokeOpacity: 1, //线透明度
            strokeWeight: 1, //线粗细度
            fillColor: "#BEE6F5", //填充颜色
            fillOpacity: 0.8 //填充透明度
        });
        POSITION_AREA_LAYER.push(circle);
        var positiondot = new AMap.Marker({
            position: data.position,
            offset: new AMap.Pixel(-11, -11),
            icon: "https://webapi.amap.com/theme/v1.3/markers/n/loc.png"
            // icon: new AMap.Icon({
            //     size: new AMap.Size(23,23),
            //     imageOffset: new AMap.Pixel(-11, -11),
            //     image: "http://webapi.amap.com/theme/v1.3/markers/n/loc.png"
            // })
        });
        POSITION_AREA_LAYER.push(positiondot);
        for (var i in POSITION_AREA_LAYER) {
            POSITION_AREA_LAYER[i].setMap(map);
        }
    };

    // 添加或更新 POI 定位点标记
    root.Map.setPositionPin = function(map, position, pin) {
        var pin;
        if (pin) {
            pin.setMap(map);
            pin.setPosition(position);
            return pin;
        }
        pin = new AMap.Marker({
            position: position,
            icon: "https://webapi.amap.com/images/marker_sprite.png"
        });
        pin.setMap(map);
        return pin;
    };

    // 缩放插件
    AMap.ZoomControl = function() {
        this.$el = $('--empty--');
        this.offset = new AMap.Pixel(20, 20);
    }
    AMap.ZoomControl.prototype.setOffset = function(offset) {
        if (offset instanceof AMap.Pixel) {
            this.offset = offset;
        }
    }
    AMap.ZoomControl.prototype.addTo = function(map, dom) {
        this.map = map;
        if (this.$el.length) {
            dom.appendChild(this.$el.get(0));
        } else {
            this.$el = this._get$Dom();
            dom.appendChild(this.$el.get(0));
        }
    };
    AMap.ZoomControl.prototype._get$Dom = function() {
        var self = this;
        var $el = $('<div>');
        $el.css({
            'position': 'absolute',
            'right': this.offset.getX(),
            'bottom': this.offset.getY(),
            'z-index': '1000'
        });
        var $zin = $('<div class="amap-zoom-plus">').appendTo($el);
        var $zout = $('<div class="amap-zoom-minus">').appendTo($el);
        $el.on('tap', '.amap-zoom-plus', function() {
            self.map.zoomIn();
            $zout.removeClass('disable');
            if (19 <= self.map.getZoom()) {
                $zin.addClass('disable');
            }
        });
        $el.on('tap', '.amap-zoom-minus', function() {
            self.map.zoomOut();
            $zin.removeClass('disable');
            if (3 >= self.map.getZoom()) {
                $(this).addClass('disable');
            }
        });
        return $el;
    };

    // 添加放大缩小插件
    root.Map.addZoomControl = function(map, offset) {
        var control = new AMap.ZoomControl();
        if (offset) {
            control.setOffset(offset);
        }
        map.addControl(control);
        return control;
    }

    // 返回中心插件
    AMap.ToControl = function() {
        this.$el = $('--empty--');
        this.center = null;
        this.offset = new AMap.Pixel(20, 20);
    }
    AMap.ToControl.prototype.setCenter = function(center) {
        if (center instanceof AMap.LngLat) {
            this.center = center;
        }
    }
    AMap.ToControl.prototype.setOffset = function(offset) {
        if (offset instanceof AMap.Pixel) {
            this.offset = offset;
        }
    }
    AMap.ToControl.prototype.addTo = function(map, dom) {
        this.map = map;
        if (this.$el.length) {
            dom.appendChild(this.$el.get(0));
        } else {
            this.$el = this._get$Dom();
            dom.appendChild(this.$el.get(0));
        }
    };
    AMap.ToControl.prototype._get$Dom = function() {
        var self = this;
        var $el = $('<div>');
        $el.css({
            'position': 'absolute',
            'left': this.offset.getX(),
            'bottom': this.offset.getY(),
            'z-index': '1000'
        });
        var $to = $('<div class="amap-to-pointer">').appendTo($el);
        $el.on('tap', '.amap-to-pointer', function() {
            if (self.center) {
                self.map.panTo(self.center);
            }
        });
        return $el;
    };

    // 添加返回中心插件
    root.Map.addToControl = function(map, offset) {
        var control = new AMap.ToControl();
        if (offset) {
            control.setOffset(offset);
        }
        map.addControl(control);
        return control;
    }

    // 获取当前位置，使用钉钉 jsapi 或 AMap.Geolocation 插件
    root.Map.geoLocation = function(map, onsuccess, onerror) {
        // 钉钉 jsapi 定位
        if (window['dd']) {
            var ddsuccess = function(location) {
                if (location.location) {
                    location = location.location;
                }
                // FIXME: check
                location.accuracy = parseInt(location.accuracy, 10);
                location.longitude = parseFloat(location.longitude);
                location.latitude = parseFloat(location.latitude);
                if (isNaN(location.accuracy) || isNaN(location.longitude) || isNaN(location.latitude)) {
                    return onerror();
                }
                // ios标准坐标转换
                if (dd.ios) {
                    var coordTrans = Utils.coordTransform.wgs84togcj02(location.longitude, location.latitude);
                    location.longitude = coordTrans[0];
                    location.latitude  = coordTrans[1];
                }
                var data = {
                    position: new AMap.LngLat(location.longitude, location.latitude),
                    accuracy: location.accuracy
                }
                onsuccess(data);
            }
            dd.ready(function() {
                dd.device.geolocation.get({
                    onSuccess: ddsuccess,
                    onFail: onerror
                });
            });
        }
        // 高德定位
        else {
            var geolocation;
            // 使用 dtjsapi，可以获取定位，map 可以传值为 [空]
            // 所以这里，map 有可能是 [空]
            if (map) {
                map.plugin('AMap.Geolocation', function() {
                    geolocation = new AMap.Geolocation({
                        enableHighAccuracy: true,//是否使用高精度定位，默认:true
                        timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                        maximumAge: 0,           //定位结果缓存0毫秒，默认：0
                        convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                        showButton: false,       //显示定位按钮，false
                        showMarker: false,       //定位成功后在定位到的位置显示点标记，false
                        showCircle: false,       //定位成功后用圆圈表示定位精度范围，false
                        panToLocation: false,    //定位成功后将定位到的位置作为地图中心点，false
                        zoomToAccuracy: false    //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，false
                    });
                });
                map.addControl(geolocation);
                AMap.event.addListener(geolocation, 'complete', onsuccess);
                AMap.event.addListener(geolocation, 'error', onerror);
                geolocation.getCurrentPosition();
            } else {
                typeof onerror == 'function' && onerror();
            }
        }
    };

    // POI 类型，可通过调整此参数控制查询结果的大小，默认参数结果比较多
    // var POI_SEARCH_TYPE = '大厦|商务|黄金地标|公共设施|服务|家居店|建材市场|交叉路口';
    var POI_SEARCH_TYPE = '服务|机构|住宅|商务|公司|企业|大楼|道路|路口|行政|地名';

    // 定位点逆地理编码缓存
    var LNGLAT_REGEOCODE_CACHE = {};

    // 逆地理编码
    root.Map.getAddress = function(location, callback, failcallback) {
        var lnglatStr = location.toString();
        if (LNGLAT_REGEOCODE_CACHE[lnglatStr]) {
            callback(LNGLAT_REGEOCODE_CACHE[lnglatStr]);
        } else {
            AMap.service('AMap.Geocoder', function() {
                var geoCoder = new AMap.Geocoder({
                    // 逆地理编码时，返回地址信息及附近poi、道路、道路交叉口等信息
                    extensions: 'all'
                });
                geoCoder.getAddress(location, function(status, result) {
                    if (status === 'complete' && result.info === 'OK') {
                        var regeocode = result.regeocode;
                        // 设置 [pois]
                        if (!regeocode.pois || !regeocode.pois.length) {
                            var addressObj = regeocode.addressComponent;
                            var name = regeocode.formattedAddress;
                            var address = addressObj.province
                                        + addressObj.city
                                        + addressObj.district
                                        + addressObj.township;
                            if (name.indexOf(address) === 0) {
                                name = name.substr(address.length);
                            }
                            regeocode.pois = [];
                            regeocode.pois.push({
                                address: addressObj.street+addressObj.streetNumber,
                                distance: 1,
                                id: "UNKNOW",
                                location: location,
                                name: name,
                                tel: "",
                                type: "UNKNOW;未知类型"
                            });
                        }
                        LNGLAT_REGEOCODE_CACHE[lnglatStr] = regeocode;
                        callback(LNGLAT_REGEOCODE_CACHE[lnglatStr]);
                    } else {
                        //window.alert('地址解析出错,1:'+status);
                        if (typeof failcallback == 'function') {
                            failcallback();
                        }
                    }
                });
            })
        }
    };

    // 周边 POI 查询, 通过逆编码找到所在城市
    // 参数 [map]，不再使用，可传 [空]
    root.Map.searchNearBy = function(map, center, radius, keyword, opts, callback, failcallback) {
        root.Map.getAddress(center, function(regeoresult) {
            var citydata = regeoresult['addressComponent'],
                citycode = citydata['citycode'],
                cityname = citydata['city'] || citydata['province'],
                adname = citydata['district'],
                placeSearch;
            AMap.service('AMap.PlaceSearch', function() {
                var defopts = {
                    'city': cityname,
                    'type': POI_SEARCH_TYPE
                };
                opts = $.extend(defopts, opts || {});
                placeSearch = new AMap.PlaceSearch(opts);
                placeSearch.searchNearBy(keyword, center, radius, function(status, result) {
                    if ('complete' === status && 'OK' == result['info']) {
                        $.each(result['poiList']['pois'], function(i, poi) {
                            poi['cityname'] = cityname;
                            poi['adname'] = adname;
                            poi['formataddress'] = poi['cityname']+poi['adname']+poi['address'];
                        });
                        callback(result['poiList']);
                    } else {
                        // 周边搜索失败，返回 [逆地理编码][POI] 信息
                        var poiSize = regeoresult.pois.length;
                        var poiList = {
                            count: poiSize,
                            pageSize: poiSize,
                            pageIndex: 1,
                            pois: []
                        };
                        $.each(regeoresult.pois, function(i, poi) {
                            var poi = $.extend({}, poi);
                            poi['cityname'] = cityname;
                            poi['adname'] = adname;
                            poi['formataddress'] = poi['cityname']+poi['adname']+poi['address'];
                            poiList.pois.push(poi);
                        });
                        callback(poiList);
                    }
                });
            });
        }, failcallback);
    };
})(window.Utils, window.Zepto || window.jQuery, window.AMap || {});
