开发日志
========

### 20130530

* 看了一下ui.enchant.js感觉有一些还是可以用的。可以直接移植过来。
* 现在的主要工作是把battle.js里的UI操作抽象成单独的类。为以后InfoBox的工作做准备
* 在Canvas层实现UI，理由
	* 有整体感
	* 不用适配不同浏览器的差异
	* 快(未验证)

### 20130529

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


### 20130528

* 重写了原来的移动阴影相关逻辑。现在会更简洁一些。(未debug)
* 程序开始变大，最终需要至少拆分成如下几个部分
	* config.js 包括读入配置文件，初始化全局变量等等
	* battle.js 战斗主逻辑
	* chara.js 任务基本逻辑，属性计算逻辑

### 20130525

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
