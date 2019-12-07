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
        FROM    epci
        WHERE   epci = '" . $_GET['i'] . "'
        LIMIT   1";

$out = "[";
try
{
  $result = $connect->query( $sql );

  while( $r = mysqli_fetch_assoc( $result ) )
  {
    $forme = str_replace('"', '\"', $r['forme']);

    $out .= '{"insee":"' . $r['epci']
      . '", "libelle": "' . $r['libepci']
      . '", "code_region": "' . $r['code_region']
      . '", "region": "' . $r['region']
      . '", "code_dept": "' . $r['code_dept']
      . '", "codes_depts": "' . $r['codes_depts']
      . '", "departement": "' . $r['departement']
      . '", "population": "' . $r['population']
      . '", "population_2010": "' . $r['population_2010']
      . '", "superficie": "' . $r['superficie']
      . '", "menages": "' . $r['menages']
      . '", "logements": "' . $r['logements']
      . '", "ets_actifs": "' . $r['ets_actifs']
      . '", "ets_agriculture": "' . $r['ets_agriculture']
      . '", "ets_industrie": "' . $r['ets_industrie']
      . '", "ets_construction": "' . $r['ets_construction']
      . '", "ets_com_serv": "' . $r['ets_com_serv']
      . '", "ets_repar_auto": "' . $r['ets_repar_auto']
      . '", "ets_adm": "' . $r['ets_adm']
      . '", "ets_moins_10": "' . $r['ets_moins_10']
      . '", "ets_plus_10": "' . $r['ets_plus_10']
      . '", "code_epci": "' . $r['epci']
      . '", "nb_communes": "' . $r['nb_communes']
      . '", "geo_point": "' . $r['geo_point']
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
