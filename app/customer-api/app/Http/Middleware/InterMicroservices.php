<?php

namespace App\Http\Middleware;

use Closure;
use Symfony\Component\HttpFoundation\Response;

class InterMicroservices
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        //checking if apikeyinter exist
        if(!$request->header('apiKeyInter') || $request->header("apiKeyInter") != env("API_KEY_INTER")){
            return response()->json(["message" => "Unauthorized"],Response::HTTP_UNAUTHORIZED);
        }
        return $next($request);
    }
}
