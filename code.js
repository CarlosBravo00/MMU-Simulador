
//GLOBAL
let listProcess = []; // Lista de todos los proccesos
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
        sTime: time,
        eTime: null,
        bytes: Number(bytes),
        pages: [], //Tabla de mapeo 
        liberado: false
    }

    Mconsole.innerHTML += 'P+++Cargando ' + numPages + ' Paginas  (' + bytes + ' Bytes )' +  ' del proceso ' + processid  + '<br>';
    for (i = 0; i < numPages; i++) {
        const paginaMemoria = loadPage(processid);
        const pagina = {
            loc: paginaMemoria,
            residencia: true,
            sTime: time,
            accTime: time
        }
        newProcces.pages.push(pagina);
    }
    listProcess.push(newProcces);
    console.log(listProcess);
}

function ProcedureA(vDirc, processid, modif) {

    const numPage = Math.floor(vDirc / 16);
    const extraBytes = vDirc % 16;

    Mconsole.innerHTML += 'A~~Buscando la pagina virtual: ' + numPage + ' del proceso: ' + processid + '<br>'
    listProcess.forEach((e) => {
        if (e.id == processid) {
            if (!e.pages[numPage].residencia) //No esta en memoria real
            {
                Mconsole.innerHTML += '~~~Pagina: ' + numPage + ' de proceso: ' + processid + ' esta en disco marco: ' + e.pages[numPage].loc + '<br>';

                Disk[e.pages[numPage].loc] = 0; //Sacar de disco
                diskPointer = e.pages[numPage].loc
                
                e.pages[numPage].loc = loadPage(processid); //Cargar la pagina
                e.pages[numPage].residencia = true;

                Mconsole.innerHTML += '~~~Pagina: ' + numPage + ' de proceso: ' + processid + ' cargada en memoria en marco: ' + e.pages[numPage].loc + '<br>';

            }
            const realDicc = (e.pages[numPage].loc * 16) + extraBytes;
            if(modif){
                Mconsole.innerHTML += "~~~ Pagina " + numPage + " del proceso " + processid + " modificada" + '<br>';
            }
            e.pages[numPage].accTime = time;
            Mconsole.innerHTML += "~~~ Del proceso: " + processid + " = Direaccion Virtual: " + vDirc + " Direaccion Real: " + realDicc + '<br>';
        }
    });

}

function ProcedureL(processid) {
    Mconsole.innerHTML += 'L------Liberando proceso: ' + processid + '<br>'
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
            e.pages = [];
            e.liberado = true;
        }
    });
}

function loadPage(processid) {
    let noFailure = false;
    if (Memory[memoryPointer] == 0) {
        noFailure = true;
    } else {
        for (j = 0; j < Memory.length; j++) {
            if (Memory[j] == 0) {
                memoryPointer = j
                noFailure = true;
                break;
            }
        }
    }

    if (noFailure) {
        time += 1;
        Memory[memoryPointer] = processid
        memoryPointer += 1;
        return memoryPointer - 1;
    } else {
        return ProcedureSwap(processid);
    }
}

function ProcedureSwap(processid) {
    const [swapProc, pageID] = swapAlgo(processid);
    console.log(swapProc);
    console.log(pageID);
    const marcoMemory = swapProc.pages[pageID].loc;

    swapProc.pages[pageID].loc = enterSecondary(swapProc.id);
    swapProc.pages[pageID].residencia = false;

    Mconsole.innerHTML += '------Pagina: ' + pageID + ' del proceso: ' + swapProc.id + ' cargada en disco marco: ' + swapProc.pages[pageID].loc + '<br>'

    //Cargar los cambios de el swapProc
    listProcess.forEach(e => {
        if (e.id == swapProc.id) {
            e = swapProc;
        }
    });

    Memory[marcoMemory] = processid; //Swap

    return pageID.loc;
}

function swapAlgo(processid) {
    let swapProc = null;
    let pageID = null;

    if (algorithm == "FIFO") {
        let minTime = Infinity;
        listProcess.forEach((procces) => {
            console.log(procces)
            if (procces.id != processid) {
                procces.pages.forEach((page, index) => {
                    console.log(index);
                    if (page.sTime < minTime && page.residencia) {
                        minTime = page.sTime;
                        swapProc = procces;
                        pageID = index;
                    }
                })
            }
        });
        return [swapProc, pageID];
    }

    else if (algorithm == "LRU") {
        let minTime = Infinity;
        listProcess.forEach((procces) => {
            if (procces.id != processid) {
                procces.pages.forEach((page, index) => {
                    if (page.accTime < minTime && page.residencia) {
                        minTime = page.accTime;
                        swapProc = procces;
                        pageID = index;
                    }
                })
            }
        });
        return [swapProc, pageID];
    }

    else if (algorithm == "Random") {
        do {
            swapProc = listProcess[Math.floor(Math.random() * (listProcess.length))];
            pageID = Math.floor(Math.random() * (swapProc.pages.length));
        } while (swapProc.id == processid || !swapProc.pages[pageID].residencia)
        return [swapProc, pageID];
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
        return diskPointer - 1;

    } else {
        Mconsole.innerHTML += '~~~Memoria Secundaria llena !!, libera procesos para continuar' + '<br>'
        return null;
    }

}