// js/fonctions-d3js-v3.js


/* ~~~~~~~~~~~~~~~~~~~~~~~~~
Fonctions communes
~~~~~~~~~~~~~~~~~~~~~~~~~ */

// ajouter un évenement
var attachEvent = function (element, event, callbackFunction)
{
  if (element.addEventListener)
  {
    element.addEventListener(event, callbackFunction, false);
  }
  else if (element.attachEvent)
  {
    element.attachEvent('on' + event, callbackFunction);
  }
};


//// Polyfill pour la fonction contains() --IE--
if ( !String.prototype.contains )
{
  String.prototype.contains = function( searchElement )
  {
    return String.prototype.indexOf( searchElement ) !== -1;
  };
}

//// Polyfill pour la fonction includes() --IE--
if ( !String.prototype.includes )
{
  String.prototype.includes = function( searchElement )
  {
    return String.prototype.indexOf( searchElement ) !== -1;
  };
}

var inclue = function( a, b )
{
  return a.indexOf( b ) !== -1;
};

//// Formatter chiffres
var _f = function (n)
{
  return new Intl.NumberFormat('fr-FR').format(n);
};

//// set values in ID's
var _s = function (id, val)
{
  try { document.querySelector('#'+id).innerHTML = val; }
  catch (e) { document.querySelector('#'+id).innerHTML = dash; }
};



var materialize4 = [
  "rgba(54, 162, 235, 0.4)","rgba(255,202,40 ,0.4)", "rgba(153, 102, 255, 0.4)", "rgba(201, 203, 207, 0.4)","rgba(255, 99, 132, 0.4)", "rgba(255, 159, 64, 0.4)", "rgba(255, 205, 86, 0.4)", "rgba(75, 192, 192, 0.4)",


  "rgba(255,238,88 ,0.4)", "rgba(255,167,38 ,0.4)", "rgba(255,112,67 ,0.4)",
  "rgba(239,83,80 ,0.4)", "rgba(236,64,122 ,0.4)",
  "rgba(171,71,188 ,0.4)", "rgba(126,87,194 ,0.4)", "rgba(92,107,192 ,0.4)", "rgba(66,165,245 ,0.4)", "rgba(41,182,246 ,0.4)",
  "rgba(38,198,218 ,0.4)", "rgba(38,166,154 ,0.4)", "rgba(102,187,106 ,0.4)", "rgba(156,204,101 ,0.4)", "rgba(212,225,87 ,0.4)",
  "rgba(141,110,99 ,0.4)", "rgba(189,189,189 ,0.4)", "rgba(120,144,156 ,0.4)"

];



/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
barChart
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/
var barChart = function (op)
{
  var margin = {top: 20, right: 20, bottom: 70, left: 40},
  width = op.w - margin.left - margin.right,
  height = op.h - margin.top - margin.bottom;

  // Parse the date / time
  var	parseDate = d3.time.format("%Y").parse;
  var x = d3.scale.ordinal().rangeRoundBands([0, width], .25);
  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom")
  .tickFormat(d3.time.format("%Y"));

  var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .ticks(op.ticks);

  var svg = d3.select(op.selector).append("svg")
  .attr('id', op.id)
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
  "translate(" + margin.left + "," + margin.top + ")");

  d3.csv(op.csv, function(error, data) {

    data.forEach(function(d) {
      d.date = parseDate(d.date);
      d.value = parseInt(+d.value);
    });

    x.domain(data.map(function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);

    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", "-.55em")
    // .attr('fill', '#7e7e7e')
    .attr("transform", "rotate(-45)" );

    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
    /*
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("MWh");
    */

    svg.selectAll("bar")
    .data(data)
    .enter().append("rect")
    .style("fill", "steelblue")
    .attr("x", function(d) { return x(d.date); })
    .attr("width", x.rangeBand())
    .attr("y", function(d) { return y(d.value); })
    .attr("height", function(d) { return height - y(d.value); });

  });
};


/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
lineChart
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

var lineChart = function (selector)
{
  var svg = d3.select(selector),
  margin = {top: 20, right: 20, bottom: 30, left: 50},
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom,
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // var parseTime = d3.timeParse("%d-%b-%y");

  var x = d3.time.scale()
  .rangeRound([0, width]);

  var y = d3.scale.linear()
  .rangeRound([height, 0]);

  var line = d3.svg.line()
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.close); });

  d3.tsv("data.tsv", function(d) {
    // d.date = parseTime(d.date);
    d.close = +d.close;
    return d;
  }, function(error, data) {
    if (error) throw error;

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain(d3.extent(data, function(d) { return d.close; }));

    g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axis.orient("bottom"))
    .select(".domain")
    .remove();

    g.append("g")
    .call(d3.axis.orient("left"))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Price ($)");

    g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("d", line);
  });
};


/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
streamChart
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Adaptation du code de http://bl.ocks.org/WillTurman/4631136
*/

var streamChart = function (op)
{
  //// S'assurer que le div est vide d'anciens svg
  document.querySelector(op.selector).innerHTML='';

  chart(op.csv);

  var datearray = [];
  var colorrange = [];

  function chart(csvpath)
  {
    //// config
    colorrange = [
      "#B30000",
      "#E34A33",
      "#FC8D59",
      "#FDBB84",
      "#FDD49E",
      "#045A8D",
      "#2B8CBE",
      "#74A9CF",
      "#A6BDDB",
      "#D0D1E6"];

      strokecolor = colorrange[0];
      var format = d3.time.format("%m/%d/%y");
      var margin = {top: 60, right: 80, bottom: 30, left: 80};
      // var width = document.querySelector(op.selector).clientWidth - margin.left - margin.right;
      // var height = 400 - margin.top - margin.bottom;
      console.log("stream clientWidth", document.querySelector(op.selector).clientWidth);
      console.log("stream width", width);

      var width = 620;
      var height = 306;
      //// tooltip
      var tooltip = d3.select(op.selector)
      .append("div")
      .attr("id", "streamTip")
      .attr("class", "remove");

      var x = d3.time.scale().range([0, width]);
      var y = d3.scale.linear().range([height-10, 0]);
      var z = d3.scale.ordinal().range(colorrange);

      var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(d3.time.years);

      var yAxis = d3.svg.axis().scale(y);
      var yAxisr = d3.svg.axis().scale(y);

      var stack = d3.layout.stack()
      .offset("silhouette")
      .values(function(d) { return d.values; })
      .x(function(d) { return d.date; })
      .y(function(d) { return d.value; });

      var nest = d3.nest().key(function(d) { return d.key; });

      var area = d3.svg.area()
      .interpolate("cardinal")
      .x(function(d) { return x(d.date); })
      .y0(function(d) { return y(d.y0); })
      .y1(function(d) { return y(d.y0 + d.y); });

      var svg = d3.select(op.selector).append("svg")
      // .attr("width", width + margin.left + margin.right)
      // .attr("height", height + margin.top + margin.bottom)
      // responsive SVG needs these 2 attributes and no width and height attr
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 780 405")
      .classed("svg-content-responsive", true)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //// Création du graph
      d3.csv(op.csv, function(data)
      {
        data.forEach( function(d)
        {
          d.date = format.parse(d.date);
          d.value = +d.value;
        });

        var layers = stack(nest.entries(data));

        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

        svg.selectAll(".layer")
        .data(layers)
        .enter().append("path")
        .attr("class", "layer")
        .attr("d", function(d) { return area(d.values); })
        .style("fill", function(d, i) { return z(i); });

        svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

        svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (width) + ", 0)")
        .call(yAxis.orient("right"));

        svg.append("g")
        .attr("class", "y axis")
        .call(yAxis.orient("left"));

        svg.selectAll(".layer")
        .attr("opacity", 1)
        .on("mouseover", function(d, i)
        {
          svg.selectAll(".layer").transition()
          .duration(250)
          .attr("opacity", function(d, j)
          {
            return j != i ? 0.6 : 1;
          })})

          .on("mousemove", function(d, i)
          {
            mousex = d3.mouse(this); // ex : [34, 26]
            mousex = mousex[0];
            var invertedx = x.invert(mousex); // ex : Fri Mar 09 2012 19:05:31 GMT+0100 (Central European Standard Time)
            // invertedx = invertedx.getMonth() + invertedx.getDate(); // ex : 11
            invertedx = invertedx.getFullYear();
            var selected = (d.values);
            for (var k = 0; k < selected.length; k++)
            {
              datearray[k] = selected[k].date
              // datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
              datearray[k] = datearray[k].getFullYear();
            }
            mousedate = datearray.indexOf(invertedx);
            pro = d.values[mousedate].value;

            d3.select(this)
            .classed("hover", true)
            .attr("stroke", strokecolor)
            .attr("stroke-width", "0.5px"),
            tooltip.html( "<p id='consoToolTip'>" + d.key + " - " + _f(parseInt(pro)) + " MWh en " + invertedx +"</p>" ).style("visibility", "visible");

          })
          .on("mouseout", function(d, i)
          {
            svg.selectAll(".layer")
            .transition()
            .duration(250)
            .attr("opacity", "1");
            d3.select(this)
            .classed("hover", false)
            .attr("stroke-width", "0px"), tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "hidden");
          });

          var vertical = d3.select(op.selector)
          .append("div")
          .attr("class", "remove")
          .style("position", "absolute")
          .style("z-index", "19")
          .style("width", "1px")
          .style("height", "380px")
          .style("top", "10px")
          .style("bottom", "30px")
          .style("left", "0px");
          // .style("background", "#fff");

          d3.select(op.selector)
          .on("mousemove", function()
          {
            mousex = d3.mouse(this);
            mousex = mousex[0] + 5;
            vertical.style("left", mousex + "px" )
          })
          .on("mouseover", function()
          {
            mousex = d3.mouse(this);
            mousex = mousex[0] + 5;
            vertical.style("left", mousex + "px")
          });
        }); // graph fin
      } // function chart
    }; // stream



    /*
    var bubbleChart = function (id, data_url)
    {
    var svg = d3.select(id),
    width = +svg.attr("width"),
    height = +svg.attr("height");

    var format = d3.format("d");

    // var color = d3.scaleOrdinal(d3.schemeCategory20c);
    var color = d3.scaleOrdinal(materialize4);

    var pack = d3.pack()
    .size([width, height])
    .padding(1.5);

    d3.csv(data_url, function(d)
    {
    d.value = +d.value;
    if (d.value) return d;
  }, function(error, classes)
  {
  if (error) throw error;

  var root = d3.hierarchy({children: classes})
  .sum(function(d) { return d.value; })
  .each(function(d)
  {
  if (id = d.data.id)
  {
  var id, i = id.lastIndexOf(".");
  d.id = id;
  d.package = id.slice(0, i);
  d.class = id.slice(i + 1);
}
});

var node = svg.selectAll(".node")
.data(pack(root).leaves())
.enter().append("g")
.attr("class", "node")
.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

node.append("circle")
.attr("id", function(d) { return d.id; })
.attr("r", function(d) { return d.r; })
.style("fill", function(d) { return color(d.package); });

node.append("clipPath")
.attr("id", function(d) { return "clip-" + d.id; })
.append("use")
.attr("xlink:href", function(d) { return "#" + d.id; });

node.append("text")
.attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
.selectAll("tspan")
.data(function(d) { return d.class.split(/(?=[A-Z][^A-Z])/g); })
.enter().append("tspan")
.attr("x", 0)
.attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
.text(function(d) { return d; });

node.append("title")
.text(function(d) { return d.id + "\n" + format(d.value) + '€'; });
});

};

*/




/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Etablissements polluants : bubbles
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/
var bubbleJSON = function (insee, filter)
{
  //// S'assurer que le div est vide d'anciens svg
  document.querySelector(etab.id).innerHTML='';

  etab.bubble = d3.layout.pack()
  .sort(null)
  .size([etab.diameter, etab.diameter])
  .padding(1.5);

  etab.svg = d3.select(etab.id).append("svg")
  // responsive SVG needs these 2 attributes and no width and height attr
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 580 580")
  .classed("svg-content-responsive", true)
  .attr("class", "bubble");

  etab.tooltip = d3.select(etab.idInfo)
  .append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("color", "white")
  .style("padding", "8px")
  .style("background-color", "rgba(0, 0, 0, 0.75)")
  .style("border-radius", "6px")
  .style("font", "12px sans-serif")
  .text("tooltip");

  //// habiliter le update
  if (!etab.donnees)
  {
    d3.json(etab.dataUrl + insee, function(error, root)
    {
      if (!error) etab.donnees = root;
      if (etab.donnees) iniBubbles(filter);
    });
  }
  else
  {
    iniBubbles(filter);
  }
};


/*
etabTable

On ne peut pas afficher les établissements sous forme de bulles :
le problème est que les émissions de CO2 sont bien plus importantes
que les autres. On fait le choix de les afficher en tableau
*/

var etabTable = function ()
{
  document.querySelector('#etabInfo').innerHTML = etab.etabInfoMsg;
  document.querySelector('#etabInfo').setAttribute('style', 'display: none');

  var out ="<table id='etabEtabsTable'><thead><th width='25%'>Etablissement</th><th width='25%'>APE</th><th width='25%'>Polluant</th><th width='25%'>Quantité</th></thead>";
  out += "<tbody>";
  for (n in etab.donnees)
  {
    out += "<tr><td>" + etab.donnees[n].etablissement + "</td><td>" + etab.donnees[n].libelle_ape + "</td><td>" + etab.donnees[n].polluant + "</td><td>" + _f(etab.donnees[n].quantite) + " " + etab.donnees[n].unite + "</td></tr>";
  }
  out += "</tbody>";
  out += "</table>";
  document.querySelector('#etabBubbles').innerHTML = out;
};


/*
iniBubbles

Base du bubble chart

*/
var iniBubbles = function (filter)
{
  // Attention, certains dépts n'ont pas des emissions de polluants autres que CO2 !
  var dataClasses = classes(etab.donnees, filter);
  if (dataClasses["children"].length < 1)
  {
    document.querySelector('#etabInfo').setAttribute('style', 'display: none');
    document.querySelector('#etabBubbles').innerHTML = "<p class=' mt40 center'>Dans ce département il n'y a pas d'émissions de ce type de polluants :) </p>";
    return;
  }

  // Afficher la barre d'info si elle était cachée (tableau établissements)
  document.querySelector('#etabInfo').setAttribute('style', 'display: block');
  document.querySelector('#etabInfo').innerHTML = etab.etabInfoMsg;

  etab.node = etab.svg.selectAll(".node")
  .data(etab.bubble.nodes( dataClasses )
  // enlève le principal
  .filter(function(d) { return !d.children; }));

  etab.node.exit()
  .remove();

  etab.node = etab.node.enter()
  .append("g")
  .attr("class", "node")
  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  etab.node.append("circle")
  .attr("r", function(d) { return d.r; })
  .style("fill", function(d) { return etab.color(d.packageName); })
  .on("mouseover", function(d)
  {
    //// info au survol
    var info = d.etablissement + "<br>" + d.ape + "<br><b id='polluant'>" + d.polluantComplet + " " + _f(d.quantite) + " " + d.unite + "</b>";
    document.querySelector("#etabInfo").innerHTML = info;

    etab.tooltip.text(d.className + ": " + etab.format(d.value));
    etab.tooltip.style("visibility", "visible");
  })
  .on("mousemove", function()
  {
    return etab.tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
  })
  .on("mouseout", function(){return etab.tooltip.style("visibility", "hidden");});

  etab.node.append("text")
  .attr("dy", ".3em")
  .style("text-anchor", "middle")
  .style("pointer-events", "none")
  //------ .text(function(d) { return d.className.substring(0, d.r / 3); });

  .text(function(d) { return d.className; });

  // etab.node.append("foreignObject")
  // .attr("class","foreignobj")
  // .append("xhtml:div")
  // .attr("dy", "-.3em")
  // .html(function(d) { return '' + ' <p class="title"> ' + d.className + '</p>';})
  // .attr("class","textdiv");
};


var classes = function (node, filter)
{
  var classes = [];
  var rePolluant = /\((.*)\)/g;

  for (n in node)
  {
    // polluant : raccourcir les noms des polluants pour l'affichage
    var polluant = node[n].polluant;
    if ( inclue( polluant, '(' ) )
    {
      try
      {
        polluant = polluant.match(rePolluant)[0];
        polluant = polluant.substring(1,(polluant.length-1))
      }
      catch(e) {}
    }

    if (inclue( polluant, 'NOx - NO + NO2')) polluant = 'NOx - NO + NO2';
    if (inclue( polluant, 'SOx - SO2 + SO3')) polluant = 'SOx - SO2 + SO3';
    if (inclue( polluant, 'Dioxines et furanes (PCDD + PCDF)')) polluant = 'PCDD + PCDF';
    if (inclue( polluant, "CO2 Total d'origine biomasse uniquement")) polluant = "CO2 origine biomasse";
    if (inclue( polluant, "CO2 Total d'origine non biomasse uniquement")) polluant = "CO2 origine non biomasse";

    // value
    var value = parseInt(node[n].quantite);

    // filter
    switch (filter)
    {
      case 0 :
        if ( inclue( etab.donnees[n].polluant, 'CO2' ) ) continue;
        packageName = polluant;
        className = polluant;
        break;

      case 1 :
        if ( ! inclue( etab.donnees[n].polluant, 'CO2' ) ) continue;
        packageName = polluant;
        className = polluant;
        break;

      case 2 :
        packageName = node[n].etablissement;
        className = node[n].etablissement;
        value = 100;
        break;
    }

    classes.push({
      etablissement: node[n].etablissement,
      packageName: packageName,
      className: className,
      polluantComplet: node[n].polluant,
      value: value,
      quantite: node[n].quantite,
      unite: node[n].unite,
      ape: node[n].libelle_ape
    });
  } // for
  return {children: classes};
};


// var treeMap = function (id, size, paddingOuter, data)
var treeMap = function ( )
{
  var width = 580,
      height = 580;

  var color = d3.scale.category20c();

  var treemap = d3.layout.treemap()
      .size([width, height])
      .padding(4)
      .value(function(d) { return d.quantite; });

  var div = d3.select("body").append("div")
      .style("position", "relative")
      .style("width", width + "px")
      .style("height", height + "px");

  d3.json("http://localhost/www/energie/dataviz/data/emissions-etablissements.php?i=13002", function(error, root) {
    if (error) throw error;

    div.selectAll(".node")
        .data(treemap.nodes(root))
      .enter().append("div")
        .attr("class", "node")
        .style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; })
        .style("background", function(d) { return d.children ? color(d.polluant) : null; })
        .text(function(d) { return d.children ? null : d.polluant; });
  });


};
