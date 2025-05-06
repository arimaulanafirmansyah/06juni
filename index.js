const fs = require('fs');
const axios = require('axios');
const randomname = require('node-random-name');
const colors = require('@colors/colors');
const figlet = require('figlet');
const readlinesync = require('readline-sync');
const pLimit = require('p-limit').default;

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

    const getconfig = fs.readFileSync('config.json', 'utf-8');
    const config = JSON.parse(getconfig);
    const domain = config.domain;
    const password = config.password;
    const phone = config.partner;

    const jumlah = parseInt(readlinesync.question('[?] Jumlah : '));
    const limit = pLimit(jumlah); // ⬅️ jumlah limit = jumlah akun, jadi nggak terbatas

    const tasks = Array.from({ length: jumlah }, () => limit(async () => {
        const first = randomname({ first: true });
        const last = randomname({ last: true });
        const username = `${first}${last}`;
        const crotah = await create(username, domain, password, phone);

        if (crotah && crotah.status === 'success') {
            console.log(colors.green(`[~] ${crotah.data.email} | ${crotah.data.password}`));
            fs.appendFileSync('akun.txt', ` ${crotah.data.email} | ${crotah.data.password}\n`);
        } else {
            console.log(colors.red(`[!] ${JSON.stringify(crotah)}`));
        }
    }));

    await Promise.all(tasks);
})();
