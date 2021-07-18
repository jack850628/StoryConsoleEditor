<template>
    <div class="block" draggable="true" @drag.stop="drag" @drop.stop="drop" @dragstart.stop="dragstart" @dragend.stop="dragend" @dragenter.stop="dragenter" @dragleave.stop="dragleave" @dragover.prevent @contextmenu.stop="contextMenu" :style="{position, top: mTop, left: mLeft, width, height, backgroundColor: !entering ? backgroundColor : 'chocolate'}">
        <div style="display: flex; margin: 10px">
            <span>人物名稱: </span>
            <input type="text" style="width: 100%; margin-left: 10px; margin-right: 10px;" v-model="name" @drop.stop="drop" @dragstart.stop="dragstart" @dragend.stop="dragend" @dragenter.stop="dragenter" @dragleave.stop="dragleave"/>
        </div>
        <div style="display: flex; margin: 10px">
            <span>人物介紹: </span>
            <textarea type="text" style="width: 100%; margin-left: 10px; margin-right: 10px; background-color: white;" v-model="detailed" @drop.stop="drop" @dragstart.stop="dragstart" @dragend.stop="dragend" @dragenter.stop="dragenter" @dragleave.stop="dragleave"/>
        </div>
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

    export default {
        props: {
            name: {
                type: String,
                default: '',
            },
            detailed: {
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
                mTop: this.top,
                mLeft: this.left,
                width: 'auto',
                height: 'auto',
                position: "static",
                entering: false,
                showMenu: false,
                menuX: 0,
                menuY: 0,
                data(){
                    return ({
                        name: '',
                        detailed: '',
                    });
                }
            })
        },
        watch:{
            name(val){
                this.$emit('update:name', val);
            },
            detailed(val){
                this.$emit('update:detailed', val);
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
        },
    }
</script>

<style scoped>
    input{
        background-color: white;
    }
</style>