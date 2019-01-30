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
  registerTwitchApiKeys(config.twitchApiKeys);

  onNotificationClick(() => createTab({ url: config.streamUrl }));
  onBrowserActionClick(() => createTab({ url: config.streamUrl }));

  onTick();
  setInterval(onTick, (process.env.NODE_ENV === 'development' ? 10 : 60) * 1000);

  function onTick() {
    getTwitchLiveStreams([config.channelId]).then(({ onlineStreams, offlineStreams }) => {
      console.log({ onlineStreams, offlineStreams });

      if (onlineStreams.length > 0) {
        const stream = onlineStreams[0];
        markAsOnline();
        createNotification({
          type: 'basic',
          title: `${stream.user_name} est en live sur ${stream.game.name} !`,
          message: stream.title,
          iconUrl: 'icons/icon_128.png',
        });
        setBrowserActionTitle(`${stream.user_name} joue à ${stream.game.name} devant ${stream.viewer_count} viewers\n${stream.title}`);
      } else if (offlineStreams.length > 0) {
        markAsOffline();
        setBrowserActionTitle(require('./manifest.json').name);
      }
    });
  }
};

app();
