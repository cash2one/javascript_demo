####接口
######ddlogin 返回oms的用户登录 信息
- 传递的参数
```
{
    code:'string',
    corpId:'String',
}
```
- 传递方式
post方式
- 返回结果
```

```

######getSubordinate 返回下属数据
- 传递的参数
```
{
    omsuid:1
    token:'12341234'
}
```
- 传递方式
post方式
- 返回的结果
```
{"res":1,
"msg":"\u6210\u529f",
"data":[
{"id":"2946","username":"fengcaimeng","realname":"realname"},
{"id":"2946","username":"fengcaimeng","realname":"realname"},
{"id":"2946","username":"fengcaimeng","realname":"realname"},
]}
```

######getCustomers 客户列表接口
传递的参数
```
//以下参数 ，除了omsuid及token为必传为，其他都是非必须的，不需要的条件可以不传
{
    omsuid:1,
    token:'12341234',
    page:1,//页码，在分组形式，点击展开请求某组数据时为必传参数 否则 只会返回分组的统计数据信息
    type:1, //1：公海 ，2 私海 3 开放池 4 待定池, 空或者不传代码全部
    cusName:'', //客户名称
    orderType:1, //对应下面的value说明
    follStatus:[1,2,3], //跟进状态 ,数组
    managerlevel:['A','B','C'], //经理评级，数组 , 无
    mylevel:['a','b','c'], //个人评级，数组 ,无
    nextStartTime:时间戳, //开始时间
    nextEndTime:时间戳, //结束时间 (新签对应的是下次联系时间，续签对应的是合同结束时间范围)
    ownerid:[12,13,14],//新签 对应 跟进人，续签 对应 签章人员，续签leader:对应 续签人员，即下属
    linkstatus:['联系中'],//联系情况
    trade:[],//行业类型
    throw_reason:[],//扔回公海的原因
    renew_mylevel:[],//续签的个人评级 
    renew_managerlevel:[],//续签的经理评级
    areaid:[],//区域id
    // renew_status:0,//续签的单子是否已经完成 ，0,未完成 ，1，完成 ，-1或者不传，表示不限
    isSub:1,//是否显示 下属客户
    isNew:1,//是否是新签 客户，针对 续签leader及续签业务员
}
```

orderType对应 的value说明 
 - 1 next_time 下次联系日期
 - 2 safedays 保护期
 - 3 into_time 客户流入时间 （对应续签的默认排序）
 - 4 contractEnd 合同即将到期的排序 （对应 续签 的 即将到期）
 - 5 updateTime 最后的操作时间（对应续签的未跟进时间）
 
 - 6 managerlevel 经理评级分组
 - 7 mylevel 个人评级分组
 - 8 followstatus 跟进状态分组

 - 9 contractAuditTime 进入到续签客户列表中的时间 （续签leader的默认排序 ）
 
返回格式
```
data数组中的对象 属性：
id,
custname, 客户名称
safedays,保护期
mylevel, 新签 的个人评级 
managerlevel, 续签 的个人评级 
throw_reason, 扔掉原因
- 扔掉原因:0无、1客户不存在/名称错误、2绕不到电话/联系不上、3客户强烈不需要、4已使用别家产品、5已用本公司产品
linkstatus - 联系情况 
next_time, 下次联系时间
follow_type - 跟进类型

//针对续签的参数：
renew_mylevel:'a',//续签的个人评级 
renew_managerlevel:'b',//续签的经理评级 
traincount:培训次数 ，用来判断是否培训过
renew_is_config：判断续签客户是否配置过
update_time: 用来计算未跟进天数

//针对分组总数信息，需要注意：如果该分组没有数据将会没有相应的统计对象
[{
    "total":10,//该组的客户总数
    "name":'a',//组名称
},
{
    "total":10,//该组的客户总数
    "name":'a',//组名称
}]
```

######getPerformance,首页的业绩 排名接口 
传递的参数 
```
{
    omsuid:1
    token:'12341234'
}
```
返回结果
```
data下的属性：
current:当前业绩
target:本月目标
countryRank:全国排名 
cityRank:城市排名
countryRankOld:0,//上次的全国排名 
cityRank:0,//上次的城市排名 
```

######getPerformanceCompare,业绩对比的接口
传递的参数 
```
{
    omsuid:1
    token:'12341234'
}
```
返回结果
```
data下的属性：
last://上月
current://本月
best: //历史最佳
```

#####getTodayWork,返回今日工作量
传递的参数 
```
{
    omsuid:1
    token:'12341234'
}
```
返回结果
```
data下的属性：
staff://资料
current://本月
best: //历史最佳
```

######getSaleFunnel
传递的参数 
```
{
    omsuid:1
    token:'12341234'
}
```
返回结果 
```
{"res":1,"msg":"\u6210\u529f","data":[0,0,0,0,0,0,0]}
data里对应 的是金额 的数据 ，顺序 是：
待理单，已签已回， 已签未回，重点跟进，能签能回，冲击客户，已死客户
```

######getAreas获取城市 的数据 
传递的参数 
```
{
    omsuid:1
    token:'12341234'
}
```
返回结果 
```
data数组下的对象 属性：
{"region_id":"1","region_name":"北京"}
```

######添加客户接口  addCustomer
传递的参数格式：
```
{
    omsuid:1,
    token:'12341234',
    customer:{"cusname":'和创杭州',"corp":'曾咏杰',"capital":'1000',"trade":8,"terminals":12,"isarea":'60054',"remark":'this is a test!'},
    contactors:[
        {
            "linkman":'联系1',
            "telephone":'18959597722',
            "position":'总经理',
            "email":'test@test.com',
        },
        {
            "linkman":'联系2',
            "telephone":'18959597722',
            "position":'总经理',
            "email":'test@test.com',
        },
        {
            "linkman":'联系3',
            "telephone":'18959597722',
            "position":'总经理',
            "email":'test@test.com',
        }
    ],
}
```
返回结果
```
res: 1: 成功，2: 客户已存在, 0:添加失败
msg:相应的错误提示信息
data:{"cusid":2219052}

{"res":1,"msg":"\u767b\u5f55\u5df2\u8fc7\u671f,\u8bf7\u91cd\u65b0\u767b\u5f55","data":{"cusid":2219052}}
```

######判断客户是否存在  isCustomerExists
传递的参数
```
{
    omsuid:1,
    token:'12341234',
    cusname:'和创科技'
}
```
返回结果
```
{"res":1,"msg":"\u5ba2\u6237\u5df2\u5b58\u5728","data":[]}
0:不存在
1：存在
```

######全文检索接口 - search
传递的参数：
```
{
    omsuid:1,
    token:'12341234',
    keyword:'1',//关键词
    type:'',//空：返回2种数据 ，各最多 10条,customer:返回客户数据,contractor:联系人的数据
    page:1,//页码
}
```
返回 的格式 
```
{
    res:1
    msg:2
    data:[
        customers:[{},{}]
        contactors:[{},{}]
    ]
}
```

######拉到私海的接口  - pullCustomer
传递的参数：
```
{
    omsuid:1,
    token:'12341234',
    cusid:1
}
```
返回的格式 
```
{
    res:1
    msg:'成功'
    data:[]
}
```

######添加联系人接口  - addContactors
传递的参数：
```
{
    omsuid:1,
    token:'12341234',
    cusid:1234,
    contactors:[
        {
            "linkman":'联系1',
            "telephone":'18959597722',
            "position":'总经理',
            "email":'test@test.com',
        },
        {
            "linkman":'联系2',
            "telephone":'18959597722',
            "position":'总经理',
            "email":'test@test.com',
        },
        {
            "linkman":'联系3',
            "telephone":'18959597722',
            "position":'总经理',
            "email":'test@test.com',
        }
    ],
}
```
返回的格式 
```
{
    res:1
    msg:'成功'
    data:[]
}
```

#####扔回公海 throwCustomer
传递的参数：
```
{
    omsuid:1,
    token:'12341234',
    cusid:1234,
    throw_reason:1
}
```
返回的格式 
```
{
    res:1
    msg:'成功'
    data:[]
}
```

#####加入理单 addLidan
传递的参数：
```
{
    omsuid:1,
    token:'12341234',
    cusid:1234,
    ownerid:1,
    do:1,//是续签，0，是新签
}
```
返回的格式 
```
{
    res:1
    msg:'成功'
    data:[]
}
```

#####根据客户id返回 联系人 getContactorsByCusid
传递的参数：
```
{
    omsuid:1,
    token:'12341234',
    cusid:1234,
}
```
返回的格式 
```
{
    res:1
    msg:'成功'
    data:[]
}
```

#####根据客户id返回客户详情getCustomerInfo
传递的参数：
```
{
    omsuid:1,
    token:'12341234',
    cusid:1234,
    from:'lidan',//从理单页面过来的时候，需要多返回预测金额
}
```
返回的格式 
```
{
    res:1
    msg:'成功'
    data:{
        info:{id:1,custname:客户名称,region_name:区域,linkstatus:跟进状态,},//客户基本信息
        contactors:[{},{}],//联系人信息
        contracts:[{},{}],//合同信息
        trackers:[{id:1,username:'username','duty':'签单人员'},{id:1,username:'username','duty':'签单人员'}]
        isRenew:1, //是否是续签 单子，1，是，0否
        isLidan:1,//是否在理单，1是，0否
    }
}
```

#####合同列表接口  getContractList
```
$conditions=array();
$conditions['type'] = trim($this->input->post('type'));
$conditions['keyword'] = trim($this->input->post('keyword'));
$conditions['page'] = trim($this->input->post('page'));
$conditions['pageSize'] = trim($this->input->post('pageSize'));
$conditions['cusid'] = trim($this->input->post('cusid'));//来自客户详情,需要获取某个客户的合同
```
返回的数据格式

```
data下的格式:
list:[{},{}]
total_item:10,
total_htmoney:20,
total_returnmoney:30
```

##### 合同表单的基本信息   getContractBasedata
返回相关的下拉选项

##### 添加合同 addContract
添加合同接口

##### 合同详情 接口 getContractDetail
合同详情 

######电话记录 提交接口callrecordpost
传递的参数 
```
{
    
}
```
返回结果 
```
{"res":1,"msg":"\u6210\u529f","data":1}
res 为1时表示成功,对应的data 为1.res为0时表示失败,对应的data为0
```

######电话记录详情 getCallrecordInfo
传递的参数 
```
{
    cusid :客户id  必填
    token:1234
    rid :callrecord表id  必填
}
```
返回结果 
```
{"res":1,"msg":"\u6210\u529f","data":[id,cusid,cusname,linkman,telephone,content,create_time,operator,legworknumber,carnumber,linkstatus,next_time,realname]}
data里对应 的是金额 的数据 ，顺序 是：
表主键,客户id,客户名称，联系人，电话，电话记录，创建时间，录入人，外勤人数,车辆数,联系情况,下次联系时间,用户真实姓名

```

######拜访详情提交 visitrecordpost
传递的参数 
```
{
    
}
```
返回结果 
```
{"res":1,"msg":"\u6210\u529f","data":1}
res 为1时表示成功,对应的data 为1.res为0时表示失败,对应的data为0
```

######获取拜访详情 getVisitData
传递的参数 
```
{
    cusid: 客户id  必填
    rid: callrecord表id  必填
}
```
返回结果 
```
{"res":1,"msg":"\u6210\u529f","data":[id,cusid,cusname,linkman,visit_time,visitaddr,content,create_time,legworknumber,carnumber,mylevel,start_lon_gcj02,start_lat_gcj02,end_time,end_lon_gcj02,end_lat_gcj02,realname]}
data里对应 的是金额 的数据 ，顺序 是：
客户id,客户名称，联系人，见面时间，见面地址，会议记录,录入时间，外勤人数,车辆数,个人评级,开始经度,开始维度,结束时间,结束经度,结束纬度,用户真实姓名

```

######获取工作记录getWorkStateList
传递的参数 
```
{
    cusid: 客户id 必填
}
```
返回结果 
```
{"res":1,"msg":"\u6210\u529f","data":[id,cusid,linkman,content,create_time,time}
data里对应 的是金额 的数据 ，顺序 是：
表主键,客户id，联系人,纪要,创建时间,时间戳

```

###### 续签 - 分配人员接口  - renewAssign
传递的参数：
```
{
    omsuid:1,
    token:'12341234',
    cusid:1234, //客户id
    uid:1,//新的用户id
}
```
返回的格式 
```
{
    res:1
    msg:'成功'
    data:[]
}
```

###### 上传图片接口 uploadImg
传递的参数
```
{
    omsuid:1,
    token:'12341234',
    files: input 的name
}

<input type="file" name="files" id="files" />
```

返回结果 ：
```
{
"res":1,
"msg":"\u4e0a\u4f20\u6210\u529f",
"data":{
    "imgurl":"http:\/\/oss-cn-beijing.aliyuncs.com\/oms-hecom-cn\/images\/uploads\/c4ca4238a0b923820dcc509a6f75849b1462074992973.jpg"
    }
}
```

######levelModify 修改个人评级接口
传递的参数
```
{
    omsuid:1,
    token:'12341234',
    cusid:1,//客户id
    isrenew:1, //1 续签的个人评级 ，0 新签的个人评级 
    level:'a', //新的评级数据值
}
```
返回的结果
```
{
"res":1, 
"msg":"\u4e0a\u4f20\u6210\u529f",
"data":[]
}
```

######getAssignUser 返回签单人员
传递的参数
```
{
    omsuid:1,
    token:'12341234',
}
```
返回的结果
```
{"res":1,
"msg":"\u6210\u529f",
"data":[
{"id":"2992","realname":"\u7533\u7acb\u9633001"},
{"id":"2996","realname":"\u7533\u7acb\u9633002"}
]}
```

###### editCustomer 编辑客户信息
传递的参数格式：
```
{
    omsuid:1,
    token:'12341234',
    customer:{id:"1","corp":'曾咏杰',"capital":'1000',"trade":8,"terminals":12,"isarea":'60054',"remark":'this is a test!'},
    contactors:[
        {
            "id":1,
            "linkman":'联系1',
            "telephone":'18959597722',
            "position":'总经理',
            "email":'test@test.com',
        },
        {
            "id":1,
            "linkman":'联系2',
            "telephone":'18959597722',
            "position":'总经理',
            "email":'test@test.com',
        },
        {
            "id":1,
            "linkman":'联系3',
            "telephone":'18959597722',
            "position":'总经理',
            "email":'test@test.com',
        }
    ],
}
```
返回结果
```
res: 1: 成功，2: 客户已存在, 0:添加失败
msg:相应的错误提示信息
data:{"cusid":2219052}

{"res":1,"msg":"\u767b\u5f55\u5df2\u8fc7\u671f,\u8bf7\u91cd\u65b0\u767b\u5f55","data":{"cusid":2219052}}
```

###### cancelLidan 取消理单接口
传递的参数
```
{
    omsuid:1,
    token:'12341234',
    cusid:1,//客户id
}
```
返回的结果
```
{
"res":1,
"msg":"\u4e0a\u4f20\u6210\u529f",
"data":[]
}
```

##### startTrain 开始培训，提交定位接口
传递的参数：
```
{
    omsuid:1,
    token:'12341234',
    cusid:1,//客户id，必填
    start_lon_gcj02:'1234',//必填
    start_lat_gcj02:'1234',//必填
    start_address:'address',//必填
}
```
返回的格式：
```
{
"res":1,
"msg":"\u4e0a\u4f20\u6210\u529f",
"data":{'id':12}
}
```
##### endTrain 结束培训，提交定位接口
传递的参数：
```
{
    omsuid:1,
    token:'12341234',
    vid:1,//培训记录id，必填
    end_lon_gcj02:'1234',//必填
    end_lat_gcj02:'1234',//必填
    end_address:'address',//必填
}
```
返回的格式：
```
{
"res":1,
"msg":"\u4e0a\u4f20\u6210\u529f",
"data":{'id':12}
}
```

###### submitTrainReport 提交培训报告

```
training_object[obj][]:1
training_object[obj][]:2
training_object[boss_reason]:1

training_content[]:5
training_content[]:6
training_content[]:7
training_content[]:10
training_content[]:11

is_need_add[status]:1
is_need_add[need_content]:
is_renew:0
no_renew_reason[]:1
no_renew_reason[]:2
no_renew_reason[]:3
remark:这里是备注
vid:23

question_cate[]:1
question_images[]:asdfs.jpg,asdfasdsad.jpg
question_content[]:这里是

question_cate[]:2
question_images[]:
question_content[]:这里是

omsuid=3013&vid=35&token=4de8e974603fc443366224db026020e7&training_object%5Bobj%5D%5B%5D=1&training_object%5Bobj%5D%5B%5D=2&training_object%5Bboss_reason%5D=1&training_content%5B%5D=4&training_content%5B%5D=5&training_content%5B%5D=6&training_content%5B%5D=7&is_need_add%5Bno_need_reason%5D%5B%5D=1&is_need_add%5Bno_need_reason%5D%5B%5D=2&is_need_add%5Bneed_content%5D=&is_renew=1&remark=%E4%BB%AC%E8%8E%AB%E5%90%8D%E5%85%B6%E5%A6%99%E6%98%AF%E5%93%A6%E6%98%AFMM%20iOS&question_cate%5B%5D=1&question_images%5B%5D=4110a1994471c595f7583ef1b74ba4cb1462444868318.jpg&question_content%5B%5D=%E8%8E%AB%E5%90%8DMM%20iOS%E6%A8%A1%E5%BC%8F&question_cate%5B%5D=2&question_images%5B%5D=4110a1994471c595f7583ef1b74ba4cb1462444880500.jpg%2C4110a1994471c595f7583ef1b74ba4cb1462444886296.jpg&question_content%5B%5D=%E7%9A%84%E5%BC%9F%E5%BC%9F%E5%91%B5%E5%91%B5%E5%91%B5on%20HOH
```

###### getUserIfno 获取用户的相关信息
参数
```
{
    omsuid:1,
    token:'12341234',
    uid:12,//所查看的用户id
}
```
返回
```
{
"res":1,
"msg":"\u4e0a\u4f20\u6210\u529f",
"data":{'id':12,telephone:电话,realname:真实姓名,stuff:资料量,tel:电话量,visit:拜访量,path:部门路径}
}
```

##### getSubUsers 获取下属，针对转交客户功能 
参数
```
{
    omsuid:1,
    token:'12341234',
}
```
返回
```
{
"res":1,
"msg":"\u4e0a\u4f20\u6210\u529f",
"data":{'city':{id:1,name:'北京'},list:[{id:1,name:'北京一战区',subs:[{id:1,username:"jj",realname:"1234"}],{...}]}
}
```

#### reAssign 转交客户接口
参数
```
{
    omsuid:1,
    token:'12341234',
    uid:1,
    cusid:12
}
```
返回
```
{
"res":1,
"msg":"\u4e0a\u4f20\u6210\u529f",
"data":[]
}
```

#### isHaveCustomerPriv 
根据cusid获取客户为新签或者续签，并且属于私海还是下属客户
参数
```
{
    omsuid:1,
    token:'12341234',
    cusid:12
}
```
返回
```
{
"res":1,
"msg":"\u4e0a\u4f20\u6210\u529f",
"data":{isNew: 1,status: 1} //status: 0: 没有权限/不在私海中 ，1: 在自己的私海 2: 在下属私海
}
```
