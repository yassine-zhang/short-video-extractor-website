export function Footer() {
  return (
    <footer className="mt-16 py-6 border-t border-gray-200">
      <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
        <p className="mb-2">本项目采用 Apache License 2.0 许可证。Copyright © 2025 济宁若森软件开发中心（个人独资）</p>
        {/* 如果想在底部显示状态指示器，取消下面这行的注释，并在page.tsx中移除顶部的状态指示器 */}
        {/* <div className="flex justify-center mt-2"><StatusIndicator /></div> */}
      </div>
    </footer>
  )
}
