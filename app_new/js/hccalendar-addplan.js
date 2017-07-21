function disPlayHCCalendar(pageDate,move){
    if(!pageDate){
        pageDate = mkTodayTimestamp()*1000;
        isfirst = 1;
    }else{
        isfirst=0;
    }
    if(!move){
        move=0;
    }
    seletedTmp = getSeletedTmp();
    pageDate = parseInt(pageDate);
    pageDate = new Date(pageDate);
    drawDate(pageDate,move);
	dateListener();
	$("#visitCalendar").dialog("show");
}
function disPlayHCCalendarUp(pageDate){
    pageDate = parseInt(pageDate);
    pageDate = new Date(pageDate);
    drawDateUp(pageDate);
}

function drawDate(odate,move){
    var year, month, date, days, weekStart,i,l,ddHtml=[];
    var nowDate = new Date(),nowyear = nowDate.getFullYear(),nowmonth = nowDate.getMonth()+1, nowdate = nowDate.getDate();
    var nowTmp=mktime(0,0,0,nowmonth,nowdate,nowyear)*1000;
    year = odate.getFullYear();
    if(move==1) {
        month = odate.getMonth()+2;
    }else if(move==-1) {
        month = odate.getMonth();
    }else{
        month = odate.getMonth()+1;
    }
    if(month==0){
        month=12;
        year--;
    }
    if(month==13){
        month=1;
        year++;
    }
    date = odate.getDate();
    
    // 获取本月天数
    days = new Date(year, month, 0).getDate();
    if(date>days) date=days;
    if(isfirst){//针对当天 日期刚好是月未最后 一天
       date=date+1;
       if(date>days){
           date=1;
           month++;
           if(month==13){
                month=1;
                year++;
            }
       }
    }
    
    $("#v-date-title").html(month+"月"+date+"日, "+year); 
    
    weekStart = new Date(year, month-1,1).getDay();// 获取本月第一天是星期几

    //日历的开始部分
     ddHtml.push('<ul class="ui-calendar-row cHeader"><li class="ui-col ui-col-c">日</li><li class="ui-col ui-col-c">一</li>');
	 ddHtml.push('<li class="ui-col ui-col-c">二</li><li class="ui-col ui-col-c">三</li>');
     ddHtml.push('<li class="ui-col ui-col-c">四</li><li class="ui-col ui-col-c">五</li><li class="ui-col ui-col-c">六</li></ul>');
     // 开头显示空白段
     ddHtml.push('<ul class="ui-calendar-row" id="ui1">');
     for (i = 0; i < weekStart; i++) {
        ddHtml.push('<li class="ui-col ui-col-c">&nbsp;</li>');
     }
     var w = weekStart;//判断周几
     var s = 1;//用来设置ul标识 
     var todaytmp=mktime(0,0,0,nowmonth,nowdate,nowyear)*1000;
     // 循环显示日期
     for (i = 1; i <= days; i++) {
         var tmp=mktime(0,0,0,month,i,year)*1000;
         if(tmp<=todaytmp){
             var tmpstr='';
             var past=" pastDate ";
         }else{
             var tmpstr='data-tmp="'+tmp+'"';
             var past="";
         }
         //console.log(tmp);
         var tmp2=tmp.toString();
         var cSelected="";
         for(var x in seletedTmp){
             if(tmp2==seletedTmp[x]){
                 var cSelected=" calendarDateSelected ";
                 break;
            }
         }
        ddHtml.push('<li class="ui-col ui-col-c">');
        if(year==nowyear&&month==nowmonth&&i==nowdate){
            if(i==date){
                ddHtml.push('<div class="calendarDate '+cSelected+'" '+tmpstr+' data-ulid="ui'+s+'" id="cdate'+i+'"><div class="calendarNum '+past+'">'+i+'</div></div>');
            }else{
                ddHtml.push('<div class="calendarDate '+cSelected+'" '+tmpstr+' data-ulid="ui'+s+'" id="cdate'+i+'"><div class="calendarNum '+past+'">'+i+'</div></div>');
            }
        }else if(i==date){//当前选中的日期
            ddHtml.push('<div class="calendarDate '+cSelected+'" '+tmpstr+' data-ulid="ui'+s+'" id="cdate'+i+'"><div class="calendarNum'+past+'">'+i+'</div></div>');
        }else{
            ddHtml.push('<div class="calendarDate '+cSelected+'" '+tmpstr+' data-ulid="ui'+s+'" id="cdate'+i+'"><div class="calendarNum'+past+'">'+i+'</div></div>');
        }
        ddHtml.push('</li>');
            
         if(i==date){
             $("#pageDate").val(tmp);//修改当天的时间戳
             $("#ulid").val('ui'+s);//修改当前所在的ul
         }
         if(w==6){
             w=0;
             s++;
             ddHtml.push('</ul><ul class="ui-calendar-row" id="ui'+s+'">');
         }else{
             w++;
         }
     }
     ddHtml.push('</ul>');
     $("#hccalendar").html(ddHtml.join('')); 
}

function dateListener(){
	$(".calendarDate").tap(function(){
		changeSelectedDate(this);
	});
}

function mkTodayTimestamp(){
    var d = new Date();
    var y = d.getFullYear();
    var m = d.getMonth()+1;
    var t = d.getDate();
    return mktime(0,0,0,m,t,y);
}
function mktime() {
  var d = new Date(),
    r = arguments,
    i = 0,
    e = ['Hours', 'Minutes', 'Seconds', 'Month', 'Date', 'FullYear'];

  for (i = 0; i < e.length; i++) {
    if (typeof r[i] === 'undefined') {
      r[i] = d['get' + e[i]]();
      r[i] += (i === 3);
    } else {
      r[i] = parseInt(r[i], 10);
      if (isNaN(r[i])) {
        return false;
      }
    }
  }

  r[5] += (r[5] >= 0 ? (r[5] <= 69 ? 2e3 : (r[5] <= 100 ? 1900 : 0)) : 0);
  d.setFullYear(r[5], r[3] - 1, r[4]);
  d.setHours(r[0], r[1], r[2]);

  return (d.getTime() / 1e3 >> 0) - (d.getTime() < 0);
}
function changeSelectedDate(obj){
    if($(obj).data("tmp")){
        var thistmp=$(obj).data("tmp");
        $("#pageDate").val(thistmp);

        var newli=$(obj).attr("id");
        if($(obj).hasClass('calendarDateSelected')){
            $(obj).removeClass("calendarDateSelected");
            removeFromSelected(newli);
            removeFromSelectedTmp(thistmp);
        }else{
            $(obj).addClass("calendarDateSelected");
            addToSelected(newli);
            addToSelectedTmp(thistmp);
        }

        var pageDate=$("#pageDate").val();
        pageDate=parseInt(pageDate);
        pageDate=new Date(pageDate);
        $("#v-date-title").html((pageDate.getMonth()+1)+'月'+pageDate.getDate()+'日,'+pageDate.getFullYear());
    }
}
function removeFromSelectedTmp(tmp){
    tmp=tmp.toString();
    var oldtmp=$("#selectedTmp").val();
    oldtmp=oldtmp.split(",");
    oldtmp.splice($.inArray(tmp,oldtmp),1);
    $("#selectedTmp").val(oldtmp.join());
    return true;
}
function addToSelectedTmp(tmp){
    tmp=tmp.toString();
    var oldtmp=$("#selectedTmp").val();
    
    if(oldtmp) oldtmp=oldtmp.split(",");
    else oldtmp=[];
    var pos=$.inArray(tmp,oldtmp);
    if(pos==-1){
        oldtmp.push(tmp);
        $("#selectedTmp").val(oldtmp.join());   
    }
    return true;
}
function removeFromSelected(newli){
    var oldlis=$("#selecteddate").val();
    oldlis=oldlis.split(",");
    oldlis.splice($.inArray(newli,oldlis),1);
    $("#selecteddate").val(oldlis.join());
    return true;
}
function addToSelected(newli){
    var oldlis=$("#selecteddate").val();
    if(oldlis) oldlis=oldlis.split(",");
    else oldlis=[];
    var pos=$.inArray(newli,oldlis);
    if(pos==-1){
        oldlis.push(newli);
        $("#selecteddate").val(oldlis.join());
    }
    return true;
}
//获取已经选中的日期
function getSeletedTmp(){
    var res=[];
    var oldtmp=$("#selectedTmp").val();
    if(oldtmp){
         res=oldtmp.split(",");
    }
    return res;
}
//再次弹出窗口的时候，清除掉之前选择状态 的数据 
function addPlanCalendarEmpty(obj){
	disPlayHCCalendar();
    if($(obj).data('keyid')){
        $("#selecteddate").val("");
        $("#selectedTmp").val("");
        //(".calendarDate").removeClass("calendarDateSelected");
        disPlayHCCalendar();
        //alert("初始化日历后"+$("#selecteddate").val()+" & "+$("#selectedTmp").val());
        $(".ui-dialog").dialog("show");
    }
}