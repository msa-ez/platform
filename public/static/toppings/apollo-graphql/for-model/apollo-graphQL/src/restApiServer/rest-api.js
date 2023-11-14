forEach: BoundedContext
fileName: {{nameCamelCase}}-rest-api.js
path: apollo-graphQL/src/restApiServer
---
import {RESTDataSource} from 'apollo-datasource-rest';

class {{nameCamelCase}}RestApi extends RESTDataSource {
    constructor() {
        super();
        // dev for Local
            this.baseURL = 'http://localhost:{{portGenerated}}';
        // dev for IDE
            // this.baseURL = 'http://{{portGenerated}}-ide-xxxxxxxxxx.kuberez.io'
        // prod
            // this.baseURL = 'https://{{name}}:8080';
    }

{{#aggregates}}
    async get{{#toPascalCase namePlural}}{{/toPascalCase}}() {
        const data = await this.get('/{{namePlural}}', {})
        var value = this.stringToJson(data);
        // return retunVal
        return value._embedded.{{namePlural}};
    }

    // GET
    async get{{namePascalCase}}(id) {
        const data = await this.get(`/{{namePlural}}/${id}`, {})
        var value = this.stringToJson(data);
        return value;
    }
{{/aggregates}}

    stringToJson(str){
        if(typeof str == 'string'){
            str = JSON.parse(str);
        }
        return str;
    }
}

export default {{nameCamelCase}}RestApi;




<function>
    window.$HandleBars.registerHelper('toPascalCase', function (str) {
        if(str){
            return str.replace(new RegExp(/[-_]+/, 'g'), ' ')
                .replace(new RegExp(/[^\w\s]/, 'g'), '')
                .replace(
                    new RegExp(/\s+(.)(\w*)/, 'g'),
                    ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
                )
                .replace(new RegExp(/\w/), s => s.toUpperCase());
        }
        return str;
    });
</function>