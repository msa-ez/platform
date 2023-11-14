forEach: BoundedContext
fileName: util.py
path: {{name}}
---
def AutoBinding(source, target):
	
	if isinstance(source, dict) == True:
		source_dict = source
	else:
		source_dict = source.__dict__
	
	target_dict = target.__dict__

	for key, value in source_dict.items():
		if key in target_dict:
			setattr(target,key,value)

	return target
