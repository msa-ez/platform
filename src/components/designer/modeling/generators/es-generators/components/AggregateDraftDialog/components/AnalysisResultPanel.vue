<template>
    <v-expansion-panels v-model="isPanelExpanded" class="analysis-result-panels">
        <v-expansion-panel v-if="analysisResult">
            <v-expansion-panel-header>
                {{ $t('ModelDraftDialogForDistribution.requirementAnalysisResult') }}
                <template v-slot:actions>
                    <v-icon>{{ isPanelExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </template>
            </v-expansion-panel-header>

            <v-expansion-panel-content>
                <v-card-text class="requirements-analysis">
                    <v-tabs v-model="analysisTab">
                        <v-tab v-if="analysisResult.overviewThoughts">Overview</v-tab>
                        <v-tab v-if="analysisResult.userStories">User Stories</v-tab>
                        <v-tab v-if="analysisResult.entities">Entities</v-tab>
                        <v-tab v-if="analysisResult.businessRules">Business Rules</v-tab>
                        <v-tab v-if="analysisResult.interfaces">Interfaces</v-tab>
                    </v-tabs>

                    <v-tabs-items v-model="analysisTab">
                        <!-- Overview -->
                        <v-tab-item v-if="analysisResult.overviewThoughts">
                            <div class="pa-4">
                                <p>{{ analysisResult.overviewThoughts.summary }}</p>
                                <v-list v-if="analysisResult.overviewThoughts.details">
                                    <v-list-item v-for="(value, key) in analysisResult.overviewThoughts.details"
                                                :key="key" two-line>
                                        <v-list-item-content>
                                            <v-list-item-title>{{ key }}</v-list-item-title>
                                            <v-list-item-subtitle>{{ value }}</v-list-item-subtitle>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list>
                            </div>
                        </v-tab-item>

                        <!-- User Stories -->
                        <v-tab-item v-if="analysisResult.userStories">
                            <div class="pa-4">
                                <v-list>
                                    <v-list-item v-for="(story, index) in analysisResult.userStories" 
                                                :key="index" two-line>
                                        <v-list-item-content>
                                            <v-list-item-title>{{ story.title }}</v-list-item-title>
                                            <v-list-item-subtitle>{{ story.description }}</v-list-item-subtitle>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list>
                            </div>
                        </v-tab-item>

                        <!-- Entities -->
                        <v-tab-item v-if="analysisResult.entities">
                            <div class="pa-4">
                                <v-simple-table class="entity-table">
                                    <div v-for="(entity, entityName) in analysisResult.entities" :key="'head-'+entityName">
                                        <thead>
                                            <tr>
                                                <th colspan="3" class="entity-header">{{ entityName }}</th>
                                            </tr>
                                            <tr class="column-header">
                                                <th class="property-name">Property</th>
                                                <th class="property-type">Type</th>
                                                <th class="property-flags">Flags</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="prop in entity.properties" :key="prop.name">
                                                <td class="property-name">{{ prop.name }}</td>
                                                <td class="property-type">{{ prop.type }}</td>
                                                <td class="property-flags">
                                                    <v-chip x-small 
                                                        class="mr-1" 
                                                        color="primary" 
                                                        v-if="prop.required">Required</v-chip>
                                                    <v-chip x-small 
                                                        class="mr-1" 
                                                        color="success" 
                                                        v-if="prop.isPrimaryKey">PK</v-chip>
                                                    <v-chip x-small 
                                                        color="info" 
                                                        v-if="prop.isForeignKey">FK</v-chip>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </div>
                                </v-simple-table>
                            </div>
                        </v-tab-item>

                        <!-- Business Rules -->
                        <v-tab-item v-if="analysisResult.businessRules">
                            <div class="pa-4">
                                <v-list>
                                    <v-list-item v-for="(rule, index) in analysisResult.businessRules" 
                                                :key="index" two-line>
                                        <v-list-item-content>
                                            <v-list-item-title>{{ rule.name }}</v-list-item-title>
                                            <v-list-item-subtitle>{{ rule.description }}</v-list-item-subtitle>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list>
                            </div>
                        </v-tab-item>

                        <!-- Interfaces -->
                        <v-tab-item v-if="analysisResult.interfaces">
                            <div class="pa-4">
                                <v-row>
                                    <v-col v-for="(interfaceInfo, interfaceName) in analysisResult.interfaces"
                                        :key="interfaceName"
                                        cols="12"
                                        class="mb-4">
                                        <v-card outlined>
                                            <v-card-title class="subtitle-1 font-weight-bold">
                                                {{ interfaceName }}
                                            </v-card-title>
                                            
                                            <!-- Sections -->
                                            <v-card-text>
                                                <div v-for="(section, index) in interfaceInfo.sections"
                                                    :key="index"
                                                    class="mb-4">
                                                    <v-divider v-if="index > 0" class="mb-4"></v-divider>
                                                    
                                                    <!-- Section Header -->
                                                    <div class="d-flex align-center mb-2">
                                                        <h4 class="text-subtitle-1 font-weight-medium">
                                                            {{ section.name }}
                                                        </h4>
                                                        <v-chip small
                                                            class="ml-2"
                                                            :color="section.type === 'form' ? 'primary' : 'secondary'"
                                                            outlined>
                                                            {{ section.type }}
                                                        </v-chip>
                                                    </div>

                                                    <!-- Form Type Section -->
                                                    <template v-if="section.type === 'form'">
                                                        <v-simple-table dense>
                                                            <thead>
                                                                <tr>
                                                                    <th>Field</th>
                                                                    <th>Type</th>
                                                                    <th>Required</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr v-for="field in section.fields"
                                                                    :key="field.name">
                                                                    <td>{{ field.name }}</td>
                                                                    <td>
                                                                        <v-chip x-small
                                                                            :color="getFieldTypeColor(field.type)">
                                                                            {{ field.type }}
                                                                        </v-chip>
                                                                    </td>
                                                                    <td>
                                                                        <v-icon small
                                                                                :color="field.required ? 'success' : 'grey'"
                                                                                v-text="field.required ? 'mdi-check' : 'mdi-minus'">
                                                                        </v-icon>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </v-simple-table>
                                                        
                                                        <!-- Form Actions -->
                                                        <div v-if="section.actions" class="mt-2">
                                                            <v-chip-group>
                                                                <v-chip v-for="action in section.actions"
                                                                    :key="action"
                                                                    small
                                                                    color="primary"
                                                                    outlined>
                                                                    <v-icon left small>mdi-play</v-icon>
                                                                    {{ action }}
                                                                </v-chip>
                                                            </v-chip-group>
                                                        </div>
                                                    </template>

                                                    <!-- Table Type Section -->
                                                    <template v-else-if="section.type === 'table'">
                                                        <!-- Filters -->
                                                        <div v-if="section.filters" class="mb-2">
                                                            <v-subheader class="px-0">Filters</v-subheader>
                                                            <v-chip-group>
                                                                <v-chip v-for="filter in section.filters"
                                                                    :key="filter"
                                                                    small
                                                                    color="info"
                                                                    outlined>
                                                                    <v-icon left small>mdi-filter</v-icon>
                                                                    {{ filter }}
                                                                </v-chip>
                                                            </v-chip-group>
                                                        </div>

                                                        <!-- Result Table -->
                                                        <div v-if="section.resultTable" class="mt-2">
                                                            <v-subheader class="px-0">Result Table</v-subheader>
                                                            <!-- Columns -->
                                                            <div class="mb-2">
                                                                <strong class="text-caption">Columns:</strong>
                                                                <v-chip-group>
                                                                    <v-chip v-for="column in section.resultTable.columns"
                                                                        :key="column"
                                                                        x-small
                                                                        outlined>
                                                                        {{ column }}
                                                                    </v-chip>
                                                                </v-chip-group>
                                                            </div>
                                                            <!-- Table Actions -->
                                                            <div v-if="section.resultTable.actions">
                                                                <strong class="text-caption">Actions:</strong>
                                                                <v-chip-group>
                                                                    <v-chip v-for="action in section.resultTable.actions"
                                                                        :key="action"
                                                                        x-small
                                                                        color="secondary"
                                                                        outlined>
                                                                        <v-icon left x-small>mdi-play</v-icon>
                                                                        {{ action }}
                                                                    </v-chip>
                                                                </v-chip-group>
                                                            </div>
                                                        </div>
                                                    </template>
                                                </div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </div>
                        </v-tab-item>
                    </v-tabs-items>
                </v-card-text>
            </v-expansion-panel-content>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script>
export default {
    name: 'analysis-result-panel',
    props: {
        analysisResult: {
            type: Object,
            required: false,
            default: () => ({})
        }
    },
    data() {
        return {
            isPanelExpanded: false,
            analysisTab: null
        }
    },
    methods: {
        getFieldTypeColor(type) {
            const colorMap = {
                'text': 'blue',
                'number': 'deep-purple',
                'date': 'green',
                'email': 'orange',
                'select': 'pink',
                'search': 'cyan',
                'textarea': 'brown'
            };
            return colorMap[type] || 'grey';
        }
    }
}
</script>

<style scoped>
.analysis-result-panels {
    max-width: calc(100% - 2rem);
    margin: 0 auto;
}

.requirements-analysis h3 {
    margin-bottom: 1rem;
    color: var(--v-primary-base);
}

.interface-card {
    border: 1px solid var(--v-primary-lighten2);
}

.text-caption {
    color: var(--v-secondary-base);
    margin-right: 8px;
}

.v-chip-group {
    flex-wrap: wrap;
}

.entity-table {
    width: 100%;
    margin: 1rem 0;
    border: 1px solid var(--v-primary-lighten3);
    border-radius: 4px;
}

.entity-header {
    background-color: var(--v-primary-lighten5);
    font-size: 1.1rem;
    font-weight: bold;
    padding: 1rem !important;
    text-align: left;
}

.column-header th {
    background-color: var(--v-grey-lighten4);
    font-weight: 600;
    padding: 0.75rem 1rem !important;
}

.property-name {
    width: 35%;
    padding: 0.75rem 1rem !important;
    font-weight: 500;
}

.property-type {
    width: 25%;
    padding: 0.75rem 1rem !important;
    color: var(--v-primary-base);
}

.property-flags {
    width: 40%;
    padding: 0.75rem 1rem !important;
}

.v-chip {
    font-weight: 500;
}
</style>