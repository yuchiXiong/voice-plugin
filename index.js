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
      dsc: '#早上好 #中午好 #晚上好 #晚安',
      event: 'message',
      priority: 700,
      rule: [
        {
          reg: '^早上好|中午好|晚上好|晚安$',
          fnc: 'greet'
        },
        {
          reg: '#*语音 *',
          fnc: 'allVoicePick'
        },
        {
          reg: '困呐啊',
          fnc: 'sleepy'
        },
        {
          reg: '绫华',
          fnc: 'dog'
        },
        {
          reg: '#恋人待遇',
          fnc: 'ora'
        },
        {
          reg: '#这是一场试炼*',
          fnc: 'diyaboro'
        },
        {
          reg: '#我的名字叫吉良吉影*',
          fnc: 'KiraYoshikage'
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

  /** 语音回复 欧拉欧拉欧拉欧拉 */
  async ora() {
    const file = fs.readFileSync('./plugins/voice-plugin/audio/ora.wav')

    const msg = segment.record(file)
    await this.reply(msg)
  }

  /** 语音回复 这是一场试炼…… */
  async diyaboro() {
    const file = fs.readFileSync('./plugins/voice-plugin/audio/diyaboro.mp3')

    const msg = segment.record(file)
    await this.reply(msg)
  }

  /** 语音回复 我的名字叫吉良吉影…… */
  async KiraYoshikage() {
    if (Math.random() >= 0.05) return
    const file = fs.readFileSync('./plugins/voice-plugin/audio/KiraYoshikage.mp3')

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

  /** 角色问好 */
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
      const allRoleWiki = await this.fetchAllRoleWiki()

      role = allRoleWiki[Math.floor(Math.random() * allRoleWiki.length)]

      first = true

      redis.set(redisKey, JSON.stringify(role), { EX: 3600 * 24 })
    }

    console.log('[日常问候] 今日角色： ' + role.name)

    const allVoices = await this.fetchRoleVoice(role.id)

    if (first) {
      await this.reply(segment.record(allVoices.find(i => i.name.includes('初次见面')).url))
    }

    let keyword = this.e.msg
    if (this.e.msg.includes('T')) {
      keyword = this.e.msg.split('T')[1]
    }

    const msg = segment.record(allVoices.find(i => i.name.includes(keyword)).url)
    await this.reply(msg)
  }

  /** 生成指定角色的语音消息 */
  async allVoicePick() {
    const msg = this.e.msg.replace(/(#|语音)/g, ' ').split(' ').filter(i => i !== '' && i !== ' ')
    const roleName = msg[0]
    const seg = msg[1]

    const allRoleWiki = await this.fetchAllRoleWiki()
    const role = allRoleWiki.find(role => role.name === roleName)

    const voices = await this.fetchRoleVoice(role.id)

    const targetVoice = voices.find(i => i.name.includes(seg))

    if (targetVoice) {
      await this.reply(segment.record(targetVoice.url))
    } else {
      await this.reply('呃呃……没有找到对应语音条目')
    }
  }

  /** 拉取所有角色的wiki词条并返回 */
  async fetchAllRoleWiki() {
    /** 角色wiki */
    const allRoleWikiUrlKey = 'Voice::AllRoleWiki'
    let allRoleWiki = await redis.get(allRoleWikiUrlKey)

    if (allRoleWiki) {
      allRoleWiki = JSON.parse(allRoleWiki)
    } else {
      const allRoleWikiUrl = 'https://api-static.mihoyo.com/common/blackboard/ys_obc/v1/home/content/list?app_sn=ys_obc&channel_id=189'
      const _res = await (await fetch(allRoleWikiUrl)).json()
      allRoleWiki = _res.data.list[0].children[0].list.map(i => ({
        id: i.content_id,
        name: i.title
      }))
      redis.set(allRoleWikiUrlKey, JSON.stringify(allRoleWiki))
    }

    return allRoleWiki
  }

  /** 拉取指定角色的语音词条并返回 */
  async fetchRoleVoice(roleId) {
    const voiceReidsKey = `VoicePlugin::${roleId}`
    let sourceInfo = await redis.get(voiceReidsKey)

    if (sourceInfo) {
      sourceInfo = JSON.parse(sourceInfo)
    } else {
      const url = `https://api-static.mihoyo.com/common/blackboard/ys_obc/v1/content/info?app_sn=ys_obc&content_id=${roleId}`
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

    return sourceInfo
  }
}