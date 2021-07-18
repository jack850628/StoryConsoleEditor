<template>
    <div @dragenter.stop="dragenter" @dragleave.stop="dragleave" @drop.stop="drop" @dragover.prevent :style="{display, alignItems, minWidth, minHeight, marginTop, marginBottom, backgroundColor, borderRadius, flex}">
        <operator v-if="code && (code.type == esprima.Syntax.BinaryExpression || code.type == esprima.Syntax.AssignmentExpression)" :b-code="code" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></operator>
        <unary-operator v-else-if="code && code.type == esprima.Syntax.UnaryExpression" :b-code="code" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></unary-operator>
        <bool v-else-if="code && code.type == esprima.Syntax.Literal && typeof(code.value) == 'boolean'" :b-code="code" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></bool>
        <number v-else-if="code && code.type == esprima.Syntax.Literal && typeof(code.value) == 'number'" :b-code="code" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></number>
        <string v-else-if="code && code.type == esprima.Syntax.Literal" :b-code="code" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></string>
        <variable v-else-if="code && code.type == esprima.Syntax.MemberExpression && code.object.name == 'SC'" :b-code="code" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></variable>
    </div>
</template>

<script>
    import {TYPE} from '@/js/Config.js';
    import {SC_NULL} from '@/js/JTools.js';

    var esprima = require('esprima');

    export default {
        props: {
            bCode: {
                type: Object,
                default: () => SC_NULL,
            },
            contextMenuItemClick: {
                type: Function,
                default: () => {},
            },
            contextMenuItems: {
                type: Array,
                default: () => [],
            },
            allowType: {
                type: Array,
                default: () => [TYPE.VAR_BLOCK, TYPE.LIFT_VAR_BLOCK]
            }
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
        },
        data(){
            return ({
                esprima: esprima,
                display: 'flex',
                alignItems: 'center',
                minWidth: 50,
                minHeight: 45,
                marginTop: 5,
                marginBottom: 5,
                backgroundColor: "#5e9aff",
                borderRadius: '50px',
                flex: 1,
            })
        }
    }
</script>