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

  $sql = "SELECT ceil(sum(conso_totale)) as consommation, annee
  FROM `consomation_20_50`
  WHERE   insee = '" . $_GET['i'] . "'
  GROUP BY annee
  ORDER BY annee ASC";

  $out = "value,date\n";
  try
  {
    $result = $connect->query( $sql );

    while( $r = mysqli_fetch_assoc( $result ) )
    {
      $out .= $r['consommation'] . "," . $r['annee'] . "\n";
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
  }
  ?>
