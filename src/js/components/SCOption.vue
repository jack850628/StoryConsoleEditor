<template>
    <div class="block" draggable="true" @drag.stop="drag" @drop.stop="drop" @dragstart.stop="dragstart" @dragend.stop="dragend" @dragenter.stop="dragenter" @dragleave.stop="dragleave" @dragover.prevent @contextmenu.stop="contextMenu" :style="{position, top: mTop, left: mLeft, width, height, backgroundColor: !entering ? backgroundColor : 'chocolate'}">
        <div style="display: flex; min-height: 40px;">
            <span>選項文字: </span>
            <calculate :b-code.sync="codeTree"  @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></calculate>
        </div>
        <div style="display: flex; min-height: 40px;">
            <span>如果: </span>
            <calculate :b-code.sync="codeTreeArgIf"  @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></calculate>
            <span>就顯示此選項</span>
        </div>
        <div style="display: flex; min-height: 40px;">
            <span>選中後做: </span>
            <blocks :b-code.sync="code" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick" style="background-color: #5e9aff;"></blocks>
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
            args: {
                type: Object,
                default: () => ({
                    if: 'true'
                }),
            },
            bCode: {
                type: Array,
                default: ()=>[],
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
            'args.if': function(val){
                try{
                    this.codeTreeArgIf = esprima.parseScript(val).body[0]?.expression;//在VueComponent重畫時，若重畫前與後的VueComponent是一樣的話，data是會繼續沿用而不會重建
                }catch(e){
                    console.error('運算式解析錯誤',e);
                }
            },
            codeTree: {
                handler(val){
                    this.calculableStr = createMathString(val);
                },
                deep: true
            },
            args: {
                handler(val){
                    this.$emit('update:args', val);
                },
                deep: true
            },
            codeTreeArgIf: {
                handler(val){
                    this.args.if = createMathString(val);
                },
                deep: true
            }
        },
        data(){
            return ({
                type: TYPE.SELECT_OPTION,
                codeTree: esprima.parseScript(this.calculable).body[0]?.expression,
                codeTreeArgIf: this.args.if
                    ? esprima.parseScript(this.args.if).body[0]?.expression
                    : true
                ,
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
                        text: SC_NULL.name,
                        then: [
                            
                        ],
                        args: {
                            if: 'true',
                        }
                    });
                }
            })
        },
        computed:{
            code: {
                get(){
                    return this.bCode;
                },
                set(val){
                    this.$emit('update:bCode', val);
                }
            },
            calculableStr: {
                // get(){
                //     return this.calculable;
                // },
                set(val){
                    this.$emit('update:calculable', val);
                }
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
    /* .block::before{
        position: relative;
        content: "";
        background-color: blue;
        width: 20px;
        height: 20px;
        display: block;
        top: -10px;
        left: 5px;
        clip-path: polygon(24% 0, 33% 0, 100% 0, 100% 100%, 33% 100%, 24% 94%, 16% 100%, 0 100%, 0 0, 16% 0);
    } */
    /* .block::after{
        content:"我是 after";
        color:red;
    } */
    .block{
        border-radius: 10px;
        padding-bottom: 10px;
        /* clip-path: polygon(0 5px, 20px 5px, 25px 0, 30px 5px, 100% 5px, 100% 100%, 30px 100%, 25px calc(100% - 5px), 20px 100%, 0 100%); */
    }
</style>