import plugin from '../../lib/plugins/plugin.js'
import fs from 'node:fs'
import gsCfg from '../genshin/model/gsCfg.js'
import { load } from 'cheerio'
import { segment } from 'oicq'
import fetch from 'node-fetch'

gsCfg.cpCfg('mys', 'pushNews')
export class mysNews extends plugin {
  constructor(e) {
    super({
      name: '角色语音彩蛋',
      dsc: '#公告 #资讯 #活动',
      event: 'message',
      priority: 700,
      rule: [
        {
          reg: '^早上好|中午好|晚上好|晚安$',
          fnc: 'greet'
        },
        {
          reg: '^刮大风了$',
          fnc: 'greet'
        },
        {
          reg: '困呐啊',
          fnc: 'sleepy'
        }
      ]
    })

    this.file = './plugins/genshin/config/mys.pushNews.yaml'
  }

  async init() {
    if (fs.existsSync(this.file)) return

    fs.copyFileSync('./plugins/genshin/defSet/mys/pushNews.yaml', this.file)
  }

  /** 语音回复 困呐困呐困呐啊啊啊啊 */
  async sleepy() {
    /** 包包：怎么还在睡啊！ */
    const file = fs.readFileSync('./plugins/genshin/audio/sleepy.wav')

    const msg = segment.record(file)
    await this.reply(msg)
  }

  async greet() {
    /** 可莉 */
    // const url = 'https://api-static.mihoyo.com/common/blackboard/ys_obc/v1/content/info?app_sn=ys_obc&content_id=55'

    /** 珊瑚宫心海 */
    // const url = 'https://api-static.mihoyo.com/common/blackboard/ys_obc/v1/content/info?app_sn=ys_obc&content_id=2403'

    /** 宵宫 */
    const url = 'https://api-static.mihoyo.com/common/blackboard/ys_obc/v1/content/info?app_sn=ys_obc&content_id=2124'
    const headers = {
      Referer: 'https://bbs.mihoyo.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
    }
    let response
    try {
      response = await fetch(url, { method: 'get', headers })
    } catch (error) {
      logger.error(error.toString())
      return false
    }

    if (!response.ok) {
      logger.error(`[米游社接口错误][${type}] ${response.status} ${response.statusText}`)
      return false
    }
    const res = await response.json()
    const $ = load(res.data.content.contents[2].text)

    const allSource = $('.obc-tmpl-character__voice-pc tr>td')

    const allUrl = []

    for (let i = 0; i < allSource.length / 4; i += 2) {
      const name = load(allSource[i]).text()
      const url = load(allSource[i + 1])('source')[0].attribs.src
      allUrl.push({
        name,
        url
      })
    }

    const msg = segment.record(allUrl.find(i => i.name.includes(this.e.msg)).url)
    await this.reply(msg)
  }
}
