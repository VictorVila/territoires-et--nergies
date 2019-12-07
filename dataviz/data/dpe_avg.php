<?php
header('Content-Type: application/json; charset=utf-8');

$out = "[{}]";

if (!isset($_GET)) return $out;
if (!isset($_GET['id_org'])) return $out;
if (!is_numeric($_GET['id_org'])) return $out;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
select
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

require_once('connect.php');

$sql = "SELECT  *
        FROM  dpe_avg
        WHERE  id_org = '" . $_GET['id_org'] . "'
        LIMIT 1";

// echo "$sql <br>";

$out = "[";
try
{
  $result = $connect->query( $sql );

  while( $r = mysqli_fetch_assoc( $result ) )
  {
    $out .= ' {"cp": "' . $r['cp'] . '", ';
    $out .= ' "annee": "' . $r['annee'] . '", ';
    $out .= ' "conso_m2": "' . $r['conso_m2'] . '", ';
    $out .= ' "surface": "' . $r['surface'] . '", ';
    $out .= ' "ges": "' . $r['ges'] . '", ';
    $out .= ' "chauffage": "' . $r['besoin_chauffage'] . '", ';
    $out .= ' "altitude": "' . $r['altitude'] . '", ';
    $out .= ' "nb_dpe": "' . $r['nb_dpe'] . '"}';
  }
}
catch ( Exception $e )
{
  echo 'Erreur : ' . $e->getMessage();
}
finally
{
  $connect->close();
  $out .= "]";
  echo ( $out );
}
?>
