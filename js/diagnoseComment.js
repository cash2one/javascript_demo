	var diagnoseComment = {
			user: {},
			user: JSON.parse(getCookie('omsUser')),
			postData: {},
			type: getUrlParam('type') || '',
			orgid: getUrlParam('id') || '',

			commentEventListener: function(){
					var self = this;
					$('#saveComment').click(function() {
							console.log(111);
							self.submitData();
					});

					$('#returnConfirm').tap(function(){
							history.back(-1);
					})
			},

			submitData: function(){
					var self = this;
					var textContent = $.trim($("#textContent").val());
					if (textContent == "") {
	            dd.device.notification.toast({
	                icon: 'error',
	                text: '请填写点评！',
	                duration: 1,
	                onSuccess: function(result) {},
	                onFail: function(err) {}
	            })
	            return false;
	        }


					self.postData.entity_type = self.type;
					self.postData.entity_id = self.orgid;
					self.postData.content = textContent;
					self.postData.omsuid = self.user.id;
					self.postData.token = self.user.token;
					if (!self.isPostComment) {
	            dd.device.notification.showPreloader({
	                text: '使劲提交中...'
	            });
	            self.isPostComment = true;
							$.ajax({
									type:"post",
									url:oms_config.apiUrl+oms_apiList.addComment,
									async:true,
									data:self.postData,
									dataType:'json',
									success:function(rs){
											self.isPostComment = false;
											if(rs.res==1){
													dd.device.notification.toast({
															icon: 'success',
															text: '已提交',
															duration: 1,
															onSuccess: function(result) {
																	history.back(-1);
															},
															onFail: function(err) {}
													});
											}else{
													dd.device.notification.toast({
															icon: 'error',
															text: rs.msg,
															duration: 1,
															onSuccess: function(result) {},
															onFail: function(err) {}
													});
											}
									},
									error: function(xhr, type) {
	                    console.log('ajax error!');
	                    self.isPostComment = false;
	                }
							}).always(function() {
	                dd.device.notification.hidePreloader();
	            });
						} else {
		            dd.device.notification.toast({
		                text: '使劲提交中...'
		            });
		        }
			},

			initTitle: function(title){
					console.log(2);
					dd.ready(function () {
							dd.biz.navigation.setTitle({
									title: '评论',
									onSuccess: function(result) {},
									onFail: function(err) {}
							});
					})
			},
			initTab: function(){
				dd.ready(function () {
					if (dd.ios) {
						dd.biz.navigation.setLeft({
							show: true,
							control: true,
							showIcon: true,
							text: '',
							onSuccess: function (result) {
								var textContent = $.trim($("#textContent").val());
								if (textContent != "") {
										$('#return_dialog').dialog('show');
								}else {
										history.back(-1);
								}
							},
							onFail: function (err) {
							}
						});
					} else {
						dd.biz.navigation.setLeft({
							visible: true,
							control: true,
							showIcon: true,
							text: ''
						});
						$(document).off('backbutton');
						$(document).on('backbutton', function (e) {
								var textContent = $.trim($("#textContent").val());
								if (textContent != "") {
										$('#return_dialog').dialog('show');
								}else{
										history.back(-1);
								}

								e.preventDefault();
						});
					}
				})

			},

			init: function(){
				this.initTitle();
				this.initTab();
				this.commentEventListener();
			},
		};

		$.fn.diagnoseComment = function(settings){ $.extend(diagnoseComment, settings || {});};
		$.fn.ready(function() {
		    var loginApi = oms_config.apiUrl+oms_apiList.login;
        var omsUser = getCookie('omsUser');
        if(omsUser){
            diagnoseComment.user = JSON.parse(omsUser);
						diagnoseComment.init();
        }
		});
