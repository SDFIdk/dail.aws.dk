var valgtadresse= null;
var map= null;
var korttype= null;
var geojsonlayer= null;

$( document ).on( "pageinit", "#soeg", function() {

  var info= $("#adresseinfo"),
      vejnavn= null,
      ul = null,
      input= null;

  map = L.map('map');
  var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: 'Map data &copy; OpenStreetMap contributors'});
  osm.addTo(map);

  $('.ui-input-clear').on('click', function(e){
    input.val("");
    info.html( "" );
    info.listview( "refresh" );
  });


  function danAdresse(adresse) {
    return adresse.adgangsadresse.vejstykke.navn + (adresse.adgangsadresse.husnr.length > 0?' '+adresse.adgangsadresse.husnr:"")  + (adresse.etage?', '+adresse.etage+'.':"") + (adresse.dør?' '+adresse.dør:"")+ "<br />" +(adresse.adgangsadresse.supplerendebynavn?' '+adresse.adgangsadresse.supplerendebynavn+"<br />":"") +  (adresse.adgangsadresse.postnummer?adresse.adgangsadresse.postnummer.nr+' '+adresse.adgangsadresse.postnummer.navn:"");
  }

  function visAdresseInfo(url) {      
    $.ajax({
      url: url,
      dataType: "jsonp"
    })
    .fail( function(jqXHR, textStatus) {
      alert(jqXHR.status + " " + jqXHR.statusText); // kaldes ikke ved jsonp
    })
    .then( function ( adresse, textStatus, jqXHR ) {
      valgtadresse= adresse;
      info.html( "" );
      info.append("<li id='adresse'><a href='#kort'><p><strong>" + danAdresse(adresse) + "</strong></p></a></li>");
      info.append("<li id='koordinat'><a href='#kort'><p><strong>Koordinat:</strong>: (" + adresse.adgangsadresse.adgangspunkt.koordinater[0] + ", " + adresse.adgangsadresse.adgangspunkt.koordinater[1] + ")</p></a></li>");
      info.append("<li><p><strong>Matrikelnr: </strong>" + adresse.adgangsadresse.matrikelnr + "<br />" + "<strong>Landsejerlav:</strong> " + adresse.adgangsadresse.ejerlav.kode + " " + adresse.adgangsadresse.ejerlav.navn + "</p></li>");
      info.append("<li id='kommune'><a href='#kort'><p><strong>Kommune: </strong>" + adresse.adgangsadresse.kommune.kode + " "  + adresse.adgangsadresse.kommune.navn + "</p></a></li>");
      info.append("<li id='postnummer'><a href='#kort'><p><strong>Postnummer: </strong>" + adresse.adgangsadresse.postnummer.nr + " " + adresse.adgangsadresse.postnummer.navn + "</p></a></li>");
      info.append("<li id='sogn'><a href='#kort'><p><strong>Sogn: </strong>" + adresse.adgangsadresse.sogn.kode + " " + adresse.adgangsadresse.sogn.navn + "</p></a></li>");
      info.append("<li id='region'><a href='#kort'><p><strong>Region: </strong>" + adresse.adgangsadresse.region.kode + " " + adresse.adgangsadresse.region.navn + "</p></a></li>");
      info.append("<li id='retskreds'><a href='#kort'><p><strong>Retskreds: </strong>" + adresse.adgangsadresse.retskreds.kode + " " + adresse.adgangsadresse.retskreds.navn + "</p></a></li>");
      info.append("<li id='politikreds'><a href='#kort'><p><strong>Politikreds: </strong>" + adresse.adgangsadresse.politikreds.kode + " " + adresse.adgangsadresse.politikreds.navn + "</p></a></li>");
      info.append("<li id='opstillingskreds'><a href='#kort'><p><strong>Opstillingskreds: </strong>" + adresse.adgangsadresse.opstillingskreds.kode + " " + adresse.adgangsadresse.opstillingskreds.navn + "</p></a></li>");
      info.listview( "refresh" );
    }); 
    $('#adresseinfo').on("click", "#adresse", function() {
      korttype= 'adresse';
    }); 
    $('#adresseinfo').on("click", "#koordinat", function() {
      korttype= 'adresse';
    });
    $('#adresseinfo').on("click", "#sogn", function() {
      korttype= 'sogn';
    });
    $('#adresseinfo').on("click", "#kommune", function() {
      korttype= 'kommune';
    });
    $('#adresseinfo').on("click", "#postnummer", function() {
      korttype= 'postnummer';
    });
    $('#adresseinfo').on("click", "#region", function() {
      korttype= 'region';
    });
    $('#adresseinfo').on("click", "#retskreds", function() {
      korttype= 'retskreds';
    });
    $('#adresseinfo').on("click", "#politikreds", function() {
      korttype= 'politikreds';
    });
    $('#adresseinfo').on("click", "#opstillingskreds", function() {
      korttype= 'opstillingskreds';
    });
  } 


  function hentliste(q) {
    info.html( "" );
    info.listview( "refresh" );
    ul.listview( "refresh" );
    var parametre=  {};
    parametre.side= 1;
    parametre.per_side= 10;
    parametre.q= q;
    if (vejnavn) parametre.vejnavn= vejnavn;
    $.ajax({
        url: "http://dawa.aws.dk/"+(vejnavn?"adresser":"vejnavne")+"/autocomplete",
        dataType: "jsonp",
        data: parametre
    })
    .then( function ( response ) {
      if (response.length === 1) {
        if ("adresse" in response[0]) {
          visAdresseInfo(response[0].adresse.href);
        } 
        else {
          vejnavn= response[0].tekst;
          hentliste(q);
        }              
        input.val(response[0].tekst+" ");
        input.focus();
      }
      else {
        $.each( response, function ( i, val ) {
          ul.append("<li id='" + i + "'>" + val.tekst + "</li>");
          $("#" + i).data("data",val);
          $("#" + i).bind("vclick", vælgItem(val));
        });
      }            
      ul.listview( "refresh" );
      ul.trigger( "updatelayout");
    });
  }

  function vælgItem(res) {
    return function (e) {
      var valg= $(this).data("data");
      ul.html( "" );
      ul.listview( "refresh" );
      if ("adresse" in valg) {
        visAdresseInfo(valg.adresse.href);
      }
      else {          
        vejnavn= valg.tekst;
      }
      input.val(valg.tekst+" ");
      input.focus(); 
      return false;
    };
  };

  $( "#autocomplete" ).on( "filterablebeforefilter", function ( e, data ) {

    ul = $( this );
    input = $( data.input );    
    value = input.val();

    ul.html( "" );
    if ( value && value.length > 1 ) {
      if (vejnavn && value.length < vejnavn.length) vejnavn= null;
      hentliste(value);
    }

  });
  
});


$(document).on('pageshow', '#kort', function(event, ui) {
  if (!valgtadresse) {
    $.mobile.navigate("#soeg", {});
    return;
  }      
  var aa= valgtadresse.adgangsadresse;
  map.setView(new L.LatLng(aa.adgangspunkt.koordinater[1], aa.adgangspunkt.koordinater[0]),16); 
  var marker= L.marker(new L.LatLng(aa.adgangspunkt.koordinater[1], aa.adgangspunkt.koordinater[0])).addTo(map);   
  marker.bindPopup(aa.vejstykke.navn + " " + aa.husnr + (valgtadresse.etage?', '+valgtadresse.etage+'.':"") + (valgtadresse.dør?' '+valgtadresse.dør:"") + "<br>" +
                (aa.supplerendebynavn ? aa.supplerendebynavn + "<br>":"") +
                aa.postnummer.nr + " " + aa.postnummer.navn).openPopup();
  map._onResize();
  if (geojsonlayer) map.removeLayer(geojsonlayer);
  var url= null;
  if (korttype==='sogn') {
    url= aa.sogn.href;
  } 
  else if (korttype==='kommune') {
    url= aa.kommune.href;
  }
  else if (korttype==='region') {
    url= aa.region.href;
  }
  else if (korttype==='postnummer') {
    url= aa.postnummer.href;
  }
  else if (korttype==='retskreds') {
    url= aa.retskreds.href;
  }
  else if (korttype==='politikreds') {
    url= aa.politikreds.href;
  }
  else if (korttype==='opstillingskreds') {
    url= aa.opstillingskreds.href;
  }
  if (korttype!=='adresse') {
    var parametre= {format: 'geojson'};    
    $.ajax({
        url: url,
        dataType: "jsonp",
        data: parametre
    })
    .then( function ( inddeling ) {
      geojsonlayer= L.geoJson(inddeling);
      geojsonlayer.addTo(map);
      map.fitBounds(geojsonlayer.getBounds())
    });
  }
});