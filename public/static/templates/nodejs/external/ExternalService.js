forEach: RelationCommandInfo
fileName: {{commandValue.aggregate.namePascalCase}}Service.js
path: {{boundedContext.name}}/external
---
const request = require('request');

{{#MethodGet commandValue.restRepositoryInfo.method}}
function {{commandValue.namePascalCase}}(callback){
    var options = {
        uri : 'http://localhost:8080/{{commandValue.boundedContext.namePlural}}',
        json : true
    };

    request.get(options, function(error, response, body){
        return callback(body);
    });
}
{{/MethodGet}}

{{#MethodPost commandValue.restRepositoryInfo.method}}
function {{commandValue.namePascalCase}}(data, callback){
    var options = {
        uri : 'http://localhost:8080/{{commandValue.boundedContext.namePlural}}',
        body : data,
        json : true
    };

    request.post(options, function(error, response, body){
        return callback(body);
    })
}
{{/MethodPost}}

{{#MethodUpdate commandValue.restRepositoryInfo.method}}
function {{commandValue.namePascalCase}}(id, data, callback){
    var options = {
        uri : 'http://localhost:8080/{{commandValue.boundedContext.namePlural}}/'+id,
        body : data,
        json : true
    };

    request.put(options, function(error, response, body){
        return callback(body);
    })
}
{{/MethodUpdate}}

{{#MethodDelete commandValue.restRepositoryInfo.method}}
function {{commandValue.namePascalCase}}(id, callback){
    var options = {
        uri : 'http://localhost:8080/{{commandValue.boundedContext.namePlural}}/'+id,
        body : data,
        json : true
    };

    request.delete(options, functino(error, response, body){
        return callback(body);
    })
}
{{/MethodDelete}}

module.exports = {{commandValue.namePascalCase}}

<function>
	window.$HandleBars.registerHelper('MethodGet', function(method, options){
        if(method.endsWith('GET')){
        	return options.fn(this)
		}
		else{
			return options.inverse(this)
		}
    });
	window.$HandleBars.registerHelper('MethodPost', function(method, options){
        if(method.endsWith('POST')){
        	return options.fn(this)
		}
		else{
			return options.inverse(this)
		}
    });
	window.$HandleBars.registerHelper('MethodUpdate', function(method, options){
        if(method.endsWith('PUT')){
        	return options.fn(this)
		}
		else{
			return options.inverse(this)
		}
    });
	window.$HandleBars.registerHelper('MethodDelete', function(method, options){
        if(method.endsWith('DELETE')){
        	return options.fn(this)
		}
		else{
			return options.inverse(this)
		}
    });
</function>