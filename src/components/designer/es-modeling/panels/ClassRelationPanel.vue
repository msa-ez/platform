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
        <template slot="md-description"><div></div></template>

        <template slot="element">
            <div>
                <v-card flat v-if="value.circuitBreaker != undefined">
                    <v-card-text class="panel-title">Associated Aggregate</v-card-text>
                    <v-card-text style="margin-left: 20px; margin-top: -35px;">
                        <v-switch
                                v-model="value.circuitBreaker"
                                inset
                                :label="`Circuit Breaker`"
                        ></v-switch>
                        <v-checkbox
                                v-if="value.circuitBreaker"
                                v-model="value.fallback"
                                :label="`Fallback`"
                                style="margin-top: -10px;"
                        ></v-checkbox>
                    </v-card-text>
                </v-card>
            </div>
        </template>

    </common-panel>

</template>


<script>
    import CommonPanel from "./CommonPanel";
    import EventStormingModelPanel from "../EventStormingModelPanel";

    export default {
        mixins: [EventStormingModelPanel],
        name: 'relation-panel',
        props: {},
        components: {
            CommonPanel
        },
        data() {
            return {

            }
        },
        computed: {

        },
        beforeDestroy() {
        },
        created: function () { },
        watch: {},
        methods: {
            panelInit(){
                var me = this
                // Element

                // Common
                me.$super(EventStormingModelPanel).panelInit()
            },
        }
    }
</script>
