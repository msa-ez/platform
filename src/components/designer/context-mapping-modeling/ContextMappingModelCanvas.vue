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

          <v-dialog v-model="showDDLDraftDialog" max-width="1200" max-height="800" overflow="scroll">
            <v-card>
              <v-card-title>DDL Draft</v-card-title>
              <v-card-text>
                <div v-for="(table, boundedContext) in DDLDraftTable" :key="boundedContext">
                <h3>{{ boundedContext }}</h3>
                <v-data-table
                  :headers="table.headers"
                  :items="table.items"
                  :items-per-page="5"
                  class="elevation-1 mb-4"
                  ></v-data-table>
                </div>
              </v-card-text>
            </v-card>
          </v-dialog>


          <!--   model IMAGE     -->
          <modeler-image-generator
                  ref="modeler-image-generator"
          ></modeler-image-generator>
        </div>
        <GeneratorUI v-if="projectId" ref="generatorUI" :projectId="projectId" :modelValue="value" :embedded="embedded" :defaultInputData="defaultGeneratorUiInputData" @createModel="createModel" @clearModelValue="clearModelValue" @onGenerationFinished="onGenerationFinished"></GeneratorUI>
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
  import BoundedContext from '../es-modeling/elements/BoundedContext.vue';
  import BoundedContextCM from './elements/BoundedContextCM.vue';
  import GeneratorUI from "../modeling/generators/GeneratorUI";
  import DDLGenerator from "../modeling/generators/DDLGenerator";

  export default {
    name: "context-mapping-model-canvas",
    mixins: [EventStormingModelCanvas],
    components: { GeneratorUI },
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
        input: {
          DDL: '',
          boundedContextLists: '',
        },
        DDLDraftTable: {
          headers: [],
          items: [],
        },
        showDDLDraftDialog: false,
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
      async saveModel(boundedContext, model){
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

          if(boundedContext && model){
            defaultValue.elements = model.elements
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
            let element = BoundedContext.computed.createNew(
                    null,
                    this.uuid(),
                    650, //x
                    450, //y
                    560, //width
                    590, //height
                    '' , //description
                    ''   //label
            );
            element.name = contextBC.name
            element.elementView.width = 560
            element.elementView.height = 590

            // 하위 캔버스에 그려질 모델 aggregates에 bc 정보 추가
            if(boundedContext && model){
              me.setBCinAggregate(element, model);
            }

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
      onReceiveProjectQueue(queue, isNew){
        const addNewSyncBoundedContextCM = (modelValue, name) => {
          const isSameNameBoundedContextExists = (modelValue, name) => {
            for(let element of Object.values(modelValue.elements)) {
              if(element && element._type === "org.uengine.modeling.model.BoundedContext" && element.name === name)
                return true
            }
            return false
          }

          const getValuePosition = (modelValue, boundedContextCM) => {
              const getBoundedContexts = (modelValue) => {
                  let boundedContexts = []
                  Object.values(modelValue.elements).forEach(function (element) {
                      if (element && element._type === "org.uengine.modeling.model.BoundedContext")
                          boundedContexts.push(element)
                  })
                  return boundedContexts
              }

              const getMaxXBoundedContextInMaxY = (boundedContexts) => {
                  const maxY = Math.max(...boundedContexts.map(bc => bc.elementView.y))
                  const maxYBoundedContext = boundedContexts.find(bc => bc.elementView.y === maxY)

                  let targetBoundedContexts = []
                  boundedContexts.forEach(function (boundedContext) {
                      if((boundedContext.elementView.y >= maxYBoundedContext.elementView.y - maxYBoundedContext.elementView.height/2) && 
                          (boundedContext.elementView.y <= maxYBoundedContext.elementView.y + maxYBoundedContext.elementView.height/2))
                          targetBoundedContexts.push(boundedContext)
                  })
                  
                  const maxX = Math.max(...targetBoundedContexts.map(bc => bc.elementView.x))
                  const maxXBoundedContext = targetBoundedContexts.find(bc => bc.elementView.x === maxX)
                  return maxXBoundedContext
              }

              const getValidYPos = (boundedContexts, boundedContextCM) => {
                  const maxY = Math.max(...boundedContexts.map(bc => bc.elementView.y + Math.round(bc.elementView.height/2)))
                  return maxY + Math.round(boundedContextCM.elementView.height/2) + 25
              }

              const boundedContexts = getBoundedContexts(modelValue)
              if(boundedContexts.length <= 0) return {x: 250, y: 250}
              const maxXBoundedContextInMaxY = getMaxXBoundedContextInMaxY(boundedContexts)

              const validXPos = maxXBoundedContextInMaxY.elementView.x + Math.round(maxXBoundedContextInMaxY.elementView.width/2) + 25 
                                  + Math.round(boundedContextCM.elementView.width/2)
              if(validXPos <= 1750) return {x: validXPos, y: maxXBoundedContextInMaxY.elementView.y}

              return {x: 250, y: getValidYPos(boundedContexts, boundedContextCM)}
          }

          if(isSameNameBoundedContextExists(this.value, name)) return
          let boundedContextCM = BoundedContextCM.computed.createNew(this, this.uuid(), 250, 250)
          boundedContextCM.name = name

          let validPosition = getValuePosition(modelValue, boundedContextCM)
          boundedContextCM.elementView.x = validPosition.x
          boundedContextCM.elementView.y = validPosition.y

          this.addElementAction(boundedContextCM)     
        }

        if(!isNew) return

        if(queue.action === 'elementPush') {
          try {

            let element = JSON.parse(queue.item)
            if(element._type === 'org.uengine.modeling.model.BoundedContext')
              addNewSyncBoundedContextCM(this.value, element.name)

          } catch(e) {
            console.error(e)
          }
        }

        console.log(queue)
      },
      clearModelValue(){
          var me = this
          me.value.elements = {}
          me.eleCnt = 0
      },
      onGenerationFinished(model){
        var me = this

        // // model에서 도출된 bc 별 모델 elements 반복 필요
        // let boundedContexts = "test2222"

        // let id = boundedContexts+Math.floor(Math.random()*1000000)
        // var componentInfo = {
        //     '_type': 'org.uengine.modeling.model.BoundedContext',
        //     'id': id,
        //     'component': 'bounded-context-cm',
        //     'name': boundedContexts,
        //     'elementView': {
        //       '_type': "org.uengine.modeling.model.BoundedContext",
        //       'id': id,
        //       'x': 500 + Math.floor(Math.random()*200),
        //       'y': 280 + Math.floor(Math.random()*150),
        //       'width': 250,
        //       'height': 300,
        //       'style': JSON.stringify({}),
        //     },
        //     'hexagonalView': {
        //       '_type': "org.uengine.modeling.model.BoundedContextHexagonal",
        //       'id': id,
        //       'x': 0,
        //       'y': 0,
        //       'width': 0,
        //       'height': 0
        //     },
        // }
        // this.addElementAction(componentInfo);

        // let contextBC = Object.values(me.value.elements).find(element => element!=null && element.name === boundedContexts)
        
        // // project 하위 멀티 canvas를 생성하기 위한 세팅
        // me.storageCondition = {
        //   action: 'save',
        //   title: 'Edit BoundedContext',
        //   comment: '',
        //   projectName: `${me.information.associatedProject}-${boundedContexts}`,
        //   projectId: `${me.information.associatedProject}-${boundedContexts}`,
        //   version: 'v0.0.1',
        //   error: null,
        //   loading: false,
        //   type: 'es',
        //   associatedProject: me.information.associatedProject,
        //   connectedAssociatedProject : me.information.associatedProject ? true : false,
        //   element: contextBC
        // }
  
        // let testModel = {
        //   "elements" : JSON.parse(JSON.stringify(`{"e3b6c7be-4094-4dcb-45df-377fc7344c09":{"aggregateRoot":{"_type":"org.uengine.modeling.model.AggregateRoot","fieldDescriptors":[{"className":"String","isCopy":false,"isKey":true,"name":"orderId","displayName":"주문 ID","nameCamelCase":"orderId","namePascalCase":"OrderId","_type":"org.uengine.model.FieldDescriptor","inputUI":"TEXT"},{"className":"Date","isCopy":false,"isKey":false,"name":"orderDate","displayName":"주문 날짜","nameCamelCase":"orderDate","namePascalCase":"OrderDate","_type":"org.uengine.model.FieldDescriptor","inputUI":"TEXT"},{"className":"Money","isCopy":false,"isKey":false,"name":"totalAmount","displayName":"총 금액","nameCamelCase":"totalAmount","namePascalCase":"TotalAmount","_type":"org.uengine.model.FieldDescriptor","inputUI":"TEXT"},{"className":"Address","isCopy":false,"isKey":false,"name":"shippingAddress","displayName":"배송 주소","nameCamelCase":"shippingAddress","namePascalCase":"ShippingAddress","_type":"org.uengine.model.FieldDescriptor","inputUI":"TEXTAREA"}],"entities":{"elements":{},"relations":{}},"operations":[]},"boundedContext":{"id":"${contextBC.id}"},"commands":[],"description":"주문 관리","id":"e3b6c7be-4094-4dcb-45df-377fc7344c09","definitionId":"test20240905-order","elementView":{"_type":"org.uengine.modeling.model.Aggregate","id":"e3b6c7be-4094-4dcb-45df-377fc7344c09","x":650,"y":450,"width":130,"height":400},"events":[],"hexagonalView":{"_type":"org.uengine.modeling.model.AggregateHexagonal","id":"${contextBC.id}","x":0,"y":0,"subWidth":0,"width":0},"name":"Order","displayName":"주문","nameCamelCase":"order","namePascalCase":"Order","namePlural":"","rotateStatus":false,"selected":false,"_type":"org.uengine.modeling.model.Aggregate","uiStyle":{"layout":"CARD","nameProperty":"property name for representing the object","imageUrlProperty":"property name for representing image url if exists","icon":"material design icon font name for representing this aggregate data","isRepresentingUser":false}},"${contextBC.id}-event-OrderCreated":{"aggregate":{"id":"e3b6c7be-4094-4dcb-45df-377fc7344c09"},"alertURL":"/static/image/symbol/alert-icon.png","boundedContext":{"id":"${contextBC.id}"},"checkAlert":true,"description":null,"id":"${contextBC.id}-event-OrderCreated","definitionId":"test20240905-order","elementView":{"angle":0,"height":115,"id":"${contextBC.id}-event-OrderCreated","style":"{}","width":100,"x":740,"y":250,"_type":"org.uengine.modeling.model.Event"},"fieldDescriptors":[{"className":"String","isCopy":false,"isKey":true,"name":"orderId","nameCamelCase":"orderId","namePascalCase":"OrderId","_type":"org.uengine.model.FieldDescriptor"},{"className":"Date","isCopy":false,"isKey":false,"name":"orderDate","nameCamelCase":"orderDate","namePascalCase":"OrderDate","_type":"org.uengine.model.FieldDescriptor"}],"hexagonalView":{"height":0,"id":"${contextBC.id}-event-OrderCreated","style":"{}","width":0,"x":0,"y":0,"_type":"org.uengine.modeling.model.EventHexagonal"},"name":"OrderCreated","nameCamelCase":"orderCreated","namePascalCase":"OrderCreated","namePlural":"","relationCommandInfo":[],"relationPolicyInfo":[],"rotateStatus":false,"selected":false,"trigger":"@PostPersist","_type":"org.uengine.modeling.model.Event"},"${contextBC.id}-event-OrderCancelled":{"aggregate":{"id":"e3b6c7be-4094-4dcb-45df-377fc7344c09"},"alertURL":"/static/image/symbol/alert-icon.png","boundedContext":{"id":"${contextBC.id}"},"checkAlert":true,"description":null,"id":"${contextBC.id}-event-OrderCancelled","definitionId":"test20240905-order","elementView":{"angle":0,"height":115,"id":"${contextBC.id}-event-OrderCancelled","style":"{}","width":100,"x":740,"y":370,"_type":"org.uengine.modeling.model.Event"},"fieldDescriptors":[{"className":"String","isCopy":false,"isKey":true,"name":"orderId","nameCamelCase":"orderId","namePascalCase":"OrderId","_type":"org.uengine.model.FieldDescriptor"}],"hexagonalView":{"height":0,"id":"${contextBC.id}-event-OrderCancelled","style":"{}","width":0,"x":0,"y":0,"_type":"org.uengine.modeling.model.EventHexagonal"},"name":"OrderCancelled","nameCamelCase":"orderCancelled","namePascalCase":"OrderCancelled","namePlural":"","relationCommandInfo":[],"relationPolicyInfo":[],"rotateStatus":false,"selected":false,"trigger":"@PostPersist","_type":"org.uengine.modeling.model.Event","displayName":null},"${contextBC.id}-command-CreateOrder":{"_type":"org.uengine.modeling.model.Command","outputEvents":["OrderCreated"],"aggregate":{"id":"e3b6c7be-4094-4dcb-45df-377fc7344c09"},"boundedContext":{"id":"${contextBC.id}"},"controllerInfo":{"apiPath":"uri","method":"POST"},"fieldDescriptors":[{"className":"String","isCopy":false,"isKey":true,"name":"orderId","nameCamelCase":"orderId","namePascalCase":"OrderId","_type":"org.uengine.model.FieldDescriptor"},{"className":"Date","isCopy":false,"isKey":false,"name":"orderDate","nameCamelCase":"orderDate","namePascalCase":"OrderDate","_type":"org.uengine.model.FieldDescriptor"},{"className":"Money","isCopy":false,"isKey":false,"name":"totalAmount","nameCamelCase":"totalAmount","namePascalCase":"TotalAmount","_type":"org.uengine.model.FieldDescriptor"},{"className":"Address","isCopy":false,"isKey":false,"name":"shippingAddress","nameCamelCase":"shippingAddress","namePascalCase":"ShippingAddress","_type":"org.uengine.model.FieldDescriptor"}],"description":null,"id":"${contextBC.id}-command-CreateOrder","definitionId":"test20240905-order","elementView":{"_type":"org.uengine.modeling.model.Command","height":115,"id":"${contextBC.id}-command-CreateOrder","style":"{}","width":100,"x":560,"y":250,"z-index":999},"hexagonalView":{"_type":"org.uengine.modeling.model.CommandHexagonal","height":0,"id":"${contextBC.id}-command-CreateOrder","style":"{}","width":0,"x":0,"y":0},"isRestRepository":true,"name":"CreateOrder","displayName":"주문 생성","nameCamelCase":"createOrder","namePascalCase":"CreateOrder","namePlural":"","relationCommandInfo":[],"relationEventInfo":[],"restRepositoryInfo":{"method":"POST"},"rotateStatus":false,"selected":false,"trigger":"@PrePersist"},"${contextBC.id}-${contextBC.id}-command-CreateOrder-actor-Actor-Name":{"_type":"org.uengine.modeling.model.Actor","boundedContext":{"id":"${contextBC.id}"},"description":null,"id":"${contextBC.id}-${contextBC.id}-command-CreateOrder-actor-Actor-Name","definitionId":"test20240905-order","elementView":{"_type":"org.uengine.modeling.model.Actor","height":100,"id":"${contextBC.id}-${contextBC.id}-command-CreateOrder-actor-Actor-Name","style":"{}","width":100,"x":480,"y":210},"innerAggregate":{"command":[],"event":[],"external":[],"policy":[],"view":[]},"name":"Actor Name","oldName":"","rotateStatus":false,"displayName":null},"${contextBC.id}-command-CancelOrder":{"_type":"org.uengine.modeling.model.Command","outputEvents":["OrderCancelled"],"aggregate":{"id":"e3b6c7be-4094-4dcb-45df-377fc7344c09"},"boundedContext":{"id":"${contextBC.id}"},"controllerInfo":{"apiPath":"uri","method":"DELETE"},"fieldDescriptors":[{"className":"String","isCopy":false,"isKey":true,"name":"orderId","nameCamelCase":"orderId","namePascalCase":"OrderId","_type":"org.uengine.model.FieldDescriptor"}],"description":null,"id":"${contextBC.id}-command-CancelOrder","definitionId":"test20240905-order","elementView":{"_type":"org.uengine.modeling.model.Command","height":115,"id":"${contextBC.id}-command-CancelOrder","style":"{}","width":100,"x":560,"y":370,"z-index":999},"hexagonalView":{"_type":"org.uengine.modeling.model.CommandHexagonal","height":0,"id":"${contextBC.id}-command-CancelOrder","style":"{}","width":0,"x":0,"y":0},"isRestRepository":true,"name":"CancelOrder","displayName":"주문 취소","nameCamelCase":"cancelOrder","namePascalCase":"CancelOrder","namePlural":"","relationCommandInfo":[],"relationEventInfo":[],"restRepositoryInfo":{"method":"DELETE"},"rotateStatus":false,"selected":false,"trigger":"@PrePersist"},"${contextBC.id}-${contextBC.id}-command-CancelOrder-actor-Actor-Name":{"_type":"org.uengine.modeling.model.Actor","boundedContext":{"id":"${contextBC.id}"},"description":null,"id":"${contextBC.id}-${contextBC.id}-command-CancelOrder-actor-Actor-Name","definitionId":"test20240905-order","elementView":{"_type":"org.uengine.modeling.model.Actor","height":100,"id":"${contextBC.id}-${contextBC.id}-command-CancelOrder-actor-Actor-Name","style":"{}","width":100,"x":480,"y":330},"innerAggregate":{"command":[],"event":[],"external":[],"policy":[],"view":[]},"name":"Actor Name","oldName":"","rotateStatus":false,"displayName":null}}`)), 
        // }       
        // testModel.elements = JSON.parse(testModel.elements)
        // let aggregates = Object.values(testModel.elements)
        //   .filter(element => element != null && element._type == 'org.uengine.modeling.model.Aggregate')
        //   .map(aggregate => ({ id: aggregate.id }));

        // me.value.elements[contextBC.id]['aggregates'] = aggregates;
        // aggregates.forEach(aggregate => {
        //   me.mirrorValue.elements[aggregate.id]=testModel.elements[aggregate.id]
        // })

        // this.saveModel(boundedContexts, testModel)
        // me.changedByMe = true

        if(model){
          me.DDLDraftTable = model
          me.showDDLDraftDialog = true
        }


      },
      createmodel(model){
      },
      setBCinAggregate(bc, model){
        Object.values(model.elements).forEach(function (element) {
          if (element && element._type === "org.uengine.modeling.model.Aggregate") {
            element.boundedContext = bc.elementView.id
          }
        })
      },
      generate(){
        // this.generator = new DDLGenerator(this);
        // this.generator.generate();
      }
    },
  };
</script>
