---
title: "Vision Analysis Agent 系统架构学习整理：Nginx、MySQL、Redis 与 Docker"
description: "整理视觉事件检索平台的系统架构、数据模型、异步处理链路和部署理解。"
publishedAt: 2026-08-25
draft: false
---

# Vision Analysis Agent 系统架构学习整理


## 一、本次学习的核心结论

这个系统不是“上传接口直接分析视频”，而是将一次视频处理拆成三个阶段：**API 快速接收任务、Redis 排队、Worker 后台分析**。这样可以把耗时的 `ffmpeg` 抽帧、YOLO 推理和事件生成从 HTTP 请求中分离出来。

四项核心技术的职责边界如下：

| 技术 | 在本系统中的核心职责 | 不能替代的部分 |
|---|---|---|
| Nginx | 统一入口、前端静态文件、API 反向代理、媒体文件访问 | 不负责视频分析和业务数据保存 |
| MySQL | 持久化任务、事件、规则及状态，支持查询、索引和事务 | 不适合承担大文件存储和高频队列消费 |
| Redis | 使用 Stream 传递异步任务，承载短期队列状态 | 不能作为任务最终结果的唯一存储 |
| Docker | 封装运行环境、服务网络、数据卷和启动依赖 | 不等于自动完成监控、备份和高可用 |

最重要的数据原则是：**MySQL 保存事实，Redis 负责调度，媒体卷保存视频，Worker 执行计算，Nginx 负责对外提供访问入口。**

## 二、整体架构与一次请求的完整链路

```text
浏览器 / React
       │  HTTP / JSON / multipart
       ▼
Nginx（前端容器内）
       ├── /              → 返回 React 静态文件
       ├── /api/          → Rust API:8080
       └── /media/        → 读取共享媒体目录
                              │
                              ├── MySQL 8.4：任务、事件、规则
                              └── Redis 7 Stream：vision:jobs
                                             │
                                             ▼
                                     Rust Worker
                                             │
                              ffmpeg 抽帧 → YOLO 推理
                                             │
                                             ▼
                                  规则引擎生成事件
                                             │
                                             ▼
                                        MySQL 写回
```

一次视频上传的主要步骤如下：

1. React 通过 `POST /api/v1/videos/upload` 发送视频文件。
2. API 对文件名进行清理，将视频写入 `/app/media`，并读取视频时长。
3. API 创建一条 `video_jobs` 任务记录，初始状态为 `pending` 或 `processing`。
4. API 向 Redis Stream `vision:jobs` 写入包含 `job_id` 的消息，并立即返回任务信息。
5. Worker 从 Stream 读取任务，根据 `job_id` 从 MySQL 或内存状态加载任务。
6. Worker 调用 `ffmpeg` 抽取 JPEG 帧，再调用 `YOLO_URL/v1/infer/frame` 识别目标。
7. 规则引擎根据目标类别、置信度和持续时间生成业务事件。
8. Worker 将事件写入 `events`，同时把任务状态更新为 `completed` 或 `failed`。
9. React 轮询 `GET /api/v1/jobs/{id}`，完成后刷新事件列表。

## 三、Nginx：系统的统一入口

### 1. Nginx 在本系统中的作用

Nginx 位于浏览器和 Rust API 之间，主要解决四个问题：

- **静态资源服务**：直接返回 React 构建产物，不让 Rust API 处理 JS、CSS 和图片。
- **反向代理**：将 `/api/` 请求转发给内部服务 `api:8080`。
- **统一访问地址**：浏览器只需要访问同一个域名和端口，不需要知道后端容器地址。
- **媒体文件访问**：从共享目录返回视频或证据文件，并设置访问缓存策略。

当前 Nginx 并不是单独的 Compose 服务，而是通过 `frontend/Dockerfile` 进入前端运行镜像：构建阶段生成 `dist`，运行阶段使用 `nginx:1.27-alpine` 提供页面和代理。



### 2. Nginx 请求示例

```text
浏览器请求：POST /api/v1/videos/upload
        ↓
Nginx 匹配 location /api/
        ↓
Docker 内部转发：http://api:8080/api/v1/videos/upload
        ↓
Rust API 保存文件并返回 job_id
```

Nginx 的价值在于稳定接口边界：API 将来可以从单实例扩展为多个实例，前端仍然请求 `/api/...`。如果需要扩容，可进一步配置 `upstream api_servers`，但视频 Worker 的扩容应通过增加 Worker 容器数量完成，而不是让 Nginx 直接参与任务调度。

## 四、MySQL：系统的事实来源和持久化中心

### 1. MySQL 保存什么

MySQL 保存系统中需要长期查询、审核和追踪的事实：

- 视频处理任务的名称、时长、状态、进度和来源地址；
- 由检测和规则引擎生成的事件及证据；
- 事件规则、目标类别、阈值和规则版本；
- 任务与事件之间的关联关系；
- 删除时间、创建时间和更新时间等审计所需信息。

视频文件本身不放在 MySQL 中。当前实现将视频写入共享卷 `media_data`，在 `video_jobs.source_uri` 中保存路径。生产环境可以把文件替换为对象存储 URI，但数据库仍只保存元数据和地址。

### 2. 核心表结构

#### `video_jobs`：视频任务表

| 字段 | 类型 | 作用 |
|---|---|---|
| `id` | `CHAR(36)` | UUID 主键，标识一次处理任务 |
| `filename` | `VARCHAR(255)` | 原始或清理后的视频文件名 |
| `duration_ms` | `BIGINT UNSIGNED` | 视频时长，单位毫秒 |
| `status` | `VARCHAR(32)` | `pending`、`processing`、`completed`、`failed`、`cancelled` |
| `progress` | `TINYINT UNSIGNED` | 处理进度，通常为 0–100 |
| `source_uri` | `TEXT` | 视频文件路径或对象存储地址 |
| `deleted_at` | `DATETIME` | 软删除时间，空值表示有效 |
| `created_at` / `updated_at` | `TIMESTAMP` | 创建和更新时间 |

#### `events`：视觉事件表

| 字段 | 类型 | 作用 |
|---|---|---|
| `id` | `CHAR(36)` | 事件 UUID |
| `job_id` | `CHAR(36)` | 外键，关联 `video_jobs.id` |
| `event_type` | `VARCHAR(128)` | 业务事件，例如 `person_stay` |
| `start_time_ms` / `end_time_ms` | `BIGINT UNSIGNED` | 事件在视频中的时间范围 |
| `severity` | `VARCHAR(32)` | 风险等级，如 `high`、`medium` |
| `status` | `VARCHAR(32)` | `unreviewed`、`confirmed`、`ignored` |
| `confidence` | `FLOAT` | 事件置信度 |
| `objects_json` | `JSON` | 目标类别、边界框、跟踪 ID 等检测结果 |
| `evidence_json` | `JSON` | 帧地址、时间点或证据片段信息 |
| `analysis_json` | `JSON` | 规则或大模型生成的摘要、建议 |
| `rule_version` | `VARCHAR(64)` | 生成事件时使用的规则版本 |
| `prompt_version` | `VARCHAR(64)` | 大模型提示词版本，可为空 |
| `detector_version` | `VARCHAR(64)` | 检测器版本，如 `yolov8n` |

#### `event_rules`：事件规则配置表

| 字段 | 类型 | 作用 |
|---|---|---|
| `event_type` | `VARCHAR(128)` | 主键，事件类型 |
| `class_name` | `VARCHAR(128)` | 关注的目标类别，如 `person` |
| `min_confidence` | `FLOAT` | 最低置信度阈值 |
| `min_duration_ms` | `BIGINT UNSIGNED` | 最低持续时间 |
| `version` | `VARCHAR(64)` | 规则版本 |
| `updated_at` | `TIMESTAMP` | 最近修改时间 |

### 3. 表关系和索引

```text
video_jobs 1 ─────────── N events
                         │
event_rules 按 event_type 提供生成规则
```

当前迁移文件中定义了以下关键索引：

```sql
INDEX idx_video_jobs_status (status),
INDEX idx_video_jobs_created_at (created_at),
INDEX idx_events_type_time (event_type, start_time_ms),
INDEX idx_events_status (status)
```

例如查询最近的待复核事件：

```sql
SELECT id, job_id, event_type, start_time_ms, severity, confidence
FROM events
WHERE status = 'unreviewed'
ORDER BY created_at DESC
LIMIT 50;
```

`status` 索引帮助缩小扫描范围；如果未来经常按“事件类型 + 时间范围”检索，则 `idx_events_type_time` 可以直接服务这类查询。索引并非越多越好，因为插入和更新时也要维护索引。


## 五、Redis：异步任务队列与短期状态

### 1. 为什么需要 Redis

Redis 在这个项目中用于实现“异步视频分析”。
视频分析包含抽帧、YOLO 识别、规则判断和事件生成，通常比较耗时。如果 API 在接收视频后同步完成这些操作，前端请求会一直等待，多个视频同时上传时 API 也容易被占满。
使用 Redis 后，API 只需快速完成三件事：

1. 保存视频文件；
2. 在 MySQL 创建视频任务；
3. 向 Redis 写入一条待处理任务。
随后 API 立即返回，Worker 在后台从 Redis 获取任务并执行实际分析。
```
前端上传视频
    ↓
API 保存文件、创建 MySQL 任务
    ↓
Redis 写入待处理任务
    ↓
API 立即返回
    ↓
Worker 后台异步处理视频
```
Redis 的价值包括：
- 上传接口不会被视频分析阻塞；
- 多个视频任务可以排队处理；
- API 与视频分析逻辑解耦；
- 可以扩展多个 Worker 并行消费任务；
- Worker 临时不可用时，任务仍保留在队列中等待处理。


### 2. Redis 中应该保存什么

Redis 不应保存视频文件，也不应保存最终事件结果。
在当前项目中，Redis 只保存“任务通知”，即告诉 Worker：哪个视频任务需要处理。
当前使用的 Redis Stream 名称为：vision:jobs
消息示例：
```
{
  "job_id": "7d112288-3eb7-4d2d-84e4-d07eed51e34c",
  "attempt": 0
}
```
| 字段 | 作用 |
|---|---|
| `job_id` | 对应 MySQL `video_jobs.id`，Worker 用它查询视频路径和任务信息 |
| `attempt` | 当前处理尝试次数，用于后续失败重试机制 |




## 六、Docker：把服务、网络和数据组织起来

### 1. 服务组成

当前 Compose 服务关系如下：

| 服务 | 作用 | 对外端口 |
|---|---|---|
| `frontend` | React 构建产物 + Nginx | `8088:80` |
| `api` | Rust HTTP API | `8080:8080` |
| `worker` | Rust 后台任务进程 | 无 |
| `yolo` | YOLOv8n 推理服务 | `9000:9000` |
| `mysql` | MySQL 数据库 | 默认不直接暴露 |
| `redis` | Redis Stream 队列 | 默认不直接暴露 |

`api` 和 `worker` 使用同一个 Rust 镜像，通过 `WORKER_MODE=1` 区分启动行为；API 监听 `8080`，Worker 进入 Redis 消费循环。

### 2. Compose 配置解析

```yaml
api:
  environment:
    DATABASE_URL: mysql://vision:password@mysql:3306/vision_events
    REDIS_URL: redis://redis:6379
    YOLO_URL: http://yolo:9000
  volumes:
    - media_data:/app/media
  depends_on:
    mysql:
      condition: service_healthy
    redis:
      condition: service_healthy
```

这里有三个重点：

1. 容器内使用服务名 `mysql`、`redis`、`yolo`，不能写宿主机 `localhost`。
2. `depends_on` 只控制启动顺序和健康条件，不代表业务接口一定成功，仍需检查日志和健康接口。
3. `media_data` 同时挂载给 API、Worker 和前端，保证上传文件、分析进程和媒体访问使用同一份数据。

MySQL 使用 `mysql_data:/var/lib/mysql`，这是持久化的关键。如果只使用容器可写层，删除或重建容器后数据库数据会丢失。YOLO 模型则使用 `yolo_models` 缓存，避免每次重建容器都重新下载权重。

### 3. 启动与验证

```powershell
cd D:\vision-analysis-agent
docker compose config
docker compose up -d
docker compose ps
docker compose logs -f api worker
```

建议按以下顺序排查：

1. `docker compose ps` 确认容器是否运行。
2. 检查 MySQL 和 Redis 的 healthcheck。
3. 访问 `http://localhost:8088`，确认 Nginx 和前端可用。
4. 访问 `http://localhost:8080/health`，确认 API 可用。
5. 上传视频，确认 MySQL 出现任务记录、Redis 出现 Stream 消息。
6. 查看 Worker 日志，确认抽帧、YOLO 调用和事件写入完成。
7. 在前端确认任务状态、事件详情和审核状态一致。

## 七、异常处理与运维重点

### 1. 常见故障定位

| 现象 | 优先检查 |
|---|---|
| 页面打不开 | `frontend` 容器、Nginx 配置、8088 端口 |
| API 404/502 | `/api/` 代理路径、`api:8080` 服务名和 API 日志 |
| 视频上传失败 | Nginx 512 MB 限制、Axum 500 MB 限制、磁盘和 `media_data` |
| 任务一直处理中 | Redis Stream、Worker 日志、共享媒体卷 |
| 任务失败 | `ffmpeg`、`YOLO_URL`、模型服务健康状态 |
| 事件查询为空 | MySQL 连接、迁移是否执行、Worker 是否写入 `events` |
| 重启后任务丢失 | 是否读取 MySQL、Redis 是否配置持久化、任务是否具备重试 |

### 2. 安全和生产注意事项

- Compose 中的开发密码只能用于本地环境，生产环境必须使用环境变量或密钥管理系统。
- MySQL 和 Redis 不应直接暴露公网，优先只加入内部 Docker 网络。
- 上传文件名必须清理，不能直接使用用户输入拼接路径。
- 生产环境应限制视频大小、视频格式、并发任务数和单任务运行时长。
- MySQL 应有定期备份；媒体文件应使用可靠对象存储或备份策略。
- Redis 生产版需要明确持久化、重试、死信和监控方案。
- 需要记录 `job_id`、请求 ID、Worker 日志和模型版本，方便从一次上传追踪到最终事件。



## 八、总结

Vision Analysis Agent 的核心架构可以概括为：**Nginx 负责入口，Rust API 负责接入，Redis 负责排队，Worker 负责计算，MySQL 负责落库，Docker 负责把这些服务稳定地组织起来。**

其中最重要的设计不是某一条命令，而是职责分离：API 不被视频分析阻塞，Redis 不承担最终数据，MySQL 不存放大文件，Worker 不直接面对浏览器，Nginx 不承载业务逻辑。理解这条边界，就能更准确地进行开发、部署、故障排查和后续扩容。

## 参考资料

- [Docker Documentation](https://docs.docker.com/manuals/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Redis Documentation](https://redis.io/docs/latest/)
- [MySQL 8.4 Reference Manual](https://dev.mysql.com/doc/refman/8.4/en/)
