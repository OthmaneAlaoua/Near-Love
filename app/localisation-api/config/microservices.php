<?php

//This is the url of microservices(servers side)
$base_url_server = [
    'customer' => 'customer-api:8001/',
    'auth' => 'auth-api:8005/'
];

return [
    /** Base url for all microservice  **/
    'base' => [
        'customer' => $base_url_server['customer'],
        'auth' => $base_url_server['auth']
    ],

    'auth' => [
        "check-jwt" => $base_url_server["auth"] . "check-jwt",
        "get-jwt-informations" => $base_url_server["auth"] . "get-jwt-informations"
    ],

    "customer" => [
        "matching" => $base_url_server['customer'] . "set-matching"
    ]
];
