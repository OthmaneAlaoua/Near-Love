<?php

//This is the url of microservices(servers side)
$base_url_server = [
    'customer' => 'customer-api:8001/',
    'notification' => 'notification-api:8002/',
    'ad' => 'http://localhost:8004/',
];

return [
    /** Base url for all microservice  **/
    'base' => [
        'customer' => $base_url_server['customer'],
        'notification' => $base_url_server['notification'],
        'ad' => $base_url_server['ad']
    ],

    /** detailled url for all microservices **/
    'customer' => [
        'url' => [
            'create' => $base_url_server['customer'] . "create",
            'validate' => $base_url_server['customer'] . "validate-account",
            'edit' => $base_url_server['customer'] . "edit",
            'login' => $base_url_server['customer']. "login"
        ]
    ],

];
