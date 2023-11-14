forEach: BoundedContext
fileName: Route.go
path: {{name}}/{{name}}
---
package {{name}}

import (
	"github.com/labstack/echo"
	"net/http"
)

func RouteInit() *echo.Echo {
	e := echo.New()
	e.GET("/healthcheck", func(c echo.Context) error {
		return c.JSON(http.StatusOK, "ok")
	})
	{{#aggregates}}
	{{nameCamelCase}} := &{{namePascalCase}}{}
	e.GET("/{{namePlural}}", {{nameCamelCase}}.Get)
	e.GET("/{{namePlural}}/:id", {{nameCamelCase}}.FindById)
	e.POST("/{{namePlural}}", {{nameCamelCase}}.Persist)
	e.PUT("/{{namePlural}}/:id", {{nameCamelCase}}.Put)
	e.DELETE("/{{namePlural}}/:id", {{nameCamelCase}}.Remove)
	{{#commands}}
		{{#isRestRepository}}
		{{/isRestRepository}}
		{{^isRestRepository}}
	e.{{controllerInfo.method}}("/{{../namePlural}}/{{controllerInfo.apiPath}}", {{namePascalCase}})
		{{/isRestRepository}}
	{{/commands}}
	{{/aggregates}}
	{{#views}}
	{{nameCamelCase}} := &{{namePascalCase}}{}
	e.GET("/{{namePlural}}", {{nameCamelCase}}.Get)
	e.GET("/{{namePlural}}/:id", {{nameCamelCase}}.FindById)
	e.POST("/{{namePlural}}", {{nameCamelCase}}.Persist)
	e.PUT("/{{namePlural}}/:id", {{nameCamelCase}}.Put)
	e.DELETE("/{{namePlural}}/:id", {{nameCamelCase}}.Remove)
	{{/views}}
	return e
}
