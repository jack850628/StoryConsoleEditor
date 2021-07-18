<template>
    <div class="block" draggable="true" @drag.stop="drag" @drop.stop="drop" @dragstart.stop="dragstart" @dragend.stop="dragend" @dragenter.stop="dragenter" @dragleave.stop="dragleave" @dragover.prevent @contextmenu.stop="contextMenu" :style="{position, top: mTop, left: mLeft, width, minHeight, backgroundColor: !entering ? backgroundColor : 'chocolate', borderRadius, flex}">
        <div class="operator">
            <template v-if="['=', '+=', '-='].includes(code.operator)">
                <calculate :b-code.sync="code.left" :allowType="[TYPE.LIFT_VAR_BLOCK]" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></calculate>
            </template>
            <template v-else>
                <calculate :b-code.sync="code.left" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></calculate>
            </template>
            <span style="padding: 5px;">{{code.operator}}</span>
            <calculate :b-code.sync="code.right" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></calculate>
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
                borderRadius: '50px',
                flex: 1,
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