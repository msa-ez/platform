forEach: Aggregate
fileName: {{namePlural}}.js
path: {{boundedContext.name}}/routes
---
var express = require('express');
var router = express.Router();
var repository = require('../repository/{{namePascalCase}}Repository');

var name = "{{nameCamelCase}}";

router.post('/', function(req, res, next) {
  
  repository.save(req.body).then(result => {
    res.json(hateoas.hal_post(result.dataValues, req, name));
  })
  

});

router.get('/', function(req,res,next){
  repository.read().then(result => {
    res.json(hateoas.hal_get_list(result, req, name));
  });
});

router.get('/:id', function(req,res,next){
  repository.read_by_id(req.params.id).then(result=>{
    res.json(hateoas.hal_get_id(result, req, name));
  });
});

router.put('/:id', function(req,res,next){
  repository.update(req.params.id, req.body).then(result=>{
    res.json(hateoas.hal_get_id(result, req, name));
  });
})

router.delete('/:id', function(req,res,next){
  repository.delete(req.params.id).then(result=> {
    res.json(result)
  });
})

{{#commands}}
{{^isRestRepository}}
router.{{#methodCheck controllerInfo.method}}{{/methodCheck}}('/{{controllerInfo.apiPath}}', function(req, res, next){
  // LOGIC GOES HERE
  return "COMMAND TYPE"
})

{{/isRestRepository}}
{{/commands}}

module.exports = router;

<function> 
  window.$HandleBars.registerHelper('methodCheck', function (method) {
      if(method.endsWith("POST")){
          return "post"
      }
      else if(method.endsWith("GET")){
          return "get"
      }
      else if(method.endsWith("UPDATE")){
        return "put"
      }
      else if(method.endsWith("DELETE")){
        return "destroy"
      }
  });
</function>
