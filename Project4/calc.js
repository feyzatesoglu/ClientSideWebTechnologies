let mode=true;
var changerTheme=document.querySelector('#change')
changerTheme.addEventListener("click",function(){
    let themeCssEl = document.querySelector('#theme-css') 
    if(mode){
        themeCssEl.setAttribute("href", "dark.css") 
        mode=false;
    }
    else{
    themeCssEl.setAttribute("href", "light.css") 
    mode=true;
    }
})
const displayEl1=document.querySelector('.display1')
const displayEl2=document.querySelector('.display2')
const numbersEl=document.querySelectorAll('.number')
const operatorEl=document.querySelectorAll('.operator')
const clearButton=document.querySelector('.clear')
const equalButton=document.querySelector('#equal-operator')
let dis1Num=''
let dis2Num=''
let result=null;
let operation='';

numbersEl.forEach(element=>{
    element.addEventListener('click',(e)=>{
    dis2Num += e.target.innerText
    displayEl2.innerText=dis2Num
    })
})
operatorEl.forEach(operator=>{
    operator.addEventListener("click", (e)=>{
        if(!dis2Num) result
        const operationName=e.target.innerText
        if(dis1Num&&dis2Num){
            mathOperation()
        }
        else{
            result=Number(dis2Num)
        }
        clearNum(operationName)
        operation=operationName;
    })
})
function clearNum(name=''){
    dis1Num+=dis2Num +' '+ name + ' '
    displayEl1.innerText=dis1Num
    displayEl2.innerText=''
    dis2Num=''
}
function mathOperation(){
    if(operation==='+'){
        result=parseFloat(result)+parseFloat(dis2Num)
    }
    if(operation === '-'){
        result=parseFloat(result)-parseFloat(dis2Num)
    }
    if(operation === '*'){
    result=parseFloat(result)*parseFloat(dis2Num)
    }
    if(operation === '/'){
    result=parseFloat(result)/parseFloat(dis2Num)
    result=result.toFixed(2)
    }
}
equalButton.addEventListener('click',(e)=>{
    mathOperation()
    clearNum()
    displayEl2.innerText=result
    dis2Num=result
    dis1Num=''
})
clearButton.addEventListener('click',(e)=>{
    displayEl1.innerText='0'
    displayEl2.innerText='0'
    dis1Num=''
    dis2Num=''
    result=''
})