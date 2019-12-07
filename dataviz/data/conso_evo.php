<?php
header('Content-Type: text/plain; charset=utf-8');

$out = "[{}]";
  if (!isset($_GET)) return $out;
  if (!isset($_GET['i'])) return $out;
  if (!is_numeric($_GET['i'])) return $out;

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  select
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  require_once('connect.php');

  $sql = "SELECT `filiere`,`annee`,
          ceil(`conso_agriculture`) as agriculture,
          ceil(`conso_industrie`) as industrie, ceil(`conso_tertiaire`) as tertiaire,
          ceil(`conso_residentiel`) as residentiel, ceil(`conso_inconu`) as inconu
  FROM `consomation`
  WHERE   id_org = '" . $_GET['i'] . "'
  ORDER BY filiere ASC";

  $out = "key,value,date\n";
  try
  {
    $result = $connect->query( $sql );

    $i = 0;

    while( $r = mysqli_fetch_assoc( $result ) )
    {
      $arr[$i]['key'] = $r['filiere'] . " - Agriculture";
      $arr[$i]['value'] = $r['agriculture'];
      $arr[$i]['annee'] = $r['annee'];
      $i++;
      $arr[$i]['key'] = $r['filiere'] . " - Industrie";
      $arr[$i]['value'] = $r['industrie'];
      $arr[$i]['annee'] = $r['annee'];
      $i++;
      $arr[$i]['key'] = $r['filiere'] . " - Tertiaire";
      $arr[$i]['value'] = $r['tertiaire'];
      $arr[$i]['annee'] = $r['annee'];
      $i++;
      $arr[$i]['key'] = $r['filiere'] . " - Residentiel";
      $arr[$i]['value'] = $r['residentiel'];
      $arr[$i]['annee'] = $r['annee'];
      $i++;
      $arr[$i]['key'] = $r['filiere'] . " - Inconu";
      $arr[$i]['value'] = $r['inconu'];
      $arr[$i]['annee'] = $r['annee'];
      $i++;
    }

    //// http://php.net/manual/es/function.array-multisort.php
    //// Obtener una lista de columnas

    foreach ($arr as $clave => $fila)
    {
        $key[$clave] = $fila['key'];
        $value[$clave] = $fila['value'];
        $annee[$clave] = $fila['annee'];
    }

    // Ordenar los datos y agregar $arr como el último parámetro, para ordenar por la clave común
    array_multisort($key, SORT_ASC, $annee, SORT_ASC, $arr);

    //// préparer la sortie
    foreach ( $arr as $v )
    {
      $value = ($v['value'] === '0')? '1' : $v['value'];
      $annee = substr($v['annee'], 2);
      $out .= $v['key'] . "," . $value . ",12/31/" . $annee . "\n";
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
