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

$sql = "SELECT  *
FROM organismes_20_50
WHERE insee = '" . $_GET['i'] . "'
LIMIT 1";

$out = "[";
try
{
  $result = $connect->query( $sql );

  while( $r = mysqli_fetch_assoc( $result ) )
  {
    $forme = str_replace('"', '\"', $r['forme']);

    $out .= '{"insee":"' . $r['insee']
      . '", "libelle": "' . $r['libelle']
      . '", "code_region": "' . $r['code_region']
      . '", "code_dept": "' . $r['code_dept']
      . '", "population": "' . $r['population']
      . '", "population_2010": "' . $r['population_2010']
      . '", "superficie": "' . $r['superficie']
      . '", "menages": "' . $r['menages']
      . '", "logements": "' . $r['logements']
      . '", "salaries": "' . $r['salaries']
      . '", "ets_actifs": "' . $r['ets_actifs']
      . '", "ets_agriculture": "' . $r['ets_agriculture']
      . '", "ets_industrie": "' . $r['ets_industrie']
      . '", "ets_construction": "' . $r['ets_construction']
      . '", "ets_com_serv": "' . $r['ets_com_serv']
      . '", "ets_repar_auto": "' . $r['ets_repar_auto']
      . '", "ets_adm": "' . $r['ets_adm']
      . '", "ets_moins_10": "' . $r['ets_moins_10']
      . '", "ets_plus_10": "' . $r['ets_plus_10']
      . '", "code_epci": "' . $r['code_epci']
      . '", "epci": "' . $r['epci']
      . '", "forme": "' . $forme
      . '", "geolocalisation": "' . $r['geolocalisation']
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
