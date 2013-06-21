开发日志
========

#### 需求池

* 开发中
	* 添加音乐、音效
	* 敌人AI(doing)
		* 简单AI
		* AI框架
* 重构
	* 行动菜单的UI和逻辑(doing)
		* 一开始是否需要弹出菜单
		* 菜单的样式与展现
		* 取消移动功能
	* 将View从Scene的代码中分离出来
		* battle的流程控制逻辑和画面显示逻辑分开
		* 移动范围阴影和攻击范围阴影放在Map中？
	* 图片资源atlas
* 新功能
	* 存档/读档
		* 存档格式
		* 读写逻辑
	* 剧情条件判定逻辑
		* 位置判定
		* 血量判定
		* 胜败判定
	* 对话系统
	* 地图
		* 小地图
		* 地图编辑器
		* 战役编辑器
		* 地形InfoBox
	* 战斗动画
		* 防御动画
		* 反击流程
		* 伤害计算公式
#### BUG

* 战斗状态控制没有做完
	* 完善点击事件状态机
	* 防止多重点击

* 动画帧速不稳定，有时候有点卡

#### 20130621

* 完整的关卡逻辑(done)
	* 回合开始
	* 行动->行动完毕
	* 敌方回合

#### 20130616

* 完成了升级和死亡动画

#### 20130615

* 将攻击动画和InfoBox动画串联起来
	* 需要追加死亡、防御、升级等等情况

#### 20130613

* 将地图逻辑分离出来
	* 移动范围和攻击范围逻辑分开
	* 是否在地图上的判断
	* 可否移动判断
	* 消耗移动力判断
* 将一部分单位动画整合到Unit中
	* 包含多个角色的动画比如attack仍然在battle中

#### 20130612

* InfoBox
* 地图拖动

#### 20130608
* 完成了攻击、受伤动画

#### 20130603

* 修正了地图格子错乱的问题
* 还需要解决攻击格子的listner覆盖了移动格子的listner的问题

#### 20130531

* 考虑了一下，UI还是最好将代码与配置分开。
	* View单独配置在一个文件里
	* 考虑到现在UI的量不大，这个工程相对比较复杂，留到以后再实现
	* 做完了大概是这个感觉

{
	class: "InfoBox",
	frame: [x, y, w, h],
	children: [
	]
}


#### 20130530

* 看了一下ui.enchant.js感觉有一些还是可以用的。可以直接移植过来。
* 现在的主要工作是把battle.js里的UI操作抽象成单独的类。为以后InfoBox的工作做准备
* 在Canvas层实现UI，理由
	* 有整体感
	* 不用适配不同浏览器的差异
	* 快(未验证)

#### 20130529

* 将大文件拆分成小文件。
* 整理所有常数和配置，放于const.js和config.js
* 关于UI可以先看一下enchant.js的相关插件
* 改动了原来的部分逻辑，没有进行整体调试
* 对于基本属性的操作最好也改成enchant.js中的get/set写法，例如：

	text: {
		get: function() {
			return this._text;
		},  
		set: function(text) {
			this._text = text;
			if (!enchant.CanvasLayer) {
				this._element.innerHTML = text;
			}   
		}   
	},  


#### 20130528

* 重写了原来的移动阴影相关逻辑。现在会更简洁一些。(未debug)
* 程序开始变大，最终需要至少拆分成如下几个部分
	* config.js 包括读入配置文件，初始化全局变量等等
	* battle.js 战斗主逻辑
	* chara.js 任务基本逻辑，属性计算逻辑

#### 20130525

* 使用enchant.js重写了基础类。包括Battle类和Chara类。
	* Battle类管辖战斗中所有操作。
	* Chara类主要是各单位的基本操作，包括基本动画的设定
* 重新组织了架构。新的架构中：
	* Battle类在战斗中统管全局，包含一个Map类和多个Chara类。
	* 需要涉及超过单个类的方法都放到Battle类中去解决。
* 目前完成的部分：人物的基本动画
* 接下来的要完成的部分：
	* 地图相关函数。需要首先理解enchant.js中地图的实现和用法。
	* 状态显示框的构建及相关动画。
	* 基本的组合动画。移动->攻击->受伤->行动完毕
	* 基本的框架逻辑。我方行动->敌方行动->回合结束->下一回合...->战斗结束。
