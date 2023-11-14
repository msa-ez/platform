forEach: BoundedContext
fileName: Hateoas.py
path: {{name}}
---
import json
from collections import OrderedDict

def GET_id_response(base_url, entity):
	response=OrderedDict()
	entity_name = entity.__class__.__name__.lower()

	response['_links'] = {
		entity_name :{ 					
			'href':base_url
		},
		'self':{
			'href':base_url
		}
	}

	entity_dict = entity.__dict__
	for key, value in entity_dict.items():
		if key != '_sa_instance_state' and key != 'id':
			response[key] = value
	return response

def POST_response(base_url, entity):
	response = OrderedDict()
	url = base_url + '/'+ str(entity.id)
	entity_name = entity.__class__.__name__.lower()

	response['_links'] = {
		entity_name: {
			'href': url
		},
		'self':{
			'href': url
		}
	}
	
	entity_dict = entity.__dict__
	for key, value in entity_dict.items():
		if key != '_sa_instance_state' and key != 'id':
			response[key] = value
	return response

def GET_list_response(url_root,base_url,entity_list):
	totalElements = len(entity_list)
	size = 20
	number = totalElements//size
	response = OrderedDict()
	obj_list = []

	for ele in entity_list:
		obj_dict = OrderedDict()
		ele_dict = ele.__dict__
		ele_name = ele.__class__.__name__.lower()
		url = base_url + '/'+str(ele.id)
		
		obj_dict['_links'] = {
			ele_name: {
				"href":url
			},
			"self":{
				"href":url
			}
		}
		
		for key, value in ele_dict.items():
			if key != '_sa_instance_state' and key != 'id':
				obj_dict[key] = value

		obj_list.append(obj_dict)

	target = base_url.split("/")[-1]
	embedded = {}
	embedded[target] = obj_list
	response['_embedded'] = obj_list
	response['_links'] = {
		'profile' : {
			'href': url_root+"profile/"+target
		},
		'self':{
			'href': base_url+"{?page,size,sort}",
			'templated': True
		}
	}
	response['page']={
		'number': str(number),
		'size': str(size),
		'totalElements':str(totalElements),
		'totalPages': str(number+1)
	}
	return response