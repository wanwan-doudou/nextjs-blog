---
title: vue中slot插槽
date: 2021-12-03 00:00:00
tags:
  - vue
---

我们在进行`vue`开发中，经常会使用到`slot`插槽

插槽允许我们在父组件引用子组件时，在组件其中放一段可以带标签的元素，甚至放入其他组件等

例如我这里定义一个组件
    
    
    1  
    2  
    3  
    4  
    5  
    6  
    7  
    8  
    9  
    10  
    11  
    12  
    13  
    14  
    15  
    16  
    17  
    18  
    19  
    

| 
    
    
    <template>    
    	<div>    
    		<header><slot name="header" :user="user">-------</slot></header>    
    		<main><slot :user="user">默认内容</slot></main>    
    		<footer><slot name="footer" :user="user">-------</slot></footer>    
    	</div>    
    </template>    
        
    <script>    
    export default {    
    	data() {    
    		return {    
    			user: {    
    				name: 'ruben'    
    			}    
    		};    
    	}    
    };    
    </script>  
      
  
---|---  
  
其中包含三个外部标签`header`、`main`、`footer`

我们在父页面外部引用时就可以这么写：
    
    
    1  
    2  
    3  
    4  
    5  
    6  
    7  
    8  
    9  
    10  
    11  
    

| 
    
    
    <navigation-link>    
    	<template v-slot:header>    
    		----传入头部----    
    	</template>    
    	<template v-slot:default="slotProps">    
    		插槽{{ slotProps.user.name }}    
    	</template>    
    	<template v-slot:footer>    
    		----传入底部----    
    	</template>    
    </navigation-link>  
      
  
---|---  
  
这样我们`template`标签内的内容会根据`v-slot`指定的插槽名自动匹配上面的`name`

注意，我这里使用的是新版`api`，旧版已被废弃，但仍然可使用，感兴趣可以看[官方文档](https://cn.vuejs.org/v2/guide/components-slots.html#%E5%BA%9F%E5%BC%83%E4%BA%86%E7%9A%84%E8%AF%AD%E6%B3%95)

最后渲染出来的效果：  
![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830220537.png)  
当然这里我每个插槽在组件内定义时都写了默认值，这样就算我们没有传入，也可以使用默认值

这里我们可能还会有一个需求，我们想访问子组件内部的值怎么办？因为我们从父页面传给子组件的插槽的模板引用到的作用域是外部，也就是我们父页面的，此时大家注意到我定义组件时，绑定了一个`user`标签，指向我们子组件内部的值`user`  
![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830220601.png)  
这样，我们在外部使用时就可以像我上方那样，使用`v-slot`设置一个属性变量，通过它就能访问到子组件内部的值  
![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830220613.png)  
当你会用这个了之后你还可以使用`ES6`中变量的解构赋值，省掉我们上面定义`slotProps`变量这一步骤

而且`:default`也是可以省略的  
![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830220624.png)  
![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830220630.png)  
这里可以看到我传入的`template`标签很繁重，其实如果我们只给默认的`slot`传模板的话，可以简写为下方形式：
    
    
    1  
    2  
    

| 
    
    
    <!-- 缩写形式 只能在只有一个slot下使用，如有多个，则需要写全 -->    
    <navigation-link v-slot:header="{ user: person }">缩写{{ person.name }}</navigation-link>  
      
  
---|---  
  
注意上方我还将`user`进行了重命名为`person`

[`vue`官方文档](https://cn.vuejs.org/v2/guide/components-slots.html#%E8%A7%A3%E6%9E%84%E6%8F%92%E6%A7%BD-Prop)还提到可以使用如下语法设置备选值，用于在`user`为`undefined`的时候，但我发现我引入这段代码会编译报错，暂时不是很想去探究，有可能是我的版本问题吧
    
    
    1  
    

| 
    
    
    <navigation-link v-slot="{ user = { name: 'Guest' } }">备用值{{ user.name }}</navigation-link>  
      
  
---|---  
  
我们在写插槽名的时候，其实可以使用动态插槽名如下，并且`v-slot`在指定插槽名的时候也可以进行简写为`#`：
    
    
    1  
    

| 
    
    
    <navigation-link #[dynamicSlotName]="{ user }">动态插槽{{ user.name }}</navigation-link>  
      
  
---|---  
  
这里`dynamicSlotName`在下方定义如下：  
![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/blog/20220830220731.png)  
最后完整代码如下：
    
    
    1  
    2  
    3  
    4  
    5  
    6  
    7  
    8  
    9  
    10  
    11  
    12  
    13  
    14  
    15  
    16  
    17  
    18  
    19  
    20  
    21  
    22  
    23  
    24  
    25  
    26  
    27  
    28  
    29  
    30  
    31  
    32  
    33  
    34  
    35  
    36  
    37  
    38  
    39  
    40  
    41  
    42  
    43  
    44  
    45  
    46  
    47  
    48  
    49  
    50  
    51  
    52  
    53  
    54  
    55  
    56  
    57  
    58  
    59  
    

| 
    
    
    <template>    
    	<div>    
    		<div :class="[{ active: active }, isButton ? prefix + '-button' : null]">:class="[{ active: active }, isButton ? prefix + '-button' : null]"</div>    
    		<div :class="{ active, [`${prefix}-button`]: isButton }">:class="{ active, [`${prefix}-button`]: isButton }"</div>    
    		<hello-world msg="Hello World"></hello-world>    
    		<div v-html="'<div class=\'ruben-html\'>我是富文本</div>'"></div>    
    		<navigation-link>    
    			<template v-slot:header>    
    				----传入头部----    
    			</template>    
    			<template v-slot:default="slotProps">    
    				插槽{{ slotProps.user.name }}    
    			</template>    
    			<template v-slot:footer>    
    				----传入底部----    
    			</template>    
    		</navigation-link>    
    		<navigation-link>    
    			<template v-slot="{ user }">    
    				解构{{ user.name }}    
    			</template>    
    		</navigation-link>    
    		<!-- 缩写形式 只能在只有一个slot下使用，如有多个，则需要写全 -->    
    		<navigation-link v-slot:header="{ user: person }">缩写{{ person.name }}</navigation-link>    
    		<!-- <navigation-link v-slot="{ user = { name: 'Guest' } }">备用值{{ user.name }}</navigation-link> -->    
    		<navigation-link #[dynamicSlotName]="{ user }">动态插槽{{ user.name }}</navigation-link>    
    	</div>    
    </template>    
        
    <script>    
    import HelloWorld from '@/components/HelloWorld.vue';    
    import NavigationLink from '@/components/navigation-link.vue';    
    export default {    
    	components: { HelloWorld, NavigationLink },    
    	data() {    
    		return {    
    			active: true,    
    			isButton: true,    
    			prefix: 'ruben',    
    			dynamicSlotName: 'footer'    
    		};    
    	}    
    };    
    </script>    
        
    <style scoped>    
    .hello {    
    	text-align: center;    
    }    
    >>> .hello-ruben {    
    	color: #f06431;    
    }    
    .hello /deep/ a {    
    	color: #0000ee;    
    }    
    >>> .ruben-html {    
    	color: #ff0000;    
    }    
    </style>  
      
  
---|---
