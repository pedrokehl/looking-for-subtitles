const SubtitleService = require('./subtitle-service');
const subtitleService = new SubtitleService();

subtitleService.downloadAllFromDir('D:/Videos/')
    .then(console.log)
    .catch(console.error);
