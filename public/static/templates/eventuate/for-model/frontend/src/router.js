path: frontend/src
---

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);


{{#boundedContexts}}
    {{#aggregates}}
import {{namePascalCase}}Manager from "./components/listers/{{namePascalCase}}Cards"
import {{namePascalCase}}Detail from "./components/listers/{{namePascalCase}}Detail"
    {{/aggregates}}

    {{#views}}
import {{namePascalCase}}View from "./components/{{namePascalCase}}View"
import {{namePascalCase}}ViewDetail from "./components/{{namePascalCase}}ViewDetail"
    {{/views}}
{{/boundedContexts}}

export default new Router({
    // mode: 'history',
    base: process.env.BASE_URL,
    routes: [
       {{#boundedContexts}}
        {{#aggregates}}
            {
                path: '/{{namePlural}}',
                name: '{{namePascalCase}}Manager',
                component: {{namePascalCase}}Manager
            },
            {
                path: '/{{namePlural}}/:id',
                name: '{{namePascalCase}}Detail',
                component: {{namePascalCase}}Detail
            },
        {{/aggregates}}

        {{#views}}
            {
                path: '/{{namePlural}}',
                name: '{{namePascalCase}}View',
                component: {{namePascalCase}}View
            },
            {
                path: '/{{namePlural}}/:id',
                name: '{{namePascalCase}}ViewDetail',
                component: {{namePascalCase}}ViewDetail
            },
        {{/views}}
       {{/boundedContexts}}


    ]
})
