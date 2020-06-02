// $(document).ready(function() {
//   $('body').progressTracker({
//              horNumbering: false,
//              horTitles: true,
//              horTitlesOffset: 'top',
//              horMobileOnly: true,
//              verTracker: true,
//              verStyle: 'fill',
//              verColor: 'blue',
//              verPosition: 'left',
//              verMobile: false,
//
//              mobileThreshold: 770,
//
//              hovering: true,
//
//              trackAllHeadlines: true,
//              // addFinalStop: true,
//              // finalStopTitle: 'Last Section',
//              scrollSpeed: 1200
//          });
// });
/*
~~~~~~~~~~~~~~~~~~~~~~~~~
Variables globales
~~~~~~~~~~~~~~~~~~~~~~~~~
*/

//// interface
var barre = document.querySelector('#barreRecherche');
var resultats = document.querySelector('#resultatsRecherche');
var nbResultats = document.querySelector('#nbResultats');
var resultatStr = " résultat";
var resultatsStr = " résultats";
var dash = '-';
var enr_conso_electrique = 0;
var enr_conso_electrique_residentiel = 0;

//// Valeurs max de l'OMS pour les polluants de l'air :
var no2Max = 40;
var o3Max = 100;
var pm10Max = 50;
var pm25Max = 25;

//// config / état pour les bulles des établissements
var etab = {
  bubble: null,
  color: d3.scale.category20c(),
  format: d3.format(",d"),
  dataUrl: "data/emissions-etablissements.php?i=",
  diameter: 550,
  donnees: null,
  donneesFiltrees: null,
  etabInfoMsg: "Survolez les bulles pour afficher plus d'informations",
  height: 580,
  id: "#etabBubbles",
  idInfo: "#etabInfo",
  node: null,
  tooltip: null,
  svg: null,
  width: 580
}; // configuration de la chart établissements

var setEtabElectriciteResidentiel = function (v)
{
  enr_conso_electrique_residentiel = v;
};


/* ~~~~~~~~~~~~~~~~~~~~~~~~~
Recherche
~~~~~~~~~~~~~~~~~~~~~~~~~ */

//// Liste de communes pour la fonction de recherche.
//// Contains() est case-sensitive
var communes = '';

d3.json('data/organismes_liste.php', function(error, data)
{
  if (error) console.log(error);
  communes = data;
});

var chercher = function ()
{
  var saisie = barre.value.toLowerCase();
  var resultatsArr = [];

  for (n in communes)
  {
    if ( inclue( communes[n].libelle.toLowerCase(), saisie ) )
    {
      resultatsArr.push(communes[n]);
    }
  }

  // affichage des resultats trouvés, seulement s'il y a du texte dans la barre
  if (saisie.length > 0)
  {
    var resultatsHTML = "";
    for (n in resultatsArr)
    {
      resultatsHTML += '<p class="resultatItem" '
      + 'onclick="selectionner('
      + resultatsArr[n].insee
      + ','
      + resultatsArr[n].code_dept
      + ')">';
      if (resultatsArr[n].typeLabel === 'epci')
      {
        resultatsHTML += '<b class="epci">' + resultatsArr[n].typeLabel + '</b>';
      }
      else
      {
        resultatsHTML += '<b>' + resultatsArr[n].typeLabel + '</b>';
      }
      resultatsHTML += resultatsArr[n].libelle
      + ' <small>(' + resultatsArr[n].code_dept
      + ')</small></p>';
    }

    if (resultatsHTML == '')
    {
      resultatsHTML = '<p id="pasResultats">Cette commune ne fait pas partie de l\'étude :)<br>L\'outil cible uniquement les communes entre 20K et 50K habitants</p>';
    }
    resultats.innerHTML = resultatsHTML;
    resultats.setAttribute('style', 'display:block');
    // document.querySelector('#print').setAttribute('style', 'display:block');

    document.querySelector('#info').setAttribute('style', 'display:none');
    if (resultatsArr.length === 1) nbResultats.innerHTML = resultatsArr.length + resultatStr;
    else nbResultats.innerHTML = resultatsArr.length + resultatsStr;
  }
  else
  {
    resultats.innerHTML = '';
    resultats.setAttribute('style', 'display:none');
    nbResultats.innerHTML = "0" + resultatsStr;
  }
}; // chercher

var selectionner = function (inseeP, dept)
{
  // réinitialiser les données de pollution du dépt
  etab.donnees = null;

  document.querySelector('#etabInfo').setAttribute('style', 'display: block');
  document.querySelector('#etabInfo').innerHTML = etab.etabInfoMsg;

  inseeP = inseeP + "";

  for (n in communes)
  {
    if (communes[n].insee === inseeP) commune = communes[n];
  }
  barre.value = commune.libelle;
  resultats.setAttribute('style', 'display:none');
  nbResultats.innerHTML = '';
  iniUI( inseeP, dept );
};

//// lancer la recherche
attachEvent(document.querySelector('#barreRecherche'), 'keyup',  chercher);

//// print
// var printPage = function () {window.print();}
// attachEvent(document.querySelector('#print'), 'click',  printPage);


/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iniUI
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/
var iniUI = function ( insee, dept )
{
  //// cacher info, montrer contenu
  document.querySelector('#info').setAttribute('style', 'display: none');
  document.querySelector('#container').setAttribute('style', 'display: block');
  $('#nav').removeClass('inactive');
  $('#nav').addClass('active');

  // dire à AOS que les section cachées il faut les animer
  AOS.refresh();

  // montrer la nav



  //// Commune ou EPCI ?
  var isCommune = true;
  if (insee.toString().length > 5) isCommune = false;

  ////  chiffres-clés de la collectivité
  try
  {
    if (isCommune) iniChiffresCles(insee); // lance aussi iniPrevair
    else iniChiffresClesEPCI(insee); // lance aussi iniPrevair
  }
  catch (e)
  {
    console.log("iniChiffresCles -> error", e);
  }

  ////  consommation de gaz et d'élecricité
  try
  {
    iniConsoTotale(insee);
  }
  catch (e)
  {
    console.log("iniConsoTotale -> error");
  }

  // -- filière électricité
  try
  {
    iniSankey('data/conso_sankey.php?i=' + insee + '&f=e', 'secteursE', etab);
  }
  catch (e)
  {
    console.log("iniSankey e -> error");
  }
  // -- filière gaz
  try
  {
    iniSankey('data/conso_sankey.php?i=' + insee + '&f=g', 'secteursG', etab);
  }
  catch (e)
  {
    console.log("iniSankey g -> error");
  }

  // -- D3JS évolution de la consommation d'électricité et de gaz
  var options = {selector: "#streamChart", csv: "data/conso_evo.php?i=" + insee}
  streamChart(options);

  // iniConsoCommune(insee);

  //// réseau chaleur froid
  try
  {
    iniChaleurFroid(insee);
  }
  catch (e)
  {
    console.log("iniChaleurFroid -> error");
  }

  //// polluants dans l'air
  // - les données prevair sont lancées depuis les chiffres clés

  // - données des établissments du département
  try
  {
    iniEmissionsEtablissements(insee, dept);
  }
  catch (e)
  {
    console.log("iniEmissionsEtablissements -> error");
  }

}; // iniUI



/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iniChiffresCles
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/
var iniChiffresCles = function (insee)
{
  console.log('iniChiffresCles', insee);
  d3.json('data/communes_20_50.php?i=' + insee, function(error, data)
  {
    if (error) console.log(error);

    commune = data[0];

    //// afficher sections communes et cacher sections EPCI
    // document.querySelector('#preLoc').setAttribute('style', 'display:block');
    document.querySelector('#wrapCommune').setAttribute('style', 'display:block');
    document.querySelector('#wrapEPCI').setAttribute('style', 'display:none');

    //// carte

    var loc = [];
    loc.push(parseFloat(commune.latitude));
    loc.push(parseFloat(commune.longitude));

    var zoom = 11;

    //// détruire totalement la carte avant de faire une autre
    $("#preLoc").html("");
    $( "<div id=\"loc\" style=\"height: 300px;\"></div>" ).appendTo("#preLoc");
    try {delete window.map;} catch(e){}


    var map = L.map('loc').setView(loc, zoom);
    var tiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    L.tileLayer( tiles, { attribution: attribution } ).addTo(map);

    //// Popup
    L.marker(loc).addTo(map)

    // var contour = [commune.forme];
    var contour = [{
       "type": "Feature",
         "geometry": JSON.parse(commune.forme)
    }];
    L.geoJSON(contour, { style: {color: '#19aeff'} }).addTo(map);



    //// Admin
    var libelles = document.querySelectorAll('.libelle_commune');
    var lettre = commune.libelle[0];
    var libelle = '';
    if (lettre == 'A' || lettre == 'E' || lettre == 'I' || lettre == 'O' || lettre == 'U')
    {
      libelle = "d'" + commune.libelle;
    }
    else
    {
      libelle = "de " + commune.libelle;
    }

    var i = 0;

    for (n in libelles)
    {
      if (i < 1) libelles[n].innerHTML = commune.libelle;
      else libelles[n].innerHTML = libelle;
      i++;
    }

    _s('libelle3rem' , commune.libelle + ' <b>(' + commune.code_dept + ')</b>');
    _s('deptRegion', commune.dept + ', ' + commune.region);
    _s('epci', commune.epci);
    _s('insee', commune.insee);

    //// Chiffres clés
    _s('hb2015', _f(commune.population));

    var evoPopulation = 0;
    if (commune.population_2010)
    {
      evoPopulation = commune.population - commune.population_2010;
      if (evoPopulation > 0) evoPopulation = "+" + _f(evoPopulation);
      if (evoPopulation < 0) msgPopulation = "-" + _f(evoPopulation);
    }
    _s('hb2010', evoPopulation);
    _s('menages', _f(commune.menages));
    //_s('menages_enr', _f(commune.menages));
    _s('logements', _f(commune.logements));
    _s('etbActifs', _f(commune.ets_actifs));
    _s('superficie', _f(commune.superficie));

    //// EnR
    enr.commune = commune.libelle;
    enr.menages = commune.menages;

    //// Imbriquer DPE
    setDPE(commune.insee);

    //// Imbriquer énergies rénouvelables
    try
    {
      iniPotentielENR(commune.code_region);
    }
    catch (e)
    {
      console.log("iniPotentielENR -> error");
    }

    //// Imbriquer le lancement des données AIR
    try
    {
      iniPrevair(commune.insee, commune.latitude, commune.longitude);
    }
    catch (e)
    {
      console.log("iniPrevair -> error");
    }

    // iniTreemap(commune.insee);
  });

  try
  {
    iniProduction(insee);
  }
  catch (e)
  {
    console.log("iniProduction -> error");
  }

  try
  {
    iniRecharge(insee,'code_insee');
  }
  catch (e)
  {
    console.log("iniRecharge -> error");
  }
}; // iniChiffresCles


/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iniChiffresClesEPCI
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/
var iniChiffresClesEPCI = function (insee)
{
  d3.json('data/epci.php?i=' + insee, function(error, data)
  {
    if (error) console.log(error);

    commune = data[0];

    var geo = commune.geo_point.split(',');
    console.log('geo', geo);

    //// afficher sections communes et cacher sections EPCI
    // document.querySelector('#preLoc').setAttribute('style', 'display:block');
    document.querySelector('#wrapCommune').setAttribute('style', 'display:none');
    document.querySelector('#wrapEPCI').setAttribute('style', 'display:block');

    //// carte
    var loc = [];
    loc.push(parseFloat(geo[0]));
    loc.push(parseFloat(geo[1]));

    var zoom = 9;

    //// détruire totalement la carte avant de faire une autre
    $("#preLoc").html("");
    $( "<div id=\"loc\" style=\"height: 300px;\"></div>" ).appendTo("#preLoc");
    try {delete window.map;} catch(e){}

    var map = L.map('loc').setView(loc, zoom);
    var tiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    L.tileLayer( tiles, { attribution: attribution } ).addTo(map);

    //// Popup
    L.marker(loc).addTo(map)

    //// Charger le contour à partir de opendatasoft
    d3.json('https://public.opendatasoft.com/api/records/1.0/search/?dataset=contours-geographiques-des-epci-2019&q=' + commune.insee + '&facet=code_epci', function(error, data)
    {
      var d = data.records[0].fields.geo_shape.coordinates[0];
      // https://gis.stackexchange.com/questions/54065/leaflet-geojson-coordinate-problem
      // ISO 6709 standard : latitude, longitude
      // geojson : longitude, latitude
      // for (i in d) d[i] = d[i].reverse();
      // console.log("d",d);
      // var polygon = L.polygon(d, {color: '#19aeff'}).addTo(map);
      // map.fitBounds(polygon.getBounds());
      var contour = [{
	       "type": "Feature",
	         "geometry": {
		           "type": "Polygon",
		           "coordinates": [d]
	          }
      }];

      L.geoJSON(contour, { style: {color: '#19aeff'} }).addTo(map);

    });


    //// Admin
    var libelles = document.querySelectorAll('.libelle_commune');
    var lettre = commune.libelle[0];
    var libelle = '';
    if (lettre == 'A' || lettre == 'E' || lettre == 'I' || lettre == 'O' || lettre == 'U')
    {
      libelle = "d'" + commune.libelle;
    }
    else
    {
      libelle = "de " + commune.libelle;
    }

    var i = 0;

    for (n in libelles)
    {
      if (i < 1) libelles[n].innerHTML = commune.libelle;
      else libelles[n].innerHTML = libelle;
      i++;
    }

    _s('libelle3rem' , commune.libelle + ' <b>(' + commune.code_dept + ')</b>');
    _s('deptRegion', commune.departement + ', ' + commune.region);
    // _s('epci', commune.epci);
    // _s('insee', commune.insee);
    _s('siren', commune.insee);

    //// Chiffres clés
    _s('hb2015', _f(commune.population));

    var evoPopulation = 0;
    if (commune.population_2010)
    {
      evoPopulation = commune.population - commune.population_2010;
      if (evoPopulation > 0) evoPopulation = "+" + _f(evoPopulation);
      if (evoPopulation < 0) msgPopulation = "-" + _f(evoPopulation);
    }
    _s('hb2010', evoPopulation);
    _s('menages', _f(commune.menages));
    //_s('menages_enr', _f(commune.menages));
    _s('logements', _f(commune.logements));
    _s('etbActifs', _f(commune.ets_actifs));
    _s('superficie', _f(commune.superficie));

    //// EnR
    enr.commune = commune.libelle;
    enr.menages = commune.menages;


    //// Imbriquer DPE
    setDPE(commune.insee);


    //// Imbriquer énergies rénouvelables
    try
    {
      iniPotentielENR(commune.code_region);
    }
    catch (e)
    {
      console.log("iniPotentielENR -> error");
    }

    //// Imbriquer le lancement des données AIR
    try
    {
      console.log('insee', insee);
      console.log('commune.insee', commune.insee);
      console.log('lat lon', geo[0], geo[1]);
      // Latitude: 47.338563 | Longitude: -2.198014
      iniPrevair(commune.insee, geo[0], geo[1]);

    }
    catch (e)
    {
      console.log("iniPrevair -> error");
    }

    // iniTreemap(commune.insee);
  });


  try
  {
    iniProduction(insee);
  }
  catch (e)
  {
    console.log("iniProduction -> error");
  }

  try
  {
    iniRecharge(insee,'epci');
  }
  catch (e)
  {
    console.log("iniRecharge -> error");
  }
}; // iniChiffresCles


/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iniConsoTotale
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/
var iniConsoTotale = function (id_org)
{
  d3.csv('data/consoTotale.php?i=' + id_org, function (error, data)
  {
    if (error) console.log(error);

    //// trouver les max de 2016
    data.forEach(function(d)
    {
      if (d.filiere == "Electricité" && d.annee == "2017") consoTotale.e2017 = parseInt( d.conso_totale );
      if (d.filiere == "Gaz" && d.annee == "2017") consoTotale.g2017 = parseInt( d.conso_totale );
    });
    try { consoTotale.eg2017 = consoTotale.e2017 + consoTotale.g2017; }
    catch (e) { consoTotale.eg2017 = 0; }

    _s('consoTotale', _f( consoTotale.eg2017 ));
    _s('consoTotaleE', _f( consoTotale.e2017 ));
    _s('consoTotaleG', _f( consoTotale.g2017 ));

    //// ENR
    // enr_conso_electrique = consoTotale.e2016;
    // enr_conso_electrique_residentiel = consoTotale.e2016;

    //// afficher une petite évlution à coté de l'indicateur principal
    // var options = {id: "toto", w:200, h: 150, ticks: 1, selector: "#consoTotaleEvo", csv: "http://localhost/www/energie/dataviz/data/conso_totale.php?i=" + insee};
    // barChart( options );
  });
};


/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iniChaleurFroid
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/
var iniChaleurFroid = function (insee)
{
  //// affichage des données énergie de la commune
  d3.json('data/chaleur_froid_20k_50k.php?i=' + insee, function (error, data)
  {
    if (error) console.log(error);

    document.querySelector('#chaleurFroid').setAttribute('style', 'display:block');

    var out = "";

    if (data.length == 0)
    {
      out = "<p>Il n'y a pas de réseau chaleur / froid dans ce territoire.</p>";
    }
    else
    {
      out ="<table id='etabEtabsTable' width='100%'><thead><th width='14%'>Opérateur</th><th width='14%'>Année</th><th width='14%'>Résidentiel (MWh)</th><th width='14%'>Tertiaire (MWh)</th></thead>";
      out += "<tbody>";

      var format = function (n)
      {
        if (n == "-99") return '-';
        try {return _f(parseInt(n));} catch (e) {return "-";}
      }
      for (n in data)
      {
        out += "<tr><td>" + data[n]['operateur']
        + "</td><td>" + data[n]['annee']
        + "</td><td>" + format(data[n]['conso_residentiel'])
        + "</td><td>" + format(data[n]['conso_tertiaire']) + "</td></tr>";
      }
      out += "</tbody></table>";
    }
    document.querySelector('#chaleurFroidData').innerHTML = out;
  });
};

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iniPrevair
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/
var iniPrevair = function (insee, lat, lon)
{
  if (insee.toString().length > 5)
  {
    document.querySelector('#airh3').innerHTML = "L'air de l'EPCI";
  }
  else
  {
    document.querySelector('#airh3').innerHTML = "L'air de la commune";
  }

  // http://localhost/territoires-et-energies/dataviz/data/lalo.php?lat=47.3385628699&lon=-2.19801438047
  // ok pero non actualizado
  d3.json('data/lalo.php?lat=' + lat + '&lon=' + lon, function(error, data)
  {
    air = data[0];

    // set airDiv
    _s('no2Val', air.no2 );
    _s('o3Val', air.o3 );
    _s('pm10Val', air.pm10 );
    _s('pm25Val', air.pm25 );

    // barres indicateurs
    var no2pourcentage = (air.no2 * 100 ) / no2Max;
    document.querySelector('#no2 .airPourcentageBg').setAttribute('style', 'width:'+no2pourcentage+'%');
    document.querySelector('#no2 .airPourcentageVal').innerHTML = parseFloat(no2pourcentage).toFixed(2)+'%';

    var o3pourcentage = (air.o3 * 100 ) / o3Max;
    document.querySelector('#o3 .airPourcentageBg').setAttribute('style', 'width:'+o3pourcentage+'%');
    document.querySelector('#o3 .airPourcentageVal').innerHTML = parseFloat(o3pourcentage).toFixed(2)+'%';

    var pm10pourcentage = (air.pm10 * 100 ) / pm10Max;
    document.querySelector('#pm10 .airPourcentageBg').setAttribute('style', 'width:'+pm10pourcentage+'%');
    document.querySelector('#pm10 .airPourcentageVal').innerHTML = parseFloat(pm10pourcentage).toFixed(2)+'%';

    var pm25pourcentage = (air.pm25 * 100 ) / pm25Max;
    document.querySelector('#pm25 .airPourcentageBg').setAttribute('style', 'width:'+pm25pourcentage+'%');
    document.querySelector('#pm25 .airPourcentageVal').innerHTML = parseFloat(pm25pourcentage).toFixed(2)+'%';

  });   //// affichage des données pollution de la commune
};

var setDPE = function (id_org)
{
  d3.json('data/dpe_avg.php?id_org=' + id_org, function (error, data)
  {
    if (error) console.log(error);

    var dpeLabel = '-', dpeValue = '-',gesLabel = '-', gesValue = '-',
    dpeSurface = '-', dpeLabel = '-',
    dpeClass = '-', gesClass = '-', dpeAnnee = '-', dpeNb_pe = '-';

    d = data[0];

    if (d.surface)
    {
      dpeAnnee = d.annee;
      dpeNb_pe = _f(d.nb_dpe);
      // "consommation énergie" : Consommation tous usages en kWh/m²
      dpeValue = parseFloat(d.conso_m2).toFixed(0);
      gesValue = parseFloat(d.ges).toFixed(0);
      dpeSurface = parseFloat(d.surface).toFixed(1);
      dpeChauffage = parseFloat(d.chauffage).toFixed(1);
      dpeAltitude = parseFloat(d.altitude).toFixed(0);

      if (dpeValue < 451) { dpeLabel = 'F'; }
      if (dpeValue < 331) { dpeLabel = 'E'; }
      if (dpeValue < 231) { dpeLabel = 'D'; }
      if (dpeValue < 151) { dpeLabel = 'C'; }
      if (dpeValue < 91) { dpeLabel = 'B'; }
      if (dpeValue < 51) { dpeLabel = 'A'; }

      dpeClass = 'dpeClass' + dpeLabel;

      if (gesValue > 80) {gesLabel = 'G'}
      if (gesValue < 81) {gesLabel = 'F'}
      if (gesValue < 56) {gesLabel = 'E'}
      if (gesValue < 36) {gesLabel = 'D'}
      if (gesValue < 21) {gesLabel = 'C'}
      if (gesValue < 11) {gesLabel = 'B'}
      if (gesValue < 6) {gesLabel = 'A'}

      gesClass = 'gesClass' + gesLabel;
    }
    document.querySelector('#dpe2_conso').setAttribute('class', dpeClass);
    document.querySelector('#dpe2_ges').setAttribute('class', gesClass);

    var dpeHTML = '<p class="dpeTitre">Performance énergetique</p>'
    + '<p class="dpeLabel">' + dpeLabel + '</p>'
    + '<p class="dpeValue">' + dpeValue + ' kWh/m²/an</p>'
    + '<p>Moyenne dans les logements</p>';

    var gesHTML = '<p class="dpeTitre">Gaz à effet de serre</p>'
    + '<p class="dpeLabel">' + gesLabel + '</p>'
    + '<p class="dpeValue">' + gesValue + ' kg CO2/m²/an</p>'
    + '<p>Moyenne dans les logements</p>';

    document.querySelector('#dpe2_conso').innerHTML = dpeHTML;
    document.querySelector('#dpe2_ges').innerHTML = gesHTML;
    document.querySelector('#dpeAnnee').innerHTML = dpeAnnee;
    document.querySelector('#logementsDPE').innerHTML = dpeNb_pe;
    document.querySelector('#dpeSurface').innerHTML = dpeSurface;
    document.querySelector('#dpeChauffage').innerHTML = dpeChauffage;
    document.querySelector('#dpeAltitude').innerHTML = dpeAltitude;

  });
};

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iniEmissionsEtablissements
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

var iniEmissionsEtablissements = function (insee,dept)
{
  //// bouton polluants hors CO2
  attachEvent(
    document.querySelector('#etabPolluants'),
    'click',
    function ()
    {
      bubbleJSON(dept, 0);
      d3.select('#etabPolluants').classed('active', true);
      d3.select('#etabCO2').classed('active', false);
      d3.select('#etabEtabs').classed('active', false);
      d3.select('#etab').classed('etabW100', false);
    }
  );

  //// boutons polluants CO2
  attachEvent(
    document.querySelector('#etabCO2'),
    'click',
    function ()
    {
      bubbleJSON(dept, 1);
      d3.select('#etabPolluants').classed('active', false);
      d3.select('#etabCO2').classed('active', true);
      d3.select('#etabEtabs').classed('active', false);
      d3.select('#etab').classed('etabW100', false);
    }
  );

  //// boutons établissements
  attachEvent(
    document.querySelector('#etabEtabs'),
    'click',
    function ()
    {
      etabTable();
      d3.select('#etabPolluants').classed('active', false);
      d3.select('#etabCO2').classed('active', false);
      d3.select('#etabEtabs').classed('active', true);
      d3.select('#etab').classed('etabW100', true);
    }
  );

  // ini bubbles
  bubbleJSON(dept, 0);
  d3.select('#etabPolluants').classed('active', true);
  d3.select('#etabCO2').classed('active', false);
  d3.select('#etabEtabs').classed('active', false);

};

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iniTreeMap
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

var iniTreemap = function (insee, id)
{
  var size = [etab.height, etab.width];
  treeMap();
  // d3.json(etab.dataUrl + insee, function(error, data)
  // {
  //   // if (!error) etab.donnees = root;
  //   // if (etab.donnees) iniBubbles(filter);
  //   treeMap("#etabBubbles2", size, 16, data);
  // });
}

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iniPotentielENR
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

var iniPotentielENR = function (codeRegion)
{
  d3.json('data/rayonnement_vent.php?r=' + codeRegion, function(error, data)
  {
    if (error) { console.log("error", error); return; }
    d = data[0];
    enr.rayonnement = d.rayonnement;
    _s('rayonnement', parseFloat(d.rayonnement).toFixed(2));
    _s('vent', parseFloat(d.vent).toFixed(2));
    _s('enr_commune', enr.commune);
    _s('enr_conso_electrique', _f(enr_conso_electrique_residentiel));
    set_potentiel_solaire();


  });
}

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iniProduction
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

var iniProduction = function (id_org)
{
  d3.json('data/production.php?i=' + id_org, function (error, data)
  {
    if (error) { console.log("error", error); return; }
    d = data[0];
    _s('prod_nb', _f(d.nb));
    _s('prod_puissance', _f(d.puissance));
    _s('prod_puissance2', _f(parseFloat(d.puissance).toFixed(0)));
    var ve_par_menage = (d.puissance * 100) / enr.menages;
    _s('prod_menages', _f(ve_par_menage.toFixed(2)) + " %" );
    var ve_eco_co2 = (112 * 10000 * d.puissance) / 100000000;
    _s('prod_co2', _f( ve_eco_co2.toFixed(1)));
  });
};


/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iniRecharge
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

var iniRecharge = function (id_org, type)
{
  console.log('ini recharge');
  d3.json('data/recharge.php?i=' + id_org + '&t=' + type, function (error, data)
  {
    if (error) { console.log("error", error); return; }
    //// détruire totalement la carte avant de faire une autre
    $("#irve").html("");
    document.querySelector('#rechargeOff').setAttribute('style', 'display: block');
    document.querySelector('#rechargeOn').setAttribute('style', 'display: none');
    //
    // //// afficher la section
    // document.querySelector('#recharge').setAttribute('style', 'display: block');

    if (data[0].Ylatitude)
    {
      console.log(data[0]);
      document.querySelector('#rechargeOff').setAttribute('style', 'display: none');
      document.querySelector('#rechargeOn').setAttribute('style', 'display: block');
      console.log("iniRecharge");
      d = data[0];
      _s('rech_nb', _f(data.length));
        //// carte
        var loc2 = [];
        loc2.push(parseFloat(data[0].Ylatitude));
        loc2.push(parseFloat(data[0].Xlongitude));

        var zoom2 = 9;

        $( "<div id=\"loc2\" style=\"height: 300px;\"></div>" ).appendTo("#irve");
        try {delete window.map;} catch(e){}

        var map2 = L.map('loc2').setView(loc2, zoom2);
        var tiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

        L.tileLayer( tiles, { attribution: attribution } ).addTo(map2);

        var markerE = L.icon({
          iconUrl: 'img/marker-e.png',
        });

        //// Popup
        for (i in data)
        {
          var irveLoc = [];
          irveLoc.push(parseFloat(data[i].Ylatitude));
          irveLoc.push(parseFloat(data[i].Xlongitude));
          // irveLoc.on('click', openPopup)
          var marker = L.marker(irveLoc, {icon: markerE}).addTo(map2);
          var msg = "<span class='markerClass markerE'>Point recharge VE</span>";
          msg += "<b>" + data[i].n_station + "</b><br>";
          if (data[i].a_station) msg += a_station + "<br>";
          msg += data[i].nbre_pdc + " points de charge, ouvert ";
          msg += data[i].accessibilite.replace('_', ' ') + "<br>";
          msg += "Puissance max. : " + data[i].puiss_max + " kw. ";
          msg += "Prise : " + data[i].type_prise;
          marker.bindPopup(msg).openPopup();
        }

        // lancer les marqueurs GNV d'ici pour avoir la référence au map
        iniGNV (id_org, type, map2);
      }
  });
};


/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iniGNV
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

var iniGNV = function (id_org, type, map)
{
  d3.json('data/gnv.php?i=' + id_org + '&t=' + type, function (error, data)
  {
    if (error) { console.log("error", error); return; }

    if (data[0].Ylatitude)
    {
      console.log('ini iniGNV');
      _s('gnv_nb', _f(data.length));

      var markerG = L.icon({
        iconUrl: 'img/marker-g.png',
      });
      //// Popup
      for (i in data)
      {
        var loc = [];
        loc.push(parseFloat(data[i].Ylatitude));
        loc.push(parseFloat(data[i].Xlongitude));
        var marker = L.marker(loc, {icon: markerG}).addTo(map);
        var msg = "<span class='markerClass markerG'>Station GNV</span>";
        msg += "<b>" + data[i].exploitant + "</b><br>";
        msg += data[i].ad_station + "<br>";
        msg += 'Carburant : ' + data[i].carburant + "<br> ";
        msg += 'Accès PL : ' + data[i].acces_pl + "<br>";
        msg += "Bio GNC : " + data[i].bio_gnc + " ";
        marker.bindPopup(msg).openPopup();
      }
    }
  });
};


var set_potentiel_solaire = function ()
{
  // var m2 = document.querySelector('#enr_m2').value;
  // var mw = ( enr.menages * m2 * 24 * 365 * enr.rayonnement) / 1000000;
  // var mw_str = 0;
  // try { mw_str = _f( parseFloat(mw).toFixed(2) ); } catch (e) { console.log("err", e); mw_str = '-'; }
  // _s('calcul_solaire', mw_str );

  /*
    https://photovoltaique-energie.fr/estimer-la-production-photovoltaique.html
    Calcul par le rendement du panneau (ou de la cellule)
    E = S * r * H * Cp

    E = énergie produite en Wh
    S = surface du champ photovoltaïque  (exemple 7.14 m²)
    r = rendement du module (14 % pour notre exemple)
    H = ensoleillement/rayonnement sur la surface inclinée en kWh/m²
    Cp = coefficient de perte (valeur fréquente étant entre 0.75 et 0.8)
    7,14×0,14×1580×0,74
  */

  var m2 = document.querySelector('#enr_m2').value;
  // menages * rayonnement h/m2
  // var mw = ( enr.menages * m2 * 24 * 365 * enr.rayonnement) / 1000000;
  var S = enr.menages*m2;
  var r = 0.14;
  var H = 24*365*enr.rayonnement;
  var Cp = 0.76;

  var mw = (S * r * H * Cp) / 1000000;
  var mw_str = 0;
  try { mw_str = _f( parseFloat( mw ).toFixed(2) ); } catch (e) { console.log("err", e); mw_str = '-'; }
  _s('calcul_solaire', mw_str );



  /*  set CO2 évité

  https://www.edf.fr/sites/default/files/contrib/groupe-edf/responsable-et-engage/rapports-et-indicateurs/emissions-mensuelles-de-co-sub-2-sub/edfgroup_emissions-co2_evite_20170730_vf.pdf

  Facteur d'émission du kWh du solaire PV (photovoltaique) : 48 g CO2/kWh
  FE g eqCO2/kWh moyen en France : 62

  On peut dire qu'un kWh du solaire, économise 12g de CO2.


  12g * kWh produits / 1000 = kg CO2 économisés
  */
  var economie_co2 = (12 * (1000 * mw)) / 1000;
  economie_co2 = parseFloat(economie_co2).toFixed(2);

  _s('economie_co2', _f(economie_co2) );

  set_percentage_solaire (mw);
};

var set_percentage_solaire = function(mw)
{
  // console.log(' set_percentage_solaire mw', mw);
  // console.log(' set_percentage_solaire enr_conso_electrique', enr_conso_electrique);
  // var percentage = parseFloat( (mw * 100) / enr_conso_electrique ).toFixed(2);
  var percentage = parseFloat( (mw * 100) / enr_conso_electrique_residentiel ).toFixed(2);
  // console.log('percentage', percentage);
  _s("enr_percentage", _f(percentage));
};

attachEvent(document.querySelector('#enr_m2'), 'keyup',  set_potentiel_solaire);



//// Si id_org dans URL lancer l'UI
var u = new URL(window.location);
var us = new URLSearchParams(u.search);
var id_org_url = null;
if (us.has('i'))
{
  id_org_url = us.get('i');
}
if (id_org_url) iniUI(id_org_url);
