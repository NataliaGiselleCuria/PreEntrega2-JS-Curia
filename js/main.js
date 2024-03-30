
let currentLevel = 6;
let anableRowNumber = 1;
const table = document.querySelector('#table');
const pickLevels = document.querySelectorAll('.pickLevel');
let palabraGanadora = [];
let fin = false;

let estadisticas = JSON.parse(localStorage.getItem("estadisticas")) || {jugadas:0, victorias:0, word1:0, word2:0, word3:0, word4:0, word5:0, word6:0, perdidas:0};
let estadisticasAux = JSON.parse(localStorage.getItem("estadisticasAux")) || {victorias:0, word1:0, word2:0, word3:0, word4:0, word5:0, word6:0, perdidas:0};   

localStorage.setItem("estadisticas", JSON.stringify(estadisticas));
localStorage.setItem("estadisticasAux", JSON.stringify(estadisticasAux));

pickLevels.forEach(pick => {
    pick.addEventListener('click', function(event){
        setLevel(event.currentTarget);
    })
});

setTable(currentLevel);
setWord(currentLevel);
setStatistics();


//*------- tabla:
// definir nivel del juego (cantidad de letras)
function setLevel(pickLevel){

    let levelText = document.querySelectorAll('#levelText');
    let levels = document.querySelectorAll('#level');

    if (pickLevel.id === "levelDown" && currentLevel > 6) {
        levelText[0].innerHTML = (--currentLevel) + " LETRAS";

    } else if (pickLevel.id === "levelUp" && currentLevel < 9) {
        levelText[0].innerHTML = (++currentLevel) + " LETRAS";
    }

    const levelClasses = ['easy', 'normal', 'medium', 'hard'];

    levels.forEach((level, index) => {
        level.removeAttribute('class');
        if (index === currentLevel - 6) {
            level.setAttribute('class', levelClasses[index]);
        }
    });

    cleanTable();
    cleanKeys();
    setTable(currentLevel);
    setWord(currentLevel);
    
}

// crear la tabla a partir del nivel del juego.
function setTable(currentLevel){
    let aux = 0;

    do{
        let aux2 = 1;

        aux++;

        let row = document.createElement('span');
        row.className= 'row word' + aux;

        do{
            
            let cell = document.createElement('input');
            cell.classList.add('cell');
            cell.setAttribute('id','letter'+aux2) ;
            cell.setAttribute('autocomplete','off');
            row.appendChild(cell);
            aux2++

        }while(aux2 <= currentLevel);
       
        table.appendChild(row);

    }while(aux<=5);

    setTimeout(function(){
        eventCells();
        eventKeys();
        enabledRow(anableRowNumber);
    }, 0);
}

// establecer la fila disponible para ingresar la palabra.
function enabledRow(rowNumber) {
    const rowsTable = document.querySelectorAll('.row');
    let focusFirstInputRow;

    rowsTable.forEach(row => {
        const shouldEnable = row.className.includes(rowNumber);
        const inputs = row.querySelectorAll('input');
        
        if(row.className.includes(rowNumber)){
            focusFirstInputRow=row
        }

        inputs.forEach(input => {
            if (shouldEnable) {
                input.removeAttribute('disabled');
            } else {
                input.setAttribute('disabled', '');
            }
        });
    });

    firstFocus(focusFirstInputRow);
}

// pone en foco automaticamente el primer input de la fila disponible.
function firstFocus(row){  
    let primerInput = row.querySelector('.cell:first-child');
    primerInput.focus();
}

function cleanTable(){
    table.innerHTML="";
}


//*------- funciones de las celdas:
function eventCells(){

    let inputs = document.querySelectorAll('.cell');

    inputs.forEach(function(input) {

        //focus de las celdas.
        input.addEventListener('input', function(event) {
            let currentInput = event.currentTarget;
            checkFocus(currentInput, event) ;
        });
    
        //borrar celdas por teclado.
        input.addEventListener('keydown', function (event) {
    
            if (event.key === 'Backspace' || event.key === 'Delete') {
                if (event.currentTarget.value.length === 0) {
                    if (!event.currentTarget.id.includes('1')) {
                        event.currentTarget.previousElementSibling.focus();
                    }
                }
            }
        });
    
        // reasignar valor a un input(celda).
        input.addEventListener('input', function(event) {
            let currentInput = event.currentTarget;
            let letter = event.target.value; 
            
            if (event.currentTarget.value.length > 1) {
                input.value = letter.charAt(1);
            }
    
            checkFocus(currentInput,event)
        });
    
        // agregar clase al input(celda) en foco, y sacarselo a todos los demás.
        input.addEventListener('focus', function(event) {
            input.classList.add('cell-focus');
    
            inputs.forEach(el => {
                if(el!=input){
                    el.classList.remove('cell-focus');
                }
            });
        });
    
        //evitar que se pierda el foco de las celdas.
        input.addEventListener('blur', function(event) {
            let currentInput = event.currentTarget;
            document.addEventListener('click', function(event) {
                checkInput(event, currentInput);
            });
        });
    });
}

// comprobar si la fila fue completada cuando se preciona 'enter'.
document.addEventListener('keydown', function(event) {
    
    if (event.key ===  "Enter"){
        const rowsTable = document.querySelectorAll('.row');
        let currentRow;

        rowsTable.forEach(row => {
            if(row.classList[1].includes(anableRowNumber)){
                currentRow = row;
            }   
        });

        checkCompleteRow(currentRow)
    }  
});

// evitar que el focus se pierda de las celdas.
function checkInput(event,el){
    if(event.target.tagName == "INPUT" && event.target!=el){
        el.classList.remove('cell-focus');
    }  
}

// redirigir focus a siguiente casilla o anterior segun corresponda.
function checkFocus(currentInput, event){

    if (currentInput.value.length === 1 && !currentInput.id.includes(currentLevel)) {
        currentInput.nextElementSibling.focus();
    }
    
    if (event.key === 'Backspace' || event.key === 'Delete') {
        if (currentInput.value.length === 0) {
            if(!currentInput.id.includes('1')){
                currentInput.previousElementSibling.focus();
            }
        }    
    } else if (currentInput.value.length === 1 && !currentInput.id.includes(currentLevel)) {
        event.target.nextElementSibling.focus();
    }
}

//*------- funciones del teclado:
function eventKeys(){
    const keys = document.querySelectorAll('.key');
    const inputs = document.querySelectorAll('.cell');

    keys.forEach(function(key) {
        key.addEventListener('click', function(event){
            let letter = event.target.innerHTML;    
            let cell;
            inputs.forEach(input => {
                if(input.className.includes('cell-focus')){
                    if(event.target.innerHTML== 'ENVIAR' ){
                        const currentRow = input.parentElement;
                        checkCompleteRow(currentRow);

                    }else if (event.target.className.includes('borrar') || event.target.className.includes('fa-delete-left')){
                        input.value="";
                        if(!input.id.includes('1')){
                            input.previousElementSibling.focus();
                        }
                    }else{
                        input.value = letter;
                    }
                    
                    cell = input;
                }
            });
    
            checkFocus(cell, event);
        })
    }); 
}

function  cleanKeys(){
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        if(!key.classList.contains('borrar') && !key.classList.contains('enviar') )
        key.setAttribute('class','key')
    });
    
}

//*------- el juego:
    
// Asignar palabra ganadora según nivel.
function setWord(level){
    palabraGanadora = []

    const wordsLevels = {
        6: ["switch", "codigo", "objeto", "string", "metodo", "cadena", "return", "evento"],
        7: ["funcion", "boolean", "arreglo", "console", "contain", "include"],
        8: ["variable", "operador", "programa", "lenguaje","elemento", "iterador", "integer"],
        9: ["iteracion", "algoritmo", "sentencia", "condicion","parametro", "constante"]
    };

    const wordsCurrentLevel = wordsLevels[level];

    let randomIndex = Math.floor(Math.random() * wordsCurrentLevel.length);
    const palabra = wordsCurrentLevel[randomIndex];
    
    for (let i = 0; i < palabra.length; i++) {
        palabraGanadora.push(palabra.charAt(i))
    }

}

//comprobar si la fila actual fue completada para contunuar.
function checkCompleteRow(RowToCheck){
    const currentRow = RowToCheck;
    const inputs = currentRow.querySelectorAll('input');
    let complete = true;

    inputs.forEach(input => {
        if (input.value.trim() === '') {
            complete = false;
        }
    });

    if (complete) {

        checkLetters(currentRow)

    } else {
        const toasts = document.querySelector('#error');
        const notif = document.createElement('div');
        notif.classList.add('error');
        
        notif.innerText = "La palabra debe estar completa!";
        toasts.appendChild(notif);
        
        setTimeout(() => {
          notif.remove()
        }, 2000)
      
    }
}

//comprobar la palabra ingredasa / letras correctas / letras presentes en la palabra / letras incorrectas.
function checkLetters(row){
    const inputs = row.querySelectorAll('input');
    const keys = document.querySelectorAll('.key');
    let successes = 0;
    const attemp = row.classList[1];

    for (let i = 0; i < inputs.length; i++) {
        const inputLetter = inputs[i].value.toLowerCase();

        // Determinar el estado de la letra actual
        let letterState;
        if (palabraGanadora[i] === inputLetter) {
            letterState = 'correct';
            successes++
        } else if (palabraGanadora.includes(inputLetter)) {
            letterState = 'contain';
        } else {
            letterState = 'incorrect';
        }

        // Agregar clases a los inputs y keys
        agregarClase(inputs[i], letterState + '-cell');

        keys.forEach(key => {
            if (key.innerHTML === inputLetter.toUpperCase()) {
                agregarClase(key, letterState + '-key');
            }
        });
    }

    function agregarClase(elemento, clase) {
        if(elemento.classList.contains('key') && elemento.classList.length>=1){
            elemento.classList.remove(elemento.classList[1]);
            elemento.classList.add(clase);
        }else{
            elemento.classList.add(clase);
        }  
    }

    if (successes == inputs.length){

        let estadisticasAuxLS = JSON.parse(localStorage.getItem("estadisticasAux"));

        for(let estadistica in estadisticasAuxLS){
            if (estadistica == attemp){
                estadisticasAuxLS[estadistica]++;
            }
        }

        estadisticasAuxLS.victorias++

        localStorage.setItem("estadisticasAux", JSON.stringify(estadisticasAuxLS));

        finishGame()

    }else{

        if(anableRowNumber!='6'){
            anableRowNumber++
            enabledRow(anableRowNumber);

        }else{
            let estadisticasAuxLS = JSON.parse(localStorage.getItem("estadisticasAux"));

            estadisticasAuxLS.perdidas++

            localStorage.setItem("estadisticasAux", JSON.stringify(estadisticasAuxLS));
            finishGame()
        }
        
    }
    
}

function finishGame(){
    let estadisticasLS = JSON.parse(localStorage.getItem("estadisticas"));
    let estadisticasAuxLS = JSON.parse(localStorage.getItem("estadisticasAux"));

    estadisticasLS.jugadas++

    estadisticasLS.victorias = Math.round((estadisticasAuxLS.victorias*100)/estadisticasLS.jugadas);
    estadisticasLS.word1 = (estadisticasAuxLS.word1==0)? "0" : Math.round((estadisticasAuxLS.word1*100)/estadisticasLS.jugadas);
    estadisticasLS.word2 = (estadisticasAuxLS.word2==0)? "0" : Math.round((estadisticasAuxLS.word2*100)/estadisticasLS.jugadas);
    estadisticasLS.word3 = (estadisticasAuxLS.word3==0)? "0" : Math.round((estadisticasAuxLS.word3*100)/estadisticasLS.jugadas);
    estadisticasLS.word4 = (estadisticasAuxLS.word4==0)? "0" : Math.round((estadisticasAuxLS.word4*100)/estadisticasLS.jugadas);
    estadisticasLS.word5 = (estadisticasAuxLS.word5==0)? "0" : Math.round((estadisticasAuxLS.word5*100)/estadisticasLS.jugadas);
    estadisticasLS.word6 = (estadisticasAuxLS.word6==0)? "0" : Math.round((estadisticasAuxLS.word6*100)/estadisticasLS.jugadas);
    estadisticasLS.perdidas = (estadisticasAuxLS.perdidas==0)? "0" : Math.round((estadisticasAuxLS.perdidas*100)/estadisticasLS.jugadas);

    localStorage.setItem("estadisticas", JSON.stringify(estadisticasLS));
    localStorage.setItem("estadisticasAux", JSON.stringify(estadisticasAuxLS));
    
    setStatistics()

    setTimeout(() => {
        openStatics();
    }, 800);

    

}

function setStatistics(){
    let estadisticasLS = JSON.parse(localStorage.getItem("estadisticas"));
    let estadisticasAuxLS = JSON.parse(localStorage.getItem("estadisticasAux"));

    const plays = document.querySelector('#plays')
    plays.innerHTML = estadisticasLS.jugadas;

    const won = document.querySelector('#won')
    won.innerHTML = estadisticasLS.victorias;

    // graphic

    const try1Graphic =  document.querySelector('.try-1');
    const try1Text = document.querySelector('.try-1P');
    try1Text.innerHTML = estadisticasAuxLS.word1 + ' (' + estadisticasLS.word1 + '%)';
    try1Graphic.style.width = estadisticasLS.word1 + "%";

    const try2Graphic =  document.querySelector('.try-2');
    const try2Text = document.querySelector('.try-2P');
    try2Text.innerHTML = estadisticasAuxLS.word2 + ' (' + estadisticasLS.word2 + '%)';;
    try2Graphic.style.width = estadisticasLS.word2 + "%";

    const try3Graphic =  document.querySelector('.try-3');
    const try3Text = document.querySelector('.try-3P');
    try3Text.innerHTML = estadisticasAuxLS.word3 + ' (' + estadisticasLS.word3 + '%)';;
    try3Graphic.style.width = estadisticasLS.word3 + "%";

    const try4Graphic =  document.querySelector('.try-4');
    const try4Text = document.querySelector('.try-4P');
    try4Text.innerHTML = estadisticasAuxLS.word4 + ' (' + estadisticasLS.word4 + '%)';
    try4Graphic.style.width = estadisticasLS.word4 + "%";
    
    const try5Graphic =  document.querySelector('.try-5');
    const try5Text = document.querySelector('.try-5P');
    try5Text.innerHTML = estadisticasAuxLS.word5 + ' (' + estadisticasLS.word5 + '%)';
    try5Graphic.style.width = estadisticasLS.word5 + "%";

    const try6Graphic =  document.querySelector('.try-6');
    const try6Text = document.querySelector('.try-6P');
    try6Text.innerHTML = estadisticasAuxLS.word6 + ' (' + estadisticasLS.word6 + '%)';
    try6Graphic.style.width = estadisticasLS.word6 + "%";

    const lossGraphic = document.querySelector('.loss');
    const lossText = document.querySelector('.lossP');
    lossText.innerHTML = estadisticasAuxLS.perdidas + ' (' + estadisticasLS.perdidas + '%)';
    lossGraphic.style.width = estadisticasLS.perdidas + "%";

}

//*------- estadisticas:

const showStatistics = document.querySelector('.fa-square-poll-vertical');
const hideStadistics = document.querySelector('.close');
const statistics = document.querySelector('#statistics');

showStatistics.addEventListener('click', function(){
    openStatics();
})

hideStadistics.addEventListener('click', function(){
    closeStatics();
})

function openStatics(){
    statistics.style.display ='flex';
}

function closeStatics(){
    statistics.style.display = 'none';
} 



function jugar(){   

    estadisticas.jugadas++  


    function mostrarEstadisticas(){

        switch (intentos){
            case 1: estadisticasAux.unInt++; break;
            case 2: estadisticasAux.dosInt++; break;
            case 3: estadisticasAux.tresInt++; break;
            case 4: estadisticasAux.cuatroInt++; break;
            case 5: estadisticasAux.cincoInt++; break;
            case 6: estadisticasAux.seisInt++; break;
        }
        
        estadisticas.victorias = Math.round((estadisticasAux.victorias*100)/estadisticas.jugadas);
        estadisticas.unInt =     (estadisticasAux.unInt==0)? "0" : Math.round((estadisticasAux.unInt*100)/estadisticas.jugadas);
        estadisticas.dosInt =    (estadisticasAux.dosInt==0)? "0" : Math.round((estadisticasAux.dosInt*100)/estadisticas.jugadas);
        estadisticas.tresInt =   (estadisticasAux.tresInt==0)? "0" : Math.round((estadisticasAux.tresInt*100)/estadisticas.jugadas);
        estadisticas.cuatroInt = (estadisticasAux.cuatroInt==0)? "0" : Math.round((estadisticasAux.cuatroInt*100)/estadisticas.jugadas);
        estadisticas.cincoInt =  (estadisticasAux.cincoInt==0)? "0" : Math.round((estadisticasAux.cincoInt*100)/estadisticas.jugadas);
        estadisticas.seisInt =   (estadisticasAux.seisInt==0)? "0" : Math.round((estadisticasAux.seisInt*100)/estadisticas.jugadas);
        estadisticas.perdidas =  (estadisticasAux.perdidas==0)? "0" : Math.round((estadisticasAux.perdidas*100)/estadisticas.jugadas);


        alert( "Jugadas: " + estadisticas.jugadas + 
               "\n Victorias: " + estadisticasAux.victorias + "(" + estadisticas.victorias + "%)" +
               "\n 1 intento: " + estadisticasAux.unInt + "(" + estadisticas.unInt + "%)" +
               "\n 2 intento: " + estadisticasAux.dosInt + "(" + estadisticas.dosInt + "%)" +
               "\n 3 intento: " + estadisticasAux.tresInt + "(" + estadisticas.tresInt + "%)" +
               "\n 4 intento: " + estadisticasAux.cuatroInt + "(" + estadisticas.cuatroInt + "%)" +
               "\n 5 intento: " + estadisticasAux.cincoInt + "(" + estadisticas.cincoInt + "%)" +
               "\n 6 intento: " + estadisticasAux.seisInt + "(" + estadisticas.seisInt + "%)" +
               "\n Perdidas: "  + estadisticasAux.perdidas + "(" + estadisticas.perdidas + "%)")
    }
}

