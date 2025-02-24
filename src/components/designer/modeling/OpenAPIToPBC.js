// const swagger = require('swagger-parser');
const yamlParser = require('js-yaml')

const Gitlab = require('../../../utils/Gitlab')
const GitAPI = require('../../../utils/GitAPI')
const Github = require('../../../utils/Github')

class OpenAPIToPBC {

    constructor(options){
        if(!options) options={}
    }

    async call(url){
        let value;
        if(url.startsWith('https://') || url.startsWith('http://') ){
            this.gitAPI = new GitAPI();

            const githubRegex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/main\/(.+)$/;
            const match = url.match(githubRegex);
            if (match) {
                // Extracted values
                const owner = match[1];
                const repository = match[2];
                const filePath = match[3];
                let response = await this.gitAPI.getFile(owner, repository, filePath)
                value = response.data
            } else {
                alert('Invalid GitHub URL format.')
                console.log('Invalid GitHub URL format');
                return null;
            }
        }
        if(url.endsWith('.json')){
            return await this.convertModel(value); //model.json
        } else {
            return await this.convertOpenAPI(value); //openapi.yaml
        }
       
    }
    convertModel(model){
        // model.json
        if(!model) return null;
        if(typeof model == 'string') model = JSON.parse(model);
        
        let result = {
            isModel: true,
            info: null,
            views: [],
            events: [],
            commands: [],
            boundedContextes: [],
            aggregates: [],
            relations: []
        }

        result.info = model
        // setting Elements
        Object.values(model.elements).forEach(function (element) {
            if (element) {
                var copyEl = JSON.parse(JSON.stringify(element));
                if (element._type.endsWith("Event")) {
                    result.events.push(copyEl);
                } else if (element._type.endsWith("Command")) {
                    result.commands.push(copyEl);
                } else if (element._type.endsWith("BoundedContext")) {
                    result.boundedContextes.push(copyEl);
                } else if (element._type.endsWith("Aggregate")) {
                    result.aggregates.push(copyEl);
                } else if (element._type.endsWith("View")) {
                    result.views.push(copyEl);
                }
            }
        });
        // setting Relation
        Object.values(model.relations).forEach(function (relation) {
            if (relation) {
                var copyRe = JSON.parse(JSON.stringify(relation));
                result.relations.push(copyRe);
            }
        });

        return result;
    }

    async convertOpenAPI(yaml){
        try{
            const parser = yamlParser.load(yaml); // testYaml
            // const parser = await swagger.parse(yaml);
            if(parser){
                let result = {
                    info: null,
                    read: [],
                    command: [],
                    events: [],
                    schemas: {}
                };

                if(parser.paths){
                    result.info = parser.info;

                    for (const path in parser.paths) {
                        const pathInfo = parser.paths[path];

                        for (const method in pathInfo) {
                            const methodInfo = pathInfo[method];

                            const extractedInfo = {
                                _path: path,
                                _method: method,
                                ...methodInfo,
                            };

                            if (method == 'get') {
                                result.read.push(extractedInfo);
                            } else {
                                result.command.push(extractedInfo);
                            }
                        }
                    }
                }

                if(parser.components){
                    result.schemas = parser.components.schemas
                }

                return result;
            }
            return null; // Can't find 'paths'.
        } catch (e) {
            return undefined; // Fail parser.
        }
    }

}

module.exports = OpenAPIToPBC;