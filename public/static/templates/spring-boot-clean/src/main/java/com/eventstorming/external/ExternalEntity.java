forEach: RelationCommandInfo
fileName: {{commandValue.aggregate.namePascalCase}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/external
---
package {{options.package}}.external;

{{#commandValue.aggregate}}
public class {{namePascalCase}} {

    {{#aggregateRoot.fieldDescriptors}}
    private {{className}} {{nameCamelCase}};
    {{/aggregateRoot.fieldDescriptors}}

{{#aggregateRoot.fieldDescriptors}}
    public {{className}} get{{namePascalCase}}() {
        return {{nameCamelCase}};
    }
    public void set{{namePascalCase}}({{className}} {{nameCamelCase}}) {
        this.{{nameCamelCase}} = {{nameCamelCase}};
    }
{{/aggregateRoot.fieldDescriptors}}

}
{{/commandValue.aggregate}}
