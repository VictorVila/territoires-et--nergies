<?php
header('Content-Type: application/json; charset=utf-8');

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  select
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
require_once('connect.php');

$sql = "SELECT  DISTINCT(insee), libelle, code_dept
        FROM organismes_20_50
        ORDER BY libelle ASC";

$out = "[";
try
{
  $result = $connect->query( $sql );

  while( $r = mysqli_fetch_assoc( $result ) )
  {
    $out .= '{"insee":"' . $r['insee']
         . '", "libelle": "' . $r['libelle']
         . '", "code_dept": "' . $r['code_dept'] . '"},';
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
