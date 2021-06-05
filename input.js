addMemory();
addDisk();

let fileSelected = false;

function fileSelect() {
    const selected = document.getElementById("cFile").files.length > 0;
    fileSelected = selected
    document.getElementById("cmd").disabled = selected
}
function commandInput() {
    if (fileSelected) {

    } else {
        commandLine(document.getElementById("cmd").value);
        document.getElementById("cmd").value = null;
    }
}

function commandLine(line) {
    try {
        const divided = line.split(' ');
        console.log(divided);
        switch (divided[0]) {
            case 'P':
                if (!isNaN(divided[1]) && !isNaN(divided[2])) {
                    document.getElementById('Pbytes').value = divided[1];
                    document.getElementById('Pid').value = divided[2];
                    inputP();
                } else {
                    throw 'Parametros para Proceso P incorrectos'
                }
                break;
            case 'A':
                if (!isNaN(divided[1]) && !isNaN(divided[2]) && !isNaN(divided[3]) && (divided[3] == 1 || divided[3] == 0)) {
                    document.getElementById('Adirc').value = divided[1];
                    document.getElementById('Aid').value = divided[2];
                    document.getElementById('Amod').checked = (divided[3] == 1);
                    inputA();
                } else {
                    throw 'Parametros para Proceso A incorrectos'
                }
                break;
            case 'L':
                if (!isNaN(divided[1])) {
                    document.getElementById('Lid').value = divided[1];
                    inputL();
                } else {
                    throw 'Parametros para Proceso A incorrectos'
                }
                break;
            case 'C':
                Mconsole.innerHTML += line.substring(1) + '<br>';
                break;
            case 'F':
                console.log('Metrics');
                break;
            case 'E':
                Mconsole.innerHTML += "Adiooos! (No puedo cerrar la ventana)<br>";
                break;
            default:
                throw 'Comando no reconocido';
        }
    } catch (err) {
        console.log(err);
        Mconsole.innerHTML += '!!! Error en linea de comando: ' + err + '<br>';
    }
}

function inputP() {
    document.getElementById("algor").disabled = true;

    const bytes = document.getElementById('Pbytes').value;
    const processid = document.getElementById('Pid').value;

    if (bytes <= 2048 && !validateId(processid) && bytes > 0 && processid > 0) {
        ProcedureP(bytes, processid);
        time += 1;
    } else {
        Mconsole.innerHTML += '!!! Error en ProcesoP: ID existe o bytes mayores a 2048<br>';
    }

    document.getElementById('Pbytes').value = null;
    document.getElementById('Pid').value = null;

    updateMemory();
    updateDisk();
}

function inputA() {
    document.getElementById("algor").disabled = true;

    const virDirc = document.getElementById('Adirc').value;
    const processid = document.getElementById('Aid').value;
    const modificar = document.getElementById('Amod').checked;

    if (validateDirecc(processid, virDirc) && virDirc >= 0) {
        ProcedureA(virDirc, processid, modificar);
        time += 1;
    } else {
        Mconsole.innerHTML += '!!! Error en ProcesoA: ID no existe, o direccion virtual no existe en el proceso<br>';
    }

    document.getElementById('Adirc').value = null;
    document.getElementById('Aid').value = null;
    document.getElementById('Amod').checked = false;

    updateMemory();
    updateDisk();
}

function inputL() {
    document.getElementById("algor").disabled = true;

    const processid = document.getElementById('Lid').value;

    if (validateId(processid)) {
        ProcedureL(processid);
        time += 1;
    } else {
        Mconsole.innerHTML += '!!! Error en ProcesoL: ID no existe <br>';
    }

    document.getElementById('Lid').value = null;

    updateMemory();
    updateDisk();
}

function restart() {
    location.reload();
}

function algortPick() {
    document.getElementById("algor").disabled = true;
    algorithm = document.getElementById("algor").value;
}

function addMemory() {
    for (j = 0; j < Memory.length; j++) {
        var div = document.createElement("DIV");
        div.setAttribute("id", "box" + j);
        div.classList.add("box");
        div.classList.add("freeBox");
        div.innerHTML = 0;
        document.body.appendChild(div);
    }
}

function addDisk() {
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

function validateId(processid) {
    returnValue = false;
    listProcess.forEach((e) => {
        if (e.id == processid) {
            returnValue = true;
        }
    });

    return returnValue;
}

function validateDirecc(processid, direcc) {
    returnValue = false;
    listProcess.forEach((e) => {
        if (e.id == processid) {
            if (direcc <= e.bytes) {
                returnValue = true;
            }
        }
    });
    return returnValue
}

