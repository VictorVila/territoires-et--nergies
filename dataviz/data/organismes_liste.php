<?php
header('Content-Type: application/json; charset=utf-8');

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  select
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/
require_once('connect.php');

$sql = "SELECT  DISTINCT(insee), libelle, code_dept
        -- FROM organismes_20_50
        FROM communes_20_50
        ORDER BY libelle ASC";

$sql2 = "SELECT  DISTINCT(epci), libepci, code_dept
        FROM epci
        ORDER BY libepci ASC";

$out = "[";
try
{
  $result = $connect->query( $sql );

  while( $r = mysqli_fetch_assoc( $result ) )
  {
    $out .= '{"insee":"' . $r['insee']
         . '", "libelle": "' . $r['libelle']
         . '", "code_dept": "' . $r['code_dept']
         . '", "typeLabel": "commune", "type": 0},';
  }

  $result = $connect->query( $sql2 );

  while( $r = mysqli_fetch_assoc( $result ) )
  {
    $out .= '{"insee":"' . $r['epci']
         . '", "libelle": "' . $r['libepci']
         . '", "code_dept": "' . $r['code_dept']
         . '", "typeLabel": "epci", "type": 1},';
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
