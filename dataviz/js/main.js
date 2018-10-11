
/*
Habitants : 11 593 957
Menages : 5 159 764


SELECT avg(conso_totale) FROM `dpe_avg`
14578.22

SELECT avg(`conso_totale`) FROM `consomation_20_50`
175284.45

SELECT avg(`conso_totale`) FROM `consomation_20_50` where `filiere` = 'Electricite'
160169.82

SELECT avg(`conso_totale`) FROM `consomation_20_50` where `filiere` = 'Gaz'
190454.80


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

//// Liste de communes pour la fonction de recherche. Contains() est case-sensitive
var communes = '';

d3.json('data/organismes_20k_50k_liste.php', function(error, data)
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
    // if (communes[n].libelle.toLowerCase().includes(saisie))
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
      + 'onclick="selectionner(' + resultatsArr[n].insee + ')">'
      + resultatsArr[n].libelle
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

var selectionner = function (inseeP)
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
  iniUI( inseeP );
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
var iniUI = function ( insee )
{
  //// cacher info, montrer contenu
  document.querySelector('#info').setAttribute('style', 'display: none');
  document.querySelector('#container').setAttribute('style', 'display: block');

  ////  chiffres-clés de la collectivité
  try
  {
    iniChiffresCles(insee); // lance aussi iniPrevair
  }
  catch (e)
  {
    console.log("iniChiffresCles -> error");
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

  // -- évolution de la consommation d'électricité et de gaz
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
    iniEmissionsEtablissements(insee);
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
  d3.json('data/communes_20_50.php?i=' + insee, function(error, data)
  {
    if (error) console.log(error);
    commune = data[0];

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

    _s('libelle3rem' , commune.libelle + ' (' + commune.code_dept + ')');
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
    d3.json('data/dpe_avg.php?cp=' + commune.cp, function (error, data)
    {
      if (error) console.log(error);

      var dpeLabel = '-', dpeValue = '-', dpeSurface = '-', dpeLabel = '-',
      dpeClass = '-', dpeAnnee = '-', dpeNb_pe = '-';

      d = data[0];

      if (d.surface)
      {
        dpeAnnee = d.annee;
        dpeNb_pe = _f(d.nb_dpe);
        // "consommation énergie" : Consommation tous usages en kWh/m²
        dpeValue = parseFloat(d.conso_m2).toFixed(0);
        dpeSurface = parseFloat(d.surface).toFixed(1);

        if (dpeValue < 451) { dpeLabel = 'F'; }
        if (dpeValue < 331) { dpeLabel = 'E'; }
        if (dpeValue < 231) { dpeLabel = 'D'; }
        if (dpeValue < 151) { dpeLabel = 'C'; }
        if (dpeValue < 91) { dpeLabel = 'B'; }
        if (dpeValue < 51) { dpeLabel = 'A'; }

        dpeClass = 'dpeClass' + dpeLabel;
      }
      document.querySelector('#dpe2').setAttribute('class', dpeClass);

      var dpeHTML = '<p id="dpeTitre">Performance énergetique</p><p id="dpeLabel">' + dpeLabel + '</p><p id="dpeValue">' + dpeValue + ' kWh/m²</p><p>Moyenne dans les logements de la commune</p>';

      document.querySelector('#dpe2').innerHTML = dpeHTML;
      document.querySelector('#dpeAnnee').innerHTML = dpeAnnee;
      document.querySelector('#logementsDPE').innerHTML = dpeNb_pe;
      document.querySelector('#dpeSurface').innerHTML = dpeSurface;

    });


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
      iniPrevair(commune);
    }
    catch (e)
    {
      console.log("iniPrevair -> error");
    }

    // iniTreemap(commune.insee);
  });

}; // iniChiffresCles


/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iniConsoTotale
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/
var iniConsoTotale = function (insee)
{
  d3.csv('data/consoTotale_20k_50k.php?i=' + insee, function (error, data)
  {
    if (error) console.log(error);

    //// trouver les max de 2016
    data.forEach(function(d)
    {
      if (d.filiere == "Electricité" && d.annee == "2016") consoTotale.e2016 = parseInt( d.conso_totale );
      if (d.filiere == "Gaz" && d.annee == "2016") consoTotale.g2016 = parseInt( d.conso_totale );
    });
    try { consoTotale.eg2016 = consoTotale.e2016 + consoTotale.g2016; }
    catch (e) { consoTotale.eg2016 = 0; }

    _s('consoTotale', _f( consoTotale.eg2016 ));
    _s('consoTotaleE', _f( consoTotale.e2016 ));
    _s('consoTotaleG', _f( consoTotale.g2016 ));

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

    if (data.length == 0)
    {
      console.log("Pas de réseau chaleur froid");
      document.querySelector('#chaleurFroid').setAttribute('style', 'display:none');
    }
    else
    {
      document.querySelector('#chaleurFroid').setAttribute('style', 'display:block');
      // var out ="<table id='etabEtabsTable' width='100%'><thead><th width='14%'>Opérateur</th><th width='14%'>Année</th><th width='14%'>Filière</th><th width='14%'>Puissance (MW)</th><th width='14%'>Production (MWh)</th><th width='14%'>Résidentiel (MWh)</th><th width='14%'>Tertiaire (MWh)</th></thead>";
      var out ="<table id='etabEtabsTable' width='100%'><thead><th width='14%'>Opérateur</th><th width='14%'>Année</th><th width='14%'>Résidentiel (MWh)</th><th width='14%'>Tertiaire (MWh)</th></thead>";
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
        // + "</td><td>" + ((data[n]['filiere'] == 'C')? 'Chaleur' : 'Froid')
        // + "</td><td>" + data[n]['pdl']
        // + "</td><td>" + format(data[n]['puissance'])
        // + "</td><td>" + format(data[n]['prod_tot'])
        // + "</td><td>" + data[n]['pct_cog']
        // + "</td><td>" + data[n]['conso_agriculture']
        // + "</td><td>" + data[n]['conso_inconu']
        // + "</td><td>" + data[n]['conso_industrie']
        + "</td><td>" + format(data[n]['conso_residentiel'])
        + "</td><td>" + format(data[n]['conso_tertiaire']) + "</td></tr>";
      }
      out += "</tbody></table>";
      document.querySelector('#chaleurFroidData').innerHTML = out;
    }
  });
};

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iniPrevair
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/
var iniPrevair = function (commune)
{
  d3.json('data/lalo.php?lat=' + commune.latitude + '&lon=' + commune.longitude, function(error, data)
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


/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
iniEmissionsEtablissements
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

var iniEmissionsEtablissements = function (insee)
{
  //// bouton polluants hors CO2
  attachEvent(
    document.querySelector('#etabPolluants'),
    'click',
    function ()
    {
      bubbleJSON(insee, 0);
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
      bubbleJSON(insee, 1);
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
  bubbleJSON(insee, 0);
  d3.select('#etabPolluants').classed('active', true);
  d3.select('#etabCO2').classed('active', false);
  d3.select('#etabEtabs').classed('active', false);

};

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
