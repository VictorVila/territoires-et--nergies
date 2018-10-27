<?php
header('Content-Type: application/json; charset=utf-8');

$out = "[{}]";

if (!isset($_GET)) return $out;
if (!isset($_GET['lat'])) return $out;
if (!isset($_GET['lon'])) return $out;
if (!is_numeric($_GET['lat'])) return $out;
if (!is_numeric($_GET['lon'])) return $out;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
select
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*
Beaune 47.025459234 , 4.83739034748
Garder un decimal (minute?)
Test avec Beaune, Agen , ... le resultat est dans un rayon de 10 km
Il y a entre 15 et 21 résultats, toutes avec des valeurs semblables
*/

$lat = number_format((float)$_GET['lat'], 1, '.', '');
$lon = number_format((float)$_GET['lon'], 1, '.', '');

// echo "Beaune 47.025459234 , 4.83739034748<br>";
// echo "Beaune $lat , $lon <br>";

require_once('connect.php');

$sql = 'SELECT  *
        FROM    prevair_moyJ0
        WHERE   latitude LIKE "' . $lat . '%"
        AND     longitude LIKE "' . $lon . '%"
        LIMIT   1';
// echo "$sql <br>";


$out = "[";
try
{
  $result = $connect->query( $sql );

  while( $r = mysqli_fetch_assoc( $result ) )
  {
    $out .= '{"no2": "' . $r['no2'] . '", ';
    $out .= ' "o3": "' . $r['o3'] . '", ';
    $out .= ' "pm10": "' . $r['pm10'] . '", ';
    $out .= ' "pm25": "' . $r['pm25'] . '", ';
    $out .= ' "lat": "' . $r['latitude'] . '", ';
    $out .= ' "lon": "' . $r['longitude'] . '" }' ;
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
