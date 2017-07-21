/**
 * @apiDefine BasicErrorProcess
 *  * @apiError {Number} retCode 返回错误状态码
 * @apiError {String} retMsg 返回错误信息

 * @apiErrorExample Error-Response:
 *     HTTP/1.1 4xx Not Found
 *     {
            "retCode":"1",
            "retMsg":"调用失败的原因",
 *     }
 *     HTTP/1.1 50x Internal Error
 *     {
            "retCode":"-1",
            "retMsg":"系统错误",
 *     }
 */

/**
 * @api {post} /billing/getSummary 获取理单列表摘要
 * @apiName GetSummary
 * @apiDescription 理单列表按跟进状态分组下的摘要信息，各分组的理单总个数、金额合计。
 * @apiVersion 1.0.0
 * @apiGroup Billing

 * @apiParam {String} uid 当前登录用户ID
 * @apiParam {String} token 当前登录Token
 * @apiParam {Number=0,1} do 新签/续签标识符
 * @apiParam {String="join","follow"} seqType="follow" 排序类型 join:加入时间；follow:跟进状态
 * @apiParam {String="follower","follow_time","contact_state","grade_staff","grade_manager","follow_rec"} siftType 筛选类型，默认为空，取值分别是：跟进人、下次拜访时间、联系情况、个人评级、经理评级、跟进记录，多值（交叉筛选）采用英文逗号分隔
 * @apiParam {String} siftRef 筛选类型对应可能出现的参数。说明：跟进人"uid,uid,..."；联系情况0,1,2,3,4,5；个人评级0,1,2,3,4,5...；经理评级0,1,2,3,4,5...；跟进记录：0,1,2,3,4,5,6...；下次拜访时间(仅该字段用单选值，其他可以多选）-本周:week，本月：month，自定义区间："yyyy-MM-DD HH:mm,yyyy-MM-DD HH:mm"。参数默认为空。

 * @apiSuccess {Number} retCode 返回状态码 0
 * @apiSuccess {String} retMsg 正确时返回为空
 * @apiSuccess {Object} retData 返回结果
 * @apiSuccess {Object[]} group 结果分组
 * @apiSuccess {Number} group.followtype 该组跟进状态分组
 * @apiSuccess {Number} group.amount 该组理单条目总数
 * @apiSuccess {Number} group.cost 该组理单条目总金额计数
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "retCode":"0",
    "retMsg":"",
    "retData":{
        group:[
            {
                followtype:0,
                amount:0,
                cost:9999.99
            }
        ]
    }
 }
 *
 @apiUse BasicErrorProcess

 */



/**
 * @api {post} /billing/getList 获取理单列表
 * @apiName GetList
 * @apiDescription 按排序、筛选条件、分页拉取数据。
 * @apiVersion 1.0.1
 * @apiGroup Billing
 *
 * @apiParam {String} uid 当前登录用户ID
 * @apiParam {String} token 当前登录Token
 * @apiParam {Number=0,1} do 新签/续签标识符
 * @apiParam {String="join","follow"} seqType="follow" 排序类型 join:加入时间；follow:跟进状态
 * @apiParam {String="follower","follow_time","contact_state","grade_staff","grade_manager","follow_rec"} siftType 筛选类型，默认为空，取值分别是：跟进人、下次拜访时间、联系情况、个人评级、经理评级、跟进记录，多值（交叉筛选）采用英文逗号分隔
 * @apiParam {String} siftRef 筛选类型对应可能出现的参数。说明：跟进人"uid,uid,..."；联系情况0,1,2,3,4,5；个人评级0,1,2,3,4,5...；经理评级0,1,2,3,4,5...；跟进记录：0,1,2,3,4,5,6...；下次拜访时间(仅该字段用单选值，其他可以多选）-本周:week，本月：month，自定义区间："yyyy-MM-DD HH:mm,yyyy-MM-DD HH:mm"。参数默认为空。

 * @apiParam {Number} page 请求第几页 从1开始
 * @apiParam {Number} size 请求多少条数据

 * @apiParamExample {json} Request-Example:
 *     {
 *          "uid": "4711",
            "token":"8e5efc98oj323",
            "do":0,
            "seqType":"follow",
            "siftType":"follower,follow_time,contact_state,grade_staff,grade_manager,follow_rec",
            "siftRef":"{'follow_time':'','follower':'','grade_manager':'','grade_staff':'a,c','follow_rec':'6','contact_state':''}",
            "page":1,
            "size":10
 *     }
 *
 * @apiSuccess {Object[]} res 结果按组罗列在res中，seqType为follow时，跟进将结果按“待理单、已签已回……”等状态列表分组返回，seqType为其他时只返回一组。
 * @apiSuccess {String} name seqType为follow时当前组具有名称，否则名称为空。
 * @apiSuccess {String} total 总页数
 * @apiSuccess {String} page 当前页
 * @apiSuccess {Object[]} list 列表项目组数据
 * @apiSuccess {String} list.bid 理单ID
 * @apiSuccess {String} list.cid 客户ID
 * @apiSuccess {String} list.customer 公司名称
 * @apiSuccess {String} list.follower 跟进人
 * @apiSuccess {String} list.followtype 跟进状态
 * @apiSuccess {String} list.level1 经理评级
 * @apiSuccess {String} list.level2 业务员评级
 * @apiSuccess {String} list.price 金额
 * @apiSuccess {String} list.structure 组织架构信息，格式为“大区-城市-战区”
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
     "res": [{
         "name": "待处理",
         "followtype": 0,
         "list": [{
             "bid": 76545678,
             "cid": 29347229,
             "customer": "山猫科技",
             "follower": "老王",
             "followtype": 0,
             "level1":0,
             "level2":0,
             "price": 18888,
             "structure": "北京大区-北京-二战区"
         }],
         "total":10,
         "page":1
     }]
 }

 *
 * @apiUse BasicErrorProcess
 */

/**
 * @api {post} /billing/getListItemByCid 拉取理单数据（按ID查询）
 * @apiName GetList
 * @apiGroup Billing
 *
 * @apiParam {Number} cid 理单ID
 * 
 * @apiSuccess {String} customer 客户名称
 * @apiSuccess {Number} followerid 跟进人ID
 * @apiSuccess {String} follower 跟进人名称
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "company": "山猫科技",
    "followerid": 567897890,
    "follower": "老王"
 }
 *
 * @apiUse BasicErrorProcess
 */


/**
 * @api {post} /billing/getPredictHistory 拉取预测历史列表
 * @apiName GetPredictHistory
 * @apiGroup Billing
 * 

 * @apiSuccess {Object[]} res 列表集合
 * @apiSuccess {String} follower 跟进人
 * @apiSuccess {String} title 跟进人职务
 * @apiSuccess {String} date 预测回款日期
 * @apiSuccess {Number} pay 预计回款金额
 * @apiSuccess {String} comments 回款说明描述内容
 * @apiSuccess {String} recdate 该条记录的日期（YY/MM/DD），如果该日期相对今天日期是昨天，则返回“昨日”；今天则显示“今日”
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "res": [{
        "follower":"老王",
        "title":"总监",
        "date":"2016-05-01",
        "pay":29000,
        "comments":"回款说明描述内容",
        "recdate":"16/05/01"
    }]
 }
 *
 
 *
 * @apiUse BasicErrorProcess
 */


/**
 * @api {post} /billing/getRequestHistory 拉取回款申报历史列表
 * @apiName GetRequestHistory
 * @apiGroup Billing
 * 

 * @apiSuccess {Object[]} res 列表集合
 * @apiSuccess {String} follower 跟进人
 * @apiSuccess {String} title 跟进人职务
 * @apiSuccess {String} contract 合同编号
 * @apiSuccess {Number} pay1 新增回款
 * @apiSuccess {Number} pay2 续费回款
 * @apiSuccess {Number} pay3 设备回款
 * @apiSuccess {String} accname 汇款账户名称
 * @apiSuccess {String} accid 汇款账号
 * @apiSuccess {String} date 汇款日期
 * @apiSuccess {String} state 审核状态
 * @apiSuccess {String} comments 回款说明描述内容
 * @apiSuccess {String} recdate 该条记录的日期（YY/MM/DD），如果该日期相对今天日期是昨天，则返回“昨日”；今天则显示“今日”
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "res": [{
        "follower":"老王",
        "title":"总监",
        "contract":"09876545678",
        "pay1":67891,
        "pay2":67891,
        "pay3":67891,
        "accname":"老王茶馆",
        "accid":"09876545678",
        "date":"2016-05-01",
        "state":"通过",
        "comments":"回款说明",
        "recdate":"16/05/01"
    }]
 }
 *

 *
 * @apiUse BasicErrorProcess
 */

/**
 * @api {post} /billing/doBillingStart 提交开始理单信息
 * @apiName DoBillingStart
 * @apiGroup Billing
 *
 * @apiParam {Number} bid 理单ID
 * @apiParam {Number} followerid 跟进人ID
 * @apiParam {Number} grade 经理评级
 * @apiParam {Number} state 跟进状态
 * @apiParam {String} comments 跟进建议
 *
 * @apiSuccess {Number} state 提交成功结果状态 0:成功  1:失败
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "state":0

 }
 *
 * @apiUse BasicErrorProcess
 */


/**
 * @api {post} /billing/doBillingPredict 提交预测填报信息
 * @apiName DoBillingPredict
 * @apiGroup Billing
 *
 * @apiParam {Number} bid 理单ID
 * @apiParam {Number} pay 预计回款金额
 * @apiParam {String} date 预计回款时间 yyyy-MM-DD 格式
 * @apiParam {String} comments 跟进情况描述
 *
 * @apiSuccess {Number} state 提交成功结果状态 0:成功  1:失败
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "state":0
 }

 *
 * @apiUse BasicErrorProcess
 */


/**
 * @api {post} /billing/doBillingPayRequest 提交回款申报信息
 * @apiName DoBillingPayRequest
 * @apiGroup Billing
 *
 * @apiParam {Number} bid 理单ID
 * @apiParam {String} contract 合同编号
 * @apiParam {Number} pay1 新增回款
 * @apiParam {Number} pay2 续费回款
 * @apiParam {Number} pay3 设备回款
 * @apiParam {Number} total 总计回款
 * @apiParam {String} comments 回款说明

 * @apiParam {String} accname 汇款账户名称
 * @apiParam {String} accid 汇款账号
 * @apiParam {String} date 汇款时间
 * @apiParam {String} picurl 回款照片URL
 *
 * @apiSuccess {Number} state 提交成功结果状态 0:成功  1:失败
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
     {
        "state":0
     }
 *

 *
 * @apiUse BasicErrorProcess
 */


/**
* @api {post} /billing/getBillingInfo 拉取理单信息（含状态）
* @apiName GetBillingInfo
* @apiGroup Billing
* 

* @apiSuccess {Object[]} res 列表集合
* @apiSuccess {String} cusName 客户名称
* @apiSuccess {String} follower 跟进人
* @apiSuccess {String} level 经理评级
* @apiSuccess {Number} followtype 跟进状态，如果为0-待理单，不能进行预测和回款
* @apiSuccess {String} comments 回款说明描述内容
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
{
   "res": [{
       "cusName":"客户名称",
       "follower":"跟进人",
       "level":"经理评级",
       "followtype":1,
       "comments":"跟进建议"
   }]
}

 *
 * @apiUse BasicErrorProcess
*/
