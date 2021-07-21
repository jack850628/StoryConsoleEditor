<template>
    <div class="block" draggable="true" @drag.stop="drag" @drop.stop="drop" @dragstart.stop="dragstart" @dragend.stop="dragend" @dragenter.stop="dragenter" @dragleave.stop="dragleave" @dragover.prevent @contextmenu.stop="contextMenu" :style="{position, top: mTop, left: mLeft, width, minHeight, backgroundColor: !entering ? backgroundColor : 'chocolate'}">
        <div>
            <div style="display: flex; flex-direction: column;">
                <span>顯示圖片:</span>
                <div style="display: flex; justify-content: center;">
                    <img :src="imageSrc" :style="{height: args.useSize? args.height: 'auto', width: args.useSize? args.width: 'auto', 'max-width': '100%', position: 'relative'}">
                </div>
                <v-btn v-show="!isDemo" @click="selectImage">選擇圖片</v-btn>
            </div>
            <div>
                <input type="checkbox" :id="`use-size-${_uid}`" v-model="args.useSize">
                <label :for="`use-size-${_uid}`">自訂大小</label>
            </div>
            <div>
                <span>寬度:</span>
                <input type="number" v-model="args.width" style="background-color: white; rgin-left: 10px; margin-right: 10px;" :disabled="!args.useSize">
                <span>高度:</span>
                <input type="number" v-model="args.height" style="background-color: white; argin-left: 10px; margin-right: 10px;" :disabled="!args.useSize">
            </div>
            <div>
                <input type="checkbox" :id="`not-pause-${_uid}`" v-model="args.notPause">
                <label :for="`not-pause-${_uid}`">不等待輸入</label>
            </div>
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
            src: {
                type: String,
                default: '',
            },
            args: {
                type: Object,
                default: ()=> ({}),
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
            args: {
                handler(val){
                    this.$emit('update:args', val);
                },
                deep: true
            }
        },
        computed:{
            imageSrc: {
                get(){
                    return this.src;
                },
                set(val){
                    this.$emit('update:src', val);
                }
            }
        },
        data(){
            return ({
                type: TYPE.CODE_BLOCK,
                mTop: this.top,
                mLeft: this.left,
                width: 'auto',
                minHeight: 40,
                position: "static",
                entering: false,
                showMenu: false,
                menuX: 0,
                menuY: 0,
                fileSecector: null,
                imageView: null,
                data(){
                    return ({
                        showImage: '',
                        args:{
                            notPause: false,
                            useSize: false,
                            width: 30,
                            height: 30
                        }
                    });
                }
            })
        },
        methods: {
            selectImage(){
                this.fileSecector.click();
            },
            selectedImage(file){
                file = file.target.files[0];
                if(file){
                    let reader = new FileReader();
                    reader.onloadend = () => {
                        this.imageSrc = reader.result;
                    };
                    reader.readAsDataURL(file);
                }
            },

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
        mounted(){
            this.fileSecector = document.createElement('input');
            this.fileSecector.type = 'file';
            this.fileSecector.accept = 'image/*';
            this.fileSecector.onchange = this.selectedImage;
        }
    };
</script>