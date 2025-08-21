<template>
    <div
            :id="elementId"
            class="vue-simple-context-menu"
            v-click-outside="onClickOutside"
    >
        <v-tooltip right v-for="(item, key) in options" :key="key">
            <template v-slot:activator="{ on }">
                <span
                        class="draggable"
                        align="center"
                        @click.stop="optionClicked(item)"
                        :style="toolStyle(key, options.length)"
                >
                    <img valign="middle"
                            style="vertical-align:middle; border: 2 solid grey; -webkit-box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.75); -moz-box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.40); box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.40);"
                            onmouseover="this.height=this.height*1.5;this.width=this.width*1.5;this.left=this.left-this.width*0.5;this.right=this.right-this.width*0.5;"
                            onmouseout="this.height=this.height/1.5;this.width=this.width/1.5;this.left=this.left+this.width*0.5;this.right=this.right+this.width*0.5;"
                            height="30px" width="30px" 
                            :src="item.src" 
                            v-on="on" 
                    >
                    <v-chip v-on="on">{{item.label}}</v-chip>
                </span>
            </template>

            <v-card class="mx-auto"
                    max-width="500"
                    outlined
            >
                <v-list-item three-line>
                    <v-list-item-content>
                        <div class="overline mb-4">{{item.component}}</div>
                        <v-list-item-title class="headline mb-1">{{item.label}}</v-list-item-title>
                        <v-list-item-subtitle>{{item.description}}</v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-avatar
                            tile size="80"
                            color="white">
                        <v-img :src="item.src"></v-img>
                    </v-list-item-avatar>
                </v-list-item>
            </v-card>
        </v-tooltip>
    </div>
</template>

<script>
    export default {
        name: "business-model-tooltip",
        props: {
            elementId: {
                type: String,
                required: true
            },
            options: {
                type: Array,
                required: true
            }
        },
        data() {
            return {
                item: null,
                menuWidth: null,
                menuHeight: null,
            };
        },
        methods: {
            showMenu(event, item) {
                var me = this;

                this.item = item;
                var menu = document.getElementById(this.elementId);
                if (!menu) {
                    return;
                }

                if (!this.menuWidth || !this.menuHeight) {
                    menu.style.visibility = "hidden";
                    menu.style.display = "block";
                    this.menuWidth = menu.offsetWidth;
                    this.menuHeight = menu.offsetHeight;
                    menu.removeAttribute("style");
                }

                if (this.menuWidth + event.pageX >= window.innerWidth) {
                    menu.style.left = event.pageX - this.menuWidth + 2 + "px";
                } else {
                    menu.style.left = event.pageX - 2 + "px";
                }

                if (this.menuHeight + event.pageY >= window.innerHeight) {
                    menu.style.top = event.pageY - this.menuHeight + 2 + "px";
                } else {
                    menu.style.top = event.pageY - 2 + "px";
                }
                
                menu.classList.add("vue-simple-context-menu--active");
            },
            hideContextMenu() {
                const element = document.getElementById(this.elementId);
                if (element) {
                    element.classList.remove("vue-simple-context-menu--active");
                    this.$emit("menu-closed");
                }
            },
            onClickOutside() {
                this.hideContextMenu();
            },
            optionClicked(option) {
                this.hideContextMenu();
                this.$emit("option-clicked", {
                    item: this.item,
                    option: option
                });
            },
            toolStyle(cardIndex, cardLength) {
                var me = this
                var angle = cardIndex * 40 / cardLength;
                var angle2 = cardIndex * 10 / cardLength - 3;
                var radians = (Math.PI / 180) * angle;

                var curvedX = Math.cos(radians) * 500 - 500;
                var curvedY = Math.sin(radians) * 700;

                return `left: ${curvedX}px; top: ${curvedY}px; text-align: left; position: absolute; transform: rotate(${angle2}deg); display: flex;`;
            },
        },
    };
</script>

<style lang="scss">
</style>
