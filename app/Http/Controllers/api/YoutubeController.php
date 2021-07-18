<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Google_Client;
use Google_Service_YouTube;

class YoutubeController extends Controller
{
    private $googleClient;
    private $youtube;

    public function __construct()
    {
        $this->googleClient = new Google_Client();
        $this->googleClient->setDeveloperKey("AIzaSyAaFI_H4r34fWjfOd7o-nWwvQshSccgKLU");

        $this->youtube = new Google_Service_YouTube($this->googleClient);
    }

    public function getLiveStreamingDetails(string $videoId)
    {
        $liveStreamingDetails = $this->youtube->videos->listVideos('snippet', [
            'id' => $videoId,
            'part' => ['snippet', 'liveStreamingDetails']
        ]);

        if ((array)$liveStreamingDetails->items) {
            return json_encode($liveStreamingDetails);
        } else {
            return response()->json([], 500);
        }
    }
}
