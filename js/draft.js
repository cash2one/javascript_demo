/**
 * Created by yuxunbin on 2016/5/17.
 */
function clickCB(){
    var checkedNum = $(":checked").length;
    if(checkedNum == 0){
        //删除按钮变灰
        $(".deleteBtn").css('background','#f0f2f3').css('color','#333');
    }else{
        //删除按钮变红
        $(".deleteBtn").css('background','#ec564d').css('color','#fff');
    }
    $(".deleteNum").text('('+checkedNum+')');
}

function jumpTo(oid,index){
    if(draft.inEdit == true){
        //修改左边checkbox的状态
        $(".cb").get(index).checked = !($(".cb").get(index).checked);
        return ;
    }
    var draftObj = draftWork.get(oid);
    if(draftObj.type == 'visitRecord' || draftObj.type == 'subVisitRecord'){
        //跳往拜访
        var getVisitInfoApi=oms_config.apiUrl+oms_apiList.getVisitInfo+'?rand='+Math.random();
        $.post(getVisitInfoApi,{
            'omsuid':draft.user.id,
            'token':draft.user.token,
            'id':draftObj.rid,
            'type': 1
        },function(result){
            console.log(result);
            var resultObj = JSON.parse(result);
            if(resultObj.res!==1){
                dd.device.notification.toast({text: resultObj.msg || '网络请求错误', icon: 'error'});
                return;
            }
            // var subvisit = result['data']['subvisit'];
            openLink('visitPlanAdd.html?visitId='+draftObj.rid+'&cusid='+draftObj.cusid+'&subvisit='+resultObj.data.subvisit+'&draftId='+draftObj._oid);
        });
        // openLink('visitPlanAdd.html?visitId='+draftObj.rid+'&cusid='+draftObj.cusid+'&draftId='+draftObj._oid);
    }else if(draftObj.type == 'trainRecord'){
        //跳往培训
        openLink('trainRecordAdd.html?vid='+draftObj.rid+'&draftId='+draftObj._oid);
    }else if(draftObj.type == 'phoneRecord'){
        //跳往电话记录
        openLink('phoneRecord.html?draftId='+draftObj._oid);
    }else if(draftObj.type == 'customer'){
        //跳往客户
        openLink('customerAdd.html?draftId='+draftObj._oid);
    }else if(draftObj.type == 'contract'){
        //跳往合同
        openLink('contractAdd.html?draftId='+draftObj._oid);
    }
}

;(function($) {
    "use strict";

    var draft = {
        user: null,
        inEdit : false,   //是否处于编辑状态
        draftObjData : [],   //所有的草稿数据
        initList : function(){
            var resultData = [];
            resultData = draftWork.list();
            if(resultData.length == 0){
                history.back(-1);
            }
            this.draftObjData = resultData;
            console.log(resultData);
            var html = '';
            var chooseCheckboxHtml = '';
            var self = this;
            $.each(resultData,function(key,value){

                var html1 = '<ul class="ui-row draftItem"><li class="ui-col ui-col-20"><div class="flag"><div>';
                var html2 = '</div></div></li><li class="ui-col ui-col-80" onclick="jumpTo('+value._oid+','+key+');"><div class="ui-col ui-col-90"><div><span>';
                var html3 = '</span></div><div>';
                var html4 = '</div></div><div class="ui-col ui-col-10"><i class="ui-icon-arrow"></i></div></li></ul>';

                var saveTimeStamp = new Date(parseInt(value.updated_at));
                var saveTime = saveTimeStamp.getFullYear()+'-'+(saveTimeStamp.getMonth()+1)+'-'+saveTimeStamp.getDate()+' '+saveTimeStamp.getHours()+':'+saveTimeStamp.getMinutes()+':'+saveTimeStamp.getSeconds();

                if(value.type == 'visitRecord'){
                    html = html + html1 + '拜访' + html2 + value.title + html3 + '保存时间:'+ saveTime + html4;
                }else if(value.type == 'subVisitRecord'){
                    html = html + html1 + '陪访' + html2 + value.title + html3 + '保存时间:'+ saveTime + html4;
                }else if(value.type == 'trainRecord'){
                    html = html + html1 + '培训' + html2 + value.title + html3 + '保存时间:'+ saveTime + html4;
                }else if(value.type == 'phoneRecord'){
                    html = html + html1 + '电话' + html2 + value.title + html3 + '保存时间:'+ saveTime + html4;
                }else if(value.type == 'customer'){
                    html = html + html1 + '客户' + html2 + value.title + html3 + '保存时间:'+ saveTime + html4;
                }else if(value.type == 'contract'){
                    html = html + html1 + '合同' + html2 + value.title + html3 + '保存时间:'+ saveTime + html4;
                }
                //checkbox html
                var htmlcb = '<li><label class="ui-checkbox" onclick="clickCB();"><input type="checkbox" class="cb"></label></li>';
                chooseCheckboxHtml = chooseCheckboxHtml + htmlcb;
            });
            $(".draftContainer").html(html);
            $(".chooseCheckbox").html(chooseCheckboxHtml);
        },
        deleteItem : function(){
            var delCacheListUrl = oms_config.apiUrl+oms_apiList.delCacheList;
            var data = {};
            var draftArray = [];
            var indexArray = [];
            var allDraftIndexArray = [];
            $(".cb").each(function (index, dom) {
                if($(dom).is(':checked')){
                    console.log(index);
                    //将选中的所有草稿存入allDraftIndexArray数组
                    allDraftIndexArray.push(index);
                    if(draft.draftObjData[index].type == 'visitRecord' || draft.draftObjData[index].type == 'subVisitRecord' || draft.draftObjData[index].type == 'trainRecord'){
                        //将选中的拜访或者培训存入indexArray数组
                        var draftItem = {};
                        indexArray.push(index);
                        draftItem['id'] = draft.draftObjData[index].rid;
                        // draftItem['type'] = (draft.draftObjData[index].type == 'visitRecord')?1:2;
                        if(draft.draftObjData[index].type == 'visitRecord' || draft.draftObjData[index].type == 'subVisitRecord'){
                            //拜访或者陪访设置成1
                            draftItem['type'] = 1;
                        }else if(draft.draftObjData[index].type == 'trainRecord'){
                            //培训设置成2
                            draftItem['type'] = 2;
                        }
                        draftArray.push(draftItem);
                    }
                }
            });
            data['omsuid'] = draft.user.id;
            data['token'] = draft.user.token;
            data['draftArray'] = JSON.stringify(draftArray);
            console.log(data);            
            //删除拜访和培训的草稿
            if(indexArray.length != 0){
                $.ajax({
                    type: 'POST',
                    url: delCacheListUrl,
                    data: data,
                    cache: false,
                    dataType: 'json',
                    success: function(result){
                        console.log(result);
                        draft.toast('已删除');
                        $.each(allDraftIndexArray,function(key,value){
                            if(key != 0){
                                value = value - key;
                            }
                            //删除对象数组中相应的元素
                            //删除缓存中的元素
                            console.log(draft.draftObjData[value]._oid);
                            draftWork.remove(draft.draftObjData[value]._oid);
                            draft.draftObjData.splice(value,1);
                            //删除页面上的元素
                            console.log($('.draftContainer ul').eq(value));
                            $('.draftContainer ul').eq(value).remove();
                            $(".chooseCheckbox li").eq(value).remove();
                        });
                        //清空draftArray和indexArray、allDraftIndexArray
                        draftArray = [];
                        indexArray = [];
                        allDraftIndexArray = [];
                        $(".deleteNum").text('('+0+')');
                        draft.cancle();
                        
                        //如果没有缓存数据，则返回首页
                        var resultData = [];
                        resultData = draftWork.list();
                        console.log(resultData.length);
                        if(resultData.length == 0){
                            window.history.back();
                        }

                    },
                    error: function(error){}
                });
            }else{
                //没有需要删除的拜访或者培训草稿
                $.each(allDraftIndexArray,function(key,value){
                    if(key != 0){
                        value = value - key;
                    }
                    //删除对象数组中相应的元素
                    //删除缓存中的元素
                    console.log(draft.draftObjData[value]._oid);
                    draftWork.remove(draft.draftObjData[value]._oid);
                    draft.draftObjData.splice(value,1);
                    //删除页面上的元素
                    console.log($('.draftContainer ul').eq(value));
                    $('.draftContainer ul').eq(value).remove();
                    $(".chooseCheckbox li").eq(value).remove();
                });
                //清空draftArray和indexArray、allDraftIndexArray
                draftArray = [];
                indexArray = [];
                allDraftIndexArray = [];
                $(".deleteNum").text('('+0+')');
                draft.cancle();
                
                //如果没有缓存数据，则返回首页
                var resultData = [];
                resultData = draftWork.list();
                console.log(resultData.length);
                if(resultData.length == 0){
                    window.history.back();
                }

            }



        },
        countChecked : function(){
            var checkedNum = $(":checked").length;
            console.log(checkedNum);
            if(checkedNum == 0){
                //删除按钮变灰
                $(".deleteBtn").css('background','#f0f2f3').css('color','#333');
            }else{
                //删除按钮变红
                $(".deleteBtn").css('background','#ec564d').css('color','#fff');
            }
            $(".deleteNum").text('('+checkedNum+')');
        },
        toast : function(text){
            dd.device.notification.toast({
                icon: '', //icon样式，有success和error，默认为空 0.0.2
                text: text, //提示信息
                duration: 1, //显示持续时间，单位秒，默认按系统规范[android只有两种(<=2s >2s)]
                delay: 0, //延迟显示，单位秒，默认0
                onSuccess : function(result) {
                    /*{}*/
                },
                onFail : function(err) {}
            })
        },
        //监控事件
        initEvents : function(){
            //计算选中的item数
            $('.chooseCheckbox li').on('click', '.ui-checkbox', this.countChecked);
            $('.deleteBtn').on('click', this.deleteItem);
        },
        //编辑函数
        edit : function(){
            this.inEdit = true;
            //将所有list item变短
            $('.draftItem').css('margin-left','50px');
            //显示删除按钮
            $('.deleteBtn').show();
            $('.draftContainer').css('padding-bottom','45px');
            //隐藏向右箭头
            $('.ui-col-80').find('.ui-icon-arrow').hide();
            //显示选择checkbox
            $(".chooseCheckbox").show();
            //重置右边的导航按钮
            var self = this;
            dd.biz.navigation.setRight({
                show: true,
                control: true,
                text: '取消',
                onSuccess: function(result){
                    self.cancle();
                }
            });
        },
        //取消响应函数
        cancle : function(){
            this.inEdit = false;
            //将所有list item恢复
            $('.draftItem').css('margin-left','0');
            //隐藏删除按钮
            $('.deleteBtn').hide();
            $('.draftContainer').css('padding-bottom','0');
            //显示向右箭头
            $('.ui-col-80').find('.ui-icon-arrow').show();
            //隐藏选择checkbox
            $(".chooseCheckbox").hide();
            //消除checkbox的选中状态
            $(".cb").each(function (index, dom) {
                if($(dom).is(':checked')){
                    // $(dom).checked = false;
                    // $(".cb").eq(index).checked = false;
                    $(".cb").get(index).checked = false;
                }
            });
            //重置右边的导航按钮
            var self = this;
            dd.biz.navigation.setRight({
                show: true,
                control: true,
                text: '编辑',
                onSuccess: function(result){
                    self.edit();
                }
            });
        },
        //初始化导航条
        initNav : function(){
            var self = this;
            dd.ready(function() {
                dd.biz.navigation.setTitle({
                    title: '草稿',
                    onSuccess: function() {},
                    onFail: function() {}
                });
                dd.biz.navigation.setLeft({
                    show: true,
                    control: true,
                    showIcon: true,
                    text: '',
                    onSuccess : function(result) {
                        history.back(-1);
                    },
                    onFail : function(err) {}
                });
                dd.biz.navigation.setRight({
                    show: true,
                    control: true,
                    text: '编辑',
                    onSuccess: function(result){
                        self.edit();
                    }
                });
            });
        },
        //初始化draft属性
        ready : function(user){
            this.user = user;
            console.log(this.user);
            this.initNav();
            this.initEvents();
            this.initList();
        }
    };
    window.draft = draft;

    dd.ready(function(){
        var omsUserJson = getCookie('omsUser'), omsUser;
        if (omsUserJson) {
            omsUser = JSON.parse(omsUserJson);
            if (omsUser) {
                //初始化
                draft.ready(omsUser);
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
