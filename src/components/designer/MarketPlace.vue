<template>
    <div style="height:85vh; background-color:white;">
        <v-row style="margin:0px; padding:0px; margin-top: 20px;">
            <v-col cols="auto">
                <v-icon v-if="detailMarketMode" @click="closeDetailDialog()" class="marketplace-details-page-back-btn">mdi-arrow-left</v-icon>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto">
                <v-icon @click="closeDialog()">mdi-close</v-icon>
            </v-col>
        </v-row>
        <div v-if="!detailMarketMode">
            <div v-if="isPBCMarket">
                <!-- PBCs -->
                <v-tabs
                        v-model="tab"
                        background-color="transparent"
                        color="blue darken-1"
                        show-arrows
                        centered
                >
                    <div v-for="(tabObj,index) in filterTabLists" style="align-self: center;">
                        <v-tab
                                v-if="tabObj.show"
                                :disabled="showLoading && index != selectedTabIndex"
                                :href="`#${tabObj.id}`"
                                :key="tabObj.key"
                                style="height:45px; width: max-content;"
                        >
                            {{tabObj.display}}
                            <v-avatar v-if="tabObj.id != 'pbcs' && tabObj.totalCount != null" color="green lighten-5" size="30"
                                      style="margin-left: 5px;margin-bottom: 15px; font-size:10px;">
                                {{tabObj.totalCount == null ? '...': (tabObj.totalCount == 0 ? '0' : tabObj.totalCount)}}
                            </v-avatar>
                        </v-tab>
                    </div>
                    <v-row style="width:100%; height:57px;" dense>
                        <v-icon @click="searchOpen = !searchOpen" style="width:26px; height:26px; margin-top:16px; margin-left:15px;">mdi-magnify</v-icon>
                    </v-row>
                </v-tabs>
                <v-tabs-items v-model="selectedTabIndex">
                    <v-tab-item v-if="selectedTabIndex == -1" :value="selectedTabIndex">
                        <!-- SEARCH -->
                        <v-row style="margin-top:0px;">
                            <v-col v-if="showLoading || (filteredList == undefined && typeof filteredList == 'undefined')"
                                   style="height: 100%;">
                                <v-row>
                                    <v-col
                                            v-for="idx in 9"
                                            cols="6"
                                            md="4"
                                    >
                                        <v-card
                                                outlined
                                                class="mx-auto"
                                                style="width: 500px; height: 400px; justify-content: center"
                                                align="center"
                                        >
                                            <v-skeleton-loader
                                                    ref="skeleton"
                                                    type="card"
                                                    class="mx-auto"
                                            >
                                            </v-skeleton-loader>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col v-else-if="filteredList == null && typeof filteredList == 'object' "
                                   style="height: 590px;">
                                No Items
                            </v-col>
                            <v-col
                                    v-else
                                    v-for="(project,index) in filteredList"
                                    :key="project.projectId"
                                    xl="4"
                                    lg="4"
                                    md="6"
                                    sm="12"
                            >
                                <EventStormingListCard
                                        :information="project"
                                        @delete="deleteProjectItem"
                                >
                                    <template slot="chips">
                                        <slot name="chips"></slot>
                                    </template>
                                    <template slot="action" slot-scope="project">
                                        <slot name="action" :project="project"></slot>
                                    </template>
                                </EventStormingListCard>
                            </v-col>
                        </v-row>
                    </v-tab-item>

                    <v-tab-item v-else-if="selectedTabIndex == 2" :value="selectedTabIndex" >
                        <!-- PBCs -->
                        <v-row v-if="isPBCLoding" class="ma-0">
                            <v-col cols="2" style="padding:25px;">
                                <v-skeleton-loader v-for="n in pbcTags.length" :key="n"
                                                class="mx-auto border marketplace-loding-menu"
                                                type="avatar, text"
                                ></v-skeleton-loader>
                            </v-col>
                            <v-col cols="10">
                                <v-container class="marketplace-skeleton-container">
                                    <v-row>
                                        <v-col cols="10" lg="2" md="3" sm="6" v-for="n in 9" :key="n">
                                            <v-skeleton-loader
                                                    class="mx-auto border marketplace-loding-card"
                                                    max-width="300"
                                                    type="image, text@2"
                                            ></v-skeleton-loader>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-col>
                        </v-row>
                        <v-row  v-else class="ma-0">
                            <v-col cols="2">
                                <v-list dense>
                                    <v-list-item-group
                                            color="primary"
                                    >
                                        <v-list-item
                                                v-for="(item, i) in pbcTags"
                                                :key="i"
                                                @click="clickFilteredPBC(i)"
                                        >
                                            <v-list-item-icon class="marketplace-list-icon-box">
                                                <Icon class="gs-icon-style marketplace-list-icon"
                                                    :icon="item.icon"
                                                />
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                <v-list-item-title>{{ item.name }}</v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list-item-group>
                                </v-list>
                            </v-col>
                            <v-col cols="10">
                                <v-row class="marketplace-card-row ma-0">
                                    <v-col cols="12" lg="2" md="3" sm="6"
                                        v-for="temp in filteredPBCLists" :key="temp.id"
                                    >
                                        <v-card class="marketplace-card" outlined>
                                            <div class="marketplace-image-text-container">
                                                <v-img class="marketplace-card-image" :src="temp.imageUrl" />
                                                <v-card-subtitle class="marketplace-card-subtitle"
                                                    @click="openPBCDetailDialog(temp)"
                                                >{{ temp.description }}
                                                </v-card-subtitle>
                                            </div>
                                            <v-card-title class="marketplace-card-title">{{ temp.name }}</v-card-title>
                                            <v-rating
                                                    class="marketplace-rating"
                                                    v-model="temp.rating"
                                                    bg-color="gray"
                                                    color="#231813"
                                                    half-increments
                                                    readonly
                                                    size="18"
                                            >
                                                Rating: {{ temp.rating }}
                                            </v-rating>
                                        </v-card>
                                    </v-col>
                                    <v-col v-if="isTemplateLoding"
                                        cols="10" lg="2" md="3" sm="6"
                                    >
                                        <v-skeleton-loader
                                                class="mx-auto border marketplace-loding-card"
                                                max-width="300"
                                                type="image, text@2"
                                        ></v-skeleton-loader>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-tab-item>

                    <v-tab-item v-else-if="selectedTabIndex < standardTabCount" :value="selectedTabIndex" :key="selectedTabIndex">
                        <v-row style="margin-top:0px;">
                            <v-col v-if="(showLoading && filteredList && filteredList.length < 10) || filteredList == undefined && typeof filteredList == 'undefined'">
                                <v-row>
                                    <v-col
                                            v-for="idx in 9"
                                            cols="6"
                                            md="4"
                                    >
                                        <v-card
                                                outlined
                                                class="mx-auto"
                                                style="width: 500px; height: 400px; justify-content: center"
                                                align="center"
                                        >
                                            <v-skeleton-loader
                                                    ref="skeleton"
                                                    type="card"
                                                    class="mx-auto"
                                            >
                                            </v-skeleton-loader>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col v-else-if="filteredList == null && typeof filteredList == 'object'">
                                No Items
                            </v-col>
                            <v-col
                                    v-else
                                    v-for="(project,index) in filteredList"
                                    :key="project.projectId"
                                    xl="4"
                                    lg="4"
                                    md="6"
                                    sm="12"
                            >
                                <PBCModelCard
                                        :information.sync="project"
                                        @selected-model="selectedModel"
                                ></PBCModelCard>
                            </v-col>
                        </v-row>
                    </v-tab-item>
                </v-tabs-items>
                <div style="text-align-last: center;" v-if="filterTabLists[selectedTabIndex].id != 'pbcs' ">
                    <div block text style="padding:10px 0 10px 0;">최대 27개 표시(최근 수정날짜 기준)</div>
                </div>

                <!-- Search -->
                <v-alert v-if="searchOpen" elevation="2" style="position:fixed; top:0px; z-index:2; height:70px; width:40%; left: 50%; transform: translate(-50%, 0%);">
                    <div>
                        <v-row>
                            <v-text-field
                                    v-model="searchObj.name"
                                    outlined
                                    class="gs-main-search"
                                    :label="searchObj.name ? filterListsCount : 'Search for name'"
                                    autofocus
                                    hide-details
                                    dense
                            ></v-text-field>
                            <v-icon @click="searchClose(true)" style="width:26px; height:26px; margin-top: 13px;">mdi-close</v-icon>
                        </v-row>
                        <v-row>
                            <v-btn @click="searchClose()" block text style="height: 25px"> <v-icon>mdi-chevron-up</v-icon> </v-btn>
                        </v-row>
                    </div>
                </v-alert>
            </div>
            <div v-else>    
                <!-- Templates, Toppings -->
                <h1 style="text-align:center;">Marketplace</h1>
                <v-tabs v-if="templateLists.length > 1"
                        v-model="tab"
                        bg-color="primary"
                        show-arrows
                        centered
                        style="width: 100%;"

                >
                    <v-tab value="templates" class="marketplace-margin-place-tab">Templates</v-tab>
                    <v-tab value="toppings" class="marketplace-margin-place-tab">Toppings</v-tab>
                </v-tabs>
                <v-row v-if="templateLists.length < 1"
                    class="ma-0"
                >
                    <v-col cols="2" style="padding:25px;">
                        <v-skeleton-loader v-for="n in templateTags.length" :key="n"
                                        class="mx-auto border marketplace-loding-menu"
                                        type="avatar, text"
                        ></v-skeleton-loader>
                    </v-col>
                    <v-col cols="10">
                        <v-container class="marketplace-skeleton-container">
                            <v-row>
                                <v-col cols="10" lg="2" md="3" sm="6" v-for="n in 9" :key="n">
                                    <v-skeleton-loader
                                            class="mx-auto border marketplace-loding-card"
                                            max-width="300"
                                            type="image, text@2"
                                    ></v-skeleton-loader>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-col>
                </v-row>
                <v-tabs-items v-model="tab">
                    <v-tab-item key="templates">
                        <v-row class="ma-0">
                            <v-col cols="2">
                                <v-list dense>
                                    <v-list-item-group
                                            color="primary"
                                    >
                                        <v-list-item
                                                v-for="(item, i) in templateTags"
                                                :key="i"
                                                @click="clickFilteredTemplate(i)"
                                        >
                                            <v-list-item-icon class="marketplace-list-icon-box">
                                                <Icon class="gs-icon-style marketplace-list-icon"
                                                    :icon="item.icon"
                                                />
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                <v-list-item-title>{{ item.name }}</v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list-item-group>
                                </v-list>
                            </v-col>
                            <v-col cols="10">
                                <v-row class="marketplace-card-row ma-0">
                                    <v-col cols="12" lg="2" md="3" sm="6"
                                        v-for="temp in filteredTemplateLists" :key="temp.id"
                                    >
                                        <v-card class="marketplace-card" outlined>
                                            <div class="marketplace-image-text-container">
                                                <v-img class="marketplace-card-image" :src="temp.imageUrl" />
                                                <v-card-subtitle class="marketplace-card-subtitle"
                                                    @click="openTempDetailDialog(temp)"
                                                >{{ temp.description }}
                                                </v-card-subtitle>
                                            </div>
                                            <v-card-title class="marketplace-card-title">{{ temp.name }}</v-card-title>
                                            <v-rating
                                                    class="marketplace-rating"
                                                    v-model="temp.rating"
                                                    bg-color="gray"
                                                    color="#231813"
                                                    half-increments
                                                    readonly
                                                    size="18"
                                            >
                                                Rating: {{ temp.rating }}
                                            </v-rating>
                                        </v-card>
                                    </v-col>
                                    <v-col v-if="isTemplateLoding"
                                        cols="10" lg="2" md="3" sm="6"
                                    >
                                        <v-skeleton-loader
                                                class="mx-auto border marketplace-loding-card"
                                                max-width="300"
                                                type="image, text@2"
                                        ></v-skeleton-loader>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-tab-item>
                    <v-tab-item key="toppings">
                        <v-row class="ma-0">
                            <v-col cols="2">
                                <v-list dense>
                                    <v-list-item-group
                                            color="primary"
                                    >
                                        <v-list-item
                                                v-for="(item, i) in toppingTags"
                                                :key="i"
                                                @click="clickFilteredTopping(i)"
                                        >
                                            <v-list-item-icon class="marketplace-list-icon-box">
                                                <Icon class="gs-icon-style marketplace-list-icon"
                                                    :icon="item.icon"
                                                />
                                            </v-list-item-icon>
                                            <v-list-item-content>
                                                <v-list-item-title>{{ item.name }}</v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list-item-group>
                                </v-list>
                            </v-col>
                            <v-col cols="10">
                                <v-row class="marketplace-card-row">
                                    <v-col cols="12" lg="2" md="3" sm="6"
                                        v-for="topping in filteredToppingLists" :key="topping.id"
                                    >
                                        <v-card class="marketplace-card" outlined>
                                            <div>
                                                <div class="marketplace-image-text-container">
                                                    <v-img class="marketplace-card-image" :src="topping.imageUrl"></v-img>
                                                    <v-card-subtitle @click="openToppingDetailDialog(topping)"
                                                                    class="marketplace-card-subtitle"
                                                    >{{ topping.description }}
                                                    </v-card-subtitle>
                                                </div>
                                                <v-card-title class="marketplace-card-title">{{ topping.name }}</v-card-title>
                                                <v-rating
                                                        class="marketplace-rating"
                                                        v-model="topping.rating"
                                                        bg-color="gray"
                                                        color="#231813"
                                                        half-increments
                                                        readonly
                                                        size="18"
                                                >
                                                    Rating: {{ topping.rating }}
                                                </v-rating>
                                            </div>
                                        </v-card>
                                    </v-col>
                                    <v-col v-if="isToppingLoding"  
                                        cols="10" lg="2" md="3" sm="6"
                                    >
                                        <v-skeleton-loader
                                                class="mx-auto border marketplace-loding-card"
                                                max-width="300"
                                                type="image, text@2"
                                        ></v-skeleton-loader>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-tab-item>
                </v-tabs-items>
            </div>
        </div>
        <div v-else class="marketplace-details-page-box">
            <div v-if="selectedTemplate">
                <div>
                    <v-row class="marketplace-details-page-row">
                        <v-col cols="5" lg="3" md="4" sm="5"
                               class="marketplace-details-page-col"
                        >
                            <v-img :src="selectedTemplate.imageUrl"></v-img>
                            <v-card-title>{{ selectedTemplate.name }}</v-card-title>
                            <v-card-subtitle>{{ selectedTemplate.description }}</v-card-subtitle>
                            <v-rating
                                    class="marketplace-details-page-rating"
                                    v-model="selectedTemplate.rating"
                                    bg-color="gray"
                                    color="#231813"
                                    half-increments
                                    readonly
                                    size="16"
                            >
                                Rating: {{ selectedTemplate.rating }}
                            </v-rating>
                            <div class="marketplace-chip-box">
                                <div>tags:</div>
                                <v-chip v-for="tag in selectedTemplate.tags" :key="tag"
                                >{{ tag }}
                                </v-chip>
                            </div>
                            <v-btn @click="applyTemplate(selectedTemplate)" color="primary"
                                   class="marketplace-details-page-apply-btn"
                            >apply
                            </v-btn>
                        </v-col>
                        <v-divider vertical />
                        <v-col cols="7" lg="9" md="8" sm="7">
                            <vue-markdown
                                    v-if="selectedTemplate && selectedTemplate.instruction"
                                    class="markdown-body marketplace-markdown"
                                    :source="selectedTemplate.instruction"
                            >
                            </vue-markdown>
                        </v-col>
                    </v-row>
                </div>
            </div>
            <div v-else-if="selectedTopping">
                <div>
                    <v-row class="marketplace-details-page-row">
                        <v-col cols="5" lg="3" md="4" sm="5"
                               class="marketplace-details-page-col"
                        >
                            <v-img :src="selectedTopping.imageUrl"></v-img>
                            <v-card-title>{{ selectedTopping.name }}</v-card-title>
                            <v-card-subtitle>{{ selectedTopping.description }}</v-card-subtitle>
                            <v-rating
                                    class="marketplace-details-page-rating"
                                    v-model="selectedTopping.rating"
                                    bg-color="gray"
                                    color="#231813"
                                    half-increments
                                    readonly
                                    size="16"
                            >
                                Rating: {{ selectedTopping.rating }}
                            </v-rating>
                            <div class="marketplace-chip-box">
                                <div>
                                    tags:
                                    <v-chip v-for="tag in selectedTopping.tags" :key="tag">{{ tag }}</v-chip>
                                </div>
                                <div v-if="!isToppingCompatible(selectedTopping)">
                                    depends:
                                    <v-chip v-for="depends in selectedTopping.depends">{{ depends }}</v-chip>
                                </div>
                            </div>

                            <v-btn @click="applyTopping(selectedTopping)" color="primary"
                                   class="marketplace-details-page-apply-btn"
                                   :disabled="!isToppingCompatible(selectedTopping)"
                            >apply
                            </v-btn>
                        </v-col>
                        <v-divider vertical />
                        <v-col cols="7" lg="9" md="8" sm="7">
                            <vue-markdown
                                    v-if="selectedTopping && selectedTopping.instruction"
                                    class="markdown-body marketplace-markdown"
                                    :source="selectedTopping.instruction"
                            >
                            </vue-markdown>
                        </v-col>
                    </v-row>
                </div>
            </div>
            <div v-else-if="selectedPBC">
                <div>
                    <v-row class="marketplace-details-page-row">
                        <v-col cols="5" lg="3" md="4" sm="5"
                               class="marketplace-details-page-col"
                        >
                            <v-img :src="selectedPBC.imageUrl"></v-img>
                            <v-card-title>{{ selectedPBC.name }}</v-card-title>
                            <v-card-subtitle>{{ selectedPBC.description }}</v-card-subtitle>
                            <v-rating
                                    class="marketplace-details-page-rating"
                                    v-model="selectedPBC.rating"
                                    bg-color="gray"
                                    color="#231813"
                                    half-increments
                                    readonly
                                    size="16"
                            >
                                Rating: {{ selectedPBC.rating }}
                            </v-rating>
                            <div class="marketplace-chip-box">
                                <div>tags:</div>
                                <v-chip v-for="tag in selectedPBC.tags" :key="tag"
                                >{{ tag }}
                                </v-chip>
                            </div>
                            <v-btn @click="applyPBCElement(selectedPBC)" color="primary"
                                   class="marketplace-details-page-apply-btn"
                            >apply
                            </v-btn>
                        </v-col>
                        <v-divider vertical />
                        <v-col cols="7" lg="9" md="8" sm="7">
                            <vue-markdown
                                    v-if="selectedTemplate && selectedTemplate.instruction"
                                    class="markdown-body marketplace-markdown"
                                    :source="selectedTemplate.instruction"
                            >
                            </vue-markdown>
                        </v-col>
                    </v-row>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import VueMarkdown from 'vue-markdown';
    import AlgoliaModelLists from "../listPages/AlgoliaModelLists";
    import PBCModelCard from "./es-modeling/PBCModelCard";
    import OpenAPIPBC from "./modeling/OpenAPIPBC";

    const axios = require('axios');
    export default {
        name: 'MarketPlace',
        components: {
            'vue-markdown': VueMarkdown,
            PBCModelCard
        },
        mixins: [AlgoliaModelLists, OpenAPIPBC],
        data() {
            return {
                tab: "",
                templateLists:[],
                toppingLists:[],
                pbcLists:[],
                selectedTemplate: null,
                selectedTopping: null,
                selectedPBC: null,
                selectedToppingList: [],
                githubHeaders: null,
                allRepoList: null,
                detailMarketMode: false,
                pbcTags: [
                    { name: 'All', icon: 'icon-park-solid:id-card' },
                ],
                templateTags: [
                    { name: 'All', icon: 'id-card' },
                    { name: 'Java', icon: 'java' },
                    { name: 'Python', icon: 'python' },
                    { name: 'Go', icon: 'go' },
                    { name: 'JavaScript', icon: 'javascript' },
                    { name: 'Spring boot', icon: 'springboot' },
                ],
                toppingTags: [
                    { name: 'All', icon: 'id-card' },
                    { name: 'Multitenancy', icon: 'chart-multitype' },
                    { name: 'Kubernetes', icon: 'kubernetes' },
                    { name: 'Security', icon: 'security' },
                    { name: 'Service Mesh', icon: 'istio' },
                    { name: 'DevOps', icon: 'devops' },
                    { name: 'Data Projection', icon: 'apollostack' },
                    { name: 'Frontend', icon: 'web-page' },
                ],
                selectedTemplateIndex: null,
                selectedToppingIndex: null,
                selectedPBCIndex: null,
                isTemplateLoding: false,
                isToppingLoding: false,
                isPBCLoding: false,
                searchOpen: false,
                tabLists: [
                    { id: 'mine'  , display: 'Mine'  , show: false, count: 0, totalCount: null },
                    { id: 'public', display: 'Public', show: true , count: 0, totalCount: null },
                    { id: 'pbcs', display: 'Marketplace', show: true , count: 0, totalCount: null },
                ],
            }
        },
        props: {
            marketplaceDialog: Boolean,
            selectedBaseTemplateName: null,
            toppingPlatforms: Array,
            marketplaceType: String,
            templateList: Array,
            isPBCMarket: Boolean,
            pbc: Object
        },
        computed: {
            filteredTemplateLists() {
                var me = this;
                const selectedTags = me.selectedTemplateIndex !== null ? me.templateTags[me.selectedTemplateIndex].name : 'All';
                if (selectedTags && selectedTags !== 'All') {
                    return me.templateLists.filter(temp => {
                        if (Array.isArray(temp.tags)) {
                            return temp.tags.includes(selectedTags);
                        } else {
                            return temp.tags === selectedTags;
                        }
                    });
                }
                return me.templateLists;
            },
            filteredToppingLists() {
                var me = this;
                const selectedTags = me.selectedToppingIndex !== null ? me.toppingTags[me.selectedToppingIndex].name : 'All';
                if (selectedTags && selectedTags !== 'All') {
                    return me.toppingLists.filter(topping => {
                        if (Array.isArray(topping.tags)) {
                            return topping.tags.includes(selectedTags);
                        } else {
                            return topping.tags === selectedTags;
                        }
                    });
                }
                return me.toppingLists;
            },
            filteredPBCLists() {
                var me = this;
                const selectedTags = me.selectedPBCIndex !== null ? me.pbcTags[me.selectedPBCIndex].name : 'All';
                if (selectedTags && selectedTags !== 'All') {
                    return me.pbcLists.filter(pbc => pbc.tags.includes(selectedTags));
                }
                return me.pbcLists;
            },
            filteredList() {
                var me = this
                var lists = undefined
                if (me.filterTabLists[me.selectedTabIndex].id == 'public') {
                    lists = this.filteredPublic
                } else if (me.filterTabLists[me.selectedTabIndex].id == 'mine') {
                    lists = this.filteredMine
                }
                if (lists) {
                    return lists
                }
                return [];
            },
            filteredPublic() {
                var me = this
                if(me.public){
                    return me.public.filter(x=> x.versions || x.lastVersionName)
                }
                return []
            },
            filteredMine() {
                var me = this
                if(me.mine){
                    return me.mine.filter(x=> x.versions || x.lastVersionName)
                }
                return []
            },
            selectedTabIndex(){
                var me = this
                return me.filterTabLists.findIndex(item => item.id == me.tab)
            },
            filterTabLists() {
                var me = this
                if (me.isLogin) {
                    me.tabLists.filter(function(tabItem){
                        if(tabItem.id == 'mine'){
                            tabItem.show = true
                            tabItem.count = me.filteredMine ? me.filteredMine.length : 0
                        } else if(tabItem.id == 'public'){
                            tabItem.show = true
                            tabItem.count = me.filteredPublic ? me.filteredPublic.length : 0
                        } else if(tabItem.id == 'pbcs'){
                            tabItem.show = true
                        } else {
                            tabItem.show = false
                        }
                    });
                } else {
                    me.tabLists.filter(function(tabItem){
                        if( tabItem.id == 'public' ){
                            tabItem.show = true
                            tabItem.count = me.filteredPublic ? me.filteredPublic.length : 0
                        } else{
                            tabItem.show = false
                        }
                    });
                }
                return me.tabLists
            },
            showMoreButton() {
                var me = this
                if (me.search) {
                    return false
                }
                if ( me.filterTabLists[me.selectedTabIndex] && ( me.selectedTabIndex < me.standardTabCount) ) {
                    if (me.filterTabLists[me.selectedTabIndex].totalCount < 9 || me.filterTabLists[me.selectedTabIndex].count == me.filterTabLists[me.selectedTabIndex].totalCount ) {
                        return false
                    } else if (me.filterTabLists[me.selectedTabIndex].count < me.filterTabLists[me.selectedTabIndex].totalCount) {
                        return true
                    }
                }
            },
        },
        created(){
            this.tab = this.isPBCMarket ? "pbcs" : "templates"
            this.setGitHubHeader()
            this.loadAllRepoList()
        },
        mounted(){
            var me = this
            $(window).scroll(function () {
                if (Math.ceil($(window).scrollTop()) >= (($(document).height() - $(window).height()))) {
                    if(me.isPBCMarket) {
                        console.log('!!!!')
                        if (!me.showLoading && me.showMoreButton) {
                            if (!me.showLoadingForMorePage) {
                                me.settingMorePage()
                            }
                        }
                    }
                   
                }
            });
        },
        methods: {
            isToppingCompatible(selectedTopping) {
                let polyglotMode = false;
                for(var i = 0; i< this.templateList.length; i++){
                    if(selectedTopping.depends && !selectedTopping.depends.includes(this.templateList[i].template.split('/').pop())){
                        polyglotMode = true
                    }
                }
                if(polyglotMode){
                    return false;
                }
                return !selectedTopping.depends || selectedTopping.depends.includes(this.selectedBaseTemplateName);
            },
            applyTemplate(temp){
                this.$emit("applyTemplate", temp, this.marketplaceType, this.selectedToppingList)
                this.detailMarketMode = false;
            },
            applyTopping(topping){
                this.$emit("applyTopping", topping, this.marketplaceType)
                this.detailMarketMode = false;
            },
            applyPBCElement(pbc){
                this.setPBCInfo(this.pbc, {
                    name: pbc.name,
                    path: pbc.pbcPath,
                })
                this.appendPBC(this.openAPICard)
                this.detailMarketMode = false;
                this.closeDialog()
            },
            async loadTemplateInfo() {
                var me = this;
                me.templateLists = [];
                me.isTemplateLoding = true

                for (let idx = 0; idx < me.allRepoList.length; idx++) {
                    const templateInfo = me.allRepoList[idx];
                    if (templateInfo.name.includes("template-") && !templateInfo.name.includes("_template")) {
                        try {
                            var tempInfo = await axios.get(`https://api.github.com/repos/msa-ez/${templateInfo.name}/contents/.template/metadata.yml`, { headers: me.githubHeaders });
                            var templatePath = `https://github.com/msa-ez/${templateInfo.name}`
                            if (tempInfo && tempInfo.data.content) {
                                var obj = YAML.parse(decodeURIComponent(escape(atob(tempInfo.data.content))));
                                obj.id = idx;
                                obj.templatePath = templatePath
                                try {
                                    const instruction = await axios.get(`https://api.github.com/repos/msa-ez/${templateInfo.name}/contents/.template/instruction.md`, { headers: me.githubHeaders });
                                    if (instruction) {
                                        obj.instruction = decodeURIComponent(escape(atob(instruction.data.content)));
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                                me.templateLists.push(obj);
                            }
                            var userInfo = localStorage.email
                            if(!userInfo.includes('@posco.com')){
                                const index = me.templateLists.findIndex(template => template.name.includes('posco'));
                                if (index > -1) {
                                    me.templateLists.splice(index, 1);
                                }
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
                me.isTemplateLoding = false
            },
            async loadToppingInfo() {
                var me = this;
                me.toppingLists = [];
                me.isToppingLoding = true
                for (let idx = 0; idx < me.allRepoList.length; idx++) {
                    const toppingInfo = me.allRepoList[idx];
                    if (toppingInfo.name.includes("topping-") && !toppingInfo.name.includes("_topping")) {
                        try {
                            var topInfo = await axios.get(`https://api.github.com/repos/msa-ez/${toppingInfo.name}/contents/.template/metadata.yml`, { headers: me.githubHeaders });
                            var toppingPath = `https://github.com/msa-ez/${toppingInfo.name}`
                            console.log('toppingPath :', toppingPath)
                            if (topInfo && topInfo.data.content) {
                                var obj = YAML.parse(decodeURIComponent(escape(atob(topInfo.data.content))));
                                obj.id = idx;
                                obj.toppingPath = toppingPath
                                try {
                                    const instruction = await axios.get(`https://api.github.com/repos/msa-ez/${toppingInfo.name}/contents/.template/instruction.md`, { headers: me.githubHeaders });
                                    if (instruction) {
                                        obj.instruction = decodeURIComponent(escape(atob(instruction.data.content)));
                                    }
                                    for(var i = 0; i < me.toppingPlatforms.length; i++){
                                        if(me.toppingPlatforms[i] == obj.toppingPath){
                                            me.selectedToppingList.push(obj);
                                        }
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                                me.toppingLists.push(obj);
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
                me.isToppingLoding = false
            },
            async loadPBCInfo(){
                var me = this;
                me.pbcLists = [];
                me.isPBCLoding = true
                for (let idx = 0; idx < me.allRepoList.length; idx++) {
                    const pbcInfo = me.allRepoList[idx];
                    if (pbcInfo.name.includes("pbc-") && !pbcInfo.name.includes("_pbc")) {
                        try {
                            var info = await axios.get(`https://api.github.com/repos/msa-ez/${pbcInfo.name}/contents/.template/metadata.yml`, { headers: me.githubHeaders });
                            var pbcPath = `https://github.com/msa-ez/${pbcInfo.name}/blob/main/openapi.yaml`
                            if (info && info.data.content) {
                                var obj = YAML.parse(decodeURIComponent(escape(atob(info.data.content))));
                                obj.id = idx;
                                obj.pbcPath = pbcPath
                                try {
                                    const instruction = await axios.get(`https://api.github.com/repos/msa-ez/${pbcInfo.name}/contents/.template/instruction.md`, { headers: me.githubHeaders });
                                    if (instruction) {
                                        obj.instruction = decodeURIComponent(escape(atob(instruction.data.content)));
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                                me.pbcLists.push(obj);
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
                me.isPBCLoding = false
            },
            setGitHubHeader(){
                var gitAccessToken = localStorage.getItem('gitAccessToken') ? localStorage.getItem('gitAccessToken') : localStorage.getItem('gitToken')
                this.githubHeaders = {
                    Authorization: 'token ' + gitAccessToken,
                    Accept: 'application/vnd.github+json'
                }
            },
            async loadAllRepoList(){
                var count = 1
                this.allRepoList = []
                while(count != 'stop'){
                    var repoList = await axios.get(`https://api.github.com/orgs/msa-ez/repos?sort=updated&page=${count}&per_page=100`, { headers: this.githubHeaders})
                    if(repoList && repoList.data && repoList.data.length > 0) {
                        this.allRepoList = this.allRepoList.concat(repoList.data)
                        count++
                    }else {
                        count = 'stop'
                    }
                }
                if(this.allRepoList.length == 0) return;

                if(this.isPBCMarket){
                    this.loadPBCInfo()
                } else{
                    this.loadTemplateInfo()
                    this.loadToppingInfo()
                }
            },
            async settingSearchPage() {
                var me = this
                try {
                    me.showLoading = true

                    for(let obj of me.filterTabLists) {
                        if (obj.id != 'home') {
                            let result = null
                            if (obj.id == 'mine' && obj.show) {
                                let filters = `authorId:${me.userInfo.uid}`;
                                filters = me.searchOpen && me.searchObj.type != 'all' ? filters.concat(` AND type:${me.searchObj.type}`) : filters

                                result = await me.onLoadServerModel({
                                    filters: filters,
                                    alternativesAsExact: ['multiWordsSynonym'],
                                    hitsPerPage: 9,
                                });
                                let setLists = await me.settingLists(result.lists, true);
                                me.mine = setLists;

                            }  else if (obj.id == 'public' && obj.show) {
                                let filters = `permissions:everyone`;
                                filters = me.searchOpen && me.searchObj.type != 'all' ? filters.concat(` AND type:${me.searchObj.type}`) : filters

                                result = await me.onLoadServerModel({
                                    filters: filters,
                                    alternativesAsExact: ['multiWordsSynonym'],
                                    hitsPerPage: 9,
                                });
                                let setLists = await me.settingLists(result.lists);
                                me.public = setLists;

                            }
                            obj.count = result ? result.count : 0
                            obj.totalCount = result ? result.totalCount : 0
                        }
                    }

                } catch (e) {
                    alert(e.message)
                }finally {
                    me.showLoading = false
                }

            },
            async settingFirstPage(init) {
                var me = this
                try{
                    if (me.selectedTabIndex < me.standardTabCount) {
                        let tabId = me.filterTabLists[me.selectedTabIndex].id;


                        if (init) {
                            me.showLoading = true
                            me.initLists(tabId)
                        }
                        for(let obj of me.filterTabLists){

                            let result = null
                            if(obj.id == 'mine'&& obj.show){
                                let filters = `authorId:${me.userInfo.uid}`;
                                filters = me.searchOpen && me.searchObj.type != 'all' ? filters.concat(` AND type:${me.searchObj.type}`) : filters

                                result = await me.onLoadServerModel({
                                    filters: filters,
                                    hitsPerPage: 27
                                });
                                let setLists = await me.settingLists(result.lists, true);
                                me.mine = setLists
                            }  else  if(obj.id == 'public' && obj.show){
                                let filters = `permissions:everyone`;
                                filters = me.searchOpen && me.searchObj.type != 'all' ? filters.concat(` AND type:${me.searchObj.type}`) : filters

                                result = await me.onLoadServerModel({
                                    filters: filters,
                                    hitsPerPage: 27
                                });
                                let setLists = await me.settingLists(result.lists);
                                me.public = setLists
                            }
                            obj.count = result ? result.count : 0
                            obj.totalCount = result ? result.totalCount : 0
                        }
                    }
                }catch (e) {

                }finally {
                    me.showLoading = false
                }
            },
            async settingLists(lists, execute){
                var me = this

                for(let info of lists){
                    if( !(info.lastVersionName || (info.versions && Object.keys(info.versions).length > 0)) ){
                        try {
                            info.versions = null
                            let result = await me.getObject(`db://definitions/${info.objectID}/versionLists`);
                            if( execute && !result.Error ){
                                await me.migrateVersions(info.objectID, result);
                            }
                            if(!result.Error){
                                info.versions = result
                            }
                        } catch (e) {
                            info.versions = null;
                        }
                    }
                }

                return lists;
            },
            async migrateVersions(projectId, versions){
                var me = this

                for(let version in versions){
                    if( projectId && !versions[version].valueUrl ){
                        let versionInfo =  versions[version].versionInfo
                        let versionValue =  versions[version].versionValue && versions[version].versionValue.value  ? versions[version].versionValue.value : versions[version].versionValue;
                        if(!versionInfo){
                            versionInfo = {}
                        }

                        let valueUrl = await me.putString(`storage://definitions/${projectId}/versionLists/${version}/versionValue`, versionValue);
                        versionInfo.valueUrl = valueUrl;

                        // date -> timeStamp
                        versionInfo.timeStamp = versionInfo.date;
                        delete versionInfo.date;

                        await me.putObject(`db://definitions/${projectId}/versionLists/${version}`, versionInfo);
                        me.delete(`db://definitions/${projectId}/versionLists/${version}/versionValue`);
                        me.delete(`db://definitions/${projectId}/versionLists/${version}/versionInfo`);
                    }
                }
            },
            selectedModel(obj){
                this.$emit('selected-model',obj)
            },
            closeDialog(){
                this.$emit('closeMarketplaceDialog')
            },
            closeDetailDialog(){
                this.detailMarketMode = false;
            },
            openTempDetailDialog(val){
                this.detailMarketMode = true
                this.selectedTemplate = val
                this.selectedTopping = null
            },
            openToppingDetailDialog(val){
                this.detailMarketMode = true
                this.selectedTopping = val
                this.selectedTemplate = null
            },
            openPBCDetailDialog(val){
                this.detailMarketMode = true
                this.selectedTemplate = null
                this.selectedTopping = null
                this.selectedPBC = val
            },
            clickFilteredTemplate(index) {
                this.selectedTemplateIndex = index;
            },
            clickFilteredTopping(index) {
                this.selectedToppingIndex = index;
            },
            clickFilteredPBC(index) {
                this.selectedPBCIndex = index;
            },
        }
    }
</script>
<style>
    .non-clickable-card {
        opacity: 0.2;
        pointer-events: none;
    }
    .marketplace-details-page-apply-btn {
        max-width: 100px;
        height: 30px;
        z-index: 1;
        margin-top:10px;
        float:right;
    }
    .marketplace-details-page-box {
        background-color:white;
        padding:0px 10% 0px 10%;
    }
    .marketplace-details-page-back-btn {
        font-size: 25px !important;
        z-index: 1;
    }
    .marketplace-details-page-row {
        margin:0px;
        padding-bottom:20px;
        background-color:white;
    }
    .marketplace-details-page-col {
        position: relative;
    }

    .marketplace-chip-box div {
        float:left;
        padding:0px 5px 0px 16px;
        margin-top:3px;
    }

    .marketplace-chip-box .v-chip {
        margin-right:5px;
        margin-bottom:5px;
    }

    .marketplace-markdown h1 {
        text-align: center;
    }
    .marketplace-details-page-img {

    }
    .marketplace-list-icon-box {
        margin-right: 12px !important;
    }
    .marketplace-list-icon {
        height: 22px;
        width: 22px
    }
    .marketplace-margin-place-tab {
        flex-grow: 1;
    }
    .marketplace-skeleton-container {
        height:100%;
        width:100%;
    }
    .marketplace-card-title {
        font-size:16px;
    }
    .marketplace-card-row {
        padding:7px 1% 20px 0px;
    }
    .marketplace-card {
        padding-top:5px;
    }
    .marketplace-card-image {
        width: 100%;
        height:130px;
        transition: opacity 0.5s;
    }

    .marketplace-card-subtitle {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        padding-top:15px;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        opacity: 0;
        transition: opacity 0.5s;
        cursor: pointer;
    }

    .marketplace-image-text-container {
        height:130px;
    }

    .marketplace-image-text-container:hover .marketplace-card-image {
        opacity: 0;
    }

    .marketplace-image-text-container:hover .marketplace-card-subtitle {
        opacity: 1;
    }


    .marketplace-rating {
        margin:-10px 0px 10px 16px;
    }

    .marketplace-details-page-rating {
        margin:-10px 0px 10px 6px;
    }

    .marketplace-details-page-rating button {
        margin-right:-5px;
    }

    .marketplace-loding-menu {
        display:flex;
        margin-bottom:15px;
    }

    .marketplace-rating button {
        margin-left:-10px;
    }

    .marketplace-loding-menu .v-skeleton-loader__avatar {
        width:26px;
        height:26px;
    }

    .marketplace-loding-menu .v-skeleton-loader__text {
        margin:6px 0px 0px 20px;
    }

    .marketplace-loding-card .v-skeleton-loader__image {
        height:150px;
        margin-bottom:10px;
    }

    .marketplace-loding-card .v-skeleton-loader__text {
        height:15px;
    }

    .marketplace-loding-card .v-skeleton-loader__button {
        float:right;
    }
</style>