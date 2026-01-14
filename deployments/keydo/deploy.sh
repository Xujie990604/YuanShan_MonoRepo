#!/bin/bash

# KeyDo 项目部署脚本 - 只封装多步骤操作

set -e

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "🚀 KeyDo 部署工具"
echo ""
echo "选择操作："
echo "  1) 首次部署（构建 + 启动）"
echo "  2) 更新部署（拉取代码 + 重新构建 + 启动）"
echo "  3) 完全清理（停止 + 删除数据）"
echo ""
echo "常用命令（直接使用）："
echo "  docker-compose ps              # 查看状态"
echo "  docker-compose logs -f         # 查看日志"
echo "  docker-compose up -d           # 启动"
echo "  docker-compose down            # 停止"
echo "  docker-compose restart         # 重启"
echo ""

read -p "选择 [1-3] 或按 Ctrl+C 退出: " choice

case $choice in
    1)
        echo ""
        echo "📦 首次部署"
        echo "---"
        echo "⏳ 构建镜像（需要 5-10 分钟）..."
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
        ;;
        
    2)
        echo ""
        echo "🔄 更新部署"
        read -p "是否先拉取最新代码？(y/n): " pull
        
        if [ "$pull" = "y" ] || [ "$pull" = "Y" ]; then
            echo "⬇️  拉取代码..."
            cd ../../
            git pull
            cd deployments/keydo
        fi
        
        echo "⏸️  停止容器..."
        docker-compose down
        
        echo "🏗️  重新构建..."
        docker-compose build --no-cache
        
        echo "🚀 启动容器..."
        docker-compose up -d
        
        echo ""
        echo "✅ 更新完成！"
        echo "查看日志: docker-compose logs -f"
        ;;
        
    3)
        echo ""
        echo "⚠️⚠️⚠️  危险操作  ⚠️⚠️⚠️"
        echo "这将删除所有容器和数据（包括数据库）"
        echo ""
        read -p "输入 'DELETE' 确认: " confirm
        
        if [ "$confirm" = "DELETE" ]; then
            echo "🗑️  清理中..."
            docker-compose down -v
            docker system prune -f
            echo "✅ 清理完成"
        else
            echo "❌ 已取消"
        fi
        ;;
        
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac
