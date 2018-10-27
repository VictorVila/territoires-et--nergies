<?php
header('Content-Type: application/json; charset=utf-8');

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
  ceil(`conso_residentiel`) as residentiel, ceil(`conso_inconu`) as inconu
  FROM `consomation_20_50`
  WHERE   insee = '" . $_GET['i'] . "'
  AND filiere = '" . $filiere . "'
  ORDER BY annee DESC
  LIMIT   1";

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

      $out .= "agriculture,total," . $agr . ",2016\n";
      $out .= "industrie,total," . $ind . ",2016\n";
      $out .= "tertiaire,total," . $ter . ",2016\n";
      $out .= "residentiel,total," . $res . ",2016\n";
      $out .= "inconu,total," . $inc . ",2016\n";
      /*
      if ($filiere === 'Electricité')
      {
      $out .= "agriculture,total," . $agr . ",2016\n";
      $out .= "industrie,total," . $ind . ",2016\n";
      $out .= "tertiaire,total," . $ter . ",2016\n";
      $out .= "residentiel,total," . $res . ",2016\n";
      $out .= "inconu,total," . $inc . ",2016\n";
    }

    if ($filiere === 'Gaz')
    {
    $out .= "total,agriculture," . $agr . ",2016\n";
    $out .= "total,industrie," . $ind . ",2016\n";
    $out .= "total,tertiaire," . $ter . ",2016\n";
    $out .= "total,residentiel," . $res . ",2016\n";
    $out .= "total,inconu," . $inc . ",2016\n";
  }
  */
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
