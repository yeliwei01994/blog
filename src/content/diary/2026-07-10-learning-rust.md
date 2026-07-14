---
title: "7/6-7/12 工作与学习记录"
description: "记录本周的项目维护、新功能开发以及 Rust 学习实践"
publishedAt: 2026-07-12
draft: false
---

## 7/6-7/12 工作与学习记录

## 一、项目工作

### 1. 坤元智算官网门户站维护

上周的主要工作集中在坤元智算官网门户站，期间主要进行了网站内容维护、页面优化以及部署脚本编写等工作。

#### 图片资源优化

在检查门户网站页面时，发现部分页面使用的图片文件比较大，会对页面首次加载速度产生一定影响。因此对网站中的部分大图进行了压缩处理。

本次优化主要是在不影响正常观看效果的前提下，适当降低图片文件大小，减少页面加载时需要传输的数据量。处理完成后，也对图片在页面中的展示效果进行了检查，确保没有出现明显的模糊、变形等问题。

通过这次优化，进一步体会到页面加载速度不仅和代码有关，图片等静态资源的大小同样会影响用户的访问体验。

#### 添加新的新闻内容

根据网站内容更新需求，在门户网站中添加了一条新的新闻内容。

本次工作主要包括：

- 整理新闻标题和正文内容；
- 准备并上传新闻相关图片；
- 调整新闻的发布时间和展示信息；
- 检查新闻列表和详情页面的显示效果；

添加完成后，对新闻页面进行了整体检查，确保新内容能够正常展示，并且与网站原有的页面风格保持一致。

#### 编写 Windows 环境部署脚本

为了方便项目在 Windows 环境下进行部署，上周还编写了一个项目部署脚本，将原本需要手动执行的部分操作整理到脚本中。

脚本目前主要用于检查构建目录、复制项目文件以及提示部署状态，示例代码如下：

```powershell
Write-Host "开始部署门户网站项目..."

if (!(Test-Path "dist")) {
    Write-Host "未找到构建目录，请先执行项目构建"
    exit 1
}

if (!(Test-Path "deploy")) {
    New-Item -ItemType Directory "deploy" | Out-Null
}

Write-Host "正在复制项目文件..."
Copy-Item -Path "dist\\*" -Destination "deploy\\" -Recurse -Force

Write-Host "门户网站部署完成"
```

之前如果完全依靠手动操作，容易因为路径、文件复制等问题出现遗漏。将这些操作整理成脚本后，部署过程更加清晰，也方便后续重复使用。

### 2. 算力运营平台项目

上周也开始接触算力运营平台项目，目前主要处于项目熟悉阶段。

刚开始接触新项目时，首先需要花一些时间了解项目是做什么的、各个功能模块之间有什么关系，以及项目代码是如何组织的。目前主要对项目背景、业务方向和代码结构进行了初步了解，并记录了一些暂时还不熟悉的业务内容。

通过这次接触，对算力运营相关的平台有了一个比较初步的认识。后续还需要继续熟悉具体的业务流程和功能实现，逐步了解平台在算力资源管理、任务调度和运营管理等方面的功能。

## 二、Rust 学习

### 1. 学习进度

上周开始学习 Rust，目前已经阅读《The Rust Programming Language》至第十章。

目前主要学习了变量和可变性、函数、控制流、所有权、引用与借用、结构体、枚举、集合类型、错误处理、泛型和 Trait 等内容。

Rust 和之前接触过的一些语言有比较明显的区别，尤其是所有权、借用和生命周期这些概念，需要花时间去理解。不过写了一些小例子之后，能够感受到 Rust 的编译器确实是在帮助开发者提前发现问题。

### 2. 所有权实践

```rust
fn main() {
    let first = String::from("hello");
    let second = first;

    println!("{}", second);
    // first 的所有权已经转移给 second，不能继续使用 first
}
```

如果需要复制一份新的数据，可以使用 `clone`：

```rust
fn main() {
    let first = String::from("hello");
    let second = first.clone();

    println!("first = {}", first);
    println!("second = {}", second);
}
```

通过这个练习，理解了 Rust 中“移动”和“复制”的区别。

### 3. 引用和借用实践

```rust
fn calculate_length(text: &String) -> usize {
    text.len()
}

fn main() {
    let message = String::from("hello rust");
    let length = calculate_length(&message);

    println!("{} 的长度是 {}", message, length);
}
```

如果需要修改数据，则需要使用可变引用：

```rust
fn add_suffix(text: &mut String) {
    text.push_str(" language");
}

fn main() {
    let mut message = String::from("Rust");
    add_suffix(&mut message);

    println!("{}", message);
}
```

### 4. 结构体、泛型和 Trait 实践

```rust
struct Counter {
    value: u32,
}

impl Counter {
    fn increase(&mut self) {
        self.value += 1;
    }

    fn current(&self) -> u32 {
        self.value
    }
}

fn main() {
    let mut counter = Counter { value: 0 };
    counter.increase();
    counter.increase();

    println!("当前计数：{}", counter.current());
}
```

第十章主要学习了泛型、Trait 和生命周期。泛型可以让同一个函数支持不同类型的数据，Trait 则可以为不同类型定义统一的行为。

```rust
trait Summary {
    fn summarize(&self) -> String;
}

struct News {
    title: String,
}

impl Summary for News {
    fn summarize(&self) -> String {
        format!("新闻：{}", self.title)
    }
}
```

这一周主要还是以阅读和小例子练习为主。Rust 目前还处于入门阶段，生命周期等内容还需要继续结合具体代码理解。

