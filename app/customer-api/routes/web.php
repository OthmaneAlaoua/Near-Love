<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/
$router->group([
    'middleware' => ['auth'],
], function () use ($router) {
    $router->get("/information","CustomerController@getInformations");
    $router->post('/information',"CustomerController@editProfil");
    $router->post('/images/', 'CustomerController@uploadImages');
    $router->get('/images/{imageId}', 'CustomerController@getImage');
    $router->delete('/images/{imageId}', 'CustomerController@deleteImage');
    $router->get('/matching/', 'CustomerController@getMatching');
    $router->post('/set-decision/', 'CustomerController@setDecision');
});

$router->group([
    'middleware' => ['intern'],
], function () use ($router) {
    $router->get('/information/{id}', 'CustomerController@getUserById');
    $router->post('/informations/', 'CustomerController@getUserByArray');
    $router->post('/set-matching/', 'CustomerController@setMatching');
});

$router->post('/register', 'CustomerController@register');
$router->post('/login/', 'SecurityController@checkLogin');

