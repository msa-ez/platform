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

        <template slot="t-img">
            <v-list-item-avatar>
                <img :src="value.imgSrc">
            </v-list-item-avatar>
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

        <template slot="md-name-panel-translate">
            <div></div>
        </template>

        <template slot="md-description">
            <div></div>
        </template>
    </common-panel>

</template>


<script>
    import CommonPanel from "./CommonPanel";
    import EventStormingModelPanel from "../EventStormingModelPanel";

    export default {
        mixins: [EventStormingModelPanel],
        name: 'text-panel',
        components: {
            CommonPanel
        },
        data() {
            return {

            }
        },
        created: function () { },
        methods: {
            panelInit(){
                var me = this
                // Text

                // Common
                me.$super(EventStormingModelPanel).panelInit()
            },
        }
    }
</script>
