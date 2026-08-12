---
title: "7/27-8/3 工作与学习记录"
description: "记录坤元智算门户网站运维、Forge 项目展示页面设计与 Rust学习进度"
publishedAt: 2026-08-03
draft: false
---

## 7/27-8/3 工作与学习记录

## 一、项目工作

### 1. 坤元智算门户网站运维

本周继续进行坤元智算门户网站的日常运维和主页面维护，主要完成了标题更新、页面跳转修复，以及产品软件页面的新增。



#### 页面跳转修复

本周还检查并修复了部分页面跳转问题。网站中的按钮、导航和内容链接看起来是比较基础的功能，但如果目标地址、路由路径或跳转逻辑出现问题，会直接影响用户继续浏览网站。

此次修复重点是确认：

- 点击入口后是否能进入正确页面；
- 页面内部链接是否保持一致；
- 新增页面是否能从主页面或相关导航正常访问；
- 修改后是否影响原有页面的跳转。



#### 新增产品软件页面

本周新增了产品软件页面，用于集中展示相关产品和软件信息。

### 2. Forge 项目介绍与页面设计

本周还对 Forge 项目进行了页面设计，并将 Forge 项目介绍内容整理到门户网站中。

Forge 项目可以理解为一个由 AI 驱动的网站生成与发布平台：用户输入需求，系统分析需求、生成网站代码、完成构建检查和页面截图检查，最后将通过验证的网站部署出去。

```text
用户描述需求
        ↓
Forge 分析生成目标
        ↓
生成或修改网站代码
        ↓
执行构建检查
        ↓
进行页面截图检查
        ↓
部署通过验证的网站
```

这次主要完成的是 Forge 项目介绍页面的内容整理与视觉设计，让用户可以从门户网站中了解 Forge 的项目定位、核心流程和应用方向。

页面设计时重点考虑了以下内容：

- Forge 是什么，主要解决什么问题；
- AI 如何参与网站生成流程；
- 从需求输入到网站部署的完整链路；
- Forge 适合应用在哪些网站生成或内容展示场景中。

目前 Forge 页面已经完成设计和内容整理，但暂时还没有接入到服务器环境。因此现阶段主要是完成前端页面和展示内容，后续还需要根据服务器部署方式、访问入口和资源配置进行接入与验证。


## 二、Rust 学习进度

本周继续学习《The Rust Programming Language》第 17–20 章，内容涵盖异步编程、面向对象相关特性、模式匹配以及高级特性。其中第 20 章内容相对集中和抽象，因此本周重点放在第 20 章。

### 第 17 章：异步编程与 Async/Await

第 17 章主要学习 Rust 中的异步编程。`async` 用于声明一个异步函数，`.await` 用于等待异步操作完成：

```rust
async fn fetch_message() -> String {
    String::from("hello from async task")
}

async fn main_task() {
    let message = fetch_message().await;
    println!("{message}");
}
```

异步编程的核心不是同时创建很多线程，而是在等待网络、文件或其他耗时操作时，让程序可以先处理其他任务。Rust 使用 `Future` 表示“未来会完成的计算”，而异步运行时负责实际调度这些任务。通过这一章，我对后端接口、流式消息和 Agent 任务为什么经常使用异步有了更直观的认识。

### 第 18 章：面向对象相关特性

第 18 章介绍了 Rust 如何通过 `struct`、`enum`、trait 和封装来组织对象和行为。Rust 没有完全照搬传统面向对象语言中的继承机制，而是更倾向于通过 trait 表达共享行为。

```rust
trait Draw {
    fn draw(&self);
}

struct Button;

impl Draw for Button {
    fn draw(&self) {
        println!("draw a button");
    }
}
```


### 第 19 章：模式匹配与模式语法

第 19 章进一步学习了模式匹配。前面接触过的 `match`、`if let` 和 `while let` 都属于模式匹配的使用方式。模式可以把数据拆开，并根据不同结构执行对应逻辑：

```rust
enum Message {
    Move { x: i32, y: i32 },
    Write(String),
}

fn main() {
    let message = Message::Move { x: 3, y: 5 };

    match message {
        Message::Move { x, y } => println!("move to ({x}, {y})"),
        Message::Write(text) => println!("message: {text}"),
    }
}
```

模式匹配的作用不只是判断某个值是否相等，还可以同时取出枚举、结构体、元组或引用内部的数据。这使得 Rust 在处理 `Option`、`Result` 和复杂数据结构时，能够把不同情况写得比较清楚。

第 20 章把前面学习的所有权、trait、泛型、模块、闭包和错误处理进一步组合起来，内容包括不安全 Rust、高级 trait、关联类型、完全限定语法、函数指针、闭包返回、宏等。第一遍学习时不需要把每一个语法都完全掌握，重点是建立“这些高级能力分别解决什么问题”的概念。

### 1. Unsafe Rust

Rust 默认通过所有权和借用规则来保证内存安全，但某些底层场景需要绕过编译器的一部分检查，这时可以使用 `unsafe`。

```rust
unsafe {
    // 在这里可以执行需要人工保证安全的操作
}
```

`unsafe` 并不代表整段代码一定有问题，而是表示编译器无法替开发者证明这段操作是否安全，责任需要由开发者承担。

常见的 `unsafe` 能力包括：

- 解引用原始指针；
- 调用不安全函数或方法；
- 访问或修改可变静态变量；
- 实现不安全 trait；
- 调用外部函数接口。

例如原始指针可以指向一个变量，但 Rust 不会像普通引用一样自动保证它的有效性：

```rust
fn main() {
    let mut number = 5;

    let raw_pointer = &mut number as *mut i32;

    unsafe {
        *raw_pointer += 1;
    }

    println!("{number}");
}
```

这类代码的重点是：尽量把 `unsafe` 范围控制得很小，把需要人工确认安全的部分隔离出来。大多数普通业务代码仍然应该优先使用 Rust 的安全抽象。

### 2. 高级 Trait 与关联类型

前面学习 trait 时，trait 可以理解成一组行为约定。第 20 章进一步介绍了关联类型（associated type），它可以让 trait 在定义时声明一种“与实现类型相关的类型”。

例如标准库中的 `Iterator` trait：

```rust
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;
}
```

这里的 `Item` 表示迭代器每次产生的元素类型。不同迭代器可以有不同的 `Item`，但实现者只需要确定一次，不必像泛型一样在每次使用时重复指定类型。

第 20 章还介绍了运算符重载。Rust 中的 `+` 实际上对应 `Add` trait：

```rust
use std::ops::Add;

#[derive(Debug, Copy, Clone)]
struct Point {
    x: i32,
    y: i32,
}

impl Add for Point {
    type Output = Point;

    fn add(self, other: Point) -> Point {
        Point {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}
```

实现后就可以让两个 `Point` 使用 `+`：

```rust
let result = Point { x: 1, y: 0 } + Point { x: 2, y: 3 };
```


### 3. 完全限定语法

当多个 trait 或类型中存在同名方法时，Rust 需要一种明确指定“到底调用哪个方法”的写法，这就是完全限定语法。

```rust
<Type as Trait>::function(...)
```

例如：

```rust
trait Animal {
    fn baby_name() -> String;
}

struct Dog;

impl Dog {
    fn baby_name() -> String {
        String::from("Spot")
    }
}

impl Animal for Dog {
    fn baby_name() -> String {
        String::from("puppy")
    }
}

fn main() {
    println!("{}", Dog::baby_name());
    println!("{}", <Dog as Animal>::baby_name());
}
```

第一句调用 `Dog` 自己实现的方法，第二句则明确调用 `Animal` trait 中为 `Dog` 实现的方法。这个语法虽然不常在简单项目中出现，但在阅读复杂库代码时很有用。

### 4. 函数指针与闭包

函数不仅可以被直接调用，也可以作为参数传给其他函数。函数指针的类型写作 `fn`：

```rust
fn add_one(x: i32) -> i32 {
    x + 1
}

fn do_twice(f: fn(i32) -> i32, value: i32) -> i32 {
    f(value) + f(value)
}

fn main() {
    let answer = do_twice(add_one, 5);
    println!("{answer}");
}
```

这里 `do_twice` 不关心传进来的具体函数叫什么，只要求它接收一个 `i32` 并返回一个 `i32`。

函数和闭包有相似之处，但闭包还能捕获外部环境变量。第 20 章还涉及如何返回闭包，这通常需要使用 trait object：

```rust
fn returns_closure() -> Box<dyn Fn(i32) -> i32> {
    Box::new(|x| x + 1)
}
```

因为不同闭包的具体类型不同，编译器无法直接确定返回值大小；使用 `Box<dyn Fn(...)>` 可以把闭包放到堆上，并通过 trait object 进行统一处理。

### 5. 宏

宏和普通函数不同，宏可以在编译阶段根据输入生成代码。之前经常使用的 `println!`、`vec!` 和 `assert_eq!` 都是宏。

```rust
let values = vec![1, 2, 3];
println!("{values:?}");
```

宏适合处理可变数量参数、重复代码生成或需要在编译期展开的场景。但宏的定义和调试通常比普通函数复杂，所以实际项目中应该优先使用函数和 trait；只有当普通 Rust 代码无法方便解决问题时，再考虑宏。


