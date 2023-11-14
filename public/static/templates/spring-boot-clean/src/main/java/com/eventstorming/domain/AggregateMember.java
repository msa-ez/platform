forEach: Entity
fileName: {{namePascalCase}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/domain
---
package {{options.package}}.domain;

import javax.persistence.*;
import org.springframework.beans.BeanUtils;
import java.util.List;
import java.util.Date;

{{^items}}
{{#isVO}}
@Embeddable
{{/isVO}}
{{^isVO}}
@Entity
{{/isVO}}
{{/items}}
{{#setDiscriminator relations nameCamelCase}}{{/setDiscriminator}}
public {{#classType _type}}{{/classType}} {{namePascalCase}} {{#checkExtends relations namePascalCase}}{{/checkExtends}} {

    {{#items}}
    {{#setItems value ../items}}{{/setItems}}
    {{/items}}

    {{#fieldDescriptors}}
    {{#isKey}}
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    {{/isKey}}
    {{#checkRelations ../relations namePascalCase isVO}} {{/checkRelations}}
    private {{{className}}} {{nameCamelCase}};
    {{/fieldDescriptors}}


{{#fieldDescriptors}}
    public {{{className}}} get{{namePascalCase}}() {
        return {{nameCamelCase}};
    }
    {{#isVO}}
    public void set{{namePascalCase}}({{{className}}} {{nameCamelCase}}) {
        this.{{nameCamelCase}} = {{nameCamelCase}};
    }
    {{/isVO}}
    {{^isVO}}
    {{/isVO}}
{{/fieldDescriptors}}

{{#operations}}
    {{#isOverride}}
    @Override
    {{/isOverride}}
    public {{returnType}} {{name}}(){
    }

{{/operations}}


}

<function>
window.$HandleBars.registerHelper('classType', function (type) {
    if(type.includes('enum')) {
        return 'enum'
    } else {
        return 'class'
    }
});

window.$HandleBars.registerHelper('setItems', function (value, items) {
    var text = ''
    for(var i = 0; i < items.length; i ++ ){
        if(items[i]) {
            if(items[i].value == value) {
                text = value
                if(i < items.length-1) {
                    text += ','
                } else {
                    text += ';'
                }
                return text
            }
        }
    }
});

window.$HandleBars.registerHelper('checkDateType', function (fieldDescriptors) {
    for(var i = 0; i < fieldDescriptors.length; i ++ ){
        if(fieldDescriptors[i] && fieldDescriptors[i].className == 'Date'){
        return "import java.util.Date; \n"
        }
    }
});

window.$HandleBars.registerHelper('checkRelations', function (relations, name, isVO) {
    if(typeof relations == "undefined") {
        return
    } else {
        for(var i = 0; i < relations.length; i ++ ) {
            if(relations[i] != null){
                if(relations[i].targetElement == null) {
                    if(relations[i].toName == name && (relations[i].relationType.includes("Association") || relations[i].relationType.includes("Aggregation"))){
                        var text = ''
                        if(isVO) {
                            return "@Embedded"
                        }
                        if(relations[i].sourceMultiplicity == "1" && relations[i].targetMultiplicity == "1..n"){
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
                } else {
                    if(relations[i].targetElement.name == name && (relations[i].relationType.includes("Association") || relations[i].relationType.includes("Aggregation"))){
                        if(relations[i].targetElement._type.includes('enum')) {
                            return '@Enumerated(EnumType.STRING)'
                        }
                        var text = ''
                        if(isVO) {
                            return "@Embedded"
                        }
                        if(relations[i].sourceMultiplicity == "1" && relations[i].targetMultiplicity == "1..n"){
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
    }
});

window.$HandleBars.registerHelper('checkExtends', function (relations, name) {
    if (typeof relations == "undefined") {
        return 
    } else {
        for (var i = 0; i < relations.length; i ++ ) {
            if (relations[i] != null) {
                if (relations[i].targetElement != "undefined") {
                    if (relations[i].targetElement.name == name && relations[i].relationType.includes("Generalization")) {
                        var text = "extends " + relations[i].sourceElement.name
                        return text
                    }
                } else {
                    if (relations[i].toName == name && relations[i].relationType.includes("Generalization")) {
                        var text = "extends " + relations[i].fromName
                        return text
                    }
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
                    if (relations[i].sourceElement != "undefined") {
                        if(relations[i].sourceElement.name.toLowerCase() == name && relations[i].relationType.includes("Generalization")) {
                            return '@DiscriminatorColumn'
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