<template>
    <div @mouseover.stop="mouseover($event, _self)" @mouseout.stop="mouseout($event, _self)" :style="{display, alignItems, minWidth, minHeight, marginTop, marginBottom, backgroundColor, borderRadius: '50px'}">
        <operator v-if="code && (code.type == esprima.Syntax.BinaryExpression || code.type == esprima.Syntax.AssignmentExpression)" :b-code="code" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></operator>
        <unary-operator v-else-if="code && code.type == esprima.Syntax.UnaryExpression" :b-code="code" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></unary-operator>
        <bool v-else-if="code && code.type == esprima.Syntax.Literal && typeof(code.value) == 'boolean'" :b-code="code" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></bool>
        <number v-else-if="code && code.type == esprima.Syntax.Literal && typeof(code.value) == 'number'" :b-code="code" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></number>
        <string v-else-if="code && code.type == esprima.Syntax.Literal" :b-code="code" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></string>
        <variable v-else-if="code && code.type == esprima.Syntax.MemberExpression && code.object.name == 'SC'" :b-code="code" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></variable>
    </div>
</template>

<script>
    import {TYPE} from '@/js/Config.js';

    var esprima = require('esprima');

    export default {
        props: {
            bCode: {
                type: Object,
                default: ()=>({}),
            },
            mouseup:{
                type: Function,
            },
            mousemove:{
                type: Function,
            },
            mousedown:{
                type: Function,
            },
            mouseover:{
                type: Function,
            },
            mouseout:{
                type: Function,
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
            })
        }
    }
</script>