<?php
  // paramètres
  if ($_SERVER['SERVER_NAME'] == '127.0.0.1')
  {
      $host = 'localhost';
      $user = 'root';
      $pass = '123';
      $name = 'energie';
  }
  if ($_SERVER['SERVER_NAME'] == 'localhost')
  {
      $host = 'localhost';
      $user = 'root';
      $pass = '123';
      $name = 'energie';
  }

  if ($_SERVER['SERVER_NAME'] == 'tirop.com')
  {
    $host = 'tirop-tirop.mysql.db';
    $user = 'tirop-tirop';
    $pass = 'ka2b0um';
    $name = 'tirop-tirop';
  }

  $connect  = new mysqli($host, $user, $pass, $name);
  $connect->query("SET NAMES 'utf8'");

  // check
  if ( $connect->connect_error )
  die("Erreur de connexion à la BDD : " . $connect->connect_error);

?>
