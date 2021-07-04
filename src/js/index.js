import Vue from 'vue';
// import Vuex from 'vuex';
import vuetify from '@/plugins/vuetify';
import { saveAs } from 'file-saver';

import {DEFAULT_FILE_NAMES} from './Config.js';
import {default as eventBus, EVENT} from './EventBus.js';

const JSZip = require('jszip');
const JSZipUtils = require('jszip-utils');
const PACKAGE = require('../../package.json');

export var story = [
    
];

// Vue.use(Vuex);

// const store = new Vuex.Store({
//   state: {
//     globalVariable: []
//   },
//   mutations: {
//     updateVariable(state, newGlobalVariable) {
//         state.globalVariable = newGlobalVariable;
//     }
//   },
// });

window.onload = function(){

    var fileStatusChanged = function({detail}){
        let [page] = app.$data.openedPages.filter((item) => item.name == detail.fileName);
        let [file] = app.files.filter((item) => item.name == detail.fileName);
        switch(detail.type){
            case EVENT.FILE_STATUS.TYPE.MODIFIED: {
                file.modified = page.modified = true;
                break;
            }
            case EVENT.FILE_STATUS.TYPE.SAVED: {
                file.modified = page.modified = false;
                break;
            }
        }
    }

    var app = new Vue({
        el: '#app',
        vuetify,
        data: {
            VERSION: PACKAGE.version,
            DEFAULT_FILE_NAMES,
            about: false,
            drawer: null,
            storyFile: [
            ],
            defaultFile: [
                {
                    name: DEFAULT_FILE_NAMES.ABOUT,
                    alias: '關於',
                    modified: false,
                },
                {
                    name: DEFAULT_FILE_NAMES.CHARACTER,
                    alias: '人物介紹',
                    modified: false,
                },
                {
                    name: DEFAULT_FILE_NAMES.GLOBAL_VARIABLE,
                    alias: '全域變數',
                    modified: false,
                }
            ],
            openedPages: [

            ],
            story: {
                name: '',
                startFrom: '',
            },
            storyDialog: false,
            pleaseWaitDialog: false,
            openedPageIndex: null,
            storyFileDialog: false,
            fileMenuX: 0,
            fileMenuY: 0,
            showFileMenu: false,
            showFileMenuRightClickItemIndex: -1,
            showFileMenuItems: [
                '重新命名',
                '刪除',
            ],
            storyFileDialogData: {
                TYPE: {
                    ADD: {title: '新增故事檔', message: ''},
                    EDIT_NAME: {title: '重新命名故事檔', message: ''},
                    DELETE: {title: '刪除故事檔', message: (name) => `確定要刪除'${name}'嗎?`},
                },
                title: '',
                message: '',
                name: '',
                errorMessage: '',
                fileNameIsOk: false,
            }
        },
        computed: {
            storyFileNameForDialog: {
                get(){
                    if(!this.storyFileDialogData.name.match(/^(?!\s)[^<>:"\\\/\|?*]+$/)){
                        this.storyFileDialogData.errorMessage = '名稱不被允許';
                    }else if(
                        Object.keys(DEFAULT_FILE_NAMES).find(key => DEFAULT_FILE_NAMES[key] == this.storyFileDialogData.name)
                        ||
                        this.storyFile.find((item) => item.name == this.storyFileDialogData.name)
                    ){
                        this.storyFileDialogData.errorMessage = '名稱重複';
                    }else{
                        this.storyFileDialogData.errorMessage = '';
                    }
                    return this.storyFileDialogData.name;
                },
                set(val){
                    this.storyFileDialogData.name = val;
                }
            },
            files: {
                get(){
                    return [...this.defaultFile, ...this.storyFile];
                }
            },
            storyFileName: {
                get(){
                    return this.storyFile.map(file => file.name);
                }
            }
        },
        watch: {
            story: {
                handler(val){
                    story.filter(item => item.name == DEFAULT_FILE_NAMES.STORY)[0].complete = JSON.stringify(val);
                },
                deep: true,
            }
        },
        methods: {
            drawerClose(){
                this.drawer = !this.drawer;
            },
            storyFileDialogOpen(type){
                this.storyFileDialogData.title = type.title;
                this.storyFileDialogData.message = type.message;
                switch(type){
                    case this.storyFileDialogData.TYPE.ADD:{
                        this.storyFileDialogData.name = '';
                        break;
                    }
                    case this.storyFileDialogData.TYPE.EDIT_NAME:
                    case this.storyFileDialogData.TYPE.DELETE:{
                        this.storyFileDialogData.name = this.storyFile[this.showFileMenuRightClickItemIndex].name;
                        break;
                    }
                }
                this.storyFileDialog = true;
            },
            storyFileDialogOption(){
                this.storyFileDialog = false;
                switch(this.storyFileDialogData.title){
                    case this.storyFileDialogData.TYPE.ADD.title:{
                        story.push({
                            name: this.storyFileDialogData.name,
                            complete: JSON.stringify([]),
                            edit: [],
                        });
                        this.storyFile.push({
                            name: this.storyFileDialogData.name,
                            modified: false,
                        });
                        eventBus.$emit(EVENT.UPDATE_STORY_FILE.NAME, {
                            type: EVENT.UPDATE_STORY_FILE.TYPE.ADD,
                            fileName: this.storyFileDialogData.name,
                        });
                        break;
                    }
                    case this.storyFileDialogData.TYPE.EDIT_NAME.title:{
                        let oldName = this.storyFile[this.showFileMenuRightClickItemIndex].name;
                        let [page] = this.openedPages.filter((item) => item.name == oldName);
                        if(page){
                            page.name = page.alias = this.storyFileDialogData.name
                        }
                        story.filter(i => i.name == oldName)[0].name = this.storyFileDialogData.name;
                        this.storyFile[this.showFileMenuRightClickItemIndex].name =  this.storyFileDialogData.name;
                        if(this.story.startFrom == oldName){
                            this.story.startFrom = this.storyFileDialogData.name;
                        }
                        eventBus.$emit(EVENT.UPDATE_STORY_FILE.NAME, {
                            type: EVENT.UPDATE_STORY_FILE.TYPE.EDIT_NAME,
                            fileName: this.storyFileDialogData.name,
                            oldFileName: oldName,
                            index: this.showFileMenuRightClickItemIndex,
                        });
                        break;
                    }
                    case this.storyFileDialogData.TYPE.DELETE.title:{
                        let name = this.storyFile[this.showFileMenuRightClickItemIndex].name;
                        let index = this.openedPages.findIndex((item) => item.name == name);
                        if(index != -1){
                            this.openedPages.splice(index, 1);
                        }
                        story.splice(story.findIndex(i => i.name == name), 1);
                        this.storyFile.splice(this.showFileMenuRightClickItemIndex, 1);
                        eventBus.$emit(EVENT.UPDATE_STORY_FILE.NAME, {
                            type: EVENT.UPDATE_STORY_FILE.TYPE.DELETE,
                            fileName: this.storyFileDialogData.name,
                            index: this.showFileMenuRightClickItemIndex,
                        });
                        break;
                    }
                }
            },
            filesListClick(name, alias, modified){
                var index = this.openedPages.findIndex((item) => item.name == name);
                if(index == -1){
                    index = this.openedPages.push({
                        name,
                        alias,
                        modified: modified,
                    }) - 1;
                }
                this.openedPageIndex = index;
                this.drawerClose();
            },
            openedPageClose(name){
                var index = this.openedPages.findIndex((item) => item.name == name);
                if(this.openedPageIndex > index){
                    this.openedPageIndex--;
                }
                this.openedPages.splice(index, 1);
            },
            iframeOnLoad({target: iframe}, name){
                var storyData = story.filter(item => item.name == name)[0];
                if(!storyData && [DEFAULT_FILE_NAMES.ABOUT].includes(name)){//這是兼容舊版本的故事檔，DEFAULT_FILE_NAMES.ABOUT是在ver: 1.1.0704版本時加入
                    storyData = {
                        name: name,
                        complete: JSON.stringify([]),
                        edit: [],
                    };
                    story.push(storyData);
                }
                iframe.contentWindow.SCEditor.load(name, storyData, JSON.parse(story.filter(item => item.name == DEFAULT_FILE_NAMES.GLOBAL_VARIABLE)[0].complete), [...this.storyFile], eventBus);
            },
            openFileMenu(event, index){
                this.showFileMenuRightClickItemIndex = index;
                event.preventDefault();
                this.showFileMenu = false;
                this.fileMenuX = event.clientX;
                this.fileMenuY = event.clientY;
                this.$nextTick(() => {
                    this.showFileMenu = true;
                });
            },
            showFileMenuItemClick(index){
                switch(index){
                    case 0:{
                        this.storyFileDialogOpen(this.storyFileDialogData.TYPE.EDIT_NAME);
                        break;
                    }
                    case 1:{
                        this.storyFileDialogOpen(this.storyFileDialogData.TYPE.DELETE);
                        break;
                    }
                }
                // console.log(this.showFileMenuRightClickItemIndex, index);
            },
            playStory(){
                var tryPlayData = {};
                for(let file of story){
                    tryPlayData[file.name] = JSON.parse(file.complete);
                }
                window.open('./StoryConsole/index.html').tryPlayData = tryPlayData;
            },
            openStory(){
                uploadStory.click();
            },
            downloadStory(){
                this.pleaseWaitDialog = true;
                this.$nextTick(() => {
                    var zip = new JSZip();
                    for(let file of story){
                        console.debug(file)
                        zip.file(`${file.name}.json`, file.complete);
                    }
                    zip.generateAsync({type:"blob"}).then((blob) => {
                        this.pleaseWaitDialog = false;
                        saveAs(blob, "story.zip");
                    }, (err) => {
                        
                    });
                });
            }
        },
        mounted(){
            story.push({
                name: DEFAULT_FILE_NAMES.STORY,
                complete: JSON.stringify(this.story),
            });
            for(let item of this.defaultFile){
                story.push({
                    name: item.name,
                    complete: JSON.stringify([]),
                    edit: [],
                });
            }
            // for(let name of this.storyFile){
            //     story.push({
            //         name,
            //         complete: JSON.stringify([]),
            //         edit: []
            //     });
            // }
            uploadStory.onclick = function(){
                this.value = null;
            }
            uploadStory.onchange = function({target: {files: [file]}}){
                this.pleaseWaitDialog = true;
                this.$nextTick(async () => {
                    let zipFile = null;
                    if(typeof(file) == 'string'){
                        zipFile = await new JSZip.external.Promise(function (resolve, reject) {
                            JSZipUtils.getBinaryContent(file, function(err, data) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(data);
                                }
                            });
                        }).then(function (data) {
                            return JSZip.loadAsync(data);
                        });
                    }else{
                        zipFile = await JSZip.loadAsync(file);
                    }
                    story.splice(0, story.length);
                    this.storyFile.splice(0, this.storyFile.length);
                    this.openedPages.splice(0, this.openedPages.length);
                    let defaultFileNames = [];
                    for(let key in DEFAULT_FILE_NAMES){
                        defaultFileNames.push(DEFAULT_FILE_NAMES[key]);
                    }
                    for(let file of this.defaultFile){
                        file.modified = false;
                    }
                    for(let file in zipFile.files){
                        console.debug(file);
                        let name = file.match(/(.+)?\.json$/)[1];
                        let data = await zipFile.files[file].async('string');
                        story.push({
                            name: name,
                            complete: data,
                            edit: JSON.parse(data),
                        });
                        if(!(defaultFileNames.includes(name))){
                            this.storyFile.push({
                                name,
                                modified: false,
                            });
                        }else if(name == DEFAULT_FILE_NAMES.STORY){
                            this.story = JSON.parse(data);
                        }
                    } 
                    this.pleaseWaitDialog = false;
                    this.drawer = true;
                });
            }.bind(this);
        }
    });

    eventBus.$on(EVENT.FILE_STATUS.NAME, fileStatusChanged);
}