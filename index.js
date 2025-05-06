const fs = require('fs');
const axios = require('axios');
const randomname = require('node-random-name');
const colors = require('@colors/colors');
const figlet = require('figlet');
const FormData = require('form-data');
const readline = require('readline-sync');

function randomNumber(length) {
    let result = '';
    const digits = '0123456789';
    for (let i = 0; i < length; i++) {
        result += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return result;
}

async function sendToTelegram(filePath, botToken, chatId) {
    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('document', fs.createReadStream(filePath));

    try {
        const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendDocument`, form, {
            headers: form.getHeaders(),
        });
        console.log(colors.cyan('[✓] File berhasil dikirim ke Telegram'));
        fs.unlinkSync(filePath);
    } catch (error) {
        console.log(colors.red(`[x] Gagal kirim ke Telegram: ${error.message}`));
    }
}

async function create(username, domain, password, phone) {
    try {
        const response = await axios.get(`https://amfcode.my.id/apiviu/arrbaik?username=${username}&domain=${domain}&password=${password}&phone=${phone}`, {
            headers: {
                'Authorization': 'Bearer AMFCODE'
            }
        });
        if (response.status == 200) {
            return response.data;
        }
    } catch (err) {
        return { status: 'error', message: err.message };
    }
}

(async () => {
    console.log(figlet.textSync('VIU PREMIUM'));

    const jumlah = readline.questionInt('Berapa akun yang ingin dibuat? ');
    const filepath = `resultakun-${randomNumber(3)}.txt`;

    const getconfig = fs.readFileSync('config.json', 'utf-8');
    const config = JSON.parse(getconfig);
    const domain = config.domain;
    const password = config.password;
    const phone = config.partner;
    const botToken = config.tokentele;
    const chatidnya = config.chatid;

    for (let i = 0; i < jumlah; i++) {
        const first = randomname({ first: true });
        const last = randomname({ last: true });
        const username = `${first}${last}`;
        const crotah = await create(username, domain, password, phone);

        if (crotah && crotah.status === 'success') {
            console.log(colors.green(`[~] ${crotah.data.email} | ${crotah.data.password}`));
            fs.appendFileSync(filepath, ` ${crotah.data.email} | ${crotah.data.password}\n`);
        } else {
            console.log(colors.red(`[!] ${JSON.stringify(crotah)}`));
        }
    }

    // Kirim hasil ke Telegram
    if (fs.existsSync(filepath)) {
        await sendToTelegram(filepath, botToken, chatidnya);
    }

})();
