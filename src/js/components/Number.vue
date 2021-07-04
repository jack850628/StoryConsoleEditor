<template>
    <div class="block" draggable="true" @drag.stop="drag" @drop.stop="drop" @dragstart.stop="dragstart" @dragend.stop="dragend" @dragenter.stop="dragenter" @dragleave.stop="dragleave" @dragover.prevent @contextmenu.stop="contextMenu" :style="{display, alignItems, position, top: mTop, left: mLeft, width, height, minHeight, backgroundColor: !entering ? backgroundColor : 'chocolate', borderRadius: '50px'}">
        <input type="number" style="width: 100%; margin-left: 10px; margin-right: 10px;" v-model.number="bCode.value" @drop.stop="drop" @dragstart.stop="dragstart" @dragend.stop="dragend" @dragenter.stop="dragenter" @dragleave.stop="dragleave"/>
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
            bCode: {
                type: Object,
                default: ()=>({}),
            },
            contextMenuItemClick: {
                type: Function,
                default: () => {},
            },
            contextMenuItems: {
                type: Array,
                default: () => [],
            },
            ...new BlockBase({backgroundColor: '#6200ff'}),
        },
        data(){
            return ({
                type: TYPE.VAR_BLOCK,
                display: 'flex',
                alignItems: 'center',
                mTop: this.top,
                mLeft: this.left,
                width: 'auto',
                height: 'auto',
                minHeight: 40,
                position: "static",
                entering: false,
                showMenu: false,
                menuX: 0,
                menuY: 0,
                data: ()=>({...this.bCode})
            })
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