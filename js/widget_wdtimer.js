/* 

TODO's :
Profil soll sunrise/sunset unterstützen
    
----------------------------------------------------------------------------
Version 1.0

WeekdayTimer Widget für fhem-tablet-ui (https://github.com/knowthelist/fhem-tablet-ui)
Basiert auf der Idee des UZSU Widgets für Samrtviso von mworion (https://github.com/mworion/uzsu_widget)

Darstellung der WeekdayTimer Profile in Form eine Liste mit der Angabe von Aktionsbefehl, Zeitpunkt, Wochentage
über die fhem-tablet-ui.

!!! In dieser Version wird weder SUNRISE noch SUNSET unterstützt !!!

(c) Sascha Hermann 2016

Verwendet:
JQuery: https://jquery.com/  [in fhem enthalten]
JQuery-UI: https://jqueryui.com/  [in fhem enthalten]
Datetimepicker:  https://github.com/xdan/datetimepicker   [in fhem-tablet-ui enthalten]
Switchery: https://github.com/abpetkov/switchery   [in fhem-tablet-ui enthalten]
----------------------------------------------------------------------------

ATTRIBUTE:
~~~~~~~~~~
    Attribute (Pflicht):
    ---------------
    data-type="wdtimer" : Widget-Typ
    data-device : FHEM Device Name

    Attribute (Optional):
    -----------------
    data-language : In WeekdayTimer genutzte Sprache (Standard 'de').
    data-cmdlist='{"<Anzeigetext>":"<FHEM Befehl>","<Anzeigetext>":"<FHEM Befehl>"}' : Variableliste der auswählbaren Aktionen.
    data-sortcmdlist: MANUELL, WERT, TEXT. Sortierung der Befehlliste kann bestimmt werden (Standard ist an (TEXT)). Bei verwendung von MANUELL
                               muss data-cmdlist angegeben werden!
    data-width: Breite des Dialogs (Standard '450').
    data-height: Höhe des Dialogs (Standard '300').
    data-title: Titel des Dialogs. Angabe ALIAS verwendet den Alias des Weekdaytimers.
                                               Angabe NAME verwendet den Namen des Weekdaytimers.
                                               Angabe eines beliebigen Dialog-Titels (Standard 'NAME').
    data-icon: Dialog Titel Icon (Standard 'fa-clock-o').
    data-disablestate: Deaktiviert die Möglichkeit den weekdaytimer zu deaktivieren/aktivieren
    data-theme: Angabe des Themes, mögich ist 'dark', 'light', oder beliebige eigene CSS-Klasse für individuelle Themes.
    data-style: Angabe 'round' oder 'square'.
	data-savecfg: Speichern der Änderungen in der fhem.cfg (Standard 'false).
    
localStore:
~~~~~~~~~    
    
Name: wdtimer_<FHEM_Device_Name>
 ~~~~~~~~~~~~~ PROFIL ~~~~~~~~~~~~~
    (0)[Profile]
        (0..n)[Profil-Liste]
            (0)[ Wochentage]
                (0)[ So (true/false) ]
                (1)[ Mo (true/false) ]
                (2)[ Di (true/false) ]
                (3)[ Mi (true/false) ]
                (4)[ Do (true/false) ]
                (5)[ Fr (true/false) ]
                (6)[ Sa (true/false) ]
            (1)[ Uhrzeit ]
            (2)[ FHEM Befehl]
            (3)[ Profil Status (true/false)]   -> False markiert dass das Profil gelöscht wird
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~    
 ~~~~~~~~~~~~~ Befehlliste ~~~~~~~~~~
    (1)[Befehlliste]
        (0..n)[Befehl-Liste] -> Befehl-Dropdown Inhalt
            (0)[Anzeige-Text]
            (1)[FHEM Befehl]
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   
 ~~~~~~~~~~~ Konfiguration ~~~~~~~~~~
    (2)[Konfiguration]
        (0)[Name]
        (1)[Device]
        (2)[Sprache]
        (3)[Disable-Status] (true=Enabled aktiv, false=Disabled deaktivert)
        (4)[Dialogs Titel]
        (5)[Command]        
        (6)[Condition]      
        (7)[Disable Status-Change] (true = Funktion gesperrt, false = Funktion freigegeben)
        (8)[Theme-Class] 
        (9)[Style]
		(10) [savecfg] (true=autom. speichern, false=fhem.cfg wird nicht gespeichert)
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

if(typeof widget_widget == 'undefined') {
    loadplugin('widget_widget');
}

if (!$.fn.datetimepicker){
    dynamicload('lib/jquery.datetimepicker.js', null, null, false);
    $('head').append('<link rel="stylesheet" href="'+ dir + '/../lib/jquery.datetimepicker.css" type="text/css" />');    
}
if (!$.fn.Switchery){
    dynamicload('lib/switchery.min.js', null, null, false);
    $('head').append('<link rel="stylesheet" href="'+ dir + '/../lib/switchery.min.css" type="text/css" />');
}
if (!$.fn.draggable){
    dynamicload('../pgm2/jquery-ui.min.js', null, null, false);
}
var widget_wdtimer = $.extend({}, widget_widget, {
    widgetname:"wdtimer",    
    wdtimer_multiArrayindexOf: function(arr, val) {
        var result = -1;        
        for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < arr[i].length; j++) {
                if(arr[i][j] == val) {
                    result = i;
                    break;
               }
           }
        } 
        return result;
    },     
    wdtimer_ColorLuminance: function(hex, lum) {
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }
        return rgb;
    },   
    wdtimer_showDialog: function(elem,device) { //Erstellen des Dialogs und öffnen des Dialogs
        var base = this;
        var config = new Array();
        
        config = widget_wdtimer.wdtimer_loadLocal(device);          
        elem.append(widget_wdtimer.wdtimer_buildwdtimer(config, device));      
                                    
        wdtimer_dialog = $( ".wdtimer_dialog" ).dialog({
            height: elem.data('height'),
            width: elem.data('width'),
            autoOpen: false,
            modal: true,
            resizable: true, 
            draggable: false, 
            closeOnEscape: false,
            dialogClass: "wdtimer "+"wdtimer_"+device, 
            title: config[2][4],
            buttons: {
                "Hinzufügen": function(){                        
                    base.wdtimer_addProfile( $('.wdtimer_'+device), device );
                },
                "Speichern": function(){
                    var canClose = base.wdtimer_saveProfile( $('.wdtimer_'+device), device );
                    if (canClose == true) {
                        wdtimer_dialog.dialog( "close" );
                        $('.wdtimer_'+device).remove();
                        $('.wdtimer_datetimepicker_'+device).each(function(){ $(this).remove(); });
                        elem.children('.wdtimer_dialog').remove();  
                    }
                },
                "Abbrechen": function() {
                    wdtimer_dialog.dialog( "close" );
                    $('.wdtimer_'+device).remove();                    
                    $('.wdtimer_datetimepicker_'+device).each(function(){ $(this).remove(); });
                    elem.children('.wdtimer_dialog').remove();                  
                }
            },
            create: function (e, ui) {
                var pane = $('.wdtimer_'+device).find(".ui-dialog-buttonpane")
                if (config[2][3] == true) { var wdtimer_status = "checked"; } else { var wdtimer_status = ""; } 
                $("<div class='wdtimer_active ' ><input style='visibility: visible;' type='checkbox' class='js-switch' "+wdtimer_status+"/></div>").prependTo(pane);                
                $('.wdtimer_'+device).find('.ui-dialog-titlebar-close').remove();                
            }, 
            open: function () {
                $(this).parent().children(".ui-dialog-titlebar").prepend('<i class="wdtimer_header_icon fa oa '+elem.data('icon')+'"></i>');
                base.wdtimer_setStatusChangeAction($('.wdtimer_'+device),config[2][3]);
            },
        });        
        // Benötige Klassen ergänzen
        $( ".wdtimer" ).children('.ui-dialog-titlebar').addClass('wdtimer_header '+config[2][8]+" "+config[2][9]);            
        $( ".wdtimer" ).children('.ui-dialog-buttonpane').addClass('wdtimer_footer '+config[2][8]+" "+config[2][9]); 
        $( ".wdtimer" ).find('.ui-dialog-buttonset > .ui-button').addClass('wdtimer_button '+config[2][8]+" "+config[2][9]);
        //-----------------------------------------------          
        //Verwendete Plugins aktivieren
        base.wdtimer_setDateTimePicker($('.wdtimer_'+device), device,config[2][9]); //DateTimePicker Plugin zuweisen
        base.wdtimer_setTimerStatusSwitch($('.js-switch'),config[2][7]); //Status Switch
        //-----------------------------------------------                     
        // Aktionen zuweisen
        base.wdtimer_setDeleteAction($('.wdtimer_'+device), device); //Löschen-Schalter Aktion        
        $('.wdtimer_'+device).on("change", ".wdtimer_active", function () {
            base.wdtimer_setStatusChangeAction($('.wdtimer_'+device),  $(this).children('input').prop('checked')); //WeekdayTimer aktivieren/deaktivieren
        });
        //-----------------------------------------------             
        wdtimer_dialog.dialog( "open" );
        $( "body" ).find('.ui-widget-overlay').addClass('wdtimer_shader');     
    },
    wdtimer_buildwdtimercmddropdown: function(cmds, selectedval, theme,style) {
        var result = "";
        
        result += "<select class='wdtimer_cmd "+theme+" "+style+"' name='wdtimer_cmd'>";
        for (var i = 0; i < cmds.length; i++) {            
            if (cmds[i][1] === selectedval) { result += "<option value='"+i+"' selected>"+cmds[i][0]+"</option>"; }
            else { result += "<option value='"+i+"'>"+cmds[i][0]+"</option>"; }
        }
        result += "</select>";        
        return result;        
    },     
    wdtimer_buildprofile: function(profile, cmds, id, theme, style) {
        var result = "";
        
        result += "<div data-profile='"+id+"' id='profile"+id+"' class='wdtimer_profile row align-center'>" +
                        "   <div class='wdtimer_profilecmd cell inline input-control text'>";
        result += widget_wdtimer.wdtimer_buildwdtimercmddropdown(cmds, profile[2], theme, style); 
        result += "   </div>" +
                        "   <div class='wdtimer_profiletime cell inline input-control text'>" +
                        "       <input class='wdtimer_time "+theme+" "+style+"' type='text' style='visibility: visible;' value='"+profile[1]+"'>" +
                        "   </div>" +
                        "   <div class='wdtimer_profileweekdays inline'>" +
                        "       <div class='wdtimer_checkbox begin "+theme+" "+style+"'><input type='checkbox' id='checkbox_mo-reihe"+id+"' "+widget_wdtimer.wdtimer_getCheckedString(profile[0][1])+"/><label class='begin' for='checkbox_mo-reihe"+id+"'>Mo</label></div>"+
                        "       <div class='wdtimer_checkbox "+theme+" "+style+"'><input type='checkbox' id='checkbox_di-reihe"+id+"' "+widget_wdtimer.wdtimer_getCheckedString(profile[0][2])+"/><label for='checkbox_di-reihe"+id+"'>Di</label></div>"+
                        "       <div class='wdtimer_checkbox "+theme+" "+style+"'><input type='checkbox' id='checkbox_mi-reihe"+id+"' "+widget_wdtimer.wdtimer_getCheckedString(profile[0][3])+"/><label for='checkbox_mi-reihe"+id+"'>Mi</label></div>"+
                        "       <div class='wdtimer_checkbox "+theme+" "+style+"'><input type='checkbox' id='checkbox_do-reihe"+id+"' "+widget_wdtimer.wdtimer_getCheckedString(profile[0][4])+"/><label for='checkbox_do-reihe"+id+"'>Do</label></div>"+
                        "       <div class='wdtimer_checkbox "+theme+" "+style+"'><input type='checkbox' id='checkbox_fr-reihe"+id+"' "+widget_wdtimer.wdtimer_getCheckedString(profile[0][5])+"/><label for='checkbox_fr-reihe"+id+"'>Fr</label></div>"+
                        "       <div class='wdtimer_checkbox "+theme+" "+style+"'><input type='checkbox' id='checkbox_sa-reihe"+id+"' "+widget_wdtimer.wdtimer_getCheckedString(profile[0][6])+"/><label for='checkbox_sa-reihe"+id+"'>Sa</label></div>"+
                        "       <div class='wdtimer_checkbox end "+theme+" "+style+"'><input type='checkbox' id='checkbox_so-reihe"+id+"' "+widget_wdtimer.wdtimer_getCheckedString(profile[0][0])+"/><label class='end' for='checkbox_so-reihe"+id+"'>So</label></div>"+
                        "   </div>"+
                        "   <div class='wdtimer_delprofile cell inline'><button data-profile='"+id+"' id='delprofile"+id+"' class='fa fa-trash-o wdtimer_deleteprofile wdtimer_button "+theme+" "+style+"' type='button'></button></div>" +
                        "</div>";                 
         return result;          
    },   
    wdtimer_buildwdtimer: function(config,device) {
        var result = "";        
        result += 	"<div class='wdtimer_dialog "+config[2][8]+"'>"+
                        "   <div class='wdtimer_profilelist'>";       
        for (var i = 0; i < config[0].length; i++) {
            result += widget_wdtimer.wdtimer_buildprofile(config[0][i],config[1],i,config[2][8],config[2][9]);
        }       
        result += 	"   </div>"+
                    "</div>";
                    return result;
    },
    wdtimer_deleteProfile: function(elem, device) {
        var config = new Array();
        var currProfile = elem.data('profile');
            
        config = widget_wdtimer.wdtimer_loadLocal(device);
        config[0][currProfile][3] = false;             
        elem.parent().parent().remove();        
        widget_wdtimer.wdtimer_saveLocal(config);
    },
    wdtimer_addProfile: function(elem, device) {
        var config = new Array();
        var newprofile = new Array();
        var profile_weekdays  = new Array(true,true,true,true,true,true,true);
        config = widget_wdtimer.wdtimer_loadLocal(device);       
        newprofile.push(profile_weekdays, "20:00", config[1][0][1], true);
        config[0].push(newprofile);
        var profile_row = widget_wdtimer.wdtimer_buildprofile(config[0][config[0].length-1],config[1],config[0].length-1,config[2][8],config[2][9]);       

        $('.wdtimer_'+device).find('.wdtimer_profilelist').append(profile_row);
        
        widget_wdtimer.wdtimer_setDeleteAction($('.wdtimer_'+device), config[2][0]); //Löschen-Schalter Aktion zuweisen      
        widget_wdtimer.wdtimer_setDateTimePicker($('.wdtimer_'+device), config[2][0],config[2][9]); //DateTimePicker Plugin zuweisen zuweisen              
        widget_wdtimer.wdtimer_saveLocal(config); //Aktuelle Profile lokal speichern
    },            
    wdtimer_saveProfile: function(elem, device) { /*Ändert das DEF des WeekdayTimers und/oder ändert den Disable-Status des WeekdayTimers */
        var arr_config = new Array();
        var cmd = "";
        var wdtimer_state = true;
		var saveconfig = false; //Flag ob die Konfiguration gespeichert werden müsste (abhängig vom Parameter)
        arr_config = widget_wdtimer.wdtimer_loadLocal(device);   
 
        wdtimer_state = elem.find('.js-switch').prop('checked');   
        if (wdtimer_state != arr_config[2][3]) {
            //Geänderten Status setzen
            if (wdtimer_state == true) {cmd = "set "+device+" enable";} 
           else { cmd = "set "+device+" disable";}
           ftui.log(1,"Status wird geändert '"+cmd+"'  ["+device+"]");

            setFhemStatus(cmd);			
            if( device && typeof device != "undefined" && device !== " ") {
                    ftui.toast(cmd);
            }
            saveconfig = true;
            //--------------------------------------------------
            //Aktuelle Einstellungen/Profile in localStore schreiben    
            arr_config[2][3] = wdtimer_state;
            widget_wdtimer.wdtimer_saveLocal(arr_config); 
            //--------------------------------------------------
        }  

        if (wdtimer_state == true) {
            //Aktuelle Profile ermitteln und setzen
            arr_currentProfilesResult = widget_wdtimer.wdtimer_getCurrentProfiles($('.wdtimer_'+device),arr_config[1]);
            if (arr_currentProfilesResult[0] == false) { //Profile enthalten keine Fehler
                var arr_newconfig = new Array();
                arr_newconfig.push(arr_currentProfilesResult[1], arr_config[1], arr_config[2], arr_config[3]);
                            
                //Aktualisiertes define setzen     
                cmd = "defmod "+device+" WeekdayTimer "+arr_newconfig[2][1]+" "+arr_newconfig[2][2]+" ";       
                for (var i = 0; i < arr_newconfig[0].length; i++) {
                   if (arr_newconfig[0][i][3] == true) { cmd += widget_wdtimer.wdtimer_getWeekdaysNum( arr_newconfig[0][i][0] )+'|'+arr_newconfig[0][i][1]+'|'+arr_newconfig[0][i][2]+' '; }
                }            
                cmd += arr_newconfig[2][5]+' '+arr_newconfig[2][6];
                ftui.log(1,"Define wird geändert '"+cmd+"'  ["+device+"]");
                
                setFhemStatus(cmd.trim());
                if( device && typeof device != "undefined" && device !== " ") {
                    ftui.toast(cmd);
                }               
                saveconfig = true;
            } else { //Mind. ein Profile enthält einen Fehler
                alert('Einstellungen konnten nicht übernommen werden');
                return false;
            }            
            //--------------------------------------------------
            //Aktuelle Einstellungen/Profile in localStore schreiben    
            widget_wdtimer.wdtimer_saveLocal(arr_newconfig); 
            //--------------------------------------------------  
        }
		if(saveconfig && arr_config[2][10] == true) {
			setFhemStatus("save");
		}
        return true;
    },
    wdtimer_saveLocal: function(config) {
        var dataToStore = JSON.stringify(config);
        localStorage.setItem(this.widgetname+"_"+config[2][0], dataToStore);
    },    
    wdtimer_loadLocal: function(device) {        
        var dataFromStore = new Array();
        dataFromStore = JSON.parse(localStorage.getItem(this.widgetname+"_"+device));        
        return dataFromStore;
    },         
    wdtimer_setStatusChangeAction: function(elem,wdtimer_enabled){
            if (wdtimer_enabled == false) { 
                elem.children('.wdtimer_dialog').append('<div class="ui-widget-overlay ui-front wdtimer_shader wdtimer_profilelist" style="z-index: 5999; top: '+elem.children('.wdtimer_dialog').position().top+'px; height: '+elem.children('.wdtimer_dialog').height()+'px;      "></div>'); 
                elem.find('.ui-dialog-buttonset').children().eq(0).hide();
            }
            else { 
                elem.children('.wdtimer_dialog').children('.wdtimer_shader').remove(); 
                elem.find('.ui-dialog-buttonset').children().eq(0).show();           
            }
    },
    wdtimer_setDeleteAction: function(elem,device) {
        elem.find('.wdtimer_deleteprofile').each(function(){       
            $(this).on('click', function(event) {
                widget_wdtimer.wdtimer_deleteProfile( $(this), device );
            });
        });        
    },            
    wdtimer_setDateTimePicker: function(elem,device,style) {      
        elem.find('.wdtimer_time').each(function(){     
            if (style != 'dark' ) {var dtp_style = 'default';} else {var dtp_style ='dark'; }
            $(this).datetimepicker({
                step:5, 
                lang: 'de',
                theme: dtp_style,
                format: 'H:i',
                timepicker: true,
                datepicker: false,     
                className:  "wdtimer_datetimepicker "+"wdtimer_datetimepicker_"+device, 
            });           
        });        
    },         
    wdtimer_setTimerStatusSwitch: function(elem,disablestate) { 
         var switchery = new Switchery(elem[0], {
            size: 'small',
            color : '#00b33c',
            secondaryColor: '#ff4d4d',
            className : 'switchery wdtimer_active_checkbox',
            disabled: disablestate,
         });   
    },    
    wdtimer_getCheckedString :function(val) {
        var result = "";
        if (val == true) {result = "checked";}        
        return result;
    },       
    wdtimer_getWeekdays: function (weekdays) {
        var result = new Array();
        var weekday_su = false;
        var weekday_mo = false;
        var weekday_tu = false;
        var weekday_we = false;
        var weekday_th = false;
        var weekday_fr = false;
        var weekday_sa = false;
        if (weekdays.indexOf('0')  > -1 || weekdays.indexOf('so')  > -1   || weekdays.indexOf('su')  > -1  || weekdays.indexOf('di')  > -1  || weekdays.indexOf('$we')  > -1) { weekday_su = true; } else { weekday_su = false; }
        if (weekdays.indexOf('1')  > -1 || weekdays.indexOf('mo')  > -1 || weekdays.indexOf('mo')  > -1 || weekdays.indexOf('lu')  > -1  || weekdays.indexOf('!$we')  > -1) { weekday_mo = true; } else { weekday_mo = false; }
        if (weekdays.indexOf('2')  > -1 || weekdays.indexOf('di')  > -1  || weekdays.indexOf('tu')  > -1    || weekdays.indexOf('ma')  > -1 || weekdays.indexOf('!$we')  > -1) { weekday_tu = true; } else { weekday_tu = false; }  
        if (weekdays.indexOf('3')  > -1 || weekdays.indexOf('mi')  > -1 || weekdays.indexOf('we')  > -1  || weekdays.indexOf('me')  > -1 || weekdays.indexOf('!$we')  > -1) { weekday_we = true; } else { weekday_we = false; }  
        if (weekdays.indexOf('4')  > -1 || weekdays.indexOf('do')  > -1 || weekdays.indexOf('th')  > -1   || weekdays.indexOf('je')  > -1   || weekdays.indexOf('!$we')  > -1) { weekday_th = true; } else { weekday_th = false; }  
        if (weekdays.indexOf('5')  > -1 || weekdays.indexOf('fr')  > -1  || weekdays.indexOf('fr')  > -1    || weekdays.indexOf('ve')  > -1   || weekdays.indexOf('!$we')  > -1) { weekday_fr = true; } else { weekday_fr = false; }          
        if (weekdays.indexOf('6')  > -1 || weekdays.indexOf('sa')  > -1   || weekdays.indexOf('sa')  > -1  || weekdays.indexOf('sa')  > -1  || weekdays.indexOf('$we')  > -1) { weekday_sa = true; } else { weekday_sa = false; }
                
        result.push(weekday_su, weekday_mo, weekday_tu, weekday_we, weekday_th, weekday_fr, weekday_sa);
        return result; 
    },    
    wdtimer_getWeekdaysNum: function (weekdays) {
        var result = "";
        if (weekdays[1] == true) { result += "1";}
        if (weekdays[2] == true) { result += "2";}
        if (weekdays[3] == true) { result += "3";}
        if (weekdays[4] == true) { result += "4";}
        if (weekdays[5] == true) { result += "5";}
        if (weekdays[6] == true) { result += "6";}
        if (weekdays[0] == true) { result += "0";}   
        return result;
    },
    wdtimer_getProfiles: function (elem) { /*Erstellt den localStore, verankert den Aufruf des PopUps*/
        var attr_device = elem.data('device');  
        var attr_language = elem.data('language');
        var attr_cmdlist = elem.data('cmdlist'); 
        var attr_sortcmdlist = elem.data('sortcmdlist');
        var attr_backgroundcolor = elem.data('background-color');        
        var attr_color = elem.data('color');     
        var attr_title = elem.data('title');
        var attr_disablestate = elem.data('disablestate');
        var attr_theme = elem.data('theme');
        var attr_style = elem.data('style');
		var attr_savecfg = elem.data('savecfg');
        
        $.ajax({
            async: true,
            timeout: 15000,
            cache: false,
            context:{'DEF': 'DEF'},            
            url: $("meta[name='fhemweb_url']").attr("content") || "/fhem/",
            data: {
                cmd: ["list",attr_device].join(' '),
                XHR: "1"
            }            
        })
        .done(function(data ) {
            var wdtimer_enabled = true;
            var wdtimer_def = "";
            if (attr_title == 'NAME') { var wdtimer_title = attr_device; } else { var wdtimer_title = attr_title; }            
                    
            var listresult = data.split(/\n/);
            for (var i = 0; i < listresult.length; i++) {               
                if (listresult[i].indexOf('DEF') > -1) { wdtimer_def = listresult[i]; }
                if (listresult[i].indexOf('disable') > -1) { wdtimer_enabled = (listresult[i].indexOf('0') > -1); }
                if (listresult[i].indexOf('alias') > -1 && attr_title == 'ALIAS') { wdtimer_title = listresult[i].replace("alias", "").trim(); }                
            }    
            wdtimer_def = wdtimer_def.replace('DEF','').trim();
            var values = wdtimer_def.split(" ");                                                 
            var arr_profiles = new Array(); //Verfügbare Profile (Tage/Uhrzeit/Befehl)
            var arr_cmdlist = new Array(); //Verfügbare Befehle (Dropdown)
            var arr_config = new Array(); //Sonstige Angaben des Device
            var arr_weekdaytimer = new Array(); // Array mit gesamter Konfiguration
            
            //--------------- localStore erstellen ---------------   

            //Befehlliste aus Attribut aufbauen [optional]             
            if (attr_cmdlist != '') {                  
                $.each( attr_cmdlist, function( text, cmd ) {
                    var arr_cmd = new Array();      
                    arr_cmd.push(text,cmd);                    
                    arr_cmdlist.push(arr_cmd);
                });               
            }
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                       
            var isCommand = false;
            var isCondition = false;
            var wdtimer_command = "";
            var wdtimer_condition = "";
            for (var i = 0; i < values.length; i++) {
                var isProfile = false;                               
                // Profiltrenner |  Command in {} eingeschlossen    Condition in () eingeschlossen      Command/Consition-trenner |
                // Profil kann {} und () enthalten, Command kann ( enthalten, 
                
                // Auslesen der Profile 
                if (values[i].indexOf('|') > -1 && values[i].indexOf('}|(') == -1 ) {  // Nur Command|Condition kann "}|(" sein
                    var profileparts = values[i].split('|');      //[<weekdays>|]<time>|<parameter>                           
                    var profile = new Array();

                    if (profileparts.length == 3) {profile.push(widget_wdtimer.wdtimer_getWeekdays(profileparts[0])); } else {profile.push(widget_wdtimer.wdtimer_getWeekdays('0123456')); } //Wochentage
                    if (profileparts.length == 3) {profile.push(profileparts[1]); } else {profile.push(profileparts[0]); } //Uhrzeit 
                    if (profileparts.length == 3) { //Befehl
                        profile.push(profileparts[2]); 
                        if (widget_wdtimer.wdtimer_multiArrayindexOf(arr_cmdlist,profileparts[2]) == -1) { //Fehlende Befehle in Befehlliste aufnehmen
                            var arr_cmd = new Array();      
                            arr_cmd.push(profileparts[2].toUpperCase()+'*',profileparts[2]);                    
                            arr_cmdlist.push(arr_cmd);
                        }
                    } else {
                        profile.push(profileparts[1]);
                        if (widget_wdtimer.wdtimer_multiArrayindexOf(arr_cmdlist,profileparts[2]) == -1) { //Fehlende Befehle in Befehlliste aufnehmen
                            var arr_cmd = new Array();      
                            arr_cmd.push(profileparts[2].toUpperCase()+'*',profileparts[2]);                    
                            arr_cmdlist.push(arr_cmd);
                        }
                    }
                    profile.push(true); //Profil ist gültig (ungültig = über GUI gelöscht)
                    arr_profiles.push(profile);      

                    isProfile = true;                    
                }
                //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                
                // Auslesen von Commands
                 if (  (isProfile == false && isCondition == false ) && (values[i].indexOf('{') > -1 || values[i].indexOf('}') > -1 || isCommand == true) ) {
                    if (values[i].indexOf(';') > -1) { wdtimer_command += values[i].replace(';',';;')+" "; }
                    else {wdtimer_command += values[i]+" "; }
                                
                     isCommand = !(values[i].indexOf('}') > -1);        
                 }
                 //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                // Auslesen von Condition
                 if ( (isProfile == false && isCommand == false && (values[i].substring(values[i].length-1, values[i].length) != '}') ) && (values[i].indexOf('(') > -1 || values[i].indexOf(')') > -1 || isCondition == true ) ) {
                     if (values[i].indexOf(';') > -1) { wdtimer_condition += values[i].replace(';',';;')+" "; }
                     else {wdtimer_condition += values[i]+" "; }
                     isCondition = !(values[i].indexOf(')') > -1);        
                 }
                 //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                
            }   
            
            arr_config.push(attr_device); // zu Device
            arr_config.push(values[0]); // zu steuerndes Device
            arr_config.push(attr_language); //Sprache
            arr_config.push(wdtimer_enabled); // Device Status (aktiv/disabled)
            arr_config.push(wdtimer_title); //Dialog Titel
            arr_config.push(wdtimer_command.trim()); //Command
            arr_config.push(wdtimer_condition.trim()); //Condition    
            arr_config.push(attr_disablestate); //Weekdaytimer aktivier-/deaktivierbar       
            arr_config.push(attr_theme); //verwendetes Theme
            arr_config.push(attr_style); //verwendeter Style    
			arr_config.push(attr_savecfg);  // autom. speichern der konfiguration
                           
            if (attr_sortcmdlist != "MANUELL" ) {
                if (attr_sortcmdlist == "WERT" ) { 
					arr_cmdlist.sort(function(a, b){return a[1] - b[1];});  //Gesamte Befehlliste sortieren nach Werten
				}else{
					// alles andere, d.h. "TEXT" ist default
					arr_cmdlist.sort(function(a, b){return a[0].localeCompare(b[0])});  //Gesamte Befehlliste sortieren nach Anzeigetext
				}	
            };
			
            arr_weekdaytimer.push(arr_profiles,arr_cmdlist,arr_config); // Array mit gesamter Konfiguration         
            widget_wdtimer.wdtimer_saveLocal(arr_weekdaytimer); //Konfiguration speichern
            //-----------------------------------------------

            // Aufruf des Popups
            var showDialogObject = (elem.data('starter')) ? $(document).find( elem.data('starter') ) : elem.children(":first");
            showDialogObject.on( "click", function() {
                widget_wdtimer.wdtimer_showDialog(elem, attr_device);                        
            });    
            //-----------------------------------------------    
           ftui.log(1,"Widget vorbereitungen sind abgeschlossen. ["+attr_device+"]");                       
        });    
    },      
    wdtimer_getCurrentProfiles: function (elem, cmdlist) {
        var arr_profiles = new Array(); //Verfügbare Profile (Tage/Uhrzeit/Befehl)
        var arr_currentProfilesResult = new Array(); //Enthält das Ergebnis
        var error = false;
        //arr_currentProfilesResult  (0) -> fehler ja/nein
        //                                      (1) -> profilliste          
        elem.find('.wdtimer_profile').each(function(){
            var profileid = $( this ).data('profile');
            var arr_profil = new Array();
            var weekdays = '';
            var profileError = false;                       
            // Wochentage
            //-----------------------------------------------
            if ($( this ).children(".wdtimer_profileweekdays").children().children("#checkbox_mo-reihe"+profileid).prop('checked') == true) { weekdays += '1'; }
            if ($( this ).children(".wdtimer_profileweekdays").children().children("#checkbox_di-reihe"+profileid).prop('checked') == true) { weekdays += '2'; }
            if ($( this ).children(".wdtimer_profileweekdays").children().children("#checkbox_mi-reihe"+profileid).prop('checked') == true) { weekdays += '3'; }
            if ($( this ).children(".wdtimer_profileweekdays").children().children("#checkbox_do-reihe"+profileid).prop('checked') == true) { weekdays += '4'; }
            if ($( this ).children(".wdtimer_profileweekdays").children().children("#checkbox_fr-reihe"+profileid).prop('checked') == true) { weekdays += '5'; }
            if ($( this ).children(".wdtimer_profileweekdays").children().children("#checkbox_sa-reihe"+profileid).prop('checked') == true) { weekdays += '6'; }
            if ($( this ).children(".wdtimer_profileweekdays").children().children("#checkbox_so-reihe"+profileid).prop('checked') == true) { weekdays += '0'; }
            arr_profil.push( widget_wdtimer.wdtimer_getWeekdays(weekdays) );
            //-----------------------------------------------            
            //Uhrzeit
            arr_profil.push( $( this ).children(".wdtimer_profiletime").children(".wdtimer_time").val() );
             //-----------------------------------------------             
            //Befehl
            var cmdid = $( this ).children( ".wdtimer_profilecmd" ).children("select[name='wdtimer_cmd']").val();     
            arr_profil.push( cmdlist[cmdid][1] );
            //-----------------------------------------------         
            //Profil ist nicht gelöscht (muss mit true gesetzt werden)
            arr_profil.push( true );
            //-----------------------------------------------            
            //Prüfen der Profilangaben auf Gültigkeit            
            if (arr_profil[0].indexOf(true) == -1 ) { profileError = true;} //Kein Wochentag markiert 
            var patt_time = /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/g; //-> regex stimmt nicht 26 Uhr ist gültig .....
            if ( patt_time.test(arr_profil[1]) == false ) { profileError = true;} //Keine gültige Uhrzeit        
            if  (cmdlist[cmdid] == undefined) { profileError = true;} //Kein gültiger Befehl
            if (profileError == true) {
                    error = profileError;
                    $(this).addClass( "error" );
            } else { $(this).removeClass( "error" ); }
            //-----------------------------------------------                
            arr_profiles.push(arr_profil);            
        });           
      
        if (arr_profiles.length == 0) { error = true; } //Es muss mind. 1 Profil vorhanden sein.
        arr_currentProfilesResult.push(error, arr_profiles);
        return arr_currentProfilesResult;        
    },
    init: function () {
        var base = this;
      
        this.elements = $('div[data-type="'+this.widgetname+'"]');
        this.elements.each(function(index) {            
            var elem=$(this);
            //Setzten der Standartattribute falls diese nicht angegeben wurden  
            elem.data('language',    $(this).data('language') || 'de');
            elem.data('cmdlist',    $(this).data('cmdlist') || '');     
            elem.data('sortcmdlist',    $(this).data('sortcmdlist') || "TEXT");            
            elem.data('width',    $(this).data('width') || '480');
            elem.data('height',    $(this).data('height') || '300');
            elem.data('title',  $(this).data('title') || 'NAME');
            elem.data('icon',  $(this).data('icon') || 'fa-clock-o');
            elem.data('disablestate',  $(this).data('disablestate') || false);
            elem.data('style',  $(this).data('style') || 'square'); //round or square           
            elem.data('theme',  $(this).data('theme') || 'light');  //light,dark,custom
			elem.data('savecfg',$(this).data('savecfg') || false);  // Save FHEM Configuration  
            //-----------------------------------------------
            base.wdtimer_getProfiles(elem);         
        });
    },            
    update: function (dev,par) {
    }
});

