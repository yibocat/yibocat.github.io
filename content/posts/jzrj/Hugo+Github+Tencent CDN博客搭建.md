---
title: "[建站日记] Hugo+Github+Tencent CDN博客搭建"
date: 2022-01-29T12:56:49+08:00
description: ""
draft: false
math: true

tags: ["Hugo","Github","博客"]
categories: ["建站日记"]
---

最近花费了近一周搭建自己的网站，准确的说是静态网页。这是网站的第一篇文章，也可以说是近一周来搭建个人博客的踩坑总结。

<!--more-->

网站采用的是 hugo 框架，只是因为 hugo 号称是 "The world’s fastest framework for building websites"，而其特点就在于轻。因为静态网页无需加载太多插件（wordpress 太重了）， 不需要访问数据库，不需要编写太多的网站功能，并且静态网页使用的是纯 html，对于博客系统来说是完全足够了，这也是我放弃 wordpress 的原因。另外一个原因是 wordpress 虽然拥有各种各样眼花缭乱的插件，但是其维护麻烦，不光 wordpress 本身需要版本更新，插件也需要更新，并且更新起来很艰难，常常自动更新失败从而转为手工更新。并且wordpress 很多主题插件是收费的。

使用 hugo 搭建个人博客网站，其实理论上来说 hugo 不止可以搭建博客，还可以搭建任何静态网站（甚至是动态网站，不过这也就失去了 hugo 本身的意义了）。而且还有一个更主要的原因：可以学习 git 和 Github。

hugo 搭建好之后需要进行部署。通常的做法是托管到 Github Pages，也可以部署在腾讯云的静态网页托管（阿里云也有相同的业务），活或者 Gitee Pages，或者自建服务器等等。所以本文从一开始 hugo 与 git 的安装到最后 CDN 网页加速全过程进行总结。

### 安装 Hugo 并新建站点

Mac OS 下安装 Hugo 非常方便

```shell
$ brew install hugo
```

查看版本是否安装正确

```shell
$ hugo version
hugo v0.86.1+extended darwin/amd64 BuildDate=unknown
```

Hugo 安装好之后，就可以创建站点了

```shell
$ hugo new site myfirsthugo
Congratulations! Your new Hugo site is created in /Users/your_name_path/myfirsthugo.

Just a few more steps and you're ready to go:

1. Download a theme into the same-named folder.
   Choose a theme from https://themes.gohugo.io/ or
   create your own with the "hugo new theme <THEMENAME>" command.
2. Perhaps you want to add some content. You can add single files
   with "hugo new <SECTIONNAME>/<FILENAME>.<FORMAT>".
3. Start the built-in live server via "hugo server".

Visit https://gohugo.io/ for quickstart guide and full documentation.
```

进入站点目录，然后查看目录下包含的文件

```shell
$ cd myfirsthugo
$ ls -l
archetypes	content		layouts		themes
config.toml	data		static
```

这里可以看到 Hugo 自动生成了一堆文件，这些文件也就是 Hugo 站点的结构。

archetypes：站点要发表的文章的文章模板，在 Hugo官网上称为模板的 `Front Matter`；

content：发布的文章在这个目录下生成；

layouts：Hugo 站点的布局结构，即 html 布局都要在这个文件夹中编写；

themes：站点主题；

config.toml：站点配置；

data：存放站点的一些数据文件；

static：静态文件则保存在这个文件夹中。

### 安装 git 

git 的安装可以从官方网站上直接下载安装： Mac OS https://git-scm.com/download/mac 或者 Windows https://git-scm.com/download/win

Mac OS 也可以直接终端运行

```shell
$ brew install git
```

安装好之后查看 git 版本

```shell
$ git --version
git version 2.32.0 (Apple Git-132)
```

### 初始化 git 存储库，安装主题进行配置

Hugo 建站有两种 Github 托管方式，一种先是直接 git 初始化站点目录，在托管部署时直接将整个目录上传至 Github，这种方法可以很方便的在终端下载安装主题；第二种是先从 Github 上下载好主题并安装，然后运行 Hugo 终端命令 `hugo` 生成 public 文件夹，进入 public 并 git 初始化，然后将 public 托管部署到 Github 上。推荐使用第一种方法，以下文章也是采用第一种方法。

在 Hugo 站点目录下，进行 git 初始化

```shell
myfirsthugo $ git init
```

然后下载主题，可以从 git 命令 `clone` 一个主题，也可以从 Github 直接下载，将下载好的主题解压并放在 themes 文件夹中。

```shell
myfirsthugo $ git submodule add https://Github.com/budparr/gohugo-theme-ananke.git themes/ananke
```

下载好的 anake 主题直接放在了 themes 文件夹中，但是主题还并不能加载使用，需要在配置文件中进行主题配置。

```shell
myfirsthugo $ echo theme = \"ananke\" >> config.toml
```

或者直接打开 `config.toml` 在最后一行添加一句：

```toml
baseURL = "http://example.org/"
languageCode = "en-us"
title = "My New Hugo Site"
theme = "ananke"
```

然后可以新建一个 post 文章

```shell
myfirsthugo $ hugo new posts/my-first-post.md
/Users/your_name_path/myfirsthugo/content/posts/my-first-post.md created
```

这时可以看到在 content 文件夹中自动创建了一个 posts 文件夹，并且生成了 `my-first-post` 文章。

启动 Hugo server 

```shell
myfirsthugo $ hugo server -D
Start building sites … 
hugo v0.86.1+extended darwin/amd64 BuildDate=unknown

                   | EN  
-------------------+-----
  Pages            | 10  
  Paginator pages  |  0  
  Non-page files   |  0  
  Static files     |  1  
  Processed images |  0  
  Aliases          |  1  
  Sitemaps         |  1  
  Cleaned          |  0  

Built in 72 ms
Watching for changes in /Users/your_name_path/myfirsthugo/{archetypes,content,data,layouts,static,themes}
Watching for config changes in /Users/your_name_path/myfirsthugo/config.toml, /Users/your_name_path/myfirsthugo/themes/ananke/config.yaml
Environment: "development"
Serving pages from memory
Running in Fast Render Mode. For full rebuilds on change: hugo server --disableFastRender
Web Server is available at http://localhost:1313/ (bind address 127.0.0.1)
```

此时在浏览器上打开 `http://localhost:1313/` 就可以直接访问了。

<img src="/images/jzrj/jzrj-20220129-1.png" alt="jzrj-2022129-1" style="zoom:50%;" />

### 生成站点并发布

以上步骤只是表示网站可以正常运行了，并不意味着这就是 Hugo 要发布的站点。还要通过 hugo 命令发布站点。

```shell
myfirsthugo $ hugo -D
Start building sites … 
hugo v0.86.1+extended darwin/amd64 BuildDate=unknown

                   | EN  
-------------------+-----
  Pages            | 10  
  Paginator pages  |  0  
  Non-page files   |  0  
  Static files     |  1  
  Processed images |  0  
  Aliases          |  1  
  Sitemaps         |  1  
  Cleaned          |  0  

Total in 102 ms
```

注意：这里 `-D` 表示以草稿（draft）形式发布站点，所有的草稿文章都会显示。

这时就会在站点目录下生成一个 public 文件夹

```shell
myfirsthugo $ ls
archetypes	content		layouts		resources	themes
config.toml	data		public		static
```

所有要发布的内容都保存在 public 文件夹中，也就是说，站点呈现的所有内容都已经保存在 public 中了，此时可以将 public 托管到 Github。

> 注意：Github Pages 可以使用 Github Action 自动部署并发布，这意味着并不需要运行 `hugo` 命令生成 public，我们可以将生成 public 的过程直接部署在 Github 自动发布上。所以可以直接删除掉 public 文件夹，并且在日常浏览中直接使用 `hugo server -D` 命令就可以了。



### 托管到 Github

浏览器打开网址可以访问，说明网站已经可以正常运行了，但是还需要托管到 Github 上才能进行随时访问。

Github Pages 是 Github 官方的博客发布系统，其项目名称需要遵循 `username.github.io` 形式。在 Github 上新建一个存储库，任何选项都不要勾选，注意：repository name 要和 Owner 名称相同。如下所示

<img src="/images/jzrj/jzrj-20220129-2.png" alt="jzrj-20220129-2" style="zoom:50%;" />

点击 `create repository` 创建存储库，会看到这样的界面

<img src="/images/jzrj/jzrj-20220129-3.png" alt="jzrj-20220129-2" style="zoom:50%;" />

因为之前已经初始化过站点 git 库了，所以只要将远程库的地址加进来就可以了，此时的 Github 库是一个空库。上图中已经告诉了基本步骤，先在本地站点目录创建一个 README.md 文件

```shell
$ echo "# accoppo.github.io" >> README.md
```

然后创建 `master` 分支并提交

```shell
$ git add .
$ git commit -m "first commit"
$ git branch -M master
$ git remote add origin git@github.com:accoppo/accoppo.github.io.git
```

然后 `push` 上去

```shell
$ git push -u origin master
```

`-u` 表示库为空，需要整体提交，之后就可以使用 `git push` 直接 `push` 了。

注意：在进行提交推送之前，需要先在 Github 账户设置中新增 SSH 秘钥。

然后回到 Github 库中，就可以看到所有内容推送上来了。对于 `xxx.github.io` 这样的项目库名称，Github 直接认定是采用 GIthub Pages 发布的，所以在浏览器直接输入 `accoppo.github.io` 也是可以显示内容的，只不过显示的 README.md 中的内容。

### Github Action 自动部署并发布

Action 是 Github 提供的仓库中自动化、自定义和执行软件开发工作流程。

官方网站 https://docs.github.com/cn/actions 

 Hugo + Github Action 可以参考 https://gohugo.io/hosting-and-deployment/hosting-on-github/#build-hugo-with-github-action

官方提供了一个 yml 文件，文件存在`.github/workflows/gh-pages.yml` 里，在项目库中选择 Action 并点击 `new workflow` 

<img src="/images/jzrj/jzrj-20220129-4.png" alt="jzrj-20220129-2" style="zoom:50%;" />

然后点击 `set up a workflow yourself` 

<img src="/images/jzrj/jzrj-20220129-5.png" alt="jzrj-20220129-2" style="zoom:50%;" />

然后进入到工作流文件设置中，将 `main.yml` 更改为 `gh-pages.yml` ，然后将下面代码复制到 `Edit new file` 中

```yml
name: github pages

on:
  push:
    branches:
      - master  # Set a branch to deploy

jobs:
  deploy:
    runs-on: ubuntu-18.04
    steps:
      - uses: actions/checkout@v2
        with:
          submodules: true  # Fetch Hugo themes (true OR recursive)
          fetch-depth: 0    # Fetch all history for .GitInfo and .Lastmod

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'
          # extended: true

      - name: Build
        run: hugo --minify

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

如下所示

<img src="/images/jzrj/jzrj-20220129-6.png" alt="jzrj-20220129-2" style="zoom:50%;" />

然后 `Start commit` `Commit new file` ，

<img src="/images/jzrj/jzrj-20220129-7.png" alt="jzrj-20220129-2" style="zoom:50%;" />

回到 Action 会触发一次构建发布任务，等待几分钟左侧圆圈变成✅

<img src="/images/jzrj/jzrj-20220129-8.png" alt="jzrj-20220129-2" style="zoom:50%;" />

以上任务完成以后，回到 `Code` ，并没有看到 public 目录，但是会发现多了一条分支，新增加的这条分支就是 Github Pages 要发布的内容

<img src="/images/jzrj/jzrj-20220129-9.png" alt="jzrj-20220129-2" style="zoom:50%;" />

然后回到 Setting 的 Pages 选项里将发布源改成 `gh-pages.yml` 

<img src="/images/jzrj/jzrj-20220129-10.png" alt="jzrj-20220129-2" style="zoom:50%;" />

等待几分钟就可以在浏览器中查看了。

在发布的站点网页中，并没有看到发布的文章，这是因为在文章的 `Front Matter` 设置中将 Draft 设置成了 true，这表示文章现在是草稿形式，并没有发布。

而且因为远程库中的内容已经发生变化，所以先从远程将项目库 `pull` 下来

```shell
myfirsthugo $ git pull
```

然后查看所有分支会发现多出来一条分支 `gh-pages` 

```shell
$ git branch -a
* master
  remotes/origin/gh-pages
  remotes/origin/master
```

修改发布文章的  `Front Matter` 的 Draft 选项，并且在 `config.toml` 中将 `baseURL` 修改成 `xxx.github.io` ,再 `push ` 到 Github

```toml
baseURL = "http://xxx.github.io"
languageCode = "en-us"
title = "My New Hugo Site"
theme = "ananke"
```

最后就可以正常访问了。

### 域名设置

Github Pages 支持设置自定义域名，如下图所示 `custom domain ` 可以设置自定义域名

<img src="/images/jzrj/jzrj-20220129-10.png" alt="jzrj-20220129-2" style="zoom:50%;" />

首先在任意的域名注册商那里注册一个域名，腾讯云域名注册链接 https://buy.cloud.tencent.com/domain，或者进入网站 https://www.dnspod.cn 进行域名注册，然后进行备案。

等待备案好之后进入 `DNSPod` 云解析控制台 https://www.dnspod.cn，可以看到域名已经添加到我的域名中，然后要做的是对域名添加解析，点击域名，进入我的域名管理，点击快速添加解析

<img src="/images/jzrj/jzrj-20220129-11.png" alt="jzrj-20220129-2" style="zoom:50%;" />

然后将 `xxx.github.io` 添加到域名映射CNAME 中，点击确认，就会自动生成四条记录。

回到 GIthub 站点项目库的 `setting pages` ，将新的域名填入自定义域名框中

<img src="/images/jzrj/jzrj-20220129-12.png" alt="jzrj-20220129-2" style="zoom:50%;" />

等待几分钟，就可以使用自定义域名访问站点了。

##### 域名自动更新问题

每次将站点 `push` 到 Github 并进行 Action 自动发布时，自定义域名总是会丢失，导致每 `push` 一次，就要手动设置一次域名，很是麻烦。后来查阅资料才知道，Github Action 将项目库主分支进行自动部署时，总是重新部署，这使得我们设置好的域名总会刷新掉。解决办法是在本地站点目录的 `static` 目录下创建一个 CNAME 文件（注意：没有后缀），写入自定义域名

<img src="/images/jzrj/jzrj-20220129-13.png" alt="jzrj-20220129-2" style="zoom:50%;" />

这样，在每次 Action 自动发布时，`static` 目录下的文件会部署到发布目录（即 public目录下）的根目录下，每次进行 `push ` 就不会丢失自定义域名了。

### CDN 静态网页加速

由于 Github 服务器位于国外，所以访问加载时间是非常长的，这反而失去了静态网页的特点。所以我们可以通过 CDN 内容分发网络对我们的网站进行加速，实现快速访问。

不管是腾讯云还是阿里云或者其他 CDN 服务商，都是一样的流程。我们进入腾讯云 CDN 内容分发网络控制台，进入域名管理，然后添加域名进行域名配置

<img src="/images/jzrj/jzrj-20220129-14.png" alt="jzrj-20220129-2" style="zoom:50%;" />

然后进行源站配置，注意：源站配置的回源协议再没有设置 SSL 时选择 HTTP，腾讯云有一年的免费 SSL ，等配置完 SSL 修改源站协议即可。

<img src="/images/jzrj/jzrj-20220129-15.png" alt="jzrj-20220129-2" style="zoom:50%;" />

提交等待几分钟后，需要将生成的加速域名 CNAME 覆盖到 DNSPod 记录管理的 @ 主机记录，这个步骤一般腾讯云会自动替换。

<img src="/images/jzrj/jzrj-20220129-16.png" alt="jzrj-20220129-2" style="zoom:50%;" />

等待 CDN 部署几分钟后，就可以流畅的浏览自己的博客了。

<img src="/images/jzrj/jzrj-20220129-17.png" alt="jzrj-20220129-2" style="zoom:50%;" />

##### 注意

CDN 静态网页加速以后，虽然网页浏览速度加快，但是更新缓存资源是延后的，这样造成的后果是发表一篇文章，却不能即时在客户端浏览器看到。幸运的是，在腾讯云的 CDN控制台是有刷新预热功能的，也就是说当网站的源站有资源更新、需要清理违规资源、域名有配置变更的，为避免全网用户受节点缓存影响仍访问到旧的资源、受旧配置的影响，可提交刷新任务，保证全网用户可访问到最新资源或正常访问。

这里有三种刷新预热方法

<img src="/images/jzrj/jzrj-20220129-18.png" alt="jzrj-20220129-2" style="zoom:50%;" />

> URL 刷新：表示某一个网页例如主页有信息变化时，通常使用 URL 刷新 
>
> 目录刷新：网站目录下的信息刷新，例如列表、Hugo 的 Posts 目录等
>
> URL 预热：当有安装包或者升级包发布时，常采用 URL 预热

虽然刷新暂时解决了网页最新的浏览，但是每次手动刷新依然很麻烦。

很幸运，腾讯云的 CDN 控制台的插件中心中有一项功能是定时刷新预热

<img src="/images/jzrj/jzrj-20220129-19.png" alt="jzrj-20220129-2" style="zoom:50%;" />

我们可以设置一定的时间或者时间间隔进行自动刷新，避免了每次手动刷新的麻烦。

### 总结与其他

1. 添加网页后台统计分析，当前的流形的统计平台包括百度统计、友盟+、腾讯统计等等，都是很不错的。
2. 通过学习 Hugo 的结构，我们不难发现 Hugo 是比较简单的，通过布局嵌套，Hugo 最后部署会将所有的嵌套结构合并成一个网站，这从理论上来说 Hugo 可以搭建任何的网站或者是系统。
3. 有时间有机会了可以自己写一个主题。

### 参考

1. https://zhuanlan.zhihu.com/p/350977057
2. https://gohugo.io/documentation/
3. https://docs.github.com/cn
4. https://docs.github.com/cn/pages

















