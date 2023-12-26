// const swagger = require('swagger-parser');
const yamlParser = require('js-yaml')

const Gitlab = require('../../../utils/Gitlab')
const GitAPI = require('../../../utils/GitAPI')
const Github = require('../../../utils/Github')

class OpenAPIToPBC {

    constructor(options){
        if(!options) options={}
    }

    async call(value){
        let yaml = value;
        if(value.startsWith('https://') || value.startsWith('http://') ){
            this.git = null;

            this.gitAPI = new GitAPI();

            const githubRegex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/main\/(.+)$/;
            const match = value.match(githubRegex);
            if (match) {
                // Extracted values
                const owner = match[1];
                const repository = match[2];
                const filePath = match[3];
                let response = await this.gitAPI.getFile(owner, repository, filePath)
                yaml = response.data
            } else {
                alert('Invalid GitHub URL format.')
                console.log('Invalid GitHub URL format');
                return null;
            }
        }
        //string, object
        return await this.convert(yaml);
    }

    async convert(yaml){
        try{
            const parser = yamlParser.load(yaml); // testYaml
            // const parser = await swagger.parse(yaml);
            if(parser){
                let result = {
                    info: null,
                    read: [],
                    command: [],
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
                            }  else {
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