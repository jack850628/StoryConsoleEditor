<template>
    <div class="block" @mouseout.stop="mouseOut" @mouseover.stop="mouseOver" @mouseup.stop="mouseUp" @mousemove.stop="mouseMove" @mousedown.stop="mouseDown" @contextmenu.stop="contextMenu" :style="{position, top: mTop, left: mLeft, width, height, backgroundColor: !entering ? backgroundColor : 'chocolate'}">
        <span>否則做: </span>
        <blocks :b-code.sync="code" :mouseout="mouseOut" :mouseover="mouseOver" :mouseup="mouseUp" :mousemove="mouseMove" :mousedown="mouseDown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick" style="margin-left: 35px; background-color: #5e9aff;"></blocks>
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
    import {BlockBase} from '../JTools.js';
    import {TYPE} from '../Config.js';

    export default {
        props: {
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
            codeTree:{
                handler(val){
                    this.calculableStr = createMathString(val);
                },
                deep: true
            }
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
                        else: [

                        ]
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
    .block{
        padding-bottom: 10px;
    }
</style>