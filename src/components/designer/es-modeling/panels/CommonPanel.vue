<template>
    <v-layout wrap>
        <v-navigation-drawer style="z-index:4;" absolute permanent right :style="panelWidthStyle">
            <slot name="root">
                <div>
                    <slot name="master">
                        <slot name="top">
                            <v-list class="pa-1" style="height: 100px;">
                                <v-list-item>
                                    <slot name="t-title">
                                        <v-col>
                                            <v-col style="margin:0;">
                                                <div v-if="elementAuthorDisplay"
                                                     class="gs-model-panel-Author">
                                                    Author : {{elementAuthorDisplay}}
                                                </div>
                                            </v-col>
                                            <v-row>
                                                <v-tooltip top>
                                                    <template v-slot:activator="{ on }">
                                                        <slot name="t-img">
                                                            <v-list-item-avatar class="gs-model-panel-sticker">
                                                                <img :src="getImage">
                                                            </v-list-item-avatar>
                                                        </slot>
                                                        <v-list-item-title v-on="on" class="headline" style="max-width: 280px;"> <slot name="t-title-name">{{ titleName }}</slot> </v-list-item-title>
                                                    </template>
                                                    <span><slot name="t-generation-text"></slot></span>
                                                </v-tooltip>

                                                <slot name="t-information">
                                                    <v-tooltip top>
                                                        <template v-slot:activator="{ on }">
                                                            <v-btn icon @click.native="close()" style="align-self: flex-start;">
                                                                <v-icon color="grey lighten-1">mdi-close</v-icon>
                                                            </v-btn>
                                                            <v-btn icon v-on="on" style="align-self: flex-start;">
                                                                <v-icon color="grey lighten-1">mdi-information</v-icon>
                                                            </v-btn>
                                                            <v-btn icon @click="executeSetRelatedURL()" style="align-self: flex-start;">
                                                                <v-icon color="grey lighten-1">mdi mdi-help-circle</v-icon>
                                                            </v-btn>
                                                        </template>
                                                        <span><slot name="t-description-text"></slot></span>
                                                    </v-tooltip>
                                                </slot>
                                            </v-row>
                                            <v-col>
                                                <slot name="t-edit-user"></slot>
                                            </v-col>
                                        </v-col>
                                    </slot>

                                </v-list-item>
                            </v-list>
                        </slot>

                        <slot name="middle">
                            <v-list class="pt-0" dense flat>
                                <v-divider></v-divider>
                                <v-card outlined>
                                    <v-card-text>
                                        <slot name="md-title">
                                            <div v-if="isValidationLists" style="margin-left: -17px;">
                                                <v-list-group
                                                        :value="openValidationLists"
                                                        @click.native="openValidationLists = !openValidationLists"
                                                >
                                                    <template v-slot:activator>
                                                        <v-icon style="margin-right: 2%;" :color="validationLevelIcon[validationLists[0].level].color">{{ validationLevelIcon[validationLists[0].level].icon }}</v-icon>
                                                        <v-list-item-title>{{representativeValidation}}</v-list-item-title>
                                                    </template>

                                                    <v-list-item
                                                            v-for="item in validationLists"
                                                            :key="item.code"
                                                            style="margin-left: 5%;"
                                                    >
                                                        <v-icon style="margin-right: 2%;" :color="validationLevelIcon[item.level].color">{{validationLevelIcon[item.level].icon}}</v-icon>
                                                        <v-list-item-title>{{item.msg}}</v-list-item-title>
                                                    </v-list-item>
                                                </v-list-group>
                                            </div>
                                            <span class="panel-title">Basic Info</span>
                                        </slot>
                                        <slot name="md-title-side"></slot>
                                        <div>
                                            <slot name="md-name-panel">
                                                <v-text-field
                                                        v-model="value.name"
                                                        :error="value.name == ''"
                                                        id="elementName"
                                                        :disabled="isReadOnly"
                                                        label="Name"
                                                        autofocus
                                                >
                                                </v-text-field>
                                                <v-text-field
                                                        v-model="value.displayName"
                                                        :disabled="isReadOnly"
                                                        label="Display Name"
                                                >
                                                </v-text-field>
                                            </slot>

                                            <slot name="md-name-panel-translate">
                                                <v-card style="margin-bottom: 10px;" class="recommendWord-style" outlined v-if="translateObj.usedTranslate"
                                                        :disabled="isReadOnly">
                                                    <v-card-text id="suggested-words" @click="changeTranslate()">
                                                        {{$t('word.recommendWord')}} : {{ translateObj.translateText }}
                                                    </v-card-text>
                                                    <v-card-text>
                                                        {{$t('word.recommendWordDetail')}}
                                                    </v-card-text>
                                                </v-card>
                                            </slot>

                                            <slot name="md-description">
                                                <v-textarea
                                                        v-model="value.description"
                                                        label="Description"
                                                        :disabled="isReadOnly"
                                                ></v-textarea>
                                                <!-- <RuleExampleDialog v-if="openExample" v-model="value" @closeExampleDialog="closeExampleDialog()" />
                                                <v-btn 
                                                    v-if="value._type == 'org.uengine.modeling.model.Command' || value._type == 'org.uengine.modeling.model.Policy'" 
                                                    @click="openExampleDialog()">
                                                    Example
                                                </v-btn> -->
                                            </slot>
                                            <slot name="generateWithAi"></slot>
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </v-list>
                        </slot>

                        <slot name="bottom">
                            <slot name="bo-top"></slot>
                            <slot name="bo-md"></slot>
                            <slot name="bo-bo"></slot>
                        </slot>
                    </slot>


                    <slot name="sub">
                        <slot name="element"></slot>
                    </slot>
                </div>
            </slot>


            <v-dialog v-model="relatedUrlDialog" max-width="1400" @click:outside="relatedUrlDialog = false">
                <v-card style="height: 800px">
                    <iframe
                            id="main_frame"
                            :src="relatedUrl"
                            width="100%"
                            height="100%">
                    </iframe>
                </v-card>
            </v-dialog>
        </v-navigation-drawer>

    </v-layout>
</template>

<script>
    import RuleExampleDialog from "../RuleExampleDialog.vue";

    export default {
        name: 'common-panel',
        mixins: [],
        components: {
            RuleExampleDialog,
        },
        props: {
            value:{
                type: Object,
                default: function () {
                    return null;
                }
            },
            validationLists:{
                type: Array,
                default: function () {
                    return []
                }
            },
            elementAuthorDisplay:{
                type: String,
                default: function () {
                    return null;
                }
            },
            widthStyle: {
                type: String,
                default: function () {
                    return 'width: 500px;'
                }
            },
            isReadOnly: {
                type: Boolean,
                default: function () {
                    return false
                }
            },
            image: {
                type: String,
                default: ''
            },
            relatedUrl:{
                type: String,
                default: ''
            },
            translateObj:{
                type: Object,
                default: function () {
                    return {'usedTranslate': false, 'translateText': ''}
                }
            },
        },
        data: function () {
            return {
                // openExample: false,
                // common
                namePanel: '',
                descriptionPanel: '',
                relatedUrlDialog: false,
                openValidationLists: false,
                validationLevelIcon:
                    {
                        'error' : {icon: 'mdi-close-circle-outline', color:'#E53935'},
                        'warning' : {icon: 'mdi-alert-outline', color:'#FFA726'},
                        'info' : {icon: 'mdi-information-outline', color:'#29B6F6'},
                    },
            }
        },
        created() {
            var me = this;
            me.$EventBus.$on('policyDescriptionUpdated', function (newDescription) {
                me.value.description = newDescription;
                console.log("Description 변경됨:", newDescription);
            })
        },
        computed: {
            panelWidthStyle(){
                return this.widthStyle;
            },
            isValidationLists(){
                if(this.validationLists.length == 0 ){
                    return false
                }
                return  true
            },
            representativeValidation(){
                if(this.isValidationLists){
                    if(this.validationLists.length > 1){
                        return `${this.validationLists[0].msg} (+ ${this.validationLists.length - 1} Others)`
                    }
                    return `${this.validationLists[0].msg}`
                }
                return null
            },
            getImage(){
                if(this.image){
                    return this.image
                }
                return null;
            },
            titleName() {
                if(this.value){
                    return this.value ? this.value._type.split('.')[4] : null
                }
                return null;
            },
        },
        watch:{
            'value.description': function (newVal, oldVal) {
                // 여기에 변화가 감지될 때 실행할 코드를 작성하세요.
                console.log("Description 변경됨:", newVal);
            }
        },
        methods: {
            // closeExampleDialog(){
            //     this.openExample = false
            // },
            // openExampleDialog(){
            //     this.openExample = true
            // },
            close(){
                this.$emit('close')
            },
            changeTranslate() {
                this.$emit('changeTranslate')
            },
            executeSetRelatedURL(){
                if(this.relatedUrl){
                    this.relatedUrlDialog = true
                }
            },
        }
    }
</script>

<style>
.recommendWord-style:hover {
    cursor: pointer;
    background-color:#E3F2FD;
}
</style>
<style scoped lang="scss" rel="stylesheet/scss">
    .panel-title {
        font-size: 25px;
        color: #757575;
    }
</style>