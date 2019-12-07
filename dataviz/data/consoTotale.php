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

$sql = "SELECT `annee`, `conso_totale`,`filiere`
        FROM `consomation`
        WHERE id_org='" . $_GET['i']. "'
        ORDER BY filiere ASC, annee DESC";
// BEAUNE EPCI :  SELECT `annee`, `conso_totale`,`filiere` FROM `consomation` WHERE id_org='200006682' ORDER BY filiere ASC, annee DESC

$out = "annee,conso_totale,filiere\n";
try
{
  $result = $connect->query( $sql );

  while( $r = mysqli_fetch_assoc( $result ) )
  {
    $out .= $r['annee'] . ',' . $r['conso_totale'] . ',' . $r['filiere'] . "\n";
  }
}
catch ( Exception $e )
{
  echo 'Erreur : ' . $e->getMessage();
}
finally
{
  $connect->close();

  echo ( $out );
  // echo  $sql;
}

?>
