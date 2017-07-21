var __$$cusInfoContactWidgetVersion = 1;


var cusInfoContactWidget = {
    cusid: getUrlParam('code'),

    smsCall: function(uname, tel, evt) {
        if (dd.ios) {
            window.location.href = "sms:" + tel;
        } else {
            window.location.href = "sms:" + tel;
            stopEventBubble(evt);
        }
    },
    renderContactsList: function(data) {
        // $("#loading").hide();
        // $(".noMore").remove();
        // console.log(data.length);
        $("#cusInfoContactWidget_result").show();
        // console.log();
        if (data.length > 0) {
            var list = "";
            for (var i in data) {
                list += cusInfoContactWidget.renderLi(data[i]);
            }
            // if(areaWidget.filterObj.pageNo == 1){
            // 	$("#areaWidget_result").html(list);
            // }else{
            // 	$("#areaWidget_result").append(list);
            // }
            $("#cusInfoContactWidget_result").append(list);
        } else {
            $("#cusInfoContactWidget_result").html('<div style="padding-left:15px; font-size:12px; color:#666" class="nosearchRes">没有找到联系人信息！</div>');
        }

    },

    renderLi: function(obj) {

        var list = '<li style="height:60px;" class="ui-border-b">' + '<div class="ui-list-info">' + '<h4 class="ui-nowrap" style="color:#333; font-size:15px">' + obj.linkman + ' | ' + obj.position + '</h4>' + '<span style="color:#666;font-size:12px;">' + obj.telephone + '</span></div>';
        if (dd.ios) {
            list += '<div onclick="cusInfoContactWidget.phoneCall(\'' + obj.telephone + '\',\'' + obj.telephone + '\',event)"><i class="ui-icon-message" style="line-height:60px; font-size:24px;color:#ec564d;padding-right:25px"></i></div>'
        }
        list += '<div onclick="businessCall.phoneCall(\'' + obj.id + '\',\'' + obj.telephone + '\',\'' + obj.linkman + '\',\'' + obj.cusname + '\',\'' + cusInfoContactWidget.cusid + '\', 0, event)"><i class="ui-icon-list_phone" style="line-height:60px; font-size:24px;color:#ec564d;padding-right:15px"></i></div>' + '</li>';
        return list;
    },



    // cusInfoContactWidgetSearchListener : function(){
    // 	$("#cusInfoContactWidget_result li").click(function(event){


    // 		stopEventBubble(event);
    // 	});
    // },


    searchCusData: function(name) {
        var htmlTpl = "",
            self = this;
        var data = JSON.parse(cusInfoContactWidget.obj_data);


        for (var i in data) {
            // console.log(data[i]);
            if (name == '' || JSON.stringify(data[i]).indexOf(name) > -1)
                htmlTpl += self.renderLi(data[i]);
        }

        $("#cusInfoContactWidget_result").html(htmlTpl);
        // cusInfoContactWidget.cusInfoContactWidgetSearchListener();

    },

    initApi: function() {
        dd.ready(function() {
            if (dd.ios) {
                dd.biz.navigation.setLeft({
                    show: true,
                    control: true,
                    showIcon: true,
                    text: '',
                    onSuccess: function(result) {
                        history.back(-1);
                    },
                    onFail: function(err) {}
                });
            } else {
                $(document).off('backbutton');
                $(document).on('backbutton', function(e) {
                    history.back(-1);
                    e.preventDefault();
                });
            }

            dd.biz.navigation.setTitle({
                title: '客户联系人',
                onSuccess: function(result) {},
                onFail: function(err) {}
            });

            dd.biz.navigation.setRight({
                show: false,
                control: false,
                text: '',
                onSuccess: function(result) {
                    // console.log(reallocateWidget.selectedSubordinate);
                },
                onFail: function(err) {}
            });
            // cusInfoContactWidget.allContacts = data;

            // areaWidget.initLeft();
        });
    },
    getData: function() {
        var getContactorsByCusidApi = oms_config.apiUrl + oms_apiList.getContactorsByCusid;
        $.ajax({
            type: 'POST',
            url: getContactorsByCusidApi,
            data: {
                "omsuid": JSON.parse(getCookie("omsUser")).id,
                "token": JSON.parse(getCookie("omsUser")).token,
                "cusid": cusInfoContactWidget.cusid
            },
            cache: false,
            success: function(data) {

                var response = JSON.parse(data);
                if (response.res == 1) {
                    cusInfoContactWidget.renderContactsList(response.data);
                }
            }
        });
    },
    init: function() {

        cusInfoContactWidget.initApi();
        cusInfoContactWidget.getData();
        // cusInfoContactWidget.cusInfoContactWidgetListener();
        // $("#main-body").hide();
        // reallocateWidget.initApi();
        // reallocateWidget.initHtml();
        // reallocateWidget.getSubordinate();
        // if(renew != 0)
        // {
        // 	reallocateWidget.selectedSubordinate = renew;
        // 	$('[data-id = "'+renew+'"]').find('.ui-poi-dist').html('<i class="ui-icon-ok"></i>');
        // }
        // reallocateWidget.reallocateWidgetListener();


    }
};

$.fn.cusInfoContactWidget = function(settings) {
    $.extend(cusInfoContactWidget, settings || {});
};
$.fn.ready(function() {
    cusInfoContactWidget.init();
});
