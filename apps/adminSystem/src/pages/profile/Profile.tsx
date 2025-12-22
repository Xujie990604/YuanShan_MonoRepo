import { Avatar, Card, Descriptions, Image, Skeleton, Space, Tag, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/auth'
import { getUserByIdRequest } from '../../request/users'
import { normalizePhotoUrl } from '../../utils/url'

/**
 * 个人中心页面
 */
function ProfilePage() {
  const userId = useAuthStore(state => state.userId)

  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    enabled: !!userId, // 没有 userId 时不发请求
    queryFn: () => getUserByIdRequest(userId as number, { loading: true, toast: true }),
  })

  const genderText =
    data?.profile?.gender === 1 ? '男' : data?.profile?.gender === 0 ? '女' : '未知'
  const photoPreviewUrl = normalizePhotoUrl(data?.profile?.photo)

  return (
    // 外层容器占满右侧内容区高度，Card 用 flex:1 填满
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Card
        title="个人中心"
        style={{ flex: 1 }}
        styles={{ body: { height: '100%' } }}
      >
        {isLoading ? (
          <Skeleton active avatar paragraph={{ rows: 6 }} />
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* 顶部信息区域：头像 + 用户名 + 角色标签 */}
            <Space size="large" align="start" style={{ width: '100%' }}>
              {photoPreviewUrl ? (
                <Image
                  width={96}
                  height={96}
                  src={photoPreviewUrl}
                  style={{ borderRadius: 12, objectFit: 'cover' }}
                  preview={false}
                />
              ) : (
                <Avatar size={96}>{data?.username?.slice?.(0, 1)?.toUpperCase?.() ?? 'U'}</Avatar>
              )}

              <Space direction="vertical" size={6} style={{ flex: 1 }}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {data?.username ?? '-'}
                </Typography.Title>
                <Space wrap size={[8, 8]}>
                  <Typography.Text type="secondary">ID：{data?.id ?? '-'}</Typography.Text>
                  <Tag>{genderText}</Tag>
                </Space>
                <Space wrap size={[8, 8]}>
                  {(data?.roles ?? []).length
                    ? data!.roles.map(r => <Tag key={r.id}>{r.name}</Tag>)
                    : <Tag color="default">无角色</Tag>}
                </Space>
              </Space>
            </Space>

            {/* 详情区域：使用轻量 Descriptions（不带边框，更像信息卡） */}
            <Descriptions
              column={2}
              size="small"
              bordered={false}
              labelStyle={{ width: 90, color: 'rgba(0,0,0,0.65)' }}
              contentStyle={{ color: 'rgba(0,0,0,0.88)' }}
            >
              <Descriptions.Item label="用户名">{data?.username ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="性别">{genderText}</Descriptions.Item>
              <Descriptions.Item label="地址">{data?.profile?.address ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="头像链接">
                {photoPreviewUrl ? (
                  <Typography.Link href={photoPreviewUrl} target="_blank">
                    打开头像
                  </Typography.Link>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
            </Descriptions>
          </Space>
        )}
      </Card>
    </div>
  )
}

export default ProfilePage


