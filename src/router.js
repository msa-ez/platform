import Vue from "vue";
import Router from "vue-router";
Vue.use(Router);

import ModelerRouter from './components/designer/ModelerRouter'
import ModelerImageGenerator from './components/designer/ModelerImageGenerator'
import ProcessDesigner from './components/designer/process/ProcessDesigner'
import OpenIdRedirect from './components/oauth/OpenIdRedirect'
import ModelingResult from './components/designer/ModelingResult'
// import ViewModelingDesigner from "./components/designer/modeling/ViewModelingDesigner";
Vue.component("modeler-router", ModelerRouter);
Vue.component("modeler-image-generator", ModelerImageGenerator);
Vue.component("process-designer", ProcessDesigner);
// Vue.component('view-modeling-designer', ViewModelingDesigner);

////////////////////////
const BusinessModel = () => import(/* webpackChunkName: "BusinessModel" */ "./components/designer/business-model-canvas/BusinessModel");
const ContextMappingModel = () => import(/* webpackChunkName: "ContextMappingModel" */ "./components/designer/context-mapping-modeling/ContextMappingModel");
const CustomerJourneyMap = () => import(/* webpackChunkName: "CustomerJourneyMap" */ "./components/designer/customer-journey-map/CustomerJourneyMap");
const EventStormingModel = () => import(/* webpackChunkName: "EventStormingModel" */ "./components/designer/es-modeling/EventStormingModel");
const KubernetesModel = () => import(/* webpackChunkName: "KubernetesModel" */ "./components/designer/k8s-modeling/KubernetesModel");
const StickyModel = () => import(/* webpackChunkName: "StickyModel" */ "./components/designer/sticky-modeling/StickyModel");
const UserStoryMap = () => import(/* webpackChunkName: "UserStoryMap" */ "./components/designer/user-story-map/UserStoryMap");
const UMLClassModel = () => import(/* webpackChunkName: "UMLClassModel" */ "./components/designer/class-modeling/UMLClassModel");
const BpmnModel = () => import(/* webpackChunkName: "BpmnModel" */ "./components/designer/bpmnModeling/BpmnModel");


const StartElectron = () =>
  import(/* webpackChunkName: "startelectron" */ "./components/labs/StartElectron");
const LabPortal = () =>
  import(/* webpackChunkName: "LabPortal" */ "./components/labs/LabPortal");
const Project = () =>
  import(
    /* webpackChunkName: "EventStorming" */ "./components/designer/project-modeling/ProjectModel"
  );
const ReplayPortal = () =>
  import(
    /* webpackChunkName: "ReplayPortal" */ "./components/designer/modeling/ReplayPortal"
  );
const IdeLoadingPage = () =>
  import(
    /* webpackChunkName: "IdeLoadingPage" */ "./components/IdeLoadingPage"
  );
const ClazzListPage = () =>
  import(
    /* webpackChunkName: "ClazzListPage" */ "./components/labs/ClazzListPage"
  );
// const labAdminTest = () =>
//   import(
//     /* webpackChunkName: "labAdminTest" */ "./components/labs/labAdminTest"
//   );
const ManagePurchaseItemListPage = () =>
  import(
    /* webpackChunkName: "ManagePurchaseItemListPage" */ "./components/ManagePurchaseItemListPage"
  );
const PersonalInfo = () =>
  import(
    /* webpackChunkName: "PersonalInfo" */ "./components/oauth/PersonalInfo"
  );
const ClassRounge = () =>
  import(/* webpackChunkName: "ClassRounge" */ "./components/labs/ClassRounge");
const ClassRoom = () =>
  import(/* webpackChunkName: "ClassRoom" */ "./components/labs/ClassRoom");
const LabLocator = () =>
  import(/* webpackChunkName: "LabLocator" */ "./components/labs/LabLocator");
const labMonitoring = () =>
  import(
    /* webpackChunkName: "labMonitoring" */ "./components/labs/labMonitoring"
  );
const EventModeler = () =>
  import(
    /* webpackChunkName: "EventModeler" */ "./components/designer/class-modeling/EventModeler"
  );
const BigEventStorming = () =>
  import(
    /* webpackChunkName: "BigEventStorming" */ "./components/designer/business-model-canvas/BigEventStorming"
  );
const LoginPage = () =>
  import(/* webpackChunkName: "LoginPage" */ "./components/labs/LoginPage");
const BpmnProcessDesigner = () =>
  import(
    /* webpackChunkName: "ProcessDesigner" */ "./components/designer/bpmnModeling/ProcessDesigner"
  );
const MyPage = () =>
import(
  /* webpackChunkName: "MyPage" */ "./components/mypage/MyPage"
);
const SignInHelper = () =>
  import(
    /* webpackChunkName: "SignInHelper" */ "./components/oauth/SignInHelper"
  );
const Provision = () =>
  import(/* webpackChunkName: "Provision" */ "./components/payment/Provision");
const GitlabRedirectPage = () =>
  import(
    /* webpackChunkName: "Provision" */ "./components/oauth/GitlabRedirectPage"
  );
const GithubRedirectPage = () =>
  import(
    /* webpackChunkName: "Provision" */ "./components/oauth/GithubRedirectPage"
  );
  const AcebaseRedirectPage = () =>
  import(
    /* webpackChunkName: "Acebase" */ "./components/oauth/AcebaseRedirectPage"
  );
/////////////////////////

var options = {
  // mode: 'history',
  base: process.env.BASE_URL,

  routes: [
    {
      path: "/start-Electron",
      name: "Start-Electron",
      component: StartElectron,
    },

    {
      path: "/",
      name: "EventStormingListPages",
      component: LabPortal, //ListPages
    },
    {
      path: "/storming/:projectId",
      name: "EventStormingModel",
      component: EventStormingModel, // EventStormingModelCanvas  EventStorming
    },
    {
      path: "/uml-class/:aggregateId",
      name: "UMLClassCanvas",
      component: UMLClassModel,
    },
    {
      // path: '/replay/:projectId/:snapshotKey/:queueKey',
      path: "/replay/:projectId/:queueKey",
      name: "ReplayPortal",
      component: ReplayPortal,
    },
    {
      path: "/business-model-canvas/:projectId",
      name: "BusinessModel",
      component: BusinessModel,
    },
    {
      path: "/IdeLoadingPage",
      name: "IdeLoadingPage",
      component: IdeLoadingPage,
    },
    {
      path: "/kubernetes/:projectId",
      name: "KubernetesModel",
      component: KubernetesModel,
    },
    {
      path: "/sticky/:projectId",
      name: "StickyModel",
      component: StickyModel,
    },
    {
      path: "/bpmn/:projectId",
      name: "BpmnModel",
      component: BpmnModel,
    },
    {
      path: "/uml/:projectId",
      name: "ClassModelCanvas",
      component: UMLClassModel,
    },
    {
      path: "/project/:projectId",
      name: "ProjectModel",
      component: Project,
    },
    {
      path: "/cm/:projectId",
      name: "ContextMappingModel",
      component: ContextMappingModel,
    },
    {
      path: "/cjm/:projectId",
      name: "CustomerJourneyMap",
      component: CustomerJourneyMap,
    },
    {
      path: "/courses",
      name: "classList",
      component: ClazzListPage,
    },
    {
      path: "/userStoryMap/:projectId",
      name: "UserStoryMap",
      component: UserStoryMap,
    },
    // {
    //     path: "/courses/labAdminTest",
    //     name: "labAdminTest",
    //     component: labAdminTest,
    // },
    {
        path: "/manager",
        name: "ManagePurchaseItemListPage",
        component: ManagePurchaseItemListPage,
    },
    {
        path: "/userInfo/:userUid",
        name: "PersonalInfo",
        component: PersonalInfo,
    },
    // {
    //     path: '/courses/admin',
    //     name: 'adminClazzList',
    //     component: AdminClazzListPage
    // },
    {
        path: "/courses/:courseId/:classId",
        name: "ClassRounge",
        component: ClassRounge,
    },
    {
        path: "/courses/:courseId/:classId/:labId/class-room",
        name: "classRoom",
        component: ClassRoom,
    },
    {
        path: "/courses/:courseId/:classId/:labId",
        name: "labLocator",
        component: LabLocator,
    },
    {
        path: "/courses/:courseId/:classId/:labId/:userId",
        name: "labLocator",
        component: LabLocator,
    },
    {
        path: "/courses/monitor",
        name: "monitor",
        component: labMonitoring,
    },
    {
        path: "/courses/:course/:clazzName/:labName/eventstorming",
        name: "EventModeler",
        component: EventModeler,
    },
    {
        path: "/big-event-storming",
        name: "BigEventStorming",
        component: BigEventStorming,
    },
    {
        path: "/login-page",
        name: "LoginPage",
        component: LoginPage,
    },
    {
        path: "/bpmn",
        name: "BpmnProcessDesigner",
        component: BpmnProcessDesigner,
    },
    {
        path: "/myPage",
        name: "MyPage",
        component: MyPage,
    },
    {
        path: "/sign-in-helper",
        name: "SignInHelper",
        component: SignInHelper,
    },
    {
        path: "/oauth/gitlab",
        name: "GitlabRedirectPage",
        component: GitlabRedirectPage,
    },
    {
        path: "/oauth/acebase",
        name: "AcebaseRedirectpage",
        component: AcebaseRedirectPage,
    },
    {
        path: "/provision",
        name: "Provision",
        component: Provision,
    },
    {
        path: '/dpg/redirect',
        name: "OpenId",
        component: OpenIdRedirect
    },
    {
        path: '/result',
        name: "Result",
        component: ModelingResult
    }
    ]
}
export default new Router(options);
