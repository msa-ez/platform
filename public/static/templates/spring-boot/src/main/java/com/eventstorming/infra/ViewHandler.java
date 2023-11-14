forEach: View
representativeFor: View
fileName: {{namePascalCase}}ViewHandler.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/infra
mergeType: template
---
package {{options.package}}.infra;

import {{options.package}}.domain.*;
import {{options.package}}.config.kafka.KafkaProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class {{namePascalCase}}ViewHandler {

//<<< DDD / CQRS
    @Autowired
    private {{namePascalCase}}Repository {{nameCamelCase}}Repository;

    {{#createRules}}
    @StreamListener(KafkaProcessor.INPUT)
    public void when{{when.namePascalCase}}_then_{{operation}}_{{_index}} (@Payload {{when.namePascalCase}} {{when.nameCamelCase}}) {
        try {

            if (!{{when.nameCamelCase}}.validate()) return;

            // view 객체 생성
            {{../namePascalCase}} {{../nameCamelCase}} = new {{../namePascalCase}}();
            // view 객체에 이벤트의 Value 를 set 함
        {{#fieldMapping}}
        {{#if (isOperator ./operator )}}
            {{../../nameCamelCase}}.set{{viewField.namePascalCase}}({{#typeCasting viewField ../when.nameCamelCase eventField}}{{/typeCasting}});
        {{else}}
            {{../../nameCamelCase}}.set{{viewField.namePascalCase}}({{../../nameCamelCase}}.get{{viewField.namePascalCase}}() {{{replaceOperator ./operator }}} {{#typeCasting viewField ../when.nameCamelCase eventField}}{{/typeCasting}});
        {{/if}}
        {{/fieldMapping}}
            // view 레파지 토리에 save
            {{../nameCamelCase}}Repository.save({{../nameCamelCase}});

        }catch (Exception e){
            e.printStackTrace();
        }
    }
    {{/createRules}}


    {{#updateRules}}
    @StreamListener(KafkaProcessor.INPUT)
    public void when{{when.namePascalCase}}_then_{{operation}}_{{_index}}(@Payload {{when.namePascalCase}} {{when.nameCamelCase}}) {
        try {
            if (!{{when.nameCamelCase}}.validate()) return;
                // view 객체 조회
        {{#where}}
            {{#viewField.isKey}}
            Optional<{{../../namePascalCase}}> {{../../nameCamelCase}}Optional = {{../../nameCamelCase}}Repository.findBy{{viewField.namePascalCase}}({{#typeCasting viewField ../when.nameCamelCase eventField}}{{/typeCasting}});

            if( {{../../nameCamelCase}}Optional.isPresent()) {
                 {{../../namePascalCase}} {{../../nameCamelCase}} = {{../../nameCamelCase}}Optional.get();
            // view 객체에 이벤트의 eventDirectValue 를 set 함
            {{#../fieldMapping}}
            {{#if (isOperator ./operator )}}
                {{../../../nameCamelCase}}.set{{viewField.namePascalCase}}({{#typeCasting viewField ../../when.nameCamelCase eventField}}{{/typeCasting}});    
            {{else}}
                {{../../../nameCamelCase}}.set{{viewField.namePascalCase}}({{../../../nameCamelCase}}.get{{viewField.namePascalCase}}() {{{replaceOperator ./operator }}} {{#typeCasting viewField ../../when.nameCamelCase eventField}}{{/typeCasting}});
            {{/if}}
            {{/../fieldMapping}}
                // view 레파지 토리에 save
                 {{../../nameCamelCase}}Repository.save({{../../nameCamelCase}});
                }
            {{/viewField.isKey}}

            {{^viewField.isKey}}
                List<{{../../namePascalCase}}> {{../../nameCamelCase}}List = {{../../nameCamelCase}}Repository.findBy{{viewField.namePascalCase}}({{#typeCasting viewField ../when.nameCamelCase eventField}}{{/typeCasting}});
                for({{../../namePascalCase}} {{../../nameCamelCase}} : {{../../nameCamelCase}}List){
                    // view 객체에 이벤트의 eventDirectValue 를 set 함
                {{# ../fieldMapping}}
                {{#if (isOperator ./operator )}}
                    {{../../../nameCamelCase}}.set{{viewField.namePascalCase}}({{#typeCasting viewField ../../when.nameCamelCase eventField}}{{/typeCasting}});
                {{else}}
                    {{../../../nameCamelCase}}.set{{viewField.namePascalCase}}({{../../../nameCamelCase}}.get{{viewField.namePascalCase}}() {{{replaceOperator ./operator }}} {{#typeCasting viewField ../../when.nameCamelCase eventField}}{{/typeCasting}});
                {{/if}}
                {{/ ../fieldMapping}}
                // view 레파지 토리에 save
                {{../../nameCamelCase}}Repository.save({{../../nameCamelCase}});
                }
            {{/viewField.isKey}}
        {{/where}}

        }catch (Exception e){
            e.printStackTrace();
        }
    }
    {{/updateRules}}

    {{#deleteRules}}
    @StreamListener(KafkaProcessor.INPUT)
    public void when{{when.namePascalCase}}_then_{{operation}}_{{_index}}(@Payload {{when.namePascalCase}} {{when.nameCamelCase}}) {
        try {
            if (!{{when.nameCamelCase}}.validate()) return;
    {{#where}}
            // view 레파지 토리에 삭제 쿼리
        {{#viewField.isKey}}
            {{../../nameCamelCase}}Repository.deleteById({{#typeCasting viewField ../when.nameCamelCase eventField}}{{/typeCasting}});
        {{/viewField.isKey}}
        {{^viewField.isKey}}
            {{../../nameCamelCase}}Repository.deleteBy{{viewField.namePascalCase}}({{#typeCasting viewField ../when.nameCamelCase eventField}}{{/typeCasting}});
        {{/viewField.isKey}}
    {{/where}}
        }catch (Exception e){
            e.printStackTrace();
        }
    }
    {{/deleteRules}}

//>>> DDD / CQRS
}


<function>
window.$HandleBars.registerHelper('isOperator', function (value) {
        return value == '=';
        });
window.$HandleBars.registerHelper('replaceOperator', function (value) {
        value = value.replace('=','')
        return new window.$HandleBars.SafeString(value);
});

window.$HandleBars.registerHelper('typeCasting', function (viewField, eventName, eventField) {
    try {
        var text = '';
        if(eventField.className == true && eventField.value != undefined) {
            if(typeof(eventField.value) == 'string') {
                text += eventField.value
            } else {
                text += viewField.className + '.valueOf(' + eventField.value + ')';
            }
        } else {
            if(viewField.className != eventField.className) {
                if(viewField.className == 'Integer' && eventField.className == 'String') {
                    text += viewField.className + '.parseInt(' + eventName + '.get' + eventField.namePascalCase + '())';
                } else if((viewField.className == 'Integer' || viewField.className == 'Long') && (eventField.className == 'Integer' || eventField.className == 'Long')) {
                    text += eventName + '.get' + eventField.namePascalCase +'()';
                } else if((viewField.className == 'Float' || viewField.className == 'Double') && (eventField.className == 'Float' || eventField.className == 'Double')) {
                    text += eventName + '.get' + eventField.namePascalCase +'()';
                } else {
                    text += viewField.className + '.valueOf(' + eventName + '.get' + eventField.namePascalCase + '())';
                }
            } else {
                text += eventName + '.get' + eventField.namePascalCase +'()';
            }
        }
        return text;
    } catch (e) {
        console.log(e);
    }
});

window.$HandleBars.registerHelper('print', function (value) {
    console.log('view hanlder pring', value)
    // return value
});
</function>