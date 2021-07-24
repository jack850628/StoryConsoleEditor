const VERSION = "1.2.0723";
const DB_TABLE_GAME_SAVE_DATA = 'GameSaveData';
const DB_VERSION = 2;
// const SAVE_DIR = "/save";
// const STORY_DIR = "/story";
const defaultStory = './story/放學回家啦！.zip';
const getStoryZipFileContentAPI = 'https://story-console-get-zip.herokuapp.com/?url=';
// const DBName = 'StoryConsole';
const SC_NULL = null;

(function (){
    var floorsLine = [];

    const GameStatus = {
        RUN: 0, STOP: 1, BREAK: 2, CONTINUE: 3, GOTO: 4, BLACK_CURRENT_STORY_FILE: 5
    }
    var gameStatus = GameStatus.RUN;

    const IfStatus = {
        CONDITION_NOT_MET: 0, CONDITION_MET: 1
    }

    const ShowType = {
        TEXT: 0, IMAGE: 1
    }

    var enterDown = false;

    var storyObj = null
    var SC = null;

    var showCursor = true;
    setInterval(function(){
        //因為vue裡updated()中每當畫面有更動時都會強制將畫面滾動至最底下，因此如果將光標閃爍用vue做，每當光標改變時畫面就會被強制將滾動至最底下
        document.getElementById('cursor').hidden = showCursor = !showCursor;//因為#cursor在vue的範圍裡，因此有很大的機率被更動，因此必須每次都重找
    }, 500)

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
            ],
            showCursor: true,
            promptChar: '›',
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
            appebdTextToScreen(text, style = {}){
                text = text.toString();
                this.screenTexts.push(...text.split(/\n/g).map(i => ({text: i, style})));
                if(this.screenTexts.length > this.screenTextLineMax){
                    this.screenTexts.splice(0, this.screenTexts.length - this.screenTextLineMax);
                }
            },
            appebdLinkToScreen(url, text, style){
                text = text.toString();
                this.screenTexts.push({
                    url,
                    style,
                    text
                });
                if(this.screenTexts.length > this.screenTextLineMax){
                    this.screenTexts.splice(0, this.screenTexts.length - this.screenTextLineMax);
                }
            },
            appebdImageToScreen(image, style = {'max-width': '100%'}){
                this.screenTexts.push({
                    image,
                    style,
                });
                if(this.screenTexts.length > this.screenTextLineMax){
                    this.screenTexts.splice(0, this.screenTexts.length - this.screenTextLineMax);
                }
            },
            appebdTextToScreenlastLine(text){
                text = text.toString();
                if(this.screenTexts[this.screenTexts.length - 1].image){
                    this.screenTexts.push({text: '', style: {}});
                }
                var lines = text.split(/\n/g).map(i => {
                    let text = {
                        ...this.screenTexts[this.screenTexts.length - 1]
                    };
                    text.text = i;
                    return text;
                });
                this.screenTexts[this.screenTexts.length - 1].text += lines[0].text;
                this.screenTexts.push(...lines.slice(1));
                if(this.screenTexts.length > this.screenTextLineMax){
                    this.screenTexts.splice(0, this.screenTexts.length - this.screenTextLineMax);
                }
            },
            inputText(){
                var text = this.input;
                this.input = '';
                this.appebdTextToScreen(this.promptChar + text);
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
        return new Promise((resolve, reject) => {
            var openRequest = indexedDB.open(storeName, DB_VERSION);
            openRequest.onsuccess = function(event) {
                var db = event.target.result;
                console.debug('open success');
                resolve(db);
            };

            openRequest.onerror = function(event) {
                console.error(event.target.errorCode);
            };
            openRequest.onupgradeneeded = function(event){
                var db = event.target.result;
                console.debug('open upgradeneeded');
                if(!db.objectStoreNames.contains(DB_TABLE_GAME_SAVE_DATA)){
                    db.createObjectStore(DB_TABLE_GAME_SAVE_DATA, { keyPath: "id" });
                    if(event.oldVersion == 1){//舊資料轉移
                        event.target.transaction.oncomplete = function(){
                            db.transaction([storeName]).objectStore(storeName).getAll().onsuccess = function(event) {
                                var svaveStore  = db.transaction([DB_TABLE_GAME_SAVE_DATA], 'readwrite').objectStore(DB_TABLE_GAME_SAVE_DATA);
                                for(let i of event.target.result){
                                    svaveStore.add(i);
                                }
                            };
                        }
                    }
                }
            }
        });
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
            switch (await select(storyTitle.name, option))
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
                        await load(saveFile.storyName, saveFile.globalVariable);
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

            if (gameStatus == GameStatus.BLACK_CURRENT_STORY_FILE || !nextStoryName)
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
            for (; floorsLine[floor].line < commands.length && gameStatus != GameStatus.STOP; floorsLine[floor].line++)
            {
                var command = commands[floorsLine[floor].line];
                if (command.show != undefined)
                {
                    await show(command.show, command.args, storyName);
                }
                else if (command.showImage != undefined)
                {

                    await show(storyObj.image.find(i => i.name == command.showImage)?.image, command.args, storyName, ShowType.IMAGE);
                }
                else if (command.sleep != undefined)
                {
                    await wait(eval(command.sleep) * 1000, command.args);
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
                        gameStatus == GameStatus.GOTO ||
                        gameStatus == GameStatus.BLACK_CURRENT_STORY_FILE
                    )
                    {
                        return result;
                    }
                }
                else if (command.exec != undefined)
                {
                    eval(command.exec);
                }
                else if (command.clear != undefined)
                {
                    vApp.clearScreen();
                }
                else if (command.goto != undefined)
                {
                    gameStatus = GameStatus.GOTO;
                    return command.goto;
                }
                else if(command.call != undefined)
                {
                    if(floor == floorsLine.length - 1)
                        floorsLine[floor].nextStoryName = command.call;
                    while(true){
                        let commands = storyObj[floorsLine[floor].nextStoryName];
                        floorsLine[floor].nextStoryName = await runStory(commands, floorsLine[floor].nextStoryName, floor + 1);//當玩家手動停止遊戲時 gameStatus 會等於 GameStatus.STOP 然後回傳null
                        
                        if (floorsLine[floor].nextStoryName === "")//當goto主選單時
                        {
                            gameStatus = GameStatus.STOP;
                            break;
                        }
                        else if (gameStatus == GameStatus.BLACK_CURRENT_STORY_FILE)
                        {
                            gameStatus = GameStatus.RUN;
                            break;
                        }
                        else if (!floorsLine[floor].nextStoryName)
                        {
                            break;
                        }
                        else if(gameStatus == GameStatus.GOTO)
                        {
                            gameStatus = GameStatus.RUN;
                        }
                    }
                }
                else if (command.blackCurrentStoryFile)
                {
                    gameStatus = GameStatus.BLACK_CURRENT_STORY_FILE;
                    return null;
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
                            gameStatus == GameStatus.GOTO ||
                            gameStatus == GameStatus.BLACK_CURRENT_STORY_FILE
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
                            gameStatus == GameStatus.GOTO ||
                            gameStatus == GameStatus.BLACK_CURRENT_STORY_FILE
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
                            gameStatus == GameStatus.GOTO ||
                            gameStatus == GameStatus.BLACK_CURRENT_STORY_FILE
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
                            else if (gameStatus == GameStatus.STOP || gameStatus == GameStatus.GOTO || gameStatus == GameStatus.BLACK_CURRENT_STORY_FILE)
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

    async function show(data, args, storyName, type = ShowType.TEXT)
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
                        selected = await select("選項", option);
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
                            vApp.clearScreen();
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
            if(type == ShowType.TEXT){
                vApp.appebdTextToScreen(eval(data));
            }else if(type == ShowType.IMAGE){
                if(args.useSize){
                    vApp.appebdImageToScreen(data, {
                        height: args.height,
                        width: args.width
                    });
                }else{
                    vApp.appebdImageToScreen(data);
                }
            }
            if(args && args.notPause) break;
            vApp.appebdTextToScreen(
                "按enter繼續、按0清空畫面、按1選項",
                {
                    float: 'right'
                }
            );
            if(await f()) break;
        }
    }

    async function wait(time, args)
    {
        let count = parseInt(time / 1000);
        let previousTime = Date.now();
        vApp.appebdTextToScreen('');
        var f = function(resolve, reject){
            if(time > 0){
                let nowTime = Date.now();
                let dt = nowTime - previousTime;
                previousTime = nowTime;
                if(count >= time / 1000){
                    if(!args || !args.notShowDot) vApp.appebdTextToScreenlastLine('.');
                    count--;
                }
                setTimeout(() => f(resolve, reject));
                time -= dt;
            }else{
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
        var fileItem = await select("選擇記錄檔", option);
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

        var objectStore = db.transaction([DB_TABLE_GAME_SAVE_DATA], 'readwrite').objectStore(DB_TABLE_GAME_SAVE_DATA);

        objectStore.delete(fileItem);
        objectStore.add({
            id: fileItem,
            storyName: storyName,
            floorsLine: floorsLine,
            globalVariable: globalVariable
        });

        option = [
            {text: "繼續遊戲"},
            {text: "離開遊戲"},
        ];
        switch (await select("請問您現在要?", option))
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
            var fileItem = await select("選擇記錄檔", option);
            if (fileItem == 6){
                resolve(null);
                return;
            }

            var objectStore = db.transaction([DB_TABLE_GAME_SAVE_DATA]).objectStore(DB_TABLE_GAME_SAVE_DATA);

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

    async function select(title, option, useJsOption = false){//函數中，所有的字串長度都*2，是因為細明體的中文字在畫面上是兩倍的英文字母寬
        let iMap = {}, newI = 1, optionStr = [], maxLength = 0;
        for (let i = 0 ; i < option.length ; i++){
            if(
                !option[i].args 
                || 
                eval(option[i].args.if)
            ){
                let str = `${newI}. ${useJsOption ? eval(option[i].text) : option[i].text}`;
                maxLength = Math.max(maxLength, str.length * 2);
                optionStr.push(str);
                iMap[newI++] = i + 1;
            }
        }
        title = useJsOption ? eval(title) : title;
        maxLength = Math.max(maxLength, title.length * 2) + 4;
        
        let padding = maxLength - title.length * 2;
        padding = Math.floor(padding / 2);

        vApp.appebdTextToScreen(' '.repeat(padding) + title + ' '.repeat(padding));
        vApp.appebdTextToScreen('-'.repeat(maxLength))
        optionStr.forEach(i => vApp.appebdTextToScreen(i));
        vApp.appebdTextToScreen('-'.repeat(maxLength));

        var f = function(resolve, reject){
            selection  = -1;

            // Console.Write(">");
            if(enterDown){
                enterDown = false;
                let text = vApp.inputText();
                selection = isNaN(text) || text == '' ? -1 : parseInt(text);
            }
            if(selection < 1 || selection > newI - 1)
                setTimeout(()=>f(resolve, reject));
            else resolve(iMap[selection]);
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
            let selected = await select("人物介紹", option);
            if (1 <= selected && selected < option.length)
            {
                let name = storyObj.character[selected - 1].name;
                let maxLength = name.length * 2;
                storyObj.character[selected - 1].detailed.split('\n').forEach( i => maxLength = Math.max(i.length * 2, maxLength));
                let padding = maxLength - name.length * 2;
                padding = Math.floor(padding / 2);
                
                vApp.appebdTextToScreen('-'.repeat(maxLength))
                vApp.appebdTextToScreen(' '.repeat(padding) + name + ' '.repeat(padding));
                vApp.appebdTextToScreen(storyObj.character[selected - 1].detailed);
                vApp.appebdTextToScreen('-'.repeat(maxLength));

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
        vApp.appebdTextToScreen("--------------------------------------------");
        if(storyObj.about){//這是兼容舊版本的故事檔，about是在ver: 1.1.0704版本時加入
            vApp.appebdTextToScreen("                    故事");
            vApp.appebdTextToScreen("              ----------------");
            for (let i of storyObj.about)
            {
                if(i.aboutText){
                    vApp.appebdTextToScreen(i.aboutText);
                }else if(i.aboutLinkName){
                    vApp.appebdLinkToScreen(i.aboutLinkUrl, i.aboutLinkName);
                }
            }
        }
        vApp.appebdTextToScreen("                  遊戲框架");
        vApp.appebdTextToScreen("              ----------------");
        vApp.appebdTextToScreen("         StoryConsole Web Version");
        vApp.appebdTextToScreen("這是一套作者作好玩的Console文字冒險遊戲框架");
        vApp.appebdTextToScreen("作者：jack850628");
        vApp.appebdTextToScreen("版本：" + VERSION);
        vApp.appebdLinkToScreen('https://home.gamer.com.tw/artwork.php?sn=5027945', '想要試試看做自己的Console風格文字冒險遊戲嗎？');
        vApp.appebdTextToScreen("--------------------------------------------");
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

    function storyLoadedDo(storyData){
        storyObj = storyData;
        // console.log(storyObj);
        if(!window.tryPlayData){
            openDB(storyData.story.name).then((result) => {
                db = result; 
            });
        }

        vApp.clearScreen();
        main();
    }
    function storyLoadFailDo(e){
        console.error(e);
        vApp.clearScreen();
        vApp.appebdTextToScreen('發生錯誤！遊戲已終止，請重新整理網頁');
    }

    vApp.appebdTextToScreen('載入中...');
    let story = new URLSearchParams(location.search).get('story');
    story = story? getStoryZipFileContentAPI + story: defaultStory;
    loadStoryFileFromZip(story)
        .then(storyLoadedDo)
        .catch(storyLoadFailDo);
})()

