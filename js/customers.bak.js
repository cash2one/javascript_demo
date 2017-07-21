var rootJson = new Array();
var submitFlg = false;
var $rootPanelDiv, rootPanel, selectedPoi;

$(document).ready(function(){
    // ddbanner.changeBannerTitle('取消',true,function(result){
    //     openLink('index.html');
    // });
    // ddbanner.changeBannerRight("确定",true,function(result){
    //     openLink('index.html');
    // });
    unsetLeft();

//    var bakhtml = $("#addcontactperson").html();
    var bakhtml = null;

    //多个联系人
    $("#addcontactpersonmore").click(function(){
        console.log('add');
        var contact_count = $('#contact_count').val();
        var name_1 = $("#name_"+contact_count).val();
        var phone_1 = $("#phone_"+contact_count).val();
        var title_1 = $("#title_"+contact_count).val();
        if(name_1 == '' || phone_1 == '' || title_1 == ''){
            return;
        }
        var contact_name = parseInt(contact_count)+parseInt(1);
        $("#qfcontact"+contact_count).after('<div class="ui-form ui-border-t" id="qfcontact'+contact_name+'"><div class="ui-form-item ui-form-item-l  ui-border-b"><label class="ui-border-r">联系人</label><input type="text" name="name_'+contact_name+'" id="name_'+contact_name+'" placeholder="请输入"></div><div class="ui-form-item ui-form-item-l  ui-border-b"><label class="ui-border-r">移动电话</label><input type="tel" name="phone_'+contact_name+'" id="phone_'+contact_name+'" placeholder="请输入"></div><div class="ui-form-item ui-form-item-l  ui-border-b"><label class="ui-border-r">职位</label><input type="text" name="title_'+contact_name+'" id="title_'+contact_name+'" placeholder="请输入"></div></div>');
        $("#contact_count").val(contact_name);
    });

});

function postData(){
    console.log('submit');
}
function unsetLeft(){
    var text = "新增客户";
    dd.ready(function(){
        dd.biz.navigation.setLeft({
            show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
            control: false,//是否控制点击事件，true 控制，false 不控制， 默认false
            showIcon: true,//是否显示icon，true 显示， false 不显示，默认true； 注：具体UI以客户端为准
            text: text,//控制显示文本，空字符串表示显示默认文本
            onSuccess : function(result) {},
            onFail : function(err) {}
        });
    });

    dd.biz.navigation.setRight({
        show: true,
        control: true,
        showIcon: true,
        text: '确定',
        onSuccess : function(result) {
            console.log("click");
            postData();

        },
        onFail : function(err) {}
    });
}




// function selectdata(div_id,div){
//     $("#ty").val(div_id+'='+div);
//     $("#main").hide();
//     $("#"+div).show();
// }

// function setdata(name){
//     if(name == 1){
//         name = $("#zdybq").val();
//     }
//     var div_id_str = $("#ty").val();
//     var strs= new Array();
//     strs=div_id_str.split("=");
//     $("#"+strs[0]).html(name);
//     $("#"+strs[1]).hide();
//     $("#main").show();
// }


//弹出框
// function tcmodal(){
// //    $("#zdybq").val("");
// //    $("#ui-dialog-model").dialog("show");
//     dd.device.notification.prompt({
//         message: '',
//         title: '自定义标签',
// //        buttonLabels: ['确认', '取消'],
//         buttonLabels: ['取消', '确认'],
//         onSuccess : function(result) {
//             /*
//             {
//                 buttonIndex: 0, //被点击按钮的索引值，Number类型，从0开始
//                 value: '' //输入的值
//             }
//             */
//             if(result.value == ''){
//                toast('error','自定义标签不能为空！');
//             }else{
//                 var name = result.value;
//                 var div_id_str = $("#ty").val();
//                 var strs= new Array();
//                 strs=div_id_str.split("=");
//                 $("#"+strs[0]).html(name);
//                 $("#"+strs[1]).hide();
//                 $("#main").show();
//            }
//         },
//         onFail : function(err) {}
//     });
// }

/*
 * 生成Json数据
 */
// function generationJson(){

// }

/*
 * 清除div
 */

// function cleardiv(){

//     $("#name").val("");

//     var phone_count = $("#phone_count").val();
//     for(var i=1;i<=phone_count;i++){
//         if(i == 1){
//             $("#phone_"+i).val("");
//         }else{
//             $("#qfphone"+i).remove();
//         }
//     }
//     var email_count = $("#email_count").val();
//     for(var i=1;i<=email_count;i++){
//         if(i == 1){
//             $("#email_"+i).val("");
//         }else{
//             $("#qfemail"+i).remove();
//         }
//     }
//     var dept_count = $("#dept_count").val();
//     for(var i=1;i<=dept_count;i++){
//         if(i == 1){
//             $("#dept_"+i).val("");
//             $("#posi_"+i).val("");
//         }else{
//             $("#qfdept"+i).remove();
//         }
//     }
//     var address_count = $("#address_count").val();
//     for(var i=1;i<=address_count;i++){
//         if(i == 1){
//             $("#city_"+i).val("");
//             $("#sheng_"+i).val("");
//             $("#jiedaoone_"+i).val("");
//             $("#city_"+i).val("");
//             $("#jiedaotwo_"+i).val("");
//             $("#ickey_"+i).val("");
//         }else{
//             $("#qfaddress"+i).remove();
//         }
//     }
//     var link_count = $("#link_count").val();
//     for(var i=1;i<=link_count;i++){
//         if(i == 1){
//             $("#link_"+i).val("");
//         }else{
//             $("#qflink"+i).remove();
//         }
//     }
//     var birthday_count = $("#birthday_count").val();
//     for(var i=1;i<=birthday_count;i++){
//         if(i == 1){
//             $("#birthday_"+i).val("");
//         }else{
//             $("#qfbirthday"+i).remove();
//         }
//     }
//     var shejiao_count = $("#shejiao_count").val();
//     for(var i=1;i<=shejiao_count;i++){
//         if(i == 1){
//             $("#shejiao_"+i).val("");
//         }else{
//             $("#qfshejiao"+i).remove();
//         }
//     }
//     $("#more").show();
//     $("#moreinfo").hide();
//     $("#phone_count").val(1);
//     $("#email_count").val(1);
//     $("#dept_count").val(1);
//     $("#address_count").val(1);
//     $("#link_count").val(1);
//     $("#birthday_count").val(1);
//     $("#shejiao_count").val(1);
// }

function cancellation(){
    unsetLeft();
    $("#addcontactperson").hide();
    $("#showcontactlist").hide();
    submitData('提交');
    settitle('新增客户');
    // $("#addcontactpersonmore").show();
    $("#showcontactposren").show();
    $("#addcustomer").show();
}

/*
 * 客户联系人信息
 */
// function contactpersoninfo(){
//     var name = $("#name").val();
//     if(name == ''){
//         toast('error','姓名不能为空！');
//         return;
//     }

//     var phone_1 = $("#phone_1").val();
//     if(phone_1 == ''){
//         toast('error','联系电话不能为空！');
//         return;
//     }

//     var bakname = name;
//     //Json添加联系人姓名
// //    subJson += '"name" : '+'"'+name+'","phone" : [';
//     var subJson = {};
//     subJson.name = name;

//     var phone = new Array();
//     var phone_count = $("#phone_count").val();
//     for(var i=1;i<=phone_count;i++){
//         var tmptype = $("#phone_type_"+i).text();
//         var tmp = $("#phone_"+i).val();
//         if(tmp == ''){
//             continue;
//         }
//         var dxphone = {};
//         eval("dxphone."+tmptype+"="+'"'+tmp+'"');
//         phone.push(dxphone);
//     }
//     if(phone.length > 0){
//         subJson.phone = phone;
//     }

//     var email = new Array();
//     var email_1 = $("#email_1").val();
//     if(email_1 != ''){
//         var email_count = $("#email_count").val();
//         for(var i=1;i<=email_count;i++){
//             var tmptype = $("#email_type_"+i).text();
//             var tmp = $("#email_"+i).val();
//             if(tmp == ''){
//                 i++;
//                 continue;
//             }
//             var dxemail = {};
//             eval("dxemail."+tmptype+"="+'"'+tmp+'"');
//             email.push(dxemail);
//             $("#email_"+i).val("");
//         }
//     }
//     if(email.length > 0){
//         subJson.mail = email;
//     }

//     var dept = Array();
//     var dept_1 = $("#dept_1").val();
//     var posi_1 = $("#posi_1").val();
//     if(dept_1 != '' || posi_1 != ''){
//         var dept_count = $("#dept_count").val();
//         for(var i=1;i<=dept_count;i++){
//             var tmptype = $("#dept_type_"+i).text();
//             var tmp = $("#dept_"+i).val();
//             var posi = $("#posi_"+i).val();
//             var dxdept = {};
//             dxdept.label = tmptype;
//             dxdept.职位 = posi;
//             dxdept.部门 = tmp;
//             dept.push(dxdept);
//             $("#dept_"+i).val("");
//             $("#posi_"+i).val("");
//         }
//     }
//     if(dept.length > 0){
//         subJson.dep = dept;
//     }

//     var address = new Array();
//     var sheng_1 = $("#sheng_1").val();
//     if(sheng_1 != ''){
//         var address_count = $("#address_count").val();
//         for(var i=1;i<=address_count;i++){
//             var tmptype = $("#address_type_"+i).text();
//             var city = $("#city_"+i).val();
//             var sheng = $("#sheng_"+i).val();
//             var jiedaoone = $("#jiedaoone_"+i).val();
//             var jiedaotwo = $("#jiedaotwo_"+i).val();
//             var ickey = $("#ickey_"+i).val();

//             var dxaddress = {};
//             dxaddress.label = tmptype;
//             dxaddress.省 = sheng;
//             dxaddress.市 = city;
//             dxaddress.街道1 = jiedaoone;
//             dxaddress.街道2 = jiedaotwo;
//             dxaddress.邮编 = ickey;
//             address.push(dxaddress);
//             $("#city_"+i).val("");
//             $("#sheng_"+i).val("");
//             $("#jiedaoone_"+i).val("");
//             $("#city_"+i).val("");
//             $("#jiedaotwo_"+i).val("");
//             $("#ickey_"+i).val("");
//         }
//     }
//     if(address.length > 0){
//         subJson.addr = address;
//     }

//     var link = new Array();
//     var link_1 = $("#link_1").val();
//     if(link_1 != ''){
//         var link_count = $("#link_count").val();
//         for(var i=1;i<=link_count;i++){
//             var tmptype = $("#link_type_"+i).text();
//             var tmp = $("#link_"+i).val();
//             if(tmp == ''){
//                 continue;
//             }
//             var dxlink = {};
//             eval("dxlink."+tmptype+"="+'"'+tmp+'"');
//             link.push(dxlink);
//             $("#link_"+i).val("");
//         }
//     }
//     if(link.length > 0){
//         subJson.website = link;
//     }

//     var birthday = new Array();
//     var birthday_1 = $("#birthday_1").val();
//     if(birthday_1 != ''){
//         var birthday_count = $("#birthday_count").val();
//         for(var i=1;i<=birthday_count;i++){
//             var tmptype = $("#birthday_type_"+i).text();
//             var tmp = $("#birthday_"+i).val();
//             if(tmp == ''){
//                 continue;
//             }
//             var dxbirthday = {};
//             eval("dxbirthday."+tmptype+"="+'"'+tmp+'"');
//             birthday.push(dxbirthday);
//             $("#birthday_"+i).val("");
//         }
//     }
//     if(birthday.length > 0){
//         subJson.birthday = birthday;
//     }


//     var shejiao = new Array();
//     var shejiao_1 = $("#shejiao_1").val();
//     if(shejiao_1 != ''){
//         var shejiao_count = $("#shejiao_count").val();
//         for(var i=1;i<=shejiao_count;i++){
//             var tmptype = $("#shejiao_type_"+i).text();
//             var tmp = $("#shejiao_"+i).val();
//             if(tmp == ''){
//                 continue;
//             }
//             var dxshejiao = {};
//             eval("dxshejiao."+tmptype+"="+'"'+tmp+'"');
//             shejiao.push(dxshejiao);

//             $("#shejiao_"+i).val("");
//         }
//     }
//     if(shejiao.length > 0){
//         subJson.social = shejiao;
//     }

//     rootJson.push(subJson);

// //    alert(JSON.stringify(rootJson));

//     $("#linkmaninfo").val(JSON.stringify(rootJson));

//     submitData('提交');

//     setcontactpersonlist(bakname);

// //    $("#addcontactperson").html(bakhtml);
//     $("#addcontactperson").hide();
//     settitle('新增客户');
//     // $("#addcontactpersonmore").show();
//     $("#addcustomer").show();
// }

/*
 * 设置title
 */

function settitle(title){
    dd.biz.navigation.setTitle({
        title: title,
        onSuccess : function(result) {

        },
        onFail : function(err) {

        }
    });
}

/*
 * 设置联系人列表
 */
function setcontactpersonlist(bakname){
    var setcontactpersonlist_count = $('#setcontactpersonlist_count').val();
    var setcontactpersonlist_name = parseInt(setcontactpersonlist_count)+parseInt(1);
    if(setcontactpersonlist_count == 1){
        $("#showcontactposren").html('<ul class="ui-list ui-list-text ui-list-cover ui-border-tb" id="setcontactpersonlist'+setcontactpersonlist_count+'"><li class="ui-border-t" onclick="showcontactpersoninfo(\'showcontactlist_'+setcontactpersonlist_count+'\');"><p>'+bakname+'</p></li></ul>');
    }else{
        var baklist = $("#showcontactposren").html();
        $("#showcontactposren").html('<ul class="ui-list ui-list-text ui-list-cover ui-border-tb" id="setcontactpersonlist'+setcontactpersonlist_count+'"><li class="ui-border-t" onclick="showcontactpersoninfo(\'showcontactlist_'+setcontactpersonlist_count+'\');"><p>'+bakname+'</p></li></ul>'+baklist);
    }
    $("#setcontactpersonlist_count").val(setcontactpersonlist_name);
    $("#showcontactposren").show();
}


/*
 * 查看联系人列表
 */
function showcontactpersoninfo(listinfodivid){
    var strhtml = '';
    var strs= new Array();
    strs=listinfodivid.split("_");
//    alert(listinfodivid+'最后一位是：'+strs[1]);
    var xb = strs[1]-1;
    var data = $("#linkmaninfo").val();
//    alert(data);
    var obj = $.parseJSON(data);
    for(var key in obj[xb]){
        if(key == 'name'){
            strhtml += '<div class="ui-form ui-border-t"><div class="ui-form-item ui-form-item-l  ui-border-b"><label class="ui-border-r">姓名</label><input type="text" placeholder="请输入联系人姓名（必填）" value="'+obj[xb][key]+'" disabled></div></div>';
        }
        if(key == 'phone'){
            var phone = obj[xb][key];
            for(var a in phone){
                for(var b in phone[a]){
                    strhtml += '<div style="margin-top: 10px" class="ui-form ui-border-t"><div class="ui-form-item ui-form-item-l ui-border-b"><label class="ui-border-r"><span>'+b+'</span><i class="ui-icon-arrow" style="right: 1px;position: absolute;top: 0;"></i></label><input type="text" placeholder="请输入电话（必填）" value="'+phone[a][b]+'" disabled></div></div>';
                }
            }
        }
        if(key == 'mail'){
            var mail = obj[xb][key];
            for(var c in mail){
                for(var d in mail[c]){
                    strhtml += '<div style="margin-top: 10px" class="ui-form ui-border-t"><div class="ui-form-item ui-form-item-l ui-border-b"><label class="ui-border-r"><span>'+d+'</span><i class="ui-icon-arrow" style="right: 1px;position: absolute;top: 0;"></i></label><input type="text" placeholder="请输入电话（必填）" value="'+mail[c][d]+'" disabled></div></div>';
                }
            }
        }
        if(key == 'dep'){
            var dep = obj[xb][key];
            for(var e in dep){
                var depname  = dep[e].label;
                var posiname  = dep[e].职位;
                var depname2  = dep[e].部门;
                strhtml += '<div style="margin-top: 10px"><table width="100%" frame="hsides" cellspacing="0" cellpadding="0"><tr><td rowspan="2" style="width: 110px;"><div class="ui-form-item ui-form-item-l"><label><span >'+depname+'</span><i class="ui-icon-arrow" style="right: 1px;position: absolute;top: 0;"></i></label></div></td><td><div style="height:45px;"><input type="text" placeholder="请输入部门" value="'+depname2+'" style="height:45px;text-indent:15px;border:0;" disabled></div></td></tr><tr><td><div style="height:45px;"><input type="text" placeholder="请输入职位" value="'+posiname+'" style="height:45px;text-indent:15px;border:0;" disabled></div></td></tr></table></div>';
            }
        }
        if(key == 'addr'){
            var addr = obj[xb][key];
            for(var f in addr){
                var addrname  = addr[f].label;
                var sheng  = addr[f].省;
                var shi  = addr[f].市;
                var jiedaoone  = addr[f].街道1;
                var jiedaotwo  = addr[f].街道2;
                var ickey  = addr[f].邮编;
                strhtml += '<div style="margin-top: 10px"><table width="100%"  frame="below"  cellspacing="0" cellpadding="0"><tr><td rowspan="5" style="width: 110px;" ><div class="ui-form-item ui-form-item-l"><label><span>'+addrname+'</span><i class="ui-icon-arrow" style="right: 1px;position: absolute;top: 0;"></i></label></div></td><td><div style="height:45px;"><input type="text" placeholder="请输入省份名称"  disabled value="'+sheng+'" style="height:45px;text-indent:15px;border:0;"></div></td></tr><tr><td><div style="height:45px;"><input type="text" disabled placeholder="请输入城市名称" value="'+shi+'" style="height:45px;text-indent:15px;border:0;"></div></td></tr><tr><td><div style="height:45px;"><input type="text" disabled value="'+jiedaoone+'" placeholder="请输入街道1名称" style="height:45px;text-indent:15px;border:0;"></div></td></tr><tr><td><div style="height:45px;"><input type="text" disabled value="'+jiedaotwo+'" placeholder="请输入街道2名称" style="height:45px;text-indent:15px;border:0;"></div></td></tr><tr><td><div style="height:45px;"><input type="text" disabled value="'+ickey+'" placeholder="请输入邮政编码" style="height:45px;text-indent:15px;border:0;"></div></td></tr></table></div>';
            }
        }
        if(key == 'website'){
            var website = obj[xb][key];
            for(var g in website){
                for(var h in website[g]){
                    strhtml += '<div style="margin-top: 10px" class="ui-form-item ui-form-item-l ui-border-b"><label class="ui-border-r" ><span>'+h+'</span><i class="ui-icon-arrow" style="right: 1px;position: absolute;top: 0;"></i></label><input type="text" disabled value="'+website[g][h]+'" placeholder="请输入网站"></div>';
                }
            }
        }
        if(key == 'birthday'){
            var birthday = obj[xb][key];
            for(var l in birthday){
                for(var i in birthday[g]){
                    strhtml += '<div style="margin-top: 10px" class="ui-form-item ui-form-item-l ui-border-b"><label class="ui-border-r" ><span>'+i+'</span><i class="ui-icon-arrow" style="right: 1px;position: absolute;top: 0;"></i></label><input type="text" disabled value="'+birthday[l][i]+'" placeholder="请输入网站"></div>';
                }
            }
        }
        if(key == 'social'){
            var social = obj[xb][key];
            for(var m in social){
                for(var n in social[m]){
                    strhtml += '<div style="margin-top: 10px" class="ui-form-item ui-form-item-l ui-border-b"><label class="ui-border-r" ><span>'+n+'</span><i class="ui-icon-arrow" style="right: 1px;position: absolute;top: 0;"></i></label><input type="text" disabled value="'+social[m][n]+'" placeholder="请输入网站"></div>';
                }
            }
        }
    }
    dd.ready(function(){
        dd.biz.navigation.setLeft({
            show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
            control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
            showIcon: true,//是否显示icon，true 显示， false 不显示，默认true； 注：具体UI以客户端为准
            text: '',//控制显示文本，空字符串表示显示默认文本或icon
            onSuccess : function(result) {
                cancellation();
            },
            onFail : function(err) {}
        });
        dd.biz.navigation.setRight({
            show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
            control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
            showIcon: true,//是否显示icon，true 显示， false 不显示，默认true； 注：具体UI以客户端为准
            text: '确定',//控制显示文本，空字符串表示显示默认文本或icon
            onSuccess : function(result) {
                closecontact();
            },
            onFail : function(err) {

            }
        });
        document.addEventListener('backbutton', function(event) {
            event.preventDefault();
            closecontact();
        });
    });
    settitle('查看联系人');
    $("#addcustomer").hide();
    $("#showcontactposren").hide();
    // $("#addcontactpersonmore").hide();
    $("#addcontactperson").hide();
    $("#showcontactlist").html(strhtml);
    $("#showcontactlist").show();
}

/*
 * 关闭查看联系人
 */

function closecontact(){
    $("#addcontactperson").hide();
    $("#showcontactlist").hide();
    $("#addcustomer").show();
    $("#showcontactposren").show();
    // $("#addcontactpersonmore").show();
    submitData('提交');
    settitle('新增客户');
}

function submitData(submittitle){
    dd.biz.navigation.setRight({
        show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
        control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
        showIcon: true,//是否显示icon，true 显示， false 不显示，默认true； 注：具体UI以客户端为准
        text: submittitle,//控制显示文本，空字符串表示显示默认文本或icon
        onSuccess : function(result) {
            function saveData(url,tsdata){
				if(submitFlg){
					return;
				}

				dd.ready(function(){
					dd.device.notification.showPreloader({
						text: '提交中', //loading显示的字符，空表示不显示文字
						showIcon: false, //是否显示icon，默认true
						onSuccess : function(result) {
						},
						onFail : function(err) {}
					});
				});
				submitFlg = true;

                var linkmaninfo = $("#linkmaninfo").val();
                var version                 =       '4.2.3_42863';
    //                var deviceId                =       deviceId;
    //                            var contactJsonArrayStr     =       '[{"name":"测试","phone":[{"移动电话":"15120018675"}],"dep":[{"label":"部门","部门":"java部门","职位":"工程师"}],"mail":[{"工作邮箱":"142@qq.con"}]}]';
                var contactJsonArrayStr     =       linkmaninfo;
                var tsclientdata            =       tsdata;
                $.post(url,{"version":version,"deviceId":deviceId,"contactJsonArrayStr":contactJsonArrayStr,"tsclientdata":tsclientdata},function(result){
                    var obj = $.parseJSON(result);
                    var icon = 'error';
                    if(obj.result == 0){
                        icon = 'success';
                    }
                    dd.ready(function(){
                        dd.device.notification.hidePreloader({
                            onSuccess : function(result) {},
                            onFail : function(err) {}
                        });
                    });
                    dd.device.notification.toast({
                        icon: icon, //icon样式，有success和error，默认为空 0.0.2
                        text: obj.desc, //提示信息
                        duration: 2, //显示持续时间，单位秒，默认按系统规范[android只有两种(<=2s >2s)]
                        delay: 0, //延迟显示，单位秒，默认0
                        onSuccess : function(result) {
                            if(icon == 'success'){
                                // ut
                                DDMD.commit('addcus');
    //                            window.setTimeout(function(){
    //                                openLink(baseurl+"customers/index");
    //                            },200);
                                new Customerflush(Store.authUrl(urlapi),deviceId,function(){
									FT.popup('customeradd',siteUrl,baseUrl,apiUrl,staticUrl,function(){
                                        if(from == 'newplan'){
                                            openLink(baseurl+"newplan.html?pagedate="+pagedate);
                                        }else if(from == 'tempVisit'){
                                            openLink(baseurl+"tempVisit.html?isVisiting="+isVisiting);
                                        }else{
                                            openLink(baseurl+"customerList.html");
                                        }
									});
                                });
                            }
                        },
                        onFail : function(err) {}
                    });
                    setTimeout(function() { submitFlg = false; }, 300);
                });
            }
            console.log('post data');
            // 键盘失去焦点
            // $('.ui-panel').first().trigger('focus');
            (function() {
                document.activeElement.blur();
                $("input").blur();
            })();
            // 表单验证提交
            if (rootPanel.validate()) {
                // 更新定位信息
                if (rootPanel.$locationXml) {
                    var lnglatPair = [0,0];
                    if (selectedPoi) {
                        lnglatPair = Utils.coordTransform.gcj02towgs84(
                            selectedPoi['location'].getLng(),
                            selectedPoi['location'].getLat()
                        );
                    }
                    rootPanel.$locationXml.attr('value', lnglatPair.reverse().join(','));
                }
                $.when(rootPanel.serializeToString()).then(function(xmldata) {
                    var xmldata = '<?xml version="1.0" encoding="UTF-8"?>' + xmldata;
                    //console.log('xmldata:'+xmldata);
                    if(FT.ftCookieVal=='customeradd'){
                        saveData(Store.authUrl(urlapi) + 'trained/5/mobile/upload.do', xmldata);
                    }else{
                        saveData(Store.authUrl(urlapi) + 'mobile/upload.do', xmldata);
                    }
                });
            }
        },
        onFail : function(err) {}
    });
}

/*
 * 时间控件
 */

function setdate(id){
    var d = new Date();
    var ymd = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
    dd.ready(function(){
        dd.biz.util.datepicker({
            format: 'yyyy-MM-dd',
            value: ymd, //默认显示日期
            onSuccess : function(result) {
//                alert(id+"="+result.value);
                $("#"+id).val(result.value);
            },
            onFail : function() {}
        });
    });
}

/*
 * 提示信息
 */

function toast(icon,content){
    dd.device.notification.toast({
        icon: icon, //icon样式，有success和error，默认为空 0.0.2
        text: content, //提示信息
        duration: 2, //显示持续时间，单位秒，默认按系统规范[android只有两种(<=2s >2s)]
        delay: 0, //延迟显示，单位秒，默认0
        onSuccess : function(result) {

        },
        onFail : function(err) {}
    });
}

function forPracticeMode(){
    var ftCookieName=getCookie("HEcomFtBasicCookie");
    console.log("ft cookie 值");
    console.log(ftCookieName);
    if(ftCookieName=='customeradd'){
        var userCookieName=getCookie("HecomDDSenior");
        userCookieName=JSON.parse(userCookieName);
        console.log("user cookie 值");
        console.log(userCookieName);
        // var inputs=$("#v-container2 input[type=text]");
        // if(inputs[0]) inputs[0].value=userCookieName.v40DingEmplInfo.emplName+"的客户（演示数据）";
        // if(inputs[1]) inputs[1].value="北京市海淀区中关村大街1号";
        // if(inputs[2]) inputs[2].value="大商超";
        // if(inputs[3]) inputs[3].value="A";
        // if(inputs[4]) inputs[4].value="默认图层";
        // //if(inputs[4]) inputs[4].value="默认图层";

        // var inputs=$("#v-container2 input[type=tel]");
        // if(inputs[0]) inputs[0].value="13012345678";

        // var inputs=$("#v-container2 input[type=hidden]");
        // if(inputs[0]) inputs[0].value="1";
        // if(inputs[1])inputs[1].value="2";
        // if(inputs[2]) inputs[2].value="3";

        // var inputs=$("#v-container2 textarea");
        // if(inputs[0]) inputs[0].value='客户信息内容可配置，多行业模板为您量身定制';

        var $$metadataSource = JSwing.Provider.get('$$metadataSource');
        $.each(rootPanel.$children, function(i, item) {
            var column = item.attr('metadata_column_code').toLowerCase();
            var sourceColumn;
            switch (column) {
                case 'v30_md_customer.name': //客户名称
                    item.value(userCookieName.v40DingEmplInfo.emplName+'的客户（演示数据）');
                    break;
                case 'v30_md_customer.address': //地址
                    item.value('北京市海淀区中关村大街1号');
                    break;
                case 'v30_md_customer.string1': //送货电话
                    item.value('13012345678');
                    break;
                case 'v30_md_customer.terminal_type': //通路类型
                case 'v30_md_customer.cust_levels': //客户等级
                    sourceColumn = '_dict.'+item.attr('source_metadata_column_code');
                    $$metadataSource.all(sourceColumn, function(sources, config) {
                        if (config && sources && sources.length) {
                            item.text(sources[0]['key']);
                            item.value(sources[0]['value']);
                        }
                    });
                    break;
                case 'v30_md_customer.description': //备注
                    item.value('客户信息内容可配置，多行业模板为您量身定制');
                    break;
            }
        });
    }
}
function getCookie(name){
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}