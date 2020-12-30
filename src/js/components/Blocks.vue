<template>
    <div @mouseover.stop="mouseover($event, _self)" @mouseout.stop="mouseout($event, _self)" @mousemove.capture="mouseMove($event)" @mouseleave="mouseLeave" @touchmove="mouseMove($event)" :style="{flex: 2, minHeight}">
        <template v-for="(item, index) in code"><!-- 因為template不能設定:key所以將template換成table -->
            <show v-if="'show' in item" :index="index" :calculable.sync="item.show" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></show>
            <exec v-else-if="'exec' in item" :index="index" :calculable.sync="item.exec" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></exec>
            <sleep v-else-if="'sleep' in item" :index="index" :calculable.sync="item.sleep" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></sleep>
            <while v-else-if="'while' in item" :index="index" :b-code.sync="item.then" :calculable.sync="item.while" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></while>
            <if v-else-if="'if' in item" :index="index" :b-code.sync="item.then" :calculable.sync="item.if" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></if>
            <elseif v-else-if="'elseif' in item" :index="index" :b-code.sync="item.then" :calculable.sync="item.elseif" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></elseif>
            <else v-else-if="'else' in item" :index="index" :b-code.sync="item.else" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></else>
            <sc-select v-else-if="'select' in item" :index="index" :b-code.sync="item.select.option" :calculable.sync="item.select.title" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></sc-select>
            <sc-option v-else-if="'text' in item" :index="index" :b-code.sync="item.then" :calculable.sync="item.text" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></sc-option>
            <go-to v-else-if="'goto' in item" :index="index" :file-name.sync="item.goto" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></go-to>
            <continue v-else-if="'continue' in item" :index="index" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></continue>
            <break v-else-if="'break' in item" :index="index" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></break>

            <!-- 人物介紹 -->
            <character v-else-if="'detailed' in item" :index="index" :name.sync="item.name" :detailed.sync="item.detailed" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></character>
            <!-- 人物介紹 -->
            <!-- 全域變數 -->
            <string-variable v-else-if="'type' in item && item.type == 'string'" :index="index" :name.sync="item.name" :value.sync="item.value" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></string-variable>
            <number-variable v-else-if="'type' in item && item.type == 'number'" :index="index" :name.sync="item.name" :value.sync="item.value" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></number-variable>
            <boolean-variable v-else-if="'type' in item && item.type == 'boolean'" :index="index" :name.sync="item.name" :value.sync="item.value" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></boolean-variable>
            <!-- 全域變數 -->

            <operator v-else-if="item.type == esprima.Syntax.BinaryExpression || item.type == esprima.Syntax.AssignmentExpression" :b-code="item" :index="index" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></operator>
            <unary-operator v-else-if="item.type == esprima.Syntax.UnaryExpression" :b-code="item" :index="index" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></unary-operator>
            <bool v-else-if="item.type == esprima.Syntax.Literal && typeof(item.value) == 'boolean'" :b-code="item" :index="index" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></bool>
            <number v-else-if="item.type == esprima.Syntax.Literal && typeof(item.value) == 'number'" :b-code="item" :index="index" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></number>
            <string v-else-if="item.type == esprima.Syntax.Literal" :b-code="item" :index="index" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></string>
            <variable v-else-if="item.type == esprima.Syntax.MemberExpression && item.object.name == 'SC'" :b-code="item" :index="index" @mouseout="mouseout" @mouseover="mouseover" @mouseup="mouseup" @mousemove="mousemove" @mousedown="mousedown" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></variable>
        </template>
    </div>
</template>

<script>
    import {TYPE} from '@/js/Config.js';

    var esprima = require('esprima');

    export default {
        props: {
            bCode: {
                type: Array,
                default: ()=>[],
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
                default: () => [TYPE.CODE_BLOCK]
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
        data(){
            return ({
                esprima: esprima,
                minHeight: 50
            })
        },
        methods: {
            mouseMove: function(event){
                this.$emit('mousemove', event, this);
            },
            mouseLeave: function(event){
                this.$emit('mouseleave', event);
            },
        }
    }
</script>