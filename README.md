# vpush_weapp_sdk
小程序消息群发推送（微擎）辅助前端sdk代码

> 特别提示：本代码仅供参考辅助使用


## 使用方法
下载 `wePush.js` 文件到小程序前端目录，比如`utils`目录中

然后，编辑 `wePush.js` 修改 base_api 地址成你的微擎接口

接着在 `app.js` 中引入该模块：

``` js
App({

  wePush: require('./utils/wePush'),
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    
```

最后，在小程序的用户点击事件之前，加上订阅功能，比如一个页面中有一个按钮，用户点击（`bindtap`）函数名是`testHandler`，那么就在 `js` 文件的 `testHandler` 函数之前，加上订阅代码：

``` js
testHandler: function() {
  getApp().wePush.dingyue(['消息模板ID1', 'id2'], () => {
    console.log('订阅成功')
  })
}
```
