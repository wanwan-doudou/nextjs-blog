---
title: echarts赋值
date: 2022-01-11 00:00:00
tags:
  - echarts
---

饼图：

```js
var lowerRightChart = echarts.init(document.getElementById('lowerRightChart'));  
        option = {  
            tooltip: {  
                trigger: 'item'  
            },  
            legend: {  
                top: '5%',  
                left: 'center'  
            },  
            title: {  
                text: '统计',  
            },  
            series: [  
                {  
                    name: 'Statistics',  
                    type: 'pie',  
                    radius: ['40%', '70%'],  
                    avoidLabelOverlap: false,  
                    itemStyle: {  
                        borderRadius: 10,  
                        borderColor: '#fff',  
                        borderWidth: 2  
                    },  
                    label: {  
                        show: false,  
                        position: 'center'  
                    },  
                    emphasis: {  
                        label: {  
                            show: true,  
                            fontSize: '40',  
                            fontWeight: 'bold'  
                        }  
                    },  
                    labelLine: {  
                        show: false  
                    },  
                    data: monthly  
                }  
            ]  
        };  
        lowerRightChart.setOption(option);
```

在异步获取到数据后赋值到饼图上去。

```js
$.ajax({  
	url: ''  
	, success(suc) {  
		option.series = [  
        {  
        	name: 'Statistics',  
        	type: 'pie',  
        	radius: ['40%', '70%'],  
        	avoidLabelOverlap: false,  
        	itemStyle: {  
        		borderRadius: 10,  
        		borderColor: '#fff',  
        		borderWidth: 2  
        	},  
        	label: {  
        		show: false,  
        		position: 'center'  
        	},  
        	emphasis: {  
        		label: {  
        			show: true,  
        			fontSize: '40',  
        			fontWeight: 'bold'  
        		}  
        	},  
        	labelLine: {  
        		show: false  
        	},  
        	data: monthly  
        }  
   ]  
        lowerRightChart.clear();  
        lowerRightChart.setOption(option);  
	}  
})
```