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
          // reg: '^T(早上好|中午好|晚上好|晚安)$',
          fnc: 'greet'
        },
        {
          reg: '^刮大风了$',
          fnc: 'greet'
        },
        {
          reg: '困呐啊',
          fnc: 'sleepy'
        },
        {
          reg: '绫华',
          fnc: 'dog'
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
    if (Math.random() >= 0.8) return

    /** 包包：怎么还在睡啊！ */
    const file = fs.readFileSync('./plugins/voice-plugin/audio/wakeUp.wav')

    const msg = segment.record(file)
    await this.reply(msg)
  }

  /** 语音回复 我就是绫华小姐的狗 */
  async dog() {
    console.log('[绫华]让我看看……')
    if (Math.random() >= 0.05) return

    console.log('[绫华]关键字匹配')

    /** 包包：我就是绫华小姐的狗！ */
    const file = fs.readFileSync('./plugins/voice-plugin/audio/dog.wav')

    const msg = segment.record(file)
    await this.reply(msg)
  }

  async greet() {
    const rand = Math.random()
    if (this.e.msg.includes('早上好') && rand <= 0.2) {
      console.log('[日常问候] 宴宁彩蛋语音')

      /** 包包：困呐困呐困呐啊啊啊啊！ */
      const file = fs.readFileSync('./plugins/voice-plugin/audio/sleepy.wav')

      const msg = segment.record(file)
      await this.reply(msg)
      return
    }

    const _d = new Date()
    const today = `${_d.getFullYear()}-${_d.getMonth() + 1}-${_d.getDay()}`

    const redisKey = `VoicePlugin#greet[${today}]`

    let role = await redis.get(redisKey)
    let first = false

    if (role) {
      role = JSON.parse(role)
    } else {
      /** 角色wiki */
      const allRoleWikiUrl = 'https://api-static.mihoyo.com/common/blackboard/ys_obc/v1/home/content/list?app_sn=ys_obc&channel_id=189'
      const _res = await (await fetch(allRoleWikiUrl)).json()

      const allRoleObj = _res.data.list[0].children[0].list.map(i => ({
        id: i.content_id,
        name: i.title
      }))

      role = allRoleObj[Math.floor(Math.random() * allRoleObj.length)]

      first = true

      redis.set(redisKey, JSON.stringify(role), { EX: 3600 * 24 })
    }

    console.log('[日常问候] 今日角色： ' + role.name)

    const voiceReidsKey = `VoicePlugin::${role.id}`
    let sourceInfo = await redis.get(voiceReidsKey)

    if (sourceInfo) {
      sourceInfo = JSON.parse(sourceInfo)
    } else {
      const url = `https://api-static.mihoyo.com/common/blackboard/ys_obc/v1/content/info?app_sn=ys_obc&content_id=${role.id}`
      const headers = {
        Referer: 'https://bbs.mihoyo.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
      }
      const res = await (await fetch(url, { method: 'get', headers })).json()

      const $ = load(res.data.content.contents[2].text)

      const allSource = $('.obc-tmpl-character__voice-pc tr>td')

      sourceInfo = []

      for (let i = 0; i < allSource.length / 4; i += 2) {
        const name = load(allSource[i]).text()
        const url = load(allSource[i + 1])('source')[0].attribs.src
        sourceInfo.push({
          name,
          url
        })
      }

      redis.set(voiceReidsKey, JSON.stringify(sourceInfo), { EX: 3600 * 24 * 30 })
    }

    if (first) {
      await this.reply(segment.record(sourceInfo.find(i => i.name.includes('初次见面')).url))
    }

    let keyword = this.e.msg
    if (this.e.msg.includes('T')) {
      keyword = this.e.msg.split('T')[1]
    }

    const msg = segment.record(sourceInfo.find(i => i.name.includes(keyword)).url)
    await this.reply(msg)
  }
}
