forEach: Aggregate
fileName: {{namePascalCase}}ServiceImpl.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/service/impl
---

package {{options.package}}.service.impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import {{options.package}}.dto.entity.{{namePascalCase}};
import {{options.package}}.mapper.{{namePascalCase}}Mapper;
import {{options.package}}.service.{{namePascalCase}}Service;

@Transactional
@Service
public class {{namePascalCase}}ServiceImpl implements {{namePascalCase}}Service{
    @Autowired
    {{namePascalCase}}Mapper {{nameCamelCase}}Mapper;
    
    @Override
    public List<{{namePascalCase}}> getList(){
        List<{{namePascalCase}}> {{nameCamelCase}}List = {{nameCamelCase}}Mapper.findList();

        return {{nameCamelCase}}List;
    }

    @Override
    public void save({{namePascalCase}} {{nameCamelCase}}){
        
        {{nameCamelCase}}Mapper.save({{nameCamelCase}}); 

        {{#lifeCycles}}
        {{#events}}
        {{#ifPersist trigger}}
        
        // PUB/SUB
        // if trigger is set as Post~, this line should go below save method
        // {{namePascalCase}} {{nameCamelCase}} = new {{namePascalCase}}();
        // BeanUtils.copyProperties({{../../nameCamelCase}}, {{nameCamelCase}});
        // {{nameCamelCase}}.publish({{nameCamelCase}}.getId());

        
        {{#relationCommandInfo}}
            {{#commandValue}}
        // Req/Res
        // Following code causes dependency to external APIs
        // it is NOT A GOOD PRACTICE. instead, Event-Policy mapping is recommended.

        {{../../../../options.package}}.external.{{aggregate.namePascalCase}} {{aggregate.nameCamelCase}} = new {{../../../../options.package}}.external.{{aggregate.namePascalCase}}();
        // mappings goes here
        {{../relationCommandInfo.boundedContext.namePascalCase}}Application.applicationContext.getBean({{../../../../options.package}}.external.{{aggregate.namePascalCase}}Service.class)
            .{{nameCamelCase}}({{aggregate.nameCamelCase}});

            {{/commandValue}}
        {{/relationCommandInfo}}
        
        {{/ifPersist}}
        {{/events}}
        {{/lifeCycles}}
        
    }

    @Override
    public {{namePascalCase}} getById(Long id){
        {{namePascalCase}} {{nameCamelCase}} = {{nameCamelCase}}Mapper.findOneById(id);

        return {{nameCamelCase}};
    }

    @Override
    public void delete(Long id){
        
        {{nameCamelCase}}Mapper.deleteById(id); 

        {{#lifeCycles}}
        {{#events}}
        {{#ifRemove trigger}}
        
        // PUB/SUB
        // if trigger is set as Post~, this line should go below delete method
        // {{namePascalCase}} {{nameCamelCase}} = new {{namePascalCase}}();
        // BeanUtils.copyProperties({{../../nameCamelCase}}, {{nameCamelCase}});
        // {{nameCamelCase}}.publish();

        
        {{#relationCommandInfo}}
            {{#commandValue}}
        // Req/Res
        // Following code causes dependency to external APIs
        // it is NOT A GOOD PRACTICE. instead, Event-Policy mapping is recommended.

        {{../../../../options.package}}.external.{{aggregate.namePascalCase}} {{aggregate.nameCamelCase}} = new {{../../../../options.package}}.external.{{aggregate.namePascalCase}}();
        // mappings goes here
        {{../relationCommandInfo.boundedContext.namePascalCase}}Application.applicationContext.getBean({{../../../../options.package}}.external.{{aggregate.namePascalCase}}Service.class)
            .{{nameCamelCase}}({{aggregate.nameCamelCase}});

            {{/commandValue}}
        {{/relationCommandInfo}}

        {{/ifRemove}}
        {{/events}}
        {{/lifeCycles}}

    }

    @Override
    public void update({{namePascalCase}} {{nameCamelCase}}){

        {{nameCamelCase}}Mapper.update({{nameCamelCase}}); 

        {{#lifeCycles}}
        {{#events}}
        {{#ifUpdate trigger}}
        
        // PUB/SUB
        // if trigger is set as Post~, this line should go below update method
        // {{namePascalCase}} {{nameCamelCase}} = new {{namePascalCase}}();
        // BeanUtils.copyProperties({{../../nameCamelCase}}, {{nameCamelCase}});
        // {{nameCamelCase}}.publish();


        {{#relationCommandInfo}}
            {{#commandValue}}
        // Req/Res
        // Following code causes dependency to external APIs
        // it is NOT A GOOD PRACTICE. instead, Event-Policy mapping is recommended.

        {{../../../../options.package}}.external.{{aggregate.namePascalCase}} {{aggregate.nameCamelCase}} = new {{../../../../options.package}}.external.{{aggregate.namePascalCase}}();
        // mappings goes here
        {{../relationCommandInfo.boundedContext.namePascalCase}}Application.applicationContext.getBean({{../../../../options.package}}.external.{{aggregate.namePascalCase}}Service.class)
            .{{nameCamelCase}}({{aggregate.nameCamelCase}});

            {{/commandValue}}
        {{/relationCommandInfo}}
        
        {{/ifUpdate}}
        {{/events}}
        {{/lifeCycles}}


    }
}

<function>
    
    window.$HandleBars.registerHelper('ifPersist', function (trigger, options) {
		
		if(trigger.endsWith("Persist")){
			console.log("HERE PERSIST")
			return options.fn(this)
        }
        else{
            return options.inverse(this)
        }
		
	});
    window.$HandleBars.registerHelper('ifUpdate', function (trigger, options) {
		
		if(trigger.endsWith("Update")){
			
			return options.fn(this)
        }
        else{
            return options.inverse(this)
        }
		
	});
    window.$HandleBars.registerHelper('ifRemove', function (trigger, options) {
		
		if(trigger.endsWith("Remove")){
			
			return options.fn(this)
        }
        else{
            return options.inverse(this)
        }
		
	});
</function>