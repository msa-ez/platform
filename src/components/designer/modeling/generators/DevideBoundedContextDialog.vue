<template>
    <v-card :key="`bounded-context-${messageId}`">
        <v-card-title>
            {{ $t('DevideBoundedContextDialog.boundedContextDivisionResult') }}
            <v-btn v-if="isGeneratingBoundedContext" text color="primary" @click="stop()">Stop</v-btn>
            <!-- <v-btn :style="{'margin-left': 'auto'}" icon @click="closeDialog()">
                <v-icon>mdi-close</v-icon>
            </v-btn> -->
        </v-card-title>

        <v-tabs 
            v-model="activeTab" 
            v-if="Object.keys(resultDevideBoundedContext).length > 1"
        >
            <v-tab 
                v-for="(_, index) in Object.keys(resultDevideBoundedContext)" 
                :key="index"
            >
                version {{ index + 1 }}
            </v-tab>
        </v-tabs>

        <!-- 최초 1개 결과인 경우 -->
        <template v-if="Object.keys(resultDevideBoundedContext).length === 1 || Object.keys(resultDevideBoundedContext).length === 0">
            <v-card-subtitle>
                <div v-if="Object.keys(resultDevideBoundedContext).length > 0">
                    <p class="mb-0">{{ Object.keys(resultDevideBoundedContext)[0] }}</p>
                </div>
            </v-card-subtitle>

            <v-card-subtitle>
                <div class="d-flex align-center">
                    <div v-if="isGeneratingBoundedContext">
                        <p class="mb-0">{{ $t('DevideBoundedContextDialog.lodingMessage') }} ({{ currentGeneratedLength }} Text generated.)</p>
                    </div>
                    <v-progress-circular
                        v-if="isGeneratingBoundedContext"
                        color="primary"
                        indeterminate
                        size="24"
                        class="ml-2"
                    ></v-progress-circular>
                </div>
            </v-card-subtitle>

            <v-card-subtitle v-if="resultDevideBoundedContext[selectedAspect]">
                <div v-if="resultDevideBoundedContext[selectedAspect].cotThink">
                    <v-card-title class="text-subtitle-1 pa-0 font-weight-bold d-flex align-center">
                        <v-icon color="primary" class="mr-2">mdi-thought-bubble</v-icon>
                        AI's Thought
                    </v-card-title>
                    <v-expansion-panels flat>
                        <v-expansion-panel>
                            <v-expansion-panel-header class="py-1">
                                <template v-slot:default="{ open }">
                                    <v-row no-gutters>
                                        <v-col class="d-flex align-center">
                                            <v-icon 
                                                color="primary" 
                                                class="mr-2"
                                            >
                                                {{ open ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
                                            </v-icon>
                                            {{ open ? 'Hide details' : 'Show details' }}
                                        </v-col>
                                    </v-row>
                                </template>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content class="pa-4 grey lighten-4">
                                {{ resultDevideBoundedContext[selectedAspect].cotThink }}
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </div>
            </v-card-subtitle>

            <v-card-text v-if="Object.keys(resultDevideBoundedContext).length > 0">
                <!-- <div v-if="resultDevideBoundedContext[selectedAspect].cotThink">
                    <v-card-title class="text-subtitle-1 pa-0 font-weight-bold d-flex align-center">
                        <v-icon color="primary" class="mr-2">mdi-thought-bubble</v-icon>
                        AI's Thought
                    </v-card-title>
                    <v-expansion-panels flat>
                        <v-expansion-panel>
                            <v-expansion-panel-header class="py-1">
                                <template v-slot:default="{ open }">
                                    <v-row no-gutters>
                                        <v-col class="d-flex align-center">
                                            <v-icon 
                                                color="primary" 
                                                class="mr-2"
                                            >
                                                {{ open ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
                                            </v-icon>
                                            {{ open ? 'Hide details' : 'Show details' }}
                                        </v-col>
                                    </v-row>
                                </template>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content class="pa-4 grey lighten-4">
                                {{ resultDevideBoundedContext[selectedAspect].cotThink }}
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </div> -->
                <div style="text-align: center;">
                    <vue-mermaid
                        :id="`mermaid-${messageId}-${renderKey}`"
                        :key="`mermaid-${messageId}-${renderKey}`"
                        :nodes="mermaidNodes"
                        type="graph TD"
                        @nodeClick="editNode"
                        :config="config"
                    ></vue-mermaid>
                </div>

                <div style="text-align: center;">
                    <BoundedContextMatrix 
                        :boundedContexts="resultDevideBoundedContext[selectedAspect].boundedContexts" 
                    />
                </div>
                
                <div>
                    <v-card-title class="text-subtitle-1 pa-0 font-weight-bold">{{ $t('DevideBoundedContextDialog.reasonOfSeparation') }}</v-card-title>
                    <v-card-text class="pa-0 pb-4" align="left">{{ resultDevideBoundedContext[selectedAspect].thoughts }}</v-card-text>

                    <v-card-title v-if="summarizedResult.length > 0" class="pa-0 pb-0 text-subtitle-1">{{ $t('DevideBoundedContextDialog.summarizedResult') }}</v-card-title>
                    <v-card-text v-if="summarizedResult.length > 0" class="pa-0 pb-4" align="left">{{ summarizedResult }}</v-card-text>

                    <v-card-title class="pa-0 pb-0 text-subtitle-1 font-weight-bold">{{ $t('DevideBoundedContextDialog.descriptionOfEachBoundedContext') }}</v-card-title>
                    <v-card-text class="pa-0" align="left">* {{ $t('DevideBoundedContextDialog.descriptionOfEditBoundedContext') }}</v-card-text>
                    <v-card class="pa-0 ma-0 mt-4" outlined>
                        <v-data-table
                            :items="getGroupedBoundedContextRequirements()"
                            :headers="boundedContextHeaders"
                            :hide-default-footer="true"
                            :items-per-page="-1"
                            show-expand
                            :single-expand="false"
                            item-key="name"
                            :key="tableRenderKey"
                        >
                            <template v-slot:item="{ item, expand, isExpanded }">
                                <tr :class="{'processing-row': isProcessingBC(item)}">
                                    <td>
                                        <v-edit-dialog
                                            :return-value.sync="item.name"
                                            @save="saveItemEdit(item, 'name')"
                                            @open="initializeEditFields(item)"
                                            @cancel="cancelEdit(item)"
                                            large
                                            persistent
                                        >
                                            <template v-slot:input>
                                                <v-text-field v-model="editedFields.name"
                                                    :label="$t('DevideBoundedContextDialog.edit.boundedContextName')"
                                                    :rules="[v => !!v || $t('validation.required')]"
                                                    single-line
                                                    class="mb-2"
                                                ></v-text-field>
                                                <v-text-field v-model="editedFields.alias"
                                                    :label="$t('DevideBoundedContextDialog.edit.boundedContextAlias')"
                                                    :rules="[v => !!v || $t('validation.required')]"
                                                    single-line
                                                ></v-text-field>
                                            </template>
                                            <span>{{ item.name }}</span>
                                        </v-edit-dialog>
                                    </td>
                                    <td>{{ item.role }}</td>
                                    <td>
                                        <v-select
                                            v-model="item.importance"
                                            :items="importances"
                                            :label="$t('DevideBoundedContextDialog.edit.importance')"
                                            single-line
                                            @change="saveItemEdit(item, 'importance')"
                                        ></v-select>
                                    </td>
                                    <td>
                                        <v-select
                                            v-model="item.implementationStrategy"
                                            :items="getImplementationStrategies(item.importance)"
                                            :label="$t('DevideBoundedContextDialog.edit.implementationStrategy')"
                                            single-line
                                            @change="saveItemEdit(item, 'implementationStrategy')"
                                        ></v-select>
                                    </td>
                                    <td class="actions-cell">
                                        <v-btn
                                            icon
                                            small
                                            color="error"
                                            @click="deleteBoundedContext(item)"
                                        >
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-btn
                                                    small
                                                    class="expand-button"
                                                    text
                                                    v-bind="attrs"
                                                    v-on="on"
                                                    @click="expand(!isExpanded)"
                                                    v-if="item.requirements && item.requirements.length > 0"
                                                    style="margin-left: 12px; min-width: 0; padding: 0 8px; display: flex; align-items: center;"
                                                >
                                                    <v-icon left>{{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                                                    <span style="font-size: 13px; font-weight: 500;">View Requirements</span>
                                                </v-btn>
                                            </template>
                                            <span>Show or hide requirements for this Bounded Context</span>
                                        </v-tooltip>
                                    </td>
                                    <td v-if="isProcessingBC(item)" class="progress-cell">
                                        <div class="progress-container">
                                            <v-progress-linear
                                                :value="processingRate"
                                                height="4"
                                                color="primary"
                                                class="mt-2"
                                            ></v-progress-linear>
                                            <div class="progress-text">{{ processingRate }}%</div>
                                        </div>
                                    </td>
                                </tr>
                            </template>

                            <template v-slot:expanded-item="{ headers, item }">
                                <td :colspan="headers.length">
                                    <v-simple-table dense class="requirement-subtable">
                                        <tbody>
                                            <tr v-for="req in item.requirements" :key="req.type">
                                                <td class="requirement-type" width="100">{{ req.type }}</td>
                                                <td class="requirement-text" v-html="convertText(req.text)"></td>
                                            </tr>
                                        </tbody>
                                    </v-simple-table>
                                </td>
                            </template>
                        </v-data-table>
                    </v-card>
                    <v-card class="pa-0 ma-0 mt-4" outlined>
                        <v-card-title class="text-subtitle-1 pa-4">{{ $t('DevideBoundedContextDialog.relations') }}</v-card-title>
                        <v-data-table 
                            :items="resultDevideBoundedContext[selectedAspect].explanations" 
                            :headers="explanationsHeaders" 
                            :hide-default-footer="true"
                        ></v-data-table>
                    </v-card>
                </div>

                <v-card class="mt-4 pa-4" outlined>
                    <v-textarea v-model="feedback" 
                        :disabled="isGeneratingBoundedContext" 
                        :label="$t('DevideBoundedContextDialog.feedback')"
                        rows="3"
                        outlined
                        auto-grow
                    ></v-textarea>
                    <v-row class="pa-0 ma-0">
                        <v-spacer></v-spacer>
                        <v-btn :disabled="feedback === '' || isGeneratingBoundedContext || isStartMapping" class="auto-modeling-btn" @click="reGenerateWithFeedback()">
                            {{ $t('DevideBoundedContextDialog.reGenerate') }} 
                        </v-btn>
                    </v-row>
                </v-card>
                <v-row class="pa-0 ma-0 pt-4">
                    <v-spacer></v-spacer>
                    <!-- <v-btn @click="reGenerate()"
                        :disabled="isGeneratingBoundedContext || isStartMapping"
                    >
                        <v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>{{ $t('DevideBoundedContextDialog.reGenerate') }}
                    </v-btn> -->
                    <div v-if="isStartMapping">
                        <p class="mb-0">{{ currentProcessingBoundedContext }} - {{ $t('DevideBoundedContextDialog.mappingMessage') }} ({{ processingRate }}%)</p>
                    </div>
                    <v-progress-circular
                        v-if="isStartMapping"
                        color="primary"
                        indeterminate
                        size="24"
                        class="ml-2"
                    ></v-progress-circular>
                    <v-btn 
                        :disabled="isGeneratingBoundedContext || isStartMapping || !isEditable" 
                        class="auto-modeling-btn" 
                        color="primary" 
                        @click="createModel()"
                    >
                        {{ $t('DevideBoundedContextDialog.createAggregateDraft') }}
                    </v-btn>
                </v-row>
            </v-card-text>
        </template>

        <!-- 여러 결과인 경우 -->
        <v-tabs-items 
            v-model="activeTab"
            v-else-if="Object.keys(resultDevideBoundedContext).length > 1"
        >
            <v-tab-item 
                v-for="(aspect, index) in Object.keys(resultDevideBoundedContext)"
                :key="index"
            >

                <!-- <v-card-subtitle>
                    <div v-if="Object.keys(resultDevideBoundedContext).length > 0">
                        <p class="mb-0">{{ resultDevideBoundedContext[aspect].devisionAspect }}</p>
                    </div>
                </v-card-subtitle> -->

                <v-card-subtitle>
                    <div class="d-flex align-center">
                        <div v-if="isGeneratingBoundedContext">
                            <p class="mb-0">{{ $t('DevideBoundedContextDialog.lodingMessage') }} ({{ currentGeneratedLength }} Text generated.)</p>
                        </div>
                        <v-progress-circular
                            v-if="isGeneratingBoundedContext"
                            color="primary"
                            indeterminate
                            size="24"
                            class="ml-2"
                        ></v-progress-circular>
                    </div>
                </v-card-subtitle>

                <v-card-text v-if="Object.keys(resultDevideBoundedContext).length > 0">
                    <div style="text-align: center;">
                        <vue-mermaid
                            :id="`mermaid-${messageId}-${index}-${renderKey}`"
                            :key="`mermaid-${messageId}-${index}-${renderKey}`"
                            :nodes="getMermaidNodesForAspect(aspect)"
                            type="graph TD"
                            @nodeClick="editNode"
                            :config="config"
                        ></vue-mermaid>
                    </div>

                    <div style="text-align: center;">
                        <BoundedContextMatrix 
                            :boundedContexts="resultDevideBoundedContext[aspect].boundedContexts" 
                        />
                    </div>
                    
                    <div>
                        <v-card-title class="text-subtitle-1 pa-0 font-weight-bold">{{ $t('DevideBoundedContextDialog.reasonOfSeparation') }}</v-card-title>
                        <v-card-text class="pa-0 pb-4" align="left">{{ resultDevideBoundedContext[aspect].thoughts }}</v-card-text>

                        <v-card-title v-if="summarizedResult.length > 0" class="pa-0 pb-0 text-subtitle-1">{{ $t('DevideBoundedContextDialog.summarizedResult') }}</v-card-title>
                        <v-card-text v-if="summarizedResult.length > 0" class="pa-0 pb-4" align="left">{{ summarizedResult }}</v-card-text>

                        <v-card-title class="pa-0 pb-0 text-subtitle-1 font-weight-bold">{{ $t('DevideBoundedContextDialog.descriptionOfEachBoundedContext') }}</v-card-title>
                        <v-card-text class="pa-0" align="left">* {{ $t('DevideBoundedContextDialog.descriptionOfEditBoundedContext') }}</v-card-text>
                        <v-card class="pa-0 ma-0 mt-4" outlined>
                            <v-data-table
                                :items="getGroupedBoundedContextRequirements(aspect)"
                                :headers="boundedContextHeaders"
                                :hide-default-footer="true"
                                :items-per-page="-1"
                                show-expand
                                :single-expand="false"
                                item-key="name"
                                :key="tableRenderKey"
                            >
                                <template v-slot:item="{ item, expand, isExpanded }">
                                    <tr :class="{'processing-row': isProcessingBC(item)}">
                                        <td>
                                            <v-edit-dialog
                                                :return-value.sync="item.name"
                                                @save="saveItemEdit(item, 'name')"
                                                @open="initializeEditFields(item)"
                                                @cancel="cancelEdit(item)"
                                                large
                                                persistent
                                            >
                                                <template v-slot:input>
                                                    <v-text-field v-model="editedFields.name"
                                                        :label="$t('DevideBoundedContextDialog.edit.boundedContextName')"
                                                        :rules="[v => !!v || $t('validation.required')]"
                                                        single-line
                                                        class="mb-2"
                                                    ></v-text-field>
                                                    <v-text-field v-model="editedFields.alias"
                                                        :label="$t('DevideBoundedContextDialog.edit.boundedContextAlias')"
                                                        :rules="[v => !!v || $t('validation.required')]"
                                                        single-line
                                                    ></v-text-field>
                                                </template>
                                                <span>{{ item.name }}</span>
                                            </v-edit-dialog>
                                        </td>
                                        <td>{{ item.role }}</td>
                                        <td>
                                            <v-select
                                                v-model="item.importance"
                                                :items="importances"
                                                :label="$t('DevideBoundedContextDialog.edit.importance')"
                                                single-line
                                                @change="saveItemEdit(item, 'importance')"
                                            ></v-select>
                                        </td>
                                        <td>
                                            <v-select
                                                v-model="item.implementationStrategy"
                                                :items="getImplementationStrategies(item.importance)"
                                                :label="$t('DevideBoundedContextDialog.edit.implementationStrategy')"
                                                single-line
                                                @change="saveItemEdit(item, 'implementationStrategy')"
                                            ></v-select>
                                        </td>
                                        <td class="actions-cell">
                                            <v-btn
                                                icon
                                                small
                                                color="error"
                                                @click="deleteBoundedContext(item)"
                                            >
                                                <v-icon>mdi-delete</v-icon>
                                            </v-btn>
                                            <v-tooltip bottom>
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-btn
                                                        small
                                                        class="expand-button"
                                                        text
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        @click="expand(!isExpanded)"
                                                        v-if="item.requirements && item.requirements.length > 0"
                                                        style="margin-left: 12px; min-width: 0; padding: 0 8px; display: flex; align-items: center;"
                                                    >
                                                        <v-icon left>{{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                                                        <span style="font-size: 13px; font-weight: 500;">View Requirements</span>
                                                    </v-btn>
                                                </template>
                                                <span>Show or hide requirements for this Bounded Context</span>
                                            </v-tooltip>
                                        </td>
                                        <td v-if="isProcessingBC(item)" class="progress-cell">
                                            <div class="progress-container">
                                                <v-progress-linear
                                                    :value="processingRate"
                                                    height="4"
                                                    color="primary"
                                                    class="mt-2"
                                                ></v-progress-linear>
                                                <div class="progress-text">{{ processingRate }}%</div>
                                            </div>
                                        </td>
                                    </tr>
                                </template>

                                <template v-slot:expanded-item="{ headers, item }">
                                    <td :colspan="headers.length">
                                        <v-simple-table dense class="requirement-subtable">
                                            <tbody>
                                                <tr v-for="req in item.requirements" :key="req.type">
                                                    <td class="requirement-type" width="100">{{ req.type }}</td>
                                                    <td class="requirement-text" v-html="convertText(req.text)"></td>
                                                </tr>
                                            </tbody>
                                        </v-simple-table>
                                    </td>
                                </template>
                            </v-data-table>
                        </v-card>
                        <v-card class="pa-0 ma-0 mt-4" outlined>
                            <v-card-title class="text-subtitle-1 pa-4">{{ $t('DevideBoundedContextDialog.relations') }}</v-card-title>
                            <v-data-table 
                                :items="resultDevideBoundedContext[aspect].explanations" 
                                :headers="explanationsHeaders" 
                                :hide-default-footer="true"
                            ></v-data-table>
                        </v-card>
                    </div>

                    <v-card class="mt-4 pa-4" outlined>
                        <v-textarea v-model="feedback" 
                            :disabled="isGeneratingBoundedContext" 
                            :label="$t('DevideBoundedContextDialog.feedback')"
                            rows="3"
                            outlined
                            auto-grow
                        ></v-textarea>
                        <v-row class="pa-0 ma-0">
                            <v-spacer></v-spacer>
                            <v-btn :disabled="feedback === '' || isGeneratingBoundedContext || isStartMapping || !isEditable" class="auto-modeling-btn" @click="reGenerateWithFeedback()">
                                {{ $t('DevideBoundedContextDialog.reGenerate') }} 
                            </v-btn>
                        </v-row>
                    </v-card>
                    <v-row class="pa-0 ma-0 pt-4">
                        <v-spacer></v-spacer>
                            <!-- <v-btn @click="reGenerate()"
                                :disabled="isGeneratingBoundedContext || isStartMapping"
                            >
                                <v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>{{ $t('DevideBoundedContextDialog.reGenerate') }}
                            </v-btn> -->
                            <div v-if="isStartMapping">
                                <p class="mb-0">{{ currentProcessingBoundedContext }} - {{ $t('DevideBoundedContextDialog.mappingMessage') }} ({{ processingRate }}%)</p>
                            </div>
                            <v-progress-circular
                                v-if="isStartMapping"
                                color="primary"
                                indeterminate
                                size="24"
                                class="ml-2"
                            ></v-progress-circular>
                            <v-btn 
                                :disabled="isGeneratingBoundedContext || isStartMapping || isAnalizing || isSummarizeStarted || !isEditable" 
                                class="auto-modeling-btn" 
                                color="primary" 
                                @click="createModel(aspect)"
                            >
                                {{ $t('DevideBoundedContextDialog.createAggregateDraft') }}
                            </v-btn>
                    </v-row>
                </v-card-text>
            </v-tab-item>
        </v-tabs-items>
    </v-card>
</template>

<script>
    import VueMermaid from '@/components/VueMermaid.vue';
    import BoundedContextMatrix from './BoundedContextMatrix.vue';

    export default {
        name: 'devide-bounded-context-dialog',
        props: {
            resultDevideBoundedContext: {
                type: Object,
                default: () => ({}),
                required: false
            },
            isStartMapping: {
                type: Boolean,
                default: () => false,
                required: false
            },
            isGeneratingBoundedContext: {
                type: Boolean,
                default: () => false,
                required: false
            },
            isAnalizing: {
                type: Boolean,
                default: () => false,
                required: false
            },
            isSummarizeStarted: {
                type: Boolean,
                default: () => false,
                required: false
            },
            processingRate: {
                type: Number,
                default: () => 0,
                required: false
            },
            currentProcessingBoundedContext: {
                type: String,
                default: () => "",
                required: false
            },
            selectedAspect: {
                type: String,
                default: () => "",
                required: false
            },
            summarizedResult: {
                type: String,
                default: () => "",
                required: false
            },
            messageId: {
                type: String,
                default: () => "",
                required: false
            },
            pbcLists: {
                type: Array,
                default: () => [],
                required: false
            },
            isEditable: {
                type: Boolean,
                default: () => false,
                required: false
            },
            currentGeneratedLength: {
                type: Number,
                required: false,
                default: 0
            }
        },
        components: {
            VueMermaid,
            BoundedContextMatrix
        },
        data() {
            return {
                activeTab: null,
                mermaidNodes: [],
                config: {
                    theme: 'default',
                    startOnLoad: false,
                    securityLevel: 'loose',
                    flowchart: {
                        htmlLabels: true,
                        curve: 'basis',
                        rankSpacing: 100,
                        nodeSpacing: 100,
                        padding: 15
                    },
                    themeVariables: {
                        'groupBkgColor': '#fff',
                        'groupBorderColor': '#666',
                        'groupBorderWidth': '2px',
                        'groupPadding': 20
                    }
                },
                selectedResultDevideBoundedContext: {},
                feedback: '',
                expandIcon: 'mdi-chevron-down',
                boundedContextHeaders: [
                    { text: this.$t('DevideBoundedContextDialog.boundedContextName'), value: 'name' },
                    { text: this.$t('DevideBoundedContextDialog.role'), value: 'role' },
                    { text: this.$t('DevideBoundedContextDialog.importance'), value: 'importance' },
                    { text: this.$t('DevideBoundedContextDialog.implementationStrategy'), value: 'implementationStrategy' },
                    { text: '', value: 'data-table-expand' },
                    { text: '', value: 'actions' },
                ],
                requirementHeaders: [
                    { text: this.$t('DevideBoundedContextDialog.boundedContextName'), value: 'name' },
                    { text: this.$t('DevideBoundedContextDialog.requirements'), value: 'requirements' }
                ],
                explanationsHeaders: [
                    { text: this.$t('DevideBoundedContextDialog.sourceContext'), value: 'sourceContext' },
                    { text: this.$t('DevideBoundedContextDialog.targetContext'), value: 'targetContext' },
                    { text: this.$t('DevideBoundedContextDialog.relationType'), value: 'relationType' },
                    { text: this.$t('DevideBoundedContextDialog.reason'), value: 'reason' },
                    { text: this.$t('DevideBoundedContextDialog.interactionPattern'), value: 'interactionPattern' }
                ],
                renderKey: 0,
                tableRenderKey: 0,

                editedFields: {
                    name: '',
                    alias: '',
                    importance: '',
                    implementationStrategy: ''
                },
                currentEditItem: null,

                importances: [
                    { text: 'Core Domain', value: 'Core Domain' },
                    { text: 'Supporting Domain', value: 'Supporting Domain' },
                    { text: 'Generic Domain', value: 'Generic Domain' }
                ],
                implementationStrategies: [
                    { text: 'Event Sourcing', value: 'Event Sourcing' },
                    { text: 'Rich Domain Model', value: 'Rich Domain Model' },
                    { text: 'Transaction Script', value: 'Transaction Script' },
                    { text: 'Active Record', value: 'Active Record' },
                    { divider: true },
                    ...this.pbcLists.map(pbc => ({
                        text: `PBC: ${pbc.name}`,
                        value: `PBC: ${pbc.name}`
                    }))
                ],
                activeTab: 0
            }
        },
        mounted() {
            if(Object.keys(this.resultDevideBoundedContext).length > 0) {
                this.mermaidNodes = this.generateNodes(this.resultDevideBoundedContext[this.selectedAspect]);
                this.renderKey++;
                this.tableRenderKey++;
            }
        },
        watch: {
            resultDevideBoundedContext: {
                handler(newVal) {
                    const allAspectKeys = Object.keys(newVal);
                    let aspectKeyForMermaid;

                    if (allAspectKeys.length === 0) {
                        this.mermaidNodes = [];
                    } else {
                        // Determine the aspect key for Mermaid logic
                        // For multiple tabs, use activeTab. For single, use selectedAspect or first key.
                        if (allAspectKeys.length > 1) {
                            aspectKeyForMermaid = allAspectKeys[this.activeTab || 0];
                        } else { // Single aspect in results
                            aspectKeyForMermaid = this.selectedAspect || allAspectKeys[0];
                        }
                        
                        if (newVal[aspectKeyForMermaid]) {
                            const data = newVal[aspectKeyForMermaid];
                            this.mermaidNodes = this.generateNodes({ boundedContexts: data.boundedContexts || [], relations: data.relations || [] });
                        } else {
                             // Fallback if the determined key somehow doesn't exist (e.g. during rapid changes)
                            this.mermaidNodes = [];
                        }
                    }
                    this.renderKey++; // For mermaid re-render

                    // Always increment tableRenderKey to ensure table updates its rows and icons
                    this.tableRenderKey++;
                },
                deep: true
            },

            activeTab: {
                handler(newTabIndex) {
                    this.$nextTick(() => {
                        const aspects = Object.keys(this.resultDevideBoundedContext);
                        if (aspects.length > newTabIndex) {
                            const currentAspectKey = aspects[newTabIndex];
                            if (this.resultDevideBoundedContext[currentAspectKey]) {
                                const aspectData = this.resultDevideBoundedContext[currentAspectKey];
                                this.mermaidNodes = this.generateNodes({ 
                                    boundedContexts: aspectData.boundedContexts || [], 
                                    relations: aspectData.relations || [] 
                                });
                                this.renderKey++; // For mermaid
                            }
                            this.tableRenderKey++; // Re-key table for new aspect's items
                            this.selectedAspect = currentAspectKey;
                            this.$emit('updateSelectedAspect', currentAspectKey);
                        }
                    });
                }
            }
        },
        methods: {
            generateNodes(result) {
                const nodes = [];
                const boundedContexts = result.boundedContexts || [];
                const relations = result.relations || [];
                
                // 도메인 타입별로 그룹화
                const domainGroups = {
                    'Core Domain': [],
                    'Supporting Domain': [],
                    'Generic Domain': []
                };

                // 노드 생성 및 그룹화
                boundedContexts.forEach((bc, index) => {
                    const node = {
                        id: `BC${index}`,
                        text: bc.alias.replace(/·/g, '/').replace(/\./g, '/'),
                        editable: true,
                        edgeType: 'stadium',
                        style: this.getDomainStyle(bc.importance),
                        group: bc.importance || 'Generic Domain',
                        next: [], // 초기화
                        link: []  // 초기화
                    };
                    nodes.push(node);
                    
                    if (bc.importance && domainGroups[bc.importance]) {
                        domainGroups[bc.importance].push(node);
                    } else {
                        domainGroups['Generic Domain'].push(node);
                    }
                });
                
                // 관계 정보 추가
                relations.forEach((rel) => {
                    const sourceIndex = boundedContexts.findIndex(bc => bc.name === rel.upStream.name);
                    const targetIndex = boundedContexts.findIndex(bc => bc.name === rel.downStream.name);
                    
                    if (sourceIndex !== -1 && targetIndex !== -1) {
                        const sourceNode = nodes[sourceIndex];
                        sourceNode.next.push(`BC${targetIndex}`);
                        sourceNode.link.push(`-->|"${rel.type}"|`);
                    }
                });

                return nodes;
            },

            editNode(node) {
                console.log("node clicked: ", node);
            },

            createModel(aspect){
                if(!aspect) {
                    aspect = Object.keys(this.resultDevideBoundedContext)[0];
                }

                const versionInfo = {
                    data: this.resultDevideBoundedContext[aspect],
                    version: this.activeTab + 1,
                    aspect: aspect
                };

                this.$emit("createModel", versionInfo);
            },

            closeDialog(){
                this.$emit("closeDialog");
            },

            stop(){
                this.mermaidNodes = [];
                this.renderKey++;
                this.$emit("stop");
            },

            reGenerate(){
                this.feedback = '';
                this.mermaidNodes = [];
                this.renderKey++;
                this.$emit("reGenerate");
            },

            reGenerateWithFeedback(){
                this.renderKey++;
                this.$emit("reGenerateWithFeedback", this.feedback, this.messageId);
                this.feedback = '';
            },

            getGroupedBoundedContextRequirements(aspect) {
                let keyToUse;
                const allAspectKeys = Object.keys(this.resultDevideBoundedContext);

                if (allAspectKeys.length === 0) return [];

                if (aspect) { // If aspect is provided (e.g., from v-for in tabs)
                    keyToUse = aspect;
                } else { // No aspect parameter, typically for single result display
                    keyToUse = this.selectedAspect; // Use the selectedAspect prop
                    // Fallback if selectedAspect is not a valid key in the current results
                    if (!this.resultDevideBoundedContext[keyToUse] && allAspectKeys.length > 0) {
                        keyToUse = allAspectKeys[0];
                    }
                }
    
                if (!this.resultDevideBoundedContext[keyToUse] || !this.resultDevideBoundedContext[keyToUse].boundedContexts) return [];
    
                return this.resultDevideBoundedContext[keyToUse].boundedContexts.map(bc => {
                    let requirementNumber = 1;
                    return {
                        name: bc.alias,
                        originalName: bc.name,
                        role: bc.role || '',
                        importance: bc.importance || '',
                        implementationStrategy: bc.implementationStrategy || '',
                        requirements: bc.requirements ? bc.requirements.map(req => ({
                            type: requirementNumber++,
                            text: this.convertText(req.text ? req.text.replace(/\n/g, '<br>') : req)
                        })) : [],
                    };
                });
            },

            saveItemEdit(item, field) {
                let key = this.selectedAspect;

                const boundedContextIndex = this.resultDevideBoundedContext[key].boundedContexts
                    .findIndex(bc => bc.alias === item.originalName || bc.alias === item.name);
                
                if (boundedContextIndex > -1) {
                    const boundedContext = this.resultDevideBoundedContext[key].boundedContexts[boundedContextIndex];
                    const oldName = boundedContext.name;
                    const oldAlias = boundedContext.alias;
                    
                    switch(field) {
                        case 'name':
                            if (!this.editedFields.name || !this.editedFields.alias) {
                                return;
                            }

                            this.resultDevideBoundedContext[key].relations = 
                                this.resultDevideBoundedContext[key].relations.map(relation => {
                                    if (relation.upStream.name === oldName || relation.upStream.alias === oldAlias) {
                                        relation.upStream.name = this.editedFields.name;
                                        relation.upStream.alias = this.editedFields.alias;
                                    }
                                    if (relation.downStream.name === oldName || relation.downStream.alias === oldAlias) {
                                        relation.downStream.name = this.editedFields.name;
                                        relation.downStream.alias = this.editedFields.alias;
                                    }
                                    return relation;
                                });

                            if (this.resultDevideBoundedContext[key].explanations) {
                                this.resultDevideBoundedContext[key].explanations = 
                                    this.resultDevideBoundedContext[key].explanations.map(explanation => {
                                        if (explanation.sourceContext === oldAlias) {
                                            explanation.sourceContext = this.editedFields.alias;
                                        }
                                        if (explanation.targetContext === oldAlias) {
                                            explanation.targetContext = this.editedFields.alias;
                                        }
                                        return explanation;
                                    });
                            }

                            boundedContext.name = this.editedFields.name;
                            boundedContext.alias = this.editedFields.alias;
                            break;

                        case 'importance':
                            boundedContext.importance = item.importance;
                            break;

                        case 'implementationStrategy':
                            boundedContext.implementationStrategy = item.implementationStrategy;
                            break;
                    }

                    this.$emit('updateDevideBoundedContext', this.selectedAspect, this.resultDevideBoundedContext[this.selectedAspect]);

                    this.mermaidNodes = this.generateNodes({
                        boundedContexts: this.resultDevideBoundedContext[key].boundedContexts,
                        relations: this.resultDevideBoundedContext[key].relations
                    });
                    this.renderKey++;
                    this.tableRenderKey++;
                }
            },

            initializeEditFields(item) {
                let key = Object.keys(this.resultDevideBoundedContext)[0];

                const boundedContext = this.resultDevideBoundedContext[key].boundedContexts
                    .find(bc => bc.alias === item.name);
                
                this.editedFields = {
                    name: boundedContext.name || item.name,
                    alias: boundedContext.alias || item.name,
                    importance: item.importance,
                    implementationStrategy: item.implementationStrategy
                };
                this.currentEditItem = item;
            },

            cancelEdit(item) {
                let key = Object.keys(this.resultDevideBoundedContext)[0];

                const boundedContext = this.resultDevideBoundedContext[key].boundedContexts
                    .find(bc => bc.alias === item.name);
                    
                this.editedFields = {
                    name: boundedContext.name || item.name,
                    alias: boundedContext.alias || item.name,
                    importance: item.importance,
                    implementationStrategy: item.implementationStrategy
                };
                this.currentEditItem = null;
            },

            deleteBoundedContext(item) {
                if (confirm(this.$t(item.name+'를 삭제하시겠습니까?'))) {
                    const key = this.selectedAspect || Object.keys(this.resultDevideBoundedContext)[0];
                    const boundedContexts = this.resultDevideBoundedContext[key].boundedContexts;
                    const index = boundedContexts.findIndex(bc => bc.alias === item.name);
                    
                    if (index > -1) {
                        boundedContexts.splice(index, 1);
                        
                        // Update relations
                        this.resultDevideBoundedContext[key].relations = 
                            this.resultDevideBoundedContext[key].relations.filter(relation => 
                                relation.upStream.name !== item.originalName && 
                                relation.downStream.name !== item.originalName
                            );

                        // Update explanations
                        if (this.resultDevideBoundedContext[key].explanations) {
                            this.resultDevideBoundedContext[key].explanations = 
                                this.resultDevideBoundedContext[key].explanations.filter(explanation => 
                                    explanation.sourceContext !== item.name && 
                                    explanation.targetContext !== item.name
                                );
                        }

                        // Update mermaid nodes
                        this.mermaidNodes = this.generateNodes({
                            boundedContexts: this.resultDevideBoundedContext[key].boundedContexts,
                            relations: this.resultDevideBoundedContext[key].relations
                        });
                        
                        this.renderKey++;
                        this.tableRenderKey++;

                        // Emit update event
                        this.$emit('updateDevideBoundedContext', key, this.resultDevideBoundedContext[key]);
                    }
                }
            },
            addNewChoice(newResult) {
                const existingKeys = Object.keys(this.resultDevideBoundedContext);
                if (existingKeys.length > 0) {
                    // 기존 첫 번째 메시지의 키를 기반으로 새로운 키 생성
                    const baseKey = existingKeys[0].split('_')[0]; // 기본 키 추출
                    const newKey = `${baseKey}_choice${existingKeys.length + 1}`;
                    this.$set(this.resultDevideBoundedContext, newKey, newResult);
                    this.activeTab = existingKeys.length; // 새로 추가된 탭으로 이동
                } else {
                    // 첫 번째 결과인 경우
                    this.$set(this.resultDevideBoundedContext, Object.keys(newResult)[0], newResult[Object.keys(newResult)[0]]);
                }
            },
            getMermaidNodesForAspect(aspect) {
                if (!this.resultDevideBoundedContext[aspect]) return {};
                return this.generateNodes({
                    boundedContexts: this.resultDevideBoundedContext[aspect].boundedContexts || [],
                    relations: this.resultDevideBoundedContext[aspect].relations || []
                });
            },
            getDomainStyle(importance) {
                const colors = {
                    'Core Domain': 'fill:#8fbcaa,stroke:#333,stroke-width:2px',
                    'Supporting Domain': 'fill:#b39ddb,stroke:#333,stroke-width:2px',
                    'Generic Domain': 'fill:#9e9e9e,stroke:#333,stroke-width:2px'
                };
                return colors[importance] || 'fill:#ddd,stroke:#333,stroke-width:2px';
            },
            getImplementationStrategies(importance) {
                const baseStrategies = [
                    { text: 'Event Sourcing', value: 'Event Sourcing' },
                    { text: 'Rich Domain Model', value: 'Rich Domain Model' },
                    { text: 'Transaction Script', value: 'Transaction Script' },
                    { text: 'Active Record', value: 'Active Record' }
                ];

                const pbcStrategies = this.pbcLists.map(pbc => ({
                    text: `PBC: ${pbc.name}`,
                    value: `PBC: ${pbc.name}`,
                    disabled: importance !== 'Generic Domain'
                }));

                return [
                    ...baseStrategies,
                    { divider: true },
                    ...pbcStrategies
                ];
            },
            convertText(text) {
                if(text.includes('"name":') && text.includes('"actor":') && text.includes('"description":')) {
                    const json = JSON.parse(text);
                    let result = '';
                    result += `Event: ${json.name} (${json.displayName})<br>`;
                    result += `Actor: ${json.actor}<br>`;
                    result += `Description: ${json.description}<br>`;
                    
                    return result;
                }else{
                    return text;
                }
            },
            isProcessingBC(item) {
                return this.isStartMapping && 
                       this.currentProcessingBoundedContext === item.name;
            }
        }
    }
</script>

<style scoped>
.v-tab-item {
    padding: 20px;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
.requirement-subtable {
    background: transparent !important;
}
.requirement-text {
    white-space: normal;
}
::v-deep .implementation-strategy-menu {
    max-height: 400px;
}
::v-deep .v-list-group__header {
    background-color: #f5f5f5;
}
.processing-row {
    background-color: rgba(25, 118, 210, 0.04);
}

.progress-cell {
    position: relative;
    padding: 8px 16px;
    min-width: 120px;  /* 최소 너비 설정 */
}

.progress-container {
    position: relative;
    width: 100%;
    padding-right: 40px;  /* 퍼센트 텍스트를 위한 공간 */
}

.progress-text {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: #1976d2;
    width: 35px;
    text-align: right;
}

.actions-cell {
    display: flex;
    align-items: center;
    gap: 12px;
}

.requirement-subtable {
    background-color: #f5f5f5 !important;
    margin: 8px;
    border-radius: 4px;
}

.requirement-type {
    font-weight: 500;
    color: #666;
}

.requirement-text {
    white-space: pre-wrap;
    padding: 8px !important;
}

.expand-button {
    background: transparent !important;
    box-shadow: none !important;
}
</style>