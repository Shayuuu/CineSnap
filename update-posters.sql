-- Update existing movies with TMDB poster URLs
-- Run this in MySQL Workbench to update poster URLs for existing movies

USE bookmyseat;

UPDATE `Movie` SET `posterUrl` = 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg' WHERE `id` = 'movie1' AND (`posterUrl` IS NULL OR `posterUrl` = '/posters/dark-knight.jpg');
UPDATE `Movie` SET `posterUrl` = 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' WHERE `id` = 'movie2' AND (`posterUrl` IS NULL OR `posterUrl` = '/posters/inception.jpg');
UPDATE `Movie` SET `posterUrl` = 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' WHERE `id` = 'movie3' AND (`posterUrl` IS NULL OR `posterUrl` = '/posters/interstellar.jpg');
UPDATE `Movie` SET `posterUrl` = 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' WHERE `id` = 'movie4' AND (`posterUrl` IS NULL OR `posterUrl` = '/posters/matrix.jpg');
UPDATE `Movie` SET `posterUrl` = 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' WHERE `id` = 'movie5' AND (`posterUrl` IS NULL OR `posterUrl` = '/posters/pulp-fiction.jpg');


