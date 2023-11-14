package config

import (
	"flag"
	"log"

	"github.com/alyu/configparser"
)

var Mode *string

func ConfigMode() {
	Mode = flag.String("platform", "Default", "select mode")
	flag.Parse()

}

func GetMode() string {
	return *Mode
}

func Reader(platform string) map[string]string {

	configparser.Delimiter = "="

	config, err := configparser.Read("config/config.ini")
	if err != nil {
		log.Fatal(err)
	}
	section, _ := config.Section(platform)
	options := section.Options()

	return options
}
