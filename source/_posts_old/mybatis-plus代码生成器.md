---
title: mybatis-plus代码生成器
date: 2021-12-18 00:00:00
tags:
  - mybatis-plus
---

导入依赖
    
    
    1  
    2  
    3  
    4  
    5  
    

| 
    
    
    <dependency>    
        <groupId>com.baomidou</groupId>    
        <artifactId>mybatis-plus-generator</artifactId>    
        <version>3.5.1</version>    
    </dependency>  
      
  
---|---  
      
    
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
    

| 
    
    
    package com.ruben;    
        
    import com.baomidou.mybatisplus.annotation.IdType;    
    import com.baomidou.mybatisplus.generator.FastAutoGenerator;    
    import com.baomidou.mybatisplus.generator.config.DataSourceConfig;    
    import com.baomidou.mybatisplus.generator.config.TemplateType;    
    import com.baomidou.mybatisplus.generator.config.rules.NamingStrategy;    
    import org.junit.jupiter.api.Test;    
        
    /**    
     * 生成器配置    
     *    
     * @author <achao1441470436@gmail.com>    
     * @since 2021/10/5 16:38    
     */    
    public class GeneratorTests {    
        
        /**    
         * 生成代码的表名    
         */    
        private static final String TABLE_NAME = "user_info";    
        
        /**    
         * 数据库相关配置    
         */    
        private static final String JDBC_URL = "jdbc:mysql://localhost:3306/demo?useUnicode=true&characterEncoding=utf-8&useSSL=false&nullCatalogMeansCurrent=true&serverTimezone=Asia/Shanghai";    
        private static final String USERNAME = "root";    
        private static final String PASSWORD = "root";    
        
        /**    
         * 注释显示的作者    
         */    
        private static final String AUTHOR = "<achao1441470436@gmail.com>";    
        
        /**    
         * 代码生成指定包名    
         */    
        private static final String PACKAGE_NAME = "com.ruben";    
        
        /**    
         * 指定代码生成路径    
         */    
        private static final String OUTPUT_DIR = "D:\\file\\tmp\\generator\\output";    
        
        /**    
         * 模板存放路径    
         */    
        private static final String TEMPLATE_PATH = "./static/generator/";    
        
        @Test    
        public void generate() {    
            System.out.println(OUTPUT_DIR);    
            FastAutoGenerator.create(new DataSourceConfig.Builder(JDBC_URL, USERNAME, PASSWORD))    
                    // 全局配置    
                    .globalConfig(builder -> builder.author(AUTHOR).fileOverride().outputDir(OUTPUT_DIR))    
                    // 包配置    
                    .packageConfig(builder -> builder.parent(PACKAGE_NAME))    
                    // 策略配置    
                    .strategyConfig(builder -> builder    
                            // 指定表名，如不指定，则默认生成所有    
    //                        .addInclude(TABLE_NAME)    
                            .controllerBuilder().enableRestStyle()    
                            .serviceBuilder()    
                            .entityBuilder()    
                            // 指定父类    
                            .superClass(PACKAGE_NAME + ".pojo.common.BaseEntity")    
                            // 添加父类字段    
                            .addSuperEntityColumns("is_deleted", "gmt_create", "gmt_modified", "tenant_id")    
                            // 开启AR模式    
                            .enableActiveRecord()    
                            // ID类型，这里IdType是个枚举    
                            .idType(IdType.AUTO)    
                            // 表名命名转换，这里是下划线转驼峰    
                            .naming(NamingStrategy.underline_to_camel)    
                            // 表字段名转换，下划线转驼峰    
                            .columnNaming(NamingStrategy.underline_to_camel)    
                            // 开启lombok    
                            .enableLombok()    
                            // 开启链式编程 （与BeanCopier冲突）    
                            .enableChainModel())    
                    // 不生成xml    
                    .templateConfig(builder -> builder.disable(TemplateType.XML)    
                            .controller(TEMPLATE_PATH + "controller.java.vm")    
                            .entity(TEMPLATE_PATH + "entity.java.vm")    
                            .mapper(TEMPLATE_PATH + "mapper.java.vm")    
                            .service(TEMPLATE_PATH + "service.java.vm")    
                            .serviceImpl(TEMPLATE_PATH + "serviceImpl.java.vm")    
                    )    
                    // 自定义模板位置    
                    .execute();    
        }    
    }  
      
  
---|---  
  
以及自己使用的`controller`的模板：
    
    
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
    

| 
    
    
    package ${package.Controller};    
        
        
        
    #if(${restControllerStyle})    
    import com.baomidou.mybatisplus.core.metadata.IPage;    
    import com.baomidou.mybatisplus.core.toolkit.Wrappers;    
    import com.baomidou.mybatisplus.extension.plugins.pagination.Page;    
    import com.ruben.pojo.common.Result;    
    import ${package.Entity}.${entity};    
    import ${package.Service}.${table.serviceName};    
    import org.springframework.validation.annotation.Validated;    
    import org.springframework.web.bind.annotation.*;    
        
    import javax.annotation.Resource;    
    #else    
    import org.springframework.stereotype.Controller;    
    #end    
    #if(${superControllerClassPackage})    
    import ${superControllerClassPackage};    
    #end    
        
    /**    
     * <p>    
     * $!{table.comment} 前端控制器    
     * </p>    
     *    
     * @author ${author}    
     * @since ${date}    
     */    
    #if(${restControllerStyle})    
    @RestController    
    #else    
    @Controller    
    #end    
    @RequestMapping("#if(${package.ModuleName})/${package.ModuleName}#end/#if(${controllerMappingHyphenStyle})${controllerMappingHyphen}#else${table.entityPath}#end")    
    #if(${kotlin})    
    class ${table.controllerName}#if(${superControllerClass}) : ${superControllerClass}()#end    
        
    #else    
    #if(${superControllerClass})    
    public class ${table.controllerName} extends ${superControllerClass} {    
    #else    
    public class ${table.controllerName} {    
    #end    
        #set($serviceBeanName = $table.serviceName.substring(1,2).toLowerCase() + $table.serviceName.substring(2))    
        #set($entityName = $entity.substring(0,1).toLowerCase() + $entity.substring(1))    
        
        @Resource    
        private ${table.serviceName} ${serviceBeanName};    
        
        /**    
         * 查询单条记录    
         *    
         * @param id 主键    
         * @return 记录    
         * @since ${date}    
         * @author ${author}    
         */    
        @GetMapping    
        public Result get(@RequestParam("id") Long id){    
             return Result.ok().data(${entity}.builder().build().setId(id).selectById());    
        }    
        
        /**    
         * 查询列表    
         *    
         * @param page 分页参数?size=10&current=1    
         * @return 分页结果    
         * @since ${date}    
         * @author ${author}    
         */    
        @GetMapping("page")    
        public Result page(Page<${entity}> page, ${entity} ${entityName}){    
            return Result.ok().data(${entityName}.selectPage(page,Wrappers.lambdaQuery(${entityName})));    
        }    
        
        /**    
         * 新增    
         *    
         * @param ${entityName} 数据    
         * @since ${date}    
         * @author ${author}    
         */    
        @PostMapping    
        public Result insert(@RequestBody @Validated ${entity} ${entityName}){    
            ${entityName}.insert();    
            return Result.ok();    
        }    
        
        /**    
         * 更新不为null的部分    
         *    
         * @param ${entityName} 数据    
         * @since ${date}    
         * @author ${author}    
         */    
        @PatchMapping    
        public Result updateSelective(@RequestBody @Validated ${entity} ${entityName}){    
            ${entityName}.updateById();    
            return Result.ok();    
        }    
        
        /**    
         * 根据主键删除    
         *    
         * @param id 主键    
         * @since ${date}    
         * @author ${author}    
         */    
        @DeleteMapping    
        public Result delete(@RequestParam("id") Long id){    
            ${entity}.builder().build().setId(id).deleteById();    
            return Result.ok();    
        }    
        
        
    }    
        
    #end  
      
  
---|---  
  
`entity`的
    
    
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
    

| 
    
    
    package ${package.Entity};    
        
    #foreach($pkg in ${table.importPackages})    
    import ${pkg};    
    #end    
    #if(${swagger2})    
    import io.swagger.annotations.ApiModel;    
    import io.swagger.annotations.ApiModelProperty;    
    #end    
    #if(${entityLombokModel})    
    import lombok.*;    
        #if(${chainModel})    
        import lombok.experimental.Accessors;    
        #end    
    #end    
        
    /**    
     * <p>    
     * $!{table.comment}    
     * </p>    
     *    
     * @author ${author}    
     * @since ${date}    
     */    
    #if(${entityLombokModel})    
    @Data    
    @Builder    
    @NoArgsConstructor    
    @AllArgsConstructor    
        #if(${chainModel})    
        @Accessors(chain = true)    
        #end    
        #if(${superEntityClass})    
        @EqualsAndHashCode(callSuper = true)    
        #else    
        @EqualsAndHashCode(callSuper = false)    
        #end    
    #end    
    #if(${table.convert})    
    @TableName("${table.name}")    
    #end    
    #if(${swagger2})    
    @ApiModel(value = "${entity}对象", description = "$!{table.comment}")    
    #end    
    #if(${superEntityClass})    
    public class ${entity} extends ${superEntityClass}#if(${activeRecord})<${entity}>#end {    
    #elseif(${activeRecord})    
    public class ${entity} extends Model<${entity}> {    
    #else    
    public class ${entity} implements Serializable{    
    #end    
        
    #if(${entitySerialVersionUID})    
    private static final long serialVersionUID=1L;    
    #end    
    ## ----------  BEGIN 字段循环遍历  ----------    
    #foreach($field in ${table.fields})    
        
        #if(${field.keyFlag})    
            #set($keyPropertyName=${field.propertyName})    
        #end    
        #if("$!field.comment" != "")    
            #if(${swagger2})    
            @ApiModelProperty(value = "${field.comment}")    
            #else    
            /**    
             * ${field.comment}    
             */    
            #end    
        #end    
        #if(${field.keyFlag})    
            ## 主键    
            #if(${field.keyIdentityFlag})    
            @TableId(value = "${field.annotationColumnName}", type = IdType.AUTO)    
            #elseif(!$null.isNull(${idType}) && "$!idType" != "")    
            @TableId(value = "${field.annotationColumnName}", type = IdType.${idType})    
            #elseif(${field.convert})    
            @TableId("${field.annotationColumnName}")    
            #end    
            ## 普通字段    
        #elseif(${field.fill})    
            ## -----   存在字段填充设置   -----    
            #if(${field.convert})    
            @TableField(value = "${field.annotationColumnName}", fill = FieldFill.${field.fill})    
            #else    
            @TableField(fill = FieldFill.${field.fill})    
            #end    
        #elseif(${field.convert})    
        @TableField("${field.annotationColumnName}")    
        #end    
        ## 乐观锁注解    
        #if(${field.versionField})    
        @Version    
        #end    
        ## 逻辑删除注解    
        #if(${field.logicDeleteField})    
        @TableLogic    
        #end    
    private ${field.propertyType} ${field.propertyName};    
    #end    
    ## ----------  END 字段循环遍历  ----------    
        
    #if(!${entityLombokModel})    
        #foreach($field in ${table.fields})    
            #if(${field.propertyType.equals("boolean")})    
                #set($getprefix="is")    
            #else    
                #set($getprefix="get")    
            #end    
        
        public ${field.propertyType} ${getprefix}${field.capitalName}(){    
                return ${field.propertyName};    
                }    
        
            #if(${chainModel})    
            public ${entity} set${field.capitalName}(${field.propertyType} ${field.propertyName}){    
            #else    
            public void set${field.capitalName}(${field.propertyType} ${field.propertyName}) {    
            #end    
                this.${field.propertyName} = ${field.propertyName};    
            #if(${chainModel})    
                    return this;    
            #end    
                }    
        #end    
        ## --foreach end---    
    #end    
    ## --end of #if(!${entityLombokModel})--    
        
    #if(${entityColumnConstant})    
        #foreach($field in ${table.fields})    
        public static final String ${field.name.toUpperCase()} ="${field.name}";    
        
        #end    
    #end    
    #if(${activeRecord} && !${superEntityClass} )    
    @Override    
    protected Serializable pkVal(){    
        #if(${keyPropertyName})    
                return this.${keyPropertyName};    
        #else    
                return null;    
        #end    
            }    
        
    #end    
    #if(!${entityLombokModel})    
    @Override    
    public String toString() {    
            return "${entity}{" +    
        #foreach($field in ${table.fields})    
            #if($!{foreach.index}==0)    
                    "${field.propertyName}=" + ${field.propertyName} +    
            #else    
                    ", ${field.propertyName}=" + ${field.propertyName} +    
            #end    
        #end    
            "}";    
            }    
    #end    
            }  
      
  
---|---
