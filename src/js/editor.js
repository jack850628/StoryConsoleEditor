import Vue from 'vue';
// import {default as Vuex, mapState} from 'vuex'
import vuetify from '@/plugins/vuetify';
import {TYPE, DRAG_BLOCK_OFFSET_X, DRAG_BLOCK_OFFSET_Y, Y_SCROLL_TRIGGER_HEIGHT, DEFAULT_FILE_NAMES} from './Config.js';
import {SC_NULL} from './JTools.js';
import {EVENT} from './EventBus.js';

import Blocks from '@/js/components/Blocks.vue';
import Calculate from '@/js/components/Calculate.vue';
import Else from '@/js/components/Else.vue';
import Elseif from '@/js/components/Elseif.vue';
import If from './components/If.vue';
import Operator from '@/js/components/Operator.vue';
import UnaryOperator from '@/js/components/UnaryOperator.vue';
import Show from '@/js/components/Show.vue';
import Trash from '@/js/components/Trash.vue';
import _String from '@/js/components/String.vue';
import _Number from '@/js/components/Number.vue';
import Bool from '@/js/components/Bool.vue';
import While from '@/js/components/While.vue';
import SCSelect from '@/js/components/SCSelect.vue';
import SCOption from '@/js/components/SCOption.vue';
import Exec from '@/js/components/Exec.vue';
import Sleep from '@/js/components/Sleep.vue';
import Character from '@/js/components/Character.vue';
import StringVariable from '@/js/components/StringVariable.vue';
import NumberVariable from '@/js/components/NumberVariable.vue';
import BooleanVariable from '@/js/components/BooleanVariable.vue';
import Variable from '@/js/components/Variable.vue';
import GoTo from '@/js/components/GoTo.vue';
import Continue from '@/js/components/Continue.vue';
import Break from '@/js/components/Break.vue';

var esprima = require('esprima');

Vue.component('blocks', Blocks);
Vue.component('calculate', Calculate);
Vue.component('else', Else);
Vue.component('elseif', Elseif);
Vue.component('if', If);
Vue.component('operator', Operator);
Vue.component('unary-operator', UnaryOperator);
Vue.component('show', Show);
Vue.component('trash', Trash);
Vue.component('string', _String);
Vue.component('number', _Number);
Vue.component('while', While);
Vue.component('sc-select', SCSelect);
Vue.component('sc-option', SCOption);
Vue.component('exec', Exec);
Vue.component('sleep', Sleep);
Vue.component('bool', Bool);
Vue.component('character', Character);
Vue.component('string-variable', StringVariable);
Vue.component('number-variable', NumberVariable);
Vue.component('boolean-variable', BooleanVariable);
Vue.component('variable', Variable);
Vue.component('go-to', GoTo);
Vue.component('continue', Continue);
Vue.component('break', Break);

// Vue.use(Vuex);

export function load(fileName, codeTree, globalVariables, storyFile, eventBus){
    var interval = null;
    var globalVariableUpdate = function(event){
        app.$data.globalVariables = event.detail;
    };
    var storyFileUpdate = function({detail}){
        switch(detail.type){
            case EVENT.UPDATE_STORY_FILE.TYPE.ADD: {
                app.$data.storyFile.push(detail.fileName);
                break;
            }
            case EVENT.UPDATE_STORY_FILE.TYPE.EDIT_NAME: {
                fileName = app.$data.fileName = detail.fileName;
                Vue.set(app.$data.storyFile, detail.index, detail.fileName);
                break;
            }
            case EVENT.UPDATE_STORY_FILE.TYPE.DELETE: {
                app.$data.storyFile.splice(detail.index, 1);
                break;
            }
        }
    };
    
    var app = new Vue({
        el: '#app',
        vuetify,
        data: {
            TYPE,
            DEFAULT_FILE_NAMES,
            SC_NULL,
            fileName,
            esprima,
            eventBus,
            globalVariables,
            storyFile,
            mouseDowned: false,
            dragingNode: null,
            mouseOveredNode: null,
            codeTree: codeTree.edit,
            // [
            //     {
            //         exec: "'我是一條指令1'"
            //     },
            //     {
            //         exec: "'我是一條指令2'"
            //     },
            //     {
            //         while: 'test',
            //         then: [
            //             {
            //                 show: "('while' + 'test')"
            //             },
            //             {
            //                 show: "'while test2'"
            //             },
            //             {
            //                 exec: "'我是一條指令3'"
            //             }
            //         ]
            //     },
            //     {
            //         exec: "(1 + (2 / (3 * (45 - 87))))"
            //     },
            //     {
            //         if: "true",
            //         then: [
            //             {
            //                 exec: '(1+1)'
            //             }
            //         ]
            //     },
            //     {
            //         show: "'顯示文字'"
            //     }
            // ],
            tempCodeTree: [],
            contextMenuItems: [
                '複製到站存區',
            ],

            snackbar: false,

        },
        // computed: mapState([
        //     'globalVariable'
        // ]),
        watch: {
            codeTree: {
                handler(val){
                    eventBus.$emit(EVENT.FILE_STATUS.NAME, {
                        type: EVENT.FILE_STATUS.TYPE.MODIFIED,
                        fileName: this.fileName,
                    });
                },
                deep: true
            }
        },
        methods: {
            mouseDown(e, dragingNode){
                if(e.type == 'touchstart'){
                    e = e.touches[0];
                }else{
                    if(e.button == 2) return;
                }
                this.mouseDowned = true;
                if(dragingNode){
                    this.dragingNode = dragingNode;
                    dragingNode.$el.style.zIndex = 1;
                    dragingNode.move(e.pageX + DRAG_BLOCK_OFFSET_X, e.pageY + DRAG_BLOCK_OFFSET_Y);
                    dragingNode.$data.position = 'fixed';
                }
            },
            mouseMove(event){
                if(event.type == 'touchmove') event = event.touches[0];
                if(this.dragingNode && this.mouseDowned){
                    this.dragingNode.move(event.pageX + DRAG_BLOCK_OFFSET_X, event.pageY + DRAG_BLOCK_OFFSET_Y);
                }
            },
            mouseUp(){
                this.mouseDowned = false;
                if(this.dragingNode){
                    this.dragingNode.$data.position = 'static';
                    this.dragingNode.$el.style.zIndex = 0;
                    if(this.mouseOveredNode){
                        let blockArea = (this.mouseOveredNode.$data.type == undefined) //判斷滑鼠是否在程式碼區塊上，因為程式碼區塊的data中並沒有type
                            ? this.mouseOveredNode
                            : this.mouseOveredNode.$parent;
                        if(blockArea.$props.allowType.includes(this.dragingNode.$data.type)){
                            let block;
                            if(this.dragingNode.$props.isDemo){
                                block = this.dragingNode.$data.data();
                            }else if(this.dragingNode.$parent.code instanceof Array){
                                [block] = this.dragingNode.$parent.code.splice(this.dragingNode.$props.index, 1);
                            }else{
                                block = this.dragingNode.$parent.code;
                            }

                            if(blockArea.code instanceof Array){
                                if(this.mouseOveredNode.$data.type){//判斷滑鼠是否在程式碼區塊上，因為程式碼區塊的data中並沒有type
                                    if(
                                        blockArea.code !== this.dragingNode.$parent.code//當要將程式碼從一個區塊移至另一個區塊的某個程式碼下方時
                                        ||
                                        this.dragingNode.$props.index > this.mouseOveredNode.$props.index//因為移動程式碼時，會先將程式碼移出在移入，所以在移出的過程中要移動的程式碼下方的所有程式碼都會發生props.index比實際在array中的index還要多1
                                    ){
                                        blockArea.code.splice(this.mouseOveredNode.$props.index + 1, 0, block);//若不index + 1的話，就會是搬移在目標程式碼的上面
                                    }else{
                                        blockArea.code.splice(this.mouseOveredNode.$props.index, 0, block);//所以當程式碼是在同一個程式碼區塊搬移時，當要將程式碼從原本的位置往下移時就不用將index + 1
                                    }
                                }else{
                                    blockArea.code.push(block);
                                }
                                if(!(this.dragingNode.$parent.code instanceof Array)){
                                    this.dragingNode.$parent.code = SC_NULL;
                                }
                            }else{
                                if(blockArea.code.type != SC_NULL.type && blockArea.code.name != SC_NULL.name){
                                    this.tempCodeTree.push(blockArea.code);
                                }
                                blockArea.code = block;
                                if(!(this.dragingNode.$parent.code instanceof Array)){
                                    this.dragingNode.$parent.code = SC_NULL;
                                }
                            }
                        }
                    }
                }
                this.dragingNode = null;
            },
            // mouseUp(){
            //     this.mouseDowned = false;
            //     if(this.dragingNode){
            //         this.dragingNode.$data.position = 'static';
            //         this.dragingNode.$el.style.zIndex = 0;
            //         if(this.mouseOveredNode){
            //             if(this.mouseOveredNode.$data.type == undefined){//判斷滑鼠是否在程式碼區塊上，因為程式碼區塊的data中並沒有type
            //                 if(this.mouseOveredNode.$props.allowType.includes(this.dragingNode.$data.type)){
            //                     let block;
            //                     if(this.dragingNode.$props.isDemo){
            //                         block = this.dragingNode.$data.data();
            //                     }else if(this.mouseOveredNode.code !== this.dragingNode.$parent.code){//當要將程式碼從一個區塊移至另一個區塊時
            //                         if(this.dragingNode.$parent.code instanceof Array)
            //                             [block] = this.dragingNode.$parent.code.splice(this.dragingNode.$props.index, 1);
            //                         else{
            //                             block = this.dragingNode.$parent.code;
            //                             this.dragingNode.$parent.code = {};
            //                         }
            //                     }
            //                     if(block){
            //                         if(this.mouseOveredNode.code instanceof Array)
            //                             this.mouseOveredNode.code.push(block);
            //                         else
            //                             this.mouseOveredNode.code = block
            //                     }
            //                 }
            //             }else{
            //                 if(this.mouseOveredNode.$parent.$props.allowType.includes(this.dragingNode.$data.type)){
            //                     if(!this.dragingNode.$props.isDemo){
            //                         let block;
            //                         if(this.dragingNode.$parent.code instanceof Array)
            //                             [block] = this.dragingNode.$parent.code.splice(this.dragingNode.$props.index, 1);
            //                         else{
            //                             block = this.dragingNode.$parent.code;
            //                             this.dragingNode.$parent.code = {};
            //                         }
            //                         if(this.mouseOveredNode.$parent.code instanceof Array){
            //                             if(
            //                                 this.mouseOveredNode.$parent.code !== this.dragingNode.$parent.code//當要將程式碼從一個區塊移至另一個區塊的某個程式碼下方時
            //                                 ||
            //                                 this.dragingNode.$props.index > this.mouseOveredNode.$props.index//因為移動程式碼時，會先將程式碼移出在移入，所以在移出的過程中要移動的程式碼下方的所有程式碼都會發生props.index比實際在array中的index還要多1
            //                             ){
            //                                 this.mouseOveredNode.$parent.code.splice(this.mouseOveredNode.$props.index + 1, 0, block);//若不index + 1的話，就會是搬移在目標程式碼的上面
            //                             }else{
            //                                 this.mouseOveredNode.$parent.code.splice(this.mouseOveredNode.$props.index, 0, block);//所以當程式碼是在同一個程式碼區塊搬移時，當要將程式碼從原本的位置往下移時就不用將index + 1
            //                             }
            //                         }else
            //                             this.mouseOveredNode.$parent.code = block
            //                         // let temp = this.code[this.dragingNode.$props.index];
            //                         // this.code[this.dragingNode.$props.index] = this.code[this.mouseOveredNode.$props.index];
            //                         // this.$set(this.code, this.mouseOveredNode.$props.index, temp);
            //                     }else{
            //                         if(this.mouseOveredNode.code instanceof Array)
            //                             this.mouseOveredNode.$parent.code.splice(this.mouseOveredNode.$props.index + 1, 0, this.dragingNode.$data.data());
            //                     }
            //                 }
            //             }
            //         }
            //     }
            //     this.dragingNode = null;
            // },
            mouseOver(e, c){
                this.mouseOveredNode = c;
                if(c != null && c.$data) c.$data.entering = true;
            },
            mouseOut(e, c){
                this.mouseOveredNode = null
                if(c != null && c.$data) c.$data.entering = false;
            },
            trashMouseUp(){
                this.mouseDowned = false;
                if(this.dragingNode){
                    this.dragingNode.$data.position = 'static';
                    this.dragingNode.$el.style.zIndex = 0;
                    if(!this.dragingNode.$props.isDemo){
                        if(this.dragingNode.$parent.code instanceof Array)
                            this.dragingNode.$parent.code.splice(this.dragingNode.$props.index, 1);
                        else
                            this.dragingNode.$parent.code = SC_NULL;
                    }
                }
                this.dragingNode = null;
            },
            contextMenuItemClick(e, c, item, index){
                switch(index){
                    case 0:{
                        let data = (c.$parent.code instanceof Array)
                            ? c.$parent.code[c.$props.index]
                            : c.$parent.code;
                        this.tempCodeTree.push(JSON.parse(JSON.stringify(data)));
                    }
                }
            },

            scrollTriggerY(event, c){
                var top = c.$el.offsetTop;
                var bottom = c.$el.offsetTop + c.$el.offsetHeight;
                var pageY = (event.type == 'touchmove') ? event.touches[0].pageY : event.pageY;
                if(this.dragingNode && this.mouseDowned){
                    if(pageY < top + Y_SCROLL_TRIGGER_HEIGHT){
                        if(!interval){
                            interval = setInterval(function(){
                                c.$el.scrollTop -= 10;
                                // console.log('向上捲動');
                            }, 30);
                        }
                        return;
                    }else if(pageY > bottom - Y_SCROLL_TRIGGER_HEIGHT){
                        if(!interval){
                            interval = setInterval(function(){
                                c.$el.scrollTop += 10;
                                // console.log('向下捲動');
                            }, 30);
                        }
                        return;
                    }
                }
                this.scrollTriggerYEnd(event);
            },
            scrollTriggerYEnd(event){
                if(interval){
                    clearInterval(interval);
                    interval = null;
                }
            },

            save(){
                codeTree.complete = JSON.stringify(codeTree.edit);
                if(fileName == DEFAULT_FILE_NAMES.GLOBAL_VARIABLE){
                    eventBus.$emit(EVENT.UPDATE_VARIABLE.NAME, JSON.parse(codeTree.complete));
                }
                eventBus.$emit(EVENT.FILE_STATUS.NAME, {
                    type: EVENT.FILE_STATUS.TYPE.SAVED,
                    fileName: this.fileName,
                });
                this.snackbar = true;
                setTimeout(()=>{
                    this.snackbar = false;
                }, 3000);
            },

            debug(){
                console.log(this.codeTree);
                console.log(this.tempCodeTree);
            }
        },
    });


    eventBus.$on(EVENT.UPDATE_VARIABLE.NAME, globalVariableUpdate);
    eventBus.$on(EVENT.UPDATE_STORY_FILE.NAME, storyFileUpdate);
    // window.onbeforeunload = function(){
    //     eventBus.$off('updateVariable', globalVariableUpdate);
    // };
}