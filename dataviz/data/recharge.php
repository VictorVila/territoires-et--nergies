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

  if ($_GET['t'] === 'code_insee') $type_org = 'code_insee';
  if ($_GET['t'] === 'epci') $type_org = 'epci';

  $sql = "SELECT DISTINCT *
  FROM `recharge`
  WHERE   $type_org = '" . $_GET['i'] . "' ";
 
  $out = "[";
  try
  {
    $result = $connect->query( $sql );

    if ( mysqli_num_rows($result) == 0 )
    {
      echo "[{}]"; die;
    }

    while( $r = mysqli_fetch_assoc( $result ) )
    {
      $out .= ' {"id_org": "' . $r['id_org'] . '", ';
      $out .= ' "n_station": "' . $r['n_station'] . '", ';
      $out .= ' "a_station": "' . $r['a_station'] . '", ';
      $out .= ' "code_insee": "' . $r['code_insee'] . '", ';
      $out .= ' "epci": "' . $r['epci'] . '", ';
      $out .= ' "Xlongitude": "' . $r['Xlongitude'] . '", ';
      $out .= ' "Ylatitude": "' . $r['Ylatitude'] . '", ';
      $out .= ' "nbre_pdc": "' . $r['nbre_pdc'] . '", ';
      $out .= ' "puiss_max": "' . $r['puiss_max'] . '", ';
      $out .= ' "type_prise": "' . $r['type_prise'] . '", ';
      $out .= ' "accessibilite": "' . $r['accessibilite'] . '"},';
    }
    $out = substr($out, 0, -1);
    $out .= "]";
    echo ( $out );
  }
  catch ( Exception $e )
  {
    echo 'Erreur : ' . $e->getMessage();
  }
  finally
  {
    $connect->close();
  }
  ?>
