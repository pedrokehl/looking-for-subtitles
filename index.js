const SubtitleService = require('./subtitle-service');
const subtitleService = new SubtitleService();

subtitleService.downloadAllFromDir('C:/Users/pedro/Videos/')
    .then(console.log)
    .catch(console.err);
