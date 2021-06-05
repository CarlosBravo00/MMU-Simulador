addMemory();

function inputP(){
    const bytes = document.getElementById('Pbytes').value;
    const processid = document.getElementById('Pid').value;
    ProcedureP(bytes,processid);
    updateMemory();
    time += 1;
}

function inputA(){
    const virDirc = document.getElementById('Adirc').value;
    const processid = document.getElementById('Aid').value;
    ProcedureA(virDirc,processid);
    updateMemory();
    time += 1;
}

function inputL(){
    const processid = document.getElementById('Lid').value;
    ProcedureL(processid);
    updateMemory();
    time += 1;
}


function addMemory() {
    for (j = 0; j < Memory.length; j++) {
        var div = document.createElement("DIV");
        div.setAttribute("id", "box" + j);
        div.classList.add("box");
        if (Memory[j] == 0) {
            div.classList.add("freeBox");
            div.innerHTML = Memory[j];
        } else {
            div.innerHTML = Memory[j];
        }
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