/**
 * @api {post} /rebilling/getList 拉取理单列表(条件)
 * @apiName GetList
 * @apiGroup ReBilling
 *
 * @apiParam {Number} userID 当前用户ID
 * @apiParam {String="join","follow"} seqType="follow" 排序类型（join:加入时间，follow:跟进状态）
 * @apiParam {String="follower","follow_time","contact_state","grade_staff","grade_manager","follow_rec"} siftType 筛选类型，默认为空，取值分别是：跟进人、下次拜访时间、联系情况、个人评级、经理评级、跟进记录，多值（交叉筛选）采用英文逗号分隔
 * @apiParam {String} siftRef 筛选类型对应可能出现的参数。说明：跟进人"uid,uid,..."；联系情况0,1,2,3,4,5；个人评级0,1,2,3,4,5...；经理评级0,1,2,3,4,5...；跟进记录：0,1,2,3,4,5,6...；下次拜访时间(仅该字段用单选值，其他可以多选）-本周:week，本月：month，自定义区间："yyyy-MM-DD HH:mm,yyyy-MM-DD HH:mm"。参数默认为空。
 *
 * @apiSuccess {Object[]} res 结果按组罗列在res中，seqType为follow时，跟进将结果按“待理单、已签已回……”等状态列表分组返回，seqType为其他时只返回一组。
 * @apiSuccess {String} name seqType为follow时当前组具有名称，否则名称为空。
 * @apiSuccess {Object[]} list 列表项目组数据
 * @apiSuccess {String} list.cid 列表项目数据
 * @apiSuccess {String} list.customer 公司名称
 * @apiSuccess {String} list.price 金额
 * @apiSuccess {String} list.level1 经理评级
 * @apiSuccess {String} list.level2 业务员评级
 * @apiSuccess {String} list.follower 跟进人
 * @apiSuccess {String} list.followtype 跟进状态
 * @apiSuccess {String} list.followtime 下次拜访时间
 * @apiSuccess {String} list.followstate 跟进描述（计算获取几天未跟进）
 * @apiSuccess {String} list.deadline 到期时间
 * @apiSuccess {String} list.structure 组织结构，格式“大区-城市-战区”
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
     "res": [{
         "name": "待处理",
         "list": [{
             "cid": 29347237429,
             "customer": "山猫科技",
             "price": 18888,
             "follower": "老王",
             "structure": "北京大区-北京-二战区",
             "followtime": "2016-05-01",
             "followstate":"3天未跟进",
             "deadline":"2017-06-01",
             "followtype": 0,
             "level1":0
             "level2":0
         }]
     }]
 }

 *
 * @apiError UserNotFound 无法根据当前ID查找对应数据
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 */

/**
 * @api {post} /rebilling/getListItemByCid 拉取理单数据（按ID查询）
 * @apiName GetList
 * @apiGroup ReBilling
 *
 * @apiParam {Number} cid 理单ID
 * 
 * @apiSuccess {String} customer 客户名称
 * @apiSuccess {Number} level1 经理评级（当前等级）
 * @apiSuccess {String} deadline 到期时间
 * @apiSuccess {String} followtype 跟进状态（阶段）
 * @apiSuccess {Number} deadcount 到期计时
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "company": "山猫科技",
    "level1":0,
    "deadline":"2017-01-01",
    "deadcount":9,
    "followtype":0
 }
 *
 * @apiError UserNotFound 无法根据当前ID查找对应数据
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 */


/**
 * @api {post} /rebilling/doBillingStart 提交开始理单信息
 * @apiName DoBillingStart
 * @apiGroup ReBilling
 *
 * @apiParam {Number} bid 理单ID
 * @apiParam {Number} grade 经理评级
 * @apiParam {Number} followtype 跟进状态
 * @apiParam {String} followtime 下次跟进时间 
 * @apiParam {String} comments 跟进内容
 *
 * @apiSuccess {Number} state 提交成功结果状态 0:成功  1:失败
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "state":0

 }
 *
 * @apiError UserNotFound 无法根据当前ID查找对应数据
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "ResultNotFound"
 *     }
 */
