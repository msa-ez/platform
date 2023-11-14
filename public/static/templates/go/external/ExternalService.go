forEach: RelationCommandInfo
fileName: {{commandValue.aggregate.namePascalCase}}Service.go
path: {{boundedContext.name}}/external
---
package external 

import (
	"errors"
	"fmt"
	"github.com/go-resty/resty/v2"
	"order/config"
)

var client = resty.New()

{{#if commandValue.restRepositoryInfo.getMethod}}
func Get{{commandValue.aggregate.namePascalCase}}( {{commandValue.aggregate.keyFieldDescriptor.name}} {{#typeCheck commandValue.aggregate.keyFieldDescriptor.className}} {{/typeCheck}}) (*resty.Response, error) {
	options := config.Reader(config.GetMode())
	target := fmt.Sprintf("https://%s/%s/%s", options["api_url_{{commandValue.boundedContext.name}}"], "{{commandValue.aggregate.namePlural}}" , {{commandValue.aggregate.keyFieldDescriptor.name}} )
	resp, err := client.R().Get(target)
	if err != nil {
		return nil, err
	}
	if resp == nil {
		errorMsg := fmt.Sprintf("target url: %s return data is nil", target)
		return nil, errors.New(errorMsg)
	}
	if resp.StatusCode() != 200 {
		errorMsg := fmt.Sprintf("target url: %s StatusCode: %v", target, resp.StatusCode())
		return nil, errors.New(errorMsg)
	}

	return resp, nil

}
{{else if commandValue.restRepositoryInfo.method}}
{{#commandValue.isRestRepository}}
func {{commandValue.nameCamelCase}}({{commandValue.aggregate.nameCamelCase}} {{commandValue.aggregate.namePascalCase}}) (*resty.Response, error){
	{{#MethodPost commandValue.restRepositoryInfo.method}}
	options := config.Reader(config.GetMode())
	target := fmt.Sprintf("https://%s/%s", options["api_url_{{commandValue.boundedContext.name}}"], "{{commandValue.aggregate.namePlural}}" )
	resp, _ := client.R().SetBody({{commandValue.aggregate.nameCamelCase}}).Post(target)

	return resp, nil
	{{/MethodPost}}

	{{#MethodGet commandValue.restRepositoryInfo.method}}
	options := config.Reader(config.GetMode())
	target := fmt.Sprintf("https://%s/%s/%s", options["api_url_{{commandValue.boundedContext.name}}"], "{{commandValue.aggregate.namePlural}}" , {{commandValue.aggregate.nameCamelCase}} )
	resp, _ := client.R().Get(target)
	return resp, nil
	{{/MethodGet}}

	{{#MethodUpdate commandValue.restRepositoryInfo.method}}
	options := config.Reader(config.GetMode())
	target := fmt.Sprintf("https://%s/%s", options["api_url_{{commandValue.boundedContext.name}}"], "{{commandValue.aggregate.namePlural}}" )
	resp, _ := client.R().SetBody({{commandValue.aggregate.nameCamelCase}}).Put(target)
	return resp, nil
	{{/MethodUpdate}}

	{{#MethodDelete commandValue.restRepositoryInfo.method}}
	options := config.Reader(config.GetMode())
	target := fmt.Sprintf("https://%s/%s/%s", options["api_url_{{commandValue.boundedContext.name}}"], "{{commandValue.aggregate.namePlural}}" , {{commandValue.aggregate.nameCamelCase}} )
	resp, _ := client.R().Delete(target)

	return resp, nil
	{{/MethodDelete}}
}
{{/commandValue.isRestRepository}}
{{^commandValue.isRestRepository}}
func {{commandValue.namePascalCase}}({{commandValue.aggregate.nameCamelCase}} {{commandValue.aggregate.namePascalCase}}) (*resty.Response, error){
	{{#MethodPost commandValue.controllerInfo.method}}
	options := config.Reader(config.GetMode())
	target := fmt.Sprintf("https://%s/%s", options["api_url_{{commandValue.boundedContext.name}}"], "{{commandValue.aggregate.namePlural}}" )
	resp, _ := client.R().SetBody({{commandValue.aggregate.nameCamelCase}}).Post(target)

	return resp, nil
	{{/MethodPost}}
	{{#MethodGet commandValue.controllerInfo.method}}
	options := config.Reader(config.GetMode())
	target := fmt.Sprintf("https://%s/%s/%s/%s", options["api_url_{{commandValue.boundedContext.name}}"], "{{commandValue.aggregate.namePlural}}" ,{{commandValue.aggregate.nameCamelCase}}.{{commandValue.aggregate.keyFieldDescriptor.namePascalCase}} ,{{commandValue.controllerInfo.apiPath}} )
	resp, _ := client.R().Get(target)

	return resp, nil
	{{/MethodGet}}
	{{#MethodUpdate commandValue.controllerInfo.method}}
	options := config.Reader(config.GetMode())
	target := fmt.Sprintf("https://%s/%s", options["api_url_{{commandValue.boundedContext.name}}"], "{{commandValue.aggregate.namePlural}}" )
	resp, _ := client.R().SetBody({{commandValue.aggregate.nameCamelCase}}).Put(target)

	return resp, nil
	{{/MethodUpdate}}
	{{#MethodDelete commandValue.controllerInfo.method}}
	options := config.Reader(config.GetMode())
	target := fmt.Sprintf("https://%s/%s/%s/%s", options["api_url_{{commandValue.boundedContext.name}}"], "{{commandValue.aggregate.namePlural}}" , {{commandValue.aggregate.nameCamelCase}}.{{commandValue.aggregate.keyFieldDescriptor.namePascalCase}} ,{{commandValue.controllerInfo.apiPath}})
	resp, _ := client.R().Delete(target)

	return resp, nil
	{{/MethodDelete}}
}
{{/commandValue.isRestRepository}}
{{else}}
func Get{{commandValue.aggregate.namePascalCase}}( {{commandValue.aggregate.keyFieldDescriptor.name}} {{#typeCheck commandValue.aggregate.keyFieldDescriptor.className}} {{/typeCheck}}) (*resty.Response, error){
	options := config.Reader(config.GetMode())
	target := fmt.Sprintf("https://%s/%s/%s", options["api_url_{{commandValue.boundedContext.name}}"], "{{commandValue.aggregate.namePlural}}" , {{commandValue.aggregate.keyFieldDescriptor.name}} )
	resp, err := client.R().Get(target)
	if err != nil {
		return nil, err
	}
	if resp == nil {
		errorMsg := fmt.Sprintf("target url: %s return data is nil", target)
		return nil, errors.New(errorMsg)
	}
	if resp.StatusCode() != 200 {
		errorMsg := fmt.Sprintf("target url: %s StatusCode: %v", target, resp.StatusCode())
		return nil, errors.New(errorMsg)
	}

	return resp, nil
}
{{/if}}

<function>
	window.$HandleBars.registerHelper('MethodGet', function(method, options){
        if(method && method.endsWith('GET')){
        	return options.fn(this)
		}
		else{
			return options.inverse(this)
		}
    });
	window.$HandleBars.registerHelper('MethodPost', function(method, options){
        if(method && method.endsWith('POST')){
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
	 window.$HandleBars.registerHelper('typeCheck', function (className) {
        if(className.endsWith("String")){
            return "string"
        }
		else if(className.endsWith("Integer")){
			return "int"
		}
		else if(className.endsWith("Float")){
			return "float64"
		}
		else if(className.endsWith("Long")){
			return "int"
		}
		else if(className.endsWith("Boolean")){
			return "bool"
		}
		else if(className.endsWith("Double")){
			return "int"
		}

    });
</function>