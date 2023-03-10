# Voice Plugin
云崽原神 QQ 群机器人语音消息插件，通过米游社接口提供部分角色语音消息与部分**整活彩蛋**语音。

## 使用方法

克隆项目至 plugins 目录即可
```
cd Yunzai-Bot/plugins/
git clone https://github.com/yuchiXiong/voice-plugin.git
```

插件使用 [cheerio](https://cheerio.js.org/) 解析米游社 HTML ，因此您需要安装依赖

```
pnpm add cheerio -w
```

enjoy it!

如遇到 `ffmpeg` 转 `amr` 相关问题，可查看[云崽 Bot 帮助文档进行安装/编译](https://github.com/Le-niao/Yunzai-Bot/issues/154#17-%E5%AE%89%E8%A3%85-ffmpeg%E5%8F%AF%E9%80%89)

> 另：有关于从 [OCIQ](https://github.com/takayama-lily/oicq) 协议库中移除 ffmpeg 的 [PR](https://github.com/takayama-lily/oicq/pull/484) 在进行中，有兴趣的可以参与进来。

## 功能介绍
| 指令 | 说明 |
| :---: | --- |
| `#角色名语音 米游设词条`（例`#胡桃语音 元素爆发·其一`) | 播放米游社角色 WIKI 角色配音中的对应条目，注意：条目使用 `includes` 按顺序匹配，角色名完整匹配，暂不支持别名 |
| `得得得` | 随机一条派蒙的星光考查角色 PV 语音 |
| `*困呐啊*` | [荧妹CV直播切片语音：气死了，怎么还在睡啊！](https://www.bilibili.com/video/BV1NS4y1q7n3/?spm_id_from=333.337.search-card.all.click) |
| `早上好 or 中午好 or 晚上好 or 晚安` | 角色米游社配音<br /> `早上好` 关键词会有 20% 概率(不固定，可能会随时调整)触发 [荧妹CV直播切片语音：困呐困呐困呐啊啊啊啊](https://www.bilibili.com/video/BV14R4y1f7Ei/?spm_id_from=333.337.search-card.all.click&vd_source=d1b989264b8b671d1a2be75bf67c00b0) 语音，~~工作日的早上是真的困~~<br /> 每天只会随机选择一位角色，`Redis` 使用日期作为 `key` 如 `2022-01-01` |
| 关键字 `绫华` | 聊天记录中包含关键字 `绫华` 时，有 5% 概率（不固定，可能会随时调整）触发 [人类圣经：我 是 神 里 绫 华 的 狗](https://www.bilibili.com/video/BV1Ru411Z7c1/?spm_id_from=333.788.recommend_more_video.0&vd_source=d1b989264b8b671d1a2be75bf67c00b0) 语音效果 |
