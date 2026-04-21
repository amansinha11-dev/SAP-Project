CREATE DATABASE IF NOT EXISTS pharmacy_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'pharmacy_user'@'localhost'
  IDENTIFIED BY 'Pharmacy@12345';

GRANT ALL PRIVILEGES ON pharmacy_db.* TO 'pharmacy_user'@'localhost';
FLUSH PRIVILEGES;
