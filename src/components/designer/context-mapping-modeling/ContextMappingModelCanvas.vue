<template xmlns:v-on="http://www.w3.org/1999/xhtml">
  <div class="page">
    <separate-panel-components
            :min="mainSeparatePanel.min"
            :max="mainSeparatePanel.max"
            :triggerLength="5"
            :paneLengthPercent.sync="mainSeparatePanel.current"
            @close="closeSeparatePanel()"
            :inBoundSeparatePanel="false"
    >
      <template v-slot:one>
        <div style="width: 100%; height: 100%">
          <div class="canvas-panel" style="left: 0">
            <v-snackbar
                    v-model="snackbar.show"
                    outlined
                    :color="snackbar.color"
                    :multi-line="snackbar.mode === 'multi-line'"
                    :timeout="snackbar.timeout"
                    :vertical="snackbar.mode === 'vertical'"
                    :top="snackbar.top"
                    :bottom="snackbar.bottom"
                    :centered="snackbar.centered"
            >
              {{ snackbar.text }}
              <v-btn
                      v-if="snackbar.closeBtn"
                      dark
                      @click="snackbar.show = false"
                      small
                      style="margin-left: 10px"
              >
                close
              </v-btn>
            </v-snackbar>



            <v-layout right>
              <div :key="canvasRenderKey">
                <opengraph
                        ref="opengraph"
                        :width="100000"
                        :height="100000"
                        :sliderLocationScale="sliderLocationScale"
                        focus-canvas-on-select
                        wheelScalable
                        :labelEditable="true"
                        :dragPageMovable="dragPageMovable"
                        :enableContextmenu="false"
                        :automaticGuidance="automaticGuidance"
                        :enableRootContextmenu="false"
                        :enableHotkeyCtrlC="false"
                        :enableHotkeyCtrlV="false"
                        :enableHotkeyDelete="false"
                        :enableHotkeyCtrlZ="false"
                        :enableHotkeyCtrlD="false"
                        :enableHotkeyCtrlG="false"
                        :slider="true"
                        :movable="!isReadOnlyModel"
                        :resizable="!isReadOnlyModel"
                        :selectable="true"
                        :connectable="!isReadOnlyModel"
                        v-if="value"
                        :autoSliderUpdate="true"
                        :imageBase="imageBase"
                        v-on:update:sliderLocationScale="sliderLocationScale = $event"
                        v-on:connectShape="onConnectShape"
                        v-on:canvasReady="bindEvents"
                >
                  <!--  Model -->
                  <div
                          v-if="value.elements && typeof value.elements == 'object'"
                          v-for="elementId in Object.keys(value.elements)"
                  >
                    <component
                            v-if="elementId && value.elements[elementId]"
                            :is="getComponentByClassName(value.elements[elementId]._type)"
                            :value.sync="value.elements[elementId]"
                            :ref="elementId"
                    ></component>
                  </div>

                  <div
                          v-if="value.relations && typeof value.relations == 'object'"
                          v-for="relationId in Object.keys(value.relations)"
                  >
                    <component
                            v-if="relationId && value.relations[relationId]"
                            :is="getComponentByClassName(value.relations[relationId]._type)"
                            :value.sync="value.relations[relationId]"
                            :ref="relationId"
                    ></component>
                  </div>
                </opengraph>
              </div>
              <div v-if="!isReadOnlyModel && !isHexagonal">
                <v-row class="gs-modeling-undo-redo">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                              class="gs-model-z-index-2 gs-undo-opacity-hover"
                              :disabled="checkUndo"
                              text
                              small
                              right
                              @click.native="undo()"
                              v-on="on"
                      >
                        <v-icon medium>mdi-undo</v-icon>
                      </v-btn>
                    </template>
                    <span>Undo</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                              class="gs-model-z-index-2 gs-redo-opacity-hover"
                              :disabled="checkRedo"
                              text
                              small
                              right
                              @click.native="redo()"
                              v-on="on"
                      >
                        <v-icon medium>mdi-redo</v-icon>
                      </v-btn>
                    </template>
                    <span>Redo</span>
                  </v-tooltip>
                </v-row>
              </div>
              <div style="margin: 0 auto">
                <slot name="top">
                  <v-row>
                    <v-row
                            class="gs-model-z-index-1 es-is-mobile-project-name"
                            style="
                        margin: 5px 5px 0px 0px;
                        height: 64px;
                        max-width: 200px;
                        background-color: transparent;
                      "
                    >
                      <v-icon
                              style="height: 24px; margin-top: 38px"
                              :disabled="disableBtn"
                              @click="openExportDialog()"
                              color="#8d8d8d"
                      >mdi-cog
                      </v-icon>
                      <slot name="projectName">
                        <v-text-field
                                class="es-modeling-project-name"
                                :disabled="isReadOnlyModel || (fullPath && fullPath.includes('replay'))"
                                :color="projectNameColor"
                                :error-messages="projectNameHint"
                                label="Project Name"
                                v-model="projectName"
                                @click.native="unselectedAll"
                        >
                        </v-text-field>
                      </slot>
                    </v-row>
                    <div
                            class="es-is-not-mobile"
                            style="margin: 40px 0px 0px 15px; z-index: 1"
                    >
                      <v-row
                              justify="end"
                              align="start"
                              style="margin-right: 15px"
                      >
                        <slot name="menu-buttons">
                          <v-menu class="pa-2" open-on-hover offset-y left>
                            <template v-slot:activator="{ on }">
                              <div>
                                <v-btn
                                        class="gs-model-z-index-1 es-hide-k8s-btn"
                                        color="primary"
                                        text
                                        style="margin-right: 5px"
                                        :disabled="disableBtn"
                                        @click="openEmbeddedCanvas('Kubernetes')"
                                >
                                  <v-icon>mdi-kubernetes</v-icon>
                                  <div class="es-hide-k8s">DEPLOY</div>
                                </v-btn>
                              </div>
                            </template>
                          </v-menu>

                          <v-menu
                                  v-if="isServerModel && !isClazzModeling"
                                  class="pa-2"
                                  open-on-hover
                                  offset-y
                                  left
                          >
                            <template v-slot:activator="{ on }">
                              <div>
                                <v-btn
                                        class="gs-model-z-index-1"
                                        v-if="isHexagonal"
                                        text
                                        style="margin-right: 5px"
                                        color="primary"
                                        @click="generateModel()"
                                        :disabled="disableBtn"
                                        v-on="on"
                                >
                                  <v-icon>mdi-hexagon-outline</v-icon>
                                  <div>Hexagonal</div>
                                </v-btn>
                                <v-btn
                                        class="gs-model-z-index-1 es-hide-view-btn"
                                        v-else
                                        text
                                        style="margin-right: 5px"
                                        color="primary"
                                        @click="generateHexagonal()"
                                        :disabled="disableBtn"
                                        v-on="on"
                                >
                                  <v-icon>mdi-view-dashboard</v-icon>
                                  <div class="es-hide-view">VIEW</div>
                                </v-btn>
                              </div>
                            </template>

                            <v-list style="overflow: hidden">
                              <v-list-item
                                      v-for="(item, index) in conversionItems"
                                      :key="index"
                                      @click="functionSelect(item.title, index)"
                              >
                                <v-list-item-title
                                >{{ item.title }}
                                </v-list-item-title>
                              </v-list-item>
                            </v-list>
                          </v-menu>

                          <v-menu
                                  v-if="isServerModel && !isClazzModeling"
                                  class="pa-2"
                                  open-on-click
                                  offset-y
                                  left
                          >
                            <template v-slot:activator="{ on }">
                              <div>
                                <v-btn
                                        class="gs-model-z-index-1 es-hide-replay-btn"
                                        text
                                        style="margin-right: 5px"
                                        color="primary"
                                        @click="loadVersions()"
                                        :disabled="disableBtn"
                                        v-on="on"
                                >
                                  <v-icon>mdi-restart</v-icon>
                                  <div class="es-hide-replay">Versions</div>
                                </v-btn>
                              </div>
                            </template>

                            <v-list style="overflow: hidden">
                              <div v-if="versionLists">
                                <div style="text-align-last: center">
                                  VERSIONS
                                </div>
                                <v-divider></v-divider>
                                <div style="overflow-y: scroll; height: 200px">
                                  <v-list-item
                                          v-for="(item, index) in filteredVersionLists"
                                          :key="index"
                                          @click="moveToVersion(item)"
                                          two-line
                                          dense
                                  >
                                    <v-list-item-content>
                                      <v-list-item-title
                                              style="font-size: medium"
                                      >{{ item.version }}</v-list-item-title
                                      >
                                      <v-list-item-subtitle
                                              style="font-size: 10px"
                                      >{{ convertTimeStampToDate(item.timeStamp) }}
                                      </v-list-item-subtitle>
                                    </v-list-item-content>
                                  </v-list-item>
                                </div>
                                <v-divider></v-divider>
                              </div>
                              <v-list-item
                                      @click="saveComposition('save')"
                                      style="
                                  margin-top: -5px;
                                  margin-bottom: -10px;
                                  text-align: start;
                                "
                              >
                                <v-list-item-title>
                                  <v-icon small>{{ icon.save }}</v-icon>CREATE VERSION
                                </v-list-item-title>
                              </v-list-item>
                              <v-list-item
                                      @click="showReplay()"
                                      style="
                                  margin-top: -5px;
                                  margin-bottom: -10px;
                                  text-align: start;
                                "
                              >
                                <v-list-item-title
                                ><v-icon small>mdi-restart</v-icon>
                                  REPLAY</v-list-item-title
                                >
                              </v-list-item>
                            </v-list>
                          </v-menu>

                          <v-menu class="pa-2" open-on-hover offset-y left>
                            <template v-slot:activator="{ on }">
                              <div v-if="isReadOnlyModel">
                                <v-btn
                                        class="gs-model-z-index-1 es-hide-fork-btn"
                                        text
                                        color="primary"
                                        :disabled="disableBtn"
                                        @click="saveComposition('fork')"
                                        style="margin-right: 5px"
                                >
                                  <v-icon>{{ icon.fork }}</v-icon>
                                  <div class="es-hide-fork">FORK</div>
                                </v-btn>
                                <v-btn
                                        class="gs-model-z-index-1 es-hide-join-btn"
                                        v-if="!projectVersion"
                                        :color="joinRequestedText.show? 'primary': 'success'"
                                        @click="requestInviteUser()"
                                        style="margin-right: 5px"
                                        text
                                >
                                  <div v-if="joinRequestedText.show">
                                    <v-icon>{{ icon.join }}</v-icon>
                                  </div>
                                  <div class="es-hide-join">
                                    {{ joinRequestedText.text }}
                                  </div>
                                </v-btn>
                              </div>
                              <div v-else>
                                <v-btn
                                        class="gs-model-z-index-1 es-hide-save-btn"
                                        text
                                        v-if="showSaveBtn"
                                        style="margin-right: 5px"
                                        color="primary"
                                        :disabled="!isServerModel"
                                        @click="saveComposition('save')"
                                        v-on="on"
                                >
                                  <v-icon>{{ icon.save }}</v-icon>
                                  <div class="es-hide-save">SAVE</div>
                                </v-btn>
                                <v-btn
                                        class="gs-model-z-index-1"
                                        text
                                        v-else
                                        color="primary"
                                        :disabled="disableBtn"
                                        @click="saveComposition('fork')"
                                        style="margin-right: 5px"
                                        v-on="on"
                                >
                                  <v-icon>{{ icon.fork }}</v-icon>
                                  <div class="es-hide-fork">FORK</div>
                                </v-btn>
                              </div>
                            </template>
                            <v-list v-if="!isClazzModeling">
                              <v-list-item
                                      v-for="(item, index) in filteredSaveItems"
                                      :key="index"
                                      @click="functionSelect(item.title, index)"
                              >
                                <v-list-item-title
                                >{{ item.title }}
                                </v-list-item-title>
                              </v-list-item>
                            </v-list>
                          </v-menu>

                          <v-menu
                                  v-if="isOwnModel && isServerModel && !isReadOnlyModel"
                                  offset-y
                                  open-on-hover
                                  left
                          >
                            <template v-slot:activator="{ on }">
                              <div>
                                <v-btn
                                        class="gs-model-z-index-1 es-hide-share-btn"
                                        text
                                        style="margin-right: 5px"
                                        color="primary"
                                        :disabled="!initLoad"
                                        v-on="on"
                                        @click="openInviteUsers()"
                                >
                                  <v-icon>{{ icon.share }}</v-icon>
                                  <div class="es-hide-share">SHARE</div>
                                  <v-avatar
                                          v-if="requestCount"
                                          size="25"
                                          color="red"
                                          style="margin-left: 2px"
                                  >
                                    {{ requestCount }}
                                  </v-avatar>
                                </v-btn>
                              </div>
                            </template>
                            <v-list>
                              <v-list-item
                                      v-for="(item, index) in shareItems"
                                      :key="index"
                                      @click="functionSelect(item.title, index)"
                              >
                                <v-list-item-title
                                >{{ item.title }}
                                </v-list-item-title>
                              </v-list-item>
                            </v-list>
                          </v-menu>

                          <v-menu offset-y open-on-hover left>
                            <template v-slot:activator="{ on }">
                              <div>
                                <v-btn
                                        class="gs-model-z-index-1 es-hide-code-btn"
                                        style="margin-right: 5px; color: white"
                                        color="primary"
                                        @click="openCodeViewer()"
                                        :disabled="!initLoad"
                                        v-on="on"
                                >
                                  <v-icon>{{ icon.code }}</v-icon>
                                  <div>CODE</div>
                                  <v-progress-circular
                                          indeterminate
                                          v-if="ideWindow"
                                  ></v-progress-circular>
                                </v-btn>
                              </div>
                            </template>
                            <v-list style="width: 175px">
                              <v-list-item
                                      v-for="(item, index) in codeItems"
                                      :key="index"
                                      @click="functionSelect(item.title, index)"
                              >
                                <v-list-item-title
                                >{{ item.title }}
                                </v-list-item-title>
                              </v-list-item>
                            </v-list>
                          </v-menu>

                          <!-- <v-menu
                                                            offset-y
                                                            open-on-hover
                                                            left
                                                    >
                                                        <template v-slot:activator="{ on }">
                                                            <div>
                                                                <v-btn  class="gs-model-z-index-1 es-hide-code-btn"
                                                                        text
                                                                        style="margin-right: 5px; color: white;"
                                                                        color="orange"
                                                                        @click="showUiWizard=true"
                                                                        v-on="on"
                                                                >
                                                                    <v-icon>{{icon.code}}</v-icon>
                                                                    <div class="es-hide-code">UI</div>
                                                                </v-btn>
                                                            </div>
                                                        </template>

                                                    </v-menu> -->
                        </slot>
                      </v-row>
                    </div>
                  </v-row>
                  <div class="es-is-mobile">
                    <v-row
                            class="mobile-action-btn"
                            justify="center"
                            align="start"
                            style="display: flex; margin-right: 50px"
                    >
                      <v-menu open-on-hover offset-y>
                        <template v-slot:activator="{ on }">
                          <v-btn
                                  text
                                  v-if="isReadOnlyModel && !projectVersion"
                                  :color="
                              joinRequestedText.show ? 'primary' : 'success'
                            "
                                  dark
                                  @click="requestInviteUser()"
                                  small
                          >
                            <div v-if="joinRequestedText.show">
                              <v-icon>{{ icon.join }}</v-icon>
                            </div>
                            {{ joinRequestedText.text }}
                          </v-btn>
                          <v-btn
                                  text
                                  v-if="isReadOnlyModel"
                                  color="primary"
                                  dark
                                  class="mobile-btn"
                                  @click="saveComposition('fork')"
                                  v-on="on"
                                  small
                          >
                            <v-icon>{{ icon.fork }}</v-icon>
                          </v-btn>
                          <v-btn
                                  text
                                  v-else
                                  color="primary"
                                  dark
                                  class="mobile-btn"
                                  @click.native="saveComposition('save')"
                                  v-on="on"
                                  small
                          >
                            <v-icon>{{ icon.save }}</v-icon>
                          </v-btn>
                        </template>
                        <v-list v-if="!isClazzModeling">
                          <v-list-item
                                  v-for="(item, index) in filteredSaveItems"
                                  :key="index"
                                  @click="functionSelect(item.title, index)"
                          >
                            <v-list-item-title
                            >{{ item.title }}
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                      <v-menu
                              v-if="isOwnModel && isServerModel &&!isReadOnlyModel"
                              class="pa-2"
                              offset-y
                              open-on-hover
                      >
                        <template v-slot:activator="{ on }">
                          <div>
                            <v-btn
                                    text
                                    color="primary"
                                    dark
                                    class="mobile-btn"
                                    v-on="on"
                                    @click="openInviteUsers()"
                                    small
                            >
                              <v-icon>{{ icon.share }}</v-icon>
                              <v-avatar
                                      v-if="requestCount"
                                      size="25"
                                      color="red"
                                      style="margin-left: 2px"
                              >
                                {{ requestCount }}
                              </v-avatar>
                            </v-btn>
                          </div>
                        </template>
                        <v-list>
                          <v-list-item
                                  v-for="(item, index) in shareItems"
                                  :key="index"
                                  @click="functionSelect(item.title, index)"
                          >
                            <v-list-item-title
                            >{{ item.title }}
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                      <v-menu
                              text
                              v-if="isServerModel && !isClazzModeling"
                              class="pa-2"
                              open-on-hover
                              offset-y
                      >
                        <template v-slot:activator="{ on }">
                          <div>
                            <v-btn
                                    color="primary"
                                    dark
                                    @click="showReplay()"
                                    small
                                    class="mobile-btn"
                                    :disabled="disableBtn"
                                    text
                            >
                              <v-icon>mdi-restart</v-icon>
                            </v-btn>
                          </div>
                        </template>
                      </v-menu>
                      <v-menu open-on-hover offset-y>
                        <template v-slot:activator="{ on }">
                          <div>
                            <v-btn
                                    color="primary"
                                    dark
                                    class="mobile-btn"
                                    @click="openCodeViewer()"
                                    v-on="on"
                                    small
                            >
                              <v-icon> {{ icon.code }}</v-icon>
                            </v-btn>
                          </div>
                        </template>
                        <v-list>
                          <v-list-item
                                  v-for="(item, index) in codeItems"
                                  :key="index"
                                  @click="functionSelect(item.title, index)"
                          >
                            <v-list-item-title
                            >{{ item.title }}
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                      <v-menu class="pa-2" open-on-hover offset-y left>
                        <template v-slot:activator="{ on }">
                          <div>
                            <v-btn
                                    color="primary"
                                    text
                                    :disabled="disableBtn"
                                    style="margin-left: -8px; margin-top: 1px"
                                    @click="openEmbeddedCanvas('Kubernetes')"
                            >
                              <v-icon>mdi-kubernetes</v-icon>
                            </v-btn>
                          </div>
                        </template>
                      </v-menu>
                      <v-menu class="pa-2" open-on-hover offset-y left>
                        <template v-slot:activator="{ on }">
                          <div>
                            <v-btn
                                    class="gs-model-z-index-1"
                                    v-if="isHexagonal"
                                    text
                                    color="primary"
                                    style="margin-left: -20px; margin-top: 1px"
                                    @click="generateModel()"
                                    :disabled="disableBtn"
                                    v-on="on"
                            >
                              <v-icon>mdi-hexagon-outline</v-icon>
                            </v-btn>
                            <v-btn
                                    class="gs-model-z-index-1"
                                    v-else
                                    text
                                    color="primary"
                                    style="margin-left: -20px; margin-top: 1px"
                                    @click="generateHexagonal()"
                                    :disabled="disableBtn"
                                    v-on="on"
                            >
                              <v-icon>mdi-view-dashboard</v-icon>
                            </v-btn>
                          </div>
                        </template>
                        <v-list>
                          <v-list-item
                                  v-for="(item, index) in conversionItems"
                                  :key="index"
                                  @click="functionSelect(item.title, index)"
                          >
                            <v-list-item-title
                            >{{ item.title }}
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                      <v-menu class="pa-2" open-on-hover offset-y left>
                        <template v-slot:activator="{ on }">
                          <div>
                            <v-btn
                                    v-if="isHexagonal"
                                    text
                                    color="primary"
                                    style="margin-left: -20px; margin-top: 1px"
                                    @click="generateModel()"
                                    :disabled="disableBtn"
                            >
                              <v-icon>
                                mdi-checkbox-multiple-blank-outline
                              </v-icon>
                            </v-btn>
                            <v-btn
                                    v-else
                                    text
                                    color="primary"
                                    style="margin-left: -20px; margin-top: 1px"
                                    @click="generateHexagonal()"
                                    :disabled="disableBtn"
                            >
                              <v-icon>mdi-hexagon-outline</v-icon>
                            </v-btn>
                          </div>
                        </template>
                      </v-menu>
                    </v-row>
                  </div>
                </slot>

              </div>

              <v-card class="tools" style="top: 100px; text-align: center">
                <v-tooltip right>
                  <template v-slot:activator="{ on, attrs }">
                    <span
                            class="bpmn-icon-hand-tool"
                            v-bind:class="{
                        icons: !dragPageMovable,
                        hands: dragPageMovable,
                      }"
                            _width="30"
                            _height="30"
                            v-on:click="toggleGrip"
                            v-bind="attrs"
                            v-on="on"
                    >
                    </span>
                  </template>
                  <span v-if="dragPageMovable == true"
                  >Draggable Screen : on</span
                  >
                  <span v-if="dragPageMovable == false"
                  >Draggable Screen : off</span
                  >
                </v-tooltip>

                <v-tooltip right v-if="!isReadOnlyModel">
                  <template v-slot:activator="{ on, attrs }">
                    <span
                            class="gs-automatic-guidance-btn"
                            @click="automaticGuidanceChange"
                            v-bind="attrs"
                            v-on="on"
                    >
                      <v-icon
                              class="gs-automatic-guidance-icon"
                              large
                              style="color: #fbc02d"
                              v-if="automaticGuidance == true"
                      >mdi-border-inside</v-icon
                      >
                      <v-icon
                              class="gs-automatic-guidance-icon"
                              large
                              v-if="automaticGuidance == false"
                      >mdi-border-none</v-icon
                      >
                    </span>
                  </template>
                  <span v-if="automaticGuidance == true"
                  >Arrange Guidance : on</span
                  >
                  <span v-if="automaticGuidance == false"
                  >Arrange Guidance : off</span
                  >
                </v-tooltip>
                <v-tooltip
                        large
                        nudge-top="10"
                        v-for="(item, key) in elementTypes"
                        :key="key"
                        right
                >
                  <template v-slot:activator="{ on }">
                    <span
                            class="draggable"
                            align="center"
                            :_component="item.component"
                            :_width="item.width"
                            :_height="item.height"
                    >
                      <img
                              height="30px"
                              width="30px"
                              :src="item.src"
                              v-on="on"
                              v-if="!isReadOnlyModel"
                      />
                    </span>
                  </template>
                  <span>{{ item.label }}</span>
                </v-tooltip>
              </v-card>
              <v-card class="mobile-first-sticker-tools">
                <v-tooltip
                        large
                        nudge-top="10"
                        v-for="(item, key) in elementTypes.slice(0, 5)"
                        :key="key"
                        right
                >
                  <template v-slot:activator="{ on }">
                    <span
                            class="draggable"
                            align="center"
                            style="margin: 6px 6px 0px 6px"
                            :_component="item.component"
                            :_width="item.width"
                            :_height="item.height"
                    >
                      <img
                              height="30px"
                              width="30px"
                              :src="item.src"
                              v-on="on"
                              v-if="
                          !isReadOnlyModel &&
                          (!isHexagonal ||
                            (isHexagonal &&
                              (item.component.includes('bounded-context') ||
                                item.component.includes(
                                  'packaged-business-capabilities'
                                ))))
                        "
                      />
                    </span>
                  </template>
                  <span>{{ item.label }}</span>
                </v-tooltip>
                <v-tooltip right>
                  <template v-slot:activator="{ on, attrs }">
                    <span
                            class="bpmn-icon-hand-tool"
                            v-bind:class="{
                        icons: !dragPageMovable,
                        hands: dragPageMovable,
                      }"
                            _width="30"
                            _height="30"
                            v-on:click="toggleGrip"
                            v-bind="attrs"
                            v-on="on"
                    >
                    </span>
                  </template>
                  <span v-if="dragPageMovable == true"
                  >Draggable Screen : on</span
                  >
                  <span v-if="dragPageMovable == false"
                  >Draggable Screen : off</span
                  >
                </v-tooltip>

                <v-tooltip right v-if="!isReadOnlyModel">
                  <template v-slot:activator="{ on, attrs }">
                    <span
                            class="gs-automatic-guidance-btn"
                            @click="automaticGuidanceChange"
                            v-bind="attrs"
                            v-on="on"
                    >
                      <v-icon
                              class="gs-automatic-guidance-icon"
                              large
                              style="color: #fbc02d; margin-top: 3px"
                              v-if="automaticGuidance == true"
                      >mdi-border-inside</v-icon
                      >
                      <v-icon
                              class="gs-automatic-guidance-icon"
                              large
                              v-if="automaticGuidance == false"
                              style="margin-top: 3px"
                      >mdi-border-none</v-icon
                      >
                    </span>
                  </template>
                  <span v-if="automaticGuidance == true"
                  >Arrange Guidance : on</span
                  >
                  <span v-if="automaticGuidance == false"
                  >Arrange Guidance : off</span
                  >
                </v-tooltip>
              </v-card>
              <v-card class="mobile-second-sticker-tools">
                <v-tooltip
                        large
                        nudge-top="10"
                        v-for="(item, key) in elementTypes.slice(5, 12)"
                        :key="key"
                        right
                >
                  <template v-slot:activator="{ on }">
                    <span
                            class="draggable"
                            align="center"
                            style="margin: 6px 6.5px 0px 5px"
                            :_component="item.component"
                            :_width="item.width"
                            :_height="item.height"
                    >
                      <img
                              height="30px"
                              width="30px"
                              :src="item.src"
                              v-on="on"
                              v-if="
                          !isReadOnlyModel &&
                          (!isHexagonal ||
                            (isHexagonal &&
                              (item.component.includes('bounded-context') ||
                                item.component.includes(
                                  'packaged-business-capabilities'
                                ))))
                        "
                      />
                    </span>
                  </template>
                  <span>{{ item.label }}</span>
                </v-tooltip>
              </v-card>
            </v-layout>
          </div>

          <ParticipantPanel
                  v-if="showParticipantPanel"
                  :lists="participantLists"
          ></ParticipantPanel>

          <!--  dialog       -->
          <model-canvas-share-dialog
                  v-model="inviteLists"
                  :showDialog="inviteDialog"
                  :checkPublic="showPublicModel"
                  :canvas="canvas"
                  canvasComponentName="event-storming-model-canvas"
                  @all="invitePublic"
                  @apply="applyInviteUsers"
                  @close="closeInviteUsers"
                  @add="addInviteUser"
                  @remove="removeInviteUser"
          ></model-canvas-share-dialog>


          <model-storage-dialog
                  :condition="storageCondition"
                  :showDialog="showStorageDialog"
                  :isClazzModeling="isClazzModeling"
                  @updateClassModelingId="updateClassModelingId"
                  @save="saveModel"
                  @fork="forkModel"
                  @backup="backupModel"
                  @close="storageDialogCancel"
          >
          </model-storage-dialog>

          <dialog-purchase-item
                  v-model="purchaseItemDialog"
                  :purchase-item-info="purchaseItemDialogInfo"
                  @result="purchaseItemDialogSubmit"
                  @close="purchaseItemDialogClose"
          >
          </dialog-purchase-item>

          <v-dialog v-model="forkAlertDialog" max-width="290">
            <v-card>
              <v-card-title class="headline"
              >Fork
                <v-icon>{{ icon.fork }}</v-icon>
              </v-card-title>
              <v-card-text>
                권한이 없어서 수정 할 수 없습니다. Fork를 하여 사용해
                주세요.</v-card-text
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                        color="green darken-1"
                        text
                        @click="saveComposition('fork')"
                >Fork
                </v-btn>
                <v-btn
                        color="red darken-1"
                        text
                        @click.native="forkAlertDialog = false"
                >Close</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>


          <v-dialog
                  v-model="modelingListsDialog"
                  persistent
                  style="height: 100%"
                  scrollable
          >
            <v-card style="height: 100%">
              <v-card-title style="position: absolute; top: -10px"
              >Select Model for PBC</v-card-title
              >
              <v-card-actions style="justify-content: flex-end">
                <v-btn @click="closeModelingListsDialog()" small text
                ><v-icon small>mdi-close</v-icon></v-btn
                >
              </v-card-actions>
              <v-card-text>
                <PBCModelList
                        @selected-model="applyModelingListsDialog"
                        @close="closeModelingListsDialog"
                ></PBCModelList>
              </v-card-text>
            </v-card>
          </v-dialog>


          <!--   model IMAGE     -->
          <modeler-image-generator
                  ref="modeler-image-generator"
          ></modeler-image-generator>
        </div>
      </template>

      <template v-slot:two>
        <CodeGenerator
                v-model="value"
                :isOwnModel="isOwnModel"
                :isServerModel="isServerModel"
                :projectInformation="information"
                :projectName="projectName"
                :modelInitLoad="initLoad"
                :modelingProjectId="projectId"
                :asyncCodeForValue="false"
                :callCodeForValue="changedTemplateCode"
                :oldTreeHashLists.sync="oldTreeHashLists"
                :newTreeHashLists.sync="newTreeHashLists"
                :projectVersion="projectVersion"
                @changedByMe="settingChangedByMe"
                @editModelData="editModelData"
                canvas-name="context-mapping-model-canvas"
        ></CodeGenerator>
      </template>
    </separate-panel-components>
  </div>
</template>

<script>
  import EventStormingModelCanvas from "../es-modeling/EventStormingModelCanvas";
  import ContextMappingModeling from './index'

  export default {
    name: "context-mapping-model-canvas",
    mixins: [EventStormingModelCanvas],
    data() {
      return {
        /////////////////////////////////
        elementTypes: [
          {
            icon: "bpmn-icon-start-event-none", //'OG.shape.essencia.Alpha',
            component: "bounded-context-cm",
            label: "Bounded Context",
            width: "100",
            height: "100",
            src: `${window.location.protocol + "//" + window.location.host}/static/image/event/bounded2.png`,
          },
          // {
          //   component: "packaged-business-capabilities-cm",
          //   label: "PBC",
          //   width: "100",
          //   height: "100",
          //   src: `${window.location.protocol + "//" + window.location.host}/static/image/event/pbc.png`,
          // },
        ],
      };
    },
    watch: {
        "initLoad":function(newVal){
          if(newVal){
            this.syncMirrorElements();
          }
        },
        "isLoadedInitMirror": function (newVal) {
          var me = this;
          if (newVal && me.initLoad) {
              // changed MirrorValue and init definition load
              me.syncMirrorElements();
          }
        },
        "isLoadedMirrorQueue": function (newVal) {
          var me = this;
          if (newVal && me.isLoadedInitMirror) {
              // changed MirrorValue and init definition load
              me.syncMirrorElements();
          }
        },
    },
    methods: {
      setCanvasType(){
          Vue.use(ContextMappingModeling);
          this.canvasType = 'cm'
      },
      async saveModel(){
        // override
        var me = this
        let validate = await me.validateStorageCondition(me.storageCondition, 'save');

        if(validate){
          let contextBC = me.storageCondition.element
          let settingProjectId = me.storageCondition.projectId.replaceAll(' ','-').trim();
          let version = me.storageCondition.version.replaceAll('.','-').trim();
          let defaultValue = {
            'elements': {},
            'relations': {},
            'basePlatform': null,
            'basePlatformConf': {},
            'toppingPlatforms': null,
            'toppingPlatformsConf': {},
            'scm': {}
          }

          await me.putObject(`db://definitions/${settingProjectId}/information`, {
            author: me.userInfo.uid,
            authorEmail: me.userInfo.email,
            lastVersionName: version,
            comment: me.storageCondition.comment,
            createdTimeStamp: Date.now(),
            lastModifiedTimeStamp: Date.now(),
            lastModifiedUser: null,
            lastModifiedEmail: null,
            projectName: me.storageCondition.projectName,
            type: me.storageCondition.type ? me.storageCondition.type : me.canvasType,
            projectId: settingProjectId,
            firstCommit: null,
            associatedProject: me.information.associatedProject
          })

          await me.pushObject(`db://definitions/${settingProjectId}/snapshotLists`,{
            lastSnapshotKey: '',
            snapshot: JSON.stringify(defaultValue),
            snapshotImg: null,
            timeStamp: Date.now()
          })
          let valueUrl = await me.putString(`storage://definitions/${settingProjectId}/versionLists/${version}/versionValue`, JSON.stringify(defaultValue));
          await me.putObject(`db://definitions/${settingProjectId}/versionLists/${version}`, {
            saveUser: me.userInfo.uid,
            saveUserEmail: me.userInfo.email,
            saveUserName: me.userInfo.name,
            projectName: me.storageCondition.projectName,
            img: null,
            timeStamp: Date.now(),
            comment: me.storageCondition.comment,
            valueUrl: valueUrl
          })

          if( me.storageCondition.type == 'es' ){
            let vueComponent = me.getComponentByName('bounded-context-definition');
            let element = vueComponent.computed.createNew(
                    null,
                    this.uuid(),
                    430, //x
                    430, //y
                    100, //width
                    100, //height
                    '' , //description
                    ''   //label
            );
            element.name = contextBC.name
            let postObj = {
              action: "elementPush",
              editUid: me.userInfo.uid,
              timeStamp: Date.now(),
              item: JSON.stringify(element),
            };
            await me.pushObject(`db://definitions/${settingProjectId}/queue`, postObj)
            if (me.information.associatedProject) {
              element.definitionId = settingProjectId
              postObj.item = JSON.stringify(element)
              await me.pushObject(`db://definitions/${me.information.associatedProject}/queue`, postObj);
            }
            // re-link mirrorElement
            me.value.elements[contextBC.elementView.id].mirrorElement = element.elementView.id;
            me.changedByMe = true;
            me.syncMirrorElements();
            me.synchronizeAssociatedProject(me.information.associatedProject, settingProjectId);
          }

          window.open(`/#/storming/${settingProjectId}`, "_blank");
          me.storageDialogCancel();
        } else {
          this.storageCondition.loading = false
        }
      },
      async synchronizeAssociatedProject(associatedProject, newId, oldId) {
          var me = this;
          if(!associatedProject) return;

          let type = me.storageCondition.type == 'es' ? 'eventStorming' : 'contextMapping'

          let lists = await me.list(`db://definitions/${associatedProject}/information/${type}`);
          let index = -1;
          if (lists && lists.modelList) {
              if(oldId) {
                  index = lists.modelList.findIndex((id) => id == oldId);
              } else {
                  index = lists.modelList.findIndex((id) => id == newId); //duplicate
              }
              index = index == -1 ? lists.modelList.length : index;
          }

          index = index == -1 ? 0 : index;
          await me.setString(`db://definitions/${associatedProject}/information/${type}/modelList/${index}`, newId);
      },
      overrideElements(elementValues){
        var me = this

        elementValues.filter(ele => ele && ele.mirrorElement).forEach(function(mirrorEle){
          if( !mirrorEle._type.endsWith('BoundedContext')) return;

          mirrorEle.aggregates.forEach(function(agg ,index){
            let origin = me.mirrorValue.elements[agg.id];
            if( origin ) {
              if(origin.boundedContext.id) {
                origin.boundedContext = JSON.parse(JSON.stringify(me.mirrorValue.elements[origin.boundedContext.id]))
              }
              me.convertNameForElement(origin);
              mirrorEle.aggregates[index] = origin
            }
          })
        })

        return elementValues
      },
      getComponentByClassName: function (className) {
        var me = this;
        var componentByClassName;
        var hexagonalElements = [
          "domain-event-definition",
          "aggregate-definition",
          "command-definition",
          "policy-definition",
          "bounded-context-definition",
          "class-relation",
          "packaged-business-capabilities",
        ];

        $.each(window.Vue.contextMappingModelingComponents,
                function (i, component) {
                  if ( component.default.computed && component.default.computed.className && component.default.computed.className() == className) {componentByClassName = component.default;
                    if (me.isHexagonal && !hexagonalElements.includes(component.default.name)) {
                      componentByClassName = null;
                    }
                  }
                }
        );

        return componentByClassName;
      },
    }
  };
</script>
