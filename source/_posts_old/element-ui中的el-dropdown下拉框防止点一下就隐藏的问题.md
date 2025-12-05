---
title: element ui中的el-dropdown（下拉框）防止点一下就隐藏的问题
date: 2022-12-08 00:00:00
tags:
  - elementUI
---

在使用el-dropdown下拉框时，下拉框的每项中，可能需要加入@click、@change或复选框等事件，而el-dropdown-item的事件触发时，el-dropdown下拉框总是会收缩，很不合理。

这是官方例子
    
    
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
    

| 
    
    
    <el-dropdown>   
    	<span class="el-dropdown-link">   
    		下拉菜单<i class="el-icon-arrow-down el-icon--right"></i>   
    	</span>   
    	<el-dropdown-menu slot="dropdown">   
    		<el-dropdown-item>黄金糕</el-dropdown-item>   
    		<el-dropdown-item>狮子头</el-dropdown-item>   
    		<el-dropdown-item>螺蛳粉</el-dropdown-item>   
    		<el-dropdown-item disabled>双皮奶</el-dropdown-item>   
    		<el-dropdown-item divided>蚵仔煎</el-dropdown-item>   
    	</el-dropdown-menu>   
    </el-dropdown>  
      
  
---|---  
  
这个时候我们只需要在下拉属性中将 “hide-on-click” 属性设置为 false就好
    
    
    1  
    

| 
    
    
    <el-dropdown trigger="click" :hide-on-click="false">  
      
  
---|---
