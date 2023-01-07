# Voice Plugin
云崽原神 QQ 群机器人语音消息插件，通过米游社接口与部分预制音频生成语音消息

## 使用方法

克隆项目至 plugins 目录即可
```
cd Yunzai-Bot/plugins/
git clone https://github.com/yuchiXiong/voice-plugin.git
```

插件使用 [cheerio](https://cheerio.js.org/) 解析，因此您需要安装依赖

```
pnpm add cheerio -w
```

enjoy it!


## 功能介绍
| 指令 | 说明 |
| :---: | --- |
| `困呐啊` | [荧 CV 宴宁直播语音：怎么还在睡啊](https://www.bilibili.com/video/BV1NS4y1q7n3/?spm_id_from=333.337.search-card.all.click) |
| `早上好 or 中午好 or 晚上好` | 角色米游社配音<br /> `早上好` 词条会有20%(不固定，可能会调整)概率触发[荧 CV 宴宁直播语音：困呐困呐困呐](https://www.bilibili.com/video/BV14R4y1f7Ei/?spm_id_from=333.337.search-card.all.click&vd_source=d1b989264b8b671d1a2be75bf67c00b0)，~~毕竟工作日的早上是真的困~~<br /> 每天只会随机拉取一位角色，当天的角色语音都为该角色，`redis` 使用日期作为 `key` 如 `2022-01-01` |

