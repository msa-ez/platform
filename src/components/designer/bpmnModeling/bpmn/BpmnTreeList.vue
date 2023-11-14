<template>
    <md-list-item>
        <div v-for="item in trees" class="tree-list-style">
            - <span @mouseover="selectedItem = item.name" 
                    @mouseout="selectedItem = ''"
                    :class="{ 'list-hover' : item.name == selectedItem}"
                    v-on:click="onClickList(item)">
                {{item.name}}
            </span>
            <md-list class="tree-list">
                <bpmn-tree-list
                        :trees="item.children">
                </bpmn-tree-list>
            </md-list>
        </div>
    </md-list-item>
</template>

<script>
    export default {
        name: 'bpmn-tree-list',
        props: {
            trees: Array,
            treeWhether: Boolean
        },
        data: function () {
            return {
                selectedItem: ""
            }
        },
        created: function () {},
        computed: {},
        methods: {
            onClickList: function (item) {
                var me = this;
                //move to instance detail page
                //step 1 : router param replace
                me.$router.replace({
                    params: { id: item.id, rootId: item.rootInstId }
                })
                //step 2 : router refresh
                me.$router.go(me.$router.currentRoute);
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
    .tree-list-style span {
        display: inline-block;
        padding: 5px;
    }
    ul.tree-list li .list-hover {
        color: #ffffff;
        background-color: #3f51b5;
        border-radius: 15px;
        cursor:pointer;
    }
</style>

