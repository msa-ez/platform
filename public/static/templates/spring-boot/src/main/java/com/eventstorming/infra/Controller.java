forEach: Aggregate
representativeFor: Command
fileName: {{namePascalCase}}Controller.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/infra
mergeType: template
---
package {{options.package}}.infra;
import {{options.package}}.domain.*;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;

//<<< Clean Arch / Inbound Adaptor

@RestController
// @RequestMapping(value="/{{namePlural}}")
@Transactional
public class {{ namePascalCase }}Controller {
    @Autowired
    {{namePascalCase}}Repository {{nameCamelCase}}Repository;

    {{#if (checkGeneralization aggregateRoot.entities.relations nameCamelCase)}}
    {{#each aggregateRoot.entities.relations}}
    {{#if (isGeneralization targetElement.namePascalCase ../namePascalCase relationType)}}
    @Autowired
    {{sourceElement.namePascalCase}}Repository {{sourceElement.nameCamelCase}}Repository;
    {{/if}}
    {{/each}}
    {{/if}}

    {{#commands}}
    {{#isRestRepository}}
    {{/isRestRepository}}

    {{^isRestRepository}}
    {{#checkMethod controllerInfo.method}}
    @RequestMapping(value = "{{../namePlural}}/{id}/{{controllerInfo.apiPath}}",
        method = RequestMethod.{{controllerInfo.method}},
        produces = "application/json;charset=UTF-8")
    public {{../namePascalCase}} {{nameCamelCase}}(@PathVariable(value = "id") {{../keyFieldDescriptor.className}} id, {{#if (hasFields fieldDescriptors)}}@RequestBody {{namePascalCase}}Command {{nameCamelCase}}Command, {{/if}}HttpServletRequest request, HttpServletResponse response) throws Exception {
            System.out.println("##### /{{../nameCamelCase}}/{{nameCamelCase}}  called #####");
            Optional<{{../namePascalCase}}> optional{{../namePascalCase}} = {{../nameCamelCase}}Repository.findById(id);
            
            optional{{../namePascalCase}}.orElseThrow(()-> new Exception("No Entity Found"));
            {{../namePascalCase}} {{../nameCamelCase}} = optional{{../namePascalCase}}.get();
            {{../nameCamelCase}}.{{nameCamelCase}}({{#if (hasFields fieldDescriptors)}}{{nameCamelCase}}Command{{/if}});
            
            {{../nameCamelCase}}Repository.{{#methodConvert controllerInfo.method}}{{/methodConvert}}({{../nameCamelCase}});
            return {{../nameCamelCase}};
            
    }
    
    {{#each ../aggregateRoot.entities.relations}}
    {{#if (isGeneralization targetElement.namePascalCase ../../namePascalCase relationType)}}
    @RequestMapping(value = "{{#toURL sourceElement.nameCamelCase}}{{/toURL}}/{id}/{{../controllerInfo.apiPath}}",
            method = RequestMethod.{{../controllerInfo.method}},
            produces = "application/json;charset=UTF-8")
    public {{../../namePascalCase}} {{../nameCamelCase}}{{sourceElement.namePascalCase}}(
        @PathVariable(value = "id") {{../../keyFieldDescriptor.className}} id, {{#if (hasFields ../fieldDescriptors)}}@RequestBody {{../namePascalCase}}Command {{../nameCamelCase}}Command, {{/if}}HttpServletRequest request, HttpServletResponse response) throws Exception {
            return {{../nameCamelCase}}(id, {{#if (hasFields ../fieldDescriptors)}}{{../nameCamelCase}}Command,{{/if}} request, response);
    }
    {{/if}}
    {{/each}}

    {{/checkMethod}}

    {{^checkMethod controllerInfo.method}}
    @RequestMapping(value = "{{../namePlural}}/{{controllerInfo.apiPath}}",
            method = RequestMethod.{{controllerInfo.method}},
            produces = "application/json;charset=UTF-8")
    public {{../namePascalCase}} {{nameCamelCase}}(HttpServletRequest request, HttpServletResponse response, 
        {{#if (checkField fieldDescriptors)}}@RequestBody {{aggregate.namePascalCase}} {{aggregate.nameCamelCase}}{{/if}}) throws Exception {
            System.out.println("##### /{{aggregate.nameCamelCase}}/{{nameCamelCase}}  called #####");
            {{aggregate.nameCamelCase}}.{{nameCamelCase}}({{#if (checkField fieldDescriptors)}}{{nameCamelCase}}command{{/if}});
            {{aggregate.nameCamelCase}}Repository.save({{aggregate.nameCamelCase}});
            return {{aggregate.nameCamelCase}};
    }
    {{/checkMethod}}    
    {{/isRestRepository}}
    {{/commands}}

    {{#if (checkGeneralization aggregateRoot.entities.relations nameCamelCase)}}
    {{#each aggregateRoot.entities.relations}}
    {{#if (isGeneralization targetElement.namePascalCase ../namePascalCase relationType)}}
    {{#sourceElement.operations}}
    {{^isOverride}}
    @RequestMapping(value = "{{#toURL ../sourceElement.nameCamelCase}}{{/toURL}}/{id}/{{name}}",
        method = RequestMethod.PUT,
        produces = "application/json;charset=UTF-8")
    public {{../sourceElement.namePascalCase}} {{name}}(@PathVariable(value = "id") {{../targetElement.keyFieldDescriptor.className}}id, HttpServletRequest request, HttpServletResponse response) throws Exception {
            System.out.println("##### /{{../sourceElement.nameCamelCase}}/{{name}}  called #####");
            Optional<{{../sourceElement.namePascalCase}}> optional{{../sourceElement.namePascalCase}} = {{../sourceElement.nameCamelCase}}Repository.findById(id);
            
            optional{{../sourceElement.namePascalCase}}.orElseThrow(()-> new Exception("No Entity Found"));
            {{../sourceElement.namePascalCase}} {{../sourceElement.nameCamelCase}} = optional{{../sourceElement.namePascalCase}}.get();
            {{../sourceElement.namePascalCase}}.{{name}}({{#if (hasFields fieldDescriptors)}}{{name}}Command{{/if}});
            
            {{../sourceElement.nameCamelCase}}Repository.save({{../sourceElement.nameCamelCase}});
            return {{../sourceElement.nameCamelCase}};
            
    }
    {{/isOverride}}
    {{/sourceElement.operations}}
    {{/if}}
    {{/each}}
    {{/if}}
}
//>>> Clean Arch / Inbound Adaptor

<function>
window.$HandleBars.registerHelper('isGeneralization', function (toName, name, type) {
    try {
        if(toName == null || name == null || type == null) {
            return false;
        } else {
            if(toName == name && type.includes("Generalization")) {
                return true;
            } else {
                return false;
            }
        }
    } catch(e) {
        console.log(e)
    }
});

window.$HandleBars.registerHelper('checkGeneralization', function (relations, name) {
    try {
        if (typeof relations == "undefined") {
            return 
        } else {
            for (var i = 0; i < relations.length; i ++ ) {
                if (relations[i] != null) {
                    if (relations[i].targetElement != "undefined") {
                        if(relations[i].targetElement.name.toLowerCase() == name && relations[i].relationType.includes("Generalization")) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    } catch(e) {
        console.log(e)
    }
});

window.$HandleBars.registerHelper('methodConvert', function (method) {
    if(method.endsWith("PUT")){
        return "save";
    } else {
        return "delete";
    }
});

window.$HandleBars.registerHelper('checkMethod', function (method, options) {
    if(method.endsWith("PUT") || method.endsWith("DELETE")){
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

window.$HandleBars.registerHelper('hasFields', function (fieldDescriptors) {
    try {
        if(fieldDescriptors.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch(e) {
        console.log(e)
    }
});

window.$HandleBars.registerHelper('isPut', function (method, options) {
    if(method.endsWith("PUT")){
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

window.$HandleBars.registerHelper('isPOST', function (method, options) {
    if(method.endsWith("POST")){
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
    
window.$HandleBars.registerHelper('isDelete', function (method, options) {
    if(method.endsWith("DELETE")){
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

window.$HandleBars.registerHelper('toURL', function (className) {

    var pluralize = function(value, revert){

        var plural = {
            '(quiz)$'               : "$1zes",
            '^(ox)$'                : "$1en",
            '([m|l])ouse$'          : "$1ice",
            '(matr|vert|ind)ix|ex$' : "$1ices",
            '(x|ch|ss|sh)$'         : "$1es",
            '([^aeiouy]|qu)y$'      : "$1ies",
            '(hive)$'               : "$1s",
            '(?:([^f])fe|([lr])f)$' : "$1$2ves",
            '(shea|lea|loa|thie)f$' : "$1ves",
            'sis$'                  : "ses",
            '([ti])um$'             : "$1a",
            '(tomat|potat|ech|her|vet)o$': "$1oes",
            '(bu)s$'                : "$1ses",
            '(alias)$'              : "$1es",
            '(octop)us$'            : "$1i",
            '(ax|test)is$'          : "$1es",
            '(us)$'                 : "$1es",
            '([^s]+)$'              : "$1s"
        };

        var singular = {
            '(quiz)zes$'             : "$1",
            '(matr)ices$'            : "$1ix",
            '(vert|ind)ices$'        : "$1ex",
            '^(ox)en$'               : "$1",
            '(alias)es$'             : "$1",
            '(octop|vir)i$'          : "$1us",
            '(cris|ax|test)es$'      : "$1is",
            '(shoe)s$'               : "$1",
            '(o)es$'                 : "$1",
            '(bus)es$'               : "$1",
            '([m|l])ice$'            : "$1ouse",
            '(x|ch|ss|sh)es$'        : "$1",
            '(m)ovies$'              : "$1ovie",
            '(s)eries$'              : "$1eries",
            '([^aeiouy]|qu)ies$'     : "$1y",
            '([lr])ves$'             : "$1f",
            '(tive)s$'               : "$1",
            '(hive)s$'               : "$1",
            '(li|wi|kni)ves$'        : "$1fe",
            '(shea|loa|lea|thie)ves$': "$1f",
            '(^analy)ses$'           : "$1sis",
            '((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$': "$1$2sis",
            '([ti])a$'               : "$1um",
            '(n)ews$'                : "$1ews",
            '(h|bl)ouses$'           : "$1ouse",
            '(corpse)s$'             : "$1",
            '(us)es$'                : "$1",
            's$'                     : ""
        };

        var irregular = {
            'move'   : 'moves',
            'foot'   : 'feet',
            'goose'  : 'geese',
            'sex'    : 'sexes',
            'child'  : 'children',
            'man'    : 'men',
            'tooth'  : 'teeth',
            'person' : 'people',
            'index'  : 'indexes'
        };

        var uncountable = [
            'sheep',
            'fish',
            'deer',
            'moose',
            'series',
            'species',
            'money',
            'rice',
            'information',
            'equipment'
        ];

        // save some time in the case that singular and plural are the same
        // console.log("value = " + value)
        if(uncountable.indexOf(value.toLowerCase()) >= 0)
        return this;

        // check for irregular forms
        for(var word in irregular){

            if(revert) {
                var pattern = new RegExp(irregular[word]+'$', 'i');
                var replace = word;
            } else { 
                var pattern = new RegExp(word+'$', 'i');
                var replace = irregular[word];
            }
            if(pattern.test(value))
                return value.replace(pattern, replace);
        }

        if(revert) var array = singular;
            else  var array = plural;

        // check for matches using regular expressions
        for(var reg in array) {

            var pattern = new RegExp(reg, 'i');

            if(pattern.test(value))
                return value.replace(pattern, array[reg]);
        }

        return value;
    }

    return pluralize(className.toLowerCase())
})
</function>