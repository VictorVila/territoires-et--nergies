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
FROM chaleur_froid_20_50
WHERE insee = '" . $_GET['i'] . "'
ORDER BY annee";

$out = "[";
try
{
  $result = $connect->query( $sql ); 

  while( $r = mysqli_fetch_assoc( $result ) )
  {
    $forme = str_replace('"', '\"', $r['forme']);

    $out .= '{"insee":"' . $r['insee']
      . '", "operateur": "' . $r['operateur']
      . '", "annee": "' . $r['annee']
      . '", "filiere": "' . $r['filiere']
      . '", "pdl": "' . $r['pdl']
      . '", "puissance": "' . $r['puissance']
      . '", "prod_tot": "' . $r['prod_tot']
      . '", "pct_cog": "' . $r['pct_cog']
      . '", "conso_agriculture": "' . $r['conso_agriculture']
      . '", "conso_inconu": "' . $r['conso_inconu']
      . '", "conso_industrie": "' . $r['conso_industrie']
      . '", "conso_residentiel": "' . $r['conso_residentiel']
      . '", "conso_tertiaire": "' . $r['conso_tertiaire'] . '"},';
    }
  }
  catch ( Exception $e )
  {
    echo 'Erreur : ' . $e->getMessage();
  }
  finally
  {
    $connect->close();
    if ($out != "[") $out = substr($out, 0, -1);
    $out .= "]";

    echo ( $out );
    // echo  $sql;
  }

  ?>
