<template>
    <div class="block" @mouseout.stop="mouseOut" @mouseover.stop="mouseOver" @mouseup.stop="mouseUp" @mousemove.stop="mouseMove" @mousedown.stop="mouseDown" @contextmenu.stop="contextMenu" :style="{position, top: mTop, left: mLeft, width, minHeight, backgroundColor: !entering ? backgroundColor : 'chocolate'}">
        <div style="display: flex; min-height: 40px;">
            <span>暫停:</span>
            <calculate :b-code.sync="codeTree" :mouseout="mouseOut" :mouseover="mouseOver" :mouseup="mouseUp" :mousemove="mouseMove" :mousedown="mouseDown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></calculate>
            <span>秒</span>
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
            calculable: {
                type: String,
                default: "",
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
        watch: {
            calculable(val){
                this.codeTree = esprima.parseScript(val).body[0]?.expression;//在VueComponent重畫時，若重畫前與後的VueComponent是一樣畫，data是會繼續沿用而不會重建
            },
            codeTree: {
                handler(val){
                    this.calculableStr = createMathString(val);
                },
                deep: true
            }
        },
        computed:{
            calculableStr: {
                get(){
                    return this.calculable;
                },
                set(val){
                    this.$emit('update:calculable', val);
                }
            }
        },
        data(){
            return ({
                type: TYPE.CODE_BLOCK,
                codeTree: esprima.parseScript(this.calculable).body[0]?.expression,
                mTop: this.top,
                mLeft: this.left,
                width: 'auto',
                minHeight: 40,
                position: "static",
                entering: false,
                showMenu: false,
                menuX: 0,
                menuY: 0,
                data(){
                    return ({
                        sleep: ""
                    });
                }
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
        }
    };
</script>