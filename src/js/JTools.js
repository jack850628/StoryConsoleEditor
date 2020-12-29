var esprima = require('esprima');

export const createMathString = function(obj){
    let str = '';
    switch(obj?.type){
        case esprima.Syntax.AssignmentExpression:
        case esprima.Syntax.BinaryExpression:{
            str += '(';
            str += createMathString(obj.left);
            str += obj.operator;
            str += createMathString(obj.right);
            str += ')';
            return str;
        } 
        case esprima.Syntax.UnaryExpression:{
            str += obj.operator;
            str += '(';
            str += createMathString(obj.argument);
            str += ')';
            return str;
        }
        case esprima.Syntax.MemberExpression:{
            if(obj.object.name == 'SC'){
                return `SC.${obj.property.name}`;
            }
        }
        case esprima.Syntax.Literal:{
            return JSON.stringify(obj.value);//不知道什麼原因導致 Literal 的 raw 屬性有機會不見，所以 obj.raw 有機會是 undefined
        }
    }
};

export class BlockBase{
    constructor(arg = {}){
        if(arg.index) this.index.default = arg.index;
        if(arg.top) this.arg.default = arg.top;
        if(arg.left) this.left.default = arg.left;
        if(arg.backgroundColor) this.backgroundColor.default = arg.backgroundColor;
        if(arg.isDemo) this.isDemo.default = arg.isDemo;
    }
    index = {
        type: Number,
        default: -1,
    }
    top = {
        typt: Number,
        default: 100,
    }
    left = {
        typt: Number,
        default: 100,
    }
    backgroundColor =  {
        type: String,
        default: "#1658c7",
    }
    isDemo = {
        type: Boolean,
        default: false,
    }
};