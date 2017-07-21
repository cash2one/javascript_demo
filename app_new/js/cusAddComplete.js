var __$$cusAddCompleteVersion = 1;

var cusAddCompleteWidget = {
    phoneCall: function(uname, tel, evt) {
        if (dd.ios) {
            window.location.href = "tel:" + tel;
        } else {
            dd.device.notification.confirm({
                message: uname,
                title: "立即呼叫",
                buttonLabels: ['取消', '确定'],
                onSuccess: function(result) {
                    if (result.buttonIndex == 1) {
                        window.location.href = "tel:" + tel;
                    }
                },
                onFail: function(err) {}
            });
            stopEventBubble(evt);
        }
    },

    renderContactList: function(data) {
        if (data.length > 0) {
            var list = "";
            for (var i in data) {
                list += cusAddCompleteWidget.renderContactLi(data[i]);
            }

            $('#contacts').append(list);
        } else {
            $('#contacts').append('<div class="nosearchRes">无相关联系人</div>');
        }
    },

    renderContactLi: function(obj) {
        var list = '<li class="ui-border-b complete-contact-li">' + '<div class="ui-list-info">' + '<div class="complete-contact-info">' + obj.linkman + ' | ' + obj.position + '</div>' + '<div class="complete-contact-phone">' + obj.telephone + '</div></div>' + '<div onclick="cusAddCompleteWidget.phoneCall(\'' + obj.telephone + '\',\'' + obj.telephone + '\',event)"><i class="ui-icon-list_phone" style="line-height:63px; font-size:24px;color:#ec564d;padding-right:15px"></i></div>' + '</li>';
        return list;
    },

    getContactData: function(data) {

        cusAddCompleteWidget.renderContactList(data);
    },

    initHtml: function() {
        var self = this;

        var initHtml = '<div class="ui-container" id="cusAddComplete">';
        initHtml += '<div class="complete-header"><div class="complete-icon"></div>';
        initHtml += '<div class="complete-first-line">客户已存在你的私海里啦！</div>';
        initHtml += '<div class="complete-second-line">尽快打电话试试哦~</div>';
        initHtml += '</div>';
        initHtml += '<ul class="ui-list ui-list-function ui-border-tb complete-contact-list" id="contacts"></ul></div>'
        $(document.body).append(initHtml);
        $('#cusAddComplete').addClass('focus');
        $('#cusAddComplete').focus();
    },

    initApi: function() {
        dd.ready(function() {
            dd.biz.navigation.setTitle({
                title: "录入成功",
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
            dd.biz.navigation.setRight({
                show: true,
                control: true,
                showIcon: true,
                text: '继续添加',
                onSuccess: function(result) {
                    history.go(0);
                    // openLink('customerAdd.html?code='+'new');
                },
                onFail: function(err) {}
            });
        });
    },

    init: function(data, callback) {

        $("#main-body").hide();
        cusAddCompleteWidget.initApi();
        cusAddCompleteWidget.initHtml();
        cusAddCompleteWidget.getContactData(data);
        // $("#addcontactpersonmore").click(function(){
        // 	cusAddCompleteWidget.AddContactForm();
        // });

        // $(window).off('scroll').on("scroll",function(){
        // 	if($(window).scrollTop()+$(window).height()>=$(document).height()){
        // 		cusAddCompleteWidget.ajaxLoadPage();
        // 	}
        // });
    }
};

$.fn.cusAddCompleteWidget = function(settings) {
    $.extend(cusAddCompleteWidget, settings || {});
};
