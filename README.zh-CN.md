# dApp Workshop 快速开始

仓库包含三个可运行的课堂项目和一份约 60 分钟的英文课件。项目 1 与项目 2 从上游原始代码重新整理，并保留原始前端；项目 3 使用 Scaffold-ETH 2 官方 Tokenization challenge。

## 一键运行

安装 Node.js 24 后，在 macOS 双击根目录脚本，或在终端运行：

```bash
./run-lock.command
./run-election.command
./run-tokenization.command
```

首次运行会安装固定版本的依赖。脚本随后启动本地区块链、部署合约、启动前后端，并打开各自的固定地址：

| 项目 | 前端地址 |
|---|---|
| Lock | `http://127.0.0.1:3001` |
| Election | `http://127.0.0.1:3002` |
| Tokenization | `http://127.0.0.1:3003/myNFTs` |

三个项目的本地链仍共用 RPC 端口 8545，因此请一次只运行一个项目；不同的前端端口可以避免标签页和书签混淆。在终端按 Ctrl+C 可完整停止。

| 项目 | 交互路径 | 课堂重点 |
|---|---|---|
| [Lock](lock/WORKSHOP.md) | 原始 React 前端 → MetaMask → Ganache → Lock 合约 | 钱包连接、用户签名、时间条件、合约余额 |
| [Election](election/WORKSHOP.md) | 原始 React 前端 → Express 后端 → Web3 → Ganache → 工厂／选举合约 | 前后端边界，以及后端代签带来的信任假设 |
| [Tokenization](tokenization/WORKSHOP.md) | Scaffold-ETH Next.js → Burner Wallet 或 MetaMask → Hardhat → ERC-721 | 铸造、元数据、所有权、转账和事件 |

## Lock 的 MetaMask 设置

1. 在 MetaMask 新增网络：RPC `http://127.0.0.1:8545`，Chain ID `31337`，货币符号 `ETH`。
2. 导入启动脚本打印的测试私钥。它只对应公开的本地开发账户。
3. 打开 Lock 页面并连接钱包，选择未来的 UTC 解锁时间，依次演示 Deploy、Unlock 和 Withdraw。
4. 每个写操作都需要在 MetaMask 中确认；页面会等交易上链后刷新余额。

不要向这个公开开发地址发送真实资产，也不要在真实网络复用测试私钥。

## 测试与文档

```bash
./run-lock.command --test
./run-election.command --test
./run-tokenization.command --test
./test-all.sh
```

- [英文 PPT](docs/dApp-workshop-original-plus-tokenization.pptx)：保留原来的 15 页，追加三个项目的架构、演示步骤和 60 分钟安排。
- [英文讲者指南](docs/PRESENTER-GUIDE.md)：逐页时间、操作步骤和失败时的替代方案。
- [前后端架构说明](docs/ARCHITECTURE.md)：说明谁持有密钥、谁签名、哪些状态在链上。
- [验证记录](docs/VERIFICATION.md)：本地测试、浏览器检查和仍待人工确认的项目。
- [第三方来源与许可](THIRD-PARTY-NOTICES.md)：三个项目的来源提交与许可边界。

Tokenization 的本地铸造和转账不需要公网；可选的 IPFS 上传练习需要网络。代码用于教学，未经过生产安全审计。
