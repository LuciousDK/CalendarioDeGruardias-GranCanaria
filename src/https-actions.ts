import $ from "jquery";

const URLCALENDARIO = "https://www.coflp.org/guardias/calendario.php"
const URLLEYENDA = "https://www.coflp.org/guardias/leyenda.php"

export async function getYearOptions() {

    return (await fetchCalendarioHTML()).find("#año > option")
}
export async function getZoneOptions() {

    return (await fetchCalendarioHTML()).find("#zona > option").not("#zona > option[value='default']")
}
export async function fetchCalendarioHTML(año?: string, zona?: string) {
    if (!año && !zona) {
        return $(await fetch(URLCALENDARIO).then(function (response) {
            return response.text();
        }))
    } else if (año && zona) {
        let data = new FormData();
        data.append("año", año)
        data.append("zona", zona)
        return $(`<div>${await fetch(URLCALENDARIO, { method: "POST", body: data }).then(function (response) {
            return response.text();
        })}</div>`).find("#calendar > table")
    }
}
export async function fetchLegendHTML(año: string, zona: string) {
    let data = new FormData();
    data.append("año", año)
    data.append("zona", zona)
    return $(`<div>${await fetch(URLLEYENDA, { method: "POST", body: data }).then(function (response) {
        return response.text();
    })}</div>`).find("pre")
}
