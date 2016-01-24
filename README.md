# ftui-weekdaytimer-widget

Widget Theme Dark

![Std_dark](https://github.com/svenson08/ftui-weekdaytimer-widget/blob/master/screenshots/dark_default.PNG?raw=true "Std_dark")


Widget Theme light

![Std_light](https://github.com/svenson08/ftui-weekdaytimer-widget/blob/master/screenshots/light_default.PNG?raw=true "Std_light")

Deaktivierter WeekdayTimer

![Std_Disabled](https://github.com/svenson08/ftui-weekdaytimer-widget/blob/master/screenshots/dark_disabled.PNG?raw=true "Std_Disabled")

Verwendet:
-----------
* JQuery: https://jquery.com/  [in fhem enthalten]
* JQuery-UI: https://jqueryui.com/  [in fhem enthalten]
* Datetimepicker:  https://github.com/xdan/datetimepicker   [in fhem-tablet-ui enthalten]
* Switchery: https://github.com/abpetkov/switchery   [in fhem-tablet-ui enthalten]

Installation
-------------
Die Datei **widget_wdtimer.js** muss in das js Verzeichnis der fhem-tablet-ui installation.
Die Datei **fhem-tablet-ui-wdtimer.css** muss in das css Verzeichnis der fhem-tablet-ui installation.
Anschließend muss die fhem-tablet-ui-wdtimer.css in der genutzten html datei eingefügt werden.
```html
<link rel="stylesheet" href="/fhem/tablet/css/fhem-tablet-ui-user.css" />
```
Alternativ kann der Inhalt der **fhem-tablet-ui-wdtimer.css** auch in die **fhem-tablet-ui-user.css** kopiert werden.
 
Attribute des weekdayTimer-Widgets
-----------
####Pflicht-Attribute:
- **data-device** : FHEM Device Name

####Optionale-Attribute:
- **data-language** : In WeekdayTimer genutzte Sprache (Standard 'de').
- **data-cmdlist='{"Anzeigetext":"FHEM Befehl","Anzeigetext":"FHEM Befehl"}'** : Variableliste der auswählbaren Aktionen.
- **data-width** : Breite des Dialogs (Standard '450').
- **data-height** : Höhe des Dialogs (Standard '300').
- **data-title** : Titel des Dialogs. Angabe ALIAS verwendet den Alias des Weekdaytimers.
                                               Angabe NAME verwendet den Namen des Weekdaytimers.
                                               Angabe eines beliebigen Dialog-Titels (Standard 'NAME').
- **data-icon** : Dialog Titel Icon (Standard 'fa-clock-o').
- **data-disablestate** : Deaktiviert die Möglichkeit den weekdaytimer zu deaktivieren/aktivieren
- **data-theme** : Angabe des Themes, möglich ist 'dark', 'light', oder beliebige eigene CSS-Klasse für individuelle Themes.
- **data-style** :Angabe 'round' oder 'square'.


Beispiel
-----------
```html
        <div id="wdtimer_ftui"
          data-type="wdtimer" 
          data-device="FHEM-DEVICE-(WeekdayTimer)"    
          data-style="square" 
          data-theme="dark" 
          data-title="NAME"  
          data-cmdlist='{"An":"on","Aus":"off","Hoch":"up"}' 
        >
        <div data-type="label" class="cell">Licht</div>
        </div> 
```        

In diesem Beispiel wird das WeekdayTimer-Popup über 
```html
  <div data-type="label" class="cell">Licht</div>
```
aufgerufen. Es kann aber auch jegliches anderes "Objekt" als Aufruf festgelegt werden.


