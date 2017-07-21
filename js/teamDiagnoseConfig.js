$(function(){
    FastClick.attach(document.body);
    var diagCtrl = {
        RangeData: null,
        RuleData: null,
        renderList: function(type, data){
            var tmpObj = {
                Range: '<tr><td><a href="teamDiagnoseRangeAdd.html?class={{class}}&workType={{work_type}}"><i class="ui-icon ui-icon-list_edit"></i>{{class_type}}</a></td><td>{{light_1}}</td><td>{{light_2}}</td><td>{{light_3}}</td></tr>',
                Rule: '<tr><td><a href="teamDiagnoseRuleAdd.html?id={{id}}"><span class="pull-left"><i class="ui-icon ui-icon-list_edit"></i></span><span class="pull-left rule-title">{{detail_info}}</span></a></td><td>{{diag_result}}</td><td>{{diag_sugg}}</td></tr>'
            };
            var str = '';
            data.forEach(function(item,index){
                var trStr = tmpObj[type].replace(/{{(\w+)?}}/g, function(s0, s1){
                    return item[s1];
                });
                str += trStr;
            });
            if(type == 'Range'){
                var typeArr = data.map(function(item, index){
                    return item.class + '_' + item.work_type;
                });
                sessionStorage.setItem('RangeType', typeArr);
            }
            $('#body' + type + ' tbody').html(str);
        },
        getConfigList: function(type){
            OMS_Diagnose.showLoading();
            var apiUrl = oms_config.apiUrl + oms_apiList['get'+type+'Conf'];
            $.ajax({
                url: apiUrl,
                type: 'post',
                data: {
                    omsuid: JSON.parse(getCookie('omsUser')).id,
                    token: JSON.parse(getCookie('omsUser')).token,
                },
                complete: function(){
                    OMS_Diagnose.hideLoading();
                },
                success: function(resp){
                    var result = JSON.parse(resp);
                    if(result.res == 1){
                        diagCtrl.renderList(type, result.data);
                        diagCtrl[type + 'Data'] = result.data;
                    } else {
                        OMS_Diagnose.showAlert('数据拉取异常，请联系管理员。');
                    }
                }
            });
        }
    };
    dd.ready(function(){
        ddbanner.changeBannerTitle('智能诊断配置');
        ddbanner.changeBannerRight('诊断结果', true, function() {
          openLink('teamDiagnose.html');
        });
        dd.biz.navigation.setLeft({
            control: true,
            show:  true,
            text: "返回",
            onSuccess: function(result) {
                history.back(-1);
            },
            onFail: function(err) {}
        });
    });
    $.fn.ready(function(){
        function bindEvent(){
            $('#tabCtn li').on('click', function(){
                var $this = $(this),
                    dt = $this.data('type');
                $('#tabCtn .current').removeClass('current');
                $('.ui-tab-content .current').removeClass('current');
                $this.addClass('current');
                $('.content-' + dt).addClass('current');
                var specName = dt.replace(/^\S/,function(s){return s.toUpperCase()});
                if(!diagCtrl[specName + 'Data']){
                    diagCtrl.getConfigList(specName);
                }
                sessionStorage.setItem('selectedType', specName);
            });
            $('#add').on('click', function(){
                var link = {
                    range: 'teamDiagnoseRangeAdd.html',
                    rule: 'teamDiagnoseRuleAdd.html'
                },
                    tp = $('#tabCtn .current').data('type');
                openLink(link[tp]);
            });
        }
        function initList(){
            var tp = sessionStorage.getItem('selectedType') || 'Range';
            $('#tabCtn li')[tp == 'Range' ? 0 : 1].click();
            diagCtrl.getConfigList(tp);
        }
        function init(){
            bindEvent();
            initList();
            
        }
        init();
    });
});