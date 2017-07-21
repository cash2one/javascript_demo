var filter = {
    level : [],
    users : [], 
    UserArr : [],
    
    resetFilterSpan : function(obj,isdel){
        if(isdel){
            if(obj.type == 1){
                $("[data-levl='"+obj.code+"']").remove();
            }else{
                $("[data-user='"+obj.code+"']").remove();
            }   
            if(filter.users.length == 0 && filter.level.length == 0){
                $("#select-filt").css("top","45px");
                $("#top").css("padding-top","45px");
            }
        }else{
            if(obj.type == 1){
                var span = '<li data-levl="'+obj.code+'" class="ui-col col-span leveltip">'+obj.name+'<br>客户</li>';
            }else{
                var span = '<li data-user="'+obj.code+'" class="ui-col col-span">'+obj.name.substr(-3)+'<br>人员</li>';
            }
            $("#FilterUl").append(span);
            $("#FilterUl").css("width",(filter.users.length+filter.level.length)*75 + "px");
            $("#select-filt").css("top","109px");   
            $("#top").css("padding-top","111px");
        }
    },

    renderAllUsers : function(){
        var sHtml = '<section class="ui-container" id="allSelectUser">'
        + '<div class="ui-searchbar-wrap" id="searchwrap">'
        + '<div class="ui-searchbar ui-border-radius">'
        + '<i class="ui-icon-search"></i><div class="ui-searchbar-text">搜索</div>'
        + '<div class="ui-searchbar-input"><input value="" type="text" placeholder="搜索" autocapitalize="off"></div>'
        + '<i class="ui-icon-close"></i></div><button class="ui-searchbar-cancel">取消</button></div>'
        + '<ul class="ui-list ui-border-tb" id="all-list">';
        
        for(var i in filter.UserArr.data){
            sHtml += filter.renderUserLi(filter.UserArr.data[i]);
        }
        sHtml += '</ul></section>';
        filter.setSearchApi();
        $("body").append(sHtml);
        filter.allUserEventListener();
        filter.searchWrapListener();
    },
    
    getListLi : function(key){
        var sHtml = "";
        for(var i in filter.UserArr.data){
            if(key == ''){
                sHtml += filter.renderUserLi(filter.UserArr.data[i]);
            }else{
                if(JSON.stringify(filter.UserArr.data[i]).indexOf(key) > -1 ){
                    sHtml += filter.renderUserLi(filter.UserArr.data[i]);
                }   
            }
        }   
        $("#all-list").html(sHtml);
        filter.allUserEventListener();
    },

    renderUserLi : function(obj){
        var liHtml = '<li class="ui-border-b" data-code="'+obj.emplCode+'" data-name="'+obj.emplName+'"><div class="ui-avatar-s">';
        if(obj.photo == null || obj.photo == ''){
            liHtml += '<span class="hecom-avatar-text"><span>'+obj.emplName.substr(-2)+'</span></span>';
        }else{
            liHtml += '<span class="hecom-avatar-img"><img src="'+obj.photo+'" /></span>';
        }       
        liHtml += '</div><div class="ui-list-info"><h4 class="ui-nowrap">'+obj.emplName+'</h4>'
                + '<p class="ui-nowrap">'+(obj.orgName == '' ||obj.orgName == null ? '&nbsp;' : obj.orgName)+'</p></div></li>';
        return liHtml;  
    },
    
    searchWrapListener : function(){
        $(".ui-icon-close").tap(function(){
            $('.ui-searchbar-input input').val('');
            filter.getListLi('');
        }); 

        $('#allSelectUser input').on('keyup onpaste',function() {
            var key = $.trim($(this).val());
            filter.getListLi(key);
        });
    
        $('#allSelectUser .ui-searchbar').on('tap',function(event){
            $('.ui-searchbar-wrap').addClass('focus');
            $('.ui-searchbar-input input').focus();
            event.stopPropagation();
        });
        
        $('.ui-searchbar-cancel').on('tap',function(event){
            $('.ui-searchbar-wrap').removeClass('focus');
            filter.getListLi('');
            event.stopPropagation();
        });         
    },
    
    allUserEventListener : function(){
        $("#all-list li").on('click',function(event){                             
            var code = $(this).data('code');                              
            var name = $(this).data('name');

            if(!filter.codeInSelected(code,2)){
                filter.users.push(code);
                filter.resetFilterSpan({type:2,name:name,code:code},0); 
            }
            $("[data-id='"+code+"']").find('.filterli').addClass('activeli');
            $("#allSelectUser").remove();
            customer.initApi();
            customer.initLeft();
            event.stopPropagation();
        });
    },

    renderThreeUsers : function(){
        var sHtml = '<li class="ui-border-t" id="search_user"><img src="static/img/search-right.png" style="height:20px;top:5px;position:relative;">&nbsp;&nbsp;&nbsp;查找人员</li>';
        for(var i in filter.UserArr.data){
            sHtml += '<li data-name="'+filter.UserArr.data[i].emplName+'" data-id="'+filter.UserArr.data[i].emplCode+'" class="ui-border-t">';
                if(filter.users.toString().indexOf(filter.UserArr.data[i].emplCode) > -1){
                sHtml += '<p class="filterli activeli">'+filter.UserArr.data[i].emplName+'</p></li>';
                }else{
                sHtml += '<p class="filterli">'+filter.UserArr.data[i].emplName+'</p></li>';
                }           
        }
        $("#users-sel").html(sHtml);
        filter.threeUserEventListener();        
    },
    
    threeUserEventListener : function(){
        $("#users-sel li").on('click',function(event){
            if($(this).attr('id') != 'search_user'){                                   
                var name = $(this).data('name');
                var code = $(this).data('id');  

                if(filter.codeInSelected(code,2)){
                    filter.codeDelSelected(code,2);
                    filter.resetFilterSpan({type:2,name:name,code:code},1); 
                }else{
                    filter.users.push(code);
                    filter.resetFilterSpan({type:2,name:name,code:code},0); 
                }                              
                $(this).find('.filterli').toggleClass('activeli');
            }
            stopEventBubble(event);
        });
    },
    
    getAllUsers : function(name){
        var filterObj = {type: 'dingSyncAuthEmpl',entCode: entCode,deviceId: deviceId,searchType: 2,pageSize:50,nextId:0};
        if(name){
            filterObj.searchName = name;
        }
        console.log(filterObj);
        var storeObj = new Store(Store.authUrl(apiUrl),deviceId);
        storeObj.getSubEmpl(filterObj,function(res){
            filter.UserArr = JSON.parse(res);
            filter.renderThreeUsers();
            $("#search_user").on('click',function(event){
                filter.renderAllUsers();
            });         
        });
    },  
    
    setSearchApi : function(){
        dd.ready(function(){
            dd.biz.navigation.setTitle({
                title: '选择员工',
                onSuccess : function(result) {},
                onFail : function(err) {}
            }); 
        
            dd.biz.navigation.setRight({
                show: false,
                onSuccess : function(result) {},
                onFail : function(err) {}
            });     
            if(dd.ios){
                dd.biz.navigation.setLeft({
                    show: true,
                    control: true,
                    showIcon: true,
                    text: '',
                    onSuccess : function(result) {
                        $("#allSelectUser").remove();
                        customer.initApi();
                        customer.initLeft();
                    },
                    onFail : function(err) {}
                });
            }else{
                $(document).off('backbutton');  
                $(document).on('backbutton', function(e) {
                    $("#allSelectUser").remove();
                    customer.initApi(); 
                    customer.initLeft();
                    e.preventDefault();
                });                 
            }           
        });         
    },
    
    renderLevel : function(){
        var db5 = new Database('dict');
        db5.query({parent_code:"cust_levels"}, null, null, function (res) {
            res = filter.sortLevel(res);
            var sHtml = '<li id="sel_all_level"><p class="filterli">不限</p></li>';
            for(var i in res){
                if(filter.level.indexOf(res[i].code) > -1){
                sHtml += '<li data-id="'+res[i].code+'" data-name="'+res[i].text+'" class="ui-border-t"><p class="filterli activeli">'+res[i].text+'</p></li>';
                }else{
                sHtml += '<li data-id="'+res[i].code+'" data-name="'+res[i].text+'" class="ui-border-t"><p class="filterli">'+res[i].text+'</p></li>';
                }
            }   
            sHtml += '<li data-id="-1" data-name="未分级" class="ui-border-t"><p class="filterli">未分级</p></li>';
            $("#level-sel").html(sHtml);
            $("#level-sel li").on('click',function(event){
                if($(this).attr('id') == 'sel_all_level'){
                    if(!$(this).find('.filterli').hasClass('activeli')){
                        filter.level = [];
                        $("#level-sel .activeli").removeClass('activeli');
                        $(".leveltip").remove();
                        if(filter.users.length == 0){
                            $("#select-filt").css("top","45px");
                        }
                    }
                }else{  
                    $("#sel_all_level .filterli").removeClass('activeli');
                    var code = $(this).data('id');
                    var name = $(this).data('name');
                    if(filter.codeInSelected(code,1)){
                        filter.codeDelSelected(code,1);
                        filter.resetFilterSpan({type:1,name:name,code:code},1); 
                    }else{
                        filter.level.push(code);
                        filter.resetFilterSpan({type:1,name:name,code:code},0); 
                    }   
                }
                $(this).find('.filterli').toggleClass('activeli');
                stopEventBubble(event);
            })
        });
    },
    
    sortLevel : function(array){
        var i = 0,
        len = array.length,
        j, d;
        for (; i < len; i++) {
            for (j = 0; j < len; j++) {
                if (array[i].key < array[j].key) {
                    d = array[j];
                    array[j] = array[i];
                    array[i] = d;
                }
            }
        }
        return array;       
    },

    codeDelSelected : function(code,type){
        var selected = type == 1 ? filter.level : filter.users;
        var temp = [];
        for(var i in selected){
            if(selected[i] != code){
                temp.push(selected[i]); 
            }
        }
        if(type == 1){
            filter.level = temp;
        }else{
            filter.users = temp;
        }
    },

    codeInSelected : function(code,type){
        var selected = type == 1 ? filter.level : filter.users;
        for(var i in selected){
            if(code == selected[i]){
                return true;
            }
        }
    },

    getFilterBack : function(){ 
        if ($.isFunction(filter.callback)) {
            filter.callback(filter.users.toString(),filter.level.toString());           
        }       
    },
    
    init : function(callback) {
        $("#FilterUl").show();
        filter.callback = callback;
        
        filter.getAllUsers();
        filter.renderLevel();
        
        $("#top").hide();       
        $("#select-filt .ui-col-33 li").on('click',function(event){                       
            $(".tabed").removeClass('tabed');
            $(this).addClass('tabed');
            var seledId = $(this).data('code');
            $(".selshow").hide();
            $("#"+seledId).show();
            stopEventBubble(event);
        });
        
        $("#cfmBtn").off('click');
        $("#cfmBtn").on('click',function(event){
            $('.select-date').hide();
            $("#top").show();
            if(filter.users.length == 0 && filter.level.length == 0){
                $("#select-filt").css("top","45px");
                $("#top").css("padding-top","45px");
            }           
            filter.getFilterBack();
            stopEventBubble(event);
        });
        
        $("#resetBtn").on('click',function(event){
            filter.level = [];
            filter.users = [];
            $("#FilterUl").html('');
            $(".activeli").removeClass('activeli');
            $("#select-filt").css("top","45px");
            $("#top").css("padding-top","45px");
            stopEventBubble(event);
        }); 

        $("#resetModel").on('click',function(event){
            filter.status = '';
            filter.levels = '';
            filter.customers = '';
            filter.users = '';
            stopEventBubble(event);
        });
    
    }
};

$.fn.filter = function(settings){ $.extend(filter, settings || {});};