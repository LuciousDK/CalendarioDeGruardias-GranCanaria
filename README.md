# Calendario De Guardias - GranCanaria
Aplicación Electron para generar listado de guardias farmaceuticas en Gran Canaria.
## Descripción
La aplicación extrae los datos aporta dos del Colegio Oficial de Farmaceutios de Las Palmas(http://coflp.org/guardias/calendario.php) para generar documentos imprimibles.
## Instalacion
Ir a la carpeta donde desea guardarlo y ejecutar:
```javascript
  git clone https://github.com/LuciousDK/CalendarioDeGuardias-GranCanaria.git
  cd CalendarioDeGuardias-GranCanaria
  npm install
  npm run make
```
Una vez ejecutado `npm run make` vamos a `{carpeta del proyecto} > out > Calendario De Guardias - Gran Canaria-win32-x64`. Aquí encontraremos un ejecutable de la aplicacion: `Calendario De Guardias - Gran Canaria.exe`
Y en `out > make > {sistema operativo} > {arquitectura}` encontraremos el instalador del programa:
`Calendario De Guardias - Gran Canaria-1.0.0 Setup.exe
## Uso
Una vez iniciado el programa habrá que seleccionar la zona y opcionalmente el año, el/los meses y la carpeta destino donde se guardaran los documentos generados.
## AVISO
Los documentos generados en formato docx posiblemente se vean malformados en versiones antiguas de LibreOffice, para solucionarlo simplemente actualice LibreOffice.
