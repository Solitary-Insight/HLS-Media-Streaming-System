import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
const storeLink = (videoLink: string) => {
    const newLinkLine = `${videoLink}\n`;
    const linkFilePath = './videoLinks.txt';
    fs.appendFileSync(linkFilePath, newLinkLine, 'utf-8');
};


export const uploadVideo = async (req: any, res: any) => {
    const videoId = uuidv4();
    const videoPath = path.resolve(req.file.path); // Ensure absolute path
    const outputPath = path.resolve(`./media/videos/${videoId}`);
    const hlsPath = `${outputPath}/playlist.m3u8`;

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    const ffmpegCommand = `ffmpeg -hide_banner -y -i "${videoPath}" \
      -vf scale=w=640:h=360:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod  -b:v 800k -maxrate 856k -bufsize 1200k -b:a 96k -hls_segment_filename ${outputPath}/360p_%03d.ts ${outputPath}/360p.m3u8 \
      -vf scale=w=842:h=480:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 1400k -maxrate 1498k -bufsize 2100k -b:a 128k -hls_segment_filename ${outputPath}/480p_%03d.ts ${outputPath}/480p.m3u8 \
      -vf scale=w=1280:h=720:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 2800k -maxrate 2996k -bufsize 4200k -b:a 128k -hls_segment_filename ${outputPath}/720p_%03d.ts ${outputPath}/720p.m3u8 \
      -vf scale=w=1920:h=1080:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 5000k -maxrate 5350k -bufsize 7500k -b:a 192k -hls_segment_filename ${outputPath}/1080p_%03d.ts ${outputPath}/1080p.m3u8`;

    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`[ERROR] exec error: ${error}`);
            return res.json({ "error": "Error while processing your file. Please try again." });
        }

        const videoUrl = `http://localhost:8000/media/videos/${videoId}/playlist.m3u8`;

        try {
            storeLink(videoUrl);
        } catch (error) {
            console.error(`[ERROR] error while storing video URL: ${error}`);
            return res.json({ "error": "Error while processing your file. Please try again." });
        }

        res.json({ "message": "File uploaded successfully.", videoUrl: videoUrl, videoId: videoId });
    });
};
