import Vue from 'vue'
import './plugins/vuetify'
import 'vuetify/dist/vuetify.min.css'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import VueJWT from 'vuejs-jwt'
import VModal from 'vue-js-modal'
import Opengraph from './components/opengraph'
import VueGtag from 'vue-gtag'
import VueSuperMethod from 'vue-super-call'
import VueCookies from "vue-cookies";
import VueMarkdown from 'vue-markdown';
import VueSimplemde from 'vue-simplemde'
import VeeValidate from 'vee-validate';
import VueMeta from 'vue-meta'
import TreeView from 'vue-json-tree-view'
import Mustache from 'mustache'
import handleBars from 'handlebars';
import firebase from "firebase/app";
import VueFriendlyIframe from 'vue-friendly-iframe';
import CodeMirror from 'vue-codemirror'
import VueYouTubeEmbed from 'vue-youtube-embed'
import 'vue-simple-context-menu/dist/vue-simple-context-menu.css'
import VueSimpleContextMenu from 'vue-simple-context-menu'
import vClickOutside from "v-click-outside";
import VRuntimeTemplate from "v-runtime-template";
import EventStormingListPage from "./components/listPages/EventStormingListPage";
import AlgoliaModelLists from "./components/listPages/AlgoliaModelLists";
import ClazzListPage from "./components/labs/ClazzListPage";
import LoginAcebase from './components/oauth/LoginByAcebase';
import Login from './components/oauth/Login';
// import Login from "./components/oauth/SignInWithRedirect";
import LoginGitlab from './components/oauth/LoginByGitlab';
import {ResizeObserver} from 'vue-resize'
import * as VueWindow from '@hscmap/vue-window'
import i18n from './i18n'
import {WebRTC} from 'vue-webrtc'
import 'vue-resize/dist/vue-resize.css'
import 'simplemde/dist/simplemde.min.css';
import './registerServiceWorker'
import CKEditor from 'ckeditor4-vue';
require('dotenv').config();
import JumpToModelLists from "./components/designer/modeling/generators/JumpToModelLists";
import JumpToModelListCard from "./components/designer/modeling/generators/JumpToModelListCard";
import DetailComponent from './components/ui/DetailComponent.vue';

var JsonDiff = require('jsondiffpatch').create({
    objectHash: function (obj, index) {
        return '$$index:' + index;
    },
});

//Vue Plugin
Vue.use(VueMeta)
Vue.use(Opengraph);
Vue.use(VueGtag, { config: {id: process.env.VUE_APP_FIREBASE_trackingId} });
//??
Vue.use(vClickOutside);
Vue.use(VueCookies);
Vue.use(VueFriendlyIframe);
Vue.use(Mustache);
Vue.use(VModal);
Vue.use(handleBars);
Vue.use(VeeValidate);
Vue.use(CodeMirror)
Vue.use(VueWindow)
Vue.use(CKEditor)
Vue.component(WebRTC.name, WebRTC)
Vue.component('v-runtime-template', VRuntimeTemplate)
// Vue.component('project-list', EventStormingListPage)
Vue.component('project-list', AlgoliaModelLists)
Vue.component('class-list', ClazzListPage)
Vue.component('GitlabLogin', LoginGitlab)
if(window.MODE == "onprem" || window.MODE == "bpm") {
    Vue.component('Login', LoginAcebase)
} else {
    Vue.component('Login', Login)
}
Vue.component('VueMarkdown', VueMarkdown)
Vue.component('vue-simplemde', VueSimplemde)
Vue.component('vue-simple-context-menu', VueSimpleContextMenu)
Vue.component('resize-observer', ResizeObserver)
Vue.component('jump-to-model-lists-card', JumpToModelListCard)
Vue.component('detail-component', DetailComponent)


Vue.$cookies.config("7d");
import {Icon} from '@iconify/vue2';
Vue.component('Icon', Icon);


// setting locale
try{
    window.countryCode = 'ko'

    $.getJSON("https://ipinfo.io", function (data) {
        var country = data.country // 접속자 국가
        if (country == "KR") {
            window.countryCode = 'ko'
        } else {
            window.countryCode = 'en'
        }
    });
}catch (e) {
    window.countryCode = 'ko'
}

require('../public/global-style.css');
// Vue.use(Metaworks4);


//IAMPort Pay
try{
    var IMP = window.IMP;
    IMP.init(`${process.env.VUE_APP_IAMPORT_ImpKey}`)
}catch (e) {
    console.log('Network disconnected.')

}
// algolia
import 'instantsearch.css/themes/reset.css';
import 'instantsearch.css/themes/satellite.css';
// import algoliasearch from 'algoliasearch/lite';
const algoliasearch = require('algoliasearch');
import InstantSearch from 'vue-instantsearch';

const ALGOLIA_POSTS_INDEX_NAME = 'definitions'
const alClient = algoliasearch(process.env.VUE_APP_ALGOLIA_APP_ID, process.env.VUE_APP_ALGOLIA_API_KEY);
const alIndex = alClient.initIndex(ALGOLIA_POSTS_INDEX_NAME);
Vue.prototype.$searchClient = alClient
Vue.prototype.$searchIndex = alIndex
Vue.prototype.$searchName = ALGOLIA_POSTS_INDEX_NAME;
Vue.use(InstantSearch);

var options = {'keyName': 'accessToken'};
Vue.component('vue-context-menu', VueSimpleContextMenu)
Vue.use(VueJWT, options)
Vue.use(VueYouTubeEmbed, {global: true, componentId: "youtube-media"})
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

Vue.prototype.$EventBus = new Vue()
Vue.prototype.$ModelingBus = new Vue()
Vue.prototype.$JsonDiff = JsonDiff
Vue.prototype.$super = VueSuperMethod

Vue.use(TreeView)

function getTenantId() {
    var urlStr = window.location;
    var url = new URL(urlStr);

    var tenantId = url.hostname;
    if (tenantId.includes(".")) {
        tenantId = tenantId.substring(tenantId.indexOf(".") + 1)
    }
    return tenantId;  //www.gklabs.co.kr?  -->
}

if (navigator.userAgent.toLowerCase().indexOf('electron/') > -1 ) {
    Vue.prototype.$isElectron = true
}

window.$Mustache = Mustache;
window.$HandleBars = handleBars;

// TrackJS -- Error Logging
var firebaseConfig = {
    apiKey: process.env.VUE_APP_FIREBASE_apiKey,
    authDomain: 'www.msaez.io',
    databaseURL: process.env.VUE_APP_FIREBASE_databaseURL,
    projectId: process.env.VUE_APP_FIREBASE_projectId,
    storageBucket: process.env.VUE_APP_FIREBASE_storageBucket,
    messagingSenderId: process.env.VUE_APP_FIREBASE_messagingSenderId,
    appId: process.env.VUE_APP_FIREBASE_appId,
    measurementId: process.env.VUE_APP_FIREBASE_measurementId
};

// var mongoConfig = {
//     id: process.env.VUE_APP_MONGODB_ID,
//     password: process.env.VUE_APP_MONGODB_PASSWORD
// }

// Vue.prototype.$mongodb = mongoConfig;

firebase.initializeApp(firebaseConfig);
// firebase.analytics();
if (process.env.NODE_ENV == "development") {
    window.API_HOST = "35.200.104.173";
} else {
    window.API_HOST = process.env.VUE_APP_API_HOST
}
window.vueFilePath = process.env.VUE_APP_FILE_PATH



/////////////// template & Base /////////////////////
// const templateFiles = require.context('../public/static/templates', true)
// var tempRootPathList = []
// templateFiles.keys().forEach(function (templateFile) {
//     // templateFile = "./spring-boot/for-model/gateway/src/main/resources/application.yml"
//     var tempFileStructure = templateFile.replace('./', '').split('/')
//     tempRootPathList.push(tempFileStructure[0])
// })
// tempRootPathList.push('Custom Template')


// var tempRootPath = new Set(tempRootPathList)
// var rootPathList = Array.from(tempRootPath)
// // rootPathList = ['spring-boot', '' ...]

Vue.prototype.$manifestsPerTemplate = {};
Vue.prototype.$manifestsPerBaseTemplate = {};

// rootPathList.forEach(function (item) {
//     if(item){
//         eval('Vue.prototype.$manifestsPerTemplate[\"' + item + '\"] = []');
//         eval('Vue.prototype.$manifestsPerBaseTemplate[\"' + item + '\"] = []');
//     }
// })


// templateFiles.keys().forEach(function (templateFile) {
//     var tempFileStructure = templateFile.replace('./', '').split('/')
//     var rootName = tempFileStructure[0]
//     var tmp = null;
//     eval(`tmp = templateFile.replace("${rootName}/","")`)

//     if(templateFile.includes(`${rootName}/for-model/`) ){
//         eval(`Vue.prototype.$manifestsPerBaseTemplate['${rootName}'].push(tmp)`)
//     }else{
//         // eval('tmp' + '= tempFiles.replace(\"' + rootName + '\/\",\"\"\)')
//         eval(`Vue.prototype.$manifestsPerTemplate['${rootName}'].push(tmp)`)
//     }
// })
// //////////////////////////////////////////

// //////////////////// toppings /////////////
// const toppingFiles = require.context('../public/static/toppings', true)
// var toppingRootPathList = []

// toppingFiles.keys().forEach(function (toppingFile) {
//     // console.log("topping :  " + toppingFile)
//     var tempFileStructure = toppingFile.replace('./', '').split('/')
//     toppingRootPathList.push(tempFileStructure[0])
// })

// var toppingRootPath = new Set(toppingRootPathList)
// var toppingRootPathLists = Array.from(toppingRootPath)

Vue.prototype.$manifestsPerToppings = {};

// toppingRootPathLists.forEach(function (item) {
//     eval('Vue.prototype.$manifestsPerToppings[\"' + item + '\"] = []')
// })
// toppingFiles.keys().forEach(function (tempFiles) {
//     var tempFileStructure = tempFiles.replace('./', '').split('/')
//     var rootName = tempFileStructure[0]
//     var tmp;
//     eval('tmp' + '= tempFiles.replace(\"' + rootName + '\/\",\"\"\)')
//     eval('Vue.prototype.$manifestsPerToppings[\"' + rootName + '\"].push(tmp)')
// })
// ////////////////////////////////////////////////


Vue.prototype.$innerWidth = window.innerWidth;
Vue.prototype.$innerHeight = window.innerHeight;


Vue.config.productionTip = false

new Vue({
    router,
    store,
    vuetify,
    i18n,
    WebRTC,
    render: function (h) {
        return h(App)
    }

}).$mount('#app')

