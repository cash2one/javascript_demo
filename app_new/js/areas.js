var __$$areaWidgetVersion = 1;


var areaWidget = {
    // filterObj : {type : 'customerH5',
				//  deviceId : deviceId,
    // 			 pageSize : 20,
				//  pageNo : 1,
    // 			 orderType : 'visit_time',
    // 			 customerLevel : '',
				//  employeeCodes : '',
				//  customerName : '',
				//  poiDatas : ''},
	// lastSize  : 20,

	// renderAreaList : function(data){
	// 	$("#loading").hide();
	// 	$(".noMore").remove();
	// 	console.log(data.length);
	// 	$("#areaWidget_result").show();
	// 	if(data.length > 0){
	// 		var list = "";
	// 		for(var i in data){
	// 			list += areaWidget.renderLi(data[i]);
	// 		}
	// 		$("#areaWidget_result").append(list);
	// 		areaWidget.areaSearchListener();
	// 	}else{
	// 		$("#areaWidget_result").html('<div class="nosearchRes">没有找到区域信息！</div>');
	// 	}

	// },

	// renderLi : function(obj){

	// 	var list = '<li class="ui-border-b" data-code="'+obj.region_id+'" data-name="'+obj.region_name+'">'
	// 			 + '<div class="ui-list-info ui-border-t">'
	// 			 + '<h4 class="ui-nowrap" style="color:#222;">'+obj.region_name+'</h4>'
	// 			 +'</div>'
	// 			 + '</li>';
	// 	return list;
	// },

	areaWidgetListener : function(){
		var self = this;
		$('#areaWidget_text').on('input onpaste',function(e) {
			var searchText = $.trim($('#areaWidget_text').val());
			areaWidget.searchCusData(searchText);
		});
		$('.ui-searchbar').on('tap',function(event){
			$('.ui-searchbar-wrap').addClass('focus');
			$('.ui-searchbar-input input').focus();
			stopEventBubble(event);
		});
		$('#areaWidget_cancel_btn').click(function(){
			// $('.ui-searchbar-wrap').removeClass('focus');
			// self.searchCusData('');
			areaWidget.close();
			customer.initApi();
            event.stopPropagation();
			// areaWidget.close();
		});

		$('#search_form').on('submit',function(event){
	        event.preventDefault() ;
	        var searchText = $.trim($('#areaWidget_text').val());
	        if(searchText == '')
	        	return;
	        else
	        {
	        	$('.ui-searchbar-wrap').removeClass('focus');
				self.searchCusData('');
	            event.stopPropagation();
				areaWidget.searchCusData(searchText);
	        }
	    });
	},

	searchCus : function(){
		// $("#newSearch").show();
		// $("#areaWidget_result").hide();
		var searchText = $('#areaWidget_text').val();
		$("#newSearchContent").html(searchText);
		if(searchText == ''){
			$("#newSearch").hide();
			// $("#areaWidget_result").show();
			var searchText = $('#areaWidget_text').val();
			areaWidget.searchCusData(searchText);
		}
	},

	close : function(){
		$("#areaWidget_div_text").remove();
		// $("#areaWidget_result").remove();
		$("#nav-bar").remove();
		$("#newSearch").remove();
		$("#sortedList").remove();
		$("#geolocation-title").remove();
		$("#geolocation").remove();
		$("#main-body").show();

	},

	areaSearchListener : function(){
		// $("#areaWidget_result li").click(function(event){
		// 	var name = 	$(this).data('name');
		// 	var code = 	$(this).data('code');
		// 	areaWidget.callback({name:name,code:code});
		// 	areaWidget.close();
		// 	stopEventBubble(event);
		// });

		$("#geolocation li").click(function(event){
			var name = 	$(this).data('name');
			var code = 	$(this).data('code');
			areaWidget.callback({name:name,code:code});
			areaWidget.close();
			stopEventBubble(event);
		});

		$("#sortedList ul li").click(function(event){
			var name = 	$(this).data('name');
			var code = 	$(this).data('code');
			areaWidget.callback({name:name,code:code});
			areaWidget.close();
			stopEventBubble(event);
		});

	},


	searchCusData : function(name){
		// var htmlTpl = "",
		// 	self = this;
		// var data = self.allAreas;
		// console.log(data);

		// for(var i in data){
		// 	if(name=='' || JSON.stringify(data[i].region_name).indexOf(name) > -1)
		// 		htmlTpl +=self.renderLi(data[i]);
		// }

		// $("#areaWidget_result").html(htmlTpl);
		// areaWidget.areaSearchListener();
		var htmlTpl = "",
			self = this;
		var data = self.groupedArea;
		var keyCollection = new Array();
		_.forEach(data, function(value,key){
			var result = $.grep(value, function(e){return JSON.stringify(e.region_name).indexOf(name) > -1; });
			if(result.length > 0)
			{
				// console.log(key);
				keyCollection.push(key);
				value = result;
			}

			if(name=='' || result.length > 0)
				htmlTpl +=self.renderSortedSearchLi(value,key);
		});

		areaWidget.renderAnchor(keyCollection);
		$("#sortedList").html(htmlTpl);
		areaWidget.areaSearchListener();

	},

	getAreas : function(){
		var getAreasApi = oms_config.apiUrl+oms_apiList.getAreas;
		$.ajax({
			type:'POST',
			url: getAreasApi,
			data:{'omsuid':JSON.parse(getCookie('omsUser')).id,'token':JSON.parse(getCookie('omsUser')).token},
			cache:false,
			success:function(data){
				var response =  JSON.parse(data).data;
				dynamicSort(response);

				// areaWidget.setGeolocation(response,areaWidget.city);
				areaWidget.groupedArea = areaWidget.groupArea(response,areaWidget.city);
				// areaWidget.allAreas = response;
				//testtest
				areaWidget.renderAnchor(Object.keys(areaWidget.groupedArea));
				areaWidget.renderSorted(areaWidget.groupedArea);

				// areaWidget.renderAreaList(response);
			},
			error:function(xhr,type){
				console('ajax error!');
			}
		});

	},

	initHtml : function(){
		var self = this;

		var initHtml = "<div><div class='ui-flex anchor-bar' id='nav-bar'>";
			initHtml += "<ul class='ui-list ui-list-pure nav-list'></ul></div>";
		    initHtml += "<div id='areaWidget_div_text' class='ui-searchbar-wrap ui-border-b'>";
			initHtml += "<div class='ui-searchbar'>";
			initHtml += "       <i class='ui-icon-public_search' style='font-size:11px; line-height:1;'></i>";
			initHtml += "       <div class='ui-searchbar-text'>搜索</div>";
			initHtml += "       <div class='ui-searchbar-input'>";
			initHtml += "           <form class='search_form' id='search_form'><input type='search' value='' id='areaWidget_text' name='search' placeholder='搜索' autofocus autocapitalize='off'></form>";
			initHtml += "       </div>";
			initHtml += "   </div>";
			initHtml += "   <button id='areaWidget_cancel_btn' class='ui-searchbar-cancel'>取消</button>";
			initHtml += "</div>";
			initHtml += "<div id='newSearch' style='display:none'>";
			initHtml += "    <ul class='ui-list ui-list-link ui-border-tb'>";
			initHtml += "       <li class='ui-border-t'>";
			initHtml += "          <div><i class='ui-icon-search'></i></div>";
			initHtml += "          <div class='ui-list-info'>";
			initHtml += "             <h4 class='ui-nowrap'>搜索“<span id='newSearchContent' style='color:#e15151;'></span>”</h4>";
			initHtml += "          </div>";
			initHtml += "      </li>";
			initHtml += "	</ul>";
			initHtml += "</div>";
			// initHtml += "<div style='margin-left:15px; font-size:13px;' id='geolocation-title'>定位</div>";
			// initHtml += "<ul class='ui-list ui-list-function ui-border-b' id='geolocation'></ul>";
			initHtml += "<div id='sortedList'></div></div>";

			// initHtml += "<ul class='ui-list ui-list-function ui-border-b' id='areaWidget_result'>";
			// initHtml += "</ul>";
		$(document.body).append(initHtml);
		$('#SearchWidget_text').addClass('focus');
		$('#SearchWidget_text').focus();
	},

	initApi : function(){
		dd.ready(function(){
			dd.biz.navigation.setTitle({
				title: '所在区域',
				onSuccess : function(result) {},
				onFail : function(err) {}
			});

			dd.biz.navigation.setRight({
				show: false,
				control: false,
				text: '',
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
                        areaWidget.close();
                        customer.initApi();
                    },
                    onFail : function(err) {}
                });
            }else{
                $(document).off('backbutton');
                $(document).on('backbutton', function(e) {
                    areaWidget.close();
                    customer.initApi();
                    e.preventDefault();
                });
            }
   //          dd.device.geolocation.get({
			// 	targetAccuracy : Number,
			// 	    coordinate : Number,
			// 	    withReGeocode : Boolean,
			// 	    onSuccess : function(result) {
			// 	    	areaWidget.city = result.city;

			// 	       },
			// 	    onFail : function(err) {}
			// });
		});
	},

	// setGeolocation : function(source,data){
	// 	var result = $.grep(source, function(e){return JSON.stringify(data).indexOf(e.region_name) > -1; });
	// 	// console.log(result);
	// 	if(result.length > 0)
	// 	{
	// 		$("#geolocation").append('<li class="ui-border-b" data-code="'+result[0].region_id+'" data-name="'+result[0].region_name+'">'
	// 			 + '<div class="ui-list-info ui-border-t">'
	// 			 + '<h4 class="ui-nowrap" style="color:#222;">'+result[0].region_name+'</h4>'
	// 			 +'</div>'
	// 			 + '</li>');
	// 	}

	// 	var capital = _.groupBy(_.sortBy(source,'py'), function(item) {return item.py.charAt(0);});
	// },

	groupArea : function(source,data){
		return _.groupBy(_.sortBy(source,'py'), function(item) {return item.py.charAt(0);});
	},

	renderSorted : function(data){
		// console.log(data.a);
		var list = "";
		_.forEach(data, function(value, key) {
			list ="<div id='geolocation-title' class='widget-index'>"+key+"</div>"
			list += areaWidget.renderSortedLi(key,value);
			$("#sortedList").append(list);
		});
		areaWidget.areaSearchListener();
	},

	renderSortedLi :function(key,obj){

		var htmlTpl = "<ul class='ui-list ui-list-function' id="+key+">"
		var list = '';
		_.forEach(obj, function(value, key) {
			htmlTpl += '<li data-code="'+value.region_id+'" data-name="'+value.region_name+'">'
				 + '<div class="ui-list-info ui-border-b">'
				 + '<h4 class="ui-nowrap">'+value.region_name+'</h4>'
				 +'</div>'
				 + '</li>';


		});
		htmlTpl += "</ul>";
		return htmlTpl;
	},

	renderSortedSearchLi:function(obj,key){
		var htmlTpl = "<div id='geolocation-title' class='widget-index'>"+key+"</div><ul class='ui-list ui-list-function' id="+key+">"
		_.forEach(obj, function(value, key) {
			htmlTpl += '<li data-code="'+value.region_id+'" data-name="'+value.region_name+'">'
				 + '<div class="ui-list-info ui-border-b">'
				 + '<h4 class="ui-nowrap">'+value.region_name+'</h4>'
				 +'</div>'
				 + '</li>';


		});
		htmlTpl += "</ul></div>";
		return htmlTpl;

	},

	renderAnchor : function(data){
		var htmlTpl = "";

		_.forEach(data,function(value){
			htmlTpl += "<li class='nav-item'><div><a href='#"+value+"'>"+value+"</a></div></li>";

		});
		// console.log(htmlTpl);
		$("#nav-bar ul").html(htmlTpl);

		// console.log(Object.keys(areaWidget.groupedArea));
	},
	init : function(callback) {

		areaWidget.callback = callback;
		$("#main-body").hide();
		areaWidget.initApi();
		areaWidget.initHtml();
		areaWidget.getAreas();
		areaWidget.areaWidgetListener();

    }
};
//排序
function dynamicSort(obj){
	obj.sort(function(a,b){return (a.py > b.py)?1 :((b.py > a.py)?-1:0)});
	// console.log(obj);
}

// $.fn.areaWidget = function(settings){ $.extend(areaWidget, settings || {});};
// $.fn.ready(function(){  areaWidget.init(); });
