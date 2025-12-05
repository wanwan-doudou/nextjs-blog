---
title: echarts赋值
date: 2022-01-11 00:00:00
tags:
  - echarts
---

饼图：
    
    
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
    

| 
    
    
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
      
  
---|---  
  
在异步获取到数据后赋值到饼图上去。
    
    
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
    

| 
    
    
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
      
  
---|---
