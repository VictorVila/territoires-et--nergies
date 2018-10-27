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
        FROM  region_enr
        WHERE insee = "' . $_GET['r'] . '"
        LIMIT 1';

// echo "$sql <br>";

$out = "[";
try
{
  $result = $connect->query( $sql );

  while( $r = mysqli_fetch_assoc( $result ) )
  {
    $out .= ' {"insee": "' . $r['insee'] . '", ';
    $out .= ' "annee": "' . $r['annee'] . '", ';
    $out .= ' "region": "' . $r['region'] . '", ';
    $out .= ' "hydraulique": "' . $r['hydraulique'] . '", ';
    $out .= ' "bioenergies": "' . $r['bioenergies'] . '", ';
    $out .= ' "eolienne": "' . $r['eolienne'] . '", ';
    $out .= ' "solaire": "' . $r['solaire'] . '", ';
    $out .= ' "gaz": "' . $r['gaz'] . '", ';
    $out .= ' "total": "' . $r['total'] . '"}';
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
