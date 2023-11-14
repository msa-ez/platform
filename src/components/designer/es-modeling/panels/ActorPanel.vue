<template>
    <common-panel
            v-model="value"
            :image="image"
            :is-read-only="canvas.isReadOnlyModel"
            :width-style="widthStyle"
            :related-url="relatedUrl"
            :validation-lists="validationLists"
            :translate-obj="translateObj"
            :element-author-display="elementAuthorDisplay"
            @close="closePanel"
            @changeTranslate="changeTranslate"
    >
        <template slot="t-description-text">
            비즈니스 로직 처리의 도메인 객체 덩어리 (서로 연결된 하나 이상의 엔터티 및 value objects의 집합체)
        </template>

        <template slot="t-generation-text">
            Aggregate becomes the main body of software implementation - Domain Classes.
        </template>


        <template slot="t-edit-user">
            <div
                    v-if="newEditUserImg.length > 0 && canvas.isReadOnlyModel"
                    style="text-align:center"
            >
                <v-chip
                        small
                        color="orange"
                        text-color="white"
                        style="font-weight:bold"
                        @click.once="forceEditPanel()"
                >
                    <v-avatar left>
                        <v-icon>mdi-lead-pencil</v-icon>
                    </v-avatar>
                    <v-row>
                        <div style="margin-left: 10px;"> {{newEditUserImg[0].name}} is now editing...</div>
                        <div style="font-size: 12px; margin-right: 10px;"> ( Click to force editing ) </div>
                    </v-row>
                </v-chip>
            </div>
        </template>

    </common-panel>
</template>

<script>
    import EventStormingModelPanel from "../EventStormingModelPanel";
    import CommonPanel from "./CommonPanel";
    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });
    export default {
        name: 'actor-panel',
        mixins:[EventStormingModelPanel],
        components:{CommonPanel},
        props:{

        },
        data(){
            return{

            }
        },
        created(){
            this.panelInit()
        },
        methods:{
            panelInit(){
                var me = this
                // Element

                // Common
                me.$super(EventStormingModelPanel).panelInit()
            },
            changedNamePanel(newVal){
                var me = this
                me.canvas.$refs[`${me.value.elementView.id}`][0].namePanel = newVal
            },
        },
    }
</script>
