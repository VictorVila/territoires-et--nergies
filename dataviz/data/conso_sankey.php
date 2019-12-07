<?php
header('Content-Type: text/plain; charset=utf-8');

$out = "[{}]";
  if (!isset($_GET)) return $out;
  if (!isset($_GET['i'])) return $out;
  if (!isset($_GET['f'])) return $out;
  if (!is_numeric($_GET['i'])) return $out;
  if ($_GET['f'] !== 'e' && $_GET['f'] !== 'g' ) return $out;

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  select
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  require_once('connect.php');

  switch ($_GET['f'])
  {
    case 'e' :
    $filiere = 'Electricité';
    break;
    case 'g' :
    $filiere = 'Gaz';
    break;
    default :
    die('Pas de filière indiquée');
  }

  $sql = "SELECT `filiere`, `conso_totale`, ceil(`conso_agriculture`) as agriculture,
  ceil(`conso_industrie`) as industrie, ceil(`conso_tertiaire`) as tertiaire,
  ceil(`conso_residentiel`) as residentiel, ceil(`conso_inconu`) as inconu,
  annee
  FROM `consomation`
  WHERE   id_org = '" . $_GET['i'] . "'
  AND filiere = '" . $filiere . "'
  ORDER BY annee DESC
  LIMIT   1";
  // echo $sql;die;
  $out = "source,target,value,annee\n";
  try
  {
    $result = $connect->query( $sql );

    while( $r = mysqli_fetch_assoc( $result ) )
    {
      ($r['agriculture'] < 1) ? $agr = 1 : $agr = $r['agriculture'];
      ($r['industrie'] < 1) ? $ind = 1 : $ind = $r['industrie'];
      ($r['tertiaire'] < 1) ? $ter = 1 : $ter = $r['tertiaire'];
      ($r['residentiel'] < 1) ? $res = 1 : $res = $r['residentiel'];
      ($r['inconu'] < 1) ? $inc = 1 : $inc = $r['inconu'];

      $out .= "agriculture,total," . $agr . "," . $r['annee'] . "\n";
      $out .= "industrie,total," . $ind . "," . $r['annee'] . "\n";
      $out .= "tertiaire,total," . $ter . "," . $r['annee'] . "\n";
      $out .= "residentiel,total," . $res . "," . $r['annee'] . "\n";
      $out .= "inconu,total," . $inc . "," . $r['annee'] . "\n";
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
