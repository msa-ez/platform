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
                        <v-overlay v-if="showOverlay">
                            <v-col align="center">
                                <div>{{ showOverlay }}</div>
                                <v-progress-circular indeterminate size="64">
                                    <v-btn text @click="closeOverlay()"></v-btn>
                                </v-progress-circular>
                            </v-col>
                        </v-overlay>

                        <v-layout>
                            <modal
                                    name="uml-modal"
                                    :height="'80%'"
                                    :width="'80%'"
                            >
                                <class-modeler></class-modeler>
                            </modal>
                        </v-layout>

                        <v-snackbar
                                v-model="deleteSnackbar"
                                color="primary"
                                multi-line
                                :timeout="5000"
                        >
                            해당 BoundedContext ( {{ deleteBounded }} )데이터가
                            삭제되었습니다.
                            <v-btn dark @click="deleteSnackbar = false">
                                Close
                            </v-btn>
                        </v-snackbar>

                        <v-snackbar
                                v-model="ideSnackBar.show"
                                :timeout="ideSnackBar.timeout"
                                auto-height
                                :color="ideSnackBar.Color"
                                multi-line
                        >
                            <v-layout align-center pr-4>
                                <v-icon
                                        v-if="ideSnackBar.icon"
                                        class="pr-3"
                                        dark
                                        large
                                >{{ ideSnackBar.icon }}</v-icon
                                >
                                <v-layout column>
                                    <div v-if="ideSnackBar.title">
                                        <strong>{{ ideSnackBar.title }}</strong>
                                    </div>
                                    <div>{{ ideSnackBar.Text }}</div>
                                </v-layout>
                            </v-layout>
                            <template v-slot:action="{ attrs }">
                                <v-btn
                                        v-if="ideSnackBar.wrongGitInfo"
                                        color="white"
                                        outlined
                                        small
                                        v-bind="attrs"
                                        @click="
                                        functionSelect('opentheiaIDE'),
                                            (ideSnackBar.show = false)
                                    "
                                >
                                    open with theia IDE
                                </v-btn>
                                <v-btn
                                        color="white"
                                        text
                                        small
                                        v-bind="attrs"
                                        @click="ideSnackBar.show = false"
                                >
                                    Close
                                </v-btn>
                            </template>
                        </v-snackbar>

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

                        <v-alert
                                dense
                                elevation="6"
                                colored-border
                                :value="alertInfo.show"
                                :border="alertInfo.border"
                                :type="alertInfo.type"
                                :max-width="alertInfo.maxWidth"
                                :color="alertInfo.color"
                                width="100%"
                                style="
                                position: absolute;
                                z-index: 999;
                                left: 50%;
                                transform: translate(-50%, 0%);
                            "
                        >
                            <div style="color: black">{{ alertInfo.text }}</div>
                            <a
                                    v-if="alertInfo.link"
                                    target="_blank"
                                    :href="alertInfo.link"
                            >Github Persenal Access Token 발행 방법</a
                            >
                            <div style="text-align: right">
                                <v-btn
                                        v-if="alertInfo.submit"
                                        @click="alertSubmit(alertInfo.fnNum)"
                                        small
                                        color="green"
                                        style="margin-right: 5px"
                                        dark
                                >
                                    {{ alertInfo.submit }}
                                </v-btn>
                                <v-btn
                                        @click="alertClose(alertInfo.fnNum)"
                                        small
                                        text
                                >{{ $t("word.close") }}</v-btn
                                >
                            </div>
                        </v-alert>

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
                                            v-if="value.elements &&typeof value.elements == 'object'"
                                            v-for="elementId in Object.keys(value.elements)"
                                    >
                                        <component
                                                v-if="elementId &&value.elements[elementId] && validateElementFormat(value.elements[elementId])"
                                                :is="getComponentByClassName(value.elements[elementId]._type)"
                                                :value.sync="value.elements[elementId]"
                                                :ref="elementId"
                                        ></component>
                                    </div>

                                    <div
                                            v-if="value.relations &&typeof value.relations == 'object'"
                                            v-for="relationId in Object.keys(value.relations)"
                                    >
                                        <component
                                                v-if="relationId &&value.relations[relationId] && validateRelationFormat(value.relations[relationId])"
                                                :is="getComponentByClassName(value.relations[relationId]._type)"
                                                :value.sync="value.relations[relationId]"
                                                :ref="relationId"
                                        ></component>
                                    </div>

                                    <!-- PBC Element -->
                                    <div
                                            v-if="filteredPBCValue.elements &&typeof filteredPBCValue.elements == 'object'"
                                    >
                                        <div
                                                v-for="elementId in Object.keys(filteredPBCValue.elements)"
                                                :key="elementId"
                                        >
                                            <component
                                                    v-if="elementId &&filteredPBCValue.elements[elementId]"
                                                    :is="getComponentByClassName(filteredPBCValue.elements[elementId]._type)"
                                                    :value.sync="filteredPBCValue.elements[elementId]"
                                                    :ref="elementId"
                                                    :isPBCModel="true"
                                            ></component>
                                        </div>
                                    </div>
                                    <div
                                            v-if="filteredPBCValue.relations && typeof filteredPBCValue.relations == 'object'"
                                    >
                                        <div
                                                v-for="relationId in Object.keys(filteredPBCValue.relations)"
                                                :key="relationId"
                                        >
                                            <component
                                                    v-if="relationId &&filteredPBCValue.relations[relationId]"
                                                    :is="getComponentByClassName(filteredPBCValue.relations[relationId]._type)"
                                                    :value.sync="filteredPBCValue.relations[relationId]"
                                                    :ref="relationId"
                                                    :isPBCModel="true"
                                            ></component>
                                        </div>
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
                                            <div class="eventstorming-mobile-home-button">
                                                <router-link to="/">
                                                    <v-icon
                                                        style="height: 24px; margin-top: 38px; margin-right: 5px;"
                                                        color="primary"
                                                    >
                                                        mdi-home
                                                    </v-icon>
                                                </router-link>
                                            </div>
                                            <v-icon
                                                    style="
                                                    height: 24px;
                                                    margin-top: 38px;
                                                "
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
                                            style="margin: 40px 0px 0px 15px;
                                            z-index: 1;"
                                        >
                                            <v-row
                                                    justify="end"
                                                    align="start"
                                                    style="margin-right: 15px"
                                            >
                                                <slot name="menu-buttons">
                                                    <v-menu
                                                            class="pa-2"
                                                            open-on-hover
                                                            offset-y
                                                            left
                                                    >
                                                        <template
                                                                v-slot:activator="{
                                                                on,
                                                            }"
                                                        >
                                                            <div>
                                                                <v-btn
                                                                        class="gs-model-z-index-1 es-hide-k8s-btn"
                                                                        text
                                                                        style="margin-right: 5px;"
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
                                                            v-if="isServerModel &&!isClazzModeling"
                                                            class="pa-2"
                                                            open-on-hover
                                                            offset-y
                                                            left
                                                    >
                                                        <template
                                                                v-slot:activator="{on,}"
                                                        >
                                                            <div>
                                                                <v-btn
                                                                        class="gs-model-z-index-1"
                                                                        v-if="isHexagonal"
                                                                        text
                                                                        style="
                                                                        margin-right: 5px;
                                                                    "
                                                                        @click="generateModel()"
                                                                        :disabled="disableBtn"
                                                                        v-on="on"
                                                                >
                                                                    <v-icon
                                                                    >mdi-hexagon-outline</v-icon
                                                                    >
                                                                    <div>
                                                                        Hexagonal
                                                                    </div>
                                                                </v-btn>
                                                                <v-btn
                                                                        class="gs-model-z-index-1 es-hide-view-btn"
                                                                        v-else
                                                                        text
                                                                        style="margin-right: 5px;"
                                                                        @click="generateHexagonal()"
                                                                        :disabled="disableBtn"
                                                                        v-on="on"
                                                                >
                                                                    <v-icon>mdi-view-dashboard</v-icon>
                                                                    <div class="es-hide-view">VIEW</div>
                                                                </v-btn>
                                                            </div>
                                                        </template>

                                                        <v-list
                                                                style="overflow: hidden;"
                                                        >
                                                            <v-list-item
                                                                    v-for="(item, index) in conversionItems"
                                                                    :key="index"
                                                                    @click="functionSelect(item.title,index)"
                                                            >
                                                                <v-list-item-title
                                                                >{{item.title}}
                                                                </v-list-item-title>
                                                            </v-list-item>
                                                        </v-list>
                                                    </v-menu>

                                                    <!--                                                    <v-menu-->
                                                    <!--                                                            class="pa-2"-->
                                                    <!--                                                            open-on-hover-->
                                                    <!--                                                            offset-y-->
                                                    <!--                                                            left-->
                                                    <!--                                                    >-->
                                                    <!--                                                        <template v-slot:activator="{ on }">-->
                                                    <!--                                                            <div>-->
                                                    <!--                                                                <v-btn  class="gs-model-z-index-1"-->
                                                    <!--                                                                        v-if="isHexagonal"-->
                                                    <!--                                                                        text-->
                                                    <!--                                                                        style="margin-right: 5px;"-->
                                                    <!--                                                                        color="primary"-->
                                                    <!--                                                                        @click='generateModel()'-->
                                                    <!--                                                                        :disabled="disableBtn"-->
                                                    <!--                                                                        v-on="on"-->
                                                    <!--                                                                >-->
                                                    <!--                                                                    <v-icon>mdi-hexagon-outline</v-icon>-->
                                                    <!--                                                                    <div>Hexagonal</div>-->
                                                    <!--                                                                </v-btn>-->
                                                    <!--                                                                <v-btn  class="gs-model-z-index-1 es-hide-view-btn"-->
                                                    <!--                                                                        v-else-->
                                                    <!--                                                                        text-->
                                                    <!--                                                                        style="margin-right: 5px;"-->
                                                    <!--                                                                        color="primary"-->
                                                    <!--                                                                        @click='generateHexagonal()'-->
                                                    <!--                                                                        :disabled="disableBtn"-->
                                                    <!--                                                                        v-on="on"-->
                                                    <!--                                                                >-->
                                                    <!--                                                                    <v-icon>mdi-view-dashboard</v-icon>-->
                                                    <!--                                                                    <div class="es-hide-view">VIEW</div>-->
                                                    <!--                                                                </v-btn>-->
                                                    <!--                                                            </div>-->
                                                    <!--                                                        </template>-->
                                                    <!--                                                        <v-list>-->
                                                    <!--                                                            <v-list-item-->
                                                    <!--                                                                    v-for="(item, index) in conversionItems"-->
                                                    <!--                                                                    :key="index"-->
                                                    <!--                                                                    @click="functionSelect(item.title,index)"-->
                                                    <!--                                                            >-->
                                                    <!--                                                                <v-list-item-title>{{ item.title }}-->
                                                    <!--                                                                </v-list-item-title>-->
                                                    <!--                                                            </v-list-item>-->
                                                    <!--                                                        </v-list>-->
                                                    <!--                                                    </v-menu>-->

                                                    <v-menu
                                                            v-if="
                                                            isServerModel &&
                                                            !isClazzModeling
                                                        "
                                                            class="pa-2"
                                                            open-on-click
                                                            offset-y
                                                            left
                                                    >
                                                        <template
                                                                v-slot:activator="{
                                                                on,
                                                            }"
                                                        >
                                                            <div>
                                                                <v-btn
                                                                        class="gs-model-z-index-1 es-hide-replay-btn"
                                                                        text
                                                                        style="
                                                                        margin-right: 5px;
                                                                    "
                                                                        @click="
                                                                        loadVersions()
                                                                    "
                                                                        :disabled="
                                                                        disableBtn
                                                                    "
                                                                        v-on="on"
                                                                >
                                                                    <v-icon>mdi-restart</v-icon>
                                                                    <div class="es-hide-replay">Versions</div>
                                                                </v-btn>
                                                            </div>
                                                        </template>

                                                        <v-list
                                                                style="
                                                                overflow: hidden;
                                                            "
                                                        >
                                                            <div
                                                                    v-if="
                                                                    versionLists
                                                                "
                                                            >
                                                                <div
                                                                        style="
                                                                        text-align-last: center;
                                                                    "
                                                                >
                                                                    VERSIONS
                                                                </div>
                                                                <v-divider></v-divider>
                                                                <div
                                                                        style="
                                                                        overflow-y: scroll;
                                                                        height: 200px;
                                                                    "
                                                                >
                                                                    <v-list-item
                                                                            v-for="(item,index) in filteredVersionLists"
                                                                            :key="index"
                                                                            @click="moveToVersion(item)"
                                                                            two-line
                                                                            dense
                                                                    >
                                                                        <v-list-item-content>
                                                                            <v-list-item-title
                                                                                    style="font-size: medium;">
                                                                                {{item.version}}
                                                                            </v-list-item-title>
                                                                            <v-list-item-subtitle
                                                                                    style="font-size: 10px;"
                                                                            >{{convertTimeStampToDate(item.timeStamp)}}</v-list-item-subtitle
                                                                            >
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
                                                                    <v-icon small>{{icon.save}}</v-icon>
                                                                    CREATE VERSION
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
                                                                <v-list-item-title>
                                                                    <v-icon small>mdi-restart</v-icon>REPLAY
                                                                </v-list-item-title>
                                                            </v-list-item>
                                                        </v-list>
                                                    </v-menu>

                                                    <v-menu
                                                            class="pa-2"
                                                            open-on-hover
                                                            offset-y
                                                            left
                                                    >
                                                        <template
                                                                v-slot:activator="{
                                                                on,
                                                            }"
                                                        >
                                                            <div
                                                                    v-if="isReadOnlyModel"
                                                            >
                                                                <v-btn
                                                                        class="gs-model-z-index-1 es-hide-fork-btn"
                                                                        text
                                                                        :disabled="disableBtn"
                                                                        @click="saveComposition('fork')"
                                                                        style="
                                                                        margin-right: 5px;
                                                                    "
                                                                >
                                                                    <v-icon>{{ icon.fork }}</v-icon>
                                                                    <div class="es-hide-fork">
                                                                        FORK
                                                                    </div>
                                                                </v-btn>
                                                                <v-btn
                                                                        class="gs-model-z-index-1 es-hide-join-btn"
                                                                        v-if="!projectVersion"
                                                                        :color="joinRequestedText.show
                                                                            ? 'primary'
                                                                            : 'success'
                                                                    "
                                                                        :disabled="disableBtn"
                                                                        @click="requestInviteUser()"
                                                                        style="
                                                                        margin-right: 5px;
                                                                    "
                                                                        text
                                                                >
                                                                    <div v-if="joinRequestedText.show">
                                                                        <v-icon>{{ icon.join }}</v-icon>
                                                                    </div>
                                                                    <div class="es-hide-join">
                                                                        {{joinRequestedText.text}}
                                                                    </div>
                                                                </v-btn>
                                                            </div>
                                                            <div v-else>
                                                                <v-btn
                                                                        class="gs-model-z-index-1 es-hide-save-btn"
                                                                        text
                                                                        v-if="
                                                                        showSaveBtn
                                                                    "
                                                                        style="
                                                                        margin-right: 5px;
                                                                    "
                                                                        :disabled="
                                                                        disableBtn
                                                                    "
                                                                        @click="saveComposition('save')"
                                                                        v-on="on"
                                                                >
                                                                    <v-icon>{{
                                                                        icon.save
                                                                        }}</v-icon>
                                                                    <div
                                                                            class="es-hide-save"
                                                                    >
                                                                        SAVE
                                                                    </div>
                                                                </v-btn>
                                                                <v-btn
                                                                        class="gs-model-z-index-1"
                                                                        text
                                                                        v-else
                                                                        :disabled="
                                                                        disableBtn
                                                                    "
                                                                        @click="saveComposition('fork')"
                                                                        style="
                                                                        margin-right: 5px;
                                                                    "
                                                                        v-on="on"
                                                                >
                                                                    <v-icon>{{
                                                                        icon.fork
                                                                        }}</v-icon>
                                                                    <div
                                                                            class="es-hide-fork"
                                                                    >
                                                                        FORK
                                                                    </div>
                                                                </v-btn>
                                                            </div>
                                                        </template>
                                                        <v-list
                                                                v-if="
                                                                !isClazzModeling
                                                            "
                                                        >
                                                            <v-list-item
                                                                    v-for="(
                                                                    item, index
                                                                ) in filteredSaveItems"
                                                                    :key="index"
                                                                    @click="functionSelect(item.title,index)"
                                                            >
                                                                <v-list-item-title
                                                                >{{
                                                                    item.title
                                                                    }}
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
                                                        <template
                                                                v-slot:activator="{
                                                                on,
                                                            }"
                                                        >
                                                            <div>
                                                                <v-btn
                                                                        class="gs-model-z-index-1 es-hide-share-btn"
                                                                        text
                                                                        style="
                                                                        margin-right: 5px;
                                                                    "
                                                                        :disabled="
                                                                        !initLoad
                                                                    "
                                                                        v-on="on"
                                                                        @click="openInviteUsers()"
                                                                >
                                                                    <v-icon>{{
                                                                        icon.share
                                                                        }}</v-icon>
                                                                    <div
                                                                            class="es-hide-share"
                                                                    >
                                                                        SHARE
                                                                    </div>
                                                                    <v-avatar
                                                                            v-if="
                                                                            requestCount
                                                                        "
                                                                            size="25"
                                                                            color="red"
                                                                            style="
                                                                            margin-left: 2px;
                                                                        "
                                                                    >
                                                                        {{
                                                                        requestCount
                                                                        }}
                                                                    </v-avatar>
                                                                </v-btn>
                                                            </div>
                                                        </template>
                                                        <v-list>
                                                            <v-list-item
                                                                    v-for="(
                                                                    item, index
                                                                ) in shareItems"
                                                                    :key="index"
                                                                    @click="functionSelect(item.title,index)"
                                                            >
                                                                <v-list-item-title
                                                                >{{
                                                                    item.title
                                                                    }}
                                                                </v-list-item-title>
                                                            </v-list-item>
                                                        </v-list>
                                                    </v-menu>
                                                    <!-- <v-btn class="gs-model-z-index-1 es-hide-code-btn"
                                                        text
                                                        style="margin-right: 5px;"
                                                        color="primary"
                                                        :disabled="!initLoad"
                                                        @click="openChatGptDialog()"
                                                    >
                                                        <v-icon>{{icon.code}}</v-icon>
                                                        <div class="es-hide-code">chatGPT</div>
                                                    </v-btn> -->
                                                    <!-- v-if="isOwnModel || isServerModel || isClazzModeling" -->
                                                    <v-menu
                                                            offset-y
                                                            open-on-hover
                                                            left
                                                    >
                                                        <template
                                                                v-slot:activator="{
                                                                on,
                                                            }"
                                                        >
                                                            <div>
                                                                <v-btn
                                                                    class="gs-model-z-index-1"
                                                                    style="margin-right: 5px;"
                                                                    color="primary"
                                                                    text
                                                                    @click="openCodeViewer()"
                                                                    :disabled="!initLoad"
                                                                    v-on="on"
                                                                >
                                                                    <v-icon>{{ icon.code }}</v-icon>
                                                                    <div>
                                                                        CODE
                                                                    </div>
                                                                    <v-progress-circular
                                                                            indeterminate
                                                                            v-if="
                                                                            ideWindow
                                                                        "
                                                                    ></v-progress-circular>
                                                                </v-btn>
                                                            </div>
                                                        </template>
                                                        <v-list
                                                                style="width: 175px"
                                                        >
                                                            <v-list-item
                                                                    v-for="( item, index ) in codeItems"
                                                                    :key="index"
                                                                    @click="functionSelect(item.title,index)"
                                                            >
                                                                <v-list-item-title
                                                                >{{ item.title }}
                                                                </v-list-item-title>
                                                            </v-list-item>
                                                        </v-list>
                                                    </v-menu>
                                                </slot>
                                            </v-row>
                                        </div>
                                    </v-row>
                                    <div class="es-is-mobile">
                                        <v-row
                                            class="mobile-action-btn"
                                            justify="center"
                                            align="start"
                                            style="
                                            display: flex;
                                            margin-right: 50px;"
                                        >
                                            <v-menu
                                                class="pa-2"
                                                open-on-hover
                                                offset-y
                                                left
                                            >
                                                <template
                                                    v-slot:activator="{ on }"
                                                >
                                                    <div>
                                                        <v-btn class="mobile-btn"
                                                            text
                                                            :disabled="disableBtn"
                                                            @click="openEmbeddedCanvas('Kubernetes')"
                                                            style="margin-top: 2px;"
                                                        >
                                                            <v-icon>mdi-kubernetes</v-icon>
                                                        </v-btn>
                                                    </div>
                                                </template>
                                            </v-menu>

                                            <v-menu
                                                    text
                                                    v-if="isServerModel && !isClazzModeling"
                                                    class="pa-2"
                                                    open-on-hover
                                                    offset-y
                                            >
                                                <template
                                                        v-slot:activator="{ on }"
                                                >
                                                    <div>
                                                        <v-btn
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
                                                <template
                                                    v-slot:activator="{ on }"
                                                >
                                                    <v-btn
                                                        text
                                                        v-if="isReadOnlyModel &&!projectVersion"
                                                        :color="joinRequestedText.show? 'primary': 'success'"
                                                        dark
                                                        @click="requestInviteUser()"
                                                        small
                                                    >
                                                        <div
                                                            v-if="joinRequestedText.show"
                                                        >
                                                            <v-icon>{{icon.join}}</v-icon>
                                                        </div>
                                                        {{joinRequestedText.text }}
                                                    </v-btn>
                                                    <v-btn
                                                            text
                                                            v-if="isReadOnlyModel"
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
                                                            v-for="( item, index) in filteredSaveItems"
                                                            :key="index"
                                                            @click="functionSelect(item.title,index)"
                                                    >
                                                        <v-list-item-title
                                                        >{{ item.title }}
                                                        </v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>
                                            <v-menu
                                                    v-if="isOwnModel && isServerModel && !isReadOnlyModel "
                                                    class="pa-2"
                                                    offset-y
                                                    open-on-hover
                                            >
                                                <template
                                                        v-slot:activator="{ on }"
                                                >
                                                    <div>
                                                        <v-btn
                                                                text
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
                                                                style="margin-left: 2px;"
                                                            >
                                                                {{ requestCount }}
                                                            </v-avatar>
                                                        </v-btn>
                                                    </div>
                                                </template>
                                                <v-list>
                                                    <v-list-item
                                                        v-for="( item, index ) in shareItems"
                                                        :key="index"
                                                        @click="functionSelect(item.title,index)"
                                                    >
                                                        <v-list-item-title
                                                        >{{ item.title }}
                                                        </v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>
                                            <v-menu
                                                class="pa-2"
                                                open-on-hover
                                                offset-y
                                                left
                                            >
                                                <template
                                                    v-slot:activator="{ on }"
                                                >
                                                    <div>
                                                        <v-btn
                                                            class="gs-model-z-index-1 mobile-btn"
                                                            v-if="isHexagonalModeling"
                                                            text
                                                            style="margin-top:2px;"
                                                            @click="generateModel()"
                                                            :disabled="disableBtn"
                                                            v-on="on"
                                                        >
                                                            <v-icon>mdi-hexagon-outline</v-icon>
                                                        </v-btn>
                                                        <v-btn
                                                            class="gs-model-z-index-1 mobile-btn"
                                                            v-else
                                                            text
                                                            style="margin-top:2px;"
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
                                                        v-for="( item, index ) in conversionItems"
                                                        :key="index"
                                                        @click="functionSelect(item.title,index)"
                                                    >
                                                        <v-list-item-title
                                                        >{{ item.title }}
                                                        </v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>

                                            <v-menu open-on-hover offset-y>
                                                <template
                                                    v-slot:activator="{ on }"
                                                >
                                                    <div>
                                                        <v-btn
                                                            color="primary"
                                                            text
                                                            class="mobile-btn"
                                                            @click="openCodeViewer()"
                                                            v-on="on"
                                                            small
                                                            style="margin-left:10px;"
                                                        >
                                                            <v-icon>{{icon.code}}</v-icon>
                                                        </v-btn>
                                                    </div>
                                                </template>
                                                <v-list>
                                                    <v-list-item
                                                        v-for="(item, index) in codeItems"
                                                        :key="index"
                                                        @click="functionSelect(item.title,index)"
                                                    >
                                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>
                                        </v-row>
                                    </div>
                                </slot>
                            </div>

                            <v-card
                                class="tools"
                                style="top: 100px; text-align: center"
                            >
                                <v-tooltip right>
                                    <template v-slot:activator="{ on, attrs }">
                                        <span
                                            class="bpmn-icon-hand-tool"
                                            v-bind:class="{ icons: !dragPageMovable, hands: dragPageMovable,}"
                                            _width="30"
                                            _height="30"
                                            v-on:click="toggleGrip"
                                            v-bind="attrs"
                                            v-on="on"
                                        >
                                        </span>
                                    </template>
                                    <span v-if="dragPageMovable == true">Draggable Screen : on</span>
                                    <span v-if="dragPageMovable == false">Draggable Screen : off</span>
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
                                            >mdi-border-inside
                                            </v-icon>
                                            <v-icon
                                                class="gs-automatic-guidance-icon"
                                                large
                                                v-if="automaticGuidance == false"
                                            >mdi-border-none
                                            </v-icon>
                                        </span>
                                    </template>
                                    <span v-if="automaticGuidance == true">Arrange Guidance : on</span>
                                    <span v-if="automaticGuidance == false">Arrange Guidance : off</span>
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
                                                v-if="!isReadOnlyModel &&(!isHexagonal ||(isHexagonal && (item.component.includes('bounded-context') ||item.component.includes('packaged-business-capabilities'))))"
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
                                        v-for="(item, key) in elementTypes.slice(0,5)"
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
                                                    v-if="!isReadOnlyModel &&(!isHexagonalModeling || (isHexagonalModeling && (item.component.includes('bounded-context') ||item.component.includes('packaged-business-capabilities'))))"
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
                                                    style="
                                                    color: #fbc02d;
                                                    margin-top: 3px;
                                                "
                                                    v-if="automaticGuidance == true"
                                            >mdi-border-inside</v-icon
                                            >
                                            <v-icon
                                                    class="gs-automatic-guidance-icon"
                                                    large
                                                    v-if="
                                                    automaticGuidance == false
                                                "
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
                                        v-for="(item, key) in elementTypes.slice(
                                        5,
                                        12
                                    )"
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
                                                    (!isHexagonalModeling ||
                                                        (isHexagonalModeling &&
                                                            (item.component.includes(
                                                                'bounded-context'
                                                            ) ||
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
                    <div :key="autoModelingDialogKey">
                        <AutoModelingDialog
                                :showChat="showField"
                                @changeFieldStatus="changeFieldStatus"
                                ref="autoModelingDialog"
                                mode="es"
                        ></AutoModelingDialog>
                    </div>

                    <!-- <AutoModelingDialog
                        :mode="openAiMode"
                        :showDialog="openAiMenu"
                        :showChat="false"
                        @closeAutoModelingDialog="closeAutoModelingDialog"
                        @java-parse="javaParse"
                        @createModel="createModel"
                        @setModelDescription="setModelDescription"
                        @modelCreationFinished="openCodeViewer"
                    ></AutoModelingDialog> -->
                    <!-- @close="openAiMenu=false" -->

                    <GeneratorUI
                            key="eventGenerator"
                            v-if="generatorStep === 'event' && projectId"
                            :projectId="projectId"
                            ref="generatorUI"
                            @createModel="createModel"
                            @clearModelValue="clearModelValue"
                            :generatorStep="generatorStep"
                    >
                        <v-tooltip slot="buttons" bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    @click="generateAggregate()"
                                    small
                                    v-bind="attrs"
                                    v-on="on"
                                    class="gs-es-auto-modling-btn"
                                    style="padding:0px 5px; margin-right:10px;"
                                    color="primary"
                                >
                                    <span>CONTINUE<v-icon>mdi-arrow-right</v-icon></span>
                                </v-btn>
                            </template>
                            <span>Generate Aggregate</span>
                        </v-tooltip>
                    </GeneratorUI>
                    <GeneratorUI
                            key="aggregateGenerator"
                            v-if="generatorStep === 'aggregate' && projectId"
                            :projectId="projectId"
                            generator="ESGenerator"
                            :generatorParameter="generatorParameter"
                            ref="aggregateGeneratorUI"
                            @createModel="createModel"
                            @onGenerationFinished="onGenerationFinished"
                            @clearModelValue="clearModelValue"
                            :generatorStep="generatorStep"
                    >
                        <!-- <v-tooltip slot="buttons" bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                        @click="generateAggregate()"
                                        icon
                                        small
                                        v-bind="attrs"
                                        v-on="on"
                                        style="margin-right: 10px; z-index: 2"
                                        disabled
                                >
                                    <Icon icon="ph:tag-simple-light" width="30" height="30" />
                                </v-btn>
                            </template>
                            <span>Generate Code</span>
                        </v-tooltip> -->
                    </GeneratorUI>

                    <div v-if="showUiWizard">
                        <UIWizardDialoger
                                v-model="value.description"
                                @createModel="onUiHintGenerated"
                        ></UIWizardDialoger>
                    </div>

                    <v-dialog
                            v-model="clusterDialog"
                            persistent
                            fullscreen
                            hide-overlay
                            transition="dialog-bottom-transition"
                    >
                        <v-card>
                            <v-toolbar dark color="primary">
                                <v-toolbar-title
                                >Manage Clusters</v-toolbar-title
                                >
                                <v-spacer></v-spacer>
                                <v-toolbar-items>
                                    <v-btn
                                            icon
                                            dark
                                            @click="clusterDialog = false"
                                    >
                                        <v-icon>mdi-close</v-icon>
                                    </v-btn>
                                </v-toolbar-items>
                            </v-toolbar>
                            <v-list three-line subheader>
                                <v-list-item>
                                    <v-list-item-content>
                                        <clusters
                                                @close="clusterDialog = false"
                                                v-model="clusterInfo"
                                        />
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list>
                        </v-card>
                    </v-dialog>
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

                    <!-- <v-overlay v-if="loadMerge" :absolute="true">
                        <v-progress-circular indeterminate></v-progress-circular>
                        소스코드 생성중...
                    </v-overlay> -->

                    <dialog-purchase-item
                            v-model="purchaseItemDialog"
                            :purchase-item-info="purchaseItemDialogInfo"
                            @result="purchaseItemDialogSubmit"
                            @close="purchaseItemDialogClose"
                    >
                    </dialog-purchase-item>

                    <!--        <v-dialog v-model="ideCheckDialog" max-width="340">-->
                    <!--            <v-card>-->
                    <!--                <v-card-title class="headline">Project IDE</v-card-title>-->
                    <!--                <v-card-text>-->
                    <!--                    <div style="color: #8b0000; font-size: medium">파일을 업데이트 하시겠습니까?</div>-->
                    <!--                    &lt;!&ndash;                    <div style="color: #000000"></div>&ndash;&gt;-->
                    <!--                    <v-checkbox label="Github 연동 (Github 로그인 필요) " v-model="githubCheck"></v-checkbox>-->
                    <!--                    <v-checkbox label="초기화 (체크 시, 기존 파일이 모두 삭제됩니다.)" v-model="ideUpdateCheck"></v-checkbox>-->
                    <!--                </v-card-text>-->
                    <!--                <v-card-actions>-->
                    <!--                    <v-spacer></v-spacer>-->
                    <!--                    <v-btn color="green darken-1" text @click="openProjectIDE()">OK</v-btn>-->
                    <!--                    <v-btn color="red darken-1" text @click="ideCheckDialog = false">Cancel</v-btn>-->
                    <!--                </v-card-actions>-->
                    <!--            </v-card>-->
                    <!--        </v-dialog>-->

                    <v-dialog
                            v-model="resourceQuotaDialog"
                            @click:outside="closeResourceQuota()"
                            max-width="550"
                    >
                        <div style="text-align: -webkit-center">
                            <IDEResourceDialog
                                    :namespace="hashName"
                                    @submit="closeResourceQuota"
                            ></IDEResourceDialog>
                        </div>
                    </v-dialog>

                    <!--                    <v-dialog v-model="generateZipDialog" persistent max-width="290">-->
                    <!--                        <v-card>-->
                    <!--                            <v-card-title class="headline">Generate Zip Archive</v-card-title>-->
                    <!--                            <v-card-text>-->
                    <!--                                Default Base Template-->
                    <!--                                <v-select-->
                    <!--                                        :disabled="isDownloading"-->
                    <!--                                        v-model="selectedBaseTemplate"-->
                    <!--                                        :items="baseTemplateList"-->
                    <!--                                        item-text="display"-->
                    <!--                                        item-value="template"-->
                    <!--                                        hide-details-->
                    <!--                                        class="pa-0"-->
                    <!--                                ></v-select>-->
                    <!--                            </v-card-text>-->
                    <!--                            <v-card-actions>-->
                    <!--                                <v-spacer></v-spacer>-->
                    <!--                                <div v-if="!isDownloading">-->
                    <!--                                    <v-btn text @click="generateZipDialog = false">Cancel</v-btn>-->
                    <!--                                    <v-btn color="primary" text @click="checkedPaidItem()">Download</v-btn>-->
                    <!--                                </div>-->
                    <!--                                <v-progress-circular-->
                    <!--                                        v-else-->
                    <!--                                        indeterminate-->
                    <!--                                        color="primary"-->
                    <!--                                ></v-progress-circular>-->
                    <!--                            </v-card-actions>-->
                    <!--                        </v-card>-->
                    <!--                    </v-dialog>-->

                    <v-dialog v-model="tokenDialog" max-width="290">
                        <v-card>
                            <v-card-title class="headline"
                            >Token Dialog</v-card-title
                            >
                            <v-card-text>
                                <v-text-field
                                        v-model="clusterAddress"
                                        label="Cluster Address"
                                        required
                                ></v-text-field>
                                <v-text-field
                                        v-model="kubernetesToken"
                                        label="Kubernetes Token"
                                        required
                                ></v-text-field>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                        color="green darken-1"
                                        text
                                        @click="tokenSave()"
                                >Download</v-btn
                                >
                                <v-btn
                                        color="red darken-1"
                                        text
                                        @click="tokenDialog = false"
                                >Cancel</v-btn
                                >
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                    <v-dialog v-model="forkAlertDialog" max-width="290">
                        <v-card>
                            <v-card-title class="headline"
                            >Fork
                                <v-icon>{{ icon.fork }}</v-icon>
                            </v-card-title>
                            <v-card-text>
                                권한이 없어서 수정 할 수 없습니다. Fork를 하여
                                사용해 주세요.</v-card-text
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

                    <v-dialog v-model="projectIdeAlertDialog" max-width="500">
                        <v-card>
                            <v-card-title class="headline"
                            >Warning</v-card-title
                            >
                            <v-card-text>
                                There are
                                <span style="color: red">{{ errorCount }}</span>
                                elements that would be problematic for building the project.<br />You can continue with this warning.
                            </v-card-text>
                            <v-card-actions>
                                <v-list>
                                    <v-list-group no-action>
                                        <template v-slot:activator>
                                            <v-list-item-content>
                                                <!-- <v-icon style="margin-right: 2%;" :color="validationLevelIcon[errorList[0].level].color">{{validationLevelIcon[errorList[0].level].icon}}</v-icon> -->
                                                <v-list-item-title
                                                >See details</v-list-item-title
                                                >
                                            </v-list-item-content>
                                        </template>

                                        <v-list-item
                                                v-for="item in errorList"
                                                :key="item.code"
                                                style="margin-left: -12%"
                                        >
                                            <v-list-item-content>
                                                <v-list-item-title>
                                                    <v-icon
                                                        style="margin-right: 2%"
                                                        :color="validationLevelIcon[item.level].color"
                                                    >{{validationLevelIcon[item.level].icon}}
                                                    </v-icon>
                                                    [ {{ item.eleName }} ] {{ item.msg }}
                                                </v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list-group>
                                </v-list>
                                <br />
                            </v-card-actions>
                            <div style="margin-left: 58%; padding-bottom: 10px">
                                <v-btn
                                        text
                                        @click.native="projectIdeAlertDialog = false"
                                >Cancel</v-btn
                                >
                                <v-btn
                                        color="primary"
                                        text
                                        @click="openIdeAccept(),functionSelect('Project IDE')"
                                >Open IDE
                                </v-btn>
                            </div>
                        </v-card>
                    </v-dialog>

                    <v-dialog
                            no-click-animation
                            v-model="embeddedCanvasDialog"
                            persistent
                            fullscreen
                            hide-overlay
                            transition="dialog-bottom-transition"
                    >
                        <v-card>
                            <Icon
                                    v-if="
                                    embeddedCanvasType ==
                                    'Domain Class Modeling'
                                "
                                    class="gs-icon-style"
                                    icon="fluent-mdl2:modeling-view"
                                    style="
                                    margin-right: 2px;
                                    height: 40px;
                                    width: 40px;
                                    color: #1e88e5;
                                    position: fixed;
                                    z-index: 1;
                                    top: 15px;
                                    left: 20px;
                                    width: 50px;
                                    height: 50px;
                                "
                            />
                            <v-icon
                                    v-else-if="embeddedCanvasType == 'Kubernetes'"
                                    size="55"
                                    style="
                                    color: #1e88e5;
                                    position: fixed;
                                    z-index: 1;
                                    top: 15px;
                                    left: 20px;
                                "
                                    @click="closeEmbeddedCanvas()"
                            >mdi-kubernetes</v-icon
                            >
                            <v-btn
                                    icon
                                    dark
                                    @click="closeEmbeddedCanvas()"
                                    style="
                                    position: fixed;
                                    z-index: 1;
                                    right: 20px;
                                    top: 20px;
                                    color: gray;
                                "
                            >
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                            <v-layout
                                    v-if="
                                    embeddedCanvasType ==
                                    'Domain Class Modeling'
                                "
                            >
                                <uml-class-model-canvas
                                        :embedded="true"
                                        v-model="embeddedCanvasValue"
                                        :aggregateRootList="aggregateRootList"
                                ></uml-class-model-canvas>
                            </v-layout>
                            <v-layout
                                    v-else-if="embeddedCanvasType == 'Kubernetes'"
                            >
                                <kubernetes-model-canvas
                                        :embedded="true"
                                        :projectId="projectId"
                                        :projectName="projectName"
                                        :isOwnModel="isOwnModel"
                                        :getReadOnly="isReadOnlyModel"
                                        :isReadOnlyModel="isReadOnlyModel"
                                        :modelingProjectId="projectId"
                                        :projectVersion="projectVersion"
                                        v-model="embeddedCanvasInitValue"
                                        @changedByMe="settingChangedByMe"
                                ></kubernetes-model-canvas>
                            </v-layout>
                        </v-card>
                    </v-dialog>

                    <v-dialog v-model="settingExportDialog" max-width="500">
                        <v-card>
                            <v-card-title style="color: #757575">
                                Export as a PBC
                            </v-card-title>
                            <v-card-text>
                                <v-list v-if="publicPBCElements">
                                    <v-list-group
                                            v-for="(elements, key) in publicPBCElements"
                                            :value="true"
                                    >
                                        <template v-slot:activator>
                                            <v-list-item-title
                                            >Select Public
                                                {{ key }}</v-list-item-title
                                            >
                                        </template>
                                        <v-list-item
                                                v-for="element of elements"
                                                :key="element.elementView.id"
                                        >
                                            <v-list-item-action>
                                                <v-checkbox
                                                        v-model="
                                                        element.selectedPBC
                                                    "
                                                ></v-checkbox>
                                            </v-list-item-action>
                                            <v-list-item-content>
                                                <v-list-item-title
                                                        v-text="element.name"
                                                ></v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list-group>
                                </v-list>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                        color="green darken-1"
                                        text
                                        @click="applyExportDialog()"
                                >
                                    Apply
                                </v-btn>
                                <v-btn
                                        color="red darken-1"
                                        text
                                        @click="closeExportDialog()"
                                >
                                    Close
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                    <v-dialog v-model="bpmnDialog" max-width="500">
                        <v-card>
                            <v-card-title>Select Process</v-card-title>
                            <v-card-text>
                                <v-list-item
                                        v-for="command in bpmnCommands"
                                        :key="command.elementView.id"
                                        @click="conversionBpmn(command)"
                                >
                                    <v-list-item-title>{{
                                        command.name
                                        }}</v-list-item-title>
                                    <v-list-item-icon>
                                        <v-icon>mdi-open-in-new</v-icon>
                                    </v-list-item-icon>
                                </v-list-item>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                        color="red darken-1"
                                        text
                                        @click="bpmnDialog = false"
                                >
                                    Close
                                </v-btn>
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
                                <v-btn
                                        @click="closeModelingListsDialog()"
                                        small
                                        text
                                ><v-icon small>mdi-close</v-icon></v-btn
                                >
                            </v-card-actions>
                            <v-card-text>
                                <PBCModelList
                                        :pbc="modelingPBCElement"
                                        @selected-model="applyModelingListsDialog"
                                        @close="closeModelingListsDialog"
                                ></PBCModelList>
                            </v-card-text>
                        </v-card>
                    </v-dialog>

                    <!--        <modal name="ide-modal" :height='"80%"' :width="'80%'" :draggable="true" :hash-name="hashName"-->
                    <!--               :resizable="true">-->
                    <!--            <ide-loading-page></ide-loading-page>-->
                    <!--        </modal>-->

                    <!--   model IMAGE     -->
                    <modeler-image-generator
                            ref="modeler-image-generator"
                    ></modeler-image-generator>

                    <hsc-window-style-metal>
                        <hsc-window
                                title="User Camera"
                                :closeButton="true"
                                :isOpen.sync="webRtcDialog"
                                :resizable="true"
                                :isScrollable="true"
                                :minWidth="400"
                                :minHeight="110"
                                :maxWidth="800"
                                :maxHeight="110"
                                positionHint="5 / -10"
                                style="
                                color: rgb(0, 0, 0);
                                box-shadow: rgba(0, 0, 0, 0.5) 0px 4pt 8pt;
                                background: linear-gradient(
                                    rgb(255, 255, 255),
                                    rgb(255, 255, 255)
                                );
                                z-index: 0;
                                overflow: visible;
                                width: 404px;
                                height: 154.2px;
                            "
                        >
                            <v-layout>
                                <v-col>
                                    <v-row
                                            style="
                                            margin-left: 2px;
                                            margin-bottom: 2px;
                                        "
                                    >
                                        <vue-webrtc
                                                ref="webrtc"
                                                width="100%"
                                                height="160px"
                                                cameraHeight="50px"
                                                enableAudio
                                                class="video-list"
                                                :roomId="rtcRoomId"
                                                @error="onError"
                                        />
                                    </v-row>
                                </v-col>
                            </v-layout>
                        </hsc-window>
                    </hsc-window-style-metal>
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
                        :generatorStep="generatorStep"
                        :userInfo="userInfo"
                        @changedByMe="settingChangedByMe"
                        @editModelData="editModelData"
                        canvas-name="event-storming-model-canvas"
                ></CodeGenerator>
            </template>
        </separate-panel-components>

        <GitInformation
                v-model="gitInfoDialog"
                @close="closeGitInfo()"
                :git.sync="gitURLforModel"
        ></GitInformation>
        <div v-for="(otherMouseEvent, index) in filteredMouseEventHandlers">
            <div class="mouse-cursor" :id="index">
                <div class="mouse-cursor-name">
                    <v-chip
                            small
                            :color="otherMouseEvent.color"
                            text-color="white"
                    >
                        {{ otherMouseEvent.name }}
                    </v-chip>
                </div>
            </div>
        </div>
        <v-dialog v-model="showLoginCard"
        ><Login :onlyGitLogin="true" @login="showLoginCard = false"
        /></v-dialog>

        <v-dialog
                v-model="mirrorElementDialog"
                persistent
                style="height: 100%"
                width="300"
                scrollable
        >
            <v-card style="height: 100%">
                <v-card-title> Select for mirror element</v-card-title>
                <v-card-text>
                    <v-autocomplete
                            label="BoundedContext"
                            v-model="mirrorElementInfo.selectedBC"
                            item-text="name"
                            item-value="elementView.id"
                            :items="filteredBCForMirror"
                            auto-select-first
                    ></v-autocomplete>

                    <v-autocomplete
                            v-if="filteredAggregateForMirror"
                            label="Aggregate"
                            v-model="mirrorElementInfo.selectedAgg"
                            item-text="name"
                            item-value="elementView.id"
                            :items="filteredAggregateForMirror"
                            auto-select-first
                    ></v-autocomplete>
                </v-card-text>
                <v-card-actions style="justify-content: right">
                    <v-btn @click="applySelectedMirrorElement()" text
                    >Select</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- <gitAPIMenu></gitAPIMenu> -->
    </div>
</template>

<script>
    // import { Octokit, App } from "https://cdn.skypack.dev/octokit";
    // import CodeViewer from "./EventStormingCodeViewer";
    import EventStormingModeling from "./index";
    import SeparatePanelComponents from "../../SeparatePanelComponents";
    import AutoModelingDialog from "../modeling/AutoModelingDialog";
    import GeneratorUI from "../modeling/generators/GeneratorUI";

    import ParticipantPanel from "../modeling/ParticipantPanel";
    import ModelCanvas from "../modeling/ModelCanvas";
    import CodeViewer from "../CodeViewer";
    import gitAPIMenu from "../gitAPIMenu";
    import MonacoEditor from "vue-monaco";
    import ModelStorageDialog from "../modeling/ModelStorageDialog";
    import { diffString, diff } from "json-diff";
    import IdeLoadingPage from "../../IdeLoadingPage";
    import GitInformation from "../../GitInformation";
    import json2yaml from "json2yaml";
    import IDEResourceDialog from "../../IDEResourceDialog";
    import DialogPurchaseItem from "../../payment/DialogPurchaseItem";
    import { mdiAbTesting, mdiFolderEye } from "@mdi/js";
    import * as io from "socket.io-client";
    import DiffMatchPatch from "diff-match-patch";
    import ModelCanvasShareDialog from "../modeling/ModelCanvasShareDialog";
    import KubernetesModelCanvas from "../k8s-modeling/KubernetesModelCanvas";
    import UMLClassDiagram from "../class-modeling/UMLClassModelCanvas";
    import CodeGenerator from "../modeling/CodeGenerator";
    // import EventStormingModelList from "./EventStormingModelList";
    import PBCModelList from "./PBCModelList";
    import UIWizardDialoger from "../modeling/generators/UIWizardDialoger";
    import StorageBase from "../modeling/StorageBase";
    import Login from "../../oauth/Login";
    // import EventStormingModelList from "../../listPages/AlgoliaModelLists";
    // import ModelCodeGenerator from "../modeling/ModelCodeGenerator";
    import isAttached from "../../../utils/isAttached";

    var JSZip = require("jszip");
    var yamlpaser = require("js-yaml");
    var changeCase = require("change-case");
    var pluralize = require("pluralize");
    var path = require("path");
    var ConfigIniParser = require("config-ini-parser").ConfigIniParser;
    var delimiter = "\r\n"; //or "\n" for *nux
    var _ = require("lodash");
    const CodeGeneratorCore = require("../modeling/CodeGeneratorCore");

    var jsondiffpatch = require("jsondiffpatch").create({
        objectHash: function (obj, index) {
            return "$$index:" + index;
        },
    });

    var codeArraydiffpatch = require("jsondiffpatch").create({
        objectHash: function (obj, index) {
            console.log(obj);
            return obj.code;
        },
    });

    const prettier = require("prettier");
    const plugins = require("prettier-plugin-java");
    const axios = require("axios");

    window.jp = require("jsonpath");

    export default {
        name: "event-storming-model-canvas",
        mixins: [ModelCanvas],
        components: {
            UIWizardDialoger,
            AutoModelingDialog,
            GeneratorUI,
            ParticipantPanel,
            SeparatePanelComponents,
            GitInformation,
            IdeLoadingPage,
            saveAs,
            CodeViewer,
            gitAPIMenu,
            mdiAbTesting,
            mdiFolderEye,
            diffString,
            diff,
            io,
            MonacoEditor,
            IDEResourceDialog,
            KubernetesModelCanvas,
            Login,
            "model-canvas-share-dialog": ModelCanvasShareDialog,
            "dialog-purchase-item": DialogPurchaseItem,
            "model-storage-dialog": ModelStorageDialog,
            "uml-class-model-canvas": UMLClassDiagram,
            CodeGenerator,
            PBCModelList,
            // ModelCodeGenerator
        },
        props: {
            labId: String,
            isOriginalModel: Boolean,
        },
        data() {
            return {
                mirrorElementDialog: false,
                mirrorElementInfo: {
                    component: null,
                    mirrorElements: null,
                    selectedBC: null,
                    selectedAgg: null,
                },
                collaborationModelCore: null,
                showLoginCard: false,
                generatorParameter: {
                    userStory: null,
                },
                backupGenState: null,
                generatorStep: "event",
                showUiWizard: false,
                canvasRenderKey: 0,
                // automodeling
                showField: false,
                autoModelingDialogKey: 0,

                showVersions: false,
                modelScenario: "",
                openAiMode: null,
                openAiMenu: false,
                rootUuid: null,
                //UML
                // openAiMenu: false,
                // openAiPrompt: "",
                // isListening: false,
                // openAiResult: "",
                // speechRecognition: null,
                // startTemplateGenerate: false,
                // openaiToken: null,
                //PBC
                modelingListsDialog: false,
                modelingPBCElement: null,
                selectedPBCModelId: null,

                gitUsers: null,
                // gitOrgName: null,
                // gitRepoName: null,
                useIdeItem: null,
                ideSnackBar: {
                    Text: "",
                    show: false,
                    Color: null,
                    icon: null,
                    title: null,
                    timeout: null,
                    wrongGitInfo: false,
                },
                gitMenu: false,
                changedPathListsForGit: [],
                gitInfoDialog: false,
                gitURLforModel: null,
                //Hexagonal
                isHexagonal: false,
                hexagonalValue: null,
                hasNewHexagonalEl: false,
                hashName: undefined,
                projectID: undefined,
                settingGitInfoDialog: false,
                linkedSCM: false,
                scmUrl: null,
                monacoEditor: "",
                fab: false,
                sshUrl: "",
                gitInfo: {
                    name: "",
                    type: "github",
                    token: "",
                },
                // Source Count
                // completedSourceCount: undefined,
                // 윈도우
                ideWindow: undefined,
                windowWidth: window.innerWidth,
                ideUpdateCheck: false,
                githubCheck: false,
                ideCheckDialog: false,
                codeModalWidth: "80%",
                mergedExist: true,
                gitAccessToken: "",
                gitAccessTokenIs: false,
                gitAccessInput: false,
                deleteSnackbar: false,
                deleteBounded: "",
                isNetworkOffline: false,
                eventListener: null,
                //db permission
                isMultiShareType: "ReadOnly",
                isMultiShareTypeList: ["ReadOnly", "Write"],
                codeLoading: false,
                // codeViewing: false,
                changedCount: 0,
                test: [],
                versionItems: [{ title: "Versions" }],
                shareItems: [{ title: "Share" }],
                saveItems: [
                    { title: "Save to Server" },
                    { title: "Download model File" },
                    { title: "Duplicate" },
                    { title: "Generate PowerPoint" },
                    //  {title: 'Git URL for Model'}
                ],
                openItems: [
                    { title: "Open from Files" },
                    { title: "Open from Local" },
                ],
                codeItems: [
                    { title: "Code Preview" },
                    // {title: 'Download Archive'},
                    { title: "Project IDE" },
                    // {title: 'Reset Config'}
                ],
                conversionItems: [
                    { title: "Hexagonal" },
                    { title: "EventStorming" },
                    { title: "BPMN" },
                ],
                projectNameHint: null,
                projectNameColor: null,
                rules: {
                    required: (value) => !!value || "ProjectName required.",
                    min: (v) => v.length >= 8 || "Min 8 characters",
                    emailMatch: () =>
                        "The email and password you entered don't match",
                },
                generateZipDialog: false,
                imageBase: "static/image/symbol/",
                //Zip
                resourceQuotaDialog: false,
                setResourceQuota: false,
                //ide
                resourceQuota: {
                    memory: "4Gi",
                    cpu: "2",
                },
                resourceType: "ide-4m2c",
                //tool
                toolResourceQuota: {
                    memory: "4Gi",
                    cpu: "2",
                },
                toolResourceType: "k8s-4m2c",

                // mergeStatus: false,
                codeStatus: null,
                passValue: [],

                openCode: [],
                // openCodeWeb: [],
                // openCodeMerge: [],
                defaultTemplate: "https://github.com/msa-ez/template-spring-boot",
                changedHashList: [],

                checkName: true,
                changedModifying: false,
                cancelModifying: false,
                changedDiffCodeViewer: false,
                changedDiffCode: null,
                // Children
                drawer: false,
                chatUid: "",
                messageRef: {},
                //version
                version: "",
                revisionInfo: {},
                kubernetesToken: "",
                clusterAddress: "",
                tokenDialog: false,

                //embedded Canvas
                embeddedCanvasDialog: false,
                embeddedCanvasType: "",
                embeddedCanvasValue: null,
                aggregateRootList: [],
                boundedContextList: [],
                pbcValue: { elements: {}, relations: {} },
                embeddedCanvasInitValue: { elements: {}, relations: {} },

                //setting
                settingExportDialog: false,

                //bpmn
                bpmnDialog: false,
                bpmnCommands: [],

                //view
                viewSelect: {},
                viewOpenId: "",
                defaultValue: "",

                //edit
                //fork
                forkAlertDialog: false,
                ////////////////////// Validation ERROR CODE /////////////////////////////
                ESC_NOT_PJ_NAME: 0,
                validationCodeLists: {
                    0: {
                        level: "warning",
                        msg: "Please input the Project Name(Alphabetical words only)",
                    },
                },
                /////////////////////////////////
                elementTypes: [
                    {
                        icon: "bpmn-icon-start-event-none", //'OG.shape.essencia.Alpha',
                        component: "domain-event-definition",
                        label: "Event",
                        width: "100",
                        height: "100",
                        src: `${window.location.protocol + "//" + window.location.host}/static/image/event/event.png`,
                        // image: `${ window.location.protocol + "//" + window.location.host}/static/image/event/event.svg`
                    },
                    {
                        icon: "bpmn-icon-start-event-none", //'OG.shape.essencia.Alpha',
                        component: "command-definition",
                        label: "Command",
                        width: "100",
                        height: "100",
                        src: `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/event/command.png`,
                    },
                    {
                        icon: "bpmn-icon-start-event-none", //'OG.shape.essencia.Alpha',
                        component: "policy-definition",
                        label: "Policy",
                        width: "100",
                        height: "100",
                        src: `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/event/policy.png`,
                    },
                    {
                        icon: "bpmn-icon-start-event-none", //'OG.shape.essencia.Alpha',
                        component: "aggregate-definition",
                        label: "Aggregate",
                        width: "100",
                        height: "100",
                        src: `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/event/aggregate.png`,
                    },
                    {
                        icon: "bpmn-icon-start-event-none", //'OG.shape.essencia.Alpha',
                        component: "external-definition",
                        label: "External",
                        width: "100",
                        height: "100",
                        src: `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/event/external.png`,
                    },
                    {
                        icon: "bpmn-icon-start-event-none", //'OG.shape.essencia.Alpha',
                        component: "view-definition",
                        label: "Read Model",
                        width: "100",
                        height: "100",
                        src: `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/event/view.png`,
                    },
                    {
                        icon: "bpmn-icon-start-issue-none", //'OG.shape.essencia.Alpha',
                        component: "issue-definition",
                        label: "Issue",
                        width: "100",
                        height: "100",
                        src: `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/event/issue.png`,
                    },
                    {
                        icon: "bpmn-icon-start-event-none", //'OG.shape.essencia.Alpha',
                        component: "ui-definition",
                        label: "UI",
                        width: "100",
                        height: "100",
                        src: `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/event/ui_small.png`,
                    },
                    {
                        icon: "bpmn-icon-start-event-none", //'OG.shape.essencia.Alpha',
                        component: "bounded-context-definition",
                        label: "Bounded Context",
                        width: "100",
                        height: "100",
                        src: `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/event/bounded2.png`,
                    },
                    {
                        component: "packaged-business-capabilities",
                        label: "PBC",
                        width: "100",
                        height: "100",
                        src: `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/event/pbc.png`,
                    },
                    {
                        icon: "bpmn-icon-start-actor-none", //'OG.shape.essencia.Alpha',
                        component: "actor-definition",
                        label: "Actor",
                        width: "100",
                        height: "100",
                        src: `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/event/actor.png`,
                    },
                    {
                        component: "es-line-element",
                        label: "Line",
                        width: "100",
                        height: "100",
                        src: `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/symbol/edge.png`,
                    },
                    {
                        component: "es-text-element",
                        label: "Text",
                        width: "100",
                        height: "100",
                        src: `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/symbol/text_element.png`,
                    },
                ],
                isDownloading: false,
                // copy & paste
                tmpValue: [],
                errorCount: 0,
                projectIdeAlertDialog: false,
                openIde: false,
                errorList: [],
                validationLevelIcon: {
                    error: { icon: "mdi-close-circle-outline", color: "#E53935" },
                    warning: { icon: "mdi-alert-outline", color: "#FFA726" },
                    info: { icon: "mdi-information-outline", color: "#29B6F6" },
                },
                createModelInBoundedContext: false,
                createReadModel: false,
            };
        },
        computed: {
            projectSendable(){
                var me = this
                if(!me.getProjectDefinitionLists().includes(me.projectId)) return false;

                if(me.information && me.information.associatedProject) {
                    return true;
                }
                return false;
            },
            filteredBCForMirror() {
                var me = this;
                if (me.mirrorElementInfo.mirrorElements) {
                    let bcIds = [
                        ...new Set(
                            me.mirrorElementInfo.mirrorElements.map(
                                (mirrorElement) =>
                                    mirrorElement.boundedContext &&
                                    mirrorElement.boundedContext.id
                            )
                        ),
                    ];
                    return bcIds.map(
                        (id) => me.mirrorValue && me.mirrorValue.elements[id]
                    );
                }
                return null;
            },
            filteredAggregateForMirror() {
                var me = this;
                if (me.mirrorElementInfo.selectedBC) {
                    let equalsBCElements =
                        me.mirrorElementInfo.mirrorElements.filter(
                            (mirrorElement) =>
                                mirrorElement.boundedContext &&
                                mirrorElement.boundedContext.id ==
                                me.mirrorElementInfo.selectedBC
                        );

                    if (equalsBCElements.length > 1) {
                        let aggregateIds = [
                            ...new Set(
                                equalsBCElements.map(
                                    (element) =>
                                        element.aggregate && element.aggregate.id
                                )
                            ),
                        ];
                        return aggregateIds.map(
                            (id) => me.mirrorValue && me.mirrorValue.elements[id]
                        );
                    }
                }
                return null;
            },
            filteredSaveItems() {
                var me = this;
                if (!me.isReadOnlyModel && !me.showSaveBtn) {
                    return this.saveItems.slice(1);
                }
                return this.saveItems;
            },
            showSaveBtn() {
                // MODEL && 서버 && 자신  = SAVE
                // CLASS && 서버 && 자신 = SAVE
                // MODEL && 로컬 && 자신  = SAVE
                // CLASS && 로컬 && 자신  = SAVE

                var me = this;
                if (!me.isOriginalModel && me.isOwnModel) {
                    return true;
                }
                return false;
            },
            isHexagonalModeling() {
                return this.isHexagonal;
            },
            getUserCoin() {
                if (this.userInfo.savedCoin) {
                    return this.userInfo.savedCoin;
                }
                return 0;
            },
            getUserToolTime() {
                if (this.userInfo.savedToolTime) {
                    return this.userInfo.savedToolTime.toFixed(1);
                }
                return 0;
            },
            // loadMerge() {
            //     if (!this.mergeStatus && this.mergeStatus != null) {
            //         return true
            //     }
            //     return false
            // },
            disableBtn() {
                if (this.isDisable || !this.initLoad) {
                    return true;
                }
                return false;
            },
            attachedLists() {
                var me = this;
                let result = {};

                Object.values(me.value.elements).forEach(function (element) {
                    if (me.validateElementFormat(element)) {
                        if (!result[element._type]) result[element._type] = {};

                        if( element._type && element.elementView){
                            me.$set(result[element._type], element.elementView.id, element);
                        }
                    }
                });

                return {
                    boundedContextLists: result["org.uengine.modeling.model.BoundedContext"]? result["org.uengine.modeling.model.BoundedContext"] : {},
                    aggregateLists: result["org.uengine.modeling.model.Aggregate"] ? result["org.uengine.modeling.model.Aggregate"] : {},
                    eventLists: result["org.uengine.modeling.model.Event"] ? result["org.uengine.modeling.model.Event"] : {},
                    commandLists: result["org.uengine.modeling.model.Command"] ? result["org.uengine.modeling.model.Command"] : {},
                    policyLists: result["org.uengine.modeling.model.Policy"] ? result["org.uengine.modeling.model.Policy"] : {},
                    actorLists: result["org.uengine.modeling.model.Actor"] ? result["org.uengine.modeling.model.Actor"] : {},
                };
            },

            filteredPBCValue() {
                var me = this;
                var value = me.pbcValue ? me.pbcValue : { elements: {}, relations: {} };
                return value;
            },
            // loadMerge() {
            //     if (!this.mergeStatus && this.mergeStatus != null) {
            //         return true
            //     }
            //     return false
            // },
            publicPBCElements: function () {
                var me = this;
                var modelForElements = {
                    Event: [],
                    Command: [],
                };

                modelForElements.Event = Object.values(me.attachedLists.eventLists).filter(x=>x)
                modelForElements.Event = modelForElements.Event.map((element) => element = Object.assign({},element, {selectedPBC: element.visibility == "private" ? false:true}))

                modelForElements.Command = Object.values(me.attachedLists.commandLists).filter(x=>x)
                modelForElements.Command = modelForElements.Command.map((element) => element = Object.assign({},element, {selectedPBC: element.visibility == "private" ? false:true}))
                return modelForElements;
            },
        },
        created: async function () {
            var me = this;

            if (localStorage.getItem("gitAccessToken")) {
                me.gitAccessToken = localStorage.getItem("gitAccessToken");
                me.githubHeaders = {
                    Authorization: "token " + me.gitAccessToken,
                    Accept: "application/vnd.github+json",
                };
            }

            try {
                Vue.use(EventStormingModeling);
                me.canvasType = "es";
                if (this.$isElectron) me.isQueueModel = false;
                else me.isQueueModel = true;
                me.clusterItems = [{ title: "Cluster" }];
                me.track();

                // var getFilePathList = await axios.get(`https://gitlab.msastudy.io/api/v4/projects/48/repository/tree?ref=main&id=48&page=1&per_page=100&pagination=keyset&recursive=true`, {headers: {Authorization: 'Bearer _9zq7KJ29CfzjYjXP3Wb'}});
                // console.log(getFilePathList)
            } catch (e) {
                alert("Error: EventStormingModelCanvas Created().", e);
            }
        },
        mounted: function () {
            var me = this;
            me.$EventBus.$on("modelCreationFinished", this.openCodeViewer);

            // Generate with OpenAI for BoundedContext
            me.$EventBus.$on("createModelInBoundedContext", function (model, originModel) {
                me.createModelInBoundedContext = true;
                me.createModel(model, originModel);
            });

            me.$EventBus.$on("createAggregate", function (model, agg, originModel) {
                me.createAggregate(model, agg, originModel);
            });

            me.$EventBus.$on("createReadModel", function (model) {
                me.createReadModel = true;
                me.createModel(model);
            });

            me.$EventBus.$on("generationFinished", function () {
                // me.canvasRenderKey++;
            });

            // console.log(me.isClazzModeling);
            if (me.isClazzModeling) {
                var userName = localStorage
                    .getItem("email")
                    .split("@")[0]
                    .toLowerCase();
                var userGroup = localStorage
                    .getItem("email")
                    .split("@")[1]
                    .split(".")[0]
                    .toLowerCase();
                var lab = me.labId;
                if (me.labInfo) {
                    me.hashPath = me.getClassPath("labs/" + lab + "/" + userName);
                } else {
                    me.hashName = `ide-${me.hashCode(userGroup + "-" + userName)}`;
                    me.projectID = me.$route.params.projectId;
                }
            }

            // DeployData CallBack


            if (localStorage.getItem("gitAccessToken")) {
                me.gitInfo.token = localStorage.getItem("gitAccessToken");
            }
            // me.templatePerElement();

            window.addEventListener("beforeunload", (event) => {
                console.log(event);

                me.closeEmbeddedCanvas();
            });

            // if (localStorage.getItem(me.$route.params.projectId + '-Project-Name')) {
            //     me.projectName = localStorage.getItem(me.$route.params.projectId + '-Project-Name')

            //     localStorage.removeItem(me.$route.params.projectId + '-Project-Name')
            // }

            const uiWizrdChannel = new BroadcastChannel("ui-wizard");
            uiWizrdChannel.onmessage = function (e) {
                if (e.data) {
                    me.value.uiStyle = e.data.uiStyle;
                }
            };

            this.broadcastChannel = new BroadcastChannel(
                "event-storming-model-canvas"
            ); //this.$vnode.tag);
        },
        watch: {
            information: function () {
                var me = this;
                if (me.information) {
                    if (me.information.forkedByModelGitOrgName) {
                        me.gitOrgName = me.information.forkedByModelGitOrgName;
                    }
                    if (me.information.gitOrgName) {
                        me.gitOrgName = me.information.gitOrgName;
                    } else if (localStorage.getItem("gitUserName")) {
                        me.gitOrgName = localStorage.getItem("gitUserName");
                    }
                    if (me.information.gitRepoName) {
                        me.gitRepoName = me.information.gitRepoName;
                    } else if (me.information.projectName) {
                        me.gitRepoName = me.information.projectName;
                    }

                    if (!me.information.useIdeItem) {
                        me.useIdeItem = "gitpod";
                    } else {
                        me.useIdeItem = me.information.useIdeItem;
                    }
                }
            },


            // "initLoad": async function (newVal) {
            //     var me = this
            //     if (newVal) {
            // !!!!!!!!!!!!!! Changed initLoad -> afterLoad !!!!
            //         // complete for init model.
            //         // me.mirrorIdsByValue(me.value)
            //         if(me.value){
            //             if(!me.value.elements || Object.keys(me.value.elements).length == 0){
            //                 me.openAiMode = 'es'
            //                 me.openAiMenu = true
            //             }
            //         }
            //     }
            // },
            // "changedModifying": async function(newVal) {
            //     var me = this
            //
            //     if (newVal) {
            //         var parser = new ConfigIniParser("\n")
            //         var initContent = await me.getGitConfig()
            //         // parser.parse(iniContent);
            //         var parseConfig = parser.parse(initContent);
            //         parseConfig._ini.sections.forEach(function (section) {
            //             if (section.name.includes('origin')) {
            //                 section.options.forEach(function (option) {
            //                     if (option.name == 'url') {
            //                         me.linkedSCM = true;
            //                         me.scmUrl = option.value
            //                     }
            //                 })
            //
            //             }
            //         })
            //     }
            // },
            projectName: _.debounce(function (newVal, oldVal) {
                var me = this;
                if (me.initLoad) me.modelChanged = true;
                if (newVal) {
                    if (me.gitRepoName == null) {
                        me.gitRepoName = newVal;
                    }
                    me.gitInfo.name = newVal;
                    me.projectNameHint = null;
                    me.projectNameColor = null;
                } else {
                    me.projectNameHint = "Project name is required.";
                    me.projectNameColor = "red";
                }
            }, 0),
        },
        methods: {
            detectDeletedModel(beforeInfo){
                var me = this
                if(!me.projectInformation) return;
                if(!beforeInfo) return;

                if(!beforeInfo.eventStorming) return; // init added Model

                // delete all
                if(!me.projectInformation.eventStorming && beforeInfo.eventStorming) {
                    me.$emit('forceUpdateKey')
                }

                // equals
                if(JSON.stringify(me.projectInformation.eventStorming.modelList) == JSON.stringify(beforeInfo.eventStorming.modelList)) return;

                // add
                if(me.projectInformation.eventStorming.modelList.length > beforeInfo.eventStorming.modelList.length) return;

                // modified
                me.$emit('forceUpdateKey')
            },
            getProjectDefinitionLists(){
                if( this.projectInformation && this.projectInformation.eventStorming ) {
                    return this.projectInformation.eventStorming.modelList
                }
                return []
            },
            moveModelUrl(modelId){
                this.$router.push({path: `/storming/${modelId}`});
            },
            editModelData(val) {
                var me = this;
                if (val && val.id) {
                    Object.keys(val).forEach(function (key) {
                        if (!me.value.elements[val.id][key]) {
                            delete val[key];
                        } else {
                            me.value.elements[val.id][key] = val[key];
                        }
                    });
                    // console.log(val)
                    // console.log(me.value.elements[val.id])
                    me.changedByMe = true;
                }
            },
            async synchronizeAssociatedProject(associatedProject, newId, oldId) {
                var me = this;
                if(!associatedProject) return;

                let lists = await me.list(`db://definitions/${associatedProject}/information/eventStorming`);
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
                await me.setString(`db://definitions/${associatedProject}/information/eventStorming/modelList/${index}`, newId);
            },
            overrideElements(elementValues) {
                // Event, Command, Aggregate
                var me = this;

                elementValues
                    .filter((ele) => ele && ele.mirrorElement)
                    .forEach(function (mirrorEle) {
                        // let mirrorId = mirrorEle.mirrorElement;
                        let mirrorAgg = null;
                        let mirrorBc = null;
                        if(!me.validateElementFormat(mirrorEle)) return;
                        // event, command
                        if (!mirrorEle._type.endsWith("Aggregate") && mirrorEle.aggregate.id) {
                            mirrorAgg = me.mirrorValue.elements[mirrorEle.aggregate.id];
                            me.convertNameForElement(mirrorAgg);
                            mirrorEle.aggregate = mirrorAgg; // set aggregate.
                        }

                        // event, command, aggregate
                        if (mirrorEle.boundedContext.id) {
                            mirrorBc = me.mirrorValue.elements[mirrorEle.boundedContext.id];
                            if(mirrorBc){
                                mirrorBc.aggregates = mirrorBc.aggregates.filter(x => x && x.id).map(x => x = me.mirrorValue.elements[x.id]);
                                me.convertNameForElement(mirrorBc);
                                mirrorEle.boundedContext = JSON.parse(JSON.stringify(mirrorBc)); // set boundedContext.
                                if (mirrorAgg) mirrorAgg.boundedContext = JSON.parse(JSON.stringify(mirrorBc)) // connected Agg input bc info.
                            }
                        }
                    });

                return elementValues;
            },
            convertNameForElement(item) {
                item.namePascalCase = changeCase.pascalCase(item.name);
                item.nameCamelCase = changeCase.camelCase(item.name);
                item.namePlural = pluralize(item.nameCamelCase);
            },
            getAttachedBoundedContext(element, boundedLists) {
                var me = this;
                // for panel, element.
                if (!element) return null;
                if (element._type.endsWith("BoundedContext")) return null;

                boundedLists = boundedLists
                    ? boundedLists
                    : me.attachedLists.boundedContextLists;
                if (!(boundedLists && Object.values(boundedLists).length > 0))
                    return null;

                return Object.values(boundedLists).find(
                    (bc) => bc && isAttached(bc, element)
                );
            },
            getAttachedAggregate(element, aggregateList) {
                var me = this;
                // for panel, element.
                if (!element) return null;
                if (element._type.endsWith("Aggregate")) return null;

                aggregateList = aggregateList
                    ? aggregateList
                    : me.attachedLists.aggregateLists;
                if (!(aggregateList && Object.values(aggregateList).length > 0))
                    return null;

                return Object.values(aggregateList).find(
                    (agg) => agg && isAttached(agg, element)
                );
            },
            getAllAttachedAggregate(element, aggregateList) {
                var me = this;
                // for panel, element.
                if (!element) return null;
                if (element._type.endsWith("Aggregate")) return null;

                aggregateList = aggregateList
                    ? aggregateList
                    : me.attachedLists.aggregateLists;
                if (!(aggregateList && Object.values(aggregateList).length > 0))
                    return null;

                return Object.values(aggregateList).filter(
                    (agg) => agg && isAttached(agg, element)
                );
            },
            openSelectionMirrorElement(component, mirrorElements) {
                this.mirrorElementDialog = true;
                this.mirrorElementInfo.component = component;
                this.mirrorElementInfo.mirrorElements = mirrorElements;
            },
            applySelectedMirrorElement() {
                var me = this;

                let selectedItem = null;

                if (!me.filteredAggregateForMirror)
                    me.mirrorElementInfo.selectedAgg = null;

                if (me.mirrorElementInfo.selectedAgg) {
                    selectedItem = me.mirrorElementInfo.mirrorElements
                        .find((mirrorElement) => mirrorElement.boundedContext.id == me.mirrorElementInfo.selectedBC
                            && mirrorElement.aggregate.id == me.mirrorElementInfo.selectedAgg
                        );
                } else {
                    selectedItem = me.mirrorElementInfo.mirrorElements
                        .find((mirrorElement) => mirrorElement.boundedContext.id == me.mirrorElementInfo.selectedBC
                        );
                }

                me.mirrorElementInfo.component.value.mirrorElement = selectedItem ? selectedItem.elementView.id : null;
                me.changedByMe = true;

                // init
                me.mirrorElementInfo.selectedBC = null;
                me.mirrorElementInfo.selectedAgg = null;
                me.mirrorElementDialog = false;
            },
            alertReLogin() {
                alert("You need to re-login because session is expired");
                this.showLoginCard = true;
            },
            onChangedValue(oldVal, newVal){
                var me = this;

                var diff = jsondiffpatch.diff(oldVal, newVal);
                if (me.initLoad && diff) {
                    if (me.isHexagonal) {
                        me.settingHexagonal();
                    }
                    if (me.embeddedCanvasDialog && me.embeddedCanvasType == "Domain Class Modeling") {
                        // return;
                    }
                    me.changeValueAction(diff);
                    me.publishScreenShot();
                }
                if (diff) {
                    me.publishChangedEvent(newVal, diff);
                }
            },
            publishChangedEvent(newVal, delta) {
                this.broadcastChannel.postMessage({
                    event: "ValueChanged",
                    model: newVal,
                    delta: delta,
                });
            },
            clearModelValue() {
                var me = this;
                me.value.elements = {};
                me.value.relations = {};
            },
            changeFieldStatus(val) {
                this.showField = val;
                if (val == false) {
                    this.autoModelingDialogKey++;
                }
            },
            openAutoModeling(title) {
                this.$refs.autoModelingDialog.show({
                    title: "" + this.$refs.generatorUI.input.title + ". " + title,
                });
            },
            setModelDescription(val) {
                console.log(this.value, val);
                this.value.description = val;
            },
            onGenerationFinished() {
                this.forceRefreshCanvas();
                // this.openCodeViewer()
            },
            generateAggregate() {
                this.generatorParameter.userStory =
                    this.$refs.generatorUI.input.userStory;
                this.generatorParameter.model = Object.assign([], this.value);
                this.generatorParameter.uiStyle = this.value.uiStyle;
                //  we need to convert Vue JS object to normal js object for the ESGenerator. see: https://github.com/vuejs/Discussion/issues/292

                // //obj2 = Object.assign([], obj)
                // this.generatorParameter.model = JSON.parse(JSON.stringify(this.value))

                // //why doing this? i don't know but it is required to pass the value properly
                // Object.keys(this.value.elements).forEach(key=>{
                //         let element = this.value.elements[key]
                //         this.generatorParameter.model.elements[key] = element;
                //     })

                this.generatorStep = "aggregate";
            },
            forceRefreshCanvas() {
                this.canvasRenderKey++;
            },
            createModel(val, originModel) {
                var me = this;

                if (val && val.elements) {
                    if (val.projectName) me.projectName = val.projectName;
                    if (val.associatedProject) me.information.associatedProject = val.associatedProject;

                    // Create Model in BoundedContext > Model Merge
                    let elements = JSON.parse(JSON.stringify(me.value.elements));
                    let relations = JSON.parse(JSON.stringify(me.value.relations));

                    me.value.elements = {};
                    me.value.relations = {};

                    if (me.createModelInBoundedContext) {
                        if(originModel && Object.keys(me.value.elements).length === 0 && Object.keys(me.value.relations).length === 0){
                            elements = originModel.elements
                            relations = originModel.relations
                        }

                        Object.keys(elements).forEach(function (ele) {
                            if(elements[ele]!=null && elements[ele].boundedContext){
                                if(elements[ele].boundedContext.id == Object.keys(val.elements)[0]){
                                    delete elements[ele]
                                }
                            }
                        });

                        Object.keys(relations).forEach(function (rel) {
                            if(relations[rel]!=null && relations[rel].boundedContext){
                                if(relations[rel].sourceElement.boundedContext.id == Object.keys(val.elements)[0]){
                                    delete relations[rel]
                                }
                            }
                        });

                        me.value.elements = Object.assign(elements, val.elements);
                        me.value.relations = Object.assign(relations, val.relations);

                        if(originModel){
                            me.value.__ob__.dep.notify();

                            var diffElements = jsondiffpatch.diff(originModel, me.value);
                            me.changeValueAction(diffElements, me.value, {'forcePush': true});
                        }
                        me.createModelInBoundedContext = false;
                    } else {
                        me.value.elements = val.elements;
                        me.value.relations = val.relations;
                        me.value.uiStyle = val.uiStyle;
                    }

                    me.changedByMe = true;

                    // me.addAppendedProperties(me.value.elements, val.elements);
                    // me.addAppendedProperties(me.value.relations, val.relations);

                    //                    console.log(me.value.elements);

                    //                    me.value.__ob__.dep.notify();
                }
            },
            createAggregate(val, agg, originModel) {
                var me = this;

                if (val && val.elements) {
                    let elements = me.value.elements;
                    let relations = me.value.relations;

                    var attachedElements = me.getAttachedElements(me.value.elements, agg);
                    var attachedRealtions = me.getAttachedRelations(me.value.relations, agg);

                    // delete element
                    Object.keys(me.value.elements).forEach(function (modelEle) {
                        Object.keys(attachedElements).forEach(function (ele) {
                            if(me.value.elements[modelEle]!=null && !me.value.elements[modelEle]._type.includes('BoundedContext')){
                                if(me.value.elements[modelEle].boundedContext.id==agg.boundedContext.id){
                                    delete me.value.elements[ele];
                                }
                            }
                        });
                    });

                    // delete relations
                    Object.keys(me.value.relations).forEach(function (modelEle) {
                        Object.keys(attachedRealtions).forEach(function (ele) {
                            if(me.value.relations[modelEle]!=null){
                                delete me.value.relations[ele];
                            }
                        });
                    });

                    me.value.elements = Object.assign({},elements, val.elements);
                    me.value.relations = Object.assign({}, relations, val.relations);

                    if(originModel){
                        var diffElements = jsondiffpatch.diff(originModel, me.value);
                        me.changeValueAction(diffElements, me.value, {'forcePush': true});
                        me.value.__ob__.dep.notify();
                    }
                }
            },
            getAttachedElements(val, agg){
                var me = this;
                var attachedElements = {};

                // find elements of attached aggregate
                Object.keys(val).forEach(function (ele) {
                    if (val[ele] != null) {
                        if (isAttached(agg, val[ele])) {
                            if(!val[ele]._type.includes('BoundedContext') && ele!=agg.id){
                                attachedElements[ele] = val[ele];
                            }
                        }
                    }
                });

                //find actor of attached aggregate
                Object.keys(attachedElements).forEach(function (attachedEle) {
                    Object.keys(val).forEach(function (ele) {
                        if (val[ele] != null) {
                            if(val[ele]._type.includes('Actor')){
                                if(isAttached(attachedElements[attachedEle], val[ele])){
                                    attachedElements[ele] = val[ele]
                                }
                            }
                        }
                    });
                });

                return attachedElements;
            },
            getAttachedRelations(val, agg){
                var me = this;
                var attachedRelations = {};

                // find attached relations
                Object.keys(val).forEach(function (ele) {
                    if (val[ele] != null && val[ele]._type.includes('Relation')) {
                        if(val[ele].targetElement._type.includes('Command') || val[ele].targetElement._type.includes('Event'))
                            if (val[ele].targetElement.aggregate.id == agg.id) {
                                attachedRelations[ele] = val[ele]
                            }
                    }
                });

                return attachedRelations;
            },
            addAppendedProperties(object1, object2) {
                if (typeof object1 !== "object" || typeof object2 !== "object") {
                    throw new Error("Both parameters must be objects.");
                }

                if (Array.isArray(object1) && Array.isArray(object2)) {
                    // Merge arrays
                    for (let i = object1.length; i < object2.length; i++) {
                        object1.push(object2[i]);
                    }
                } else if (
                    typeof object1 === "object" &&
                    typeof object2 === "object"
                ) {
                    for (const key in object2) {
                        if (!object1.hasOwnProperty(key)) {
                            object1[key] = object2[key];
                        } else {
                            if (
                                typeof object1[key] === "object" &&
                                typeof object2[key] === "object" &&
                                !Array.isArray(object1[key]) &&
                                !Array.isArray(object2[key])
                            ) {
                                this.addAppendedProperties(
                                    object1[key],
                                    object2[key]
                                );
                            } else {
                                object1[key] = object2[key];
                            }
                        }
                    }
                } else {
                    throw new Error(
                        "Both parameters must be of the same type (either objects or arrays)."
                    );
                }
            },
            closeAutoModelingDialog() {
                this.openAiMenu = false;
            },
            openJavaParserDialog(mode) {
                this.openAiMenu = true;
                this.openAiMode = mode;
            },
            // openChatGptDialog(){
            //     var me = this
            //     me.openJavaParserDialog("es")
            // },
            // async createEventStormingUseGpt(prompt){
            //     var me = this
            //     me.startTemplateGenerate = true
            //     if((prompt != '' && prompt != null) && me.openaiToken){
            //         let tokenLength = 4092 - Math.round(prompt.length/3.5)
            //         let data = {
            //             model: "text-davinci-003",
            //             prompt: prompt,
            //             temperature: 0.5,
            //             max_tokens: tokenLength ? tokenLength : 3000,
            //         }
            //         let header = {
            //             Authorization: `Bearer ${me.openaiToken}`,
            //             'Content-Type': 'application/json'
            //         }

            //         let respones = await axios.post(`https://api.openai.com/v1/completions`, data, { headers: header })
            //         .catch(function (error) {
            //             me.startTemplateGenerate = false
            //             if(error.response && error.response.data && error.response.data.message){
            //                 var errText = error.response.data.message
            //                 if(error.response.data.errors && error.response.data.errors[0] && error.response.data.errors[0].message){
            //                     errText = errText + ', ' + error.response.data.errors[0].message
            //                 }
            //                 alert(errText)
            //             } else {
            //                 alert(error.message)
            //             }
            //         });
            //         if(respones.data.choices[0].text){
            //             // var CodeGen = Vue.extend(CodeGenerator);
            //             // let codeGenComponent = new CodeGen()
            //             // me.openAiResult = codeGenComponent.codeAlign(respones.data.choices[0].text)
            //             console.log(respones.data.choices[0].text)
            //             me.startTemplateGenerate = false
            //         }

            //     } else {
            //         me.startTemplateGenerate = false
            //         if(!me.openaiToken){
            //             alert("input Token")
            //         }
            //     }
            // },

            lineTolineCheck(existCode, newCode) {
                var me = this;
                var existSplit = existCode.split("\n");
                var newSplit = newCode.split("\n");
                var resultArray = [];
                var result;
                newSplit.forEach(function (newLine, newIdx) {
                    existSplit.some(function (existLine, existIdx) {
                        var checked = false;
                        if (newLine == existLine) {
                            checked = true;
                            return true;
                        }
                        if (existIdx == existSplit.length - 1 && checked == false) {
                            resultArray.push(newLine);
                        }
                    });
                    if (newIdx == newSplit.length - 1) {
                        if (resultArray.length > 0) {
                            var lastIndex = existSplit.lastIndexOf("}");
                            existSplit.splice(lastIndex, 0, ...resultArray);
                            result = existSplit.join("\n");
                        } else {
                            result = existCode;
                        }
                    }
                });
                return result;
            },
            migrateQueue(action, item) {
                if (action == "elementPush") {
                    if (!item.id) item.id = item.elementView.id;
                    if (!item.elementView.id) item.elementView.id = item.id;
                    if (!item.author) item.author = this.userInfo.uid;

                    if (
                        item._type.endsWith("Relation") ||
                        item._type.endsWith("PBC")
                    ) {
                        return item;
                    }

                    if (item.visuality) item.visibility = item.visuality;

                    if (!item.rotateStatus) item.rotateStatus = false;
                    if (!item.description) item.description = null;

                    if (item._type.endsWith("BoundedContext")) {
                        if (!item.preferredPlatform) item.preferredPlatform = null;
                        if (!item.members) item.members = [];
                    }

                    if (
                        (item._type.endsWith("Command") ||
                            item._type.endsWith("Event")) &&
                        !item.visibility
                    ) {
                        item.visibility = "public";
                    }
                } else if (action == "relationPush") {
                    if (!item.id) item.id = item.relationView.id;
                    if (!item.relationView.id) item.relationView.id = item.id;
                }

                return item;
            },
            afterLoad() {
                var me = this;

                if (me.value) {
                    if (!me.value.elements || Object.keys(me.value.elements).length == 0) {
                        me.openAiMode = "es";
                        me.openAiMenu = true;
                    }
                }
            },
            migrateModel(value) {
                var me = this
                if (!value.basePlatform) value.basePlatform = null;
                if (!value.basePlatformConf) value.basePlatformConf = {};
                if (!value.toppingPlatforms)
                    value.toppingPlatforms = [];
                if (!value.toppingPlatformsConf) value.toppingPlatformsConf = {};

                // // K8s Topping은 기본세팅
                // if( !toppingPlatforms.includes('isVanillaK8s') ){
                //     toppingPlatforms.push('isVanillaK8s');
                // }

                if (value.elements) {
                    Object.values(value.elements).forEach(function (element) {
                        if (me.validateElementFormat(element)) {
                            if (!element.id) element.id = element.elementView.id;
                            if (!element.elementView.id)
                                element.elementView.id = element.id;

                            if (!element.rotateStatus) element.rotateStatus = false;
                            if (!element.description) element.description = null;

                            if (
                                (element._type.endsWith("Command") ||
                                    element._type.endsWith("Event")) &&
                                !element.visibility
                            ) {
                                element.visibility = "public";
                            }

                            // minus element
                            // element.elementView.x = element.elementView.x < 0 ? Math.abs(element.elementView.x) : element.elementView.x
                            // element.elementView.y = element.elementView.y < 0 ? Math.abs(element.elementView.y) : element.elementView.y

                            if (element._type.endsWith("BoundedContext")) {
                                if (!element.preferredPlatform)
                                    element.preferredPlatform = null;
                                if (!element.members) element.members = null;

                                if (!element.preferredPlatformConf) {
                                    element.preferredPlatformConf = {};
                                    element.preferredPlatformConf[
                                        element.preferredPlatform
                                        ] = null;
                                }
                            }

                            if (
                                (element._type.endsWith("BoundedContext") ||
                                    element._type.endsWith("Command") ||
                                    element._type.endsWith("Event") ||
                                    element._type.endsWith("Policy") ||
                                    element._type.endsWith("Aggregate")) &&
                                !element.hexagonalView
                            ) {
                                element.hexagonalView = {
                                    _type: `${element._type}Hexagonal`,
                                    id: element.elementView.id,
                                    x: 0,
                                    y: 0,
                                    subWidth: 0,
                                    width: 0,
                                    height: 0,
                                    style: JSON.stringify({}),
                                };
                            }
                        }
                    });
                }

                if (value.relations) {
                    Object.values(value.relations).forEach(function (relation) {
                        if (me.validateRelationFormat(relation)) {
                            if (!relation.id)
                                relation.id = relation.relationView.id;
                            if (!relation.relationView.id)
                                relation.relationView.id = relation.id;

                            // minus relation
                            relation.relationView.value =
                                relation.relationView.value.includes("-")
                                    ? relation.relationView.value.replaceAll(
                                    "-",
                                    ""
                                    )
                                    : relation.relationView.value;

                            if (
                                relation._type.endsWith("Relation") &&
                                !relation.hexagonalView
                            ) {
                                relation.hexagonalView = {
                                    _type: `${relation._type}Hexagonal`,
                                    id: relation.id,
                                    style: JSON.stringify({}),
                                    value: relation.relationView.value,
                                    from: relation.relationView.from,
                                    to: relation.relationView.to,
                                    needReconnect: true,
                                };
                            }
                        }
                    });
                }

                if (!value.k8sValue) {
                    value.k8sValue = { elements: {}, relations: {} };
                }

                return value;
            },
            onMoveElementById(id, newValueStr, child) {
                var me = this;

                if (me.value && me.value.elements && me.value.elements[id]) {
                    let isHexagonal =
                        child.childValue && child.childValue.isHexagonal
                            ? true
                            : false;

                    var newValueObj = JSON.parse(newValueStr);
                    let modifiedView = null;
                    if (isHexagonal) {
                        modifiedView = me.value.elements[id].hexagonalView;
                    } else {
                        modifiedView = me.value.elements[id].elementView;
                    }

                    // var modifiedView = isHexagonal ? me.value.elements[id].hexagonalView : me.value.elements[id].elementView
                    let dx = newValueObj.x - modifiedView.x;
                    let dy = newValueObj.y - modifiedView.y;

                    modifiedView.x = newValueObj.x;
                    modifiedView.y = newValueObj.y;
                    modifiedView.width = newValueObj.width;
                    modifiedView.height = newValueObj.height;
                }
            },
            onMoveRelationById(id, newValueObj, child) {
                var me = this;
                if (me.value && me.value.relations && me.value.relations[id]) {
                    let isHexagonal =
                        child.childValue && child.childValue.isHexagonal
                            ? true
                            : false;

                    var modifiedView = me.value.relations[id].relationView;
                    if (isHexagonal) {
                        modifiedView = me.value.relations[id].hexagonalView;
                    }

                    if (me.value && me.value.relations && me.value.relations[id]) {
                        modifiedView.value = newValueObj;
                    }
                }
            },
            alertError() {
                var me = this;
                me.errorCount = 0;
                me.errorList = [];
                Object.values(me.value.elements).forEach((element) => {
                    var eventComponent = element && me.$refs[`${element.elementView.id}`] ? me.$refs[`${element.elementView.id}`][0] : null;
                    if (eventComponent) {
                        if (eventComponent.elementValidationResults.length > 0) {
                            me.errorCount =
                                me.errorCount +
                                eventComponent.elementValidationResults.length;

                            Object.values(
                                eventComponent.elementValidationResults
                            ).forEach((error) => {
                                error.eleName = element.name;

                                if (error.level == "error") {
                                    error.priority = 1;
                                } else if (error.level == "warning") {
                                    error.priority = 2;
                                } else {
                                    error.priority = 3;
                                }

                                me.errorList.push(error);
                            });
                        }
                    }
                });

                me.errorList.sort(function (a, b) {
                    if (a.priority > b.priority) return 1;
                    if (a.priority < b.priority) return -1;
                });
            },
            showErrSnackBar(err) {
                var me = this;
                me.ideSnackBar.timeout = -1;
                me.ideSnackBar.show = true;
                me.ideSnackBar.Text = err;
                me.ideSnackBar.Color = "error";
                me.ideSnackBar.icon = "error";
                me.ideSnackBar.title = "Error";
            },
            openIdeAccept() {
                var me = this;
                me.openIde = true;
            },
            validationFromCode(code) {
                if (code == null) {
                    return null;
                }

                if (code == undefined) {
                    return null;
                }

                var validationCode = this.validationCodeLists[code];
                if (validationCode) {
                    validationCode.code = code;
                    return validationCode;
                }

                return null;
            },
            async postParentWindow() {
                var me = this;
                me.saveComposition("save");
            },
            closeGitInfo() {
                this.gitInfoDialog = false;
            },
            releaseNewTemplate(item) {
                console.log(item);
            },
            closeIDEViewer() {
                this.$modal.hide("ide-modal");
            },
            openIDEViewer() {
                this.$modal.show("ide-modal");
            },
            settingHexagonal(value) {
                var me = this;
                var values = null;
                if (value) {
                    values = JSON.parse(JSON.stringify(value));
                } else {
                    values = me.value;
                }

                //// functions ////
                function descYPositionSort(arr) {
                    arr.sort(function (beforeElement, afterElement) {
                        return (afterElement.hexagonalView.y - beforeElement.hexagonalView.y);
                    });
                    return arr;
                }

                function ascYPositionSort(arr) {
                    arr.sort(function (beforeElement, afterElement) {
                        return (beforeElement.hexagonalView.y - afterElement.hexagonalView.y);
                    });
                    return arr;
                }

                //////////////

                var modelForElements = {
                    BoundedContext: [],
                    Aggregate: [],
                    Policy: [],
                    Event: [],
                    Command: [],
                    Relation: [],
                };

                if (values) {
                    if (values.elements) {
                        Object.keys(values.elements).forEach(function (id) {
                            var element = values.elements[id];

                            if (element && element.isPBCModel) {
                                var typeSplit = element._type.split(".");
                                var type = typeSplit[typeSplit.length - 1];

                                if ( !values.elements[id].hexagonalView || (values.elements[id].hexagonalView && Object.values(values.elements[id].hexagonalView).filter((x) => x == 0).length >= 4)) {
                                    // 초기값 세팅.
                                    element.hexagonalView = JSON.parse(JSON.stringify(element.elementView));
                                    element.hexagonalView._type = `${element._type}Hexagonal`;
                                    values.elements[id].hexagonalView = element.hexagonalView;

                                    if (!element._type.endsWith("BoundedContext") && !element._type.endsWith("PBC")) {
                                        // 크기를 일정하게 처리.
                                        element.hexagonalView.height = 20;
                                        element.hexagonalView.width = 20;
                                        element.hexagonalView.subWidth = 100;
                                    }
                                } else {
                                    if (!element._type.endsWith("BoundedContext") && !element._type.endsWith("PBC") && !element._type.endsWith("Aggregate")) {
                                        // 크기를 일정하게 처리.
                                        element.hexagonalView.height = 20;
                                        element.hexagonalView.width = 20;
                                        element.hexagonalView.subWidth = 100;
                                    }
                                    // 기존값 세팅.
                                    element.hexagonalView = values.elements[id].hexagonalView;
                                }

                                if (modelForElements[type]) {
                                    modelForElements[type].push(element);
                                } else {
                                    if (element._type.endsWith("PBC")) {
                                        modelForElements.BoundedContext.push(element);
                                    }
                                }
                            }
                        });
                    }

                    if (values.relations) {
                        Object.keys(values.relations).forEach(function (id) {
                            var relation = values.relations[id];
                            if (relation && relation.isPBCModel) {
                                var typeSplit = relation._type.split(".");
                                var type = typeSplit[typeSplit.length - 1];

                                if (!values.relations[id].hexagonalView || (values.relations[id].hexagonalView && !values.relations[id].hexagonalView.value)) {
                                    // 초기값 세팅.
                                    relation.hexagonalView = JSON.parse(JSON.stringify(relation.relationView));
                                    relation.hexagonalView._type = `${relation._type}Hexagonal`;
                                    values.relations[id].hexagonalView = relation.hexagonalView;
                                } else {
                                    // 기존값 세팅.
                                    relation.hexagonalView = values.relations[id].hexagonalView;
                                }

                                if (modelForElements[type]) modelForElements[type].push(relation);
                            }
                        });
                    }

                    // BoundedContext inner setting
                    modelForElements.BoundedContext.forEach((bc) => {
                        var bcElement = {
                            innerElements: {},
                            inputElWidth: 100,
                            outputElWidth: 100,
                        };

                        if (bc._type.endsWith("PBC")) {
                            bc.events.forEach(function (element) {
                                if (element) {
                                    if (element.name.length > 11) {
                                        if (bcElement.outputElWidth < 100 * (element.name.length / 11)) {
                                            bcElement.outputElWidth = Math.floor(100 * (element.name.length / 11));
                                        }
                                    }
                                    if (!bcElement.innerElements.outputAdapters) {
                                        bcElement.innerElements.outputAdapters = [];
                                    }
                                    element.hexagonalView.subWidth = 100;
                                    bcElement.innerElements.outputAdapters.push(element);
                                }
                            });

                            bc.commands.forEach(function (element) {
                                if (element) {
                                    if (element.name.length > 11) {
                                        if (bcElement.inputElWidth < 100 * (element.name.length / 11)) {
                                            bcElement.inputElWidth = Math.floor(100 * (element.name.length / 11));
                                        }
                                    }
                                    if (!bcElement.innerElements.inputAdapters) {
                                        bcElement.innerElements.inputAdapters = [];
                                    }
                                    element.hexagonalView.subWidth = 100;
                                    bcElement.innerElements.inputAdapters.push(element);
                                }
                            });

                            bc.policies.forEach(function (element) {
                                if (element) {
                                    if (element.name.length > 11) {
                                        if (bcElement.inputElWidth < 100 * (element.name.length / 11)) {
                                            bcElement.inputElWidth = Math.floor(100 * (element.name.length / 11));
                                        }
                                    }
                                    if (!bcElement.innerElements.inputAdapters) {
                                        bcElement.innerElements.inputAdapters = [];
                                    }
                                    element.hexagonalView.subWidth = 100;
                                    bcElement.innerElements.inputAdapters.push(element);
                                }
                            });
                        } else {
                            Object.values(values.elements).forEach(
                                (element, index) => {
                                    if (element &&
                                        element.hexagonalView &&
                                        !element._type.endsWith("BoundedContext") &&
                                        !element._type.endsWith("PBC") &&
                                        element.boundedContext &&
                                        element.boundedContext.id &&
                                        bc.elementView.id == element.boundedContext.id
                                    ) {
                                        if(isAttached(bc, element)) {
                                            // var bcElement = JSON.parse(JSON.stringify(values.elements[bc.elementView.id]))
                                            var typeSplit = element._type.split(".");
                                            var type = typeSplit[typeSplit.length - 1];
                                            if (bcElement) {
                                                if (!bcElement.innerElements)
                                                    bcElement.innerElements = {};
                                                if (type == "Command" || type == "Policy") {
                                                    //input
                                                    if (element.name.length > 11) {
                                                        if (bcElement.inputElWidth < 100 * (element.name.length / 11)) {
                                                            bcElement.inputElWidth = Math.floor(100 * (element.name.length / 11));
                                                        }
                                                    }
                                                    if (!bcElement.innerElements.inputAdapters)
                                                        bcElement.innerElements.inputAdapters = [];
                                                    element.hexagonalView.subWidth = 100;
                                                    bcElement.innerElements.inputAdapters.push(element);
                                                } else if (type == "Event") {
                                                    //output
                                                    if (element.name.length > 11) {
                                                        if (bcElement.outputElWidth <100 *(element.name.length /11)) {
                                                            bcElement.outputElWidth = Math.floor(100 *(element.name.length /11));
                                                        }
                                                    }
                                                    if (!bcElement.innerElements.outputAdapters)
                                                        bcElement.innerElements.outputAdapters = [];
                                                    element.hexagonalView.subWidth = 100;
                                                    bcElement.innerElements.outputAdapters.push(element);
                                                } else {
                                                    if (type == "Aggregate") {
                                                        element.hexagonalView.x = bc.hexagonalView.x;
                                                        element.hexagonalView.y = bc.hexagonalView.y;
                                                        element.hexagonalView.width = bc.hexagonalView.width / 3;
                                                        element.hexagonalView.height = 50;
                                                    }
                                                    // etc
                                                    if (!bcElement.innerElements[type]) {
                                                        bcElement.innerElements[type] = [];
                                                    }
                                                    bcElement.innerElements[type].push(element);
                                                }
                                            }
                                        }
                                    }
                                }
                            );
                        }

                        bc["innerElements"] = bcElement.innerElements;
                        bc["inputElWidth"] = bcElement.inputElWidth;
                        bc["outputElWidth"] = bcElement.outputElWidth;
                    });

                    //setting BoundedContext
                    modelForElements.BoundedContext.forEach((bc) => {
                        var distance = {};
                        var standard = 30;

                        if (bc) {
                            if (bc.hexagonalView.width < bc.hexagonalView.height) {
                                bc.hexagonalView.height = JSON.parse(JSON.stringify(bc.hexagonalView.width));
                            } else {
                                bc.hexagonalView.width = JSON.parse(JSON.stringify(bc.hexagonalView.height));
                            }
                        }

                        if (bc && bc.innerElements) {
                            //BoundedContext
                            var bcX = JSON.parse(JSON.stringify(bc.hexagonalView.x));
                            var bcY = JSON.parse(JSON.stringify(bc.hexagonalView.y));
                            var bcW = JSON.parse(JSON.stringify(bc.hexagonalView.width));
                            var bcH = JSON.parse(JSON.stringify(bc.hexagonalView.height));

                            //InputAdapters
                            if (bc.innerElements && bc.innerElements.inputAdapters) {
                                bc.innerElements.inputAdapters = descYPositionSort(bc.innerElements.inputAdapters);
                                var inputLen = bc.innerElements.inputAdapters.length;
                                var xDistance = bcW / 2 / inputLen;
                                var yDistance = bcH / 2 / inputLen;

                                bc.innerElements.inputAdapters.forEach(
                                    (inputAdapter, index) => {
                                        var itemH = inputAdapter.hexagonalView.height;
                                        var itemW = inputAdapter.hexagonalView.width;

                                        if (standard < bcH / 2 / inputLen || standard * index < bcH / 2.2) {
                                            // top
                                            if (yDistance < standard) {
                                                yDistance = standard;
                                            } else if (yDistance > 65) {
                                                xDistance = 60;
                                                yDistance = 60;
                                            }

                                            inputAdapter.hexagonalView.y = bcY - itemH / 2 - yDistance * index;
                                        } else {
                                            // bottom
                                            inputAdapter.hexagonalView.y = bcY - itemH / 2 + yDistance * (inputLen - index) + 10;
                                            inputAdapter.hexagonalView.subWidth = bc.inputElWidth + xDistance * (inputLen - index) + xDistance * 0.4 * (inputLen - index);
                                        }
                                        inputAdapter.hexagonalView.x = bcX - bcW / 2 - bc.inputElWidth;
                                        inputAdapter.hexagonalView.subWidth = bc.inputElWidth + xDistance * 0.5 * index;

                                        distance.minX = inputAdapter.hexagonalView.x;
                                        me.value.elements[inputAdapter.elementView.id].hexagonalView = inputAdapter.hexagonalView;
                                    }
                                );
                            }

                            //OutputAdapters
                            if (
                                bc.innerElements &&
                                bc.innerElements.outputAdapters
                            ) {
                                var outputLen =
                                    bc.innerElements.outputAdapters.length;
                                var xDistance =
                                    bcW /
                                    2 /
                                    bc.innerElements.outputAdapters.length;
                                var yDistance =
                                    bcH /
                                    2 /
                                    bc.innerElements.outputAdapters.length;

                                bc.innerElements.outputAdapters = ascYPositionSort(
                                    bc.innerElements.outputAdapters
                                );
                                bc.innerElements.outputAdapters.forEach(
                                    (outputAdapter, index) => {
                                        var itemH =
                                            outputAdapter.hexagonalView.height;
                                        var itemW =
                                            outputAdapter.hexagonalView.width;

                                        if (
                                            standard < bcH / 2 / outputLen ||
                                            standard * index < bcH / 2.2
                                        ) {
                                            // bottom
                                            if (yDistance < standard) {
                                                yDistance = standard;
                                            } else if (yDistance > 65) {
                                                xDistance = 60;
                                                yDistance = 60;
                                            }

                                            outputAdapter.hexagonalView.y =
                                                bcY + itemH / 2 + yDistance * index;
                                        } else {
                                            // top
                                            outputAdapter.hexagonalView.y =
                                                bcY +
                                                itemH / 2 -
                                                yDistance * (outputLen - index) -
                                                5;
                                            outputAdapter.hexagonalView.subWidth =
                                                bc.outputElWidth +
                                                xDistance * (outputLen - index) +
                                                xDistance *
                                                0.4 *
                                                (outputLen - index);
                                        }
                                        outputAdapter.hexagonalView.x =
                                            bcX + bcW / 2 + bc.outputElWidth;
                                        outputAdapter.hexagonalView.subWidth =
                                            bc.outputElWidth +
                                            xDistance * 0.5 * index;

                                        distance.maxX =
                                            outputAdapter.hexagonalView.x;
                                        me.value.elements[
                                            outputAdapter.elementView.id
                                            ].hexagonalView =
                                            outputAdapter.hexagonalView;
                                    }
                                );
                            }

                            // Aggregates
                            if (bc.innerElements && bc.innerElements.Aggregate) {
                                var aggLen = bc.innerElements.Aggregate.length;
                                if (aggLen > 1) {
                                    var bcSubH = Math.floor(bcH * 0.6);
                                    var yDistance = bcSubH / 2 / aggLen;
                                    bc.innerElements.Aggregate.forEach(
                                        (agg, index) => {
                                            agg.hexagonalView.height =
                                                (bcSubH - yDistance * 2) / aggLen;
                                            var itemH = agg.hexagonalView.height;
                                            agg.hexagonalView.y =
                                                bcY -
                                                bcSubH / 2 +
                                                (itemH / 2) * (index + 1) +
                                                yDistance * (index + 1);

                                            me.value.elements[agg.elementView.id] =
                                                agg;
                                        }
                                    );
                                }
                            }

                            if (!distance.minX) {
                                distance.minX = bcX - bcW / 2;
                            }
                            if (!distance.maxX) {
                                distance.maxX = bcX + bcW / 2;
                            }
                        }

                        if (distance.maxX - distance.minX > bc.elementView.width) {
                            var width =
                                bc.hexagonalView.width -
                                (distance.maxX -
                                    distance.minX -
                                    bc.elementView.width);
                            bc.hexagonalView.width = width;
                            bc.hexagonalView.height = width;
                        }
                    });
                    //end BoundedContext

                    // setting Relation
                    modelForElements.Relation.forEach((relation) => {
                        if (relation && relation.hexagonalView.value) {
                            // 직선 연결.
                            // var vertices = JSON.parse(relation.hexagonalView.value)
                            // var start = vertices[0]
                            // var end = vertices[vertices.length - 1]
                            // var newVertices = JSON.stringify([start, end])
                            //기존 연결
                            var newVertices = relation.hexagonalView.value;
                            relation.hexagonalView.value = newVertices;
                            relation.hexagonalView.style = {};
                        }
                    });
                    // end Relation
                }
                return values;
            },
            // closeCodeModal() {
            //     // this.openCode = [];
            //     this.changedModifying = false;
            // },
            // cancelModify() {
            //     var me = this
            //     this.cancelModifying = false
            //     me.$EventBus.$emit("openProgressing");
            //     me.closeCodeViewer()
            // },
            // endModify() {
            //     var me = this
            //     this.changedModifying = false
            //     me.$EventBus.$emit("openProgressing");
            //     me.closeCodeViewer()
            // },
            async checkedPaidItem() {
                var me = this;
                me.isDownloading = true;

                if (window.MODE == "onprem") {
                    return await me.downloadArchive();
                    // return await me.generateZip()
                } else {
                    if (me.isLogin) {
                        var convertEmail = me.userInfo.email.replace(/\./gi, "_");
                        var getItemId = null;
                        var isPaid = false;
                        // var isPaid = true // free

                        if (me.isClazzModeling) {
                            var classInfo = await this.getClassInfo();
                            var labInfo = await this.getLabInfo();
                            getItemId = `${me.canvasType}_${classInfo.courseId}@${classInfo.classId}@${labInfo.labId}`;
                            me.purchaseItemDialogInfo.className =
                                classInfo.className;
                            me.purchaseItemDialogInfo.labName = labInfo.labName;
                            if (
                                classInfo &&
                                !classInfo.openClass &&
                                classInfo.connectionKey
                            ) {
                                isPaid = true;
                            }
                        } else {
                            getItemId = `${me.canvasType}_${me.projectId}`;
                        }

                        if (!isPaid) {
                            var checkSubscription = await me.getObject(
                                `db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/subscription`
                            );
                            if (checkSubscription) {
                                var checkExpired = checkSubscription.expiredDate
                                    ? checkSubscription.expiredDate
                                    : 0;
                                if (typeof checkExpired == "string")
                                    checkExpired = Number(checkExpired);
                                if (
                                    checkExpired == 0 ||
                                    Date.now() < checkExpired
                                ) {
                                    if (checkSubscription.downloadCode != 0) {
                                        isPaid = true;
                                    }
                                }
                            } else {
                                var checkItem = await me.getObject(
                                    `db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/${getItemId}`
                                );
                                if (checkItem) {
                                    var checkExpired = checkItem.expiredDate
                                        ? checkItem.expiredDate
                                        : 0;
                                    if (typeof checkExpired == "string")
                                        checkExpired = Number(checkExpired);
                                    if (
                                        checkExpired == 0 ||
                                        Date.now() < checkExpired
                                    ) {
                                        isPaid = true;
                                    }
                                }
                            }
                        }

                        if (isPaid || me.isForeign) {
                            await me.downloadArchive();
                            // await me.generateZip()
                        } else {
                            me.purchaseItemDialogOpen(getItemId);
                        }
                    } else {
                        me.$EventBus.$emit("showLoginDialog", true);
                    }
                }
            },

            connectableType(source, target) {
                var me = this;
                if (source.isPBCModel) {
                    if (target.isPBCModel) {
                        return false;
                    }

                    if (
                        source._type.endsWith("Event") &&
                        target._type.endsWith("Policy")
                    )
                        return true;
                } else {
                    if (
                        source._type.endsWith("Event") &&
                        (target._type.endsWith("Policy") ||
                            target._type.endsWith("Command") ||
                            target._type.endsWith("External"))
                    ) {
                        return true;
                    } else if (
                        source._type.endsWith("Policy") &&
                        target._type.endsWith("Event")
                    ) {
                        return true;
                    } else if (
                        source._type.endsWith("View") &&
                        target._type.endsWith("Aggregate")
                    ) {
                        return true;
                    } else if (
                        source._type.endsWith("External") &&
                        (target._type.endsWith("Policy") ||
                            target._type.endsWith("Command"))
                    ) {
                        return true;
                    } else if (
                        source._type.endsWith("Aggregate") &&
                        target._type.endsWith("External")
                    ) {
                        return true;
                    } else if (
                        source._type.endsWith("Command") &&
                        (target._type.endsWith("View") ||
                            target._type.endsWith("Aggregate"))
                    ) {
                        return true;
                    } else if (
                        source._type.endsWith("Command") &&
                        target._type.endsWith("Event")
                    ) {
                        if (source.mirrorElement || target.mirrorElement)
                            return true;
                        if (!source.boundedContext && !target.boundedContext) {
                            // same
                            return true;
                        } else if (
                            source.boundedContext.id == target.boundedContext.id
                        ) {
                            var sourceAgg = me.getAttachedAggregate(source);
                            var targetAgg = me.getAttachedAggregate(target);
                            if (sourceAgg && targetAgg) {
                                if (
                                    sourceAgg.elementView.id ==
                                    targetAgg.elementView.id
                                ) {
                                    return true;
                                }
                            }
                        } else {
                            me.alertInfo.show = true;
                            me.alertInfo.text =
                                "동일 BoundedContext만 연결 가능 합니다.";
                        }
                    } else if (
                        source._type.endsWith("Command") &&
                        (target._type.endsWith("View") ||
                            target._type.endsWith("Aggregate"))
                    ) {
                        if (source.boundedContext.id == target.boundedContext.id) {
                            me.alertInfo.show = true;
                            me.alertInfo.text =
                                "같은 BoundedContext로 연결 불가능 합니다.";
                        } else {
                            if (
                                source.restRepositoryInfo.method == "POST" ||
                                source.restRepositoryInfo.method == "DELETE" ||
                                source.restRepositoryInfo.method == "PATCH"
                            ) {
                                if (
                                    !source.trigger ||
                                    source.trigger == undefined
                                ) {
                                    if (
                                        source.restRepositoryInfo.method == "POST"
                                    ) {
                                        source.trigger = "@PrePersist";
                                    } else if (
                                        source.restRepositoryInfo.method == "DELETE"
                                    ) {
                                        source.trigger = "@PreRemove";
                                    } else if (
                                        source.restRepositoryInfo.method == "PATCH"
                                    ) {
                                        source.trigger = "@PreUpdate";
                                    }
                                }
                                var targetCamelCase = _.camelCase(target.name);
                                source.connectedName = {
                                    name: target.name,
                                    namePascalCase:
                                        targetCamelCase
                                            .substring(0, 1)
                                            .toUpperCase() +
                                        targetCamelCase.substring(1),
                                    namePlural: pluralize(targetCamelCase),
                                };
                                return true;
                            } else {
                                me.alertInfo.show = true;
                                me.alertInfo.text =
                                    "지원하지 않는 Methods 타입 입니다.";
                            }
                        }
                    } else if (
                        source._type.endsWith("Policy") &&
                        (target._type.endsWith("View") ||
                            target._type.endsWith("Aggregate"))
                    ) {
                        if (source.boundedContext.id == target.boundedContext.id) {
                            me.alertInfo.show = true;
                            me.alertInfo.text =
                                "같은 BoundedContext로 연결 불가능 합니다.";
                        } else {
                            return true;
                            if (
                                source.restRepositoryInfo.method == "POST" ||
                                source.restRepositoryInfo.method == "DELETE" ||
                                source.restRepositoryInfo.method == "PATCH"
                            ) {
                                if (
                                    !source.trigger ||
                                    source.trigger == undefined
                                ) {
                                    if (
                                        source.restRepositoryInfo.method == "POST"
                                    ) {
                                        source.trigger = "@PrePersist";
                                    } else if (
                                        source.restRepositoryInfo.method == "DELETE"
                                    ) {
                                        source.trigger = "@PreRemove";
                                    } else if (
                                        source.restRepositoryInfo.method == "PATCH"
                                    ) {
                                        source.trigger = "@PreUpdate";
                                    }
                                }
                                var targetCamelCase = _.camelCase(target.name);
                                source.connectedName = {
                                    name: target.name,
                                    namePascalCase:
                                        targetCamelCase
                                            .substring(0, 1)
                                            .toUpperCase() +
                                        targetCamelCase.substring(1),
                                    namePlural: pluralize(targetCamelCase),
                                };
                            } else {
                                me.alertInfo.show = true;
                                me.alertInfo.text =
                                    "지원하지 않는 Methods 타입 입니다.";
                            }
                        }
                    } else if (
                        source._type.endsWith("Aggregate") &&
                        target._type.endsWith("Aggregate")
                    ) {
                        if(!source.mirrorElement) return true;
                    } else if (
                        source._type.endsWith("Policy") &&
                        target._type.endsWith("Command")
                    ) {
                        return true;
                    } else if (
                        source._type.endsWith("UI") &&
                        target._type.endsWith("View")
                    ) {
                        return true;
                    }
                }
                return false;
            },
            addElement: function (componentInfo, bounded) {
                // console.log("추가");
                this.enableHistoryAdd = true;
                var me = this;
                var additionalData = {};
                var vueComponent = me.getComponentByName(componentInfo.component);
                var element;

                if (
                    componentInfo.isRelation &&
                    componentInfo.component.includes("relation")
                ) {
                    /* make Relation */
                    element = vueComponent.computed.createNew(
                        this,
                        this.uuid(),
                        componentInfo.sourceElement.value,
                        componentInfo.targetElement.value,
                        componentInfo.vertices
                    );

                    me.addElementAction(element);
                } else if (componentInfo.component.includes("line")) {
                    var vertices = [
                        [componentInfo.x, componentInfo.y],
                        [componentInfo.x + 200, componentInfo.y],
                    ];
                    vertices = JSON.stringify(vertices);

                    element = vueComponent.computed.createNew(
                        this,
                        this.uuid(),
                        vertices
                    );

                    me.addElementAction(element);
                } else {
                    /* make Element */
                    if (me.isHexagonal) {
                        element = vueComponent.computed.createNew(
                            this,
                            this.uuid(),
                            componentInfo.x,
                            componentInfo.y,
                            componentInfo.width,
                            componentInfo.height,
                            componentInfo.description,
                            componentInfo.label,
                            componentInfo.hexagonalX,
                            componentInfo.hexagonalY
                        );
                    } else {
                        element = vueComponent.computed.createNew(
                            this,
                            this.uuid(),
                            componentInfo.x,
                            componentInfo.y,
                            componentInfo.width,
                            componentInfo.height,
                            componentInfo.description,
                            componentInfo.label
                        );
                    }

                    if (element._type.endsWith("PBC")) {
                        me.openModelingListsDialog(element);
                    } else {
                        me.addElementAction(element);
                    }
                }

                return element;
            },
            addElementAction(element, value, options){
                var me = this
                if(!options) options = {}
                if(!value) value = me.value
                let valueObj = element.relationView ? value.relations : value.elements
                let id = element.relationView ? element.relationView.id : element.elementView.id

                // duplication
                if(Object.keys(valueObj).includes(id)) return;

                me.$EventBus.$emit(id, {
                    action: element.relationView ? 'relationPush' : 'elementPush',
                    STATUS_COMPLETE: false
                })

                element = me.migrateQueue(element.relationView ? 'relationPush' : 'elementPush', element);

                // First append
                me.appendElement(element, value, options)
                if(me.isServerModel && me.isQueueModel){
                    // server
                    me.modelChanged = true;

                    if(me.isHexagonal) element.isHexagonal = true
                    me.pushAppendedQueue(element, options)

                    if (me.projectSendable && !me.isHexagonal) {
                        element.definitionId = me.projectId
                        options.definitionId = me.information.associatedProject
                        me.pushAppendedQueue(element, options)
                    }
                }
            },
            removeElementAction(element, value, options){
                var me = this
                if(!options) options = {}
                let id = element.relationView ? element.relationView.id : element.elementView.id

                me.$EventBus.$emit(id, {
                    action: element.relationView ? 'relationDelete' : 'elementDelete',
                    STATUS_COMPLETE: false
                })

                if(me.isServerModel && me.isQueueModel){
                    if(me.isHexagonal) element.isHexagonal = true
                    me.pushRemovedQueue(element, options)

                    if( me.projectSendable && !me.isHexagonal ) {
                        options.definitionId = me.information.associatedProject
                        me.pushRemovedQueue(element, options)
                    }
                } else {
                    me.removeElement(element, value, options)
                }
            },
            moveElementAction(element, oldVal, newVal, value, options){
                var me = this
                if(!options) options = {}
                let id = element.relationView ? element.relationView.id : element.elementView.id

                me.$EventBus.$emit(id, {
                    action: element.relationView ? 'relationMove' : 'elementMove',
                    STATUS_COMPLETE: false,
                    movingElement: true
                })
                if(me.isHexagonal) options.isHexagonal = true

                // First Move
                me.moveElement(element, newVal, me.value, options)

                if (me.isServerModel && me.isQueueModel) {
                    me.pushMovedQueue(element, oldVal, newVal, options)
                }
            },
            moveElement(element, newVal, value, options){
                var me = this
                let isHexagonal = options.isHexagonal ? true : false
                if(!element) return;

                if(!value) value = me.value
                let id = element.relationView ? element.relationView.id : element.elementView.id
                let valueObj = element.relationView ? value.relations : value.elements
                if(!valueObj[id]) return;

                if(element.relationView){
                    // Relation
                    if(isHexagonal){
                        valueObj[id].hexagonalView.value = newVal.replaceAll('-','')
                    } else {
                        valueObj[id].relationView.value =  newVal.replaceAll('-','')
                    }
                } else {
                    // null || minus
                    if(!newVal.x || newVal.x < 0) newVal.x = 100
                    if(!newVal.y || newVal.y < 0) newVal.y = 100

                    // Element
                    if(isHexagonal){
                        valueObj[id].hexagonalView.x = newVal.x
                        valueObj[id].hexagonalView.y = newVal.y
                        valueObj[id].hexagonalView.width = newVal.width;
                        valueObj[id].hexagonalView.height = newVal.height
                    } else {
                        valueObj[id].elementView.x = newVal.x
                        valueObj[id].elementView.y = newVal.y
                        valueObj[id].elementView.width = newVal.width
                        valueObj[id].elementView.height = newVal.height
                    }
                }

                me.$EventBus.$emit(id, {
                    action: element.relationView ? 'relationMove' : 'elementMove',
                    STATUS_COMPLETE: true,
                    movingElement: false
                })
            },
            pushMovedQueue(element, oldVal, newVal, options){
                var me = this
                if(!options) options = {}
                let definitionId = me.projectId
                if(options.definitionId) definitionId = options.definitionId

                let obj = {
                    action: element.relationView ? 'relationMove' : 'elementMove',
                    editUid: me.userInfo.uid,
                    before: element.relationView ? oldVal : JSON.stringify(oldVal),
                    after: element.relationView ? newVal : JSON.stringify(newVal),
                    timeStamp: Date.now()
                }

                if(element.relationView) {
                    obj.relationId = element.relationView.id
                } else {
                    var types = element._type.split('.')
                    obj.elementType = types[types.length - 1]
                    obj.elementId = element.elementView.id
                    obj.elementName = element.name
                }

                if( options.isHexagonal ){
                    obj.isHexagonal = true
                }

                return me.pushObject(`db://definitions/${definitionId}/queue`, obj)
            },
            receiveAppendedQueue(element, queue, options){
                var me = this
                if(!options) options = {}
                if(queue.isMirrorQueue){
                    me.appendElement(element, me.mirrorValue, options)
                } else {
                    me.appendElement(element, me.value, options)
                }
            },
            receiveRemovedQueue(element, queue, options){
                var me = this
                if(!options) options = {}
                if(queue.isMirrorQueue){
                    me.removeElement(element, me.mirrorValue, options)
                } else {
                    me.removeElement(element, me.value, options)
                }
            },
            receiveMovedQueue(id, newVal, queue, options){
                var me = this
                if(!options) options = {}
                let value = queue.isMirrorQueue ? me.mirrorValue : me.value;
                let element = queue.childValue.action == 'relationMove' ? value.relations[id] : value.elements[id]
                let newValue = queue.childValue.action == 'relationMove' ? newVal : JSON.parse(newVal)
                if(!element) return;
                if(queue.childValue.isHexagonal){
                    options.isHexagonal = true
                }

                me.moveElement(element, newValue, value, options);
            },
            async receiveChangedValueQueue(diff, queue, options){
                var me = this;
                if(!options) options = {}
                let value = queue.isMirrorQueue ? me.mirrorValue : me.value;

                try {
                    me.patchValue(diff, value)
                } catch (e) {
                    console.log("Error when to diffpatch for queue " + queue.childKey, e, "\n- queue is", (queue.childValue.item ? JSON.parse(queue.childValue.item) : queue.childValue), "\n- model is", value.elements, value.relations)

                    // create default.
                    value = await me.checkedDiffValue(diff, value);
                    me.patchValue(diff, value)
                }
            },
            checkedDiffValue(diff, value) {
                var me = this;
                if (diff !== null) {
                    var keys = Object.keys(diff);
                    keys.forEach(key => {
                        if(value[key] === null || value[key] === undefined) {
                            if(typeof diff[key] == 'object') {
                                value[key] = Array.isArray(diff[key]) ? [] : {};
                            } else {
                                value[key] = null;
                            }
                        } else {
                            if(typeof value[key] == 'object') {
                                value[key] = me.checkedDiffValue(diff[key], value[key]);
                            }
                        }
                    });
                }
                return value;
            },
            openModelingListsDialog(element) {
                this.modelingPBCElement = element;
                this.modelingListsDialog = true;
            },
            applyModelingListsDialog(model) {
                var me = this;
                me.modelingPBCElement = me.generatePBC(
                    me.modelingPBCElement,
                    model
                );
                me.addElementAction(me.modelingPBCElement);
                me.closeModelingListsDialog();
            },
            closeModelingListsDialog() {
                this.modelingPBCElement = null;
                this.modelingListsDialog = false;
            },
            generatePBC(pbcElement, modelObj) {
                var me = this;

                if (modelObj) {
                    var values = { elements: {}, relations: {} };
                    var projectId = modelObj.projectId;
                    var projectName = modelObj.projectName;
                    var projectValue = modelObj.projectValue;
                    var projectVersion = modelObj.projectVersion;
                    var modelValueObj = {
                        projectId: projectId,
                        projectName: projectName,
                        projectVersion: projectVersion,
                    };
                    pbcElement.name = projectName;
                    pbcElement.modelValue = modelValueObj;
                    // init
                    pbcElement.boundedContextes = [];
                    pbcElement.aggregates = [];
                    pbcElement.events = [];
                    pbcElement.commands = [];
                    pbcElement.policies = [];
                    pbcElement.relations = [];
                    pbcElement.views = [];

                    // setting Elements
                    if (projectValue.definition || projectValue.elements) {
                        if (projectValue.definition) {
                            projectValue.definition.forEach(function (element) {
                                values.elements[element.elementView.id] = element;
                            });
                        } else {
                            values.elements = projectValue.elements;
                        }

                        Object.values(values.elements).forEach(function (element) {
                            if (element) {
                                var copyEl = JSON.parse(JSON.stringify(element));
                                copyEl.pbcId = pbcElement.elementView.id;
                                copyEl.isPBCModel = true;

                                if (element._type.endsWith("Event")) {
                                    copyEl.isView = true;
                                    pbcElement.events.push(copyEl);
                                } else if (element._type.endsWith("Command")) {
                                    copyEl.isView = true;
                                    pbcElement.commands.push(copyEl);
                                } else if (element._type.endsWith("Policy")) {
                                    copyEl.isView = true;
                                    pbcElement.policies.push(copyEl);
                                } else if (
                                    element._type.endsWith("BoundedContext")
                                ) {
                                    pbcElement.boundedContextes.push(copyEl);
                                } else if (element._type.endsWith("Aggregate")) {
                                    pbcElement.aggregates.push(copyEl);
                                } else if (element._type.endsWith("View")) {
                                    pbcElement.views.push(copyEl);
                                }
                            }
                        });
                    }

                    // setting Relation
                    if (projectValue.relation || projectValue.relations) {
                        if (projectValue.relation) {
                            projectValue.relation.forEach(function (element) {
                                values.relations[element.elementView.id] = element;
                            });
                        } else {
                            values.relations = projectValue.relations;
                        }

                        Object.values(values.relations).forEach(function (
                            relation
                        ) {
                            if (relation) {
                                var copyRe = JSON.parse(JSON.stringify(relation));
                                copyRe.isPBCModel = true;

                                if (
                                    copyRe.sourceElement &&
                                    copyRe.targetElement &&
                                    copyRe.sourceElement.boundedContext.id ==
                                    copyRe.targetElement.boundedContext.id &&
                                    copyRe.targetElement._type.includes("Event")
                                ) {
                                    copyRe.pbcId = pbcElement.elementView.id;
                                    pbcElement.relations.push(copyRe);
                                }
                            }
                        });
                    }

                    // PBC
                    Object.values(values.elements)
                        .filter((x) => x && x._type.endsWith("PBC"))
                        .forEach(function (pbc) {
                            if (pbc) {
                                pbcElement.events = pbcElement.events.concat(
                                    pbc.events
                                );
                                pbcElement.commands = pbcElement.commands.concat(
                                    pbc.commands
                                );
                                pbcElement.boundedContextes =
                                    pbcElement.boundedContextes.concat(
                                        pbc.boundedContextes
                                    );
                                pbcElement.aggregates =
                                    pbcElement.aggregates.concat(pbc.aggregates);
                                pbcElement.relations = pbcElement.relations.concat(
                                    pbc.relations
                                );
                            }
                        });
                }
                return pbcElement;
            },
            // getCode(path, code) {
            //     var me = this
            //     return new Promise(async function (resolve, reject) {
            //         if (!me.myId || me.myId == null) {
            //             me.myId = localStorage.getItem('email')
            //         }
            //         var getCodeUrl = await me.getURL(`cluster://running/${me.myId.split('@')[1].split('.')[0].toLowerCase()}/classes/users/labs/${me.myId}/${me.$route.params.projectId}/` + path, 'eventstorming')
            //         me.$http.defaults.headers = {
            //             'Cache-Control': 'no-cache',
            //             'Pragma': 'no-cache',
            //             'Expires': '0',
            //         };
            //         me.$http.get(getCodeUrl).then(function (data) {
            //             resolve(data.data)
            //         }).catch((e) => {
            //             if (e.response)
            //                 if (e.response.status == 404) {
            //                     // 404 Error -> 파일이 없을 시에 파일을 Upload 처리함
            //                     if (me.ideWindow) {
            //                         var projectId
            //                         if (me.information && me.information.projectId) {
            //                             projectId = me.information.projectId
            //                         } else {
            //                             projectId = me.params.projectId
            //                         }
            //                         me.ideWindow.postMessage({
            //                             "message": "code",
            //                             "type": "create",
            //                             "path": projectId + "/" + path,
            //                             "content": code
            //                         });
            //                     }
            //                 }
            //             resolve(null);
            //         })
            //         // var result = await me.getString(`cluster://${me.myId.split('@')[1].split('.')[0].toLowerCase()}/classes/running/users/labs/${me.myId}/${me.$route.params.projectId}/` + path, 'eventstorming');
            //         // resolve(getCodeUrl)
            //     })
            // },
            changeUrl(state, title, url) {
                if (typeof history.pushState != "undefined") {
                    //브라우저가 지원하는 경우
                    history.pushState(state, title, url);
                } else {
                    location.href = url; //브라우저가 지원하지 않는 경우 페이지 이동처리
                }
            },
            tokenSave() {
                var me = this;
                localStorage.setItem("kubernetesToken", me.kubernetesToken);
                localStorage.setItem("clusterAddress", me.clusterAddress);
                me.tokenDialog = false;
            },
            logEvent(event) {
                console.log("Event : ", event);
            },
            onError(error, stream) {
                console.log("On Error Event", error, stream);
            },
            applyChange(target, source, change) {
                if (
                    typeof change === "undefined" &&
                    source &&
                    ~validKinds.indexOf(source.kind)
                ) {
                    change = source;
                }
                if (target && change && change.kind) {
                    var it = target,
                        i = -1,
                        last = change.path ? change.path.length - 1 : 0;
                    while (++i < last) {
                        if (typeof it[change.path[i]] === "undefined") {
                            it[change.path[i]] =
                                typeof change.path[i + 1] !== "undefined" &&
                                typeof change.path[i + 1] === "number"
                                    ? []
                                    : {};
                        }
                        it = it[change.path[i]];
                    }
                    switch (change.kind) {
                        case "A":
                            if (
                                change.path &&
                                typeof it[change.path[i]] === "undefined"
                            ) {
                                it[change.path[i]] = [];
                            }
                            applyArrayChange(
                                change.path ? it[change.path[i]] : it,
                                change.index,
                                change.item
                            );
                            break;
                        case "D":
                            delete it[change.path[i]];
                            break;
                        case "E":
                        case "N":
                            it[change.path[i]] = change.rhs;
                            break;
                    }
                }
            },
            difference(object, base) {
                function changes(object, base) {
                    return _.transform(object, function (result, value, key) {
                        if (!_.isEqual(value, base[key])) {
                            result[key] =
                                _.isObject(value) && _.isObject(base[key])
                                    ? changes(value, base[key])
                                    : value;
                        }
                    });
                }

                return changes(object, base);
            },

            showReplay() {
                var me = this;
                if (false) {
                    alert("준비중 입니다.");
                } else {
                    var proId = me.information.projectId
                        ? me.information.projectId
                        : me.projectId;
                    var author = me.information.author
                        ? me.information.author
                        : me.params.userUid;
                    let route = me.$router.resolve({
                        path: `/replay/${proId}/null`,
                    });
                    // let route = me.$router.resolve({path: `/replay/${proId}/null/null`});
                    window.open(route.href, "_blank");
                }
            },
            changeCaseforView(item, eventName, viewName) {
                item.eventField.namePascalCase = changeCase.pascalCase(eventName);
                item.eventField.nameCamelCase = changeCase.camelCase(eventName);
                item.viewField.namePascalCase = changeCase.pascalCase(viewName);
                item.viewField.nameCamelCase = changeCase.camelCase(viewName);

                return item;
            },
            setNames(value) {
                if (value) {
                    value.namePascalCase = changeCase.pascalCase(value.name);
                    value.nameCamelCase = changeCase.camelCase(value.name);
                }
            },
            generateHexagonal(value) {
                var me = this;
                me.elementTypes.forEach(function (item, index) {
                    if (item.component.includes("bounded-context")) {
                        me.elementTypes[index].src = `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/event/bounded_hexagonal.png`;
                    }
                    if (item.component.includes("packaged-business-capabilities")) {
                        me.elementTypes[index].src = `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/event/pbc_hexagonal.png`;
                    }
                });
                me.hexagonalValue = me.settingHexagonal(value);
                if (me.hexagonalValue) me.isHexagonal = true;
            },
            generateModel() {
                var me = this;
                me.elementTypes.forEach(function (item, index) {
                    if (item.component.includes("bounded-context")) {
                        me.elementTypes[index].src = `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/event/bounded2.png`;
                    }
                    if (item.component.includes("packaged-business-capabilities")) {
                        me.elementTypes[index].src = `${
                            window.location.protocol + "//" + window.location.host
                        }/static/image/event/pbc.png`;
                    }
                });
                me.isHexagonal = false;
                // if(me.hasNewHexagonalEl) {
                //     window.location.reload()
                // }
            },
            closeResourceQuota(ide, tool) {
                if (ide) {
                    //ide
                    this.resourceQuota = ide.resourceQuota;
                    this.resourceType = ide.resourceType;
                    //tool
                    this.toolResourceQuota = tool.resourceQuota;
                    this.toolResourceType = tool.resourceType;
                    //status
                    this.setResourceQuota = true;
                }
                this.resourceQuotaDialog = false;
            },

            async checkedPaidItem() {
                var me = this;
                me.isDownloading = true;

                if (window.MODE == "onprem") {
                    return await me.downloadArchive();
                    // return await me.generateZip()
                } else {
                    if (me.isLogin) {
                        var convertEmail = me.userInfo.email.replace(/\./gi, "_");
                        var getItemId = null;
                        var isPaid = false;
                        // var isPaid = true // free

                        if (me.isClazzModeling) {
                            var classInfo = await this.getClassInfo();
                            var labInfo = await this.getLabInfo();
                            getItemId = `${me.canvasType}_${classInfo.courseId}@${classInfo.classId}@${labInfo.labId}`;
                            me.purchaseItemDialogInfo.className =
                                classInfo.className;
                            me.purchaseItemDialogInfo.labName = labInfo.labName;
                            if (
                                classInfo &&
                                !classInfo.openClass &&
                                classInfo.connectionKey
                            ) {
                                isPaid = true;
                            }
                        } else {
                            getItemId = `${me.canvasType}_${me.projectId}`;
                        }

                        if (!isPaid) {
                            var checkSubscription = await me.getObject(
                                `db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/subscription`
                            );
                            if (checkSubscription) {
                                var checkExpired = checkSubscription.expiredDate
                                    ? checkSubscription.expiredDate
                                    : 0;
                                if (typeof checkExpired == "string")
                                    checkExpired = Number(checkExpired);
                                if (
                                    checkExpired == 0 ||
                                    Date.now() < checkExpired
                                ) {
                                    if (checkSubscription.downloadCode != 0) {
                                        isPaid = true;
                                    }
                                }
                            } else {
                                var checkItem = await me.getObject(
                                    `db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/${getItemId}`
                                );
                                if (checkItem) {
                                    var checkExpired = checkItem.expiredDate
                                        ? checkItem.expiredDate
                                        : 0;
                                    if (typeof checkExpired == "string")
                                        checkExpired = Number(checkExpired);
                                    if (
                                        checkExpired == 0 ||
                                        Date.now() < checkExpired
                                    ) {
                                        isPaid = true;
                                    }
                                }
                            }
                        }

                        if (isPaid || me.isForeign) {
                            await me.downloadArchive();
                            // await me.generateZip()
                        } else {
                            me.purchaseItemDialogOpen(getItemId);
                        }
                    } else {
                        me.$EventBus.$emit("showLoginDialog", true);
                    }
                }
            },
            async purchaseItemDialogSubmit(result) {
                var me = this;
                try {
                    if (result) {
                        var returnResult = false;
                        var type = me.purchaseItemDialogInfo.resourceType;
                        if (type == "codeView") {
                            returnResult = await me.openCodeViewer();
                        } else if (type == "downloadCode") {
                            returnResult = await me.downloadArchive();
                            // returnResult = await me.generateZip()
                        }

                        if (returnResult) {
                            alert(`'${type}' 를 성공 하였습니다.`);
                        } else if (returnResult == false) {
                            me.purchaseItemDialogClose(false);
                            alert(`'${type}' 를 실패 하였습니다.`);
                        }
                    } else {
                        alert("결제를 실패했습니다.");
                    }
                    me.purchaseItemDialogClose();
                } catch (e) {
                    me.purchaseItemDialogClose();
                }
            },
            diff_lineMode(text1, text2) {
                var dmp = new DiffMatchPatch();
                var a = dmp.diff_linesToChars_(text1, text2);
                var lineText1 = a.chars1;
                var lineText2 = a.chars2;
                var lineArray = a.lineArray;
                var diffs = dmp.diff_main(lineText1, lineText2, false);
                dmp.diff_charsToLines_(diffs, lineArray);
                return diffs;
            },
            onConnectShape: function (edge, from, to) {
                var me = this;
                //존재하는 릴레이션인 경우 (뷰 ��포넌트), 데이터 매핑에 의해 자동으로 from, to 가 변경되어있기 때문에 따로 로직은 필요없음.
                //=> 바뀌어야 함.
                //신규 릴레이션인 경우에는 릴레이션 생성
                var edgeElement, originalData;
                var isComponent = false;
                if (edge.shape) {
                    edgeElement = edge;
                }
                // else {
                //     isComponent = true;
                //     edgeElement = edge.element;
                // }

                if (edgeElement && from && to) {
                    var vertices =
                        "[" + edgeElement.shape.geom.vertices.toString() + "]";
                    var componentInfo = {
                        component: "class-relation",
                        sourceElement: from.$parent,
                        targetElement: to.$parent,
                        vertices: vertices,
                        isFilled: true,
                        isRelation: true,
                        relationView: {
                            style: JSON.stringify({}),
                            value: vertices,
                        },
                    };

                    from.$parent.value.elementView.id = from.id;
                    to.$parent.value.elementView.id = to.id;

                    // if (isComponent) {
                    //     me.canvas.removeShape(edgeElement, true);
                    //     //this.removeComponentByOpenGraphComponentId(edgeElement.id);
                    //     //기존 컴포넌트가 있는 경우 originalData 와 함께 생성
                    //
                    //     if (me.connectableType(componentInfo.sourceElement.value, componentInfo.targetElement.value))
                    //         this.addElement(componentInfo)
                    // } else {
                    me.canvas.removeShape(edgeElement, true);
                    //기존 컴포넌트가 없는 경우 신규 생성
                    if (
                        me.connectableType(
                            componentInfo.sourceElement.value,
                            componentInfo.targetElement.value
                        ) &&
                        me.validateRelation(from, to)
                    ) {
                        this.addElement(componentInfo);
                    }

                    // }
                }
            },
            filteredProjectName(projectName) {
                var me = this;

                var getProjectName = projectName ? projectName : me.projectName;
                var filteredName = JSON.parse(JSON.stringify(getProjectName));
                var pattern1 = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi; //특수문자 제거
                var pattern2 = /[0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣~!@#$%^&*()_+|-|<>?:{}]/gi; // 한글 제거

                if (filteredName) {
                    if (pattern1.test(filteredName)) {
                        filteredName = filteredName.replace(pattern1, "");
                    }
                    if (pattern2.test(filteredName)) {
                        filteredName = filteredName.replace(pattern2, "");
                    }
                    filteredName = filteredName.toLowerCase();
                } else {
                    return "untitled";
                }
                return filteredName == "" ? "untitled" : filteredName;
            },
            getComponentByClassName: function (className) {
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
                var me = this;
                $.each(
                    window.Vue.eventStormingModelingComponents,
                    function (i, component) {
                        if (
                            component.default.computed &&
                            component.default.computed.className &&
                            component.default.computed.className() == className
                        ) {
                            componentByClassName = component.default;
                            if (
                                me.isHexagonal &&
                                !hexagonalElements.includes(component.default.name)
                            ) {
                                componentByClassName = null;
                            }
                        }
                    }
                );

                return componentByClassName;
            },
            async functionSelect(title) {
                var me = this;
                if (title == "Save to Server") {
                    me.saveComposition("save");
                } else if (title == "Duplicate") {
                    me.saveComposition("duplicate");
                    // me.storageDialogReady('duplicate')
                } else if (title == "Git URL for Model") {
                    me.gitInfoDialog = true;
                } else if (title == "Download model File") {
                    me.downloadModelToJson();
                } else if (title == "Code Preview") {
                    me.openCodeViewer();
                } else if (title == "Download Archive") {
                    me.generateZipDialog = true;
                    me.isDownloading = false;
                } else if (title == "Share") {
                    // me.openEventShareDialog()
                    me.openInviteUsers();
                } else if (title == "Reset Config") {
                    var hashName, userGroup, userName, projectId;
                    userName = localStorage
                        .getItem("email")
                        .split("@")[0]
                        .toLowerCase();
                    userGroup = localStorage
                        .getItem("email")
                        .split("@")[1]
                        .split(".")[0]
                        .toLowerCase();
                    if (me.isClazzModeling) {
                        projectId = me.$route.params.labId;
                    } else {
                        projectId = me.$route.params.projectId;
                    }
                    if (me.$route.params.labId) {
                        if (me.$parent.labInfo.independent) {
                            var hashPath = me.getClassPath(
                                "labs/" +
                                me.$route.params.labId +
                                "/" +
                                me.$route.params.userId
                            );
                        } else {
                            var hashPath = me.getClassPath(me.$route.params.userId);
                        }
                        hashName = "labs-" + me.hashCode(hashPath);
                    } else {
                        hashName = `ide-${me.hashCode(userGroup + "-" + userName)}`;
                    }
                    var obj = {
                        course: `${userGroup}`,
                        lab: `${userName}`,
                        clazz: `${projectId}`,
                        userId: localStorage.getItem("author").replace("@", "_"),
                    };
                    await me.deleteConfig(hashName, obj);
                    await me.makeConfig(hashName, obj);
                } else if (title == "Project IDE" || title == "opentheiaIDE") {
                    // build에 영향을 주는 에러가 있다고 알림
                    me.alertError();
                    if (me.errorCount > 0) {
                        if (!me.openIde) {
                            me.projectIdeAlertDialog = true;
                            return false;
                        } else {
                            me.projectIdeAlertDialog = false;
                        }
                    }

                    if (me.isLogin) {
                        me.ideSnackBar.wrongGitInfo = false;
                        if (
                            me.useIdeItem == "gitpod" &&
                            title != "opentheiaIDE" &&
                            window.MODE != "onprem"
                        ) {
                            if (me.scmOrg && me.scmRepo) {
                                if (me.information) {
                                    var isVersionBranch = false;
                                    if (
                                        me.value.scm.forkedTag &&
                                        !me.value.scm.tag
                                    ) {
                                        await axios
                                            .get(
                                                `https://api.github.com/repos/${me.value.scm.org}/${me.value.scm.repo}/branches/branch-${me.value.scm.forkedTag}`,
                                                { headers: me.githubHeaders }
                                            )
                                            .then(function (res) {
                                                if (res) {
                                                    isVersionBranch = true;
                                                }
                                            })
                                            .catch(function (error) {
                                                if (error.response.status === 401) {
                                                    me.alertReLogin();
                                                }
                                                isVersionBranch = false;
                                            });
                                    }
                                    var releaseTagPath =
                                        !isVersionBranch &&
                                        this.projectVersion &&
                                        me.information.firstCommit == "false"
                                            ? `/releases/tag/${this.value.scm.tag}`
                                            : "";
                                    var gitpodUrl;
                                    if (me.information.firstCommit == "false") {
                                        gitpodUrl = `https://gitpod.io/#https://github.com/${this.value.scm.org}/${this.value.scm.repo}${releaseTagPath}`;
                                    } else {
                                        if (
                                            this.value.scm.forkedOrg &&
                                            this.value.scm.forkedRepo
                                        ) {
                                            gitpodUrl = `https://gitpod.io/#https://github.com/${this.value.scm.forkedOrg}/${this.value.scm.forkedRepo}${releaseTagPath}`;
                                        } else {
                                            gitpodUrl = `https://gitpod.io/#https://github.com/${this.value.scm.org}/${this.value.scm.repo}${releaseTagPath}`;
                                        }
                                    }
                                    var targetUrl;
                                    targetUrl = isVersionBranch
                                        ? `${gitpodUrl}/tree/branch-${me.value.scm.forkedTag}`
                                        : gitpodUrl;
                                    window.open(targetUrl, "_blank");
                                    // var tagName =  this.scmTag ? `/releases/tag/${this.scmTag}` : ''
                                    // if(me.information.firstCommit == 'false'){
                                    //     window.open(`https://gitpod.io/#https://github.com/${me.scmOrg}/${me.scmRepo}${tagName}`, '_blank');
                                    // } else {
                                    //     if(this.scmForkedOrg && this.scmForkedRepo){
                                    //         window.open(`https://gitpod.io/#https://github.com/${me.scmForkedOrg}/${me.scmForkedRepo}`, '_blank');
                                    //     } else {
                                    //         // window.open(`https://gitpod.io/#https://github.com/${me.gitOrgName}/${me.gitRepoName}`, '_blank');
                                    //         // alert("The target repository does not exist, Open the IDE after committing in the code preview")
                                    //         await me.openCodeViewer()
                                    //         me.gitMenu = true
                                    //         me.ShowCreateRepoTab = true
                                    //     }
                                    // }
                                }
                            } else {
                                me.ideSnackBar.wrongGitInfo = true;
                                me.showErrSnackBar(
                                    "Gitpod로 실행시키려면 Git 로그인 또는 정보입력이 필요합니다."
                                );
                            }
                        } else {
                            if (window.MODE == "onprem") {
                                me.openProjectIDE();
                            } else {
                                var idePrice = await this.getString(
                                    `db://pricing/ide`
                                );
                                if (!idePrice) idePrice = 1000;
                                if (me.getUserToolTime > 0) {
                                    me.openProjectIDE();
                                } else if (me.getUserCoin >= idePrice / 100) {
                                    me.$EventBus.$emit("autoToolPay");
                                    me.openProjectIDE();
                                } else {
                                    me.$EventBus.$emit("openPaymentTime", true);
                                }
                            }
                        }
                        me.openIde = false;
                        // if (me.getUserToolTime > 0) {
                        // me.ideStartValidation()
                        // Todo: 파일을 변경 할 것 인지 체크 후 띄우기
                        // } else {
                        //     this.$EventBus.$emit('openPaymentTime', true)
                        // }
                    } else {
                        me.$EventBus.$emit("showLoginDialog");
                    }
                } else if (title == "Hexagonal") {
                    me.generateHexagonal();
                } else if (title == "EventStorming") {
                    me.generateModel();
                } else if (title == "BPMN") {
                    me.openBpmnDialog();
                } else if (title == "Generate PowerPoint") {
                    me.generatePowerPoint();
                }
            },

            arrayToObject(array) {
                var tmp = {};
                array.forEach(function (data) {
                    eval("tmp['" + data.key + "']= data");
                });
                return tmp;
            },

            async openCodeViewer() {
                var me = this;

                try {
                    me.gitAccessToken = localStorage.getItem("gitAccessToken");
                    // me.model = []

                    var filtered = me.filteredProjectName(me.projectName);
                    if (filtered.replace(/\s/gi, "") == "") {
                        // validationResults
                        var validationResultIndex =
                            me.canvasValidationResults.findIndex(
                                (x) => x.code == me.ESC_NOT_PJ_NAME
                            );
                        var isExistValidationResult =
                            validationResultIndex == -1 ? false : true;
                        if (!isExistValidationResult) {
                            me.canvasValidationResults.push(
                                me.validationFromCode(me.ESC_NOT_PJ_NAME)
                            );
                        }
                        me.projectName = window.prompt(
                            "Please input your Project Name(Alphabet Only)"
                        );
                        return false;
                    } else {
                        me.checkName = true;
                        me.openSeparatePanel();
                        return true;
                    }
                } catch (e) {
                    console.error(e);
                    alert("openCodeViewer:: ", e);
                    return false;
                }
            },
            umlModalShow() {
                this.$modal.show("uml-modal");
            },
            getPodStatus(userName, userGroup, projectName) {
                var me = this;
                return new Promise(function (resolve, reject) {
                    var hashName;
                    try {
                        if (me.$route.params.labId) {
                            if (me.$parent.labInfo.independent) {
                                var hashPath = me.getClassPath(
                                    "labs/" +
                                    me.$route.params.labId +
                                    "/" +
                                    me.$route.params.userId
                                );
                            } else {
                                var hashPath = me.getClassPath(
                                    me.$route.params.userId
                                );
                            }
                            hashName = "labs-" + me.hashCode(hashPath);
                        } else {
                            hashName = `ide-${me.hashCode(
                                userGroup + "-" + userName
                            )}`;
                        }
                        me.$http
                            .get(
                                `${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/pods/${hashName}`
                            )
                            .then(function (result) {
                                if (result.data.status.phase == "Running") {
                                    resolve(true);
                                } else {
                                    resolve(false);
                                }
                            })
                            .catch(function (e) {
                                resolve(false);
                            });
                    } catch (e) {
                        alert("getPodStatus-ERROR :", e);
                        resolve(false);
                    }
                });
            },
            getServiceStatus(userName, userGroup, projectName) {
                var me = this;
                var hashName = `ide-${me.hashCode(userGroup + "-" + userName)}`;
                return new Promise(function (resolve, reject) {
                    me.$http
                        .get(
                            `${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/services/${hashName}`
                        )
                        .then(function (result) {
                            resolve(true);
                        })
                        .catch(function (e) {
                            resolve(false);
                        });
                });
            },
            deletePod(userName, userGroup, projectName) {
                var me = this;
                return new Promise(function (resolve, reject) {
                    var hashName = `ide-${me.hashCode(userGroup + "-" + userName)}`;
                    me.$http
                        .delete(
                            `${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/pods/${hashName}`
                        )
                        .then(function (result) {
                            if (result.data.status.phase == "Running") {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        })
                        .catch(function (e) {
                            resolve(false);
                        });
                });
            },
            presignedURL(path) {
                var me = this;
                return new Promise((resolve, reject) => {
                    me.$minioClient.presignedUrl(
                        "GET",
                        "eventstorming",
                        path,
                        24 * 60 * 60,
                        function (err, presignedUrl) {
                            if (err) return reject(err);
                            resolve(presignedUrl);
                        }
                    );
                });
            },
            deleteService(userName, userGroup, projectName) {
                var me = this;
                return new Promise(function (resolve, reject) {
                    var hashName = `ide-${me.hashCode(userGroup + "-" + userName)}`;
                    me.$http
                        .delete(
                            `${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/services/${hashName}`
                        )
                        .then(function (result) {
                            if (result.data.status.phase == "Running") {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        })
                        .catch(function (e) {
                            resolve(false);
                        });
                });
            },
            // async setGitRepository() {
            //     var me = this
            //     var userName = localStorage.getItem("email").split('@')[0].toLowerCase();
            //     var userGroup = localStorage.getItem("email").split('@')[1].split('.')[0].toLowerCase();
            //     var projectName = me.projectName.toLowerCase();
            //     var sshUrl = await me.makeGitRepo(me.gitInfo.name, me.gitInfo.token)
            //     me.sshUrl = "https://" + sshUrl.replace("git", me.gitInfo.token).replace(":", "/")
            //     me.linkedSCM = true;
            //     me.scmUrl = me.sshUrl;
            //     me.settingGitInfoDialog = false;
            //
            // },
            getClassPath(path) {
                if (this.classId) {
                    var classId = this.classId.replace("@", "/");
                } else {
                    var classId = this.$route.params.classId.replace("@", "/");
                }

                if (this.courseId) {
                    var courseId = this.courseId;
                } else {
                    var courseId = this.$route.params.courseId;
                }
                return `${courseId}/classes/${classId}/${path}`;
            },
            //             async openProjectIDE(gitUrl) {
            //                 var me = this
            //                 if(gitUrl && gitUrl.target && gitUrl.target.value){
            //                     gitUrl = gitUrl.target.value
            //                 }
            //                 me.changedTmp = []
            //                 me.codeStatus = false
            //                 me.ideCheckDialog = false;
            //                 me.$EventBus.$emit("progressing", {
            //                     progressing: true,
            //                     type: 'ES'
            //                 })
            //                 // this.gitUrl = gitUrl;
            //                 var userName = localStorage.getItem("email").split('@')[0].toLowerCase();
            //                 var userGroup = localStorage.getItem("email").split('@')[1].split('.')[0].toLowerCase();
            //                 var projectName = me.projectName.toLowerCase();
            //                 var projectId = 'untitled'
            //
            //                 if (me.isClazzModeling) {
            //                     projectId = me.$route.params.labId
            //                 } else {
            //                     projectId = me.$route.params.projectId;
            //                 }
            //
            //                 var podStatus = await me.getPodStatus(userName, userGroup, projectName);
            //                 var hashName;
            //
            //                 // if (!me.mergeStatus) {
            //                 // await me.callGenerateCode();
            //                 await me.callGenerate()
            //                 // }
            //
            //                 while (!me.codeStatus) {
            //                     await sleep(3000);
            //                 }
            //
            //
            //                 // if (me.ideUpdateCheck) {
            //                 //     await me.deleteIdeFile(userGroup, userName, projectId);
            //                 // }
            //                 if (me.$route.params.labId) {
            //                     if (me.$parent.labInfo.independent) {
            //                         var hashPath = me.getClassPath('labs/' + me.$route.params.labId + '/' + me.$route.params.userId);
            //                         var filePath = hashPath
            //
            //                     } else {
            //                         var hashPath = me.getClassPath(me.$route.params.userId);
            //                         var filePath = me.getClassPath('labs/' + me.$route.params.userId);
            //
            //                     }
            //                     hashName = "labs-" + me.hashCode(hashPath);
            //                 } else {
            //                     hashName = `ide-${me.hashCode(userGroup + "-" + userName)}`
            //                 }
            //
            //                 me.$EventBus.$emit("hashName", {
            //                     hashName: hashName,
            //                 })
            //
            //                 if (me.projectName.length < 1) {
            //                     var tempProjectName = window.prompt('Project Name을 입력하여 주세요.');
            //                     projectName = tempProjectName;
            //                     me.projectName = tempProjectName
            //                 }
            //
            //                 function sleep(ms) {
            //                     return new Promise(resolve => setTimeout(resolve, ms))
            //                 }
            //
            //                 // me.mergeStatus = false;
            //
            //                 me.changedCount = 0;
            //                 if (me.generateTreeLists.length > 0) {
            //                     me.generateTreeLists.forEach(function (list) {
            //                         if (!list.file) {
            //                             me.reverse(list.children, list.name)
            //                         } else if (list.changed > 0) {
            //                             me.pathTmp.push({
            //                                 path: list.name,
            //                                 code: list.code,
            //                                 changed: list.changed,
            //                                 key: list.key,
            //                                 path: list.path
            //                             })
            //                             me.changedTmp.push({
            //                                 path: list.name,
            //                                 code: list.code,
            //                                 changed: list.changed,
            //                                 key: list.key,
            //                                 path: list.path
            //                             })
            //                             me.changedCount++;
            //                         } else if (list.isNew) {
            //                             me.pathTmp.push({
            //                                 name: list.name,
            //                                 path: list.name,
            //                                 code: list.code,
            //                                 isNew: true,
            //                                 key: list.key,
            //                                 path: list.path
            //                             })
            //                             me.changedTmp.push({
            //                                 name: list.name,
            //                                 path: list.name,
            //                                 code: list.code,
            //                                 isNew: true,
            //                                 key: list.key,
            //                                 path: list.path
            //                             })
            //                             me.changedCount++;
            //                         } else {
            //                             me.changedTmp.push({path: list.name, code: list.code, key: list.key, path: list.path})
            //                             me.pathTmp.push({path: list.name, code: list.code, key: list.key, path: list.path})
            //                         }
            //                     })
            //
            //
            //                     if (me.changedModifying) {
            //                         me.changedModifying = false
            //                         me.$EventBus.$emit("endProgressing");
            //                         return;
            //                     }
            //
            //                     me.$EventBus.$emit("nextStep");
            //                     var zip = new JSZip();
            //
            //                     // var parents = [];
            //
            //                     // Git URL 관련 처리 필요함..
            //                     // BoundedContext 찾기
            //                     var gitConnectedBoundedLists = []
            //                     Object.keys(me.attachedLists.boundedContextLists).forEach(function (bounded) {
            //                         if (me.attachedLists.boundedContextLists[bounded].gitURL) {
            //                             gitConnectedBoundedLists.push(me.attachedLists.boundedContextLists[bounded].name)
            //                         }
            //                     })
            //                     await me.makeDir(`labs-eventstorming/running/${userGroup}/classes/users/labs/${localStorage.getItem("email")}/${projectId}`)
            //                     /* me.$http.post(`${me.fileServerUrl}/api/makeDir`, {
            //                          "hashName": hashName,
            //                          "path": `home/minio/labs-eventstorming/running/${userGroup}/classes/users/labs/${localStorage.getItem("email")}/${projectId}`
            //                      }).catch(e => console.log(e));*/
            //                     me.pathTmp.forEach(function (generateData) {
            //                         console.log(generateData);
            //                         if (generateData.path.includes('/')) {
            //                             // parents.push(generateData.path.split('/')[0])
            //                         }
            //                         if (!gitConnectedBoundedLists.includes(generateData.path.split("/")[0]))
            //                             zip.file(generateData.path, generateData.code)
            //                     })
            //
            //                     // parents. forEach(function (prefix) {
            //                     //     zip.folder(prefix).forEach(function (relativePath, file) {
            //                     //     });
            //                     // })
            //
            //
            //                     zip.generateAsync({type: "nodebuffer"})
            //                         .then(async function (content) {
            //                             var metaData = {
            //                                 'Content-Type': 'application/zip',
            //                             }
            //                             me.$EventBus.$emit("nextStep")
            //                             // var minioClient = new Minio.Client({
            //                             //     endPoint: `minio.${me.getTenantId()}`,
            //                             //     port: 443,
            //                             //     useSSL: true,
            //                             //     accessKey: 'minio',
            //                             //     secretKey: 'minio123'
            //                             // });
            //
            //                             var configPath = `${userGroup}/${userName}/config`
            //                             var checkConfigFile;
            //                             try {
            //                                 checkConfigFile = await me.getString('storage://labs-msaez.io/' + configPath + '/config');
            //                             } catch (e) {
            //                                 checkConfigFile = null
            //                             }
            //
            //                             if (podStatus) {
            //                                 me.$EventBus.$emit("nextStep")
            //
            //                                 me.$EventBus.$emit("nextStep");
            //                                 me.$EventBus.$emit("nextStep");
            //                                 // Pod가 존재 한다면 파일만 추가
            //                                 // IdeLoadingPage
            //                                 if (gitUrl)
            //                                     me.ideWindow = window.open(`IdeLoadingPage?param=${hashName}&projectName=${me.$route.params.labId ? me.$route.params.labId : projectId}&giturl=${encodeURIComponent(gitUrl)}`, '_blank')
            //                                 else
            //                                     me.ideWindow = window.open(`IdeLoadingPage?param=${hashName}&projectName=${me.$route.params.labId ? me.$route.params.labId : projectId}`, '_blank')
            //                                 me.$EventBus.$emit("nextStep");
            //
            //                                 me.$nextTick(function () {
            //                                     me.overlayText = null
            //                                     me.pathTmp = []
            //                                     me.$EventBus.$emit("endProgressing");
            //                                 })
            //                                 return;
            //                             } else {
            //                                 me.$EventBus.$emit("nextStep");
            //
            //                                 var convertEmail = me.userInfo.email.replace(/\./gi, '_')
            //
            //                                 if (me.isForeign) {
            //                                     me.toolResourceQuota.cpu = "4"
            //                                     me.toolResourceQuota.memory = "8Gi"
            //                                 } else {
            //                                     me.resourceQuotaDialog = true;
            //                                     while (!me.setResourceQuota) {
            //                                         await sleep(1000);
            //                                     }
            //                                 }
            //                                 me.setResourceQuota = false
            //
            //                                 var setResourceType = me.resourceType
            //
            //                                 if (me.$route.params.labId) {
            //                                     var course = me.courseId;
            //                                     var clazz = me.classId;
            //                                     var clazzName = clazz
            //                                     var lab = me.labId;
            //                                 }
            //
            //                                 //ide  && k8s setting
            //                                 var spec = {
            //                                     "apiVersion": "uengine.org/v1alpha1",
            //                                     "kind": "Ide",
            //                                     "metadata": {
            //                                         "name": hashName
            //                                     },
            //                                     "spec": {
            //                                         "hashName": hashName,
            //                                         "userId": localStorage.getItem("author").replace("@", "_"),
            //                                         // "templateFile": `${projectId}.zip`,
            //                                         "image": 'msa-repository.kubeflow.kr/msaez/theia-full-test:v9',
            //                                         "tenant": me.$route.params.labId ? me.getTenantId() : "eventstorming",
            //                                         "course": me.$route.params.labId ? course : `${userGroup}`,
            //                                         "lab": me.$route.params.labId ? lab : `${projectId}`,
            //                                         "clazz": me.$route.params.labId ? clazzName : `users`,
            //                                         // "zipUrl": zipUrl,
            //                                         "status": "running"
            //                                     }
            //                                 }
            //                                 //set k8s
            //                                 spec.spec.resourceQuota = me.toolResourceQuota;
            //                                 await me.$http.post(`${me.getProtocol()}//api.${me.getTenantId()}/apis/uengine.org/v1alpha1/namespaces/default/ides`, spec);
            //
            //                                 if (me.toolResourceType) {
            //                                     setResourceType = `${setResourceType}@${me.toolResourceType}`
            //                                 }
            //
            //                                 // resourceType
            //                                 var resourceTypeObj = {
            //                                     resourceType: setResourceType
            //                                 }
            //                                 me.putObject(`db://enrolledUsers/${convertEmail}/usage/${hashName}`, resourceTypeObj)
            //                             }
            //                             // ----------- Resource Size basic 설정 END------------->
            //
            //
            //                             var operatorCheck = await me.checkIdeOperator(hashName);
            //
            //                             function sleep(ms) {
            //                                 return new Promise(resolve => setTimeout(resolve, ms))
            //                             }
            //
            //                             while (!operatorCheck) {
            //                                 operatorCheck = await me.checkIdeOperator(hashName);
            //                                 await sleep(3000)
            //                             }
            //                             // me.setResourceQuota = false;
            //                             var obj = {
            //                                 "course": `${userGroup}`,
            //                                 "lab": `${userName}`,
            //                                 "clazz": `${projectId}`,
            //                                 "userId": localStorage.getItem("author").replace("@", "_")
            //                             }
            //                             await me.deleteConfig(hashName, obj)
            //                             await me.makeConfig(hashName, obj);
            // // IdeLoadingPage
            //                             if (this.gitUrl)
            //                                 me.ideWindow = window.open(`IdeLoadingPage?param=${hashName}&projectName=${projectId}&giturl=${encodeURIComponent(gitUrl)}`, '_blank')
            //                             else
            //                                 me.ideWindow = window.open(`IdeLoadingPage?param=${hashName}&projectName=${projectId}`, '_blank')
            //                             if (me.sshUrl) {
            //                                 var commandParams = new URLSearchParams();
            //                                 commandParams.append('filePath', `labs-eventstorming/running/${userGroup}/classes/users/labs/${localStorage.getItem("author")}`);
            //                                 commandParams.append('lab', `${projectId}`);
            //                                 commandParams.append('githubURL', `${me.sshUrl}`);
            //                                 commandParams.append('hashName', `${hashName}`);
            //                                 setTimeout(function () {
            //                                     me.$http.post(`${me.getProtocol()}//file.kuberez.io/api/runCommand`, commandParams)
            //                                 }, 3000)
            //                             }
            //                             me.$EventBus.$emit("nextStep");
            //                             setTimeout(function () {
            //                                 me.$http.post(`${me.getProtocol()}//file.kuberez.io/api/gitCommit`, gitParams)
            //                             }, 3000)
            //
            //                             me.$nextTick(function () {
            //                                 me.overlayText = null
            //                                 me.pathTmp = []
            //                                 me.$EventBus.$emit("endProgressing");
            //                             })
            //                             // })
            //                             me.$EventBus.$emit("nextStep")
            //                             // var zipUrl = await me.presignedURL(`${userGroup}/${userName}/${projectId}.zip`);
            //                         })
            //
            //                 } else {
            //                     // await me.callGenerateCode();
            //                     await  me.callGenerate();
            //                     me.openProjectIDE();
            //                 }
            //             },
            checkIdeOperator(hashName) {
                var me = this;
                if (me.classInfo) {
                    var serverToken = me.classInfo.token;
                    var serverUrl = me.classInfo.serverUrl;
                }

                if (!serverUrl || !serverToken) {
                    return new Promise(function (resolve) {
                        me.$http
                            .get(
                                `${me.getProtocol()}//api.${me.getTenantId()}/apis/uengine.org/v1alpha1/namespaces/default/ides/${hashName}/status`
                            )
                            .then(function (result) {
                                result.data.status.conditions.forEach(function (
                                    item
                                ) {
                                    if (
                                        item.reason == "InstallSuccessful" &&
                                        item.type == "Deployed"
                                    ) {
                                        resolve(true);
                                    }
                                });
                            })
                            .catch(function (e) {
                                resolve(false);
                            });
                    });
                } else {
                    return new Promise(function (resolve) {
                        me.$http
                            .get(
                                `${me.getProtocol()}//api.${me.getTenantId()}/apis/uengine.org/v1alpha1/namespaces/default/ides/${hashName}/status?serverUrl=${serverUrl}&token=${serverToken}`
                            )
                            .then(function (result) {
                                result.data.status.conditions.forEach(function (
                                    item
                                ) {
                                    if (
                                        item.reason == "InstallSuccessful" &&
                                        item.type == "Deployed"
                                    ) {
                                        resolve(true);
                                    }
                                });
                            })
                            .catch(function (e) {
                                resolve(false);
                            });
                    });
                }
            },
            // makeGitRepo(projectName, accessToken) {
            //     var me = this
            //     return new Promise(function (resolve) {
            //         me.$http.post("https://api.github.com/user/repos", {
            //             name: `${projectName}`
            //         }, {
            //             headers: {
            //                 'Accept': 'application/vnd.github.v3+json',
            //                 "Authorization": `Bearer ${localStorage.getItem('gitAccessToken') ? localStorage.getItem('gitAccessToken') : accessToken}`
            //             }
            //         }).then(function (result) {
            //             resolve(result.data.ssh_url);
            //         }).catch(e => alert(e))
            //     })
            // },

            ajax: function (url, method, payload, successCallback) {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url, true);
                // xhr.withCredentials = true;
                xhr.setRequestHeader(
                    "Content-Type",
                    "application/json;charset=UTF-8"
                );
                xhr.onreadystatechange = function () {
                    if (xhr.readyState != 4 || xhr.status != 200) return;
                    successCallback(xhr.responseText);
                };
                xhr.send(JSON.stringify(payload));
            },
            restApiPush: function () {
                var me = this;
                me.$http
                    .post(
                        `${me.getProtocol()}//api.${me.getTenantId()}/event/${
                            me.projectName
                        }`,
                        me.value,
                        {
                            responseType: "arraybuffer",
                            headers: {
                                "Content-Type": "application/zip;",
                            },
                        }
                    )
                    .then(function (response) {
                        var blob = new Blob([response.data], {
                            type: "application/zip",
                        });
                        var fileName = me.projectName + ".zip";
                        saveAs(blob, fileName);
                    });
            },

            b64toBlob: function (b64Data, contentType, sliceSize) {
                contentType = contentType || "";
                sliceSize = sliceSize || 512;

                var byteCharacters = atob(b64Data);
                var byteArrays = [];

                for (
                    var offset = 0;
                    offset < byteCharacters.length;
                    offset += sliceSize
                ) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);

                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    var byteArray = new Uint8Array(byteNumbers);

                    byteArrays.push(byteArray);
                }

                var blob = new Blob(byteArrays, { type: contentType });
                return blob;
            },

            loadLocalTextToJsonFile(fileObj) {
                var me = this;
                me.projectName = fileObj.projectName;
                me.value = fileObj.value;
            },

            ursiveDeepCopy(o) {
                var me = this;
                var newO, i;

                if (typeof o !== "object") {
                    return o;
                }
                if (!o) {
                    return o;
                }

                if ("[object Array]" === Object.prototype.toString.apply(o)) {
                    newO = [];
                    for (i = 0; i < o.length; i += 1) {
                        newO[i] = me.recursiveDeepCopy(o[i]);
                    }
                    return newO;
                }

                newO = {};
                for (i in o) {
                    if (o.hasOwnProperty(i)) {
                        newO[i] = me.recursiveDeepCopy(o[i]);
                    }
                }
                return newO;
            },
            existNamespaceCheck(hashName) {
                var me = this;
                return new Promise(function (resolve) {
                    me.$http
                        .get(
                            `${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/${hashName}`
                        )
                        .then(function (result) {
                            resolve(true);
                        })
                        .catch(function (e) {
                            resolve(false);
                        });
                });
            },
            createNamespace(hashName) {
                var me = this;
                return new Promise(function (resolve) {
                    me.$http
                        .post(
                            `${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces`,
                            {
                                apiVersion: "v1",
                                kind: "Namespace",
                                metadata: {
                                    name: hashName,
                                },
                                spec: {
                                    finalizers: ["kubernetes"],
                                },
                            }
                        )
                        .then(function (result) {
                            resolve(true);
                        })
                        .catch(function (e) {
                            resolve(false);
                        });
                });
            },
            existServiceAccountCheck(hashName) {
                var me = this;
                return new Promise(function (resolve) {
                    me.$http
                        .get(
                            `${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/${hashName}/serviceaccounts/${hashName}`
                        )
                        .then(function (result) {
                            resolve(result);
                        })
                        .catch(function (e) {
                            resolve(false);
                        });
                });
            },
            createServiceAccount(hashName) {
                var me = this;
                return new Promise(function (resolve) {
                    me.$http
                        .post(
                            `${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/${hashName}/serviceaccounts`,
                            {
                                apiVersion: "v1",
                                kind: "ServiceAccount",
                                metadata: {
                                    name: hashName,
                                    namespace: hashName,
                                },
                            }
                        )
                        .then(function (result) {
                            resolve(true);
                        })
                        .catch(function (e) {
                            resolve(false);
                        });
                });
            },
            existRoleCheck(hashName) {
                var me = this;
                return new Promise(function (resolve) {
                    me.$http
                        .get(
                            `${me.getProtocol()}//api.${me.getTenantId()}/apis/rbac.authorization.k8s.io/v1beta1/namespaces/${hashName}/roles/${hashName}`
                        )
                        .then(function (result) {
                            resolve(true);
                        })
                        .catch(function (e) {
                            resolve(false);
                        });
                });
            },
            createRole(hashName) {
                var me = this;
                return new Promise(function (resolve) {
                    me.$http
                        .post(
                            `${me.getProtocol()}//api.${me.getTenantId()}/apis/rbac.authorization.k8s.io/v1beta1/namespaces/${hashName}/roles`,
                            {
                                kind: "Role",
                                apiVersion: "rbac.authorization.k8s.io/v1beta1",
                                metadata: {
                                    namespace: hashName,
                                    name: hashName,
                                },
                                rules: [
                                    {
                                        apiGroups: ["*"],
                                        resources: ["*"],
                                        verbs: ["*"],
                                    },
                                ],
                            }
                        )
                        .then(function (result) {
                            resolve(true);
                        })
                        .catch(function (e) {
                            resolve(false);
                        });
                });
            },
            existRoleBindingCheck(hashName) {
                var me = this;
                return new Promise(function (resolve) {
                    me.$http
                        .get(
                            `${me.getProtocol()}//api.${me.getTenantId()}/apis/rbac.authorization.k8s.io/v1beta1/namespaces/${hashName}/rolebindings/${hashName}`
                        )
                        .then(function (result) {
                            resolve(true);
                        })
                        .catch(function (e) {
                            resolve(false);
                        });
                });
            },
            createRoleBinding(hashName) {
                var me = this;
                return new Promise(function (resolve) {
                    me.$http
                        .post(
                            `${me.getProtocol()}//api.${me.getTenantId()}/apis/rbac.authorization.k8s.io/v1beta1/namespaces/${hashName}/rolebindings`,
                            {
                                kind: "RoleBinding",
                                apiVersion: "rbac.authorization.k8s.io/v1beta1",
                                metadata: {
                                    name: hashName,
                                    namespace: hashName,
                                },
                                subjects: [
                                    {
                                        kind: "ServiceAccount",
                                        name: hashName,
                                    },
                                ],
                                roleRef: {
                                    kind: "Role",
                                    name: hashName,
                                    apiGroup: "rbac.authorization.k8s.io",
                                },
                            }
                        )
                        .then(function (result) {
                            resolve(true);
                        })
                        .catch(function (e) {
                            resolve(false);
                        });
                });
            },
            getSecret(hashName, secretName) {
                var me = this;
                return new Promise(function (resolve) {
                    me.$http
                        .get(
                            `${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/${hashName}/secrets/${secretName}`
                        )
                        .then(function (result) {
                            resolve(result.data.data.token);
                        })
                        .catch(function (e) {
                            resolve(false);
                        });
                });
            },
            hashCode(s) {
                return s.split("").reduce(function (a, b) {
                    a = (a << 5) - a + b.charCodeAt(0);
                    return a & a;
                }, 0);
            },
            ideRunningCheck(hashName) {
                var me = this;
                me.$http
                    .get(
                        `${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/pods/${hashName}/status`
                    )
                    .then(function (result) {
                        if (result.data.status.conditions) {
                            result.data.status.conditions.forEach(function (
                                status
                            ) {
                                if (
                                    status.type == "Ready" &&
                                    status.status == "True"
                                ) {
                                    if (me.labInfo.independent) {
                                        me.ideUrl = `${me.getProtocol()}//${hashName}.kuberez.io`;
                                        clearInterval(me.ideInterval);
                                    } else {
                                        me.ideUrl = `${me.getProtocol()}//${hashName}.kuberez.io/?labId=${
                                            me.labId
                                        }#/home/project/${me.labId}`;
                                        clearInterval(me.ideInterval);
                                    }
                                }
                            });
                        }
                    })
                    .catch(function (e) {});
            },
            ideExistCheck(userEmail) {
                var me = this;
                var lab = me.labId;
                if (me.labInfo.independent) {
                    var hashPath = me.getClassPath("labs/" + lab + "/" + userEmail);
                } else {
                    var hashPath = me.getClassPath(userEmail);
                }
                var hashName = "labs-" + me.hashCode(hashPath);
                return new Promise(function (resolve) {
                    me.$http
                        .get(
                            `${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/pods/${hashName}/status`
                        )
                        .then(function (result) {
                            resolve(result);
                        })
                        .catch(function (e) {
                            resolve(false);
                        });
                });
            },

            // //복사
            // copy: function () {
            //     var me = this
            //     if (!me.isReadModeling && !me.readOnly) {
            //         me.tmpValue = []
            //         Object.values(me.value.elements).forEach(function (tmp, idx) {
            //             if (tmp != null) {
            //                 if (tmp.selected == true) {
            //                     me.tmpValue.push(tmp)
            //                 }
            //             }
            //         })
            //     }
            // },
            // //붙여넣기
            // paste: function () {
            //     var me = this
            //     if (!me.isReadModeling && !me.readOnly) {
            //         var temp = JSON.parse(JSON.stringify(me.tmpValue))
            //         if (me.tmpValue != null) {
            //             temp.forEach(function (tmp, idx) {
            //                 tmp.elementView.id = me.uuid();
            //                 tmp.elementView.x = tmp.elementView.x + Math.floor(Math.random() * 101)
            //                 tmp.elementView.y = tmp.elementView.y + Math.floor(Math.random() * 101)
            //                 delete tmp.selected
            //                 me.addElementPush(tmp)
            //             })
            //         }
            //     }
            // },

            codeAlign(code) {
                var me = this;

                var parsers = {
                    tabWidth: 4,
                    parser: "java",
                    plugins: [plugins],
                };

                if (code.includes("<function>")) {
                    code = code.replace("<function>", "");
                }
                try {
                    var formatted = prettier.format(code, parsers);
                    return formatted;
                } catch (e) {
                    // console.log(e)
                    return code; //if fail return original
                }
            },
            // async javaParse(val){
            //     var me = this
            //     let data = {
            //             arg: val
            //         }
            //     let header = {
            //         'Content-Type': 'application/json',
            //     }

            //     await axios.post('http://localhost:8099/java-reverse', JSON.stringify(data), { headers: header }).then(response => {
            //         me.javaReverse(response.data)
            //     }).catch(error => {
            //         console.error(error)
            //     })
            // },
            // javaReverse(val){
            //     var me = this
            //     var copyAggregateRoot = JSON.parse(JSON.stringify(me.aggregateRootList[0]))
            //     copyAggregateRoot.aggregateRoot.fieldDescriptors = []
            //     copyAggregateRoot.aggregateRoot.entities.elements = {}
            //     copyAggregateRoot.aggregateRoot.entities.relations = {}
            //     var aggRootElementInfo
            //     Object.keys(me.embeddedCanvasValue.elements).some(function (key){
            //         if(me.embeddedCanvasValue.elements[key] && me.embeddedCanvasValue.elements[key].isAggregateRoot) {
            //             aggRootElementInfo = me.embeddedCanvasValue.elements[key]
            //             me.rootUuid = key
            //         }
            //     })
            //     me.embeddedCanvasValue.elements = {}
            //     me.embeddedCanvasValue.relations = {}

            //     val.types.forEach(function (data, idx){
            //         var elementUuid = me.uuid();
            //         var relationUuid = me.uuid();
            //         var isAggRoot = false
            //         if(data.name.identifier.includes(me.aggregateRootList[0].name)){
            //             isAggRoot = true
            //             entity = aggRootElementInfo
            //             entity.fieldDescriptors = []
            //             entity.groupElement = null
            //             elementUuid = me.rootUuid
            //         } else {
            //             var entity = {
            //                 _type: "org.uengine.uml.model.Class",
            //                 elementView: {
            //                     _type: "org.uengine.uml.model.vo.Class",
            //                     id: elementUuid,
            //                     style: "{}",
            //                     fieldH: 50,
            //                     height: 100,
            //                     methodH: 30,
            //                     subEdgeH: 70,
            //                     titleH: 30,
            //                     width: 200,
            //                     x: 188 + (idx * 200),
            //                     y: 464
            //                 },
            //                 fieldDescriptors: [],
            //                 // groupElement: "ce5ea3b0-9c20-2dcd-239b-8237f4f43358",
            //                 isAbstract: false,
            //                 isAggregateRoot: false,
            //                 isInterface: false,
            //                 isVO: true,
            //                 name: "",
            //                 nameCamelCase: "",
            //                 namePascalCase: "",
            //                 namePlural: "",
            //                 operations: [],
            //                 parentOperations: [],
            //                 relationType: null,
            //                 relations: [],
            //                 selected: false
            //             }
            //             var vertices = `[[${me.aggregateRootList[0].elementView.x}, ${me.aggregateRootList[0].elementView.y}], [${entity.elementView.x}, ${entity.elementView.y}]]`
            //             var relation = {
            //                 from: me.rootUuid,
            //                 to: elementUuid,
            //                 _type: "org.uengine.uml.model.Relation",
            //                 fromLabel: "",
            //                 name: "",
            //                 relationType: "Composition",
            //                 relationView: {
            //                     id: relationUuid,
            //                     from: me.rootUuid,
            //                     to: elementUuid,
            //                     style: `{"arrow-start":"none","arrow-end":"none"}`,
            //                     value: vertices,
            //                     needReconnect:true
            //                 },
            //                 selected: false,
            //                 sourceElement:
            //                 // copyAggregateRoot.aggregateRoot.entities.elements['test99'],
            //                 {
            //                     elementView: {
            //                         id: elementUuid,
            //                     }
            //                 },
            //                 sourceMultiplicity: "1",
            //                 targetElement: entity,
            //                 targetMultiplicity: "1",
            //                 toLabel: ""
            //             }
            //         }
            //         entity.relations.push(relationUuid)
            //         data.members.forEach(function (data2, index){
            //             // console.log("data.members: ", data2)
            //             if(data2.type == "FieldDeclaration"){
            //                 data2.variables.forEach(function (data3){
            //                     var type
            //                     if(data3.type.name && data3.type.name.identifier){
            //                         type = data3.type.name.identifier
            //                     } else {
            //                         if(data3.type.type){
            //                             type = data3.type.type
            //                         } else {
            //                             type = "String"
            //                         }
            //                     }
            //                     var typeName = type.toLowerCase();
            //                     type = typeName.replace(typeName[0], typeName[0].toUpperCase());

            //                     var fieldDescriptor = {
            //                         className: type,
            //                         isKey: index == 0 ? true:false,
            //                         isList: false,
            //                         isLob: false,
            //                         isName: false,
            //                         isVO: false,
            //                         name: data3.name.identifier,
            //                         nameCamelCase: changeCase.camelCase(data3.name.identifier),
            //                         namePascalCase: changeCase.pascalCase(data3.name.identifier),
            //                         _type: "org.uengine.model.FieldDescriptor"
            //                     }
            //                     if(!isAggRoot){
            //                         relation.name = data.name.identifier
            //                         if(data2.annotations && data2.annotations[0].name.identifier){
            //                             if(data2.annotations[0].name.identifier == "OneToMany"){
            //                                 // relation.sourceMultiplicity = "1"
            //                                 relation.targetMultiplicity = "1..n"
            //                             } else if(data2.annotations[0].name.identifier == "ManyToOne"){
            //                                 relation.sourceMultiplicity = "1..n"
            //                                 // relation.targetMultiplicity = "1"
            //                             } else {
            //                                 // relation.sourceMultiplicity = "1"
            //                                 // relation.targetMultiplicity = "1"
            //                             }
            //                         }
            //                     }
            //                     entity.name = data.name.identifier
            //                     entity.nameCamelCase = changeCase.camelCase(data.name.identifier)
            //                     entity.namePascalCase = changeCase.pascalCase(data.name.identifier)
            //                     entity.namePlural = data.name.identifier

            //                     entity.fieldDescriptors.push(fieldDescriptor)
            //                 })
            //             }
            //         })
            //         if(isAggRoot){
            //             copyAggregateRoot.aggregateRoot.fieldDescriptors = entity.fieldDescriptors
            //         }
            //         me.embeddedCanvasValue.elements[elementUuid] = entity
            //         copyAggregateRoot.aggregateRoot.entities.elements[elementUuid] = entity

            //         me.embeddedCanvasValue.relations[relationUuid] = relation
            //         copyAggregateRoot.aggregateRoot.entities.relations[relationUuid] = relation
            //     })
            //     console.log(copyAggregateRoot)
            //     // me.aggregateRootList = []
            //     me.aggregateRootList[0] = copyAggregateRoot
            //     me.embeddedCanvasDialog = true;
            //     // var list = []
            //     // list.push(copyAggregateRoot)
            //     // me.addAggregateRootClass(list)
            // },

            openEmbeddedCanvas(val, mode) {
                var me = this;

                me.closeSeparatePanel();

                if (mode != "java-parse") {
                    me.overlayText = "Loading";
                }

                if (typeof val == "object") {
                    me.embeddedCanvasType = val.type;
                    me.aggregateRootList = val.aggList;
                    me.embeddedCanvasValue = JSON.parse(JSON.stringify(me.value.elements[val.aggId].aggregateRoot.entities));

                } else if (typeof val == "string") {
                    me.embeddedCanvasValue = { elements: {}, relations: {} };
                    me.embeddedCanvasInitValue = JSON.parse(JSON.stringify(me.value));
                    // me.embeddedCanvasInitValue = _.cloneDeep(me.value);
                    if (me.value.k8sValue != null) {
                        me.embeddedCanvasValue = me.value.k8sValue;
                    }

                    me.embeddedCanvasType = val;
                    me.boundedContextList = [];

                    Object.values(me.value.elements).forEach(function (el) {
                        if (el) {
                            if (el._type && el._type.endsWith("BoundedContext")) {
                                me.boundedContextList.push(el);
                            }
                        }
                    });
                }
                if (mode == "java-parse") {
                    me.openJavaParserDialog("uml");
                } else {
                    me.closeAutoModelingDialog();
                    me.embeddedCanvasDialog = true;
                }
            },
            closeEmbeddedCanvas() {
                var me = this;
                me.closeAutoModelingDialog();
                me.overlayText = null;

                if (me.embeddedCanvasType == "Domain Class Modeling") {
                    me.aggregateRootList = [];

                } else if (me.embeddedCanvasType == "Kubernetes") {
                    me.boundedContextList = [];
                    //me.$set(me.value, 'k8sValue', me.embeddedCanvasValue);

                    var delta = jsondiffpatch.diff(
                        me.embeddedCanvasInitValue.k8sValue,
                        me.value.k8sValue
                    );
                    if (delta) {
                        me.changedByMe = true;
                        me.value.k8sValue = me.embeddedCanvasInitValue.k8sValue;
                    }
                }

                me.embeddedCanvasDialog = false;
                me.embeddedCanvasType = "";
                me.embeddedCanvasValue = { elements: {}, relations: {} };
            },
            updateUMLClassValue(agg) {
                var me = this;
                me.changedByMe = true;
                me.value.elements[agg.id] = agg;
            },
            openExportDialog() {
                this.settingExportDialog = true;
            },
            applyExportDialog() {
                var me = this;
                let values = JSON.parse(JSON.stringify(me.value.elements));

                Object.keys(me.publicPBCElements).forEach(function (type) {
                    me.publicPBCElements[type].forEach(function (item) {
                        if (item) {
                            values[item.elementView.id].visibility = item.selectedPBC ? "public" : "private";
                        }
                    });
                });

                me.changedByMe = true;
                me.value.elements = Object.assign(me.value.elements, values);

                me.settingExportDialog = false;
            },
            closeExportDialog() {
                this.settingExportDialog = false;
            },
            openBpmnDialog() {
                var me = this;
                var commandList = [];

                Object.values(me.value.relations).forEach(function (relation) {
                    if (relation) {
                        if (relation.sourceElement._type.endsWith("Command")) {
                            commandList.push(relation.sourceElement.elementView.id);
                        }
                        if (relation.targetElement._type.endsWith("Command")) {
                            if (
                                commandList.includes(
                                    relation.targetElement.elementView.id
                                )
                            ) {
                                commandList.splice(
                                    commandList.indexOf(
                                        relation.targetElement.elementView.id
                                    ),
                                    1
                                );
                            }
                        }
                    }
                });

                me.bpmnCommands = [];
                Object.values(me.value.elements).forEach(function (element) {
                    if (element) {
                        if (element._type.endsWith("Policy")) {
                            commandList.forEach(function (cmdId) {
                                if (me.value.elements[cmdId]) {
                                    var cmd = me.value.elements[cmdId];

                                    if (isAttached(element, cmd)) {
                                        commandList.splice(
                                            commandList.indexOf(cmdId),
                                            1
                                        );
                                    }
                                }
                            });
                        }
                    }
                });

                commandList = [...new Set(commandList)];
                commandList.forEach(function (cmdId) {
                    if (me.value.elements[cmdId]) {
                        var cmd = me.value.elements[cmdId];
                        me.bpmnCommands.push(cmd);
                    }
                });

                me.bpmnDialog = true;
            },
            conversionBpmn(command) {
                var me = this;

                var bpmnId = command.elementView.id.replaceAll("-", "");
                if (me.value.bpmnProjectId || me.value.bpmnProjects) {
                    delete me.value.bpmnProjectId;
                    delete me.value.bpmnProjects;
                }
                // open new tab
                window.open("#/bpmn/" + bpmnId, "_blank");

                // setting data
                var projectData = {
                    projectId: me.projectId,
                    projectName: me.projectName,
                };

                var modelForElements = {
                    BoundedContext: [],
                    Command: [],
                    Event: [],
                    Policy: [],
                    Relation: [],
                };

                // command
                modelForElements.Command.push(command);

                // event (command -> event)
                Object.values(me.value.relations).forEach(function (relation) {
                    if (relation) {
                        if (
                            relation.sourceElement._type.endsWith("Command") &&
                            relation.sourceElement.name == command.name &&
                            relation.sourceElement.elementView.id ==
                            command.elementView.id &&
                            relation.targetElement._type.endsWith("Event")
                        ) {
                            modelForElements.Event.push(relation.targetElement);
                            modelForElements.Relation.push(relation);
                        }
                    }
                });

                // policy (event -> policy)
                Object.values(me.value.relations).forEach(function (relation) {
                    if (relation) {
                        modelForElements.Event.forEach(function (event) {
                            if (
                                relation.sourceElement._type.endsWith("Event") &&
                                relation.sourceElement.name == event.name &&
                                relation.sourceElement.elementView.id ==
                                event.elementView.id &&
                                relation.targetElement._type.endsWith("Policy")
                            ) {
                                modelForElements.Policy.push(
                                    relation.targetElement
                                );
                                modelForElements.Relation.push(relation);
                            }
                        });
                    }
                });

                // command (policy -> command)
                modelForElements.Policy.forEach(function (policy) {
                    Object.values(me.value.elements).forEach(function (element) {
                        if (element) {
                            if (element._type.endsWith("Command")) {
                                if (isAttached(policy, element)) {
                                    modelForElements.Command.push(element);
                                    modelForElements.Relation.push({
                                        sourceElement: policy,
                                        targetElement: element,
                                    });
                                }
                            }
                        }
                    });
                });

                // event (policy -> event)
                Object.values(me.value.relations).forEach(function (relation) {
                    if (relation) {
                        modelForElements.Policy.forEach(function (policy) {
                            if (
                                relation.sourceElement._type.endsWith("Policy") &&
                                relation.sourceElement.name == policy.name &&
                                relation.sourceElement.elementView.id ==
                                policy.elementView.id &&
                                relation.targetElement._type.endsWith("Event")
                            ) {
                                modelForElements.Event.push(relation.targetElement);
                                modelForElements.Relation.push(relation);
                            }
                        });
                    }
                });
                // event (command -> event)
                Object.values(me.value.relations).forEach(function (relation) {
                    if (relation) {
                        modelForElements.Command.forEach(function (cmd) {
                            if (
                                relation.sourceElement._type.endsWith("Command") &&
                                relation.sourceElement.name == cmd.name &&
                                relation.sourceElement.elementView.id ==
                                cmd.elementView.id &&
                                relation.targetElement._type.endsWith("Event") &&
                                cmd.name != command.name &&
                                cmd.elementView.id != command.elementView.id
                            ) {
                                modelForElements.Event.push(relation.targetElement);
                                modelForElements.Relation.push(relation);
                            }
                        });
                    }
                });

                // BoundedContext
                var bcList = [];
                Object.values(me.value.elements).forEach(function (element) {
                    if (element) {
                        if (element._type.endsWith("BoundedContext")) {
                            modelForElements.Command.forEach(function (cmd) {
                                if (isAttached(element, cmd)) {
                                    bcList.push(element.elementView.id);
                                }
                            });

                            modelForElements.Event.forEach(function (event) {
                                if (isAttached(element, event)) {
                                    bcList.push(element.elementView.id);
                                }
                            });

                            modelForElements.Policy.forEach(function (policy) {
                                if (isAttached(outer, policy)) {
                                    bcList.push(element.elementView.id);
                                }
                            });
                        }
                    }
                });

                bcList = [...new Set(bcList)];
                bcList.forEach(function (bcId) {
                    if (me.value.elements[bcId]) {
                        var bc = me.value.elements[bcId];
                        modelForElements.BoundedContext.push(bc);
                    }
                });

                projectData["value"] = modelForElements;
                localStorage.setItem(bpmnId + "_es", JSON.stringify(projectData));

                me.bpmnDialog = false;
            },
        },
    };
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    .eventstorming-mobile-home-button {
        display: none;
    }
    .mobile-btn {
        margin: 6px -5px 0px -5px;
    }
    .input-name {
        background-color: #ffffff;
        full-width: 10px;
    }
    .base-template-in-list-style:hover {
        background-color: rgba(0, 0, 0, 0.04);
    }
    .canvas-panel {
        top: 0;
        bottom: 0;
        left: 10;
        right: 0;
        /*position: relative;*/
        position: absolute;
        overflow: hidden;
        width: 100%;
        height: 100%;

        .fullcanvas {
            position: relative;
            width: 100%;
            height: 100%;
            top: 10%;
            left: 0;
            overflow: hidden;
        }

        .fullcanvashands {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 10%;
            left: 0;
            overflow: hidden;
            cursor: url("../../../../public/static/image/symbol/hands.png"), auto;
        }

        .toolsSide {
            position: absolute;
            width: 100px;
            left: 20px;
            top: 20px;
            padding: 4px;
            overflow: hidden;

            .icons {
                margin-top: 5px;
                margin-bottom: 5px;
            }

            .hands {
                margin-top: 5px;
                margin-bottom: 5px;
            }
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

            .hands {
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

            .hands {
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
                color: #1a76d2;
            }
        }

        .hands {
            cursor: pointer;
            font-size: 30px;
            color: #ffc124;
        }

        .export,
        .history,
        .import,
        .save {
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

    .text-reader input[type="file"] {
        /* 파일 필드 숨기기 */
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
    }

    /* The whole thing */
    .custom-menu {
        display: none;
        z-index: 1000;
        position: absolute;
        overflow: hidden;
        border: 1px solid #ccc;
        white-space: nowrap;
        font-family: sans-serif;
        background: #fff;
        color: #333;
        border-radius: 5px;
        padding: 0;
    }

    /* Each of the items in the list */
    .custom-menu li {
        padding: 8px 12px;
        cursor: pointer;
        list-style-type: none;
        transition: all 0.3s ease;
        user-select: none;
    }

    .custom-menu li:hover {
        background-color: #def;
    }

    /*.moveable-line.moveable-rotation-line {*/
    /*    height: 40px;*/
    /*    width: 1px;*/
    /*    transform-origin: 0.5px 39.5px;*/
    /*}*/

    /*.moveable {*/
    /*    font-family: "Roboto", sans-serif;*/
    /*    position: relative;*/
    /*    width: 400px;*/
    /*    height: 130px;*/
    /*    text-align: center;*/
    /*    font-size: 40px;*/
    /*    margin: 0 auto;*/
    /*    font-weight: 100;*/
    /*    letter-spacing: 1px;*/
    /*    background: white;*/
    /*}*/

    .video-list {
        height: 160px;
        width: auto;
        margin-left: 2px;
        background: transparent;
    }

    .video-list div {
        padding: 2px;
    }

    .video-item {
        display: inline-block;
        padding: 2px;
    }

    .rtc {
        .button {
            color: red;
        }

        .buttonHover {
            background-color: white;
        }

        .content {
            background-color: white;
        }

        .titlebar {
            background-color: white;
        }
    }

    .codeModal {
        display: none; /* Hidden by default */
        position: fixed; /* Stay in place */
        z-index: 10; /* Sit on top */
        left: 0;
        top: 0;
        width: 100%; /* Full width */
        height: 100%; /* Full height */
        overflow: auto; /* Enable scroll if needed */
        background-color: rgb(0, 0, 0); /* Fallback color */
        background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
    }

    .topping-radio-group label {
        font-size: 12px;
    }

    .topping-radio-group .topping-checkbox {
        margin-top: -25px;
    }

    .page {
        height: 100%;
        /*padding: 10px;*/
        background: #000;
    }

    .es-modeling-project-name {
        margin: 20px 0px 0px 5px !important;
        max-width: 150px !important;
    }

    .es-hide-k8s,
    .es-hide-view,
    .es-hide-replay,
    .es-hide-fork,
    .es-hide-join,
    .es-hide-save,
    .es-hide-share,
    .es-hide-code {
        display: block;
    }

    .es-is-mobile {
        display: none !important;
    }

    @media only screen and (max-width: 1430px) {
        .es-hide-k8s,
        .es-hide-view,
        .es-hide-replay,
        .es-hide-fork,
        .es-hide-join,
        .es-hide-save,
        .es-hide-share,
        .es-hide-code {
            display: none;
        }
        .es-hide-k8s-btn,
        .es-hide-view-btn,
        .es-hide-replay-btn,
        .es-hide-fork-btn,
        .es-hide-join-btn,
        .es-hide-save-btn,
        .es-hide-share-btn,
        .es-hide-code-btn {
            min-width: 10px !important;
            max-width: 10px !important;
        }
    }

    @media only screen and (max-width: 1020px) {
        .es-is-mobile {
            display: block !important;
            margin-top: 100px;
            min-width: 100%;
            margin-left: 10%;
        }
        .es-is-not-mobile {
            display: none !important;
        }
        .es-is-mobile-project-name {
            position: absolute !important;
            right: 120px !important;
        }
    }

    .mouse-cursor {
        // 마우스를 따라다니는 원 설정

        position: absolute;

        top: 0; // 초기 위치값을 설정해줍니다.

        left: 0; // 초기 위치값을 설정해줍니다.

        width: 10px; //원 가로사이즈

        height: 10px; //원 세로사이즈

        border-radius: 50%; // 원의 형태설정

        background-color: #9bf50b; //원 컬러설정

        transform: translate(
                        -50%,
                        -50%
        ); // 원을 정가운데로 맞추기위해서 축을-50%이동해줍니다.

        transition: all 300ms linear 0s; //soft

        opacity: 50%;
    }

    .mouse-cursor::after {
        width: 40px;
        height: 40px;
        border: 15px solid rgba(var(--white-rbg-color), 0.2);
        border-radius: 50%;
        position: absolute;
        top: -25px;
        left: -25px;
        animation: cursor-animate-2 550ms infinite alternate;
    }

    .mouse-cursor-name {
        position: absolute;
        top: 5px;
        left: 10px;
        width: max-content;
        text-align: center;
        color: #9bf50b;
    }
    .mobile-first-sticker-tools {
        display: none;
    }
    .mobile-second-sticker-tools {
        display: none;
    }

    @media only screen and (max-width: 600px) {
        .es-modeling-project-name {
            margin: 20px -60px 0px 5px !important;
            max-width: 110px !important;
        }

        .es-is-mobile-project-name {
            position: absolute !important;
            left: 10px !important;
        }

        .gs-modeling-undo-redo{
            margin: 5px 0px 0px 15px !important;
        }
        .tools {
            display: none;
        }

        .mobile-first-sticker-tools {
            display: flex;
            flex-direction: row; /* 가로로 배치하도록 설정 */
            align-items: center; /* 수평 가운데 정렬 */
            position: fixed;
            bottom: 100px;
            left: 50%;
            overflow: hidden;
            transform: translate(-50%, -50%);
        }
        .mobile-second-sticker-tools {
            display: flex;
            flex-direction: row; /* 가로로 배치하도록 설정 */
            align-items: center; /* 수평 가운데 정렬 */
            position: fixed;
            bottom: 57px;
            left: 50%;
            overflow: hidden;
            transform: translate(-50%, -50%);
        }
        .eventstorming-mobile-home-button {
            display: block;
            z-index:1;
        }
    }
</style>
