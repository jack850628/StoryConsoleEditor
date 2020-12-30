<template>
    <div class="block" @mouseout.stop="mouseOut" @mouseover.stop="mouseOver" @mouseup.stop="mouseUp" @mousemove.stop="mouseMove" @mousedown.stop="mouseDown" @touchend.stop="mouseUp" @touchmove.stop="mouseMove" @touchstart.stop="mouseDown" @contextmenu.stop="contextMenu" :style="{position, top: mTop, left: mLeft, width, height, backgroundColor: !entering ? backgroundColor : 'chocolate'}">
        <div style="display: flex; margin: 10px">
            <span>名稱: </span>
            <input type="text" style="width: 100%; margin-left: 10px; margin-right: 10px;" v-model="_name" @mouseout.stop="" @mouseover.stop="" @mouseup.stop="" @mousemove.stop="" @mousedown.stop="" @touchend.stop="" @touchmove.stop="" @touchstart.stop=""/>
        </div>
        <div style="display: flex; margin: 10px">
            <span>值: </span>
            <select style="width: 100%; margin-left: 10px; margin-right: 10px;" v-model="_value" @mouseout.stop="" @mouseover.stop="" @mouseup.stop="" @mousemove.stop="" @mousedown.stop="" @touchend.stop="" @touchmove.stop="" @touchstart.stop="">
                <option value="true">真</option>
                <option value="false">假</option>
            </select>
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
    import {BlockBase, createMathString} from '@/js/JTools.js';
    import {TYPE} from '@/js/Config.js';
    
    var esprima = require('esprima');

    export default {
        props: {
            name: {
                type: String,
                default: '',
            },
            value: {
                type: Number,
                default: 0,
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
                        type: 'boolean',
                        value: true,
                    });
                }
            })
        },
        computed:{
            _name: {
                get(){
                    return this.name
                },
                set(val){
                    this.$emit('update:name', val);
                }
            },
            _value: {
                get(){
                    return this.value
                },
                set(val){
                    this.$emit('update:value', val);
                }
            }
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
    input, select{
        background-color: white;
    }
</style>