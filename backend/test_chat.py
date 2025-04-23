# test_chat.py
import asyncio
from agent import Customer_Service_Agent

async def test_conversation():
    print("\n🧪 [TEST] Starting test conversation with Customer_Service_Agent...")

    # 模拟用户输入
    user_input = "帮我创建一个ledger，名字叫‘旅游账本’，预算是2000，加我为拥有者"

    # 生成消息结构（简单对话）
    messages = [{"role": "user", "content": user_input}]

    # 获取 Agent 响应（thread 可选）
    response = await Customer_Service_Agent.get_response(messages=messages)

    print("\n🧾 [RESPONSE FROM AGENT]:\n", response)

if __name__ == "__main__":
    asyncio.run(test_conversation())