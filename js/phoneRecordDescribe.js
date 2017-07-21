/**
 * Created by yuxunbin on 2016/5/4.
 */
$(document).ready(function(){
    getPhoneRecordDescribeData();
    dd.ready(function() {
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
    });
});

function getUrlParam(param) {
    var url = window.location.href;
    var urlarr = url.split('#');
    url = urlarr['0'];
    var searchIndex = url.indexOf('?');
    if(searchIndex == -1) return '';
    var searchParams = url.slice(searchIndex + 1).split('&');
    for (var i = 0; i < searchParams.length; i++) {
        var items = searchParams[i].split('=');
        if (items[0].trim() == param) {
            return decodeURIComponent(items[1]).trim();
        }
    }
}

function previewImg(e,self){
    var $image = $(self),images = [];
    $image.closest('.ui-form-item').find('img').each(function() {
        images.push($(this).data('ori-src'));
    });
    if (images.length) {
        dd.biz.util.previewImage({
            urls: images,
            current: $image.data('ori-src')
        });
    }
    e.preventDefault();
    e.stopPropagation();
}

function ossImageUrl(url) {
    return url.replace('oss-cn-', 'img-cn-');
}

function thumbnail(url) {
    return url + '@100w_100h_1e_1c_70q_1l_1sh.jpg';
}

function previewurl(url) {
    return url + '@_70q.jpg';
}

function getPhoneRecordDescribeData(){
    var getCallrecordInfoApi=oms_config.apiUrl+oms_apiList.getCallrecordInfo+'?rand='+Math.random();
    var cusId = getUrlParam("cusId");
    var rid = getUrlParam("rId");
    console.log("begin_phoneRecordData");
    console.log(cusId);
    console.log(rid);
    $.post(getCallrecordInfoApi,
        {
            'cusid' : cusId,
            'rid':rid
        },
        function (resultData) {
            console.log(resultData);
            var result = resultData['data']['info'];
            //初始化用户姓名和提交数据的时间
            $("#realName").text(result['realname']);
            $("#createTime").text(result['create_time']);

            if(result['is_renew'] == '0'){
                //如果是新签
                $("#xuqian").hide();
                $("#cusProblem").hide();
                //按返回数据的不同显示不同的字段
                if(result['linkstatus'] == '约到负责人'){
                    //如果联系情况为“约到负责人”
                    $("#feiPK").hide();
                    $("#PK").show();

                    $(".cusName").val(result['cusname']);
                    $(".contractSituation").val(result['linkstatus']);
                    $(".contractPeople").val(result['linkman']);
                    $(".visitPersonNum").val(result['legworknumber']);
                    $(".visitCarNum").val(result['carnumber']);
                    $(".nextContractTime").val(result['see_time']);
                    $(".nextContractPosition").text(result['see_addr']);
                    $(".phoneSummary").text(result['content']);
                }else{
                    //如果联系情况不是“约到负责人”
                    $("#feiPK").show();
                    $("#PK").hide();

                    $(".cusName").val(result['cusname']);
                    $(".contractSituation").val(result['linkstatus']);
                    $(".contractPeople").val(result['linkman']);
                    $(".visitPersonNum").val(result['legworknumber']);
                    $(".visitCarNum").val(result['carnumber']);
                    $(".nextContractTime").val(result['next_time']);
                    $(".phoneSummary").text(result['content']);
                }

            }else if(result['is_renew'] == '1'){
                //如果是续签
                $("#feiPK").hide();
                $("#PK").hide();
                $("#xuqian").show();

                $(".cusName").val(result['cusname']);
                $(".contractStyle").val(result['review_type']);
                $(".contractPeople").val(result['linkman']);
                $(".visitPersonNum").val(result['legworknumber']);
                $(".visitCarNum").val(result['carnumber']);
                $(".nextContractTime").val(result['next_time']);
                $(".phoneSummary").text(result['content']);

                if(!resultData['data']['question']){
                    //如果不存在问题
                    $("#cusProblem").hide();
                }else{
                    //如果存在问题
                    $("#cusProblem").show();
                    var html = '',htmlImg = '';
                    var html1 = '<div class="ui-panel-legend ui-whitespace">客户问题</div>';
                    var html2 = '<div class="ui-form ui-form-gap ui-form-auto ui-border-t"><div class="ui-form-item ui-border-b"><label>问题类型</label><input type="text" value="';
                    var html3 = '" readonly></div><div class="ui-form-item ui-border-b"><label>问题内容</label><p style="margin-left: 25%;">';
                    var html4 = '</p></div><div class="ui-form-item">';
                    var html5 = '</div></div>';
                    $.each(resultData['data']['question'],function(key,value){
                        $.each(value['images'],function(keyImg,valueImg){
                            if(valueImg){
                                var ossimage = ossImageUrl(valueImg),
                                    thumb_nail = thumbnail(ossimage),
                                    preview_url = previewurl(ossimage);
                                // htmlImg = htmlImg + '<img style="width:60px;margin-right: 5px;" src="' + valueImg + '" onclick="previewImg(event,this);" />';
                                htmlImg = htmlImg + '<img style="width:60px;margin-right: 5px;" src="' + thumb_nail + '" data-ori-src="'+preview_url+'" onclick="previewImg(event,this);" />';
                            }
                        });
                        html = html + html2 + resultData['data']['question'][key]['cate'] + html3 + resultData['data']['question'][key]['content'] + html4 + htmlImg + html5;
                        htmlImg = '';
                    });
                    html = html1 + html;
                    $("#cusProblem").html(html);
                }
            }

            if(result['recordurl']){
                $(".media_player").show();
                $("#jquery_jplayer_1").jPlayer({
                    ready: function () {
                        $(this).jPlayer("setMedia", {
                            wav: result['recordurl']
                        });
                    },
                    cssSelectorAncestor: "#jp_container_1",
                    swfPath: "/js/lib",
                    supplied: "wav",
                    useStateClassSkin: true,
                    autoBlur: false,
                    smoothPlayBar: false,
                    keyEnabled: true,
                    remainingDuration: true,
                    toggleDuration: true,
                });
            }

        }, 'json');
}
