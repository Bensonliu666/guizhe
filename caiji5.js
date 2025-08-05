// Dapi.req 版本
let base_url = '';

function init(ext) {
    console.log('init:', ext);
    base_url = ext;
}

async function home(filter) {
    let url = `${base_url}?ac=videolist`;
    const html = await Dapi.req(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
    const json = await Dapi.jsonParse(html);

    const classes = [];
    if (json.class && Array.isArray(json.class)) {
        json.class.forEach(cls => {
            classes.push({
                type_id: cls.type_id,
                type_name: cls.type_name
            });
        });
    }

    return {
        class: classes,
        filters: {} // 没有发现过滤器，留空对象
    };
}


async function category(tid, pg, filter, extend) {
    console.log(`category: tid=${tid}, pg=${pg}, filter=${filter}, extend=${JSON.stringify(extend)}`);
    const limit = 20;
    let url = `${base_url}?ac=videolist&pg=${pg}&pagesize=${limit}`;

    if (tid && tid !== 'all') {
        url += `&t=${tid}`;
    }
    if (extend) {
        for (const key in extend) {
            if (extend[key]) {
                url += `&${key}=${extend[key]}`;
            }
        }
    }
    
    console.log('Requesting URL:', url);
    const html = await Dapi.req(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
    const json = await Dapi.jsonParse(html);

    const result = {
        list: [],
        page: parseInt(json.page) || pg,
        pagecount: parseInt(json.pagecount) || 1,
        limit: parseInt(json.limit) || limit,
        total: parseInt(json.total) || 0,
    };

    if (json.list && json.list.length > 0) {
        json.list.forEach(item => {
            result.list.push({
                vod_id: item.vod_id,
                vod_name: item.vod_name,
                vod_pic: item.vod_pic,
                vod_remarks: item.vod_remarks || item.vod_blurb || '',
                vod_tag: 'vod',
            });
        });
    });
    console.log('Category result:', JSON.stringify(result));
    return result;
}

async function detail(id) {
    console.log('detail: id=', id);
    const url = `${base_url}?ac=detail&ids=${id}`;
    console.log('Requesting URL:', url);
    const html = await Dapi.req(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
    const json = await Dapi.jsonParse(html);

    const result = {
        list: [],
    };

    if (json.list && json.list.length > 0) {
        const item = json.list[0];
        let play_url = '';
        if (item.vod_play_url) {
            // 假设只有一个播放组或取第一个
            play_url = item.vod_play_url.split('$$$')[0]; // 取第一个播放组
        }
        if (!play_url) {
            console.error("No play URL found for vod_id:", id);
        }

        result.list.push({
            vod_id: item.vod_id,
            vod_name: item.vod_name,
            vod_pic: item.vod_pic,
            vod_year: item.vod_year,
            vod_area: item.vod_area,
            vod_actor: item.vod_actor,
            vod_director: item.vod_director,
            vod_content: item.vod_content,
            vod_play_from: item.vod_play_from || '嗅探', // 使用播放源，若无则默认为嗅探
            vod_play_url: play_url,
            vod_remarks: item.vod_remarks || item.vod_blurb || '',
            type_name: item.type_name,
        });
    }
    console.log('Detail result:', JSON.stringify(result));
    return result;
}

async function play(flag, id, flags) {
    console.log(`play: flag=${flag}, id=${id}, flags=${flags}`);
    // Drpy的play函数通常直接返回视频URL，因为detail已经解析了播放地址
    return {
        parse: 0, // 0表示直连，1表示需要解析
        url: id, // id实际上就是detail中解析出来的播放URL
        header: { 'User-Agent': "Mozilla/5.0" } // 可选：设置请求头
    };
}

async function search(wd, quick, pg) {
    console.log(`search: wd=${wd}, quick=${quick}, pg=${pg}`);
    const limit = 20;
    const url = `${base_url}?ac=videolist&area=${wd}&pg=${pg}&pagesize=${limit}`; // 假设搜索参数是area
    console.log('Requesting search URL:', url);
    const html = await Dapi.req(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
    const json = await Dapi.jsonParse(html);

    const result = {
        list: [],
        page: parseInt(json.page) || pg,
        pagecount: parseInt(json.pagecount) || 1,
        limit: parseInt(json.limit) || limit,
        total: parseInt(json.total) || 0,
    };

    if (json.list && json.list.length > 0) {
        json.list.forEach(item => {
            result.list.push({
                vod_id: item.vod_id,
                vod_name: item.vod_name,
                vod_pic: item.vod_pic,
                vod_remarks: item.vod_remarks || item.vod_blurb || '',
            });
        });
    }
    console.log('Search result:', JSON.stringify(result));
    return result;
}
