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
  FROM `production`
  WHERE   id_org = '" . $_GET['i'] . "' ";

  $out = "[";
  try
  {
    $result = $connect->query( $sql );

    while( $r = mysqli_fetch_assoc( $result ) )
    {
      $out .= ' {"id_org": "' . $r['id_org'] . '", ';
      $out .= ' "nb": "' . $r['nb'] . '", ';
      $out .= ' "puissance": "' . $r['puissance'] . '"},';
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
  }
  ?>
