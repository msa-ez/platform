const { AceBaseServer } = require("gitlab-acebase");
const { AceBaseClient } = require("acebase-client");
const express = require("express");
const app = express();
const _ = require("lodash");

// 웹소켓 재연결 시도 중 발생하는 일시적인 에러 로그 필터링
// 클라이언트가 자동으로 재연결을 시도하며, 성공 시 정상 동작합니다.
const originalError = console.error;
console.error = function (...args) {
  const message = args.join(" ");
  // "Websocket connection error" 메시지는 재연결 시도 중 정상적인 동작이므로 필터링
  if (message.includes("Websocket connection error") || message.includes("websocket error")) {
    // 로그를 완전히 숨기거나, 필요시 debug 레벨로 변경 가능
    // originalError.apply(console, ["[DEBUG]", ...args]);
    return;
  }
  originalError.apply(console, args);
};

const host = process.env.DB_HOST ? process.env.DB_HOST : "localhost";
const client_id = process.env.CLIENT_ID ? process.env.CLIENT_ID : null;
const client_secret = process.env.CLIENT_SECRET
  ? process.env.CLIENT_SECRET
  : null;
const dbname = process.env.DB_NAME ? process.env.DB_NAME : "mydb"; // DB Name
const dbport = process.env.DB_PORT ? process.env.DB_PORT : 5757; // DB PORT
const https = process.env.DB_HTTPS ? process.env.DB_HTTPS : false; // DB PORT
// const provider = process.env.PROVIDER ? process.env.PROVIDER : "gitea"; // DB PORT
const protocol = process.env.PROTOCOL ? process.env.PROTOCOL : "http"; // DB PORT
const git = process.env.GIT ? process.env.GIT : "localhost:3000"; // DB PORT
const adminPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD : "75sdDSFg37w5"; // Admin Password (환경변수로 설정 가능)

// 전역 db 변수 (app.get에서 사용)
let db = null;

const server = new AceBaseServer(dbname, {
  host: "0.0.0.0",
  port: 5757,
  // storage: {
  //     path: "/acebase"
  // },
  authentication: {
    enabled: true,
    allowUserSignup: true,
    defaultAccessRule: "auth",
    defaultAdminPassword: adminPassword, // Admin Password
  },
});

let scope;
// if(provider == "github") {

// } else if (provider == "gitlab") {

// }
let github_scope = [
  "repo admin:repo_hook admin:org admin:org_hook user project codespace workflow",
];
let gitlab_scope = [
  "read_user api read_api read_repository write_repository sudo openid profile email write_registry read_registry admin_mode",
];
let gitea_scope = [
  "activitypub admin issue misc notification organization package repository user",
];

server.configAuthProvider("github", {
  client_id: client_id,
  client_secret: client_secret,
  scopes: github_scope,
  state: "devopssystem",
});

server.configAuthProvider("gitlab", {
  client_id: client_id,
  client_secret: client_secret,
  scopes: gitlab_scope,
  state: "devopssystem",
  host: git,
});

server.configAuthProvider("gitea", {
  client_id: client_id,
  client_secret: client_secret,
  scopes: gitea_scope,
  state: "devopssystem",
  host: git,
  protocol: protocol,
});

server.on("ready", () => {
  console.log("SERVER ready");
  // 데이터베이스가 완전히 준비될 때까지 대기 후 init() 실행
  setTimeout(() => {
    init();
  }, 2000); // 2초 대기하여 데이터베이스 초기 로드 완료 대기
});

function init() {
  db = new AceBaseClient({
    host: host,
    port: dbport,
    dbname: dbname,
    https: JSON.parse(https),
  });
  // const db = new AceBaseClient({ host: 'acebase.kuberez.io', port: 443, dbname: 'mydb', https: true });
  
  // 인증 및 연결 준비 대기
  db.auth.signIn("admin", adminPassword).then((result) => {
    console.log(
      `Signed in as ${result.user.username}, got access token ${result.accessToken}`
    );
    
    // 데이터베이스가 완전히 준비된 후에 리스너 등록
    db.ready(() => {
      console.log("Connected successfully - Database is ready, initializing listeners...");
      // 추가 대기 후 리스너 등록 (데이터베이스 인덱스 로드 완료 대기)
      setTimeout(() => {
        initializeListeners(db);
      }, 1000); // 1초 추가 대기
    });
  }).catch((error) => {
    console.error("Authentication failed:", error);
    // 인증 실패해도 리스너는 등록 (인증이 선택적일 수 있음)
    db.ready(() => {
      console.log("Connected successfully (without auth) - Database is ready, initializing listeners...");
      setTimeout(() => {
        initializeListeners(db);
      }, 1000);
    });
  });
}

function initializeListeners(db) {
  console.log("Starting to register database listeners...");
  
  // 초기화 완료 플래그 (기존 데이터 읽기 방지)
  let initializationComplete = false;
  
  // 초기화 완료 후 리스너 활성화 (5초 후)
  setTimeout(() => {
    initializationComplete = true;
    console.log("Initialization complete - listeners are now active");
  }, 5000);

  const getCountDefinition = db.ref("userLists/everyone/share").once("value");
  const updateCountDefinition = db.ref("userLists/everyone/share/count");
  
  // on("value") 대신 on("mutated") 사용 - 새로운 변경사항만 감지 (초기 데이터 로드 방지)
  const inputInformation = db
    .ref("/definitions/$projectId/information")
    .on("mutated");

  inputInformation.subscribe((snapshot) => {
    // 초기화 중에는 기존 데이터 처리 스킵
    if (!initializationComplete) {
      return;
    }
    try {
      console.log("update Information!!");
      const vars = snapshot.ref.vars;

      const projectId = vars.projectId;
      console.log("projectId", projectId);
      const afterInformation = snapshot.val();

      const updateObj = {
        img: afterInformation.img,
        projectName: afterInformation.projectName,
        lastModifiedTimeStamp: afterInformation.lastModifiedTimeStamp,
        createdTimeStamp: afterInformation.createdTimeStamp,
        projectId: projectId,
        authorEmail: afterInformation.authorEmail,
        author: afterInformation.author,
        date: afterInformation.date,
        comment: afterInformation.comment,
        type: afterInformation.type,
      };
      if (afterInformation.permissions) {
        // delete permissions part
        var permissions = {};
        //after
        Object.keys(afterInformation.permissions).forEach((uid) => {
          permissions[uid] = afterInformation.permissions[uid];
        });

        Object.keys(permissions).forEach((uid) => {
          if (permissions[uid]) {
            db.ref(`userLists/${uid}/share/${projectId}`).update(updateObj);
            // .then(function () {
            //     getCountDefinition.then(function (snapshot) {
            //         var value = snapshot.val();
            //         var array = Object.keys(value);
            //         var count = array.length;
            //         if (array.indexOf("count") != -1) {
            //             count = count - 1;
            //         }
            //         updateCountDefinition.update(count);
            //     });
            // });
            if (uid === "everyone") {
              db.ref(
                `userLists/${uid}/share_${afterInformation.type}/${projectId}`
              ).update(updateObj);
              db.ref(`userLists/${uid}/share_first/${projectId}`).update(
                updateObj
              );
            }
          } else {
            db.ref(`userLists/${uid}/share/${projectId}`).remove();
            if (uid === "everyone") {
              // getCountDefinition.then(function (snapshot) {
              //     var value = snapshot.val();
              //     var array = Object.keys(value);
              //     var count = array.length;
              //     if (array.indexOf("count") != -1) {
              //         count = count - 1;
              //     }
              //     updateCountDefinition.update(count);
              // });
              db.ref(
                `userLists/${uid}/share_${beforeInformation.type}/${projectId}`
              ).remove();
              db.ref(`userLists/${uid}/share_first/${projectId}`).remove();
            }
          }
        });
      }
      // TODO: 1번
      if (updateObj.author) {
        db.ref(`userLists/${updateObj.author}/mine/${projectId}`).update(
          updateObj
        );
      }
    } catch (e) {}
  });
  // exports.onRegisterUser
  // on("value") 대신 on("child_added") 사용 - 새로운 계정만 감지 (초기 데이터 로드 방지)
  db.ref("__auth__/accounts/$uid")
    .on("child_added")
    .subscribe(async (snapshot, context) => {
      var uid = snapshot.ref.vars.uid;
      var userItem = snapshot.val();
      
      // userItem이 null이면 처리하지 않음
      if (!userItem) {
        return;
      }
      
      // 초기화 중에는 기존 데이터 처리 스킵
      if (!initializationComplete) {
        return;
      }
      
      var userEmail = userItem.email;

      try {
        var convertEmail = userEmail.replace(/\./gi, "_");
        var getInvitationItem = null;
        var getRecommendedUserCoin = null;
        var updates = {};
        userItem["uid"] = uid;
        //invited 파악.
        db.ref(`enrolledUsers/${convertEmail}`).set(userItem);
      } catch (e) {
        return false;
      }
    });

  // information이 업데이트 알림.
  db.ref("/definitions/$projectId/information").on("mutated", (snap) => {
    try {
      // 초기화 중에는 기존 데이터 처리 스킵
      if (!initializationComplete) {
        return;
      }
      
      var projectId = snap.ref.vars.projectId;
      const beforeInformation = snap.val();
      const afterInformation = snap.val();
      if (beforeInformation) {
        if (afterInformation) {
          // modify
          var updateObj = {
            img: afterInformation.img,
            projectName: afterInformation.projectName,
            lastModifiedTimeStamp: afterInformation.lastModifiedTimeStamp,
            createdTimeStamp: afterInformation.createdTimeStamp,
            projectId: projectId,
            authorEmail: afterInformation.authorEmail,
            author: afterInformation.author,
            date: afterInformation.date,
            comment: afterInformation.comment,
            type: afterInformation.type,
          };

          var updateMineObj = {
            author: afterInformation.author,
            authorEmail: afterInformation.authorEmail,
            img: afterInformation.img,
            projectName: afterInformation.projectName,
            lastModifiedTimeStamp: afterInformation.lastModifiedTimeStamp,
            createdTimeStamp: afterInformation.createdTimeStamp,
            projectId: projectId,
            comment: afterInformation.comment,
            type: afterInformation.type,
          };
          //mine update
          // 2번
          if (afterInformation.author == undefined) {
            console.log("*********************************************");
            console.log(updateObj.author);
            console.log("*********************************************");
          }
          if (afterInformation.author) {
            db.ref(
              `userLists/${afterInformation.author}/mine/${projectId}/information`
            ).update(updateMineObj);
          }

          if (afterInformation.permissions) {
            // delete permissions part

            var permissions = {};

            if (beforeInformation.permissions) {
              Object.keys(beforeInformation.permissions).forEach((uid) => {
                permissions[uid] = null;
              });

              // Object.keys(beforeInformation.permissions).forEach(function (uid) {
              //     permissions[uid] = null
              // })
            }

            Object.keys(afterInformation.permissions).forEach((uid) => {
              permissions[uid] = afterInformation.permissions[uid];
            });
            // Object.keys(afterInformation.permissions).forEach(function (uid) {
            //     permissions[uid] = afterInformation.permissions[uid]
            // })

            Object.keys(permissions).forEach((uid) => {
              if (permissions[uid]) {
                snap.after.ref.root
                  .child(`userLists/${uid}/share/${projectId}`)
                  .update(updateObj);
                if (uid === "everyone") {
                  db.ref(
                    `userLists/${uid}/share_${afterInformation.type}/${projectId}`
                  ).update(updateObj);
                }
              } else {
                db.ref(`userLists/${uid}/share/${projectId}`).remove();
                if (uid === "everyone") {
                  db.ref(
                    `userLists/${uid}/share_${beforeInformation.type}/${projectId}`
                  ).remove();
                }
              }
            });
          } else if (beforeInformation.permissions) {
            // delete permissions all

            Object.keys(beforeInformation.permissions).forEach((uid) => {
              if (uid) {
                db.ref(`userLists/${uid}/share/${projectId}`).remove();
                if (uid === "everyone") {
                  db.ref(
                    `userLists/${uid}/share_${beforeInformation.type}/${projectId}`
                  ).remove();
                }
              }
            });
          }
        }
        return true;
      } else {
        return true;
      }
    } catch (e) {
      console.log(e);
    }
  });

  // on("value") 대신 on("child_removed") 사용 - 삭제 이벤트만 감지 (초기 데이터 로드 방지)
  const deleteDefinition = db
    .ref("/userLists/$uid/mine/$projectId")
    .on("child_removed");
  deleteDefinition.subscribe((snapshot) => {
    try {
      // 초기화 중에는 기존 데이터 처리 스킵
      if (!initializationComplete) {
        return;
      }
      
      // child_removed 이벤트: 삭제된 항목의 데이터가 snapshot에 포함됨
      const vars = snapshot.ref.vars;
      var userUid = vars.uid;
      var projectId = vars.projectId;
      
      // projectId가 유효한지 확인 (와일드카드가 아닌지)
      if (!projectId || projectId === "$projectId" || projectId.startsWith("$")) {
        return;
      }
      
      console.log(userUid, projectId);
      db.ref(`definitions/${projectId}/information/permissions`).once(
        "value",
        (permissionsSnapshots) => {
          if (permissionsSnapshots.exists()) {
            var userList = permissionsSnapshots.val();
            Object.keys(userList).forEach((uid) => {
              if (userList[uid] && uid !== "everyone") {
                db.ref(`userLists/${uid}/share/${projectId}`).update({
                  state: "deleted",
                });
              }
            });
          }
        }
      );
      
      // public delete
      db.ref(`userLists/everyone/share_es/${projectId}`)
        .remove()
        .then(function () {})
        .catch(function (err) {
          console.log(`Error removing share_es/${projectId}:`, err.message);
        });
      db.ref(`userLists/everyone/share_first/${projectId}`)
        .remove()
        .then(function () {})
        .catch(function (err) {
          console.log(`Error removing share_first/${projectId}:`, err.message);
        });
    } catch (e) {
      console.log("/userLists/$uid/mine/$projectId");
      console.log(e);
    }
  });

  // db.ref('/userLists/everyone/share/{projectId}')
  //     .mutate(async(snapshot, context) => {
  //         const delayMs = 60 * 1000;
  //         var beforeSnap = snapshot.before
  //         var afterSnap = snapshot.after
  //         var isCreate = !beforeSnap.exists() && afterSnap.exists()
  //         var isUpdate = beforeSnap.exists() && afterSnap.exists()
  //         var isDelete = beforeSnap.exists() && !afterSnap.exists()
  //         try {
  //             if(isUpdate){
  //                 return true
  //             }

  //             var sanpshotCnt = null

  //             afterSnap.ref.root.child('userLists/everyone/share/count').once('value', (publicModelListCnt) => {
  //                 if (publicModelListCnt.exists()) {
  //                     sanpshotCnt = publicModelListCnt.val()
  //                     if(isCreate){
  //                         sanpshotCnt = sanpshotCnt + 1
  //                     } else if(isDelete){
  //                         sanpshotCnt = sanpshotCnt - 1
  //                     }
  //                     afterSnap.ref.root.child(`userLists/everyone/share/count`).set(sanpshotCnt);
  //                 }
  //             })
  //             return true
  //         } catch (e) {
  //             await delayTime(delayMs)
  //             return false
  //         }
  //     });
  // db.ref("/userLists/$authorId/mine/$projectId").on("child_removed", (snapshot) => {
  //     console.log("remove")
  //     console.log(snapshot)
  // })
  db.ref("/userLists/$authorId/mine").on("child_removed", (snapshot) => {
    // 초기화 중에는 기존 데이터 처리 스킵
    if (!initializationComplete) {
      return;
    }
    const vars = snapshot.val();
    console.log(vars.projectId);
    db.ref(`/definitions/${vars.projectId}`).remove();
  });

  db.ref("/userLists/$authorId/mine").on("child_added", (snapshot) => {
    // 초기화 중에는 기존 데이터 처리 스킵
    if (!initializationComplete) {
      return;
    }
    const vars = snapshot.val();
    console.log(vars.projectId);
    db.ref(`/definitions/${vars.projectId}/information`).update(vars);
  });
  // input Mine Lists when make Modeling
  db.ref("/definitions/{projectId}/information").on(
    "child_added",
    (snapshot, context) => {
      // 초기화 중에는 기존 데이터 처리 스킵
      if (!initializationComplete) {
        return;
      }
      console.log("***********");
      console.log(snapshot);
      console.log(context);
      var projectId = context.params.projectId;
      const afterInformation = snapshot.val();

      console.log(afterInformation.lastModifiedTimeStamp);
      var updateObj = {
        img: afterInformation.img,
        projectName: afterInformation.projectName,
        lastModifiedTimeStamp: afterInformation.lastModifiedTimeStamp,
        createdTimeStamp: afterInformation.createdTimeStamp,
        projectId: projectId,
        authorEmail: afterInformation.authorEmail,
        author: afterInformation.author,
        authorProfile: afterInformation.authorProfile
          ? afterInformation.authorProfile
          : null,
        date: afterInformation.date,
        comment: afterInformation.comment,
        type: afterInformation.type,
      };
      if (updateObj.author == undefined) {
        console.log("*********************************************");
        console.log(updateObj.author);
        console.log("*********************************************");
      }
      if (updateObj.author) {
        snapshot.ref.root
          .child(`userLists/${updateObj.author}/mine/${projectId}`)
          .update(updateObj);
      }

      return;
    }
  );
  
  console.log("All database listeners registered successfully");
  
  // db.ref('/definitions/$projectId/versionLists/$version').on('child_added', (snapshot, context) => {
  //     console.log(snapshot)
  //     console.log(context)
  //     var projectId = context.params.projectId
  //     const afterInformation = snapshot.val();

  //     var updateObj = {
  //         img: afterInformation.img,
  //         projectName: afterInformation.projectName,
  //         lastModifiedDate: afterInformation.lastModifiedDate,
  //         projectId: projectId,
  //         authorEmail: afterInformation.authorEmail,
  //         author: afterInformation.author,
  //         authorProfile: afterInformation.authorProfile ? afterInformation.authorProfile : null,
  //         date: afterInformation.date,
  //         comment: afterInformation.comment,
  //         type: afterInformation.type,
  //     }

  //     return snapshot.ref.root.child(`userLists/${updateObj.author}/mine/${projectId}`).update(updateObj);
  // });

  // function bpmParser(projectName, model) {

  // }

  // 사용 하지 않음
  function bpmParser(projectId, model) {
    return new Promise(async function (resolve) {
      let elements = _.pickBy(model.elements);
      let relations = _.pickBy(model.relations);
      let childActivities = [];
      let sequenceFlows = [];
      let roles = [];
      const elementsTmp = Object.keys(elements).forEach(function (key) {
        let element = elements[key];
        let type =
          elements[key]._type.split(".")[
            elements[key]._type.split(".").length - 1
          ];
        element.name =
          elements[key].name.length > 0 ? elements[key].name : type;
        if (element._type.includes("Role")) {
          roles.push(element);
          delete elements[key].elementView;
        } else {
          childActivities.push(element);
          delete elements[key].elementView;
        }
      });

      // console.log(elementsTmp)
      const relationsTmp = Object.keys(relations).forEach(function (key) {
        // let relation = relations[key]
        // relation.name = {
        //     "_type": "org.uengine.contexts.TextContext",
        //     "text": relation[key].name
        // }
        sequenceFlows.push(relations[key]);

        delete relations[key].relationView;
      });

      Promise.all([elementsTmp, relationsTmp]).then(function (values) {
        model["childActivities"] = childActivities;
        model["sequenceFlows"] = sequenceFlows;
        model["roles"] = roles;
        model["name"] = projectId;
        // model.sequenceFlows = ["java.util.ArrayList",relations]
        delete model["relations"];
        delete model["elements"];
        model["_type"] = "org.uengine.kernel.ProcessDefinition";
        model["id"] = projectId;
        resolve(model);
      });
    });
  }
}

// function bpmParser(projectName, model) {
//     // Keyboard.json 양식에 맞춤
//     // 동작 하지 않음.
//     return new Promise(async function (resolve) {
//         let result = {
//             "definition": {
//               "_type": "org.uengine.kernel.ProcessDefinition",
//               "name": {
//                 "text": projectName
//               },
//               "retryDelay": 60,
//               "isDynamicChangeAllowed": true,
//               "childActivities": [
//                 "java.util.ArrayList",
//                 []
//               ],
//               "sequenceFlows": [],
//               "defaultFlowchartViewType": "swimlane",
//               "defaultFlowchartViewOption": "vertical",
//               "duration": 10,
//               "simulationInstanceCount": 10,
//               "simulationInputFrequency": 10,
//               "archive": true,
//               "id": "keyboard.xml",
//               "isAdhoc": true,
//               "shortDescription": {
//                 "localedTexts": {
//                   "_type": "java.util.HashMap",
//                   "ko": ""
//                 }
//               },
//               "initiateByFirstWorkitem": true,
//               "adhoc": true,
//               "dynamicChangeAllowed": true
//             }
//         }

//         const activity = Object.keys(model.elements).forEach(function(key) {
//             result.definition.childActivities[1].push(model.elements[key]);
//           })

//         let relations = {}
//         const sequence = Object.keys(model.relations).forEach(function(key, idx) {
//             // result.definition.sequenceFlows[1].push(model.relations[key]);
//             result.definition.sequenceFlows.push(model.relations[key])
//         })

//         await Promise.all([activity, sequence])
//         // result.definition.sequenceFlows.push(relations)

//         resolve(result)
//     })
// }

app.get("/api/definitions/:definition", async function (req, res, next) {
  if (!db) {
    res.status(503).json({ error: "Database not ready" });
    return;
  }
  const snapshot = await db.ref(`definitions/${req.params.definition}`).get();
  if (snapshot.exists()) {
    const tmp = snapshot.val();
    const lastVersion = tmp.information.lastVersionName;
    console.log(tmp.versionLists[lastVersion].versionValue);
    const lastValue = JSON.parse(tmp.versionLists[lastVersion].versionValue);
    console.log(lastVersion);
    const result = await bpmParser(req.params.definition, lastValue);
    res.status(200).json(result);
    console.log(JSON.stringify(result));
  } else {
    res.status(500);
  }
});

// app.get('/api/definitions/:definition/lastVersion', async function(req, res, next) {
//     // console.log(req.params)
//     console.log(req.params.definition)
//     const snapshot = await db.ref(`definitions/${req.params.definition}/information/lastVersionName`).get();
//     if (snapshot.exists()) {
//         result = snapshot.val();
//         res.status(200).json(result);
//         console.log("return")
//     }
//     else {
//         res.status(500)
//     }
// });

const application = app.listen(5758, () => {
  console.log("server open");
});

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
function shutDown() {
  console.log("Received kill signal, shutting down gracefully");
  application.close(() => {
    console.log("Closed out remaining connections");
    process.exit(0);
  });

  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);

  // connections.forEach(curr => curr.end());
  // setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}
