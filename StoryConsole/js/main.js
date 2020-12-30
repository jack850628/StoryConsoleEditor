const VERSION = "1.0.0922";
const DB_VERSION = 1;
// const SAVE_DIR = "/save";
// const STORY_DIR = "/story";
const defaultStory = './story/放學回家啦！.zip';
// const DBName = 'StoryConsole';

(function (){
    var floorsLine = [];

    var GameStatus = {
        RUN: 0, STOP: 1, BREAK: 2, CONTINUE: 3, GOTO: 4
    }
    var gameStatus = GameStatus.RUN;

    var IfStatus = {
        CONDITION_NOT_MET: 0, CONDITION_MET: 1
    }

    var enterDown = false;

    var storyObj = null
    var SC = null;

    var vApp = new Vue({
        el: '#app',
        data: {
            screenTextLineMax: 150,
            screenTexts: [],
            input: '',
            buttons: [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                0,
                '\u232B',
                '\u23CE'
            ]
        },
        // computed: {
        //     inputText:{
        //         get(){
        //             var text = this.input;
        //             this.input = '';
        //             console.log(text, '????')
        //             this.appebdTextToScreen(text);
        //             return text;
        //         }
        //     }
        // },
        methods: {
            keyboardInput({key}){
                if(key.match(/\d/)){
                    this.input += key;
                }else if(key == 'Enter'){
                    enterDown = true;
                }else if(key == 'Backspace'){
                    this.input = this.input.substr(0, this.input.length - 1);
                }
            },
            buttonClick({target: {innerText: text}}){
                if(text == '\u232B'){
                    this.input = this.input.substr(0, this.input.length - 1);
                }else if(text == '\u23CE'){
                    enterDown = true;
                }else{
                    this.input += text;
                }
            },
            appebdTextToScreen(text){
                text = text.toString();
                this.screenTexts.push(...text.split(/\n/g));
                if(this.screenTexts.length > this.screenTextLineMax){
                    this.screenTexts.splice(0, this.screenTexts.length - this.screenTextLineMax);
                }
            },
            appebdTextToScreenlastLine(text){
                text = text.toString();
                var lines = text.split(/\n/g)
                this.screenTexts[this.screenTexts.length - 1] += lines[0];
                this.screenTexts.push(...lines.slice(1));
                if(this.screenTexts.length > this.screenTextLineMax){
                    this.screenTexts.splice(0, this.screenTexts.length - this.screenTextLineMax);
                }
            },
            inputText(){
                var text = this.input;
                this.input = '';
                this.appebdTextToScreen(text);
                return text;
            },
            clearScreen(){
                this.screenTexts.splice(0);
            }
        },
        updated(){
            consoleScreen.scrollTop = consoleScreen.scrollHeight;
        }
    });

    var db = null;
    async function openDB(storeName){
        var p = new Promise((resolve, reject) => {
            var openRequest = indexedDB.open(storeName, DB_VERSION);
            openRequest.onsuccess = function(event) {
                var db = event.target.result;
                console.log('open success');
                resolve(db);
            };

            openRequest.onerror = function(event) {
                console.error(event.target.errorCode);
            };
            openRequest.onupgradeneeded = function(event){
                var db = event.target.result;
                console.log('open upgradeneeded');
                if(!db.objectStoreNames.contains(storeName))
                    db.createObjectStore(storeName, { keyPath: "id" });
            }
        });
        return p;
    }



    async function main(){
        var storyTitle = storyObj.story;
        var option = [
            {text: "開始遊戲"},
            {text: "繼續遊戲"},
            {text: "人物介紹"},
            {text: "載入其他故事"},
            {text: "關於"},
            {text: "結束"},
        ];
        exit:while (true)
        {
            switch (await select("     " + storyTitle.name + "               ", option))
            {
                case 1:
                    await load(storyTitle.startFrom, storyObj.globalVariable);
                    break;
                case 2:
                    if(window.tryPlayData){
                        vApp.appebdTextToScreen('測試模式不提供存檔');
                        await readLine()
                        break;
                    }
                    let saveFile = await loadSave();
                    if (saveFile)
                    {
                        floorsLine = saveFile.floorsLine;
                        await load(saveFile.stoeyName, saveFile.globalVariable);
                    }
                    break;
                case 3:
                    await character();
                    break;
                case 4:
                    vApp.clearScreen();
                    vApp.appebdTextToScreen('載入中...');
                    storyObj = await loadOtherStory();
                    openDB(storyObj.story.name).then((result) => {
                        db = result; 
                    });
                    setTimeout(() => {
                        vApp.clearScreen();
                        main()
                    });
                    break exit;
                    break;
                case 5:
                    await about();
                    break;
                default:
                    break exit;
            }
        }
        vApp.clearScreen();
		vApp.appebdTextToScreen('已經停止運行，請重新整理或關閉網頁');
    }

    async function load(nextStoryName, globalVariable){
        SC = {};
        for(let v of globalVariable){
            SC[v.name] = v.value;
        }

        gameStatus = GameStatus.RUN;
        while(gameStatus != GameStatus.STOP){
            let commands = storyObj[nextStoryName];
            nextStoryName = await runStory(commands, nextStoryName, 0);

            if (!nextStoryName)
            {
                gameStatus = GameStatus.STOP;
            }
            else if(gameStatus == GameStatus.GOTO)
            {
                gameStatus = GameStatus.RUN;
            }
        }
    }

    async function runStory(commands, storyName, floor){
        var ifStatus = IfStatus.CONDITION_NOT_MET;

        try
        {
            if(floor >= floorsLine.length) floorsLine.push({ line: 0 });
            for (; floorsLine[floor].line < commands.length; floorsLine[floor].line++)
            {
                var command = commands[floorsLine[floor].line];
                if (command.show != undefined)
                {
                    await show(command.show, storyName);
                    if (gameStatus == GameStatus.STOP) return "";
                }
                else if (command.sleep != undefined)
                {
                    await wait(parseInt(command.sleep) * 1000);
                }
                else if (command.select != undefined)
                {
                    if(floor == floorsLine.length - 1)
                        floorsLine[floor].selecteOptionItem = await select(command.select.title, command.select.option, true) - 1;
                    let result = await runStory(
                        command.select.option[floorsLine[floor].selecteOptionItem].then, 
                        storyName, 
                        floor + 1
                    );
                    floorsLine[floor].selecteOptionItem = null;
                    if (
                        gameStatus == GameStatus.STOP ||
                        gameStatus == GameStatus.BREAK ||
                        gameStatus == GameStatus.CONTINUE ||
                        gameStatus == GameStatus.GOTO
                    )
                    {
                        return result;
                    }
                }
                else if (command.exec != undefined)
                {
                    eval(command.exec);
                }
                else if (command.goto != undefined)
                {
                    gameStatus = GameStatus.GOTO;
                    return command.goto;
                }
                else if (command.continue != undefined)
                {
                    gameStatus = GameStatus.CONTINUE;
                    return null;
                }
                else if (command.break != undefined)
                {
                    gameStatus = GameStatus.BREAK;
                    return null;
                }
                else if (command.if != undefined)
                {
                    if (floor < floorsLine.length - 1 || eval(command.if))
                    {
                        ifStatus = IfStatus.CONDITION_MET;
                        let result = await runStory(command.then, storyName, floor + 1);
                        if (
                            gameStatus == GameStatus.STOP ||
                            gameStatus == GameStatus.BREAK ||
                            gameStatus == GameStatus.CONTINUE ||
                            gameStatus == GameStatus.GOTO
                        )
                        {
                            return result;
                        }
                    }
                    else
                    {
                        ifStatus = IfStatus.CONDITION_NOT_MET;
                    }
                }
                else if (command.elseif != undefined)
                {
                    if (floor < floorsLine.length - 1 || ifStatus == IfStatus.CONDITION_NOT_MET && eval(command.elseif))
                    {
                        ifStatus = IfStatus.CONDITION_MET;
                        var result = await runStory(command.then, storyName, floor + 1);
                        if (
                            gameStatus == GameStatus.STOP ||
                            gameStatus == GameStatus.BREAK ||
                            gameStatus == GameStatus.CONTINUE ||
                            gameStatus == GameStatus.GOTO
                        )
                        {
                            return result;
                        }
                    }
                }
                else if (command.else != undefined)
                {
                    if (ifStatus == IfStatus.CONDITION_NOT_MET)
                    {
                        var result = await runStory(command.else, storyName, floor + 1);
                        if (
                            gameStatus == GameStatus.STOP || 
                            gameStatus == GameStatus.BREAK || 
                            gameStatus == GameStatus.CONTINUE || 
                            gameStatus == GameStatus.GOTO
                        )
                        {
                            return result;
                        }
                    }
                }
                else if (command.while != undefined)
                {
                    while(true)
                    {
                        if (floor < floorsLine.length - 1 || eval(command.while))
                        {
                            var result = await runStory(command.then, storyName, floor + 1);
                            if (gameStatus == GameStatus.BREAK)
                            {
                                gameStatus = GameStatus.RUN;
                                break;
                            }
                            else if (gameStatus == GameStatus.STOP || gameStatus == GameStatus.GOTO)
                            {
                                return result;
                            }
                            else if (gameStatus == GameStatus.CONTINUE)
                            {
                                gameStatus = GameStatus.RUN;
                            }
                        }
                        else
                        {
                            break;
                        }
                    }
                }
            }
            return null;
        }
        finally
        {
            floorsLine.splice(floor, 1);
        }
    }

    async function show(text, storyName)
    {
        var f = async function(){
            var f2 = async (resolve, reject) => {
                let selected = -2
                if (enterDown){
                    enterDown = false;
                    let text = vApp.inputText();
                    selected = isNaN(text) || text == '' ? -1 : parseInt(text);
                }
                if (selected == 0){
                    vApp.clearScreen();
                    setTimeout(()=>f2(resolve, reject));
                }else if (selected == 1){
                    let option = [
                        {text: "返回"},
                        {text: "存檔"},
                        {text: "回主選單"},
                    ];
                    while (true)
                    {
                        selected = await select("    選項      ", option);
                        if(selected == 1){
                            resolve();
                            break;
                        }else if (selected == 2){ 
                            if(window.tryPlayData){
                                vApp.appebdTextToScreen('測試模式不提供存檔');
                                await readLine()
                            }else{
                                await save(storyName);
                                resolve();
                                break;
                            }
                        }else if (selected == 3){
                            gameStatus = GameStatus.STOP;
                            resolve();
                            break;
                        }
                    }
                }else if(selected == -1) resolve(true);
                else setTimeout(()=>f2(resolve, reject));
            }
            return new Promise(f2);
        }
        while(gameStatus == GameStatus.RUN){
            vApp.appebdTextToScreen(eval(text));
            vApp.appebdTextToScreen("                         按enter繼續、按0清空畫面、按1選項:");
            if(await f()) break;
        }
    }

    async function wait(time)
    {   
        vApp.appebdTextToScreen('');
        var f = function(resolve, reject){
            if(time > 0){
                setTimeout(() => f(resolve, reject), 1000);
                time -= 1000;
                vApp.appebdTextToScreenlastLine('.');
            }else{
                vApp.appebdTextToScreen('');
                resolve();
            }
        }
        return new Promise(f);
    }

    async function save(storyName){
        if(!db){
            vApp.appebdTextToScreen('您使用的瀏覽器不支援存檔');
            await readLine();
            return;
        }

        var option = [
            {text: "記錄檔1"},
            {text: "記錄檔2"},
            {text: "記錄檔3"},
            {text: "記錄檔4"},
            {text: "記錄檔5"},
            {text: "返回"},
        ];
        var fileItem = await select("    選擇記錄檔       ", option);
        if (fileItem == 6) return;

        let globalVariable = [];
        for(let k in SC){
            let type;
            switch(typeof(SC[k])){
                case 'object':
                    type = (SC[k] instanceof Array) ? 'array' : 'object';
                    break;
                default:
                    type = typeof(SC[k]);
                    break;
            }
            globalVariable.push({
                name: k,
                type: type,
                value: SC[k]
            });
        }

        var objectStore  = db.transaction([storyObj.story.name], 'readwrite').objectStore(storyObj.story.name);

        objectStore.delete(fileItem);
        objectStore.add({
            id: fileItem,
            stoeyName: storyName,
            floorsLine: floorsLine,
            globalVariable: globalVariable
        });

        option = [
            {text: "繼續遊戲"},
            {text: "離開遊戲"},
        ];
        switch (await select("請問您現在要?     ", option))
        {
            case 1:
                return;
            default:
                gameStatus = GameStatus.STOP;
                return;
        }
    }

    async function loadSave(){
        if(!db){
            vApp.appebdTextToScreen('您使用的瀏覽器不支援存檔');
            await readLine();
            return;
        }

        var f = async function(resolve, reject){
            var option = [
                {text: "記錄檔1"},
                {text: "記錄檔2"},
                {text: "記錄檔3"},
                {text: "記錄檔4"},
                {text: "記錄檔5"},
                {text: "返回"},
            ];
            var fileItem = await select("    選擇記錄檔       ", option);
            if (fileItem == 6){
                resolve(null);
                return;
            }

            var objectStore  = db.transaction([storyObj.story.name]).objectStore(storyObj.story.name);

            var request = objectStore.get(fileItem);
            request.onerror = function(event) {
                vApp.appebdTextToScreen('沒有紀錄！');
                setTimeout(()=>f(resolve, reject));
            };
            request.onsuccess = async function(event) {
                if(request.result)
                    resolve(request.result);
                else{
                    vApp.appebdTextToScreen('沒有紀錄！');
                    await readLine()
                    setTimeout(()=>f(resolve, reject));
                }
            };
        }
        return new Promise(f);
    }

    async function select(title, option, useJsOption = false){
        vApp.appebdTextToScreen(useJsOption ? eval(title) : title);
        vApp.appebdTextToScreen('-'.repeat(title.length));
        for (let i = 0 ; i < option.length ; i++){
            vApp.appebdTextToScreen(`${i + 1}. ${useJsOption ? eval(option[i].text) : option[i].text}`);
        }
        vApp.appebdTextToScreen('-'.repeat(title.length));

        var f = function(resolve, reject){
            selection  = -1;

            // Console.Write(">");
            if(enterDown){
                enterDown = false;
                let text = vApp.inputText();
                selection = isNaN(text) || text == '' ? -1 : parseInt(text);
            }
            if(selection < 1 || selection > option.length)
                setTimeout(()=>f(resolve, reject));
            else resolve(selection);
        }
        return new Promise(f);
    }

    async function readLine(){
        var f = function(resolve, reject){
            if(enterDown){
                enterDown = false;
                resolve(vApp.inputText())
            }else
                setTimeout(()=>f(resolve, reject));
        }
        return new Promise(f);
    } 

    async function character()
    {
        var option = [];
        for (let  i of storyObj.character)
        {
            option.push({ text: i.name });
        }
        option.push({ text: "反回" });
        while(true){
            let selected = await select("    人物介紹      ", option);
            if (1 <= selected && selected < option.length)
            {
                vApp.appebdTextToScreen("--------------------------------------");
                vApp.appebdTextToScreen("             " + storyObj.character[selected - 1].name);
                vApp.appebdTextToScreen(storyObj.character[selected - 1].detailed);
                vApp.appebdTextToScreen("--------------------------------------");
                await readLine();
            }
            else if (selected == option.length)
            {
                return;
            }
        }
    }

    async function about()
    {
        vApp.appebdTextToScreen("                    關於");
        vApp.appebdTextToScreen("-------------------------------------------");
        vApp.appebdTextToScreen("         StoryConsole Web Version");
        vApp.appebdTextToScreen("這是一套作者作好玩的Console文字冒險遊戲框架");
        vApp.appebdTextToScreen("作者：jack850628");
        vApp.appebdTextToScreen("版本：" + VERSION);
        vApp.appebdTextToScreen("-------------------------------------------");
        await readLine();
    }

    async function loadOtherStory(){
        var f = function(resolve, reject){
            uploadSdtory.onchange = async function({target: {files: [file]}}){
                resolve(await loadStoryFileFromZip(file));
            }
            uploadSdtory.click();
            vApp.appebdTextToScreen('若無法繼續，請重新整理網頁');
        }
        return new Promise(f);
    }
    uploadSdtory.onclick = function(){
        this.value = null;
    }

    async function loadStoryFileFromZip(fileOrPath){
        var storyData = null;
        if(!window.tryPlayData){
            let zipFile = null;
            if(typeof(fileOrPath) == 'string'){
                zipFile = await new JSZip.external.Promise(function (resolve, reject) {
                    JSZipUtils.getBinaryContent(fileOrPath, function(err, data) {
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
                zipFile = await JSZip.loadAsync(fileOrPath);
            }
            storyData = {};
            for(let k in zipFile.files){
                console.debug(k);
                storyData[k.match(/(.+)?\.json$/)[1]] = JSON.parse(await zipFile.files[k].async('string'));
            }
        }else{
            storyData = window.tryPlayData;
        }
        return storyData;
    }

    vApp.appebdTextToScreen('載入中...');
    let story = new URLSearchParams(location.search).get('story') || defaultStory;
    loadStoryFileFromZip(story).then(async (storyData) => {
        storyObj = storyData;
        // console.log(storyObj);
        if(!window.tryPlayData){
            openDB(storyData.story.name).then((result) => {
                db = result; 
            });
        }

        vApp.clearScreen();
        main();
    }).catch((e) => {
        console.error(e);
        vApp.clearScreen();
        vApp.appebdTextToScreen('發生錯誤！遊戲已終止，請重新整理網頁');
    });
})()

