/**
 * wePush 辅助SDK / 三行科技
 * 微信小程序订阅消息群发推送平台 SDK （微擎）
 * UI组件库参考：https://github.com/im3x/wePushUI
 * 版本：20210505
 */

class wePush {
	constructor() {
		this.checkInit(() => {
			// 这里替换成你的微擎网址、acid、小程序appid
			this.base_api = 'https://微擎网站域名/app/index.php?c=entry&a=webapp&m=vpush_weapp&i=修改成PC平台ACID&appid=修改成对应小程序appid';
			this.user = null;
			this.initUser(user => {
				this.user = user;
			});

		});
	}

	checkInit(cb) {
		let i = setInterval(() => {
			let a = getApp();
			if (!a) return;
			cb && cb();
			clearInterval(i);
		}, 100);
	}

	// 初始化用户
	initUser(callback) {
		wx.login({
			success: res => {
				let code = res.code;
				let post_data = {};
				// 当前用户头像，如果可以
				new Promise(R => {
					// if (wx.getUserProfile) {
					// 	wx.getUserProfile({
					// 		desc: '用于完善会员资料',
					// 		success: res => {
					// 			R(res.userInfo)
					// 		},
					// 		fail: () => {
					// 			R(false)
					// 		}
					// 	})
					// } else {
						wx.getUserInfo({
							success: r1 => {
								R(r1.userInfo)
							},
							fail: () => {
								R(false);
							}
						})
					// }
				}).then(userinfo => {
					if (userinfo) {
						post_data = Object.assign(post_data, userinfo);
					}
					// 获取系统设置
					const system_info = wx.getSystemInfoSync();
					post_data = Object.assign(post_data, system_info);
					// 初始化用户
					wx.request({
						url: this.base_api + '&do=inituser&code=' + code,
						header: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						method: 'post',
						data: post_data,
						success: r2 => {
							if (r2.data.errno !== 0) {
								return console.warn("[!] vPush.initUser error:", r2.data);
							}
							callback && callback(r2.data.data);
						}
					})
				})
			}
		})
	}

	// 提交订阅数据
	// 可以传递数组，或者字符串，模板的id
	dingyue(opt, success, fail_cb, complete_cb) {
		console.log('[wePush.dingyue]', opt);
		let tmplIds = [];
		if (Array.isArray(opt)) {
			tmplIds = opt;
		} else {
			tmplIds.push(opt);
		}
		// 请求订阅
		wx.requestSubscribeMessage({
			tmplIds,
			success: e => {
				// 成功的订阅消息列表
				const oks = [];
				tmplIds.map(id => {
					if (e[id] === 'accept') {
						oks.push(id)
					}
				});
				// 回传给服务器
				if (oks.length > 0) {
					wx.request({
						url: this.base_api + '&do=addtmplids',
						header: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						method: 'post',
						data: {
							appid: this.user.key,
							tmplIds: oks.join(","),
							openid: this.user.openid
						},
						success: r2 => {
							if (r2.data.errno !== 0) {
								return console.warn("[!] vPush.dingyue error:", r2.data);
							}
							console.info('[+] vPush.dingyue ok!', oks);
							success && success(oks);
						}
					})
				}
			},
			fail: e => {
				console.warn('[wePush.dingyue] err:', e);
				fail_cb && fail_cb(e);
			},
			complete: e => {
				complete_cb && complete_cb(e);
			}
		})
	}

	// 获取当前用户可推送订阅数量
	// 需要传递订阅消息模板template_id，如果不指定，则返回全部模板可推送次数
	getPushCount (template_id = '') {
		if (!this.user) return new Promise(RES => {
			setTimeout(() => {
				RES(this.getPushCount(template_id));
			}, 500);
		})
		return new Promise(RES => {
			console.log('[i] wePush.getPushCount', template_id);
			wx.request({
				url: this.base_api + '&do=getpushcount',
				method: 'POST',
				header: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: {
					appid: this.user.key,
					template_id,
					openid: this.user.openid,
				},
				success: r => {
					let { errno, message, data } = r.data;
					if (errno !== 0) {
						console.warn('[!] wePush.getPushCount.err:', r.data);
						return RES(0);
					}
					RES(data);
				}
			})

		});
	}

	// 设置标签
	setTag (tag = "") {
		if (!this.user) return new Promise(RES => {
			setTimeout(() => {
				RES(this.setTag(tag));
			}, 500);
		})
		return new Promise(RES => {
			wx.request({
				url: this.base_api + '&do=settag',
				method: 'POST',
				header: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: {
					tag,
					appid: this.user.key,
					openid: this.user.openid,
				},
				success: r => {
					console.log('[wePush.setTag]', r);
					RES(r);
				}
			});
		})
	}
}

module.exports = new wePush();
