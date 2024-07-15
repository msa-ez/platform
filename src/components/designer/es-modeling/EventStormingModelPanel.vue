<template></template>

<script>
    import isAttached from '../../../utils/isAttached';
    import ModelPanel from "../modeling/ModelPanel";
    import getParent from "../../../utils/getParent";
    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        name: 'event-storming-model-panel',
        mixins: [ModelPanel],
        props: {
            newEditUserImg:{
                type: Array,
                default: function () {
                    return []
                }
            },
            validationLists:{
                type: Array,
                default: function () {
                    return []
                }
            },
            widthStyle: {
                type: String,
                default: function () {
                    return 'width: 500px;'
                }
            },
        },
        data: function () {
            return {
                // common
                // namePanel: '',
                // descriptionPanel: '',
                AggregateRulePanelStatus: false,
                ruleRequired: value => !!value || 'Required.',
                openValidationLists:false,
                validationLevelIcon:
                    {
                        'error' : {icon: 'mdi-close-circle-outline', color:'#E53935'},
                        'warning' : {icon: 'mdi-alert-outline', color:'#FFA726'},
                        'info' : {icon: 'mdi-information-outline', color:'#29B6F6'},
                    },

                // command, external
                restfulList: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],


                // translate
                usedTranslate: false,
                translateText: '',

                // relatedUrl
                relatedUrlDialog: false,
                relatedUrl: null,
                openExample: false,
            }
        },
        created() {},
        computed: {
            isOpenAPIPBC(){
                if(!this.isPBCModel) return false
                if(!this.value.pbcId) return false
                if(!this.canvas.value.elements[this.value.pbcId]) return false;

                if(Object.keys(this.canvas.value.elements[this.value.pbcId].modelValue).length == 0) return true

                return false;
            },
            translateObj(){
                return {'usedTranslate': this.usedTranslate , 'translateText': this.translateText}
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
            panelWidthStyle() {
                return this.widthStyle
            },
            elementAuthorDisplay() {
                var me = this
                var str = null
                if (me.canvas && me.canvas.information) {
                    if (me.value && me.value.author && me.canvas.information.author) {

                        if (me.value.author == me.canvas.information.author) {
                            str = me.canvas.information.authorEmail
                        } else if (me.canvas.information.permissions) {
                            var userInfo = me.canvas.information.permissions[me.value.author]
                            if (userInfo) {
                                str = userInfo.userName
                            } else {
                                str = '권한 없는 유저'
                            }
                        } else {
                            str = null
                        }
                        return str;
                    }
                }
                return str;
            },

        },
        watch: {
            value: {
                deep:true,
                handler: _.debounce(function (newVal, oldVal) {
                    if( oldVal ){
                        // open 말고.
                        this.$emit('changedPanelValue', this.value)
                    }
                }, 300)
            },
            "value.name": _.debounce(async function (newVal) {
                var me = this
                me.changedNamePanel(me.value.name)
            }, 500),
            "value.description": _.debounce(async function (newVal) {
                var me = this
                me.changedDescriptionPanel(me.value.description)
            }, 500),
            // value: {
            //     deep: true,
            //     handler: _.debounce(function (newVal,oldVal) {
            //         var me = this
            //         if(oldVal){
            //             me.stayClosePanelCheck()
            //             me.stayOpenPanelCheck()
            //         }
            //     }, 1000)
            // }
        },
        methods: {
            setElementCanvas(){
                var me = this
                me.canvas = getParent(me.$parent, "event-storming-model-canvas");

                // open created : me.$options.name: event-storming-model-panel / $parent.$options.name   : actor-definition
                // load created : me.$options.name: actor-definition           / $parent.$options.name   : opengraph
                // destroy name : me.$options.name: event-storming-model-panel / $parent.$options.name   : actor-definition
                if (me.$route.path.includes('replay')) {
                    me.$emit('update:widthStyle','width:500px; margin-right:17.5%;')
                }
            },
            forceEditPanel(){
                var me = this
                try{
                    if(me.newEditUserImg && me.newEditUserImg.length > 0){
                        var findIdx = me.newEditUserImg.findIndex(x=>x.action == 'userPanelOpen')
                        if(findIdx != -1){
                            me.newEditUserImg.splice(findIdx, 1)
                        }
                    }
                }catch (e) {
                    console.log(`Error] forceEditPanel : ${e}`)
                }
            },
            closeExampleDialog(){
                this.openExample = false
            },
            openExampleDialog(){
                this.openExample = true
            },
            validateRuleExample(){
                var me = this

                let getAttachedAggregate = null
                if(me.value && (me.value._type.includes("Policy") || me.value._type.includes("Command") || me.value._type.includes("View"))){
                    if(me.value.aggregate && me.value.aggregate.id && me.canvas.value.elements[me.value.aggregate.id]){
                        getAttachedAggregate = me.canvas.value.elements[me.value.aggregate.id]
                    } else if (me.canvas.attachedLists().aggregateLists && Object.values(me.canvas.attachedLists().aggregateLists).length > 0) {
                        Object.values(me.canvas.attachedLists().aggregateLists).forEach(function (aggregate, idx) {
                            if (isAttached(aggregate, me.value)) {
                                getAttachedAggregate = aggregate
                            }
                        })
                    } 
                }

                if(getAttachedAggregate){
                    let relations = me.canvas.value.relations
    
                    let sourceElements = null
                    let targetElements = null
    
                    if (me.value._type.includes('Policy')) {
                        Object.keys(relations).forEach(function (ele) {
                            if(relations[ele]){
                                if(relations[ele].sourceElement.id && relations[ele].sourceElement.id == me.value.id){
                                    sourceElements = relations[ele].sourceElement
                                }
        
                                if(relations[ele].targetElement.id && relations[ele].targetElement.id == me.value.id){
                                    targetElements = relations[ele].targetElement
                                }
                            }
                        })
                    }
    
                    if(me.value._type.includes('Command')){
                        Object.keys(relations).forEach(function (ele) {
                            if(relations[ele]){
                                if(relations[ele].sourceElement.id && relations[ele].sourceElement.id == me.value.id){
                                    sourceElements = relations[ele].sourceElement
                                    targetElements = relations[ele].sourceElement
                                }
                            }
                        })
                    }
    
                    if(me.value._type.includes('View')){
                        Object.keys(relations).forEach(function (ele) {
                            if(relations[ele]){
                                if(relations[ele].targetElement.id && relations[ele].targetElement.id == me.value.id){
                                    sourceElements = relations[ele].sourceElement
                                    targetElements = relations[ele].targetElement
                                }
                            }
                        })
                    }
                    
                    if(sourceElements && targetElements){
                        return true
                    }
                }
                return false
            },
            //<<<<<<<<<<<<<<<<<<<<<<<<<<< Panel Methods
            // stayOpenPanelCheck(){
            //     var me = this
            //     var getComponent =  null
            //
            //     if(me.$options.name == 'event-storming-model-panel'){
            //         getComponent = me.$parent
            //     }else if(me.$parent.$options.name == 'opengraph'){
            //         getComponent = me
            //     }
            //     //
            //     if(getComponent && !getComponent.isPassedClosePanel){
            //         getComponent.staySetTimeout = setTimeout(function () {
            //             if(getComponent.newEditUserImg && getComponent.newEditUserImg[0] ){
            //                 /*
            //                     isPassedClosePanel : 정보변경 제외
            //                     close : 판넬 닫힘
            //                     panelClose : 수정중인 사람 닫힘.
            //                  */
            //                 getComponent.isPassedClosePanel = true
            //                 getComponent.close()
            //                 getComponent.panelClose(getComponent.newEditUserImg[0])
            //             }
            //         }, 3 * 60 * 1000)
            //     }
            // },
            // stayClosePanelCheck(){
            //     var me = this
            //     var getComponent =  null
            //     if(me.$options.name == 'event-storming-model-panel'){
            //         //opne
            //         getComponent = me.$parent
            //     }else if(me.$parent.$options.name == 'opengraph'){
            //         getComponent = me
            //     }
            //
            //     if(getComponent){
            //         getComponent.isPassedClosePanel = false
            //         clearTimeout(getComponent.staySetTimeout)
            //     }
            // },
            // override
            panelInit() {
                try {
                    var me = this
                    // console.log('PANEL_INIT :: COMMON')

                    if ( !me.canvas.isHexagonal ) {
                        me.openPanelAction()
                    }
                } catch (e) {
                    console.log('[Error] ES Panel Init: ', e)
                }

            },
            // override
            executeBeforeDestroy() {
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                         /*
                            _value : 기존 값.
                            value  : Panel 사용되는 값,
                        */
                        if(!me.value) return;
                        
                        var diff = jsondiffpatch.diff(me._value, me.value)
                        if (diff && !(Object.keys(diff).includes('aggregate') && Object.keys(diff).length == 1)) {
                            console.log('Panel - executeBeforeDestroy')
                            if (!me.isReadOnly) {
                                me.canvas.changedByMe = true

                                // part sync
                                me._value.oldName = JSON.parse(JSON.stringify(me._value.name))

                                // all sync
                                Object.keys(me.value).forEach(function (itemKey) {
                                    if(itemKey == 'oldName'){
                                        // Exception : part sync
                                    }else if(!(itemKey == 'elementView' || itemKey == 'relationView')){
                                        // Exception: 위치정보
                                        me._value[itemKey] = JSON.parse(JSON.stringify(me.value[itemKey]))
                                    }
                                })
                                // re setting 값을 emit
                                me.$emit('_value-change', me._value)
                            }
                        }

                        me.closePanelAction()
                    },
                    onFail(e){
                        console.log(`[Error] EventStormingPanel Sync: ${e}`)
                    }
                })
            },
            changedDescriptionPanel(newVal) {
                var me = this
                var elementIds = me.value.elementView ? me.value.elementView.id : me.value.relationView.id
                me.canvas.$refs[`${elementIds}`][0].descriptionPanel = newVal ? newVal : ''
            },
            async changedNamePanel(newVal) {
                var me = this
                var elementIds = me.value.elementView ? me.value.elementView.id : me.value.relationView.id
                me.canvas.$refs[`${elementIds}`][0].namePanel = newVal ? newVal : ''
            },
            // Panel Methods >>>>>>>>>>>>>>>>>>>>>>>>>>

            // <<<<<<<<<<<<<<<<<<<<<<<<<<  Translate
            changeTranslate(newVal) {
                console.log('changeTranslate::::: ', newVal)
                this.value.name = this.translateText
                this.usedTranslate = false
            },
            getTranslate(){
                return new Promise(async function (resolve) {
                    resolve(null);
                })
            },
            // Translate   >>>>>>>>>>>>>>>>>>>>>>>>>

            // <<<<<<<<<<<<<<<<<<<<< Common Methods
            isEmptyObject(obj) {
                var boolean = false
                if (obj == null) return true;
                if (Object.keys(obj).length == 0) return true;

                Object.keys(obj).some(function (vari) {
                    if (!vari.includes('relation')) {
                        boolean = Object.keys(obj[vari]).length === 0 && obj.constructor === Object
                        return true
                    }

                })

                return boolean
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
    .panel-title {
        font-size: 25px;
        color: #757575;
    }
</style>