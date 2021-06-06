
//GLOBAL
let listProcess = []; // Lista de todos los proccesos
let Memory = new Array(128).fill(0); //Memoria principal dividia en paginas inicializada con 0 (Libres)
let memoryPointer = 0;
let Disk = new Array(256).fill(0); // Meoria secundaria 
let diskPointer = 0;

//Metricas
let time = 0;
let operacionesSwap = 0;

//Input
let algorithm = "FIFO";

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
        liberado: false,
        pageFaults: 0
    }

    Mconsole.innerHTML += 'P+++Cargando ' + numPages + ' Paginas  (' + bytes + ' Bytes )' +  ' del proceso ' + processid  + '<br>';
    for (i = 0; i < numPages; i++) {
        const [pFault, paginaMemoria] = loadPage(processid);
        const pagina = {
            loc: paginaMemoria,
            residencia: true,
            sTime: time,
            accTime: time
        }
        if(pFault){
            newProcces.pageFaults += 1;
        }
        newProcces.pages.push(pagina);
    }
    listProcess.push(newProcces);
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
                e.pageFaults += 1;

                Disk[e.pages[numPage].loc] = 0; //Sacar de disco
                
                const [u, paginaMemoria] = loadPage(processid); //Cargar la pagina

                e.pages[numPage].loc = paginaMemoria;
                e.pages[numPage].residencia = true;

                Mconsole.innerHTML += '~~~Pagina: ' + numPage + ' de proceso: ' + processid + ' cargada en memoria en marco: ' + e.pages[numPage].loc + '<br>';

            } else{ //Ya esta en memoria real
                time += 100;
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
            time += 100;
            Memory[i] = 0;
        }
    }
    for (i = 0; i < Disk.length; i++) {
        if (Disk[i] == processid) {
            time += 100;
            Disk[i] = 0;
        }
    }
    listProcess.forEach((e) => {
        if (e.id == processid) {
            e.eTime = time;
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
        time += 1000;
        Memory[memoryPointer] = processid
        memoryPointer += 1;
        return [false, memoryPointer - 1]
    } else {
        operacionesSwap += 1;
        return [true, ProcedureSwap(processid)];
    }
}

function ProcedureSwap(processid) {
    const [swapProc, pageID] = swapAlgo(processid);
    const marcoMemory = swapProc.pages[pageID].loc;

    //Swap Out
    time += 1000;
    swapProc.pages[pageID].loc = enterSecondary(swapProc.id);
    swapProc.pages[pageID].residencia = false;
    Mconsole.innerHTML += '------Pagina: ' + pageID + ' del proceso: ' + swapProc.id + ' cargada en disco marco: ' + swapProc.pages[pageID].loc + '<br>'

    listProcess.forEach(e => {
        if (e.id == swapProc.id) {
            e = swapProc;
        }
    });

    //Swap In
    time += 1000;
    Memory[marcoMemory] = processid;
    return marcoMemory;
}

function swapAlgo(processid) {
    let swapProc = null;
    let pageID = null;

    if (algorithm == "FIFO") {
        let minTime = Infinity;
        listProcess.forEach((procces) => {
            if (procces.id != processid) {
                procces.pages.forEach((page, index) => {
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
            console.log(swapProc);
            console.log(pageID);
            if(swapProc.id != processid && !swapProc.liberado){
                if(swapProc.pages[pageID].residencia){
                    break;
                }
            }
        } while (true)
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