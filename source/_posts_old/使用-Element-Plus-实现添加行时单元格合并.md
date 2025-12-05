---
title: 使用 Element Plus 实现添加行时单元格合并
date: 2024-11-05 00:00:00
tags:
  - Vue
---

在项目中，需要展示设备绑定信息表格。为了简洁地展示数据，主表字段（例如设备唯一标识、设备负责人等）应合并显示相同的内容，而从表字段（例如探针设备、IP 地址等）保持独立显示，避免重复。同时，当点击“添加行”按钮时，新增的行需自动继承主表字段，并完成单元格合并。

## 实现步骤

### 1\. 设置表格和列模板

使用 Element Plus 的 `<el-table>` 和 `<el-table-column>` 渲染表格，其中 `:span-method` 属性用于设置单元格合并逻辑。代码如下：
    
    
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
    

| 
    
    
    <el-table border :data="tableData" row-key="id" :span-method="spanMethod">  
      <template v-for="(propsItem, index) in columnOptions" :key="index">  
        <el-table-column :prop="propsItem.value" :label="propsItem.label">  
          <template #default="{ row }">  
            <el-input v-model="row[propsItem.value]" placeholder="输入内容"></el-input>  
          </template>  
        </el-table-column>  
      </template>  
      <el-table-column prop="total2" label="操作" width="200" fixed="right">  
        <template #default="scope">  
          <el-button size="small" color="#1F63FF" @click="addRowBelow(scope.$index)">添加行</el-button>  
          <el-button size="small" color="#1F63FF" plain @click="editHandle(scope.row)">编辑</el-button>  
          <el-button size="small" type="danger" plain @click="deleteHandle(scope.row)">删除</el-button>  
        </template>  
      </el-table-column>  
    </el-table>  
      
      
  
---|---  
  
### 2\. 定义需要合并的字段

定义 `columnOptions` 列表，列出表格中的各字段，并选择需要合并的主表字段：
    
    
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
    

| 
    
    
    const columnOptions = ref([  
      { label: "设备唯一标识", value: "unitDeviceCode" },  
      { label: "设备负责人", value: "unitDeviceAdmin" },  
      { label: "电话", value: "unitDeviceAdminPhone" },  
      { label: "邮箱", value: "unitDeviceAdminEmail" },  
      { label: "硬件类型", value: "unitDeviceHardwareType" },  
      { label: "操作系统", value: "unitDeviceOperatingSystem" },  
      { label: "探针设备", value: "routeScannerName" },  
      { label: "IP地址", value: "unitDeviceIp" },  
      { label: "设备网关IP地址", value: "macIp" },  
      { label: "子网掩码长度", value: "subnetMaskLength" }  
    ]);  
      
      
  
---|---  
  
### 3\. 实现 `spanMethod` 函数进行单元格合并

`spanMethod` 函数根据字段内容合并单元格。主表字段内容相同时，进行合并显示；否则显示独立单元格。代码如下：
    
    
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
    

| 
    
    
    const spanMethod = ({ row, column, rowIndex, columnIndex }) => {  
      const mergeColumns = ["unitDeviceCode", "unitDeviceAdmin", "unitDeviceAdminPhone", "unitDeviceAdminEmail", "unitDeviceHardwareType", "unitDeviceOperatingSystem"];  
      if (mergeColumns.includes(column.property)) {  
        if (rowIndex > 0 && row[column.property] === tableData.value[rowIndex - 1][column.property]) {  
          return [0, 0]; // 当前单元格不显示  
        }  
        let rowspan = 1;  
        while (rowIndex + rowspan < tableData.value.length && tableData.value[rowIndex + rowspan][column.property] === row[column.property]) {  
          rowspan++;  
        }  
        return [rowspan, 1];  
      }  
      return [1, 1]; // 其他字段不合并  
    };  
      
      
  
---|---  
  
### 4\. 添加新行并继承主表字段

`addRowBelow` 函数用于在指定位置添加新行，并继承主表字段内容，确保合并效果。代码如下：
    
    
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
    

| 
    
    
    const addRowBelow = (index) => {  
      const newRow = {   
        unitDeviceCode: tableData.value[index].unitDeviceCode,   
        unitDeviceAdmin: tableData.value[index].unitDeviceAdmin,  
        unitDeviceAdminPhone: tableData.value[index].unitDeviceAdminPhone,  
        unitDeviceAdminEmail: tableData.value[index].unitDeviceAdminEmail,  
        unitDeviceHardwareType: tableData.value[index].unitDeviceHardwareType,  
        unitDeviceOperatingSystem: tableData.value[index].unitDeviceOperatingSystem,  
        routeScannerName: "",  // 从表字段留空  
        unitDeviceIp: "",  
        macIp: "",  
        subnetMaskLength: 0  
      };  
      tableData.value.splice(index + 1, 0, newRow);  
    };  
      
      
  
---|---  
  
### 完整代码如下
    
    
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
    60  
    61  
    62  
    63  
    64  
    65  
    66  
    67  
    68  
    69  
    70  
    71  
    72  
    73  
    74  
    75  
    76  
    77  
    78  
    79  
    80  
    81  
    82  
    83  
    84  
    85  
    86  
    87  
    88  
    89  
    90  
    91  
    92  
    93  
    94  
    95  
    96  
    97  
    98  
    99  
    100  
    101  
    102  
    103  
    104  
    105  
    106  
    107  
    108  
    109  
    110  
    111  
    112  
    113  
    114  
    115  
    116  
    117  
    118  
    119  
    120  
    121  
    122  
    123  
    124  
    125  
    126  
    127  
    128  
    129  
    130  
    131  
    132  
    133  
    134  
    135  
    136  
    137  
    138  
    139  
    140  
    141  
    142  
    143  
    144  
    145  
    146  
    147  
    148  
    149  
    150  
    151  
    152  
    153  
    154  
    155  
    156  
    157  
    158  
    159  
    160  
    161  
    162  
    163  
    164  
    165  
    166  
    167  
    168  
    169  
    170  
    171  
    172  
    173  
    174  
    175  
    176  
    177  
    178  
    179  
    180  
    181  
    182  
    183  
    184  
    185  
    186  
    187  
    188  
    189  
    190  
    191  
    192  
    193  
    194  
    195  
    196  
    197  
    198  
    199  
    200  
    201  
    202  
    203  
    204  
    205  
    206  
    207  
    208  
    209  
    210  
    211  
    212  
    213  
    214  
    215  
    216  
    217  
    218  
    219  
    220  
    221  
    222  
    223  
    224  
    225  
    226  
    227  
    228  
    229  
    230  
    231  
    232  
    233  
    234  
    235  
    236  
    237  
    238  
    239  
    240  
    241  
    242  
    243  
    244  
    245  
    246  
    247  
    248  
    249  
    250  
    251  
    252  
    253  
    254  
    255  
    256  
    257  
    258  
    259  
    260  
    261  
    262  
    263  
    264  
    265  
    266  
    267  
    268  
    269  
    270  
    271  
    272  
    273  
    274  
    275  
    276  
    277  
    278  
    279  
    280  
    281  
    282  
    283  
    284  
    285  
    286  
    287  
    288  
    289  
    290  
    291  
    292  
    293  
    294  
    295  
    296  
    297  
    298  
    299  
    300  
    301  
    302  
    303  
    304  
    305  
    306  
    307  
    308  
    309  
    310  
    311  
    312  
    313  
    314  
    315  
    316  
    317  
    318  
    319  
    320  
    321  
    322  
    323  
    324  
    325  
    326  
    327  
    328  
    329  
    330  
    331  
    332  
    333  
    334  
    335  
    336  
    337  
    338  
    339  
    340  
    341  
    342  
    343  
    344  
    345  
    346  
    347  
    348  
    349  
    350  
    351  
    352  
    353  
    354  
    355  
    

| 
    
    
    <template>  
      
      <div class="card content-box">  
      
        <div class="page-tag-title">设备绑定</div>  
      
        <div class="table-box">  
      
          <el-form :inline="true" :model="formInline">  
      
            <el-form-item label="">  
      
              <el-select v-model="formInline.name" placeholder="请选择搜索类型" style="width: 240px">  
      
                <el-option v-for="(item, index) in columnOptions" :key="index" :label="item.label" :value="item.value" />  
      
              </el-select>  
      
            </el-form-item>  
      
            <el-form-item label="">  
      
              <el-input v-model="formInline.netSegment" placeholder="请输入搜索关键字" style="width: 260px" clearable />  
      
            </el-form-item>  
      
            <el-form-item>  
      
              <el-button color="#1F63FF" :icon="Search" @click="onSearch">查询</el-button>  
      
              <el-button color="#1F63FF" :icon="Plus" @click="onBinding">绑定</el-button>  
      
            </el-form-item>  
      
          </el-form>  
      
          <el-table border :data="tableData" row-key="id" :span-method="spanMethod">  
      
            <template v-for="(propsItem, index) in columnOptions" :key="index">  
      
              <el-table-column :prop="propsItem.value" :label="propsItem.label">  
      
                <template #default="{ row }">  
      
                  <el-input v-model="row[propsItem.value]" placeholder="输入内容"></el-input>  
      
                </template>  
      
              </el-table-column>  
      
            </template>  
      
            <el-table-column prop="total2" label="操作" width="200" fixed="right">  
      
              <template #default="scope">  
      
                <el-button size="small" color="#1F63FF" @click="addRowBelow(scope.$index)">添加行</el-button>  
      
                <el-button size="small" color="#1F63FF" plain @click="editHandle(scope.row)">编辑</el-button>  
      
                <el-button size="small" type="danger" plain @click="deleteHandle(scope.row)">删除</el-button>  
      
              </template>  
      
            </el-table-column>  
      
          </el-table>  
      
          <el-pagination v-model:current-page="page.pageNum" v-model:page-size="page.pageSize"  
      
            :page-sizes="[10, 25, 50, 100]" :background="true" layout="total, sizes, prev, pager, next, jumper"  
      
            :total="page.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />  
      
        </div>  
      
        <BindingDialog ref="bindingDialogRef" />  
      
      </div>  
      
    </template>  
      
        
      
    <script setup lang="tsx">  
      
    import { ref, reactive } from "vue";  
      
    import { Delete, Plus, Search } from "@element-plus/icons-vue";  
      
    import BindingDialog from "./components/bindingDialog.vue";  
      
        
      
    const bindingDialogRef = ref();  
      
    const formInline = reactive({  
      
      name: "",  
      
      netSegment: ""  
      
    });  
      
    const columnOptions = ref([  
      
      { label: "设备唯一标识", value: "unitDeviceCode" },  
      
      { label: "设备负责人", value: "unitDeviceAdmin" },  
      
      { label: "电话", value: "unitDeviceAdminPhone" },  
      
      { label: "邮箱", value: "unitDeviceAdminEmail" },  
      
      { label: "硬件类型", value: "unitDeviceHardwareType" },  
      
      { label: "操作系统", value: "unitDeviceOperatingSystem" },  
      
      { label: "探针设备", value: "routeScannerName" },  
      
      { label: "IP地址", value: "unitDeviceIp" },  
      
      { label: "设备网关IP地址", value: "macIp" },  
      
      { label: "子网掩码长度", value: "subnetMaskLength" },  
      
    ]);  
      
        
      
    const page = reactive({  
      
      pageNum: 1,  
      
      pageSize: 10,  
      
      total: 0  
      
    });  
      
        
      
    const tableData = ref([  
      
      {  
      
        unitDeviceCode: "123456",  
      
        unitDeviceAdmin: "张三",  
      
        unitDeviceAdminPhone: "13800000000",  
      
        unitDeviceAdminEmail: "zhangsan@example.com",  
      
        unitDeviceHardwareType: "服务器",  
      
        unitDeviceOperatingSystem: "Linux",  
      
        routeScannerName: "探针设备1",  
      
        unitDeviceIp: "192.168.1.1",  
      
        macIp: "192.168.1.254",  
      
        subnetMaskLength: 24  
      
      },  
      
      // 添加初始数据项，您可以增加其他行  
      
      {  
      
        unitDeviceCode: "123456789",  
      
        unitDeviceAdmin: "李四",  
      
        unitDeviceAdminPhone: "1380000000",  
      
        unitDeviceAdminEmail: "zhangsan@exmple.com",  
      
        unitDeviceHardwareType: "服务器1",  
      
        unitDeviceOperatingSystem: "L1inux",  
      
        routeScannerName: "探针设备1",  
      
        unitDeviceIp: "192.168.1.1",  
      
        macIp: "192.168.1.254",  
      
        subnetMaskLength: 24  
      
      }  
      
    ]);  
      
        
      
    // 添加空行到指定索引的下方，并填充左侧字段  
      
    const addRowBelow = (index) => {  
      
      const newRow = {  
      
        unitDeviceCode: tableData.value[index].unitDeviceCode,  // 填充上一行的设备唯一标识  
      
        unitDeviceAdmin: tableData.value[index].unitDeviceAdmin,  // 填充上一行的设备负责人  
      
        unitDeviceAdminPhone: tableData.value[index].unitDeviceAdminPhone,  
      
        unitDeviceAdminEmail: tableData.value[index].unitDeviceAdminEmail,  
      
        unitDeviceHardwareType: tableData.value[index].unitDeviceHardwareType,  
      
        unitDeviceOperatingSystem: tableData.value[index].unitDeviceOperatingSystem,  
      
        routeScannerName: "",  // 其他从表字段留空  
      
        unitDeviceIp: "",  
      
        macIp: "",  
      
        subnetMaskLength: 0  
      
      };  
      
        
      
      tableData.value.splice(index + 1, 0, newRow);  
      
    };  
      
        
      
    // 表格单元格合并逻辑  
      
    const spanMethod = ({ row, column, rowIndex, columnIndex }) => {  
      
      // 判断合并左侧字段  
      
      const mergeColumns = ["unitDeviceCode", "unitDeviceAdmin", "unitDeviceAdminPhone", "unitDeviceAdminEmail", "unitDeviceHardwareType", "unitDeviceOperatingSystem"];  
      
      if (mergeColumns.includes(column.property)) {  
      
        // 如果当前行和上一行的值相同，合并  
      
        if (rowIndex > 0 && row[column.property] === tableData.value[rowIndex - 1][column.property]) {  
      
          return [0, 0]; // 不显示当前单元格  
      
        }  
      
        // 统计连续相同的行数  
      
        let rowspan = 1;  
      
        while (rowIndex + rowspan < tableData.value.length && tableData.value[rowIndex + rowspan][column.property] === row[column.property]) {  
      
          rowspan++;  
      
        }  
      
        return [rowspan, 1];  
      
      }  
      
      return [1, 1]; // 默认不合并其他字段  
      
    };  
      
        
      
    const onSearch = () => {  
      
      console.log("搜索!");  
      
    };  
      
        
      
    const onBinding = () => {  
      
      bindingDialogRef.value.openDialog();  
      
      console.log("绑定===");  
      
    };  
      
        
      
    const editHandle = rowData => {  
      
      console.log("编辑===", rowData);  
      
    };  
      
        
      
    const deleteHandle = rowData => {  
      
      console.log("删除===", rowData);  
      
    };  
      
        
      
    const handleSizeChange = val => {  
      
      page.pageSize = val;  
      
    };  
      
        
      
    const handleCurrentChange = val => {  
      
      page.pageNum = val;  
      
    };  
      
    </script>  
      
        
      
    <style scoped lang="scss">  
      
    .page-tag-title {  
      
      width: 100%;  
      
      padding-bottom: 20px;  
      
      font-size: 18px;  
      
      color: #292929;  
      
    }  
      
        
      
    .demo-form-inline .el-input {  
      
      --el-input-width: 220px;  
      
    }  
      
        
      
    .demo-form-inline .el-select {  
      
      --el-select-width: 220px;  
      
    }  
      
    </style>  
      
  
---|---  
  
### 实现效果如下

![](https://kwydy.oss-cn-guangzhou.aliyuncs.com/doudou/202411051738543.png)
