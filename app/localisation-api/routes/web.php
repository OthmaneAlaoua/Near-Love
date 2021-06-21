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
    $router->post('localisation',"LocalisationController@setLocalisation");
});

$router->group([
    'middleware' => ['intern'],
], function () use ($router) {
    $router->get('localisation',"LocalisationController@getLocalisation");
    $router->get('localisation/user/',"LocalisationController@getLocalisationByUser");
    $router->get('localisation/nearby/',"LocalisationController@getNearbyLocalisation");
    $router->get('localisation/{id}',"LocalisationController@getLocalisationByid");
});



