<template>
    <div>
        <v-tooltip v-if="!editMode" bottom>
            <template v-slot:activator="{ on }">
                <v-btn @click="toggleEditMode()" v-if="!editMode" icon v-on="on">
                    <img style="width:50px; height:50px; border-radius:50%;" src="https://lh3.googleusercontent.com/a/AATXAJxPmSv9fSzUbcox3RrXdFzJfFL5mWDZBSrY4-Jw=s96-c"/>
                </v-btn>
            </template>
                <span>{{'Name: ' + Users.name }}</span><br>
                <span>{{'Id: ' + Users.id }}</span><br>
                <span>{{'Email: ' + Users.email }}</span>
        </v-tooltip>

        <!-- Edit Mode -->
        <v-card v-if="editMode" class="mx-auto" style="padding:10px;" outlined>
            <div>
                <v-col>
                    <div>
                        <v-card-title class="user-v-card-title">Id</v-card-title>
                        <v-text-field
                            class="edit-user-v-text-field"
                            label="Id"
                            outlined
                            v-model="Users.id"
                        >{{ Users.id }}
                        </v-text-field>
                    </div>

                    <div>
                        <div style="position:absolute; right:15px; top:110px;">
                            <v-switch
                            @click="passwordViewSwitch()"
                            v-model="passwordCheckSwitch"
                            :label="View"
                            ></v-switch>
                        </div>
                        <div>
                            <v-card-title class="user-v-card-title">Password</v-card-title>
                            <v-text-field
                                class="edit-user-v-text-field"
                                label="Password"
                                :type="passwordType"
                                outlined
                                v-model="Users.password"
                            >{{ Users.password }}
                            </v-text-field>
                        </div>
                        <div>
                            <v-card-title class="user-v-card-title">PasswordConfirm</v-card-title>
                            <v-text-field
                                class="edit-user-v-text-field"
                                label="PasswordConfirm"
                                :type="passwordType"
                                outlined
                                v-model="Users.passwordConfirm"
                            >{{ Users.passwordConfirm }}
                            </v-text-field>
                        </div>
                    </div>

                    <div>
                        <v-card-title class="user-v-card-title">Name</v-card-title>
                        <v-text-field
                            class="edit-user-v-text-field"
                            label="Name"
                            outlined
                            v-model="Users.name"
                        >{{ Users.name }}
                        </v-text-field>
                    </div>

                    <div>
                        <v-card-title class="user-v-card-title">Email</v-card-title>
                        <v-text-field
                            class="edit-user-v-text-field"
                            label="Email"
                            outlined
                            v-model="Users.email"
                        >{{ Users.email }}
                        </v-text-field>
                    </div>

                    <div>
                        <v-card-title class="user-v-card-title">Address</v-card-title>
                        <v-text-field
                            class="edit-user-v-text-field"
                            label="Address"
                            outlined
                            v-model="Users.address"
                        >{{ Users.address }}
                        </v-text-field>
                    </div>

                    <div>
                        <v-card-title class="user-v-card-title">Phone</v-card-title>
                        <v-text-field
                            class="edit-user-v-text-field"
                            label="Phone"
                            outlined
                            v-model="Users.phone"
                        >{{ Users.phone }}
                        </v-text-field>
                    </div>
                </v-col>
            </div>

            <!-- edit,save button -->
            <div class="text-right" style ="margin-top:-30px;">
                <v-btn style="margin-top:30px;" @click="toggleEditMode()" v-if="editMode" color="primary">
                    SAVE
                </v-btn>
            </div>
        </v-card>
    </div>
</template>

<script>
export default {
    name:"user",
    props: {
        editMode: Boolean,
    },
    data:() => ({
        Users: {
            id:'',
            password:'',
            passwordConfirm:'',
            name:'',
            email:'',
            address:'',
            phone:'',
        },
        passwordCheckSwitch:false,
        passwordType:'password',
    }),
    methods: {
        toggleEditMode() {
            var me = this

            me.editMode = !me.editMode

            if(me.editMode == false) {
                if(me.Users.password == me.Users.passwordConfirm) {
                    me.passwordCheckSwitch = false
                    me.passwordType = 'password'
                } else {
                    alert("'Please check if the password is the same.'")
                    me.editMode = !me.editMode
                }
            }
        },
        passwordViewSwitch() {
            var me = this
            if(me.passwordCheckSwitch === true) {
                me.passwordType = 'text'
            } else {
                me.passwordType = 'password'
            }
        },
    },
}
</script>

<style scoped>
    .user-v-card-title {
        display: contents;
    }
    .edit-user-v-text-field {
        margin-top:5px;
        margin-bottom:-20px;
    }
</style>