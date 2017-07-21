

function Customerflush(urlapi,deviceId,callback){
    this.urlapi = urlapi;
    this.deviceId = deviceId;
    this.callback = callback;
    this.debug = false;
    
    this.ajaxTimeout = 30000;
    
    this.dbConfig = null;
    this.dbCustomer = null;
    
    this.dbnameConfig = 'config'; //config数据库表名
    this.dbnameCustomer = 'customer';//customer数据库表名
    
    this.lastUpdateTime_customer_name = 'lastUpdateTime_customer';//config数据表中关于lastUpdateTime_customer数据key
    this.update_completed_customer = 'update_completed_customer';//config表中关于customer增量更新数据是否完成的标记key
    this.lastUpdateTime_customer = '';//本地lastUpdateTime_customer值
   
    this.showNeterror = false;
    this.connectDB();
}

Customerflush.prototype.log = function(content){
    if (this.debug){
        alert(content);
        console.log(content);
    }
};

Customerflush.prototype.showProgress = function(){
    if (!this.showNeterror){
        this.showNeterror = true;
        dd.device.notification.confirm({
            message: "连接失败，请重试！",
            title: '连接失败',
            buttonLabels: ['重试', '取消'],
            onSuccess : function(result) {
                if (result.buttonIndex === 0){
                    window.location.reload();
                }
            },
            onFail : function(err) {}
        });
    }
};

Customerflush.prototype.closeLoading = function(){
    this.callback();
};

Customerflush.prototype.connectDB = function(){
    var self = this;
    
    function connectDBConfig(){
        self.log("connectDB:config");
        var deferred = $.Deferred();
        self.dbConfig = new Database(self.dbnameConfig,function(){
            self.log("connectDB:config_callback");
            deferred.resolve('connect');
        });
        return deferred.promise();
    }
    function connectDBCustomer(){
        self.log("connectDB:customer");
        var deferred = $.Deferred();
        self.dbCustomer = new Database(self.dbnameCustomer,function(){
            self.log("connectDB:customer_callback");
            deferred.resolve('connect');
        });
        return deferred.promise();
    }
    self.log('connectDB:WHEN');
    $.when(connectDBConfig())
    .then(function(){
        return connectDBCustomer();
    }).done(function(){
        self.log('connectDB:WHEN DOWN');
        self.getLastUpdateTimes();
    });
};

/*
 * 获取本地最后更新时间
 */
Customerflush.prototype.getLastUpdateTimes = function(){
    var self = this;
    this.dbConfig.get([
                this.lastUpdateTime_customer_name,
                this.update_completed_customer
            ],function(config){
        if (config!==undefined && config!==null){
            if (config[0]!==undefined && config[0]!==null ){
                if (config[0].lastUpdateTime!==undefined){
                    self.lastUpdateTime_customer = config[0].lastUpdateTime;
                }
            }
            //判断上一次更新是否异常终止，否则全部更新
            if (config[1]!==undefined && config[1]!==null && config[1].flg === 0){
                self.lastUpdateTime_customer = '';
            }
        }
        self.log('START');
        $.when(
               self.requestCustomer()
                ).done(function(){
            self.log('DOWN');
            self.closeLoading();
//            self.callback();
        }).fail(function(){
            self.log('FAIL');
        });
    });
};

/*
 * ajax获取customer
 */
Customerflush.prototype.requestCustomer = function(){
    var deferred = $.Deferred();
    var self = this;
    var downlinkReqStr = {
        type:'customerV40',
        deviceId : this.deviceId,
        pageSize : 4000,
        lastUpdateTime: this.lastUpdateTime_customer
    };
    self.log('customer');
    $.ajax({
        type: "POST",
        url: this.urlapi+"downlinkdata/downlink.do",
        data: {downlinkReqStr:JSON.stringify(downlinkReqStr)},
        timeout: self.ajaxTimeout,
        success: function(jsonstr) {
    //        alert(jsonstr);
            self.log('customer_ajax');
            var json = null;
            try{
                json = JSON.parse(jsonstr);
            }catch (e){
                self.log(e.message);
            }
            if (json!==null && json.result === '0'){
                var data = json.data;
                var batchJsonArr = [];
                var removeCodeJsonArr = [];
                $.each(data,function(k,v){
                    var actionType = v.actionType;
                    delete v.actionType;
                    v.key = v.code;
                    if (actionType === '1'){//添加
                        batchJsonArr.push(v);
                    }else if (actionType === '2'){//修改
                        removeCodeJsonArr.push(v.code);
                        batchJsonArr.push(v);
                    }else if (actionType === '3' || actionType === '4' ){//删除
                        removeCodeJsonArr.push(v.code);
                    }
                });
                function configUpdateFlgOpen(){
                    self.log('customer_config_update_flg_open');
                    var dfd = $.Deferred();
                    var json = {};
                    json.key = self.update_completed_customer;
                    json.flg = 0;
                    self.dbConfig.save(json,function(){
                        self.log('customer_config_update_flg_open_callback');
                        dfd.resolve('nuke');
                    });
                    return dfd.promise();
                }
                function configUpdateFlgClose(){
                    self.log('customer_config_update_flg_close');
                    var dfd = $.Deferred();
                    var json = {};
                    json.key = self.update_completed_customer;
                    json.flg = 1;
                    self.dbConfig.save(json,function(){
                        self.log('customer_config_update_flg_close_callback');
                        dfd.resolve('nuke');
                    });
                    return dfd.promise();
                }
                function customerRemove(removeCodeJsonArr){
                    self.log('customer_remove');
                    var dfd = $.Deferred();
                    if (removeCodeJsonArr.length > 0 ){
                        self.dbCustomer.remove(removeCodeJsonArr,function(){
                            self.log('customer_remove_callback');
                            dfd.resolve('nuke');
                        });
                    }else{
                        self.log('customer_remove_callback[0]');
                        dfd.resolve('nuke');
                    }
                    return dfd.promise();
                }
                function customerBatch(batchJsonArr){
                    self.log('customer_batch');
                    var dfd = $.Deferred();
                    self.dbCustomer.batch(batchJsonArr,function(){
                        self.log('customer_batch_callback');
                        dfd.resolve('nuke');
                    });
                    return dfd.promise();
                }
                function customerConfigRemove(){
                    self.log('customer_config_remove');
                    var dfd = $.Deferred();
                    self.dbConfig.remove(self.lastUpdateTime_customer_name,function(){
                        self.log('customer_config_remove_callback');
                        dfd.resolve('nuke');
                    });
                    return dfd.promise();
                }
                function customerConfigSave(){
                    self.log('customer_config_save');
                    var dfd = $.Deferred();
                    var jsonConfig = {};
                    jsonConfig.key = self.lastUpdateTime_customer_name;
                    jsonConfig.lastUpdateTime = json.lastUpdateTime;
                    self.dbConfig.save(jsonConfig,function(){
                        self.log('customer_config_save_callback');
                        dfd.resolve('nuke');
                    });
                    return dfd.promise();
                }
                self.log('customer_resolve_pre');
                $.when(configUpdateFlgOpen()).then(function(){
                    return customerRemove(removeCodeJsonArr);
                }).then(function(){
                    return customerBatch(batchJsonArr);
                }).then(function(){
                    return customerConfigRemove();
                }).then(function(){
                    return customerConfigSave();
                }).then(function(){
                    return configUpdateFlgClose();
                }).done(function(){
                    self.log('customer_resolve_done');
                    deferred.resolve();
                }).fail(function(){
                    self.log('customer_resolve_fail');
                    deferred.resolve();
                });
            }else{
                self.log('customer_ajax_resolve');
                deferred.resolve();
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
//            if(textStatus === "timeout") {
                self.showProgress();
                $('#neterr').show();
//            }
        }
    });
    return deferred.promise();
};
