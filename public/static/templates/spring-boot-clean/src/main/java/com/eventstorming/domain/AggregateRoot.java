forEach: Aggregate
representativeFor: Aggregate
fileName: {{namePascalCase}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/domain
---
package {{options.package}}.domain;

{{#lifeCycles}}
{{#events}}
import {{../../options.package}}.domain.{{namePascalCase}};
{{/events}}
{{/lifeCycles}}
import {{options.package}}.{{boundedContext.namePascalCase}}Application;
import javax.persistence.*;
import org.springframework.beans.BeanUtils;
import java.util.List;
import java.util.Date;

@Entity
@Table(name="{{namePascalCase}}_table")
{{#setDiscriminator aggregateRoot.entities.relations nameCamelCase}}{{/setDiscriminator}}
public class {{namePascalCase}} {{#checkExtends aggregateRoot.entities.relations namePascalCase}}{{/checkExtends}} {

    {{#aggregateRoot.fieldDescriptors}}
    {{#isKey}}
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    {{/isKey}}
    {{#checkRelations ../aggregateRoot.entities.relations className isVO}}{{/checkRelations}}
    {{#checkAttribute ../aggregateRoot.entities.relations ../name className isVO}}{{/checkAttribute}}
    private {{{className}}} {{nameCamelCase}};
    {{/aggregateRoot.fieldDescriptors}}

{{#lifeCycles}}
    {{annotation}}
    public void on{{trigger}}(){
    {{#events}}
        {{namePascalCase}} {{nameCamelCase}} = new {{namePascalCase}}();
        BeanUtils.copyProperties(this, {{nameCamelCase}});
        {{nameCamelCase}}.publishAfterCommit();

        {{#relationCommandInfo}}
            {{#commandValue}}
        //Following code causes dependency to external APIs
        // it is NOT A GOOD PRACTICE. instead, Event-Policy mapping is recommended.

        {{../../../../options.package}}.external.{{aggregate.namePascalCase}} {{aggregate.nameCamelCase}} = new {{../../../../options.package}}.external.{{aggregate.namePascalCase}}();
        // mappings goes here
        {{../boundedContext.namePascalCase}}Application.applicationContext.getBean({{../../../../options.package}}.external.{{aggregate.namePascalCase}}Service.class)
            .{{nameCamelCase}}({{aggregate.nameCamelCase}});

            {{/commandValue}}
        {{/relationCommandInfo}}
    {{/events}}
    {{#commands}}
        {{#relationCommandInfo}}
            {{#commandValue}}
        // Get request from {{aggregate.namePascalCase}}
        //{{../../../../options.package}}.external.{{aggregate.namePascalCase}} {{aggregate.nameCamelCase}} =
        //    {{../relationCommandInfo.boundedContext.namePascalCase}}Application.applicationContext.getBean({{../../../../options.package}}.external.{{aggregate.namePascalCase}}Service.class)
        //    .get{{aggregate.namePascalCase}}(/** mapping value needed */);

            {{/commandValue}}
        {{/relationCommandInfo}}
    {{/commands}}
    }
{{/lifeCycles}}

{{#aggregateRoot.fieldDescriptors}}
    public {{className}} get{{namePascalCase}}() {
        return {{nameCamelCase}};
    }

    public void set{{namePascalCase}}({{className}} {{nameCamelCase}}) {
        this.{{nameCamelCase}} = {{nameCamelCase}};
    }
    
{{/aggregateRoot.fieldDescriptors}}

{{#aggregateRoot.operations}}
    {{#isOverride}}
    @Override
    {{/isOverride}}
    public {{returnType}} {{name}}() {
    }

{{/aggregateRoot.operations}}


}

<function>
window.$HandleBars.registerHelper('checkDateType', function (fieldDescriptors) {
    for(var i = 0; i < fieldDescriptors.length; i ++ ){
        if(fieldDescriptors[i] && fieldDescriptors[i].className == 'Date'){
        return "import java.util.Date; \n"
        }
    }
});

window.$HandleBars.registerHelper('checkAttribute', function (relations, source, target, isVO) {
    // console.log("checkAttribute")
    // console.log(relations)
    // console.log(target)
    if(typeof relations === "undefined"){
        return;
    }
    
    if(!isVO){
        return;
    }

    var sourceObj = [];
    var targetObj = [];
    var sourceTmp = {};
    var targetName = null;
    for(var i = 0 ; i<relations.length; i++){
        if(relations[i] != null){
            if(relations[i].sourceElement.name == source){
                sourceTmp = relations[i].sourceElement;
                sourceObj = relations[i].sourceElement.fieldDescriptors;
            }
            if(relations[i].targetElement.name == target){
                targetObj = relations[i].targetElement.fieldDescriptors;
                targetName = relations[i].targetElement.nameCamelCase;
            }
        }
    }

    var samePascal = [];
    var sameCamel = [];
    for(var i = 0; i<sourceObj.length; i++){
        for(var j =0; j<targetObj.length; j++){
            if(sourceObj[i].name == targetObj[j].name){
                samePascal.push(sourceObj[i].namePascalCase);
                sameCamel.push(sourceObj[i].nameCamelCase);
            }
        }
    }
    
    var attributeOverrides = "";
    for(var i =0; i<samePascal.length; i++){
        var camel = sameCamel[i];
        var pascal = samePascal[i];
        var overrides = `@AttributeOverride(name="${camel}", column= @Column(name="${targetName}${pascal}", nullable=true))\n`;
        attributeOverrides += overrides;
    }

    return attributeOverrides;
    
});

window.$HandleBars.registerHelper('checkRelations', function (relations, className, isVO) {
    try {
        if(typeof relations === "undefined") {
            return 
        } else {
            for(var i = 0; i < relations.length; i ++ ) {
                if(relations[i] != null){
                    if(className.includes(relations[i].targetElement.name) && (relations[i].relationType.includes("Association") || relations[i].relationType.includes("Aggregation"))){
                        if(relations[i].targetElement._type.includes('enum')) {
                            return '@Enumerated(EnumType.STRING)'
                        }
                        var text = ''
                        if(isVO) {
                            text = "@Embedded"
                        } else if(relations[i].sourceMultiplicity == "1" && relations[i].targetMultiplicity == "1..n"){
                            text = "@OneToMany"
                        } else if(relations[i].sourceMultiplicity == "1..n" && relations[i].targetMultiplicity == "1"){
                            text = "@ManyToOne"
                        } else if(relations[i].sourceMultiplicity == "1" && relations[i].targetMultiplicity == "1"){
                            text = "@OneToOne"
                        } else if(relations[i].sourceMultiplicity == "1..n" && relations[i].targetMultiplicity == "1..n"){
                            text = "@ManyToMany"
                        }
                        return text
                    }
                }
            }
        }
    } catch (e) {
        console.log(e)
    }
});

window.$HandleBars.registerHelper('checkExtends', function (relations, name) {
    if(typeof relations === "undefined"){
        return 
    } else {
        for(var i = 0; i < relations.length; i ++ ){
            if(relations[i] != null){
                if(relations[i].targetElement.name == name && relations[i].relationType.includes("Generalization")){
                    var text = "extends " + relations[i].sourceElement.name
                    return text
                }
            }
        }
    }
});

window.$HandleBars.registerHelper('setDiscriminator', function (relations, name) {
    try {
        if (typeof relations == "undefined") {
            return 
        } else {
            for (var i = 0; i < relations.length; i ++ ) {
                if (relations[i] != null) {
                    var text = ''
                    if (relations[i].sourceElement != "undefined") {
                        if(relations[i].sourceElement.name.toLowerCase() == name && relations[i].relationType.includes("Generalization")) {
                            text = '@DiscriminatorColumn(\n' + 
                                '    discriminatorType = DiscriminatorType.STRING,\n' +
                                '    name = "' + name + '_type",\n' +
                                '    columnDefinition = "CHAR(5)"\n' +
                                ')'
                            return text
                        }
                    } else {
                        if(relations[i].fromName.toLowerCase() == name && relations[i].relationType.includes("Generalization")) {
                            return '@DiscriminatorColumn'
                        }
                    }
                    if (relations[i].targetElement != "undefined") {
                        if (relations[i].targetElement.name.toLowerCase() == name && relations[i].relationType.includes("Generalization")) {
                            return '@DiscriminatorValue("' + name + '")'
                        }
                    } else {
                        if (relations[i].toName.toLowerCase() == name && relations[i].relationType.includes("Generalization")) {
                            return '@DiscriminatorValue("' + name + '")'
                        }
                    }
                }
            }
        }
    } catch(e) {
        console.log(e)
    }
});


</function>