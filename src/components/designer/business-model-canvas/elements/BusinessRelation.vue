<template>
    <div>
        <edge-element
                selectable
                connectable
                deletable
                :vertices.sync="vertices"
                :from.sync="value.from"
                :to.sync="value.to"
                :_style="style_"
                :label="value.name"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:removeShape="onRemoveShape"
        >
        </edge-element>
    </div>
</template>

<script>
    import BusinessModelElement from "./BusinessModelElement";

    export default {
        mixins: [BusinessModelElement],
        name: 'business-relation',
        props: {},
        data: function () {
            return {}
        },


        created: function () {
            var me = this
            if (this.value && this.value.relationView) {
                this.value.from = this.value.relationView.from;
                this.value.to = this.value.relationView.to;
            }

        },
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.business.BusinessRelation'
            },
            style_() {
                var style = {}
                style = {
                    "arrow-end": "block",
                    'font-size': 20,
                }

                return style
            },
            createNew(elementId, from, to, vertices) {
                return {
                    _type: this.className(),
                    name: '',
                    sourceElement: from,
                    targetElement: to,
                    from: from.elementView.id,
                    to: to.elementView.id,
                    relationView: {
                        id: elementId,
                        style: JSON.stringify({
                            "arrow-start": "none",
                            "arrow-end": "none",
                        }),
                        value: vertices,
                        from: from.elementView.id,
                        to: to.elementView.id,
                        needReconnect: true,
                    },
                    sourceMultiplicity: 1,
                    targetMultiplicity: 1,
                }
            },
            vertices: {
                get: function () {
                    var style;
                    try {
                        return JSON.parse(this.value.relationView.value);
                    } catch (e) {
                        return null;
                    }
                },
                set: function (val) {
                    this.value.relationView.value = JSON.stringify(val);
                }
            }
        },
         watch: {},
        mounted: function () {
        },
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
