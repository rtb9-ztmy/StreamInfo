<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use \GuzzleHttp\Client;

class TwitchController extends Controller
{
    private $guzzleHttpClient;

    public function __construct()
    {
        $this->guzzleHttpClient = new Client();    
    }

    public function getLiveStreamingDetails(string $displayName) 
    {
        $method = 'GET';
        $URL = 'https://api.twitch.tv/kraken/search/streams?query=' . $displayName;
        $headers = [
            'Client-ID' => '9p7t0dblnso0q4je4609javhs183xy',
            'Accept' => 'application/vnd.twitchtv.v5+json'
        ];

        $response = $this->guzzleHttpClient->request($method, $URL, [
            'headers' => $headers
        ]);

        return $response->getBody();
    }
}
