//Archivo input.js
//Maneja todo el output y input del sistema, tambien controla las validaciones 

//Agregar los Indicadores visuales Memoria y Disco
addMemory(); 
addDisk();

let fileSelected = false; //Si un archivo fue seleccionado

function fileSelect() { //Controla si el input es la linea de comando o un archivo
    const selected = document.getElementById("cFile").files.length > 0;
    fileSelected = selected
    document.getElementById("cmd").disabled = selected
}

function commandInput() {
    if (fileSelected) { //Si un archivo fue seleccionado cada linea a la funcion commandLine
        var fileToLoad = document.getElementById("cFile").files[0];
        var fileReader = new FileReader();
        fileReader.onload = function (fileLoadedEvent) {
            var textFromFileLoaded = fileLoadedEvent.target.result;
            var lines = textFromFileLoaded.split(/[\r\n]+/g);
            for (var i = 0; i < lines.length; i++) {
                commandLine(lines[i]);
            }
            document.getElementById("cFile").value = [];
            document.getElementById("cmd").disabled = false;
        };
        fileReader.readAsText(fileToLoad, "UTF-8");
    } else {
        commandLine(document.getElementById("cmd").value); //Si se mando una linea de comando manda esa unica linea
    }
    document.getElementById("cmd").value = null;
}

function commandLine(line) { //Input de cada linea de comando
    try {
        let divided = line.split(' ');
        divided = divided.filter(n => n)

        switch (divided[0]) {
            case 'P'://Comando P
                if (!isNaN(divided[1]) && !isNaN(divided[2])) { //Verifica Input 
                    document.getElementById('Pbytes').value = divided[1];
                    document.getElementById('Pid').value = divided[2];
                    inputP();
                } else {
                    throw 'Parametros para Proceso P incorrectos'
                }
                break;
            case 'A'://Comando A
                if (!isNaN(divided[1]) && !isNaN(divided[2]) && !isNaN(divided[3]) && (divided[3] == 1 || divided[3] == 0)) {//Verifica Input 
                    document.getElementById('Adirc').value = divided[1];
                    document.getElementById('Aid').value = divided[2];
                    document.getElementById('Amod').checked = (divided[3] == 1);
                    inputA();
                } else {
                    throw 'Parametros para Proceso A incorrectos'
                }
                break;
            case 'L'://Comando L
                if (!isNaN(divided[1])) {//Verifica Input 
                    document.getElementById('Lid').value = divided[1];
                    inputL();
                } else {
                    throw 'Parametros para Proceso A incorrectos'
                }
                break;
            case 'C'://Comando C
                Mconsole.innerHTML += '-C: ' + line.substring(1) + '<br>';
                break;
            case 'F'://Comando F 
                displayMetrics(); //Finaliza la simulacion y muestra metricas
                break;
            case 'E'://Comando E
                Mconsole.innerHTML += "Adiooos! (No puedo cerrar la ventana)<br>";
                break;
            default:
                throw 'Comando no reconocido';
        }
    } catch (err) {
        console.log(err);
        Mconsole.innerHTML += '!!! Error en linea de comando: ' + err + '<br>'; //Aqui se mostrarian los diferentes throws por si el formato esta incorrecto
    }
}

function inputP() { //Control y validacion de input para Proceso P
    document.getElementById("algor").disabled = true;

    const bytes = document.getElementById('Pbytes').value;
    const processid = document.getElementById('Pid').value;

    if (bytes <= 2048 && !validateId(processid) && bytes > 0 && processid > 0) { //Validaciones 
        ProcedureP(bytes, processid);
    } else {
        Mconsole.innerHTML += '!!! Error en ProcesoP: ID existe o bytes mayores a 2048<br>';
    }

    document.getElementById('Pbytes').value = null;
    document.getElementById('Pid').value = null;

    updateMemory();
    updateDisk();
    updateTime();
}

function inputA() {//Control y validacion de input para Proceso A
    document.getElementById("algor").disabled = true;

    const virDirc = document.getElementById('Adirc').value;
    const processid = document.getElementById('Aid').value;
    const modificar = document.getElementById('Amod').checked;

    if (validateDirecc(processid, virDirc) && virDirc >= 0) {//Validaciones 
        ProcedureA(virDirc, processid, modificar);
    } else {
        Mconsole.innerHTML += '!!! Error en ProcesoA: ID no existe, o direccion virtual no existe en el proceso<br>';
    }

    document.getElementById('Adirc').value = null;
    document.getElementById('Aid').value = null;
    document.getElementById('Amod').checked = false;

    updateMemory();
    updateDisk();
    updateTime();
}

function inputL() {//Control y validacion de input para Proceso L
    document.getElementById("algor").disabled = true;

    const processid = document.getElementById('Lid').value;

    if (validateId(processid)) {//Validaciones 
        if (validateL(processid)) {
            ProcedureL(processid);
        } else {
            Mconsole.innerHTML += '!!! Proceso ' + processid + ' ya fue liberado <br>';
        }
    } else {
        Mconsole.innerHTML += '!!! Error en ProcesoL: ID no existe <br>';
    }

    document.getElementById('Lid').value = null;

    updateMemory();
    updateDisk();
    updateTime();
}

function displayMetrics() { //Muestra las metricas finales 
    Mconsole.innerHTML += '<br>***FINALIZACION***' + '<br><br>' + "----------------REPORTE---------------" + '<br><br>';

    let allTrunaround = 0;
    let finishedProcess = 0;
    listProcess.forEach((procces) => {
        if (procces.eTime) {
            turnaround = procces.eTime - procces.sTime; //Tiempo inicio - Tiempo fin
            allTrunaround += turnaround;
            finishedProcess += 1;
            Mconsole.innerHTML += 'Proceso: ' + procces.id + '<br>------- TURNAROUND TIME: ' + turnaround / 1000 + ' seg<br>';
            Mconsole.innerHTML += '------- PAGE FAULTS: ' + procces.pageFaults + '<br><br>';
        }
    })

    let PromedioTurn = Math.round(allTrunaround / finishedProcess);
    if (isNaN(PromedioTurn)) {
        PromedioTurn = 0;
    }
    Mconsole.innerHTML += 'PROMEDIO DE TURNAROUNDS: ' + PromedioTurn / 1000 + ' seg <br>';
    Mconsole.innerHTML += 'TOTAL SWAP-INS / SWAP-OUTS: ' + operacionesSwap + '<br>';

    restart();

}

function restart() { //Resetea toda la simulacion, elimina todos los procesos, y limpia las memorias 
    Mconsole.innerHTML += '<br>' + '***REINICIO***' + '<br><br>';
    document.getElementById("algor").disabled = false;
    listProcess = [];
    Memory = new Array(128).fill(0);
    memoryPointer = 0;
    Disk = new Array(256).fill(0);
    diskPointer = 0;
    time = 0;
    operacionesSwap = 0;

    updateDisk();
    updateMemory();
    updateTime();
}

function algortPick() { //Cambio de algoritmo
    algorithm = document.getElementById("algor").value;
}

function addMemory() { //Grafico Memoria
    for (j = 0; j < Memory.length; j++) {
        var div = document.createElement("DIV");
        div.setAttribute("id", "box" + j);
        div.classList.add("box");
        div.classList.add("freeBox");
        div.innerHTML = 0;
        document.body.appendChild(div);
    }
}

function addDisk() { //Grafico Disco
    var h2 = document.createElement("H2");
    h2.innerHTML = "Memoria Secundaria (Swapping)";
    document.body.appendChild(h2);
    for (j = 0; j < Disk.length; j++) {
        var div = document.createElement("DIV");
        div.setAttribute("id", "dbox" + j);
        div.classList.add("box");
        div.classList.add("freeBox");
        div.innerHTML = 0;
        document.body.appendChild(div);
    }
}

function updateMemory() {
    for (j = 0; j < Memory.length; j++) {
        var div = document.getElementById("box" + j);
        div.classList.remove("freeBox");
        if (Memory[j] == 0) {
            div.classList.add("freeBox");
            div.innerHTML = Memory[j];
        } else {
            div.innerHTML = Memory[j];
        }
    }
}

function updateDisk() {
    for (j = 0; j < Disk.length; j++) {
        var div = document.getElementById("dbox" + j);
        div.classList.remove("freeBox");
        if (Disk[j] == 0) {
            div.classList.add("freeBox");
            div.innerHTML = Disk[j];
        } else {
            div.innerHTML = Disk[j];
        }
    }
}

function updateTime(){
    document.getElementById('timer').innerHTML = "Tiempo: " + time / 1000 + " seg";
}


//FUNCIONES DE VALIDACIONES 

function validateId(processid) { //Valida si el proceso existe
    returnValue = false;
    listProcess.forEach((e) => {
        if (e.id == processid) {
            returnValue = true;
        }
    });
    return returnValue;
}

function validateL(processid) { //Valida si el proceso ya fue liberado
    returnValue = true;
    listProcess.forEach((e) => {
        if (e.id == processid && e.liberado) {
            returnValue = false;
        }
    });
    return returnValue;
}

function validateDirecc(processid, direcc) { //Valida la peticion de direcc sea menor o igual a los bytes del proceso
    returnValue = false;
    listProcess.forEach((e) => {
        if (e.id == processid && !e.liberado) {
            if (direcc <= e.bytes) {
                returnValue = true;
            }
        }
    });
    return returnValue
}