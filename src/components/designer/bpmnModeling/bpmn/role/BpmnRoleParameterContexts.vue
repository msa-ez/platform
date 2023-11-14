<template>
    <div>
    <!-- definition id 가 없어도 데이터가 있다면 최선을 다하여 출력하자 -->
    <!--<div v-if="calleeDefinitionId">-->
        <md-layout v-for="(parameterContext, idx) in data.parameterContexts" :key="idx">
            <md-layout md-flex="30">
                <md-input-container>
                    <label>Callee Roles</label>
                    <md-select v-if="calleeDefinition.loaded" name="input" id="input" v-model="parameterContext.argument">
                        <md-option v-for="role in calleeDefinition.roles"
                                :key="role.name"
                                :value="role.name">
                            {{ role.name }}
                        </md-option>
                    </md-select>
                    <md-input v-else v-model="parameterContext.argument"></md-input>
                </md-input-container>
            </md-layout>
            <md-layout md-flex="30">
                <md-input-container>
                    <label>Caller Roles</label>
                    <md-select v-model="parameterContext.role.name">
                        <md-option v-for="role in definition.roles"
                                :key="role.name"
                                :value="role.name">
                            {{ role.name }}
                        </md-option>
                    </md-select>
                </md-input-container>
            </md-layout>
            <md-layout md-flex="30">
                <md-input-container>
                    <label>연결 방향</label>
                    <md-select v-model="parameterContext.direction">
                        <md-option value="in-out">IN-OUT</md-option>
                        <md-option value="in">IN</md-option>
                        <md-option value="out">OUT</md-option>
                    </md-select>
                </md-input-container>
            </md-layout>

            <md-layout md-flex="20">
                <md-checkbox v-model="parameterContext.multipleInput">Multi</md-checkbox>
            </md-layout>

            <md-layout md-flex="20">
                <md-icon v-on:click.native="remove(parameterContext)"
                        class="md-primary"
                        style="cursor: pointer"
                >delete</md-icon>
            </md-layout>
        </md-layout>

        <md-button v-on:click.native="add">매핑 추가</md-button>
    </div>
  <!--</div>-->
</template>

<script>

    export default {
        name: "bpmn-role-parameter-contexts",
        props: {
            parameterContexts: Array,
            definition: Object,
            calleeDefinitionId: String
        },
        data: function () {
            return {
                data: {
                    parameterContexts: this.parameterContexts,
                },
                calleeDefinition: {
                    loaded: false,
                    roles: [
                        { name: '-- not loaded -- ' },
                    ]
                }
            };
        },
        watch: {
            calleeDefinitionId: function () {
                console.log('calleeDefinitionId changed!!');
            },
            data: {
                handler: function (after, before) {
                    this.$emit('update:parameterContexts', after);
                },
                deep: true
            },
            calleeDefinitionId: function(val) {
                console.log("========>" + val)
                this.refreshCalleeDefinition();
            }
        },
        created: function() {
            if(this.data) {
                this.data.parameterContexts.forEach(function(parameterContext){
                    if(!parameterContext.role) {
                        parameterContext.role = {};
                    }
                });
            }
        },
        methods: {
            refreshCalleeDefinition: function() {
                var me = this;
                // this.$root.codi('definition/' + this.calleeDefinitionId + ".json").get()
                //     .then(function (response) {
                //         me.calleeDefinition = response.data.definition;
                //     })
            },
            add: function() {
                this.data.parameterContexts.push({
                    direction: 'IN-OUT',
                    role: {
                        name: ''
                    },
                    argument: ''  //TODO: object path differ from ParameterContext
                })
            },
            remove: function (parameterContext) {
                //TODO: find and remove
                this.parameterContexts.splice(this.parameterContexts.indexOf(parameterContext), 1);
            }
        }
    }

</script>


