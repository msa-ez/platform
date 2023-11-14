forEach: View
fileName: {{namePascalCase}}DB.go
path: {{boundedContext.name}}/{{boundedContext.name}}
---
package {{boundedContext.name}}
import (
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"log"
)

type {{namePascalCase}}DB struct{
	db *gorm.DB
}

var {{nameCamelCase}}Repository *{{namePascalCase}}DB

func {{namePascalCase}}DBInit() {
	var err error
	{{nameCamelCase}}Repository = &{{namePascalCase}}DB{}
	{{nameCamelCase}}Repository.db, err = gorm.Open(sqlite.Open("{{namePascalCase}}_table.db"), &gorm.Config{})
	
	if err != nil {
		panic("DB Connection Error")
	}
	{{nameCamelCase}}Repository.db.AutoMigrate(&{{namePascalCase}}{})

}

func {{namePascalCase}}Repository() *{{namePascalCase}}DB {
	return {{nameCamelCase}}Repository
}


func (self *{{namePascalCase}}DB)save(entity interface{}) error {

	tx := self.db.Create(entity)

	if tx.Error != nil {
		log.Print(tx.Error)
		return tx.Error
	}
	return nil
}

func (self *{{namePascalCase}}DB)GetList() []{{namePascalCase}}{

	entities := []{{namePascalCase}}{}
	self.db.Find(&entities)

	return entities
}

func (self *{{namePascalCase}}DB)FindById(id int) (*{{namePascalCase}}, error){
	entity := &{{namePascalCase}}{}
	txDb := self.db.Where("id = ?", id)
	if txDb.Error != nil {
		return nil, txDb.Error
	} else {
		txDbRow := txDb.First(entity)
		if txDbRow.Error != nil {
			return nil, txDbRow.Error
		}
		return entity, nil
	}
}

func (self *{{namePascalCase}}DB) Delete(entity *{{namePascalCase}}) error{
	err2 := self.db.Delete(&entity).Error
	return err2
}

func (self *{{namePascalCase}}DB) Update(id int, params map[string]string) (*{{namePascalCase}}, error){
	entity := &{{namePascalCase}}{}
	txDb := self.db.Where("id = ?", id)
	if txDb.Error != nil {
		return nil, txDb.Error
	} else {
		txDbRow := txDb.First(entity)
		if txDbRow.Error != nil {
			return nil, txDbRow.Error
		}
		update := &{{namePascalCase}}{}
		err := ObjectMapping(update, params)
		if err != nil {
			return nil, err
		}
		self.db.Model(&entity).Updates(update)

		return entity, nil
	}
}