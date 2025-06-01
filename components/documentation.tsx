import { Card, CardContent } from "@/components/ui/card"

export default function Documentation() {
  return (
    <section className="mb-16">
      <h2 className="mb-8 text-3xl font-bold text-center">部署指南</h2>
      <div className="grid gap-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">环境要求</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Node.js {">="} 18</li>
              <li>Bun {">="} 1.0.0</li>
              <li>Docker (可选)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">本地开发部署</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. 克隆项目</h4>
                <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto max-w-full">
                  <code className="whitespace-pre-wrap break-all">
                    {"git clone git@github.com:yassine-zhang/short-video-extractor.git\ncd short-video-extractor"}
                  </code>
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">2. 安装依赖</h4>
                <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto max-w-full">
                  <code>bun install</code>
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">3. 配置环境变量</h4>
                <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto max-w-full">
                  <code className="whitespace-pre-wrap break-all">
                    {"# 编辑环境变量\nvim .env.development\nvim .env.production"}
                  </code>
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">4. 运行开发服务器</h4>
                <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto max-w-full">
                  <code>bun run dev</code>
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">5. 运行生产服务器</h4>
                <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto max-w-full">
                  <code>bun run start</code>
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Docker 部署</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. 构建 Docker 镜像</h4>
                <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto max-w-full">
                  <code>docker build -t video-parser .</code>
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">2. 运行容器</h4>
                <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto max-w-full">
                  <code className="whitespace-pre-wrap break-all">
                    {"docker run -d \\\n  -p 10010:7777 \\\n  --name video-parser \\\n  video-parser"}
                  </code>
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">3. 查看容器日志</h4>
                <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto max-w-full">
                  <code>docker logs -f video-parser</code>
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
