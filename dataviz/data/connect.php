<?php
  // paramètres
  if ($_SERVER['SERVER_NAME'] == 'localhost')
  {
      $host = 'localhost';
      $user = 'root';
      $pass = 'root';
      $name = 'energie';
  }

  if ($_SERVER['SERVER_NAME'] == 'tirop.com')
  {
      $host = 'votre host';
      $user = 'votre utilisateur';
      $pass = 'votre mot de passe';
      $name = 'votre bdd';
  }

  $connect  = new mysqli($host, $user, $pass, $name);
  $connect->query("SET NAMES 'utf8'");

  // check
  if ( $connect->connect_error )
  die("Erreur de connexion à la BDD : " . $connect->connect_error);

?>
