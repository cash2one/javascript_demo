var __$$customerInfoVersion = 1;
// var store = new Store(Store.authUrl(apiUrl),deviceId);
var types = ['全部数据', '客户拜访'];
var trades = ['食品', '农牧农业', '医药医疗', '汽配汽用', '服装服饰', '家装建材', '家电数码', '家居家纺', '美妆日化', '商务服务', '日用百货', '水暖电工', '童装母婴', '五金工具', '化工能源', '电子仪表', '包装印刷', '安防照明', '纺织皮革', '橡胶塑料', '酒店用品', '机械工业', '冶金钢材', '其它'];
var customer_source = ['业务开发', '转介绍', '400客服', '线上渠道', '市场活动'];

var cusInfo = {
    //客户id
    code: getUrlParam('code'),
    //页面类型：private：私海 public：公海 lidan：理单
    from: getUrlParam('from'),
    //跳转类型
    jumpType: getUrlParam('jumpType') || '',
    //人员角色 1：新签leader 2：续签业务员 3：新签业务员 4：续签leader
    role: JSON.parse(getCookie('omsUser')).role,
    //理单id
    bid: getUrlParam('bid'),
    lidanFollowtype: '',
    // from: 'lidan',
    name: '',
    follows: [],
    lastCount: 0,
    leaderPriv: getUrlParam('leaderPriv') || 0,
    // cusid: getUrlParam('cusid'),
    // cusid: '1',

    smsCall: function(uname, tel, evt) {
        if (dd.ios) {
            window.location.href = "sms:" + tel;
        } else {
            window.location.href = "sms:" + tel;
            stopEventBubble(evt);
        }
    },


    renderElement: function(data) {
        cusInfo.getPhoneRecordSetting();
        $("#tab-header-content").append('<li class="first-banner"><div class="ui-flex ui-flex-pack-center ui-nowrap"><h4>' + cusInfo.switchNull(data.cusname) + '</h4></div></li>');
        // $(".dingCommentBlock").show();
        //私海详情
        $(".cusSourceLi").hide();
        if (cusInfo.from == 'private') {
            //新签业务员
            if (cusInfo.role == 3) {
                $(".cusNewSign").show();
                $(".cusRenewal").hide();
                $("#tab-header-content").append('<li class="second-banner"><div class="ui-flex ui-flex-pack-center"><div>保护期：' + cusInfo.switchNull(data.safedays) + '天</div></div></li>');
                // $("#tab-header-content").append('<li class="third-banner"><div class="ui-flex ui-flex-pack-center"><div>智能推荐排序：' + cusInfo.switchNull(data.score) + '</div></div></li>');
                $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="recordPhone" id="recordPhone"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_phone"></i></div><div class="footer-font">&nbsp;记录电话</div></li>' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'visit\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_visit" style="font-size:21px"></i></div><div class="footer-font">&nbsp;开始拜访</div></li>' + '<li class="add_plan" id="add_plan"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_addplan"></i></div><div class="footer-font">&nbsp;添加计划</div></li>' + '<li class="new_contract" id="new_contract"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_contract" style="font-size:19px;"></i></div><div class="footer-font">&nbsp;新增合同</div></li>' + '<li class="addContact" id="addContact"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_add_contacts"></i></div><div class="footer-font">&nbsp;补充联系人</div></li></ul>');
            }
            //新签leader
            if (cusInfo.role == 1) {
                // cusInfo.leaderPriv = getUrlParam('leaderPriv');
                $(".cusNewSign").show();
                $(".cusRenewal").hide();
                $("#cusMyLevelBtn").show();
                $(".cusNewSignLeader").show();
                if (cusInfo.leaderPriv == 1) {
                    $("#tab-header-content").append('<li class="second-banner"><div class="ui-flex ui-flex-pack-center"><div>保护期：' + cusInfo.switchNull(data.safedays) + '天</div></div></li>');
                    // $("#tab-header-content").append('<li class="third-banner"><div class="ui-flex ui-flex-pack-center"><div>智能推荐排序：' + cusInfo.switchNull(data.score) + '</div></div></li>');
                    $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="recordPhone" id="recordPhone"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_phone"></i></div><div class="footer-font">&nbsp;记录电话</div></li>' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'visit\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_visit" style="font-size:21px"></i></div><div class="footer-font">&nbsp;开始拜访</div></li>'
                        // +'<li class="add_plan" id="add_plan"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_addplan"></i></div><div class="footer-font">&nbsp;添加计划</div></li>'
                        + '<li class="addContact" id="addContact"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_add_contacts"></i></div><div class="footer-font">&nbsp;补充联系人</div></li>' + '<li class="deliver" id="deliver"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_transfer" style="font-size:19px;"></i></div><div class="footer-font">&nbsp;转交</div></li>' + '</ul>');
                } else {
                    if(cusInfo.cusBasicInfo.pullTimeDays == -1){
                        $("#tab-header-content").append('<li class="second-banner"><div class="ui-flex ui-flex-pack-center"><div>跟进人：' + cusInfo.switchNull(data.tracker) + '</div></div></li>');
                    }else {
                      $("#tab-header-content").append('<li class="second-banner"><div class="ui-flex ui-flex-pack-center"><div>跟进时长：' + cusInfo.switchNull(cusInfo.cusBasicInfo.pullTimeDays) + '天 | 跟进人：' + cusInfo.switchNull(data.tracker) + '</div></div></li>');
                    }
                    // $("#tab-header-content").append('<li class="third-banner"><div class="ui-flex ui-flex-pack-center"><div>智能推荐排序：' + cusInfo.switchNull(data.score) + '</div></div></li>');

                    if (data.isLidan == 0) {
                        $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'accompany\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-start_interview" style="font-size: 27px;"></i></div><div class="footer-font">&nbsp;开始陪访</div></li>' + '<li class="addLidan" id="addLidan"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_joinlist"></i></div><div class="footer-font">&nbsp;加入理单</div></li>' + '</ul>');
                    }
                    if (data.isLidan == 1) {
                        $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'accompany\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-start_interview" style="font-size: 27px;"></i></div><div class="footer-font">&nbsp;开始陪访</div></li>' + '<li class="cancelLidan" id="cancelLidan"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_cancel"></i></div><div class="footer-font">&nbsp;取消理单</div></li>' + '<li class="" id="startLidan"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_arrangelist"></i></div><div class="footer-font">&nbsp;开始理单</div></li>' + '<li class="" id="forecast"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_forecast"></i></div><div class="footer-font">&nbsp;填报预测</div></li>' + '<li class="" id="liDanReturn"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_payment"></i></div><div class="footer-font">&nbsp;申报回款</div></li>' + '</ul>');
                    }
                }
            }
            //续签业务员
            if (cusInfo.role == 2) {
                $(".cusNewSign").hide();
                $(".cusRenewal").show();
                if (cusInfo.isRenew === 0) {
                    $("#tab-header-content").append('<li class="second-banner"><div class="ui-flex ui-flex-pack-center"><div>保护期：' + cusInfo.switchNull(data.safedays) + '天</div></div></li>');
                    // $("#tab-header-content").append('<li class="third-banner"><div class="ui-flex ui-flex-pack-center"><div>智能推荐排序：' + cusInfo.switchNull(data.score) + '</div></div></li>');
                    $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="recordPhone" id="recordPhone"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_phone"></i></div><div class="footer-font">&nbsp;记录电话</div></li>' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'visit\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_visit" style="font-size:21px"></i></div><div class="footer-font">&nbsp;开始拜访</div></li>' + '<li class="add_plan" id="add_plan"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_addplan"></i></div><div class="footer-font">&nbsp;添加计划</div></li>' + '<li class="new_contract" id="new_contract"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_contract" style="font-size:19px;"></i></div><div class="footer-font">&nbsp;新增合同</div></li>' + '<li class="addContact" id="addContact"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_add_contacts"></i></div><div class="footer-font">&nbsp;补充联系人</div></li></ul>');
                } else {
                    $("#tab-header-content").append('<li class="second-banner"><div class="ui-flex ui-flex-pack-center"><div>到期日：' + cusInfo.switchNull(data.enddate) + '</div></div></li>');
                    // $("#tab-header-content").append('<li class="third-banner"><div class="ui-flex ui-flex-pack-center"><div>智能推荐排序：' + cusInfo.switchNull(data.score) + '</div></div></li>');
                    $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="addLidan" id="addLidan"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_joinlist"></i></div><div class="footer-font">&nbsp;加入理单</div></li>' + '<li class="recordPhone" id="recordPhone"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_phone"></i></div><div class="footer-font">&nbsp;记录电话</div></li>' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'visit\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_visit" style="font-size:21px"></i></div><div class="footer-font">&nbsp;开始拜访</div></li>' + '<li class="" id="" onclick="startToTrain()"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_train"></i></div><div class="footer-font">&nbsp;开始培训</div></li>' + '<li class="" id="cusRewnewMore"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_more"></i></div><div class="footer-font">&nbsp;更多</div></li></ul>');
                }
            }
            //续签leader
            if (cusInfo.role == 4) {
                // cusInfo.leaderPriv = getUrlParam('leaderPriv');
                $(".cusNewSign").hide();
                $(".cusRenewal").show();
                $("#cusMyLevelBtn").show();
                if (cusInfo.leaderPriv == 1) {
                    if (cusInfo.isRenew == 0) //新签
                    {
                        $("#tab-header-content").append('<li class="second-banner"><div class="ui-flex ui-flex-pack-center"><div>保护期：' + cusInfo.switchNull(data.safedays) + '天</div></div></li>');
                        // $("#tab-header-content").append('<li class="third-banner"><div class="ui-flex ui-flex-pack-center"><div>智能推荐排序：' + cusInfo.switchNull(data.score) + '</div></div></li>');
                        $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="recordPhone" id="recordPhone"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_phone"></i></div><div class="footer-font">&nbsp;记录电话</div></li>' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'visit\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_visit" style="font-size:21px"></i></div><div class="footer-font">&nbsp;开始拜访</div></li>' + '<li class="add_plan" id="add_plan"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_addplan"></i></div><div class="footer-font">&nbsp;添加计划</div></li>' + '<li class="deliver" id="deliver"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_transfer" style="font-size:19px;"></i></div><div class="footer-font">&nbsp;转交</div></li>' + '<li class="addContact" id="addContact"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_add_contacts"></i></div><div class="footer-font">&nbsp;补充联系人</div></li></ul>');
                    } else {
                        $("#tab-header-content").append('<li class="second-banner"><div class="ui-flex ui-flex-pack-center"><div>到期日：' + cusInfo.switchNull(data.enddate) + '</div></div></li>');
                        // $("#tab-header-content").append('<li class="third-banner"><div class="ui-flex ui-flex-pack-center"><div>智能推荐排序：' + cusInfo.switchNull(data.score) + '</div></div></li>');
                        $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="addLidan" id="addLidan"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_joinlist"></i></div><div class="footer-font">&nbsp;加入理单</div></li>' + '<li class="recordPhone" id="recordPhone"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_phone"></i></div><div class="footer-font">&nbsp;记录电话</div></li>' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'visit\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_visit" style="font-size:21px"></i></div><div class="footer-font">&nbsp;开始拜访</div></li>' + '<li class="deliver" id="deliver"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_transfer" style="font-size:19px;"></i></div><div class="footer-font">&nbsp;转交</div></li>' + '<li class="" id="leaderPrivMore"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_more"></i></div><div class="footer-font">&nbsp;更多</div></li></ul>');

                    }

                } else {
                    if (cusInfo.isRenew == 0) {
                        if(cusInfo.cusBasicInfo.pullTimeDays == -1){
                            $("#tab-header-content").append('<li class="second-banner"><div class="ui-flex ui-flex-pack-center"><div>跟进人：' + cusInfo.switchNull(data.tracker) + '</div></div></li>');
                        }else{
                            $("#tab-header-content").append('<li class="second-banner"><div class="ui-flex ui-flex-pack-center"><div>跟进时长：' + cusInfo.switchNull(cusInfo.cusBasicInfo.pullTimeDays) + '天 | 跟进人：' + cusInfo.switchNull(data.tracker) + '</div></div></li>');
                        }
                        // $("#tab-header-content").append('<li class="third-banner"><div class="ui-flex ui-flex-pack-center"><div>智能推荐排序：' + cusInfo.switchNull(data.score) + '</div></div></li>');

                        if (data.isLidan === 0) {
                            $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'accompany\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-start_interview" style="font-size: 27px;"></i></div><div class="footer-font">&nbsp;开始陪访</div></li>' + '<li class="addLidan" id="lidanBlock"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_joinlist"></i></div><div class="footer-font">&nbsp;加入理单</div></li>' + '</ul>');
                        }
                        if (data.isLidan === 1) {
                            $("#reAllocate").remove();
                            $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'accompany\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-start_interview" style="font-size: 27px;"></i></div><div class="footer-font">&nbsp;开始陪访</div></li>' + '<li class="" id="startLidan"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_arrangelist"></i></div><div class="footer-font">&nbsp;开始理单</div></li>' + '<li class="" id="forecast"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_forecast"></i></div><div class="footer-font">&nbsp;填报预测</div></li>' + '<li class="" id="liDanReturn"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_payment"></i></div><div class="footer-font">&nbsp;申报回款</div></li>' + '<li class="" id="lidanLoadMore"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_more"></i></div><div class="footer-font">&nbsp;更多</div></li>' + '</ul>');
                        }
                    } else {
                        $("#tab-header-content").append('<li class="second-banner"><div class="ui-flex ui-flex-pack-center"><div>到期日：' + cusInfo.switchNull(data.enddate) + ' | 跟进人：' + cusInfo.switchNull(data.tracker) + '</div></div></li>');
                        // $("#tab-header-content").append('<li class="third-banner"><div class="ui-flex ui-flex-pack-center"><div>智能推荐排序：' + cusInfo.switchNull(data.score) + '</div></div></li>');

                        if (data.isLidan === 0) {
                            $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'accompany\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-start_interview" style="font-size: 27px;"></i></div><div class="footer-font">&nbsp;开始陪访</div></li>' + '<li class="addLidan" id="lidanBlock"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_joinlist"></i></div><div class="footer-font">&nbsp;加入理单</div></li>' + '<li class="" id="renewOwnerBlock"></li>' + '</ul>');
                        }
                        if (data.isLidan === 1) {
                            $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'accompany\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-start_interview" style="font-size: 27px;"></i></div><div class="footer-font">&nbsp;开始陪访</div></li>' + '<li class="" id="startLidan"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_arrangelist"></i></div><div class="footer-font">&nbsp;开始理单</div></li>' + '<li class="" id="forecast"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_forecast"></i></div><div class="footer-font">&nbsp;填报预测</div></li>' + '<li class="" id="liDanReturn"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_payment"></i></div><div class="footer-font">&nbsp;申报回款</div></li>' + '<li class="" id="lidanLoadMore"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_more"></i></div><div class="footer-font">&nbsp;更多</div></li>' + '</ul>');
                        }
                    }



                    if (data.renew_owner == 0)
                        $("#renewOwnerBlock").append('<div id="reAllocate" class="ui-list-thumb icon-set-block reAllocate"><i class="ui-icon-toolbar_personnel" style="font-size:27px"></i></div><div class="footer-font">&nbsp;分配人员</div>');
                    else
                        $("#renewOwnerBlock").append('<div id="reAllocate" class="ui-list-thumb icon-set-block reAllocate"><i class="ui-icon-toolbar_personnel" style="font-size:27px"></i></div><div class="footer-font">&nbsp;重新分配</div>');
                }
            }
            //城市经理，大区总监，销售总监
            if (cusInfo.role == 5) {
                // cusInfo.leaderPriv = getUrlParam('leaderPriv');
                if(cusInfo.cusBasicInfo.pullTimeDays == -1){
                    $("#tab-header-content").append('<li class="second-banner"><div class="ui-flex ui-flex-pack-center"><div>跟进人：' + cusInfo.switchNull(data.tracker) + '</div></div></li>');
                }else{
                    $("#tab-header-content").append('<li class="second-banner"><div class="ui-flex ui-flex-pack-center"><div>跟进时长：' + cusInfo.switchNull(cusInfo.cusBasicInfo.pullTimeDays) + '天 | 跟进人：' + cusInfo.switchNull(data.tracker) + '</div></div></li>');
                }
                // $("#tab-header-content").append('<li class="third-banner"><div class="ui-flex ui-flex-pack-center"><div>智能推荐排序：' + cusInfo.switchNull(data.score) + '</div></div></li>');

                $(".cusNewSign").show();
                $(".cusRenewal").hide();
                $("#cusMyLevelBtn").hide();
                $(".private-content").hide();
                $(".public-content").show();
                $(".role5-content").show();
                if (JSON.parse(getCookie('omsUser')).isCityLeader == 1) {
                //城市经理
                    $("#cusMyLevelBtn").show();
                    if (cusInfo.leaderPriv == 1) {
                        if (data.renew_owner == 0) {
                            $("#more_first").css({
                                "border-bottom-left-radius": "0px",
                                "border-bottom-right-radius": "0px"
                            });
                            $("#more_first").after('<button style="text-align: center;background-color: #fff;border-bottom-left-radius: 10px;border-bottom-right-radius: 10px;" onClick="toPublic()">扔到公海</button>');
                        }

                        $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="addLidan" id="addLidan"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_joinlist"></i></div><div class="footer-font">&nbsp;加入理单</div></li>' + '<li class="recordPhone" id="recordPhone"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_phone"></i></div><div class="footer-font">&nbsp;记录电话</div></li>' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'visit\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_visit" style="font-size:21px"></i></div><div class="footer-font">&nbsp;开始拜访</div></li>' + '<li class="deliver" id="deliver"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_transfer" style="font-size:19px;"></i></div><div class="footer-font">&nbsp;转交</div></li>' + '<li class="" id="leaderPrivMore"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_more"></i></div><div class="footer-font">&nbsp;更多</div></li></ul>');
                    } else {
                        $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'accompany\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-start_interview" style="font-size: 27px;"></i></div><div class="footer-font">&nbsp;开始陪访</div></li>'+ '</ul>');
                    }
                } else if((JSON.parse(getCookie('omsUser')).position == '大区经理')||(JSON.parse(getCookie('omsUser')).position == '大区总监')) {
                //大区经理
                    // $(".cusSourceLi").hide();
                    $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="dingToBoss" id="dingToBoss"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-boss_review" style="font-size: 27px;"></i></div><div class="footer-font">&nbsp;BOSS点评</div></li>' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'accompany\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-start_interview" style="font-size: 27px;"></i></div><div class="footer-font">&nbsp;开始陪访</div></li>'+ '</ul>');
                } else {
                //其他情况-销售总监
                    // $(".cusSourceLi").hide();
                    $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="dingToBoss" id="dingToBoss"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-boss_review" style="font-size: 27px;"></i></div><div class="footer-font">&nbsp;BOSS点评</div></li>' +'</ul>');
                }

                // $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="dingToBoss" id="dingToBoss"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-boss_review" style="font-size: 27px;"></i></div><div class="footer-font">&nbsp;BOSS点评</div></li>' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'accompany\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-start_interview" style="font-size: 27px;"></i></div><div class="footer-font">&nbsp;开始陪访</div></li>'+ '</ul>');
            }

        }

        if (cusInfo.from == 'public') {
            $(".cusNewSign").show();
            $(".cusRenewal").hide();
            $("#cusMyLevelBtn").hide();
            $(".private-content").hide();
            $(".public-content").show();
            // $(".cusSourceLi").hide();
            if (cusInfo.role == 5) {
                $(".role5-content").show();
            }

            $("#tab-header-content").append('<li class="second-banner"><div class="ui-flex ui-flex-pack-center"><div>流入时间：' + cusInfo.switchNull(data.into_time) + '</div></div></li>');
            // $("#tab-header-content").append('<li class="third-banner"><div class="ui-flex ui-flex-pack-center"><div>智能推荐排序：' + cusInfo.switchNull(data.score) + '</div></div></li>');
            //城市经理
            if (JSON.parse(getCookie('omsUser')).isCityLeader == 1) {
                $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;"><li class="" id="pullConfirm"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_pullint_oprivate" style="font-size:24px;"></i></div><div class="footer-font">&nbsp;拉入私海</div></li></ul>');
            } else {
                if (cusInfo.role == 5 || cusInfo.role == 2 || cusInfo.role == 4) {
                    $("#main-foot").remove();
                } else {
                    $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;"><li class="" id="pullConfirm"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_pullint_oprivate" style="font-size:24px;"></i></div><div class="footer-font">&nbsp;拉入私海</div></li></ul>');
                }
            }

            // else if(cusInfo.role == 5)
            // {
            // 	$("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">'
            // 							+'<li class="dingToBoss" id="dingToBoss"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-start_interview" style="font-size: 27px;"></i></div><div class="footer-font">&nbsp;BOSS点评</div></li>'
            // 							+'</ul>');
            // }


        }

        if (cusInfo.from == 'lidan') {
            $(".cusNewSign").show();
            $(".cusRenewal").hide();
            $(".private-content").hide();
            $(".public-content").hide();
            $("#cusMyLevelBtn").hide();
            $(".lidan-content").show();
            $(".role5-content").show();
            if (cusInfo.role == 1 || cusInfo.role == 3) {
                $(".lidan-content-renew").hide();
                $(".lidan-content-new").show();
            }
            if (cusInfo.role == 2 || cusInfo.role == 4) {
                $(".lidan-content-new").hide();
                $(".lidan-content-renew").show();
            }

            $("#tab-header-content").append('<li class="second-banner"><div class="ui-flex ui-flex-pack-center"><div>预测金额：¥ ' + cusInfo.switchNull(data.forecast) + ' | 跟进人：' + cusInfo.switchNull(data.tracker) + '</div></div></li>');
            // $("#tab-header-content").append('<li class="third-banner"><div class="ui-flex ui-flex-pack-center"><div>智能推荐排序：' + cusInfo.switchNull(data.score) + '</div></div></li>');

            if (cusInfo.role == 5) {
                // $("#main-foot").remove();
                if(JSON.parse(getCookie('omsUser')).isCityLeader == 1){
                    $("#main-foot").remove();
                }else{
                    // $(".cusSourceLi").hide();
                    $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="dingToBoss" id="dingToBoss"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-boss_review" style="font-size: 27px;"></i></div><div class="footer-font">&nbsp;BOSS点评</div></li>' + '</ul>');
                }
            } else {
                if(cusInfo.role == 1 || cusInfo.role == 4){
                    $("#main-foot").append('<ul class="ui-tiled ui-border-t" style="background-color:#f5f5f6;">' + '<li class="startVisit" id="startVisit" onclick="startToVisit(\'accompany\')"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-start_interview" style="font-size: 27px;"></i></div><div class="footer-font">&nbsp;开始陪访</div></li>' + '<li class="cancelLidan" id="cancelLidan"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_cancel"></i></div><div class="footer-font">&nbsp;取消理单</div></li>' + '<li class="" id="startLidan"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_arrangelist"></i></div><div class="footer-font">&nbsp;开始理单</div></li>' + '<li class="" id="forecast"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-toolbar_forecast"></i></div><div class="footer-font">&nbsp;填报预测</div></li>' + '<li class="" id="liDanReturn"><div class="ui-list-thumb icon-set-block"><i class="ui-icon-tab_payment"></i></div><div class="footer-font">&nbsp;申报回款</div></li></ul>');
                }else {
                    $("#main-foot").remove();
                }
            }
        }

        cusInfo.getBillingInfo();
        cusInfo.cusInfoEventListener();
    },
    // renderRenewLeaderFooter:function(data){
    // 	if(data)
    // },

    renderInfo: function(data) {

        $("#cusBasicInfo").prepend(
            '<ul class="ui-list ui-list-pure ui-border-b" id="cusinfo">' + '<li class="ui-border-t cusInfoLi"><div class="ui-form-item ui-form-item-show"><label>名称</label><div class="cusInfoContent" style="padding-top:14.5px;padding-bottom:16.5px;line-height:20px">' + cusInfo.switchNull(data.cusname) + '</div></li>' + '<li class="ui-border-t cusInfoLi private-content lidan-content role5-content"><div class="ui-form-item ui-form-item-show"><label>跟进状态</label><div class="cusInfoContent">' + cusInfo.switchNull(data.follow_type) + '</div></li>' + '<li class="ui-border-t cusInfoLi"><div class="ui-form-item ui-form-item-show"><label>经理评级</label><div class="cusInfoContent">' + cusInfo.switchNull(cusInfo.managerlevel) + '</div></li>' + '<li class="ui-border-t cusInfoLi" id="cusPersonal"><div class="ui-form-item ui-form-item-show"><label>个人评级</label><div class="cusInfoContent" id="cusPersonal-content">' + cusInfo.switchNull(cusInfo.mylevel) + '</div><div class="phone-div" id="cusMyLevelBtn" onclick="cusInfo.choosePresonal();"><i class="ui-icon-list_edit" style="font-size: 18px; color:#ec564d;"></i></div></li>' + '<li class="ui-border-t cusInfoLi"><div class="ui-form-item ui-form-item-show"><label>法人</label><div class="cusInfoContent">' + cusInfo.switchNull(data.corp) + '</div></li>' + '<li class="ui-border-t cusInfoLi"><div class="ui-form-item ui-form-item-show"><label>注册资本</label><div class="cusInfoContent">' + cusInfo.switchNull(data.capital) + '万元</div></li>' + '<li class="ui-border-t cusInfoLi"><div class="ui-form-item ui-form-item-show"><label>所在区域</label><div class="cusInfoContent">' + cusInfo.switchNull(data.region_name) + '</div></li>' + '<li class="ui-border-t cusInfoLi cusSourceLi"><div class="ui-form-item ui-form-item-show"><label>客户来源</label><div class="cusInfoContent">' + cusInfo.switchNull(customer_source[data.customer_source]) + '</div></li>'+ '<li class="ui-border-t cusInfoLi"><div class="ui-form-item ui-form-item-show"><label>外勤人数</label><div class="cusInfoContent">' + cusInfo.switchNull(data.terminals) + '人</div></li>' + '<li class="ui-border-t cusInfoLi"><div class="ui-form-item ui-form-item-show"><label>行业</label><div class="cusInfoContent ">' + cusInfo.switchNull(trades[data.trade - 1]) + '</div></li>' + '<li class="ui-border-t cusInfoLi cusNewSign private-content lidan-content-new" style="display: none"><div class="ui-form-item ui-form-item-show"><label>保护期</label><div class="cusInfoContent">' + cusInfo.switchNull(data.safedays) + '天</div></li>' + '<li class="ui-border-t cusInfoLi cusNewSign public-content lidan-content-new" style="display: none; height:auto !important"><h4 style="word-break:break-all; padding-top:10px;padding-bottom:10px;font-size:15px;line-height:27px;">' + cusInfo.switchNull(data.remark) + '</h4></li>' + '<li class="ui-border-t cusInfoLi cusRenewal private-content lidan-content-renew" style="display: none"><div class="ui-form-item ui-form-item-show"><label>产品类型</label><div class="cusInfoContent">' + cusInfo.switchNull(data.new_product_version) + '</div></li>' + '<li class="ui-border-t cusInfoLi cusRenewal private-content lidan-content-renew" style="display: none"><div class="ui-form-item ui-form-item-show"><label>合同到期</label><div class="cusInfoContent">' + cusInfo.switchNull(data.enddate) + '</div></li></ul>');
    },
    renderContactList: function(data) {
        if (data.length < 4) {
            $("#showMoreContact").hide();
        }
        if (data.length > 0) {
            var list = "";
            for (var i in data) {
                list += cusInfo.renderContactLi(data[i]);
                if (i == 2)
                    break;
            }


            $('#contacts').append(list);
        } else {
            $('#contacts').append('<div style="padding-left:15px; font-size:12px; color:#666" class="nosearchRes">无相关联系人！</div>');
        }
    },

    renderContactLi: function(obj) {
        var list = '<li class="ui-border-b" style="height:60px;margin-right:15px">' + '<div class="ui-list-info" style="padding-top:15px;">' + '<h4 class="ui-nowrap" style="color:#333; font-size:15px;line-height:1">' + obj.linkman + ' | ' + obj.position + '</h4>' + '<span style="color:#666;font-size:12px;line-height:1">' + obj.telephone + '</span></div>';
        if (dd.ios) {
            list += '<div onclick="cusInfo.smsCall(\'' + obj.telephone + '\',\'' + obj.telephone + '\',event)">' + '<i class="ui-icon-message" style="line-height:60px; font-size:20px;color:#ec564d; padding-right: 15px;"></i></div>'
        }

        list += '<div onclick="businessCall.phoneCall(\'' + obj.id + '\',\'' + obj.telephone + '\',\'' + obj.linkman + '\',\'' + cusInfo.cusBasicInfo.cusname + '\',\'' + cusInfo.code + '\', 0, event)">' + '<i class="ui-icon-list_phone" style="line-height:60px; font-size:20px;color:#ec564d;"></i></div>' + '</li>';

        return list;
    },

    renderFollower: function(data) {
        if (data.length > 0) {
            var list = "";
            for (var i in data) {
                list += cusInfo.renderFollowerLi(data[i]);
            }
            $('#follows').append(list);
        } else {
            $('#follows').append('<div style="padding-left:15px; font-size:12px; color:#666" class="nosearchRes">无跟进人记录！</div>');
        }
    },
    messageSend: function(uname, sms, evt) {
        if (dd.ios) {
            window.location.href = "sms:" + sms;
        } else {
            window.location.href = "sms:" + sms;
            stopEventBubble(evt);
        }
    },
    renderFollowerLi: function(obj) {
        var list = '<li class="" onclick="cusInfo.showProfile(' + obj.id + ',' + obj.detailPriv + ')" style="height:60px;width:33%;">' + '<div class="follow-avatar"><span class="avatar-content">' + obj.realname.substr(-2) + '</span></div><div class="" style="padding-top:15px;">' + '<h4 class="ui-nowrap" style="color:#333; font-size:15px;line-height:1;">' + obj.realname + '<h4>' + '<span class="ui-nowrap" style="color:#666;font-size:12px;">' + obj.duty + '</span></div></li>';
        return list;
    },

    renderContracts: function(data) {
        // console.log(data);
        if (data.length < 4) {
            $("#showMoreContracts").hide();
        }
        if (data.length > 0) {
            var list = "";
            for (var i in data) {
                list += cusInfo.renderContractsLi(data[i]);
                if (i == 2)
                    break;
            }
            $('#contracts').append(list);
        } else {
            $('#contracts').append('<div style="padding-left:15px; font-size:12px; color:#666" class="nosearchRes">无合同记录！</div>');
        }
    },

    renderContractsLi: function(obj) {

        var list = '<li class="ui-border-b" style="height:60px;padding:0;margin-right:15px" onclick="cusInfo.toContractDetail(' + obj.id + ')"><div class="ui-row-flex" style="padding-top:15px;"><div class="ui-col ui-col-3" >' + '<h4 class="ui-nowrap" style="color:#333; font-size:15px;line-height:1;">' + obj.contractno + '</h4></div>' + '<div class="ui-col ui-flex ui-flex-pack-end" style="color:#666; font-size:15px; line-height:1;padding-right:15px;">' + obj.htmoney + '元</div></div>' + '<span style="color:#666;font-size:12px; line-height:1;">' + obj.realname + ' | 签订日期 ' + obj.sign_date + '</span></li>';

        return list;
    },

    cusInfoEventListener: function() {
        $("#showMoreContact").click(function() {
            $('#moreOptions').removeClass('show');
            $('#leaderPrivOption').removeClass('show');
            // console.log(typeof(JSON.stringify(cusInfo.contactorsList)));
            openLink('cusInfoContactsList.html?code=' + cusInfo.code);
        });

        $("#showMoreContracts").click(function() {
            $('#moreOptions').removeClass('show');
            $('#leaderPrivOption').removeClass('show');
            // console.log(typeof(JSON.stringify(cusInfo.contactorsList)));
            openLink('contract.html?cusid=' + cusInfo.code);
        });

        $(".addContact").click(function() {
            $('#moreOptions').removeClass('show');
            $('#leaderPrivOption').removeClass('show');
            customerContactAdd.init('cusInfo', cusInfo.code, function(obj) {
                // cusInfo.initApi();
                // $(".ui-form").show();
            });
        });

        $("#cusRewnewMore").click(function() {
            $('#moreOptions').addClass('show');
        });


        $("#lidanLoadMore").click(function() {
            $('#lidanMoreOptions').addClass('show');
        });

        $("#leaderPrivMore").click(function() {
            $('#leaderPrivOption').addClass('show');
        });

        $("#throwCancel").tap(function() {
            $('#actlist').addClass('show');
        });

        $("#throwConfirm").tap(function() {
            // console.log('throw');
            openLink('throwToPublic.html?code=' + cusInfo.code + '&jumpType=' + cusInfo.jumpType);
        });

        $(".reAllocate").click(function() {
            $('#lidanMoreOptions').removeClass('show');
            reallocateWidget.init(cusInfo.renew_owner, function(obj) {
                cusInfo.initApi();
                $(".ui-form").show();
            })
        });

        $(".recordPhone").click(startToRecordPhone);

        $(".addLidan").click(function() {
            if (cusInfo.isLidan == 1) {
                dd.device.notification.toast({
                    icon: 'warning',
                    text: '已经加入了理单！',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                });
                return;
            }
            var addLidanApi = oms_config.apiUrl + oms_apiList.addLidan;
            var ownerid = '';
            if (cusInfo.isRenew == 1) {
                var ownerid = cusInfo.cusBasicInfo.renew_ownerid;
            }
            if (cusInfo.isRenew == 0) {
                var ownerid = cusInfo.cusBasicInfo.ownerid;
            }
            if (ownerid == '' || ownerid == 0) {
                dd.device.notification.toast({
                    icon: 'warning',
                    text: '未分配人员，无法加入理单！',
                    duration: 1,
                    onSuccess: function(result) {},
                    onFail: function(err) {}
                });
                return;
            }

            $.ajax({
                type: 'POST',
                url: addLidanApi,
                data: {
                    'omsuid': JSON.parse(getCookie('omsUser')).id,
                    'token': JSON.parse(getCookie('omsUser')).token,
                    'cusid': cusInfo.code,
                    'do': cusInfo.isRenew,
                    'ownerid': ownerid
                },
                cache: false,
                success: function(data) {
                    var response = JSON.parse(data);
                    if (response.res == 1) {

                        cusInfo.bid = response.data.bid;
                        if (cusInfo.role === 1 || cusInfo.role === 4) {
                            dd.device.notification.confirm({
                                message: "加入理单成功，是否开始理单？",
                                title: "提示",
                                buttonLabels: ['否', '是'],
                                onSuccess: function(result) {
                                    if (result.buttonIndex === 1) {
                                        lidanJumper("step1");
                                    } else {
                                        history.go(0);
                                    }
                                },
                                onFail: function(err) {}
                            });
                        } else {
                            dd.device.notification.toast({
                                icon: 'success',
                                text: '已提交',
                                duration: 1,
                                onSuccess: function(result) {
                                    history.go(0);
                                },
                                onFail: function(err) {}
                            });
                        }
                    } else {
                        dd.device.notification.toast({
                            icon: 'error',
                            text: '加入理单失败，请重试！',
                            duration: 1,
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    }
                }
            });
        });

        //拉入私海
        $("#pullConfirm").click(function() {
            var pullCustomerApi = oms_config.apiUrl + oms_apiList.pullCustomer;
            $.ajax({
                type: 'POST',
                url: pullCustomerApi,
                data: {
                    'omsuid': JSON.parse(getCookie('omsUser')).id,
                    'token': JSON.parse(getCookie('omsUser')).token,
                    'cusid': cusInfo.code
                },
                cache: false,
                success: function(data) {
                    if (JSON.parse(data).res == 1) {
                        //设置localStorage
                        localStorage.setItem('oms.public.id', cusInfo.code);
                        dd.device.notification.alert({
                            message: "期待你再多一次成单，加油！",
                            title: "拉入成功", //可传空
                            buttonName: "好的",
                            onSuccess: function() {
                                // history.go(0);
                                if (cusInfo.role == 1 || cusInfo.role == 5)
                                    replaceLink('customerInfo.html?code=' + cusInfo.code + '&from=private&leaderPriv=1&jumpType=close');
                                else
                                    replaceLink('customerInfo.html?code=' + cusInfo.code + '&from=' + 'private&jumpType=close');
                            },
                            onFail: function(err) {}
                        });
                    } else {
                        dd.device.notification.toast({
                            icon: 'error',
                            text: JSON.parse(data).msg,
                            duration: 1,
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    }

                },
                error: function(xhr, type) {
                    console.log('ajax error!');
                }
            });
        });

        $(".cancelLidan").click(function() {
            $('#lidanMoreOptions').removeClass('show');
            var cancelLidanApi = oms_config.apiUrl + oms_apiList.cancelLidan;

            dd.device.notification.confirm({
                message: "取消后，可在下属客户中查看",
                title: "",
                buttonLabels: ["取消", "确定"],
                onSuccess: function(result) {
                    if (result.buttonIndex == 1) {
                        $.ajax({
                            type: 'POST',
                            url: cancelLidanApi,
                            data: {
                                omsuid: JSON.parse(getCookie('omsUser')).id,
                                token: JSON.parse(getCookie('omsUser')).token,
                                cusid: cusInfo.code
                            },
                            cache: false,
                            success: function(data) {
                                var response = JSON.parse(data);
                                if (response.res == 1) {
                                    //跳转理单列表
                                    if (cusInfo.from == 'lidan') {
                                        window.location.href = "billings.html";
                                    } else {
                                        history.go(0);
                                    }
                                } else {
                                    dd.device.notification.toast({
                                        icon: 'error',
                                        text: '取消理单失败，请重试！',
                                        duration: 1,
                                        onSuccess: function(result) {},
                                        onFail: function(err) {}
                                    });
                                }


                            }
                        });
                    }

                },
                onFail: function(err) {}
            });


        });

        function lidanJumper(f) {
            var map = {
                step1: ((parseInt(cusInfo.isRenew) || 0) === 0) ? "billingStep1" : "billing2Step1",
                step2: "billingStep2",
                step3: "billingStep3"
            };
            openLink(map[f] + '.html?cid=' + cusInfo.code + '&bid=' + cusInfo.bid);
        }
        //开始理单
        $("#startLidan").click(function() {
            lidanJumper("step1");
        });

        //填报预测
        $("#forecast").click(function() {
            // cusInfo.getBillingInfo();

            if (cusInfo.lidanFollowtype == 0) {
                dd.device.notification.confirm({
                    message: "填报预测需您先进行理单",
                    title: "", //可传空
                    buttonLabels: ["取消", "开始理单"],
                    onSuccess: function(result) {
                        //跳转至理单列表
                        if (result.buttonIndex == 1) {
                            lidanJumper("step1");
                        }

                    },
                    onFail: function(err) {}
                });
            } else {
                //填报预测
                lidanJumper("step2");
            }
            // openLink();
        });

        //申报回款
        $("#liDanReturn").click(function() {

            if (cusInfo.lidanFollowtype == 0) {
                dd.device.notification.confirm({
                    message: "回款申报需您先进行理单",
                    title: "", //可传空
                    buttonLabels: ["取消", "开始理单"],
                    onSuccess: function(result) {
                        //跳转至理单列表
                        if (result.buttonIndex == 1) {
                            //开始理单
                            lidanJumper("step1");
                        }

                    },
                    onFail: function(err) {}
                });
            } else {
                //回款申报
                lidanJumper("step3");
            }

            // console.log('liDanReturn');
            // openLink();
        });

        //开始拜访
        // $(".startVisit").click(startToVisit);

        //新增合同
        $(".new_contract").click(function() {
            openLink('contractAdd.html?cusid=' + cusInfo.code);
        });

        //添加计划
        $(".add_plan").click(function() {
            openLink('planAdd.html?cusid=' + cusInfo.code);
        });

        //BOSS点评
        $("#dingToBoss").click(function() {
            //ADD by lipengfei at 2017/2/15
            //直接跳转至必达页面
            var _user = JSON.parse(getCookie('omsUser'));
            var header = _user.realname + '针对' + cusInfo.tracker + '的客户“' + cusInfo.cusBasicInfo.cusname + '”的评价：';
            var tip = '请输入对' + cusInfo.tracker + '的客户“' + cusInfo.cusBasicInfo.cusname + '”的评价';
            var usersurl = oms_config.apiUrl + oms_apiList.getCustomerDDid;
            if (!dd.isDingTalk) {
                usersurl = oms_config.apiUrl + oms_apiList.getCustomerAssocUsers;
            }
            var promise = $.ajax({
                type: 'POST',
                url: usersurl,
                data: {
                    'omsuid': _user.id,
                    'token': _user.token,
                    'cusid': cusInfo.code
                },
                cache: false,
                dataType: 'json'
            }).always(function(result) {
                if ('res' in result && result.res === 1) {
                    cusInfo.dingSet = result.data;
                } else {
                    dd.device.notification.toast({
                        icon: 'error',
                        text: result.msg || '网络请求失败'
                    });
                }
            });
            promise.done(function() {
                dd.biz.ding.post({
                    users: cusInfo.dingSet,
                    text: '',
                    text_header: header,
                    text_tip: tip,
                    category: 'boss',
                    cusid: cusInfo.code
                });
            });
            return;
            //////////////////////////////////////////////////////////////////////END

            //ADD by lipengfei at 2016/6/25
            if (!dd.isDingTalk) {
                $("#ding").find('header h3').text('请输入必达内容');
            }
            //END
            $("#ding").dialog("show");
            var content = JSON.parse(getCookie('omsUser')).realname + '针对' + cusInfo.tracker + '的客户“' + cusInfo.cusBasicInfo.cusname + '”的评价：';
            var editContent = '';
            cusInfo.dingContent_header = content;
            $("#dingContent").val(content);
            $("#dingContent").keyup(function() {
                if ($(this).val().indexOf(content) !== 0) {
                    //FIXME: 这种 case 下，中文截取会出现异常，暂时直接丢弃
                    // var length = content.length;
                    // var current = $(this).val();
                    // var after = current.slice(length + 1);
                    // $(this).val(content + after);
                    $(this).val(content + editContent);
                } else {
                    editContent = $(this).val().substring(content.length);
                }
            });
            //禁止 剪切复制粘贴
            $("#dingContent").on('cut copy paste', function() {
                return false;
            });

            //MODIFY by lipengfei at 2016/6/25
            var getDingUsersApi = oms_config.apiUrl + oms_apiList.getCustomerDDid;
            if (!dd.isDingTalk) {
                getDingUsersApi = oms_config.apiUrl + oms_apiList.getCustomerAssocUsers;
            }
            $.ajax({
                type: 'POST',
                url: getDingUsersApi,
                data: {
                    'omsuid': JSON.parse(getCookie('omsUser')).id,
                    'token': JSON.parse(getCookie('omsUser')).token,
                    'cusid': cusInfo.code
                },
                cache: false,
                success: function(data) {
                    var response = JSON.parse(data);
                    // console.log(data);

                    if (response.res == 1) {
                        cusInfo.dingSet = response.data;
                    } else {
                        dd.device.notification.toast({
                            icon: 'error',
                            text: response.msg,
                            duration: 1,
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    }

                },
                error: function(xhr, type) {
                    console.log('ajax error!');
                }
            });
            //MODIFY-END
        });

        $("#sendDing").tap(function() {
            $("#ding").removeClass("show");
            var dingContent = $.trim($("#dingContent").val());
            var dingContent_body = dingContent.substring(cusInfo.dingContent_header.length);
            dd.biz.ding.post({
                users: cusInfo.dingSet,
                corpId: oms_config.corpId,
                alertType: 2,
                text: dingContent,
                onSuccess: function() {
                    if ($.trim(dingContent_body).length != 0) {
                        var postCommentApi = oms_config.apiUrl + oms_apiList.postComment;
                        $.ajax({
                            type: 'POST',
                            url: postCommentApi,
                            data: {
                                'omsuid': JSON.parse(getCookie('omsUser')).id,
                                'token': JSON.parse(getCookie('omsUser')).token,
                                'cusid': cusInfo.code,
                                'comment': dingContent_body,
                                'comment_header': cusInfo.dingContent_header
                            },
                            cache: false,
                            success: function(data) {
                                var response = JSON.parse(data);
                                // console.log(data);

                                if (response.res == 1) {
                                    window.location.reload();
                                } else {
                                    dd.device.notification.toast({
                                        icon: 'error',
                                        text: response.msg,
                                        duration: 1,
                                        onSuccess: function(result) {},
                                        onFail: function(err) {}
                                    });
                                }

                            },
                            error: function(xhr, type) {
                                console.log('ajax error!');
                            }
                        });
                    }


                },
                onFail: function() {}
            })
        });

        //leader转交
        $("#deliver").click(function() {
            openLink('leaderDeliver.html?cusid=' + cusInfo.code + '&cusname=' + cusInfo.cusBasicInfo.cusname);
        })
    },
    //获取理单状态
    getBillingInfo: function() {
        var getBillingInfoApi = oms_config.apiUrl + oms_apiList.getBillingInfo;
        $.ajax({
            type: 'POST',
            url: getBillingInfoApi,
            // data:{bid:'11'},
            data: {
                bid: cusInfo.bid
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                if (response.res) {
                    if (response.res.length > 0) {
                        cusInfo.lidanFollowtype = response.res[0].followtype;
                    }
                }

                // console.log(response.res[0].followtype);

            }
        });
    },

    getPhoneRecordSetting: function() {
        var checkRenewConfigApi = oms_config.apiUrl + oms_apiList.checkRenewConfig;
        cusInfo.phoneSetting = 0;
        $.ajax({
            type: 'POST',
            url: checkRenewConfigApi,
            // data:{bid:'11'},
            data: {
                cusid: cusInfo.code
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                cusInfo.phoneSetting = response.data;
            }
        });
    },

    setTop:function() {
        var setTopApi = oms_config.apiUrl + oms_apiList.setTop;
        $.ajax({
            type: 'POST',
            url: setTopApi,
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'cus_id': cusInfo.code
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                if (response.res === 1) {
                    localStorage.setItem('oms.stick.id',cusInfo.code);
                    localStorage.removeItem('oms.unstick.id');
                    dd.device.notification.toast({
                        icon: 'success',
                        text: '置顶成功！',
                        duration: 1,
                        onSuccess: function(result) {
                            location.reload();
                        },
                        onFail: function(err) {}
                    });
                }else{
                    dd.device.notification.toast({
                        icon: 'error',
                        text: response.msg,
                        duration: 1,
                        onSuccess: function(result) {

                        },
                        onFail: function(err) {}
                    });
                }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        })
    },

    unsetTop: function() {
        var unsetTopApi = oms_config.apiUrl + oms_apiList.unsetTop;
        $.ajax({
            type: 'POST',
            url: unsetTopApi,
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'cus_id': cusInfo.code
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                if (response.res === 1) {
                    localStorage.setItem('oms.unstick.id',cusInfo.code);
                    localStorage.removeItem('oms.stick.id');
                    dd.device.notification.toast({
                        icon: 'success',
                        text: '取消置顶成功！',
                        duration: 1,
                        onSuccess: function(result) {
                            location.reload();
                        },
                        onFail: function(err) {}
                    });
                }else{
                    dd.device.notification.toast({
                        icon: 'error',
                        text: response.msg,
                        duration: 1,
                        onSuccess: function(result) {
                            // location.reload();
                        },
                        onFail: function(err) {}
                    });
                }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        })
    },

    appendTop:function(){
        //未置顶
        if(cusInfo.cusBasicInfo.is_on_top == -1){
            if(cusInfo.role == 3) //新签业务员
            {
                $('#editCus').after('<button style="text-align: center;background-color: #fff;" onClick="cusInfo.setTop()">置顶</button>');
            }
            if(cusInfo.role == 2) //续签业务员
            {
                $('#more_first').css({'border-bottom-left-radius': '0px','border-bottom-right-radius': '0px'});
                $('#more_first').after('<button style="text-align: center;background-color: #fff;border-bottom-left-radius: 10px;border-bottom-right-radius: 10px;" onClick="cusInfo.setTop()">置顶</button>');
            }
            if(cusInfo.role == 1 && cusInfo.leaderPriv == 1){
                $('#editCus').after('<button style="text-align: center;background-color: #fff;" onClick="cusInfo.setTop()">置顶</button>');
            }
            if(cusInfo.role != 1 && cusInfo.leaderPriv == 1){
                $('#more_first').css({'border-bottom-left-radius': '0px','border-bottom-right-radius': '0px'});
                $('#more_first').after('<button style="text-align: center;background-color: #fff;border-bottom-left-radius: 10px;border-bottom-right-radius: 10px;" onClick="cusInfo.setTop()">置顶</button>');
            }
        }else{//已置顶
            if(cusInfo.role == 3) //新签业务员
            {
                $('#editCus').after('<button style="text-align: center;background-color: #fff;" onClick="cusInfo.unsetTop()">取消置顶</button>');
            }
            if(cusInfo.role == 2) //续签业务员
            {
                $('#more_first').css({'border-bottom-left-radius': '0px','border-bottom-right-radius': '0px'});
                $('#more_first').after('<button style="text-align: center;background-color: #fff;border-bottom-left-radius: 10px;border-bottom-right-radius: 10px;" onClick="cusInfo.unsetTop()">取消置顶</button>');
            }
            if(cusInfo.role == 1 && cusInfo.leaderPriv == 1){
                $('#editCus').after('<button style="text-align: center;background-color: #fff;" onClick="cusInfo.unsetTop()">取消置顶</button>');
            }
            if(cusInfo.role != 1 && cusInfo.leaderPriv == 1){
                $('#more_first').css({'border-bottom-left-radius': '0px','border-bottom-right-radius': '0px'});
                $('#more_first').after('<button style="text-align: center;background-color: #fff;border-bottom-left-radius: 10px;border-bottom-right-radius: 10px;" onClick="cusInfo.unsetTop()">取消置顶</button>');
            }
        }
    },
    setAttention:function() {
        var addLidanAttentionRateApi = oms_config.apiUrl + oms_apiList.addLidanAttentionRate;
        $.ajax({
            type: 'POST',
            url: addLidanAttentionRateApi,
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'cusid': cusInfo.code
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                if (response.res === 1) {
                    // localStorage.setItem('oms.attention.id',cusInfo.code);
                    // localStorage.removeItem('oms.unattention.id');
                    dd.device.notification.toast({
                        icon: 'success',
                        text: '关注成功！',
                        duration: 1,
                        onSuccess: function(result) {
                            location.reload();
                        },
                        onFail: function(err) {}
                    });
                }else{
                    dd.device.notification.toast({
                        icon: 'error',
                        text: response.msg,
                        duration: 1,
                        onSuccess: function(result) {

                        },
                        onFail: function(err) {}
                    });
                }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        })
    },

    unsetAttention: function() {
        var removeLidanAttentionRateApi = oms_config.apiUrl + oms_apiList.removeLidanAttentionRate;
        $.ajax({
            type: 'POST',
            url: removeLidanAttentionRateApi,
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'cusid': cusInfo.code
            },
            cache: false,
            success: function(data) {
                var response = JSON.parse(data);
                if (response.res === 1) {
                    // localStorage.setItem('oms.unattention.id',cusInfo.code);
                    // localStorage.removeItem('oms.attention.id');
                    dd.device.notification.toast({
                        icon: 'success',
                        text: '取消关注成功！',
                        duration: 1,
                        onSuccess: function(result) {
                            location.reload();
                        },
                        onFail: function(err) {}
                    });
                }else{
                    dd.device.notification.toast({
                        icon: 'error',
                        text: response.msg,
                        duration: 1,
                        onSuccess: function(result) {
                            // location.reload();
                        },
                        onFail: function(err) {}
                    });
                }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        })
    },
    appendAttention:function(){
        //未置顶
        if(cusInfo.from == 'lidan' && (cusInfo.role == 1 || cusInfo.role == 4) && cusInfo.attention_rate == 0){
            console.log(11222);
            $('#more_first').css({'border-bottom-left-radius': '0px','border-bottom-right-radius': '0px'});
            $('#more_first').after('<button style="text-align: center;background-color: #fff;border-bottom-left-radius: 10px;border-bottom-right-radius: 10px;" onClick="cusInfo.setAttention()">关注</button>');
        }
        if(cusInfo.from == 'lidan' && (cusInfo.role == 1 || cusInfo.role == 4) && cusInfo.attention_rate == 1){
            $('#more_first').css({'border-bottom-left-radius': '0px','border-bottom-right-radius': '0px'});
            $('#more_first').after('<button style="text-align: center;background-color: #fff;border-bottom-left-radius: 10px;border-bottom-right-radius: 10px;" onClick="cusInfo.unsetAttention()">取消关注</button>');
        }
    },

    getContactData: function() {

        var cusInfoApi = oms_config.apiUrl + oms_apiList.getCustomerInfo;
        $.ajax({
            type: 'POST',
            url: cusInfoApi,
            data: {
                'omsuid': JSON.parse(getCookie('omsUser')).id,
                'token': JSON.parse(getCookie('omsUser')).token,
                'cusid': cusInfo.code,
                'from': cusInfo.from
            },
            cache: false,
            success: function(data) {
                // $(".loading-content").show();
                var response = JSON.parse(data);
                if (response.res == 1) {
                    $(".loading-content").show();
                    cusInfo.cusBasicInfo = response.data.info;
                    cusInfo.attention_rate = response.data.attention_rate;
                    cusInfo.contactorsList = response.data.contactors;
                    //渲染更多——置顶
                    cusInfo.appendTop();
                    cusInfo.appendAttention();
                    //新签 or 续签
                    if (response.data.info.status < 8) {
                        cusInfo.isRenew = 0;
                    } else {
                        cusInfo.isRenew = 1;
                    }

                    console.log(cusInfo.isRenew);
                    // cusInfo.isRenew = response.data.isRenew;
                    cusInfo.bid = response.data.bid;
                    if (response.data.contracts) {
                        cusInfo.contractsList = response.data.contracts.list;
                    } else
                        cusInfo.contractsList = '';

                    var followsList = response.data.trackers;
                    if (cusInfo.cusBasicInfo.follow_type == null || cusInfo.cusBasicInfo.follow_type == "") {
                        cusInfo.cusBasicInfo.follow_type = '暂无';
                    }
                    //判断合同是否截止
                    var today = new Date();
                    var temp_contract = {};

                    // console.log(typeof(cusInfo.contractsList));
                    for (i in cusInfo.contractsList) {

                        if (today.getTime() <= new Date(cusInfo.contractsList[i]['enddate']).getTime()) {
                            temp_contract = cusInfo.contractsList[i];
                            break;
                        }

                    }

                    cusInfo.cusBasicInfo.enddate = temp_contract['enddate'];
                    cusInfo.cusBasicInfo.new_product_version = temp_contract['new_product_version'];
                    cusInfo.mylevel = cusInfo.cusBasicInfo.renew_mylevel;

                    if (cusInfo.isRenew == 0) {
                        cusInfo.mylevel = cusInfo.cusBasicInfo.mylevel;
                        cusInfo.managerlevel = cusInfo.cusBasicInfo.managerlevel;
                    }
                    if (cusInfo.isRenew == 1) {
                        cusInfo.mylevel = cusInfo.cusBasicInfo.renew_mylevel;
                        cusInfo.managerlevel = cusInfo.cusBasicInfo.renew_managerlevel;
                    }
                    // console.log(cusInfo.mylevel);
                    cusInfo.renderInfo(cusInfo.cusBasicInfo);
                    cusInfo.isLidan = response.data.isLidan;
                    //渲染详情header和footer
                    var element_data = {
                        "cusname": cusInfo.cusBasicInfo.cusname,
                        "safedays": cusInfo.cusBasicInfo["safedays"],
                        "score": cusInfo.cusBasicInfo["score"],
                        "enddate": temp_contract["enddate"],
                        "isLidan": response.data.isLidan,
                        "renew_owner": cusInfo.cusBasicInfo.renew_ownerid,
                        "into_time": cusInfo.cusBasicInfo.into_time
                    };
                    if (cusInfo.from == 'lidan') {
                        if (cusInfo.isRenew == 1) {
                            if (cusInfo.cusBasicInfo.renew_ownerid == 0)
                                element_data.tracker = '';
                            else
                                element_data.tracker = followsList.length > 0 ? followsList[0]['realname'] : "";
                        } else {
                            element_data.tracker = followsList.length > 0 ? followsList[0]['realname'] : "";
                        }

                        element_data.forecast = cusInfo.cusBasicInfo.forecast;
                        cusInfo.tracker = element_data.tracker;
                    }

                    if (cusInfo.from == 'private') {
                        if (cusInfo.isRenew == 1) {
                            if (cusInfo.cusBasicInfo.renew_ownerid == 0)
                                element_data.tracker = '';
                            else
                                element_data.tracker = followsList.length > 0 ? followsList[0]['realname'] : "";
                        } else {
                            element_data.tracker = followsList.length > 0 ? followsList[0]['realname'] : "";
                        }
                        // element_data.tracker = followsList.length>0?followsList[followsList.length-1]['realname']:"";
                        cusInfo.tracker = element_data.tracker;
                        if (cusInfo.role == 1) {
                            cusInfo.renderFollower(followsList);
                            cusInfo.renderContracts(cusInfo.contractsList);
                        }
                        if (cusInfo.role == 3) {
                            cusInfo.renderFollower(followsList);
                            // cusInfo.renderContracts(cusInfo.contractsList);
                        }
                    }
                    cusInfo.renew_owner = cusInfo.cusBasicInfo.renew_ownerid;
                    cusInfo.renderElement(element_data);

                    if (cusInfo.from == 'private') {
                        cusInfo.renderContactList(cusInfo.contactorsList);
                        if (cusInfo.role == 2 || cusInfo.role == 4 || cusInfo.role == 5) {
                            cusInfo.renderFollower(followsList);
                            cusInfo.renderContracts(cusInfo.contractsList);
                        }
                    }

                    if (cusInfo.from == 'public') {
                        cusInfo.renderContactList(cusInfo.contactorsList);
                        if (cusInfo.role == 5) {
                            cusInfo.renderFollower(followsList);
                            cusInfo.renderContracts(cusInfo.contractsList);
                        }
                    }
                    if (cusInfo.from == 'lidan') {
                        cusInfo.renderContactList(cusInfo.contactorsList);
                        if (cusInfo.role == 2 || cusInfo.role == 4 || cusInfo.role == 5) {
                            cusInfo.renderFollower(followsList);
                            cusInfo.renderContracts(cusInfo.contractsList);
                        }
                        // if(cusInfo.role == 2 || cusInfo.role == 4)
                        // {
                        // 	cusInfo.renderFollower(followsList);
                        // 	cusInfo.renderContracts(cusInfo.contractsList);
                        // }
                    }

                    cusInfo.getCommentData();

                } else {
                    dd.device.notification.toast({
                        icon: 'error',
                        text: response.msg,
                        duration: 1,
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                }
            },
            error: function(xhr, type) {
                console.log('ajax error!');
            }
        });
    },

    getCommentData: function() {
        var getCommentsApi = oms_config.apiUrl + oms_apiList.getComments;
        $.ajax({
            type: 'POST',
            url: getCommentsApi,
            data: {
                "omsuid": JSON.parse(getCookie("omsUser")).id,
                "token": JSON.parse(getCookie("omsUser")).token,
                "cusid": cusInfo.code,
                "currpage": 1
            },
            cache: false,
            success: function(data) {

                var response = JSON.parse(data);
                if (response.res == 1) {
                    // window.localStorage.clear();
                    //获取已读缓存列表
                    var newsTip = localStorage.getItem('oms_ding_red');
                    console.log(newsTip);
                    if (newsTip === null) {
                        localStorage.setItem('oms_ding_red', JSON.stringify([]));
                    }
                    if (response.data.length > 0) {
                        newsTip = JSON.parse(newsTip);
                        if (_.indexOf(newsTip, response.data[0]['id']) == -1) {
                            cusInfo.tipFlag = 1;
                            cusInfo.storageId = response.data[0]['id'];
                            $(".tab-header").css('height', '170px');
                            $(".newsTipBlock").show();
                            $(".ui-tab-content").css('margin-top', '170px !important');
                            cusInfo.renderCommentTip(response.data);
                        } else {
                            cusInfo.tipFlag = 0;
                        }
                    } else {
                        cusInfo.tipFlag = 0;
                    }

                }
            }
        });
    },

    renderCommentTip: function(data) {
        var htmlTpl = '<div class="cusInfo-newstips" onclick="cusInfo.showDingList(\'' + data[0]['id'] + '\')">' + '<i class="ui-icon-warning cusInfo-newstips-info"></i>' + '<div class="ui-nowrap newstips-content">BOSS点评：' + data[0]['comment'] + '</div>' + '<i class="ui-icon-list_arrow_right cusInfo-newstips-right"></i>' + '</div>'

        $('#cusInfo_newstips').append(htmlTpl);
    },

    showDingList: function(id) {
        var newsTip = JSON.parse(localStorage.getItem('oms_ding_red'));
        newsTip.push(id);
        // console.log(cusid);
        localStorage.setItem('oms_ding_red', JSON.stringify(newsTip));
        openLink('dingList.html?cusid=' + cusInfo.code + '&cusname=' + cusInfo.cusBasicInfo.cusname);
    },

    JumpToDing: function() {
        if (cusInfo.tipFlag == 1) {
            var newsTip = JSON.parse(localStorage.getItem('oms_ding_red'));
            newsTip.push(cusInfo.storageId);
            localStorage.setItem('oms_ding_red', JSON.stringify(newsTip));
        }
        openLink('dingList.html?cusid=' + cusInfo.code + '&cusname=' + cusInfo.cusBasicInfo.cusname);
    },

    JumpToCommentRecord: function(type) {
        openLink('commentList.html?cusid=' + cusInfo.code + '&cusname=' + cusInfo.cusBasicInfo.cusname+'&type='+type);
    },
    toContractDetail: function(id) {
        openLink("contractInfo.html?conid=" + id);
    },

    moreAct: function() {
        if (cusInfo.lastCount == 50) {
            var lastId = $("#customerAct").data('id');
            setCustomerAct(lastId);
        }
    },

    showProfile: function(id, flag) {

        if (flag) {
            openLink("profile.html?id=" + id + "&do=" + cusInfo.isRenew);
        } else {
            dd.device.notification.alert({
                message: "非常抱歉，暂无权限查看",
                title: "提示",
                buttonName: "知道了",
                onSuccess: function() {

                },
                onFail: function(err) {}
            });
        }

    },

    initRight: function() {
        // var texta = cusInfo._top == 1 ? '取消置顶' : '置顶';
        if (cusInfo.from == 'private') {
            var texta = '更多';
            dd.biz.navigation.setRight({
                show: true,
                control: true,
                showIcon: true,
                text: texta,
                onSuccess: function(result) {
                    if (cusInfo.leaderPriv == 1) {
                        if (cusInfo.role == 3 || cusInfo.role == 1)
                            $('#actlist').addClass('show');
                        else
                            $('#otherMore').addClass('show');
                    } else {
                        if (cusInfo.role == 3)
                            $('#actlist').addClass('show');
                        else
                            $('#otherMore').addClass('show');
                    }

                },
                onFail: function(err) {}
            });
        } else if (cusInfo.from == 'lidan') {
            var texta = '更多';
            dd.biz.navigation.setRight({
                show: true,
                control: true,
                showIcon: true,
                text: texta,
                onSuccess: function(result) {
                    $('#otherMore').addClass('show');
                },
                onFail: function(err) {}
            });
        } else {
            dd.biz.navigation.setRight({
                show: false,
                control: false,
                showIcon: false,
                text: texta,
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
        }

    },

    initTab: function() {
        // if(cusInfo.role == 2 || cusInfo.role == 3)
        // {
        // 	$("#tab3").remove();
        // 	$("#visitPlan").remove();
        // }

        var tab = new fz.Scroll('.ui-tab', {
            role: 'tab'
        });

        if (cusInfo.from == 'act') {
            $(".current").removeClass('current');
            $("#tab2").addClass('current');
            var $vv = $("#customerAct");
            tab.scrollToElement($vv[0], 500, true, false);
            tab.currentPage = 1;
        } else if (cusInfo.from == 'plan') {
            $(".current").removeClass('current');
            $("#tab3").addClass('current');
            var $vv = $("#visitPlan");
            tab.scrollToElement($vv[0], 500, true, false);
            tab.currentPage = 2;
        }

        /* 滑动开始前 */
        // tab.on('beforeScrollStart', function(fromIndex, toIndex) {
        //     console.log(fromIndex,toIndex);// from 为当前页，to 为下一页
        // })


    },

    initLeft: function() {

        dd.ready(function() {
            if (dd.ios) {
                dd.biz.navigation.setLeft({
                    show: true,
                    control: true,
                    showIcon: true,
                    text: '',
                    onSuccess: function(result) {
                        if (cusInfo.jumpType == "close")
                            dd.biz.navigation.close({
                                onSuccess: function(result) {},
                                onFail: function(err) {}
                            });
                        else
                            history.back(-1);
                    },
                    onFail: function(err) {}
                });
            } else {
                //omsapp-android-setLeft:visible:true
                dd.biz.navigation.setLeft({
                    visible: true,
                    control: false,
                    text: ''
                });
                $(document).off('backbutton');
                $(document).on('backbutton', function(e) {
                    if (cusInfo.jumpType == "close")
                        dd.biz.navigation.close({
                            onSuccess: function(result) {},
                            onFail: function(err) {}
                        });
                    else
                        history.back(-1);
                    e.preventDefault();
                });
            }
        });
    },

    initApi: function() {
        // cusInfo.inFollowPage = 0;
        // console.log('initApi');
        dd.ready(function() {
            dd.biz.navigation.setTitle({
                title: '客户详情',
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
            cusInfo.initRight();
        });
        cusInfo.initLeft();
        cusInfo.initTab();
    },

    init: function() {
        //ADD by lipengfei at 2016/6/25
        if (!dd.isDingTalk) {
            wrapDingpostJSAPI();
        }
        //END

        cusInfo.initApi();

        // console.log(cusInfo.code);
        cusInfo.getContactData();


        setCustomerAct();

        attatchVisitLineAction();
    },

    choosePresonal: function() {
        $("#main-body").hide();
        dd.ready(function() {
            dd.biz.navigation.setTitle({
                title: '个人评级',
                onSuccess: function(result) {},
                onFail: function(err) {}
            });
            dd.biz.navigation.setRight({
                show: true,
                control: true,
                showIcon: true,
                text: '保存',
                onSuccess: function(result) {
                    cusInfo.applyMylevel();
                },
                onFail: function(err) {}
            });
            if (dd.ios) {
                dd.biz.navigation.setLeft({
                    show: true,
                    control: true,
                    showIcon: true,
                    text: '',
                    onSuccess: function(result) {
                        $("#chooseMylevel").remove();
                        cusInfo.initApi();
                        $("#main-body").show();
                    },
                    onFail: function(err) {}
                });
            } else {
                $(document).off('backbutton');
                $(document).on('backbutton', function(e) {
                    $("#chooseMylevel").remove();
                    cusInfo.initApi();
                    $("#main-body").show();
                    e.preventDefault();
                });
            }
        });

        cusInfo.renderChooseMylevel();
    },

    renderChooseMylevel: function() {
        var htmlTpl = "<div class='map-poi-container-wrap' id='chooseMylevel'><div class='map-poi-container'><ul class='ui-list ui-list-text ui-list-active ui-border-b form-group' id='chooseMylevel_li'>" + '<li class="ui-border-t mylevel-li" data-id="a"><h4 class="ui-nowrap">a级</h4><div class="ui-poi-dist"></div></li><li class="ui-border-t mylevel-li" data-id="b"><h4 class="ui-nowrap">b级</h4><div class="ui-poi-dist"></div></li><li class="ui-border-t mylevel-li" data-id="c"><h4 class="ui-nowrap">c级</h4><div class="ui-poi-dist"></div></li><li class="ui-border-t mylevel-li" data-id="d"><h4 class="ui-nowrap">d级</h4><div class="ui-poi-dist"></div></li></ul></div></div>';
        $("body").append(htmlTpl);
        // console.log(cusInfo.mylevel);
        $('[data-id = "' + cusInfo.mylevel + '"]').find('.ui-poi-dist').html('<i class="ui-icon-list_cerrect" style="font-size:20px;color:#ec564d;padding-right:15px"></i>');
        cusInfo.renderChooseMylevelListener();

    },

    renderChooseMylevelListener: function() {
        $("#chooseMylevel_li li").click(function(event) {
            var id = $(this).data('id');
            // console.log(id);
            cusInfo.mylevel = id;
            $(this).siblings('.ui-border-t').find('.ui-icon-list_cerrect').remove();
            $(this).find('.ui-poi-dist').html('<i class="ui-icon-list_cerrect"  style="font-size:20px;color:#ec564d;padding-right:15px"></i>');

            stopEventBubble(event);
        });
    },

    applyMylevel: function() {
        // console.log(cusInfo.isRenew);
        var levelModifytApi = oms_config.apiUrl + oms_apiList.levelModify;
        var post_data = {
            omsuid: JSON.parse(getCookie('omsUser')).id,
            token: JSON.parse(getCookie('omsUser')).token,
            cusid: cusInfo.code,
            isrenew: cusInfo.isRenew,
            level: cusInfo.mylevel
        };
        $.ajax({
            type: 'POST',
            url: levelModifytApi,
            data: post_data,
            cache: false,
            success: function(data) {

                var response = JSON.parse(data);


                if (response.res == 1) {
                    dd.device.notification.toast({
                        icon: '',
                        text: '已提交',
                        duration: 1,
                        onSuccess: function(result) {
                            $("#cusPersonal-content").html(cusInfo.mylevel);
                            $("#chooseMylevel").remove();
                            cusInfo.initApi();
                            $("#main-body").show();
                        },
                        onFail: function(err) {}
                    });

                } else {
                    dd.device.notification.toast({
                        icon: 'error',
                        text: response.msg,
                        duration: 1,
                        onSuccess: function(result) {},
                        onFail: function(err) {}
                    });
                }
            }
        })

    },

    switchNull: function(data) {
        if (data == '' || typeof(data) == 'undefined') {
            return '无';
        } else
            return data;
    },
};

$.fn.cusInfo = function(settings) {
    $.extend(cusInfo, settings || {});
};

function choosePresonal() {

    // dd.biz.util.chosen({
    //     source:[{
    //         key: 'a级', //显示文本
    //         value: '1' //值，
    //     },{
    //         key: 'b级',
    //         value: '2'
    //     },{
    //         key: 'c级',
    //         value: '3'
    //     },{
    //         key: 'd级',
    //         value: '4'
    //     }],
    //     onSuccess : function(result) {
    //     	$("#cusPersonal h4").html(result.key);
    //     //onSuccess将在点击完成之后回调
    //         /*
    //         {
    //             key: '选项2',
    //             value: '234'
    //         }
    //         */
    //     },
    //     onFail : function() {}
    // })
}

function startToRecordPhone() {
    // console.log(cusInfo.role);
    // return;
    // if (cusInfo.isRenew == 1) {
    //     if (cusInfo.phoneSetting == 0) {
    //         dd.device.notification.alert({
    //             message: "您还未进行初始化配置，要先在电脑上进行初始化配置哦！",
    //             title: "提示", //可传空
    //             buttonName: "知道了",
    //             onSuccess: function() {},
    //             onFail: function(err) {}
    //         });
    //         return;
    //     }
    // }
    openLink('phoneRecord.html?code=' + cusInfo.code + '&cusname=' + cusInfo.cusBasicInfo.cusname + '&from=' + cusInfo.from + '&do=' + cusInfo.isRenew);
}

function editCustomer() {
    // console.log(cusInfo.cusBasicInfo.cusname);
    openLink('customerAdd.html?code=' + 'edit' + '&name=' + cusInfo.cusBasicInfo.cusname + '&cusid=' + cusInfo.code + '&from=' + cusInfo.from);
}

function toPublic() {
    $('#actlist').removeClass('show');
    $('#otherMore').removeClass('show');
    $('#toPublic').dialog('show');
}

function startToVisit(visitStyle) {
    var subvisit = false;
    if(visitStyle=='accompany'&&(cusInfo.role == '1'||cusInfo.role == '4'||cusInfo.role == '5')){
        subvisit = true;
    }
    // if(cusInfo.role == '2' || cusInfo.role == '4'){
    // if(cusInfo.isRenew == '1'){
    //     //只有续签客户才需要配置
    //     if(cusInfo.phoneSetting == 0)
    //     {
    //         dd.device.notification.alert({
    //             message: "您还未进行初始化配置，要先在电脑上进行初始化配置哦！",
    //             title: "提示",//可传空
    //             buttonName: "知道了",
    //             onSuccess : function() {},
    //             onFail : function(err) {}
    //         });
    //         return;
    //     }
    // }
    //在跳转之前，应该判断是否有已经开始的拜访或者陪访
    var checkStateApi = oms_config.apiUrl + oms_apiList.checkState + '?rand=' + Math.random();
    $.post(checkStateApi, {
        'uid': JSON.parse(getCookie('omsUser')).id
    }, function(result) {
        var resultStr = JSON.parse(result);
        console.log(resultStr);
        if (!resultStr['data']) {
            openLink('doVisitLocate.html?cusId=' + cusInfo.code + (subvisit?'&subvisit=1':''));
        } else if (resultStr['data']['id']) {
            openLink('doVisitClose.html?visitId=' + resultStr['data']['id']);
        }
    });
}

function startToTrain(){
    // if(cusInfo.isRenew == '1'){
    //     //只有续签客户才需要配置
    //     if(cusInfo.phoneSetting == 0)
    //     {
    //         dd.device.notification.alert({
    //             message: "您还未进行初始化配置，要先在电脑上进行初始化配置哦！",
    //             title: "提示",//可传空
    //             buttonName: "知道了",
    //             onSuccess : function() {},
    //             onFail : function(err) {}
    //         });
    //         return;
    //     }
    // }
    //在跳转之前，应该判断是否有已经开始的拜访或者陪访
    var checkTrainStateApi = oms_config.apiUrl + oms_apiList.checkTrainState + '?rand=' + Math.random();
    $.post(checkTrainStateApi, {
        'uid': JSON.parse(getCookie('omsUser')).id
    }, function(result) {
        var resultStr = JSON.parse(result);
        console.log(resultStr);
        if (!resultStr['data']) {
            openLink('doVisitLocate.html?cusId=' + cusInfo.code + '&train=1');
        } else if (resultStr['data']['id']) {
            openLink('doVisitClose.html?trainId=' + resultStr['data']['id'] + '&train=1');
        }
    });
    //    openLink('doVisitLocate.html?cusId='+cusInfo.code+'&train=1');
}

function formatDate(timestamp, flag) {
    timestamp = timestamp * 1;
    var now = new Date(timestamp);
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    var week = now.getDay();
    if (flag == 1) {
        return (month < 10 ? ('0' + month) : month) + "月" + (date < 10 ? ('0' + date) : date) + '日';
    } else if (flag == 2) {
        var td = getToday(0);
        var seconds = parseInt((timestamp - td) / 1000);
        var n = parseInt((timestamp - td + 28800000) / 86400000);
        if (n == 0) {
            return '今天';
        } else if (n == 1) {
            return '明天';
        } else {
            switch (week) {
                case 0:
                    return '星期天';
                    break;
                case 1:
                    return '星期一';
                    break;
                case 2:
                    return '星期二';
                    break;
                case 3:
                    return '星期三';
                    break;
                case 4:
                    return '星期四';
                    break;
                case 5:
                    return '星期五';
                    break;
                default:
                    return '星期六';
                    break;
            }
        }
        return week;
    } else if (flag == 5) {
        var td = getToday(0);
        var seconds = parseInt((timestamp - td) / 1000);
        var n = parseInt((timestamp - td + 28800000) / 86400000);
        if (n == 0) {
            return '今天';
        } else if (n == 1) {
            return '明天';
        } else {
            return n + '天后';
        }
    } else {
        return year + "-" + (month < 10 ? ('0' + month) : month) + "-" + (date < 10 ? ('0' + date) : date);
    }
}

function formatTime(timestamp) {
    timestamp = timestamp * 1;
    var real_now = new Date();
    var real_time = real_now.getTime();

    var n = real_time - timestamp;
    if (n < 3600000) {
        return parseInt(n / 60000) + '分钟前';
    } else if (n < 86400000) {
        return parseInt(n / 3600000) + '小时前';
    } else {
        var now = new Date(timestamp);
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var date = now.getDate();
        return (month < 10 ? ('0' + month) : month) + "月" + (date < 10 ? ('0' + date) : date) + '日';
    }
}



function showDetail(obj) {

}
//1208修改成按时间戳分页
function setCustomerAct(nextId) {
    var data = {
        type: "dingVisitInfo",
        entCode: entCode,
        deviceId: deviceId,
        customerCode: cusInfo.code,
        visitDateType: 9,
        pageSize: 50,
        nextId: nextId
    };
    /*	store.getCustomerActNew(data,function(response){
    		var responseObj = JSON.parse(response);
    		renderActList(responseObj);
    	});*/

    // store.getCustomerAct(cusInfo.code,"",function(response){
    // 	var responseObj = JSON.parse(response);
    // 	console.log(responseObj);
    // 	renderActListNew(responseObj);
    // });
}

function renderActListNew(response) {
    cusInfo.lastCount = response.data.length;
    if (response.data.length > 0) {
        var li = '';
        for (var i = response.data.length - 1; i >= 0; i--) {
            var con = response.data[i];
            var content = '';
            if (con.category == 0) {

                li += '<section class="ui-panel ui-panel-pure act_panel type1" style="">';
                li += '<ul class="ui-list ui-list-one"><li class="mg0"><div class="ui-list-thumb-s">';
                li += '<span class="ui-avatar-tiled"><span class="hecom-avatar-text">';
                if (con.avatar == null || con.avatar == "") {
                    li += '<span style="top:-3px;">' + con.employeeName.substr(-2) + '</span>';
                } else {
                    li += '<img src="' + con.avatar + '" />';
                }

                li += '</span></span></div><div><p class="act_title">' + con.employeeName + '&nbsp;<span style="color:#c7c7cc;">|</span>&nbsp;拜访</p>';
                content += '<ul class="ui-list"><li class="act_li" style="margin-left:0;"><p class="mt4 ui-nowrap-multi ui-whitespace" style="padding:0;">';
                content += '<img class="act_local_icon" src="' + replaceImageUrl('static/img/local_2x.png') + '"><span class="act_binding">' + con.reqContent + '</span></p></li></ul>';

            } else {
                if (con.reqContent.indexOf('<module id=') > -1) {
                    var $root = parseXml(con.reqContent);
                    var $children = $root.children('module');
                    var mdid = $children.attr('id');
                    var name = $children.attr('name');

                    var n = arrIndexOf(types, name);
                    if (n == -1) {
                        n = types.length;
                        types.push(name);
                    }

                    li += '<section class="ui-panel ui-panel-pure act_panel type' + n + '" style="">';
                    li += '<ul class="ui-list ui-list-one"><li class="mg0"><div class="ui-list-thumb-s">';
                    li += '<span class="ui-avatar-tiled"><span class="hecom-avatar-text">';
                    if (con.avatar == null || con.avatar == "") {
                        li += '<span style="top:-3px;">' + con.employeeName.substr(-2) + '</span>';
                    } else {
                        li += '<img src="' + con.avatar + '" />';
                    }

                    li += '</span></span></div><div><p class="act_title">' + con.employeeName + '&nbsp;<span style="color:#c7c7cc;">|</span>&nbsp;' + name + '</p>';
                    content += '<ul class="ui-list ui-list-pure" style="line-height:20px;">' + xml2html($children) + '</ul>';
                } else if (con.reqContent.indexOf('<submodule id=') > -1) {
                    var $root = parseXml(con.reqContent);
                    var $children = $root.children('submodule');
                    var mdid = $children.attr('id');
                    var name = $children.attr('name');

                    var n = arrIndexOf(types, name);
                    if (n == -1) {
                        n = types.length;
                        types.push(name);
                    }

                    li += '<section class="ui-panel ui-panel-pure act_panel type' + n + '" style="">';
                    li += '<ul class="ui-list ui-list-one"><li class="mg0"><div class="ui-list-thumb-s">';
                    li += '<span class="ui-avatar-tiled"><span class="hecom-avatar-text">';
                    if (con.avatar == null || con.avatar == "") {
                        li += '<span style="top:-3px;">' + con.employeeName.substr(-2) + '</span>';
                    } else {
                        li += '<img src="' + con.avatar + '" />';
                    }

                    li += '</span></span></div><div><p class="act_title">' + con.employeeName + '&nbsp;<span style="color:#c7c7cc;">|</span>&nbsp;' + name + '</p>';
                    content += '<ul class="ui-list ui-list-pure" style="line-height:20px;">' + xml2html($children) + '</ul>';
                } else {
                    var n = arrIndexOf(types, '其他事项');
                    if (n == -1) {
                        var n = types.length;
                        types.push('其他事项');
                    }

                    li += '<section class="ui-panel ui-panel-pure act_panel type' + n + '" style="">';
                    li += '<ul class="ui-list ui-list-one"><li class="mg0"><div class="ui-list-thumb-s">';
                    li += '<span class="ui-avatar-tiled"><span class="hecom-avatar-text">';
                    if (con.avatar == null || con.avatar == "") {
                        li += '<span style="top:-3px;">' + con.employeeName.substr(-2) + '</span>';
                    } else {
                        li += '<img src="' + con.avatar + '" />';
                    }

                    li += '</span></span></div><div><p class="act_title">' + con.employeeName + '&nbsp;<span style="color:#c7c7cc;">|</span>&nbsp;其他事项</p>';

                    content += '<ul class="ui-list"><li class="act_li" style="margin-left:0;"><p class="mt4 ui-nowrap-multi ui-whitespace" style="padding:0;">';
                    content += '<img class="act_local_icon" src="' + replaceImageUrl('images/local_2x.png') + '"><span class="act_binding">' + con.reqContent + '</span></p></li></ul>';
                }
            }

            var chosen = '<div class="ui-searchbar-wrap" style="background:none;height:40px;margin-bottom:10px;" onclick="showChoose()">';
            chosen += '<div class="ui-searchbar ui-border-radius" style="color:#666;height:40px;"><div id="chosetxt" class="ui-searchbar-text">全部数据</div>';
            chosen += '<i style="line-height:40px;" class="ui-icon-unfold"></i></div></div>';

            li += '<p class="act_time">' + formatTime(con.createon) + '</p></div></li>';
            li += '<li class="act_info" style="padding-top:0;">' + content + '</li></ul></section>';
        }
        $("#customerAct").html(li);
        initListEvent();
    }
}

function renderActList(response) {
    cusInfo.lastCount = response.data.length;
    if (response.data.length > 0) {
        var li = '';
        for (var i in response.data) {
            var con = response.data[i];
            var content = '';
            var imgarr = typeof(con.photoUrls) == 'undefined' ? [] : con.photoUrls.split(';');
            var imgs = "";
            for (var n in imgarr) {
                imgs += '<img class="actimg previewimg" src="' + replaceImageUrl(imgarr[n]) + '" />';
            }
            li += '<section data-id="' + con.sign_in_time + '" class="ui-panel ui-panel-pure act_panel" style="margin-top:5px;">';
            li += '<ul class="ui-list ui-list-one" style="padding-bottom:8px;"><li class="mg0"><div class="ui-list-thumb-s">';
            li += '<span class="ui-avatar-tiled"><span class="hecom-avatar-text">';

            if (con.empl_photo == null) {
                li += '<span style="top:0;">' + con.empl_name.substr(-2) + '</span>';
            } else {
                li += '<img src="' + con.empl_photo + '" />';
            }
            li += '</span></span></div><div><p class="act_title">' + con.empl_name + '&nbsp;<span style="color:#c7c7cc;">|</span>&nbsp;拜访</p>';
            li += '<p class="act_time">' + formatTime(con.sign_in_time) + '</p></div></li>';
            li += '<li class="act_info" style="padding-top:0;"><ul class="ui-list">' + '<li class="line-height-13 mg0"><p>' + con.description + '</p></li>' + '<li class="line-height-25 mg0 mt10">' + imgs + '</li>' + '<li class="act_li mg0">' + '<p class="mt4 ui-nowrap-multi ui-whitespace" style="padding:0;">' + '<img class="act_local_icon" src="static/img/local_2x.png">' + '<span class="act_binding">' + con.sign_in_place + '</span></p></li></ul></li></ul></section>';
            $("#customerAct").attr('data-id', con.sign_in_time);
        }
        $("#customerAct").html(li);
        initListEvent();
    }
}

function initListEvent() {

    $("body").on("click", ".previewimg", function(event) {
        var parentElement = $(this).parent();
        var childImages = parentElement.find(".previewimg");
        var curIndex = (childImages.index($(this)));
        var arr = [];
        for (var i = 0, l = childImages.size(); i < l; i++) {
            arr.push($(childImages[i]).attr("src"));
        }
        dd.ready(function() {
            dd.biz.util.previewImage({
                urls: arr,
                current: arr[curIndex],
                onSuccess: function(result) {},
                onFail: function() {}
            });
        });
        event.stopPropagation();
    });
}

function bubbleSort(array) {
    var i = 0,
        len = array.length,
        j, d;
    for (; i < len; i++) {
        for (j = 0; j < len; j++) {
            if (array[i].planDate < array[j].planDate) {
                d = array[j];
                array[j] = array[i];
                array[i] = d;
            }
        }
    }
    return array;
}

function attatchVisitLineAction() {
    $('#nextmonth').click(function() {
        var pageDate = $("#pageDate").val();
        disPlayHCCalendar(pageDate, 1);
    });
    $('#premonth').click(function() {
        var pageDate = $("#pageDate").val();
        disPlayHCCalendar(pageDate, -1);
    });
    $("#planConfirm").tap(function() {
        addCustomerToPlans();
    });
}
//支持一次添加到多个日期
function addCustomerToPlans() {
    var seletedTmp = getSeletedTmp();
    console.log("用户已经选择的日期");
    console.log(seletedTmp);
    if (seletedTmp.length == 0) {
        alertMessage("提示", "请选择日期", "确定");
        return false;
    }
    var planDates = seletedTmp.join();
    var code = cusInfo.code;
    console.log("用户选择的日期 = " + planDates);
    console.log("用户的code = " + code);
    //   store.addNewCustomerToVisitplan(code,planDates,function(result){
    //       console.log(result);
    //       result=JSON.parse(result);
    // setVisitPlan(code);
    //   });
}

function xml2html($xml) {
    var $children = $xml.children('item');
    var httpshecom = 'https://images.hecom.cn/';
    var html = '';
    $children.each(function() {
        var module;
        var $this = $(this);
        if ($this.attr('type') == 'tsCalendarView' || $this.attr('type') == 'tsEditText' || $this.attr('type') == 'tsList' || $this.attr('type') == 'tsEditTextSearch' || $this.attr('type') == 'tsProcessBar') {
            var keys = $this.attr('original');
            if (keys != null && keys != 'undefined') {
                var key = JSON.parse(keys).text;
                var text = $this.attr('infovalue');
                if (text == null) text = $this.attr('infoValue');
                if (text == '') text = '未填写';
                html += '<li class="ui-border-t" style="margin:5px 0;padding:10px 0;"><span style="color:#858e99;font-size:12px;">' + key + '</span>';
                html += '<h4 style="color:#222;font-size:15px;margin-top:4px;">' + text + '</h4></li>';
            }
        } else if ($this.attr('type') == 'tsTextView') {
            var keys = $this.attr('original');
            if (keys != null && keys != 'undefined') {
                var key = JSON.parse(keys).text;
                var text = $this.attr('infovalue');
                if (text == null) text = $this.attr('infoValue');
                html += '<li class="ui-border-t" style="margin:5px 0;padding:10px 0;"><span style="color:#858e99;font-size:12px;">' + key + '</span>';
                if (text != '') {
                    html += '<h4 style="color:#222;font-size:15px;margin-top:4px;">' + text + '</h4></li>';
                }
            }
        } else if ($this.attr('type') == 'tsSelectBox') {
            var keys = $this.attr('value');
            if (keys == '1') {
                var key = $this.attr('original');
                var text = JSON.parse(key).text;
                html += '<h4 style="color:#222;font-size:15px;margin-top:4px;">' + text + '</h4>';
            }
        } else if ($this.attr('type') == 'tsLine') {} else if ($this.attr('type') == 'tsCamera') {
            var text = $this.attr('value');
            var imgs = text.split(';');
            var key = JSON.parse($this.attr('original')).text;
            html += '<li class="ui-border-t" style="margin:5px 0;padding:10px 0;"><h4 style="color:#222;font-size:15px;margin-top:4px;">' + key + '</h4><p>';
            if (imgs.length > 0 && text != '') {
                for (var i in imgs) {
                    html += '<img src="' + replaceImageUrl(httpshecom + imgs[i]) + '" class="previewimg" style="max-height:50px; margin-right:5px;">';
                }
            }
            html += '</p></li>';
        } else if ($this.attr('type') == 'tsInfoManager') {
            html += xml2html($this);
            var text = $this.attr('infovalue');
            if (text == 'undefined') text = $this.attr('infoValue');
            var key = JSON.parse($this.attr('original')).text;
            var dan = JSON.parse($this.attr('original')).quantify;
        } else if ($this.attr('type') == 'tsProductInfoManager') {
            html += xml2html($this);
            var keys = $this.attr('original');
            if (keys != null && keys != 'undefined') {
                var key = JSON.parse(keys).text;
                var text = $this.attr('infovalue');
                if (text == null) text = $this.attr('totalDisplay');
                if (text == null) text = '';
                html += '<li class="ui-border-t" style="margin:5px 0;padding:10px 0;"><span style="color:#858e99;font-size:12px;">' + key + '</span>';
                html += '<h4 style="color:#222;font-size:15px;margin-top:4px;">' + text + '</h4></li>';
            }
        } else {
            var keys = $this.attr('original');
            if (keys != null && keys != 'undefined') {
                var key = JSON.parse(keys).text;
                var text = $this.attr('infovalue');
                if (text == null) text = $this.attr('infoValue');
                if (text == '') text = '未填写';
                html += '<li class="ui-border-t" style="margin:5px 0;padding:10px 0;"><span style="color:#858e99;font-size:12px;">' + key + '</span>';
                html += '<h4 style="color:#222;font-size:15px;margin-top:4px;">' + text + '</h4></li>';
            }
        }
    });
    return html;
}

function arrIndexOf(arr, arrval) {
    var index = -1;
    for (var i in arr) {
        if (arr[i] == arrval) {
            index = i;
            break;
        }
    }
    return index;
}

//ADD by lipengfei at 2016/6/25
/**
 * 如果在 omsapp 应用内，重写 DingpostJSAPI
 */
function wrapDingpostJSAPI() {
    dd.biz.ding.post = function(param) {
        var p = param || {};
        var _m = 'biz.ding.post';
        var successCallback = function(res) {
            console.log('默认成功回调', _m, res);
        };
        var failCallback = function(err) {
            console.log('默认失败回调', _m, err);
        };
        if (p.onSuccess) {
            successCallback = p.onSuccess;
            delete p.onSuccess;
        }
        if (p.onFail) {
            failCallback = p.onFail;
            delete p.onFail;
        }
        if (!p.users || !$.isArray(p.users) || p.users.length == 0) {
            failCallback('ERROR_BAD_PARAM');
            return;
        }
        //FIXME:此处直接打开发送必达窗口后，就回调成功，后续在调整
        openLink(oms_config.baseUrl + 'duang.html?jsonstr=' + encodeURIComponent(JSON.stringify(p)), true);
        successCallback();
    }
}
