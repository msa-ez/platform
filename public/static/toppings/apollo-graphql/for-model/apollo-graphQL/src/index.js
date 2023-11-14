forEach: ModelElements
fileName: index.js
path: apollo-graphQL/src
---
import {ApolloServer} from 'apollo-server';
import resolvers from './graphql/resolvers.js';
import typeDefs from './graphql/typeDefs.js';
{{#boundedContextes}}
import {{nameCamelCase}}RestApi from './restApiServer/{{nameCamelCase}}-rest-api.js'
{{/boundedContextes}}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
{{#boundedContextes}}
        {{nameCamelCase}}RestApi: new {{nameCamelCase}}RestApi(),
{{/boundedContextes}}
    }),
});

server.listen({
    port: 8089,
}).then(({url}) => {
    console.log(`🚀  Server ready at ${url}`);
});
