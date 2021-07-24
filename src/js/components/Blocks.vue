<template>
    <div @dragenter.stop="dragenter" @dragleave.stop="dragleave" @drop.stop="drop" @dragover.prevent :style="{flex: 2, minHeight}">
        <template v-for="(item, index) in code"><!-- 因為template不能設定:key所以將template換成table -->
            <show v-if="'show' in item" :index="index" :calculable.sync="item.show" :args.sync="item.args" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></show>
            <show-image v-if="'showImage' in item" :index="index" :image-name.sync="item.showImage" :args.sync="item.args" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></show-image>
            <exec v-else-if="'exec' in item" :index="index" :calculable.sync="item.exec" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></exec>
            <sleep v-else-if="'sleep' in item" :index="index" :calculable.sync="item.sleep" :args.sync="item.args" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></sleep>
            <while v-else-if="'while' in item" :index="index" :b-code.sync="item.then" :calculable.sync="item.while" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></while>
            <if v-else-if="'if' in item" :index="index" :b-code.sync="item.then" :calculable.sync="item.if" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></if>
            <elseif v-else-if="'elseif' in item" :index="index" :b-code.sync="item.then" :calculable.sync="item.elseif" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></elseif>
            <else v-else-if="'else' in item" :index="index" :b-code.sync="item.else" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></else>
            <sc-select v-else-if="'select' in item" :index="index" :b-code.sync="item.select.option" :calculable.sync="item.select.title" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></sc-select>
            <sc-option v-else-if="'text' in item" :index="index" :b-code.sync="item.then" :calculable.sync="item.text" :args.sync="item.args" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></sc-option>
            <go-to v-else-if="'goto' in item" :index="index" :file-name.sync="item.goto" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></go-to>
            <call v-else-if="'call' in item" :index="index" :file-name.sync="item.call" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></call>
            <black-current-story-file v-else-if="'blackCurrentStoryFile' in item" :index="index" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></black-current-story-file>
            <continue v-else-if="'continue' in item" :index="index" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></continue>
            <break v-else-if="'break' in item" :index="index" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></break>
            <clear v-else-if="'clear' in item" :index="index" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></clear>

            <!-- 人物介紹 -->
            <character v-else-if="'detailed' in item" :index="index" :name.sync="item.name" :detailed.sync="item.detailed" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></character>
            <!-- 人物介紹 -->
            <!-- 關於 -->
            <about-text v-else-if="'aboutText' in item" :index="index" :text.sync="item.aboutText" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></about-text>
            <about-link v-else-if="'aboutLinkName' in item" :index="index" :name.sync="item.aboutLinkName" :url.sync="item.aboutLinkUrl" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></about-link>
            <!-- 關於 -->
            <!-- 全域變數 -->
            <string-variable v-else-if="'type' in item && item.type == 'string'" :index="index" :name.sync="item.name" :value.sync="item.value" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></string-variable>
            <number-variable v-else-if="'type' in item && item.type == 'number'" :index="index" :name.sync="item.name" :value.sync="item.value" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></number-variable>
            <boolean-variable v-else-if="'type' in item && item.type == 'boolean'" :index="index" :name.sync="item.name" :value.sync="item.value" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></boolean-variable>
            <!-- 全域變數 -->
            <!-- 圖片 -->
            <sc-image v-else-if="'image' in item" :index="index" :name.sync="item.name" :src.sync="item.image" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></sc-image>
            <!-- 圖片 -->

            <operator v-else-if="item.type == esprima.Syntax.BinaryExpression || item.type == esprima.Syntax.AssignmentExpression" :b-code="item" :index="index" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></operator>
            <unary-operator v-else-if="item.type == esprima.Syntax.UnaryExpression" :b-code="item" :index="index" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></unary-operator>
            <bool v-else-if="item.type == esprima.Syntax.Literal && typeof(item.value) == 'boolean'" :b-code="item" :index="index" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></bool>
            <number v-else-if="item.type == esprima.Syntax.Literal && typeof(item.value) == 'number'" :b-code="item" :index="index" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></number>
            <string v-else-if="item.type == esprima.Syntax.Literal" :b-code="item" :index="index" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></string>
            <variable v-else-if="item.type == esprima.Syntax.MemberExpression && item.object.name == 'SC'" :b-code="item" :index="index" @drag="drag" @drop="drop" @dragstart="dragstart" @dragend="dragend" @dragenter="dragenter" @dragleave="dragleave" :context-menu-items="contextMenuItems" :context-menu-item-click="contextMenuItemClick"></variable>
        </template>
    </div>
</template>

<script>
    import {TYPE} from '@/js/Config.js';
import AboutText from './AboutText.vue';
import AboutLink from './AboutLink.vue';
import ShowImage from './ShowImage.vue';

    var esprima = require('esprima');

    export default {
  components: { AboutText, AboutLink, ShowImage },
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
        }
    }
</script>