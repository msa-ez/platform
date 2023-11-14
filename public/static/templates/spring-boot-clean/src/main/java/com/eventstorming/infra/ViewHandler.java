forEach: View
representativeFor: View
fileName: {{namePascalCase}}ViewHandler.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/infra
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
        {{viewField.namePascalCase}}
        {{#if (isOperator ./operator )}}
            {{#if eventField.value }}
            {{../../nameCamelCase}}.set{{viewField.namePascalCase}}({{{eventField.value}}});
            {{else}}
            {{../../nameCamelCase}}.set{{viewField.namePascalCase}}({{../when.nameCamelCase}}.get{{eventField.namePascalCase}}());
            {{/if}}
        {{else}}
            {{#if eventField.value }}
            {{../../nameCamelCase}}.set{{viewField.namePascalCase}}( {{../../nameCamelCase}}.get{{viewField.namePascalCase}}()  {{{replaceOperator ./operator }}}  {{{eventField.value}}});
            {{else}}
            {{../../nameCamelCase}}.set{{viewField.namePascalCase}}({{../../nameCamelCase}}.get{{viewField.namePascalCase}}() {{{replaceOperator ./operator }}} {{../when.nameCamelCase}}.get{{eventField.namePascalCase}}());
            {{/if}}
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
            Optional<{{../../namePascalCase}}> {{../../nameCamelCase}}Optional = {{../../nameCamelCase}}Repository.findBy{{viewField.namePascalCase}}({{../when.nameCamelCase}}.get{{eventField.namePascalCase}}());

            if( {{../../nameCamelCase}}Optional.isPresent()) {
                 {{../../namePascalCase}} {{../../nameCamelCase}} = {{../../nameCamelCase}}Optional.get();
            // view 객체에 이벤트의 eventDirectValue 를 set 함
            {{#../fieldMapping}}
{{#if (isOperator ./operator )}}
    {{#if eventField.value }}
                 {{../../../nameCamelCase}}.set{{viewField.namePascalCase}}({{{eventField.value}}});
    {{else}}
                 {{../../../nameCamelCase}}.set{{viewField.namePascalCase}}({{../../when.nameCamelCase}}.get{{eventField.namePascalCase}}());
    {{/if}}
{{else}}
    {{#if eventField.value }}
                 {{../../../nameCamelCase}}.set{{viewField.namePascalCase}}({{../../../nameCamelCase}}.get{{viewField.namePascalCase}}() {{{replaceOperator ./operator }}}  {{{eventField.value}}});
    {{else}}
                 {{../../../nameCamelCase}}.set{{viewField.namePascalCase}}({{../../../nameCamelCase}}.get{{viewField.namePascalCase}}() {{{replaceOperator ./operator }}} {{../../when.nameCamelCase}}.get{{eventField.namePascalCase}}());
    {{/if}}
{{/if}}
            {{/../fieldMapping}}
                // view 레파지 토리에 save
                 {{../../nameCamelCase}}Repository.save({{../../nameCamelCase}});
                }
            {{/viewField.isKey}}

            {{^viewField.isKey}}
                    List<{{../../namePascalCase}}> {{../../nameCamelCase}}List = {{../../nameCamelCase}}Repository.findBy{{viewField.namePascalCase}}({{../when.nameCamelCase}}.get{{eventField.namePascalCase}}());
                    for({{../../namePascalCase}} {{../../nameCamelCase}} : {{../../nameCamelCase}}List){
                    // view 객체에 이벤트의 eventDirectValue 를 set 함
                {{# ../fieldMapping}}
{{#if (isOperator ./operator )}}
    {{#if eventField.value }}
                    {{../../../nameCamelCase}}.set{{viewField.namePascalCase}}({{{eventField.value}}});
    {{else}}
                    {{../../../nameCamelCase}}.set{{viewField.namePascalCase}}({{../../when.nameCamelCase}}.get{{eventField.namePascalCase}}());
    {{/if}}
{{else}}
    {{#if eventField.value }}
                    {{../../../nameCamelCase}}.set{{viewField.namePascalCase}}({{../../../nameCamelCase}}.get{{viewField.namePascalCase}}() {{{replaceOperator ./operator }}}  {{{eventField.value}}});
    {{else}}
                    {{../../../nameCamelCase}}.set{{viewField.namePascalCase}}({{../../../nameCamelCase}}.get{{viewField.namePascalCase}}() {{{replaceOperator ./operator }}} {{../../when.nameCamelCase}}.get{{eventField.namePascalCase}}());
    {{/if}}
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
            {{../../nameCamelCase}}Repository.deleteById({{../when.nameCamelCase}}.get{{eventField.namePascalCase}}());
        {{/viewField.isKey}}
        {{^viewField.isKey}}
            {{../../nameCamelCase}}Repository.deleteBy{{viewField.namePascalCase}}({{../when.nameCamelCase}}.get{{eventField.namePascalCase}}());
        {{/viewField.isKey}}
    {{/where}}
        }catch (Exception e){
            e.printStackTrace();
        }
    }
    {{/deleteRules}}
}


<function>
window.$HandleBars.registerHelper('isOperator', function (value) {
        return value == '=';
        });
window.$HandleBars.registerHelper('replaceOperator', function (value) {
        value = value.replace('=','')
        return new window.$HandleBars.SafeString(value);
});
</function>