<template>
    <common-panel
            v-model="value"
            :image="image"
            :is-read-only="isReadOnly"
            :width-style="widthStyle"
            :related-url="relatedUrl"
            :validation-lists="validationLists"
            :translate-obj="translateObj"
            :element-author-display="elementAuthorDisplay"
            @close="closePanel"
            @changeTranslate="changeTranslate"
    >
        <template slot="t-description-text">
            {{ $t('panelInfo.ActorPanel') }}
        </template>

        <template slot="t-generation-text">
            Aggregate becomes the main body of software implementation - Domain Classes.
        </template>


        <template slot="t-edit-user">
            <div
                    v-if="newEditUserImg.length > 0 && isReadOnly"
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
                    <v-row class="ma-0 pa-0">
                        <div>{{newEditUserImg[0].name}} is editing...</div>
                        <div style="font-size: 12px;">( Click to edit )</div>
                    </v-row>
                </v-chip>
            </div>
        </template>

    </common-panel>
</template>

<script>
    import EventStormingModelPanel from "../EventStormingModelPanel";
    import CommonPanel from "./CommonPanel";
 
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
        created(){ },
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
