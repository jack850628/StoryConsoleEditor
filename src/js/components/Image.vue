<template>
    <div class="block" draggable="true" @drag.stop="drag" @drop.stop="drop" @dragstart.stop="dragstart" @dragend.stop="dragend" @dragenter.stop="dragenter" @dragleave.stop="dragleave" @dragover.prevent @contextmenu.stop="contextMenu" :style="{position, top: mTop, left: mLeft, width, minHeight, backgroundColor: !entering ? backgroundColor : 'chocolate'}">
        <div>
            <div style="display: flex; flex-direction: column;">
                <div style="display: flex; margin: 10px">
                    <span>名稱: </span>
                    <input type="text" style="background-color: white; width: 100%; margin-left: 10px; margin-right: 10px;" v-model="name" @drop.stop="drop" @dragstart.stop="dragstart" @dragend.stop="dragend" @dragenter.stop="dragenter" @dragleave.stop="dragleave"/>
                </div>
                <div style="display: flex; justify-content: center;">
                    <img :src="imageSrc" :style="{height: args.useSize? args.height: 'auto', width:'auto', 'max-width': '100%', position: 'relative'}">
                </div>
                <v-btn v-show="!isDemo" @click="selectImage">選擇圖片</v-btn>
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
            name: {
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
            name(val){
                this.$emit('update:name', val);
            },
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
                        image: '',
                        name: ''
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