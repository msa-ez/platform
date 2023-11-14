// // import Dashboard from './views/dashboardpage.vue'
// //import Introduce from './components/EventStormingList/Introduce.vue'
// //import LabsListPage from './components/labs/LabsListPage.vue'
// // import AdminClazzListPage from "./components/labs/AdminClazzListPage"
// // import AdminLabsListPage from "./components/labs/AdminLabsListPage"
// //import UserGroupPage from "./components/labs/UserGroupPage"

// import Vue from 'vue'
// import Router from 'vue-router'
// import ModelerRouter from './components/designer/ModelerRouter'
// import ProcessDesigner from './components/designer/process/ProcessDesigner'
// import ModelerImageGenerator from './components/designer/ModelerImageGenerator'
// import ViewModelingDesigner from "./components/designer/modeling/ViewModelingDesigner";
// import EventStormingModelCanvas from "./components/designer/es-modeling/EventStormingModelCanvas";
// import GitlabRedirectPage from "./components/oauth/GitlabRedirectPage";
// // import bpmnClassModeler from './front-end/src/components/designer/class-modeling/ClassModeler'


// //
// import StartElectron from "./components/labs/StartElectron"
// import LabPortal from "./components/labs/LabPortal"
// import EventStorming from "./components/designer/es-modeling/EventStorming";
// import ClassModeler from './components/designer/class-modeling/ClassModeler'
// import ReplayPortal from "./components/designer/modeling/ReplayPortal";
// import BusinessModelCanvas from "./components/designer/business-model-canvas/BusinessModelCanvas";
// import IdeLoadingPage from "./components/IdeLoadingPage";
// import KubernetesModelCanvas from "./components/designer/k8s-modeling/KubernetesModelCanvas";
// import StickyModelCanvas from "./components/designer/sticky-modeling/StickyModelCanvas";
// import BpmnModelCanvas from "./components/designer/bpmnModeling/BpmnModelCanvas";
// import ClazzListPage from './components/labs/ClazzListPage'
// import labAdminTest from "./components/labs/labAdminTest";
// import ManagePurchaseItemListPage from "./components/ManagePurchaseItemListPage";
// import PersonalInfo from "./components/oauth/PersonalInfo";
// import ClassRounge from "./components/labs/ClassRounge"
// import ClassRoom from "./components/labs/ClassRoom"
// import LabLocator from "./components/labs/LabLocator"
// import labMonitoring from "./components/labs/labMonitoring";
// import EventModeler from './components/designer/class-modeling/EventModeler'
// import BigEventStorming from "./components/designer/business-model-canvas/BigEventStorming"
// import LoginPage from "./components/labs/LoginPage"
// import BpmnProcessDesigner from "./components/designer/bpmnModeling/ProcessDesigner";
// import MyPageManager from "./components/oauth/MyPageManager";
// import SignInHelper from "./components/oauth/SignInHelper"
// import Provision from "./components/payment/Provision";



// Vue.use(Router)

// // Vue.component('bpmn-class-modeler', bpmnClassModeler)
// Vue.component('bpmn-process-designer', BpmnProcessDesigner)
// Vue.component('modeler-router', ModelerRouter);
// Vue.component('modeler-image-generator', ModelerImageGenerator);
// Vue.component('process-designer', ProcessDesigner);
// Vue.component('event-modeler', EventModeler)
// Vue.component('class-modeler', ClassModeler)
// Vue.component('view-modeling-designer', ViewModelingDesigner);
// Vue.component('business-model-canvas', BusinessModelCanvas);
// Vue.component('big-event-storming', BigEventStorming);
// Vue.component('event-storming-model-canvas', EventStormingModelCanvas);
// Vue.component('kubernetes-model-canvas', KubernetesModelCanvas)
// Vue.component('sticky-model-canvas', StickyModelCanvas)
// Vue.component('bpmn-model-canvas', BpmnModelCanvas)
// Vue.component('managePurchaseItemListPage', ManagePurchaseItemListPage)
// Vue.component('MyPageManager', MyPageManager)
// Vue.component('EventStorming', EventStorming)

// ////////////////////////
// // const StartElectron = ()=>
// //     import(/* webpackChunkName: "startelectron" */ './components/labs/StartElectron')
// // const LabPortal = ()=>
// //     import(/* webpackChunkName: "LabPortal" */ './components/labs/LabPortal')
// // const EventStorming = ()=>
// //     import(/* webpackChunkName: "EventStorming" */ './components/designer/es-modeling/EventStorming')
// // const ClassModeler = ()=>
// //     import(/* webpackChunkName: "ClassModeler" */ './components/designer/class-modeling/ClassModeler')
// // const ReplayPortal = ()=>
// //     import(/* webpackChunkName: "ReplayPortal" */ './components/designer/modeling/ReplayPortal')
// // const BusinessModelCanvas = ()=>
// //     import(/* webpackChunkName: "BusinessModelCanvas" */ './components/designer/business-model-canvas/BusinessModelCanvas')
// // const IdeLoadingPage = ()=>
// //     import(/* webpackChunkName: "IdeLoadingPage" */ './components/IdeLoadingPage')
// // const KubernetesModelCanvas = ()=>
// //     import(/* webpackChunkName: "KubernetesModelCanvas" */ './components/designer/k8s-modeling/KubernetesModelCanvas')
// // const StickyModelCanvas = ()=>
// //     import(/* webpackChunkName: "StickyModelCanvas" */ './components/designer/sticky-modeling/StickyModelCanvas')
// // const BpmnModelCanvas = ()=>
// //     import(/* webpackChunkName: "BpmnModelCanvas" */ './components/designer/bpmnModeling/BpmnModelCanvas')
// // const ClazzListPage = ()=>
// //     import(/* webpackChunkName: "ClazzListPage" */ './components/labs/ClazzListPage')
// // const labAdminTest = ()=>
// //     import(/* webpackChunkName: "labAdminTest" */ './components/labs/labAdminTest')
// // const ManagePurchaseItemListPage = ()=>
// //     import(/* webpackChunkName: "ManagePurchaseItemListPage" */ './components/ManagePurchaseItemListPage')
// // const PersonalInfo = ()=>
// //     import(/* webpackChunkName: "PersonalInfo" */'./components/oauth/PersonalInfo')
// // const ClassRounge = ()=>
// //     import(/* webpackChunkName: "ClassRounge" */'./components/labs/ClassRounge')
// // const ClassRoom = ()=>
// //     import(/* webpackChunkName: "ClassRoom" */'./components/labs/ClassRoom')
// // const LabLocator = ()=>
// //     import(/* webpackChunkName: "LabLocator" */'./components/labs/LabLocator')
// // const labMonitoring = ()=>
// //     import(/* webpackChunkName: "labMonitoring" */'./components/labs/labMonitoring')
// // const EventModeler = ()=>
// //     import(/* webpackChunkName: "EventModeler" */'./components/designer/class-modeling/EventModeler')
// // const BigEventStorming = ()=>
// //     import(/* webpackChunkName: "BigEventStorming" */'./components/designer/business-model-canvas/BigEventStorming')
// // const LoginPage = ()=>
// //     import(/* webpackChunkName: "LoginPage" */'./components/labs/LoginPage')
// // const BpmnProcessDesigner = ()=>
// //     import(/* webpackChunkName: "ProcessDesigner" */'./components/designer/bpmnModeling/ProcessDesigner')
// // const MyPageManager = ()=>
// //     import(/* webpackChunkName: "MyPageManager" */'./components/oauth/MyPageManager')
// // const SignInHelper = ()=>
// //     import(/* webpackChunkName: "SignInHelper" */'./components/oauth/SignInHelper')
// // const Provision = ()=>
// //     import(/* webpackChunkName: "Provision" */'./components/payment/Provision')
// /////////////////////////


// var options = {
//     // mode: 'history',
//     base: process.env.BASE_URL,

//     routes: [
//         {
//             path: '/start-Electron',
//             name: 'Start-Electron',
//             component: StartElectron
//         },

//         {
//             path: '/',
//             name: 'EventStormingListPages',
//             component: LabPortal//ListPages
//         },
//         {
//             path: '/storming/:userUid/:projectId',
//             name: 'EventStormingCanvas',
//             component:  EventStorming // EventStormingModelCanvas  EventStorming
//         },
//         {
//             path: '/uml-class/:aggregateId',
//             name: 'UMLClassCanvas',
//             component: ClassModeler
//         },
//         {
//             path: '/replay/:projectId/:snapshotKey/:queueKey',
//             name: 'ReplayPortal',
//             component: ReplayPortal
//         },
//         {
//             path: '/business-model-canvas/:userUid/:projectId',
//             name: 'BusinessModelCanvas',
//             component: BusinessModelCanvas
//         },
//         {
//             path: '/IdeLoadingPage',
//             name: 'IdeLoadingPage',
//             component: IdeLoadingPage
//         },
//         {
//             path: '/kubernetes/:userUid/:projectId',
//             name: 'KubeModelingCanvas',
//             component: KubernetesModelCanvas,
//         },
//         {
//             path: '/sticky/:userUid/:projectId',
//             name: 'StickyModelCanvas',
//             component: StickyModelCanvas,
//         },
//         {
//             path: '/bpmn/:userUid/:projectId',
//             name: 'BpmnModelCanvas',
//             component: BpmnModelCanvas
//         },
//         {
//             path: '/uml/:userUid/:projectId',
//             name: 'ClassModeler',
//             component: ClassModeler
//         },
//         {
//             path: '/courses',
//             name: 'classList',
//             component: ClazzListPage
//         },
//         {
//             path: '/courses/labAdminTest',
//             name: 'labAdminTest',
//             component: labAdminTest
//         },
//         {
//             path: '/manager',
//             name: 'ManagePurchaseItemListPage',
//             component: ManagePurchaseItemListPage
//         },
//         {
//             path: '/userInfo/:userUid',
//             name: 'PersonalInfo',
//             component: PersonalInfo
//         },
//         // {
//         //     path: '/courses/admin',
//         //     name: 'adminClazzList',
//         //     component: AdminClazzListPage
//         // },
//         {
//             path: '/courses/:courseId/:classId',
//             name: 'ClassRounge',
//             component: ClassRounge,
//         },
//         {
//             path: '/courses/:courseId/:classId/:labId/class-room',
//             name: 'classRoom',
//             component: ClassRoom,
//         },
//         {
//             path: '/courses/:courseId/:classId/:labId',
//             name: 'labLocator',
//             component: LabLocator,
//         },
//         {
//             path: '/courses/:courseId/:classId/:labId/:userId',
//             name: 'labLocator',
//             component: LabLocator,
//         },
//         {
//             path: '/courses/monitor',
//             name: 'monitor',
//             component: labMonitoring
//         },
//         {
//             path: '/courses/:course/:clazzName/:labName/eventstorming',
//             name: 'EventStormingCanvas',
//             component: EventModeler
//         },
//         {
//             path: '/big-event-storming',
//             name: 'BigEventStorming',
//             component: BigEventStorming

//         },
//         {
//             path: '/login-page',
//             name: 'LoginPage',
//             component: LoginPage
//         },

//         {
//             path: '/bpmn',
//             name: 'BpmnProcessDesigner',
//             component: BpmnProcessDesigner
//         },
//         {
//             path: '/myPage',
//             name: 'MyPage',
//             component: MyPageManager
//         },
//         {
//             path: '/sign-in-helper',
//             name: 'SignInHelper',
//             component: SignInHelper
//         },
//         {
//             path: '/oauth/gitlab',
//             name: 'GitlabRedirectPage',
//             component: GitlabRedirectPage
//         },
//         {
//             path: '/provision',
//             name: 'Provision',
//             component: Provision
//         }
//         // {
//         //     path: '/courses/student/:course/:clazzName',
//         //     name: 'labs',
//         //     component: LabsListPage
//         // },

//     ]
// }
// // if(window.MODE == "onprem") {
// //     options["mode"] = "history"
// // }

// export default new Router(options)
