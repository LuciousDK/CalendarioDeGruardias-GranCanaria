import fs from "fs";
import { Dia, Farmacia, Mes } from './renderer';
import { remote } from "electron";
import $ from "jquery"
const app = remote.app;

export async function generateHTML(data: { mes: Mes, farmacias: { [codigoFarmacia: string]: Farmacia } }, directory: string, index: string, zona:string) {

    if (!fs.existsSync(`${directory}/Guardias - ${zona}`)) {
        fs.mkdir(`${directory}/Guardias - ${zona}`, (err) => {
            if (err) {
                return console.error(err);
            }
        })
    }
    let mes = data.mes;
    let legend = data.farmacias;
    if (mes.dias.length > 14) {
        let doc1 = createDocument(mes.mes, mes.dias.splice(15), legend);
        exportHTML(doc1, `${directory}/Guardias - ${zona}/${index}${mes.mes}(2)`)
        let doc2 = createDocument(mes.mes, mes.dias, legend);
        exportHTML(doc2, `${directory}/Guardias - ${zona}/${index}${mes.mes}(1)`)
    } else {
        let doc = createDocument(mes.mes, mes.dias, legend);
        exportHTML(doc, `${directory}/Guardias - ${zona}/${index}${mes.mes}`)
    }

}
function dayTableCell(day: string, rowSpan: number): HTMLElement {
    return $(`<td class="table-body-cell" rowspan="${rowSpan}">${day}</td>`).get(0)
}

function tableCell(data: string): HTMLElement {
    return $(`<td class="table-body-cell">${data}</td>`).get(0)
}
function tableRow(): HTMLElement {
    return $(`<tr></tr>`).get(0)
}
function createTable(): HTMLElement {
    return $('<table class="table"></table>').get(0)
}

function documentTitle(mes: string): HTMLElement {
    return $(`<h1 class="title">Farmacias De Guardia</br>${mes}</h1>`).get(0)
}

function createDocument(title: string, data: Dia[], legend: { [codigoFarmacia: string]: Farmacia }) {
    let doc = new Document();
    let html = $("<html></html>")
    let body = $("<body></body>")
    body.append(documentTitle(title))
    let head = $("<head></head>")
    head.append(styles())
    html.append(head, body)
    doc.append(html.get(0))

    let table = createTable();

    table.append(tableHeader())

    let tableBodyVar = tableBody();
    data.forEach((dia) => {
        let medioDia = dia.medioDia !== null
        let diaCompleto = dia.diaCompleto !== null
        if (medioDia && diaCompleto) {
            let row1 = tableRow()
            row1.append(dayTableCell(dia.dia, 2))
            row1.append(tableCell("22H"))
            row1.append(tableCell(legend[dia.medioDia].nombre))
            row1.append(tableCell(legend[dia.medioDia].direccion))
            let row2 = tableRow()
            row2.append(tableCell("24H"))
            row2.append(tableCell(legend[dia.diaCompleto].nombre))
            row2.append(tableCell(legend[dia.diaCompleto].direccion))
            tableBodyVar.append(row1)
            tableBodyVar.append(row2)
        } else
            if (!medioDia && diaCompleto) {
                let row = tableRow()
                row.append(dayTableCell(dia.dia, 1))
                row.append(tableCell("24H"))
                row.append(tableCell(legend[dia.diaCompleto].nombre))
                row.append(tableCell(legend[dia.diaCompleto].direccion))
                tableBodyVar.append(row)
            } else
                if (medioDia && !diaCompleto) {
                    let row = tableRow()
                    row.append(dayTableCell(dia.dia, 1))
                    row.append(tableCell("22H"))
                    row.append(tableCell(legend[dia.medioDia].nombre))
                    row.append(tableCell(legend[dia.medioDia].direccion))
                    tableBodyVar.append(row)
                } else
                    if (!medioDia && !diaCompleto) {
                        let row = tableRow()
                        row.append(dayTableCell(dia.dia, 1))
                        row.append(emptyTableCell())
                        row.append(emptyTableCell())
                        row.append(emptyTableCell())
                        tableBodyVar.append(row)
                    }
    })
    table.append(tableBodyVar)
    doc.body.append(table)
    return doc;
}

function exportHTML(doc: Document,directory:string) {

    fs.writeFileSync(`${directory}.html`, doc.documentElement.innerHTML);
}

function tableBody(): HTMLElement {
    return $("<tbody></tbody>").get(0)
}
function emptyTableCell(): HTMLElement {
    return $("<td class='empty-cell'></td>").get(0)
}
function tableHeader(): HTMLElement {
    return $(
        `<thead class="table-head">
    <tr>
        <th class="table-head-cell" width="4%">Día</th>
        <th class="table-head-cell" width="6%">Turno</th>
        <th class="table-head-cell" width="35%">Farmacia</th>
        <th class="table-head-cell" width="55%">Dirección</th>
    </tr>
</thead>`).get(0)
}

function styles(): HTMLElement {
    return $(`<style type="text/css">
    .title{
        text-align: center;
        font-family: Arial;
        font-size: 50px;
        line-height: 50px; 
        margin-bottom: 0px
    }
    .table{
        border-collapse: collapse;
        border: black solid 2px;
        width:100%
    }
    .table-head{
        -webkit-print-color-adjust: exact; 
        background-color: lightgray;
    }
    .table-head-cell{
        border: black solid 2px
    }
    .table-body-cell{
        border:1px solid black;
        text-align:center
    }
    .empty-cell{
        background-color: red
    }
    </style>`).get(0)
}