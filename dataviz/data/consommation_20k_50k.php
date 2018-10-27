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

$sql = "SELECT *
        FROM consomation_20_50
        WHERE insee = '" . $_GET['i']. "'
        ORDER BY annee DESC";

$out = "[";
try
{
  $result = $connect->query( $sql );

  while( $r = mysqli_fetch_assoc( $result ) )
  {
    $out .= '{"annee":"' . $r['annee']
        . '", "filiere": "' . $r['filiere']
        . '", "conso_totale": "' . $r['conso_totale']
        . '", "conso_agriculture": "' . $r['conso_agriculture']
        . '", "points_agriculture": "' . $r['points_agriculture']
        . '", "conso_industrie": "' . $r['conso_industrie']
        . '", "points_industrie": "' . $r['points_industrie']
        . '", "conso_tertiaire": "' . $r['conso_tertiaire']
        . '", "points_tertiaire": "' . $r['points_tertiaire']
        . '", "conso_residentiel": "' . $r['conso_residentiel']
        . '", "points_residentiel": "' . $r['points_residentiel']
        . '", "conso_inconu": "' . $r['conso_inconu']
        . '", "points_inconu": "' . $r['points_inconu']
        . '", "mailles_residentiel": "' . $r['mailles_residentiel']
        . '", "mailles_inconu": "' . $r['mailles_inconu']
        . '"},';
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
  // echo  $sql;
}

?>
