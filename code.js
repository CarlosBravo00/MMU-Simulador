//Archivo code.js
//

//GLOBAL
let listProcess = []; // Lista de todos los proccesos
let Memory = new Array(128).fill(0); //Memoria principal dividia en paginas inicializada con 0 (Libres)
let memoryPointer = 0; //Apuntador en memoria
let Disk = new Array(256).fill(0); // Memoria secundaria 
let diskPointer = 0; //Apuntador en disco
let algorithm = "FIFO"; //Estrategia de remplazo, Default FIFO 

//Metricas
let time = 0; //Tiempo actual
let operacionesSwap = 0; // Cuantas operaciones swap

var Mconsole = document.getElementById("console"); //Consola output

//Procedures
function ProcedureP(bytes, processid) {
    const numPages = Math.ceil(bytes / 16);
    const newProcces = { //ESTRUCTURA DE UN PROCESO
        id: processid,
        sTime: time, //Tiempo de llegada
        eTime: null, //Tiempo de salida
        bytes: Number(bytes), //Bytes requeriods
        pages: [], //Tabla de mapeo 
        liberado: false, //Si el proceso fue liberado
        pageFaults: 0 //Cantidad de page faults del proceso 
    }

    Mconsole.innerHTML += 'P+++Cargando ' + numPages + ' Paginas  ( ' + bytes + ' Bytes )' + ' del proceso ' + processid + '<br>';
    for (i = 0; i < numPages; i++) {
        const [pFault, paginaMemoria] = loadPage(processid); //Carga la pagina en memoria, regresa el marco que fue cargada
        const pagina = { //ESTRUCTURA DE UNA PAGINA
            loc: paginaMemoria, //Direccion en memoria 
            residencia: true, //True-Memoria  False-Disco
            sTime: time, //Tiempo de llegada
            accTime: time //Tiempo de ultima modificacion
        }
        if (pFault) {
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

                //Swap In
                Disk[e.pages[numPage].loc] = 0; //Sacar de disco

                const [u, paginaMemoria] = loadPage(processid); //Cargar la pagina

                e.pages[numPage].loc = paginaMemoria; //Cargar marco en loc
                e.pages[numPage].residencia = true; //Ya esta en Memoria

                Mconsole.innerHTML += '~~~Pagina: ' + numPage + ' de proceso: ' + processid + ' cargada en memoria en marco: ' + e.pages[numPage].loc + '<br>';

            } else { //Ya esta en memoria real
                time += 100; //Simple lectura
            }
            const realDicc = (e.pages[numPage].loc * 16) + extraBytes; //Calculo de direccion real, Marco * tamaño + extras

            if (modif) {
                Mconsole.innerHTML += "~~~ Pagina " + numPage + " del proceso " + processid + " modificada" + '<br>';
            }

            e.pages[numPage].accTime = time; //Actualiza que se accedio la pagina 
            Mconsole.innerHTML += "~~~ Del proceso: " + processid + " = Direaccion Virtual: " + vDirc + " - Direaccion Real: " + realDicc + '<br>';
        }
    });

}

function ProcedureL(processid) {
    Mconsole.innerHTML += 'L------Liberando proceso: ' + processid + '<br>'
    for (i = 0; i < Memory.length; i++) { //Liberar Memoria
        if (Memory[i] == processid) {
            time += 100;
            Memory[i] = 0;
        }
    }
    for (i = 0; i < Disk.length; i++) { //Liberar Disco
        if (Disk[i] == processid) {
            time += 100;
            Disk[i] = 0;
        }
    }
    listProcess.forEach((e) => { //Terminar el proceso
        if (e.id == processid) {
            e.eTime = time;
            e.pages = [];
            e.liberado = true;
        }
    });
}

//Cargar una pagina del *procceso a memoria, regresar que marco uso de memoria
function loadPage(processid) {
    let noFailure = false;
    if (Memory[memoryPointer] == 0) { //Buscar si el MemoryPointer actual esta vacio, para prioritizar cargar marcos continuos 
        noFailure = true;
    } else {
        for (j = 0; j < Memory.length; j++) { //Hacer una busqueda de algun lugar vacio
            if (Memory[j] == 0) {
                memoryPointer = j
                noFailure = true;
                break;
            }
        }
    }

    if (noFailure) {//Si se encontro se registra que el marco lo tiene el proccess id
        time += 1000;
        Memory[memoryPointer] = processid
        memoryPointer += 1;
        return [false, memoryPointer - 1]
    } else { //La memoria real esta llena se neceista hacer un swap
        operacionesSwap += 1;
        Mconsole.innerHTML += "~~~ Memoria Llena" + '<br>';
        return [true, ProcedureSwap(processid)]; //Funcion de swap
    }
}

function ProcedureSwap(processid) {
    const [swapProc, pageID] = swapAlgo(processid);//Buscar que marco vamos a remplazar dado el algoritmo de remplazo
    const marcoMemory = swapProc.pages[pageID].loc;

    //Swap Out
    time += 1000;
    swapProc.pages[pageID].loc = enterSecondary(swapProc.id); //Entrar en memoria secundaria
    swapProc.pages[pageID].residencia = false; //Esta pagina ya no se encuentra en memoria secundaria
    Mconsole.innerHTML += '---------Pagina: ' + pageID + ' del proceso: ' + swapProc.id + ' cargada en disco marco: ' + swapProc.pages[pageID].loc + '<br>'

    //Actualizar el proceso
    listProcess.forEach(e => {
        if (e.id == swapProc.id) {
            e = swapProc;
        }
    });

    //Swap In
    time += 1000;
    Memory[marcoMemory] = processid; //Cargamos el nuevo proceso en memoria
    return marcoMemory;
}

//Decide que pagina va remplazar depende del algoritmo seleccionado
function swapAlgo(processid) {
    let swapProc = null;
    let pageID = null;

    if (algorithm == "FIFO") { //First Comes first Serves
        let minTime = Infinity;
        listProcess.forEach((procces) => {
            procces.pages.forEach((page, index) => {
                if (page.sTime < minTime && page.residencia) { //La pagina con tiempo de entrada mas viejo
                    minTime = page.sTime;
                    swapProc = procces;
                    pageID = index;
                }
            })
        });
        return [swapProc, pageID];
    }

    else if (algorithm == "LRU") { //Least Recently Used
        let minTime = Infinity;
        listProcess.forEach((procces) => {
            procces.pages.forEach((page, index) => {
                if (page.accTime < minTime && page.residencia) { //La pagina con tiempo de ultima vez accedido mas viejo
                    minTime = page.accTime;
                    swapProc = procces;
                    pageID = index;
                }
            })
        });
        return [swapProc, pageID];
    }

    else if (algorithm == "Random") { //Random cualquier pagina de cualquier proceso
        do {
            swapProc = listProcess[Math.floor(Math.random() * (listProcess.length))];
            pageID = Math.floor(Math.random() * (swapProc.pages.length));
            if (swapProc.id != processid && !swapProc.liberado) {
                if (swapProc.pages[pageID].residencia) {
                    break;
                }
            }
        } while (true)
        return [swapProc, pageID];
    }
}

//Funcion para meter una pagina a memoria secundaria 
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