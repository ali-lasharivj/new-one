const axios = require('axios');
const { cmd } = require('../command');
const { fetchJson } = require('../functions');

cmd({
  pattern: 'logo',
  alias: ['logomaker'],
  react: '〽️',
  desc: 'Generate logos based on user input',
  category: 'Search',
  filename: __filename
}, async (conn, mek, m, { from, reply, args, sender }) => {
  try {
    const text = args.join(' ');

    if (!text) {
      reply('Please provide a search query.');
      return;
    }

    // Message content
    const messageText = `
*🔢 ʀєρℓу тнє ɴυмвєʀ уσυ ωαɴт, ${text} ℓσgσ*
*╭──────────────────✑*
*┃▸01⊷ вℓα¢к ριɴк ριɴк ℓσgσ ωιтн мємвєʀѕ ѕιgɴαтυʀє*
*┃▸02⊷ вℓα¢к ριɴк ѕтуℓє*
*┃▸03⊷ ѕιℓνєʀ 3∂*
*┃▸04⊷ ɴαʀυтσ*
*┃▸05⊷ ∂ιgιтαℓ gℓιт¢н*
*┃▸06⊷ вιʀтн∂αу ¢αкє*
*┃▸07⊷ zσ∂ια¢* 
*┃▸08⊷ υɴ∂єʀωαтєʀ* 
*┃▸09⊷ gℓσω* 
*┃▸10⊷ αναтαʀ gσℓ∂* 
*┃▸11⊷ вσкєн*
*┃▸12⊷ fιʀєωσʀкѕ*
*┃▸13⊷ gαмιɴg ℓσgσ*
*┃▸14⊷ ѕιgɴαтυʀє* 
*┃▸15⊷ ℓυχυʀу*
*┃▸16⊷ ∂ʀαgσɴ fιʀє*
*┃▸17⊷ qυєєɴ ¢αʀ∂*
*┃▸18⊷ gʀαffιтι ¢σℓσʀ* 
*┃▸19⊷ тαттσσ* 
*┃▸20⊷ ρєɴтαкιℓℓ* 
*┃▸21⊷ нαℓℓσωєєɴ* 
*┃▸22⊷ нσʀʀσʀ*  
*┃▸23⊷ вℓσσ∂*
*┃▸24⊷ ωσмєɴ'ѕ ∂αу*  
*┃▸25⊷ ναℓєɴтιɴє* 
*┃▸26⊷ ɴєσɴ ℓιgнт* 
*┃▸27⊷ gαмιɴg αѕѕαѕѕιɴ*
*┃▸28⊷ fσggу gℓαѕѕ* 
*┃▸29⊷ ѕαɴ∂ ѕυммєʀ вєα¢н*
*┃▸30⊷ ℓιgнт*
*┃▸31⊷ мσ∂єʀɴ gσℓ∂*
*┃▸32⊷ ¢αʀтσσɴ ѕтуℓє gʀαffιтι*
*┃▸33⊷ gαℓαχу*
*┃▸34⊷ αɴσɴумσυѕ нα¢кєʀ (αναтαʀ ¢уαɴ ɴєσɴ)*
*┃▸35⊷ вιʀтн∂αу fℓσωєʀ ¢αкє*
*┃▸36⊷ ∂ʀαgσɴ  вαℓℓ* 
*┃▸37⊷ єℓєgαɴт ʀσтαтισɴ*
*┃▸38⊷ ωʀιтє тєχт σɴ ωєт gℓαѕѕ*
*┃▸39⊷ ωαтєʀ 3∂* 
*┃▸40⊷ ʀєαℓιѕтι¢ ѕαɴ∂*
*┃▸41⊷ ρυвg мαѕ¢σт*
*┃▸42⊷ туρσgʀαρну*
*┃▸43⊷ ɴαʀυтσ ѕнιρρυ∂єɴ*
*┃▸44⊷ ¢σℓσυʀfυℓ ραιɴт*
*┃▸45⊷ туρσgʀαρну мαкєʀ*
*┃▸46⊷ ιɴ¢αɴ∂єѕ¢єɴт*
*┃▸47⊷ ¢αʀтσσɴ ѕтуℓє gʀαffιтι* 
*┃▸48⊷ gαℓαχу*
*┃▸49⊷ αɴσɴумσυѕ нα¢кєʀ (αναтαʀ ¢уαɴ ɴєσɴ)"
*┃▸50⊷ вιʀтн∂αу ¢αкє*
‎*╰──────────────────✑*
> *© ᴘσωєʀє∂ ву αℓι м∂⎯꯭̽🚩°*`;


    // Send the message
    const sentMessage = await conn.sendMessage(from,{image: { url: config.ALIVE_IMG },caption: messageText,
    contextInfo: {
                mentionedJid: ['923003588997@s.whatsapp.net'], // specify mentioned JID(s) if any
                groupMentions: [],
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363318387454868@newsletter',
                    newsletterName: config.BOT_NAME,
                    serverMessageId: 999
                }            
            }
     }, {quoted: mek});

    // Event listener for message responses
    conn.ev.on('messages.upsert', async (update) => {
      const message = update.messages[0];
      if (!message.message || !message.message.extendedTextMessage) {
        return;
      }

      const responseText = message.message.extendedTextMessage.text.trim();
      if (message.message.extendedTextMessage.contextInfo && message.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id) {
        // Handle different logo choices based on number
        let logoUrl;
        switch (responseText) {
          case '1':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html", text);
            break;
          case '2':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html", text);
            break;
          case '3':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html", text);
            break;
          case '4':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html", text);
            break;
          case '5':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html", text);
            break;
          case '6':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/birthday-cake-96.html", text);
            break;
          case '7':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/free-zodiac-online-logo-maker-491.html", text);
            break;
          case '8':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/3d-underwater-text-effect-online-682.html", text);
            break;
          case '9':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/advanced-glow-effects-74.html", text);
            break;
          case '10':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-avatar-gold-online-303.html", text);
            break;
          case '11':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/bokeh-text-effect-86.html", text);
            break;
          case '12':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/text-firework-effect-356.html", text);
            break;
          case '13':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/free-gaming-logo-maker-for-fps-game-team-546.html", text);
            break;
          case '14':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/arrow-tattoo-effect-with-signature-712.html", text);
            break;
          case '15':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/free-luxury-logo-maker-create-logo-online-458.html", text);
            break;
          case '16':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/dragon-fire-text-effect-111.html", text);
            break;
          case '17':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-a-personalized-queen-card-avatar-730.html", text);
            break;
          case '18':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/graffiti-color-199.html", text);
            break;
          case '19':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/make-tattoos-online-by-your-name-309.html", text);
            break;
          case '20':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-a-lol-pentakill-231.html", text);
            break;
          case '21':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/cards-halloween-online-81.html", text);
            break;
          case '22':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/writing-horror-letters-on-metal-plates-265.html", text);
            break;
          case '23':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/write-blood-text-on-the-wall-264.html", text);
            break;
          case '24':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-beautiful-international-women-s-day-cards-399.html", text);
            break;
          case '25':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/beautiful-flower-valentine-s-day-greeting-cards-online-512.html", text);
            break;
          case '26':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html", text);
            break;
          case '27':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-logo-team-logo-gaming-assassin-style-574.html", text);
            break;
          case '28':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html", text);
            break;
          case '29':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html", text);
            break;
          case '30':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/text-light-effets-234.html", text);
            break;
          case '31':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/modern-gold-3-212.html", text);
            break;
          case '32':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html", text);
            break;
          case '33':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/galaxy-text-effect-new-258.html", text);
            break;
          case '34':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html", text);
            break;
          case '35':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/write-name-on-flower-birthday-cake-pics-472.html", text);
            break;
          case '36':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html", text);
            break;
          case '37':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-elegant-rotation-logo-online-586.html", text);
            break;
          case '38':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/write-text-on-wet-glass-online-589.html", text);
            break;
          case '39':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/water-3d-text-effect-online-126.html", text);
            break;
          case '40':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/realistic-3d-sand-text-effect-online-580.html", text);
            break;
          case '41':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/pubg-mascot-logo-maker-for-an-esports-team-612.html", text);
            break;
          case '42':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-online-typography-art-effects-with-multiple-layers-811.html", text);
            break;
          case '43':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html", text);
            break;
          case '44':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html", text);
            break;
          case '45':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/make-typography-text-online-338.html", text);
            break;
          case '46':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/text-effects-incandescent-bulbs-219.html", text);
            break;
          case '47':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html", text);
            break;
          case '48':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/birthday-cake-96.html", text);
            break;
          case '49':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/free-zodiac-online-logo-maker-491.html", text);
            break;
          case '50':
            logoUrl = await fetchLogoUrl("https://en.ephoto360.com/free-zodiac-online-logo-maker-491.html", text);
            break;
          default:
            return reply("*😒 ιɴναℓι∂ ɴυмвєʀ. ρℓєαѕє ʀєρℓу ωιтн α ναℓι∂ ɴυмвєʀ 1 тσ 50*");
        }

        // Send the logo
        if (logoUrl) {
          await conn.sendMessage(from, {
            image: { url: logoUrl },
            caption: `> *© ᴘσωєʀє∂ ву αℓι м∂⎯꯭̽🚩°*`,
          }, { quoted: mek });
        }
      }
    });
  } catch (error) {
    console.error('Error processing logo command:', error);
    reply('An error occurred while processing the logo command. Please try again.');
  }
});

// Function to fetch the logo URL using axios
const fetchLogoUrl = async (url, name) => {
  try {
    const response = await axios.get(`https://api-pink-venom.vercel.app/api/logo`, {
      params: { url, name }
    });
    return response.data.result.download_url;
  } catch (error) {
    console.error("Error fetching logo:", error);
    return null;
  }
};


        
