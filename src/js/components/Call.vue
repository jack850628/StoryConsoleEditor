<template>
    <div class="block" draggable="true" @drag.stop="drag" @drop.stop="drop" @dragstart.stop="dragstart" @dragend.stop="dragend" @dragenter.stop="dragenter" @dragleave.stop="dragleave" @dragover.prevent @contextmenu.stop="contextMenu" :style="{display, position, top: mTop, left: mLeft, width, height, minHeight, minWidth, backgroundColor: !entering ? backgroundColor : 'chocolate'}">
        <span>呼叫: </span>
        <select v-model="fileName" @mousedown.stop="">
            <option v-for="(file, index) in $root.storyFile" :key="index" :value="file.name">{{file.name}}</option>
        </select>
        <v-menu v-model="showMenu" :position-x="menuX" :position-y="menuY" absolute offset-y>
            <v-list>
                <v-list-item v-for="(item, index) in contextMenuItems" :key="index" @click="contextMenuItemClick($event, _self, item, index)">
                    <v-list-item-title v-text="item"></v-list-item-title>
                </v-list-item>
            </v-list>
      </v-menu>
    </div>
</template>

<script>
    import {BlockBase} from '@/js/JTools.js';
    import {TYPE} from '@/js/Config.js';
    import {EVENT} from '@/js/EventBus.js';

    export default {
        props: {
            fileName: {
                type: String,
                default: '',
            },
            contextMenuItemClick: {
                type: Function,
                default: () => {},
            },
            contextMenuItems: {
                type: Array,
                default: () => [],
            },
            ...new BlockBase(),
        },
        data(){
            return ({
                type: TYPE.CODE_BLOCK,
                display: 'flex',
                mTop: this.top,
                mLeft: this.left,
                width: 'auto',
                height: 'auto',
                minHeight: 40,
                minWidth: 50,
                position: "static",
                entering: false,
                showMenu: false,
                menuX: 0,
                menuY: 0,
                data: () => ({
                    call: ''
                }),
            })
        },
        watch: {
            fileName(val){
                this.$emit('update:fileName', val);
            }
        },
        methods: {
            drag: function(event, c){
                this.$emit('drag', event, c ?? this);
            },
            drop: function(event, c){
                this.$emit('drop', event, c ?? this);
            },
            dragstart: function(event, c){
                this.$emit('dragstart', event, c ?? this);
            },
            dragend: function(event, c){
                this.$emit('dragend', event, c ?? this);
            },
            dragenter: function(event, c){
                this.$emit('dragenter', event, c ?? this);
            },
            dragleave: function(event, c){
                this.$emit('dragleave', event, c ?? this);
            },
            move(x, y){
                this.mLeft = x;
                this.mTop = y;
            },
            contextMenu(event){
                event.preventDefault()
                this.showMenu = false
                this.menuX = event.clientX
                this.menuY = event.clientY
                this.$nextTick(() => {
                    this.showMenu = true
                })
            },
            storyFileUpdate({detail}){
                switch(detail.type){
                    case EVENT.UPDATE_STORY_FILE.TYPE.EDIT_NAME: {
                        if(detail.oldFileName == this.fileName){
                            this.fileName = detail.fileName;
                        }
                        break;
                    }
                    case EVENT.UPDATE_STORY_FILE.TYPE.DELETE: {
                        if(detail.fileName == this.fileName){
                            this.fileName = '';
                        }
                        break;
                    }
                }
            }
        },
        mounted(){
            if(!this.isDemo){
                this.$root.$data.eventBus.$on(EVENT.UPDATE_STORY_FILE.NAME, this.storyFileUpdate);
            }
        },
        beforeDestroy(){
            if(!this.isDemo){
                this.$root.$data.eventBus.$off(EVENT.UPDATE_STORY_FILE.NAME, this.storyFileUpdate);
            }
        }
    }
</script>

<style scoped>
    select{
        background-color: white;
        flex: 1;
        margin: 8px;
    }
</style>