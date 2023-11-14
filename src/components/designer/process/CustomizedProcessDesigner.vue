<template xmlns:v-on="http://www.w3.org/1999/xhtml">




  <div class="canvas-panel">

    Customized.

    <md-layout>
      <md-layout md-flex="20">
        <md-list v-if="monitor">
          <bpmn-tree-list
            :model="treeData"
            :id="id">
          </bpmn-tree-list>
        </md-list>
      </md-layout>
      <md-layout md-flex="80" @contextmenu.native="openMenu" @mousedown.native="closeMenu">
        <bpmn-vue v-if="definition" class="full-canvas" ref="bpmn-vue"
                  :definition.sync="definition"
                  :monitor="monitor"
                  v-on:bpmnReady="bindEvents">
        </bpmn-vue>
        <md-layout>
          <md-layout md-flex="50">
            <md-card v-if="!monitor" class="tools">
              <!--<span class="icons bpmn-icon-hand-tool">-->
                <!--<md-tooltip md-direction="right">hand</md-tooltip>-->
              <!--</span>-->
              <!--<span class="icons bpmn-icon-lasso-tool">-->
                <!--<md-tooltip md-direction="right">lasso</md-tooltip>-->
              <!--</span>-->
              <!--<span class="icons bpmn-icon-space-tool">-->
                <!--<md-tooltip md-direction="right">space</md-tooltip>-->
              <!--</span>-->
              <!--<span class="icons bpmn-icon-connection-multi">-->
                <!--<md-tooltip md-direction="right">connection multi</md-tooltip>-->
              <!--</span>-->

              <hr class="separator">

              <span v-for="item in dragItems"
                    class="icons draggable"
                    :class="item.icon"
                    :_component="item.component"
                    :_width="item.width"
                    :_height="item.height">
                <md-tooltip md-direction="right">{{item.label}}</md-tooltip>
              </span>
            </md-card>

            <md-card v-if="!monitor" class="import">
              <md-layout>
                <md-layout>
                  <span class="icons fa fa-folder-open"></span>
                </md-layout>
                <md-layout>
                  <span class="icons fa fa-cloud-upload"></span>
                </md-layout>
              </md-layout>
            </md-card>

            <md-card v-if="!monitor" class="export">
              <md-layout>
                <md-layout>
                  <span class="icons fa fa-download"></span>
                </md-layout>
                <md-layout>
                  <span class="icons fa fa-picture-o"></span>
                </md-layout>
              </md-layout>
            </md-card>

            <md-card v-if="!monitor" class="history">
              <md-layout>
                <md-layout>
                  <span class="icons fa fa-undo" v-on:click="undo"></span>
                </md-layout>
                <md-layout>
                  <span class="icons fa fa-repeat" v-on:click="redo"></span>
                </md-layout>
              </md-layout>
            </md-card>

            <md-card v-if="!monitor" class="zoom">
              <span class="icons fa fa-arrows-alt"></span>

              <hr class="separator">

              <span class="icons fa fa-plus-square-o"></span>
              <span class="icons fa fa-minus-square-o"></span>
            </md-card>
          </md-layout>
          <md-layout md-flex="50">

            <!--프로세스 아이디-->
            <md-layout v-if="!monitor">
              <md-input-container>
                <label>Process Name</label>
                <md-input v-model="definitionName" type="text"></md-input>
              </md-input-container>
            </md-layout>

            <!--인스턴스 이름-->
            <md-layout v-if="monitor">
              <md-input-container>
                <label>Instance Name</label>
                <md-input v-model="definitionName" type="text" readonly></md-input>
              </md-input-container>
            </md-layout>

            <!--프로세스 세이브-->
            <md-layout v-if="!monitor">
              <md-button v-if="!monitor" class="md-fab md-warn md-mini" @click="save">
                <md-icon>save</md-icon>
              </md-button>
            </md-layout>

            <!--프로세스 변수-->
            <md-layout v-if="!monitor">
              <md-select v-model="definition._selectedLocale" @change="changeLocale">Locale
                <md-option value="en">English</md-option>
                <md-option value="ko">Korean</md-option>
              </md-select>
              <md-button class="md-raised" id="processVariables" @click="openProcessVariables">Process Variable
              </md-button>
              <md-button class="md-raised" id="processVariables" @click="openDefinitionSettings">Defintion Settings
              </md-button>
            </md-layout>

            <md-layout v-if="monitor">
              <md-button class="md-raised" id="userPicker" @click="openUserPicker">담당자 변경</md-button>
              <user-picker
                :id="id"
                ref="userPicker"
                :roles="definition.roles"
                v-if="definition"
                style="min-width: 70%;"></user-picker>
            </md-layout>

          </md-layout>
        </md-layout>
      </md-layout>
    </md-layout>
    <!--Back to Here Menu Start -->
    <ul class='custom-menu'>
      <li data-action="backToHere">Back To Here</li>
    </ul>
    <!--Back to Here Menu End -->
  </div>
</template>
<script>

  import ProcessDesigner from 'ProcessDesigner';
  export default {
    mixins: [SvgGraph],
    methods: {

          //....override methods.

    }
  }

</script>

<style scoped lang="scss" rel="stylesheet/scss">
  .canvas-panel {
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    position: absolute;
    overflow: hidden;

    .full-canvas {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 10%;
      left: 0px;
      overflow: hidden;
    }

    .tools {
      position: absolute;
      width: 48px;
      left: 20px;
      top: 20px;
      padding: 4px;
      overflow: hidden;
      .icons {
        margin-top: 5px;
        margin-bottom: 5px;
      }
    }
    .zoom {
      position: absolute;
      width: 42px;
      right: 20px;
      bottom: 120px;
      .icons {
        font-size: 25px;
        margin-left: 10px;
        margin-top: 5px;
        margin-bottom: 5px;
      }
    }
    .icons {
      cursor: pointer;
      font-size: 30px;
      &:hover {
        color: #ffc124;
      }
    }

    .import, .export, .save, .history {
      position: absolute;
      padding: 8px;
      .icons {
        font-size: 25px;
        margin-left: 10px;
      }
    }
    .import {
      left: 80px;
      bottom: 20px;
    }
    .export {
      left: 180px;
      bottom: 20px;
    }
    .history {
      left: 280px;
      bottom: 20px;
    }
  }

  /* The whole thing */
  .custom-menu {
    display: none;
    z-index: 1000;
    position: absolute;
    overflow: hidden;
    border: 1px solid #CCC;
    white-space: nowrap;
    font-family: sans-serif;
    background: #FFF;
    color: #333;
    border-radius: 5px;
    padding: 0;
  }

  /* Each of the items in the list */
  .custom-menu li {
    padding: 8px 12px;
    cursor: pointer;
    list-style-type: none;
    transition: all .3s ease;
    user-select: none;
  }

  .custom-menu li:hover {
    background-color: #DEF;
  }
</style>

