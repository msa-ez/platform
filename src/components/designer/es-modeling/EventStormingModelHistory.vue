<template>
    <v-dialog
        v-model="showDialog"
        max-width="1200px"
        persistent
        scrollable
    >
        <v-card>
            <v-card-title class="headline">
                <v-icon class="mr-2">mdi-history</v-icon>
                Model History
                <v-spacer></v-spacer>
                <v-btn icon @click="closeDialog">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text style="height: 600px;">
                <div v-if="loading" class="text-center pa-4">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <div class="mt-2">Loading history...</div>
                </div>

                <div v-else-if="historyLists.length === 0" class="text-center pa-4">
                    <v-icon size="64" color="grey">mdi-history</v-icon>
                    <div class="mt-2 grey--text">No history available</div>
                </div>

                <div v-else>
                    <!-- Filter Controls -->
                    <v-row class="mb-4">
                        <v-col cols="12" md="4">
                            <v-select
                                v-model="selectedType"
                                :items="typeFilters"
                                label="Filter by Type"
                                clearable
                                dense
                                outlined
                            ></v-select>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field
                                v-model="searchText"
                                label="Search by element name"
                                prepend-inner-icon="mdi-magnify"
                                clearable
                                dense
                                outlined
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-select
                                v-model="sortOrder"
                                :items="sortOptions"
                                label="Sort Order"
                                dense
                                outlined
                            ></v-select>
                        </v-col>
                    </v-row>

                    <!-- Element History Groups -->
                    <div v-for="elementGroup in filteredHistoryLists" :key="elementGroup.elementId" class="mb-6">
                        <!-- Element Header -->
                        <v-card class="mb-3" :color="elementGroup.isDeleted ? 'red lighten-5' : 'grey lighten-4'">
                            <v-card-text class="py-2">
                                <div class="d-flex align-center">
                                    <v-icon class="mr-2" :color="elementGroup.isDeleted ? 'red' : 'primary'">
                                        {{ elementGroup.isDeleted ? 'mdi-delete' : 'mdi-shape' }}
                                    </v-icon>
                                    <span class="font-weight-medium" :class="{ 'text-decoration-line-through': elementGroup.isDeleted }">
                                        {{ getCurrentElementName(elementGroup.elementId) }}
                                    </span>
                                    <v-chip small :color="elementGroup.isDeleted ? 'red' : 'grey'" class="ml-2">
                                        {{ elementGroup.elementType }}
                                    </v-chip>
                                    <v-chip v-if="elementGroup.isDeleted" small color="red" class="ml-2">
                                        DELETED
                                    </v-chip>
                                    <v-spacer></v-spacer>
                                    <v-chip small :color="elementGroup.isDeleted ? 'red' : 'primary'" outlined>
                                        {{ elementGroup.actions.length }} changes
                                    </v-chip>
                                </div>
                            </v-card-text>
                        </v-card>

                        <!-- Element History Timeline -->
                        <v-timeline align-top dense>
                                    <v-timeline-item
                                        v-for="(item, index) in elementGroup.actions"
                                        :key="item.key"
                                        :color="getActionColor(item.action)"
                                        :icon="getActionIcon(item.action)"
                                        fill-dot
                                    >
                                <template v-slot:opposite>
                                    <span class="caption">{{ formatTimestamp(item.timeStamp) }}</span>
                                </template>

                                <v-card
                                    class="mb-2"
                                    :class="{ 'elevation-2': selectedItem === item.key }"
                                    @click="selectItem(item)"
                                    style="cursor: pointer;"
                                >
                                    <v-card-text class="pb-2">
                                        <div class="d-flex align-center mb-2">
                                            <v-chip
                                                :color="getActionColor(item.action)"
                                                small
                                                class="mr-2"
                                            >
                                                {{ getActionLabel(item.action) }}
                                            </v-chip>
                                            <v-chip
                                                v-if="item.editUid || item.editUserName"
                                                color="grey"
                                                small
                                                class="mr-2"
                                            >
                                                <v-icon small left>mdi-account</v-icon>
                                                {{ item.editUserName || item.editUid }}
                                            </v-chip>
                                            <v-chip
                                                v-if="item.key"
                                                color="blue-grey"
                                                small
                                                outlined
                                                class="mr-2"
                                                :title="item.key"
                                            >
                                                <v-icon small left>mdi-identifier</v-icon>
                                                {{ getHistoryId(item) }}
                                            </v-chip>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                                icon
                                                small
                                                @click.stop="viewAtTime(item)"
                                            >
                                                <v-icon small>mdi-eye</v-icon>
                                            </v-btn>
                                        </div>

                                        <div class="history-content">
                                            <div class="font-weight-medium mb-1">
                                                {{ getActionDescription(item) }}
                                            </div>
                                            <!-- <div class="caption grey--text" style="white-space: pre-line;">
                                                {{ getActionDetails(item) }}
                                            </div> -->
                                            
                                            <div class="caption grey--text mt-1">
                                                <v-icon small class="mr-1">mdi-clock-outline</v-icon>
                                                {{ formatTimestamp(item.timeStamp) }}
                                            </div>
                                        </div>
                                    </v-card-text>
                                </v-card>
                                    </v-timeline-item>
                        </v-timeline>
                    </div>
                </div>
            </v-card-text>

            <v-card-actions>
                <!-- <v-spacer></v-spacer>
                <v-btn text @click="closeDialog">Close</v-btn>
                <v-btn
                    color="primary"
                    @click="exportHistory"
                    :disabled="historyLists.length === 0"
                >
                    <v-icon left>mdi-download</v-icon>
                    Export
                </v-btn> -->
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import StorageBase from "../modeling/ModelStorageBase";

export default {
    name: 'event-storming-model-history',
    mixins: [StorageBase],
    props: {
        projectId: {
            type: String,
            required: true
        },
        value: {
            type: Boolean,
            default: false
        },
        model: {
            type: Object,
            default: () => ({})
        },
        selectedElement: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            showDialog: false,
            loading: false,
            historyLists: [],
            selectedItem: null,
            selectedType: null,
            searchText: '',
            sortOrder: 'desc',
            expandedItems: new Set(),
            typeFilters: [
                { text: 'All Types', value: null },
                { text: 'BoundedContext', value: 'BoundedContext' },
                { text: 'Aggregate', value: 'Aggregate' },
                { text: 'Command', value: 'Command' },
                { text: 'Event', value: 'Event' },
                { text: 'Policy', value: 'Policy' },
                { text: 'View', value: 'View' },
                { text: 'UI', value: 'UI' }
            ],
            sortOptions: [
                { text: 'Newest First', value: 'desc' },
                { text: 'Oldest First', value: 'asc' }
            ]
        }
    },
    computed: {
        filteredHistoryLists() {
            let filtered = [...this.historyLists];

            // Filter by type and search text for each element group
            filtered = filtered.map(elementGroup => {
                let filteredActions = [...elementGroup.actions];

                // Filter by element type
                if (this.selectedType) {
                    // Check if element type matches the selected type
                    const elementType = this.getElementType(elementGroup.elementId);
                    if (elementType !== this.selectedType) {
                        filteredActions = []; // No actions if type doesn't match
                    }
                }

                // Filter by search text (element name)
                if (this.searchText) {
                    const searchLower = this.searchText.toLowerCase();
                    if (!elementGroup.elementName.toLowerCase().includes(searchLower)) {
                        filteredActions = []; // No actions if element name doesn't match
                    }
                }

                // Filter out items with SKIP_THIS_ITEM description
                filteredActions = filteredActions.filter(action => {
                    const description = this.getActionDescription(action);
                    return description !== 'SKIP_THIS_ITEM';
                });

                // Sort by timestamp
                filteredActions.sort((a, b) => {
                    if (this.sortOrder === 'desc') {
                        return b.timeStamp - a.timeStamp;
                    } else {
                        return a.timeStamp - b.timeStamp;
                    }
                });

                return {
                    ...elementGroup,
                    actions: filteredActions
                };
            });

            // Filter out element groups with no actions
            filtered = filtered.filter(elementGroup => elementGroup.actions.length > 0);

            return filtered;
        }
    },
    watch: {
        value(newVal) {
            this.showDialog = newVal;
            if (newVal) {
                this.loadHistory();
            }
        },
        showDialog(newVal) {
            if (!newVal) {
                this.$emit('input', false);
            }
        }
    },
    methods: {
        async loadHistory() {
            this.loading = true;
            try {
                // /history에서 모든 히스토리를 가져옴 (삭제된 것 포함)
                const allHistory = await this.list(`db://definitions/${this.projectId}/history`, {
                    sort: 'desc',
                    orderBy: 'timeStamp',
                    size: null,
                    startAt: null,
                    endAt: null
                });

                console.log('All history from /history:', allHistory);

                // element ID별로 히스토리 그룹화
                const elementHistoryMap = new Map();
                
                if (allHistory && allHistory.length > 0) {
                    for (const historyGroup of allHistory) {
                        // historyGroup은 { key: elementId, action1: {...}, action2: {...}, ... } 형태
                        const elementId = historyGroup.key;
                        
                        if (elementId) {
                            // 각 action을 배열로 변환
                            const actions = [];
                            for (const [actionKey, actionData] of Object.entries(historyGroup)) {
                                if (actionKey !== 'key' && actionData && typeof actionData === 'object') {
                                    actions.push({
                                        key: actionKey,
                                        ...actionData
                                    });
                                }
                            }
                            
                            if (actions.length > 0) {
                                elementHistoryMap.set(elementId, actions);
                            }
                        }
                    }
                }
                
                // 선택된 element 조건에 맞는 것들만 필터링
                const elementHistories = [];
                const modelData = this.model;
                
                for (const [elementId, actions] of elementHistoryMap) {
                    // 선택된 element 조건에 맞는지 확인
                    let shouldInclude = false;
                    
                    if (this.selectedElement && this.selectedElement._type && this.selectedElement._type.includes('BoundedContext')) {
                        // BoundedContext인 경우, 해당 BoundedContext에 속한 element인지 확인
                        // 먼저 현재 모델에서 확인
                        if (modelData && modelData.elements && modelData.elements[elementId]) {
                            const element = modelData.elements[elementId];
                            if (element && element.boundedContext && element.boundedContext.id === this.selectedElement.id) {
                                shouldInclude = true;
                            }
                        }
                        
                        // 현재 모델에 없으면 히스토리에서 확인 (삭제된 element 포함)
                        if (!shouldInclude) {
                            // 모든 action에서 boundedContext 정보를 찾아보기
                            for (const action of actions) {
                                if (action.item) {
                                    try {
                                        const itemData = typeof action.item === 'string' ? JSON.parse(action.item) : action.item;
                                        if (itemData && itemData.boundedContext && itemData.boundedContext.id === this.selectedElement.id) {
                                            shouldInclude = true;
                                            break;
                                        }
                                    } catch (error) {
                                        console.warn('Failed to parse element data for filtering:', error);
                                    }
                                }
                            }
                            
                            // elementPush action에서도 한 번 더 확인 (더 정확한 정보가 있을 수 있음)
                            if (!shouldInclude) {
                                const createAction = actions.find(action => action.action && action.action.includes('elementPush'));
                                if (createAction && createAction.item) {
                                    try {
                                        const itemData = typeof createAction.item === 'string' ? JSON.parse(createAction.item) : createAction.item;
                                        if (itemData && itemData.boundedContext && itemData.boundedContext.id === this.selectedElement.id) {
                                            shouldInclude = true;
                                        }
                                    } catch (error) {
                                        console.warn('Failed to parse create action data for filtering:', error);
                                    }
                                }
                            }
                        }
                    } else if (this.selectedElement && this.selectedElement.id) {
                        // 특정 element인 경우
                        if (elementId === this.selectedElement.id) {
                            shouldInclude = true;
                        }
                    } else {
                        // selectedElement가 없는 경우 모든 element 표시 (삭제된 것 포함)
                        shouldInclude = true;
                    }
                    
                    if (shouldInclude) {
                        // element 이름 가져오기
                        let elementName = 'Unknown Element';
                        let elementType = 'Unknown';
                        
                        if (modelData && modelData.elements && modelData.elements[elementId]) {
                            // 현재 모델에 있는 element
                            const element = modelData.elements[elementId];
                            if (element.name) {
                                if (Array.isArray(element.name)) {
                                    elementName = element.name[0] || element.name[1] || elementName;
                                } else {
                                    elementName = element.name;
                                }
                            }
                            if (element._type) {
                                elementType = element._type.split('.').pop();
                            }
                        } else {
                            // 삭제된 element - 히스토리에서 이름 추출
                            // 모든 action에서 element 정보를 찾아보기 (가장 최근 정보 우선)
                            let foundElementInfo = false;
                            for (const action of actions) {
                                if (action.item) {
                                    try {
                                        const itemData = typeof action.item === 'string' ? JSON.parse(action.item) : action.item;
                                        if (itemData && (itemData.name || itemData._type)) {
                                            if (itemData.name && !foundElementInfo) {
                                                if (Array.isArray(itemData.name)) {
                                                    elementName = itemData.name[0] || itemData.name[1] || elementName;
                                                } else {
                                                    elementName = itemData.name;
                                                }
                                                foundElementInfo = true;
                                            }
                                            if (itemData._type && elementType === 'Unknown') {
                                                elementType = itemData._type.split('.').pop();
                                            }
                                        }
                                    } catch (error) {
                                        console.warn('Failed to parse element info from history action:', error);
                                    }
                                }
                            }
                            
                            // elementPush action에서도 한 번 더 확인 (더 정확한 정보가 있을 수 있음)
                            if (!foundElementInfo) {
                                const createAction = actions.find(action => action.action && action.action.includes('elementPush'));
                                if (createAction && createAction.item) {
                                    try {
                                        const itemData = typeof createAction.item === 'string' ? JSON.parse(createAction.item) : createAction.item;
                                        if (itemData && itemData.name) {
                                            if (Array.isArray(itemData.name)) {
                                                elementName = itemData.name[0] || itemData.name[1] || elementName;
                                            } else {
                                                elementName = itemData.name;
                                            }
                                        }
                                        if (itemData && itemData._type) {
                                            elementType = itemData._type.split('.').pop();
                                        }
                                    } catch (error) {
                                        console.warn('Failed to parse element name from create action:', error);
                                    }
                                }
                            }
                        }
                        
                        elementHistories.push({
                            elementId: elementId,
                            elementName: elementName,
                            elementType: elementType,
                            isDeleted: !(modelData && modelData.elements && modelData.elements[elementId]),
                            actions: actions.sort((a, b) => (b.timeStamp || 0) - (a.timeStamp || 0))
                        });
                    }
                }
                
                this.historyLists = elementHistories;
            } catch (error) {
                console.error('Failed to load history:', error);
                this.historyLists = [];
            } finally {
                this.loading = false;
            }
        },
        closeDialog() {
            this.showDialog = false;
        },
        selectItem(item) {
            this.selectedItem = this.selectedItem === item.key ? null : item.key;
        },
        getDetailedComplexEntityChanges(entities, elementName, elementType) {
            // entities 안에 elements가 있는 복잡한 구조 처리
            if (entities.elements) {
                return this.getDetailedNestedEntityChanges(entities.elements, elementName, elementType);
            }
            
            // 기존 단순한 entities 구조 처리
            return this.getDetailedEntityChanges(entities, elementName, elementType);
        },
        
        getDetailedNestedEntityChanges(nestedEntities, elementName, elementType) {
            const details = [];
            const elementIds = Object.keys(nestedEntities);
            
            for (const elementId of elementIds) {
                const element = nestedEntities[elementId];
                if (Array.isArray(element) && element[0]) {
                    const elementData = element[0];
                    const entityName = elementData.name || `Entity ${elementId.substring(0, 8)}...`;
                    const displayName = elementData.displayName;
                    
                    // 엔티티 이름과 표시명만 간단히 표시
                    let entityInfo = `• ${entityName}`;
                    if (displayName && displayName !== entityName) {
                        entityInfo += ` (${displayName})`;
                    }
                    details.push(entityInfo);
                    
                    // 필드 변경사항을 간단한 이름+타입 형태로 요약
                    if (elementData.fieldDescriptors) {
                        const fieldSummary = this.getSimpleFieldSummary(elementData.fieldDescriptors);
                        if (fieldSummary) {
                            details.push(`  ${fieldSummary}`);
                        }
                    }
                } else if (typeof element === 'object' && element !== null && !Array.isArray(element)) {
                    // 단일 객체인 경우 (예: enum, class 등)
                    const entityName = element.name || `Element ${elementId.substring(0, 8)}...`;
                    const entityType = element._type ? element._type.split('.').pop() : 'Unknown';
                    
                    let entityInfo = `• ${entityName} (${entityType})`;
                    details.push(entityInfo);
                    
                    // enum의 경우 items 표시
                    if (element.items && Array.isArray(element.items)) {
                        const itemNames = element.items.map(item => item.value || item).slice(0, 3);
                        const itemText = itemNames.length <= 3 
                            ? itemNames.join(', ')
                            : itemNames.join(', ') + `... (+${element.items.length - 3} more)`;
                        details.push(`  Values: ${itemText}`);
                    }
                    
                    // class의 경우 필드 요약
                    if (element.fieldDescriptors) {
                        const fieldSummary = this.getSimpleFieldSummary(element.fieldDescriptors);
                        if (fieldSummary) {
                            details.push(`  ${fieldSummary}`);
                        }
                    }
                }
            }
            
            return details;
        },
        
        getDetailedEntityChanges(entities, elementName, elementType) {
            const details = [];
            const entityKeys = Object.keys(entities).filter(k => k !== '_t');
            
            for (const entityKey of entityKeys) {
                const entity = entities[entityKey];
                if (Array.isArray(entity) && entity[0] && entity[0].name) {
                    const entityName = entity[0].name;
                    
                    let action = '';
                    if (entityKey.startsWith('_')) {
                        action = '삭제됨';
                    } else if (entity[1] > 0) {
                        action = '추가됨';
                    } else if (entity[2] > 0) {
                        action = '삭제됨';
                    } else {
                        action = '수정됨';
                    }
                    
                    details.push(`• ${entityName} - ${action}`);
                }
            }
            
            return details;
        },
        getDetailedOperationChanges(operations, elementName, elementType) {
            const details = [];
            const operationKeys = Object.keys(operations).filter(k => k !== '_t');
            
            for (const opKey of operationKeys) {
                const operation = operations[opKey];
                if (Array.isArray(operation) && operation[0] && operation[0].class) {
                    const opName = Array.isArray(operation[0].class) ? 
                        operation[0].class[1] || operation[0].class[0] : 
                        operation[0].class;
                    
                    let action = '';
                    if (opKey.startsWith('_')) {
                        action = '삭제됨';
                    } else if (operation[1] > 0) {
                        action = '추가됨';
                    } else if (operation[2] > 0) {
                        action = '삭제됨';
                    } else {
                        action = '수정됨';
                    }
                    
                    details.push(`• ${opName} - ${action}`);
                }
            }
            
            return details;
        },
        getSimpleFieldChanges(fieldDescriptors) {
            const changes = [];
            const fieldKeys = Object.keys(fieldDescriptors).filter(k => k !== '_t');
            
            for (const fieldKey of fieldKeys) {
                const field = fieldDescriptors[fieldKey];
                if (Array.isArray(field) && field[0] && field[0].name) {
                    const fieldName = field[0].name;
                    let action = '';
                    
                    if (fieldKey.startsWith('_')) {
                        action = '삭제';
                    } else if (field[1] > 0) {
                        action = '추가';
                    } else if (field[2] > 0) {
                        action = '삭제';
                    } else {
                        action = '수정';
                    }
                    
                    changes.push(`${fieldName}(${action})`);
                }
            }
            
            return changes;
        },
        
        getSimpleFieldSummary(fieldDescriptors) {
            const fieldKeys = Object.keys(fieldDescriptors).filter(k => k !== '_t');
            if (fieldKeys.length === 0) return null;
            
            const addedFields = [];
            const deletedFields = [];
            const modifiedFields = [];
            
            for (const fieldKey of fieldKeys) {
                const field = fieldDescriptors[fieldKey];
                let fieldName = '';
                let fieldType = 'Unknown';
                
                if (Array.isArray(field) && field[0]) {
                    // 일반적인 fieldDescriptors 구조
                    if (field[0].name) {
                        fieldName = field[0].name;
                        fieldType = field[0].className || field[0].classId || 'Unknown';
                    }
                } else if (typeof field === 'object' && field !== null) {
                    // queryParameters 같은 직접 구조
                    fieldName = field.name;
                    fieldType = field.className || 'String'; // queryParameters는 기본적으로 String
                }
                
                if (fieldName) {
                    // name이 배열인 경우 처리 (json-diff 결과)
                    if (Array.isArray(fieldName)) {
                        fieldName = fieldName[1] || fieldName[0]; // 새 값 우선, 없으면 이전 값
                    }
                    if (Array.isArray(fieldType)) {
                        fieldType = fieldType[1] || fieldType[0];
                    }
                    
                    // 타입이 없으면 이름만 표시
                    const fieldInfo = (fieldType === 'Unknown') ? fieldName : `${fieldName}:${fieldType}`;
                    
                    // 액션 판단
                    if (fieldKey.startsWith('_')) {
                        deletedFields.push(fieldInfo);
                    } else if (Array.isArray(field) && field[1] > 0) {
                        addedFields.push(fieldInfo);
                    } else if (Array.isArray(field) && field[2] > 0) {
                        deletedFields.push(fieldInfo);
                    } else if (Array.isArray(field)) {
                        modifiedFields.push(fieldInfo);
                    } else {
                        // 객체인 경우 추가로 간주
                        addedFields.push(fieldInfo);
                    }
                }
            }
            
            const changes = [];
            if (addedFields.length > 0) {
                changes.push(`Added: ${addedFields.join(', ')}`);
            }
            if (deletedFields.length > 0) {
                changes.push(`Deleted: ${deletedFields.join(', ')}`);
            }
            if (modifiedFields.length > 0) {
                changes.push(`Modified: ${modifiedFields.join(', ')}`);
            }
            
            if (changes.length === 0) return null;
            
            return `Fields: ${changes.join(' | ')}`;
        },
        
        getSimpleOperationChanges(operations) {
            const changes = [];
            const operationKeys = Object.keys(operations).filter(k => k !== '_t');
            
            for (const opKey of operationKeys) {
                const operation = operations[opKey];
                if (Array.isArray(operation) && operation[0] && operation[0].name) {
                    const opName = operation[0].name;
                    let action = '';
                    
                    if (opKey.startsWith('_')) {
                        action = '삭제';
                    } else if (operation[1] > 0) {
                        action = '추가';
                    } else if (operation[2] > 0) {
                        action = '삭제';
                    } else {
                        action = '수정';
                    }
                    
                    changes.push(`${opName}(${action})`);
                }
            }
            
            return changes;
        },
        
        getDetailedRelationChanges(relations, elementName, elementType) {
            const details = [];
            const relationKeys = Object.keys(relations).filter(k => k !== '_t');
            
            for (const relKey of relationKeys) {
                const relation = relations[relKey];
                if (Array.isArray(relation) && relation[0]) {
                    const relName = relation[0].name || `Relation ${relKey}`;
                    
                    let action = '';
                    if (relKey.startsWith('_')) {
                        action = '삭제됨';
                    } else if (relation[1] > 0) {
                        action = '추가됨';
                    } else if (relation[2] > 0) {
                        action = '삭제됨';
                    } else {
                        action = '수정됨';
                    }
                    
                    details.push(`• ${relName} - ${action}`);
                }
            }
            
            return details;
        },
        viewAtTime(item) {
            // Emit event to parent to navigate to specific time
            this.$emit('view-at-time', item);
        },
        exportHistory() {
            const data = this.filteredHistoryLists.map(elementGroup => ({
                elementId: elementGroup.elementId,
                elementName: elementGroup.elementName,
                changes: elementGroup.actions.map(item => ({
                    timestamp: this.formatTimestamp(item.timeStamp),
                    action: this.getActionLabel(item.action),
                    description: this.getActionDescription(item),
                    details: this.getActionDetails(item),
                    user: item.editUid || 'Unknown'
                }))
            }));

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `model-history-${this.projectId}.json`;
            a.click();
            URL.revokeObjectURL(url);
        },
        getActionColor(action) {
            if (action.includes('Push')) return 'green';
            if (action.includes('Delete')) return 'red';
            if (action.includes('Move')) return 'blue';
            if (action.includes('Modify')) return 'orange';
            if (action.startsWith('user')) return 'purple';
            return 'grey';
        },
        getActionIcon(action) {
            if (action.includes('Push')) return 'mdi-plus';
            if (action.includes('Delete')) return 'mdi-delete';
            if (action.includes('Move')) return 'mdi-arrow-move';
            if (action.includes('Modify')) return 'mdi-pencil';
            if (action.startsWith('user')) return 'mdi-account';
            return 'mdi-circle';
        },
        getActionLabel(action) {
            if (action.includes('elementPush')) return 'Create Element';
            if (action.includes('elementDelete')) return 'Delete Element';
            if (action.includes('elementMove')) return 'Move Element';
            if (action.includes('valueModify')) return 'Modify Element';
            if (action.includes('relationPush')) return 'Create Relation';
            if (action.includes('relationDelete')) return 'Delete Relation';
            if (action.includes('relationMove')) return 'Move Relation';
            if (action.startsWith('user')) return 'User Action';
            return action;
        },
        getActionDescription(item) {
            try {
                const action = item.action;
                let itemData = null;

                if (item.item) {
                    itemData = typeof item.item === 'string' ? JSON.parse(item.item) : item.item;
                }

                if (action.includes('elementPush') && itemData) {
                    const elementType = this.getElementTypeFromData(itemData._type);
                    return `Created "${itemData.name}" (${elementType})`;
                }
                if (action.includes('elementDelete') && itemData) {
                    const elementType = this.getElementTypeFromData(itemData._type);
                    return `Deleted "${itemData.name}" (${elementType})`;
                }
                if (action.includes('elementMove') && itemData) {
                    return `Moved "${itemData.elementName}" (${itemData.elementType})`;
                }
                if (action.includes('valueModify') && itemData) {
                    const parsed = this.parseValueModifyDiff(itemData);
                    if (parsed && parsed.description) {
                        return parsed.description;
                    } else {
                        // 의미있는 변경사항이 없으면 "Modified"로 표시하지 않고 건너뛰기
                        return 'SKIP_THIS_ITEM';
                    }
                }
                if (action.includes('relationPush') && itemData) {
                    return `Created relation between elements`;
                }
                if (action.includes('relationDelete') && itemData) {
                    return `Deleted relation between elements`;
                }
                if (action.includes('relationMove') && itemData) {
                    return `Moved relation`;
                }
                if (action.startsWith('user') && itemData) {
                    if (action.includes('Entrance')) {
                        return `User joined: ${itemData.userName || itemData.name || 'Unknown'}`;
                    } else if (action.includes('Exit')) {
                        return `User left: ${itemData.userName || itemData.name || 'Unknown'}`;
                    } else if (action.includes('PanelOpen')) {
                        return `User opened panel: ${itemData.name || 'Unknown'}`;
                    } else if (action.includes('PanelClose')) {
                        return `User closed panel: ${itemData.name || 'Unknown'}`;
                    } else if (action.includes('MovedOn')) {
                        return `User started moving element: ${itemData.userName || 'Unknown'}`;
                    } else if (action.includes('MovedOff')) {
                        return `User stopped moving element: ${itemData.userName || 'Unknown'}`;
                    } else if (action.includes('SelectedOn')) {
                        return `User selected element: ${itemData.userName || 'Unknown'}`;
                    } else if (action.includes('SelectedOff')) {
                        return `User deselected element: ${itemData.userName || 'Unknown'}`;
                    }
                    return `User action: ${action}`;
                }

                return action;
            } catch (error) {
                return item.action;
            }
        },
        getActionDetails(item) {
            try {
                const action = item.action;
                let itemData = null;

                if (item.item) {
                    itemData = typeof item.item === 'string' ? JSON.parse(item.item) : item.item;
                }

                if (action.includes('elementPush') && itemData) {
                    const x = itemData.elementView && itemData.elementView.x ? itemData.elementView.x : 0;
                    const y = itemData.elementView && itemData.elementView.y ? itemData.elementView.y : 0;
                    return `Position: (${x}, ${y})`;
                }
                if (action.includes('elementDelete') && itemData) {
                    const x = itemData.elementView && itemData.elementView.x ? itemData.elementView.x : 0;
                    const y = itemData.elementView && itemData.elementView.y ? itemData.elementView.y : 0;
                    return `Position: (${x}, ${y})`;
                }
                if (action.includes('elementMove') && itemData) {
                    const before = itemData.before ? JSON.parse(itemData.before) : {};
                    const after = itemData.after ? JSON.parse(itemData.after) : {};
                    return `From: (${before.x || 0}, ${before.y || 0}) To: (${after.x || 0}, ${after.y || 0})`;
                }
                if (action.includes('valueModify') && itemData) {
                    const parsed = this.parseValueModifyDiff(itemData);
                    if (parsed && parsed.description) {
                        return parsed.description;
                    } else {
                        // 의미있는 변경사항이 없으면 "Modified"로 표시하지 않고 건너뛰기
                        return 'SKIP_THIS_ITEM';
                    }
                }
                if (action.startsWith('user') && itemData) {
                    return `User: ${itemData.userName || itemData.name || 'Unknown'}`;
                }

                return '';
            } catch (error) {
                return '';
            }
        },
        getElementType(elementId) {
            if (!this.model || !this.model.elements || !this.model.elements[elementId]) {
                return 'Unknown';
            }
            const element = this.model.elements[elementId];
            if (!element._type) return 'Unknown';
            const parts = element._type.split('.');
            return parts[parts.length - 1] || element._type;
        },
        getElementTypeFromData(typeString) {
            if (!typeString) return 'Unknown';
            const parts = typeString.split('.');
            return parts[parts.length - 1] || typeString;
        },
        getCurrentElementName(elementId) {
            // 현재 모델에서 element 찾기
            if (this.model && this.model.elements && this.model.elements[elementId]) {
                const element = this.model.elements[elementId];
                if (element.name) {
                    if (Array.isArray(element.name)) {
                        return element.name[0] || element.name[1] || 'Unnamed Element';
                    }
                    return element.name;
                }
            }
            
            // 삭제된 element의 경우 히스토리에서 이름 찾기
            const elementGroup = this.historyLists.find(group => group.elementId === elementId);
            if (elementGroup) {
                return elementGroup.elementName;
            }
            
            return 'Unknown Element';
        },
        formatTimestamp(timestamp) {
            if (!timestamp) return 'Unknown';
            const date = new Date(timestamp);
            return date.toLocaleString();
        },
        getHistoryId(item) {
            // 히스토리 ID를 더 명확하게 표시
            if (item.key) {
                // 키가 너무 길면 앞부분만 표시
                const key = item.key.toString();
                if (key.length > 12) {
                    return key.substring(0, 8) + '...';
                }
                return key;
            }
            return 'N/A';
        },
        getFieldDetails(fieldInfo) {
            if (!fieldInfo) return '';
            
            const details = [];
            
            // 필드 타입 정보
            if (fieldInfo.className) {
                details.push(`Type: ${fieldInfo.className}`);
            }
            
            // 필드 속성들
            const attributes = [];
            if (fieldInfo.isKey) attributes.push('Key');
            if (fieldInfo.isName) attributes.push('Name');
            if (fieldInfo.isList) attributes.push('List');
            if (fieldInfo.isVO) attributes.push('VO');
            if (fieldInfo.isLob) attributes.push('LOB');
            if (fieldInfo.isCorrelationKey) attributes.push('CorrelationKey');
            if (fieldInfo.isSearchKey) attributes.push('SearchKey');
            
            if (attributes.length > 0) {
                details.push(`Attributes: ${attributes.join(', ')}`);
            }
            
            // PascalCase와 CamelCase 이름
            if (fieldInfo.namePascalCase && fieldInfo.namePascalCase !== fieldInfo.name) {
                details.push(`PascalCase: ${fieldInfo.namePascalCase}`);
            }
            if (fieldInfo.nameCamelCase && fieldInfo.nameCamelCase !== fieldInfo.name) {
                details.push(`CamelCase: ${fieldInfo.nameCamelCase}`);
            }
            
            return details.join(' | ');
        },
        parseValueModifyDiff(itemData) {
            
            if (!itemData || !itemData.elements) {
                return { description: 'Modified', details: '' };
            }

            const elementIds = Object.keys(itemData.elements);
            
            if (elementIds.length === 0) {
                return { description: 'Modified', details: '' };
            }

            const elementId = elementIds[0];
            const elementChanges = itemData.elements[elementId];
            
            return this.parseElementChanges(elementChanges);
        },
        
        // 통합된 변경사항 파싱 메서드
        parseElementChanges(elementChanges) {
            
            const changes = [];
            
            // 기본 속성 변경 (name, displayName)
            this.parseBasicPropertyChanges(elementChanges, changes);
            
            // 필드 관련 변경사항들
            this.parseFieldRelatedChanges(elementChanges, changes);
            
            // 구조적 변경사항들
            this.parseStructuralChanges(elementChanges, changes);
            
            
            // 의미있는 변경사항이 없으면 "Modified"로 표시하지 않음
            if (changes.length === 0) {
                // UI 관련 변경만 있는지 확인
                const hasOnlyUIChanges = this.hasOnlyUIChanges(elementChanges);
                if (hasOnlyUIChanges) {
                    return null; // UI 변경만 있으면 표시하지 않음
                }
            }
            
            if (changes.length > 0) {
                return {
                    description: changes.join(' | '),
                    details: ''
                };
            } else {
                // 의미있는 변경사항이 없으면 null 반환
                return null;
            }
        },
        
        // UI 관련 변경만 있는지 확인
        hasOnlyUIChanges(elementChanges) {
            const uiOnlyProps = ['elementView', 'relationView'];
            const meaningfulProps = ['name', 'displayName', 'fieldDescriptors', 'entities', 'operations', 'relations', 'createRules', 'queryParameters', 'dataProjection', 'visibility', 'description', 'author', 'trigger', 'elementType'];
            
            const hasUIChanges = uiOnlyProps.some(prop => elementChanges[prop]);
            const hasMeaningfulChanges = meaningfulProps.some(prop => elementChanges[prop]);
            
            return hasUIChanges && !hasMeaningfulChanges;
        },
        
        // 기본 속성 변경사항 파싱
        parseBasicPropertyChanges(elementChanges, changes) {
            // name 변경
            if (elementChanges.name && Array.isArray(elementChanges.name)) {
                const [oldName, newName] = elementChanges.name;
                if (oldName !== newName) {
                    changes.push(`Name: "${oldName}" → "${newName}"`);
                }
            }
            
            // displayName 변경
            if (elementChanges.displayName && Array.isArray(elementChanges.displayName)) {
                const [oldDisplay, newDisplay] = elementChanges.displayName;
                if (oldDisplay !== newDisplay) {
                    changes.push(`Display: "${oldDisplay}" → "${newDisplay}"`);
                }
            }
            
            // dataProjection 변경
            if (elementChanges.dataProjection && Array.isArray(elementChanges.dataProjection)) {
                const [oldProjection, newProjection] = elementChanges.dataProjection;
                if (oldProjection !== newProjection) {
                    changes.push(`Data Projection: "${oldProjection}" → "${newProjection}"`);
                }
            }
            
            // elementView 변경 (위치, 크기 등)
            if (elementChanges.elementView) {
                const viewChanges = [];
                const viewProps = ['x', 'y', 'width', 'height'];
                
                for (const prop of viewProps) {
                    if (elementChanges.elementView[prop] && Array.isArray(elementChanges.elementView[prop])) {
                        const [oldValue, newValue] = elementChanges.elementView[prop];
                        if (oldValue !== newValue) {
                            viewChanges.push(`${prop}: ${oldValue} → ${newValue}`);
                        }
                    }
                }
                
                if (viewChanges.length > 0) {
                    changes.push(`Position: ${viewChanges.join(', ')}`);
                }
            }
            
            // 기타 메타 속성들 처리
            const metaProperties = ['visibility', 'description', 'author', 'trigger', 'elementType'];
            for (const prop of metaProperties) {
                if (elementChanges[prop] && Array.isArray(elementChanges[prop])) {
                    const [oldValue, newValue] = elementChanges[prop];
                    if (oldValue !== newValue) {
                        const displayName = prop.charAt(0).toUpperCase() + prop.slice(1);
                        changes.push(`${displayName}: "${oldValue}" → "${newValue}"`);
                    }
                }
            }
        },
        
        // 필드 관련 변경사항 파싱
        parseFieldRelatedChanges(elementChanges, changes) {
            // aggregateRoot의 fieldDescriptors 변경 (Aggregate의 경우)
            if (elementChanges.aggregateRoot && elementChanges.aggregateRoot.fieldDescriptors) {
                const fieldSummary = this.getSimpleFieldSummary(elementChanges.aggregateRoot.fieldDescriptors);
                if (fieldSummary) {
                    changes.push(fieldSummary);
                }
            }
            
            // fieldDescriptors 변경 (일반적인 필드들)
            if (elementChanges.fieldDescriptors && !elementChanges.aggregateRoot) {
                const fieldSummary = this.getSimpleFieldSummary(elementChanges.fieldDescriptors);
                if (fieldSummary) {
                    changes.push(fieldSummary);
                }
            }
            
            // queryParameters 변경 (Command, View 등)
            if (elementChanges.queryParameters) {
                const fieldSummary = this.getSimpleFieldSummary(elementChanges.queryParameters);
                if (fieldSummary) {
                    changes.push(fieldSummary.replace('Fields:', 'Query Params:'));
                }
            }
        },
        
        // 구조적 변경사항 파싱
        parseStructuralChanges(elementChanges, changes) {
            // entities 변경사항 (직접 접근)
            if (elementChanges.entities) {
                if (elementChanges.entities.elements) {
                    const entitySummary = this.getEntityChangesSummary(elementChanges.entities.elements);
                    
                    if (entitySummary) {
                        changes.push(`Entities: ${entitySummary}`);
                    }
                } else {
                    const entitySummary = this.getSimpleChangesSummary(elementChanges.entities, 'entity');
                    if (entitySummary) {
                        changes.push(`Entities: ${entitySummary}`);
                    }
                }
            }
            
            // aggregateRoot 안의 entities 변경사항 (중첩된 경우)
            if (elementChanges.aggregateRoot && elementChanges.aggregateRoot.entities) {
                if (elementChanges.aggregateRoot.entities.elements) {
                    const entitySummary = this.getEntityChangesSummary(elementChanges.aggregateRoot.entities.elements);
                    
                    if (entitySummary) {
                        changes.push(`Entities: ${entitySummary}`);
                    }
                }
            }
            
            // operations 변경사항
            if (elementChanges.operations) {
                const opSummary = this.getSimpleChangesSummary(elementChanges.operations, 'operation');
                if (opSummary) {
                    changes.push(`Operations: ${opSummary}`);
                }
            }
            
            // relations 변경사항
            if (elementChanges.relations) {
                const relSummary = this.getSimpleChangesSummary(elementChanges.relations, 'relation');
                if (relSummary) {
                    changes.push(`Relations: ${relSummary}`);
                }
            }
            
            // createRules 변경사항
            if (elementChanges.createRules) {
                const ruleSummary = this.getSimpleChangesSummary(elementChanges.createRules, 'rule');
                if (ruleSummary) {
                    changes.push(`Rules: ${ruleSummary}`);
                }
            }
        },
        
        // 엔티티 변경사항 요약
        getEntityChangesSummary(entities) {
            const entityIds = Object.keys(entities);
            if (entityIds.length === 0) return null;
            
            const addedEntities = [];
            const deletedEntities = [];
            const modifiedEntities = [];
            
            for (const entityId of entityIds) {
                const entity = entities[entityId];
                let entityName = '';
                
                if (Array.isArray(entity) && entity[0]) {
                    // 배열 형태 (json-diff 결과)
                    entityName = entity[0].name || `Entity ${entityId.substring(0, 8)}...`;
                    
                    if (entityId.startsWith('_')) {
                        deletedEntities.push(entityName);
                    } else if (entity[1] > 0) {
                        addedEntities.push(entityName);
                    } else if (entity[2] > 0) {
                        deletedEntities.push(entityName);
                    } else {
                        modifiedEntities.push(entityName);
                    }
                } else if (typeof entity === 'object' && entity !== null) {
                    // 단순 객체 형태 - 엔티티 이름 추출
                    
                    if (entity.name) {
                        entityName = Array.isArray(entity.name) ? entity.name[1] || entity.name[0] : entity.name;
                    } else if (entity.displayName) {
                        entityName = Array.isArray(entity.displayName) ? entity.displayName[1] || entity.displayName[0] : entity.displayName;
                    } else {
                        // 이름 정보가 없으면 이 엔티티는 건너뛰기
                        continue;
                    }
                    
                    // _t 필드로 액션 판단
                    if (entity._t === 'a') {
                        addedEntities.push(entityName);
                    } else if (entity._t === 'd') {
                        deletedEntities.push(entityName);
                    } else if (entity._t === 'm') {
                        modifiedEntities.push(entityName);
                    } else {
                        // _t가 없으면 추가된 것으로 간주 (새로운 엔티티)
                        addedEntities.push(entityName);
                    }
                }
            }
            
            const changes = [];
            if (addedEntities.length > 0) {
                changes.push(`Added: ${addedEntities.join(', ')}`);
            }
            if (deletedEntities.length > 0) {
                changes.push(`Deleted: ${deletedEntities.join(', ')}`);
            }
            if (modifiedEntities.length > 0) {
                changes.push(`Modified: ${modifiedEntities.join(', ')}`);
            }
            
            return changes.length > 0 ? changes.join(' | ') : null;
        },
        
        // 간단한 변경사항 요약 (operations, relations, rules 등)
        getSimpleChangesSummary(changeObject, type) {
            const keys = Object.keys(changeObject).filter(k => k !== '_t');
            if (keys.length === 0) return null;
            
            const added = [];
            const deleted = [];
            const modified = [];
            
            for (const key of keys) {
                const item = changeObject[key];
                let itemName = '';
                
                if (Array.isArray(item) && item[0]) {
                    if (item[0].name) {
                        itemName = item[0].name;
                    } else if (item[0].class) {
                        itemName = Array.isArray(item[0].class) ? 
                            item[0].class[1] || item[0].class[0] : 
                            item[0].class;
                    } else {
                        itemName = `${type} ${key}`;
                    }
                    
                    if (key.startsWith('_')) {
                        deleted.push(itemName);
                    } else if (item[1] > 0) {
                        added.push(itemName);
                    } else if (item[2] > 0) {
                        deleted.push(itemName);
                    } else {
                        modified.push(itemName);
                    }
                } else if (typeof item === 'object' && item !== null) {
                    // createRules의 경우 특별 처리
                    if (type === 'rule') {
                        itemName = this.getRuleDescription(item, key);
                    } else if (type === 'entity') {
                        // 엔티티의 경우 이름 추출
                        if (item.name) {
                            itemName = Array.isArray(item.name) ? item.name[1] || item.name[0] : item.name;
                        } else if (item.displayName) {
                            itemName = Array.isArray(item.displayName) ? item.displayName[1] || item.displayName[0] : item.displayName;
                        } else {
                            // 이름 정보가 없으면 건너뛰기
                            continue;
                        }
                    } else {
                        itemName = item.name || `${type} ${key}`;
                    }
                    modified.push(itemName);
                }
            }
            
            const changes = [];
            if (added.length > 0) {
                changes.push(`Added: ${added.join(', ')}`);
            }
            if (deleted.length > 0) {
                changes.push(`Deleted: ${deleted.join(', ')}`);
            }
            if (modified.length > 0) {
                changes.push(`Modified: ${modified.join(', ')}`);
            }
            
            if (changes.length > 0) {
                return changes.join(' | ');
            } else if (type === 'entity') {
                // 엔티티의 경우 의미있는 변경사항이 없으면 null 반환
                return null;
            } else {
                return `${keys.length} changes`;
            }
        },
        
        // createRules의 설명 생성
        getRuleDescription(rule, key) {
            if (!rule) return `Rule ${key}`;
            
            let eventName = '';
            let mappingInfo = '';
            
            // when 배열에서 이벤트 이름 추출
            if (rule.when && Array.isArray(rule.when)) {
                for (const whenItem of rule.when) {
                    if (Array.isArray(whenItem) && whenItem[1] && whenItem[1].name) {
                        eventName = whenItem[1].name;
                        break;
                    }
                }
            }
            
            // fieldMapping에서 실제 매핑 정보 추출
            if (rule.fieldMapping && Object.keys(rule.fieldMapping).length > 0) {
                const mappings = [];
                for (const mappingKey of Object.keys(rule.fieldMapping)) {
                    const mapping = rule.fieldMapping[mappingKey];
                    if (mapping.viewField && mapping.eventField) {
                        const viewField = Array.isArray(mapping.viewField) ? mapping.viewField[1] : mapping.viewField;
                        const eventField = Array.isArray(mapping.eventField) ? mapping.eventField[1] : mapping.eventField;
                        
                        if (viewField && eventField && viewField.name && eventField.name) {
                            mappings.push(`${viewField.name} (View) → ${eventField.name} (Event)`);
                        }
                    }
                }
                
                if (mappings.length > 0) {
                    mappingInfo = ` (${mappings.join(', ')})`;
                }
            }
            
            if (eventName) {
                return `Rule for ${eventName}${mappingInfo}`;
            } else if (mappingInfo) {
                return `Rule${mappingInfo}`;
            } else {
                return `Rule ${key}`;
            }
        },
        
        getFieldNamesFromFieldDescriptors(fieldDescriptors) {
            if (!fieldDescriptors) return [];
            
            const fieldNames = [];
            const fieldKeys = Object.keys(fieldDescriptors).filter(k => k !== '_t');
            
            for (const fieldKey of fieldKeys) {
                const field = fieldDescriptors[fieldKey];
                
                // 배열 형태의 필드 (json-diff 결과)
                if (Array.isArray(field) && field[0] && field[0].name) {
                    fieldNames.push(field[0].name);
                }
                // 객체 형태의 필드 (단순 변경)
                else if (typeof field === 'object' && field !== null && !Array.isArray(field)) {
                    if (field.name && Array.isArray(field.name)) {
                        const [oldName, newName] = field.name;
                        fieldNames.push(newName || oldName);
                    }
                }
            }
            
            return fieldNames;
        },
        
        
        parseJsonDiff(diff, elementId) {
            return { description: 'Modified', details: '' };
        },
        
        createChangeSummary(diff, elementName, elementType) {
            // 복잡한 변경사항을 감지하고 요약
            const complexFields = ['fieldDescriptors', 'entities', 'operations', 'relations', 'queryParameters', 'createRules'];
            const hasComplexChanges = complexFields.some(field => diff[field]);
            
            // entities가 있고 그 안에 elements가 있는 경우도 복잡한 변경사항으로 간주
            const hasNestedEntities = diff.entities && diff.entities.elements;
            const hasComplexNestedStructure = hasComplexChanges || hasNestedEntities;
            
            if (!hasComplexNestedStructure) {
                return null;
            }
            
            // 통합된 파싱 로직 사용
            return this.parseElementChanges(diff);
        },
        
        summarizeFieldDescriptors(fieldDescriptors) {
            const fieldKeys = Object.keys(fieldDescriptors).filter(k => k !== '_t');
            if (fieldKeys.length === 0) return null;
            
            const addedFields = [];
            const deletedFields = [];
            const modifiedFields = [];
            
            for (const fieldKey of fieldKeys) {
                const field = fieldDescriptors[fieldKey];
                if (Array.isArray(field) && field[0] && field[0].name) {
                    const fieldName = field[0].name;
                    const fieldType = field[0].className || 'Unknown';
                    
                    if (fieldKey.startsWith('_')) {
                        deletedFields.push(`"${fieldName}" (${fieldType})`);
                    } else if (field[1] > 0) {
                        addedFields.push(`"${fieldName}" (${fieldType})`);
                    } else if (field[2] > 0) {
                        deletedFields.push(`"${fieldName}" (${fieldType})`);
                    } else {
                        modifiedFields.push(`"${fieldName}" (${fieldType})`);
                    }
                }
            }
            
            const changes = [];
            if (addedFields.length > 0) {
                changes.push(`Added ${addedFields.length} field${addedFields.length > 1 ? 's' : ''}: ${addedFields.slice(0, 3).join(', ')}${addedFields.length > 3 ? '...' : ''}`);
            }
            if (deletedFields.length > 0) {
                changes.push(`Deleted ${deletedFields.length} field${deletedFields.length > 1 ? 's' : ''}: ${deletedFields.slice(0, 3).join(', ')}${deletedFields.length > 3 ? '...' : ''}`);
            }
            if (modifiedFields.length > 0) {
                changes.push(`Modified ${modifiedFields.length} field${modifiedFields.length > 1 ? 's' : ''}: ${modifiedFields.slice(0, 3).join(', ')}${modifiedFields.length > 3 ? '...' : ''}`);
            }
            
            if (changes.length === 0) return null;
            
            return {
                summary: `Modified fields: ${changes.join(', ')}`,
                details: `${elementName} (${elementType})`
            };
        },
        
        summarizeComplexEntities(entities, elementName, elementType) {
            // entities 안에 elements가 있는 복잡한 구조 처리
            if (entities.elements) {
                return this.summarizeNestedEntities(entities.elements, elementName, elementType);
            }
            
            // 기존 단순한 entities 구조 처리
            return this.summarizeEntities(entities, elementName, elementType);
        },
        
        summarizeNestedEntities(nestedEntities, elementName, elementType) {
            const elementIds = Object.keys(nestedEntities);
            if (elementIds.length === 0) return null;
            
            const changes = [];
            let totalFieldChanges = 0;
            let totalOperationChanges = 0;
            let totalRelationChanges = 0;
            
            for (const elementId of elementIds) {
                const element = nestedEntities[elementId];
                if (Array.isArray(element) && element[0]) {
                    const elementData = element[0];
                    
                    // 각 element의 변경사항 카운트
                    if (elementData.fieldDescriptors) {
                        const fieldKeys = Object.keys(elementData.fieldDescriptors).filter(k => k !== '_t');
                        totalFieldChanges += fieldKeys.length;
                    }
                    
                    if (elementData.operations) {
                        const opKeys = Object.keys(elementData.operations).filter(k => k !== '_t');
                        totalOperationChanges += opKeys.length;
                    }
                    
                    if (elementData.relations) {
                        const relKeys = Object.keys(elementData.relations).filter(k => k !== '_t');
                        totalRelationChanges += relKeys.length;
                    }
                }
            }
            
            if (totalFieldChanges > 0) {
                changes.push(`${totalFieldChanges} field changes`);
            }
            if (totalOperationChanges > 0) {
                changes.push(`${totalOperationChanges} operation changes`);
            }
            if (totalRelationChanges > 0) {
                changes.push(`${totalRelationChanges} relation changes`);
            }
            
            if (changes.length === 0) return null;
            
            return {
                summary: `Modified ${elementIds.length} entities: ${changes.join(', ')}`,
                details: `Complex nested changes in ${elementIds.length} entities`
            };
        },
        
        summarizeEntities(entities, elementName, elementType) {
            const entityKeys = Object.keys(entities).filter(k => k !== '_t');
            if (entityKeys.length === 0) return null;
            
            // entities가 너무 복잡한 경우 간단히 요약만 표시
            const totalChanges = entityKeys.length;
            const addedCount = entityKeys.filter(key => !key.startsWith('_') && entities[key][1] > 0).length;
            const deletedCount = entityKeys.filter(key => key.startsWith('_') || entities[key][2] > 0).length;
            const modifiedCount = totalChanges - addedCount - deletedCount;
            
            const changes = [];
            if (addedCount > 0) {
                changes.push(`Added ${addedCount} entit${addedCount > 1 ? 'ies' : 'y'}`);
            }
            if (deletedCount > 0) {
                changes.push(`Deleted ${deletedCount} entit${deletedCount > 1 ? 'ies' : 'y'}`);
            }
            if (modifiedCount > 0) {
                changes.push(`Modified ${modifiedCount} entit${modifiedCount > 1 ? 'ies' : 'y'}`);
            }
            
            if (changes.length === 0) return null;
            
            return {
                summary: `Modified entities: ${changes.join(', ')}`,
                details: `${elementName} (${elementType})`
            };
        },
        
        summarizeOperations(operations, elementName, elementType) {
            const operationKeys = Object.keys(operations).filter(k => k !== '_t');
            if (operationKeys.length === 0) return null;
            
            const addedOps = [];
            const deletedOps = [];
            const modifiedOps = [];
            
            for (const opKey of operationKeys) {
                const operation = operations[opKey];
                if (Array.isArray(operation) && operation[0] && operation[0].class) {
                    const opName = Array.isArray(operation[0].class) ? 
                        operation[0].class[1] || operation[0].class[0] : 
                        operation[0].class;
                    
                    if (opKey.startsWith('_')) {
                        deletedOps.push(`"${opName}"`);
                    } else if (operation[1] > 0) {
                        addedOps.push(`"${opName}"`);
                    } else if (operation[2] > 0) {
                        deletedOps.push(`"${opName}"`);
                    } else {
                        modifiedOps.push(`"${opName}"`);
                    }
                }
            }
            
            const changes = [];
            if (addedOps.length > 0) {
                changes.push(`Added ${addedOps.length} operation${addedOps.length > 1 ? 's' : ''}: ${addedOps.slice(0, 3).join(', ')}${addedOps.length > 3 ? '...' : ''}`);
            }
            if (deletedOps.length > 0) {
                changes.push(`Deleted ${deletedOps.length} operation${deletedOps.length > 1 ? 's' : ''}: ${deletedOps.slice(0, 3).join(', ')}${deletedOps.length > 3 ? '...' : ''}`);
            }
            if (modifiedOps.length > 0) {
                changes.push(`Modified ${modifiedOps.length} operation${modifiedOps.length > 1 ? 's' : ''}: ${modifiedOps.slice(0, 3).join(', ')}${modifiedOps.length > 3 ? '...' : ''}`);
            }
            
            if (changes.length === 0) return null;
            
            return {
                summary: `Modified operations: ${changes.join(', ')}`,
                details: `${elementName} (${elementType})`
            };
        },
        
        summarizeRelations(relations, elementName, elementType) {
            const relationKeys = Object.keys(relations).filter(k => k !== '_t');
            if (relationKeys.length === 0) return null;
            
            const addedRels = [];
            const deletedRels = [];
            const modifiedRels = [];
            
            for (const relKey of relationKeys) {
                const relation = relations[relKey];
                if (Array.isArray(relation) && relation[0]) {
                    const relName = relation[0].name || `Relation ${relKey}`;
                    
                    if (relKey.startsWith('_')) {
                        deletedRels.push(`"${relName}"`);
                    } else if (relation[1] > 0) {
                        addedRels.push(`"${relName}"`);
                    } else if (relation[2] > 0) {
                        deletedRels.push(`"${relName}"`);
                    } else {
                        modifiedRels.push(`"${relName}"`);
                    }
                }
            }
            
            const changes = [];
            if (addedRels.length > 0) {
                changes.push(`Added ${addedRels.length} relation${addedRels.length > 1 ? 's' : ''}: ${addedRels.slice(0, 3).join(', ')}${addedRels.length > 3 ? '...' : ''}`);
            }
            if (deletedRels.length > 0) {
                changes.push(`Deleted ${deletedRels.length} relation${deletedRels.length > 1 ? 's' : ''}: ${deletedRels.slice(0, 3).join(', ')}${deletedRels.length > 3 ? '...' : ''}`);
            }
            if (modifiedRels.length > 0) {
                changes.push(`Modified ${modifiedRels.length} relation${modifiedRels.length > 1 ? 's' : ''}: ${modifiedRels.slice(0, 3).join(', ')}${modifiedRels.length > 3 ? '...' : ''}`);
            }
            
            if (changes.length === 0) return null;
            
            return {
                summary: `Modified relations: ${changes.join(', ')}`,
                details: `${elementName} (${elementType})`
            };
        },
        
        parseFieldDescriptorsChange(fieldDescriptors, elementName, elementType) {
            const fieldSummary = this.getSimpleFieldSummary(fieldDescriptors);
            if (fieldSummary) {
                return {
                    description: fieldSummary,
                    details: ''
                };
            }
            
            return {
                description: 'Modified fields',
                details: ''
            };
        },
        
        parseFieldChange(key, value, elementName, elementType) {
            // fieldDescriptors의 경우 자세한 정보 표시
            if (key === 'fieldDescriptors' && typeof value === 'object' && value !== null) {
                return this.parseFieldDescriptorsChange(value, elementName, elementType);
            }
            
            // 복잡한 중첩 구조인 경우 간단히 요약
            if (this.isComplexNestedStructure(key, value)) {
                return this.summarizeComplexField(key, value, elementName, elementType);
            }
            
            // 배열 형태의 diff (json-diff의 일반적인 형태)
            if (Array.isArray(value) && value.length === 2) {
                const [oldValue, newValue] = value;
                return {
                    description: `Changed ${key} from "${this.formatValue(oldValue)}" to "${this.formatValue(newValue)}"`,
                    details: `${elementName} (${elementType})`
                };
            }
            
            // 객체 형태의 diff
            if (typeof value === 'object' && value !== null) {
                // 특정 패턴을 가진 객체들에 대한 처리
                const patternResult = this.parsePatternBasedDiff(key, value, elementName, elementType);
                if (patternResult) {
                    return patternResult;
                }
                
                // 일반적인 객체 변경 - 재귀적으로 처리하되 깊이 제한
                const subChanges = [];
                const maxDepth = 2; // 최대 깊이 제한
                this.parseFieldChangeRecursive(key, value, elementName, elementType, subChanges, 0, maxDepth);
                
                if (subChanges.length > 0) {
                    // 너무 많은 변경사항이 있으면 요약
                    if (subChanges.length > 5) {
                    return {
                        description: `Modified ${key}: ${subChanges.length} changes`,
                        details: ''
                    };
                    }
                    return {
                        description: `Modified ${key}:\n${subChanges.join('\n')}`,
                        details: ''
                    };
                }
            }
            
            // 단순 값 변경
            return {
                description: `Modified ${key}`,
                details: `${elementName} (${elementType})`
            };
        },
        
        isComplexNestedStructure(key, value) {
            // 복잡한 중첩 구조인지 판단
            if (typeof value !== 'object' || value === null) return false;
            
            // entities, fieldDescriptors, operations, relations 등은 복잡한 구조
            const complexKeys = ['entities', 'fieldDescriptors', 'operations', 'relations'];
            if (complexKeys.includes(key)) return true;
            
            // 중첩된 객체가 너무 많은 경우
            const keys = Object.keys(value).filter(k => k !== '_t');
            if (keys.length > 10) return true;
            
            // entities 안에 elements가 있는 경우
            if (value.elements && typeof value.elements === 'object') return true;
            
            return false;
        },
        
        summarizeComplexField(key, value, elementName, elementType) {
            // 복잡한 필드를 간단히 요약
            if (key === 'fieldDescriptors') {
                const fieldKeys = Object.keys(value).filter(k => k !== '_t');
                return {
                    description: `Modified fields: ${fieldKeys.length} changes`,
                    details: `${elementName} (${elementType})`
                };
            }
            
            if (key === 'entities') {
                if (value.elements) {
                    const elementIds = Object.keys(value.elements);
                    return {
                        description: `Modified entities: ${elementIds.length} entities`,
                        details: `${elementName} (${elementType})`
                    };
                }
                const entityKeys = Object.keys(value).filter(k => k !== '_t');
                return {
                    description: `Modified entities: ${entityKeys.length} changes`,
                    details: `${elementName} (${elementType})`
                };
            }
            
            if (key === 'operations') {
                const opKeys = Object.keys(value).filter(k => k !== '_t');
                return {
                    description: `Modified operations: ${opKeys.length} changes`,
                    details: `${elementName} (${elementType})`
                };
            }
            
            if (key === 'relations') {
                const relKeys = Object.keys(value).filter(k => k !== '_t');
                return {
                    description: `Modified relations: ${relKeys.length} changes`,
                    details: `${elementName} (${elementType})`
                };
            }
            
            // 기타 복잡한 필드
            const keys = Object.keys(value).filter(k => k !== '_t');
            return {
                description: `Modified ${key}: ${keys.length} changes`,
                details: `${elementName} (${elementType})`
            };
        },
        
        parseFieldChangeRecursive(key, value, elementName, elementType, subChanges, depth, maxDepth) {
            if (depth >= maxDepth) {
                subChanges.push(`${key}...`);
                return;
            }
            
            for (const [subKey, subValue] of Object.entries(value)) {
                if (subKey === '_t') continue;
                
                if (typeof subValue === 'object' && subValue !== null && !Array.isArray(subValue)) {
                    // 객체인 경우 재귀 호출
                    this.parseFieldChangeRecursive(subKey, subValue, elementName, elementType, subChanges, depth + 1, maxDepth);
                } else if (Array.isArray(subValue) && subValue.length === 2) {
                    // 배열 diff인 경우
                    const [oldVal, newVal] = subValue;
                    subChanges.push(`${subKey}: "${this.formatValue(oldVal)}" → "${this.formatValue(newVal)}"`);
                } else {
                    // 단순 값인 경우
                    subChanges.push(`Modified ${subKey}`);
                }
            }
        },
        
        parsePatternBasedDiff(key, value, elementName, elementType) {
            // 복잡한 패턴은 이미 createChangeSummary에서 처리되므로 간단한 패턴만 처리
            if (key === 'createRules' && this.isCreateRulesPattern(value)) {
                return this.parseCreateRulesPattern(value, key, elementName, elementType);
            }
            
            if (this.isArrayOfArraysPattern(value)) {
                return this.parseArrayOfArrays(value, key, elementName, elementType);
            }
            
            return null;
        },
        
        isFieldDescriptorPattern(value) {
            // 범용 배열 패턴: {0: [itemInfo, ...], 1: [...], _t: "a/d"}
            return this.isGenericArrayPattern(value, (item) => 
                Array.isArray(item) && 
                item.length >= 1 && 
                typeof item[0] === 'object' && 
                item[0]._type && 
                item[0].name
            );
        },
        
        isNestedObjectPattern(value) {
            // 범용 중첩 객체 패턴: {key: {subKey: value, ...}, ...}
            return this.isGenericObjectPattern(value, (subValue) => 
                typeof subValue === 'object' && 
                subValue !== null && 
                !Array.isArray(subValue)
            );
        },
        
        isArrayOfArraysPattern(value) {
            // 범용 배열의 배열 패턴: [[old, new], [old, new], ...]
            return Array.isArray(value) && value.some(item => 
                Array.isArray(item) && item.length === 2
            );
        },
        
        isCreateRulesPattern(value) {
            // createRules 특별 패턴: {0: {when: [...], fieldMapping: {...}}, 1: {...}}
            return this.isGenericObjectPattern(value, (subValue) => 
                typeof subValue === 'object' && 
                subValue !== null && 
                (subValue.when || subValue.fieldMapping)
            );
        },
        
        isGenericArrayPattern(value, itemValidator) {
            // 범용 배열 패턴 검사
            if (typeof value === 'object' && value._t) {
                const keys = Object.keys(value).filter(k => k !== '_t');
                return keys.length > 0 && keys.every(k => 
                    Array.isArray(value[k]) && itemValidator(value[k])
                );
            }
            return false;
        },
        
        isGenericObjectPattern(value, subValueValidator) {
            // 범용 객체 패턴 검사
            if (typeof value === 'object' && value !== null) {
                const keys = Object.keys(value).filter(k => k !== '_t');
                return keys.length > 0 && keys.some(k => 
                    typeof value[k] === 'object' && 
                    value[k] !== null && 
                    subValueValidator(value[k])
                );
            }
            return false;
        },
        
        parseCreateRulesPattern(value, key, elementName, elementType) {
            const ruleKeys = Object.keys(value).filter(k => k !== '_t');
            if (ruleKeys.length === 0) return null;
            
            const changes = [];
            for (const ruleKey of ruleKeys) {
                const rule = value[ruleKey];
                if (typeof rule === 'object' && rule !== null) {
                    const ruleChanges = [];
                    
                    // when 배열 처리
                    if (rule.when && Array.isArray(rule.when)) {
                        const whenChanges = [];
                        for (let i = 0; i < rule.when.length; i++) {
                            const whenItem = rule.when[i];
                            if (Array.isArray(whenItem) && whenItem.length === 2) {
                                const [oldValue, newValue] = whenItem;
                                if (oldValue === null && newValue && newValue.name) {
                                    whenChanges.push(`Added event "${newValue.name}"`);
                                } else if (oldValue && newValue === null) {
                                    whenChanges.push(`Removed event "${this.formatValue(oldValue)}"`);
                                } else if (oldValue && newValue) {
                                    whenChanges.push(`Changed event from "${this.formatValue(oldValue)}" to "${this.formatValue(newValue)}"`);
                                }
                            }
                        }
                        if (whenChanges.length > 0) {
                            ruleChanges.push(`when: ${whenChanges.join(', ')}`);
                        }
                    }
                    
                    // fieldMapping 처리
                    if (rule.fieldMapping && typeof rule.fieldMapping === 'object') {
                        const mappingChanges = [];
                        for (const [mappingKey, mappingValue] of Object.entries(rule.fieldMapping)) {
                            if (mappingKey !== '_t' && typeof mappingValue === 'object') {
                                const fieldChanges = [];
                                
                                if (mappingValue.viewField && Array.isArray(mappingValue.viewField) && mappingValue.viewField.length === 2) {
                                    const [oldValue, newValue] = mappingValue.viewField;
                                    if (oldValue === null && newValue && newValue.name) {
                                        fieldChanges.push(`Added viewField "${newValue.name}"`);
                                    } else if (oldValue && newValue === null) {
                                        fieldChanges.push(`Removed viewField "${this.formatValue(oldValue)}"`);
                                    } else if (oldValue && newValue) {
                                        fieldChanges.push(`Changed viewField from "${this.formatValue(oldValue)}" to "${this.formatValue(newValue)}"`);
                                    }
                                }
                                
                                if (mappingValue.eventField && Array.isArray(mappingValue.eventField) && mappingValue.eventField.length === 2) {
                                    const [oldValue, newValue] = mappingValue.eventField;
                                    if (oldValue === null && newValue && newValue.name) {
                                        fieldChanges.push(`Added eventField "${newValue.name}"`);
                                    } else if (oldValue && newValue === null) {
                                        fieldChanges.push(`Removed eventField "${this.formatValue(oldValue)}"`);
                                    } else if (oldValue && newValue) {
                                        fieldChanges.push(`Changed eventField from "${this.formatValue(oldValue)}" to "${this.formatValue(newValue)}"`);
                                    }
                                }
                                
                                if (fieldChanges.length > 0) {
                                    mappingChanges.push(`[${mappingKey}]: ${fieldChanges.join(', ')}`);
                                }
                            }
                        }
                        if (mappingChanges.length > 0) {
                            ruleChanges.push(`fieldMapping: ${mappingChanges.join(', ')}`);
                        }
                    }
                    
                    if (ruleChanges.length > 0) {
                        changes.push(`Rule ${ruleKey} (${ruleChanges.join(', ')})`);
                    }
                }
            }
            
            if (changes.length > 0) {
                return {
                    description: changes.join(', '),
                    details: `${elementName} (${elementType})`
                };
            }
            return null;
        },
        
        
        parseNestedObject(value, key, elementName, elementType) {
            const changes = [];
            const significantChanges = [];
            
            for (const [subKey, subValue] of Object.entries(value)) {
                if (subKey !== '_t') {
                    const subChange = this.parseFieldChange(subKey, subValue, elementName, elementType);
                    if (subChange) {
                        // 중요한 변경사항만 추출
                        if (this.isSignificantChange(subKey, subChange.description)) {
                            significantChanges.push(subChange.description);
                        } else {
                            changes.push(subChange.description);
                        }
                    }
                }
            }
            
            if (significantChanges.length > 0) {
                return {
                    description: `Modified ${key}: ${significantChanges.join(', ')}`,
                    details: `${elementName} (${elementType})`
                };
            } else if (changes.length > 0) {
                // 중요한 변경사항이 없으면 간단히 요약
                const summary = this.summarizeChanges(changes);
                return {
                    description: `Modified ${key}: ${summary}`,
                    details: `${elementName} (${elementType})`
                };
            }
            return null;
        },
        
        isSignificantChange(key, description) {
            // 중요한 변경사항인지 판단
            const significantKeys = ['name', 'displayName', 'fieldDescriptors', 'operations', 'relations'];
            const significantPatterns = [
                /Changed name from/,
                /Changed displayName from/,
                /Added field/,
                /Deleted field/,
                /Added operation/,
                /Deleted operation/,
                /Added relation/,
                /Deleted relation/
            ];
            
            if (significantKeys.includes(key)) return true;
            return significantPatterns.some(pattern => pattern.test(description));
        },
        
        summarizeChanges(changes) {
            // 변경사항을 요약
            const fieldChanges = changes.filter(c => c.includes('field'));
            const operationChanges = changes.filter(c => c.includes('operation'));
            const relationChanges = changes.filter(c => c.includes('relation'));
            const otherChanges = changes.filter(c => 
                !c.includes('field') && !c.includes('operation') && !c.includes('relation')
            );
            
            const summary = [];
            if (fieldChanges.length > 0) {
                summary.push(`${fieldChanges.length} field changes`);
            }
            if (operationChanges.length > 0) {
                summary.push(`${operationChanges.length} operation changes`);
            }
            if (relationChanges.length > 0) {
                summary.push(`${relationChanges.length} relation changes`);
            }
            if (otherChanges.length > 0) {
                summary.push(`${otherChanges.length} other changes`);
            }
            
            return summary.join(', ');
        },
        
        parseArrayOfArrays(value, key, elementName, elementType) {
            const changes = [];
            for (let i = 0; i < value.length; i++) {
                const item = value[i];
                if (Array.isArray(item) && item.length === 2) {
                    const [oldValue, newValue] = item;
                    changes.push(`[${i}]: "${this.formatValue(oldValue)}" → "${this.formatValue(newValue)}"`);
                }
            }
            
            if (changes.length > 0) {
                return {
                    description: `Modified ${key} (${changes.join(', ')})`,
                    details: `${elementName} (${elementType})`
                };
            }
            return null;
        },
        
        determineFieldAction(fieldKey, addCount, deleteCount, globalType) {
            // 언더스코어가 붙은 키는 삭제를 의미
            if (fieldKey.startsWith('_')) {
                return 'deleted';
            }
            
            // addCount와 deleteCount가 모두 0이거나 undefined인 경우 _t 값으로 판단
            if ((addCount === 0 || addCount === undefined) && (deleteCount === 0 || deleteCount === undefined)) {
                return globalType === 'a' ? 'added' : globalType === 'd' ? 'deleted' : 'modified';
            }
            
            // addCount와 deleteCount가 있는 경우
            if (deleteCount > 0) return 'deleted';
            if (addCount > 0) return 'added';
            
            return 'modified';
        },
        
        parseFieldDescriptorsFromDiff(fieldDescriptors, elementName, elementType) {
            const fieldKeys = Object.keys(fieldDescriptors).filter(key => key !== '_t');
            if (fieldKeys.length === 0) {
                return null;
            }
            
            const changes = [];
            for (const fieldKey of fieldKeys) {
                const field = fieldDescriptors[fieldKey];
                
                // 필드 수정: {name: [oldValue, newValue]} 형태
                if (typeof field === 'object' && field !== null && !Array.isArray(field)) {
                    const fieldChanges = [];
                    for (const [property, value] of Object.entries(field)) {
                        if (Array.isArray(value) && value.length === 2) {
                            const [oldValue, newValue] = value;
                            fieldChanges.push(`${property}: "${oldValue}" → "${newValue}"`);
                        }
                    }
                    if (fieldChanges.length > 0) {
                        changes.push(`Modified field ${fieldKey} (${fieldChanges.join(', ')})`);
                    }
                }
                // 필드 추가/삭제: [fieldInfo, addCount, deleteCount] 형태
                else if (Array.isArray(field) && field[0]) {
                    const fieldInfo = field[0];
                    const addCount = field[1] || 0;
                    const deleteCount = field[2] || 0;
                    
                    if (fieldInfo && fieldInfo.name) {
                        // 언더스코어가 붙은 키는 삭제를 의미
                        if (fieldKey.startsWith('_')) {
                            changes.push(`Deleted field "${fieldInfo.name}" (${fieldInfo.className || 'Unknown'})`);
                        }
                        // addCount와 deleteCount가 모두 0인 경우 _t 값으로 판단
                        else if (addCount === 0 && deleteCount === 0) {
                            if (fieldDescriptors._t === 'a') {
                                changes.push(`Added field "${fieldInfo.name}" (${fieldInfo.className || 'Unknown'})`);
                            } else if (fieldDescriptors._t === 'd') {
                                changes.push(`Deleted field "${fieldInfo.name}" (${fieldInfo.className || 'Unknown'})`);
                            }
                        }
                        // addCount와 deleteCount가 있는 경우
                        else if (deleteCount > 0) {
                            changes.push(`Deleted field "${fieldInfo.name}" (${fieldInfo.className || 'Unknown'})`);
                        } else if (addCount > 0) {
                            changes.push(`Added field "${fieldInfo.name}" (${fieldInfo.className || 'Unknown'})`);
                        }
                    }
                }
            }
            
            if (changes.length > 0) {
                return {
                    description: changes.join(', '),
                    details: `${elementName} (${elementType})`
                };
            }
            
            return null;
        },
        
        parseAggregateRootFromDiff(aggregateRoot, elementName, elementType) {
            if (aggregateRoot.fieldDescriptors) {
                return this.parseFieldDescriptorsFromDiff(aggregateRoot.fieldDescriptors, elementName, elementType);
            } else if (aggregateRoot.operations) {
                return this.parseOperationsFromDiff(aggregateRoot.operations, elementName, elementType);
            }
            return null;
        },
        
        parseOperationsFromDiff(operations, elementName, elementType) {
            const operationKeys = Object.keys(operations).filter(key => key !== '_t');
            if (operationKeys.length === 0) {
                return null;
            }
            
            const changes = [];
            for (const operationKey of operationKeys) {
                const operation = operations[operationKey];
                if (Array.isArray(operation) && operation[0]) {
                    const operationInfo = operation[0];
                    const addCount = operation[1] || 0;
                    const deleteCount = operation[2] || 0;
                    
                    if (operationInfo && operationInfo.class) {
                        const className = Array.isArray(operationInfo.class) ? 
                            operationInfo.class[1] || operationInfo.class[0] : 
                            operationInfo.class;
                        
                        if (deleteCount > 0) {
                            changes.push(`Deleted operation "${className}"`);
                        } else if (addCount > 0) {
                            changes.push(`Added operation "${className}"`);
                        } else if (operations._t === 'a') {
                            changes.push(`Added operation "${className}"`);
                        } else if (operations._t === 'd') {
                            changes.push(`Deleted operation "${className}"`);
                        }
                    }
                }
            }
            
            if (changes.length > 0) {
                return {
                    description: changes.join(', '),
                    details: `${elementName} (${elementType})`
                };
            }
            
            return null;
        },
        
        parseQueryParametersFromDiff(queryParameters, elementName, elementType) {
            const paramKeys = Object.keys(queryParameters).filter(key => key !== '_t');
            if (paramKeys.length === 0) {
                return null;
            }
            
            const changes = [];
            for (const paramKey of paramKeys) {
                const param = queryParameters[paramKey];
                if (Array.isArray(param) && param[0]) {
                    const paramInfo = param[0];
                    const addCount = param[1] || 0;
                    const deleteCount = param[2] || 0;
                    
                    if (paramInfo && paramInfo.name) {
                        if (paramKey.startsWith('_')) {
                            changes.push(`Deleted parameter "${paramInfo.name}" (${paramInfo.className || 'Unknown'})`);
                        } else if (addCount === 0 && deleteCount === 0) {
                            if (queryParameters._t === 'a') {
                                changes.push(`Added parameter "${paramInfo.name}" (${paramInfo.className || 'Unknown'})`);
                            } else if (queryParameters._t === 'd') {
                                changes.push(`Deleted parameter "${paramInfo.name}" (${paramInfo.className || 'Unknown'})`);
                            }
                        } else if (deleteCount > 0) {
                            changes.push(`Deleted parameter "${paramInfo.name}" (${paramInfo.className || 'Unknown'})`);
                        } else if (addCount > 0) {
                            changes.push(`Added parameter "${paramInfo.name}" (${paramInfo.className || 'Unknown'})`);
                        }
                    }
                }
            }
            
            if (changes.length > 0) {
                return {
                    description: changes.join(', '),
                    details: `${elementName} (${elementType})`
                };
            }
            
            return null;
        },
        
        parseCreateRulesFromDiff(createRules, elementName, elementType) {
            const ruleKeys = Object.keys(createRules).filter(key => key !== '_t');
            if (ruleKeys.length === 0) {
                return null;
            }
            
            const changes = [];
            for (const ruleKey of ruleKeys) {
                const rule = createRules[ruleKey];
                if (typeof rule === 'object' && rule !== null) {
                    // when 배열 처리
                    if (rule.when && Array.isArray(rule.when)) {
                        const whenChanges = [];
                        for (let i = 0; i < rule.when.length; i++) {
                            const whenItem = rule.when[i];
                            if (Array.isArray(whenItem) && whenItem.length === 2) {
                                const [oldValue, newValue] = whenItem;
                                whenChanges.push(`when[${i}]: "${this.formatValue(oldValue)}" → "${this.formatValue(newValue)}"`);
                            }
                        }
                        if (whenChanges.length > 0) {
                            changes.push(`Rule ${ruleKey} (${whenChanges.join(', ')})`);
                        }
                    }
                    
                    // fieldMapping 처리
                    if (rule.fieldMapping && typeof rule.fieldMapping === 'object') {
                        const mappingChanges = [];
                        for (const [mappingKey, mappingValue] of Object.entries(rule.fieldMapping)) {
                            if (mappingKey !== '_t' && typeof mappingValue === 'object') {
                                if (mappingValue.viewField && Array.isArray(mappingValue.viewField) && mappingValue.viewField.length === 2) {
                                    const [oldValue, newValue] = mappingValue.viewField;
                                    mappingChanges.push(`viewField: "${this.formatValue(oldValue)}" → "${this.formatValue(newValue)}"`);
                                }
                                if (mappingValue.eventField && Array.isArray(mappingValue.eventField) && mappingValue.eventField.length === 2) {
                                    const [oldValue, newValue] = mappingValue.eventField;
                                    mappingChanges.push(`eventField: "${this.formatValue(oldValue)}" → "${this.formatValue(newValue)}"`);
                                }
                            }
                        }
                        if (mappingChanges.length > 0) {
                            changes.push(`Rule ${ruleKey} mapping (${mappingChanges.join(', ')})`);
                        }
                    }
                }
            }
            
            if (changes.length > 0) {
                return {
                    description: changes.join(', '),
                    details: `${elementName} (${elementType})`
                };
            }
            
            return null;
        },
        
        formatValue(value) {
            if (value === null) return 'null';
            if (value === undefined) return 'undefined';
            if (typeof value === 'string') return value;
            if (typeof value === 'number' || typeof value === 'boolean') return String(value);
            if (Array.isArray(value)) return `[Array(${value.length})]`;
            if (typeof value === 'object') {
                if (value._type) {
                    return `${value._type}${value.name ? ` (${value.name})` : ''}`;
                }
                if (value.name) {
                    return value.name;
                }
                if (value.id) {
                    return `Object(${value.id})`;
                }
                return '[Object]';
            }
            return String(value);
        }
        
        // 기존 parseFieldDescriptorsChanges는 parseFieldDescriptorsFromDiff로 대체됨
        // 기존의 복잡한 메서드들은 parseJsonDiff와 관련 메서드들로 대체됨
    }
}
</script>

<style scoped>
.history-content {
    min-height: 40px;
}

.v-timeline-item {
    margin-bottom: 16px;
}

.v-card:hover {
    background-color: #f5f5f5;
}

.detailed-changes {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.4;
    white-space: pre-line;
}

.detailed-changes .font-weight-medium {
    color: #1976d2;
    margin-bottom: 4px;
}

.detailed-changes .caption {
    color: #666;
    margin-bottom: 8px;
}

.v-expand-transition {
    transition: all 0.3s ease;
}
</style>
