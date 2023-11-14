forEach: ModelElements
fileName: resolvers.js
path: apollo-graphQL/src/graphql
---
const resolvers = {
{{#boundedContextes}}
    {{#aggregates}}
    {{name}}: {
        // set Query
    }
    {{/aggregates}}
{{/boundedContextes}}

    Query: {
{{#boundedContextes}}
    {{#aggregates}}
        {{nameCamelCase}} : async (_, { id }, { dataSources }) => {
            return dataSources.{{../nameCamelCase}}RestApi.get{{namePascalCase}}(id);
        },
        {{namePlural}} : async (_, __, { dataSources }) => {
            return dataSources.{{../nameCamelCase}}RestApi.get{{#toPascalCase namePlural}} {{/toPascalCase}}();
        },
    {{/aggregates}}
{{/boundedContextes}}
    }
};

export default resolvers;

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