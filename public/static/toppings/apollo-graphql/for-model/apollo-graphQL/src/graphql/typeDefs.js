forEach: ModelElements
fileName: typeDefs.js
path: apollo-graphQL/src/graphql
---
import {gql} from 'apollo-server';

const typeDefs = gql`
    scalar Date
    scalar Long
    scalar Double
    scalar Integer

{{#boundedContextes}}
    {{#aggregates}}
    type {{name}} {
    {{#setPrimaryKey aggregateRoot.fieldDescriptors}}{{/setPrimaryKey}}
    }
    {{/aggregates}}
{{/boundedContextes}}

    type Query {
{{#boundedContextes}}
 {{#aggregates}}
      {{namePlural}}: [{{name}}]
      {{nameCamelCase}}(id: Long!): {{name}}
 {{/aggregates}}
{{/boundedContextes}}
    }
`;

export default typeDefs;


<function>
window.$HandleBars.registerHelper('setPrimaryKey', function (array) {
    if(array){
        var text = ''
        for (var i = 0; i< array.length; i++){
            var field = array[i];
            if(field.isKey){
                text = text + `\t${field.name}: ${field.className}!`;
            }else{
                text = text + `\t\t\t${field.name}: ${field.className}`;
            }

            if( i != array.length - 1){
                text = text + ' \n';
            }
        }
        return text;
    }
    return array;
});
</function>