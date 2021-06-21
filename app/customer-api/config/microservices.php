<?php

//This is the url of microservices(servers side)
$base_url_server = [
    'customer' => 'customer-api:8001/',
    'auth' => 'auth-api:8005/',
    "chat" => 'chat-api-168:8066/'
];

return [
    /** Base url for all microservice  **/
    'base' => [
        'customer' => $base_url_server['customer'],
        'auth' => $base_url_server['auth'],
        "chat" => $base_url_server['chat']
    ],

    'auth' => [
        "check-jwt" => $base_url_server["auth"] . "check-jwt",
        "get-jwt-informations" => $base_url_server["auth"] . "get-jwt-informations"
    ],

    "customer" => [
        "matching" => $base_url_server['customer'] . "set-matching"
    ],

    "chat" => [
        "conversations" => $base_url_server["chat"] ."conversations"
    ]
];
