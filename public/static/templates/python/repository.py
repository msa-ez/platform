forEach: Aggregate
fileName: {{namePascalCase}}Repository.py
path: {{boundedContext.name}}
---
from flask import Response, request

import {{namePascalCase}}DB
import util
from {{namePascalCase}} import {{namePascalCase}}

repository = {{namePascalCase}}DB.repository

def Create(request):
    entity = {{namePascalCase}}()
    entity = util.AutoBinding(request.json, entity)
    repository.save(entity)

    return entity
    
def Read(request):
    entity_list = repository.list()
    
    return entity_list

def Read_by_id(id):
    
    ele = repository.find_by_id(id)

    return ele

def Update(id, request):
    
    ele = repository.update(id, request.json)
    
    return ele

def Delete(id):
    ele = repository.delete(id)
    
    return ele