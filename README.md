# EtherWM supplementary page

打开 `index.html` 查看本地页面。页面采用相对路径，没有 CDN、远程字体或运行时依赖。

## 当前内容

- 01 Overview：完整 teaser / Figure 1 切换；工具栏右侧提供与切换按钮平齐的静音图标，与原生音量控件同步。Teaser 为 143.4 秒、1080p / 30 fps，保留原音轨，默认静音、1× 手动播放；居中半透明播放按钮在播放时隐藏，暂停或结束时重新显示。
- 02 Method：Figure 2 与循环流程动画。
- 03 Long Horizon：110 秒 GT / OSCAR / EtherWM 比较与同步曲线。
- 04 More Results：DROID 五模型比较，上排 GT / EtherWM，下排三个基线；Across everyday scenes 提供四种带时长的 GT / EtherWM 案例，四个额外案例的数据集来源尚未确认。
- 05 Generalization：叠衣服与擦桌子动作迁移。两例均展示 Action source GT + Scene source GT → EtherWM；擦桌子下方以细线分隔三个基线。保留 Figure 3 / 7 关键帧条和 Table 3 / 4，移除原三个跳转卡和 PSNR 曲线。
- 06 Ablations：紧凑的论文 8 秒细节图；一行 GT / EtherWM / 可切换消融视频。右侧三个按钮切换 Without both、Without memory、Without Motion Tower，每次点击均让当前显示的三个视频从头同步播放，保留所选倍速。保留完整消融表。
- 07 Simulation Datasets：额外测试仿真数据集 RoboTwin 2.0，仅展示 WorldArena 表格，置于引用之前。
- 08 Citation：匿名 BibTeX 模板，可复制。

首页保留全屏 EtherWM 背景，按水槽长程 → Kitchen interaction 两段视频轮转，段间不加停顿。左下角用英文注明背景均为 EtherWM 长程推理；右下角依次展示实时播放秒数、暂停、下一段，不显示视频名称。悬停或点击时长可展开可拖动进度条与倍速按钮，支持 1 / 2 / 4 / 8 / 16×，切换视频保留倍速与暂停状态。桌面解释句保持单行，资源按钮图标与文字垂直居中。`assets/paper/paper.pdf` 已更新为本次提供的论文。

## 视频来源与命名

完整 teaser：`EtherWM_teaser_v3/EtherWM_v3_full_with_intro.mp4` 原样复制为 `assets/videos/etherwm-teaser.mp4`，未重新编码，H.264 / AAC 与原画质保持一致；配套海报提取自第 1 秒。

13 个来源文件导出为 22 个独立 H.264 视频。所有拼接画面均裁为单路，无重绘、插帧或放大。保留源帧率和帧数；CRF 18、yuv420p、faststart。每段附首帧 WebP。原素材文件保持原样。

| 原文件 | 网页输出 / 用途 |
| --- | --- |
| 3.mp4 | `sink-gt`、`sink-etherwm`、`sink-oscar`：左 / 中 / 右三路；首页复用 EtherWM |
| 4.mp4、5.mp4 | `fold-scene2-gt`、`fold-scene1-gt`：左侧原始 GT，分别作为动作来源和场景来源 |
| 6.mp4 | `kitchen-gt`、`kitchen-etherwm`：DROID 第一例；GT 另作为擦拭迁移的动作来源 Scene 2 |
| 0.mp4、1.mp4、7.mp4 | `window-*`、`cloth-*`、`cup-*`：左 GT、右 EtherWM |
| 2.mp4 | `wipe-etherwm`、`wipe-ctrl`、`wipe-mini`：按 Figure 7 对照，左 / 中 / 右 |
| Generalization2_wipe.mp4 | `wipe-oscar`：第二栏，补齐 Figure 7 四模型比较 |
| ablation_ours.mp4 | `ablation-gt`、`ablation-etherwm`：左 GT、右 EtherWM |
| ablation_no_motion_tower.mp4 | `ablation-no-motion`：右侧 |
| ablation_no_motion_tower_and_memory.mp4 | `ablation-no-motion-or-memory`：右侧 |
| ablation_no_memory.mp4 | `ablation-no-memory`：左侧 Original inference，经用户向素材方核实后用于 Without memory |

**Memory 素材的身份：**用户向素材提供方核实后确认该文件对应 Without memory。页面采用左侧 Original inference，命名 `ablation-no-memory.mp4`；不采用右侧标记为后处理示意的画面。来源与用户确认记录保留在 manifest 中。独立 Object-detail degradation 区域已删除。

擦拭比较里的 Action source · GT 是 Scene 2 动作来源，并非 Scene 1 反事实迁移结果的 ground truth。模型顺序按更新论文 Figure 7 的画面对照。

## 时间轴与播放

- 背景默认 8×；长程、泛化、消融默认 8×；厨房默认 8×；三个短 DROID 案例默认 1×。可切换 1 / 2 / 4 / 8 / 16×。
- 实验播放器结束后停留 3 秒再循环；首页连续切换下一段，无结束停留。画面离屏暂停，手动暂停不会被滚动自动取消；系统减少动态效果时尊重该设置。
- 任一路滑条可拖动整组；同组视频保持同步。四个日常场景案例使用实际导出秒数。
- 长程 109 秒、折衣 45.8 / 31.4 秒、擦拭 65.8 秒、消融 29 / 26.6 秒的导出时长与论文时间轴不同。它们按播放进度归一化；卡片显示导出时间，主轴按论文时间轴显示计时，不加 Paper 前缀。精确帧—指标对应尚未核实。
- 长程曲线来自论文图的近似数字化，不是原始日志。泛化章节不再绘制动态 PSNR；输入 GT 是来源场景，不是反事实迁移结果的 GT。
- DROID 原图曲线带有人工调整 / illustrative 标识，保留相应说明。Table 4 为逐帧质量评分，不代表时间一致性评分。

表格保留 Replay 以重新播放分阶段浮现，删除 Show all 按钮。

## 后续替换

- `content.js`：首页 `heroClips` 列表、媒体路径、案例配置、表格、资源链接；空视频继续显示论文关键帧。首页轮播目前只含两段真实视频，后续可在 `heroClips` 中添加新的背景视频。
- 原 DROID 五模型视频、叠衣动作迁移的 Ours 视频、擦拭任务的 Scene 1 GT 视频仍待补；后两者目前使用论文关键帧，带 Paper 标识。
- 资源按钮使用贴在右上角的圆角 TODO 挂签，保留 1 秒自动消失的 Coming soon；公开版链接填写在 `resources` 中。
- `assets/videos/manifest.json` 记录来源、裁剪坐标、帧数、时长、编码、文件大小和示意标签。
- `scripts/prepare_videos.py <素材目录>` 可增量重新导出；`node scripts/validate.mjs` 检查本地引用、媒体与曲线配置及来源标识。

验证使用本地 HTTP 预览，已检查独立视频加载、切换、同步拖动与桌面/手机布局；浏览器自动化不支持本地 file URL，因此没有自动化验证双击打开路径。
