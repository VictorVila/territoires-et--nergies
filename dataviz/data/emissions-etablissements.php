<?php
header('Content-Type: application/json; charset=utf-8');

$out = "[{}]";

if (!isset($_GET)) return $out;
if (!isset($_GET['i'])) return $out;
if (!is_numeric($_GET['i'])) return $out;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
select
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

require_once('connect.php');

// On étend la requête au niveau du département
/*$sql = 'SELECT  *
        FROM    emissions_etablissements
        WHERE   insee LIKE "' . substr($_GET['i'], 0, 2) . '%"';*/

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Explication concernant les données de georisques
Si un établissement a 15 sites de production,
le chiffre total de polluants est indiqué pour chaque site
Si non, on ne peut pas s'expliquer que les 15 sites produisent
exactement la même quantité de polluants.
Information confirmée avec les données de la page http://www.georisques.gouv.fr/dossiers/irep/form-substance/resultats?annee=2016&rejet=1&polluant=131#/
La solution est de ne pas tenir compte des codes insee
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*$sql = 'SELECT  etablissement, polluant, quantite,
                unite, libelle_ape
        FROM    emissions_etablissements
        WHERE   insee LIKE "' . substr($_GET['i'], 0, 2) . '%"
        GROUP BY etablissement, polluant, quantite,
                unite, libelle_ape';*/
$sql = 'SELECT DISTINCT etablissement, polluant, quantite, unite,
        libelle_ape
        FROM    emissions_etablissements
        WHERE   insee LIKE "' . substr($_GET['i'], 0, 2) . '%"
        AND polluant != "CO2 Total (CO2 d\'origine biomasse et non biomasse)"';
/* il faut exclure "d'origine biomasse et non biomasse" car dans toutes les vérifications
manuelles font des doublons :

CHEMVIRON
CO2 Total d'origine non biomasse uniquement
13600.000

CHEMVIRON
CO2 Total (CO2 d'origine biomasse et non biomasse)
13600.000

BONILAIT PROTEINES
CO2 Total (CO2 d'origine biomasse et non biomasse)
13500.000

BONILAIT PROTEINES
CO2 Total d'origine biomasse uniquement
13500.000

*/

// echo "$sql <br>";


$out = "[";
try
{
  $result = $connect->query( $sql );

  while( $r = mysqli_fetch_assoc( $result ) )
  {
    // $out .= '{"insee": "' . $r['insee'] . '", ';
    $out .= ' {"etablissement": "' . $r['etablissement'] . '", ';
    // $out .= ' "annee": "' . $r['annee'] . '", ';
    // $out .= ' "milieu": "' . $r['milieu'] . '", ';
    $out .= ' "polluant": "' . $r['polluant'] . '", ';
    $out .= ' "quantite": "' . $r['quantite'] . '", ';
    $out .= ' "unite": "' . $r['unite'] . '", ';
    $out .= ' "libelle_ape": "' . $r['libelle_ape'] . '"},';
    // $out .= ' "libelle_eprtr": "' . $r['libelle_eprtr'] . '" },' ;
  }
}
catch ( Exception $e )
{
  echo 'Erreur : ' . $e->getMessage();
}
finally
{
  $connect->close();
  $out = substr($out, 0, -1);
  $out .= "]";
  echo ( $out );
}
?>
