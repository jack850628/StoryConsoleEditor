<template>
    <div class="block" @mouseout.stop="mouseOut" @mouseover.stop="mouseOver" @mouseup.stop="mouseUp" @mousemove.stop="mouseMove" @mousedown.stop="mouseDown" @touchend.stop="mouseUp" @touchmove.stop="mouseMove" @touchstart.stop="mouseDown" @contextmenu.stop="contextMenu" :style="{position, top: mTop, left: mLeft, width, minHeight, backgroundColor: !entering ? backgroundColor : 'chocolate', borderRadius: '50px'}">
        <div class="operator">
            <template v-if="code.operator.includes('=', '+=', '-=')">
                <calculate :b-code.sync="code.left" :allowType="[TYPE.LIFT_VAR_BLOCK]" :mouseout="mouseOut" :mouseover="mouseOver" :mouseup="mouseUp" :mousemove="mouseMove" :mousedown="mouseDown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></calculate>
            </template>
            <template v-else>
                <calculate :b-code.sync="code.left" :mouseout="mouseOut" :mouseover="mouseOver" :mouseup="mouseUp" :mousemove="mouseMove" :mousedown="mouseDown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></calculate>
            </template>
            <span style="padding: 5px;">{{code.operator}}</span>
            <calculate :b-code.sync="code.right" :mouseout="mouseOut" :mouseover="mouseOver" :mouseup="mouseUp" :mousemove="mouseMove" :mousedown="mouseDown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></calculate>
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
            bCode: {
                type: Object,
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
                TYPE,
                type: TYPE.VAR_BLOCK,
                mTop: this.top,
                mLeft: this.left,
                width: 'auto',
                minHeight: 40,
                position: "static",
                entering: false,
                showMenu: false,
                menuX: 0,
                menuY: 0,
                data: ()=>{
                    return {...this.bCode};
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
                console.log('??')
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