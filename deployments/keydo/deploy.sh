#!/bin/bash

# KeyDo 项目一键部署脚本

set -e

echo "🚀 KeyDo 项目 Docker 部署脚本"
echo "================================"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker 未安装"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ 错误: Docker Compose 未安装"
    echo "请先安装 Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# 显示菜单
echo ""
echo "请选择操作："
echo "1) 首次部署（构建并启动所有容器）"
echo "2) 启动服务"
echo "3) 停止服务"
echo "4) 重启服务"
echo "5) 查看日志"
echo "6) 查看容器状态"
echo "7) 重新构建并部署"
echo "8) 停止并清理所有数据（⚠️ 危险操作）"
echo "9) 退出"
echo ""

read -p "请输入选项 [1-9]: " choice

case $choice in
    1)
        echo "📦 开始首次部署..."
        echo "⏳ 正在构建镜像（这可能需要几分钟）..."
        docker-compose build
        echo "🚀 启动容器..."
        docker-compose up -d
        echo ""
        echo "✅ 部署完成！"
        echo ""
        echo "访问地址："
        echo "  前端: http://localhost:3000"
        echo "  后端: http://localhost:6040/api/v1"
        echo ""
        echo "查看日志: docker-compose logs -f"
        echo "查看状态: docker-compose ps"
        ;;
    2)
        echo "🚀 启动服务..."
        docker-compose up -d
        echo "✅ 服务已启动"
        docker-compose ps
        ;;
    3)
        echo "⏸️  停止服务..."
        docker-compose down
        echo "✅ 服务已停止"
        ;;
    4)
        echo "🔄 重启服务..."
        docker-compose restart
        echo "✅ 服务已重启"
        docker-compose ps
        ;;
    5)
        echo "📋 查看日志（Ctrl+C 退出）..."
        docker-compose logs -f --tail=100
        ;;
    6)
        echo "📊 容器状态："
        docker-compose ps
        echo ""
        echo "📈 资源使用："
        docker stats --no-stream keydo-frontend keydo-backend keydo-postgres 2>/dev/null || echo "部分容器未运行"
        ;;
    7)
        echo "🔄 重新构建并部署..."
        read -p "⚠️  这将停止现有容器并重新构建，确认吗？(y/n): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            echo "⏸️  停止容器..."
            docker-compose down
            echo "🏗️  重新构建镜像..."
            docker-compose build --no-cache
            echo "🚀 启动容器..."
            docker-compose up -d
            echo "✅ 重新部署完成！"
        else
            echo "❌ 操作已取消"
        fi
        ;;
    8)
        echo "⚠️⚠️⚠️  危险操作 ⚠️⚠️⚠️"
        echo "这将删除所有容器和数据卷（包括数据库数据）"
        read -p "确认删除所有数据吗？输入 'DELETE' 确认: " confirm
        if [ "$confirm" = "DELETE" ]; then
            echo "🗑️  清理中..."
            docker-compose down -v
            echo "✅ 清理完成"
        else
            echo "❌ 操作已取消"
        fi
        ;;
    9)
        echo "👋 退出"
        exit 0
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

echo ""
echo "完成！"
