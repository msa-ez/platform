forEach: BoundedContext
fileName: util.go
path: {{name}}/{{name}}
---
package {{name}}

import (
	"encoding/json"
	"github.com/iancoleman/strcase"
	"reflect"
	"strconv"
)

func ObjectMapping(anything interface{}, request map[string]string) error {
	target := reflect.ValueOf(anything)
	elements := target.Elem()
	for i := 0; i < elements.NumField(); i++ {
		mType := elements.Type().Field(i)
		structFieldValue := elements.FieldByName(mType.Name)
		temp, ok := request[strcase.ToLowerCamel(mType.Name)]
		if ok {
			fieldType := structFieldValue.Type()
			val := reflect.ValueOf(temp)
			if fieldType.String() == "string" {
				val = reflect.ValueOf(temp)
			} else if fieldType.String() == "int" {
				if v, err := strconv.ParseInt(temp, 10, 64); err == nil {
					val = reflect.ValueOf(v)
				}else{
					return err
				}
			} else if fieldType.String() == "float64" {
				if f, err := strconv.ParseFloat(temp, 64); err == nil {
					val = reflect.ValueOf(f)
				}else{
					return err
				}
			} else if fieldType.String() == "bool" {
				if b, err := strconv.ParseBool(temp); err == nil {
					val = reflect.ValueOf(b)
				}else{
					return err
				}
			}
			structFieldValue.Set(val.Convert(fieldType))
		}
	}
	return nil
}

func ToJson(event interface{}) string {
	e, err := json.Marshal(event)
	if err != nil {

		return "ToJson error"
	}

	return string(e)
}

func Publish(event interface{}, eventType string) {
	message := ToJson(event)

	SendStreamMsg(message, eventType)
}