
/**
 * Hightchart container 宽度
 * @global
 */
var swidth = $(window).width() - 10;

var team = {
    user:{},
    postData:{},
    leaderInfo:{},
    leaderInfo_promise:null,

    init:function(){
        console.log('init');
        var omsUser=getCookie('omsUser');
        // console.log(JSON.parse(omsUser).telephone);
        if(!omsUser){
            dd.device.notification.toast({
                text: '用户登录已过期,请重新登录',
                icon: 'error',
                onSuccess: function () {
                    loginOut();
                }
            });
        }else{
            team.user=JSON.parse(omsUser);
            team.postData.omsuid = team.user.id;
            team.postData.token = team.user.token;
        }
        if(team.user.role<5){
            $("#payment").remove();
        }
    },

    getLeadersInfo:function(){
        team.leaderInfo_promise = $.ajax({
            type:"post",
            url:oms_config.apiUrl+oms_apiList.getLeadersInfo,
            dataType:'json',
            data:{omsuid:team.user.id,token:team.user.token},
            success:function(rs){
                if(rs.res == 1){
                    team.leaderInfo = rs.data;
                }
            },
            error:function(e){
                console.log(JSON.stringify(e));
            }
        });
        return team.leaderInfo_promise;
    },
}

dd.ready(function(){
    if(dd.ios){
        dd.biz.navigation.setLeft({
            show: true,
            control: true,
            showIcon: true,
            text: '返回',
            onSuccess : function(result) {
                history.back(-1);
            },
            onFail : function(err) {}
        });
    }else{
        //omsapp-android-setLeft-visible:true
        dd.biz.navigation.setLeft({
            visible: true,
            control: false,
            text: ''
        });
        $(document).off('backbutton');
        $(document).on('backbutton', function(e) {
            history.back(-1);
            e.preventDefault();
        });
    }
});

$(function(){
    FastClick.attach(document.body);

    team.init();
    team.getLeadersInfo();
    $('.toggle-btn').click(function(){
        $('.chart-panel').slideToggle('fast',function(){
            if($("#chart-container").css('display')=='none'){
                $("#lefttable").offset({ top: -1*this.scrollTop + 77 });
            }else{
                //$("#lefttable").offset({ top: -1*this.scrollTop + 289 });
            }
        });
    });
});


//setTableBody
function setTableBody(){
    var heightTable = $(window).height() - $('#selects_wrap').height() - $('#footer-bar').height();
    var heightHead = 36;
    //$("#bodytable-wrap").height( $(window).height() - 96);
}

//表格滚动监听
function scrollTable(){
    setTableBody();
    $('#lefttable').show();
    $(window).resize(setTableBody);
    $(".table-body").scroll(function (){
        $("#headertable").offset({ left: -1*this.scrollLeft });
        if($("#chart-container").css('display')=='none'){
                $("#lefttable").offset({ top: -1*this.scrollTop + 77 });
            }else{
                //$("#lefttable").offset({ top: -1*this.scrollTop + 289 });
          }
    });

    $(window).scroll(function (){
        if($("#chart-container").css('display')=='none'){
                $("#lefttable").offset({ top: -1*this.scrollTop + 77 });
            }else{
                //$("#lefttable").offset({ top: -1*this.scrollTop + 289 });
          }
    });
}

//灭零率
function setKillZeroChart(vals){
        var categories = [];
        var seriesData = [];
        var month_num_data = [];
        var order_num_data = [];
        $.each(vals,function(index,item){
                categories.push(item.name);
                month_num_data.push(parseInt(item.month_num));
                order_num_data.push(parseInt(item.order_num));
        });

    var colors =['#e4527c','#50a5cf','#fb9128','#ea5751','#6acccb','#3cb67f','#606060'],
        name = '灭零率';
    $('#killZero').highcharts({
        chart: {
            type: 'column',
            width:swidth,
            height:210,

        },
        title: {
            text: null,
            style: {
                fontSize: '14px',
                fontWeight: 'bold',
           },
        },
        xAxis: {
            categories: categories,
             labels: {
                rotation: -45,
               }
        },
        yAxis: {
            y:10,
            title: null
        },
        plotOptions: {
            column: {
                cursor: 'pointer'
            }
        },
        tooltip: {
            formatter: function() {
                var point = this.point;
                s = this.x +':<b>'+ this.y +'人</b><br/>';
                return s;
            }
        },
        series: [{
            name: '本月月均人数',
            data: month_num_data,
            color: '#50a5cf',
            dataLabels: {
                enabled: true,
                color: '#666',
                align: 'center',
                y: 0,
                style: {
                    fontSize: '9px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },{
            name: '灭零人数',
            data: order_num_data,
            color: '#fb9128',
            dataLabels: {
                enabled: true,
                color: '#666',
                align: 'center',
                y: 0,
                style: {
                    fontSize: '9px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        }],
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        }
    });
}

//月销售目标达成
function setTargetChart(targetmoney,realmoney) {
    var to1 = targetmoney/3;
    var to2 = targetmoney/3+to1;
    $('#month_target').highcharts({
        chart: {
            type: 'gauge',
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false,
            width:swidth,
            height:210,
            padding:[0,0,0,0],
            marginLeft:0,
            marginRight:0,
            marginBottom:0
        },
        title: {
            text: '月目标达成',
            style: {
                fontSize: '15px',
                color: '#333333',
           },
        },
        pane: {
            startAngle: -90,
            endAngle: 90,
            background: null,
            size:'100%'
        },
        plotOptions: {
            gauge: {
                dataLabels: {
                    y: 10,
                    borderWidth: 0,
                    useHTML: true
                },
                dial: {
                    baseLength: '0%',
                    baseWidth: 10,
                    radius: '100%',
                    rearLength: '0%',
                    topWidth: 1
                }
            }
        },
        yAxis: {
            tickPositions: [0, targetmoney/2, targetmoney],
            labels: {
                y: 10,
                formatter : function ( ) {
                    return this . value ;
                }
            },
            minorTickLength: 0,
            min: 0,
            max: targetmoney,
            tickLength: 0,
            plotBands: [{
                from: 0,
                to: to1,
                color: '#ea5751', // red
                thickness: '50%'
            }, {
                from: to1,
                to: to2,
                color: '#fb9128', // yellow
                thickness: '50%'
            }, {
                from: to2,
                to: targetmoney,
                color: '#3db780', // green
                thickness: '50%'
            }]
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        series: [{
            name: '当前回款',
            data: [parseInt(realmoney)]
        }]
    },
    function (chart) { if (!chart.renderer.forExport) {}});
}

//销售漏斗
function setLoudouChart(vals,title,war,qy,leix){
    var colors =['#e4527c','#50a5cf','#fb9128','#ea5751','#6acccb','#3cb67f','#3db780','#606060'],
        categories = ['待理单', '已签已回', '已签未回', '重点跟进', '能签能回', '冲击客户','推进中', '已死客户'],
        name = title+'销售漏斗图';
    var qy = qy-1;
    var data = new Array();
    var list = new Array();
    list[0] = 0;
    list[1] = 1;
    list[2] = 6;
    list[3] = 2;
    list[4] = 3;
    list[5] = 4;
    list[6] = 5;
    list[7] = 6;
    var number = 0;
    for (var i=0;i<vals.length;i++){
        number = number + vals[i];
        data.push({
            y:vals[i],
            color:colors[i],
            drilldown:{name:list[i]}
        });
    }
    $('#sales_loudou').highcharts({
        chart: {
            type: 'column',
            width:swidth,
            height:210,

        },
        title: {
            text: null,
            style: {
                fontSize: '14px',
                fontWeight: 'bold',
           },
        },
        xAxis: {
            categories: categories,
             labels: {
                rotation: -45,
               }
        },
        yAxis: {
            y:10,
            title: null
        },
        plotOptions: {
            column: {
                cursor: 'pointer'
            }
        },
        tooltip: {
            formatter: function() {
                var point = this.point;
                if(leix=='customers'){
                    s = this.x +':<b>'+ this.y +'个</b><br/>';
                }else if(leix=='money'){
                    s = this.x +':<b>'+ this.y +'元</b><br/>';
                }
                if (point.drilldown) {
                    var bl = (this.y/number)*100;
                    bl = bl.toFixed(2);
                    if(leix=='customers'){
                        s += point.category +'占总客户数的 '+bl+'%';
                    }else if(leix=='money'){
                        s += point.category +'占总回款的 '+bl+'%';
                    }
                } else {
                    s += 'Click to return to browser brands';
                }
                return s;
            }
        },
        series: [{
            name: name,
            data: data,
            color: 'white',
            dataLabels: {
                enabled: true,
                color: '#666',
                align: 'center',
                y: 0,
                style: {
                    fontSize: '9px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        }],
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        }
    });
}

//销售阶梯
function setLadderChart(vals,sumtargetmoney,sumassessmoney,title,leix){
    var colors = ['#50A5CF','#50A5CF','#FB9128','#FB9128','#FB9128','#FB9128','#EA5751'],
        categories = ['已签已回','已签未回','重点跟进','能签能回','冲击客户','推进中','已死客户'],
        titlename = title+'销售阶梯图';
    var valstotal = 0, valseries = [], val, boxseries = [], boxpx = 0, boxpy = 0;
    for(var i=0;i<vals.length;i++){
        val = +vals[i];
        valstotal += val;
        valseries.push({
            name: categories[i],
            y: val,
            color: colors[i]
        });
        if(i==0){
            boxpx = 0.5;
            boxpy = val;
        }else{
            boxpx += 1;
            boxpy += val;
        }
        boxseries.push([
            [-1,boxpy],
            [boxpx,boxpy]
        ]);
        boxseries.push([
            [boxpx,boxpy],
            [boxpx,0]
        ]);
    }
    var seriesOptions = [];
    seriesOptions.push(
        {
            name: titlename,
            color: Highcharts.getOptions().colors[3],
            pointPadding: 0,
            type: 'waterfall',
            data: valseries,
            dataLabels: {
                enabled: true,
                style: {
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    textShadow: '0px 0px 3px black'
                }
            },
            zIndex: 99
        }
    );
    if(sumtargetmoney){
        seriesOptions.push({
            type: 'line',
            name: '本月目标值',
            dashStyle: 'dash',
            color: '#3cb67f',
            //visible : false,
            data: [
                [-1, +sumtargetmoney],
                [5.5, +sumtargetmoney]
            ],
            marker: {
                enabled: false
            },
            enableMouseTracking: false
        });
    }
    if(sumassessmoney){
        seriesOptions.push({
            type: 'line',
            name: '本月考核值',
            dashStyle: 'dash',
            color: '#ea5751',
            //visible : false,
            data: [
                [-1, sumassessmoney],
                [5.5, sumassessmoney]
            ],
            marker: {
                enabled: false
            },
            enableMouseTracking: false
        });
    }
    for(var i=1;i<boxseries.length;i++){//[0]不需要处理dashbox
        var lines = boxseries[i], lgroup = ~~(i/2);
        if(lgroup==1 || lgroup==5){//选择性展示 topLine
            seriesOptions.push({
                type: 'line',
                name: null,
                dashStyle: 'dash',
                lineWidth: 1,
                color: '#ccccca',
                showInLegend: false,
                data: lines,
                dataLabels: {
                    align: 'right',
                    enabled: (lines[0][1] == lines[1][1])//point.y 相同时显示 dataLabel
                },
                marker: {
                    enabled: false
                },
                enableMouseTracking: false,
                zIndex: 1
            });
        }
    }
    $('#sales_ladder').highcharts({
        chart: {
            zoomType: 'xy',
            width: swidth,
            height: 210,
        },
        title: {
            text: null
        },
        xAxis: {
            type: 'category',
            tickInterval: 0,
            min: 0,
            max: 6
        },
        yAxis: [{
            title: {
                text: ''
            },
            min: 0,
            ceiling: valstotal,
            gridLineWidth: 0
        }, {
            title: {
                text: '',
                style: {
                    color: '#4572A7'
                }
            },
            labels: {
                format: '{value} mm',
                style: {
                    color: '#4572A7'
                }
            },
            opposite: true
        }],
        legend: {
            enabled: true
        },
        tooltip: {
            formatter: function() {
                if(leix=='customers'){
                    return this.key+':<b>'+this.y+'个</b>';
                }else{
                    return this.key+':<b>¥'+this.y+'元</b>';
                }
            }
        },
        plotOptions: {
            series: {
                groupPadding: 0,
                pointPadding: 0
            },
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            },
            waterfall: {
                borderWidth: 0
            }
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        series: seriesOptions
    });
}

//销售阶梯
function setLadderChart_old(sumyqyh, sumyqwh, sumzdgj, sumnqnh, sumcjkh, sumyskh, sumtargetmoney, sumassessmoney) {
    $('#sales_ladder').highcharts({
        chart: {
            zoomType: 'xy',
            width: swidth,
            height: 210,
        },
        title: {
            text: null
        },
        xAxis: {
            type: 'category',
            tickInterval: 0,
            min: 0,
            max: 5
        },
        yAxis: [{
            title: {
                text: ''
            },
            min: 0,
            gridLineWidth: 0,
            ceiling: sumyqyh + sumyqwh + sumzdgj + sumnqnh + sumyskh + sumcjkh,
        }, { // Secondary yAxis
            title: {
                text: '',
                style: {
                    color: '#4572A7'
                }
            },
            labels: {
                format: '{value} mm',
                style: {
                    color: '#4572A7'
                }
            },
            opposite: true
        }],
        legend: {
            enabled: true
        },
        tooltip: {
            pointFormat: '<b>￥{point.y:,.2f}</b> 元'
        },
        plotOptions: {
            series: {
                groupPadding: 0,
                pointPadding: 0
            },
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            },
            waterfall: {
                borderWidth: 0
            }
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        series: [{
            name: '销售阶梯图',
            upColor: Highcharts.getOptions().colors[2],
            color: Highcharts.getOptions().colors[3],
            type: 'waterfall',
            data: [{
                name: '已签已回',
                y: sumyqyh,
                color: 'rgb(80, 165, 207)'
            }, {
                name: '已签未回',
                y: sumyqwh,
                color: 'rgb(80, 165, 207)'
            }, {
                name: '重点跟进',
                y: sumzdgj,
                color: 'rgb(251, 145, 40)',
            }, {
                name: '能签能回',
                y: sumnqnh,
                color: 'rgb(251, 145, 40)',
            }, {
                name: '冲击客户',
                y: sumcjkh,
                color: 'rgb(251, 145, 40)',
            }, {
                name: '已死客户',
                y: sumyskh,
                color: 'rgb(234, 87, 81)'
            }],
            dataLabels: {
                enabled: true,
                formatter: function() {
                    return Highcharts.numberFormat(this.y, 0, ',');
                },
                style: {
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    textShadow: '0px 0px 3px black'
                }
            },
            pointPadding: 0
        }, {
            type: 'line',
            name: '本月目标值',
            dashStyle: 'dash',
            color: '#3cb67f',
            //visible : false,
            data: [
                [-1, sumtargetmoney],
                [5.5, sumtargetmoney]
            ],
            marker: {
                enabled: false
            },
            states: {
                hover: {
                    lineWidth: 0
                }
            },
            enableMouseTracking: false
        }, {
            type: 'line',
            name: '本月考核值',
            dashStyle: 'dash',
            color: '#ea5751',
            //visible : false,
            data: [
                [-1, sumassessmoney],
                [5.5, sumassessmoney]
            ],
            marker: {
                enabled: false
            },
            states: {
                hover: {
                    lineWidth: 0
                }
            },
            enableMouseTracking: false
        }, {
            type: 'line',
            name: ' ',
            dashStyle: 'dash',
            lineWidth: 1,
            color: '#ccccca',
            data: [
                [-1, sumyqwh + sumyqyh],
                [0.5, sumyqwh + sumyqyh]
            ],
            marker: {
                enabled: false
            },
            states: {
                hover: {
                    lineWidth: 0
                }
            },
            enableMouseTracking: false
        }, {
            type: 'line',
            name: ' ',
            dashStyle: 'dash',
            lineWidth: 1,
            visible: false,
            color: '#ccccca',
            data: [
                [-1, sumzdgj + sumyqwh + sumyqyh],
                [1.5, sumzdgj + sumyqwh + sumyqyh]
            ],
            marker: {
                enabled: false
            },
            states: {
                hover: {
                    lineWidth: 0
                }
            },
            enableMouseTracking: false
        }, {
            type: 'line',
            name: ' ',
            dashStyle: 'dash',
            lineWidth: 1,
            color: '#ccccca',
            visible: false,
            data: [
                [-1, sumzdgj + sumyqwh + sumyqyh + sumnqnh],
                [2.5, sumzdgj + sumyqwh + sumyqyh + sumnqnh]
            ],
            marker: {
                enabled: false
            },
            states: {
                hover: {
                    lineWidth: 0
                }
            },
            enableMouseTracking: false
        }, {
            type: 'line',
            name: ' ',
            dashStyle: 'dash',
            lineWidth: 1,
            color: '#ccccca',
            data: [
                [-1, sumzdgj + sumyqwh + sumyqyh + sumnqnh + sumcjkh],
                [3.5, sumzdgj + sumyqwh + sumyqyh + sumnqnh + sumcjkh]
            ],
            marker: {
                enabled: false
            },
            states: {
                hover: {
                    lineWidth: 0
                }
            },
            enableMouseTracking: false
        }, {
            type: 'line',
            name: ' ',
            dashStyle: 'dash',
            lineWidth: 1,
            color: '#ccccca',
            data: [
                [-1, sumzdgj + sumyqwh + sumyqyh + sumnqnh + sumcjkh + sumyskh],
                [4.5, sumzdgj + sumyqwh + sumyqyh + sumnqnh + sumcjkh + sumyskh]
            ],
            marker: {
                enabled: false
            },
            states: {
                hover: {
                    lineWidth: 0
                }
            },
            enableMouseTracking: false
        }, {
            type: 'spline',
            name: ' ',
            dashStyle: 'dash',
            lineWidth: 1,
            color: '#ccccca',
            data: [
                [1.5, 0],
                [1.5, sumyqyh]
            ],
            marker: {
                enabled: false
            },
            states: {
                hover: {
                    lineWidth: 0
                }
            },
            enableMouseTracking: false
        }, {
            type: 'spline',
            name: ' ',
            dashStyle: 'dash',
            lineWidth: 1,
            color: '#ccccca',
            data: [
                [2.5, 0],
                [2.5, sumyqyh + sumyqwh]
            ],
            marker: {
                enabled: false
            },
            states: {
                hover: {
                    lineWidth: 0
                }
            },
            enableMouseTracking: false
        }, {
            type: 'spline',
            name: ' ',
            dashStyle: 'dash',
            lineWidth: 1,
            color: '#ccccca',
            data: [
                [3.5, 0],
                [3.5, sumyqyh + sumyqwh + sumzdgj]
            ],
            marker: {
                enabled: false
            },
            states: {
                hover: {
                    lineWidth: 0
                }
            },
            enableMouseTracking: false
        }, {
            type: 'spline',
            name: ' ',
            dashStyle: 'dash',
            lineWidth: 1,
            color: '#ccccca',
            data: [
                [4.5, 0],
                [4.5, sumyqyh + sumyqwh + sumzdgj + sumnqnh]
            ],
            marker: {
                enabled: false
            },
            states: {
                hover: {
                    lineWidth: 0
                }
            },
            enableMouseTracking: false
        }, {
            type: 'spline',
            name: ' ',
            dashStyle: 'dash',
            lineWidth: 1,
            color: '#ccccca',
            data: [
                [5.5, 0],
                [5.5, sumyqyh + sumyqwh + sumzdgj + sumnqnh + sumyskh + sumcjkh]
            ],
            marker: {
                enabled: false
            },
            states: {
                hover: {
                    lineWidth: 0
                }
            },
            enableMouseTracking: false
        }]
    });
}

//销售执行转化分析
function setTrunColumnChart(data) {
    $('#ave_files_container').highcharts({
        chart: {
            type: 'columnrange',
            inverted: true,
            width:swidth,
            height:210,
        },

        title: {
            text: null,
        },
        xAxis: {
            enabled:false,
            lineWidth :0,
            tickWidth:0,
            title:null,
            labels: {
                enabled: false,
            }
        },

        yAxis: {
            enabled:false,
            title:null,
            labels: {
                enabled: false,
            },
            gridLineWidth: 0
        },

        tooltip: {
            enabled:false

        },

        plotOptions: {
            columnrange: {
                dataLabels: {
                    enabled: true,
                   /* align:'Left',*/
                    formatter: function () {
                        var s = "";
                        var Dvalue = data.cus_num-this.point.options.high;
                        //console.log(this);
                        var perFloat = ((this.y-Dvalue)/data.cus_num).toFixed(4);
                        var preData = 100*(perFloat*1000)/1000;
                        console.log(preData);
                        if(this.point.options.low === this.y){

                        }
                        else{
                           // s = this.series.name+" "+(this.y-Dvalue)+"   "+preData+"%";
                            s = this.series.name;
                        }
                        return s;
                    }
                }
            }
        },

        legend: {
            enabled: false
        },
        labels: {
            enabled: false,

        },

        series: [{
            name: '已成单'+data.yeji_num+" "+data.yeji_num_r,
            color: '#ea5751',
            data: [
                [(data.cus_num-data.yeji_num)/2, data.yeji_num+(data.cus_num-data.yeji_num)/2]
            ]
        },{
            name: '已拜访'+data.visit_num+" "+data.visit_num_r,
            color: '#fb9128',
            data: [
                [(data.cus_num-data.visit_num)/2, data.visit_num+(data.cus_num-data.visit_num)/2]
            ]
        },
            /*{
            name: '已约访'+data.yuefang_num+" "+data.yuefang_num_r,
            color: '#B8DBE2',
            data: [
                [(data.cus_num-data.yuefang_num)/2, data.yuefang_num+(data.cus_num-data.yuefang_num)/2]
            ]
        },*/{
            name: '已电话'+data.call_num+" "+data.call_num_r,
            color: '#6acccb',
            data: [
                [(data.cus_num-data.call_num)/2, data.call_num+(data.cus_num-data.call_num)/2]
            ]
        },{
            name: '资料量 '+data.cus_num+" "+data.cus_num_r,
            color: '#3cb67f',
            data: [
                [0, data.cus_num]
            ]
        }],
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        }
    });
}

//客户分级占比
function setProportionColumnChart(data){
    console.log(data);
    $('#pro_files_container').highcharts({
        chart: {
            width:swidth,
            height:210,
        },
        title: {
            text: '客户总量'+data.total+"个",
            style: {
                fontSize: '13px',
                color: '#666666'
            },
        },
        tooltip: {

        },
        legend: {
            layout : 'vertical ',
            align: 'left',
            x: 0,
            width:50,
            y: -20,
            itemMarginTop:2,
            floating: true
            //itemWidth:30,
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        series: [{
            type: 'pie',
            name: '客户总量'+data.total,
            data: [
                {
                    name:'A级',
                    y:data.count_A,
                    color:'#ea5751'
                },
                {
                    name:'B级',
                    y:data.count_B,
                    color:'#fb9128'
                },
                {
                    name: 'C级',
                    y: data.count_C,
                    color:'#3cb67f'
                },
                {
                    name:'D级',
                    y:data.count_D,
                    color:'#6acccb'
                }
            ]
        }],
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        }
    });
}

//直销神话榜
function setSalesListColumnChart(data){
    var title=data.title;
    var categories=data.categories;
    var fdata=[];
    var containerId=data.containerId;
    var personto = data.moneytotal;
    for (var i in data.data){
        fdata.push({
            y:data.data[i],
            color:i==0?'#ea5750':'#50a5cf',
        });
    }
    var chart = $('#list_files_container').highcharts({
        chart: {
           // type: 'column',
            width:1240,
            height:210,
           // zoomType: 'xy'
        },
        title: {
            text: null,
            style: {
                fontSize: '12px',
            },
        },
        xAxis: {
            title:null,
            categories: categories,
            min:0,
            labels: {
                rotation: -45,
                width:'10px'
            }
        },
        yAxis: {
            enabled:false,
            title:null,
            labels: {
                enabled: false,
            },
            gridLineWidth: 0
        },

        tooltip: {
            pointFormat: '<b>￥{point.y:,.2f}</b> 元'
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: false,
                    x:15,
                    y:-5
                },
                enableMouseTracking: false
            },
            column: {
               // pointPadding: 4,
                borderWidth: 15,
                pointWidth: 25
            }
        },
        labels: {
            style: {
                color: "#476773",
                fontSize: '12px',
                fontWeight: 'normal',
                fontFamily: ''
            },
            items: [{
                html: '均值'+personto+"/人",
                style: {
                    left: '250px',
                    top: '30%',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    fontFamily: '',
                    color:"#e74b42",
                    zIndex:20
                }
            }]
        },
        legend: {
            enabled: false
        },
        series: [{
            type: 'column',
            name: '',
            data: data.data,
            color:'#50a5cf',
            dataLabels: {
                enabled: true,
                color: '#666',
                align: 'center',
                width:'300px',
                y: 0,
                style: {
                    fontSize: '11px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },{
            type: 'line',
            name: ' ',
            lineWidth: 1.0,
            data: [[0,personto],[7,personto]],
            dashStyle:'dash',
            color:'#e74b42',
            fillOpacity: 0.1,
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: false,
                        radius: 0
                    }
                }
            },
            shadow: false ,
            enableMouseTracking:false
        }
            /*,{
            type: 'spline',
            name: ' ',
            lineWidth: 0.5,
            color:'#000',
            data: [[7,6],[7,2800]],
            dashStyle:'solid',
            fillOpacity: 0.1,
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: false,
                        radius: 2
                    }
                }
            },
            shadow: false,
            enableMouseTracking:false
        }*/],
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        }

    }).highcharts();
}

//人均资料(拜访，电话)量
function setAveColumnChart(data){
    var title=data.title;
    var categories=data.categories;
    var fdata=[];
    var containerId=data.containerId;
    for (var i in data.data){
        fdata.push({
            y:data.data[i],
            color:i==0?'#ea5750':'#50a5cf',
        });
    }

    var chart = $('#'+containerId).highcharts({
        chart: {
            type: 'column',
            width:swidth,
            height:210,
        },
        title: {
            text: null,
            style: {
                fontSize: '12px',
           },
        },
        xAxis: {
            categories: categories,
             labels: {
                rotation: -45,
               }
        },
        yAxis: {
            title: null,
        },
        plotOptions: {
            column: {
                cursor: 'pointer'
            }
        },
        tooltip: {

        },
        series: [{
            name: title,
            data: fdata,
            color: '#50a5cf',
            dataLabels: {
                enabled: true,
                color: '#666',
                align: 'center',
                y: 0,
                style: {
                    fontSize: '11px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        }],
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        }
    }).highcharts();
}

//月销对比图
function SetComparsionChart(data){
    var bdata=data.bdata;
    var bdataName=data.bdataName;
    var udata=data.udata;
    var udataName=data.udataName;
    var ndata=data.ndata;
    var ndataName=data.ndataName;
    var lineu=data.lineu;
    var lineb=data.lineb;
    var linen=data.linen;
    var lines=data.lines;
    var title=data.title;
    var topTitle=data.topTitle;
    var containerId=data.containerId;

    $('#'+containerId).highcharts({
        chart: {
            width:swidth,
            height:210,
        },
        title: {
            text: null
        },
        xAxis: {
            categories: ['1日','2日','3日','4日','5日','6日','7日','8日','9日','10日','11日','12日','13日','14日','15日','16日','17日','18日','19日','20日','21日','22日','23日','24日','25日','26日','27日','28日','29日','30日','31日'],
            min:0,
            labels: {
                rotation: -45,
                style: {
                    fontSize: '7px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            title: {
                text: ''
            },
            min:0,
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        exporting: { enabled: false},
        credits:{enabled:false},
        legend: {enabled: true},
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true,
                    x:15,
                    y:-5
                },
                enableMouseTracking: false
            }
        },
        series: [
         {
            type: 'spline',
            name: bdataName,
            data: bdata,
            color:'#e4527c',
            marker:{enabled: false}
        },{
            type: 'spline',
            name: udataName,
            data: udata,
            color:'#fb9128',
            marker:{enabled: false}
        },{
            type: 'spline',
            name: ndataName,
            width:0.5,
            color:'#6acccb',
            data:ndata,
            marker:{enabled: false}
        },{
            type: 'line',
            name: ' ',
            lineWidth: 1.0,
            data: lineb,
            dashStyle:'dash',
            color:'#e4527c',
            fillOpacity: 0.1,
             marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: false,
                        radius: 0
                    }
                }
            },
            shadow: false ,
            enableMouseTracking:false
        },{
            type: 'line',
            name: ' ',
            lineWidth: 1.0,
            color:'#fb9128',
            data: linen,
            dashStyle:'dash',
            fillOpacity: 0.1,
             marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: false,
                        radius: 0
                    }
                }
            },
            shadow: false,
            tooltip:false,
            enableMouseTracking:false
        },{
            type: 'line',
            name: ' ',
            lineWidth: 1.0,
            color:'#6acccb',
            data: lineu,
            dashStyle:'dash',
            fillOpacity: 0.1,
             marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: false,
                        radius: 0
                    }
                }
            },
            shadow: false,
            tooltip:false,
            enableMouseTracking:false
        }
        ,{
            type: 'spline',
            name: ' ',
            lineWidth: 0.5,
            color:'#000',
            data: lines,
            dashStyle:'dash',
            fillOpacity: 0.1,
             marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: false,
                        radius: 2
                    }
                }
            },
            shadow: false,
            enableMouseTracking:false
        }]
    });
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
};

function setTableTitle(position){
    var tableTitle='大区';
        switch(position){
            case '57':
            tableTitle="大区";
            break;
            case '3':
            tableTitle="大区";
            break;
            case '58':
            tableTitle="城市";
            break;
            case '59':
            tableTitle="战区";
            break;
            case '60':
            tableTitle="部门";
            break;
            case '61':
            tableTitle="姓名";
            break;
            case '0':
            tableTitle="姓名";
            break;
            case '1':
            tableTitle="灭零业务员";
            break;
            case '2':
            tableTitle="未灭零业务员";
            break;
            case '4':
            tableTitle="期数";
            break;
            default:
            break;
        }
    $(".table-title").html(tableTitle);
}

function setTableTitle2(level){
    var tableTitle='大区';
    switch(level){
        case '1':
        tableTitle="大区";
        break;
        case '2':
        tableTitle="城市";
        break;
        case '3':
        tableTitle="战区";
        break;
        case '4':
        tableTitle="姓名";
        break;
        default:
        tableTitle="大区";
        break;
    }
    console.log(tableTitle);
    $(".table-title").html(tableTitle);
}
