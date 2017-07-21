/**
 * Created by yuxunbin on 2016/5/1.
 */
$(document).ready(function(){
    getVisitDescribeData();
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

function getVisitDescribeData(){
    var getVisitDataApi=oms_config.apiUrl+oms_apiList.getVisitData+'?rand='+Math.random();
    var cusId = getUrlParam("cusId");
    var rid = getUrlParam("rId");
    console.log(cusId);
    console.log(rid);
    $.post(getVisitDataApi,
        {
            'cusid' : cusId,
            'vid':rid
        },
        function (resultData) {
            console.log(resultData);
            var result = resultData['data']['info'];
            var role = JSON.parse(getCookie('omsUser')).role;

            if(result['visit']['subvisit'] == '0'){
                $(".visitDescribeContainer").show();
                //拜访
                dd.ready(function(){
                    dd.biz.navigation.setTitle({
                        title: '拜访详情',
                        onSuccess : function(result) {},
                        onFail : function(err) {}
                    });
                });
                //初始化拜访字段
                $("#cusName").text(result['visit']['cusname']);
                $("#visitTime").text(result['visit']['visit_time']);
                if(result['visit']['last_time'] == '-1'){
                    $("#visitTimeLong").text('正在拜访中');
                }else{
                    $("#visitTimeLong").text(result['visit']['last_time']);
                }
                $("#locateBegin").text(result['visit']['start_address']);
                $("#locateEnd").text(result['visit']['end_address']);
                $("#visitPersonNum").val(result['visit']['legworknumber']);
                $("#visitCarNum").val(result['visit']['carnumber']);
                $("#visitCusLevel").val(result['visit']['mylevel']);
                $("#visitSummary").text(result['visit']['content']);
                $("#realName").text(result['visit']['realname']);
                $("#createTime").text(result['visit']['create_time']);

                if(role == '3'){
                    //新签业务员
                    $(".nextVisitTime").show();
                    $(".nextVisitPlace").show();
                    $("#nextVisitTime").val(result['visit']['next_time']);
                    $("#nextVisitPlace").text(result['visit']['next_address']);
                }


                if(result['visit']['report_file']){
                    $("#reportFilePic").show();
                    var htmlReportFile = '';
                    $.each(result['visit']['report_file'],function(key,value){
                        var ossimage = ossImageUrl(value),
                            thumb_nail = thumbnail(ossimage),
                            preview_url = previewurl(ossimage);
                        // htmlReportFile += '<img style="width:60px;margin-right: 5px;" src="'+value+'" onclick="previewImg(\''+value+'\');" />';
                        htmlReportFile += '<img style="width:60px;margin-right: 5px;" src="'+thumb_nail+'" data-ori-src="'+preview_url+'" onclick="previewImg(event,this);" />';
                    })
                    $("#reportFilePic").html(htmlReportFile);
                }
                if(!resultData['data']['question']){
                    $("#cusProblem").hide();
                }else{
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
            }else if(result['visit']['subvisit'] == '1'){
                $(".subVisitDescribeContainer").show();
                //陪访
                dd.ready(function(){
                    dd.biz.navigation.setTitle({
                        title: '陪访详情',
                        onSuccess : function(result) {},
                        onFail : function(err) {}
                    });
                });
                $(".realName").text(result['visit']['realname']);
                $(".createTime").text(result['visit']['create_time']);
                $("#subVisitCusName").text(result['visit']['cusname']);
                $("#peifangTime").text(result['visit']['visit_time']);
                if(result['visit']['last_time'] == '-1'){
                    $("#peifangTimeLong").text('正在陪访中');
                }else{
                    $("#peifangTimeLong").text(result['visit']['last_time']);
                }
                $("#peifangLocateBegin").text(result['visit']['start_address']);
                $("#peifangLocateEnd").text(result['visit']['end_address']);
                $("#peifangSummary").text(result['visit']['content']);
                $("#peifangLinkman").text(result['visit']['linkman']?result['visit']['linkman']:'暂无');
                $("#subVisitFollower").text(result['visit']['salesman']);

            }

        }, 'json');
}
