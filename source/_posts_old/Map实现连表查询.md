---
title: Map实现连表查询
date: 2021-12-01 00:00:00
tags:
  - java
---

通过Map实现连表查询
    
    
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
    
    
    @GetMapping("product/edit")    
    public String productEdit(String id, Model model) {    
        ProjectInfo projectInfo = Opt.ofNullable(id).map(ProjectInfo.builder().build()::selectById).orElseGet(() -> ProjectInfo.builder().build());    
        List<MemberInfo> members = MemberInfo.builder().build().selectList(Wrappers.lambdaQuery(MemberInfo.builder().status(MemberInfoStatusEnum.AUTHORIZED).build()));    
        List<ProjectCategory> categories = ProjectCategory.builder().build().selectAll();    
        Map<Long, MemberInfo> memberMap = SimpleQuery.list2Map(members, MemberInfo::getId, Function.identity());    
        Map<Long, ProjectCategory> projects = SimpleQuery.list2Map(categories, ProjectCategory::getId, Function.identity());    
        ProjectVO vo = BeanUtils.copyProperties(projectInfo, ProjectVO::new);    
        vo.setMemberInfo(memberMap.get(projectInfo.getMemberId()));    
        vo.setCategory(projects.get(projectInfo.getCategoryId()));    
        model.addAttribute(AttrKeyConst.MEMBERS, members);    
        model.addAttribute(AttrKeyConst.CATEGORIES, projects);    
        model.addAttribute(AttrKeyConst.DETAIL, vo);    
        return "admin/product/edit";    
    }  
      
  
---|---
