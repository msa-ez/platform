<template>
    <div style="margin-top: 10px;">        
        <div>
            <v-card class="auto-modeling-message-card">
                <v-card-text class="auto-modeling-message">
                    <vue-typed-js 
                        :strings="[$t('autoModeling.user')]"
                        :typeSpeed="10"
                        :showCursor="false"
                    >
                        <span class="typing"></span>
                    </vue-typed-js>
                </v-card-text>
            </v-card>
            <v-col style="padding: 0;">
                <v-card style="margin-top: 10px; display: inline-flex; background-color: #DAF5FF; padding:10px; min-width:200px; min-height:200px;">
                    <v-col>
                        <div style="width:100%; margin:0px 0px 15px 0px;">
                            <v-btn v-if="done"  @click="generate()"><v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>Try again</v-btn>
                            <v-btn v-else  @click="stop()"><v-progress-circular class="auto-modeling-stop-loading-icon" indeterminate></v-progress-circular>Stop Generating</v-btn>
                        </div>
                        <v-row 
                            lg="3"
                            md="4"
                            sm="6"
                            cols="12"
                        >
                            <v-col v-if="value.personas" v-for="(persona) in value.personas" v-bind:key="persona.name">
                                <v-card style="text-align: center; min-width:200px; min-height:200px;"
                                    :style="state.persona == persona.persona ? 'border: solid darkturquoise;':''"
                                    :disabled="!done"
                                    @click="selectPersona(persona)"
                                >
                                    <div>
                                        <div style="padding-bottom:20px;">
                                            <div>
                                                <v-tooltip bottom>
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-icon small v-if="!personaEditMode && selectedEditPersona != persona.scenario || selectedEditPersona != persona.scenario" 
                                                                style="margin: 5px; float:right;" 
                                                                @click="editPersona(persona)"
                                                                v-bind="attrs"
                                                                v-on="on">
                                                            mdi-pencil
                                                        </v-icon>
                                                    </template>
                                                    <span>{{ $t('autoModeling.editPersona') }}</span>
                                                </v-tooltip>
                                                <v-icon small v-if="personaEditMode && selectedEditPersona === persona.scenario" style="margin: 5px; float:right;" @click="savePersona()">mdi-content-save</v-icon>
                                            </div>
                                            <v-card-title v-if="selectedEditPersona === persona.scenario">
                                                <v-textarea no-resize rows="1" row-height="15" v-model="persona.persona" ></v-textarea>
                                            </v-card-title>
                                            <v-card-title v-else class="text-h5;">
                                                {{persona.persona}}
                                            </v-card-title>
                                            <v-avatar
                                            class="ma-3"
                                            size="50"
                                            rounded="0"
                                            >
                                                <v-img v-if="persona.gender" :src='persona.avatar'></v-img>
                                                <v-img v-else src="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-7.jpg"></v-img>
                                            </v-avatar>
                                            <v-card-subtitle v-if="selectedEditPersona === persona.scenario">
                                                <v-textarea no-resize rows="4" v-model="persona.description" style="text-align: center;"></v-textarea>
                                            </v-card-subtitle>
                                            <v-card-subtitle v-else> {{persona.description}}</v-card-subtitle>
                                            
                                            <v-card-actions>
                                            <v-btn
                                                class="ms-2"
                                                variant="outlined"
                                                size="small"
                                                color="primary"
                                                @click="selectPersona(persona)"
                                                style="position: absolute; right:10px; bottom:10px;"
                                            >
                                                NEXT
                                            </v-btn>
                                            </v-card-actions>
                                        </div>
                                    </div>
                                </v-card>                                       
                            </v-col>
                        </v-row>
                    </v-col>
                </v-card>
                <v-card v-if="step>1" style="white-space: pre; margin-top:10px; width:90%; float:right;">
                    <v-card-subtitle>{{$t('autoModeling.scenario')}}</v-card-subtitle>
                    <v-card-text style="max-height: 1385px; overflow-y: auto; padding: 0px 10px 10px 10px;">
                        <v-textarea 
                            v-model="state.scenario"
                            flat
                            class="gs-auto-modeling-text-box elevation-0"
                            dense
                            auto-grow
                            rows="2"
                            solo
                        >
                        </v-textarea>
                        <v-btn class="cjm-create-btn" color="primary" style="float:right; margin-top:5px;" @click="jump()">Create Model<v-icon>mdi-arrow-right</v-icon></v-btn>
                    </v-card-text>
                </v-card>
                <!-- <div
                    class="auto-modeling-message-card"
                    style="margin-top:25px; height: 200px; max-width: 300%; width: 100%; overflow-y: overlay;">
                    <v-col v-if="state && state.modelList && state.modelList.length > 0"
                           style="height: 100%; align-items: center; margin: 2px; width: 100%;"
                    >
                        <div v-for="id in state.modelList" :key="id">
                            <jump-to-model-lists-card :id="id" path="cjm" @deleteModel="deleteModel" ></jump-to-model-lists-card>
                        </div>
                    </v-col>
                </div> -->
            </v-col>
        </div>
    </div>
</template>
<script>
    import { VueTypedJs } from 'vue-typed-js'
    import Generator from './CJMPersonaGenerator.js'
    import StorageBase from '../../../CommonStorageBase.vue';
    import Usage from '../../../../utils/Usage'

    export default {
        name: 'customer-journey-map-dialoger',
        props: {
            value: Object,
            prompt: String,
            projectId: String,
            modelIds: Object,
            isServerProject: Boolean
        },
        mixins: [StorageBase],
        components: {
            VueTypedJs
        },
        computed: {
            isForeign() {
                try {
                    let lang = this.$i18n.locale;
                    return lang !== 'ko';
                } catch (error) {
                    console.error('Error determining locale:', error);
                    // 기본값으로 false 반환
                    return false;
                }
            },
        },
        async created(){
            await this.setUserInfo()
        },
        watch: {
            "prompt": {
                deep:true,
                handler:  _.debounce(function(newVal, oldVal)  {
                    if(this.isCreatedModel){
                        this.modelIds.CJMDefinitionId = this.uuid()
                        this.isCreatedModel = false
                    }
                },1000)
            }
        },
        async mounted(){
            var me = this
            this.generator = new Generator(this);
            this.step=1;
            this.init()
        
        },
        data() {
            return {
                isCreatedModel: false,
                selectedEditPersona: null,
                listKey: 0,
                input:{title: this.prompt},
                done: false,
                womanIndex: 0,
                meanIndex: 0,
                womanAvatars: [
                    "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light",
                    "https://avataaars.io/?avatarStyle=Circle&topType=LongHairShavedSides&accessoriesType=Round&hatColor=PastelGreen&facialHairType=Blank&facialHairColor=BlondeGolden&clotheType=Hoodie&clotheColor=PastelRed&eyeType=Happy&eyebrowType=UpDownNatural&mouthType=ScreamOpen&skinColor=Light",
                    "https://avataaars.io/?avatarStyle=Circle&topType=LongHairCurly&accessoriesType=Round&hairColor=Platinum&facialHairType=Blank&clotheType=ShirtVNeck&clotheColor=Gray01&eyeType=WinkWacky&eyebrowType=UpDown&mouthType=Eating&skinColor=Yellow",
                    "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light",
                    "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light",
                    "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light",
                        
                ],
                menAvatars:[
                    "https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=White&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light",
                    "https://avataaars.io/?avatarStyle=Circle&topType=WinterHat4&accessoriesType=Prescription01&hatColor=Blue02&facialHairType=BeardMedium&facialHairColor=BrownDark&clotheType=ShirtCrewNeck&clotheColor=PastelBlue&eyeType=Default&eyebrowType=RaisedExcited&mouthType=Smile&skinColor=DarkBrown",
                    "https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=White&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light",
                    "https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=White&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light",
                    "https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=White&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light",
                    "https://avataaars.io/?avatarStyle=Circle&topType=Eyepatch&accessoriesType=Kurt&facialHairType=BeardMedium&facialHairColor=Red&clotheType=ShirtVNeck&clotheColor=PastelYellow&eyeType=Default&eyebrowType=SadConcerned&mouthType=Grimace&skinColor=Brown",
                ],
                step: 1,
                state:{
                    generator: "CJMGenerator",
                    persona: null,
                    personaDescription: null,
                    scenario: null,
                },
                generator: null,
                personaEditMode: false,
                storageCondition: null,
                showStorageDialog: false,
            }
        },
        methods: {
            deleteModel(id){
                var me = this
                var personaIndex = me.value.personas.findIndex(x => x.persona == me.state.persona)
                var modelIndex = me.value.personas[personaIndex].modelList.findIndex(x => x == id)
                me.value.personas[personaIndex].modelList.splice(modelIndex, 1)
                me.selectPersona(me.value.personas[personaIndex])

                me.$emit("input", me.value)
                me.$emit("change", "customerJourneyMap")
            },
            init(){
                var me = this
                if(!me.modelIds.CJMDefinitionId) me.modelIds.CJMDefinitionId = me.uuid();
                if(!me.value){
                    me.value = {
                        personas: [],
                        selectedPersona: null,
                    }
                    me.generate();
                } else {
                    me.done = true;
                    if(me.value.selectedPersona){
                        me.selectPersona(me.value.selectedPersona)
                    }

                }
            },  
            selectPersona(persona){
                var me = this
                me.value.selectedPersona = persona; 
                me.state.scenario=persona.scenario; 
                me.state.modelList=persona.modelList; 
                me.state.persona=persona.persona; 
                me.state.personaDescription=persona.description; 
                me.state.title = me.prompt; // ? 
                me.step=2;
                me.listKey++;
            },

            async onGenerationFinished(){
                var me = this
                me.done = true;
                me.$emit("input", me.value)
                me.$emit("change", "customerJourneyMap")
                me.$emit("setPersonas", me.value.personas);
            },
            onModelCreated(personas){
                var me = this;
                if(!me.value || !me.value.personas){
                    me.value = {
                        personas: [],
                        selectedPersona: null
                    }
                }
                me.value.personas = personas;
                if(this.value.personas)
                    for(var i=0; i<this.value.personas.length; i++){
                        var persona = this.value.personas[i];
                        if(persona.gender=='female'){
                            persona.avatar = me.womanAvatars[i % me.womanAvatars.length];
                        }else if(persona.gender=='male'){
                            persona.avatar = me.menAvatars[i % me.menAvatars.length];
                        }
                        
                    };
            },
            async generate(){
                let issuedTimeStamp = Date.now()
                let usage = new Usage({
                    serviceType: `CJM_AIGeneration`,
                    issuedTimeStamp: issuedTimeStamp,
                    expiredTimeStamp: Date.now(),
                    metadata: {
                        projectId: this.modelIds.projectId,
                        modelId: this.modelIds.CJMDefinitionId
                    }
                });
                if(!await usage.use()) {
                    this.stop()
                    return false;
                }

                if(localStorage.getItem("prompt")) {
                    if(localStorage.getItem("prompt")==this.prompt) {
                        localStorage.setItem("useCache", true);
                    }else{
                        localStorage.setItem("useCache", false);
                    }
                }else{
                    localStorage.setItem("prompt", this.prompt);
                }
                
                this.selectedModelId = null;
                this.scenario = '';
                this.generator.generate();
                this.done = false;
            },
            stop(){
                this.generator.stop();
                this.done = true;
            },
            jump(){
                var me = this

                let personaIndex = me.value.personas.findIndex(x => x.persona == me.value.selectedPersona.persona)
                if(!me.value.personas[personaIndex].modelList){
                    me.value.personas[personaIndex].modelList = []
                }

                // if(me.isServerProject) me.value.personas[personaIndex].modelList.push(me.modelIds.CJMDefinitionId)
                if(me.isServerProject) me.state.associatedProject = me.modelIds.projectId
                me.selectPersona(me.value.personas[personaIndex])
                me.$emit("input", me.value)
                me.$emit("change", "customerJourneyMap")
                    
                localStorage["gen-state"] = JSON.stringify(me.state);
                window.open(`/#/cjm/${me.modelIds.CJMDefinitionId}`, "_blank")
                me.isCreatedModel = true;
            },
            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            },
            editPersona(persona){
                this.selectedEditPersona = persona.scenario
                this.personaEditMode = true;
            },
            savePersona(){
                this.selectedEditPersona = null;
                this.personaEditMode = false;
            }
        }
    }
</script>
<style>
</style>