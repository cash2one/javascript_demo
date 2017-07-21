var hcalendar = {
	nowTime : new Date(),
	useYear : new Date().getFullYear(),
	useMons : new Date().getMonth() + 1,
	useDate : new Date().getDate(),
	userHours : new Date().getHours(),
	userMin : new Date().getMinutes(),
	userSec : new Date().getSeconds(),
	usehourms : new Date().getHours()+":"+new Date().getMinutes()+":"+new Date().getSeconds(),
	useWeek : 1,

	setCalendar : function(){

    	var days, weekStart,i,l,ddHtml=[];
    	var nowDate = new Date(),nowyear = nowDate.getFullYear(),nowmonth = nowDate.getMonth()+1, nowdate = nowDate.getDate();
    	var nowTmp = hcalendar.mkTime(0,0,0,nowmonth,nowdate,nowyear)*1000;
			days = new Date(hcalendar.useYear, hcalendar.useMons, 0).getDate();
    	if(hcalendar.useDate > days) date = days;

    	weekStart = new Date(hcalendar.useYear, hcalendar.useMons - 1,1).getDay();
    	minTmp = hcalendar.mkTime(0,0,0,hcalendar.useMons,1,hcalendar.useYear)*1000;
    	maxTmp = hcalendar.mkTime(0,0,0,hcalendar.useMons,days,hcalendar.useYear)*1000;


    	ddHtml.push('<div id="hccalendar"><ul class="ui-calendar-row cHeader" style="background-color:#f5f5f6;"><li class="ui-col ui-col-c">日</li>');
    	ddHtml.push('<li class="ui-col ui-col-c">一</li><li class="ui-col ui-col-c">二</li><li class="ui-col ui-col-c">三</li>');
    	ddHtml.push('<li class="ui-col ui-col-c">四</li><li class="ui-col ui-col-c">五</li><li class="ui-col ui-col-c">六</li></ul>');

    	ddHtml.push('<ul class="ui-calendar-row" id="ui1">');
    	for (i = 0; i < weekStart; i++) {
        	ddHtml.push('<li class="ui-col ui-col-c">&nbsp;</li>');
   		}

    	var w = weekStart;
    	hcalendar.useWeek = 1;
			var nowDateFormatted = nowyear+nowmonth+nowdate;
    	for (i = 1; i <= days; i++) {
        	var tmp = hcalendar.mkTime(0,0,0,hcalendar.useMons,i,hcalendar.useYear) * 1000;
        	var s = hcalendar.useWeek;

        	ddHtml.push('<li class="ui-col ui-col-c">');
        	if(hcalendar.useYear == nowyear && hcalendar.useMons == nowmonth && i == nowdate){
            	if(i == hcalendar.useDate){
                	ddHtml.push('<div class="calendarDate calendarDateToday' +
						' calendarDateSelected" style="width:21px;height:21px;"' +
                    ' data-ulid="ui'+s+'" id="cdate'+i+'"><div' +
                    ' class="calendarNum" style="font-weight: bold;margin-bottom: 1px;">今</div></div>');
            	}else{
                	ddHtml.push('<div class="calendarDate calendarDateToday" data-ulid="ui'+s+'" id="cdate'+i+'"><div class="calendarNum">'+i+'</div></div>');
            	}
        	}else if(i == hcalendar.useDate){//当前选中的日期
            	ddHtml.push('<div class="calendarDate calendarDateSelected" data-ulid="ui'+s+'" id="cdate'+i+'"><div class="calendarNum">'+i+'</div></div>');
        	}else{
							if(hcalendar.useYear > nowyear || hcalendar.useMons > nowmonth ||(hcalendar.useMons == nowmonth&& i> hcalendar.useDate))
									ddHtml.push('<div class="calendarDate calendarDateNormal" data-ulid="ui-disable" id="cdate'+i+'" style="color:#999"><div class="calendarNum">'+i+'</div></div>');
							else
            			ddHtml.push('<div class="calendarDate calendarDateNormal" data-ulid="ui'+s+'" id="cdate'+i+'" ><div class="calendarNum">'+i+'</div></div>');
        	}
        	ddHtml.push('</li>');
        	if(i == hcalendar.useDate){
            	$("#ulid").val('ui'+hcalendar.useWeek);
            	$("#selecteddate").val('cdate'+i);
        	}
        	if(w==6){
            	w=0;
            	hcalendar.useWeek++;
            	ddHtml.push('</ul><ul class="ui-calendar-row" id="ui'+hcalendar.useWeek+'">');
        	}else{
            	w++;
        	}
    	}
    	ddHtml.push('</ul>');
    	ddHtml.push('</div>');

		$("#hccalendarwrap").html(ddHtml.join(''));
		hcalendar.addEventListener();
	},


	addEventListener : function(){

		$("#hccalendarwrap_up").swipe({
			swipe:function(event, direction, distance, duration, fingerCount, fingerData){
				if(direction == 'up'){
					var uilid=$("#ulid").val();
					var listN = $(window).height()-75;

					if($("#ycmoney").css("display") == "block")
						$("#listC").css("top","34%");
					else if($(".money_data").css("display") == "inline-flex")
						$("#listC").css("top","28%");
					else
						$("#listC").css("top","15%");
					$("#todoList").css("height",listN+'px');
					$(".ui-calendar-row").each(function(){
						var tid=$(this).attr("id");
						if(tid&&tid!=uilid){
							$(this).hide('fast');
						}
					});
				}else if(direction == 'down'){
					if($("#ycmoney").css("display") == "block"){
						if($("#ui6 li").length > 0)
							$("#listC").css("top","72%");
						else
							$("#listC").css("top","68%");
					}
					else if($(".money_data").css("display") == "inline-flex"){
						if($("#ui6 li").length > 0)
							$("#listC").css("top","72%");
						else
							$("#listC").css("top","63%");
					}
					else{
						if($("#ui6 li").length > 0)
							$("#listC").css("top","60%");
						else
							$("#listC").css("top","50%");
					}

					$("#todoList").css("height",'241px');
					$(".ui-calendar-row").each(function(){
						$(this).show('fast');
					});
				}
			},
			threshold:0
		});


		$("#hccalendarwrap").swipe({
			swipe:function(event, direction, distance, duration, fingerCount, fingerData){
					var nowDate = new Date(),nowyear = nowDate.getFullYear(),nowmonth = nowDate.getMonth()+1, nowdate = nowDate.getDate();
					if(direction == 'left'){
						if(hcalendar.useYear<=nowyear&&hcalendar.useMons<nowmonth){
							$("#listC").css("top","72%");
							hcalendar.useMons += 1;
							if(hcalendar.useMons == 13){
								hcalendar.useMons = 1;
								hcalendar.useYear++;
							}
							hcalendar.setCalendar();
							accompany.MonthChangeEvent();
						}

					}else if(direction == 'right'){
						$("#listC").css("top","72%");
						hcalendar.useMons--;
						if(hcalendar.useMons == 0){
							hcalendar.useMons = 12;
							hcalendar.useYear--;
						}
						hcalendar.setCalendar();
						accompany.MonthChangeEvent();
					}
			},
			threshold:0.5,
			sensitivity:1,
		});

		$(".calendarDate").tap(function() {
			if($(this).data("ulid")!='ui-disable'){
				$("#ulid").val($(this).data("ulid"));
				var oldSelected=$("#selecteddate").val();
				var newSlected=$(this).attr("id");
				$("#"+oldSelected).removeClass("calendarDateSelected");
				$(this).removeClass("calendarDateNormal");
				$(this).addClass("calendarDateSelected");
				$("#selecteddate").val(newSlected);
				var date = $(this).find('.calendarNum').html();
				hcalendar.useDate = parseInt(date);
				accompany.getInitData();
			}

		});
	},

	mkTime : function(){
		var d = new Date(),
    		r = arguments,
    		i = 0,
    		e = ['Hours', 'Minutes', 'Seconds', 'Month', 'Date', 'FullYear'];

  		for (i = 0; i < e.length; i++) {
    		if(typeof r[i] === 'undefined'){
      			r[i] = d['get' + e[i]]();
      			r[i] += (i === 3);
    		}else{
      			r[i] = parseInt(r[i], 10);
      			if(isNaN(r[i])){
        			return false;
      			}
    		}
  		}
  		r[5] += (r[5] >= 0 ? (r[5] <= 69 ? 2e3 : (r[5] <= 100 ? 1900 : 0)) : 0);
  		d.setFullYear(r[5], r[3] - 1, r[4]);
  		d.setHours(r[0], r[1], r[2]);
  		return (d.getTime() / 1e3 >> 0) - (d.getTime() < 0);
	}

};

$.fn.hcalendar = function(settings){ $.extend(hcalendar, settings || {});};


function mkTodayTimestamp(){
    var d = new Date();
    var y=d.getFullYear();
    var m=d.getMonth()+1;
    var t=d.getDate();
    return mktime(0,0,0,m,t,y);
}
