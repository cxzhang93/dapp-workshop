# dApp Workshop 快速开始

本仓库包含三个独立项目：Lock、Election、Crowdfunding。课件完整保留原来的 15 页，再追加 9 页第三个项目内容，讲者指南按 60 分钟安排。

## 一键运行

先安装 Node.js 24（最低 20）及 npm。在 macOS 上双击仓库根目录的脚本，或在终端执行：

```bash
./run-lock.command
./run-election.command
./run-crowdfunding.command
```

分别打开 `http://127.0.0.1:4181`、`http://127.0.0.1:4182`、`http://127.0.0.1:4183`。首次运行自动安装依赖、编译并部署合约；随后可复用已安装依赖。三个项目可同时运行，各自使用独立本地链。

不需要钱包插件、助记词、测试币领取或 API key。网页用下拉框选择临时本地账户，后端代该账户签名，在真实本地 EVM 上执行交易。**这不是已验证的 MetaMask 端到端模式。** 原项目 UI 源码放在各项目 `upstream/legacy-ui` 中供对照，启动的是整理后的课堂版 UI。

## 演示流程

- **Lock**：默认 Owner，点击 Withdraw 应被拒绝；Owner unlock 后再次 Withdraw，余额归零。切换 Other account 可以观察权限拒绝。重新部署可演示正常到期提款。
- **Election**：选择 `3: Voter A`，选区 1、候选人 1，Cast vote 后票数加一；重复投票会失败。选择 `5: Unregistered`，投票也会被拒绝。原始源码存在的相关问题已在课堂版修复，另有回归测试。
- **Crowdfunding**：选择 Supporter A，Contribute 两次，每次 0.5 ETH；Advance past deadline；切换 Owner 后 Owner claims。失败路径：New campaign 后只贡献一次，到期后由 Supporter A 退款。

在对应终端按 **Ctrl+C** 停止。重新运行脚本会得到全新的本地链、账户和合约。页面的“新建”按钮只重新部署，不销毁先前合约。

```bash
./test-all.sh                         # 全部合约和 HTTP 测试
./run-election.command --test         # 只测 Election
./run-lock.command --no-open          # 不自动打开浏览器
PORT=4191 ./run-lock.command          # 换端口
```

## 文件入口

- [保留原稿并追加第三项目的 PPT](docs/dApp-workshop-original-plus-crowdfunding.pptx)
- [英文讲者指南与一分钟级时间安排](docs/PRESENTER-GUIDE.md)
- [代码改动和验证结果](docs/VERIFICATION.md)
- [Lock 文档](lock/README.md)、[Election 文档](election/README.md)、[Crowdfunding 文档](crowdfunding/README.md)
- [原始课件内容保留检查](docs/PPT-preservation.json)

原课件中的历史表述保留不动，需口头补充的说明写在讲者指南。依赖安装放在课前，60 分钟包含现场演示、练习和问答。完整排障信息见 [English README](README.md)。
