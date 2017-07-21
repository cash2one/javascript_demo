/**
 * @api {post} /contacts_api/index/{userid} 获取联系人分组列表
 * @apiName Index
 * @apiDescription 获取客户联系人分组列表{拼接登录用户ID}，支持分页
 * @apiGroup Contacts
 *
 * @apiParam {Number} role 当前授权访问用户角色 1 新签leader,  2续签业务员, 3 新签业务员, 4 续签leader
 * @apiParam {Number} page 当前第几页
 * @apiParam {Number} size 每页几条 默认 30
 *
 * @apiSuccess {Number} pagecount 总页数
 * @apiSuccess {Object} data 结果数据位于data中
 * @apiSuccess {Object} data.customer 客户联系人列表，对象按索引罗列 可能的索引值 {index} 为 'A' 'B' 'C' …… 'empty' （empty为缺省索引值，当无拼音索引值时应以'empty'为索引。
 * @apiSuccess {Object[]} data.customer.index 索引值为index下的联系人列表
 * @apiSuccess {String} data.customer.index.cusid 客户id
 * @apiSuccess {String} data.customer.index.cusname 客户名称
 * @apiSuccess {String} data.customer.index.linkman 联系人姓名
 * @apiSuccess {String} data.customer.index.pinyin 拼音
 * @apiSuccess {String} data.customer.index.py 拼音
 * @apiSuccess {String} data.customer.index.telephone 联系电话
 * @apiSuccess {String} data.customer.index.position 职位
 * @apiSuccess {String} data.customer.index.status 未知
 * @apiSuccess {String} data.customer.index.linkman 未知
 * @apiSuccess {String} data.customer.index.linkman_encw 未知

 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "errno": 0,
    "errmsg": "success",
    "data": {
        "customer": {
            "index": [
                {
                    "cusid": "16186",
                    "cusname": "王的集团",
                    "linkman": "老王",
                    "pinyin": "laowang",
                    "py": "lw",
                    "telephone": "18101035495",
                    "position": "",
                    "status": "1",
                    "linkman_en": "",
                    "linkman_encw": ""
                }
            ]
        }
    }
 }

 *
 * @apiError UserNotFound 无法根据当前ID查找对应数据
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *          "errno": "1",
            "errmsg":"错误信息……"
 *     }
 */

/**
 * @api {post} /contacts_api/search/{userid} 搜索联系人
 * @apiName Search
 * @apiDescription 通过“联系人姓名”、“联系人所属客户的名称”查询客户联系人并返回结果列表{拼接登录用户ID}，不用分组，支持分页
 * @apiGroup Contacts
 *
 * @apiParam {Number} role 当前授权访问用户角色 1 新签leader,  2续签业务员, 3 新签业务员, 4 续签leader
 * @apiParam {Number} page 当前第几页
 * @apiParam {Number} size 每页几条 默认 30
 * @apiParam {String} keywords 查询关键字，JavaScript传入采用 encodeURIComponent()编码，PHP接收采用 urldecode()解码
 *
 * @apiSuccess {Number} page 当前第几页
 * @apiSuccess {Number} total 一共多少条数据
 * @apiSuccess {Number} pagecount 总页数
 * @apiSuccess {Object} data 结果数据位于data中
 * @apiSuccess {Object} data.customer 客户联系人列表，对象按索引罗列 可能的索引值 {index} 为 A B C …… DEFAULT （DEFAULT为缺省索引值，当无拼音索引值时应以DEFAULT为索引。
 * @apiSuccess {Object[]} data.customer.index 索引值为index下的联系人列表
 * @apiSuccess {String} data.customer.index.cusid 客户id
 * @apiSuccess {String} data.customer.index.cusname 客户名称
 * @apiSuccess {String} data.customer.index.linkman 联系人姓名
 * @apiSuccess {String} data.customer.index.pinyin 拼音
 * @apiSuccess {String} data.customer.index.py 拼音
 * @apiSuccess {String} data.customer.index.telephone 联系电话
 * @apiSuccess {String} data.customer.index.position 职位
 * @apiSuccess {String} data.customer.index.status 未知
 * @apiSuccess {String} data.customer.index.linkman 未知
 * @apiSuccess {String} data.customer.index.linkman_encw 未知

 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 {
    "errno": 0,
    "errmsg": "success",
    "data": {
        "page":1,
        "pagecount":18,
        "total":530,
        "customer": [
            {
                    "cusid": "16186",
                    "cusname": "王的集团",
                    "linkman": "老王",
                    "pinyin": "laowang",
                    "py": "lw",
                    "telephone": "18101035495",
                    "position": "",
                    "status": "1",
                    "linkman_en": "",
                    "linkman_encw": ""
            }
        ]
        
    }
 }

 *
 * @apiError UserNotFound 无法根据当前ID查找对应数据
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *          "errno": "1",
            "errmsg":"错误信息……"
 *     }
 */

