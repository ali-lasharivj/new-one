const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "csave",
    react: "💾",
    desc: "Automatically save contact from inbox message using WhatsApp profile name",
    category: "info",
    use: "Auto saves contact on inbox message",
    filename: __filename
},
async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isAdmins, reply }) => {
    try {
        // Check if the message is from a private chat (not a group)
        if (isGroup) return;

        // Get sender's profile details
        let userProfile = await conn.fetchStatus(sender).catch(() => ({ status: pushname || null }));
        let contactName = pushname || userProfile.status; // Prioritize pushname, then status
        if (!contactName) throw new Error('No WhatsApp profile name available'); // Ensure profile name exists
        let phoneNumber = sender.split("@")[0]; // Extract phone number from sender ID

        // Fetch profile picture
        let profilePicUrl;
        try {
            profilePicUrl = await conn.profilePictureUrl(sender, 'image');
        } catch (e) {
            profilePicUrl = null; // Fallback if no profile picture
        }

        // Create vCard with WhatsApp profile name
        let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL;type=CELL;type=VOICE;waid=${phoneNumber}:+${phoneNumber}\nEND:VCARD\n`;

        // Save vCard to file
        let nmfilect = './new_contact.vcf';
        fs.writeFileSync(nmfilect, vcard.trim());

        // Send vCard with caption
        await conn.sendMessage(from, {
            document: fs.readFileSync(nmfilect),
            mimetype: 'text/vcard',
            fileName: `${contactName}.vcf`,
            caption: `📋 *Contact Saved!*\nName: *${contactName}*\nNumber: *+${phoneNumber}*\n\nYo bro, I saved you! Save me too! 😎`
        }, { ephemeralExpiration: 86400, quoted: m });

        // Send profile picture as a separate message if available
        if (profilePicUrl) {
            await conn.sendMessage(from, {
                image: { url: profilePicUrl },
                caption: `Here's your profile pic! 😎`
            }, { ephemeralExpiration: 86400, quoted: m });
        }

        // Clean up temporary file
        fs.unlinkSync(nmfilect);

        // Send success reaction
        await conn.sendMessage(from, { react: { text: `✅`, key: mek.key } });

    } catch (e) {
        reply('*Oops, something went wrong! 😕*');
        l(e); // Log error for debugging
    }
});
              
