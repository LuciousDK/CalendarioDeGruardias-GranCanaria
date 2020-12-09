
import './index.css'; import $ from "jquery";
import * as httpActions from "./https-actions";
import * as pdfGenerator from "./pdf-generator";
import { remote, ipcRenderer, dialog } from "electron"
const app = remote.app
$("#zona").on("change", () => {
    $("#error-message").css("display", "none")
})
if (localStorage.getItem("directory") === null)
    $("#carpeta-input").val(app.getPath("downloads"))
else
   $("#carpeta-input").val(localStorage.getItem("directory"))


$("#carpeta-button").on("click", () => {
    ipcRenderer.send('selectDirectory');
})
ipcRenderer.on("directorySelected", (event, message) => {
    $("#carpeta-input").val(message)
    localStorage.setItem("directory", message)
})

async function setOptions() {
    let years = await httpActions.getYearOptions()
    $("#año").append(years)
    let zones = await httpActions.getZoneOptions()
    $("#zona").append(zones)
    $("#form-box").removeClass("hidden")
    $("#loading-overlay").addClass("hidden")
}

setOptions()

$("#descargar").on("click", async (event) => {
    event.preventDefault();

    if (validate()) {
        let directory: string = $("#carpeta-input").val().toString();
        let months: Mes[] = separateData(
            (await httpActions.fetchCalendarioHTML(
                $("#año").val().toString(), $("#zona").val().toString())))
        let pharmacies: { [codigoFarmacia: string]: Farmacia; } = {}
        let legend = (await httpActions.fetchLegendHTML($("#año").val().toString(), $("#zona").val().toString()))
        legend.each((index, element) => {
            let titularHTML = $(element).find(".titular").html();
            let codigoFarmacia = titularHTML.split("&nbsp;")[0].split(" ")[titularHTML.split("&nbsp;")[0].split(" ").length - 1]
            let titular = titularHTML.split("&nbsp;")[titularHTML.split("&nbsp;").length - 1]
            let direccion = $(element).find(".direction").text().trim()
            direccion = direccion.slice(1, direccion.length - 1)
            pharmacies[codigoFarmacia] = { codigo: codigoFarmacia, nombre: titular, direccion: direccion }
        })
        try {

            localStorage.setItem("directory", directory)
            if ($("#mes").val() != "0") {
                let data: DataStructure = {
                    mes: months[Number.parseInt($("#mes").val().toString()) - 1],
                    farmacias: pharmacies
                }
                pdfGenerator.generateDocx(data, directory, Number.parseInt($("#mes").val().toString()) + " - ")
            } else {
                months.forEach((month, index) => {
                    let data: DataStructure = {
                        mes: month,
                        farmacias: pharmacies
                    }
                    pdfGenerator.generateDocx(data, directory, `${index + 1} - `);
                })
            }
        } catch (error) {
            ipcRenderer.send("error", error)
        } finally {
            ipcRenderer.send("download-completed")
        }
    }
})

function validate(): boolean {
    if ($("#zona").val() == null) {
        $("#error-message").css("display", "block")
        return false;
    } else
        return true;
}

function separateData(tables: JQuery<HTMLElement>): Mes[] {
    let data: Mes[] = []
    tables.each((index, table) => {
        let title = $(table).find(".title").html()
        let days: Dia[] = [];
        $(table).find("tbody > tr:not(:first-child) > td:not([class='filler'])")
            .each((index, td) => {
                let dayNumber = $(td).find("p[class='primer']").text().trim();
                let halfDay = null;
                if ($(td).find("p[class='second']").text().trim() != "") {
                    halfDay = $(td).find("p[class='second']").text().trim()
                }
                let fullDay = null;
                if ($(td).find("p[class='third']").text().trim() != "") {
                    fullDay = $(td).find("p[class='third']").text().trim()
                }
                days.push({ dia: dayNumber, medioDia: halfDay, diaCompleto: fullDay })
            })
        data.push({ mes: title, dias: days })
    })
    return data;
}

export class Mes {
    mes: string;
    dias: Dia[];
}

export class Dia {
    dia: string;
    medioDia: string;
    diaCompleto: string;
}

export class Farmacia {
    codigo: string;
    nombre?: string;
    direccion?: string;
}

export class DataStructure {
    farmacias: { [codigoFarmacia: string]: Farmacia; }
    mes: Mes;
}