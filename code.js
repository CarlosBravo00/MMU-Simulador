
//GLOBAL
const listProcess = []; // Lista de todos los proccesos
const Memory = new Array(128).fill(0); //Memoria principal dividia en paginas inicializada con 0 (Libres)
let memoryPointer = 0;
const Disk = new Array(256).fill(0); // Meoria secundaria 
let diskPointer = 0;
let time = 0; // Metricas 

let algorithm = "FIFO"

var Mconsole = document.getElementById("console");

//Procedures
function ProcedureP(bytes, processid) {
    const numPages = Math.ceil(bytes / 16);
    const newProcces = {
        id: processid,
        time: time,
        accTime: time,
        bytes: bytes,
        pages: [], //Tabla de mapeo 
        offMemory: false
    }

    console.log('---Cargando', numPages, 'Paginas del proceso', processid);
    Mconsole.innerHTML += '---Cargando ' + numPages + ' Paginas del proceso ' + processid + '<br>';
    for (i = 0; i < numPages; i++) {
        newProcces.pages.push(loadPage(processid));
    }
    listProcess.push(newProcces);
    console.log(processid, newProcces.pages);
}

function ProcedureA(vDirc, processid, modif) {

    const numPage = Math.floor(vDirc / 16);
    const extraBytes = vDirc % 16;

    console.log('---Buscando la pagina virtual:', numPage, 'del proceso:', processid)
    listProcess.forEach((e) => {
        if (e.id == processid) {
            if (modif) {
                e.accTime = time;
            }
            if (e.pages[numPage] < 0) {

                console.log('Pagina:', numPage, 'de proceso:', processid, 'esta en disco marco:', Math.abs(e.pages[numPage]) - 1);
                Mconsole.innerHTML += 'Pagina: ' + numPage + ' de proceso: ' + processid + ' esta en disco marco: ' + (Math.abs(e.pages[numPage]) - 1) + '<br>';

                Disk[Math.abs(e.pages[numPage]) - 1] = 0;
                e.pages[numPage] = loadPage(processid);
                e.offMemory = false;

                console.log('Pagina:', numPage, 'de proceso:', processid, 'cargada en memoria en marco:', e.pages[numPage]);
                Mconsole.innerHTML += 'Pagina: ' + numPage + ' de proceso: ' + processid + ' cargada en memoria en marco: ' + e.pages[numPage] + '<br>';

            }
            const realDicc = (e.pages[numPage] * 16) + extraBytes;
            console.log("Direaccion Virtual", vDirc, "Direaccion Real", realDicc);
            Mconsole.innerHTML += " Direaccion Virtual " + vDirc + " Direaccion Real " + realDicc + '<br>';
        }
    });

}

function ProcedureL(processid) {
    console.log('--- Liberado proceso:', processid)
    Mconsole.innerHTML += '--- Liberado proceso: ' + processid + '<br>'
    for (i = 0; i < Memory.length; i++) {
        if (Memory[i] == processid) {
            Memory[i] = 0;
        }
    }
    for (i = 0; i < Disk.length; i++) {
        if (Disk[i] == processid) {
            Disk[i] = 0;
        }
    }
    listProcess.forEach((e) => {
        if (e.id == processid) {
            e.offMemory = true;
            e.pages = [];
        }
    });
}

function loadPage(processid) {
    let noFailure = false;
    if (Memory[memoryPointer] == 0) {
        noFailure = true;
    } else {
        //Ver si encontramos un 0
        for (j = 0; j < Memory.length; j++) {
            if (Memory[j] == 0) {
                memoryPointer = j
                noFailure = true;
                break;
            }
        }
    }

    if (noFailure) {
        Memory[memoryPointer] = processid
        memoryPointer += 1;
        return memoryPointer - 1;
    } else {
        return ProcedureSwap(processid);
    }
}

function ProcedureSwap(processid) {
    let swapProc = swapAlgo(processid);

    let selectedPage;
    for (j = 0; j < swapProc.pages.length; j++) {
        if (swapProc.pages[j] >= 0) {
            selectedPage = swapProc.pages[j];
            Memory[selectedPage] = processid;
            swapProc.pages[j] = enterSecondary(swapProc.id);

            console.log('Pagina:', j, 'del proceso:', swapProc.id, 'cargada en disco marco:', Math.abs(swapProc.pages[j]) - 1)
            Mconsole.innerHTML += '+ Pagina: ' + j + ' del proceso: ' + swapProc.id + ' cargada en disco marco: ' + (Math.abs(swapProc.pages[j]) - 1) + '<br>'

            break;
        }
    }

    //Checar si ya esta offMemory el proceso swapProc
    let allOnDisk = true;
    for (j = 0; j < swapProc.pages.length; j++) {
        if (swapProc.pages[j] >= 0) {
            allOnDisk = false;
            break;
        }
    }
    swapProc.offMemory = allOnDisk;

    //Cargar los cambios de el swapProc
    listProcess.forEach(e => {
        if (e.id == swapProc.id) {
            e = swapProc;
        }
    });

    return selectedPage;
}

function swapAlgo(processid) {
    let swapProc = null;
    if (algorithm == "FIFO") {
        let minTime = Infinity;
        listProcess.forEach(e => {
            if (e.time < minTime && !e.offMemory && e.id != processid) {
                minTime = e.time;
                swapProc = e;
            }
        });
        return swapProc
    }

    else if (algorithm == "LRU") {
        let minTime = Infinity;
        listProcess.forEach(e => {
            if (e.accTime < minTime && !e.offMemory && e.id != processid) {
                minTime = e.time;
                swapProc = e;
            }
        });
        return swapProc
    }

    else if (algorithm == "Random") {
        console.log(listProcess.length);
        do {
            swapProc = Math.floor(Math.random() * (listProcess.length))
        } while (swapProc == processid)
        console.log(swapProc);
        return listProcess[swapProc]
    }
}

function enterSecondary(processid) {
    let found = false;
    if (Disk[diskPointer] == 0) {
        found = true;
    } else {
        for (j = 0; j < Disk.length; j++) {
            if (Disk[j] == 0) {
                diskPointer = j
                found = true;
                break;
            }
        }
    }

    if (found) {
        Disk[diskPointer] = processid;
        diskPointer += 1;
        return -diskPointer;

    } else {
        console.log('Memoria Secundaria llena !!, libera procesos para continuar')
        Mconsole.innerHTML += 'Memoria Secundaria llena !!, libera procesos para continuar' + '<br>'
        return -Infinity;
    }

}