import {
  registerTwitchApiKeys,
  createNotification,
  createTab,
  getTwitchLiveStreams,
  onNotificationClick,
  onBrowserActionClick,
  markAsOnline,
  markAsOffline,
  setBrowserActionTitle,
} from '@kocal/web-extension-library';
import { config } from './config';

const app = () => {
  if (process.env.NODE_ENV === 'development') console.log('app()');

  let isOnline = false;

  registerTwitchApiKeys(config.twitchApiKeys);

  onNotificationClick(() => createTab({ url: config.streamUrl }));
  onBrowserActionClick(() => createTab({ url: config.streamUrl }));

  onTick();
  setInterval(onTick, (process.env.NODE_ENV === 'development' ? 10 : 60) * 1000);

  function onTick() {
    if (process.env.NODE_ENV === 'development') console.log('onTick()');

    getTwitchLiveStreams([config.channelId]).then(({ onlineStreams, offlineStreams }) => {
      if (onlineStreams.length > 0) {
        const stream = onlineStreams[0];

        setBrowserActionTitle(`${config.name} joue à ${stream.game.name} devant ${stream.viewer_count} viewers\n${stream.title}`);

        if (!isOnline) {
          isOnline = true;

          markAsOnline();
          createNotification({
            type: 'basic',
            title: `${config.name} est en live sur ${stream.game.name} !`,
            message: stream.title,
            iconUrl: 'icons/icon_128.png',
          });
        }
      } else if (offlineStreams.length > 0) {
        markAsOffline();
        setBrowserActionTitle(require('./manifest.json').name);
        isOnline = false;
      }
    });
  }
};

app();
