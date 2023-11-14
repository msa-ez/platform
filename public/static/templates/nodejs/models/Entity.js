forEach: Aggregate
fileName: {{namePascalCase}}.js
path: {{boundedContext.name}}/models
---
{{#events}}
const {{namePascalCase}} = require('../event/{{namePascalCase}}');
{{/events}}
{{#relationCommandInfo}}
{{#commandValue}}
{{namePascalCase}} = require('../external/{{namePascalCase}}');
{{namePascalCase}}Service = require('../external/{{namePascalCase}}Service');
{{/commandValue}}
{{/relationCommandInfo}}
const objectmapping = require('../util/util')

module.exports = (sequelize, DataTypes) => class {{namePascalCase}} extends DataTypes.Model{
  static init(sequelize, DataTypes){
    return super.init(
    {
      {{#aggregateRoot.fieldDescriptors}}
      {{^isKey}}
      {{nameCamelCase}}: {
        type: DataTypes.{{#typeCheckinEntity className}}{{/typeCheckinEntity}},
        allowNull: true,
      },
      {{/isKey}}
      {{/aggregateRoot.fieldDescriptors}}
    },
    {   
        sequelize,
        timestamps: false,
        tableName: '{{namePascalCase}}',
        hooks:{
          {{#lifeCycles}}
          {{#triggerCheck trigger}}{{/triggerCheck}} : function({{../nameCamelCase}}){
              {{#events}}
              var {{nameCamelCase}} = new {{namePascalCase}}();
              {{nameCamelCase}} = objectmapping({{../../nameCamelCase}}.dataValues, {{nameCamelCase}});
              {{nameCamelCase}}.Publish();

              {{#relationCommandInfo}}
              {{#commandValue}}
              var {{nameCamelCase}} = new {{namePascalCase}}();
              {{namePascalCase}}Service(function(response){
                console.log(response);
              });
              {{/commandValue}}
              {{/relationCommandInfo}}
              {{/events}}
          },
          {{/lifeCycles}}
        }
    })
  }
};


<function>
  window.$HandleBars.registerHelper('typeCheckinEntity', function (className) {
      console.log('typeof ClassName', typeof className);
      if(className.endsWith("String")){
          return "STRING(100)"
      }
      else if(className.endsWith("Integer")){
        return "INTEGER()"
      }
      else if(className.endsWith("Float")){
        return "FLOAT()"
      }
      else if(className.endsWith("Long")){
        return "BIGINT()"
      }
      else if(className.endsWith("Boolean")){
        return "BOOLEAN()"
      }
      else if(className.endsWith("Double")){
        return "DOUBLE()"
      }
  
  });

  window.$HandleBars.registerHelper('triggerCheck', function (trigger) {
      if(trigger.endsWith("PreRemove")){
          return "beforeDestroy"
      }
      else if(trigger.endsWith("PostRemove")){
          return "afterDestroy"
      }
      else if(trigger.endsWith("PrePersist")){
        return "beforeCreate"
      }
      else if(trigger.endsWith("PostPersist")){
        return "afterCreate"
      }
      else if(trigger.endsWith("PreUpdate")){
        return "beforeUpdate"
      }
      else{
        return "afterUpdate"
      }
  });
  
  window.$HandleBars.registerHelper('commandValueExists', function(events, options){
  for(var ele in events){
    if(events[ele]['relationCommandInfo'].length!=0){
      return options.fn(this)
    }
  }
  return options.inverse(this)
  
  })
</function>