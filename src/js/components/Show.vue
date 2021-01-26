<template>
    <div class="block" draggable="true" @drag.stop="drag" @drop.stop="drop" @dragstart.stop="dragstart" @dragend.stop="dragend" @dragenter.stop="dragenter" @dragleave.stop="dragleave" @dragover.prevent @contextmenu.stop="contextMenu" :style="{position, top: mTop, left: mLeft, width, minHeight, backgroundColor: !entering ? backgroundColor : 'chocolate'}">
        <div style="display: flex; min-height: 40px;">
            <span>顯示:</span>
            <calculate :b-code.sync="codeTree" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></calculate>
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
    import {BlockBase, createMathString, SC_NULL} from '@/js/JTools.js';
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
                try{
                    this.codeTree = esprima.parseScript(val).body[0]?.expression;//在VueComponent重畫時，若重畫前與後的VueComponent是一樣的話，data是會繼續沿用而不會重建
                }catch(e){
                    console.error('運算式解析錯誤',e);
                }
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
                        show: SC_NULL.name
                    });
                }
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
        }
    };
</script>