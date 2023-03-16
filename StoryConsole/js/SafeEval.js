function getSafeEval(allowPropertyFromWindow = []){
    let blockMap = [];
    Reflect.ownKeys(window).forEach(k => {
        blockMap.push([k, 
            allowPropertyFromWindow.find(i => i == k)
                ? window[k]
                : undefined
        ]);
    })
    return function(code, args = {}, This = {}){
        args = Object.entries(args);
        return new Function(
            ...blockMap.map(([k, v]) => k),
            ...args.map(([k, v]) => k),
            'This',
            `
                return (function(){
                    //console.log(this);
                    return (${code});
                }).call(This);
            `
        )(
            ...blockMap.map(([k, v]) => v),
            ...args.map(([k, v]) => v),
            This
        );
    };
}

// let thisObj = {a: 2};
// let allowProperty = [
//     'Math',
//     'alert',
//     'confirm',
//     'prompt',
//     'console',
// ]
// let eval = getSafeEval(allowProperty);

// console.log(eval(`1 + 1`));
// console.log(eval(`1 + this.a`, {}, thisObj));
// console.log(eval(`({f: ()=>{alert('hi'); return this;}}).f()`, {}, thisObj));
// console.log(eval(`(()=>{delete document;return document;})()`, {}, thisObj));
// console.log(eval(`a + b`, {a: 1, b: 2}, thisObj));