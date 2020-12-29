<template>
    <div class="block" @mouseout.stop="mouseOut" @mouseover.stop="mouseOver" @mouseup.stop="mouseUp" @mousemove.stop="mouseMove" @mousedown.stop="mouseDown" @contextmenu.stop="contextMenu" :style="{display, alignItems, position, top: mTop, left: mLeft, width, height, minHeight, backgroundColor: !entering ? backgroundColor : 'chocolate', borderRadius: '50px'}">
        <input type="text" style="width: 100%; margin-left: 10px; margin-right: 10px;" v-model="code.value" @mouseout.stop="" @mouseover.stop="" @mouseup.stop="" @mousemove.stop="" @mousedown.stop=""/>
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

    var esprima = require('esprima');

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
            ...new BlockBase(),
        },
        computed:{
            code: {
                get(){
                    return this.bCode;
                },
                set(val){
                    this.$emit('update:bCode', val);
                }
            }
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
            mouseUp: function(event, c){this.$emit('mouseup', event, c ?? this)},
            mouseMove: function(event, c){this.$emit('mousemove', event, c ?? this)},
            mouseDown: function(event, c){this.$emit('mousedown', event, c ?? this)},
            mouseOver: function(event, c){this.$emit('mouseover', event, c ?? this)},
            mouseOut: function(event, c){this.$emit('mouseout', event, c ?? this)},
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