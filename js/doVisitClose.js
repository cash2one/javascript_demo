/**
 * Created by yuxunbin on 2016/4/30.
 */
;(function($) {
    "use strict";

    var startofday = moment().startOf('day').format('x');
    var maplet,
        $mapDiv,
        geoLocation,
        selectPoi;
    var customer, visitresult;
    var timer;
//    var visitresultDB = new Database('visitresult');

    function getQueryString(name) {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var result = window.location.search.substr(1).match(reg);
        if (result) {
            return decodeURIComponent(result[2]);
        }
    }

    /**
     * [reqLocation description]
     */
    function reqLocation(succCallback, failCallback) {
        timer = setTimeout(function () {
            selectPoi = -1;
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
        var tempAccuracy = 300;
        if(geoLocation['accuracy'] > 300){
            tempAccuracy = geoLocation['accuracy'];
        }
        Utils.Map.searchNearBy('', geoLocation['position'], tempAccuracy, '', '', function(result) {
            selectPoi = result.pois && result.pois.length && result['pois'][0] || -1;
        }, function() {
            selectPoi = -1;
        });
    }

    /**
     * [onLocateFail description]
     */
    function onLocateFail() {
        clearTimeout(timer);
        selectPoi = -1;
    }

    var doVisitClose ={
        visitType : 0,  //0是拜访，1是陪访
        hour : 0,
        minute : 0,
        second : 0,
        visitId : 0,   //拜访或者培训id
        cusid : '',
        token : JSON.parse(getCookie('omsUser')).token,
        omsuid : JSON.parse(getCookie('omsUser')).id,
        train : 0,

        poi: null,
        subvisit : 0,   //0是拜访，1是陪访
        _submiting: false,

        init : function() {
            // init, locate
            // maplet = Utils.Map.create('map-container');
            // AMap.event.addListener(maplet,'complete',function() {});
            setTimeout(function() {
                reqLocation(onLocateSucc, onLocateFail);
            });

            var train;
            train = doVisitClose.train = getQueryString('train');
            if(train == 1){
                //如果是培训，则角色一定是续签业务员
                dd.ready(function(){
                    dd.biz.navigation.setTitle({
                        title: '正在培训',
                        onSuccess : function(result) {},
                        onFail : function(err) {}
                    });
                });
                $(".visitStyleTitle").text('培训时长');
                $("#visitCloseBtn").text('结束培训');
                //获取url中的参数
                var trainId = getQueryString('trainId');
                // $("#personDiv").hide();  //如果是培训的话，则隐藏下属或者陪访人
                console.log(trainId);
                doVisitClose.visitId = trainId;
                var dfd = $.Deferred();  //定义延迟对象
                var getVisitInfoApi=oms_config.apiUrl+oms_apiList.getVisitInfo+'?rand='+Math.random();
                $.post(getVisitInfoApi,{
                    'omsuid':doVisitClose.omsuid,
                    'token':doVisitClose.token,
                    'id':trainId,
                    'type':2
                },function(result){
                    console.log(result);
                    if(result.res!==1){
                        dd.device.notification.toast({text: result.msg || '网络请求错误', icon: 'error'});
                        return;
                    }
                    $("#cusName").text(result['data']['cusname']);
                    //如果定位失败，数据库中存的是-1
                    if(result['data']['start_address'] == '-1'){
                        $("#position").text('定位失败');
                    }else{
                        $("#position").text(result['data']['start_address']);
                    }
//                    $("#position").text(result['data']['visitaddr']);
                    var beginTrainTime = new Date(parseInt(result['data']['actual_visit_time'])*1000);
                    $("#visitTime").text("开始于"+beginTrainTime.getFullYear()+"年"+(beginTrainTime.getMonth()+1)+"月"+beginTrainTime.getDate()+"日"+beginTrainTime.getHours()+":"+beginTrainTime.getMinutes());
//                    $("#visitTime").text("开始于"+beginTrainTime.Format("yyyy-MM-dd hh:mm:ss"));
                    doVisitClose.cusid = result['data']['cusid'];
                    doVisitClose.hour = parseInt(result['data']['last_time'].split(":")[0]);
                    doVisitClose.minute = parseInt(result['data']['last_time'].split(":")[1]);
                    doVisitClose.second = parseInt(result['data']['last_time'].split(":")[2]);
                    dfd.resolve();
                },'json').fail(function(resp){
                    dd.device.notification.toast({text: '网络请求错误', icon: 'error'});
                });
                dfd.done(function() {
                    //服务器传来时刻的时间
                    var timeDate = new Date();
                    var timeHour = timeDate.getHours();
                    var timeMintue = timeDate.getMinutes();
                    var timeSecond = timeDate.getSeconds();
                    //算出每次执行函数的时间与时间传回来的时间之间的差值
                    var timeLongHour = timeHour - doVisitClose.hour;
                    var timeLongMintue = timeMintue - doVisitClose.minute;
                    var timeLongSecond = timeSecond - doVisitClose.second;
                    //计算countDiff
                    var countDiff = timeLongHour*3600 + timeLongMintue*60 + timeLongSecond;

                    var hour = doVisitClose.hour,minute = doVisitClose.minute,second = doVisitClose.second;
                    var count = hour*3600+minute*60+second;
                    var id;
                    // 如果输入的是1位数，在十位补0
                    function formatTwoDigits(s){
                        if(s<10) return "0"+s;
                        else return s;
                    }
                    var countShow = 0;
                    //  获得时间格式00:00
                    function Do()
                    {
                        //每次执行函数的时间
                        var thisTime = new Date();
                        var thisHour = thisTime.getHours();
                        var thisMintue = thisTime.getMinutes();
                        var thisSecond = thisTime.getSeconds();
                        //算出每次执行函数的时间与时间传回来的时间之间的差值
                        var timeLongHour = thisHour - doVisitClose.hour;
                        var timeLongMintue = thisMintue - doVisitClose.minute;
                        var timeLongSecond = thisSecond - doVisitClose.second;
                        //修改count
                        var countDiffDo = timeLongHour*3600 + timeLongMintue*60 + timeLongSecond;
                        countShow = count + Math.abs(countDiffDo - countDiff);

                        hour = formatTwoDigits(Math.floor(countShow/3600));
                        minute = formatTwoDigits(Math.floor(countShow/60%60));
                        second = formatTwoDigits(Math.floor(countShow%60));
                        $(".visitTime").text(hour+":"+minute+":"+second);
//                        countShow++;
                    }
                    id = window.setInterval(Do,1000);
                });
            }else{
                //如果是拜访
                //获取url中的参数
                var visitId = getQueryString('visitId');
                console.log(visitId);
                doVisitClose.visitId = visitId;
                var dfd = $.Deferred();  //定义延迟对象
                var getVisitInfoApi=oms_config.apiUrl+oms_apiList.getVisitInfo+'?rand='+Math.random();
                $.post(getVisitInfoApi,{
                    'omsuid':doVisitClose.omsuid,
                    'token':doVisitClose.token,
                    'id':visitId,
                    'type': 1
                },function(result){
                    console.log(result);
                    if(result.res!==1){
                        dd.device.notification.toast({text: result.msg || '网络请求错误', icon: 'error'});
                        return;
                    }
                    doVisitClose.subvisit = result['data']['subvisit'];
                    if(result['data']['subvisit'] == 1){
                        //陪访
                        dd.ready(function(){
                            dd.biz.navigation.setTitle({
                                title: '正在陪访',
                                onSuccess : function(result) {},
                                onFail : function(err) {}
                            });
                        });
                        $(".visitStyleTitle").text('陪访时长');
                        $("#visitCloseBtn").text('结束陪访');

                        // if(!result['data']['peifang_id']){
                        //     $("#person").text('下属：无');
                        // }else{
                        //     $("#person").text('下属：'+result['data']['peifang_name']);
                        // }
                    }else if(result['data']['subvisit'] == 0){
                        //拜访
                        dd.ready(function(){
                            dd.biz.navigation.setTitle({
                                title: '正在拜访',
                                onSuccess : function(result) {},
                                onFail : function(err) {}
                            });
                        });
                        $(".visitStyleTitle").text('拜访时长');
                        $("#visitCloseBtn").text('结束拜访');

                        if(!result['data']['peifang_id']){
                            // $("#person").text('陪访人员：无');
                            $("#visitRemindMsg").show();
                            $(".visitClosePart3").css('margin-top','10%');
                        }else{
                            // $("#person").text('陪访人员：'+result['data']['peifang_name']);
                        }
                    }

                    $("#cusName").text(result['data']['cusname']);
                    //如果定位失败，数据库中存的是-1
                    if(result['data']['visitaddr'] == '-1'){
                        $("#position").text('定位失败');
                    }else{
                        $("#position").text(result['data']['visitaddr']);
                    }
                    $("#visitTime").text("开始于"+result['data']['visit_time']);

                    doVisitClose.cusid = result['data']['cusid'];
                    doVisitClose.hour = parseInt(result['data']['last_time'].split(":")[0]);
                    doVisitClose.minute = parseInt(result['data']['last_time'].split(":")[1]);
                    doVisitClose.second = parseInt(result['data']['last_time'].split(":")[2]);
                    dfd.resolve();
                },'json').fail(function(resp){
                    dd.device.notification.toast({text: '网络请求错误', icon: 'error'});
                });
                dfd.done(function() {
                    //服务器传来时刻的时间
                    var timeDate = new Date();
                    var timeHour = timeDate.getHours();
                    var timeMintue = timeDate.getMinutes();
                    var timeSecond = timeDate.getSeconds();
                    //算出每次执行函数的时间与时间传回来的时间之间的差值
                    var timeLongHour = timeHour - doVisitClose.hour;
                    var timeLongMintue = timeMintue - doVisitClose.minute;
                    var timeLongSecond = timeSecond - doVisitClose.second;
                    //计算countDiff
                    var countDiff = timeLongHour*3600 + timeLongMintue*60 + timeLongSecond;

                    var hour = doVisitClose.hour,minute = doVisitClose.minute,second = doVisitClose.second;
                    var count = hour*3600+minute*60+second;
                    var id;
                    // 如果输入的是1位数，在十位补0
                    function formatTwoDigits(s){
                        if(s<10) return "0"+s;
                        else return s;
                    }
                    var countShow = 0;
                    //  获得时间格式00:00
                    function Do()
                    {
                        //每次执行函数的时间
                        var thisTime = new Date();
                        var thisHour = thisTime.getHours();
                        var thisMintue = thisTime.getMinutes();
                        var thisSecond = thisTime.getSeconds();
                        //算出每次执行函数的时间与时间传回来的时间之间的差值
                        var timeLongHour = thisHour - doVisitClose.hour;
                        var timeLongMintue = thisMintue - doVisitClose.minute;
                        var timeLongSecond = thisSecond - doVisitClose.second;
                        //修改count
                        var countDiffDo = timeLongHour*3600 + timeLongMintue*60 + timeLongSecond;
                        countShow = count + Math.abs(countDiffDo - countDiff);

                        hour = formatTwoDigits(Math.floor(countShow/3600));
                        minute = formatTwoDigits(Math.floor(countShow/60%60));
                        second = formatTwoDigits(Math.floor(countShow%60));
                        $(".visitTime").text(hour+":"+minute+":"+second);
//                        countShow++;
                    }
                    id = window.setInterval(Do,1000);
                });
            }

        },
        //提交验证及数据
        createRecord : function(){

            if (typeof doVisitClose.poi == 'string') {
                // 手动填写的定位地址
                doVisitClose.poi = '定位失败:#'+doVisitClose.poi+'#';
            } else {
                doVisitClose.poi = doVisitClose.poi.formataddress+','+doVisitClose.poi.name;
            }

            if (selectPoi == -1) {
                //定位失败
                if(doVisitClose.train == 1){
                    //结束培训
                    var endTrainApi=oms_config.apiUrl+oms_apiList.endTrain;
                    var data={
                        'omsuid':doVisitClose.omsuid,
                        'token':doVisitClose.token,
                        'vid':doVisitClose.visitId,
                        'end_lon_gcj02':0.0,
                        'end_lat_gcj02':0.0,
                        'end_address':doVisitClose.poi
                    };
                    return $.ajax({
                        type: 'POST',
                        url: endTrainApi,
                        data: data,
                        cache: false,
                        dataType: 'json',
                        success: function(resp){
                            if(resp.res===1){
                                dd.device.notification.hidePreloader();
                                replaceLink('trainRecordAdd.html?vid='+doVisitClose.visitId);
                            }else{
                                dd.device.notification.hidePreloader();
                                dd.device.notification.toast({text: resp.msg || '网络请求错误', icon: 'error'});
                                doVisitClose._submiting = false;
                            }
                        },
                        error: function(){
                            dd.device.notification.hidePreloader();
                            dd.device.notification.toast({text: '网络请求错误', icon: 'error'});
                            doVisitClose._submiting = false;
                        }
                    });
                }else{
                    //结束拜访
                    var visitUpdateFinishTimeApi=oms_config.apiUrl+oms_apiList.visitUpdateFinishTime;
                    var data={
                        'omsuid':doVisitClose.omsuid,
                        'token':doVisitClose.token,
                        'vid':doVisitClose.visitId,
                        'end_lon_gcj02':0.0,
                        'end_lat_gcj02':0.0,
                        'end_address':doVisitClose.poi,
                        'cusid':doVisitClose.cusid
                    };
                    return $.ajax({
                        type: 'POST',
                        url: visitUpdateFinishTimeApi,
                        data: data,
                        cache: false,
                        dataType: 'json',
                        success: function(resp){
                            if(resp.res===1){
                                dd.device.notification.hidePreloader();
                                replaceLink('visitPlanAdd.html?visitId='+doVisitClose.visitId+'&cusid='+doVisitClose.cusid+'&subvisit='+doVisitClose.subvisit);
                            }else{
                                dd.device.notification.hidePreloader();
                                dd.device.notification.toast({text: resp.msg || '网络请求错误', icon: 'error'});
                                doVisitClose._submiting = false;
                            }
                        },
                        error: function(){
                            dd.device.notification.hidePreloader();
                            dd.device.notification.toast({text: '网络请求错误', icon: 'error'});
                            doVisitClose._submiting = false;
                        }
                    });
                }
            }else{
                //定位成功
                if(doVisitClose.train == 1){
                    //结束培训
                    var endTrainApi=oms_config.apiUrl+oms_apiList.endTrain;
                    var data={
                        'omsuid':doVisitClose.omsuid,
                        'token':doVisitClose.token,
                        'vid':doVisitClose.visitId,
                        'end_lon_gcj02':selectPoi["location"]['lng'],
                        'end_lat_gcj02':selectPoi["location"]['lat'],
                        'end_address':doVisitClose.poi
                    }
                    return $.ajax({
                        type: 'POST',
                        url: endTrainApi,
                        data: data,
                        cache: false,
                        dataType: 'json',
                        success: function(resp){
                            if(resp.res===1){
                                dd.device.notification.hidePreloader();
                                replaceLink('trainRecordAdd.html?vid='+doVisitClose.visitId);
                            }else{
                                dd.device.notification.hidePreloader();
                                dd.device.notification.toast({text: resp.msg || '网络请求错误', icon: 'error'});
                                doVisitClose._submiting = false;
                            }
                        },
                        error: function(){
                            dd.device.notification.hidePreloader();
                            dd.device.notification.toast({text: '网络请求错误', icon: 'error'});
                            doVisitClose._submiting = false;
                        }
                    });
                }else{
                    //结束拜访
                    console.log(selectPoi);
                    var visitUpdateFinishTimeApi=oms_config.apiUrl+oms_apiList.visitUpdateFinishTime;
                    var data={
                        'omsuid':doVisitClose.omsuid,
                        'token':doVisitClose.token,
                        'vid':doVisitClose.visitId,
                        'end_lon_gcj02':selectPoi["location"]['lng'],
                        'end_lat_gcj02':selectPoi["location"]['lat'],
                        'end_address':doVisitClose.poi,
                        'cusid':doVisitClose.cusid
                    };
                    return $.ajax({
                        type: 'POST',
                        url: visitUpdateFinishTimeApi,
                        data: data,
                        cache: false,
                        dataType: 'json',
                        success: function(resp){
                            if(resp.res===1){
                                dd.device.notification.hidePreloader();
                                replaceLink('visitPlanAdd.html?visitId='+doVisitClose.visitId+'&cusid='+doVisitClose.cusid+'&subvisit='+doVisitClose.subvisit);
                            }else{
                                dd.device.notification.hidePreloader();
                                dd.device.notification.toast({text: resp.msg || '网络请求错误', icon: 'error'});
                                doVisitClose._submiting = false;
                            }
                        },
                        error: function(){
                            dd.device.notification.hidePreloader();
                            dd.device.notification.toast({text: '网络请求错误', icon: 'error'});
                            doVisitClose._submiting = false;
                        }
                    });
                }

            }
        }
    };

    dd.ready(function(){
        dd.biz.navigation.setTitle({
            title: '正在拜访',
            onSuccess : function(result) {},
            onFail : function(err) {}
        });
        if(dd.ios){
            dd.biz.navigation.setLeft({
                control: true,
                text: '',
                onSuccess: function(result) {
                    history.back(-1);
                }
            });
        }else{
            //omsapp-android-setLeft-visible:true
            dd.biz.navigation.setLeft({
                visible: true,
                control: false,
                text: ''
            });
            $(document).off('backbutton');
            $(document).on('backbutton', function(e) {
                history.back(-1);
                e.preventDefault();
            });
        }
        doVisitClose.init();

        $("#visitCloseBtn").on("click",function(){
            console.log(selectPoi);
            if (doVisitClose._submiting) {
                dd.device.notification.toast({text: '使劲提交中...'});
                return;
            }
            if (!selectPoi) {
                dd.device.notification.alert({
                    message: '正在定位中，请稍等片刻'
                });
                return;
            }
            if (selectPoi == -1) {
                dd.device.notification.prompt({
                    message: "定位失败，请输入当前位置：",
                    title: "提示",
                    buttonLabels: ['确定', '取消'],
                    onSuccess : function(result) {
                        if (result.buttonIndex === 0) {
                            doVisitClose.poi = $.trim(result.value);
                            _submit();
                        }
                    }
                });
            } else {
                doVisitClose.poi = selectPoi;
                _submit();
            }
            //点击结束拜访后提交
            function _submit() {
                dd.device.notification.showPreloader({text: '使劲提交中...'});
                doVisitClose._submiting = true;
                doVisitClose.createRecord().always(function(resp) {
                    // dd.device.notification.hidePreloader();
                });
            }

        });
    });

})(window.Zepto);
