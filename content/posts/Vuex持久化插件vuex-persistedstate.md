---
title: Vuex持久化插件(vuex-persistedstate)
date: 2022-12-15 00:00:00
tags:
  - vue
---

## 这篇文章主要介绍了Vuex持久化插件(vuex-persistedstate)-解决刷新数据消失的问题

### 今天写项目的时候遇到一个问题，我刷新页面数据丢失

在F5刷新页面后，vuex会重新更新state，所以，存储的数据会丢失。

vuex可以进行全局的状态管理，但刷新后刷新后数据会消失，这是我们不愿意看到的。怎么解决呢，我们可以结合本地存储做到数据持久化，也可以通过插件-vuex-persistedstate。

### 使用步骤

1. 首先：我们需要安装一个vuex的插件 vuex-persistedstate 来支持vuex的状态持久化

```plaintext
npm i vuex-persistedstate
```

1. 在 src/store/index.js 中导入 createPersistedState 模块。

```plaintext
// 引入vuex持久化方法createPersistedState  
import createPersistedState from 'vuex-persistedstate'
```

1. 最后：使用vuex-persistedstate插件来进行持久化

```js
import vue from 'vue'  
import Vuex from 'vuex'  
import router, {resetRouter} from "../router";  
// 引入vuex持久化方法createPersistedState  
import createPersistedState from 'vuex-persistedstate'  
  
vue.use(Vuex)  
  
function addNewRoute(menuList) {
    let routes = router.options.routes  
    console.log(routes)  
    routes.forEach(routeItem => {  
        if (routeItem.path == "/Index") {  
            menuList.forEach(menu => {  
                let childRoute = {  
                    path: '/' + menu.menuclick,  
                    name: menu.menuname,  
                    meta: {  
                        title: menu.menuname  
                    },  
                    component: () => import('../components/' + menu.menucomponent)  
                }  
  
                routeItem.children.push(childRoute)  
            })  
        }  
    })  
  
    resetRouter()  
    router.addRoutes(routes)  
}  
  
export default new Vuex.Store({  
    state: {  
        menu: []  
    },  
    mutations: {  
        setMenu(state, menuList) {  
            state.menu = menuList  
            //添加路由  
            addNewRoute(menuList)  
        }  
    },  
    getters: {  
        getMenu(state) {  
            return state.menu  
        }  
    },  
    plugins: [  
        createPersistedState()  
    ]  
})
```