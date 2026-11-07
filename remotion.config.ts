import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
// "angle" active l'accélération GPU de Chrome : backdrop-filter / flous plus fiables et plus rapides.
Config.setChromiumOpenGlRenderer('angle');
Config.setConcurrency(4);
