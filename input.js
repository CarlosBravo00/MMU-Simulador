addMemory();
addDisk();

function inputP() {
    document.getElementById("algor").disabled = true;

    const bytes = document.getElementById('Pbytes').value;
    const processid = document.getElementById('Pid').value;
    ProcedureP(bytes, processid);
    time += 1;
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
    ProcedureA(virDirc, processid, modificar);

    console.log(modificar);
    time += 1;
    document.getElementById('Adirc').value = null;
    document.getElementById('Aid').value = null;
    document.getElementById('Amod').checked = false;

    updateMemory();
    updateDisk();
}

function inputL() {
    document.getElementById("algor").disabled = true;

    const processid = document.getElementById('Lid').value;
    ProcedureL(processid);
    time += 1;
    document.getElementById('Lid').value = null;

    updateMemory();
    updateDisk();
}

function restart() {
    location.reload();
}

function algortPick() {
    document.getElementById("algor").disabled = true;
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