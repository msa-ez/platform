<template>
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right width="500">
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-avatar>
                        <img :src="img">
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title class="headline">{{ titleName }}</v-list-item-title>
                    </v-list-item-content>
                    <v-btn icon @click.native="closePanel()">
                        <v-icon color="grey lighten-1">mdi-close</v-icon>
                    </v-btn>
                </v-list-item>
            </v-list>

            <v-list class="pt-0" dense flat>
                <v-divider></v-divider>
                <v-card outlined>
                    <v-card-text>
                        <v-text-field 
                                v-model="value.name" 
                                label="Class Name"
                                required
                                autofocus
                                :disabled="isReadOnly"
                        ></v-text-field>
                        <v-text-field
                                v-model="value.displayName"
                                label="Display Name"
                                :disabled="isReadOnly"
                        ></v-text-field>

                        <v-text-field 
                                v-model="value.message" 
                                label="Message"
                                :disabled="isReadOnly"
                        ></v-text-field>

                        <v-select
                                v-model="value.httpStatus"
                                :items="codeList"
                                label="HttpStatus"
                                :disabled="isReadOnly"
                        ></v-select>
                    </v-card-text>
                </v-card>
            </v-list>
        </v-navigation-drawer>
    </v-layout>

</template>

<script>
    import UMLPropertyPanel from '../UMLPropertyPanel'

    export default {
        mixins: [UMLPropertyPanel],
        name: 'uml-exception-panel',
        props: {
            titleName: {
                type: String,
                default: ''
            }
        },
        data: function () {
            return {
                codeList: [ 'ACCEPTED', 'ALREADY_REPORTED', 'BAD_GATEWAY', 'BAD_REQUEST', 'BANDWIDTH_LIMIT_EXCEEDED', 'CHECKPOINT', 'CONFLICT', 'CONTINUE', 'CREATED', 'EXPECTATION_FAILED', 'FAILED_DEPENDENCY', 'FORBIDDEN', 'FOUND', 'GATEWAY_TIMEOUT', 'GONE', 'HTTP_VERSION_NOT_SUPPORTED', 'I_AM_A_TEAPOT', 'IM_USED', 'INSUFFICIENT_STORAGE', 'INTERNAL_SERVER_ERROR', 'LENGTH_REQUIRED', 'LOCKED', 'LOOP_DETECTED', 'METHOD_NOT_ALLOWED', 'MOVED_PERMANENTLY', 'MULTI_STATUS', 'MULTIPLE_CHOICES', 'NETWORK_AUTHENTICATION_REQUIRED', 'NO_CONTENT', 'NON_AUTHORITATIVE_INFORMATION', 'NOT_ACCEPTABLE', 'NOT_EXTENDED', 'NOT_FOUND', 'NOT_IMPLEMENTED', 'NOT_MODIFIED', 'OK', 'PARTIAL_CONTENT', 'PAYLOAD_TOO_LARGE', 'PAYMENT_REQUIRED', 'PERMANENT_REDIRECT', 'PRECONDITION_FAILED', 'PRECONDITION_REQUIRED', 'PROCESSING', 'PROXY_AUTHENTICATION_REQUIRED', 'REQUEST_HEADER_FIELDS_TOO_LARGE', 'REQUEST_TIMEOUT', 'REQUESTED_RANGE_NOT_SATISFIABLE', 'RESET_CONTENT', 'SEE_OTHER', 'SERVICE_UNAVAILABLE', 'SWITCHING_PROTOCOLS', 'TEMPORARY_REDIRECT', 'TOO_EARLY', 'TOO_MANY_REQUESTS', 'UNAUTHORIZED', 'UNAVAILABLE_FOR_LEGAL_REASONS', 'UNPROCESSABLE_ENTITY', 'UNSUPPORTED_MEDIA_TYPE', 'UPGRADE_REQUIRED', 'URI_TOO_LONG', 'VARIANT_ALSO_NEGOTIATES' ],
            }
        },
        computed: {
        },
        created() { },
        methods:{
            panelInit(){
                var me = this

                // Element
                if (!me.value.message || me.value.message === '') {
                    var message = '';
                    for(var x of this.value.name) {
                        if(x === x.toUpperCase()) {
                            message += ' ' + x;
                        } else {
                            message += x;
                        }
                    }
                    if (message.charAt(0) == ' ') {
                        message = message.substring(1);
                    }
                    me.value.message = message
                }

                // Common
                if ( !me.canvas.embedded ) {
                    me.openPanelAction()
                }
            },
        },
    }
</script>
