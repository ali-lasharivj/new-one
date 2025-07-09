const { cmd } = require('../command');
const config = require('../config');

cmd(
  {
    pattern: 'tovv',
    alias: [],
    react: '🎐',
    desc: 'Owner Only - Transforms a quoted video, image or audio into a view-once message',
    category: 'owner',
    filename: __filename,
  },
  async (bot, message, args, { from: sender, isOwner }) => {
    try {
      // Vérifie si l'utilisateur est le propriétaire du bot
      if (!isOwner) {
        return await bot.sendMessage(
          sender,
          { text: '*📛 This is an owner-only command.*' },
          { quoted: message }
        );
      }

      // Vérifie si un message est cité via args.quoted
      if (!args.quoted) {
        return await bot.sendMessage(
          sender,
          { text: '*👀 Please reply to a message to transform it into a view-once media!*' },
          { quoted: message }
        );
      }

      // Télécharge le contenu du message cité
      let mediaData;
      try {
        mediaData = await args.quoted.download();
      } catch (err) {
        console.error('Download Error:', err);
        return await bot.sendMessage(
          sender,
          { text: '❌ Error downloading the media:\n' + err.message },
          { quoted: message }
        );
      }

      const messageType = args.quoted.mtype;
      const options = { quoted: message };
      let forwardData = {};

      // Prépare l'objet forwardData selon le type de média en ajoutant la propriété viewOnce
      switch (messageType) {
        case 'imageMessage':
          forwardData = {
            image: mediaData,
            caption: args.quoted.text || '',
            mimetype: args.quoted.mimetype || 'image/jpeg',
            viewOnce: true,
          };
          break;
        case 'videoMessage':
          forwardData = {
            video: mediaData,
            caption: args.quoted.text || '',
            mimetype: args.quoted.mimetype || 'video/mp4',
            viewOnce: true,
          };
          break;
        case 'audioMessage':
          forwardData = {
            audio: mediaData,
            mimetype: 'audio/mp4',
            ptt: args.quoted.ptt || false,
            viewOnce: true,
          };
          break;
        default:
          return await bot.sendMessage(
            sender,
            { text: '❌ Unsupported message type for view-once transformation. Only video, image and audio are supported.' },
            { quoted: message }
          );
      }

      // Envoie le message transformé à vue unique à l'utilisateur
      await bot.sendMessage(sender, forwardData, options);
    } catch (error) {
      console.error('Forward Error:', error);
      await bot.sendMessage(
        sender,
        { text: '❌ Error forwarding message:\n' + error.message },
        { quoted: message }
      );
    }
  }
);
                              
