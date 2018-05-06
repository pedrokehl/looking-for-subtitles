const fetch = require('node-fetch');
const fs = require('fs');
const OS = require('opensubtitles-api');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const videoExtensions = require('./video-extensions');

const OpenSubtitles = new OS('TemporaryUserAgent');

class SubtitleService {

    /**
     * @param {string} [language=en]
     *      en: English
     *      pb: Portuguese (BR)
     *      el: Greek
     *      es: Spanish
     *      ar: Arabic
     *      tr: Turkish
     *      sr: Serbian
     *      ko: Korean
     *      hr: Croatian
     *      bg: Bulgarian
     *      he: Hebrew
     *      cs: Czech
     *      ro: Romanian
     *      fa: Persian
     */
    constructor (language = 'en') {
        this.language = language;
        this.downloadAllFromDir = this.downloadAllFromDir.bind(this);
        this.downloadFromUrl = this.downloadFromUrl.bind(this);
    }

    downloadAllFromDir(dir) {
        let paths;
        return this.getListOfFiles(dir)
            .then((filepaths) => {
                paths = filepaths;
                const promises = paths.map((path) => this.downloadSubtitle(dir + path));
                return Promise.all(promises);
            })
            .then(() => paths);
    }

    downloadFromUrl(url, path) {
        return fetch(url)
            .then(res => {
                const srtPath = path.substr(0, path.lastIndexOf('.')) + '.srt';
                const dest = fs.createWriteStream(srtPath, { autoClose: true });
                res.body.pipe(dest);
            });
    }

    downloadSubtitle(filepath) {
        return this.getUrlForFile(filepath)
            .then((url) => this.downloadFromUrl(url, filepath));
    }

    filterByExtension(name, index, array) {
        const subtitleExtension = '.srt';
        const fileExtension = path.extname(name);

        const isVideoExtension = videoExtensions[fileExtension.replace('.', '')];
        const subtitleName = name.replace(fileExtension, subtitleExtension);
        const alreadySubtitleOnPath = (array || []).filter((name) => name === subtitleName);

        return isVideoExtension && !alreadySubtitleOnPath.length;
    }

    getListOfFiles(dirpath) {
        return readdir(dirpath).then((files) => {
            return files.filter(this.filterByExtension);
        })
    }

    getUrlForFile(filepath) {
        return OpenSubtitles.search({ path: filepath })
            .then(subtitles => subtitles[this.language].url);
    }
}

module.exports = SubtitleService;
