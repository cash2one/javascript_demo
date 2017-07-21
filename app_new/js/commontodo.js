function Database(t, a) {
    this.table = "senior_" + t, this.callback = a, this.adapter = null, this.validAdapters = ["dom"], this.lawnchair = null, this.connect(0)
}
Database.prototype.getAdapter = function() {
    return this.adapter
}, Database.prototype.connect = function(t) {
    if (t >= this.validAdapters.length) return void alert("您的应用不支持本地存储");
    var a = this.callback;
    if (null === a && (a = function() {}), this.adapter = this.validAdapters[t], ("indexed-db" === this.adapter || "webkit-sqlite" === this.adapter) && !this.checkAndroidIndexeddbSupport()) return void this.connect(t + 1);
    try {
        this.lawnchair = new Lawnchair({
            name: this.table,
            adapter: this.adapter
        }, a)
    } catch (n) {}
    null === this.lawnchair && this.connect(t + 1)
}, Database.prototype.checkAndroidIndexeddbSupport = function() {
    var t = !0;
    return (navigator.userAgent.match(/Android 2/) || navigator.userAgent.match(/Android 3/) || navigator.userAgent.match(/Android 4\.[0-3]/)) && (navigator.userAgent.match(/Chrome/) || (t = !1)), t
}, Database.prototype.save = function(t, a) {
    null === a && (a = function() {}), this.lawnchair.save(t, a)
}, Database.prototype.batch = function(t, a) {
    null === a && (a = function() {}), this.lawnchair.batch(t, a)
}, Database.prototype.all = function(t) {
    null === t && (t = function() {}), this.lawnchair.all(t)
}, Database.prototype.nuke = function(t) {
    null === t && (t = function() {}), this.lawnchair.nuke(t)
}, Database.prototype.get = function(t, a) {
    null === a && (a = function() {}), this.lawnchair.get(t, a)
}, Database.prototype.remove = function(t, a) {
    null === a && (a = function() {}), this.lawnchair.remove(t, a)
}, Database.prototype.exists = function(t, a) {
    null === a && (a = function() {}), this.lawnchair.exists(t, a)
}, Database.prototype.sum = function(t, a) {
    this.lawnchair.sum(t, a)
}, Database.prototype.avg = function(t, a) {
    this.lawnchair.avg(t, a)
}, Database.prototype.max = function(t, a) {
    this.lawnchair.max(t, a)
}, Database.prototype.min = function(t, a) {
    this.lawnchair.min(t, a)
}, Database.prototype.query = function(t, a, n, i) {
    var e = new Array;
    for (var r in t) e.push(" record." + r + "==='" + t[r] + "' ");
    "asc" === n ? this.lawnchair.where(e.join()).asc(a, i) : "desc" === n ? this.lawnchair.where(e.join()).desc(a, i) : this.lawnchair.where(e.join(), i)
};

function Store(e, t) {
    this.urlapi = e, this.deviceId = t, this.ajaxTimeout = 3e4, this.ajaxNeterrTip = "网络异常，请重试", this.dbnameUser = "user", this.dbnameConfig = "config", this.dbnameCustomer = "customer", this.dbnameDict = "dict", this.dbnameProduct = "product", this.dbnameXml = "xml", this.dbnameVisitplan = "visitplan", this.dbnameVisitroute = "visitroute", this.dbnameVisitresult = "visitresult"
}
Store.authUrl = function(e) {
    function t(e) {
        0 === e.indexOf('"') && (e = e.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
        try {
            return e = decodeURIComponent(e.replace(/\+/g, " "))
        } catch (t) {}
    }
    function o(e) {
        for (var o = void 0, i = document.cookie ? document.cookie.split("; ") : [], r = 0, n = i.length; n > r; r++) {
            var a = i[r].split("="),
                s = decodeURIComponent(a.shift()),
                u = a.join("=");
            if (e === s) {
                o = t(u);
                break
            }
        }
        return o
    }
    if (/\/dding\//.test(e)) return e;
    var i = o("HecomDDSenior");
    if (i) {
        try {
            i = JSON.parse(i)
        } catch (r) {}
        if ("object" == typeof i) {
            var n = i.deviceId,
                a = i.authToken;
            if (n && a) return e + "dding/" + n + "/" + a + "/"
        }
    }
    return e
}, Store.prepareResponse = function(e, t) {
    var o;
    return o = "object" == typeof e ? JSON.stringify(e) : new String(e), 0 !== o.indexOf('{"desc":"登录校验失败",') ? ($.isFunction(t) && t(e), !0) : (Store.prepareResponse = function() {}, void dd.ready(function() {
        dd.device.notification.alert({
            message: "长时间未操作，登录已过期，请重新打开微应用",
            buttonName: "确定",
            onSuccess: function() {
                dd.biz.navigation.close()
            },
            onFail: function(e) {
                console.log(e), dd.biz.navigation.close()
            }
        })
    }))
}, Store.prototype.addVisitplan = function(e, t) {
    var o = this;
    console.log("addvisitplan"), $.ajax({
        type: "POST",
        url: this.urlapi + "v40VisitPlan/saveVisitPlan.do",
        data: {
            deviceId: this.deviceId,
            data: JSON.stringify(e),
            version: "4.3"
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.addVisitplan(e, t)
        }
    })
}, Store.prototype.updateVisitplan = function(e, t, o) {
    var i = this;
    console.log("updatevisitplan"), $.ajax({
        type: "POST",
        url: this.urlapi + "v40VisitPlan/updateVisitPlan.do",
        data: {
            deviceId: this.deviceId,
            planCode: e,
            customerCodes: t
        },
        timeout: i.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, o)
        },
        error: function(r, n, a) {
            "timeout" === n && window.confirm(i.ajaxNeterrTip) && i.updateVisitplan(e, t, o)
        }
    })
}, Store.prototype.deleteVisitplan = function(e, t) {
    var o = this;
    console.log("deletevisitplan"), $.ajax({
        type: "POST",
        url: this.urlapi + "v40VisitPlan/deleteVisitPlan.do",
        data: {
            deviceId: this.deviceId,
            planCode: e
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.deleteVisitplan(e, t)
        }
    })
}, Store.prototype.addVisitroute = function(e, t, o, i) {
    var r = this;
    console.log("addvisitroute"), $.ajax({
        type: "POST",
        url: this.urlapi + "v40VisitRoute/saveVisitRoute.do",
        data: {
            deviceId: this.deviceId,
            routeName: e,
            customerCodes: t,
            routeCode: o,
            version: "4.3"
        },
        timeout: r.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, i)
        },
        error: function(n, a, s) {
            "timeout" === a && window.confirm(r.ajaxNeterrTip) && r.addVisitroute(e, t, o, i)
        }
    })
}, Store.prototype.updateVisitroute = function(e, t, o, i) {
    var r = this;
    console.log("updatevisitroute"), $.ajax({
        type: "POST",
        url: this.urlapi + "v40VisitRoute/updateVisitRoute.do",
        data: {
            deviceId: this.deviceId,
            routeName: e,
            customerCodes: t,
            routeCode: o
        },
        timeout: r.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, i)
        },
        error: function(n, a, s) {
            "timeout" === a && window.confirm(r.ajaxNeterrTip) && r.updateVisitroute(e, t, o, i)
        }
    })
}, Store.prototype.deleteVisitroute = function(e, t) {
    var o = this;
    console.log("deletevisitroute"), $.ajax({
        type: "POST",
        url: this.urlapi + "v40VisitRoute/deleteVisitRoute.do",
        data: {
            deviceId: this.deviceId,
            routeCode: e
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.deleteVisitroute(e, t)
        }
    })
}, Store.prototype.submitData = function(e, t, o) {
    var i = this;
    console.log("submitdata"), $.ajax({
        type: "POST",
        url: this.urlapi + "mobile/upload.do",
        data: {
            deviceId: this.deviceId,
            tsclientdata: e,
            contactJsonArrayStr: t,
            version: "4.3"
        },
        timeout: i.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, o)
        },
        error: function(t, r, n) {
            "timeout" === r && window.confirm(i.ajaxNeterrTip) && i.submitData(e, o)
        }
    })
}, Store.prototype.submitDataWithChannelId = function(e, t, o, i) {
    var r = this;
    console.log("submitdatawithchannelid"), $.ajax({
        type: "POST",
        url: this.urlapi + "mobile/upload.do",
        data: {
            deviceId: this.deviceId,
            channelId: e,
            tsclientdata: t,
            contactJsonArrayStr: o,
            version: "4.3"
        },
        timeout: r.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, i)
        },
        error: function(e, o, n) {
            "timeout" === o && window.confirm(r.ajaxNeterrTip) && r.submitDataWithChannelId(t, i)
        }
    })
}, Store.prototype.uplinkData = function(e, t) {
    var o = this;
    console.log("uplinkdata"), $.ajax({
        type: "POST",
        url: this.urlapi + "uplinkdata/uplink.do",
        data: e.encode(),
        processData: !1,
        contentType: "multipart/form-data; boundary=" + e.boundary,
        headers: {
            OSType: "ios"
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.uplinkData(e, t)
        }
    })
}, Store.prototype.getOrderDetail = function(e, t) {
    var o = this;
    console.log("getOrderDetail"), $.ajax({
        type: "POST",
        url: this.urlapi + "mobile/getDetailInformation.do",
        data: {
            deviceId: this.deviceId,
            code: e,
            kind: "orderDetail"
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getOrderDetail(e, t)
        }
    })
}, Store.prototype.getContacts = function(e, t) {
    var o = this;
    console.log("getContacts");
    var i = {
        type: "v40SyncCuscontacts",
        customerCode: e,
        deviceId: this.deviceId,
        lastUpdateTime: "",
        isNewContactType: "1"
    };
    $.ajax({
        /*type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do?_=" + Math.random(),
        data: {
            downlinkReqStr: JSON.stringify(i)
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getContacts(e, t)
        }*/
    })
}, Store.prototype.getCustomerAct = function(e, t, o) {
    var i = this;
    console.log("getCustomerActNew"), console.log({
        deviceId: this.deviceId,
        customerCode: e,
        pageSize: 20,
        preId: t,
        _t: (new Date).getTime()
    }), $.ajax({
        type: "GET",
        url: this.urlapi + "mobile/customer/queryCustVisitHisInfoForH5.do",
        data: {
            deviceId: this.deviceId,
            customerCode: e,
            pageSize: 20,
            preId: t,
            _t: (new Date).getTime()
        },
        timeout: i.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, o)
        },
        error: function(r, n, a) {
            "timeout" === n && window.confirm(i.ajaxNeterrTip) && i.getCustomerAct(e, t, o)
        }
    })
}, Store.prototype.uploadContactOrg = function(e, t) {
    var o = this;
    console.log("uploadContact"), $.ajax({
        type: "post",
        url: this.urlapi + "uplinkdata/uplink.do",
        data: JSON.stringify(e),
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.uploadContactOrg(e, t)
        }
    })
}, Store.prototype.uploadContact = function(e, t) {
    var o = function() {
        try {
            var e = new XMLHttpRequest,
                t = arguments,
                o = this,
                i = "";
            if (e.open(t[0].method, t[0].url, !0), -1 != t[0].method.search(/post/i)) {
                var r = Math.random().toString().substr(2);
                e.setRequestHeader("content-type", "multipart/form-data; charset=utf-8; boundary=" + r);
                for (var n in t[0].data) i += "--" + r + "\r\nContent-Disposition: form-data; name=" + n + "\r\nContent-type: application/octet-stream\r\n\r\n" + t[0].data[n] + "\r\n";
                i += "--" + r + "--\r\n"
            }
            e.onreadystatechange = function() {
                try {
                    4 === e.readyState && (o.txt = e.responseText, o.xml = e.responseXML, t[0].callback(e.responseText))
                } catch (i) {}
            }, e.send(i)
        } catch (a) {}
    };
    o({
        url: this.urlapi + "uplinkdata/uplink.do",
        method: "post",
        data: e,
        callback: function(e) {
            Store.prepareResponse(e, t)
        }
    })
}, Store.prototype.getTop = function(e) {
    var t = this;
    console.log("get top"), $.ajax({
        type: "GET",
        url: this.urlapi + "mobile/customer/getTopCustomerStandard.do",
        data: {
            deviceId: this.deviceId
        },
        timeout: t.ajaxTimeout,
        success: function(t) {
            Store.prepareResponse(t, e)
        },
        error: function(o, i, r) {
            "timeout" === i && window.confirm(t.ajaxNeterrTip) && t.getTop(e)
        }
    })
}, Store.prototype.setTop = function(e, t, o) {
    var i = this;
    console.log("set top"), $.ajax({
        type: "GET",
        url: this.urlapi + "mobile/customer/setTopCustomerStandard.do",
        data: {
            deviceId: this.deviceId,
            custCodes: e,
            isTop: t
        },
        timeout: i.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, o)
        },
        error: function(t, r, n) {
            "timeout" === r && window.confirm(i.ajaxNeterrTip) && i.setTop(e, o)
        }
    })
}, Store.prototype.getCustomerMapData = function(e, t, o, i) {
    var r = this;
    if (o) var n = {
        type: "syncCustomerDistributionH5",
        deviceId: this.deviceId,
        isInfoList: t,
        poiDatas: o
    };
    else var n = {
        type: "syncCustomerDistributionH5",
        city: e,
        deviceId: this.deviceId,
        isInfoList: t
    };
    $.ajax({
        type: "GET",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(n)
        },
        timeout: r.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, i)
        },
        error: function(o, n, a) {
            "timeout" === n && window.confirm(r.ajaxNeterrTip) && r.getCustomerMapData(e, t, i)
        }
    })
}, Store.prototype.getCustomerInfo = function(e, t) {
    var o = this;
    console.log("getCustomerInfo"), $.ajax({
        type: "GET",
        url: this.urlapi + "mobile/customer/getCustomerDetailInfoV40.do",
        data: {
            deviceId: this.deviceId,
            customerCode: e
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getCustomerInfo(e, t)
        }
    })
}, Store.prototype.getLatestVisitByIds = function(e, t) {
    var o = this;
    $.isArray(e) && (e = e.join(",")), console.log("getLatestVisitByIds"), $.ajax({
        type: "GET",
        url: this.urlapi + "dingding/queryVisitRecordByVisitId.do",
        data: {
            deviceId: this.deviceId,
            visitIds: e
        },
        dataType: "json",
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getLatestVisitByIds(e, t)
        }
    })
}, Store.prototype.setOwnerThreshold = function(e, t) {
    var o = this;
    console.log("setOwnerThreshold"), $.ajax({
        type: "POST",
        url: this.urlapi + "dingding/setOwnerThreshold.do",
        data: {
            deviceId: this.deviceId,
            threshold: e
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.setOwnerThreshold(e, t)
        }
    })
}, Store.prototype.updateLocateAddr = function(e, t, o, i) {
    var r = this;
    console.log("updateLocateAddr"), $.ajax({
        type: "POST",
        url: this.urlapi + "mobile/customer/updateCustomerPoiNew.do",
        data: {
            deviceId: this.deviceId,
            customerCode: o,
            location: e,
            locDesc: t
        },
        timeout: r.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, i)
        },
        error: function(n, a, s) {
            "timeout" === a && window.confirm(r.ajaxNeterrTip) && r.updateLocateAddr(e, t, o, i)
        }
    })
}, Store.prototype.saveInvitedUsers = function(e, t) {
    var o = this;
    console.log("saveInvitedUsers"), $.ajax({
        type: "GET",
        url: this.urlapi + "dingding/train/inviteTrain.do",
        data: {
            deviceId: this.deviceId,
            dingUserIds: e
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.saveInvitedUsers(e, t)
        }
    })
}, Store.prototype.getCustomerCodeBydtcode = function(e, t) {
    var o = this;
    console.log("getCustomerCodeBydtcode"), $.ajax({
        type: "GET",
        url: this.urlapi + "dingtalk/crm/getCustomerCodeByDingId.do",
        data: {
            custId: e,
            deviceId: this.deviceId
        },
        dataType: "json",
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getCustomerCodeBydtcode(e, t)
        }
    })
}, Store.prototype.getActivityPic = function(e) {
    var t = this;
    console.log("getActivityPic"), $.ajax({
        type: "GET",
        url: this.urlapi + "dingding/train/queryTrainingPrizeInfo.do",
        data: {
            deviceId: this.deviceId
        },
        dataType: "json",
        timeout: t.ajaxTimeout,
        success: function(t) {
            Store.prepareResponse(t, e)
        },
        error: function(o, i, r) {
            "timeout" === i && window.confirm(t.ajaxNeterrTip) && t.getActivityPic(e)
        }
    })
}, Store.prototype.saveNotRemind = function(e) {
    var t = this;
    console.log("saveNotRemind"), $.ajax({
        type: "GET",
        url: this.urlapi + "dingding/train/uploadTrainNotify.do",
        data: {
            deviceId: this.deviceId
        },
        timeout: t.ajaxTimeout,
        dataType: "json",
        success: function(t) {
            Store.prepareResponse(t, e)
        },
        error: function(o, i, r) {
            "timeout" === i && window.confirm(t.ajaxNeterrTip) && t.saveNotRemind(e)
        }
    })
}, Store.prototype.saveConsigneeInfo = function(e, t, o, i) {
    var r = this;
    console.log("saveConsigneeInfo"), $.ajax({
        type: "GET",
        url: this.urlapi + "dingding/train/uploadConsigneeInfo.do",
        data: {
            deviceId: this.deviceId,
            telephone: e,
            name: t,
            address: o
        },
        timeout: r.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, i)
        },
        error: function(n, a, s) {
            "timeout" === a && window.confirm(r.ajaxNeterrTip) && r.saveConsigneeInfo(e, t, o, i)
        }
    })
}, Store.prototype.getEmployeeInfo = function(e) {
    var t = this;
    console.log("getEmployeeInfo"), $.ajax({
        type: "GET",
        url: this.urlapi + "dingding/train/queryEmployeeInfo.do",
        data: {
            deviceId: this.deviceId
        },
        dataType: "json",
        timeout: t.ajaxTimeout,
        success: function(t) {
            Store.prepareResponse(t, e)
        },
        error: function(o, i, r) {
            "timeout" === i && window.confirm(t.ajaxNeterrTip) && t.getEmployeeInfo(e)
        }
    })
}, Store.prototype.getisFinishTrain = function(e) {
    var t = this;
    $.ajax({
        type: "GET",
        url: this.urlapi + "dingding/train/isFinishTrain.do",
        data: {
            deviceId: this.deviceId
        },
        dataType: "json",
        timeout: t.ajaxTimeout,
        success: function(t) {
            Store.prepareResponse(t, e)
        },
        error: function(o, i, r) {
            "timeout" === i && window.confirm(t.ajaxNeterrTip) && t.getisFinishTrain(e)
        }
    })
}, Store.prototype.getTaskList = function(e) {
    var t = this;
    console.log("getTaskList"), $.ajax({
        type: "GET",
        url: this.urlapi + "dingding/train/queryTaskList.do",
        data: {
            deviceId: this.deviceId
        },
        dataType: "json",
        timeout: t.ajaxTimeout,
        success: function(t) {
            Store.prepareResponse(t, e)
        },
        error: function(o, i, r) {
            "timeout" === i && window.confirm(t.ajaxNeterrTip) && t.getTaskList(e)
        }
    })
}, Store.prototype.uploadDatadecisionFT = function(e) {
    var t = this;
    console.log("uploadFTDatadecision"), $.ajax({
        type: "POST",
        url: this.urlapi + "trained/10/dingding/train/reportTrain.do",
        data: {
            deviceId: this.deviceId
        },
        dataType: "json",
        timeout: t.ajaxTimeout,
        success: function(t) {
            e()
        },
        error: function(o, i, r) {
            "timeout" === i && window.confirm(t.ajaxNeterrTip) && t.uploadDatadecisionFT(e)
        }
    })
}, Store.prototype.getPlansByTimestamp = function(e, t, o, i, r) {
    var n = this;
    console.log("dingVisitPlanInfo"), e || (e = this.deviceId);
    var a = {
        type: "dingVisitPlanInfo",
        searchEmplCode: t,
        deviceId: e,
        beginTime: o,
        endTime: i
    };
    /*$.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do?_=" + Math.random(),
        data: {
            downlinkReqStr: JSON.stringify(a)
        },
        timeout: n.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, r)
        },
        error: function(a, s, u) {
            "timeout" === s && window.confirm(n.ajaxNeterrTip) && n.getPlansByTimestamp(e, t, o, i, r)
        }
    })*/
}, Store.prototype.getUserList = function(e, t) {
    var o = this;
    console.log("dingSyncAuthEmpl"), $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(e)
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getUserList(e, t)
        }
    })
}, Store.prototype.getUserCustomerList = function(e, t) {
    var o = this;
    console.log("getUserCustomerList"), $.ajax({
        type: "get",
        url: this.urlapi + "mobile/employeeCustomer/queryEmployeeCustomer.do",
        data: e,
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getUserCustomerList(e, t)
        }
    })
}, Store.prototype.getCusList = function(e, t) {
    var o = this;
    console.log("dingCustomerList");
    var i = e;
    $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do?_t=" + (new Date).getTime(),
        data: {
            downlinkReqStr: JSON.stringify(i)
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getCusList(e, t)
        }
    })
}, Store.prototype.submitDistribution = function(e, t) {
    var o = this;
    console.log("submitDistribution"), $.ajax({
        type: "get",
        url: this.urlapi + "mobile/employeeCustomer/transferEmployeeCustomer.do",
        data: e,
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.submitDistribution(e, t)
        }
    })
}, Store.prototype.bindOneEmployeeManyCustomer = function(e, t) {
    var o = this;
    console.log("submitDistribution"), $.ajax({
        type: "get",
        url: this.urlapi + "mobile/employeeCustomer/bindOneEmployeeManyCustomer.do",
        data: e,
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(e, i, r) {
            "timeout" === i && window.confirm(o.ajaxNeterrTip) && o.bindOneEmployeeManyCustomer(filterObj, t)
        }
    })
}, Store.prototype.getSubEmpl = function(e, t) {
    var o = this;
    console.log("dingSyncAuthEmpl");
    var i = e;
    $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(i)
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getSubEmpl(e, t)
        }
    })
}, Store.prototype.getCusFollow = function(e, t, o) {
    var i = this;
    console.log("dingSyncCustEmpl");
    var r = {
        type: "dingSyncCustEmpl",
        entCode: t,
        deviceId: i.deviceId,
        customerCode: e
    };
    $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(r)
        },
        timeout: i.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, o)
        },
        error: function(r, n, a) {
            "timeout" === n && window.confirm(i.ajaxNeterrTip) && i.getCusFollow(e, t, o)
        }
    })
}, Store.prototype.bindCusFollow = function(e, t, o) {
    var i = this;
    console.log("bindCusFollow"), $.ajax({
        type: "POST",
        url: this.urlapi + "mobile/employeeCustomer/bindManyEmployeeOneCustomer.do",
        data: {
            deviceId: i.deviceId,
            customerCode: e,
            employeeCode: t
        },
        timeout: i.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, o)
        },
        error: function(r, n, a) {
            "timeout" === n && window.confirm(i.ajaxNeterrTip) && i.bindCusFollow(e, t, o)
        }
    })
}, Store.prototype.unbindCusFollow = function(e, t, o) {
    var i = this;
    console.log("unbindCusFollow"), $.ajax({
        type: "POST",
        url: this.urlapi + "mobile/employeeCustomer/unbindManyEmployeeOneCustomer.do",
        data: {
            deviceId: i.deviceId,
            customerCode: e,
            employeeCode: t
        },
        timeout: i.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, o)
        },
        error: function(t, r, n) {
            "timeout" === r && window.confirm(i.ajaxNeterrTip) && i.unbindCusFollow(e, entCode, o)
        }
    })
}, Store.prototype.getInviteeList = function(e) {
    var t = this;
    $.ajax({
        type: "GET",
        url: this.urlapi + "dingding/train/queryInviteeList.do",
        data: {
            deviceId: this.deviceId
        },
        dataType: "json",
        timeout: t.ajaxTimeout,
        success: function(t) {
            Store.prepareResponse(t, e)
        },
        error: function(o, i, r) {
            "timeout" === i && window.confirm(t.ajaxNeterrTip) && t.getInviteeList(e)
        }
    })
}, Store.prototype.saveInviteUsers = function(e, t) {
    var o = this;
    e.deviceId = o.deviceId, $.ajax({
        type: "get",
        url: this.urlapi + "/dingding/train/inviteTrain.do",
        data: e,
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.saveInviteUsers(e, t)
        }
    })
}, Store.prototype.getCustomerActNew = function(e, t) {
    var o = this;
    console.log("dingVisitInfo");
    var i = e;
    $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do?_=" + Math.random(),
        data: {
            downlinkReqStr: JSON.stringify(i)
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getCustomerActNew(e, t)
        }
    })
}, Store.prototype.getCustomerEmplAct = function(e, t) {
    var o = this;
    console.log("dingVisitInfo");
    var i = e;
    $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(i)
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getCustomerActNew(e, t)
        }
    })
}, Store.prototype.getCustomerVisitPlan = function(e, t) {
    var o = this;
    console.log("dingVisitPlanNew"), $.ajax({
        type: "POST",
        url: this.urlapi + "mobile/customer/queryCustomerVisitPlan.do",
        data: {
            entCode: entCode,
            deviceId: this.deviceId,
            customerCode: e
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getCustomerVisitPlan(e, t)
        }
    })
}, Store.prototype.addNewCustomerToVisitplan = function(e, t, o) {
    var i = this;
    console.log("addNewCustomerToVisitplan"), $.ajax({
        type: "POST",
        url: this.urlapi + "v40VisitPlan/changeVisitPlan.do",
        data: {
            deviceId: this.deviceId,
            customerCodes: e,
            planDate: t
        },
        timeout: i.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, o)
        },
        error: function(e, t, r) {
            "timeout" === t && window.confirm(i.ajaxNeterrTip) && i.addVisitplan(data, o)
        }
    })
}, Store.prototype.getDailyList = function(e, t) {
    var o = this,
        i = e;
    $.ajax({
        type: "GET",
        url: this.urlapi + "downlinkdata/downlink.do?_=" + Math.random(),
        data: {
            downlinkReqStr: JSON.stringify(i)
        },
        dataType: "json",
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getDailyList(e, t)
        }
    })
}, Store.prototype.addDaily = function(e, t) {
    var o = this;
    console.log("addDaily"), $.ajax({
        type: "POST",
        url: this.urlapi + "uplinkdata/uplink.do",
        data: e.encode(),
        processData: !1,
        contentType: "multipart/form-data; boundary=" + e.boundary,
        headers: {
            OSType: "ios"
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.addDaily(e, t)
        }
    })
}, Store.prototype.getTaskListNew = function(e, t, o) {
    var i = this;
    console.log("getTaskListNew");
    var r = {
        type: "dingSyncWorkTask",
        deviceId: i.deviceId,
        searchType: e,
        pageSize: "20",
        pageNum: t
    };
    $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do?_=" + Math.random(),
        data: {
            downlinkReqStr: JSON.stringify(r)
        },
        timeout: i.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, o)
        },
        error: function(r, n, a) {
            "timeout" === n && window.confirm(i.ajaxNeterrTip) && i.getTaskListNew(e, t, o)
        }
    })
}, Store.prototype.addNewTask = function(e, t) {
    var o = this;
    console.log("addNewTask"), $.ajax({
        type: "POST",
        url: this.urlapi + "workTask/addWorkTask.do",
        data: {
            workTaskReqStr: JSON.stringify(e)
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.addNewTask(e, t)
        }
    })
}, Store.prototype.getTaskInfoById = function(e, t, o) {
    var i = this;
    console.log("getTaskInfoById");
    var r = {
        deviceId: i.deviceId,
        entCode: t,
        code: e
    };
    $.ajax({
        type: "POST",
        url: this.urlapi + "workTask/getTaskInfo.do",
        data: {
            workTaskReqStr: JSON.stringify(r)
        },
        timeout: i.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, o)
        },
        error: function(r, n, a) {
            "timeout" === n && window.confirm(i.ajaxNeterrTip) && i.getTaskInfoById(e, t, o)
        }
    })
}, Store.prototype.subStartTask = function(e, t) {
    var o = this;
    console.log("subStartTask"), $.ajax({
        type: "POST",
        url: this.urlapi + "workTask/startTask.do",
        data: {
            workTaskReqStr: JSON.stringify(e)
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.subStartTask(e, t)
        }
    })
}, Store.prototype.subEndTask = function(e, t) {
    var o = this;
    console.log("subEndTask"), $.ajax({
        type: "POST",
        url: this.urlapi + "workTask/endTask.do",
        data: {
            workTaskReqStr: JSON.stringify(e)
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(e, i, r) {
            "timeout" === i && window.confirm(o.ajaxNeterrTip) && o.subEndTask(t, t)
        }
    })
}, Store.prototype.deleteTaskInfoById = function(e, t) {
    var o = this;
    console.log("deleteTaskInfoById");
    var i = {
        deviceId: o.deviceId,
        entCode: entCode,
        code: e
    };
    $.ajax({
        type: "POST",
        url: this.urlapi + "workTask/deleteTask.do",
        data: {
            workTaskReqStr: JSON.stringify(i)
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.deleteTaskInfoById(e, t)
        }
    })
}, Store.prototype.getTaskListByTime = function(e, t, o, i) {
    var r = this;
    console.log("getTaskList");
    var n = {
        type: "dingSyncWorkTask",
        deviceId: e,
        searchType: 3,
        beginTime: t,
        endTime: o
    };
    $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(n)
        },
        timeout: r.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, i)
        },
        error: function(e, n, a) {
            "timeout" === n && window.confirm(r.ajaxNeterrTip) && r.getTaskListByTime(t, o, i)
        }
    })
}, Store.prototype.getDepartMent = function(e, t) {
    var o = this,
        i = e;
    $.ajax({
        type: "GET",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(i)
        },
        dataType: "json",
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getDepartMent(e, t)
        }
    })
}, Store.prototype.dingSyncAllEmpl = function(e, t) {
    var o = this;
    console.log("dingSyncAllEmpl"), $.ajax({
        type: "GET",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(e)
        },
        dataType: "json",
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.dingSyncAllEmpl(e, t)
        }
    })
}, Store.prototype.syncTodayClockingIn = function(e) {
    var t = this;
    console.log("syncTodayClockingIn");
    var o = {
        type: "dingSyncClockingIn",
        deviceId: t.deviceId
    };
    $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(o)
        },
        timeout: t.ajaxTimeout,
        success: function(t) {
            Store.prepareResponse(t, e)
        },
        error: function(o, i, r) {
            "timeout" === i && window.confirm(t.ajaxNeterrTip) && t.syncTodayClockingIn(e)
        }
    })
}, Store.prototype.getApproveListNew = function(e, t, o) {
    var i = this;
    console.log("getApproveListNew");
    var r = {
        type: "dingSyncApprovalInfo",
        deviceId: i.deviceId,
        searchType: e,
        pageSize: "20",
        pageNum: t
    };
    $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do?_=" + Math.random(),
        data: {
            downlinkReqStr: JSON.stringify(r)
        },
        timeout: i.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, o)
        },
        error: function(r, n, a) {
            "timeout" === n && window.confirm(i.ajaxNeterrTip) && i.getApproveListNew(e, t, o)
        }
    })
}, Store.prototype.addNewApprove = function(e, t) {
    var o = this;
    console.log("addNewApprove"), $.ajax({
        type: "POST",
        url: this.urlapi + "v40Examine/saveExamine.do",
        data: {
            userExamineReqStr: JSON.stringify(e)
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.addNewApprove(e, t)
        }
    })
}, Store.prototype.checkApprove = function(e, t) {
    var o = this;
    console.log("checkApprove"), $.ajax({
        type: "POST",
        url: this.urlapi + "v40Examine/saveExamineFlow.do",
        data: {
            userExamineReqStr: JSON.stringify(e)
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.checkApprove(e, t)
        }
    })
}, Store.prototype.getApproveInfo = function(e, t) {
    var o = this;
    console.log("getApproveInfo"), $.ajax({
        type: "POST",
        url: this.urlapi + "v40Examine/getExamineDetail.do",
        data: {
            userExamineReqStr: JSON.stringify(e)
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getApproveInfo(e, t)
        }
    })
}, Store.prototype.cancelExamine = function(e, t) {
    var o = this;
    console.log("cancelExamine"), $.ajax({
        type: "POST",
        url: this.urlapi + "v40Examine/cancelExamine.do",
        data: {
            userExamineReqStr: JSON.stringify(e)
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.cancelExamine(e, t)
        }
    })
}, Store.prototype.getPromotionDetail = function(e, t) {
    var o = this;
    console.log("getOrderDetail"), $.ajax({
        type: "POST",
        url: this.urlapi + "mobile/getDetailInformation.do",
        data: {
            deviceId: this.deviceId,
            code: e,
            kind: "promotionDetail"
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getOrderDetail(e, t)
        }
    })
}, Store.prototype.getCustomerVisitPromExecute = function(e, t) {
    var o = this,
        i = {
            type: "promExecuteH5",
            deviceId: o.deviceId,
            customerCode: e
        };
    console.log("getCustomerVisitPromExecute"), $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(i)
        },
        timeout: o.ajaxTimeout,
        success: function(e) {
            Store.prepareResponse(e, t)
        },
        error: function(i, r, n) {
            "timeout" === r && window.confirm(o.ajaxNeterrTip) && o.getCustomerVisitPromExecute(e, t)
        }
    })
};

function Init(e, t, n, o, r) {
    this.urlapi = e, this.deviceId = t, this.authToken = n, this.v40DingEmplInfo = o, this.callback = r, this.debug = !1, this.ajaxTimeout = 3e4, this.dbUser = null, this.dbConfig = null, this.dbCustomer = null, this.dbDict = null, this.dbProduct = null, this.dbXml = null, this.dbVisitplan = null, this.dbVisitroute = null, this.dbVisitresult = null, this.dbTmpplan = null, this.dbVisitinfo = null, this.dbOrder = null, this.dbOrganization = null, this.dbDeliveryman = null, this.dbPromotionsupply = null, this.dbLayer = null, this.dbTaskresult = null, this.dbStatus = null, this.dbnameUser = "user", this.dbnameConfig = "config", this.dbnameCustomer = "customer", this.dbnameDict = "dict", this.dbnameProduct = "product", this.dbnameXml = "xml", this.dbnameVisitplan = "visitplan", this.dbnameVisitroute = "visitroute", this.dbnameVisitresult = "visitresult", this.dbnameTmpplan = "tmpplan", this.dbnameVisitinfo = "visitinfo", this.dbnameOrder = "order", this.dbnameOrganization = "organization", this.dbnameDeliveryman = "deliveryman", this.dbnamePromotionsupply = "promotionsupply", this.dbnameLayer = "layer", this.dbnameTaskresult = "taskresult", this.dbnameStasus = "status", this.userDeviceIdKeyName = "deviceId", this.lastUpdateTime_customer_name = "lastUpdateTime_customer", this.lastUpdateTime_dict_name = "lastUpdateTime_dict", this.lastUpdateTime_product_name = "lastUpdateTime_product", this.lastUpdateTime_xml_name = "lastUpdateTime_xml", this.lastUpdateTime_visitplan_name = "lastUpdateTime_visitplan", this.lastUpdateTime_visitroute_name = "lastUpdateTime_visitroute", this.lastUpdateTime_visitinfo_name = "lastUpdateTime_visitinfo", this.lastUpdateTime_order_name = "lastUpdateTime_order", this.lastUpdateTime_organization_name = "lastUpdateTime_organization", this.update_completed_customer = "update_completed_customer", this.update_completed_dict = "update_completed_dict", this.update_completed_product = "update_completed_product", this.update_completed_xml = "update_completed_xml", this.update_completed_visitinfo = "update_completed_visitinfo", this.update_completed_order = "update_completed_order", this.update_completed_organization = "update_completed_organization", this.lastUpdateTime_customer = "", this.lastUpdateTime_dict = "", this.lastUpdateTime_product = "", this.lastUpdateTime_xml = "", this.lastUpdateTime_visitplan = "", this.lastUpdateTime_visitroute = "", this.lastUpdateTime_visitinfo = "", this.lastUpdateTime_order = "", this.lastUpdateTime_organization = "", $("#out").html(""), this.showNeterror = !1, this.connectDB()
}
Init.prototype.log = function(e) {
    this.debug && console.log(e)
}, Init.prototype.showProgress = function() {
    this.showNeterror || (this.showNeterror = !0, dd.device.notification.confirm({
        message: "连接失败，请重试！",
        title: "连接失败",
        buttonLabels: ["重试", "取消"],
        onSuccess: function(e) {
            0 === e.buttonIndex && window.location.reload()
        },
        onFail: function(e) {}
    }))
}, Init.prototype.closeLoading = function() {
    this.callback()
}, Init.prototype.connectDB = function() {
    function e() {
        h.log("connectDB:user");
        var e = $.Deferred();
        return h.dbUser = new Database(h.dbnameUser, function() {
            h.log("connectDB:user_callback"), e.resolve("connect")
        }), e.promise()
    }
    function t() {
        h.log("connectDB:config");
        var e = $.Deferred();
        return h.dbConfig = new Database(h.dbnameConfig, function() {
            h.log("connectDB:config_callback"), e.resolve("connect")
        }), e.promise()
    }
    function n() {
        h.log("connectDB:customer");
        var e = $.Deferred();
        return h.dbCustomer = new Database(h.dbnameCustomer, function() {
            h.log("connectDB:customer_callback"), e.resolve("connect")
        }), e.promise()
    }
    function o() {
        h.log("connectDB:dict");
        var e = $.Deferred();
        return h.dbDict = new Database(h.dbnameDict, function() {
            h.log("connectDB:dict_callback"), e.resolve("connect")
        }), e.promise()
    }
    function r() {
        h.log("connectDB:product");
        var e = $.Deferred();
        return h.dbProduct = new Database(h.dbnameProduct, function() {
            h.log("connectDB:product_callback"), e.resolve("connect")
        }), e.promise()
    }
    function i() {
        h.log("connectDB:xml");
        var e = $.Deferred();
        return h.dbXml = new Database(h.dbnameXml, function() {
            h.log("connectDB:xml_callback"), e.resolve("connect")
        }), e.promise()
    }
    function a() {
        h.log("connectDB:visitplan");
        var e = $.Deferred();
        return h.dbVisitplan = new Database(h.dbnameVisitplan, function() {
            h.log("connectDB:visitplan_callback"), e.resolve("connect")
        }), e.promise()
    }
    function l() {
        h.log("connectDB:visitroute");
        var e = $.Deferred();
        return h.dbVisitroute = new Database(h.dbnameVisitroute, function() {
            h.log("connectDB:visitroute_callback"), e.resolve("connect")
        }), e.promise()
    }
    function s() {
        h.log("connectDB:visitresult");
        var e = $.Deferred();
        return h.dbVisitresult = new Database(h.dbnameVisitresult, function() {
            h.log("connectDB:visitresult_callback"), e.resolve("connect")
        }), e.promise()
    }
    function c() {
        h.log("connectDB:tmpplan");
        var e = $.Deferred();
        return h.dbTmpplan = new Database(h.dbnameTmpplan, function() {
            h.log("connectDB:tmpplan_callback"), e.resolve("connect")
        }), e.promise()
    }
    function u() {
        h.log("connectDB:visitinfo");
        var e = $.Deferred();
        return h.dbVisitinfo = new Database(h.dbnameVisitinfo, function() {
            h.log("connectDB:visitinfo_callback"), e.resolve("connect")
        }), e.promise()
    }
    function d() {
        h.log("connectDB:order");
        var e = $.Deferred();
        return h.dbOrder = new Database(h.dbnameOrder, function() {
            h.log("connectDB:order_callback"), e.resolve("connect")
        }), e.promise()
    }
    function p() {
        h.log("connectDB:organization");
        var e = $.Deferred();
        return h.dbOrganization = new Database(h.dbnameOrganization, function() {
            h.log("connectDB:organization_callback"), e.resolve("connect")
        }), e.promise()
    }
    function _() {
        h.log("connectDB:deliveryman");
        var e = $.Deferred();
        return h.dbDeliveryman = new Database(h.dbnameDeliveryman, function() {
            h.log("connectDB:deliveryman_callback"), e.resolve("connect")
        }), e.promise()
    }
    function f() {
        h.log("connectDB:promotionsupply");
        var e = $.Deferred();
        return h.dbPromotionsupply = new Database(h.dbnamePromotionsupply, function() {
            h.log("connectDB:promotionsupply_callback"), e.resolve("connect")
        }), e.promise()
    }
    function v() {
        h.log("connectDB:layer");
        var e = $.Deferred();
        return h.dbLayer = new Database(h.dbnameLayer, function() {
            h.log("connectDB:layer_callback"), e.resolve("connect")
        }), e.promise()
    }
    function m() {
        h.log("connectDB:taskresult");
        var e = $.Deferred();
        return h.dbTaskresult = new Database(h.dbnameTaskresult, function() {
            h.log("connectDB:taskresult_callback"), e.resolve("connect")
        }), e.promise()
    }
    function g() {
        h.log("connectDB:status");
        var e = $.Deferred();
        return h.dbStatus = new Database(h.dbnameStasus, function() {
            h.log("connectDB:status_callback"), e.resolve("connect")
        }), e.promise()
    }
    var h = this;
    h.log("connectDB:WHEN"), $.when(e()).then(function() {
        return t()
    }).then(function() {
        return n()
    }).then(function() {
        return o()
    }).then(function() {
        return r()
    }).then(function() {
        return i()
    }).then(function() {
        return a()
    }).then(function() {
        return l()
    }).then(function() {
        return s()
    }).then(function() {
        return c()
    }).then(function() {
        return u()
    }).then(function() {
        return d()
    }).then(function() {
        return p()
    }).then(function() {
        return _()
    }).then(function() {
        return f()
    }).then(function() {
        return v()
    }).then(function() {
        return m()
    }).then(function() {
        return g()
    }).done(function() {
        h.log("connectDB:WHEN DOWN"), h.checkUserChanged()
    })
}, Init.prototype.checkUserChanged = function() {
    var e = this;
    this.dbUser.get(this.userDeviceIdKeyName, function(t) {
        function n() {
            e.log("checkUserChanged-NUKE:user");
            var t = $.Deferred();
            return e.dbUser.nuke(function() {
                e.log("checkUserChanged-NUKE:user_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function o() {
            e.log("checkUserChanged-NUKE:config");
            var t = $.Deferred();
            return e.dbConfig.nuke(function() {
                e.log("checkUserChanged-NUKE:config_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function r() {
            e.log("checkUserChanged-NUKE:customer");
            var t = $.Deferred();
            return e.dbCustomer.nuke(function() {
                e.log("checkUserChanged-NUKE:customer_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function i() {
            e.log("checkUserChanged-NUKE:dict");
            var t = $.Deferred();
            return e.dbDict.nuke(function() {
                e.log("checkUserChanged-NUKE:dict_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function a() {
            e.log("checkUserChanged-NUKE:product");
            var t = $.Deferred();
            return e.dbProduct.nuke(function() {
                e.log("checkUserChanged-NUKE:product_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function l() {
            e.log("checkUserChanged-NUKE:xml");
            var t = $.Deferred();
            return e.dbXml.nuke(function() {
                e.log("checkUserChanged-NUKE:xml_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function s() {
            e.log("checkUserChanged-NUKE:visitplan");
            var t = $.Deferred();
            return e.dbVisitplan.nuke(function() {
                e.log("checkUserChanged-NUKE:visitplan_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function c() {
            e.log("checkUserChanged-NUKE:visitroute");
            var t = $.Deferred();
            return e.dbVisitroute.nuke(function() {
                e.log("checkUserChanged-NUKE:visitroute_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function u() {
            e.log("checkUserChanged-NUKE:visitresult");
            var t = $.Deferred();
            return e.dbVisitresult.nuke(function() {
                e.log("checkUserChanged-NUKE:visitresult_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function d() {
            e.log("checkUserChanged-NUKE:tmpplan");
            var t = $.Deferred();
            return e.dbTmpplan.nuke(function() {
                e.log("checkUserChanged-NUKE:tmpplan_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function p() {
            e.log("checkUserChanged-NUKE:visitinfo");
            var t = $.Deferred();
            return e.dbVisitinfo.nuke(function() {
                e.log("checkUserChanged-NUKE:visitinfo_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function _() {
            e.log("checkUserChanged-NUKE:order");
            var t = $.Deferred();
            return e.dbOrder.nuke(function() {
                e.log("checkUserChanged-NUKE:order_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function f() {
            e.log("checkUserChanged-NUKE:organization");
            var t = $.Deferred();
            return e.dbOrganization.nuke(function() {
                e.log("checkUserChanged-NUKE:organization_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function v() {
            e.log("checkUserChanged-NUKE:deliveryman");
            var t = $.Deferred();
            return e.dbDeliveryman.nuke(function() {
                e.log("checkUserChanged-NUKE:deliveryman_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function m() {
            e.log("checkUserChanged-NUKE:promotionsupply");
            var t = $.Deferred();
            return e.dbPromotionsupply.nuke(function() {
                e.log("checkUserChanged-NUKE:promotionsupply_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function g() {
            e.log("checkUserChanged-NUKE:layer");
            var t = $.Deferred();
            return e.dbLayer.nuke(function() {
                e.log("checkUserChanged-NUKE:layer_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function h() {
            e.log("checkUserChanged-NUKE:taskresult");
            var t = $.Deferred();
            return e.dbTaskresult.nuke(function() {
                e.log("checkUserChanged-NUKE:taskresult_callback"), t.resolve("nuke")
            }), t.promise()
        }
        function k() {
            e.log("checkUserChanged-NUKE:status");
            var t = $.Deferred();
            return e.dbStatus.nuke(function() {
                e.log("checkUserChanged-NUKE:status_callback"), t.resolve("nuke")
            }), t.promise()
        }
        if (void 0 !== t && null !== t) {
            var b = "";
            void 0 !== t.deviceId && null !== t.deviceId && (b = t.deviceId);
            var U = null;
            void 0 !== t.v40DingEmplInfo && null !== t.v40DingEmplInfo && (U = t.v40DingEmplInfo), b !== e.deviceId || null == U ? (e.log("checkUserChanged-NUKE:WHEN"), $.when(n(), o(), r(), i(), a(), l(), s(), c(), u(), d(), p(), _(), f(), v(), m(), g(), h(), k()).done(function() {
                e.log("checkUserChanged-NUKE:WHEN DOWN"), e.initUserInfo()
            })) : (e.log("checkUserUnchanged:SAVE USER"), e.initUserInfo())
        } else e.log("checkNoUserInLocalStorage:SAVE USER"), e.initUserInfo()
    })
}, Init.prototype.initUserInfo = function() {
    var e = this,
        t = {};
    t.key = this.userDeviceIdKeyName, t.deviceId = this.deviceId, t.authToken = this.authToken, t.v40DingEmplInfo = this.v40DingEmplInfo, e.log(t), this.dbUser.save(t, function() {
        e.getLastUpdateTimes()
    })
}, Init.prototype.getLastUpdateTimes = function() {
    var e = this;
    this.dbConfig.get([this.lastUpdateTime_customer_name, this.lastUpdateTime_dict_name, this.lastUpdateTime_product_name, this.lastUpdateTime_xml_name, this.lastUpdateTime_visitplan_name, this.lastUpdateTime_visitroute_name, this.lastUpdateTime_visitinfo_name, this.lastUpdateTime_order_name, this.lastUpdateTime_organization_name, this.update_completed_customer, this.update_completed_dict, this.update_completed_xml, this.update_completed_visitinfo, this.update_completed_order, this.update_completed_organization, this.update_completed_product], function(t) {
        void 0 !== t && null !== t && (void 0 !== t[0] && null !== t[0] && void 0 !== t[0].lastUpdateTime && (e.lastUpdateTime_customer = t[0].lastUpdateTime), void 0 !== t[1] && null !== t[1] && void 0 !== t[1].lastUpdateTime && (e.lastUpdateTime_dict = t[1].lastUpdateTime), void 0 !== t[2] && null !== t[2] && void 0 !== t[2].lastUpdateTime && (e.lastUpdateTime_product = t[2].lastUpdateTime), void 0 !== t[3] && null !== t[3] && void 0 !== t[3].lastUpdateTime && (e.lastUpdateTime_xml = t[3].lastUpdateTime), void 0 !== t[4] && null !== t[4] && void 0 !== t[4].lastUpdateTime && (e.lastUpdateTime_visitplan = t[4].lastUpdateTime), void 0 !== t[5] && null !== t[5] && void 0 !== t[5].lastUpdateTime && (e.lastUpdateTime_visitroute = t[5].lastUpdateTime), void 0 !== t[6] && null !== t[6] && void 0 !== t[6].lastUpdateTime && (e.lastUpdateTime_visitinfo = t[6].lastUpdateTime), void 0 !== t[7] && null !== t[7] && void 0 !== t[7].lastUpdateTime && (e.lastUpdateTime_order = t[7].lastUpdateTime), void 0 !== t[8] && null !== t[8] && void 0 !== t[8].lastUpdateTime && (e.lastUpdateTime_organization = t[8].lastUpdateTime), void 0 !== t[9] && null !== t[9] && 0 === t[9].flg && (e.lastUpdateTime_customer = ""), void 0 !== t[10] && null !== t[10] && 0 === t[10].flg && (e.lastUpdateTime_dict = ""), void 0 !== t[11] && null !== t[11] && 0 === t[11].flg && (e.lastUpdateTime_xml = ""), void 0 !== t[12] && null !== t[12] && 0 === t[12].flg && (e.lastUpdateTime_visitinfo = ""), void 0 !== t[13] && null !== t[13] && 0 === t[13].flg && (e.lastUpdateTime_order = ""), void 0 !== t[14] && null !== t[14] && 0 === t[14].flg && (e.lastUpdateTime_organization = ""), void 0 !== t[15] && null !== t[15] && 0 === t[15].flg && (e.lastUpdateTime_product = "")), e.log("START"), $.when(e.requestCommon(), e.requestXml(), e.requestVisitroute(), e.requestOrganization(), e.requestVisitresult(), e.requestPromotionsupply(), e.requestStatus()).done(function() {
            e.log("DOWN"), e.closeLoading()
        }).fail(function() {
            e.log("FAIL"), e.ddalert("初始化数据失败")
        })
    })
}, Init.prototype.ddalert = function(e) {
    dd.ready(function() {
        dd.device.notification.alert({
            message: e,
            title: "",
            buttonName: "确定",
            onSuccess: function() {},
            onFail: function(e) {}
        })
    })
}, Init.prototype.requestStatus = function() {
    var e = $.Deferred(),
        t = this,
        n = {
            type: "v43SyncExamineStatusService",
            deviceId: this.deviceId,
            entCode: this.v40DingEmplInfo.entCode
        };
    return t.log("status"), $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(n)
        },
        timeout: t.ajaxTimeout,
        success: function(n) {
            function o() {
                t.log("status_nuke");
                var e = $.Deferred();
                return t.dbStatus.nuke(function() {
                    t.log("status_nuke_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function r(e) {
                t.log("status_batch");
                var n = $.Deferred();
                return e.length > 0 ? t.dbStatus.batch(e, function() {
                    t.log("status_batch_callback"), n.resolve("nuke")
                }) : (t.log("status_batch_callback[0]"), n.resolve("nuke")), n.promise()
            }
            var i = null;
            try {
                i = JSON.parse(n)
            } catch (a) {
                t.log(a.message)
            }
            if (null !== i) {
                var l = i.data,
                    s = [];
                $.each(l, function(e, t) {
                    s.push(t)
                }), t.log("status_ajax_resolve_pre"), $.when(o()).then(function() {
                    return r(s)
                }).done(function() {
                    t.log("status_ajax_resolve"), e.resolve()
                })
            } else t.log("status_ajax_resolve"), e.resolve()
        },
        error: function(e, n, o) {
            t.showProgress()
        }
    }), e.promise()
}, Init.prototype.requestVisitresult = function() {
    var e = $.Deferred(),
        t = this,
        n = {
            type: "syncVisitedInfo",
            deviceId: this.deviceId,
            lastUpdateTime: ""
        };
    return t.log("visitresult"), $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(n)
        },
        timeout: t.ajaxTimeout,
        success: function(n) {
            function o() {
                t.log("visitresult_leave");
                var e, n = new Date,
                    o = $.Deferred();
                return n.setHours(0), n.setMinutes(0), n.setSeconds(0), n.setMilliseconds(0), e = n.getTime() + "", t.dbVisitresult.all(function(n) {
                    for (var r, i = 0, a = n.length; a > i; i++) r = n[i], e == r.visitdate && "1" == r.status && (s[r.visit_code] = r), this.remove(r);
                    t.log("visitresult_leave_callback"), o.resolve("leave")
                }), o.promise()
            }
            function r() {
                t.log("visitresult_batch");
                var e = $.Deferred();
                return i = a.data, $.each(i, function(e, t) {
                    $.each(t.visitList, function(e, n) {
                        var o = {
                                custcode: n.custCode,
                                custname: n.custName,
                                status: n.visitFlag.toString(),
                                istmp: n.isTemp,
                                visit_code: n.visit_code,
                                visitdate: t.date.toString()
                            },
                            r = s[o.visit_code];
                        if (r) for (var i in r) o[i] || (o[i] = r[i]);
                        l.push(o)
                    })
                }), l.length > 0 ? t.dbVisitresult.batch(l, function() {
                    t.log("visitresult_batch_callback"), e.resolve("nuke")
                }) : (t.log("visitresult_batch_callback[0]"), e.resolve("nuke")), e.promise()
            }
            var i, a = null,
                l = [],
                s = {};
            try {
                a = JSON.parse(n)
            } catch (c) {
                t.log(c.message)
            }
            null !== a ? (t.log("visitresult_ajax_resolve_pre"), $.when(o()).then(function() {
                return r()
            }).done(function() {
                t.log("visitresult_ajax_resolve"), e.resolve()
            })) : (t.log("visitresult_ajax_resolve"), e.resolve())
        },
        error: function(e, n, o) {
            t.showProgress()
        }
    }), e.promise()
}, Init.prototype.requestLayer = function() {
    var e = $.Deferred(),
        t = this,
        n = {
            type: "layersInfo",
            deviceId: this.deviceId,
            lastUpdateTime: ""
        };
    return t.log("layer"), $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        beforeSend: function(e) {
            e.setRequestHeader("OSType", "ios")
        },
        data: {
            downlinkReqStr: JSON.stringify(n)
        },
        timeout: t.ajaxTimeout,
        success: function(n) {
            function o() {
                t.log("layer_nuke");
                var e = $.Deferred();
                return t.dbLayer.nuke(function() {
                    t.log("layer_nuke_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function r(e) {
                t.log("layer_batch");
                var n = $.Deferred();
                return e.length > 0 ? t.dbLayer.batch(e, function() {
                    t.log("layer_batch_callback"), n.resolve("nuke")
                }) : (t.log("layer_batch_callback[0]"), n.resolve("nuke")), n.promise()
            }
            var i = null;
            try {
                i = JSON.parse(n)
            } catch (a) {
                t.log(a.message)
            }
            if (null !== i) {
                var l = i.data,
                    s = [];
                $.each(l, function(e, t) {
                    t.key = t.code, s.push(t)
                }), t.log("layer_ajax_resolve_pre"), $.when(o()).then(function() {
                    return r(s)
                }).done(function() {
                    t.log("layer_ajax_resolve"), e.resolve()
                })
            } else t.log("layer_ajax_resolve"), e.resolve()
        },
        error: function(e, n, o) {
            t.showProgress()
        }
    }), e.promise()
}, Init.prototype.requestPromotionsupply = function() {
    var e = $.Deferred(),
        t = this,
        n = {
            type: "suppliesV302",
            deviceId: this.deviceId,
            lastUpdateTime: ""
        };
    return t.log("promotionsupply"), $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(n)
        },
        timeout: t.ajaxTimeout,
        success: function(n) {
            function o() {
                t.log("promotionsupply_nuke");
                var e = $.Deferred();
                return t.dbPromotionsupply.nuke(function() {
                    t.log("promotionsupply_nuke_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function r(e) {
                t.log("promotionsupply_batch");
                var n = $.Deferred();
                return e.length > 0 ? t.dbPromotionsupply.batch(e, function() {
                    t.log("promotionsupply_batch_callback"), n.resolve("nuke")
                }) : (t.log("promotionsupply_batch_callback[0]"), n.resolve("nuke")), n.promise()
            }
            var i = null;
            try {
                i = JSON.parse(n)
            } catch (a) {
                t.log(a.message)
            }
            if (null !== i && "0" === i.result) {
                var l = i.data,
                    s = [];
                $.each(l, function(e, t) {
                    var n = t.actionType;
                    delete t.actionType, t.key = t.code, "1" === n ? s.push(t) : "2" === n && s.push(t)
                }), t.log("promotionsupply_ajax_resolve_pre"), $.when(o()).then(function() {
                    return r(s)
                }).done(function() {
                    t.log("promotionsupply_ajax_resolve"), e.resolve()
                })
            } else t.log("promotionsupply_ajax_resolve"), e.resolve()
        },
        error: function(e, n, o) {
            t.showProgress()
        }
    }), e.promise()
}, Init.prototype.requestDeliveryman = function() {
    var e = $.Deferred(),
        t = this,
        n = {
            type: "deliveryManV302",
            deviceId: this.deviceId,
            lastUpdateTime: ""
        };
    return t.log("deliveryman"), $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(n)
        },
        timeout: t.ajaxTimeout,
        success: function(n) {
            function o() {
                t.log("deliveryman_nuke");
                var e = $.Deferred();
                return t.dbDeliveryman.nuke(function() {
                    t.log("deliveryman_nuke_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function r(e) {
                t.log("deliveryman_batch");
                var n = $.Deferred();
                return e.length > 0 ? t.dbDeliveryman.batch(e, function() {
                    t.log("deliveryman_batch_callback"), n.resolve("nuke")
                }) : (t.log("deliveryman_batch_callback[0]"), n.resolve("nuke")), n.promise()
            }
            var i = null;
            try {
                i = JSON.parse(n)
            } catch (a) {
                t.log(a.message)
            }
            if (null !== i && "0" === i.result) {
                var l = i.data,
                    s = [];
                $.each(l, function(e, t) {
                    var n = t.actionType;
                    delete t.actionType, t.key = t.code, "1" === n ? s.push(t) : "2" === n && s.push(t)
                }), t.log("deliveryman_ajax_resolve_pre"), $.when(o()).then(function() {
                    return r(s)
                }).done(function() {
                    t.log("deliveryman_ajax_resolve"), e.resolve()
                })
            } else t.log("deliveryman_ajax_resolve"), e.resolve()
        },
        error: function(e, n, o) {
            t.showProgress()
        }
    }), e.promise()
}, Init.prototype.requestOrganization = function() {
    var e = $.Deferred(),
        t = this,
        n = {
            type: "uSyncOrganization",
            deviceId: this.deviceId,
            lastUpdateTime: this.lastUpdateTime_organization
        };
    return t.log("organization"), $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(n)
        },
        timeout: t.ajaxTimeout,
        success: function(n) {
            function o() {
                t.log("organization_config_update_flg_open");
                var e = $.Deferred(),
                    n = {};
                return n.key = t.update_completed_organization, n.flg = 0, t.dbConfig.save(n, function() {
                    t.log("organization_config_update_flg_open_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function r() {
                t.log("organization_config_update_flg_close");
                var e = $.Deferred(),
                    n = {};
                return n.key = t.update_completed_organization, n.flg = 1, t.dbConfig.save(n, function() {
                    t.log("organization_config_update_flg_close_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function i(e) {
                t.log("organization_remove");
                var n = $.Deferred();
                return e.length > 0 ? t.dbOrganization.remove(e, function() {
                    t.log("organization_remove_callback"), n.resolve("nuke")
                }) : (t.log("organization_remove_callback[0]"), n.resolve("nuke")), n.promise()
            }
            function a(e) {
                t.log("organization_batch");
                var n = $.Deferred();
                return e.length > 0 ? t.dbOrganization.batch(e, function() {
                    t.log("organization_batch_callback"), n.resolve("nuke")
                }) : (t.log("organization_batch_callback[0]"), n.resolve("nuke")), n.promise()
            }
            function l() {
                t.log("organization_config_remove");
                var e = $.Deferred();
                return t.dbConfig.remove(t.lastUpdateTime_organization_name, function() {
                    t.log("organization_config_remove_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function s() {
                t.log("organization_config_save");
                var e = $.Deferred(),
                    n = {};
                return n.key = t.lastUpdateTime_organization_name, n.lastUpdateTime = c.lastUpdateTime, t.dbConfig.save(n, function() {
                    t.log("organization_config_save_callback"), e.resolve("nuke")
                }), e.promise()
            }
            var c = null;
            try {
                c = JSON.parse(n)
            } catch (u) {
                t.log(u.message)
            }
            if (null !== c && "0" === c.result) {
                var d = c.data,
                    p = [],
                    _ = [];
                $.each(d, function(e, t) {
                    var n = t.actionType;
                    delete t.actionType, t.key = t.code, "1" === n ? p.push(t) : "2" === n ? (_.push(t.code), p.push(t)) : ("3" === n || "4" === n) && _.push(t.code)
                }), t.log("organization_ajax_resolve_pre"), $.when(o()).then(function() {
                    return i(_)
                }).then(function() {
                    return a(p)
                }).then(function() {
                    return l()
                }).then(function() {
                    return s()
                }).then(function() {
                    return r()
                }).done(function() {
                    t.log("organization_ajax_resolve"), e.resolve()
                })
            } else t.log("organization_ajax_resolve"), e.resolve()
        },
        error: function(e, n, o) {
            t.showProgress()
        }
    }), e.promise()
}, Init.prototype.requestOrder = function() {
    var e = $.Deferred(),
        t = this,
        n = {
            type: "order",
            deviceId: this.deviceId,
            lastUpdateTime: this.lastUpdateTime_order
        };
    return t.log("order"), $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        beforeSend: function(e) {
            e.setRequestHeader("OSType", "ios")
        },
        data: {
            downlinkReqStr: JSON.stringify(n)
        },
        timeout: t.ajaxTimeout,
        success: function(n) {
            function o() {
                t.log("order_config_update_flg_open");
                var e = $.Deferred(),
                    n = {};
                return n.key = t.update_completed_order, n.flg = 0, t.dbConfig.save(n, function() {
                    t.log("order_config_update_flg_open_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function r() {
                t.log("order_config_update_flg_close");
                var e = $.Deferred(),
                    n = {};
                return n.key = t.update_completed_order, n.flg = 1, t.dbConfig.save(n, function() {
                    t.log("order_config_update_flg_close_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function i(e) {
                t.log("order_remove");
                var n = $.Deferred();
                return e.length > 0 ? t.dbOrder.remove(e, function() {
                    t.log("order_remove_callback"), n.resolve("nuke")
                }) : (t.log("order_remove_callback[0]"), n.resolve("nuke")), n.promise()
            }
            function a(e) {
                t.log("order_batch");
                var n = $.Deferred();
                return e.length > 0 ? t.dbOrder.batch(e, function() {
                    t.log("order_batch_callback"), n.resolve("nuke")
                }) : (t.log("order_batch_callback[0]"), n.resolve("nuke")), n.promise()
            }
            function l() {
                t.log("order_config_remove");
                var e = $.Deferred();
                return t.dbConfig.remove(t.lastUpdateTime_order_name, function() {
                    t.log("order_config_remove_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function s() {
                t.log("order_config_save");
                var e = $.Deferred(),
                    n = {};
                return n.key = t.lastUpdateTime_order_name, n.lastUpdateTime = c.lastUpdateTime, t.dbConfig.save(n, function() {
                    t.log("order_config_save_callback"), e.resolve("nuke")
                }), e.promise()
            }
            var c = null;
            try {
                c = JSON.parse(n)
            } catch (u) {
                t.log(u.message)
            }
            if (null !== c && "0" === c.result) {
                var d = c.data,
                    p = [],
                    _ = [];
                $.each(d, function(e, t) {
                    var n = t.actionType;
                    delete t.actionType, t.key = t.code, "1" === n ? p.push(t) : "2" === n ? (_.push(t.code), p.push(t)) : ("3" === n || "4" === n) && _.push(t.code)
                }), t.log("order_ajax_resolve_pre"), $.when(o()).then(function() {
                    return i(_)
                }).then(function() {
                    return a(p)
                }).then(function() {
                    return l()
                }).then(function() {
                    return s()
                }).then(function() {
                    return r()
                }).done(function() {
                    t.log("order_ajax_resolve"), e.resolve()
                })
            } else t.log("order_ajax_resolve"), e.resolve()
        },
        error: function(e, n, o) {
            t.showProgress()
        }
    }), e.promise()
}, Init.prototype.requestVisitroute = function() {
    var e = $.Deferred(),
        t = this,
        n = {
            type: "v40SyncVisitRoute",
            deviceId: this.deviceId,
            lastUpdateTime: ""
        };
    return t.log("visitroute"), $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(n)
        },
        timeout: t.ajaxTimeout,
        success: function(n) {
            function o() {
                t.log("visitroute_ajax_nuke");
                var e = $.Deferred();
                return t.dbVisitroute.nuke(function() {
                    t.log("visitroute_ajax_nuke_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function r(e) {
                t.log("visitroute_ajax_add");
                var n = $.Deferred(),
                    o = [];
                return $.each(e, function(e, t) {
                    var n = t.actionType;
                    delete t.actionType, t.key = t.code, "1" === n ? o.push(t) : "2" === n && o.push(t)
                }), t.dbVisitroute.batch(o, function() {
                    t.log("visitroute_ajax_add_callback"), n.resolve("add")
                }), n.promise()
            }
            t.log("visitroute_ajax");
            var i = null;
            try {
                i = JSON.parse(n)
            } catch (a) {
                t.log(a.message)
            }
            if (null !== i && "0" === i.result) {
                var l = i.data;
                t.log("visitroute_ajax_resolve_pre"), $.when(o()).then(function() {
                    return r(l)
                }).done(function() {
                    t.log("visitroute_ajax_resolve_done"), e.resolve()
                }).fail(function() {
                    t.log("visitroute_ajax_resolve_fail"), e.resolve()
                })
            } else t.log("visitroute_ajax_resolve"), e.resolve()
        },
        error: function(e, n, o) {
            t.showProgress()
        }
    }), e.promise()
}, Init.prototype.requestVisitplan = function() {
    var e = $.Deferred(),
        t = this,
        n = {
            type: "v40SyncVisitPlan",
            deviceId: this.deviceId,
            lastUpdateTime: ""
        };
    return t.log("visitplan"), $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(n)
        },
        timeout: t.ajaxTimeout,
        success: function(n) {
            function o() {
                t.log("visitplan_ajax_nuke");
                var e = $.Deferred();
                return t.dbVisitplan.nuke(function() {
                    t.log("visitplan_ajax_nuke_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function r(e) {
                t.log("visitplan_ajax_add");
                var n = $.Deferred(),
                    o = [];
                return $.each(e, function(e, t) {
                    var n = t.actionType;
                    delete t.actionType, t.key = t.code, "1" === n ? o.push(t) : "2" === n && o.push(t)
                }), t.dbVisitplan.batch(o, function() {
                    t.log("visitplan_ajax_add_callback"), n.resolve("add")
                }), n.promise()
            }
            t.log("visitplan_ajax");
            var i = null;
            try {
                i = JSON.parse(n)
            } catch (a) {
                t.log(a.message)
            }
            if (null !== i && "0" === i.result) {
                var l = i.data;
                t.log("visitplan_ajax_resolve_pre"), $.when(o()).then(function() {
                    return r(l)
                }).done(function() {
                    t.log("visitplan_ajax_resolve"), e.resolve()
                })
            } else t.log("visitplan_ajax_resolve"), e.resolve()
        },
        error: function(e, n, o) {
            t.showProgress()
        }
    }), e.promise()
}, Init.prototype.requestXml = function() {
    var e = $.Deferred(),
        t = this;
    return t.log("xml"), $.ajax({
        type: "POST",
        url: this.urlapi + "mobile/download.do?deviceId=" + this.deviceId + "&lastUpdateTime=" + this.lastUpdateTime_xml,
        data: {},
        timeout: t.ajaxTimeout,
        success: function(n) {
            function o() {
                t.log("xml_parse_xml_config_update_flg_open");
                var e = $.Deferred(),
                    n = {};
                return n.key = t.update_completed_xml, n.flg = 0, t.dbConfig.save(n, function() {
                    t.log("xml_parse_xml_config_update_flg_open_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function r() {
                t.log("xml_parse_xml_config_update_flg_close");
                var e = $.Deferred(),
                    n = {};
                return n.key = t.update_completed_xml, n.flg = 1, t.dbConfig.save(n, function() {
                    t.log("xml_parse_xml_config_update_flg_close_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function i() {
                t.log("xml_ajax_save");
                var e = $.Deferred(),
                    n = {};
                n.key = u;
                var o = "";
                return "" !== s.xml && (o = s.xml), n.xml = o, "" !== o ? t.dbXml.save(n, function() {
                    t.log("xml_ajax_save_callback"), e.resolve("nuke")
                }) : (t.log("xml_ajax_save_callback_xmlnull"), e.resolve("nuke")), e.promise()
            }
            function a() {
                t.log("xml_ajax_config_remove");
                var e = $.Deferred();
                return t.dbConfig.remove(t.lastUpdateTime_xml_name, function() {
                    t.log("xml_ajax_config_remove_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function l() {
                t.log("xml_ajax_config_save");
                var e = $.Deferred(),
                    n = {};
                return n.key = t.lastUpdateTime_xml_name, n.lastUpdateTime = s.lastUpdateTime, t.dbConfig.save(n, function() {
                    t.log("xml_ajax_config_save_callback"), e.resolve("nuke")
                }), e.promise()
            }
            t.log("xml_ajax");
            var s = null;
            try {
                s = JSON.parse(n)
            } catch (c) {
                t.log(c.message)
            }
            if (null !== s) {
                var u = "xml";
                t.log("xml_ajax_resolve_pre"), $.when(o()).then(function() {
                    return i()
                }).then(function() {
                    return a()
                }).then(function() {
                    return l()
                }).then(function() {
                    return r()
                }).done(function() {
                    t.log("xml_ajax_resolve"), e.resolve()
                })
            } else t.log("xml_ajax_resolve"), e.resolve()
        },
        error: function(e, n, o) {
            t.showProgress()
        }
    }), e.promise()
}, Init.prototype.requestVisitinfo = function() {
    var e = $.Deferred(),
        t = this;
    console.log("update 时间" + this.lastUpdateTime_visitinfo + "!");
    var n = {
        type: "visitInfo",
        deviceId: this.deviceId,
        lastUpdateTime: this.lastUpdateTime_visitinfo
    };
    return t.log("visitinfo"), $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(n)
        },
        timeout: t.ajaxTimeout,
        success: function(n) {
            function o() {
                t.log("visitinfo_config_update_flg_open");
                var e = $.Deferred(),
                    n = {};
                return n.key = t.update_completed_visitinfo, n.flg = 0, t.dbConfig.save(n, function() {
                    t.log("visitinfo_config_update_flg_open_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function r() {
                t.log("visitinfo_config_update_flg_close");
                var e = $.Deferred(),
                    n = {};
                return n.key = t.update_completed_visitinfo, n.flg = 1, t.dbConfig.save(n, function() {
                    t.log("visitinfo_config_update_flg_close_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function i(e) {
                t.log("visitinfo_remove");
                var n = $.Deferred();
                return e.length > 0 ? t.dbVisitinfo.remove(e, function() {
                    t.log("visitinfo_remove_callback"), n.resolve("nuke")
                }) : (t.log("visitinfo_remove_callback[0]"), n.resolve("nuke")), n.promise()
            }
            function a(e) {
                t.log("visitinfo_batch");
                var n = $.Deferred();
                return e.length > 0 ? t.dbVisitinfo.batch(e, function() {
                    t.log("visitinfo_batch_callback"), n.resolve("nuke")
                }) : (t.log("visitinfo_batch_callback[0]"), n.resolve("nuke")), n.promise()
            }
            function l() {
                t.log("visitinfo_config_remove");
                var e = $.Deferred();
                return t.dbConfig.remove(t.lastUpdateTime_visitinfo_name, function() {
                    t.log("visitinfo_config_remove_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function s() {
                t.log("visitinfo_config_save");
                var e = $.Deferred(),
                    n = {};
                return n.key = t.lastUpdateTime_visitinfo_name, n.lastUpdateTime = c.lastUpdateTime, t.dbConfig.save(n, function() {
                    t.log("visitinfo_config_save_callback"), e.resolve("nuke")
                }), e.promise()
            }
            console.log("接口返回的最近信息数据"), console.log(n), t.log("visitinfo_ajax");
            var c = null;
            try {
                c = JSON.parse(n)
            } catch (u) {
                t.log(u.message)
            }
            if (null !== c && "0" === c.result) {
                var d = c.data,
                    p = [],
                    _ = [];
                $.each(d, function(e, t) {
                    var n = t.actionType;
                    delete t.actionType, t.key = t.code, "1" === n ? p.push(t) : "2" === n ? (_.push(t.code), p.push(t)) : ("3" === n || "4" === n) && _.push(t.code)
                }), t.log("visitinfo_ajax_resolve_pre"), $.when(o()).then(function() {
                    return i(_)
                }).then(function() {
                    return a(p)
                }).then(function() {
                    return l()
                }).then(function() {
                    return s()
                }).then(function() {
                    return r()
                }).done(function() {
                    t.log("visitinfo_ajax_resolve"), e.resolve()
                })
            } else t.log("visitinfo_ajax_resolve"), e.resolve()
        },
        error: function(e, n, o) {
            t.showProgress()
        }
    }), e.promise()
}, Init.prototype.requestCustomer = function() {
    var e = $.Deferred(),
        t = this,
        n = {
            type: "customerV40",
            deviceId: this.deviceId,
            pageSize: 4e3,
            lastUpdateTime: this.lastUpdateTime_customer
        };
    return t.log("customer"), $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(n)
        },
        timeout: t.ajaxTimeout,
        success: function(n) {
            function o() {
                t.log("customer_config_update_flg_open");
                var e = $.Deferred(),
                    n = {};
                return n.key = t.update_completed_customer, n.flg = 0, t.dbConfig.save(n, function() {
                    t.log("customer_config_update_flg_open_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function r() {
                t.log("customer_config_update_flg_close");
                var e = $.Deferred(),
                    n = {};
                return n.key = t.update_completed_customer, n.flg = 1, t.dbConfig.save(n, function() {
                    t.log("customer_config_update_flg_close_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function i(e) {
                t.log("customer_remove");
                var n = $.Deferred();
                return e.length > 0 ? t.dbCustomer.remove(e, function() {
                    t.log("customer_remove_callback"), n.resolve("nuke")
                }) : (t.log("customer_remove_callback[0]"), n.resolve("nuke")), n.promise()
            }
            function a(e) {
                t.log("customer_batch");
                var n = $.Deferred();
                return t.dbCustomer.batch(e, function() {
                    t.log("customer_batch_callback"), n.resolve("nuke")
                }), n.promise()
            }
            function l() {
                t.log("customer_config_remove");
                var e = $.Deferred();
                return t.dbConfig.remove(t.lastUpdateTime_customer_name, function() {
                    t.log("customer_config_remove_callback"), e.resolve("nuke")
                }), e.promise()
            }
            function s() {
                t.log("customer_config_save");
                var e = $.Deferred(),
                    n = {};
                return n.key = t.lastUpdateTime_customer_name, n.lastUpdateTime = c.lastUpdateTime, t.dbConfig.save(n, function() {
                    t.log("customer_config_save_callback"), e.resolve("nuke")
                }), e.promise()
            }
            t.log("customer_ajax");
            var c = null;
            try {
                c = JSON.parse(n)
            } catch (u) {
                t.log(u.message)
            }
            if (null !== c && "0" === c.result) {
                var d = c.data,
                    p = [],
                    _ = [];
                $.each(d, function(e, t) {
                    var n = t.actionType;
                    delete t.actionType, t.key = t.code, "1" === n ? p.push(t) : "2" === n ? (_.push(t.code), p.push(t)) : ("3" === n || "4" === n) && _.push(t.code)
                }), t.log("customer_resolve_pre"), $.when(o()).then(function() {
                    return i(_)
                }).then(function() {
                    return a(p)
                }).then(function() {
                    return l()
                }).then(function() {
                    return s()
                }).then(function() {
                    return r()
                }).done(function() {
                    t.log("customer_resolve_done"), e.resolve()
                }).fail(function() {
                    t.log("customer_resolve_fail"), e.resolve()
                })
            } else t.log("customer_ajax_resolve"), e.resolve()
        },
        error: function(e, n, o) {
            t.showProgress()
        }
    }), e.promise()
}, Init.prototype.requestCommon = function() {
    var e = $.Deferred(),
        t = this,
        n = {
            dictionary: this.lastUpdateTime_dict,
            productV302: this.lastUpdateTime_product
        },
        o = {
            type: "initial",
            deviceId: this.deviceId,
            lastUpdateTime: JSON.stringify(n)
        };
    return t.log("common"), $.ajax({
        type: "POST",
        url: this.urlapi + "downlinkdata/downlink.do",
        data: {
            downlinkReqStr: JSON.stringify(o)
        },
        timeout: t.ajaxTimeout,
        success: function(n) {
            t.log("common_ajax");
            var o = null;
            try {
                o = JSON.parse(n)
            } catch (r) {
                t.log(r.message)
            }
            if (null !== o) {
                t.log("common_ajax_resolve_pre");
                var i = JSON.parse(o.dictionary),
                    a = JSON.parse(o.productV302);
                $.when(t.parseDict(i)).then(function() {
                    return t.parseProduct(a)
                }).done(function() {
                    t.log("common_ajax_resolve_done"), e.resolve()
                }).fail(function() {
                    t.log("common_ajax_resolve_fail"), e.resolve()
                })
            } else t.log("common_ajax_resolve"), e.resolve()
        },
        error: function(e, n, o) {
            t.showProgress()
        }
    }), e.promise()
}, Init.prototype.parseDict = function(e) {
    function t() {
        l.log("parse_dict_config_update_flg_open");
        var e = $.Deferred(),
            t = {};
        return t.key = l.update_completed_dict, t.flg = 0, l.dbConfig.save(t, function() {
            l.log("parse_dict_config_update_flg_open_callback"), e.resolve("nuke")
        }), e.promise()
    }
    function n() {
        l.log("parse_dict_config_update_flg_close");
        var e = $.Deferred(),
            t = {};
        return t.key = l.update_completed_dict, t.flg = 1, l.dbConfig.save(t, function() {
            l.log("parse_dict_config_update_flg_close_callback"), e.resolve("nuke")
        }), e.promise()
    }
    function o(e) {
        l.log("parse_dict_remove");
        var t = $.Deferred();
        return e.length > 0 ? l.dbDict.remove(e, function() {
            l.log("parse_dict_remove_callback"), t.resolve("nuke")
        }) : (l.log("parse_dict_remove_callback[0]"), t.resolve("nuke")), t.promise()
    }
    function r(e) {
        l.log("parse_dict_batch");
        var t = $.Deferred();
        return l.dbDict.batch(e, function() {
            l.log("parse_dict_batch_callback"), t.resolve("nuke")
        }), t.promise()
    }
    function i() {
        l.log("parse_dict_config_remove");
        var e = $.Deferred();
        return l.dbConfig.remove(l.lastUpdateTime_dict_name, function() {
            l.log("parse_dict_config_remove_callback"), e.resolve("nuke")
        }), e.promise()
    }
    function a() {
        l.log("parse_dict_config_save");
        var t = $.Deferred(),
            n = {};
        return n.key = l.lastUpdateTime_dict_name, n.lastUpdateTime = e.lastUpdateTime, l.dbConfig.save(n, function() {
            l.log("parse_dict_config_save_callback"), t.resolve("nuke")
        }), t.promise()
    }
    var l = this,
        s = $.Deferred();
    l.log("parse_dict");
    var l = this;
    if ("0" === e.result) {
        var c = e.data,
            u = [],
            d = [];
        $.each(c, function(e, t) {
            var n = t.actionType;
            delete t.actionType, t.key = t.code, "1" === n ? u.push(t) : "2" === n ? (d.push(t.code), u.push(t)) : ("3" === n || "4" === n) && d.push(t.code)
        }), l.log("parse_dict_resolve_pre"), $.when(t()).then(function() {
            return o(d)
        }).then(function() {
            return r(u)
        }).then(function() {
            return i()
        }).then(function() {
            return a()
        }).then(function() {
            return n()
        }).done(function() {
            l.log("parse_dict_resolve_done"), s.resolve()
        }).fail(function() {
            l.log("parse_dict_resolve_fail"), s.resolve()
        })
    } else l.log("parse_dict_resolve"), s.resolve();
    return s.promise()
}, Init.prototype.parseProduct = function(e) {
    function t() {
        s.log("parse_product_config_update_flg_open");
        var e = $.Deferred(),
            t = {};
        return t.key = s.update_completed_product, t.flg = 0, s.dbConfig.save(t, function() {
            s.log("parse_product_config_update_flg_open_callback"), e.resolve("nuke")
        }), e.promise()
    }
    function n() {
        s.log("parse_product_config_update_flg_close");
        var e = $.Deferred(),
            t = {};
        return t.key = s.update_completed_product, t.flg = 1, s.dbConfig.save(t, function() {
            s.log("parse_product_config_update_flg_close_callback"), e.resolve("nuke")
        }), e.promise()
    }
    function o(e) {
        s.log("parse_product_remove");
        var t = $.Deferred();
        return e.length > 0 ? s.dbProduct.remove(e, function() {
            s.log("parse_product_remove_callback"), t.resolve("nuke")
        }) : (s.log("parse_product_remove_callback[0]"), t.resolve("nuke")), t.promise()
    }
    function r(e) {
        s.log("parse_product_batch");
        var t = $.Deferred();
        return s.dbProduct.batch(e, function() {
            s.log("parse_product_batch_callback"), t.resolve("nuke")
        }), t.promise()
    }
    function i() {
        s.log("parse_product_config_remove");
        var e = $.Deferred();
        return s.dbConfig.remove(s.lastUpdateTime_product_name, function() {
            s.log("parse_product_config_remove_callback"), e.resolve("nuke")
        }), e.promise()
    }
    function a() {
        s.log("parse_product_config_save");
        var t = $.Deferred(),
            n = {};
        return n.key = s.lastUpdateTime_product_name, n.lastUpdateTime = e.lastUpdateTime, s.dbConfig.save(n, function() {
            s.log("parse_product_config_save_callback"), t.resolve("nuke")
        }), t.promise()
    }
    var l = $.Deferred(),
        s = this;
    if (s.log("parse_product"), "0" === e.result) {
        var c = e.data,
            u = [],
            d = [];
        $.each(c, function(e, t) {
            var n = t.actionType;
            delete t.actionType, t.key = t.code, "1" === n ? u.push(t) : "2" === n ? (d.push(t.code), u.push(t)) : ("3" === n || "4" === n) && d.push(t.code)
        }), s.log("parse_product_resolve_pre"), $.when(t()).then(function() {
            return o(d)
        }).then(function() {
            return r(u)
        }).then(function() {
            return i()
        }).then(function() {
            return a()
        }).then(function() {
            return n()
        }).done(function() {
            s.log("parse_product_resolve_done"), l.resolve()
        }).fail(function() {
            s.log("parse_product_resolve_fail"), l.resolve()
        })
    } else s.log("parse_product_resolve"), l.resolve();
    return l.promise()
};

function Login(o, n, i, t) {
    this.corpId = o, this.baseUrl = n, this.apiUrl = i, this.loadingTimer = null, this.callback = t, this.check()
}
Login.prototype.check = function() {
    history.length > 1 ? this.callback() : this.getCode()
}, Login.prototype.getCode = function() {
    var o = this;
    dd.ready(function() {
        dd.runtime.permission.requestAuthCode({
            corpId: o.corpId,
            onSuccess: function(n) {
                o.getUser(n.code)
            },
            onFail: function(n) {
                o.ddalert("您目前无权限查看该内容。", function() {
                    o.ddclose()
                })
            }
        })
    })
}, Login.prototype.getUser = function(o) {
    var n = this;
    n.showLoading("更新中.."), $.ajax({
        type: "POST",
        url: n.baseUrl + "login.php",
        data: {
            corpId: n.corpId,
            code: o
        },
        success: function(o) {
            var i = null;
            try {
                i = JSON.parse(o)
            } catch (t) {
                console.log(t.message)
            }
            null !== i && i.hasOwnProperty("errcode") ? 0 === i.errcode ? n.initData(i.deviceId, i.authToken, i.v40DingEmplInfo) : n.hideLoading(function() {
                n.ddalert(i.errmsg, function() {
                    n.ddclose()
                })
            }) : n.hideLoading(function() {
                n.ddalert("登录失败", function() {
                    n.ddclose()
                })
            })
        },
        error: function(o, i, t) {
            n.ddalert("网络异常", function() {
                n.ddclose()
            })
        }
    })
}, Login.prototype.setLoadingTimer = function() {
    var o = this,
        n = 2e4;
    try {
        void 0 !== window.loadingLimit && (n = window.loadingLimit)
    } catch (i) {}
    o.loadingTimer = window.setTimeout(function() {
        o.hideLoading(function() {
            dd.device.notification.confirm({
                message: "请重试",
                title: "加载超时",
                buttonLabels: ["关闭", "重试"],
                onSuccess: function(n) {
                    1 === n.buttonIndex ? (window.localStorage.clear(), window.location.reload()) : 0 === n.buttonIndex && o.ddclose()
                },
                onFail: function(o) {}
            })
        })
    }, n)
}, Login.prototype.initData = function(o, n, i) {
    var t = this;
    t.setLoadingTimer(), init = new Init(Store.authUrl(t.apiUrl), o, n, i, function() {
        window.clearTimeout(t.loadingTimer), t.hideLoading(function() {
            t.callback()
        })
    })
}, Login.prototype.ddclose = function() {
    dd.ready(function() {
        dd.biz.navigation.close({
            onSuccess: function(o) {},
            onFail: function(o) {}
        })
    })
}, Login.prototype.ddalert = function(o, n) {
    dd.ready(function() {
        dd.device.notification.alert({
            message: o,
            title: "",
            buttonName: "确定",
            onSuccess: function() {
                n()
            },
            onFail: function(o) {}
        })
    })
}, Login.prototype.showLoading = function(o) {
    dd.ready(function() {
        dd.device.notification.showPreloader({
            text: o,
            showIcon: !0,
            onSuccess: function(o) {},
            onFail: function(o) {}
        })
    })
}, Login.prototype.hideLoading = function(o) {
    dd.device.notification.hidePreloader({
        onSuccess: function(n) {
            o()
        },
        onFail: function(o) {}
    })
};

function closeBack(e) {
    dd.compareVersion("2.5.0", dd.version) && openWindow && e ? dd.biz.navigation.close({
        onSuccess: function(e) {},
        onFail: function(e) {}
    }) : window.history.back()
}
function getUrlParam(e) {
    var n = window.location.href,
        t = n.split("#");
    n = t[0];
    for (var o = n.indexOf("?"), i = n.slice(o + 1).split("&"), a = 0; a < i.length; a++) {
        var r = i[a].split("=");
        if (r[0].trim() == e) return decodeURIComponent(r[1]).trim()
    }
}
function getCookie(e) {
    var n, t = new RegExp("(^| )" + e + "=([^;]*)(;|$)");
    return (n = document.cookie.match(t)) ? unescape(n[2]) : null
}
function openLink(e, n) {
    var t = window.location.href.indexOf("dd_nav_bgcolor") > -1 ? getUrlParam("dd_nav_bgcolor") : "ffe15151";
    e += e.indexOf("?") > -1 ? "&dd_nav_bgcolor=" + t : "?dd_nav_bgcolor=" + t, openWindow || n ? dd.biz.util.openLink({
        url: e,
        onSuccess: function() {},
        onFail: function(e) {}
    }) : window.location.href = e
}

function formatTimeRule(e) {
    var n = new Date,
        t = new Date(1e3 * parseInt(e / 1e3)),
        o = n.getTime(),
        i = getToday(0),
        a = i - 864e5,
        r = n.getDay(),
        c = i - 864e5 * r,
        d = o - e;
    if (6e4 >= d) return "刚刚";
    if (36e5 >= d) {
        var l = parseInt(d / 6e4);
        return l + "分钟前"
    }
    if (e > i) {
        var s = t.getHours(),
            u = t.getMinutes();
        return (10 > s ? "0" + s : s) + ":" + (10 > u ? "0" + u : u)
    }
    if (e > a) return "昨天";
    if (e > c) {
        var f = t.getDay(),
            m = ["日", "一", "二", "三", "四", "五", "六"];
        return "星期" + m[f]
    }
    var h = t.getFullYear(),
        p = t.getMonth() + 1,
        v = t.getDate();
    return h + "/" + p + "/" + v
}
function getToday(e) {
    var n = new Date,
        t = n.getFullYear(),
        o = n.getMonth() + 1,
        i = n.getDate(),
        a = t + "-" + (10 > o ? "0" + o : o) + "-" + (10 > i ? "0" + i : i);
    if (e) return a;
    var i = new Date(a);
    return i.getTime()
}
function formatStamp(e, n) {
    var t = new Date(1e3 * parseInt(e / 1e3)),
        o = t.getFullYear(),
        i = t.getMonth() + 1,
        a = t.getDate();
    return n ? o + "年" + (10 > i ? "0" + i : i) + "月" + (10 > a ? "0" + a : a) + "日" : o + "-" + (10 > i ? "0" + i : i) + "-" + (10 > a ? "0" + a : a)
}
function formatStampTime(e) {
    var n = new Date(1e3 * parseInt(e / 1e3)),
        t = n.getHours(),
        o = n.getMinutes(),
        i = n.getMonth() + 1,
        a = n.getDate();
    return (10 > i ? "0" + i : i) + "月" + (10 > a ? "0" + a : a) + "日 " + (10 > t ? "0" + t : t) + ":" + (10 > o ? "0" + o : o)
}
function formatTimeW(e) {
    var n = new Date(1e3 * parseInt(e / 1e3)),
        t = n.getDay(),
        o = ["日", "一", "二", "三", "四", "五", "六"];
    return "星期" + o[t]
}
function stopEventBubble(e) {
    var n = e || window.event;
    n && n.stopPropagation ? n.stopPropagation() : n.cancelBubble = !0
}
function replaceImageUrl(e) {
    var n = "http://images.sosgps.com.cn/",
        t = "http://images.hecom.cn/",
        o = "https://images.hecom.cn/",
        i = e;
    return -1 !== e.indexOf(n) ? i = e.replace(n, o) : -1 !== e.indexOf(t) && (i = e.replace(t, o)), i
}
function setNavTitle(e) {
    dd.ready(function() {
        dd.biz.navigation.setTitle({
            title: e,
            onSuccess: function(e) {},
            onFail: function(e) {}
        })
    })
}
function titleHelp(e, n) {
    var t = "HecomBasicHelpId" + n,
        o = e + "?" + n;
    dd.ready(function() {
        dd.device.base.getUUID({
            onSuccess: function(e) {
                var n = e.uuid;
                dd.util.localStorage.getItem({
                    name: t,
                    onSuccess: function(e) {
                        if (e.value === n) {
                            var i = 1;
                            setHelpIcon(i, o)
                        } else {
                            var i = 2;
                            dd.util.localStorage.setItem({
                                name: t,
                                value: n,
                                onSuccess: function(e) {
                                    setHelpIcon(i, o)
                                },
                                onFail: function(e) {}
                            })
                        }
                    },
                    onFail: function(e) {}
                })
            },
            onFail: function(e) {}
        })
    })
}
function setHelpIcon(e, n) {
    dd.ready(function() {
        dd.biz.navigation.setIcon({
            iconIndex: e,
            showIcon: !0,
            onSuccess: function(e) {
                openUrl(n)
            },
            onFail: function(e) {}
        })
    })
}
function hideHelpIcon() {
    dd.ready(function() {
        dd.biz.navigation.setIcon({
            iconIndex: 1,
            showIcon: !1,
            onSuccess: function(e) {},
            onFail: function(e) {}
        })
    })
}
function openUrl(e) {
    dd.ready(function() {
        dd.biz.util.openLink({
            url: e,
            enableShare: !0,
            onSuccess: function(e) {},
            onFail: function(e) {}
        })
    })
}
function formatHref(e) {
    var n = window.location.protocol,
        t = window.location.host,
        o = n + t,
        i = e;
    return -1 === e.indexOf("http") && (i = o + e), i
}
function backResume(e) {
    dd.ready(function() {
        document.addEventListener("resume", function(n) {
            e(), n.preventDefault()
        }, !1)
    })
}
function firstShowModal(e, n, t, o) {
    dd.ready(function() {
        dd.device.notification.modal && dd.device.notification.modal({
            image: e,
            banner: [e],
            title: n,
            content: t,
            buttonLabels: ["开始使用", "了解更多"],
            onSuccess: function(e) {
                0 === e.buttonIndex || 1 === e.buttonIndex && openLink(o, !0)
            },
            onFail: function(e) {}
        })
    })
}
function checkFirstShowModal(e, n, t, o, i) {
    var a = "HecomBasicFirstModal" + e;
    dd.ready(function() {
        dd.device.base.getUUID({
            onSuccess: function(e) {
                var r = e.uuid;
                dd.util.localStorage.getItem({
                    name: a,
                    onSuccess: function(e) {
                        e.value !== r && dd.util.localStorage.setItem({
                            name: a,
                            value: r,
                            onSuccess: function(e) {
                                firstShowModal(n, t, o, i)
                            },
                            onFail: function(e) {}
                        })
                    },
                    onFail: function(e) {}
                })
            },
            onFail: function(e) {}
        })
    })
}
var deviceId = "",
    corpId = "",
    entCode = "",
    agentId = "",
    isAdmin = 0,
    isOwner = 0,
    baseData = null;
try {
    baseData = JSON.parse(getCookie("HecomDDSenior"))
} catch (e) {
    console.log(e.message)
}
null !== baseData && (void 0 !== baseData.deviceId && (deviceId = baseData.deviceId), void 0 !== baseData.corpId && (corpId = baseData.corpId), void 0 !== baseData.v40DingEmplInfo.entCode && (entCode = baseData.v40DingEmplInfo.entCode), void 0 !== baseData.agentIds.agent_id_hqyx && (agentId = baseData.agentIds.agent_id_hqyx), void 0 !== baseData.isAdmin && (isAdmin = baseData.isAdmin), void 0 !== baseData.isOwner && (isOwner = baseData.isOwner));
var server = window.location.href;
dd.ready(function() {
    dd.ios && dd.ui.webViewBounce.disable(), dd.biz.navigation.setRight({
        show: !1,
        control: !1,
        showIcon: !1,
        text: "",
        onSuccess: function(e) {},
        onFail: function(e) {}
    })
});
var openWindow = !1,
    footers = [{
        name: "报表",
        href: "report.html",
        icon: "smb_report_normal"
    }, {
        name: "客户",
        href: "customerList.html",
        icon: "smb_customer_normal"
    }, {
        name: "拜访",
        href: "visit.html",
        icon: "smb_visit_normal"
    }, {
        name: "工作",
        href: "work.html",
        icon: "smb_work_normal"
    }, {
        name: "我的",
        href: "myHome.html",
        icon: "smb_myhome_normal"
    }],
    vacation = [{
        key: "事假",
        value: "1"
    }, {
        key: "病假",
        value: "2"
    }, {
        key: "年假",
        value: "3"
    }, {
        key: "调休",
        value: "4"
    }, {
        key: "婚假",
        value: "5"
    }, {
        key: "产假",
        value: "6"
    }, {
        key: "陪产假",
        value: "7"
    }, {
        key: "路途假",
        value: "8"
    }, {
        key: "其它",
        value: "9"
    }],
    helpUrl = "http://s.dingtalk.com/market/dingtalk/dingtalkhq.php";
window.location.href.indexOf("customerList.html") > -1 ? (titleHelp(helpUrl, "mod=kh"), checkFirstShowModal("kh", staticUrl + "img/firstmodal/kh.png", "客户信息", "客户详细资料的深入分析，客户信息全局掌握。", helpUrl + "?mod=kh")) : window.location.href.indexOf("customerInfo.html") > -1 ? titleHelp(helpUrl, "mod=khxq") : window.location.href.indexOf("report.html") > -1 ? (titleHelp(helpUrl, "mod=bb"), checkFirstShowModal("bb", staticUrl + "img/firstmodal/bb.png", "报表", "多维度数据挖掘、拆解与分析;数据可视化帮助管理者动态决策", helpUrl + "?mod=bb")) : window.location.href.indexOf("visit.html") > -1 ? (titleHelp(helpUrl, "mod=bf"), checkFirstShowModal("bf", staticUrl + "img/firstmodal/bf.png", "拜访日程", "计划、组织、控制。明确工作目标,提升企业的整体执行力。", helpUrl + "?mod=bf")) : hideHelpIcon(), dd.ready(function() {
    dd.android || (document.addEventListener("resume", function(e) {
        window.location.href.indexOf("customerList.html") > -1 ? titleHelp(helpUrl, "mod=kh") : window.location.href.indexOf("customerInfo.html") > -1 ? titleHelp(helpUrl, "mod=khxq") : window.location.href.indexOf("report.html") > -1 ? titleHelp(helpUrl, "mod=bb") : window.location.href.indexOf("visit.html") > -1 && titleHelp(helpUrl, "mod=bf"), e.preventDefault()
    }, !1), dd.ui.webViewBounce.disable())
});

function FT() {
    this.jsability = null, this.ftCookieName = "HEcomFtBasicCookie", this.ftCookieVal = null, this.userCookieName = "HecomDDSenior", this.isAdmin = 0, this.deviceId = "", this.agentId_hqyx = "", this.authToken = "", this.corpId = "", this.callback = null, this.step = null, this.siteUrl = null, this.baseUrl = null, this.apiUrl = null, this.staticUrl = null, this.initFtCookie(), this.initIsAdmin(), this.checkJsAbility()
}
FT.prototype.initCookie = function() {
    var t = this,
        i = getUrlParam("ft");
    void 0 !== i && null !== i && "" !== i ? t.setCookie(t.ftCookieName, i, 1) : t.clearCookie(t.ftCookieName), t.initFtCookie()
}, FT.prototype.checkJsAbility = function() {
    var t = this;
    dd.ready(function() {
        dd.runtime.info({
            onSuccess: function(i) {
                t.jsability = i.ability
            },
            onFail: function(t) {}
        })
    })
}, FT.prototype.initFtCookie = function() {
    var t = this,
        i = t.getCookie(t.ftCookieName);
    t.ftCookieVal = i
}, FT.prototype.initIsAdmin = function() {
    var t = this,
        i = t.getCookie(t.userCookieName),
        e = null;
    if (null !== i && "" !== i) try {
        e = JSON.parse(i)
    } catch (n) {
        console.log(n.message)
    }
    null !== e && (void 0 !== e.isAdmin && (t.isAdmin = e.isAdmin), void 0 !== e.deviceId && (t.deviceId = e.deviceId), void 0 !== e.authToken && (t.authToken = e.authToken), void 0 !== e.corpId && (t.corpId = e.corpId), void 0 !== e.agentIds && void 0 !== e.agentIds.agent_id_hqyx && (t.agentId_hqyx = e.agentIds.agent_id_hqyx))
}, FT.prototype.getCookie = function(t) {
    var i, e = new RegExp("(^| )" + t + "=([^;]*)(;|$)");
    return (i = document.cookie.match(e)) ? unescape(i[2]) : null
}, FT.prototype.setCookie = function(t, i, e) {
    if (e) {
        var n = new Date;
        n.setTime(n.getTime() + 24 * e * 60 * 60 * 1e3);
        var o = "; expires=" + n.toGMTString()
    } else var o = "";
    document.cookie = t + "=" + i + o + "; path=/"
}, FT.prototype.clearCookie = function(t) {
    var i = this;
    i.setCookie(t, "", -1)
}, FT.prototype.getStepInfo = function(t) {
    var i = this,
        e = "",
        n = "",
        o = "",
        s = "",
        a = "",
        l = null,
        c = null;
    switch (t) {
        case "customeradd":
            e = i.staticUrl + "img/ft/customeradd.png", n = "还有3步完成实战演练", o = "下一步将带您体验客户拜访工作，拜访内容可为您量身定制", i.isAdmin && (n = "还有4步完成实战演练", o = "下一步将带您体验客户拜访工作，拜访内容可为您量身定制"), s = "稍后再说", l = function() {
                openLink(i.siteUrl + "myHome.html")
            }, a = "实战拜访客户", c = function() {
                openLink(i.siteUrl + "customerList.html?ft=visitcustomer")
            };
            break;
        case "visitcustomer":
            e = i.staticUrl + "img/ft/visitcustomer.png", n = "还有2步完成实战演练", o = "下面把客户加入拜访计划中，拜访有效率，老板看得到", i.isAdmin && (n = "还有3步完成实战演练", o = "下面把客户加入拜访计划中，拜访有效率，老板看得到"), s = "稍后再说", l = function() {
                openLink(i.siteUrl + "myHome.html")
            }, a = "实战拜访计划", c = function() {
                openLink(i.siteUrl + "visit.html?ft=addvisitplan")
            };
            break;
        case "addvisitplan":
            e = i.staticUrl + "img/ft/addvisitplan.png", n = "还有1步完成实战演练", o = "下一步查阅数据报表，帮你快速决策", i.isAdmin && (n = "还有2步完成实战演练", o = "下一步查阅数据报表，帮你快速决策"), s = "稍后再说", l = function() {
                openLink(i.siteUrl + "myHome.html")
            }, a = "实战数据报表", c = function() {
                openLink(i.siteUrl + "report.html?ft=datadecision")
            };
            break;
        case "datadecision":
            e = i.staticUrl + "img/ft/datadecision.png", n = "　", o = "棒棒哒！已完成实战演练", i.isAdmin && (n = "还有1步完成实战演练", o = "用红圈让业绩飞起来，邀请同事一起体验吧！"), s = "稍后再说", l = function() {
                openLink(i.siteUrl + "myHome.html")
            }, a = "邀请同事体验", c = function() {
                i.inviteStaff()
            }, i.isAdmin || (s = "完成", a = "", c = null)
    }
    return {
        imgUrl: e,
        title: n,
        content: o,
        firstBtnStr: s,
        secondBtnStr: a,
        firstBtnEvt: l,
        secondBtnEvt: c
    }
}, FT.prototype.inviteStaff = function() {
    var t = this,
        i = t.baseUrl + "saveinvite.html?userIds=$EMPLlIDS$",
        e = "https://app.dingtalk.com/microtryout/invite.html?corpId=" + t.corpId;
    e += "&agentId=" + t.agentId_hqyx, e += "&callbackUrl=" + encodeURIComponent(i), openLink(e)
}, FT.prototype.showModal = function(t) {
    var i = this,
        e = i.getStepInfo(t),
        n = [e.firstBtnStr, e.secondBtnStr];
    "" === e.secondBtnStr && (n = [e.firstBtnStr]), dd.ready(function() {
        function t() {
            dd.device.notification.alert({
                message: "实战演练需要您升级到钉钉最新版本。",
                title: "提示",
                buttonName: "我知道了",
                onSuccess: function() {},
                onFail: function(t) {}
            })
        }
        return i.jsability && dd.compareVersion(i.jsability, "0.0.8") ? (setTimeout(t, 1e3), !1) : void dd.device.notification.modal({
            image: e.imgUrl,
            banner: [e.imgUrl],
            title: e.title,
            content: e.content,
            buttonLabels: n,
            onSuccess: function(t) {
                1 === n.length ? 0 === t.buttonIndex && e.firstBtnEvt() : 2 === n.length && (0 === t.buttonIndex ? e.firstBtnEvt() : 1 === t.buttonIndex && e.secondBtnEvt())
            },
            onFail: function(t) {}
        })
    })
}, FT.prototype.popup = function(t, i, e, n, o, s) {
    var a = this;
    a.step = t, a.siteUrl = i, a.baseUrl = e, a.apiUrl = n, a.staticUrl = o, a.callback = s, null === a.ftCookieVal || "" === a.ftCookieVal ? null !== a.callback && a.callback() : (a.setCookie(a.ftCookieName, "", -1), a.showModal(t))
};
var FT = new FT;
"use strict";
var GuideTips = {
    divW: 158,
    defaultH: 10,
    LineH: 30,
    ArrowH: 5,
    TipsH: 79,
    TipsHDown: 34,
    TipsHStep: 55,
    x: 0,
    y: 0,
    element: 0,
    w: 0,
    h: 0,
    power: 1,
    step: 0,
    maxstep: 0,
    getPageArea: function() {
        return {
            w: $(window).width(),
            h: $(window).height()
        }
    },
    pageLeft: function() {
        for (var i = GuideTips.element, e = i.offsetLeft, s = i.offsetParent; null !== s;) e += s.offsetLeft, s = s.offsetParent;
        return e
    },
    pageTop: function() {
        for (var i = GuideTips.element, e = i.offsetTop, s = i.offsetParent; null !== s;) e += s.offsetTop, s = s.offsetParent;
        return e + i.offsetHeight + GuideTips.defaultH
    },
    createCenterTipsDiv: function(i) {
        var e = "undefined" == typeof i.pos || "" == i.pos ? "left" : i.pos,
            s = parseInt(1e3 * Math.random(), 10) + 1,
            p = "<span onclick='javascript:GuideTips.closeTips(this);' id='_msg_" + s + "' class='_GuideTipsRemove_'>",
            o = "</span>",
            t = "",
            d = "<h5 style='text-align:right;'><a href='javascript:GuideTips.closeMsg(" + s + ");' style='color:#FFF;'>我知道了</a></h5>",
            n = {
                Tips: {
                    pos1: {
                        position: "top",
                        num: GuideTips.y + GuideTips.LineH
                    },
                    pos2: {
                        position: e,
                        num: GuideTips.x
                    }
                }
            },
            u = p + "<div class='ui-whitespace' style='background:#5BB9E2;border-radius: 6px;z-index:999999999;position:absolute;" + n.Tips.pos1.position + ":" + n.Tips.pos1.num + "px;" + n.Tips.pos2.position + ":" + n.Tips.pos2.num + "px;padding-top:5px;padding-bottom:5px;font-size: 14px;max-width: 70%;'>" + t + "<p style='color:#FFF;font-size: 14px;'>" + i.hint + "</p>" + d + "</div>" + o;
        $(document.body).append(u)
    },
    createDiv: function(i) {
        var e, s = .5,
            p = "undefined" == typeof i.pos || "" == i.pos ? "left" : i.pos,
            o = "undefined" == typeof i.is_next ? 0 : i.is_next,
            t = "",
            d = "",
            n = "",
            u = "";
        if (i.isdel) {
            var r = parseInt(1e3 * Math.random(), 10) + 1;
            0 != o ? (_style = "", i.step > 1 && (_style = 'style="display:none;"'), t = "<span onclick='javascript:GuideTips.closeTips(this);' id='_msg_" + r + "' class='_GuideTipsRemove_ Tips_step_" + i.step + "' " + _style + ">") : t = "<span onclick='javascript:GuideTips.closeTips(this);' id='_msg_" + r + "' class='_GuideTipsRemove_'>", d = "</span>", n = "<h5 style='text-align:right;'><a href='javascript:GuideTips.closeMsg(" + r + "," + i.step + "," + o + ");' style='color:#FFF;'>我知道了</a></h5>", u = "undefined" != typeof i.step && i.step > 0 ? "<p style='color:#FFF;'>第" + i.step + "步</p>" : "", e = i.step > 0 ? GuideTips.TipsH : GuideTips.TipsHStep
        } else t = "<span onclick='javascript:GuideTips.closeTips(this);' class='_GuideTips_ _GuideTipsRemove_'>", d = "</span>", e = GuideTips.TipsHDown;
        var a = "up";
        "left" != p ? s = .2 : i.perX > .6 ? s = .5 : i.perX < .4 && (s = .2), i.perY > .6 && (a = "down"), "" != i.ArrowPos && (a = i.ArrowPos);
        var T = GuideTips.divW * s,
            f = {
                Arrow: {
                    pos1: {
                        position: "top",
                        num: GuideTips.y - GuideTips.defaultH + 2.2
                    },
                    pos2: {
                        position: p,
                        num: GuideTips.x + T - 2.6
                    }
                },
                Line: {
                    pos1: {
                        position: "top",
                        num: GuideTips.y
                    },
                    pos2: {
                        position: p,
                        num: GuideTips.x + T
                    }
                },
                Tips: {
                    pos1: {
                        position: "top",
                        num: GuideTips.y + GuideTips.LineH
                    },
                    pos2: {
                        position: p,
                        num: GuideTips.x
                    }
                }
            };
        "down" == a && (f.Arrow.pos1.num = GuideTips.y - GuideTips.defaultH - $("#" + i.id).height() - GuideTips.ArrowH, f.Line.pos1.num = GuideTips.y - $("#" + i.id).height() - GuideTips.LineH - GuideTips.ArrowH - GuideTips.defaultH, f.Tips.pos1.num = GuideTips.y - $("#" + i.id).height() - GuideTips.LineH - GuideTips.defaultH - e + 1);
        var m = t + '<div style="-webkit-transform:rotate(45deg);border:1px solid #5BB9E2;height:5px;position:fixed;width:5px;background-color:#5BB9E2;position:fixed;' + f.Arrow.pos1.position + ":" + f.Arrow.pos1.num + "px;" + f.Arrow.pos2.position + ":" + f.Arrow.pos2.num + 'px;z-index:999999999;"></div><div style="width:2px;height:30px;background:#5BB9E2;position:fixed;' + f.Line.pos1.position + ":" + f.Line.pos1.num + "px;" + f.Line.pos2.position + ":" + f.Line.pos2.num + "px;z-index:999999999;\"></div><div class='ui-whitespace' style='background:#5BB9E2;border-radius: 6px;z-index:999999999;position:fixed;" + f.Tips.pos1.position + ":" + f.Tips.pos1.num + "px;" + f.Tips.pos2.position + ":" + f.Tips.pos2.num + "px;padding-top:5px;padding-bottom:5px;font-size: 14px;max-width: 70%;'>" + u + "<p style='color:#FFF;font-size:14px;'>" + i.hint + "</p>" + n + "</div>" + d;
        $(document.body).append(m)
    },
    setExampleItem: function(i) {
        var e = {};
        return e.item0 = {
            x: 10,
            y: 2
        }, e.item13 = {
            x: 5,
            y: 11,
            pos: "right"
        }, e.item12 = {
            x: 10,
            y: 140
        }, e.item121 = {
            x: 10,
            y: 117
        }, e.item21 = {
            x: 40,
            y: 110
        }, e.item22 = {
            x: 20,
            y: GuideTips.h - 40,
            pos: "right"
        }, e.item231 = {
            x: 20,
            y: .6 * GuideTips.h
        }, e.item234 = {
            x: 20,
            y: .3 * GuideTips.h
        }, e.item31 = {
            x: 10,
            y: GuideTips.h - 40
        }, e.item33 = {
            x: 50,
            y: 120
        }, e.item311 = {
            x: 100,
            y: 100
        }, e.item312 = {
            x: 100,
            y: 100
        }, e.item46 = {
            x: 40,
            y: .82 * GuideTips.h,
            pos: "right",
            ArrowPos: "down"
        }, e.item41 = {
            x: 10,
            y: GuideTips.h - 20,
            pos: "right"
        }, e.item42 = {
            x: 40,
            y: GuideTips.h - 20,
            pos: "right"
        }, e.item441 = {
            x: 60,
            y: 70
        }, e.item445 = {
            x: 20,
            y: 60,
            pos: "right"
        }, e.item53 = {
            x: .35 * GuideTips.w,
            y: .4 * GuideTips.h,
            ArrowPos: "down"
        }, e.item54 = {
            x: 10,
            y: 10
        }, e.item55 = {
            x: .3 * GuideTips.w,
            y: .2 * GuideTips.h
        }, e.item47 = {
            x: .34 * GuideTips.w,
            y: .65 * GuideTips.h,
            ArrowPos: "up"
        }, e["item" + i]
    },
    setPosDiv: function(i) {
        if ("undefined" == typeof FT.ftCookieVal || null === FT.ftCookieVal) return !1;
        var e = GuideTips.getPageArea();
        if (GuideTips.w = e.w, GuideTips.h = e.h, GuideTips.addx = "undefined" == typeof i.addx ? 0 : i.addx, GuideTips.addy = "undefined" == typeof i.addy ? 0 : i.addy, 0 == i.id) {
            var s = GuideTips.setExampleItem(i.itemnum);
            GuideTips.x = s.x, GuideTips.y = s.y, i.pos = "undefined" == typeof s.pos ? "" : s.pos, i.ArrowPos = "undefined" == typeof s.ArrowPos ? "" : s.ArrowPos
        } else GuideTips.element = document.getElementById(i.id), GuideTips.x = GuideTips.pageLeft() + GuideTips.addx, GuideTips.y = GuideTips.pageTop() + GuideTips.addy;
        i.ArrowPos = "undefined" == typeof i.ArrowPos || "" == i.ArrowPos ? "" : i.ArrowPos, i.step = "undefined" == typeof i.step ? 0 : i.step, i.perX = GuideTips.x / GuideTips.w, i.perY = GuideTips.y / GuideTips.h, "undefined" == typeof i.notLine ? GuideTips.createDiv(i) : GuideTips.createCenterTipsDiv(i), !i.isdel
    },
    closeMsg: function(i, e, s) {
        e = "undefined" == typeof e ? "" : e, s = "undefined" == typeof s ? "" : s, s && next <= GuideTips.maxstep && (next = e + 1, $(".Tips_step_" + next).css("display", "")), $("#_msg_" + i).remove()
    },
    remove: function() {
        $("._GuideTipsRemove_").remove()
    },
    showMsg: function(i) {
        $("#_info_").length <= 0 && $(document.body).append('<span id="_info_" style="color:#F00; font-weight:bold;"></span>'), "undefined" == typeof i ? $("#_info_").text(document.body.innerHTML) : $("#_info_").text(i)
    },
    getCookie: function(i) {
        var e, s = new RegExp("(^| )" + i + "=([^;]*)(;|$)");
        return (e = document.cookie.match(s)) ? unescape(e[2]) : null
    },
    setCookie: function(i, e, s) {
        s = s || 0;
        var p = "";
        if (0 != s) {
            var o = new Date;
            o.setTime(o.getTime() + 1e3 * s), p = "; expires=" + o.toGMTString()
        }
        document.cookie = i + "=" + escape(e) + p + "; path=/"
    },
    clearCookie: function(i) {
        GuideTips.setCookie(i, "", -1)
    },
    closeTips: function(i) {
        $("#" + i.id).remove()
    }
};

function MD() {
    this.userCookieName = "HecomDDSenior", this.mdId = "HEcomMD", this.url = md_baseurl, this.entCode = "", this.deviceId = "", this.v = 210, this.H5Version = 1, this.init()
}
MD.prototype.init = function() {
    var e = this;
    document.write("<iframe style='display:none;' id='" + e.mdId + "' src=''></iframe> ");
    var a = e.getCookie(e.userCookieName),
        r = null;
    if (null !== a && "" !== a) try {
        r = JSON.parse(a)
    } catch (t) {
        console.log(t.message)
    }
    null !== r && (void 0 !== r.v40DingEmplInfo && void 0 !== r.v40DingEmplInfo.entCode && (e.entCode = r.v40DingEmplInfo.entCode), void 0 !== r.deviceId && (e.deviceId = r.deviceId))
}, MD.prototype.getCookie = function(e) {
    var a, r = new RegExp("(^| )" + e + "=([^;]*)(;|$)");
    return (a = document.cookie.match(r)) ? unescape(a[2]) : null
}, MD.prototype.getTimeStamp = function() {
    var e = new Date,
        a = e.getFullYear().toString(),
        r = e.getMonth() + 1;
    10 > r && (r = "0" + r);
    var t = e.getDate();
    10 > t && (t = "0" + t);
    var s = e.getHours();
    10 > s && (s = "0" + s);
    var c = e.getMinutes();
    10 > c && (c = "0" + c);
    var o = e.getSeconds();
    10 > o && (o = "0" + o);
    var i = (new Date).getTime(),
        p = i.toString(),
        n = p.substr(p.length - 3);
    return a + r + t + s + c + o + n
}, MD.prototype.convertMDKey = function(e) {
    var a = "",
        r = "";
    switch (e) {
        case "report_visit":
            a = "p", r = "客户拜访分析";
            break;
        case "report_increase":
            a = "p", r = "新增客户分析";
            break;
        case "report_total":
            a = "p", r = "客户总量分析";
            break;
        case "report_total_map":
            a = "p", r = "客户总量分布";
            break;
        case "report_cover":
            a = "p", r = "客户被拜访分析";
            break;
        case "report_cover11":
            a = "p", r = "工作执行分析";
            break;
        case "report_sum":
            a = "p", r = "业务员拜访汇总";
            break;
        case "customer_detail":
            a = "p", r = "客户详情";
            break;
        case "customer_locate":
            a = "p", r = "标注客户位置";
            break;
        case "contact_new":
            a = "p", r = "新增联系人";
            break;
        case "customer_new":
            a = "p", r = "新增客户";
            break;
        case "new_plan":
            a = "p", r = "新增计划";
            break;
        case "tmp_visit":
            a = "p", r = "临时拜访";
            break;
        case "visit_exec":
            a = "p", r = "拜访执行";
            break;
        case "work":
            a = "p", r = "工作总览";
            break;
        case "report":
            a = "p", r = "报表总览";
            break;
        case "subscribe":
            a = "p", r = "报表订阅";
            break;
        case "visit":
            a = "p", r = "拜访";
            break;
        case "orderlist":
            a = "p", r = "订单列表";
            break;
        case "orderdetails":
            a = "p", r = "订单详情";
            break;
        case "form":
            a = "p", r = "提交";
            break;
        case "promotionlist":
            a = "p", r = "促销申请列表";
            break;
        case "promotiondetails":
            a = "p", r = "促销详情";
            break;
        case "promotionexeclist":
            a = "p", r = "促销执行列表";
            break;
        case "task":
            a = "p", r = "任务管理";
            break;
        case "dailylist":
            a = "p", r = "日报列表";
            break;
        case "dailyinfo":
            a = "p", r = "日报详情";
            break;
        case "dailyadd":
            a = "p", r = "新增日报";
            break;
        case "attendance":
            a = "p", r = "考勤";
            break;
        case "approve":
            a = "p", r = "审批";
            break;
        case "approveadd":
            a = "p", r = "审批添加";
            break;
        case "addqjsq":
            a = "p", r = "新增请假申请";
            break;
        case "addwcsq":
            a = "p", r = "新增外出申请";
            break;
        case "addccsq":
            a = "p", r = "新增出差申请";
            break;
        case "visitLineEdit":
            a = "p", r = "编辑线路";
            break;
        case "visitLineDetail":
            a = "p", r = "线路详情";
            break;
        case "tempVisit":
            a = "p", r = "临时拜访列表";
            break;
        case "customerAct":
            a = "p", r = "拜访详情";
            break;
        case "visitLineAddClient":
            a = "p", r = "新增线路";
            break;
        case "visitLineDel":
            a = "p", r = "删除线路";
            break;
        case "visitline":
            a = "p", r = "线路列表";
            break;
        case "addtysq":
            a = "p", r = "新增通用申请";
            break;
        case "myhome":
            a = "p", r = "个人中心";
            break;
        case "detailqj":
            a = "p", r = "请假申请详情";
            break;
        case "detailwc":
            a = "p", r = "外出申请详情";
            break;
        case "detailcc":
            a = "p", r = "出差申请详情";
            break;
        case "detailty":
            a = "p", r = "通用申请详情";
            break;
        case "customerList":
            a = "p", r = "客户列表";
            break;
        case "doVisitLocate":
            a = "p", r = "客户拜访";
            break;
        case "taskAdd":
            a = "p", r = "新增任务";
            break;
        case "taskEdit":
            a = "p", r = "编辑任务";
            break;
        case "taskAct":
            a = "p", r = "执行任务";
            break;
        case "taskInfo":
            a = "p", r = "任务详情";
            break;
        case "orderAdd":
            a = "p", r = "新增订单";
            break;
        case "promtAdd":
            a = "p", r = "新增促销";
            break;
        case "promtAct":
            a = "p", r = "促销执行";
            break;
        case "xundian":
            a = "p", r = "巡店";
            break;
        case "photo":
            a = "p", r = "照片打分";
            break;
        case "procheck":
            a = "p", r = "项目检查";
            break;
        case "panku":
            a = "p", r = "新增盘库";
            break;
        case "salesnum":
            a = "p", r = "新增报销量"
    }
    return {
        type: a,
        desc: r
    }
}, MD.prototype.commit = function(e) {
    var a = this,
        r = a.getTimeStamp(),
        t = a.convertMDKey(e),
        s = a.H5Version + "," + a.entCode + "," + a.deviceId + "," + t.type + "," + t.desc + "," + r + "," + a.v;
    console.log("userlog=" + s);
    var c = this.url + "?userlog=" + encodeURI(s);
    console.log("src=" + c), md_enbaled && $("#" + a.mdId).attr("src", c)
};
var MD = new MD;

function DDMD() {
    this.corpId = "", this.userCookieName = "HecomDDSenior", this.agent_id_hqyx = 0, this.init()
}
DDMD.prototype.init = function() {
    var e = this,
        n = e.getCookie(e.userCookieName),
        t = null;
    if (null !== n && "" !== n) try {
        t = JSON.parse(n)
    } catch (o) {
        console.log(o.message)
    }
    null !== t && (void 0 !== t.agentIds && void 0 !== t.agentIds.agent_id_hqyx && (e.agent_id_hqyx = t.agentIds.agent_id_hqyx), void 0 !== t.corpId && (e.corpId = t.corpId))
}, DDMD.prototype.getCookie = function(e) {
    var n, t = new RegExp("(^| )" + e + "=([^;]*)(;|$)");
    return (n = document.cookie.match(t)) ? unescape(n[2]) : null
}, DDMD.prototype.convertMDKey = function(e) {
    var n = this,
        t = "",
        o = "";
    switch (e) {
        case "datadecision":
            t = "open_micro_hongquan_data_page", o = n.agent_id_hqyx;
            break;
        case "viewplan":
            t = "open_micro_hongquan_plan_search", o = n.agent_id_hqyx;
            break;
        case "editplan":
            t = "open_micro_hongquan_plan_edit", o = n.agent_id_hqyx;
            break;
        case "cusdetail":
            t = "open_micro_hongquan_customer_detail", o = n.agent_id_hqyx;
            break;
        case "addcus":
            t = "open_micro_hongquan_customer_add", o = n.agent_id_hqyx;
            break;
        case "editcus":
            t = "open_micro_hongquan_customer_edit", o = n.agent_id_hqyx;
            break;
        case "visitcus":
            t = "open_micro_hongquan_customer_visit", o = n.agent_id_hqyx
    }
    return {
        ddKey: t,
        agentId: o
    }
}, DDMD.prototype.commit = function(e) {
    var n = this,
        t = n.convertMDKey(e);
    dd.biz.util.pageClick && dd.biz.util.pageClick({
        corpId: n.corpId,
        agentId: t.agentId,
        clickButton: t.ddKey
    })
};
var DDMD = new DDMD;