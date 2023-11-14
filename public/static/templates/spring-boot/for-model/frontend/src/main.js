 /*eslint-disable*/
import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import Managing from "./components";
import router from './router';
{{#if (isSelectedSecurity selectedSecurity)}}
import Keycloak from 'keycloak-js'
{{else}}
{{/if}}
Vue.config.productionTip = false;

const axios = require("axios").default;

// backend host url
axios.backend = null; //"http://localhost:8088";

// axios.backendUrl = new URL(axios.backend);
axios.fixUrl = function(original){

  if(!axios.backend && original.indexOf("/")==0) return original;

  var url = null;

  try{
    url = new URL(original);
  }catch(e){
    url = new URL(axios.backend + original);
  }

  if(!axios.backend) return url.pathname;

  url.hostname = axios.backendUrl.hostname;
  url.port = axios.backendUrl.port;

  return url.href;
}

const templateFiles = require.context("./components", true);
Vue.prototype.$ManagerLists = [];
templateFiles.keys().forEach(function(tempFiles) {
  if (!tempFiles.includes("Manager.vue") && tempFiles.includes("vue")) {
    Vue.prototype.$ManagerLists.push(
      tempFiles.replace("./", "").replace(".vue", "")
    );
  }
});
Vue.use(Managing);
const pluralCaseList = []

{{#boundedContexts}}
    {{#aggregates}}
pluralCaseList.push( {plural: "{{namePlural}}", pascal: "{{namePascalCase}}"} )
    {{/aggregates}}

    {{#views}}
pluralCaseList.push( {plural: "{{namePlural}}", pascal: "{{namePascalCase}}"} )
    {{/views}}
{{/boundedContexts}}

Vue.prototype.$ManagerLists.forEach(function(item, idx) {
  pluralCaseList.forEach(function(tmp) {
    if(item.toLowerCase() == tmp.pascal.toLowerCase()) {
      var obj = {
        name: item,
        plural: tmp.plural
      }
      Vue.prototype.$ManagerLists[idx] = obj
    }
  })
})

{{#if (isSelectedSecurity selectedSecurity)}}
let initOptions = {
  url: `http://localhost:9090/`,
  realm: `master`,
  clientId: `master`,
  onLoad: `login-required`,
};

let keycloak = Keycloak(initOptions);

init();

function init() {
  keycloak.init({
    onLoad: initOptions.onLoad,
  }).success(auth => {
    const ONE_MINUTE = 60000;
  
    if (!auth) {
      window.location.reload();
    } else {
      console.info(`Auth ok`);
    }
  
    new Vue({
      vuetify,
      router,
      render: h => h(App)
    }).$mount("#app");

    localStorage.setItem(`vue-token`, keycloak.token);
    localStorage.setItem(`vue-refresh-token`, keycloak.refreshToken);
    localStorage.setItem(`vue-idToken`, keycloak.idToken);
    localStorage.setItem(`vue-idTokenParsed`, keycloak.idTokenParsed);

    console.log(keycloak.subject);
    if (keycloak.idToken) {
        //document.location.href = "?user="+keycloak.idTokenParsed.preferred_username;
        console.log('IDToken');
        localStorage.setItem('preferred_username', keycloak.idTokenParsed.preferred_username);
        localStorage.setItem('email', keycloak.idTokenParsed.email);
        localStorage.setItem('name', keycloak.idTokenParsed.name);
        localStorage.setItem('given_name', keycloak.idTokenParsed.given_name);
        localStorage.setItem('family_name', keycloak.idTokenParsed.family_name);
        localStorage.setItem('user_roles', keycloak.tokenParsed.realm_access.roles);
        localStorage.setItem('user_client_roles', Object.values(keycloak.tokenParsed.resource_access)[1].roles);
    } else {
        keycloak.loadUserProfile(function() {
            console.log('Account Service');
            localStorage.setItem('username', keycloak.profile.username);
            localStorage.setItem('email', keycloak.profile.email);
            localStorage.setItem('name', keycloak.profile.firstName + ' ' + keycloak.profile.lastName);
            localStorage.setItem('firstName', keycloak.profile.firstName);
            localStorage.setItem('lastName', keycloak.profile.lastName);
        }, function() {
            console.log('Failed to retrieve user details. Please enable claims or account role');
        });
    }
  
    window.setTimeout(refreshToken.bind(null, keycloak), ONE_MINUTE);
  }).error(() => {
    console.error(`Auth Fail`);
  })
}

function refreshToken() {
  keycloak.updateToken(70).success(refreshed => {
    if (refreshed) {
      successRefresh(refreshed);
    } else {
      warnRefresh();
    }
  }).error(errorRefresh);
}

function successRefresh(refreshed) {
  console.debug(`Token refreshed ${refreshed}`);
}

function warnRefresh() {
  console.warn(`Token not refreshed, valid for 
  ${Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000)} seconds`);
}

function errorRefresh() {
  console.error('Failed to refresh token');
}
{{else}}
new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount("#app");
{{/if}}

<function>
	window.$HandleBars.registerHelper('isSelectedSecurity', function (selectedSecurity) {
		try{
			if(!selectedSecurity)
				return false;

			if(selectedSecurity == 'isKeycloakSecurity'){
				return true;
			}

			return;
		} catch(e){
		console.log(e)
		}
  	});
</function>
