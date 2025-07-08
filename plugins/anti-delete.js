const { cmd } = require('../command');
const { getAnti, setAnti } = require('../data/antidel');

cmd({
    pattern: "antidelete",
    alias: ['antidel', 'ad'],
    desc: "Toggle anti-delete feature",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, reply, text, isCreator }) => {
    if (!isCreator) return reply('*📛 σɴℓу тнє σωɴєʀ ¢αɴ ᴜѕє тнιѕ ¢σммαɴ∂!*');
    
    try {
        const currentStatus = await getAnti();
        
        if (!text || text.toLowerCase() === 'status') {
            return reply(`*⚙️ αɴтι∂єℓєтє ѕтαтυѕ:* ${currentStatus ? '✅ σɴ' : '❌ σff'}\n*υѕαgє: .αɴтι∂єℓєтє σɴ/σff*`);
        }
        
        const action = text.toLowerCase().trim();
        
        if (action === 'on') {
            await setAnti(true);
            return reply('*✅ αɴтι-∂єℓєтє нαѕ вєєɴ єɴαвℓє∂*');
        } 
        else if (action === 'off') {
            await setAnti(false);
            return reply('*❌ αɴтι-∂єℓєтє нαѕ вєєɴ ∂ιѕαвℓє∂*');
        } 
        else {
            return reply('*🏷️ єχαмρℓє: .αɴтι∂єℓєтє σɴ/σff*');
        }
    } catch (e) {
        console.error("Error in antidelete command:", e);
        return reply("An error occurred while processing your request.");
    }
});
