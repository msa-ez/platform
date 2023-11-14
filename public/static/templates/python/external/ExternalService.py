forEach: RelationCommandInfo
fileName: {{commandValue.aggregate.namePascalCase}}Service.py
path: {{boundedContext.name}}/external
---
from external.{{commandValue.aggregate.namePascalCase}} import {{commandValue.aggregate.namePascalCase}}
import requests
import json

{{#MethodGet commandValue.restRepositoryInfo.method}}
def {{commandValue.namePascalCase}}(id):
	headers = {'Content-Type':'application/json'}
	ip = "http://localhost:"
	port = "### this should be changed ###"
	target = "/{{commandValue.aggregate.namePlural}}/"+str(id)
	address = ip+port+target

	response = requests.get(address, headers=headers)
	response = response.content.decode('utf8').replace("'", '"')
	
	return response
{{/MethodGet}}

{{#MethodPost commandValue.restRepositoryInfo.method}}
def {{commandValue.namePascalCase}}(obj):
	headers = {'Content-Type':'application/json'}
	ip = "http://localhost:"
	port = "### this should be changed ###"
	target = "/{{commandValue.aggregate.namePlural}}"
	address = ip+port+target
	data = json.dumps(obj.__dict__)
	response = requests.post(address,data=data, headers=headers)
	response = response.content.decode('utf8').replace("'", '"')
	'''
    LOGIC GOES HERE
    '''

	return response
{{/MethodPost}}

{{#MethodUpdate commandValue.restRepositoryInfo.method}}
def {{commandValue.namePascalCase}}(id, obj):
	headers = {'Content-Type':'application/json'}
	ip = "http://localhost:"
	port = "### this should be changed ###"
	target = "/{{commandValue.aggregate.namePlural}}/"+str(id)
	data = json.dumps(obj.__dict__)
	response = requests.put(address,data=data, headers=headers)
	response = response.content.decode('utf8').replace("'", '"')

	return response
{{/MethodUpdate}}

{{#MethodDelete commandValue.restRepositoryInfo.method}}
def {{commandValue.namePascalCase}}(id):
	headers = {'Content-Type':'application/json'}
	ip = "http://localhost:"
	port = "### this should be changed ###"
	target = "/{{commandValue.aggrgate.namePlural}}/"+str(id)

	response = requests.delete(address, headers=headers)
	
	return response
{{/MethodDelete}}	

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