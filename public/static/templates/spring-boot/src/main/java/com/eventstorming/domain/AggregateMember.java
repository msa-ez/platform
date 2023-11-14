forEach: Entity
fileName: {{namePascalCase}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/domain
mergeType: {{#mergeType _type}}{{/mergeType}}
---
package {{options.package}}.domain;

import javax.persistence.*;
import org.springframework.beans.BeanUtils;
import java.util.List;
import lombok.Data;
import java.util.Date;
{{#checkBigDecimal fieldDescriptors}}{{/checkBigDecimal}}

@Entity
@Data
{{#setDiscriminator relations nameCamelCase}}{{/setDiscriminator}}
public class {{namePascalCase}} {{#checkExtends relations namePascalCase}}{{/checkExtends}} {

    {{#fieldDescriptors}}
    {{#isLob}}@Lob{{/isLob}}
    {{#if (isPrimitive className)}}{{#isList}}@ElementCollection{{/isList}}{{/if}}
    {{#checkRelations ../relations className isVO}} {{/checkRelations}}
    private {{{className}}} {{nameCamelCase}};
    {{/fieldDescriptors}}

{{#operations}}
    {{#isOverride}}
    @Override
    {{/isOverride}}
    public {{returnType}} {{name}}() {
        //
    }
{{/operations}}
}

<function>
window.$HandleBars.registerHelper('checkDateType', function (fieldDescriptors) {
    for(var i = 0; i < fieldDescriptors.length; i ++ ){
        if(fieldDescriptors[i] && fieldDescriptors[i].className == 'Date'){
        return "import java.util.Date; \n"
        }
    }
});

window.$HandleBars.registerHelper('mergeType', function (type) {
    if(type.includes('enum')) {
        return 'template'
    } else {
        return 'merge'
    }
});

window.$HandleBars.registerHelper('checkBigDecimal', function (fieldDescriptors) {
    for(var i = 0; i < fieldDescriptors.length; i ++ ){
        if(fieldDescriptors[i] && fieldDescriptors[i].className.includes('BigDecimal')){
            return "import java.math.BigDecimal;";
        }
    }
});

window.$HandleBars.registerHelper('isPrimitive', function (className) {
    if(className.includes("String") || className.includes("Integer") || className.includes("Long") || className.includes("Double") || className.includes("Float")
            || className.includes("Boolean") || className.includes("Date")){
        return true;
    } else {
        return false;
    }
});

window.$HandleBars.registerHelper('checkRelations', function (relations, className, isVO) {
    try {
        if(typeof relations == "undefined") {
            return
        } else {
            // primitive type
            if(className.includes("String") || className.includes("Integer") || className.includes("Long") || className.includes("Double") || className.includes("Float")
                    || className.includes("Boolean") || className.includes("Date")) {
                if(className.includes("List")) {
                    return "@ElementCollection"
                }
            } else {
                // ValueObject
                if(isVO) {
                    if(className.includes("List")) {
                        return "@ElementCollection"
                    } else {
                        return "@Embedded"
                    }
                } else {
                    for(var i = 0; i < relations.length; i ++ ) {
                        if(relations[i] != null) {
                            if(relations[i].targetElement == null) {
                                if(className.includes(relations[i].toName) && !relations[i].relationType.includes("Generalization")){
                                    // Enumeration
                                    if(relations[i].targetType && relations[i].targetType.includes('enum')) {
                                        return '@Enumerated(EnumType.STRING)'
                                    } 
                                }
                            } else {
                                if(className.includes(relations[i].targetElement.name) && !relations[i].relationType.includes("Generalization")) {
                                    // Enumeration
                                    if(relations[i].targetElement._type.endsWith('enum')) {
                                        return '@Enumerated(EnumType.STRING)'
                                    }
                                }
                            }
                            // complex type
                            if(relations[i].sourceMultiplicity == "1" && className.includes("List")){
                                return "@OneToMany"
                            } else if((relations[i].sourceMultiplicity == "1..n" || relations[i].sourceMultiplicity == "0..n") 
                                    && relations[i].targetMultiplicity == "1"){
                                return "@ManyToOne"
                            } else if(relations[i].sourceMultiplicity == "1" && relations[i].targetMultiplicity == "1"){
                                return "@OneToOne"
                            } else if((relations[i].sourceMultiplicity == "1..n" || relations[i].sourceMultiplicity == "0..n") && className.includes("List")){
                                return "@ManyToMany"
                            }
                        }
                    }
                }
            }

            for(var i = 0; i < relations.length; i ++ ) {
                if(relations[i] != null){
                    if(relations[i].targetElement == null) {
                        if(className.includes(relations[i].toName) && !relations[i].relationType.includes("Generalization")){
                            if(relations[i].targetType && relations[i].targetType.includes('enum')) {
                                return '@Enumerated(EnumType.STRING)'
                            } else {
                                if(isVO) {
                                    if((relations[i].targetMultiplicity == "1..n" || relations[i].targetMultiplicity == "0..n") && relations[i].sourceMultiplicity == "1"){
                                        return "@ElementCollection"
                                    } else {
                                        return "@Embedded"
                                    }
                                } else {
                                    if(relations[i].sourceMultiplicity == "1" && (relations[i].targetMultiplicity == "1..n" || relations[i].targetMultiplicity == "0..n")){
                                        return "@OneToMany"
                                    } else if((relations[i].sourceMultiplicity == "1..n" || relations[i].sourceMultiplicity == "0..n") && relations[i].targetMultiplicity == "1"){
                                        return "@ManyToOne"
                                    } else if(relations[i].sourceMultiplicity == "1" && relations[i].targetMultiplicity == "1"){
                                        return "@OneToOne"
                                    } else if((relations[i].sourceMultiplicity == "1..n" || relations[i].sourceMultiplicity == "0..n") && (relations[i].targetMultiplicity == "1..n" || relations[i].targetMultiplicity == "0..n")){
                                        return "@ManyToMany"
                                    }
                                }
                            }
                        }
                    } else {
                        if(className.includes(relations[i].targetElement.name) && !relations[i].relationType.includes("Generalization")) {
                            if(relations[i].targetElement._type.includes('enum')) {
                                return '@Enumerated(EnumType.STRING)'
                            } else {
                                if(isVO) {
                                    if((relations[i].targetMultiplicity == "1..n" || relations[i].targetMultiplicity == "0..n") && relations[i].sourceMultiplicity == "1"){
                                        return "@ElementCollection"
                                    } else {
                                        return "@Embedded"
                                    }
                                } else {
                                    if(relations[i].sourceMultiplicity == "1" && (relations[i].targetMultiplicity == "1..n" || relations[i].targetMultiplicity == "0..n")){
                                        return "@OneToMany"
                                    } else if((relations[i].sourceMultiplicity == "1..n" || relations[i].sourceMultiplicity == "0..n") && relations[i].targetMultiplicity == "1"){
                                        return "@ManyToOne"
                                    } else if(relations[i].sourceMultiplicity == "1" && relations[i].targetMultiplicity == "1"){
                                        return "@OneToOne"
                                    } else if((relations[i].sourceMultiplicity == "1..n" || relations[i].sourceMultiplicity == "0..n") && (relations[i].targetMultiplicity == "1..n" || relations[i].targetMultiplicity == "0..n")){
                                        return "@ManyToMany"
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return
        }
    } catch (e) {
        console.log(e)
    }
});

window.$HandleBars.registerHelper('checkExtends', function (relations, name) {
    try {
        if (typeof relations == "undefined" || name === "undefined") {
            return 
        } else {
            for (var i = 0; i < relations.length; i ++ ) {
                if (relations[i] != null) {
                    if (relations[i].sourceElement != undefined && relations[i].sourceElement != "undefined") {
                        if (relations[i].sourceElement.name == name && relations[i].relationType.includes("Generalization")) {
                            var text = "extends " + relations[i].targetElement.name
                            return text
                        }
                    } else {
                        if (relations[i].fromName == name && relations[i].relationType.includes("Generalization")) {
                            var text = "extends " + relations[i].toName
                            return text
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.log(e)
    }
});

window.$HandleBars.registerHelper('setDiscriminator', function (relations, name) {
    try {
        if (typeof relations == "undefined") {
            return 
        } else {
            for (var i = 0; i < relations.length; i ++ ) {
                if (relations[i] != null) {
                    if (relations[i].targetElement != undefined && relations[i].targetElement != "undefined") {
                        if(relations[i].targetElement.name.toLowerCase() == name && relations[i].relationType.includes("Generalization")) {
                            text = '@DiscriminatorColumn(\n' + 
                                '    discriminatorType = DiscriminatorType.STRING,\n' +
                                '    name = "' + name + '_type",\n' +
                                '    columnDefinition = "CHAR(5)"\n' +
                                ')'
                            return text
                        }
                    } else {
                        if(relations[i].toName.toLowerCase() == name && relations[i].relationType.includes("Generalization")) {
                            text = '@DiscriminatorColumn(\n' + 
                                '    discriminatorType = DiscriminatorType.STRING,\n' +
                                '    name = "' + name + '_type",\n' +
                                '    columnDefinition = "CHAR(5)"\n' +
                                ')'
                            return text
                        }
                    }
                    if (relations[i].sourceElement != undefined && relations[i].sourceElement != "undefined") {
                        if (relations[i].sourceElement.name.toLowerCase() == name && relations[i].relationType.includes("Generalization")) {
                            return '@DiscriminatorValue("' + name + '")'
                        }
                    } else {
                        if (relations[i].fromName.toLowerCase() == name && relations[i].relationType.includes("Generalization")) {
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