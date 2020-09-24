<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Google_client;
use Google_Service_Youtube;
use Log;

class YoutubeController extends Controller
{
    private $googleClient;
    private $youtube;

    public function __construct()
    {
        $this->googleClient = new Google_Client();
        $this->googleClient->setDeveloperKey(env('GOOGLE_API_KEY'));

        $this->youtube = new Google_Service_Youtube($this->googleClient);
    }

    public function getLiveStreamingDetails(string $videoId)
    {
        $liveStreamingDetails = $this->youtube->videos->listVideos('snippet', [
            'id' => $videoId,
            'part' => ['snippet', 'liveStreamingDetails']
        ]);
        
        return json_encode($liveStreamingDetails);
    }
}
