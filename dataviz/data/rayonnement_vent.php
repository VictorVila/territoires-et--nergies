<?php
header('Content-Type: application/json; charset=utf-8');

$out = "[{}]";

if (!isset($_GET)) return $out;
if (!isset($_GET['r'])) return $out;
if (!is_numeric($_GET['r'])) return $out;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
select
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

require_once('connect.php');

$sql = 'SELECT  *
        FROM  region_rayonnement_vent
        WHERE code_insee_region = "' . $_GET['r'] . '"
        LIMIT 1';

// echo "$sql <br>";

$out = "[";
try
{
  $result = $connect->query( $sql );

  while( $r = mysqli_fetch_assoc( $result ) )
  {
    $out .= ' {"code_insee_region": "' . $r['code_insee_region'] . '", ';
    $out .= ' "rayonnement": "' . $r['rayonnement'] . '", ';
    $out .= ' "vent": "' . $r['vent'] . '"}';
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
