path: frontend/src
---

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);


{{#boundedContexts}}
    {{#aggregates}}
import {{namePascalCase}}Manager from "./components/{{namePascalCase}}Manager"
    {{/aggregates}}

    {{#views}}
import {{namePascalCase}} from "./components/{{namePascalCase}}"
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
        {{/aggregates}}

        {{#views}}
            {
                path: '/{{namePlural}}',
                name: '{{namePascalCase}}',
                component: {{namePascalCase}}
            },
        {{/views}}
       {{/boundedContexts}}


    ]
})
